# Generate: Input for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Input.swift` declaring `public struct Input: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/InputBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Input.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Input") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Input")` on the root and `"Input.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Input
  category: input
  status: review
  anatomy:
  - label
  - description
  - field
  - errorMessage
  props:
    label:
      type: string
      required: true
      description: Visible label (visually hidden with `hideLabel`). Never replaced
        by a placeholder.
      a11y: Programmatically associated with the field (label/for on web, accessibilityLabel
        on native).
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form when collecting values.
    value:
      type: string
      description: Controlled value. Omit for an uncontrolled field.
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: Initial value for an uncontrolled field.
    placeholder:
      type: string
      description: Example input shown while empty. Never the only description of
        what to enter.
      a11y: Placeholder text is muted and disappears on input; it is not a substitute
        for label or description.
    description:
      type: string
      description: Persistent helper text below the label explaining format or purpose.
      a11y: Linked to the field with aria-describedby / accessibilityHint.
    type:
      type: enum
      values:
      - text
      - email
      - password
      - number
      - search
      - tel
      - url
      default: text
      description: Input type. Drives the keyboard on touch platforms and browser
        validation on web.
    required:
      type: boolean
      default: false
      description: The field must have a value to submit. Shown in the label, not
        only by color.
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
      description: Not editable and not submitted. Stays visible and readable.
    invalid:
      type: boolean
      default: false
      description: Marks the field as failing validation. Usually set by the Form;
        can be set directly.
    error:
      type: string
      description: The error message. Setting it implies `invalid`. Explain what is
        wrong and how to fix it. An empty string counts as unset, so it implies nothing
        and never leaves an empty alert.
      a11y: Rendered in the error slot with aria-describedby and role=alert so it
        is announced when it appears.
    autocomplete:
      type: string
      description: HTML autocomplete token (e.g. `email`, `given-name`). Enables WCAG
        1.3.5 input-purpose identification.
      platforms:
      - web
      - lit
  events:
    onChange:
      description: Fired on every value change with the new string value, and nothing
        else (web handlers do not receive the ChangeEvent).
      platforms:
        web: onChange
        lit: change
        rn: onChangeText
        swiftui: onChange
      payload:
      - name: value
        type: string
        description: The new value.
      fires:
      - user
    onFocus:
      description: 'Fired when the field receives focus. No payload: web and rn handlers
        are called with no arguments, not the FocusEvent (a forwarded Tooltip handler
        gets none either).'
      platforms:
        web: onFocus
        lit: focus (native, retargeted — no CustomEvent)
        rn: onFocus
        swiftui: onFocus
      fires:
      - user
    onBlur:
      description: 'Fired when the field loses focus. The usual moment to validate.
        No payload: web and rn handlers are called with no arguments, not the FocusEvent.'
      platforms:
        web: onBlur
        lit: blur (native, retargeted — no CustomEvent)
        rn: onBlur
        swiftui: onBlur
      fires:
      - user
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
    errorText:
      token: color.foreground.danger
      description: Realised by the composed Text's `danger` tone; no --ds-input-*
        hook, since a hook could not reach the child without restyling it.
      locked: true
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed Text's `muted` tone; no --ds-input-* hook,
        as for errorText.
      locked: true
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
      locked: false
    paddingBlock:
      token: space.sm
      by: size
      values:
        sm: space.1
      locked: false
    partGap:
      token: space.1
      description: Vertical gap between label, description, field, and error.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.{size}
      description: The field text and the label, so the label follows `size`; description
        and error use helperSize.
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      description: On web and Lit the native label's weight. On native the label is
        the system Text with `weight="medium"`, its size following `size`, and an
        override is forwarded as that Text's fontWeight.
      locked: false
    helperSize:
      token: font.size.sm
      description: Description and error text size. Reaches them only through the
        composed Text's `overrides` (fontSize), with fontFamily and lineHeight forwarded
        the same way; it has no --ds-input-* hook, so page CSS sizes helper text through
        Text's own hooks. The description and error Texts are `size="sm"`, matching
        this default, with the override forwarded on top. fontFamily and lineHeight
        keep their root hooks as well, for the label and the field.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    minTargetSm:
      token: size.target.min
      description: The field height floor at size sm. Locked like minTarget (an accessibility
        floor, not an override), so the sm floor is always size.target.min.
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Replaces borderWidth when focused (the field's border IS its focus
        ring — no outline); when the field is both invalid and focused the danger
        color stays and only the width changes, so the error is never hidden by focus.
        Padding shrinks by the difference on both axes — inline and block, since compensating
        only the inline one would still move the field vertically — and the compensation
        is clamped at zero, so a borderWidth override wider than this locked width
        leaves the padding alone rather than eating into it.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: 'Applied to the whole field group (label, description, field, error),
        as Button dims the whole control. The group is the root wrapper that also
        carries partGap; it is not an anatomy part (web: the div with data-ds; Lit:
        an unnamed wrapper in the shadow root; native: the outer View with testID="Input").'
      locked: false
    transition:
      token: motion.duration.fast
      description: Border color on focus and invalid, with motion.easing.standard.
        Border width and padding change instantly (no layout animation). Instant under
        reduced motion. An override changes the duration only; the easing stays motion.easing.standard.
        Native swaps instantly, so the binding stays in the native overrides type
        for parity and an override of it has no effect there.
      locked: false
  constants:
    longPressDelay:
      description: 'Native only: how long a press on the TextInput is held before
        the forwarded onLongPress fires (the Pressable default, which TextInput lacks).
        Web, Lit and SwiftUI read it nowhere and emit nothing for it — a constant
        may be single-platform, and this one is.'
      value: 500
      unit: ms
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: textbox
    requires:
    - label-association
    - error-identification
    - focus-visible
    - keyboard-operable
    - target-44px
    - contrast-aa
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
      element: input
      attributes:
      - id
      - name
      - type
      - aria-describedby
      - aria-invalid
      - aria-required
      - autocomplete
      notes: 'The label is a real <label for=id>. The field id is the `id` prop when
        given, else `<form.idBase>-<name>` inside a Form (so the error summary''s
        links resolve), else a generated id; the description and error ids are derived
        from it, and `description`, `error` and `field` are the shadow-scoped names
        Lit uses for the same three. Description and error are linked with aria-describedby;
        the error element has role="alert", which on Lit is a plain attribute on the
        composed ds-text host — the element a test can read — not on the block inside
        its shadow root. The forwarded ref targets the <input> (so focus() and select()
        work), not the root wrapper; `onChange` carries the string alone, so a consumer
        who needs the native event (selectionStart, for instance) goes through that
        ref, which is the accepted cost of one signature on four platforms. `required`
        sets `aria-required` only and never the native `required` attribute, which
        would let the browser raise its own validation bubble; the message always
        comes from the copy block through setCustomValidity. `readOnly` passes through
        the native attribute alone and sets no aria-readonly. The native `<input size>`
        attribute (character width) is dropped from the prop surface on web as on
        Lit: this schema''s `size` enum is the meaning that wins. The public prop
        is the schema''s `autocomplete` spelling, and React''s `autoComplete` is omitted
        from the passthrough so one thing has one name. `data-ds-field` sits on the
        root group beside `data-ds`, never on the <input>, so Form discovery finds
        the whole field. A disabled field keeps its error text and its `aria-invalid`:
        only the custom validity is cleared, since the Form skips it rather than pretending
        it passed. validity follows the full precedence through setCustomValidity
        with the copy message (cleared when the field passes or is disabled); because
        a custom error makes validity.valid false, the browser/type step reads the
        specific flags (typeMismatch, badInput, patternMismatch, range, step, length).
        `readOnly` is not a schema prop but passes through the native input props;
        `disabled` forces it on.'
    lit:
      tag: ds-input
      reflect:
      - type
      - size
      - required
      - disabled
      - invalid
      notes: 'Uses ElementInternals (formAssociated = true) so a native <form> that
        directly contains ds-input sees its value and validity. A disabled field is
        left out of setFormValue and out of validity, as a native disabled control
        is, while staying focusable and read-only — the field is never given the native
        disabled attribute. On web the native `<input size>` attribute (character
        width) is dropped from the prop surface: this schema''s `size` enum is the
        meaning that wins. Inside ds-form the association is by `name` (see Form);
        the host carries `data-ds-field`. `value` is property-only (no attribute,
        since a native `value` attribute means the default): undefined = uncontrolled;
        consumers control by rebinding `.value`. The initial value''s attribute is
        `default-value`. Controlled mode reverts like React: after dispatching `change`
        the field shows `.value` again unless a listener rebound it synchronously,
        so rebind in the handler, not asynchronously. `hideLabel` is the `hide-label`
        attribute, not reflected. Inside a native fieldset or form, the group''s disabled
        arrives through formDisabledCallback; ds-fieldset sets `disabled` on the field
        itself. Exposes `currentValue`, `form`, `validity`, `checkValidity()`, `reportValidity()`.
        `formResetCallback` restores the uncontrolled value to `defaultValue` and
        leaves `invalid` and `error` alone (the Form owns one, the consumer the other).
        The mechanism for "focusable and read-only" is the native `readonly` attribute
        on the inner input beside `aria-disabled="true"`, which has the consequence
        that a disabled field still reports a retargeted native `focus` — readonly
        inputs are focusable, and that is the point. `currentValue` is always a string,
        `''''` when empty, never null; the Form treats the two alike. When `helperSize`,
        `fontFamily` or `lineHeight` are forwarded to the description and error Texts,
        the `overrides` object is always passed, with `undefined` for the keys the
        consumer did not set, rather than withheld — a no-op for Text and one code
        path instead of two. Clearing a non-empty `error` writes the shared `invalid`
        bit back to false, which also clears an `invalid` a consumer set independently;
        it stays cleared until the next validation pass restores it, an accepted window
        that comes from the two states sharing one reflected attribute. The disabled
        state tests read is `aria-disabled="true"` on the inner input, which never
        has the native `disabled` attribute; the invalid state is the reflected `invalid`
        on the host plus `aria-invalid="true"` on the inner input. `focus: field`
        focuses the inner input, and the test asserts the retargeted native `focus`
        on the host. The browser/type step forwards the inner input''s whole ValidityState
        to `setValidity` with the copy.invalid message. The parts carry `part` as
        well as `data-part`, both the anatomy names, for addressing only.'
    rn:
      element: TextInput
      props:
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - keyboardType
      - textContentType
      - secureTextEntry
      notes: 'No label element — the label is rendered as Text and also passed as
        accessibilityLabel; description as accessibilityHint. `type` maps to keyboardType
        and textContentType. Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility
        (iOS). Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent
        such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur`, `onPressOut`
        and `onLongPress` to the native element, so Tooltip can attach to it. TextInput
        has no hover or long-press handlers: `onHoverIn`/`onHoverOut` map to `onPointerEnter`/`onPointerLeave`,
        and `onLongPress` fires from `onPressIn` after the longPressDelay constant
        unless `onPressOut` comes first. The accessibilityHint is `description` then
        a forwarded hint, joined with a space; a forwarded accessibilityLabel replaces
        `label` as the name, and a Fieldset legend still goes in front ("Shipping
        address, <label>"). Disabled uses `editable={false}` with `accessibilityState.disabled`:
        iOS cannot keep a non-editable TextInput focusable, so the field is not focusable
        on native and the disabled state is announced instead. `hideLabel` does not
        render the label Text, so the `label` part has no native home while hidden
        and the name lives only in accessibilityLabel. There is no required accessibility
        state: required is conveyed by the copy.requiredIndicator label text alone,
        and the error by the live region / announcement, not role=alert. The label,
        description and errorMessage parts are plain wrapper Views carrying `testID="Input.<part>"`
        around the composed Text, because Text takes no testID (as in Fieldset); the
        error wrapper also carries the Android accessibilityLiveRegion. Inside a Form
        with an error summary the live region and the iOS announcement are suppressed,
        since the Form announces (see Form). react-native-web drops `accessibilityState`,
        so disabled is mirrored as `aria-disabled` on both the TextInput and the root
        group View that carries disabledOpacity; the group is what makes a web accessibility
        checker treat the dimmed label and value as disabled. `returnKeyType` and
        `onSubmitEditing` come from the Form context (next field, or submit on the
        last), which owns the order. email, password and url set `autoCapitalize="none"`
        and `autoCorrect={false}`; text, number and search have `textContentType="none"`,
        and search keeps `keyboardType="default"`. A disabled Form reaches the field
        through its context, beside FieldsetContext. The forwarded ref is the root
        group View (the package ref convention), so a consumer''s ref cannot focus
        the field: focus reaches it through the Form context''s focus handle, which
        is also what moves between fields. `type` maps to keyboardType and textContentType
        in full — email, number, tel and url to their own keyboards, password and
        search to `default`; textContentType is `none` for text, number and search,
        `telephoneNumber` for tel, `URL` for url and `password` for password. `returnKeyType`
        is `next` for every field but the last in the Form''s order and `done` for
        the last. When a forwarded `onPressOut` is what cancels a pending long press,
        it still fires: cancelling the timer is not cancelling the press. `hideLabel`
        removes the visible label and with it the visible required marker, but the
        indicator stays inside accessibilityLabel, so a hidden-label required field
        still announces as required. `placeholder` never contributes to the accessible
        name. A field that mounts already holding an error announces it on mount.
        `transition` is accepted in the overridable union for parity and has no effect
        here — the one override on this platform that does nothing.'
    swiftui:
      element: TextField
      props:
      - TextField
      - SecureField
      - .textFieldStyle=plain
      - .keyboardType
      - .textContentType
      - .textInputAutocapitalization
      - .autocorrectionDisabled
      - .focused
      - .submitLabel
      - .accessibilityLabel
      - .accessibilityHint
      - .accessibilityValue
      notes: 'Label `Text` above (visually hidden with `hideLabel` — still the `.accessibilityLabel`),
        description `Text`, the field (`TextField` or `SecureField` for `type: password`)
        inside a bordered `RoundedRectangle` drawn from the tokens (`.textFieldStyle(.plain)`;
        the border is the focus ring when focused), and the error `Text` announced
        through `AccessibilityNotification.Announcement` when it appears. `type` maps
        to `.keyboardType` (`.emailAddress`, `.numberPad`, `.phonePad`, `.URL`) and
        `autocomplete` to `.textContentType`. `description` and `error` are joined
        into `.accessibilityHint`; `invalid` adds copy.invalid to the value; `required`
        appends the indicator to the visible label. Registers with the Form environment.
        `size: sm` swaps the Sm bindings.'
  behavior:
  - name: typing-reports-the-new-value
    description: onChange fires with the string value on every keystroke.
    when:
      type: a
    then:
    - event: onChange
      with: a
  - name: focus-is-reported
    description: onFocus fires when the field receives focus.
    when:
      focus: field
    then:
    - event: onFocus
  - name: required-is-shown-in-the-label
    description: required appends copy.requiredIndicator to the visible label and
      sets aria-required - text and attributes, not color alone.
    given:
      required: true
    then:
    - copy: requiredIndicator
    - attribute: aria-required
      is: 'true'
      platforms:
      - web
  - name: error-is-announced-when-it-appears
    description: The error is rendered in the error slot with role=alert so it is
      announced when it appears (WCAG 3.3.1).
    given:
      error: Enter an email address like name@example.com
    then:
    - role: alert
      platforms:
      - web
      - lit
  - name: disabled-stays-focusable-and-is-announced
    description: 'Disabled fields are visible, readable and focusable (aria-disabled,
      never the native disabled attribute). On rn only the disabled state holds: the
      field is not focusable there (see the rn notes).'
    given:
      disabled: true
    then:
    - state: disabled
      is: true
    - focusable: true
      platforms:
      - web
      - lit
  examples:
  - name: email-with-a-description
    description: A field whose format matters, with persistent helper text and the
      matching touch keyboard.
    given:
      label: Email address
      name: email
      type: email
      description: Use the email you signed up with.
  - name: required-field
    description: A field that must have a value to submit, marked in the label rather
      than by color.
    given:
      label: Full name
      name: name
      required: true
  - name: field-with-an-error
    description: A field failing validation, whose message says what is wrong and
      how to fix it.
    given:
      label: Email address
      name: email
      type: email
      error: Enter an email address like name@example.com
  - name: dense-grid-editor
    description: A small field inside a grid cell, where the column header already
      names it.
    given:
      label: Quantity
      name: quantity
      type: number
      size: sm
      hideLabel: true
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: string`
  - fires on: user
