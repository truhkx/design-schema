---
title: Select
description: A form field that picks one option (or several) from a list opened on demand — a labelled trigger that shows the current value and opens a Listbox in a popup, or a native picker where that is what people expect.
component:
  name: Select
  category: input
  status: review
  apg: combobox
  anatomy: [label, description, trigger, value, chevron, popup, listbox, errorMessage]
  composition:
    label: Text
    description: Text
    chevron: Icon
    listbox: { component: Listbox, props: { options: { from: options } } }
  props:
    label:
      type: string
      required: true
      description: Visible label. Always rendered.
      a11y: Associated with the trigger (label/for on web; accessibilityLabel on native).
    name:
      type: string
      required: true
      description: Field name for the Form.
    options:
      type: array
      required: true
      shape: 'ListboxOption[] (flat or grouped, as Listbox)'
      description: The options, passed through to the Listbox.
    value:
      type: union
      description: Controlled value (array with `multiple`).
      shape: 'string | string[]'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial value (array with `multiple`).
      shape: 'string | string[]'
    placeholder:
      type: string
      description: Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for the label.
    hideLabel:
      type: boolean
      default: false
      description: Visually hide the label (it remains the accessible name), for compact pickers such as DatePicker's month and year.
    size:
      type: enum
      enumRef: size
      values: [sm, md]
      default: md
      description: 'sm for pickers inside toolbars and calendar headers.'
    open:
      type: boolean
      description: 'Controlled popup state, for programmatic opening and for stories and tests (the Keyboard story renders it open). Omit for the trigger-driven default.'
      controls:
        event: onOpenChange
        state: open
    multiple:
      type: boolean
      default: false
      description: 'Pick any number. The trigger shows `copy.selectedCount` (or the labels when two or fewer); the popup stays open while toggling and closes on Escape or outside click.'
    description:
      type: string
      description: Helper text under the label.
      a11y: aria-describedby / accessibilityHint.
    required:
      type: boolean
      default: false
      description: Must have a value to submit. Shown in the label, not only by color.
    disabled:
      type: boolean
      default: false
      description: Not openable and not submitted. Stays visible and focusable.
    invalid:
      type: boolean
      default: false
      description: Marks the field invalid. Usually set by the Form.
    error:
      type: string
      description: Error message; implies invalid.
      a11y: role=alert region linked with aria-describedby.
    native:
      type: enum
      values: [auto, always, never]
      default: auto
      description: 'Use the platform''s own picker instead of the popup Listbox: `auto` means never on web (the styled popup) and always on native phones (the OS wheel/dialog is what users expect); `always` forces a native <select> on web too (forms that must work without JS); `never` forces the popup everywhere.'
  events:
    onChange:
      description: Fired when the value changes (array with `multiple`).
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: value, type: union, shape: 'string | string[]', description: 'The selected value, or every selected value with multiple.' }
      fires: [user]
    onOpenChange:
      description: Fired when the popup opens or closes.
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange, swiftui: onOpenChange }
      payload:
        - { name: open, type: boolean, description: The new state of the popup. }
      fires: [user]
  keyboard:
    - { keys: [Enter, ' ', ArrowDown, ArrowUp], action: Opens the popup with the selected (or first) option active., when: focus on trigger, from: trigger, expect: manual }
    - { keys: [Escape], action: Closes the popup without changing the value and returns focus to the trigger., when: popup open, from: inside, expect: [closes, focus-trigger], target: popup }
    - { keys: [Enter], action: 'Commits the active option and closes (single); with `multiple`, toggles it and stays open.', when: popup open, from: first, expect: manual }
    - { keys: [Tab], action: Commits the active option (single) and closes; focus moves on., when: popup open, from: inside, expect: closes, target: popup }
    - { keys: [ArrowDown, ArrowUp, Home, End, a-z], action: As Listbox., when: popup open, from: first, expect: manual }
  styles:
    triggerBackground: { token: color.background, part: trigger }
    triggerBorder: { token: color.border.strong, part: trigger }
    triggerBorderFocus: { token: color.border.focus, part: trigger }
    triggerBorderInvalid: { token: color.border.danger, part: trigger }
    triggerBorderWidth: { token: border.width.thin, part: trigger }
    triggerRadius: { token: radius.md, part: trigger }
    triggerPaddingInline: { token: space.md, part: trigger }
    triggerPaddingBlock: { token: space.sm, part: trigger, by: size, values: { sm: space.1 } }
    triggerGap: { token: layout.gap.normal, part: trigger, description: Between value and chevron. }
    valueColor: { token: color.foreground, part: value }
    placeholderColor: { token: color.foreground.muted }
    chevron: { token: color.foreground.muted, part: chevron }
    partGap: { token: space.1, description: 'Between label, description, trigger and error.' }
    labelWeight: { token: font.weight.medium, part: label }
    helperSize: { token: font.size.sm }
    descriptionText: { token: color.foreground.muted, part: description }
    errorText: { token: color.foreground.danger }
    popupSurface: { token: color.overlay.surface, part: popup }
    popupBorder: { token: color.border, part: popup }
    popupShadow: { token: shadow.overlay, part: popup }
    popupRadius: { token: radius.md, part: popup }
    popupOffset: { token: space.1, part: popup }
    layer: { token: layer.dropdown }
    fontFamily: { token: font.family.body }
    fontSize: { token: 'font.size.{size}' }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.comfortable }
    minTargetSm: { token: size.target.min, description: 'The trigger height floor at size sm. The popup is unchanged.' }
    focusRingWidth: { token: border.width.focus, description: Replaces the border width when focused; padding shrinks by the difference. }
    disabledOpacity: { token: opacity.disabled }
    enter: { token: motion.duration.fast, description: Popup fade; instant under reduced motion. }
  copy:
    placeholder: Select…
    selectedCount:
      text: '{count} selected'
      params:
        count: { type: number, description: How many options are selected. }
    done: Done
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: combobox
    requires: [label-association, accessible-name, expanded-state, selected-state, arrow-navigation, escape-dismiss, focus-restore, error-identification, keyboard-operable, focus-visible, contrast-aa, target-44px]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
  form:
    role: field
    value: value
    valueType: string[]
    name: name
    validation: [required, invalid]
    messages: { required: required, invalid: invalid }
    discovery: context
  platforms:
    web:
      element: button
      attributes: [role=combobox, aria-haspopup=listbox, aria-expanded, aria-controls, aria-labelledby, aria-describedby, aria-invalid, aria-required]
      notes: 'The APG select-only combobox: the trigger is a <button role="combobox" aria-haspopup="listbox" aria-expanded aria-controls> showing the value; the popup is a portal with the Listbox, positioned below (flipping above) the trigger at least as wide as it, on layer.dropdown. Keys on the trigger are forwarded to the Listbox''s handler while open. A hidden <input name> carries the value(s) for native form submission. `native: always` renders <select> (and <select multiple>) with the same label/description/error wiring and no popup.'
    lit:
      tag: ds-select
      reflect: [multiple, size, required, disabled, invalid, native]
      notes: 'Form-associated with setFormValue (FormData for multiple). Composes <ds-listbox> inside its shadow root so aria-activedescendant works; the popup uses the Popover API when available. Composed `change` and `open-change`. Implements the DsFormField interface. aria-activedescendant cannot reference an option inside the composed <ds-listbox>''s shadow root, so the trigger exposes the active option''s text through aria-describedby on a live element instead, and aria-controls points at the popup wrapper. ds-form collects ds-select, ds-listbox and ds-combobox like other fields; DsFormField.currentValue is `string | boolean | string[] | null`.'
    rn:
      element: Pressable
      props: [accessibilityRole=combobox, accessibilityLabel, accessibilityHint, accessibilityState, accessibilityValue]
      notes: '`native: auto` opens a BottomSheet containing the Listbox on phones (the system''s own picker, not the OS wheel — consistent theming, multi-select and descriptions work, and the sheet is the platform idiom); tablets and react-native-web use the popup. accessibilityValue.text is the selected label(s). No hidden input; Form registration as Input.'
    swiftui:
      element: Button
      props: [Button, .popover, .sheet, Listbox, .accessibilityValue, .accessibilityAddTraits=isButton, .presentationCompactAdaptation, FocusScope]
      notes: 'A trigger `Button` (label above, `hideLabel` per Input) showing the value text and the `chevron-down` Icon, with `.accessibilityValue(selected labels or copy.placeholder)`; the popup is `Listbox embedded` in a `.popover` on regular width and a `.sheet` with `.presentationDetents([.medium, .large])` on phones — the doc''s `native: always` maps to the sheet on every width. Selection closes the popup for single, stays open for `multiple`; the trigger keeps focus and the new value is announced. Registers with the Form environment; `size: sm` per the Sm bindings.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/focusable/error-identified ones from
    # the schema. Scenarios that act on the popup state the `open` prop themselves.
    - name: the-trigger-opens-the-popup
      given: { open: false }
      when: { click: trigger }
      then:
        - { event: onOpenChange }
    - name: a-closed-select-is-not-expanded
      given: { open: false }
      then:
        - { state: expanded, is: false }
    - name: an-open-select-reports-the-expanded-state
      description: The trigger is the combobox, so aria-expanded on it is what announces the popup.
      given: { open: true }
      then:
        - { state: expanded, is: true }
    - name: enter-commits-the-active-option-and-closes
      description: 'Enter commits the active option and closes (single); the popup opens with the selected or first option active.'
      given: { open: true }
      when: { key: Enter }
      then:
        - { event: onChange }
        - { event: onOpenChange }
      platforms: [web, lit]
    - name: escape-closes-without-changing-the-value
      description: Escape closes the popup without changing the value and returns focus to the trigger.
      given: { open: true }
      when: { key: Escape }
      then:
        - { event: onOpenChange }
        - { event: onChange, fired: false }
      platforms: [web, lit]
    - name: the-placeholder-shows-when-nothing-is-selected
      given: { open: false }
      then:
        - { copy: placeholder }
    - name: a-custom-placeholder-replaces-the-default
      given: { open: false, placeholder: Choose a country }
      then:
        - { text: Choose a country }
    - name: a-disabled-select-does-not-open
      description: Disabled selects stay visible and focusable but cannot be opened and are not submitted.
      given: { open: false, disabled: true }
      when: { click: trigger }
      then:
        - { event: onOpenChange, fired: false }
        - { state: disabled, is: true, platforms: [web, lit] }
    - name: required-is-shown-in-the-label
      description: required is shown in the label, not only by color.
      given: { required: true }
      then:
        - { copy: requiredIndicator }
    - name: invalid-is-reported-on-the-trigger
      given: { invalid: true }
      then:
        - { state: invalid, is: true, platforms: [web, lit] }
  examples:
    - name: country-picker
      description: The everyday single-select field with a placeholder until something is chosen.
      given: { label: Country, name: country, placeholder: Choose a country, options: [{ value: ca, label: Canada }, { value: fr, label: France }, { value: jp, label: Japan }] }
    - name: multi-select-roles
      description: Picking any number, where the trigger counts what is selected and the popup stays open.
      given: { label: Roles, name: roles, multiple: true, options: [{ value: frontend, label: Frontend }, { value: backend, label: Backend }, { value: design, label: Design }] }
    - name: forced-native-picker
      description: A form that must work without JavaScript, so the platform's own select is rendered on web too.
      given: { label: Country, name: country, native: always, options: [{ value: ca, label: Canada }, { value: us, label: United States }] }
    - name: compact-picker-in-a-header
      description: A small picker whose label is hidden, as in a calendar header.
      given: { label: Month, name: month, hideLabel: true, size: sm, options: [{ value: '1', label: January }, { value: '2', label: February }] }
