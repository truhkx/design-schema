---
title: SegmentedControl
description: A compact row of two to five mutually exclusive options that applies immediately — a mode or view switch, not a form field. A RadioGroup in a toolbar's clothing.
component:
  name: SegmentedControl
  category: input
  status: review
  apg: radio
  anatomy: [group, segment, segmentLabel, segmentIcon, tooltip, indicator]
  composition:
    tooltip: Tooltip
    segmentIcon: Icon
  props:
    label:
      type: string
      a11yRole: accessible-name
      required: true
      description: 'Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context. Lit, where an attribute can be absent, defaults the property to an empty string and warns in development when it is empty; React and React Native rely on the required type and do not warn, even for an empty string.'
    options:
      type: array
      required: true
      shape: '{ value: string; label: string; icon?: IconName | undefined; disabled?: boolean | undefined }[]'
      description: 'Two to five options (guidance, not enforced: any count renders, with no warning). An empty array is a documented no-op: an empty group renders with no tab stop and no pill, keys are ignored, and nothing warns. Labels are one word; with `iconOnly` the label becomes the accessible name. The icon is an Icon whose `size` is the control''s `size` (`sm` or `md`), on every platform, and whose colour is its segment''s own — `segmentColor`, or `segmentSelectedColor` when selected — forwarded as the Icon''s `overrides.color`, since there is no `currentColor` on native.'
    value:
      type: string
      description: Controlled selected value. Omit for uncontrolled.
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: 'Initially selected value. Defaults to the first enabled option — a segmented control always has a selection. A `value` or `defaultValue` is taken as given, never corrected: one naming a disabled option keeps that segment checked with the pill under it (arrows still skip it); one matching no option checks nothing and draws no pill (the pill is unmounted, and the next selection places it instantly rather than sliding it in). In both cases the tab stop is the first enabled segment, and arrows move from there when no segment has focus.'
    iconOnly:
      type: boolean
      default: false
      description: 'Show icons only (every option must have one); labels become accessible names and Tooltips, disabled segments included — an `aria-disabled` button still takes pointer events, so its label stays discoverable on hover. An option without `icon` warns in development once per instance (one message listing every option without an icon by its `value`, since that is the stable identifier; the wording itself is a development aid, not copy, so it is not contract) and that segment shows its label as text instead, at its natural width — no icon-sized box is reserved for it — so it never renders empty; that segment gets no Tooltip and no `aria-label`, since its visible text is its name.'
    size:
      type: enum
      enumRef: size
      values: [sm, md]
      default: md
      description: Toolbar (`sm`) or standard (`md`) height.
    fill:
      type: boolean
      default: false
      description: 'Stretch to the container width with equal segments. Off, the group hugs its segments rather than filling the container (React Native: `alignSelf: ''flex-start''`, which is what keeps `fill` from being a no-op there).'
  events:
    onChange:
      description: Fired when the selection changes, with the new value. The change takes effect immediately.
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: value, type: string, description: The value of the selected segment. }
      fires: [user]
      timing: { phase: after-change }
  keyboard:
    - { keys: [ArrowRight, ArrowDown], action: 'Moves to and selects the next enabled segment, wrapping.', from: first, expect: [focus-next, selects] }
    - { keys: [ArrowLeft, ArrowUp], action: 'Moves to and selects the previous enabled segment, wrapping.', from: last, expect: [focus-prev, selects] }
    - { keys: [ArrowRight], action: From the last segment wraps to the first., from: last, expect: focus-wraps-to-first }
    - { keys: [Home], action: 'Moves to and selects the first enabled segment — this control always has a selection, so Home and End select as the arrows do.', from: last, expect: focus-first }
    - { keys: [End], action: 'Moves to and selects the last enabled segment.', from: first, expect: focus-last }
    - { keys: [' ', Enter], action: 'Selects the focused segment. Each segment is a native button (web and Lit), so this is its own activation — the component adds no handler and nothing else is bound to these keys.', from: first, expect: manual, native: true }
  styles:
    groupBackground: { token: color.background.strong, part: group }
    groupPadding: { token: space.1, part: group }
    groupRadius: { token: radius.md, part: group }
    segmentColor: { token: color.foreground.muted, part: segment }
    segmentSelectedColor: { token: color.foreground.strong, part: segment }
    segmentSelectedBackground: { token: color.background, part: indicator, description: 'The raised pill under the selected segment — drawn on the `indicator` part, never on the segment itself.' }
    segmentShadow: { token: shadow.raised, part: indicator, description: 'The pill''s shadow. The one binding here whose token resolves to an object rather than a scalar: on React Native it expands into the shadow style keys (shadowColor, shadowOffset, shadowRadius, elevation), which are spread into the pill''s style, and an override is resolved the same way.' }
    segmentRadius: { token: radius.sm, part: indicator, description: 'The pill''s corners; the segment''s focus ring uses the same radius.' }
    segmentPaddingInline: { token: space.md, part: segment }
    segmentPaddingBlock: { token: space.1, part: segment, description: Vertical padding at size md. }
    segmentGap: { token: layout.gap.tight, part: segment, description: 'Between icon and label inside a segment; no effect with `iconOnly`, where a segment has one child.' }
    segmentSpacing: { token: space.0, part: group, description: 'Between adjacent segments, applied as the group''s gap (never a segment margin): none — the pill slides under abutting segments.' }
    selectedWeight: { token: font.weight.semibold, part: segment, description: 'The selected segment''s label; unselected use fontWeight.' }
    paddingBlockSm: { token: space.1, part: segment, description: 'Vertical padding at size sm; md uses segmentPaddingBlock. The two are the same token on purpose, so `size` changes the height only through fontSize and its line box — and on React Native, where every segment reaches size.target.comfortable, not at all: there `size` changes the type and the intrinsic width only, which is the intended outcome. They stay two independent hooks all the same (an `sm` rule reads its own `--ds-segmented-control-padding-block-sm`), so overriding one never moves the other.' }
    fontFamily: { token: font.family.body, part: segment }
    fontSize: { token: 'font.size.{size}', part: segment }
    fontWeight: { token: font.weight.medium, part: segment }
    lineHeight: { token: font.lineHeight.normal, part: segment }
    minTarget: { token: size.target.min, part: segment, description: 'Each segment''s minimum, on both axes (min-inline-size and min-block-size), so a one-character label still makes a square-ish target. The one binding whose token resolves per platform: `size.target.min` on web and Lit, `size.target.comfortable` on React Native, which is touch and where every segment therefore reaches 44px. Web and Lit keep the smaller floor because no CSS query tells a touch screen from a hybrid laptop and guessing would shrink or grow the control for the wrong people.' }
    focusRing: { token: color.border.focus, part: segment }
    focusRingWidth: { token: border.width.focus, part: segment }
    transition: { token: motion.duration.fast, part: indicator, description: Pill movement; instant under reduced motion. }
    disabledOpacity: { token: opacity.disabled, part: segment, description: 'The `segment` part only: a checked-but-disabled option keeps a full-opacity pill under a faded label, since the pill is the `indicator` part and the selection it marks is still true.' }
  a11y:
    role: radiogroup
    requires: [accessible-name, selected-state, arrow-navigation, roving-tabindex, keyboard-operable, focus-visible, contrast-aa, target-24px, reduced-motion]
    contrast:
      - { foreground: color.foreground.muted, background: color.background.strong, level: AA }
      - { foreground: color.foreground.strong, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=radiogroup, aria-label, role=radio, aria-checked, aria-disabled, tabindex]
      notes: 'A <div role="radiogroup" aria-label> of <button role="radio" aria-checked tabindex={0|-1}> — buttons rather than native radios because the control is not a form field and has no name/value to submit. Roving tabindex; arrows move AND select (radio semantics). The selected pill is an absolutely positioned `aria-hidden` element animated between segments. No FormContext registration and no `data-ds-field`. A disabled option is `aria-disabled="true"` with a guard in the click handler, never the native `disabled` attribute: a checked-but-disabled segment must stay reachable by assistive technology (and a test clicking it needs the click to land, which `disabled` would swallow). `iconOnly` segments carry `aria-label` = the option label themselves and are wrapped in Tooltip with `content` = the label, `describes: false`, and default placement and delay (Tooltip''s warm window already makes moving along the control instant); `aria-label` is the primary name, and while the tooltip is open its identical text wins as `aria-labelledby` — the redundancy is accepted, since Tooltip has no mode that neither labels nor describes. Tooltip attaches its own ref to the child it clones, so a wrapped segment cannot also hold one of this component''s: roving focus finds segments by their generated DOM id (`document.getElementById`), which assumes the control is rendered into the main document rather than a detached tree.'
    lit:
      tag: ds-segmented-control
      reflect: [value, size, fill, icon-only]
      notes: '`options` is a property; composed `change` with detail { value }. Not form-associated by design, and no `data-ds-field`. The pill is `aria-hidden`. `iconOnly` segments carry `aria-label` = the option label (the Tooltip''s aria-labelledby cannot cross the shadow root) inside `<ds-tooltip no-describes>` with `content` = the label and default placement and delay. `defaultValue` reads the `default-value` attribute and is not reflected. `reflect: value` means the `value` property only — the uncontrolled selection lives in internal state and is never written to the attribute, so an uncontrolled control renders with no `value` attribute even while a segment is checked, and the attribute stays the signal that the element is controlled. A disabled option is `aria-disabled="true"` with a click guard, as on web.'
    rn:
      element: View
      props: [accessibilityRole=radiogroup, accessibilityRole=radio, accessibilityState]
      notes: 'A View row of Pressables with accessibilityRole="radio" and accessibilityState={{ checked, disabled }}; the pill is an Animated.View hidden from assistive technology (accessibilityElementsHidden, importantForAccessibility="no-hide-descendants"), as Tabs hides its indicator. Its position comes from `onLayout`, which arrives after the first paint, so the first placement is instant — the pill appears under the selected segment rather than sliding in from the start of the row — and only later moves slide. Not registered with FormContext. Each segment is its own accessibility stop on native: iOS and Android deliver no key events to a View, so the keyboard table applies on react-native-web only (onKeyDown on the group), and the arrow scenarios are web and Lit only. react-native-web 0.21 forwards neither `accessibilityState` nor `focusable`, so on that platform the checked and disabled states are also written as real attributes — an `aria-checked` prop mirror, and `aria-disabled` plus the roving `tabindex` set on the node in an effect, since Pressable overwrites a passed-in `aria-disabled` from its own absent `disabled` prop. Without the mirrors every radio is missing `aria-checked` and a dimmed segment is not exempt from the contrast rule; without `tabindex` on the node the group silently becomes one tab stop per segment, which no gate catches. No Tooltip part on React Native: an `iconOnly` segment carries its label as `accessibilityLabel` with no `accessibilityHint` (it would repeat the name) and no long-press bubble, because a press already selects. The group View carries accessibilityRole="radiogroup", accessibilityLabel = `label` and testID `SegmentedControl` but is not `accessible` (that would merge the segments into one stop), so tests find it by testID and assert role and name rather than getByRole. iOS''s UISegmentedControl look is approximated with the tokens rather than used, so the theme applies.'
    swiftui:
      element: HStack
      props: [.accessibilityElement=contain, Button, .accessibilityAddTraits=isSelected, .focusable, .onMoveCommand, '@FocusState', matchedGeometryEffect]
      notes: 'Not `Picker(.segmented)` (untinted, unthemeable). An `HStack` of equal-width `Button`s in a `.contain` element named by `label`, the selected one `.isSelected` with the selected surface drawn through `matchedGeometryEffect` sliding over `transition` (no slide under reduced motion). Arrows on iPad move selection immediately (radio semantics), matching the keyboard table. `iconOnly` segments carry their label as the accessibility label.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    - name: click-selects-a-segment
      description: The click lands on the first segment (List), which is not the selected one.
      given: { options: [{ value: list, label: List }, { value: grid, label: Grid }], defaultValue: grid }
      when: { click: segment }
      then:
        - { event: onChange }
        - { event: onChange, with: list, platforms: [web, lit, rn] }
    - name: arrow-moves-and-selects
      description: 'Arrows move focus AND selection (radio semantics), per the keyboard table''s `selects`. Focus starts on the selected segment (the tab stop).'
      given: { options: [{ value: list, label: List }, { value: grid, label: Grid }], defaultValue: list }
      when: { key: ArrowRight }
      then:
        - { event: onChange }
        - { event: onChange, with: grid }
      platforms: [web, lit]
    - name: arrow-wraps-from-the-last-segment
      description: 'From the last segment ArrowRight wraps to the first, and selection follows. Focus starts on the selected segment (the tab stop).'
      given: { options: [{ value: list, label: List }, { value: grid, label: Grid }], defaultValue: grid }
      when: { key: ArrowRight }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: disabled-segment-is-not-selectable
      description: 'A press on a disabled segment selects nothing: the click lands on the first segment (List), which is the disabled one. Arrow skipping is covered by arrow-skips-disabled-segments.'
      given: { options: [{ value: list, label: List, disabled: true }, { value: grid, label: Grid }], defaultValue: grid }
      when: { click: segment }
      then:
        - { event: onChange, fired: false }
    - name: arrow-skips-disabled-segments
      description: 'From the selected first segment ArrowRight passes over the disabled middle one and selects the third.'
      given: { options: [{ value: list, label: List }, { value: grid, label: Grid, disabled: true }, { value: table, label: Table }], defaultValue: list }
      when: { key: ArrowRight }
      then:
        - { event: onChange }
        - { event: onChange, with: table }
      platforms: [web, lit]
    - name: end-selects-the-last-enabled-segment
      description: 'End moves to and selects the last enabled segment, like the arrows. Focus starts on the selected first segment (the tab stop); the last segment is disabled, so End selects the middle one.'
      given: { options: [{ value: list, label: List }, { value: grid, label: Grid }, { value: table, label: Table, disabled: true }], defaultValue: list }
      when: { key: End }
      then:
        - { event: onChange }
        - { event: onChange, with: grid }
      platforms: [web, lit]
  examples:
    - name: view-mode
      description: The two-option list/grid switch a content region is viewed through.
      given: { label: View mode, options: [{ value: list, label: List }, { value: grid, label: Grid }], defaultValue: list }
    - name: icon-only-toolbar
      description: Icon-only segments at toolbar height, each label carried as the accessible name and the Tooltip.
      given: { label: View mode, options: [{ value: list, label: List view, icon: list }, { value: grid, label: Grid view, icon: grid }], iconOnly: true, size: sm }
    - name: filled-range-switch
      description: Three parallel time ranges stretched to the container width.
      given: { label: Range, options: [{ value: day, label: Day }, { value: week, label: Week }, { value: month, label: Month }], defaultValue: week, fill: true }
