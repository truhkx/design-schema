# Generate: Search for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Search.tsx` exporting a typed React function component named `Search`, plus `Search.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Search({ ref, …rest }: SearchProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
- Render the element and attributes declared under `platforms.web`. Map each event to its `platforms.web` name.
- Style ONLY through the CSS custom properties generated from tokens (`--color-…`, `--space-…`, `--font-…`, `--radius-…`). Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `var(--color-action-${variant}-background)`.
- Implement every item in `a11y.requires`:
  - `accessible-name`: the `label` prop is rendered as visible text or `aria-label`; never both empty.
  - `focus-visible`: a `:focus-visible` outline using `--color-border-focus` and `--border-width-focus`. Never remove the outline without replacing it.
  - `keyboard-operable`: native element semantics (do not build interactive elements from `<div>`).
  - `target-24px` / `target-44px`: `min-inline-size`/`min-block-size` from `--size-target-min` / `--size-target-comfortable`.
  - `heading-hierarchy`: render the heading level as the matching `<h1>`–`<h6>`; do not pick the element by visual size.
- `disabled` uses `aria-disabled="true"` and keeps the element focusable (WCAG-friendly) unless the schema says otherwise. On native checkable inputs (checkbox, radio, switch) `readOnly` has no effect, so guard with `preventDefault()` in both `click` and `change`.
- Visually hidden text (for accessible-name suffixes) uses the standard clip pattern — absolute, 1px box, `clip-path: inset(50%)`, `white-space: nowrap` — the one sanctioned use of pixel literals.
- Support light and dark by relying on the token variables only — no theme logic in the component.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard` and are removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children, no decorators that add other focusable elements.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system component. Overlays: render into a portal at `document.body` (a `container` prop may override), lock body scroll while open, make the rest of the page `inert` for modal dialogs (`focus-trap` + `inert-background`), restore focus to the opener on close (`focus-restore`), position non-modal popups with `position: fixed` from the trigger's `getBoundingClientRect()` and flip when they would overflow the viewport, and put them on the right stacking layer with `z-index: var(--layer-<name>)`.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`; title `'<Name>/React'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Search> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Search.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for web; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false` or calls `preventDefault()` on the event it receives. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element), only in its `state` (`:hover`, `:focus-visible`, the ARIA state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
    suggestions: Listbox
    landmark: Landmark
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
        field; choosing one fills the query and submits. Provide them from `onChange`
        (debounced by the caller). With suggestions the field becomes a Combobox:
        same keys, `aria-activedescendant`.'
    loading:
      type: boolean
      default: false
      description: Suggestions are being fetched; announced through `copy.loading`.
    landmark:
      type: boolean
      default: true
      description: Wrap in the `search` Landmark. Turn off when the Search sits inside
        another search landmark (a filter within a results page).
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
      description: Fired when the clear button empties the field.
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
        Icon), and a submit Button (ghost, iconOnly, "arrow-right" Icon; hidden when
        `action` is absent and the caller only wants Enter). With `suggestions` the
        input takes role="combobox" aria-autocomplete="list" and composes Listbox
        with aria-activedescendant exactly as Combobox does; a visually-hidden live
        region announces the count.'
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
        the field). The container View has accessibilityRole="search".'
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

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `affixGap`, `fontFamily`, `fontSize`, `lineHeight`, `suggestionsOffset`, `popupSurface`, `popupBorder`, `popupRadius`, `popupShadow`, `partGap`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `iconColor`, `border`, `borderFocus`, `minTarget`, `focusRingWidth`

## Behavior scenarios (12)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
  description: Escape closes suggestions if open; otherwise it clears the field, and
    onClear fires for that too.
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

## Platform notes (web)

```yaml
element: form
attributes:
- role=search
- type=search
- enterkeyhint=search
- autocomplete=off
- aria-controls
- aria-expanded
- aria-activedescendant
notes: 'A <form role="search"> (the Landmark) with a visually-hidden <label>, a decorative
  Icon "search", <input type="search" enterkeyhint="search" autocomplete="off"> with
  the browser''s own clear button suppressed (::-webkit-search-cancel-button { display:
  none }) in favor of the system Button (ghost, sm, iconOnly, "close" Icon), and a
  submit Button (ghost, iconOnly, "arrow-right" Icon; hidden when `action` is absent
  and the caller only wants Enter). With `suggestions` the input takes role="combobox"
  aria-autocomplete="list" and composes Listbox with aria-activedescendant exactly
  as Combobox does; a visually-hidden live region announces the count.'
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
