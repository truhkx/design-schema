# Generate: Popover for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Popover.tsx` exporting a typed React function component named `Popover`, plus `Popover.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Popover({ ref, …rest }: PopoverProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Popover> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Popover.test.tsx`.
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
  name: Popover
  category: overlay
  status: review
  apg: disclosure
  anatomy:
  - trigger
  - panel
  - focusScope
  - heading
  - body
  - closeButton
  - arrow
  composition:
    focusScope:
      component: FocusScope
      props:
        trapped:
          from: modal
        autoFocus: none
        restoreFocus: false
        active:
          from: open
    heading:
      component: Heading
      props:
        level:
          from: headingLevel
    closeButton:
      component: Button
      props:
        variant: ghost
        size: sm
        iconOnly: true
        leadingIcon: close
    body: Box
  parts:
    trigger:
      kind: slot
      slot:
        prop: trigger
        required: true
  props:
    trigger:
      type: content
      required: true
      description: Exactly one focusable element — usually a Button — that opens the
        popover; typed as a single element, since it is cloned with aria-expanded/aria-controls
        (Button's `expanded` prop on native) and the toggle handler. On web and React
        Native it is typed `React.ReactElement`, not any ReactNode. A type cannot
        enforce the cardinality everywhere, so every platform warns in development
        when it is not exactly one element — a fragment, a bare string or an empty
        `trigger` slot on Lit — because such a trigger silently never opens the panel.
    children:
      type: content
      required: true
      description: The panel content. May contain controls, links and a short Form;
        keep it to what fits without scrolling.
    heading:
      type: string
      description: Optional heading at the top of the panel, also the accessible name.
        Without it, the panel is named by the trigger (how each platform reads the
        trigger's name is in its notes).
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      default: '3'
      description: 'Heading level of the panel heading, so it fits the page outline
        (a popover usually sits under a level-2 section). No effect in the React Native
        phone presentation, where BottomSheet''s heading is always level 2. In the
        React Native tablet and react-native-web presentation the level is passed
        to Heading, which uses it only for typography (native has no heading levels).
        With no `heading` there is no Heading to receive it and the prop is simply
        unused: no warning, and the narrower 2–4 enum is passed through to Heading
        unchanged.'
    open:
      type: boolean
      description: Controlled open state. Omit for uncontrolled (the trigger toggles
        it); the uncontrolled popover starts closed and there is no defaultOpen.
      controls:
        event: onOpenChange
        state: open
    placement:
      type: enum
      values:
      - bottom-start
      - bottom
      - bottom-end
      - top-start
      - top
      - top-end
      - start
      - end
      default: bottom
      description: 'Preferred side and alignment; flips and shifts to stay in the
        viewport. All eight values are logical: `start`/`end` and the `-start`/`-end`
        alignments mirror in right-to-left writing (the same rule as Tooltip and Menu).'
    modal:
      type: boolean
      default: false
      description: 'False (default): the page stays interactive; clicking outside
        closes; focus moves in but is not trapped, and Tab out closes. True: behaves
        as a small Dialog anchored to the trigger — focus trapped, background inert
        — for content that must be finished (a required form); Popover adds no Tab
        handler there, the wrap is FocusScope''s, and with no tabbable child focus
        simply stays where it is. A modal popover locks page scroll the way Dialog
        does — a class on the root element with `overflow: hidden` and `scrollbar-gutter:
        stable`, so locking does not shift the page by the scrollbar width — but does
        not dim it: there is no scrim on any platform (the native <dialog> ::backdrop
        is transparent), and pressing outside does nothing.'
    showArrow:
      type: boolean
      default: false
      description: A small pointer toward the trigger. Off by default; Calm & precise
        prefers a plain edge.
    dismissible:
      type: boolean
      default: true
      description: 'Show the close button. Escape and outside click work regardless
        (non-modal), so this is a visibility switch, not Dialog''s "must be answered"
        rule: with it false there is simply no close button.'
  events:
    onOpenChange:
      description: 'Fired when the popover opens or closes, with the new state and
        a reason: `trigger`, `escape`, `outside`, `close-button`, `tab-out`. The reason
        type keeps its existing exported name, `PopoverCloseReason`, although the
        union includes `trigger`, which also opens; it is not renamed to `PopoverOpenChangeReason`.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the popover.
      - name: reason
        type: enum
        values:
        - trigger
        - escape
        - outside
        - close-button
        - tab-out
      reasons:
        trigger: the trigger was activated
        escape: Escape pressed while open
        outside: a pointer press landed outside the popover
        close-button: the close button was activated
        tab-out: Tab moved focus past the end of the popover, or Shift+Tab moved it
          back past the start to the trigger (both directions report tab-out)
      fires:
      - user
      timing:
        phase: after-change
  keyboard:
  - keys:
    - Enter
    - ' '
    action: Toggles the popover from the trigger.
    when: focus on trigger
    from: trigger
    expect: manual
  - keys:
    - Escape
    action: Closes and returns focus to the trigger.
    when: open
    from: inside
    expect:
    - closes
    - focus-trigger
  - keys:
    - Tab
    action: 'Non-modal: after the last element in the panel, closes and moves focus
      to the element after the trigger. Modal: wraps within the panel.'
    when: open
    from: last
    given:
      modal: false
    expect: closes
  - keys:
    - Shift+Tab
    action: 'Non-modal: from the first element in the panel, returns focus to the
      trigger and closes (reason `tab-out`).'
    when: open
    from: first
    expect:
    - focus-trigger
    - closes
  styles:
    surface:
      token: color.overlay.surface
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.md
      locked: false
    inset:
      token: layout.inset.md
      description: Padding of the panel surface itself. The body Box gets no inset
        of its own, so nothing is forwarded to Box.
      locked: false
    partGap:
      token: layout.gap.normal
      description: 'Between the header row and the body, and between the heading and
        the close button inside the header row. The header is a row: the heading fills
        it and the close button sits at its inline end (still at the end when there
        is no heading), so no padding is reserved for the button. With neither a heading
        nor a close button (`dismissible: false` and no `heading`) the header row
        is not rendered at all, so this gap applies to nothing and the body meets
        the panel inset directly.'
      locked: false
    offset:
      token: space.2
      description: Gap between trigger and panel. Web and Lit apply it as a margin
        on the panel side facing the trigger (the `--ds-popover-offset` hook), which
        the flip check reads back from the computed style — a positioning offset,
        not sibling spacing. Under top/left positioning the margin moves the box only
        when the facing side is the panel's top or left edge (`data-side` bottom or
        right); when it is its bottom or right edge (`data-side` top or left), the
        position math subtracts the read-back value itself, so the gap is the same
        on all four sides. React Native adds it to the position measured from the
        trigger.
      locked: false
    arrowSize:
      token: space.2
      part: arrow
      description: 'A square rotated 45°, filled with `surface` and edged with `border`
        at `borderWidth` on its two outer sides — the two the 45° rotation turns outward:
        facing edge top → top and left, bottom → bottom and right, left → left and
        bottom, right → top and right — centered on the panel edge facing the trigger
        on every platform. "Centered" is a plain 50% of that edge for all eight placements,
        which is exact for the four plain sides and an approximation at the four corners,
        where a narrow trigger can leave the arrow pointing past it; clamping it toward
        the trigger centre would need a measuring pass this component does not make.
        The square''s center sits on the centerline of the panel''s border on that
        edge (half `borderWidth` in from the outer edge), drawn above the panel, so
        its edged sides meet the panel border and its fill covers the border beneath
        its base.'
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
      description: 'The panel''s maximum inline size, itself clamped to the viewport:
        `min(maxWidth, 100vw − 2 × gutter)`, since flip-shift cannot bring a panel
        wider than the viewport into view.'
      locked: false
    gutter:
      token: layout.gutter
      description: Space kept between the panel and each viewport edge when the panel
        flips or shifts, and the clamp `maxWidth` reads. It flips only when the opposite
        side fits within it; otherwise it stays and shifts along the cross axis alone,
        so the main axis may overflow rather than the panel being squeezed or made
        to scroll.
      locked: false
    breakpoint:
      token: layout.maxWidth.prose
      locked: true
      description: 'React Native only: at a window width <= this token the popover
        renders as a BottomSheet. The breakpoint is read from the theme token, not
        per instance. Web and Lit have no narrow presentation.'
    layer:
      token: layer.dropdown
      description: 'The overlay block''s `layer: popover` is the category (the top
        layer via the Popover API or showModal()); this binding stays as the hook
        but has no effect inside the browser top layer or a native Modal, and applies
        to the position: fixed fallback and the React Native anchor view.'
      locked: false
    enter:
      token: motion.duration.fast
      description: 'Fade and an `enterDistance` slide from the trigger side, with
        motion.easing.standard; instant under reduced motion. The slide follows the
        resolved physical side after right-to-left mirroring (`data-side` on web and
        Lit, the resolved edge on React Native): the panel starts `enterDistance`
        toward the trigger and moves away from it to rest.'
      locked: false
    enterDistance:
      token: space.1
      description: The length of the enter slide from the trigger side.
      locked: false
    exit:
      token: motion.duration.fast
      description: Fade out with motion.easing.exit and no slide (the enter slide
        does not reverse); instant under reduced motion.
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    closeLabel: Close
  overlay:
    layer: popover
    anchor: trigger
    placement: placement
    collision: flip-shift
    open: open
    closeEvent: onOpenChange
    dismiss:
    - escape
    - outside-press
    - close-button
    - focus-out
    modal: false
  a11y:
    role: dialog
    requires:
    - accessible-name
    - expanded-state
    - escape-dismiss
    - focus-restore
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-24px
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
      element: div
      attributes:
      - role=dialog
      - aria-labelledby
      - aria-modal
      - aria-expanded
      - aria-controls
      notes: 'The trigger is cloned with aria-expanded and aria-controls. The panel
        is <div role="dialog" aria-labelledby={heading or trigger}> rendered through
        a portal with position: fixed from the trigger rect (flip and shift to stay
        within the viewport, repositioned on scroll/resize), on layer.dropdown, wrapped
        in FocusScope (trapped only when modal; autoFocus none and restoreFocus false,
        because the component moves and restores focus itself as Behavior describes).
        Non-modal: a document pointerdown outside panel+trigger closes; Tab past the
        last element closes, focuses the trigger without preventDefault and lets the
        Tab continue from it to the element after the trigger (the portaled panel
        is not next in order, so this does not wait for `open` to go false; with nothing
        after the trigger, focus leaves the page as a native Tab would); Shift+Tab
        from the first element calls preventDefault and focuses the trigger. In both
        directions focus moves before `onOpenChange` fires, so the consumer''s handler
        already sees focus on the trigger. Button writes its own `data-part`, so the
        `closeButton` part is a popover-owned <span data-part="closeButton"> wrapping
        the Button, and a click that lands on the wrapper rather than the button is
        forwarded to it. The `heading` part is a popover-owned <div data-part="heading">
        wrapping the Heading, which receives `id` (for aria-labelledby) and tabIndex
        -1; the wrapper draws the ring (`focusRing` at `focusRingWidth`) with `:has(:focus-visible)`,
        so Heading is not restyled. Modal: uses a native <dialog> with showModal()
        positioned at the trigger; its exit plays through `transition-behavior: allow-discrete`
        on display and overlay, and its enter through `@starting-style` (browsers
        without them show and hide instantly), and the panel unmounts on transitionend/transitioncancel
        or a timer from the computed duration. `data-ds`, the `ref` and the override
        hooks are on the panel, which exists only while open or closing (the ref is
        null while closed); the trigger is the consumer''s element. The panel carries
        `data-side` with the resolved physical side (top, bottom, left or right —
        `start`/`end` already resolved), which the arrow and the enter slide read.
        Use the Popover API (popover="manual") where available for top-layer rendering.
        Non-modal popovers never lock page scroll and use only the pointerdown-outside
        listener for dismissal (Tab/Shift+Tab handlers own the keyboard exits; no
        focusout listener). The arrow, when shown, is centered on the panel edge,
        not on the trigger — exact for the four plain sides, an approximation for
        the four corner placements. When the panel would have no accessible name at
        all (no `heading`, and a trigger with no readable name), a development warning
        fires, as on React Native; nothing invents a name. All eight placements resolve
        `start` and `end` logically from the trigger''s computed direction, so a right-to-left
        page mirrors the corner placements too. The `trigger` is exactly one element,
        typed as such, because the component clones it to attach aria-expanded, aria-controls,
        the toggle handler and a ref.'
    lit:
      tag: ds-popover
      reflect:
      - open
      - placement
      - modal
      - show-arrow
      - prop: dismissible
        attribute: no-dismiss
      - heading-level
      notes: 'Slots: `trigger` and default. The panel renders in the shadow root with
        the Popover API (top layer, no z-index issues) or a fixed fallback. aria-controls
        cannot cross the shadow boundary, so the slotted trigger gets expanded state
        — its `expanded` property when it has one (ds-button, whose inner <button>
        carries the role, ignores aria-expanded on the host), aria-expanded otherwise
        — and the panel is named by `heading` (aria-label) or the trigger''s name
        copied into aria-label, read from the trigger''s aria-label, then its `accessibleName`,
        then its `label`, then its textContent. The panel follows the trigger slot
        in the tab order, so Tab from the last element prevents default and focuses
        the first focusable element after the host (the trigger if there is none)
        without waiting for `open` to go false; "focusable" there is FocusScope''s
        walker run over the document in DOM order (descending open shadow roots and
        slots, skipping disabled, inert, aria-hidden and tabindex=-1 elements; a positive
        tabindex is not reordered) — the walk is FocusScope''s own exported `focusableIn`,
        shared API rather than a per-component reimplementation, since a Popover that
        resolved first and last differently from the FocusScope trapping the same
        panel would be a live bug. Shift+Tab from the first element prevents default
        and focuses the trigger; in both directions focus moves before `open-change`
        fires. The close button''s glyph is `<ds-icon name="close">` in ds-button''s
        `leading-icon` slot, since ds-button has no leadingIcon property. Every composed
        part (heading, body, close button) is a popover-owned wrapper element carrying
        `data-part`; tabindex -1 goes on the <ds-heading> itself and the heading wrapper
        draws the ring with `:has(:focus-visible)`. `focusScope` is the exception:
        a composed part that is itself a wrapper component takes the `data-part` (and
        `part`) on its own <ds-focus-scope> host rather than getting a second wrapper.
        `open` reflects the controlled property only — an uncontrolled popover keeps
        its state internally and never writes the attribute, so a consumer that sets
        and then removes the attribute has made the popover controlled, which is the
        documented meaning of setting it. A panel `data-side` holds the resolved physical
        side, as on web. Composed `open-change`.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      notes: 'Phones (window width <= the `breakpoint` token): a BottomSheet with
        height content (a floating panel over a phone page is hard to dismiss and
        easy to lose). The sheet is always dismissible with its close button shown
        and always modal, so Popover''s `dismissible`, `modal` and `headingLevel`
        have no effect there; its title is `heading`, else the trigger element''s
        `accessibleName` prop, else its `accessibilityLabel`, else its string `label`
        prop (native cannot read rendered text) — the same chain Button resolves its
        own name by, so a trigger named only through `accessibilityLabel` names the
        panel too — and with none of them the title is empty and a __DEV__ warning
        fires, since the sheet would have no accessible name; the same warning fires
        in the tablet presentation whenever the panel has no name. BottomSheet close
        reason → Popover reason, as one exhaustive map: `scrim` → `outside`, `drag`
        → `outside`, `escape` → `escape`, `close-button` → `close-button`, `action`
        → `close-button` (BottomSheet never raises `action` itself; the key exists
        only for exhaustiveness). Popover forwards only the overridable bindings it
        shares with BottomSheet — shadow, radius, inset, partGap, layer, enter, exit
        — passing Popover''s resolved value (default token or override) for shadow,
        radius, inset and partGap, and passing `layer`, `enter` and `exit` only when
        the caller overrode them, so the sheet otherwise keeps its own layer and its
        own durations: a sheet should not rise faster merely because a Popover produced
        it. `surface`, `focusRing` and `focusRingWidth` are locked on Popover (the
        surface is in a contrast pair; focus rings always lock), so they are not forwarded;
        neither is `maxWidth`, which BottomSheet reads as its theme breakpoint rather
        than a panel width; border, borderWidth, offset, arrowSize, enterDistance
        and maxWidth have no effect in that presentation. Tablets and react-native-web:
        a transparent Modal with the panel positioned from measureInWindow() of the
        trigger and a backdrop Pressable. Non-modal: a backdrop press closes with
        `outside`. modal=true: the backdrop stays transparent (no scrim, as on web),
        a press on it does nothing and FocusScope is trapped. The panel''s own name
        without `heading` is the trigger element''s `accessibleName`, else its string
        `label`. Escape is onRequestClose (the Android back button, Esc on react-native-web),
        reported as `escape`; the modal-Escape scenario is web and Lit only because
        there is no key to press in a native test. The Modal exposes no ref and Popover
        declares no `ref` prop on this platform; callers ref their trigger. Modal
        intercepts every touch behind it, so `modal: false` cannot leave the page
        interactive here — it means only that tapping outside closes, and that is
        the native reading of non-modal. `accessibilityViewIsModal` still follows
        `modal`, so a non-modal popover does not claim the VoiceOver rotor even while
        it holds touches: screen-reader users keep the page behind, which is the closer
        reading of the prop. The panel View is not `accessible` — it wraps focusable
        controls, and marking it accessible would collapse the close button and the
        body into one VoiceOver element — so the accessible name is asserted on the
        panel''s own props rather than through a role query. The trigger Button receives
        `expanded`, so the state is announced. Focus on open lands on the panel body
        wrapper: native has no descendant walker, so "the first control, else the
        heading" resolves to the one target there is. Pressable sees no key events,
        so Tab never leaves the panel by key and `onOpenChange` never fires with reason
        `tab-out` on this platform. The panel is measured once per open, so it does
        not follow a scrolling page; it is held at opacity 0 until measureInWindow()
        and its own onLayout have both reported, so it never appears at a guessed
        position and then jumps. In the tablet presentation the root testID `Popover`
        is on the panel View (a closed Modal renders nothing) and there is no separate
        `Popover.panel`; in the phone presentation the BottomSheet carries its own
        root testID and nothing carries `Popover`, and a closed popover has no testID
        on either. The composed parts'' the composed parts'' testIDs (`Popover.heading`,
        `Popover.body`, `Popover.closeButton`) sit on popover-owned Views wrapping
        the Heading, Box and Button, since Button takes no testID.'
    swiftui:
      element: popover
      props:
      - .popover
      - attachmentAnchor
      - arrowEdge
      - .presentationCompactAdaptation
      - FocusScope
      - .onExitCommand
      notes: '`.popover(isPresented:attachmentAnchor:arrowEdge:)` with `.presentationCompactAdaptation(.popover)`
        so a phone shows a real popover, not a sheet; `placement` maps to `arrowEdge`.
        `modal` composes FocusScope with `trap`; non-modal popovers leave focus with
        the trigger and close on outside tap (system behavior). The panel is the package
        surface with `color.overlay.surface` through `.presentationBackground`. Heading
        names the panel.'
  behavior:
  - name: close-button-fires-on-open-change
    description: The close button reports the close; the consumer owns `open` when
      it is controlled.
    given:
      open: true
    when:
      click: closeButton
    then:
    - event: onOpenChange
  - name: escape-closes-a-modal-popover
    description: A modal popover is a small Dialog — Escape and the close button are
      the only ways out, and Escape always works (keyboard rule 2).
    given:
      open: true
      modal: true
    when:
      key: Escape
    then:
    - event: onOpenChange
    platforms:
    - web
    - lit
  - name: the-panel-is-named-by-its-heading
    description: With a heading the panel is a dialog named by it rather than by the
      trigger.
    given:
      open: true
      heading: Filters
    then:
    - name: Filters
  examples:
  - name: filter-panel
    description: A compact panel of controls behind a Filters button, aligned to the
      start of the trigger.
    given:
      trigger: A Filters Button
      children: A Form of filter controls with an Apply Button in the Form's `actions`
      heading: Filters
      placement: bottom-start
  - name: date-picker-panel
    description: Quick date choices anchored under a date field. A full calendar is
      DatePicker's own popup, and popovers do not nest.
    given:
      trigger: A date field Button with the calendar Icon labelled with the literal
        date "16 September 2026" (the story does not compute today, and every platform
        uses that same string)
      children: 'Three quick-pick date Buttons: Today, Tomorrow, Next week'
  - name: required-step
    description: A short form that must be submitted or cancelled, so the panel traps
      focus like a Dialog.
    given:
      trigger: An Add member Button
      children: A Form with an email Input and a Save Button in the Form's `actions`
      heading: Add member
      modal: true
  - name: contextual-help
    description: A help note with a link, pointed at its trigger.
    given:
      trigger: An icon-only Button labelled "Help" with the info Icon
      children: One sentence of help ending in a Link to the guide
      showArrow: true
      placement: end
