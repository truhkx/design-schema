---
title: ActionSheet
description: A short list of actions for the thing the user just touched — a sheet from the bottom on phones, a Menu anchored to the trigger on wide screens.
component:
  name: ActionSheet
  category: overlay
  status: review
  apg: menu-button
  anatomy: [scrim, surface, focusScope, handle, header, heading, list, item, itemIcon, cancelButton]
  composition:
    focusScope: FocusScope
    heading: Text
    itemIcon: Icon
    cancelButton: Button
  props:
    open:
      type: boolean
      required: true
      description: Controlled visibility.
    heading:
      type: string
      description: 'What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name; when omitted the name is `copy.defaultLabel`.'
    actions:
      type: array
      required: true
      shape: '{ id: string; label: string; icon?: IconName; tone?: "default" | "danger"; disabled?: boolean }[]'
      description: Two to about eight actions. `danger` actions are visually distinct and grouped last.
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the scrim, the cancel row and the drag all request close; Escape still reports through onClose when false, as in Dialog.'
    cancelLabel:
      type: string
      description: Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`.
  events:
    onAction:
      description: An action was chosen; receives its `id`. The consumer performs it and closes.
      platforms: { web: onAction, lit: action, rn: onAction }
    onClose:
      description: 'Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`.'
      platforms: { web: onClose, lit: close, rn: onClose }
  keyboard:
    - { keys: [Escape], action: Closes without choosing., from: inside, expect: closes }
    - { keys: [ArrowDown], action: Moves focus to the next action., from: first, expect: focus-next }
    - { keys: [ArrowDown], action: From the last action wraps to the first., from: last, expect: focus-wraps-to-first }
    - { keys: [ArrowUp], action: From the first action wraps to the last., from: first, expect: focus-wraps-to-last }
    - { keys: [Home], action: First action., from: last, expect: focus-first }
    - { keys: [End], action: Last action., from: first, expect: focus-last }
    - { keys: [Enter, ' '], action: Chooses the focused action and closes., when: focus on an action, from: first, expect: closes }
    - { keys: [Tab], action: Closes and moves focus on (a menu is not a tab stop container)., when: wide-screen menu presentation, from: first, expect: manual }
  styles:
    scrim: { token: color.overlay.scrim }
    surface: { token: color.overlay.surface }
    shadow: { token: shadow.overlay }
    radius: { token: radius.lg }
    itemPaddingBlock: { token: space.sm }
    itemPaddingInline: { token: layout.inset.md }
    itemGap: { token: layout.gap.normal, description: 'Between icon and label. Rows have no gap between them: their rhythm comes from itemPaddingBlock.' }
    headerPaddingBlock: { token: space.sm, description: 'Vertical padding of the header (handle + heading) and of the cancel row.' }
    itemHover: { token: color.background.subtle }
    itemColor: { token: color.foreground }
    itemDangerColor: { token: color.foreground.danger }
    titleColor: { token: color.foreground.muted }
    titleSize: { token: font.size.sm }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.md }
    lineHeight: { token: font.lineHeight.normal }
    divider: { token: color.border, description: Above the danger group and above the cancel row. }
    dividerWidth: { token: border.width.thin }
    minTarget: { token: size.target.comfortable }
    maxWidth: { token: layout.maxWidth.prose, description: 'Above this width, present as a Menu anchored to the trigger.' }
    layer: { token: layer.sheet }
    enter: { token: motion.duration.base }
    exit: { token: motion.duration.fast }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  copy:
    cancelLabel: Cancel
    defaultLabel: Actions
  a11y:
    role: menu
    requires: [accessible-name, focus-trap, focus-restore, escape-dismiss, inert-background, arrow-navigation, roving-tabindex, keyboard-operable, focus-visible, contrast-aa, reduced-motion, target-44px, gesture-alternative]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground, background: color.background.subtle, level: AA }
      - { foreground: color.foreground.danger, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
  platforms:
    web:
      element: dialog
      attributes: [aria-modal, aria-label, role=menu, role=menuitem]
      notes: 'Below maxWidth: a native <dialog> at the bottom edge (as BottomSheet) containing a <div role="menu" aria-label> of <button role="menuitem"> rows plus a separate Cancel <ds-button>. Above maxWidth: renders Menu anchored to the element that was focused when `open` became true. Roving tabindex over the items; first item focused on open.'
    lit:
      tag: ds-action-sheet
      reflect: [open]
      notes: '`actions` is a property. Composed `action` (detail { id }) and `close` (detail { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet; the wide presentation renders <ds-menu>.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose, accessibilityViewIsModal]
      notes: 'A native Modal sheet: a View with accessibilityRole="menu" containing Pressable rows with accessibilityRole="menuitem" and a separate Cancel Button, drag-to-dismiss on the header as BottomSheet. iOS''s ActionSheetIOS is not used, so the look matches the theme on both platforms. On tablets above maxWidth, presents as Menu. The surface uses the RN >= 0.74 `role="menu"` prop with accessibilityViewIsModal; rows are `role="menuitem"`. Arrow keys do not exist on native; each row is its own focus stop.'
---

An action sheet answers "what can I do with this?" — the long-press or overflow menu of mobile. It lists a handful of verbs, groups the dangerous one at the bottom, and adds an explicit Cancel because thumbs miss. On wide screens the same list is a Menu next to what was clicked.

## When to use

Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits without scrolling; more than eight actions means the item needs its own screen. Put destructive actions last with `tone: danger`.

## When not to use

Do not use it for navigation (Menu in a nav Landmark, or Links), for settings with state (a screen of Switches), for choosing a value (Select or RadioGroup in a BottomSheet), or for confirming — an ActionSheet's danger row opens an AlertDialog, it does not itself confirm. Do not put forms in it.

## Behavior

Opening presents the list with focus on the first action; arrow keys move between actions, Enter or Space chooses and fires `onAction(id)`, Escape, the scrim, the Cancel row, or a drag close it with `onClose`. Disabled actions are shown, skipped by arrow navigation, and announced as disabled. On wide screens the sheet becomes a Menu anchored to the opener: same actions, same events, no Cancel row (clicking outside closes). Focus returns to the opener on close in both presentations. On phones the sheet has BottomSheet''s handle and header, and the drag-to-dismiss gesture lives on them (the same 25% / 1.5 px/ms rule). Above the breakpoint it renders Menu with `anchor` set to the element that was focused when `open` became true (Menu renders no trigger in that mode), and maps Menu''s onOpenChange reasons to its own: `escape` → escape, `outside` → scrim, `action` → nothing (onAction fires instead).

## Content guidelines

Actions are verbs, one or two words, sentence case ("Rename", "Move to folder"). The title is the item's name, not "Options". Danger actions say what they destroy ("Delete photo"). Cancel is "Cancel".

## Accessibility

The list is a `menu` of `menuitem`s with an accessible name (WCAG 4.1.2, APG menu button). One tab stop; arrows move (roving-tabindex, arrow-navigation). Escape closes and focus returns to the opener (2.4.3). On phones the sheet is modal (inert background, focus trap) and every row meets 44px. The drag gesture is additive to Cancel and Escape (2.5.1). Danger rows are distinguished by color *and* position and an icon when given, never color alone (1.4.1). Contrast is checked for normal, danger and muted text on the surface and for the hover row.

## Platform notes

### Web
Below the breakpoint, reuse BottomSheet's `<dialog>` mechanics with `height: content`, a `<p>` title (muted, small), `<div role="menu" aria-label={heading ?? copy.defaultLabel}>` of `<button role="menuitem" tabindex={roving}>` rows (icon via `<Icon>`, label, `aria-disabled` for disabled), a divider before the danger group, and a separate Cancel `<Button variant="secondary">` under a divider. Above the breakpoint, render `<Menu>` with the same `actions`, anchored to `document.activeElement` at open time.

### Lit
`<ds-action-sheet open heading="Photo.jpg" .actions=${[...]}>`; shadow `<dialog>` or `<ds-menu>` by `matchMedia`; composed `action` and `close`.

### React Native
`Modal` sheet with `View accessibilityRole="menu"` of `Pressable accessibilityRole="menuitem"` rows (`accessibilityState={{ disabled }}`), a divider and a Cancel `Button`; drag-to-dismiss on the header via `PanResponder`; `onRequestClose` → `onClose('escape')`. On tablets above the breakpoint, `Menu`.

## Related

BottomSheet, Menu, Button, AlertDialog.
