# Generate: Combobox for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Combobox.tsx` exporting a typed React Native function component named `Combobox`.

**When the files already exist.** Read the existing component, stories, tests and index export first. The doc is authoritative: change what contradicts it, add what it requires, and keep what it does not mention unless a convention forbids it. Do not restyle or rename for taste. In your reply, before the report block, say what you changed and why.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `ComboboxProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger (if any) and enough content to exercise every keyboard rule — at least as many distinct stops or items as the largest index any rule moves to (three for a list or group), counting items reachable by the component's own navigation (roving focus or an active item) whether or not they are tab stops; an overlay with a fixed set of controls renders that set. It is for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Combobox> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Combobox.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), unless the prop has no `default` and the doc marks it controlled (overlays' `open`): then it is controlled only, and the event requests the change. The event fires in every mode; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other. Wiring is not a prop choice and is always allowed: ids and accessibility references (`nativeID`, `accessibilityLabelledBy`), refs, focus props for roving focus, event handlers, and copy strings the parent owns.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
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
      a11yRole: accessible-name
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
      shape: ListboxItem[] (options and one level of groups, as Listbox)
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
        tests. Omit for the typing-driven default. Opening the list this way claims
        DOM focus for the input when focus is not already inside the field — `aria-activedescendant`
        announces nothing otherwise — but never takes it from a focused clear or chip-remove
        Button; there is no way to open the list without moving focus.
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
      description: 'Typed text that matches no option can be committed as a value
        (tags, emails). Enter or a comma commits it; the list shows `copy.addCustom`
        as a synthetic first row, suppressed when the trimmed text already matches
        an existing option by either its `value` or its `label`. Committing text that
        matches an option that way (Enter or a comma, same case- and diacritic-insensitive
        match) commits that option''s `value`, never a custom string. If the matching
        option is disabled, the row stays suppressed and the commit does nothing (neither
        the disabled value nor a custom string). With `multiple`, text matching an
        already-selected option leaves it selected (no `onChange`, unlike Enter on
        its row, which toggles) and clears the text — that clear does fire `onInputChange`,
        like any other commit. The synthetic row is independent of `filter`: it shows
        with `filter: none` too, since only a match against an existing option suppresses
        it. A comma typed when there is nothing to commit (empty text, or only a disabled
        match) is dropped and the text before it kept.'
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
      description: 'Error message; implies invalid. An empty string is not a message
        (as Input): nothing renders, though a Form entry still marks the field.'
    loading:
      type: boolean
      default: false
      description: 'For `async`: show the loading row and announce it. The consumer
        sets it around its request.'
    clearable:
      type: boolean
      default: true
      description: 'Show a clear button when there is a value or text. It also gates
        Escape-clears-text, per the keyboard table: a combobox without a clear button
        offers no way to empty the text either. Lit attribute: `no-clear`.'
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
      description: Fired on every text change the user causes — each keystroke, and
        the text a commit, Escape-to-clear or the clear button leaves behind (so `async`
        consumers can reset) — with the input text. Not fired when a controlled `value`
        change rewrites the label, nor when a commit, Escape or the clear button leaves
        the text unchanged; "unchanged" is measured against the text the input is
        showing now, which for a controlled `inputValue` is the consumer's prop, so
        a consumer that does not apply the reported text keeps receiving the same
        event. The hook for `async` filtering.
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
      description: Fired when the list opens or closes — including the closes the
        component causes itself (a blur, a single-select commit, Escape, Tab), so
        a controlled `open` can always be tracked.
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
    action: 'Opens the list (if closed) with the selected option active, else the
      first; when already open, moves the active option down (from none: the first
      match); focus stays in the input.'
    from: first
    expect: manual
  - keys:
    - ArrowUp
    action: Opens the list with the selected option active, else the last; when already
      open, moves the active option up.
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
    action: Closes the list if open; if closed and clearable, clears the input text
      only (the value is kept; the clear button is what empties the value).
    when: list open
    from: first
    expect: closes
    target: popup
  - keys:
    - Tab
    action: Closes the list and moves focus on. A highlighted option is NOT committed
      by Tab, in single or multiple mode (typing intent is ambiguous).
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
    action: 'With allowCustom, commits the typed text exactly as Enter does: multiple
      clears the input and stays open; single shows the committed text and closes.'
    when: allowCustom
    from: first
    expect: manual
  - keys:
    - Alt+ArrowDown
    action: Opens the list with the selected option active, or no active option when
      nothing is selected; changes nothing while the list is already open, though
      the default action is still suppressed — ArrowDown and ArrowUp never move the
      text caret, open or closed.
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
      description: 'While the input itself has focus (web and Lit: `:has(input:focus-visible)`,
        not `:focus-within`, so a focused clear or chip-remove Button shows only its
        own ring).'
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
      part: input
      description: The input placeholder (`::placeholder`; `placeholderTextColor`
        on native).
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
      description: Toggle chevron, clear and chip-remove icons; forwarded to each
        composed Icon's own `color` override as this token, on every platform — React
        Native included, where it goes to the Icon's `overrides.color` rather than
        its `color` prop, so the combobox never resolves a token on the Icon's behalf.
        Locked, it keeps its `--ds-combobox-icon-color` hook on web and Lit, as every
        locked binding does; the hook reaches each Icon by setting that Icon's own
        documented `--ds-icon-color` hook on its host, never its internals.
      locked: true
    partGap:
      token: space.1
      description: Between label, description, field and error message.
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      description: Forwarded to the label Text's own `fontWeight` override.
      locked: false
    helperSize:
      token: font.size.sm
      description: Forwarded to the description and error Text's own `fontSize` override.
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Also the colour of the `status` part where it is visible (React
        Native), which takes the description treatment — this token and `helperSize`
        — and has no binding of its own, so an override reaches it only through these
        two.
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
    popupBorderWidth:
      token: border.width.thin
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
      description: The gap between field and popup. Applied as the fixed-position
        popup's block margin (it has no parent gap to use), as Select; only the side
        facing the field shows.
      locked: false
    layer:
      token: layer.dropdown
      locked: false
    fontFamily:
      token: font.family.body
      description: Label and input text.
      locked: false
    fontSize:
      token: font.size.md
      description: Label and input text.
      locked: false
    chipSize:
      token: font.size.sm
      part: chip
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      description: Label and input text.
      locked: false
    minTarget:
      token: size.target.comfortable
      part: field
      description: The field as a whole.
      locked: true
    inputMinTarget:
      token: size.target.min
      part: input
      description: 'The text input inside the field, which needs its own floor: with
        `multiple` the field grows to several chip rows and the input is only one
        of them.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: field
      description: Replaces fieldBorderWidth while the input is focused (the field
        border is its focus ring, as Input); fieldPaddingInline and fieldPaddingBlock
        shrink by the difference so the content does not shift.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    enter:
      token: motion.duration.fast
      description: Popup opacity fade-in and the field border-color transition; instant
        under reduced motion.
      locked: false
  constants:
    statusDebounce:
      description: 'How long result-count, loading and empty announcements wait before
        the status live region updates. Not motion: it does not follow reduced motion,
        so it is computed from the theme''s standard `motion.duration.base` value,
        never from a reduced-motion override that zeroes the token. On web and Lit
        it is read from the computed `--motion-duration-base`, which is the standard
        value because the token stylesheets never zero it under reduced motion (components
        apply reduced motion in their own rules); when it cannot be read (jsdom) there
        is no debounce — the update is still asynchronous (a zero-delay timer), never
        a synchronous write, so a test cannot observe it mid-render. React Native
        reads the theme value. A close clears any pending announcement and blanks
        the region at once, so a list that closes before the timer fires announces
        nothing.'
      token: motion.duration.base
      multiply: 2
      unit: ms
  copy:
    empty: No matches
    loading: Loading…
    addCustom: Add "{value}"
    clearLabel: Clear
    toggleLabel: Show options
    done: Done
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
        the popup is a portal with the Listbox; DOM focus never leaves the input.
        The combobox drives the active option through the Listbox''s controlled `activeValue`
        (passing back what `onActiveChange` reports) and, since the React Listbox
        exports no key handler hook, re-dispatches ArrowUp/ArrowDown as native keydown
        on the Listbox root; only the keys in the keyboard table are forwarded (no
        PageUp/PageDown, no letter type-ahead — typing goes to the input). The ref
        is `Ref<HTMLInputElement>` on the input (the element above); `data-ds` sits
        on the wrapper div. The toggle Button is `tabIndex={-1}` (the input is the
        tab stop, per APG); the clear and chip-remove Buttons stay tabbable. Button
        sets its own `data-part="container"`, so the `chipRemove`, `clearButton` and
        `toggleButton` parts are wrapper <span>s around their Buttons, and a scenario
        `click` on those parts presses the Button inside. `copy.done` and `copy.activeOption`
        are not rendered on web (activedescendant does the announcing). A visually
        hidden <div role="status" aria-live="polite"> announces copy.resultCount,
        loading and empty states after a short debounce. Chips are <span> with a ds
        Button (ghost, sm, iconOnly, close icon) labelled copy.removeChip; chips are
        not focus stops themselves. The scenario `click` lands on the wrapper <span>,
        which carries the handler, so clicking the wrapper and clicking the Button
        inside each fire exactly once (a disabled ds Button still stops its own click,
        so `disabled` blocks either path). `aria-controls` is rendered whether or
        not the list is open, per APG, so it points at an id that is absent while
        closed — deliberately unlike Select, which renders it only while open. Hidden
        <input name> per value for native forms.'
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
      - prop: clearable
        attribute: no-clear
      notes: 'Form-associated (FormData for multiple). <ds-listbox> lives in the combobox''s
        shadow root, but its options render inside ds-listbox''s own shadow root,
        which an aria-activedescendant IDREF cannot reach; as ds-select does, the
        input carries no aria-activedescendant and the active option''s label (`copy.activeOption`)
        is written to a polite live span linked by aria-describedby. Keys are forwarded
        through ds-listbox''s `handleKey`, only those in the keyboard table. The `open`
        attribute mirrors the effective state (controlled or not), so an uncontrolled
        open list still shows it; it is mirrored by hand rather than listed in `reflect`,
        because Lit''s `reflect: true` cannot tell its own write of the attribute
        from a consumer''s, and a consumer''s write is what makes the element controlled.
        `copy.activeOption` is linked by aria-describedby only while the list is open
        with an active option, so the description never carries a stale label (at
        the cost of the describedby list changing as the user arrows). The `chipRemove`,
        `clearButton` and `toggleButton` parts put `data-part`/`part` on the <ds-button>
        itself, as ds-search does: the wrapper element is a web-only workaround for
        React''s Button writing `data-part="container"` on the same node, and ds-button''s
        own data-part lives in its shadow root, where nothing collides. `aria-controls`
        points at the popup <div> that holds the Listbox, since the role="listbox"
        element itself is inside <ds-listbox>''s shadow root and no IDREF reaches
        it. The `status` part takes the web treatment here — a visually hidden region
        with aria-live="polite", not the visible Text of React Native. The `resultCount`
        locale search starts at the host, so only light-DOM ancestors of <ds-combobox>
        can supply `lang`; there is no document.documentElement fallback beyond the
        runtime default. The toggle stays tabbable on Lit: ds-button exposes no way
        to leave the tab order, so web''s `tabIndex={-1}` has no Lit form yet. `copy.done`
        is not rendered on Lit. The composed ds-listbox is named with `label` (the
        combobox label), not `labelled-by`, since a label id cannot cross its shadow
        root. Setting `open` as a property or as an attribute makes the element controlled;
        the element''s own mirror writes of the attribute do not. Composed `change`,
        `input-change`, `open-change`. Popup via the Popover API when available.'
    rn:
      element: TextInput
      props:
      - accessibilityRole=combobox
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - accessibilityValue
      notes: 'On phones (window width <= `layout.maxWidth.prose`, the BottomSheet
        breakpoint) the popup is a BottomSheet with the TextInput at the top of its
        body (keyboard-avoiding) and the Listbox below — typing on a phone with a
        floating list under the keyboard is unusable. Tablets and react-native-web
        use the anchored popup: an absolutely positioned sibling of the field with
        no scrim, never a `Modal` — react-native-web''s Modal always traps focus in
        its children, which would pull focus out of the text input and break the APG
        model this component requires; an outside tap blurs the input, and blur closes
        the list. Chips render before the input inside the field; each chip has a
        remove Button. The `status` part is visible small muted Text: a polite live
        region on Android, announced with announceForAccessibility on iOS only (see
        React Native notes). Form registration as Input; the native form handle carries
        only `string | boolean`, so `form.valueType: string[]` is not reachable here:
        with `multiple` the submitted value is the values joined with `,` (a comma
        always commits, so no typed value contains one), and a single selection submits
        the bare value. Button has no testID, so `chipRemove` and `clearButton` are
        Views carrying the testID around their Buttons; on phones `toggleButton` is
        the chevron Icon inside the summary Pressable (the summary is the toggle),
        hidden from accessibility. Listbox rows are touch Pressables with no key events,
        so the list keyboard model — ArrowDown/ArrowUp, Home/End, Alt+ArrowDown, Tab-without-committing
        — has no native equivalent: a tap is the commit, Enter through the TextInput
        commits typed custom text (there is no active option, so without allowCustom
        Enter commits nothing), Escape arrives only from a hardware keyboard or react-native-web
        (it is handled on `onKeyPress`, and the generated keyboard spec cannot reach
        it on a device), and blurring the field closes the list. The TextInput itself
        still honours Backspace-in-an-empty-input (removes the last chip) and comma-commits
        with allowCustom. There is no active option on native, so `copy.activeOption`
        is not announced (the screen reader reads the focused row) and `filter: none`
        typing only opens the list — the first label matching the typed characters
        is passed as the Listbox''s `initialActiveValue`, which is as close as this
        platform comes to moving the active option. Tapping is the accessible path,
        and every row is its own focus stop. In the phone sheet blur does not close
        the list (tapping a row dismisses the keyboard); `copy.done` or dismissing
        the sheet does. Re-pressing the already-selected row in single mode does nothing
        on native, because Listbox reports no press for an unchanged value; the user
        closes with `copy.done` (phones) or an outside tap (tablets). The `status`
        part: announceForAccessibility on iOS only, a polite live region on Android
        and react-native-web alike. On tablets and react-native-web it sits between
        the field and the error message; on phones it sits in the sheet body between
        the input row and the Listbox.'
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

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: string | string[]`
  - fires on: user
