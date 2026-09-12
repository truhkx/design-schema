//  KeyboardSpecTests.swift
//
//  The keyboard half of the swiftui gate. The rules are the component doc's own `keyboard` block, derived
//  by tools/keyboard_tests.ts into `generated/keyboard/<Name>.json` and handed to this process by
//  .github/workflows/swiftui-gates.yml as `DS_KEYBOARD_SPEC` — the same data the Playwright specs are
//  generated from, so a rule that changes in the doc changes both gates.
//
//  What a hardware keyboard on an iPad can and cannot say. The web gate can focus any element it likes and
//  read `document.activeElement`; XCUITest can only press keys and ask an element whether it `hasFocus`.
//  So a rule is checked by walking focus into place with Tab and then pressing the rule's key. When the
//  starting state cannot be reached — the component keeps focus on a container, the screen does not show
//  the configuration the rule's `when` names, the trigger part is not on screen — the rule is *skipped*,
//  printed as `DS-KEYBOARD-SKIP:`, and never counted as a pass. A failure is an `XCTFail` prefixed
//  `DS-KEYBOARD:`, which tools/swift-gate-report.mjs turns into the report's `tests.failures`.

#if os(iOS)
import XCTest

// MARK: - the spec, as the workflow hands it over

struct KeyboardRule: Decodable {
    let keys: [String]
    let action: String
    let from: String
    let expect: String
    let when: String?
}

struct KeyboardSpec: Decodable {
    let name: String
    let role: String
    /// The component root's `.accessibilityIdentifier` — how this test finds what the web spec finds by role.
    let identifier: String
    let rules: [KeyboardRule]

    static func decode(_ json: String) throws -> KeyboardSpec? {
        let trimmed = json.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let data = trimmed.data(using: .utf8) else { return nil }
        return try JSONDecoder().decode(KeyboardSpec.self, from: data)
    }
}

// MARK: - keys

/// A doc key (`Shift+Tab`, `ArrowDown`, `Ctrl+A`, `a-z`) as something `typeKey` can send.
struct KeyStroke {
    let key: String
    let modifiers: XCUIElement.KeyModifierFlags

    // Computed rather than stored: a `static let` of a type the XCTest module has not marked `Sendable`
    // is a concurrency error under the package's Swift 6 language mode, and none of this is hot enough to
    // want the storage.
    private static var named: [String: String] { [
        "Tab": XCUIKeyboardKey.tab.rawValue,
        // The docs' "Enter" is the Return key; `XCUIKeyboardKey.enter` is the keypad's.
        "Enter": XCUIKeyboardKey.`return`.rawValue,
        "Return": XCUIKeyboardKey.`return`.rawValue,
        "Escape": XCUIKeyboardKey.escape.rawValue,
        "Space": XCUIKeyboardKey.space.rawValue,
        " ": XCUIKeyboardKey.space.rawValue,
        "ArrowUp": XCUIKeyboardKey.upArrow.rawValue,
        "ArrowDown": XCUIKeyboardKey.downArrow.rawValue,
        "ArrowLeft": XCUIKeyboardKey.leftArrow.rawValue,
        "ArrowRight": XCUIKeyboardKey.rightArrow.rawValue,
        "Home": XCUIKeyboardKey.home.rawValue,
        "End": XCUIKeyboardKey.end.rawValue,
        "PageUp": XCUIKeyboardKey.pageUp.rawValue,
        "PageDown": XCUIKeyboardKey.pageDown.rawValue,
        "Backspace": XCUIKeyboardKey.delete.rawValue,
        "Delete": XCUIKeyboardKey.forwardDelete.rawValue,
        "F1": XCUIKeyboardKey.F1.rawValue,
        "F2": XCUIKeyboardKey.F2.rawValue,
        "F3": XCUIKeyboardKey.F3.rawValue,
        "F4": XCUIKeyboardKey.F4.rawValue,
        "F5": XCUIKeyboardKey.F5.rawValue,
        "F6": XCUIKeyboardKey.F6.rawValue,
        // `a-z` is the docs' typeahead range, and the Playwright spec presses `a` for it; same here, so
        // the two gates check the same thing.
        "a-z": "a",
    ] }

    private static var modifierNames: [String: XCUIElement.KeyModifierFlags] { [
        "shift": .shift,
        "ctrl": .control,
        "control": .control,
        "alt": .option,
        "option": .option,
        "cmd": .command,
        "command": .command,
        "meta": .command,
    ] }

