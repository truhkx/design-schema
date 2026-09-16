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
  composition:
    label: Text
    description: Text
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
        before it complete, after it upcoming.'
    current:
      type: string
      required: true
      description: The id of the current step.
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: Vertical shows descriptions under each label and suits a side column;
        horizontal collapses to `compact` below the prose width.
    navigable:
      type: enum
      values:
      - none
      - completed
      - all
      default: completed
      description: 'Which steps are Buttons: none (display only), completed steps
        (the usual — you can go back, not skip ahead), or all (a settings-style flow
        where order does not matter).'
    compact:
      type: boolean
      default: false
      description: Show only the current step's label and "Step 2 of 5"; the indicators
        stay. Automatic on narrow viewports for horizontal steppers.
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
      locked: true
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
      locked: true
    connectorWidth:
      token: border.width.focus
      part: connector
      locked: true
    labelColor:
      token: color.foreground
      part: label
      locked: true
    labelUpcomingColor:
      token: color.foreground.muted
      part: label
      locked: true
    labelWeight:
      token: font.weight.medium
      part: label
      locked: false
    labelCurrentWeight:
      token: font.weight.semibold
      part: label
      locked: false
    labelSize:
      token: font.size.sm
      part: label
      locked: false
    descriptionColor:
      token: color.foreground.muted
      part: description
      locked: true
    descriptionSize:
      token: font.size.xs
      part: description
      locked: false
    indicatorColor:
      token: color.foreground
      part: indicator
      description: Numeral or glyph on current and upcoming steps.
      locked: true
    stepHover:
      token: color.action.ghost.backgroundHover
      part: step
      state: hover
      description: Hover and press background of a navigable step.
      locked: false
    stepRadius:
      token: radius.sm
      part: step
      locked: false
    stepGap:
      token: layout.gap.normal
      part: step
      description: Between steps along the orientation axis (the connector fills it).
      locked: false
    partGap:
      token: space.2
      description: Between the indicator and its label.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    transition:
      token: motion.duration.fast
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
      element: ol
      attributes:
      - aria-label
      - aria-current=step
      - data-ds=Stepper
      notes: A <nav aria-label="Progress"> wrapping an <ol>; each <li> holds either
        a Button (ghost, navigable) or a <div> with the same content. aria-current="step"
        on the current item's control. The indicator shows the step number, a check
        Icon when complete, or the danger Icon on error, with a visually-hidden status
        word from copy so the state is not conveyed by color or shape alone. Below
        layout.maxWidth.prose the horizontal stepper switches to `compact` via a container
        query.
    lit:
      tag: ds-stepper
      reflect:
      - orientation
      - navigable
      - compact
      - current
      notes: '`steps` as a property; shadow <nav><ol>; composed `step-select`. Container
        query on :host for the compact switch.'
    rn:
      element: View
      props:
      - accessibilityRole=list
      - accessibilityLabel
      notes: 'A View with accessibilityRole="list"; each step a Pressable (navigable)
        or View with accessibilityState={{ selected: current }} and an accessibilityLabel
        built from copy.stepLabel plus the status word. Horizontal steppers use `compact`
        on phones; vertical is preferred for long flows.'
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

## Style bindings

- `indicatorSize`: token `space.6`; part `indicator`
- `indicatorBackground`: token `color.control.background`; part `indicator`
- `indicatorBorder`: token `color.border.strong`; part `indicator`; locked
- `indicatorBorderWidth`: token `border.width.focus`; part `indicator`; locked
- `indicatorCompleteBackground`: token `color.control.selectedBackground`; part `indicator`; locked
- `indicatorCompleteForeground`: token `color.control.selectedForeground`; part `indicator`; locked
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
- `indicatorColor`: token `color.foreground`; part `indicator`; locked
- `stepHover`: token `color.action.ghost.backgroundHover`; part `step`; state `hover`
- `stepRadius`: token `radius.sm`; part `step`
- `stepGap`: token `layout.gap.normal`; part `step`

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

Overridable: `indicatorSize`, `indicatorBackground`, `indicatorFontSize`, `indicatorFontWeight`, `connector`, `labelWeight`, `labelCurrentWeight`, `labelSize`, `descriptionSize`, `stepHover`, `stepRadius`, `stepGap`, `partGap`, `fontFamily`, `transition`
Locked (accessibility-bearing, never overridable): `indicatorBorder`, `indicatorBorderWidth`, `indicatorCompleteBackground`, `indicatorCompleteForeground`, `indicatorCurrentBorder`, `indicatorErrorBackground`, `indicatorErrorForeground`, `indicatorErrorBorder`, `connectorComplete`, `connectorWidth`, `labelColor`, `labelUpcomingColor`, `descriptionColor`, `indicatorColor`, `minTarget`, `focusRing`, `focusRingWidth`

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

Steps before `current` render complete (check), the current one is marked, later ones are upcoming. A step can be marked `error` explicitly (validation failed on a step the user left). Navigable steps are Buttons that fire `onStepSelect`; the container decides whether to move. Non-navigable steps are inert text. Below the prose width a horizontal stepper shows only the current label and "Step n of m" (`compact`), keeping the row of indicators so the count is still visible. A navigable step is its own native `<button>` (Pressable on native) owned by Stepper — not the Button component, whose single-label API cannot hold an indicator, label and description — with the accessible name from `copy.stepLabel` plus the status word set as `aria-label`. Label and description colors are passed to the composed Text as `tone`/overrides. `navigable: completed` means every step before the current one, including one marked `error`. `compact` applies to horizontal steppers only.

## Content guidelines

Labels are two or three words in sentence case naming the step's content ("Shipping address", "Review order"), parallel across the list. Descriptions, when used, say what happens or how long it takes. Number the steps only through the indicator; never write "Step 1:" in the label — the component adds it for assistive technology.

## Accessibility

The stepper is a `nav` (named "Progress" or by the flow) containing an ordered list, and the current step carries `aria-current="step"` (WCAG 1.3.1, 4.1.2). Each step's name includes its number and status from copy, so a screen-reader user hears "Step 2: Payment, current step" (1.3.3). State is conveyed by the check/number/danger glyph and the status word, not by color alone (1.4.1), and the indicator ring meets 3:1 (1.4.11). Navigable steps are Buttons with visible focus and 24px targets; non-navigable ones are not focusable so Tab does not stop on decoration (2.4.3).

## Platform notes

### Web
Render `<nav aria-label={label ?? "Progress"} data-ds="Stepper"><ol>` with an `<li>` per step containing the indicator `<span aria-hidden>` (number, `Icon name="check"`, or `Icon name="danger"`), a connector `<span aria-hidden>` after all but the last, and the label/description `Text`s wrapped in a `Button variant="ghost"` when navigable (with `aria-current="step"` for the current step) or a `<div>` otherwise. A visually-hidden `<span>` inside the control adds the status word. `@container (max-width: <prose px>)` switches to compact for horizontal orientation (breakpoint read from the built token JSON, `literal-ok: breakpoint from layout.maxWidth.prose`).

### Lit
`<ds-stepper current="payment" .steps=${steps}></ds-stepper>`; shadow `<nav><ol>`; `step-select` composed; `container-type: inline-size` on the host for the compact switch.

### React Native
`View` (`accessibilityRole="list"`) laid out in a row or column; each step a `Pressable` (navigable) or `View` with `accessible`, `accessibilityLabel` from `copy.stepLabel` + status word, `accessibilityState.selected` for the current step. Connectors are `View`s with `connectorWidth`. Use `compact` on phones for horizontal steppers (decided by the screen width against `layout.maxWidth.prose`).

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
