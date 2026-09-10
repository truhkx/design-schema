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
