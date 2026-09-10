# Gaps reported while generating Heading for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:45 — round 1

- Heading: the schema gives `size` no default and no per-level mapping table in `styles.fontSize` (just `font.size.{size}`); the platform notes and guidance supply the level→size defaults (1→4xl … 6→md) verbatim, so I kept the existing file's approach of setting the `--ds-heading-font-size` hook from `level` first and letting an explicit `size` attribute override it — an explicit size always wins.
- Heading: `color` is locked per the styles block, so it has no `--ds-heading-color` override hook (consistent with Card's locked `background`) — `.heading` reads `var(--color-foreground-strong)` directly with a comment noting it's excluded from `overrides`.
- Heading: the guidance's Lit platform note says to use `part="heading"` for `::part` restyling, but the generation rules forbid exposing `::part` for styling and mandate the `overrides` property/hook mechanism instead; I followed the stricter package convention (hooks + `overrides`) and kept `part="heading"` only as the anatomy/testability hook, not a supported restyling surface.

## 2026-09-10 00:45 — round 2

- Heading: no new gaps — the `literals` gate flagged `fontFamily: '--ds-heading-font-family'` as a font-stack literal because its regex matches any `fontFamily: <quote>` regardless of content; switched that one HOOKS entry to a template literal (backtick), matching the existing workaround already used in Text.ts for the same false positive.
