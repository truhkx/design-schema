---
title: Popover
description: A small non-modal panel anchored to a trigger for content that needs a moment of attention without leaving the page — a date picker, a color picker, a short form, help text with a link. Tooltip's interactive sibling.
component:
  name: Popover
  category: overlay
  status: review
  apg: dialog-modal
  anatomy: [trigger, panel, focusScope, heading, body, closeButton, arrow]
  composition:
    focusScope: FocusScope
    heading: Heading
    closeButton: Button
    body: Box
  props:
    trigger:
      type: content
      required: true
      description: 'Exactly one focusable element — usually a Button — that opens the popover; typed as a single element, since it is cloned with aria-expanded/aria-controls (Button''s `expanded` prop on native) and the toggle handler.'
    children:
      type: content
      required: true
      description: The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling.
    heading:
      type: string
      description: Optional heading at the top of the panel, also the accessible name. Without it, the panel is named by the trigger.
    headingLevel:
      type: enum
      values: ['2', '3', '4']
      default: '3'
      description: Heading level of the panel heading, so it fits the page outline (a popover usually sits under a level-2 section).
    open:
      type: boolean
      description: Controlled open state. Omit for uncontrolled (the trigger toggles it).
    placement:
      type: enum
      values: [bottom-start, bottom, bottom-end, top-start, top, top-end, start, end]
      default: bottom
      description: 'Preferred side and alignment; flips and shifts to stay in the viewport. All eight values are logical: `start`/`end` and the `-start`/`-end` alignments mirror in right-to-left writing (the same rule as Tooltip and Menu).'
    modal:
      type: boolean
      default: false
      description: 'False (default): the page stays interactive; clicking outside closes; focus moves in but is not trapped, and Tab out closes. True: behaves as a small Dialog anchored to the trigger — focus trapped, background inert — for content that must be finished (a required form).'
    showArrow:
      type: boolean
      default: false
      description: A small pointer toward the trigger. Off by default; Calm & precise prefers a plain edge.
    dismissible:
      type: boolean
      default: true
      description: Show the close button. Escape and outside click work regardless (non-modal).
  events:
    onOpenChange:
      description: 'Fired when the popover opens or closes, with the new state and a reason: `trigger`, `escape`, `outside`, `close-button`, `tab-out`.'
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange, swiftui: onOpenChange }
  keyboard:
    - { keys: [Enter, ' '], action: Toggles the popover from the trigger., when: focus on trigger, from: trigger, expect: manual }
    - { keys: [Escape], action: Closes and returns focus to the trigger., when: open, from: inside, expect: focus-trigger }
    - { keys: [Tab], action: 'Non-modal: after the last element in the panel, closes and moves focus to the element after the trigger. Modal: wraps within the panel.', when: open, from: last, expect: manual }
    - { keys: [Shift+Tab], action: 'Non-modal: from the first element in the panel, returns focus to the trigger and closes.', when: open, from: first, expect: focus-trigger }
  styles:
    surface: { token: color.overlay.surface }
    border: { token: color.border }
    borderWidth: { token: border.width.thin }
    shadow: { token: shadow.overlay }
    radius: { token: radius.md }
    inset: { token: layout.inset.md }
    partGap: { token: layout.gap.normal, description: Between heading and body. }
    offset: { token: space.2, description: Gap between trigger and panel. }
    arrowSize: { token: space.2 }
    maxWidth: { token: layout.maxWidth.prose }
    layer: { token: layer.dropdown }
    enter: { token: motion.duration.fast, description: Fade and a space.1 slide from the trigger side; instant under reduced motion. }
    exit: { token: motion.duration.fast }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  copy:
    closeLabel: Close
  a11y:
    role: dialog
    requires: [accessible-name, expanded-state, escape-dismiss, focus-restore, keyboard-operable, focus-visible, contrast-aa, reduced-motion, target-24px]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
      - { foreground: color.link, background: color.overlay.surface, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=dialog, aria-labelledby, aria-modal, aria-expanded, aria-controls]
      notes: 'The trigger is cloned with aria-expanded and aria-controls. The panel is <div role="dialog" aria-labelledby={heading or trigger}> rendered through a portal with position: fixed from the trigger rect (flip and shift to stay within the viewport, repositioned on scroll/resize), on layer.dropdown, wrapped in FocusScope (trapped only when modal; autoFocus first). Non-modal: a document pointerdown outside panel+trigger closes; focusout to outside closes; Tab past the last element closes and lets focus continue. Modal: uses a native <dialog> with showModal() positioned at the trigger. Use the Popover API (popover="manual") where available for top-layer rendering. Non-modal popovers never lock page scroll and use only the pointerdown-outside listener for dismissal (Tab/Shift+Tab handlers own the keyboard exits; no focusout listener). The arrow, when shown, is centered on the panel edge, not on the trigger.'
    lit:
      tag: ds-popover
      reflect: [open, placement, modal, show-arrow, no-dismiss, heading-level]
      notes: 'Slots: `trigger` and default. The panel renders in the shadow root with the Popover API (top layer, no z-index issues) or a fixed fallback. aria-controls cannot cross the shadow boundary, so aria-expanded is set on the slotted trigger and the panel is named by `heading` (aria-label) or the trigger''s text copied into aria-label. Composed `open-change`.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose]
      notes: 'Phones: a BottomSheet with height content (a floating panel over a phone page is hard to dismiss and easy to lose). Tablets and react-native-web: a transparent Modal with the panel positioned from measureInWindow() of the trigger and a backdrop Pressable that closes. modal=true adds a scrim.'
    swiftui:
      element: popover
      props: [.popover, attachmentAnchor, arrowEdge, .presentationCompactAdaptation, FocusScope, .onExitCommand]
      notes: '`.popover(isPresented:attachmentAnchor:arrowEdge:)` with `.presentationCompactAdaptation(.popover)` so a phone shows a real popover, not a sheet; `placement` maps to `arrowEdge`. `modal` composes FocusScope with `trap`; non-modal popovers leave focus with the trigger and close on outside tap (system behavior). The panel is the package surface with `color.overlay.surface` through `.presentationBackground`. Heading names the panel.'
---

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