---

A segmented control switches a mode: list or grid, day or week, metric or imperial. Exactly one segment is always selected, choosing takes effect at once, and there is nothing to submit — which is what separates it from a RadioGroup in a form, whose semantics it borrows.

## When to use

Use it for two to five short, parallel options that change what a region shows or how a tool behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible Text label when the group's purpose is not obvious.

## When not to use

Do not use it to pick a value that is submitted later (RadioGroup) or that has consequences worth a confirmation. Do not use it for more than five options or long labels; use Tabs when the options are views of content, or Select. Do not use it as tabs: a segmented control does not own panels. Do not leave it with no selection.

## Behavior

Click or tap selects a segment and fires `onChange`. Keyboard: the group is one tab stop on the selected segment; arrows move focus *and* selection (radio semantics), wrapping and skipping disabled segments; Home and End do the same to the ends. In right-to-left writing ArrowLeft is "next" and ArrowRight "previous" (ArrowDown and ArrowUp are unchanged), as in Tabs; the direction is the group's (the host's on Lit) computed `direction`, read at keydown. Arrows, Home and End move from the focused segment, and from the tab stop only when no segment has focus. Under a controlled `value` the arrow still moves focus and fires `onChange`; the checked state, the pill and the tab stop (`tabindex="0"`) stay where `value` says until the parent changes it, so focus can sit on a `tabindex="-1"` segment meanwhile. `onChange` fires only when the target differs from the current `value`, so moving back onto the checked segment moves focus and fires nothing — the `selects` expectation in the keyboard table is about the move landing on a segment that becomes checked, not a promise that every arrow emits. The pill slides to the selected segment. `fill` divides the width equally. Icon-only segments are wrapped in a Tooltip showing the label on every platform that has hover or focus (web, Lit); on native the label is the accessibility label. The control is horizontal only. It is not a form field: there is no `name`, no `form` block, and it neither registers with a Form nor submits a value — use RadioGroup inside a Form. Inside a Toolbar (a `role="toolbar"` ancestor, looked up at keydown by walking `parentElement` and, on Lit, crossing shadow roots through each root's host; on React Native not applicable) the arrows do not wrap: an arrow pointing out of the first or last enabled segment, and Home and End, are left unhandled (no `preventDefault`), so the toolbar moves focus to the neighbouring control. The lookup starts at the group's `parentElement`, so a toolbar that is the group's own parent counts and the group's own root never matches itself. The two rules resolve in one order: focus first. When focus is on no enabled segment, an outward arrow moves to the first or last enabled segment — still inside the control — and only a move that would wrap out of a genuinely focused end segment is left unhandled. This rule has no keyboard entry and no scenario of its own, so it ships untested; it is a guidance contract, not a gated one. Outside a toolbar the keyboard table applies unchanged.

## Content guidelines

Labels are single words or short pairs in sentence case ("List", "Grid", "This week"). Do not use "On/Off" — that is a Switch. With `iconOnly`, the label is what a screen reader says and what the Tooltip shows, so it names the mode ("Grid view"), not the icon.

## Accessibility

Role `radiogroup` with a name and `radio` segments with `aria-checked` (WCAG 4.1.2; APG radio group), so assistive technology reports "3 of 3, selected". One tab stop with arrow movement. Selection is shown by the raised pill, the stronger and heavier text, and the checked state — not color alone (1.4.1). Icon-only segments carry their label as the accessible name and expose it visually through a Tooltip (1.1.1). The pill itself is deliberately low-contrast against the group (a page-colored surface with a soft shadow); WCAG 1.4.11 does not require it because the selected state is identified by the text change and the checked state, which is why the text pair on the pill is the one the build checks. Reduced motion stops the pill animation.

## Platform notes

### Web
`<div role="radiogroup" aria-label>` containing `<button type="button" role="radio" aria-checked tabindex>` per option with `<Icon>` and label; an absolutely positioned pill `<span aria-hidden>` sized and translated from the selected segment's offset with `transition`. Keydown on the group implements the keyboard table. `iconOnly` gives each segment `aria-label` = the option label and wraps it in `Tooltip` with `content` = the label and `describes: false`.

### Lit
`<ds-segmented-control label="View mode" .options=${…} value="grid">`; roving tabindex in the shadow root; composed `change`.

### React Native
`View` with `accessibilityRole="radiogroup"` and `accessibilityLabel`, `flexDirection: 'row'`, background and padding from tokens; `Pressable accessibilityRole="radio" accessibilityState={{ checked }}` per option; pill as an `Animated.View` positioned from `onLayout` measurements. `iconOnly` sets `accessibilityLabel` to the option label.

## Related

RadioGroup, Tabs, Switch, Tooltip, Icon.
