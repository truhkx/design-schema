# Generate: Checkbox for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Checkbox.tsx` exporting a typed React Native function component named `Checkbox`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `CheckboxProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Checkbox> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Checkbox.test.tsx`.

## Component schema

```yaml
component:
  name: Checkbox
  category: input
  status: review
  apg: checkbox
  anatomy:
  - control
  - indicator
  - label
  - description
  - errorMessage
  props:
    label:
      type: string
      required: true
      description: Visible label. Clicking or tapping it toggles the control.
      a11y: Programmatically associated with the control (label/for on web, accessibilityLabel
        on native).
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name): a selection
        column in a Table, where the row name is the label.'
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form when collecting values.
    value:
      type: string
      default: 'on'
      description: The value submitted when checked. Lets several checkboxes share
        a `name` to form a multi-select.
    checked:
      type: boolean
      description: Controlled checked state. Omit for an uncontrolled control.
    defaultChecked:
      type: boolean
      default: false
      description: Initial state for an uncontrolled control.
    indeterminate:
      type: boolean
      default: false
      description: Shows the mixed indicator, for a parent checkbox whose children
        are partly selected. Visual and announced only; the submitted value still
        follows `checked`.
      a11y: Announced as "mixed" (aria-checked=mixed / accessibilityState checked
        "mixed").
    disabled:
      type: boolean
      default: false
      description: Cannot be toggled and is not submitted. Stays visible, readable
        and focusable.
    required:
      type: boolean
      default: false
      description: Must be checked to submit — for consent and agreement. Shown in
        the label, not only by color.
    invalid:
      type: boolean
      default: false
      description: Marks the control as failing validation. Usually set by the Form;
        can be set directly.
    description:
      type: string
      description: Persistent helper text below the label.
      a11y: Linked with aria-describedby / accessibilityHint.
    error:
      type: string
      description: The error message. Setting it marks the control invalid. Say what
        to do ("Accept the terms to continue").
      a11y: Rendered in the error slot with aria-describedby and role=alert.
  events:
    onChange:
      description: Fired when the checked state changes, with the new boolean.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
  styles:
    controlBackground:
      token: color.control.background
      locked: false
    controlBorder:
      token: color.control.border
      locked: true
    controlBorderWidth:
      token: border.width.thin
      locked: false
    controlSelectedBackground:
      token: color.control.selectedBackground
      description: Checked and indeterminate fill; the border takes the same color.
      locked: true
    indicator:
      token: color.control.selectedForeground
      description: 'The check mark (`Icon name="check"`) and the mixed dash (`Icon
        name="dash"`) in this color, at `size: xs`, centered in the control. On web/Lit
        the Icon is inside the control element; the indicator has no separate DOM
        node to hook, so tests target the control.'
      locked: true
    indicatorStroke:
      token: border.width.focus
      description: Stroke thickness of the check mark and dash.
      locked: true
    pressedOverlay:
      token: opacity.disabled
      description: While pressed, the box shows controlSelectedBackground at this
        opacity.
      locked: false
    controlBorderInvalid:
      token: color.border.danger
      locked: false
    controlSize:
      token: space.5
      locked: false
    controlRadius:
      token: radius.sm
      locked: false
    gap:
      token: space.2
      description: Horizontal gap between control and label.
      locked: false
    partGap:
      token: space.1
      description: Vertical gap between label, description, and error.
      locked: false
    labelColor:
      token: color.foreground
      locked: true
    labelSize:
      token: font.size.md
      locked: false
    labelWeight:
      token: font.weight.regular
      locked: false
    helperSize:
      token: font.size.sm
      locked: false
    descriptionText:
      token: color.foreground.muted
      locked: true
    errorText:
      token: color.foreground.danger
      locked: true
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    minTarget:
      token: size.target.comfortable
      description: Minimum height of the control + label row; the whole row is the
        hit area.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      description: Fill and indicator transitions, with motion.easing.standard.
      locked: false
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: checkbox
    requires:
    - label-association
    - error-identification
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    contrast:
    - foreground: color.control.selectedForeground
      background: color.control.selectedBackground
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
    - foreground: color.control.border
      background: color.background
      level: AA
      large: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.danger
      background: color.background
      level: AA
  platforms:
    web:
      element: input
      attributes:
      - type=checkbox
      - id
      - name
      - value
      - aria-describedby
      - aria-invalid
      - aria-required
      - aria-checked
      notes: 'A native <input type="checkbox"> styled with appearance: none — never
        a visually hidden input under a fake box, so native form participation, click-on-label
        and Space all keep working. `indeterminate` is set as the DOM property (it
        has no attribute) and mirrored as aria-checked="mixed".'
    lit:
      tag: ds-checkbox
      reflect:
      - indeterminate
      - disabled
      - required
      - invalid
      notes: 'Form-associated via ElementInternals: setFormValue(checked ? value :
        null). The internal <input> is in the shadow root with delegatesFocus, and
        its native `change` is not composed, so re-dispatch a composed `change` CustomEvent
        from the host. `checked` behaves like a native input: the `checked` attribute
        is the initial state only and the property tracks the live state, so `checked`
        is not reflected. Form value is `checked ? value : null` (native semantics);
        ds-form collects the boolean.'
    rn:
      element: Pressable
      props:
      - accessibilityRole=checkbox
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      notes: 'No native checkbox in core RN. Render Pressable containing a drawn control
        and Text label; accessibilityState={{ checked: indeterminate ? "mixed" : checked,
        disabled }}. Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility
        (iOS), as in Input.'
    swiftui:
      element: Toggle
      props:
      - Toggle
      - .toggleStyle=custom
      - .accessibilityValue
      - .accessibilityAddTraits
      - .frame=minHeight
      - .contentShape
      - Icon
      notes: A `Toggle` with a package `ToggleStyle` that draws the box from tokens
        and a `check`/`dash` Icon — SwiftUI exposes a Toggle to VoiceOver as a switch
        with on/off; the style adds `.accessibilityValue(copy.checked / copy.unchecked
        / copy.mixed)` so the state is spoken as a checkbox state, and `indeterminate`
        sets the mixed value and the dash glyph. The label is the Toggle's label view
        (`hideLabel` → `.labelsHidden()` with `.accessibilityLabel`). Description
        and error as Input. Registers with the Form environment; `disabled` per the
        conventions.
  behavior:
  - name: click-on-control-toggles-on
    when:
      click: control
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: click-on-label-toggles
    when:
      click: label
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: click-on-description-toggles
    description: The description is not inside the label (it would join the accessible
      name); a click on it is forwarded to the control.
    given:
      description: One email a month about new features.
    when:
      click: description
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: space-toggles
    when:
      key: Space
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
    platforms:
    - web
    - lit
  - name: enter-is-ignored
    description: Enter submits the enclosing form on web; the component must not intercept
      it.
    when:
      key: Enter
    then:
    - event: onChange
      fired: false
    - state: checked
      is: false
    platforms:
    - web
    - lit
  - name: toggles-back-off
    given:
      defaultChecked: true
    when:
      click: control
    then:
    - event: onChange
      with: false
    - state: checked
      is: false
  - name: indeterminate-is-announced-as-mixed
    given:
      indeterminate: true
    then:
    - state: checked
      is: mixed
  - name: disabled-does-not-toggle
    given:
      disabled: true
    when:
      click: control
    then:
    - event: onChange
      fired: false
    - state: checked
      is: false
    - state: disabled
      is: true
  - name: disabled-stays-focusable
    description: aria-disabled, not the native attribute, so the control stays in
      the tab order.
    given:
      disabled: true
    then:
    - focusable: true
    platforms:
    - web
    - lit
  - name: required-is-shown-in-the-label
    given:
      required: true
    then:
    - copy: requiredIndicator
  - name: error-marks-invalid-and-is-announced
    given:
      error: Accept the terms to continue.
    then:
    - text: Accept the terms to continue.
    - state: invalid
      is: true
      platforms:
      - web
      - lit
    - role: alert
      platforms:
      - web
      - lit
  - name: controlled-follows-prop
    description: With `checked` provided the checkbox reports the change but does
      not flip on its own. Not Lit; there the `checked` property is the live state,
      like a native input, and only the attribute is initial.
    given:
      checked: false
    when:
      click: control
    then:
    - event: onChange
      with: true
    - state: checked
      is: false
    platforms:
    - web
    - rn
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `controlBackground`, `controlBorderWidth`, `pressedOverlay`, `controlBorderInvalid`, `controlSize`, `controlRadius`, `gap`, `partGap`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `controlBorder`, `controlSelectedBackground`, `indicator`, `indicatorStroke`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth`, `minTarget`

