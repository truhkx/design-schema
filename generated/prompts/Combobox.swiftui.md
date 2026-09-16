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
    defaultValue:
      type: union
      description: Initial value(s).
      shape: string | string[]
    open:
      type: boolean
      description: Controlled popup state, for programmatic use and for stories and
        tests. Omit for the typing-driven default.
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
    onInputChange:
      description: Fired on every keystroke with the input text. The hook for `async`
        filtering.
      platforms:
        web: onInputChange
        lit: input-change
        rn: onInputChange
        swiftui: onInputChange
    onOpenChange:
      description: Fired when the list opens or closes.
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
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
  - keys:
    - Tab
    action: Closes the list and moves focus on. Under single-select a highlighted
      option is NOT committed by Tab (typing intent is ambiguous).
    when: list open
    from: first
    expect: closes
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
      locked: true
    fieldBorder:
      token: color.border.strong
      locked: true
    fieldBorderFocus:
      token: color.border.focus
      locked: true
    fieldBorderInvalid:
      token: color.border.danger
      locked: false
    fieldBorderWidth:
      token: border.width.thin
      locked: false
    fieldRadius:
      token: radius.md
      locked: false
    fieldPaddingInline:
      token: space.md
      locked: false
    fieldPaddingBlock:
      token: space.sm
      locked: false
    fieldGap:
      token: layout.gap.tight
      description: Between chips, input text and the buttons.
      locked: false
    inputColor:
      token: color.foreground
      locked: true
    placeholderColor:
      token: color.foreground.muted
      locked: true
    chipBackground:
      token: color.background.strong
      locked: true
    chipColor:
      token: color.foreground
      locked: true
    chipRadius:
      token: radius.full
      locked: false
    chipPaddingInline:
      token: space.2
      locked: false
    chipPaddingBlock:
      token: space.0
      locked: false
    chipGap:
      token: layout.gap.tight
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
      locked: false
    helperSize:
      token: font.size.sm
      locked: false
    descriptionText:
      token: color.foreground.muted
      locked: true
    errorText:
      token: color.foreground.danger
      locked: true
    popupSurface:
      token: color.overlay.surface
      locked: false
    popupBorder:
      token: color.border
      locked: false
    popupShadow:
      token: shadow.overlay
      locked: false
    popupRadius:
      token: radius.md
      locked: false
    popupOffset:
      token: space.1
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
  copy:
    empty: No matches
    loading: Loading…
    addCustom: Add "{value}"
    clearLabel: Clear
    toggleLabel: Show options
    removeChip: Remove {label}
    resultCount: '{count} results available'
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
      large: true
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
```

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `fieldBorderInvalid`, `fieldBorderWidth`, `fieldRadius`, `fieldPaddingInline`, `fieldPaddingBlock`, `fieldGap`, `chipRadius`, `chipPaddingInline`, `chipPaddingBlock`, `chipGap`, `partGap`, `labelWeight`, `helperSize`, `popupSurface`, `popupBorder`, `popupShadow`, `popupRadius`, `popupOffset`, `layer`, `fontFamily`, `fontSize`, `chipSize`, `lineHeight`, `disabledOpacity`, `enter`
Locked (accessibility-bearing, never overridable): `fieldBackground`, `fieldBorder`, `fieldBorderFocus`, `inputColor`, `placeholderColor`, `chipBackground`, `chipColor`, `iconColor`, `descriptionText`, `errorText`, `minTarget`, `focusRingWidth`

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

## Behavior scenarios (8)

One test per scenario, in this order.

```yaml
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
