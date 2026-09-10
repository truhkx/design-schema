# Gaps reported while generating AlertDialog for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 23:37 — round 1

- AlertDialog: `confirmDisabled` is described as 'aria-disabled, still focusable' (web ARIA convention), but the composed `Button` only supports native `disabled` (removes from focus/interaction per its own doc) — no restyle/reimplementation is allowed, so `confirmDisabled` maps to `Button`'s `disabled` prop as-is; a focusable-but-inert Confirm is not achievable without a Button API change.
- AlertDialog: `focusRing`/`focusRingWidth` are locked bindings but this component introduces no directly-focusable element of its own beyond the composed `Button`s, which draw their own focus ring internally — same acknowledged platform limit Dialog documents for the same reason.
- AlertDialog: a11y.role `alertdialog` has no native RN `accessibilityRole` equivalent; left unset and relies on `accessibilityViewIsModal` + `accessibilityLabel`/`accessibilityHint` on the surface, matching Dialog's precedent for `role=dialog`.
- AlertDialog: `overrides.footerGap` can't reach Stack's internal gap (no override hook on Stack's fixed `space.*` gap presets), so the footer row is hardcoded to `gap="1"` and the override is a no-op — same limit Dialog documents for its footer.
- AlertDialog: icon size for the tone glyph isn't specified; chose `size="lg"` since the a11y.contrast entry for the icon marks `large: true` (implying a large-text-equivalent presentation), consistent with the AA large-text contrast allowance.
- AlertDialog: composition lists `focusScope: FocusScope` but does not name a component for the icon+text wrapper or the outer surface/scrim; rendered as plain `View`s, matching Dialog's precedent for uncomposed anatomy parts.
- AlertDialog: initial focus targets a wrapping `View` around the title rather than the Heading's own Text node (Heading doesn't forward refs) — same native limit Dialog documents for `initialFocus="title"`.

## 2026-09-10 02:44 — round 1

- AlertDialog: confirmDisabled is described as 'aria-disabled, still focusable' but the composed Button only supports native disabled (removes focusability) — no restyle/reimplementation allowed, so confirmDisabled maps to Button's disabled as-is; a focusable-but-inert Confirm needs a Button API change.
- AlertDialog: a11y.role alertdialog has no native RN accessibilityRole equivalent; left unset, relying on accessibilityViewIsModal + accessibilityLabel/accessibilityHint on the surface, matching Dialog's precedent for role=dialog.
- AlertDialog: overrides.footerGap can't reach Stack's internal gap (no override hook on Stack's fixed space.* gap presets), so the footer row is hardcoded to gap="tight" and the override is a no-op — same limit Dialog documents for its footer.
- AlertDialog: icon size for the tone glyph isn't specified; chose size="lg" since the a11y.contrast entry for the icon marks large: true.
- AlertDialog: composition lists focusScope: FocusScope but names no component for the icon+text wrapper or outer surface/scrim; rendered as plain Views, matching Dialog's precedent.
- AlertDialog: initial focus targets a wrapping View around the title rather than the Heading's own Text node (Heading doesn't forward refs) — same native limit Dialog documents for initialFocus="title".