## Behavior scenarios (11)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-on-control-toggles-on
  when:
    click: control
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: click-on-label-toggles
  when:
    click: label
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: click-on-description-toggles
  description: The description is not inside the label (it would join the accessible
    name); a click on it is forwarded to the control.
  given:
    description: One email a month about new features.
  when:
    click: description
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: toggles-back-off
  given:
    defaultChecked: true
  when:
    click: control
  then:
  - event: onChange
    with: false
  - state: checked
    is: false
- name: indeterminate-is-announced-as-mixed
  given:
    indeterminate: true
  then:
  - state: checked
    is: mixed
- name: disabled-does-not-toggle
  given:
    disabled: true
  when:
    click: control
  then:
  - event: onChange
    fired: false
  - state: checked
    is: false
  - state: disabled
    is: true
- name: required-is-shown-in-the-label
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: error-marks-invalid-and-is-announced
  given:
    error: Accept the terms to continue.
  then:
  - text: Accept the terms to continue.
- name: controlled-follows-prop
  description: With `checked` provided the checkbox reports the change but does not
    flip on its own. Not Lit; there the `checked` property is the live state, like
    a native input, and only the attribute is initial.
  given:
    checked: false
  when:
    click: control
  then:
  - event: onChange
    with: true
  - state: checked
    is: false
  platforms:
  - web
  - rn
