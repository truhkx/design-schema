---
title: Input
description: A single-line text field with a visible label, optional description, and an error message that is announced to assistive technology.
component:
  name: Input
  category: input
  status: review
  anatomy: [label, description, field, errorMessage]
  props:
    label:
      type: string
      required: true
      description: Visible label (visually hidden with `hideLabel`). Never replaced by a placeholder.
      a11y: Programmatically associated with the field (label/for on web, accessibilityLabel on native).
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
      description: Example input shown while empty. Never the only description of what to enter.
      a11y: Placeholder text is muted and disappears on input; it is not a substitute for label or description.
    description:
      type: string
      description: Persistent helper text below the label explaining format or purpose.
      a11y: Linked to the field with aria-describedby / accessibilityHint.
    type:
      type: enum
      values: [text, email, password, number, search, tel, url]
      default: text
      description: Input type. Drives the keyboard on touch platforms and browser validation on web.
    required:
      type: boolean
      default: false
      description: The field must have a value to submit. Shown in the label, not only by color.
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name). Only for a field whose context already names it: a DataGrid cell editor, a Search.'
    size:
      type: enum
      enumRef: size
      values: [sm, md]
      default: md
      description: 'sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type.'
    disabled:
      type: boolean
      default: false
      description: Not editable and not submitted. Stays visible and readable.
    invalid:
      type: boolean
      default: false
      description: Marks the field as failing validation. Usually set by the Form; can be set directly.
    error:
      type: string
      description: The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it.
      a11y: Rendered in the error slot with aria-describedby and role=alert so it is announced when it appears.
    autocomplete:
      type: string
      description: HTML autocomplete token (e.g. `email`, `given-name`). Enables WCAG 1.3.5 input-purpose identification.
      platforms: [web, lit]
  events:
    onChange:
      description: 'Fired on every value change with the new string value, and nothing else (web handlers do not receive the ChangeEvent).'
      platforms: { web: onChange, lit: change, rn: onChangeText, swiftui: onChange }
      payload:
        - { name: value, type: string, description: The new value. }
      fires: [user]
    onFocus:
      description: 'Fired when the field receives focus. No payload: web handlers are called with no arguments, not the FocusEvent.'
      platforms: { web: onFocus, lit: 'focus (native, retargeted — no CustomEvent)', rn: onFocus, swiftui: onFocus }
      fires: [user]
    onBlur:
      description: 'Fired when the field loses focus. The usual moment to validate. No payload: web handlers are called with no arguments, not the FocusEvent.'
      platforms: { web: onBlur, lit: 'blur (native, retargeted — no CustomEvent)', rn: onBlur, swiftui: onBlur }
      fires: [user]
  styles:
    background: { token: color.background }
    foreground: { token: color.foreground }
    placeholder: { token: color.foreground.muted }
    border: { token: color.border.strong }
    borderFocus: { token: color.border.focus }
    borderInvalid: { token: color.border.danger }
    errorText: { token: color.foreground.danger, description: 'Realised by the composed Text''s `danger` tone; no --ds-input-* hook, since a hook could not reach the child without restyling it.' }
    descriptionText: { token: color.foreground.muted, part: description, description: 'Realised by the composed Text''s `muted` tone; no --ds-input-* hook, as for errorText.' }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.md }
    paddingInline: { token: space.md, by: size, values: { sm: space.2 } }
    paddingBlock: { token: space.sm, by: size, values: { sm: space.1 } }
    partGap: { token: space.1, description: 'Vertical gap between label, description, field, and error.' }
    fontFamily: { token: font.family.body }
    fontSize: { token: 'font.size.{size}', description: 'The field text and the label, so the label follows `size`; description and error use helperSize.' }
    labelWeight: { token: font.weight.medium, part: label }
    helperSize: { token: font.size.sm, description: 'Description and error text size. Reaches them only through the composed Text''s `overrides` (fontSize), with fontFamily and lineHeight forwarded the same way; it has no --ds-input-* hook, so page CSS sizes helper text through Text''s own hooks.' }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.comfortable }
    minTargetSm: { token: size.target.min, description: 'The field height floor at size sm. Locked like minTarget (an accessibility floor, not an override), so the sm floor is always size.target.min.' }
    focusRingWidth: { token: border.width.focus, description: 'Replaces borderWidth when focused (the field''s border IS its focus ring — no outline); when the field is both invalid and focused the danger color stays and only the width changes, so the error is never hidden by focus. Padding shrinks by the difference so the field does not shift.' }
    disabledOpacity: { token: opacity.disabled, description: 'Applied to the whole field group (label, description, field, error), as Button dims the whole control. The group is the root wrapper that also carries partGap; it is not an anatomy part (web: the div with data-ds; Lit: an unnamed wrapper in the shadow root; native: the outer View with testID="Input").' }
    transition: { token: motion.duration.fast, description: 'Border color on focus and invalid, with motion.easing.standard. Border width and padding change instantly (no layout animation). Instant under reduced motion; native swaps instantly.' }
  constants:
    longPressDelay:
      description: 'Native only: how long a press on the TextInput is held before the forwarded onLongPress fires (the Pressable default, which TextInput lacks).'
      value: 500
      unit: ms
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: textbox  # the default; `type` search/number/password keep their native semantics (searchbox, spinbutton, none) — never force role=textbox over them
    requires: [label-association, error-identification, focus-visible, keyboard-operable, target-44px, contrast-aa]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
  form:
    role: field
    value: value
    valueType: string
    name: name
    validation: [required, invalid]
    messages: { required: required, invalid: invalid }
    discovery: context
  platforms:
    web:
      element: input
      attributes: [id, name, type, aria-describedby, aria-invalid, aria-required, autocomplete]
      notes: 'The label is a real <label for=id>. Description and error are linked with aria-describedby; the error element has role="alert". The forwarded ref targets the <input> (so focus() and select() work), not the root wrapper.'
    lit:
      tag: ds-input
      reflect: [type, size, required, disabled, invalid]
      notes: 'Uses ElementInternals (formAssociated = true) so a native <form> that directly contains ds-input sees its value and validity. A disabled field is left out of setFormValue and out of validity, as a native disabled control is, while staying focusable and read-only — the field is never given the native disabled attribute. On web the native `<input size>` attribute (character width) is dropped from the prop surface: this schema''s `size` enum is the meaning that wins. Inside ds-form the association is by `name` (see Form); the host carries `data-ds-field`. `value` is property-only (no attribute, since a native `value` attribute means the default): undefined = uncontrolled; consumers control by rebinding `.value`. The initial value''s attribute is `default-value`. Controlled mode reverts like React: after dispatching `change` the field shows `.value` again unless a listener rebound it synchronously, so rebind in the handler, not asynchronously. `hideLabel` is the `hide-label` attribute, not reflected. Inside a native fieldset or form, the group''s disabled arrives through formDisabledCallback; ds-fieldset sets `disabled` on the field itself. Exposes `currentValue`, `form`, `validity`, `checkValidity()`, `reportValidity()`.'
    rn:
      element: TextInput
      props: [accessibilityLabel, accessibilityHint, accessibilityState, keyboardType, textContentType, secureTextEntry]
      notes: 'No label element — the label is rendered as Text and also passed as accessibilityLabel; description as accessibilityHint. `type` maps to keyboardType and textContentType. Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility (iOS). Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur`, `onPressOut` and `onLongPress` to the native element, so Tooltip can attach to it. TextInput has no hover or long-press handlers: `onHoverIn`/`onHoverOut` map to `onPointerEnter`/`onPointerLeave`, and `onLongPress` fires from `onPressIn` after the longPressDelay constant unless `onPressOut` comes first. The accessibilityHint is `description` then a forwarded hint, joined with a space; a forwarded accessibilityLabel replaces `label` as the name, and a Fieldset legend still goes in front ("Shipping address, <label>"). Disabled uses `editable={false}` with `accessibilityState.disabled`: iOS cannot keep a non-editable TextInput focusable, so the field is not focusable on native and the disabled state is announced instead. `hideLabel` does not render the label Text, so the `label` part has no native home while hidden and the name lives only in accessibilityLabel. There is no required accessibility state: required is conveyed by the copy.requiredIndicator label text alone, and the error by the live region / announcement, not role=alert. The label, description and errorMessage parts are the composed Text with `testID="Input.<part>"` passed to it, not a wrapper View.'
    swiftui:
      element: TextField
      props: [TextField, SecureField, .textFieldStyle=plain, .keyboardType, .textContentType, .textInputAutocapitalization, .autocorrectionDisabled, .focused, .submitLabel, .accessibilityLabel, .accessibilityHint, .accessibilityValue]
      notes: 'Label `Text` above (visually hidden with `hideLabel` — still the `.accessibilityLabel`), description `Text`, the field (`TextField` or `SecureField` for `type: password`) inside a bordered `RoundedRectangle` drawn from the tokens (`.textFieldStyle(.plain)`; the border is the focus ring when focused), and the error `Text` announced through `AccessibilityNotification.Announcement` when it appears. `type` maps to `.keyboardType` (`.emailAddress`, `.numberPad`, `.phonePad`, `.URL`) and `autocomplete` to `.textContentType`. `description` and `error` are joined into `.accessibilityHint`; `invalid` adds copy.invalid to the value; `required` appends the indicator to the visible label. Registers with the Form environment. `size: sm` swaps the Sm bindings.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/focusable/error-identified ones from the schema.
    - name: typing-reports-the-new-value
      description: onChange fires with the string value on every keystroke.
      when: { type: a }
      then:
        - { event: onChange, with: a }
    - name: focus-is-reported
      description: onFocus fires when the field receives focus.
      when: { focus: field }
      then:
        - { event: onFocus }
    - name: required-is-shown-in-the-label
      description: 'required appends copy.requiredIndicator to the visible label and sets aria-required - text and attributes, not color alone.'
      given: { required: true }
      then:
        - { copy: requiredIndicator }
        - { attribute: aria-required, is: 'true', platforms: [web] }
    - name: error-is-announced-when-it-appears
      description: 'The error is rendered in the error slot with role=alert so it is announced when it appears (WCAG 3.3.1).'
      given: { error: 'Enter an email address like name@example.com' }
      then:
        - { role: alert, platforms: [web, lit] }
    - name: disabled-stays-focusable-and-is-announced
      description: 'Disabled fields are visible, readable and focusable (aria-disabled, never the native disabled attribute).'
      given: { disabled: true }
      then:
        - { state: disabled, is: true }
        - { focusable: true, platforms: [web, lit] }
  examples:
    - name: email-with-a-description
      description: A field whose format matters, with persistent helper text and the matching touch keyboard.
      given: { label: 'Email address', name: email, type: email, description: 'Use the email you signed up with.' }
    - name: required-field
      description: A field that must have a value to submit, marked in the label rather than by color.
      given: { label: 'Full name', name: name, required: true }
    - name: field-with-an-error
      description: A field failing validation, whose message says what is wrong and how to fix it.
      given: { label: 'Email address', name: email, type: email, error: 'Enter an email address like name@example.com' }
    - name: dense-grid-editor
      description: A small field inside a grid cell, where the column header already names it.
      given: { label: Quantity, name: quantity, type: number, size: sm, hideLabel: true }
