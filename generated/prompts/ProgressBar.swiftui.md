# Generate: ProgressBar for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/ProgressBar.swift` declaring `public struct ProgressBar: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/ProgressBarBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+ProgressBar.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("ProgressBar") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("ProgressBar")` on the root and `"ProgressBar.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: ProgressBar
  category: feedback
  status: review
  anatomy:
  - container
  - header
  - label
  - valueText
  - track
  - fill
  composition:
    label:
      component: Text
      props:
        element: span
        size: sm
        weight: medium
        tone: default
      forwards:
        labelSize: fontSize
        labelWeight: fontWeight
        fontFamily: fontFamily
        lineHeight: lineHeight
    valueText:
      component: Text
      props:
        element: span
        size: sm
        tone: muted
      forwards:
        valueSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
  props:
    label:
      type: string
      required: true
      description: What is progressing ("Uploading photos", "Importing contacts").
        Visible unless `hideLabel`.
      a11y: 'The accessible name: aria-labelledby on web, aria-label on the Lit host
        (ids do not cross the shadow root), accessibilityLabel on React Native. An
        empty label leaves the bar unnamed, with no development warning.'
    value:
      type: number
      description: 'Progress so far, between `min` and `max`. Omit (undefined or null)
        for an indeterminate bar (the end is unknown); generated code types it `number
        | null | undefined`. Clamped to `min`…`max` for the fill, the accessible value,
        `formatValue`''s argument and the announcement tiers; a non-finite number
        (NaN, Infinity) is treated as `min`. An unparseable Lit `value` attribute
        (`value="abc"`) parses to NaN and is therefore determinate at `min`: only
        a removed or absent attribute, or an explicit null/undefined property, is
        indeterminate.'
    min:
      type: number
      default: 0
      description: Start of the range. A non-finite number is treated as the default,
        0.
    max:
      type: number
      default: 100
      description: End of the range. A non-finite number is treated as the default,
        100.
    formatValue:
      type: function
      shape: '(value: number, min: number, max: number) => string'
      description: 'Renders the value text ("42%", "3 of 12 files"). Defaults to a
        percentage over the whole range — `(value − min) / (max − min)` — the same
        arithmetic the fill uses, so a non-zero `min` reads correctly without a custom
        formatter, rounded to a whole number: `Intl.NumberFormat(undefined, { style:
        ''percent'', maximumFractionDigits: 0 })` (the runtime or device default locale;
        there is no locale prop), as Meter does (99.5% of the way shows "100%" before
        completion; completion is only the clamped value reaching `max`). Called with
        the clamped value, and not called at all while indeterminate — nothing shows
        or announces a value then. Rounding is for the text only; the fill uses the
        exact fraction. A `max` at or below `min` is not a range: the bar renders
        empty, exposes aria-valuenow / accessibilityValue.now = `min` with the bounds
        exactly as given (never swapped or clamped, even when that means aria-valuemin
        is greater than aria-valuemax), exposes "0%" as aria-valuetext and shows it
        when `showValue` is true, makes no progress or completion announcements, and
        warns in development once per distinct min/max pair (not once per render or
        per mount).'
    showValue:
      type: boolean
      default: true
      description: Show the value text at the end of the label row. Ignored when indeterminate.
        Lit attribute is the negated boolean `hide-value` (reflected), since an attribute
        can only turn things on.
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name). For
        bars inside a Card whose heading already says what is happening. The value
        text, when shown, stays at the inline end of the row (the header switches
        to end alignment, since the hidden label leaves the flow). When there is no
        visible value text either, the label row takes no space and `partGap` is not
        applied: on web and Lit the header element stays, with its data-part and the
        label inside it, and is itself visually hidden (out of flow), so web''s aria-labelledby
        still resolves. On React Native a hidden label is not rendered at all; the
        name lives in accessibilityLabel and the `label` part has no native home while
        hidden, as Input — and with `showValue: false` as well the header View is
        not rendered either, so `testID="ProgressBar.header"` is absent in that one
        configuration. On web and Lit the visually-hidden styles go on a wrapper span
        inside the header, never on the `label` part itself, so the part stays a plain
        Text with no layout styles of its own.'
    tone:
      type: enum
      enumRef: tone
      values:
      - neutral
      - success
      - danger
      default: neutral
      description: 'Neutral while running; `success` at completion, `danger` when
        the task failed part-way. Paired with a text status elsewhere: the color is
        never the only signal.'
    announce:
      type: enum
      values:
      - none
      - milestones
      - complete
      default: complete
      description: 'What a screen reader hears without focusing the bar: nothing,
        every 25%, or only completion. Each announcement uses `copy.progress` / `copy.complete`,
        and `copy.indeterminate` is announced once each time the bar enters the indeterminate
        state. A value that moves backward resets the tiers already announced, so
        a retried task announces its progress again on the way up. The full announcement
        rules are under Behavior.'
  events: {}
  styles:
    track:
      token: color.background.strong
      part: track
      locked: false
    fill:
      token: color.control.selectedBackground
      part: fill
      description: Neutral fill. The selected-control color is guaranteed 3:1 against
        the page.
      locked: true
    fillSuccess:
      token: color.status.success.icon
      part: fill
      locked: true
    fillDanger:
      token: color.status.danger.icon
      part: fill
      locked: true
    trackHeight:
      token: space.2
      part: track
      locked: false
    radius:
      token: radius.full
      part: track
      description: Rounds the track and the fill ends; the track clips the fill (overflow
        hidden).
      locked: false
    labelColor:
      token: color.foreground
      part: label
      description: Realised by the label Text's tone default; no hook of its own.
      locked: true
    labelSize:
      token: font.size.sm
      part: label
      description: Forwarded to the label Text's fontSize override.
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      description: Forwarded to the label Text's fontWeight override.
      locked: false
    valueColor:
      token: color.foreground.muted
      part: valueText
      description: Realised by the value Text's tone muted; no hook of its own.
      locked: true
    valueSize:
      token: font.size.sm
      part: valueText
      description: Forwarded to the value Text's fontSize override.
      locked: false
    fontFamily:
      token: font.family.body
      part: header
      description: Forwarded to both Texts' fontFamily overrides; never styles them
        directly.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: header
      description: Forwarded to both Texts' lineHeight overrides; never styles them
        directly.
      locked: false
    partGap:
      token: space.1
      part: container
      description: Vertical gap between the label row (header) and the track.
      locked: false
    labelGap:
      token: space.2
      part: header
      description: Horizontal gap between the label and the value text in the header
        row. The label's wrapper shrinks (flexShrink 1, min inline size 0) so a long
        label wraps inside the row instead of pushing the value text out of it — layout,
        with no token of its own, as Meter does.
      locked: false
    transition:
      token: motion.duration.base
      part: fill
      description: Fill inline-size change with motion.easing.standard; instant under
        reduced motion. An override changes the duration only; the easing is read
        from the token and has no hook (the sweep's easing is `sweepEasing`).
      locked: false
    indeterminateLoop:
      token: motion.duration.loop
      part: fill
      description: 'The indeterminate sweep: a fill one third of the track width (the
        one-third ratio is geometry, not a token; a literal is allowed for it) travelling
        from the inline start to the inline end (right to left in RTL) and repeating,
        starting and ending wholly outside the track — from -(sweep width) to +(track
        width) on the inline axis, mirrored to +(sweep width)…-(track width) in RTL.
        Under reduced motion there is no sweep: the fill is drawn static and full-width
        at `indeterminateReducedOpacity`, keeping its tone color.'
      locked: false
    indeterminateReducedOpacity:
      token: opacity.disabled
      part: fill
      description: Opacity of the static full-width fill that replaces the sweep under
        reduced motion, on every platform. A binding rather than a literal so a theme
        can make the reduced-motion form more or less prominent.
      locked: false
    sweepEasing:
      token: motion.easing.standard
      part: fill
      description: Easing of each indeterminate sweep on every platform. The fill
        is off the track at both ends of the loop, so the eased restart has no visible
        seam.
      locked: false
  copy:
    progress: '{label}: {value}'
    complete: '{label}: complete'
    indeterminate: '{label}: in progress'
  a11y:
    role: progressbar
    requires:
    - accessible-name
    - contrast-aa
    - live-region
    - reduced-motion
    contrast:
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.status.success.icon
      background: color.background
      level: AA
      nonText: true
    - foreground: color.status.danger.icon
      background: color.background
      level: AA
      nonText: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=progressbar
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      - aria-busy
      notes: 'role="progressbar" sits on the track <div>, with aria-labelledby (the
        label Text''s id), aria-valuenow/min/max and aria-valuetext from formatValue;
        data-ds sits on the root wrapper, a plain container with no role — they are
        different elements. An indeterminate bar keeps aria-valuemin/max, omits aria-valuenow
        and aria-valuetext, and sets aria-busy="true" on the track. The indeterminate
        sweep mirrors its keyframes under :dir(rtl). Announcements go through a visually-hidden
        `role="status" aria-live="polite"` region that is the last child of the root
        container (not a sibling of the root, so the component still returns one element
        and `ref` lands on the root), updated per `announce`. The root takes no `tabIndex`:
        it is stripped from the forwarded rest alongside className and style, since
        the bar is never focusable and nothing programmatically focuses it. Not <progress>:
        it cannot be themed consistently and its indeterminate animation ignores reduced
        motion in some browsers.'
    lit:
      tag: ds-progress-bar
      reflect:
      - tone
      - hide-label
      - prop: showValue
        attribute: hide-value
      - announce
      notes: 'role="progressbar" and aria-valuenow/min/max/text are plain reflected
        attributes on the host, not ElementInternals — the accessible-value tooling
        reads attributes, and real assistive technology treats the two identically.
        The host is named by aria-label mirrored from `label` (aria-labelledby cannot
        reach the label inside the shadow root); an empty label removes aria-label.
        Indeterminate: aria-valuemin/max stay, aria-valuenow and aria-valuetext are
        removed, aria-busy="true". `showValue` is the negated attribute `hide-value`.
        The sweep mirrors its keyframes under :host(:dir(rtl)). The live region is
        in the shadow root and carries role="status" beside aria-live="polite"; it
        is not an anatomy part and takes no `part`. The forwarded bindings (labelSize,
        labelWeight, valueSize, fontFamily, lineHeight) reach the ds-text children
        only through their `overrides` property; they have no --ds-progress-bar-*
        CSS hook, since nothing in the shadow root could read one without restyling
        the child. `formatValue` is a function, so it is property-only (`attribute:
        false`) and unreachable from static HTML: a plain-HTML author gets the default
        percentage, and the Lit story that shows a custom formatter uses a `.formatValue`
        property binding.'
    rn:
      element: View
      props:
      - role=progressbar
      - accessibilityLabel
      - accessibilityValue
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-busy
      notes: 'Drawn with Views (Animated.View width for the fill; the indeterminate
        sweep is an Animated loop that is not started under reduced motion — the fill
        is then drawn full-width at `indeterminateReducedOpacity` — and eases with
        `sweepEasing` via Easing.bezier; it runs toward the left when I18nManager.isRTL).
        No disabled state and no keyboard interaction: the bar is never focusable
        (focusable={false}), and screen-reader users learn progress from the announcements.
        accessibilityValue={{ min, max, now, text }} — an indeterminate bar carries
        min and max only, never a `now` or a `text` that would name a progress it
        does not know, and sets accessibilityState={{ busy: true }}, the native form
        of aria-busy. The role is the `role="progressbar"` prop (RN 0.73+), as Meter
        uses role="meter", not accessibilityRole. react-native-web forwards neither
        the composite accessibilityValue nor accessibilityState, so the root also
        carries the flattened `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext`
        and `aria-busy` beside them — without those the web-rendered bar is a role=progressbar
        with no value at all. Announcements via AccessibilityInfo.announceForAccessibility
        per `announce`. The accessibility props (accessible, focusable={false}, role,
        Label, Value, State and the aria aliases) sit on the root View, so the name
        and value announce together, as Meter. The label and valueText Texts carry
        their testIDs (`ProgressBar.label`, `ProgressBar.valueText`) on wrapper Views,
        since Text takes none. The sweeping fill is anchored at the inline start (alignSelf
        flex-start) and translates toward the inline end, negative x when I18nManager.isRTL.
        The determinate fill animates only a change in `value`: it snaps with no animation
        before the track width is known, on the first onLayout, on a resize, and under
        reduced motion — the same rule as Meter, which on a device means one frame
        at width 0 before the first layout.'
    swiftui:
      element: ProgressView
      props:
      - ProgressView
      - .progressViewStyle=custom
      - .accessibilityValue
      - .accessibilityLabel
      - AccessibilityNotification
      - TimelineView
      notes: '`ProgressView(value:total:)` with a package `ProgressViewStyle` drawing
        the track and fill from the tokens (indeterminate when `value` is nil: a sweep
        driven by `TimelineView`, replaced under reduced motion by the fill drawn
        static and full-width at `indeterminateReducedOpacity`). VoiceOver gets the
        label and `.accessibilityValue(formatValue)` from the style''s configuration;
        announcements per `announce` (milestones/complete/indeterminate copy) through
        `AccessibilityNotification.Announcement`. `tone` recolors the fill only.'
  behavior:
  - name: the-bar-reports-its-value-and-range
    description: A determinate bar exposes aria-valuenow, aria-valuemin and aria-valuemax
      on its progressbar element.
    given:
      value: 42
      min: 0
      max: 100
    then:
    - role: progressbar
    - attribute: aria-valuenow
      is: '42'
    - attribute: aria-valuemin
      is: '0'
    - attribute: aria-valuemax
      is: '100'
    platforms:
    - web
  - name: the-bar-is-never-focusable
    description: Progress is learned from the live region, not by focusing the bar.
    then:
    - focusable: false
    platforms:
    - web
    - lit
  - name: a-hidden-label-is-still-the-accessible-name
    description: hideLabel takes the label out of view, not out of the accessibility
      tree.
    given:
      hideLabel: true
    then:
    - name: true
    platforms:
    - web
    - rn
  - name: the-label-names-the-task
    description: The label says what is progressing, with a verb.
    given:
      label: Importing contacts
    then:
    - text: Importing contacts
  examples:
  - name: upload
    description: A determinate bar with the value text beside the label.
    given:
      label: Uploading photos
      value: 42
  - name: long-import
    description: A long task that announces every 25%, for a user who may leave and
      come back.
    given:
      label: Importing contacts
      value: 10
      announce: milestones
  - name: finished
    description: A completed bar recolored to success, with the text that says so
      beside it.
    given:
      label: Export
      value: 100
      tone: success
  - name: in-a-card
    description: A bar whose Card heading already says what is happening, so the label
      is hidden and the value left off.
    given:
      label: Rendering preview
      value: 60
      hideLabel: true
      showValue: false
