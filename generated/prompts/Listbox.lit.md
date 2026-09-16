# Generate: Listbox as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Listbox.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Listbox.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: ListboxVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
- Each event is dispatched as a `CustomEvent` named by its `platforms.lit` value with `bubbles: true, composed: true` so it crosses the shadow boundary.
- Styles live in `static override styles: CSSResult = css\`…\`` and read ONLY token custom properties (`var(--color-…)`), which inherit through the shadow root. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes an attribute selector per enum value, e.g. `:host([variant="primary"]) { background: var(--color-action-primary-background); }`.
- Implement every item in `a11y.requires` inside the shadow DOM using a native element (e.g. a real `<button>`), and use `delegatesFocus: true` in `static override shadowRootOptions: ShadowRootInit` so focusing the host focuses the inner element.
- `accessible-name`: forward `label` to visible text or `aria-label` on the inner element.
- `focus-visible`: style `:focus-visible` on the inner element with `--color-border-focus` / `--border-width-focus`.
- `heading-hierarchy`: render the matching `<h1>`–`<h6>` inside the shadow root based on the level prop.
- Support light and dark by relying on token variables only.
- Form ownership is DOM-tree based: slotted light-DOM children are not owned by a `<form>` inside a shadow root. Follow the platform notes for how ds-form and ds-input cooperate by `name`.
- Events named like native events (`focus`, `blur`) are the native retargeted events — do not dispatch a CustomEvent with the same name.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard`, removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Listbox.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element in the shadow root), only in its `state` (`:hover`, `:focus-visible`, the reflected state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated property, event, value or element keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development (`import.meta.env.DEV`) naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

## Component schema

```yaml
component:
  name: Listbox
  category: input
  status: review
  apg: listbox
  anatomy:
  - list
  - group
  - groupLabel
  - option
  - optionLabel
  - optionDescription
  - optionIcon
  - optionCheck
  - emptyState
  - errorMessage
  composition:
    optionIcon: Icon
    optionCheck: Icon
    emptyState: Text
  props:
    label:
      type: string
      required: true
      description: Accessible name of the list. When a visible Text label exists,
        pass its id via `labelledBy` instead and this is ignored.
    labelledBy:
      type: string
      description: Id of a visible element that labels the list.
      platforms:
      - web
      - lit
    options:
      type: array
      required: true
      shape: '({ value: string; label: string; description?: string; icon?: IconName;
        disabled?: boolean } | { group: string; options: ListboxOption[] })[]'
      description: Flat or grouped options. Export the item type as `ListboxOption`.
    multiple:
      type: boolean
      default: false
      description: Allow any number of selections. The value becomes an array; each
        option shows a check indicator; selection toggles rather than moves. This
        is the same engine Combobox uses for multi-select.
    value:
      type: union
      description: 'Controlled selection: a value, or with `multiple` the exported
        `ListboxValue` (`string | string[]`). Omit for uncontrolled.'
      shape: string | string[]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial selection (or array).
      shape: string | string[]
    selectionFollowsFocus:
      type: boolean
      default: true
      description: 'Single-select only: arrow keys select as they move (the common
        picker feel). Set false when selection has side effects, so arrows only move
        and Space selects.'
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
      description: Error message rendered below the list and linked by aria-describedby;
        implies invalid.
    embedded:
      type: boolean
      default: false
      description: The list lives inside a popup (Select, Combobox) that owns the
        border, surface and radius; the list draws none of its own. It keeps its own
        `listPadding` — that is content spacing, not surface chrome — and an override
        of `border`, `borderWidth`, `surface` or `radius` is a no-op while it is set,
        since overrides change values, never presence.
    initialActiveValue:
      type: string
      description: The option that is active when the list first receives focus (Select
        opens with the selected option active). It wins when it names an enabled option;
        otherwise the first selected, else the first enabled.
    loading:
      type: boolean
      default: false
      description: Options are being fetched (async Combobox); the list shows `copy.loading`
        in place of the empty message and is aria-busy.
    disabled:
      type: boolean
      default: false
      description: The whole list is inert but readable.
    name:
      type: string
      description: Field name for Form collection. Multiple values are collected as
        an array.
    emptyMessage:
      type: string
      description: Shown when `options` is empty (a filtered Combobox with no matches).
        Defaults to `copy.empty`.
    maxVisible:
      type: enum
      values:
      - '5'
      - '8'
      - '12'
      - all
      default: '8'
      description: Height in rows before the list scrolls; `all` never scrolls. There
        is no row-height token, so the height is rows × the height measured from the
        first rendered row — an estimate that is a little off when that first row
        is a group label rather than an option.
  events:
    onChange:
      description: Fired when the selection changes, with the new value (array when
        `multiple`).
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: value
        type: union
        shape: string | string[]
        description: The selected value, or every selected value with multiple.
      fires:
      - user
    onActiveChange:
      description: Fired as the focused (active) option changes, with its value —
        Combobox uses this to keep aria-activedescendant in sync; consumers rarely
        need it.
      platforms:
        web: onActiveChange
        lit: active-change
        rn: onActiveChange
        swiftui: onActiveChange
      payload:
      - name: value
        type: union
        shape: string | null
        description: The value of the active option; null when no option is active.
  keyboard:
  - keys:
    - ArrowDown
    action: Moves to the next enabled option (and selects it when selection follows
      focus).
    from: first
    expect: focus-next
  - keys:
    - ArrowUp
    action: Moves to the previous enabled option.
    from: last
    expect: focus-prev
  - keys:
    - Home
    action: First option.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last option.
    from: first
    expect: focus-last
  - keys:
    - ' '
    action: Selects the focused option; with `multiple`, toggles it.
    from: first
    expect: selects
  - keys:
    - Enter
    action: Selects the focused option (single) — inside a Select or Combobox, also
      closes the popup.
    from: first
    expect: selects
  - keys:
    - Shift+ArrowDown
    - Shift+ArrowUp
    action: 'Multiple: moves and adds the next/previous option to the selection.'
    when: multiple
    from: first
    expect: manual
  - keys:
    - Control+a
    action: 'Multiple: selects all enabled options; again clears.'
    when: multiple
    from: first
    expect: manual
  - keys:
    - a-z
    action: Typeahead to the next option whose label starts with the typed characters.
    from: first
    expect: manual
  - keys:
    - PageDown
    - PageUp
    action: Moves by the visible row count.
    from: first
    expect: manual
  styles:
    surface:
      token: color.background
      locked: true
    border:
      token: color.border.strong
      description: Only when not `embedded`; inside a popup the popup owns the border.
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.md
      locked: false
    listPadding:
      token: space.1
      part: list
      locked: false
    optionPaddingBlock:
      token: space.sm
      part: option
      locked: false
    optionPaddingInline:
      token: space.md
      part: option
      locked: false
    optionGap:
      token: layout.gap.normal
      part: option
      description: Between check, icon, label and description.
      locked: false
    optionRadius:
      token: radius.sm
      part: option
      locked: false
    optionColor:
      token: color.foreground
      part: option
      locked: true
    optionDescriptionColor:
      token: color.foreground.muted
      part: optionDescription
      locked: true
    optionDescriptionSize:
      token: font.size.sm
      part: optionDescription
      locked: false
    optionActiveBackground:
      token: color.background.subtle
      part: option
      state: active
      description: The focused/active option (keyboard or hover). Selection is shown
        by the check and weight, so active and selected are never confused.
      locked: true
    optionSelectedWeight:
      token: font.weight.medium
      part: option
      locked: false
    optionSelectedCheck:
      token: color.control.selectedBackground
      part: optionCheck
      description: The check icon on selected options (rendered only with `multiple`;
        single-select shows selection by the row fill), in the selected-control fill
        (3:1 on both surfaces by derivation); always rendered (invisible slot when
        unselected) so labels align.
      locked: true
    groupLabelColor:
      token: color.foreground.muted
      part: groupLabel
      locked: true
    groupLabelSize:
      token: font.size.xs
      part: groupLabel
      locked: false
    groupLabelWeight:
      token: font.weight.semibold
      part: groupLabel
      locked: false
    groupLabelPaddingBlock:
      token: space.1
      part: groupLabel
      locked: false
    emptyColor:
      token: color.foreground.muted
      locked: true
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
  copy:
    empty: No options
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    selectedCount:
      text: '{count} selected'
      params:
        count:
          type: number
          description: How many options are selected.
    loading: Loading…
  a11y:
    role: listbox
    requires:
    - accessible-name
    - selected-state
    - arrow-navigation
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    - error-identification
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background.subtle
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.selectedBackground
      background: color.background.subtle
      level: AA
      nonText: true
  form:
    role: field
    value: value
    valueType: string[]
    name: name
    validation:
    - required
    - invalid
    messages:
      required: required
      invalid: invalid
    discovery: context
  platforms:
    web:
      element: div
      attributes:
      - role=listbox
      - aria-label
      - aria-labelledby
      - aria-multiselectable
      - aria-activedescendant
      - aria-invalid
      - aria-required
      - aria-describedby
      - aria-busy
      - tabindex=0
      - role=option
      - aria-selected
      - aria-disabled
      - role=group
      notes: 'The list is ONE focusable element (tabindex=0) and moves an aria-activedescendant
        pointer between <div role="option"> children instead of moving DOM focus —
        this is the one composite in the system that uses activedescendant, because
        Combobox must keep focus in its input while the list is navigated. Standalone,
        DOM focus sits on the list and the active option is scrolled into view. Options
        carry aria-selected; groups are role=group with aria-labelledby. Hover sets
        the active option. Native <select multiple> is not used: it cannot be styled
        or grouped consistently and its keyboard model differs per browser.'
    lit:
      tag: ds-listbox
      reflect:
      - multiple
      - disabled
      - required
      - invalid
      - embedded
      - loading
      - prop: selectionFollowsFocus
        attribute: no-selection-follows-focus
      notes: '`options` and `value` are properties. Form-associated: setFormValue
        with a FormData carrying one entry per selected value when `multiple`, so
        a native <form> gets the same shape as a <select multiple>. Composed `change`
        (detail { value }) and `active-change`. aria-activedescendant referencing
        shadow options works because list and options share the shadow root; Combobox
        composes ds-listbox inside its own shadow root for the same reason.'
    rn:
      element: FlatList
      props:
      - accessibilityRole=list
      - accessibilityState
      - accessibilityRole=menuitem
      notes: 'A FlatList (virtualised — long option lists are common) of Pressable
        rows with accessibilityRole="menuitem" (no listbox/option roles on native)
        and accessibilityState={{ selected, disabled }}; multiple: accessibilityState.checked.
        Because there is no listbox role here, a test finds the list by its accessible
        label, never by role — the `listbox` in a11y.role is the web and Lit contract.
        maxVisible → maxHeight = rows × row height measured from the first row. Each
        option is its own accessibility stop; Pressable has no key events, so arrows,
        Home/End, Page keys, typeahead, Shift+Arrow and Ctrl+A have no native form
        at all, a tap is the selection, and `selectionFollowsFocus` is accepted for
        parity with no runtime effect. `initialActiveValue` only pre-highlights a
        row here, since there is no single tab stop to move.'
    swiftui:
      element: ScrollView
      props:
      - ScrollView
      - LazyVStack
      - Button
      - .accessibilityAddTraits=isSelected
      - .focusable
      - .onMoveCommand
      - .onKeyPress
      - '@FocusState'
      - ScrollViewReader
      - .accessibilityElement=contain
      notes: 'A `ScrollView` + `LazyVStack` of option rows (`Button`s with `.isSelected`,
        group headers as `Text` with `.isHeader`) inside a `.contain` element labelled
        by `label`/`labelledBy`; not `List`. The list is one focus section: arrows
        move the active `@FocusState` index, type-ahead via `.onKeyPress(characters:)`,
        Home/End via `.onKeyPress(.home/.end)`, Space/Enter select per mode; `ScrollViewReader`
        keeps the active option in view and `maxVisible` sets the frame height from
        the measured row height. `multiple` rows show the check Icon and the count
        is announced. `embedded` drops the surface bindings for Select/Combobox/Search
        hosts.'
  behavior:
  - name: click-on-an-option-selects-it
    when:
      click: option
    then:
    - event: onChange
  - name: arrow-selects-as-it-moves-when-selection-follows-focus
    description: Single-select with selectionFollowsFocus - arrow keys select as they
      move (the common picker feel).
    given:
      selectionFollowsFocus: true
    when:
      key: ArrowDown
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: arrows-only-move-when-selection-does-not-follow-focus
    description: With selectionFollowsFocus false the arrows move the active option
      and select nothing; onActiveChange still reports the move.
    given:
      selectionFollowsFocus: false
    when:
      key: ArrowDown
    then:
    - event: onChange
      fired: false
    - event: onActiveChange
    platforms:
    - web
    - lit
  - name: space-selects-the-active-option
    given:
      selectionFollowsFocus: false
    when:
      key: Space
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: a-disabled-option-cannot-be-selected
    given:
      options:
      - value: apple
        label: Apple
        disabled: true
      - value: banana
        label: Banana
    when:
      click: option
    then:
    - event: onChange
      fired: false
  - name: multiple-marks-the-list-multiselectable
    description: With multiple the value is an array, each option shows a check, and
      selection toggles rather than moves.
    given:
      multiple: true
    then:
    - attribute: aria-multiselectable
      is: 'true'
    platforms:
    - web
  - name: a-selected-option-is-marked-selected
    given:
      defaultValue: apple
    then:
    - attribute: aria-selected
      is: 'true'
      'on': option
    platforms:
    - web
  - name: the-empty-message-shows-when-there-are-no-options
    given:
      options: []
    then:
    - copy: empty
  - name: a-custom-empty-message-replaces-the-default
    given:
      options: []
      emptyMessage: No fruit matches that.
    then:
    - text: No fruit matches that.
  - name: loading-replaces-the-empty-message
    description: While options are being fetched the list shows copy.loading in place
      of the empty message and is aria-busy.
    given:
      options: []
      loading: true
    then:
    - copy: loading
    - attribute: aria-busy
      is: 'true'
      platforms:
      - web
  - name: invalid-renders-the-invalid-copy
    given:
      invalid: true
    then:
    - copy: invalid
    - state: invalid
      is: true
      platforms:
      - web
      - lit
  examples:
  - name: single-picker
    description: The standalone visible picker, where arrows select as they move.
    given:
      label: Fruit
      options:
      - value: apple
        label: Apple
      - value: banana
        label: Banana
      - value: cherry
        label: Cherry
  - name: multi-select-with-checks
    description: Any number of selections, each selected row carrying a check.
    given:
      label: Roles
      multiple: true
      defaultValue:
      - frontend
      options:
      - value: frontend
        label: Frontend
      - value: backend
        label: Backend
      - value: design
        label: Design
  - name: grouped-options
    description: Options under group headings, for a list long enough to need sections.
    given:
      label: Role
      options:
      - group: Engineering
        options:
        - value: frontend
          label: Frontend
        - value: backend
          label: Backend
      - group: Design
        options:
        - value: product
          label: Product design
  - name: embedded-in-a-popup
    description: The same engine inside a Select or Combobox popup, which owns the
      surface, capped at five rows.
    given:
      label: Country
      embedded: true
      maxVisible: '5'
      options:
      - value: ca
        label: Canada
      - value: fr
        label: France
      - value: jp
        label: Japan
