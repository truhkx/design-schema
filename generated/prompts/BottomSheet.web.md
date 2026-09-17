# Generate: BottomSheet for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/BottomSheet.tsx` exporting a typed React function component named `BottomSheet`, plus `BottomSheet.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function BottomSheet({ ref, …rest }: BottomSheetProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
- Render the element and attributes declared under `platforms.web`. Map each event to its `platforms.web` name.
- Style ONLY through the CSS custom properties generated from tokens (`--color-…`, `--space-…`, `--font-…`, `--radius-…`). Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `var(--color-action-${variant}-background)`.
- Implement every item in `a11y.requires`:
  - `accessible-name`: the `label` prop is rendered as visible text or `aria-label`; never both empty.
  - `focus-visible`: a `:focus-visible` outline using `--color-border-focus` and `--border-width-focus`. Never remove the outline without replacing it.
  - `keyboard-operable`: native element semantics (do not build interactive elements from `<div>`).
  - `target-24px` / `target-44px`: `min-inline-size`/`min-block-size` from `--size-target-min` / `--size-target-comfortable`.
  - `heading-hierarchy`: render the heading level as the matching `<h1>`–`<h6>`; do not pick the element by visual size.
- `disabled` uses `aria-disabled="true"` and keeps the element focusable (WCAG-friendly) unless the schema says otherwise. On native checkable inputs (checkbox, radio, switch) `readOnly` has no effect, so guard with `preventDefault()` in both `click` and `change`.
- Visually hidden text (for accessible-name suffixes) uses the standard clip pattern — absolute, 1px box, `clip-path: inset(50%)`, `white-space: nowrap` — the one sanctioned use of pixel literals.
- Support light and dark by relying on the token variables only — no theme logic in the component.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard` and are removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children, no decorators that add other focusable elements.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system component. Overlays: render into a portal at `document.body` (a `container` prop may override), lock body scroll while open, make the rest of the page `inert` for modal dialogs (`focus-trap` + `inert-background`), restore focus to the opener on close (`focus-restore`), position non-modal popups with `position: fixed` from the trigger's `getBoundingClientRect()` and flip when they would overflow the viewport, and put them on the right stacking layer with `z-index: var(--layer-<name>)`.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`; title `'<Name>/React'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof BottomSheet> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `BottomSheet.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for web; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false` or calls `preventDefault()` on the event it receives. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element), only in its `state` (`:hover`, `:focus-visible`, the ARIA state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development naming `use`.
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
        with no visible heading, no handle and no close button is not rendered (the
        visually hidden heading on web then sits at the start of the column).
      locked: false
    inset:
      token: layout.inset.lg
      description: 'Inline padding of every part: the header and footer wrappers apply
        it themselves and the body Box receives it as `overrides.paddingInline` (its
        block padding stays zero). The block edges are padded once, on the column
        that holds header, body and footer (the surface): padding-block-start `inset`
        (`headerPaddingTop` when the handle is rendered) and padding-block-end `inset`,
        plus the bottom safe-area inset below the breakpoint. No part has block padding
        of its own, so nothing doubles.'
      locked: false
    partGap:
      token: layout.gap.loose
      description: 'The only space between header, body and footer: the flex gap of
        the column.'
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
      locked: true
      description: 'The breakpoint only — the sheet is full width below it, so the
        value styles nothing. The breakpoint is read from the theme token, not per
        instance. Above this viewport width (`(width > token)`; exactly the token
        width is still a sheet; rn: window width <= token is a sheet) the sheet renders
        as a centered Dialog of size md instead of rising from the edge. Web and Lit
        choose the presentation in script: the resolved `--layout-max-width-prose`
        is read from the document root''s computed style and passed to `matchMedia(''(width
        > <value>)'')` (the value is `literal-ok`), re-evaluated on change; when the
        token does not resolve (no theme stylesheet, jsdom, SSR) the sheet presentation
        renders.'
    layer:
      token: layer.sheet
      description: 'Has no effect inside the browser top layer or a native Modal window;
        applies to the non-top-layer fallback (position: fixed) and the rn anchor
        view. The wide Dialog presentation keeps its own `layer.dialog`; only a `layer`
        override is forwarded to it.'
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
        View takes the min size and the Button''s hitSlop covers it). The Button keeps
        its own size variant (ghost, sm, icon-only, as in Dialog) and colors.'
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
        travelled. Measured between the last two move samples before release using
        the event timestamps (web/Lit `event.timeStamp`, rn `nativeEvent.timestamp`);
        only downward speed counts. A documented constant with no token (`literal-ok`).
      value: 1.5
      unit: px/ms
    dragSlop:
      description: 'Downward distance a pointer must move on the handle or header
        before the drag claims it, so a tap on the close button still activates it.
        Past the slop the header takes the move over from a child it started on (the
        heading or the close button): web/Lit setPointerCapture on the header, rn
        onMoveShouldSetPanResponderCapture; the drag offset counts from where the
        slop was crossed. The length is read at gesture start from the resolved `--space-1`
        custom property and converted to px (rem × root font size); rn uses the resolved
        token number. On web and Lit an unresolvable value counts as 0.'
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
        The <dialog> fills the viewport with a transparent ::backdrop and the scrim
        is a real `data-part="scrim"` element inside it, as in Dialog; a scrim dismiss
        is a `click` whose target is that element. Button, Heading and Stack write
        their own data-part, so the heading, closeButton and footer parts are sheet-owned
        wrappers around them; the body Box takes its data-part directly. `container`
        (the portal target every portaled overlay accepts, not a schema prop) is passed
        through to Dialog in the wide presentation. In the wide presentation the root
        is Dialog''s own <dialog> (its hooks, not a BottomSheet wrapper), and `ref`
        resolves to that <dialog>; below the breakpoint `ref` resolves to the sheet''s
        <dialog>, null while closed.'
    lit:
      tag: ds-bottom-sheet
      reflect:
      - open
      - height
      - prop: dismissible
        attribute: no-dismiss
      - prop: dragToDismiss
        attribute: no-drag-to-dismiss
      notes: 'Shadow <dialog> with showModal(); a matchMedia listener on the maxWidth
        token switches between sheet and dialog presentation. `close` and `drag-dismiss`
        are composed CustomEvents. The host is `ds-bottom-sheet` in both presentations;
        above the breakpoint the shadow root holds a `<ds-dialog>`, which renders
        nothing while closed so its exit transition can play, and its `opened` event
        is stopped at the sheet. The `footer` slot is forwarded into `<ds-dialog>`
        only when the sheet has footer children, so a sheet with no footer gets no
        empty footer part. Below the breakpoint every composed part (heading, closeButton,
        body, footer) is a sheet-owned wrapper element carrying `data-part`, holding
        the `<ds-heading>`, `<ds-button>`, `<ds-box>` or `<ds-stack>`: ds-box overwrites
        its own data-part with `surface` and the other ds-* hosts carry none. Accessible
        name: the shadow <dialog> carries aria-label from the heading text, never
        aria-labelledby, as ds-dialog.'
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
        on iOS: an empty SafeAreaView as the last child of the surface column, after
        the last part, so the only edge it adds is its bottom-edge padding as height
        (SafeAreaView is deprecated in core since 0.81 but is still the only core
        source, and no dependency is added). `height` on rn: `half` is window height
        × 0.5 and `full` is window height minus `layout.gutter`, as web''s 50dvh and
        100dvh - gutter; on Android with statusBarTranslucent `full` subtracts the
        larger of the gutter and `StatusBar.currentHeight`. iOS core exposes no status-bar
        height, so on a notched iPhone a `full` sheet can reach under the status bar
        when the gutter is smaller; Escape (the VoiceOver two-finger scrub) still
        closes and the footer actions stay reachable. React Native core has no safe-area
        API on Android and no dependency is added, so Android adds no inset — the
        Modal is not navigationBarTranslucent, so its window already ends above the
        system navigation bar and the footer stays reachable. The closeButton part
        is a wrapping View with `testID="BottomSheet.closeButton"` sized to minTarget,
        the Button''s hitSlop covering the extra area. The Modal is its own window,
        so no ref is exposed; callers ref their trigger. This is the mobile-first
        overlay: on phones prefer it to Dialog for anything the thumb should reach.
        The surface carries the RN >= 0.74 `role="dialog"` prop alongside accessibilityViewIsModal,
        as Dialog does; the legacy accessibilityRole union has no dialog value. Scroll
        lock has no native meaning — a Modal has no page behind it to scroll — and
        is not implemented. With no `initialFocus` prop, focus on open is FocusScope''s
        `autoFocus="first"`, which on native lands on the scope wrapper rather than
        a real first control; that is FocusScope''s own documented limit and the screen
        reader reads the sheet from the top, which is the intended result anyway.'
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
- `heading`: component `Heading`
- `body`: component `Box`; forwards `inset` → `overrides.paddingInline`
- `footer`: component `Stack`; props `direction` = "horizontal", `justify` = "end"; forwards `footerGap` → `overrides.gap`
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
- constant `dragSlop`: `var(--space-1)` (`space.1`) px
- example `filters`, story `Filters`: given `open: true`, `heading: "Filters"`, `children: "A Form of filter controls"`, `footer: "Clear and Apply Buttons"`; The phone presentation of a filter panel, with the action row pinned at the bottom.
- example `half-height-results`, story `HalfHeightResults`: given `open: true`, `heading: "Nearby places"`, `children: "A scrolling list of results"`, `height: "half"`; A browsable list where seeing the page behind matters, so the sheet stops at half height.
- example `share-sheet`, story `ShareSheet`: given `open: true`, `heading: "Share to"`, `children: "A row of share targets"`, `hideHeading: true`; A self-explanatory body whose title exists only for assistive technology.
- example `full-screen-task`, story `FullScreenTask`: given `open: true`, `heading: "New expense"`, `children: "A Form of a few fields"`, `footer: "Cancel and Save Buttons"`, `height: "full"`, `dragToDismiss: false`; A task that needs the whole screen but should still feel dismissable, with the gesture off.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `radius`, `handleHeight`, `handleWidth`, `handleRadius`, `headerPaddingTop`, `handleGap`, `headerGap`, `inset`, `partGap`, `footerGap`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `handle`, `maxWidth`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (12)

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
- name: non-dismissible-still-reports-escape
  description: With `dismissible` false only the footer actions close the sheet, and
    Escape still reports.
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

## Platform notes (web)

```yaml
element: dialog
attributes:
- aria-modal
- aria-labelledby
notes: 'The same native <dialog> as Dialog, positioned at the bottom edge with inset-block-end:
  0 and full width below the maxWidth token; above it, the generator renders Dialog
  directly (composition, not duplication). Drag uses Pointer Events on the handle/header
  with setPointerCapture; the handle is aria-hidden and not focusable. Safe-area padding
  via env(safe-area-inset-bottom). The <dialog> fills the viewport with a transparent
  ::backdrop and the scrim is a real `data-part="scrim"` element inside it, as in
  Dialog; a scrim dismiss is a `click` whose target is that element. Button, Heading
  and Stack write their own data-part, so the heading, closeButton and footer parts
  are sheet-owned wrappers around them; the body Box takes its data-part directly.
  `container` (the portal target every portaled overlay accepts, not a schema prop)
  is passed through to Dialog in the wide presentation. In the wide presentation the
  root is Dialog''s own <dialog> (its hooks, not a BottomSheet wrapper), and `ref`
  resolves to that <dialog>; below the breakpoint `ref` resolves to the sheet''s <dialog>,
  null while closed.'