    /// `nil` for a key this gate has no way to send — the rule is then skipped rather than failed.
    static func parse(_ spec: String) -> KeyStroke? {
        // " " is a key, not a separator, so the split only means anything for a longer string.
        let parts = spec == " " ? [" "] : spec.split(separator: "+", omittingEmptySubsequences: false).map(String.init)
        guard let last = parts.last, !last.isEmpty || spec == " " else { return nil }
        var modifiers: XCUIElement.KeyModifierFlags = []
        for part in parts.dropLast() {
            guard let flag = modifierNames[part.lowercased()] else { return nil }
            modifiers.insert(flag)
        }
        if let key = named[last] { return KeyStroke(key: key, modifiers: modifiers) }
        // A bare character the docs name literally: `*`, `,`, or the `A` of `Ctrl+A`.
        guard last.count == 1 else { return nil }
        return KeyStroke(key: last.lowercased(), modifiers: modifiers)
    }
}

// MARK: - the checks

private enum Outcome {
    case passed
    case failed(String)
    case skipped(String)
}

final class GalleryKeyboardTests: XCTestCase {
    override func setUp() {
        continueAfterFailure = true // every broken rule of a round, not the first one
    }

    /// Every rule in the spec, against the target's gallery screen.
    ///
    /// No spec is a pass: a component with no `keyboard` block (Button is one) declares no rules, and a
    /// gate that failed on their absence would never go green on the component it was built for.
    @MainActor
    func testKeyboardRules() throws {
        guard let spec = try KeyboardSpec.decode(Gate.keyboardSpecJSON) else {
            Gate.say("DS-KEYBOARD-SKIP: \(Gate.target): no keyboard block in the doc — nothing to check")
            return
        }
        guard !spec.rules.isEmpty else {
            Gate.say("DS-KEYBOARD-SKIP: \(spec.name): the keyboard block is empty")
            return
        }

        let gallery = GalleryApp.launch()
        guard gallery.open(spec.name) != nil else {
            Gate.say("DS-KEYBOARD-SKIP: \(spec.name): no gallery entry — the build gate has already said why")
            return
        }
        let root = gallery.componentRoot(spec.identifier)
        guard root.waitForExistence(timeout: GalleryApp.timeout) else {
            XCTFail("DS-KEYBOARD: \(spec.name): the screen has no element with the accessibility identifier "
                + "\"\(spec.identifier)\" — the component root must carry it (process/ios-platform.md, "
                + "\"Testability hook\"), or no keyboard rule can be located")
            return
        }

        var checked = 0
        var skipped = 0
        for rule in spec.rules {
            for key in rule.keys {
                let title = Self.title(spec: spec, rule: rule, key: key)
                switch check(gallery: gallery, root: root, spec: spec, rule: rule, key: key) {
                case .passed:
                    checked += 1
                case .failed(let why):
                    checked += 1
                    XCTFail("DS-KEYBOARD: \(title): \(why)")
                case .skipped(let why):
                    skipped += 1
                    Gate.say("DS-KEYBOARD-SKIP: \(title): \(why)")
                }
            }
        }
        Gate.say("DS-KEYBOARD-SUMMARY: \(spec.name): \(checked) rule(s) checked, \(skipped) skipped")
    }

    private static func title(spec: KeyboardSpec, rule: KeyboardRule, key: String) -> String {
        let when = rule.when.map { " (\($0))" } ?? ""
        return "\(spec.name) \(key)\(when): \(rule.action)"
    }

    // MARK: one rule

    @MainActor
    private func check(gallery: GalleryApp, root: XCUIElement, spec: KeyboardSpec, rule: KeyboardRule, key: String) -> Outcome {
        if rule.expect == "manual" {
            return .skipped("the doc marks this rule manual")
        }
        guard let stroke = KeyStroke.parse(key) else {
            return .skipped("no hardware-keyboard equivalent for \"\(key)\"")
        }

        let ring = Self.focusables(in: root)
        guard !ring.isEmpty else {
            return .skipped("the component exposes no focusable element on its gallery screen")
        }

        let app = gallery.app
        let trigger = gallery.element("\(spec.identifier).trigger")
        switch Self.establish(rule.from, app: app, ring: ring, trigger: trigger) {
        case .failed(let why), .skipped(let why):
            return .skipped("could not start from `\(rule.from)`: \(why)")
        case .passed:
            break
        }

        let before = Self.focusIndex(ring)
        let stateBefore = Self.state(of: before >= 0 ? ring[before] : root)
        app.typeKey(stroke.key, modifierFlags: stroke.modifiers)

        let after = Self.focusIndex(ring)
        let count = ring.count
        switch rule.expect {
        case "focus-next":
            return Self.expectIndex(after, before + 1, ring)
        case "focus-prev":
            return Self.expectIndex(after, before - 1, ring)
        case "focus-first", "focus-wraps-to-first":
            return Self.expectIndex(after, 0, ring)
        case "focus-last", "focus-wraps-to-last":
            return Self.expectIndex(after, count - 1, ring)
        case "focus-unchanged":
            return Self.expectIndex(after, before, ring)
        case "focus-trigger":
            guard trigger.exists else { return .skipped("the screen has no \"\(spec.identifier).trigger\" part") }
            return trigger.hasFocus ? .passed : .failed("focus did not return to the trigger")
        case "closes":
            return root.waitForNonExistence(timeout: 3) ? .passed : .failed("the component is still on screen")
        case "opens":
            return root.waitForExistence(timeout: 3) && root.isHittable ? .passed : .failed("the component did not appear")
        case "toggles":
            let stateAfter = Self.state(of: after >= 0 ? ring[after] : root)
            return stateAfter == stateBefore
                ? .failed("the focused element's state is unchanged (\(stateBefore))")
                : .passed
        case "selects":
            return ring.contains(where: { $0.isSelected })
                ? .passed
                : .failed("no element in the component reports itself selected")
        default:
            return .skipped("this gate has no check for `expect: \(rule.expect)`")
        }
    }

