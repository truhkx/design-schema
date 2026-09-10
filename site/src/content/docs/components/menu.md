---
title: Menu
description: A button that opens a list of actions anchored beside it — the desktop overflow, "more actions", and split-button pattern, with full arrow-key navigation and typeahead.
component:
  name: Menu
  category: overlay
  status: review
  apg: menu-button
  anatomy: [trigger, popup, list, group, groupLabel, item, itemIcon, itemShortcut, separator]
  composition:
    trigger: Button
    itemIcon: Icon
  props:
    label:
      type: string
      required: true
      description: 'The trigger''s label and the menu''s accessible name ("More actions", "Sort by").'
    items:
      type: array
      required: true
      shape: '({ id: string; label: string; icon?: IconName; shortcut?: string; tone?: "default" | "danger"; disabled?: boolean } | { group: string; items: MenuItem[] } | { separator: true })[]'
      description: Actions, optionally grouped with a label or divided by separators. Groups render their label as a non-interactive heading row.
    triggerVariant:
      type: enum
      values: [ghost, secondary, primary]
      default: ghost
      description: Variant of the trigger Button.
    triggerIcon:
      type: enum
      values: [ellipsis, chevron-down, none]
      default: chevron-down
      description: 'Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes the accessible name), `chevron-down` for a labelled dropdown, `none`.'
    iconOnly:
      type: boolean
      default: false
      description: Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required.
    placement:
      type: enum
      values: [bottom-start, bottom-end, top-start, top-end]
      default: bottom-start
      description: Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport.
    open:
      type: boolean
      description: 'Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu.'
    anchor:
      type: object
      shape: 'RefObject<HTMLElement | View>'
      description: 'Position the popup relative to this element instead of rendering a trigger; the trigger part is omitted and `open` must be controlled. Used by ActionSheet above its breakpoint and by context menus.'
  events:
    onAction:
      description: An item was chosen; receives its `id`. The menu closes itself first.
      platforms: { web: onAction, lit: action, rn: onAction }
    onOpenChange:
      description: 'Fired when the menu opens or closes, with `{ open, reason }` — reason: `trigger`, `escape`, `outside`, `action` (an item was chosen; fired before onAction), `controlled`.'
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange }
  keyboard:
    - { keys: [Enter, ' ', ArrowDown], action: Opens the menu and focuses the first item., when: focus on trigger, from: trigger, expect: manual }
    - { keys: [ArrowUp], action: Opens the menu and focuses the last item., when: focus on trigger, from: trigger, expect: manual }
    - { keys: [ArrowDown], action: Moves to the next enabled item., when: menu open, from: first, expect: focus-next }
    - { keys: [ArrowDown], action: From the last item wraps to the first., when: menu open, from: last, expect: focus-wraps-to-first }
    - { keys: [ArrowUp], action: From the first item wraps to the last., when: menu open, from: first, expect: focus-wraps-to-last }
    - { keys: [Home], action: First enabled item., when: menu open, from: inside, expect: focus-first }
    - { keys: [End], action: Last enabled item., when: menu open, from: inside, expect: focus-last }
    - { keys: [Enter, ' '], action: Activates the focused item and closes., when: menu open, from: first, expect: closes }
    - { keys: [Escape], action: Closes and returns focus to the trigger., when: menu open, from: inside, expect: focus-trigger }
    - { keys: [Tab, Shift+Tab], action: Closes and moves focus to the next/previous tabbable element after the trigger., when: menu open, from: inside, expect: closes }
    - { keys: [a-z], action: Typeahead — moves to the next item whose label starts with the typed characters., when: menu open, from: first, expect: manual }
  styles:
    surface: { token: color.overlay.surface }
    border: { token: color.border }
    borderWidth: { token: border.width.thin }
    shadow: { token: shadow.overlay }
    radius: { token: radius.md }
    popupPadding: { token: space.1, description: Inset around the list so item hover backgrounds do not touch the border. }
    popupOffset: { token: space.1, description: Gap between trigger and popup. }
    typeaheadReset: { token: motion.duration.loop, description: 'How long typed characters accumulate before the typeahead buffer clears.' }
    maxHeight: { token: layout.maxWidth.prose, description: 'The popup never exceeds the viewport minus the gutter; beyond that the list scrolls (the token is the cap used on wide screens).' }
    minWidth: { token: space.20, description: 'Popup is at least this wide (space.20 × 2.5, i.e. 200px at comfortable density — the generator multiplies; no new token) and at least the trigger width.' }
    itemPaddingBlock: { token: space.sm }
    itemPaddingInline: { token: space.md }
    itemGap: { token: layout.gap.normal }
    itemRadius: { token: radius.sm }
    itemHover: { token: color.background.subtle, description: Pointer hover and keyboard focus share this highlight. }
    itemColor: { token: color.foreground }
    itemDangerColor: { token: color.foreground.danger }
    groupLabelColor: { token: color.foreground.muted }
    groupLabelSize: { token: font.size.xs }
    groupLabelWeight: { token: font.weight.semibold }
    shortcutColor: { token: color.foreground.muted }
    shortcutSize: { token: font.size.sm }
    separator: { token: color.border }
    separatorMargin: { token: space.1 }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.md }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.min }
    layer: { token: layer.dropdown }
    enter: { token: motion.duration.fast, description: Fade and a space.1 rise; instant under reduced motion. }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  a11y:
    role: menu
    requires: [accessible-name, expanded-state, arrow-navigation, roving-tabindex, escape-dismiss, focus-restore, keyboard-operable, focus-visible, contrast-aa, reduced-motion, target-24px, no-hover-only]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground, background: color.background.subtle, level: AA }
      - { foreground: color.foreground.danger, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.danger, background: color.background.subtle, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
  platforms:
    web:
      element: button
      attributes: [aria-haspopup=menu, aria-expanded, aria-controls, role=menu, role=menuitem, role=group, role=separator, aria-labelledby, tabindex]
      notes: 'Trigger is the system Button with aria-haspopup="menu", aria-expanded and aria-controls. The popup is rendered through a portal with position: fixed, placed from the trigger''s getBoundingClientRect() and flipped on overflow; z-index layer.dropdown. Outside click (pointerdown outside popup and trigger) closes. Items are <div role="menuitem" tabindex="-1"> with one roving tabindex; the menu uses real focus (not aria-activedescendant) so screen readers follow. Keyboard-focused and hovered items share the itemHover style; hover moves the roving focus so the two never diverge. Shortcuts are display-only (aria-keyshortcuts) — the menu does not bind them.'
    lit:
      tag: ds-menu
      reflect: [open, placement, icon-only]
      notes: 'Uses the Popover API (popover="manual", showPopover()) for top-layer rendering without a portal, with a position: fixed fallback; anchor positioning is computed from the trigger rect. `items` is a property. Composed `action` (detail { id }) and `open-change` (detail { open }). The trigger is a <ds-button> in the shadow root; focus delegation lands on it. The menu surface is named with aria-label from the trigger''s text (or the `label` property when given): aria-labelledby cannot reach a slotted trigger from the shadow root.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose]
      notes: 'Menus on touch are ActionSheets: on phones Menu renders an ActionSheet with the same items (groups become dividers with a muted label); on tablets and react-native-web it renders a transparent Modal with an absolutely positioned popup measured from the trigger via measureInWindow(). Items are Pressables with accessibilityRole="menuitem"; the trigger Button carries accessibilityState.expanded. Typeahead and arrow keys apply only when a hardware keyboard is present. The popup uses the RN >= 0.74 `role="menu"` prop and items `role="menuitem"`; the trigger Button receives `expanded` so accessibilityState.expanded is exposed. On phones the Menu renders ActionSheet (composition, now that it exists); the anchored dropdown is the tablet and react-native-web presentation. The list scrolls within maxHeight.'
---

A menu hides a handful of actions behind one button so a toolbar or a row stays quiet. It is the desktop counterpart of ActionSheet — anchored to what was clicked, gone with a click elsewhere, fully driveable from the keyboard, with typeahead for long lists.

## When to use

Use a Menu for secondary actions on an item or a view that do not deserve their own buttons: overflow ("More actions"), sort or view options, account menus. Group related items with a `group` label when there are more than about six; separate a danger action with a `separator`. On phones, Menu presents as an ActionSheet on its own, so use Menu wherever the interaction is "pick an action" and let the platform decide the surface.

## When not to use

Do not use a Menu for navigation between pages; use Links in a nav Landmark (a "navigation menu" in the ARIA sense is not this pattern). Do not use it to pick a value that stays selected (that is Select, planned, or a RadioGroup); menu items are actions, not state. Do not put inputs, switches or long text in a menu. Do not use a menu with one item; make it a button.

## Behavior

Activating the trigger opens the popup at `placement` (flipped if it would overflow) with focus on the first item; ArrowUp from the trigger opens with the last item focused. Arrow keys move through enabled items and wrap; Home and End jump; typing letters moves to the next matching label; Enter or Space activates the focused item, which closes the menu, returns focus to the trigger and fires `onAction(id)`. Escape closes without action and returns focus. Tab closes and lets focus move on. A pointer click outside, or the window losing focus, closes. Hovering an item moves the roving focus to it so keyboard and pointer never highlight two things. Disabled items are visible, announced disabled, skipped by arrows and typeahead, and do nothing on click.

## Content guidelines

The trigger label names the set ("More actions", "Sort by"), not "Menu". Items are verbs or short noun phrases, sentence case, no trailing punctuation; a shortcut hint uses the platform's key names ("⌘S", "Ctrl+S") and is display-only. Group labels are one or two words in the same case as headings. Danger items say what they destroy and sit last, after a separator.

## Accessibility

The trigger is a button with `aria-haspopup="menu"` and `aria-expanded`; the popup has role `menu` with an accessible name from the trigger, items are `menuitem`s (WCAG 4.1.2; APG menu button and menu). One tab stop, arrows to move (roving-tabindex, arrow-navigation), typeahead, Home/End. Escape and Tab close and restore focus (2.4.3, 2.1.2). The highlighted item is shown with a background change *and* is the focused element, so the highlight is never hover-only (no-hover-only; 1.4.13 for content on hover does not apply because the menu is opened by activation, not hover). Items reach 24px (2.5.8); on touch presentations the ActionSheet's 44px applies. Contrast is checked for normal, danger and muted text on the surface and on the highlight.

## Platform notes

### Web
Trigger: the system `Button` with `aria-haspopup="menu"`, `aria-expanded`, `aria-controls={popupId}`, `trailingIcon={<Icon name={triggerIcon} />}` (or `iconOnly`). Popup: a portal into `document.body`, `position: fixed`, `top/left` from the trigger rect for `placement` with a flip when the popup would cross the viewport edge, `z-index: var(--layer-dropdown)`, `min-inline-size: max(trigger width, minWidth)`. `<div role="menu" aria-labelledby={triggerId}>` containing `<div role="group" aria-labelledby>` for groups, `<div role="separator">`, and `<div role="menuitem" tabindex={-1|0} aria-disabled>`. Keydown handler on the menu implements the keyboard table; a `pointerdown` listener on `document` closes on outside clicks; `focusout` to outside closes. Reposition on scroll and resize while open.

### Lit
`<ds-menu label="More actions" .items=${items} icon-only>`. The popup uses `popover="manual"` when `HTMLElement.prototype.showPopover` exists (top layer, no z-index juggling) and otherwise `position: fixed` with `layer.dropdown`; position from `this.trigger.getBoundingClientRect()`. Composed `action` and `open-change`. Roving tabindex over shadow-root items; hover moves focus.

### React Native
Phones: render `ActionSheet` with `open` driven by the trigger, mapping groups to a divider plus a muted label row and `separator` to a divider. Tablets and react-native-web: a transparent `Modal` whose backdrop `Pressable` closes on tap, with the popup `View` positioned from `triggerRef.measureInWindow()` and flipped when it would overflow `useWindowDimensions()`. Items are `Pressable accessibilityRole="menuitem"` with `accessibilityState={{ disabled }}`. The trigger `Button` gets `accessibilityState={{ expanded }}`.

## Related

ActionSheet, Button, Icon, Tooltip, Select (planned).