- `onFocus`: emit `onFocus`
  - fires on: user
- `onBlur`: emit `onBlur`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Style bindings

- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `paddingInline`: token `space.md`; by `size`: sm → `space.2`, any other value → `space.md`
- `paddingBlock`: token `space.sm`; by `size`: sm → `space.1`, any other value → `space.sm`
- `labelWeight`: token `font.weight.medium`; part `label`

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

## Constants and examples

- constant `longPressDelay`: 500 ms
- example `email-with-a-description`, story `EmailWithADescription`: given `label: "Email address"`, `name: "email"`, `type: "email"`, `description: "Use the email you signed up with."`; A field whose format matters, with persistent helper text and the matching touch keyboard.
- example `required-field`, story `RequiredField`: given `label: "Full name"`, `name: "name"`, `required: true`; A field that must have a value to submit, marked in the label rather than by color.
- example `field-with-an-error`, story `FieldWithAnError`: given `label: "Email address"`, `name: "email"`, `type: "email"`, `error: "Enter an email address like name@example.com"`; A field failing validation, whose message says what is wrong and how to fix it.
- example `dense-grid-editor`, story `DenseGridEditor`: given `label: "Quantity"`, `name: "quantity"`, `type: "number"`, `size: "sm"`, `hideLabel: true`; A small field inside a grid cell, where the column header already names it.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `partGap`, `fontFamily`, `fontSize`, `labelWeight`, `helperSize`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `errorText`, `descriptionText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: TextField
props:
- TextField
- SecureField
- .textFieldStyle=plain
- .keyboardType
- .textContentType
- .textInputAutocapitalization
- .autocorrectionDisabled
- .focused
- .submitLabel
- .accessibilityLabel
- .accessibilityHint
- .accessibilityValue
notes: "Label `Text` above (visually hidden with `hideLabel` \u2014 still the `.accessibilityLabel`),\
  \ description `Text`, the field (`TextField` or `SecureField` for `type: password`)\
  \ inside a bordered `RoundedRectangle` drawn from the tokens (`.textFieldStyle(.plain)`;\
  \ the border is the focus ring when focused), and the error `Text` announced through\
  \ `AccessibilityNotification.Announcement` when it appears. `type` maps to `.keyboardType`\
  \ (`.emailAddress`, `.numberPad`, `.phonePad`, `.URL`) and `autocomplete` to `.textContentType`.\
  \ `description` and `error` are joined into `.accessibilityHint`; `invalid` adds\
  \ copy.invalid to the value; `required` appends the indicator to the visible label.\
  \ Registers with the Form environment. `size: sm` swaps the Sm bindings."
```

