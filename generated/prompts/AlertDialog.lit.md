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
- Story render shape: the render that applies to a story (its own `render`, else the meta's) is written inline and returns one `html`` template directly — never a call (`render: (args) => renderBox(args)`) and never a bare identifier (`render: divider`). The docs site reads that template for the Lit code sample, and anything else leaves every story in the module without one. Interpolate helper fragments into the template rather than wrapping it.
- Story parity: every story the React package exports has a Lit story with the same export name and args, including each example named above.
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
    focusScope:
      component: FocusScope
      props:
        trapped: true
        restoreFocus: true
        autoFocus: none
    icon:
      component: Icon
      forwards:
        icon: color
        iconSize: size
    heading:
      component: Heading
      props:
        level: '2'
    description:
      component: Text
      props:
        tone: muted
    footer:
      component: Stack
      props:
        direction: horizontal
        gap: tight
        justify: end
      forwards:
        footerGap: gap
    cancelButton:
      component: Button
      props:
        variant: secondary
        size: md
    confirmButton:
      component: Button
      props:
        size: md
  props:
    open:
      type: boolean
      required: true
      description: Controlled only — there is no uncontrolled mode; the consumer owns
        `open` and sets it false after handling `onConfirm` or `onCancel`, as in Dialog.
    heading:
      type: string
      required: true
      description: The question or statement, as a level-2 Heading at the size Heading
        reads from level 2 (no explicit `size`), and the accessible name ("Delete
        3 files?").
      a11y: aria-labelledby the heading; native accessibilityLabel on the modal content.
    description:
      type: string
      required: true
      description: 'What will happen and whether it can be undone, in one or two sentences,
        rendered as Text `tone="muted"` at Text''s default size (the color.foreground.muted
        contrast pair). Required: a decision without consequences stated is not a
        decision.'
      a11y: aria-describedby; announced together with the title when the dialog opens.
    tone:
      type: enum
      enumRef: tone
      values:
      - danger
      - warning
      - info
      default: danger
      description: The nature of the decision. Sets the status icon (Icon `name` equal
        to the tone) and the confirm button's variant (danger → danger Button; warning
        and info → primary). Both buttons are Button size md.
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
        `disabled` — the Button decides what that means per platform, and on every
        platform it stays focusable-but-inert (aria-disabled plus a click guard on
        web and Lit, accessibilityState.disabled plus a press guard on native), so
        Confirm is still the last Tab stop; AlertDialog neither restyles it nor sets
        aria-disabled itself.
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
        `cancel` or `escape`. A scrim click does nothing. The `close-button` entry
        in `overlay.dismiss` is the shared category name for the Cancel button, reported
        as `cancel`; there is no separate close button.
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
    action: Activates the focused button as a native button activation, which on Cancel
      fires onCancel with reason cancel. Initial focus is on Cancel so Enter never
      confirms by momentum. `closes` here means the close request fires; the dialog
      itself stays open until the consumer sets `open` false.
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
      description: 'Pads the inline edges of every part; the block edges are padded
        once, on the surface column that holds the parts (padding-block: inset), not
        per part, so nothing doubles. partGap is the only space between the icon-and-text
        row and the footer.'
      locked: false
    partGap:
      token: layout.gap.loose
      part: surface
      description: 'The gap of the surface''s column, between the icon-and-text row
        and the footer: the icon sits inline with the text block, so this measures
        from that whole row.'
      locked: false
    textGap:
      token: layout.gap.tight
      description: Between title and description.
      locked: false
    iconGap:
      token: layout.gap.normal
      part: surface
      description: Between the icon and the text block — the gap of the row inside
        the surface that holds both, not a property of the icon element (an icon cannot
        own a gap).
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: 'Forwarded to the footer Stack''s `gap`. The forward always reaches
        the Stack with AlertDialog''s resolved value: on web and Lit the AlertDialog
        stylesheet sets the Stack''s own `--ds-stack-gap` hook on the Stack element
        to `--ds-alert-dialog-footer-gap`, and `overrides.gap` is passed only when
        the caller set the `footerGap` override, so consumer CSS on the AlertDialog
        hook still works; on rn the resolved value (the token or the override) is
        always passed as `overrides.gap`. It has no hook beyond `--ds-alert-dialog-footer-gap`.'
      locked: false
    iconSize:
      token: font.size.lg
      part: icon
      description: 'Forwarded to the tone Icon''s `size`; the Icon gets no `size`
        prop. Delivered as `footerGap` is: on web and Lit the stylesheet sets the
        Icon''s `--ds-icon-size` hook to `--ds-alert-dialog-icon-size` and `overrides.size`
        is passed only when the caller set the override; on rn the resolved value
        is always passed as `overrides.size`. No hook beyond `--ds-alert-dialog-icon-size`.'
      locked: false
    icon:
      token: color.status.{tone}.icon
      part: icon
      description: 'Forwarded to the tone Icon''s `color`. It is the foreground of
        the non-text contrast pair and so is not a member of the overrides type; the
        caller never overrides it and it is always delivered: on web and Lit a per-tone
        rule in the AlertDialog stylesheet sets the Icon''s own `--ds-icon-color`
        hook on the Icon element (setting `color` on an ancestor or wrapper has no
        effect, because Icon''s own rule wins); on rn `overrides.color` is always
        passed. As in Alert and Toast.'
      locked: true
    width:
      token: layout.maxWidth.prose
      part: surface
      description: 'Always the small size; an alert dialog with more content is a
        Dialog. The width sits on the surface itself: inline-size min(width, viewport
        width − 2 × gutter). On web and Lit the <dialog> fills the viewport and centers
        the surface; the focusScope element only wraps it.'
      locked: false
    gutter:
      token: layout.gutter
      part: surface
      description: 'The least space between the surface and each viewport edge: caps
        the surface width at viewport width − 2 × gutter and its max height at viewport
        height − 2 × gutter, both set on the surface. On rn spacing is never a margin:
        the gutter is paddingHorizontal on the centering View, and the surface maxHeight
        is window height − 2 × gutter from useWindowDimensions.'
      locked: false
    layer:
      token: layer.dialog
      description: 'Kept as the hook for consistency with Dialog, but it has no effect
        anywhere this component renders: web and Lit always open with showModal()
        into the top layer and have no non-top-layer fallback (the hook is written
        as z-index on the <dialog>, where the top layer ignores it), and rn renders
        in a native Modal window.'
      locked: false
    rise:
      token: space.2
      part: surface
      description: The distance the surface rises during enter (translateY from rise
        to 0); zero under reduced motion.
      locked: false
    enter:
      token: motion.duration.base
      description: One duration shared by the scrim fade and the surface fade-and-rise
        (translateY of `rise`), with motion.easing.standard; instant under reduced
        motion.
      locked: false
    exit:
      token: motion.duration.fast
      description: One duration shared by the scrim and surface fade-out, with motion.easing.exit;
        instant under reduced motion.
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
        its own for them. FocusScope takes autoFocus `none`, because its effect runs
        before showModal() while the <dialog> is still closed and cannot take focus:
        AlertDialog focuses Cancel itself right after showModal() (and after a native
        re-open), and FocusScope keeps the trap and focus restore. As in Dialog, the
        <dialog> fills the viewport with a transparent ::backdrop and the scrim is
        a real element inside it carrying `data-part="scrim"`, behind the surface
        and fading with it; it has no click listener, so a scrim click does nothing.
        FocusScope writes its own `data-part="scope"`, so the `focusScope` part is
        an AlertDialog-owned element directly inside FocusScope wrapping the surface,
        carrying `data-part="focusScope"`. Icon, Heading, Text, Stack and the two
        Buttons write their own data-part, so the icon, heading, description, footer,
        cancelButton and confirmButton parts each live on an AlertDialog-owned wrapper
        element carrying `data-part`; the icon-and-text row is an unhooked element
        inside the surface. `role` is fixed to alertdialog and not accepted from the
        consumer.'
    lit:
      tag: ds-alert-dialog
      reflect:
      - open
      - tone
      notes: 'Same shadow <dialog> approach as ds-dialog with role="alertdialog".
        Dispatches composed `confirm` (no detail) and `cancel` (detail { reason })
        — only the cancel event has a reason. No slots: heading, description and labels
        are properties, so the element is fully described by attributes. The shadow
        <dialog> is named with aria-label={heading} and described with aria-description.
        An idref would resolve here, since the heading shares the shadow root, but
        the package names every Lit overlay with the literal text so the name does
        not depend on where the heading is rendered. Cancel is `<ds-button variant="secondary">`
        and the footer `<ds-stack>` is `direction="horizontal" gap="tight" justify="end"`,
        as on web. The scrim, focusScope and initial focus are as on web: a real `data-part="scrim"`
        element in the full-viewport <dialog> (transparent ::backdrop, no click listener);
        the `focusScope` part is an element directly inside <ds-focus-scope> carrying
        `data-part="focusScope"`; <ds-focus-scope> takes autoFocus `none` and the
        element focuses the Cancel <ds-button> right after showModal(). Every composed
        part (icon, heading, description, footer, cancelButton, confirmButton) is
        an AlertDialog-owned wrapper element carrying `data-part`: ds-* hosts carry
        no data-part of their own.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - accessibilityViewIsModal
      notes: 'Native Modal as in Dialog; the scrim Pressable is absent (no scrim dismissal)
        — the scrim is an Animated.View whose opacity follows the enter and exit animation,
        with no press handler or responder. onRequestClose → onCancel reason escape;
        iOS has no hardware-Escape hook, so the surface View also handles `onAccessibilityEscape`
        (the VoiceOver two-finger scrub) as onCancel reason escape, as in Dialog.
        The surface View carries `role="alertdialog"`, `accessibilityLabel={heading}`,
        `accessibilityHint={description}` and accessibilityViewIsModal, so the accessible-name
        scenario targets `AlertDialog.surface`, not the outer View with the root testID.
        Initial accessibility focus on the title so the question is read, then the
        buttons follow in order Cancel, Confirm. iOS also offers Alert.alert() natively;
        this component does not use it, so the look matches the theme and the buttons
        follow the system''s order and variants. The surface uses the RN >= 0.74 `role="alertdialog"`
        prop with accessibilityViewIsModal. `confirmDisabled` maps to Button''s `disabled`,
        which on native is accessibilityState.disabled plus a press guard (the control
        stays focusable), per Button''s own contract. Scroll lock has no native meaning
        — a Modal has no page behind it to scroll — and is not implemented, as in
        Dialog. Heading has no levels on native: `level` only sets the visual size
        and the heading trait comes from Heading''s own accessibilityRole="header".
        Heading forwards no ref, so initial accessibility focus targets the View wrapping
        the heading rather than its Text node; the announcement is the same. FocusScope
        takes autoFocus `none` (focus is placed on the heading by hand) with no testID
        of its own. The Modal takes no testID: `testID="AlertDialog"` is on the outermost
        View inside the Modal and `AlertDialog.surface` on the inner bordered View;
        the scrim is that Animated.View with `testID="AlertDialog.scrim"` and no press
        handler or responder, so a press on it reaches nothing — a Pressable there
        would break the contract. Icon, Heading, Text, Stack and Button write their
        own testIDs, so the icon, heading, description, footer, cancelButton and confirmButton
        parts are each a wrapping View with `testID="AlertDialog.<part>"`. The icon
        is decorative, as on web: the Icon has no label, and its wrapper sets accessibilityElementsHidden
        and importantForAccessibility="no-hide-descendants". AlertDialog is rooted
        in a native Modal and exposes no ref; callers ref their trigger.'
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
        open, initial focus on the cancel `Button` whatever the tone, Escape = cancel.
        Not `.alert()`: the system alert cannot take the theme or a body view. `confirmLabel`/`cancelLabel`
        from copy.'
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
    description: With no cancelLabel the declining action falls back to copy.cancelLabel,
      read as the text and accessible name of the Button inside the cancelButton part.
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
- `focusScope`: component `FocusScope`; props `trapped` = true, `restoreFocus` = true, `autoFocus` = "none"
- `icon`: component `Icon`; forwards `icon` → `overrides.color`, `iconSize` → `overrides.size`
- `heading`: component `Heading`; props `level` = "2"
- `description`: component `Text`; props `tone` = "muted"
- `footer`: component `Stack`; props `direction` = "horizontal", `gap` = "tight", `justify` = "end"; forwards `footerGap` → `overrides.gap`
- `cancelButton`: component `Button`; props `variant` = "secondary", `size` = "md"
- `confirmButton`: component `Button`; props `size` = "md"

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `partGap`: token `layout.gap.loose`; part `surface`
- `iconGap`: token `layout.gap.normal`; part `surface`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `iconSize`: token `font.size.lg`; part `icon`
- `icon`: token `color.status.{tone}.icon`; part `icon`; locked
- `width`: token `layout.maxWidth.prose`; part `surface`
- `gutter`: token `layout.gutter`; part `surface`
- `rise`: token `space.2`; part `surface`

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

Overridable: `scrim`, `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `textGap`, `iconGap`, `footerGap`, `iconSize`, `width`, `gutter`, `layer`, `rise`, `enter`, `exit`
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
  description: With no cancelLabel the declining action falls back to copy.cancelLabel,
    read as the text and accessible name of the Button inside the cancelButton part.
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
notes: "Same shadow <dialog> approach as ds-dialog with role=\"alertdialog\". Dispatches\
  \ composed `confirm` (no detail) and `cancel` (detail { reason }) \u2014 only the\
  \ cancel event has a reason. No slots: heading, description and labels are properties,\
  \ so the element is fully described by attributes. The shadow <dialog> is named\
  \ with aria-label={heading} and described with aria-description. An idref would\
  \ resolve here, since the heading shares the shadow root, but the package names\
  \ every Lit overlay with the literal text so the name does not depend on where the\
  \ heading is rendered. Cancel is `<ds-button variant=\"secondary\">` and the footer\
  \ `<ds-stack>` is `direction=\"horizontal\" gap=\"tight\" justify=\"end\"`, as on\
  \ web. The scrim, focusScope and initial focus are as on web: a real `data-part=\"\
  scrim\"` element in the full-viewport <dialog> (transparent ::backdrop, no click\
  \ listener); the `focusScope` part is an element directly inside <ds-focus-scope>\
  \ carrying `data-part=\"focusScope\"`; <ds-focus-scope> takes autoFocus `none` and\
  \ the element focuses the Cancel <ds-button> right after showModal(). Every composed\
  \ part (icon, heading, description, footer, cancelButton, confirmButton) is an AlertDialog-owned\
  \ wrapper element carrying `data-part`: ds-* hosts carry no data-part of their own."
```

## Guidance

## Overview

An alert dialog is a Dialog with one job: get a considered yes or no. It looks like a Dialog and behaves like one in every way that keeps people safe, and differs in every way that keeps them from answering by accident — no close button, no scrim dismissal, focus starting on Cancel, the confirming action named after what it does.

## When to use

Use an AlertDialog before an action that destroys data, spends money, sends something that cannot be recalled, or leaves a state the user cannot get back to — and only when undo is not available. Use `tone: danger` for destruction, `warning` for consequential-but-recoverable, `info` for a decision with no downside that still needs a choice (leave the page with unsaved changes? — that is `warning`).

## When not to use

Do not confirm reversible actions; provide undo (a Toast with an action) instead, which is faster and less annoying. Do not use an AlertDialog to show information (Alert or Dialog), to collect input beyond a single typed confirmation (Dialog with a Form), or as a general "are you sure" habit — if a team finds itself adding many, the actions need undo.

## Behavior

Opens like a Dialog: scrim, trapped focus, inert page, locked scroll. Focus lands on the Cancel button, placed by AlertDialog itself (FocusScope takes autoFocus `none` and keeps the trap and the restore). Escape and Cancel fire `onCancel`; Confirm fires `onConfirm`. A scrim click does nothing, so a stray tap cannot dismiss a decision, and there is no close button, so the only ways out are the two named ones. `open` is controlled only; there is no uncontrolled mode. The consumer closes by setting `open` false after handling the event — Enter on a button fires its event and nothing closes until then. The heading's id, ref and tabindex, the Buttons' labels and press handlers, the tone Icon's `name` and the aria wiring are wiring every platform passes, not composition props. Example stories start from blank args, never from Default's or the meta args: a prop absent from `given` takes its default, and every example here gives `open: true`, so it renders through a wrapper that owns `open` (starting true) and writes the events back, acting as the consumer. The Default story is open, with the delete-files example's args, so the DeleteFiles example story repeating it is expected. `confirmDisabled` keeps Confirm inert until a precondition is met, through the composed Button's own `disabled` — focusable-but-inert on every platform, so it stays in the Tab cycle. The dialog has exactly two focusable children, Cancel and Confirm, and no slot for more; its Keyboard story exercises Tab wrap across those two (the trigger behind is inert, and is labelled with the `heading` text, never `confirmLabel`, so no second button shares Confirm's name), and the three-focusable-children story rule does not apply.

## Content guidelines

The title is the question, specific and countable ("Delete 3 files?", "Cancel your subscription?"). The description states the consequence plainly and whether it is permanent ("They will be removed from all shared folders. This cannot be undone."). The confirm label restates the verb ("Delete files"), the cancel label is "Cancel" unless the situation needs "Keep editing". Never "OK", never "Yes/No".

## Accessibility

Role `alertdialog` tells assistive technology this is a decision, and the title and description are announced together on open (WCAG 4.1.2, APG alertdialog). Focus starts on the safe action so Enter pressed reflexively cancels rather than destroys (3.3.4 Error Prevention: reversible, checked or confirmed — this is the "confirmed" leg). Everything else is inherited from Dialog: focus trap with Escape as exit, focus restore, inert background, contrast on the overlay surface in both modes, reduced motion.

## Platform notes

### Web
Native `<dialog role="alertdialog" aria-modal="true" aria-labelledby aria-describedby>` through a portal, opened with `showModal()`. Handle `cancel` (preventDefault, then `onCancel('escape')`). Do not attach a scrim click handler. Footer is a horizontal Stack, `gap: tight`, Cancel then Confirm in DOM order (Cancel first so it is focused first; visually the primary sits at the end via `justify: end`). Cancel is `variant="secondary"` on every platform; Confirm's variant follows `tone`. The icon is `<Icon name={tone}>` colored by the tone token through Icon's own `--ds-icon-color` hook (see the `icon` binding), `aria-hidden`. The scrim is a real element inside the full-viewport `<dialog>`, as in Dialog, with no click handler.

### Lit
`<ds-alert-dialog open tone="danger" heading="Delete 3 files?" description="…" confirm-label="Delete files">`. Shadow `<dialog>` with `showModal()`; composed `confirm` and `cancel` events. Renders `<ds-heading>`, `<ds-text>`, `<ds-icon>`, `<ds-stack>` and two `<ds-button>`s.

### React Native
`Modal` as in Dialog, no scrim `Pressable` (an `Animated.View` scrim with no press handler). `onRequestClose` and the surface's `onAccessibilityEscape` → `onCancel('escape')`. Set accessibility focus to the title after the enter animation; Cancel precedes Confirm in the accessibility order. Buttons are the system `Button` (`secondary` for cancel; `danger` or `primary` for confirm by tone).

## Related

Dialog, Toast, Button, Alert.
