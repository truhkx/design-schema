---
title: NumberInput
description: A field for an exact number with step buttons and arrow-key stepping, formatted for the locale — the APG spinbutton on top of Input.
component:
  name: NumberInput
  category: input
  status: review
  apg: spinbutton
  anatomy: [label, description, field, input, decrementButton, incrementButton, prefix, suffix, errorMessage]
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
      description: Field name for the Form. The collected value is a number (or undefined when empty).
    value:
      type: number
      description: Controlled numeric value. `null`/undefined means empty.
    defaultValue:
      type: number
      description: Initial value.
    min:
      type: number
      description: Lower bound; values are clamped on blur and the decrement button disables at it.
    max:
      type: number
      description: Upper bound.
    step:
      type: number
      default: 1
      description: Increment for the buttons and arrow keys. Also the rounding granularity when `precision` is omitted.
    precision:
      type: number
      description: Decimal places to keep and display. Defaults to the decimals in `step`.
    format:
      type: enum
      values: [decimal, currency, percent, unit]
      default: decimal
      description: 'Locale formatting of the displayed value via Intl.NumberFormat: thousands separators, currency symbol (`currency` prop), percent, or a unit (`unit` prop). The underlying value is always a plain number.'
    currency:
      type: string
      description: 'ISO 4217 code for `format: currency` (e.g. USD).'
    unit:
      type: string
      description: 'Intl unit identifier for `format: unit` (e.g. kilogram, hour), or a literal shown as `suffix`.'
    leadingText:
      type: string
      description: 'Static text before the value inside the field ("$"), when `format` cannot express it. (Not `prefix`: that name is a native Element member.)'
    trailingText:
      type: string
      description: 'Static text after the value inside the field ("kg", "%"). Also the literal shown when `unit` is not a valid Intl unit.'
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
      description: 'Visually hide the label (it remains the accessible name). Only for a field whose context already names it: a DataGrid cell editor, a Search.'
    size:
      type: enum
      values: [sm, md]
      default: md
      description: 'sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type.'
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
      description: Fired when the numeric value changes (on each valid keystroke, step, and on blur after clamping/rounding), with the number or undefined.
      platforms: { web: onChange, lit: change, rn: onChangeText }
  keyboard:
    - { keys: [ArrowUp], action: Increases by `step` (clamped to max)., from: first, expect: manual }
    - { keys: [ArrowDown], action: Decreases by `step` (clamped to min)., from: first, expect: manual }
    - { keys: [PageUp, PageDown], action: Changes by ten steps., from: first, expect: manual }
    - { keys: [Home, End], action: 'Sets min / max when they are defined; otherwise the input''s native caret movement.', from: first, expect: manual }
    - { keys: [Enter], action: 'Commits (rounds and clamps) the typed value; inside a Form, submits.', from: first, expect: manual }
  styles:
    background: { token: color.background }
    foreground: { token: color.foreground }
    placeholder: { token: color.foreground.muted }
    border: { token: color.border.strong }
    borderFocus: { token: color.border.focus }
    borderInvalid: { token: color.border.danger }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.md }
    paddingInline: { token: space.md }
    paddingBlock: { token: space.sm }
    paddingBlockSm: { token: space.1, description: 'Vertical padding at size sm.' }
    paddingInlineSm: { token: space.2, description: 'Horizontal padding at size sm.' }
    affixColor: { token: color.foreground.muted, description: Prefix and suffix text. }
    affixGap: { token: layout.gap.tight }
    stepperGap: { token: layout.gap.none, description: 'The two stepper Buttons sit flush at the end of the field, separated from the input by a hairline.' }
    stepperDivider: { token: color.border }
    partGap: { token: space.1 }
    labelWeight: { token: font.weight.medium }
    helperSize: { token: font.size.sm }
    descriptionText: { token: color.foreground.muted }
    errorText: { token: color.foreground.danger }
    fontFamily: { token: font.family.body }
    fontSize: { token: 'font.size.{size}' }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.comfortable }
    minTargetSm: { token: size.target.min, description: 'The field height floor at size sm; the stepper buttons become Button size sm.' }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
  copy:
    increment: Increase
    decrement: Decrease
    required: '{label} is required.'
    invalid: '{label} must be a number.'
    outOfRange: '{label} must be between {min} and {max}.'
    currencyMissing: 'format "currency" needs a currency code.'
    requiredIndicator: ' (required)'
  a11y:
    role: spinbutton
    requires: [label-association, accessible-name, error-identification, keyboard-operable, focus-visible, contrast-aa, target-44px]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
      - { foreground: color.border.strong, background: color.background, level: AA, large: true }
  platforms:
    web:
      element: input
      attributes: [type=text, inputmode=decimal, role=spinbutton, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-describedby, aria-invalid, aria-required, autocomplete=off]
      notes: 'An <input type="text" inputmode="decimal" role="spinbutton"> rather than type="number": the native number input cannot format, drops leading zeros, scrolls its value on wheel, and its spin buttons are unstyleable and tiny. The value is parsed from the locale format on input (accepting both the locale''s and "." decimal separators) and re-formatted on blur. aria-valuenow/text mirror the number. Steppers are the system Button (ghost, sm, iconOnly, plus/minus icons) with tabindex="-1" — the input is the single tab stop and the arrows do the same job; the buttons are pointer conveniences and repeat while held.'
    lit:
      tag: ds-number-input
      reflect: [format, required, disabled, invalid, show-steppers]
      notes: 'Form-associated; setFormValue with the plain number as a string. Implements DsFormField. Composed `change` with detail { value }.'
    rn:
      element: TextInput
      props: [keyboardType=decimal-pad, accessibilityRole=adjustable, accessibilityLabel, accessibilityValue, accessibilityActions]
      notes: 'TextInput with keyboardType="decimal-pad" (numbers-and-punctuation on iOS for negatives), accessibilityRole="adjustable" with increment/decrement accessibility actions so VoiceOver/TalkBack can step without the buttons, accessibilityValue text from the formatted value. Formatting uses Intl.NumberFormat (Hermes supports it). Steppers are system Buttons beside the input, accessibilityElementsHidden since the adjustable actions cover them.'
