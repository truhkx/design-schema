---
title: Button
description: Triggers an action or event, such as submitting a form, opening a dialog, or confirming a choice.
component:
  name: Button
  category: action
  status: review
  apg: button
  anatomy: [container, label, leadingIcon, trailingIcon]
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
      description: Visual emphasis. One primary button per view.
    size:
      type: enum
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
      description: 'Set by a parent that the button discloses (Menu, Popover, SidePanel, Disclosure): aria-expanded on web, accessibilityState.expanded on native. Consumers rarely set it directly.'
    disabled:
      type: boolean
      default: false
      description: Prevents activation. The button stays in the tab order and is announced as disabled.
    accessibleName:
      type: string
      description: 'Overrides the accessible name when it must say more than the visible label ("Sort by Amount, ascending" on a header that shows "Amount"). The visible label must be the start of it (WCAG 2.5.3 label-in-name). Maps to aria-label / accessibilityLabel.'
    overflowLabel:
      type: string
      description: 'Text used for this button when a Toolbar collapses it into its overflow Menu. Only Buttons collapse; other controls stay visible.'
    iconOnly:
      type: boolean
      default: false
      description: Hides the visible label and shows only `leadingIcon`. `label` is still required and becomes the accessible name. Padding becomes equal on all sides (`space.sm`).
    loading:
      type: boolean
      default: false
      description: 'Shows a 1em ring spinner in `currentColor` in the leading icon slot (whether or not `leadingIcon` is set; for `iconOnly` it replaces the sole glyph), hides `trailingIcon`, keeps the label visible and the layout unchanged, and blocks repeat activation while an action is pending.'
      platforms: [web, lit, rn]
    inverse:
      type: boolean
      default: false
      description: 'The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost` text uses color.inverse.link and hover uses color.inverse.foreground at 12% over the surface (the sanctioned color-mix of tokens on web/Lit; an alpha of the resolved color on native); the focus ring uses color.inverse.focus for every variant while `inverse` is true, since the ring must read against the inverse surface. Only `ghost` changes its fill on inverse surfaces; other variants keep their own fills.'
  events:
    onPress:
      description: Fired when the button is activated by pointer, keyboard (Enter/Space), or assistive technology.
      platforms: { web: onClick, lit: press, rn: onPress, swiftui: action }
  styles:
    background: { token: 'color.action.{variant}.background' }
    backgroundHover: { token: 'color.action.{variant}.backgroundHover', description: Pointer hover and pressed state. }
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
    minTarget: { token: size.target.min }
    disabledOpacity: { token: opacity.disabled, description: 'Applied to the whole button when disabled; colors are unchanged so contrast math still holds for the enabled state.' }
    transition: { token: motion.duration.fast, description: 'Background/foreground transitions on hover and press, with motion.easing.standard.' }
    loadingSpin: { token: motion.duration.loop, description: 'One rotation of the loading indicator; disabled under prefers-reduced-motion.' }
    spinnerStroke: { token: border.width.focus, description: 'Ring thickness of the loading spinner: a 1em circle with one quarter transparent, drawn in currentColor.' }
  a11y:
    role: button
    requires: [accessible-name, focus-visible, keyboard-operable, target-24px, contrast-aa]
    contrast:
      - { foreground: 'color.action.{variant}.foreground', background: 'color.action.{variant}.background', level: AA }
      - { foreground: color.inverse.link, background: color.inverse.surface, level: AA }
      - { foreground: color.inverse.focus, background: color.inverse.surface, level: AA, large: true }
  platforms:
    web:
      element: button
      attributes: [type, aria-disabled, aria-busy, aria-label]
      notes: Use aria-disabled rather than the disabled attribute so the button remains discoverable by keyboard and screen readers.
    lit:
      tag: ds-button
      reflect: [variant, size, type, disabled, icon-only, loading, inverse]
      notes: 'Wraps a native <button> in the shadow root with delegatesFocus so the host element is focusable. `press` is a composed CustomEvent. Icons are named slots `leading-icon` / `trailing-icon`. ds-button is NOT form-associated (a FACE with a reflected disabled attribute becomes truly disabled and unfocusable); `type=submit` is handled by ds-form listening for `press`, and by `closest(''form'')?.requestSubmit()` when placed directly in a native form.'
    rn:
      element: Pressable
      props: [accessibilityRole=button, accessibilityLabel, accessibilityState, hitSlop]
      notes: 'No hover state on touch; backgroundHover is applied to the pressed state. `type: submit` calls submit() on the nearest Form context, since there is no native form. Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur` and `onLongPress` to the native element, so Tooltip can attach to it.'
    swiftui:
      element: Button
      props: [action, .buttonStyle=custom, .accessibilityLabel, .accessibilityHint, .accessibilityAddTraits=isButton, .frame=minWidth-minHeight, .contentShape, .focusable, .focused, .onLongPressGesture]
      notes: 'A SwiftUI `Button(action:)` with a package `ButtonStyle` (`DSButtonStyle`) that draws variant/size from tokens and reads `isPressed` for the pressed state; hover from `.onHover` on iPad pointer. `iconOnly` sets `.accessibilityLabel(label)` and hides the text; `accessibleName` overrides the label (and must start with the visible one); `loading` sets `.accessibilityValue(copy.loading)`, disables presses without `.disabled`, and swaps the leading icon for a `ProgressView` tinted from the foreground token. `disabled` is `.accessibilityRespondsToUserInteraction(false)` + `.opacity` + guard, keeping the button focusable per the doc. Long press forwards to Tooltip through `onLongPress`; `accessibilityHint` is forwarded verbatim. `overflowLabel` is read by Toolbar only.'
---

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