```

## Events

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: string | string[]`
  - fires on: user
- `onActiveChange`: emit `active-change`
  - payload, the keys of `CustomEvent.detail`: `value: string | null`

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)

## Style bindings

- `listPadding`: token `space.1`; part `list`
- `optionPaddingBlock`: token `space.sm`; part `option`
- `optionPaddingInline`: token `space.md`; part `option`
- `optionGap`: token `layout.gap.normal`; part `option`
- `optionRadius`: token `radius.sm`; part `option`
- `optionColor`: token `color.foreground`; part `option`; locked
- `optionDescriptionColor`: token `color.foreground.muted`; part `optionDescription`; locked
- `optionDescriptionSize`: token `font.size.sm`; part `optionDescription`
- `optionActiveBackground`: token `color.background.subtle`; part `option`; state `active`; locked
- `optionSelectedWeight`: token `font.weight.medium`; part `option`
- `optionSelectedCheck`: token `color.control.selectedBackground`; part `optionCheck`; locked
- `groupLabelColor`: token `color.foreground.muted`; part `groupLabel`; locked
- `groupLabelSize`: token `font.size.xs`; part `groupLabel`
- `groupLabelWeight`: token `font.weight.semibold`; part `groupLabel`
- `groupLabelPaddingBlock`: token `space.1`; part `groupLabel`

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: string[]
  name: name
  validation:
  - required
  - invalid
  messages:
    required: required
    invalid: invalid
  discovery: context
