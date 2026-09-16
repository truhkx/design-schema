# Generate: Switch for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Switch.swift` declaring `public struct Switch: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/SwitchBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Switch.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Switch") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Switch")` on the root and `"Switch.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Switch
  category: input
  status: review
  apg: switch
  anatomy:
  - track
  - thumb
  - label
  - description
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
  props:
    label:
      type: string
      required: true
      description: Visible label naming the thing being turned on or off. Also the
        accessible name.
      a11y: Associated with the control (label/for on web, accessibilityLabel on native).
    name:
      type: string
      description: Optional field name. When inside a Form the state is collected
        as a boolean on every platform; most switches are not in forms. A Switch never
        validates and never appears in an error summary.
    checked:
      type: boolean
      description: 'Controlled state (web, RN, SwiftUI): a controlled switch shows
        a new state only once this prop changes. Omit for an uncontrolled control.
        Lit has no controlled mode: the `checked` property is the live state like
        a native input (it starts from the `checked` attribute, else `defaultChecked`,
        and every toggle updates it).'
      controls:
        event: onChange
        default: defaultChecked
        state: checked
    defaultChecked:
      type: boolean
      default: false
      description: Initial state for an uncontrolled control.
    disabled:
      type: boolean
      default: false
      description: Cannot be toggled. Stays visible, readable and focusable on web,
        Lit and SwiftUI; a disabled native React Native Switch is not focusable (platform
        limit, see platforms.rn.notes). Still registered with the Form, where the
        Form's disabled-field rule applies, as for Checkbox.
    description:
      type: string
      description: Persistent helper text below the label explaining the effect.
      a11y: Linked with aria-describedby / accessibilityHint.
    labelPosition:
      type: enum
      values:
      - start
      - end
      default: start
      description: Where the label sits relative to the track. `start` (label, then
        switch at the row end) is the settings-list convention; `end` matches Checkbox.
  events:
    onChange:
      description: Fired when the user changes the state, with the new boolean. The
        change is already in effect; there is nothing to submit. A controlled prop
        change fires nothing, a press that asks for the current value (next equals
        checked) fires nothing, and nothing fires on mount.
      platforms:
        web: onChange
        lit: change
        rn: onValueChange
        swiftui: onChange
      payload:
      - name: checked
        type: boolean
        description: The new state.
      fires:
      - user
      timing:
        phase: after-change
  styles:
    trackOff:
      token: color.control.trackOff
      part: track
      locked: true
    trackOn:
      token: color.control.selectedBackground
      part: track
      locked: true
    thumb:
      token: color.control.selectedForeground
      part: thumb
      description: 'Thumb color in both states. Web and Lit draw the thumb the same
        way: a `::before` pseudo-element of the native input, so the thumb part has
        no element and no data-part/part hook on either platform; its bindings are
        the input''s own rules. RN: no view (the native Switch draws it), so there
        is no `Switch.thumb` testID. SwiftUI: a shape in the ToggleStyle.'
      locked: true
    trackWidth:
      token: space.10
      part: track
      description: 'Overridable on web, Lit and SwiftUI. RN: drawn by the native Switch,
        so it is not in the RN overridable binding type.'
      locked: false
    trackHeight:
      token: space.6
      part: track
      description: 'As trackWidth: not overridable on RN.'
      locked: false
    thumbSize:
      token: space.5
      part: thumb
      description: Thumb diameter; it travels trackWidth − thumbSize − 2 × thumbInset.
        Not overridable on RN.
      locked: false
    thumbInset:
      token: space.1
      part: thumb
      description: Gap between the thumb and the track edge; split evenly on the short
        axis. Not overridable on RN.
      locked: false
    radius:
      token: radius.full
      part: track
      description: Applies to both the track and the thumb. Not overridable on RN.
      locked: false
    gap:
      token: space.3
      part: label
      description: 'Gap between track and label (the row''s flex gap). The gap is
        part of the hit area: a click or press on it toggles.'
      locked: false
    partGap:
      token: space.1
      part: description
      description: Vertical gap between label and description (the text column).
      locked: false
    labelColor:
      token: color.foreground
      part: label
      locked: true
    labelSize:
      token: font.size.md
      part: label
      description: 'Also sets the track alignment: the track sits at the top of the
        row, centred on the label''s first line (labelSize × lineHeight), as Checkbox.'
      locked: false
    labelWeight:
      token: font.weight.regular
      part: label
      locked: false
    helperSize:
      token: font.size.sm
      part: description
      description: Description text size. Reaches the composed Text only through its
        `fontSize` override, with fontFamily and lineHeight forwarded the same way;
        no --ds-switch-* hook.
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed Text's `muted` tone; no --ds-switch-*
        hook.
      locked: true
    fontFamily:
      token: font.family.body
      part: label
      description: The label's own rule, and forwarded to the description Text.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: label
      description: 'As fontFamily: the label''s own rule, forwarded to the description
        Text.'
      locked: false
    focusRing:
      token: color.border.focus
      part: track
      description: 'Web/Lit/SwiftUI only. RN: the native Switch has no focus events,
        so the OS focus indicator is used and this binding is not applied.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: track
      description: Drawn around the track, offset by focusRingWidth like every other
        control. Not applied on RN (OS indicator).
      locked: true
    minTarget:
      token: size.target.comfortable
      part: label
      description: 'Minimum block size of the full-width row (web/Lit: min-block-size;
        RN: the row''s minHeight). The row has no vertical padding. The whole row
        toggles, including the gap between label and track.'
      locked: true
    disabledOpacity:
      token: opacity.disabled
      part: track
      description: Dims the track (with its thumb), the label and the description.
      locked: false
    transition:
      token: motion.duration.fast
      part: thumb
      description: 'Thumb travel and track color, with motion.easing.standard. Under
        reduced motion both are removed: the thumb jumps and the color changes instantly.
        Not applied on RN (OS animation).'
      locked: false
  a11y:
    role: switch
    requires:
    - accessible-name
    - label-association
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    - reduced-motion
    contrast:
    - foreground: color.control.selectedForeground
      background: color.control.selectedBackground
      level: AA
      nonText: true
      state: checked
    - foreground: color.control.selectedForeground
      background: color.control.trackOff
      level: AA
      nonText: true
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.trackOff
      background: color.background
      level: AA
      nonText: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
  form:
    role: field
    value: checked
    valueType: boolean
    name: name
    discovery: context
  platforms:
    web:
      element: input
      attributes:
      - type=checkbox
      - role=switch
      - id
      - name
      - aria-describedby
      - aria-checked
      notes: 'A native <input type="checkbox" role="switch"> styled with appearance:
        none. Keeps label association, Space toggling and form participation for free;
        role=switch makes screen readers say "on/off" instead of "checked". The track
        and thumb are drawn in CSS on the input itself: the input carries data-part="track"
        and the thumb is its ::before pseudo-element, with no hook. The input stays
        uncontrolled for its native checked state (no React-held `checked` on the
        element, so a prevented click on a disabled switch cannot leave the DOM out
        of step); the component tracks the state and mirrors it as aria-checked. The
        row is a full-width flex row with min-block-size minTarget and no padding;
        a click whose target is the row itself (the gap) or the description is forwarded
        to the input. The track sits at the top of the row, centred on the label''s
        first line (calc from labelSize × lineHeight). Group disabled: Fieldset passes
        `disabled` to its direct child fields; there is no React FieldsetContext.
        Registered with Form like Checkbox, including when disabled.'
    lit:
      tag: ds-switch
      reflect:
      - name
      - disabled
      - label-position
      notes: 'Form-associated like ds-checkbox: the native form value is "on" or null
        (native semantics) while ds-form collects `currentValue` as a boolean. `name`
        is reflected so a name set as a property is still submitted by a native <form>.
        Shadow root with delegatesFocus; the native change is not composed, so re-dispatch
        a composed `change` CustomEvent with detail { checked }. `checked` behaves
        like a native input: the attribute is the initial state only, the property
        is the live state (starts from the attribute, else `defaultChecked`, and follows
        every toggle), and it is not reflected; there is no controlled mode on Lit.
        The host sets data-ds-field="change" (ds-form discovers fields by attribute
        and validates this one on change). DsFormField: `required` is always false,
        `validationMessage` is empty, checkValidity()/reportValidity() always return
        true, and there is no `error` property. Group disabled: ds-fieldset sets the
        `disabled` property on its direct data-ds-field children, and the switch also
        honours formDisabledCallback from a native fieldset or form. The thumb is
        the input''s ::before pseudo-element, as on web, with no part; shadow parts
        otherwise use the anatomy names verbatim for `part` and `data-part` (track
        on the input, label, description).'
    rn:
      element: Switch
      props:
      - accessibilityRole=switch
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - trackColor
      - thumbColor
      - ios_backgroundColor
      notes: 'Uses the native Switch for platform-native feel; trackOn/trackOff map
        to trackColor {true, false} and thumb to thumbColor; ios_backgroundColor =
        trackOff. Platform limits: track and thumb sizes, radius, thumb travel and
        the focus ring are the OS values (trackWidth, trackHeight, thumbSize, thumbInset,
        radius, focusRing*, transition are not applied); a disabled native Switch
        is not focusable (the Switch receives `disabled`, the documented exception
        to the no-disabled-on-Pressable rule; accessibilityState.disabled still announces
        it, and the label and description stay readable). The label row is a Pressable
        wrapping the Switch so the whole row toggles; minTarget is the row''s minHeight
        and the row has no padding and no frame around the track. The native Switch
        draws its own track and thumb, so trackWidth, trackHeight, thumbSize, thumbInset,
        radius and transition are omitted from the RN overridable binding union (they
        stay overridable on web, Lit and SwiftUI); the gap and text bindings are overridable.
        `Switch.track` is the testID of the native Switch; the thumb has no view and
        no testID. The focus ring is the OS focus indicator (focusRing/focusRingWidth
        not applied). Behavior scenarios that `click: track` fire valueChange on the
        switch role in RN tests; clicks on the label or description fire press. Group
        disabled and name: FieldsetContext carries `disabled` and the legend; the
        accessibilityLabel is prefixed ''<legend>, <label>'' (the '', '' separator
        is fixed punctuation, not copy).'
    swiftui:
      element: Toggle
      props:
      - Toggle
      - .toggleStyle=custom
      - .accessibilityValue
      - .labelsHidden
      - Animation
      notes: 'A `Toggle` with a package `ToggleStyle`: the track and thumb are drawn
        from the tokens (`trackOn`/`trackOff`/`thumb`) — not the system switch, which
        cannot take the theme — with the thumb travel animated over the `transition`
        binding unless reduced motion. VoiceOver reads it as a switch with on/off
        (`.accessibilityValue`), the label from the label view; `hideLabel` uses `.labelsHidden()`.
        `checkedLabel`/`uncheckedLabel` copy becomes the value text. Group disabled
        and name: FieldsetContext carries `disabled` and the legend; the accessibility
        label is prefixed ''<legend>, <label>'' (fixed punctuation, not copy).'
  behavior:
  - name: click-on-track-toggles-on
    description: 'RN has no click on the native Switch: RN tests fire valueChange
      on the switch role (and press on the label or description).'
    when:
      click: track
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
    description: The whole row is the target; the description is not inside the label
      but forwards its click.
    given:
      description: Sends a daily summary at 9:00.
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
    description: Enter is neither intercepted nor used to toggle.
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
      click: track
    then:
    - event: onChange
      with: false
    - state: checked
      is: false
  - name: disabled-does-not-toggle
    given:
      disabled: true
    when:
      click: track
    then:
    - event: onChange
      fired: false
    - state: checked
      is: false
    - state: disabled
      is: true
  - name: disabled-stays-focusable
    description: Disabled switches are visible, readable and focusable (aria-disabled,
      not the native attribute). The native React Native Switch is the documented
      exception.
    given:
      disabled: true
    then:
    - focusable: true
    platforms:
    - web
    - lit
  - name: controlled-follows-prop
    description: With `checked` provided the switch reports the change but does not
      flip on its own. Not Lit; there the `checked` property is the live state, like
      a native input, and only the attribute is initial.
    given:
      checked: false
    when:
      click: track
    then:
    - event: onChange
      with: true
    - state: checked
      is: false
    platforms:
    - web
    - rn
  - name: controlled-updates-on-set
    given:
      checked: false
    when:
      set:
        checked: true
    then:
    - state: checked
      is: true
  - name: description-is-rendered
    given:
      description: Sends a daily summary at 9:00.
    then:
    - text: Sends a daily summary at 9:00.
  - name: label-at-the-end-still-toggles-the-row
    description: labelPosition changes the order of the row, not its target; the whole
      row toggles either way.
    given:
      labelPosition: end
    when:
      click: label
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  examples:
  - name: settings-row
    description: The settings-list convention, with the label at the start and the
      switch at the row end.
    given:
      label: Email notifications
      labelPosition: start
  - name: with-description
    description: A switch whose effect is stated in one sentence under the label.
    given:
      label: Daily summary
      description: Sends a daily summary at 9:00.
  - name: checkbox-aligned
    description: The Checkbox-aligned form, with the switch before its label.
    given:
      label: Show archived
      labelPosition: end
  - name: disabled
    description: A setting that cannot be changed here, still visible, readable and
      focusable.
    given:
      label: Two-factor authentication
      disabled: true
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `checked: boolean`
  - fires on: user
  - timing: after-change

