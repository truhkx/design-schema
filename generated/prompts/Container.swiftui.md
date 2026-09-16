# Generate: Container for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Container.swift` declaring `public struct Container: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/ContainerBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Container.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Container") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Container")` on the root and `"Container.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Container
  category: layout
  status: review
  anatomy:
  - column
  props:
    children:
      type: content
      required: true
      description: 'The page or region content, usually a Stack with `gap: section`
        between regions.'
    width:
      type: enum
      values:
      - prose
      - content
      - page
      - full
      default: content
      description: '`prose` for reading (a 65-character measure), `content` for most
        screens, `page` for full-bleed layouts with wide grids, `full` for no cap
        (gutters only).'
    gutter:
      type: enum
      values:
      - narrow
      - default
      - wide
      - none
      default: default
      description: 'Horizontal padding at the viewport edge. Responsive: `default`
        uses the narrow gutter under the content width and the wide gutter above the
        page width. `none` for a nested container inside a padded parent.'
    align:
      type: enum
      values:
      - center
      - start
      default: center
      description: Where the capped column sits in a wider viewport.
    element:
      type: enum
      values:
      - div
      - main
      - section
      default: div
      description: Use `main` for the page's main column when no Landmark wraps it.
      platforms:
      - web
      - lit
  styles:
    maxWidth:
      token: layout.maxWidth.{width}
      description: '`full` renders no max-width; the binding covers the other three.'
      locked: false
    paddingInline:
      token: layout.gutter.{gutter}
      description: '`none` renders no padding (a literal 0, with no hook). `narrow`
        and `wide` are fixed at every viewport. Only `default` is responsive: narrow
        below layout.maxWidth.content, default between, wide above layout.maxWidth.page.'
      locked: false
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: 'Block element with max-width, margin-inline auto (or 0 for align start)
        and padding-inline from tokens; the responsive gutter uses two media queries
        keyed to the maxWidth tokens (min-width: var() is not valid in media queries,
        so the generator reads the resolved px values from the token file at build
        time — the one place a resolved number appears, marked literal-ok).'
    lit:
      tag: ds-container
      reflect:
      - width
      - gutter
      - align
      notes: 'The host is the column (`:host { display: block }`) with a default slot.
        Same media-query note as web.'
    rn:
      element: View
      props: []
      notes: View with maxWidth, alignSelf (center → center, start → flex-start),
        width 100%, paddingHorizontal. The responsive gutter uses useWindowDimensions
        against the maxWidth tokens. On phones the cap rarely applies; on tablets
        and react-native-web it does.
    swiftui:
      element: VStack
      props:
      - .frame=maxWidth
      - .padding=horizontal
      - .frame=maxWidth-infinity
      - GeometryReader
      notes: 'Centers content at `layout.maxWidth.{width}` with horizontal gutters
        from the inset token: `.frame(maxWidth:)` inside `.frame(maxWidth: .infinity)`.
        Gutters shrink to the compact token below the prose width (a `GeometryReader`
        on the container''s own width, never `UIScreen`). Safe-area insets are respected
        by default (`ignoresSafeArea` is never applied by a component).'
  behavior:
  - name: main-element-is-the-page-landmark
    description: 'Container adds no semantics unless element: main is chosen, in which
      case it is the page''s main landmark and there must be exactly one.'
    given:
      element: main
    then:
    - role: main
      platforms:
      - web
  examples:
  - name: application-screen
    description: The default page column for application screens, centered at the
      content measure.
    given:
      children: A Stack of page regions
      width: content
  - name: reading-measure
    description: An article capped at the prose measure, about 65 characters a line.
    given:
      children: An article
      width: prose
  - name: nested-section
    description: A narrower measure inside an already padded parent, so the gutters
      are not applied twice.
    given:
      children: A narrower section
      width: prose
      gutter: none
