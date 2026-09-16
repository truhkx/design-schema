# Generate: NumberInput as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/NumberInput.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `NumberInput.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: NumberInputVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
- Each event is dispatched as a `CustomEvent` named by its `platforms.lit` value with `bubbles: true, composed: true` so it crosses the shadow boundary.
- Styles live in `static override styles: CSSResult = css\`…\`` and read ONLY token custom properties (`var(--color-…)`), which inherit through the shadow root. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes an attribute selector per enum value, e.g. `:host([variant="primary"]) { background: var(--color-action-primary-background); }`.
- Implement every item in `a11y.requires` inside the shadow DOM using a native element (e.g. a real `<button>`), and use `delegatesFocus: true` in `static override shadowRootOptions: ShadowRootInit` so focusing the host focuses the inner element.
- `accessible-name`: forward `label` to visible text or `aria-label` on the inner element.
- `focus-visible`: style `:focus-visible` on the inner element with `--color-border-focus` / `--border-width-focus`.
- `heading-hierarchy`: render the matching `<h1>`–`<h6>` inside the shadow root based on the level prop.
- Support light and dark by relying on token variables only.
- Form ownership is DOM-tree based: slotted light-DOM children are not owned by a `<form>` inside a shadow root. Follow the platform notes for how ds-form and ds-input cooperate by `name`.
- Events named like native events (`focus`, `blur`) are the native retargeted events — do not dispatch a CustomEvent with the same name.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard`, removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `NumberInput.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element in the shadow root), only in its `state` (`:hover`, `:focus-visible`, the reflected state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated property, event, value or element keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development (`import.meta.env.DEV`) naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
      description: Field name for the Form. The collected value is a number (or undefined
        when empty).
    value:
      type: number
      description: Controlled numeric value. `null`/undefined means empty.
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
      description: Increment for the buttons and arrow keys. Also the rounding granularity
        when `precision` is omitted.
    precision:
      type: number
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
      description: 'Intl unit identifier for `format: unit` (e.g. kilogram, hour),
        or a literal shown as `suffix`.'
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
    action: Changes by ten steps.
    from: first
    expect: manual
  - keys:
    - Home
    - End
    action: Sets min / max when they are defined; otherwise the input's native caret
      movement.
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
      locked: false
    paddingBlock:
      token: space.sm
      locked: false
    paddingBlockSm:
      token: space.1
      description: Vertical padding at size sm.
      locked: false
    paddingInlineSm:
      token: space.2
      description: Horizontal padding at size sm.
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
      description: The field height floor at size sm; the stepper buttons become Button
        size sm.
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
  copy:
    increment: Increase
    decrement: Decrease
    required: '{label} is required.'
    invalid: '{label} must be a number.'
    outOfRange: '{label} must be between {min} and {max}.'
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
      large: true
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
        do the same job; the buttons are pointer conveniences and repeat while held.'
    lit:
      tag: ds-number-input
      reflect:
      - format
      - required
      - disabled
      - invalid
      - show-steppers
      notes: Form-associated; setFormValue with the plain number as a string. Implements
        DsFormField. Composed `change` with detail { value }.
    rn:
      element: TextInput
      props:
      - keyboardType=decimal-pad
      - accessibilityRole=adjustable
      - accessibilityLabel
      - accessibilityValue
      - accessibilityActions
      notes: TextInput with keyboardType="decimal-pad" (numbers-and-punctuation on
        iOS for negatives), accessibilityRole="adjustable" with increment/decrement
        accessibility actions so VoiceOver/TalkBack can step without the buttons,
        accessibilityValue text from the formatted value. Formatting uses Intl.NumberFormat
        (Hermes supports it). Steppers are system Buttons beside the input, accessibilityElementsHidden
        since the adjustable actions cover them.
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
```

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `paddingBlockSm`, `paddingInlineSm`, `affixGap`, `stepperGap`, `stepperDivider`, `partGap`, `labelWeight`, `helperSize`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `affixColor`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
  - state: invalid
    is: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-number-input
reflect:
- format
- required
- disabled
- invalid
- show-steppers
notes: Form-associated; setFormValue with the plain number as a string. Implements
  DsFormField. Composed `change` with detail { value }.
```

## Guidance

## Overview

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
