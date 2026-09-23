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
      a11yRole: accessible-name
      required: true
      description: 'The button''s text. Also its accessible name. An empty string is allowed and warns on no platform, like Lit''s initial `''''` and an `iconOnly` button with no icon: it renders a nameless button, and nothing enforces WCAG 4.1.2 at runtime.'
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
      description: 'Set by a parent that the button discloses (Menu, Popover, SidePanel, Disclosure): aria-expanded on web, accessibilityState.expanded on native. Consumers rarely set it directly. No default, and tri-state on every platform: undefined means the button discloses nothing, so no expanded state is reported at all (no aria-expanded on the container; `expanded` omitted from accessibilityState), never a false one. When the prop is set and an `aria-expanded` also arrives through `...rest`, the prop wins.'
    haspopup:
      type: enum
      values: [menu, listbox, tree, grid, dialog]
      description: 'Set by a parent whose popup the button opens (Menu''s trigger takes `menu`): `aria-haspopup` on the element that carries the button role, so on Lit it reaches the inner <button> the way `expanded` does, where a raw attribute on the host would not. No default: omitted means the button opens nothing and no aria-haspopup is written. The values are ARIA''s own, without `true` (which means `menu`). When the prop is set and an `aria-haspopup` also arrives through `...rest` on web, the prop wins. Web and Lit only: native has no has-popup state, and the popup''s own role carries the relationship there.'
      platforms: [web, lit]
    disabled:
      type: boolean
      default: false
      description: 'Prevents activation. The button stays in the tab order and is announced as disabled. A press blocked by `disabled` or `loading` is not a press: onPress does not fire and nothing chained from it (an extension''s tracking) runs. Inside a disabled Form the button is disabled whatever this prop says: on web and rn Button reads `disabled` from the Form context and ORs it with this prop; on Lit ds-form sets `.disabled` on the ds-buttons it finds, so ds-button has no mechanism of its own.'
    accessibleName:
      type: string
      description: 'Overrides the accessible name when it must say more than the visible label ("Sort by Amount, ascending" on a header that shows "Amount"). It wins over `label` everywhere, `iconOnly` included, where it replaces the label as the aria-label rather than being appended to it. The name must contain the visible label (WCAG 2.5.3 label-in-name); starting with it is preferred but not required, and no development warning checks it. Maps to aria-label / accessibilityLabel.'
    overflowLabel:
      type: string
      description: 'Text used for this button when a Toolbar collapses it into its overflow Menu. Only Buttons collapse; other controls stay visible. Button itself never renders it: on web and React Native Toolbar reads it from the Button element''s props (it never reaches the DOM or the Pressable); on Lit it is the plain `overflow-label` attribute on ds-button, which Toolbar reads from the host.'
    iconOnly:
      type: boolean
      default: false
      description: 'Hides the visible label and shows only `leadingIcon`; `trailingIcon` is not rendered either. `label` is still required and becomes the accessible name. Padding becomes equal on all sides: paddingInline takes the resolved paddingBlock (`space.sm` at its default), so a paddingBlock override keeps the sides equal and a paddingInline override has no effect while `iconOnly`. That also flattens the size ramp — an `iconOnly` sm and lg button differ in font and spinner size, not in padding — which is intended, since a square target should not stretch with its glyph. An `iconOnly` button with no `leadingIcon` is allowed and renders only its accessible name, with no development warning. The `label` part is not rendered at all while `iconOnly` — no visually hidden node either, since the name moves to aria-label — so this is the one place a prop removes an anatomy part, and a part selector or an `overrides` entry targeting `label` finds nothing.'
    loading:
      type: boolean
      default: false
      description: 'Shows a ring spinner (spinnerSize across, spinnerStroke thick, in the resolved foreground: `currentColor` on web/Lit) in the leading icon slot (whether or not `leadingIcon` is set; for `iconOnly` it replaces the sole glyph), hides `trailingIcon`, keeps the label visible and the button''s height unchanged, and blocks repeat activation while an action is pending. With a `leadingIcon` the spinner swaps in at the same width, which holds exactly when that icon renders at the label''s font size (the spinner is sized from `spinnerSize` alone, never from the icon it replaces); without one the spinner and iconGap widen the button, a shift that is accepted. `disabled` and `loading` may both be true: the button reports both states (aria-disabled and aria-busy) and the disabled dim applies while the spinner keeps turning. The spinner is not an anatomy part and carries no part name; it only takes the leadingIcon position, so no leadingIcon part is present while loading. `copy.loading` is announced as a description, never as part of the name, so it survives aria-label: web and Lit render it in a visually hidden, `aria-hidden` node inside the button''s own tree referenced by aria-describedby (a description still resolves from a hidden node, and the virtual cursor does not read it a second time) (web merges it with any caller aria-describedby; on Lit only the internal id is referenced, since a caller''s aria-describedby on the host cannot cross the shadow root); rn sets `accessibilityValue={{ text: copy.loading }}` beside `busy`, which react-native-web ignores (and aria-valuetext is not allowed on a button), so a react-native-web preview exposes only aria-busy and adds nothing else; SwiftUI uses `.accessibilityValue`.'
      platforms: [web, lit, rn]
    inverse:
      type: boolean
      default: false
      description: 'The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost` text uses color.inverse.link and hover uses inverseBackgroundHover at inverseHoverOpacity over the surface (the sanctioned color-mix of tokens on web/Lit; an alpha of the resolved color on native); the focus ring uses color.inverse.focus for every variant while `inverse` is true, since the ring must read against the inverse surface — `focusRingOffset` puts it clear of the button''s own fill, so it is proven against color.inverse.surface and needs no pair against each variant''s background. Only `ghost` changes its fill on inverse surfaces; other variants keep their own fills, which need no pair against color.inverse.surface: their text is proven against their own fill, and the label, not the fill edge, identifies the control.'
  events:
    onPress:
      description: 'Fired when the button is activated by pointer, keyboard (Enter/Space), or assistive technology. No payload: pointer position and modifiers are not part of the contract, so the rn handler takes no arguments (the GestureResponderEvent is not passed). Web is the exception by name: `onClick` keeps React''s native signature and receives the MouseEvent unchanged, so a composing parent (a Menu or Popover trigger) chains its handler as on any button; Lit `press` has no detail.'
      platforms: { web: onClick, lit: press, rn: onPress, swiftui: action }
      fires: [user]
  styles:
    background: { token: 'color.action.{variant}.background' }
    backgroundHover: { token: 'color.action.{variant}.backgroundHover', state: hover, locked: true, description: 'Pointer hover and pressed state (`:hover` and `:active` on web and Lit; pressed on rn, which does not read the Pressable `hovered` state, so a react-native-web mouse hover leaves the fill alone). The declared `state: hover` names the token slot; the rule applies the value to `:is(:hover, :active)`, as the two read as one pressed-or-pointed state here. Never applied while `disabled` or `loading`, since neither accepts a press; the same holds for inverseBackgroundHover. Web and Lit suppress it by selector — `:not([aria-disabled=''true'']):not([aria-busy=''true''])` — so an `aria-busy` a caller passes through `...rest` also suppresses the fill, which is right: a busy button is not accepting presses either. Locked like background and foreground, so an override cannot put an unproven fill behind the locked foreground.' }
    foreground: { token: 'color.action.{variant}.foreground' }
    iconGap: { token: space.2, description: 'Gap between an icon and the label. Deliberately a step of the numeric scale rather than the t-shirt ramp the paddings use: the gap between a glyph and its word is one fixed distance and does not grow with `size`.' }
    paddingInline: { token: 'space.{size}' }
    paddingBlock: { token: space.sm }
    radius: { token: radius.md }
    fontFamily: { token: font.family.body }
    fontWeight: { token: font.weight.medium }
    fontSize: { token: 'font.size.{size}' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    focusRingOffset: { token: border.width.focus, description: 'Outline offset, so the ring clears the button''s own fill instead of sitting on its edge. The same focus token as focusRingWidth and locked with it, so the rule reads the token directly and there is no literal.' }
    inverseForeground: { token: color.inverse.link, description: 'ghost text when `inverse`.' }
    inverseFocusRing: { token: color.inverse.focus, description: 'Focus ring when `inverse`.' }
    inverseBackgroundHover: { token: color.inverse.foreground, state: hover, description: 'ghost hover and pressed fill when `inverse`: this color at inverseHoverOpacity. The color-mix on web and Lit takes `transparent` as its second colour, never color.inverse.surface — ghost has no fill of its own, so whatever the Toast or panel actually paints has to show through, and mixing against the token would be right only when the two happen to match. On native it is the same thing by another route: the resolved colour with an alpha channel, drawn over whatever the transparent ghost sits on; a colour that is not #rgb or #rrggbb passes through without alpha.' }
    inverseHoverOpacity: { token: opacity.disabled, computed: { times: 0.25 }, state: hover, description: 'The alpha of inverseBackgroundHover: color-mix percentage on web/Lit (`calc(var(--ds-button-inverse-hover-opacity) * 0.25 * 100%)`), the alpha of the resolved color on native. The ×0.25 applies to whatever token the binding resolves to, an override included: the hook holds the base token and the rule that reads it multiplies.' }
    minTarget: { token: size.target.min, description: 'min-width and min-height of the button on every platform. Web and Lit apply only this floor; there is no coarse-pointer rule.' }
    touchTarget: { token: size.target.comfortable, platforms: [rn, swiftui], description: 'The hit area on touch platforms, reached without changing the visual size: hitSlop on rn, .contentShape on SwiftUI. On rn the slop per side is half the shortfall — ceil((touchTarget − measured extent) / 2) — and the footprint is presumed to be `minTarget` until the first onLayout, so the comfortable target is never under-served on the first frame. react-native-web ignores hitSlop, so in the web preview the target is the visual box alone: it clears the 24px floor through `minTarget`, and the 44px target is not observable there.' }
    disabledOpacity: { token: opacity.disabled, description: 'Applied to the whole button when disabled; colors are unchanged so contrast math still holds for the enabled state.' }
    transition: { token: motion.duration.fast, description: 'Background transitions on hover and press, with motion.easing.standard. No variant changes its foreground between states, so only the background animates: the property list is background-color alone, and a `variant` swapped at runtime therefore changes fill without a transition. Removed under `@media (prefers-reduced-motion: reduce) { transition: none }` — the reduce query, never an inverted `no-preference` gate, which would also strip motion where the feature is unsupported.' }
    loadingSpin: { token: motion.duration.loop, description: 'One rotation of the loading indicator, at linear easing (a continuous spin; motion.easing.standard is for `transition` only); disabled under prefers-reduced-motion, written as the same `reduce` query as `transition`. The ring stays rendered and frozen at its start angle rather than being hidden — it is the only visual sign that the button is busy — and `transition` likewise snaps the background instead of animating.' }
    spinnerSize: { token: 'font.size.{size}', description: 'Diameter of the loading ring: 1em of the label font. On rn, which has no em, the ring is this size and its radius is half of it. Its own binding: a fontSize override does not move it, and a consumer who changes one overrides both.' }
    spinnerStroke: { token: border.width.focus, description: 'Ring thickness of the loading spinner: a spinnerSize circle with one quarter transparent — the block-start quarter on every platform, so the turn reads as starting from twelve o''clock — drawn in currentColor (the resolved foreground binding on rn). Locked because border.width.focus is a focus token: it keeps its `--ds-button-spinner-stroke` hook but is not a member of the overrides type. That the hook stays settable from document CSS is intended — locked removes a binding from `overrides`, never from the CSS escape hatch. The ring is round through `radius.full`, read directly with no hook, on web and Lit, and through a radius of spinnerSize / 2 on rn, where it is a bordered View with a transparent top border (no react-native-svg) and carries no testID. One rotation is a full turn, `rotate(360deg)`: a geometric constant, not a themed value.' }
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
      attributes: [type, aria-disabled, aria-busy, aria-label, aria-haspopup]
      notes: 'Use aria-disabled rather than the disabled attribute so the button remains discoverable by keyboard and screen readers. `expanded` is a React prop mapped to aria-expanded; when it is undefined, an `aria-expanded` arriving through `...rest` still applies, which is how Menu, Popover, Disclosure, SidePanel, Combobox and Search already set it. `ButtonProps` omits `className` and `style` from the native button props, so passing either is a type error rather than a silent drop: `overrides` is the only per-instance styling. Hooks follow Lit: locked bindings get no `--ds-button-*` hook, and the interpolated ones (background, backgroundHover, foreground) are written out as one rule per variant reading the token directly; spinnerStroke is the one exception. A blocked activation (disabled or loading) calls preventDefault() and stopPropagation() on the click, so a `type: submit` button submits nothing and the enclosing Form never sees the event. Cursor is not a binding and is the same everywhere: `pointer`, `not-allowed` under aria-disabled, `progress` under aria-busy.'
    lit:
      tag: ds-button
      reflect: [variant, size, type, disabled, icon-only, loading, inverse, overflow-label]
      notes: 'Wraps a native <button> in the shadow root with delegatesFocus so the host element is focusable. `press` is a composed CustomEvent. Icons are named slots `leading-icon` / `trailing-icon`; the part names stay the anatomy names verbatim (`part="leadingIcon"`, `part="trailingIcon"`), so slot names are kebab-case and part names camelCase. The slots are not aria-hidden (aria-hidden on a <slot> is unreliable): a ds-icon with no label hides itself, which is what makes the icons decorative. Locked bindings get no `--ds-button-*` hook (the rule reads the token directly, per the overrides contract, one rule per variant for the interpolated ones); spinnerStroke is the one exception its binding names. `label` is required but a property needs an initial value, so it starts as '''' and ds-button does not warn. A blocked activation (disabled or loading) is swallowed on the inner button with preventDefault() and stopPropagation(): neither `press` nor the native click leaves the host, and no form submits. ds-button is NOT form-associated (a FACE with a reflected disabled attribute becomes truly disabled and unfocusable); `type=submit` is handled by ds-form listening for `press`, and by `closest(''form'')?.requestSubmit()` only when no ds-form encloses the button, so a ds-form nested in a native form submits once. `expanded` is a JS property only (`attribute: false`) and stays tri-state — undefined means the button discloses nothing, so no aria-expanded is set at all. A disclosing parent sets `.expanded=`; a raw `aria-expanded` attribute on the host does not reach the inner button. `haspopup` is the same kind of JS property, written as `aria-haspopup` on the inner button and omitted while undefined. The host is the tab stop and the inner button is never an independent one: `tabindex` written on the host (Toolbar''s roving focus, TreeGrid''s chevron, NumberInput''s steppers) is mirrored onto the inner button through a MutationObserver watching that attribute alone, which never writes back to the host; no other global attribute crosses the shadow root. The host lays out as `display: inline-flex; vertical-align: middle` with the inner button filling it, so a stretched host exposes no dead click area of its own. `accessibleName` is not reflected and is the plain kebab attribute `accessible-name`. On `type: submit` the order is `press`, then tracking, then `closest(''form'')?.requestSubmit()` guarded by `!this.closest(''ds-form'')`; with neither form present the submit is a silent no-op, as on rn. A caller''s `aria-describedby` on the host cannot cross the shadow root, so on Lit `copy.loading` replaces rather than merges with it — an accepted divergence from web, since the busy description matters more than a description the shadow root cannot reach.'
    rn:
      element: Pressable
      props: [accessibilityRole=button, accessibilityLabel, accessibilityState, hitSlop]
      notes: 'No hover state on touch; backgroundHover is applied to the pressed state. `type: submit` calls submit() on the nearest Form context, since there is no native form. Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur`, `onLongPress` and `onPressOut` (chained with Button''s own pressed-state tracking) to the native element, so Tooltip can attach to it. The accessibilityLabel is `accessibleName ?? accessibilityLabel ?? label`. Button exposes its root Pressable as `ref` so a parent (Tooltip, Toolbar) can measure and focus it. `disabled` is never passed to Pressable, which would drop it from the focus order: it is a press guard plus `accessibilityState.disabled`, so a hardware-keyboard user can still focus it and the press is swallowed, as on web. react-native-web drops `accessibilityState`, so Button mirrors busy and expanded as `aria-busy`/`aria-expanded` props, and sets `aria-disabled` imperatively on the web DOM node in an effect (Pressable overwrites a passed `aria-disabled`, and any disabled prop removes the button from the tab order); that needs Button to own its root ref and expose it through `useImperativeHandle(ref, …)`. Without the mirror a dimmed disabled button fails contrast in the web preview, because tooling does not see it as disabled. The role and name stay `accessibilityRole`/`accessibilityLabel`, which react-native-web still renders. A `type: submit` Button outside any Form only fires onPress, with no warning. A Pressable''s own style cannot hold an Animated value, so the animated fill is a nested flex child that grows into the root''s box at an inner radius of `radius − focusRingWidth`, with the ring on the root above it; an inset-0 overlay is the wrong reading, because on Yoga it fills the padding box and stops short of every edge. The ring is an always-present border of `focusRingWidth` that is transparent while unfocused, so focusing never shifts the button. `loadingSpin` drives a transform, so it runs on the native driver everywhere but web, while the background colour interpolation stays off it (colour is not native-drivable there). The label is React Native''s own `Text` with the four typography bindings applied directly: the system Text''s `size` and `tone` enums cannot express `font.size.{size}` in an action foreground, and composing it is the rule only where it can carry the binding. `disabled-stays-focusable` is web and Lit only — the native guarantee (disabled never reaches Pressable, so it keeps its place in the focus order) has no focusability assertion in the RN testing library and is held by this note alone.'
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
      description: 'While loading is true the button announces itself as busy and ignores further activation, but keeps its height and its label in view. The rn test also asserts accessibilityState.busy in its own file, since a scenario has no busy state.'
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
      description: 'A low-emphasis icon-only control in dense UI, whose label says what it does rather than what the icon depicts. `Icon name=close` is shorthand for the system Icon with those props: `<Icon name="close" inline />` on web, `<ds-icon name="close" inline>` on Lit, and on rn `<Icon name="close">` with `color` set to the ghost foreground token, since native has no currentColor.'
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