- `onInputChange`: emit `onInputChange`
  - payload, positional, in this order: `value: string`
  - fires on: user
- `onOpenChange`: emit `onOpenChange`
  - payload, positional, in this order: `open: boolean`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)
- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `onOpenChange`); drives state `open`

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
- `placeholderColor`: token `color.foreground.muted`; part `input`; locked
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
- `popupBorderWidth`: token `border.width.thin`; part `popup`
- `popupShadow`: token `shadow.overlay`; part `popup`
- `popupRadius`: token `radius.md`; part `popup`
- `popupOffset`: token `space.1`; part `popup`
- `chipSize`: token `font.size.sm`; part `chip`
- `minTarget`: token `size.target.comfortable`; part `field`; locked
- `inputMinTarget`: token `size.target.min`; part `input`; locked
- `focusRingWidth`: token `border.width.focus`; part `field`; locked

## Keyboard

- `ArrowDown` (Opens the list (if closed) with the selected option active, else the first; when already open, moves the active option down (from none: the first match); focus stays in the input.): expect manual
- `ArrowUp` (Opens the list with the selected option active, else the last; when already open, moves the active option up.): expect manual
- `Enter` (Commits the active option (single: closes; multiple: toggles and stays open); with allowCustom and no active option, commits the typed text.): expect manual
- `Escape` (Closes the list if open; if closed and clearable, clears the input text only (the value is kept; the clear button is what empties the value).): expect closes; target part `popup`
- `Tab` (Closes the list and moves focus on. A highlighted option is NOT committed by Tab, in single or multiple mode (typing intent is ambiguous).): expect closes; target part `popup`
- `Backspace` (In an empty input with chips, removes the last chip.): expect manual
- `Home`, `End` (Move the text caret (input semantics), never the list.): expect manual; native: the rendered element already does this
- `,` (With allowCustom, commits the typed text exactly as Enter does: multiple clears the input and stays open; single shows the committed text and closes.): expect manual
- `Alt+ArrowDown` (Opens the list with the selected option active, or no active option when nothing is selected; changes nothing while the list is already open, though the default action is still suppressed — ArrowDown and ArrowUp never move the text caret, open or closed.): expect manual

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
- `done`: "Done"
- `removeChip`: "Remove {label}"
- `resultCount`: "{count} results available"; params `count` (number); plural by `count`: one "{count} result available", other "{count} results available"
- `activeOption`: "{option}"; params `option` (string)
- `required`: "{label} is required."
- `invalid`: "{label} is not valid."
- `requiredIndicator`: " (required)"

