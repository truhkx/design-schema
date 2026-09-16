# Generate: Fieldset for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Fieldset.tsx` exporting a typed React Native function component named `Fieldset`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `FieldsetProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Fieldset> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Fieldset.test.tsx`.

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
  name: Fieldset
  category: input
  status: review
  anatomy:
  - group
  - legend
  - description
  - fields
  - errorMessage
  composition:
    legend: Text
    description: Text
    fields:
      component: Stack
      forwards:
        fieldsGap: gap
  props:
    legend:
      type: string
      required: true
      description: The group's name — what the fields together describe ("Shipping
        address", "Notification preferences"). Always visible.
      a11y: The accessible name of the group; screen readers read it before each field
        inside.
    children:
      type: content
      required: true
      description: The fields, usually a Stack of Inputs, Checkboxes or Switches.
    description:
      type: string
      description: Persistent helper text under the legend.
      a11y: Linked with aria-describedby on the group.
    error:
      type: string
      description: A group-level error (cross-field validation such as "End date must
        be after start date"). Field-level errors stay on the fields.
      a11y: Rendered once under the group with role=alert and linked with aria-describedby;
        while set, the group carries aria-invalid="true" (accessibilityState invalid
        is not available on native, so the error text alone identifies it there).
    disabled:
      type: boolean
      default: false
      description: Disables every field inside. Fields keep their own `disabled` for
        finer control.
    gap:
      type: enum
      values:
      - tight
      - normal
      - loose
      default: normal
      description: Gap between the fields, from the layout rhythm. Fieldset renders
        the Stack itself; children are the raw fields.
  styles:
    legendColor:
      token: color.foreground
      part: legend
      locked: true
    legendSize:
      token: font.size.md
      part: legend
      locked: false
    legendWeight:
      token: font.weight.medium
      part: legend
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      locked: true
    helperSize:
      token: font.size.sm
      locked: false
    errorText:
      token: color.foreground.danger
      locked: true
    partGap:
      token: layout.gap.tight
      description: Vertical gap between legend, description, fields and error.
      locked: false
    fieldsGap:
      token: layout.gap.{gap}
      part: fields
      description: The composed Stack's gap. An `overrides.fieldsGap` is forwarded
        to the Stack's own `overrides.gap`; Fieldset never styles the Stack itself.
      locked: false
    disabledOpacity:
      token: opacity.disabled
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
  copy:
    requiredIndicator: ' (required)'
  a11y:
    role: group
    requires:
    - accessible-name
    - label-association
    - error-identification
    - contrast-aa
    contrast:
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
      element: fieldset
      attributes:
      - aria-describedby
      - aria-disabled
      - aria-invalid
      notes: A native <fieldset> with a <legend>. No border and no padding (the browser
        defaults are reset); the group is structure, not a box — wrap it in a Box
        or Card for a surface. `disabled` uses aria-disabled on the fieldset plus
        each field's own disabled handling (the native disabled attribute on fieldset
        would remove fields from the tab order). A <legend> does not participate in
        flex gap, so partGap below it is a margin. With `error` set, the <fieldset>
        carries aria-invalid="true" and aria-describedby the error id (the group is
        the invalid thing; fields inside keep their own state).
    lit:
      tag: ds-fieldset
      reflect:
      - disabled
      - gap
      notes: Shadow root with a <fieldset><legend> and a default slot for the fields,
        which stay in the light DOM so ds-form still collects them. The group error
        is rendered in the shadow root, and the <fieldset> carries aria-invalid="true"
        with it, as on web. The legend and description render their text through <ds-text>
        inside the native <legend>/<p>, so legendSize, legendWeight and helperSize
        reach it as Text overrides rather than as Fieldset's own rules. `disabled`
        is propagated to slotted ds-* fields via their `disabled` property on slotchange
        and reverted when cleared (remembering which it set), the same way ds-form
        does.
    rn:
      element: View
      props:
      - accessibilityRole
      - accessibilityLabel
      - accessibilityHint
      notes: A View that is NOT `accessible` (so children stay individually reachable).
        The legend is plain Text — not a header trait, which would put it in the headings
        rotor — and each child field receives the legend as a prefix in its accessibilityLabel
        through a FieldsetContext ("Shipping address, Street"), which is how VoiceOver
        and TalkBack users learn the grouping on native. The group error is announced
        as in Input.
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - Stack
      - FieldsetContext=environment
      notes: 'A `.accessibilityElement(children: .contain)` labelled by the legend
        (`Heading` or `Text` per `legendLevel`) wrapping a `Stack` of fields with
        `gap` forwarded through `overrides`. Provides `FieldsetContext` (`disabled`,
        legend) through the environment so fields prefix their accessibility label
        with the legend (''Shipping address, Street'') — the iOS way to say what `<fieldset>`
        says.'
  behavior:
  - name: the-legend-names-the-group
    description: The legend is always visible and is the group's accessible name.
    given:
      legend: Delivery window
    then:
    - text: Delivery window
    - name: Delivery window
      platforms:
      - web
  - name: the-description-is-rendered
    description: Persistent helper text under the legend, linked to the group.
    given:
      description: We only ship within the EU.
    then:
    - text: We only ship within the EU.
  - name: a-group-error-is-announced
    description: The group error is rendered once under the group with role=alert.
    given:
      error: End date must be after start date.
    then:
    - role: alert
      platforms:
      - web
      - lit
  - name: a-disabled-group-is-marked-disabled
    description: aria-disabled on the fieldset; the fields inside stay visible and
      focusable by their own rule.
    given:
      disabled: true
    then:
    - state: disabled
      is: true
      platforms:
      - web
  examples:
  - name: shipping-address
    description: Two related Inputs under one legend.
    given:
      legend: Shipping address
      children: Street and city Inputs.
  - name: notification-preferences
    description: A set of Checkboxes with the rule that governs them under the legend.
    given:
      legend: Notification preferences
      description: You can change these at any time.
      children: Email, SMS and Push Checkboxes.
      gap: tight
  - name: date-range-with-a-group-error
    description: Cross-field validation reported on the group rather than on one field.
    given:
      legend: Reporting period
      error: End date must be after start date.
      children: Start date and End date Inputs.
  - name: disabled-group
    description: Every field inside disabled while the section does not apply.
    given:
      legend: Billing address
      disabled: true
      children: Street and city Inputs.
