# Generate: BottomSheet for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/BottomSheet.tsx` exporting a typed React Native function component named `BottomSheet`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `BottomSheetProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger and at least three focusable children, for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof BottomSheet> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `BottomSheet.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
      description: 'Escape, the close button, a scrim tap and the drag gesture all
        request close. When false, only the footer actions close it, as in Dialog:
        the close button and the drag handle are not rendered, a scrim tap and a drag
        do nothing, and Escape still reports with reason `escape`. The wide Dialog
        presentation receives the same value.'
    dragToDismiss:
      type: boolean
      default: true
      description: 'Drag the handle (or the header) downward to dismiss: release past
        25% of the sheet height, or faster than 1.5 px/ms, dismisses; otherwise the
        sheet springs back. The dismiss then plays the normal exit transition (no
        momentum physics). The body ScrollView does not start the gesture; only the
        handle and header do, whatever the body''s scroll position, and only once
        the pointer has moved `dragSlop` downward, so a tap on the close button still
        activates it. Purely additive: Escape always exists, and the close button
        exists whenever the gesture does (both need `dismissible`). The handle is
        rendered only when `dragToDismiss` and `dismissible` are both true, so there
        is no drag affordance where dragging does nothing.'
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
    handleRadius:
      token: radius.full
      part: handle
      description: Rounds the handle into a pill.
      locked: false
    headerPaddingTop:
      token: space.sm
      part: header
      description: Block-start padding of the header, above the handle. When the handle
        is not rendered the header's block-start padding is `inset` instead; its inline
        padding is always `inset`.
      locked: false
    handleGap:
      token: layout.gap.tight
      part: header
      description: Between the handle and the heading row.
      locked: false
    headerGap:
      token: layout.gap.normal
      part: header
      description: Between the heading and the close button, as Dialog's headerGap.
      locked: false
    inset:
      token: layout.inset.lg
      description: Inline padding of header, body and footer, and block-end padding
        of the last part; that block-end padding adds the bottom safe-area inset below
        the breakpoint.
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
      locked: true
      description: 'The breakpoint only — the sheet is full width below it, so the
        value styles nothing. The breakpoint is read from the theme token, not per
        instance. Above this viewport width (`(width > token)`; exactly the token
        width is still a sheet; rn: window width <= token is a sheet) the sheet renders
        as a centered Dialog of size md instead of rising from the edge.'
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
        (web/Lit: a click on the wrapper outside the Button clicks it; rn: the wrapper
        View takes the min size and the Button''s hitSlop covers it). The Button keeps
        its own size variant and colors.'
      locked: true
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
        travelled. Measured between the last two move samples before release; only
        downward speed counts.
      value: 1.5
      unit: px/ms
    dragSlop:
      description: Downward distance a pointer must move on the handle or header before
        the drag claims it, so a tap on the close button still activates it.
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
      notes: 'The same native <dialog> as Dialog, positioned at the bottom edge with
        inset-block-end: 0 and full width below the maxWidth token; above it, the
        generator renders Dialog directly (composition, not duplication). Drag uses
        Pointer Events on the handle/header with setPointerCapture; the handle is
        aria-hidden and not focusable. Safe-area padding via env(safe-area-inset-bottom).
        Button, Heading and Stack write their own data-part, so the closeButton part
        is the sheet-owned wrapper around the Button. In the wide presentation the
        root is Dialog''s own <dialog> (its hooks, not a BottomSheet wrapper), and
        `ref` resolves to that <dialog>; below the breakpoint `ref` resolves to the
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
      notes: Shadow <dialog> with showModal(); a matchMedia listener on the maxWidth
        token switches between sheet and dialog presentation. `close` and `drag-dismiss`
        are composed CustomEvents. The host is `ds-bottom-sheet` in both presentations;
        above the breakpoint the shadow root holds a `<ds-dialog>`, which renders
        nothing while closed so its exit transition can play, and its `opened` event
        is stopped at the sheet.
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
        present as Dialog, rendered alone with no wrapping View (a View around a Modal
        would take layout space in the caller''s tree), so the root testID there is
        Dialog''s; the sheet''s testIDs and scenarios apply at window width <= the
        token, and tests set a phone-sized window. The bottom inset comes from SafeAreaView
        on iOS; React Native core has no safe-area API on Android and no dependency
        is added, so Android adds no inset — the Modal is not navigationBarTranslucent,
        so its window already ends above the system navigation bar and the footer
        stays reachable. The closeButton part is a wrapping View with `testID="BottomSheet.closeButton"`
        sized to minTarget, the Button''s hitSlop covering the extra area. The Modal
        is its own window, so no ref is exposed; callers ref their trigger. This is
        the mobile-first overlay: on phones prefer it to Dialog for anything the thumb
        should reach. The surface carries the RN >= 0.74 `role="dialog"` prop alongside
        accessibilityViewIsModal, as Dialog does; the legacy accessibilityRole union
        has no dialog value. Scroll lock has no native meaning — a Modal has no page
        behind it to scroll — and is not implemented. With no `initialFocus` prop,
        focus on open is FocusScope''s `autoFocus="first"`, which on native lands
        on the scope wrapper rather than a real first control; that is FocusScope''s
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

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `shadow`: token `shadow.overlay`; part `surface`
- `handle`: token `color.foreground.muted`; part `handle`; locked
- `handleHeight`: token `space.1`; part `handle`
- `handleWidth`: token `space.10`; part `handle`
- `handleRadius`: token `radius.full`; part `handle`
- `headerPaddingTop`: token `space.sm`; part `header`
- `handleGap`: token `layout.gap.tight`; part `header`
- `headerGap`: token `layout.gap.normal`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `minTarget`: token `size.target.comfortable`; part `closeButton`; locked

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
- constant `dragSlop`: `t.space1` (`space.1`) px
- example `filters`, story `Filters`: given `open: true`, `heading: "Filters"`, `children: "A Form of filter controls"`, `footer: "Clear and Apply Buttons"`; The phone presentation of a filter panel, with the action row pinned at the bottom.
- example `half-height-results`, story `HalfHeightResults`: given `open: true`, `heading: "Nearby places"`, `children: "A scrolling list of results"`, `height: "half"`; A browsable list where seeing the page behind matters, so the sheet stops at half height.
- example `share-sheet`, story `ShareSheet`: given `open: true`, `heading: "Share to"`, `children: "A row of share targets"`, `hideHeading: true`; A self-explanatory body whose title exists only for assistive technology.
- example `full-screen-task`, story `FullScreenTask`: given `open: true`, `heading: "New expense"`, `children: "A Form of a few fields"`, `footer: "Cancel and Save Buttons"`, `height: "full"`, `dragToDismiss: false`; A task that needs the whole screen but should still feel dismissable, with the gesture off.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `scrim`, `shadow`, `radius`, `handleHeight`, `handleWidth`, `handleRadius`, `headerPaddingTop`, `handleGap`, `headerGap`, `inset`, `partGap`, `footerGap`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `handle`, `maxWidth`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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
```

## Platform notes (rn)

```yaml
element: Modal
props:
- visible
- transparent
- onRequestClose
- statusBarTranslucent
- accessibilityViewIsModal
notes: "Native Modal with an Animated.View surface translated from the bottom; PanResponder\
  \ (or the platform gesture handler if the app already has it \u2014 not a new dependency)\
  \ on the header for drag; onRequestClose \u2192 escape. Safe area via SafeAreaView\
  \ / the bottom inset. On tablets above the maxWidth token, present as Dialog, rendered\
  \ alone with no wrapping View (a View around a Modal would take layout space in\
  \ the caller's tree), so the root testID there is Dialog's; the sheet's testIDs\
  \ and scenarios apply at window width <= the token, and tests set a phone-sized\
  \ window. The bottom inset comes from SafeAreaView on iOS; React Native core has\
  \ no safe-area API on Android and no dependency is added, so Android adds no inset\
  \ \u2014 the Modal is not navigationBarTranslucent, so its window already ends above\
  \ the system navigation bar and the footer stays reachable. The closeButton part\
  \ is a wrapping View with `testID=\"BottomSheet.closeButton\"` sized to minTarget,\
  \ the Button's hitSlop covering the extra area. The Modal is its own window, so\
  \ no ref is exposed; callers ref their trigger. This is the mobile-first overlay:\
  \ on phones prefer it to Dialog for anything the thumb should reach. The surface\
  \ carries the RN >= 0.74 `role=\"dialog\"` prop alongside accessibilityViewIsModal,\
  \ as Dialog does; the legacy accessibilityRole union has no dialog value. Scroll\
  \ lock has no native meaning \u2014 a Modal has no page behind it to scroll \u2014\
  \ and is not implemented. With no `initialFocus` prop, focus on open is FocusScope's\
  \ `autoFocus=\"first\"`, which on native lands on the scope wrapper rather than\
  \ a real first control; that is FocusScope's own documented limit and the screen\
  \ reader reads the sheet from the top, which is the intended result anyway."
