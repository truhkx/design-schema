**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Give contrast pairs a real non-text kind, a state, a surface and value narrowing, per site/src/content/docs/process/schema-hardening.md, Phase 2 table, row 618. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the whole spec. Phase 1 (600–608) and jobs 610–617 have landed; read the current files, not the review.

`contrastPair` in schema/component.ts has four fields: `foreground`, `background`, `level` and `large`. tools/check_contrast.ts `THRESHOLDS` knows only text floors. WCAG 1.4.11 (3:1 for component boundaries, focus indicators, state indicators and meaningful icons) has no field, so docs write `large: true` to get 3:1. Today 46 of the 182 pairs, in 26 docs, set `large: true`, and every one of them is a non-text token (the plan's review counted 49):
- 18 on `color.control.selectedBackground`
- 9 on `color.border.strong`
- 3 on `color.control.border`
- 8 status or inverse-status icons
- 3 focus colors (`color.border.focus` in DataGrid, `color.inverse.focus` in Button and Toast)
- 3 Switch thumb and track pairs
- `color.border.danger` in DataGrid
- the BottomSheet handle

The fiction leaks in three places:
- The AlertDialog generators logged "chose size="lg" since the a11y.contrast entry for the icon marks large: true" (generated/gaps/AlertDialog.*.md, two rounds).
- bottomsheet.md declares `color.foreground.muted` on `color.overlay.surface` twice, once plain and once with `large: true`, and nothing says the second one is the drag handle.
- apps/website/src/component-page.ts and site/src/components/SchemaTables.astro label all 46 pairs "(large text)".

Three smaller gaps come with it:
- A pair cannot say which state it holds in. Switch's `color.control.selectedForeground` on `color.control.trackOff` is the off-state thumb.
- progressbar.md writes `color.status.success.icon` and `color.status.danger.icon` as two literal pairs. `{tone}` would also expand `neutral`, and there is no `color.status.neutral.*` token.
- `main` checks a background that resolves to `transparent` against `color.background`, whatever surface the component really sits on. Only `color.action.ghost.background` resolves to `transparent`.

1. **Schema.** In schema/component.ts add these fields to `contrastPair`. Make each one `.optional()` with no `.default()`, so the parsed output of every current doc stays unchanged:
   - `nonText: z.boolean()`: the pair is a WCAG 1.4.11 non-text pair, checked at 3:1.
   - `state`: a `z.enum` of `default`, `hover`, `pressed`, `focus`, `selected`, `checked`, `expanded`, `open`, `invalid`, naming the state the pair holds in. Leave `disabled` out, and say why in `.describe()`: WCAG 1.4.3 and 1.4.11 exempt inactive components.
   - `surface: tokenRef`: what a background that resolves to `transparent` is checked against, instead of `color.background`.
   - `only: z.record(z.string(), z.array(z.string()).min(1))`: narrows `{slot}` expansion. It maps a prop name to the subset of that prop's enum values the pair covers.
   Give every new field a `.describe()`. Replace the `large` inline comment with a `.describe()`: large text only (18pt, or 14pt bold); boundaries, indicators and icons use `nonText`.
2. **Checks.** Push these issues from `componentDef.check`, with paths under `['a11y', 'contrast', i, …]`:
   - `nonText` together with `large: true`: `a nonText pair has no large-text threshold; remove 'large'`
   - `nonText` with `level: AAA`: `WCAG 1.4.11 has no AAA level; a nonText pair is checked at 3:1 — use level AA`
   - an `only` key that is not a `{slot}` in this pair's foreground or background, or that is not an enum prop
   - an `only` value that is not in that prop's `values`
   Word the two `only` messages like the existing ones (`… is not an enum prop`, `… is not one of …`, quoted with `pyRepr`). No current doc can trigger any of these, because none uses the new fields. Keep every existing message word for word.

   **Warning, for phase 3 to flip.** Add one rule to job 609's `componentWarnings` in schema/component.ts, not to `.check`. tools/parse.ts already forwards its results through `warn`; do not add another warning channel. The rule fires on a pair with `large: true`, no `nonText`, and a foreground matching `color.border.*`, `color.control.*`, `color.inverse.status.*`, `*.icon` or `*.focus`:
   - path: `['a11y', 'contrast', i, 'large']`
   - message: `large: true on a non-text pair (<foreground>); WCAG 1.4.11 pairs set nonText: true`
   Today it fires exactly 45 times. The 46th `large: true` pair, BottomSheet's `color.foreground.muted` handle, matches none of those families. Name it in your summary; do not widen the rule to catch it.
3. **Expansion.** Give `expand` in schema/lib.ts an optional third parameter, `only`, that filters each slot's values before the product. In tools/check_contrast.ts `main`, pass `pair.only` for both foreground and background, so the filter runs before the same-slot zip. `lockRule`'s `tokenPaths` keeps calling `expand` without `only`, so locking stays a superset and nothing locked today becomes overridable.
4. **Checker.** In tools/check_contrast.ts:
   - `THRESHOLDS` gains a non-text entry of 3.0, and `threshold` takes the flag. A `nonText` pair's line ends `(needs 3.0 for AA non-text)`.
   - A pair with `state` adds `, <state>` inside those parentheses.
   - A `transparent` background resolves to `pair.surface` when set, else to `color.background`. Keep today's `KeyError` text for a missing `color.background`. A `surface` the palette lacks prints the existing `unknown token` line.
   - Lines for pairs without the new fields stay byte-identical.
   In mcp/server.ts, the `check_contrast` tool gains an optional `non_text` boolean next to `large_text`. It sets the required ratio to 3.0 and is returned in the result.
5. **Readers.** In apps/website/src/component-page.ts and site/src/components/SchemaTables.astro, show `(non-text)` for a `nonText` pair, and the state when one is set, the same way both already show `(large text)`. Change nothing else in those files.
6. **Tests.**
   - tools/__tests__/component-schema.test.ts: one failing fixture per rule in step 2, asserting path and message. Add one passing fixture that uses all four new fields. Add `componentWarnings` fixtures:
     - a `large: true` pair on `color.border.strong` warns, with the exact path and message
     - the same pair with `nonText: true` and no `large` does not warn
     - a `large: true` text pair on `color.foreground` does not warn
   - tools/__tests__/check_contrast.test.ts, using the palette hooks the file already uses:
     - a `nonText` pair at about 3.2:1 passes and one at about 2.9:1 fails, asserting the line text
     - `only: { tone: [success, danger] }` checks exactly two combinations
     - a ghost background with `surface: color.overlay.surface` is checked against that token
   - The test file that covers `expand` (grep for it): `only` filtering.
   - Whichever mcp/__tests__ file covers the `check_contrast` tool: `non_text`.
7. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/check_contrast.ts
    pnpm --filter website build
    pnpm --filter site build
    node logs/600-baseline.mjs --out 618

Proof that the fields are real and nothing moved:
- The standalone `check_contrast.ts` run ends with the same `N pairs checked, 0 failures` line as logs/600-measure-617/check.log. If that file is missing, use the highest-numbered measure present.
- In logs/600-measure-618.json, `corpus.componentsJsonSha256` equals that previous measure's value, because no parsed doc changed.
- generated/parse-warnings.json (job 609) holds exactly 45 entries whose message starts with `large: true on a non-text pair`.
- Every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

In your summary, list the 46 `large: true` pairs by component and token, each marked "nonText" or "really large text". That is the worklist for the phase 3 migration.

Do not modify `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/`. The 46 pairs keep `large: true` until phase 3.
