# Generate: Button for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Button.tsx` exporting a typed React Native function component named `Button`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `ButtonProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Button> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Button.test.tsx`.

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
  name: Button
  category: action
  status: review
  apg: button
  anatomy:
  - container
  - label
  - leadingIcon
  - trailingIcon
  parts:
    leadingIcon:
      kind: slot
      slot:
        prop: leadingIcon
    trailingIcon:
      kind: slot
      slot:
        prop: trailingIcon
  props:
    label:
      type: string
      required: true
      description: The button's text. Also its accessible name.
      a11y: Rendered as visible text, or as aria-label / accessibilityLabel when the
        button shows only an icon.
    variant:
      type: enum
      values:
      - primary
      - secondary
      - ghost
      - danger
      default: primary
      description: 'Visual emphasis. One primary button per view. These four are the
        whole set: there is no `outline` variant, and a bordered low-fill emphasis
        would be a new value here with its own colour pair and its own contrast proof,
        never an alias for `secondary`.'
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      - lg
      default: md
      description: Controls horizontal padding and font size. Touch targets never
        drop below the minimum regardless of size.
    leadingIcon:
      type: content
      description: Icon before the label. Decorative — hidden from assistive technology;
        the label carries the meaning.
    trailingIcon:
      type: content
      description: Icon after the label. Decorative, like leadingIcon.
    type:
      type: enum
      values:
      - button
      - submit
      default: button
      description: '`submit` submits the enclosing Form. Everything else is `button`.'
    expanded:
      type: boolean
      description: 'Set by a parent that the button discloses (Menu, Popover, SidePanel,
        Disclosure): aria-expanded on web, accessibilityState.expanded on native.
        Consumers rarely set it directly. No default, and tri-state on every platform:
        undefined means the button discloses nothing, so no expanded state is reported
        at all (no aria-expanded on the container; `expanded` omitted from accessibilityState),
        never a false one.'
    disabled:
      type: boolean
      default: false
      description: 'Prevents activation. The button stays in the tab order and is
        announced as disabled. A press blocked by `disabled` or `loading` is not a
        press: onPress does not fire and nothing chained from it (an extension''s
        tracking) runs. Inside a disabled Form the button is disabled whatever this
        prop says.'
    accessibleName:
      type: string
      description: Overrides the accessible name when it must say more than the visible
        label ("Sort by Amount, ascending" on a header that shows "Amount"). The name
        must contain the visible label (WCAG 2.5.3 label-in-name); starting with it
        is preferred but not required. Maps to aria-label / accessibilityLabel.
    overflowLabel:
      type: string
      description: 'Text used for this button when a Toolbar collapses it into its
        overflow Menu. Only Buttons collapse; other controls stay visible. Button
        itself never renders it: on web Toolbar reads it from the Button element''s
        props (it never reaches the DOM); on Lit it is the plain `overflow-label`
        attribute on ds-button, which Toolbar reads from the host.'
    iconOnly:
      type: boolean
      default: false
      description: Hides the visible label and shows only `leadingIcon`; `trailingIcon`
        is not rendered either. `label` is still required and becomes the accessible
        name. Padding becomes equal on all sides (`space.sm`).
    loading:
      type: boolean
      default: false
      description: 'Shows a ring spinner (spinnerSize across, spinnerStroke thick,
        in the resolved foreground: `currentColor` on web/Lit) in the leading icon
        slot (whether or not `leadingIcon` is set; for `iconOnly` it replaces the
        sole glyph), hides `trailingIcon`, keeps the label visible and the layout
        unchanged, and blocks repeat activation while an action is pending. The spinner
        is not an anatomy part and carries no part name; it only takes the leadingIcon
        position. `copy.loading` is announced as a description, never as part of the
        name, so it survives aria-label: web and Lit render it in a visually hidden
        node inside the button''s own tree referenced by aria-describedby (merged
        with any caller aria-describedby); rn sets `accessibilityValue={{ text: copy.loading
        }}` beside `busy`; SwiftUI uses `.accessibilityValue`.'
      platforms:
      - web
      - lit
      - rn
    inverse:
      type: boolean
      default: false
      description: 'The button sits on an inverse surface (Toast, Tooltip-like panels):
        `ghost` text uses color.inverse.link and hover uses inverseBackgroundHover
        at inverseHoverOpacity over the surface (the sanctioned color-mix of tokens
        on web/Lit; an alpha of the resolved color on native); the focus ring uses
        color.inverse.focus for every variant while `inverse` is true, since the ring
        must read against the inverse surface. Only `ghost` changes its fill on inverse
        surfaces; other variants keep their own fills, which need no pair against
        color.inverse.surface: their text is proven against their own fill, and the
        label, not the fill edge, identifies the control.'
    track:
      type: string
      description: An event name sent to analytics when the button is pressed. Omit
        for no tracking.
      source: extensions/Button.analytics.md
  events:
    onPress:
      description: 'Fired when the button is activated by pointer, keyboard (Enter/Space),
        or assistive technology. No payload: pointer position and modifiers are not
        part of the contract, so the rn handler takes no arguments (the GestureResponderEvent
        is not passed).'
      platforms:
        web: onClick
        lit: press
        rn: onPress
        swiftui: action
      fires:
      - user
    onTrack:
      description: 'Fired after onPress with the `track` name and the button''s label:
        two positional arguments on web, rn and swiftui; the Lit `track` event detail
        is `{ name, label }`.'
      platforms:
        web: onTrack
        lit: track
        rn: onTrack
        swiftui: onTrack
      payload:
      - name: name
        type: string
        description: The `track` value.
      - name: label
        type: string
        description: The button's visible label.
      source: extensions/Button.analytics.md
  styles:
    background:
      token: color.action.{variant}.background
      locked: true
    backgroundHover:
      token: color.action.{variant}.backgroundHover
      state: hover
      locked: true
      description: Pointer hover and pressed state. Locked like background and foreground,
        so an override cannot put an unproven fill behind the locked foreground.
    foreground:
      token: color.action.{variant}.foreground
      locked: true
    iconGap:
      token: space.2
      description: Gap between an icon and the label.
      locked: false
    paddingInline:
      token: space.{size}
      locked: false
    paddingBlock:
      token: space.sm
      locked: false
    radius:
      token: radius.md
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontWeight:
      token: font.weight.medium
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    inverseForeground:
      token: color.inverse.link
      description: ghost text when `inverse`.
      locked: true
    inverseFocusRing:
      token: color.inverse.focus
      description: Focus ring when `inverse`.
      locked: true
    inverseBackgroundHover:
      token: color.inverse.foreground
      state: hover
      description: 'ghost hover and pressed fill when `inverse`: this color at inverseHoverOpacity
        over color.inverse.surface.'
      locked: false
    inverseHoverOpacity:
      token: opacity.disabled
      computed:
        times: 0.25
      state: hover
      description: 'The alpha of inverseBackgroundHover: color-mix percentage on web/Lit,
        the alpha of the resolved color on native.'
      locked: false
    minTarget:
      token: size.target.min
      description: min-width and min-height of the button on every platform. Web and
        Lit apply only this floor; there is no coarse-pointer rule.
      locked: true
    touchTarget:
      token: size.target.comfortable
      platforms:
      - rn
      - swiftui
      description: 'The hit area on touch platforms, reached without changing the
        visual size: hitSlop on rn, .contentShape on SwiftUI.'
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: Applied to the whole button when disabled; colors are unchanged
        so contrast math still holds for the enabled state.
      locked: false
    transition:
      token: motion.duration.fast
      description: Background transitions on hover and press, with motion.easing.standard.
        No variant changes its foreground between states, so only the background animates.
      locked: false
    loadingSpin:
      token: motion.duration.loop
      description: One rotation of the loading indicator; disabled under prefers-reduced-motion.
      locked: false
    spinnerSize:
      token: font.size.{size}
      description: 'Diameter of the loading ring: 1em of the label font. On rn, which
        has no em, the ring is this size and its radius is half of it.'
      locked: false
    spinnerStroke:
      token: border.width.focus
      description: 'Ring thickness of the loading spinner: a spinnerSize circle with
        one quarter transparent, drawn in currentColor (the resolved foreground binding
        on rn). Locked because border.width.focus is a focus token: it keeps its `--ds-button-spinner-stroke`
        hook but is not a member of the overrides type.'
      locked: true
  copy:
    loading: Loading
  a11y:
    role: button
    requires:
    - accessible-name
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    contrast:
    - foreground: color.action.{variant}.foreground
      background: color.action.{variant}.background
      level: AA
    - foreground: color.inverse.link
      background: color.inverse.surface
      level: AA
    - foreground: color.inverse.focus
      background: color.inverse.surface
      level: AA
      nonText: true
  platforms:
    web:
      element: button
      attributes:
      - type
      - aria-disabled
      - aria-busy
      - aria-label
      notes: Use aria-disabled rather than the disabled attribute so the button remains
        discoverable by keyboard and screen readers. `expanded` is a React prop mapped
        to aria-expanded; when it is undefined, an `aria-expanded` arriving through
        `...rest` still applies, which is how Menu, Popover, Disclosure, SidePanel,
        Combobox and Search already set it.
    lit:
      tag: ds-button
      reflect:
      - variant
      - size
      - type
      - disabled
      - icon-only
      - loading
      - inverse
      - overflow-label
      notes: 'Wraps a native <button> in the shadow root with delegatesFocus so the
        host element is focusable. `press` is a composed CustomEvent. Icons are named
        slots `leading-icon` / `trailing-icon`; the part names stay the anatomy names
        verbatim (`part="leadingIcon"`, `part="trailingIcon"`), so slot names are
        kebab-case and part names camelCase. A blocked activation (disabled or loading)
        is swallowed on the inner button with preventDefault() and stopPropagation():
        neither `press` nor the native click leaves the host, and no form submits.
        ds-button is NOT form-associated (a FACE with a reflected disabled attribute
        becomes truly disabled and unfocusable); `type=submit` is handled by ds-form
        listening for `press`, and by `closest(''form'')?.requestSubmit()` only when
        no ds-form encloses the button, so a ds-form nested in a native form submits
        once. `expanded` is a JS property only (`attribute: false`) and stays tri-state
        — undefined means the button discloses nothing, so no aria-expanded is set
        at all. A disclosing parent sets `.expanded=`; a raw `aria-expanded` attribute
        on the host does not reach the inner button.'
    rn:
      element: Pressable
      props:
      - accessibilityRole=button
      - accessibilityLabel
      - accessibilityState
      - hitSlop
      notes: 'No hover state on touch; backgroundHover is applied to the pressed state.
        `type: submit` calls submit() on the nearest Form context, since there is
        no native form. Forwards `accessibilityHint`, `accessibilityLabel` (when set
        by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur`,
        `onLongPress` and `onPressOut` (chained with Button''s own pressed-state tracking)
        to the native element, so Tooltip can attach to it. The accessibilityLabel
        is `accessibleName ?? accessibilityLabel ?? label`. Button exposes its root
        Pressable as `ref` so a parent (Tooltip, Toolbar) can measure and focus it.
        `disabled` is never passed to Pressable, which would drop it from the focus
        order: it is a press guard plus `accessibilityState.disabled`, so a hardware-keyboard
        user can still focus it and the press is swallowed, as on web.'
    swiftui:
      element: Button
      props:
      - action
      - .buttonStyle=custom
      - .accessibilityLabel
      - .accessibilityHint
      - .accessibilityAddTraits=isButton
      - .frame=minWidth-minHeight
      - .contentShape
      - .focusable
      - .focused
      - .onLongPressGesture
      notes: A SwiftUI `Button(action:)` with a package `ButtonStyle` (`DSButtonStyle`)
        that draws variant/size from tokens and reads `isPressed` for the pressed
        state; hover from `.onHover` on iPad pointer. `iconOnly` sets `.accessibilityLabel(label)`
        and hides the text; `accessibleName` overrides the label (and must contain
        the visible one); `loading` sets `.accessibilityValue(copy.loading)`, disables
        presses without `.disabled`, and swaps the leading icon for a `ProgressView`
        tinted from the foreground token. `disabled` is `.accessibilityRespondsToUserInteraction(false)`
        + `.opacity` + guard, keeping the button focusable per the doc. Long press
        forwards to Tooltip through `onLongPress`; `accessibilityHint` is forwarded
        verbatim. `overflowLabel` is read by Toolbar only.
  behavior:
  - name: click-fires-on-press
    when:
      click: container
    then:
    - event: onPress
  - name: enter-activates
    description: 'Activation fires onPress exactly once per pointer click, Enter key,
      Space key, or assistive-technology activation. Native: the <button> synthesises
      the click, so no key handling is written.'
    when:
      key: Enter
    then:
    - event: onPress
    platforms:
    - web
    - lit
  - name: space-activates
    description: 'Native: the <button> synthesises the click from Space, so no key
      handling is written.'
    when:
      key: Space
    then:
    - event: onPress
    platforms:
    - web
    - lit
  - name: disabled-does-not-fire
    given:
      disabled: true
    when:
      click: container
    then:
    - event: onPress
      fired: false
    - state: disabled
      is: true
  - name: disabled-stays-focusable
    description: aria-disabled, not the native attribute, so the button stays in the
      tab order and can be discovered.
    given:
      disabled: true
    then:
    - focusable: true
    platforms:
    - web
    - lit
  - name: loading-announces-busy-and-ignores-activation
    description: While loading is true the button announces itself as busy and ignores
      further activation, but keeps its size so the layout does not shift.
    given:
      loading: true
    when:
      click: container
    then:
    - event: onPress
      fired: false
    - attribute: aria-busy
      is: 'true'
      platforms:
      - web
      - lit
  - name: expanded-is-reported
    given:
      expanded: true
    then:
    - state: expanded
      is: true
  - name: icon-only-keeps-its-name
    description: iconOnly hides the visible label, and label becomes the accessible
      name.
    given:
      iconOnly: true
      accessibleName: Open menu
    then:
    - name: Open menu
  - name: press-tracks
    given:
      track: signup
      label: Sign up
    when:
      click: container
    then:
    - event: onTrack
      with:
        name: signup
        label: Sign up
    source: extensions/Button.analytics.md
  examples:
  - name: primary-save
    description: The single most important action in a view, labelled with the outcome.
    given:
      label: Save changes
      variant: primary
  - name: destructive-confirm
    description: A destructive, hard-to-undo action, which is the only use of the
      danger variant.
    given:
      label: Delete file
      variant: danger
  - name: icon-only-in-a-toolbar
    description: A low-emphasis icon-only control in dense UI, whose label says what
      it does rather than what the icon depicts.
    given:
      label: Close
      iconOnly: true
      leadingIcon: The close Icon
      variant: ghost
      size: sm
  - name: pending-submit
    description: The submit button of a form while the request is in flight - busy,
      and ignoring repeat activation.
    given:
      label: Create account
      type: submit
      loading: true
    platforms:
    - web
    - lit
    - rn
```

## Events

- `onPress`: emit `onPress`
  - fires on: user
- `onTrack`: emit `onTrack`
  - payload, positional, in this order: `name: string`, `label: string`

## Parts and slots

- `container`: element
- `label`: element
- `leadingIcon`: slot, prop `leadingIcon`
- `trailingIcon`: slot, prop `trailingIcon`

## Style bindings

- `backgroundHover`: token `color.action.{variant}.backgroundHover`; state `hover`; locked
- `inverseBackgroundHover`: token `color.inverse.foreground`; state `hover`
- `inverseHoverOpacity`: token `opacity.disabled`; state `hover`; computed `t.opacityDisabled * 0.25`
- `touchTarget`: token `size.target.comfortable`; on rn, swiftui; locked

## Constants and examples

- example `primary-save`, story `PrimarySave`: given `label: "Save changes"`, `variant: "primary"`; The single most important action in a view, labelled with the outcome.
- example `destructive-confirm`, story `DestructiveConfirm`: given `label: "Delete file"`, `variant: "danger"`; A destructive, hard-to-undo action, which is the only use of the danger variant.
- example `icon-only-in-a-toolbar`, story `IconOnlyInAToolbar`: given `label: "Close"`, `iconOnly: true`, `leadingIcon: "The close Icon"`, `variant: "ghost"`, `size: "sm"`; A low-emphasis icon-only control in dense UI, whose label says what it does rather than what the icon depicts.
- example `pending-submit`, story `PendingSubmit`: given `label: "Create account"`, `type: "submit"`, `loading: true`; The submit button of a form while the request is in flight - busy, and ignoring repeat activation.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `iconGap`, `paddingInline`, `paddingBlock`, `radius`, `fontFamily`, `fontWeight`, `fontSize`, `inverseBackgroundHover`, `inverseHoverOpacity`, `disabledOpacity`, `transition`, `loadingSpin`, `spinnerSize`
Locked (accessibility-bearing, never overridable): `background`, `backgroundHover`, `foreground`, `focusRing`, `focusRingWidth`, `inverseForeground`, `inverseFocusRing`, `minTarget`, `touchTarget`, `spinnerStroke`

## Behavior scenarios (17)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-fires-on-press
  when:
    click: container
  then:
  - event: onPress
- name: disabled-does-not-fire
  given:
    disabled: true
  when:
    click: container
  then:
  - event: onPress
    fired: false
  - state: disabled
    is: true
- name: loading-announces-busy-and-ignores-activation
  description: While loading is true the button announces itself as busy and ignores
    further activation, but keeps its size so the layout does not shift.
  given:
    loading: true
  when:
    click: container
  then:
  - event: onPress
    fired: false
- name: expanded-is-reported
  given:
    expanded: true
  then:
  - state: expanded
    is: true
- name: icon-only-keeps-its-name
  description: iconOnly hides the visible label, and label becomes the accessible
    name.
  given:
    iconOnly: true
    accessibleName: Open menu
  then:
  - name: Open menu
- name: press-tracks
  given:
    track: signup
    label: Sign up
  when:
    click: container
  then:
  - event: onTrack
    with:
      name: signup
      label: Sign up
  source: extensions/Button.analytics.md
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-variant-primary
  given:
    variant: primary
  then:
  - renders: true
  derived: true
- name: renders-variant-secondary
  given:
    variant: secondary
  then:
  - renders: true
  derived: true
- name: renders-variant-ghost
  given:
    variant: ghost
  then:
  - renders: true
  derived: true
- name: renders-variant-danger
  given:
    variant: danger
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
- name: renders-size-lg
  given:
    size: lg
  then:
  - renders: true
  derived: true
- name: renders-type-button
  given:
    type: button
  then:
  - renders: true
  derived: true
- name: renders-type-submit
  given:
    type: submit
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
element: Pressable
props:
- accessibilityRole=button
- accessibilityLabel
- accessibilityState
- hitSlop
notes: 'No hover state on touch; backgroundHover is applied to the pressed state.
  `type: submit` calls submit() on the nearest Form context, since there is no native
  form. Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent such
  as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur`, `onLongPress` and `onPressOut`
  (chained with Button''s own pressed-state tracking) to the native element, so Tooltip
  can attach to it. The accessibilityLabel is `accessibleName ?? accessibilityLabel
  ?? label`. Button exposes its root Pressable as `ref` so a parent (Tooltip, Toolbar)
  can measure and focus it. `disabled` is never passed to Pressable, which would drop
  it from the focus order: it is a press guard plus `accessibilityState.disabled`,
  so a hardware-keyboard user can still focus it and the press is swallowed, as on
  web.'
```

## Guidance

## Overview

Buttons let people take actions and make choices with a single tap or click. They communicate what will happen through their label, and their emphasis through their variant.

## When to use

Use a Button when the user needs to **do something**: submit, save, confirm, open, add, delete. The label should be a verb or verb phrase that describes the outcome ("Save changes", not "OK").

Use the `primary` variant for the single most important action in a view. Use `secondary` for the alternatives beside it, `ghost` for low-emphasis actions in dense UI such as toolbars, and `danger` only for destructive, hard-to-undo actions.

## When not to use

Do not use a Button to **navigate** to another page or screen; use a Link, so the destination is exposed to assistive technology and works with open-in-new-tab. Button has no `href` and never renders an anchor. A navigation that wants a button's visual weight — a landing page's call to action — is today a plain Link: giving it that weight would be an appearance prop on Link's own schema, and it is never page CSS restating Button's fill, which would drift from the component at the first token change. Do not use more than one `primary` button in the same region — if everything is emphasized, nothing is. Do not use `disabled` to communicate *why* an action is unavailable; prefer keeping the button enabled and explaining the problem on activation, or show the reason inline.

## Behavior

Activation fires `onPress` exactly once per pointer click, Enter key, Space key, or assistive-technology activation. While `loading` is true the button announces itself as busy and ignores further activation, but keeps its size so the layout does not shift. `disabled` buttons remain focusable so that keyboard and screen-reader users can discover them; they are announced as "dimmed" or "disabled" and do not fire `onPress`.

## Content guidelines

Labels are sentence case, one to three words, and start with a verb. Avoid "Yes"/"No"; restate the action ("Delete file" / "Keep file"). Icon-only buttons must set `label` to what the button does, not what the icon depicts ("Close", not "X").

## Accessibility

Every button must have an accessible name (WCAG 4.1.2). The name comes from the visible label or, for `iconOnly`, from the `label` prop rendered as `aria-label` / `accessibilityLabel`. Focus must be visible (WCAG 2.4.7 and 2.4.11): the focus ring uses `color.border.focus` at `border.width.focus` and is never removed without a replacement. The interactive target is at least 24×24 CSS px (WCAG 2.5.8, AA) at every `size`, and 44×44 on touch platforms following iOS and Android guidelines. Text and background pairs for every variant meet 4.5:1 (WCAG 1.4.3) in both light and dark themes — the build checks this against the tokens. Buttons are activated with Enter and Space, and never rely on hover alone to convey state.

## Platform notes

### Web
Render a native `<button>` with `type` from the prop (default `button`, so a button inside a form never submits by accident). Use `aria-disabled="true"` for the disabled state; the button stays in the tab order. Set `aria-busy="true"` while loading.

### Lit
The host element `<ds-button>` reflects `variant`, `size`, `disabled`, `icon-only` and `loading` as attributes so consumers can style states from outside the shadow root. The inner element is a real `<button>`; the shadow root is created with `delegatesFocus: true`. Activation dispatches a composed, bubbling `press` CustomEvent. Consumers can also listen to the native `click` that bubbles out of the shadow root; a click blocked by `disabled` or `loading` never leaves it.

### React Native
Render a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel={label}` and `accessibilityState={{ disabled, busy: loading }}`. There is no CSS cascade, so every style binding is applied explicitly from the token object. Because there is no hover on touch, `backgroundHover` is used for the pressed state. Icons passed as `leadingIcon`/`trailingIcon` are the system `Icon` and are rendered as given: there is no cascade, so Button cannot recolor them, and callers pass the variant's foreground to the Icon's own `overrides.color`. When the visual footprint is smaller than 44px, add `hitSlop` to reach the comfortable target size.

## Related

Form, Link, Icon, Toolbar, ButtonGroup (planned).

## Extensions

The schema above already includes what these extensions add (items marked `source: extensions/...`). Implement them like any other prop, event, binding, copy string, keyboard rule or scenario.

### analytics — `extensions/Button.analytics.md`

Product analytics needs to know which buttons people press, without every screen wiring its own handler and without the generated Button knowing which analytics vendor is in use. `track` names the event; when it is set, a press calls the hand-written `trackPress` module with the event name and the button's visible label, then fires `onTrack` with the same pair so a screen can react (a toast, a redirect) without touching analytics itself.

The module is the seam. `packages/<platform>/src/custom/analytics.ts` is owned by the adopter: in development it logs the pair to the console; in production it is a no-op until someone points it at a vendor SDK. The generated component imports `trackPress` from `./custom/analytics` and calls it exactly once per press, after `onPress` and before `onTrack`, only when `track` is set. It never reads or rewrites the module body, and a press with no `track` is exactly the upstream Button.

**Hand-written modules** — import and call them exactly as stated; never create, edit or copy anything under `src/custom/`:

- `import { trackPress } from './custom/analytics';` — signature `(name: string, label: string) => void`. Called from onPress when `track` is set, before onTrack fires.