```

## Constants and examples

- example `application-screen`, story `ApplicationScreen`: given `children: "A Stack of page regions"`, `width: "content"`; The default page column for application screens, centered at the content measure.
- example `reading-measure`, story `ReadingMeasure`: given `children: "An article"`, `width: "prose"`; An article capped at the prose measure, about 65 characters a line.
- example `nested-section`, story `NestedSection`: given `children: "A narrower section"`, `width: "prose"`, `gutter: "none"`; A narrower measure inside an already padded parent, so the gutters are not applied twice.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `maxWidth`, `paddingInline`
Locked (accessibility-bearing, never overridable): none

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .frame=maxWidth
- .padding=horizontal
- .frame=maxWidth-infinity
- GeometryReader
notes: 'Centers content at `layout.maxWidth.{width}` with horizontal gutters from
  the inset token: `.frame(maxWidth:)` inside `.frame(maxWidth: .infinity)`. Gutters
  shrink to the compact token below the prose width (a `GeometryReader` on the container''s
  own width, never `UIScreen`). Safe-area insets are respected by default (`ignoresSafeArea`
  is never applied by a component).'
```

## Guidance

## Overview

Container is where a screen's horizontal rhythm is decided once. It puts the gutter at the viewport edge and caps how wide content can get, so a form on a phone, a dashboard on a laptop and an article on a wide monitor all sit on the same measure — and no component ever needs to know how wide the page is.

## When to use

Wrap every page's content in one Container, inside the `main` Landmark, with `width: content` for application screens and `width: prose` for reading. Use `page` for layouts with wide data grids or side-by-side panels, and `full` only for edge-to-edge sections (a hero, a map) that manage their own inner Container. Nest a `gutter: none` Container inside a padded parent when a section needs a narrower measure than the page.

## When not to use

Do not use Container for spacing between things (Stack) or for a surface (Box, Card). Do not put a Container inside a Card. Do not set widths on components to make them line up; make the Container narrower.

## Behavior

Container renders a block that is the full viewport width minus the gutter, centered (or start-aligned) once the viewport exceeds the cap. The `default` gutter is responsive: narrow below the content width, default between, wide above the page width, so the edge breathes more as the screen grows. Nothing else changes with the viewport; components inside reflow on their own.

## Content guidelines

None.

## Accessibility

Content reflows to a single column at 320px wide without horizontal scrolling because the Container never sets a minimum width and the gutter shrinks on narrow viewports (WCAG 1.4.10). Prose measure keeps lines under about 80 characters, which helps readers with dyslexia and low vision (1.4.8, AAA advisory). Container adds no semantics unless `element: main` is chosen, in which case it is the page's main landmark and there must be exactly one.

## Platform notes

### Web
`display: block; max-inline-size: var(--layout-max-width-{width}); margin-inline: auto; padding-inline: var(--layout-gutter-narrow)`, then `@media (min-width: <content px>) { padding-inline: var(--layout-gutter) }` and `@media (min-width: <page px>) { padding-inline: var(--layout-gutter-wide) }`. The two breakpoint numbers are read from the built token JSON at generation time and marked `literal-ok: breakpoint from layout.maxWidth.*`; custom properties cannot be used in media queries.

### Lit
`<ds-container width="content">`; the host is the column with the same rules on `:host`. Same breakpoint note.

### React Native
`View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.*` (undefined for `full`), `alignSelf` from `align`, and `paddingHorizontal` chosen by comparing `useWindowDimensions().width` with the content and page tokens.

## Related

Stack, Box, Card, Landmark.

## Behavior scenarios (11)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-width-prose
  given:
    width: prose
  then:
  - renders: true
  derived: true
- name: renders-width-content
  given:
    width: content
  then:
  - renders: true
  derived: true
- name: renders-width-page
  given:
    width: page
  then:
  - renders: true
  derived: true
- name: renders-width-full
  given:
    width: full
  then:
  - renders: true
  derived: true
- name: renders-gutter-narrow
  given:
    gutter: narrow
  then:
  - renders: true
  derived: true
- name: renders-gutter-default
  given:
    gutter: default
  then:
  - renders: true
  derived: true
- name: renders-gutter-wide
  given:
    gutter: wide
  then:
  - renders: true
  derived: true
- name: renders-gutter-none
  given:
    gutter: none
  then:
  - renders: true
  derived: true
- name: renders-align-center
  given:
    align: center
  then:
  - renders: true
  derived: true
- name: renders-align-start
  given:
    align: start
  then:
  - renders: true
  derived: true
```
