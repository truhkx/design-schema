//  Testing.swift
//
//  The harness the generated behavior tests run against. `tools/behavior_tests.ts` turns every scenario in a
//  component doc's `behavior` block into a `@Test` in
//  `Tests/DesignSchemaTests/Generated/<Name>BehaviorTests.swift`, and everything those tests do — render the
//  component with the scenario's `given` props, act on it, read the result back — they do through this file.
//
//  Why it ships in the library rather than in the test target: `dsOnKeyPress` is a modifier a *component*
//  applies, so it has to be visible to Sources/DesignSchema, and a harness split across two modules is one
//  nobody keeps consistent. Nothing here runs unless a test builds a `DSHost`.
//
//  What a hosted view can and cannot say — the same honesty the keyboard gate keeps
//  (Tests/DesignSchemaUITests/KeyboardSpecTests.swift). A `swift test` process can build the view, lay it out
//  in an offscreen window, read the accessibility tree the platform built from it (identifiers, labels,
//  values, traits) and perform an element's activate action. It cannot move keyboard focus, type into a
//  field, or observe `@FocusState`: those need a real UI session, which is what the XCUITest half of the gate
//  is for. The generator marks the scenarios that need them `.disabled` with that reason rather than
//  pretending, so the report shows the gap instead of a false pass.
//
//  The tree is found by the identifiers the conventions already require: `.accessibilityIdentifier("<Name>")`
//  on the root and `"<Name>.<part>"` on every anatomy part (prompts/conventions/swiftui.md). A part that was
//  combined into the root by `.accessibilityElement(children: .combine)` has no element of its own, which is
//  why every lookup takes a fallback identifier — the root — the way the web gate falls back to `s.root()`.

import Foundation
import Synchronization
import SwiftUI

#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

// MARK: - Values

/// A value an event carried, flattened to something comparable with what a doc wrote in `then.event.with`.
///
/// The docs' expectations are JSON scalars and objects; a Swift payload is a struct, an enum, a tuple or a
/// number of some width. Reflecting it once, at the moment the event fires, keeps the recorded value
/// `Sendable` (an `Any` is not) and keeps the comparison in one place.
public enum DSValue: Sendable, Equatable {
    /// `nil`, or an event that carried nothing.
    case absent
    case scalar(String)
    case fields([String: DSValue])
    case list([DSValue])
}

public extension DSValue {
    init(reflecting subject: Any) {
        self = Self.make(subject, depth: 0)
    }

    /// Does this value match the scalar the doc named? Numbers compare as numbers, so a doc's `1` matches a
    /// Swift `1.0`; everything else compares exactly.
    func matches(_ expected: String) -> Bool {
        switch self {
        case .scalar(let text):
            if text == expected { return true }
            if let lhs = Double(text), let rhs = Double(expected) { return lhs == rhs }
            return false
        case .list(let items):
            return items.contains { $0.matches(expected) }
        case .fields(let fields):
            return fields.values.contains { $0.matches(expected) }
        case .absent:
            return false
        }
    }

    /// Does this value carry every field the doc named (`with: { name: signup, label: Sign up }`)? Extra
    /// fields are fine — the doc names what it cares about, the way `toMatchObject` does on web.
    func matches(fields expected: [String: String]) -> Bool {
        switch self {
        case .fields(let fields):
            return expected.allSatisfy { key, value in fields[key]?.matches(value) ?? false }
        case .list(let items):
            return items.contains { $0.matches(fields: expected) }
        default:
            return false
        }
    }

    /// A one-line rendering, for the message on a failed expectation.
    var display: String {
        switch self {
        case .absent:
            return "(nothing)"
        case .scalar(let text):
            return text
        case .list(let items):
            return "[" + items.map(\.display).joined(separator: ", ") + "]"
        case .fields(let fields):
            return "{" + fields.keys.sorted().map { "\($0): \(fields[$0]?.display ?? "")" }.joined(separator: ", ") + "}"
        }
    }

