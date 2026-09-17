# Generate: SidePanel for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/SidePanel.tsx` exporting a typed React function component named `SidePanel`, plus `SidePanel.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function SidePanel({ ref, …rest }: SidePanelProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof SidePanel> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `SidePanel.test.tsx`.
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
    heading:
      component: Heading
      props:
        level: '2'
        size: lg
      forwards:
        headingGap: marginBlockEnd
    closeButton:
      component: Button
      props:
        variant: ghost
        iconOnly: true
    body:
      component: Box
      forwards:
        inset: paddingInline
    footer:
      component: Stack
      props:
        direction: horizontal
        gap: tight
        justify: end
      forwards:
        footerGap: gap
  parts:
    trigger:
      kind: slot
      slot:
        prop: trigger
  props:
    trigger:
      type: content
      description: 'The Button that shows and hides the panel (usually `iconOnly`
        with the `menu` Icon and a label like "Menu"). It is the APG disclosure button:
        the panel sets aria-expanded and aria-controls on it, and it stays a toggle
        — pressing it again closes. Omit to control `open` from elsewhere (a Toolbar).
        On web it is exactly one element (it is cloned), wrapped in an overlay-owned
        `<span data-part="trigger">` with display: contents, and that wrapper — never
        the Button — is what persistent mode hides.'
    open:
      type: boolean
      description: Controlled visibility. Omit for uncontrolled (the trigger toggles
        it); an uncontrolled panel always starts closed and there is no defaultOpen,
        so a panel that must start open is controlled.
      controls:
        event: onOpenChange
        state: open
    heading:
      type: string
      required: true
      description: The panel's title and accessible name ("Menu", "Filters", "Your
        cart"). May be visually hidden with `hideHeading`.
    hideHeading:
      type: boolean
      default: false
      description: 'Keep the title for assistive technology but hide it visually (a
        navigation panel whose Links are self-explanatory): on web and Lit it stays
        rendered with the visually-hidden clip pattern so aria-labelledby still resolves;
        on native it is the surface''s accessibilityLabel. When the header would then
        be empty (no close button because `dismissible` is false or the panel is persistent),
        the header part is not rendered: no padding, no gap, no height, and the hidden
        title moves to the top of the surface. When the header keeps only the close
        button (`dismissible` true, not persistent), the close button is end-aligned
        in it on every platform.'
      a11y: The accessible name is required regardless.
    children:
      type: content
      required: true
      description: 'The body: a Stack or Tree of Links for navigation, a Stack of
        filter controls (Checkboxes, a RadioGroup — not a Form, whose own actions
        would duplicate the footer), a Stack of Cards. Scrolls inside the panel when
        taller than the viewport.'
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
        layout.maxWidth.content, `page` at layout.maxWidth.page; the comparison is
        `(width > token)` (exactly the token width is still the overlay; on native
        `window width <= token` is the overlay — a width check, not an orientation
        check), and the breakpoint is read from the theme token, not per instance
        — on web and Lit from the token''s resolved custom property on <html> when
        the component mounts (connects), converted to px; a theme change after that
        takes effect on the next mount. Below it, the overlay behavior applies. The
        sidebar renders where SidePanel sits in the tree (not through the portal),
        inline-size from the width binding, natural height (the page scrolls, not
        the body), with no close button; the page''s own layout places it beside the
        content. This is how one component serves a phone''s hamburger menu and a
        desktop''s sidebar.'
    role:
      type: enum
      values:
      - complementary
      - navigation
      default: complementary
      description: 'The landmark the panel exposes (in persistent mode and as the
        region''s role when open): `navigation` for a menu of Links, `complementary`
        for filters, a cart, a detail. On web this is the composed Landmark''s own
        role, so `navigation` renders a real <nav>; a modal panel is a dialog, not
        a landmark, and takes none of this. The name `role` is the doc''s; on Lit
        the property and attribute are `landmark`, because a custom element inherits
        `Element.role` and must not shadow it. React Native has no landmark roles
        at all: the persistent sidebar carries the RN role prop and the overlay presentations
        expose no region role, only their label.'
    modal:
      type: boolean
      default: false
      description: 'False (the default, the disclosure pattern): the panel is a disclosed
        region — the page stays live and in the tab order after the panel, focus stays
        on the trigger when it opens, and Escape from inside or a click outside closes
        it. True: the panel is a modal Dialog at the edge — scrim, focus moved in
        and trapped, page inert and scroll-locked — for a panel that must be finished
        or dismissed (a cart checkout, a required filter).'
    scrim:
      type: boolean
      default: true
      description: Show the scrim in non-modal mode too (modal always has one). It
        defaults to true — this structured default is the one that counts — so turn
        it off for a panel that should feel like part of the page.
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the close button, a scrim tap / outside click, and the
        swipe gesture all request close. When false, the close button is not rendered
        and a scrim tap, an outside press and the swipe do nothing; Escape still reports
        through onOpenChange with reason escape (the consumer decides), as in Dialog
        — an uncontrolled non-dismissible panel reports it without closing, so it
        stays open. Only those four are gated: the trigger toggle (`trigger`), a followed
        Link (`navigation`) and a consumer''s `action` always close.'
    swipeable:
      type: boolean
      default: true
      description: 'On touch, a swipe toward the edge dismisses; from the edge, a
        swipe opens (native only). Purely additive. Web and Lit accept the prop for
        parity and wire no gesture: dragging a panel with a mouse is not an idiom
        either platform has. On native the dismiss gesture lives on the header, excluding
        the close button — there is no handle part here; a touch that starts on the
        close button''s wrapping View (`SidePanel.closeButton`) never becomes the
        header''s move responder — and the edge-to-open swipe needs a controlled `open`,
        since an uncontrolled panel exposes nothing to open by hand.'
      a11y: A gesture is never the only way (WCAG 2.5.1); the trigger and close button
        always exist.
  events:
    onOpenChange:
      description: 'Fired when the panel opens or closes, with the new state and a
        reason: `trigger`, `escape`, `close-button`, `scrim`, `outside`, `swipe`,
        `action`, `navigation` (a Link inside was followed). The `overlay.dismiss`
        value `scrim` is the shared category for both `scrim` and `outside`; the other
        dismiss values are reported under their own names.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the panel.
      - name: reason
        type: enum
        values:
        - trigger
        - escape
        - close-button
        - scrim
        - outside
        - swipe
        - action
        - navigation
      reasons:
        trigger: 'the trigger was activated. The scrim is not lifted above the trigger:
          while a scrim is shown it covers the trigger, so a pointer press at the
          trigger''s position is the scrim''s (`scrim`); `trigger` then comes from
          the keyboard, or from a pointer when there is no scrim'
        escape: Escape pressed while open
        close-button: the close button was activated
        scrim: the scrim was clicked — on web and Lit a `click` whose target is the
          scrim element, modal and non-modal alike (not pointerdown)
        outside: 'a pointer press landed outside a non-modal panel with no scrim to
          catch it (`scrim: false`), and not on the trigger (that is `trigger`); React
          Native never reports it, since an outside tap lands on its full-screen scrim
          Pressable (transparent when `scrim` is false) and is `scrim`'
        swipe: the panel was swiped away (React Native only; the value stays in the
          shared reason type on web and Lit, which never emit it)
        action: something inside the panel asked to close — a consumer's footer action
          reusing this same handler, or on Lit a slotted form submitted with method="dialog"
          or by a submitter with formmethod="dialog", caught by a host `submit` listener
          that prevents default and fires `open-change` with `action` (ignored while
          persistent). SidePanel never raises it on its own.
        navigation: 'a Link inside the panel was followed: on web and Lit a `click`
          inside the panel whose (composed) path holds an `<a href>` or a `ds-link`
          and that is not default-prevented; it does not move focus to the trigger
          (the navigation owns focus). Never emitted on React Native, which has no
          router hook'
      fires:
      - user
      timing:
        phase: after-change
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
    action: 'Non-modal: from the trigger, moves to the first tabbable in the open
      panel; from the last element in the panel, continues to the next tabbable element
      after the trigger. On web the panel is portaled, so both steps are explicit
      keydown handling (Popover''s seam); on Lit the shadow panel follows the trigger
      slot and document order does it. Modal: from the last element wraps to the first.'
    when: open
    from: trigger
    expect: manual
  - keys:
    - Escape
    action: Closes and returns focus to the trigger (from focus anywhere inside the
      panel surface; Escape with focus on the trigger does nothing, and a persistent
      sidebar ignores it).
    when: open
    from: inside
    expect:
    - closes
    - focus-trigger
    target: surface
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
      part: scrim
      locked: false
    surface:
      token: color.overlay.surface
      part: surface
      locked: true
    shadow:
      token: shadow.overlay
      description: Overlay mode only; the persistent sidebar has a border instead.
      locked: false
    border:
      token: color.border
      description: 'The inner edge of a persistent sidebar — the edge facing the content:
        inline-end for `side: start`, inline-start for `side: end`.'
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    width:
      token: layout.maxWidth.prose
      description: Default panel width on wide screens; narrow is space.20 × 3 (a
        link list), wide is layout.maxWidth.content. Below the prose breakpoint the
        panel is the viewport minus `edgeGutter`; on web and Lit that is `100%` of
        the fixed containing block (which excludes a scrollbar gutter), not `100vw`.
      locked: false
    widthNarrow:
      token: space.20
      computed:
        times: 3
      description: space.20 × 3. The hook holds the space.20 unit and the rule multiplies
        it by 3, so an override replaces the unit, not the final width.
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
      part: body
      description: 'Pads the inline edges of every part: forwarded as the body Box''s
        paddingInline (the Box''s block padding stays zero), and read directly as
        the header''s and footer''s inline padding. The block edges are padded once,
        on the column that holds the parts (padding-block: inset), never per part,
        so nothing doubles with `partGap`; in overlay mode the safe-area inset adds
        to that column''s block-start and block-end padding. On web and Lit the forward
        travels through the Box''s `--ds-box-padding-inline` set to `--ds-side-panel-inset`
        in SidePanel''s stylesheet, and `overrides.paddingInline` is passed only when
        the caller overrode `inset`; on rn the resolved value is always passed in
        `overrides`. No hook beyond `--ds-side-panel-inset`.'
      locked: false
    headerGap:
      token: layout.gap.normal
      part: header
      description: Between title and close button.
      locked: false
    headingGap:
      token: space.0
      part: heading
      description: Forwarded to the Heading's marginBlockEnd, turning its own margin
        off (as Table and DataGrid do) so the title centers against the close button;
        `headerGap` and `partGap` own the spacing.
      locked: false
    partGap:
      token: layout.gap.loose
      part: focusScope
      description: 'The only space between header, body and footer: the gap of the
        column that holds them, which also carries padding-block from `inset`. On
        web and Lit that column is the `focusScope` part — FocusScope writes its own
        `data-part="scope"`, so it is an overlay-owned element directly inside FocusScope
        (and inside the Landmark when non-modal) carrying `data-part="focusScope"`.
        On React Native FocusScope''s wrapper View cannot be styled or height-constrained,
        so FocusScope wraps the Animated surface from outside and the column is a
        flex-filling View inside the surface holding header, body and footer (in overlay
        mode inside a SafeAreaView, which ignores its own padding, so the column carries
        the gap and padding-block); FocusScope takes no testID.'
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      locked: false
    layer:
      token: layer.sheet
      description: 'Has no effect inside the browser top layer (the modal <dialog>)
        or a native Modal window; it applies to the non-modal position: fixed panel
        and scrim and to the rn anchor view. The non-modal scrim and surface share
        this one layer (no token arithmetic); the scrim precedes the surface in the
        DOM, so the surface paints above it.'
      locked: false
    enter:
      token: motion.duration.base
      description: Slide in from the edge with the scrim fading over the same duration
        and easing; motion.easing.standard; instant under reduced motion. The easing
        is read from the token, not a binding, and is not overridable.
      locked: false
    exit:
      token: motion.duration.fast
      description: 'Slide out, and the scrim fades out, with motion.easing.exit (read
        from the token, not overridable). A swipe dismiss (React Native) has no momentum
        or decay physics: the surface holds the released offset until the consumer''s
        next render, and closing plays this same timing transition from that offset;
        if `open` is still true on that render it springs back. A swipe released below
        the dismiss threshold, or a dismiss the consumer did not honor, springs back
        over this duration with motion.easing.standard (a timing animation, not a
        spring), instant under reduced motion; an interrupted enter animation is finished
        by the spring-back.'
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  constants:
    dismissDistance:
      description: Fraction of the panel width a swipe toward the edge must pass for
        release to dismiss it rather than spring back (React Native; web and Lit wire
        no gesture).
      value: 0.25
      unit: ratio
    dismissVelocity:
      description: Swipe speed at release that dismisses the panel whatever the distance
        travelled. Measured between the last two move samples before release using
        `nativeEvent.timestamp`; only speed toward the edge counts. The same rule
        as BottomSheet.
      value: 1.5
      unit: px/ms
    dragSlop:
      description: Distance a touch must move toward the edge on the header before
        the swipe claims it, so a tap still activates; the drag offset is measured
        from where the slop was crossed, so the surface does not jump.
      token: space.1
      unit: px
    edgeZone:
      description: Width of the strip at the `side` edge of the screen root in which
        `useSidePanelEdgeSwipe` starts an edge-swipe-to-open (React Native only).
        The open swipe uses the same dragSlop, dismissDistance and dismissVelocity
        rules toward the content.
      token: size.target.comfortable
      unit: px
  copy:
    closeLabel: Close
    expanded: Expanded
  overlay:
    layer: sheet
    open: open
    closeEvent: onOpenChange
    dismiss:
    - escape
    - scrim
    - close-button
    - swipe
    modal: false
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
        and aria-controls={panelId}; the panel is the composed Landmark at the `role`
        the prop names — an <aside aria-labelledby>, or a <nav> for `navigation` —
        rendered through a portal, so Tab from the trigger does not walk into it by
        document order; the panel''s own Shift+Tab-from-first returns to the trigger
        and Tab-from-last continues past it, the same seam Popover has, with the `hidden`
        attribute when closed (after the exit transition), position: fixed at the
        edge, full height, on layer.sheet, with an optional scrim <div aria-hidden>
        that closes on click. Tab from the trigger is a keydown handler on the trigger
        wrapper that focuses the panel''s first tabbable. Focus stays on the trigger
        on open; Escape anywhere inside the panel surface closes and refocuses the
        trigger (not from the trigger); a focusout to outside the panel and trigger
        does NOT close it (unlike Popover — a navigation panel should survive a stray
        click) but a `click` on the scrim (reason `scrim`) or, with `scrim: false`,
        a pointerdown outside the panel and trigger (reason `outside`) does when dismissible.
        Modal: the same content in the native <dialog> via showModal() as Dialog,
        inert page and scroll lock through FocusScope''s modal contract; the <dialog>
        fills the viewport with a transparent ::backdrop and holds a real scrim element
        (`data-part="scrim"`, a `click` whose target it is → `scrim`) and, above it,
        the edge-positioned surface element (`data-part="surface"`, the width `min()`
        and the slide); where the browser closes the <dialog> through a non-cancelable
        `cancel`, report `escape` and call showModal() again if `open` is still true,
        as Dialog; FocusScope takes `autoFocus="none"` (its own autoFocus would run
        before the dialog is shown) and SidePanel focuses, after showModal(), the
        first focusable in the body, then the footer, then the close button, then
        the heading (tabindex -1). A Link followed inside the panel closes it with
        reason navigation (a `click` whose path holds an `<a href>`, not default-prevented;
        focus is not moved to the trigger; a full navigation makes it moot). Persistent
        mode above the chosen breakpoint (matchMedia `(width > <token>)` on the token):
        render the same Landmark at the `role` the prop names in place, where SidePanel
        sits (not portaled), no dialog, no scrim, no trap, no close button, the trigger
        wrapper hidden with display none. The switch must not lose a non-modal panel''s
        content state: the children render into one host node that moves between the
        portal target and the in-page position. A modal panel changes root element
        (<dialog> to the sidebar) when crossing the breakpoint, so its children remount;
        that is accepted. Overlay mode only: safe-area padding via env(safe-area-inset-left)
        or -right on the physical edge the panel touches (flipped under :dir(rtl)),
        plus the top and bottom insets added to the parts column''s padding-block;
        the persistent sidebar pads no safe area (the page layout owns it) and draws
        its `border` on the edge facing the content (border-inline-end for `side:
        start`, border-inline-start for `side: end`). Landmark takes no className
        or style, so `data-ds`, the classes, inline style, style hooks, `id` (the
        aria-controls target) and ref go on SidePanel''s own root element — the fixed
        panel element, the full-viewport <dialog> when modal, the in-page sidebar
        element when persistent — which, unless modal, composes Landmark inside it
        passing only `role`, `as` and `aria-labelledby`. The non-modal scrim is that
        element''s sibling, so it cannot inherit the hooks: `.ds-side-panel__scrim`
        declares the same `--ds-side-panel-*` hook defaults and receives the same
        inline override style (in modal the scrim sits inside the <dialog> and inherits).
        The ref resolves to that root element and is null whenever the panel is closed
        and not persistent; the non-modal surface itself stays mounted with `hidden`,
        so it is in the DOM while closed. `container?: HTMLElement` (default document.body)
        is the portal target — a platform prop, not a schema prop. `trigger` is exactly
        one element, typed as such, because it is cloned to carry aria-expanded, aria-controls
        and the toggle.'
    lit:
      tag: ds-side-panel
      reflect:
      - open
      - side
      - width
      - persistent
      - prop: dismissible
        attribute: no-dismiss
      - prop: swipeable
        attribute: no-swipeable
      notes: 'Slots `trigger`, default and `footer`. Non-modal overlay mode renders
        the region as a shadow <nav> (`landmark="navigation"`) or <aside> (`complementary`)
        with `hidden` when closed, position: fixed at the edge; only a modal panel
        uses a shadow <dialog> with showModal(), because a <dialog> may carry no landmark
        role. In persistent mode the host itself lays out as the sidebar (display:
        block in the parent grid) and the slotted content renders in that same <nav>
        or <aside>. Lit renders these native elements itself rather than composing
        ds-landmark (the role belongs on the element in the shadow root; a nested
        landmark host would add nothing). Attributes, none reflected: `modal`, `hide-heading`,
        `no-scrim` (negated, since scrim defaults true) and `landmark` for `role`.
        The shadow region follows the trigger slot, so Tab order needs no handling.
        Composed `open-change`. matchMedia listener on the persistent breakpoint.
        `aria-controls` cannot reach the shadow panel from the slotted trigger, so
        only aria-expanded is set on it; the panel is named by its heading inside
        the shadow root. `role` selects the landmark role of the shadow region. `container`
        is not needed: the panel lives in the shadow root. As on web: the scrim is
        a `click` target (`scrim`) and `outside` a pointerdown; the modal <dialog>
        fills the viewport with a transparent ::backdrop around a real scrim element
        and the edge-positioned surface, and a non-cancelable `cancel` reports `escape`
        and re-opens with showModal() if `open` is still true; the non-modal scrim
        shares `layer` with the region and precedes it; safe-area padding is overlay-only;
        the persistent border is on the edge facing the content. The shadow styles
        live on the host, so the scrim inherits the hooks.'
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
        hook rather than assuming). onRequestClose → escape. Above the `persistent`
        breakpoint (a tablet in landscape, typically): render as a sibling View beside
        the content (no Modal), matching the web sidebar. RTL flips `start`/`end`
        via I18nManager. Non-modal ''page stays live'' cannot be reproduced under
        RN Modal (it intercepts all touches); only tap-outside-to-close is possible,
        and the doc accepts that. `role` maps to the RN >= 0.74 `role` prop on the
        persistent sidebar View. `navigation` as a close reason is never emitted natively
        (no router hook). `useSidePanelEdgeSwipe` requires the panel to be controlled
        (`open`). The persistent switch is `window width > token` (width <= token
        is the overlay), not an orientation check. Modal focus trap, inert background
        and scroll lock have no full native equivalent: the modal panel uses FocusScope
        `trapped={modal}` plus accessibilityViewIsModal, the Modal window itself stands
        in for the inert page, and scroll lock has no meaning (there is no page behind
        to scroll); screen-reader users are confined by accessibilityViewIsModal,
        which is the accessible alternative. `action` is never raised by the component
        (the footer is opaque content); it exists for a consumer''s own footer handler.
        `outside` is never reported: an outside tap always lands on the full-screen
        scrim Pressable (transparent when `scrim` is false) and is reported as `scrim`.
        `copy.expanded` is not rendered: the trigger Button''s `expanded` sets accessibilityState.expanded,
        which the platform announces in its own words. The persistent sidebar View
        carries `role={role}` and `accessibilityLabel={heading}` (not accessibilityRole
        none). SidePanel exposes no ref on React Native. Crossing the breakpoint while
        open changes the root between Modal and View, so the children remount and
        lose their state (a native limit; the web non-modal host-node move has no
        RN equivalent). Safe area: core React Native has no per-edge inset API, so
        in overlay mode the parts column sits inside a SafeAreaView (iOS pads the
        top, bottom and the edge side; Android pads nothing), and the persistent sidebar
        pads none (the screen owns it). The swipe follows `constants` (dismissDistance,
        dismissVelocity, dragSlop, edgeZone).'
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
        / collapsed)` — SwiftUI is the only platform that uses `copy.expanded`; web,
        Lit and React Native carry the state through aria-expanded / accessibilityState.expanded
        and never render the string — (no expanded trait) and controls the panel;
        `modal` adds the scrim `Rectangle` (`color.overlay.scrim`, tap closes when
        `dismissOnScrim`), FocusScope trap and `.isModal`; non-modal panels push content
        aside (`inline`) or overlay it without a scrim. Edge-swipe to close is an
        addition to the visible close `Button`.
  behavior:
  - name: close-button-fires-on-open-change
    description: The close button requests close; the consumer flips `open` when it
      is controlled.
    given:
      open: true
    when:
      click: closeButton
    then:
    - event: onOpenChange
  - name: the-close-button-works-without-the-swipe
    description: The swipe is purely additive — the trigger and close button always
      exist (WCAG 2.5.1, gesture-alternative).
    given:
      open: true
      swipeable: false
    when:
      click: closeButton
    then:
    - event: onOpenChange
  - name: non-dismissible-still-reports-escape
    description: With `dismissible` false the close button is not rendered and taps
      outside do nothing; Escape still reports with reason escape, as in Dialog.
    given:
      open: true
      dismissible: false
    when:
      key: Escape
    then:
    - event: onOpenChange
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
    - event: onOpenChange
      fired: false
  - name: the-heading-is-rendered
    description: The title names what the panel holds and is shown unless hideHeading.
    given:
      open: true
      heading: Your cart
    then:
    - text: Your cart
  examples:
  - name: navigation-drawer
    description: The phone hamburger menu that becomes the permanent sidebar on desktop,
      with a self-explanatory list.
    given:
      trigger: An icon-only Button with the menu Icon, labelled Menu
      heading: Menu
      children: A Stack of navigation Links with the current page marked (aria-current
        on web and Lit; React Native Link has no current-page state)
      hideHeading: true
      role: navigation
      persistent: content
  - name: filters
    description: A wide filter panel beside a results page, ending in an action row.
    given:
      trigger: A Filters Button
      heading: Filters
      children: A Stack of filter Checkboxes
      footer: Clear and Apply Buttons
      width: wide
  - name: cart
    description: A checkout panel from the end edge that must be finished or dismissed,
      so it is modal.
    given:
      open: true
      heading: Your cart
      children: A Stack of line-item Cards
      footer: A Checkout Button
      side: end
      modal: true
  - name: detail-panel
    description: A narrow detail panel that should feel like part of the page, so
      it has no scrim.
    given:
      open: true
      heading: Order details
      children: A Stack of labelled values for the selected order
      side: end
      width: narrow
      scrim: false
```

