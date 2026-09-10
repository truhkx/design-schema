# Gaps reported while generating Container for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 21:07 — round 1

- Container: the `gutter: narrow`/`wide` values have no explicit spec statement on whether they're fixed or also responsive; I treated only `default` as responsive (per its own description) and made `narrow`/`wide` static single values, since giving every gutter value the same three-tier responsive behavior would make the enum redundant.
- Container: `width: full` and `gutter: none` have no 'no-op' token, so I omit the CSS custom-property hook entirely for those modifier classes and let the property fall back to the literal `none` (max-inline-size) / `0` (padding-inline), mirroring Box's `surface: none` pattern — not stated explicitly in the schema but consistent with the codebase convention.
- Container: `element` is web/lit-only per platforms metadata, so no RN handling was needed; not a gap, just confirming the field was read correctly.
- Container: no dev-only warnings were specified or obviously needed (unlike Card's single-interactive-child check), so none were added.

## 2026-09-09 21:08 — round 2

- build gate `parse`: fails on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema) — unrelated to Container, which parses without error. This is a pre-existing docs/schema mismatch outside the React generator's scope (site/ and schema/ are off-limits here); it needs to be fixed by editing checkbox.md/switch.md frontmatter or the schema itself in the separate docs-fixing pass, not in packages/react.

## 2026-09-09 21:08 — round 3

- build gate `parse`: still fails only on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema) — confirmed unchanged from round 2, and container.md continues to parse without error. This is a pre-existing docs/schema mismatch unrelated to Container and outside the React generator's editable scope (site/ and schema/); no change to packages/react/src/Container.* can affect this gate's outcome. Needs a fix to checkbox.md/switch.md frontmatter or the schema's allowed properties in the separate docs-fixing pass.

## 2026-09-09 21:53 — round 1

- Container: no changes were needed — the existing implementation already matched the spec exactly (props, tokens, media-query literals verified against the built token file at 960px/1280px, override contract, index.ts export).
- Container: found an existing Container.test.tsx in the tree, which conflicts with my stored memory that only Switch has tests and the other 75 test targets are intentionally deferred pending user decision — left it untouched since generating/modifying tests wasn't requested, but this may mean that decision has since changed.
- Container (package-wide): none of the existing components implement the `data-ds="<Name>"` root testability hook the generation instructions call for; since the digest/conventions doc doesn't mention it and no sibling component has it, I did not add it to Container alone to avoid inconsistency — flagging for a package-wide decision instead.

## 2026-09-09 21:54 — round 2

- Container: the reported `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Container and to the React package entirely — those files live under site/src/content/docs/components/, which the docs-fix pass owns and I'm instructed not to edit. Container's own files parse and lint clean (verified with tools/parse.py and tools/lint_literals.py). No code change was made; this needs to be routed to whatever pass generates checkbox.md/switch.md frontmatter (likely a stray 'behavior' key added to their schemas that isn't in the component JSON Schema).

## 2026-09-09 21:54 — round 3

- Container: identical to Round 2 — the `parse` gate failure is still exclusively about checkbox.md and switch.md frontmatter ('behavior' property not allowed by the component schema), files under site/src/content/docs/components/ that I'm instructed not to edit. This is unrelated to Container or the React/web package; re-verified Container.tsx/Container.css independently pass tools/lint_literals.py and tools/parse.py reports no error for container.md. Since the same report recurred unchanged, flagging that whatever is meant to clear checkbox.md/switch.md's stray 'behavior' frontmatter key (or the schema itself) hasn't run yet — this needs to be fixed at the docs/schema layer, not in packages/react.

## 2026-09-09 22:23 — round 1

- Container.tsx, Container.css, Container.stories.tsx, and the index.ts export already existed and matched the spec; the only deviation was a missing data-ds="Container" testability hook on the root element, which I added. No ambiguity in the schema itself required a judgment call.
