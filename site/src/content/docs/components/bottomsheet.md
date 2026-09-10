---
title: BottomSheet
description: A modal surface that rises from the bottom edge on phones and behaves as a Dialog on wide screens — the mobile idiom for a task or a set of choices, with a visible close and an optional drag to dismiss.
component:
  name: BottomSheet
  category: overlay
  status: review
  apg: dialog-modal
  anatomy: [scrim, surface, focusScope, handle, header, heading, body, footer, closeButton]
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
      description: The sheet's title and accessible name. May be visually hidden with `hideHeading` when the content is self-explanatory (a share sheet).
    hideHeading:
      type: boolean
      default: false
      description: Keep the heading for assistive technology but do not render it (forwarded to Dialog above the breakpoint).
      a11y: The accessible name is required regardless; visually hidden is fine, absent is not.
    children:
      type: content
      required: true
      description: The body. Scrolls inside the sheet when taller than the sheet's height.
    footer:
      type: content
      description: Action row, pinned to the bottom of the sheet above the safe area.
    height:
      type: enum
      values: [content, half, full]
      default: content
      description: '`content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows.'
    dismissible:
      type: boolean
      default: true
      description: Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the footer actions close it; Escape still reports.
    dragToDismiss:
      type: boolean
      default: true
      description: 'Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. The dismiss then plays the normal exit transition (no momentum physics). The body ScrollView does not start the gesture; only the handle and header do. Purely additive: the close button and Escape always exist.'
      a11y: 'A gesture is never the only way to dismiss (WCAG 2.5.1); the handle is not a focus stop.'
  events:
    onClose:
      description: 'Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`.'
      platforms: { web: onClose, lit: close, rn: onClose }
    onDragDismiss:
      description: The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag; provided so analytics can distinguish gestures.
      gesture: true
      platforms: { web: onDragDismiss, lit: drag-dismiss, rn: onDragDismiss }
  keyboard:
    - { keys: [Escape], action: Requests close with reason escape., from: inside, expect: closes }
    - { keys: [Tab], action: From the last element wraps to the first; the handle is never a stop., from: last, expect: focus-wraps-to-first }
    - { keys: [Shift+Tab], action: From the first element wraps to the last., from: first, expect: focus-wraps-to-last }
  styles:
    scrim: { token: color.overlay.scrim }
    surface: { token: color.overlay.surface }
    shadow: { token: shadow.overlay }
    radius: { token: radius.lg, description: Top corners only on phones; all corners when it renders as a Dialog. }
    handle: { token: color.foreground.muted, description: 'A 4×36-unit pill (space.1 tall, space.10 wide) centered in the header, decorative.' }
    handleHeight: { token: space.1 }
    handleWidth: { token: space.10 }
    inset: { token: layout.inset.lg }
    partGap: { token: layout.gap.loose }
    footerGap: { token: layout.gap.tight }
    maxWidth: { token: layout.maxWidth.prose, description: 'Read once from the theme (the breakpoint is not per-instance overridable). Above this viewport width the sheet renders as a centered Dialog of size md instead of rising from the edge.' }
    layer: { token: layer.sheet }
    enter: { token: motion.duration.base, description: 'Slide up from the bottom edge with the scrim fading; motion.easing.standard; instant under reduced motion.' }
    exit: { token: motion.duration.fast, description: 'Slide down with motion.easing.exit; a drag dismiss continues at the drag velocity.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  copy:
    closeLabel: Close
  a11y:
    role: dialog
    requires: [accessible-name, focus-trap, focus-restore, escape-dismiss, inert-background, scroll-lock, gesture-alternative, keyboard-operable, focus-visible, contrast-aa, reduced-motion, target-44px]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA, large: true }
  platforms:
    web:
      element: dialog
      attributes: [aria-modal, aria-labelledby]
      notes: 'The same native <dialog> as Dialog, positioned at the bottom edge with inset-block-end: 0 and full width below the maxWidth token; above it, the generator renders Dialog directly (composition, not duplication). Drag uses Pointer Events on the handle/header with setPointerCapture; the handle is aria-hidden and not focusable. Safe-area padding via env(safe-area-inset-bottom).'
    lit:
      tag: ds-bottom-sheet
      reflect: [open, height, no-dismiss, drag-to-dismiss]
      notes: 'Shadow <dialog> with showModal(); a matchMedia listener on the maxWidth token switches between sheet and dialog presentation. `close` and `drag-dismiss` are composed CustomEvents.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose, statusBarTranslucent, accessibilityViewIsModal]
      notes: 'Native Modal with an Animated.View surface translated from the bottom; PanResponder (or the platform gesture handler if the app already has it — not a new dependency) on the header for drag; onRequestClose → escape. Safe area via SafeAreaView / the bottom inset. On tablets above the maxWidth token, present as Dialog. This is the mobile-first overlay: on phones prefer it to Dialog for anything the thumb should reach.'
---

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
