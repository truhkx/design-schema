# Generate: Button as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Button.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Button.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: ButtonVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Button.test.ts`.

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
  name: Button
  category: action
  status: review
  apg: button
  anatomy:
  - container
  - label
  - leadingIcon
  - trailingIcon
  parts:
    leadingIcon:
      kind: slot
      slot:
        prop: leadingIcon
    trailingIcon:
      kind: slot
      slot:
        prop: trailingIcon
  props:
    label:
      type: string
      required: true
      description: The button's text. Also its accessible name.
      a11y: Rendered as visible text, or as aria-label / accessibilityLabel when the
        button shows only an icon.
    variant:
      type: enum
      values:
      - primary
      - secondary
      - ghost
      - danger
      default: primary
      description: Visual emphasis. One primary button per view.
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      - lg
      default: md
      description: Controls horizontal padding and font size. Touch targets never
        drop below the minimum regardless of size.
    leadingIcon:
      type: content
      description: Icon before the label. Decorative — hidden from assistive technology;
        the label carries the meaning.
    trailingIcon:
      type: content
      description: Icon after the label. Decorative, like leadingIcon.
    type:
      type: enum
      values:
      - button
      - submit
      default: button
      description: '`submit` submits the enclosing Form. Everything else is `button`.'
    expanded:
      type: boolean
      description: 'Set by a parent that the button discloses (Menu, Popover, SidePanel,
        Disclosure): aria-expanded on web, accessibilityState.expanded on native.
        Consumers rarely set it directly.'
    disabled:
      type: boolean
      default: false
      description: Prevents activation. The button stays in the tab order and is announced
        as disabled.
    accessibleName:
      type: string
      description: Overrides the accessible name when it must say more than the visible
        label ("Sort by Amount, ascending" on a header that shows "Amount"). The visible
        label must be the start of it (WCAG 2.5.3 label-in-name). Maps to aria-label
        / accessibilityLabel.
    overflowLabel:
      type: string
      description: Text used for this button when a Toolbar collapses it into its
        overflow Menu. Only Buttons collapse; other controls stay visible.
    iconOnly:
      type: boolean
      default: false
      description: Hides the visible label and shows only `leadingIcon`. `label` is
        still required and becomes the accessible name. Padding becomes equal on all
        sides (`space.sm`).
    loading:
      type: boolean
      default: false
      description: Shows a 1em ring spinner in `currentColor` in the leading icon
        slot (whether or not `leadingIcon` is set; for `iconOnly` it replaces the
        sole glyph), hides `trailingIcon`, keeps the label visible and the layout
        unchanged, and blocks repeat activation while an action is pending.
      platforms:
      - web
      - lit
      - rn
    inverse:
      type: boolean
      default: false
      description: 'The button sits on an inverse surface (Toast, Tooltip-like panels):
        `ghost` text uses color.inverse.link and hover uses color.inverse.foreground
        at 12% over the surface (the sanctioned color-mix of tokens on web/Lit; an
        alpha of the resolved color on native); the focus ring uses color.inverse.focus
        for every variant while `inverse` is true, since the ring must read against
        the inverse surface. Only `ghost` changes its fill on inverse surfaces; other
        variants keep their own fills.'
    track:
      type: string
      description: An event name sent to analytics when the button is pressed. Omit
        for no tracking.
      source: extensions/Button.analytics.md
  events:
    onPress:
      description: Fired when the button is activated by pointer, keyboard (Enter/Space),
        or assistive technology.
      platforms:
        web: onClick
        lit: press
        rn: onPress
        swiftui: action
      fires:
      - user
    onTrack:
      description: Fired after onPress with the `track` name and the button's label.
      platforms:
        web: onTrack
        lit: track
        rn: onTrack
        swiftui: onTrack
      source: extensions/Button.analytics.md
  styles:
    background:
      token: color.action.{variant}.background
      locked: true
    backgroundHover:
      token: color.action.{variant}.backgroundHover
      state: hover
      description: Pointer hover and pressed state.
      locked: false
    foreground:
      token: color.action.{variant}.foreground
      locked: true
    iconGap:
      token: space.2
      description: Gap between an icon and the label.
      locked: false
    paddingInline:
      token: space.{size}
      locked: false
    paddingBlock:
      token: space.sm
      locked: false
    radius:
      token: radius.md
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontWeight:
      token: font.weight.medium
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    inverseForeground:
      token: color.inverse.link
      description: ghost text when `inverse`.
      locked: true
    inverseFocusRing:
      token: color.inverse.focus
      description: Focus ring when `inverse`.
      locked: true
    minTarget:
      token: size.target.min
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: Applied to the whole button when disabled; colors are unchanged
        so contrast math still holds for the enabled state.
      locked: false
    transition:
      token: motion.duration.fast
      description: Background/foreground transitions on hover and press, with motion.easing.standard.
      locked: false
    loadingSpin:
      token: motion.duration.loop
      description: One rotation of the loading indicator; disabled under prefers-reduced-motion.
      locked: false
    spinnerStroke:
      token: border.width.focus
      description: 'Ring thickness of the loading spinner: a 1em circle with one quarter
        transparent, drawn in currentColor.'
      locked: true
  copy:
    loading: Loading
  a11y:
    role: button
    requires:
    - accessible-name
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    contrast:
    - foreground: color.action.{variant}.foreground
      background: color.action.{variant}.background
      level: AA
    - foreground: color.inverse.link
      background: color.inverse.surface
      level: AA
    - foreground: color.inverse.focus
      background: color.inverse.surface
      level: AA
      nonText: true
  platforms:
    web:
      element: button
      attributes:
      - type
      - aria-disabled
      - aria-busy
      - aria-label
      notes: Use aria-disabled rather than the disabled attribute so the button remains
        discoverable by keyboard and screen readers.
    lit:
      tag: ds-button
      reflect:
      - variant
      - size
      - type
      - disabled
      - icon-only
      - loading
      - inverse
      notes: Wraps a native <button> in the shadow root with delegatesFocus so the
        host element is focusable. `press` is a composed CustomEvent. Icons are named
        slots `leading-icon` / `trailing-icon`. ds-button is NOT form-associated (a
        FACE with a reflected disabled attribute becomes truly disabled and unfocusable);
        `type=submit` is handled by ds-form listening for `press`, and by `closest('form')?.requestSubmit()`
        when placed directly in a native form.
    rn:
      element: Pressable
      props:
      - accessibilityRole=button
      - accessibilityLabel
      - accessibilityState
      - hitSlop
      notes: 'No hover state on touch; backgroundHover is applied to the pressed state.
        `type: submit` calls submit() on the nearest Form context, since there is
        no native form. Forwards `accessibilityHint`, `accessibilityLabel` (when set
        by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur`
        and `onLongPress` to the native element, so Tooltip can attach to it.'
    swiftui:
      element: Button
      props:
      - action
      - .buttonStyle=custom
      - .accessibilityLabel
      - .accessibilityHint
      - .accessibilityAddTraits=isButton
      - .frame=minWidth-minHeight
      - .contentShape
      - .focusable
      - .focused
      - .onLongPressGesture
      notes: A SwiftUI `Button(action:)` with a package `ButtonStyle` (`DSButtonStyle`)
        that draws variant/size from tokens and reads `isPressed` for the pressed
        state; hover from `.onHover` on iPad pointer. `iconOnly` sets `.accessibilityLabel(label)`
        and hides the text; `accessibleName` overrides the label (and must start with
        the visible one); `loading` sets `.accessibilityValue(copy.loading)`, disables
        presses without `.disabled`, and swaps the leading icon for a `ProgressView`
        tinted from the foreground token. `disabled` is `.accessibilityRespondsToUserInteraction(false)`
        + `.opacity` + guard, keeping the button focusable per the doc. Long press
        forwards to Tooltip through `onLongPress`; `accessibilityHint` is forwarded
        verbatim. `overflowLabel` is read by Toolbar only.
  behavior:
  - name: click-fires-on-press
    when:
      click: container
    then:
    - event: onPress
  - name: enter-activates
    description: Activation fires onPress exactly once per pointer click, Enter key,
      Space key, or assistive-technology activation.
    when:
      key: Enter
    then:
    - event: onPress
    platforms:
    - web
    - lit
  - name: space-activates
    when:
      key: Space
    then:
    - event: onPress
    platforms:
    - web
    - lit
  - name: disabled-does-not-fire
    given:
      disabled: true
    when:
      click: container
    then:
    - event: onPress
      fired: false
    - state: disabled
      is: true
  - name: disabled-stays-focusable
    description: aria-disabled, not the native attribute, so the button stays in the
      tab order and can be discovered.
    given:
      disabled: true
    then:
    - focusable: true
    platforms:
    - web
    - lit
  - name: loading-announces-busy-and-ignores-activation
    description: While loading is true the button announces itself as busy and ignores
      further activation, but keeps its size so the layout does not shift.
    given:
      loading: true
    when:
      click: container
    then:
    - event: onPress
      fired: false
    - attribute: aria-busy
      is: 'true'
      platforms:
      - web
      - lit
  - name: expanded-is-reported
    given:
      expanded: true
    then:
    - state: expanded
      is: true
  - name: icon-only-keeps-its-name
    description: iconOnly hides the visible label, and label becomes the accessible
      name.
    given:
      iconOnly: true
      accessibleName: Open menu
    then:
    - name: Open menu
  - name: press-tracks
    given:
      track: signup
      label: Sign up
    when:
      click: container
    then:
    - event: onTrack
      with:
        name: signup
        label: Sign up
    source: extensions/Button.analytics.md
  examples:
  - name: primary-save
    description: The single most important action in a view, labelled with the outcome.
    given:
      label: Save changes
      variant: primary
  - name: destructive-confirm
    description: A destructive, hard-to-undo action, which is the only use of the
      danger variant.
    given:
      label: Delete file
      variant: danger
  - name: icon-only-in-a-toolbar
    description: A low-emphasis icon-only control in dense UI, whose label says what
      it does rather than what the icon depicts.
    given:
      label: Close
      iconOnly: true
      variant: ghost
      size: sm
  - name: pending-submit
    description: The submit button of a form while the request is in flight - busy,
      and ignoring repeat activation.
    given:
      label: Create account
      type: submit
      loading: true
    platforms:
    - web
    - lit
    - rn
```

## Events

- `onPress`: emit `press`
  - fires on: user

## Parts and slots

- `container`: element
- `label`: element
- `leadingIcon`: slot, `<slot name="leading-icon">`
- `trailingIcon`: slot, `<slot name="trailing-icon">`

## Style bindings

- `backgroundHover`: token `color.action.{variant}.backgroundHover`; state `hover`

## Constants and examples

- example `primary-save`, story `PrimarySave`: given `label: "Save changes"`, `variant: "primary"`; The single most important action in a view, labelled with the outcome.
- example `destructive-confirm`, story `DestructiveConfirm`: given `label: "Delete file"`, `variant: "danger"`; A destructive, hard-to-undo action, which is the only use of the danger variant.
- example `icon-only-in-a-toolbar`, story `IconOnlyInAToolbar`: given `label: "Close"`, `iconOnly: true`, `variant: "ghost"`, `size: "sm"`; A low-emphasis icon-only control in dense UI, whose label says what it does rather than what the icon depicts.
- example `pending-submit`, story `PendingSubmit`: given `label: "Create account"`, `type: "submit"`, `loading: true`; The submit button of a form while the request is in flight - busy, and ignoring repeat activation.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `backgroundHover`, `iconGap`, `paddingInline`, `paddingBlock`, `radius`, `fontFamily`, `fontWeight`, `fontSize`, `disabledOpacity`, `transition`, `loadingSpin`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `focusRing`, `focusRingWidth`, `inverseForeground`, `inverseFocusRing`, `minTarget`, `spinnerStroke`

## Behavior scenarios (21)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-fires-on-press
  when:
    click: container
  then:
  - event: onPress
- name: enter-activates
  description: Activation fires onPress exactly once per pointer click, Enter key,
    Space key, or assistive-technology activation.
  when:
    key: Enter
  then:
  - event: onPress
  platforms:
  - web
  - lit
- name: space-activates
  when:
    key: Space
  then:
  - event: onPress
  platforms:
  - web
  - lit
- name: disabled-does-not-fire
  given:
    disabled: true
  when:
    click: container
  then:
  - event: onPress
    fired: false
  - state: disabled
    is: true
- name: disabled-stays-focusable
  description: aria-disabled, not the native attribute, so the button stays in the
    tab order and can be discovered.
  given:
    disabled: true
  then:
  - focusable: true
  platforms:
  - web
  - lit
- name: loading-announces-busy-and-ignores-activation
  description: While loading is true the button announces itself as busy and ignores
    further activation, but keeps its size so the layout does not shift.
  given:
    loading: true
  when:
    click: container
  then:
  - event: onPress
    fired: false
  - attribute: aria-busy
    is: 'true'
- name: expanded-is-reported
  given:
    expanded: true
  then:
  - state: expanded
    is: true
- name: icon-only-keeps-its-name
  description: iconOnly hides the visible label, and label becomes the accessible
    name.
  given:
    iconOnly: true
    accessibleName: Open menu
  then:
  - name: Open menu
- name: press-tracks
  given:
    track: signup
    label: Sign up
  when:
    click: container
  then:
  - event: onTrack
    with:
      name: signup
      label: Sign up
  source: extensions/Button.analytics.md
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-variant-primary
  given:
    variant: primary
  then:
  - renders: true
  derived: true
- name: renders-variant-secondary
  given:
    variant: secondary
  then:
  - renders: true
  derived: true
- name: renders-variant-ghost
  given:
    variant: ghost
  then:
  - renders: true
  derived: true
- name: renders-variant-danger
  given:
    variant: danger
  then:
  - renders: true
  derived: true
- name: renders-size-sm
  given:
    size: sm
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-size-lg
  given:
    size: lg
  then:
  - renders: true
  derived: true
- name: renders-type-button
  given:
    type: button
  then:
  - renders: true
  derived: true
- name: renders-type-submit
  given:
    type: submit
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: control-is-focusable
  then:
  - focusable: true
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-button
reflect:
- variant
- size
- type
- disabled
- icon-only
- loading
- inverse
notes: Wraps a native <button> in the shadow root with delegatesFocus so the host
  element is focusable. `press` is a composed CustomEvent. Icons are named slots `leading-icon`
  / `trailing-icon`. ds-button is NOT form-associated (a FACE with a reflected disabled
  attribute becomes truly disabled and unfocusable); `type=submit` is handled by ds-form
  listening for `press`, and by `closest('form')?.requestSubmit()` when placed directly
  in a native form.
```

## Guidance

## Overview

Buttons let people take actions and make choices with a single tap or click. They communicate what will happen through their label, and their emphasis through their variant.

## When to use

Use a Button when the user needs to **do something**: submit, save, confirm, open, add, delete. The label should be a verb or verb phrase that describes the outcome ("Save changes", not "OK").

Use the `primary` variant for the single most important action in a view. Use `secondary` for the alternatives beside it, `ghost` for low-emphasis actions in dense UI such as toolbars, and `danger` only for destructive, hard-to-undo actions.

## When not to use

Do not use a Button to **navigate** to another page or screen; use a Link (or a Link styled as a button) so the destination is exposed to assistive technology and works with open-in-new-tab. Do not use more than one `primary` button in the same region — if everything is emphasized, nothing is. Do not use `disabled` to communicate *why* an action is unavailable; prefer keeping the button enabled and explaining the problem on activation, or show the reason inline.

## Behavior

Activation fires `onPress` exactly once per pointer click, Enter key, Space key, or assistive-technology activation. While `loading` is true the button announces itself as busy and ignores further activation, but keeps its size so the layout does not shift. `disabled` buttons remain focusable so that keyboard and screen-reader users can discover them; they are announced as "dimmed" or "disabled" and do not fire `onPress`.

## Content guidelines

Labels are sentence case, one to three words, and start with a verb. Avoid "Yes"/"No"; restate the action ("Delete file" / "Keep file"). Icon-only buttons must set `label` to what the button does, not what the icon depicts ("Close", not "X").

## Accessibility

Every button must have an accessible name (WCAG 4.1.2). The name comes from the visible label or, for `iconOnly`, from the `label` prop rendered as `aria-label` / `accessibilityLabel`. Focus must be visible (WCAG 2.4.7 and 2.4.11): the focus ring uses `color.border.focus` at `border.width.focus` and is never removed without a replacement. The interactive target is at least 24×24 CSS px (WCAG 2.5.8, AA) at every `size`, and 44×44 on touch platforms following iOS and Android guidelines. Text and background pairs for every variant meet 4.5:1 (WCAG 1.4.3) in both light and dark themes — the build checks this against the tokens. Buttons are activated with Enter and Space, and never rely on hover alone to convey state.

## Platform notes

### Web
Render a native `<button>` with `type` from the prop (default `button`, so a button inside a form never submits by accident). Use `aria-disabled="true"` for the disabled state; the button stays in the tab order. Set `aria-busy="true"` while loading.

### Lit
The host element `<ds-button>` reflects `variant`, `size`, `disabled`, `icon-only` and `loading` as attributes so consumers can style states from outside the shadow root. The inner element is a real `<button>`; the shadow root is created with `delegatesFocus: true`. Activation dispatches a composed, bubbling `press` CustomEvent. Consumers can also listen to the native `click` that bubbles out of the shadow root.

### React Native
Render a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel={label}` and `accessibilityState={{ disabled, busy: loading }}`. There is no CSS cascade, so every style binding is applied explicitly from the token object. Because there is no hover on touch, `backgroundHover` is used for the pressed state. Icons passed as `leadingIcon`/`trailingIcon` are rendered as given: there is no cascade, so Button cannot recolor them, and callers color glyphs with the variant's foreground themselves until an Icon component exists. When the visual footprint is smaller than 44px, add `hitSlop` to reach the comfortable target size.

## Related

Form, Link (planned), IconButton (planned), ButtonGroup (planned).

## Extensions

The schema above already includes what these extensions add (items marked `source: extensions/...`). Implement them like any other prop, event, binding, copy string, keyboard rule or scenario.

### analytics — `extensions/Button.analytics.md`

Product analytics needs to know which buttons people press, without every screen wiring its own handler and without the generated Button knowing which analytics vendor is in use. `track` names the event; when it is set, a press calls the hand-written `trackPress` module with the event name and the button's visible label, then fires `onTrack` with the same pair so a screen can react (a toast, a redirect) without touching analytics itself.

The module is the seam. `packages/<platform>/src/custom/analytics.ts` is owned by the adopter: in development it logs the pair to the console; in production it is a no-op until someone points it at a vendor SDK. The generated component imports `trackPress` from `./custom/analytics` and calls it exactly once per press, after `onPress` and before `onTrack`, only when `track` is set. It never reads or rewrites the module body, and a press with no `track` is exactly the upstream Button.

**Hand-written modules** — import and call them exactly as stated; never create, edit or copy anything under `src/custom/`:

- `import { trackPress } from './custom/analytics.js';` — signature `(name: string, label: string) => void`. Called from onPress when `track` is set, before onTrack fires.
