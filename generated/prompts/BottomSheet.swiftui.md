# Generate: BottomSheet for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/BottomSheet.swift` declaring `public struct BottomSheet: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/BottomSheetBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+BottomSheet.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("BottomSheet") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("BottomSheet")` on the root and `"BottomSheet.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: BottomSheet
  category: overlay
  status: review
  apg: dialog-modal
  anatomy:
  - scrim
  - surface
  - focusScope
  - handle
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
    open:
      type: boolean
      required: true
      description: Controlled visibility, as in Dialog.
      controls:
        event: onClose
        state: open
    heading:
      type: string
      required: true
      description: The sheet's title and accessible name. May be visually hidden with
        `hideHeading` when the content is self-explanatory (a share sheet).
    hideHeading:
      type: boolean
      default: false
      description: Keep the heading for assistive technology but do not render it
        (forwarded to Dialog above the breakpoint).
      a11y: The accessible name is required regardless; visually hidden is fine, absent
        is not.
    children:
      type: content
      required: true
      description: The body. Scrolls inside the sheet when taller than the sheet's
        height.
    footer:
      type: content
      description: Action row, pinned to the bottom of the sheet above the safe area.
    height:
      type: enum
      values:
      - content
      - half
      - full
      default: content
      description: '`content` sizes to the body up to 90% of the viewport; `half`
        is a fixed half-height; `full` is a near-full-screen sheet with the top gutter
        visible so the scrim still shows.'
    dismissible:
      type: boolean
      default: true
      description: Escape, the close button, a scrim tap and the drag gesture all
        request close. When false, only the footer actions close it; Escape still
        reports.
    dragToDismiss:
      type: boolean
      default: true
      description: 'Drag the handle (or the header) downward to dismiss: release past
        25% of the sheet height, or faster than 1.5 px/ms, dismisses; otherwise the
        sheet springs back. The dismiss then plays the normal exit transition (no
        momentum physics). The body ScrollView does not start the gesture; only the
        handle and header do. Purely additive: the close button and Escape always
        exist.'
      a11y: A gesture is never the only way to dismiss (WCAG 2.5.1); the handle is
        not a focus stop.
  events:
    onClose:
      description: 'Requested close with reason: `escape`, `close-button`, `scrim`,
        `drag`, or `action`.'
      platforms:
        web: onClose
        lit: close
        rn: onClose
        swiftui: onClose
      payload:
      - name: reason
        type: enum
        values:
        - escape
        - close-button
        - scrim
        - drag
        - action
      reasons:
        escape: Escape pressed while open
        close-button: the close button was activated
        scrim: the scrim was clicked
        drag: the sheet was dragged past the dismiss threshold
        action: a footer action asked to close
      fires:
      - user
      timing:
        phase: request
    onDragDismiss:
      description: The user dragged the sheet past the dismiss threshold. Fired before
        `onClose` with reason drag; provided so analytics can distinguish gestures.
      gesture: true
      platforms:
        web: onDragDismiss
        lit: drag-dismiss
        rn: onDragDismiss
        swiftui: onDragDismiss
      fires:
      - user
      timing:
        phase: request
        before:
        - onClose
  keyboard:
  - keys:
    - Escape
    action: Requests close with reason escape.
    from: inside
    expect: closes
  - keys:
    - Tab
    action: From the last element wraps to the first; the handle is never a stop.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Shift+Tab
    action: From the first element wraps to the last.
    from: first
    expect: focus-wraps-to-last
  styles:
    scrim:
      token: color.overlay.scrim
      part: scrim
      locked: false
    surface:
      token: color.overlay.surface
      part: surface
      locked: true
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.lg
      description: Top corners only on phones; all corners when it renders as a Dialog.
      locked: false
    handle:
      token: color.foreground.muted
      part: handle
      description: A 4×36-unit pill (space.1 tall, space.10 wide) centered in the
        header, decorative.
      locked: true
    handleHeight:
      token: space.1
      part: handle
      locked: false
    handleWidth:
      token: space.10
      part: handle
      locked: false
    inset:
      token: layout.inset.lg
      locked: false
    partGap:
      token: layout.gap.loose
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
      description: Read once from the theme (the breakpoint is not per-instance overridable).
        Above this viewport width the sheet renders as a centered Dialog of size md
        instead of rising from the edge.
      locked: false
    layer:
      token: layer.sheet
      locked: false
    enter:
      token: motion.duration.base
      description: Slide up from the bottom edge with the scrim fading; motion.easing.standard;
        instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      description: Slide down with motion.easing.exit; a drag dismiss continues at
        the drag velocity.
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  constants:
    dismissDistance:
      description: Fraction of the sheet height a downward drag must pass for release
        to dismiss it rather than spring back.
      value: 0.25
      unit: ratio
    dismissVelocity:
      description: Drag speed at release that dismisses the sheet whatever the distance
        travelled.
      value: 1.5
      unit: px/ms
  copy:
    closeLabel: Close
  overlay:
    layer: sheet
    open: open
    closeEvent: onClose
    dismiss:
    - escape
    - scrim
    - close-button
    - swipe
    modal: true
  a11y:
    role: dialog
    requires:
    - accessible-name
    - focus-trap
    - focus-restore
    - escape-dismiss
    - inert-background
    - scroll-lock
    - gesture-alternative
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-44px
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
      large: true
  platforms:
    web:
      element: dialog
      attributes:
      - aria-modal
      - aria-labelledby
      notes: 'The same native <dialog> as Dialog, positioned at the bottom edge with
        inset-block-end: 0 and full width below the maxWidth token; above it, the
        generator renders Dialog directly (composition, not duplication). Drag uses
        Pointer Events on the handle/header with setPointerCapture; the handle is
        aria-hidden and not focusable. Safe-area padding via env(safe-area-inset-bottom).'
    lit:
      tag: ds-bottom-sheet
      reflect:
      - open
      - height
      - prop: dismissible
        attribute: no-dismiss
      - prop: dragToDismiss
        attribute: no-drag-to-dismiss
      notes: Shadow <dialog> with showModal(); a matchMedia listener on the maxWidth
        token switches between sheet and dialog presentation. `close` and `drag-dismiss`
        are composed CustomEvents.
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - statusBarTranslucent
      - accessibilityViewIsModal
      notes: 'Native Modal with an Animated.View surface translated from the bottom;
        PanResponder (or the platform gesture handler if the app already has it —
        not a new dependency) on the header for drag; onRequestClose → escape. Safe
        area via SafeAreaView / the bottom inset. On tablets above the maxWidth token,
        present as Dialog. This is the mobile-first overlay: on phones prefer it to
        Dialog for anything the thumb should reach.'
    swiftui:
      element: sheet
      props:
      - .sheet
      - .presentationDetents
      - .presentationDragIndicator
      - .presentationBackgroundInteraction
      - .interactiveDismissDisabled
      - .presentationBackground
      - FocusScope
      - Button
      notes: 'The native sheet: `.sheet` with `.presentationDetents` from `height`
        (`content` → `.height(measured)`, `half` → `.medium`, `full` → `.large`) and
        `snapPoints` → `.fraction`, `.presentationDragIndicator(.visible)` as the
        drag handle, `.presentationBackground(color.overlay.surface)`, `.presentationCornerRadius`
        from the radius token. Drag-to-dismiss is the system''s and fires `onDragDismiss`;
        the close `Button` is always rendered (gesture-alternative). `dismissOnScrim:
        false` → `.interactiveDismissDisabled()`. Heading names the sheet.'
  behavior:
  - name: close-button-fires-on-close
    description: The always-visible close button requests close, as in Dialog.
    given:
      open: true
    when:
      click: closeButton
    then:
    - event: onClose
  - name: the-close-button-works-without-the-drag-gesture
    description: The drag is purely additive — every sheet can be closed with one
      pointer activation (WCAG 2.5.1, gesture-alternative).
    given:
      open: true
      dragToDismiss: false
    when:
      click: closeButton
    then:
    - event: onClose
  - name: non-dismissible-still-reports-escape
    description: With `dismissible` false only the footer actions close the sheet,
      and Escape still reports.
    given:
      open: true
      dismissible: false
    when:
      key: Escape
    then:
    - event: onClose
    platforms:
    - web
    - lit
  - name: non-dismissible-scrim-tap-does-nothing
    given:
      open: true
      dismissible: false
    when:
      click: scrim
    then:
    - event: onClose
      fired: false
  - name: hidden-heading-is-still-the-accessible-name
    description: A share sheet may hide its title; the name is required regardless.
    given:
      open: true
      hideHeading: true
    then:
    - name: true
  - name: closed-sheet-renders-nothing
    given:
      open: false
    then:
    - renders: false
  examples:
  - name: filters
    description: The phone presentation of a filter panel, with the action row pinned
      at the bottom.
    given:
      open: true
      heading: Filters
      children: A Form of filter controls
      footer: Clear and Apply Buttons
  - name: half-height-results
    description: A browsable list where seeing the page behind matters, so the sheet
      stops at half height.
    given:
      open: true
      heading: Nearby places
      children: A scrolling list of results
      height: half
  - name: share-sheet
    description: A self-explanatory body whose title exists only for assistive technology.
    given:
      open: true
      heading: Share to
      children: A row of share targets
      hideHeading: true
  - name: full-screen-task
    description: A task that needs the whole screen but should still feel dismissable,
      with the gesture off.
    given:
      open: true
      heading: New expense
      children: A Form of a few fields
      footer: Cancel and Save Buttons
      height: full
      dragToDismiss: false
