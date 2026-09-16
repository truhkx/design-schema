# Generate: Checkbox for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Checkbox.swift` declaring `public struct Checkbox: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/CheckboxBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Checkbox.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Checkbox") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Checkbox")` on the root and `"Checkbox.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Checkbox
  category: input
  status: review
  apg: checkbox
  anatomy:
  - control
  - indicator
  - label
  - description
  - errorMessage
  composition:
    indicator:
      component: Icon
      props:
        size: xs
      forwards:
        indicator: color
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
  props:
    label:
      type: string
      required: true
      description: Visible label. Clicking or tapping it toggles the control.
      a11y: Programmatically associated with the control (label/for on web, accessibilityLabel
        on native).
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name): a selection
        column in a Table, where the row name is the label.'
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form when collecting values.
    value:
      type: string
      default: 'on'
      description: What a native HTML <form> submits under `name` when checked (web
        and Lit only). The enclosing Form (React, React Native, ds-form) ignores it
        and collects the boolean `checked`. Checkboxes sharing a `name` are not a
        multi-select under Form; give each its own name.
    checked:
      type: boolean
      description: Controlled checked state. Omit for an uncontrolled control.
      controls:
        event: onChange
        default: defaultChecked
        state: checked
    defaultChecked:
      type: boolean
      default: false
      description: Initial state for an uncontrolled control.
    indeterminate:
      type: boolean
      default: false
      description: Shows the mixed indicator, for a parent checkbox whose children
        are partly selected. Visual and announced only; the submitted value still
        follows `checked`.
      a11y: Announced as "mixed" (aria-checked=mixed / accessibilityState checked
        "mixed").
    disabled:
      type: boolean
      default: false
      description: Cannot be toggled and is not submitted. Stays visible, readable
        and focusable.
    required:
      type: boolean
      default: false
      description: Must be checked to submit — for consent and agreement. Shown in
        the label, not only by color.
    invalid:
      type: boolean
      default: false
      description: Marks the control as failing validation. Usually set by the Form;
        can be set directly.
    description:
      type: string
      description: Persistent helper text below the label.
      a11y: Linked with aria-describedby / accessibilityHint.
    error:
      type: string
      description: The error message. Setting it marks the control invalid. Say what
        to do ("Accept the terms to continue").
      a11y: Rendered in the error slot with aria-describedby and role=alert.
  events:
    onChange:
      description: Fired when the checked state changes, with the new boolean.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: checked
        type: boolean
        description: The new checked state.
      fires:
      - user
  styles:
    controlBackground:
      token: color.control.background
      part: control
      locked: false
    controlBorder:
      token: color.control.border
      part: control
      locked: true
    controlBorderWidth:
      token: border.width.thin
      part: control
      locked: false
    controlSelectedBackground:
      token: color.control.selectedBackground
      part: control
      description: Checked and indeterminate fill; the border takes the same color.
      locked: true
    indicator:
      token: color.control.selectedForeground
      part: indicator
      description: 'The check mark (`Icon name="check"`, when checked) and the mixed
        dash (`Icon name="dash"`, when the mixed indicator shows) in this color, at
        `size: xs`, centered in the control; nothing is rendered when unchecked. The
        color reaches the Icon only through its `color` override (a token path); the
        Checkbox hook does not style the Icon. The web/Lit control is a void <input>,
        so the control and the indicator sit in a box wrapper span that stacks them
        in one cell: the input keeps `data-part="control"`, and the indicator is an
        aria-hidden span with `pointer-events: none` over the input holding the Icon,
        carrying `data-part="indicator"` (web) / `part="indicator"` and `data-part="indicator"`
        (Lit). On native the Icon sits inside the drawn control View.'
      locked: true
    indicatorStroke:
      token: border.width.focus
      part: indicator
      description: 'Stroke thickness of the check mark and dash. Locked, as Icon''s
        own strokeWidth is and on the same token, so the two already agree and nothing
        is forwarded into the composed Icon. It declares no --ds-checkbox-* hook on
        any platform: Icon already applies it.'
      locked: true
    pressedOverlay:
      token: opacity.disabled
      part: control
      state: pressed
      description: 'While pressed (web/Lit `:active`), an unchecked, not-mixed, enabled
        box shows controlSelectedBackground at this opacity over controlBackground;
        the border is unchanged. A checked or mixed box (already filled) and a disabled
        one show no overlay. Web/Lit: `color-mix(in srgb, <controlSelectedBackground>
        calc(<pressedOverlay> * 100%), <controlBackground>)` as the control background.
        Native: an absolutely filled overlay View inside the control, so the border
        does not fade.'
      locked: false
    controlBorderInvalid:
      token: color.border.danger
      part: control
      locked: false
    controlSize:
      token: space.5
      part: control
      locked: false
    controlRadius:
      token: radius.sm
      part: control
      locked: false
    gap:
      token: space.2
      part: label
      description: 'Horizontal gap between control and label (the row''s flex gap).
        The gap is part of the hit area: a press on it toggles.'
      locked: false
    partGap:
      token: space.1
      part: description
      description: Vertical gap between label and description (the text column inside
        the row), and between the row and the error message below it (the root column's
        gap).
      locked: false
    labelColor:
      token: color.foreground
      part: label
      description: 'Web/Lit: the native <label>''s own rule. Native: the label Text''s
        `default` tone, no hook.'
      locked: true
    labelSize:
      token: font.size.md
      part: label
      description: 'Web/Lit: the native <label>''s own rule. Native: forwarded to
        the label Text as its `fontSize` override (Text `size: md`).'
      locked: false
    labelWeight:
      token: font.weight.regular
      part: label
      description: 'Web/Lit: the native <label>''s own rule. Native: forwarded to
        the label Text as its `fontWeight` override (Text `weight: regular`).'
      locked: false
    helperSize:
      token: font.size.sm
      part: description
      description: Description and error text size. Reaches the composed Texts only
        through their `fontSize` override, with fontFamily and lineHeight forwarded
        the same way; no --ds-checkbox-* hook.
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed Text's `muted` tone; no --ds-checkbox-*
        hook.
      locked: true
    errorText:
      token: color.foreground.danger
      part: errorMessage
      description: Realised by the composed Text's `danger` tone; no --ds-checkbox-*
        hook.
      locked: true
    fontFamily:
      token: font.family.body
      part: label
      description: The label's own rule on web/Lit (forwarded to the label Text on
        native), and forwarded to the description and error Texts.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: label
      description: 'As fontFamily: the label''s own rule on web/Lit, forwarded to
        every composed Text.'
      locked: false
    focusRing:
      token: color.border.focus
      part: control
      description: 'Web/Lit: an outline of focusRingWidth in this color around the
        control on :focus-visible. Native (hardware keyboard focus): the control''s
        border takes this color at focusRingWidth while focused; the box keeps its
        size, so the glyph area shrinks by the width difference.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: control
      locked: true
    minTarget:
      token: size.target.comfortable
      part: control
      description: 'Minimum height of the control + label row; the whole row is the
        hit area, including the gap. The row has no vertical padding: it is at least
        this tall and centers the control and the text column on the cross axis. The
        error message sits below the row, outside the hit area.'
      locked: true
    disabledOpacity:
      token: opacity.disabled
      part: control
      description: Dims the control (with its indicator) and the label. The description
        and error stay at full opacity so they remain readable.
      locked: false
    transition:
      token: motion.duration.fast
      part: control
      description: Fill and indicator transitions, with motion.easing.standard.
      locked: false
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
    checked: Checked
    unchecked: Unchecked
    mixed: Mixed
  a11y:
    role: checkbox
    requires:
    - label-association
    - error-identification
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    contrast:
    - foreground: color.control.selectedForeground
      background: color.control.selectedBackground
      level: AA
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
    value: checked
    valueType: boolean
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
      - type=checkbox
      - id
      - name
      - value
      - aria-describedby
      - aria-invalid
      - aria-required
      - aria-checked
      notes: 'A native <input type="checkbox"> styled with appearance: none — never
        a visually hidden input under a fake box, so native form participation, click-on-label
        and Space all keep working. `indeterminate` is set as the DOM property (it
        has no attribute) and mirrored as aria-checked="mixed". The root is a wrapper
        div (data-ds), but the forwarded ref resolves to the <input>, the interactive
        native element, as in Input. A click whose target is the row itself (the gap)
        is forwarded to the input. Fieldset''s group `disabled` arrives as the `disabled`
        prop Fieldset passes to its direct child fields; there is no React FieldsetContext.
        copy.checked, copy.unchecked and copy.mixed are not used (native checked state
        plus aria-checked=mixed).'
    lit:
      tag: ds-checkbox
      reflect:
      - indeterminate
      - disabled
      - required
      - invalid
      notes: 'Form-associated via ElementInternals: setFormValue(checked ? value :
        null). The internal <input> is in the shadow root with delegatesFocus, and
        its native `change` is not composed, so re-dispatch a composed `change` CustomEvent
        from the host. `checked` behaves like a native input: the `checked` attribute
        is the initial state only and the property tracks the live state, so `checked`
        is not reflected. The property starts from the `checked` attribute, else `defaultChecked`,
        and every toggle updates it; there is no controlled mode on Lit. Native form
        value is `checked ? value : null` (native semantics); ds-form collects the
        boolean `checked` (`currentValue`, false when unchecked). Validity (ElementInternals)
        follows the same precedence as the rendered error. Group disabled: ds-fieldset
        sets the `disabled` property on its direct data-ds-field children (the host
        carries `data-ds-field`), and the field also honours formDisabledCallback
        from a native fieldset or form. Shadow parts use the anatomy names verbatim
        for both `part` and `data-part` (control, indicator, label, description, errorMessage).
        copy.checked, copy.unchecked and copy.mixed are not used.'
    rn:
      element: Pressable
      props:
      - accessibilityRole=checkbox
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      notes: 'No native checkbox in core RN. Render Pressable (the row) containing
        a drawn control View and the text column (label Text, description Text); accessibilityState={{
        checked: indeterminate ? "mixed" : checked, disabled }}. The label is a composed
        Text (`size: md`, `weight: regular`, tone default) with labelSize, labelWeight,
        fontFamily and lineHeight passed through its overrides. accessibilityLabel
        is the label plus copy.requiredIndicator when required, prefixed by the Fieldset
        legend from FieldsetContext (which also carries the group `disabled`) as ''<legend>,
        <label>''. The drawn control is hidden from accessibility (accessibilityElementsHidden,
        importantForAccessibility="no"), so the Pressable row is the one accessible
        element; RN tests check that instead of querying the control. The error Text
        renders below the Pressable, outside it (a tap on it does not toggle and it
        is not in the hint), separated by partGap. RN has no invalid accessibility
        state: invalid is shown by controlBorderInvalid and conveyed to assistive
        technology by the error text through accessibilityLiveRegion (Android) / AccessibilityInfo.announceForAccessibility
        (iOS), as in Input; RN tests of the error check its text. copy.checked, copy.unchecked
        and copy.mixed are not used.'
    swiftui:
      element: Toggle
      props:
      - Toggle
      - .toggleStyle=custom
      - .accessibilityValue
      - .accessibilityAddTraits
      - .frame=minHeight
      - .contentShape
      - Icon
      notes: A `Toggle` with a package `ToggleStyle` that draws the box from tokens
        and a `check`/`dash` Icon — SwiftUI exposes a Toggle to VoiceOver as a switch
        with on/off; the style adds `.accessibilityValue(copy.checked / copy.unchecked
        / copy.mixed)` so the state is spoken as a checkbox state (these three copy
        strings are used on SwiftUI only), and `indeterminate` sets the mixed value
        and the dash glyph. The label is the Toggle's label view (`hideLabel` → `.labelsHidden()`
        with `.accessibilityLabel`). Description and error as Input. Registers with
        the Form environment; `disabled` per the conventions.
  behavior:
  - name: click-on-control-toggles-on
    when:
      click: control
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: click-on-label-toggles
    when:
      click: label
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: click-on-description-toggles
    description: The description is not inside the label (it would join the accessible
      name); a click on it is forwarded to the control.
    given:
      description: One email a month about new features.
    when:
      click: description
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: space-toggles
    when:
      key: Space
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
    platforms:
    - web
    - lit
  - name: enter-is-ignored
    description: Enter submits the enclosing form on web; the component must not intercept
      it.
    when:
      key: Enter
    then:
    - event: onChange
      fired: false
    - state: checked
      is: false
    platforms:
    - web
    - lit
  - name: toggles-back-off
    given:
      defaultChecked: true
    when:
      click: control
    then:
    - event: onChange
      with: false
    - state: checked
      is: false
  - name: indeterminate-is-announced-as-mixed
    given:
      indeterminate: true
    then:
    - state: checked
      is: mixed
  - name: disabled-does-not-toggle
    given:
      disabled: true
    when:
      click: control
    then:
    - event: onChange
      fired: false
    - state: checked
      is: false
    - state: disabled
      is: true
  - name: disabled-stays-focusable
    description: aria-disabled, not the native attribute, so the control stays in
      the tab order.
    given:
      disabled: true
    then:
    - focusable: true
    platforms:
    - web
    - lit
  - name: required-is-shown-in-the-label
    given:
      required: true
    then:
    - copy: requiredIndicator
  - name: error-marks-invalid-and-is-announced
    description: RN has no invalid accessibility state or alert role; there it checks
      the error text, which is announced through the live region / announcement.
    given:
      error: Accept the terms to continue.
    then:
    - text: Accept the terms to continue.
    - state: invalid
      is: true
      platforms:
      - web
      - lit
    - role: alert
      platforms:
      - web
      - lit
  - name: controlled-follows-prop
    description: With `checked` provided the checkbox reports the change but does
      not flip on its own. Not Lit; there the `checked` property is the live state,
      like a native input, and only the attribute is initial.
    given:
      checked: false
    when:
      click: control
    then:
    - event: onChange
      with: true
    - state: checked
      is: false
    platforms:
    - web
    - rn
  - name: hidden-label-is-still-the-accessible-name
    description: hideLabel removes the label from view, not from the accessible name.
    given:
      hideLabel: true
    then:
    - name: true
  examples:
  - name: consent
    description: A required consent checkbox whose label is the agreement itself.
    given:
      label: I accept the terms of service
      name: terms
      required: true
  - name: select-all-parent
    description: A "select all" parent showing the mixed indicator while only some
      children are checked.
    given:
      label: Select all
      name: selectAll
      indeterminate: true
  - name: with-description
    description: An option whose scope needs one line of explanation under the label.
    given:
      label: Send me product updates
      name: updates
      description: One email a month about new features.
  - name: selection-column
    description: A row selection checkbox in a Table, where the row name is the hidden
      label.
    given:
      label: Select row
      name: select
      hideLabel: true
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `checked: boolean`
  - fires on: user

