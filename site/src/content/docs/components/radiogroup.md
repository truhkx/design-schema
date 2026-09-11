---
title: RadioGroup
description: Picks exactly one option from a short, visible set. The group has a legend, each option a label, and the whole group one error message.
component:
  name: RadioGroup
  category: input
  status: review
  apg: radio
  anatomy: [group, legend, description, radio, radioIndicator, radioLabel, radioDescription, errorMessage]
  props:
    label:
      type: string
      required: true
      description: The group's legend — the question the options answer. Always visible.
      a11y: Rendered as the fieldset legend on web; as the group's accessibilityLabel on native.
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form. Also links the radios into one native group on web.
    options:
      type: array
      required: true
      shape: '{ value: string; label: string; description?: string; disabled?: boolean }[]'
      description: 'The options in display order. Two to about seven; more than that is a Select (planned). Values are short identifiers (letters, digits, dashes) — they become element ids. Export the item type as `RadioGroupOption`.'
    value:
      type: string
      description: Controlled selected value. Omit for an uncontrolled group.
    defaultValue:
      type: string
      description: Initial selection for an uncontrolled group. Omit to start with nothing selected.
    orientation:
      type: enum
      values: [vertical, horizontal]
      default: vertical
      description: Layout of the options. Horizontal only for two or three short labels; it wraps rather than overflows.
    required:
      type: boolean
      default: false
      description: An option must be selected to submit. Shown in the legend, not only by color.
    invalid:
      type: boolean
      default: false
      description: Marks the group as failing validation. Usually set by the Form; can be set directly.
    disabled:
      type: boolean
      default: false
      description: Disables every option. Individual options use `options[].disabled`.
    description:
      type: string
      description: Persistent helper text under the legend.
      a11y: Linked to the group with aria-describedby / accessibilityHint.
    error:
      type: string
      description: The group's error message. Setting it marks the group invalid.
      a11y: Rendered once under the group with role=alert and linked with aria-describedby on the group.
  events:
    onChange:
      description: Fired when the selection changes, with the new option value.
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
  styles:
    controlBackground: { token: color.control.background }
    controlBorder: { token: color.control.border }
    controlBorderWidth: { token: border.width.thin }
    controlSelectedBackground: { token: color.control.selectedBackground, description: 'Selected border color; the fill stays controlBackground and the dot is drawn inside.' }
    indicator: { token: color.control.selectedBackground, description: 'The centre dot, controlSize minus 2 × space.1 in diameter.' }
    controlBorderInvalid: { token: color.border.danger }
    controlSize: { token: space.5 }
    controlRadius: { token: radius.full }
    optionGap: { token: space.2, description: Horizontal gap between radio and its label. }
    listGap: { token: space.2, description: 'Gap between options (vertical or horizontal).' }
    partGap: { token: space.1, description: 'Vertical gap between legend, description, list, and error.' }
    legendColor: { token: color.foreground }
    legendSize: { token: font.size.md }
    legendWeight: { token: font.weight.medium }
    labelColor: { token: color.foreground }
    labelSize: { token: font.size.md }
    labelWeight: { token: font.weight.regular }
    helperSize: { token: font.size.sm }
    descriptionText: { token: color.foreground.muted }
    errorText: { token: color.foreground.danger }
    fontFamily: { token: font.family.body }
    lineHeight: { token: font.lineHeight.normal }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    minTarget: { token: size.target.comfortable, description: 'Minimum height of each option row; the whole row is the hit area.' }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.fast }
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: radiogroup
    requires: [label-association, arrow-navigation, roving-tabindex, error-identification, focus-visible, keyboard-operable, target-24px, contrast-aa]
    contrast:
      - { foreground: color.control.selectedBackground, background: color.control.background, level: AA, large: true }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, large: true }
      - { foreground: color.control.border, background: color.background, level: AA, large: true }
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
  platforms:
    web:
      element: fieldset
      attributes: [aria-describedby, aria-invalid, aria-required]
      notes: 'A <fieldset> with a <legend>, containing native <input type="radio" name> elements styled with appearance: none. Native radios sharing a name already implement roving tabindex and arrow-key movement; do not reimplement it. A disabled option uses the real `disabled` attribute so native arrow movement skips it (the one place the system prefers `disabled` over aria-disabled); a disabled group uses aria-disabled on the fieldset and every radio plus preventDefault guards, so it stays focusable but inert. Each radio has its own <label for>; option descriptions are linked per radio with aria-describedby. The group error is linked from the fieldset.'
    lit:
      tag: ds-radio-group
      reflect: [orientation, required, disabled, invalid]
      notes: 'Form-associated (setFormValue(value)). The radios are rendered inside the shadow root from the `options` property, so they share one root and native grouping by name works; the native change is not composed, so re-dispatch a composed `change` CustomEvent with detail { value }. `options` is a property, not an attribute.'
    rn:
      element: View
      props: [accessibilityRole=radiogroup, accessibilityLabel, accessibilityHint]
      notes: 'The group is a View with accessibilityRole="radiogroup"; each option is a Pressable with accessibilityRole="radio" and accessibilityState={{ checked, disabled }}. There is no roving tabindex or arrow movement on native — every radio is a stop for the screen reader and for hardware-keyboard focus. That is the platform convention, not a defect. Validation precedence is Input''s (error → required → invalid with copy.invalid). Individually disabled options use accessibilityState.disabled and a press guard, never the Pressable `disabled` prop, so they stay reachable.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=contain, .accessibilityLabel, Button, .accessibilityAddTraits=isSelected, .focusable, .onMoveCommand, '@FocusState']
      notes: 'A container `.accessibilityElement(children: .contain)` named by the legend, holding one `Button` per option that draws the radio circle from the tokens and carries `.isSelected` for the checked option (VoiceOver: ''Email, selected, button, 1 of 3'' — the count is announced from `.accessibilityValue(copy.position)`). Arrow keys on iPad move the selection through `@FocusState` per the keyboard table (`.onMoveCommand`); the group is one focus section. `orientation` picks `VStack`/`HStack`. Registers with the Form environment as one field.'
