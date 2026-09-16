# Generate: Slider for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Slider.swift` declaring `public struct Slider: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/SliderBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Slider.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Slider") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Slider")` on the root and `"Slider.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Slider
  category: input
  status: review
  apg: slider-multithumb
  anatomy:
  - label
  - track
  - fill
  - thumb
  - valueText
  - bubble
  - tickMarks
  - description
  - errorMessage
  composition:
    label: Text
    description: Text
    valueText: Text
  props:
    label:
      type: string
      required: true
      description: Visible label naming the quantity ("Volume", "Price range").
      a11y: aria-labelledby on each thumb; a range slider's thumbs are named "{label}
        minimum" / "{label} maximum" via copy.
    name:
      type: string
      required: true
      description: Field name for the Form. A range contributes `[min, max]`.
    min:
      type: number
      default: 0
      description: Lower bound.
    max:
      type: number
      default: 100
      description: Upper bound.
    step:
      type: number
      default: 1
      description: Arrow-key increment and snapping granularity for drag, click and
        keys.
    snapToMarks:
      type: boolean
      default: false
      description: With `marks`, snap drag and click to the marks instead of `step`
        (keys still move by step, PageUp/Down by mark).
    required:
      type: boolean
      default: false
      description: Must have a value other than the default to submit (`copy.required`).
    invalid:
      type: boolean
      default: false
      description: Marks the slider invalid (`copy.invalid` when no `error`).
    value:
      type: union
      description: Controlled value; for a range, a two-number array.
      shape: number | [number, number]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial value (or pair). Defaults to `min` (or `[min, max]`).
      shape: number | [number, number]
    range:
      type: boolean
      default: false
      description: Two thumbs choosing a minimum and a maximum; the thumbs cannot
        cross.
    formatValue:
      type: function
      shape: '(value: number) => string'
      description: Renders the displayed and announced value ("$40", "3 h 20 min").
        Defaults to the number.
    showValue:
      type: enum
      values:
      - always
      - hover
      - never
      default: always
      description: 'Where the value text appears: always beside the label, only while
        dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput
        beside the slider shows it).'
    marks:
      type: array
      shape: '{ value: number; label?: string }[]'
      description: Tick marks on the track, optionally labelled. Values snap to marks
        when `step` is omitted.
    disabled:
      type: boolean
      default: false
      description: Not adjustable, still readable.
    description:
      type: string
      description: Helper text.
    error:
      type: string
      description: Error message.
  events:
    onChange:
      description: Fired on every value change while dragging or with keys (number
        or pair).
      platforms:
        web: onChange
        lit: change
        rn: onValueChange
        swiftui: onChange
      payload:
      - name: value
        type: union
        shape: number | [number, number]
        description: The new value, or the low and high values of a range.
      fires:
      - user
    onChangeEnd:
      description: Fired once when the interaction ends (pointer up, key released).
        Use for expensive effects.
      platforms:
        web: onChangeEnd
        lit: change-end
        rn: onSlidingComplete
        swiftui: onChangeEnd
      payload:
      - name: value
        type: union
        shape: number | [number, number]
        description: The final value, or the low and high values of a range.
      fires:
      - user
      timing:
        phase: commit
  keyboard:
  - keys:
    - ArrowRight
    - ArrowUp
    action: Increases by `step`.
    from: first
    expect: manual
  - keys:
    - ArrowLeft
    - ArrowDown
    action: Decreases by `step`.
    from: first
    expect: manual
  - keys:
    - PageUp
    - PageDown
    action: Changes by ten steps (or to the next mark).
    from: first
    expect: manual
  - keys:
    - Home
    action: Sets the minimum.
    from: first
    expect: manual
  - keys:
    - End
    action: Sets the maximum.
    from: first
    expect: manual
  - keys:
    - Tab
    action: Moves between the two thumbs of a range slider; each thumb is a tab stop.
    when: range
    from: first
    expect: focus-next
  styles:
    track:
      token: color.background.strong
      part: track
      locked: false
    fill:
      token: color.control.selectedBackground
      part: fill
      locked: true
    trackHeight:
      token: space.1
      part: track
      locked: false
    trackRadius:
      token: radius.full
      part: track
      locked: false
    thumb:
      token: color.control.background
      part: thumb
      locked: false
    thumbBorder:
      token: color.control.selectedBackground
      part: thumb
      locked: true
    thumbBorderWidth:
      token: border.width.focus
      part: thumb
      locked: true
    thumbSize:
      token: space.5
      part: thumb
      locked: false
    thumbShadow:
      token: shadow.raised
      part: thumb
      locked: false
    thumbActiveScale:
      token: opacity.disabled
      part: thumb
      description: Not a scale — the pressed thumb shows a halo of the fill color
        at this opacity, thumbSize larger on each side (space.2). No literal scale
        factor exists.
      locked: false
    mark:
      token: color.border.strong
      locked: false
    markSize:
      token: space.1
      locked: false
    markLabelColor:
      token: color.foreground.muted
      locked: true
    markLabelSize:
      token: font.size.xs
      locked: false
    valueColor:
      token: color.foreground
      locked: true
    valueSize:
      token: font.size.sm
      locked: false
    bubbleSurface:
      token: color.inverse.surface
      part: bubble
      description: The hover/drag value bubble uses the inverse surface, like Tooltip.
      locked: true
    bubbleText:
      token: color.inverse.foreground
      part: bubble
      locked: true
    bubbleRadius:
      token: radius.sm
      part: bubble
      description: 'The bubble is its own part (not the valueText Text): an inverse-surface
        pill above the active thumb.'
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      locked: false
    partGap:
      token: space.1
      locked: false
    trackPaddingBlock:
      token: space.3
      part: track
      description: Vertical space around the track so the thumb and its halo have
        room and the touch target reaches the comfortable size.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    helperSize:
      token: font.size.sm
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      locked: true
    errorText:
      token: color.foreground.danger
      locked: false
    minTarget:
      token: size.target.comfortable
      description: The thumb's hit area.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      description: Halo and bubble appearance; the thumb itself follows the pointer
        with no transition.
      locked: false
  copy:
    minimumLabel: '{label} minimum'
    maximumLabel: '{label} maximum'
    rangeText:
      text: '{low} – {high}'
      params:
        low:
          type: string
          description: The lower thumb's value as formatValue renders it.
        high:
          type: string
          description: The upper thumb's value as formatValue renders it.
    required: '{label} is required.'
    invalid: '{label} is not valid.'
  a11y:
    role: slider
    requires:
    - accessible-name
    - label-association
    - keyboard-operable
    - arrow-navigation
    - focus-visible
    - contrast-aa
    - target-44px
    - gesture-alternative
    - error-identification
    - reduced-motion
    contrast:
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.inverse.foreground
      background: color.inverse.surface
      level: AA
  form:
    role: field
    value: value
    valueType: number-range
    name: name
    validation:
    - required
    - invalid
    messages:
      required: required
      invalid: invalid
    discovery: context
  platforms:
    web:
      element: div
      attributes:
      - role=slider
      - tabindex=0
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      - aria-describedby
      - aria-orientation
      - aria-disabled
      notes: Custom thumbs (<div role="slider" tabindex="0">) on a track rather than
        <input type="range">, because a range slider needs two thumbs on one track
        and the native element cannot be themed consistently. Pointer Events with
        setPointerCapture on the track and thumbs; the track click moves the nearest
        thumb. aria-valuetext from formatValue. A hidden <input name> (two for a range)
        carries the value for native forms.
    lit:
      tag: ds-slider
      reflect:
      - range
      - disabled
      - show-value
      notes: Form-associated (FormData with two entries for a range). Composed `change`
        (detail { value }) and `change-end`. Thumbs are shadow elements with role="slider".
    rn:
      element: View
      props:
      - accessibilityRole=adjustable
      - accessibilityLabel
      - accessibilityValue
      - accessibilityActions
      - onAccessibilityAction
      notes: 'Drawn with Views and a PanResponder per thumb (no new dependency; the
        community Slider has no range support and would not take tokens). accessibilityRole="adjustable"
        with accessibilityActions increment/decrement handled in onAccessibilityAction
        (VoiceOver swipe up/down, TalkBack volume keys), accessibilityValue={{ min,
        max, now, text }}. A range renders two adjustable elements. The drag gesture
        is additive: the adjustable actions are the non-gesture path.'
    swiftui:
      element: ZStack
      props:
      - GeometryReader
      - DragGesture
      - .accessibilityAdjustableAction
      - .accessibilityValue
      - .accessibilityElement
      - .focusable
      - .onMoveCommand
      - .onKeyPress
      - '@FocusState'
      - Capsule
      notes: Drawn from the tokens (track `Capsule`, fill, thumb `Circle`s) with a
        `DragGesture` per thumb in a `GeometryReader` — not SwiftUI's `Slider` (single
        value, untinted thumb). Each thumb is an accessibility element (`.accessibilityLabel(thumbLabel)`,
        `.accessibilityValue(formatValue)`, `.accessibilityAdjustableAction` stepping
        by `step`, Shift-step = `largeStep` via the increment/decrement with `.accessibilityAdjustableAction`'s
        direction only — the large step is a separate custom action); on iPad each
        thumb is `.focusable()` and arrows/PageUp/PageDown/Home/End follow the keyboard
        table. Range mode keeps thumbs ordered and swaps focus at the crossover. Marks
        and the value bubble per the doc; ticks from the tokens.
  behavior:
  - name: arrow-increases-by-one-step
    description: Arrow keys move by step, so the keyboard gets the precision the pointer
      gets by drag.
    given:
      defaultValue: 50
      step: 5
    when:
      key: ArrowRight
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: arrow-decreases-by-one-step
    given:
      defaultValue: 50
      step: 5
    when:
      key: ArrowLeft
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: page-up-changes-by-ten-steps
    given:
      defaultValue: 50
    when:
      key: PageUp
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: home-sets-the-minimum
    given:
      defaultValue: 50
      min: 0
      max: 100
    when:
      key: Home
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: end-sets-the-maximum
    given:
      defaultValue: 50
      min: 0
      max: 100
    when:
      key: End
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: a-key-press-is-a-complete-interaction
    description: onChangeEnd fires once when the interaction ends (pointer up, key
      released), for expensive effects.
    given:
      defaultValue: 50
    when:
      key: ArrowRight
    then:
    - event: onChangeEnd
    platforms:
    - web
    - lit
  - name: a-disabled-slider-does-not-move
    given:
      disabled: true
      defaultValue: 50
    when:
      key: ArrowRight
    then:
    - event: onChange
      fired: false
    platforms:
    - web
    - lit
  - name: the-thumb-reports-its-value-and-bounds
    description: The thumb carries valuenow/min/max, so a screen reader hears where
      the value sits on the scale.
    given:
      defaultValue: 4
      min: 0
      max: 10
    then:
    - attribute: aria-valuenow
      is: '4'
    - attribute: aria-valuemin
      is: '0'
    - attribute: aria-valuemax
      is: '10'
    platforms:
    - web
  - name: the-thumb-is-the-slider
    description: The thumb is the slider element, not the track - that is what takes
      focus and carries the value.
    then:
    - role: slider
    platforms:
    - web
    - lit
    - swiftui
  - name: invalid-renders-the-invalid-copy
    description: invalid marks the slider invalid and renders copy.invalid when there
      is no error.
    given:
      invalid: true
    then:
    - copy: invalid
  examples:
  - name: volume
    description: The everyday single-value slider, its value shown beside the label.
    given:
      label: Volume
      name: volume
      defaultValue: 30
  - name: price-range
    description: Two thumbs choosing a minimum and a maximum that cannot cross.
    given:
      label: Price range
      name: price
      range: true
      defaultValue:
      - 20
      - 80
  - name: effort-with-marks
    description: A short labelled scale that snaps to its marks.
    given:
      label: Effort
      name: effort
      min: 1
      max: 5
      marks:
      - value: 1
        label: Low
      - value: 3
        label: Medium
      - value: 5
        label: High
      snapToMarks: true
  - name: paired-with-a-number-input
    description: A zoom control whose value is shown by a NumberInput beside it, so
      the slider shows none.
    given:
      label: Zoom
      name: zoom
      min: 50
      max: 200
      step: 10
      defaultValue: 100
      showValue: never
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: number | [number, number]`
  - fires on: user
- `onChangeEnd`: emit `onChangeEnd`
  - payload, positional, in this order: `value: number | [number, number]`
  - fires on: user
  - timing: commit

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Style bindings

- `track`: token `color.background.strong`; part `track`
- `fill`: token `color.control.selectedBackground`; part `fill`; locked
- `trackHeight`: token `space.1`; part `track`
- `trackRadius`: token `radius.full`; part `track`
- `thumb`: token `color.control.background`; part `thumb`
- `thumbBorder`: token `color.control.selectedBackground`; part `thumb`; locked
- `thumbBorderWidth`: token `border.width.focus`; part `thumb`; locked
- `thumbSize`: token `space.5`; part `thumb`
- `thumbShadow`: token `shadow.raised`; part `thumb`
- `thumbActiveScale`: token `opacity.disabled`; part `thumb`
- `bubbleSurface`: token `color.inverse.surface`; part `bubble`; locked
- `bubbleText`: token `color.inverse.foreground`; part `bubble`; locked
- `bubbleRadius`: token `radius.sm`; part `bubble`
- `labelWeight`: token `font.weight.medium`; part `label`
- `trackPaddingBlock`: token `space.3`; part `track`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: number-range
  name: name
  validation:
  - required
  - invalid
  messages:
    required: required
    invalid: invalid
  discovery: context
```

