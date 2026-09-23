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
    label: { component: Text, props: { element: span, size: md, weight: medium, tone: default }, forwards: { labelWeight: fontWeight, fontSize: fontSize, fontFamily: fontFamily } }
    description: { component: Text, props: { element: span, size: sm, tone: muted }, forwards: { helperSize: fontSize, fontFamily: fontFamily } }
    valueText: { component: Text, props: { element: span, size: sm, tone: default }, forwards: { valueSize: fontSize, fontFamily: fontFamily } }
    errorMessage: { component: Text, props: { element: span, size: sm, tone: danger }, forwards: { helperSize: fontSize, fontFamily: fontFamily } }
  props:
    label:
      type: string
      a11yRole: accessible-name
      required: true
      description: Visible label naming the quantity ("Volume", "Price range").
      a11y: 'The label is a Text `<span>` with an id, not a native `<label for>` (which cannot name a `div role=slider`); a single thumb takes aria-labelledby pointing at it (on Lit the span is in the same shadow root, so the id reference holds). A range slider''s thumbs are named with aria-label (accessibilityLabel on native) set to the resolved `copy.minimumLabel` / `copy.maximumLabel`, with no hidden spans.'
    name:
      type: string
      required: true
      description: 'Field name for the Form. The form value types (web/rn FormContext, Lit DsFormField) have no number, so a single value registers as its decimal string (`String(value)`) and a range as two strings `[String(low), String(high)]`; native form submission gets one hidden input (web) or FormData entry (Lit) per string, all under this name. The registration id and the Form''s focus-on-error target is the thumb, the low thumb for a range (its first tab stop); a consumer-supplied `id` lands there too, and the high thumb carries no id.'
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
      description: 'Arrow-key increment and snapping granularity for drag, click and keys. The step grid is anchored at `min` (`min + round((raw - min) / step) * step`); when `(max - min)` is not a whole number of steps the last partial step still snaps to `max`, so the maximum is reachable by drag and click and not only by End.'
    snapToMarks:
      type: boolean
      default: false
      description: 'With `marks`, snap drag and click to the marks instead of `step` (arrow keys still move by step; PageUp/Down go to the next mark, and past the last mark to `max`/`min`). This is the only switch for mark snapping: omitting `step` changes nothing, since it defaults to 1. Set without any `marks` the flag is inert — drag and click fall back to the step grid and PageUp/Down to ten steps.'
    required:
      type: boolean
      default: false
      description: 'Must have a value other than the default to submit (`copy.required`). "The default" is `defaultValue` when set and otherwise what `value` itself falls back to — `min`, or `[min, max]` for a range — clamped to [min, max] before comparing, so required and value share one notion of it. For a range, a difference in either component of the pair satisfies it: moving one thumb is enough. The label takes no "(required)" suffix here: a slider always shows a value, so the suffix would say nothing about what is missing. Required is a validity flag (valueMissing, message `copy.required`) checked before invalid, but its message is not rendered standalone: the error region shows `error`, else the message a Form (or `validate`) has reported, else `copy.invalid` when `invalid`.'
    invalid:
      type: boolean
      default: false
      description: 'Marks the slider invalid (`copy.invalid` when no `error`). There is no invalid colour for the track: a slider has no text to recolour and no border of its own, so the state is carried by aria-invalid and the error message. `invalid` and `error` are independent: aria-invalid is true when either is set, and setting or clearing `error` never changes the `invalid` prop — so error identification is asserted on `aria-invalid="true"` on the thumb (the element carrying the role), never on the `invalid` prop.'
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
      description: 'Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. A mismatch between `range` and the shape of `value`/`defaultValue` (`range: true` with a number, or a pair without `range`) falls back silently to that mode''s default — `[min, max]` for a range, `min` for one thumb — with no development warning; only `max <= min` warns.'
    formatValue:
      type: function
      shape: '(value: number) => string'
      description: 'Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. `aria-valuetext` is always emitted, including in the default case where it repeats `aria-valuenow`.'
    showValue:
      type: enum
      values: [always, hover, never]
      default: always
      description: 'Where the value text appears: always beside the label, only while dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput beside the slider shows it). Despite its name, `hover` means pressed or focused: plain pointer hover does not show the bubble, and touch platforms behave identically. Any focus counts (not only :focus-visible), including focus a pointer press moves to the thumb; on React Native a core View reports focus only under react-native-web, so on a device the bubble is press-only. The bubble element exists only under `hover` — `always` shows the value beside the label and never a drag bubble. A range renders one bubble per thumb, each shown only while its own thumb is pressed or focused; every bubble is aria-hidden (active or not), since the thumb''s aria-valuetext already announces the same value, and the inactive one stays rendered at opacity 0 so `transition` can fade it. The bubble sizes to its content on one line, centred on the thumb; it is not constrained by the thumb''s hit area and may overflow it.'
    marks:
      type: array
      shape: '{ value: number; label?: string | undefined }[]'
      description: 'Tick marks on the track, optionally labelled. Values snap to marks only with `snapToMarks`. Generated code exports the entry type as `SliderMark`. The dots are the `tickMarks` part (aria-hidden): a layer on the track centre line inside the track area. The labels sit in an unparted aria-hidden row below the track area (see `markLabelGap`); each label is a Text (size xs, tone muted, element span) centred under its mark by a 50% offset (mirrored in right-to-left). There is no collision handling and no clamping at the ends: labels on close marks may overlap, and the labels at `min` and `max` hang past the track. Presses on the label row do not move a thumb — the label row and the mark label row paint above the thumbs and take the press, which is also how the overlap with a thumb''s `minTarget` hit area is resolved.'
    disabled:
      type: boolean
      default: false
      description: 'Not adjustable, still readable: thumbs stay focusable but pointer, keys and accessibility actions are ignored, and no value is submitted (on Lit `currentValue` is null while disabled). A slider disabled by an enclosing Form or Fieldset (Lit formDisabledCallback) behaves the same. On React Native the thumb View keeps `accessible` and sets accessibilityState.disabled.'
    description:
      type: string
      description: Helper text.
    error:
      type: string
      description: 'Error message. `error` is not in `form.validation`, so it is reported as a custom validity (web `setCustomValidity`, Lit `setValidity({ customError: true }, error)`) and blocks submission like the listed flags; the validity message follows the precedence `error`, then `copy.required`, then `copy.invalid`.'
  events:
    onChange:
      description: 'Fired on every value change while dragging or with keys (number or pair); only when the value actually changed, so a key at a bound or a click on the thumb fires nothing. Within one interaction the comparison is against the last value emitted, not the displayed value, so a controlled owner that never updates `value` gets each new target once; the displayed value resets from the prop on render.'
      platforms: { web: onChange, lit: change, rn: onValueChange, swiftui: onChange }
      payload:
        - { name: value, type: union, shape: 'number | [number, number]', description: 'The new value, or the low and high values of a range.' }
      fires: [user]
    onChangeEnd:
      description: Fired once when the interaction ends (pointer up, key released), and only if that interaction changed the value (End at max or a click on the thumb fires nothing). Use for expensive effects.
      platforms: { web: onChangeEnd, lit: change-end, rn: onSlidingComplete, swiftui: onChangeEnd }
      payload:
        - { name: value, type: union, shape: 'number | [number, number]', description: 'The final value, or the low and high values of a range.' }
      fires: [user]
      timing: { phase: commit }
  keyboard:
    - { keys: [ArrowRight, ArrowUp], action: 'Increases by `step`. ArrowRight is mirrored in a right-to-left layout (it decreases there), read from the thumb''s — on Lit the host''s — computed `direction` at keydown, as in Tabs and SegmentedControl; ArrowUp always increases.', from: first, expect: manual }
    - { keys: [ArrowLeft, ArrowDown], action: 'Decreases by `step`. ArrowLeft is mirrored in a right-to-left layout (it increases there); ArrowDown always decreases.', from: first, expect: manual }
    - { keys: [PageUp, PageDown], action: 'Changes by ten steps, clamped to the bounds (with `snapToMarks`, to the next mark, and to `max`/`min` past the last mark). Not mirrored in right-to-left.', from: first, expect: manual }
    - { keys: [Home], action: 'Sets the minimum — for a range thumb the live constraint from the other thumb, not `min`, so the action can never cross the thumbs.', from: first, expect: manual }
    - { keys: [End], action: 'Sets the maximum — for a range thumb the live constraint from the other thumb, not `max`.', from: first, expect: manual }
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
    thumbActiveScale: { token: opacity.disabled, part: thumb, description: 'Not a scale — the pressed thumb shows a circular halo of the fill color at this opacity, centred on the knob, with diameter thumbSize + 2 × haloSpread. No literal scale factor exists. Focus alone never shows it. On React Native, where there is no hover and no press state distinct from a drag, the halo shows while a gesture owns that thumb (including a track press that grabbed it).' }
    haloSpread: { token: space.2, part: thumb, description: 'How far the pressed-thumb halo extends beyond the knob on each side.' }
    mark: { token: color.border.strong, part: tickMarks, description: 'Mark dot colour.' }
    markSize: { token: space.2, part: tickMarks, description: 'Mark dot diameter. Deliberately larger than trackHeight so a mark reads as a tick standing proud of the rail rather than a bump on it.' }
    markLabelColor: { token: color.foreground.muted, part: tickMarks, description: 'Realised by the mark label Text''s tone muted; no hook of its own.' }
    markLabelSize: { token: font.size.xs, part: tickMarks, description: 'Forwarded to each mark label Text''s fontSize override (fontFamily is forwarded too); never styles the Text directly.' }
    markLabelGap: { token: space.1, part: tickMarks, description: 'Gap between the bottom of the track area (after trackPaddingBlock) and the mark label row; `partGap` does not apply between them (on React Native, a column wraps the track area and the label row with this gap). The slider grows by the label line (markLabelSize × font.lineHeight.normal) only when some mark has a label.' }
    valueColor: { token: color.foreground, part: valueText, description: 'Realised by the value Text''s tone default; no hook of its own.' }
    valueSize: { token: font.size.sm, part: valueText, description: 'Forwarded to the value Text''s fontSize override, and to the bubble''s Text the same way.' }
    bubbleSurface: { token: color.inverse.surface, part: bubble, description: 'The hover/drag value bubble uses the inverse surface, like Tooltip.' }
    bubbleText: { token: color.inverse.foreground, part: bubble, description: 'The bubble''s value is a Text (size sm, tone default) with valueSize forwarded. Its colour is not forwarded (Text color is locked): web and Lit re-scope `--color-foreground` on the bubble, React Native provides TextForegroundContext, as Text''s `color` binding describes.' }
    bubblePaddingBlock: { token: space.1, part: bubble }
    bubblePaddingInline: { token: space.2, part: bubble }
    bubbleOffset: { token: space.1, part: bubble, description: 'Gap between the bubble''s bottom edge and the top of the active thumb''s hit area (minTarget); the bubble is centred horizontally on the thumb.' }
    bubbleRadius: { token: radius.sm, part: bubble, description: 'The bubble''s corners, the same shape as a Tooltip. The bubble is its own part (not the valueText Text): an inverse-surface pill above the active thumb.' }
    labelWeight: { token: font.weight.medium, part: label, description: 'Forwarded to the label Text''s fontWeight override.' }
    partGap: { token: space.1, description: 'Vertical gap on the slider root between the label row, the track area, and the description/error message.' }
    labelGap: { token: space.2, part: label, description: 'Horizontal gap between the label and the value text in the label row.' }
    trackPaddingBlock: { token: space.3, part: track, description: 'Vertical space around the track so the thumb and its halo have room and the touch target reaches the comfortable size. It pads the track area, an unparted wrapper around the track and thumbs that is also the pointer hit area, never the coloured rail itself (padding the rail would thicken it).' }
    fontFamily: { token: font.family.body, part: label, description: 'Forwarded to every composed Text''s fontFamily override (label, value, bubble, mark labels, description, error); never styles them directly.' }
    fontSize: { token: font.size.md, part: label, description: 'Forwarded to the label Text''s fontSize override.' }
    helperSize: { token: font.size.sm, part: description, description: 'Forwarded to the description and error message Texts'' fontSize overrides.' }
    descriptionText: { token: color.foreground.muted, part: description, description: 'Realised by the composed Text''s `muted` tone; no hook of its own.' }
    errorText: { token: color.foreground.danger, part: errorMessage, locked: true, description: 'Realised by the composed Text''s `danger` tone; no hook of its own, since Text''s colour is locked and a hook could not reach the child without restyling it (the same as Input). Locked means absent from the overridable type, not accepted and ignored.' }
    minTarget: { token: size.target.comfortable, part: thumb, description: 'The thumb''s hit area, centred on the knob. It is taller than the track area (trackHeight + 2 × trackPaddingBlock) and is allowed to overflow it above and below rather than growing the row: nothing clips it, and the label row and mark label row paint above the thumbs and take any press that lands on them.' }
    focusRing: { token: color.border.focus, part: thumb, description: 'A circular ring around the visible knob (not the minTarget hit area), shown only while the thumb has keyboard focus.' }
    focusRingWidth: { token: border.width.focus, part: thumb, description: 'Ring thickness, drawn outside the knob''s border and offset from it by the same width.' }
    disabledOpacity: { token: opacity.disabled, description: 'Applied to the slider root (label row, track area, marks and messages) while disabled. The element that dims also carries `aria-disabled="true"` — the root as well as each thumb (on Lit the shadow-root wrapper, on React Native the root View beside `accessibilityState.disabled`) — so a contrast checker resolves the dimmed label and value text to an inactive component and applies the WCAG 1.4.3 exemption instead of reporting a failure. This holds for every component whose disabledOpacity dims text.' }
    transition: { token: motion.duration.fast, description: 'Halo (part thumb) and bubble (part bubble) appearance; the thumb itself follows the pointer with no transition.' }
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
    pageUpAction: 'Increase by a page'
    pageDownAction: 'Decrease by a page'
    homeAction: 'Set to minimum'
    endAction: 'Set to maximum'
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
      attributes: [role=slider, tabindex=0, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-labelledby, aria-describedby, aria-orientation, aria-disabled, aria-invalid, aria-required]
      notes: 'Custom thumbs (<div role="slider" tabindex="0">) on a track rather than <input type="range">, because a range slider needs two thumbs on one track and the native element cannot be themed consistently. Pointer Events with setPointerCapture on the track and thumbs; the track click moves the nearest thumb. aria-valuetext from formatValue. A hidden <input name> (two with the same name for a range) carries the decimal string(s) for native forms. The label, value, description and error Texts carry their own data-part, as the composition table says (no wrapper takes the part name); the error Text sits inside an unparted `<div role="alert">`, as on Lit. `copy.pageUpAction`, `pageDownAction`, `homeAction` and `endAction` are React Native action labels; web and Lit do not render them.'
    lit:
      tag: ds-slider
      reflect: [range, disabled, show-value, required, invalid, snap-to-marks]
      notes: 'Form-associated and implements DsFormField: `currentValue` is the decimal string, or `[low, high]` as two strings for a range, and setFormValue gets FormData with two entries of the same name for a range. Composed `change` (detail { value }, numbers) and `change-end`. Thumbs are shadow elements with role="slider"; the label ds-text and its id live in the same shadow root, so aria-labelledby resolves, and range thumbs use aria-label from the copy. `value` and `defaultValue` are unions no attribute converter can express, so both are `attribute: false` properties (`.value`, `.defaultValue`) with no attribute form — a plain-HTML author cannot set a starting value the way `default-value` allows on ds-number-input. A consumer''s `id` stays on the host and is never copied into the shadow root (ids do not cross shadow roots): the low thumb''s shadow id is always `thumb`, the high thumb carries none, and `focus()` reaches the low thumb through `delegatesFocus`. `formStateRestoreCallback` restores a single value from the one string and a range from the two same-name FormData entries, matching what setFormValue submits. The error message is a ds-text tone=danger carrying `part="errorMessage"` inside an unparted `<div role="alert">`, matching ds-input and ds-number-input. The Lit form contract has no interaction-end hook, so under `validate: blur` ds-slider is a plain `data-ds-field` and validates on focusout, not on pointer release.'
    rn:
      element: View
      props: [accessibilityRole=adjustable, accessibilityLabel, accessibilityHint, accessibilityValue, accessibilityActions, onAccessibilityAction]
      notes: 'Drawn with Views and a PanResponder per thumb (no new dependency; the community Slider has no range support and would not take tokens). accessibilityRole="adjustable" with accessibilityActions increment/decrement handled in onAccessibilityAction (VoiceOver swipe up/down, TalkBack volume keys), accessibilityValue={{ min, max, now, text }}. react-native-web (which the axe and Storybook gates render through) forwards neither the composite `accessibilityValue` nor `accessibilityState`, so every thumb writes both spellings: `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext` beside accessibilityValue, and `aria-disabled` beside accessibilityState.disabled. Any component on this platform whose role is `adjustable` (Slider, Splitter) does the same, or it ships a role with no exposed value. A range renders two adjustable elements. The drag gesture is additive: the adjustable actions are the non-gesture path. An accessibility action is an atomic interaction with no separate end, so each increment, decrement, pageUp, pageDown, home or end action fires onValueChange and then onSlidingComplete, both only if the value changed. PageUp, PageDown, Home and End have no native gesture, so they are custom accessibilityActions alongside increment and decrement (a core View has no hardware-key hook, so the keyboard table has no key handlers on native; the actions are its equivalent); only those two get a direct swipe or volume-key binding, and the rest live in the platform''s Actions menu, labelled from `copy.pageUpAction`, `copy.pageDownAction`, `copy.homeAction` and `copy.endAction` (increment and decrement take no label; the platform names them). Their `accessibilityActions` names are `pageUp`, `pageDown`, `home` and `end`, beside the standard `increment` and `decrement`. A press or drag on the track area moves the nearest thumb, as on web, except when the press lands inside a thumb''s own hit area: the thumb''s PanResponder claims the gesture first, so it drags from its current value instead of jumping to the press position; when both range thumbs share a value, a press before it moves the low thumb, after it the high thumb, and exactly on it the low thumb (every platform). Disabled thumbs stay `accessible` with accessibilityState.disabled, and gestures and actions are ignored. Form registration uses the decimal string, or two strings for a range. The composed Texts carry their testID on wrapper Views the Slider owns. Each thumb''s accessibilityHint is the error message when one shows, else the description, which ties them to the thumb (label-association); the visible description and error Texts stay in the reading order as well, so that text is heard twice — accepted, since neither carrier can be dropped without losing the association or the visible message.'
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
        - { event: onChange, with: 55 }
      platforms: [web, lit]
    - name: arrow-decreases-by-one-step
      given: { defaultValue: 50, step: 5 }
      when: { key: ArrowLeft }
      then:
        - { event: onChange, with: 45 }
      platforms: [web, lit]
    - name: page-up-changes-by-ten-steps
      given: { defaultValue: 50 }
      when: { key: PageUp }
      then:
        - { event: onChange, with: 60 }
      platforms: [web, lit]
    - name: home-sets-the-minimum
      given: { defaultValue: 50, min: 0, max: 100 }
      when: { key: Home }
      then:
        - { event: onChange, with: 0 }
      platforms: [web, lit]
    - name: end-sets-the-maximum
      given: { defaultValue: 50, min: 0, max: 100 }
      when: { key: End }
      then:
        - { event: onChange, with: 100 }
      platforms: [web, lit]
    - name: a-key-press-is-a-complete-interaction
      description: onChangeEnd fires once when the interaction ends (pointer up, key released), for expensive effects.
      given: { defaultValue: 50 }
      when: { key: ArrowRight }
      then:
        - { event: onChangeEnd, with: 51 }
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

