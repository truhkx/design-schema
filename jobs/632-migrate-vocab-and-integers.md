**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Point every enum prop whose values are a shared vocabulary at that vocabulary with `propDef.enumRef`, type the whole-number props `integer`, and flip job 619's warning to an error, per site/src/content/docs/process/schema-hardening.md, "Phase 3: migrate the docs". Read "Rules every job follows", "Measuring a job" and the Phase 2 and Phase 3 sections first, then read jobs/done/619-shared-vocab.md, all of schema/vocab.ts (`VOCAB`, `enumValues`), `propDef` and `vocabSubsets` in schema/component.ts, the `enumRef` resolution step in tools/parse.ts (the pass that fills `values` from the vocabulary right after validation), and the vocabulary tests in tools/__tests__/component-schema.test.ts and tools/__tests__/parse-checks.test.ts. This is the only job that may change `propDef.enumRef` and `propDef.type`; it changes nothing else in a doc.

`VOCAB` has three entries: `size` (`xs, sm, md, lg, xl, 2xl, 3xl, 4xl`), `tone` (`neutral, info, success, warning, danger`) and `foregroundTone` (`default, strong, muted, danger, onAction`). generated/parse-warnings.json records 19 enum props that spell out a subset of one of them and name none: `values are a subset of VOCAB.<vocab>; set enumRef: <vocab>`.

| Vocabulary | Props |
|---|---|
| `size` (13) | Button `size` `[sm, md, lg]`, Card `inset` `[sm, md, lg]`, DatePicker `size` `[sm, md]`, Dialog `size` `[sm, md, lg]`, Heading `size` `[4xl, 3xl, 2xl, xl, lg, md]`, Icon `size` `[xs, sm, md, lg, xl]`, Input `size` `[sm, md]`, NumberInput `size` `[sm, md]`, Search `size` `[md, lg]`, SegmentedControl `size` `[sm, md]`, Select `size` `[sm, md]`, Text `size` `[xs, sm, md, lg, xl]`, Toolbar `size` `[sm, md]` |
| `tone` (5) | Alert `[info, success, warning, danger]`, AlertDialog `[danger, warning, info]`, Meter `[info, success, warning, danger]`, ProgressBar `[neutral, success, danger]`, Toast `[neutral, success, warning, danger]` |
| `foregroundTone` (1) | Text `tone` `[default, strong, muted, danger, onAction]` |

Job 619 also left a worklist of number props that are whole numbers and say so only in prose: Carousel `perView` ("How many slides are visible at once") and `activeIndex` ("Controlled current slide (zero-based)"), DataGrid `rowCount` ("Total rows … sets aria-rowcount"), Feed `newItemsCount` ("Number of newer items available above"), NumberInput `precision` ("Decimal places to keep and display"). Carousel `interval` ("Milliseconds between automatic advances") is the judgement call — see step 4. The counts above were true when this prompt was written; assert what you find and list it, and do not stop because a number moved.

1. **Take the worklist.** Do this first, and keep both outputs.

       node -e "const w=require('./generated/parse-warnings.json'); const m=w.filter(x=>x.message.startsWith('values are a subset of VOCAB.')); for(const x of m) console.log(x.file+' | '+x.message); console.log(m.length+' warnings')"
       node -e "const cs=require('./generated/components.json').map(e=>e.component); for(const c of cs) for(const [n,p] of Object.entries(c.props||{})) if(p.type==='number') console.log(c.name,n,'default='+JSON.stringify(p.default),'|',(p.description||'').slice(0,90))"

