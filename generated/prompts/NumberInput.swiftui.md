# Generate: NumberInput for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/NumberInput.swift` declaring `public struct NumberInput: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/NumberInputBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+NumberInput.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("NumberInput") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("NumberInput")` on the root and `"NumberInput.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: NumberInput
  category: input
  status: review
  apg: spinbutton
  anatomy:
  - label
  - description
  - field
  - input
  - decrementButton
  - incrementButton
  - prefix
  - suffix
  - errorMessage
  composition:
    description: Text
    decrementButton: Button
    incrementButton: Button
  props:
    label:
      type: string
      required: true
      description: Visible label.
      a11y: label/for on the input; accessibilityLabel on native.
    name:
      type: string
      required: true
      description: Field name for the Form. No platform's Form (web/rn FormContext,
        Lit DsFormField/ds-form) has a number type, so the value registers as its
        plain decimal string — String(value), "." decimal, no grouping, currency symbol,
        percent sign or affixes ("1234.5", "25" for 25%) — and an empty or disabled
        field registers nothing (undefined on web/rn, null currentValue on Lit). Consumers
        parse it back with Number().
    value:
      type: number
      description: 'Controlled numeric value, typed `number | null | undefined`: `null`
        is a controlled empty field, `undefined` means uncontrolled (defaultValue
        applies). While the input is focused it shows the raw typed text, so typing
        is never swallowed; the controlled value takes over the display on blur/Enter
        (re-formatted), on every step, and whenever the prop changes to a number different
        from the parsed typed text.'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: number
      description: Initial value.
    min:
      type: number
      description: Lower bound; values are clamped on blur and the decrement button
        disables at it.
    max:
      type: number
      description: Upper bound.
    step:
      type: number
      default: 1
      description: Increment for the buttons and arrow keys. When `precision` is omitted,
        values round to the number of decimals in `step` (step 0.25 → 2 places); values
        never snap to multiples of `step`, so a typed 12 with step 5 stays 12.
    precision:
      type: integer
      description: Decimal places to keep and display. Defaults to the decimals in
        `step`.
    format:
      type: enum
      values:
      - decimal
      - currency
      - percent
      - unit
      default: decimal
      description: 'Locale formatting of the displayed value via Intl.NumberFormat:
        thousands separators, currency symbol (`currency` prop), percent, or a unit
        (`unit` prop). The underlying value is always a plain number.'
    currency:
      type: string
      description: 'ISO 4217 code for `format: currency` (e.g. USD).'
    unit:
      type: string
      description: 'Intl unit identifier for `format: unit` (e.g. kilogram, hour).
        A string Intl does not know is shown as `trailingText` (the `suffix` part)
        when `trailingText` is not given, with plain decimal formatting.'
    leadingText:
      type: string
      description: 'Static text before the value inside the field ("$"), when `format`
        cannot express it. (Not `prefix`: that name is a native Element member.)'
    trailingText:
      type: string
      description: Static text after the value inside the field ("kg", "%"). Also
        the literal shown when `unit` is not a valid Intl unit.
    hideSteppers:
      type: boolean
      default: false
      description: Hide the increment/decrement buttons. Arrow keys work regardless.
    placeholder:
      type: string
      description: Example value shown while empty.
    description:
      type: string
      description: Helper text.
    required:
      type: boolean
      default: false
      description: Must have a value to submit.
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name). Only
        for a field whose context already names it: a DataGrid cell editor, a Search.'
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      default: md
      description: 'sm for fields inside grid cells and toolbars: minimum target height,
        tighter padding, small type.'
    disabled:
      type: boolean
      default: false
      description: Not editable, not submitted, still readable.
    invalid:
      type: boolean
      default: false
      description: Marks the field invalid.
    error:
      type: string
      description: Error message; implies invalid.
  events:
    onChange:
      description: Fired when the numeric value changes (on each valid keystroke,
        step, and on blur after clamping/rounding), with the number or undefined.
      platforms:
        web: onChange
        lit: change
        rn: onChangeText
        swiftui: onChange
      payload:
      - name: value
        type: union
        shape: number | undefined
        description: The new numeric value; undefined when the field is empty.
      fires:
      - user
  keyboard:
  - keys:
    - ArrowUp
    action: Increases by `step` (clamped to max).
    from: first
    expect: manual
  - keys:
    - ArrowDown
    action: Decreases by `step` (clamped to min).
    from: first
    expect: manual
  - keys:
    - PageUp
    - PageDown
    action: Changes by ten steps (10 × `step`, clamped); the 10 is a count, not a
      style value.
    from: first
    expect: manual
  - keys:
    - Home
    - End
    action: 'Sets min / max when they are defined (component code, not native: a text
      input cannot do this); otherwise the key is left to the input''s native caret
      movement.'
    from: first
    expect: manual
  - keys:
    - Enter
    action: Commits (rounds and clamps) the typed value; inside a Form, submits.
    from: first
    expect: manual
  styles:
    background:
      token: color.background
      locked: true
    foreground:
      token: color.foreground
      locked: true
    placeholder:
      token: color.foreground.muted
      locked: true
    border:
      token: color.border.strong
      locked: true
    borderFocus:
      token: color.border.focus
      part: field
      description: The focus ring is drawn on the bordered field part while the input
        matches :focus-visible; the input itself has no border.
      locked: true
    borderInvalid:
      token: color.border.danger
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.md
      locked: false
    paddingInline:
      token: space.md
      by: size
      values:
        sm: space.2
      part: field
      description: The field's inline-start padding; its inline-end padding only when
        the steppers are hidden, since the stepper Buttons sit flush at the end.
      locked: false
    paddingBlock:
      token: space.sm
      by: size
      values:
        sm: space.1
      locked: false
    affixColor:
      token: color.foreground.muted
      description: Prefix and suffix text.
      locked: true
    affixGap:
      token: layout.gap.tight
      locked: false
    stepperGap:
      token: layout.gap.none
      description: The two stepper Buttons sit flush at the end of the field, separated
        from the input by a hairline.
      locked: false
    stepperDivider:
      token: color.border
      locked: false
    stepperDividerWidth:
      token: border.width.thin
      description: Width of the hairline between the input and the steppers (the inline-start
        border of the element wrapping both stepper Buttons).
      locked: false
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
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    minTargetSm:
      token: size.target.min
      description: The field height floor at size sm. The stepper Buttons are Button
        size sm at both field sizes.
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: field
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: 'Applied to the label, description, input and affix parts of a
        disabled field, not to an element containing the steppers: the stepper Buttons
        receive `disabled` (at a bound, or when the field is disabled) and dim once
        through their own disabled style.'
      locked: false
  copy:
    increment: Increase
    decrement: Decrease
    required: '{label} is required.'
    invalid: '{label} must be a number.'
    outOfRange: '{label} must be between {min} and {max}.'
    outOfRangeMin: '{label} must be {min} or more.'
    outOfRangeMax: '{label} must be {max} or less.'
    currencyMissing: format "currency" needs a currency code.
    requiredIndicator: ' (required)'
  a11y:
    role: spinbutton
    requires:
    - label-association
    - accessible-name
    - error-identification
    - keyboard-operable
    - arrow-navigation
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
    valueType: number
    name: name
    validation:
    - required
    - invalid
    - range
    messages:
      required: required
      invalid: invalid
      range: outOfRange
    discovery: context
  platforms:
    web:
      element: input
      attributes:
      - type=text
      - inputmode=decimal
      - role=spinbutton
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-describedby
      - aria-invalid
      - aria-required
      - autocomplete=off
      notes: 'An <input type="text" inputmode="decimal" role="spinbutton"> rather
        than type="number": the native number input cannot format, drops leading zeros,
        scrolls its value on wheel, and its spin buttons are unstyleable and tiny.
        The value is parsed from the locale format on input (accepting both the locale''s
        and "." decimal separators) and re-formatted on blur. aria-valuenow/text mirror
        the number. Steppers are the system Button (ghost, sm, iconOnly, plus/minus
        icons) with tabindex="-1" — the input is the single tab stop and the arrows
        do the same job; the buttons are pointer conveniences and repeat while held.
        Web Button forces data-part="container" on its root, so each Button sits in
        a <span> NumberInput owns carrying data-part="decrementButton"/"incrementButton"
        and the pointer/click handlers; aria-hidden="true" goes on the element wrapping
        both spans (not on the Buttons), and the Buttons get `disabled` at a bound
        or when the field is disabled. Parsing: "." is read as the decimal separator
        only when the locale''s decimal separator is absent from the text (so de-DE
        "1.234,5" is 1234.5, and "1.5" is 1.5). There is no React FieldsetContext:
        Fieldset passes `disabled` to its direct child fields, and NumberInput uses
        only that prop; the legend is not used.'
    lit:
      tag: ds-number-input
      reflect:
      - format
      - size
      - required
      - disabled
      - invalid
      - hideSteppers
      notes: 'Form-associated; setFormValue with the plain number as a string. Implements
        DsFormField: currentValue is that decimal string, or null when empty; a public
        `valueAsNumber` getter returns the number (or undefined). Composed `change`
        with detail { value }. Carries data-ds-field, so ds-fieldset sets its `disabled`
        property (plus formDisabledCallback); the legend is not used. Steppers in
        the shadow root are ds-button (ghost, sm, iconOnly) with tabindex="-1" inside
        an aria-hidden wrapper; each carries its data-part on a wrapper span as on
        web. The focus ring is drawn on the field part while the input matches :focus-visible.'
    rn:
      element: TextInput
      props:
      - keyboardType=decimal-pad
      - accessibilityRole=adjustable
      - accessibilityLabel
      - accessibilityValue
      - accessibilityActions
      notes: 'TextInput with keyboardType="decimal-pad" (numbers-and-punctuation on
        iOS for negatives), accessibilityRole="adjustable" with increment/decrement
        accessibility actions so VoiceOver/TalkBack can step without the buttons,
        accessibilityValue text from the formatted value. Formatting uses Intl.NumberFormat
        (Hermes supports it). Use numbers-and-punctuation on iOS when negatives are
        possible — `min` absent or below zero — and decimal-pad otherwise. Steppers
        are system Buttons beside the input, accessibilityElementsHidden since the
        adjustable actions cover them; Button exposes only `onPress`, so they step
        once per tap and do not repeat while held — the adjustable actions are the
        way to step repeatedly here. An adjustable role and a directly typable field
        are in tension on this platform: screen readers favour swipe-to-adjust and
        may make double-tap-to-edit unreliable. That is the native trade, and the
        role stays, because stepping without the buttons matters more. Keys: ArrowUp/Down,
        PageUp/Down and Home/End are handled in TextInput onKeyPress, which delivers
        them on react-native-web and on hardware keyboards that report them; iOS onKeyPress
        generally does not deliver arrow, page or Home/End keys, so there the adjustable
        increment/decrement actions are the only stepping path, and jumping to min/max
        has no native equivalent (no accessibility action exists for it — a screen-reader
        user steps or types the bound). The steppers sit in a View with accessibilityElementsHidden
        and importantForAccessibility="no-hide-descendants"; each Button is wrapped
        in a View carrying testID `NumberInput.decrementButton` / `NumberInput.incrementButton`,
        since Button takes no testID. Button has no way to leave the focus order,
        so on react-native-web the hidden steppers remain focusable Pressables — a
        known Button limitation, not a NumberInput choice. FieldsetContext is read:
        a Fieldset''s `disabled` disables the field and its legend prefixes the accessibilityLabel
        ("Shipping, Weight"), as Input does. accessibilityValue.text is the same string
        as web aria-valuetext, affixes included.'
    swiftui:
      element: TextField
      props:
      - TextField
      - .keyboardType=decimalPad
      - Button
      - .accessibilityAdjustableAction
      - .accessibilityValue
      - .onKeyPress
      - NumberFormatter
      - Locale
      notes: 'Input''s wrapper with a `TextField` (`.keyboardType(.decimalPad)` or
        `.numberPad` when `precision` is 0 and `min` ≥ 0) between the decrement/increment
        `Button`s (`minus`/`plus` Icons, hidden with `hideSteppers`); the field is
        one element with `.accessibilityValue(formatted)` and `.accessibilityAdjustableAction`
        stepping by `step` (VoiceOver swipe up/down), which is the spinbutton equivalent.
        Formatting through `NumberFormatter`/`Locale.current` for `format: decimal|currency|unit`,
        parsing leniently as the doc describes; ArrowUp/Down/PageUp/PageDown/Home/End
        on iPad via `.onKeyPress`. Registers with the Form environment as a `Double`.
        `size: sm` per the Sm bindings.'
  behavior:
  - name: the-increment-button-steps-up
    given:
      defaultValue: 5
      step: 1
    when:
      click: incrementButton
    then:
    - event: onChange
  - name: the-decrement-button-steps-down
    given:
      defaultValue: 5
      step: 1
    when:
      click: decrementButton
    then:
    - event: onChange
  - name: arrow-up-increases-by-one-step
    given:
      defaultValue: 5
    when:
      key: ArrowUp
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: arrow-down-decreases-by-one-step
    given:
      defaultValue: 5
    when:
      key: ArrowDown
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: page-up-changes-by-ten-steps
    given:
      defaultValue: 5
    when:
      key: PageUp
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: arrow-keys-work-without-the-steppers
    description: hideSteppers hides the buttons; the arrow keys do the same job regardless.
    given:
      defaultValue: 5
      hideSteppers: true
    when:
      key: ArrowUp
    then:
    - event: onChange
    platforms:
    - web
    - lit
  - name: typing-a-number-reports-it
    when:
      type: '7'
    then:
    - event: onChange
  - name: decrement-does-nothing-at-the-minimum
    description: The decrement button disables at min, so there is no value below
      it to report.
    given:
      defaultValue: 0
      min: 0
      max: 10
    when:
      click: decrementButton
    then:
    - event: onChange
      fired: false
  - name: a-disabled-field-does-not-step
    given:
      disabled: true
      defaultValue: 5
    when:
      click: incrementButton
    then:
    - event: onChange
      fired: false
  - name: the-field-reports-its-value-and-bounds
    description: The spinbutton carries valuenow/min/max, which is how the value is
      announced.
    given:
      defaultValue: 4
      min: 0
      max: 10
    then:
    - attribute: aria-valuenow
      is: '4'
    - attribute: aria-valuemin
      is: '0'
    - attribute: aria-valuemax
      is: '10'
    platforms:
    - web
  examples:
  - name: quantity
    description: The everyday bounded counter with its step buttons.
    given:
      label: Quantity
      name: quantity
      min: 1
      max: 99
      defaultValue: 1
  - name: price-in-currency
    description: A money field formatted for the locale, stepping by cents.
    given:
      label: Price
      name: price
      format: currency
      currency: USD
      step: 0.01
      defaultValue: 19.99
  - name: percentage
    description: A percentage bounded to nought and a hundred, stepping by five.
    given:
      label: Discount
      name: discount
      format: percent
      min: 0
      max: 100
      step: 5
      defaultValue: 10
  - name: compact-cell-editor
    description: A small field inside a grid cell, named by its column, with no steppers
      and a unit after the value.
    given:
      label: Weight
      name: weight
      size: sm
      hideLabel: true
      hideSteppers: true
      trailingText: kg
      defaultValue: 2
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: number | undefined`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Style bindings

- `borderFocus`: token `color.border.focus`; part `field`; locked
- `paddingInline`: token `space.md`; part `field`; by `size`: sm → `space.2`, any other value → `space.md`
- `paddingBlock`: token `space.sm`; by `size`: sm → `space.1`, any other value → `space.sm`
- `labelWeight`: token `font.weight.medium`; part `label`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `focusRingWidth`: token `border.width.focus`; part `field`; locked

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: number
  name: name
  validation:
  - required
  - invalid
  - range
  messages:
    required: required
    invalid: invalid
    range: outOfRange
  discovery: context
```