```

## Parts and slots

- `container`: element
- `header`: element
- `label`: component `Text`; props `element` = "span", `size` = "sm", `weight` = "medium", `tone` = "default"; forwards `labelSize` → `overrides.fontSize`, `labelWeight` → `overrides.fontWeight`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `valueText`: component `Text`; props `element` = "span", `size` = "sm", `tone` = "muted"; forwards `valueSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `track`: element
- `fill`: element

## Style bindings

- `track`: token `color.background.strong`; part `track`
- `fill`: token `color.control.selectedBackground`; part `fill`; locked
- `fillSuccess`: token `color.status.success.icon`; part `fill`; locked
- `fillDanger`: token `color.status.danger.icon`; part `fill`; locked
- `trackHeight`: token `space.2`; part `track`
- `radius`: token `radius.full`; part `track`
- `labelColor`: token `color.foreground`; part `label`; locked
- `labelSize`: token `font.size.sm`; part `label`
- `labelWeight`: token `font.weight.medium`; part `label`
- `valueColor`: token `color.foreground.muted`; part `valueText`; locked
- `valueSize`: token `font.size.sm`; part `valueText`
- `fontFamily`: token `font.family.body`; part `header`
- `lineHeight`: token `font.lineHeight.normal`; part `header`
- `partGap`: token `space.1`; part `container`
- `labelGap`: token `space.2`; part `header`
- `transition`: token `motion.duration.base`; part `fill`
- `indeterminateLoop`: token `motion.duration.loop`; part `fill`
- `indeterminateReducedOpacity`: token `opacity.disabled`; part `fill`
- `sweepEasing`: token `motion.easing.standard`; part `fill`

