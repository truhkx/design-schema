# Gaps reported while generating Container for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 21:14 — round 1

- No token exists for a 'none' gutter or a 'full' max-width, and no `layoutMaxWidthFull`/zero-gutter token is named in the spec — used a literal `0` for gutter:none padding and simply omit `maxWidth` for width:full, matching the doc's 'renders no max-width'/'renders no padding' language (both fall under the linter's allowed bare literals).
- Container has no `behavior:` scenario block in its schema (unlike Switch), so Container.test.tsx follows Box.test.tsx's derived-only shape (one 'renders' check plus one per enum value for width/gutter/align) rather than Switch's given/when/then narrative — there's no interaction or a11y role to assert against.
- The `element` prop is scoped to web/lit only in the schema, so it's absent from ContainerProps entirely on RN, per the platform notes ('View with maxWidth, alignSelf... `element` does not apply on React Native' is implied but not stated verbatim — inferred from Box's identical pattern).

## 2026-09-09 21:15 — round 2

- parse gate: fails on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema), unrelated to Container — Container's own doc has no `behavior` block and parses cleanly. This is a schema/docs mismatch from the prior behavior-scenarios rollout; fixing it requires editing schema/ or site/ docs, which is out of scope for the RN generator. No change made to packages/rn/src/Container.* since all Container-specific gates (literals, typecheck, tests) already pass.

## 2026-09-09 21:16 — round 3

- parse gate: checkbox.md and switch.md fail schema validation because schema/component.schema.json's component definition uses additionalProperties: false and has no 'behavior' key, while both docs carry a behavior: frontmatter block from the prior behavior-scenarios rollout. This is unrelated to Container (whose doc has no behavior block and parses cleanly) and unrelated to the RN package (literals/typecheck/tests all pass). Fix requires editing schema/component.schema.json to allow 'behavior', or editing the two docs — both out of scope for this generator; no Container code change resolves it.

## 2026-09-09 21:58 — round 2

- parse gate: unrelated to Container — checkbox.md and switch.md carry a `behavior:` frontmatter block (added in the 2026-09-09 behavior-scenarios rollout) that `schema/component.schema.json`'s `component` definition rejects (`additionalProperties: false`, no `behavior` key defined). container.md itself parses cleanly and Container.tsx/.stories.tsx/.test.tsx/index.ts are unchanged. Fixing this requires editing schema/component.schema.json to add a `behavior` property definition, or removing/relocating the frontmatter in checkbox.md and switch.md — both are under the forbidden site/schema paths for this generator pass, so I'm reporting rather than editing.

## 2026-09-09 21:59 — round 3

- parse gate: unchanged from round 2 — unrelated to Container. checkbox.md and switch.md carry a `behavior:` frontmatter block (from the 2026-09-09 behavior-scenarios rollout) that schema/component.schema.json's `component` definition rejects (`additionalProperties: false`, no `behavior` key defined). container.md parses cleanly and Container.tsx/.stories.tsx/.test.tsx/index.ts are unchanged and passing (11/11 tests). Fixing this needs a schema/component.schema.json edit (add a `behavior` property) or a checkbox.md/switch.md frontmatter edit — both are under the forbidden site/schema paths for this generator pass, so I'm reporting rather than editing. This is a repo-wide gate blocker, not something fixable from the Container generator.
