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
- Controlled/uncontrolled pairs (`value`/`defaultValue`, `open`/`defaultOpen`) become a `Binding<T>?` parameter plus a `default` initial value, with `@State` holding the uncontrolled value.
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
  styles:
    indicatorSize:
      token: space.6
      locked: false
    indicatorBackground:
      token: color.control.background
      locked: false
    indicatorBorder:
      token: color.border.strong
      locked: true
    indicatorBorderWidth:
      token: border.width.focus
      locked: true
    indicatorCompleteBackground:
      token: color.control.selectedBackground
      locked: true
    indicatorCompleteForeground:
      token: color.control.selectedForeground
      locked: true
    indicatorCurrentBorder:
      token: color.control.selectedBackground
      locked: true
    indicatorErrorBackground:
      token: color.status.danger.background
      locked: true
    indicatorErrorForeground:
      token: color.status.danger.foreground
      locked: true
    indicatorErrorBorder:
      token: color.status.danger.icon
      description: The ring; the danger icon step is the one guaranteed 3:1 against
        the page.
      locked: true
    indicatorFontSize:
      token: font.size.sm
      locked: false
    indicatorFontWeight:
      token: font.weight.semibold
      locked: false
    connector:
      token: color.border
      locked: false
    connectorComplete:
      token: color.control.selectedBackground
      locked: true
    connectorWidth:
      token: border.width.focus
      locked: true
    labelColor:
      token: color.foreground
      locked: true
    labelUpcomingColor:
      token: color.foreground.muted
      locked: true
    labelWeight:
      token: font.weight.medium
      locked: false
    labelCurrentWeight:
      token: font.weight.semibold
      locked: false
    labelSize:
      token: font.size.sm
      locked: false
    descriptionColor:
      token: color.foreground.muted
      locked: true
    descriptionSize:
      token: font.size.xs
      locked: false
    indicatorColor:
      token: color.foreground
      description: Numeral or glyph on current and upcoming steps.
      locked: true
    stepHover:
      token: color.action.ghost.backgroundHover
      description: Hover and press background of a navigable step.
      locked: false
    stepRadius:
      token: radius.sm
      locked: false
    stepGap:
      token: layout.gap.normal
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
    stepOf: Step {current} of {total}
    complete: completed
    current: current step
    error: has an error
    stepLabel: 'Step {n}: {label}'
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
      large: true
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
    - foreground: color.border.strong
      background: color.background
      level: AA
      large: true
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
```

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

## Behavior scenarios (7)

One test per scenario, in this order.

```yaml
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
