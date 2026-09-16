# Generate: RadioGroup as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/RadioGroup.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `RadioGroup.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: RadioGroupVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `RadioGroup.test.ts`.

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
    radioDescription:
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
      part: radio
      locked: true
    controlBorder:
      token: color.control.border
      part: radio
      locked: true
    controlBorderWidth:
      token: border.width.thin
      part: radio
      locked: false
    controlSelectedBackground:
      token: color.control.selectedBackground
      part: radio
      description: Selected border color; the fill stays controlBackground and the
        dot is drawn inside.
      locked: true
    indicator:
      token: color.control.selectedBackground
      part: radioIndicator
      description: 'The centre dot, controlSize minus 2 × space.1 in diameter. One
        rule on every platform: the dot carries a hook only where it is a real node.
        Web/Lit draw it as a pseudo-element of the appearance:none input (::before
        or ::after, either is fine), which has no data-part or part; on native it
        is a View inside the drawn control carrying testID="RadioGroup.radioIndicator".'
      locked: true
    controlBorderInvalid:
      token: color.border.danger
      part: radio
      locked: false
    controlSize:
      token: space.5
      part: radio
      locked: false
    controlRadius:
      token: radius.full
      part: radio
      locked: false
    optionPaddingBlock:
      token: space.1
      part: radio
      description: Block padding of each option row (the row wrapper holding radio,
        radioLabel and radioDescription; not an anatomy part). The row still meets
        minTarget.
      locked: false
    optionTextGap:
      token: space.1
      part: radioDescription
      description: Vertical gap between an option's radioLabel and its radioDescription.
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
      part: radioLabel
      locked: true
    labelSize:
      token: font.size.md
      part: radioLabel
      locked: false
    labelWeight:
      token: font.weight.regular
      part: radioLabel
      locked: false
    helperSize:
      token: font.size.sm
      description: Size of description, radioDescription and errorMessage; reaches
        the composed Text only through its fontSize override.
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed Text's tone muted (description and radioDescription);
        declares no hook of its own.
      locked: true
    errorText:
      token: color.foreground.danger
      part: errorMessage
      description: Realised by the composed Text's tone danger; declares no hook of
        its own.
      locked: true
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    focusRing:
      token: color.border.focus
      part: radio
      description: On focus-visible the radio's border becomes focusRingWidth in this
        color, replacing controlBorderWidth/controlBorder (web, Lit and native alike);
        the option row is not outlined.
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: radio
      locked: true
    minTarget:
      token: size.target.comfortable
      description: Minimum height of each option row; the whole row is the hit area.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: Dims option rows only. A disabled option in an enabled group dims
        its own row; a disabled group dims every option row once (not stacked with
        the option's own opacity) and leaves legend, description and errorMessage
        at full opacity.
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
        component declares. The root fieldset carries data-part="group"; every other
        part with a node carries its anatomy name verbatim (data-part="radioLabel",
        "radioDescription", "errorMessage"). The radioIndicator is a ::before or ::after
        pseudo-element of the input (either is fine) with no node of its own, so it
        has no hook on web or Lit (native: see the rn note). aria-invalid and aria-required
        go on the fieldset only, never on the individual radios. copy.position is
        not rendered on web or Lit: native radios sharing a name already announce
        their position. Native radios sharing a name already implement roving tabindex
        and arrow-key movement; do not reimplement it. A disabled option uses the
        real `disabled` attribute so native arrow movement skips it (the one place
        the system prefers `disabled` over aria-disabled); a disabled group uses aria-disabled
        on the fieldset and every radio plus preventDefault guards, so it stays focusable
        but inert. Each radio has its own <label for>; option descriptions are linked
        per radio with aria-describedby. The group error is linked from the fieldset.'
    lit:
      tag: ds-radio-group
      reflect:
      - orientation
      - required
      - disabled
      - invalid
      notes: 'Form-associated (setFormValue(value)). The radios are rendered inside
        the shadow root from the `options` property, so they share one root and native
        grouping by name works; the native change is not composed, so re-dispatch
        a composed `change` CustomEvent with detail { value }. `options` is a property,
        not an attribute. The shadow fieldset has role="radiogroup" (plain attribute,
        as on web), data-part and part "group"; other parts use the anatomy names
        verbatim in camelCase for both `part` and `data-part` (radioLabel, radioDescription,
        errorMessage); radioIndicator is a pseudo-element with no part. Ids do not
        cross the shadow root: option ids are `${name || ''radio-group''}-${value}`
        inside it, and the description/error ids the fieldset references live there
        too. aria-invalid goes on the fieldset only. Host focus() is overridden to
        focus the checked radio, else the first enabled one (delegatesFocus alone
        would pick the first in tree order). While the group is disabled, click, arrow
        keys and Space are preventDefault-ed on the fieldset, since native radios
        move and select on arrows regardless of aria-disabled. The host carries data-ds-field;
        group disabled from a Fieldset arrives as the `disabled` property ds-fieldset
        sets, or through formDisabledCallback from a native fieldset/form.'
    rn:
      element: View
      props:
      - accessibilityRole=radiogroup
      - accessibilityLabel
      - accessibilityHint
      notes: 'The group is a View with accessibilityRole="radiogroup"; each option
        is a Pressable with accessibilityRole="radio" and accessibilityState={{ checked,
        disabled }}. There is no roving tabindex or arrow movement on native — every
        radio is a stop for the screen reader and for hardware-keyboard focus. That
        is the platform convention, not a defect. Validation precedence is Input''s
        (error → required → invalid with copy.invalid). Individually disabled options
        use accessibilityState.disabled and a press guard, never the Pressable `disabled`
        prop, so they stay reachable. Hooks: the root View is the group part and carries
        testID="RadioGroup" (there is no separate RadioGroup.group); the drawn dot
        is a real View carrying testID="RadioGroup.radioIndicator"; other parts use
        RadioGroup.<part>. The group accessibilityLabel is the visible legend including
        copy.requiredIndicator, so required is announced, prefixed by a Fieldset legend
        from FieldsetContext ("<legend>, <label>"), which also supplies group disabled.
        Each radio''s accessibilityLabel is `${label}, ${description}` when it has
        a description, else the label, and its accessibilityValue={{ text }} is copy.position
        ("1 of 3"). The focus ring replaces the drawn control''s border, not the row.
        Native limits: no arrow keys or roving tabindex (each radio is a screen-reader
        and keyboard stop, the accessible alternative), and no invalid accessibility
        state (the error is announced through the live region / announcement as in
        Input). Behavior tests on rn check that onChange does not fire, the copy text,
        and the radios'' unchecked state, not a disabled or invalid state attribute.'
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
        `VStack`/`HStack`. Registers with the Form environment as one field; group
        disabled and the legend prefix come from FieldsetContext.'
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
      On rn the test checks that onChange does not fire and the radio stays unchecked.
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
      - lit
  - name: required-is-shown-in-the-legend
    description: required appends copy.requiredIndicator to the legend, not only a
      color.
    given:
      required: true
    then:
    - copy: requiredIndicator
  - name: invalid-renders-the-invalid-copy
    description: The displayed error is error, then the Form's message, then while
      invalid copy.required (required and nothing selected) else copy.invalid; with
      only invalid set the group renders copy.invalid and is marked invalid. On rn
      the test checks the copy text only.
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

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: string`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)

## Parts and slots

- `group`: element
- `legend`: element
- `description`: component `Text`; props `size` = "sm", `tone` = "muted"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `radio`: element
- `radioIndicator`: element
- `radioLabel`: element
- `radioDescription`: component `Text`; props `size` = "sm", `tone` = "muted"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `errorMessage`: component `Text`; props `size` = "sm", `tone` = "danger"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`

## Style bindings

- `controlBackground`: token `color.control.background`; part `radio`; locked
- `controlBorder`: token `color.control.border`; part `radio`; locked
- `controlBorderWidth`: token `border.width.thin`; part `radio`
- `controlSelectedBackground`: token `color.control.selectedBackground`; part `radio`; locked
- `indicator`: token `color.control.selectedBackground`; part `radioIndicator`; locked
- `controlBorderInvalid`: token `color.border.danger`; part `radio`
- `controlSize`: token `space.5`; part `radio`
- `controlRadius`: token `radius.full`; part `radio`
- `optionPaddingBlock`: token `space.1`; part `radio`
- `optionTextGap`: token `space.1`; part `radioDescription`
- `legendColor`: token `color.foreground`; part `legend`; locked
- `legendSize`: token `font.size.md`; part `legend`
- `legendWeight`: token `font.weight.medium`; part `legend`
- `labelColor`: token `color.foreground`; part `radioLabel`; locked
- `labelSize`: token `font.size.md`; part `radioLabel`
- `labelWeight`: token `font.weight.regular`; part `radioLabel`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `errorText`: token `color.foreground.danger`; part `errorMessage`; locked
- `focusRing`: token `color.border.focus`; part `radio`; locked
- `focusRingWidth`: token `border.width.focus`; part `radio`; locked

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

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `controlBorderWidth`, `controlBorderInvalid`, `controlSize`, `controlRadius`, `optionPaddingBlock`, `optionTextGap`, `optionGap`, `listGap`, `partGap`, `legendSize`, `legendWeight`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `controlBackground`, `controlBorder`, `controlSelectedBackground`, `indicator`, `legendColor`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth`, `minTarget`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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
    On rn the test checks that onChange does not fire and the radio stays unchecked.
  given:
    disabled: true
  when:
    click: radio
  then:
  - event: onChange
    fired: false
  - state: disabled
    is: true
- name: required-is-shown-in-the-legend
  description: required appends copy.requiredIndicator to the legend, not only a color.
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: invalid-renders-the-invalid-copy
  description: The displayed error is error, then the Form's message, then while invalid
    copy.required (required and nothing selected) else copy.invalid; with only invalid
    set the group renders copy.invalid and is marked invalid. On rn the test checks
    the copy text only.
  given:
    invalid: true
  then:
  - copy: invalid
  - state: invalid
    is: true
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
  - state: invalid
    is: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-radio-group
reflect:
- orientation
- required
- disabled
- invalid
notes: 'Form-associated (setFormValue(value)). The radios are rendered inside the
  shadow root from the `options` property, so they share one root and native grouping
  by name works; the native change is not composed, so re-dispatch a composed `change`
  CustomEvent with detail { value }. `options` is a property, not an attribute. The
  shadow fieldset has role="radiogroup" (plain attribute, as on web), data-part and
  part "group"; other parts use the anatomy names verbatim in camelCase for both `part`
  and `data-part` (radioLabel, radioDescription, errorMessage); radioIndicator is
  a pseudo-element with no part. Ids do not cross the shadow root: option ids are
  `${name || ''radio-group''}-${value}` inside it, and the description/error ids the
  fieldset references live there too. aria-invalid goes on the fieldset only. Host
  focus() is overridden to focus the checked radio, else the first enabled one (delegatesFocus
  alone would pick the first in tree order). While the group is disabled, click, arrow
  keys and Space are preventDefault-ed on the fieldset, since native radios move and
  select on arrows regardless of aria-disabled. The host carries data-ds-field; group
  disabled from a Fieldset arrives as the `disabled` property ds-fieldset sets, or
  through formDisabledCallback from a native fieldset/form.'
```

## Guidance

## Overview

A radio group asks one question and takes one answer. Its strength is that every option is visible at once, so the user can compare before choosing; its cost is vertical space, which is why it suits short sets.

## When to use

Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give options a `description` when the label alone does not tell them apart. Set `defaultValue` when there is a sensible default; leave the group unselected when the choice is consequential and you want a deliberate answer.

## When not to use

Do not use a RadioGroup for more than about seven options or for options the user must scroll to see; use Select (planned). Do not use it for a yes/no; use Checkbox or Switch. Do not use it for an immediate mode switch in a toolbar; that is a SegmentedControl (planned). Do not let a user deselect: once a radio is chosen, one is always chosen.

## Behavior

Clicking or tapping an option row selects it and fires `onChange` with its value. From the keyboard, Tab moves into the group (to the selected radio, or the first when none is selected), arrow keys move the selection between enabled options and wrap around, and Space selects a focused radio that the arrows did not already select. Tab leaves the group. Individual disabled options are natively disabled and skipped by the arrows; they stay visible and readable but are not focus stops — a deliberate exception to the system's aria-disabled rule, because a radio that can be reached but not chosen is more confusing than one that is skipped. Uncontrolled unless `value` is provided. Disabled options are skipped by arrow movement and cannot be selected; a fully `disabled` group is focusable but inert. A disabled option in an enabled group dims its row with `disabledOpacity`; a disabled group dims the option rows once (no stacking) and keeps legend, description and error at full opacity. `required` appends `copy.requiredIndicator` to the legend — plain legend text that stays part of the group's accessible name on every platform — and sets `aria-required` on the group. The error shown is: the `error` prop; else the Form's message; else, only while `invalid` is true, `copy.required` when the group is required and nothing is selected, otherwise `copy.invalid`. `validate()` checks `required` then `invalid`, as Input does. A standalone required group with nothing selected therefore shows `copy.required` only once it is marked invalid (directly or by Form validation), never before. Inside a Form, `validate: blur` runs when focus leaves the whole group (web/Lit: focus-out of the fieldset), not when it moves between radios; `validate: change` validates on each change; native has no group blur and validates on change. The Form collects the selected value, or nothing (no key) when none is selected. Inside a Fieldset, `disabled` from the group applies as if set on the field — on web through the `disabled` prop Fieldset passes to the RadioGroup (React has no FieldsetContext), on Lit through the `disabled` property ds-fieldset sets on data-ds-field children (or formDisabledCallback), and on RN and SwiftUI through `FieldsetContext`, which also carries the legend that prefixes the accessibility label ("Shipping address, Plan"). `copy.position` ("1 of 3") is spoken on native only — SwiftUI's accessibilityValue and each RN radio's accessibilityValue text; web and Lit do not render it. The Default story renders the shipping-method example with nothing selected (no `defaultValue`), so a click on the first radio reports `standard`.

## Content guidelines

The legend is a question or a noun phrase for what is being chosen ("Shipping method"). Option labels are parallel — all nouns or all short phrases — sentence case, and never end in a full stop. Put the recommended or most common option first, not the default; `defaultValue` marks the default. Option descriptions are one line: price, timing, consequence.

## Accessibility

The group is exposed with role `radiogroup` (native `fieldset`/`legend` on web) and its legend is the group's accessible name (WCAG 1.3.1, 3.3.2); each radio's name is its own label. Selection is exposed as checked state (4.1.2) and shown by the dot, not by color alone (1.4.1). The group follows the APG radio pattern for keyboard: one tab stop, arrows to move and select (2.1.1). Description and error are linked from the group (3.3.1), with the error announced when it appears. Each option row reaches the 44px target (2.5.8). Selected and rest control borders meet 3:1 on the page background (1.4.11); the build checks the pairs.

## Platform notes

### Web
Render `<fieldset role="radiogroup">` with `<legend>` and, per option, `<input type="radio" name value id>` plus `<label for>`; style the input with `appearance: none` and draw the ring and dot with the control tokens. Native radios with a shared `name` provide roving tabindex and arrow movement, so do not add `tabindex` or key handlers. Link the group description and error to the `<fieldset>` with `aria-describedby`, and per-option descriptions to their radio. Per-option `disabled` is the native attribute; group `disabled` is `aria-disabled` on the fieldset and radios with `preventDefault()` guards. Option ids are `${groupId}-${value}`. A `<legend>` does not take part in the fieldset's flex gap, so `partGap` below it is a margin.

### Lit
`<ds-radio-group>` takes `options` as a property (`.options=${[...]}`) and renders the fieldset and radios inside its shadow root, where the shared `name` groups them natively. It is form-associated: `setFormValue(value)` on change, and `checkValidity()` / `reportValidity()` implement `required`. Re-dispatch a composed `change` CustomEvent with `detail: { value }`. Reflect `orientation`, `required`, `disabled` and `invalid`. The shadow fieldset sets `role="radiogroup"` as on web; option ids are `${name || 'radio-group'}-${value}` within the shadow root; `focus()` targets the checked radio, else the first enabled one.

### React Native
Render a `View` with `accessibilityRole="radiogroup"`, `accessibilityLabel` (the legend with `copy.requiredIndicator` when required) and `accessibilityHint={description}` — not `accessible`, or the radios would collapse into it; on iOS this means the legend reaches VoiceOver as the preceding `Text`, not as a group name (platform limit) — a `Text` legend, and one `Pressable` per option with `accessibilityRole="radio"`, `accessibilityLabel` (`${label}, ${description}`, or the label alone), `accessibilityValue={{ text: copy.position }}`, and `accessibilityState={{ checked: value === option.value, disabled }}`. Arrow-key movement does not exist on native; every radio is its own focus stop, and there is no group-level blur, so `validate: blur` runs on change. On a failed submit the Form focuses the first enabled radio. The group error is announced as in Input.

## Related

Checkbox, Switch, Form, Select (planned).
