# Gaps reported while generating Breadcrumb for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:59 — round 1

- Breadcrumb (rn): the schema says the nav's fontSize binding is inherited by nested Links ('Set on the nav; the Links inherit it'), but ancestor items wrap Link in `<Text size="sm">`, a fixed enum prop, so a `fontSize` override changes the nav's own text (current page, separators, ellipsis glyph) but not the ancestor Links' inherited size — Link has no way to receive an arbitrary token override for inherited typography. Left as-is since fixing it would mean adding a new prop to Link, which the instructions say grows only via the child's own schema.
