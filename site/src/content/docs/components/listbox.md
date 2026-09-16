---
title: Listbox
description: A scrollable list of options with single or multiple selection, driven by arrow keys and typeahead — the selection engine that Select and Combobox open in a popup and that stands alone as a visible picker.
component:
  name: Listbox
  category: input
  status: review
  apg: listbox
  anatomy: [list, group, groupLabel, option, optionLabel, optionDescription, optionIcon, optionCheck, emptyState]
  composition:
    optionIcon: Icon
    optionCheck: Icon
    emptyState: Text
  props:
    label:
      type: string
      required: true
      description: 'Accessible name of the list. When a visible Text label exists, pass its id via `labelledBy` instead and this is ignored.'
    labelledBy:
      type: string
      description: Id of a visible element that labels the list.
      platforms: [web, lit]
    options:
      type: array
      required: true
      shape: '({ value: string; label: string; description?: string; icon?: IconName; disabled?: boolean } | { group: string; options: ListboxOption[] })[]'
      description: Flat or grouped options. Export the item type as `ListboxOption`.
    multiple:
      type: boolean
      default: false
      description: 'Allow any number of selections. The value becomes an array; each option shows a check indicator; selection toggles rather than moves. This is the same engine Combobox uses for multi-select.'
    value:
      type: union
      description: 'Controlled selection: a value, or with `multiple` the exported `ListboxValue` (`string | string[]`). Omit for uncontrolled.'
      shape: 'string | string[]'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial selection (or array).
      shape: 'string | string[]'
    selectionFollowsFocus:
      type: boolean
      default: true
      description: 'Single-select only: arrow keys select as they move (the common picker feel). Set false when selection has side effects, so arrows only move and Space selects.'
    required:
      type: boolean
      default: false
      description: At least one option must be selected to submit when inside a Form.
    invalid:
      type: boolean
      default: false
      description: Marks the list invalid (aria-invalid) with `copy.invalid`.
    error:
      type: string
      description: Error message rendered below the list and linked by aria-describedby; implies invalid.
    embedded:
      type: boolean
      default: false
      description: 'The list lives inside a popup (Select, Combobox) that owns the border, surface and radius; the list draws none of its own.'
    initialActiveValue:
      type: string
      description: The option that is active when the list first receives focus (Select opens with the selected option active). Defaults to the first selected, else the first enabled option.
    loading:
      type: boolean
      default: false
      description: Options are being fetched (async Combobox); the list shows `copy.loading` in place of the empty message and is aria-busy.
    disabled:
      type: boolean
      default: false
      description: The whole list is inert but readable.
    name:
      type: string
      description: Field name for Form collection. Multiple values are collected as an array.
    emptyMessage:
      type: string
      description: Shown when `options` is empty (a filtered Combobox with no matches). Defaults to `copy.empty`.
    maxVisible:
      type: enum
      values: ['5', '8', '12', 'all']
      default: '8'
      description: Height in rows before the list scrolls; `all` never scrolls.
  events:
    onChange:
      description: Fired when the selection changes, with the new value (array when `multiple`).
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: value, type: union, shape: 'string | string[]', description: 'The selected value, or every selected value with multiple.' }
      fires: [user]
    onActiveChange:
      description: 'Fired as the focused (active) option changes, with its value — Combobox uses this to keep aria-activedescendant in sync; consumers rarely need it.'
      platforms: { web: onActiveChange, lit: active-change, rn: onActiveChange, swiftui: onActiveChange }
      payload:
        - { name: value, type: union, shape: 'string | null', description: 'The value of the active option; null when no option is active.' }
  keyboard:
    - { keys: [ArrowDown], action: Moves to the next enabled option (and selects it when selection follows focus)., from: first, expect: focus-next }
    - { keys: [ArrowUp], action: Moves to the previous enabled option., from: last, expect: focus-prev }
    - { keys: [Home], action: First option., from: last, expect: focus-first }
    - { keys: [End], action: Last option., from: first, expect: focus-last }
    - { keys: [' '], action: 'Selects the focused option; with `multiple`, toggles it.', from: first, expect: selects }
    - { keys: [Enter], action: 'Selects the focused option (single) — inside a Select or Combobox, also closes the popup.', from: first, expect: selects }
    - { keys: [Shift+ArrowDown, Shift+ArrowUp], action: 'Multiple: moves and adds the next/previous option to the selection.', when: multiple, from: first, expect: manual }
    - { keys: [Control+a], action: 'Multiple: selects all enabled options; again clears.', when: multiple, from: first, expect: manual }
    - { keys: [a-z], action: Typeahead to the next option whose label starts with the typed characters., from: first, expect: manual }
    - { keys: [PageDown, PageUp], action: Moves by the visible row count., from: first, expect: manual }
  styles:
    surface: { token: color.background }
    border: { token: color.border.strong, description: 'Only when not `embedded`; inside a popup the popup owns the border.' }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.md }
    listPadding: { token: space.1, part: list }
    optionPaddingBlock: { token: space.sm, part: option }
    optionPaddingInline: { token: space.md, part: option }
    optionGap: { token: layout.gap.normal, part: option, description: 'Between check, icon, label and description.' }
    optionRadius: { token: radius.sm, part: option }
    optionColor: { token: color.foreground, part: option }
    optionDescriptionColor: { token: color.foreground.muted, part: optionDescription }
    optionDescriptionSize: { token: font.size.sm, part: optionDescription }
    optionActiveBackground: { token: color.background.subtle, part: option, state: active, description: 'The focused/active option (keyboard or hover). Selection is shown by the check and weight, so active and selected are never confused.' }
    optionSelectedWeight: { token: font.weight.medium, part: option }
    optionSelectedCheck: { token: color.control.selectedBackground, part: optionCheck, description: 'The check icon on selected options (rendered only with `multiple`; single-select shows selection by the row fill), in the selected-control fill (3:1 on both surfaces by derivation); always rendered (invisible slot when unselected) so labels align.' }
    groupLabelColor: { token: color.foreground.muted, part: groupLabel }
    groupLabelSize: { token: font.size.xs, part: groupLabel }
    groupLabelWeight: { token: font.weight.semibold, part: groupLabel }
    groupLabelPaddingBlock: { token: space.1, part: groupLabel }
    emptyColor: { token: color.foreground.muted }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.md }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.min }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
  copy:
    empty: No options
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    selectedCount:  # not rendered by Listbox itself: exposed as accessibilityValue on native and available to the surrounding UI
      text: '{count} selected'
      params:
        count: { type: number, description: How many options are selected. }
    loading: Loading…
  a11y:
    role: listbox
    requires: [accessible-name, selected-state, arrow-navigation, keyboard-operable, focus-visible, contrast-aa, target-24px, error-identification]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground, background: color.background.subtle, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background.subtle, level: AA }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.selectedBackground, background: color.background.subtle, level: AA, nonText: true }
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
      element: div
      attributes: [role=listbox, aria-label, aria-labelledby, aria-multiselectable, aria-activedescendant, aria-invalid, aria-required, aria-describedby, aria-busy, tabindex=0, role=option, aria-selected, aria-disabled, role=group]
      notes: 'The list is ONE focusable element (tabindex=0) and moves an aria-activedescendant pointer between <div role="option"> children instead of moving DOM focus — this is the one composite in the system that uses activedescendant, because Combobox must keep focus in its input while the list is navigated. Standalone, DOM focus sits on the list and the active option is scrolled into view. Options carry aria-selected; groups are role=group with aria-labelledby. Hover sets the active option. Native <select multiple> is not used: it cannot be styled or grouped consistently and its keyboard model differs per browser.'
    lit:
      tag: ds-listbox
      reflect: [multiple, disabled, required]
      notes: '`options` and `value` are properties. Form-associated: setFormValue with a FormData carrying one entry per selected value when `multiple`, so a native <form> gets the same shape as a <select multiple>. Composed `change` (detail { value }) and `active-change`. aria-activedescendant referencing shadow options works because list and options share the shadow root; Combobox composes ds-listbox inside its own shadow root for the same reason.'
    rn:
      element: FlatList
      props: [accessibilityRole=list, accessibilityState, accessibilityRole=menuitem]
      notes: 'A FlatList (virtualised — long option lists are common) of Pressable rows with accessibilityRole="menuitem" (no listbox/option roles on native) and accessibilityState={{ selected, disabled }}; multiple: accessibilityState.checked. maxVisible → maxHeight = rows × row height measured from the first row. Each option is its own accessibility stop; typeahead and arrows apply with a hardware keyboard only.'
    swiftui:
      element: ScrollView
      props: [ScrollView, LazyVStack, Button, .accessibilityAddTraits=isSelected, .focusable, .onMoveCommand, .onKeyPress, '@FocusState', ScrollViewReader, .accessibilityElement=contain]
      notes: 'A `ScrollView` + `LazyVStack` of option rows (`Button`s with `.isSelected`, group headers as `Text` with `.isHeader`) inside a `.contain` element labelled by `label`/`labelledBy`; not `List`. The list is one focus section: arrows move the active `@FocusState` index, type-ahead via `.onKeyPress(characters:)`, Home/End via `.onKeyPress(.home/.end)`, Space/Enter select per mode; `ScrollViewReader` keeps the active option in view and `maxVisible` sets the frame height from the measured row height. `multiple` rows show the check Icon and the count is announced. `embedded` drops the surface bindings for Select/Combobox/Search hosts.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/error-identified ones from the schema.
    - name: click-on-an-option-selects-it
      when: { click: option }
      then:
        - { event: onChange }
    - name: arrow-selects-as-it-moves-when-selection-follows-focus
      description: Single-select with selectionFollowsFocus - arrow keys select as they move (the common picker feel).
      given: { selectionFollowsFocus: true }
      when: { key: ArrowDown }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: arrows-only-move-when-selection-does-not-follow-focus
      description: With selectionFollowsFocus false the arrows move the active option and select nothing; onActiveChange still reports the move.
      given: { selectionFollowsFocus: false }
      when: { key: ArrowDown }
      then:
        - { event: onChange, fired: false }
        - { event: onActiveChange }
      platforms: [web, lit]
    - name: space-selects-the-active-option
      given: { selectionFollowsFocus: false }
      when: { key: Space }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: a-disabled-option-cannot-be-selected
      given: { options: [{ value: apple, label: Apple, disabled: true }, { value: banana, label: Banana }] }
      when: { click: option }
      then:
        - { event: onChange, fired: false }
    - name: multiple-marks-the-list-multiselectable
      description: With multiple the value is an array, each option shows a check, and selection toggles rather than moves.
      given: { multiple: true }
      then:
        - { attribute: aria-multiselectable, is: 'true' }
      platforms: [web]
    - name: a-selected-option-is-marked-selected
      given: { defaultValue: apple }
      then:
        - { attribute: aria-selected, is: 'true', 'on': option }
      platforms: [web]
    - name: the-empty-message-shows-when-there-are-no-options
      given: { options: [] }
      then:
        - { copy: empty }
    - name: a-custom-empty-message-replaces-the-default
      given: { options: [], emptyMessage: 'No fruit matches that.' }
      then:
        - { text: 'No fruit matches that.' }
    - name: loading-replaces-the-empty-message
      description: While options are being fetched the list shows copy.loading in place of the empty message and is aria-busy.
      given: { options: [], loading: true }
      then:
        - { copy: loading }
        - { attribute: aria-busy, is: 'true', platforms: [web] }
    - name: invalid-renders-the-invalid-copy
      given: { invalid: true }
      then:
        - { copy: invalid }
        - { state: invalid, is: true, platforms: [web, lit] }
  examples:
    - name: single-picker
      description: The standalone visible picker, where arrows select as they move.
      given: { label: Fruit, options: [{ value: apple, label: Apple }, { value: banana, label: Banana }, { value: cherry, label: Cherry }] }
    - name: multi-select-with-checks
      description: Any number of selections, each selected row carrying a check.
      given: { label: Roles, multiple: true, defaultValue: [frontend], options: [{ value: frontend, label: Frontend }, { value: backend, label: Backend }, { value: design, label: Design }] }
    - name: grouped-options
      description: Options under group headings, for a list long enough to need sections.
      given: { label: Role, options: [{ group: Engineering, options: [{ value: frontend, label: Frontend }, { value: backend, label: Backend }] }, { group: Design, options: [{ value: product, label: Product design }] }] }
    - name: embedded-in-a-popup
      description: The same engine inside a Select or Combobox popup, which owns the surface, capped at five rows.
      given: { label: Country, embedded: true, maxVisible: '5', options: [{ value: ca, label: Canada }, { value: fr, label: France }, { value: jp, label: Japan }] }
