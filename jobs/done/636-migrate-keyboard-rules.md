**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Migrate every component doc's `keyboard` block to the fields job 614 added, and turn job 614's warning into an error, per site/src/content/docs/process/schema-hardening.md, Phase 3 ("Migrate the docs"). Read "Rules every job follows", "Measuring a job", Phase 2 and Phase 3 first, then jobs/done/614-keyboard-rule-targets.md, which is the spec for the fields you are filling in. Phase 1 and phase 2 (jobs 600 to 629) have landed. This is one field per job: `keyboardRule.given`, `target`, `repeat`, `platforms`, `native` and the array form of `expect` are the only doc fields you may change.

## What is there today

The phase 0 baseline had 186 keyboard rules, 106 of them `expect: manual`. Phase 1 and 2 left **190 rules, 108 manual** (`logs/600-measure-629.json`, `corpus.keyboardRules` and `corpus.keyboardManual`; read that file and quote the numbers you find rather than trusting these). A `manual` rule is emitted by tools/keyboard_tests.ts as `test.skip`, so it documents a key and proves nothing.

Most of those 108 are manual because the rule could not say what it needed, and job 614 gave it the words:

- **A prop state** the gate must set before pressing: `given`. 44 manual rules carry a `when` string, and 31 of them name a prop or a prop value in prose (`when: multiple`, `selectable is row or range`, `vertical`, `collapsible`, `allowCustom`).
- **A different element** than the component root: `target`. `closes` and `opens` assert on `rootLocator(c)`; for a component whose resolved role is the trigger or the input, the popup is what closes.
- **Several outcomes** in order: an `expect` array ("closes the popup and returns focus to the trigger" is `['focus-trigger', 'closes']` or `['closes', 'focus-trigger']`, in the order the doc states them).
- **Behavior the rendered element already has**: `native: true` ("activates the focused control (its own behavior)", "the input's native caret").
- **A platform**: `platforms`.

`generated/parse-warnings.json` is authoritative for what warns today. Group it yourself; when this job was written it held 194 warnings over 45 docs, of which **4 are this job's**, all the same message, in 2 docs:

    site/src/content/docs/components/combobox.md: keyboard.3.expect: 'closes' has no target, so the keyboard gate asserts on the combobox root, which stays visible; name the part that closes in target
    site/src/content/docs/components/combobox.md: keyboard.4.expect: 'closes' has no target, …
    site/src/content/docs/components/select.md:   keyboard.1.expect: 'closes' has no target, …
    site/src/content/docs/components/select.md:   keyboard.3.expect: 'closes' has no target, …

Assert what you find and list it in your summary; do not fail on the numbers in this prompt.

## Never invent an assertion

This is the rule the whole job hangs on. A rule may stop being `manual` only when the doc already determines what to assert. The sources are, in order: the rule's own `action` and `when` prose, the doc's body prose and its `behavior` scenarios, the APG pattern in `a11y.apg`, and the observed contract of the generated code under `packages/*/src` (read only; never edit it). If none of those settles it, **leave the rule `manual` and list it in your summary with the reason**. A wrong `given` produces a green test that proves nothing, which is worse than a skip. The emitted spec count may rise and `manual` may fall, but no rule becomes auto-tested on a guess.

Two specific traps:

- `given` must name a **declared prop of that component** with a value that fits its type (the schema rejects anything else, and the value must be a boolean, a number, or a string of letters, digits, spaces, `_` and `-`, because it rides in a Storybook URL). The props the manual rules' prose names are listed in the worklist below; check each against the doc before you write it.
- A `given` only changes what the story renders. If the outcome still depends on something the story cannot show (a range selection that must already exist, data that must already be loaded, a clipboard read), the rule stays `manual`.

## Steps

1. **Inventory first.** Read `generated/components.json` and print, for every component, each rule's index, keys, `action`, `when`, `from` and `expect`. Keep that list; the per-doc worklist below is keyed by the same indexes, and the indexes are what the warning paths and your summary refer to. Record the starting counts from `node --import tsx tools/keyboard_tests.ts` (the `✔ keyboard gate:` line) before you touch a doc.

2. **The four warnings are the must-fix.** These four rules are already auto-tested and already wrong — they assert that the `combobox` root disappears, and it does not. Give each a `target`, taken from that doc's `anatomy`:
   - combobox.md `keyboard.3` (Escape, "Closes the list if open; if closed and clearable, clears the input text") and `keyboard.4` (Tab, "Closes the list and moves focus on") — the Combobox anatomy has `popup` and `listbox`. Pick the part the prose says closes (the list), and use the same part in both rules.
   - select.md `keyboard.1` (Escape, "Closes the popup without changing the value and returns focus to the trigger") and `keyboard.3` (Tab, "Commits the active option (single) and closes; focus moves on") — the Select anatomy has `popup` and `listbox`.
   - select.md `keyboard.1` also states two outcomes in one sentence; that is the array form: the popup closes **and** focus returns to the trigger.

