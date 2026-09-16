# Generate: AlertDialog for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/AlertDialog.swift` declaring `public struct AlertDialog: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/AlertDialogBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+AlertDialog.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("AlertDialog") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("AlertDialog")` on the root and `"AlertDialog.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for swiftui; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: each closure takes exactly the listed arguments, in order, and `reason` is a nested `enum` of its reasons. A `cancelable` closure returns `Bool`, and `false` skips the default action. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: every pair becomes a `Binding<T>?` parameter plus the default's initial value, with `@State` holding the uncontrolled value; the closure fires in both modes, and a bound view shows the new state only once the binding changes.
- **Parts and slots**: each slot is a `@ViewBuilder` parameter under its resolved label only (`content` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides:` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (`.onHover`, `@FocusState`, or the view's own state), with the token listed for each `by` value; write `computed` as the given multiplication of `theme` values. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` applies when those props are set.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this picks among the conventions' overlay forms.
- **Copy**: interpolate only the listed `params` and props; select plural forms through `String(localized:)` with the entry's forms as its plural variations; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example becomes a `#Preview` with the name shown and exactly its `given`.
- **Lifecycle**: a deprecated parameter, closure, case or view keeps working, is marked `@available(*, deprecated, message:)` naming `use`, and warns once under `#if DEBUG` naming `use`.
- A `type: integer` prop is an `Int`: whole numbers only.

## Component schema

```yaml
component:
  name: AlertDialog
  category: overlay
  status: review
  apg: alertdialog
  anatomy:
  - scrim
  - surface
  - focusScope
  - icon
  - heading
  - description
  - footer
  - cancelButton
  - confirmButton
  composition:
    focusScope: FocusScope
    icon:
      component: Icon
      forwards:
        iconSize: size
    heading: Heading
    description: Text
    footer:
      component: Stack
      forwards:
        footerGap: gap
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
      description: The question or statement, as a level-2 Heading and the accessible
        name ("Delete 3 files?").
      a11y: aria-labelledby the heading; native accessibilityLabel on the modal content.
    description:
      type: string
      required: true
      description: 'What will happen and whether it can be undone, in one or two sentences.
        Required: a decision without consequences stated is not a decision.'
      a11y: aria-describedby; announced together with the title when the dialog opens.
    tone:
      type: enum
      enumRef: tone
      values:
      - danger
      - warning
      - info
      default: danger
      description: The nature of the decision. Sets the status icon and the confirm
        button's variant (danger → danger Button; warning and info → primary).
    confirmLabel:
      type: string
      required: true
      description: The confirming action, restating it ("Delete files"). Never "OK"
        or "Yes".
    cancelLabel:
      type: string
      description: The declining action. Defaults to `copy.cancelLabel`.
    confirmDisabled:
      type: boolean
      default: false
      description: Blocks confirm while a precondition is unmet (a typed confirmation,
        a loading state). Cancel always works. Forwarded to the confirm Button's own
        `disabled` — the Button decides what that means per platform (unfocusable
        on web and Lit, focusable-but-inert on native); AlertDialog neither restyles
        it nor substitutes `aria-disabled`.
  events:
    onConfirm:
      description: The user chose the confirming action. The consumer performs it
        and closes.
      platforms:
        web: onConfirm
        lit: confirm
        rn: onConfirm
        swiftui: onConfirm
      fires:
      - user
      timing:
        phase: request
    onCancel:
      description: The user declined, by the cancel button or Escape. Fired with reason
        `cancel` or `escape`. A scrim click does nothing.
      platforms:
        web: onCancel
        lit: cancel
        rn: onCancel
        swiftui: onCancel
      payload:
      - name: reason
        type: enum
        values:
        - cancel
        - escape
      reasons:
        cancel: the cancel button was activated
        escape: Escape pressed while open
      fires:
      - user
      timing:
        phase: request
  keyboard:
  - keys:
    - Escape
    action: Cancels (onCancel with reason escape).
    from: inside
    expect: closes
  - keys:
    - Tab
    action: From Confirm (the last button) wraps to Cancel (the first).
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Shift+Tab
    action: From Cancel wraps to Confirm.
    from: first
    expect: focus-wraps-to-last
  - keys:
    - Enter
    action: Activates the focused button. Initial focus is on Cancel so Enter never
      confirms by momentum.
    when: focus on a button
    from: first
    expect: closes
  styles:
    scrim:
      token: color.overlay.scrim
      part: scrim
      locked: false
    surface:
      token: color.overlay.surface
      part: surface
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.lg
      locked: false
    inset:
      token: layout.inset.lg
      locked: false
    partGap:
      token: layout.gap.loose
      description: 'Between the icon-and-text row and the footer: the icon sits inline
        with the text block, so this measures from that whole row.'
      locked: false
    textGap:
      token: layout.gap.tight
      description: Between title and description.
      locked: false
    iconGap:
      token: layout.gap.normal
      part: icon
      description: Between the icon and the text block.
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: Forwarded to the footer Stack as `overrides.gap`.
      locked: false
    iconSize:
      token: font.size.lg
      part: icon
      description: Forwarded to the tone Icon as `overrides.size`.
      locked: false
    icon:
      token: color.status.{tone}.icon
      part: icon
      locked: true
    width:
      token: layout.maxWidth.prose
      description: Always the small size; an alert dialog with more content is a Dialog.
      locked: false
    layer:
      token: layer.dialog
      locked: false
    enter:
      token: motion.duration.base
      locked: false
    exit:
      token: motion.duration.fast
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    cancelLabel: Cancel
  overlay:
    layer: modal
    open: open
    closeEvent: onCancel
    dismiss:
    - escape
    - close-button
    modal: true
  a11y:
    role: alertdialog
    requires:
    - accessible-name
    - focus-trap
    - focus-restore
    - escape-dismiss
    - inert-background
    - scroll-lock
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-24px
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
    - foreground: color.status.{tone}.icon
      background: color.overlay.surface
      level: AA
      nonText: true
  platforms:
    web:
      element: dialog
      attributes:
      - role=alertdialog
      - aria-modal
      - aria-labelledby
      - aria-describedby
      notes: 'The same native <dialog> mechanics as Dialog (showModal, cancel event,
        portal, scroll lock, focus restore) with role="alertdialog" set explicitly.
        No close button; the scrim click is ignored. Initial focus on the cancel button.
        Composes Dialog''s internals rather than Dialog itself, because the footer
        is fixed. `container?: HTMLElement` (default document.body) is the portal
        target — a platform prop every portaled overlay accepts, not a schema prop.
        The icon is decorative and `aria-hidden`: the tone is already carried by the
        heading and description, so labelling it would only repeat them. Tab and Shift+Tab
        wrap because FocusScope traps and wraps; AlertDialog adds no key handler of
        its own for them.'
    lit:
      tag: ds-alert-dialog
      reflect:
      - open
      - tone
      notes: 'Same shadow <dialog> approach as ds-dialog with role="alertdialog".
        Dispatches composed `confirm` (no detail) and `cancel` (detail { reason })
        — only the cancel event has a reason. No slots: title, description and labels
        are properties, so the element is fully described by attributes. The shadow
        <dialog> is named with aria-label={heading} and described with aria-description.
        An idref would resolve here, since the heading shares the shadow root, but
        the package names every Lit overlay with the literal text so the name does
        not depend on where the heading is rendered. Cancel is `<ds-button variant="secondary">`
        and the footer `<ds-stack>` is `justify="end"`, as on web.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - accessibilityViewIsModal
      notes: 'Native Modal as in Dialog; the scrim Pressable is absent (no scrim dismissal)
        — the scrim is a plain View. onRequestClose → onCancel reason escape. Initial
        accessibility focus on the title so the question is read, then the buttons
        follow in order Cancel, Confirm. iOS also offers Alert.alert() natively; this
        component does not use it, so the look matches the theme and the buttons follow
        the system''s order and variants. The surface uses the RN >= 0.74 `role="alertdialog"`
        prop with accessibilityViewIsModal. `confirmDisabled` maps to Button''s `disabled`,
        which on native is accessibilityState.disabled plus a press guard (the control
        stays focusable), per Button''s own contract. Scroll lock has no native meaning
        — a Modal has no page behind it to scroll — and is not implemented, as in
        Dialog. Heading has no levels on native: `level` only sets the visual size
        and the heading trait comes from Heading''s own accessibilityRole="header".
        Heading forwards no ref, so initial accessibility focus targets the View wrapping
        the heading rather than its Text node; the announcement is the same.'
    swiftui:
      element: sheet
      props:
      - .sheet
      - .popover
      - .interactiveDismissDisabled
      - .accessibilityAddTraits=isModal
      - AccessibilityNotification
      - Button
      notes: 'Dialog''s presentation with `.interactiveDismissDisabled()` always (an
        alert dialog never dismisses on scrim), the heading and body announced on
        open, initial focus on the cancel `Button` (or confirm when `destructive`
        is false, per the doc), Escape = cancel. Not `.alert()`: the system alert
        cannot take the theme or a body view. `confirmLabel`/`cancelLabel` from copy.'
  behavior:
  - name: confirm-button-fires-on-confirm
    description: The confirming action reports; the consumer performs it and closes.
    given:
      open: true
    when:
      click: confirmButton
    then:
    - event: onConfirm
  - name: cancel-button-fires-on-cancel
    given:
      open: true
    when:
      click: cancelButton
    then:
    - event: onCancel
  - name: focus-starts-on-the-cancel-button
    description: The least-destructive action is focused first, so Enter pressed reflexively
      cancels rather than destroys (WCAG 3.3.4).
    given:
      open: true
    then:
    - focused: cancelButton
    platforms:
    - web
    - lit
  - name: a-scrim-click-does-nothing
    description: An alert dialog never dismisses on a scrim click, so a stray tap
      cannot answer a decision.
    given:
      open: true
    when:
      click: scrim
    then:
    - event: onCancel
      fired: false
    - event: onConfirm
      fired: false
  - name: confirm-disabled-does-not-confirm
    description: confirmDisabled blocks the confirming action while a precondition
      is unmet.
    given:
      open: true
      confirmDisabled: true
    when:
      click: confirmButton
    then:
    - event: onConfirm
      fired: false
  - name: cancel-works-while-confirm-is-disabled
    description: '"Cancel always works": the safe way out is never blocked by confirmDisabled.'
    given:
      open: true
      confirmDisabled: true
    when:
      click: cancelButton
    then:
    - event: onCancel
  - name: escape-cancels-while-confirm-is-disabled
    description: Escape is the keyboard's way out and is not blocked by confirmDisabled
      either (keyboard rule 1).
    given:
      open: true
      confirmDisabled: true
    when:
      key: Escape
    then:
    - event: onCancel
    platforms:
    - web
    - lit
  - name: the-cancel-button-is-named-from-copy
    description: With no cancelLabel the declining action falls back to copy.cancelLabel.
    given:
      open: true
    then:
    - copy: cancelLabel
  examples:
  - name: delete-files
    description: The destructive confirm this component exists for, counting what
      will go.
    given:
      open: true
      tone: danger
      heading: Delete 3 files?
      description: They will be removed from all shared folders. This cannot be undone.
      confirmLabel: Delete files
  - name: leave-without-saving
    description: A consequential but recoverable decision, where the declining action
      is the one to name.
    given:
      open: true
      tone: warning
      heading: Leave without saving?
      description: Your changes to this draft will be lost.
      confirmLabel: Leave
      cancelLabel: Keep editing
  - name: typed-confirmation
    description: A decision gated on a precondition, with Confirm inert until it is
      met.
    given:
      open: true
      tone: danger
      heading: Cancel your subscription?
      description: Your workspace stays read-only after the current billing period
        ends.
      confirmLabel: Cancel subscription
      confirmDisabled: true
  - name: publish-to-the-team
    description: A choice with no downside that still needs an answer.
    given:
      open: true
      tone: info
      heading: Publish to the team?
      description: Everyone in the workspace will be able to see this page.
      confirmLabel: Publish
```

## Events

- `onConfirm`: emit `onConfirm`
  - fires on: user
  - timing: request
- `onCancel`: emit `onCancel`
  - payload, positional, in this order: `reason: 'cancel' | 'escape'`
  - reasons: `cancel` (the cancel button was activated); `escape` (Escape pressed while open)
  - fires on: user
  - timing: request

## Parts and slots

- `scrim`: element
- `surface`: element
- `focusScope`: component `FocusScope`
- `icon`: component `Icon`; forwards `iconSize` → `overrides.size`
- `heading`: component `Heading`
- `description`: component `Text`
- `footer`: component `Stack`; forwards `footerGap` → `overrides.gap`
- `cancelButton`: component `Button`
- `confirmButton`: component `Button`

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `iconGap`: token `layout.gap.normal`; part `icon`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `iconSize`: token `font.size.lg`; part `icon`
- `icon`: token `color.status.{tone}.icon`; part `icon`; locked

## Form and overlay

```yaml
overlay:
  layer: modal
  open: open
  closeEvent: onCancel
  dismiss:
  - escape
  - close-button
  modal: true
```

`overlay.closeEvent` emits `onCancel`.

## Constants and examples

- example `delete-files`, story `DeleteFiles`: given `open: true`, `tone: "danger"`, `heading: "Delete 3 files?"`, `description: "They will be removed from all shared folders. This cannot be undone."`, `confirmLabel: "Delete files"`; The destructive confirm this component exists for, counting what will go.
- example `leave-without-saving`, story `LeaveWithoutSaving`: given `open: true`, `tone: "warning"`, `heading: "Leave without saving?"`, `description: "Your changes to this draft will be lost."`, `confirmLabel: "Leave"`, `cancelLabel: "Keep editing"`; A consequential but recoverable decision, where the declining action is the one to name.
- example `typed-confirmation`, story `TypedConfirmation`: given `open: true`, `tone: "danger"`, `heading: "Cancel your subscription?"`, `description: "Your workspace stays read-only after the current billing period ends."`, `confirmLabel: "Cancel subscription"`, `confirmDisabled: true`; A decision gated on a precondition, with Confirm inert until it is met.
- example `publish-to-the-team`, story `PublishToTheTeam`: given `open: true`, `tone: "info"`, `heading: "Publish to the team?"`, `description: "Everyone in the workspace will be able to see this page."`, `confirmLabel: "Publish"`; A choice with no downside that still needs an answer.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `textGap`, `iconGap`, `footerGap`, `iconSize`, `width`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `icon`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: sheet
props:
- .sheet
- .popover
- .interactiveDismissDisabled
- .accessibilityAddTraits=isModal
- AccessibilityNotification
- Button
notes: 'Dialog''s presentation with `.interactiveDismissDisabled()` always (an alert
  dialog never dismisses on scrim), the heading and body announced on open, initial
  focus on the cancel `Button` (or confirm when `destructive` is false, per the doc),
  Escape = cancel. Not `.alert()`: the system alert cannot take the theme or a body
  view. `confirmLabel`/`cancelLabel` from copy.'
