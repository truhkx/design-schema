# Generate: Tabs for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Tabs.swift` declaring `public struct Tabs: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/TabsBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Tabs.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Tabs") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Tabs")` on the root and `"Tabs.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Tabs
  category: navigation
  status: review
  apg: tabs
  anatomy:
  - tablist
  - tab
  - tabLabel
  - tabIcon
  - tabBadge
  - indicator
  - panel
  composition:
    tabIcon: Icon
  props:
    tabs:
      type: array
      required: true
      shape: '{ id: string; label: string; icon?: IconName; disabled?: boolean; badge?:
        string }[]'
      description: The tabs in order. `badge` is a short count or status shown after
        the label ("3", "New").
    children:
      type: content
      required: true
      description: One panel per tab, in the same order, each wrapped in the exported
        `TabPanel` (or `<ds-tab-panel>`) with a matching `id`. Only the selected panel
        is rendered unless `keepMounted`.
    label:
      type: string
      required: true
      description: Accessible name of the tab list ("Account sections"). Not shown
        visually.
    value:
      type: string
      description: Controlled selected tab id. Omit for uncontrolled.
    defaultValue:
      type: string
      description: Initially selected tab id. Defaults to the first enabled tab.
    activation:
      type: enum
      values:
      - automatic
      - manual
      default: automatic
      description: '`automatic` selects a tab as arrow keys move to it (fine when
        panels are cheap); `manual` moves focus only and selects on Enter/Space (use
        when a panel loads data).'
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: Vertical tab lists sit beside their panels and use Up/Down arrows.
    fit:
      type: enum
      values:
      - start
      - fill
      default: start
      description: '`start` packs tabs at the start; `fill` stretches them across
        the width (phones, two to four tabs).'
    keepMounted:
      type: boolean
      default: false
      description: Keep unselected panels in the tree (hidden) so their state survives
        switching.
  events:
    onChange:
      description: Fired when the selected tab changes, with the new id.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
  keyboard:
  - keys:
    - Tab
    action: Moves focus to the selected tab, then out of the tab list into the panel
      (the list is one tab stop).
    from: any
    expect: manual
  - keys:
    - ArrowRight
    action: Moves to the next tab, wrapping; selects it under automatic activation.
    when: horizontal
    from: first
    expect: focus-next
  - keys:
    - ArrowLeft
    action: Moves to the previous tab, wrapping.
    when: horizontal
    from: last
    expect: focus-prev
  - keys:
    - ArrowDown
    action: Moves to the next tab, wrapping; selects it under automatic activation.
    when: vertical
    from: first
    expect: manual
  - keys:
    - ArrowUp
    action: Moves to the previous tab, wrapping.
    when: vertical
    from: last
    expect: manual
  - keys:
    - ArrowRight
    action: From the last tab wraps to the first.
    when: horizontal
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Home
    action: First tab.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last tab.
    from: first
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: Selects the focused tab (manual activation).
    when: manual
    from: first
    expect: selects
  styles:
    tabColor:
      token: color.foreground.muted
      locked: true
    tabSelectedColor:
      token: color.foreground.strong
      locked: true
    tabHoverBackground:
      token: color.background.subtle
      locked: true
    tabPaddingBlock:
      token: space.sm
      locked: false
    tabPaddingInline:
      token: space.md
      locked: false
    tabGap:
      token: layout.gap.tight
      description: Between icon, label and badge inside a tab.
      locked: false
    listGap:
      token: layout.gap.none
      description: Tabs touch; the indicator separates them.
      locked: false
    indicator:
      token: color.control.selectedBackground
      description: The selected tab's underline (horizontal, flush against the list
        border at the bottom edge) or side bar (vertical, flush against the inline-end
        edge next to the panels) — the selected-control fill, which is chosen per
        mode to meet 3:1 on the page (the primary button fill is not).
      locked: true
    indicatorThickness:
      token: border.width.focus
      locked: true
    listBorder:
      token: color.border
      description: The rule under the whole tab list.
      locked: false
    listBorderWidth:
      token: border.width.thin
      locked: false
    panelGap:
      token: layout.gap.loose
      description: Between the tab list and the panel.
      locked: false
    badgeColor:
      token: color.foreground.muted
      locked: true
    badgeSize:
      token: font.size.xs
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    fontWeight:
      token: font.weight.medium
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    radius:
      token: radius.sm
      description: On the tab's hover background and focus ring.
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    transition:
      token: motion.duration.fast
      description: Indicator movement, with motion.easing.standard; instant under
        reduced motion.
      locked: false
    disabledOpacity:
      token: opacity.disabled
      locked: false
  a11y:
    role: tablist
    requires:
    - accessible-name
    - selected-state
    - arrow-navigation
    - roving-tabindex
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    - reduced-motion
    contrast:
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.strong
      background: color.background
      level: AA
    - foreground: color.foreground.strong
      background: color.background.subtle
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
  platforms:
    web:
      element: div
      attributes:
      - role=tablist
      - aria-label
      - aria-orientation
      - role=tab
      - aria-selected
      - aria-controls
      - tabindex
      - role=tabpanel
      - aria-labelledby
      notes: <div role="tablist" aria-label> of <button role="tab" aria-selected aria-controls
        tabindex={0|-1}>; panels are <div role="tabpanel" aria-labelledby tabindex="0">
        (focusable so Tab from the list lands on the panel content region). The indicator
        is a pseudo-element or an absolutely positioned bar animated between tabs.
        The tab list scrolls horizontally with overflow when tabs exceed the width,
        with the selected tab scrolled into view.
    lit:
      tag: ds-tabs
      reflect:
      - value
      - orientation
      - activation
      - fit
      notes: '`tabs` is a property. Panels are slotted <ds-tab-panel id> light-DOM
        elements; ds-tabs sets hidden/aria-labelledby on them from slotchange and
        renders the tab list in its shadow root. Panels are never moved, detached
        or re-appended: `keepMounted: false` is expressed only by toggling the `hidden`
        attribute on the slotted panel, so there is no detached-panel map. A slotchange
        handler must never call appendChild, insertBefore or remove on its own slotted
        children - re-inserting a node that is already a child re-fires slotchange
        and spins the renderer until the tab is killed. `change` is a composed CustomEvent
        with detail { value }. Roving tabindex over shadow tabs.'
    rn:
      element: View
      props:
      - accessibilityRole=tablist
      - accessibilityRole=tab
      - accessibilityState
      notes: A horizontal ScrollView (or View with fill) of Pressables with accessibilityRole="tab"
        and accessibilityState={{ selected }}; panels are Views. Arrow keys apply
        with a hardware keyboard only; each tab is its own accessibility stop, as
        on native. Indicator animated with Animated.
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - Button
      - .accessibilityAddTraits=isSelected
      - .focusable
      - .onMoveCommand
      - '@FocusState'
      - ScrollView
      - ScrollViewReader
      notes: 'Not `TabView` (bottom tab bar semantics). The tab list is an `HStack`
        in a horizontal `ScrollView` (scrolls when tabs overflow; `ScrollViewReader`
        keeps the selected tab visible) of `Button`s with `.isSelected` on the current
        one and `.accessibilityValue(copy.position)`; the list is one focus section
        and arrows move the roving `@FocusState` per `activation` (automatic selects
        on move, manual on Enter/Space). Panels are the package''s own views shown
        by selection, each `.accessibilityElement(children: .contain)` labelled by
        its tab. `orientation: vertical` swaps the stacks. Indicator and borders from
        the tokens with the `transition` animation.'
