---
title: Alert
description: An inline message that tells the user something important about the current view — information, success, a warning, or an error — with the right announcement for how it arrived.
component:
  name: Alert
  category: feedback
  status: review
  apg: alert
  anatomy: [container, icon, heading, body, dismissButton]
  composition:
    icon: { component: Icon, forwards: { icon: color, iconSize: size } }
    dismissButton: Button
  parts:
    body: { kind: slot, slot: { default: true, prop: children, required: true } }
  props:
    tone:
      type: enum
      enumRef: tone
      values: [info, success, warning, danger]
      default: info
      description: What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color.
    heading:
      type: string
      description: 'A short bold first line for the message. Optional for one-line messages. Named `heading`, not `title`, because `title` is a native attribute (tooltip) on every platform element.'
    children:
      type: content
      required: true
      description: The message body. Text and Links; no headings or form controls.
    live:
      type: enum
      values: [status, alert, 'off']
      default: status
      description: 'How the alert is announced when it appears. `status` is polite (most messages), `alert` interrupts (only for errors that block the user), `off` for alerts already present when the view loads.'
      a11y: 'Maps to role=status, role=alert, or a plain region. Never use `alert` for success or info.'
    dismissible:
      type: boolean
      default: false
      description: Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer removes the alert (the component is controlled by its presence in the tree).
  events:
    onDismiss:
      description: Fired when the user activates the dismiss button. The consumer removes the alert.
      platforms: { web: onDismiss, lit: dismiss, rn: onDismiss, swiftui: onDismiss }
      fires: [user]
      timing: { phase: request }
  styles:
    background: { token: 'color.status.{tone}.background' }
    foreground: { token: 'color.status.{tone}.foreground', description: Heading color. }
    bodyColor: { token: color.foreground, part: body, description: 'Body text keeps the page foreground so long messages read as text, not as colored emphasis.' }
    border: { token: 'color.status.{tone}.border' }
    icon: { token: 'color.status.{tone}.icon', part: icon, description: 'Leading icon: info circle, check circle, warning triangle, or error octagon by tone, rendered with the system Icon (`info`, `success`, `warning`, `danger`) and colored by passing this token as `overrides.color` to the Icon — the sanctioned way to color a composed child. Decorative; the tone is also conveyed by the heading or role.' }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.md }
    padding: { token: space.md }
    gap: { token: space.3, description: 'Horizontal gap between icon, content, and dismiss button.' }
    partGap: { token: space.1, description: Vertical gap between heading and body. }
    iconSize: { token: font.size.lg, part: icon, description: 'Forwarded to the Icon as `overrides.size`; Icon''s `size` enum is not used here.' }
    headingSize: { token: font.size.md, part: heading, description: 'The heading; body text uses `fontSize`.' }
    headingWeight: { token: font.weight.semibold, part: heading }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.md }
    lineHeight: { token: font.lineHeight.normal }
    dismissMargin: { token: space.1, description: 'Negative block/inline-end margin on the dismiss Button so its target sits in the corner without enlarging the padding; the Button keeps its own colors, radius and focus ring.' }
  copy:
    dismissLabel: Dismiss
  a11y:
    role: status
    requires: [live-region, contrast-aa, focus-visible, keyboard-operable, target-24px]
    contrast:
      - { foreground: 'color.status.{tone}.foreground', background: 'color.status.{tone}.background', level: AA }
      - { foreground: color.foreground, background: 'color.status.{tone}.background', level: AA }
      - { foreground: 'color.status.{tone}.icon', background: 'color.status.{tone}.background', level: AA, nonText: true }
      - { foreground: color.link, background: 'color.status.{tone}.background', level: AA }
      - { foreground: color.action.ghost.foreground, background: 'color.status.{tone}.background', level: AA }
  platforms:
    web:
      element: div
      attributes: [role]
      notes: 'role="status" | "alert" from `live` (each implies its aria-live; set only the role); no role when off. Rendering the role on the component root is enough for the announcement, since React mounts the element and its content together. The dismiss button is the system Button (ghost, sm, iconOnly, label copy.dismissLabel) unchanged — composites never restyle a child; the ghost foreground is checked against every tone background. The region''s accessible name is the heading (aria-labelledby) when present, otherwise the body element, so an Alert always has a name even without a heading.'
    lit:
      tag: ds-alert
      reflect: [tone, live, dismissible]
      notes: 'The role is set on the host element via ElementInternals so the live region is in the light DOM tree where assistive technology expects it. `dismiss` is a composed CustomEvent; the inner button''s `press` is stopped so consumers see one event. `heading` is a property (attribute `heading`) or the named slot `heading`; body is the default slot. Accessible name: the host is named by aria-labelledby the heading when present, else by the body text (a status region is named by its content), via ElementInternals ariaLabelledByElements where supported and aria-label with the text otherwise.'
    rn:
      element: View
      props: [accessibilityRole=alert, accessibilityLiveRegion, accessibilityLabel]
      notes: 'live=alert → accessibilityRole="alert" and accessibilityLiveRegion="assertive"; status → accessibilityLiveRegion="polite"; off → neither. iOS ignores live regions, so with live≠off call AccessibilityInfo.announceForAccessibility on mount and again whenever heading or body change (a changed message is a new message). The label is heading + body when body is a string; otherwise heading only — a body that is not plain text should carry its own accessible text. The dismiss button is the system Button.'
    swiftui:
      element: HStack
      props: [.accessibilityElement=combine, .accessibilityAddTraits=updatesFrequently, AccessibilityNotification, Icon, Button]
      notes: 'An `HStack` of the tone Icon (color forwarded through `overrides`), the text column (`Heading`/`Text`), and the dismiss `Button` (ghost, iconOnly, `close`). `role: alert` posts `AccessibilityNotification.Announcement` with heading + body when it appears; `status` is silent and combined into one element with the tone word from copy as the value; `banner`/`region` are `.contain`ed. Tone colors from the status tokens; never color alone — the tone word is in the accessibility label.'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: dismiss-fires-on-dismiss
      description: Activating the dismiss button fires onDismiss; the consumer removes the alert.
      given: { dismissible: true }
      when: { click: dismissButton }
      then:
        - { event: onDismiss }
    - name: live-alert-renders-the-alert-role
      description: live=alert interrupts, and role=alert already implies aria-live=assertive.
      given: { live: 'alert' }
      then:
        - { role: alert }
    - name: live-status-renders-the-status-role
      description: The default; role=status implies aria-live=polite, so the message is announced politely.
      given: { live: 'status' }
      then:
        - { role: status, platforms: [web, lit] }
    - name: live-off-renders-no-role
      description: An alert already present when the view loads is read in sequence, with no live region at all.
      given: { live: 'off' }
      then:
        - { attribute: role, is: null, platforms: [web] }
    - name: the-heading-is-rendered
      description: The heading is a short bold first line saying what happened.
      given: { heading: 'Payment failed' }
      then:
        - { text: 'Payment failed' }
  examples:
    - name: blocking-error
      description: An error that blocks the user, announced immediately above the form it belongs to.
      given: { tone: 'danger', live: 'alert', heading: 'Payment failed', children: 'Your card was declined. Try another card or contact your bank.' }
    - name: saved
      description: A polite success confirmation after a submit.
      given: { tone: 'success', heading: 'Changes saved', children: 'Your notification preferences apply from the next digest.' }
    - name: dismissible-notice
      description: A message the user can safely put away.
      given: { tone: 'info', dismissible: true, children: 'Some features are unavailable while you are offline.' }
    - name: present-at-load
      description: A warning already on the page when it loads, so it is read in sequence rather than announced.
      given: { tone: 'warning', live: 'off', heading: 'Trial ends in three days', children: 'Add a payment method to keep your workspace.' }
