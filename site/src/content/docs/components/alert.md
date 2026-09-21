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
    dismissButton: { component: Button, props: { variant: ghost, size: sm, iconOnly: true } }
  parts:
    body: { kind: slot, slot: { default: true, prop: children, required: true } }
  props:
    tone:
      type: enum
      enumRef: tone
      values: [info, success, warning, danger]
      default: info
      description: 'What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. There is deliberately no `neutral` tone: every value here says something about urgency, and a message that says nothing about urgency is not an Alert.'
    heading:
      type: string
      description: 'A short bold first line for the message. Optional for one-line messages. An empty string is the same as no heading on every platform: no heading element is rendered and the name falls back to the body. Named `heading`, not `title`, because `title` is a native attribute (tooltip) on every platform element.'
    children:
      type: content
      required: true
      description: The message body. Text and Links; no headings or form controls.
    live:
      type: enum
      values: [status, alert, 'off']
      default: status
      description: 'How the alert is announced when it appears. `status` is polite (most messages), `alert` interrupts (only for errors that block the user), `off` for alerts already present when the view loads. Changing `live` after the first render swaps the role (or the live region) in place and never re-announces the message: only a change to the heading or the body is a new message.'
      a11y: 'Maps to role=status, role=alert, or a plain region. React Native has no status role, so `status` there is accessibilityLiveRegion="polite" with no role at all. Never use `alert` for success or info.'
    dismissible:
      type: boolean
      default: false
      description: Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer removes the alert (the component is controlled by its presence in the tree).
  events:
    onDismiss:
      description: 'Fired when the user activates the dismiss button. The consumer removes the alert. The focus-onward step runs first, so focus has already left the alert by the time the handler runs and may unmount it synchronously. It carries no payload: the Lit `dismiss` CustomEvent is dispatched with no `detail` rather than an empty object.'
      platforms: { web: onDismiss, lit: dismiss, rn: onDismiss, swiftui: onDismiss }
      fires: [user]
      timing: { phase: request }
  styles:
    background: { token: 'color.status.{tone}.background', part: container }
    foreground: { token: 'color.status.{tone}.foreground', part: heading, description: Heading color. }
    bodyColor: { token: color.foreground, part: body, description: 'Body text keeps the page foreground so long messages read as text, not as colored emphasis. On React Native a string or number body is wrapped in the system Text, whose default tone is this color, so no color is passed; a non-string body is rendered as given. A body of Text or Link children therefore keeps its own color on every platform: this binding reaches plain text only, by inheritance on web and Lit, and inheriting a value is not restyling a child.' }
    border: { token: 'color.status.{tone}.border', part: container }
    icon: { token: 'color.status.{tone}.icon', part: icon, description: 'Leading icon: info circle, check circle, warning triangle, or error octagon by tone, rendered with the system Icon whose glyph name is the tone value itself (`info`, `success`, `warning`, `danger`), so a new tone needs a glyph of the same name, and colored by passing this token path as `overrides.color` to the Icon on every platform, React Native included (never Icon''s RN `color` prop) — the sanctioned way to color a composed child. Locked by its non-text contrast pair, so there is no `overrides.icon` and no --ds-alert-icon hook: the Icon always gets this tone token, and the icon part box carries no color of its own. Decorative: the Icon has no `label`, so it hides itself from assistive technology (aria-hidden; on React Native accessibilityElementsHidden and importantForAccessibility no), and the Alert-owned box adds no accessibility props on any platform precisely because the Icon already hides itself — the box must not repeat them; the tone is also conveyed by the heading or role.' }
    borderWidth: { token: border.width.thin, part: container }
    radius: { token: radius.md, part: container }
    padding: { token: space.md, part: container }
    gap: { token: space.3, part: container, description: 'Horizontal gap between icon, content, and dismiss button.' }
    partGap: { token: space.1, part: container, description: Vertical gap between heading and body. }
    iconSize: { token: font.size.lg, part: icon, description: 'Forwarded to the Icon as `overrides.size` (a token path, default font.size.lg); Icon''s `size` enum is not used here. Override through `overrides.iconSize`; the --ds-alert-icon-size hook does not resize the Icon. The icon part is a box as tall as the first line of text — headingSize × lineHeight when there is a heading, else fontSize × lineHeight, or iconSize when that is larger — with the Icon centred in it, so the glyph lines up with the first line; that math reads the same token as the forward. `overrides.iconSize` is the only supported input: the component writes --ds-alert-icon-size from it and the box math reads that hook, so a consumer who sets the hook directly in their own CSS resizes the box but not the glyph, which is unsupported. Web and Lit know whether there is a heading from a `data-has-heading` attribute the component sets on its root — the `<div>` on web and the host element on Lit, where the hooks also live, not the shadow `container` part — and not from a CSS `:has()` query; all hooks (fontSize, headingSize, lineHeight, iconSize) are set on that root and inherited, so the icon box reads them there. React Native runs the same max(): the first line''s lineHeight, or iconSize when the glyph is larger.' }
    headingSize: { token: font.size.md, part: heading, description: 'The heading; body text uses `fontSize`.' }
    headingWeight: { token: font.weight.semibold, part: heading }
    fontFamily: { token: font.family.body, part: container, description: 'Inherited by heading and a string body on web and Lit; on React Native forwarded to the heading Text style and to the body Text''s `overrides.fontFamily`.' }
    fontSize: { token: font.size.md, part: body, description: 'Body text. It reaches a string body directly (on React Native through the wrapping Text''s `overrides.fontSize`, with lineHeight forwarded the same way); a body composed of Text or Link children keeps its own sizing, since a composite never restyles a child.' }
    lineHeight: { token: font.lineHeight.normal, part: container, description: 'Set on the root and inherited by the heading, the body and the icon-box math; the heading has no line-height binding of its own and uses this one.' }
    dismissMargin: { token: space.1, part: dismissButton, description: 'Negative margin-block-start and margin-inline-end only (not block-end) on the wrapper around the dismiss Button (web span, Lit span, RN View) so its target sits in the corner without enlarging the padding; the Button keeps its own colors, radius and focus ring. On React Native this is the one sanctioned sibling margin (marginTop and marginEnd of −dismissMargin on the wrapper View). Excluding block-end is a React Native rule, where the wrapper View can otherwise stretch; on web and Lit the container aligns its children to the start, so the wrapper never reaches the block-end padding and the exclusion has no visible effect.' }
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
      notes: 'role="status" | "alert" from `live` (each implies its aria-live; set only the role); no role when off. Rendering the role on the component root is enough for the announcement, since React mounts the element and its content together. The dismiss button is the system Button (ghost, sm, iconOnly, label copy.dismissLabel, `leadingIcon` the system Icon `close` with `inline`) unchanged — composites never restyle a child; the ghost foreground is checked against every tone background. Button writes its own data-part, so `data-part="dismissButton"` goes on a span wrapper the Alert owns (it also carries dismissMargin), and tests click the button inside it; likewise `data-part="icon"` is on the span box that aligns the Icon, which renders no Alert hook of its own. The region''s accessible name is the heading (aria-labelledby) when present, otherwise the body element, so an Alert always has a name even without a heading; the whole body text, link text included, is then the name, which is intended (a status region is named by its content). That content name always wins: a consumer `aria-label` or `aria-labelledby` is not forwarded to the root, and the props type omits both, so passing one is a type error (and a silent drop for JavaScript callers). The name is set for every `live`, `off` included: on a roleless div it exposes nothing, but keeping it unconditional keeps the three platforms identical. `locked: true` means a binding is absent from the overrides type, not that it has no hook: background, foreground and bodyColor keep their --ds-alert-* hooks, which the tone rules read, so document CSS can still reach them; `icon` is the single exception and has no hook at all. On dismiss, "next focusable" means a[href], button, input, select, textarea, [tabindex] ≥ 0 or contenteditable in document order after the alert, skipping any element with a negative tabindex, disabled elements (`:disabled`, which includes descendants of a disabled fieldset), elements inside `inert`, and elements that are not rendered: the `hidden` attribute or computed `display: none` on the element or an ancestor, or computed `visibility: hidden`; size and layout are not checked (jsdom has none).'
    lit:
      tag: ds-alert
      reflect: [tone, live, dismissible]
      notes: 'The role is a plain `role` attribute on the host (not ElementInternals), set from `live` and removed when live=off, so the live region is the host in the light DOM and tests read it. `dismiss` is a composed CustomEvent; the inner button''s `press` is stopped so consumers see one event. `heading` is a string property (attribute `heading`) only — there is no named heading slot, as on every platform the heading is plain text; body is the default slot. Accessible name: a plain `aria-label` attribute on the host carrying the heading text when present, else the slotted body text (a status region is named by its content) — the host''s light-DOM textContent with whitespace collapsed and trimmed, so a label a child carries only as an attribute (such as `<ds-link label>`) is not part of it; put that wording in the heading or the body text when it matters — updated when either changes — ids never cross the shadow root and ElementInternals ariaLabelledByElements is not used, so tests read the name from the attribute. Shadow parts carry the anatomy names verbatim, camelCase, for both `part` and `data-part` (`part="dismissButton" data-part="dismissButton"`); the dismissButton part is a span wrapper the element owns around `<ds-button>` (whose leading icon is `<ds-icon name="close" inline>`), and the icon part a span box around the tone `<ds-icon>`; both children keep their own hooks. The shadow root is created without `delegatesFocus`: the alert is a region, not a control, so focusing the host or clicking the message must not jump focus to the dismiss button, which is focusable on its own. The same next-focusable rule as web applies on dismiss, walked over the flat tree (into open shadow roots and slot-assigned content) in document order, since focusables inside other components'' shadow roots are invisible to querySelector. Locked bindings follow the web rule: background, foreground and bodyColor keep their `:host` hooks and are only absent from the overrides type; `icon` has no hook.'
    rn:
      element: View
      props: [accessibilityRole=alert, accessibilityLiveRegion, accessibilityLabel]
      notes: 'live=alert → accessibilityRole="alert" and accessibilityLiveRegion="assertive"; status → accessibilityLiveRegion="polite" and no role (native has no status role; react-native-web''s role="status" is not used), so RN tests check accessibilityLiveRegion instead of a status role; off → neither. iOS ignores live regions, so on iOS only (Platform.OS === ''ios'', since Android already announces through accessibilityLiveRegion) with live≠off call AccessibilityInfo.announceForAccessibility on mount and again whenever heading or body change (a changed message is a new message); key the effect on the joined announcement alone, so flipping `live` on an already-mounted alert never announces. Use the `accessibilityRole` and `accessibilityLiveRegion` props named here, not the newer `role` prop. The label is heading + body when body is a string or number (the number as its text), joined by ". " exactly like the iOS announcement so the two read the same, verbatim and with no punctuation normalising (a heading that ends in a full stop is announced with both, and copy guidance forbids rewriting user-facing text); otherwise heading only — a body that is not plain text should carry its own accessible text, and with no heading and a body that is neither string nor number accessibilityLabel is left unset (the region has no name; its children are read on their own). A string or number body is wrapped in the system Text (default tone, fontFamily, fontSize and lineHeight through its `overrides`). The heading is a raw Text styled with foreground, headingSize, headingWeight, fontFamily and lineHeight, with no accessibilityRole="header", as web renders no heading element. The icon part is a View as tall as the first line holding the tone Icon with `overrides.color` set to the `icon` token path; parts carry testID `Alert.<part>` on Views the Alert owns (the dismissButton wrapper View also carries dismissMargin). The dismiss button is the system Button (ghost, sm, iconOnly, label copy.dismissLabel) whose `leadingIcon` is the Icon `close` with `overrides.color` color.action.ghost.foreground, since Button cannot recolor it. Native cannot move focus to an arbitrary element, so the focus-onward step the web and Lit builds perform on dismiss is skipped here; the dismiss Button is inside the alert and its own removal returns focus to the enclosing screen, which is the native equivalent.'
    swiftui:
      element: HStack
      props: [.accessibilityElement=combine, .accessibilityAddTraits=updatesFrequently, AccessibilityNotification, Icon, Button]
      notes: 'An `HStack` of the tone Icon (color forwarded through `overrides`), the text column (`Heading`/`Text`), and the dismiss `Button` (ghost, iconOnly, `close`). `role: alert` posts `AccessibilityNotification.Announcement` with heading + body when it appears; `status` is silent and combined into one element with the tone word from copy as the value; `banner`/`region` are `.contain`ed. Tone colors from the status tokens; never color alone — the tone word is in the accessibility label.'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    # Moving focus onward on dismiss (next, previous, or left alone) has no clause: it needs focusable
    # siblings outside the alert, a fixture the vocabulary does not have. The web and Lit builds add a
    # hand-written test for all three cases, rendering a focusable before and after the alert.
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
      description: 'The default; role=status implies aria-live=polite, so the message is announced politely. React Native has no status role, so the test there checks the polite live region instead.'
      given: { live: 'status' }
      then:
        - { role: status, platforms: [web, lit] }
        - { attribute: accessibilityLiveRegion, is: polite, platforms: [rn] }
    - name: live-off-renders-no-role
      description: An alert already present when the view loads is read in sequence, with no live region at all.
      given: { live: 'off' }
      then:
        - { attribute: role, is: null, platforms: [web, lit] }
        - { attribute: accessibilityLiveRegion, is: null, platforms: [rn] }
    - name: an-empty-heading-falls-back-to-the-body
      description: An empty heading string is the same as no heading, so no heading element is rendered and the body carries the message and the name.
      given: { heading: '', children: 'Your card was declined.' }
      then:
        - { text: 'Your card was declined.' }
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

