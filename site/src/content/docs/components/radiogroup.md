---
title: RadioGroup
description: Picks exactly one option from a short, visible set. The group has a legend, each option a label, and the whole group one error message.
component:
  name: RadioGroup
  category: input
  status: review
  apg: radio
  anatomy: [group, legend, description, radio, radioIndicator, radioLabel, radioDescription, errorMessage]
  composition:
    description: { component: Text, props: { size: sm, tone: muted }, forwards: { helperSize: fontSize, fontFamily: fontFamily, lineHeight: lineHeight } }
    radioDescription: { component: Text, props: { size: sm, tone: muted }, forwards: { helperSize: fontSize, fontFamily: fontFamily, lineHeight: lineHeight } }
    errorMessage: { component: Text, props: { size: sm, tone: danger }, forwards: { helperSize: fontSize, fontFamily: fontFamily, lineHeight: lineHeight } }
  props:
    label:
      type: string
      a11yRole: accessible-name
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
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: 'Initial selection for an uncontrolled group. Omit to start with nothing selected. It is read once, when the group first renders: assigning it later — routine on a Lit element, whose properties are often set after upgrade — is a no-op, exactly as a React state initialiser is.'
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
      description: 'Disables every option. Individual options use `options[].disabled`. The group''s state folds into each option''s, so every radio announces as disabled rather than only the group. A disabled group submits nothing and validates clean — the form value is cleared and no validity is set, as a native disabled control does — so a disabled required group never blocks a submit.'
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
      payload:
        - { name: value, type: string, description: The value of the selected option. }
      fires: [user]
  keyboard:
    - { keys: [Tab], action: 'Moves into the group, to the selected radio (the first when none is selected); from inside, leaves the group — one tab stop.', from: any, expect: manual }
    - { keys: [ArrowDown, ArrowRight], action: 'Moves to and selects the next enabled radio, wrapping.', from: first, expect: focus-next }
    - { keys: [ArrowUp, ArrowLeft], action: 'Moves to and selects the previous enabled radio, wrapping.', from: last, expect: focus-prev }
    - { keys: [' '], action: 'Selects the focused radio when the arrows did not already select it.', from: inside, expect: manual }
  styles:
    controlBackground: { token: color.control.background, part: radio }
    controlBorder: { token: color.control.border, part: radio }
    controlBorderWidth: { token: border.width.thin, part: radio }
    controlSelectedBackground: { token: color.control.selectedBackground, part: radio, description: 'Selected border color; the fill stays controlBackground and the dot is drawn inside.' }
    indicator: { token: color.control.selectedBackground, part: radioIndicator, description: 'The centre dot, controlSize minus 2 × indicatorInset in diameter, centred, and always a circle (it does not follow controlRadius). Its size does not change on focus: the thicker focus border eats into the inset, and the dot still fits whenever indicatorInset ≥ focusRingWidth (true at the default tokens), so it never shrinks. One rule on every platform: the dot is a real node, so it carries the part name everywhere. Web and Lit draw it as a span the RadioGroup owns inside the option''s label, positioned over the appearance:none input and pointer-events: none, with `data-part="radioIndicator"` (and `part` on Lit) — not a pseudo-element of the input, because Firefox does not render ::before or ::after on form controls and the dot would simply be missing there, leaving selection conveyed by border colour alone; on native it is a View inside the drawn control carrying testID="RadioGroup.radioIndicator".' }
    indicatorInset: { token: space.1, part: radioIndicator, description: 'Gap between the control''s outer edge and the dot on each side; sets the dot diameter (controlSize − 2 × indicatorInset). On React Native the border is drawn inside the box and the dot does not shrink, so an inset below focusRingWidth clips the dot while focused: focusRingWidth is the floor this binding should be overridden above.' }
    controlBorderInvalid: { token: color.border.danger, part: radio, description: 'Painted on every radio while the group is invalid, selected ones included — it sits above controlSelectedBackground in the border-colour order and below nothing: focus does not replace it. Border colour precedence is invalid, then selected, then rest, the same order as Checkbox, and a focused invalid radio keeps the danger colour while only the width changes to focusRingWidth.' }
    controlSize: { token: space.5, part: radio, description: 'Outer size of the drawn circle, border included (border-box); it stays this size when the focus border thickens.' }
    controlRadius: { token: radius.full, part: radio, description: 'Corner radius of the drawn control only; the dot stays a circle.' }
    optionPaddingBlock: { token: space.1, description: 'Block padding of each option row (the row wrapper holding radio, radioLabel and radioDescription; not an anatomy part, so the binding has no part and the row carries no data-part/testID). The row still meets minTarget.' }
    optionTextGap: { token: space.1, part: radioDescription, description: 'Vertical gap between an option''s radioLabel and its radioDescription.' }
    optionGap: { token: space.2, description: Horizontal gap between radio and its label. }
    listGap: { token: space.2, description: 'Gap between options (vertical or horizontal).' }
    partGap: { token: space.1, description: 'Vertical gap between legend, description, list, and error.' }
    legendColor: { token: color.foreground, part: legend }
    legendSize: { token: font.size.md, part: legend }
    legendWeight: { token: font.weight.medium, part: legend }
    labelColor: { token: color.foreground, part: radioLabel }
    labelSize: { token: font.size.md, part: radioLabel }
    labelWeight: { token: font.weight.regular, part: radioLabel }
    helperSize: { token: font.size.sm, description: 'Size of description, radioDescription and errorMessage; reaches the composed Text only through its fontSize override. Forwarded-only, so it has no --ds-radio-group-* hook on web or Lit; consumers change it through `overrides`.' }
    descriptionText: { token: color.foreground.muted, part: description, description: 'Realised by the composed Text''s tone muted (description and radioDescription); no --ds-radio-group-* hook.' }
    errorText: { token: color.foreground.danger, part: errorMessage, description: 'Realised by the composed Text''s tone danger; no --ds-radio-group-* hook.' }
    fontFamily: { token: font.family.body, description: 'Applies to legend and radioLabel (their own rule on web/Lit, keeping its hook; a Text override on native) and is forwarded to the description, radioDescription and errorMessage Texts.' }
    lineHeight: { token: font.lineHeight.normal, description: 'As fontFamily: legend and radioLabel directly, forwarded to every composed Text.' }
    focusRing: { token: color.border.focus, part: radio, description: 'On focus-visible the radio''s border becomes focusRingWidth in this color, replacing controlBorderWidth/controlBorder (web, Lit and native alike); the option row is not outlined. It does not replace controlBorderInvalid: in an invalid group a focused radio keeps the danger colour and takes only the focus width, as Checkbox does.' }
    focusRingWidth: { token: border.width.focus, part: radio }
    minTarget: { token: size.target.comfortable, description: 'Minimum height of each option row; the whole row is the hit area, radioDescription included — a click anywhere in the row, the description among it, selects that option. It is a minimum, not the height: at the default tokens a single-line row is exactly this tall and optionPaddingBlock has no visible effect, and an override of that padding can only grow the row past this floor, never shrink it below.' }
    disabledOpacity: { token: opacity.disabled, description: 'Dims option rows only. A disabled option in an enabled group dims its own row; a disabled group dims every option row once (not stacked with the option''s own opacity) and leaves legend, description and errorMessage at full opacity.' }
    transition: { token: motion.duration.fast, part: radio, description: 'The selected border color and the dot''s opacity (fading in and out), with motion.easing.standard, on every platform. Invalid and focus border changes switch instantly — one-directionally, which is all CSS can express from a single border-color transition: entering those states is instant, leaving them fades back over `transition`, and that asymmetry is accepted rather than paid for with an extra element. Instant under reduced motion.' }
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
    position:
      text: '{index} of {total}'
      params:
        index: { type: number, description: The option's position in the group. }
        total: { type: number, description: How many options the group has. }
  a11y:
    role: radiogroup
    requires: [label-association, arrow-navigation, roving-tabindex, error-identification, focus-visible, keyboard-operable, target-24px, contrast-aa]
    contrast:
      - { foreground: color.control.selectedBackground, background: color.control.background, level: AA, nonText: true }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.border, background: color.background, level: AA, nonText: true }
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
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
      element: fieldset
      attributes: [role=radiogroup, aria-describedby, aria-invalid, aria-required]
      notes: 'A <fieldset role="radiogroup"> with a <legend>, containing native <input type="radio" name> elements styled with appearance: none. The role is set explicitly: a fieldset''s implicit role is `group`, which is not what this component declares. The root fieldset carries data-part="group"; every other part with a node carries its anatomy name verbatim (data-part="radioLabel", "radioDescription", "errorMessage"). The radioIndicator is a span inside the option''s label, over the input, carrying data-part="radioIndicator" — a real node on every platform, so every binding on it, `indicatorInset` included, has its hook. aria-invalid and aria-required go on the fieldset only, never on the individual radios. copy.position is not rendered on web or Lit: native radios sharing a name already announce their position. Native radios sharing a name already implement roving tabindex and arrow-key movement; do not reimplement it, which is why `arrow-navigation` and `roving-tabindex` are satisfied here with no key handling at all and the keyboard table is a description of native behaviour. A disabled option uses the real `disabled` attribute so native arrow movement skips it (the one place the system prefers `disabled` over aria-disabled); a disabled group uses aria-disabled on the fieldset and every radio plus preventDefault guards: the arrow and Space guard on the fieldset (native radios move and select on arrows regardless of aria-disabled), the click guard on each input rather than the fieldset, so a click on unrelated content inside the group is not cancelled, and the change path stopped by an early return in the option''s own handler, since `change` is not cancelable and preventDefault on it would do nothing. So the group stays focusable but inert. Option ids are `${groupId}-${value}`, and outside a Form that group id comes from useId and contains colons; those ids are valid and work in `for` and aria-describedby, and only need escaping if something selects on them. Each radio has its own <label for>; option descriptions are linked per radio with aria-describedby. The group error is linked from the fieldset.'
    lit:
      tag: ds-radio-group
      reflect: [orientation, required, disabled, invalid]
      notes: 'Form-associated (setFormValue(value)). The radios are rendered inside the shadow root from the `options` property, so they share one root and native grouping by name works; the native change is not composed, so re-dispatch a composed `change` CustomEvent with detail { value }. `options` is a property, not an attribute. The shadow fieldset has role="radiogroup" (plain attribute, as on web), data-part and part "group"; other parts use the anatomy names verbatim in camelCase for both `part` and `data-part` (legend on the legend, radio on each input, radioLabel, radioDescription, errorMessage; description on the description Text); radioIndicator is the span inside the label, with both. `defaultValue` is also the attribute `default-value`. There is no Form-message step on Lit: ds-form keeps its messages (summary and `invalid` event) and does not set `invalid` on the group, so the displayed error is `error`, else copy.required/copy.invalid while `invalid`; an app marks a group ds-form failed by setting `invalid` or `error` from ds-form''s `invalid` event. Ids do not cross the shadow root: option ids are `${name || ''radio-group''}-${value}` inside it, and the description/error ids the fieldset references live there too. aria-invalid goes on the fieldset only. Host focus() is overridden to focus the checked radio, else the first enabled one (delegatesFocus alone would pick the first in tree order). While the group is disabled, click, arrow keys and Space are preventDefault-ed on the fieldset, since native radios move and select on arrows regardless of aria-disabled. The host carries data-ds-field; group disabled from a Fieldset arrives as the `disabled` property ds-fieldset sets, or through formDisabledCallback from a native fieldset/form.'
    rn:
      element: View
      props: [accessibilityRole=radiogroup, accessibilityLabel, accessibilityHint, accessibilityState]
      notes: 'The group is a View with accessibilityRole="radiogroup" and accessibilityState={{ disabled }} (the group disabled); each option is a Pressable with accessibilityRole="radio" and accessibilityState={{ checked, disabled }}. The option Pressable is the row and the `radio` part: it carries testID="RadioGroup.radio" and the press; inside it the drawn circle is a View with no testID, hidden from accessibility, that takes the radio-part bindings (controlSize, controlRadius, borders, focusRing). The legend and each radioLabel are composed Texts (legend `size: md`, `weight: medium`; radioLabel `size: md`, `weight: regular`; tone default) with legendSize/legendWeight or labelSize/labelWeight, plus fontFamily and lineHeight, passed as their overrides. There is no roving tabindex or arrow movement on native — every radio is a stop for the screen reader and for hardware-keyboard focus. That is the platform convention, not a defect. Validation precedence is Input''s (error → required → invalid with copy.invalid). Individually disabled options use accessibilityState.disabled and a press guard, never the Pressable `disabled` prop, so they stay reachable. Hooks: the root View is the group part and carries testID="RadioGroup" (there is no separate RadioGroup.group); the drawn dot is a real View carrying testID="RadioGroup.radioIndicator"; other parts use RadioGroup.<part>. The group accessibilityLabel is the visible legend including copy.requiredIndicator, so required is announced, prefixed by a Fieldset legend from FieldsetContext ("<legend>, <label>"), which also supplies group disabled. Each radio''s accessibilityLabel is `${label}, ${description}` when it has a description, else the label, and its accessibilityValue={{ text }} is copy.position ("1 of 3"). The focus ring replaces the drawn control''s border, not the row. Native limits: no arrow keys or roving tabindex (each radio is a screen-reader and keyboard stop, the accessible alternative), and no invalid accessibility state (the error is announced through the live region / announcement as in Input). copy.position numbers every option in display order, disabled ones included, so a disabled second option is still "2 of 3". react-native-web renders neither `accessibilityState` nor an `aria-disabled` prop through Pressable, so each option also carries `aria-checked` as a prop and has `aria-disabled` written onto its node in an effect — the same mirror Button, Checkbox and Switch need, without which role=radio ships stateless and a dimmed disabled row is audited as ordinary body copy. Behavior tests on rn check that onChange does not fire, the copy text, and the radios'' unchecked state, not a disabled or invalid state attribute.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=contain, .accessibilityLabel, Button, .accessibilityAddTraits=isSelected, .focusable, .onMoveCommand, '@FocusState']
      notes: 'A container `.accessibilityElement(children: .contain)` named by the legend, holding one `Button` per option that draws the radio circle from the tokens and carries `.isSelected` for the checked option (VoiceOver: ''Email, selected, button, 1 of 3'' — the count is announced from `.accessibilityValue(copy.position)`). Arrow keys on iPad move the selection through `@FocusState` per the keyboard table (`.onMoveCommand`); the group is one focus section. `orientation` picks `VStack`/`HStack`. Registers with the Form environment as one field; group disabled and the legend prefix come from FieldsetContext.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/error-identified ones from the schema.
    - name: click-on-an-option-reports-its-value
      description: Clicking an option selects it and fires onChange with that option's value.
      when: { click: radio }
      then:
        - { event: onChange, with: 'standard' }
    - name: click-on-an-option-label-selects-it
      description: The whole option row is the hit area; each radio has its own label element.
      when: { click: radioLabel }
      then:
        - { event: onChange, with: 'standard' }
    - name: disabled-option-cannot-be-selected
      description: 'A disabled option cannot be chosen: web and Lit use the native disabled attribute so arrow movement skips it, and React Native keeps it reachable with a press guard, so the assertion everywhere is that pressing it selects nothing.'
      given:
        options:
          - { value: 'standard', label: 'Standard', disabled: true }
          - { value: 'express', label: 'Express' }
      when: { click: radio }
      then:
        - { event: onChange, fired: false }
    - name: disabled-group-is-inert
      description: 'A fully disabled group stays visible and focusable but selects nothing. On rn the test checks that onChange does not fire and the radio stays unchecked.'
      given: { disabled: true }
      when: { click: radio }
      then:
        - { event: onChange, fired: false }
        - { state: disabled, is: true, platforms: [web, lit] }
    - name: required-is-shown-in-the-legend
      description: required appends copy.requiredIndicator to the legend, not only a color.
      given: { required: true }
      then:
        - { copy: requiredIndicator }
    - name: invalid-renders-the-invalid-copy
      description: 'The displayed error is error, then the Form''s message, then while invalid copy.required (required and nothing selected) else copy.invalid; with only invalid set the group renders copy.invalid and is marked invalid. On rn the test checks the copy text only.'
      given: { invalid: true }
      then:
        - { copy: invalid }
        - { state: invalid, is: true, platforms: [web, lit] }
  examples:
    - name: shipping-method
      description: Three options with a description each, the usual vertical form.
      given:
        label: 'Shipping method'
        name: 'shipping'
        options:
          - { value: 'standard', label: 'Standard', description: 'Free, 3 to 5 business days' }
          - { value: 'express', label: 'Express', description: 'Next business day' }
          - { value: 'pickup', label: 'Pick up in store', description: 'Ready in 2 hours' }
    - name: horizontal-pair
      description: Two short labels laid out horizontally.
      given:
        label: 'Send a receipt'
        name: 'receipt'
        orientation: 'horizontal'
        options:
          - { value: 'yes', label: 'Yes' }
          - { value: 'no', label: 'No' }
    - name: required-with-a-group-error
      description: A required group the Form has marked invalid, with one error under the whole group.
      given:
        label: 'Plan'
        name: 'plan'
        required: true
        error: 'Choose a plan to continue.'
        options:
          - { value: 'free', label: 'Free' }
          - { value: 'pro', label: 'Pro' }
    - name: with-a-disabled-option
      description: An option that is not available, skipped by arrow movement.
      given:
        label: 'Delivery window'
        name: 'window'
        defaultValue: 'morning'
        options:
          - { value: 'morning', label: 'Morning' }
          - { value: 'evening', label: 'Evening', disabled: true }
