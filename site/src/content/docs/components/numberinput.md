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
    description: { component: Text, props: { size: sm, tone: muted }, forwards: { helperSize: fontSize, fontFamily: fontFamily, lineHeight: lineHeight } }
    errorMessage: { component: Text, props: { size: sm, tone: danger }, forwards: { helperSize: fontSize, fontFamily: fontFamily, lineHeight: lineHeight } }
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
      description: 'Field name for the Form. No platform''s Form (web/rn FormContext, Lit DsFormField/ds-form) has a number type, so the value registers as its plain decimal string — String(value), "." decimal, no grouping, currency symbol, percent sign or affixes ("1234.5", "25" for 25%) — and an empty or disabled field registers nothing (undefined on web/rn, null currentValue on Lit). Consumers parse it back with Number().'
    value:
      type: number
      description: 'Controlled numeric value, typed `number | null | undefined`: `null` is a controlled empty field, `undefined` means uncontrolled (defaultValue applies). While the input is focused it shows the raw typed text, so typing is never swallowed; the controlled value takes over the display on blur/Enter (re-formatted), on every step, and whenever the prop changes to a number different from the parsed typed text. A controlled change to `null` while the user is typing keeps the typed text until blur/Enter. Inside a Form, validation reads the prop value, so a step or Enter is validated against the new number only once the owner re-renders.'
      controls:
        event: onChange
        default: defaultValue
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
      description: 'Increment for the buttons and arrow keys. When `precision` is omitted, values round to the number of decimals in `step` (step 0.25 → 2 places); values never snap to multiples of `step`, so a typed 12 with step 5 stays 12.'
    precision:
      type: integer
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
      description: 'Intl unit identifier for `format: unit` (e.g. kilogram, hour). A string Intl does not know is shown as `trailingText` (the `suffix` part) when `trailingText` is not given, with plain decimal formatting.'
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
      enumRef: size
      values: [sm, md]
      default: md
      description: 'sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type.'
    disabled:
      type: boolean
      default: false
      description: 'Not editable, not submitted, still readable. On web and Lit the input stays focusable as `readonly` with aria-disabled (not natively disabled); on React Native it is `editable={false}` with accessibilityState.disabled, as Input.'
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
      platforms: { web: onChange, lit: change, rn: onChangeText, swiftui: onChange }
      payload:
        - { name: value, type: union, shape: 'number | undefined', description: 'The new numeric value; undefined when the field is empty.' }
      fires: [user]
  keyboard:
    - { keys: [ArrowUp], action: Increases by `step` (clamped to max)., from: first, expect: manual }
    - { keys: [ArrowDown], action: Decreases by `step` (clamped to min)., from: first, expect: manual }
    - { keys: [PageUp, PageDown], action: 'Changes by ten steps (10 × `step`, clamped); the 10 is a count, not a style value.', from: first, expect: manual }
    - { keys: [Home, End], action: 'Sets min / max when they are defined (component code, not native: a text input cannot do this); otherwise the key is left to the input''s native caret movement. A jump is a step: it clears a clamp message and fires onChange only when the value changes.', from: first, expect: manual }
    - { keys: [Enter], action: 'Commits (rounds and clamps) the typed value; inside a Form, submits (on React Native too: returnKeyType done, no next-field chain).', from: first, expect: manual }
  styles:
    background: { token: color.background }
    foreground: { token: color.foreground }
    placeholder: { token: color.foreground.muted }
    border: { token: color.border.strong }
    borderFocus: { token: color.border.focus, part: field, description: 'The focus ring is drawn on the bordered field part while the input matches :focus-visible; the input itself has no border. As Input, the ring is the field''s border (width swapped to focusRingWidth, no outline), and both paddingInline and paddingBlock shrink by the width difference so the field does not grow or shift.' }
    borderInvalid: { token: color.border.danger }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.md }
    paddingInline: { token: space.md, by: size, values: { sm: space.2 }, part: field, description: 'The field''s inline-start padding; its inline-end padding only when the steppers are hidden, since the stepper Buttons sit flush at the end.' }
    paddingBlock: { token: space.sm, by: size, values: { sm: space.1 } }
    affixColor: { token: color.foreground.muted, description: Prefix and suffix text. }
    affixGap: { token: layout.gap.tight, description: 'Between an affix and the value; with steppers shown, the suffix also keeps this gap before the stepper divider.' }
    stepperGap: { token: layout.gap.none, description: 'The two stepper Buttons sit flush at the end of the field, separated from the input by a hairline. There is no divider between the two Buttons; their icons separate them.' }
    stepperDivider: { token: color.border }
    stepperDividerWidth: { token: border.width.thin, description: 'Width of the hairline between the input and the steppers (the inline-start border of the element wrapping both stepper Buttons).' }
    partGap: { token: space.1 }
    labelWeight: { token: font.weight.medium, part: label }
    helperSize: { token: font.size.sm }
    descriptionText: { token: color.foreground.muted, part: description }
    errorText: { token: color.foreground.danger }
    fontFamily: { token: font.family.body }
    fontSize: { token: 'font.size.{size}' }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.comfortable }
    minTargetSm: { token: size.target.min, description: 'The field height floor at size sm. The stepper Buttons are Button size sm at both field sizes.' }
    focusRingWidth: { token: border.width.focus, part: field }
    disabledOpacity: { token: opacity.disabled, description: 'Applied to the label, description, input and affix parts of a disabled field (the description Text through a wrapper NumberInput owns, which carries its data-part, never a rule on the Text); the field frame (border, background) and the errorMessage are not dimmed. Not to an element containing the steppers: the stepper Buttons receive `disabled` (at a bound, or when the field is disabled) and dim once through their own disabled style.' }
  copy:
    increment: Increase
    decrement: Decrease
    required: '{label} is required.'
    invalid: '{label} must be a number.'
    outOfRange: '{label} must be between {min} and {max}.'
    outOfRangeMin: '{label} must be {min} or more.'
    outOfRangeMax: '{label} must be {max} or less.'
    currencyMissing: 'format "currency" needs a currency code.'
    requiredIndicator: ' (required)'
  a11y:
    role: spinbutton
    requires: [label-association, accessible-name, error-identification, keyboard-operable, arrow-navigation, focus-visible, contrast-aa, target-44px]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
  form:
    role: field
    value: value
    valueType: number
    name: name
    validation: [required, invalid, range]
    messages: { required: required, invalid: invalid, range: outOfRange }
    discovery: context
  platforms:
    web:
      element: input
      attributes: [type=text, inputmode=decimal, role=spinbutton, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-describedby, aria-invalid, aria-required, autocomplete=off]
      notes: 'An <input type="text" inputmode="decimal" role="spinbutton"> rather than type="number": the native number input cannot format, drops leading zeros, scrolls its value on wheel, and its spin buttons are unstyleable and tiny. The value is parsed from the locale format on input (accepting both the locale''s and "." decimal separators) and re-formatted on blur. aria-valuenow/text mirror the number. Steppers are the system Button (ghost, sm, iconOnly, plus/minus icons) with tabindex="-1" — the input is the single tab stop and the arrows do the same job; the buttons are pointer conveniences and repeat while held. Web Button forces data-part="container" on its root, so each Button sits in a <span> NumberInput owns carrying data-part="decrementButton"/"incrementButton" and the pointer/click handlers; aria-hidden="true" goes on the element wrapping both spans (not on the Buttons), and the Buttons get `disabled` at a bound or when the field is disabled. Parsing: "." is read as the decimal separator only when the locale''s decimal separator is absent from the text (so de-DE "1.234,5" is 1234.5, and "1.5" is 1.5). There is no React FieldsetContext: Fieldset passes `disabled` to its direct child fields, and NumberInput uses only that prop; the legend is not used.'
    lit:
      tag: ds-number-input
      reflect: [format, size, required, disabled, invalid, hideSteppers]
      notes: 'Form-associated; setFormValue with the plain number as a string. Implements DsFormField: currentValue is that decimal string, or null when empty; a public `valueAsNumber` getter returns the number (or undefined). Composed `change` with detail { value }. Carries data-ds-field, so ds-fieldset sets its `disabled` property (plus formDisabledCallback); the legend is not used. Steppers in the shadow root are ds-button (ghost, sm, iconOnly) with tabindex="-1" inside an aria-hidden wrapper; each carries its data-part on a wrapper span as on web. The focus ring is drawn on the field part while the input matches :focus-visible. Attributes are kebab-case and not reflected unless listed: default-value, leading-text, trailing-text, hide-steppers, hide-label; `value` is property-only (number | null | undefined).'
    rn:
      element: TextInput
      props: [keyboardType=decimal-pad, accessibilityRole=adjustable, accessibilityLabel, accessibilityValue, accessibilityActions]
      notes: 'TextInput with keyboardType="decimal-pad" (numbers-and-punctuation on iOS for negatives), accessibilityRole="adjustable" with increment/decrement accessibility actions so VoiceOver/TalkBack can step without the buttons, accessibilityValue text from the formatted value. Formatting uses Intl.NumberFormat (Hermes supports it). Use numbers-and-punctuation on iOS when negatives are possible — `min` absent or below zero — and decimal-pad otherwise. Steppers are system Buttons beside the input, accessibilityElementsHidden since the adjustable actions cover them; Button exposes only `onPress`, so they step once per tap and do not repeat while held — the adjustable actions are the way to step repeatedly here. An adjustable role and a directly typable field are in tension on this platform: screen readers favour swipe-to-adjust and may make double-tap-to-edit unreliable. That is the native trade, and the role stays, because stepping without the buttons matters more. Keys: ArrowUp/Down, PageUp/Down and Home/End are handled in TextInput onKeyPress, which delivers them on react-native-web and on hardware keyboards that report them; iOS onKeyPress generally does not deliver arrow, page or Home/End keys, so there the adjustable increment/decrement actions are the only stepping path, and jumping to min/max has no native equivalent (no accessibility action exists for it — a screen-reader user steps or types the bound). The steppers sit in a View with accessibilityElementsHidden and importantForAccessibility="no-hide-descendants"; each Button is wrapped in a View carrying testID `NumberInput.decrementButton` / `NumberInput.incrementButton`, since Button takes no testID. Button has no way to leave the focus order, so on react-native-web the hidden steppers remain focusable Pressables — a known Button limitation, not a NumberInput choice. FieldsetContext is read: a Fieldset''s `disabled` disables the field and its legend prefixes the accessibilityLabel ("Shipping, Weight"), as Input does. accessibilityValue.text is the same string as web aria-valuetext, affixes included; accessibilityValue carries only `text` (no min/max/now), since Android takes integers there and the value may be fractional. As Input on native, the label and the error are composed Texts (label: size by `size`, weight medium with labelWeight forwarded; error: size sm, tone danger) in wrapper Views carrying the part testIDs.'
    swiftui:
      element: TextField
      props: [TextField, .keyboardType=decimalPad, Button, .accessibilityAdjustableAction, .accessibilityValue, .onKeyPress, NumberFormatter, Locale]
      notes: 'Input''s wrapper with a `TextField` (`.keyboardType(.decimalPad)` or `.numberPad` when `precision` is 0 and `min` ≥ 0) between the decrement/increment `Button`s (`minus`/`plus` Icons, hidden with `hideSteppers`); the field is one element with `.accessibilityValue(formatted)` and `.accessibilityAdjustableAction` stepping by `step` (VoiceOver swipe up/down), which is the spinbutton equivalent. Formatting through `NumberFormatter`/`Locale.current` for `format: decimal|currency|unit`, parsing leniently as the doc describes; ArrowUp/Down/PageUp/PageDown/Home/End on iPad via `.onKeyPress`. Registers with the Form environment as a `Double`. `size: sm` per the Sm bindings.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/focusable/error-identified ones from the schema.
    - name: the-increment-button-steps-up
      given: { defaultValue: 5, step: 1 }
      when: { click: incrementButton }
      then:
        - { event: onChange }
    - name: the-decrement-button-steps-down
      given: { defaultValue: 5, step: 1 }
      when: { click: decrementButton }
      then:
        - { event: onChange }
    - name: arrow-up-increases-by-one-step
      given: { defaultValue: 5 }
      when: { key: ArrowUp }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: arrow-down-decreases-by-one-step
      given: { defaultValue: 5 }
      when: { key: ArrowDown }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: page-up-changes-by-ten-steps
      given: { defaultValue: 5 }
      when: { key: PageUp }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: arrow-keys-work-without-the-steppers
      description: hideSteppers hides the buttons; the arrow keys do the same job regardless.
      given: { defaultValue: 5, hideSteppers: true }
      when: { key: ArrowUp }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: typing-a-number-reports-it
      when: { type: '7' }
      then:
        - { event: onChange }
    - name: decrement-does-nothing-at-the-minimum
      description: The decrement button disables at min, so there is no value below it to report.
      given: { defaultValue: 0, min: 0, max: 10 }
      when: { click: decrementButton }
      then:
        - { event: onChange, fired: false }
    - name: a-disabled-field-does-not-step
      given: { disabled: true, defaultValue: 5 }
      when: { click: incrementButton }
      then:
        - { event: onChange, fired: false }
    - name: the-field-reports-its-value-and-bounds
      description: The spinbutton carries valuenow/min/max, which is how the value is announced.
      given: { defaultValue: 4, min: 0, max: 10 }
      then:
        - { attribute: aria-valuenow, is: '4' }
        - { attribute: aria-valuemin, is: '0' }
        - { attribute: aria-valuemax, is: '10' }
      platforms: [web]
  examples:
    - name: quantity
      description: The everyday bounded counter with its step buttons.
      given: { label: Quantity, name: quantity, min: 1, max: 99, defaultValue: 1 }
    - name: price-in-currency
      description: A money field formatted for the locale, stepping by cents.
      given: { label: Price, name: price, format: currency, currency: USD, step: 0.01, defaultValue: 19.99 }
    - name: percentage
      description: A percentage bounded to nought and a hundred, stepping by five.
      given: { label: Discount, name: discount, format: percent, min: 0, max: 100, step: 5, defaultValue: 10 }
    - name: compact-cell-editor
      description: A small field inside a grid cell, named by its column, with no steppers and a unit after the value.
      given: { label: Weight, name: weight, size: sm, hideLabel: true, hideSteppers: true, trailingText: kg, defaultValue: 2 }
