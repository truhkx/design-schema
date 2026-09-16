# Generate: SegmentedControl for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/SegmentedControl.tsx` exporting a typed React Native function component named `SegmentedControl`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `SegmentedControlProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger and at least three focusable children, for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof SegmentedControl> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `SegmentedControl.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
    options:
      type: array
      required: true
      shape: '{ value: string; label: string; icon?: IconName; disabled?: boolean
        }[]'
      description: Two to five options. Labels are one word; with `iconOnly` the label
        becomes the accessible name.
    value:
      type: string
      description: Controlled selected value. Omit for uncontrolled.
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: Initially selected value. Defaults to the first enabled option
        — a segmented control always has a selection.
    iconOnly:
      type: boolean
      default: false
      description: Show icons only (every option must have one); labels become accessible
        names and Tooltips.
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
      part: segment
      description: The raised pill under the selected segment.
      locked: true
    segmentShadow:
      token: shadow.raised
      part: segment
      locked: false
    segmentRadius:
      token: radius.sm
      part: segment
      locked: false
    segmentPaddingInline:
      token: space.md
      part: segment
      locked: false
    segmentPaddingBlock:
      token: space.1
      part: segment
      locked: false
    segmentGap:
      token: layout.gap.tight
      part: segment
      description: Between icon and label inside a segment.
      locked: false
    segmentSpacing:
      token: space.0
      part: segment
      description: 'Between adjacent segments: none — the pill slides under abutting
        segments.'
      locked: false
    selectedWeight:
      token: font.weight.semibold
      description: The selected segment's label; unselected use fontWeight.
      locked: false
    paddingBlockSm:
      token: space.1
      description: Vertical padding at size sm; md uses paddingBlock.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    fontWeight:
      token: font.weight.medium
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.min
      description: Each segment's minimum. React Native is touch, so the group height
        there is size.target.comfortable and every segment reaches 44px; web and Lit
        keep this floor, because no CSS query tells a touch screen from a hybrid laptop
        and guessing would shrink or grow the control for the wrong people.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    transition:
      token: motion.duration.fast
      description: Pill movement; instant under reduced motion.
      locked: false
    disabledOpacity:
      token: opacity.disabled
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
  form:
    role: field
    value: value
    valueType: string
    discovery: context
  platforms:
    web:
      element: div
      attributes:
      - role=radiogroup
      - aria-label
      - role=radio
      - aria-checked
      - tabindex
      notes: A <div role="radiogroup" aria-label> of <button role="radio" aria-checked
        tabindex={0|-1}> — buttons rather than native radios because the control is
        not a form field and has no name/value to submit. Roving tabindex; arrows
        move AND select (radio semantics). The selected pill is an absolutely positioned
        element animated between segments.
    lit:
      tag: ds-segmented-control
      reflect:
      - value
      - size
      - fill
      - icon-only
      notes: '`options` is a property; composed `change` with detail { value }. Not
        form-associated by design.'
    rn:
      element: View
      props:
      - accessibilityRole=radiogroup
      - accessibilityRole=radio
      - accessibilityState
      notes: A View row of Pressables with accessibilityRole="radio" and accessibilityState={{
        checked, disabled }}; the pill is an Animated.View. Each segment is its own
        accessibility stop on native. iOS's UISegmentedControl look is approximated
        with the tokens rather than used, so the theme applies.
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
      table's `selects`.
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
      follows.
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
    description: Arrow movement skips disabled segments, and a press on one selects
      nothing.
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
- `segmentSelectedBackground`: token `color.background`; part `segment`; locked
- `segmentShadow`: token `shadow.raised`; part `segment`
- `segmentRadius`: token `radius.sm`; part `segment`
- `segmentPaddingInline`: token `space.md`; part `segment`
- `segmentPaddingBlock`: token `space.1`; part `segment`
- `segmentGap`: token `layout.gap.tight`; part `segment`
- `segmentSpacing`: token `space.0`; part `segment`

## Keyboard

- `ArrowRight`, `ArrowDown` (Moves to and selects the next enabled segment, wrapping.): expect focus-next, then selects
- `ArrowLeft`, `ArrowUp` (Moves to and selects the previous enabled segment, wrapping.): expect focus-prev, then selects

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: string
  discovery: context
```

## Constants and examples

- example `view-mode`, story `ViewMode`: given `label: "View mode"`, `options: [{"value":"list","label":"List"},{"value":"grid","label":"Grid"}]`, `defaultValue: "list"`; The two-option list/grid switch a content region is viewed through.
- example `icon-only-toolbar`, story `IconOnlyToolbar`: given `label: "View mode"`, `options: [{"value":"list","label":"List view","icon":"list"},{"value":"grid","label":"Grid view","icon":"grid"}]`, `iconOnly: true`, `size: "sm"`; Icon-only segments at toolbar height, each label carried as the accessible name and the Tooltip.
- example `filled-range-switch`, story `FilledRangeSwitch`: given `label: "Range"`, `options: [{"value":"day","label":"Day"},{"value":"week","label":"Week"},{"value":"month","label":"Month"}]`, `defaultValue: "week"`, `fill: true`; Three parallel time ranges stretched to the container width.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `groupPadding`, `groupRadius`, `segmentShadow`, `segmentRadius`, `segmentPaddingInline`, `segmentPaddingBlock`, `segmentGap`, `segmentSpacing`, `selectedWeight`, `paddingBlockSm`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `transition`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `groupBackground`, `segmentColor`, `segmentSelectedColor`, `segmentSelectedBackground`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (6)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-selects-a-segment
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
- name: disabled-segment-is-not-selectable
  description: Arrow movement skips disabled segments, and a press on one selects
    nothing.
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

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityRole=radiogroup
- accessibilityRole=radio
- accessibilityState
notes: A View row of Pressables with accessibilityRole="radio" and accessibilityState={{
  checked, disabled }}; the pill is an Animated.View. Each segment is its own accessibility
  stop on native. iOS's UISegmentedControl look is approximated with the tokens rather
  than used, so the theme applies.
```

## Guidance

## Overview

A segmented control switches a mode: list or grid, day or week, metric or imperial. Exactly one segment is always selected, choosing takes effect at once, and there is nothing to submit — which is what separates it from a RadioGroup in a form, whose semantics it borrows.

## When to use

Use it for two to five short, parallel options that change what a region shows or how a tool behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible Text label when the group's purpose is not obvious.

## When not to use

Do not use it to pick a value that is submitted later (RadioGroup) or that has consequences worth a confirmation. Do not use it for more than five options or long labels; use Tabs when the options are views of content, or Select. Do not use it as tabs: a segmented control does not own panels. Do not leave it with no selection.

## Behavior

Click or tap selects a segment and fires `onChange`. Keyboard: the group is one tab stop on the selected segment; arrows move focus *and* selection (radio semantics), wrapping and skipping disabled segments; Home and End do the same to the ends. The pill slides to the selected segment. `fill` divides the width equally. Icon-only segments are wrapped in a Tooltip showing the label on every platform that has hover or focus (web, Lit); on native the label is the accessibility label. The control is horizontal only.

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