3. **Walk the 51 docs in file order**, and for every rule in every `keyboard` block ask, in this order:
   1. Does `expect` include `closes` or `opens` while the component root is not what changes? → add `target`, the anatomy part that changes.
   2. Does the `action` state two or more outcomes the schema can name? → make `expect` an array, in the prose's order, no duplicates, never both `closes` and `opens`.
   3. Is it `manual` because it needs a prop state the story does not render? → add `given` and the real outcome.
   4. Is it `manual` because it is the rendered element's own behavior? → `native: true`, and add the outcome only if there is one to assert; a native rule with no assertable outcome stays `expect: manual` **and** `native: true`, which the gate emits as `— native` instead of `— manual`.
   5. Does the doc scope it to some platforms (an RN note about hardware keyboards, a desktop-only convention)? → `platforms`.
   6. Does the assertion only hold after N presses? → `repeat`, which is allowed only with `focus-next` or `focus-prev`.
   7. Otherwise leave it exactly as it is.

   Do not touch `keys`, `action`, `when` or `from`. `when` stays: it is the human sentence, and `given` is the machine form of it; the gate prints `when` in the test title.

4. **Flip the check.** Move job 614's warning `untargetedKeyboardRules` out of `componentWarnings(c)` in schema/component.ts and into `componentDef.check` as an error, **with its message word for word** and the same issue path (`keyboard.<index>.expect`), including the interpolated role and the `closes`/`opens` word:

       '<outcome>' has no target, so the keyboard gate asserts on the <role> root, which stays visible; name the part that <closes|opens> in target

   Keep the predicate identical: it fires only when `resolveRole(c)` is in `WIDGET_ROLES` and the rule's `expectList` contains `closes` or `opens` with no `target`. After the flip, `componentWarnings` no longer returns keyboard warnings, and `pnpm check` must print **zero** warnings whose path starts with `keyboard.`.

5. **Tests.**
   - tools/__tests__/component-schema.test.ts: the test `componentWarnings flags a closes rule with no target on a combobox, and not one with a target` pinned the old warning. Rewrite it as a rejection: the same combobox-shaped fixture is now rejected by `componentDef.parse` with that path and that message, the fixture with a `target` is accepted, and the same rule on a `dialog`-role fixture is accepted. Keep the other keyboard checks job 614 added as they are.
   - Add a corpus test: over every component in `generated/components.json`, `componentWarnings` returns nothing whose path starts with `keyboard.`.
   - tools/__tests__/keyboard_tests.test.ts: no rewrite needed, but add one case per field that a real migrated doc now uses, so the generated spec text for `given`, `target`, an `expect` array and `native` is pinned.
   - Run the full tool suite; docs that gained `given` change `specData`, so the swiftui fixtures may move (a rule with `given`, `target` or `repeat` above 1 is written to `generated/keyboard/<Name>.json` as `expect: 'manual'`, by design).

6. **Regenerate.** `node --import tsx tools/keyboard_tests.ts` and keep `generated/keyboard/`. You are not editing a Zod file's shape beyond moving a rule, but run `node --import tsx tools/schema.ts` and keep the regenerated JSON if anything moved.

7. **Prove the warning is gone.** `DS_WARNINGS_AS_ERRORS=1 pnpm parse` exits 0 only if no warning of any kind remains, which it will not while other phase 3 jobs are outstanding — so instead assert in the test above that the corpus has no `keyboard.` warning, and quote the `pnpm check` parse summary line (`✔ 51 component(s) … N warning(s)`) before and after, showing the count dropped by the four this job owns.

## Per-doc worklist

22 docs have manual rules. The counts are the manual rules, and the third column is the evidence to read; it is a starting point, not a decision. The props named are the ones that exist in that doc today, with their values.

