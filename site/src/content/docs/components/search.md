---
title: Search
description: A search field with a leading glyph, a clear button, submit-on-Enter and optional suggestions — the one Input a site puts in its header, wrapped in the search landmark.
component:
  name: Search
  category: input
  status: review
  apg: combobox
  anatomy: [landmark, form, label, field, icon, input, clearButton, submitButton, suggestions]
  composition:
    label: Text
    icon: Icon
    clearButton: Button
    submitButton: Button
    suggestions: Listbox
    landmark: Landmark
  props:
    label:
      type: string
      required: true
      description: The accessible name ("Search products", "Search this site"). Visually hidden by default — the glyph and placeholder are the visible cue.
      a11y: label/for on the input, visually hidden unless `showLabel`.
    showLabel:
      type: boolean
      default: false
      description: Show the label above the field, as in a search page rather than a header.
    name:
      type: string
      default: q
      description: Field name; the query key when the form submits to a URL.
    value:
      type: string
      description: Controlled query.
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: Initial query.
    placeholder:
      type: string
      description: Example query, not a label ("Try "invoices from March"").
    action:
      type: string
      description: 'URL to submit to with GET (web); when omitted, `onSubmit` handles it and nothing navigates.'
    suggestions:
      type: array
      shape: '{ value: string; label: string; description?: string }[]'
      description: 'Suggestions for the current query, shown in a Listbox under the field; choosing one fills the query and submits. Provide them from `onChange` (debounced by the caller). With suggestions the field becomes a Combobox: same keys, `aria-activedescendant`.'
    loading:
      type: boolean
      default: false
      description: Suggestions are being fetched; announced through `copy.loading`.
    landmark:
      type: boolean
      default: true
      description: Wrap in the `search` Landmark. Turn off when the Search sits inside another search landmark (a filter within a results page).
    size:
      type: enum
      enumRef: size
      values: [md, lg]
      default: md
      description: 'lg for a search page''s hero field.'
    disabled:
      type: boolean
      default: false
      description: Not editable, still readable.
  events:
    onChange:
      description: Fired on every keystroke with the query; the caller fetches suggestions here.
      platforms: { web: onChange, lit: change, rn: onChangeText, swiftui: onChange }
      payload:
        - { name: value, type: string, description: The query as typed. }
      fires: [user]
    onSubmit:
      description: Fired on Enter, the submit button, or choosing a suggestion, with the query.
      platforms: { web: onSubmit, lit: submit, rn: onSubmitEditing, swiftui: onSubmit }
      payload:
        - { name: value, type: string, description: The submitted query. }
      fires: [user]
    onClear:
      description: Fired when the clear button empties the field.
      platforms: { web: onClear, lit: clear, rn: onClear, swiftui: onClear }
      fires: [user]
  keyboard:
    - { keys: [Enter], action: 'Submits the query (or the highlighted suggestion).', from: first, expect: manual }
    - { keys: [Escape], action: 'Closes suggestions if open; otherwise clears the field.', from: first, expect: manual }
    - { keys: [ArrowDown], action: 'Opens suggestions and highlights the first; then moves down.', when: suggestions, from: first, expect: manual }
    - { keys: [ArrowUp], action: 'Moves up; from the first, back to the input with no highlight.', when: suggestions, from: first, expect: manual }
    - { keys: [Tab], action: 'Leaves the field: to the clear button when the field has text, then the submit button.', from: first, expect: focus-next }
  styles:
    background: { token: color.control.background }
    foreground: { token: color.foreground }
    placeholder: { token: color.foreground.muted }
    iconColor: { token: color.foreground.muted, part: icon }
    border: { token: color.border.strong }
    borderFocus: { token: color.border.focus }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.full, description: 'A pill: the one place the system uses the full radius on a field, so search reads as search.' }
    paddingInline: { token: space.md }
    paddingBlock: { token: space.sm, by: size, values: { lg: space.md } }
    affixGap: { token: layout.gap.tight, description: 'Between the glyph, the input and the buttons.' }
    fontFamily: { token: font.family.body }
    fontSize: { token: 'font.size.{size}' }
    lineHeight: { token: font.lineHeight.normal }
    suggestionsOffset: { token: space.1, part: suggestions }
    popupSurface: { token: color.overlay.surface }
    popupBorder: { token: color.border }
    popupRadius: { token: radius.md }
    popupShadow: { token: shadow.overlay }
    partGap: { token: space.1, description: 'Between the visible label and the field.' }
    minTarget: { token: size.target.comfortable }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
  copy:
    clear: Clear search
    submit: Search
    loading: Loading suggestions
    suggestionsCount:
      plural:
        by: count
        one: '{count} suggestion available'
        other: '{count} suggestions available'
      params:
        count: { type: number, description: The number of suggestions in the list. }
    noSuggestions: No suggestions
  a11y:
    role: searchbox
    requires: [label-association, accessible-name, landmark-role, keyboard-operable, arrow-navigation, focus-visible, contrast-aa, target-24px, live-region, escape-dismiss]
    contrast:
      - { foreground: color.foreground, background: color.control.background, level: AA }
      - { foreground: color.foreground.muted, background: color.control.background, level: AA }
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
  form:
    role: field
    value: value
    valueType: string
    name: name
    discovery: context
  platforms:
    web:
      element: form
      attributes: [role=search, type=search, enterkeyhint=search, autocomplete=off, aria-controls, aria-expanded, aria-activedescendant]
      notes: 'A <form role="search"> (the Landmark) with a visually-hidden <label>, a decorative Icon "search", <input type="search" enterkeyhint="search" autocomplete="off"> with the browser''s own clear button suppressed (::-webkit-search-cancel-button { display: none }) in favor of the system Button (ghost, sm, iconOnly, "close" Icon), and a submit Button (ghost, iconOnly, "arrow-right" Icon; hidden when `action` is absent and the caller only wants Enter). With `suggestions` the input takes role="combobox" aria-autocomplete="list" and composes Listbox with aria-activedescendant exactly as Combobox does; a visually-hidden live region announces the count.'
    lit:
      tag: ds-search
      reflect: [size, show-label, { prop: landmark, attribute: no-landmark }, disabled, loading]
      notes: 'The <form> lives in the shadow root; when `action` is set, submit navigates via a light-DOM form the element creates on demand (shadow forms do not participate in the page). Composed `submit`, `change`, `clear`. Suggestions in a Listbox inside the shadow root; aria-activedescendant works because input and listbox share the root.'
    rn:
      element: TextInput
      props: [returnKeyType=search, clearButtonMode=never, accessibilityRole=search, accessibilityLabel]
      notes: 'TextInput with returnKeyType="search" and onSubmitEditing; the system clear Button rather than clearButtonMode so it matches across platforms; a search glyph Icon before the input. Suggestions render as a Listbox below the field in a View (no overlay: on a phone the list takes the space under the field). The container View has accessibilityRole="search".'
    swiftui:
      element: TextField
      props: [TextField, .submitLabel=search, .keyboardType, .autocorrectionDisabled, Button, Listbox, .accessibilityElement=contain, .accessibilityAddTraits=isSearchField, AccessibilityNotification]
      notes: 'Not `.searchable` (navigation-bar bound). A `.contain` element labelled by `label` holding the `search` Icon, a `TextField` with `.isSearchField`, `.submitLabel(.search)`, `.autocorrectionDisabled`, the clear `Button` when there is text, and the submit `Button`; `onSubmit` from `.onSubmit`. Suggestions: `Listbox embedded` inline below the field (the keyboard is up), active index tracked and announced as Combobox; the count announced on open. `landmark` registers a ''Search'' rotor entry through Landmark. `action` has no meaning on iOS (no form navigation) and is ignored with a debug note.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/focusable ones from the schema.
    - name: typing-fires-onchange-with-the-query
      description: Typing fires onChange on every keystroke; the caller fetches suggestions there.
      when: { type: invoices }
      then:
        - { event: onChange }
    - name: enter-submits-the-query
      given: { defaultValue: invoices }
      when: { key: Enter }
      then:
        - { event: onSubmit }
      platforms: [web, lit]
    - name: an-empty-query-is-not-submitted
      description: The field never submits an empty query.
      when: { key: Enter }
      then:
        - { event: onSubmit, fired: false }
      platforms: [web, lit]
    - name: the-submit-button-submits-the-query
      description: The submit button submits the same query Enter does; with `action` it is the same native GET form submit.
      given: { defaultValue: invoices, action: /search }
      when: { click: submitButton }
      then:
        - { event: onSubmit }
    - name: the-clear-button-empties-the-field
      description: The clear button appears when there is text, empties the field and fires onClear.
      given: { defaultValue: invoices }
      when: { click: clearButton }
      then:
        - { event: onClear }
    - name: escape-clears-the-field-when-no-list-is-open
      description: Escape closes suggestions if open; otherwise it clears the field, and onClear fires for that too.
      given: { defaultValue: invoices }
      when: { key: Escape }
      then:
        - { event: onClear }
      platforms: [web, lit]
    - name: the-field-is-inside-the-search-landmark
      description: The one primary search is wrapped in the search landmark so it can be jumped to.
      then:
        - { role: search }
      platforms: [web, rn]
  examples:
    - name: header-search
      description: The site header's field - label hidden, glyph and placeholder as the visible cue.
      given: { label: Search this site, placeholder: Search products and orders }
    - name: search-page-hero
      description: A search page's main field, larger and with its label shown.
      given: { label: Search orders, showLabel: true, size: lg }
    - name: with-suggestions
      description: Completions offered under the field, where choosing one fills the query and submits.
      given: { label: Search products, suggestions: [{ value: invoices-march, label: Invoices from March }, { value: invoices-april, label: Invoices from April }] }
    - name: filter-within-a-results-page
      description: A second search field inside a results page, with the landmark off so there is only one.
      given: { label: Filter results, landmark: false, name: filter }
