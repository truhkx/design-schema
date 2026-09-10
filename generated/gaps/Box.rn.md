# Gaps reported while generating Box for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 20:38 — round 1

- Box: overrides contract has no precedent in this package (no existing RN component implements `overrides`/`TokenRef`/`resolveToken`), so I imported `TokenRef`/`resolveToken` directly from `@design-schema/tokens` (per the package-conventions digest) rather than from `./theme` (as the component prompt's Overrides section says) — `theme.tsx` doesn't export either symbol.
- Box: when `overrides.background` is set but `surface` is `none`, I chose to render the overridden background anyway (an explicit per-instance override wins over the surface default, including forcing a background where the enum alone would render none). The spec doesn't say whether an override should be able to introduce a background that the enum value suppressed.
- Box: when `border` is `false`, `overrides.border`/`overrides.borderWidth` are ignored (no borderWidth/borderColor styles at all) since there is no border to color. The spec doesn't state whether an override should be able to force a border into existence independent of the boolean prop.
- Box: `overrides.radius` always wins over the `radius` enum's resolved token, including when `radius` is `none` — same reasoning as background.

## 2026-09-09 21:42 — round 1

- Box.tsx, Box.stories.tsx, Box.test.tsx, and the index.ts export already existed from a prior pass and matched the spec; the only fix was adding the missing testID="Box" on the root View, which the package convention requires but the existing file lacked (Stack.tsx also lacks it, but Container.tsx has it — followed Container's precedent).

## 2026-09-09 21:43 — round 2

- parse gate failure is not caused by Box: checkbox.md and switch.md have a `behavior` frontmatter key (added during the behavior-scenarios rollout) that schema/component.schema.json does not yet permit ('Additional properties are not allowed (\'behavior\' was unexpected)'). Both files are under site/ and the schema is under schema/, which I'm barred from editing per instructions, and neither is the Box doc. Box's own code passes lint_literals and its test suite cleanly; this gate cannot be fixed from packages/rn without either updating the schema to allow `behavior` or removing it from those two docs, and that decision belongs to the separate docs-fixing pass, not this generation task.

## 2026-09-09 21:43 — round 3

- parse gate failure is unchanged from Round 2 and still not caused by Box: checkbox.md and switch.md carry a `behavior` frontmatter key (from the behavior-scenarios rollout) that schema/component.schema.json does not permit ('Additional properties are not allowed (\'behavior\' was unexpected)'). box.md itself parses without error. Both offending files live under site/ and the schema lives under schema/ — both off-limits per instructions, and neither belongs to Box. Re-verified packages/rn/src/Box.tsx independently: lint_literals --platform rn reports 0 findings and the test suite still passes 25/25. This conflict must be resolved by editing the schema or the two docs, which is outside this task's scope; no Box code change can make this gate pass.

## 2026-09-09 22:18 — round 1

- Box: file already existed with the override-precedence bug (background/radius overrides applied even when surface:none/radius:none disabled those bindings); fixed to match the explicit 'overrides never restore presence' rule, and updated WithOverrides story (was demoing a no-op override) to set surface:subtle/radius:sm so both overrides visibly take effect.