Dragging a thumb, or clicking the track (every platform, including React Native), sets the value snapped to `step` (or to marks with `snapToMarks`); arrow keys move by `step`, PageUp/Down by ten steps (by mark with `snapToMarks`), Home/End to the bounds. `onChange` fires continuously; `onChangeEnd` once per interaction; neither fires when the value did not change. A pointer-driven control has no meaningful blur, so on every platform `validate: blur` validates when an interaction ends (pointer or drag release, key-up), not when a thumb loses focus. Under `validate: change`, and in any mode once the Form reports `submitFailed`, every committed change validates instead — Input's current idiom. In a `range`, each thumb is its own tab stop, the thumbs cannot cross (the lower is clamped to the upper and vice versa), and the value is `[min, max]`. The value text shows per `showValue`; the drag bubble follows the active thumb. `disabled` sliders are readable and focusable but inert. A range's beside-label text is `copy.rangeText`; each thumb's `aria-valuemin`/`aria-valuemax` reflect the live constraint from the other thumb. Pointer math is logical (mirrored in right-to-left). The Keyboard story renders the range form with the `price-range` example's args (`range: true`, `defaultValue: [20, 80]`); two thumbs are the whole model, so the three-focusable rule does not apply. Events carry numbers, but the Form value is the decimal string, or `[low, high]` as two strings for a range (see `name`). The error region shows `error`, else a Form-reported message, else `copy.invalid` when `invalid`; `copy.required` appears only once validation reports it.

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
`View` track with `PanResponder` per thumb; each thumb `View` has `accessible`, `accessibilityRole="adjustable"`, `accessibilityLabel`, `accessibilityValue={{ min, max, now, text }}`, `accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}` and `onAccessibilityAction` applying `step`. `onSlidingComplete` maps to `onChangeEnd`. The bubble is a `View` above the active thumb. Form registration as Input, with the decimal string; a range registers one field with the two strings. PageUp/PageDown/Home/End are extra custom actions labelled from copy.

## Related

NumberInput, Meter, Input, SegmentedControl.