## Events

- `onOpenChange`: emit `onOpenChange`
  - payload, positional, in this order: `open: boolean`, `reason: 'trigger' | 'escape' | 'close-button' | 'scrim' | 'outside' | 'swipe' | 'action' | 'navigation'`
  - reasons: `trigger` (the trigger was activated. The scrim is not lifted above the trigger: while a scrim is shown it covers the trigger, so a pointer press at the trigger's position is the scrim's (`scrim`); `trigger` then comes from the keyboard, or from a pointer when there is no scrim); `escape` (Escape pressed while open); `close-button` (the close button was activated); `scrim` (the scrim was clicked — on web and Lit a `click` whose target is the scrim element, modal and non-modal alike (not pointerdown)); `outside` (a pointer press landed outside a non-modal panel with no scrim to catch it (`scrim: false`), and not on the trigger (that is `trigger`); React Native never reports it, since an outside tap lands on its full-screen scrim Pressable (transparent when `scrim` is false) and is `scrim`); `swipe` (the panel was swiped away (React Native only; the value stays in the shared reason type on web and Lit, which never emit it)); `action` (something inside the panel asked to close — a consumer's footer action reusing this same handler, or on Lit a slotted form submitted with method="dialog" or by a submitter with formmethod="dialog", caught by a host `submit` listener that prevents default and fires `open-change` with `action` (ignored while persistent). SidePanel never raises it on its own.); `navigation` (a Link inside the panel was followed: on web and Lit a `click` inside the panel whose (composed) path holds an `<a href>` or a `ds-link` and that is not default-prevented; it does not move focus to the trigger (the navigation owns focus). Never emitted on React Native, which has no router hook)
  - fires on: user
  - timing: after-change

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `onOpenChange`); drives state `open`

