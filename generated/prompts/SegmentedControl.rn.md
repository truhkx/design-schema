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
      a11yRole: accessible-name
      required: true
      description: Accessible name of the control ("View mode"). Not shown; put a
        visible Text label beside it when the meaning is not obvious from context.
        Lit, where an attribute can be absent, defaults the property to an empty string
        and warns in development when it is empty; React and React Native rely on
        the required type and do not warn, even for an empty string.
    options:
      type: array
      required: true
      shape: '{ value: string; label: string; icon?: IconName | undefined; disabled?:
        boolean | undefined }[]'
      description: 'Two to five options (guidance, not enforced: any count renders,
        with no warning). An empty array is a documented no-op: an empty group renders
        with no tab stop and no pill, keys are ignored, and nothing warns. Labels
        are one word; with `iconOnly` the label becomes the accessible name. The icon
        is an Icon whose `size` is the control''s `size` (`sm` or `md`), on every
        platform, and whose colour is its segment''s own — `segmentColor`, or `segmentSelectedColor`
        when selected — forwarded as the Icon''s `overrides.color`, since there is
        no `currentColor` on native.'
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
        no option checks nothing and draws no pill (the pill is unmounted, and the
        next selection places it instantly rather than sliding it in). In both cases
        the tab stop is the first enabled segment, and arrows move from there when
        no segment has focus.'
    iconOnly:
      type: boolean
      default: false
      description: Show icons only (every option must have one); labels become accessible
        names and Tooltips, disabled segments included — an `aria-disabled` button
        still takes pointer events, so its label stays discoverable on hover. An option
        without `icon` warns in development once per instance (one message listing
        every option without an icon by its `value`, since that is the stable identifier;
        the wording itself is a development aid, not copy, so it is not contract)
        and that segment shows its label as text instead, at its natural width — no
        icon-sized box is reserved for it — so it never renders empty; that segment
        gets no Tooltip and no `aria-label`, since its visible text is its name.
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
      description: 'Stretch to the container width with equal segments. Off, the group
        hugs its segments rather than filling the container (React Native: `alignSelf:
        ''flex-start''`, which is what keeps `fill` from being a no-op there).'
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
  - keys:
    - ' '
    - Enter
    action: Selects the focused segment. Each segment is a native button (web and
      Lit), so this is its own activation — the component adds no handler and nothing
      else is bound to these keys.
    from: first
    expect: manual
    native: true
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
      description: 'The pill''s shadow. The one binding here whose token resolves
        to an object rather than a scalar: on React Native it expands into the shadow
        style keys (shadowColor, shadowOffset, shadowRadius, elevation), which are
        spread into the pill''s style, and an override is resolved the same way.'
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
      description: 'Vertical padding at size sm; md uses segmentPaddingBlock. The
        two are the same token on purpose, so `size` changes the height only through
        fontSize and its line box — and on React Native, where every segment reaches
        size.target.comfortable, not at all: there `size` changes the type and the
        intrinsic width only, which is the intended outcome. They stay two independent
        hooks all the same (an `sm` rule reads its own `--ds-segmented-control-padding-block-sm`),
        so overriding one never moves the other.'
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
      description: 'Each segment''s minimum, on both axes (min-inline-size and min-block-size),
        so a one-character label still makes a square-ish target. The one binding
        whose token resolves per platform: `size.target.min` on web and Lit, `size.target.comfortable`
        on React Native, which is touch and where every segment therefore reaches
        44px. Web and Lit keep the smaller floor because no CSS query tells a touch
        screen from a hybrid laptop and guessing would shrink or grow the control
        for the wrong people.'
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
      description: 'The `segment` part only: a checked-but-disabled option keeps a
        full-opacity pill under a faded label, since the pill is the `indicator` part
        and the selection it marks is still true.'
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
      - aria-disabled
      - tabindex
      notes: 'A <div role="radiogroup" aria-label> of <button role="radio" aria-checked
        tabindex={0|-1}> — buttons rather than native radios because the control is
        not a form field and has no name/value to submit. Roving tabindex; arrows
        move AND select (radio semantics). The selected pill is an absolutely positioned
        `aria-hidden` element animated between segments. No FormContext registration
        and no `data-ds-field`. A disabled option is `aria-disabled="true"` with a
        guard in the click handler, never the native `disabled` attribute: a checked-but-disabled
        segment must stay reachable by assistive technology (and a test clicking it
        needs the click to land, which `disabled` would swallow). `iconOnly` segments
        carry `aria-label` = the option label themselves and are wrapped in Tooltip
        with `content` = the label, `describes: false`, and default placement and
        delay (Tooltip''s warm window already makes moving along the control instant);
        `aria-label` is the primary name, and while the tooltip is open its identical
        text wins as `aria-labelledby` — the redundancy is accepted, since Tooltip
        has no mode that neither labels nor describes. Tooltip attaches its own ref
        to the child it clones, so a wrapped segment cannot also hold one of this
        component''s: roving focus finds segments by their generated DOM id (`document.getElementById`),
        which assumes the control is rendered into the main document rather than a
        detached tree.'
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
        with `content` = the label and default placement and delay. `defaultValue`
        reads the `default-value` attribute and is not reflected. `reflect: value`
        means the `value` property only — the uncontrolled selection lives in internal
        state and is never written to the attribute, so an uncontrolled control renders
        with no `value` attribute even while a segment is checked, and the attribute
        stays the signal that the element is controlled. A disabled option is `aria-disabled="true"`
        with a click guard, as on web.'
    rn:
      element: View
      props:
      - accessibilityRole=radiogroup
      - accessibilityRole=radio
      - accessibilityState
      notes: 'A View row of Pressables with accessibilityRole="radio" and accessibilityState={{
        checked, disabled }}; the pill is an Animated.View hidden from assistive technology
        (accessibilityElementsHidden, importantForAccessibility="no-hide-descendants"),
        as Tabs hides its indicator. Its position comes from `onLayout`, which arrives
        after the first paint, so the first placement is instant — the pill appears
        under the selected segment rather than sliding in from the start of the row
        — and only later moves slide. Not registered with FormContext. Each segment
        is its own accessibility stop on native: iOS and Android deliver no key events
        to a View, so the keyboard table applies on react-native-web only (onKeyDown
        on the group), and the arrow scenarios are web and Lit only. react-native-web
        0.21 forwards neither `accessibilityState` nor `focusable`, so on that platform
        the checked and disabled states are also written as real attributes — an `aria-checked`
        prop mirror, and `aria-disabled` plus the roving `tabindex` set on the node
        in an effect, since Pressable overwrites a passed-in `aria-disabled` from
        its own absent `disabled` prop. Without the mirrors every radio is missing
        `aria-checked` and a dimmed segment is not exempt from the contrast rule;
        without `tabindex` on the node the group silently becomes one tab stop per
        segment, which no gate catches. No Tooltip part on React Native: an `iconOnly`
        segment carries its label as `accessibilityLabel` with no `accessibilityHint`
        (it would repeat the name) and no long-press bubble, because a press already
        selects. The group View carries accessibilityRole="radiogroup", accessibilityLabel
        = `label` and testID `SegmentedControl` but is not `accessible` (that would
        merge the segments into one stop), so tests find it by testID and assert role
        and name rather than getByRole. iOS''s UISegmentedControl look is approximated
        with the tokens rather than used, so the theme applies.'
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
      - web
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
    - web
    - lit
  - name: end-selects-the-last-enabled-segment
    description: End moves to and selects the last enabled segment, like the arrows.
      Focus starts on the selected first segment (the tab stop); the last segment
      is disabled, so End selects the middle one.
    given:
      options:
      - value: list
        label: List
      - value: grid
        label: Grid
      - value: table
        label: Table
        disabled: true
      defaultValue: list
    when:
      key: End
    then:
    - event: onChange
    - event: onChange
      with: grid
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
- ` `, `Enter` (Selects the focused segment. Each segment is a native button (web and Lit), so this is its own activation — the component adds no handler and nothing else is bound to these keys.): expect manual; native: the rendered element already does this

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

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityRole=radiogroup
- accessibilityRole=radio
- accessibilityState
notes: "A View row of Pressables with accessibilityRole=\"radio\" and accessibilityState={{\
  \ checked, disabled }}; the pill is an Animated.View hidden from assistive technology\
  \ (accessibilityElementsHidden, importantForAccessibility=\"no-hide-descendants\"\
  ), as Tabs hides its indicator. Its position comes from `onLayout`, which arrives\
  \ after the first paint, so the first placement is instant \u2014 the pill appears\
  \ under the selected segment rather than sliding in from the start of the row \u2014\
  \ and only later moves slide. Not registered with FormContext. Each segment is its\
  \ own accessibility stop on native: iOS and Android deliver no key events to a View,\
  \ so the keyboard table applies on react-native-web only (onKeyDown on the group),\
  \ and the arrow scenarios are web and Lit only. react-native-web 0.21 forwards neither\
  \ `accessibilityState` nor `focusable`, so on that platform the checked and disabled\
  \ states are also written as real attributes \u2014 an `aria-checked` prop mirror,\
  \ and `aria-disabled` plus the roving `tabindex` set on the node in an effect, since\
  \ Pressable overwrites a passed-in `aria-disabled` from its own absent `disabled`\
  \ prop. Without the mirrors every radio is missing `aria-checked` and a dimmed segment\
  \ is not exempt from the contrast rule; without `tabindex` on the node the group\
  \ silently becomes one tab stop per segment, which no gate catches. No Tooltip part\
  \ on React Native: an `iconOnly` segment carries its label as `accessibilityLabel`\
  \ with no `accessibilityHint` (it would repeat the name) and no long-press bubble,\
  \ because a press already selects. The group View carries accessibilityRole=\"radiogroup\"\
  , accessibilityLabel = `label` and testID `SegmentedControl` but is not `accessible`\
  \ (that would merge the segments into one stop), so tests find it by testID and\
  \ assert role and name rather than getByRole. iOS's UISegmentedControl look is approximated\
  \ with the tokens rather than used, so the theme applies."
```

## Guidance

## Overview

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
