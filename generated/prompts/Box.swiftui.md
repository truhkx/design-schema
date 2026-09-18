# Generate: Box for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Box.swift` declaring `public struct Box: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/BoxBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Box.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Box") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Box")` on the root and `"Box.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Box
  category: layout
  status: review
  anatomy:
  - surface
  props:
    children:
      type: content
      required: true
      description: 'Any content. Box does not space its children; put a Stack inside
        for that. A string given as `children` in an example is wrapped in the system
        Text by its story on every platform (`<ds-text>` on Lit, where slotted content
        cannot be an arg): one meta-level render wraps only string children in a Text
        at its defaults, so each example story keeps exactly its `given` as args.
        The Default story uses the `highlighted-panel` props, since a Box at its schema
        defaults draws nothing; meta args may still list the schema defaults (`border:
        false`, `element: div`) as controls. Behavior scenarios render the Default
        story''s args with their `given` on top, which is intended: they assert only
        renders and roles.'
    inset:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      default: none
      description: Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline`
        when the axes differ.
    insetBlock:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      description: 'Vertical padding, overriding `inset` on that axis. It has no default:
        unset means `inset` applies, which keeps an explicit `none` distinct from
        an absent value.'
    insetInline:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      description: Horizontal padding, overriding `inset` on that axis. Unset means
        `inset` applies, as with insetBlock.
    surface:
      type: enum
      values:
      - none
      - default
      - subtle
      - strong
      default: none
      description: Background. `none` is transparent; `default` is the page background
        (use to lift content off a subtle parent); `subtle` and `strong` step up.
    border:
      type: boolean
      default: false
      description: A thin default border.
    radius:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - full
      default: none
      description: Corner radius from the theme's presets.
    element:
      type: enum
      values:
      - div
      - section
      - article
      - aside
      - header
      - footer
      - main
      - nav
      default: div
      description: Element to render. Sectioning elements only when the box is a semantic
        region; prefer Landmark for page regions. There is no native counterpart,
        so a screen that ports to React Native uses Landmark for the region instead
        of this prop.
      platforms:
      - web
      - lit
  styles:
    paddingBlock:
      token: layout.inset.{inset}
      description: 'An override applies at every value including `none`: `layout.inset.none`
        is a real token (a zero), not an absent part, so padding is not one of the
        bindings presence gates.'
      locked: false
    paddingInline:
      token: layout.inset.{inset}
      locked: false
    background:
      token: color.background.{surface}
      description: '`none` renders the literal transparent, not a token, written out
        explicitly (`background-color: transparent`) and not read through the hook,
        so neither `overrides.background` nor consumer CSS on `--ds-box-background`
        paints a `none` box; the token binding covers the other three values, and
        the `--ds-box-background` hook is set only by those three, with no base default.
        Interpolated bindings like this one are locked — they keep their `--ds-box-*`
        hook, which is the consumer''s own-CSS escape hatch, but they are not members
        of the overrides type.'
      locked: true
    border:
      token: color.border
      description: 'The border colour. It shares a name with the `border` boolean,
        which decides presence: an override recolours the border and never brings
        one into existence. On web and Lit, without `border` the width is `0` and
        the colour hook may stay written, since nothing visible reads it; on React
        Native, which has no cascade, `borderWidth` and `borderColor` are left unset
        when `border` is false.'
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.{radius}
      description: '`radius: none` resolves `radius.none` and is written out, rather
        than leaving the property unset — every binding is applied explicitly, with
        no cascade. Unlike padding, radius is presence-gated: `none` means no rounded
        corners, so `overrides.radius` is ignored at `none` and applies at every other
        value. As with `surface: none`, the `none` rule writes `radius.none` directly
        and reads no hook, so consumer CSS on `--ds-box-radius` cannot round a `none`
        box either.'
      locked: false
  a11y:
    role: none
    requires:
    - contrast-aa
    contrast:
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground
      background: color.background.strong
      level: AA
    - foreground: color.foreground.muted
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.background.strong
      level: AA
    - foreground: color.link
      background: color.background.subtle
      level: AA
    - foreground: color.link
      background: color.background.strong
      level: AA
  platforms:
    web:
      element: div
      attributes: []
      notes: 'A plain element with classes for each enum value; `surface: none` paints
        `transparent` and reads no hook. insetBlock/insetInline modifiers win over
        inset. No margin, ever. The root is the `surface` part and carries `data-part="surface"`,
        written before `...rest` so a composing parent can relabel it (Popover and
        BottomSheet pass `data-part="body"`). Box is the one primitive that merges
        a consumer `className` and `style` onto the root instead of dropping them,
        as Text does, because those same composites give it a layout-only class. That
        class may set Box''s `--ds-box-*` hooks (Dialog sets the padding hooks this
        way): it is consumer CSS, and it outranks the modifier classes by specificity.
        Props are typed against `div` for every `element` value; Box is not polymorphic,
        and the ref is `Ref<HTMLElement>`.'
    lit:
      tag: ds-box
      reflect:
      - inset
      - inset-block
      - inset-inline
      - surface
      - border
      - radius
      notes: 'The host is the box (`:host { display: block }`) with a default slot,
        so children stay in the light DOM. The host is also the `surface` part: it
        carries `data-part="surface"` alongside `data-ds`, and there is no `::part`,
        since `:host` cannot take one. `element` swaps nothing in the shadow root
        — the host is the element, so `element` is accepted for API parity (set by
        attribute or property, not reflected) and sets a plain `role` attribute on
        the host — not ElementInternals, which the accessible-role tests cannot read
        — only where the implicit role does not depend on ancestry: article, aside
        → complementary, main, nav → navigation. `div`, `section`, `header` and `footer`
        set no role, because a native `<header>` or `<footer>` is only a banner or
        contentinfo outside sectioning content and the element cannot see where it
        sits; a page-level banner is Landmark.'
    rn:
      element: View
      props: []
      notes: 'View with paddingVertical/paddingHorizontal, backgroundColor, borderWidth/borderColor,
        borderRadius from the token object. `element` does not apply — use Landmark
        for a region. The root view is both the component and its only part, so it
        carries `testID="Box"` and there is no `Box.surface`: when a component''s
        single anatomy part is the root, the root form wins. A string given as `children`
        in an example is illustrative; native requires it inside a Text. Resolved
        overrides are cast to the binding''s own type: number for padding, width and
        radius, string for the border colour.'
    swiftui:
      element: VStack
      props:
      - .padding
      - .background
      - .overlay=border
      - .clipShape
      - .frame=maxWidth
      - .accessibilityElement=contain
      notes: 'A layout container: `padding` from the inset token on all edges, `.background(RoundedRectangle)`
        in the surface color (nothing for `none`), a stroked overlay for `border`,
        `.clipShape` for radius. Children are laid out by the caller''s stack; Box
        itself is a single-child wrapper (`VStack(spacing: 0)`) and never spaces siblings.
        No accessibility semantics unless the doc says the role is a landmark (then
        see Landmark).'
  behavior:
  - name: nav-element-carries-navigation-semantics
    description: When element is article, aside, main or nav, the element carries
      that semantics on web and the host role carries it on Lit; Box adds no role
      of its own otherwise.
    given:
      element: nav
    then:
    - role: navigation
      platforms:
      - web
      - lit
  - name: article-element-carries-article-semantics
    description: The same rule for the other sectioning values - the element is the
      semantics, and Box adds nothing else.
    given:
      element: article
    then:
    - role: article
      platforms:
      - web
      - lit
  examples:
  - name: highlighted-panel
    description: A panel lifted off the page with a tinted surface, rounded corners
      and the usual inset.
    given:
      children: A panel of settings
      inset: md
      surface: subtle
      radius: md
  - name: bordered-row
    description: A dense row bounded by a thin border rather than a fill.
    given:
      children: A row of data
      inset: sm
      border: true
  - name: hero-band
    description: A full-width band with more vertical than horizontal padding, on
      the strongest surface.
    given:
      children: A hero band
      insetBlock: xl
      insetInline: lg
      surface: strong
  - name: navigation-region
    description: A padded region whose element makes it a navigation landmark on web.
    given:
      children: The sidebar links
      element: nav
      inset: md
    platforms:
    - web
    - lit
```