```

## Copy

- `empty`: "No options"
- `required`: "{label} is required."
- `invalid`: "{label} is not valid."
- `selectedCount`: "{count} selected"; params `count` (number)
- `loading`: "Loading…"

## Constants and examples

- example `single-picker`, story `SinglePicker`: given `label: "Fruit"`, `options: [{"value":"apple","label":"Apple"},{"value":"banana","label":"Banana"},{"value":"cherry","label":"Cherry"}]`; The standalone visible picker, where arrows select as they move.
- example `multi-select-with-checks`, story `MultiSelectWithChecks`: given `label: "Roles"`, `multiple: true`, `defaultValue: ["frontend"]`, `options: [{"value":"frontend","label":"Frontend"},{"value":"backend","label":"Backend"},{"value":"design","label":"Design"}]`; Any number of selections, each selected row carrying a check.
- example `grouped-options`, story `GroupedOptions`: given `label: "Role"`, `options: [{"group":"Engineering","options":[{"value":"frontend","label":"Frontend"},{"value":"backend","label":"Backend"}]},{"group":"Design","options":[{"value":"product","label":"Product design"}]}]`; Options under group headings, for a list long enough to need sections.
- example `embedded-in-a-popup`, story `EmbeddedInAPopup`: given `label: "Country"`, `embedded: true`, `maxVisible: "5"`, `options: [{"value":"ca","label":"Canada"},{"value":"fr","label":"France"},{"value":"jp","label":"Japan"}]`; The same engine inside a Select or Combobox popup, which owns the surface, capped at five rows.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `radius`, `listPadding`, `optionPaddingBlock`, `optionPaddingInline`, `optionGap`, `optionRadius`, `optionDescriptionSize`, `optionSelectedWeight`, `groupLabelSize`, `groupLabelWeight`, `groupLabelPaddingBlock`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `surface`, `optionColor`, `optionDescriptionColor`, `optionActiveBackground`, `optionSelectedCheck`, `groupLabelColor`, `emptyColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (16)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-on-an-option-selects-it
  when:
    click: option
  then:
  - event: onChange