---

A listbox is a list you choose from. It is the part of a dropdown that actually does the work — the arrows, the typeahead, the selection — extracted so that a visible picker, a Select's popup and a Combobox's suggestions all behave identically, including for multi-select. If Select is the trigger and Combobox is the input, Listbox is the engine.

## When to use

Use a standalone Listbox when the options should stay visible: a settings picker with five to twenty entries, a transfer list, the sidebar of a two-pane chooser. Use `multiple` for "pick any": tags, recipients, filters. Set `selectionFollowsFocus: false` when selecting has side effects (loading a preview), so arrow-key browsing does not trigger them. Everywhere else, use Select (short lists, form fields) or Combobox (long lists, typing to filter) — both open a Listbox.

## When not to use

Do not use a Listbox for two to seven options that fit on screen and need no scrolling; a RadioGroup (single) or a set of Checkboxes (multiple) is simpler and has native semantics. Do not use it for actions (Menu) or for navigation (Links). Do not present a multi-select without showing the selected count or chips somewhere, or users lose track of what they picked.

## Behavior

The list is one tab stop. Arrow keys move the active option and, in single-select with `selectionFollowsFocus`, select it; Space selects or toggles, Enter selects; Home/End and PageUp/PageDown jump; typing letters moves to the matching label. In `multiple`, each option shows a check, Space toggles, Shift+Arrow extends, Ctrl/Cmd+A selects all, and `onChange` receives the array in option order. Disabled options are visible, announced, skipped by arrows and not selectable. The active option is always scrolled into view; the list scrolls after `maxVisible` rows. When `options` is empty, `emptyMessage` shows and the list is still focusable so a Combobox user hears "No options". Inside a Form, `name` collects the value (array for `multiple`) and `required` fails when nothing is selected. Arrow keys clamp at the first and last enabled option (no wrapping; Home and End reach the ends). Home, End and type-ahead follow `selectionFollowsFocus` exactly as the arrows do. Enter selects only in single-select (a no-op with `multiple`, where Space toggles). Rows are `fontSize × lineHeight + 2 × optionPaddingBlock` tall, which is what `maxVisible` and PageUp/PageDown count; the first option row, not a group label, is the measure on native. Option icons render at Icon `size: sm`. Empty groups are omitted. Without `name` the list does not register with a Form.