```

## Guidance

## Overview

An alert dialog is a Dialog with one job: get a considered yes or no. It looks like a Dialog and behaves like one in every way that keeps people safe, and differs in every way that keeps them from answering by accident — no close button, no scrim dismissal, focus starting on Cancel, the confirming action named after what it does.

## When to use

Use an AlertDialog before an action that destroys data, spends money, sends something that cannot be recalled, or leaves a state the user cannot get back to — and only when undo is not available. Use `tone: danger` for destruction, `warning` for consequential-but-recoverable, `info` for a decision with no downside that still needs a choice (leave the page with unsaved changes? — that is `warning`).

## When not to use

Do not confirm reversible actions; provide undo (a Toast with an action) instead, which is faster and less annoying. Do not use an AlertDialog to show information (Alert or Dialog), to collect input beyond a single typed confirmation (Dialog with a Form), or as a general "are you sure" habit — if a team finds itself adding many, the actions need undo.

## Behavior

Opens like a Dialog: scrim, trapped focus, inert page, locked scroll. Focus lands on the Cancel button. Escape and Cancel fire `onCancel`; Confirm fires `onConfirm`. A scrim click does nothing, so a stray tap cannot dismiss a decision, and there is no close button, so the only ways out are the two named ones. The consumer closes by setting `open` false after handling the event. `confirmDisabled` keeps Confirm inert until a precondition is met, through the composed Button's own `disabled` — unfocusable on web and Lit, focusable-but-inert on native, whichever that Button does on the platform.

## Content guidelines

The title is the question, specific and countable ("Delete 3 files?", "Cancel your subscription?"). The description states the consequence plainly and whether it is permanent ("They will be removed from all shared folders. This cannot be undone."). The confirm label restates the verb ("Delete files"), the cancel label is "Cancel" unless the situation needs "Keep editing". Never "OK", never "Yes/No".

## Accessibility

Role `alertdialog` tells assistive technology this is a decision, and the title and description are announced together on open (WCAG 4.1.2, APG alertdialog). Focus starts on the safe action so Enter pressed reflexively cancels rather than destroys (3.3.4 Error Prevention: reversible, checked or confirmed — this is the "confirmed" leg). Everything else is inherited from Dialog: focus trap with Escape as exit, focus restore, inert background, contrast on the overlay surface in both modes, reduced motion.

## Platform notes

### Web
Native `<dialog role="alertdialog" aria-modal="true" aria-labelledby aria-describedby>` through a portal, opened with `showModal()`. Handle `cancel` (preventDefault, then `onCancel('escape')`). Do not attach a scrim click handler. Footer is a horizontal Stack, `gap: tight`, Cancel then Confirm in DOM order (Cancel first so it is focused first; visually the primary sits at the end via `justify: end`). Cancel is `variant="secondary"` on every platform; Confirm's variant follows `tone`. The icon is `<Icon name={tone}>` colored by the tone token, `aria-hidden`.

### Lit
`<ds-alert-dialog open tone="danger" heading="Delete 3 files?" description="…" confirm-label="Delete files">`. Shadow `<dialog>` with `showModal()`; composed `confirm` and `cancel` events. Renders `<ds-heading>`, `<ds-text>`, `<ds-icon>`, `<ds-stack>` and two `<ds-button>`s.

### React Native
`Modal` as in Dialog, no scrim `Pressable`. `onRequestClose` → `onCancel('escape')`. Set accessibility focus to the title after the enter animation; Cancel precedes Confirm in the accessibility order. Buttons are the system `Button` (`secondary` for cancel; `danger` or `primary` for confirm by tone).

## Related

Dialog, Toast, Button, Alert.

## Behavior scenarios (12)

One test per scenario, in this order.

```yaml
- name: confirm-button-fires-on-confirm
  description: The confirming action reports; the consumer performs it and closes.
  given:
    open: true
  when:
    click: confirmButton
  then:
  - event: onConfirm
