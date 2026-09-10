# Gaps reported while generating Alert for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:54 — round 1

- Alert: schema locks `icon` (color.status.{tone}.icon) but gives no mechanism to apply it — Icon's own CSS (`.ds-icon { color: var(--ds-icon-color) }`) always wins over any ancestor `color`, so a CSS hook on the wrapper span can't recolor it (this appears to be a real, pre-existing issue in AlertDialog.css, which sets `.ds-alert-dialog--tone-* .ds-alert-dialog__icon { color: ... }` with a comment claiming 'Icon draws in currentColor' — that rule has no effect given Icon.css as written). I used Icon's own public `overrides={{ color: 'color.status.{tone}.icon' }}` prop instead, which reliably wins via inline style; this differs from AlertDialog's approach and the two composites should probably be reconciled.
- Alert: `iconSize` override needed to reach both the Alert's own centering-math hook (`--ds-alert-icon-size`, used in the icon wrapper's margin calc) and Icon's own `size` override, since Icon owns its rendered dimensions independently of the wrapper's box. Forwarded the same TokenRef to both, following the precedent of Divider forwarding `labelSize`/`fontFamily` into Text's own `overrides`.
- Alert: anatomy names `container` for the root part; used `data-part="container"` alongside `data-ds="Alert"` on the same element, following Card's precedent of stacking `data-ds` and a root-level `data-part` (there it's `surface`).

## 2026-09-10 17:47 — round 1

- Alert: index.ts already exported Alert/AlertProps/AlertTone/AlertLive/AlertOverridableBinding from a prior generation round, so no index.ts change was needed this pass.
- Alert: the pre-existing Alert.tsx/Alert.css were missing the `headingSize` binding entirely (schema lists it as overridable, distinct from `fontSize` used by the body) — added the `--ds-alert-heading-size` hook and applied it to `.ds-alert__heading`.
- Alert: the pre-existing root had no `aria-labelledby`, so the region had no accessible name from the heading/body per the web platform note ('named by the heading when present, otherwise the body element') — added `useId()`-based ids on the heading and body and wired `aria-labelledby` on the root accordingly.
- Alert: `heading` is rendered as a `<p>` (not a heading element) per the web platform notes, so `a11y.requires: heading-hierarchy` from the generic ruleset doesn't apply here — the doc's own platform note overrides the generic rule and Alert's `a11y.requires` list doesn't include it either, so no gap in practice, just flagging the apparent tension.
- Alert: `target-24px` and `focus-visible` are satisfied by delegating to the composed system Button (ghost/sm/iconOnly) for the dismiss control rather than the Alert root itself having a target size or focus style of its own — the root has no interactive semantics.
