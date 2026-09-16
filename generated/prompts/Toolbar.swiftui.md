# Generate: Toolbar for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Toolbar.swift` declaring `public struct Toolbar: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/ToolbarBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Toolbar.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Toolbar") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Toolbar")` on the root and `"Toolbar.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Toolbar
  category: navigation
  status: review
  apg: toolbar
  anatomy:
  - container
  - group
  - separator
  - overflowButton
  - overflowMenu
  composition:
    separator: Divider
    overflowButton: Button
    overflowMenu: Menu
  props:
    label:
      type: string
      required: true
      description: What the toolbar controls ("Formatting", "Table actions"). Not
        visible; read by assistive technology.
      a11y: aria-label / accessibilityLabel on the toolbar.
    children:
      type: content
      required: true
      description: 'Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly`
        for glyph tools), SegmentedControl, Select, Switch. Group related controls
        with `ToolbarGroup`; a Divider is drawn between groups.'
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: Vertical toolbars sit beside a canvas; arrow keys swap axes.
    overflow:
      type: enum
      values:
      - wrap
      - menu
      - scroll
      default: menu
      description: 'What happens when controls do not fit: wrap onto more rows, collapse
        trailing controls into a "More" Menu (each control must provide `overflowLabel`),
        or scroll horizontally with the edges faded.'
    size:
      type: enum
      values:
      - sm
      - md
      default: md
      description: Default for child controls that have a `size` prop and do not set
        their own (applied by cloning direct children; a child's own `size` wins).
    density:
      type: enum
      values:
      - compact
      - comfortable
      default: comfortable
      description: 'Gap between controls: tight or normal rhythm.'
  events: {}
  keyboard:
  - keys:
    - Tab
    action: Moves focus into the toolbar (to the last-focused control, initially the
      first) and, from inside, out of it — the toolbar is one tab stop.
    from: any
    expect: manual
  - keys:
    - ArrowRight
    action: Next control (ArrowDown when vertical). Skips disabled controls; does
      not wrap.
    from: first
    expect: focus-next
  - keys:
    - ArrowLeft
    action: Previous control (ArrowUp when vertical).
    from: last
    expect: focus-prev
  - keys:
    - Home
    action: First control.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last control.
    from: first
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: Activates the focused control (its own behavior).
    from: first
    expect: manual
  styles:
    background:
      token: color.background.subtle
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.md
      locked: false
    paddingInline:
      token: space.2
      locked: false
    paddingBlock:
      token: space.1
      locked: false
    itemGap:
      token: layout.gap.normal
      description: Between adjacent controls, inside a group and between ungrouped
        top-level controls alike.
      locked: false
    itemGapCompact:
      token: layout.gap.tight
      description: Used instead of itemGap when density is compact.
      locked: false
    groupGap:
      token: layout.gap.normal
      description: Either side of a separator, replacing itemGap there (not added
        to it).
      locked: false
    separatorLength:
      token: space.5
      description: The Divider between groups is shorter than the toolbar height.
      locked: false
    fadeWidth:
      token: space.6
      description: 'Edge fade for `overflow: scroll`, a gradient from the toolbar
        background to transparent.'
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    more: More
  a11y:
    role: toolbar
    requires:
    - accessible-name
    - roving-tabindex
    - arrow-navigation
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    contrast:
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.background.subtle
      level: AA
    - foreground: color.action.ghost.foreground
      background: color.background.subtle
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=toolbar
      - aria-label
      - aria-orientation
      notes: 'A <div role="toolbar" aria-label aria-orientation> managing a roving
        tabindex over its focusable descendants (query on mount and on a MutationObserver;
        SegmentedControl and RadioGroup count as one control and keep their own inner
        arrow keys — the toolbar hands the key to them when focus is inside). Overflow
        `menu`: a ResizeObserver measures children and moves trailing ones into a
        Menu whose items reuse each control''s `overflowLabel`/`onPress`; the hidden
        controls are removed from the DOM, not just hidden, so the roving list stays
        correct. Overflow `scroll`: overflow-x auto with scrollbar hidden and masked
        edges.'
    lit:
      tag: ds-toolbar
      reflect:
      - orientation
      - overflow
      - size
      - density
      notes: Slotted light-DOM children; the roving tabindex walks assigned elements
        (and into their shadow roots via delegatesFocus). ToolbarGroup is <ds-toolbar-group>.
        Overflow menu items are built from slotted elements' `overflow-label` attribute
        and a click() on the original element.
    rn:
      element: View
      props:
      - accessibilityRole=toolbar
      - accessibilityLabel
      notes: A horizontal ScrollView (overflow defaults to `scroll` on native; `menu`
        also works and opens an ActionSheet on phones through Menu's own rule). accessibilityRole="toolbar"
        on the container. No roving focus without a hardware keyboard; every control
        is reachable by swipe.
    swiftui:
      element: HStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - .focusSection
      - .onMoveCommand
      - '@FocusState'
      - ViewThatFits
      - Menu
      - Divider
      - ScrollView
      notes: 'An `HStack` (or `VStack`) in a `.contain` element labelled by `label`,
        one focus section with the roving `@FocusState` moved by arrows/Home/End on
        iPad. Overflow: `ViewThatFits` tries the full row, then progressively collapses
        trailing `Button`s (only Buttons, using each one''s `overflowLabel`) into
        a system `Menu` behind the `ellipsis` Button, as on web; `overflow: scroll`
        wraps the row in a horizontal `ScrollView` with faded edges drawn by a gradient
        mask. Groups are `ToolbarGroup` containers with `label` as their contained
        element''s label, separated by `Divider`s. `size` is cloned onto children
        through the environment. Not SwiftUI''s `.toolbar` (navigation-bar placement).'
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `itemGap`, `itemGapCompact`, `groupGap`, `separatorLength`, `fadeWidth`
Locked (accessibility-bearing, never overridable): `background`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: HStack
props:
- .accessibilityElement=contain
- .accessibilityLabel
- .focusSection
- .onMoveCommand
- '@FocusState'
- ViewThatFits
- Menu
- Divider
- ScrollView
notes: 'An `HStack` (or `VStack`) in a `.contain` element labelled by `label`, one
  focus section with the roving `@FocusState` moved by arrows/Home/End on iPad. Overflow:
  `ViewThatFits` tries the full row, then progressively collapses trailing `Button`s
  (only Buttons, using each one''s `overflowLabel`) into a system `Menu` behind the
  `ellipsis` Button, as on web; `overflow: scroll` wraps the row in a horizontal `ScrollView`
  with faded edges drawn by a gradient mask. Groups are `ToolbarGroup` containers
  with `label` as their contained element''s label, separated by `Divider`s. `size`
  is cloned onto children through the environment. Not SwiftUI''s `.toolbar` (navigation-bar
  placement).'
```

## Guidance

## Overview

A toolbar keeps a set of related controls together so the keyboard treats them as one stop: Tab reaches the toolbar, arrows move within it, Tab leaves it. That is what makes an editor with thirty buttons usable without thirty Tab presses.

## When to use

Use a Toolbar for controls that act on the same thing and are used together: text formatting, a table's row actions, a map's view switches, a data page's filter–sort–export row. Group by purpose with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for toolbars whose width the layout cannot guarantee; give every control an `overflowLabel` so it reads well as a menu item.

## When not to use

Do not use a Toolbar for page navigation (Breadcrumb, Tabs, a `nav` Landmark) or for a form's submit row (Form's action row). Do not put a single control in a toolbar. Do not use it as a generic horizontal Stack because it looks tidy: the roving tabindex changes how Tab works, which surprises users when the controls are unrelated.

## Behavior

Focus enters on the control that last had focus (initially the first). Arrow keys move along the toolbar's axis, skipping disabled controls, without wrapping; Home and End jump to the ends. A control that has its own arrow-key model (SegmentedControl, RadioGroup) keeps it: the toolbar only takes arrows when focus is on the control's edge and the arrow points out. When the toolbar is narrower than its content, `overflow` decides: wrap, move trailing controls into a "More" Menu (kept in their original order, groups become Menu groups), or scroll with faded edges. `ToolbarGroup` is part of Toolbar's API (`label` for the group's accessible name, `children`); a Divider is drawn between groups. Only Buttons collapse into the overflow Menu, using their `overflowLabel`; SegmentedControl, Select and Switch never collapse — the toolbar measures them as fixed and collapses Buttons from the end first. A control with its own arrow-key model handles the key first; the toolbar acts only when the control did not (`defaultPrevented`). On native the fade is drawn with react-native-svg; `overflow: menu` renders as `scroll`.

## Content guidelines

Icon-only buttons need a Tooltip and an `overflowLabel`; the two should be the same words ("Bold", "Align left"). Put the most-used controls first, the destructive ones last and in their own group. A toolbar's `label` names what it controls, not "toolbar".

## Accessibility

The container is a `toolbar` with an accessible name and orientation (WCAG 4.1.2; APG toolbar), using a roving tabindex so it is a single tab stop (2.4.3) with arrow-key movement (2.1.1). Controls keep their own roles and names, so the Menu that overflow produces has the same names. Focus is visible on each control (2.4.7), targets meet 24px, and a scrolling toolbar remains keyboard-reachable because focusing a control scrolls it into view.

## Platform notes

### Web
Render `<div role="toolbar" aria-label aria-orientation data-ds="Toolbar">`; children in `ToolbarGroup` (`<div role="group">`) separated by `Divider orientation="vertical"` with its length from `separatorLength`. Roving tabindex: keep an index into the focusable list (`button, [role=radio][aria-checked=true], select, input, [tabindex]` that are not disabled), set `tabIndex 0` on the current and `-1` on the rest, update on `focusin`. Keydown per the table, respecting `orientation`. Overflow `menu`: a `ResizeObserver` on the container, measure children offsets, move those past the limit into state rendered by `Menu` (trigger a `Button ghost iconOnly` "More" with the ellipsis Icon); `scroll`: `overflow-x: auto; scrollbar-width: none` plus `mask-image` linear gradients of `fadeWidth`.

### Lit
`<ds-toolbar label="Formatting"><ds-toolbar-group><ds-button …></ds-toolbar-group>…</ds-toolbar>`; the roving list is rebuilt on `slotchange`; keys handled on the host from bubbling keydown, using `composedPath()` to find the control.

### React Native
Horizontal `ScrollView` with `contentContainerStyle` gap from `itemGap`, `accessibilityRole="toolbar"`; groups are `View`s separated by `Divider`. Overflow `menu` uses `Menu` (ActionSheet on phones). Arrow handling applies on react-native-web only.

## Related

Button, Menu, SegmentedControl, Divider, Tooltip.

## Behavior scenarios (11)

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
- name: renders-overflow-wrap
  given:
    overflow: wrap
  then:
  - renders: true
  derived: true
- name: renders-overflow-menu
  given:
    overflow: menu
  then:
  - renders: true
  derived: true
- name: renders-overflow-scroll
  given:
    overflow: scroll
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
- name: renders-density-compact
  given:
    density: compact
  then:
  - renders: true
  derived: true
- name: renders-density-comfortable
  given:
    density: comfortable
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
