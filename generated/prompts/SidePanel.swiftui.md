# Generate: SidePanel for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/SidePanel.swift` declaring `public struct SidePanel: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/SidePanelBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+SidePanel.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("SidePanel") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("SidePanel")` on the root and `"SidePanel.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: SidePanel
  category: overlay
  status: review
  apg: disclosure
  anatomy:
  - trigger
  - scrim
  - surface
  - focusScope
  - header
  - heading
  - body
  - footer
  - closeButton
  composition:
    focusScope: FocusScope
    heading: Heading
    closeButton: Button
    body: Box
    footer: Stack
  props:
    trigger:
      type: content
      description: 'The Button that shows and hides the panel (usually `iconOnly`
        with the `menu` Icon and a label like "Menu"). It is the APG disclosure button:
        the panel sets aria-expanded and aria-controls on it, and it stays a toggle
        — pressing it again closes. Omit to control `open` from elsewhere (a Toolbar).'
    open:
      type: boolean
      description: Controlled visibility. Omit for uncontrolled (the trigger toggles
        it).
    heading:
      type: string
      required: true
      description: The panel's title and accessible name ("Menu", "Filters", "Your
        cart"). May be visually hidden with `hideHeading`.
    hideHeading:
      type: boolean
      default: false
      description: Keep the title for assistive technology but do not render it (a
        navigation panel whose List is self-explanatory).
      a11y: The accessible name is required regardless.
    children:
      type: content
      required: true
      description: 'The body: a List or Tree of Links for navigation, a Form of filters,
        a Stack of Cards. Scrolls inside the panel when taller than the viewport.'
    footer:
      type: content
      description: Pinned to the bottom of the panel above the safe area (a sign-out
        Button, a "Apply filters" action row).
    side:
      type: enum
      values:
      - start
      - end
      default: start
      description: 'The edge the panel slides from: `start` is left in left-to-right
        languages and right in right-to-left; `end` the opposite. Navigation comes
        from the start; contextual panels (a cart, a detail) from the end.'
    width:
      type: enum
      values:
      - narrow
      - default
      - wide
      default: default
      description: 'Panel width on wide screens: narrow for a list of links, wide
        for a form or a detail. On phones the panel is the viewport width minus a
        gutter that keeps the scrim visible.'
    persistent:
      type: enum
      values:
      - never
      - content
      - page
      default: never
      description: 'Above this layout width the panel stops being an overlay and becomes
        a fixed sidebar beside the content: always visible, no scrim, no trap, part
        of the page''s tab order, and the trigger is hidden. `content` switches at
        layout.maxWidth.content, `page` at layout.maxWidth.page. Below it, the overlay
        behavior applies. This is how one component serves a phone''s hamburger menu
        and a desktop''s sidebar.'
    role:
      type: enum
      values:
      - complementary
      - navigation
      default: complementary
      description: 'The landmark the panel exposes (in persistent mode and as the
        region''s role when open): `navigation` for a menu of Links, `complementary`
        for filters, a cart, a detail. On web this is the Landmark component''s `as`.'
    modal:
      type: boolean
      default: false
      description: 'False (the default, the disclosure pattern): the panel is a disclosed
        region — no scrim by default, the page stays live and in the tab order after
        the panel, focus stays on the trigger when it opens, and Escape from inside
        or a click outside closes it. True: the panel is a modal Dialog at the edge
        — scrim, focus moved in and trapped, page inert and scroll-locked — for a
        panel that must be finished or dismissed (a cart checkout, a required filter).'
    scrim:
      type: boolean
      default: true
      description: Show the scrim in non-modal mode too (modal always has one). Off
        for a panel that should feel like part of the page.
    dismissible:
      type: boolean
      default: true
      description: Escape, the close button, a scrim tap / outside click, and the
        swipe gesture all request close. When false, the close button is not rendered
        and taps outside do nothing; Escape still reports through onOpenChange with
        reason escape (the consumer decides), as in Dialog.
    swipeable:
      type: boolean
      default: true
      description: On touch, a swipe toward the edge dismisses; from the edge, a swipe
        opens (native only). Purely additive.
      a11y: A gesture is never the only way (WCAG 2.5.1); the trigger and close button
        always exist.
  events:
    onOpenChange:
      description: 'Fired when the panel opens or closes, with the new state and a
        reason: `trigger`, `escape`, `close-button`, `scrim`, `swipe`, `action`, `navigation`
        (a Link inside was followed).'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
  keyboard:
  - keys:
    - Enter
    - ' '
    action: 'Toggles the panel from the trigger (aria-expanded flips). Non-modal:
      focus stays on the trigger. Modal: focus moves into the panel.'
    when: focus on trigger
    from: trigger
    expect: toggles
  - keys:
    - Tab
    action: 'Non-modal: from the trigger, moves into the open panel (it is next in
      DOM order); from the last element in the panel, continues into the page. Modal:
      from the last element wraps to the first.'
    when: open
    from: trigger
    expect: manual
  - keys:
    - Escape
    action: Closes and returns focus to the trigger (from inside the panel; a persistent
      sidebar ignores it).
    when: open
    from: inside
    expect: closes
  - keys:
    - Shift+Tab
    action: 'Non-modal: from the first element in the panel, returns to the trigger
      and leaves the panel open. Modal: wraps to the last element.'
    when: open
    from: first
    expect: focus-trigger
  styles:
    scrim:
      token: color.overlay.scrim
      locked: false
    surface:
      token: color.overlay.surface
      locked: true
    shadow:
      token: shadow.overlay
      description: Overlay mode only; the persistent sidebar has a border instead.
      locked: false
    border:
      token: color.border
      description: The inner edge of a persistent sidebar.
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    width:
      token: layout.maxWidth.prose
      description: Default panel width on wide screens; narrow is space.20 × 3 (a
        link list), wide is layout.maxWidth.content. Below the prose breakpoint the
        panel is the viewport minus `edgeGutter`.
      locked: false
    widthNarrow:
      token: space.20
      description: Multiplied by 3 — the doc states the arithmetic so no literal appears
        in code.
      locked: false
    widthWide:
      token: layout.maxWidth.content
      locked: false
    edgeGutter:
      token: space.12
      description: The strip of scrim left visible beside a phone-width panel, so
        the page is still seen and tappable to close.
      locked: false
    inset:
      token: layout.inset.lg
      locked: false
    headerGap:
      token: layout.gap.normal
      description: Between title and close button.
      locked: false
    partGap:
      token: layout.gap.loose
      description: Between header, body and footer.
      locked: false
    footerGap:
      token: layout.gap.tight
      locked: false
    layer:
      token: layer.sheet
      locked: false
    enter:
      token: motion.duration.base
      description: Slide in from the edge with the scrim fading; motion.easing.standard;
        instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      description: Slide out with motion.easing.exit; a swipe dismiss continues at
        the swipe velocity.
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    closeLabel: Close
  a11y:
    role: none
    requires:
    - accessible-name
    - expanded-state
    - focus-restore
    - escape-dismiss
    - gesture-alternative
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-44px
    - landmark-role
    - focus-trap
    - inert-background
    - scroll-lock
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
    - foreground: color.link
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: aside
      attributes:
      - aria-expanded
      - aria-controls
      - aria-labelledby
      - hidden
      - role=complementary
      - role=navigation
      - role=dialog
      - aria-modal
      - inert
      notes: 'Non-modal (default, APG disclosure): the trigger Button gets aria-expanded
        and aria-controls={panelId}; the panel is an <aside aria-labelledby> (or <nav>
        when `as: nav`) rendered immediately after the trigger in DOM order so Tab
        flows trigger → panel → page, with the `hidden` attribute when closed (after
        the exit transition), position: fixed at the edge, full height, on layer.sheet,
        with an optional scrim <div aria-hidden> that closes on click. Focus stays
        on the trigger on open; Escape anywhere inside closes and refocuses the trigger;
        a focusout to outside the panel and trigger does NOT close it (unlike Popover
        — a navigation panel should survive a stray click) but a pointerdown on the
        scrim or outside does when dismissible. Modal: the same content in the native
        <dialog> via showModal() as Dialog and BottomSheet, inert page and scroll
        lock through FocusScope''s modal contract, focus moved to the first control.
        A Link followed inside the panel closes it with reason navigation (a client-side
        router fires onOpenChange; a full navigation makes it moot). Persistent mode
        above the chosen breakpoint (matchMedia on the token): render a plain <aside
        role="complementary" aria-labelledby> (or <nav> when the body is navigation
        — the caller passes `as: nav` through the Landmark component) in the page
        grid beside the content, no dialog, no scrim, no trap, trigger hidden with
        display none. The switch must not lose the panel''s content state (the same
        children render in both). Safe-area padding via env(safe-area-inset-left/right).'
    lit:
      tag: ds-side-panel
      reflect:
      - open
      - side
      - width
      - persistent
      - dismissible
      - swipeable
      notes: 'Slots `trigger`, default and `footer`. Shadow <dialog> for overlay mode;
        in persistent mode the host itself lays out as the sidebar (display: block
        in the parent grid) and the slotted content renders in an <aside> in the shadow
        root. Composed `open-change`. matchMedia listener on the persistent breakpoint.
        `aria-controls` cannot reach the shadow panel from the slotted trigger, so
        only aria-expanded is set on it; the panel is named by its heading inside
        the shadow root. `role` selects the landmark role of the shadow region. `container`
        is not needed: the panel lives in the shadow root.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - accessibilityViewIsModal
      notes: 'Native Modal with an Animated.View surface translated from the start
        (or end) edge, scrim Pressable to close, PanResponder for the swipe (edge-swipe
        to open needs a gesture on the screen root; offer it via a `useSidePanelEdgeSwipe`
        hook rather than assuming). onRequestClose → escape. Tablets in landscape
        with `persistent` set: render as a sibling View beside the content (no Modal),
        matching the web sidebar. RTL flips `start`/`end` via I18nManager. Non-modal
        ''page stays live'' cannot be reproduced under RN Modal (it intercepts all
        touches); only tap-outside-to-close is possible, and the doc accepts that.
        `role` maps to the RN >= 0.74 `role` prop on the persistent sidebar View.
        `navigation` as a close reason is never emitted natively (no router hook).
        `useSidePanelEdgeSwipe` requires the panel to be controlled (`open`).'
    swiftui:
      element: ZStack
      props:
      - .offset
      - .transition
      - withAnimation
      - FocusScope
      - .accessibilityAddTraits=isModal
      - .accessibilityValue=expanded
      - Button
      - .gesture=DragGesture
      notes: A panel slid in from `side` with `.offset` animated over the motion tokens
        (instant under reduced motion), rendered by the app as the trailing sibling
        of its content (`SidePanel` is placed in the view tree where it overlays;
        `.dsPortalHost` is not needed). The trigger `Button` carries `.accessibilityValue(copy.expanded
        / collapsed)` (no expanded trait) and controls the panel; `modal` adds the
        scrim `Rectangle` (`color.overlay.scrim`, tap closes when `dismissOnScrim`),
        FocusScope trap and `.isModal`; non-modal panels push content aside (`inline`)
        or overlay it without a scrim. Edge-swipe to close is an addition to the visible
        close `Button`.
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `border`, `borderWidth`, `width`, `widthNarrow`, `widthWide`, `edgeGutter`, `inset`, `headerGap`, `partGap`, `footerGap`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: ZStack
props:
- .offset
- .transition
- withAnimation
- FocusScope
- .accessibilityAddTraits=isModal
- .accessibilityValue=expanded
- Button
- .gesture=DragGesture
notes: A panel slid in from `side` with `.offset` animated over the motion tokens
  (instant under reduced motion), rendered by the app as the trailing sibling of its
  content (`SidePanel` is placed in the view tree where it overlays; `.dsPortalHost`
  is not needed). The trigger `Button` carries `.accessibilityValue(copy.expanded
  / collapsed)` (no expanded trait) and controls the panel; `modal` adds the scrim
  `Rectangle` (`color.overlay.scrim`, tap closes when `dismissOnScrim`), FocusScope
  trap and `.isModal`; non-modal panels push content aside (`inline`) or overlay it
  without a scrim. Edge-swipe to close is an addition to the visible close `Button`.