---

Search is the field people look for first. It is an Input shaped so nobody has to read a label — a magnifier glyph, a pill, a clear button — and it submits on Enter like every search field they have used.

## When to use

Use Search for free-text search over a site, an app, or a large dataset: the header search, a search page's main field, a "filter the list" field over more than a couple of dozen rows. Add `suggestions` when the backend can offer completions or recent queries; keep `landmark` on for the one primary search so screen-reader users can jump to it.

## When not to use

Do not use Search for a field that takes a specific value (an order number: Input), for choosing from a known list (Select or Combobox), or for a filter that applies instantly to a short list already on screen (an Input labelled "Filter" is honest about what it does). Do not put two search landmarks on a page.

## Behavior

Typing fires `onChange`; the clear button appears when there is text and empties the field, returns focus to it and fires `onClear`. Enter or the submit button fires `onSubmit` with the trimmed query (and navigates to `action` on web when set). With suggestions, ArrowDown opens the list and moves the highlight while focus stays in the input; Enter submits the highlighted suggestion's value; Escape closes the list first, then clears. `loading` shows nothing visually until suggestions arrive but is announced. The field never submits an empty query. Choosing a suggestion fills the query with its `label` (the display text). With `action`, submission is a native GET form submit (Enter, the submit button and a chosen suggestion all submit the same form), never a scripted navigation. The submit button is always rendered. Suggestions mode starts when the `suggestions` prop is set at all (an empty array shows the empty/loading row). `onClear` fires for the clear button and for an Escape that empties the field. ArrowUp with no highlight is a no-op. The landmark is the composed Landmark (`search`) named by `label`; the popup bindings style the wrapper and the Listbox is `embedded`.

