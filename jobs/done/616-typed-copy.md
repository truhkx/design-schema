**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Make `copy` entries typed: a template may declare its `params` and its plural forms, per site/src/content/docs/process/schema-hardening.md, Phase 2 table row 616. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the whole spec. Jobs 600 to 615 have landed; build on them.

`componentDef.copy` is `z.record(z.string(), z.string())`, described as "Templates may use {label}, {count}". Nothing declares what a placeholder is, and nothing checks that a referenced key exists outside `then.copy`. In generated/components.json today:
- **Undeclared placeholders.** 32 components carry 165 copy strings. 83 of those strings contain placeholders, and 65 placeholder uses (42 distinct component/placeholder pairs, in 15 components) name neither a prop nor anything else. Examples: DataGrid `sortedAnnouncement` `{column}` `{direction}`, Feed `position` `{index}` `{total}`, DatePicker `gridLabel` `{month}` `{year}`, Slider `rangeText` `{low}` `{high}`, TreeGrid `level` `{level}`. The plan's review counted 26 by its own rule; recount by the rule below and report your number.
- **Referenced keys that do not exist.** 16 `copy.<key>` references in descriptions, notes and keyboard actions name no key: Breadcrumb `navLabel`, `current`; Button `loading`; Checkbox `checked`, `unchecked`, `mixed`; Combobox `activeOption`; Disclosure `expanded`, `collapsed`; Form `invalidSummary`; Link `external`; Listbox `invalid`; RadioGroup `position`; SidePanel `expanded`; Table `cellLabel`; Tabs `position`.
- **No plurals.** 23 strings take a count with one fixed form: TreeGrid `childCount` "{count} items", Form `summaryHeading` "{count} problems with this form", Combobox `resultCount` "{count} results available", Feed `minutesAgo` "{n} min ago".

The generators guess. generated/gaps/DatePicker.lit.md renders `{min}`/`{max}` "as the raw ISO string … since the schema doesn't specify a format". NumberInput.rn.md drops `outOfRange` when one bound is missing, because "inventing wording for a missing placeholder isn't allowed". Stepper.rn.md turned `stepOf` into formatting functions. Feed.web.md and Table.rn.md invented strings where no key existed.

1. **Schema.** In schema/component.ts:
   - Export `copyParam = z.strictObject({ type: z.enum(['string', 'number', 'date']), description: z.string().optional() })`.
   - Export `copyEntry = z.strictObject({ text: z.string().optional(), plural: pluralForms.optional(), params: z.record(<camelCase name regex>, copyParam).optional(), description: z.string().optional(), source })`.
   - `pluralForms` is `z.strictObject({ by: z.string(), zero, one, two, few, many: z.string().optional(), other: z.string() })`, the CLDR categories, with `other` required.
   - `copy` becomes `z.record(z.string(), z.union([z.string(), copyEntry]))`. A plain string stays valid and means what it means today.
   - Give each new schema `.meta({ id })` and describe every field. The `copy` description keeps its sentence about verbatim use.
   - Export `copyText(entry): string`: the string itself, `text`, or `plural.other`.
   - Export `copyPlaceholders(entry): string[]`: every `{name}` across `text` and all plural forms.
   - schema/extension.ts `copy` reuses `componentDef.shape.copy` instead of its own string record.
2. **Checks** in `componentDef.check`. These are errors, because only the object form can trip them:
   - exactly one of `text` and `plural`
   - `plural.by` names a `number` param
   - every placeholder is a declared param or a prop (the `{label}` convention reads the prop)
   - every declared param is used
   **Warnings, not errors** (the string form stays valid):
   - a string entry's placeholder names no prop
   - a `copy.<key>` reference in any prop, event, style or behavior `description`, keyboard `action` or `when`, or `platforms.*.notes` names no copy key. Match `copy\.([a-zA-Z][a-zA-Z0-9]*)`; this must report exactly the 16 above on today's docs.
   Add both as rules in `componentWarnings(c)` in schema/component.ts, the warning channel job 609 added (earlier phase 2 jobs may already have added rules there; add beside them). tools/parse.ts prints each as `⚠ <file>: <dotted path>: <message>` and it never changes the exit code. Do not add another warning mechanism. The existing `then.copy` "unknown copy key" error keeps its text word for word.
3. **Readers.** Every reader of a copy value goes through `copyText`, so the object form never prints `[object Object]`:
   - tools/behavior_tests.ts `thenCopyLines`, and the `then.copy` branch of `swiftThenItemLines`, keep their `Unmappable` text.
   - mcp/index.ts builds its "Copy templates:" line from `copyText`, and appends ` (plural by <by>)` for plural entries.
   - mcp/server.ts `get_component` returns `copy` raw, so callers see params and plurals. Add a sentence to `GET_COMPONENT_DOC`.
   - tools/parse.ts `mergeExtensions`: an object entry is stamped with `source` like other items. Correct the comment that says copy strings carry no marker, and check `stampSources` and the website's source stripping handle it.
   grep `copy` across tools/, mcp/, apps/website/src and site/src/components for any other reader, and update it.
4. **Tests.**
   - tools/__tests__/component-schema.test.ts: an accepted fixture with a string entry, a `text` + `params` entry, and a `plural` entry (`by: count`, `one`, `other`). One rejected fixture per check: both `text` and `plural`; neither; `by` naming a string param; an undeclared placeholder; an unused param. Each asserts path and message.
   - Warning tests for both warnings, one fixture each.
   - A test that runs `componentWarnings` over generated/components.json and asserts exactly the 16 missing-key references listed above.
   - tools/__tests__/behavior_tests.test.ts: `then.copy` against an object entry.
   - mcp/__tests__/index.test.ts: the index line for a plural entry.
   - tools/__tests__/extensions.test.ts: an extension adding an object entry.
5. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/parse.ts
    node --import tsx tools/behavior_tests.ts
    pnpm gates:behavior:check
    pnpm --filter website build
    node logs/600-baseline.mjs --out 616

The job-specific proof is the accepted fixture parsing a `plural` entry with `params`, and the corpus test pinning the 16 missing keys. `node --import tsx tools/parse.ts` exits 0 and prints both warning kinds; put the placeholder-warning count in your summary next to the plan's 26.

In logs/600-measure-616.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `behavior.skips` did not rise from job 615's. `corpus.componentsJsonSha256` should equal logs/600-measure-615.json's; if it differs, explain why in the summary.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any doc under `site/src/content/docs/`. Do not add the 16 missing keys or declare any params: that is phase 3.
