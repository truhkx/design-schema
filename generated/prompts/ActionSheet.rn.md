# Generate: ActionSheet for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/ActionSheet.tsx` exporting a typed React Native function component named `ActionSheet`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `ActionSheetProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof ActionSheet> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `ActionSheet.test.tsx`.

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
  name: ActionSheet
  category: overlay
  status: review
  apg: menu-button
  anatomy:
  - scrim
  - surface
  - focusScope
  - handle
  - header
  - heading
  - list
  - item
  - itemIcon
  - cancelButton
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
      description: What the actions apply to ("Photo.jpg"), shown muted above the
        list. Also the accessible name; when omitted the name is `copy.defaultLabel`.
    actions:
      type: array
      required: true
      shape: '{ id: string; label: string; icon?: IconName; tone?: "default" | "danger";
        disabled?: boolean }[]'
      description: Two to about eight actions. `danger` actions are visually distinct
        and grouped last.
    dismissible:
      type: boolean
      default: true
      description: Escape, the scrim, the cancel row and the drag all request close;
        Escape still reports through onClose when false, as in Dialog. It gates the
        sheet presentation only — the wide Menu presentation has no scrim, drag or
        cancel row, and clicking outside always closes it.
    cancelLabel:
      type: string
      description: Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`.
  events:
    onAction:
      description: An action was chosen; receives its `id`. The consumer performs
        it and closes.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
      payload:
      - name: id
        type: string
        description: The id of the chosen action.
      fires:
      - user
      timing:
        phase: request
    onClose:
      description: 'Dismissed without choosing: reason `escape`, `scrim`, `cancel`,
        or `drag`.'
      platforms:
        web: onClose
        lit: close
        rn: onClose
        swiftui: onClose
      payload:
      - name: reason
        type: enum
        values:
        - escape
        - scrim
        - cancel
        - drag
      reasons:
        escape: Escape pressed while open
        scrim: the scrim was clicked
        cancel: the cancel action was chosen
        drag: the sheet was dragged past the dismiss threshold
      fires:
      - user
      timing:
        phase: request
  keyboard:
  - keys:
    - Escape
    action: Closes without choosing.
    from: inside
    expect: closes
  - keys:
    - ArrowDown
    action: Moves focus to the next action.
    from: first
    expect: focus-next
  - keys:
    - ArrowDown
    action: From the last action wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - ArrowUp
    action: From the first action wraps to the last.
    from: first
    expect: focus-wraps-to-last
  - keys:
    - Home
    action: First action.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last action.
    from: first
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: Chooses the focused action and closes.
    when: focus on an action
    from: first
    expect: closes
  - keys:
    - Tab
    action: 'Closes and moves focus on (a menu is not a tab stop container). No Tab
      handler is needed: the roving tabindex leaves one stop and the outside-close
      rule does the rest, which is why this rule is manual rather than asserted.'
    when: wide-screen menu presentation
    from: first
    expect: manual
  styles:
    scrim:
      token: color.overlay.scrim
      part: scrim
      locked: false
    surface:
      token: color.overlay.surface
      part: surface
      locked: true
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.lg
      locked: false
    itemPaddingBlock:
      token: space.sm
      part: item
      locked: false
    itemPaddingInline:
      token: layout.inset.md
      part: item
      locked: false
    itemGap:
      token: layout.gap.normal
      part: item
      description: 'Between icon and label. Rows have no gap between them: their rhythm
        comes from itemPaddingBlock.'
      locked: false
    headerPaddingBlock:
      token: space.sm
      part: header
      description: Vertical padding of the header (handle + heading) and of the cancel
        row.
      locked: false
    headerGap:
      token: layout.gap.tight
      part: header
      description: Between the handle and the heading.
      locked: false
    handle:
      token: color.foreground.muted
      part: handle
      description: A pill (space.1 tall, space.10 wide) centered in the header, decorative
        and hidden from assistive technology, as BottomSheet.
      locked: true
    handleHeight:
      token: space.1
      part: handle
      locked: false
    handleWidth:
      token: space.10
      part: handle
      locked: false
    handleRadius:
      token: radius.full
      part: handle
      locked: false
    itemHover:
      token: color.background.subtle
      part: item
      state: hover
      locked: true
    itemColor:
      token: color.foreground
      part: item
      locked: true
    itemDangerColor:
      token: color.foreground.danger
      part: item
      locked: true
    titleColor:
      token: color.foreground.muted
      locked: true
    titleSize:
      token: font.size.sm
      locked: false
    fontFamily:
      token: font.family.body
      description: Applied to the rows and forwarded to the composed heading Text
        as an override, since Text always sets its own family.
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      description: Applied to the rows and forwarded to the composed heading Text
        as an override, as fontFamily is.
      locked: false
    divider:
      token: color.border
      description: Above the danger group and above the cancel row.
      locked: false
    dividerWidth:
      token: border.width.thin
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    maxWidth:
      token: layout.maxWidth.prose
      description: Above this width, present as a Menu anchored to the trigger.
      locked: false
    layer:
      token: layer.sheet
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
  constants:
    dismissDistance:
      description: Fraction of the sheet height a downward drag must pass for release
        to dismiss it rather than spring back.
      value: 0.25
      unit: ratio
    dismissVelocity:
      description: Drag speed at release that dismisses the sheet whatever the distance
        travelled.
      value: 1.5
      unit: px/ms
  copy:
    cancelLabel: Cancel
    defaultLabel: Actions
  overlay:
    layer: sheet
    open: open
    closeEvent: onClose
    dismiss:
    - escape
    - scrim
    - close-button
    - swipe
    modal: true
  a11y:
    role: menu
    requires:
    - accessible-name
    - focus-trap
    - focus-restore
    - escape-dismiss
    - inert-background
    - arrow-navigation
    - roving-tabindex
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-44px
    - gesture-alternative
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.danger
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: dialog
      attributes:
      - aria-modal
      - aria-label
      - role=menu
      - role=menuitem
      notes: 'Below maxWidth: a native <dialog> at the bottom edge (as BottomSheet)
        containing a <div role="menu" aria-label> of <button role="menuitem"> rows
        plus a separate Cancel <ds-button>. Above maxWidth: renders Menu anchored
        to the element that was focused when `open` became true. Menu owns its trigger
        and takes no external anchor, so the wide presentation places the Menu host
        at the opener''s rect and keeps its own trigger invisible and out of reach
        — `opacity: 0`, `pointer-events: none`, `tabindex="-1"`, `aria-hidden="true"`
        — which anchors to the rect rather than to the node and is close enough; it
        is never a focus stop. `container?: HTMLElement` (default document.body) is
        the portal target — a platform prop every portaled overlay accepts, not a
        schema prop, and it is forwarded to the wide Menu too. Roving tabindex over
        the items; first item focused on open. The forwarded ref is the sheet presentation''s
        <dialog>; in the wide presentation there is no equivalent node and the ref
        stays null.'
    lit:
      tag: ds-action-sheet
      reflect:
      - open
      notes: '`actions` is a property. Composed `action` (detail { id }) and `close`
        (detail { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet;
        the wide presentation renders <ds-menu>, positioned at the opener''s rect
        with its own trigger hidden, as on web. The heading is named by `aria-label`
        rather than an id reference, since ids do not cross the shadow root.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - accessibilityViewIsModal
      notes: 'A native Modal sheet: a View with accessibilityRole="menu" containing
        Pressable rows with accessibilityRole="menuitem" and a separate Cancel Button,
        drag-to-dismiss on the header as BottomSheet. iOS''s ActionSheetIOS is not
        used, so the look matches the theme on both platforms. There is no wide presentation
        on native: Menu renders its own trigger and cannot be anchored to an external
        element, so tablets above maxWidth get the sheet too and `maxWidth` is a no-op
        override here. The surface uses the RN >= 0.74 `role="menu"` prop with accessibilityViewIsModal;
        rows are `role="menuitem"`. Pressable has no key events, so there are no arrow
        keys, no Home/End and no roving tabindex; each row is its own accessibility
        focus stop reached by swipe, and Enter/Space are the platform''s own activation.'
    swiftui:
      element: confirmationDialog
      props:
      - .confirmationDialog
      - Button
      - role=destructive
      - role=cancel
      - titleVisibility
      notes: '`.confirmationDialog(title, isPresented:, titleVisibility: .visible)`
        with one `Button` per action (`destructive` via `role: .destructive`, cancel
        via `role: .cancel` from copy) — the system action sheet is the pattern users
        expect and VoiceOver handles it natively; the doc''s surface bindings are
        no-ops here (the gallery notes it), `description` becomes the message. `onAction`
        with the action id, `onClose` on dismissal.'
  behavior:
  - name: choosing-an-action-fires-on-action
    description: A row reports the chosen action; the consumer performs it and closes.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
      - id: delete
        label: Delete photo
        tone: danger
    when:
      click: item
    then:
    - event: onAction
  - name: the-cancel-row-fires-on-close
    description: The explicit Cancel row is a dismissal, not a choice, so onAction
      stays silent.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
    when:
      click: cancelButton
    then:
    - event: onClose
    - event: onAction
      fired: false
  - name: non-dismissible-still-reports-escape
    description: As in Dialog, Escape reports through onClose even when `dismissible`
      is false.
    given:
      open: true
      heading: Photo.jpg
      dismissible: false
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
    when:
      key: Escape
    then:
    - event: onClose
    platforms:
    - web
    - lit
  - name: the-cancel-row-is-named-from-copy
    description: With no cancelLabel the cancel row falls back to copy.cancelLabel.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
    then:
    - copy: cancelLabel
  - name: the-list-is-a-menu
    description: The actions are a menu of menuitems (APG menu button), not a list
      of buttons.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
    then:
    - role: menu
  - name: closed-sheet-renders-nothing
    given:
      open: false
      actions:
      - id: share
        label: Share
    then:
    - renders: false
  examples:
  - name: photo-actions
    description: Contextual actions on an item, with the destructive one last.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
        icon: external
      - id: rename
        label: Rename
      - id: duplicate
        label: Duplicate
      - id: delete
        label: Delete photo
        icon: danger
        tone: danger
  - name: unnamed-sheet
    description: A sheet with no heading, named by copy.defaultLabel for assistive
      technology.
    given:
      open: true
      actions:
      - id: copy
        label: Copy link
      - id: open
        label: Open in new tab
  - name: with-an-unavailable-action
    description: An action that is shown but cannot be used here, announced as disabled
      rather than hidden.
    given:
      open: true
      heading: Invoice 4821
      cancelLabel: Not now
      actions:
      - id: download
        label: Download
      - id: void
        label: Void invoice
        tone: danger
        disabled: true
```

