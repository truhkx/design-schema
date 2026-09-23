# Generate: Listbox for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Listbox.tsx` exporting a typed React Native function component named `Listbox`.

**When the files already exist.** Read the existing component, stories, tests and index export first. The doc is authoritative: change what contradicts it, add what it requires, and keep what it does not mention unless a convention forbids it. Do not restyle or rename for taste. In your reply, before the report block, say what you changed and why.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `ListboxProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Listbox> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Listbox.test.tsx`.

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
    emptyState:
      component: Text
      props:
        tone: muted
    errorMessage:
      component: Text
      props:
        size: sm
        tone: danger
  props:
    label:
      type: string
      a11yRole: accessible-name
      required: true
      description: 'Accessible name of the list. When a visible Text label exists,
        pass its id via `labelledBy` as well; on web `aria-labelledby` then wins.
        Always pass `label` even with `labelledBy`: it is the `{label}` in `copy.required`
        and `copy.invalid` on every platform, and on Lit it is always the list''s
        `aria-label`, because an id outside the shadow root cannot be referenced.'
    labelledBy:
      type: string
      description: 'Id of a visible element that labels the list. Web only in effect:
        Lit accepts it for parity (attribute `labelled-by`) but never sets `aria-labelledby`
        (ids do not cross shadow roots) and names the list with `label` as `aria-label`.
        The story for it exists on both platforms all the same — on Lit it shows exactly
        that, a caption beside a list still named by `label`.'
      platforms:
      - web
      - lit
    options:
      type: array
      required: true
      shape: '({ value: string; label: string; description?: string; icon?: IconName;
        disabled?: boolean } | { group: string; options: ListboxOption[] })[]'
      description: 'Flat or grouped options; groups do not nest. Export three types
        on every platform: `ListboxOption` is the leaf `{ value, label, description?,
        icon?, disabled? }`, `ListboxGroup` is `{ group, options: ListboxOption[]
        }`, and `ListboxItem` is `ListboxOption | ListboxGroup`, the element type
        of this array (Select and Combobox take the same `ListboxItem[]`). This is
        a breaking rename where a package used `ListboxOption` for the row-or-group
        union: in-package consumers move to `ListboxItem`/`ListboxGroup`, and where
        a package actually exported `ListboxGroupOption` that name stays as a deprecated
        alias of `ListboxOption` — a package that never exported it adds nothing (no
        platform in this repo had it).'
    multiple:
      type: boolean
      default: false
      description: Allow any number of selections. The value becomes an array; each
        option shows a check indicator; selection toggles rather than moves. This
        is the same engine Combobox uses for multi-select.
    value:
      type: union
      description: 'Controlled selection: a value, or with `multiple` the exported
        `ListboxValue` (`string | string[]`). Omit for uncontrolled. The shape that
        does not match the mode is normalised, not warned about: a single-select list
        takes an array''s first entry, and a multi-select list reads a bare string
        as a one-entry array.'
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
      description: 'Marks the list invalid (aria-invalid, and `borderInvalid` when
        not `embedded`) with `copy.invalid`. The list is invalid while this is true
        OR `error` is non-empty; clearing `error` never clears an explicitly set `invalid`.
        A Form-supplied message showing (web and React Native) makes the list invalid
        the same way, with `aria-invalid` and `borderInvalid`. On Lit the reflected
        `invalid` attribute is the effective state: setting `error` sets it, and clearing
        `error` removes it only if `error` was what set it.'
    error:
      type: string
      description: 'Error message rendered below the list and linked by aria-describedby;
        implies invalid. The displayed message is `error`, then the Form''s message
        (web and React Native only: Lit''s ds-form pushes no message into its fields),
        then while invalid `copy.required` (required and nothing selected) else `copy.invalid`.
        The message is not a live region (no `role="alert"`): it is announced through
        `aria-describedby` when focus reaches the list, which a failed Form submit
        does. React Native has no `aria-describedby` and the list View is deliberately
        not `accessible`, so there the displayed message is carried as each row''s
        `accessibilityHint` — the rows are the stops, so that is where a description
        of the list has to live.'
    embedded:
      type: boolean
      default: false
      description: 'The list lives inside a popup (Select, Combobox) that owns the
        border, surface and radius; the list draws none of its own. It keeps its own
        `listPadding` — that is content spacing, not surface chrome — and an override
        of `border`, `borderWidth`, `borderInvalid`, `surface` or `radius` is a no-op
        while it is set, since overrides change values, never presence. An embedded
        list is not a tab stop (web and Lit render it with `tabindex="-1"`): its host
        keeps focus on the trigger or input and forwards keys.'
    initialActiveValue:
      type: string
      description: 'The option that is active when the list first receives focus (Select
        opens with the selected option active). It wins when it names an enabled option;
        otherwise the first selected, else the first enabled. When it changes while
        the list has no focus (Combobox updates it as the user types), the active
        option (native: the pre-highlight) moves to it without firing `onActiveChange`.
        "No focus" is measured on the list element, not on the page: the test is that
        the list does not contain the active element (on Lit, that its shadow root''s
        `activeElement` is not the list), so a list driven by a host that holds focus
        itself — Select, Combobox, Search — always follows the new value.'
    activeValue:
      type: union
      shape: string | null
      description: 'The active option, driven by a host that keeps focus on its own
        trigger or input and forwards keys (Select, Combobox, Search). Set, it wins
        over `initialActiveValue` and needs no focus in the list: the active background
        and `aria-activedescendant` follow it, and `null` means no option is active
        (how a host clears the highlight, instead of remounting the list). Keys the
        host forwards move nothing on their own while it is set; they report the option
        they would make active through `onActiveChange`, and the host passes that
        value back. Omitted, the list owns the active option as before. The ids a
        host points `aria-activedescendant` at are the ones the platform notes give
        (web `${id}-option-${value}`; Lit instance-scoped and index-based, reached
        by `data-value`). On React Native, where every row is its own stop and there
        is no highlight to drive, it pre-highlights a row exactly as `initialActiveValue`
        does.'
      controls:
        event: onActiveChange
    loading:
      type: boolean
      default: false
      description: Options are being fetched (async Combobox); the list shows `copy.loading`
        in place of the empty message and is aria-busy.
    disabled:
      type: boolean
      default: false
      description: 'The whole list is inert but readable: it stays focusable (web
        and Lit keep tabindex=0 and set aria-disabled=true on the list; native sets
        accessibilityState.disabled on every row), keys, hover, clicks and taps do
        nothing, and `disabledOpacity` dims the list once (not stacked on individually
        disabled options; the error message stays at full opacity). Focusing a disabled
        list sets no active option, fires no `onActiveChange` and shows no active
        background; the focus ring (native: the focused row''s border) is still drawn.
        A disabled list still resolves `initialActiveValue` and keeps it in state
        — so enabling the list picks up where it would have been — but draws no active
        background for it and reports nothing while disabled. When the list is not
        disabled, each individually disabled option is dimmed by `disabledOpacity`.'
    name:
      type: string
      description: 'Field name for Form collection. The submitted value is a string
        in single-select and an array of strings with `multiple` (the form `valueType:
        string[]` covers both); nothing selected submits no key. Without `name` nothing
        is submitted, though the root still carries `data-ds-field` like every field
        (Form skips unnamed fields).'
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
      description: 'Height in rows before the list scrolls; `all` never scrolls. Computed
        from tokens, never measured: rows × the row height from Behavior, plus 2 ×
        `listPadding`, plus 2 × `borderWidth` when not `embedded`. Rows with a description
        and group labels are taller or shorter than counted, so slightly fewer or
        more rows show; that is accepted.'
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
      description: 'Fired as the focused (active) option changes, with its value —
        Combobox uses this to keep aria-activedescendant in sync; consumers rarely
        need it. Fires on keyboard moves, hover, the option made active when the list
        receives focus (web, Lit) or row focus (native), and with null when the list
        (native: the active row) loses real focus. Every real row focus reports, including
        the first focus landing on the row `initialActiveValue` pre-highlighted (whose
        value has not changed), so a host always learns where focus went; only hover
        is deduped against the current active value. A host that drives the list without
        focusing it (Select, Combobox and Search keep focus on their trigger or input
        and forward keys) gets no null from the list, and clears its own active value
        when it closes or loses focus. Never on mount, so the native `initialActiveValue`
        pre-highlight does not fire it.'
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
      fires:
      - user
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
    action: 'Multiple: moves and adds the next/previous option to the selection (add
      only; an already-selected option stays selected).'
    when: multiple
    from: first
    expect: manual
  - keys:
    - Control+a
    action: 'Multiple: selects all enabled options; pressed again when every enabled
      option is selected, deselects the enabled options. Selected disabled options
      stay selected either way.'
    when: multiple
    from: first
    expect: manual
  - keys:
    - a-z
    action: Typeahead to the next option whose label starts with the typed characters;
      typing the same character repeatedly cycles through the options starting with
      it (APG) — a buffer of one letter repeated collapses back to that single letter
      and searches from the option after the active one, while any other buffer is
      a prefix searched from the active one. The buffer clears after `typeaheadReset`.
    from: first
    expect: manual
  - keys:
    - PageDown
    - PageUp
    action: 'Moves by the `maxVisible` count of enabled options — not of drawn rows,
      so disabled rows and group labels do not consume the move — clamped to the last/first
      enabled option; with `maxVisible: all` jumps to the last/first enabled option.
      Follows `selectionFollowsFocus` like the arrows.'
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
    borderInvalid:
      token: color.border.danger
      description: Replaces `border` while invalid, only when not `embedded`; an embedded
        list conveys invalid by aria-invalid and the error message alone.
      locked: false
    partGap:
      token: space.1
      description: 'Vertical gap between the list and errorMessage. Both sit in the
        root wrapper, which is not an anatomy part (web: the div with data-ds, whose
        child is the role=listbox list part, since a listbox may only contain options
        and groups; Lit: an unnamed wrapper in the shadow root; native: the outer
        View with testID="Listbox").'
      locked: false
    errorText:
      token: color.foreground.danger
      part: errorMessage
      description: Realised by the composed Text's tone danger; declares no hook of
        its own.
      locked: true
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
      description: 'The row''s horizontal gap: between check, icon and the label column.
        The description sits under the label in that column and takes no gap from
        it — this much space between a label and its own sub-line would read as two
        rows — and rows themselves have no gap between them.'
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
    optionWeight:
      token: font.weight.regular
      part: option
      description: Unselected options; selected ones use optionSelectedWeight.
      locked: false
    optionSelectedWeight:
      token: font.weight.medium
      part: option
      state: selected
      description: Wins over `optionWeight` on a selected row.
      locked: false
    optionSelectedCheck:
      token: color.control.selectedBackground
      part: optionCheck
      description: The check icon on selected options, in the selected-control fill
        (3:1 on both surfaces by derivation). Only with `multiple`, where the slot
        is present on every row (invisible when unselected) so labels align. Single-select
        has no check slot and shows selection by `optionSelectedWeight` alone, never
        a row fill, since the fill is the active state.
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
      description: Block padding only; the group label's inline padding is `optionPaddingInline`,
        so it lines up with the option labels.
      locked: false
    emptyColor:
      token: color.foreground.muted
      part: emptyState
      description: Realised by the composed Text's tone muted (also for `copy.loading`);
        declares no hook of its own.
      locked: true
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      description: A unitless multiplier, which is what makes `fontSize × lineHeight`
        in the row formula a valid length.
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Never changes layout. Web and Lit draw it as an outline on the
        focused list. Native draws it as a row border that is always reserved (transparent
        unless the row is focused), so native rows are 2 × focusRingWidth taller than
        the Behavior formula, and maxVisible counts that.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    typeaheadReset:
      token: motion.duration.loop
      part: list
      description: How long typed characters accumulate before the typeahead buffer
        clears; read at runtime from the list's computed custom property (`ms` or
        `s` parsed to milliseconds). When it cannot be read (no token stylesheet,
        as in jsdom) the buffer clears immediately, so only single-character typeahead
        works. React Native has no typeahead and accepts it in its overrides type
        for parity only.
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
          description: 'How many options are selected. One form only: "1 selected"
            is intended and deliberately not special-cased, and neither web nor Lit
            renders the count — each exports it for a host (Select, Combobox) or the
            surrounding UI to show.'
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
    - foreground: color.foreground.danger
      background: color.background
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
        the active option. The `tabindex=0` above is the standalone case: an `embedded`
        list renders `tabindex="-1"` instead, disabled or not. The empty/loading row
        is `aria-hidden` with an id the list''s `aria-describedby` points at, since
        a role=listbox may own only options and groups and a visible message inside
        it fails aria-required-children; the message is still announced when focus
        reaches the list. Because this is an activedescendant composite, the selected/checked
        state lives on the option `aria-activedescendant` names, never on the focused
        list. Native <select multiple> is not used: it cannot be styled or grouped
        consistently and its keyboard model differs per browser.'
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
        a native <form> gets the same shape as a <select multiple>. A single-select
        list submits the string (a DsFormField `currentValue` of `string | string[]
        | null` covers both modes). Composed `change` (detail { value }) and `active-change`.
        The list always takes `label` as aria-label; `labelledBy` is never resolved
        across the shadow boundary. aria-activedescendant referencing shadow options
        works because list and options share the shadow root; Combobox composes ds-listbox
        inside its own shadow root for the same reason. Option ids are instance-scoped
        and index-based (`ds-listbox-<n>-option-<index>`), never built from the value,
        so a value containing a space still yields a valid IDREF; a host that needs
        a particular row reaches it by `data-value`, not by id. The list is `tabindex="-1"`
        when `embedded` and `0` otherwise, disabled included. The empty/loading row
        is aria-hidden and linked by the list''s aria-describedby, as on web. `disabled`
        is the effective state, not just the prop: an owning <form> or <fieldset>
        disabling the element through `formDisabledCallback` sets no attribute, so
        the dimming, the key and click guards and `aria-disabled` are keyed on the
        effective state and the CSS is written against the list''s `aria-disabled`
        rather than `:host([disabled])`.'
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
        react-native-web is the web: under `Platform.OS === ''web''` the list and
        rows emit that contract instead (`role="listbox"`, `role="option"`, `aria-selected`,
        `aria-disabled`, and `aria-multiselectable` with `multiple`), because `list`
        + `menuitem` is not a legal pairing once it reaches a real ARIA tree. react-native-web
        also drops `accessibilityState` silently, so on that platform selected/checked/disabled
        must be written as attributes on the node — and Pressable overwrites a passed-in
        `aria-disabled` from its own (absent) `disabled` prop, so that one is set
        on the node in an effect. Without it a dimmed row is not exempt from the contrast
        rule and `disabledOpacity` fails it. maxVisible → maxHeight from the token
        formula (see `maxVisible` and `focusRingWidth`), never measured. Groups are
        flattened into FlatList rows (no SectionList), so the `group` part has no
        wrapper view on native: only the group label row exists, as Text with testID
        `Listbox.groupLabel`. `disabled` is accessibilityState.disabled plus a press
        guard, never Pressable''s `disabled` prop (it removes the row from focus).
        The list View keeps accessibilityLabel = `label` but is not `accessible` (that
        would swallow the rows), so the empty/loading Text is its own stop read as-is,
        with no label concatenation; with `multiple` the list''s accessibilityValue
        text is `copy.selectedCount`. Each option is its own accessibility stop; Pressable
        has no key events, so arrows, Home/End, Page keys, typeahead, Shift+Arrow
        and Ctrl+A have no native form at all, a tap is the selection, and `selectionFollowsFocus`
        is accepted for parity with no runtime effect. `initialActiveValue` only pre-highlights
        a row here, since there is no single tab stop to move. A failed Form submit
        moves accessibility focus to the first selected row, else the first enabled
        row, scrolling it into view first (`scrollToIndex`) so the target is mounted;
        when the row still cannot be reached, focus falls back to the list View. Rows
        are `fontSize × lineHeight` rounded to whole pixels (`toLineHeight`, the line
        height the rows render with), in the row formula as in the drawn text.'
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
        the token row formula. `multiple` rows show the check Icon and the count is
        announced. `embedded` drops the surface bindings for Select/Combobox/Search
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

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: string | string[]`
  - fires on: user
- `onActiveChange`: emit `onActiveChange`
  - payload, positional, in this order: `value: string | null`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)
- `activeValue` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onActiveChange` (emit `onActiveChange`)

