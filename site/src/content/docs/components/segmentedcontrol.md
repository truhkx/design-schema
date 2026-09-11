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
      required: true
      description: 'Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context.'
    options:
      type: array
      required: true
      shape: '{ value: string; label: string; icon?: IconName; disabled?: boolean }[]'
      description: 'Two to five options. Labels are one word; with `iconOnly` the label becomes the accessible name.'
    value:
      type: string
      description: Controlled selected value. Omit for uncontrolled.
    defaultValue:
      type: string
      description: Initially selected value. Defaults to the first enabled option — a segmented control always has a selection.
    iconOnly:
      type: boolean
      default: false
      description: Show icons only (every option must have one); labels become accessible names and Tooltips.
    size:
      type: enum
      values: [sm, md]
      default: md
      description: Toolbar (`sm`) or standard (`md`) height.
    fill:
      type: boolean
      default: false
      description: Stretch to the container width with equal segments.
  events:
    onChange:
      description: Fired when the selection changes, with the new value. The change takes effect immediately.
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
  keyboard:
    - { keys: [ArrowRight, ArrowDown], action: 'Moves to and selects the next enabled segment, wrapping.', from: first, expect: focus-next }
    - { keys: [ArrowLeft, ArrowUp], action: 'Moves to and selects the previous enabled segment, wrapping.', from: last, expect: focus-prev }
    - { keys: [ArrowRight], action: From the last segment wraps to the first., from: last, expect: focus-wraps-to-first }
    - { keys: [Home], action: First segment., from: last, expect: focus-first }
    - { keys: [End], action: Last segment., from: first, expect: focus-last }
  styles:
    groupBackground: { token: color.background.strong }
    groupPadding: { token: space.1 }
    groupRadius: { token: radius.md }
    segmentColor: { token: color.foreground.muted }
    segmentSelectedColor: { token: color.foreground.strong }
    segmentSelectedBackground: { token: color.background, description: The raised pill under the selected segment. }
    segmentShadow: { token: shadow.raised }
    segmentRadius: { token: radius.sm }
    segmentPaddingInline: { token: space.md }
    segmentPaddingBlock: { token: space.1 }
    segmentGap: { token: layout.gap.tight, description: 'Between icon and label inside a segment.' }
    segmentSpacing: { token: space.0, description: 'Between adjacent segments: none — the pill slides under abutting segments.' }
    selectedWeight: { token: font.weight.semibold, description: 'The selected segment''s label; unselected use fontWeight.' }
    paddingBlockSm: { token: space.1, description: 'Vertical padding at size sm; md uses paddingBlock.' }
    fontFamily: { token: font.family.body }
    fontSize: { token: 'font.size.{size}' }
    fontWeight: { token: font.weight.medium }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.min, description: 'Each segment''s minimum; on touch platforms the group height is size.target.comfortable so every segment reaches 44px.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    transition: { token: motion.duration.fast, description: Pill movement; instant under reduced motion. }
    disabledOpacity: { token: opacity.disabled }
  a11y:
    role: radiogroup
    requires: [accessible-name, selected-state, arrow-navigation, roving-tabindex, keyboard-operable, focus-visible, contrast-aa, target-24px, reduced-motion]
    contrast:
      - { foreground: color.foreground.muted, background: color.background.strong, level: AA }
      - { foreground: color.foreground.strong, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=radiogroup, aria-label, role=radio, aria-checked, tabindex]
      notes: 'A <div role="radiogroup" aria-label> of <button role="radio" aria-checked tabindex={0|-1}> — buttons rather than native radios because the control is not a form field and has no name/value to submit. Roving tabindex; arrows move AND select (radio semantics). The selected pill is an absolutely positioned element animated between segments.'
    lit:
      tag: ds-segmented-control
      reflect: [value, size, fill, icon-only]
      notes: '`options` is a property; composed `change` with detail { value }. Not form-associated by design.'
    rn:
      element: View
      props: [accessibilityRole=radiogroup, accessibilityRole=radio, accessibilityState]
      notes: 'A View row of Pressables with accessibilityRole="radio" and accessibilityState={{ checked, disabled }}; the pill is an Animated.View. Each segment is its own accessibility stop on native. iOS''s UISegmentedControl look is approximated with the tokens rather than used, so the theme applies.'
    swiftui:
      element: HStack
      props: [.accessibilityElement=contain, Button, .accessibilityAddTraits=isSelected, .focusable, .onMoveCommand, '@FocusState', matchedGeometryEffect]
      notes: 'Not `Picker(.segmented)` (untinted, unthemeable). An `HStack` of equal-width `Button`s in a `.contain` element named by `label`, the selected one `.isSelected` with the selected surface drawn through `matchedGeometryEffect` sliding over `transition` (no slide under reduced motion). Arrows on iPad move selection immediately (radio semantics), matching the keyboard table. `iconOnly` segments carry their label as the accessibility label.'
