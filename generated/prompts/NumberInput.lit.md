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
- Story render shape: the render that applies to a story (its own `render`, else the meta's) is written inline and returns one `html`` template directly — never a call (`render: (args) => renderBox(args)`) and never a bare identifier (`render: divider`). The docs site reads that template for the Lit code sample, and anything else leaves every story in the module without one. Interpolate helper fragments into the template rather than wrapping it.
- Story parity: every story the React package exports has a Lit story with the same export name and args, including each example named above.
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
    description:
      component: Text
      props:
        size: sm
        tone: muted
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
    errorMessage:
      component: Text
      props:
        size: sm
        tone: danger
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
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
      description: 'Field name for the Form. No platform''s Form (web/rn FormContext,
        Lit DsFormField/ds-form) has a number type, so the value registers as its
        plain decimal string — String(value), "." decimal, no grouping, currency symbol,
        percent sign or affixes ("1234.5", "25" for 25%) — and an empty or disabled
        field registers nothing (undefined on web/rn, null currentValue on Lit). Consumers
        parse it back with Number(). `form.valueType: number` names what the field
        means, not how it is registered: the decimal string is the wire form on every
        platform, and a `valueAsNumber` accessor (Lit) or the event payload carries
        the number.'
    value:
      type: number
      description: 'Controlled numeric value, typed `number | null | undefined`: `null`
        is a controlled empty field, `undefined` means uncontrolled (defaultValue
        applies). While the input is focused it shows the raw typed text, so typing
        is never swallowed; the controlled value takes over the display on blur/Enter
        (re-formatted), on every step, and whenever the prop changes to a number different
        from the parsed typed text. A controlled change to `null` while the user is
        typing keeps the typed text until blur/Enter. Typed text wins over the value
        whenever it exists, which after a commit is only the non-numeric case; every
        numeric commit hands the display back to the formatted value. Inside a Form,
        validation reads the prop value, so a step or Enter is validated against the
        new number only once the owner re-renders.'
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
      description: 'Decimal places to keep and display. Defaults to the decimals in
        `step`. Under `format: percent` it measures the displayed side (the number
        the user sees and types, not the divided-by-100 one), so it is the formatter''s
        minimum and maximum fraction digits: step 5 shows "10%", step 0.5 shows "10.5%".'
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
        (`unit` prop). The underlying value is always a plain number. `unit` with
        no `unit` prop at all formats as plain decimal with no suffix (only an unrecognised
        unit string falls back to `trailingText`).'
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
      description: 'Static text after the value inside the field ("kg", "%"). Also
        the literal shown when `unit` is not a valid Intl unit. Ignored under `format:
        percent`, which draws its own sign, the way `leadingText` is ignored under
        `currency`: a field never shows two.'
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
        for a field whose context already names it: a DataGrid cell editor, a Search.
        On React Native there is no label element to hide (and no `<label for>`),
        so the label part simply is not rendered and `copy.requiredIndicator` survives
        only inside the accessibilityLabel.'
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
      description: Not editable, not submitted, still readable. On web and Lit the
        input stays focusable as `readonly` with aria-disabled (not natively disabled);
        on React Native it is `editable={false}` with accessibilityState.disabled,
        as Input.
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
      movement. A jump is a step: it clears a clamp message and fires onChange only
      when the value changes.'
    from: first
    expect: manual
  - keys:
    - Enter
    action: 'Commits (rounds and clamps) the typed value; inside a Form, submits (on
      React Native too: returnKeyType done, no next-field chain, submitBehavior blurAndSubmit).
      Outside a Form it commits and nothing else — focus and the native keyboard stay
      (React Native submitBehavior submit).'
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
      description: 'The focus ring is drawn on the bordered field part while the input
        matches :focus-visible; the input itself has no border. As Input, the ring
        is the field''s border (width swapped to focusRingWidth, no outline), and
        both paddingInline and paddingBlock shrink by the width difference so the
        field does not grow or shift. The two bindings sit on different parts, so
        the compensation is split: the field publishes the resolved border width as
        a custom property, subtracts it from its own padding-inline-start (and from
        padding-inline-end only in the hidden-stepper case, where that padding exists
        at all), and the input subtracts the inherited delta from its padding-block.'
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
      description: Between an affix and the value; with steppers shown, the suffix
        also keeps this gap before the stepper divider.
      locked: false
    stepperGap:
      token: layout.gap.none
      description: The two stepper Buttons sit flush at the end of the field, separated
        from the input by a hairline. There is no divider between the two Buttons;
        their icons separate them.
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
      description: 'The field height floor at size sm. The stepper Buttons are Button
        size sm at both field sizes and have no target floor of their own: each stretches
        to the field''s height, so at size sm the applicable floor is this 24px one.
        That is the right floor for them — a stepper is a pointer convenience whose
        keyboard and screen-reader equivalent (the arrow keys, the adjustable actions)
        is always available, which is the WCAG 2.5.8 AA exception the 44px comfortable
        target does not have to cover.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: field
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: 'Applied to the label, description, input and affix parts of a
        disabled field (the description Text through a wrapper NumberInput owns, which
        carries its data-part, never a rule on the Text — so `[data-part="description"]`
        is that wrapper and aria-describedby points at it, while the composition entry
        names what the wrapper contains); the field frame (border, background) and
        the errorMessage are not dimmed. Every element that dims also carries `aria-disabled="true"`
        — the root group and the input, on React Native the root View and the TextInput
        beside accessibilityState.disabled, since react-native-web drops accessibilityState
        — so a contrast checker resolves the dimmed label and value to an inactive
        component and applies the WCAG 1.4.3 exemption instead of reporting a failure.
        Not to an element containing the steppers: the stepper Buttons receive `disabled`
        (at a bound, or when the field is disabled) and dim once through their own
        disabled style.'
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
        and the pointer/click handlers; nothing around the steppers is aria-hidden
        — a wrapper hiding focusable controls is exactly axe''s aria-hidden-focus,
        and the package convention names these steppers as the case, so they stay
        in the accessibility tree named from `copy.decrement`/`copy.increment` and
        are removed from the tab order only. The Buttons get `disabled` at a bound
        or when the field is disabled. aria-valuenow is omitted on an empty field
        rather than reporting an invented 0 (APG allows omission when the value is
        unknown). Parsing: "." is read as the decimal separator only when the locale''s
        decimal separator is absent from the text (so de-DE "1.234,5" is 1234.5, and
        "1.5" is 1.5). There is no React FieldsetContext: Fieldset passes `disabled`
        to its direct child fields, and NumberInput uses only that prop; the legend
        is not used.'
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
        a plain wrapper that is never aria-hidden (ds-button is aria-disabled rather
        than natively disabled and forwards the host tabindex, so hiding it would
        be aria-hidden-focus); each carries its data-part on a wrapper span as on
        web. The focus ring is drawn on the field part while the input matches :focus-visible.
        Attributes are kebab-case and not reflected unless listed: default-value,
        leading-text, trailing-text, hide-steppers, hide-label; `value` is property-only
        (number | null | undefined).'
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
        are system Buttons beside the input, named from `copy.decrement`/`copy.increment`
        and left in the accessibility tree; Button exposes only `onPress`, so they
        step once per tap and do not repeat while held — the adjustable actions are
        the way to step repeatedly here. An adjustable role and a directly typable
        field are in tension on this platform: screen readers favour swipe-to-adjust
        and may make double-tap-to-edit unreliable. That is the native trade, and
        the role stays, because stepping without the buttons matters more. Keys: ArrowUp/Down,
        PageUp/Down and Home/End are handled in TextInput onKeyPress, which delivers
        them on react-native-web and on hardware keyboards that report them; iOS onKeyPress
        generally does not deliver arrow, page or Home/End keys, so there the adjustable
        increment/decrement actions are the only stepping path, and jumping to min/max
        has no native equivalent (no accessibility action exists for it — a screen-reader
        user steps or types the bound). The steppers'' View is not hidden from the
        accessibility tree: Button has no way to leave the focus order, so accessibilityElementsHidden
        / importantForAccessibility="no-hide-descendants" there would leave focusable
        Pressables inside a hidden subtree — the RN spelling of aria-hidden-focus,
        which the package conventions forbid. The steppers are announced as buttons
        as well as through the adjustable actions: redundant, not a violation. Only
        the affix Texts are hidden (their text is already in accessibilityValue.text).
        Each Button is wrapped in a View carrying testID `NumberInput.decrementButton`
        / `NumberInput.incrementButton`, since Button takes no testID. FieldsetContext
        is read: a Fieldset''s `disabled` disables the field and its legend prefixes
        the accessibilityLabel ("Shipping, Weight"), as Input does. accessibilityValue.text
        is the same string as web aria-valuetext, affixes included; accessibilityValue
        carries only `text` (no min/max/now), since Android takes integers there and
        the value may be fractional — so the bounds are not announced on native, and
        the out-of-range message is the only place a screen-reader user hears one.
        NumberInput''s rn `onChange` spelling is `onChangeText`, which collides with
        TextInput''s own prop of that name: NumberInput''s carries `number | undefined`,
        not the raw string. The declared event name stands; the collision is the cost
        of the platform mapping. As Input on native, the label and the error are composed
        Texts (label: size by `size`, weight medium with labelWeight forwarded; error:
        size sm, tone danger) in wrapper Views carrying the part testIDs.'
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

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: number | undefined`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)

## Parts and slots

- `label`: element
- `description`: component `Text`; props `size` = "sm", `tone` = "muted"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `field`: element
- `input`: element
- `decrementButton`: component `Button`
- `incrementButton`: component `Button`
- `prefix`: element
- `suffix`: element
- `errorMessage`: component `Text`; props `size` = "sm", `tone` = "danger"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`

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

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `affixGap`, `stepperGap`, `stepperDivider`, `stepperDividerWidth`, `partGap`, `labelWeight`, `helperSize`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `affixColor`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Behavior scenarios (19)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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
  - state: invalid
    is: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-number-input
