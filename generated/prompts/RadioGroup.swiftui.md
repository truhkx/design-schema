# Generate: RadioGroup for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/RadioGroup.swift` declaring `public struct RadioGroup: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/RadioGroupBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+RadioGroup.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("RadioGroup") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("RadioGroup")` on the root and `"RadioGroup.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: RadioGroup
  category: input
  status: review
  apg: radio
  anatomy:
  - group
  - legend
  - description
  - radio
  - radioIndicator
  - radioLabel
  - radioDescription
  - errorMessage
  props:
    label:
      type: string
      required: true
      description: The group's legend — the question the options answer. Always visible.
      a11y: Rendered as the fieldset legend on web; as the group's accessibilityLabel
        on native.
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form. Also links the radios into
        one native group on web.
    options:
      type: array
      required: true
      shape: '{ value: string; label: string; description?: string; disabled?: boolean
        }[]'
      description: The options in display order. Two to about seven; more than that
        is a Select (planned). Values are short identifiers (letters, digits, dashes)
        — they become element ids. Export the item type as `RadioGroupOption`.
    value:
      type: string
      description: Controlled selected value. Omit for an uncontrolled group.
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: Initial selection for an uncontrolled group. Omit to start with
        nothing selected.
    orientation:
      type: enum
      values:
      - vertical
      - horizontal
      default: vertical
      description: Layout of the options. Horizontal only for two or three short labels;
        it wraps rather than overflows.
    required:
      type: boolean
      default: false
      description: An option must be selected to submit. Shown in the legend, not
        only by color.
    invalid:
      type: boolean
      default: false
      description: Marks the group as failing validation. Usually set by the Form;
        can be set directly.
    disabled:
      type: boolean
      default: false
      description: Disables every option. Individual options use `options[].disabled`.
    description:
      type: string
      description: Persistent helper text under the legend.
      a11y: Linked to the group with aria-describedby / accessibilityHint.
    error:
      type: string
      description: The group's error message. Setting it marks the group invalid.
      a11y: Rendered once under the group with role=alert and linked with aria-describedby
        on the group.
  events:
    onChange:
      description: Fired when the selection changes, with the new option value.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: value
        type: string
        description: The value of the selected option.
      fires:
      - user
  keyboard:
  - keys:
    - Tab
    action: Moves into the group, to the selected radio (the first when none is selected);
      from inside, leaves the group — one tab stop.
    from: any
    expect: manual
  - keys:
    - ArrowDown
    - ArrowRight
    action: Moves to and selects the next enabled radio, wrapping.
    from: first
    expect: focus-next
  - keys:
    - ArrowUp
    - ArrowLeft
    action: Moves to and selects the previous enabled radio, wrapping.
    from: last
    expect: focus-prev
  - keys:
    - ' '
    action: Selects the focused radio when the arrows did not already select it.
    from: inside
    expect: manual
  styles:
    controlBackground:
      token: color.control.background
      locked: true
    controlBorder:
      token: color.control.border
      locked: true
    controlBorderWidth:
      token: border.width.thin
      locked: false
    controlSelectedBackground:
      token: color.control.selectedBackground
      description: Selected border color; the fill stays controlBackground and the
        dot is drawn inside.
      locked: true
    indicator:
      token: color.control.selectedBackground
      description: The centre dot, controlSize minus 2 × space.1 in diameter.
      locked: true
    controlBorderInvalid:
      token: color.border.danger
      locked: false
    controlSize:
      token: space.5
      locked: false
    controlRadius:
      token: radius.full
      locked: false
    optionGap:
      token: space.2
      description: Horizontal gap between radio and its label.
      locked: false
    listGap:
      token: space.2
      description: Gap between options (vertical or horizontal).
      locked: false
    partGap:
      token: space.1
      description: Vertical gap between legend, description, list, and error.
      locked: false
    legendColor:
      token: color.foreground
      part: legend
      locked: true
    legendSize:
      token: font.size.md
      part: legend
      locked: false
    legendWeight:
      token: font.weight.medium
      part: legend
      locked: false
    labelColor:
      token: color.foreground
      locked: true
    labelSize:
      token: font.size.md
      locked: false
    labelWeight:
      token: font.weight.regular
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
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    minTarget:
      token: size.target.comfortable
      description: Minimum height of each option row; the whole row is the hit area.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      locked: false
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
    position:
      text: '{index} of {total}'
      params:
        index:
          type: number
          description: The option's position in the group.
        total:
          type: number
          description: How many options the group has.
  a11y:
    role: radiogroup
    requires:
    - label-association
    - arrow-navigation
    - roving-tabindex
    - error-identification
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    contrast:
    - foreground: color.control.selectedBackground
      background: color.control.background
      level: AA
      nonText: true
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.border
      background: color.background
      level: AA
      nonText: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.danger
      background: color.background
      level: AA
  form:
    role: field
    value: value
    valueType: string
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
      element: fieldset
      attributes:
      - role=radiogroup
      - aria-describedby
      - aria-invalid
      - aria-required
      notes: 'A <fieldset role="radiogroup"> with a <legend>, containing native <input
        type="radio" name> elements styled with appearance: none. The role is set
        explicitly: a fieldset''s implicit role is `group`, which is not what this
        component declares. The radioIndicator part is a ::after pseudo-element with
        no node of its own, so it carries no hook on any platform; shadow parts elsewhere
        are the anatomy names in kebab-case (`radio-label`, `radio-description`, `error-message`).
        Native radios sharing a name already implement roving tabindex and arrow-key
        movement; do not reimplement it. A disabled option uses the real `disabled`
        attribute so native arrow movement skips it (the one place the system prefers
        `disabled` over aria-disabled); a disabled group uses aria-disabled on the
        fieldset and every radio plus preventDefault guards, so it stays focusable
        but inert. Each radio has its own <label for>; option descriptions are linked
        per radio with aria-describedby. The group error is linked from the fieldset.'
    lit:
      tag: ds-radio-group
      reflect:
      - orientation
      - required
      - disabled
      - invalid
      notes: Form-associated (setFormValue(value)). The radios are rendered inside
        the shadow root from the `options` property, so they share one root and native
        grouping by name works; the native change is not composed, so re-dispatch
        a composed `change` CustomEvent with detail { value }. `options` is a property,
        not an attribute.
    rn:
      element: View
      props:
      - accessibilityRole=radiogroup
      - accessibilityLabel
      - accessibilityHint
      notes: The group is a View with accessibilityRole="radiogroup"; each option
        is a Pressable with accessibilityRole="radio" and accessibilityState={{ checked,
        disabled }}. There is no roving tabindex or arrow movement on native — every
        radio is a stop for the screen reader and for hardware-keyboard focus. That
        is the platform convention, not a defect. Validation precedence is Input's
        (error → required → invalid with copy.invalid). Individually disabled options
        use accessibilityState.disabled and a press guard, never the Pressable `disabled`
        prop, so they stay reachable.
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - Button
      - .accessibilityAddTraits=isSelected
      - .focusable
      - .onMoveCommand
      - '@FocusState'
      notes: 'A container `.accessibilityElement(children: .contain)` named by the
        legend, holding one `Button` per option that draws the radio circle from the
        tokens and carries `.isSelected` for the checked option (VoiceOver: ''Email,
        selected, button, 1 of 3'' — the count is announced from `.accessibilityValue(copy.position)`).
        Arrow keys on iPad move the selection through `@FocusState` per the keyboard
        table (`.onMoveCommand`); the group is one focus section. `orientation` picks
        `VStack`/`HStack`. Registers with the Form environment as one field.'
  behavior:
  - name: click-on-an-option-reports-its-value
    description: Clicking an option selects it and fires onChange with that option's
      value.
    when:
      click: radio
    then:
    - event: onChange
      with: standard
  - name: click-on-an-option-label-selects-it
    description: The whole option row is the hit area; each radio has its own label
      element.
    when:
      click: radioLabel
    then:
    - event: onChange
      with: standard
  - name: disabled-option-cannot-be-selected
    description: A disabled option uses the native disabled attribute, so it is skipped
      and cannot be chosen.
    given:
      options:
      - value: standard
        label: Standard
        disabled: true
      - value: express
        label: Express
    when:
      click: radio
    then:
    - event: onChange
      fired: false
  - name: disabled-group-is-inert
    description: A fully disabled group stays visible and focusable but selects nothing.
    given:
      disabled: true
    when:
      click: radio
    then:
    - event: onChange
      fired: false
    - state: disabled
      is: true
      platforms:
      - web
  - name: required-is-shown-in-the-legend
    description: required appends copy.requiredIndicator to the legend, not only a
      color.
    given:
      required: true
    then:
    - copy: requiredIndicator
  - name: invalid-renders-the-invalid-copy
    description: Validation precedence is error, then required, then invalid; with
      only invalid set the group renders copy.invalid and is marked invalid.
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
  - name: shipping-method
    description: Three options with a description each, the usual vertical form.
    given:
      label: Shipping method
      name: shipping
      options:
      - value: standard
        label: Standard
        description: Free, 3 to 5 business days
      - value: express
        label: Express
        description: Next business day
      - value: pickup
        label: Pick up in store
        description: Ready in 2 hours
  - name: horizontal-pair
    description: Two short labels laid out horizontally.
    given:
      label: Send a receipt
      name: receipt
      orientation: horizontal
      options:
      - value: 'yes'
        label: 'Yes'
      - value: 'no'
        label: 'No'
  - name: required-with-a-group-error
    description: A required group the Form has marked invalid, with one error under
      the whole group.
    given:
      label: Plan
      name: plan
      required: true
      error: Choose a plan to continue.
      options:
      - value: free
        label: Free
      - value: pro
        label: Pro
  - name: with-a-disabled-option
    description: An option that is not available, skipped by arrow movement.
    given:
      label: Delivery window
      name: window
      defaultValue: morning
      options:
      - value: morning
        label: Morning
      - value: evening
        label: Evening
        disabled: true
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: string`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Style bindings

- `legendColor`: token `color.foreground`; part `legend`; locked
- `legendSize`: token `font.size.md`; part `legend`
- `legendWeight`: token `font.weight.medium`; part `legend`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: string
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

- `required`: "{label} is required."
- `invalid`: "{label} is not valid."
- `requiredIndicator`: " (required)"
- `position`: "{index} of {total}"; params `index` (number), `total` (number)

## Constants and examples

- example `shipping-method`, story `ShippingMethod`: given `label: "Shipping method"`, `name: "shipping"`, `options: [{"value":"standard","label":"Standard","description":"Free, 3 to 5 business days"},{"value":"express","label":"Express","description":"Next business day"},{"value":"pickup","label":"Pick up in store","description":"Ready in 2 hours"}]`; Three options with a description each, the usual vertical form.
- example `horizontal-pair`, story `HorizontalPair`: given `label: "Send a receipt"`, `name: "receipt"`, `orientation: "horizontal"`, `options: [{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]`; Two short labels laid out horizontally.
- example `required-with-a-group-error`, story `RequiredWithAGroupError`: given `label: "Plan"`, `name: "plan"`, `required: true`, `error: "Choose a plan to continue."`, `options: [{"value":"free","label":"Free"},{"value":"pro","label":"Pro"}]`; A required group the Form has marked invalid, with one error under the whole group.
- example `with-a-disabled-option`, story `WithADisabledOption`: given `label: "Delivery window"`, `name: "window"`, `defaultValue: "morning"`, `options: [{"value":"morning","label":"Morning"},{"value":"evening","label":"Evening","disabled":true}]`; An option that is not available, skipped by arrow movement.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `controlBorderWidth`, `controlBorderInvalid`, `controlSize`, `controlRadius`, `optionGap`, `listGap`, `partGap`, `legendSize`, `legendWeight`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `controlBackground`, `controlBorder`, `controlSelectedBackground`, `indicator`, `legendColor`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth`, `minTarget`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .accessibilityElement=contain
- .accessibilityLabel
- Button
- .accessibilityAddTraits=isSelected
- .focusable
- .onMoveCommand
- '@FocusState'
notes: "A container `.accessibilityElement(children: .contain)` named by the legend,\
  \ holding one `Button` per option that draws the radio circle from the tokens and\
  \ carries `.isSelected` for the checked option (VoiceOver: 'Email, selected, button,\
  \ 1 of 3' \u2014 the count is announced from `.accessibilityValue(copy.position)`).\
  \ Arrow keys on iPad move the selection through `@FocusState` per the keyboard table\
  \ (`.onMoveCommand`); the group is one focus section. `orientation` picks `VStack`/`HStack`.\
  \ Registers with the Form environment as one field."
```

## Guidance

## Overview

A radio group asks one question and takes one answer. Its strength is that every option is visible at once, so the user can compare before choosing; its cost is vertical space, which is why it suits short sets.

## When to use

Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give options a `description` when the label alone does not tell them apart. Set `defaultValue` when there is a sensible default; leave the group unselected when the choice is consequential and you want a deliberate answer.

## When not to use

Do not use a RadioGroup for more than about seven options or for options the user must scroll to see; use Select (planned). Do not use it for a yes/no; use Checkbox or Switch. Do not use it for an immediate mode switch in a toolbar; that is a SegmentedControl (planned). Do not let a user deselect: once a radio is chosen, one is always chosen.

## Behavior

Clicking or tapping an option row selects it and fires `onChange` with its value. From the keyboard, Tab moves into the group (to the selected radio, or the first when none is selected), arrow keys move the selection between enabled options and wrap around, and Space selects a focused radio that the arrows did not already select. Tab leaves the group. Individual disabled options are natively disabled and skipped by the arrows; they stay visible and readable but are not focus stops — a deliberate exception to the system's aria-disabled rule, because a radio that can be reached but not chosen is more confusing than one that is skipped. Uncontrolled unless `value` is provided. Disabled options are skipped by arrow movement and cannot be selected; a fully `disabled` group is focusable but inert. `required` appends `copy.requiredIndicator` to the legend and sets `aria-required` on the group; on a failed submit the Form renders `copy.required` as the group error. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`) — the same order as Input. Inside a Form, `validate: blur` runs when focus leaves the whole group, not when it moves between radios; the Form collects the selected value, or nothing (no key) when none is selected. Inside a Fieldset the field reads `FieldsetContext`: `disabled` from the group applies as if set on the field, and on native the legend prefixes the accessibility label ("Shipping address, Street").