    /// Four levels is deeper than any payload a doc describes; past that the value is worth more as its own
    /// description than as another layer of mirrors.
    private static func make(_ subject: Any, depth: Int) -> DSValue {
        guard depth < 4 else { return .scalar(String(describing: subject)) }

        switch subject {
        case let text as String:
            return .scalar(text)
        case let flag as Bool:
            return .scalar(flag ? "true" : "false")
        case let number as Double:
            return .scalar(describe(number))
        case let number as CGFloat:
            return .scalar(describe(Double(number)))
        case let number as Float:
            return .scalar(describe(Double(number)))
        case let number as Int:
            return .scalar(String(number))
        default:
            break
        }

        // An option enum (`Button.Variant.primary`) describes itself as its case name, but a doc value like
        // `icon-only` is the raw value, so the raw value is what the comparison has to see.
        if let raw = subject as? any RawRepresentable {
            return make(raw.rawValue, depth: depth + 1)
        }

        let mirror = Mirror(reflecting: subject)
        switch mirror.displayStyle {
        case .optional:
            guard let wrapped = mirror.children.first?.value else { return .absent }
            return make(wrapped, depth: depth + 1)
        case .collection, .set, .tuple:
            return .list(mirror.children.map { make($0.value, depth: depth + 1) })
        case .struct, .class:
            var fields: [String: DSValue] = [:]
            for child in mirror.children {
                guard let label = child.label else { continue }
                fields[label] = make(child.value, depth: depth + 1)
            }
            return fields.isEmpty ? .scalar(String(describing: subject)) : .fields(fields)
        default:
            return .scalar(String(describing: subject))
        }
    }

    /// `1.0` is the number `1`: a doc writes `1`, and a payload that stores it as a `Double` must still match.
    private static func describe(_ value: Double) -> String {
        guard value.isFinite, value == value.rounded(), abs(value) < 1e15 else { return String(value) }
        return String(Int64(value))
    }
}

// MARK: - Events

/// One call of one event, as the spy recorded it.
public struct DSEventCall: Sendable, Equatable {
    public let name: String
    public let arguments: [DSValue]

    public init(name: String, arguments: [DSValue]) {
        self.name = name
        self.arguments = arguments
    }

    /// The payload a doc's `with:` describes — the first argument, since an event carries one thing.
    public var payload: DSValue { arguments.first ?? .absent }
}

/// What the scenario's event closures were called with: `vi.fn()`, for a language that has to know a
/// closure's shape up front (see `spy(_:)`).
///
/// `Sendable` rather than `@MainActor`: SwiftUI stores a component's action as a plain closure, and a
/// main-actor-isolated one cannot be converted to it under Swift 6.
public final class DSEventLog: Sendable {
    private let recorded = Mutex<[DSEventCall]>([])

    public init() {}

    public func record(_ name: String, _ arguments: [DSValue]) {
        recorded.withLock { $0.append(DSEventCall(name: name, arguments: arguments)) }
    }

    public var all: [DSEventCall] { recorded.withLock { $0 } }

    public func calls(of name: String) -> [DSEventCall] { all.filter { $0.name == name } }

    public func count(_ name: String) -> Int { calls(of: name).count }

    public func fired(_ name: String) -> Bool { count(name) > 0 }

    /// A call of `name` whose payload is the scalar the doc named. Every argument is tried, because an event
    /// the docs describe as carrying one value may reach SwiftUI as two.
    public func fired(_ name: String, with expected: String) -> Bool {
        calls(of: name).contains { call in call.arguments.contains { $0.matches(expected) } }
    }

    /// A call of `name` whose payload carries every field the doc named.
    public func fired(_ name: String, with expected: [String: String]) -> Bool {
        calls(of: name).contains { call in call.arguments.contains { $0.matches(fields: expected) } }
    }

    /// What was actually recorded, for the message on a failed expectation.
    public func describe(_ name: String) -> String {
        let matching = calls(of: name)
        guard !matching.isEmpty else {
            let others = Set(all.map(\.name)).sorted()
            return others.isEmpty
                ? "\(name) never fired (no event fired)"
                : "\(name) never fired; \(others.joined(separator: ", ")) did"
        }
        let payloads = matching.map { $0.arguments.map(\.display).joined(separator: ", ") }
        return "\(name) fired \(matching.count)×: [" + payloads.joined(separator: "] [") + "]"
    }
}

public extension DSEventLog {
    /// The component's event closure, recording every call. One overload per arity a generated component can
    /// declare: Swift picks by the closure type the initializer's parameter has, so
    /// `action: events.spy("onPress")` works whether `action` is `() -> Void` or `(Something) -> Void`.
    func spy(_ name: String) -> @Sendable () -> Void {
        { [self] in record(name, []) }
    }