## Controlled state

- `checked` is controlled when given, uncontrolled from `defaultChecked` when omitted; changes reported by `onChange` (emit `onChange`); drives state `checked`

## Parts and slots

- `control`: element
- `indicator`: component `Icon`; props `size` = "xs"; forwards `indicator` → `overrides.color`
- `label`: element
- `description`: component `Text`; props `size` = "sm", `tone` = "muted"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `errorMessage`: component `Text`; props `size` = "sm", `tone` = "danger"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`

## Style bindings

- `controlBackground`: token `color.control.background`; part `control`
- `controlBorder`: token `color.control.border`; part `control`; locked
- `controlBorderWidth`: token `border.width.thin`; part `control`
- `controlSelectedBackground`: token `color.control.selectedBackground`; part `control`; locked
- `indicator`: token `color.control.selectedForeground`; part `indicator`; locked
- `indicatorStroke`: token `border.width.focus`; part `indicator`; locked
- `pressedOverlay`: token `opacity.disabled`; part `control`; state `pressed`
- `controlBorderInvalid`: token `color.border.danger`; part `control`
- `controlSize`: token `space.5`; part `control`
- `controlRadius`: token `radius.sm`; part `control`
- `gap`: token `space.2`; part `label`
- `partGap`: token `space.1`; part `description`
- `labelColor`: token `color.foreground`; part `label`; locked
- `labelSize`: token `font.size.md`; part `label`
- `labelWeight`: token `font.weight.regular`; part `label`
- `helperSize`: token `font.size.sm`; part `description`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `errorText`: token `color.foreground.danger`; part `errorMessage`; locked
- `fontFamily`: token `font.family.body`; part `label`
- `lineHeight`: token `font.lineHeight.normal`; part `label`
- `focusRing`: token `color.border.focus`; part `control`; locked
- `focusRingWidth`: token `border.width.focus`; part `control`; locked
- `minTarget`: token `size.target.comfortable`; part `control`; locked
- `disabledOpacity`: token `opacity.disabled`; part `control`
- `transition`: token `motion.duration.fast`; part `control`

## Form and overlay

```yaml
form:
  role: field
  value: checked
  valueType: boolean
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

