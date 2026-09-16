---
title: Dialog
description: A modal window over the page for a task that must be finished or abandoned before returning — focus trapped, background inert, closed by Escape, focus restored to the opener.
component:
  name: Dialog
  category: overlay
  status: review
  apg: dialog-modal
  anatomy: [scrim, surface, focusScope, header, heading, description, body, footer, closeButton]
  composition:
    focusScope: FocusScope
    heading: { component: Heading, props: { level: '2' } }
    description: Text
    closeButton: { component: Button, props: { variant: ghost, size: sm, iconOnly: true } }
    body: { component: Box, forwards: { inset: paddingBlock } }
    footer: { component: Stack, props: { direction: horizontal, justify: end }, forwards: { footerGap: gap } }
  props:
    open:
      type: boolean
      required: true
      description: 'Controlled only — there is no uncontrolled mode and no initial-state prop; the consumer owns `open` and the dialog never closes itself, it requests changes through `onClose`.'
      controls:
        event: onClose
        state: open
    heading:
      type: string
      required: true
      description: The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project").
      a11y: aria-labelledby the heading; native accessibilityLabel on the Modal content.
    description:
      type: string
      description: One sentence under the title explaining the task or consequence. Becomes the accessible description.
      a11y: aria-describedby.
    children:
      type: content
      required: true
      description: The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put.
    footer:
      type: content
      description: The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body.
    hideHeading:
      type: boolean
      default: false
      description: 'Visually hide the heading while it remains the accessible name (BottomSheet forwards its own hideHeading here above the breakpoint).'
    size:
      type: enum
      enumRef: size
      values: [sm, md, lg]
      default: md
      description: Surface width on wide viewports. Full-width below the content measure on every size.
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the close button and a scrim click all request close. Set false for a dialog that must be answered (then provide the answers in the footer): the close button is not rendered and the scrim does nothing; Escape still fires `onClose` with reason `escape` so the consumer can decide.'
    initialFocus:
      type: enum
      values: [first, title, close]
      default: first
      description: 'Where focus lands on open: the first focusable control (default), the title (for long or reading dialogs), or the close button. `first` looks in the body, then the footer, then the close button, then the heading (tabindex -1); `close` with no close button rendered (not dismissible) takes the same order without the close button.'
      a11y: 'Focus must move into the dialog on open and never rest on the scrim or the page behind.'
  events:
    onClose:
      description: 'Fired when the user requests to close, with a reason: `escape`, `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or not).'
      platforms: { web: onClose, lit: close, rn: onClose, swiftui: onClose }
      payload:
        - { name: reason, type: enum, values: [escape, close-button, scrim, action] }
      reasons:
        escape: Escape pressed while open
        close-button: the close button was activated
        scrim: the scrim was clicked
        action: 'something inside the dialog asked to close — a footer action reusing this same handler, or on Lit a slotted form submitted with method="dialog" (a light-DOM form has no <dialog> ancestor, so a host `submit` listener catches a form or submitter whose method is `dialog`, prevents default and fires `close` with `action`). Dialog never raises it on its own; the three dismiss affordances have their own reasons.'
      fires: [user]
      timing: { phase: request }
    onOpened:
      description: 'Fired after the open transition ends and focus has moved in. When there is no transition to wait for (reduced motion, or a zero computed duration), it fires on the next frame after focus moves in. Use to start work that needs the dialog visible.'
      platforms: { web: onOpened, lit: opened, rn: onOpened, swiftui: onOpened }
      timing: { phase: after-change }
  keyboard:
    - { keys: [Escape], action: Requests close with reason escape (even when not dismissible)., from: inside, expect: closes }
    - { keys: [Tab], action: Moves to the next focusable element inside the dialog., from: first, expect: focus-next }
    - { keys: [Tab], action: 'From the last element, wraps to the first.', from: last, expect: focus-wraps-to-first }
    - { keys: [Shift+Tab], action: 'From the first element, wraps to the last.', from: first, expect: focus-wraps-to-last }
  styles:
    scrim: { token: color.overlay.scrim, part: scrim }
    surface: { token: color.overlay.surface, part: surface }
    border: { token: color.border, description: 'Hairline; the only edge in a flat theme.' }
    borderWidth: { token: border.width.thin }
    shadow: { token: shadow.overlay }
    radius: { token: radius.lg }
    inset: { token: layout.inset.lg, description: 'Padding of header, body and footer. The header and the footer wrapper apply it themselves; the body Box receives it as both `overrides.paddingBlock` and `overrides.paddingInline`.' }
    partGap: { token: layout.gap.loose, description: 'Gap between header, body and footer.' }
    headerGap: { token: layout.gap.normal, part: header, description: Between title/description and the close button. }
    footerGap: { token: layout.gap.tight, part: footer, description: 'Between footer actions; forwarded to the footer Stack as `overrides.gap`. On web and Lit the CSS hook reaches the Stack too: the footer wrapper''s stylesheet sets the Stack''s own `--ds-stack-gap` hook on the Stack element to `--ds-dialog-footer-gap`, so either route changes the gap. The footer row is end-aligned (Form''s action-row rule), unlike Card''s start-aligned footer.' }
    descriptionGap: { token: layout.gap.tight, part: header, description: 'Between the heading and the description: the flex gap of the titles group, a Dialog-owned element inside the header that wraps heading and description. The group is not an anatomy part and carries no data-part or testID.' }
    widthSm: { token: layout.maxWidth.prose, description: 'Surface width for size sm.' }
    widthMd: { token: layout.maxWidth.content, computed: { times: 0.75 }, description: 'Surface width for size md: layout.maxWidth.content × 0.75, not a new token. An override replaces the base; the × 0.75 stays in the rule.' }
    widthLg: { token: layout.maxWidth.content, description: 'Surface width for size lg.' }
    layer: { token: layer.dialog, description: 'Kept as the hook, but it has no effect inside the browser top layer or a native Modal window; it applies to a non-top-layer fallback (position: fixed) only.' }
    enter: { token: motion.duration.base, description: 'Scrim fade and surface fade-and-rise (translateY of space.2), motion.easing.standard; instant under reduced motion.' }
    exit: { token: motion.duration.fast, description: 'With motion.easing.exit; the scrim fades out with the same duration and easing as the surface.' }
    focusRing: { token: color.border.focus, part: heading, description: 'The ring on the heading when it holds focus (tabindex -1), drawn by the Dialog-owned heading wrapper with `:has(:focus-visible)` — Heading has no focus style of its own.' }
    focusRingWidth: { token: border.width.focus, part: heading }
  copy:
    closeLabel: Close
  overlay:
    layer: modal
    open: open
    closeEvent: onClose
    dismiss: [escape, scrim, close-button]
    modal: true
  a11y:
    role: dialog
    requires: [accessible-name, focus-trap, focus-restore, escape-dismiss, inert-background, scroll-lock, keyboard-operable, focus-visible, contrast-aa, reduced-motion, target-24px]
    requiresOn:
      scroll-lock: [web, lit, swiftui]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
      - { foreground: color.link, background: color.overlay.surface, level: AA }
      - { foreground: color.action.ghost.foreground, background: color.overlay.surface, level: AA }
  platforms:
    web:
      element: dialog
      attributes: [aria-modal, aria-labelledby, aria-describedby]
      notes: 'A native <dialog> opened with showModal(), which gives the top layer, Escape (cancel event → onClose reason escape, preventDefault always, since the consumer owns `open`), and background inertness for free. Where the browser fires a non-cancelable `cancel` (Chromium without user activation) and closes the native dialog anyway, still report `escape`, then call showModal() again and move focus back in per `initialFocus` if the consumer has not set `open` false. Rendered through a portal into document.body. The <dialog> fills the viewport with a transparent ::backdrop; the scrim is a real element inside it (`data-part="scrim"`, behind the surface, fading with the surface), and a click whose target is that element is the scrim click. Heading, Button and Stack write their own data-part, so the heading, closeButton and footer parts are Dialog-owned wrapper elements around those components (the heading wrapper does the visual hiding for `hideHeading` and draws the focus ring); Box and Text keep a passed data-part, so body and description carry it themselves. The footer wrapper is not rendered when there is no footer. The ref resolves to the <dialog> element, null while closed. Focus trap: showModal() traps by inertness; Tab wrap is implemented explicitly because the browser lets Tab leave to the URL bar. Body scroll locked with overflow: hidden on <html> while open, compensating for scrollbar width via scrollbar-gutter. Focus restore to document.activeElement at open time. `container?: HTMLElement` (default document.body) is the portal target — a platform prop every portaled overlay accepts, not a schema prop. FocusScope has no autoFocus value for `title` or `close`, so Dialog sets it to `none` and places initial focus itself while FocusScope keeps ownership of capturing and restoring the opener. `initialFocus: close` on a non-dismissible dialog has no close button to land on and falls back in the `initialFocus` description''s order. The heading takes `tabindex="-1"` for `initialFocus: title` and keeps it when `hideHeading` is set — a visually hidden heading is still a focus target and still announced.'
    lit:
      tag: ds-dialog
      reflect: [open, size, { prop: dismissible, attribute: no-dismiss }, initial-focus]
      notes: 'Wraps a native <dialog> in the shadow root; the top layer works from inside shadow DOM. `open` is a reflected property the consumer sets; the element calls showModal()/close() in updated(). `close` is a composed CustomEvent with detail { reason }; `opened` likewise. Slots: default (body), `footer`. Title and description are properties rendered as <ds-heading level="2"> and <ds-text>. The close button is a <ds-button variant="ghost" size="sm" icon-only> with <ds-icon name="close">. Accessible name: ids do not cross the shadow boundary, so the shadow <dialog> carries aria-label={heading} (and aria-description from the description text) rather than aria-labelledby. The heading happens to share the shadow root, so an idref would resolve — the literal text is still used, so the name does not depend on where the heading is rendered, as in AlertDialog. The scrim, the part wrappers, the non-cancelable `cancel` handling and the ref are as on web: a real scrim element in a full-viewport <dialog> with a transparent ::backdrop, and wrapper elements carrying the heading, closeButton and footer parts. While closed (and not animating out) the shadow root renders nothing — no <dialog> and no element children.'
    rn:
      element: Modal
      props: [visible, transparent, animationType=none, onRequestClose, statusBarTranslucent, accessibilityViewIsModal]
      notes: 'Native Modal with transparent background; the scrim is a full-screen Pressable (accessible={false}) in color.overlay.scrim; the surface is a View with accessibilityViewIsModal so VoiceOver/TalkBack ignore the page behind. onRequestClose (Android back) → onClose reason escape. Focus: AccessibilityInfo.setAccessibilityFocus on the title or first control after the enter animation. Keyboard avoidance with KeyboardAvoidingView so a Form in the body stays visible. Enter/exit animated with Animated (opacity + translateY), skipped under reduce motion. Size maps to maxWidth from the same tokens; on phones the surface is full-width with the gutter as margin. The surface carries the RN >= 0.74 `role="dialog"` prop (as Landmark and Fieldset use `role`), alongside accessibilityViewIsModal; the legacy accessibilityRole union has no dialog value. Scroll lock has no native meaning and is not implemented. `accessibilityViewIsModal` goes on the surface View, not on Modal, which does not accept it. testIDs are the root plus scrim, header, body and footer; heading, description, closeButton and focusScope are reached through their own roles and names and take none, as in AlertDialog. Stack writes its own testID, so the footer testID sits on a wrapping View; the body Box takes its testID directly. iOS has no hardware-Escape hook, so the surface View also handles `onAccessibilityEscape` (the VoiceOver two-finger scrub) as onClose reason escape, even when not dismissible. RN has no visually hidden primitive: with `hideHeading` the Heading is not rendered, the surface''s accessibilityLabel stays the name, and `initialFocus: title` focuses the surface View. The Dialog is rooted in a native Modal and exposes no ref; callers ref their trigger. Native has no descendant walker, so `initialFocus` calls setAccessibilityFocus on the View wrapping the title, the close button or the body, not on a literal first focusable descendant, and there is no visible focus ring on those targets.'
    swiftui:
      element: sheet
      props: [.sheet, .fullScreenCover, .popover, .interactiveDismissDisabled, .presentationBackground, .accessibilityAddTraits=isModal, FocusScope, .onExitCommand]
      notes: 'Presented with `.sheet` on compact width and `.popover` (regular width, iPad) when `size` is not `full`; `size: full` is `.fullScreenCover`. The dialog surface, heading (`Heading`, the `.accessibilityLabel` of the container), body and actions are the package''s own views inside the presentation with `.presentationBackground(color.overlay.surface)` and `.presentationDragIndicator(.hidden)`. `dismissOnScrim: false` → `.interactiveDismissDisabled()`. FocusScope handles initial and return focus; Escape via `.onExitCommand`; VoiceOver''s two-finger scrub triggers the same close through `.accessibilityAction(.escape)`. `onOpened` fires from `.onAppear` of the content.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/escape ones from the schema.
    - name: close-button-fires-on-close
      description: The close button requests close; the dialog never closes itself, the consumer flips `open`.
      given: { open: true }
      when: { click: closeButton }
      then:
        - { event: onClose }
    - name: non-dismissible-still-reports-escape
      description: Escape requests close with reason escape even when not dismissible (keyboard rule 1), because trapping a keyboard user with no way out is never acceptable.
      given: { open: true, dismissible: false }
      when: { key: Escape }
      then:
        - { event: onClose }
      platforms: [web, lit]
    - name: non-dismissible-scrim-click-does-nothing
      description: With `dismissible` false the scrim does nothing, so a stray click cannot abandon the task.
      given: { open: true, dismissible: false }
      when: { click: scrim }
      then:
        - { event: onClose, fired: false }
    - name: initial-focus-lands-on-the-close-button
      description: initialFocus close puts focus on the close button rather than the first body control.
      given: { open: true, initialFocus: close }
      then:
        - { focused: closeButton }
      platforms: [web, lit]
    - name: hidden-heading-is-still-the-accessible-name
      description: hideHeading removes the title from view, not from the accessible name.
      given: { open: true, hideHeading: true }
      then:
        - { name: true }
    - name: closed-dialog-renders-nothing
      description: 'Closed and not animating out, the dialog renders nothing: null on web, an empty shadow root on Lit, no Modal content on rn.'
      given: { open: false }
      then:
        - { renders: false }
  examples:
    - name: rename-project
      description: The short single-field task a dialog is for, with the completing action named after it.
      given: { open: true, heading: 'Rename project', children: 'A labelled text Input holding the current name', footer: 'Rename and Cancel Buttons' }
    - name: invite-people
      description: A small form in the narrow size, where the footer restates the task.
      given: { open: true, heading: 'Invite people', children: 'An email Input and a role Select', footer: 'Send invites and Cancel Buttons', size: sm }
    - name: must-be-answered
      description: A dialog with no way out but its own actions; Escape still reports so the consumer can decide.
      given: { open: true, heading: 'Choose a plan', description: 'You need a plan before you can invite anyone.', children: 'A RadioGroup of plans', footer: 'Continue Button', dismissible: false }
    - name: reading-dialog
      description: A long reading dialog that starts focus on the title so the text is read from the top.
      given: { open: true, heading: 'Terms of service', children: 'Several paragraphs of Text', size: lg, initialFocus: title }