## Copy

- `minimumLabel`: "{label} minimum"
- `maximumLabel`: "{label} maximum"
- `rangeText`: "{low} – {high}"; params `low` (string), `high` (string)
- `required`: "{label} is required."
- `invalid`: "{label} is not valid."

## Constants and examples

- example `volume`, story `Volume`: given `label: "Volume"`, `name: "volume"`, `defaultValue: 30`; The everyday single-value slider, its value shown beside the label.
- example `price-range`, story `PriceRange`: given `label: "Price range"`, `name: "price"`, `range: true`, `defaultValue: [20,80]`; Two thumbs choosing a minimum and a maximum that cannot cross.
- example `effort-with-marks`, story `EffortWithMarks`: given `label: "Effort"`, `name: "effort"`, `min: 1`, `max: 5`, `marks: [{"value":1,"label":"Low"},{"value":3,"label":"Medium"},{"value":5,"label":"High"}]`, `snapToMarks: true`; A short labelled scale that snaps to its marks.
- example `paired-with-a-number-input`, story `PairedWithANumberInput`: given `label: "Zoom"`, `name: "zoom"`, `min: 50`, `max: 200`, `step: 10`, `defaultValue: 100`, `showValue: "never"`; A zoom control whose value is shown by a NumberInput beside it, so the slider shows none.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `track`, `trackHeight`, `trackRadius`, `thumb`, `thumbSize`, `thumbShadow`, `thumbActiveScale`, `mark`, `markSize`, `markLabelSize`, `valueSize`, `bubbleRadius`, `labelWeight`, `partGap`, `trackPaddingBlock`, `fontFamily`, `fontSize`, `helperSize`, `errorText`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `fill`, `thumbBorder`, `thumbBorderWidth`, `markLabelColor`, `valueColor`, `bubbleSurface`, `bubbleText`, `descriptionText`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: ZStack
props:
- GeometryReader
- DragGesture
- .accessibilityAdjustableAction
- .accessibilityValue
- .accessibilityElement
- .focusable
- .onMoveCommand
- .onKeyPress
- '@FocusState'
- Capsule
notes: "Drawn from the tokens (track `Capsule`, fill, thumb `Circle`s) with a `DragGesture`\
  \ per thumb in a `GeometryReader` \u2014 not SwiftUI's `Slider` (single value, untinted\
  \ thumb). Each thumb is an accessibility element (`.accessibilityLabel(thumbLabel)`,\
  \ `.accessibilityValue(formatValue)`, `.accessibilityAdjustableAction` stepping\
  \ by `step`, Shift-step = `largeStep` via the increment/decrement with `.accessibilityAdjustableAction`'s\
  \ direction only \u2014 the large step is a separate custom action); on iPad each\
  \ thumb is `.focusable()` and arrows/PageUp/PageDown/Home/End follow the keyboard\
  \ table. Range mode keeps thumbs ordered and swaps focus at the crossover. Marks\
  \ and the value bubble per the doc; ticks from the tokens."