- example `consent`, story `Consent`: given `label: "I accept the terms of service"`, `name: "terms"`, `required: true`; A required consent checkbox whose label is the agreement itself.
- example `select-all-parent`, story `SelectAllParent`: given `label: "Select all"`, `name: "selectAll"`, `indeterminate: true`; A "select all" parent showing the mixed indicator while only some children are checked.
- example `with-description`, story `WithDescription`: given `label: "Send me product updates"`, `name: "updates"`, `description: "One email a month about new features."`; An option whose scope needs one line of explanation under the label.
- example `selection-column`, story `SelectionColumn`: given `label: "Select row"`, `name: "select"`, `hideLabel: true`; A row selection checkbox in a Table, where the row name is the hidden label.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `controlBackground`, `controlBorderWidth`, `pressedOverlay`, `controlBorderInvalid`, `controlSize`, `controlRadius`, `gap`, `partGap`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `controlBorder`, `controlSelectedBackground`, `indicator`, `indicatorStroke`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth`, `minTarget`

## Platform notes (swiftui)

```yaml
element: Toggle
props:
- Toggle
- .toggleStyle=custom
- .accessibilityValue
- .accessibilityAddTraits
- .frame=minHeight
- .contentShape
- Icon
notes: "A `Toggle` with a package `ToggleStyle` that draws the box from tokens and\
  \ a `check`/`dash` Icon \u2014 SwiftUI exposes a Toggle to VoiceOver as a switch\
  \ with on/off; the style adds `.accessibilityValue(copy.checked / copy.unchecked\
  \ / copy.mixed)` so the state is spoken as a checkbox state (these three copy strings\
  \ are used on SwiftUI only), and `indeterminate` sets the mixed value and the dash\
  \ glyph. The label is the Toggle's label view (`hideLabel` \u2192 `.labelsHidden()`\
  \ with `.accessibilityLabel`). Description and error as Input. Registers with the\
  \ Form environment; `disabled` per the conventions."