- name: cancel-button-fires-on-cancel
  given:
    open: true
  when:
    click: cancelButton
  then:
  - event: onCancel
- name: a-scrim-click-does-nothing
  description: An alert dialog never dismisses on a scrim click, so a stray tap cannot
    answer a decision.
  given:
    open: true
  when:
    click: scrim
  then:
  - event: onCancel
    fired: false
  - event: onConfirm
    fired: false
- name: confirm-disabled-does-not-confirm
  description: confirmDisabled blocks the confirming action while a precondition is
    unmet.
  given:
    open: true
    confirmDisabled: true
  when:
    click: confirmButton
  then:
  - event: onConfirm
    fired: false
- name: cancel-works-while-confirm-is-disabled
  description: '"Cancel always works": the safe way out is never blocked by confirmDisabled.'
  given:
    open: true
    confirmDisabled: true
  when:
    click: cancelButton
  then:
  - event: onCancel
- name: the-cancel-button-is-named-from-copy
  description: With no cancelLabel the declining action falls back to copy.cancelLabel.
  given:
    open: true
  then:
  - copy: cancelLabel
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: renders-tone-warning
  given:
    tone: warning
  then:
  - renders: true
  derived: true
- name: renders-tone-info
  given:
    tone: info
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: escape-fires-on-cancel
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onCancel
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```
