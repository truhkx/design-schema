# Gaps reported while generating AlertDialog for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 23:33 — round 1

- Schema prop `title` collides with the native `HTMLElement.title` tooltip attribute; followed Dialog's precedent and named the property/attribute `heading` instead, per the package convention that forbids shadowing native members.
- platforms.lit.notes says both `confirm` and `cancel` dispatch with 'detail { reason }', but the events schema only defines a `reason` on onCancel ('cancel'|'escape'); onConfirm has no described payload. Implemented `confirm` with no detail (void) and only `cancel` carries `{ reason }`.
- No button variant is specified for Cancel in the schema or the Lit platform notes (only the confirm button's variant is derived from tone). Inferred `variant="secondary"` by analogy with the RN notes ('secondary for cancel; danger or primary for confirm by tone').
- Footer button alignment (`justify`) isn't specified for Lit; the Web platform notes describe 'Cancel then Confirm in DOM order... visually the primary sits at the end via justify: end'. Applied the same `justify="end"` on the Lit `<ds-stack>` footer for visual parity.
- The generic Lit convention asks every keyboard-block component's `Keyboard` story to render 'at least three focusable children', but AlertDialog has no slots and always renders exactly two buttons (Cancel, Confirm) inside its shadow DOM — there is no schema-sanctioned way to add a third. The Keyboard story renders the trigger plus the two buttons only.
- No `dismissible`/close-button/scrim-click affordances exist for AlertDialog per spec ('no close button... scrim click does nothing'), so unlike Dialog there is no native `close` event listener or `closingProgrammatically` bookkeeping — the only way the shadow `<dialog>` closes is our own exit-animation call to `.close()`, which simplifies the lifecycle versus Dialog.ts.

## 2026-09-10 02:51 — round 1

- AlertDialog was already generated and exported prior to this invocation and fully matches the current spec (props, events, tokens, keyboard model, a11y, stories, tests); no changes were made.
- Schema prop `title` is implemented as `heading` per the package convention that a prop colliding with a native HTMLElement member (HTMLElement.title) must be renamed, with only the attribute/doc-facing name preserved elsewhere — consistent with Dialog.ts's identical handling.
- Icon glyph selection (name=${tone}) is only specified in the web platform notes ('<Icon name={tone}>'), not repeated in the lit notes; applied the same mapping in ds-icon since the tone enum values (danger/warning/info) match existing icon names.

## 2026-09-10 18:02 — round 1

- AlertDialog: platform note says the shadow <dialog> should be named with aria-label/aria-description since 'ids do not cross the shadow boundary', but heading/description live inside the same shadow root as the dialog, so aria-labelledby="heading"/aria-describedby="description" (matching Dialog's own pattern) works and was kept instead of duplicating the strings into aria-label/aria-description.
- AlertDialog: confirmDisabled maps to ds-button's `disabled` (matching the RN note's 'stays focusable' contract is not fully achievable on web since a disabled button is unfocusable); used plain `disabled` rather than `aria-disabled` since Button's own contract wasn't overridden here — flagged as a gap since the RN notes imply focusable-but-inert.

## 2026-09-10 19:59 — round 1

- AlertDialog (lit): the pre-existing implementation hardcoded the tone icon's size as size="lg" instead of wiring it through the iconSize override binding (font.size.lg, forwarded to the icon's own --ds-icon-size hook per the styles.iconSize spec). Fixed by adding the iconSize hook to AlertDialogOverridableBinding/HOOKS/:host default and setting `.icon { --ds-icon-size: var(--ds-alert-dialog-icon-size) }` instead of a static size attribute.

## 2026-09-16 06:35 — round 1

