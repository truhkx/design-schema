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
      a11y: 'aria-label of the menu and the accessible name of its trigger.'
    items:
      type: array
      required: true
      shape: '({ id: string; label: string; icon?: IconName; shortcut?: string; tone?: "default" | "danger"; disabled?: boolean } | { group: string; items: MenuItem[] } | { separator: true })[]'
      description: 'Actions, optionally grouped with a label or divided by separators. Groups render their label as a non-interactive heading row and hold action items only — the shape is recursive but a group inside a group is not a shape this component draws.'
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
      description: 'Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. With `triggerIcon: none` there would be nothing visible to press, so that pairing warns in development.'
    placement:
      type: enum
      values: [bottom-start, bottom-end, top-start, top-end]
      default: bottom-start
      description: Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport.
    open:
      type: boolean
      description: 'Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu.'
      controls:
        event: onOpenChange
        state: open
    anchor:
      type: object
      shape: 'RefObject<HTMLElement | View>'
      description: 'Position the popup relative to this element instead of rendering a trigger; the trigger part is omitted and `open` must be controlled. Used by ActionSheet above its breakpoint and by context menus.'
  events:
    onAction:
      description: An item was chosen; receives its `id`. The menu closes itself first.
      platforms: { web: onAction, lit: action, rn: onAction, swiftui: onAction }
      payload:
        - { name: id, type: string, description: The id of the chosen item. }
      fires: [user]
    onOpenChange:
      description: 'Fired when the menu opens or closes, with `{ open, reason }` — reason: `trigger`, `escape`, `outside`, `action` (an item was chosen; fired before onAction), `controlled`.'
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange, swiftui: onOpenChange }
      payload:
        - { name: open, type: boolean, description: The new state of the menu. }
        - { name: reason, type: enum, values: [trigger, escape, outside, action, controlled] }
      reasons:
        trigger: the trigger was activated
        escape: Escape pressed while open
        outside: a pointer press landed outside the menu
        action: an item was chosen
        controlled: 'the consumer changed the open prop — the menu never raises this itself; it exists so a composing component can forward its own reason through'
      fires: [user, controlled]
      timing: { phase: after-change, before: [onAction] }
  keyboard:
    - { keys: [Enter, ' ', ArrowDown], action: Opens the menu and focuses the first item., when: focus on trigger, from: trigger, expect: manual }
    - { keys: [ArrowUp], action: Opens the menu and focuses the last item., when: focus on trigger, from: trigger, expect: manual }
    - { keys: [ArrowDown], action: Moves to the next enabled item., when: menu open, from: first, expect: focus-next }
    - { keys: [ArrowDown], action: From the last item wraps to the first., when: menu open, from: last, expect: focus-wraps-to-first }
    - { keys: [ArrowUp], action: From the first item wraps to the last., when: menu open, from: first, expect: focus-wraps-to-last }
    - { keys: [Home], action: First enabled item., when: menu open, from: inside, expect: focus-first }
    - { keys: [End], action: Last enabled item., when: menu open, from: inside, expect: focus-last }
    - { keys: [Enter, ' '], action: Activates the focused item and closes., when: menu open, from: first, expect: closes }
    - { keys: [Escape], action: Closes and returns focus to the trigger., when: menu open, from: inside, expect: [closes, focus-trigger] }
    - { keys: [Tab, Shift+Tab], action: Closes and moves focus to the next/previous tabbable element after the trigger., when: menu open, from: inside, expect: closes }
    - { keys: [a-z], action: Typeahead — moves to the next item whose label starts with the typed characters., when: menu open, from: first, expect: manual }
  styles:
    surface: { token: color.overlay.surface }
    border: { token: color.border }
    borderWidth: { token: border.width.thin }
    shadow: { token: shadow.overlay }
    radius: { token: radius.md }
    popupPadding: { token: space.1, part: popup, description: Inset around the list so item hover backgrounds do not touch the border. }
    popupOffset: { token: space.1, part: popup, description: Gap between trigger and popup. }
    typeaheadReset: { token: motion.duration.loop, description: 'How long typed characters accumulate before the typeahead buffer clears.' }
    maxHeight: { token: layout.maxWidth.prose, description: 'The popup never exceeds the viewport minus the gutter; beyond that the list scrolls (the token is the cap used on wide screens).' }
    minWidth: { token: space.20, computed: { times: 2.5 }, description: 'Popup is at least this wide (200px at comfortable density) and at least the trigger width.' }
    itemPaddingBlock: { token: space.sm, part: item }
    itemPaddingInline: { token: space.md, part: item }
    itemGap: { token: layout.gap.normal, part: item }
    itemRadius: { token: radius.sm, part: item }
    itemHover: { token: color.background.subtle, part: item, state: hover, description: Pointer hover and keyboard focus share this highlight. }
    itemColor: { token: color.foreground, part: item }
    itemDangerColor: { token: color.foreground.danger, part: item }
    groupLabelColor: { token: color.foreground.muted, part: groupLabel }
    groupLabelSize: { token: font.size.xs, part: groupLabel }
    groupLabelWeight: { token: font.weight.semibold, part: groupLabel }
    shortcutColor: { token: color.foreground.muted }
    shortcutSize: { token: font.size.sm }
    separator: { token: color.border, part: separator }
    separatorMargin: { token: space.1, part: separator }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.md }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.min }
    layer: { token: layer.dropdown }
    enter: { token: motion.duration.fast, description: Fade and a space.1 rise; instant under reduced motion. }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  overlay:
    layer: popover
    anchor: trigger
    placement: placement
    collision: flip
    open: open
    closeEvent: onOpenChange
    dismiss: [escape, outside-press, focus-out]
    modal: false
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
      notes: 'Trigger is the system Button with aria-haspopup="menu", aria-expanded and aria-controls. The popup is rendered through a portal with position: fixed, placed from the trigger''s getBoundingClientRect() and flipped on overflow; z-index layer.dropdown. Outside click (pointerdown outside popup and trigger) closes. Items are <div role="menuitem" tabindex="-1"> with one roving tabindex; the menu uses real focus (not aria-activedescendant) so screen readers follow. Keyboard-focused and hovered items share the itemHover style; hover moves the roving focus so the two never diverge. Shortcuts are display-only and aria-hidden — the menu does not bind them, and it does not put them in `aria-keyshortcuts` either, since a display string like "⌘S" is not that attribute''s syntax. One element carries `data-part="popup"` and the `role="menu"` list: the popup and list parts are the same node, as the markup here shows. Disabled items stay in the DOM with `aria-disabled="true"` and are skipped by the arrows, Home/End and typeahead. `container?: HTMLElement` (default document.body) is the portal target — a platform prop, not a schema prop. Page scroll is not locked: a menu is not modal, and the popup repositions on scroll. Clicking the trigger while the menu is open closes it.'
    lit:
      tag: ds-menu
      reflect: [open, placement, icon-only]
      notes: 'Uses the Popover API (popover="manual", showPopover()) for top-layer rendering without a portal, with a position: fixed fallback; anchor positioning is computed from the trigger rect. `items` is a property. Composed `action` (detail { id }) and `open-change` (detail { open, reason }, the same payload as every other platform — the reason is not dropped here). The trigger is a <ds-button> in the shadow root; focus delegation lands on it. The menu surface is named with aria-label from the trigger''s text (or the `label` property when given): aria-labelledby cannot reach a slotted trigger from the shadow root.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose]
      notes: 'Menus on touch are ActionSheets: on phones Menu renders an ActionSheet with the same items (groups become dividers with a muted label); on tablets and react-native-web it renders a transparent Modal with an absolutely positioned popup measured from the trigger via measureInWindow(). Items are Pressables with accessibilityRole="menuitem"; the trigger Button carries accessibilityState.expanded. Typeahead and arrow keys apply only when a hardware keyboard is present. The popup uses the RN >= 0.74 `role="menu"` prop and items `role="menuitem"`; the trigger Button receives `expanded` so accessibilityState.expanded is exposed. On phones the Menu renders ActionSheet (composition, now that it exists), and the phone/tablet split uses layout.maxWidth.prose, the same threshold Select and Combobox use; the anchored dropdown is the tablet and react-native-web presentation. ActionSheet takes a flat action list, so in the phone presentation groups are flattened and their labels, the separators and the shortcut hints are dropped — a touch surface has no keyboard to hint at, and a heading faked as an inert row would misread. ActionSheet''s close reasons map to this component''s: `escape` stays, and `scrim`, `cancel` and `drag` all become `outside`. Pressable has no key events, so there are no arrows, no Home/End and no typeahead; each item is its own focus stop, and `typeaheadReset` has nothing to reset here. Opening cannot tell ArrowUp from Enter on the trigger Button, so every open focuses the first enabled item. The list scrolls within maxHeight.'
    swiftui:
      element: Menu
      props: [Menu, .menuStyle, .menuOrder, Button, Divider, .accessibilityLabel, .contextMenu]
      notes: 'SwiftUI `Menu(label:)` — the system menu is the native pattern, keyboard-navigable on iPad, VoiceOver-native, and it takes the theme through `.tint` and `.menuStyle` for the trigger only (the popup''s surface is the system''s; the doc''s popup bindings are no-ops on iOS, noted in the gallery). Items are `Button`s (destructive via `role: .destructive`), groups `Section`s with a header, separators `Divider`; disabled items `.disabled(true)` (the system menu skips them, matching the doc). `onOpenChange` fires from the label''s press and the menu''s dismissal via `.onChange` of a presentation binding on the wrapper. `trigger: contextMenu` uses `.contextMenu`.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/escape ones from the schema.
    - name: choosing-an-item-reports-the-action-and-the-close
      description: Activating an item closes the menu and fires onAction; onOpenChange precedes it with reason action.
      given:
        open: true
        label: 'More actions'
        items:
          - { id: 'rename', label: 'Rename' }
          - { id: 'duplicate', label: 'Duplicate' }
      when: { click: item }
      then:
        - { event: onAction }
        - { event: onOpenChange }
    - name: a-disabled-item-does-nothing
      description: Disabled items are visible and announced disabled, and do nothing on click.
      given:
        open: true
        label: 'More actions'
        items:
          - { id: 'rename', label: 'Rename', disabled: true }
          - { id: 'duplicate', label: 'Duplicate' }
      when: { click: item }
      then:
        - { event: onAction, fired: false }
    - name: escape-closes-without-choosing
      description: Escape closes and returns focus to the trigger without activating anything (keyboard rule 9).
      given:
        open: true
        label: 'More actions'
        items:
          - { id: 'rename', label: 'Rename' }
          - { id: 'duplicate', label: 'Duplicate' }
      when: { key: Escape }
      then:
        - { event: onAction, fired: false }
      platforms: [web, lit]
    - name: the-popup-is-a-menu
      description: The popup is a menu of menuitems named by the trigger (APG menu button), not a list of buttons.
      given:
        open: true
        label: 'More actions'
        items:
          - { id: 'rename', label: 'Rename' }
      then:
        - { role: menu }
  examples:
    - name: row-overflow
      description: The icon-only overflow button on a row, with the destructive action last after a separator.
      given:
        label: 'More actions'
        iconOnly: true
        triggerIcon: ellipsis
        items:
          - { id: 'rename', label: 'Rename' }
          - { id: 'duplicate', label: 'Duplicate' }
          - { separator: true }
          - { id: 'delete', label: 'Delete file', tone: 'danger' }
    - name: sort-by
      description: A labelled dropdown of view options, anchored under a secondary trigger.
      given:
        label: 'Sort by'
        triggerVariant: secondary
        triggerIcon: chevron-down
        items:
          - { id: 'name', label: 'Name' }
          - { id: 'modified', label: 'Last modified' }
          - { id: 'size', label: 'Size' }
    - name: grouped-account-menu
      description: More than about six items, so they are grouped with labels; aligned to the end of the trigger.
      given:
        label: 'Account'
        placement: bottom-end
        items:
          - { group: 'Account', items: [{ id: 'profile', label: 'Profile' }, { id: 'billing', label: 'Billing' }] }
          - { group: 'Workspace', items: [{ id: 'members', label: 'Members' }, { id: 'settings', label: 'Settings' }] }
          - { separator: true }
          - { id: 'sign-out', label: 'Sign out' }
    - name: with-shortcuts
      description: Display-only shortcut hints beside the items the app binds elsewhere.
      given:
        label: 'Edit'
        items:
          - { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' }
          - { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z' }
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