---

A radio group asks one question and takes one answer. Its strength is that every option is visible at once, so the user can compare before choosing; its cost is vertical space, which is why it suits short sets.

## When to use

Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give options a `description` when the label alone does not tell them apart. Set `defaultValue` when there is a sensible default; leave the group unselected when the choice is consequential and you want a deliberate answer.

## When not to use

Do not use a RadioGroup for more than about seven options or for options the user must scroll to see; use Select (planned). Do not use it for a yes/no; use Checkbox or Switch. Do not use it for an immediate mode switch in a toolbar; that is a SegmentedControl (planned). Do not let a user deselect: once a radio is chosen, one is always chosen.

## Behavior

Clicking or tapping an option row selects it and fires `onChange` with its value. From the keyboard, Tab moves into the group (to the selected radio, or the first when none is selected), arrow keys move the selection between enabled options and wrap around, and Space selects a focused radio that the arrows did not already select. Tab leaves the group. Individual disabled options are natively disabled and skipped by the arrows; they stay visible and readable but are not focus stops — a deliberate exception to the system's aria-disabled rule, because a radio that can be reached but not chosen is more confusing than one that is skipped. Uncontrolled unless `value` is provided. Disabled options are skipped by arrow movement and cannot be selected; a fully `disabled` group is focusable but inert. A disabled option in an enabled group dims its row with `disabledOpacity`; a disabled group dims the option rows once (no stacking) and keeps legend, description and error at full opacity. `required` appends `copy.requiredIndicator` to the legend — plain legend text that stays part of the group's accessible name on every platform — and sets `aria-required` on the group. The error shown is: the `error` prop; else the Form's message; else, only while `invalid` is true, `copy.required` when the group is required and nothing is selected, otherwise `copy.invalid`. `validate()` follows the same order as the display — `error`, then `required`, then `invalid` — as Input does (Lit has no Form-message step; see the Lit note). A standalone required group with nothing selected therefore shows `copy.required` only once it is marked invalid (directly or by Form validation), never before. Inside a Form, `validate: blur` runs when focus leaves the whole group (web/Lit: focus-out of the fieldset), not when it moves between radios; `validate: change` validates on each change; native has no group blur and validates on change. The Form collects the selected value, or nothing (no key) when none is selected. Inside a Fieldset, `disabled` from the group applies as if set on the field — on web through the `disabled` prop Fieldset passes to the RadioGroup (React has no FieldsetContext), on Lit through the `disabled` property ds-fieldset sets on data-ds-field children (or formDisabledCallback), and on RN and SwiftUI through `FieldsetContext`, which also carries the legend that prefixes the accessibility label ("Shipping address, Plan"). `copy.position` ("1 of 3") is spoken on native only — SwiftUI's accessibilityValue and each RN radio's accessibilityValue text; web and Lit do not render it. The Default story renders the shipping-method example with nothing selected (no `defaultValue`), so a click on the first radio reports `standard`.

