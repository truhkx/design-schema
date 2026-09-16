# Generate: ProgressBar for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/ProgressBar.swift` declaring `public struct ProgressBar: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/ProgressBarBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+ProgressBar.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("ProgressBar") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("ProgressBar")` on the root and `"ProgressBar.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: ProgressBar
  category: feedback
  status: review
  anatomy:
  - container
  - label
  - valueText
  - track
  - fill
  composition:
    label: Text
    valueText: Text
  props:
    label:
      type: string
      required: true
      description: What is progressing ("Uploading photos", "Importing contacts").
        Visible unless `hideLabel`.
      a11y: The accessible name (aria-labelledby / accessibilityLabel).
    value:
      type: number
      description: Progress so far, between `min` and `max`. Omit for an indeterminate
        bar (the end is unknown).
    min:
      type: number
      default: 0
      description: Start of the range.
    max:
      type: number
      default: 100
      description: End of the range.
    formatValue:
      type: function
      shape: '(value: number, min: number, max: number) => string'
      description: Renders the value text ("42%", "3 of 12 files"). Defaults to a
        percentage.
    showValue:
      type: boolean
      default: true
      description: Show the value text beside the label. Ignored when indeterminate.
    hideLabel:
      type: boolean
      default: false
      description: Visually hide the label (it remains the accessible name). For bars
        inside a Card whose heading already says what is happening.
    tone:
      type: enum
      values:
      - neutral
      - success
      - danger
      default: neutral
      description: 'Neutral while running; `success` at completion, `danger` when
        the task failed part-way. Paired with a text status elsewhere: the color is
        never the only signal.'
    announce:
      type: enum
      values:
      - none
      - milestones
      - complete
      default: complete
      description: 'What a screen reader hears without focusing the bar: nothing,
        every 25%, or only completion. Each announcement uses `copy.progress` / `copy.complete`.'
  events: {}
  styles:
    track:
      token: color.background.strong
      locked: false
    fill:
      token: color.control.selectedBackground
      description: Neutral fill. The selected-control color is guaranteed 3:1 against
        the page.
      locked: true
    fillSuccess:
      token: color.status.success.icon
      locked: true
    fillDanger:
      token: color.status.danger.icon
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
    transition:
      token: motion.duration.base
      description: Fill width change with motion.easing.standard; instant under reduced
        motion.
      locked: false
    indeterminateLoop:
      token: motion.duration.loop
      description: 'The indeterminate sweep: a fill one third of the track width travelling
        start to end and repeating. Under reduced motion the fill is replaced by a
        static, half-opacity track (opacity.disabled) — no motion at all.'
      locked: false
  copy:
    progress: '{label}: {value}'
    complete: '{label}: complete'
    indeterminate: '{label}: in progress'
  a11y:
    role: progressbar
    requires:
    - accessible-name
    - contrast-aa
    - live-region
    - reduced-motion
    contrast:
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
    - foreground: color.status.success.icon
      background: color.background
      level: AA
      large: true
    - foreground: color.status.danger.icon
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
      - role=progressbar
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      - aria-busy
      notes: 'A <div role="progressbar"> with aria-valuenow/min/max and aria-valuetext
        from formatValue; an indeterminate bar omits aria-valuenow and sets aria-busy="true"
        on itself. Announcements go through a visually-hidden aria-live="polite" region
        next to the bar, updated per `announce`. Not <progress>: it cannot be themed
        consistently and its indeterminate animation ignores reduced motion in some
        browsers.'
    lit:
      tag: ds-progress-bar
      reflect:
      - tone
      - hide-label
      - announce
      notes: ElementInternals role="progressbar" with ariaValueNow/Min/Max/Text on
        the host; the live region is in the shadow root.
    rn:
      element: View
      props:
      - accessibilityRole=progressbar
      - accessibilityLabel
      - accessibilityValue
      notes: Drawn with Views (Animated.View width for the fill; the indeterminate
        sweep is an Animated loop that is not started under reduced motion). accessibilityValue={{
        min, max, now, text }}; announcements via AccessibilityInfo.announceForAccessibility
        per `announce`.
    swiftui:
      element: ProgressView
      props:
      - ProgressView
      - .progressViewStyle=custom
      - .accessibilityValue
      - .accessibilityLabel
      - AccessibilityNotification
      - TimelineView
      notes: '`ProgressView(value:total:)` with a package `ProgressViewStyle` drawing
        the track and fill from the tokens (indeterminate when `value` is nil: a sweep
        driven by `TimelineView`, replaced by the static half-opacity track under
        reduced motion). VoiceOver gets the label and `.accessibilityValue(formatValue)`
        from the style''s configuration; announcements per `announce` (milestones/complete/indeterminate
        copy) through `AccessibilityNotification.Announcement`. `tone` recolors the
        fill only.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `track`, `trackHeight`, `radius`, `labelSize`, `labelWeight`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `transition`, `indeterminateLoop`
