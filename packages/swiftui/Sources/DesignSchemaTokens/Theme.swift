//  Theme.swift
//
//  The one hand-written file in DesignSchemaTokens. Everything beside it (TokenRef.swift,
//  CalmPrecise.swift, WarmFriendly.swift, WarmSleek.swift, Themes.swift) is written by `pnpm tokens`
//  (the `swift` platform in tokens/build.mjs), and this file is the contract those generated files fill in:
//
//    TokenRef      enum TokenRef: String, CaseIterable   — every dotted token name, one case each
//    <Theme>       enum CalmPrecise { enum Light { static let colorBackground: Color … ; static let table }
//                                     enum Dark  { … }
//                                     static let definition: ThemeDefinition }
//    Themes        enum Themes { static let all: [ThemeDefinition]; static let fallback: ThemeDefinition }
//
//  A component never asks which mode it is in: it reads `@Environment(\.dsTheme)` and the theme resolves
//  light or dark from the environment's `colorScheme` at render time.

import SwiftUI

// MARK: - Token values

/// A DTCG `shadow` resolved for SwiftUI. Offsets, blur and spread are points; `blur` is the CSS blur
/// radius, so a `.shadow(radius:)` takes `blur / 2` the way the React Native build does.
public struct ShadowToken: Sendable, Hashable {
    public let color: Color
    public let x: CGFloat
    public let y: CGFloat
    public let blur: CGFloat
    public let spread: CGFloat

    public init(color: Color, x: CGFloat, y: CGFloat, blur: CGFloat, spread: CGFloat = 0) {
        self.color = color
        self.x = x
        self.y = y
        self.blur = blur
        self.spread = spread
    }
}

/// A DTCG `fontFamily` stack resolved for SwiftUI. The stack's first system generic picks the
/// `Font.Design` (`system-ui` → `.default`, `ui-monospace` → `.monospaced`); if the stack *starts* with a
/// real family instead, that name is kept too, because the design alone cannot ask for "Google Sans".
public struct FontFamilyToken: Sendable, Hashable {
    public let design: Font.Design
    public let family: String?

    public init(design: Font.Design, family: String? = nil) {
        self.design = design
        self.family = family
    }

    /// The stack at a size: the named family when there is one, the system face in this design otherwise.
    public func font(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        guard let family else { return .system(size: size, weight: weight, design: design) }
        return .custom(family, fixedSize: size).weight(weight)
    }
}

/// What a token resolves to. One case per `$type` the token build emits: colors are `Color`, dimensions
/// `CGFloat` (points — px values are read as pt, the React Native convention), durations `TimeInterval`,
/// easings a ready-made `Animation`, font weights `Font.Weight`, font families a `FontFamilyToken`,
/// unitless things (line heights, opacities, `layer.*` z-indexes) `Double`, shadows a `ShadowToken`.
public enum TokenValue: Sendable {
    case color(Color)
    case dimension(CGFloat)
    case duration(TimeInterval)
    case animation(Animation)
    case fontWeight(Font.Weight)
    case fontFamily(FontFamilyToken)
    case number(Double)
    case shadow(ShadowToken)
}

public extension TokenValue {
    var color: Color? {
        guard case .color(let value) = self else { return nil }
        return value
    }

    var dimension: CGFloat? {
        guard case .dimension(let value) = self else { return nil }
        return value
    }

    var duration: TimeInterval? {
        guard case .duration(let value) = self else { return nil }
        return value
    }

    var animation: Animation? {
        guard case .animation(let value) = self else { return nil }
        return value
    }

    var fontWeight: Font.Weight? {
        guard case .fontWeight(let value) = self else { return nil }
        return value
    }

    var fontFamily: FontFamilyToken? {
        guard case .fontFamily(let value) = self else { return nil }
        return value
    }

    var number: Double? {
        guard case .number(let value) = self else { return nil }
        return value
    }

    var shadow: ShadowToken? {
        guard case .shadow(let value) = self else { return nil }
        return value
    }
}

// MARK: - Theme definition

/// One mode's worth of resolved tokens. The generated theme enums build two of these per theme.
public struct TokenTable: Sendable {
    public let values: [TokenRef: TokenValue]