## Parts and slots

- `trigger`: slot, prop `trigger`
- `scrim`: element
- `surface`: element
- `focusScope`: component `FocusScope`
- `header`: element
- `heading`: component `Heading`; props `level` = "2", `size` = "lg"; forwards `headingGap` → `overrides.marginBlockEnd`
- `body`: component `Box`; forwards `inset` → `overrides.paddingInline`
- `footer`: component `Stack`; props `direction` = "horizontal", `gap` = "tight", `justify` = "end"; forwards `footerGap` → `overrides.gap`
- `closeButton`: component `Button`; props `variant` = "ghost", `iconOnly` = true

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `widthNarrow`: token `space.20`; computed `calc(var(--space-20) * 3)`
- `inset`: token `layout.inset.lg`; part `body`
- `headerGap`: token `layout.gap.normal`; part `header`
- `headingGap`: token `space.0`; part `heading`
- `partGap`: token `layout.gap.loose`; part `focusScope`
- `footerGap`: token `layout.gap.tight`; part `footer`

## Keyboard

- `Escape` (Closes and returns focus to the trigger (from focus anywhere inside the panel surface; Escape with focus on the trigger does nothing, and a persistent sidebar ignores it).): expect closes, then focus-trigger; target part `surface`

## Form and overlay

```yaml
overlay:
  layer: sheet
  open: open
  closeEvent: onOpenChange
  dismiss:
  - escape
  - scrim
  - close-button
  - swipe
  modal: false
```

