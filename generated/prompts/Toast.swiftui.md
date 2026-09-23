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
    icon:
      component: Icon
      forwards:
        icon: color
    message:
      component: Text
      props:
        element: span
        size: md
      forwards:
        fontFamily: fontFamily
        fontSize: fontSize
        lineHeight: lineHeight
    actionButton:
      component: Button
      props:
        variant: ghost
        inverse: true
        size: sm
    dismissButton:
      component: Button
      props:
        variant: ghost
        inverse: true
        size: sm
        iconOnly: true
  props:
    message:
      type: string
      required: true
      description: One sentence saying what happened ("Message sent", "3 files deleted").
    tone:
      type: enum
      enumRef: tone
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
        until dismissed. When `actionLabel` is set or `tone` is danger the toast is
        persistent regardless of this prop (a dev warning notes the override only
        when `duration` was passed explicitly as `short` or `long` — on Lit, when
        the property or attribute was assigned; the default never warns. It fires
        each time a change to `duration`, `actionLabel` or `tone` enters that case,
        including when the case already held and `duration` changes between `short`
        and `long`; examples and stories with an action or danger tone pass `persistent`
        or no `duration`, and a story''s shared `meta` args never carry `duration`
        at all, since copying it onto every instance would mark them all as explicitly
        assigned). If motion.duration.loop resolves to 0 or cannot be resolved (no
        theme CSS, jsdom), both durations are treated as persistent. The two durations
        are computed at region mount from the resolved motion.duration.loop (getComputedStyle
        on the region on web/Lit), never hardcoded; a toast rendered outside a region,
        and every toast on native, computes them when it mounts — on native from the
        theme''s token value, which is always a number, so only a resolved 0 reaches
        the persistent fallback.'
    dismissible:
      type: boolean
      default: true
      description: Shows a dismiss button. Persistent toasts are always dismissible.
    toastId:
      type: string
      description: Stable identity; showing a toast with the same toastId replaces
        the previous one instead of stacking (named toastId so it does not collide
        with the DOM `id` on Lit). It never becomes the DOM `id`; on a directly rendered
        Toast outside the region it is accepted and has no effect.
  events:
    onAction:
      description: The action button was activated. The toast dismisses.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
      fires:
      - user
      timing:
        phase: before-change
        before:
        - onDismiss
    onDismiss:
      description: 'The toast left the screen: reason `timeout`, `dismiss-button`,
        `escape`, `action`, `replaced` (a replaced or evicted toast leaves immediately,
        without its exit transition), or `programmatic` (which plays the exit transition
        like every reason but `replaced`). It fires when the toast begins to leave
        — synchronously, at the state change that starts the exit transition, while
        the toast is still connected so on Lit it still bubbles to the region — and
        the element is removed once the transition ends, the same split Popover uses.
        A caller that reacts to the event therefore never waits for `exit`, and the
        reason is known before the animation rather than after it.'
      platforms:
        web: onDismiss
        lit: dismiss
        rn: onDismiss
        swiftui: onDismiss
      payload:
      - name: reason
        type: enum
        values:
        - timeout
        - dismiss-button
        - escape
        - action
        - replaced
        - programmatic
      reasons:
        timeout: the display duration elapsed
        dismiss-button: the dismiss button was activated
        escape: Escape pressed while the toast held focus
        action: the action button was activated
        replaced: the toast was replaced or evicted and left immediately
        programmatic: dismiss(toastId) was called, or dismiss() with no id cleared
          every toast
      fires:
      - user
      - programmatic
      timing:
        phase: after-change
  keyboard:
  - keys:
    - F6
    action: Moves focus into the toast region (the first toast's action or dismiss
      button) from anywhere; F6 again returns to where focus was.
    when: a toast is visible
    from: any
    expect: focus-first
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Escape
    action: Dismisses the focused toast and returns focus.
    when: focus inside a toast
    from: first
    expect: closes
    platforms:
    - web
    - lit
    - swiftui
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
      part: message
      description: Text's `color` is locked and has no inverse tone, so the toast
        re-scopes the foreground on its own `toast` container, not on the message
        part (`--color-foreground` on web and Lit, TextForegroundContext on React
        Native) and composes Text unchanged, as Tooltip does.
      locked: true
    icon:
      token: color.inverse.status.{tone}
      part: icon
      description: '`neutral` renders no icon; the other tones render Icon `name={tone}`
        at its default size, with this token forwarded to Icon''s `overrides.color`,
        using the status step chosen to read on the inverse surface.'
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
      description: 'Between stacked toasts in the region. stackGap, regionInset and
        layer belong to the region (ToastRegion / ds-toast-region / ToastProvider)
        and are overridable through the region''s own `overrides`, not on a toast;
        their CSS hooks keep the toast prefix on web and Lit: `--ds-toast-stack-gap`,
        `--ds-toast-region-inset`, `--ds-toast-layer`. The region''s three keys form
        their own binding group, accepted by the region and absent from a toast''s
        `overrides`; where a platform has only one union (React Native), a standalone
        Toast accepts them and they do nothing.'
      locked: false
    regionInset:
      token: layout.gutter
      part: region
      description: Distance of the region from the viewport edge (bottom-start on
        wide screens, bottom center on phones; on web and Lit plus env(safe-area-inset-bottom)).
        "Wide" is the resolved px of layout.maxWidth.content read from the default
        theme at generation time and marked literal-ok, as Container does, since custom
        properties cannot be used in media queries.
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
      locked: false
    fontFamily:
      token: font.family.body
      description: 'fontFamily, fontSize and lineHeight are forward-only: they reach
        the message Text through its `overrides`, have no `--ds-toast-*` hook, and
        the value (override or this default) is always passed.'
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.min
      description: The minimum block size of the `toast` row, so a toast is never
        shorter than a touch target even with no buttons in it. The action and dismiss
        Buttons size their own targets; Toast never applies this to them.
      locked: true
    layer:
      token: layer.toast
      description: The region's stacking layer — one of the region's three bindings,
        like stackGap and regionInset, and overridable only through the region.
      locked: false
    enter:
      token: motion.duration.base
      description: Rise and fade; instant under reduced motion.
      locked: false
    enterOffset:
      token: space.2
      description: Distance the toast rises during `enter`; none under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      description: 'The reverse of `enter`: sinks by `enterOffset` while fading; instant
        under reduced motion. Resolved at runtime like the two durations, so an override
        is honoured; an unresolvable value (jsdom, no theme CSS) removes the toast
        at once.'
      locked: false
  constants:
    shortDuration:
      description: 'How long a toast with `duration: short` stays before it dismisses
        itself.'
      token: motion.duration.loop
      multiply: 6
      unit: ms
    longDuration:
      description: 'How long a toast with `duration: long` stays before it dismisses
        itself.'
      token: motion.duration.loop
      multiply: 12
      unit: ms
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
      nonText: true
    - foreground: color.inverse.status.{tone}
      background: color.inverse.surface
      level: AA
      nonText: true
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
        in the tree. The exports are `ToastRegion`, `toast` and `dismiss`. A region
        that `toast()` auto-mounts waits one animation frame after it is in the document
        before inserting its first toast, so the empty live region exists first —
        which also means a `dismiss()` in the same tick as the first `toast()` (a
        story or test cleanup) cannot see that toast yet. ToastRegion is the `region`
        part: `data-ds="ToastRegion"`, `data-part="region"`, and one optional prop
        `container` (the element to mount into, default document.body) beside its
        `overrides`. An auto-mounted region gets its own `createRoot` and is client-only,
        so `toast()` is called from an event handler or a task, never from a render
        or an effect body (React warns on the flushSync), and an app that server-renders
        mounts `<ToastRegion>` itself.'
    lit:
      tag: ds-toast
      reflect:
      - tone
      - duration
      notes: 'A <ds-toast-region> element (auto-created in document.body by the `toast()`
        function) holds <ds-toast> children in the light DOM so the live region is
        in the document tree; it is the `region` part, carries `data-part="region"`
        and takes the region''s three overrides. The region sets `role`, `aria-label`
        and `aria-live` as plain attributes on itself, because it has no shadow root
        and tests read them there. A toast is the exception to that rule: its `role`
        and `aria-label` go on the `toast` part inside the shadow root and the host
        keeps only `data-ds`, because the behavior and keyboard gates search the shadow
        root — a role on the host hides every focusable inside it from the keyboard
        gate''s walk. `shadowRootOptions.delegatesFocus` is true so that `focus()`
        on a toast reaches its action button, which the escape scenario needs; the
        sanctioned side effect is that clicking anywhere on the toast focuses that
        button and so pauses the timer. A toast written declaratively in markup (every
        behavior test and the Keyboard story) starts in its entered state, with `enterOffset`
        in `@starting-style`, so anything reading the element before the first frame
        sees it settled rather than at opacity 0. As on web, an auto-created region
        waits one animation frame before its first toast. `dismiss` and `action` are
        composed CustomEvents. Timers pause on pointerenter until pointerleave or
        pointercancel, which covers touch contact.'
    rn:
      element: View
      props:
      - accessibilityLiveRegion
      - accessibilityRole
      notes: 'A ToastProvider mounted once at the app root renders the region as an
        absolutely positioned View (layer.toast zIndex, left/right/bottom at regionInset,
        toasts centered at every width). Core React Native has no safe-area inset
        API and the package takes no dependency, so there is no safe-area term; an
        app that needs one pads the provider. The API is `useToast()` / `toast()`
        returning `Promise<{ reason }>`, and `dismiss(toastId?)`. Timers also pause
        while AppState is not `active` (the native "page hidden"); Button exposes
        no focus events to a composer, so native pauses on touch and backgrounding,
        not focus. `escape` stays in the reason type for cross-platform handlers but
        never fires here; dismissal without Escape is the dismiss button, always shown
        for persistent toasts. The iOS announcement uses announceForAccessibilityWithOptions
        with `queue: true` for polite tones and plain announceForAccessibility (interrupting)
        for danger. The actionButton and dismissButton parts are wrapping Views that
        carry the testIDs. The root is an `Animated.View` — the declared `View` element
        plus the enter/exit animation — carrying testID "Toast". The region View takes
        accessibilityLabel from `copy.regionLabel` and `role="region"` (React Native''s
        `role` prop, which does have it), matching web and Lit: under react-native-web
        an aria-label on a role-less div is an axe `aria-prohibited-attr` failure,
        and an empty region is the state the region is documented to be in before
        any toast. The toast root keeps `accessibilityRole="alert"` for danger and
        no role otherwise, since `accessibilityRole` has no `status` value and the
        `danger-toasts-are-announced-assertively` scenario reads that prop; the root
        is not marked `accessible`, which would swallow the action and dismiss Buttons,
        so a VoiceOver user hears its `accessibilityLabel` and then the message Text.
        The message Text receives only `size: md`, since React Native Text has no
        `element`. The dismiss Button''s `close` Icon gets `overrides.color` color.inverse.link
        (dismissColor), because native has no currentColor. Android: accessibilityLiveRegion="polite"
        (danger: "assertive"); iOS: AccessibilityInfo.announceForAccessibility on
        show. Timers pause while a toast is being touched, through `onTouchStart`/`onTouchEnd`/`onTouchCancel`
        on the toast root — not a `Pressable` wrapper, which would make the whole
        toast a press target and take the press from the action and dismiss Buttons;
        touches landing on a Button still reach the root handlers. Only toasts the
        provider itself marked exiting are excluded from the three that stack: a toast''s
        exit is Animated state the provider cannot see, so one that is timing out
        still counts until it reports `onDismiss`. No F6; toasts are reached by swiping
        through the accessibility order. Android''s native ToastAndroid is not used,
        so actions and theming work. React Native has no `status` role: danger toasts
        use accessibilityRole="alert", others no role, with accessibilityLiveRegion
        (assertive/polite) and a one-time AccessibilityInfo announcement. Timers pause
        while a toast is touched; F6 and Escape have no native equivalent.'
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
  behavior:
  - name: the-dismiss-button-fires-on-dismiss
    given:
      dismissible: true
    when:
      click: dismissButton
    then:
    - event: onDismiss
  - name: the-action-button-fires-on-action
    description: The single action reports and the toast dismisses; onAction is fired
      before onDismiss.
    given:
      actionLabel: Undo
    when:
      click: actionButton
    then:
    - event: onAction
  - name: escape-dismisses-the-focused-toast
    description: Keyboard users reach a toast with F6 and leave with Escape, so an
      Undo is never pointer-only (keyboard rule 2). Escape acts only with focus inside
      a toast, so the test focuses the dismiss button first.
    when:
      key: Escape
    then:
    - event: onDismiss
    platforms:
    - web
    - lit
  - name: danger-toasts-are-announced-assertively
    description: A danger toast uses role alert rather than status, so it interrupts
      (WCAG 4.1.3).
    given:
      tone: danger
    then:
    - role: alert
  - name: the-message-is-rendered
    description: The message is the whole of a toast's content — one short sentence
      saying what happened.
    given:
      message: 3 files moved to Archive
    then:
    - text: 3 files moved to Archive
  examples:
  - name: undo-a-delete
    description: The reason most reversible actions need no AlertDialog; an action
      makes the toast persistent.
    given:
      message: 3 files moved to Archive
      actionLabel: Undo
      duration: persistent
  - name: saved
    description: The plain confirmation of something the user did not have to watch.
    given:
      message: Changes saved
      tone: success
  - name: background-result
    description: A result that arrived on its own, with one way to look at it.
    given:
      message: Export ready
      actionLabel: View
  - name: failed-upload
    description: A danger toast, persistent so nobody misses the one they needed.
    given:
      message: Upload failed
      tone: danger
      actionLabel: Retry
      duration: persistent