Do not use an Alert for field-level validation; Input and the form controls render their own errors, and Form renders the summary. Do not use it for transient confirmations that need no action; use Toast (planned). Do not use it as a callout for general prose ("Tip: …") in documentation; that is a Note (planned) with no live semantics. A toneless statement of fact — "this component is not generated yet" — is that same Note; until Note exists use `info` and accept that it reads as information, rather than reaching for a `neutral` tone Alert does not have. Do not stack more than two alerts in a view; combine or prioritise.

## Behavior

An Alert rendered with `live: status` or `alert` is announced by screen readers when it appears in the tree, without moving focus. An Alert present at load with `live: off` is read in sequence like any content. The dismiss button fires `onDismiss` and the consumer removes the alert. Because activation happens inside the alert, the component first moves focus to the next focusable element after the alert in reading order (or to the previous one when there is none), so focus is never lost when the alert disappears; if nothing outside the alert is focusable, focus is left alone. The step runs only when focus is inside the alert when it is dismissed (`:focus-within` on web and Lit) — a mouse press that never focused anything, or a programmatic dismiss, must not move the user's focus — and it runs before `onDismiss` fires, so a handler that unmounts the alert synchronously still finds focus placed. Candidates are searched outside the alert only: nothing in its own subtree, shadow root or slotted body counts. On native, focus cannot be moved programmatically to an arbitrary element, an acknowledged limit. Alerts never auto-dismiss and never animate in — a message that fades or slides is a Toast.

