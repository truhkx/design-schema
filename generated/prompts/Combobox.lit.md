# Generate: Combobox as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Combobox.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Combobox.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: ComboboxVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Combobox.test.ts`.

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
  name: Combobox
  category: input
  status: review
  apg: combobox
  anatomy:
  - label
  - description
  - field
  - chips
  - chip
  - chipRemove
  - input
  - clearButton
  - toggleButton
  - popup
  - listbox
  - status
  - errorMessage
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
      shape: ListboxOption[] (flat or grouped, as Listbox)
      description: The full option set, or the current page of results when `filter`
        is `async`. Passed through to the Listbox after filtering.
    value:
      type: union
      description: Controlled selected value(s). With `multiple`, an array. With `allowCustom`,
        a value not in `options` is a custom entry.
      shape: string | string[]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial value(s).
      shape: string | string[]
    open:
      type: boolean
      description: Controlled popup state, for programmatic use and for stories and
        tests. Omit for the typing-driven default.
      controls:
        event: onOpenChange
        state: open
    inputValue:
      type: string
      description: Controlled text of the input (what the user has typed). Usually
        uncontrolled; controlled by consumers driving `async` filtering.
    multiple:
      type: boolean
      default: false
      description: 'Pick many: selected options appear as chips before the input,
        each removable; the list stays open while toggling; Backspace in an empty
        input removes the last chip. Uses the same Listbox engine as Select.'
    allowCustom:
      type: boolean
      default: false
      description: Typed text that matches no option can be committed as a value (tags,
        emails). Enter or a separator (comma) commits it; the list shows `copy.addCustom`
        as the first row.
    filter:
      type: enum
      values:
      - startsWith
      - contains
      - none
      - async
      default: contains
      description: 'How typing narrows `options`: by prefix, by substring (default),
        not at all (the list is a picker; typing is type-ahead — it opens the list
        and moves the active option to the first label starting with the typed characters,
        without filtering), or by the consumer (`async`: the component shows `copy.loading`
        and the consumer updates `options` from `onInputChange`).'
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
      description: 'For `async`: show the loading row and announce it. The consumer
        sets it around its request.'
    clearable:
      type: boolean
      default: true
      description: Show a clear button when there is a value or text.
  events:
    onChange:
      description: Fired when the selected value(s) change (array with `multiple`;
        custom entries included when `allowCustom`).
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
    onInputChange:
      description: Fired on every keystroke with the input text. The hook for `async`
        filtering.
      platforms:
        web: onInputChange
        lit: input-change
        rn: onInputChange
        swiftui: onInputChange
      payload:
      - name: value
        type: string
        description: The text now in the input.
      fires:
      - user
    onOpenChange:
      description: Fired when the list opens or closes.
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the list.
      fires:
      - user
  keyboard:
  - keys:
    - ArrowDown
    action: Opens the list (if closed) and moves the active option down; focus stays
      in the input.
    from: first
    expect: manual
  - keys:
    - ArrowUp
    action: Opens the list and moves the active option up.
    from: first
    expect: manual
  - keys:
    - Enter
    action: 'Commits the active option (single: closes; multiple: toggles and stays
      open); with allowCustom and no active option, commits the typed text.'
    when: list open
    from: first
    expect: manual
  - keys:
    - Escape
    action: Closes the list if open; if closed and clearable, clears the input text.
    when: list open
    from: first
    expect: closes
    target: popup
  - keys:
    - Tab
    action: Closes the list and moves focus on. Under single-select a highlighted
      option is NOT committed by Tab (typing intent is ambiguous).
    when: list open
    from: first
    expect: closes
    target: popup
  - keys:
    - Backspace
    action: In an empty input with chips, removes the last chip.
    when: multiple
    from: first
    expect: manual
  - keys:
    - Home
    - End
    action: Move the text caret (input semantics), never the list.
    from: first
    expect: manual
    native: true
  - keys:
    - ','
    action: With allowCustom, commits the typed text as a custom value (as Enter does)
      and clears the input.
    when: allowCustom
    from: first
    expect: manual
  - keys:
    - Alt+ArrowDown
    action: Opens the list without moving the active option.
    from: first
    expect: manual
  styles:
    fieldBackground:
      token: color.background
      part: field
      locked: true
    fieldBorder:
      token: color.border.strong
      part: field
      locked: true
    fieldBorderFocus:
      token: color.border.focus
      part: field
      locked: true
    fieldBorderInvalid:
      token: color.border.danger
      part: field
      locked: false
    fieldBorderWidth:
      token: border.width.thin
      part: field
      locked: false
    fieldRadius:
      token: radius.md
      part: field
      locked: false
    fieldPaddingInline:
      token: space.md
      part: field
      locked: false
    fieldPaddingBlock:
      token: space.sm
      part: field
      locked: false
    fieldGap:
      token: layout.gap.tight
      part: field
      description: Between chips, input text and the buttons.
      locked: false
    inputColor:
      token: color.foreground
      part: input
      locked: true
    placeholderColor:
      token: color.foreground.muted
      locked: true
    chipBackground:
      token: color.background.strong
      part: chip
      locked: true
    chipColor:
      token: color.foreground
      part: chip
      locked: true
    chipRadius:
      token: radius.full
      part: chip
      locked: false
    chipPaddingInline:
      token: space.2
      part: chip
      locked: false
    chipPaddingBlock:
      token: space.0
      part: chip
      locked: false
    chipGap:
      token: layout.gap.tight
      part: chip
      description: Between chip label and its remove button.
      locked: false
    iconColor:
      token: color.foreground.muted
      description: Toggle chevron and clear icon.
      locked: true
    partGap:
      token: space.1
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      locked: false
    helperSize:
      token: font.size.sm
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      locked: true
    errorText:
      token: color.foreground.danger
      locked: true
    popupSurface:
      token: color.overlay.surface
      part: popup
      locked: false
    popupBorder:
      token: color.border
      part: popup
      locked: false
    popupShadow:
      token: shadow.overlay
      part: popup
      locked: false
    popupRadius:
      token: radius.md
      part: popup
      locked: false
    popupOffset:
      token: space.1
      part: popup
      locked: false
    layer:
      token: layer.dropdown
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    chipSize:
      token: font.size.sm
      part: chip
      locked: false
    lineHeight:
      token: font.lineHeight.normal
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
    enter:
      token: motion.duration.fast
      locked: false
  constants:
    statusDebounce:
      description: How long result-count, loading and empty announcements wait before
        the status live region updates.
      token: motion.duration.base
      multiply: 2
      unit: ms
  copy:
    empty: No matches
    loading: Loading…
    addCustom: Add "{value}"
    clearLabel: Clear
    toggleLabel: Show options
    removeChip: Remove {label}
    resultCount:
      plural:
        by: count
        one: '{count} result available'
        other: '{count} results available'
      params:
        count:
          type: number
          description: The number of results in the list.
    activeOption:
      text: '{option}'
      params:
        option:
          type: string
          description: The active option's label.
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: combobox
    requires:
    - label-association
    - accessible-name
    - expanded-state
    - selected-state
    - arrow-navigation
    - escape-dismiss
    - live-region
    - error-identification
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-44px
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground
      background: color.background.strong
      level: AA
    - foreground: color.foreground.danger
      background: color.background
      level: AA
    - foreground: color.border.strong
      background: color.background
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
      element: input
      attributes:
      - role=combobox
      - aria-autocomplete=list
      - aria-expanded
      - aria-controls
      - aria-activedescendant
      - aria-haspopup=listbox
      - aria-describedby
      - aria-invalid
      - aria-required
      - autocomplete=off
      notes: 'The APG editable combobox with list autocomplete: <input role="combobox"
        aria-autocomplete="list" aria-expanded aria-controls aria-activedescendant>;
        the popup is a portal with the Listbox; keydown on the input is forwarded
        to the Listbox handler so DOM focus never leaves the input. A visually hidden
        <div role="status" aria-live="polite"> announces copy.resultCount, loading
        and empty states after a short debounce. Chips are <span> with a ds Button
        (ghost, sm, iconOnly, close icon) labelled copy.removeChip; chips are not
        focus stops themselves. Hidden <input name> per value for native forms.'
    lit:
      tag: ds-combobox
      reflect:
      - multiple
      - allow-custom
      - filter
      - required
      - disabled
      - invalid
      - loading
      notes: Form-associated (FormData for multiple). <ds-listbox> lives in the same
        shadow root so aria-activedescendant resolves. Composed `change`, `input-change`,
        `open-change`. Popup via the Popover API when available.
    rn:
      element: TextInput
      props:
      - accessibilityRole=combobox
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - accessibilityValue
      notes: On phones the popup is a BottomSheet with the TextInput at its top (keyboard-avoiding)
        and the Listbox below — typing on a phone with a floating list under the keyboard
        is unusable. Tablets and react-native-web use the anchored popup. Chips render
        before the input inside the field; each chip has a remove Button. Result counts
        are announced with announceForAccessibility. Form registration as Input.
    swiftui:
      element: TextField
      props:
      - TextField
      - Listbox
      - .popover
      - .accessibilityValue
      - .onKeyPress
      - .onMoveCommand
      - '@FocusState'
      - .autocorrectionDisabled
      - AccessibilityNotification
      notes: An Input-shaped `TextField` (`.autocorrectionDisabled`, `.textInputAutocapitalization(.never)`)
        with the `Listbox embedded` rendered inline below the field on phones (the
        keyboard is up; a popover would fight it) and as a `.popover` on regular width.
        The active option is tracked by index (not focus — focus stays in the field)
        and announced through `AccessibilityNotification.Announcement` with `copy.activeOption`;
        the count is announced when the list opens. Arrows/Home/End/Enter/Escape per
        the keyboard table via `.onKeyPress` on the field. `allowCustom`, `multiple`
        (chips as `Button`s with `close` Icons) as documented.
  behavior:
  - name: typing-reports-the-input-text
    description: onInputChange fires on every keystroke - the hook async filtering
      hangs off.
    given:
      open: false
    when:
      type: ap
    then:
    - event: onInputChange
  - name: the-toggle-button-opens-the-list
    given:
      open: false
    when:
      click: toggleButton
    then:
    - event: onOpenChange
  - name: a-closed-combobox-is-not-expanded
    given:
      open: false
    then:
    - state: expanded
      is: false
  - name: an-open-list-reports-the-expanded-state
    given:
      open: true
    then:
    - state: expanded
      is: true
  - name: enter-commits-the-active-option
    description: 'Enter commits the active option (single: closes; multiple: toggles
      and stays open).'
    given:
      open: true
    when:
      key: Enter
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: escape-closes-the-list
    description: Escape closes the list if open; closed and clearable, it clears the
      input text instead.
    given:
      open: true
    when:
      key: Escape
    then:
    - event: onOpenChange
    platforms:
    - web
    - lit
  - name: the-clear-button-clears-the-value
    given:
      open: false
      defaultValue: apple
      clearable: true
    when:
      click: clearButton
    then:
    - event: onChange
  - name: multiple-shows-the-selection-as-chips
    description: 'Pick many: selected options appear as chips before the input, each
      removable.'
    given:
      open: false
      multiple: true
      defaultValue:
      - apple
    then:
    - text: Apple
  - name: removing-a-chip-reports-the-new-value
    given:
      open: false
      multiple: true
      defaultValue:
      - apple
    when:
      click: chipRemove
    then:
    - event: onChange
  - name: a-disabled-combobox-does-not-open
    given:
      open: false
      disabled: true
    when:
      click: toggleButton
    then:
    - event: onOpenChange
      fired: false
    - state: disabled
      is: true
      platforms:
      - web
      - lit
  examples:
  - name: fruit-picker
    description: The everyday single-select combobox, filtering by substring as you
      type.
    given:
      label: Fruit
      name: fruit
      options:
      - value: apple
        label: Apple
      - value: apricot
        label: Apricot
      - value: banana
        label: Banana
  - name: multi-select-with-chips
    description: Picking several, each shown as a removable chip before the input.
    given:
      label: Roles
      name: roles
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
  - name: free-text-tags
    description: Tags, where text matching no option can be committed with Enter or
      a comma.
    given:
      label: Tags
      name: tags
      multiple: true
      allowCustom: true
      options:
      - value: urgent
        label: Urgent
      - value: billing
        label: Billing
  - name: async-results
    description: A field whose results come from the server, showing the loading row
      while they are fetched.
    given:
      label: Customer
      name: customer
      filter: async
      loading: true
      options:
      - value: acme
        label: Acme Ltd