---

A segmented control switches a mode: list or grid, day or week, metric or imperial. Exactly one segment is always selected, choosing takes effect at once, and there is nothing to submit — which is what separates it from a RadioGroup in a form, whose semantics it borrows.

## When to use

Use it for two to five short, parallel options that change what a region shows or how a tool behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible Text label when the group's purpose is not obvious.

## When not to use

Do not use it to pick a value that is submitted later (RadioGroup) or that has consequences worth a confirmation. Do not use it for more than five options or long labels; use Tabs when the options are views of content, or Select. Do not use it as tabs: a segmented control does not own panels. Do not leave it with no selection.

## Behavior

Click or tap selects a segment and fires `onChange`. Keyboard: the group is one tab stop on the selected segment; arrows move focus *and* selection (radio semantics), wrapping and skipping disabled segments; Home and End jump. The pill slides to the selected segment. `fill` divides the width equally. Icon-only segments are wrapped in a Tooltip showing the label on every platform that has hover or focus (web, Lit); on native the label is the accessibility label. The control is horizontal only.

## Content guidelines

Labels are single words or short pairs in sentence case ("List", "Grid", "This week"). Do not use "On/Off" — that is a Switch. With `iconOnly`, the label is what a screen reader says and what the Tooltip shows, so it names the mode ("Grid view"), not the icon.

## Accessibility

Role `radiogroup` with a name and `radio` segments with `aria-checked` (WCAG 4.1.2; APG radio group), so assistive technology reports "3 of 3, selected". One tab stop with arrow movement. Selection is shown by the raised pill, the stronger and heavier text, and the checked state — not color alone (1.4.1). Icon-only segments carry their label as the accessible name and expose it visually through a Tooltip (1.1.1). The pill itself is deliberately low-contrast against the group (a page-colored surface with a soft shadow); WCAG 1.4.11 does not require it because the selected state is identified by the text change and the checked state, which is why the text pair on the pill is the one the build checks. Reduced motion stops the pill animation.

## Platform notes

### Web
`<div role="radiogroup" aria-label>` containing `<button type="button" role="radio" aria-checked tabindex>` per option with `<Icon>` and label; an absolutely positioned pill `<span aria-hidden>` sized and translated from the selected segment's offset with `transition`. Keydown on the group implements the keyboard table. `iconOnly` wraps each segment in `Tooltip` with `describes: false`.

### Lit
`<ds-segmented-control label="View mode" .options=${…} value="grid">`; roving tabindex in the shadow root; composed `change`.

### React Native
`View` with `accessibilityRole="radiogroup"` and `accessibilityLabel`, `flexDirection: 'row'`, background and padding from tokens; `Pressable accessibilityRole="radio" accessibilityState={{ checked }}` per option; pill as an `Animated.View` positioned from `onLayout` measurements. `iconOnly` sets `accessibilityLabel` to the option label.

## Related

RadioGroup, Tabs, Switch, Tooltip, Icon.
