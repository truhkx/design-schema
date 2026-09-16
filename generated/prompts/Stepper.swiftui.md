# Generate: Stepper for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Stepper.swift` declaring `public struct Stepper: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/StepperBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Stepper.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Stepper") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Stepper")` on the root and `"Stepper.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Stepper
  category: navigation
  status: review
  anatomy:
  - list
  - step
  - indicator
  - connector
  - label
  - description
  - count
  composition:
    label:
      component: Text
      props:
        element: span
        size: sm
      forwards:
        labelSize: fontSize
        labelWeight: fontWeight
        labelCurrentWeight: fontWeight
        fontFamily: fontFamily
    description:
      component: Text
      props:
        element: span
        size: xs
        tone: muted
      forwards:
        descriptionSize: fontSize
        fontFamily: fontFamily
    count:
      component: Text
      props:
        element: span
        size: sm
        tone: muted
      forwards:
        countSize: fontSize
        fontFamily: fontFamily
  props:
    label:
      type: string
      description: Accessible name of the navigation landmark. Defaults to `copy.navLabel`.
    steps:
      type: array
      required: true
      shape: '{ id: string; label: string; description?: string; status?: "complete"
        | "current" | "upcoming" | "error" }[]'
      description: 'The steps in order. `status` is derived from `current` when omitted:
        before it complete, the step it names current, after it upcoming. An explicit
        `status` sets only the indicator, its colours and the status word; position
        (not status) decides the selected state, navigability, the connector colour
        and the compact reveal.'
    current:
      type: string
      required: true
      description: The id of the current step. The step whose id matches is the selected
        one (`aria-current="step"` / selected state) and the one compact reveals,
        whatever its `status`. When no id matches, nothing is selected, every step
        without an explicit status is upcoming, no step is navigable under `completed`
        (all still are under `all`), the count reads "Step 1 of m", and development
        builds log a warning.
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: Vertical shows descriptions under each label and suits a side column;
        horizontal does not render descriptions at all (not clipped, and no aria-describedby)
        and collapses to `compact` below the prose width.
    navigable:
      type: enum
      values:
      - none
      - completed
      - all
      default: completed
      description: 'Which steps can be activated: none (display only), completed steps
        (the usual — you can go back, not skip ahead), or all (a settings-style flow
        where order does not matter). "Completed" means visited — any step before
        the current one by position, including one marked `error`, which is exactly
        the step a user most needs to return to. The control is the component''s own
        native button, not the Button component, whose single-label API cannot hold
        an indicator, a label and a description.'
    compact:
      type: boolean
      default: false
      description: 'Show only the current step''s label and "Step 2 of 5"; the indicators
        stay. Horizontal only, set by hand or automatically below the prose width
        — a vertical stepper has the room, so the prop does nothing there. On web
        and Lit the labels of the other steps, with their status words, are visually
        clipped (the visually-hidden technique), not removed, so they stay reachable
        by a screen reader; on React Native they are not rendered, because each step''s
        accessibilityLabel already carries the label and status. "Step n of m" (`copy.stepOf`)
        is the `count` part: one muted Text after the list, not in any step and not
        replacing a description, present only while compact is in effect (on web and
        Lit, where automatic compact is a container query, it is always rendered and
        `display: none` outside the query).'
  events:
    onStepSelect:
      description: Fired when a navigable step is chosen, with its id. The container
        changes `current`; the stepper never changes it itself.
      platforms:
        web: onStepSelect
        lit: step-select
        rn: onStepSelect
        swiftui: onStepSelect
      payload:
      - name: id
        type: string
        description: The id of the chosen step.
      fires:
      - user
      timing:
        phase: request
  keyboard:
  - keys:
    - Tab
    action: Moves between navigable steps in order; non-navigable steps are not focusable.
    from: first
    expect: focus-next
  - keys:
    - Enter
    - ' '
    action: Selects the focused step.
    from: first
    expect: manual
    native: true
  styles:
    indicatorSize:
      token: space.6
      part: indicator
      locked: false
    indicatorColor:
      token: color.foreground
      part: indicator
      description: The numeral on an upcoming or current step; the complete and error
        states have their own foregrounds.
      locked: true
    indicatorBackground:
      token: color.control.background
      part: indicator
      locked: false
    indicatorBorder:
      token: color.border.strong
      part: indicator
      locked: true
    indicatorBorderWidth:
      token: border.width.focus
      part: indicator
      locked: true
    indicatorCompleteBackground:
      token: color.control.selectedBackground
      part: indicator
      locked: true
    indicatorCompleteForeground:
      token: color.control.selectedForeground
      part: indicator
      description: The check Icon on a complete step, passed as the Icon's color override.
      locked: true
    indicatorCompleteBorder:
      token: color.control.selectedBackground
      part: indicator
      description: The ring of a complete indicator, the same colour as its fill.
      locked: true
    indicatorRadius:
      token: radius.full
      part: indicator
      description: Makes the indicator a circle.
      locked: false
    indicatorCurrentBorder:
      token: color.control.selectedBackground
      part: indicator
      locked: true
    indicatorErrorBackground:
      token: color.status.danger.background
      part: indicator
      locked: true
    indicatorErrorForeground:
      token: color.status.danger.foreground
      part: indicator
      locked: true
    indicatorErrorBorder:
      token: color.status.danger.icon
      part: indicator
      description: The ring; the danger icon step is the one guaranteed 3:1 against
        the page.
      locked: true
    indicatorFontSize:
      token: font.size.sm
      part: indicator
      description: The numeral. The check and danger Icons take `size="sm"` and receive
        this as their `size` override, so glyph and numeral match.
      locked: false
    indicatorFontWeight:
      token: font.weight.semibold
      part: indicator
      locked: false
    connector:
      token: color.border
      part: connector
      locked: false
    connectorComplete:
      token: color.control.selectedBackground
      part: connector
      description: The connector after step i when step i is before the current step
        by position; explicit statuses (error included) do not change it. Every other
        connector uses `connector`.
      locked: true
    connectorWidth:
      token: border.width.focus
      part: connector
      locked: true
    labelColor:
      token: color.foreground
      part: label
      description: Realised by the label Text's tone default on every step that is
        not upcoming; no --ds-stepper-* hook.
      locked: true
    labelUpcomingColor:
      token: color.foreground.muted
      part: label
      description: Realised by the label Text's tone muted on an upcoming step; no
        --ds-stepper-* hook.
      locked: true
    labelWeight:
      token: font.weight.medium
      part: label
      description: Forwarded to the label Text's fontWeight override on every step
        but the current one.
      locked: false
    labelCurrentWeight:
      token: font.weight.semibold
      part: label
      description: Forwarded to the label Text's fontWeight override on the current
        step (the id match).
      locked: false
    labelSize:
      token: font.size.sm
      part: label
      description: Forwarded to the label Text's fontSize override.
      locked: false
    descriptionColor:
      token: color.foreground.muted
      part: description
      description: Realised by the description Text's tone muted; no --ds-stepper-*
        hook.
      locked: true
    descriptionSize:
      token: font.size.xs
      part: description
      description: Forwarded to the description Text's fontSize override.
      locked: false
    countColor:
      token: color.foreground.muted
      part: count
      description: Realised by the count Text's tone muted; no --ds-stepper-* hook.
      locked: true
    countSize:
      token: font.size.sm
      part: count
      description: Forwarded to the count Text's fontSize override.
      locked: false
    stepHover:
      token: color.action.ghost.backgroundHover
      part: step
      state: hover
      description: Hover and press background of a navigable step (on React Native
        while the Pressable is pressed or hovered).
      locked: false
    stepRadius:
      token: radius.sm
      part: step
      locked: false
    stepPadding:
      token: space.2
      part: step
      description: Inline padding of a step control (block padding too when vertical),
        so the hover background has room around the indicator and label.
      locked: false
    stepGap:
      token: layout.gap.normal
      part: step
      description: Between steps along the orientation axis (the connector fills it).
      locked: false
    partGap:
      token: space.2
      part: step
      description: Inside the step control, between the indicator and its label (and
        between label and description). Not the control's padding; that is `stepPadding`.
      locked: false
    fontFamily:
      token: font.family.body
      part: list
      description: Set on the root and forwarded to each composed Text's fontFamily
        override.
      locked: false
    minTarget:
      token: size.target.min
      part: step
      description: Minimum block and inline size of a navigable step control.
      locked: true
    focusRing:
      token: color.border.focus
      part: step
      description: Focus-visible ring on a navigable step control.
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: step
      description: Width of the focus-visible ring on a navigable step control.
      locked: true
    transition:
      token: motion.duration.fast
      part: connector
      locked: false
  copy:
    navLabel: Progress
    stepOf:
      text: Step {current} of {total}
      params:
        current:
          type: number
          description: The current step's position in the flow.
        total:
          type: number
          description: How many steps the flow has.
    complete: completed
    current: current step
    error: has an error
    stepLabel:
      text: 'Step {n}: {label}'
      params:
        n:
          type: number
          description: The step's position in the flow.
        label:
          type: string
          description: The step's own label.
  a11y:
    role: none
    requires:
    - accessible-name
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    - selected-state
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.control.selectedForeground
      background: color.control.selectedBackground
      level: AA
    - foreground: color.status.danger.foreground
      background: color.status.danger.background
      level: AA
    - foreground: color.status.danger.icon
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.border.strong
      background: color.background
      level: AA
      nonText: true
  platforms:
    web:
      element: nav
      attributes:
      - aria-label
      - aria-current=step
      - data-ds=Stepper
      notes: 'The root is a <nav> carrying data-ds and aria-label (`label` ?? copy.navLabel),
        with the ref typed to it; the `list` part is the <ol> inside, followed by
        the `count` Text. Each <li> holds either Stepper''s own native <button type="button">
        (navigable; not the Button component) or a <div> with the same content. aria-current="step"
        on the current item''s control. The control''s accessible name is its content:
        the plain label plus a visually-hidden span reading ", " and the status word
        (no aria-label; copy.stepLabel is not used on web, since the <ol> gives the
        ordinal). Upcoming steps have no status word. The indicator shows the step
        number, a check Icon when complete, or the danger Icon on error. The root
        has container-type: inline-size and a container query switches a horizontal
        stepper to `compact` below layout.maxWidth.prose; a container condition cannot
        read a custom property, so the generator emits the built (resolved) value
        of that token as the breakpoint, marked literal-ok.'
    lit:
      tag: ds-stepper
      reflect:
      - orientation
      - navigable
      - compact
      - current
      notes: '`steps` as a property; shadow <nav aria-label><ol> then the `count`
        <ds-text>; composed `step-select`. Navigable steps are native <button>s in
        the shadow root, named exactly as on web (plain label plus visually-hidden
        ", " and status word; copy.stepLabel unused); aria-describedby to a description
        only in vertical orientation, within the same shadow root. Label, description
        and count are <ds-text> with tone props and `overrides` (fontSize, fontWeight,
        fontFamily) from the forwards, not --ds-stepper-label-* hooks. The host has
        container-type: inline-size; the compact container query uses the built value
        of layout.maxWidth.prose emitted by the generator (literal-ok), as on web.'
    rn:
      element: View
      props:
      - accessibilityRole=list
      - accessibilityLabel
      notes: 'A View with accessibilityRole="list"; each step a Pressable (navigable)
        or View with accessibilityState={{ selected: current }} and an accessibilityLabel
        of copy.stepLabel, then ", " and the status word when the step has one (upcoming
        steps have none): "Step 2: Payment, current step". React Native has no navigation
        landmark role, so there is no landmark: `label` ?? copy.navLabel goes on the
        list View''s accessibilityLabel instead. Composed Text takes no testID, so
        the label, description and count Texts are each wrapped in a View carrying
        the part''s testID. `stepHover` applies while the Pressable is pressed or
        hovered (onHoverIn/onHoverOut). Automatic compact measures the stepper''s
        own width with onLayout (not the window) against layout.maxWidth.prose, rendering
        non-compact until the first layout; in compact the other steps'' label Texts
        are not rendered, since their accessibilityLabels still carry them. Horizontal
        steppers use `compact` on phones; vertical is preferred for long flows.'
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - Button
      - .accessibilityAddTraits=isSelected
      - .accessibilityValue
      - Icon
      - ViewThatFits
      notes: 'A `.contain` element labelled `copy.navLabel` holding the ordered steps
        (`HStack`/`VStack` by `orientation`): navigable steps are `Button`s whose
        accessibility label is `copy.stepLabel` plus the status word, the current
        step carries `.isSelected` and `.accessibilityValue(copy.current)`; non-navigable
        steps are plain elements with the same label. Indicators draw the number or
        the `check`/`danger` Icon; `compact` switches through `ViewThatFits` below
        the prose width. Not SwiftUI''s `Stepper` (a numeric control).'
  behavior:
  - name: click-on-a-completed-step-reports-it
    description: A navigable step fires onStepSelect with its id; the container decides
      whether to move.
    given:
      navigable: completed
      current: payment
      steps:
      - id: shipping
        label: Shipping address
      - id: payment
        label: Payment
      - id: review
        label: Review order
      - id: confirm
        label: Confirmation
    when:
      click: indicator
    then:
    - event: onStepSelect
      with: shipping
  - name: the-current-step-is-not-navigable
    description: navigable completed means every step before the current one, so the
      current step itself reports nothing.
    given:
      navigable: completed
      current: shipping
      steps:
      - id: shipping
        label: Shipping address
      - id: payment
        label: Payment
      - id: review
        label: Review order
    when:
      click: indicator
    then:
    - event: onStepSelect
      fired: false
  - name: display-only-steps-report-nothing
    description: With navigable none the steps are inert text.
    given:
      navigable: none
      current: payment
      steps:
      - id: shipping
        label: Shipping address
      - id: payment
        label: Payment
      - id: review
        label: Review order
    when:
      click: indicator
    then:
    - event: onStepSelect
      fired: false
  - name: step-status-is-said-in-words
    description: The status is carried by a word from copy, not by color or glyph
      alone.
    given:
      navigable: none
      current: payment
      steps:
      - id: shipping
        label: Shipping address
      - id: payment
        label: Payment
      - id: review
        label: Review order
    then:
    - copy: complete
      platforms:
      - web
      - lit
    - copy: current
      platforms:
      - web
      - lit
  - name: an-errored-step-says-so
    description: A step marked error is named with copy.error, so the danger glyph
      is not the only signal.
    given:
      navigable: none
      current: review
      steps:
      - id: shipping
        label: Shipping address
        status: complete
      - id: payment
        label: Payment
        status: error
      - id: review
        label: Review order
    then:
    - copy: error
      platforms:
      - web
      - lit
  - name: compact-shows-the-step-count
    description: Below the prose width the stepper shows only the current label and
      "Step n of m".
    given:
      compact: true
      current: payment
      steps:
      - id: shipping
        label: Shipping address
      - id: payment
        label: Payment
      - id: review
        label: Review order
      - id: confirm
        label: Confirmation
    then:
    - text: Step 2 of 4
  examples:
  - name: checkout
    description: The usual horizontal flow, where a completed step can be revisited.
    given:
      current: payment
      steps:
      - id: shipping
        label: Shipping address
      - id: payment
        label: Payment
      - id: review
        label: Review order
  - name: onboarding-with-descriptions
    description: A vertical stepper whose steps each need a line of explanation.
    given:
      orientation: vertical
      current: verify
      steps:
      - id: account
        label: Create account
        description: Takes about a minute.
      - id: verify
        label: Verify identity
        description: Takes about 2 minutes.
      - id: plan
        label: Choose a plan
        description: Compare features and pricing.
  - name: display-only
    description: A flow the user cannot jump around in.
    given:
      navigable: none
      current: payment
      steps:
      - id: shipping
        label: Shipping address
      - id: payment
        label: Payment
      - id: review
        label: Review order
  - name: a-step-with-an-error
    description: Validation failed on a step the user has already left.
    given:
      current: review
      steps:
      - id: shipping
        label: Shipping address
        status: complete
      - id: payment
        label: Payment
        status: error
      - id: review
        label: Review order
