**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Migrate all 51 component docs onto job 613's `styleBinding` fields (`part`, `state`, the per-value `by`/`values` pair, and `computed`) and job 624's `constants`, and land the check that makes the shape they replace impossible. Two fields in one job because they encode the same thing — a value the component's code reads instead of guesses: `by`/`values` and `computed` say what a style resolves to, `constants` says what a delay, a threshold or a debounce resolves to, and both exist because the number today lives in a description sentence that four generators read four different ways. This is phase 3 of site/src/content/docs/process/schema-hardening.md; read "Rules every job follows", "Measuring a job", the Phase 2 table rows 613 and 624, and "Phase 3: migrate the docs" first, then jobs/done/613-style-binding-parts.md and jobs/done/624-deprecated-since-examples.md, which are the full specs of the fields you are filling in. Jobs 609 to 629 have landed, and by the time you run, so have 630 to 639; read every file as it is now, not as those job prompts describe it.

**This job has no phase 2 warning to flip, and that is not an oversight.** Jobs 613 and 624 landed *every* one of their checks as errors, because no doc used the new fields, so nothing of theirs is in generated/parse-warnings.json. Your equivalent of the flip is §6: a new error in `componentDef.check` that rejects the parallel-key shape this migration removes, so the corpus cannot drift back. Say in your summary that this job removed no warning and quote the unchanged total.

**Two fields belong to job 633, which ran before you. Do not touch either.**

- `platforms.<p>.reflect`: 633 added `size` to input.md, numberinput.md and select.md so their `fontSize: { token: 'font.size.{size}' }` bindings have an attribute to select by, and turned `unreflectedSlots` into an error. Those three bindings are now correct as they stand — **do not** fold them into `by`/`values`, which would strand the reflect entry 633 just added.
- `styles.<b>.platforms`: 633 owns per-platform narrowing, including on style bindings. Do not add, remove or edit a binding's `platforms` here, even where a platform note says a binding is inert (card.md's transition, switch.md's native track and thumb). If you find a case 633 missed, list it; do not fix it.

**Only these fields.** A binding's `token`, its `locked` flag and its **name** stay as they are. You add `part`, `state`, `by`/`values` and `computed`, you delete the parallel per-size keys that `by`/`values` replaces, you add a `constants` block, and you edit a description only when its sentence is the thing a field now carries. Nothing else in any doc. If a doc looks wrong in another way, list it; do not fix it here.

## What the corpus looks like today (measured — re-measure and report what you find)