## Controlled state

- `checked` is controlled when given, uncontrolled from `defaultChecked` when omitted; changes reported by `onChange` (emit `onChange`); drives state `checked`

## Parts and slots

- `track`: element
- `thumb`: element
- `label`: element
- `description`: component `Text`; props `size` = "sm", `tone` = "muted"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`

## Style bindings

- `trackOff`: token `color.control.trackOff`; part `track`; locked
- `trackOn`: token `color.control.selectedBackground`; part `track`; locked
- `thumb`: token `color.control.selectedForeground`; part `thumb`; locked
- `trackWidth`: token `space.10`; part `track`
- `trackHeight`: token `space.6`; part `track`
- `thumbSize`: token `space.5`; part `thumb`
- `thumbInset`: token `space.1`; part `thumb`
- `radius`: token `radius.full`; part `track`
- `gap`: token `space.3`; part `label`
- `partGap`: token `space.1`; part `description`
- `labelColor`: token `color.foreground`; part `label`; locked
- `labelSize`: token `font.size.md`; part `label`
- `labelWeight`: token `font.weight.regular`; part `label`
- `helperSize`: token `font.size.sm`; part `description`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `fontFamily`: token `font.family.body`; part `label`
- `lineHeight`: token `font.lineHeight.normal`; part `label`
- `focusRing`: token `color.border.focus`; part `track`; locked
- `focusRingWidth`: token `border.width.focus`; part `track`; locked
- `minTarget`: token `size.target.comfortable`; part `label`; locked
- `disabledOpacity`: token `opacity.disabled`; part `track`
- `transition`: token `motion.duration.fast`; part `thumb`

## Form and overlay

```yaml
form:
  role: field
  value: checked
  valueType: boolean
  name: name
  discovery: context
