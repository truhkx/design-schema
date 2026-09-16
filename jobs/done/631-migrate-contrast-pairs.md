**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Migrate every `large: true` contrast pair that is not large text to the WCAG 1.4.11 fields job 618 added, and flip 618's warning to an error, per site/src/content/docs/process/schema-hardening.md, "Phase 3: migrate the docs". Read "Rules every job follows", "Measuring a job" and the Phase 2 and Phase 3 sections first, then read jobs/done/618-contrast-pair-kinds.md, `contrastPair`, `CONTRAST_STATES`, the contrast rules in `componentDef.check` and `largeNonTextPairs` in `componentWarnings` in schema/component.ts, `THRESHOLDS`/`threshold`/`main` in tools/check_contrast.ts, and the contrast tests in tools/__tests__/component-schema.test.ts and tools/__tests__/check_contrast.test.ts. This is the only job that may change `a11y.contrast`; it changes nothing else in a doc.

46 of the 51 docs declare 182 contrast pairs. 46 pairs set `large: true`, and 45 of them are a component boundary, a state or focus indicator or a meaningful icon — large text standing in for 1.4.11's 3:1. generated/parse-warnings.json records each as `large: true on a non-text pair (<foreground>); WCAG 1.4.11 pairs set nonText: true`, grouped by token family:

| Foreground | Warnings | Docs |
|---|---|---|
| `color.control.selectedBackground` | 18 | carousel, checkbox, datagrid ×2, datepicker, feed, listbox ×2, progressbar, radiogroup ×2, slider, splitter, stepper, switch, table, tabs, tree |
| `color.border.strong` | 9 | carousel, combobox, datepicker, input, numberinput, search, select, splitter, stepper |
| `color.status.{tone}.icon` | 4 | alert, alertdialog, meter ×2 |
| `color.control.border` | 3 | checkbox, radiogroup, tree |
| `color.inverse.focus` | 2 | button, toast |
| `color.status.danger.icon` | 2 | progressbar, stepper |
| `color.control.selectedForeground` | 2 | switch ×2 |
| singles | 5 | datagrid `color.border.danger`, datagrid `color.border.focus`, progressbar `color.status.success.icon`, switch `color.control.trackOff`, toast `color.inverse.status.{tone}` |

The 46th `large: true` pair is BottomSheet's `color.foreground.muted` on `color.overlay.surface`; job 618 left it out of the rule because its token is a text token, and bottomsheet.md declares the same pair twice, once plain and once large, with only the prose saying the second is the drag handle. It is your one open question — see step 4. These counts were true when this prompt was written; assert what you find and list it, and do not stop because a number moved.

1. **Take the worklist.** Do this first, and keep both outputs.

       node -e "const w=require('./generated/parse-warnings.json'); const m=w.filter(x=>x.message.includes('large: true on a non-text pair')); for(const x of m) console.log(x.file+' | '+x.message); console.log(m.length+' warnings')"
       node -e "const cs=require('./generated/components.json').map(e=>e.component); let n=0; for(const c of cs) for(const [i,p] of (c.a11y.contrast||[]).entries()) if(p.large){n++; console.log(c.name,i,p.foreground,'on',p.background,p.level||'AA');} console.log(n+' large pairs')"

2. **`large: true` → `nonText: true`.** For each warned pair, drop `large` and set `nonText: true`. `foreground`, `background` and `level` do not change: every one of the 45 is at `level: AA`, and `THRESHOLDS` gives `AA/large` and `AA/non-text` the same 3.0, so no ratio moves. `componentDef.check` rejects `nonText` beside `large: true` and `nonText` at `level: AAA`, so a mistake fails `pnpm check` immediately.

   Before, in site/src/content/docs/components/checkbox.md:

   ```yaml
       contrast:
         - { foreground: color.control.selectedForeground, background: color.control.selectedBackground, level: AA }
         - { foreground: color.control.selectedBackground, background: color.background, level: AA, large: true }
         - { foreground: color.control.border, background: color.background, level: AA, large: true }
   ```

   After:

   ```yaml
       contrast:
         - { foreground: color.control.selectedForeground, background: color.control.selectedBackground, level: AA }
         - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
         - { foreground: color.control.border, background: color.background, level: AA, nonText: true }
   ```

   **The pair list itself does not change.** Do not add a pair, remove one, merge two literal pairs into one interpolated pair, or split an interpolated pair: `1284 pairs checked, 0 failures` must stay true, and that is the invariant that proves it. ProgressBar's literal `color.status.success.icon` and `color.status.danger.icon` pairs stay two literal pairs; Meter's two `color.status.{tone}.icon` pairs stay as they are.

3. **`state`, only where the prose names one.** `CONTRAST_STATES` is `default, hover, pressed, focus, selected, checked, expanded, open, invalid` — there is no `disabled` and no `unchecked`. Add `state` only where the doc's own prose says the pair holds in one of those states and the pair would otherwise read as every state. Switch is the case job 618 named: `color.control.selectedForeground` on `color.control.selectedBackground` is the thumb on the on-track, and on `color.control.trackOff` the same thumb off. Read switch.md before deciding; `checked` is available for the on pair, nothing fits the off pair, so the conservative outcome is to leave the off pair without a `state`. Omitting `state` is always allowed and always correct-by-default: omit wherever the prose does not name the state, and list every pair where you added one and every pair where you considered it and did not.