```

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `tabPaddingBlock`, `tabPaddingInline`, `tabGap`, `listGap`, `listBorder`, `listBorderWidth`, `panelGap`, `badgeSize`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `radius`, `transition`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `tabColor`, `tabSelectedColor`, `tabHoverBackground`, `indicator`, `indicatorThickness`, `badgeColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .accessibilityElement=contain
- Button
- .accessibilityAddTraits=isSelected
- .focusable
- .onMoveCommand
- '@FocusState'
- ScrollView
- ScrollViewReader
notes: 'Not `TabView` (bottom tab bar semantics). The tab list is an `HStack` in a
  horizontal `ScrollView` (scrolls when tabs overflow; `ScrollViewReader` keeps the
  selected tab visible) of `Button`s with `.isSelected` on the current one and `.accessibilityValue(copy.position)`;
  the list is one focus section and arrows move the roving `@FocusState` per `activation`
  (automatic selects on move, manual on Enter/Space). Panels are the package''s own
  views shown by selection, each `.accessibilityElement(children: .contain)` labelled
  by its tab. `orientation: vertical` swaps the stacks. Indicator and borders from
  the tokens with the `transition` animation.'
```

## Guidance

## Overview

Tabs let one region of a screen show one of several views. The tab list is a single stop in the tab order — arrow keys move between tabs — and the selected panel follows immediately. They are for views of equal standing that the user switches between often; not for steps, and not for navigation between pages.

## When to use

Use Tabs to split a region's content into two to about seven views that are alternatives of each other: the sections of a settings page, "Overview / Activity / Files" on a record, code and preview. Use `manual` activation when a panel is expensive to show. Use `vertical` when there are many tabs and horizontal room is short. Use `fill` on phones for two to four tabs.

## When not to use

Do not use Tabs for navigation to different pages — that is a nav Landmark of Links, styled as tabs if you like, but with real links so the URL changes. Do not use them for a sequence (Stepper, planned) or a comparison where the user needs to see several panels at once (put them side by side or in an Accordion). Do not put a tab list inside a Card header for one or two tabs; a SegmentedControl is lighter.

## Behavior

The selected tab is the list's single tab stop. Arrow keys along the orientation move focus between enabled tabs and wrap; with `automatic` activation the moved-to tab is selected and its panel shown, with `manual` the user presses Enter or Space. Home and End jump. Tab from a tab moves into the selected panel. Disabled tabs are visible, announced disabled and skipped. Only the selected panel is rendered unless `keepMounted`, in which case unselected panels are hidden. The indicator animates to the selected tab. When tabs overflow horizontally, the list scrolls and the selected tab is kept in view. Disabled tabs are `aria-disabled`, skipped by the arrow keys and not tab stops (a disabled tab has nothing to reach); they remain visible and readable. `fit: fill` stretches tabs along the orientation axis in both orientations. Badges are read as part of the tab's name ("Inbox, 3"). A tab without a matching panel, or a panel without a tab, is a development warning and is not rendered. On Lit, panels are light-DOM children, so `keepMounted: false` hides inactive panels with the `hidden` attribute rather than removing them.

## Content guidelines

Tab labels are one or two words, sentence case, nouns ("Activity", "Members"), never verbs. Badges are short counts or a single status word. The tab list `label` names what the tabs divide ("Project sections"). Order tabs by frequency of use, not alphabetically, and never reorder them at runtime.

## Accessibility

Role `tablist` with a name, `tab`s with `aria-selected` and `aria-controls`, panels with `tabpanel` and `aria-labelledby` (WCAG 4.1.2; APG tabs). One tab stop with arrow movement (roving-tabindex, arrow-navigation), so a screen full of tabs is not a screen full of stops. Selection is conveyed by `aria-selected`, the indicator and the stronger text color — not color alone (1.4.1). Panels are focusable so keyboard users land in the content. Targets meet 44px; the indicator meets 3:1 on the page (1.4.11). The indicator animation respects reduced motion.

## Platform notes

### Web
Render `<div role="tablist" aria-label aria-orientation>` of `<button role="tab" id aria-selected aria-controls tabindex>`, with the indicator as an absolutely positioned bar whose `inset-inline-start` and `inline-size` update from the selected tab's offset (transitioned with `transition`). Panels: `<div role="tabpanel" id aria-labelledby tabindex="0" hidden>`. Keydown on the list implements the keyboard table for the orientation. `overflow-x: auto; scrollbar-width: none` on the list with `scrollIntoView({ inline: 'nearest' })` on selection. Export `TabPanel` as the wrapper for children.

### Lit
`<ds-tabs label="Project sections" .tabs=${tabs}><ds-tab-panel id="overview">…</ds-tab-panel>…</ds-tabs>`. Tab list in the shadow root; panels are light-DOM `<ds-tab-panel>` elements that ds-tabs manages (`hidden`, `role="tabpanel"`, `aria-labelledby` pointing at a shadow tab requires the tab id to be exposed — set `aria-labelledby` to a light-DOM proxy text or use `aria-label={tab label}` on the panel instead, since IDREFs do not cross shadow boundaries). Composed `change`.

### React Native
`ScrollView horizontal` (or a `View` with `flexDirection: 'row'` for `fill`) of `Pressable accessibilityRole="tab" accessibilityState={{ selected, disabled }}`; the indicator is an `Animated.View` positioned from the measured tab layout; panels are `View`s rendered when selected. Vertical: a column of tabs beside the panel. Arrow keys through `onKeyDown` are web-only (react-native-web); on native every tab is an accessibility stop.

## Related

SegmentedControl, Accordion, Disclosure, Link, Stepper (planned).

## Behavior scenarios (8)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-activation-automatic
  given:
    activation: automatic
  then:
  - renders: true
  derived: true
- name: renders-activation-manual
  given:
    activation: manual
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
- name: renders-fit-start
  given:
    fit: start
  then:
  - renders: true
  derived: true
- name: renders-fit-fill
  given:
    fit: fill
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