## Parts and slots

- `list`: element
- `group`: element
- `groupLabel`: element
- `option`: element
- `optionLabel`: element
- `optionDescription`: element
- `optionIcon`: component `Icon`
- `optionCheck`: component `Icon`
- `emptyState`: component `Text`; props `tone` = "muted"
- `errorMessage`: component `Text`; props `size` = "sm", `tone` = "danger"

## Style bindings

- `errorText`: token `color.foreground.danger`; part `errorMessage`; locked
- `listPadding`: token `space.1`; part `list`
- `optionPaddingBlock`: token `space.sm`; part `option`
- `optionPaddingInline`: token `space.md`; part `option`
- `optionGap`: token `layout.gap.normal`; part `option`
- `optionRadius`: token `radius.sm`; part `option`
- `optionColor`: token `color.foreground`; part `option`; locked
- `optionDescriptionColor`: token `color.foreground.muted`; part `optionDescription`; locked
- `optionDescriptionSize`: token `font.size.sm`; part `optionDescription`
- `optionActiveBackground`: token `color.background.subtle`; part `option`; state `active`; locked
- `optionWeight`: token `font.weight.regular`; part `option`
- `optionSelectedWeight`: token `font.weight.medium`; part `option`; state `selected`
- `optionSelectedCheck`: token `color.control.selectedBackground`; part `optionCheck`; locked
- `groupLabelColor`: token `color.foreground.muted`; part `groupLabel`; locked
- `groupLabelSize`: token `font.size.xs`; part `groupLabel`
- `groupLabelWeight`: token `font.weight.semibold`; part `groupLabel`
- `groupLabelPaddingBlock`: token `space.1`; part `groupLabel`
- `emptyColor`: token `color.foreground.muted`; part `emptyState`; locked
- `typeaheadReset`: token `motion.duration.loop`; part `list`

