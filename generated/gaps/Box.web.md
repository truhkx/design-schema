# Gaps reported while generating Box for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 20:30 — round 1

- Box: no existing component implements the `overrides`/`TokenRef`/`cssVar` per-instance override pattern described in the package conventions, so I designed it from scratch — each overridable binding gets a `--ds-box-<binding>` CSS hook (kebab-case), and `overrides` sets that hook inline via `cssVar(ref)`, merged with any consumer-supplied `style`. Future components should follow the same shape for consistency.
- Box: a11y.role is 'none' and a11y.requires is empty, so none of the 33 scenarios exercise interaction or accessibility assertions — every one reduces to a render check (`container.firstChild` not null), per the spec's own `then: renders: true` for each.
- Box: 'surface: none renders nothing rather than a token' was implemented by simply not setting the `--ds-box-background` custom property for that modifier (falling back to the CSS `var(..., transparent)` default) rather than omitting a background-color declaration entirely — functionally equivalent but worth flagging as an interpretation.
- Box: the spec's Related section names Card and Container, neither of which exists in the package yet, so Box does not compose with them (nothing to compose with).

## 2026-09-09 21:41 — round 2

- Box: the `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Box and lives in site/ docs, which this task's rules forbid editing — needs a schema or docs fix outside the React package, not a Box code change.

## 2026-09-09 21:41 — round 3

- Box: the `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Box and lives in site/ docs, which this task's rules forbid editing — needs a schema or docs fix outside the React package, not a Box code change. Repeated from round 2 unchanged.

## 2026-09-09 22:16 — round 1

- Box.tsx, Box.css, Box.stories.tsx, and the index.ts export already existed and fully matched the spec; the only change made was adding the `data-ds="Box"` testability hook, which was missing (no other component in the package has it yet either, so this is the first).

## 2026-09-10 00:52 — round 1

- Box: the doc's override contract says surface:none/border:false/radius:none make the matching overrides no-ops; the existing implementation already achieved this for border (border-width stays a literal 0 outside the .ds-box--border class) but not for surface/radius (background-color/border-radius read var(--ds-box-background)/var(--ds-box-radius) unconditionally, so an inline override could re-enable a background or corner radius even when surface/radius said 'none'). Fixed by making those two properties literal in the base rule and only applying the hook inside the non-'none' modifier classes, mirroring the border pattern already in the file.