---

An alert is the system speaking to the user inside the page: "this saved", "this failed", "this is about to expire". It stays where it is until the user has dealt with it or dismissed it, unlike a Toast (planned), which leaves on its own. Its tone is set by color, by an icon, and by the announcement role, so no single channel carries the meaning.

## When to use

Use an Alert for a message that relates to the current view and should stay visible: a failed save above the form, an expiring trial at the top of a screen, a success confirmation after submit, a note that some features are unavailable offline. Choose `tone` by what the user should do: `info` to know, `success` to relax, `warning` to be careful, `danger` to fix something. Use `dismissible` for messages the user can safely put away; leave persistent problems undismissable.

## When not to use

Do not use an Alert for field-level validation; Input and the form controls render their own errors, and Form renders the summary. Do not use it for transient confirmations that need no action; use Toast (planned). Do not use it as a callout for general prose ("Tip: …") in documentation; that is a Note (planned) with no live semantics. Do not stack more than two alerts in a view; combine or prioritise.

## Behavior

An Alert rendered with `live: status` or `alert` is announced by screen readers when it appears in the tree, without moving focus. An Alert present at load with `live: off` is read in sequence like any content. The dismiss button fires `onDismiss` and the consumer removes the alert. Because activation happens inside the alert, the component first moves focus to the next focusable element after the alert in reading order (or to the previous one when there is none), so focus is never lost when the alert disappears; if nothing outside the alert is focusable, focus is left alone. On native, focus cannot be moved programmatically to an arbitrary element, an acknowledged limit. Alerts never auto-dismiss and never animate in — a message that fades or slides is a Toast.