## Keyboard

- `ArrowDown` (Moves to the next enabled option (and selects it when selection follows focus).): expect focus-next
- `ArrowUp` (Moves to the previous enabled option.): expect focus-prev
- `Home` (First option.): expect focus-first
- `End` (Last option.): expect focus-last
- ` ` (Selects the focused option; with `multiple`, toggles it.): expect selects
- `Enter` (Selects the focused option (single) — inside a Select or Combobox, also closes the popup.): expect selects
- `Shift+ArrowDown`, `Shift+ArrowUp` (Multiple: moves and adds the next/previous option to the selection (add only; an already-selected option stays selected).): expect manual
- `Control+a` (Multiple: selects all enabled options; pressed again when every enabled option is selected, deselects the enabled options. Selected disabled options stay selected either way.): expect manual
- `a-z` (Typeahead to the next option whose label starts with the typed characters; typing the same character repeatedly cycles through the options starting with it (APG) — a buffer of one letter repeated collapses back to that single letter and searches from the option after the active one, while any other buffer is a prefix searched from the active one. The buffer clears after `typeaheadReset`.): expect manual
- `PageDown`, `PageUp` (Moves by the `maxVisible` count of enabled options — not of drawn rows, so disabled rows and group labels do not consume the move — clamped to the last/first enabled option; with `maxVisible: all` jumps to the last/first enabled option. Follows `selectionFollowsFocus` like the arrows.): expect manual

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

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `border`, `borderInvalid`, `partGap`, `borderWidth`, `radius`, `listPadding`, `optionPaddingBlock`, `optionPaddingInline`, `optionGap`, `optionRadius`, `optionDescriptionSize`, `optionWeight`, `optionSelectedWeight`, `groupLabelSize`, `groupLabelWeight`, `groupLabelPaddingBlock`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`, `typeaheadReset`
Locked (accessibility-bearing, never overridable): `surface`, `errorText`, `optionColor`, `optionDescriptionColor`, `optionActiveBackground`, `optionSelectedCheck`, `groupLabelColor`, `emptyColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (13)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-on-an-option-selects-it
  when:
    click: option
  then:
  - event: onChange
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
  derived: true