## Events

- `onAction`: emit `onAction`
  - payload, positional, in this order: `id: string`
  - fires on: user
  - timing: request
- `onClose`: emit `onClose`
  - payload, positional, in this order: `reason: 'escape' | 'scrim' | 'cancel' | 'drag'`
  - reasons: `escape` (Escape pressed while open); `scrim` (the scrim was clicked); `cancel` (the cancel action was chosen); `drag` (the sheet was dragged past the dismiss threshold)
  - fires on: user
  - timing: request

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onClose` (emit `onClose`); drives state `open`

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `itemPaddingBlock`: token `space.sm`; part `item`
- `itemPaddingInline`: token `layout.inset.md`; part `item`
- `itemGap`: token `layout.gap.normal`; part `item`
- `headerPaddingBlock`: token `space.sm`; part `header`
- `headerGap`: token `layout.gap.tight`; part `header`
- `handle`: token `color.foreground.muted`; part `handle`; locked
- `handleHeight`: token `space.1`; part `handle`
- `handleWidth`: token `space.10`; part `handle`
- `handleRadius`: token `radius.full`; part `handle`
- `itemHover`: token `color.background.subtle`; part `item`; state `hover`; locked
- `itemColor`: token `color.foreground`; part `item`; locked
- `itemDangerColor`: token `color.foreground.danger`; part `item`; locked

## Form and overlay

```yaml
overlay:
  layer: sheet
  open: open
  closeEvent: onClose
  dismiss:
  - escape
  - scrim
  - close-button
  - swipe
  modal: true