```

## Events

- `onClose`: emit `onClose`
  - payload, positional, in this order: `reason: 'escape' | 'close-button' | 'scrim' | 'drag' | 'action'`
  - reasons: `escape` (Escape pressed while open); `close-button` (the close button was activated); `scrim` (the scrim was clicked); `drag` (the sheet was dragged past the dismiss threshold); `action` (a footer action asked to close)
  - fires on: user
  - timing: request
- `onDragDismiss`: emit `onDragDismiss`
  - fires on: user
  - timing: request, fired before `onClose`

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onClose` (emit `onClose`); drives state `open`

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `handle`: token `color.foreground.muted`; part `handle`; locked
- `handleHeight`: token `space.1`; part `handle`
- `handleWidth`: token `space.10`; part `handle`
- `footerGap`: token `layout.gap.tight`; part `footer`

## Form and overlay

```yaml
overlay:
  layer: sheet
  open: open
  closeEvent: onClose
  dismiss:
  - escape
  - scrim
  - close-button
  - swipe
  modal: true
```

`overlay.closeEvent` emits `onClose`.

## Constants and examples

- constant `dismissDistance`: 0.25 ratio
- constant `dismissVelocity`: 1.5 px/ms
- example `filters`, story `Filters`: given `open: true`, `heading: "Filters"`, `children: "A Form of filter controls"`, `footer: "Clear and Apply Buttons"`; The phone presentation of a filter panel, with the action row pinned at the bottom.
- example `half-height-results`, story `HalfHeightResults`: given `open: true`, `heading: "Nearby places"`, `children: "A scrolling list of results"`, `height: "half"`; A browsable list where seeing the page behind matters, so the sheet stops at half height.
- example `share-sheet`, story `ShareSheet`: given `open: true`, `heading: "Share to"`, `children: "A row of share targets"`, `hideHeading: true`; A self-explanatory body whose title exists only for assistive technology.
- example `full-screen-task`, story `FullScreenTask`: given `open: true`, `heading: "New expense"`, `children: "A Form of a few fields"`, `footer: "Cancel and Save Buttons"`, `height: "full"`, `dragToDismiss: false`; A task that needs the whole screen but should still feel dismissable, with the gesture off.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `radius`, `handleHeight`, `handleWidth`, `inset`, `partGap`, `footerGap`, `maxWidth`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `handle`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: sheet
props:
- .sheet
- .presentationDetents
- .presentationDragIndicator
- .presentationBackgroundInteraction
- .interactiveDismissDisabled
- .presentationBackground
- FocusScope
- Button
notes: "The native sheet: `.sheet` with `.presentationDetents` from `height` (`content`\
  \ \u2192 `.height(measured)`, `half` \u2192 `.medium`, `full` \u2192 `.large`) and\
  \ `snapPoints` \u2192 `.fraction`, `.presentationDragIndicator(.visible)` as the\
  \ drag handle, `.presentationBackground(color.overlay.surface)`, `.presentationCornerRadius`\
  \ from the radius token. Drag-to-dismiss is the system's and fires `onDragDismiss`;\
  \ the close `Button` is always rendered (gesture-alternative). `dismissOnScrim:\
  \ false` \u2192 `.interactiveDismissDisabled()`. Heading names the sheet."
