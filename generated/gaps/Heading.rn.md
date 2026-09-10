# Gaps reported while generating Heading for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:47 — round 1

- Heading: spec doesn't specify RN's marginBlockEnd style property name; used RN's `marginBottom` (the only equivalent RN TextStyle offers) to realize the `space.sm` margin-block-end token, same choice the pre-existing file had made.
- Heading: overrides prop, HeadingOverridableBinding type, and root testID="Heading" were listed as required package conventions but missing from the pre-existing Heading.tsx/index.ts; added them without changing any other existing behavior.
- Heading: no Heading.test.tsx existed for the 16 behavior scenarios; added one mirroring Text.test.tsx's setup()-from-Default-story-args pattern since the spec doesn't specify a different fixture strategy.