- name: renders
  then:
  - renders: true
  derived: true
- name: error-is-identified
  given:
    error: Fix this before continuing.
  then:
  - text: Fix this before continuing.
  derived: true
```

## Platform notes (rn)

```yaml
element: Pressable
props:
- accessibilityRole=checkbox
- accessibilityLabel
- accessibilityHint
- accessibilityState
notes: 'No native checkbox in core RN. Render Pressable containing a drawn control
  and Text label; accessibilityState={{ checked: indeterminate ? "mixed" : checked,
  disabled }}. Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility
  (iOS), as in Input.'
```

## Guidance

## Overview

A checkbox is a single yes/no choice that the user makes and then submits, as opposed to a Switch, which takes effect the moment it is flipped. Groups of checkboxes are a multi-select; a single checkbox is consent, an agreement, or an option.

## When to use

Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`), or several with the same `name` when the user may pick any number of items. Use `indeterminate` on a "select all" parent when only some of its children are checked.

## When not to use

Do not use a Checkbox for a setting that applies immediately without a submit step; use Switch. Do not use it to pick exactly one of several options; use RadioGroup. Do not use a lone checkbox as an on/off for something with a strong, immediate effect (sound, notifications) — that is a Switch even if it sits in a form.

## Behavior

Clicking or tapping anywhere on the row — control, label, or description — toggles the state and fires `onChange` with the new boolean. The description is not inside the label (it would join the accessible name); a click on it is forwarded to the control. Space toggles from the keyboard; Enter does not (it submits the enclosing form on web, and the component must not intercept that). Uncontrolled unless `checked` is provided. Toggling an `indeterminate` checkbox clears the mixed state and sets `checked` to the new value; the consumer decides what happens to the children. `disabled` controls are visible, readable and focusable (`aria-disabled`, not the native attribute), and are skipped by the Form. `required` appends `copy.requiredIndicator` to the label, sets `aria-required`, and on a failed submit the Form renders `copy.required` as the error. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`) — the same order as Input. Inside a Form, `validate: blur` means "on change" for a checkbox; there is no useful blur moment. The Form collects `value` when checked and nothing (no key) when unchecked. Inside a Fieldset the field reads `FieldsetContext`: `disabled` from the group applies as if set on the field, and on native the legend prefixes the accessibility label ("Shipping address, Street").

## Content guidelines

Labels are short, positive statements of what checking does ("Send me product updates"), never negated ("Do not send me…") — a negated checkbox is a double negative when unchecked. Descriptions explain consequence or scope in one sentence. Errors say what to do, not what is wrong ("Accept the terms to create your account").

## Accessibility

The label is visible and associated with the control (WCAG 1.3.1, 3.3.2), so the accessible name is the label and the whole row is the target. The state is conveyed by the native checked state or `aria-checked`, including `mixed` (4.1.2), and the visual indicator is a shape — check mark, dash — not only a color change (1.4.1). Description and error are linked with `aria-describedby`, and the error uses `role="alert"` (3.3.1). Focus is visible on the control with the focus ring (2.4.7). The row is at least 44px tall on every platform and the control itself is 20px, inside the 24px minimum target when the row is the hit area (2.5.8). The selected fill and the rest border both meet 3:1 against the page background as UI component boundaries (1.4.11), and the indicator meets 4.5:1 on the selected fill; the build checks all pairs.

## Platform notes

### Web
Render `<input type="checkbox">` with `appearance: none` and draw the box, check mark and dash in CSS using the control tokens. Label it with `<label for>`, link description and error with `aria-describedby`. For disabled, set `aria-disabled` and call `preventDefault()` in both `click` and `change` handlers (checkboxes ignore `readOnly`) so the input stays focusable but does not toggle. `aria-checked` is set only to `"mixed"` when indeterminate; the native checked state covers the rest. Set `input.indeterminate = true` via the DOM property and add `aria-checked="mixed"`; browsers do not expose the property as an attribute.

### Lit
`<ds-checkbox>` is form-associated (`static formAssociated = true`) so a native `<form>` sees `name`/`value`, and inside `<ds-form>` it is collected by `name` like `ds-input`. The inner `<input>` lives in the shadow root with `delegatesFocus: true`; because the native `change` event is not composed, re-dispatch a composed `change` CustomEvent with `detail: { checked }`. Expose `checkValidity()` and `reportValidity()` for `required`.

### React Native
There is no checkbox in core React Native. Render a `Pressable` with `accessibilityRole="checkbox"`, `accessibilityLabel={label}`, `accessibilityHint={description}` and `accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}`, containing a `View` drawn with the control tokens and a `Text` label. The pressed state uses `controlSelectedBackground` at `disabledOpacity` on the box. Space on a hardware keyboard is handled by the platform when the role is set. Errors are announced as in Input.

## Related

Switch, RadioGroup, Form, Input.