## Constants and examples

- example `quantity`, story `Quantity`: given `label: "Quantity"`, `name: "quantity"`, `min: 1`, `max: 99`, `defaultValue: 1`; The everyday bounded counter with its step buttons.
- example `price-in-currency`, story `PriceInCurrency`: given `label: "Price"`, `name: "price"`, `format: "currency"`, `currency: "USD"`, `step: 0.01`, `defaultValue: 19.99`; A money field formatted for the locale, stepping by cents.
- example `percentage`, story `Percentage`: given `label: "Discount"`, `name: "discount"`, `format: "percent"`, `min: 0`, `max: 100`, `step: 5`, `defaultValue: 10`; A percentage bounded to nought and a hundred, stepping by five.
- example `compact-cell-editor`, story `CompactCellEditor`: given `label: "Weight"`, `name: "weight"`, `size: "sm"`, `hideLabel: true`, `hideSteppers: true`, `trailingText: "kg"`, `defaultValue: 2`; A small field inside a grid cell, named by its column, with no steppers and a unit after the value.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `affixGap`, `stepperGap`, `stepperDivider`, `stepperDividerWidth`, `partGap`, `labelWeight`, `helperSize`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `affixColor`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: TextField
props:
- TextField
- .keyboardType=decimalPad
- Button
- .accessibilityAdjustableAction
- .accessibilityValue
- .onKeyPress
- NumberFormatter
- Locale
notes: "Input's wrapper with a `TextField` (`.keyboardType(.decimalPad)` or `.numberPad`\
  \ when `precision` is 0 and `min` \u2265 0) between the decrement/increment `Button`s\
  \ (`minus`/`plus` Icons, hidden with `hideSteppers`); the field is one element with\
  \ `.accessibilityValue(formatted)` and `.accessibilityAdjustableAction` stepping\
  \ by `step` (VoiceOver swipe up/down), which is the spinbutton equivalent. Formatting\
  \ through `NumberFormatter`/`Locale.current` for `format: decimal|currency|unit`,\
  \ parsing leniently as the doc describes; ArrowUp/Down/PageUp/PageDown/Home/End\
  \ on iPad via `.onKeyPress`. Registers with the Form environment as a `Double`.\
  \ `size: sm` per the Sm bindings."
