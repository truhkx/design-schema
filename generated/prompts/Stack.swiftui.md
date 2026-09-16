# Generate: Stack for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Stack.swift` declaring `public struct Stack: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/StackBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Stack.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Stack") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Stack")` on the root and `"Stack.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Stack
  category: layout
  status: review
  anatomy:
  - container
  props:
    children:
      type: content
      required: true
      description: Any components. Stack does not style its children; it only positions
        them.
    direction:
      type: enum
      values:
      - vertical
      - horizontal
      default: vertical
      description: Main axis. `horizontal` follows writing direction (start→end),
        not left→right.
    gap:
      type: enum
      values:
      - none
      - tight
      - normal
      - loose
      - section
      default: normal
      description: 'Space between children, from the layout rhythm (`layout.gap.*`),
        not the raw spacing scale: tight for related controls, normal for fields in
        a form, loose for groups, section between page sections. The only way to set
        spacing between siblings.'
    align:
      type: enum
      values:
      - start
      - center
      - end
      - stretch
      default: stretch
      description: Cross-axis alignment.
    justify:
      type: enum
      values:
      - start
      - center
      - end
      - between
      default: start
      description: Main-axis distribution.
    wrap:
      type: boolean
      default: false
      description: Allow horizontal stacks to wrap onto new lines instead of overflowing.
      a11y: Prefer wrapping over horizontal scrolling so content reflows at 320px
        and 400% zoom.
    element:
      type: enum
      values:
      - div
      - section
      - nav
      - ul
      - ol
      default: div
      description: Landmark or list semantics when the group has meaning. For `ul`/`ol`,
        each child is wrapped in an `li`.
      platforms:
      - web
      - lit
  styles:
    gap:
      token: layout.gap.{gap}
      description: '`gap: none` renders no gap and makes `overrides.gap` a no-op,
        per the presence rule.'
      locked: false
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: Flexbox. `gap` maps to the CSS gap property with the layout.gap token;
        no margins on children.
    lit:
      tag: ds-stack
      reflect:
      - direction
      - gap
      - align
      - justify
      - wrap
      notes: 'The host is the flex container (`:host { display: flex }`) with a default
        slot, so children stay in the light DOM and keep their own semantics.'
    rn:
      element: View
      props:
      - style
      notes: Flexbox with `gap` (RN ≥ 0.71). Children are not wrapped. `element` is
        not applicable; use `accessibilityRole` on the content instead.
    swiftui:
      element: VStack
      props:
      - HStack
      - spacing
      - alignment
      - .frame
      - ViewThatFits
      - .accessibilityElement=contain
      notes: '`VStack`/`HStack` with `spacing` from the gap token and `alignment`
        from `align`; `wrap` uses a `Layout`-conforming `FlowLayout` in `Support/`
        (SwiftUI has no flex-wrap). `direction: responsive` (row above a width, column
        below) is `ViewThatFits(in: .horizontal)` with the HStack first. Dividers
        between items (`divider: true`) are the system `Divider` inserted by `ForEach`
        over the subviews via `Group` + `_VariadicView`-free approach: children are
        passed as an array of views through the package''s `Stack { … }` result builder,
        so Stack can interleave.'
  behavior:
  - name: nav-element-is-a-navigation-landmark
    description: Choose element when the group has meaning - nav for navigation -
      so the structure is exposed to assistive technology.
    given:
      element: nav
    then:
    - role: navigation
      platforms:
      - web
      - lit
  - name: list-element-is-a-list
    description: For ul, each child is wrapped in an li, so assistive technology announces
      the group as a list and counts its items.
    given:
      element: ul
    then:
    - role: list
      platforms:
      - web
      - lit
  examples:
  - name: form-fields
    description: The usual vertical rhythm between fields in a form.
    given:
      direction: vertical
      gap: normal
      children: The form fields
  - name: button-row
    description: A row of actions at the end of a form or card, tightly spaced and
      pushed to the end.
    given:
      direction: horizontal
      gap: tight
      justify: end
      children: A submit Button and a Cancel Button
  - name: page-sections
    description: The section rhythm between the regions of a page.
    given:
      direction: vertical
      gap: section
      children: The regions of the page
  - name: wrapping-filters
    description: A horizontal group that reflows onto new lines on narrow viewports
      instead of overflowing.
    given:
      direction: horizontal
      gap: tight
      wrap: true
      children: A row of filters
