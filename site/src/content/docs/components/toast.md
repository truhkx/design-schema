---
title: Toast
description: A brief, non-blocking notification that confirms something happened — optionally with one action such as Undo — announced to assistive technology and gone on its own.
component:
  name: Toast
  category: feedback
  status: review
  apg: alert
  anatomy: [region, toast, icon, message, actionButton, dismissButton]
  composition:
    icon: Icon
    message: Text
    actionButton: Button
    dismissButton: Button
  props:
    message:
      type: string
      required: true
      description: 'One sentence saying what happened ("Message sent", "3 files deleted").'
    tone:
      type: enum
      values: [neutral, success, warning, danger]
      default: neutral
      description: Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone.
    actionLabel:
      type: string
      description: 'Label for a single action button ("Undo", "View"). When present the toast stays longer and pauses on hover and focus.'
    duration:
      type: enum
      values: [short, long, persistent]
      default: short
      description: '`short` ≈ 5s, `long` ≈ 10s (both computed from motion.duration.loop × 6 / × 12 so themes without motion still get sensible times), `persistent` until dismissed. When `action` is set or `tone` is danger the toast is persistent regardless of this prop (a dev warning notes the override). The two durations are computed at region mount from the resolved motion.duration.loop (getComputedStyle on the region on web/Lit; the token value on native), never hardcoded.'
    dismissible:
      type: boolean
      default: true
      description: Shows a dismiss button. Persistent toasts are always dismissible.
    toastId:
      type: string
      description: 'Stable identity; showing a toast with the same toastId replaces the previous one instead of stacking (named toastId so it does not collide with the DOM `id` on Lit).'
  events:
    onAction:
      description: The action button was activated. The toast dismisses.
      platforms: { web: onAction, lit: action, rn: onAction, swiftui: onAction }
    onDismiss:
      description: 'The toast left the screen: reason `timeout`, `dismiss-button`, `escape`, `action`, or `replaced` (a replaced or evicted toast leaves immediately, without its exit transition).'
      platforms: { web: onDismiss, lit: dismiss, rn: onDismiss, swiftui: onDismiss }
  keyboard:
    - { keys: [F6], action: 'Moves focus into the toast region (the first toast''s action or dismiss button) from anywhere; F6 again returns to where focus was.', when: a toast is visible, from: any, expect: focus-first }
    - { keys: [Escape], action: Dismisses the focused toast and returns focus., when: focus inside a toast, from: first, expect: closes }
    - { keys: [Tab], action: 'Moves between the action and dismiss buttons, then out of the region.', when: focus inside a toast, from: first, expect: focus-next }
  styles:
    surface: { token: color.inverse.surface, description: 'Inverted like Tooltip: dark on light, light on dark, so it floats above any page surface.' }
    text: { token: color.inverse.foreground }
    icon: { token: 'color.inverse.status.{tone}', description: '`neutral` renders no icon; the other tones use the status step chosen to read on the inverse surface.' }
    actionColor: { token: color.inverse.link, description: 'The action and dismiss Buttons are rendered with Button''s `inverse` prop (ghost variant), which is how a composite gets an on-inverse child without restyling it.' }
    dismissColor: { token: color.inverse.link, description: 'The dismiss and action Buttons are `ghost` + `inverse`, whose text is color.inverse.link; Toast never restyles them.' }
    focusRingInverse: { token: color.inverse.focus, description: 'Focus ring color on the inverse surface, replacing color.border.focus inside the toast.' }
    radius: { token: radius.md }
    shadow: { token: shadow.overlay }
    paddingBlock: { token: space.sm }
    paddingInline: { token: space.md }
    gap: { token: layout.gap.normal, description: 'Between icon, message, action and dismiss.' }
    stackGap: { token: layout.gap.tight, description: 'Between stacked toasts in the region. stackGap, regionInset and layer belong to the region (ToastRegion / ToastProvider) and are overridable on it, not on a toast.' }
    regionInset: { token: layout.gutter, description: 'Distance of the region from the viewport edge (bottom-start on wide screens, bottom center on phones, above the safe area).' }
    maxWidth: { token: layout.maxWidth.prose }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.md }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.min }
    layer: { token: layer.toast }
    enter: { token: motion.duration.base, description: Rise and fade; instant under reduced motion. }
    exit: { token: motion.duration.fast }
  copy:
    dismissLabel: Dismiss
    regionLabel: Notifications
  a11y:
    role: status
    requires: [live-region, accessible-name, escape-dismiss, focus-visible, keyboard-operable, contrast-aa, reduced-motion, target-24px, no-hover-only]
    contrast:
      - { foreground: color.inverse.foreground, background: color.inverse.surface, level: AA }
      - { foreground: color.inverse.link, background: color.inverse.surface, level: AA }
      - { foreground: color.inverse.focus, background: color.inverse.surface, level: AA, large: true }
      - { foreground: 'color.inverse.status.{tone}', background: color.inverse.surface, level: AA, large: true }
  platforms:
    web:
      element: div
      attributes: [role=region, aria-label, role=status, role=alert, aria-live]
      notes: 'One persistent <div role="region" aria-label="Notifications" aria-live="polite"> per document (created on first use, fixed at the region inset, layer.toast) holds the toasts; the region exists before content so announcements fire. Each toast is a <div role="status"> (danger: role="alert"). Timers pause on hover and on focus-within. F6 handler at document level moves focus into the region. Toasts are shown through an imperative API (`toast({ message })`) exposed alongside the component, since a notification is an event, not a place in the tree.'
    lit:
      tag: ds-toast
      reflect: [tone, duration]
      notes: 'A <ds-toast-region> element (auto-created in document.body by the `toast()` function) holds <ds-toast> children in the light DOM so the live region is in the document tree. The region sets role/aria-live via ElementInternals. `dismiss` and `action` are composed CustomEvents.'
    rn:
      element: View
      props: [accessibilityLiveRegion, accessibilityRole]
      notes: 'A ToastProvider mounted once at the app root renders the region as an absolutely positioned View (layer.toast zIndex, above the bottom safe-area inset, centered). Android: accessibilityLiveRegion="polite" (danger: "assertive"); iOS: AccessibilityInfo.announceForAccessibility on show. Timers pause while a toast is being touched. No F6; toasts are reached by swiping through the accessibility order. Android''s native ToastAndroid is not used, so actions and theming work. React Native has no `status` role: danger toasts use accessibilityRole="alert", others no role, with accessibilityLiveRegion (assertive/polite) and a one-time AccessibilityInfo announcement. Timers pause while a toast is touched; F6 and Escape have no native equivalent.'
    swiftui:
      element: VStack
      props: [Portal, .zIndex, AccessibilityNotification, Button, withAnimation, .accessibilityElement=combine]
      notes: 'Rendered through `Support/Portal` into the app''s top-level `ZStack` at `layer.toast` (the app installs `.dsPortalHost()` once at its root). Each toast is one combined element labelled by its text with the tone word; `role: status` posts a polite `Announcement`, `alert` an announcement with `.assertive` priority. Auto-dismiss pauses while VoiceOver focus is on the toast; the action `Button` and dismiss `Button` are inside the element as custom actions (`.accessibilityAction(named:)`) as well as visible controls. Enter/exit use the motion tokens; none under reduced motion.'
