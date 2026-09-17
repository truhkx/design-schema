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
      controls:
        event: onChange
        default: defaultValue
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
      enumRef: size
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
      description: Fired on every value change with the new string value, and nothing
        else (web handlers do not receive the ChangeEvent).
      platforms:
        web: onChange
        lit: change
        rn: onChangeText
        swiftui: onChange
      payload:
      - name: value
        type: string
        description: The new value.
      fires:
      - user
    onFocus:
      description: 'Fired when the field receives focus. No payload: web and rn handlers
        are called with no arguments, not the FocusEvent (a forwarded Tooltip handler
        gets none either).'
      platforms:
        web: onFocus
        lit: focus (native, retargeted — no CustomEvent)
        rn: onFocus
        swiftui: onFocus
      fires:
      - user
    onBlur:
      description: 'Fired when the field loses focus. The usual moment to validate.
        No payload: web and rn handlers are called with no arguments, not the FocusEvent.'
      platforms:
        web: onBlur
        lit: blur (native, retargeted — no CustomEvent)
        rn: onBlur
        swiftui: onBlur
      fires:
      - user
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
      description: Realised by the composed Text's `danger` tone; no --ds-input-*
        hook, since a hook could not reach the child without restyling it.
      locked: true
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed Text's `muted` tone; no --ds-input-* hook,
        as for errorText.
      locked: true
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.md
      locked: false
    paddingInline:
      token: space.md
      by: size
      values:
        sm: space.2
      locked: false
    paddingBlock:
      token: space.sm
      by: size
      values:
        sm: space.1
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
      description: The field text and the label, so the label follows `size`; description
        and error use helperSize.
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      locked: false
    helperSize:
      token: font.size.sm
      description: Description and error text size. Reaches them only through the
        composed Text's `overrides` (fontSize), with fontFamily and lineHeight forwarded
        the same way; it has no --ds-input-* hook, so page CSS sizes helper text through
        Text's own hooks. fontFamily and lineHeight keep their root hooks as well,
        for the label and the field.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    minTargetSm:
      token: size.target.min
      description: The field height floor at size sm. Locked like minTarget (an accessibility
        floor, not an override), so the sm floor is always size.target.min.
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
      description: 'Applied to the whole field group (label, description, field, error),
        as Button dims the whole control. The group is the root wrapper that also
        carries partGap; it is not an anatomy part (web: the div with data-ds; Lit:
        an unnamed wrapper in the shadow root; native: the outer View with testID="Input").'
      locked: false
    transition:
      token: motion.duration.fast
      description: Border color on focus and invalid, with motion.easing.standard.
        Border width and padding change instantly (no layout animation). Instant under
        reduced motion. An override changes the duration only; the easing stays motion.easing.standard.
        Native swaps instantly, so the binding stays in the native overrides type
        for parity and an override of it has no effect there.
      locked: false
  constants:
    longPressDelay:
      description: 'Native only: how long a press on the TextInput is held before
        the forwarded onLongPress fires (the Pressable default, which TextInput lacks).'
      value: 500
      unit: ms
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
      nonText: true
  form:
    role: field
    value: value
    valueType: string
    name: name
    validation:
    - required
    - invalid
    messages:
      required: required
      invalid: invalid
    discovery: context
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
        with aria-describedby; the error element has role="alert". The forwarded ref
        targets the <input> (so focus() and select() work), not the root wrapper.
        validity follows the full precedence through setCustomValidity with the copy
        message (cleared when the field passes or is disabled); because a custom error
        makes validity.valid false, the browser/type step reads the specific flags
        (typeMismatch, badInput, patternMismatch, range, step, length). `readOnly`
        is not a schema prop but passes through the native input props; `disabled`
        forces it on.
    lit:
      tag: ds-input
      reflect:
      - type
      - size
      - required
      - disabled
      - invalid
      notes: 'Uses ElementInternals (formAssociated = true) so a native <form> that
        directly contains ds-input sees its value and validity. A disabled field is
        left out of setFormValue and out of validity, as a native disabled control
        is, while staying focusable and read-only — the field is never given the native
        disabled attribute. On web the native `<input size>` attribute (character
        width) is dropped from the prop surface: this schema''s `size` enum is the
        meaning that wins. Inside ds-form the association is by `name` (see Form);
        the host carries `data-ds-field`. `value` is property-only (no attribute,
        since a native `value` attribute means the default): undefined = uncontrolled;
        consumers control by rebinding `.value`. The initial value''s attribute is
        `default-value`. Controlled mode reverts like React: after dispatching `change`
        the field shows `.value` again unless a listener rebound it synchronously,
        so rebind in the handler, not asynchronously. `hideLabel` is the `hide-label`
        attribute, not reflected. Inside a native fieldset or form, the group''s disabled
        arrives through formDisabledCallback; ds-fieldset sets `disabled` on the field
        itself. Exposes `currentValue`, `form`, `validity`, `checkValidity()`, `reportValidity()`.
        `formResetCallback` restores the uncontrolled value to `defaultValue` and
        leaves `invalid` and `error` alone (the Form owns one, the consumer the other).
        The disabled state tests read is `aria-disabled="true"` on the inner input,
        which never has the native `disabled` attribute.'
    rn:
      element: TextInput
      props:
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - keyboardType
      - textContentType
      - secureTextEntry
      notes: 'No label element — the label is rendered as Text and also passed as
        accessibilityLabel; description as accessibilityHint. `type` maps to keyboardType
        and textContentType. Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility
        (iOS). Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent
        such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur`, `onPressOut`
        and `onLongPress` to the native element, so Tooltip can attach to it. TextInput
        has no hover or long-press handlers: `onHoverIn`/`onHoverOut` map to `onPointerEnter`/`onPointerLeave`,
        and `onLongPress` fires from `onPressIn` after the longPressDelay constant
        unless `onPressOut` comes first. The accessibilityHint is `description` then
        a forwarded hint, joined with a space; a forwarded accessibilityLabel replaces
        `label` as the name, and a Fieldset legend still goes in front ("Shipping
        address, <label>"). Disabled uses `editable={false}` with `accessibilityState.disabled`:
        iOS cannot keep a non-editable TextInput focusable, so the field is not focusable
        on native and the disabled state is announced instead. `hideLabel` does not
        render the label Text, so the `label` part has no native home while hidden
        and the name lives only in accessibilityLabel. There is no required accessibility
        state: required is conveyed by the copy.requiredIndicator label text alone,
        and the error by the live region / announcement, not role=alert. The label,
        description and errorMessage parts are plain wrapper Views carrying `testID="Input.<part>"`
        around the composed Text, because Text takes no testID (as in Fieldset); the
        error wrapper also carries the Android accessibilityLiveRegion.'
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
  behavior:
  - name: typing-reports-the-new-value
    description: onChange fires with the string value on every keystroke.
    when:
      type: a
    then:
    - event: onChange
      with: a
  - name: focus-is-reported
    description: onFocus fires when the field receives focus.
    when:
      focus: field
    then:
    - event: onFocus
  - name: required-is-shown-in-the-label
    description: required appends copy.requiredIndicator to the visible label and
      sets aria-required - text and attributes, not color alone.
    given:
      required: true
    then:
    - copy: requiredIndicator
    - attribute: aria-required
      is: 'true'
      platforms:
      - web
  - name: error-is-announced-when-it-appears
    description: The error is rendered in the error slot with role=alert so it is
      announced when it appears (WCAG 3.3.1).
    given:
      error: Enter an email address like name@example.com
    then:
    - role: alert
      platforms:
      - web
      - lit
  - name: disabled-stays-focusable-and-is-announced
    description: 'Disabled fields are visible, readable and focusable (aria-disabled,
      never the native disabled attribute). On rn only the disabled state holds: the
      field is not focusable there (see the rn notes).'
    given:
      disabled: true
    then:
    - state: disabled
      is: true
    - focusable: true
      platforms:
      - web
      - lit
  examples:
  - name: email-with-a-description
    description: A field whose format matters, with persistent helper text and the
      matching touch keyboard.
    given:
      label: Email address
      name: email
      type: email
      description: Use the email you signed up with.
  - name: required-field
    description: A field that must have a value to submit, marked in the label rather
      than by color.
    given:
      label: Full name
      name: name
      required: true
  - name: field-with-an-error
    description: A field failing validation, whose message says what is wrong and
      how to fix it.
    given:
      label: Email address
      name: email
      type: email
      error: Enter an email address like name@example.com
  - name: dense-grid-editor
    description: A small field inside a grid cell, where the column header already
      names it.
    given:
      label: Quantity
      name: quantity
      type: number
      size: sm
      hideLabel: true
```

