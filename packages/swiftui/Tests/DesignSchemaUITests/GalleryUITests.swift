//  GalleryUITests.swift
//
//  The XCUITest half of the swiftui gate (.github/workflows/swiftui-gates.yml, job 440): open one
//  component's gallery screen on an iPad simulator with a hardware keyboard, run
//  `XCUIApplication().performAccessibilityAudit()` on it, and check the keyboard rules the doc declared.
//
//  How a finding gets home. The test runner is a process on a simulator; the thing that has to read its
//  findings is `tools/swift-gate-report.mjs` on the host, which sees only the xcodebuild log. Test
//  failures are the one channel that is always in that log, so every finding is an `XCTFail` whose message
//  begins with a marker the report script splits on:
//
//      DS-AUDIT: …      an accessibility-audit issue   → the report's `audit.issues`
//      DS-KEYBOARD: …   a keyboard rule that failed    → the report's `tests.failures`
//
//  Anything the test could not check (a rule whose starting focus it could not establish) is printed as
//  `DS-KEYBOARD-SKIP:` and is not a failure: a gate that cannot check a rule must not claim it passed.
//
//  Guarded to iOS: on the macOS host build (`swift build --build-tests`, `swift test`) this target is an
//  empty module, which is what keeps the package typechecking everywhere while the tests run only where
//  there is a simulator to run them on.

#if os(iOS)
import XCTest

// MARK: - what the workflow asks for

/// The gate's inputs, as the workflow passes them.
///
/// Xcode forwards environment variables prefixed `TEST_RUNNER_` to the test-runner process with the prefix
/// stripped; that is the only channel a UI test has to the job that started it, so the workflow sets
/// `TEST_RUNNER_DS_TARGET` and friends.
enum Gate {
    /// The component being gated, or `all` for the push/PR run, which walks every gallery entry.
    static var target: String {
        (ProcessInfo.processInfo.environment["DS_TARGET"] ?? "all")
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static var isAll: Bool { target.isEmpty || target == "all" }

    /// `generated/keyboard/<Name>.json`, verbatim.
    ///
    /// Empty when the component has no `keyboard` block — Button is one such component, so "this component
    /// declares no keyboard rules" has to be a pass and not a missing-file failure.
    static var keyboardSpecJSON: String {
        ProcessInfo.processInfo.environment["DS_KEYBOARD_SPEC"] ?? ""
    }

    /// What the audit looks for. Everything except `.textClipped`, which fires on the gallery's own
    /// scrolling layout (a long label in a narrow screen) rather than on the component under test; the
    /// workflow can widen or narrow this with `DS_AUDIT_TYPES` without a code change.
    static var auditTypes: XCUIAccessibilityAuditType {
        let named: [String: XCUIAccessibilityAuditType] = [
            "all": .all,
            "contrast": .contrast,
            "elementDetection": .elementDetection,
            "hitRegion": .hitRegion,
            "sufficientElementDescription": .sufficientElementDescription,
            "dynamicType": .dynamicType,
            "textClipped": .textClipped,
            "trait": .trait,
        ]
        let raw = (ProcessInfo.processInfo.environment["DS_AUDIT_TYPES"] ?? "")
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
        guard !raw.isEmpty else { return XCUIAccessibilityAuditType.all.subtracting(.textClipped) }
        return raw.reduce(into: XCUIAccessibilityAuditType()) { types, name in
            if let one = named[name] { types.insert(one) }
        }
    }

    /// A line for the xcodebuild log. Not a failure — the report script reads these for context.
    static func say(_ line: String) {
        print(line)
    }
}

// MARK: - the gallery, driven

/// The gallery app and the one navigation it knows: root list → a component's screen.
///
/// The identifiers are `apps/ios-gallery`'s (`Gallery.entry.<Name>`, `Gallery.screen.<Name>`), declared
/// there precisely so this test never has to guess at a label.
@MainActor
struct GalleryApp {
    let app: XCUIApplication

    static let entryPrefix = "Gallery.entry."
    static let screenPrefix = "Gallery.screen."
    static let timeout: TimeInterval = 30

    static func launch() -> GalleryApp {
        let app = XCUIApplication()
        // The gallery has no launch options; the arguments only pin the locale so a label the audit reads
        // is the one the docs describe.
        app.launchArguments += ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        return GalleryApp(app: app)
    }

    /// Any descendant with this identifier, whatever SwiftUI chose to render it as: a `NavigationLink` in a
    /// `List` is a button on one OS version and a cell on the next, and the gate should not care.
    func element(_ identifier: String) -> XCUIElement {
        app.descendants(matching: .any).matching(identifier: identifier).firstMatch
    }