---

A number input is for numbers people type exactly — a quantity, a price, a weight — with step buttons and arrow keys for the small adjustments, and locale formatting so 1,234.5 reads the way the user expects. It is Input with a spinbutton's semantics and a parser that understands what people actually type.

## When to use

Use a NumberInput for any exact numeric value: quantities, amounts, measurements, ages, counts. Choose `format` so the field reads as the thing it holds (`currency` with a code, `percent`, a `unit`). Set `min`, `max` and `step` whenever they exist; they drive the buttons, the arrow keys and the out-of-range message. Pair with a Slider when a feel for the scale helps.

## When not to use

Do not use it for numbers that are really identifiers — phone numbers, postal codes, card numbers, IDs — which are strings with digits; use Input with the right `type`/`inputmode`. Do not use it for a value chosen from a few options (RadioGroup, SegmentedControl) or where approximate is fine and immediate feedback matters more than exactness (Slider).

## Behavior

Typing accepts digits, a leading minus, and the locale's or a period decimal separator; other characters are ignored rather than rejected loudly. `onChange` fires with the parsed number as it becomes valid. On blur or Enter the value is rounded to `precision`, clamped to `min`/`max`, and re-formatted. ArrowUp/Down step; PageUp/Down step by ten; Home/End go to the bounds when defined. The steppers disable at the bounds; on web and Lit they repeat while held, on React Native they step once per tap (see its notes). Empty is a valid state (undefined) unless `required`. A keystroke that does not yet form a number (a lone "-" or ".") fires no `onChange`. Validation precedence: the `error` prop, then a Form-supplied error, then `copy.required` (empty and `required`), then `copy.invalid` (the committed text — on blur, Enter or submit — contains no digits at all, e.g. "-" or "."; or `invalid` is set without `error`), then the out-of-range message. Non-numeric committed text reports `invalid`, never `required`, and stays in the field as typed (it is not re-formatted to empty) until the next edit, so the user sees what was invalid. What the errorMessage part draws follows Input: `error` when set (a Form-supplied error included — on Lit ds-form delivers it through the same `error` property, so the two share one slot); otherwise a message only while `invalid` is true (set directly or by a Form): `copy.required` for an empty required field, else `copy.invalid`; plus, as below, committed non-numeric text (`copy.invalid`) and a clamp (the out-of-range message). An empty required field is never flagged on first render; validity/validationMessage always follow the full precedence. The field clamps and reports, rather than silently changing the number. `{min}` and `{max}` in the out-of-range copy are formatted with the field's own `format`/`precision` ("$1.00", "10%"), without `leadingText`/`trailingText`. Outside a Form (and inside one) the out-of-range message renders in the errorMessage part, sets aria-invalid, and makes the field fail validation (rangeUnderflow/rangeOverflow on Lit) until the next keystroke or step clears it — so a submit straight after a clamp fails once and the user sees the changed number. `percent` stores the number as typed (25, not 0.25) and divides by 100 only for display. `format: currency` without `currency` is a development warning and falls back to USD. From an empty field, ArrowUp/increment goes to `min ?? 0` and ArrowDown/decrement to `max ?? 0`. The out-of-range message is reported whenever a blur-time clamp changed what was typed, `required` or not: `copy.outOfRange` when both bounds are set, `copy.outOfRangeMin` or `copy.outOfRangeMax` when only one is — a clamp is never silent. `leadingText` is ignored under `format: currency`, which draws its own symbol, so a field never shows two. A `unit` string that Intl does not know falls back to plain decimal formatting with the unit shown as `trailingText` when none was given. A Fieldset's `disabled` reaches NumberInput on every platform (web: the `disabled` prop Fieldset passes to direct children; Lit: the `disabled` property ds-fieldset sets on data-ds-field children; React Native: FieldsetContext). The legend prefix exists only on React Native, where the legend prefixes the accessibilityLabel; web and Lit rely on the native fieldset/legend grouping. Hold-to-repeat timings (web/Lit) are read from the resolved theme at pointerdown (`motion.duration.base` delay, `motion.duration.fast` interval), never hardcoded; when either token cannot be read (no theme loaded, jsdom), a press steps once and does not repeat. The accessible value text (aria-valuetext, accessibilityValue.text) is `leadingText` + the formatted value + a space + `trailingText` when those are set ("2 kg"), so the affix parts themselves are hidden from assistive technology on native. The label is a native `<label for>` (web/Lit) styled from this component's label bindings, not a Text. The Form value is the number's plain decimal string (see `name`); an empty field submits nothing. The Keyboard story renders one field with `min: 0`, `max: 20` so Home and End can be tried; the field is a single tab stop, so the three-focusable rule does not apply.

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
