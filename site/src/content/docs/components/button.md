---
title: Button
description: Triggers an action or event, such as submitting a form, opening a dialog, or confirming a choice.
component:
  name: Button
  category: action
  status: review
  apg: button
  anatomy: [container, label, leadingIcon, trailingIcon]
  parts:
    leadingIcon: { kind: slot, slot: { prop: leadingIcon } }
    trailingIcon: { kind: slot, slot: { prop: trailingIcon } }
  props:
    label:
      type: string
      required: true
      description: The button's text. Also its accessible name.
      a11y: Rendered as visible text, or as aria-label / accessibilityLabel when the button shows only an icon.
    variant:
      type: enum
      values: [primary, secondary, ghost, danger]
      default: primary
      description: 'Visual emphasis. One primary button per view. These four are the whole set: there is no `outline` variant, and a bordered low-fill emphasis would be a new value here with its own colour pair and its own contrast proof, never an alias for `secondary`.'
    size:
      type: enum
      enumRef: size
      values: [sm, md, lg]
      default: md
      description: Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size.
    leadingIcon:
      type: content
      description: Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning.
    trailingIcon:
      type: content
      description: Icon after the label. Decorative, like leadingIcon.
    type:
      type: enum
      values: [button, submit]
      default: button
      description: '`submit` submits the enclosing Form. Everything else is `button`.'
    expanded:
      type: boolean
      description: 'Set by a parent that the button discloses (Menu, Popover, SidePanel, Disclosure): aria-expanded on web, accessibilityState.expanded on native. Consumers rarely set it directly. No default, and tri-state on every platform: undefined means the button discloses nothing, so no expanded state is reported at all (no aria-expanded on the container; `expanded` omitted from accessibilityState), never a false one.'
    disabled:
      type: boolean
      default: false
      description: 'Prevents activation. The button stays in the tab order and is announced as disabled. A press blocked by `disabled` or `loading` is not a press: onPress does not fire and nothing chained from it (an extension''s tracking) runs. Inside a disabled Form the button is disabled whatever this prop says: on web and rn Button reads `disabled` from the Form context and ORs it with this prop; on Lit ds-form sets `.disabled` on the ds-buttons it finds, so ds-button has no mechanism of its own.'
    accessibleName:
      type: string
      description: 'Overrides the accessible name when it must say more than the visible label ("Sort by Amount, ascending" on a header that shows "Amount"). The name must contain the visible label (WCAG 2.5.3 label-in-name); starting with it is preferred but not required. Maps to aria-label / accessibilityLabel.'
    overflowLabel:
      type: string
      description: 'Text used for this button when a Toolbar collapses it into its overflow Menu. Only Buttons collapse; other controls stay visible. Button itself never renders it: on web Toolbar reads it from the Button element''s props (it never reaches the DOM); on Lit it is the plain `overflow-label` attribute on ds-button, which Toolbar reads from the host.'
    iconOnly:
      type: boolean
      default: false
      description: Hides the visible label and shows only `leadingIcon`; `trailingIcon` is not rendered either. `label` is still required and becomes the accessible name. Padding becomes equal on all sides (`space.sm`).
    loading:
      type: boolean
      default: false
      description: 'Shows a ring spinner (spinnerSize across, spinnerStroke thick, in the resolved foreground: `currentColor` on web/Lit) in the leading icon slot (whether or not `leadingIcon` is set; for `iconOnly` it replaces the sole glyph), hides `trailingIcon`, keeps the label visible and the button''s height unchanged, and blocks repeat activation while an action is pending. With a `leadingIcon` the spinner swaps in at the same width; without one the spinner and iconGap widen the button, a shift that is accepted. The spinner is not an anatomy part and carries no part name; it only takes the leadingIcon position, so no leadingIcon part is present while loading. `copy.loading` is announced as a description, never as part of the name, so it survives aria-label: web and Lit render it in a visually hidden node inside the button''s own tree referenced by aria-describedby (web merges it with any caller aria-describedby; on Lit only the internal id is referenced, since a caller''s aria-describedby on the host cannot cross the shadow root); rn sets `accessibilityValue={{ text: copy.loading }}` beside `busy`; SwiftUI uses `.accessibilityValue`.'
      platforms: [web, lit, rn]
    inverse:
      type: boolean
      default: false
      description: 'The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost` text uses color.inverse.link and hover uses inverseBackgroundHover at inverseHoverOpacity over the surface (the sanctioned color-mix of tokens on web/Lit; an alpha of the resolved color on native); the focus ring uses color.inverse.focus for every variant while `inverse` is true, since the ring must read against the inverse surface. Only `ghost` changes its fill on inverse surfaces; other variants keep their own fills, which need no pair against color.inverse.surface: their text is proven against their own fill, and the label, not the fill edge, identifies the control.'
  events:
    onPress:
      description: 'Fired when the button is activated by pointer, keyboard (Enter/Space), or assistive technology. No payload: pointer position and modifiers are not part of the contract, so the rn handler takes no arguments (the GestureResponderEvent is not passed). Web is the exception by name: `onClick` keeps React''s native signature and receives the MouseEvent unchanged, so a composing parent (a Menu or Popover trigger) chains its handler as on any button; Lit `press` has no detail.'
      platforms: { web: onClick, lit: press, rn: onPress, swiftui: action }
      fires: [user]
  styles:
    background: { token: 'color.action.{variant}.background' }
    backgroundHover: { token: 'color.action.{variant}.backgroundHover', state: hover, locked: true, description: 'Pointer hover and pressed state (`:hover` and `:active` on web and Lit; pressed on rn). Locked like background and foreground, so an override cannot put an unproven fill behind the locked foreground.' }
    foreground: { token: 'color.action.{variant}.foreground' }
    iconGap: { token: space.2, description: 'Gap between an icon and the label.' }
    paddingInline: { token: 'space.{size}' }
    paddingBlock: { token: space.sm }
    radius: { token: radius.md }
    fontFamily: { token: font.family.body }
    fontWeight: { token: font.weight.medium }
    fontSize: { token: 'font.size.{size}' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    inverseForeground: { token: color.inverse.link, description: 'ghost text when `inverse`.' }
    inverseFocusRing: { token: color.inverse.focus, description: 'Focus ring when `inverse`.' }
    inverseBackgroundHover: { token: color.inverse.foreground, state: hover, description: 'ghost hover and pressed fill when `inverse`: this color at inverseHoverOpacity over color.inverse.surface.' }
    inverseHoverOpacity: { token: opacity.disabled, computed: { times: 0.25 }, state: hover, description: 'The alpha of inverseBackgroundHover: color-mix percentage on web/Lit (`calc(var(--ds-button-inverse-hover-opacity) * 0.25 * 100%)`), the alpha of the resolved color on native. The ×0.25 applies to whatever token the binding resolves to, an override included: the hook holds the base token and the rule that reads it multiplies.' }
    minTarget: { token: size.target.min, description: 'min-width and min-height of the button on every platform. Web and Lit apply only this floor; there is no coarse-pointer rule.' }
    touchTarget: { token: size.target.comfortable, platforms: [rn, swiftui], description: 'The hit area on touch platforms, reached without changing the visual size: hitSlop on rn, .contentShape on SwiftUI.' }
    disabledOpacity: { token: opacity.disabled, description: 'Applied to the whole button when disabled; colors are unchanged so contrast math still holds for the enabled state.' }
    transition: { token: motion.duration.fast, description: 'Background transitions on hover and press, with motion.easing.standard. No variant changes its foreground between states, so only the background animates.' }
    loadingSpin: { token: motion.duration.loop, description: 'One rotation of the loading indicator, at linear easing (a continuous spin; motion.easing.standard is for `transition` only); disabled under prefers-reduced-motion.' }
    spinnerSize: { token: 'font.size.{size}', description: 'Diameter of the loading ring: 1em of the label font. On rn, which has no em, the ring is this size and its radius is half of it. Its own binding: a fontSize override does not move it, and a consumer who changes one overrides both.' }
    spinnerStroke: { token: border.width.focus, description: 'Ring thickness of the loading spinner: a spinnerSize circle with one quarter transparent, drawn in currentColor (the resolved foreground binding on rn). Locked because border.width.focus is a focus token: it keeps its `--ds-button-spinner-stroke` hook but is not a member of the overrides type.' }
  copy:
    loading: Loading
  a11y:
    role: button
    requires: [accessible-name, focus-visible, keyboard-operable, target-24px, contrast-aa]
    contrast:
      - { foreground: 'color.action.{variant}.foreground', background: 'color.action.{variant}.background', level: AA }
      - { foreground: color.inverse.link, background: color.inverse.surface, level: AA }
      - { foreground: color.inverse.focus, background: color.inverse.surface, level: AA, nonText: true }
  platforms:
    web:
      element: button
      attributes: [type, aria-disabled, aria-busy, aria-label]
      notes: 'Use aria-disabled rather than the disabled attribute so the button remains discoverable by keyboard and screen readers. `expanded` is a React prop mapped to aria-expanded; when it is undefined, an `aria-expanded` arriving through `...rest` still applies, which is how Menu, Popover, Disclosure, SidePanel, Combobox and Search already set it. `ButtonProps` omits `className` and `style` from the native button props, so passing either is a type error rather than a silent drop: `overrides` is the only per-instance styling.'
    lit:
      tag: ds-button
      reflect: [variant, size, type, disabled, icon-only, loading, inverse, overflow-label]
      notes: 'Wraps a native <button> in the shadow root with delegatesFocus so the host element is focusable. `press` is a composed CustomEvent. Icons are named slots `leading-icon` / `trailing-icon`; the part names stay the anatomy names verbatim (`part="leadingIcon"`, `part="trailingIcon"`), so slot names are kebab-case and part names camelCase. The slots are not aria-hidden (aria-hidden on a <slot> is unreliable): a ds-icon with no label hides itself, which is what makes the icons decorative. Locked bindings get no `--ds-button-*` hook (the rule reads the token directly, per the overrides contract); spinnerStroke is the one exception its binding names. A blocked activation (disabled or loading) is swallowed on the inner button with preventDefault() and stopPropagation(): neither `press` nor the native click leaves the host, and no form submits. ds-button is NOT form-associated (a FACE with a reflected disabled attribute becomes truly disabled and unfocusable); `type=submit` is handled by ds-form listening for `press`, and by `closest(''form'')?.requestSubmit()` only when no ds-form encloses the button, so a ds-form nested in a native form submits once. `expanded` is a JS property only (`attribute: false`) and stays tri-state — undefined means the button discloses nothing, so no aria-expanded is set at all. A disclosing parent sets `.expanded=`; a raw `aria-expanded` attribute on the host does not reach the inner button.'
    rn:
      element: Pressable
      props: [accessibilityRole=button, accessibilityLabel, accessibilityState, hitSlop]
      notes: 'No hover state on touch; backgroundHover is applied to the pressed state. `type: submit` calls submit() on the nearest Form context, since there is no native form. Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur`, `onLongPress` and `onPressOut` (chained with Button''s own pressed-state tracking) to the native element, so Tooltip can attach to it. The accessibilityLabel is `accessibleName ?? accessibilityLabel ?? label`. Button exposes its root Pressable as `ref` so a parent (Tooltip, Toolbar) can measure and focus it. `disabled` is never passed to Pressable, which would drop it from the focus order: it is a press guard plus `accessibilityState.disabled`, so a hardware-keyboard user can still focus it and the press is swallowed, as on web.'
    swiftui:
      element: Button
      props: [action, .buttonStyle=custom, .accessibilityLabel, .accessibilityHint, .accessibilityAddTraits=isButton, .frame=minWidth-minHeight, .contentShape, .focusable, .focused, .onLongPressGesture]
      notes: 'A SwiftUI `Button(action:)` with a package `ButtonStyle` (`DSButtonStyle`) that draws variant/size from tokens and reads `isPressed` for the pressed state; hover from `.onHover` on iPad pointer. `iconOnly` sets `.accessibilityLabel(label)` and hides the text; `accessibleName` overrides the label (and must contain the visible one); `loading` sets `.accessibilityValue(copy.loading)`, disables presses without `.disabled`, and swaps the leading icon for a `ProgressView` tinted from the foreground token. `disabled` is `.accessibilityRespondsToUserInteraction(false)` + `.opacity` + guard, keeping the button focusable per the doc. Long press forwards to Tooltip through `onLongPress`; `accessibilityHint` is forwarded verbatim. `overflowLabel` is read by Toolbar only.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/focusable ones from the schema.
    - name: click-fires-on-press
      when: { click: container }
      then:
        - { event: onPress }
    - name: enter-activates
      description: 'Activation fires onPress exactly once per pointer click, Enter key, Space key, or assistive-technology activation. Native: the <button> synthesises the click, so no key handling is written.'
      when: { key: Enter }
      then:
        - { event: onPress }
      platforms: [web, lit]
    - name: space-activates
      description: 'Native: the <button> synthesises the click from Space, so no key handling is written.'
      when: { key: Space }
      then:
        - { event: onPress }
      platforms: [web, lit]
    - name: disabled-does-not-fire
      given: { disabled: true }
      when: { click: container }
      then:
        - { event: onPress, fired: false }
        - { state: disabled, is: true }
    - name: disabled-stays-focusable
      description: aria-disabled, not the native attribute, so the button stays in the tab order and can be discovered.
      given: { disabled: true }
      then:
        - { focusable: true }
      platforms: [web, lit]
    - name: loading-announces-busy-and-ignores-activation
      description: 'While loading is true the button announces itself as busy and ignores further activation, but keeps its height and its label in view.'
      given: { loading: true }
      when: { click: container }
      then:
        - { event: onPress, fired: false }
        - { attribute: aria-busy, is: 'true', platforms: [web, lit] }
    - name: expanded-is-reported
      given: { expanded: true }
      then:
        - { state: expanded, is: true }
    - name: icon-only-keeps-its-name
      description: iconOnly hides the visible label, and label becomes the accessible name.
      given: { iconOnly: true, accessibleName: 'Open menu' }
      then:
        - { name: 'Open menu' }
  examples:
    - name: primary-save
      description: The single most important action in a view, labelled with the outcome.
      given: { label: 'Save changes', variant: primary }
    - name: destructive-confirm
      description: A destructive, hard-to-undo action, which is the only use of the danger variant.
      given: { label: 'Delete file', variant: danger }
    - name: icon-only-in-a-toolbar
      description: A low-emphasis icon-only control in dense UI, whose label says what it does rather than what the icon depicts.
      given: { label: Close, iconOnly: true, leadingIcon: 'Icon name=close', variant: ghost, size: sm }
    - name: pending-submit
      description: The submit button of a form while the request is in flight - busy, and ignoring repeat activation.
      given: { label: 'Create account', type: submit, loading: true }
      platforms: [web, lit, rn]
---

Buttons let people take actions and make choices with a single tap or click. They communicate what will happen through their label, and their emphasis through their variant.

## When to use

Use a Button when the user needs to **do something**: submit, save, confirm, open, add, delete. The label should be a verb or verb phrase that describes the outcome ("Save changes", not "OK").

Use the `primary` variant for the single most important action in a view. Use `secondary` for the alternatives beside it, `ghost` for low-emphasis actions in dense UI such as toolbars, and `danger` only for destructive, hard-to-undo actions.

## When not to use

Do not use a Button to **navigate** to another page or screen; use a Link, so the destination is exposed to assistive technology and works with open-in-new-tab. Button has no `href` and never renders an anchor. A navigation that wants a button's visual weight — a landing page's call to action — is today a plain Link: giving it that weight would be an appearance prop on Link's own schema, and it is never page CSS restating Button's fill, which would drift from the component at the first token change. Do not use more than one `primary` button in the same region — if everything is emphasized, nothing is. Do not use `disabled` to communicate *why* an action is unavailable; prefer keeping the button enabled and explaining the problem on activation, or show the reason inline.

## Behavior

Activation fires `onPress` exactly once per pointer click, Enter key, Space key, or assistive-technology activation. While `loading` is true the button announces itself as busy and ignores further activation, but keeps its height and its label in view (see `loading` for the one width change). `disabled` buttons remain focusable so that keyboard and screen-reader users can discover them; they are announced as "dimmed" or "disabled" and do not fire `onPress`.

## Content guidelines

Labels are sentence case, one to three words, and start with a verb. Avoid "Yes"/"No"; restate the action ("Delete file" / "Keep file"). Icon-only buttons must set `label` to what the button does, not what the icon depicts ("Close", not "X").

## Accessibility

Every button must have an accessible name (WCAG 4.1.2). The name comes from the visible label or, for `iconOnly`, from the `label` prop rendered as `aria-label` / `accessibilityLabel`. Focus must be visible (WCAG 2.4.7 and 2.4.11): the focus ring uses `color.border.focus` at `border.width.focus` and is never removed without a replacement. The interactive target is at least 24×24 CSS px (WCAG 2.5.8, AA) at every `size`, and 44×44 on touch platforms following iOS and Android guidelines. Text and background pairs for every variant meet 4.5:1 (WCAG 1.4.3) in both light and dark themes — the build checks this against the tokens. Buttons are activated with Enter and Space, and never rely on hover alone to convey state.

## Platform notes

### Web
Render a native `<button>` with `type` from the prop (default `button`, so a button inside a form never submits by accident). Use `aria-disabled="true"` for the disabled state; the button stays in the tab order. Set `aria-busy="true"` while loading.

### Lit
The host element `<ds-button>` reflects `variant`, `size`, `disabled`, `icon-only` and `loading` as attributes so consumers can style states from outside the shadow root. The inner element is a real `<button>`; the shadow root is created with `delegatesFocus: true`. Activation dispatches a composed, bubbling `press` CustomEvent. Consumers can also listen to the native `click` that bubbles out of the shadow root; a click blocked by `disabled` or `loading` never leaves it.

### React Native
Render a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel={label}` and `accessibilityState={{ disabled, busy: loading }}`. There is no CSS cascade, so every style binding is applied explicitly from the token object. Because there is no hover on touch, `backgroundHover` is used for the pressed state. Icons passed as `leadingIcon`/`trailingIcon` are the system `Icon` and are rendered as given: there is no cascade, so Button cannot recolor them, and callers pass the variant's foreground to the Icon's own `color` prop (native Icon's first color source). When the visual footprint is smaller than 44px, add `hitSlop` to reach the comfortable target size.

## Related

Form, Link, Icon, Toolbar, ButtonGroup (planned).
