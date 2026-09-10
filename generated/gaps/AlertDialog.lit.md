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
