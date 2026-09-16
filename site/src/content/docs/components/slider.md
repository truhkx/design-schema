---
title: Slider
description: Picks a number (or a range between two thumbs) from a continuous scale by dragging or arrow keys — for values where "about this much" is the natural way to choose.
component:
  name: Slider
  category: input
  status: review
  apg: slider-multithumb
  anatomy: [label, track, fill, thumb, valueText, bubble, tickMarks, description, errorMessage]
  composition:
    label: Text
    description: Text
    valueText: Text
  props:
    label:
      type: string
      required: true
      description: Visible label naming the quantity ("Volume", "Price range").
      a11y: aria-labelledby on each thumb; a range slider's thumbs are named "{label} minimum" / "{label} maximum" via copy.
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
      description: Arrow-key increment and snapping granularity for drag, click and keys.
    snapToMarks:
      type: boolean
      default: false
      description: 'With `marks`, snap drag and click to the marks instead of `step` (keys still move by step, PageUp/Down by mark).'
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
      shape: 'number | [number, number]'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial value (or pair). Defaults to `min` (or `[min, max]`).
      shape: 'number | [number, number]'
    range:
      type: boolean
      default: false
      description: Two thumbs choosing a minimum and a maximum; the thumbs cannot cross.
    formatValue:
      type: function
      shape: '(value: number) => string'
      description: 'Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number.'
    showValue:
      type: enum
      values: [always, hover, never]
      default: always
      description: 'Where the value text appears: always beside the label, only while dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput beside the slider shows it).'
    marks:
      type: array
      shape: '{ value: number; label?: string }[]'
      description: Tick marks on the track, optionally labelled. Values snap to marks when `step` is omitted.
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
      description: Fired on every value change while dragging or with keys (number or pair).
      platforms: { web: onChange, lit: change, rn: onValueChange, swiftui: onChange }
      payload:
        - { name: value, type: union, shape: 'number | [number, number]', description: 'The new value, or the low and high values of a range.' }
      fires: [user]
    onChangeEnd:
      description: Fired once when the interaction ends (pointer up, key released). Use for expensive effects.
      platforms: { web: onChangeEnd, lit: change-end, rn: onSlidingComplete, swiftui: onChangeEnd }
      payload:
        - { name: value, type: union, shape: 'number | [number, number]', description: 'The final value, or the low and high values of a range.' }
      fires: [user]
      timing: { phase: commit }
  keyboard:
    - { keys: [ArrowRight, ArrowUp], action: Increases by `step`., from: first, expect: manual }
    - { keys: [ArrowLeft, ArrowDown], action: Decreases by `step`., from: first, expect: manual }
    - { keys: [PageUp, PageDown], action: Changes by ten steps (or to the next mark)., from: first, expect: manual }
    - { keys: [Home], action: Sets the minimum., from: first, expect: manual }
    - { keys: [End], action: Sets the maximum., from: first, expect: manual }
    - { keys: [Tab], action: Moves between the two thumbs of a range slider; each thumb is a tab stop., when: range, from: first, expect: focus-next }
  styles:
    track: { token: color.background.strong, part: track }
    fill: { token: color.control.selectedBackground, part: fill }
    trackHeight: { token: space.1, part: track }
    trackRadius: { token: radius.full, part: track }
    thumb: { token: color.control.background, part: thumb }
    thumbBorder: { token: color.control.selectedBackground, part: thumb }
    thumbBorderWidth: { token: border.width.focus, part: thumb }
    thumbSize: { token: space.5, part: thumb }
    thumbShadow: { token: shadow.raised, part: thumb }
    thumbActiveScale: { token: opacity.disabled, part: thumb, description: 'Not a scale — the pressed thumb shows a halo of the fill color at this opacity, thumbSize larger on each side (space.2). No literal scale factor exists.' }
    mark: { token: color.border.strong }
    markSize: { token: space.1 }
    markLabelColor: { token: color.foreground.muted }
    markLabelSize: { token: font.size.xs }
    valueColor: { token: color.foreground }
    valueSize: { token: font.size.sm }
    bubbleSurface: { token: color.inverse.surface, part: bubble, description: 'The hover/drag value bubble uses the inverse surface, like Tooltip.' }
    bubbleText: { token: color.inverse.foreground, part: bubble }
    bubbleRadius: { token: radius.sm, part: bubble, description: 'The bubble is its own part (not the valueText Text): an inverse-surface pill above the active thumb.' }
    labelWeight: { token: font.weight.medium, part: label }
    partGap: { token: space.1 }
    trackPaddingBlock: { token: space.3, part: track, description: 'Vertical space around the track so the thumb and its halo have room and the touch target reaches the comfortable size.' }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.md }
    helperSize: { token: font.size.sm }
    descriptionText: { token: color.foreground.muted, part: description }
    errorText: { token: color.foreground.danger }
    minTarget: { token: size.target.comfortable, description: 'The thumb''s hit area.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.fast, description: 'Halo and bubble appearance; the thumb itself follows the pointer with no transition.' }
  copy:
    minimumLabel: '{label} minimum'
    maximumLabel: '{label} maximum'
    rangeText:
      text: '{low} – {high}'
      params:
        low: { type: string, description: The lower thumb's value as formatValue renders it. }
        high: { type: string, description: The upper thumb's value as formatValue renders it. }
    required: '{label} is required.'
    invalid: '{label} is not valid.'
  a11y:
    role: slider
    requires: [accessible-name, label-association, keyboard-operable, arrow-navigation, focus-visible, contrast-aa, target-44px, gesture-alternative, error-identification, reduced-motion]
    contrast:
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.inverse.foreground, background: color.inverse.surface, level: AA }
  form:
    role: field
    value: value
    valueType: number-range
    name: name
    validation: [required, invalid]
    messages: { required: required, invalid: invalid }
    discovery: context
  platforms:
    web:
      element: div
      attributes: [role=slider, tabindex=0, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-labelledby, aria-describedby, aria-orientation, aria-disabled]
      notes: 'Custom thumbs (<div role="slider" tabindex="0">) on a track rather than <input type="range">, because a range slider needs two thumbs on one track and the native element cannot be themed consistently. Pointer Events with setPointerCapture on the track and thumbs; the track click moves the nearest thumb. aria-valuetext from formatValue. A hidden <input name> (two for a range) carries the value for native forms.'
    lit:
      tag: ds-slider
      reflect: [range, disabled, show-value]
      notes: 'Form-associated (FormData with two entries for a range). Composed `change` (detail { value }) and `change-end`. Thumbs are shadow elements with role="slider".'
    rn:
      element: View
      props: [accessibilityRole=adjustable, accessibilityLabel, accessibilityValue, accessibilityActions, onAccessibilityAction]
      notes: 'Drawn with Views and a PanResponder per thumb (no new dependency; the community Slider has no range support and would not take tokens). accessibilityRole="adjustable" with accessibilityActions increment/decrement handled in onAccessibilityAction (VoiceOver swipe up/down, TalkBack volume keys), accessibilityValue={{ min, max, now, text }}. A range renders two adjustable elements. The drag gesture is additive: the adjustable actions are the non-gesture path.'
    swiftui:
      element: ZStack
      props: [GeometryReader, DragGesture, .accessibilityAdjustableAction, .accessibilityValue, .accessibilityElement, .focusable, .onMoveCommand, .onKeyPress, '@FocusState', Capsule]
      notes: 'Drawn from the tokens (track `Capsule`, fill, thumb `Circle`s) with a `DragGesture` per thumb in a `GeometryReader` — not SwiftUI''s `Slider` (single value, untinted thumb). Each thumb is an accessibility element (`.accessibilityLabel(thumbLabel)`, `.accessibilityValue(formatValue)`, `.accessibilityAdjustableAction` stepping by `step`, Shift-step = `largeStep` via the increment/decrement with `.accessibilityAdjustableAction`''s direction only — the large step is a separate custom action); on iPad each thumb is `.focusable()` and arrows/PageUp/PageDown/Home/End follow the keyboard table. Range mode keeps thumbs ordered and swaps focus at the crossover. Marks and the value bubble per the doc; ticks from the tokens.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/focusable/error-identified ones from
    # the schema. A range slider renders two role=slider thumbs, which the single-element locator cannot
    # address, so range is covered by the examples and the keyboard gate.
    - name: arrow-increases-by-one-step
      description: Arrow keys move by step, so the keyboard gets the precision the pointer gets by drag.
      given: { defaultValue: 50, step: 5 }
      when: { key: ArrowRight }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: arrow-decreases-by-one-step
      given: { defaultValue: 50, step: 5 }
      when: { key: ArrowLeft }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: page-up-changes-by-ten-steps
      given: { defaultValue: 50 }
      when: { key: PageUp }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: home-sets-the-minimum
      given: { defaultValue: 50, min: 0, max: 100 }
      when: { key: Home }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: end-sets-the-maximum
      given: { defaultValue: 50, min: 0, max: 100 }
      when: { key: End }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: a-key-press-is-a-complete-interaction
      description: onChangeEnd fires once when the interaction ends (pointer up, key released), for expensive effects.
      given: { defaultValue: 50 }
      when: { key: ArrowRight }
      then:
        - { event: onChangeEnd }
      platforms: [web, lit]
    - name: a-disabled-slider-does-not-move
      given: { disabled: true, defaultValue: 50 }
      when: { key: ArrowRight }
      then:
        - { event: onChange, fired: false }
      platforms: [web, lit]
    - name: the-thumb-reports-its-value-and-bounds
      description: The thumb carries valuenow/min/max, so a screen reader hears where the value sits on the scale.
      given: { defaultValue: 4, min: 0, max: 10 }
      then:
        - { attribute: aria-valuenow, is: '4' }
        - { attribute: aria-valuemin, is: '0' }
        - { attribute: aria-valuemax, is: '10' }
      platforms: [web]
    - name: the-thumb-is-the-slider
      description: The thumb is the slider element, not the track - that is what takes focus and carries the value.
      then:
        - { role: slider }
      platforms: [web, lit, swiftui]
    - name: invalid-renders-the-invalid-copy
      description: invalid marks the slider invalid and renders copy.invalid when there is no error.
      given: { invalid: true }
      then:
        - { copy: invalid }
  examples:
    - name: volume
      description: The everyday single-value slider, its value shown beside the label.
      given: { label: Volume, name: volume, defaultValue: 30 }
    - name: price-range
      description: Two thumbs choosing a minimum and a maximum that cannot cross.
      given: { label: Price range, name: price, range: true, defaultValue: [20, 80] }
    - name: effort-with-marks
      description: A short labelled scale that snaps to its marks.
      given: { label: Effort, name: effort, min: 1, max: 5, marks: [{ value: 1, label: Low }, { value: 3, label: Medium }, { value: 5, label: High }], snapToMarks: true }
    - name: paired-with-a-number-input
      description: A zoom control whose value is shown by a NumberInput beside it, so the slider shows none.
      given: { label: Zoom, name: zoom, min: 50, max: 200, step: 10, defaultValue: 100, showValue: never }
---

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
