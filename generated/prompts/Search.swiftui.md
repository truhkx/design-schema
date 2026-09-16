# Generate: Search for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Search.swift` declaring `public struct Search: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/SearchBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Search.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Search") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("Search")` on the root and `"Search.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for swiftui; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: each closure takes exactly the listed arguments, in order, and `reason` is a nested `enum` of its reasons. A `cancelable` closure returns `Bool`, and `false` skips the default action. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: every pair becomes a `Binding<T>?` parameter plus the default's initial value, with `@State` holding the uncontrolled value; the closure fires in both modes, and a bound view shows the new state only once the binding changes.
- **Parts and slots**: each slot is a `@ViewBuilder` parameter under its resolved label only (`content` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides:` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (`.onHover`, `@FocusState`, or the view's own state), with the token listed for each `by` value; write `computed` as the given multiplication of `theme` values. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` applies when those props are set.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this picks among the conventions' overlay forms.
- **Copy**: interpolate only the listed `params` and props; select plural forms through `String(localized:)` with the entry's forms as its plural variations; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example becomes a `#Preview` with the name shown and exactly its `given`.
- **Lifecycle**: a deprecated parameter, closure, case or view keeps working, is marked `@available(*, deprecated, message:)` naming `use`, and warns once under `#if DEBUG` naming `use`.
- A `type: integer` prop is an `Int`: whole numbers only.

## Component schema

```yaml
component:
  name: Search
  category: input
  status: review
  apg: combobox
  anatomy:
  - landmark
  - form
  - label
  - field
  - icon
  - input
  - clearButton
  - submitButton
  - suggestions
  composition:
    label: Text
    icon: Icon
    clearButton: Button
    submitButton: Button
    suggestions:
      component: Listbox
      props:
        embedded: true
  props:
    label:
      type: string
      required: true
      description: The accessible name ("Search products", "Search this site"). Visually
        hidden by default — the glyph and placeholder are the visible cue.
      a11y: label/for on the input, visually hidden unless `showLabel`.
    showLabel:
      type: boolean
      default: false
      description: Show the label above the field, as in a search page rather than
        a header.
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
      description: URL to submit to with GET (web); when omitted, `onSubmit` handles
        it and nothing navigates.
    suggestions:
      type: array
      shape: '{ value: string; label: string; description?: string }[]'
      description: 'Suggestions for the current query, shown in a Listbox under the
        field; choosing one fills the query with the suggestion''s `label` — what
        the user just read — and submits. Provide them from `onChange` (debounced
        by the caller). Setting the prop at all is what turns the field into a combobox,
        including an explicitly empty array after a fetch that found nothing, which
        shows `copy.noSuggestions`; leaving it undefined keeps a plain search field.
        With suggestions the field becomes a Combobox: same keys, `aria-activedescendant`.'
    loading:
      type: boolean
      default: false
      description: Suggestions are being fetched; announced through `copy.loading`.
    landmark:
      type: boolean
      default: true
      description: 'Give the field the `search` landmark. Turn off when the Search
        sits inside another search landmark (a filter within a results page). It is
        `role="search"` on Search''s own form element, not a composed Landmark wrapping
        it: the landmark is one attribute on an element this component already renders,
        and a wrapper would add a second element and take the root''s testability
        hook. With a single search landmark on the page it needs no name of its own
        beyond the field''s label.'
    size:
      type: enum
      enumRef: size
      values:
      - md
      - lg
      default: md
      description: lg for a search page's hero field.
    disabled:
      type: boolean
      default: false
      description: Not editable, still readable.
  events:
    onChange:
      description: Fired on every keystroke with the query; the caller fetches suggestions
        here.
      platforms:
        web: onChange
        lit: change
        rn: onChangeText
        swiftui: onChange
      payload:
      - name: value
        type: string
        description: The query as typed.
      fires:
      - user
    onSubmit:
      description: Fired on Enter, the submit button, or choosing a suggestion, with
        the query.
      platforms:
        web: onSubmit
        lit: submit
        rn: onSubmitEditing
        swiftui: onSubmit
      payload:
      - name: value
        type: string
        description: The submitted query.
      fires:
      - user
    onClear:
      description: Fired when the field is emptied — by the clear button, or by the
        Escape that clears it when no suggestions are open. Either route reports.
      platforms:
        web: onClear
        lit: clear
        rn: onClear
        swiftui: onClear
      fires:
      - user
  keyboard:
  - keys:
    - Enter
    action: Submits the query (or the highlighted suggestion).
    from: first
    expect: manual
  - keys:
    - Escape
    action: Closes suggestions if open; otherwise clears the field.
    from: first
    expect: manual
  - keys:
    - ArrowDown
    action: Opens suggestions and highlights the first; then moves down.
    when: suggestions
    from: first
    expect: manual
  - keys:
    - ArrowUp
    action: Moves up; from the first, back to the input with no highlight.
    when: suggestions
    from: first
    expect: manual
  - keys:
    - Tab
    action: 'Leaves the field: to the clear button when the field has text, then the
      submit button.'
    from: first
    expect: focus-next
  styles:
    background:
      token: color.control.background
      locked: true
    foreground:
      token: color.foreground
      locked: true
    placeholder:
      token: color.foreground.muted
      locked: true
    iconColor:
      token: color.foreground.muted
      part: icon
      locked: true
    border:
      token: color.border.strong
      locked: true
    borderFocus:
      token: color.border.focus
      locked: true
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.full
      description: 'A pill: the one place the system uses the full radius on a field,
        so search reads as search.'
      locked: false
    paddingInline:
      token: space.md
      locked: false
    paddingBlock:
      token: space.sm
      by: size
      values:
        lg: space.md
      locked: false
    affixGap:
      token: layout.gap.tight
      description: Between the glyph, the input and the buttons.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    suggestionsOffset:
      token: space.1
      part: suggestions
      locked: false
    popupSurface:
      token: color.overlay.surface
      locked: false
    popupBorder:
      token: color.border
      locked: false
    popupRadius:
      token: radius.md
      locked: false
    popupShadow:
      token: shadow.overlay
      locked: false
    partGap:
      token: space.1
      description: Between the visible label and the field.
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
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
        count:
          type: number
          description: The number of suggestions in the list.
    noSuggestions: No suggestions
  a11y:
    role: searchbox
    requires:
    - label-association
    - accessible-name
    - landmark-role
    - keyboard-operable
    - arrow-navigation
    - focus-visible
    - contrast-aa
    - target-24px
    - live-region
    - escape-dismiss
    contrast:
    - foreground: color.foreground
      background: color.control.background
      level: AA
    - foreground: color.foreground.muted
      background: color.control.background
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
    discovery: context
  platforms:
    web:
      element: form
      attributes:
      - role=search
      - type=search
      - enterkeyhint=search
      - autocomplete=off
      - aria-controls
      - aria-expanded
      - aria-activedescendant
      notes: 'A <form role="search"> (the Landmark) with a visually-hidden <label>,
        a decorative Icon "search", <input type="search" enterkeyhint="search" autocomplete="off">
        with the browser''s own clear button suppressed (::-webkit-search-cancel-button
        { display: none }) in favor of the system Button (ghost, sm, iconOnly, "close"
        Icon), and a submit Button (ghost, iconOnly, "arrow-right" Icon) — always
        rendered, on every platform, since Enter is not reachable from every on-screen
        keyboard and the Tab order names it. The glyph Icon is `size: sm` at `size:
        md` and `size: md` at `size: lg`, so it keeps its proportion to the text.
        With `suggestions` the input takes role="combobox" aria-autocomplete="list"
        and composes Listbox — `embedded`, so Search''s own popup bindings own the
        surface, border, radius and shadow — with aria-activedescendant exactly as
        Combobox does; a visually-hidden live region announces the count. ArrowUp
        from the first suggestion, or before any has been highlighted, clears the
        highlight and leaves focus in the input rather than wrapping to the last.
        While suggestions are loading, Search passes no options and `emptyMessage:
        copy.loading`, so the verbatim string is what shows.'
    lit:
      tag: ds-search
      reflect:
      - size
      - show-label
      - prop: landmark
        attribute: no-landmark
      - disabled
      - loading
      notes: The <form> lives in the shadow root; when `action` is set, submit navigates
        via a light-DOM form the element creates on demand (shadow forms do not participate
        in the page). Composed `submit`, `change`, `clear`. Suggestions in a Listbox
        inside the shadow root; aria-activedescendant works because input and listbox
        share the root.
    rn:
      element: TextInput
      props:
      - returnKeyType=search
      - clearButtonMode=never
      - accessibilityRole=search
      - accessibilityLabel
      notes: 'TextInput with returnKeyType="search" and onSubmitEditing; the system
        clear Button rather than clearButtonMode so it matches across platforms; a
        search glyph Icon before the input. Suggestions render as a Listbox below
        the field in a View (no overlay: on a phone the list takes the space under
        the field), shown while the field has focus and `suggestions` is set, and
        closed on blur. The container View has accessibilityRole="search". `name`
        and `action` are a URL query key and a GET target — neither exists on native
        — so both are accepted for parity and do nothing, and `action` warns in development.
        Listbox rows are touch Pressables with no key events, so there is no arrow-key
        highlight: a tap chooses a suggestion and Enter always submits the typed query.'
    swiftui:
      element: TextField
      props:
      - TextField
      - .submitLabel=search
      - .keyboardType
      - .autocorrectionDisabled
      - Button
      - Listbox
      - .accessibilityElement=contain
      - .accessibilityAddTraits=isSearchField
      - AccessibilityNotification
      notes: 'Not `.searchable` (navigation-bar bound). A `.contain` element labelled
        by `label` holding the `search` Icon, a `TextField` with `.isSearchField`,
        `.submitLabel(.search)`, `.autocorrectionDisabled`, the clear `Button` when
        there is text, and the submit `Button`; `onSubmit` from `.onSubmit`. Suggestions:
        `Listbox embedded` inline below the field (the keyboard is up), active index
        tracked and announced as Combobox; the count announced on open. `landmark`
        registers a ''Search'' rotor entry through Landmark. `action` has no meaning
        on iOS (no form navigation) and is ignored with a debug note.'
  behavior:
  - name: typing-fires-onchange-with-the-query
    description: Typing fires onChange on every keystroke; the caller fetches suggestions
      there.
    when:
      type: invoices
    then:
    - event: onChange
  - name: enter-submits-the-query
    given:
      defaultValue: invoices
    when:
      key: Enter
    then:
    - event: onSubmit
    platforms:
    - web
    - lit
  - name: an-empty-query-is-not-submitted
    description: The field never submits an empty query.
    when:
      key: Enter
    then:
    - event: onSubmit
      fired: false
    platforms:
    - web
    - lit
  - name: the-submit-button-submits-the-query
    description: The submit button submits the same query Enter does; with `action`
      it is the same native GET form submit.
    given:
      defaultValue: invoices
      action: /search
    when:
      click: submitButton
    then:
    - event: onSubmit
  - name: the-clear-button-empties-the-field
    description: The clear button appears when there is text, empties the field and
      fires onClear.
    given:
      defaultValue: invoices
    when:
      click: clearButton
    then:
    - event: onClear
  - name: escape-clears-the-field-when-no-list-is-open
    description: Escape closes suggestions if open; otherwise it clears the field,
      and onClear fires for that too.
    given:
      defaultValue: invoices
    when:
      key: Escape
    then:
    - event: onClear
    platforms:
    - web
    - lit
  - name: the-field-is-inside-the-search-landmark
    description: The one primary search is wrapped in the search landmark so it can
      be jumped to.
    then:
    - role: search
    platforms:
    - web
    - rn
  examples:
  - name: header-search
    description: The site header's field - label hidden, glyph and placeholder as
      the visible cue.
    given:
      label: Search this site
      placeholder: Search products and orders
  - name: search-page-hero
    description: A search page's main field, larger and with its label shown.
    given:
      label: Search orders
      showLabel: true
      size: lg
  - name: with-suggestions
    description: Completions offered under the field, where choosing one fills the
      query and submits.
    given:
      label: Search products
      suggestions:
      - value: invoices-march
        label: Invoices from March
      - value: invoices-april
        label: Invoices from April
  - name: filter-within-a-results-page
    description: A second search field inside a results page, with the landmark off
      so there is only one.
    given:
      label: Filter results
      landmark: false
      name: filter
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: string`
  - fires on: user
- `onSubmit`: emit `onSubmit`
  - payload, positional, in this order: `value: string`
  - fires on: user
- `onClear`: emit `onClear`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Parts and slots

- `landmark`: element
- `form`: element
- `label`: component `Text`
- `field`: element
- `icon`: component `Icon`
- `input`: element
- `clearButton`: component `Button`
- `submitButton`: component `Button`
- `suggestions`: component `Listbox`; props `embedded` = true

## Style bindings

- `iconColor`: token `color.foreground.muted`; part `icon`; locked
- `paddingBlock`: token `space.sm`; by `size`: lg → `space.md`, any other value → `space.sm`
- `suggestionsOffset`: token `space.1`; part `suggestions`

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: string
  name: name
  discovery: context
```

## Copy

- `clear`: "Clear search"
- `submit`: "Search"
- `loading`: "Loading suggestions"
- `suggestionsCount`: "{count} suggestions available"; params `count` (number); plural by `count`: one "{count} suggestion available", other "{count} suggestions available"
- `noSuggestions`: "No suggestions"

## Constants and examples

- example `header-search`, story `HeaderSearch`: given `label: "Search this site"`, `placeholder: "Search products and orders"`; The site header's field - label hidden, glyph and placeholder as the visible cue.
- example `search-page-hero`, story `SearchPageHero`: given `label: "Search orders"`, `showLabel: true`, `size: "lg"`; A search page's main field, larger and with its label shown.
- example `with-suggestions`, story `WithSuggestions`: given `label: "Search products"`, `suggestions: [{"value":"invoices-march","label":"Invoices from March"},{"value":"invoices-april","label":"Invoices from April"}]`; Completions offered under the field, where choosing one fills the query and submits.
- example `filter-within-a-results-page`, story `FilterWithinAResultsPage`: given `label: "Filter results"`, `landmark: false`, `name: "filter"`; A second search field inside a results page, with the landmark off so there is only one.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `affixGap`, `fontFamily`, `fontSize`, `lineHeight`, `suggestionsOffset`, `popupSurface`, `popupBorder`, `popupRadius`, `popupShadow`, `partGap`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `iconColor`, `border`, `borderFocus`, `minTarget`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: TextField
props:
- TextField
- .submitLabel=search
- .keyboardType
- .autocorrectionDisabled
- Button
- Listbox
- .accessibilityElement=contain
- .accessibilityAddTraits=isSearchField
- AccessibilityNotification
notes: 'Not `.searchable` (navigation-bar bound). A `.contain` element labelled by
  `label` holding the `search` Icon, a `TextField` with `.isSearchField`, `.submitLabel(.search)`,
  `.autocorrectionDisabled`, the clear `Button` when there is text, and the submit
  `Button`; `onSubmit` from `.onSubmit`. Suggestions: `Listbox embedded` inline below
  the field (the keyboard is up), active index tracked and announced as Combobox;
  the count announced on open. `landmark` registers a ''Search'' rotor entry through
  Landmark. `action` has no meaning on iOS (no form navigation) and is ignored with
  a debug note.'
```

## Guidance

## Overview

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

## Behavior scenarios (8)

One test per scenario, in this order.

```yaml
- name: typing-fires-onchange-with-the-query
  description: Typing fires onChange on every keystroke; the caller fetches suggestions
    there.
  when:
    type: invoices
  then:
  - event: onChange
- name: the-submit-button-submits-the-query
  description: The submit button submits the same query Enter does; with `action`
    it is the same native GET form submit.
  given:
    defaultValue: invoices
    action: /search
  when:
    click: submitButton
  then:
  - event: onSubmit
- name: the-clear-button-empties-the-field
  description: The clear button appears when there is text, empties the field and
    fires onClear.
  given:
    defaultValue: invoices
  when:
    click: clearButton
  then:
  - event: onClear
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-size-lg
  given:
    size: lg
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: control-is-focusable
  then:
  - focusable: true
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```