    func spy<A>(_ name: String) -> @Sendable (A) -> Void {
        { [self] a in record(name, [DSValue(reflecting: a)]) }
    }

    func spy<A, B>(_ name: String) -> @Sendable (A, B) -> Void {
        { [self] a, b in record(name, [DSValue(reflecting: a), DSValue(reflecting: b)]) }
    }

    func spy<A, B, C>(_ name: String) -> @Sendable (A, B, C) -> Void {
        { [self] a, b, c in record(name, [DSValue(reflecting: a), DSValue(reflecting: b), DSValue(reflecting: c)]) }
    }
}

// MARK: - The accessibility tree

/// The traits a doc's `a11y.role` and `then.state` can be checked against. A deliberately small set: what
/// the host platform's accessibility tree actually exposes, and what prompts/conventions/swiftui.md tells a
/// component to set. `.header` is one UIKit reports and AppKit does not, which is why the generator never
/// emits an assertion for the `heading` role.
public enum DSTrait: String, Sendable, CaseIterable {
    case button
    case link
    case header
    case image
    case selected
    case staticText
    case searchField
    case adjustable
    case updatesFrequently
}

/// One element of the accessibility tree, as the platform built it from the SwiftUI view.
@MainActor
public struct DSNode {
    public let identifier: String
    public let label: String
    public let value: String
    public let hint: String
    public let traits: Set<DSTrait>
    public let isEnabled: Bool
    public let children: [DSNode]
    /// The element's activate action, or `nil` when it has none. The one thing a node keeps from the live
    /// tree, so everything else here is a plain snapshot.
    let activateAction: (@MainActor () -> Bool)?

    /// This node and every node under it, depth first.
    public var flattened: [DSNode] {
        [self] + children.flatMap(\.flattened)
    }

    /// The first node carrying `identifier`, this one included.
    public func descendant(_ identifier: String) -> DSNode? {
        flattened.first { $0.identifier == identifier }
    }

    /// Everything this node says out loud: what a `then.text` or `then.copy` assertion looks through.
    public var spokenText: String {
        [label, value, hint].filter { !$0.isEmpty }.joined(separator: " ")
    }

    /// Perform the element's activate action — the `.accessibilityAction` on the component, the tap a person
    /// makes, and what VoiceOver's double tap does.
    public func activate() throws {
        guard let activateAction, activateAction() else {
            throw DSHostError.notActionable(identifier)
        }
    }

    /// The tree as text, for the message on a lookup that found nothing.
    public func dump(indent: String = "") -> String {
        let parts = [
            identifier.isEmpty ? nil : "#\(identifier)",
            label.isEmpty ? nil : "\"\(label)\"",
            value.isEmpty ? nil : "value=\(value)",
            traits.isEmpty ? nil : traits.map(\.rawValue).sorted().joined(separator: "+"),
            isEnabled ? nil : "disabled",
        ].compactMap { $0 }
        let line = indent + (parts.isEmpty ? "(unlabelled)" : parts.joined(separator: " "))
        return ([line] + children.map { $0.dump(indent: indent + "  ") }).joined(separator: "\n")
    }
}

// MARK: - Errors

public enum DSHostError: Error, CustomStringConvertible {
    /// No element carries the identifier the scenario needs.
    case notFound(String, tree: String)
    /// The element is there but has no activate action.
    case notActionable(String)
    /// No view below the host registered a handler for the key.
    case noKeyHandler(String, registered: [String])

    public var description: String {
        switch self {
        case .notFound(let identifier, let tree):
            return """
            no element with the accessibility identifier "\(identifier)". The component root must carry \
            .accessibilityIdentifier("<Name>") and each anatomy part "<Name>.<part>" \
            (prompts/conventions/swiftui.md, "Accessibility"). The tree was:
            \(tree)
            """
        case .notActionable(let identifier):
            return """
            "\(identifier)" has no activate action. A control the docs say can be pressed needs a Button, an \
            .accessibilityAction, or a trait with an action behind it.
            """
        case .noKeyHandler(let key, let registered):
            let known = registered.isEmpty ? "none" : registered.sorted().joined(separator: ", ")
            return """
            nothing below the host handles "\(key)". A `swift test` process cannot synthesize a key event, so \
            the docs' keyboard rules reach this gate only through `.dsOnKeyPress` (Support/Testing.swift), \
            which installs SwiftUI's own `.onKeyPress` as well. Registered keys: \(known).
            """
        }
    }
}