## Events

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: string`
  - fires on: user
- `onFocus`: emit `focus (native, retargeted — no CustomEvent)`
  - fires on: user
- `onBlur`: emit `blur (native, retargeted — no CustomEvent)`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)

## Style bindings

- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `paddingInline`: token `space.md`; by `size`: sm → `space.2`, any other value → `space.md`
- `paddingBlock`: token `space.sm`; by `size`: sm → `space.1`, any other value → `space.sm`
- `labelWeight`: token `font.weight.medium`; part `label`

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: string
  name: name
  validation:
  - required
  - invalid
  messages:
    required: required
    invalid: invalid
  discovery: context
```

## Constants and examples

- constant `longPressDelay`: 500 ms
- example `email-with-a-description`, story `EmailWithADescription`: given `label: "Email address"`, `name: "email"`, `type: "email"`, `description: "Use the email you signed up with."`; A field whose format matters, with persistent helper text and the matching touch keyboard.
- example `required-field`, story `RequiredField`: given `label: "Full name"`, `name: "name"`, `required: true`; A field that must have a value to submit, marked in the label rather than by color.
- example `field-with-an-error`, story `FieldWithAnError`: given `label: "Email address"`, `name: "email"`, `type: "email"`, `error: "Enter an email address like name@example.com"`; A field failing validation, whose message says what is wrong and how to fix it.
- example `dense-grid-editor`, story `DenseGridEditor`: given `label: "Quantity"`, `name: "quantity"`, `type: "number"`, `size: "sm"`, `hideLabel: true`; A small field inside a grid cell, where the column header already names it.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `partGap`, `fontFamily`, `fontSize`, `labelWeight`, `helperSize`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `errorText`, `descriptionText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Behavior scenarios (17)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: typing-reports-the-new-value
  description: onChange fires with the string value on every keystroke.
  when:
    type: a
  then:
  - event: onChange
    with: a
- name: focus-is-reported
  description: onFocus fires when the field receives focus.
  when:
    focus: field
  then:
  - event: onFocus
- name: required-is-shown-in-the-label
  description: required appends copy.requiredIndicator to the visible label and sets
    aria-required - text and attributes, not color alone.
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: error-is-announced-when-it-appears
  description: The error is rendered in the error slot with role=alert so it is announced
    when it appears (WCAG 3.3.1).
  given:
    error: Enter an email address like name@example.com
  then:
  - role: alert
- name: disabled-stays-focusable-and-is-announced
  description: 'Disabled fields are visible, readable and focusable (aria-disabled,
    never the native disabled attribute). On rn only the disabled state holds: the
    field is not focusable there (see the rn notes).'
  given:
    disabled: true
  then:
  - state: disabled
    is: true
  - focusable: true
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
- size
- required
- disabled
- invalid
notes: "Uses ElementInternals (formAssociated = true) so a native <form> that directly\
  \ contains ds-input sees its value and validity. A disabled field is left out of\
  \ setFormValue and out of validity, as a native disabled control is, while staying\
  \ focusable and read-only \u2014 the field is never given the native disabled attribute.\
  \ On web the native `<input size>` attribute (character width) is dropped from the\
  \ prop surface: this schema's `size` enum is the meaning that wins. Inside ds-form\
  \ the association is by `name` (see Form); the host carries `data-ds-field`. `value`\
  \ is property-only (no attribute, since a native `value` attribute means the default):\
  \ undefined = uncontrolled; consumers control by rebinding `.value`. The initial\
  \ value's attribute is `default-value`. Controlled mode reverts like React: after\
  \ dispatching `change` the field shows `.value` again unless a listener rebound\
  \ it synchronously, so rebind in the handler, not asynchronously. `hideLabel` is\
  \ the `hide-label` attribute, not reflected. Inside a native fieldset or form, the\
  \ group's disabled arrives through formDisabledCallback; ds-fieldset sets `disabled`\
  \ on the field itself. Exposes `currentValue`, `form`, `validity`, `checkValidity()`,\
  \ `reportValidity()`. `formResetCallback` restores the uncontrolled value to `defaultValue`\
  \ and leaves `invalid` and `error` alone (the Form owns one, the consumer the other).\
  \ The disabled state tests read is `aria-disabled=\"true\"` on the inner input,\
  \ which never has the native `disabled` attribute."