```

## Events

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: string | string[]`
  - fires on: user
- `onInputChange`: emit `input-change`
  - payload, the keys of `CustomEvent.detail`: `value: string`
  - fires on: user
- `onOpenChange`: emit `open-change`
  - payload, the keys of `CustomEvent.detail`: `open: boolean`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)
- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `open-change`); drives state `open`

## Style bindings

- `fieldBackground`: token `color.background`; part `field`; locked
- `fieldBorder`: token `color.border.strong`; part `field`; locked
- `fieldBorderFocus`: token `color.border.focus`; part `field`; locked
- `fieldBorderInvalid`: token `color.border.danger`; part `field`
- `fieldBorderWidth`: token `border.width.thin`; part `field`
- `fieldRadius`: token `radius.md`; part `field`
- `fieldPaddingInline`: token `space.md`; part `field`
- `fieldPaddingBlock`: token `space.sm`; part `field`
- `fieldGap`: token `layout.gap.tight`; part `field`
- `inputColor`: token `color.foreground`; part `input`; locked
- `chipBackground`: token `color.background.strong`; part `chip`; locked
- `chipColor`: token `color.foreground`; part `chip`; locked
- `chipRadius`: token `radius.full`; part `chip`
- `chipPaddingInline`: token `space.2`; part `chip`
- `chipPaddingBlock`: token `space.0`; part `chip`
- `chipGap`: token `layout.gap.tight`; part `chip`
- `labelWeight`: token `font.weight.medium`; part `label`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `popupSurface`: token `color.overlay.surface`; part `popup`
- `popupBorder`: token `color.border`; part `popup`
- `popupShadow`: token `shadow.overlay`; part `popup`
- `popupRadius`: token `radius.md`; part `popup`
- `popupOffset`: token `space.1`; part `popup`
- `chipSize`: token `font.size.sm`; part `chip`

