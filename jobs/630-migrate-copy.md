**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Migrate every component doc's `copy` to the typed form job 616 added, and flip 616's two warnings to errors, per site/src/content/docs/process/schema-hardening.md, "Phase 3: migrate the docs". Read "Rules every job follows", "Measuring a job" and the Phase 2 and Phase 3 sections first, then read jobs/done/616-typed-copy.md, `copyEntry`/`copyParam`/`pluralForms`/`copyText`/`copyPlaceholders` and `componentWarnings` in schema/component.ts, `warn`/`takeWarnings`/`hooks` in tools/parse.ts, and the copy tests in tools/__tests__/component-schema.test.ts. This is the only job that may change `copy`; it changes nothing else in a doc.

32 of the 51 docs carry 165 copy strings, and generated/parse-warnings.json records two kinds of hole in them today:

- **65 warnings**, `'{x}' names no prop, so nothing declares what it holds; use the object form and declare it in params`, in 15 docs: treegrid 17, datagrid 15, table 8, feed 6, carousel 5, datepicker 3, slider 2, stepper 2, combobox 1, form 1, listbox 1, search 1, select 1, splitter 1, tree 1.
- **16 warnings**, `names copy.<key>, which is not a copy key`: Breadcrumb `navLabel` and `current`, Button `loading`, Checkbox `checked`/`unchecked`/`mixed`, Combobox `activeOption`, Disclosure `expanded`/`collapsed`, Form `invalidSummary`, Link `external`, Listbox `invalid`, RadioGroup `position`, SidePanel `expanded`, Table `cellLabel`, Tabs `position`. Fifteen are made in `platforms.swiftui.notes`; Listbox's is made in `props.invalid.description`.

Beside those, 26 strings take a count with a single fixed form — TreeGrid `childCount` "{count} items", Table `rowCount` "{count} rows", Combobox `resultCount` "{count} results available", Form `summaryHeading` "{count} problems with this form" — and `pluralForms` exists for exactly that. The counts above were true when this prompt was written; assert what you actually find and list it, and do not stop because a number moved.

1. **Take the worklist.** Do this first, and keep the output; it is the list you work through and the list your summary reports against.

       node -e "const w=require('./generated/parse-warnings.json'); const m=w.filter(x=>/names no prop, so nothing declares|which is not a copy key/.test(x.message)); for(const x of m) console.log(x.file+' | '+x.message); console.log(m.length+' copy warnings')"

   Then list every count-bearing string:

       node -e "const cs=require('./generated/components.json').map(e=>e.component); for(const c of cs) for(const [k,e] of Object.entries(c.copy||{})){const t=typeof e==='string'?e:(e.text||''); if(/\{(count|n|total|index|level|rows|columns|cells|current)\}/.test(t)) console.log(c.name,k,JSON.stringify(t));}"

2. **Placeholders → the object form.** For each warned key, replace the plain string with an object entry. The template text stays byte-identical; only its shape changes. A placeholder that names a prop (`{label}`, `{value}`, `{caption}`) needs no param and is not a reason to convert an entry — leave entries that warn about nothing as plain strings, so the diff is exactly the migration.

   Before, in site/src/content/docs/components/table.md:

   ```yaml
     copy:
       sortedAnnouncement: 'Sorted by {column}, {direction}'
   ```

   After:

   ```yaml
     copy:
       sortedAnnouncement:
         text: 'Sorted by {column}, {direction}'
         params:
           column: { type: string, description: The column header text. }
           direction: { type: string, description: 'The new direction: ascending or descending.' }
   ```

   Rules for `params`:
   - `type: number` for a count, an index, a level or a percentage (`{count}`, `{n}`, `{total}`, `{index}`, `{level}`, `{rows}`, `{columns}`, `{cells}`, `{current}`, `{percent}`); `type: date` only where the doc's prose says the value is a date; `type: string` otherwise. `string` is the conservative choice — take it whenever the prose does not settle the kind, and list every param you typed that way for the owner.
   - `description` is optional. Write one only from the doc's own prose, its platform notes, or the description of the field that references the key. Where the prose does not say what the placeholder holds, omit `description` rather than inventing a gloss, and list that param in your summary.
   - Every declared param must be used by a placeholder or by `plural.by`, and exactly one of `text` and `plural` may be present: `componentDef.check` already enforces both, and `pnpm check` will tell you at once.
   - DatePicker `gridLabel` (`{month}`, `{year}`), DatePicker `invalid` (`{pattern}`) and DataGrid/TreeGrid `invalid` (`{message}`) are the entries whose prose is thinnest. Read the doc before typing them and name each in your summary.

3. **Add the 16 missing keys.** For each row of the table, add the key to that component's `copy` block, then re-run the worklist command to confirm the warning is gone.

   | Doc | Keys | Referenced in |
   |---|---|---|
   | breadcrumb.md | `navLabel`, `current` | `platforms.swiftui.notes` |
   | button.md | `loading` | `platforms.swiftui.notes` |
   | checkbox.md | `checked`, `unchecked`, `mixed` | `platforms.swiftui.notes` |
   | combobox.md | `activeOption` | `platforms.swiftui.notes` |
   | disclosure.md | `expanded`, `collapsed` | `platforms.swiftui.notes` |
   | form.md | `invalidSummary` | `platforms.swiftui.notes` |
   | link.md | `external` | `platforms.swiftui.notes` |
   | listbox.md | `invalid` | `props.invalid.description` |
   | radiogroup.md | `position` | `platforms.swiftui.notes` |
   | sidepanel.md | `expanded` | `platforms.swiftui.notes` |
   | table.md | `cellLabel` | `platforms.swiftui.notes` |
   | tabs.md | `position` | `platforms.swiftui.notes` |

   The value comes from the referencing prose and from the component's own body prose — never from your own idea of good microcopy. Checkbox's SwiftUI notes say the style "adds `.accessibilityValue(copy.checked / copy.unchecked / copy.mixed)` so the state is spoken as a checkbox state", so those three are the spoken state words. Button's say `loading` "sets `.accessibilityValue(copy.loading)`". Where the prose names the string's job but not its wording, write the plainest English label that says exactly what the prose says and nothing more ("Checked", "Loading", "Opens in a new tab" only if the doc says that is what it means), and list every such key in your summary under a heading the owner can review in one pass. Several of these strings take a position or a state (RadioGroup `position`, Tabs `position` — compare Feed `position`, `'{index} of {total}'`); give them the object form with declared params.

