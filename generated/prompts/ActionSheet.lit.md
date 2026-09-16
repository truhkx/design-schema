# Generate: ActionSheet as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/ActionSheet.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `ActionSheet.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: ActionSheetVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `ActionSheet.test.ts`.

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
        Escape still reports through onClose when false, as in Dialog.
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
    action: Closes and moves focus on (a menu is not a tab stop container).
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
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
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
        to the element that was focused when `open` became true. Roving tabindex over
        the items; first item focused on open.'
    lit:
      tag: ds-action-sheet
      reflect:
      - open
      notes: '`actions` is a property. Composed `action` (detail { id }) and `close`
        (detail { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet;
        the wide presentation renders <ds-menu>.'
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
        used, so the look matches the theme on both platforms. On tablets above maxWidth,
        presents as Menu. The surface uses the RN >= 0.74 `role="menu"` prop with
        accessibilityViewIsModal; rows are `role="menuitem"`. Arrow keys do not exist
        on native; each row is its own focus stop.'
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

- `onAction`: emit `action`
  - payload, the keys of `CustomEvent.detail`: `id: string`
  - fires on: user
  - timing: request
- `onClose`: emit `close`
  - payload, the keys of `CustomEvent.detail`: `reason: 'escape' | 'scrim' | 'cancel' | 'drag'`
  - reasons: `escape` (Escape pressed while open); `scrim` (the scrim was clicked); `cancel` (the cancel action was chosen); `drag` (the sheet was dragged past the dismiss threshold)
  - fires on: user
  - timing: request

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onClose` (emit `close`); drives state `open`

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `itemPaddingBlock`: token `space.sm`; part `item`
- `itemPaddingInline`: token `layout.inset.md`; part `item`
- `itemGap`: token `layout.gap.normal`; part `item`
- `headerPaddingBlock`: token `space.sm`; part `header`
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

`overlay.closeEvent` emits `close`.

## Constants and examples

- constant `dismissDistance`: 0.25 ratio
- constant `dismissVelocity`: 1.5 px/ms
- example `photo-actions`, story `PhotoActions`: given `open: true`, `heading: "Photo.jpg"`, `actions: [{"id":"share","label":"Share","icon":"external"},{"id":"rename","label":"Rename"},{"id":"duplicate","label":"Duplicate"},{"id":"delete","label":"Delete photo","icon":"danger","tone":"danger"}]`; Contextual actions on an item, with the destructive one last.
- example `unnamed-sheet`, story `UnnamedSheet`: given `open: true`, `actions: [{"id":"copy","label":"Copy link"},{"id":"open","label":"Open in new tab"}]`; A sheet with no heading, named by copy.defaultLabel for assistive technology.
- example `with-an-unavailable-action`, story `WithAnUnavailableAction`: given `open: true`, `heading: "Invoice 4821"`, `cancelLabel: "Not now"`, `actions: [{"id":"download","label":"Download"},{"id":"void","label":"Void invoice","tone":"danger","disabled":true}]`; An action that is shown but cannot be used here, announced as disabled rather than hidden.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `radius`, `itemPaddingBlock`, `itemPaddingInline`, `itemGap`, `headerPaddingBlock`, `titleSize`, `fontFamily`, `fontSize`, `lineHeight`, `divider`, `dividerWidth`, `maxWidth`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `itemHover`, `itemColor`, `itemDangerColor`, `titleColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (9)

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
- name: escape-fires-on-close
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onClose
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-action-sheet
reflect:
- open
notes: '`actions` is a property. Composed `action` (detail { id }) and `close` (detail
  { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet; the
  wide presentation renders <ds-menu>.'
```

## Guidance

## Overview

An action sheet answers "what can I do with this?" — the long-press or overflow menu of mobile. It lists a handful of verbs, groups the dangerous one at the bottom, and adds an explicit Cancel because thumbs miss. On wide screens the same list is a Menu next to what was clicked.

## When to use

Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits without scrolling; more than eight actions means the item needs its own screen. Put destructive actions last with `tone: danger`.

## When not to use

Do not use it for navigation (Menu in a nav Landmark, or Links), for settings with state (a screen of Switches), for choosing a value (Select or RadioGroup in a BottomSheet), or for confirming — an ActionSheet's danger row opens an AlertDialog, it does not itself confirm. Do not put forms in it.

## Behavior

Opening presents the list with focus on the first action; arrow keys move between actions, Enter or Space chooses and fires `onAction(id)`, Escape, the scrim, the Cancel row, or a drag close it with `onClose`. Disabled actions are shown, skipped by arrow navigation, and announced as disabled. On wide screens the sheet becomes a Menu anchored to the opener: same actions, same events, no Cancel row (clicking outside closes). Focus returns to the opener on close in both presentations. On phones the sheet has BottomSheet''s handle and header, and the drag-to-dismiss gesture lives on them (the same 25% / 1.5 px/ms rule). Above the breakpoint it renders Menu with `anchor` set to the element that was focused when `open` became true (Menu renders no trigger in that mode), and maps Menu''s onOpenChange reasons to its own: `escape` → escape, `outside` → scrim, `action` → nothing (onAction fires instead).

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
`Modal` sheet with `View accessibilityRole="menu"` of `Pressable accessibilityRole="menuitem"` rows (`accessibilityState={{ disabled }}`), a divider and a Cancel `Button`; drag-to-dismiss on the header via `PanResponder`; `onRequestClose` → `onClose('escape')`. On tablets above the breakpoint, `Menu`.

## Related

BottomSheet, Menu, Button, AlertDialog.