---

A select is the field for "one of these" (or "any of these") when the list is longer than a RadioGroup should show and typing is not the natural way in. It looks like an Input, opens a Listbox, and returns to being a field. On phones it becomes a sheet, because that is what a thumb expects.

## When to use

Use a Select for a form field with about seven to fifty options that people recognise on sight — country, role, status, time zone from a short list, a category. Use `multiple` for tags or memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms that must work without JavaScript. Use Combobox instead when the list is long enough that typing to filter is faster than scrolling, or when free text is allowed.

## When not to use

Do not use a Select for two to six options; use a RadioGroup so every option is visible. Do not use it for actions (Menu), for switching modes (SegmentedControl), or for on/off (Switch). Do not put a Select inside a Menu or a Tooltip.

## Behavior

The trigger shows the selected option's label (or the count / labels for `multiple`, or the placeholder). Activating it, or pressing Enter, Space or an arrow, opens the popup with the Listbox and the selected option active; the Listbox's keyboard model applies while focus visually stays on the trigger. Enter commits and closes (single) or toggles (multiple); Escape closes without changing the value; Tab commits and moves on; clicking outside closes. On close, focus returns to the trigger and `onChange` has fired if the value changed. Validation, `required`, `disabled` and errors work exactly as Input; the Form collects the value or array by `name`. The composed Listbox is `embedded`, receives `selectionFollowsFocus: false` (arrows move the active option; Enter commits) and `defaultActiveValue` set to the current selection so the popup opens with it active. With `multiple` and more than two selections the trigger shows `copy.selectedCount`; two or fewer are joined with a comma and a space. The popup's surface, border, radius and shadow are the popup wrapper's bindings; the Listbox draws none. The phone/tablet switch uses `layout.maxWidth.prose`, and the phone sheet's footer button is `copy.done`.