## Content guidelines

Option labels are short, unique within the list, sentence case, no trailing punctuation; use `description` for the second line rather than a longer label. Group labels are one or two words. The empty message states the situation, not an instruction ("No matching people", not "Try another search"). When the list is multi-select, the surrounding UI shows `copy.selectedCount` or the selected items.

## Accessibility

Role `listbox` with a name, `aria-multiselectable` when `multiple`, options with `aria-selected`, groups with names (WCAG 4.1.2; APG listbox). One tab stop with arrow navigation and typeahead; the active option is announced via `aria-activedescendant` while DOM focus stays on the list (or, in Combobox, on the input). Selected and active states are visually distinct — check mark and weight for selected, background for active — so neither is color alone (1.4.1) and a sighted keyboard user can tell "where I am" from "what I chose". Options meet 24px (2.5.8) and text meets AA on both the surface and the active background; the check meets 3:1.

## Platform notes

### Web
`<div role="listbox" tabindex="0" aria-label|aria-labelledby aria-multiselectable aria-activedescendant={activeId}>` containing `<div role="group" aria-labelledby>` and `<div role="option" id aria-selected aria-disabled>` rows with `<Icon name="check">` (invisible when unselected, so labels align), optional `<Icon>`, label and description. Keydown on the list implements the table; `pointermove` over an option sets it active; click selects. Scroll the active option into view with `block: 'nearest'`. Expose `activeId` and the keydown handler through a ref/hook (`useListbox`) so Combobox can forward its input's keys to the list. Form registration as Input, with `getValue` returning the array for `multiple`.

### Lit
`<ds-listbox label="Assignees" multiple .options=${…}>`; form-associated (`setFormValue(FormData)` for multiple, string otherwise); `aria-activedescendant` between shadow siblings; composed `change` and `active-change`. Expose a `handleKey(event)` method and `activeValue` for `ds-combobox`.

### React Native
`FlatList` of `Pressable` rows with `accessibilityRole="menuitem"`, `accessibilityState={{ selected, checked: multiple ? selected : undefined, disabled }}`, and `accessibilityLabel` = label plus description. `maxVisible` becomes `maxHeight`. Groups are plain `Text` rows (not the header trait, which would enter the headings rotor). No activedescendant on native; each row is a stop. Form registration as Input.

## Related

Select, Combobox, RadioGroup, Checkbox, Menu.