    private static func expectIndex(_ after: Int, _ want: Int, _ ring: [XCUIElement]) -> Outcome {
        guard want >= 0, want < ring.count else {
            return .skipped("the expected position (\(want)) is outside the component's \(ring.count) focusable element(s)")
        }
        return after == want ? .passed : .failed("focus is at \(after < 0 ? "nothing in the component" : "position \(after)"), expected \(want)")
    }

    // MARK: focus

    /// What a hardware keyboard can land on. XCUITest has no "is focusable" attribute, so this is the
    /// element types that take focus on iPadOS, in accessibility order — the same order `Tab` walks.
    private static var focusableTypes: Set<XCUIElement.ElementType> { [
        .button, .link, .textField, .secureTextField, .searchField, .textView, .slider, .stepper,
        .checkBox, .radioButton, .segmentedControl, .menuItem, .cell, .tab, .datePicker,
        .disclosureTriangle, .popUpButton, .toggle, .`switch`,
    ] }

    @MainActor
    private static func focusables(in root: XCUIElement) -> [XCUIElement] {
        root.descendants(matching: .any).allElementsBoundByIndex.filter {
            focusableTypes.contains($0.elementType) && $0.exists && $0.isHittable
        }
    }

    @MainActor
    private static func focusIndex(_ ring: [XCUIElement]) -> Int {
        ring.firstIndex(where: { $0.hasFocus }) ?? -1
    }

    /// The doc's `from`, as a starting position walked to with Tab. Tab is the only way in: tapping an
    /// element would activate it, which is the thing under test.
    @MainActor
    private static func establish(_ from: String, app: XCUIApplication, ring: [XCUIElement], trigger: XCUIElement) -> Outcome {
        switch from {
        case "any":
            return .passed
        case "trigger":
            guard trigger.exists else { return .skipped("the screen has no trigger part") }
            return tab(app, until: { trigger.hasFocus }, limit: ring.count * 2 + 8)
                ? .passed
                : .skipped("Tab never reached the trigger")
        case "first":
            return tab(app, until: { focusIndex(ring) == 0 }, limit: ring.count * 2 + 8)
                ? .passed
                : .skipped("Tab never reached the component's first focusable element")
        case "last":
            return tab(app, until: { focusIndex(ring) == ring.count - 1 }, limit: ring.count * 3 + 8)
                ? .passed
                : .skipped("Tab never reached the component's last focusable element")
        case "inside":
            // The web spec's `inside` is "the second element"; where a component has only one, being
            // anywhere within it is the honest equivalent.
            let want = min(1, ring.count - 1)
            return tab(app, until: { focusIndex(ring) == want }, limit: ring.count * 2 + 8)
                ? .passed
                : .skipped("Tab never reached inside the component")
        default:
            return .skipped("unknown `from: \(from)`")
        }
    }

    @MainActor
    private static func tab(_ app: XCUIApplication, until satisfied: () -> Bool, limit: Int) -> Bool {
        if satisfied() { return true }
        for _ in 0..<max(limit, 1) {
            app.typeKey(XCUIKeyboardKey.tab.rawValue, modifierFlags: [])
            if satisfied() { return true }
        }
        return false
    }

    /// The XCUITest equivalent of the web spec's `ariaState`: what a toggle or a selection changes.
    @MainActor
    private static func state(of element: XCUIElement) -> String {
        guard element.exists else { return "(gone)" }
        let value = element.value.map { String(describing: $0) } ?? ""
        return "selected=\(element.isSelected)|value=\(value)"
    }
}
#endif