```

## Parts and slots

- `group`: element
- `legend`: component `Text`
- `description`: component `Text`
- `fields`: component `Stack`; forwards `fieldsGap` → `overrides.gap`
- `errorMessage`: element

## Style bindings

- `legendColor`: token `color.foreground`; part `legend`; locked
- `legendSize`: token `font.size.md`; part `legend`
- `legendWeight`: token `font.weight.medium`; part `legend`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `fieldsGap`: token `layout.gap.{gap}`; part `fields`

## Constants and examples

- example `shipping-address`, story `ShippingAddress`: given `legend: "Shipping address"`, `children: "Street and city Inputs."`; Two related Inputs under one legend.
- example `notification-preferences`, story `NotificationPreferences`: given `legend: "Notification preferences"`, `description: "You can change these at any time."`, `children: "Email, SMS and Push Checkboxes."`, `gap: "tight"`; A set of Checkboxes with the rule that governs them under the legend.
- example `date-range-with-a-group-error`, story `DateRangeWithAGroupError`: given `legend: "Reporting period"`, `error: "End date must be after start date."`, `children: "Start date and End date Inputs."`; Cross-field validation reported on the group rather than on one field.
- example `disabled-group`, story `DisabledGroup`: given `legend: "Billing address"`, `disabled: true`, `children: "Street and city Inputs."`; Every field inside disabled while the section does not apply.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `legendSize`, `legendWeight`, `helperSize`, `partGap`, `fieldsGap`, `disabledOpacity`, `fontFamily`, `lineHeight`
Locked (accessibility-bearing, never overridable): `legendColor`, `descriptionText`, `errorText`

## Behavior scenarios (8)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-legend-names-the-group
  description: The legend is always visible and is the group's accessible name.
  given:
    legend: Delivery window
  then:
  - text: Delivery window
- name: the-description-is-rendered
  description: Persistent helper text under the legend, linked to the group.
  given:
    description: We only ship within the EU.
  then:
  - text: We only ship within the EU.
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-gap-tight
  given:
    gap: tight
  then:
  - renders: true
  derived: true
- name: renders-gap-normal
  given:
    gap: normal
  then:
  - renders: true
  derived: true
- name: renders-gap-loose
  given:
    gap: loose
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
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
element: View
props:
- accessibilityRole
- accessibilityLabel
- accessibilityHint
notes: "A View that is NOT `accessible` (so children stay individually reachable).\
  \ The legend is plain Text \u2014 not a header trait, which would put it in the\
  \ headings rotor \u2014 and each child field receives the legend as a prefix in\
  \ its accessibilityLabel through a FieldsetContext (\"Shipping address, Street\"\
  ), which is how VoiceOver and TalkBack users learn the grouping on native. The group\
  \ error is announced as in Input."
```

