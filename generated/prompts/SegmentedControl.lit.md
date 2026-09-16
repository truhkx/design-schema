# Generate: SegmentedControl as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/SegmentedControl.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `SegmentedControl.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: SegmentedControlVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
- Each event is dispatched as a `CustomEvent` named by its `platforms.lit` value with `bubbles: true, composed: true` so it crosses the shadow boundary.
- Styles live in `static override styles: CSSResult = css\`…\`` and read ONLY token custom properties (`var(--color-…)`), which inherit through the shadow root. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes an attribute selector per enum value, e.g. `:host([variant="primary"]) { background: var(--color-action-primary-background); }`.
- Implement every item in `a11y.requires` inside the shadow DOM using a native element (e.g. a real `<button>`), and use `delegatesFocus: true` in `static override shadowRootOptions: ShadowRootInit` so focusing the host focuses the inner element.
- `accessible-name`: forward `label` to visible text or `aria-label` on the inner element.
- `focus-visible`: style `:focus-visible` on the inner element with `--color-border-focus` / `--border-width-focus`.
- `heading-hierarchy`: render the matching `<h1>`–`<h6>` inside the shadow root based on the level prop.
- Support light and dark by relying on token variables only.
- Form ownership is DOM-tree based: slotted light-DOM children are not owned by a `<form>` inside a shadow root. Follow the platform notes for how ds-form and ds-input cooperate by `name`.
- Events named like native events (`focus`, `blur`) are the native retargeted events — do not dispatch a CustomEvent with the same name.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard`, removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `SegmentedControl.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element in the shadow root), only in its `state` (`:hover`, `:focus-visible`, the reflected state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated property, event, value or element keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development (`import.meta.env.DEV`) naming `use`.
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

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: string`
  - fires on: user
  - timing: after-change

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)

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

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `groupPadding`, `groupRadius`, `segmentShadow`, `segmentRadius`, `segmentPaddingInline`, `segmentPaddingBlock`, `segmentGap`, `segmentSpacing`, `selectedWeight`, `paddingBlockSm`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `transition`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `groupBackground`, `segmentColor`, `segmentSelectedColor`, `segmentSelectedBackground`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (9)

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

## Platform notes (lit)

```yaml
tag: ds-segmented-control
reflect:
- value
- size
- fill
- icon-only
notes: '`options` is a property; composed `change` with detail { value }. Not form-associated
  by design, and no `data-ds-field`. The pill is `aria-hidden`. `iconOnly` segments
  carry `aria-label` = the option label (the Tooltip''s aria-labelledby cannot cross
  the shadow root) inside `<ds-tooltip no-describes>` with `content` = the label and
  default placement and delay.'
```

## Guidance

## Overview

A segmented control switches a mode: list or grid, day or week, metric or imperial. Exactly one segment is always selected, choosing takes effect at once, and there is nothing to submit — which is what separates it from a RadioGroup in a form, whose semantics it borrows.

## When to use

Use it for two to five short, parallel options that change what a region shows or how a tool behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible Text label when the group's purpose is not obvious.

## When not to use

Do not use it to pick a value that is submitted later (RadioGroup) or that has consequences worth a confirmation. Do not use it for more than five options or long labels; use Tabs when the options are views of content, or Select. Do not use it as tabs: a segmented control does not own panels. Do not leave it with no selection.

## Behavior

Click or tap selects a segment and fires `onChange`. Keyboard: the group is one tab stop on the selected segment; arrows move focus *and* selection (radio semantics), wrapping and skipping disabled segments; Home and End do the same to the ends. In right-to-left writing ArrowLeft is "next" and ArrowRight "previous" (ArrowDown and ArrowUp are unchanged), as in Tabs. Under a controlled `value` the arrow still moves focus and fires `onChange`; the checked state and the pill stay where `value` says until the parent changes it. The pill slides to the selected segment. `fill` divides the width equally. Icon-only segments are wrapped in a Tooltip showing the label on every platform that has hover or focus (web, Lit); on native the label is the accessibility label. The control is horizontal only. It is not a form field: there is no `name`, no `form` block, and it neither registers with a Form nor submits a value — use RadioGroup inside a Form. Inside a Toolbar (a `role="toolbar"` ancestor; on Lit found through `composedPath`/host ancestors across shadow roots, on React Native not applicable) the arrows do not wrap: an arrow pointing out of the first or last enabled segment, and Home and End, are left unhandled (no `preventDefault`), so the toolbar moves focus to the neighbouring control. Outside a toolbar the keyboard table applies unchanged.

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