```

## Guidance

## Overview

A slider is for values you feel rather than type: volume, brightness, a price range, a zoom level. Its thumb sits on the value, the fill shows how much, and arrow keys move it by exact steps so keyboard and screen-reader users get the same precision the pointer gets by drag.

## When to use

Use a Slider for a bounded numeric value where approximate is fine and immediate feedback matters, and where the scale has meaning across its whole width. Use `range` for "between" filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it with a NumberInput (`showValue: never`) when exact entry also matters.

## When not to use

Do not use a Slider for a value that must be exact or is usually typed (quantity, age): use NumberInput. Do not use it for more than about a hundred steps without marks or a paired input — fine control by drag is poor. Do not use it for two or three discrete choices (SegmentedControl). Do not use a vertical slider unless the metaphor is vertical (volume in a mixer); horizontal is the default and the only orientation in this version.

## Behavior

Dragging a thumb, or clicking the track, sets the value snapped to `step` (or to marks); arrow keys move by `step`, PageUp/Down by ten steps, Home/End to the bounds. `onChange` fires continuously; `onChangeEnd` once per interaction. In a `range`, each thumb is its own tab stop, the thumbs cannot cross (the lower is clamped to the upper and vice versa), and the value is `[min, max]`. The value text shows per `showValue`; the drag bubble follows the active thumb. `disabled` sliders are readable and focusable but inert. A range's beside-label text is `copy.rangeText`; each thumb's `aria-valuemin`/`aria-valuemax` reflect the live constraint from the other thumb. Pointer math is logical (mirrored in right-to-left). The Keyboard story renders the range form (two thumbs are the whole model; the three-focusable rule does not apply). The Form value is a number, or `[low, high]` for a range.

## Content guidelines

The label names the quantity, not the control ("Volume", not "Volume slider"). `formatValue` should produce what a person would say, with units ("$40", "70%"). Mark labels are short ("Min", "1 h", "Max"). A range's thumbs are named from `copy.minimumLabel` / `copy.maximumLabel`.

## Accessibility

Each thumb is a `slider` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` from `formatValue`, named by the label (WCAG 4.1.2; APG slider and multi-thumb slider). Keyboard operation covers every value the pointer can reach (2.1.1), and on native the `adjustable` role with increment/decrement actions replaces the drag (2.5.1 gesture-alternative). Thumbs reach 44px (2.5.8) and the fill and thumb border meet 3:1 against the page (1.4.11). The fill is not checked against the track: the thumb position and the value text carry the state, and the track is a passive rail (the same 1.4.11 exemption Meter uses), so the fill-on-track ratio in dark mode (about 2.2:1) is acceptable. The value is always available as text, never as position alone (1.3.3). Motion is limited to the halo and bubble and respects reduced motion.