```

## Events

- `onOpenChange`: emit `onOpenChange`
  - payload, positional, in this order: `open: boolean`, `reason: 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out'`
  - reasons: `trigger` (the trigger was activated); `escape` (Escape pressed while open); `outside` (a pointer press landed outside the popover); `close-button` (the close button was activated); `tab-out` (Tab moved focus past the end of the popover, or Shift+Tab moved it back past the start to the trigger (both directions report tab-out))
  - fires on: user
  - timing: after-change

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `onOpenChange`); drives state `open`

## Parts and slots

- `trigger`: slot, prop `trigger`, required
- `panel`: element
- `focusScope`: component `FocusScope`; props `trapped` ← prop `modal`, `autoFocus` = "none", `restoreFocus` = false, `active` ← prop `open`
- `heading`: component `Heading`; props `level` ← prop `headingLevel`
- `body`: component `Box`
- `closeButton`: component `Button`; props `variant` = "ghost", `size` = "sm", `iconOnly` = true, `leadingIcon` = "close"
- `arrow`: element

## Style bindings

- `arrowSize`: token `space.2`; part `arrow`

## Keyboard

- `Escape` (Closes and returns focus to the trigger.): expect closes, then focus-trigger
- `Tab` (Non-modal: after the last element in the panel, closes and moves focus to the element after the trigger. Modal: wraps within the panel.): expect closes; given `modal: false`; story URL `/iframe.html?id=popover-react--keyboard&viewMode=story&args=modal:!false`
- `Shift+Tab` (Non-modal: from the first element in the panel, returns focus to the trigger and closes (reason `tab-out`).): expect focus-trigger, then closes