| Doc | Manual | Where to look |
|---|---|---|
| datagrid.md | 18 | `selectable` (`none\|row\|cell\|range`, default `none`), `editable` (boolean). Rules 12, 15, 16, 17 name them in `when`. Rules 1 to 8 are cell movement inside the grid — the gate's `focusIndex` walks focusables, so a roving-tabindex grid cell may not be one; check before claiming `focus-next`. |
| datepicker.md | 11 | `open` (boolean). 10 of the 11 say `when: focus on a day`, which the Keyboard story must already render; rule 0 opens the calendar from the input. |
| tree.md | 9 | `selectable` (`none\|single\|multiple`, default `single`), `selectChildren` (boolean). Rules 8, 10, 11 name them. |
| treegrid.md | 8 | `selectable` (`none\|row\|cell`), `editable`, `selectChildren`. No rule has a `when`; rule 7 says "as DataGrid". |
| combobox.md | 7 | `multiple`, `allowCustom` (both boolean, default false), `open`. Rule 5 is `when: multiple`, rule 7 `when: allowCustom`; rule 6 is the input's native caret (`native: true`). |
| splitter.md | 7 | `orientation` (`horizontal\|vertical`), `collapsible` (boolean). Rule 5 is `when: collapsible`; rule 6 (F6) is a desktop convention — check the doc's platform notes before scoping it with `platforms`. |
| carousel.md | 6 | `picker` (`dots\|tabs\|none`, default `dots`). Rules 1 to 4 say `when: focus on picker`; rule 5 activates the focused control (`native: true`). |
| numberinput.md | 5 | Rule 3 (Home/End) is explicitly the input's native caret when min/max are undefined — `native: true`. |
| slider.md | 5 | Arrow/Page/Home/End change the value; there is no `expect` for "value changed", so most stay manual unless `selects`/`toggles` honestly applies. Say so in the summary. |
| feed.md | 4 | `hasMore` (boolean). Rule 3 changes behavior with it. |
| listbox.md | 4 | `multiple` (boolean). Rules 6 and 7 are `when: multiple`; rule 9 is PageDown/PageUp by visible row count (`repeat` does not model that). |
| search.md | 4 | `suggestions` (array) — an array value cannot travel in a Storybook URL, so `given` cannot set it; check whether the Keyboard story already renders suggestions, and if it does, the rules need no `given`. |
| menu.md | 3 | `open` (boolean). Rules 0 and 1 open from the trigger (`from: trigger`), so `opens` with a `target` may now be assertable. |
| select.md | 3 | `open`, `multiple`. Plus the two warning rules in step 2. |
| tabs.md | 3 | `orientation` (`horizontal\|vertical`) — rules 3 and 4 say `when: vertical`, which is `given: { orientation: vertical }`, not `vertical: true`. |
| popover.md | 2 | `open`. Rule 2 (Tab) is non-modal versus modal: two behaviors in one rule, so it needs the `modal` prop if the doc has one, else stays manual. |
| radiogroup.md | 2 | `orientation`. Rule 0 is Tab into/out of the group; rule 3 is Space on the focused radio. |
| table.md | 2 | `selectable`, `responsive` (`stack\|scroll`). Rule 1 activates the focused control (`native: true`); rule 2 is `when: scroll region focused`. |
| toolbar.md | 2 | `orientation`. Rule 5 activates the focused control — the doc says "(its own behavior)", so `native: true`. |
| actionsheet.md | 1 | Rule 7 is `when: wide-screen menu presentation`; generated/gaps/ActionSheet.web.md says it "isn't testable/enforceable in code". Leave it manual and say so. |
| sidepanel.md | 1 | Rule 1 is non-modal Tab from the trigger; the component's resolved role is `none`, so `closes`/`opens` need a `target` even though no warning fires today. |
| stepper.md | 1 | Rule 1 selects the focused step — check whether `selects` applies or it is `native`. |

Nine docs (accordion, alertdialog, bottomsheet, dialog, focusscope, segmentedcontrol, toast, tooltip and the rest with keyboard blocks) have no manual rules. They are still in scope for `target`: a `closes` rule whose root is not what disappears needs one. Only `sidepanel.md` is likely; check each and say what you found.

## Before and after

combobox.md today:

    keyboard:
      - keys: [Escape]
        action: Closes the list if open; if closed and clearable, clears the input text.
        from: first
        expect: closes

after (the part name is whatever combobox.md's `anatomy` calls the list container):

    keyboard:
      - keys: [Escape]
        action: Closes the list if open; if closed and clearable, clears the input text.
        from: first
        expect: closes
        target: popup

and a rule that needs a prop state, from tabs.md:

    - keys: [ArrowDown]
      action: Moves to the next tab, wrapping; selects it under automatic activation.
      when: vertical
      from: first
      expect: manual

becomes

    - keys: [ArrowDown]
      action: Moves to the next tab, wrapping; selects it under automatic activation.
      when: vertical
      from: first
      given: { orientation: vertical }
      expect: focus-next

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    pnpm --filter website build
    node logs/600-baseline.mjs --out 636

In `logs/600-measure-636.json` every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Job-specific proof, after the gate block:

    node --import tsx tools/keyboard_tests.ts

Do **not** run Playwright. Generating the specs plus `pnpm test:tools` is the proof. Report the `✔ keyboard gate:` line before and after your edits, and in your summary give the before/after **auto-tested**, **manual** and **native** counts and the spec count, plus `vsBaseline.keyboardManual` from the measure file. `pnpm check` must print zero warnings whose path starts with `keyboard.`, and the parse summary's warning count must have dropped by exactly the four this job owns. List every rule you left `manual` that a reader might expect you to have converted, with the reason.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any doc field other than a `keyboard` rule's `given`, `target`, `repeat`, `platforms`, `native` and `expect`. Doc edits stale prompt hashes, so `pnpm generate:check` fails until phase 4; that is expected and is the one step in the measure file allowed to exit non-zero.
