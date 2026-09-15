# Generate: Tooltip for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Tooltip.swift` declaring `public struct Tooltip: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/TooltipBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Tooltip.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Tooltip") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Tooltip")` on the root and `"Tooltip.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Tooltip
  category: overlay
  status: review
  apg: tooltip
  anatomy:
  - trigger
  - popup
  - text
  composition:
    text: Text
  props:
    content:
      type: string
      required: true
      description: The tooltip text. One short phrase or sentence; no markup, no links,
        no line breaks.
    children:
      type: content
      required: true
      description: Exactly one focusable element (a Button, Link, Input). The tooltip
        attaches to it; a non-focusable child is an error, because keyboard users
        could never see the tooltip.
      a11y: The child must be focusable so hover and focus are equivalent (WCAG 1.4.13,
        2.1.1).
    placement:
      type: enum
      values:
      - top
      - bottom
      - start
      - end
      default: top
      description: Preferred side; flips when it would overflow the viewport (on native,
        measured with measureInWindow like Popover). `start`/`end` are logical and
        mirror in right-to-left writing.
    describes:
      type: boolean
      default: true
      description: '`true`: the tooltip is supplementary and becomes the child''s
        accessible description (aria-describedby). `false`: the tooltip IS the child''s
        name (an icon-only button whose label equals the tooltip) and is linked as
        aria-labelledby instead — set this when the child has no visible text and
        its `label` equals `content`, to avoid announcing it twice.'
    open:
      type: boolean
      description: 'Controlled visibility, for stories and tests only (the Keyboard
        story renders the tooltip open with it). Product code never sets it: a tooltip
        is hover and focus driven.'
    delay:
      type: enum
      values:
      - default
      - none
      default: default
      description: 'Hover delay before showing: `default` uses `motion.duration.base`
        × 3 (roughly 600ms, so casual mouse movement does not flash tooltips); `none`
        for toolbars where a sibling tooltip is already open (a shared "warm" state
        so moving along a toolbar shows tooltips instantly: after a tooltip hides,
        siblings show with no delay for one motion.duration.loop; the pointer may
        cross to the tooltip within one motion.duration.fast before it hides).'
  keyboard:
  - keys:
    - Escape
    action: Hides the tooltip without moving focus.
    when: tooltip visible
    from: trigger
    expect: closes
  styles:
    surface:
      token: color.inverse.surface
      description: 'Inverted: the tooltip is dark on light mode and light on dark
        mode, so it reads as a label, not a panel.'
      locked: true
    text:
      token: color.inverse.foreground
      locked: true
    radius:
      token: radius.sm
      locked: false
    paddingBlock:
      token: space.1
      locked: false
    paddingInline:
      token: space.2
      locked: false
    offset:
      token: space.1
      description: Gap between trigger and tooltip.
      locked: false
    maxWidth:
      token: space.20
      description: Multiplied by 3 (240px at comfortable density) — the generator
        computes it; longer text wraps.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.sm
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    shadow:
      token: shadow.raised
      locked: false
    layer:
      token: layer.toast
      description: Tooltips sit above everything, including dialogs, because they
        describe controls inside them.
      locked: false
    enter:
      token: motion.duration.fast
      description: Fade in; instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      locked: false
  a11y:
    role: tooltip
    requires:
    - escape-dismiss
    - keyboard-operable
    - contrast-aa
    - reduced-motion
    - no-hover-only
    contrast:
    - foreground: color.inverse.foreground
      background: color.inverse.surface
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=tooltip
      - id
      - aria-describedby
      - aria-labelledby
      notes: 'The child is cloned with aria-describedby (or aria-labelledby) pointing
        at the tooltip id and with mouseenter/mouseleave/focus/blur handlers merged.
        The tooltip <div role="tooltip"> is rendered through a portal, position: fixed
        from the trigger rect, flipped on overflow, on layer.toast. It stays open
        while the pointer is over the tooltip itself (1.4.13 hoverable) and hides
        on Escape (dismissable) or when the trigger loses hover and focus. Never shown
        on touch (no hover); the description is still in the accessibility tree. The
        description is always in the accessibility tree: `content` is rendered in
        a visually-hidden element that aria-describedby points at, and the visible
        popup is a second copy — so the Popover API''s display:none while closed does
        not remove the description.'
    lit:
      tag: ds-tooltip
      reflect:
      - placement
      - describes
      notes: Wraps the slotted trigger; because aria-describedby cannot cross the
        shadow boundary, the tooltip element is rendered in the light DOM as a sibling
        of the trigger (appended to the host, not the shadow root) so the ID reference
        resolves. Positioning via the Popover API (popover="manual") with a fixed
        fallback. As on web, aria-describedby targets a visually-hidden copy of the
        content that is always present; the popover is the visible copy.
    rn:
      element: View
      props:
      - accessibilityHint
      - accessibilityLabel
      notes: 'There is no hover on touch, so no tooltip surface is shown by default:
        `content` becomes the child''s accessibilityHint (or accessibilityLabel when
        describes=false). On long-press the text is shown in a small transient View
        above the child for the duration of the press, as a sighted-user aid. On react-native-web,
        hover and focus behave as on web. This is the acknowledged platform difference;
        the information is never hover-only anywhere. The child must accept `accessibilityHint`/`accessibilityLabel`
        and the `onHoverIn`/`onHoverOut`/`onFocus`/`onBlur`/`onLongPress` handlers
        Tooltip clones onto it; the system Button, Link and Input forward these to
        their native element. Placement flips using measureInWindow.'
    swiftui:
      element: Group
      props:
      - .accessibilityHint
      - .onLongPressGesture
      - .popover
      - .onHover
      - .accessibilityHidden
      notes: There is no tooltip on iOS. The `content` is forwarded to the trigger
        as `.accessibilityHint` (VoiceOver reads it after the label), and the bubble
        itself shows on long-press (touch) and pointer hover (iPad) as a `.popover`
        with `.presentationCompactAdaptation(.popover)` so it never becomes a sheet,
        positioned by `placement`, dismissed on release/leave or Escape. The bubble
        is `.accessibilityHidden(true)` — the hint already carries the text. Delays
        from the timing tokens; none under reduced motion.
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `radius`, `paddingBlock`, `paddingInline`, `offset`, `maxWidth`, `fontFamily`, `fontSize`, `lineHeight`, `shadow`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `text`