```

## Events

- `onStepSelect`: emit `onStepSelect`
  - payload, positional, in this order: `id: string`
  - fires on: user
  - timing: request

## Parts and slots

- `list`: element
- `step`: element
- `indicator`: element
- `connector`: element
- `label`: component `Text`; props `element` = "span", `size` = "sm"; forwards `labelSize` → `overrides.fontSize`, `labelWeight` → `overrides.fontWeight`, `labelCurrentWeight` → `overrides.fontWeight`, `fontFamily` → `overrides.fontFamily`
- `description`: component `Text`; props `element` = "span", `size` = "xs", `tone` = "muted"; forwards `descriptionSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`
- `count`: component `Text`; props `element` = "span", `size` = "sm", `tone` = "muted"; forwards `countSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`

## Style bindings

- `indicatorSize`: token `space.6`; part `indicator`
- `indicatorColor`: token `color.foreground`; part `indicator`; locked
- `indicatorBackground`: token `color.control.background`; part `indicator`
- `indicatorBorder`: token `color.border.strong`; part `indicator`; locked
- `indicatorBorderWidth`: token `border.width.focus`; part `indicator`; locked
- `indicatorCompleteBackground`: token `color.control.selectedBackground`; part `indicator`; locked
- `indicatorCompleteForeground`: token `color.control.selectedForeground`; part `indicator`; locked
- `indicatorCompleteBorder`: token `color.control.selectedBackground`; part `indicator`; locked
- `indicatorRadius`: token `radius.full`; part `indicator`
- `indicatorCurrentBorder`: token `color.control.selectedBackground`; part `indicator`; locked
- `indicatorErrorBackground`: token `color.status.danger.background`; part `indicator`; locked
- `indicatorErrorForeground`: token `color.status.danger.foreground`; part `indicator`; locked
- `indicatorErrorBorder`: token `color.status.danger.icon`; part `indicator`; locked
- `indicatorFontSize`: token `font.size.sm`; part `indicator`
- `indicatorFontWeight`: token `font.weight.semibold`; part `indicator`
- `connector`: token `color.border`; part `connector`
- `connectorComplete`: token `color.control.selectedBackground`; part `connector`; locked
- `connectorWidth`: token `border.width.focus`; part `connector`; locked
- `labelColor`: token `color.foreground`; part `label`; locked
- `labelUpcomingColor`: token `color.foreground.muted`; part `label`; locked
- `labelWeight`: token `font.weight.medium`; part `label`
- `labelCurrentWeight`: token `font.weight.semibold`; part `label`
- `labelSize`: token `font.size.sm`; part `label`
- `descriptionColor`: token `color.foreground.muted`; part `description`; locked
- `descriptionSize`: token `font.size.xs`; part `description`
- `countColor`: token `color.foreground.muted`; part `count`; locked
- `countSize`: token `font.size.sm`; part `count`
- `stepHover`: token `color.action.ghost.backgroundHover`; part `step`; state `hover`
- `stepRadius`: token `radius.sm`; part `step`
- `stepPadding`: token `space.2`; part `step`
- `stepGap`: token `layout.gap.normal`; part `step`
- `partGap`: token `space.2`; part `step`
- `fontFamily`: token `font.family.body`; part `list`
- `minTarget`: token `size.target.min`; part `step`; locked
- `focusRing`: token `color.border.focus`; part `step`; locked
- `focusRingWidth`: token `border.width.focus`; part `step`; locked
- `transition`: token `motion.duration.fast`; part `connector`

## Keyboard

- `Enter`, ` ` (Selects the focused step.): expect manual; native: the rendered element already does this

## Copy

- `navLabel`: "Progress"
- `stepOf`: "Step {current} of {total}"; params `current` (number), `total` (number)
- `complete`: "completed"
- `current`: "current step"
- `error`: "has an error"
- `stepLabel`: "Step {n}: {label}"; params `n` (number), `label` (string)

## Constants and examples

- example `checkout`, story `Checkout`: given `current: "payment"`, `steps: [{"id":"shipping","label":"Shipping address"},{"id":"payment","label":"Payment"},{"id":"review","label":"Review order"}]`; The usual horizontal flow, where a completed step can be revisited.
- example `onboarding-with-descriptions`, story `OnboardingWithDescriptions`: given `orientation: "vertical"`, `current: "verify"`, `steps: [{"id":"account","label":"Create account","description":"Takes about a minute."},{"id":"verify","label":"Verify identity","description":"Takes about 2 minutes."},{"id":"plan","label":"Choose a plan","description":"Compare features and pricing."}]`; A vertical stepper whose steps each need a line of explanation.
- example `display-only`, story `DisplayOnly`: given `navigable: "none"`, `current: "payment"`, `steps: [{"id":"shipping","label":"Shipping address"},{"id":"payment","label":"Payment"},{"id":"review","label":"Review order"}]`; A flow the user cannot jump around in.
- example `a-step-with-an-error`, story `AStepWithAnError`: given `current: "review"`, `steps: [{"id":"shipping","label":"Shipping address","status":"complete"},{"id":"payment","label":"Payment","status":"error"},{"id":"review","label":"Review order"}]`; Validation failed on a step the user has already left.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `indicatorSize`, `indicatorBackground`, `indicatorRadius`, `indicatorFontSize`, `indicatorFontWeight`, `connector`, `labelWeight`, `labelCurrentWeight`, `labelSize`, `descriptionSize`, `countSize`, `stepHover`, `stepRadius`, `stepPadding`, `stepGap`, `partGap`, `fontFamily`, `transition`
Locked (accessibility-bearing, never overridable): `indicatorColor`, `indicatorBorder`, `indicatorBorderWidth`, `indicatorCompleteBackground`, `indicatorCompleteForeground`, `indicatorCompleteBorder`, `indicatorCurrentBorder`, `indicatorErrorBackground`, `indicatorErrorForeground`, `indicatorErrorBorder`, `connectorComplete`, `connectorWidth`, `labelColor`, `labelUpcomingColor`, `descriptionColor`, `countColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .accessibilityElement=contain
- .accessibilityLabel
- Button
- .accessibilityAddTraits=isSelected
- .accessibilityValue
- Icon
- ViewThatFits
notes: 'A `.contain` element labelled `copy.navLabel` holding the ordered steps (`HStack`/`VStack`
  by `orientation`): navigable steps are `Button`s whose accessibility label is `copy.stepLabel`
  plus the status word, the current step carries `.isSelected` and `.accessibilityValue(copy.current)`;
  non-navigable steps are plain elements with the same label. Indicators draw the
  number or the `check`/`danger` Icon; `compact` switches through `ViewThatFits` below
  the prose width. Not SwiftUI''s `Stepper` (a numeric control).'