## Content guidelines

The legend is a question or a noun phrase for what is being chosen ("Shipping method"). Option labels are parallel — all nouns or all short phrases — sentence case, and never end in a full stop. Put the recommended or most common option first, not the default; `defaultValue` marks the default. Option descriptions are one line: price, timing, consequence.

## Accessibility

The group is exposed with role `radiogroup` (native `fieldset`/`legend` on web) and its legend is the group's accessible name (WCAG 1.3.1, 3.3.2); each radio's name is its own label. Selection is exposed as checked state (4.1.2) and shown by the dot, not by color alone (1.4.1). The group follows the APG radio pattern for keyboard: one tab stop, arrows to move and select (2.1.1). Description and error are linked from the group (3.3.1), with the error announced when it appears. Each option row reaches the 44px target (2.5.8). Selected and rest control borders meet 3:1 on the page background (1.4.11); the build checks the pairs.

## Platform notes

### Web
Render `<fieldset role="radiogroup">` with `<legend>` and, per option, `<input type="radio" name value id>` plus `<label for>`; style the input with `appearance: none` and draw the ring and dot with the control tokens. Native radios with a shared `name` provide roving tabindex and arrow movement, so do not add `tabindex` or key handlers. Link the group description and error to the `<fieldset>` with `aria-describedby`, and per-option descriptions to their radio. Per-option `disabled` is the native attribute; group `disabled` is `aria-disabled` on the fieldset and radios with `preventDefault()` guards. Option ids are `${groupId}-${value}`. A `<legend>` does not take part in the fieldset's flex gap, so `partGap` below it is a margin.