## Content guidelines

The heading says what happened in a few words ("Changes saved", "Payment failed"); the body says what it means and what to do next, in one or two sentences, with a Link if there is somewhere to go. Do not restate the tone in the heading ("Error: …", "Warning!") — the icon and role carry it, and screen readers already announce `alert` as an alert. Do not use exclamation marks. `danger` alerts are the only ones where the body may start with the cause.

## Accessibility

The message is announced when it appears, politely for `status` and immediately for `alert` (WCAG 4.1.3 Status Messages), and it is never used to move focus (3.2.1). Tone is conveyed by the icon shape and the heading, not only by color (1.4.1). Heading, body, links, the dismiss button and icon meet contrast on the tinted background in both modes — 4.5:1 for text and 3:1 for the icon (1.4.3, 1.4.11); the build checks every tone. The region is named by its own content — `aria-labelledby` the heading when there is one, otherwise the body element (on native, `accessibilityLabel`) — so the alert has a name in the accessibility tree without inventing one that repeats the tone. The dismiss button has an accessible name from `copy.dismissLabel`, visible focus, and a 24px target (2.4.7, 2.5.8). The alert root is not interactive and owns no control, so `focus-visible`, `keyboard-operable` and `target-24px` are met entirely by that composed Button and apply only when `dismissible` is set; Alert renders nothing of its own for them and must not restyle the Button to satisfy them. Only `danger` and blocking `warning` alerts use `live: alert`; interrupting for good news is a real cost to screen-reader users.