// MARK: - The host

/// A component rendered where its accessibility tree can be read and acted on.
///
///     let events = DSEventLog()
///     let host = DSHost { Button(label: "Sign up", action: events.spy("onPress")) }
///     try host.activate("Button.container", or: "Button")
///     #expect(events.fired("onPress"))
@MainActor
public final class DSHost {
    private let container: DSHostContainer
    private let relay: DSKeyPressRelay

    public init<Content: View>(@ViewBuilder _ content: () -> Content) {
        let relay = DSKeyPressRelay()
        self.relay = relay
        container = DSHostContainer(AnyView(content().environment(\.dsKeyPressRelay, relay)))
        settle()
    }

    /// Let SwiftUI commit whatever the last action changed, then lay out again. Called after every action, so
    /// an assertion always reads the tree that action produced.
    public func settle() {
        container.layout()
        RunLoop.current.run(until: Date().addingTimeInterval(0.02))
        container.layout()
    }

    /// The accessibility tree as it is now.
    public func snapshot() -> DSNode { container.snapshot() }

    public func node(_ identifier: String, or fallback: String? = nil) -> DSNode? {
        let tree = snapshot()
        if let found = tree.descendant(identifier) { return found }
        return fallback.flatMap { tree.descendant($0) }
    }

    public func exists(_ identifier: String, or fallback: String? = nil) -> Bool {
        node(identifier, or: fallback) != nil
    }

    public func require(_ identifier: String, or fallback: String? = nil) throws -> DSNode {
        guard let found = node(identifier, or: fallback) else {
            throw DSHostError.notFound(identifier, tree: snapshot().dump())
        }
        return found
    }

    /// Press it: the element's activate action, then a settle so the result is visible.
    public func activate(_ identifier: String, or fallback: String? = nil) throws {
        try require(identifier, or: fallback).activate()
        settle()
    }

    /// Send one of the docs' key names (`Enter`, `Escape`, `ArrowDown`, `a`) to the innermost view that
    /// registered it through `.dsOnKeyPress`.
    public func send(key: String) throws {
        guard relay.handles(key) else {
            throw DSHostError.noKeyHandler(key, registered: relay.registeredKeys)
        }
        _ = relay.send(key)
        settle()
    }

    /// Does anything in the tree say this? `then.text` and `then.copy` name text a person can read, and on
    /// this platform every such string is an element's label, value or hint.
    public func containsText(_ text: String) -> Bool {
        snapshot().flattened.contains { $0.spokenText.contains(text) }
    }

    /// Does any element carry this trait? `then.role`, which asks whether the component exposes something of
    /// that kind at all.
    public func containsTrait(_ trait: DSTrait) -> Bool {
        snapshot().flattened.contains { $0.traits.contains(trait) }
    }

    /// The tree as text, for a failure message a person has to read.
    public func dump() -> String { snapshot().dump() }
}

// MARK: - Keys

/// The docs' key names, as SwiftUI spells them — the same table `KeyboardSpecTests` keeps for XCUITest,
/// which is the other end of the same `keyboard` block.
public enum DSKey {
    static let named: [(name: String, key: KeyEquivalent)] = [
        ("Enter", .return),
        ("Escape", .escape),
        ("Space", .space),
        ("Tab", .tab),
        ("ArrowUp", .upArrow),
        ("ArrowDown", .downArrow),
        ("ArrowLeft", .leftArrow),
        ("ArrowRight", .rightArrow),
        ("Home", .home),
        ("End", .end),
        ("PageUp", .pageUp),
        ("PageDown", .pageDown),
        ("Backspace", .delete),
        ("Delete", .deleteForward),
    ]

    /// The doc's name for a key equivalent; a plain character is its own name.
    public static func name(of key: KeyEquivalent) -> String {
        named.first { $0.key.character == key.character }?.name ?? String(key.character)
    }

    /// The key equivalent for a doc name. `" "` is the space bar, which the docs write both ways.
    public static func key(named name: String) -> KeyEquivalent? {
        if name == " " { return .space }
        if let match = named.first(where: { $0.name.caseInsensitiveCompare(name) == .orderedSame }) {
            return match.key
        }
        guard name.count == 1, let character = name.first else { return nil }
        return KeyEquivalent(character)
    }

    /// `" "` and `Space` are the same key; the docs use both spellings.
    static func canonical(_ name: String) -> String {
        name == " " ? "Space" : name
    }
}