## Constants and examples

- example `highlighted-panel`, story `HighlightedPanel`: given `children: "A panel of settings"`, `inset: "md"`, `surface: "subtle"`, `radius: "md"`; A panel lifted off the page with a tinted surface, rounded corners and the usual inset.
- example `bordered-row`, story `BorderedRow`: given `children: "A row of data"`, `inset: "sm"`, `border: true`; A dense row bounded by a thin border rather than a fill.
- example `hero-band`, story `HeroBand`: given `children: "A hero band"`, `insetBlock: "xl"`, `insetInline: "lg"`, `surface: "strong"`; A full-width band with more vertical than horizontal padding, on the strongest surface.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `paddingBlock`, `paddingInline`, `border`, `borderWidth`, `radius`
Locked (accessibility-bearing, never overridable): `background`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .padding
- .background
- .overlay=border
- .clipShape
- .frame=maxWidth
- .accessibilityElement=contain
notes: 'A layout container: `padding` from the inset token on all edges, `.background(RoundedRectangle)`
  in the surface color (nothing for `none`), a stroked overlay for `border`, `.clipShape`
  for radius. Children are laid out by the caller''s stack; Box itself is a single-child
  wrapper (`VStack(spacing: 0)`) and never spaces siblings. No accessibility semantics
  unless the doc says the role is a landmark (then see Landmark).'