`overlay.closeEvent` emits `onOpenChange`.

## Constants and examples

- constant `dismissDistance`: 0.25 ratio
- constant `dismissVelocity`: 1.5 px/ms
- constant `dragSlop`: `var(--space-1)` (`space.1`) px
- constant `edgeZone`: `var(--size-target-comfortable)` (`size.target.comfortable`) px
- example `navigation-drawer`, story `NavigationDrawer`: given `trigger: "An icon-only Button with the menu Icon, labelled Menu"`, `heading: "Menu"`, `children: "A Stack of navigation Links with the current page marked (aria-current on web and Lit; React Native Link has no current-page state)"`, `hideHeading: true`, `role: "navigation"`, `persistent: "content"`; The phone hamburger menu that becomes the permanent sidebar on desktop, with a self-explanatory list.
- example `filters`, story `Filters`: given `trigger: "A Filters Button"`, `heading: "Filters"`, `children: "A Stack of filter Checkboxes"`, `footer: "Clear and Apply Buttons"`, `width: "wide"`; A wide filter panel beside a results page, ending in an action row.
- example `cart`, story `Cart`: given `open: true`, `heading: "Your cart"`, `children: "A Stack of line-item Cards"`, `footer: "A Checkout Button"`, `side: "end"`, `modal: true`; A checkout panel from the end edge that must be finished or dismissed, so it is modal.
- example `detail-panel`, story `DetailPanel`: given `open: true`, `heading: "Order details"`, `children: "A Stack of labelled values for the selected order"`, `side: "end"`, `width: "narrow"`, `scrim: false`; A narrow detail panel that should feel like part of the page, so it has no scrim.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `border`, `borderWidth`, `width`, `widthNarrow`, `widthWide`, `edgeGutter`, `inset`, `headerGap`, `headingGap`, `partGap`, `footerGap`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `focusRing`, `focusRingWidth`