## Content guidelines

The legend is a question or a noun phrase for what is being chosen ("Shipping method"). Option labels are parallel — all nouns or all short phrases — sentence case, and never end in a full stop. Put the recommended or most common option first, not the default; `defaultValue` marks the default. Option descriptions are one line: price, timing, consequence.

## Accessibility

The group is exposed with role `radiogroup` (native `fieldset`/`legend` on web) and its legend is the group's accessible name (WCAG 1.3.1, 3.3.2); each radio's name is its own label. Selection is exposed as checked state (4.1.2) and shown by the dot, not by color alone (1.4.1). The group follows the APG radio pattern for keyboard: one tab stop, arrows to move and select (2.1.1). Description and error are linked from the group (3.3.1), with the error announced when it appears. Each option row reaches the 44px target (2.5.8). Selected and rest control borders meet 3:1 on the page background (1.4.11); the build checks the pairs.

## Platform notes

### Web
Render `<fieldset role="radiogroup">` with `<legend>` and, per option, `<input type="radio" name value id>` plus `<label for>`; style the input with `appearance: none` and draw the ring and dot with the control tokens. Native radios with a shared `name` provide roving tabindex and arrow movement, so do not add `tabindex` or key handlers. Link the group description and error to the `<fieldset>` with `aria-describedby`, and per-option descriptions to their radio. Per-option `disabled` is the native attribute; group `disabled` is `aria-disabled` on the fieldset and radios with `preventDefault()` guards. Option ids are `${groupId}-${value}`. A `<legend>` does not take part in the fieldset's flex gap, so `partGap` below it is a margin.