---

A dialog interrupts. It takes the whole screen's attention for one task and gives it back when the task is done or abandoned. Everything about it — the scrim, the trapped focus, the inert page behind, Escape, focus returning to where it was — exists to make that interruption safe and reversible. Anything that does not need the interruption should not be a dialog.

## When to use

Use a Dialog for a short task that must complete before the user continues and needs its own space: rename, create-with-a-few-fields, choose from options with consequences, confirm something reversible with a form attached. Keep it to one screen of content; a dialog that scrolls much is a page. Give it a `heading` that names the task and a `footer` with the completing action first.

## When not to use

Do not use a Dialog for a message that needs no decision (Alert or Toast), for a destructive confirmation (AlertDialog — it asserts and does not dismiss on scrim click), for content that benefits from the page context staying visible (Popover or Disclosure), for navigation menus (Menu), or on a phone for anything the thumb should reach (BottomSheet). Do not open a dialog on page load or without a user action; users cannot tell what interrupted them. Do not nest dialogs.

## Behavior

Setting `open` true renders the dialog in the top layer with the scrim, moves focus in per `initialFocus`, locks page scroll and makes the page behind inert. Tab and Shift+Tab cycle within the dialog. Escape, the close button and a scrim click each call `onClose` with a reason; the dialog does not close itself — the consumer flips `open`, so an unsaved form can ask first. When `dismissible` is false, the close button is not rendered, the scrim does nothing and Escape still reports (the consumer decides), because trapping a keyboard user with no way out is never acceptable. On close, the exit animation runs, scroll and inertness are restored, and focus returns to the element that opened the dialog (or the next focusable element if it is gone). The body scrolls independently when content exceeds the viewport; header and footer are always visible.

