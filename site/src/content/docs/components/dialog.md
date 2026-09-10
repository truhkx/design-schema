---
title: Dialog
description: A modal window over the page for a task that must be finished or abandoned before returning — focus trapped, background inert, closed by Escape, focus restored to the opener.
component:
  name: Dialog
  category: overlay
  status: review
  apg: dialog-modal
  anatomy: [scrim, surface, focusScope, header, title, description, body, footer, closeButton]
  composition:
    focusScope: FocusScope
    title: Heading
    description: Text
    closeButton: Button
    body: Box
    footer: Stack
  props:
    open:
      type: boolean
      required: true
      description: Controlled visibility. The consumer owns it; the dialog requests changes through `onClose`.
    title:
      type: string
      required: true
      description: The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project").
      a11y: aria-labelledby the heading; native accessibilityLabel on the Modal content.
    description:
      type: string
      description: One sentence under the title explaining the task or consequence. Becomes the accessible description.
      a11y: aria-describedby.
    children:
      type: content
      required: true
      description: The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put.
    footer:
      type: content
      description: The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body.
    size:
      type: enum
      values: [sm, md, lg]
      default: md
      description: Surface width on wide viewports. Full-width below the content measure on every size.
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the close button and a scrim click all request close. Set false for a dialog that must be answered (then provide the answers in the footer); Escape still fires `onClose` with reason `escape` so the consumer can decide.'
    initialFocus:
      type: enum
      values: [first, title, close]
      default: first
      description: 'Where focus lands on open: the first focusable control in the body (default), the title (for long or reading dialogs), or the close button.'
      a11y: 'Focus must move into the dialog on open and never rest on the scrim or the page behind.'
  events:
    onClose:
      description: 'Fired when the user requests to close, with a reason: `escape`, `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or not).'
      platforms: { web: onClose, lit: close, rn: onClose }
    onOpened:
      description: Fired after the open transition ends and focus has moved in. Use to start work that needs the dialog visible.
      platforms: { web: onOpened, lit: opened, rn: onOpened }
  keyboard:
    - { keys: [Escape], action: Requests close with reason escape (even when not dismissible)., from: inside, expect: closes }
    - { keys: [Tab], action: Moves to the next focusable element inside the dialog., from: first, expect: focus-next }
    - { keys: [Tab], action: 'From the last element, wraps to the first.', from: last, expect: focus-wraps-to-first }
    - { keys: [Shift+Tab], action: 'From the first element, wraps to the last.', from: first, expect: focus-wraps-to-last }
  styles:
    scrim: { token: color.overlay.scrim }
    surface: { token: color.overlay.surface }
    border: { token: color.border, description: 'Hairline; the only edge in a flat theme.' }
    borderWidth: { token: border.width.thin }
    shadow: { token: shadow.overlay }
    radius: { token: radius.lg }
    inset: { token: layout.inset.lg, description: 'Padding of header, body and footer.' }
    partGap: { token: layout.gap.loose, description: 'Gap between header, body and footer.' }
    headerGap: { token: layout.gap.normal, description: Between title/description and the close button. }
    footerGap: { token: layout.gap.tight, description: Between footer actions. }
    widthSm: { token: layout.maxWidth.prose, description: 'Surface width for size sm; md is 3/4 of content and lg is content — both derived from layout.maxWidth.content by the generator, not new tokens.' }
    layer: { token: layer.dialog }
    enter: { token: motion.duration.base, description: 'Scrim fade and surface fade-and-rise (translateY of space.2), motion.easing.standard; instant under reduced motion.' }
    exit: { token: motion.duration.fast, description: With motion.easing.exit. }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  copy:
    closeLabel: Close
  a11y:
    role: dialog
    requires: [accessible-name, focus-trap, focus-restore, escape-dismiss, inert-background, scroll-lock, keyboard-operable, focus-visible, contrast-aa, reduced-motion, target-24px]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
      - { foreground: color.link, background: color.overlay.surface, level: AA }
      - { foreground: color.action.ghost.foreground, background: color.overlay.surface, level: AA }
  platforms:
    web:
      element: dialog
      attributes: [aria-modal, aria-labelledby, aria-describedby]
      notes: 'A native <dialog> opened with showModal(), which gives the top layer, Escape (cancel event → onClose reason escape, preventDefault when not dismissible), and background inertness for free. Rendered through a portal into document.body. ::backdrop is the scrim; a click on the dialog element outside its surface (event.target === dialog) is the scrim click. Focus trap: showModal() traps by inertness; Tab wrap is implemented explicitly because the browser lets Tab leave to the URL bar. Body scroll locked with overflow: hidden on <html> while open, compensating for scrollbar width via scrollbar-gutter. Focus restore to document.activeElement at open time.'
    lit:
      tag: ds-dialog
      reflect: [open, size, dismissible]
      notes: 'Wraps a native <dialog> in the shadow root; the top layer works from inside shadow DOM. `open` is a reflected property the consumer sets; the element calls showModal()/close() in updated(). `close` is a composed CustomEvent with detail { reason }; `opened` likewise. Slots: default (body), `footer`. Title and description are properties rendered as <ds-heading level="2"> and <ds-text>. The close button is a <ds-button variant="ghost" size="sm" icon-only> with <ds-icon name="close">.'
    rn:
      element: Modal
      props: [visible, transparent, animationType=none, onRequestClose, statusBarTranslucent, accessibilityViewIsModal]
      notes: 'Native Modal with transparent background; the scrim is a full-screen Pressable (accessible={false}) in color.overlay.scrim; the surface is a View with accessibilityViewIsModal so VoiceOver/TalkBack ignore the page behind. onRequestClose (Android back) → onClose reason escape. Focus: AccessibilityInfo.setAccessibilityFocus on the title or first control after the enter animation. Keyboard avoidance with KeyboardAvoidingView so a Form in the body stays visible. Enter/exit animated with Animated (opacity + translateY), skipped under reduce motion. Size maps to maxWidth from the same tokens; on phones the surface is full-width with the gutter as margin.'