## Content guidelines

The heading says what happened in a few words ("Changes saved", "Payment failed"); the body says what it means and what to do next, in one or two sentences, with a Link if there is somewhere to go. Do not restate the tone in the heading ("Error: …", "Warning!") — the icon and role carry it, and screen readers already announce `alert` as an alert. Do not use exclamation marks. `danger` alerts are the only ones where the body may start with the cause.

## Accessibility

The message is announced when it appears, politely for `status` and immediately for `alert` (WCAG 4.1.3 Status Messages), and it is never used to move focus (3.2.1). Tone is conveyed by the icon shape and the heading, not only by color (1.4.1). Heading, body, links, the dismiss button and icon meet contrast on the tinted background in both modes — 4.5:1 for text and 3:1 for the icon (1.4.3, 1.4.11); the build checks every tone. The region itself has no separate accessible name — a status or alert region is announced by its content, and naming it would be read twice. The dismiss button has an accessible name from `copy.dismissLabel`, visible focus, and a 24px target (2.4.7, 2.5.8). Only `danger` and blocking `warning` alerts use `live: alert`; interrupting for good news is a real cost to screen-reader users.

## Platform notes

### Web
Render `<div role={live === 'off' ? undefined : live}>` — `role="status"` implies `aria-live="polite"` and `role="alert"` implies assertive, so set only the role. Inside: the icon (`aria-hidden` inline SVG), a content column with the heading as a `<p>` in `headingWeight` and `foreground` (a raw element, not Text, which has no status tones; and not a heading element, so it does not disturb the outline) and the body, and, when dismissible, the system Button (`ghost`, `size: sm`, `iconOnly`, label `copy.dismissLabel`, a 1em × glyph as `leadingIcon`) pulled into the corner with `dismissMargin`. The `heading` prop must not be forwarded as the native `title` attribute. Colors come from the `{tone}` bindings; use `border` on all sides at `borderWidth`.

### Lit
`<ds-alert tone="danger" live="alert" heading="Payment failed">` sets `role` on the host via `ElementInternals` so the live region is the host itself, which assistive technology sees in the light DOM. The body is the default slot and `heading` is a property (or a named `heading` slot for rich headings). Dispatch a composed `dismiss` CustomEvent (stop the inner `press`); the consumer removes the element. The dismiss `<ds-button>` is used unchanged — no `::part` restyling. Reflect `tone`, `live` and `dismissible`.

### React Native
Render a `View` with `accessibilityRole="alert"` when `live` is `alert`, `accessibilityLiveRegion="assertive"` or `"polite"` by `live`, and `accessibilityLabel` = heading + body (when body is a string) so the whole message is one announcement. iOS does not honour live regions: in an effect on mount, when `live !== 'off'`, call `AccessibilityInfo.announceForAccessibility()` with the heading and body joined by a full stop, and again whenever they change. Apply `background`, `border` and `radius` from the tone tokens; render the icon with the `icon` color and `accessibilityElementsHidden`. The dismiss button is the system Button (`ghost`, `sm`, `iconOnly`, with a × glyph as `leadingIcon`), pulled into the corner with `dismissMargin`.

## Related

Form, Toast (planned), Note (planned), Dialog (planned).
