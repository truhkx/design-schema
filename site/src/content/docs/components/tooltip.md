---
title: Tooltip
description: A short text label that appears on hover or focus to name or explain a control — never the only place information lives, and never interactive.
component:
  name: Tooltip
  category: overlay
  status: review
  apg: tooltip
  anatomy: [trigger, popup, text]
  composition:
    text: { component: Text, props: { element: span, size: sm }, forwards: { fontFamily: fontFamily, fontSize: fontSize, lineHeight: lineHeight } }
  parts:
    trigger: { kind: slot, slot: { default: true, prop: children, required: true } }
  props:
    content:
      type: string
      required: true
      description: The tooltip text. One short phrase or sentence; no markup, no links, no line breaks.
    children:
      type: content
      required: true
      description: 'Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it; a non-focusable child is an error, because keyboard users could never see the tooltip.'
      a11y: The child must be focusable so hover and focus are equivalent (WCAG 1.4.13, 2.1.1).
    placement:
      type: enum
      values: [top, bottom, start, end]
      default: top
      description: 'Preferred side; flips when it would overflow the viewport (on native, measured with measureInWindow like Popover). `start`/`end` are logical and mirror in right-to-left writing.'
    describes:
      type: boolean
      default: true
      description: '`true`: the tooltip is supplementary and becomes the child''s accessible description (aria-describedby). `false`: the tooltip IS the child''s name (an icon-only button whose label equals the tooltip) and is linked as aria-labelledby instead — set this when the child has no visible text and its `label` equals `content`, to avoid announcing it twice.'
    open:
      type: boolean
      description: 'Controlled visibility, for stories and tests only (the Keyboard story renders the tooltip open with it). Product code never sets it: a tooltip is hover and focus driven. There is no change event: Escape still hides a tooltip rendered with `open: true`, and it stays hidden until the `open` prop next changes. While `open` is set, only Escape and changes to `open` affect visibility; hover, focus and blur do not.'
    delay:
      type: enum
      values: [default, none]
      default: default
      description: 'Hover delay before showing: `default` uses `motion.duration.base` × 3 (roughly 600ms, so casual mouse movement does not flash tooltips); `none` for toolbars where a sibling tooltip is already open (a shared "warm" state so moving along a toolbar shows tooltips instantly: after a tooltip hides, siblings show with no delay for one motion.duration.base, the `warmWindow` constant — and warm skips the delay for `default` tooltips too, while `none` is always instant; the pointer may cross to the tooltip within one motion.duration.fast before it hides).'
  keyboard:
    - { keys: [Escape], action: Hides the tooltip without moving focus., when: tooltip visible, from: trigger, expect: [closes, focus-unchanged] }
  styles:
    surface: { token: color.inverse.surface, description: 'Inverted: the tooltip is dark on light mode and light on dark mode, so it reads as a label, not a panel.' }
    text: { token: color.inverse.foreground, part: text, description: 'Text''s `color` is locked and its tones have no inverse value, so the bubble re-scopes the foreground on its own container and composes Text unchanged — the mechanism Text''s own color binding names, not an override and not a restyle.' }
    radius: { token: radius.sm }
    paddingBlock: { token: space.1 }
    paddingInline: { token: space.2 }
    offset: { token: space.1, description: Gap between trigger and tooltip. }
    maxWidth: { token: space.20, computed: { times: 3 }, description: 'Longer text wraps. An override replaces the base; the × 3 stays in the rule.' }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.sm }
    lineHeight: { token: font.lineHeight.normal }
    shadow: { token: shadow.raised }
    layer: { token: layer.toast, description: 'Tooltips sit above everything, including dialogs, because they describe controls inside them. `overlay.layer: tooltip` names the stacking category; this token is its value.' }
    enter: { token: motion.duration.fast, description: Fade in; instant under reduced motion. }
    exit: { token: motion.duration.fast, description: 'Fade out, opacity only with no slide; instant under reduced motion.' }
  constants:
    hoverDelay:
      description: 'Delay before a hovered trigger shows its tooltip, when `delay` is `default`.'
      token: motion.duration.base
      multiply: 3
      unit: ms
    warmWindow:
      description: 'How long after one tooltip hides the next sibling still shows with no delay — the "warm" toolbar window.'
      token: motion.duration.base
      unit: ms
    pointerGrace:
      description: 'How long the tooltip stays while the pointer crosses the `offset` gap between the trigger and the bubble, so a hoverable tooltip can be reached (WCAG 1.4.13).'
      token: motion.duration.fast
      unit: ms
  overlay:
    layer: tooltip
    anchor: trigger
    placement: placement
    collision: flip
    open: open
    dismiss: [escape]
    modal: false
  a11y:
    role: tooltip
    requires: [escape-dismiss, keyboard-operable, contrast-aa, reduced-motion, no-hover-only]
    contrast:
      - { foreground: color.inverse.foreground, background: color.inverse.surface, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=tooltip, id, aria-describedby, aria-labelledby]
      notes: 'The child is cloned with aria-describedby (or aria-labelledby) pointing at the tooltip id and with pointerenter/pointerleave/focus/blur handlers merged. The id, `role="tooltip"` and `data-ds` are on the always-present visually-hidden copy; the visible bubble, a <div aria-hidden="true" data-part="popup">, is rendered through a portal only while shown, position: fixed from the trigger rect, flipped on overflow, on layer.toast. It stays open while the pointer is over the tooltip itself (1.4.13 hoverable) and hides on Escape (dismissable) or when the trigger loses hover and focus. Never shown on touch (no hover): a `pointerenter` with `pointerType === ''touch''` does not show it, while focus still does on hybrid devices; the description is still in the accessibility tree. Logic reads `hoverDelay`, `warmWindow`, `pointerGrace` and `offset` when it needs them by resolving the token expression through getComputedStyle; an unresolved value (jsdom, no theme) is 0. The description is always in the accessibility tree: `content` is rendered in a visually-hidden element that aria-describedby points at, and the visible popup is a second copy — so the Popover API''s display:none while closed does not remove the description. The bubble is the styled surface, so it carries the `ds-tooltip` class, the `--ds-tooltip-*` hooks and inline overrides; the visually-hidden span carries `data-ds` and the element class `ds-tooltip__description`. The bubble stays mounted through its `exit` fade (0 under reduced motion). A length such as `offset` is read by setting the token expression as a hidden probe''s `padding-left` and reading the computed px. `children` is typed as a single `ReactElement`, since it is cloned.'
    lit:
      tag: ds-tooltip
      reflect: [placement, { prop: describes, attribute: no-describes }]
      notes: 'Wraps the slotted trigger; because aria-describedby cannot cross the shadow boundary, the tooltip element is rendered in the light DOM as a sibling of the trigger (appended to the host, not the shadow root) so the ID reference resolves. Positioning via the Popover API (popover="manual") with a fixed fallback. As on web, aria-describedby targets a visually-hidden copy of the content that is always present; the popover is the visible copy. ID references do not cross into a trigger''s shadow root (ds-button''s real <button> is inside it), so for a custom-element trigger Tooltip passes the text instead: `describes: false` sets `aria-label` to `content` on the trigger host, `describes: true` sets `aria-description`, and system triggers (ds-button, ds-link, ds-input) forward both to their inner control; a plain light-DOM trigger gets aria-describedby/aria-labelledby. The host is `display: contents` and carries `data-ds`; the bubble carries `data-part="popup"`. A custom-element trigger is one whose tag name contains a hyphen, whether or not it is upgraded or its shadow root is open. Unlike web, the bubble stays mounted while hidden (popover closed, aria-hidden), so the `exit` fade plays and slotchange does not re-fire on every show. `offset` is read in px the same way as on web, through a hidden probe''s `padding-left`.'
    rn:
      element: View
      props: [accessibilityHint, accessibilityLabel]
      notes: 'There is no hover on touch, so no tooltip surface is shown by default: `content` becomes the child''s accessibilityHint (or accessibilityLabel when describes=false). On long-press the text is shown in a small transient View above the child for the duration of the press, as a sighted-user aid. On react-native-web, hover and focus behave as on web. This is the acknowledged platform difference; the information is never hover-only anywhere. The child must accept `accessibilityHint`/`accessibilityLabel` and the `onHoverIn`/`onHoverOut`/`onFocus`/`onBlur`/`onLongPress` handlers Tooltip clones onto it; the system Button, Link and Input forward these to their native element. Placement flips on all four sides using measureInWindow against useWindowDimensions, and the cross axis is clamped into the window. There is no portal on native: the bubble is absolutely positioned inside the Tooltip root View with zIndex layer.toast, so an ancestor with overflow hidden can clip it (a stated limit; no Modal is used). The bubble is visible while any of press, hover, bubble hover or focus is active. The hover and focus handlers are attached only on react-native-web; on native only long-press shows the bubble, and releasing hides it at once (`pointerGrace` applies only to a pointer leaving). Text receives only `size: sm`, since React Native Text has no `element`. The root View carries testID "Tooltip", which the `renders` scenarios find on rn. On react-native-web the bubble takes `onPointerEnter`/`onPointerLeave` with pointerEvents auto (hoverable, 1.4.13); on native it is pointerEvents none. The bubble is hidden from accessibility (accessibilityElementsHidden, importantForAccessibility no-hide-descendants): the hint or label already carries the text, so there is no visually-hidden copy on rn.'
    swiftui:
      element: Group
      props: [.accessibilityHint, .onLongPressGesture, .popover, .onHover, .accessibilityHidden]
      notes: 'There is no tooltip on iOS. The `content` is forwarded to the trigger as `.accessibilityHint` (VoiceOver reads it after the label), and the bubble itself shows on long-press (touch) and pointer hover (iPad) as a `.popover` with `.presentationCompactAdaptation(.popover)` so it never becomes a sheet, positioned by `placement`, dismissed on release/leave or Escape. The bubble is `.accessibilityHidden(true)` — the hint already carries the text. Delays from the timing tokens, kept under reduced motion; only the fade is removed.'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    # All narrowed to web and Lit: React Native has no pointer to hover the trigger with.
    - name: the-visible-tooltip-carries-the-tooltip-role
      description: When shown, the bubble is a role=tooltip element linked to the trigger (APG tooltip).
      given: { open: true }
      then:
        - { role: tooltip }
      platforms: [web, lit]
    - name: the-text-stays-in-the-tree-while-hidden
      description: The description is always in the accessibility tree, so a screen-reader user gets the text without hovering; the visible popup is a second copy.
      given: { open: false }
      then:
        - { role: tooltip }
      platforms: [web, lit]
  examples:
    - name: icon-only-button-name
      description: The tooltip is the control's name, not a second announcement, so it is linked as the label.
      given: { content: 'Add item', children: 'An icon-only Button labelled "Add item" with the plus Icon', describes: false }
    - name: column-header-hint
      description: A clarification on a labelled control in dense UI.
      given: { content: 'Includes archived items', children: 'A table column header Button labelled "Items"' }
    - name: warm-toolbar
      description: A toolbar where a sibling tooltip is already open, so the next one shows instantly.
      given: { content: 'Grid view', children: 'An icon-only Button labelled "Grid view" with the grid Icon, beside a "List view" Button with the list Icon and its own Tooltip, inside a Toolbar labelled "View"', delay: none }
    - name: below-the-trigger
      description: A trigger at the top of the page, where the bubble reads better underneath.
      given: { content: 'Open in new tab', children: 'An icon-only Button labelled "Open in new tab" with the external Icon, in the page header', placement: bottom }