## Keyboard

- `Escape` (Closes the list if open; if closed and clearable, clears the input text.): expect closes; target part `popup`
- `Tab` (Closes the list and moves focus on. Under single-select a highlighted option is NOT committed by Tab (typing intent is ambiguous).): expect closes; target part `popup`
- `Home`, `End` (Move the text caret (input semantics), never the list.): expect manual; native: the rendered element already does this

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

- `empty`: "No matches"
- `loading`: "Loading…"
- `addCustom`: "Add \"{value}\""
- `clearLabel`: "Clear"
- `toggleLabel`: "Show options"
- `removeChip`: "Remove {label}"
- `resultCount`: "{count} results available"; params `count` (number); plural by `count`: one "{count} result available", other "{count} results available"
- `activeOption`: "{option}"; params `option` (string)
- `required`: "{label} is required."
- `invalid`: "{label} is not valid."
- `requiredIndicator`: " (required)"

## Constants and examples

- constant `statusDebounce`: `calc(var(--motion-duration-base) * 2)` (`motion.duration.base` × 2) ms
- example `fruit-picker`, story `FruitPicker`: given `label: "Fruit"`, `name: "fruit"`, `options: [{"value":"apple","label":"Apple"},{"value":"apricot","label":"Apricot"},{"value":"banana","label":"Banana"}]`; The everyday single-select combobox, filtering by substring as you type.
- example `multi-select-with-chips`, story `MultiSelectWithChips`: given `label: "Roles"`, `name: "roles"`, `multiple: true`, `defaultValue: ["frontend"]`, `options: [{"value":"frontend","label":"Frontend"},{"value":"backend","label":"Backend"},{"value":"design","label":"Design"}]`; Picking several, each shown as a removable chip before the input.
- example `free-text-tags`, story `FreeTextTags`: given `label: "Tags"`, `name: "tags"`, `multiple: true`, `allowCustom: true`, `options: [{"value":"urgent","label":"Urgent"},{"value":"billing","label":"Billing"}]`; Tags, where text matching no option can be committed with Enter or a comma.
- example `async-results`, story `AsyncResults`: given `label: "Customer"`, `name: "customer"`, `filter: "async"`, `loading: true`, `options: [{"value":"acme","label":"Acme Ltd"}]`; A field whose results come from the server, showing the loading row while they are fetched.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `fieldBorderInvalid`, `fieldBorderWidth`, `fieldRadius`, `fieldPaddingInline`, `fieldPaddingBlock`, `fieldGap`, `chipRadius`, `chipPaddingInline`, `chipPaddingBlock`, `chipGap`, `partGap`, `labelWeight`, `helperSize`, `popupSurface`, `popupBorder`, `popupShadow`, `popupRadius`, `popupOffset`, `layer`, `fontFamily`, `fontSize`, `chipSize`, `lineHeight`, `disabledOpacity`, `enter`
Locked (accessibility-bearing, never overridable): `fieldBackground`, `fieldBorder`, `fieldBorderFocus`, `inputColor`, `placeholderColor`, `chipBackground`, `chipColor`, `iconColor`, `descriptionText`, `errorText`, `minTarget`, `focusRingWidth`