## Guidance

## Overview

Input collects a single line of text. It bundles the label, helper text, field, and error message so that the association between them is always correct — the most common accessibility failure in forms is a field whose label or error is only visually nearby.

## When to use

Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type` for the value so touch keyboards and browser validation match. Provide `description` when the format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the value is personal data so browsers and assistive tools can fill it.

## When not to use

Do not use Input for multi-line content (use TextArea, planned), for choosing from a fixed set (use Select or RadioGroup, planned), or for on/off values (use Checkbox or Switch, planned). Do not use `placeholder` as the label; it vanishes as soon as the user types and fails contrast in most systems.

## Behavior

The field is uncontrolled unless `value` is provided. `onChange` fires with the string value on every keystroke; `onBlur` is the recommended moment to validate so users are not shouted at mid-word. Setting `error` marks the field invalid, shows the message in the error slot, and announces it. Clearing `error` removes the message and the invalid state that `error` implied; an `invalid` set by the Form or the consumer stays until they clear it (on Lit, where setting `error` also writes the reflected `invalid`, clearing a non-empty `error` writes it back to false and ds-form sets it again on its next validation). `required` counts only the empty string as empty, as a native field does: whitespace passes. `disabled` fields are visible, readable, focusable (aria-disabled + readOnly on web — never the native disabled attribute), and skipped by the Form: the field stays registered and reports itself through the registration's `isDisabled()`, one mechanism for every field (Switch and Checkbox use the same), and the Form leaves a disabled field out of its values and out of the order its "next" key walks; `required` appends `copy.requiredIndicator` to the visible label and sets `aria-required`; the indicator is plain label text (not aria-hidden) and stays part of the accessible name. A read-only field that is not disabled is still submitted and validated, as a native one is. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`), then browser/type validity where the platform has it — which also reports `copy.invalid`, never the browser's own validationMessage, so all user-facing text comes from the copy block. The error slot shows `error` when set; otherwise it shows a message only while `invalid` is true (set directly or by the Form): `copy.required` for an empty required field, else `copy.invalid` — the `required` step is conditioned on emptiness, so a required field that holds a value and fails for another reason reports `copy.invalid`, not `copy.required`. An empty required field that is not yet invalid shows nothing, so the user is not flagged before typing. `validationMessage`/validity always follow the full precedence. The Form marks a failing field by setting its `invalid` and clears it when the field passes; it never sets `error`, which stays the consumer's. On web and native that mark is the field's entry in the Form context (`errors[name]`), which the field treats exactly as a Form-set `invalid`: its presence marks the field invalid; on Lit ds-form sets the property. The error slot's order is then: the `error` prop, the Form's context entry, the `invalid`-derived copy, and an entry with an empty message falls through to the derived copy. The field's own `validate()` ignores that entry, since it is what the Form calls to produce it. The visible slot and `validationMessage` may differ: an untouched empty required field reports valueMissing with `copy.required` while its slot shows nothing. The description and error Texts carry their `data-part` on the composed Text's root, as in Fieldset; that is a name, not styling. A disabled Form disables its fields on every platform. Inside a Fieldset `disabled` from the group applies as if set on the field — on web through the `disabled` prop Fieldset passes to its children, on Lit through the property ds-fieldset sets (or formDisabledCallback from a native fieldset/form), and on native through `FieldsetContext`, which also carries the legend that prefixes the accessibility label ("Shipping address, Street"). The label is a native `<label for>` (web/Lit) styled from Input's label bindings, not a Text; description and error are Text. `hideLabel` keeps the `<label>` in the DOM, visually hidden (web/Lit; see the native note). `size: sm` swaps paddingBlock/paddingInline/minTarget for their Sm bindings and the type of the field and the label to font.size.sm (description and error stay at helperSize); nothing else changes.

