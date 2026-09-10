# Gaps reported while generating Alert for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:54 — round 1

- Alert: schema locks `icon` (color.status.{tone}.icon) but gives no mechanism to apply it — Icon's own CSS (`.ds-icon { color: var(--ds-icon-color) }`) always wins over any ancestor `color`, so a CSS hook on the wrapper span can't recolor it (this appears to be a real, pre-existing issue in AlertDialog.css, which sets `.ds-alert-dialog--tone-* .ds-alert-dialog__icon { color: ... }` with a comment claiming 'Icon draws in currentColor' — that rule has no effect given Icon.css as written). I used Icon's own public `overrides={{ color: 'color.status.{tone}.icon' }}` prop instead, which reliably wins via inline style; this differs from AlertDialog's approach and the two composites should probably be reconciled.
- Alert: `iconSize` override needed to reach both the Alert's own centering-math hook (`--ds-alert-icon-size`, used in the icon wrapper's margin calc) and Icon's own `size` override, since Icon owns its rendered dimensions independently of the wrapper's box. Forwarded the same TokenRef to both, following the precedent of Divider forwarding `labelSize`/`fontFamily` into Text's own `overrides`.
- Alert: anatomy names `container` for the root part; used `data-part="container"` alongside `data-ds="Alert"` on the same element, following Card's precedent of stacking `data-ds` and a root-level `data-part` (there it's `surface`).
