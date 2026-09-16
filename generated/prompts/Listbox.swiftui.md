# Generate: Listbox for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Listbox.swift` declaring `public struct Listbox: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/ListboxBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Listbox.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Listbox") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Listbox")` on the root and `"Listbox.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
        border, surface and radius; the list draws none of its own.
    defaultActiveValue:
      type: string
      description: The option that is active when the list first receives focus (Select
        opens with the selected option active). Defaults to the first selected, else
        the first enabled option.
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
      description: Height in rows before the list scrolls; `all` never scrolls.
  events:
    onChange:
      description: Fired when the selection changes, with the new value (array when
        `multiple`).
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
    onActiveChange:
      description: Fired as the focused (active) option changes, with its value —
        Combobox uses this to keep aria-activedescendant in sync; consumers rarely
        need it.
      platforms:
        web: onActiveChange
        lit: active-change
        rn: onActiveChange
        swiftui: onActiveChange
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
      locked: false
    optionPaddingBlock:
      token: space.sm
      locked: false
    optionPaddingInline:
      token: space.md
      locked: false
    optionGap:
      token: layout.gap.normal
      description: Between check, icon, label and description.
      locked: false
    optionRadius:
      token: radius.sm
      locked: false
    optionColor:
      token: color.foreground
      locked: true
    optionDescriptionColor:
      token: color.foreground.muted
      locked: true
    optionDescriptionSize:
      token: font.size.sm
      locked: false
    optionActiveBackground:
      token: color.background.subtle
      description: The focused/active option (keyboard or hover). Selection is shown
        by the check and weight, so active and selected are never confused.
      locked: true
    optionSelectedWeight:
      token: font.weight.medium
      locked: false
    optionSelectedCheck:
      token: color.control.selectedBackground
      description: The check icon on selected options (rendered only with `multiple`;
        single-select shows selection by the row fill), in the selected-control fill
        (3:1 on both surfaces by derivation); always rendered (invisible slot when
        unselected) so labels align.
      locked: true
    groupLabelColor:
      token: color.foreground.muted
      locked: true
    groupLabelSize:
      token: font.size.xs
      locked: false
    groupLabelWeight:
      token: font.weight.semibold
      locked: false
    groupLabelPaddingBlock:
      token: space.1
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
    selectedCount: '{count} selected'
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
      large: true
    - foreground: color.control.selectedBackground
      background: color.background.subtle
      level: AA
      large: true
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
        maxVisible → maxHeight = rows × row height measured from the first row. Each
        option is its own accessibility stop; typeahead and arrows apply with a hardware
        keyboard only.'
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
```

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `radius`, `listPadding`, `optionPaddingBlock`, `optionPaddingInline`, `optionGap`, `optionRadius`, `optionDescriptionSize`, `optionSelectedWeight`, `groupLabelSize`, `groupLabelWeight`, `groupLabelPaddingBlock`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `surface`, `optionColor`, `optionDescriptionColor`, `optionActiveBackground`, `optionSelectedCheck`, `groupLabelColor`, `emptyColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
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
  group headers as `Text` with `.isHeader`) inside a `.contain` element labelled by
  `label`/`labelledBy`; not `List`. The list is one focus section: arrows move the
  active `@FocusState` index, type-ahead via `.onKeyPress(characters:)`, Home/End
  via `.onKeyPress(.home/.end)`, Space/Enter select per mode; `ScrollViewReader` keeps
  the active option in view and `maxVisible` sets the frame height from the measured
  row height. `multiple` rows show the check Icon and the count is announced. `embedded`
  drops the surface bindings for Select/Combobox/Search hosts.'
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

## Behavior scenarios (7)

One test per scenario, in this order.

```yaml
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