- AlertDialog: `confirmDisabled` says the composed Button is 'unfocusable on web and Lit', but the Lit Button keeps a disabled button in the tab order with aria-disabled (Button.ts: 'The button stays in the tab order'). I forwarded `disabled` to the Button as the doc says, so on Lit the disabled Confirm stays focusable; the doc's claim about Lit is wrong or Button needs to change.
- AlertDialog: the testability rule wants a Keyboard story with 'at least three focusable children', but an alert dialog has exactly two (Cancel, Confirm). The Keyboard story renders the trigger button plus the open dialog, so there are three focusables on the page but only two inside the dialog.
- AlertDialog: `overlay.dismiss` lists `close-button`, but the doc says there is no close button and `onCancel` reasons are only `cancel` and `escape`. I read `close-button` as meaning the Cancel button and rendered no close button.
- AlertDialog: the Lit notes say 'No slots: title, description and labels are properties', but the prop is `heading`, not `title`. I used `heading`.
- AlertDialog: the `icon` binding (`color.status.{tone}.icon`) is locked and has no Icon forward, while Icon's own `color` override is the only sanctioned way to recolor it and the contract says to add no other forwards. I set the tone color on a wrapper span and let the Icon inherit it through currentColor.
- AlertDialog: the Heading size and the description's Text tone/size are not specified. The contrast table lists `color.foreground.muted` on the surface, so I rendered the description with `tone="muted"` and left the level-2 Heading at its default size.
- AlertDialog: Button size for Cancel/Confirm is not specified (the previous Lit version used `sm`). I used the Button default so the targets stay at least 24px.
- AlertDialog: the `exit` binding gives a duration but no easing, and the rules say transitions use `motion.easing.standard`. Dialog's Lit exit uses `motion.easing.exit`; I kept the standard easing for exit as well.
- AlertDialog: `width` says 'Always the small size' but there is no rule for narrow viewports. I used Dialog's clamp `min(width, 100% - 2 * layout.gutter)`, which introduces a `layout.gutter` read that is not a binding.
- AlertDialog: `layer` (`layer.dialog`) is applied as z-index on the <dialog>, which has no effect inside the top layer; it is kept only as the hook the contract requires.
- AlertDialog: `partGap` is described as 'between the icon-and-text row and the footer' and `iconGap` has `part: icon`, but the icon cannot own a gap. I put iconGap on the row container that holds the icon and text, and partGap on the surface's column.
- AlertDialog: scenario `the-cancel-button-is-named-from-copy` has `then: copy: cancelLabel` with no target part. The test checks that the Cancel button's inner <button> is named 'Cancel'.

## 2026-09-17 10:28 — round 1

- AlertDialog: the lit platform notes never say where `data-part` lives; the web notes put each composed part (icon, heading, description, footer, cancelButton, confirmButton) on an AlertDialog-owned wrapper because the child writes its own data-part. Chose the same wrappers on Lit, matching ds-dialog.
- AlertDialog: the scrim part has no Lit rule. Web says the scrim is the <dialog>'s ::backdrop with no data-part hook, but the behavior scenario `a-scrim-click-does-nothing` clicks the `scrim` part. Kept a real `data-part="scrim"` element filling the <dialog> (transparent ::backdrop), as ds-dialog does, with no click listener.
- AlertDialog: focusScope composition lists only `trapped` and `restoreFocus`, while the web notes say autoFocus `first` (the default) is Cancel. In the Lit element the scope mounts before showModal(), so its autofocus finds nothing focusable; chose to pass only the listed props and focus Cancel explicitly after showModal(). The doc could state for Lit who places initial focus.
- AlertDialog: `icon` is locked but also forwarded to Icon's `overrides.color`. Chose to always forward `color.status.{tone}.icon` (not user-overridable), and to forward `iconSize`/`footerGap` to the child's overrides only when set, falling back to the child's CSS hook (`--ds-icon-size`, `--ds-stack-gap`) from the AlertDialog hook otherwise. Whether the unset case should also pass the default token through overrides is not specified.
- AlertDialog: `gutter` names part `surface`, but the size limits it describes (min(width, viewport − 2×gutter), max height) sit on the focus-scope wrapper that sizes the surface. Applied it there.
- AlertDialog: `enter` and `exit` share one duration binding each for both the scrim and the surface, and the rise distance is given as `space.2` in prose rather than as a binding. Used `var(--space-2)` directly, with no hook for it.
- AlertDialog: the keyboard section says Enter `expect: closes`, but the element never closes itself (open is controlled). Implemented Enter as native button activation firing `cancel`; nothing closes until the consumer sets `open` false.