2. **Add `enumRef` beside the existing `values`.** For each of the 19 props, add `enumRef` and leave `values` exactly as it is. `values` narrows the vocabulary to the subset the component really accepts, and keeping it is what makes this migration inert everywhere downstream: token `{slot}` expansion, derived render scenarios, contrast pair expansion and every generator keep reading the same list.

   Before, in site/src/content/docs/components/button.md:

   ```yaml
       size:
         type: enum
         values: [sm, md, lg]
         default: md
         description: Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size.
   ```

   After:

   ```yaml
       size:
         type: enum
         enumRef: size
         values: [sm, md, lg]
         default: md
         description: Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size.
   ```

   Put `enumRef` directly above `values` in every doc, so the diff reads the same way 19 times. Do not reorder a `values` list to match vocabulary order (AlertDialog's `[danger, warning, info]` and Heading's `[4xl … md]` are the doc's own order and the order their render scenarios derive in), do not add a value, and do not remove one. Text `tone` is the only list that equals a whole vocabulary; dropping its `values` would still parse, because tools/parse.ts refills them, but keep it — this job adds a reference, it does not delete content.

3. **Card `inset`.** Job 619 flagged it: `inset` binds `layout.inset.{inset}`, not the font or space scale, yet its values `[sm, md, lg]` are a subset of `VOCAB.size`, so the rule fires and, once flipped, would reject card.md. Set `enumRef: size` and keep `values: [sm, md, lg]` — the bindings resolve through `values`, which does not change — and name Card `inset` in your summary as the one prop whose vocabulary membership is a naming coincidence, for the owner to confirm. Do not special-case it in the rule.

4. **`type: integer`.** Change `type: number` to `type: integer` on Carousel `perView`, Carousel `activeIndex`, DataGrid `rowCount`, Feed `newItemsCount` and NumberInput `precision` — a slide count, a zero-based index, a row total, an item count and a number of decimal places. Nothing else changes in those props.

   ```yaml
       perView:
         type: integer
         default: 1
         description: How many slides are visible at once at the widest layout; fewer are shown as the viewport narrows (one below the prose width).
   ```

   Leave every measurement alone: Meter, ProgressBar and Slider `value`/`min`/`max`/`step`, NumberInput `value`/`defaultValue`/`min`/`max`/`step`, and Splitter's percentages all take fractions by their own prose. Carousel `interval` is yours to decide: read carousel.md, make the call, apply it, and give the reason in your summary — a millisecond delay is a whole number in every example the doc gives, and `integer` is also a new constraint on callers, so state which way you went and why.

   `propDef.check` requires an integer `default` on an integer prop and the same of every scenario `given` and `when.set` value, so a wrong call fails `pnpm check` at once. Check each changed prop's `default`, and grep its name across the doc's `behavior` and `examples` blocks before you change the type.

5. **Sweep all 51 docs.** After steps 2 to 4, check every enum prop in every doc: if its values are a subset of one vocabulary, it names that vocabulary. The worklist command is the proof; it must print `0 warnings` before you move to step 6. A prop whose values belong to no vocabulary (Link's `[default, inherit]`, Table's `captionLevel`, Carousel's `[dots, tabs, none]`) is left exactly as it is.

6. **Flip the check.** In schema/component.ts move `vocabSubsets` out of `componentWarnings` — delete it from the return array — and raise the same issue from `componentDef.check`, with the same guard (an enum prop, no `enumRef`, a non-empty `values` all of which belong to one vocabulary, the first in `VOCAB_NAMES` order that holds them). The message stays word for word:

       values are a subset of VOCAB.<vocab>; set enumRef: <vocab>

   at path `['props', name, 'values']`. `componentWarnings` keeps every other rule; do not add a second warning channel, do not reword anything, and keep the existing `enumRef` errors (`enumRef needs an enum prop, got '<type>'`, and a value outside the named vocabulary) as they are.

7. **Tests.** In tools/__tests__/component-schema.test.ts:
   - `generated/components.json has 19 enum props whose values are a subset of a vocabulary` pins the old list and is rewritten: a rejection fixture (`size: { type: enum, values: [sm, md] }`) asserting path and message with the file's `rejects` helper, plus a corpus assertion that no entry of generated/components.json raises that issue.
   - The three tests under `describe('componentWarnings for vocabulary subsets')` become `rejects`/`accepts` tests: `[sm, md]` with no `enumRef` rejects, the same prop with `enumRef: size` is accepted, and `[sm, huge]` is accepted because it belongs to no vocabulary.
   - Add a corpus assertion that the props from step 4 carry `type: integer` in generated/components.json, and keep whatever test job 619 added showing an `integer` prop emits what a `number` prop does.
   - tools/__tests__/parse-checks.test.ts holds `VOCAB.size` to `SIZE_NAMES` and `VOCAB.foregroundTone` to the built light theme. Do not change those; run them and say so.

8. If `node --import tsx tools/schema.ts --check` reports drift, run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 632

In logs/600-measure-632.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `pnpm generate:check` fails on stale prompt hashes because you edited docs; that is phase 4's job, not a failure. `corpus.componentsJsonSha256` changes for the same reason. **`corpus.derivedScenarios` must not move** — a render scenario is derived per enum value, so a changed count means a `values` list widened; find it and put it back.

Job-specific proof:
- `generated/parse-warnings.json` holds zero entries of this rule:

      node -e "const w=require('./generated/parse-warnings.json'); const m=w.filter(x=>x.message.startsWith('values are a subset of VOCAB.')); console.log(m.length+' vocab warnings'); process.exit(m.length?1:0)"

- The rejection fixture from step 7 proves the rule now errors, with the message text unchanged.
- Every migrated prop kept its values, and the integer props are typed:

      node -e "const cs=require('./generated/components.json').map(e=>e.component); for(const c of cs) for(const [n,p] of Object.entries(c.props||{})){ if(p.enumRef) console.log('enumRef',c.name,n,p.enumRef,JSON.stringify(p.values)); if(p.type==='integer') console.log('integer',c.name,n); }"

- `logs/600-measure-632/check.log` still ends its contrast step with `1284 pairs checked, 0 failures`. `color.status.{tone}.icon` and the other `{slot}` tokens expand over a prop's `values`, so a widened list would change that count — this is the second guard on step 2.

In your summary: the counts you found, the 19 props as migrated, the decision on Carousel `interval` with its reason, Card `inset` flagged for the owner, and any number prop you considered for `integer` and left alone. Those are the owner's review list.

Runner limits: Read, Write, Edit, MultiEdit, Glob, Grep, `Bash(pnpm *)`, `Bash(node *)`, `Bash(git status*)`, `Bash(git diff*)`. No PowerShell, no npx, no `git add` or `git commit`.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any doc field other than `propDef.enumRef` and `propDef.type`. Copy and contrast pairs belong to jobs 630 and 631.