## Constants and examples

- constant `statusDebounce`: `t.motionDurationBase * 2` (`motion.duration.base` × 2) ms
- example `fruit-picker`, story `FruitPicker`: given `label: "Fruit"`, `name: "fruit"`, `options: [{"value":"apple","label":"Apple"},{"value":"apricot","label":"Apricot"},{"value":"banana","label":"Banana"}]`; The everyday single-select combobox, filtering by substring as you type.
- example `multi-select-with-chips`, story `MultiSelectWithChips`: given `label: "Roles"`, `name: "roles"`, `multiple: true`, `defaultValue: ["frontend"]`, `options: [{"value":"frontend","label":"Frontend"},{"value":"backend","label":"Backend"},{"value":"design","label":"Design"}]`; Picking several, each shown as a removable chip before the input.
- example `free-text-tags`, story `FreeTextTags`: given `label: "Tags"`, `name: "tags"`, `multiple: true`, `allowCustom: true`, `options: [{"value":"urgent","label":"Urgent"},{"value":"billing","label":"Billing"}]`; Tags, where text matching no option can be committed with Enter or a comma.
- example `async-results`, story `AsyncResults`: given `label: "Customer"`, `name: "customer"`, `filter: "async"`, `loading: true`, `options: [{"value":"acme","label":"Acme Ltd"}]`; A field whose results come from the server, showing the loading row while they are fetched.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `fieldBorderInvalid`, `fieldBorderWidth`, `fieldRadius`, `fieldPaddingInline`, `fieldPaddingBlock`, `fieldGap`, `chipRadius`, `chipPaddingInline`, `chipPaddingBlock`, `chipGap`, `partGap`, `labelWeight`, `helperSize`, `popupSurface`, `popupBorder`, `popupBorderWidth`, `popupShadow`, `popupRadius`, `popupOffset`, `layer`, `fontFamily`, `fontSize`, `chipSize`, `lineHeight`, `disabledOpacity`, `enter`
Locked (accessibility-bearing, never overridable): `fieldBackground`, `fieldBorder`, `fieldBorderFocus`, `inputColor`, `placeholderColor`, `chipBackground`, `chipColor`, `iconColor`, `descriptionText`, `errorText`, `minTarget`, `inputMinTarget`, `focusRingWidth`