```

## Guidance

## Overview

Input collects a single line of text. It bundles the label, helper text, field, and error message so that the association between them is always correct — the most common accessibility failure in forms is a field whose label or error is only visually nearby.

## When to use

Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type` for the value so touch keyboards and browser validation match. Provide `description` when the format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the value is personal data so browsers and assistive tools can fill it.

## When not to use

Do not use Input for multi-line content (use TextArea, planned), for choosing from a fixed set (use Select or RadioGroup, planned), or for on/off values (use Checkbox or Switch, planned). Do not use `placeholder` as the label; it vanishes as soon as the user types and fails contrast in most systems.

## Behavior

The field is uncontrolled unless `value` is provided. `onChange` fires with the string value on every keystroke; `onBlur` is the recommended moment to validate so users are not shouted at mid-word. Setting `error` marks the field invalid, shows the message in the error slot, and announces it. Clearing `error` removes the message and the invalid state that `error` implied; an `invalid` set by the Form or the consumer stays until they clear it (on Lit, where setting `error` also writes the reflected `invalid`, clearing a non-empty `error` writes it back to false and ds-form sets it again on its next validation). `required` counts only the empty string as empty, as a native field does: whitespace passes. `disabled` fields are visible, readable, focusable (aria-disabled + readOnly on web — never the native disabled attribute), and skipped by the Form; `required` appends `copy.requiredIndicator` to the visible label and sets `aria-required`; the indicator is plain label text (not aria-hidden) and stays part of the accessible name. A read-only field that is not disabled is still submitted and validated, as a native one is. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`), then browser/type validity where the platform has it — which also reports `copy.invalid`, never the browser's own validationMessage, so all user-facing text comes from the copy block. The error slot shows `error` when set; otherwise it shows a message only while `invalid` is true (set directly or by the Form): `copy.required` for an empty required field, else `copy.invalid`. An empty required field that is not yet invalid shows nothing, so the user is not flagged before typing. `validationMessage`/validity always follow the full precedence. The Form marks a failing field by setting its `invalid` and clears it when the field passes; it never sets `error`, which stays the consumer's. On web and native that mark is the field's entry in the Form context (`errors[name]`), which the field treats exactly as a Form-set `invalid`; on Lit ds-form sets the property. The error slot's order is then: the `error` prop, the Form's context entry, the `invalid`-derived copy. Inside a Fieldset `disabled` from the group applies as if set on the field — on web through the `disabled` prop Fieldset passes to its children, on Lit through the property ds-fieldset sets (or formDisabledCallback from a native fieldset/form), and on native through `FieldsetContext`, which also carries the legend that prefixes the accessibility label ("Shipping address, Street"). The label is a native `<label for>` (web/Lit) styled from Input's label bindings, not a Text; description and error are Text. `hideLabel` keeps the `<label>` in the DOM, visually hidden (web/Lit; see the native note). `size: sm` swaps paddingBlock/paddingInline/minTarget for their Sm bindings and the type of the field and the label to font.size.sm (description and error stay at helperSize); nothing else changes.

## Content guidelines

Labels are short nouns in sentence case ("Email address", not "Enter your email"). Descriptions are one sentence and state the rule, not the error. Errors say what is wrong and how to fix it ("Enter an email address like name@example.com") and never blame the user.

## Accessibility

The label is always visible and programmatically associated with the field (WCAG 1.3.1, 3.3.2). Description and error are linked with `aria-describedby` so they are read with the field, and the error region uses `role="alert"` so it is announced when it appears (3.3.1 Error Identification). Required and invalid states are conveyed by text and attributes, not by color alone (1.4.1). Focus is visible using the focus ring token (2.4.7): the `focus-visible` requirement is met by the border itself (borderFocus at focusRingWidth, padding compensating), with no separate outline. The field reaches the 44px comfortable target height. Personal-data fields carry `autocomplete` (1.3.5). Placeholder, description, and error text all meet AA contrast; the border meets 3:1 as a non-text UI boundary (1.4.11).

## Platform notes

### Web
Render `<label for>` + `<input id>` with `aria-describedby` pointing to the description and error ids. Use `aria-invalid="true"` when invalid. Never set `disabled` on the label.

### Lit
`<ds-input name="email" type="email" label="Email address">`. The element is form-associated via `ElementInternals`, so a surrounding native `<form>` (or `<ds-form>`) collects its value and reads its validity. Dispatches `change`, `focus`, and `blur` as composed events; `change` carries `{ value }` in `detail`.

### React Native
Renders a `Text` label, optional description, a `TextInput`, and an error `Text`. The label is also passed as `accessibilityLabel`, description as `accessibilityHint`, and `accessibilityState={{ disabled }}`. `type` maps to `keyboardType` (`email-address`, `numeric`, `phone-pad`, `url`) and `secureTextEntry` for password. The enclosing Form registers the input by `name` via context so it can collect values on submit.

## Related

Form, Text, Button.
