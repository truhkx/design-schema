# Generate: AlertDialog for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/AlertDialog.tsx` exporting a typed React Native function component named `AlertDialog`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `AlertDialogProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger and at least three focusable children, for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof AlertDialog> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `AlertDialog.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
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
      description: Forwarded to the tone Icon as `overrides.color` (Icon's own color
        hook wins over any color set on an ancestor), as in Alert and Toast.
      locked: true
    width:
      token: layout.maxWidth.prose
      description: Always the small size; an alert dialog with more content is a Dialog.
        On narrow viewports the surface is min(width, viewport width − 2 × gutter).
      locked: false
    gutter:
      token: layout.gutter
      part: surface
      description: 'The least space between the surface and each viewport edge: caps
        the width at viewport width − 2 × gutter and the height at viewport height
        − 2 × gutter (on rn, the horizontal margin and the max height).'
      locked: false
    layer:
      token: layer.dialog
      description: 'No effect inside the browser top layer or a native Modal window;
        applies to the non-top-layer fallback (position: fixed).'
      locked: false
    enter:
      token: motion.duration.base
      description: Scrim fade and surface fade-and-rise (translateY of space.2), with
        motion.easing.standard; instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      description: Scrim and surface fade out with motion.easing.exit; instant under
        reduced motion.
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
        its own for them. FocusScope takes autoFocus `first`, which is Cancel. The
        scrim is the <dialog>''s ::backdrop and has no data-part hook; a scrim click
        lands on the <dialog> element itself (event.target === dialog) and is ignored.
        Icon, Heading, Text, Stack and the two Buttons write their own data-part,
        so the icon, heading, description, footer, cancelButton and confirmButton
        parts each live on an AlertDialog-owned wrapper element carrying `data-part`;
        the icon-and-text row is an unhooked element inside the surface. `role` is
        fixed to alertdialog and not accepted from the consumer.'
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
        the heading rather than its Text node; the announcement is the same. FocusScope
        takes autoFocus `none` (focus is placed on the heading by hand) with no testID
        of its own. The Modal takes no testID: `testID="AlertDialog"` is on the outermost
        View inside the Modal and `AlertDialog.surface` on the inner bordered View;
        the scrim is a plain View with `testID="AlertDialog.scrim"` and no press handler
        or responder, so a press on it reaches nothing — a Pressable there would break
        the contract. Icon, Heading, Text, Stack and Button write their own testIDs,
        so the icon, heading, description, footer, cancelButton and confirmButton
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
- `focusScope`: component `FocusScope`; props `trapped` = true, `restoreFocus` = true
- `icon`: component `Icon`; forwards `icon` → `overrides.color`, `iconSize` → `overrides.size`
- `heading`: component `Heading`; props `level` = "2"
- `description`: component `Text`; props `tone` = "muted"
- `footer`: component `Stack`; forwards `footerGap` → `overrides.gap`
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
- `gutter`: token `layout.gutter`; part `surface`

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

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `scrim`, `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `textGap`, `iconGap`, `footerGap`, `iconSize`, `width`, `gutter`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `icon`, `focusRing`, `focusRingWidth`

## Behavior scenarios (11)

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
```

## Platform notes (rn)

```yaml
element: Modal
props:
- visible
- transparent
- onRequestClose
- accessibilityViewIsModal
notes: "Native Modal as in Dialog; the scrim Pressable is absent (no scrim dismissal)\
  \ \u2014 the scrim is a plain View. onRequestClose \u2192 onCancel reason escape.\
  \ Initial accessibility focus on the title so the question is read, then the buttons\
  \ follow in order Cancel, Confirm. iOS also offers Alert.alert() natively; this\
  \ component does not use it, so the look matches the theme and the buttons follow\
  \ the system's order and variants. The surface uses the RN >= 0.74 `role=\"alertdialog\"\
  ` prop with accessibilityViewIsModal. `confirmDisabled` maps to Button's `disabled`,\
  \ which on native is accessibilityState.disabled plus a press guard (the control\
  \ stays focusable), per Button's own contract. Scroll lock has no native meaning\
  \ \u2014 a Modal has no page behind it to scroll \u2014 and is not implemented,\
  \ as in Dialog. Heading has no levels on native: `level` only sets the visual size\
  \ and the heading trait comes from Heading's own accessibilityRole=\"header\". Heading\
  \ forwards no ref, so initial accessibility focus targets the View wrapping the\
  \ heading rather than its Text node; the announcement is the same. FocusScope takes\
  \ autoFocus `none` (focus is placed on the heading by hand) with no testID of its\
  \ own. The Modal takes no testID: `testID=\"AlertDialog\"` is on the outermost View\
  \ inside the Modal and `AlertDialog.surface` on the inner bordered View; the scrim\
  \ is a plain View with `testID=\"AlertDialog.scrim\"` and no press handler or responder,\
  \ so a press on it reaches nothing \u2014 a Pressable there would break the contract.\
  \ Icon, Heading, Text, Stack and Button write their own testIDs, so the icon, heading,\
  \ description, footer, cancelButton and confirmButton parts are each a wrapping\
  \ View with `testID=\"AlertDialog.<part>\"`. The icon is decorative, as on web:\
  \ the Icon has no label, and its wrapper sets accessibilityElementsHidden and importantForAccessibility=\"\
  no-hide-descendants\". AlertDialog is rooted in a native Modal and exposes no ref;\
  \ callers ref their trigger."
```

## Guidance

## Overview

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
