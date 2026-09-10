# Gaps reported while generating Breadcrumb for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:01 — round 1

- Breadcrumb (lit): schema lists no `overrides`-hook wiring explicitly, but the package convention requires every overridable style binding to be a `--ds-breadcrumb-*` CSS hook plus an `overrides` property; the pre-existing file had neither — added `BreadcrumbOverridableBinding` (gap, fontFamily, fontSize, fontWeight, lineHeight) with hooks, matching the pattern in RadioGroup.ts.
- Breadcrumb (lit): the pre-existing file lacked `data-ds="Breadcrumb"` and `shadowRootOptions.delegatesFocus`; the latter is required for the generated `control-is-focusable` behavior test to pass (calling `.focus()` on the host must delegate into the shadow tree while `document.activeElement` stays the host) — added both.
- Breadcrumb (lit): the ellipsis button used a hand-drawn inline `<svg>` three-dot glyph instead of the system `ds-icon`; swapped for `<ds-icon name="ellipsis" inline>`, which already exists in the shared icon set.