## Constants and examples

- example `upload`, story `Upload`: given `label: "Uploading photos"`, `value: 42`; A determinate bar with the value text beside the label.
- example `long-import`, story `LongImport`: given `label: "Importing contacts"`, `value: 10`, `announce: "milestones"`; A long task that announces every 25%, for a user who may leave and come back.
- example `finished`, story `Finished`: given `label: "Export"`, `value: 100`, `tone: "success"`; A completed bar recolored to success, with the text that says so beside it.
- example `in-a-card`, story `InACard`: given `label: "Rendering preview"`, `value: 60`, `hideLabel: true`, `showValue: false`; A bar whose Card heading already says what is happening, so the label is hidden and the value left off.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `track`, `trackHeight`, `radius`, `labelSize`, `labelWeight`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `labelGap`, `transition`, `indeterminateLoop`, `indeterminateReducedOpacity`, `sweepEasing`
Locked (accessibility-bearing, never overridable): `fill`, `fillSuccess`, `fillDanger`, `labelColor`, `valueColor`

## Platform notes (swiftui)

```yaml
element: ProgressView
props:
- ProgressView
- .progressViewStyle=custom
- .accessibilityValue
- .accessibilityLabel
- AccessibilityNotification
- TimelineView
notes: '`ProgressView(value:total:)` with a package `ProgressViewStyle` drawing the
  track and fill from the tokens (indeterminate when `value` is nil: a sweep driven
  by `TimelineView`, replaced under reduced motion by the fill drawn static and full-width
  at `indeterminateReducedOpacity`). VoiceOver gets the label and `.accessibilityValue(formatValue)`
  from the style''s configuration; announcements per `announce` (milestones/complete/indeterminate
  copy) through `AccessibilityNotification.Announcement`. `tone` recolors the fill
  only.'
```

