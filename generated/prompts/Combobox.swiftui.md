# Generate: Combobox for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Combobox.swift` declaring `public struct Combobox: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/ComboboxBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Combobox.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Combobox") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Combobox")` on the root and `"Combobox.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
        It has no --ds-combobox-* hook, since the hook could not reach the child without
        restyling it.
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

- constant `statusDebounce`: `theme.motionDurationBase * 2` (`motion.duration.base` × 2) ms
- example `fruit-picker`, story `FruitPicker`: given `label: "Fruit"`, `name: "fruit"`, `options: [{"value":"apple","label":"Apple"},{"value":"apricot","label":"Apricot"},{"value":"banana","label":"Banana"}]`; The everyday single-select combobox, filtering by substring as you type.
- example `multi-select-with-chips`, story `MultiSelectWithChips`: given `label: "Roles"`, `name: "roles"`, `multiple: true`, `defaultValue: ["frontend"]`, `options: [{"value":"frontend","label":"Frontend"},{"value":"backend","label":"Backend"},{"value":"design","label":"Design"}]`; Picking several, each shown as a removable chip before the input.
- example `free-text-tags`, story `FreeTextTags`: given `label: "Tags"`, `name: "tags"`, `multiple: true`, `allowCustom: true`, `options: [{"value":"urgent","label":"Urgent"},{"value":"billing","label":"Billing"}]`; Tags, where text matching no option can be committed with Enter or a comma.
- example `async-results`, story `AsyncResults`: given `label: "Customer"`, `name: "customer"`, `filter: "async"`, `loading: true`, `options: [{"value":"acme","label":"Acme Ltd"}]`; A field whose results come from the server, showing the loading row while they are fetched.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `fieldBorderInvalid`, `fieldBorderWidth`, `fieldRadius`, `fieldPaddingInline`, `fieldPaddingBlock`, `fieldGap`, `chipRadius`, `chipPaddingInline`, `chipPaddingBlock`, `chipGap`, `partGap`, `labelWeight`, `helperSize`, `popupSurface`, `popupBorder`, `popupBorderWidth`, `popupShadow`, `popupRadius`, `popupOffset`, `layer`, `fontFamily`, `fontSize`, `chipSize`, `lineHeight`, `disabledOpacity`, `enter`
Locked (accessibility-bearing, never overridable): `fieldBackground`, `fieldBorder`, `fieldBorderFocus`, `inputColor`, `placeholderColor`, `chipBackground`, `chipColor`, `iconColor`, `descriptionText`, `errorText`, `minTarget`, `inputMinTarget`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
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
notes: "An Input-shaped `TextField` (`.autocorrectionDisabled`, `.textInputAutocapitalization(.never)`)\
  \ with the `Listbox embedded` rendered inline below the field on phones (the keyboard\
  \ is up; a popover would fight it) and as a `.popover` on regular width. The active\
  \ option is tracked by index (not focus \u2014 focus stays in the field) and announced\
  \ through `AccessibilityNotification.Announcement` with `copy.activeOption`; the\
  \ count is announced when the list opens. Arrows/Home/End/Enter/Escape per the keyboard\
  \ table via `.onKeyPress` on the field. `allowCustom`, `multiple` (chips as `Button`s\
  \ with `close` Icons) as documented."
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

## Behavior scenarios (16)

One test per scenario, in this order.

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
  derived: true
```
