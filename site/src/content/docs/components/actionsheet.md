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
      controls:
        event: onClose
        state: open
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
      description: 'Escape, the scrim, the cancel row and the drag all request close; Escape still reports through onClose when false, as in Dialog. It gates the sheet presentation only — the wide Menu presentation has no scrim, drag or cancel row, and clicking outside always closes it.'
    cancelLabel:
      type: string
      description: Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`.
  events:
    onAction:
      description: An action was chosen; receives its `id`. The consumer performs it and closes.
      platforms: { web: onAction, lit: action, rn: onAction, swiftui: onAction }
      payload:
        - { name: id, type: string, description: The id of the chosen action. }
      fires: [user]
      timing: { phase: request }
    onClose:
      description: 'Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`.'
      platforms: { web: onClose, lit: close, rn: onClose, swiftui: onClose }
      payload:
        - { name: reason, type: enum, values: [escape, scrim, cancel, drag] }
      reasons:
        escape: Escape pressed while open
        scrim: the scrim was clicked
        cancel: the cancel action was chosen
        drag: the sheet was dragged past the dismiss threshold
      fires: [user]
      timing: { phase: request }
  keyboard:
    - { keys: [Escape], action: Closes without choosing., from: inside, expect: closes }
    - { keys: [ArrowDown], action: Moves focus to the next action., from: first, expect: focus-next }
    - { keys: [ArrowDown], action: From the last action wraps to the first., from: last, expect: focus-wraps-to-first }
    - { keys: [ArrowUp], action: From the first action wraps to the last., from: first, expect: focus-wraps-to-last }
    - { keys: [Home], action: First action., from: last, expect: focus-first }
    - { keys: [End], action: Last action., from: first, expect: focus-last }
    - { keys: [Enter, ' '], action: Chooses the focused action and closes., when: focus on an action, from: first, expect: closes }
    - { keys: [Tab], action: 'Closes and moves focus on (a menu is not a tab stop container). No Tab handler is needed: the roving tabindex leaves one stop and the outside-close rule does the rest, which is why this rule is manual rather than asserted.', when: wide-screen menu presentation, from: first, expect: manual }
  styles:
    scrim: { token: color.overlay.scrim, part: scrim }
    surface: { token: color.overlay.surface, part: surface }
    shadow: { token: shadow.overlay }
    radius: { token: radius.lg }
    itemPaddingBlock: { token: space.sm, part: item }
    itemPaddingInline: { token: layout.inset.md, part: item }
    itemGap: { token: layout.gap.normal, part: item, description: 'Between icon and label. Rows have no gap between them: their rhythm comes from itemPaddingBlock.' }
    headerPaddingBlock: { token: space.sm, part: header, description: 'Vertical padding of the header (handle + heading) and of the cancel row.' }
    headerGap: { token: layout.gap.tight, part: header, description: 'Between the handle and the heading.' }
    handle: { token: color.foreground.muted, part: handle, description: 'A pill (space.1 tall, space.10 wide) centered in the header, decorative and hidden from assistive technology, as BottomSheet.' }
    handleHeight: { token: space.1, part: handle }
    handleWidth: { token: space.10, part: handle }
    handleRadius: { token: radius.full, part: handle }
    itemHover: { token: color.background.subtle, part: item, state: hover }
    itemColor: { token: color.foreground, part: item }
    itemDangerColor: { token: color.foreground.danger, part: item }
    titleColor: { token: color.foreground.muted }
    titleSize: { token: font.size.sm }
    fontFamily: { token: font.family.body, description: 'Applied to the rows and forwarded to the composed heading Text as an override, since Text always sets its own family.' }
    fontSize: { token: font.size.md }
    lineHeight: { token: font.lineHeight.normal, description: 'Applied to the rows and forwarded to the composed heading Text as an override, as fontFamily is.' }
    divider: { token: color.border, description: Above the danger group and above the cancel row. }
    dividerWidth: { token: border.width.thin }
    minTarget: { token: size.target.comfortable }
    maxWidth: { token: layout.maxWidth.prose, description: 'Above this width, present as a Menu anchored to the trigger.' }
    layer: { token: layer.sheet }
    enter: { token: motion.duration.base }
    exit: { token: motion.duration.fast }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  constants:
    dismissDistance:
      description: 'Fraction of the sheet height a downward drag must pass for release to dismiss it rather than spring back.'
      value: 0.25
      unit: ratio
    dismissVelocity:
      description: 'Drag speed at release that dismisses the sheet whatever the distance travelled.'
      value: 1.5
      unit: px/ms
  copy:
    cancelLabel: Cancel
    defaultLabel: Actions
  overlay:
    layer: sheet
    open: open
    closeEvent: onClose
    dismiss: [escape, scrim, close-button, swipe]
    modal: true
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
      notes: 'Below maxWidth: a native <dialog> at the bottom edge (as BottomSheet) containing a <div role="menu" aria-label> of <button role="menuitem"> rows plus a separate Cancel <ds-button>. Above maxWidth: renders Menu anchored to the element that was focused when `open` became true. Menu owns its trigger and takes no external anchor, so the wide presentation places the Menu host at the opener''s rect and keeps its own trigger invisible and out of reach — `opacity: 0`, `pointer-events: none`, `tabindex="-1"`, `aria-hidden="true"` — which anchors to the rect rather than to the node and is close enough; it is never a focus stop. `container?: HTMLElement` (default document.body) is the portal target — a platform prop every portaled overlay accepts, not a schema prop, and it is forwarded to the wide Menu too. Roving tabindex over the items; first item focused on open. The forwarded ref is the sheet presentation''s <dialog>; in the wide presentation there is no equivalent node and the ref stays null.'
    lit:
      tag: ds-action-sheet
      reflect: [open]
      notes: '`actions` is a property. Composed `action` (detail { id }) and `close` (detail { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet; the wide presentation renders <ds-menu>, positioned at the opener''s rect with its own trigger hidden, as on web. The heading is named by `aria-label` rather than an id reference, since ids do not cross the shadow root.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose, accessibilityViewIsModal]
      notes: 'A native Modal sheet: a View with accessibilityRole="menu" containing Pressable rows with accessibilityRole="menuitem" and a separate Cancel Button, drag-to-dismiss on the header as BottomSheet. iOS''s ActionSheetIOS is not used, so the look matches the theme on both platforms. There is no wide presentation on native: Menu renders its own trigger and cannot be anchored to an external element, so tablets above maxWidth get the sheet too and `maxWidth` is a no-op override here. The surface uses the RN >= 0.74 `role="menu"` prop with accessibilityViewIsModal; rows are `role="menuitem"`. Pressable has no key events, so there are no arrow keys, no Home/End and no roving tabindex; each row is its own accessibility focus stop reached by swipe, and Enter/Space are the platform''s own activation.'
    swiftui:
      element: confirmationDialog
      props: [.confirmationDialog, Button, role=destructive, role=cancel, titleVisibility]
      notes: '`.confirmationDialog(title, isPresented:, titleVisibility: .visible)` with one `Button` per action (`destructive` via `role: .destructive`, cancel via `role: .cancel` from copy) — the system action sheet is the pattern users expect and VoiceOver handles it natively; the doc''s surface bindings are no-ops here (the gallery notes it), `description` becomes the message. `onAction` with the action id, `onClose` on dismissal.'
  behavior:
    # Authored scenarios; the parser adds renders/accessible-name/escape ones from the schema.
    # Every scenario states `actions`: the sheet has no Default story args to fall back on.
    - name: choosing-an-action-fires-on-action
      description: A row reports the chosen action; the consumer performs it and closes.
      given:
        open: true
        heading: 'Photo.jpg'
        actions:
          - { id: 'share', label: 'Share' }
          - { id: 'rename', label: 'Rename' }
          - { id: 'delete', label: 'Delete photo', tone: 'danger' }
      when: { click: item }
      then:
        - { event: onAction }
    - name: the-cancel-row-fires-on-close
      description: The explicit Cancel row is a dismissal, not a choice, so onAction stays silent.
      given:
        open: true
        heading: 'Photo.jpg'
        actions:
          - { id: 'share', label: 'Share' }
          - { id: 'rename', label: 'Rename' }
      when: { click: cancelButton }
      then:
        - { event: onClose }
        - { event: onAction, fired: false }
    - name: non-dismissible-still-reports-escape
      description: As in Dialog, Escape reports through onClose even when `dismissible` is false.
      given:
        open: true
        heading: 'Photo.jpg'
        dismissible: false
        actions:
          - { id: 'share', label: 'Share' }
          - { id: 'rename', label: 'Rename' }
      when: { key: Escape }
      then:
        - { event: onClose }
      platforms: [web, lit]
    - name: the-cancel-row-is-named-from-copy
      description: With no cancelLabel the cancel row falls back to copy.cancelLabel.
      given:
        open: true
        heading: 'Photo.jpg'
        actions:
          - { id: 'share', label: 'Share' }
          - { id: 'rename', label: 'Rename' }
      then:
        - { copy: cancelLabel }
    - name: the-list-is-a-menu
      description: The actions are a menu of menuitems (APG menu button), not a list of buttons.
      given:
        open: true
        heading: 'Photo.jpg'
        actions:
          - { id: 'share', label: 'Share' }
          - { id: 'rename', label: 'Rename' }
      then:
        - { role: menu }
    - name: closed-sheet-renders-nothing
      given:
        open: false
        actions:
          - { id: 'share', label: 'Share' }
      then:
        - { renders: false }
  examples:
    - name: photo-actions
      description: Contextual actions on an item, with the destructive one last.
      given:
        open: true
        heading: 'Photo.jpg'
        actions:
          - { id: 'share', label: 'Share', icon: 'external' }
          - { id: 'rename', label: 'Rename' }
          - { id: 'duplicate', label: 'Duplicate' }
          - { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' }
    - name: unnamed-sheet
      description: A sheet with no heading, named by copy.defaultLabel for assistive technology.
      given:
        open: true
        actions:
          - { id: 'copy', label: 'Copy link' }
          - { id: 'open', label: 'Open in new tab' }
    - name: with-an-unavailable-action
      description: An action that is shown but cannot be used here, announced as disabled rather than hidden.
      given:
        open: true
        heading: 'Invoice 4821'
        cancelLabel: 'Not now'
        actions:
          - { id: 'download', label: 'Download' }
          - { id: 'void', label: 'Void invoice', tone: 'danger', disabled: true }
---

An action sheet answers "what can I do with this?" — the long-press or overflow menu of mobile. It lists a handful of verbs, groups the dangerous one at the bottom, and adds an explicit Cancel because thumbs miss. On wide screens the same list is a Menu next to what was clicked.

## When to use

Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits without scrolling; more than eight actions means the item needs its own screen. Put destructive actions last with `tone: danger`.

## When not to use

Do not use it for navigation (Menu in a nav Landmark, or Links), for settings with state (a screen of Switches), for choosing a value (Select or RadioGroup in a BottomSheet), or for confirming — an ActionSheet's danger row opens an AlertDialog, it does not itself confirm. Do not put forms in it.

## Behavior

Opening presents the list with focus on the first action; arrow keys move between actions, Enter or Space chooses and fires `onAction(id)`, Escape, the scrim, the Cancel row, or a drag close it with `onClose`. Disabled actions are shown, skipped by arrow navigation, and announced as disabled. On wide screens the sheet becomes a Menu anchored to the opener: same actions, same events, no Cancel row (clicking outside closes). Focus returns to the opener on close in both presentations. On phones the sheet has BottomSheet's handle and header, and the drag-to-dismiss gesture lives on them (the same 25% / 1.5 px/ms rule). Above the breakpoint it renders Menu at the rect of the element that was focused when `open` became true, with Menu's own trigger hidden and unfocusable, and maps Menu's close reasons to its own: `escape` → escape, `outside` → scrim, `action` → nothing. A close that accompanies a chosen action never fires `onClose`, whatever order the two arrive in — `onAction` is the only event for a choice.

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
`Modal` sheet with `View accessibilityRole="menu"` of `Pressable accessibilityRole="menuitem"` rows (`accessibilityState={{ disabled }}`), a divider and a Cancel `Button`; drag-to-dismiss on the header via `PanResponder`, with the decorative handle pill above the heading; `onRequestClose` → `onClose('escape')`. The sheet is the only presentation on native — see the platform note.

## Related

BottomSheet, Menu, Button, AlertDialog.