    /// The names in the root list, in list order, scrolling until the list stops offering new ones —
    /// `List` is lazy, so what exists is what has been on screen.
    func entryNames() -> [String] {
        var seen: [String] = []
        var stalled = 0
        while stalled < 2 {
            let before = seen.count
            let query = app.descendants(matching: .any)
                .matching(NSPredicate(format: "identifier BEGINSWITH %@", Self.entryPrefix))
            for element in query.allElementsBoundByIndex {
                let name = String(element.identifier.dropFirst(Self.entryPrefix.count))
                if !name.isEmpty, !seen.contains(name) { seen.append(name) }
            }
            stalled = seen.count == before ? stalled + 1 : 0
            app.swipeUp()
        }
        return seen
    }

    /// Open `name`'s screen and return its root element. `nil` when the gallery has no such entry — the
    /// caller decides whether that is a failure (a generated component that never registered a screen) or
    /// simply nothing to do.
    func open(_ name: String) -> XCUIElement? {
        let entry = element(Self.entryPrefix + name)
        guard entry.waitForExistence(timeout: Self.timeout) else { return nil }
        entry.tap()
        let screen = element(Self.screenPrefix + name)
        guard screen.waitForExistence(timeout: Self.timeout) else { return nil }
        return screen
    }

    /// Back to the root list, so the next screen starts from the same place.
    func back() {
        let backButton = app.navigationBars.buttons.element(boundBy: 0)
        if backButton.exists, backButton.isHittable { backButton.tap() }
    }

    /// The component's own root, by the testability hook every generated component carries
    /// (process/ios-platform.md: `.accessibilityIdentifier("<Name>")` on the root).
    func componentRoot(_ name: String) -> XCUIElement {
        element(name)
    }
}

// MARK: - the audit

final class GalleryAuditTests: XCTestCase {
    override func setUp() {
        continueAfterFailure = true // every issue of a round, not the first one
    }

    /// `performAccessibilityAudit()` on the screens the gate was asked about.
    ///
    /// The issue handler returns `true` — "ignore" — for every issue, so XCTest does not raise its own
    /// failure and this test can raise one `DS-AUDIT:` failure per issue instead, in the shape the report
    /// script turns into `audit.issues`.
    @MainActor
    func testAccessibilityAudit() throws {
        let gallery = GalleryApp.launch()

        // The root list is audited whatever the target is: it is the one screen that exists before any
        // component does, and it is what "green on the skeleton" means.
        try audit(gallery, screen: "the gallery list")

        let names = Gate.isAll ? gallery.entryNames() : [Gate.target]
        Gate.say("DS-AUDIT-SCOPE: \(names.isEmpty ? "(no gallery entries)" : names.joined(separator: ", "))")
        for name in names {
            guard gallery.open(name) != nil else {
                if Gate.isAll {
                    XCTFail("DS-AUDIT: \(name): the gallery lists this entry but its screen never appeared")
                } else {
                    // A dispatch for a component whose Gallery+<Name>.swift is not there yet: the build
                    // gate has already said so in words the model can act on, and inventing a second
                    // failure here would only make the round noisier.
                    Gate.say("DS-AUDIT-SKIP: \(name): no gallery entry — nothing to audit")
                }
                continue
            }
            try audit(gallery, screen: name)
            gallery.back()
        }
    }

    @MainActor
    private func audit(_ gallery: GalleryApp, screen: String) throws {
        var issues: [String] = []
        try gallery.app.performAccessibilityAudit(for: Gate.auditTypes) { issue in
            let element = issue.element?.identifier ?? ""
            let ofElement = element.isEmpty ? "" : " [\(element)]"
            issues.append("\(screen): \(Self.label(issue.auditType)): \(issue.compactDescription)\(ofElement)")
            return true
        }
        for issue in issues { XCTFail("DS-AUDIT: \(issue)") }
    }

    /// `XCUIAccessibilityAuditType` is an option set with no description of its own, and the audit's own
    /// prose does not always name the check that produced it.
    private static func label(_ type: XCUIAccessibilityAuditType) -> String {
        let names: [(XCUIAccessibilityAuditType, String)] = [
            (.contrast, "contrast"),
            (.elementDetection, "element-detection"),
            (.hitRegion, "hit-region"),
            (.sufficientElementDescription, "element-description"),
            (.dynamicType, "dynamic-type"),
            (.textClipped, "text-clipped"),
            (.trait, "trait"),
        ]
        let matched = names.filter { type.contains($0.0) }.map(\.1)
        return matched.isEmpty ? "audit" : matched.joined(separator: "+")
    }
}
#endif