---

A tooltip is the smallest overlay: a label that appears when you point at or focus a control and disappears when you leave. It exists to name icon-only buttons and to add a hint to a control whose label cannot carry everything. It must never be the only home of information a user needs, because a touchscreen user will never see it.

## When to use

Use a Tooltip on an icon-only Button to show its name on hover and focus (with `describes: false` so it is the accessible name, not a second announcement), or on a labelled control to add a short clarification ("Includes archived items"). Use it in toolbars, table headers and dense UI where visible labels do not fit. Keep it to a phrase.

## When not to use

Do not put essential instructions, error messages or any content the user must read in a tooltip; use helper text (Input `description`), an Alert, or a Disclosure. Do not put links or buttons in it — a tooltip is not interactive, and an interactive overlay is a Popover (planned). Do not attach it to a non-focusable element (an icon, a span): keyboard users could never open it. Do not use it on touch-first screens to explain controls; on native the text becomes a hint and is not visible.

## Behavior

The tooltip shows after `delay` when the pointer rests on the trigger, or immediately when the trigger receives focus of any kind (keyboard-origin focus cannot be told apart reliably across composed triggers, and a focused control showing its tooltip is never wrong), positioned at `placement` (flipped at the viewport edge). It hides when the pointer leaves both trigger and tooltip, when focus leaves the trigger, or on Escape — which hides it without moving focus, so a user can dismiss a tooltip that covers something. Moving the pointer from one warm toolbar item to the next shows the next tooltip with no delay. The tooltip never takes focus and never blocks pointer events on anything but itself. `start` and `end` are logical on every platform, resolved from the trigger's writing direction. The description lives in two nodes: a visually-hidden span carrying the id and `role="tooltip"`, always in the accessibility tree, and the positioned bubble, which is `aria-hidden` and only a visible copy — that is the only way "always announced" and "shown on hover" hold at once. Of the anatomy, `text` and `popup` take a `data-part`; the trigger is the caller's own element. The bubble is mounted only while shown, so `renders` and the role scenarios find the always-present visually-hidden `role="tooltip"` node, which carries `data-ds` on web. On native, placement flips using measureInWindow as on web; Escape exists only under react-native-web, where a real browser does. Escape also hides a tooltip opened by hover alone while focus is elsewhere (a document-level listener, attached only while the bubble is visible, WCAG 1.4.13), and while a tooltip is visible it stops that Escape in the capture phase with both stopPropagation and preventDefault (a native `<dialog>` closes on an Escape that is not default-prevented; on react-native-web the listener is on `window`), so inside a Dialog the first Escape hides the tooltip and the second closes the Dialog. Delays are not motion and stay under reduced motion; only the fade is removed. Tooltip exposes no `ref`: it adds no root a caller needs, and a caller that wants the trigger refs its own child. Inside a Toolbar the wrapped Button stays the toolbar item: Tooltip adds no tab stop and no role, so the roving tabindex and overflow menu see through it. An uncontrolled tooltip dismissed with Escape stays hidden until the trigger has lost both hover and focus, even if it is re-hovered first. Text receives `element`, `size`, the `text` part hook and the forwarded `fontFamily`, `fontSize` and `lineHeight`; those three are forward-only (no `--ds-tooltip-*` hook) and the value, override or default, is always passed. The Default story uses the schema defaults: `content: 'Includes archived items'` on a `secondary` Button labelled "Items".