Locked (accessibility-bearing, never overridable): `fill`, `fillSuccess`, `fillDanger`, `labelColor`, `valueColor`

## Platform notes (swiftui)

```yaml
element: ProgressView
props:
- ProgressView
- .progressViewStyle=custom
- .accessibilityValue
- .accessibilityLabel
- AccessibilityNotification
- TimelineView
notes: '`ProgressView(value:total:)` with a package `ProgressViewStyle` drawing the
  track and fill from the tokens (indeterminate when `value` is nil: a sweep driven
  by `TimelineView`, replaced by the static half-opacity track under reduced motion).
  VoiceOver gets the label and `.accessibilityValue(formatValue)` from the style''s
  configuration; announcements per `announce` (milestones/complete/indeterminate copy)
  through `AccessibilityNotification.Announcement`. `tone` recolors the fill only.'
```

## Guidance

## Overview

A progress bar answers "how much longer": it moves as the work moves, and it ends. If the value is a measurement that could go up or down — storage used, signal strength — it is a Meter, not a progress bar.

## When to use

Use a ProgressBar for a task the interface started and can see through to the end: uploads, downloads, imports, multi-step processing, a wizard's overall completion. Give it a `value` whenever the total is known; use the indeterminate form only until the total is known, then switch. Set `announce: milestones` for long tasks the user may leave and come back to; `complete` (the default) is right for anything under a minute.

## When not to use

Do not use it for a measured quantity (Meter), for a value the user sets (Slider), or for a brief wait of a second or two where a busy state on the Button that started it is enough. Do not use an indeterminate bar for longer than a few seconds without text saying what is happening. Do not stack several bars for one task; show the current step's bar and the overall step count in text.

## Behavior

The fill width follows `value` as a fraction of the range, animated over `transition`. Indeterminate bars sweep continuously and expose `aria-busy`. When `value` reaches `max` the bar stays full and, if `announce` is not `none`, `copy.complete` is announced once; milestones announce at 25/50/75/100. Changing `tone` to `success` or `danger` recolors the fill only — the containing view is responsible for the text that says the task finished or failed. The bar itself is never focusable. `copy.indeterminate` is announced once each time the bar becomes indeterminate. Milestone and completion announcements reset when the value moves backward (a retried task announces its milestones again). The live region is `role="status"` (plain attributes on Lit, not ElementInternals) and is not an anatomy part.

## Content guidelines

Labels name the task in progress with a verb ("Uploading 12 photos"), and the value text says how far in the units people think in — files, steps, or percent — via `formatValue`. When the task fails, keep the bar (at `danger`) and put the error in an Alert beside it, not in the bar's label.

## Accessibility

The bar is a `progressbar` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (WCAG 4.1.2; APG progressbar), named by its label even when the label is visually hidden. Because the bar is not focusable, screen-reader users only learn about progress through the live region, which is why `announce` exists and defaults to completion (4.1.3). Motion is the fill's width change and the indeterminate sweep; both stop under reduced motion (2.3.3). Tone is reinforced by text elsewhere, never color alone (1.4.1); the fill meets 3:1 against the page (1.4.11).

## Platform notes

### Web
Render the label row (`Text` with id; value `Text` when `showValue` and determinate), the track `<div>` and fill `<div>` with `inline-size` from the value, and the `role="progressbar"` on the track with `aria-labelledby`, `aria-valuenow/min/max/text` (omit `aria-valuenow` and set `aria-busy="true"` when indeterminate). A visually-hidden `<div aria-live="polite">` receives `copy.progress` at milestones or `copy.complete`. The indeterminate sweep is a CSS keyframe on the fill (`translateX` from -100% to 300% over `indeterminateLoop`), replaced under `prefers-reduced-motion` by a static fill at `opacity.disabled` covering the whole track.

### Lit
`<ds-progress-bar label="Uploading" value="42"></ds-progress-bar>`; `ElementInternals` role and aria values on the host; live region in the shadow root; `tone` reflected for styling.

### React Native
`View` track with an `Animated.View` fill whose width animates to the fraction (`useNativeDriver: false` for width; duration from `transition`, zero under reduced motion). Indeterminate: an `Animated.loop` translating a one-third-width fill, not started when `useReducedMotion()`; instead the fill is drawn full-width at `opacity.disabled`. `accessibilityRole="progressbar"`, `accessibilityValue`, and `AccessibilityInfo.announceForAccessibility` per `announce`.

## Related

Meter, Alert, Button, Toast.

## Behavior scenarios (8)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-neutral
  given:
    tone: neutral
  then:
  - renders: true
  derived: true
- name: renders-tone-success
  given:
    tone: success
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: renders-announce-none
  given:
    announce: none
  then:
  - renders: true
  derived: true
- name: renders-announce-milestones
  given:
    announce: milestones
  then:
  - renders: true
  derived: true
- name: renders-announce-complete
  given:
    announce: complete
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