```

## Guidance

## Overview

A bottom sheet is the phone's dialog. It rises from the edge the thumb can reach, keeps the page visible behind a scrim so the user knows where they are, and goes away with a swipe, a tap outside, or a close button. On a wide screen the same content is a Dialog; the component decides which, so screens are written once.

## When to use

Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog: filters, a form of a few fields, details of a selected item, a picker with many options. Use `height: content` by default; `full` for a task that needs the whole screen but should still feel dismissable; `half` for a browsable list where seeing the page behind matters (a map with results). For a flat list of actions, ActionSheet is the lighter component.

## When not to use

Do not use a BottomSheet as a menu (ActionSheet or Menu), as a persistent panel (a bottom Landmark region), or for content the user must read at length (a page). Do not stack sheets. Do not rely on the drag gesture to teach dismissal; the close button is always visible.

## Behavior

Opening slides the sheet up and fades the scrim; focus moves to the first control or the title; the page behind is inert and its scroll locked. The body scrolls within the sheet; a downward drag on the header when the body is at its scroll top begins the dismiss gesture, and releasing past the threshold or with enough velocity fires `onDragDismiss` then `onClose('drag')` — otherwise the sheet springs back. Escape, the close button and a scrim tap request close as in Dialog. Above the `maxWidth` breakpoint the sheet presents as a centered Dialog of size md with the same props and events, so code does not branch on device. In the wide presentation the same props are forwarded to Dialog — `heading`, `hideHeading` (Dialog has it for this reason), `dismissible`, `footer` — and matching overrides (`inset`, `radius`, `partGap`, `footerGap`) are forwarded to Dialog''s `overrides`; sheet-only bindings (handle, edge radius, drag) are no-ops there. The always-present wrapper carries `data-ds="BottomSheet"` in both presentations. Crossing the breakpoint while open swaps presentation on the next render without an animated hand-off; focus and scroll lock are re-established by the new surface. Initial focus is FocusScope''s `first` (first control in the body, else the close button, else the heading); there is no `initialFocus` prop.

## Content guidelines

Titles name the task or the thing ("Filters", "Share to"). Footer actions follow Form's order. Sheets with a self-explanatory body (a share row of icons) may `hideHeading`, but the title text still exists for screen readers.

## Accessibility

Role `dialog`, `aria-modal`, named by the title even when visually hidden (WCAG 4.1.2). Focus trap, restore, Escape and inert background as in Dialog. The drag gesture is an addition: every sheet can be closed with a single pointer activation on the close button and with Escape (2.5.1 Pointer Gestures; gesture-alternative). The handle is decorative and skipped by keyboard and assistive technology. Touch targets in the sheet reach 44px (target-44px) because sheets are used one-handed. Motion respects reduced-motion; the drag-follow still tracks the finger, since it is user-driven, but the release animation is instant.

## Platform notes

### Web
Below the `maxWidth` breakpoint (a media query on the resolved token, `literal-ok`), render the native `<dialog>` with `position: fixed; inset-block-end: 0; inline-size: 100%; max-block-size: 90dvh` and top-only radius; `height` sets `block-size` for `half` (50dvh) and `full` (calc(100dvh - var(--layout-gutter))). Above it, render `<Dialog size="md">` with the same children. Pointer Events on the header: track `pointermove` deltaY, translate the surface, and on `pointerup` decide by distance (> 25% of sheet height) or velocity. Padding-bottom adds `env(safe-area-inset-bottom)`.

### Lit
`<ds-bottom-sheet open heading="Filters" height="half">`; shadow `<dialog>`; `matchMedia` decides presentation and re-renders on change; drag handling as web. Composes `<ds-heading>`, `<ds-button>`, `<ds-icon>`, `<ds-box>`, `<ds-stack>`, and `<ds-dialog>` for the wide presentation.

### React Native
`Modal` with `transparent`; surface is an `Animated.View` anchored to the bottom with `translateY` driven by a `PanResponder` on the header; `height` sets the surface height as a fraction of `useWindowDimensions().height`; body in a `ScrollView` whose `scrollY` at 0 hands the gesture to the pan responder. Bottom padding includes the safe-area inset. On tablets wider than the `maxWidth` token, render `Dialog`. `onRequestClose` → `onClose('escape')`.

## Related

Dialog, ActionSheet, Menu, Button.

## Behavior scenarios (11)

One test per scenario, in this order.

```yaml
- name: close-button-fires-on-close
  description: The always-visible close button requests close, as in Dialog.
  given:
    open: true
  when:
    click: closeButton
  then:
  - event: onClose
- name: the-close-button-works-without-the-drag-gesture
  description: The drag is purely additive — every sheet can be closed with one pointer
    activation (WCAG 2.5.1, gesture-alternative).
  given:
    open: true
    dragToDismiss: false
  when:
    click: closeButton
  then:
  - event: onClose
- name: non-dismissible-scrim-tap-does-nothing
  given:
    open: true
    dismissible: false
  when:
    click: scrim
  then:
  - event: onClose
    fired: false
- name: hidden-heading-is-still-the-accessible-name
  description: A share sheet may hide its title; the name is required regardless.
  given:
    open: true
    hideHeading: true
  then:
  - name: true
- name: closed-sheet-renders-nothing
  given:
    open: false
  then:
  - renders: false
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-height-content
  given:
    height: content
  then:
  - renders: true
  derived: true
- name: renders-height-half
  given:
    height: half
  then:
  - renders: true
  derived: true
- name: renders-height-full
  given:
    height: full
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: escape-fires-on-close
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onClose
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```