## Content guidelines

Tooltip text is a short phrase in sentence case with no trailing period: the control's name ("Bold"), or a clarification ("Includes archived items"). No shortcut hints inside the text; use the Menu's `shortcut` field or `aria-keyshortcuts` on the control. Never repeat the visible label verbatim; if there is nothing to add, there is no tooltip.

## Accessibility

Content that appears on hover or focus must be dismissable without moving the pointer, hoverable, and persistent until dismissed (WCAG 1.4.13): Escape hides it, the pointer can move onto it, and it stays while hovered or focused. It is linked to the trigger with `aria-describedby`, or `aria-labelledby` when it is the name (4.1.2; APG tooltip), so screen-reader users get the text without hovering. Focus shows it, so it is never hover-only (2.1.1). The inverted surface meets 4.5:1 in both modes. It never receives focus and contains nothing interactive.

## Platform notes

### Web
Clone the single child with `aria-describedby={id}` (or `aria-labelledby`) and merged `onPointerEnter`, `onPointerLeave`, `onFocus`, `onBlur` handlers. Render the visually-hidden `<span role="tooltip" id={id}>` always, and the `aria-hidden` bubble through a portal while shown, `position: fixed`, positioned from the trigger rect with `offset`, flipped when overflowing, `z-index: var(--layer-toast)`, `max-inline-size` from the computed maxWidth. A module-level "warm until" timestamp implements the toolbar behavior. A `pointerenter` whose `pointerType` is `touch` does not show the tooltip (the description remains, and focus still shows it).

### Lit
`<ds-tooltip content="Bold"><ds-button icon-only label="Bold">…</ds-button></ds-tooltip>`. On `slotchange`, take the single assigned element as the trigger, set `aria-describedby` on it (or `aria-description` / `aria-label` when it is a custom element with a shadow root), and append the tooltip element to the host in the light DOM so the ID resolves across the boundary; position with the Popover API when available.

### React Native
Render the child with `accessibilityHint={content}` (or `accessibilityLabel` when `describes` is false). On `onLongPress`, show a transient `View` with the inverted surface above the child until `onPressOut` (it stays while hover or focus is still active). On react-native-web, attach hover/focus handlers as on web.

## Related

Button, Icon, Menu, Popover (planned).