```

## Guidance

## Overview

A stepper is a map of a journey with a "you are here". It sets expectations (five steps, not fifteen), shows progress without a bar, and gives people a way back to a step they finished. It is navigation, not a form control; the number-stepping field is NumberInput.

## When to use

Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen: checkout, account setup, a report builder, a multi-part application. Vertical with descriptions for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without losing later ones (the container keeps the later steps' state).

## When not to use

Do not use a Stepper for two steps (a Button that says "Continue" is enough) or for more than about eight (group them). Do not use it as Tabs — steps have an order and a current position, tabs do not. Do not use it to show task progress (ProgressBar) or to let users jump anywhere in a settings area (a `nav` of Links).

## Behavior

Steps before `current` render complete (check), the current one is marked, later ones are upcoming. A step can be marked `error` explicitly (validation failed on a step the user left). Navigable steps are native buttons that fire `onStepSelect`; the container decides whether to move. Non-navigable steps are inert text. Below the prose width a horizontal stepper shows only the current label and "Step n of m" (`compact`), keeping the row of indicators; the count is the `count` part, one muted Text after the list. A navigable step is its own native `<button>` (Pressable on native) owned by Stepper — not the Button component, whose single-label API cannot hold an indicator, label and description. The status word always joins the name after ", " ("Payment, current step"); upcoming steps have no status word. An explicit `status: 'current'` on a step `current` does not name gives that step the current indicator and the word `copy.current`, but not the selected state. Connectors take `connectorComplete` by position — the connector after each step before the current one — regardless of explicit statuses. Label and description colors are passed to the composed Text as `tone`/overrides. `navigable: completed` means every step before the current one, including one marked `error`. `compact` applies to horizontal steppers only. On web and Lit the list is an `<ol>`, which already announces "item 2 of 5", so the control shows its plain label and adds only the status word as visually hidden text, with no `aria-label` — `copy.stepLabel` is native-only (React Native and SwiftUI), where there is no list ordinal and the accessibility label is `copy.stepLabel` plus that word. When a step carries `status: 'error'` and is also the one `current` names, the error wins for the indicator, its colour and the status word, while the selected state and the compact reveal still follow the id — the user is on that step, and it has a problem. `transition` times the connector's cross-fade between `connector` and `connectorComplete`; the indicator has four discrete states and switches between them at once, as every other multi-state indicator here does.

## Content guidelines

Labels are two or three words in sentence case naming the step's content ("Shipping address", "Review order"), parallel across the list. Descriptions, when used, say what happens or how long it takes. Number the steps only through the indicator; never write "Step 1:" in the label — the component adds it for assistive technology.

## Accessibility

The stepper is a `nav` (named "Progress" or by the flow) containing an ordered list, and the current step carries `aria-current="step"` (WCAG 1.3.1, 4.1.2). Each step's name includes its status from copy and its position — from the list ordinal on web ("Payment, current step", item 2 of 5) and from `copy.stepLabel` on native ("Step 2: Payment, current step") (1.3.3). React Native has no navigation landmark, so there the list itself carries the name. State is conveyed by the check/number/danger glyph and the status word, not by color alone (1.4.1), and the indicator ring meets 3:1 (1.4.11). Navigable steps are native buttons with visible focus and 24px targets; non-navigable ones are not focusable so Tab does not stop on decoration (2.4.3).

## Platform notes

### Web
Render `<nav aria-label={label ?? "Progress"} data-ds="Stepper"><ol>` with an `<li>` per step containing the indicator `<span aria-hidden>` (number, `Icon name="check"`, or `Icon name="danger"`), a connector `<span aria-hidden>` after all but the last, and the label/description `Text`s wrapped in Stepper's own native `<button type="button">` when navigable (with `aria-current="step"` for the current step; not the Button component) or a `<div>` otherwise. A visually-hidden `<span>` inside the control adds ", " and the status word; there is no `aria-label`. After the `<ol>`, the `count` Text renders `copy.stepOf`, shown only in compact. `@container (max-width: <prose px>)` switches to compact for horizontal orientation (the generator emits the built value of `layout.maxWidth.prose`, `literal-ok: breakpoint from layout.maxWidth.prose`, since a container condition cannot read a custom property).

### Lit
`<ds-stepper current="payment" .steps=${steps}></ds-stepper>`; shadow `<nav><ol>`; `step-select` composed; `container-type: inline-size` on the host for the compact switch.

### React Native
`View` (`accessibilityRole="list"`) laid out in a row or column; each step a `Pressable` (navigable) or `View` with `accessible`, `accessibilityLabel` from `copy.stepLabel` + status word, `accessibilityState.selected` for the current step. Connectors are `View`s with `connectorWidth`. Use `compact` on phones for horizontal steppers (decided by the stepper's own `onLayout` width against `layout.maxWidth.prose`, not the window). No landmark role exists, so the list View carries the name; label, description and count Texts sit in Views that carry their testIDs.

## Related

ProgressBar, Tabs, Breadcrumb, Form, Button.

## Behavior scenarios (11)

One test per scenario, in this order.

```yaml
- name: click-on-a-completed-step-reports-it
  description: A navigable step fires onStepSelect with its id; the container decides
    whether to move.
  given:
    navigable: completed
    current: payment
    steps:
    - id: shipping
      label: Shipping address
    - id: payment
      label: Payment
    - id: review
      label: Review order
    - id: confirm
      label: Confirmation
  when:
    click: indicator
  then:
  - event: onStepSelect
    with: shipping
