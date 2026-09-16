# Generate: Select for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Select.swift` declaring `public struct Select: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/SelectBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Select.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Select") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Select")` on the root and `"Select.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Select
  category: input
  status: review
  apg: combobox
  anatomy:
  - label
  - description
  - trigger
  - value
  - chevron
  - popup
  - listbox
  - errorMessage
  composition:
    label: Text
    description: Text
    chevron: Icon
    listbox:
      component: Listbox
      props:
        options:
          from: options
  props:
    label:
      type: string
      required: true
      description: Visible label. Always rendered.
      a11y: Associated with the trigger (label/for on web; accessibilityLabel on native).
    name:
      type: string
      required: true
      description: Field name for the Form.
    options:
      type: array
      required: true
      shape: ListboxOption[] (flat or grouped, as Listbox)
      description: The options, passed through to the Listbox.
    value:
      type: union
      description: Controlled value (array with `multiple`).
      shape: string | string[]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial value (array with `multiple`).
      shape: string | string[]
    placeholder:
      type: string
      description: Text shown in the trigger when nothing is selected. Defaults to
        `copy.placeholder`. Not a substitute for the label.
    hideLabel:
      type: boolean
      default: false
      description: Visually hide the label (it remains the accessible name), for compact
        pickers such as DatePicker's month and year.
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      default: md
      description: sm for pickers inside toolbars and calendar headers.
    open:
      type: boolean
      description: Controlled popup state, for programmatic opening and for stories
        and tests (the Keyboard story renders it open). Omit for the trigger-driven
        default.
      controls:
        event: onOpenChange
        state: open
    multiple:
      type: boolean
      default: false
      description: Pick any number. The trigger shows `copy.selectedCount` (or the
        labels when two or fewer); the popup stays open while toggling and closes
        on Escape or outside click.
    description:
      type: string
      description: Helper text under the label.
      a11y: aria-describedby / accessibilityHint.
    required:
      type: boolean
      default: false
      description: Must have a value to submit. Shown in the label, not only by color.
    disabled:
      type: boolean
      default: false
      description: Not openable and not submitted. Stays visible and focusable.
    invalid:
      type: boolean
      default: false
      description: Marks the field invalid. Usually set by the Form.
    error:
      type: string
      description: Error message; implies invalid.
      a11y: role=alert region linked with aria-describedby.
    native:
      type: enum
      values:
      - auto
      - always
      - never
      default: auto
      description: 'Use the platform''s own picker instead of the popup Listbox: `auto`
        means never on web (the styled popup) and always on native phones (the OS
        wheel/dialog is what users expect); `always` forces a native <select> on web
        too (forms that must work without JS); `never` forces the popup everywhere.'
  events:
    onChange:
      description: Fired when the value changes (array with `multiple`).
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
    onOpenChange:
      description: Fired when the popup opens or closes.
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the popup.
      fires:
      - user
  keyboard:
  - keys:
    - Enter
    - ' '
    - ArrowDown
    - ArrowUp
    action: Opens the popup with the selected (or first) option active.
    when: focus on trigger
    from: trigger
    expect: manual
  - keys:
    - Escape
    action: Closes the popup without changing the value and returns focus to the trigger.
    when: popup open
    from: inside
    expect:
    - closes
    - focus-trigger
    target: popup
  - keys:
    - Enter
    action: Commits the active option and closes (single); with `multiple`, toggles
      it and stays open.
    when: popup open
    from: first
    expect: manual
  - keys:
    - Tab
    action: Commits the active option (single) and closes; focus moves on.
    when: popup open
    from: inside
    expect: closes
    target: popup
  - keys:
    - ArrowDown
    - ArrowUp
    - Home
    - End
    - a-z
    action: As Listbox.
    when: popup open
    from: first
    expect: manual
  styles:
    triggerBackground:
      token: color.background
      part: trigger
      locked: true
    triggerBorder:
      token: color.border.strong
      part: trigger
      locked: true
    triggerBorderFocus:
      token: color.border.focus
      part: trigger
      locked: true
    triggerBorderInvalid:
      token: color.border.danger
      part: trigger
      locked: false
    triggerBorderWidth:
      token: border.width.thin
      part: trigger
      locked: false
    triggerRadius:
      token: radius.md
      part: trigger
      locked: false
    triggerPaddingInline:
      token: space.md
      part: trigger
      locked: false
    triggerPaddingBlock:
      token: space.sm
      part: trigger
      by: size
      values:
        sm: space.1
      locked: false
    triggerGap:
      token: layout.gap.normal
      part: trigger
      description: Between value and chevron.
      locked: false
    valueColor:
      token: color.foreground
      part: value
      locked: true
    placeholderColor:
      token: color.foreground.muted
      locked: true
    chevron:
      token: color.foreground.muted
      part: chevron
      locked: true
    partGap:
      token: space.1
      description: Between label, description, trigger and error.
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
      token: font.size.{size}
      locked: false
    fontWeight:
      token: font.weight.regular
      description: Weight of the trigger and option text. It exists as an override
        seam for composites that set their own header type — DatePicker forwards its
        monthTitleWeight into it.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    minTargetSm:
      token: size.target.min
      description: The trigger height floor at size sm. The popup is unchanged.
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Replaces the border width when focused; padding shrinks by the
        difference.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    enter:
      token: motion.duration.fast
      description: Popup fade; instant under reduced motion.
      locked: false
  copy:
    placeholder: Select…
    selectedCount:
      text: '{count} selected'
      params:
        count:
          type: number
          description: How many options are selected.
    done: Done
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
    - focus-restore
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
      element: button
      attributes:
      - role=combobox
      - aria-haspopup=listbox
      - aria-expanded
      - aria-controls
      - aria-labelledby
      - aria-describedby
      - aria-invalid
      - aria-required
      notes: 'The APG select-only combobox: the trigger is a <button role="combobox"
        aria-haspopup="listbox" aria-expanded aria-controls> showing the value; the
        popup is a portal with the Listbox, positioned below (flipping above) the
        trigger at least as wide as it, on layer.dropdown. Keys on the trigger are
        forwarded to the Listbox''s handler while open. A hidden <input name> carries
        the value(s) for native form submission. `native: always` renders <select>
        (and <select multiple>) with the same label/description/error wiring and no
        popup, and is the one place the system uses the real `disabled` attribute
        rather than aria-disabled: that mode exists for forms that work without JavaScript,
        where aria alone would not stop interaction. `container?: HTMLElement` (default
        document.body) is the portal target — a platform prop, not a schema prop.'
    lit:
      tag: ds-select
      reflect:
      - multiple
      - size
      - required
      - disabled
      - invalid
      - native
      notes: Form-associated with setFormValue (FormData for multiple). Composes <ds-listbox>
        inside its shadow root so aria-activedescendant works; the popup uses the
        Popover API when available. Composed `change` and `open-change`. Implements
        the DsFormField interface. aria-activedescendant cannot reference an option
        inside the composed <ds-listbox>'s shadow root, so the trigger exposes the
        active option's text through aria-describedby on a live element instead, and
        aria-controls points at the popup wrapper. ds-form collects ds-select, ds-listbox
        and ds-combobox like other fields; DsFormField.currentValue is `string | boolean
        | string[] | null`. The composed ds-listbox is given no `name`, so it never
        associates with a form of its own. `labelWeight` and `helperSize` are forwarded
        into the composed ds-text's own `overrides` property as token references,
        not written as CSS on the child.
    rn:
      element: Pressable
      props:
      - accessibilityRole=combobox
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - accessibilityValue
      notes: '`native: auto` opens a BottomSheet containing the Listbox on phones
        (the system''s own picker, not the OS wheel — consistent theming, multi-select
        and descriptions work, and the sheet is the platform idiom); tablets and react-native-web
        use the popup. `native: always` means the same thing here as `auto`: there
        is no OS picker to force without a dependency the package does not take, so
        only `never` differs. accessibilityValue.text is the selected label(s). No
        hidden input; Form registration as Input. Focus returns to the trigger by
        hand — FocusScope''s restore only recaptures a TextInput — and of the keyboard
        model only Escape, outside-tap and Enter-as-press exist, since Pressable sees
        no keys.'
    swiftui:
      element: Button
      props:
      - Button
      - .popover
      - .sheet
      - Listbox
      - .accessibilityValue
      - .accessibilityAddTraits=isButton
      - .presentationCompactAdaptation
      - FocusScope
      notes: 'A trigger `Button` (label above, `hideLabel` per Input) showing the
        value text and the `chevron-down` Icon, with `.accessibilityValue(selected
        labels or copy.placeholder)`; the popup is `Listbox embedded` in a `.popover`
        on regular width and a `.sheet` with `.presentationDetents([.medium, .large])`
        on phones — the doc''s `native: always` maps to the sheet on every width.
        Selection closes the popup for single, stays open for `multiple`; the trigger
        keeps focus and the new value is announced. Registers with the Form environment;
        `size: sm` per the Sm bindings.'
  behavior:
  - name: the-trigger-opens-the-popup
    given:
      open: false
    when:
      click: trigger
    then:
    - event: onOpenChange
  - name: a-closed-select-is-not-expanded
    given:
      open: false
    then:
    - state: expanded
      is: false
  - name: an-open-select-reports-the-expanded-state
    description: The trigger is the combobox, so aria-expanded on it is what announces
      the popup.
    given:
      open: true
    then:
    - state: expanded
      is: true
  - name: enter-commits-the-active-option-and-closes
    description: Enter commits the active option and closes (single); the popup opens
      with the selected or first option active.
    given:
      open: true
    when:
      key: Enter
    then:
    - event: onChange
    - event: onOpenChange
    platforms:
    - web
    - lit
  - name: escape-closes-without-changing-the-value
    description: Escape closes the popup without changing the value and returns focus
      to the trigger.
    given:
      open: true
    when:
      key: Escape
    then:
    - event: onOpenChange
    - event: onChange
      fired: false
    platforms:
    - web
    - lit
  - name: the-placeholder-shows-when-nothing-is-selected
    given:
      open: false
    then:
    - copy: placeholder
  - name: a-custom-placeholder-replaces-the-default
    given:
      open: false
      placeholder: Choose a country
    then:
    - text: Choose a country
  - name: a-disabled-select-does-not-open
    description: Disabled selects stay visible and focusable but cannot be opened
      and are not submitted.
    given:
      open: false
      disabled: true
    when:
      click: trigger
    then:
    - event: onOpenChange
      fired: false
    - state: disabled
      is: true
      platforms:
      - web
      - lit
  - name: required-is-shown-in-the-label
    description: required is shown in the label, not only by color.
    given:
      required: true
    then:
    - copy: requiredIndicator
  - name: invalid-is-reported-on-the-trigger
    given:
      invalid: true
    then:
    - state: invalid
      is: true
      platforms:
      - web
      - lit
  examples:
  - name: country-picker
    description: The everyday single-select field with a placeholder until something
      is chosen.
    given:
      label: Country
      name: country
      placeholder: Choose a country
      options:
      - value: ca
        label: Canada
      - value: fr
        label: France
      - value: jp
        label: Japan
  - name: multi-select-roles
    description: Picking any number, where the trigger counts what is selected and
      the popup stays open.
    given:
      label: Roles
      name: roles
      multiple: true
      options:
      - value: frontend
        label: Frontend
      - value: backend
        label: Backend
      - value: design
        label: Design
  - name: forced-native-picker
    description: A form that must work without JavaScript, so the platform's own select
      is rendered on web too.
    given:
      label: Country
      name: country
      native: always
      options:
      - value: ca
        label: Canada
      - value: us
        label: United States
  - name: compact-picker-in-a-header
    description: A small picker whose label is hidden, as in a calendar header.
    given:
      label: Month
      name: month
      hideLabel: true
      size: sm
      options:
      - value: '1'
        label: January
      - value: '2'
        label: February
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: string | string[]`
  - fires on: user
- `onOpenChange`: emit `onOpenChange`
  - payload, positional, in this order: `open: boolean`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)
- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `onOpenChange`); drives state `open`

## Parts and slots

- `label`: component `Text`
- `description`: component `Text`
- `trigger`: element
- `value`: element
- `chevron`: component `Icon`
- `popup`: element
- `listbox`: component `Listbox`; props `options` ← prop `options`
- `errorMessage`: element

## Style bindings

- `triggerBackground`: token `color.background`; part `trigger`; locked
- `triggerBorder`: token `color.border.strong`; part `trigger`; locked
- `triggerBorderFocus`: token `color.border.focus`; part `trigger`; locked
- `triggerBorderInvalid`: token `color.border.danger`; part `trigger`
- `triggerBorderWidth`: token `border.width.thin`; part `trigger`
- `triggerRadius`: token `radius.md`; part `trigger`
- `triggerPaddingInline`: token `space.md`; part `trigger`
- `triggerPaddingBlock`: token `space.sm`; part `trigger`; by `size`: sm → `space.1`, any other value → `space.sm`
- `triggerGap`: token `layout.gap.normal`; part `trigger`
- `valueColor`: token `color.foreground`; part `value`; locked
- `chevron`: token `color.foreground.muted`; part `chevron`; locked
- `labelWeight`: token `font.weight.medium`; part `label`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `popupSurface`: token `color.overlay.surface`; part `popup`
- `popupBorder`: token `color.border`; part `popup`
- `popupShadow`: token `shadow.overlay`; part `popup`
- `popupRadius`: token `radius.md`; part `popup`
- `popupOffset`: token `space.1`; part `popup`

## Keyboard

- `Escape` (Closes the popup without changing the value and returns focus to the trigger.): expect closes, then focus-trigger; target part `popup`
- `Tab` (Commits the active option (single) and closes; focus moves on.): expect closes; target part `popup`

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

- `placeholder`: "Select…"
- `selectedCount`: "{count} selected"; params `count` (number)
- `done`: "Done"
- `required`: "{label} is required."
- `invalid`: "{label} is not valid."
- `requiredIndicator`: " (required)"

## Constants and examples

- example `country-picker`, story `CountryPicker`: given `label: "Country"`, `name: "country"`, `placeholder: "Choose a country"`, `options: [{"value":"ca","label":"Canada"},{"value":"fr","label":"France"},{"value":"jp","label":"Japan"}]`; The everyday single-select field with a placeholder until something is chosen.
- example `multi-select-roles`, story `MultiSelectRoles`: given `label: "Roles"`, `name: "roles"`, `multiple: true`, `options: [{"value":"frontend","label":"Frontend"},{"value":"backend","label":"Backend"},{"value":"design","label":"Design"}]`; Picking any number, where the trigger counts what is selected and the popup stays open.
- example `forced-native-picker`, story `ForcedNativePicker`: given `label: "Country"`, `name: "country"`, `native: "always"`, `options: [{"value":"ca","label":"Canada"},{"value":"us","label":"United States"}]`; A form that must work without JavaScript, so the platform's own select is rendered on web too.
- example `compact-picker-in-a-header`, story `CompactPickerInAHeader`: given `label: "Month"`, `name: "month"`, `hideLabel: true`, `size: "sm"`, `options: [{"value":"1","label":"January"},{"value":"2","label":"February"}]`; A small picker whose label is hidden, as in a calendar header.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `triggerBorderInvalid`, `triggerBorderWidth`, `triggerRadius`, `triggerPaddingInline`, `triggerPaddingBlock`, `triggerGap`, `partGap`, `labelWeight`, `helperSize`, `popupSurface`, `popupBorder`, `popupShadow`, `popupRadius`, `popupOffset`, `layer`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `disabledOpacity`, `enter`
Locked (accessibility-bearing, never overridable): `triggerBackground`, `triggerBorder`, `triggerBorderFocus`, `valueColor`, `placeholderColor`, `chevron`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: Button
props:
- Button
- .popover
- .sheet
- Listbox
- .accessibilityValue
- .accessibilityAddTraits=isButton
- .presentationCompactAdaptation
- FocusScope
notes: "A trigger `Button` (label above, `hideLabel` per Input) showing the value\
  \ text and the `chevron-down` Icon, with `.accessibilityValue(selected labels or\
  \ copy.placeholder)`; the popup is `Listbox embedded` in a `.popover` on regular\
  \ width and a `.sheet` with `.presentationDetents([.medium, .large])` on phones\
  \ \u2014 the doc's `native: always` maps to the sheet on every width. Selection\
  \ closes the popup for single, stays open for `multiple`; the trigger keeps focus\
  \ and the new value is announced. Registers with the Form environment; `size: sm`\
  \ per the Sm bindings."
```