```

## Guidance

## Overview

Box is the thing you reach for when a group of content needs a surface: padding around it, a background under it, a border, rounded corners. It has no opinions about what is inside and no spacing between its children — that is Stack's job — so the two compose without overlap: a Box for the inset, a Stack for the gaps.

## When to use

Use a Box to give a region of a layout a background or padding: a sidebar panel, a highlighted row, a footer band, the inside of a modal. Use it when a Card is too much (a Card is a Box with conventions about elevation and content). Choose `inset` by role — `sm` for dense rows, `md` for most panels, `lg` for page-level containers, `xl` for hero bands — and let the theme's rhythm decide the numbers.

## When not to use

Do not use a Box to add space between two components; put them in a Stack. Do not use it as a page container; Container owns gutters and measure. Do not nest surfaces more than two deep (`subtle` on `default`, `strong` on `subtle`) — a third level reads as clutter and the contrast math is only checked two deep. Do not use `surface` to signal status; that is Alert's tinted background.

## Behavior

Box renders its children in a block with the requested padding, background, border and radius, and nothing else. It adds no role of its own (`a11y.role: none`); on web the native element carries whatever semantics it has, which for `section`, `header` and `footer` depends on naming and ancestry as it does in plain HTML, and Lit sets a plain `role` attribute on the host only for the values whose role is unconditional (see the platform note). It never scrolls, never clips (`radius` does not imply `overflow: hidden`; a child that should be clipped clips itself), and never carries margin. `insetBlock` and `insetInline` override `inset` per axis. `surface: none` paints transparent, so the parent's background shows through.

## Content guidelines

None; Box has no text of its own.

## Accessibility

Box is invisible to assistive technology unless `element` gives it a sectioning role, in which case Landmark is usually the right component instead. Text on a `subtle` or `strong` surface must remain readable: the build checks body, muted and link foreground against both surfaces in both modes (WCAG 1.4.3), which is what makes "two levels deep" a safe rule rather than a hope. Box itself sets no foreground and establishes no colour context for its children, so these pairs are a guarantee about the tokens, not something the component implements or can enforce at runtime. A border, when present, is decorative; nothing relies on it to identify content (1.4.11 does not apply).

## Platform notes

### Web
Render the `element` with classes `ds-box`, `ds-box--inset-{value}`, `ds-box--inset-block-{value}`, `ds-box--inset-inline-{value}`, `ds-box--surface-{value}`, `ds-box--border`, `ds-box--radius-{value}`. Padding uses logical properties (`padding-block`, `padding-inline`). Axis modifiers are declared after the all-sides modifier so they win.

### Lit
`<ds-box inset="md" surface="subtle" radius="md">`. The host is the box; `:host` carries the padding, background, border and radius from reflected attributes (`:host([inset="md"])`). Children are slotted. `element` maps to a plain `role` attribute on the host for the values whose role is unconditional and is otherwise inert.

### React Native
`View` with `paddingVertical`/`paddingHorizontal` from `layout.inset.*`, `backgroundColor` from `color.background.*` (`'transparent'` for `none`, written out), `borderWidth`/`borderColor` only when `border`, `borderRadius` from `radius.*`. No `element`.

## Related

Stack, Card, Container, Landmark.

## Behavior scenarios (25)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-inset-none
  given:
    inset: none
  then:
  - renders: true
  derived: true
- name: renders-inset-sm
  given:
    inset: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-md
  given:
    inset: md
  then:
  - renders: true
  derived: true
- name: renders-inset-lg
  given:
    inset: lg
  then:
  - renders: true
  derived: true
- name: renders-inset-xl
  given:
    inset: xl
  then:
  - renders: true
  derived: true
- name: renders-inset-block-none
  given:
    insetBlock: none
  then:
  - renders: true
  derived: true
- name: renders-inset-block-sm
  given:
    insetBlock: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-block-md
  given:
    insetBlock: md
  then:
  - renders: true
  derived: true
- name: renders-inset-block-lg
  given:
    insetBlock: lg
  then:
  - renders: true
  derived: true
- name: renders-inset-block-xl
  given:
    insetBlock: xl
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-none
  given:
    insetInline: none
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-sm
  given:
    insetInline: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-md
  given:
    insetInline: md
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-lg
  given:
    insetInline: lg
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-xl
  given:
    insetInline: xl
  then:
  - renders: true
  derived: true
- name: renders-surface-none
  given:
    surface: none
  then:
  - renders: true
  derived: true
- name: renders-surface-default
  given:
    surface: default
  then:
  - renders: true
  derived: true
- name: renders-surface-subtle
  given:
    surface: subtle
  then:
  - renders: true
  derived: true
- name: renders-surface-strong
  given:
    surface: strong
  then:
  - renders: true
  derived: true
- name: renders-radius-none
  given:
    radius: none
  then:
  - renders: true
  derived: true
- name: renders-radius-sm
  given:
    radius: sm
  then:
  - renders: true
  derived: true
- name: renders-radius-md
  given:
    radius: md
  then:
  - renders: true
  derived: true
- name: renders-radius-lg
  given:
    radius: lg
  then:
  - renders: true
  derived: true
- name: renders-radius-full
  given:
    radius: full
  then:
  - renders: true
  derived: true
```
