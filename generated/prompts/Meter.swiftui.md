# Generate: Meter for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Meter.swift` declaring `public struct Meter: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/MeterBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Meter.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Meter") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Meter")` on the root and `"Meter.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Meter
  category: data
  status: review
  apg: meter
  anatomy:
  - container
  - label
  - valueText
  - track
  - fill
  props:
    value:
      type: number
      required: true
      description: The current measurement. Clamped to `min`…`max` for the bar; the
        accessible value is the clamped number too.
    min:
      type: number
      default: 0
      description: Lower bound of the range.
    max:
      type: number
      default: 100
      description: Upper bound of the range. Must be greater than `min`.
    label:
      type: string
      required: true
      description: Visible label naming the measurement ("Storage used"). Also the
        accessible name.
      a11y: Associated with the meter as its accessible name (aria-labelledby / accessibilityLabel).
    valueText:
      type: string
      description: Human-readable value shown at the end of the label row and announced
        instead of the raw number ("3.2 GB of 10 GB", "Strong"). Omit to show and
        announce the percentage, rounded to a whole number ("32%").
      a11y: Rendered as aria-valuetext / accessibilityValue.text.
    tone:
      type: enum
      values:
      - info
      - success
      - warning
      - danger
      default: info
      description: Fill color. `info` is the neutral brand fill; the consumer sets
        `success`/`warning`/`danger` from thresholds it owns — the meter does not
        decide what is "too full".
    hideValue:
      type: boolean
      default: false
      description: Hides the visible value text (a boolean attribute can only turn
        things on, so the flag is the hiding one). The accessible value is always
        exposed.
  styles:
    track:
      token: color.background.strong
      locked: true
    fill:
      token: color.status.{tone}.icon
      description: The icon step of each status hue is the one guaranteed 3:1 against
        the page background, which makes it the right non-text fill.
      locked: true
    trackHeight:
      token: space.2
      locked: false
    radius:
      token: radius.full
      locked: false
    labelColor:
      token: color.foreground
      locked: true
    labelSize:
      token: font.size.sm
      locked: false
    labelWeight:
      token: font.weight.medium
      locked: false
    valueColor:
      token: color.foreground.muted
      locked: true
    valueSize:
      token: font.size.sm
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    partGap:
      token: space.1
      description: Vertical gap between the label row and the track.
      locked: false
    labelGap:
      token: space.2
      description: Horizontal gap between the label and the value text in the label
        row.
      locked: false
    transition:
      token: motion.duration.base
      description: Fill width change, with motion.easing.standard; instant under reduced
        motion.
      locked: false
  a11y:
    role: meter
    requires:
    - accessible-name
    - contrast-aa
    - reduced-motion
    contrast:
    - foreground: color.status.{tone}.icon
      background: color.background.strong
      level: AA
      large: true
    - foreground: color.status.{tone}.icon
      background: color.background
      level: AA
      large: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=meter
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      notes: 'A <div role="meter"> per the APG rather than <meter>: the native element
        is inconsistently announced, hard to style across browsers, and cannot take
        our tone colors reliably. The label is a real element referenced by aria-labelledby;
        the track and fill are plain divs.'
    lit:
      tag: ds-meter
      reflect:
      - tone
      - value
      - min
      - max
      notes: The meter role is set on the inner element in the shadow root, labelled
        by the shadow label element. Numeric attributes reflect as strings; parse
        them. No events.
    rn:
      element: View
      props:
      - role=meter
      - accessibilityLabel
      - accessibilityValue
      notes: RN 0.73+ has role="meter" (react-native-web renders role=meter; iOS/Android
        map it to the nearest trait or a plain value). The container is `accessible`
        so label and value announce as one element, with accessibilityValue={{ min,
        max, now, text }} where text is valueText when given and omitted otherwise
        (the platform then reads the number). The fill animates in measured pixels
        from onLayout — a percentage width cannot be interpolated — and snaps on first
        layout and on resize.
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=combine
      - .accessibilityValue
      - GeometryReader
      - Rectangle
      - .accessibilityAddTraits=updatesFrequently
      notes: 'Label row (`Text`s) and a track `Rectangle` with the fill `Rectangle`
        sized by `GeometryReader` to the fraction, colors per the tone thresholds.
        One accessibility element (`.combine`) named by the label with `.accessibilityValue(formatValue(value))`;
        iOS has no meter role, so the value text carries min/max words from copy.
        No animation: a meter reflects a measurement.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `trackHeight`, `radius`, `labelSize`, `labelWeight`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `labelGap`, `transition`