- **State in names, 15 bindings, three word orders** (job 613's list): Button.backgroundHover, Card.hoverBackground, Table.rowHover, ActionSheet.itemHover, Checkbox.pressedOverlay, DataGrid.rowHover, DatePicker.dayHover, Disclosure.triggerBackgroundHover, Link.colorHover, Listbox.optionActiveBackground, Menu.itemHover, Splitter.separatorHover, Stepper.stepHover, Tabs.tabHoverBackground, Tree.rowHover. A scan also turns up Carousel.dotActive and Splitter.separatorActive, whose "active" is not obviously one of `STYLE_STATES` — §3 says what to do with those.
- **Values in names, 14 parallel keys on 7 components**: DatePicker, Input and NumberInput each carry `paddingBlockSm`, `paddingInlineSm` and `minTargetSm`; plus Dialog.widthSm, Search.paddingBlockLg, SegmentedControl.paddingBlockSm, Select.triggerPaddingBlockSm and Select.minTargetSm. Nine of the fourteen fold; §2 says which five do not and why.
- **Arithmetic in prose**: menu.md `minWidth` "space.20 × 2.5 … the generator multiplies"; sidepanel.md `widthNarrow` and tooltip.md `maxWidth` "Multiplied by 3"; radiogroup.md `indicator` "controlSize minus 2 × space.1"; switch.md `thumbSize` "it travels trackWidth − thumbSize − 2 × thumbInset"; dialog.md `widthSm` "md is 3/4 of content and lg is content".
- **Literal timings and thresholds in prose**: tooltip.md `delay` "`motion.duration.base` × 3 (roughly 600ms)"; toast.md `duration` "motion.duration.loop × 6 / × 12"; bottomsheet.md "past 25% of the sheet height, or faster than 1.5 px/ms"; combobox.md "debounced by `motion.duration.base × 2`"; carousel.md "values below 5000 are raised to 5000"; tree.md "the buffer clears after 500 ms (literal-ok, as Listbox)".
- **What guessing cost**, from the generators' own gap logs: generated/gaps/Button.web.md invented the inverse-ghost hover mix at 16% ("a guess with no token backing it") and a later round wrote 12%; generated/gaps/Combobox.lit.md shipped "a literal 500ms constant (STATUS_DEBOUNCE_MS)" instead of `motion.duration.base × 2`; Carousel's 5000 floor was read three ways (Carousel.lit.md dev-only, Carousel.web.md always-on, Carousel.rn.md reworded to dodge the literals gate); generated/gaps/Dialog.rn.md computed `t.layoutMaxWidthContent * 0.75` from prose. Generated code is evidence of what was guessed before, never a source of truth.
- **Warnings**: generated/parse-warnings.json held 194 entries over 45 docs when this job was written, none of them this job's. Record the total before you start and quote it again at the end: this job must not change it.

Assert what you find and list it. Do not fail a step because a count above moved; quote the number you measured.

## 1. Read first

schema/component.ts (`styleBinding`, `styleOperand`, `styleComputed`, `STYLE_STATES`, `bindingTokens`, `computeBinding`, `lockRule`, `mustLock`, `constantDef`, and the style and constant checks inside `componentDef.check`); tools/parse.ts (`validate`'s auto-lock over `bindingTokens`, the token-existence check, `checkExtensionLocks`); tools/spec_sheet.ts (`styleRows`); tools/__tests__/style-binding-fields.test.ts in full — every check you rely on already has a fixture there, with its exact message; generated/parse-warnings.json; the gap logs named above.

## 2. `by` / `values`: fold the parallel keys

`by` names an enum or boolean prop; `values` maps some of its values to the token used instead of `token` for that value; `token` stays required and covers every value not listed. A token that interpolates `{<by>}` may not also declare `values`, `by` without `values` (or the reverse) is rejected, and a `values` token obeys the same `{slot}` rule as `token`.

Fold **only** these nine keys — each is a pure restatement, with no number invented:

| Doc | Base binding (token) | Key folded in | `by` | `values` |
|---|---|---|---|---|
| datepicker.md | `paddingBlock` (space.sm) | `paddingBlockSm` (space.1) | `size` | `{ sm: space.1 }` |
| datepicker.md | `paddingInline` (space.md) | `paddingInlineSm` (space.2) | `size` | `{ sm: space.2 }` |
| input.md | `paddingBlock` (space.sm) | `paddingBlockSm` (space.1) | `size` | `{ sm: space.1 }` |
| input.md | `paddingInline` (space.md) | `paddingInlineSm` (space.2) | `size` | `{ sm: space.2 }` |
| numberinput.md | `paddingBlock` | `paddingBlockSm` | `size` | `{ sm: … }` |
| numberinput.md | `paddingInline` | `paddingInlineSm` | `size` | `{ sm: … }` |
| search.md | `paddingBlock` (space.sm) | `paddingBlockLg` (space.md) | `size` | `{ lg: space.md }` |
| segmentedcontrol.md | `paddingBlock` | `paddingBlockSm` (space.1) | `size` | `{ sm: space.1 }` |
| select.md | `triggerPaddingBlock` (space.sm) | `triggerPaddingBlockSm` (space.1) | `size` | `{ sm: space.1 }` |

Read each doc's `size` prop before you write: Input, NumberInput, Select, DatePicker and SegmentedControl are `[sm, md]` with default `md`; Search is `[md, lg]` with default `md`. The base `token` must be what the **default** value resolves to today, and `values` lists every other value whose token differs. Read the base binding too — segmentedcontrol.md's own description says "md uses paddingBlock", so confirm the base key exists before folding into it.

**The five you must not fold, and must list:**

- **The four `minTargetSm` keys** (datepicker.md, input.md, numberinput.md, select.md) are **locked** today. Folding them takes four names off `corpus.lockedBindings`, and §7's hard invariant is that the number does not fall. Leave them exactly as they are and record them as work for a later job that can prove the merged binding still locks.
- **dialog.md `widthSm`**: its siblings are "md is 3/4 of content and lg is content" — arithmetic, not tokens, so `values` cannot carry them and `computed` cannot be attached per value. There is also no `width` binding to fold into. Leave the binding and the prose; list it.

And leave the three `font.size.{size}` bindings alone — job 633 made them correct (see the top of this file).

When you delete a folded key, carry any fact its description stated that the fields do not (e.g. "Vertical padding at size sm.") onto the base binding's description, or drop it if `by`/`values` already says it. Do not invent a new sentence.

## 3. `part` and `state`

- `part` only when the anatomy already has that part and the binding's name or description says it styles it — `triggerPaddingBlock` → `part: trigger`, `optionActiveBackground` → `part: option`, `groupLabelColor` → `part: groupLabel`. The check rejects a `part` that is not in `anatomy` (`styles.<b>.part '<p>' is not in anatomy [...]`); never add an anatomy part to make one fit.
- `state` only when the description names a state that is exactly one of `STYLE_STATES` (`BEHAVIOR_STATES` plus `hover`, `focus-visible`, `active`, `dragging`). The 15 bindings above are the candidates. Listbox.optionActiveBackground is `active` — that enum member means the keyboard-active item in a composite, which is exactly what it is.
- **Do not rename a binding.** `Button.backgroundHover` keeps its name and gains `state: hover`; `Card.hoverBackground` keeps its name and gains `state: hover`. Renaming changes the generated overrides API and moves names off the locked list; that is phase 5's call.
- Where the word in the name is not one of `STYLE_STATES` — Carousel.dotActive is the *current slide's* dot, Splitter.separatorActive is the separator *while dragging* — set `state` only if the doc's own prose names a state in the enum. Otherwise leave the binding and list it with the sentence you read.

## 4. `computed`

`computed` is `{ times?, plus?, minus? }`, read as `token × times + Σ plus − Σ minus`, each operand `{ token, times? }` or `{ binding, times? }`. **The formula must come from the doc's own prose.** Three qualify:

| Doc | Binding | Prose | `computed` |
|---|---|---|---|
| menu.md | `minWidth` (space.20) | "space.20 × 2.5 … the generator multiplies" | `{ times: 2.5 }` |
| sidepanel.md | `widthNarrow` (space.20) | "Multiplied by 3" | `{ times: 3 }` |
| tooltip.md | `maxWidth` (space.20) | "Multiplied by 3 (240px at comfortable density)" | `{ times: 3 }` |

Where the prose states arithmetic for a value **no binding names**, leave the prose exactly as it is and list it: radiogroup.md `indicator` (the formula is a diameter; the binding's token is a colour), switch.md `thumbSize` (the formula is the thumb's *travel*, not its size), dialog.md `widthSm` (§2), and sidepanel.md `width`'s narrative clause about the narrow case, which belongs to `widthNarrow`. Adding a binding to hang a formula on is a new binding, which is not this field.

A binding that must lock may not take `computed` with `minus` or a `times` below 1; the schema enforces it with its own message, and none of the three above is locked. When you add `computed`, trim the clause that existed only to carry the arithmetic ("the generator multiplies; no new token", "the doc states the arithmetic so no literal appears in code") and keep everything else the sentence says.

## 5. `constants`

A constant is a camelCase name → `{ description, token?, multiply?, value?, unit }`, exactly one of `token` and `value`, `multiply` only with `token`, `unit` one of `ms | px | px/ms | ratio | count`, and the name may not collide with a `styles` key on the same component. These come straight from prose and invent nothing:

| Doc | Constant | From |
|---|---|---|
| tooltip.md | hover delay | `token: motion.duration.base`, `multiply: 3`, `unit: ms` |
| toast.md | short and long durations | `token: motion.duration.loop`, `multiply: 6` and `multiply: 12`, `unit: ms` |
| combobox.md | status live-region debounce | `token: motion.duration.base`, `multiply: 2`, `unit: ms` |
| bottomsheet.md | dismiss distance | `value: 0.25`, `unit: ratio` ("past 25% of the sheet height") |
| bottomsheet.md | dismiss velocity | `value: 1.5`, `unit: px/ms` |
| carousel.md | minimum interval | `value: 5000`, `unit: ms` ("values below 5000 are raised to 5000") |
| tree.md | typeahead buffer reset | `value: 500`, `unit: ms` |

Check each name against that component's `styles` keys first: menu.md already has a `typeaheadReset` **binding** backed by a real token, so Menu needs no constant at all; tree.md and listbox.md have no such key, so the name is free there.

Where prose gives no number, leave it and list it: listbox.md's typeahead reset exists only as "as Listbox" inside tree.md, never as a number in its own doc; actionsheet.md points at BottomSheet's "same 25% / 1.5 px/ms rule" (declare the same two constants only if you judge that sentence states them for ActionSheet too, and say which way you went); button.md's inverse-ghost hover is a percentage over a colour with no token behind it — the very number two generator rounds wrote as 16% and then 12%, and exactly the kind of value this job may **not** invent a home for. Record it as a finding for a future token.

Each `description` says what the logic uses the number for. Leave the prose sentence that is its source in place, except a clause whose only content was "never hardcoded" or "the generator computes it", which the constant now states.

## 6. The check this job lands

Add one error to `componentDef.check` so the shape §2 removes cannot come back. It reads only its own component, so it belongs in the schema, not the parser.

For each `styles` key `K`: if `K` ends in a suffix whose lower-case form is a value of an enum or boolean prop `P` of the same component, **and** the remaining prefix `R` is itself a `styles` key of that component, the doc is declaring a parallel key. Reject at path `['styles', K]` with a message in the house style of its neighbours (`styles.<K>.by 'x' is not an enum or boolean prop`, `styles.<K>.values has 'lg', which is not a value of …`), naming `R`, `P` and the value, and telling the author to use `by`/`values`. Write the message yourself — there is no phase 2 text to relocate — and quote it in your summary.

Two exclusions, both deliberate, both stated in a comment beside the rule:

- **Skip when either `K` or `R` must lock** (`mustLock` over `bindingTokens`). That is what keeps the four `minTargetSm` keys legal (§2) and `corpus.lockedBindings` from falling (§7). List the keys the exclusion spared.
- The rule needs `R` to exist, which is why dialog.md's `widthSm` — with no `width` binding beside it — stays legal without a special case.

Before you write it, run the rule's predicate over generated/components.json and check it fires on exactly the nine keys in §2's table and nothing else. If it catches something you did not plan to fold, **stop and report it** rather than widening the exclusions or folding a binding this job did not intend to touch.

## 7. Locking is sacred

This job changes what tokens a binding resolves to, so locking is the invariant that matters most:

- `lockRule` and `mustLock` already read **every** token through `bindingTokens` — `token`, each `values` token, each `computed` token operand — so a fold must keep locking whatever the two keys locked separately. Check each folded binding's `locked` value in generated/components.json before and after.
- `vsBaseline.lockedBindingsNoLongerLocked` in logs/600-measure-640.json **must be empty**. No accessibility-bearing binding may become overridable.
- `corpus.lockedBindings` **must not fall**. It was 334 in logs/600-measure-629.json — read the latest earlier measure file, do not trust this number. §2's rule against folding the four `minTargetSm` keys and §6's lock exclusion exist to hold this line. If your count comes back lower, you folded a locked key: unfold it, do not argue the count.
- Report **both** numbers: the `lockedBindings` count before and after, and the (empty) `lockedBindingsNoLongerLocked` list.

## 8. Tests

- tools/__tests__/style-binding-fields.test.ts is where phase 2 pinned these fields, fixture by fixture, and it is the file to extend:
  - **The fixture that pinned the old shape** is `test("Input's paddingBlock and paddingBlockSm as one binding by size")`, which only asserts the folded form parses. Add the other half: a fixture carrying `paddingBlock` **and** `paddingBlockSm` together is now **rejected** by §6's rule, with its path and message; and a fixture where the pair must lock (a `minTarget`/`minTargetSm` shape on `size.target.*`) is still **accepted**, so the exclusion is pinned too.
  - Add a corpus sweep over generated/components.json: no doc raises §6's issue; every `values` token exists in the built tokens; every `by` names an enum or boolean prop of its own doc; every `computed` operand resolves with no cycle; and `computeBinding` returns the number the prose states for Menu.minWidth, SidePanel.widthNarrow and Tooltip.maxWidth. Pin the counts you produced (bindings with `by`/`values`, with `state`, with `part`, with `computed`).
- tools/__tests__/component-schema.test.ts: a corpus assertion that every `constants` entry parses, collides with no `styles` key, and that each token constant names a real token. Pin the number of docs with `constants` and the number of constants. **Do not touch** the reflect or `narrowForPlatform` blocks in that file: job 633 rewrote them and owns them.
- tools/__tests__/spec_sheet.test.ts: `styleRows` emits a row per `values` token and prefixes the description cell with part and state; update or add the case that covers it.
- Run the whole suite. A test elsewhere that assumed a binding name you folded away is a finding to fix in the test.

## 9. Gate — all must pass

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 640

In logs/600-measure-640.json every step exits 0 except `generateCheck`, `vsBaseline.lockedBindingsNoLongerLocked` is empty, and `corpus.lockedBindings` is unchanged (§7).

Then the job's own proof, in the foreground, quoting the last line of each:

    pnpm exec vitest run tools/__tests__/style-binding-fields.test.ts tools/__tests__/component-schema.test.ts tools/__tests__/spec_sheet.test.ts
    node -e "const w=require('./generated/parse-warnings.json');console.log('total warnings:',w.length);console.log([...new Set(w.map(x=>x.message.split(':')[0]))].sort().join('\n'))"
    git diff --stat -- site/src/content/docs/foundations/spec-sheet.md

The warning total must be **exactly what it was before you started** and the set of warning kinds unchanged: this job removes no warning and must introduce none. Do **not** run `DS_WARNINGS_AS_ERRORS=1` — the warnings still outstanding belong to other phase 3 jobs and would fail the run for reasons that are not yours.

`pnpm check` also runs the contrast gate, which must still print **`1284 pairs checked, 0 failures`**, unchanged: this job touches no `a11y.contrast` pair. Quote that line.

The spec sheet is regenerated by `pnpm check` and **will** change here: each folded binding loses its `paddingBlockSm` row and gains a `` `paddingBlock` (size=sm) `` row, and every binding with `part` or `state` gains that prefix in its description cell. Report the diff stat and confirm the rows moved only the way the fold predicts.

`pnpm generate:check` fails until the phase 4 regen; that is expected and is why `generateCheck` is the one non-zero step. Folding a key also removes a public override name from the generated packages — list every removed key so the regen and job 650 know what changed.

## 10. Worklist — all 51 docs

Walk site/src/content/docs/components/ in alphabetical order and record one line per doc, even when it gains nothing. Per doc, in this order: (a) does any binding carry a state word in its name? (b) does any binding name an anatomy part? (c) is there a parallel per-value key to fold? (d) does any description state arithmetic for the value the binding names? (e) does the doc's prose carry a number the component's logic reads? Docs known to be in scope: datepicker, input, numberinput, search, segmentedcontrol, select (values); actionsheet, button, card, carousel, checkbox, datagrid, disclosure, link, listbox, menu, splitter, stepper, table, tabs, tree (state and part); menu, sidepanel, tooltip (computed); bottomsheet, carousel, combobox, toast, tooltip, tree (constants). Confirm each from the doc, not from this list.

## 11. A finished entry, before and after

input.md today:

```yaml
    paddingInline: { token: space.md }
    paddingBlock: { token: space.sm }
    paddingBlockSm: { token: space.1, description: 'Vertical padding at size sm.' }
    paddingInlineSm: { token: space.2, description: 'Horizontal padding at size sm.' }
    fontSize: { token: 'font.size.{size}' }
    minTarget: { token: size.target.comfortable }
    minTargetSm: { token: size.target.min, description: 'The field height floor at size sm.' }
```

input.md after — four keys become two bindings; `fontSize` and the locked pair are untouched:

```yaml
    paddingInline: { token: space.md, by: size, values: { sm: space.2 } }
    paddingBlock: { token: space.sm, by: size, values: { sm: space.1 } }
    fontSize: { token: 'font.size.{size}' }
    minTarget: { token: size.target.comfortable }
    minTargetSm: { token: size.target.min, description: 'The field height floor at size sm.' }
```

`size` is `[sm, md]` with default `md`, so `token` carries md and `values.sm` carries sm — the same two tokens the two keys resolved to. `fontSize` keeps its interpolation because job 633 gave the Lit element the `size` attribute it selects by. `minTargetSm` stays because it is locked (§2, §6, §7).

tooltip.md keeps its number in the `delay` prop description ("`motion.duration.base` × 3 (roughly 600ms…)"); the sentence stays and the number gains a declared home:

```yaml
  constants:
    hoverDelay:
      description: Delay before a hovered tooltip shows, when `delay` is `default`.
      token: motion.duration.base
      multiply: 3
      unit: ms
```

and `maxWidth: { token: space.20, description: 'Multiplied by 3 (240px at comfortable density) — the generator computes it; longer text wraps.' }` becomes

```yaml
    maxWidth: { token: space.20, computed: { times: 3 }, description: 'Longer text wraps.' }
```

## 12. Do not modify

`packages/*/src`, `prompts/templates/` and `prompts/conventions/` (both removed from the repository by commit 48ba3ce — do not recreate them), `tools/lint_literals.ts`, `tools/docs_examples.ts`, any theme or extension doc, `platforms.<p>.reflect`, `styles.<b>.platforms`, and any component-doc field other than `styles` (the four fields above) and the new `constants` block. Do not rename a binding, change a token, change a `locked` flag, or add or remove an anatomy part, a prop or a contrast pair. Do not add a binding to hang a formula on.

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use PowerShell or npx, and do not stage or commit.
