# Generate: Input as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Input.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Input.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: InputVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Input.test.ts`.

## Component schema

```yaml
component:
  name: Input
  category: input
  status: review
  anatomy:
  - label
  - description
  - field
  - errorMessage
  props:
    label:
      type: string
      required: true
      description: Visible label (visually hidden with `hideLabel`). Never replaced
        by a placeholder.
      a11y: Programmatically associated with the field (label/for on web, accessibilityLabel
        on native).
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form when collecting values.
    value:
      type: string
      description: Controlled value. Omit for an uncontrolled field.
    defaultValue:
      type: string
      description: Initial value for an uncontrolled field.
    placeholder:
      type: string
      description: Example input shown while empty. Never the only description of
        what to enter.
      a11y: Placeholder text is muted and disappears on input; it is not a substitute
        for label or description.
    description:
      type: string
      description: Persistent helper text below the label explaining format or purpose.
      a11y: Linked to the field with aria-describedby / accessibilityHint.
    type:
      type: enum
      values:
      - text
      - email
      - password
      - number
      - search
      - tel
      - url
      default: text
      description: Input type. Drives the keyboard on touch platforms and browser
        validation on web.
    required:
      type: boolean
      default: false
      description: The field must have a value to submit. Shown in the label, not
        only by color.
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name). Only
        for a field whose context already names it: a DataGrid cell editor, a Search.'
    size:
      type: enum
      values:
      - sm
      - md
      default: md
      description: 'sm for fields inside grid cells and toolbars: minimum target height,
        tighter padding, small type.'
    disabled:
      type: boolean
      default: false
      description: Not editable and not submitted. Stays visible and readable.
    invalid:
      type: boolean
      default: false
      description: Marks the field as failing validation. Usually set by the Form;
        can be set directly.
    error:
      type: string
      description: The error message. Setting it implies `invalid`. Explain what is
        wrong and how to fix it.
      a11y: Rendered in the error slot with aria-describedby and role=alert so it
        is announced when it appears.
    autocomplete:
      type: string
      description: HTML autocomplete token (e.g. `email`, `given-name`). Enables WCAG
        1.3.5 input-purpose identification.
      platforms:
      - web
      - lit
  events:
    onChange:
      description: Fired on every value change with the new string value.
      platforms:
        web: onChange
        lit: change
        rn: onChangeText
        swiftui: onChange
    onFocus:
      description: Fired when the field receives focus.
      platforms:
        web: onFocus
        lit: focus (native, retargeted — no CustomEvent)
        rn: onFocus
        swiftui: onFocus
    onBlur:
      description: Fired when the field loses focus. The usual moment to validate.
      platforms:
        web: onBlur
        lit: blur (native, retargeted — no CustomEvent)
        rn: onBlur
        swiftui: onBlur
  styles:
    background:
      token: color.background
      locked: true
    foreground:
      token: color.foreground
      locked: true
    placeholder:
      token: color.foreground.muted
      locked: true
    border:
      token: color.border.strong
      locked: true
    borderFocus:
      token: color.border.focus
      locked: true
    borderInvalid:
      token: color.border.danger
      locked: false
    errorText:
      token: color.foreground.danger
      locked: true
    descriptionText:
      token: color.foreground.muted
      locked: true
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.md
      locked: false
    paddingInline:
      token: space.md
      locked: false
    paddingBlock:
      token: space.sm
      locked: false
    paddingBlockSm:
      token: space.1
      description: Vertical padding at size sm.
      locked: false
    paddingInlineSm:
      token: space.2
      description: Horizontal padding at size sm.
      locked: false
    partGap:
      token: space.1
      description: Vertical gap between label, description, field, and error.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    labelWeight:
      token: font.weight.medium
      locked: false
    helperSize:
      token: font.size.sm
      description: Description and error text size.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    minTargetSm:
      token: size.target.min
      description: The field height floor at size sm.
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Replaces borderWidth when focused (the field's border IS its focus
        ring — no outline); when the field is both invalid and focused the danger
        color stays and only the width changes, so the error is never hidden by focus.
        Padding shrinks by the difference so the field does not shift.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: Applied to the whole field group (label, description, field, error),
        as Button dims the whole control.
      locked: false
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: textbox
    requires:
    - label-association
    - error-identification
    - focus-visible
    - keyboard-operable
    - target-44px
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
    - foreground: color.border.strong
      background: color.background
      level: AA
      large: true
  platforms:
    web:
      element: input
      attributes:
      - id
      - name
      - type
      - aria-describedby
      - aria-invalid
      - aria-required
      - autocomplete
      notes: The label is a real <label for=id>. Description and error are linked
        with aria-describedby; the error element has role="alert".
    lit:
      tag: ds-input
      reflect:
      - type
      - required
      - disabled
      - invalid
      notes: 'Uses ElementInternals (formAssociated = true) so a native <form> that
        directly contains ds-input sees its value and validity. Inside ds-form the
        association is by `name` (see Form). `value` behaves like a native input:
        undefined = uncontrolled; consumers control by rebinding `.value`. Exposes
        `currentValue`, `form`, `validity`, `checkValidity()`, `reportValidity()`.'
    rn:
      element: TextInput
      props:
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - keyboardType
      - textContentType
      - secureTextEntry
      notes: No label element — the label is rendered as Text and also passed as accessibilityLabel;
        description as accessibilityHint. `type` maps to keyboardType and textContentType.
        Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility
        (iOS). Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent
        such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur` and `onLongPress`
        to the native element, so Tooltip can attach to it.
    swiftui:
      element: TextField
      props:
      - TextField
      - SecureField
      - .textFieldStyle=plain
      - .keyboardType
      - .textContentType
      - .textInputAutocapitalization
      - .autocorrectionDisabled
      - .focused
      - .submitLabel
      - .accessibilityLabel
      - .accessibilityHint
      - .accessibilityValue
      notes: 'Label `Text` above (visually hidden with `hideLabel` — still the `.accessibilityLabel`),
        description `Text`, the field (`TextField` or `SecureField` for `type: password`)
        inside a bordered `RoundedRectangle` drawn from the tokens (`.textFieldStyle(.plain)`;
        the border is the focus ring when focused), and the error `Text` announced
        through `AccessibilityNotification.Announcement` when it appears. `type` maps
        to `.keyboardType` (`.emailAddress`, `.numberPad`, `.phonePad`, `.URL`) and
        `autocomplete` to `.textContentType`. `description` and `error` are joined
        into `.accessibilityHint`; `invalid` adds copy.invalid to the value; `required`
        appends the indicator to the visible label. Registers with the Form environment.
        `size: sm` swaps the Sm bindings.'
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `paddingBlockSm`, `paddingInlineSm`, `partGap`, `fontFamily`, `fontSize`, `labelWeight`, `helperSize`, `lineHeight`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `errorText`, `descriptionText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Behavior scenarios (12)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-type-text
  given:
    type: text
  then:
  - renders: true
  derived: true
- name: renders-type-email
  given:
    type: email
  then:
  - renders: true
  derived: true
- name: renders-type-password
  given:
    type: password
  then:
  - renders: true
  derived: true
- name: renders-type-number
  given:
    type: number
  then:
  - renders: true
  derived: true
- name: renders-type-search
  given:
    type: search
  then:
  - renders: true
  derived: true
- name: renders-type-tel
  given:
    type: tel
  then:
  - renders: true
  derived: true
- name: renders-type-url
  given:
    type: url
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
- name: control-is-focusable
  then:
  - focusable: true
  platforms:
  - lit
  - swiftui
  - web
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
tag: ds-input
reflect:
- type
- required
- disabled
- invalid
notes: 'Uses ElementInternals (formAssociated = true) so a native <form> that directly
  contains ds-input sees its value and validity. Inside ds-form the association is
  by `name` (see Form). `value` behaves like a native input: undefined = uncontrolled;
  consumers control by rebinding `.value`. Exposes `currentValue`, `form`, `validity`,
  `checkValidity()`, `reportValidity()`.'
```