## Behavior scenarios (15)

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
- name: error-is-identified
  given:
    error: Fix this before continuing.
  then:
  - text: Fix this before continuing.
  derived: true
```

## Platform notes (rn)

```yaml
element: TextInput
props:
- accessibilityRole=combobox
- accessibilityLabel
- accessibilityHint
- accessibilityState
- accessibilityValue
notes: "On phones (window width <= `layout.maxWidth.prose`, the BottomSheet breakpoint)\
  \ the popup is a BottomSheet with the TextInput at the top of its body (keyboard-avoiding)\
  \ and the Listbox below \u2014 typing on a phone with a floating list under the\
  \ keyboard is unusable. Tablets and react-native-web use the anchored popup: an\
  \ absolutely positioned sibling of the field with no scrim, never a `Modal` \u2014\
  \ react-native-web's Modal always traps focus in its children, which would pull\
  \ focus out of the text input and break the APG model this component requires; an\
  \ outside tap blurs the input, and blur closes the list. Chips render before the\
  \ input inside the field; each chip has a remove Button. The `status` part is visible\
  \ small muted Text: a polite live region on Android, announced with announceForAccessibility\
  \ on iOS only (see React Native notes). Form registration as Input; the native form\
  \ handle carries only `string | boolean`, so `form.valueType: string[]` is not reachable\
  \ here: with `multiple` the submitted value is the values joined with `,` (a comma\
  \ always commits, so no typed value contains one), and a single selection submits\
  \ the bare value. Button has no testID, so `chipRemove` and `clearButton` are Views\
  \ carrying the testID around their Buttons; on phones `toggleButton` is the chevron\
  \ Icon inside the summary Pressable (the summary is the toggle), hidden from accessibility.\
  \ Listbox rows are touch Pressables with no key events, so the list keyboard model\
  \ \u2014 ArrowDown/ArrowUp, Home/End, Alt+ArrowDown, Tab-without-committing \u2014\
  \ has no native equivalent: a tap is the commit, Enter through the TextInput commits\
  \ typed custom text (there is no active option, so without allowCustom Enter commits\
  \ nothing), Escape arrives only from a hardware keyboard or react-native-web (it\
  \ is handled on `onKeyPress`, and the generated keyboard spec cannot reach it on\
  \ a device), and blurring the field closes the list. The TextInput itself still\
  \ honours Backspace-in-an-empty-input (removes the last chip) and comma-commits\
  \ with allowCustom. There is no active option on native, so `copy.activeOption`\
  \ is not announced (the screen reader reads the focused row) and `filter: none`\
  \ typing only opens the list \u2014 the first label matching the typed characters\
  \ is passed as the Listbox's `initialActiveValue`, which is as close as this platform\
  \ comes to moving the active option. Tapping is the accessible path, and every row\
  \ is its own focus stop. In the phone sheet blur does not close the list (tapping\
  \ a row dismisses the keyboard); `copy.done` or dismissing the sheet does. Re-pressing\
  \ the already-selected row in single mode does nothing on native, because Listbox\
  \ reports no press for an unchanged value; the user closes with `copy.done` (phones)\
  \ or an outside tap (tablets). The `status` part: announceForAccessibility on iOS\
  \ only, a polite live region on Android and react-native-web alike. On tablets and\
  \ react-native-web it sits between the field and the error message; on phones it\
  \ sits in the sheet body between the input row and the Listbox."
