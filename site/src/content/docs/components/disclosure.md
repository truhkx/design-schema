---
title: Disclosure
description: A button that shows and hides a section of content. The simplest expand/collapse, and the building block for accordions.
component:
  name: Disclosure
  category: container
  status: review
  apg: disclosure
  anatomy: [trigger, triggerIcon, panel]
  props:
    summary:
      type: string
      required: true
      description: The trigger's label. Also the trigger's accessible name. Says what will be revealed.
    children:
      type: content
      required: true
      description: The content of the panel. Rendered only while open (not merely hidden), so heavy content is not laid out until asked for.
    open:
      type: boolean
      description: Controlled open state. Omit for an uncontrolled disclosure.
    defaultOpen:
      type: boolean
      default: false
      description: Initial state for an uncontrolled disclosure.
    disabled:
      type: boolean
      default: false
      description: The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state.
    keepMounted:
      type: boolean
      default: false
      description: 'Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields, so the Form still collects them while the disclosure is closed.'
    headingLevel:
      type: enum
      values: ['2', '3', '4', '5', '6']
      description: 'When set, the trigger is wrapped in a heading of this level so the disclosure appears in the document outline — use for FAQ and accordion sections.'
  events:
    onToggle:
      description: Fired after the state changes, with the new boolean `open`.
      platforms: { web: onToggle, lit: toggle, rn: onToggle }
  styles:
    triggerColor: { token: color.foreground }
    triggerBackgroundHover: { token: color.background.subtle, description: Pointer hover and pressed state of the trigger. }
    triggerPaddingBlock: { token: space.sm }
    triggerPaddingInline: { token: space.sm }
    triggerGap: { token: space.2, description: Gap between icon and summary. }
    triggerFontFamily: { token: font.family.body }
    triggerFontSize: { token: font.size.md }
    triggerFontWeight: { token: font.weight.medium }
    triggerRadius: { token: radius.md }
    icon: { token: color.foreground.muted, description: 'A chevron, 1em, pointing right when closed and down when open.' }
    panelPaddingBlock: { token: space.sm }
    panelPaddingInline: { token: space.sm }
    panelColor: { token: color.foreground }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    minTarget: { token: size.target.min }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.base, description: 'Chevron rotation, with motion.easing.standard; instant under reduced motion. The panel itself does not animate height.' }
  a11y:
    role: button
    requires: [accessible-name, expanded-state, focus-visible, keyboard-operable, target-24px, contrast-aa, reduced-motion]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground, background: color.background.subtle, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [type=button, aria-expanded, aria-controls, aria-disabled, hidden]
      notes: 'A wrapping <div> (so the optional heading and the panel are siblings) containing a native <button aria-expanded aria-controls> and a panel <div id> rendered only while open (or `hidden` while closed with keepMounted); aria-controls is set only while the panel exists — the APG pattern rather than <details>, so the state is controllable, the trigger can sit inside a heading, and the panel can be unmounted. Chevron is an inline SVG with aria-hidden.'
    lit:
      tag: ds-disclosure
      reflect: [open, disabled, keep-mounted]
      notes: 'Shadow root with delegatesFocus; the summary is a property, the panel content is the default slot, and the slot is rendered only while open (with keep-mounted the slot is always rendered and its wrapper gets `hidden` while closed). Light-DOM children exist either way, so ds-form skips fields inside a closed ds-disclosure that lacks keep-mounted, matching the other platforms. `toggle` is a composed CustomEvent with detail { open }. `open` is reflected so it can be styled and set from markup; the resolved state is readable as `currentOpen` (ds-form reads `currentOpen` and `keepMounted` to skip hidden fields); `heading-level` is an attribute.'
    rn:
      element: Pressable
      props: [accessibilityRole=button, accessibilityLabel, accessibilityState, accessibilityHint]
      notes: 'Pressable trigger with accessibilityState={{ expanded: open, disabled }} and the panel conditionally rendered below. Screen readers read "expanded/collapsed" from the state; there is no aria-controls equivalent. `headingLevel` sets accessibilityRole="header" on the trigger text instead of a level.'
---

A disclosure is a button that reveals content beneath it. It is deliberately plain: no border, no card, no animation of the panel. The pattern's job is to keep long pages scannable by hiding detail until it is wanted — FAQ answers, advanced options, "show more".