```

## Constants and examples

- example `form-fields`, story `FormFields`: given `direction: "vertical"`, `gap: "normal"`, `children: "The form fields"`; The usual vertical rhythm between fields in a form.
- example `button-row`, story `ButtonRow`: given `direction: "horizontal"`, `gap: "tight"`, `justify: "end"`, `children: "A submit Button and a Cancel Button"`; A row of actions at the end of a form or card, tightly spaced and pushed to the end.
- example `page-sections`, story `PageSections`: given `direction: "vertical"`, `gap: "section"`, `children: "The regions of the page"`; The section rhythm between the regions of a page.
- example `wrapping-filters`, story `WrappingFilters`: given `direction: "horizontal"`, `gap: "tight"`, `wrap: true`, `children: "A row of filters"`; A horizontal group that reflows onto new lines on narrow viewports instead of overflowing.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `gap`
Locked (accessibility-bearing, never overridable): none

## Platform notes (swiftui)

```yaml
element: VStack
props:
- HStack
- spacing
- alignment
- .frame
- ViewThatFits
- .accessibilityElement=contain
notes: "`VStack`/`HStack` with `spacing` from the gap token and `alignment` from `align`;\
  \ `wrap` uses a `Layout`-conforming `FlowLayout` in `Support/` (SwiftUI has no flex-wrap).\
  \ `direction: responsive` (row above a width, column below) is `ViewThatFits(in:\
  \ .horizontal)` with the HStack first. Dividers between items (`divider: true`)\
  \ are the system `Divider` inserted by `ForEach` over the subviews via `Group` +\
  \ `_VariadicView`-free approach: children are passed as an array of views through\
  \ the package's `Stack { \u2026 }` result builder, so Stack can interleave."
```

## Guidance

## Overview

Stack is how things get spaced. Instead of margins on individual components, a Stack owns the gap between its children, using one of the theme's rhythm presets (`layout.gap.*`) rather than a raw number, so a theme with `layout.rhythm: loose` opens up every screen at once. Almost every screen is stacks inside stacks.

## When to use

Use Stack for any group of siblings that should be evenly spaced: form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach for it before writing any layout CSS. Choose `element` when the group has meaning — `nav` for navigation, `ul` for a list of like items — so the structure is exposed to assistive technology.

## When not to use

Do not use Stack for two-dimensional layouts (use Grid, planned) or for positioning a single element (use spacing tokens on the parent). Do not set gaps between children by adding margins to the children; that defeats the purpose.

## Behavior

Stack is purely presentational: no events, no state. `horizontal` stacks overflow by default; set `wrap` so content reflows on narrow viewports. `align: stretch` (the default) makes children fill the cross axis, which is what buttons in a vertical stack usually want; set `start` for natural widths.

## Accessibility

Stack has no role by default and adds nothing to the accessibility tree. When `element` is a landmark or list, the correct semantics are rendered (`nav`, `ul` with `li` children). Horizontal stacks should wrap rather than scroll so content reflows at 320px width and 400% zoom (WCAG 1.4.10). Spacing from the scale keeps interactive targets separated enough to meet 2.5.8 target spacing when the targets themselves are small.

## Platform notes

### Web
`display: flex` with `flex-direction`, `gap: var(--layout-gap-<preset>)`, `align-items`, `justify-content`, and `flex-wrap`. `between` maps to `space-between`.

### Lit
`<ds-stack direction="horizontal" gap="tight">`. The host itself is the flex container; children are slotted light-DOM nodes, so their semantics are untouched. `element="ul"` renders the slot inside a `<ul role="list">` and wraps each assigned node in an `<li>` via slotchange.

### React Native
`View` with `flexDirection`, `gap` from the RN token object, `alignItems`, `justifyContent`, `flexWrap`. `start`/`end` map to `flex-start`/`flex-end`.

## Related

Form, Button.

## Behavior scenarios (16)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-direction-vertical
  given:
    direction: vertical
  then:
  - renders: true
  derived: true
- name: renders-direction-horizontal
  given:
    direction: horizontal
  then:
  - renders: true
  derived: true
- name: renders-gap-none
  given:
    gap: none
  then:
  - renders: true
  derived: true
- name: renders-gap-tight
  given:
    gap: tight
  then:
  - renders: true
  derived: true
- name: renders-gap-normal
  given:
    gap: normal
  then:
  - renders: true
  derived: true
- name: renders-gap-loose
  given:
    gap: loose
  then:
  - renders: true
  derived: true
- name: renders-gap-section
  given:
    gap: section
  then:
  - renders: true
  derived: true
- name: renders-align-start
  given:
    align: start
  then:
  - renders: true
  derived: true
- name: renders-align-center
  given:
    align: center
  then:
  - renders: true
  derived: true
- name: renders-align-end
  given:
    align: end
  then:
  - renders: true
  derived: true
- name: renders-align-stretch
  given:
    align: stretch
  then:
  - renders: true
  derived: true
- name: renders-justify-start
  given:
    justify: start
  then:
  - renders: true
  derived: true
- name: renders-justify-center
  given:
    justify: center
  then:
  - renders: true
  derived: true
- name: renders-justify-end
  given:
    justify: end
  then:
  - renders: true
  derived: true
- name: renders-justify-between
  given:
    justify: between
  then:
  - renders: true
  derived: true
```
