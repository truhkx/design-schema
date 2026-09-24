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
    heading:
      component: Heading
      props:
        level: '2'
    closeButton:
      component: Button
      props:
        variant: ghost
        size: sm
        iconOnly: true
    body:
      component: Box
      forwards:
        inset: paddingInline
    footer:
      component: Stack
      props:
        direction: horizontal
        justify: end
        wrap: true
      forwards:
        footerGap: gap
  props:
    open:
      type: boolean
      required: true
      description: Controlled visibility, as in Dialog. Controlled only — there is
        no uncontrolled mode; the consumer owns `open` and the sheet requests changes
        through `onClose`, never changing `open` itself.
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
      description: Keep the heading for assistive technology but do not render it.
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
      description: '`content` sizes to the body up to `contentCap` of the viewport;
        `half` is a fixed half-height; `full` is a near-full-screen sheet with the
        top gutter visible so the scrim still shows. A fixed height (`half`, `full`)
        leaves slack in the column, which is what lets the footer pin to the bottom;
        at `content` the column is intrinsic, so "pinned" means only that the footer
        is last.'
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the close button, a scrim tap and the drag gesture all
        request close. When false, only the footer actions close it, as in Dialog:
        the close button and the drag handle are not rendered, a scrim tap and a drag
        do nothing, and Escape still reports with reason `escape`.'
    dragToDismiss:
      type: boolean
      default: true
      description: 'Drag the handle (or the header) downward to dismiss: release past
        25% of the sheet height, or faster than 1.5 px/ms, dismisses; otherwise the
        sheet springs back. The dismiss then plays the normal exit transition (no
        momentum physics). The body ScrollView does not start the gesture; only the
        handle and header do, whatever the body''s scroll position, and only once
        the pointer has moved `dragSlop` downward, so a tap on the close button still
        activates it. The drag offset is measured from where the slop was crossed,
        so the surface does not jump. After a dismissing release the surface holds
        the released offset until the consumer''s next render — web and rn: the render
        that follows the `onClose` call (a `setState` in the handler is batched into
        it); Lit: `updateComplete` after the `close` dispatch plus one animation frame.
        If `open` is still true then, the sheet springs back (motion.easing.standard
        over the `exit` duration) and a later `open` false plays the normal exit from
        rest; a spring-back also finishes an interrupted enter animation. Purely additive:
        Escape always exists, and the close button exists whenever the gesture does
        (both need `dismissible`). The handle is rendered only when `dragToDismiss`
        and `dismissible` are both true, so there is no drag affordance where dragging
        does nothing.'
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
        action: 'a footer action asked to close. BottomSheet never raises it on its
          own: it exists for a consumer''s footer action reusing the same handler,
          and on Lit a slotted form submitted with method="dialog" is caught by a
          host `submit` listener that prevents default and fires `close` with `action`,
          as in Dialog.'
      fires:
      - user
      timing:
        phase: request
    onDragDismiss:
      description: The user dragged the sheet past the dismiss threshold. Fired before
        `onClose` with reason drag; provided so analytics can distinguish gestures.
        It carries no payload — the distance and velocity that triggered it are not
        part of the contract.
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
      part: surface
      locked: false
    radius:
      token: radius.lg
      description: 'Top corners only, at every width: the surface always meets the
        bottom edge.'
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
    handleRadius:
      token: radius.full
      part: handle
      description: Rounds the handle into a pill.
      locked: false
    headerPaddingTop:
      token: space.sm
      part: surface
      description: Block-start padding above the handle. It is the block-start padding
        of the column that holds the parts (see `inset`) when the handle is rendered,
        in place of `inset`; it is applied once there, never as extra header padding.
      locked: false
    handleGap:
      token: layout.gap.tight
      part: header
      description: The header is a column of the handle over the heading row; this
        is that column's gap, between the handle and the heading row.
      locked: false
    headerGap:
      token: layout.gap.normal
      part: header
      description: The flex gap of the heading row, between the heading and the close
        button, as Dialog's headerGap. The heading row is a sheet-owned element inside
        the header, not an anatomy part, with no data-part or testID. With the heading
        hidden (`hideHeading`) the close button is end-aligned in the row; a header
        with no visible heading, no handle and no close button is not rendered, on
        every platform — on web and Lit the visually hidden heading then sits at the
        start of the column, and on rn nothing is rendered because the name is the
        surface's accessibilityLabel.
      locked: false
    inset:
      token: layout.inset.lg
      description: 'Inline padding of every part: the header and footer wrappers apply
        it themselves and the body Box receives it as `overrides.paddingInline` (its
        block padding stays zero). The block edges are padded once, on the column
        that holds header, body and footer (the surface): padding-block-start `inset`
        (`headerPaddingTop` when the handle is rendered) and padding-block-end `inset`,
        plus the bottom safe-area inset at every width. No part has block padding
        of its own, so nothing doubles.'
      locked: false
    partGap:
      token: layout.gap.loose
      description: 'The only space between header, body and footer: the flex gap of
        the column. Box never scrolls, so the body part is a Box inside a sheet-owned
        scroll element (unnamed, no part hook of its own); it is that wrapper the
        gap measures to. On rn the empty SafeAreaView that adds the bottom inset is
        not a part either and takes no gap: cancel the column gap above it, so the
        bottom clearance is exactly `inset` plus the safe-area inset.'
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: 'Between footer actions; forwarded to the footer Stack as `overrides.gap`,
        the footer row end-aligned as in Dialog. A forward always reaches the Stack
        with the resolved value: on web and Lit through the Stack''s own `--ds-stack-gap`
        hook, set in the sheet''s stylesheet to `--ds-bottom-sheet-footer-gap`, with
        `overrides.gap` passed only when the caller set that override, so consumer
        CSS on the sheet''s hook still reaches the Stack — this is delivery of the
        forward, not restyling the child; on rn the resolved value (token or override)
        is always passed in `overrides`; `inset` reaches the body the same way.'
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
      part: surface
      locked: true
      description: 'The surface''s maximum inline size, centred with equal inline
        margins: the surface is `min(viewport width, token)` wide and stays anchored
        to the bottom edge, so on a phone it is full width and on a wide viewport
        it is a capped, centred sheet. It is not a breakpoint — there is one presentation
        at every width, never a Dialog, and nothing is decided in script. Web and
        Lit: `max-inline-size` on the surface with `margin-inline: auto`; rn: the
        surface''s `maxWidth` with `alignSelf: center`, so a tablet wider than the
        token gets the same capped sheet at the bottom.'
    layer:
      token: layer.sheet
      description: 'Has no effect inside the browser top layer or a native Modal window;
        applies to the non-top-layer fallback (position: fixed) and the rn anchor
        view.'
      locked: false
    enter:
      token: motion.duration.base
      description: Slide up from the bottom edge with the scrim fading in the same
        duration and easing; motion.easing.standard; instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      description: Slide down with motion.easing.exit; the scrim fades out in the
        same duration and easing. A drag dismiss plays this same transition from wherever
        the finger left the sheet — there is no momentum or decay physics, so no platform
        needs a velocity-to-animation mapping. A below-threshold release springs back
        to rest with this duration and motion.easing.standard (a timing animation,
        not a spring), instant under reduced motion.
      locked: false
    minTarget:
      token: size.target.comfortable
      part: closeButton
      description: 'Sheets are used one-handed, so the close button is raised to the
        comfortable target without changing Button: the closeButton part is a sheet-owned
        wrapper (web/Lit element with `data-part="closeButton"`; rn View with `testID="BottomSheet.closeButton"`)
        with this minimum inline and block size, whose extra area activates the Button
        (web/Lit: a click on the wrapper outside the Button focuses the Button and
        requests close with reason `close-button` from the wrapper''s own click handler,
        never reaching into the Button''s internals or shadow root; rn: the wrapper
        View takes the min size and the Button''s own internally computed hitSlop
        — rn Button accepts no `hitSlop` prop, it derives one from size.target.comfortable
        — covers the extra area). The Button keeps its own size variant (ghost, sm,
        icon-only, as in Dialog) and colors.'
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  constants:
    contentCap:
      description: 'Fraction of the viewport a `height: content` sheet may grow to
        before its body scrolls. It applies to that value alone — `half` and `full`
        set their block size outright and are never clamped by it. No token expresses
        a ratio, so it stays a documented module constant marked `literal-ok`.'
      value: 0.9
      unit: ratio
    dismissDistance:
      description: 'Fraction of the sheet height a downward drag must pass for release
        to dismiss it rather than spring back. The height it is a fraction of is the
        surface''s measured height at release (web and Lit: getBoundingClientRect),
        not the configured `height` value — for `full` the two differ by the gutter.'
      value: 0.25
      unit: ratio
    dismissVelocity:
      description: Drag speed at release that dismisses the sheet whatever the distance
        travelled. Measured between the last two move samples before release using
        the event timestamps (web/Lit `event.timeStamp`, rn `nativeEvent.timestamp`,
        never PanResponder's averaged `gestureState.vy`, which smooths differently
        and would disagree with the other platforms on a flick ending in one slow
        sample); only downward speed counts. A release with fewer than two samples,
        or two samples sharing a timestamp, has velocity 0, so distance alone decides.
        A documented constant with no token (`literal-ok`).
      value: 1.5
      unit: px/ms
    dragSlop:
      description: 'Downward distance a pointer must move on the handle or header
        before the drag claims it, so a tap on the close button still activates it.
        Past the slop the header takes the move over from a child it started on (the
        heading or the close button): web/Lit setPointerCapture on the header, rn
        onMoveShouldSetPanResponderCapture; the drag offset counts from where the
        slop was crossed. The length is read at gesture start from the resolved `--space-1`
        custom property — the token, not the `handleHeight` hook, so overriding the
        handle height does not move the slop — and converted to px: rem and em multiply
        by the root font size, px and unitless values are taken verbatim; rn uses
        the resolved token number. On web and Lit an unresolvable value counts as
        0. A pointer with no finite `clientY` (jsdom has no PointerEvent), a non-primary
        pointer and a secondary mouse button never claim the gesture, so the drag
        is provable only in a browser, not in the unit gate.'
      token: space.1
      unit: px
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
      notes: 'The same native <dialog> as Dialog, filling the viewport, with the surface
        at the bottom edge (inset-block-end: 0), `max-inline-size` from the maxWidth
        token and `margin-inline: auto`, so it is full width on a phone and capped
        and centred on a wide screen — one presentation at every width, with no media
        query and no Dialog. Drag uses Pointer Events on the handle/header with setPointerCapture;
        the handle is aria-hidden and not focusable. Safe-area padding via env(safe-area-inset-bottom).
        The <dialog> fills the viewport with a transparent ::backdrop and the scrim
        is a real `data-part="scrim"` element inside it, as in Dialog; a scrim dismiss
        is a `click` whose target is that element. Button, Heading and Stack write
        their own data-part, so the heading, closeButton and footer parts are sheet-owned
        wrappers around them; the body Box takes its data-part directly, inside the
        sheet-owned scroll element that `partGap` describes. FocusScope writes its
        own `data-part="scope"`, so the `focusScope` part is a sheet-owned element
        directly inside FocusScope, as in Dialog. `container` is the portal target
        every portaled overlay accepts (not a schema prop). `ref` resolves to the
        sheet''s <dialog>, null while closed.'
    lit:
      tag: ds-bottom-sheet
      reflect:
      - open
      - height
      - prop: dismissible
        attribute: no-dismiss
      - prop: dragToDismiss
        attribute: no-drag-to-dismiss
      notes: 'Shadow <dialog> with showModal(), laid out as web: the surface at the
        bottom edge, capped at the maxWidth token and centred, at every width — no
        matchMedia and no `<ds-dialog>`. `close` and `drag-dismiss` are composed CustomEvents.
        The footer part is rendered only when the `footer` slot has assigned children,
        so a sheet with no footer gets no empty footer part. Every composed part (heading,
        closeButton, body, footer) is a sheet-owned wrapper element carrying `data-part`,
        holding the `<ds-heading>`, `<ds-button>`, `<ds-box>` or `<ds-stack>`: ds-box
        overwrites its own data-part with `surface` and the other ds-* hosts carry
        none. Accessible name: the shadow <dialog> carries aria-label from the heading
        text, never aria-labelledby, as ds-dialog.'
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
        area via SafeAreaView / the bottom inset. On tablets wider than the maxWidth
        token the presentation is the same sheet, capped at the token width and centred
        at the bottom (surface `maxWidth` from the resolved token, `width: ''100%''`,
        `alignSelf: ''center''`), with the same testIDs and scenarios at every window
        width. The bottom inset comes from SafeAreaView on iOS: an empty SafeAreaView
        as the last child of the surface column, after the last part, so the only
        edge it adds is its bottom-edge padding as height (SafeAreaView is deprecated
        in core since 0.81 but is still the only core source, and no dependency is
        added). `height` on rn: `half` is window height × 0.5 and `full` is window
        height minus `layout.gutter`, as web''s 50dvh and 100dvh - gutter; on Android
        with statusBarTranslucent `full` subtracts the larger of the gutter and `StatusBar.currentHeight`.
        iOS core exposes no status-bar height, so on a notched iPhone a `full` sheet
        can reach under the status bar when the gutter is smaller; Escape (the VoiceOver
        two-finger scrub) still closes and the footer actions stay reachable. React
        Native core has no safe-area API on Android and no dependency is added, so
        Android adds no inset — the Modal is not navigationBarTranslucent, so its
        window already ends above the system navigation bar and the footer stays reachable.
        The closeButton part is a wrapping View with `testID="BottomSheet.closeButton"`
        sized to minTarget, the Button''s hitSlop covering the extra area. The Modal
        is its own window, so no ref is exposed; callers ref their trigger. The surface
        carries the root `testID="BottomSheet"` and there is no `BottomSheet.surface`,
        as in Dialog; `focusScope` gets no testID either, since FocusScope owns that
        wrapper. Of the keyboard block only the Escape rule has a native path (onRequestClose,
        onAccessibilityEscape): native has no Tab order, so the wrap rules are delegated
        to FocusScope and are exercised on react-native-web alone; the accessible
        way through the sheet on native is the swipe order, which follows the parts.
        This is the mobile-first overlay: on phones prefer it to Dialog for anything
        the thumb should reach. The surface carries the RN >= 0.74 `role="dialog"`
        prop alongside accessibilityViewIsModal, as Dialog does; the legacy accessibilityRole
        union has no dialog value. Scroll lock has no native meaning — a Modal has
        no page behind it to scroll — and is not implemented. With no `initialFocus`
        prop, focus on open is FocusScope''s `autoFocus="first"`, which on native
        lands on the scope wrapper rather than a real first control; that is FocusScope''s
        own documented limit and the screen reader reads the sheet from the top, which
        is the intended result anyway.'
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
        drag handle when `dragToDismiss` and `dismissible` are both true (`.hidden`
        otherwise), `.presentationBackground(color.overlay.surface)`, `.presentationCornerRadius`
        from the radius token. Drag-to-dismiss is the system''s and fires `onDragDismiss`;
        the close `Button` is rendered whenever `dismissible` is true (gesture-alternative),
        and is absent, with the drag disabled, when it is false. `dismissOnScrim:
        false` → `.interactiveDismissDisabled()`. Heading names the sheet.'
  behavior:
  - name: close-button-fires-on-close
    description: The close button (rendered whenever the sheet is dismissible) requests
      close, as in Dialog.
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
  - reasons: `escape` (Escape pressed while open); `close-button` (the close button was activated); `scrim` (the scrim was clicked); `drag` (the sheet was dragged past the dismiss threshold); `action` (a footer action asked to close. BottomSheet never raises it on its own: it exists for a consumer's footer action reusing the same handler, and on Lit a slotted form submitted with method="dialog" is caught by a host `submit` listener that prevents default and fires `close` with `action`, as in Dialog.)
  - fires on: user
  - timing: request
- `onDragDismiss`: emit `onDragDismiss`
  - fires on: user
  - timing: request, fired before `onClose`

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onClose` (emit `onClose`); drives state `open`

## Parts and slots

- `scrim`: element
- `surface`: element
- `focusScope`: component `FocusScope`
- `handle`: element
- `header`: element
- `heading`: component `Heading`; props `level` = "2"
- `body`: component `Box`; forwards `inset` → `overrides.paddingInline`
- `footer`: component `Stack`; props `direction` = "horizontal", `justify` = "end", `wrap` = true; forwards `footerGap` → `overrides.gap`
- `closeButton`: component `Button`; props `variant` = "ghost", `size` = "sm", `iconOnly` = true

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `shadow`: token `shadow.overlay`; part `surface`
- `handle`: token `color.foreground.muted`; part `handle`; locked
- `handleHeight`: token `space.1`; part `handle`
- `handleWidth`: token `space.10`; part `handle`
- `handleRadius`: token `radius.full`; part `handle`
- `headerPaddingTop`: token `space.sm`; part `surface`
- `handleGap`: token `layout.gap.tight`; part `header`
- `headerGap`: token `layout.gap.normal`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `maxWidth`: token `layout.maxWidth.prose`; part `surface`; locked
- `minTarget`: token `size.target.comfortable`; part `closeButton`; locked

## Keyboard

- `Escape` (Requests close with reason escape.): expect closes
- `Tab` (From the last element wraps to the first; the handle is never a stop.): expect focus-wraps-to-first
- `Shift+Tab` (From the first element wraps to the last.): expect focus-wraps-to-last

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

- constant `contentCap`: 0.9 ratio
- constant `dismissDistance`: 0.25 ratio
- constant `dismissVelocity`: 1.5 px/ms
- constant `dragSlop`: `theme.space1` (`space.1`) px
- example `filters`, story `Filters`: given `open: true`, `heading: "Filters"`, `children: "A Form of filter controls"`, `footer: "Clear and Apply Buttons"`; The phone presentation of a filter panel, with the action row pinned at the bottom.
- example `half-height-results`, story `HalfHeightResults`: given `open: true`, `heading: "Nearby places"`, `children: "A scrolling list of results"`, `height: "half"`; A browsable list where seeing the page behind matters, so the sheet stops at half height.
- example `share-sheet`, story `ShareSheet`: given `open: true`, `heading: "Share to"`, `children: "A row of share targets"`, `hideHeading: true`; A self-explanatory body whose title exists only for assistive technology.
- example `full-screen-task`, story `FullScreenTask`: given `open: true`, `heading: "New expense"`, `children: "A Form of a few fields"`, `footer: "Cancel and Save Buttons"`, `height: "full"`, `dragToDismiss: false`; A task that needs the whole screen but should still feel dismissable, with the gesture off.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `radius`, `handleHeight`, `handleWidth`, `handleRadius`, `headerPaddingTop`, `handleGap`, `headerGap`, `inset`, `partGap`, `footerGap`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `handle`, `maxWidth`, `minTarget`, `focusRing`, `focusRingWidth`

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
  \ drag handle when `dragToDismiss` and `dismissible` are both true (`.hidden` otherwise),\
  \ `.presentationBackground(color.overlay.surface)`, `.presentationCornerRadius`\
  \ from the radius token. Drag-to-dismiss is the system's and fires `onDragDismiss`;\
  \ the close `Button` is rendered whenever `dismissible` is true (gesture-alternative),\
  \ and is absent, with the drag disabled, when it is false. `dismissOnScrim: false`\
  \ \u2192 `.interactiveDismissDisabled()`. Heading names the sheet."
```

## Guidance

## Overview

A bottom sheet is the phone's dialog. It rises from the edge the thumb can reach, keeps the page visible behind a scrim so the user knows where they are, and goes away with a swipe, a tap outside, or a close button. On a wide screen it is still a sheet: the same surface rises from the same bottom edge, capped at the prose width and centred, so it never turns into a different component. When a wide screen should show a centred Dialog instead, use Dialog there.

## When to use

Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog: filters, a form of a few fields, details of a selected item, a picker with many options. Use `height: content` by default; `full` for a task that needs the whole screen but should still feel dismissable; `half` for a browsable list where seeing the page behind matters (a map with results). For a flat list of actions, ActionSheet is the lighter component.

## When not to use

Do not use a BottomSheet as a menu (ActionSheet or Menu), as a persistent panel (a bottom Landmark region), or for content the user must read at length (a page). Do not stack sheets. Do not rely on the drag gesture to teach dismissal; the close button is visible on every dismissible sheet.

## Behavior

Opening slides the sheet up and fades the scrim; focus moves to the first control or the title; the page behind is inert and its scroll locked. The body scrolls within the sheet; a downward drag on the handle or header (never the body, whatever its scroll position) begins the dismiss gesture, and releasing past the threshold or with enough velocity fires `onDragDismiss` then `onClose('drag')` — otherwise the sheet springs back. After a drag dismiss the sheet holds the release position until the consumer's update renders: `open` false plays the exit from there; `open` still true springs the sheet back to rest. A release past the threshold when `open` has already gone false — a close that raced the gesture — is a spring-back that fires neither `onDragDismiss` nor `onClose`, so the sheet never reports a dismissal it did not cause. Escape, the close button and a scrim tap request close as in Dialog. When the browser closes the native `<dialog>` on its own (a repeated Escape reaching the close watcher closes it with no `cancel` event at all), report `escape` once and re-`showModal()` unless the consumer set `open` false, as Dialog does — `open` is controlled only, and a silently closed sheet would desync. With `dismissible` false, Escape reports on every press: nothing throttles or announces the repeats. The sheet never raises `action` itself; a consumer's footer action may call the same `onClose` handler with it. The `overlay.dismiss` values are the shared category vocabulary; the event's reasons are what fires: `escape`, `scrim` and `close-button` are reported as themselves, and `swipe` is reported as `drag`. `open` is controlled only; there is no uncontrolled mode. The heading's id/ref/tabindex, the close Button's `label` from `copy.closeLabel`, its `close` Icon glyph, press handlers and aria wiring are wiring every platform passes, not composition props. Gate and Keyboard stories that need it open render through a wrapper that owns `open` (starting true) and writes `onClose` back, acting as the consumer. The presentation is the same at every width: on a viewport wider than `maxWidth` the surface is capped at that width and centred with equal inline margins, still anchored to the bottom edge with top corners rounded, and it slides up, drags, dismisses, pads for the safe area and dims the page behind its scrim exactly as on a phone. Nothing switches at a breakpoint, so the part hooks, the `--ds-bottom-sheet-*` custom properties, every override and the authored scenarios apply at every width, and resizing an open sheet only reflows it. Initial focus is the first focusable in the body, then in the footer, then the close button, then the heading, which takes `tabindex="-1"` only when it is the target itself, so it is not a spurious Tab stop in the common case; there is no `initialFocus` prop.

## Content guidelines

Titles name the task or the thing ("Filters", "Share to"). Footer actions follow Form's order. Sheets with a self-explanatory body (a share row of icons) may `hideHeading`, but the title text still exists for screen readers.

## Accessibility

Role `dialog`, `aria-modal`, named by the title even when visually hidden (WCAG 4.1.2). The name is delivered per platform and the platforms are allowed to differ: web points `aria-labelledby` at the heading element, Lit sets `aria-label` to the heading text (the package's convention for every Lit overlay, so the name does not depend on where the heading is rendered, at the cost of announcing markup in a heading as its text), rn sets the surface's accessibilityLabel. Focus trap, restore, Escape and inert background as in Dialog. The drag gesture is an addition: every sheet the gesture can dismiss can also be closed with a single pointer activation on the close button, and every sheet with Escape (2.5.1 Pointer Gestures; gesture-alternative). The handle is decorative and skipped by keyboard and assistive technology. Touch targets in the sheet reach 44px (target-44px) because sheets are used one-handed. Motion respects reduced-motion; the drag-follow still tracks the finger, since it is user-driven, but the release animation is instant.

## Platform notes

### Web
Render the native `<dialog>` filling the viewport with the surface at the bottom edge: `inline-size: 100%; max-inline-size: var(--layout-max-width-prose); margin-inline: auto` and top-only radius, at every width; `height: content` adds `max-block-size: 90dvh` (the `contentCap` constant, `literal-ok` on every platform), and the cap belongs to that value alone — `half` (50dvh) and `full` (calc(100dvh - var(--layout-gutter))) set `block-size` outright and must not be clamped by it, or `full` would stop short of near-full-screen. Pointer Events on the header: track `pointermove` deltaY once past `dragSlop`, translate the surface, and on `pointerup` decide by distance (> 25% of sheet height) or velocity; the body's scroll position is not checked. Padding-bottom adds `env(safe-area-inset-bottom)`.

### Lit
`<ds-bottom-sheet open heading="Filters" height="half">`; shadow `<dialog>` laid out as web, capped and centred at the bottom edge at every width; drag handling as web. Composes `<ds-heading>`, `<ds-button>`, `<ds-icon>`, `<ds-box>` and `<ds-stack>`.

### React Native
`Modal` with `transparent`; surface is an `Animated.View` anchored to the bottom with `translateY` driven by a `PanResponder` on the header; `height` sets the surface height as a fraction of `useWindowDimensions().height`; the body is a `ScrollView` that never starts the gesture — the PanResponder is attached to the header and handle only, so no responder arbitration between the two is needed. Bottom padding includes the safe-area inset. On tablets wider than the `maxWidth` token the surface is capped at the token and centred, still at the bottom edge. `onRequestClose` → `onClose('escape')`.

## Related

Dialog, ActionSheet, Menu, Button.

## Behavior scenarios (11)

One test per scenario, in this order.

```yaml
- name: close-button-fires-on-close
  description: The close button (rendered whenever the sheet is dismissible) requests
    close, as in Dialog.
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