## Platform notes

### Web
Render the label row (label `Text` with id, and the value `Text` when `showValue: always`), the track `<div>` with the fill `<div>` sized from the value(s), marks as `<span aria-hidden>` with optional labels, and one or two `<div role="slider" tabindex="0" aria-valuenow aria-valuemin aria-valuemax aria-valuetext aria-labelledby aria-orientation="horizontal">` thumbs positioned by percentage. Pointer Events: `pointerdown` on the track picks the nearest thumb and captures the pointer; `pointermove` maps clientX to a snapped value. Keydown on a thumb implements the table. Hidden inputs carry the value(s). The bubble is a portal-free absolutely positioned element above the active thumb.

### Lit
`<ds-slider label="Price range" name="price" range min="0" max="500" step="10">`; form-associated; thumbs in the shadow root; composed `change` and `change-end`.

### React Native
`View` track with `PanResponder` per thumb; each thumb `View` has `accessible`, `accessibilityRole="adjustable"`, `accessibilityLabel`, `accessibilityValue={{ min, max, now, text }}`, `accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}` and `onAccessibilityAction` applying `step`. `onSlidingComplete` maps to `onChangeEnd`. The bubble is a `View` above the active thumb. Form registration as Input; a range registers one field with the pair.

## Related

NumberInput, Meter, Input, SegmentedControl.

## Behavior scenarios (9)

One test per scenario, in this order.

```yaml
- name: the-thumb-is-the-slider
  description: The thumb is the slider element, not the track - that is what takes
    focus and carries the value.
  then:
  - role: slider
  platforms:
  - web
  - lit
  - swiftui
- name: invalid-renders-the-invalid-copy
  description: invalid marks the slider invalid and renders copy.invalid when there
    is no error.
  given:
    invalid: true
  then:
  - copy: invalid
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-show-value-always
  given:
    showValue: always
  then:
  - renders: true
  derived: true
- name: renders-show-value-hover
  given:
    showValue: hover
  then:
  - renders: true
  derived: true
- name: renders-show-value-never
  given:
    showValue: never
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: control-is-focusable
  then:
  - focusable: true
  platforms:
  - lit
  - swiftui
  - web
  derived: true
- name: error-is-identified
  given:
    error: Fix this before continuing.
  then:
  - text: Fix this before continuing.
  derived: true
```