The parts nest as: the scrim and a FocusScope side by side, the FocusScope wrapping the surface, and the surface holding the header (the titles group of heading and description, then the close button), the body and the footer. The Default story is open, with the rename-project example's args; stories that need to start open render through a wrapper that owns `open` (starting true) and writes `onClose` back, acting as the consumer.

## Content guidelines

Titles are short verb phrases naming the task ("Rename project", "Invite people"), not questions or "Dialog". The description, if any, is one sentence of consequence or context. Footer actions restate the task ("Rename", "Send invites") with "Cancel" as the secondary — never "OK"/"Yes". The close button's name is `copy.closeLabel`.

## Accessibility

The dialog has role `dialog`, `aria-modal`, an accessible name from the title and a description from `description` (WCAG 4.1.2, APG modal dialog). Focus moves into it on open and is trapped until close (2.4.3, 2.1.2: no keyboard trap *without an exit* — Escape is the exit), then returns to the opener (focus-restore). The page behind is inert to assistive technology and pointer (inert-background). Escape always reports, even for non-dismissible dialogs. Text on the overlay surface meets 4.5:1 in both modes; the build checks body, muted, link and ghost-button text. Motion respects reduced-motion (2.3.3). The close button is at least 24px (2.5.8). Nothing inside relies on hover.