## Guidance

## Overview

A progress bar answers "how much longer": it moves as the work moves, and it ends. If the value is a measurement that could go up or down — storage used, signal strength — it is a Meter, not a progress bar.

## When to use

Use a ProgressBar for a task the interface started and can see through to the end: uploads, downloads, imports, multi-step processing, a wizard's overall completion. Give it a `value` whenever the total is known; use the indeterminate form only until the total is known, then switch. Set `announce: milestones` for long tasks the user may leave and come back to; `complete` (the default) is right for anything under a minute.

## When not to use

Do not use it for a measured quantity (Meter), for a value the user sets (Slider), or for a brief wait of a second or two where a busy state on the Button that started it is enough. Do not use an indeterminate bar for longer than a few seconds without text saying what is happening. Do not stack several bars for one task; show the current step's bar and the overall step count in text.

## Behavior

The fill width follows the clamped `value` as a fraction of the range, animated over `transition`. Indeterminate bars sweep continuously (inline start to inline end, mirrored in RTL) and expose `aria-busy`. When `value` reaches `max` the bar stays full and, if `announce` is not `none`, `copy.complete` is announced once. Changing `tone` to `success` or `danger` recolors the fill only — the containing view is responsible for the text that says the task finished or failed. The bar itself is never focusable, and the root accepts no `tabIndex` — there is nothing to focus it for. The live region is `role="status"` (plain attributes on Lit, not ElementInternals), is not an anatomy part, and sits as the last child inside the root rather than beside it.