Every button must have an accessible name (WCAG 4.1.2). The name comes from the visible label or, for `iconOnly`, from the `label` prop rendered as `aria-label` / `accessibilityLabel`. Focus must be visible (WCAG 2.4.7 and 2.4.11): the focus ring uses `color.border.focus` at `border.width.focus` and is never removed without a replacement. The interactive target is at least 24×24 CSS px (WCAG 2.5.8, AA) at every `size` — `minTarget` alone on web and Lit, with no coarse-pointer media query — and reaches 44×44 on the touch platforms through `touchTarget` (hitSlop on React Native, `.contentShape` on SwiftUI), following iOS and Android guidelines. Text and background pairs for every variant meet 4.5:1 (WCAG 1.4.3) in both light and dark themes — the build checks this against the tokens. Buttons are activated with Enter and Space, and never rely on hover alone to convey state.

## Platform notes

### Web
Render a native `<button>` with `type` from the prop (default `button`, so a button inside a form never submits by accident). Use `aria-disabled="true"` for the disabled state; the button stays in the tab order. Set `aria-busy="true"` while loading.

### Lit
The host element `<ds-button>` reflects `variant`, `size`, `type`, `disabled`, `icon-only`, `loading`, `inverse` and `overflow-label` as attributes so consumers can style states from outside the shadow root. The inner element is a real `<button>`; the shadow root is created with `delegatesFocus: true`. Activation dispatches a composed, bubbling `press` CustomEvent. Consumers can also listen to the native `click` that bubbles out of the shadow root; a click blocked by `disabled` or `loading` never leaves it.

### React Native
Render a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel={label}` and `accessibilityState={{ disabled, busy: loading }}`. There is no CSS cascade, so every style binding is applied explicitly from the token object. Because there is no hover on touch, `backgroundHover` is used for the pressed state. Icons passed as `leadingIcon`/`trailingIcon` are the system `Icon` and are rendered as given: there is no cascade, so Button cannot recolor them, and callers pass the variant's foreground to the Icon's own `color` prop (native Icon's first color source). When the visual footprint is smaller than 44px, add `hitSlop` to reach the comfortable target size.

## Related

Form, Link, Icon, Toolbar, ButtonGroup (planned).