---

A number input is for numbers people type exactly — a quantity, a price, a weight — with step buttons and arrow keys for the small adjustments, and locale formatting so 1,234.5 reads the way the user expects. It is Input with a spinbutton's semantics and a parser that understands what people actually type.

## When to use

Use a NumberInput for any exact numeric value: quantities, amounts, measurements, ages, counts. Choose `format` so the field reads as the thing it holds (`currency` with a code, `percent`, a `unit`). Set `min`, `max` and `step` whenever they exist; they drive the buttons, the arrow keys and the out-of-range message. Pair with a Slider when a feel for the scale helps.

## When not to use

Do not use it for numbers that are really identifiers — phone numbers, postal codes, card numbers, IDs — which are strings with digits; use Input with the right `type`/`inputmode`. Do not use it for a value chosen from a few options (RadioGroup, SegmentedControl) or where approximate is fine and immediate feedback matters more than exactness (Slider).

## Behavior

Typing accepts digits, a leading minus, and the locale's or a period decimal separator; other characters are ignored rather than rejected loudly. `onChange` fires with the parsed number as it becomes valid. On blur or Enter the value is rounded to `precision`, clamped to `min`/`max`, and re-formatted. ArrowUp/Down step; PageUp/Down step by ten; Home/End go to the bounds when defined. The steppers repeat while held and disable at the bounds. Empty is a valid state (undefined) unless `required`. Validation precedence is Input's, plus `copy.outOfRange` for a clamped value when the field is `required` and the user typed out of range (the field clamps and reports, rather than silently changing the number). `percent` stores the number as typed (25, not 0.25) and divides by 100 only for display. `format: currency` without `currency` is a development warning and falls back to USD. From an empty field, ArrowUp/increment goes to `min ?? 0` and ArrowDown/decrement to `max ?? 0`. `copy.outOfRange` is reported whenever a blur-time clamp changed what was typed, `required` or not. Hold-to-repeat timings are read from the resolved theme at pointerdown (`motion.duration.base` delay, `motion.duration.fast` interval), never hardcoded. The label is a native `<label for>` (web/Lit) styled from this component's label bindings, not a Text. The Form value is a number.

## Content guidelines

Labels name the quantity with its unit when the field shows none ("Weight (kg)"), or use `unit`/`suffix` and keep the label plain. Placeholders show a realistic example ("12.5"). Use `precision` to show the decimals the domain uses (prices 2, weights 1, counts 0).

## Accessibility

The input is a `spinbutton` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` carrying the formatted value (WCAG 4.1.2; APG spinbutton), labelled and described like Input (1.3.1, 3.3.2). Arrow keys give keyboard users the stepping the buttons give pointer users (2.1.1); the buttons are removed from the tab order so the field stays one stop. On native the `adjustable` role with increment/decrement actions covers screen-reader users. Out-of-range and invalid values produce text errors linked to the field (3.3.1, 3.3.3). Targets and contrast as Input.

## Platform notes

### Web
Render Input's wrapper (label, description, field, error) with `<input type="text" inputmode="decimal" role="spinbutton" autocomplete="off" aria-valuenow aria-valuemin aria-valuemax aria-valuetext>` plus optional prefix/suffix `<span>`s and, when `showSteppers`, two system `Button`s (`ghost`, `sm`, `iconOnly`, `Icon name="minus"` / `"plus"`, labels from copy, `tabIndex={-1}`, `aria-hidden` since the arrows duplicate them) separated from the input by a hairline. Parse with a small locale-aware routine (strip group separators, normalise the decimal separator) and format with `Intl.NumberFormat`. Keydown implements the table; hold-to-repeat with `motion.duration.base` initial delay and `motion.duration.fast` interval.

### Lit
`<ds-number-input label="Quantity" name="qty" min="1" max="99">`; form-associated; `DsFormField`; composed `change`.

### React Native
`TextInput` with `keyboardType="decimal-pad"`, `accessibilityRole="adjustable"`, `accessibilityValue={{ text }}`, `accessibilityActions` increment/decrement; steppers as system `Button`s (hidden from AT). Format with `Intl.NumberFormat`; parse as on web. Form registration as Input, returning a number.

## Related

Input, Slider, Form, Button.