---

A toast says "done" and gets out of the way. It confirms an action just taken, offers one chance to undo it, and leaves without being asked. It is the reason most confirmations do not need an AlertDialog: if the action is reversible, do it and toast an Undo.

## When to use

Use a Toast to confirm a completed action that the user did not have to watch (sent, saved, deleted, copied), to offer Undo for a reversible action, or to report a background result ("Export ready" with a "View" action). Match `tone` to the outcome; use `persistent` whenever there is an action, and for `danger`, so nobody misses the one they needed.

## When not to use

Do not toast errors that need fixing (an Alert next to the problem), information the user must read (Alert or Dialog), or anything requiring more than one action. Do not toast on page load. Do not stack more than three; the region replaces the oldest. Do not use a toast to confirm every trivial change — a switch flipping does not need "Setting saved".

## Behavior

Toasts are shown through an imperative call, since a notification is an event: `toast({ message, tone, actionLabel, onAction })`, which returns a promise resolving to `{ reason }` when the toast leaves. Each appears in the notification region, is announced politely (assertively for `danger`), and dismisses after `duration`, when its action is used, when dismissed, or when a toast with the same `id` replaces it. Timers pause while the toast is hovered, focused or touched, and while the page is hidden. Focus never moves to a toast on its own; F6 brings it there when the user wants it, and Escape or the dismiss button sends it back. Up to three toasts stack, newest at the bottom on wide screens.

## Content guidelines

Messages are one short sentence in the past tense saying what happened, without exclamation ("Message sent", "Link copied", "3 files moved to Archive"). The action is one word when possible ("Undo", "View", "Retry"). No titles, no icons other than the tone's, no links in the message.

## Accessibility

The region is a landmark-like container with an accessible name and `aria-live="polite"` that exists before any toast, so each toast is announced as a status message without moving focus (WCAG 4.1.3, 3.2.1); `danger` toasts use `alert`. Anything with a time limit must be pausable or long enough (2.2.1): timers pause on hover, focus and touch, action toasts are persistent, and durations are never under five seconds. Keyboard users reach toasts with F6 and leave with Escape or Tab (2.1.1), so an Undo is never pointer-only. Text, action and icon meet contrast on the inverted surface in both modes; the build checks them. Motion respects reduced-motion.

## Platform notes

### Web
Export `toast(options)` and a `<ToastRegion>` that the app mounts once (or is auto-mounted on first call). Region: `<div role="region" aria-label={copy.regionLabel} aria-live="polite">` fixed at `inset-block-end: var(--layout-gutter)`, `inset-inline-start` on wide screens and centered below the content measure, `z-index: var(--layer-toast)`. Toast: `<div role={tone === 'danger' ? 'alert' : 'status'}>` with `<Icon name={tone}>`, the message, `<Button variant="ghost" size="sm">` for the action styled through the ghost variant on the inverted surface, and the dismiss Button (`iconOnly`, `copy.dismissLabel`). Pause timers on `pointerenter`, `focusin` and `visibilitychange`. Document-level `keydown` for F6 toggles focus between the region and the previously focused element.

### Lit
`toast()` creates `<ds-toast-region>` in `document.body` if absent and appends `<ds-toast>` elements as light-DOM children; the region sets `role="region"`, `aria-label` and `aria-live` through `ElementInternals`. Composed `action` and `dismiss` events bubble to the region for the imperative API's promise.

### React Native
`ToastProvider` at the root renders the region `View` with `zIndex: layerToast`, `position: 'absolute'`, `bottom: safeAreaBottom + layoutGutter`, and exposes `useToast()` / `toast()`. Each toast `View` has `accessibilityLiveRegion` (Android) and triggers `announceForAccessibility` (iOS) on mount; `Pressable` wrappers pause timers while pressed. The action is the system `Button` (`ghost`, `sm`), the dismiss is `Button iconOnly` with `Icon name="close"`.

## Related

Alert, AlertDialog, Button, Icon.