- name: the-current-step-is-not-navigable
  description: navigable completed means every step before the current one, so the
    current step itself reports nothing.
  given:
    navigable: completed
    current: shipping
    steps:
    - id: shipping
      label: Shipping address
    - id: payment
      label: Payment
    - id: review
      label: Review order
  when:
    click: indicator
  then:
  - event: onStepSelect
    fired: false
- name: display-only-steps-report-nothing
  description: With navigable none the steps are inert text.
  given:
    navigable: none
    current: payment
    steps:
    - id: shipping
      label: Shipping address
    - id: payment
      label: Payment
    - id: review
      label: Review order
  when:
    click: indicator
  then:
  - event: onStepSelect
    fired: false
- name: compact-shows-the-step-count
  description: Below the prose width the stepper shows only the current label and
    "Step n of m".
  given:
    compact: true
    current: payment
    steps:
    - id: shipping
      label: Shipping address
    - id: payment
      label: Payment
    - id: review
      label: Review order
    - id: confirm
      label: Confirmation
  then:
  - text: Step 2 of 4
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-orientation-horizontal
  given:
    orientation: horizontal
  then:
  - renders: true
  derived: true
- name: renders-orientation-vertical
  given:
    orientation: vertical
  then:
  - renders: true
  derived: true
- name: renders-navigable-none
  given:
    navigable: none
  then:
  - renders: true
  derived: true
- name: renders-navigable-completed
  given:
    navigable: completed
  then:
  - renders: true
  derived: true
- name: renders-navigable-all
  given:
    navigable: all
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