```

## Guidance

## Overview

A side panel is the drawer: hidden off the edge until a button asks for it, then sliding in beside the page. It is built on the simplest APG pattern that fits — a button with `aria-expanded` that controls a region — so by default it behaves like a disclosure that happens to slide: focus stays on the button, Tab walks into the panel, Escape puts it away. Only when a panel must be finished or dismissed does it become a modal dialog at the edge. It holds whatever a page needs at hand but not on screen — the navigation List, a set of filters, the cart — and on a wide screen the same component can stay put as a sidebar, so a product has one menu, not a phone menu and a desktop one.

## When to use

Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a List or Tree of Links from the `start` edge), for filters beside a results page, for a cart or a detail panel from the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should become the permanent sidebar on desktop; leave it `never` for panels that are always a temporary overlay (a cart).

## When not to use

Do not use a SidePanel for a short list of actions (Menu, ActionSheet), for a task with a few fields (Dialog or BottomSheet, which the thumb reaches), or for content that is the page's point. Do not open one on hover. Use `modal` only when the page must not be used until the panel is done; a navigation drawer is not that. Do not stack side panels, and do not put a Dialog's job inside one — a panel is a place, not a step.

## Behavior

The trigger toggles the panel and reflects it with `aria-expanded`. Non-modal (default): opening slides the panel in from `side` and fades the scrim if shown; focus stays on the trigger, and the next Tab enters the panel because it sits right after the trigger in the document; Shift+Tab from the first control returns to the trigger with the panel still open; the page stays live. Modal: focus moves to the first control (or the title), the page is inert and scroll-locked, Tab is confined. In both, the body scrolls within the panel and the footer stays pinned; Escape (from inside), the close button, a scrim or outside tap, and a swipe toward the edge request close; following a Link inside closes it with reason `navigation`; closing returns focus to the trigger. Above the `persistent` breakpoint the panel is simply there: no scrim, no trap, the trigger hidden, the same content in the page's tab order as a `complementary` (or navigation) landmark; crossing the breakpoint while open keeps the content and drops the overlay chrome. `start` and `end` follow the writing direction. The swipe-to-dismiss gesture lives on the header (not the close button). When closed the panel is either unmounted or `hidden` — both remove it from the accessibility tree; the exit transition finishes first. The non-modal scrim fades with the panel''s enter/exit durations. The trigger is a single element; a `menu` Icon exists for the usual icon-only trigger.

## Content guidelines

Titles name what the panel holds ("Menu", "Filters", "Your cart"), not "Side panel". A navigation panel is a List of Links with the current page marked (`aria-current="page"`), grouped with Dividers if long; keep it to what fits without scrolling on a typical phone. Filter panels end with an action row in the footer ("Apply", "Clear"). The trigger's label says what opens ("Menu", "Filters"), and the `menu` Icon alone is only acceptable with that label for assistive technology.

## Accessibility

The default is the APG disclosure pattern: a button with `aria-expanded` and `aria-controls` showing and hiding a named landmark region (WCAG 4.1.2, 1.3.6), with the region placed after the button in DOM order so the tab sequence is the visual sequence (2.4.3, 1.3.2); the hidden panel uses `hidden`, not just off-screen positioning, so it is out of the accessibility tree when closed. Escape closes from inside and restores focus to the button (2.1.2). With `modal` the panel is a modal `dialog` named by its title: focus moves in and is confined, the background is inert and scroll-locked (APG modal dialog). The swipe is additive (2.5.1). In persistent mode it is a landmark region (`complementary` or `navigation`) in the normal tab order, so a screen-reader user can jump to it (1.3.6, 2.4.1). The panel meets contrast on the overlay surface, its close button meets 44px, and the slide respects reduced motion (2.3.3). A phone-width panel leaves a strip of scrim visible so sighted users keep their sense of place and have a large close target.

## Platform notes

### Web
Clone the trigger with `aria-expanded`, `aria-controls`, `onClick` (toggle). Non-modal: render `<aside aria-labelledby id hidden={!open} data-ds="SidePanel" class="ds-side-panel--{side} ds-side-panel--{width}">` (or `Landmark as="nav"`) directly after the trigger, `position: fixed`, and an optional scrim `<div aria-hidden>` before it; keydown Escape inside → close + focus trigger; pointerdown outside (document listener) → close when dismissible; `hidden` is applied after the exit transition ends. Modal: render `<dialog aria-labelledby>` through `showModal()` with `position: fixed; inset-block: 0; inset-inline-start: 0` (or `-end`), `inline-size` from the width tokens (`min(var(--ds-side-panel-width), 100vw - var(--ds-side-panel-edge-gutter))`), translated from `-100%` to `0` over `enter`, `::backdrop` from `scrim`; wrap content in `FocusScope trapped={modal} autoFocus={modal ? 'first' : false} restoreFocus`; header `Stack` horizontal with the `Heading` (`level 2`, visually hidden when `hideHeading`) and the close `Button` (`ghost`, `iconOnly`, `close` Icon); body `Box` scrolling; footer `Stack`. Click on the backdrop and Escape → close. A `click` on an `<a>` inside with a client-side router → close with `navigation`. Persistent: `matchMedia('(min-width: <token px>)')` (`literal-ok: breakpoint from layout.maxWidth.*`) renders `Landmark as="complementary"` (or `"nav"`) with the same children and `border-inline-end` from `border`, and the trigger with `hidden`; the page layout places it with a grid column of the width token. Safe area via `env(safe-area-inset-left)`/`-right`.

### Lit
`<ds-side-panel heading="Menu" persistent="content"><ds-button slot="trigger" icon-only icon="menu" label="Menu"></ds-button><ds-list>…</ds-list></ds-side-panel>`; shadow `<dialog>`; persistent mode switches the host to `display: block` in the parent grid and renders an `<aside>`; composed `open-change`.

### React Native
`Modal` with an `Animated.View` panel at the `start`/`end` edge (`I18nManager.isRTL` flips), width from tokens capped at screen width minus `edgeGutter`, scrim `Pressable`, `PanResponder` swipe toward the edge to dismiss, `FocusScope`, `onRequestClose` → escape. `persistent` on tablets above the breakpoint renders a sibling `View` with `accessibilityRole="none"` and a label, beside the content. Provide `useSidePanelEdgeSwipe()` for the edge-swipe-to-open gesture on the screen root.

## Related

BottomSheet, Dialog, Menu, Landmark, Tree, Link, FocusScope.

## Behavior scenarios (12)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-side-start
  given:
    side: start
  then:
  - renders: true
  derived: true
- name: renders-side-end
  given:
    side: end
  then:
  - renders: true
  derived: true
- name: renders-width-narrow
  given:
    width: narrow
  then:
  - renders: true
  derived: true
- name: renders-width-default
  given:
    width: default
  then:
  - renders: true
  derived: true
- name: renders-width-wide
  given:
    width: wide
  then:
  - renders: true
  derived: true
- name: renders-persistent-never
  given:
    persistent: never
  then:
  - renders: true
  derived: true
- name: renders-persistent-content
  given:
    persistent: content
  then:
  - renders: true
  derived: true
- name: renders-persistent-page
  given:
    persistent: page
  then:
  - renders: true
  derived: true
- name: renders-role-complementary
  given:
    role: complementary
  then:
  - renders: true
  derived: true
- name: renders-role-navigation
  given:
    role: navigation
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