```

## Guidance

## Overview

A checkbox is a single yes/no choice that the user makes and then submits, as opposed to a Switch, which takes effect the moment it is flipped. Groups of checkboxes are a multi-select; a single checkbox is consent, an agreement, or an option.

## When to use

Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`), or several, each with its own `name`, when the user may pick any number of items. Use `indeterminate` on a "select all" parent when only some of its children are checked.

## When not to use

Do not use a Checkbox for a setting that applies immediately without a submit step; use Switch. Do not use it to pick exactly one of several options; use RadioGroup. Do not use a lone checkbox as an on/off for something with a strong, immediate effect (sound, notifications) — that is a Switch even if it sits in a form.

## Behavior

Clicking or tapping anywhere on the row — control, label, or description — toggles the state and fires `onChange` with the new boolean. The description is not inside the label (it would join the accessible name); a click on it is forwarded to the control. Space toggles from the keyboard; Enter does not (it submits the enclosing form on web, and the component must not intercept that). The whole row is the hit area, including the gap between control and label; the error message below the row is not. Uncontrolled unless `checked` is provided (on Lit the `checked` property is always the live state; see the Lit note). `onChange` fires only for a user toggle: nothing fires on mount, and a controlled `checked` catching up with a change already reported does not fire again. Toggling an `indeterminate` checkbox sets `checked` to `!checked` and clears the mixed indicator locally (aria-checked, the DOM property, the dash) until the `indeterminate` prop changes value again; a consumer that keeps passing `true` unchanged sees it cleared. Consumers who own the mixed state update `indeterminate` in `onChange`, and decide what happens to the children. `disabled` controls are visible, readable and focusable (`aria-disabled`, not the native attribute), and are skipped by the Form; `disabledOpacity` dims the control and label, not the description or error. `required` appends `copy.requiredIndicator` to the label and sets `aria-required`; the indicator is plain label text at the label's size and color (not aria-hidden) and is part of the accessible name on every platform, including the native accessibilityLabel. Error display: the error slot shows `error` when set, else the Form's message, else — only while `invalid` is true — `copy.required` if the box is required and unchecked, otherwise `copy.invalid`. Validity (`validationMessage`, ElementInternals) follows the same order — the same as Input. The Form marks a failing field by setting its `invalid` and never sets `error`. Inside a Form, `validate: blur` means "on change" for a checkbox; there is no useful blur moment. The Form (React, React Native, ds-form) collects the boolean `checked` under `name` — `false` when unchecked. `value` is only what a native HTML `<form>` submits when checked (web and Lit). Several checkboxes sharing a `name` are not a multi-select under Form: give each its own name. Inside a Fieldset the group's `disabled` applies as if set on the field — on web through the `disabled` prop Fieldset passes to its direct child fields, on Lit through the `disabled` property ds-fieldset sets on its direct data-ds-field children (or formDisabledCallback from a native fieldset/form), and on native through `FieldsetContext`, which also carries the legend that prefixes the accessibility label ("Shipping address, Street"). The label is a native `<label for>` on web/Lit, styled from Checkbox's label bindings, and a composed Text on native; description and error are Text.