    public init(_ values: [TokenRef: TokenValue]) {
        self.values = values
    }

    public subscript(ref: TokenRef) -> TokenValue? { values[ref] }
}

/// A theme: the same token names in two modes. `light` and `dark` always carry the same keys.
public struct ThemeDefinition: Sendable, Identifiable {
    public let id: String
    public let title: String
    public let light: TokenTable
    public let dark: TokenTable

    public init(id: String, title: String, light: TokenTable, dark: TokenTable) {
        self.id = id
        self.title = title
        self.light = light
        self.dark = dark
    }
}

// MARK: - Theme

/// A theme resolved for one color scheme. Components read tokens off it and never branch on the mode.
public struct Theme: Sendable {
    public let definition: ThemeDefinition
    public let colorScheme: ColorScheme

    public init(_ definition: ThemeDefinition, colorScheme: ColorScheme) {
        self.definition = definition
        self.colorScheme = colorScheme
    }

    public var id: String { definition.id }
    public var title: String { definition.title }

    private var table: TokenTable { colorScheme == .dark ? definition.dark : definition.light }

    /// The override path: `theme[ref]` resolves a `TokenRef` — the type an `overrides` map carries — to a
    /// typed value. The named accessors (`theme.colorBackground`, `theme.spaceSm`) are generated beside
    /// this file in TokenRef.swift as an extension; both read the same table.
    public subscript(ref: TokenRef) -> TokenValue {
        guard let value = table[ref] else {
            #if DEBUG
            print("[DesignSchema] theme '\(id)' has no value for '\(ref.rawValue)' in \(colorScheme == .dark ? "dark" : "light")")
            #endif
            return .number(0)
        }
        return value
    }

    /// Typed resolution with the neutral value of the type when a ref is missing or of another type —
    /// a missing token must not take the app down, and the `#if DEBUG` note above says what was missing.
    public func color(_ ref: TokenRef) -> Color { self[ref].color ?? .clear }
    public func dimension(_ ref: TokenRef) -> CGFloat { self[ref].dimension ?? 0 }
    public func duration(_ ref: TokenRef) -> TimeInterval { self[ref].duration ?? 0 }
    public func animation(_ ref: TokenRef) -> Animation { self[ref].animation ?? .default }
    public func fontWeight(_ ref: TokenRef) -> Font.Weight { self[ref].fontWeight ?? .regular }
    public func fontFamily(_ ref: TokenRef) -> FontFamilyToken { self[ref].fontFamily ?? FontFamilyToken(design: .default) }
    public func number(_ ref: TokenRef) -> Double { self[ref].number ?? 0 }
    public func shadow(_ ref: TokenRef) -> ShadowToken {
        self[ref].shadow ?? ShadowToken(color: .clear, x: 0, y: 0, blur: 0)
    }
}

// MARK: - Environment

struct DSThemeKey: EnvironmentKey {
    // Computed, not stored: the fallback is built on demand so nothing here is global mutable state.
    static var defaultValue: Theme { Theme(Themes.fallback, colorScheme: .light) }
}

public extension EnvironmentValues {
    /// The resolved theme. Set it with `.dsTheme(_:)` rather than writing the environment directly, so the
    /// color scheme is read at the point the theme is installed.
    var dsTheme: Theme {
        get { self[DSThemeKey.self] }
        set { self[DSThemeKey.self] = newValue }
    }
}

struct DSThemeModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme
    let definition: ThemeDefinition

    func body(content: Content) -> some View {
        content.environment(\.dsTheme, Theme(definition, colorScheme: colorScheme))
    }
}

public extension View {
    /// Install a theme. The mode comes from the environment, so `.preferredColorScheme(.dark)` above this
    /// modifier (or the system setting) is what picks the dark table.
    func dsTheme(_ definition: ThemeDefinition) -> some View {
        modifier(DSThemeModifier(definition: definition))
    }

    /// Install an already-resolved theme — previews and tests that want one fixed mode.
    func dsTheme(_ theme: Theme) -> some View {
        environment(\.dsTheme, theme)
    }
}
