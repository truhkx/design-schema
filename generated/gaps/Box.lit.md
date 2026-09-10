# Gaps reported while generating Box for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 20:35 — round 1

- overrides/TokenRef: Box is the first component in the package to implement the per-instance overrides contract described in the package conventions (not yet used by any existing component); @design-schema/tokens is currently only a devDependency of @design-schema/lit, so importing cssVar/TokenRef at runtime relies on that existing workspace link rather than a new dependency — flagging in case the convention expects it promoted to a real dependency.
- surface: none has no background token (color.background.{surface} only defines default/subtle/strong); I set the --ds-box-background override hook to the literal 'transparent' for that case rather than a token, since none is untokenized by design.
- element -> role mapping: the spec says sectioning values 'map to their implicit roles' without naming them; I used the standard HTML implicit ARIA roles (article, aside->complementary, header->banner, footer->contentinfo, main, nav->navigation) via ElementInternals.role.
- All 33 scenarios in the doc are `derived: props.*`/`a11y.role` and assert only `renders: true`, so no scenario exercises the `overrides` property, the `border` boolean's visual effect, or the element->role mapping — those paths are implemented per the platform notes but have no behavior-scenario test coverage; rendered exactly as specified rather than inventing new scenarios.

## 2026-09-09 21:41 — round 2

- checkbox.md / switch.md: `parse` gate fails on frontmatter schema validation (unexpected 'behavior' property) — this is unrelated to Box and lives under site/, which I'm not permitted to edit; needs to be fixed by the docs-generation pass, not the Lit generator.

## 2026-09-09 21:42 — round 3

- checkbox.md / switch.md: `parse` gate fails on frontmatter schema validation (unexpected 'behavior' property) — unrelated to Box, lives under site/ which is out of scope for the Lit generator; needs the docs-generation pass to remove/schema-allow that field.

## 2026-09-09 22:17 — round 1

- Box: none of the existing Lit components (including Box) had the data-ds testability hook the digest requires; added `connectedCallback` setting `data-ds="Box"` since I was touching this file — worth rolling the same hook out to the other Lit components (Card, Container, Switch, etc.) in a follow-up pass.