```

## Platform notes (rn)

```yaml
element: FlatList
props:
- accessibilityRole=list
- accessibilityState
- accessibilityRole=menuitem
notes: "A FlatList (virtualised \u2014 long option lists are common) of Pressable\
  \ rows with accessibilityRole=\"menuitem\" (no listbox/option roles on native) and\
  \ accessibilityState={{ selected, disabled }}; multiple: accessibilityState.checked.\
  \ Because there is no listbox role here, a test finds the list by its accessible\
  \ label, never by role \u2014 the `listbox` in a11y.role is the web and Lit contract.\
  \ react-native-web is the web: under `Platform.OS === 'web'` the list and rows emit\
  \ that contract instead (`role=\"listbox\"`, `role=\"option\"`, `aria-selected`,\
  \ `aria-disabled`, and `aria-multiselectable` with `multiple`), because `list` +\
  \ `menuitem` is not a legal pairing once it reaches a real ARIA tree. react-native-web\
  \ also drops `accessibilityState` silently, so on that platform selected/checked/disabled\
  \ must be written as attributes on the node \u2014 and Pressable overwrites a passed-in\
  \ `aria-disabled` from its own (absent) `disabled` prop, so that one is set on the\
  \ node in an effect. Without it a dimmed row is not exempt from the contrast rule\
  \ and `disabledOpacity` fails it. maxVisible \u2192 maxHeight from the token formula\
  \ (see `maxVisible` and `focusRingWidth`), never measured. Groups are flattened\
  \ into FlatList rows (no SectionList), so the `group` part has no wrapper view on\
  \ native: only the group label row exists, as Text with testID `Listbox.groupLabel`.\
  \ `disabled` is accessibilityState.disabled plus a press guard, never Pressable's\
  \ `disabled` prop (it removes the row from focus). The list View keeps accessibilityLabel\
  \ = `label` but is not `accessible` (that would swallow the rows), so the empty/loading\
  \ Text is its own stop read as-is, with no label concatenation; with `multiple`\
  \ the list's accessibilityValue text is `copy.selectedCount`. Each option is its\
  \ own accessibility stop; Pressable has no key events, so arrows, Home/End, Page\
  \ keys, typeahead, Shift+Arrow and Ctrl+A have no native form at all, a tap is the\
  \ selection, and `selectionFollowsFocus` is accepted for parity with no runtime\
  \ effect. `initialActiveValue` only pre-highlights a row here, since there is no\
  \ single tab stop to move. A failed Form submit moves accessibility focus to the\
  \ first selected row, else the first enabled row, scrolling it into view first (`scrollToIndex`)\
  \ so the target is mounted; when the row still cannot be reached, focus falls back\
  \ to the list View. Rows are `fontSize \xD7 lineHeight` rounded to whole pixels\
  \ (`toLineHeight`, the line height the rows render with), in the row formula as\
  \ in the drawn text."