## Guidance

## Overview

A fieldset is how a form says "these belong together." A screen-reader user tabbing into "Street" hears "Shipping address, Street" and knows where they are; a sighted user sees the legend and the fields indented under it by nothing more than rhythm. It is the container RadioGroup builds on, offered for any set of fields: an address, a date range, a set of notification switches.

## When to use

Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when the group needs a rule ("We only ship within the EU") and put cross-field errors on the group rather than on one field.

## When not to use

Do not wrap a whole form in a Fieldset; the Form's `label` names the form. Do not use it for a single field. Do not use it for visual grouping without a shared meaning — that is a Box or a Card — and do not use it as a page section (Landmark, Heading with `section` spacing). RadioGroup already is a fieldset; do not nest one inside it.

## Behavior

Renders the legend, optional description, the fields in a Stack with `gap`, and an optional error. `disabled` disables every field inside while keeping them visible and focusable per each field's own rule. Inside a Form, the group itself is not a field; its children register individually, and the group `error` is set by the consumer from `onInvalid` or its own cross-field check. The `requiredIndicator` is appended to the legend when every field inside is required, so the indicator is not repeated on each. The required indicator is derived: it appears when every direct child field has `required` (fields wrapped in a consumer's own container are not inspected — put fields directly inside the Fieldset). `disabled` and the legend reach the fields through `FieldsetContext`, which Input, Checkbox, Switch and RadioGroup read: they render disabled, and on native prefix their accessibility label with the legend; until a field reads the context, Fieldset also clones direct children with `disabled` — a direct child that is not a field (a plain wrapper, a piece of text) takes the cloned prop and ignores it, which is the intended no-op rather than an error. On React Native the group uses the `role="group"` prop (RN ≥ 0.74), not the legacy accessibilityRole.

## Content guidelines

Legends are short noun phrases in sentence case ("Shipping address") or, for a set of choices, the question ("Which days should we deliver?"). Descriptions state a rule in one sentence. Group errors name the relationship that failed ("End date must be after start date"), not the field.

## Accessibility

A native group with a name means the relationship between fields is programmatically determinable (WCAG 1.3.1) and each field's accessible context includes the group (3.3.2). Description and error are linked from the group with `aria-describedby`, the group carries `aria-invalid` while an error is set, and the error announces when it appears (3.3.1). No color-only signals; text meets AA in both modes.

## Platform notes

### Web
`<fieldset aria-describedby>` with `<legend>` and a `Stack` for the children; reset the browser's border, padding and `min-inline-size`. Render the description and error as `Text` with ids; the error has `role="alert"`. For `disabled`, set `aria-disabled` on the fieldset and pass `disabled` down through a `FieldsetContext` that Input, Checkbox, Switch and RadioGroup read (add the context read to those components when they regenerate; until then, the fieldset clones direct children with `disabled`).

### Lit
`<ds-fieldset legend="Shipping address" gap="normal">` with a shadow `<fieldset><legend>` and a default slot. Propagate `disabled` to slotted `ds-*` fields on `slotchange` and on change, remembering which elements it disabled so clearing does not enable a field that was disabled on its own.

### React Native
`View` (not `accessible`) with the legend and description as `Text`; provide a `FieldsetContext` with the legend that Input, Checkbox, Switch and RadioGroup prefix into their `accessibilityLabel`. The group error uses the same announcement mechanism as Input. `disabled` flows through the same context.

## Related

Form, Input, Checkbox, RadioGroup, Stack, Box.