```

## Guidance

## Overview

A bottom sheet is the phone's dialog. It rises from the edge the thumb can reach, keeps the page visible behind a scrim so the user knows where they are, and goes away with a swipe, a tap outside, or a close button. On a wide screen the same content is a Dialog; the component decides which, so screens are written once.

## When to use

Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog: filters, a form of a few fields, details of a selected item, a picker with many options. Use `height: content` by default; `full` for a task that needs the whole screen but should still feel dismissable; `half` for a browsable list where seeing the page behind matters (a map with results). For a flat list of actions, ActionSheet is the lighter component.

## When not to use

Do not use a BottomSheet as a menu (ActionSheet or Menu), as a persistent panel (a bottom Landmark region), or for content the user must read at length (a page). Do not stack sheets. Do not rely on the drag gesture to teach dismissal; the close button is visible on every dismissible sheet.

## Behavior

Opening slides the sheet up and fades the scrim; focus moves to the first control or the title; the page behind is inert and its scroll locked. The body scrolls within the sheet; a downward drag on the handle or header (never the body, whatever its scroll position) begins the dismiss gesture, and releasing past the threshold or with enough velocity fires `onDragDismiss` then `onClose('drag')` — otherwise the sheet springs back. After a drag dismiss the sheet holds the release position until the consumer's update renders: `open` false plays the exit from there; `open` still true springs the sheet back to rest. Escape, the close button and a scrim tap request close as in Dialog. The sheet never raises `action` itself; a consumer's footer action may call the same `onClose` handler with it. The `overlay.dismiss` values are the shared category vocabulary; the event's reasons are what fires: `escape`, `scrim` and `close-button` are reported as themselves, and `swipe` is reported as `drag`. `open` is controlled only; there is no uncontrolled mode. The heading's id/ref/tabindex, the close Button's `label` from `copy.closeLabel`, its `close` Icon glyph, press handlers and aria wiring are wiring every platform passes, not composition props. Gate and Keyboard stories that need it open render through a wrapper that owns `open` (starting true) and writes `onClose` back, acting as the consumer. Above the `maxWidth` breakpoint the sheet presents as a centered Dialog of size md with the same props and events, so code does not branch on device. In the wide presentation the same props are forwarded to Dialog — `heading`, `hideHeading` (Dialog has it for this reason), `dismissible`, `footer` — and every override whose binding shares a name with a Dialog binding (`scrim`, `surface`, `shadow`, `radius`, `inset`, `partGap`, `headerGap`, `footerGap`, `layer`, `enter`, `exit`, `focusRing`, `focusRingWidth`) is forwarded to Dialog's `overrides`; the rest (the handle bindings, `headerPaddingTop`, `handleGap`, `maxWidth`, `minTarget`) have no effect there. Only overrides the caller set are forwarded, so Dialog keeps its own tokens otherwise — its `layer.dialog` included — and a locked binding is never forwarded. Close reasons map one to one: Dialog's `escape`, `close-button`, `scrim` and `action` are re-emitted as the same reasons, and `drag` has no Dialog source, so it never fires in the wide presentation. Dialog's `onOpened` is not re-emitted, since BottomSheet has no such event. In the wide presentation BottomSheet renders Dialog directly, so the root carries Dialog's own hooks and a closed sheet renders nothing in both presentations; the sheet's part hooks and authored scenarios apply below the breakpoint. Crossing the breakpoint while open swaps presentation on the next render without an animated hand-off; focus and scroll lock are re-established by the new surface. Initial focus is the first focusable in the body, then in the footer, then the close button, then the heading, which takes `tabindex="-1"` for the purpose; there is no `initialFocus` prop.

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