The label row (header) is a horizontal row with the label at the inline start and the value text at the inline end, `labelGap` apart. `hideLabel` hides the label visually but the value text stays at the end; with no visible label and no visible value text the row takes no space.

Announcements follow these rules on every platform:

- **Tiers.** The tier is `floor(fraction × 4)` of the clamped value (74.6% is tier 2, 75% is tier 3); tier 4 is `max`. Tiers are tracked for every `announce` value, including `none`, so switching `announce` mid-task never replays tiers already passed.
- **Milestones.** With `milestones`, entering a higher tier 1–3 announces `copy.progress` once. An update that crosses several tiers makes one announcement for the highest, with the current value. Reaching `max` announces `copy.complete`, never `copy.progress` with "100%"; `complete` announces only that.
- **`{value}`** is the formatted value text — `formatValue(clamped, min, max)`, the same string as aria-valuetext / accessibilityValue.text — not the raw number.
- **Mount.** The tier and completion reached at mount are recorded silently: a bar that mounts at 60% or at `max` announces nothing. A bar that mounts indeterminate has entered that state, so `copy.indeterminate` is announced once after mount (unless `announce` is `none`), as it is each later time `value` becomes undefined.
- **Backward.** A value that moves to a lower tier resets the record to the new value's tier: moving from 80% to 60% makes 75% and completion announceable again without re-announcing 50%. Dropping below `max` re-arms `copy.complete`.
- **Repeats.** An announcement is spoken even when its text equals the previous one (indeterminate twice, a retried task completing again): web and Lit replace the live region's message node rather than setting the same text; React Native calls `announceForAccessibility` again.
- **Indeterminate.** Entering the indeterminate state resets the record to tier 0 and re-arms `copy.complete`, so the first known value afterwards announces its tier under `milestones`. "Announced once after mount" means once the live region has rendered empty: web and Lit set the message on the next animation frame, since text already in a newly inserted region is often not read. Only that first announcement is deferred — the region is already in the tree afterwards, so every later announcement is set synchronously and progress and completion are not delayed.
- **Invalid range.** With `max ≤ min` no progress or completion is announced and no tier is recorded; `copy.indeterminate` still is. When the range becomes valid, the tier and completion it arrives at are recorded silently, as at mount — an invalid range re-arms that silent record each time it is invalid, so a bar that mounts with a broken range and is later given a good one is silent on the first good value and announces from there.
- **Gate coverage.** This state machine is deliberately not in the behavior scenarios: they can assert a rendered name, role, text and value, not a sequence of live-region announcements across renders and animation frames. It is covered by each platform package's own tests, and a change to the rules above belongs there as well as here.