## Platform notes

### Web
Render through a portal into `document.body`: `<dialog aria-labelledby aria-describedby>` containing the surface. Call `showModal()` when `open` becomes true and `close()` when false; listen to `cancel` (Escape) and call `preventDefault()` on it always, reporting through `onClose('escape')` — the consumer owns `open`. Leave `::backdrop` transparent and render the scrim as a real element inside the full-viewport `<dialog>`, styled with the scrim token and `@media (prefers-reduced-motion: no-preference)` transitions. Detect a scrim click as a `click` whose target is the scrim element. Implement Tab wrapping with a keydown handler over the dialog's focusable elements. Lock scroll with a class on `<html>` (`overflow: hidden; scrollbar-gutter: stable`). Store `document.activeElement` on open; on close, focus it if still connected. Size classes set `inline-size` from the width tokens with `max-inline-size: calc(100vw - 2 * var(--layout-gutter))`.

### Lit
`<ds-dialog open heading="Rename project">` with a `<dialog>` in the shadow root; `showModal()` works from a shadow root and the element is placed in the top layer. Because the light-DOM slotted content is not inside the shadow `<dialog>` in the composed tree only visually, the Tab-wrap handler must collect focusable elements from both the shadow root and assigned slot nodes. Dispatch composed `close` and `opened`. Reflect `open` so `ds-dialog[open]` can be styled. Compose `<ds-heading>`, `<ds-text>`, `<ds-button>`, `<ds-icon>`, `<ds-box>`, `<ds-stack>`.

### React Native
`Modal` with `transparent`, `animationType="none"` (the component animates itself), `onRequestClose` → `onClose('escape')`, `statusBarTranslucent`. Inside: an `Animated.View` scrim (`Pressable` for the scrim click, `accessible={false}`), and the surface `View` with `accessibilityViewIsModal`, `accessibilityLabel={heading}`, `accessibilityHint={description}`. Wrap the body in `ScrollView` inside `KeyboardAvoidingView`. After the enter animation, `setAccessibilityFocus` on the title (or first control). Size uses `maxWidth` from the width tokens and `marginHorizontal: layout.gutter`; below the content measure the surface is full width. The close button is the system `Button` with `leadingIcon` an `Icon name="close"`.

## Related

AlertDialog, BottomSheet, Toast, Form, Button, Heading.
