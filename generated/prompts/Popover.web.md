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
    focusScope: FocusScope
    heading: Heading
    closeButton: Button
    body: Box
  props:
    trigger:
      type: content
      required: true
      description: Exactly one focusable element — usually a Button — that opens the
        popover; typed as a single element, since it is cloned with aria-expanded/aria-controls
        (Button's `expanded` prop on native) and the toggle handler.
    children:
      type: content
      required: true
      description: The panel content. May contain controls, links and a short Form;
        keep it to what fits without scrolling.
    heading:
      type: string
      description: Optional heading at the top of the panel, also the accessible name.
        Without it, the panel is named by the trigger.
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      default: '3'
      description: Heading level of the panel heading, so it fits the page outline
        (a popover usually sits under a level-2 section).
    open:
      type: boolean
      description: Controlled open state. Omit for uncontrolled (the trigger toggles
        it).
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
        — for content that must be finished (a required form).'
    showArrow:
      type: boolean
      default: false
      description: A small pointer toward the trigger. Off by default; Calm & precise
        prefers a plain edge.
    dismissible:
      type: boolean
      default: true
      description: Show the close button. Escape and outside click work regardless
        (non-modal).
  events:
    onOpenChange:
      description: 'Fired when the popover opens or closes, with the new state and
        a reason: `trigger`, `escape`, `outside`, `close-button`, `tab-out`.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
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
    expect: focus-trigger
  - keys:
    - Tab
    action: 'Non-modal: after the last element in the panel, closes and moves focus
      to the element after the trigger. Modal: wraps within the panel.'
    when: open
    from: last
    expect: manual
  - keys:
    - Shift+Tab
    action: 'Non-modal: from the first element in the panel, returns focus to the
      trigger and closes.'
    when: open
    from: first
    expect: focus-trigger
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
      locked: false
    partGap:
      token: layout.gap.normal
      description: Between heading and body.
      locked: false
    offset:
      token: space.2
      description: Gap between trigger and panel.
      locked: false
    arrowSize:
      token: space.2
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
      locked: false
    layer:
      token: layer.dropdown
      locked: false
    enter:
      token: motion.duration.fast
      description: Fade and a space.1 slide from the trigger side; instant under reduced
        motion.
      locked: false
    exit:
      token: motion.duration.fast
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
        in FocusScope (trapped only when modal; autoFocus first). Non-modal: a document
        pointerdown outside panel+trigger closes; focusout to outside closes; Tab
        past the last element closes and lets focus continue. Modal: uses a native
        <dialog> with showModal() positioned at the trigger. Use the Popover API (popover="manual")
        where available for top-layer rendering. Non-modal popovers never lock page
        scroll and use only the pointerdown-outside listener for dismissal (Tab/Shift+Tab
        handlers own the keyboard exits; no focusout listener). The arrow, when shown,
        is centered on the panel edge, not on the trigger.'
    lit:
      tag: ds-popover
      reflect:
      - open
      - placement
      - modal
      - show-arrow
      - no-dismiss
      - heading-level
      notes: 'Slots: `trigger` and default. The panel renders in the shadow root with
        the Popover API (top layer, no z-index issues) or a fixed fallback. aria-controls
        cannot cross the shadow boundary, so aria-expanded is set on the slotted trigger
        and the panel is named by `heading` (aria-label) or the trigger''s text copied
        into aria-label. Composed `open-change`.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      notes: 'Phones: a BottomSheet with height content (a floating panel over a phone
        page is hard to dismiss and easy to lose). Tablets and react-native-web: a
        transparent Modal with the panel positioned from measureInWindow() of the
        trigger and a backdrop Pressable that closes. modal=true adds a scrim.'
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `offset`, `arrowSize`, `maxWidth`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `focusRing`, `focusRingWidth`