## Behavior scenarios (18)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: close-button-fires-on-open-change
  description: The close button requests close; the consumer flips `open` when it
    is controlled.
  given:
    open: true
  when:
    click: closeButton
  then:
  - event: onOpenChange
- name: the-close-button-works-without-the-swipe
  description: The swipe is purely additive — the trigger and close button always
    exist (WCAG 2.5.1, gesture-alternative).
  given:
    open: true
    swipeable: false
  when:
    click: closeButton
  then:
  - event: onOpenChange
- name: non-dismissible-still-reports-escape
  description: With `dismissible` false the close button is not rendered and taps
    outside do nothing; Escape still reports with reason escape, as in Dialog.
  given:
    open: true
    dismissible: false
  when:
    key: Escape
  then:
  - event: onOpenChange
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
  - event: onOpenChange
    fired: false
- name: the-heading-is-rendered
  description: The title names what the panel holds and is shown unless hideHeading.
  given:
    open: true
    heading: Your cart
  then:
  - text: Your cart
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
- name: escape-fires-on-open-change
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onOpenChange
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```

## Platform notes (web)

```yaml
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
notes: "Non-modal (default, APG disclosure): the trigger Button gets aria-expanded\
  \ and aria-controls={panelId}; the panel is the composed Landmark at the `role`\
  \ the prop names \u2014 an <aside aria-labelledby>, or a <nav> for `navigation`\
  \ \u2014 rendered through a portal, so Tab from the trigger does not walk into it\
  \ by document order; the panel's own Shift+Tab-from-first returns to the trigger\
  \ and Tab-from-last continues past it, the same seam Popover has, with the `hidden`\
  \ attribute when closed (after the exit transition), position: fixed at the edge,\
  \ full height, on layer.sheet, with an optional scrim <div aria-hidden> that closes\
  \ on click. Tab from the trigger is a keydown handler on the trigger wrapper that\
  \ focuses the panel's first tabbable. Focus stays on the trigger on open; Escape\
  \ anywhere inside the panel surface closes and refocuses the trigger (not from the\
  \ trigger); a focusout to outside the panel and trigger does NOT close it (unlike\
  \ Popover \u2014 a navigation panel should survive a stray click) but a `click`\
  \ on the scrim (reason `scrim`) or, with `scrim: false`, a pointerdown outside the\
  \ panel and trigger (reason `outside`) does when dismissible. Modal: the same content\
  \ in the native <dialog> via showModal() as Dialog, inert page and scroll lock through\
  \ FocusScope's modal contract; the <dialog> fills the viewport with a transparent\
  \ ::backdrop and holds a real scrim element (`data-part=\"scrim\"`, a `click` whose\
  \ target it is \u2192 `scrim`) and, above it, the edge-positioned surface element\
  \ (`data-part=\"surface\"`, the width `min()` and the slide); where the browser\
  \ closes the <dialog> through a non-cancelable `cancel`, report `escape` and call\
  \ showModal() again if `open` is still true, as Dialog; FocusScope takes `autoFocus=\"\
  none\"` (its own autoFocus would run before the dialog is shown) and SidePanel focuses,\
  \ after showModal(), the first focusable in the body, then the footer, then the\
  \ close button, then the heading (tabindex -1). A Link followed inside the panel\
  \ closes it with reason navigation (a `click` whose path holds an `<a href>`, not\
  \ default-prevented; focus is not moved to the trigger; a full navigation makes\
  \ it moot). Persistent mode above the chosen breakpoint (matchMedia `(width > <token>)`\
  \ on the token): render the same Landmark at the `role` the prop names in place,\
  \ where SidePanel sits (not portaled), no dialog, no scrim, no trap, no close button,\
  \ the trigger wrapper hidden with display none. The switch must not lose a non-modal\
  \ panel's content state: the children render into one host node that moves between\
  \ the portal target and the in-page position. A modal panel changes root element\
  \ (<dialog> to the sidebar) when crossing the breakpoint, so its children remount;\
  \ that is accepted. Overlay mode only: safe-area padding via env(safe-area-inset-left)\
  \ or -right on the physical edge the panel touches (flipped under :dir(rtl)), plus\
  \ the top and bottom insets added to the parts column's padding-block; the persistent\
  \ sidebar pads no safe area (the page layout owns it) and draws its `border` on\
  \ the edge facing the content (border-inline-end for `side: start`, border-inline-start\
  \ for `side: end`). Landmark takes no className or style, so `data-ds`, the classes,\
  \ inline style, style hooks, `id` (the aria-controls target) and ref go on SidePanel's\
  \ own root element \u2014 the fixed panel element, the full-viewport <dialog> when\
  \ modal, the in-page sidebar element when persistent \u2014 which, unless modal,\
  \ composes Landmark inside it passing only `role`, `as` and `aria-labelledby`. The\
  \ non-modal scrim is that element's sibling, so it cannot inherit the hooks: `.ds-side-panel__scrim`\
  \ declares the same `--ds-side-panel-*` hook defaults and receives the same inline\
  \ override style (in modal the scrim sits inside the <dialog> and inherits). The\
  \ ref resolves to that root element and is null whenever the panel is closed and\
  \ not persistent; the non-modal surface itself stays mounted with `hidden`, so it\
  \ is in the DOM while closed. `container?: HTMLElement` (default document.body)\
  \ is the portal target \u2014 a platform prop, not a schema prop. `trigger` is exactly\
  \ one element, typed as such, because it is cloned to carry aria-expanded, aria-controls\
  \ and the toggle."