## Guidance

## Overview

A select is the field for "one of these" (or "any of these") when the list is longer than a RadioGroup should show and typing is not the natural way in. It looks like an Input, opens a Listbox, and returns to being a field. On phones it becomes a sheet, because that is what a thumb expects.

## When to use

Use a Select for a form field with about seven to fifty options that people recognise on sight — country, role, status, time zone from a short list, a category. Use `multiple` for tags or memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms that must work without JavaScript. Use Combobox instead when the list is long enough that typing to filter is faster than scrolling, or when free text is allowed.

## When not to use

Do not use a Select for two to six options; use a RadioGroup so every option is visible. Do not use it for actions (Menu), for switching modes (SegmentedControl), or for on/off (Switch). Do not put a Select inside a Menu or a Tooltip.

## Behavior

The trigger shows the selected option's label (or the count / labels for `multiple`, or the placeholder). Activating it, or pressing Enter, Space or an arrow, opens the popup with the Listbox and the selected option active; the Listbox's keyboard model applies while focus visually stays on the trigger. Enter commits and closes (single) or toggles (multiple); Escape closes without changing the value; Tab commits and moves on; clicking outside closes. On close, focus returns to the trigger and `onChange` has fired if the value changed. Validation, `required`, `disabled` and errors work exactly as Input; the Form collects the value or array by `name`. The composed Listbox is `embedded`, receives `selectionFollowsFocus: false` (arrows move the active option; Enter commits) and `defaultActiveValue` set to the current selection so the popup opens with it active. With `multiple` and more than two selections the trigger shows `copy.selectedCount`; two or fewer are joined with a comma and a space. The popup's surface, border, radius and shadow are the popup wrapper's bindings; the Listbox draws none. The phone/tablet switch uses `layout.maxWidth.prose`, and the phone sheet's footer button is `copy.done`. Space commits in the open popup as well as opening it from the trigger: the popup is Listbox's own keyboard model, and this component does not suppress a key that model already handles. The composed Listbox is given no `name`, so it never registers as a field of its own — Select is the field.

