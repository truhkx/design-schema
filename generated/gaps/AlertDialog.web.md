# Gaps reported while generating AlertDialog for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 23:29 — round 1

- No `container` prop: the platform keyboard rules say overlays portal to document.body with 'a container prop may override', but AlertDialog's own prop table (unlike Dialog's) doesn't list one, so I hardcoded document.body rather than invent an undocumented prop.
- Keyboard story can't reach 'three focusable children': AlertDialog's fixed anatomy (icon/title/description/footer, no body slot) only ever has two interactive controls in the focus trap — Cancel and Confirm. I did not pad the story with an invented third control since the spec forbids adding props/content not in the schema; the Keyboard story renders the real two plus the external trigger.
- Icon size: schema doesn't specify a size token for the status icon binding (only the color, `color.status.{tone}.icon`, locked). I chose IconSize 'lg' for visual weight as the dialog's primary signal; a 'md' default would also be defensible.
- partGap's doc text says 'between the text block and the footer', but in the DOM the icon sits inline with the text block as one row (`.ds-alert-dialog__content`), so partGap actually measures from that icon+text row to the footer rather than from text alone. Visually identical (icon and text are top-aligned), but noting the wording mismatch.
- `footerGap` (layout.gap.tight) is declared as an overridable CSS hook on the root for API-surface consistency with the schema, but — same as the existing Dialog component — it isn't actually wired to anything, because the footer's spacing comes from the composed Stack's own fixed gap scale (`gap="1"`), which can't read an arbitrary custom-property token. This mirrors an existing, unresolved gap already present in Dialog.tsx/Dialog.css, not a new one.

## 2026-09-10 02:44 — round 1

- AlertDialog was already generated and committed prior to this session (verified complete: composition matches spec via FocusScope/Heading/Icon/Stack/Text, native dialog role=alertdialog with showModal/scrim/no-close-button/Cancel-first-focus, tone→icon/confirm-variant mapping, all override hooks, reduced-motion handling); confirmed with `vitest run src/AlertDialog.test.tsx` (6/6 passing) rather than rewriting from scratch. No ambiguities found in this pass.
- footerGap: schema declares an overridable `footerGap` binding but the footer is a composed Stack (`gap: tight` per platform notes) rather than a raw flex gap the CSS controls directly; the existing implementation documents this in a CSS comment and leaves the override present-but-inert on the Stack's fixed gap — flagged since the override technically has no visible effect.

## 2026-09-10 18:14 — round 1

- AlertDialog: the file predated this schema revision and used `title` instead of `heading`, had no `container` portal-target prop, and had no `iconSize` overridable binding or data-part attributes on focusScope/heading/description/footer — renamed/added throughout AlertDialog.tsx/.css/.stories.tsx/.test.tsx to match, following the same pattern already applied to Dialog for the same schema drift.
- AlertDialog: unlike the existing Dialog/Fieldset precedent (which declare a footerGap/fieldsGap root hook but leave it unwired, since Stack's `gap` prop was believed to have no override path), I forwarded `overrides.footerGap` into the composed Stack's own `overrides.gap` and confirmed in Stack.css that its per-value gap classes do read `var(--ds-stack-gap)`, so the inline override actually takes effect. Same treatment for `iconSize` → Icon's `overrides.size`, mirroring Alert's existing iconSize→Icon forwarding. This makes AlertDialog's forwarding functional where Dialog's is a documented no-op; worth reconciling Dialog/Fieldset to the same fix in a later pass.
- AlertDialog: `container` (portal target) isn't in the schema's props table, but the platform overlay rule ('every overlay rendered through a portal accepts container?') and the existing Dialog precedent both call for it; added as an optional prop defaulting to document.body.

## 2026-09-10 19:57 — round 1

- AlertDialog: spec doesn't state whether the icon should carry an accessible label distinguishing tones for screen readers beyond the heading/description — treated as decorative (aria-hidden) since the tone is already conveyed by the heading/description text, matching the 'decorative icons take no label' rule.
- AlertDialog: keyboard spec's 'Tab from last wraps to first' / 'Shift+Tab from first wraps to last' is satisfied generically by FocusScope's trapped-focus wrapping rather than an AlertDialog-specific handler; no gap in behavior, but the doc could call out that this is inherited from FocusScope rather than reimplemented.

## 2026-09-16 06:32 — round 1

- AlertDialog: `confirmDisabled` says the composed Button is 'unfocusable on web', but the React Button implements `disabled` as aria-disabled + click guard and stays focusable. I forwarded to Button's `disabled` as specified, so on web the disabled Confirm is focusable-but-inert; the prose (and the Tab-wrap rule 'From Confirm (the last button)') should not promise unfocusable.
- AlertDialog: the Keyboard-story rule asks for at least three focusable children, but the component has exactly two (Cancel, Confirm) and no slot for more; the trigger is behind the inert background. The story renders open with its trigger and the two buttons.
- AlertDialog: anatomy lists `scrim` as a part with a style binding, but on web the scrim is the <dialog>'s ::backdrop pseudo-element, which cannot carry data-part. The a-scrim-click-does-nothing test clicks the <dialog> element itself (where backdrop clicks land); the doc should say the scrim has no hook on web.
- AlertDialog: `iconGap` is bound to `part: icon`, but it is the gap between the icon and the text block, so it is applied to the row that contains both rather than the icon element.
- AlertDialog: `iconSize` forwards to Icon `overrides.size`, but the locked `icon` colour binding has no forward listed while Alert forwards Icon `color`. Since the Parts section says 'add no other' forward, I set the colour on the icon wrapper (data-part=icon) per tone and let Icon draw in currentColor.
- AlertDialog: the spec does not name a Button size for Cancel/Confirm; I used Button's default size (the previous generation used `sm`).
- AlertDialog: no copy or doc for exit/enter easing: Dialog.css uses motion.easing.exit for exit, but the rules say transitions use motion.easing.standard; I used standard for both directions.
- AlertDialog: `description` Text size is unspecified (Dialog uses tone=muted at default size); I used tone=muted at default size to match the contrast pair color.foreground.muted on color.overlay.surface.
- AlertDialog: `role` is fixed to alertdialog, so it is omitted from the dialog prop passthrough type; the doc does not say whether consumers may override it.
- AlertDialog: swiftui notes mention a `destructive` prop ('or confirm when destructive is false') that does not exist in the schema props; not relevant to web but contradictory in the doc.