---

A dialog interrupts. It takes the whole screen's attention for one task and gives it back when the task is done or abandoned. Everything about it — the scrim, the trapped focus, the inert page behind, Escape, focus returning to where it was — exists to make that interruption safe and reversible. Anything that does not need the interruption should not be a dialog.

## When to use

Use a Dialog for a short task that must complete before the user continues and needs its own space: rename, create-with-a-few-fields, choose from options with consequences, confirm something reversible with a form attached. Keep it to one screen of content; a dialog that scrolls much is a page. Give it a `title` that names the task and a `footer` with the completing action first.

## When not to use

Do not use a Dialog for a message that needs no decision (Alert or Toast), for a destructive confirmation (AlertDialog — it asserts and does not dismiss on scrim click), for content that benefits from the page context staying visible (Popover or Disclosure), for navigation menus (Menu), or on a phone for anything the thumb should reach (BottomSheet). Do not open a dialog on page load or without a user action; users cannot tell what interrupted them. Do not nest dialogs.

## Behavior

Setting `open` true renders the dialog in the top layer with the scrim, moves focus in per `initialFocus`, locks page scroll and makes the page behind inert. Tab and Shift+Tab cycle within the dialog. Escape, the close button and a scrim click each call `onClose` with a reason; the dialog does not close itself — the consumer flips `open`, so an unsaved form can ask first. When `dismissible` is false, the close button and scrim do nothing and Escape still reports (the consumer decides), because trapping a keyboard user with no way out is never acceptable. On close, the exit animation runs, scroll and inertness are restored, and focus returns to the element that opened the dialog (or the next focusable element if it is gone). The body scrolls independently when content exceeds the viewport; header and footer are always visible.

## Content guidelines

Titles are short verb phrases naming the task ("Rename project", "Invite people"), not questions or "Dialog". The description, if any, is one sentence of consequence or context. Footer actions restate the task ("Rename", "Send invites") with "Cancel" as the secondary — never "OK"/"Yes". The close button's name is `copy.closeLabel`.

## Accessibility

The dialog has role `dialog`, `aria-modal`, an accessible name from the title and a description from `description` (WCAG 4.1.2, APG modal dialog). Focus moves into it on open and is trapped until close (2.4.3, 2.1.2: no keyboard trap *without an exit* — Escape is the exit), then returns to the opener (focus-restore). The page behind is inert to assistive technology and pointer (inert-background). Escape always reports, even for non-dismissible dialogs. Text on the overlay surface meets 4.5:1 in both modes; the build checks body, muted, link and ghost-button text. Motion respects reduced-motion (2.3.3). The close button is at least 24px (2.5.8). Nothing inside relies on hover.

## Platform notes

### Web
Render through a portal into `document.body`: `<dialog aria-labelledby aria-describedby>` containing the surface. Call `showModal()` when `open` becomes true and `close()` when false; listen to `cancel` (Escape) and call `preventDefault()` on it always, reporting through `onClose('escape')` — the consumer owns `open`. Style `::backdrop` with the scrim token and `@media (prefers-reduced-motion: no-preference)` transitions. Detect a scrim click as a `click` whose target is the `<dialog>` element itself. Implement Tab wrapping with a keydown handler over the dialog's focusable elements. Lock scroll with a class on `<html>` (`overflow: hidden; scrollbar-gutter: stable`). Store `document.activeElement` on open; on close, focus it if still connected. Size classes set `inline-size` from the width tokens with `max-inline-size: calc(100vw - 2 * var(--layout-gutter))`.

### Lit
`<ds-dialog open title="Rename project">` with a `<dialog>` in the shadow root; `showModal()` works from a shadow root and the element is placed in the top layer. Because the light-DOM slotted content is not inside the shadow `<dialog>` in the composed tree only visually, the Tab-wrap handler must collect focusable elements from both the shadow root and assigned slot nodes. Dispatch composed `close` and `opened`. Reflect `open` so `ds-dialog[open]` can be styled. Compose `<ds-heading>`, `<ds-text>`, `<ds-button>`, `<ds-icon>`, `<ds-box>`, `<ds-stack>`.

### React Native
`Modal` with `transparent`, `animationType="none"` (the component animates itself), `onRequestClose` → `onClose('escape')`, `statusBarTranslucent`. Inside: an `Animated.View` scrim (`Pressable` for the scrim click, `accessible={false}`), and the surface `View` with `accessibilityViewIsModal`, `accessibilityLabel={title}`, `accessibilityHint={description}`. Wrap the body in `ScrollView` inside `KeyboardAvoidingView`. After the enter animation, `setAccessibilityFocus` on the title (or first control). Size uses `maxWidth` from the width tokens and `marginHorizontal: layout.gutter`; below the content measure the surface is full width. The close button is the system `Button` with `leadingIcon` an `Icon name="close"`.

## Related

AlertDialog, BottomSheet, Toast, Form, Button, Heading.