## Content guidelines

Labels name the task in progress with a verb ("Uploading 12 photos"), and the value text says how far in the units people think in — files, steps, or percent — via `formatValue`. When the task fails, keep the bar (at `danger`) and put the error in an Alert beside it, not in the bar's label.

## Accessibility

The bar is a `progressbar` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (WCAG 4.1.2; APG progressbar), named by its label even when the label is visually hidden. Because the bar is not focusable, screen-reader users only learn about progress through the live region, which is why `announce` exists and defaults to completion (4.1.3). Motion is the fill's width change and the indeterminate sweep; both stop under reduced motion (2.3.3). Tone is reinforced by text elsewhere, never color alone (1.4.1); the fill meets 3:1 against the page (1.4.11).

## Platform notes

### Web
Render a root wrapper (`data-ds`, no role, gap `partGap`) containing the header row (`data-part="header"`, flex row, `justify-content: space-between`, gap `labelGap`) — a `Text element="span" size="sm" weight="medium" tone="default"` with id (visually hidden under `hideLabel`) and, when `showValue` and determinate, a `Text element="span" size="sm" tone="muted"` with the value text, each receiving its forwarded overrides — then the track `<div>` and fill `<div>` with `inline-size` from the clamped fraction. `role="progressbar"` sits on the track, never the root, with `aria-labelledby`, `aria-valuenow/min/max/text` (when indeterminate keep `aria-valuemin/max`, omit `aria-valuenow` and `aria-valuetext`, and set `aria-busy="true"`). A visually-hidden `<div role="status" aria-live="polite">` beside the bar receives the announcements described under Behavior. The indeterminate sweep is a CSS keyframe on the fill (`translateX` from -100% to 300% over `indeterminateLoop` with `sweepEasing`, reversed under `:dir(rtl)`), replaced under `prefers-reduced-motion` by a static fill at `indeterminateReducedOpacity` covering the whole track.

### Lit
`<ds-progress-bar label="Uploading" value="42"></ds-progress-bar>`; `role="progressbar"`, `aria-label` (from `label`) and the aria values as plain attributes on the host, not `ElementInternals`; the same header, track and fill structure as web in the shadow root, with composed `ds-text` elements; live region in the shadow root; `tone`, `hide-label`, `hide-value` and `announce` reflected.

### React Native
`View` track with an `Animated.View` fill whose width animates to the fraction (`useNativeDriver: false` for width; duration from `transition`, zero under reduced motion). Header row: a `View` with `flexDirection: 'row'`, `justifyContent: 'space-between'` and gap `labelGap` holding the two `Text`s. Indeterminate: an `Animated.loop` translating a one-third-width fill with `sweepEasing`, not started when `useReducedMotion()`; instead the fill is drawn full-width at `indeterminateReducedOpacity`. `accessibilityRole="progressbar"`, `accessibilityValue`, and `AccessibilityInfo.announceForAccessibility` per `announce`.

## Related

Meter, Alert, Button, Toast.

## Behavior scenarios (9)

One test per scenario, in this order.

```yaml
- name: the-label-names-the-task
  description: The label says what is progressing, with a verb.
  given:
    label: Importing contacts
  then:
  - text: Importing contacts
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-neutral
  given:
    tone: neutral
  then:
  - renders: true
  derived: true
- name: renders-tone-success
  given:
    tone: success
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: renders-announce-none
  given:
    announce: none
  then:
  - renders: true
  derived: true
- name: renders-announce-milestones
  given:
    announce: milestones
  then:
  - renders: true
  derived: true
- name: renders-announce-complete
  given:
    announce: complete
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
