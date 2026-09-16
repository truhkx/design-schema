# Generate: SegmentedControl for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/SegmentedControl.swift` declaring `public struct SegmentedControl: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/SegmentedControlBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+SegmentedControl.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("SegmentedControl") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("SegmentedControl")` on the root and `"SegmentedControl.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: SegmentedControl
  category: input
  status: review
  apg: radio
  anatomy:
  - group
  - segment
  - segmentLabel
  - segmentIcon
  - tooltip
  - indicator
  composition:
    tooltip: Tooltip
    segmentIcon: Icon
  props:
    label:
      type: string
      required: true
      description: Accessible name of the control ("View mode"). Not shown; put a
        visible Text label beside it when the meaning is not obvious from context.
        Lit, where an attribute can be absent, defaults the property to an empty string
        and warns in development when it is empty.
    options:
      type: array
      required: true
      shape: '{ value: string; label: string; icon?: IconName; disabled?: boolean
        }[]'
      description: 'Two to five options (guidance, not enforced: any count renders,
        with no warning). Labels are one word; with `iconOnly` the label becomes the
        accessible name.'
    value:
      type: string
      description: Controlled selected value. Omit for uncontrolled.
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: 'Initially selected value. Defaults to the first enabled option
        — a segmented control always has a selection. A `value` or `defaultValue`
        is taken as given, never corrected: one naming a disabled option keeps that
        segment checked with the pill under it (arrows still skip it); one matching
        no option checks nothing and draws no pill. In both cases the tab stop is
        the first enabled segment, and arrows move from there.'
    iconOnly:
      type: boolean
      default: false
      description: Show icons only (every option must have one); labels become accessible
        names and Tooltips. An option without `icon` warns in development (once) and
        that segment shows its label as text instead, so it never renders empty.
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      default: md
      description: Toolbar (`sm`) or standard (`md`) height.
    fill:
      type: boolean
      default: false
      description: Stretch to the container width with equal segments.
  events:
    onChange:
      description: Fired when the selection changes, with the new value. The change
        takes effect immediately.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: value
        type: string
        description: The value of the selected segment.
      fires:
      - user
      timing:
        phase: after-change
  keyboard:
  - keys:
    - ArrowRight
    - ArrowDown
    action: Moves to and selects the next enabled segment, wrapping.
    from: first
    expect:
    - focus-next
    - selects
  - keys:
    - ArrowLeft
    - ArrowUp
    action: Moves to and selects the previous enabled segment, wrapping.
    from: last
    expect:
    - focus-prev
    - selects
  - keys:
    - ArrowRight
    action: From the last segment wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Home
    action: Moves to and selects the first enabled segment — this control always has
      a selection, so Home and End select as the arrows do.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Moves to and selects the last enabled segment.
    from: first
    expect: focus-last
  styles:
    groupBackground:
      token: color.background.strong
      part: group
      locked: true
    groupPadding:
      token: space.1
      part: group
      locked: false
    groupRadius:
      token: radius.md
      part: group
      locked: false
    segmentColor:
      token: color.foreground.muted
      part: segment
      locked: true
    segmentSelectedColor:
      token: color.foreground.strong
      part: segment
      locked: true
    segmentSelectedBackground:
      token: color.background
      part: indicator
      description: The raised pill under the selected segment — drawn on the `indicator`
        part, never on the segment itself.
      locked: true
    segmentShadow:
      token: shadow.raised
      part: indicator
      description: The pill's shadow.
      locked: false
    segmentRadius:
      token: radius.sm
      part: indicator
      description: The pill's corners; the segment's focus ring uses the same radius.
      locked: false
    segmentPaddingInline:
      token: space.md
      part: segment
      locked: false
    segmentPaddingBlock:
      token: space.1
      part: segment
      description: Vertical padding at size md.
      locked: false
    segmentGap:
      token: layout.gap.tight
      part: segment
      description: Between icon and label inside a segment; no effect with `iconOnly`,
        where a segment has one child.
      locked: false
    segmentSpacing:
      token: space.0
      part: group
      description: 'Between adjacent segments, applied as the group''s gap (never
        a segment margin): none — the pill slides under abutting segments.'
      locked: false
    selectedWeight:
      token: font.weight.semibold
      part: segment
      description: The selected segment's label; unselected use fontWeight.
      locked: false
    paddingBlockSm:
      token: space.1
      part: segment
      description: Vertical padding at size sm; md uses segmentPaddingBlock. The two
        are the same token on purpose, so `size` changes the height only through fontSize
        and its line box — and on React Native, where every segment reaches size.target.comfortable,
        not visibly at all.
      locked: false
    fontFamily:
      token: font.family.body
      part: segment
      locked: false
    fontSize:
      token: font.size.{size}
      part: segment
      locked: false
    fontWeight:
      token: font.weight.medium
      part: segment
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: segment
      locked: false
    minTarget:
      token: size.target.min
      part: segment
      description: Each segment's minimum. React Native is touch, so the group height
        there is size.target.comfortable and every segment reaches 44px; web and Lit
        keep this floor, because no CSS query tells a touch screen from a hybrid laptop
        and guessing would shrink or grow the control for the wrong people.
      locked: true
    focusRing:
      token: color.border.focus
      part: segment
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: segment
      locked: true
    transition:
      token: motion.duration.fast
      part: indicator
      description: Pill movement; instant under reduced motion.
      locked: false
    disabledOpacity:
      token: opacity.disabled
      part: segment
      locked: false
  a11y:
    role: radiogroup
    requires:
    - accessible-name
    - selected-state
    - arrow-navigation
    - roving-tabindex
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    - reduced-motion
    contrast:
    - foreground: color.foreground.muted
      background: color.background.strong
      level: AA
    - foreground: color.foreground.strong
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=radiogroup
      - aria-label
      - role=radio
      - aria-checked
      - tabindex
      notes: 'A <div role="radiogroup" aria-label> of <button role="radio" aria-checked
        tabindex={0|-1}> — buttons rather than native radios because the control is
        not a form field and has no name/value to submit. Roving tabindex; arrows
        move AND select (radio semantics). The selected pill is an absolutely positioned
        `aria-hidden` element animated between segments. No FormContext registration
        and no `data-ds-field`. `iconOnly` segments carry `aria-label` = the option
        label themselves and are wrapped in Tooltip with `content` = the label, `describes:
        false`, and default placement and delay (Tooltip''s warm window already makes
        moving along the control instant).'
    lit:
      tag: ds-segmented-control
      reflect:
      - value
      - size
      - fill
      - icon-only
      notes: '`options` is a property; composed `change` with detail { value }. Not
        form-associated by design, and no `data-ds-field`. The pill is `aria-hidden`.
        `iconOnly` segments carry `aria-label` = the option label (the Tooltip''s
        aria-labelledby cannot cross the shadow root) inside `<ds-tooltip no-describes>`
        with `content` = the label and default placement and delay.'
    rn:
      element: View
      props:
      - accessibilityRole=radiogroup
      - accessibilityRole=radio
      - accessibilityState
      notes: 'A View row of Pressables with accessibilityRole="radio" and accessibilityState={{
        checked, disabled }}; the pill is an Animated.View hidden from assistive technology
        (accessibilityElementsHidden, importantForAccessibility="no-hide-descendants"),
        as Tabs hides its indicator. Not registered with FormContext. Each segment
        is its own accessibility stop on native: iOS and Android deliver no key events
        to a View, so the keyboard table applies on react-native-web only (onKeyDown
        on the group, roving `focusable`), and the arrow scenarios are web and Lit
        only. No Tooltip part on React Native: an `iconOnly` segment carries its label
        as `accessibilityLabel` with no `accessibilityHint` (it would repeat the name)
        and no long-press bubble, because a press already selects. iOS''s UISegmentedControl
        look is approximated with the tokens rather than used, so the theme applies.'
    swiftui:
      element: HStack
      props:
      - .accessibilityElement=contain
      - Button
      - .accessibilityAddTraits=isSelected
      - .focusable
      - .onMoveCommand
      - '@FocusState'
      - matchedGeometryEffect
      notes: Not `Picker(.segmented)` (untinted, unthemeable). An `HStack` of equal-width
        `Button`s in a `.contain` element named by `label`, the selected one `.isSelected`
        with the selected surface drawn through `matchedGeometryEffect` sliding over
        `transition` (no slide under reduced motion). Arrows on iPad move selection
        immediately (radio semantics), matching the keyboard table. `iconOnly` segments
        carry their label as the accessibility label.
  behavior:
  - name: click-selects-a-segment
    description: The click lands on the first segment (List), which is not the selected
      one.
    given:
      options:
      - value: list
        label: List
      - value: grid
        label: Grid
      defaultValue: grid
    when:
      click: segment
    then:
    - event: onChange
    - event: onChange
      with: list
      platforms:
      - lit
      - rn
  - name: arrow-moves-and-selects
    description: Arrows move focus AND selection (radio semantics), per the keyboard
      table's `selects`. Focus starts on the selected segment (the tab stop).
    given:
      options:
      - value: list
        label: List
      - value: grid
        label: Grid
      defaultValue: list
    when:
      key: ArrowRight
    then:
    - event: onChange
    - event: onChange
      with: grid
      platforms:
      - lit
    platforms:
    - web
    - lit
  - name: arrow-wraps-from-the-last-segment
    description: From the last segment ArrowRight wraps to the first, and selection
      follows. Focus starts on the selected segment (the tab stop).
    given:
      options:
      - value: list
        label: List
      - value: grid
        label: Grid
      defaultValue: grid
    when:
      key: ArrowRight
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: disabled-segment-is-not-selectable
    description: 'A press on a disabled segment selects nothing: the click lands on
      the first segment (List), which is the disabled one. Arrow skipping is covered
      by arrow-skips-disabled-segments.'
    given:
      options:
      - value: list
        label: List
        disabled: true
      - value: grid
        label: Grid
      defaultValue: grid
    when:
      click: segment
    then:
    - event: onChange
      fired: false
  - name: arrow-skips-disabled-segments
    description: From the selected first segment ArrowRight passes over the disabled
      middle one and selects the third.
    given:
      options:
      - value: list
        label: List
      - value: grid
        label: Grid
        disabled: true
      - value: table
        label: Table
      defaultValue: list
    when:
      key: ArrowRight
    then:
    - event: onChange
    - event: onChange
      with: table
      platforms:
      - lit
    platforms:
    - web
    - lit
  examples:
  - name: view-mode
    description: The two-option list/grid switch a content region is viewed through.
    given:
      label: View mode
      options:
      - value: list
        label: List
      - value: grid
        label: Grid
      defaultValue: list
  - name: icon-only-toolbar
    description: Icon-only segments at toolbar height, each label carried as the accessible
      name and the Tooltip.
    given:
      label: View mode
      options:
      - value: list
        label: List view
        icon: list
      - value: grid
        label: Grid view
        icon: grid
      iconOnly: true
      size: sm
  - name: filled-range-switch
    description: Three parallel time ranges stretched to the container width.
    given:
      label: Range
      options:
      - value: day
        label: Day
      - value: week
        label: Week
      - value: month
        label: Month
      defaultValue: week
      fill: true
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: string`
  - fires on: user
  - timing: after-change

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Style bindings

- `groupBackground`: token `color.background.strong`; part `group`; locked
- `groupPadding`: token `space.1`; part `group`
- `groupRadius`: token `radius.md`; part `group`
- `segmentColor`: token `color.foreground.muted`; part `segment`; locked
- `segmentSelectedColor`: token `color.foreground.strong`; part `segment`; locked
- `segmentSelectedBackground`: token `color.background`; part `indicator`; locked
- `segmentShadow`: token `shadow.raised`; part `indicator`
- `segmentRadius`: token `radius.sm`; part `indicator`
- `segmentPaddingInline`: token `space.md`; part `segment`
- `segmentPaddingBlock`: token `space.1`; part `segment`
- `segmentGap`: token `layout.gap.tight`; part `segment`
- `segmentSpacing`: token `space.0`; part `group`
- `selectedWeight`: token `font.weight.semibold`; part `segment`
- `paddingBlockSm`: token `space.1`; part `segment`
- `fontFamily`: token `font.family.body`; part `segment`
- `fontSize`: token `font.size.{size}`; part `segment`
- `fontWeight`: token `font.weight.medium`; part `segment`
- `lineHeight`: token `font.lineHeight.normal`; part `segment`
- `minTarget`: token `size.target.min`; part `segment`; locked
- `focusRing`: token `color.border.focus`; part `segment`; locked
- `focusRingWidth`: token `border.width.focus`; part `segment`; locked
- `transition`: token `motion.duration.fast`; part `indicator`
- `disabledOpacity`: token `opacity.disabled`; part `segment`

## Keyboard

- `ArrowRight`, `ArrowDown` (Moves to and selects the next enabled segment, wrapping.): expect focus-next, then selects
- `ArrowLeft`, `ArrowUp` (Moves to and selects the previous enabled segment, wrapping.): expect focus-prev, then selects

## Constants and examples

- example `view-mode`, story `ViewMode`: given `label: "View mode"`, `options: [{"value":"list","label":"List"},{"value":"grid","label":"Grid"}]`, `defaultValue: "list"`; The two-option list/grid switch a content region is viewed through.
- example `icon-only-toolbar`, story `IconOnlyToolbar`: given `label: "View mode"`, `options: [{"value":"list","label":"List view","icon":"list"},{"value":"grid","label":"Grid view","icon":"grid"}]`, `iconOnly: true`, `size: "sm"`; Icon-only segments at toolbar height, each label carried as the accessible name and the Tooltip.
- example `filled-range-switch`, story `FilledRangeSwitch`: given `label: "Range"`, `options: [{"value":"day","label":"Day"},{"value":"week","label":"Week"},{"value":"month","label":"Month"}]`, `defaultValue: "week"`, `fill: true`; Three parallel time ranges stretched to the container width.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `groupPadding`, `groupRadius`, `segmentShadow`, `segmentRadius`, `segmentPaddingInline`, `segmentPaddingBlock`, `segmentGap`, `segmentSpacing`, `selectedWeight`, `paddingBlockSm`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `transition`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `groupBackground`, `segmentColor`, `segmentSelectedColor`, `segmentSelectedBackground`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: HStack
props:
- .accessibilityElement=contain
- Button
- .accessibilityAddTraits=isSelected
- .focusable
- .onMoveCommand
- '@FocusState'
- matchedGeometryEffect
notes: Not `Picker(.segmented)` (untinted, unthemeable). An `HStack` of equal-width
  `Button`s in a `.contain` element named by `label`, the selected one `.isSelected`
  with the selected surface drawn through `matchedGeometryEffect` sliding over `transition`
  (no slide under reduced motion). Arrows on iPad move selection immediately (radio
  semantics), matching the keyboard table. `iconOnly` segments carry their label as
  the accessibility label.
```