## Platform notes (swiftui)

```yaml
element: Group
props:
- .accessibilityHint
- .onLongPressGesture
- .popover
- .onHover
- .accessibilityHidden
notes: "There is no tooltip on iOS. The `content` is forwarded to the trigger as `.accessibilityHint`\
  \ (VoiceOver reads it after the label), and the bubble itself shows on long-press\
  \ (touch) and pointer hover (iPad) as a `.popover` with `.presentationCompactAdaptation(.popover)`\
  \ so it never becomes a sheet, positioned by `placement`, dismissed on release/leave\
  \ or Escape. The bubble is `.accessibilityHidden(true)` \u2014 the hint already\
  \ carries the text. Delays from the timing tokens; none under reduced motion."
```

## Guidance

## Overview

A tooltip is the smallest overlay: a label that appears when you point at or focus a control and disappears when you leave. It exists to name icon-only buttons and to add a hint to a control whose label cannot carry everything. It must never be the only home of information a user needs, because a touchscreen user will never see it.

## When to use

Use a Tooltip on an icon-only Button to show its name on hover and focus (with `describes: false` so it is the accessible name, not a second announcement), or on a labelled control to add a short clarification ("Includes archived items"). Use it in toolbars, table headers and dense UI where visible labels do not fit. Keep it to a phrase.

## When not to use

Do not put essential instructions, error messages or any content the user must read in a tooltip; use helper text (Input `description`), an Alert, or a Disclosure. Do not put links or buttons in it — a tooltip is not interactive, and an interactive overlay is a Popover (planned). Do not attach it to a non-focusable element (an icon, a span): keyboard users could never open it. Do not use it on touch-first screens to explain controls; on native the text becomes a hint and is not visible.

## Behavior

The tooltip shows after `delay` when the pointer rests on the trigger, or immediately when the trigger receives focus of any kind (keyboard-origin focus cannot be told apart reliably across composed triggers, and a focused control showing its tooltip is never wrong), positioned at `placement` (flipped at the viewport edge). It hides when the pointer leaves both trigger and tooltip, when focus leaves the trigger, or on Escape — which hides it without moving focus, so a user can dismiss a tooltip that covers something. Moving the pointer from one warm toolbar item to the next shows the next tooltip with no delay. The tooltip never takes focus and never blocks pointer events on anything but itself.

## Content guidelines

Tooltip text is a short phrase in sentence case with no trailing period: the control's name ("Bold"), or a clarification ("Includes archived items"). No shortcut hints inside the text; use the Menu's `shortcut` field or `aria-keyshortcuts` on the control. Never repeat the visible label verbatim; if there is nothing to add, there is no tooltip.

## Accessibility

Content that appears on hover or focus must be dismissable without moving the pointer, hoverable, and persistent until dismissed (WCAG 1.4.13): Escape hides it, the pointer can move onto it, and it stays while hovered or focused. It is linked to the trigger with `aria-describedby`, or `aria-labelledby` when it is the name (4.1.2; APG tooltip), so screen-reader users get the text without hovering. Focus shows it, so it is never hover-only (2.1.1). The inverted surface meets 4.5:1 in both modes. It never receives focus and contains nothing interactive.

## Platform notes

### Web
Clone the single child with `aria-describedby={id}` (or `aria-labelledby`) and merged `onPointerEnter`, `onPointerLeave`, `onFocus`, `onBlur` handlers. Render `<div role="tooltip" id={id}>` through a portal, `position: fixed`, positioned from the trigger rect with `offset`, flipped when overflowing, `z-index: var(--layer-toast)`, `max-inline-size` from the computed maxWidth. A module-level "warm until" timestamp implements the toolbar behavior. `pointer: coarse` media query disables showing on hover (the description remains).

### Lit
`<ds-tooltip content="Bold"><ds-button icon-only label="Bold">…</ds-button></ds-tooltip>`. On `slotchange`, take the single assigned element as the trigger, set `aria-describedby` on it, and append the tooltip element to the host in the light DOM so the ID resolves across the boundary; position with the Popover API when available.

### React Native
Render the child with `accessibilityHint={content}` (or `accessibilityLabel` when `describes` is false). On `onLongPress`, show a transient `View` with the inverted surface above the child until `onPressOut`. On react-native-web, attach hover/focus handlers as on web.

## Related

Button, Icon, Menu, Popover (planned).

## Behavior scenarios (7)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-placement-top
  given:
    placement: top
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom
  given:
    placement: bottom
  then:
  - renders: true
  derived: true
- name: renders-placement-start
  given:
    placement: start
  then:
  - renders: true
  derived: true
- name: renders-placement-end
  given:
    placement: end
  then:
  - renders: true
  derived: true
- name: renders-delay-default
  given:
    delay: default
  then:
  - renders: true
  derived: true
- name: renders-delay-none
  given:
    delay: none
  then:
  - renders: true
  derived: true
```