## Form and overlay

```yaml
overlay:
  layer: popover
  anchor: trigger
  placement: placement
  collision: flip-shift
  open: open
  closeEvent: onOpenChange
  dismiss:
  - escape
  - outside-press
  - close-button
  - focus-out
  modal: false
```

`overlay.closeEvent` emits `onOpenChange`.

## Constants and examples

- example `filter-panel`, story `FilterPanel`: given `trigger: "A Filters Button"`, `children: "A Form of filter controls with an Apply Button in the Form's `actions`"`, `heading: "Filters"`, `placement: "bottom-start"`; A compact panel of controls behind a Filters button, aligned to the start of the trigger.
- example `date-picker-panel`, story `DatePickerPanel`: given `trigger: "A date field Button with the calendar Icon labelled with the literal date \"16 September 2026\" (the story does not compute today, and every platform uses that same string)"`, `children: "Three quick-pick date Buttons: Today, Tomorrow, Next week"`; Quick date choices anchored under a date field. A full calendar is DatePicker's own popup, and popovers do not nest.
- example `required-step`, story `RequiredStep`: given `trigger: "An Add member Button"`, `children: "A Form with an email Input and a Save Button in the Form's `actions`"`, `heading: "Add member"`, `modal: true`; A short form that must be submitted or cancelled, so the panel traps focus like a Dialog.
- example `contextual-help`, story `ContextualHelp`: given `trigger: "An icon-only Button labelled \"Help\" with the info Icon"`, `children: "One sentence of help ending in a Link to the guide"`, `showArrow: true`, `placement: "end"`; A help note with a link, pointed at its trigger.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed, but they still declare their hook: `locked` closes the override API, not the styling hook. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so, and for a locked binding it is the only way it can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `offset`, `arrowSize`, `maxWidth`, `gutter`, `layer`, `enter`, `enterDistance`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `breakpoint`, `focusRing`, `focusRingWidth`