```

## Guidance

## Overview

A number input is for numbers people type exactly — a quantity, a price, a weight — with step buttons and arrow keys for the small adjustments, and locale formatting so 1,234.5 reads the way the user expects. It is Input with a spinbutton's semantics and a parser that understands what people actually type.

## When to use

Use a NumberInput for any exact numeric value: quantities, amounts, measurements, ages, counts. Choose `format` so the field reads as the thing it holds (`currency` with a code, `percent`, a `unit`). Set `min`, `max` and `step` whenever they exist; they drive the buttons, the arrow keys and the out-of-range message. Pair with a Slider when a feel for the scale helps.

## When not to use

Do not use it for numbers that are really identifiers — phone numbers, postal codes, card numbers, IDs — which are strings with digits; use Input with the right `type`/`inputmode`. Do not use it for a value chosen from a few options (RadioGroup, SegmentedControl) or where approximate is fine and immediate feedback matters more than exactness (Slider).

## Behavior

Typing accepts digits, a leading minus, and the locale's or a period decimal separator; other characters are ignored rather than rejected loudly. `onChange` fires with the parsed number as it becomes valid. On blur or Enter the value is rounded to `precision`, clamped to `min`/`max`, and re-formatted. ArrowUp/Down step; PageUp/Down step by ten; Home/End go to the bounds when defined. The steppers disable at the bounds; on web and Lit they repeat while held, on React Native they step once per tap (see its notes). Empty is a valid state (undefined) unless `required`. A keystroke that does not yet form a number (a lone "-" or ".") fires no `onChange`. Validation precedence: the `error` prop, then a Form-supplied error, then `copy.required` (empty and `required`), then `copy.invalid` (the committed text — on blur, Enter or submit — contains no digits at all, e.g. "-" or "."; or `invalid` is set without `error`), then the out-of-range message. Non-numeric committed text reports `invalid`, never `required`. The field clamps and reports, rather than silently changing the number. `{min}` and `{max}` in the out-of-range copy are formatted with the field's own `format`/`precision` ("$1.00", "10%"), without `leadingText`/`trailingText`. Outside a Form (and inside one) the out-of-range message renders in the errorMessage part, sets aria-invalid, and makes the field fail validation (rangeUnderflow/rangeOverflow on Lit) until the next keystroke or step clears it — so a submit straight after a clamp fails once and the user sees the changed number. `percent` stores the number as typed (25, not 0.25) and divides by 100 only for display. `format: currency` without `currency` is a development warning and falls back to USD. From an empty field, ArrowUp/increment goes to `min ?? 0` and ArrowDown/decrement to `max ?? 0`. The out-of-range message is reported whenever a blur-time clamp changed what was typed, `required` or not: `copy.outOfRange` when both bounds are set, `copy.outOfRangeMin` or `copy.outOfRangeMax` when only one is — a clamp is never silent. `leadingText` is ignored under `format: currency`, which draws its own symbol, so a field never shows two. A `unit` string that Intl does not know falls back to plain decimal formatting with the unit shown as `trailingText` when none was given. A Fieldset's `disabled` reaches NumberInput on every platform (web: the `disabled` prop Fieldset passes to direct children; Lit: the `disabled` property ds-fieldset sets on data-ds-field children; React Native: FieldsetContext). The legend prefix exists only on React Native, where the legend prefixes the accessibilityLabel; web and Lit rely on the native fieldset/legend grouping. Hold-to-repeat timings (web/Lit) are read from the resolved theme at pointerdown (`motion.duration.base` delay, `motion.duration.fast` interval), never hardcoded; when either token cannot be read (no theme loaded, jsdom), a press steps once and does not repeat. The accessible value text (aria-valuetext, accessibilityValue.text) is `leadingText` + the formatted value + a space + `trailingText` when those are set ("2 kg"), so the affix parts themselves are hidden from assistive technology on native. The label is a native `<label for>` (web/Lit) styled from this component's label bindings, not a Text. The Form value is the number's plain decimal string (see `name`); an empty field submits nothing.

## Content guidelines

Labels name the quantity with its unit when the field shows none ("Weight (kg)"), or use `unit`/`trailingText` and keep the label plain. Placeholders show a realistic example ("12.5"). Use `precision` to show the decimals the domain uses (prices 2, weights 1, counts 0).

## Accessibility

The input is a `spinbutton` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` carrying the formatted value (WCAG 4.1.2; APG spinbutton), labelled and described like Input (1.3.1, 3.3.2). Arrow keys give keyboard users the stepping the buttons give pointer users (2.1.1); the buttons are removed from the tab order so the field stays one stop. On native the `adjustable` role with increment/decrement actions covers screen-reader users. Out-of-range and invalid values produce text errors linked to the field (3.3.1, 3.3.3). Targets and contrast as Input.