## Content guidelines

The label names the field ("Country"); the placeholder is `copy.placeholder` unless a more specific prompt helps ("Choose a role"). Options follow Listbox's rules. With `multiple`, the trigger shows up to two labels joined by commas, then `copy.selectedCount`.

## Accessibility

The trigger is a `combobox` (select-only pattern) with `aria-haspopup="listbox"`, `aria-expanded`, its label association and description/error links, and the popup is a `listbox` (WCAG 4.1.2; APG select-only combobox). The full Listbox keyboard model applies; Escape closes and focus is restored (2.1.2, 2.4.3). Required and invalid are in text and attributes, not color alone (1.4.1, 3.3.1). The trigger meets 44px (2.5.8) and its border 3:1 (1.4.11). On phones the sheet is modal with the same guarantees as BottomSheet.

## Platform notes

### Web
Render the label (`<label for>`), description, `<button type="button" role="combobox" id aria-haspopup="listbox" aria-expanded aria-controls={listboxId} aria-labelledby={labelId + valueId} aria-describedby aria-invalid aria-required>` containing the value span and `<Icon name="chevron-down">`, the error region, and a hidden `<input name>` per selected value. The popup is a portal (`position: fixed`, from the trigger rect, flip on overflow, `min-inline-size` = trigger width, `layer.dropdown`) containing `<Listbox>` with `labelledBy={labelId}`; forward keydown from the trigger to the Listbox's handler while open; close on `pointerdown` outside and on `focusout` to outside. `native: always`: `<select>`/`<select multiple>` with the same wrapper and `appearance: none` styling plus the chevron.

