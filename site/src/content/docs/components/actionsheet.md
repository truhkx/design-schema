---
title: ActionSheet
description: A short list of actions for the thing the user just touched — a sheet from the bottom on phones, a Menu anchored to the trigger on wide screens.
component:
  name: ActionSheet
  category: overlay
  status: review
  apg: menu-button
  anatomy: [scrim, surface, focusScope, handle, header, heading, list, item, itemIcon, divider, cancelButton]
  composition:
    focusScope: { component: FocusScope, props: { trapped: true, restoreFocus: true, autoFocus: none, active: { from: open } } }
    heading: { component: Text, props: { element: p, tone: muted, size: sm }, forwards: { fontFamily: fontFamily, titleSize: fontSize, lineHeight: lineHeight } }
    itemIcon: Icon
    cancelButton: { component: Button, props: { variant: secondary } }
  props:
    open:
      type: boolean
      required: true
      description: 'Controlled only — there is no uncontrolled mode; the consumer owns `open`, the sheet requests a dismissal through `onClose` and reports a choice through `onAction`, and the consumer sets `open` to false for both.'
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
      description: 'Two to about eight actions. `danger` actions are visually distinct and grouped last. The count is guidance, not enforced: no dev warning outside that range. Every optional field also accepts an explicit `undefined` (`icon?: IconName | undefined`, and so on) wherever the type is written out, since rn Menu builds these objects with explicit undefined values under exactOptionalPropertyTypes.'
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the scrim, the cancel row and the drag all request close. When false, as in Dialog: the Cancel row and the divider above it are not rendered, the drag handle is not rendered, the scrim and the drag do nothing, and Escape still reports through onClose; with no `heading` either, the header has nothing to show and is not rendered at all (no empty padded strip). It gates the sheet presentation only — the wide Menu presentation has no scrim, drag or cancel row, and clicking outside always closes it.'
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
    - { keys: [Enter, ' '], action: 'Fires onAction for the focused action (nothing when it is disabled); the sheet does not close itself — the Keyboard story''s consumer closes on onAction.', when: focus on an action, from: first, expect: closes }
    - { keys: [Tab], action: 'Closes and moves focus on (a menu is not a tab stop container). No Tab handler is needed: the roving tabindex leaves one stop and the outside-close rule does the rest, which is why this rule is manual rather than asserted.', when: wide-screen menu presentation, from: first, expect: manual }
  styles:
    scrim: { token: color.overlay.scrim, part: scrim }
    surface: { token: color.overlay.surface, part: surface }
    shadow: { token: shadow.overlay, part: surface }
    radius: { token: radius.lg, part: surface, description: Top corners only on the sheet. }
    itemPaddingBlock: { token: space.sm, part: item }
    itemPaddingInline: { token: layout.inset.md, part: item, description: 'Inline padding of the rows, and also of the header and the cancel row, which have no inline binding of their own.' }
    itemGap: { token: layout.gap.normal, part: item, description: 'Between icon and label. Rows have no gap between them: their rhythm comes from itemPaddingBlock.' }
    headerPaddingBlock: { token: space.sm, part: header, description: 'Vertical padding of the header (handle + heading) and of the cancel row; their inline padding is itemPaddingInline.' }
    headerGap: { token: layout.gap.tight, part: header, description: 'Between the handle and the heading.' }
    handle: { token: color.foreground.muted, part: handle, description: 'A pill (space.1 tall, space.10 wide) centered in the header, decorative and hidden from assistive technology, as BottomSheet.' }
    handleHeight: { token: space.1, part: handle }
    handleWidth: { token: space.10, part: handle }
    handleRadius: { token: radius.full, part: handle }
    itemHover: { token: color.background.subtle, part: item, state: hover, description: 'Paint only: hovering a row does not move focus, which stays on the roving item. React Native has no hover on touch, so the pressed state paints it too (react-native-web also gets hover in/out). The paint change has no binding of its own: on web and Lit it transitions over motion.duration.fast with motion.easing.standard, removed under reduced motion.' }
    itemColor: { token: color.foreground, part: item }
    itemDangerColor: { token: color.foreground.danger, part: item }
    titleColor: { token: color.foreground.muted, part: heading, locked: true, description: 'Realized by the composed heading Text''s tone="muted"; Text owns its color, so this is not overridable.' }
    titleSize: { token: font.size.sm, part: heading, description: 'The composed heading Text''s size="sm", forwarded to its fontSize override; no host hook of its own. The forward always reaches Text with ActionSheet''s resolved value: on web and Lit through Text''s CSS hook (`--ds-text-font-size`) set to `--ds-action-sheet-title-size` in the sheet''s stylesheet, with `overrides.fontSize` passed only when the caller set this override, so consumer CSS on the sheet hook still works; on rn the resolved value (the default token or the override) is always passed in Text''s `overrides`.' }
    fontFamily: { token: font.family.body, part: item, description: 'Applied to each row (not the list) and forwarded to the composed heading Text as an override, since Text always sets its own family; delivered the way titleSize describes.' }
    fontSize: { token: font.size.md, part: item }
    lineHeight: { token: font.lineHeight.normal, part: item, description: 'Applied to each row and forwarded to the composed heading Text as an override, as fontFamily is (delivered the way titleSize describes).' }
    divider: { token: color.border, part: divider, description: 'Two dividers, two rules. The danger-group divider is drawn only when there are both default and danger actions; it sits inside the menu and is exposed as role="separator" (rn: a View with role="separator" among the rows). The cancel divider sits above the cancel row whenever that row is rendered, outside the menu; it is decorative and hidden from assistive technology (aria-hidden; rn: importantForAccessibility="no-hide-descendants" and accessibilityElementsHidden).' }
    dividerWidth: { token: border.width.thin, part: divider }
    minTarget: { token: size.target.comfortable }
    maxWidth: { token: layout.maxWidth.prose, locked: true, description: 'Above this width, present as a Menu anchored to the opener; the comparison is (width > token), so exactly the token width is the sheet (React Native has no wide presentation; see its note). The breakpoint is read from the theme token, not per instance.' }
    layer: { token: layer.sheet, part: surface, description: 'Stacking order. It has no effect inside the browser top layer or a native Modal window; it applies to the non-top-layer fallback (position: fixed) and the rn anchor view.' }
    enter: { token: motion.duration.base, part: surface, description: 'Slide up from the bottom edge with motion.easing.standard, the scrim fading with the same duration and easing; instant under reduced motion.' }
    exit: { token: motion.duration.fast, part: surface, description: 'Slide down with motion.easing.exit, the scrim fading with the same duration and easing. A below-threshold drag release springs back with this duration and motion.easing.standard, instant under reduced motion. One duration hook serves both; the two easings are fixed tokens chosen per case, with no hooks of their own. After a dismissing release the surface holds the released offset until the consumer''s next render: `open` false plays this exit from there; `open` still true springs back (motion.easing.standard over this duration), and an interrupted enter animation is finished by that spring-back.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  constants:
    dismissDistance:
      description: 'Fraction of the sheet height a downward drag must pass for release to dismiss it rather than spring back. No token expresses a ratio, so it stays a documented module constant marked `literal-ok`, the same value as BottomSheet.'
      value: 0.25
      unit: ratio
    dismissVelocity:
      description: 'Drag speed at release that dismisses the sheet whatever the distance travelled. Measured exactly as BottomSheet: between the last two move samples before release, from the event timestamps (web and Lit `event.timeStamp`, rn `nativeEvent.timestamp`, not PanResponder''s averaged `gestureState.vy`); only downward speed counts. No token expresses px/ms, so it stays a documented module constant marked `literal-ok`.'
      value: 1.5
      unit: px/ms
    dragSlop:
      description: 'Downward distance a pointer must move on the handle or header before the drag claims it, as BottomSheet; a shorter press is not a drag and nothing fires. The drag offset is measured from where the slop was crossed, so the surface does not jump. On web and Lit the length is read from the resolved custom property at gesture start and converted to px (rem × root font size).'
      token: space.1
      unit: px
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
      notes: 'Below maxWidth: a native <dialog> at the bottom edge (as BottomSheet) containing a <div role="menu" aria-label> of <button role="menuitem"> rows plus a separate Cancel <ds-button>. Above maxWidth: renders Menu with its `anchor` prop set to a ref of the element that was focused when `open` became true (document.body when nothing had focus), with `open` controlled by the sheet; Menu then renders no trigger and returns focus to the opener itself. `container?: HTMLElement` (default document.body) is the portal target — a platform prop every portaled overlay accepts, not a schema prop, and it is forwarded to the wide Menu too. Roving tabindex over the items; first enabled item focused on open. The forwarded ref is the sheet presentation''s <dialog>, null while closed; in the wide presentation there is no equivalent node and the ref stays null. A part realized by a composed Button lives on an overlay-owned wrapper: the Cancel row element carries `data-part="cancelButton"` and wraps the Button, and `itemIcon` is a span wrapping Icon. In the wide presentation Menu owns every part and its own hooks; no ActionSheet `data-part` values appear. The inert background is showModal()''s guarantee: where showModal() does not exist (jsdom) the `open`-attribute fallback exists only so tests can render, and makes nothing inert; it is not a supported browser path.'
    lit:
      tag: ds-action-sheet
      reflect: [open]
      notes: '`actions` is a property. Composed `action` (detail { id }) and `close` (detail { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet; the wide presentation renders <ds-menu> with its `anchor` property set to the opener (document.body when nothing had focus), so it renders no trigger, as on web. The breakpoint media query is built from the theme token (maxWidth is locked). Lit exposes no ref-like property (no `dialog` getter); the web ref sentence is web-only. As on web, a part realized by a composed component lives on an overlay-owned wrapper carrying `data-part`: `[data-part="cancelButton"]` is the row wrapping the <ds-button>, `itemIcon` is a span wrapping <ds-icon>, and the heading is a wrapper around <ds-text> (ds-* hosts carry no data-part of their own). The heading is named by `aria-label` rather than an id reference, since ids do not cross the shadow root.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose, accessibilityViewIsModal]
      notes: 'A native Modal sheet: a View with accessibilityRole="menu" containing Pressable rows with accessibilityRole="menuitem" and a separate Cancel Button, drag-to-dismiss on the header as BottomSheet. iOS''s ActionSheetIOS is not used, so the look matches the theme on both platforms. There is no wide presentation on native: Menu renders its own trigger and cannot be anchored to an external element, so tablets above maxWidth get the sheet too and `maxWidth` has no effect here. Rooted in a native Modal, the sheet exposes no ref; callers ref their opener. The root testID `ActionSheet` is on the surface, which carries the menu role and label (there is no separate `ActionSheet.surface`); a part realized by a composed component sits in a wrapping View with `testID="ActionSheet.<part>"` (the Cancel Button in `ActionSheet.cancelButton`). After the enter transition, accessibility focus moves to the first enabled row in display order (the default group, then danger). The surface uses the RN >= 0.74 `role="menu"` prop with accessibilityViewIsModal; rows are `role="menuitem"`. `accessibilityViewIsModal` is a View prop set on the surface View; the Modal itself takes visible, transparent and onRequestClose. The heading Text gets tone="muted" and size="sm" only: `element: p` is web and Lit only, since rn Text has no element prop. Pressable has no key events, so there are no arrow keys, no Home/End and no roving tabindex; each row is its own accessibility focus stop reached by swipe, and Enter/Space are the platform''s own activation.'
    swiftui:
      element: confirmationDialog
      props: [.confirmationDialog, Button, role=destructive, role=cancel, titleVisibility]
      notes: '`.confirmationDialog(title, isPresented:, titleVisibility: .visible)` with one `Button` per action (`destructive` via `role: .destructive`, cancel via `role: .cancel` from copy) — the system action sheet is the pattern users expect and VoiceOver handles it natively; the doc''s surface bindings are no-ops here (the gallery notes it), `description` becomes the message. `onAction` with the action id, `onClose` on dismissal.'
  behavior:
    # Authored scenarios; the parser adds renders/accessible-name/escape ones from the schema.
    # Every scenario states its own `actions`; the Default story is open, with the photo-actions example's args.
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

Opening presents the list with focus on the first enabled action; arrow keys move between actions, Enter or Space chooses and fires `onAction(id)`, Escape, the scrim, the Cancel row, or a drag close it with `onClose`. Disabled actions are shown, skipped by arrow navigation, and announced as disabled. On wide screens the sheet becomes a Menu anchored to the opener: same actions, same events, no Cancel row (clicking outside closes). Focus returns to the opener on close in both presentations. `open` is controlled only; there is no uncontrolled mode. On phones the sheet has BottomSheet's handle and header, and the drag-to-dismiss gesture lives on them (the same 25% / 1.5 px/ms rule, the same `dragSlop`): a press on the header or handle becomes a drag only once it moves past `dragSlop`, so a tap is not a drag and nothing fires. After a dismissing release the sheet holds the released offset until the consumer's next render, as the `exit` binding describes. When `open` becomes false, focus returns to the opener at the start of the exit transition and the FocusScope is inactive from that moment (`active` follows `open`), so a mounted scope never pulls focus back during the exit. The sheet sizes to its content up to BottomSheet's `height: content` cap (90% of the viewport) and the list scrolls inside it. In the sheet, the FocusScope traps Tab between the menu's single tab stop and the Cancel row (with `dismissible` false there is no Cancel row, so Tab stays on the menu). The `overlay.dismiss` values are the shared category vocabulary; the event reports its own reasons: `close-button` is the Cancel row, reported as `cancel`, and `swipe` is the drag, reported as `drag`.

Above the breakpoint it renders Menu through Menu's `anchor`, set to the element that was focused when `open` became true, and maps Menu's close reasons to its own: `escape` → escape, `outside`, `tab-out` and `focus-out` → scrim, `action` → nothing. A close that accompanies a chosen action never fires `onClose` — `onAction` is the only event for a choice. Menu guarantees the order: `onOpenChange(false, 'action')` fires synchronously before `onAction`, in the same task. So ActionSheet needs no delay: the `action` reason (or `onAction`, whichever it sees first) marks the current opening as chosen, and every mapped close after it, including a later `focus-out`, is dropped until `open` next becomes true. Menu events ActionSheet does not have are not re-emitted. Only overridable shared bindings are forwarded, and only when the caller set that override (otherwise Menu keeps its own tokens, including its own layer): shadow, radius, itemPaddingBlock, itemPaddingInline, itemGap, fontFamily, fontSize, lineHeight, layer and enter go to Menu's `overrides`, plus `divider` → Menu's `separator`; the danger group gets a Menu separator under the same rule as the sheet's divider. Bindings locked by an accessibility guarantee (surface, itemHover, itemColor, itemDangerColor, minTarget, focusRing, focusRingWidth) are never forwarded. The rest (scrim, header, handle, title, dividerWidth, exit) have no effect there.

The Default story is open, with the photo-actions example's args. Stories that need the sheet open render through a wrapper that owns `open` (starting true) and sets it false on `onAction` and `onClose`, acting as the consumer; the wrapper first calls the story's own `onAction`/`onClose` args, and renders no trigger (there is no copy key for one). Example stories start from blank args, never from Default's or meta args: a prop absent from `given` takes its default, an example with no `open` in `given` renders closed, and a `given` with `open: true` renders through the wrapper. The authored behavior scenarios describe the sheet presentation; the wide Menu presentation is Menu's own contract. The accessible name (`heading`, else `copy.defaultLabel`) is on the `role="menu"` list, and the `<dialog>` carries the same `aria-label`; the Cancel row's name is its Button's label.

## Content guidelines

Actions are verbs, one or two words, sentence case ("Rename", "Move to folder"). The title is the item's name, not "Options". Danger actions say what they destroy ("Delete photo"). Cancel is "Cancel".

## Accessibility

The list is a `menu` of `menuitem`s with an accessible name (WCAG 4.1.2, APG menu button). One tab stop; arrows move (roving-tabindex, arrow-navigation). Escape closes and focus returns to the opener (2.4.3). On phones the sheet is modal (inert background, focus trap) and every row meets 44px. The drag gesture is additive to Cancel and Escape (2.5.1). Danger rows are distinguished by color *and* position and an icon when given, never color alone (1.4.1). Contrast is checked for normal, danger and muted text on the surface and for the hover row.

## Platform notes

### Web
Below the breakpoint, reuse BottomSheet's `<dialog>` mechanics with `height: content`, a `<p>` title (muted, small), `<div role="menu" aria-label={heading ?? copy.defaultLabel}>` of `<button role="menuitem" tabindex={roving}>` rows (icon via `<Icon>`, label, `aria-disabled` for disabled), a divider before the danger group, and a separate Cancel `<Button variant="secondary">` under a divider. Above the breakpoint, render `<Menu>` with the same `actions` and `anchor` set to a ref of `document.activeElement` at open time.

### Lit
`<ds-action-sheet open heading="Photo.jpg" .actions=${[...]}>`; shadow `<dialog>` or `<ds-menu>` by `matchMedia`; composed `action` and `close`.

### React Native
`Modal` sheet with `View accessibilityRole="menu"` of `Pressable accessibilityRole="menuitem"` rows (`accessibilityState={{ disabled }}`), a divider and a Cancel `Button`; drag-to-dismiss on the header via `PanResponder`, with the decorative handle pill above the heading; `onRequestClose` → `onClose('escape')`. The sheet is the only presentation on native — see the platform note.

## Related

BottomSheet, Menu, Button, AlertDialog.