## Platform notes

### Web
Render Input's wrapper (label, description, field, error) with `<input type="text" inputmode="decimal" role="spinbutton" autocomplete="off" aria-valuenow aria-valuemin aria-valuemax aria-valuetext>` plus optional prefix/suffix `<span>`s and, unless `hideSteppers`, two system `Button`s (`ghost`, `sm` at both field sizes, `iconOnly`, `Icon name="minus"` / `"plus"`, labels from copy, `tabIndex={-1}`) each in a span carrying its data-part, inside a wrapper with `aria-hidden` since the arrows duplicate them, separated from the input by a hairline (`stepperDivider`, `stepperDividerWidth`). Parse with a small locale-aware routine (strip group separators, normalise the decimal separator) and format with `Intl.NumberFormat`. Keydown implements the table; hold-to-repeat with `motion.duration.base` initial delay and `motion.duration.fast` interval.

### Lit
`<ds-number-input label="Quantity" name="qty" min="1" max="99">`; form-associated; `DsFormField`; composed `change`.

### React Native
`TextInput` with `keyboardType="decimal-pad"`, `accessibilityRole="adjustable"`, `accessibilityValue={{ text }}`, `accessibilityActions` increment/decrement; steppers as system `Button`s (hidden from AT, one step per tap). Format with `Intl.NumberFormat`; parse as on web. Form registration as Input, with the number's decimal string (undefined when empty). Arrow/Page/Home/End keys only where onKeyPress delivers them; not on iOS software or most iOS hardware keyboards, where the adjustable actions step and there is no jump to a bound.