/// The key handlers the views below a `DSHost` installed, newest first.
///
/// Nothing in a `swift test` process can synthesize a key event, so `.onKeyPress` alone is unreachable from
/// the behavior gate. `.dsOnKeyPress` installs it *and* registers here, and the gate calls the same closure
/// the key event would.
@MainActor
public final class DSKeyPressRelay {
    private struct Handler {
        let id: UUID
        let keys: Set<String>
        let action: (KeyEquivalent) -> KeyPress.Result
    }

    private var handlers: [Handler] = []

    public init() {}

    public var registeredKeys: [String] { Array(Set(handlers.flatMap(\.keys))) }

    public func handles(_ name: String) -> Bool {
        let canonical = DSKey.canonical(name)
        return handlers.contains { $0.keys.contains(canonical) }
    }

    /// The most recently registered handler that claims the key wins, the way a real key event reaches the
    /// innermost view first.
    public func send(_ name: String) -> Bool {
        let canonical = DSKey.canonical(name)
        guard let key = DSKey.key(named: canonical) else { return false }
        for handler in handlers.reversed() where handler.keys.contains(canonical) {
            if handler.action(key) == .handled { return true }
        }
        return false
    }

    func register(id: UUID, keys: Set<KeyEquivalent>, action: @escaping (KeyEquivalent) -> KeyPress.Result) {
        unregister(id)
        handlers.append(Handler(id: id, keys: Set(keys.map(DSKey.name(of:))), action: action))
    }

    func unregister(_ id: UUID) {
        handlers.removeAll { $0.id == id }
    }
}

struct DSKeyPressRelayKey: EnvironmentKey {
    static var defaultValue: DSKeyPressRelay? { nil }
}

public extension EnvironmentValues {
    /// Set by `DSHost`, `nil` everywhere else — so `.dsOnKeyPress` in a shipped app is exactly `.onKeyPress`.
    var dsKeyPressRelay: DSKeyPressRelay? {
        get { self[DSKeyPressRelayKey.self] }
        set { self[DSKeyPressRelayKey.self] = newValue }
    }
}

struct DSKeyPressModifier: ViewModifier {
    @Environment(\.dsKeyPressRelay) private var relay
    @State private var id = UUID()

    let keys: Set<KeyEquivalent>
    let action: (KeyEquivalent) -> KeyPress.Result

    func body(content: Content) -> some View {
        content
            .onKeyPress(keys: keys) { press in action(press.key) }
            .onAppear { relay?.register(id: id, keys: keys, action: action) }
            .onDisappear { relay?.unregister(id) }
    }
}

public extension View {
    /// The docs' keyboard rules, installed so both a hardware keyboard and the behavior gate reach them.
    /// Components use this in place of `.onKeyPress(keys:)`; everything else about it is identical.
    func dsOnKeyPress(
        _ keys: Set<KeyEquivalent>,
        action: @escaping (KeyEquivalent) -> KeyPress.Result
    ) -> some View {
        modifier(DSKeyPressModifier(keys: keys, action: action))
    }

    /// One key, for the common rule ("Escape closes").
    func dsOnKeyPress(_ key: KeyEquivalent, action: @escaping () -> KeyPress.Result) -> some View {
        dsOnKeyPress([key]) { _ in action() }
    }
}

// MARK: - Hosting, per platform
//
// Everything above is platform-neutral; this is the whole surface that is not. `DSHostContainer` is "a view,
// laid out, with its accessibility tree readable" — SwiftUI builds that tree through UIKit on a simulator and
// through AppKit on the Mac where `swift test` runs, and exposes it to neither SwiftUI nor itself.
//
// `dsText(_:)` exists twice on purpose: AppKit and UIKit disagree about which of these accessors is
// optional, and the pair compiles against either spelling.

#if canImport(UIKit)

@MainActor
final class DSHostContainer {
    private let controller: UIHostingController<AnyView>
    private let window: UIWindow

    init(_ view: AnyView) {
        controller = UIHostingController(rootView: view)
        // An iPhone-sized canvas: big enough that nothing the docs describe is laid out at zero height.
        window = UIWindow(frame: CGRect(x: 0, y: 0, width: 430, height: 932))
        window.rootViewController = controller
        window.makeKeyAndVisible()
        layout()
    }

    func layout() {
        controller.view.setNeedsLayout()
        controller.view.layoutIfNeeded()
    }