reflect:
- format
- size
- required
- disabled
- invalid
- hideSteppers
notes: 'Form-associated; setFormValue with the plain number as a string. Implements
  DsFormField: currentValue is that decimal string, or null when empty; a public `valueAsNumber`
  getter returns the number (or undefined). Composed `change` with detail { value
  }. Carries data-ds-field, so ds-fieldset sets its `disabled` property (plus formDisabledCallback);
  the legend is not used. Steppers in the shadow root are ds-button (ghost, sm, iconOnly)
  with tabindex="-1" inside a plain wrapper that is never aria-hidden (ds-button is
  aria-disabled rather than natively disabled and forwards the host tabindex, so hiding
  it would be aria-hidden-focus); each carries its data-part on a wrapper span as
  on web. The focus ring is drawn on the field part while the input matches :focus-visible.
  Attributes are kebab-case and not reflected unless listed: default-value, leading-text,
  trailing-text, hide-steppers, hide-label; `value` is property-only (number | null
  | undefined).'
```

## Guidance

## Overview

A number input is for numbers people type exactly — a quantity, a price, a weight — with step buttons and arrow keys for the small adjustments, and locale formatting so 1,234.5 reads the way the user expects. It is Input with a spinbutton's semantics and a parser that understands what people actually type.

## When to use

Use a NumberInput for any exact numeric value: quantities, amounts, measurements, ages, counts. Choose `format` so the field reads as the thing it holds (`currency` with a code, `percent`, a `unit`). Set `min`, `max` and `step` whenever they exist; they drive the buttons, the arrow keys and the out-of-range message. Pair with a Slider when a feel for the scale helps.

## When not to use

Do not use it for numbers that are really identifiers — phone numbers, postal codes, card numbers, IDs — which are strings with digits; use Input with the right `type`/`inputmode`. Do not use it for a value chosen from a few options (RadioGroup, SegmentedControl) or where approximate is fine and immediate feedback matters more than exactness (Slider).

## Behavior

Typing accepts digits, a leading minus, and the locale's or a period decimal separator; other characters are ignored rather than rejected loudly. `onChange` fires with the parsed number as it becomes valid. On blur or Enter the value is rounded to `precision`, clamped to `min`/`max`, and re-formatted. ArrowUp/Down step; PageUp/Down step by ten; Home/End go to the bounds when defined. The steppers disable at the bounds; on web and Lit they repeat while held, on React Native they step once per tap (see its notes). Empty is a valid state (undefined) unless `required`. A keystroke that does not yet form a number (a lone "-" or ".") fires no `onChange`. Validation precedence: the `error` prop, then a Form-supplied error, then `copy.required` (empty and `required`), then `copy.invalid` (the committed text — on blur, Enter or submit — contains no digits at all, e.g. "-" or "."; or `invalid` is set without `error`), then the out-of-range message. Non-numeric committed text reports `invalid`, never `required`, and stays in the field as typed (it is not re-formatted to empty) until the next edit, so the user sees what was invalid. What the errorMessage part draws follows Input: `error` when set (a Form-supplied error included — on Lit ds-form delivers it through the same `error` property, so the two share one slot); otherwise a message only while `invalid` is true (set directly or by a Form): `copy.required` for an empty required field, else `copy.invalid` when the committed text holds no number; plus, as below, a clamp (the out-of-range message). `invalid` set over a perfectly valid number draws no message at all — aria-invalid and the danger border carry the state, because `copy.invalid` would claim a number is not a number. A Form marks a field invalid by an entry under the field's `name` in its errors; an empty message there falls through to this derived copy. An empty required field is never flagged on first render; validity/validationMessage always follow the full precedence. Those are two precedences, deliberately: the rendered message needs `invalid` or `error` (or a Form-reported error) to be set, while validity and validationMessage read `required` directly from the first render. The field clamps and reports, rather than silently changing the number. `{min}` and `{max}` in the out-of-range copy are formatted with the field's own `format`/`precision` ("$1.00", "10%"), without `leadingText`/`trailingText`. Outside a Form (and inside one) the out-of-range message renders in the errorMessage part, sets aria-invalid, and makes the field fail validation (rangeUnderflow/rangeOverflow on Lit) until the next keystroke or step clears it — so a submit straight after a clamp fails once and the user sees the changed number. `percent` stores the number as typed (25, not 0.25) and divides by 100 only for display. `format: currency` without `currency` is a development warning and falls back to USD. From an empty field, ArrowUp/increment goes to `min ?? 0` and ArrowDown/decrement to `max ?? 0`. The out-of-range message is reported whenever a blur-time clamp changed what was typed, `required` or not: `copy.outOfRange` when both bounds are set, `copy.outOfRangeMin` or `copy.outOfRangeMax` when only one is — a clamp is never silent. `leadingText` is ignored under `format: currency`, which draws its own symbol, so a field never shows two. A `unit` string that Intl does not know falls back to plain decimal formatting with the unit shown as `trailingText` when none was given. A Fieldset's `disabled` reaches NumberInput on every platform (web: the `disabled` prop Fieldset passes to direct children; Lit: the `disabled` property ds-fieldset sets on data-ds-field children; React Native: FieldsetContext). The legend prefix exists only on React Native, where the legend prefixes the accessibilityLabel; web and Lit rely on the native fieldset/legend grouping. Hold-to-repeat timings (web/Lit) are read from the resolved theme at pointerdown (`motion.duration.base` delay, `motion.duration.fast` interval), never hardcoded; when either token cannot be read (no theme loaded, jsdom), a press steps once and does not repeat. The pointerdown itself steps and schedules the repeat, the click that follows it is swallowed so a press never steps twice, the repeat stops on reaching `min`/`max`, and a `pointerleave`/`pointercancel` clears the swallow flag so the next press is not lost. The accessible value text (aria-valuetext, accessibilityValue.text) is `leadingText` + the formatted value + a space + `trailingText` when those are set ("2 kg"), so the affix parts themselves are hidden from assistive technology on native. The label is a native `<label for>` (web/Lit) styled from this component's label bindings, not a Text. The Form value is the number's plain decimal string (see `name`); an empty field submits nothing. The Keyboard story renders one field with `min: 0`, `max: 20` so Home and End can be tried; the field is a single tab stop, so the three-focusable rule does not apply. Every keyboard rule is `expect: manual` on purpose — each changes a value rather than moving focus, which the keyboard gate cannot assert — so the stepping model is gated by the behavior scenarios above, and a rule added here needs a scenario, not a gate expectation.

## Content guidelines

Labels name the quantity with its unit when the field shows none ("Weight (kg)"), or use `unit`/`trailingText` and keep the label plain. Placeholders show a realistic example ("12.5"). Use `precision` to show the decimals the domain uses (prices 2, weights 1, counts 0).

## Accessibility

The input is a `spinbutton` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` carrying the formatted value (WCAG 4.1.2; APG spinbutton), labelled and described like Input (1.3.1, 3.3.2). Arrow keys give keyboard users the stepping the buttons give pointer users (2.1.1); the buttons are removed from the tab order so the field stays one stop, but they stay in the accessibility tree with their copy labels — a focusable control inside an aria-hidden (or accessibilityElementsHidden) subtree is a violation, so nothing here is hidden that way. On native the `adjustable` role with increment/decrement actions covers screen-reader users. Out-of-range and invalid values produce text errors linked to the field (3.3.1, 3.3.3). Targets and contrast as Input.