## Content guidelines

Labels are short, positive statements of what checking does ("Send me product updates"), never negated ("Do not send me…") — a negated checkbox is a double negative when unchecked. Descriptions explain consequence or scope in one sentence. Errors say what to do, not what is wrong ("Accept the terms to create your account").

## Accessibility

The label is visible and associated with the control (WCAG 1.3.1, 3.3.2), so the accessible name is the label and the whole row is the target. The state is conveyed by the native checked state or `aria-checked`, including `mixed` (4.1.2), and the visual indicator is a shape — check mark, dash — not only a color change (1.4.1). Description and error are linked with `aria-describedby`, and the error uses `role="alert"` (3.3.1). Focus is visible on the control with the focus ring (2.4.7). The row is at least 44px tall on every platform and the control itself is 20px, inside the 24px minimum target when the row is the hit area (2.5.8). The selected fill and the rest border both meet 3:1 against the page background as UI component boundaries (1.4.11), and the indicator meets 4.5:1 on the selected fill; the build checks all pairs.

## Platform notes

### Web
Render `<input type="checkbox">` with `appearance: none` and draw the box in CSS using the control tokens; the check mark and dash are the composed Icon in the indicator span stacked over the input (see the `indicator` binding). Label it with `<label for>`, link description and error with `aria-describedby`. For disabled, set `aria-disabled` and call `preventDefault()` in both `click` and `change` handlers (checkboxes ignore `readOnly`) so the input stays focusable but does not toggle. `aria-checked` is set only to `"mixed"` when indeterminate; the native checked state covers the rest. Set `input.indeterminate = true` via the DOM property and add `aria-checked="mixed"`; browsers do not expose the property as an attribute.