- name: arrow-selects-as-it-moves-when-selection-follows-focus
  description: Single-select with selectionFollowsFocus - arrow keys select as they
    move (the common picker feel).
  given:
    selectionFollowsFocus: true
  when:
    key: ArrowDown
  then:
  - event: onChange
  platforms:
  - web
  - lit
- name: arrows-only-move-when-selection-does-not-follow-focus
  description: With selectionFollowsFocus false the arrows move the active option
    and select nothing; onActiveChange still reports the move.
  given:
    selectionFollowsFocus: false
  when:
    key: ArrowDown
  then:
  - event: onChange
    fired: false
  - event: onActiveChange
  platforms:
  - web
  - lit
- name: space-selects-the-active-option
  given:
    selectionFollowsFocus: false
  when:
    key: Space
  then:
  - event: onChange
  platforms:
  - web
  - lit
- name: a-disabled-option-cannot-be-selected
  given:
    options:
    - value: apple
      label: Apple
      disabled: true
    - value: banana
      label: Banana
  when:
    click: option
  then:
  - event: onChange
    fired: false
- name: the-empty-message-shows-when-there-are-no-options
  given:
    options: []
  then:
  - copy: empty
- name: a-custom-empty-message-replaces-the-default
  given:
    options: []
    emptyMessage: No fruit matches that.
  then:
  - text: No fruit matches that.