### Lit
`<ds-select label="Country" name="country" .options=${…}>`; form-associated (`DsFormField`); `<ds-listbox>` in the shadow root; popup via `popover="manual"` when available; composed `change`, `open-change`.

### React Native
`Pressable` with `accessibilityRole="combobox"`, `accessibilityLabel={label}`, `accessibilityHint={description}`, `accessibilityState={{ expanded, disabled }}`, `accessibilityValue={{ text }}`; opens `BottomSheet` (phones) or a positioned popup `Modal` (tablets/web) containing `Listbox`; the sheet's footer has a Done button for `multiple`. Form registration as Input.

## Related

Listbox, Combobox, RadioGroup, Input, BottomSheet.

## Behavior scenarios (16)

One test per scenario, in this order.

```yaml
- name: the-trigger-opens-the-popup
  given:
    open: false
  when:
    click: trigger
  then:
  - event: onOpenChange
- name: a-closed-select-is-not-expanded
  given:
    open: false
  then:
  - state: expanded
    is: false
- name: an-open-select-reports-the-expanded-state
  description: The trigger is the combobox, so aria-expanded on it is what announces
    the popup.
  given:
    open: true
  then:
  - state: expanded
    is: true
- name: the-placeholder-shows-when-nothing-is-selected
  given:
    open: false
  then:
  - copy: placeholder
- name: a-custom-placeholder-replaces-the-default
  given:
    open: false
    placeholder: Choose a country
  then:
  - text: Choose a country
- name: a-disabled-select-does-not-open
  description: Disabled selects stay visible and focusable but cannot be opened and
    are not submitted.
  given:
    open: false
    disabled: true
  when:
    click: trigger
  then:
  - event: onOpenChange
    fired: false
- name: required-is-shown-in-the-label
  description: required is shown in the label, not only by color.
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-size-sm
  given:
    size: sm
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-native-auto
  given:
    native: auto
  then:
  - renders: true
  derived: true
- name: renders-native-always
  given:
    native: always
  then:
  - renders: true
  derived: true
- name: renders-native-never
  given:
    native: never
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