```

## Constants and examples

- example `settings-row`, story `SettingsRow`: given `label: "Email notifications"`, `labelPosition: "start"`; The settings-list convention, with the label at the start and the switch at the row end.
- example `with-description`, story `WithDescription`: given `label: "Daily summary"`, `description: "Sends a daily summary at 9:00."`; A switch whose effect is stated in one sentence under the label.
- example `checkbox-aligned`, story `CheckboxAligned`: given `label: "Show archived"`, `labelPosition: "end"`; The Checkbox-aligned form, with the switch before its label.
- example `disabled`, story `Disabled`: given `label: "Two-factor authentication"`, `disabled: true`; A setting that cannot be changed here, still visible, readable and focusable.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `trackWidth`, `trackHeight`, `thumbSize`, `thumbInset`, `radius`, `gap`, `partGap`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `trackOff`, `trackOn`, `thumb`, `labelColor`, `descriptionText`, `focusRing`, `focusRingWidth`, `minTarget`

## Platform notes (swiftui)

```yaml
element: Toggle
props:
- Toggle
- .toggleStyle=custom
- .accessibilityValue
- .labelsHidden
- Animation
notes: "A `Toggle` with a package `ToggleStyle`: the track and thumb are drawn from\
  \ the tokens (`trackOn`/`trackOff`/`thumb`) \u2014 not the system switch, which\
  \ cannot take the theme \u2014 with the thumb travel animated over the `transition`\
  \ binding unless reduced motion. VoiceOver reads it as a switch with on/off (`.accessibilityValue`),\
  \ the label from the label view; `hideLabel` uses `.labelsHidden()`. `checkedLabel`/`uncheckedLabel`\
  \ copy becomes the value text. Group disabled and name: FieldsetContext carries\
  \ `disabled` and the legend; the accessibility label is prefixed '<legend>, <label>'\
  \ (fixed punctuation, not copy)."