## When to use

Use a Disclosure to hide secondary content that some users need and most do not: optional settings, long explanations, a list of details behind a summary count. Stack several to make an accordion — each is independent; nothing in this component closes its siblings. Set `headingLevel` when the summaries are section titles so they appear in the outline and screen-reader heading lists.

## When not to use

Do not use a Disclosure to hide content that most users need to see or that is required to complete a task; show it. Do not use it for navigation menus (use Menu, planned) or for content that should take over the screen (use Dialog or BottomSheet, planned). Do not use it as a fake tab set; tabs replace content, disclosures add to it.

## Behavior

Activating the trigger with pointer, Enter, Space, or assistive technology flips the state and fires `onToggle` with the new value. When open, the panel is rendered directly after the trigger in reading order and focus stays on the trigger; users move into the panel themselves. When closed, the panel is removed from the tree (or hidden, with `keepMounted`), so focus inside it must be moved to the trigger first; the component does this when it closes while focus is within, whether the close came from the trigger or from a controlled `open` change. A closed panel's form fields are not collected by a Form unless `keepMounted` is set, so any Disclosure that holds fields must set it. Uncontrolled unless `open` is provided. The chevron rotates over `transition`; the panel appears and disappears without animation, so nothing reflows under the user's pointer.

## Content guidelines

The summary is the name of what is hidden, not an instruction: "Advanced options", "Shipping details", "What happens if I cancel?" — never "Click to expand" or "More". Do not put the state in the label ("Show" / "Hide"); the expanded state is announced and shown by the chevron. If a count helps, put it in the summary ("3 attachments").

## Accessibility

The trigger is a real button with the summary as its accessible name (WCAG 4.1.2) and exposes `aria-expanded` / `expanded` so the state is announced (4.1.2, APG disclosure). The panel is associated with `aria-controls` on web and follows the trigger in DOM order on every platform, so sequential navigation reaches it next (1.3.2, 2.4.3). Enter and Space toggle; there are no arrow-key semantics, because a lone disclosure is not a composite (2.1.1). Focus is visible on the trigger (2.4.7) and the trigger meets the 24px target (2.5.8). Nothing is hidden with CSS alone: a closed panel is either not in the tree or carries the `hidden` attribute, so it is not in the accessibility tree either way. The chevron animation is disabled under reduced motion (2.3.3).

## Platform notes

### Web
Render `<button type="button" aria-expanded={open} aria-controls={panelId}>` containing the chevron (`aria-hidden`) and the summary text; wrap it in `<h{headingLevel}>` when set (the heading has no styling of its own — the button carries it). Render `<div id={panelId}>` after the button only while open, or with the `hidden` attribute while closed when `keepMounted` is set; set `aria-controls` only while the panel exists, so there is never a dangling reference. Use `aria-disabled` rather than `disabled` so the trigger stays discoverable. Mirror the chevron under `[dir=rtl]`. `headingLevel` also accepts a number. Do not use `<details>`: its open state cannot be controlled without side effects, its summary cannot be inside a heading, and browsers differ on how they announce it.

### Lit
`<ds-disclosure summary="…" open>` renders the trigger in the shadow root and the panel as a default `<slot>` that exists only while open. The light-DOM children still exist in the document when closed, but children not assigned to any slot are neither rendered nor in the accessibility tree, so omitting the slot is sufficient — do not add `hidden` to the consumer's nodes. Dispatch a composed `toggle` CustomEvent with `detail: { open }`. Reflect `open` and `disabled`.

### React Native
Render a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel={summary}` and `accessibilityState={{ expanded: open, disabled }}`, containing the chevron and a `Text`; render the children in a `View` below it only while open (or with `display: 'none'` while closed when `keepMounted` is set). Moving focus back to the trigger on close is not possible on native (no notion of focus-within), a platform limit. When `headingLevel` is set, mark the summary `Text` with `accessibilityRole="header"` — native has no heading levels. Rotate the chevron with `Animated` over `transition`, or set it directly when `AccessibilityInfo.isReduceMotionEnabled()` is true.

## Related

Button, Heading, Accordion (planned), Dialog (planned).