## Content guidelines

Labels are short nouns in sentence case ("Email address", not "Enter your email"). Descriptions are one sentence and state the rule, not the error. Errors say what is wrong and how to fix it ("Enter an email address like name@example.com") and never blame the user.

## Accessibility

The label is always visible and programmatically associated with the field (WCAG 1.3.1, 3.3.2). Description and error are linked with `aria-describedby` so they are read with the field, and the error region uses `role="alert"` so it is announced when it appears (3.3.1 Error Identification). Required and invalid states are conveyed by text and attributes, not by color alone (1.4.1). Focus is visible using the focus ring token (2.4.7): the `focus-visible` requirement is met by the border itself (borderFocus at focusRingWidth, padding compensating), with no separate outline. The field reaches the 44px comfortable target height. Personal-data fields carry `autocomplete` (1.3.5). Placeholder, description, and error text all meet AA contrast; the border meets 3:1 as a non-text UI boundary (1.4.11).

## Platform notes

### Web
Render `<label for>` + `<input id>` with `aria-describedby` pointing to the description and error ids. Use `aria-invalid="true"` when invalid. Never set `disabled` on the label.

### Lit
`<ds-input name="email" type="email" label="Email address">`. The element is form-associated via `ElementInternals`, so a surrounding native `<form>` (or `<ds-form>`) collects its value and reads its validity. Dispatches `change`, `focus`, and `blur` as composed events; `change` carries `{ value }` in `detail`.