---

Input collects a single line of text. It bundles the label, helper text, field, and error message so that the association between them is always correct — the most common accessibility failure in forms is a field whose label or error is only visually nearby.

## When to use

Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type` for the value so touch keyboards and browser validation match. Provide `description` when the format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the value is personal data so browsers and assistive tools can fill it.

## When not to use

Do not use Input for multi-line content (use TextArea, planned), for choosing from a fixed set (use Select or RadioGroup, planned), or for on/off values (use Checkbox or Switch, planned). Do not use `placeholder` as the label; it vanishes as soon as the user types and fails contrast in most systems.

## Behavior

The field is uncontrolled unless `value` is provided. `onChange` fires with the string value on every keystroke; `onBlur` is the recommended moment to validate so users are not shouted at mid-word. Setting `error` marks the field invalid, shows the message in the error slot, and announces it. Clearing `error` removes the message and the invalid state. `disabled` fields are visible, readable, focusable (aria-disabled + readOnly on web — never the native disabled attribute), and skipped by the Form; `required` appends `copy.requiredIndicator` to the visible label and sets `aria-required`; the indicator is plain label text (not aria-hidden) and stays part of the accessible name. A read-only field that is not disabled is still submitted and validated, as a native one is. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`), then browser/type validity where the platform has it — which also reports `copy.invalid`, never the browser's own validationMessage, so all user-facing text comes from the copy block. The error slot shows `error` when set; otherwise it shows a message only while `invalid` is true (set directly or by the Form): `copy.required` for an empty required field, else `copy.invalid`. An empty required field that is not yet invalid shows nothing, so the user is not flagged before typing. `validationMessage`/validity always follow the full precedence. The Form marks a failing field by setting its `invalid` and clears it when the field passes; it never sets `error`, which stays the consumer's. Inside a Fieldset `disabled` from the group applies as if set on the field — on web through the `disabled` prop Fieldset passes to its children, on Lit through the property ds-fieldset sets (or formDisabledCallback from a native fieldset/form), and on native through `FieldsetContext`, which also carries the legend that prefixes the accessibility label ("Shipping address, Street"). The label is a native `<label for>` (web/Lit) styled from Input's label bindings, not a Text; description and error are Text. `hideLabel` keeps the `<label>` in the DOM, visually hidden (web/Lit; see the native note). `size: sm` swaps paddingBlock/paddingInline/minTarget for their Sm bindings and the type of the field and the label to font.size.sm (description and error stay at helperSize); nothing else changes.

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