```

`overlay.closeEvent` emits `onClose`.

## Constants and examples

- constant `dismissDistance`: 0.25 ratio
- constant `dismissVelocity`: 1.5 px/ms
- example `photo-actions`, story `PhotoActions`: given `open: true`, `heading: "Photo.jpg"`, `actions: [{"id":"share","label":"Share","icon":"external"},{"id":"rename","label":"Rename"},{"id":"duplicate","label":"Duplicate"},{"id":"delete","label":"Delete photo","icon":"danger","tone":"danger"}]`; Contextual actions on an item, with the destructive one last.
- example `unnamed-sheet`, story `UnnamedSheet`: given `open: true`, `actions: [{"id":"copy","label":"Copy link"},{"id":"open","label":"Open in new tab"}]`; A sheet with no heading, named by copy.defaultLabel for assistive technology.
- example `with-an-unavailable-action`, story `WithAnUnavailableAction`: given `open: true`, `heading: "Invoice 4821"`, `cancelLabel: "Not now"`, `actions: [{"id":"download","label":"Download"},{"id":"void","label":"Void invoice","tone":"danger","disabled":true}]`; An action that is shown but cannot be used here, announced as disabled rather than hidden.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `scrim`, `shadow`, `radius`, `itemPaddingBlock`, `itemPaddingInline`, `itemGap`, `headerPaddingBlock`, `headerGap`, `handleHeight`, `handleWidth`, `handleRadius`, `titleSize`, `fontFamily`, `fontSize`, `lineHeight`, `divider`, `dividerWidth`, `maxWidth`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `handle`, `itemHover`, `itemColor`, `itemDangerColor`, `titleColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (7)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: choosing-an-action-fires-on-action
  description: A row reports the chosen action; the consumer performs it and closes.
  given:
    open: true
    heading: Photo.jpg
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
    - id: delete
      label: Delete photo
      tone: danger
  when:
    click: item
  then:
  - event: onAction
