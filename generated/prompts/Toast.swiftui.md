# Generate: Toast for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Toast.swift` declaring `public struct Toast: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/ToastBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Toast.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Toast") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Toast")` on the root and `"Toast.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Toast
  category: feedback
  status: review
  apg: alert
  anatomy:
  - region
  - toast
  - icon
  - message
  - actionButton
  - dismissButton
  composition:
    icon: Icon
    message: Text
    actionButton: Button
    dismissButton: Button
  props:
    message:
      type: string
      required: true
      description: One sentence saying what happened ("Message sent", "3 files deleted").
    tone:
      type: enum
      values:
      - neutral
      - success
      - warning
      - danger
      default: neutral
      description: Sets the leading icon; `neutral` has none. Toasts do not use tinted
        backgrounds — the icon and message carry the tone.
    actionLabel:
      type: string
      description: Label for a single action button ("Undo", "View"). When present
        the toast stays longer and pauses on hover and focus.
    duration:
      type: enum
      values:
      - short
      - long
      - persistent
      default: short
      description: '`short` ≈ 5s, `long` ≈ 10s (both computed from motion.duration.loop
        × 6 / × 12 so themes without motion still get sensible times), `persistent`
        until dismissed. When `action` is set or `tone` is danger the toast is persistent
        regardless of this prop (a dev warning notes the override). The two durations
        are computed at region mount from the resolved motion.duration.loop (getComputedStyle
        on the region on web/Lit; the token value on native), never hardcoded.'
    dismissible:
      type: boolean
      default: true
      description: Shows a dismiss button. Persistent toasts are always dismissible.
    toastId:
      type: string
      description: Stable identity; showing a toast with the same toastId replaces
        the previous one instead of stacking (named toastId so it does not collide
        with the DOM `id` on Lit).
  events:
    onAction:
      description: The action button was activated. The toast dismisses.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
    onDismiss:
      description: 'The toast left the screen: reason `timeout`, `dismiss-button`,
        `escape`, `action`, or `replaced` (a replaced or evicted toast leaves immediately,
        without its exit transition).'
      platforms:
        web: onDismiss
        lit: dismiss
        rn: onDismiss
        swiftui: onDismiss
  keyboard:
  - keys:
    - F6
    action: Moves focus into the toast region (the first toast's action or dismiss
      button) from anywhere; F6 again returns to where focus was.
    when: a toast is visible
    from: any
    expect: focus-first
  - keys:
    - Escape
    action: Dismisses the focused toast and returns focus.
    when: focus inside a toast
    from: first
    expect: closes
  - keys:
    - Tab
    action: Moves between the action and dismiss buttons, then out of the region.
    when: focus inside a toast
    from: first
    expect: focus-next
  styles:
    surface:
      token: color.inverse.surface
      description: 'Inverted like Tooltip: dark on light, light on dark, so it floats
        above any page surface.'
      locked: true
    text:
      token: color.inverse.foreground
      locked: true
    icon:
      token: color.inverse.status.{tone}
      description: '`neutral` renders no icon; the other tones use the status step
        chosen to read on the inverse surface.'
      locked: true
    actionColor:
      token: color.inverse.link
      description: The action and dismiss Buttons are rendered with Button's `inverse`
        prop (ghost variant), which is how a composite gets an on-inverse child without
        restyling it.
      locked: true
    dismissColor:
      token: color.inverse.link
      description: The dismiss and action Buttons are `ghost` + `inverse`, whose text
        is color.inverse.link; Toast never restyles them.
      locked: true
    focusRingInverse:
      token: color.inverse.focus
      description: Focus ring color on the inverse surface, replacing color.border.focus
        inside the toast.
      locked: true
    radius:
      token: radius.md
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    paddingBlock:
      token: space.sm
      locked: false
    paddingInline:
      token: space.md
      locked: false
    gap:
      token: layout.gap.normal
      description: Between icon, message, action and dismiss.
      locked: false
    stackGap:
      token: layout.gap.tight
      description: Between stacked toasts in the region. stackGap, regionInset and
        layer belong to the region (ToastRegion / ToastProvider) and are overridable
        on it, not on a toast.
      locked: false
    regionInset:
      token: layout.gutter
      description: Distance of the region from the viewport edge (bottom-start on
        wide screens, bottom center on phones, above the safe area).
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    layer:
      token: layer.toast
      locked: false
    enter:
      token: motion.duration.base
      description: Rise and fade; instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      locked: false
  copy:
    dismissLabel: Dismiss
    regionLabel: Notifications
  a11y:
    role: status
    requires:
    - live-region
    - accessible-name
    - escape-dismiss
    - focus-visible
    - keyboard-operable
    - contrast-aa
    - reduced-motion
    - target-24px
    - no-hover-only
    contrast:
    - foreground: color.inverse.foreground
      background: color.inverse.surface
      level: AA
    - foreground: color.inverse.link
      background: color.inverse.surface
      level: AA
    - foreground: color.inverse.focus
      background: color.inverse.surface
      level: AA
      large: true
    - foreground: color.inverse.status.{tone}
      background: color.inverse.surface
      level: AA
      large: true
  platforms:
    web:
      element: div
      attributes:
      - role=region
      - aria-label
      - role=status
      - role=alert
      - aria-live
      notes: 'One persistent <div role="region" aria-label="Notifications" aria-live="polite">
        per document (created on first use, fixed at the region inset, layer.toast)
        holds the toasts; the region exists before content so announcements fire.
        Each toast is a <div role="status"> (danger: role="alert"). Timers pause on
        hover and on focus-within. F6 handler at document level moves focus into the
        region. Toasts are shown through an imperative API (`toast({ message })`)
        exposed alongside the component, since a notification is an event, not a place
        in the tree.'
    lit:
      tag: ds-toast
      reflect:
      - tone
      - duration
      notes: A <ds-toast-region> element (auto-created in document.body by the `toast()`
        function) holds <ds-toast> children in the light DOM so the live region is
        in the document tree. The region sets role/aria-live via ElementInternals.
        `dismiss` and `action` are composed CustomEvents.
    rn:
      element: View
      props:
      - accessibilityLiveRegion
      - accessibilityRole
      notes: 'A ToastProvider mounted once at the app root renders the region as an
        absolutely positioned View (layer.toast zIndex, above the bottom safe-area
        inset, centered). Android: accessibilityLiveRegion="polite" (danger: "assertive");
        iOS: AccessibilityInfo.announceForAccessibility on show. Timers pause while
        a toast is being touched. No F6; toasts are reached by swiping through the
        accessibility order. Android''s native ToastAndroid is not used, so actions
        and theming work. React Native has no `status` role: danger toasts use accessibilityRole="alert",
        others no role, with accessibilityLiveRegion (assertive/polite) and a one-time
        AccessibilityInfo announcement. Timers pause while a toast is touched; F6
        and Escape have no native equivalent.'
    swiftui:
      element: VStack
      props:
      - Portal
      - .zIndex
      - AccessibilityNotification
      - Button
      - withAnimation
      - .accessibilityElement=combine
      notes: 'Rendered through `Support/Portal` into the app''s top-level `ZStack`
        at `layer.toast` (the app installs `.dsPortalHost()` once at its root). Each
        toast is one combined element labelled by its text with the tone word; `role:
        status` posts a polite `Announcement`, `alert` an announcement with `.assertive`
        priority. Auto-dismiss pauses while VoiceOver focus is on the toast; the action
        `Button` and dismiss `Button` are inside the element as custom actions (`.accessibilityAction(named:)`)
        as well as visible controls. Enter/exit use the motion tokens; none under
        reduced motion.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `radius`, `shadow`, `paddingBlock`, `paddingInline`, `gap`, `stackGap`, `regionInset`, `maxWidth`, `fontFamily`, `fontSize`, `lineHeight`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `text`, `icon`, `actionColor`, `dismissColor`, `focusRingInverse`, `minTarget`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- Portal
