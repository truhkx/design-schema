---
title: AlertDialog
description: A modal that demands a decision — usually about something destructive or irreversible — and refuses to be dismissed by accident.
component:
  name: AlertDialog
  category: overlay
  status: review
  apg: alertdialog
  anatomy: [scrim, surface, focusScope, icon, heading, description, footer, cancelButton, confirmButton]
  composition:
    focusScope: { component: FocusScope, props: { trapped: true, restoreFocus: true } }
    icon: { component: Icon, forwards: { icon: color, iconSize: size } }
    heading: { component: Heading, props: { level: '2' } }
    description: { component: Text, props: { tone: muted } }
    footer: { component: Stack, forwards: { footerGap: gap } }
    cancelButton: { component: Button, props: { variant: secondary, size: md } }
    confirmButton: { component: Button, props: { size: md } }
  props:
    open:
      type: boolean
      required: true
      description: 'Controlled only — there is no uncontrolled mode; the consumer owns `open` and sets it false after handling `onConfirm` or `onCancel`, as in Dialog.'
    heading:
      type: string
      required: true
      description: 'The question or statement, as a level-2 Heading at the size Heading reads from level 2 (no explicit `size`), and the accessible name ("Delete 3 files?").'
      a11y: 'aria-labelledby the heading; native accessibilityLabel on the modal content.'
    description:
      type: string
      required: true
      description: 'What will happen and whether it can be undone, in one or two sentences, rendered as Text `tone="muted"` at Text''s default size (the color.foreground.muted contrast pair). Required: a decision without consequences stated is not a decision.'
      a11y: aria-describedby; announced together with the title when the dialog opens.
    tone:
      type: enum
      enumRef: tone
      values: [danger, warning, info]
      default: danger
      description: The nature of the decision. Sets the status icon (Icon `name` equal to the tone) and the confirm button's variant (danger → danger Button; warning and info → primary). Both buttons are Button size md.
    confirmLabel:
      type: string
      required: true
      description: 'The confirming action, restating it ("Delete files"). Never "OK" or "Yes".'
    cancelLabel:
      type: string
      description: The declining action. Defaults to `copy.cancelLabel`.
    confirmDisabled:
      type: boolean
      default: false
      description: 'Blocks confirm while a precondition is unmet (a typed confirmation, a loading state). Cancel always works. Forwarded to the confirm Button''s own `disabled` — the Button decides what that means per platform, and on every platform it stays focusable-but-inert (aria-disabled plus a click guard on web and Lit, accessibilityState.disabled plus a press guard on native), so Confirm is still the last Tab stop; AlertDialog neither restyles it nor sets aria-disabled itself.'
  events:
    onConfirm:
      description: The user chose the confirming action. The consumer performs it and closes.
      platforms: { web: onConfirm, lit: confirm, rn: onConfirm, swiftui: onConfirm }
      fires: [user]
      timing: { phase: request }
    onCancel:
      description: 'The user declined, by the cancel button or Escape. Fired with reason `cancel` or `escape`. A scrim click does nothing. The `close-button` entry in `overlay.dismiss` is the shared category name for the Cancel button, reported as `cancel`; there is no separate close button.'
      platforms: { web: onCancel, lit: cancel, rn: onCancel, swiftui: onCancel }
      payload:
        - { name: reason, type: enum, values: [cancel, escape] }
      reasons:
        cancel: the cancel button was activated
        escape: Escape pressed while open
      fires: [user]
      timing: { phase: request }
  keyboard:
    - { keys: [Escape], action: Cancels (onCancel with reason escape)., from: inside, expect: closes }
    - { keys: [Tab], action: From Confirm (the last button) wraps to Cancel (the first)., from: last, expect: focus-wraps-to-first }
    - { keys: [Shift+Tab], action: From Cancel wraps to Confirm., from: first, expect: focus-wraps-to-last }
    - { keys: [Enter], action: Activates the focused button. Initial focus is on Cancel so Enter never confirms by momentum., when: focus on a button, from: first, expect: closes }
  styles:
    scrim: { token: color.overlay.scrim, part: scrim }
    surface: { token: color.overlay.surface, part: surface }
    border: { token: color.border }
    borderWidth: { token: border.width.thin }
    shadow: { token: shadow.overlay }
    radius: { token: radius.lg }
    inset: { token: layout.inset.lg }
    partGap: { token: layout.gap.loose, part: surface, description: 'The gap of the surface''s column, between the icon-and-text row and the footer: the icon sits inline with the text block, so this measures from that whole row.' }
    textGap: { token: layout.gap.tight, description: Between title and description. }
    iconGap: { token: layout.gap.normal, part: surface, description: 'Between the icon and the text block — the gap of the row inside the surface that holds both, not a property of the icon element (an icon cannot own a gap).' }
    footerGap: { token: layout.gap.tight, part: footer, description: 'Forwarded to the footer Stack as `overrides.gap`.' }
    iconSize: { token: font.size.lg, part: icon, description: 'Forwarded to the tone Icon as `overrides.size`.' }
    icon: { token: 'color.status.{tone}.icon', part: icon, description: 'Forwarded to the tone Icon as `overrides.color` (Icon''s own color hook wins over any color set on an ancestor), as in Alert and Toast.' }
    width: { token: layout.maxWidth.prose, description: 'Always the small size; an alert dialog with more content is a Dialog. On narrow viewports the surface is min(width, viewport width − 2 × gutter).' }
    gutter: { token: layout.gutter, part: surface, description: 'The least space between the surface and each viewport edge: caps the width at viewport width − 2 × gutter and the height at viewport height − 2 × gutter (on rn, the horizontal margin and the max height).' }
    layer: { token: layer.dialog, description: 'No effect inside the browser top layer or a native Modal window; applies to the non-top-layer fallback (position: fixed).' }
    enter: { token: motion.duration.base, description: 'Scrim fade and surface fade-and-rise (translateY of space.2), with motion.easing.standard; instant under reduced motion.' }
    exit: { token: motion.duration.fast, description: 'Scrim and surface fade out with motion.easing.exit; instant under reduced motion.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  copy:
    cancelLabel: Cancel
  overlay:
    layer: modal
    open: open
    closeEvent: onCancel
    dismiss: [escape, close-button]
    modal: true
  a11y:
    role: alertdialog
    requires: [accessible-name, focus-trap, focus-restore, escape-dismiss, inert-background, scroll-lock, keyboard-operable, focus-visible, contrast-aa, reduced-motion, target-24px]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
      - { foreground: 'color.status.{tone}.icon', background: color.overlay.surface, level: AA, nonText: true }
  platforms:
    web:
      element: dialog
      attributes: [role=alertdialog, aria-modal, aria-labelledby, aria-describedby]
      notes: 'The same native <dialog> mechanics as Dialog (showModal, cancel event, portal, scroll lock, focus restore) with role="alertdialog" set explicitly. No close button; the scrim click is ignored. Initial focus on the cancel button. Composes Dialog''s internals rather than Dialog itself, because the footer is fixed. `container?: HTMLElement` (default document.body) is the portal target — a platform prop every portaled overlay accepts, not a schema prop. The icon is decorative and `aria-hidden`: the tone is already carried by the heading and description, so labelling it would only repeat them. Tab and Shift+Tab wrap because FocusScope traps and wraps; AlertDialog adds no key handler of its own for them. FocusScope takes autoFocus `first`, which is Cancel. The scrim is the <dialog>''s ::backdrop and has no data-part hook; a scrim click lands on the <dialog> element itself (event.target === dialog) and is ignored. Icon, Heading, Text, Stack and the two Buttons write their own data-part, so the icon, heading, description, footer, cancelButton and confirmButton parts each live on an AlertDialog-owned wrapper element carrying `data-part`; the icon-and-text row is an unhooked element inside the surface. `role` is fixed to alertdialog and not accepted from the consumer.'
    lit:
      tag: ds-alert-dialog
      reflect: [open, tone]
      notes: 'Same shadow <dialog> approach as ds-dialog with role="alertdialog". Dispatches composed `confirm` (no detail) and `cancel` (detail { reason }) — only the cancel event has a reason. No slots: heading, description and labels are properties, so the element is fully described by attributes. The shadow <dialog> is named with aria-label={heading} and described with aria-description. An idref would resolve here, since the heading shares the shadow root, but the package names every Lit overlay with the literal text so the name does not depend on where the heading is rendered. Cancel is `<ds-button variant="secondary">` and the footer `<ds-stack>` is `justify="end"`, as on web.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose, accessibilityViewIsModal]
      notes: 'Native Modal as in Dialog; the scrim Pressable is absent (no scrim dismissal) — the scrim is a plain View. onRequestClose → onCancel reason escape. Initial accessibility focus on the title so the question is read, then the buttons follow in order Cancel, Confirm. iOS also offers Alert.alert() natively; this component does not use it, so the look matches the theme and the buttons follow the system''s order and variants. The surface uses the RN >= 0.74 `role="alertdialog"` prop with accessibilityViewIsModal. `confirmDisabled` maps to Button''s `disabled`, which on native is accessibilityState.disabled plus a press guard (the control stays focusable), per Button''s own contract. Scroll lock has no native meaning — a Modal has no page behind it to scroll — and is not implemented, as in Dialog. Heading has no levels on native: `level` only sets the visual size and the heading trait comes from Heading''s own accessibilityRole="header". Heading forwards no ref, so initial accessibility focus targets the View wrapping the heading rather than its Text node; the announcement is the same. FocusScope takes autoFocus `none` (focus is placed on the heading by hand) with no testID of its own. The Modal takes no testID: `testID="AlertDialog"` is on the outermost View inside the Modal and `AlertDialog.surface` on the inner bordered View; the scrim is a plain View with `testID="AlertDialog.scrim"` and no press handler or responder, so a press on it reaches nothing — a Pressable there would break the contract. Icon, Heading, Text, Stack and Button write their own testIDs, so the icon, heading, description, footer, cancelButton and confirmButton parts are each a wrapping View with `testID="AlertDialog.<part>"`. The icon is decorative, as on web: the Icon has no label, and its wrapper sets accessibilityElementsHidden and importantForAccessibility="no-hide-descendants". AlertDialog is rooted in a native Modal and exposes no ref; callers ref their trigger.'
    swiftui:
      element: sheet
      props: [.sheet, .popover, .interactiveDismissDisabled, .accessibilityAddTraits=isModal, AccessibilityNotification, Button]
      notes: 'Dialog''s presentation with `.interactiveDismissDisabled()` always (an alert dialog never dismisses on scrim), the heading and body announced on open, initial focus on the cancel `Button` whatever the tone, Escape = cancel. Not `.alert()`: the system alert cannot take the theme or a body view. `confirmLabel`/`cancelLabel` from copy.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/escape ones from the schema.
    - name: confirm-button-fires-on-confirm
      description: The confirming action reports; the consumer performs it and closes.
      given: { open: true }
      when: { click: confirmButton }
      then:
        - { event: onConfirm }
    - name: cancel-button-fires-on-cancel
      given: { open: true }
      when: { click: cancelButton }
      then:
        - { event: onCancel }
    - name: focus-starts-on-the-cancel-button
      description: The least-destructive action is focused first, so Enter pressed reflexively cancels rather than destroys (WCAG 3.3.4).
      given: { open: true }
      then:
        - { focused: cancelButton }
      platforms: [web, lit]
    - name: a-scrim-click-does-nothing
      description: An alert dialog never dismisses on a scrim click, so a stray tap cannot answer a decision.
      given: { open: true }
      when: { click: scrim }
      then:
        - { event: onCancel, fired: false }
        - { event: onConfirm, fired: false }
    - name: confirm-disabled-does-not-confirm
      description: confirmDisabled blocks the confirming action while a precondition is unmet.
      given: { open: true, confirmDisabled: true }
      when: { click: confirmButton }
      then:
        - { event: onConfirm, fired: false }
    - name: cancel-works-while-confirm-is-disabled
      description: '"Cancel always works": the safe way out is never blocked by confirmDisabled.'
      given: { open: true, confirmDisabled: true }
      when: { click: cancelButton }
      then:
        - { event: onCancel }
    - name: escape-cancels-while-confirm-is-disabled
      description: Escape is the keyboard's way out and is not blocked by confirmDisabled either (keyboard rule 1).
      given: { open: true, confirmDisabled: true }
      when: { key: Escape }
      then:
        - { event: onCancel }
      platforms: [web, lit]
    - name: the-cancel-button-is-named-from-copy
      description: With no cancelLabel the declining action falls back to copy.cancelLabel, read as the text and accessible name of the Button inside the cancelButton part.
      given: { open: true }
      then:
        - { copy: cancelLabel }
  examples:
    - name: delete-files
      description: The destructive confirm this component exists for, counting what will go.
      given: { open: true, tone: danger, heading: 'Delete 3 files?', description: 'They will be removed from all shared folders. This cannot be undone.', confirmLabel: 'Delete files' }
    - name: leave-without-saving
      description: A consequential but recoverable decision, where the declining action is the one to name.
      given: { open: true, tone: warning, heading: 'Leave without saving?', description: 'Your changes to this draft will be lost.', confirmLabel: 'Leave', cancelLabel: 'Keep editing' }
    - name: typed-confirmation
      description: A decision gated on a precondition, with Confirm inert until it is met.
      given: { open: true, tone: danger, heading: 'Cancel your subscription?', description: 'Your workspace stays read-only after the current billing period ends.', confirmLabel: 'Cancel subscription', confirmDisabled: true }
    - name: publish-to-the-team
      description: A choice with no downside that still needs an answer.
      given: { open: true, tone: info, heading: 'Publish to the team?', description: 'Everyone in the workspace will be able to see this page.', confirmLabel: 'Publish' }
---

An alert dialog is a Dialog with one job: get a considered yes or no. It looks like a Dialog and behaves like one in every way that keeps people safe, and differs in every way that keeps them from answering by accident — no close button, no scrim dismissal, focus starting on Cancel, the confirming action named after what it does.

## When to use

Use an AlertDialog before an action that destroys data, spends money, sends something that cannot be recalled, or leaves a state the user cannot get back to — and only when undo is not available. Use `tone: danger` for destruction, `warning` for consequential-but-recoverable, `info` for a decision with no downside that still needs a choice (leave the page with unsaved changes? — that is `warning`).

## When not to use

Do not confirm reversible actions; provide undo (a Toast with an action) instead, which is faster and less annoying. Do not use an AlertDialog to show information (Alert or Dialog), to collect input beyond a single typed confirmation (Dialog with a Form), or as a general "are you sure" habit — if a team finds itself adding many, the actions need undo.

## Behavior

Opens like a Dialog: scrim, trapped focus, inert page, locked scroll. Focus lands on the Cancel button. Escape and Cancel fire `onCancel`; Confirm fires `onConfirm`. A scrim click does nothing, so a stray tap cannot dismiss a decision, and there is no close button, so the only ways out are the two named ones. The consumer closes by setting `open` false after handling the event; stories that need it open render through a wrapper that owns `open` (starting true) and writes the events back, acting as the consumer. The Default story is open, with the delete-files example's args, so the DeleteFiles example story repeating it is expected. `confirmDisabled` keeps Confirm inert until a precondition is met, through the composed Button's own `disabled` — focusable-but-inert on every platform, so it stays in the Tab cycle. The dialog has exactly two focusable children, Cancel and Confirm, and no slot for more; its Keyboard story exercises Tab wrap across those two (the trigger behind is inert), and the three-focusable-children story rule does not apply.

## Content guidelines

The title is the question, specific and countable ("Delete 3 files?", "Cancel your subscription?"). The description states the consequence plainly and whether it is permanent ("They will be removed from all shared folders. This cannot be undone."). The confirm label restates the verb ("Delete files"), the cancel label is "Cancel" unless the situation needs "Keep editing". Never "OK", never "Yes/No".

## Accessibility

Role `alertdialog` tells assistive technology this is a decision, and the title and description are announced together on open (WCAG 4.1.2, APG alertdialog). Focus starts on the safe action so Enter pressed reflexively cancels rather than destroys (3.3.4 Error Prevention: reversible, checked or confirmed — this is the "confirmed" leg). Everything else is inherited from Dialog: focus trap with Escape as exit, focus restore, inert background, contrast on the overlay surface in both modes, reduced motion.

## Platform notes

### Web
Native `<dialog role="alertdialog" aria-modal="true" aria-labelledby aria-describedby>` through a portal, opened with `showModal()`. Handle `cancel` (preventDefault, then `onCancel('escape')`). Do not attach a scrim click handler. Footer is a horizontal Stack, `gap: tight`, Cancel then Confirm in DOM order (Cancel first so it is focused first; visually the primary sits at the end via `justify: end`). Cancel is `variant="secondary"` on every platform; Confirm's variant follows `tone`. The icon is `<Icon name={tone}>` colored by the tone token through Icon's `overrides.color`, `aria-hidden`.

### Lit
`<ds-alert-dialog open tone="danger" heading="Delete 3 files?" description="…" confirm-label="Delete files">`. Shadow `<dialog>` with `showModal()`; composed `confirm` and `cancel` events. Renders `<ds-heading>`, `<ds-text>`, `<ds-icon>`, `<ds-stack>` and two `<ds-button>`s.

### React Native
`Modal` as in Dialog, no scrim `Pressable`. `onRequestClose` → `onCancel('escape')`. Set accessibility focus to the title after the enter animation; Cancel precedes Confirm in the accessibility order. Buttons are the system `Button` (`secondary` for cancel; `danger` or `primary` for confirm by tone).

## Related

Dialog, Toast, Button, Alert.