## Behavior scenarios (13)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
notes: 'The trigger is cloned with aria-expanded and aria-controls. The panel is <div
  role="dialog" aria-labelledby={heading or trigger}> rendered through a portal with
  position: fixed from the trigger rect (flip and shift to stay within the viewport,
  repositioned on scroll/resize), on layer.dropdown, wrapped in FocusScope (trapped
  only when modal; autoFocus first). Non-modal: a document pointerdown outside panel+trigger
  closes; focusout to outside closes; Tab past the last element closes and lets focus
  continue. Modal: uses a native <dialog> with showModal() positioned at the trigger.
  Use the Popover API (popover="manual") where available for top-layer rendering.
  Non-modal popovers never lock page scroll and use only the pointerdown-outside listener
  for dismissal (Tab/Shift+Tab handlers own the keyboard exits; no focusout listener).
  The arrow, when shown, is centered on the panel edge, not on the trigger.'
```

## Guidance

## Overview

A popover is a small panel that appears next to the thing you clicked and stays out of the way of everything else. It is for content that needs interaction but not the whole screen: pick a date, choose a color, adjust two settings, read a help note with a link. Unlike a Tooltip it can contain controls; unlike a Dialog it does not take over the page.

## When to use

Use a Popover for a compact interactive panel tied to a trigger: a date picker under a date field, a color swatch, a filter panel behind a "Filters" button, a share panel, contextual help with a link. Use `modal` when the panel contains a required step (a short form that must be submitted or cancelled). Use `heading` when the content is not obvious from the trigger.

## When not to use

Do not use a Popover for text-only hints (Tooltip), for a list of actions (Menu), for a list of options (Select/Combobox), or for anything that needs more than a small panel's worth of content or must be completed before continuing (Dialog). Do not nest popovers. Do not open one on hover.

## Behavior

The trigger toggles the popover; opening positions the panel at `placement`, flipping or shifting to stay in view, moves focus to the first control (or the heading, if there are none), and marks the trigger expanded. Non-modal: the page stays live; Escape, the close button, a click outside, and tabbing past the last element close it; Shift+Tab from the first element returns to the trigger and closes. Modal: the panel is a small Dialog — trapped focus, inert page, Escape and close only. Closing returns focus to the trigger. The panel repositions on scroll and resize while open.

## Content guidelines

Headings are short noun phrases naming the panel's purpose ("Filters", "Pick a color"). Content fits without scrolling; a popover that scrolls is a Dialog or a page. Keep one primary action, placed last.

## Accessibility

The panel is a `dialog` named by its heading or trigger, and the trigger exposes `aria-expanded` and `aria-controls` (WCAG 4.1.2; APG non-modal dialog guidance). Focus moves in on open and back to the trigger on close (2.4.3); Escape always closes (2.1.2). Non-modal popovers do not trap focus — Tab leaves them — so keyboard users are never stuck, and modal ones use FocusScope with the inert page like Dialog. Contrast on the overlay surface is checked in both modes; motion respects reduced-motion; the close button meets 24px.

## Platform notes

### Web
Clone the trigger with `aria-expanded`, `aria-controls={panelId}` and an `onClick` toggle. Render the panel through a portal: `<div role="dialog" id aria-labelledby>` with `position: fixed`, computed from the trigger's rect for `placement` (flip when overflowing, shift along the cross axis), `z-index: var(--layer-dropdown)`, `max-inline-size` from the token, wrapped in `FocusScope trapped={modal} autoFocus="first" restoreFocus`. Non-modal: `pointerdown` on document outside panel and trigger closes; `focusout` whose `relatedTarget` is outside closes; keydown Tab on the last focusable element closes and lets focus continue; Shift+Tab on the first focuses the trigger and closes. Modal: render inside a `<dialog>` opened with `showModal()` and positioned at the trigger. Optional arrow as a rotated square `<span aria-hidden>` on the trigger side.

### Lit
`<ds-popover placement="bottom-start"><ds-button slot="trigger" label="Filters"></ds-button><div>…</div></ds-popover>`; the panel uses `popover="manual"` and `showPopover()` with fixed positioning as fallback; composes `<ds-focus-scope>`, `<ds-heading>`, `<ds-button>`; composed `open-change`.

### React Native
Phones: render `BottomSheet` with `height="content"`, `title={heading ?? trigger label}`. Tablets / react-native-web: a transparent `Modal` whose backdrop `Pressable` closes and whose panel `View` is positioned from `measureInWindow()`, wrapped in `FocusScope`. The trigger `Button` gets `accessibilityState={{ expanded }}`.

## Related

Tooltip, Dialog, Menu, BottomSheet, FocusScope.
