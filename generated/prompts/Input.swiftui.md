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
- Controlled/uncontrolled pairs (`value`/`defaultValue`, `open`/`defaultOpen`) become a `Binding<T>?` parameter plus a `default` initial value, with `@State` holding the uncontrolled value.
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
        wrong and how to fix it.
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
      description: Fired on every value change with the new string value.
      platforms:
        web: onChange
        lit: change
        rn: onChangeText
        swiftui: onChange
    onFocus:
      description: Fired when the field receives focus.
      platforms:
        web: onFocus
        lit: focus (native, retargeted — no CustomEvent)
        rn: onFocus
        swiftui: onFocus
    onBlur:
      description: Fired when the field loses focus. The usual moment to validate.
      platforms:
        web: onBlur
        lit: blur (native, retargeted — no CustomEvent)
        rn: onBlur
        swiftui: onBlur
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
      locked: true
    descriptionText:
      token: color.foreground.muted
      locked: true
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
    partGap:
      token: space.1
      description: Vertical gap between label, description, field, and error.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    labelWeight:
      token: font.weight.medium
      locked: false
    helperSize:
      token: font.size.sm
      description: Description and error text size.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    minTargetSm:
      token: size.target.min
      description: The field height floor at size sm.
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Replaces borderWidth when focused (the field's border IS its focus
        ring — no outline); when the field is both invalid and focused the danger
        color stays and only the width changes, so the error is never hidden by focus.
        Padding shrinks by the difference so the field does not shift.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: Applied to the whole field group (label, description, field, error),
        as Button dims the whole control.
      locked: false
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
      large: true
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
      notes: The label is a real <label for=id>. Description and error are linked
        with aria-describedby; the error element has role="alert".
    lit:
      tag: ds-input
      reflect:
      - type
      - required
      - disabled
      - invalid
      notes: 'Uses ElementInternals (formAssociated = true) so a native <form> that
        directly contains ds-input sees its value and validity. Inside ds-form the
        association is by `name` (see Form). `value` behaves like a native input:
        undefined = uncontrolled; consumers control by rebinding `.value`. Exposes
        `currentValue`, `form`, `validity`, `checkValidity()`, `reportValidity()`.'
    rn:
      element: TextInput
      props:
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - keyboardType
      - textContentType
      - secureTextEntry
      notes: No label element — the label is rendered as Text and also passed as accessibilityLabel;
        description as accessibilityHint. `type` maps to keyboardType and textContentType.
        Errors use accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility
        (iOS). Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent
        such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur` and `onLongPress`
        to the native element, so Tooltip can attach to it.
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
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `paddingBlockSm`, `paddingInlineSm`, `partGap`, `fontFamily`, `fontSize`, `labelWeight`, `helperSize`, `lineHeight`, `disabledOpacity`
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

The field is uncontrolled unless `value` is provided. `onChange` fires with the string value on every keystroke; `onBlur` is the recommended moment to validate so users are not shouted at mid-word. Setting `error` marks the field invalid, shows the message in the error slot, and announces it. Clearing `error` removes the message and the invalid state. `disabled` fields are visible, readable, focusable (aria-disabled + readOnly on web — never the native disabled attribute), and skipped by the Form; `required` appends `copy.requiredIndicator` to the visible label and sets `aria-required`. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`), then browser/type validity where the platform has it. Inside a Fieldset the field reads `FieldsetContext`: `disabled` from the group applies as if set on the field, and on native the legend prefixes the accessibility label ("Shipping address, Street"). The label is a native `<label for>` (web/Lit) styled from Input's label bindings, not a Text; description and error are Text. `hideLabel` keeps the `<label>` in the DOM, visually hidden. `size: sm` swaps paddingBlock/paddingInline/minTarget for their Sm bindings and the type to font.size.sm; nothing else changes.

## Content guidelines

Labels are short nouns in sentence case ("Email address", not "Enter your email"). Descriptions are one sentence and state the rule, not the error. Errors say what is wrong and how to fix it ("Enter an email address like name@example.com") and never blame the user.

## Accessibility

The label is always visible and programmatically associated with the field (WCAG 1.3.1, 3.3.2). Description and error are linked with `aria-describedby` so they are read with the field, and the error region uses `role="alert"` so it is announced when it appears (3.3.1 Error Identification). Required and invalid states are conveyed by text and attributes, not by color alone (1.4.1). Focus is visible using the focus ring token (2.4.7). The field reaches the 44px comfortable target height. Personal-data fields carry `autocomplete` (1.3.5). Placeholder, description, and error text all meet AA contrast; the border meets 3:1 as a non-text UI boundary (1.4.11).

## Platform notes

### Web
Render `<label for>` + `<input id>` with `aria-describedby` pointing to the description and error ids. Use `aria-invalid="true"` when invalid. Never set `disabled` on the label.

### Lit
`<ds-input name="email" type="email" label="Email address">`. The element is form-associated via `ElementInternals`, so a surrounding native `<form>` (or `<ds-form>`) collects its value and reads its validity. Dispatches `change`, `focus`, and `blur` as composed events; `change` carries `{ value }` in `detail`.

### React Native
Renders a `Text` label, optional description, a `TextInput`, and an error `Text`. The label is also passed as `accessibilityLabel`, description as `accessibilityHint`, and `accessibilityState={{ disabled }}`. `type` maps to `keyboardType` (`email-address`, `numeric`, `phone-pad`, `url`) and `secureTextEntry` for password. The enclosing Form registers the input by `name` via context so it can collect values on submit.

## Related

Form, Text, Button.

## Behavior scenarios (12)

One test per scenario, in this order.

```yaml
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
