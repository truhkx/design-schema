---
title: Checkbox
description: A labelled on/off control for a single option, with tri-state support for "some selected", a description, and an error message that is announced.
component:
  name: Checkbox
  category: input
  status: review
  apg: checkbox
  anatomy: [control, indicator, label, description, errorMessage]
  props:
    label:
      type: string
      required: true
      description: Visible label. Clicking or tapping it toggles the control.
      a11y: Programmatically associated with the control (label/for on web, accessibilityLabel on native).
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name): a selection column in a Table, where the row name is the label.'
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form when collecting values.
    value:
      type: string
      default: 'on'
      description: The value submitted when checked. Lets several checkboxes share a `name` to form a multi-select.
    checked:
      type: boolean
      description: Controlled checked state. Omit for an uncontrolled control.
      controls:
        event: onChange
        default: defaultChecked
        state: checked
    defaultChecked:
      type: boolean
      default: false
      description: Initial state for an uncontrolled control.
    indeterminate:
      type: boolean
      default: false
      description: Shows the mixed indicator, for a parent checkbox whose children are partly selected. Visual and announced only; the submitted value still follows `checked`.
      a11y: Announced as "mixed" (aria-checked=mixed / accessibilityState checked "mixed").
    disabled:
      type: boolean
      default: false
      description: Cannot be toggled and is not submitted. Stays visible, readable and focusable.
    required:
      type: boolean
      default: false
      description: Must be checked to submit — for consent and agreement. Shown in the label, not only by color.
    invalid:
      type: boolean
      default: false
      description: Marks the control as failing validation. Usually set by the Form; can be set directly.
    description:
      type: string
      description: Persistent helper text below the label.
      a11y: Linked with aria-describedby / accessibilityHint.
    error:
      type: string
      description: The error message. Setting it marks the control invalid. Say what to do ("Accept the terms to continue").
      a11y: Rendered in the error slot with aria-describedby and role=alert.
  events:
    onChange:
      description: Fired when the checked state changes, with the new boolean.
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: checked, type: boolean, description: The new checked state. }
      fires: [user]
  styles:
    controlBackground: { token: color.control.background, part: control }
    controlBorder: { token: color.control.border, part: control }
    controlBorderWidth: { token: border.width.thin, part: control }
    controlSelectedBackground: { token: color.control.selectedBackground, part: control, description: 'Checked and indeterminate fill; the border takes the same color.' }
    indicator: { token: color.control.selectedForeground, part: indicator, description: 'The check mark (`Icon name="check"`) and the mixed dash (`Icon name="dash"`) in this color, at `size: xs`, centered in the control. On web/Lit the Icon is inside the control element; the indicator has no separate DOM node to hook, so tests target the control.' }
    indicatorStroke: { token: border.width.focus, part: indicator, description: 'Stroke thickness of the check mark and dash.' }
    pressedOverlay: { token: opacity.disabled, state: pressed, description: 'While pressed, the box shows controlSelectedBackground at this opacity.' }
    controlBorderInvalid: { token: color.border.danger, part: control }
    controlSize: { token: space.5, part: control }
    controlRadius: { token: radius.sm, part: control }
    gap: { token: space.2, description: Horizontal gap between control and label. }
    partGap: { token: space.1, description: 'Vertical gap between label, description, and error.' }
    labelColor: { token: color.foreground, part: label }
    labelSize: { token: font.size.md, part: label }
    labelWeight: { token: font.weight.regular, part: label }
    helperSize: { token: font.size.sm }
    descriptionText: { token: color.foreground.muted, part: description }
    errorText: { token: color.foreground.danger }
    fontFamily: { token: font.family.body }
    lineHeight: { token: font.lineHeight.normal }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    minTarget: { token: size.target.comfortable, description: 'Minimum height of the control + label row; the whole row is the hit area.' }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.fast, description: 'Fill and indicator transitions, with motion.easing.standard.' }
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
    checked: Checked
    unchecked: Unchecked
    mixed: Mixed
  a11y:
    role: checkbox
    requires: [label-association, error-identification, focus-visible, keyboard-operable, target-24px, contrast-aa]
    contrast:
      - { foreground: color.control.selectedForeground, background: color.control.selectedBackground, level: AA }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.border, background: color.background, level: AA, nonText: true }
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
  form:
    role: field
    value: checked
    valueType: boolean
    name: name
    validation: [required, invalid]
    messages: { required: required, invalid: invalid }
    discovery: context
  platforms:
    web:
      element: input
      attributes: [type=checkbox, id, name, value, aria-describedby, aria-invalid, aria-required, aria-checked]
      notes: 'A native <input type="checkbox"> styled with appearance: none — never a visually hidden input under a fake box, so native form participation, click-on-label and Space all keep working. `indeterminate` is set as the DOM property (it has no attribute) and mirrored as aria-checked="mixed".'
    lit:
      tag: ds-checkbox
      reflect: [indeterminate, disabled, required, invalid]
      notes: 'Form-associated via ElementInternals: setFormValue(checked ? value : null). The internal <input> is in the shadow root with delegatesFocus, and its native `change` is not composed, so re-dispatch a composed `change` CustomEvent from the host. `checked` behaves like a native input: the `checked` attribute is the initial state only and the property tracks the live state, so `checked` is not reflected. Form value is `checked ? value : null` (native semantics); ds-form collects the boolean.'
    rn:
      element: Pressable
      props: [accessibilityRole=checkbox, accessibilityLabel, accessibilityHint, accessibilityState]
      notes: 'No native checkbox in core RN. Render Pressable containing a drawn control and Text label; accessibilityState={{ checked: indeterminate ? "mixed" : checked, disabled }}. Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility (iOS), as in Input.'
    swiftui:
      element: Toggle
      props: [Toggle, .toggleStyle=custom, .accessibilityValue, .accessibilityAddTraits, .frame=minHeight, .contentShape, Icon]
      notes: 'A `Toggle` with a package `ToggleStyle` that draws the box from tokens and a `check`/`dash` Icon — SwiftUI exposes a Toggle to VoiceOver as a switch with on/off; the style adds `.accessibilityValue(copy.checked / copy.unchecked / copy.mixed)` so the state is spoken as a checkbox state, and `indeterminate` sets the mixed value and the dash glyph. The label is the Toggle''s label view (`hideLabel` → `.labelsHidden()` with `.accessibilityLabel`). Description and error as Input. Registers with the Form environment; `disabled` per the conventions.'
  behavior:
    # Authored scenarios; the parser adds renders/accessible-name/focusable/error-identified ones from the schema.
    - name: click-on-control-toggles-on
      when: { click: control }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
    - name: click-on-label-toggles
      when: { click: label }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
    - name: click-on-description-toggles
      description: The description is not inside the label (it would join the accessible name); a click on it is forwarded to the control.
      given: { description: 'One email a month about new features.' }
      when: { click: description }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
    - name: space-toggles
      when: { key: Space }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
      platforms: [web, lit]
    - name: enter-is-ignored
      description: Enter submits the enclosing form on web; the component must not intercept it.
      when: { key: Enter }
      then:
        - { event: onChange, fired: false }
        - { state: checked, is: false }
      platforms: [web, lit]
    - name: toggles-back-off
      given: { defaultChecked: true }
      when: { click: control }
      then:
        - { event: onChange, with: false }
        - { state: checked, is: false }
    - name: indeterminate-is-announced-as-mixed
      given: { indeterminate: true }
      then:
        - { state: checked, is: mixed }
    - name: disabled-does-not-toggle
      given: { disabled: true }
      when: { click: control }
      then:
        - { event: onChange, fired: false }
        - { state: checked, is: false }
        - { state: disabled, is: true }
    - name: disabled-stays-focusable
      description: aria-disabled, not the native attribute, so the control stays in the tab order.
      given: { disabled: true }
      then:
        - { focusable: true }
      platforms: [web, lit]
    - name: required-is-shown-in-the-label
      given: { required: true }
      then:
        - { copy: requiredIndicator }
    - name: error-marks-invalid-and-is-announced
      given: { error: 'Accept the terms to continue.' }
      then:
        - { text: 'Accept the terms to continue.' }
        - { state: invalid, is: true, platforms: [web, lit] }
        - { role: alert, platforms: [web, lit] }
    - name: controlled-follows-prop
      description: With `checked` provided the checkbox reports the change but does not flip on its own. Not Lit; there the `checked` property is the live state, like a native input, and only the attribute is initial.
      given: { checked: false }
      when: { click: control }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: false }
      platforms: [web, rn]
    - name: hidden-label-is-still-the-accessible-name
      description: hideLabel removes the label from view, not from the accessible name.
      given: { hideLabel: true }
      then:
        - { name: true }
  examples:
    - name: consent
      description: A required consent checkbox whose label is the agreement itself.
      given: { label: 'I accept the terms of service', name: 'terms', required: true }
    - name: select-all-parent
      description: A "select all" parent showing the mixed indicator while only some children are checked.
      given: { label: 'Select all', name: 'selectAll', indeterminate: true }
    - name: with-description
      description: An option whose scope needs one line of explanation under the label.
      given: { label: 'Send me product updates', name: 'updates', description: 'One email a month about new features.' }
    - name: selection-column
      description: A row selection checkbox in a Table, where the row name is the hidden label.
      given: { label: 'Select row', name: 'select', hideLabel: true }
---

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
