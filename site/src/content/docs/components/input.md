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
      description: Fired on every value change with the new string value.
      platforms: { web: onChange, lit: change, rn: onChangeText }
    onFocus:
      description: Fired when the field receives focus.
      platforms: { web: onFocus, lit: 'focus (native, retargeted — no CustomEvent)', rn: onFocus }
    onBlur:
      description: Fired when the field loses focus. The usual moment to validate.
      platforms: { web: onBlur, lit: 'blur (native, retargeted — no CustomEvent)', rn: onBlur }
  styles:
    background: { token: color.background }
    foreground: { token: color.foreground }
    placeholder: { token: color.foreground.muted }
    border: { token: color.border.strong }
    borderFocus: { token: color.border.focus }
    borderInvalid: { token: color.border.danger }
    errorText: { token: color.foreground.danger }
    descriptionText: { token: color.foreground.muted }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.md }
    paddingInline: { token: space.md }
    paddingBlock: { token: space.sm }
    paddingBlockSm: { token: space.1, description: 'Vertical padding at size sm.' }
    paddingInlineSm: { token: space.2, description: 'Horizontal padding at size sm.' }
    partGap: { token: space.1, description: 'Vertical gap between label, description, field, and error.' }
    fontFamily: { token: font.family.body }
    fontSize: { token: 'font.size.{size}' }
    labelWeight: { token: font.weight.medium }
    helperSize: { token: font.size.sm, description: Description and error text size. }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.comfortable }
    minTargetSm: { token: size.target.min, description: 'The field height floor at size sm.' }
    focusRingWidth: { token: border.width.focus, description: 'Replaces borderWidth when focused (the field''s border IS its focus ring — no outline); when the field is both invalid and focused the danger color stays and only the width changes, so the error is never hidden by focus. Padding shrinks by the difference so the field does not shift.' }
    disabledOpacity: { token: opacity.disabled, description: 'Applied to the whole field group (label, description, field, error), as Button dims the whole control.' }
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
      - { foreground: color.border.strong, background: color.background, level: AA, large: true }
  platforms:
    web:
      element: input
      attributes: [id, name, type, aria-describedby, aria-invalid, aria-required, autocomplete]
      notes: The label is a real <label for=id>. Description and error are linked with aria-describedby; the error element has role="alert".
    lit:
      tag: ds-input
      reflect: [type, required, disabled, invalid]
      notes: 'Uses ElementInternals (formAssociated = true) so a native <form> that directly contains ds-input sees its value and validity. Inside ds-form the association is by `name` (see Form). `value` behaves like a native input: undefined = uncontrolled; consumers control by rebinding `.value`. Exposes `currentValue`, `form`, `validity`, `checkValidity()`, `reportValidity()`.'
    rn:
      element: TextInput
      props: [accessibilityLabel, accessibilityHint, accessibilityState, keyboardType, textContentType, secureTextEntry]
      notes: 'No label element — the label is rendered as Text and also passed as accessibilityLabel; description as accessibilityHint. `type` maps to keyboardType and textContentType. Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility (iOS). Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur` and `onLongPress` to the native element, so Tooltip can attach to it.'
---

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