### Lit
`<ds-checkbox>` is form-associated (`static formAssociated = true`) so a native `<form>` sees `name`/`value`, and inside `<ds-form>` it is collected by `name` like `ds-input`. The inner `<input>` lives in the shadow root with `delegatesFocus: true`; because the native `change` event is not composed, re-dispatch a composed `change` CustomEvent with `detail: { checked }`. Expose `checkValidity()` and `reportValidity()` for `required`.

### React Native
There is no checkbox in core React Native. Render a `Pressable` with `accessibilityRole="checkbox"`, `accessibilityLabel` (the label plus `copy.requiredIndicator` when required, legend-prefixed inside a Fieldset), `accessibilityHint={description}` and `accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}`, containing a `View` drawn with the control tokens and a `Text` label. The pressed state is an overlay View inside the unchecked box showing `controlSelectedBackground` at `pressedOverlay` opacity. Space on a hardware keyboard is handled by the platform when the role is set. Errors are announced as in Input.

## Related

Switch, RadioGroup, Form, Input.

## Behavior scenarios (12)

One test per scenario, in this order.

```yaml
- name: click-on-control-toggles-on
  when:
    click: control
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: click-on-label-toggles
  when:
    click: label
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: click-on-description-toggles
  description: The description is not inside the label (it would join the accessible
    name); a click on it is forwarded to the control.
  given:
    description: One email a month about new features.
  when:
    click: description
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: toggles-back-off
  given:
    defaultChecked: true
  when:
    click: control
  then:
  - event: onChange
    with: false
  - state: checked
    is: false
- name: indeterminate-is-announced-as-mixed
  given:
    indeterminate: true
  then:
  - state: checked
    is: mixed
- name: disabled-does-not-toggle
  given:
    disabled: true
  when:
    click: control
  then:
  - event: onChange
    fired: false
  - state: checked
    is: false
  - state: disabled
    is: true
- name: required-is-shown-in-the-label
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: error-marks-invalid-and-is-announced
  description: RN has no invalid accessibility state or alert role; there it checks
    the error text, which is announced through the live region / announcement.
  given:
    error: Accept the terms to continue.
  then:
  - text: Accept the terms to continue.
- name: hidden-label-is-still-the-accessible-name
  description: hideLabel removes the label from view, not from the accessible name.
  given:
    hideLabel: true
  then:
  - name: true
- name: renders
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