## Content guidelines

The label says what is searched ("Search orders"); the placeholder, if any, shows an example query rather than repeating the label. Suggestion labels show the completion with the typed part not highlighted (the system does not bold matches; the list is short enough to read). Keep suggestions to eight.

## Accessibility

The form is the page's `search` landmark (WCAG 1.3.6; APG landmarks) and the input a `searchbox` with an associated label that is visually hidden but present (1.3.1, 2.4.6). With suggestions the field follows the combobox pattern with `aria-activedescendant`, so focus never leaves the input and the count is announced (4.1.2, 4.1.3). The clear and submit buttons are real Buttons with names from copy and 24px targets. Escape closes the list before clearing, so it never destroys typed text unexpectedly (2.1.2).

## Platform notes

### Web
Render `<form role="search" data-ds="Search" onSubmit>` containing a visually-hidden `<label>`, the field wrapper (pill from `radius`, border, background) with `Icon name="search"` (decorative), `<input type="search" enterkeyhint="search" autocomplete="off">`, the clear `Button` when `value` is non-empty, and the submit `Button` when `action` is set. Suggestions: reuse Combobox's list rendering — `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `Listbox` in a portal positioned under the field on `layer.dropdown`. Suppress the native cancel button via the WebKit pseudo-element.

### Lit
`<ds-search label="Search products" action="/search"></ds-search>`; shadow `<form>`; for navigation create a light-DOM `<form method="get" action>` with a hidden input and submit it; composed events; Listbox inside the shadow root.

### React Native
`View accessibilityRole="search"` containing `Icon`, `TextInput` (`returnKeyType="search"`, `onSubmitEditing`), and the clear `Button`. Suggestions: `Listbox` below the field, inline, `keyboardShouldPersistTaps="handled"` so a tap on a suggestion is not swallowed by keyboard dismissal.

## Related

Input, Combobox, Listbox, Landmark, Button.