```

## Guidance

## Overview

A side panel is the drawer: hidden off the edge until a button asks for it, then sliding in beside the page. It is built on the simplest APG pattern that fits — a button with `aria-expanded` that controls a region — so by default it behaves like a disclosure that happens to slide: focus stays on the button, Tab walks into the panel, Escape puts it away. Only when a panel must be finished or dismissed does it become a modal dialog at the edge. It holds whatever a page needs at hand but not on screen — the navigation Links, a set of filters, the cart — and on a wide screen the same component can stay put as a sidebar, so a product has one menu, not a phone menu and a desktop one.

## When to use

Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a Stack or Tree of Links from the `start` edge), for filters beside a results page, for a cart or a detail panel from the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should become the permanent sidebar on desktop; leave it `never` for panels that are always a temporary overlay (a cart).

## When not to use

Do not use a SidePanel for a short list of actions (Menu, ActionSheet), for a task with a few fields (Dialog or BottomSheet, which the thumb reaches), or for content that is the page's point. Do not open one on hover. Use `modal` only when the page must not be used until the panel is done; a navigation drawer is not that. Do not stack side panels, and do not put a Dialog's job inside one — a panel is a place, not a step.

## Behavior

The trigger toggles the panel and reflects it with `aria-expanded`. Non-modal (default): opening slides the panel in from `side` and fades the scrim if shown; focus stays on the trigger, and the next Tab enters the panel as if it sat right after the trigger (on web the panel is portaled, so this is explicit focus handling; Tab from the panel's last control goes to the element after the trigger); Shift+Tab from the first control returns to the trigger with the panel still open; the page stays live. Modal: focus moves to the first focusable in the body, then the footer, then the close button, then the title (tabindex -1), the page is inert and scroll-locked, Tab is confined. In both, the body scrolls within the panel and the footer stays pinned; Escape (from inside the panel, not from the trigger), the close button, a scrim tap (`scrim`) or, with no scrim, an outside press (`outside`), and a swipe toward the edge request close; following a Link inside closes it with reason `navigation` (without moving focus); every other close returns focus to the trigger. Above the `persistent` breakpoint the panel is simply there: no scrim, no trap, the trigger hidden, the same content in the page's tab order as a `complementary` (or navigation) landmark; crossing the breakpoint while open keeps the content and drops the overlay chrome. `start` and `end` follow the writing direction. The swipe-to-dismiss gesture lives on the header (not the close button). When closed the panel is either unmounted or `hidden` — both remove it from the accessibility tree; the exit transition finishes first. The non-modal scrim fades with the panel's enter/exit durations and easing. The trigger is a single element; a `menu` Icon exists for the usual icon-only trigger. `copy.expanded` is used only on SwiftUI; the other platforms announce the trigger's expanded state natively. The parts get wiring every platform passes, not composition props: the Heading's id/ref/tabindex for naming and initial focus, the close Button's `label` from `copy.closeLabel`, its `close` Icon as `leadingIcon` and its press handler, and the trigger's aria-expanded/aria-controls and toggle. The close Button takes its default size; Button's own minimum target keeps it at 44px. Stories and examples that must start open (`open: true`) render through a wrapper that owns `open`, starting true, and writes `onOpenChange` back, acting as the consumer. Example stories start from blank args, never from Default's or the meta args: a prop absent from `given` takes its default, so an example with no `open` in its `given` (navigation-drawer, filters) renders uncontrolled and closed, opened by its trigger.

## Content guidelines

Titles name what the panel holds ("Menu", "Filters", "Your cart"), not "Side panel". A navigation panel is a Stack (or Tree) of Links with the current page marked (`aria-current="page"` on web and Lit; React Native's Link has no current-page state to set), grouped with Dividers if long; keep it to what fits without scrolling on a typical phone. Filter panels end with an action row in the footer ("Apply", "Clear"). The trigger's label says what opens ("Menu", "Filters"), and the `menu` Icon alone is only acceptable with that label for assistive technology.

## Accessibility

The default is the APG disclosure pattern: a button with `aria-expanded` and `aria-controls` showing and hiding a named landmark region (WCAG 4.1.2, 1.3.6), with the tab sequence running button → region → the page after the button, so it matches the visual sequence (2.4.3, 1.3.2) — on web the region is portaled and the sequence is stitched by focus handling, on Lit the shadow region simply follows the trigger slot; the hidden panel uses `hidden`, not just off-screen positioning, so it is out of the accessibility tree when closed. Escape closes from inside and restores focus to the button (2.1.2). With `modal` the panel is a modal `dialog` named by its title: focus moves in and is confined, the background is inert and scroll-locked (APG modal dialog). The swipe is additive (2.5.1). In persistent mode it is a landmark region (`complementary` or `navigation`) in the normal tab order, so a screen-reader user can jump to it (1.3.6, 2.4.1). The panel meets contrast on the overlay surface, its close button meets 44px, and the slide respects reduced motion (2.3.3). A phone-width panel leaves a strip of scrim visible so sighted users keep their sense of place and have a large close target.

## Platform notes

### Web
Clone the trigger with `aria-expanded`, `aria-controls`, `onClick` (toggle), inside a `<span data-part="trigger">` with display: contents. Non-modal: render, through a portal into `container` (default document.body), the positioned surface `<div id hidden={!open} data-ds="SidePanel" class="ds-side-panel--{side} ds-side-panel--{width}">`, `position: fixed`, holding `Landmark` (`<aside aria-labelledby>`, or `as="nav"`), and an optional scrim `<div aria-hidden>` before it; Tab on the trigger wrapper → focus the panel's first tabbable, Shift+Tab from the panel's first → trigger, Tab from its last → the next tabbable after the trigger; keydown Escape inside the panel → close + focus trigger; `click` on the scrim → close with `scrim`, or with no scrim a pointerdown outside the panel and trigger (document listener) → close with `outside`, when dismissible; `hidden` is applied after the exit transition ends. Modal: render a full-viewport `<dialog aria-labelledby>` through `showModal()` with a transparent `::backdrop`, holding a scrim element (`data-part="scrim"`, from `scrim`) and the surface element with `position: fixed; inset-block: 0; inset-inline-start: 0` (or `-end`), `inline-size` from the width tokens (`min(var(--ds-side-panel-width), 100% - var(--ds-side-panel-edge-gutter))`), translated from `-100%` to `0` over `enter`; wrap content in `FocusScope trapped={modal} autoFocus="none" restoreFocus` and, after `showModal()`, focus the first focusable in the body, then the footer, then the close button, then the heading (tabindex -1); header `Stack` horizontal with the `Heading` (`level 2`, visually hidden with the clip pattern when `hideHeading`; the header is not rendered when that leaves it empty) and the close `Button` (`ghost`, `iconOnly`, `close` Icon); body `Box` scrolling; footer `Stack`; header, body and footer in the `data-part="focusScope"` column inside FocusScope. A `click` on the scrim element and Escape → close. A `click` on an `<a href>` inside, not default-prevented → close with `navigation`, focus not moved. Persistent: `matchMedia('(width > <token px>)')` (`literal-ok: breakpoint from layout.maxWidth.*`) renders `Landmark as="complementary"` (or `"nav"`) in place — where SidePanel sits, not portaled — with the same children, no close button, `border` on the edge facing the content (`border-inline-end` for `start`, `border-inline-start` for `end`), inline-size from the width binding and natural height, no safe-area padding, and the trigger wrapper with `hidden`; the page layout places it beside the content. Overlay mode only: safe area via `env(safe-area-inset-left)` or `-right` on the physical edge the panel touches (flipped under `:dir(rtl)`), plus the top and bottom insets.

### Lit
`<ds-side-panel heading="Menu" persistent="content"><ds-button slot="trigger" icon-only icon="menu" label="Menu"></ds-button><ds-stack>…</ds-stack></ds-side-panel>`; non-modal: a shadow `<aside>` (or `<nav>` for `landmark="navigation"`) with `hidden` when closed; modal: a shadow `<dialog>` with `showModal()`; persistent mode switches the host to `display: block` in the parent grid and renders the same `<aside>` or `<nav>`; composed `open-change`.

### React Native
`Modal` with an `Animated.View` panel at the `start`/`end` edge (`I18nManager.isRTL` flips), width from tokens capped at screen width minus `edgeGutter`, scrim `Pressable`, `PanResponder` swipe toward the edge to dismiss, `FocusScope`, `onRequestClose` → escape. `persistent` on tablets above the breakpoint renders a sibling `View` with `role={role}` and `accessibilityLabel={heading}`, beside the content (children remount when crossing the breakpoint). Provide `useSidePanelEdgeSwipe()` for the edge-swipe-to-open gesture on the screen root.

## Related

BottomSheet, Dialog, Menu, Landmark, Tree, Link, FocusScope.