### Lit
`<ds-radio-group>` takes `options` as a property (`.options=${[...]}`) and renders the fieldset and radios inside its shadow root, where the shared `name` groups them natively. It is form-associated: `setFormValue(value)` on change, and `checkValidity()` / `reportValidity()` implement `required`. Re-dispatch a composed `change` CustomEvent with `detail: { value }`. Reflect `orientation`, `required`, `disabled` and `invalid`. The shadow fieldset sets `role="radiogroup"` as on web; option ids are `${name || 'radio-group'}-${value}` within the shadow root; `focus()` targets the checked radio, else the first enabled one.

### React Native
Render a `View` with `accessibilityRole="radiogroup"`, `accessibilityLabel` (the legend with `copy.requiredIndicator` when required) and `accessibilityHint={description}` — not `accessible`, or the radios would collapse into it; on iOS this means the legend reaches VoiceOver as the preceding `Text`, not as a group name (platform limit) — a `Text` legend, and one `Pressable` per option with `accessibilityRole="radio"`, `accessibilityLabel` (`${label}, ${description}`, or the label alone), `accessibilityValue={{ text: copy.position }}`, and `accessibilityState={{ checked: value === option.value, disabled }}`. Arrow-key movement does not exist on native; every radio is its own focus stop, and there is no group-level blur, so `validate: blur` runs on change. On a failed submit the Form focuses the first enabled radio. The group error is announced as in Input.

## Related

Checkbox, Switch, Form, Select (planned).