## Guidance

## Overview

Input collects a single line of text. It bundles the label, helper text, field, and error message so that the association between them is always correct — the most common accessibility failure in forms is a field whose label or error is only visually nearby.

## When to use

Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type` for the value so touch keyboards and browser validation match. Provide `description` when the format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the value is personal data so browsers and assistive tools can fill it.

## When not to use

Do not use Input for multi-line content (use TextArea, planned), for choosing from a fixed set (use Select or RadioGroup, planned), or for on/off values (use Checkbox or Switch, planned). Do not use `placeholder` as the label; it vanishes as soon as the user types and fails contrast in most systems.

## Behavior

The field is uncontrolled unless `value` is provided. `onChange` fires with the string value on every keystroke; `onBlur` is the recommended moment to validate so users are not shouted at mid-word. Setting `error` marks the field invalid, shows the message in the error slot, and announces it. Clearing `error` removes the message and the invalid state. `disabled` fields are visible, readable, focusable (aria-disabled + readOnly on web — never the native disabled attribute), and skipped by the Form; `required` appends `copy.requiredIndicator` to the visible label and sets `aria-required`. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`), then browser/type validity where the platform has it. Inside a Fieldset the field reads `FieldsetContext`: `disabled` from the group applies as if set on the field, and on native the legend prefixes the accessibility label ("Shipping address, Street"). The label is a native `<label for>` (web/Lit) styled from Input's label bindings, not a Text; description and error are Text. `hideLabel` keeps the `<label>` in the DOM, visually hidden. `size: sm` swaps paddingBlock/paddingInline/minTarget for their Sm bindings and the type to font.size.sm; nothing else changes.

## Content guidelines

Labels are short nouns in sentence case ("Email address", not "Enter your email"). Descriptions are one sentence and state the rule, not the error. Errors say what is wrong and how to fix it ("Enter an email address like name@example.com") and never blame the user.

## Accessibility

The label is always visible and programmatically associated with the field (WCAG 1.3.1, 3.3.2). Description and error are linked with `aria-describedby` so they are read with the field, and the error region uses `role="alert"` so it is announced when it appears (3.3.1 Error Identification). Required and invalid states are conveyed by text and attributes, not by color alone (1.4.1). Focus is visible using the focus ring token (2.4.7). The field reaches the 44px comfortable target height. Personal-data fields carry `autocomplete` (1.3.5). Placeholder, description, and error text all meet AA contrast; the border meets 3:1 as a non-text UI boundary (1.4.11).

## Platform notes

### Web
Render `<label for>` + `<input id>` with `aria-describedby` pointing to the description and error ids. Use `aria-invalid="true"` when invalid. Never set `disabled` on the label.

### Lit
`<ds-input name="email" type="email" label="Email address">`. The element is form-associated via `ElementInternals`, so a surrounding native `<form>` (or `<ds-form>`) collects its value and reads its validity. Dispatches `change`, `focus`, and `blur` as composed events; `change` carries `{ value }` in `detail`.

### React Native
Renders a `Text` label, optional description, a `TextInput`, and an error `Text`. The label is also passed as `accessibilityLabel`, description as `accessibilityHint`, and `accessibilityState={{ disabled }}`. `type` maps to `keyboardType` (`email-address`, `numeric`, `phone-pad`, `url`) and `secureTextEntry` for password. The enclosing Form registers the input by `name` via context so it can collect values on submit.

## Related

Form, Text, Button.