```

## Events

- `onAction`: emit `onAction`
  - fires on: user
  - timing: before-change, fired before `onDismiss`
- `onDismiss`: emit `onDismiss`
  - payload, positional, in this order: `reason: 'timeout' | 'dismiss-button' | 'escape' | 'action' | 'replaced' | 'programmatic'`
  - reasons: `timeout` (the display duration elapsed); `dismiss-button` (the dismiss button was activated); `escape` (Escape pressed while the toast held focus); `action` (the action button was activated); `replaced` (the toast was replaced or evicted and left immediately); `programmatic` (dismiss(toastId) was called, or dismiss() with no id cleared every toast)
  - fires on: user, programmatic
  - timing: after-change

## Parts and slots

- `region`: element
- `toast`: element
- `icon`: component `Icon`; forwards `icon` → `overrides.color`
- `message`: component `Text`; props `element` = "span", `size` = "md"; forwards `fontFamily` → `overrides.fontFamily`, `fontSize` → `overrides.fontSize`, `lineHeight` → `overrides.lineHeight`
- `actionButton`: component `Button`; props `variant` = "ghost", `inverse` = true, `size` = "sm"
- `dismissButton`: component `Button`; props `variant` = "ghost", `inverse` = true, `size` = "sm", `iconOnly` = true

## Style bindings

- `text`: token `color.inverse.foreground`; part `message`; locked
- `icon`: token `color.inverse.status.{tone}`; part `icon`; locked
- `regionInset`: token `layout.gutter`; part `region`

## Keyboard

- `F6` (Moves focus into the toast region (the first toast's action or dismiss button) from anywhere; F6 again returns to where focus was.): expect focus-first
- `Escape` (Dismisses the focused toast and returns focus.): expect closes
- `Tab` (Moves between the action and dismiss buttons, then out of the region.): expect focus-next

## Constants and examples

- constant `shortDuration`: `theme.motionDurationLoop * 6` (`motion.duration.loop` × 6) ms
- constant `longDuration`: `theme.motionDurationLoop * 12` (`motion.duration.loop` × 12) ms
- example `undo-a-delete`, story `UndoADelete`: given `message: "3 files moved to Archive"`, `actionLabel: "Undo"`, `duration: "persistent"`; The reason most reversible actions need no AlertDialog; an action makes the toast persistent.
- example `saved`, story `Saved`: given `message: "Changes saved"`, `tone: "success"`; The plain confirmation of something the user did not have to watch.
- example `background-result`, story `BackgroundResult`: given `message: "Export ready"`, `actionLabel: "View"`; A result that arrived on its own, with one way to look at it.
- example `failed-upload`, story `FailedUpload`: given `message: "Upload failed"`, `tone: "danger"`, `actionLabel: "Retry"`, `duration: "persistent"`; A danger toast, persistent so nobody misses the one they needed.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `radius`, `shadow`, `paddingBlock`, `paddingInline`, `gap`, `stackGap`, `regionInset`, `maxWidth`, `fontFamily`, `fontSize`, `lineHeight`, `layer`, `enter`, `enterOffset`, `exit`
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

Toasts are shown through an imperative call, since a notification is an event: `toast({ message, tone, actionLabel, duration, dismissible, toastId, onAction })`, which returns a promise resolving to `{ reason }` when the toast leaves; `dismiss(toastId)` exported beside it removes one toast, and `dismiss()` with no id clears them all (stories call it on cleanup), both with reason `programmatic`. Each appears in the notification region, is announced politely (assertively for `danger`), and dismisses after `duration`, when its action is used, when dismissed, or when a toast with the same `toastId` replaces it. Timers pause while the toast is hovered, focused or touched, and while the page is hidden. Focus never moves to a toast on its own; F6 brings it there when the user wants it, and Escape, the dismiss button or the action sends it back: to the element focus came from when it entered the region (by F6 or by Tab), or, if that element is gone, to the next focusable element after the region (the previous one if there is none), found with FocusScope's focusable walker so it descends open shadow roots. The same restore runs whenever a toast holding focus leaves for any reason, including `replaced` and `programmatic`; with no recorded origin at all — a toast that simply happened to hold focus when it timed out — the same next-then-previous focusable fallback applies. The origin is one per document, recorded on each entry into a region and overwritten by the next, so with two regions on a page the last entry wins. Because a `replaced` toast leaves at once with no exit transition, its restore runs at unmount and only while focus is still inside the toast or has already fallen to the body, so a normal dismissal (which restores first) never restores twice. Up to three toasts stack, newest at the bottom at every width; a toast already in its exit transition does not count toward the three; three is a fixed count, not a token. Toast exposes no `ref` on any platform: toasts are created by `toast()`, not placed by callers. That overrides the standing rule that a component rendering a root element declares one.

The `Keyboard` story cannot satisfy the usual "at least three focusable children" with one toast, whose only focusables are the action and dismiss buttons. It renders a trigger button plus two persistent action toasts — the second with `tone: danger`, so it announces as `role="alert"` and exactly one `role="status"` toast exists for a locator to resolve to — giving four focus stops. The action Button's label, the dismiss Button's label and glyph, and both press handlers are data every platform passes, not composition props. The `actionButton` and `dismissButton` parts are wrappers the toast owns around each Button, since Button keeps its own `data-part`; the action Button's label is `actionLabel`, and the dismiss Button's label is `copy.dismissLabel` with the system Icon `close` as its glyph.

## Content guidelines

Messages are one short sentence in the past tense saying what happened, without exclamation ("Message sent", "Link copied", "3 files moved to Archive"). The action is one word when possible ("Undo", "View", "Retry"). No titles, no icons other than the tone's, no links in the message.

## Accessibility

The region is a landmark-like container with an accessible name and `aria-live="polite"` that exists before any toast, so each toast is announced as a status message without moving focus (WCAG 4.1.3, 3.2.1); `danger` toasts use `alert`. Anything with a time limit must be pausable or long enough (2.2.1): timers pause on hover, focus and touch, action toasts are persistent, and durations are never under five seconds. Keyboard users reach toasts with F6 and leave with Escape or Tab (2.1.1), so an Undo is never pointer-only. Text, action and icon meet contrast on the inverted surface in both modes; the build checks them. Motion respects reduced-motion.

## Platform notes

### Web
Export `toast(options)` and a `<ToastRegion>` that the app mounts once (or is auto-mounted on first call). Region: `<div role="region" aria-label={copy.regionLabel} aria-live="polite">` fixed at `inset-block-end: var(--layout-gutter)`, `inset-inline-start` on wide screens and centered below the content measure, `z-index: var(--layer-toast)`. Toast: `<div role={tone === 'danger' ? 'alert' : 'status'}>` with `<Icon name={tone}>`, the message, `<Button variant="ghost" inverse size="sm">` for the action, and the dismiss Button (`iconOnly`, `copy.dismissLabel`). Pause timers on `pointerenter`, `focusin` and `visibilitychange`. Document-level `keydown` for F6 toggles focus between the region and the previously focused element.

### Lit
`toast()` creates `<ds-toast-region>` in `document.body` if absent and appends `<ds-toast>` elements as light-DOM children; the region sets `role="region"`, `aria-label` and `aria-live` as plain attributes. Composed `action` and `dismiss` events bubble to the region for the imperative API's promise.

### React Native
`ToastProvider` at the root renders the region `View` with `zIndex: layerToast`, `position: 'absolute'`, `left`, `right` and `bottom` at `regionInset`, and exposes `useToast()` / `toast()` / `dismiss()`. Each toast `View` has `accessibilityLiveRegion` (Android) and triggers `announceForAccessibility` (iOS) on mount; touch handlers on the toast root pause timers while it is touched. The action is the system `Button` (`ghost`, `sm`), the dismiss is `Button iconOnly` with `Icon name="close"`.

## Related

Alert, AlertDialog, Button, Icon.

## Behavior scenarios (13)

One test per scenario, in this order.

```yaml
- name: the-dismiss-button-fires-on-dismiss
  given:
    dismissible: true
  when:
    click: dismissButton
  then:
  - event: onDismiss
- name: the-action-button-fires-on-action
  description: The single action reports and the toast dismisses; onAction is fired
    before onDismiss.
  given:
    actionLabel: Undo
  when:
    click: actionButton
  then:
  - event: onAction
- name: danger-toasts-are-announced-assertively
  description: A danger toast uses role alert rather than status, so it interrupts
    (WCAG 4.1.3).
  given:
    tone: danger
  then:
  - role: alert
- name: the-message-is-rendered
  description: The message is the whole of a toast's content — one short sentence
    saying what happened.
  given:
    message: 3 files moved to Archive
  then:
  - text: 3 files moved to Archive
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