```

## Guidance

## Overview

A switch is a light switch: flip it and the thing happens. That immediacy is what separates it from a Checkbox, which records a choice to be submitted later. Every switch answers the question "is this on?" and the label names what "this" is.

## When to use

Use a Switch for a binary setting that applies as soon as it changes and can be undone by flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists and preference panels, with `labelPosition: start` so the labels line up and the switches sit at the row end.

## When not to use

Do not use a Switch for a choice that is only applied on Save or Submit; use Checkbox, so the user is not misled into thinking the change is already live. If a form of switches must have a Save button, the switches are checkboxes. Do not use a Switch for two named options ("Metric / Imperial"); that is a RadioGroup or a SegmentedControl (planned). Do not use a Switch where turning it on triggers a flow (a confirmation dialog, a sign-in): use a Button, because a switch that jumps back to off when the flow is cancelled is confusing.

## Behavior

Clicking or tapping the row, or pressing Space on the control, flips the state, moves the thumb, and fires `onChange` with the new boolean. Enter is neither intercepted nor used to toggle. The row is full width: with `labelPosition: start` the label is at the start and the switch at the row's end; with `end` the switch comes first and the label follows it. The consumer applies the effect immediately; if it can fail asynchronously, the switch should be controlled and flipped back with an error message elsewhere — the switch itself has no error state by design. Uncontrolled unless `checked` is provided; a controlled switch shows the new state only once the prop changes. On Lit there is no controlled mode: the `checked` property is the live state, as on a native input. `onChange` fires only for user changes: not on mount, not for a controlled prop change, and not for a press that asks for the value it already has. `disabled` switches are visible, readable and focusable (`aria-disabled`), and do not toggle; a disabled native React Native Switch is the exception and cannot take focus. A disabled switch is still registered with the Form, whose disabled-field rule applies. `disabledOpacity` dims the track, label and description. Thumb travel and the track color change are animated with `transition`; under reduced motion both are instant. The track sits at the top of the row, centred on the label's first line, so a wrapping label or a description does not pull it down. Inside a Fieldset the group's `disabled` applies as if set on the field: on web Fieldset passes `disabled` to its direct child fields; on Lit ds-fieldset sets the `disabled` property on its direct `data-ds-field` children and the switch also honours `formDisabledCallback`; on React Native and SwiftUI `FieldsetContext` carries `disabled` and the legend, which prefixes the accessibility label as "<legend>, <label>" ("Notifications, Email") — the ", " is fixed punctuation, not copy.

## Content guidelines

The label names the thing, not the state ("Email notifications", not "Turn on email notifications" or "Enabled"): the state is announced by the control and shown by its position. Do not add "On/Off" text next to the track; it is redundant for sighted users and read twice by screen readers. Descriptions state the effect in one sentence ("Sends a daily summary at 9:00").

## Accessibility

The switch has role `switch` and its state is exposed as `aria-checked` / `accessibilityState.checked`, so screen readers announce "on" or "off" (WCAG 4.1.2). The label is visible and associated (1.3.1, 3.3.2). State is not conveyed by color alone: the thumb position changes (1.4.1). The on track meets 3:1 against the page background and the thumb meets 3:1 against both track states (1.4.11); the build checks these as non-text pairs. Focus is visible around the track (2.4.7). Space toggles the switch (2.1.1); Enter is left alone. The row meets the 44px comfortable target (2.5.8). The thumb animation respects `prefers-reduced-motion` (2.3.3).

## Platform notes

### Web
Render `<input type="checkbox" role="switch">` with `appearance: none`, sized `trackWidth × trackHeight`, and draw the thumb with a pseudo-element translated by `trackWidth − thumbSize − 2 × thumbInset` when checked. Set `aria-checked` explicitly to mirror the checked state, since some screen readers do not derive it from a checkbox carrying `role="switch"`: the input stays uncontrolled for its native checked state, and the component holds the state (the `checked` prop when controlled) and mirrors it into `aria-checked`. For disabled, `aria-disabled` plus `preventDefault()` on `click` and `change`. Mirror the thumb travel under `[dir=rtl]`. Label with `<label for>`; the `labelPosition` prop changes flex order only.

### Lit
`<ds-switch>` is form-associated so a `name` inside a native `<form>` or `<ds-form>` contributes `"on"` when checked. The inner input is in the shadow root with `delegatesFocus: true`; re-dispatch a composed `change` CustomEvent with `detail: { checked }`. Reflect `name`, `disabled` and `label-position`; `checked` is not reflected (the attribute is the initial state, the property the live state). The host carries `data-ds-field="change"`; the switch never validates.

### React Native
Use the native `Switch` with `accessibilityRole="switch"`, `accessibilityLabel`, `accessibilityHint={description}`, `accessibilityState={{ checked, disabled }}`, `trackColor={{ false: trackOff, true: trackOn }}`, `thumbColor={thumb}` and `ios_backgroundColor={trackOff}`. Wrap the row in a `Pressable` that toggles the value so the label is part of the target, with `accessible={false}` on the wrapper so the Switch is the single focusable element. The track and thumb dimensions, radius, animation and focus indicator come from the OS; those bindings are documented but not applied or overridable here. A disabled native Switch is not focusable.

## Related

Checkbox, RadioGroup, Form.

## Behavior scenarios (13)

One test per scenario, in this order.

```yaml
- name: click-on-track-toggles-on
  description: 'RN has no click on the native Switch: RN tests fire valueChange on
    the switch role (and press on the label or description).'
  when:
    click: track
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
  description: The whole row is the target; the description is not inside the label
    but forwards its click.
  given:
    description: Sends a daily summary at 9:00.
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
    click: track
  then:
  - event: onChange
    with: false
  - state: checked
    is: false
- name: disabled-does-not-toggle
  given:
    disabled: true
  when:
    click: track
  then:
  - event: onChange
    fired: false
  - state: checked
    is: false
  - state: disabled
    is: true
- name: controlled-updates-on-set
  given:
    checked: false
  when:
    set:
      checked: true
  then:
  - state: checked
    is: true
- name: description-is-rendered
  given:
    description: Sends a daily summary at 9:00.
  then:
  - text: Sends a daily summary at 9:00.
- name: label-at-the-end-still-toggles-the-row
  description: labelPosition changes the order of the row, not its target; the whole
    row toggles either way.
  given:
    labelPosition: end
  when:
    click: label
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-label-position-start
  given:
    labelPosition: start
  then:
  - renders: true
  derived: true
- name: renders-label-position-end
  given:
    labelPosition: end
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
```