## Platform notes

### Web
Render Input's wrapper (label, description, field, error) with `<input type="text" inputmode="decimal" role="spinbutton" autocomplete="off" aria-valuenow aria-valuemin aria-valuemax aria-valuetext>` plus optional prefix/suffix `<span>`s and, unless `hideSteppers`, two system `Button`s (`ghost`, `sm` at both field sizes, `iconOnly`, `Icon name="minus"` / `"plus"`, labels from copy, `tabIndex={-1}`) each in a span carrying its data-part, inside a plain wrapper (not `aria-hidden`: they stay announced, they only leave the tab order), separated from the input by a hairline (`stepperDivider`, `stepperDividerWidth`). Parse with a small locale-aware routine (strip group separators, normalise the decimal separator) and format with `Intl.NumberFormat`. Keydown implements the table; hold-to-repeat with `motion.duration.base` initial delay and `motion.duration.fast` interval.

### Lit
`<ds-number-input label="Quantity" name="qty" min="1" max="99">`; form-associated; `DsFormField`; composed `change`.

### React Native
`TextInput` with `keyboardType="decimal-pad"`, `accessibilityRole="adjustable"`, `accessibilityValue={{ text }}`, `accessibilityActions` increment/decrement; steppers as system `Button`s (announced, one step per tap). Format with `Intl.NumberFormat`; parse as on web. Form registration as Input, with the number's decimal string (undefined when empty). Arrow/Page/Home/End keys only where onKeyPress delivers them; not on iOS software or most iOS hardware keyboards, where the adjustable actions step and there is no jump to a bound.

## Related

Input, Slider, Form, Button.