```

## Guidance

## Overview

A combobox is an input that helps you finish. You type, it narrows the list, you pick — or, when the thing you want does not exist yet, you keep what you typed. It is the right field whenever a Select's list would be too long to scan, and it is the multi-select of choice when picks should be visible as chips.

## When to use

Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be typed faster than found (dates, codes), for `async` search against a server, and for multi-value fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when new values are legitimate (tags, invitees by email) and never when the value must exist (a customer id). Use `filter: none` when the list is short but chips are wanted.

## When not to use

Do not use a Combobox for fewer than about ten options that never grow — use Select. Do not use it as a search box that navigates to results (that is a search form with a Listbox of suggestions, planned as Search). Do not use it to pick a date (DatePicker, planned). Do not disable typing to get a Select; use Select.

## Behavior

Typing filters `options` per `filter` and opens the list with no active option (so Enter commits typed text only when `allowCustom`); ArrowDown activates the first match without moving DOM focus from the input; Enter commits the active option, fires `onChange`, and — single — closes and shows the label in the input, or — multiple — adds a chip, clears the text and keeps the list open. Escape closes the list, then clears the text (not the value) if pressed again. Tab closes without committing an active option, in single and multiple mode. Clicking the toggle button opens the full list; the clear button empties value and text, reporting `''` in single mode and `[]` with `multiple`. Only typing opens with no active option: the toggle button, a click in the input, the `open` prop and ArrowDown open with the selected option active, else the first; ArrowUp with the selected option, else the last; Alt+ArrowDown with the selected option, else none. Pressing the already-selected option in single mode fires no `onChange` (Listbox skips same-value commits), so the combobox detects that press itself, restores the label and closes. In `multiple`, Backspace on an empty input removes the last chip, and each chip's remove button removes that one; `onChange` receives the array in selection order. With `async`, the component shows `copy.loading` while `loading`, calls `onInputChange` on each user text change, and renders whatever `options` the consumer supplies; while `loading` the Listbox is given `options: []` and `loading` (so stale results are hidden and Listbox shows `copy.loading` in place of `emptyMessage`, which stays `copy.empty`), and the `copy.addCustom` row is hidden. Result counts, loading and "no matches" are announced politely; the count excludes the synthetic `copy.addCustom` row, so zero matches announce `copy.empty` even while that row shows. The `resultCount` plural uses the nearest `lang` ancestor's locale on web and Lit, else the runtime default. `copy.requiredIndicator` renders inside the label, so it is part of the accessible name (as Select). The Default story's args are the `fruit-picker` example; the scenarios' `apple` is its Apple option. Validation and Form behavior are as Input; the value collected is the option value(s), or the custom string(s). `invalid: true` with no `error` renders `copy.invalid` as the message, so an invalid field is identified in text and not by the border colour alone. Filtering is case- and diacritic-insensitive on every platform. The result-count announcement is debounced by `motion.duration.base × 2` everywhere. The toggle button opens the full, unfiltered list for that opening; the next keystroke filters again. A click in the input opens the same full list, for the same reason. After a commit the input shows the selected option's label (single) or clears (multiple); a controlled `inputValue` is expected to follow the same rule. In single mode an uncontrolled input starts with the label of `value`/`defaultValue` and is rewritten to the new label on every `value` change, without firing `onInputChange`; a controlled `inputValue` is left to the consumer. The Keyboard story sets `defaultValue: apple` so the clear button renders and the story has enough focusable children, and it owns `open` on every platform — starting open and writing `onOpenChange` back — since `open` is controlled and the Escape and Tab rules cannot close a list the story pins. The composed Listbox is `embedded`, gets `loading` while an async filter runs, and with `allowCustom` is given a synthetic first option carrying `copy.addCustom`. On phones the chips render at the top of the sheet body.

## Content guidelines

The label names the field ("Assignees"); the placeholder shows an example or a verb ("Search people"). Option labels are unique and short; descriptions carry the disambiguation (email under a name). The custom-entry row uses `copy.addCustom` verbatim so users learn the pattern. Chips show the option label, never the value; keep labels to roughly twenty characters, since a chip truncates with an ellipsis once the row runs out of room rather than at a fixed character count: no binding caps a chip's width — the label is simply allowed to shrink and ellipsize inside the wrapping field row — so the truncation point is whatever the row leaves.

## Accessibility

The input is a `combobox` with `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`, and the popup a `listbox` (WCAG 4.1.2; APG editable combobox). DOM focus stays in the input while the list is navigated, so screen readers announce the active option through activedescendant and sighted users keep the caret. The number of results, loading and empty states are announced through a polite live region (4.1.3). Escape closes the list before it clears text, so a keystroke never destroys input unexpectedly (3.2.2). Chips are removable by keyboard through their buttons and by Backspace (2.1.1), each remove button named for its chip. Required and invalid are conveyed in text and attributes (1.4.1, 3.3.1). The field reaches 44px (2.5.8); the border meets 3:1 (1.4.11); text meets AA on the field and on chips.

## Platform notes

### Web
Render the label, the field wrapper (styled as Input's border and focus ring via `:has(input:focus-visible)`, so the ring tracks the input and not a focused chip-remove or clear Button), chips, `<input role="combobox" aria-autocomplete="list" aria-expanded aria-controls={listboxId} aria-activedescendant={activeId} autocomplete="off">`, the clear and toggle Buttons (`ghost`, `sm`, `iconOnly`), the description and error, a hidden `<div role="status" aria-live="polite">` for `copy.resultCount` / loading / empty (debounced ~500ms via `motion.duration.base × 2`), and hidden inputs for the value(s). The popup is a portal (`position: fixed`, from the field rect, flip on overflow, `min-inline-size` = field width, `layer.dropdown`) containing `<Listbox labelledBy={labelId}>` with `selectionFollowsFocus={false}`; drive its active option as the web platform note says (no `useListbox` hook exists); close on outside `pointerdown` and on `focusout` to outside. Filtering is case- and diacritic-insensitive.

### Lit
`<ds-combobox label="Assignees" name="assignees" multiple .options=${…}>`; form-associated; `<ds-listbox>` in the shadow root; chips and buttons composed from `<ds-button>` and `<ds-icon>`; composed `change`, `input-change`, `open-change`.

### React Native
Phones: the field is a `Pressable` summary (chips + placeholder) that opens a `BottomSheet height="full"` containing a `TextInput` (`accessibilityRole="combobox"`, autofocus) and the `Listbox`; committing closes the sheet (single) or updates the chips (multiple), with a `copy.done` Button in the sheet footer in both modes (the visible close control). The `status` part is visible small muted Text under the input (`helperSize`, `descriptionText`) with `accessibilityLiveRegion="polite"` on Android; iOS has no live region, so there the debounced text is announced with `announceForAccessibility` instead (only there, to avoid a double announcement). BottomSheet has no header slot, so the chips and the TextInput sit at the top of the sheet body, not above it. The closed summary shows its chips read-only — a chip remove button nested inside the summary's own Pressable would fight it for the touch — so removing and clearing happen in the open sheet. Tablets / react-native-web: `TextInput` in the field with an anchored popup rendered as an absolutely positioned sibling of the field — not a `Modal`, unlike Select's and Menu's, because the APG model keeps focus in the text input while the list is browsed and react-native-web's Modal always traps it. No scrim: an outside tap blurs the input, and blur closes the list. The loading row comes from Listbox's own `loading` prop (set while `filter` is `async` and `loading`, with `options: []`), which shows `copy.loading` in place of `emptyMessage`; `emptyMessage` is always `copy.empty`. Form registration as Input.

## Related

Listbox, Select, Input, Button, BottomSheet.