## Behavior scenarios (17)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: close-button-fires-on-open-change
  description: The close button reports the close; the consumer owns `open` when it
    is controlled.
  given:
    open: true
  when:
    click: closeButton
  then:
  - event: onOpenChange
- name: escape-closes-a-modal-popover
  description: A modal popover is a small Dialog — Escape and the close button are
    the only ways out, and Escape always works (keyboard rule 2).
  given:
    open: true
    modal: true
  when:
    key: Escape
  then:
  - event: onOpenChange
  platforms:
  - web
  - lit
- name: the-panel-is-named-by-its-heading
  description: With a heading the panel is a dialog named by it rather than by the
    trigger.
  given:
    open: true
    heading: Filters
  then:
  - name: Filters
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-heading-level-2
  given:
    headingLevel: '2'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-3
  given:
    headingLevel: '3'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-4
  given:
    headingLevel: '4'
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom-start
  given:
    placement: bottom-start
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom
  given:
    placement: bottom
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom-end
  given:
    placement: bottom-end
  then:
  - renders: true
  derived: true
- name: renders-placement-top-start
  given:
    placement: top-start
  then:
  - renders: true
  derived: true
- name: renders-placement-top
  given:
    placement: top
  then:
  - renders: true
  derived: true
- name: renders-placement-top-end
  given:
    placement: top-end
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
element: div
attributes:
- role=dialog
- aria-labelledby
- aria-modal
- aria-expanded
- aria-controls
notes: "The trigger is cloned with aria-expanded and aria-controls. The panel is <div\
  \ role=\"dialog\" aria-labelledby={heading or trigger}> rendered through a portal\
  \ with position: fixed from the trigger rect (flip and shift to stay within the\
  \ viewport, repositioned on scroll/resize), on layer.dropdown, wrapped in FocusScope\
  \ (trapped only when modal; autoFocus none and restoreFocus false, because the component\
  \ moves and restores focus itself as Behavior describes). Non-modal: a document\
  \ pointerdown outside panel+trigger closes; Tab past the last element closes, focuses\
  \ the trigger without preventDefault and lets the Tab continue from it to the element\
  \ after the trigger (the portaled panel is not next in order, so this does not wait\
  \ for `open` to go false; with nothing after the trigger, focus leaves the page\
  \ as a native Tab would); Shift+Tab from the first element calls preventDefault\
  \ and focuses the trigger. In both directions focus moves before `onOpenChange`\
  \ fires, so the consumer's handler already sees focus on the trigger. Button writes\
  \ its own `data-part`, so the `closeButton` part is a popover-owned <span data-part=\"\
  closeButton\"> wrapping the Button, and a click that lands on the wrapper rather\
  \ than the button is forwarded to it. The `heading` part is a popover-owned <div\
  \ data-part=\"heading\"> wrapping the Heading, which receives `id` (for aria-labelledby)\
  \ and tabIndex -1; the wrapper draws the ring (`focusRing` at `focusRingWidth`)\
  \ with `:has(:focus-visible)`, so Heading is not restyled. Modal: uses a native\
  \ <dialog> with showModal() positioned at the trigger; its exit plays through `transition-behavior:\
  \ allow-discrete` on display and overlay, and its enter through `@starting-style`\
  \ (browsers without them show and hide instantly), and the panel unmounts on transitionend/transitioncancel\
  \ or a timer from the computed duration. `data-ds`, the `ref` and the override hooks\
  \ are on the panel, which exists only while open or closing (the ref is null while\
  \ closed); the trigger is the consumer's element. The panel carries `data-side`\
  \ with the resolved physical side (top, bottom, left or right \u2014 `start`/`end`\
  \ already resolved), which the arrow and the enter slide read. Use the Popover API\
  \ (popover=\"manual\") where available for top-layer rendering. Non-modal popovers\
  \ never lock page scroll and use only the pointerdown-outside listener for dismissal\
  \ (Tab/Shift+Tab handlers own the keyboard exits; no focusout listener). The arrow,\
  \ when shown, is centered on the panel edge, not on the trigger \u2014 exact for\
  \ the four plain sides, an approximation for the four corner placements. When the\
  \ panel would have no accessible name at all (no `heading`, and a trigger with no\
  \ readable name), a development warning fires, as on React Native; nothing invents\
  \ a name. All eight placements resolve `start` and `end` logically from the trigger's\
  \ computed direction, so a right-to-left page mirrors the corner placements too.\
  \ The `trigger` is exactly one element, typed as such, because the component clones\
  \ it to attach aria-expanded, aria-controls, the toggle handler and a ref."