```

## Guidance

## Overview

A listbox is a list you choose from. It is the part of a dropdown that actually does the work — the arrows, the typeahead, the selection — extracted so that a visible picker, a Select's popup and a Combobox's suggestions all behave identically, including for multi-select. If Select is the trigger and Combobox is the input, Listbox is the engine.

## When to use

Use a standalone Listbox when the options should stay visible: a settings picker with five to twenty entries, a transfer list, the sidebar of a two-pane chooser. Use `multiple` for "pick any": tags, recipients, filters. Set `selectionFollowsFocus: false` when selecting has side effects (loading a preview), so arrow-key browsing does not trigger them. Everywhere else, use Select (short lists, form fields) or Combobox (long lists, typing to filter) — both open a Listbox.

## When not to use

Do not use a Listbox for two to seven options that fit on screen and need no scrolling; a RadioGroup (single) or a set of Checkboxes (multiple) is simpler and has native semantics. Do not use it for actions (Menu) or for navigation (Links). Do not present a multi-select without showing the selected count or chips somewhere, or users lose track of what they picked.

## Behavior

The list is one tab stop. Arrow keys move the active option and, in single-select with `selectionFollowsFocus`, select it; Space selects or toggles, Enter selects; Home/End and PageUp/PageDown jump; typing letters moves to the matching label. In `multiple`, each option shows a check, Space toggles, Shift+Arrow extends, Ctrl/Cmd+A selects all, and `onChange` receives the array in option order. Disabled options are visible, announced, skipped by arrows and not selectable. The active option is always scrolled into view; the list scrolls after `maxVisible` rows. When `options` is empty, `emptyMessage` shows and the list is still focusable so a Combobox user hears "No options". Inside a Form, `name` collects the value (array for `multiple`) and `required` fails when nothing is selected. Arrow keys clamp at the first and last enabled option (no wrapping; Home and End reach the ends). Home, End, PageUp/PageDown and type-ahead follow `selectionFollowsFocus` exactly as the arrows do. When no option is active yet (keys forwarded by a Combobox before the list was focused), ArrowDown and PageDown land on the first enabled option, ArrowUp and PageUp on the last, and Space and Enter act on the resolved initial option (`initialActiveValue`, else the first selected, else the first enabled). Enter selects only in single-select (a no-op with `multiple`, where Space toggles). Rows are `max(minTarget, fontSize × lineHeight + 2 × optionPaddingBlock)` tall (native adds the reserved `2 × focusRingWidth`), computed from tokens and never measured, which is what `maxVisible` and PageUp/PageDown count. Option icons and the check render at Icon `size: sm`; the check's color reaches it as Icon `overrides.color` = `optionSelectedCheck`, and the `optionIcon` takes `optionColor` the same way, so it matches its row's label on every platform (there is no `currentColor` on native). An option's description has its own id and the option points at it with `aria-describedby` (web, Lit). The empty/loading row uses `optionPaddingBlock` and `optionPaddingInline`, so it lines up with the rows. It is a real accessibility stop only on React Native; on web and Lit it is hidden from assistive technology and linked as the list's `aria-describedby`, because a role=listbox may own only options and groups, so the focusable empty list still announces "No options". Empty groups are omitted. The error message is Text `size: sm`, `tone: danger` below the list, `partGap` from it; besides the listed props every composed part gets its `data-part` hook, both the emptyState and errorMessage Texts render as `element="p"`, and the error Text also gets the id `aria-describedby` points at. Those two Texts also receive the root `fontFamily` and `lineHeight` as their own overrides — not `fontSize`, since each carries its own `size` — so a host that overrides the typeface (Select passes its own into the embedded list) gets the message and the rows in one typeface. The Default story's args are the `single-picker` example on every platform. Without `name` the list submits nothing to a Form.

## Content guidelines

Option labels are short, unique within the list, sentence case, no trailing punctuation; use `description` for the second line rather than a longer label. Group labels are one or two words. The empty message states the situation, not an instruction ("No matching people", not "Try another search"). When the list is multi-select, the surrounding UI shows `copy.selectedCount` or the selected items.

## Accessibility

Role `listbox` with a name, `aria-multiselectable` when `multiple`, options with `aria-selected`, groups with names (WCAG 4.1.2; APG listbox). One tab stop with arrow navigation and typeahead; the active option is announced via `aria-activedescendant` while DOM focus stays on the list (or, in Combobox, on the input). Selected and active states are visually distinct — check mark and weight for selected (weight alone in single-select), background for active — so neither is color alone (1.4.1) and a sighted keyboard user can tell "where I am" from "what I chose". Options meet 24px (2.5.8) and text meets AA on both the surface and the active background; the check meets 3:1.

## Platform notes

### Web
`<div role="listbox" tabindex="0" aria-label|aria-labelledby aria-multiselectable aria-activedescendant={activeId}>` containing `<div role="group" aria-labelledby>` and `<div role="option" id aria-selected aria-disabled>` rows with, only when `multiple`, `<Icon name="check">` (invisible when unselected, so labels align), optional `<Icon>`, label and description. Keydown on the list implements the table; `pointermove` over an option sets it active; click selects. Scroll the active option into view with `block: 'nearest'`. There is no separate `useListbox` hook: a host (Combobox, Select) forwards its keys by dispatching `keydown` on the Listbox ref and drives the active option through `activeValue`. The role=listbox div sits inside a root wrapper div (data-ds, data-ds-field) that also holds the error Text after it. `id` goes on the role=listbox list (hosts build `${id}-option-${value}` and `aria-controls` from it); `ref` and the remaining DOM props go on the wrapper, and keydown/focus/blur are handled on the wrapper so events dispatched on the ref arrive. Form registration as Input, with `getValue` returning the string in single-select and the array for `multiple`.

### Lit
`<ds-listbox label="Assignees" multiple .options=${…}>`; form-associated (`setFormValue(FormData)` for multiple, string otherwise); `aria-activedescendant` between shadow siblings; composed `change` and `active-change`. Expose a `handleKey(event)` method and `activeValue` for `ds-combobox`.

### React Native
`FlatList` of `Pressable` rows with `accessibilityRole="menuitem"`, `accessibilityState={{ selected, checked: multiple ? selected : undefined, disabled }}`, and `accessibilityLabel` = label plus description — on react-native-web the listbox/option contract and real ARIA attributes instead, per the platform notes. `maxVisible` becomes `maxHeight`. Groups are plain `Text` rows (not the header trait, which would enter the headings rotor). No activedescendant on native; each row is a stop. Form registration as Input.

## Related

Select, Combobox, RadioGroup, Checkbox, Menu.