4. **`surface`, only where a background resolves to `transparent`.** Only `color.action.ghost.background` does, and no pair declares it today:

       node -e "const cs=require('./generated/components.json').map(e=>e.component); const hits=cs.flatMap(c=>(c.a11y.contrast||[]).filter(p=>/ghost/.test(p.background)).map(p=>c.name+' '+p.foreground+' on '+p.background)); console.log(hits.length?hits:'no transparent-background pairs')"

   If that prints nothing, set `surface` nowhere and say so. If it prints a pair, set `surface` to the token the doc's prose says the component sits on, and to nothing otherwise.

   Then settle BottomSheet. Read bottomsheet.md: both `color.foreground.muted` on `color.overlay.surface` pairs, and the prose about the drag handle. If the prose says the second pair is the handle, it is a non-text pair — set `nonText: true` and drop `large`. If the prose does not say, leave it exactly as it is. Either way, name it in your summary as a decision the owner should confirm, and do not widen the flipped rule to cover it.

5. **`only`, only to narrow an existing interpolation.** `only` maps an enum prop interpolated in this pair's `foreground` or `background` to the subset of its values the pair covers. Add it only where an existing `{slot}` pair already covers fewer values than the prop has and the doc's prose says which — for example a `{tone}` pair on a component whose `tone` includes a value with no such token. Do not introduce a `{slot}` where the doc writes literal tokens, because that changes the pair count. Expect to add none; report what you did.

6. **Flip the check.** In schema/component.ts move `largeNonTextPairs` out of `componentWarnings` — delete it from the return array — and raise the same issue from `componentDef.check`, beside the two `nonText` rules that are already there. The message stays word for word:

       large: true on a non-text pair (<foreground>); WCAG 1.4.11 pairs set nonText: true

   at path `['a11y', 'contrast', i, 'large']`, with the same `NON_TEXT_FOREGROUND` family test and the same guard (`large === true` and `nonText === undefined`). `componentWarnings` keeps every other rule; do not add a second warning channel and do not reword anything.

7. **Tests.** In tools/__tests__/component-schema.test.ts:
   - `generated/components.json has 45 large non-text pairs; the BottomSheet handle matches no non-text family` pins the old list and is rewritten: a rejection fixture (a `large: true` pair on `color.border.strong`) asserting path and message with the file's `rejects` helper, plus a corpus assertion that no entry of generated/components.json raises that issue. If BottomSheet keeps its `large: true`, assert that it is the only `large` pair left in the corpus; if you migrated it, assert there are none.
   - The three fixture tests under `describe('componentWarnings for large non-text pairs')` become `rejects`/`accepts` tests: the `color.border.strong` pair rejects, the same pair with `nonText: true` and no `large` is accepted, and a `large: true` text pair on `color.foreground` is still accepted — `large` stays legal for real large text.
   - tools/__tests__/check_contrast.test.ts needs no change, but run it and say so; if a case there depended on a doc you edited, fix the case, not the doc.

8. If `node --import tsx tools/schema.ts --check` reports drift, run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 631

In logs/600-measure-631.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty — `lockRule` matches contrast pairs, so a pair you dropped or retyped could unlock a binding; that field is the guard. `pnpm generate:check` fails on stale prompt hashes because you edited docs; that is phase 4's job, not a failure. `corpus.componentsJsonSha256` changes for the same reason. `corpus.derivedScenarios` and `behavior.skips` must not move.

Job-specific proof:
- `logs/600-measure-631/check.log` ends its contrast step with `1284 pairs checked, 0 failures` — the same line as logs/600-measure-629/check.log. A different pair count means you added, removed or merged a pair; fix the doc, not the number.
- `generated/parse-warnings.json` holds zero entries of this rule:

      node -e "const w=require('./generated/parse-warnings.json'); const m=w.filter(x=>x.message.includes('large: true on a non-text pair')); console.log(m.length+' large-non-text warnings'); process.exit(m.length?1:0)"

- The rejection fixture from step 7 proves the rule now errors, with the message text unchanged.
- Every migrated pair reads `nonText: true` with no `large`:

      node -e "const cs=require('./generated/components.json').map(e=>e.component); const n=cs.flatMap(c=>(c.a11y.contrast||[]).filter(p=>p.nonText)).length; const l=cs.flatMap(c=>(c.a11y.contrast||[]).filter(p=>p.large)).length; console.log(n+' nonText, '+l+' large')"

In your summary: the counts you found, the per-family migration tally, every pair you gave a `state` and every pair you deliberately left without one, whether `surface` or `only` applied anywhere, and what you decided about BottomSheet and why. Those are the owner's review list.

Runner limits: Read, Write, Edit, MultiEdit, Glob, Grep, `Bash(pnpm *)`, `Bash(node *)`, `Bash(git status*)`, `Bash(git diff*)`. No PowerShell, no npx, no `git add` or `git commit`.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any doc field other than `a11y.contrast`. `a11y.requires`, copy and prop types belong to other jobs.
