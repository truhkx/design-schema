# Gaps reported while generating Heading for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:47 — round 1

- Heading: spec doesn't specify RN's marginBlockEnd style property name; used RN's `marginBottom` (the only equivalent RN TextStyle offers) to realize the `space.sm` margin-block-end token, same choice the pre-existing file had made.
- Heading: overrides prop, HeadingOverridableBinding type, and root testID="Heading" were listed as required package conventions but missing from the pre-existing Heading.tsx/index.ts; added them without changing any other existing behavior.
- Heading: no Heading.test.tsx existed for the 16 behavior scenarios; added one mirroring Text.test.tsx's setup()-from-Default-story-args pattern since the spec doesn't specify a different fixture strategy.

## 2026-09-16 02:19 — round 1

- Heading: Related names Text and the rules say compose it, but the package's Text cannot carry `accessibilityRole="header"`, has no 4xl/3xl/2xl sizes, has no marginBottom, and locks `color` — so Heading renders React Native's `Text` directly and re-declares the five typography bindings. Either Text's schema grows an accessibility/role surface and the heading size steps, or the doc should stop implying composition here.
- Heading: `size` has no `default` in the schema — only the prose 'Defaults per level: 1 → 4xl … 6 → md'. I encoded that table as LEVEL_SIZE. It belongs in the schema as a per-level default map, since three platforms are each parsing the same sentence.
- Heading: the two behavior scenarios in the doc (`level-puts-the-heading-in-the-outline`, `size-does-not-change-the-outline`) are marked `platforms: [web]`, so on React Native nothing asserts that the header trait is set at all — the 16 derived scenarios are pure `renders: true`. A scenario asserting `accessibilityRole="header"` on every level would be expressible here and is the one thing worth testing on this platform.
- Heading: anatomy declares a single part `text`, which is also the root. The convention gives the root `testID="Heading"` and a part `testID="Heading.text"`, and one element cannot have both. I used `testID="Heading"` only; the doc should say the part hook is dropped when a part is the root.
- Heading: `marginBlockEnd` is unconditional — there is no prop or context to suppress it on the last heading in a container, and no `marginBlockStart`, so a heading following a paragraph relies entirely on the parent's gap. If a caller wants it off they must override it to a zero-valued token, which the theme does not obviously expose.
- Heading: `align: start|end` has no logical `textAlign` on React Native, so I resolve it through `I18nManager.isRTL` at render time (shared `toTextAlign` from Text). A writing-direction change mid-session does not re-render the heading — same known limit as Text, undocumented in the schema.
- Heading: `a11y.requires` lists `contrast-aaa`, which is a token-choice guarantee with nothing to implement in code beyond keeping `color` locked to `color.foreground.strong`. It reads as an implementation requirement in the generation rules; it should be marked as checked by the contrast gate instead.
- Heading: the overrides contract types every entry as `TokenRef`, so `overrides.fontSize` may name a color token. I cast `resolveToken` results to `number`/`string` per binding without validating, like every other component in the package — a per-binding TokenRef subtype would make this checkable.
- Heading: `level` accepts both '1' and 1 per the rules, but the schema does not say which form the docs, stories or a naming/extension layer should treat as canonical beyond a prose 'Canonical values are strings'. I used strings in the stories and accept both in the type.
