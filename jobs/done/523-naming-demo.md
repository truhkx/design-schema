Build a worked example proving the naming mechanism per claude/customization-and-naming.md ("Jobs for Claude Code", job 523).

1. `themes/demo-brand/naming.md`: a real (not a throwaway fixture — job 520's fixture stays a schema-validation aid) example naming doc, renaming a handful of components (e.g. `Button → CtaButton`, `Disclosure → Expander`) and the namespace (`ds → demo`), documented with comments explaining each choice, meant to be read by a human evaluating whether the mechanism is legible.
2. Regenerate 2–3 components under `themes/demo-brand/naming.md` into a scratch location (not `packages/*/src` — a sibling output directory so the canonical build is untouched) and set them up side by side with the unrenamed originals, ideally surfaced somewhere in `apps/website` or its Storybook (coordinate with `claude/website-plan.md`'s territory — this is the "proof of concept" proving the proof of concept) so the comparison is actually visible, not just described.
3. Diff the renamed output against the canonical output component-by-component: confirm every difference is an identifier (file name, export name, CSS prefix) and nothing else — same DOM structure, same props' behavior, same accessibility tree.
Gate: the renamed build passes every gate (contrast, keyboard-spec, lint-literals, behavior tests, typecheck) exactly as the canonical build does; the diff step in 3 produces zero non-identifier differences. Do not modify `packages/*/src` or the canonical `generated/` output — this job's regenerated output lives in its own directory.

## Log

Done 2026-09-12. The two `claude/*.md` paths this prompt names are
`site/src/content/docs/process/{customization-and-naming,website-plan}.md` in this repository; both
gained a "what building it changed" section.

| | |
| --- | --- |
| `themes/demo-brand/naming.md` | the doc: `Button: CtaButton`, `Disclosure: Expander`, `Alert: Callout`, `Button.variant: emphasis`, `ds → demo`, `@design-schema → @demo` |
| `packages/react/demo-brand/` | the renamed tree — 21 source files and 3 renamed behavior tests, a sibling of `src/`, with `DIFF.md` and `renames.json` beside it |
| `tools/naming_demo.ts` | builds it, diffs it, gates it: `pnpm demo:naming`, `demo:naming:check` (now part of `pnpm check`), `demo:naming:gates` |
| `apps/website` | `/docs/naming-demo`, the side-by-side comparison, in the docs sidebar beside Foundations and Patterns |
| `tests/website/naming-demo.spec.ts` | the browser gate: same DOM, same accessibility tree, same behaviour, canonical hooks intact |
| `logs/523-demo-pull.mjs` | the trial pull job 522's guide was waiting on: upstream adds a prop, the fork pulls, one regeneration brings it through under the brand's names |

Gate, as run:

```
pnpm demo:naming:gates
  ✔ diff       591 difference(s), every one an identifier
  ✔ round-trip 24 file(s) revert and re-apply byte for byte; 1 file(s) whose canonical prose the revert rewords
  ✔ contrast   1284 pairs checked, 0 failures
  ✔ keyboard   87 derived spec(s) unchanged by the naming doc
  ✔ literals   0 finding(s) in 21 file(s)
  ✔ typecheck
  ✔ behavior   51 scenario(s), same verdict on both builds (1 failing on both)
pnpm check            ✔ (includes demo:naming:check)
pnpm test:tools       1407 passed (38 files, 35 of them new here)
pnpm gates:website    228 passed (14 of them new here)
node logs/523-demo-pull.mjs   all steps passed
```

Two readings the gate line needed, both written up in `process/customization-and-naming.md`:

- **"Passes every gate" is parity, not green.** `Button`'s `press-tracks` behavior scenario fails on the
  canonical build (the doc says `onTrack` takes an object; the component passes two arguments). The gate
  runs the derived scenarios against both builds and requires the same verdict on each, which is the
  stronger claim and the only honest one while that stays true.
- **The canonical → brand → canonical round trip is not an identity, and the demo keeps the case that
  shows why.** `emphasis` is already a word in Button's JSDoc ("Visual emphasis"), so the revert reads it
  as the brand's name and writes "Visual variant". The trip a fork actually takes — brand → canonical →
  brand — *is* byte-exact and is what the gate checks; the reworded comment lives for one gate run and
  never reaches a fork's disk. `DIFF.md`'s "Prose collisions" section is where it is reported.