```

## Guidance

## Overview

A popover is a small panel that appears next to the thing you clicked and stays out of the way of everything else. It is for content that needs interaction but not the whole screen: pick a date, choose a color, adjust two settings, read a help note with a link. Unlike a Tooltip it can contain controls; unlike a Dialog it does not take over the page.

## When to use

Use a Popover for a compact interactive panel tied to a trigger: a date picker under a date field, a color swatch, a filter panel behind a "Filters" button, a share panel, contextual help with a link. Use `modal` when the panel contains a required step (a short form that must be submitted or cancelled). Use `heading` when the content is not obvious from the trigger.

## When not to use

Do not use a Popover for text-only hints (Tooltip), for a list of actions (Menu), for a list of options (Select/Combobox), or for anything that needs more than a small panel's worth of content or must be completed before continuing (Dialog). Do not nest popovers. Do not open one on hover.

## Behavior

The trigger toggles the popover; opening positions the panel at `placement`, flipping or shifting to stay in view, moves focus to the first control, and marks the trigger expanded. The first control is the first focusable element in the body, then the close button, then the heading (made focusable with tabindex -1), then the panel itself. The close button is labelled `copy.closeLabel` and keeps Button's own ghost colors. Non-modal: the page stays live; Escape, the close button, a click outside, and tabbing past the last element close it; Shift+Tab from the first element returns to the trigger and closes. There is no focusout listener on any platform: the overlay block's `focus-out` is realized by the Tab and Shift+Tab handlers, reported as `tab-out`, and `outside-press` is reported as `outside`; focus moved out programmatically leaves the popover open. Modal: the panel is a small Dialog — trapped focus, inert page, Escape and close only. Closing by the trigger, Escape or the close button returns focus to the trigger as soon as `open` goes false; an outside press leaves focus where the press put it, and Tab out moves it to the element after the trigger. When a controlled consumer sets `open` false with no reason from the popover, focus returns to the trigger only if it is inside the panel at that moment; otherwise it stays where it is. A modal popover's `close()` has by then moved focus to the document body, so the body counts as inside for this test — Escape and the close button still restore focus on a modal popover. FocusScope's `active` follows `open`, so from the moment `open` is false a panel still mounted for its exit transition never pulls focus back. The panel repositions on scroll and resize while open.

Initial focus uses the order above (body control, close button, heading, panel). The keyboard rules' "first" and "last element in the panel" mean something else: the first and last tabbable elements in panel DOM order, where the header row (with the close button) comes before the body, so with a close button Shift+Tab-out starts from the close button. With no tabbable element in the panel (focus on the heading or the panel itself), non-modal Tab closes as a Tab out past the last element and Shift+Tab closes as a Shift+Tab back to the trigger, both reported `tab-out`; a modal panel keeps focus where it is. A modal popover's native <dialog> may raise `cancel` on Escape before focus has moved in, or close without a `cancel` at all; both are reported as `escape`, and if the consumer still holds `open` true the dialog is shown again.

The parts get wiring every platform passes, not composition props: the Heading's id (web), ref and tabindex -1 for naming and the focus fallback; the close Button's `label` from `copy.closeLabel`, its system Icon `close` glyph and its press handler; the trigger's expanded state, controls link and toggle handler.

The Default story is open, with the filter-panel example's args, so the derived scenarios (accessible name, renders) find the named panel; the derived accessible-name scenario targets the panel, not the trigger. Every story except the examples — Default, Keyboard, the gates, and the enum and state stories (headingLevel, placement, modal, showArrow, dismissible), whose difference is only visible open — renders through a wrapper that owns `open`, starting true, and writes `onOpenChange` back into it, acting as the consumer; there is no meta-level open wrapper. Example stories read as if they started from blank args: Storybook merges `meta.args` into every story, so each example writes out every prop it needs at its schema default instead (date-picker-panel and contextual-help set `heading` back to undefined), and since no example gives `open`, the four examples render closed and uncontrolled, which is intended; the uncontrolled popover always starts closed. The boolean state stories are named for the effect, not the prop and value: `Modal`, `WithArrow` and `NotDismissible` on every platform — where React already named a story for the effect, parity wins over the `<Prop><Value>` reading.

## Content guidelines

Headings are short noun phrases naming the panel's purpose ("Filters", "Pick a color"). Content fits without scrolling; a popover that scrolls is a Dialog or a page. Keep one primary action, placed last.

## Accessibility

The panel is a `dialog` named by its heading or trigger, and the trigger exposes `aria-expanded` and `aria-controls` (WCAG 4.1.2; APG non-modal dialog guidance). Focus moves in on open and back to the trigger on close (2.4.3); Escape always closes (2.1.2). Non-modal popovers do not trap focus — Tab leaves them — so keyboard users are never stuck, and modal ones use FocusScope with the inert page like Dialog. Contrast on the overlay surface is checked in both modes; motion respects reduced-motion; the close button meets 24px.

## Platform notes

### Web
Clone the trigger with `aria-expanded`, `aria-controls={panelId}` and an `onClick` toggle. Render the panel through a portal: `<div role="dialog" id aria-labelledby>` with `position: fixed`, computed from the trigger's rect for `placement` (flip when overflowing, shift along the cross axis), `z-index: var(--layer-dropdown)`, `max-inline-size` from the token, wrapped in `FocusScope trapped={modal} autoFocus="none" restoreFocus={false} active={open}` (the component focuses the first control and restores focus itself). Non-modal: `pointerdown` on document outside panel and trigger closes; there is no `focusout` listener; keydown Tab on the last focusable element closes, focuses the trigger and lets the Tab continue; Shift+Tab on the first focuses the trigger and closes. Modal: render inside a `<dialog>` opened with `showModal()` and positioned at the trigger. Optional arrow as a rotated square `<span aria-hidden>` on the `data-side` edge.

### Lit
`<ds-popover placement="bottom-start"><ds-button slot="trigger" label="Filters"></ds-button><div>…</div></ds-popover>`; the panel uses `popover="manual"` and `showPopover()` with fixed positioning as fallback; composes `<ds-focus-scope>`, `<ds-heading>`, `<ds-button>`; composed `open-change`.

### React Native
Phones (window width <= the `breakpoint` token): render `BottomSheet` with `height="content"`, `heading={heading ?? trigger accessibleName ?? trigger label}`. Tablets / react-native-web: a transparent `Modal` whose backdrop `Pressable` closes (unless `modal`) and whose panel `View` is positioned from `measureInWindow()`, wrapped in `FocusScope`. The trigger `Button` gets `accessibilityState={{ expanded }}`.

## Related

Tooltip, Dialog, Menu, BottomSheet, FocusScope.
