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
    onDragDismiss:
      description: The user dragged the sheet past the dismiss threshold. Fired before
        `onClose` with reason drag; provided so analytics can distinguish gestures.
      gesture: true
      platforms:
        web: onDragDismiss
        lit: drag-dismiss
        rn: onDragDismiss
        swiftui: onDragDismiss
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
      locked: false
    surface:
      token: color.overlay.surface
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
      description: A 4×36-unit pill (space.1 tall, space.10 wide) centered in the
        header, decorative.
      locked: true
    handleHeight:
      token: space.1
      locked: false
    handleWidth:
      token: space.10
      locked: false
    inset:
      token: layout.inset.lg
      locked: false
    partGap:
      token: layout.gap.loose
      locked: false
    footerGap:
      token: layout.gap.tight
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
  copy:
    closeLabel: Close
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
      - no-dismiss
      - drag-to-dismiss
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `radius`, `handleHeight`, `handleWidth`, `inset`, `partGap`, `footerGap`, `maxWidth`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `handle`, `focusRing`, `focusRingWidth`

## Behavior scenarios (5)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
  via env(safe-area-inset-bottom).'
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