- .zIndex
- AccessibilityNotification
- Button
- withAnimation
- .accessibilityElement=combine
notes: 'Rendered through `Support/Portal` into the app''s top-level `ZStack` at `layer.toast`
  (the app installs `.dsPortalHost()` once at its root). Each toast is one combined
  element labelled by its text with the tone word; `role: status` posts a polite `Announcement`,
  `alert` an announcement with `.assertive` priority. Auto-dismiss pauses while VoiceOver
  focus is on the toast; the action `Button` and dismiss `Button` are inside the element
  as custom actions (`.accessibilityAction(named:)`) as well as visible controls.
  Enter/exit use the motion tokens; none under reduced motion.'
```

## Guidance

## Overview

A toast says "done" and gets out of the way. It confirms an action just taken, offers one chance to undo it, and leaves without being asked. It is the reason most confirmations do not need an AlertDialog: if the action is reversible, do it and toast an Undo.

## When to use

Use a Toast to confirm a completed action that the user did not have to watch (sent, saved, deleted, copied), to offer Undo for a reversible action, or to report a background result ("Export ready" with a "View" action). Match `tone` to the outcome; use `persistent` whenever there is an action, and for `danger`, so nobody misses the one they needed.

## When not to use

Do not toast errors that need fixing (an Alert next to the problem), information the user must read (Alert or Dialog), or anything requiring more than one action. Do not toast on page load. Do not stack more than three; the region replaces the oldest. Do not use a toast to confirm every trivial change — a switch flipping does not need "Setting saved".

## Behavior

Toasts are shown through an imperative call, since a notification is an event: `toast({ message, tone, actionLabel, onAction })`, which returns a promise resolving to `{ reason }` when the toast leaves. Each appears in the notification region, is announced politely (assertively for `danger`), and dismisses after `duration`, when its action is used, when dismissed, or when a toast with the same `id` replaces it. Timers pause while the toast is hovered, focused or touched, and while the page is hidden. Focus never moves to a toast on its own; F6 brings it there when the user wants it, and Escape or the dismiss button sends it back. Up to three toasts stack, newest at the bottom on wide screens.

## Content guidelines

Messages are one short sentence in the past tense saying what happened, without exclamation ("Message sent", "Link copied", "3 files moved to Archive"). The action is one word when possible ("Undo", "View", "Retry"). No titles, no icons other than the tone's, no links in the message.

## Accessibility

The region is a landmark-like container with an accessible name and `aria-live="polite"` that exists before any toast, so each toast is announced as a status message without moving focus (WCAG 4.1.3, 3.2.1); `danger` toasts use `alert`. Anything with a time limit must be pausable or long enough (2.2.1): timers pause on hover, focus and touch, action toasts are persistent, and durations are never under five seconds. Keyboard users reach toasts with F6 and leave with Escape or Tab (2.1.1), so an Undo is never pointer-only. Text, action and icon meet contrast on the inverted surface in both modes; the build checks them. Motion respects reduced-motion.

## Platform notes

### Web
Export `toast(options)` and a `<ToastRegion>` that the app mounts once (or is auto-mounted on first call). Region: `<div role="region" aria-label={copy.regionLabel} aria-live="polite">` fixed at `inset-block-end: var(--layout-gutter)`, `inset-inline-start` on wide screens and centered below the content measure, `z-index: var(--layer-toast)`. Toast: `<div role={tone === 'danger' ? 'alert' : 'status'}>` with `<Icon name={tone}>`, the message, `<Button variant="ghost" size="sm">` for the action styled through the ghost variant on the inverted surface, and the dismiss Button (`iconOnly`, `copy.dismissLabel`). Pause timers on `pointerenter`, `focusin` and `visibilitychange`. Document-level `keydown` for F6 toggles focus between the region and the previously focused element.

### Lit
`toast()` creates `<ds-toast-region>` in `document.body` if absent and appends `<ds-toast>` elements as light-DOM children; the region sets `role="region"`, `aria-label` and `aria-live` through `ElementInternals`. Composed `action` and `dismiss` events bubble to the region for the imperative API's promise.

### React Native
`ToastProvider` at the root renders the region `View` with `zIndex: layerToast`, `position: 'absolute'`, `bottom: safeAreaBottom + layoutGutter`, and exposes `useToast()` / `toast()`. Each toast `View` has `accessibilityLiveRegion` (Android) and triggers `announceForAccessibility` (iOS) on mount; `Pressable` wrappers pause timers while pressed. The action is the system `Button` (`ghost`, `sm`), the dismiss is `Button iconOnly` with `Icon name="close"`.

## Related

Alert, AlertDialog, Button, Icon.

## Behavior scenarios (9)

One test per scenario, in this order.

```yaml
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
- name: renders-tone-warning
  given:
    tone: warning
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: renders-duration-short
  given:
    duration: short
  then:
  - renders: true
  derived: true
- name: renders-duration-long
  given:
    duration: long
  then:
  - renders: true
  derived: true
- name: renders-duration-persistent
  given:
    duration: persistent
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