---

A radio group asks one question and takes one answer. Its strength is that every option is visible at once, so the user can compare before choosing; its cost is vertical space, which is why it suits short sets.

## When to use

Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give options a `description` when the label alone does not tell them apart. Set `defaultValue` when there is a sensible default; leave the group unselected when the choice is consequential and you want a deliberate answer.

## When not to use

Do not use a RadioGroup for more than about seven options or for options the user must scroll to see; use Select (planned). Do not use it for a yes/no; use Checkbox or Switch. Do not use it for an immediate mode switch in a toolbar; that is a SegmentedControl (planned). Do not let a user deselect: once a radio is chosen, one is always chosen.

## Behavior

Clicking or tapping an option row selects it and fires `onChange` with its value. From the keyboard, Tab moves into the group (to the selected radio, or the first when none is selected), arrow keys move the selection between enabled options and wrap around, and Space selects a focused radio that the arrows did not already select. Tab leaves the group. Individual disabled options are natively disabled and skipped by the arrows; they stay visible and readable but are not focus stops — a deliberate exception to the system's aria-disabled rule, because a radio that can be reached but not chosen is more confusing than one that is skipped. Uncontrolled unless `value` is provided. Disabled options are skipped by arrow movement and cannot be selected; a fully `disabled` group is focusable but inert. `required` appends `copy.requiredIndicator` to the legend and sets `aria-required` on the group; on a failed submit the Form renders `copy.required` as the group error. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`) — the same order as Input. Inside a Form, `validate: blur` runs when focus leaves the whole group, not when it moves between radios; the Form collects the selected value, or nothing (no key) when none is selected. Inside a Fieldset the field reads `FieldsetContext`: `disabled` from the group applies as if set on the field, and on native the legend prefixes the accessibility label ("Shipping address, Street").

## Content guidelines

The legend is a question or a noun phrase for what is being chosen ("Shipping method"). Option labels are parallel — all nouns or all short phrases — sentence case, and never end in a full stop. Put the recommended or most common option first, not the default; `defaultValue` marks the default. Option descriptions are one line: price, timing, consequence.

## Accessibility

The group is exposed with role `radiogroup` (native `fieldset`/`legend` on web) and its legend is the group's accessible name (WCAG 1.3.1, 3.3.2); each radio's name is its own label. Selection is exposed as checked state (4.1.2) and shown by the dot, not by color alone (1.4.1). The group follows the APG radio pattern for keyboard: one tab stop, arrows to move and select (2.1.1). Description and error are linked from the group (3.3.1), with the error announced when it appears. Each option row reaches the 44px target (2.5.8). Selected and rest control borders meet 3:1 on the page background (1.4.11); the build checks the pairs.

## Platform notes

### Web
Render `<fieldset>` with `<legend>` and, per option, `<input type="radio" name value id>` plus `<label for>`; style the input with `appearance: none` and draw the ring and dot with the control tokens. Native radios with a shared `name` provide roving tabindex and arrow movement, so do not add `tabindex` or key handlers. Link the group description and error to the `<fieldset>` with `aria-describedby`, and per-option descriptions to their radio. Per-option `disabled` is the native attribute; group `disabled` is `aria-disabled` on the fieldset and radios with `preventDefault()` guards. Option ids are `${groupId}-${value}`. A `<legend>` does not take part in the fieldset's flex gap, so `partGap` below it is a margin.

### Lit
`<ds-radio-group>` takes `options` as a property (`.options=${[...]}`) and renders the fieldset and radios inside its shadow root, where the shared `name` groups them natively. It is form-associated: `setFormValue(value)` on change, and `checkValidity()` / `reportValidity()` implement `required`. Re-dispatch a composed `change` CustomEvent with `detail: { value }`. Reflect `orientation`, `required`, `disabled` and `invalid`.

### React Native
Render a `View` with `accessibilityRole="radiogroup"`, `accessibilityLabel={label}` and `accessibilityHint={description}` — not `accessible`, or the radios would collapse into it; on iOS this means the legend reaches VoiceOver as the preceding `Text`, not as a group name (platform limit) — a `Text` legend, and one `Pressable` per option with `accessibilityRole="radio"`, `accessibilityLabel` (label plus description), and `accessibilityState={{ checked: value === option.value, disabled }}`. Arrow-key movement does not exist on native; every radio is its own focus stop, and there is no group-level blur, so `validate: blur` runs on change. On a failed submit the Form focuses the first enabled radio. The group error is announced as in Input.

## Related

Checkbox, Switch, Form, Select (planned).