```

## Guidance

## Overview

A bottom sheet is the phone's dialog. It rises from the edge the thumb can reach, keeps the page visible behind a scrim so the user knows where they are, and goes away with a swipe, a tap outside, or a close button. On a wide screen the same content is a Dialog; the component decides which, so screens are written once.

## When to use

Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog: filters, a form of a few fields, details of a selected item, a picker with many options. Use `height: content` by default; `full` for a task that needs the whole screen but should still feel dismissable; `half` for a browsable list where seeing the page behind matters (a map with results). For a flat list of actions, ActionSheet is the lighter component.

## When not to use

Do not use a BottomSheet as a menu (ActionSheet or Menu), as a persistent panel (a bottom Landmark region), or for content the user must read at length (a page). Do not stack sheets. Do not rely on the drag gesture to teach dismissal; the close button is visible on every dismissible sheet.

## Behavior

Opening slides the sheet up and fades the scrim; focus moves to the first control or the title; the page behind is inert and its scroll locked. The body scrolls within the sheet; a downward drag on the handle or header (never the body, whatever its scroll position) begins the dismiss gesture, and releasing past the threshold or with enough velocity fires `onDragDismiss` then `onClose('drag')` — otherwise the sheet springs back. After a drag dismiss the sheet holds the release position until the consumer's update renders: `open` false plays the exit from there; `open` still true springs the sheet back to rest. Escape, the close button and a scrim tap request close as in Dialog. The sheet never raises `action` itself; a consumer's footer action may call the same `onClose` handler with it. The `overlay.dismiss` values are the shared category vocabulary; the event's reasons are what fires: `escape`, `scrim` and `close-button` are reported as themselves, and `swipe` is reported as `drag`. The sheet is controlled only; Gate and Keyboard stories that need it open render through a wrapper that owns `open` (starting true) and writes `onClose` back, acting as the consumer. Above the `maxWidth` breakpoint the sheet presents as a centered Dialog of size md with the same props and events, so code does not branch on device. In the wide presentation the same props are forwarded to Dialog — `heading`, `hideHeading` (Dialog has it for this reason), `dismissible`, `footer` — and every override whose binding shares a name with a Dialog binding (`scrim`, `surface`, `shadow`, `radius`, `inset`, `partGap`, `headerGap`, `footerGap`, `layer`, `enter`, `exit`, `focusRing`, `focusRingWidth`) is forwarded to Dialog's `overrides`; the rest (the handle bindings, `headerPaddingTop`, `handleGap`, `maxWidth`, `minTarget`) have no effect there. Dialog's `onOpened` is not re-emitted, since BottomSheet has no such event. In the wide presentation BottomSheet renders Dialog directly, so the root carries Dialog's own hooks and a closed sheet renders nothing in both presentations; the sheet's part hooks and authored scenarios apply below the breakpoint. Crossing the breakpoint while open swaps presentation on the next render without an animated hand-off; focus and scroll lock are re-established by the new surface. Initial focus is the first focusable in the body, then in the footer, then the close button, then the heading, which takes `tabindex="-1"` for the purpose; there is no `initialFocus` prop.

## Content guidelines

Titles name the task or the thing ("Filters", "Share to"). Footer actions follow Form's order. Sheets with a self-explanatory body (a share row of icons) may `hideHeading`, but the title text still exists for screen readers.

## Accessibility

Role `dialog`, `aria-modal`, named by the title even when visually hidden (WCAG 4.1.2). Focus trap, restore, Escape and inert background as in Dialog. The drag gesture is an addition: every sheet the gesture can dismiss can also be closed with a single pointer activation on the close button, and every sheet with Escape (2.5.1 Pointer Gestures; gesture-alternative). The handle is decorative and skipped by keyboard and assistive technology. Touch targets in the sheet reach 44px (target-44px) because sheets are used one-handed. Motion respects reduced-motion; the drag-follow still tracks the finger, since it is user-driven, but the release animation is instant.

## Platform notes

### Web
Below the `maxWidth` breakpoint (a media query `(width > <resolved token>)` for the wide presentation, `literal-ok`), render the native `<dialog>` with `position: fixed; inset-block-end: 0; inline-size: 100%` and top-only radius; `height: content` adds `max-block-size: 90dvh`, and the cap belongs to that value alone — `half` (50dvh) and `full` (calc(100dvh - var(--layout-gutter))) set `block-size` outright and must not be clamped by it, or `full` would stop short of near-full-screen. Above it, render `<Dialog size="md">` with the same children. Pointer Events on the header: track `pointermove` deltaY once past `dragSlop`, translate the surface, and on `pointerup` decide by distance (> 25% of sheet height) or velocity; the body's scroll position is not checked. Padding-bottom adds `env(safe-area-inset-bottom)`.

### Lit
`<ds-bottom-sheet open heading="Filters" height="half">`; shadow `<dialog>`; `matchMedia` decides presentation and re-renders on change; drag handling as web. Composes `<ds-heading>`, `<ds-button>`, `<ds-icon>`, `<ds-box>`, `<ds-stack>`, and `<ds-dialog>` for the wide presentation.

### React Native
`Modal` with `transparent`; surface is an `Animated.View` anchored to the bottom with `translateY` driven by a `PanResponder` on the header; `height` sets the surface height as a fraction of `useWindowDimensions().height`; the body is a `ScrollView` that never starts the gesture — the PanResponder is attached to the header and handle only, so no responder arbitration between the two is needed. Bottom padding includes the safe-area inset. On tablets wider than the `maxWidth` token, render `Dialog`. `onRequestClose` → `onClose('escape')`.

## Related

Dialog, ActionSheet, Menu, Button.