## Behavior scenarios (18)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: typing-reports-the-input-text
  description: onInputChange fires on every keystroke - the hook async filtering hangs
    off.
  given:
    open: false
  when:
    type: ap
  then:
  - event: onInputChange
- name: the-toggle-button-opens-the-list
  given:
    open: false
  when:
    click: toggleButton
  then:
  - event: onOpenChange
- name: a-closed-combobox-is-not-expanded
  given:
    open: false
  then:
  - state: expanded
    is: false
- name: an-open-list-reports-the-expanded-state
  given:
    open: true
  then:
  - state: expanded
    is: true
- name: enter-commits-the-active-option
  description: 'Enter commits the active option (single: closes; multiple: toggles
    and stays open).'
  given:
    open: true
  when:
    key: Enter
  then:
  - event: onChange
  platforms:
  - web
  - lit
- name: escape-closes-the-list
  description: Escape closes the list if open; closed and clearable, it clears the
    input text instead.
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onOpenChange
  platforms:
  - web
  - lit
- name: the-clear-button-clears-the-value
  given:
    open: false
    defaultValue: apple
    clearable: true
  when:
    click: clearButton
  then:
  - event: onChange
- name: multiple-shows-the-selection-as-chips
  description: 'Pick many: selected options appear as chips before the input, each
    removable.'
  given:
    open: false
    multiple: true
    defaultValue:
    - apple
  then:
  - text: Apple
- name: removing-a-chip-reports-the-new-value
  given:
    open: false
    multiple: true
    defaultValue:
    - apple
  when:
    click: chipRemove
  then:
  - event: onChange
- name: a-disabled-combobox-does-not-open
  given:
    open: false
    disabled: true
  when:
    click: toggleButton
  then:
  - event: onOpenChange
    fired: false
  - state: disabled
    is: true
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-filter-starts-with
  given:
    filter: startsWith
  then:
  - renders: true
  derived: true
- name: renders-filter-contains
  given:
    filter: contains
  then:
  - renders: true
  derived: true
- name: renders-filter-none
  given:
    filter: none
  then:
  - renders: true
  derived: true
- name: renders-filter-async
  given:
    filter: async
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
tag: ds-combobox
reflect:
- multiple
- allow-custom
- filter
- required
- disabled
- invalid
- loading
notes: Form-associated (FormData for multiple). <ds-listbox> lives in the same shadow
  root so aria-activedescendant resolves. Composed `change`, `input-change`, `open-change`.
  Popup via the Popover API when available.
```

## Guidance

## Overview

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