- name: loading-replaces-the-empty-message
  description: While options are being fetched the list shows copy.loading in place
    of the empty message and is aria-busy.
  given:
    options: []
    loading: true
  then:
  - copy: loading
- name: invalid-renders-the-invalid-copy
  given:
    invalid: true
  then:
  - copy: invalid
  - state: invalid
    is: true
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-max-visible-5
  given:
    maxVisible: '5'
  then:
  - renders: true
  derived: true
- name: renders-max-visible-8
  given:
    maxVisible: '8'
  then:
  - renders: true
  derived: true
- name: renders-max-visible-12
  given:
    maxVisible: '12'
  then:
  - renders: true
  derived: true
- name: renders-max-visible-all
  given:
    maxVisible: all
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: error-is-identified
  given:
    error: Fix this before continuing.
  then:
  - text: Fix this before continuing.
  - state: invalid
    is: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-listbox
reflect:
- multiple
- disabled
- required
- invalid
- embedded
- loading
- prop: selectionFollowsFocus
  attribute: no-selection-follows-focus
notes: '`options` and `value` are properties. Form-associated: setFormValue with a
  FormData carrying one entry per selected value when `multiple`, so a native <form>
  gets the same shape as a <select multiple>. Composed `change` (detail { value })
  and `active-change`. aria-activedescendant referencing shadow options works because
  list and options share the shadow root; Combobox composes ds-listbox inside its
  own shadow root for the same reason.'
```

## Guidance

## Overview

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