## Platform notes

### Web
Render `<div role={live === 'off' ? undefined : live}>` — `role="status"` implies `aria-live="polite"` and `role="alert"` implies assertive, so set only the role. Inside: the icon (the system Icon named by tone, decorative so it hides itself, in a `data-part="icon"` span box as tall as the first line), a content column with the heading as a `<p>` in `headingWeight` and `foreground` (a raw element, not Text, which has no status tones; and not a heading element, so it does not disturb the outline) and the body, and, when dismissible, the system Button (`ghost`, `size: sm`, `iconOnly`, label `copy.dismissLabel`, `<Icon name="close" inline />` as `leadingIcon`) in a `data-part="dismissButton"` span pulled into the corner with `dismissMargin`. The `heading` prop must not be forwarded as the native `title` attribute. Colors come from the `{tone}` bindings; use `border` on all sides at `borderWidth`.

### Lit
`<ds-alert tone="danger" live="alert" heading="Payment failed">` sets a plain `role` attribute on the host (removed when `live` is `off`) so the live region is the host itself, which assistive technology sees in the light DOM, and names the host with a plain `aria-label` carrying the heading text, else the body text. The body is the default slot and `heading` is a string property only (no named slot). Dispatch a composed `dismiss` CustomEvent (stop the inner `press`); the consumer removes the element. The dismiss `<ds-button>` is used unchanged — no `::part` restyling. Reflect `tone`, `live` and `dismissible`.

### React Native
Render a `View` with `accessibilityRole="alert"` when `live` is `alert`, `accessibilityLiveRegion="assertive"` or `"polite"` by `live`, and `accessibilityLabel` = heading + body joined by ". " (when body is a string or number) so the whole message is one announcement. iOS does not honour live regions: on iOS only, in an effect on mount, when `live !== 'off'`, call `AccessibilityInfo.announceForAccessibility()` with the heading and body joined by a full stop, and again whenever they change. Apply `background`, `border` and `radius` from the tone tokens; render the tone Icon with the `icon` token path as `overrides.color` (decorative, so it is hidden from assistive technology). The dismiss button is the system Button (`ghost`, `sm`, `iconOnly`, with `<Icon name="close" overrides={{ color: 'color.action.ghost.foreground' }} />` as `leadingIcon`), in a wrapper View pulled into the corner with `dismissMargin` — the one negative margin this component uses.

## Related

Form, Toast (planned), Note (planned), Dialog (planned).
