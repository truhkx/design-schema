# Generate: AlertDialog as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/AlertDialog.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `AlertDialog.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: AlertDialogVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
- Each event is dispatched as a `CustomEvent` named by its `platforms.lit` value with `bubbles: true, composed: true` so it crosses the shadow boundary.
- Styles live in `static override styles: CSSResult = css\`…\`` and read ONLY token custom properties (`var(--color-…)`), which inherit through the shadow root. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes an attribute selector per enum value, e.g. `:host([variant="primary"]) { background: var(--color-action-primary-background); }`.
- Implement every item in `a11y.requires` inside the shadow DOM using a native element (e.g. a real `<button>`), and use `delegatesFocus: true` in `static override shadowRootOptions: ShadowRootInit` so focusing the host focuses the inner element.
- `accessible-name`: forward `label` to visible text or `aria-label` on the inner element.
- `focus-visible`: style `:focus-visible` on the inner element with `--color-border-focus` / `--border-width-focus`.
- `heading-hierarchy`: render the matching `<h1>`–`<h6>` inside the shadow root based on the level prop.
- Support light and dark by relying on token variables only.
- Form ownership is DOM-tree based: slotted light-DOM children are not owned by a `<form>` inside a shadow root. Follow the platform notes for how ds-form and ds-input cooperate by `name`.
- Events named like native events (`focus`, `blur`) are the native retargeted events — do not dispatch a CustomEvent with the same name.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard`, removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `AlertDialog.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element in the shadow root), only in its `state` (`:hover`, `:focus-visible`, the reflected state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated property, event, value or element keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development (`import.meta.env.DEV`) naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
        a loading state). Cancel always works.
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
      description: Between the text block and the footer.
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
      notes: The same native <dialog> mechanics as Dialog (showModal, cancel event,
        portal, scroll lock, focus restore) with role="alertdialog" set explicitly.
        No close button; the scrim click is ignored. Initial focus on the cancel button.
        Composes Dialog's internals rather than Dialog itself, because the footer
        is fixed.
    lit:
      tag: ds-alert-dialog
      reflect:
      - open
      - tone
      notes: 'Same shadow <dialog> approach as ds-dialog with role="alertdialog".
        Dispatches composed `confirm` and `cancel` (detail { reason }). No slots:
        title, description and labels are properties, so the element is fully described
        by attributes. The shadow <dialog> is named with aria-label={heading} and
        described with aria-description, since ids do not cross the shadow boundary.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - accessibilityViewIsModal
      notes: Native Modal as in Dialog; the scrim Pressable is absent (no scrim dismissal)
        — the scrim is a plain View. onRequestClose → onCancel reason escape. Initial
        accessibility focus on the title so the question is read, then the buttons
        follow in order Cancel, Confirm. iOS also offers Alert.alert() natively; this
        component does not use it, so the look matches the theme and the buttons follow
        the system's order and variants. The surface uses the RN >= 0.74 `role="alertdialog"`
        prop with accessibilityViewIsModal. `confirmDisabled` maps to Button's `disabled`,
        which on native is accessibilityState.disabled plus a press guard (the control
        stays focusable), per Button's own contract.
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

- `onConfirm`: emit `confirm`
  - fires on: user
  - timing: request
- `onCancel`: emit `cancel`
  - payload, the keys of `CustomEvent.detail`: `reason: 'cancel' | 'escape'`
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

`overlay.closeEvent` emits `cancel`.

## Constants and examples

- example `delete-files`, story `DeleteFiles`: given `open: true`, `tone: "danger"`, `heading: "Delete 3 files?"`, `description: "They will be removed from all shared folders. This cannot be undone."`, `confirmLabel: "Delete files"`; The destructive confirm this component exists for, counting what will go.
- example `leave-without-saving`, story `LeaveWithoutSaving`: given `open: true`, `tone: "warning"`, `heading: "Leave without saving?"`, `description: "Your changes to this draft will be lost."`, `confirmLabel: "Leave"`, `cancelLabel: "Keep editing"`; A consequential but recoverable decision, where the declining action is the one to name.
- example `typed-confirmation`, story `TypedConfirmation`: given `open: true`, `tone: "danger"`, `heading: "Cancel your subscription?"`, `description: "Your workspace stays read-only after the current billing period ends."`, `confirmLabel: "Cancel subscription"`, `confirmDisabled: true`; A decision gated on a precondition, with Confirm inert until it is met.
- example `publish-to-the-team`, story `PublishToTheTeam`: given `open: true`, `tone: "info"`, `heading: "Publish to the team?"`, `description: "Everyone in the workspace will be able to see this page."`, `confirmLabel: "Publish"`; A choice with no downside that still needs an answer.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `textGap`, `iconGap`, `footerGap`, `iconSize`, `width`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `icon`, `focusRing`, `focusRingWidth`

## Behavior scenarios (14)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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

## Platform notes (lit)

```yaml
tag: ds-alert-dialog
reflect:
- open
- tone
notes: 'Same shadow <dialog> approach as ds-dialog with role="alertdialog". Dispatches
  composed `confirm` and `cancel` (detail { reason }). No slots: title, description
  and labels are properties, so the element is fully described by attributes. The
  shadow <dialog> is named with aria-label={heading} and described with aria-description,
  since ids do not cross the shadow boundary.'
```

## Guidance

## Overview

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
