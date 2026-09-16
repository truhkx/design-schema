---
title: Combobox
description: A text input that filters a list of suggestions as you type — pick one, pick many (as chips), or allow free text — with focus staying in the input while the list is navigated.
component:
  name: Combobox
  category: input
  status: review
  apg: combobox
  anatomy: [label, description, field, chips, chip, chipRemove, input, clearButton, toggleButton, popup, listbox, status, errorMessage]
  composition:
    label: Text
    description: Text
    chipRemove: Button
    clearButton: Button
    toggleButton: Button
    listbox: Listbox
  props:
    label:
      type: string
      required: true
      description: Visible label. Always rendered.
      a11y: label/for on the input; accessibilityLabel on native.
    name:
      type: string
      required: true
      description: Field name for the Form.
    options:
      type: array
      required: true
      shape: 'ListboxOption[] (flat or grouped, as Listbox)'
      description: 'The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering.'
    value:
      type: union
      description: Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry.
      shape: 'string | string[]'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial value(s).
      shape: 'string | string[]'
    open:
      type: boolean
      description: 'Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default.'
      controls:
        event: onOpenChange
        state: open
    inputValue:
      type: string
      description: 'Controlled text of the input (what the user has typed). Usually uncontrolled; controlled by consumers driving `async` filtering.'
    multiple:
      type: boolean
      default: false
      description: 'Pick many: selected options appear as chips before the input, each removable; the list stays open while toggling; Backspace in an empty input removes the last chip. Uses the same Listbox engine as Select.'
    allowCustom:
      type: boolean
      default: false
      description: 'Typed text that matches no option can be committed as a value (tags, emails). Enter or a separator (comma) commits it; the list shows `copy.addCustom` as the first row.'
    filter:
      type: enum
      values: [startsWith, contains, none, async]
      default: contains
      description: 'How typing narrows `options`: by prefix, by substring (default), not at all (the list is a picker; typing is type-ahead — it opens the list and moves the active option to the first label starting with the typed characters, without filtering), or by the consumer (`async`: the component shows `copy.loading` and the consumer updates `options` from `onInputChange`).'
    placeholder:
      type: string
      description: Example input shown while empty. Never the only description.
    description:
      type: string
      description: Helper text under the label.
    required:
      type: boolean
      default: false
      description: Must have a value to submit.
    disabled:
      type: boolean
      default: false
      description: Not editable, not submitted, still readable and focusable.
    invalid:
      type: boolean
      default: false
      description: Marks the field invalid.
    error:
      type: string
      description: Error message; implies invalid.
    loading:
      type: boolean
      default: false
      description: 'For `async`: show the loading row and announce it. The consumer sets it around its request.'
    clearable:
      type: boolean
      default: true
      description: Show a clear button when there is a value or text.
  events:
    onChange:
      description: Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`).
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: value, type: union, shape: 'string | string[]', description: 'The selected value, or every selected value with multiple.' }
      fires: [user]
    onInputChange:
      description: Fired on every keystroke with the input text. The hook for `async` filtering.
      platforms: { web: onInputChange, lit: input-change, rn: onInputChange, swiftui: onInputChange }
      payload:
        - { name: value, type: string, description: The text now in the input. }
      fires: [user]
    onOpenChange:
      description: Fired when the list opens or closes.
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange, swiftui: onOpenChange }
      payload:
        - { name: open, type: boolean, description: The new state of the list. }
      fires: [user]
  keyboard:
    - { keys: [ArrowDown], action: Opens the list (if closed) and moves the active option down; focus stays in the input., from: first, expect: manual }
    - { keys: [ArrowUp], action: Opens the list and moves the active option up., from: first, expect: manual }
    - { keys: [Enter], action: 'Commits the active option (single: closes; multiple: toggles and stays open); with allowCustom and no active option, commits the typed text.', when: list open, from: first, expect: manual }
    - { keys: [Escape], action: 'Closes the list if open; if closed and clearable, clears the input text.', when: list open, from: first, expect: closes, target: popup }
    - { keys: [Tab], action: Closes the list and moves focus on. Under single-select a highlighted option is NOT committed by Tab (typing intent is ambiguous)., when: list open, from: first, expect: closes, target: popup }
    - { keys: [Backspace], action: 'In an empty input with chips, removes the last chip.', when: multiple, from: first, expect: manual }
    - { keys: [Home, End], action: 'Move the text caret (input semantics), never the list.', from: first, expect: manual, native: true }
    - { keys: [','], action: 'With allowCustom, commits the typed text as a custom value (as Enter does) and clears the input.', when: allowCustom, from: first, expect: manual }
    - { keys: [Alt+ArrowDown], action: Opens the list without moving the active option., from: first, expect: manual }
  styles:
    fieldBackground: { token: color.background, part: field }
    fieldBorder: { token: color.border.strong, part: field }
    fieldBorderFocus: { token: color.border.focus, part: field }
    fieldBorderInvalid: { token: color.border.danger, part: field }
    fieldBorderWidth: { token: border.width.thin, part: field }
    fieldRadius: { token: radius.md, part: field }
    fieldPaddingInline: { token: space.md, part: field }
    fieldPaddingBlock: { token: space.sm, part: field }
    fieldGap: { token: layout.gap.tight, part: field, description: 'Between chips, input text and the buttons.' }
    inputColor: { token: color.foreground, part: input }
    placeholderColor: { token: color.foreground.muted }
    chipBackground: { token: color.background.strong, part: chip }
    chipColor: { token: color.foreground, part: chip }
    chipRadius: { token: radius.full, part: chip }
    chipPaddingInline: { token: space.2, part: chip }
    chipPaddingBlock: { token: space.0, part: chip }
    chipGap: { token: layout.gap.tight, part: chip, description: Between chip label and its remove button. }
    iconColor: { token: color.foreground.muted, description: Toggle chevron and clear icon. }
    partGap: { token: space.1 }
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
    fontSize: { token: font.size.md }
    chipSize: { token: font.size.sm, part: chip }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.comfortable }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
    enter: { token: motion.duration.fast }
  constants:
    statusDebounce:
      description: 'How long result-count, loading and empty announcements wait before the status live region updates.'
      token: motion.duration.base
      multiply: 2
      unit: ms
  copy:
    empty: No matches
    loading: Loading…
    addCustom: 'Add "{value}"'
    clearLabel: Clear
    toggleLabel: Show options
    removeChip: 'Remove {label}'
    resultCount:
      plural:
        by: count
        one: '{count} result available'
        other: '{count} results available'
      params:
        count: { type: number, description: The number of results in the list. }
    activeOption:
      text: '{option}'
      params:
        option: { type: string, description: The active option's label. }
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: combobox
    requires: [label-association, accessible-name, expanded-state, selected-state, arrow-navigation, escape-dismiss, live-region, error-identification, keyboard-operable, focus-visible, contrast-aa, target-44px]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground, background: color.background.strong, level: AA }
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
      element: input
      attributes: [role=combobox, aria-autocomplete=list, aria-expanded, aria-controls, aria-activedescendant, aria-haspopup=listbox, aria-describedby, aria-invalid, aria-required, autocomplete=off]
      notes: 'The APG editable combobox with list autocomplete: <input role="combobox" aria-autocomplete="list" aria-expanded aria-controls aria-activedescendant>; the popup is a portal with the Listbox; keydown on the input is forwarded to the Listbox handler so DOM focus never leaves the input. A visually hidden <div role="status" aria-live="polite"> announces copy.resultCount, loading and empty states after a short debounce. Chips are <span> with a ds Button (ghost, sm, iconOnly, close icon) labelled copy.removeChip; chips are not focus stops themselves. Hidden <input name> per value for native forms.'
    lit:
      tag: ds-combobox
      reflect: [multiple, allow-custom, filter, required, disabled, invalid, loading]
      notes: 'Form-associated (FormData for multiple). <ds-listbox> lives in the same shadow root so aria-activedescendant resolves. Composed `change`, `input-change`, `open-change`. Popup via the Popover API when available.'
    rn:
      element: TextInput
      props: [accessibilityRole=combobox, accessibilityLabel, accessibilityHint, accessibilityState, accessibilityValue]
      notes: 'On phones the popup is a BottomSheet with the TextInput at its top (keyboard-avoiding) and the Listbox below — typing on a phone with a floating list under the keyboard is unusable. Tablets and react-native-web use the anchored popup. Chips render before the input inside the field; each chip has a remove Button. Result counts are announced with announceForAccessibility. Form registration as Input.'
    swiftui:
      element: TextField
      props: [TextField, Listbox, .popover, .accessibilityValue, .onKeyPress, .onMoveCommand, '@FocusState', .autocorrectionDisabled, AccessibilityNotification]
      notes: 'An Input-shaped `TextField` (`.autocorrectionDisabled`, `.textInputAutocapitalization(.never)`) with the `Listbox embedded` rendered inline below the field on phones (the keyboard is up; a popover would fight it) and as a `.popover` on regular width. The active option is tracked by index (not focus — focus stays in the field) and announced through `AccessibilityNotification.Announcement` with `copy.activeOption`; the count is announced when the list opens. Arrows/Home/End/Enter/Escape per the keyboard table via `.onKeyPress` on the field. `allowCustom`, `multiple` (chips as `Button`s with `close` Icons) as documented.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/focusable/error-identified ones from
    # the schema. Scenarios that act on the list state the `open` prop themselves.
    - name: typing-reports-the-input-text
      description: onInputChange fires on every keystroke - the hook async filtering hangs off.
      given: { open: false }
      when: { type: ap }
      then:
        - { event: onInputChange }
    - name: the-toggle-button-opens-the-list
      given: { open: false }
      when: { click: toggleButton }
      then:
        - { event: onOpenChange }
    - name: a-closed-combobox-is-not-expanded
      given: { open: false }
      then:
        - { state: expanded, is: false }
    - name: an-open-list-reports-the-expanded-state
      given: { open: true }
      then:
        - { state: expanded, is: true }
    - name: enter-commits-the-active-option
      description: 'Enter commits the active option (single: closes; multiple: toggles and stays open).'
      given: { open: true }
      when: { key: Enter }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: escape-closes-the-list
      description: Escape closes the list if open; closed and clearable, it clears the input text instead.
      given: { open: true }
      when: { key: Escape }
      then:
        - { event: onOpenChange }
      platforms: [web, lit]
    - name: the-clear-button-clears-the-value
      given: { open: false, defaultValue: apple, clearable: true }
      when: { click: clearButton }
      then:
        - { event: onChange }
    - name: multiple-shows-the-selection-as-chips
      description: 'Pick many: selected options appear as chips before the input, each removable.'
      given: { open: false, multiple: true, defaultValue: [apple] }
      then:
        - { text: Apple }
    - name: removing-a-chip-reports-the-new-value
      given: { open: false, multiple: true, defaultValue: [apple] }
      when: { click: chipRemove }
      then:
        - { event: onChange }
    - name: a-disabled-combobox-does-not-open
      given: { open: false, disabled: true }
      when: { click: toggleButton }
      then:
        - { event: onOpenChange, fired: false }
        - { state: disabled, is: true, platforms: [web, lit] }
  examples:
    - name: fruit-picker
      description: The everyday single-select combobox, filtering by substring as you type.
      given: { label: Fruit, name: fruit, options: [{ value: apple, label: Apple }, { value: apricot, label: Apricot }, { value: banana, label: Banana }] }
    - name: multi-select-with-chips
      description: Picking several, each shown as a removable chip before the input.
      given: { label: Roles, name: roles, multiple: true, defaultValue: [frontend], options: [{ value: frontend, label: Frontend }, { value: backend, label: Backend }, { value: design, label: Design }] }
    - name: free-text-tags
      description: Tags, where text matching no option can be committed with Enter or a comma.
      given: { label: Tags, name: tags, multiple: true, allowCustom: true, options: [{ value: urgent, label: Urgent }, { value: billing, label: Billing }] }
    - name: async-results
      description: A field whose results come from the server, showing the loading row while they are fetched.
      given: { label: Customer, name: customer, filter: async, loading: true, options: [{ value: acme, label: Acme Ltd }] }
---

A combobox is an input that helps you finish. You type, it narrows the list, you pick — or, when the thing you want does not exist yet, you keep what you typed. It is the right field whenever a Select's list would be too long to scan, and it is the multi-select of choice when picks should be visible as chips.

## When to use

Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be typed faster than found (dates, codes), for `async` search against a server, and for multi-value fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when new values are legitimate (tags, invitees by email) and never when the value must exist (a customer id). Use `filter: none` when the list is short but chips are wanted.

## When not to use

Do not use a Combobox for fewer than about ten options that never grow — use Select. Do not use it as a search box that navigates to results (that is a search form with a Listbox of suggestions, planned as Search). Do not use it to pick a date (DatePicker, planned). Do not disable typing to get a Select; use Select.

## Behavior

Typing filters `options` per `filter` and opens the list with no active option (so Enter commits typed text only when `allowCustom`); ArrowDown activates the first match without moving DOM focus from the input; Enter commits the active option, fires `onChange`, and — single — closes and shows the label in the input, or — multiple — adds a chip, clears the text and keeps the list open. Escape closes the list, then clears text if pressed again. Tab closes without committing an active option. Clicking the toggle button opens the full list; the clear button empties value and text. In `multiple`, Backspace on an empty input removes the last chip, and each chip's remove button removes that one; `onChange` receives the array in selection order. With `async`, the component shows `copy.loading` while `loading`, calls `onInputChange` on each keystroke, and renders whatever `options` the consumer supplies. Result counts, loading and "no matches" are announced politely. Validation and Form behavior are as Input; the value collected is the option value(s), or the custom string(s). Filtering is case- and diacritic-insensitive on every platform. The result-count announcement is debounced by `motion.duration.base × 2` everywhere. The toggle button opens the full, unfiltered list for that opening; the next keystroke filters again. After a commit the input shows the selected option's label (single) or clears (multiple); a controlled `inputValue` is expected to follow the same rule. The composed Listbox is `embedded`, gets `loading` while an async filter runs, and with `allowCustom` is given a synthetic first option carrying `copy.addCustom`. On phones the chips render at the top of the sheet body.

## Content guidelines

The label names the field ("Assignees"); the placeholder shows an example or a verb ("Search people"). Option labels are unique and short; descriptions carry the disambiguation (email under a name). The custom-entry row uses `copy.addCustom` verbatim so users learn the pattern. Chips show the option label, truncated with an ellipsis past about twenty characters, never the value.

## Accessibility

The input is a `combobox` with `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`, and the popup a `listbox` (WCAG 4.1.2; APG editable combobox). DOM focus stays in the input while the list is navigated, so screen readers announce the active option through activedescendant and sighted users keep the caret. The number of results, loading and empty states are announced through a polite live region (4.1.3). Escape closes the list before it clears text, so a keystroke never destroys input unexpectedly (3.2.2). Chips are removable by keyboard through their buttons and by Backspace (2.1.1), each remove button named for its chip. Required and invalid are conveyed in text and attributes (1.4.1, 3.3.1). The field reaches 44px (2.5.8); the border meets 3:1 (1.4.11); text meets AA on the field and on chips.

## Platform notes

### Web
Render the label, the field wrapper (styled as Input's border and focus ring via `:focus-within`), chips, `<input role="combobox" aria-autocomplete="list" aria-expanded aria-controls={listboxId} aria-activedescendant={activeId} autocomplete="off">`, the clear and toggle Buttons (`ghost`, `sm`, `iconOnly`), the description and error, a hidden `<div role="status" aria-live="polite">` for `copy.resultCount` / loading / empty (debounced ~500ms via `motion.duration.base × 2`), and hidden inputs for the value(s). The popup is a portal (`position: fixed`, from the field rect, flip on overflow, `min-inline-size` = field width, `layer.dropdown`) containing `<Listbox labelledBy={labelId}>` with `selectionFollowsFocus={false}`; forward the input's keydown to `useListbox`'s handler; close on outside `pointerdown` and on `focusout` to outside. Filtering is case- and diacritic-insensitive.

### Lit
`<ds-combobox label="Assignees" name="assignees" multiple .options=${…}>`; form-associated; `<ds-listbox>` in the shadow root; chips and buttons composed from `<ds-button>` and `<ds-icon>`; composed `change`, `input-change`, `open-change`.

### React Native
Phones: the field is a `Pressable` summary (chips + placeholder) that opens a `BottomSheet height="full"` containing a `TextInput` (`accessibilityRole="combobox"`, autofocus) and the `Listbox`; committing closes the sheet (single) or updates chips in the sheet header (multiple) with a Done action in the footer. Tablets / react-native-web: `TextInput` in the field with an anchored popup `Modal`. Announce counts with `AccessibilityInfo.announceForAccessibility`. Form registration as Input.

## Related

Listbox, Select, Input, Button, BottomSheet.