## Content guidelines

The label names the field ("Country"); the placeholder is `copy.placeholder` unless a more specific prompt helps ("Choose a role"). Options follow Listbox's rules. With `multiple`, the trigger shows up to two labels joined by commas, then `copy.selectedCount`.

## Accessibility

The trigger is a `combobox` (select-only pattern) with `aria-haspopup="listbox"`, `aria-expanded`, its label association and description/error links, and the popup is a `listbox` (WCAG 4.1.2; APG select-only combobox). The full Listbox keyboard model applies; Escape closes and focus is restored (2.1.2, 2.4.3). Required and invalid are in text and attributes, not color alone (1.4.1, 3.3.1). The trigger meets 44px (2.5.8) and its border 3:1 (1.4.11). On phones the sheet is modal with the same guarantees as BottomSheet.

## Platform notes

### Web
Render the label (`<label for>`), description, `<button type="button" role="combobox" id aria-haspopup="listbox" aria-expanded aria-controls={listboxId} aria-labelledby={labelId + valueId} aria-describedby aria-invalid aria-required>` containing the value span and `<Icon name="chevron-down">`, the error region, and a hidden `<input name>` per selected value. The popup is a portal (`position: fixed`, from the trigger rect, flip on overflow, `min-inline-size` = trigger width, `layer.dropdown`) containing `<Listbox>` with `labelledBy={labelId}`; forward keydown from the trigger to the Listbox's handler while open; close on `pointerdown` outside and on `focusout` to outside. `native: always`: `<select>`/`<select multiple>` with the same wrapper and `appearance: none` styling plus the chevron.

### Lit
`<ds-select label="Country" name="country" .options=${…}>`; form-associated (`DsFormField`); `<ds-listbox>` in the shadow root; popup via `popover="manual"` when available; composed `change`, `open-change`.

### React Native
`Pressable` with `accessibilityRole="combobox"`, `accessibilityLabel={label}`, `accessibilityHint={description}`, `accessibilityState={{ expanded, disabled }}`, `accessibilityValue={{ text }}`; opens `BottomSheet` (phones) or a positioned popup `Modal` (tablets/web) containing `Listbox`; the sheet's footer has a Done button for `multiple`. Form registration as Input.

## Related

Listbox, Combobox, RadioGroup, Input, BottomSheet.
