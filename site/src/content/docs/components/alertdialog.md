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
    focusScope: FocusScope
    icon: { component: Icon, forwards: { iconSize: size } }
    heading: Heading
    description: Text
    footer: { component: Stack, forwards: { footerGap: gap } }
    cancelButton: Button
    confirmButton: Button
  props:
    open:
      type: boolean
      required: true
      description: Controlled visibility, as in Dialog.
    heading:
      type: string
      required: true
      description: 'The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?").'
      a11y: 'aria-labelledby the heading; native accessibilityLabel on the modal content.'
    description:
      type: string
      required: true
      description: 'What will happen and whether it can be undone, in one or two sentences. Required: a decision without consequences stated is not a decision.'
      a11y: aria-describedby; announced together with the title when the dialog opens.
    tone:
      type: enum
      enumRef: tone
      values: [danger, warning, info]
      default: danger
      description: The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger Button; warning and info → primary).
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
      description: Blocks confirm while a precondition is unmet (a typed confirmation, a loading state). Cancel always works.
  events:
    onConfirm:
      description: The user chose the confirming action. The consumer performs it and closes.
      platforms: { web: onConfirm, lit: confirm, rn: onConfirm, swiftui: onConfirm }
      fires: [user]
      timing: { phase: request }
    onCancel:
      description: 'The user declined, by the cancel button or Escape. Fired with reason `cancel` or `escape`. A scrim click does nothing.'
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
    partGap: { token: layout.gap.loose, description: Between the text block and the footer. }
    textGap: { token: layout.gap.tight, description: Between title and description. }
    iconGap: { token: layout.gap.normal, part: icon, description: Between the icon and the text block. }
    footerGap: { token: layout.gap.tight, part: footer, description: 'Forwarded to the footer Stack as `overrides.gap`.' }
    iconSize: { token: font.size.lg, part: icon, description: 'Forwarded to the tone Icon as `overrides.size`.' }
    icon: { token: 'color.status.{tone}.icon', part: icon }
    width: { token: layout.maxWidth.prose, description: 'Always the small size; an alert dialog with more content is a Dialog.' }
    layer: { token: layer.dialog }
    enter: { token: motion.duration.base }
    exit: { token: motion.duration.fast }
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
      notes: 'The same native <dialog> mechanics as Dialog (showModal, cancel event, portal, scroll lock, focus restore) with role="alertdialog" set explicitly. No close button; the scrim click is ignored. Initial focus on the cancel button. Composes Dialog''s internals rather than Dialog itself, because the footer is fixed.'
    lit:
      tag: ds-alert-dialog
      reflect: [open, tone]
      notes: 'Same shadow <dialog> approach as ds-dialog with role="alertdialog". Dispatches composed `confirm` and `cancel` (detail { reason }). No slots: title, description and labels are properties, so the element is fully described by attributes. The shadow <dialog> is named with aria-label={heading} and described with aria-description, since ids do not cross the shadow boundary.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose, accessibilityViewIsModal]
      notes: 'Native Modal as in Dialog; the scrim Pressable is absent (no scrim dismissal) — the scrim is a plain View. onRequestClose → onCancel reason escape. Initial accessibility focus on the title so the question is read, then the buttons follow in order Cancel, Confirm. iOS also offers Alert.alert() natively; this component does not use it, so the look matches the theme and the buttons follow the system''s order and variants. The surface uses the RN >= 0.74 `role="alertdialog"` prop with accessibilityViewIsModal. `confirmDisabled` maps to Button''s `disabled`, which on native is accessibilityState.disabled plus a press guard (the control stays focusable), per Button''s own contract.'
    swiftui:
      element: sheet
      props: [.sheet, .popover, .interactiveDismissDisabled, .accessibilityAddTraits=isModal, AccessibilityNotification, Button]
      notes: 'Dialog''s presentation with `.interactiveDismissDisabled()` always (an alert dialog never dismisses on scrim), the heading and body announced on open, initial focus on the cancel `Button` (or confirm when `destructive` is false, per the doc), Escape = cancel. Not `.alert()`: the system alert cannot take the theme or a body view. `confirmLabel`/`cancelLabel` from copy.'
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
      description: With no cancelLabel the declining action falls back to copy.cancelLabel.
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

Opens like a Dialog: scrim, trapped focus, inert page, locked scroll. Focus lands on the Cancel button. Escape and Cancel fire `onCancel`; Confirm fires `onConfirm`. A scrim click does nothing, so a stray tap cannot dismiss a decision, and there is no close button, so the only ways out are the two named ones. The consumer closes by setting `open` false after handling the event. `confirmDisabled` keeps Confirm inert (aria-disabled, still focusable) until a precondition is met.

## Content guidelines

The title is the question, specific and countable ("Delete 3 files?", "Cancel your subscription?"). The description states the consequence plainly and whether it is permanent ("They will be removed from all shared folders. This cannot be undone."). The confirm label restates the verb ("Delete files"), the cancel label is "Cancel" unless the situation needs "Keep editing". Never "OK", never "Yes/No".

## Accessibility

Role `alertdialog` tells assistive technology this is a decision, and the title and description are announced together on open (WCAG 4.1.2, APG alertdialog). Focus starts on the safe action so Enter pressed reflexively cancels rather than destroys (3.3.4 Error Prevention: reversible, checked or confirmed — this is the "confirmed" leg). Everything else is inherited from Dialog: focus trap with Escape as exit, focus restore, inert background, contrast on the overlay surface in both modes, reduced motion.

## Platform notes

### Web
Native `<dialog role="alertdialog" aria-modal="true" aria-labelledby aria-describedby>` through a portal, opened with `showModal()`. Handle `cancel` (preventDefault, then `onCancel('escape')`). Do not attach a scrim click handler. Footer is a horizontal Stack, `gap: tight`, Cancel then Confirm in DOM order (Cancel first so it is focused first; visually the primary sits at the end via `justify: end`). The icon is `<Icon name={tone}>` colored by the tone token.

### Lit
`<ds-alert-dialog open tone="danger" heading="Delete 3 files?" description="…" confirm-label="Delete files">`. Shadow `<dialog>` with `showModal()`; composed `confirm` and `cancel` events. Renders `<ds-heading>`, `<ds-text>`, `<ds-icon>`, `<ds-stack>` and two `<ds-button>`s.

### React Native
`Modal` as in Dialog, no scrim `Pressable`. `onRequestClose` → `onCancel('escape')`. Set accessibility focus to the title after the enter animation; Cancel precedes Confirm in the accessibility order. Buttons are the system `Button` (`secondary` for cancel; `danger` or `primary` for confirm by tone).

## Related

Dialog, Toast, Button, Alert.