- name: the-cancel-row-fires-on-close
  description: The explicit Cancel row is a dismissal, not a choice, so onAction stays
    silent.
  given:
    open: true
    heading: Photo.jpg
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
  when:
    click: cancelButton
  then:
  - event: onClose
  - event: onAction
    fired: false
- name: the-cancel-row-is-named-from-copy
  description: With no cancelLabel the cancel row falls back to copy.cancelLabel.
  given:
    open: true
    heading: Photo.jpg
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
  then:
  - copy: cancelLabel
- name: the-list-is-a-menu
  description: The actions are a menu of menuitems (APG menu button), not a list of
    buttons.
  given:
    open: true
    heading: Photo.jpg
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
  then:
  - role: menu
- name: closed-sheet-renders-nothing
  given:
    open: false
    actions:
    - id: share
      label: Share
  then:
  - renders: false
- name: renders
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
notes: 'A native Modal sheet: a View with accessibilityRole="menu" containing Pressable
  rows with accessibilityRole="menuitem" and a separate Cancel Button, drag-to-dismiss
  on the header as BottomSheet. iOS''s ActionSheetIOS is not used, so the look matches
  the theme on both platforms. There is no wide presentation on native: Menu renders
  its own trigger and cannot be anchored to an external element, so tablets above
  maxWidth get the sheet too and `maxWidth` is a no-op override here. The surface
  uses the RN >= 0.74 `role="menu"` prop with accessibilityViewIsModal; rows are `role="menuitem"`.
  Pressable has no key events, so there are no arrow keys, no Home/End and no roving
  tabindex; each row is its own accessibility focus stop reached by swipe, and Enter/Space
  are the platform''s own activation.'
```

## Guidance

## Overview

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
