# Gaps reported while generating Breadcrumb for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:01 — round 1

- Breadcrumb (lit): schema lists no `overrides`-hook wiring explicitly, but the package convention requires every overridable style binding to be a `--ds-breadcrumb-*` CSS hook plus an `overrides` property; the pre-existing file had neither — added `BreadcrumbOverridableBinding` (gap, fontFamily, fontSize, fontWeight, lineHeight) with hooks, matching the pattern in RadioGroup.ts.
- Breadcrumb (lit): the pre-existing file lacked `data-ds="Breadcrumb"` and `shadowRootOptions.delegatesFocus`; the latter is required for the generated `control-is-focusable` behavior test to pass (calling `.focus()` on the host must delegate into the shadow tree while `document.activeElement` stays the host) — added both.
- Breadcrumb (lit): the ellipsis button used a hand-drawn inline `<svg>` three-dot glyph instead of the system `ds-icon`; swapped for `<ds-icon name="ellipsis" inline>`, which already exists in the shared icon set.

## 2026-09-10 17:46 — round 1

- Breadcrumb: platforms.lit.reflect lists `collapse` un-negated even though its default is `true`; the package-wide boolean convention says a true-default boolean should reflect a negated attribute (e.g. `no-collapse`) since a present boolean attribute can't express `false` via raw HTML. Followed the explicit spec (`reflect: - collapse`, 'never change the doc's prop name') and kept the property/attribute named `collapse`, but a consumer writing `<ds-breadcrumb collapse="false">` in static HTML (not a Lit template) will still get `collapse=true`. Flagging for the doc to reconcile.