## Guidance

## Overview

A segmented control switches a mode: list or grid, day or week, metric or imperial. Exactly one segment is always selected, choosing takes effect at once, and there is nothing to submit — which is what separates it from a RadioGroup in a form, whose semantics it borrows.

## When to use

Use it for two to five short, parallel options that change what a region shows or how a tool behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible Text label when the group's purpose is not obvious.

## When not to use

Do not use it to pick a value that is submitted later (RadioGroup) or that has consequences worth a confirmation. Do not use it for more than five options or long labels; use Tabs when the options are views of content, or Select. Do not use it as tabs: a segmented control does not own panels. Do not leave it with no selection.

## Behavior

Click or tap selects a segment and fires `onChange`. Keyboard: the group is one tab stop on the selected segment; arrows move focus *and* selection (radio semantics), wrapping and skipping disabled segments; Home and End do the same to the ends. In right-to-left writing ArrowLeft is "next" and ArrowRight "previous" (ArrowDown and ArrowUp are unchanged), as in Tabs. Under a controlled `value` the arrow still moves focus and fires `onChange`; the checked state and the pill stay where `value` says until the parent changes it. The pill slides to the selected segment. `fill` divides the width equally. Icon-only segments are wrapped in a Tooltip showing the label on every platform that has hover or focus (web, Lit); on native the label is the accessibility label. The control is horizontal only. It is not a form field: there is no `name`, no `form` block, and it neither registers with a Form nor submits a value — use RadioGroup inside a Form.

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

## Behavior scenarios (6)

One test per scenario, in this order.

```yaml
- name: click-selects-a-segment
  description: The click lands on the first segment (List), which is not the selected
    one.
  given:
    options:
    - value: list
      label: List
    - value: grid
      label: Grid
    defaultValue: grid
  when:
    click: segment
  then:
  - event: onChange
- name: disabled-segment-is-not-selectable
  description: 'A press on a disabled segment selects nothing: the click lands on
    the first segment (List), which is the disabled one. Arrow skipping is covered
    by arrow-skips-disabled-segments.'
  given:
    options:
    - value: list
      label: List
      disabled: true
    - value: grid
      label: Grid
    defaultValue: grid
  when:
    click: segment
  then:
  - event: onChange
    fired: false
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-size-sm
  given:
    size: sm
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
