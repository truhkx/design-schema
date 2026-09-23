# Generate: Heading for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Heading.swift` declaring `public struct Heading: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/HeadingBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Heading.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Heading") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("Heading")` on the root and `"Heading.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for swiftui; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: each closure takes exactly the listed arguments, in order, and `reason` is a nested `enum` of its reasons. A `cancelable` closure returns `Bool`, and `false` skips the default action. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: every pair becomes a `Binding<T>?` parameter plus the default's initial value, with `@State` holding the uncontrolled value; the closure fires in both modes, and a bound view shows the new state only once the binding changes.
- **Parts and slots**: each slot is a `@ViewBuilder` parameter under its resolved label only (`content` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides:` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (`.onHover`, `@FocusState`, or the view's own state), with the token listed for each `by` value; write `computed` as the given multiplication of `theme` values. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` applies when those props are set.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this picks among the conventions' overlay forms.
- **Copy**: interpolate only the listed `params` and props; select plural forms through `String(localized:)` with the entry's forms as its plural variations; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example becomes a `#Preview` with the name shown and exactly its `given`.
- **Lifecycle**: a deprecated parameter, closure, case or view keeps working, is marked `@available(*, deprecated, message:)` naming `use`, and warns once under `#if DEBUG` naming `use`.
- A `type: integer` prop is an `Int`: whole numbers only.

## Component schema

```yaml
component:
  name: Heading
  category: typography
  status: review
  anatomy:
  - text
  props:
    level:
      type: enum
      values:
      - '1'
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      required: true
      description: 'Position in the document outline. Controls the semantic element,
        not the visual size. Canonical values are strings; generated components also
        accept the number — the exported `HeadingLevel` type is the string union,
        and the prop or property type adds `1 | 2 | 3 | 4 | 5 | 6`. A missing, out-of-range
        or non-numeric level (untyped JavaScript, `level="7"`) is treated as `2` on
        every platform: an <h2> on web and Lit, the 3xl default size everywhere, and
        one development warning per element for its lifetime. The warning is developer-facing,
        not copy, so it has no copy key; it names the received value and the level-2
        fallback (`Heading: level 7 is not one of 1–6; rendering as level 2.`), printing
        the value as `String(level)`, so a missing level reads `level undefined`.
        The warning is issued once per element whatever later values arrive (a later,
        different invalid value does not warn again), and on web from an effect behind
        a ref guard rather than during render, so StrictMode cannot send it twice.
        Behavior scenarios take only canonical values, so each platform''s own test
        file covers a numeric level and the fallback with its single warning; neither
        gets a story. On Lit the property holds `undefined` until set, and the fallback
        renders. The Default story renders level `2` with "Account settings" and no
        other args.'
      a11y: Screen-reader users navigate by heading level; levels must not skip (h1
        → h3).
    size:
      type: enum
      enumRef: size
      values:
      - 4xl
      - 3xl
      - 2xl
      - xl
      - lg
      - md
      description: 'Visual size, independent of level. There is no single default;
        the default is read from `level` by this exact map — 1 → 4xl, 2 → 3xl, 3 →
        2xl, 4 → xl, 5 → lg, 6 → md — and an explicit `size` always wins over it.
        On Lit the resolved default is never written back to the `size` attribute,
        so `[size]` selectors match only explicit sizes; web exposes no size attribute
        at all, only the `ds-heading--size-*` modifier class, which carries the resolved
        size. Heading takes the large end of the shared size vocabulary; the exported
        type is its own, since Text takes the small end. Enum stories keep the literal
        `<Prop><Value>` casing: `Size4xl`, `Size2xl`, `Level1`.'
    children:
      type: content
      required: true
      description: The heading text. Keep it short and descriptive; it is what appears
        in the page outline.
    align:
      type: enum
      values:
      - start
      - center
      - end
      default: start
      description: Horizontal text alignment. It has no style binding on purpose —
        alignment is a layout choice, not a themed value — so it maps straight to
        the platform's text-align. `start` and `end` are logical on web and Lit; React
        Native has no logical values and resolves them through I18nManager.isRTL at
        render, so a writing-direction change mid-session does not re-align an already-rendered
        heading, the same limit Text has. The value set is Text's, so every platform
        reuses Text's exported `TextAlign` type and exports no separate HeadingAlign,
        with no deprecated alias; Text exports no mapping helper on web or Lit, so
        Heading keeps its own `ds-heading--align-*` classes there and its own `:host([align])`
        selectors on Lit. On web every value, `start` included, emits its `ds-heading--align-<value>`
        class.
  styles:
    fontFamily:
      token: font.family.heading
      locked: false
    fontWeight:
      token: font.weight.semibold
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    lineHeight:
      token: font.lineHeight.tight
      locked: false
    color:
      token: color.foreground.strong
      description: Locked by the AAA pair, so it is absent from the overrides type;
        it keeps its `--ds-heading-color` hook, defaulting to `var(--color-foreground-strong)`,
        and the rule reads the hook, as every locked binding does.
      locked: true
    marginBlockEnd:
      token: space.sm
      description: 'Space below the heading (marginBottom on React Native — the one
        margin the system allows, because a heading owns the gap to its own first
        paragraph). It is unconditional: a container that owns its own rhythm turns
        it off with `overrides={{ marginBlockEnd: ''space.0'' }}`, as Table does.
        That override is written out as a margin of 0, never omitted.'
      locked: false
  a11y:
    role: heading
    requires:
    - heading-hierarchy
    - contrast-aaa
    contrast:
    - foreground: color.foreground.strong
      background: color.background
      level: AAA
  platforms:
    web:
      element: h1–h6
      attributes: []
      notes: 'The element is chosen by `level`. Never use `role="heading"` on a div
        when a real heading element is available. The root is the `text` part and
        carries `data-part="text"` beside `data-ds="Heading"` — on web and Lit one
        element takes both hooks. On web `data-part` is written before `...rest`,
        so a composing parent can relabel it as it does Box; `data-ds` is written
        after. Heading does not compose Text: it owns its five typography bindings
        because Text cannot carry the header semantics, the heading sizes or a margin.
        `contrast-aaa` and `heading-hierarchy` have nothing to implement here — the
        first is a property of the locked token pair and the second is a property
        of the page; both are checked by the build, not by the component. The user-agent
        top margin of h1–h6 is reset to `margin-block-start: 0` — a reset of a browser
        default, not a binding, since marginBlockEnd is the one margin Heading owns.'
    lit:
      tag: ds-heading
      reflect:
      - level
      - size
      - align
      notes: 'Renders the matching <h1>–<h6> inside the shadow root, carrying `part="text"`
        and `data-part="text"` — the anatomy name, not `heading`. Headings inside
        shadow roots are exposed to assistive technology normally; some in-page outline
        tools do not see them, and the component does nothing about that. `level`
        is required, but an element always renders: with the attribute absent or invalid
        it falls back to <h2> and warns once per element, for the element''s lifetime,
        in development. Sizes are attribute selectors on the reflected `level` and
        `size` setting `--ds-heading-font-size`, with the `[size]` rules declared
        after the `[level]` defaults so an explicit size wins at equal specificity;
        with `level` absent or invalid no `[level]` rule matches, so the 3xl fallback
        size is the `:host` default of `--ds-heading-font-size`. Non-interactive,
        so no delegatesFocus and no focus styling.'
    rn:
      element: Text
      props:
      - accessibilityRole=header
      notes: 'iOS and Android have no heading levels. `level` maps only to typography;
        the header trait is set regardless of level. Document the outline in the screen''s
        design instead. Heading renders the platform Text directly rather than composing
        the system Text, which carries no header role, no heading sizes and no margin.
        The root is both the component and its only part, so it carries `testID="Heading"`
        and there is no `Heading.text`: a part that is the root keeps the root hook.
        The ref is `Ref<TextInstance>`. Heading provides `TextStyleContext` ({ fontSize,
        color, nested: true }), the context Text.tsx exports, imported from there
        rather than declared again, with its own resolved size and colour, as Text
        does, so an inline Icon or Link inside it matches the heading. The header
        role is the `accessibilityRole="header"` prop, not the `role` prop, and no
        `aria-level` is passed: react-native-web previews therefore show every Heading
        as an <h1>, a Storybook-only effect accepted because native has no levels.'
    swiftui:
      element: Text
      props:
      - .accessibilityAddTraits=isHeader
      - .accessibilityHeading
      - .font
      - .fontWeight
      notes: A `Text` with `.accessibilityAddTraits(.isHeader)` and `.accessibilityHeading(.h1…h6)`
        from `level` — VoiceOver's rotor lists headings by level, so the outline is
        real on iOS. Size from the `size` binding through `@ScaledMetric`; `level`
        never changes the look. `element` is ignored.
  behavior:
  - name: level-puts-the-heading-in-the-outline
    description: On web the semantic element is always a real <h1>-<h6> chosen from
      level, so the heading is in the accessibility tree screen-reader users navigate
      by.
    given:
      level: '3'
    then:
    - role: heading
      platforms:
      - web
      - lit
    - attribute: accessibilityRole
      is: header
      platforms:
      - rn
  - name: size-does-not-change-the-outline
    description: Decoupling level from size is the whole point of this component -
      a heading at the smallest size is still a heading.
    given:
      level: '2'
      size: md
    then:
    - role: heading
      platforms:
      - web
      - lit
    - attribute: accessibilityRole
      is: header
      platforms:
      - rn
  examples:
  - name: page-title
    description: The one level-1 heading on a page, at its default size.
    given:
      level: '1'
      children: Account settings
  - name: section-heading
    description: A major section of the page, one level below the title.
    given:
      level: '2'
      children: Billing
  - name: subsection-sized-up
    description: A level-4 heading given a larger size so it still reads as a section
      start in a wide layout.
    given:
      level: '4'
      size: xl
      children: Payment methods
```

## Constants and examples

- example `page-title`, story `PageTitle`: given `level: "1"`, `children: "Account settings"`; The one level-1 heading on a page, at its default size.
- example `section-heading`, story `SectionHeading`: given `level: "2"`, `children: "Billing"`; A major section of the page, one level below the title.
- example `subsection-sized-up`, story `SubsectionSizedUp`: given `level: "4"`, `size: "xl"`, `children: "Payment methods"`; A level-4 heading given a larger size so it still reads as a section start in a wide layout.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`, `marginBlockEnd`
Locked (accessibility-bearing, never overridable): `color`

## Platform notes (swiftui)

```yaml
element: Text
props:
- .accessibilityAddTraits=isHeader
- .accessibilityHeading
- .font
- .fontWeight
notes: "A `Text` with `.accessibilityAddTraits(.isHeader)` and `.accessibilityHeading(.h1\u2026\
  h6)` from `level` \u2014 VoiceOver's rotor lists headings by level, so the outline\
  \ is real on iOS. Size from the `size` binding through `@ScaledMetric`; `level`\
  \ never changes the look. `element` is ignored."
```

## Guidance

## Overview

Headings label sections of content. Their most important job is invisible: they build the outline that screen-reader users jump through to understand and navigate a page.

## When to use

Use a Heading to title a page, a section, or a card that contains its own content. Choose `level` from the document outline — the page title is `1`, its major sections are `2`, their subsections `3` — and then choose `size` separately if the default visual size is wrong for the layout. Decoupling level from size is the whole point of this component: it lets designers pick the right look without breaking the outline.

## When not to use

Do not use a Heading purely to make text large or bold; use Text with a larger size. Do not skip levels (a `2` followed by a `4`) and do not use more than one `level: 1` per page or screen. Do not put interactive controls inside a heading.

## Content guidelines

Headings are short noun phrases in sentence case, unique within a page, and front-loaded with the most specific word. They should make sense when read in a list on their own, because that is exactly how screen-reader users encounter them.

## Accessibility

Headings must reflect the actual structure of the content (WCAG 1.3.1 Info and Relationships, 2.4.6 Headings and Labels, and 2.4.10 Section Headings at AAA). Levels must not skip. On web, the semantic element is always a real `<h1>`–`<h6>` chosen from `level`; visual size never influences the element. Heading text meets AAA contrast (7:1) against the page background in both themes because headings carry the most weight in a page's meaning. On native platforms there are no levels, so headings carry the platform header trait and the outline is documented in the screen design; this is a known, unavoidable gap between platforms and it is called out in the platform mapping table above.

## Platform notes

### Web
`level` selects the element. `size` maps to `font.size.*` via a `ds-heading--size-*` modifier class; the default size per level is 1→4xl, 2→3xl, 3→2xl, 4→xl, 5→lg, 6→md.

### Lit
`<ds-heading level="2">` renders `<h2>` inside its shadow root. `level`, `size` and `align` are reflected as attributes. Because the heading lives in a shadow root, styling comes through the `--ds-heading-*` hooks and `overrides`, never `::part`; the inner element carries `part="text"` as an anatomy hook only.

### React Native
Renders `Text` with `accessibilityRole="header"`. `level` chooses the default size only. iOS VoiceOver exposes the header trait but not a level; Android TalkBack likewise. Do not simulate levels with `accessibilityLabel` prefixes like "Heading level 2" — it is noisy and non-standard.

## Related

Text, Section (planned).

## Behavior scenarios (16)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-level-1
  given:
    level: '1'
  then:
  - renders: true
  derived: true
- name: renders-level-2
  given:
    level: '2'
  then:
  - renders: true
  derived: true
- name: renders-level-3
  given:
    level: '3'
  then:
  - renders: true
  derived: true
- name: renders-level-4
  given:
    level: '4'
  then:
  - renders: true
  derived: true
- name: renders-level-5
  given:
    level: '5'
  then:
  - renders: true
  derived: true
- name: renders-level-6
  given:
    level: '6'
  then:
  - renders: true
  derived: true
- name: renders-size-4xl
  given:
    size: 4xl
  then:
  - renders: true
  derived: true
- name: renders-size-3xl
  given:
    size: 3xl
  then:
  - renders: true
  derived: true
- name: renders-size-2xl
  given:
    size: 2xl
  then:
  - renders: true
  derived: true
- name: renders-size-xl
  given:
    size: xl
  then:
  - renders: true
  derived: true
- name: renders-size-lg
  given:
    size: lg
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-align-start
  given:
    align: start
  then:
  - renders: true
  derived: true
- name: renders-align-center
  given:
    align: center
  then:
  - renders: true
  derived: true
- name: renders-align-end
  given:
    align: end
  then:
  - renders: true
  derived: true
```
