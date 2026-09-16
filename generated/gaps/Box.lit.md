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

## 2026-09-10 00:49 — round 1

- Box: `element` prop has no visible effect on the shadow DOM (per platform notes, only sets a role for sectioning values via ElementInternals) — kept `div`/`section` role-less as the spec directs, but a11y.role: none combined with sectioning `element` values creates an implicit contradiction (top-level a11y says role: none, platform notes say sectioning values do set a role); chose platform notes since they're more specific.
- Box: spec doesn't say whether `insetBlock`/`insetInline` should fall back to `inset` when unset or be fully independent optional attributes; implemented as optional (undefined) reflected attributes so CSS cascade order (inset rule before axis-override rule) does the `inset` fallback naturally — no explicit default given for insetBlock/insetInline in schema.

## 2026-09-16 02:45 — round 1

- Box: `background` is `locked: true` in styles, but the overrides preamble says every style binding becomes a `--ds-box-*` hook. Followed Card's precedent — no hook at all for a locked binding, background written straight from `color.background.{surface}` per reflected attribute, and `background` removed from `BoxOverridableBinding`. That is a breaking change against the previously generated Lit Box, which did export it as overridable.
- Box: the anatomy part `surface` has no element to land on in Lit — the platform note makes the host the box and the shadow root only a `<slot>`, and `:host` cannot carry a `part`. Chose to set `data-part="surface"` on the host in `connectedCallback` next to `data-ds`, and exposed no `::part`. The doc should say where the anatomy name lives when the host is the part.
- Box: the presence rule names `surface: none`, `border: false` and `radius: none` as making overrides no-ops but is silent on `inset: none`, where Stack's doc does gate `gap: none`. Chose to keep `paddingBlock`/`paddingInline` always in effect (`layout.inset.none` is a real token, unlike `surface: none` which renders no background), so only `border`/`borderWidth` and `radius` are gated.
- Box: `element`'s implicit-role mapping is described as 'their implicit roles' without a table. Chose article→article, aside→complementary, header→banner, footer→contentinfo, main→main, nav→navigation. Natively `header`/`footer` lose banner/contentinfo when scoped inside sectioning content; the element cannot know its ancestry, so a nested `<ds-box element="header">` announces as a banner where a native `<header>` would not. The doc should either say to map header/footer unconditionally or say to omit them.
- Box: `insetBlock`/`insetInline` have no declared default. Chose `undefined` (attribute absent, so the `inset` rules apply) and ordered the `[inset-block]`/`[inset-inline]` rules after the `[inset]` rules so the axis wins, matching the web note's 'axis modifiers are declared after the all-sides modifier'.
- Box: the two written scenarios (`nav-element-carries-navigation-semantics`, `article-element-carries-article-semantics`) are scoped `platforms: [web]`, yet the lit note requires the same roles via ElementInternals — so nothing in the Lit suite asserts the role mapping; the 8 element scenarios only assert 'renders'. Separately, the doc's derived scenario names (`renders-inset-block-none`) do not match what the generator emits (`renders-insetblock-none`).
- Box: the prop `border` (boolean presence) and the style binding `border` (the `color.border` value, overridable) share one name, so `overrides.border` reads as if it toggled the border rather than recoloring it. Kept both names verbatim per the schema rather than renaming locally.
- Box: `a11y.requires: contrast-aa` lists six foreground/background pairs, but Box never sets a foreground colour — text colour comes from the slotted children. Nothing is implementable in the element; the pairs are only a build-time token check, which the doc could state.