Locked (accessibility-bearing, never overridable): `track`, `fill`, `labelColor`, `valueColor`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .accessibilityElement=combine
- .accessibilityValue
- GeometryReader
- Rectangle
- .accessibilityAddTraits=updatesFrequently
notes: 'Label row (`Text`s) and a track `Rectangle` with the fill `Rectangle` sized
  by `GeometryReader` to the fraction, colors per the tone thresholds. One accessibility
  element (`.combine`) named by the label with `.accessibilityValue(formatValue(value))`;
  iOS has no meter role, so the value text carries min/max words from copy. No animation:
  a meter reflects a measurement.'
```

## Guidance

## Overview

A meter shows how much of something there is against a known scale. Its shape is a bar because people read fullness at a glance, but its meaning is the number, which is why the label and value are always exposed to assistive technology and, by default, shown.

## When to use

Use a Meter for a measurement with a fixed range: storage or quota used, battery, password strength, a score out of ten, a budget consumed. Let the consumer decide the tone from thresholds it understands ("over 90% is `danger`"); the meter just paints. Provide `valueText` whenever the raw percentage is not what a person would say.

## When not to use

Do not use a Meter for the progress of a task — uploads, loading, multi-step flows — because progress moves toward completion and has different semantics; use ProgressBar (planned). Do not use it for a value without a meaningful range, or as a decorative bar chart; use a chart component. Do not use tone to encode a category (blue for A, green for B): tones mean status.

## Behavior

The fill width is `(value − min) / (max − min)` of the track, clamped to 0–100%; a non-finite `value` is treated as `min`. Changes to `value` animate the fill width over `transition`, instantly under reduced motion. Nothing is interactive; the meter has no focus, no events, and no hover. If `max ≤ min` the component renders an empty track, exposes `valuenow = min` with the given bounds, and warns in development.

## Content guidelines

Labels name the measurement as a noun phrase ("Storage used", "Password strength"). Value text is what a person would say aloud: "3.2 GB of 10 GB", "Strong", "7 of 10" — not "32%" unless percent is how people think about it. Never put instructions in the meter; if the user must act on the value, put an Alert or helper Text beside it.

## Accessibility

The meter exposes role `meter` with the current, minimum and maximum values, and a text alternative when `valueText` is set (WCAG 1.3.1, 4.1.2; APG meter). Its accessible name is the visible label (2.5.3). The fill meets 3:1 against both the track and the page background, so the filled portion is legible as a graphic (1.4.11); the build checks all four tones in both modes. The empty track is deliberately low-contrast: WCAG 1.4.11 exempts a boundary that is not needed to identify the component, and here the label and value text identify it — an empty meter reads as "0%" from its text, not from a faint bar. The tone is never the only signal — the value text is the primary information, and consumers that change tone at a threshold should say why in the value text ("9.5 GB of 10 GB"). Width animation respects reduced motion (2.3.3).

## Platform notes

### Web
Render a wrapper containing a label row (a `Text element="span"` with `id={labelId}` and, unless `hideValue`, a `<span>` with the value text in `valueColor`) and `<div role="meter" aria-labelledby={labelId} aria-valuenow aria-valuemin aria-valuemax aria-valuetext>` as the track, containing the fill `<div>` with `width: N%`. Use `overflow: hidden` and `radius` on the track so the fill clips to the rounded ends. Transition `width` over `transition`, wrapped in `@media (prefers-reduced-motion: no-preference)`.

### Lit
`<ds-meter label="Storage used" value="32" value-text="3.2 GB of 10 GB" tone="warning">` renders the same structure in its shadow root; `aria-labelledby` works within one shadow root. Reflect `tone`, `value`, `min` and `max` as attributes (numbers as strings; convert with `Number`). Expose no events.

### React Native
Render an `accessible` `View` with `role="meter"`, `accessibilityLabel={label}` and `accessibilityValue={{ min, max, now: clamped, text: valueText }}`, containing a label row of two `Text` elements and a track `View` with `overflow: 'hidden'` and the fill `View`. Measure the track with `onLayout` and animate the fill's pixel width with `Animated` over `transition` (`useNativeDriver: false` — layout properties, and react-native-web has no native driver), skipped when `useReducedMotion()` is true.

## Related

ProgressBar (planned), Alert, Text.

## Behavior scenarios (6)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-info
  given:
    tone: info
  then:
  - renders: true
  derived: true
- name: renders-tone-success
  given:
    tone: success
  then:
  - renders: true
  derived: true
- name: renders-tone-warning
  given:
    tone: warning
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