    func snapshot() -> DSNode { Self.node(controller.view) }

    private static let traitMapping: [(UIAccessibilityTraits, DSTrait)] = [
        (.button, .button),
        (.link, .link),
        (.header, .header),
        (.image, .image),
        (.selected, .selected),
        (.staticText, .staticText),
        (.searchField, .searchField),
        (.adjustable, .adjustable),
        (.updatesFrequently, .updatesFrequently),
    ]

    private static func node(_ object: NSObject) -> DSNode {
        var children: [DSNode] = []
        if !object.isAccessibilityElement {
            if let elements = object.accessibilityElements {
                children = elements.compactMap { $0 as? NSObject }.map(node)
            } else if let view = object as? UIView {
                children = view.subviews.map(node)
            }
        }
        let traits = object.accessibilityTraits
        var found: Set<DSTrait> = []
        for (trait, ours) in traitMapping where traits.contains(trait) {
            found.insert(ours)
        }
        return DSNode(
            identifier: dsText((object as? UIAccessibilityIdentification)?.accessibilityIdentifier),
            label: dsText(object.accessibilityLabel),
            value: dsText(object.accessibilityValue),
            hint: dsText(object.accessibilityHint),
            traits: found,
            isEnabled: !traits.contains(.notEnabled) && object.accessibilityRespondsToUserInteraction,
            children: children,
            activateAction: { object.accessibilityActivate() }
        )
    }
}

#elseif canImport(AppKit)

@MainActor
final class DSHostContainer {
    private let hosting: NSHostingView<AnyView>
    private let window: NSWindow

    init(_ view: AnyView) {
        hosting = NSHostingView(rootView: view)
        // A phone-sized canvas: big enough that nothing the docs describe is laid out at zero height.
        hosting.frame = CGRect(x: 0, y: 0, width: 430, height: 932)
        window = NSWindow(contentRect: hosting.frame, styleMask: [.borderless], backing: .buffered, defer: false)
        window.contentView = hosting
        // Offscreen, not ordered out: a window that was never ordered in builds no accessibility tree, and a
        // test run must not take the screen from whoever is at the Mac.
        window.setFrameOrigin(NSPoint(x: -20_000, y: -20_000))
        window.orderFront(nil)
        layout()
    }

    func layout() {
        hosting.needsLayout = true
        hosting.layoutSubtreeIfNeeded()
        window.displayIfNeeded()
    }

    func snapshot() -> DSNode { Self.node(hosting) }

    private static func node(_ object: any NSAccessibilityProtocol) -> DSNode {
        var children = (object.accessibilityChildren() ?? []).compactMap { $0 as? any NSAccessibilityProtocol }
        if children.isEmpty, let view = object as? NSView {
            children = view.subviews
        }
        var found: Set<DSTrait> = []
        switch object.accessibilityRole() {
        case .some(.button), .some(.checkBox), .some(.radioButton), .some(.popUpButton):
            found.insert(.button)
        case .some(.link):
            found.insert(.link)
        case .some(.image):
            found.insert(.image)
        case .some(.staticText):
            found.insert(.staticText)
        case .some(.slider), .some(.incrementor):
            found.insert(.adjustable)
        default:
            break
        }
        if object.accessibilitySubrole() == .some(.searchField) { found.insert(.searchField) }
        if object.isAccessibilitySelected() { found.insert(.selected) }
        return DSNode(
            identifier: dsText(object.accessibilityIdentifier()),
            label: dsText(object.accessibilityLabel()),
            value: describe(object.accessibilityValue()),
            hint: dsText(object.accessibilityHelp()),
            traits: found,
            isEnabled: object.isAccessibilityEnabled(),
            children: children.map(node),
            activateAction: { object.accessibilityPerformPress() }
        )
    }

    /// An AppKit accessibility value is `Any`: a string for text, a number for a checkbox or a progress bar.
    private static func describe(_ value: Any?) -> String {
        guard let value else { return "" }
        if let string = value as? String { return string }
        if case .scalar(let string) = DSValue(reflecting: value) { return string }
        return String(describing: value)
    }
}

#endif

/// AppKit and UIKit disagree about which accessibility accessors are optional; these two overloads compile
/// against either spelling, and Swift prefers the exact one.
func dsText(_ value: String) -> String { value }
func dsText(_ value: String?) -> String { value ?? "" }
