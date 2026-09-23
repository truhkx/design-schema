# Generate: Fieldset for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Fieldset.tsx` exporting a typed React function component named `Fieldset`, plus `Fieldset.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Fieldset({ ref, …rest }: FieldsetProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
- Render the element and attributes declared under `platforms.web`. Map each event to its `platforms.web` name.
- Style ONLY through the CSS custom properties generated from tokens (`--color-…`, `--space-…`, `--font-…`, `--radius-…`). Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `var(--color-action-${variant}-background)`.
- Implement every item in `a11y.requires`:
  - `accessible-name`: the `label` prop is rendered as visible text or `aria-label`; never both empty.
  - `focus-visible`: a `:focus-visible` outline using `--color-border-focus` and `--border-width-focus`. Never remove the outline without replacing it.
  - `keyboard-operable`: native element semantics (do not build interactive elements from `<div>`).
  - `target-24px` / `target-44px`: `min-inline-size`/`min-block-size` from `--size-target-min` / `--size-target-comfortable`.
  - `heading-hierarchy`: render the heading level as the matching `<h1>`–`<h6>`; do not pick the element by visual size.
- `disabled` uses `aria-disabled="true"` and keeps the element focusable (WCAG-friendly) unless the schema says otherwise. On native checkable inputs (checkbox, radio, switch) `readOnly` has no effect, so guard with `preventDefault()` in both `click` and `change`.
- Visually hidden text (for accessible-name suffixes) uses the standard clip pattern — absolute, 1px box, `clip-path: inset(50%)`, `white-space: nowrap` — the one sanctioned use of pixel literals.
- Support light and dark by relying on the token variables only — no theme logic in the component.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard` and are removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children, no decorators that add other focusable elements.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system component. Overlays: render into a portal at `document.body` (a `container` prop may override), lock body scroll while open, make the rest of the page `inert` for modal dialogs (`focus-trap` + `inert-background`), restore focus to the opener on close (`focus-restore`), position non-modal popups with `position: fixed` from the trigger's `getBoundingClientRect()` and flip when they would overflow the viewport, and put them on the right stacking layer with `z-index: var(--layer-<name>)`.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`; title `'<Name>/React'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Fieldset> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Fieldset.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for web; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false` or calls `preventDefault()` on the event it receives. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element), only in its `state` (`:hover`, `:focus-visible`, the ARIA state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development naming `use`.
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
    legend:
      component: Text
      props:
        tone: default
        size: md
        weight: medium
        element: span
      forwards:
        legendSize: fontSize
        legendWeight: fontWeight
        fontFamily: fontFamily
        lineHeight: lineHeight
    description:
      component: Text
      props:
        tone: muted
        size: sm
        element: span
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
    errorMessage:
      component: Text
      props:
        tone: danger
        size: sm
        element: span
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
    fields:
      component: Stack
      forwards:
        fieldsGap: gap
  props:
    legend:
      type: string
      a11yRole: accessible-name
      required: true
      description: The group's name — what the fields together describe ("Shipping
        address", "Notification preferences"). Always visible.
      a11y: The accessible name of the group; screen readers read it before each field
        inside.
    children:
      type: content
      required: true
      description: The fields as direct children, usually Inputs, Checkboxes or Switches;
        Fieldset renders the Stack around them.
    description:
      type: string
      description: Persistent helper text under the legend. An empty string counts
        as unset (no part rendered, no link, no accessibilityHint).
      a11y: Linked with aria-describedby on the group.
    error:
      type: string
      description: A group-level error (cross-field validation such as "End date must
        be after start date"). Field-level errors stay on the fields. An empty string
        counts as unset (no part, no aria-invalid, no announcement).
      a11y: 'Rendered once under the group, only while set (no empty live region;
        inserting the role=alert region announces it), and linked with aria-describedby;
        while set, the group carries aria-invalid="true" (accessibilityState invalid
        is not available on native, so the error text alone identifies it there).
        Appearing is what announces: a change from one error string to another re-renders
        the text inside the region that is already there and does not announce again.'
    disabled:
      type: boolean
      default: false
      description: 'Disables every field inside. The group wins in one direction only:
        a field may disable itself while the group is enabled, but it cannot opt out
        of a disabled group — `disabled={false}` on a child of a disabled Fieldset
        is overridden, and clearing the group never enables a field that was disabled
        on its own.'
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
      description: Realised by the composed legend Text's `default` tone; no --ds-fieldset-*
        hook.
      locked: true
    legendSize:
      token: font.size.md
      part: legend
      description: Reaches the legend Text only through its `overrides.fontSize`;
        no --ds-fieldset-* hook.
      locked: false
    legendWeight:
      token: font.weight.medium
      part: legend
      description: Reaches the legend Text only through its `overrides.fontWeight`;
        no --ds-fieldset-* hook.
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed description Text's `muted` tone; no --ds-fieldset-*
        hook.
      locked: true
    helperSize:
      token: font.size.sm
      part: description
      description: Description and error text size. Reaches both Texts only through
        their `overrides.fontSize`; no --ds-fieldset-* hook.
      locked: false
    errorText:
      token: color.foreground.danger
      part: errorMessage
      description: Realised by the composed error Text's `danger` tone; no --ds-fieldset-*
        hook.
      locked: true
    partGap:
      token: layout.gap.tight
      part: group
      description: Vertical gap between legend, description, fields and error, set
        on the group root. On web and Lit the <legend> does not take part in flex
        gap, so below the legend it is a margin. One of the two bindings with a --ds-fieldset-*
        hook (--ds-fieldset-part-gap), because Fieldset's own elements read it.
      locked: false
    fieldsGap:
      token: layout.gap.{gap}
      part: fields
      description: 'The composed Stack''s gap. It reaches the Stack only as a token
        path through the Stack''s own `overrides.gap`, always sent (the override,
        else layout.gap.{gap}), and the Stack gets no `gap` prop or attribute. No
        --ds-fieldset-* hook (a Fieldset hook would not reach the Stack), and Fieldset
        does not set the Stack''s CSS hooks (--ds-stack-gap) either; page CSS sizes
        the gap through the Stack''s own hooks. Because no `gap` prop is passed, the
        Stack keeps its own default `gap` state and its modifier class or attribute
        still reads `normal` whatever Fieldset''s `gap` is: the override wins visually,
        and the rendered gap is read from the Stack''s hook, never from that class.'
      locked: false
    disabledOpacity:
      token: opacity.disabled
      part: legend
      description: 'Dims the legend and description only while `disabled`, applied
        as opacity on the Fieldset-owned legend and description elements (web/Lit
        wrappers, RN `Fieldset.legend` and `Fieldset.description` Views), never on
        the Texts. The group error is never dimmed, and the fields dim themselves,
        so the group root and the fields wrapper are never dimmed. Every element that
        carries this opacity also reports the disabled state on itself (aria-disabled
        on web and Lit, and on the two RN wrapper Views under react-native-web): the
        dim drops the legend below 4.5:1, and that is only permissible because an
        inactive control is exempt, which nothing can tell without the attribute.
        It is one of the two bindings with a --ds-fieldset-* hook (--ds-fieldset-disabled-opacity).'
      locked: false
    fontFamily:
      token: font.family.body
      part: legend
      description: Reaches the legend, description and error Texts only through their
        `overrides.fontFamily` (`part` names the first; the composition `forwards`
        decide where it goes); no --ds-fieldset-* hook.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: legend
      description: Reaches the legend, description and error Texts only through their
        `overrides.lineHeight` (`part` names the first; the composition `forwards`
        decide where it goes); no --ds-fieldset-* hook.
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
      notes: 'A native <fieldset> with a <legend>. No border and no padding (the browser
        defaults are reset); the group is structure, not a box — wrap it in a Box
        or Card for a surface. `disabled` uses aria-disabled on the fieldset and passes
        `disabled` to its direct child fields (the native disabled attribute on fieldset
        would remove fields from the tab order). Fragments are flattened unconditionally
        — on the enabled path as well as the disabled one — so the children the Stack
        receives are the same either way. No React FieldsetContext is exported, and
        no field (NumberInput included) reads one: a field nested deeper than a direct
        child is not disabled by the group, so pass it `disabled` yourself. Before
        render a "field" for the disabled pass-down is any component element or a
        native input, select, textarea, button or fieldset element; plain DOM elements
        such as <p> are left alone. The required indicator counts a narrower set —
        only the value-bearing children, so a native button or a nested fieldset is
        not counted and a group of required Inputs beside a submit Button still shows
        the indicator — and it reads `child.props.required === true`, the explicit
        prop, since before render there is nothing else to read. The description part
        is a <div data-part="description"> with the description id around the muted
        Text. The `fields` part is a <div data-part="fields"> wrapper Fieldset owns
        around the Stack; the Stack keeps its own data-part. The errorMessage part
        is a <div role="alert" data-part="errorMessage"> with the error id around
        the danger Text. A <legend> does not participate in flex gap, so partGap below
        it is a margin. With `error` set, the <fieldset> carries aria-invalid="true"
        and aria-describedby the error id (the group is the invalid thing; fields
        inside keep their own state).'
    lit:
      tag: ds-fieldset
      reflect:
      - disabled
      - gap
      notes: 'Shadow root with a <fieldset><legend> and a default slot for the fields,
        which stay in the light DOM so ds-form still collects them. The group error
        is rendered in the shadow root, and the <fieldset> carries aria-invalid="true"
        with it, as on web. The legend, description and error render their text through
        <ds-text> (element span) inside the native <legend>, a description wrapper
        and a role=alert wrapper (the description, fields and errorMessage wrappers
        are Fieldset-owned <div>s carrying both data-part and part, as on web), so
        legendSize, legendWeight, helperSize, fontFamily and lineHeight reach them
        only as Text overrides, never as Fieldset rules or by setting --ds-text-*
        hooks. `disabled` is set as the `disabled` property on direct light-DOM children
        carrying data-ds-field, on slotchange and whenever `disabled` changes, remembering
        which it set so clearing never enables a field disabled on its own. The required
        indicator is derived from those same direct data-ds-field children''s `required`,
        recomputed on slotchange and on their `required` attribute changes. A slotted
        child that carries no `data-ds-field` is not a field on Lit, for either the
        disabled pass-down or the indicator, so a bare native <input required> slotted
        in is not counted — that attribute is the platform''s only marker, and the
        narrower set is deliberate. The group''s role and accessible name come from
        the native <fieldset>/<legend> inside the shadow root; ids never cross the
        shadow boundary. The shadow root does not use delegatesFocus and Fieldset
        defines no focus(): it holds nothing focusable of its own (the fields are
        slotted light DOM, which delegation does not reach) and the group is never
        a focus target. `disabled` state assertions read the shadow <fieldset> — the
        `group` part — not the host, which only reflects the attribute; `gap` is reflected
        as an external selector for consumers and styles nothing inside the element.'
    rn:
      element: View
      props:
      - role
      - accessibilityLabel
      - accessibilityHint
      notes: 'A View with `role="group"` (not the legacy accessibilityRole) that is
        NOT `accessible` (so children stay individually reachable). Its accessibilityLabel
        is the legend plus copy.requiredIndicator when shown; `description` maps to
        its accessibilityHint, which a non-accessible View never reads out on iOS
        or Android — it is there for react-native-web, and on native the description
        reaches users through its visible Text alone. A "field" here is a direct child
        that reads FieldsetContext, so a plain Text or a decorative View beside two
        required Inputs is not counted and does not suppress the indicator; fragments
        are flattened. The legend is plain Text — not a header trait, which would
        put it in the headings rotor — and FieldsetContext carries `disabled` and
        the legend, which Input, Checkbox, Switch and RadioGroup read: they render
        disabled and prefix their accessibilityLabel with the legend ("Shipping address,
        Street"), which is how VoiceOver and TalkBack users learn the grouping on
        native. There is no clone fallback. A non-field child (plain Text, a custom
        control) gets no legend association on native; that is acceptable, since the
        legend is still read in order before it. The legend, description, fields Stack
        and error sit in plain Views carrying `Fieldset.legend`, `Fieldset.description`,
        `Fieldset.fields` and `Fieldset.errorMessage` testIDs, because Text and Stack
        take none. A non-accessible View exposes no state, so `disabled` is not asserted
        on the group; RN tests check the legend text and toHaveAccessibleName on the
        group view; the name check lives in the derived accessible-name scenario,
        so `the-legend-names-the-group` checks text only on native. The composition''s
        `element: span` is not passed to the Texts (RN Text has no `element` prop).
        The visible legend Text includes copy.requiredIndicator when shown, but FieldsetContext
        carries the bare legend, so fields read "Shipping address, Street". The group
        error is announced as in Input, in full: the Android live region (assertive)
        sits on the `Fieldset.errorMessage` wrapper View (role=alert has no native
        equivalent) with the iOS announceForAccessibility effect beside it, and both
        are silenced inside a Form that renders its own error summary, so the two
        never announce the same failure twice. That is why `a-group-error-is-announced`
        is web/Lit only. Native exposes no programmatic invalid state for a group,
        so `error-identification` is met there by the error text and its announcement
        and by nothing a screen reader can query afterwards — a platform limit, not
        a satisfied requirement. `partGap` is a plain flex gap on the root and absent
        parts render nothing, so spacing collapses on its own; on web and Lit the
        space below the <legend> is a margin instead, which does not collapse the
        same way.'
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - Stack
      - FieldsetContext=environment
      notes: 'A `.accessibilityElement(children: .contain)` labelled by the legend
        (always a `Text`; there is no legend-level prop on any platform, since a fieldset
        legend is a group name, not an outline entry) wrapping a `Stack` of fields
        with `gap` forwarded through `overrides`. Provides `FieldsetContext` (`disabled`,
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
      - lit
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
      - lit
  examples:
  - name: shipping-address
    description: Two related Inputs, labelled Street and City, as direct children
      under one legend.
    given:
      legend: Shipping address
      children: An Input name=street label=Street and an Input name=city label=City
  - name: notification-preferences
    description: Three Checkboxes, labelled Email, SMS and Push, with the rule that
      governs them under the legend.
    given:
      legend: Notification preferences
      description: You can change these at any time.
      children: A Checkbox name=email label=Email, a Checkbox name=sms label=SMS and
        a Checkbox name=push label=Push
      gap: tight
  - name: date-range-with-a-group-error
    description: Cross-field validation reported on the group rather than on one field,
      across two text Inputs labelled Start date and End date.
    given:
      legend: Reporting period
      error: End date must be after start date.
      children: An Input name=startDate label=Start date and an Input name=endDate
        label=End date
  - name: disabled-group
    description: Every field inside disabled while the section does not apply - two
      Inputs labelled Street and City.
    given:
      legend: Billing address
      disabled: true
      children: An Input name=street label=Street and an Input name=city label=City
```

## Parts and slots

- `group`: element
- `legend`: component `Text`; props `tone` = "default", `size` = "md", `weight` = "medium", `element` = "span"; forwards `legendSize` → `overrides.fontSize`, `legendWeight` → `overrides.fontWeight`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `description`: component `Text`; props `tone` = "muted", `size` = "sm", `element` = "span"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `fields`: component `Stack`; forwards `fieldsGap` → `overrides.gap`
- `errorMessage`: component `Text`; props `tone` = "danger", `size` = "sm", `element` = "span"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`

## Style bindings

- `legendColor`: token `color.foreground`; part `legend`; locked
- `legendSize`: token `font.size.md`; part `legend`
- `legendWeight`: token `font.weight.medium`; part `legend`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `helperSize`: token `font.size.sm`; part `description`
- `errorText`: token `color.foreground.danger`; part `errorMessage`; locked
- `partGap`: token `layout.gap.tight`; part `group`
- `fieldsGap`: token `layout.gap.{gap}`; part `fields`
- `disabledOpacity`: token `opacity.disabled`; part `legend`
- `fontFamily`: token `font.family.body`; part `legend`
- `lineHeight`: token `font.lineHeight.normal`; part `legend`

## Constants and examples

- example `shipping-address`, story `ShippingAddress`: given `legend: "Shipping address"`, `children: "An Input name=street label=Street and an Input name=city label=City"`; Two related Inputs, labelled Street and City, as direct children under one legend.
- example `notification-preferences`, story `NotificationPreferences`: given `legend: "Notification preferences"`, `description: "You can change these at any time."`, `children: "A Checkbox name=email label=Email, a Checkbox name=sms label=SMS and a Checkbox name=push label=Push"`, `gap: "tight"`; Three Checkboxes, labelled Email, SMS and Push, with the rule that governs them under the legend.
- example `date-range-with-a-group-error`, story `DateRangeWithAGroupError`: given `legend: "Reporting period"`, `error: "End date must be after start date."`, `children: "An Input name=startDate label=Start date and an Input name=endDate label=End date"`; Cross-field validation reported on the group rather than on one field, across two text Inputs labelled Start date and End date.
- example `disabled-group`, story `DisabledGroup`: given `legend: "Billing address"`, `disabled: true`, `children: "An Input name=street label=Street and an Input name=city label=City"`; Every field inside disabled while the section does not apply - two Inputs labelled Street and City.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed, but they still declare their hook: `locked` closes the override API, not the styling hook. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so, and for a locked binding it is the only way it can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `legendSize`, `legendWeight`, `helperSize`, `partGap`, `fieldsGap`, `disabledOpacity`, `fontFamily`, `lineHeight`
Locked (accessibility-bearing, never overridable): `legendColor`, `descriptionText`, `errorText`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-legend-names-the-group
  description: The legend is always visible and is the group's accessible name.
  given:
    legend: Delivery window
  then:
  - text: Delivery window
  - name: Delivery window
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
- name: a-disabled-group-is-marked-disabled
  description: aria-disabled on the fieldset; the fields inside stay visible and focusable
    by their own rule.
  given:
    disabled: true
  then:
  - state: disabled
    is: true
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
  - state: invalid
    is: true
  derived: true
```

## Platform notes (web)

```yaml
element: fieldset
attributes:
- aria-describedby
- aria-disabled
- aria-invalid
notes: "A native <fieldset> with a <legend>. No border and no padding (the browser\
  \ defaults are reset); the group is structure, not a box \u2014 wrap it in a Box\
  \ or Card for a surface. `disabled` uses aria-disabled on the fieldset and passes\
  \ `disabled` to its direct child fields (the native disabled attribute on fieldset\
  \ would remove fields from the tab order). Fragments are flattened unconditionally\
  \ \u2014 on the enabled path as well as the disabled one \u2014 so the children\
  \ the Stack receives are the same either way. No React FieldsetContext is exported,\
  \ and no field (NumberInput included) reads one: a field nested deeper than a direct\
  \ child is not disabled by the group, so pass it `disabled` yourself. Before render\
  \ a \"field\" for the disabled pass-down is any component element or a native input,\
  \ select, textarea, button or fieldset element; plain DOM elements such as <p> are\
  \ left alone. The required indicator counts a narrower set \u2014 only the value-bearing\
  \ children, so a native button or a nested fieldset is not counted and a group of\
  \ required Inputs beside a submit Button still shows the indicator \u2014 and it\
  \ reads `child.props.required === true`, the explicit prop, since before render\
  \ there is nothing else to read. The description part is a <div data-part=\"description\"\
  > with the description id around the muted Text. The `fields` part is a <div data-part=\"\
  fields\"> wrapper Fieldset owns around the Stack; the Stack keeps its own data-part.\
  \ The errorMessage part is a <div role=\"alert\" data-part=\"errorMessage\"> with\
  \ the error id around the danger Text. A <legend> does not participate in flex gap,\
  \ so partGap below it is a margin. With `error` set, the <fieldset> carries aria-invalid=\"\
  true\" and aria-describedby the error id (the group is the invalid thing; fields\
  \ inside keep their own state)."
```

## Guidance

## Overview

A fieldset is how a form says "these belong together." A screen-reader user tabbing into "Street" hears "Shipping address, Street" and knows where they are; a sighted user sees the legend and the fields indented under it by nothing more than rhythm. It is the container RadioGroup builds on, offered for any set of fields: an address, a date range, a set of notification switches.

## When to use

Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when the group needs a rule ("We only ship within the EU") and put cross-field errors on the group rather than on one field.

## When not to use

Do not wrap a whole form in a Fieldset; the Form's `label` names the form. Do not use it for a single field. Do not use it for visual grouping without a shared meaning — that is a Box or a Card — and do not use it as a page section (Landmark, Heading with `section` spacing). RadioGroup already is a fieldset; do not nest one inside it.

## Behavior

Renders the legend, optional description, the fields in a Stack with `gap`, and the error only while `error` is set. `disabled` disables every field inside while keeping them visible and focusable per each field's own rule. How it reaches them differs by platform: on web, Fieldset passes `disabled` to its direct child fields (fragments flattened; no React FieldsetContext is exported); on Lit, ds-fieldset sets the `disabled` property on direct children carrying data-ds-field on slotchange and whenever `disabled` changes, remembering which it set; on React Native and SwiftUI, `FieldsetContext` carries `disabled` and the legend, and Input, Checkbox, Switch and RadioGroup read it (there is no clone fallback). Inside a Form, the group itself is not a field; its children register individually, and the group `error` is set by the consumer from `onInvalid` or its own cross-field check. The `requiredIndicator` is appended inside the legend when every field inside is required, so the indicator is not repeated on each. It is plain text appended to the legend string inside the legend Text (no separate span or styling), so it inherits the legend Text's styling and is part of the group's accessible name on every platform ("Shipping address (required)"; on React Native the group's accessibilityLabel includes it). The required indicator is derived: it appears when every direct child field has `required` — the property or the attribute, either counts — and a group with no fields shows no indicator (fragments are flattened and count as direct on web and React Native; fields wrapped in a consumer's own container are not inspected — put fields directly inside the Fieldset). On Lit it is recomputed on slotchange and when a direct data-ds-field child's `required` attribute changes. On React Native the group uses the `role="group"` prop (RN ≥ 0.74), not the legacy accessibilityRole.

CSS hooks on web and Lit: only the bindings Fieldset's own elements read declare a --ds-fieldset-* hook — `partGap` (--ds-fieldset-part-gap) and `disabledOpacity` (--ds-fieldset-disabled-opacity). Bindings that only forward to a composed child (`legendSize`, `legendWeight`, `helperSize`, `fontFamily`, `lineHeight`, `fieldsGap`) and the tone-realised colors declare no hook; they are always sent as the resolved token (the override, else the binding's default token) through the child's own `overrides`.

## Content guidelines

Legends are short noun phrases in sentence case ("Shipping address") or, for a set of choices, the question ("Which days should we deliver?"). Descriptions state a rule in one sentence. Group errors name the relationship that failed ("End date must be after start date"), not the field.

## Accessibility

A native group with a name means the relationship between fields is programmatically determinable (WCAG 1.3.1) and each field's accessible context includes the group (3.3.2). Description and error are linked from the group with `aria-describedby`, the group carries `aria-invalid` while an error is set, and the error announces when it appears (3.3.1). No color-only signals; text meets AA in both modes.

## Platform notes

### Web
`<fieldset aria-describedby>` with `<legend>` and a `Stack` for the children inside a `data-part="fields"` wrapper Fieldset owns; reset the browser's border, padding and `min-inline-size`. Render the legend, description and error as `Text` (element span) inside Fieldset-owned elements carrying the parts and ids; the error wrapper has `role="alert"` and exists only while `error` is set. For `disabled`, set `aria-disabled` on the fieldset and pass `disabled` to its direct child fields, flattening fragments. Fieldset exports no FieldsetContext on web.

### Lit
`<ds-fieldset legend="Shipping address" gap="normal">` with a shadow `<fieldset><legend>` and a default slot. Set the `disabled` property on direct children carrying `data-ds-field` on `slotchange` and whenever `disabled` changes, remembering which elements it disabled so clearing does not enable a field that was disabled on its own. Derive the required indicator from the same children's `required` on `slotchange` and on their `required` attribute changes.

### React Native
`View` (not `accessible`) with `role="group"`, an accessibilityLabel of the legend plus the required indicator, and `description` as its accessibilityHint; the legend, description and error are `Text` inside plain Views carrying `Fieldset.<part>` testIDs. Provide a `FieldsetContext` carrying `disabled` and the legend; Input, Checkbox, Switch and RadioGroup read it, render disabled and prefix the legend into their `accessibilityLabel`. Fieldset does not clone children. The group error uses the same announcement mechanism as Input. Tests check the legend text and toHaveAccessibleName on the group view; a non-accessible View exposes no disabled state, so disabled is not asserted there.

## Related

Form, Input, Checkbox, RadioGroup, Stack, Box.
