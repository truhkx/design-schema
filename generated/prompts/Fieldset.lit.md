# Generate: Fieldset as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Fieldset.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Fieldset.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: FieldsetVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Fieldset.test.ts`.

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
    fields: Stack
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
      locked: true
    legendSize:
      token: font.size.md
      locked: false
    legendWeight:
      token: font.weight.medium
      locked: false
    descriptionText:
      token: color.foreground.muted
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
        is rendered in the shadow root. `disabled` is propagated to slotted ds-* fields
        via their `disabled` property on slotchange and reverted when cleared (remembering
        which it set), the same way ds-form does.
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `legendSize`, `legendWeight`, `helperSize`, `partGap`, `fieldsGap`, `disabledOpacity`, `fontFamily`, `lineHeight`
Locked (accessibility-bearing, never overridable): `legendColor`, `descriptionText`, `errorText`

## Behavior scenarios (6)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (lit)

```yaml
tag: ds-fieldset
reflect:
- disabled
- gap
notes: Shadow root with a <fieldset><legend> and a default slot for the fields, which
  stay in the light DOM so ds-form still collects them. The group error is rendered
  in the shadow root. `disabled` is propagated to slotted ds-* fields via their `disabled`
  property on slotchange and reverted when cleared (remembering which it set), the
  same way ds-form does.
```

## Guidance

## Overview

A fieldset is how a form says "these belong together." A screen-reader user tabbing into "Street" hears "Shipping address, Street" and knows where they are; a sighted user sees the legend and the fields indented under it by nothing more than rhythm. It is the container RadioGroup builds on, offered for any set of fields: an address, a date range, a set of notification switches.

## When to use

Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when the group needs a rule ("We only ship within the EU") and put cross-field errors on the group rather than on one field.

## When not to use

Do not wrap a whole form in a Fieldset; the Form's `label` names the form. Do not use it for a single field. Do not use it for visual grouping without a shared meaning — that is a Box or a Card — and do not use it as a page section (Landmark, Heading with `section` spacing). RadioGroup already is a fieldset; do not nest one inside it.

## Behavior

Renders the legend, optional description, the fields in a Stack with `gap`, and an optional error. `disabled` disables every field inside while keeping them visible and focusable per each field's own rule. Inside a Form, the group itself is not a field; its children register individually, and the group `error` is set by the consumer from `onInvalid` or its own cross-field check. The `requiredIndicator` is appended to the legend when every field inside is required, so the indicator is not repeated on each. The required indicator is derived: it appears when every direct child field has `required` (fields wrapped in a consumer's own container are not inspected — put fields directly inside the Fieldset). `disabled` and the legend reach the fields through `FieldsetContext`, which Input, Checkbox, Switch and RadioGroup read: they render disabled, and on native prefix their accessibility label with the legend; until a field reads the context, Fieldset also clones direct children with `disabled`. On React Native the group uses the `role="group"` prop (RN ≥ 0.74), not the legacy accessibilityRole.

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