### React Native
Renders a `Text` label, optional description, a `TextInput`, and an error `Text`. The label is also passed as `accessibilityLabel`, description as `accessibilityHint`, and `accessibilityState={{ disabled }}`. `type` maps to `keyboardType` (`email-address`, `numeric`, `phone-pad`, `url`) and `secureTextEntry` for password. The enclosing Form registers the input by `name` via context so it can collect values on submit.

## Related

Form, Text, Button.

## Behavior scenarios (16)

One test per scenario, in this order.

```yaml
- name: typing-reports-the-new-value
  description: onChange fires with the string value on every keystroke.
  when:
    type: a
  then:
  - event: onChange
    with: a
- name: focus-is-reported
  description: onFocus fires when the field receives focus.
  when:
    focus: field
  then:
  - event: onFocus
- name: required-is-shown-in-the-label
  description: required appends copy.requiredIndicator to the visible label and sets
    aria-required - text and attributes, not color alone.
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: disabled-stays-focusable-and-is-announced
  description: 'Disabled fields are visible, readable and focusable (aria-disabled,
    never the native disabled attribute). On rn only the disabled state holds: the
    field is not focusable there (see the rn notes).'
  given:
    disabled: true
  then:
  - state: disabled
    is: true
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-type-text
  given:
    type: text
  then:
  - renders: true
  derived: true
- name: renders-type-email
  given:
    type: email
  then:
  - renders: true
  derived: true
- name: renders-type-password
  given:
    type: password
  then:
  - renders: true
  derived: true
- name: renders-type-number
  given:
    type: number
  then:
  - renders: true
  derived: true
- name: renders-type-search
  given:
    type: search
  then:
  - renders: true
  derived: true
- name: renders-type-tel
  given:
    type: tel
  then:
  - renders: true
  derived: true
- name: renders-type-url
  given:
    type: url
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