## Related

Input, Slider, Form, Button.

## Behavior scenarios (15)

One test per scenario, in this order.

```yaml
- name: the-increment-button-steps-up
  given:
    defaultValue: 5
    step: 1
  when:
    click: incrementButton
  then:
  - event: onChange
- name: the-decrement-button-steps-down
  given:
    defaultValue: 5
    step: 1
  when:
    click: decrementButton
  then:
  - event: onChange
- name: typing-a-number-reports-it
  when:
    type: '7'
  then:
  - event: onChange
- name: decrement-does-nothing-at-the-minimum
  description: The decrement button disables at min, so there is no value below it
    to report.
  given:
    defaultValue: 0
    min: 0
    max: 10
  when:
    click: decrementButton
  then:
  - event: onChange
    fired: false
- name: a-disabled-field-does-not-step
  given:
    disabled: true
    defaultValue: 5
  when:
    click: incrementButton
  then:
  - event: onChange
    fired: false
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-format-decimal
  given:
    format: decimal
  then:
  - renders: true
  derived: true
- name: renders-format-currency
  given:
    format: currency
  then:
  - renders: true
  derived: true
- name: renders-format-percent
  given:
    format: percent
  then:
  - renders: true
  derived: true
- name: renders-format-unit
  given:
    format: unit
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