### Lit
`<ds-radio-group>` takes `options` as a property (`.options=${[...]}`) and renders the fieldset and radios inside its shadow root, where the shared `name` groups them natively. It is form-associated: `setFormValue(value)` on change, and `checkValidity()` / `reportValidity()` implement `required`. Re-dispatch a composed `change` CustomEvent with `detail: { value }`. Reflect `orientation`, `required`, `disabled` and `invalid`.

### React Native
Render a `View` with `accessibilityRole="radiogroup"`, `accessibilityLabel={label}` and `accessibilityHint={description}` — not `accessible`, or the radios would collapse into it; on iOS this means the legend reaches VoiceOver as the preceding `Text`, not as a group name (platform limit) — a `Text` legend, and one `Pressable` per option with `accessibilityRole="radio"`, `accessibilityLabel` (label plus description), and `accessibilityState={{ checked: value === option.value, disabled }}`. Arrow-key movement does not exist on native; every radio is its own focus stop, and there is no group-level blur, so `validate: blur` runs on change. On a failed submit the Form focuses the first enabled radio. The group error is announced as in Input.

## Related

Checkbox, Switch, Form, Select (planned).

## Behavior scenarios (10)

One test per scenario, in this order.

```yaml
- name: click-on-an-option-reports-its-value
  description: Clicking an option selects it and fires onChange with that option's
    value.
  when:
    click: radio
  then:
  - event: onChange
    with: standard
- name: click-on-an-option-label-selects-it
  description: The whole option row is the hit area; each radio has its own label
    element.
  when:
    click: radioLabel
  then:
  - event: onChange
    with: standard
- name: disabled-option-cannot-be-selected
  description: A disabled option uses the native disabled attribute, so it is skipped
    and cannot be chosen.
  given:
    options:
    - value: standard
      label: Standard
      disabled: true
    - value: express
      label: Express
  when:
    click: radio
  then:
  - event: onChange
    fired: false
- name: disabled-group-is-inert
  description: A fully disabled group stays visible and focusable but selects nothing.
  given:
    disabled: true
  when:
    click: radio
  then:
  - event: onChange
    fired: false
- name: required-is-shown-in-the-legend
  description: required appends copy.requiredIndicator to the legend, not only a color.
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: invalid-renders-the-invalid-copy
  description: Validation precedence is error, then required, then invalid; with only
    invalid set the group renders copy.invalid and is marked invalid.
  given:
    invalid: true
  then:
  - copy: invalid
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-orientation-vertical
  given:
    orientation: vertical
  then:
  - renders: true
  derived: true
- name: renders-orientation-horizontal
  given:
    orientation: horizontal
  then:
  - renders: true
  derived: true
- name: error-is-identified
  given:
    error: Fix this before continuing.
  then:
  - text: Fix this before continuing.
  derived: true
```