4. **Plurals.** Convert an entry to `plural` when its text contains a noun English inflects with the count — rows, items, results, suggestions, problems, cells. Leave it as `text` when the count sits in an "{a} of {b}" phrase (Table `selectedCount`, Carousel `slideLabel`, Stepper `stepOf`), in an ordinal or label ("Step {n}", "Level {level}", "Go to slide {n}"), or where no noun inflects ("{count} selected", "{n} min ago" and the other abbreviations). Declare the counting param as a `number` and name it in `by`:

   ```yaml
     copy:
       rowCount:
         plural:
           by: count
           one: '{count} row'
           other: '{count} rows'
         params:
           count: { type: number, description: Rows in the table. }
   ```

   `other` is required; `one` is the only other form English needs. Do not write `zero`, `two`, `few` or `many` — no doc's prose supplies them, and `other` covers every count they would. The plan counts 23 such strings; assert the set you convert, list it and list the count-bearing strings you deliberately left as `text`.

5. **Sweep all 51 docs.** After steps 2 to 4, re-read every doc's `copy` block (19 docs have none) and check: every placeholder is a declared param or a prop, every declared param is used, and no `copy.<key>` reference in a prop, event, style or behavior `description`, a keyboard `action` or `when`, or `platforms.*.notes` names a key that does not exist. The worklist command is the proof; it must print `0 copy warnings` before you move to step 6.

6. **Flip the check.** In schema/component.ts move `undeclaredCopyPlaceholders` and `missingCopyKeys` out of `componentWarnings` — delete them from its return array — and raise the same issues from `componentDef.check`. Keep both messages word for word:
   - `'{<placeholder>}' names no prop, so nothing declares what it holds; use the object form and declare it in params`, at path `['copy', key]`
   - `names copy.<key>, which is not a copy key`, at the path of the field that makes the reference, as an array: `['props', name, 'description']`, `['events', name, 'description']`, `['styles', name, 'description']`, `['behavior', i, 'description']`, `['keyboard', i, 'action']`, `['keyboard', i, 'when']`, `['platforms', plat, 'notes']`
   `componentWarnings` keeps every other rule. Do not add a second warning channel, do not reword anything, and do not touch the `then.copy` "unknown copy key" error.

7. **Tests.** In tools/__tests__/component-schema.test.ts:
   - The two corpus tests that pin the old warning lists — `componentWarnings reports exactly the 16 copy.<key> references that name no key` and `every string placeholder that names no prop warns: 65, across 42 component/placeholder pairs in 15 components` — are rewritten. Each becomes a rejection test on a fixture (a string entry with a placeholder naming no prop; a `copy.missingKey` reference in `platforms.web.notes`) asserting path and message with the file's existing `rejects` helper, plus a corpus assertion that no entry of generated/components.json produces that issue.
   - The two fixture tests under `describe('componentWarnings for copy')` become `rejects`/`accepts` tests in the `.check` describe block; the accepting cases (a prop placeholder, the object form) must still pass.
   - grep tools/__tests__ and mcp/__tests__ for the two message texts and update any other reader.
   If a test elsewhere revalidates all of generated/components.json through `componentDef` (job 601 added one), it now covers the corpus for free — say so in your summary rather than duplicating it.

8. If `node --import tsx tools/schema.ts --check` reports drift, run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 630

In logs/600-measure-630.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `pnpm generate:check` fails on stale prompt hashes because you edited docs; that is phase 4's job, not a failure. `corpus.componentsJsonSha256` changes for the same reason — expected here, unlike in phase 2. `corpus.derivedScenarios` and `behavior.skips` must not move: `copy` derives no scenario.

Job-specific proof:
- `generated/parse-warnings.json` holds zero entries of either kind:

      node -e "const w=require('./generated/parse-warnings.json'); const m=w.filter(x=>/names no prop, so nothing declares|which is not a copy key/.test(x.message)); console.log(m.length+' copy warnings'); process.exit(m.length?1:0)"

- The rejection fixtures from step 7 prove both rules now error, with the message text unchanged.
- The `pnpm check` output in logs/600-measure-630/check.log still ends the contrast step with `1284 pairs checked, 0 failures`: nothing you touched reaches a contrast pair.

In your summary: the counts you found for each of the three groups, the plural set and the set you left as `text`, every copy value you had to word from prose rather than copy from it, and every param you typed `string` or left without a `description` because the prose did not say. Those are the owner's review list.

Runner limits: Read, Write, Edit, MultiEdit, Glob, Grep, `Bash(pnpm *)`, `Bash(node *)`, `Bash(git status*)`, `Bash(git diff*)`. No PowerShell, no npx, no `git add` or `git commit`.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any doc field other than `copy`. Contrast pairs, prop types and enum values belong to jobs 631 and 632.
