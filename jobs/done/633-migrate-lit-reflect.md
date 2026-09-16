**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Migrate the 51 component docs to the typed Lit `reflect` list and to per-platform narrowing, and turn job 617's three warnings into errors, per site/src/content/docs/process/schema-hardening.md, Phase 3. Read "Rules every job follows", "Measuring a job", Phase 2 and Phase 3 first, then jobs/done/617-platform-narrowing.md, which added every field this job fills in. This is one field per job: the only doc changes you may make are `platforms.<p>.reflect` entries and the narrowing keys (`a11y.requiresOn`, `props.<p>.valuesOn`, a `copy` entry's `platforms`, a `styles.<b>.platforms`). Nothing else in any doc.

**The evidence** is generated/parse-warnings.json, 194 warnings today, of which 24 are this job's, in three kinds. Group the file yourself and work from what you find; if a count below has moved, assert what you find and list it in your summary.

- **11 un-negated reflect entries in 9 docs** (`reflects 'X' un-negated, but 'Y' defaults to true`): accordion `divided`, bottomsheet `drag-to-dismiss`, breadcrumb `collapse`, carousel `snap`, focusscope `trapped` and `active`, search `landmark`, sidepanel `dismissible` and `swipeable`, table `sticky-header`, tooltip `describes`.
- **10 entries that resolve to no prop in 8 docs** (`reflects 'X', which resolves to no prop`): bottomsheet, dialog and popover `no-dismiss`; datagrid and treegrid `no-status-bar` and `no-sticky-header`; datepicker `invalid`; numberinput `show-steppers`; tree `hide-guides`.
- **3 token slots with no reflected attribute**: input, numberinput and select `styles.fontSize.token` interpolates `{size}`, and their Lit reflect lists do not resolve `size`. Search and SegmentedControl already reflect theirs, which is the shape to copy.

**The rule you follow** is prompts/conventions/lit.md, "Booleans that default to true": *"A boolean attribute cannot express false, so a prop whose doc default is `true` (`dismissible`, `stickyHeader`, `showValue`) keeps its name as a property and is exposed as the negated attribute (`no-dismiss`, `no-sticky-header`, `hide-value`); reflect the negated form. Never change the doc's prop name."* That file was removed from the repository by commit 48ba3ce, so the rule is quoted here in full; do not go looking for it on disk, and do not recreate it. You may not rewrite a reflect list into anything this rule forbids, and you may not rename a prop to make an attribute read better.

1. **The 10 entries that resolve to no prop.** `reflectEntry(c, entry)` in schema/component.ts resolves a string to a prop only when it equals a prop name or that name's kebab-case; everything else is a guess the generator has to make. Replace each with the object form `{ prop, attribute }`, which names the prop outright:

   | Doc | Entry today | Becomes |
   |---|---|---|
   | bottomsheet.md | `no-dismiss` | `{ prop: dismissible, attribute: no-dismiss }` |
   | dialog.md | `no-dismiss` | `{ prop: dismissible, attribute: no-dismiss }` |
   | popover.md | `no-dismiss` | `{ prop: dismissible, attribute: no-dismiss }` |
   | datagrid.md | `no-status-bar` | `{ prop: showStatusBar, attribute: no-status-bar }` |
   | datagrid.md | `no-sticky-header` | `{ prop: stickyHeader, attribute: no-sticky-header }` |
   | treegrid.md | `no-status-bar` | `{ prop: showStatusBar, attribute: no-status-bar }` |
   | treegrid.md | `no-sticky-header` | `{ prop: stickyHeader, attribute: no-sticky-header }` |
   | tree.md | `hide-guides` | `{ prop: showGuides, attribute: hide-guides }` |
   | numberinput.md | `show-steppers` | the string `hideSteppers` |
   | datepicker.md | `invalid` | removed (see below) |

   NumberInput's prop is `hideSteppers`, default `false`. A boolean that defaults to false reflects under its own name, so `show-steppers` inverts a prop the convention says never to rename: the entry becomes the plain string `hideSteppers`, which `reflectEntry` resolves to the attribute `hide-steppers`.

   DatePicker has no `invalid` prop at all — its validity lives in `error`, a string — and no DatePicker style token interpolates `{invalid}`, so nothing needs the attribute. Delete the entry rather than invent a prop or reflect a string as a boolean. This is a removal: name it in your summary.

2. **The 11 un-negated entries.** Each names a boolean whose doc default is `true`, so each becomes `{ prop, attribute }` with the negated attribute. The attribute is `no-` plus the prop's kebab-case, except where this repo already spells that prop's negated attribute (`dismissible` → `no-dismiss`, `stickyHeader` → `no-sticky-header`, both already used by the docs in step 1) and except a `show*` prop, which negates to `hide-*`:

   | Doc | Entry today | Prop (default true) | Becomes |
   |---|---|---|---|
   | accordion.md | `divided` | `divided` | `{ prop: divided, attribute: no-divided }` |
   | bottomsheet.md | `drag-to-dismiss` | `dragToDismiss` | `{ prop: dragToDismiss, attribute: no-drag-to-dismiss }` |
   | breadcrumb.md | `collapse` | `collapse` | `{ prop: collapse, attribute: no-collapse }` |
   | carousel.md | `snap` | `snap` | `{ prop: snap, attribute: no-snap }` |
   | focusscope.md | `trapped` | `trapped` | `{ prop: trapped, attribute: no-trapped }` |
   | focusscope.md | `active` | `active` | `{ prop: active, attribute: no-active }` |
   | search.md | `landmark` | `landmark` | `{ prop: landmark, attribute: no-landmark }` |
   | sidepanel.md | `dismissible` | `dismissible` | `{ prop: dismissible, attribute: no-dismiss }` |
   | sidepanel.md | `swipeable` | `swipeable` | `{ prop: swipeable, attribute: no-swipeable }` |
   | table.md | `sticky-header` | `stickyHeader` | `{ prop: stickyHeader, attribute: no-sticky-header }` |
   | tooltip.md | `describes` | `describes` | `{ prop: describes, attribute: no-describes }` |

   The attribute spellings are the conservative reading of one rule, not something the doc states. List all 11 in your summary as naming choices for the owner to confirm.

3. **The 3 unreflected slots.** Add the plain string `size` to `platforms.lit.reflect` in input.md, numberinput.md and select.md. Each has an enum `size` prop whose kebab-case is its own name, so the string form resolves and the Lit element gains the attribute its `font.size.{size}` binding selects by. Change nothing else in those lists.

4. **Per-platform narrowing, only where the doc itself says so.** `a11y.requiresOn`, `props.<p>.valuesOn`, `copy.<k>.platforms` and `styles.<b>.platforms` remove something from a platform, and removing an accessibility requirement is never the conservative choice. Add a narrowing key only when that doc's own `platforms.<p>.notes` prose states the platform does not do the thing. Work through all 51 docs and apply exactly that test. What the committed docs support today:

   - **dialog.md**: `platforms.rn.notes` ends "Scroll lock has no native meaning and is not implemented", and `a11y.requires` lists `scroll-lock`. Add `a11y.requiresOn: { scroll-lock: [<every platform dialog.md declares except rn>] }`. Read the keys of `platforms` for that list; every entry must be a platform the component declares or the check rejects it.
   - **bottomsheet.md**: generated/gaps/BottomSheet.web.md says the composed Button cannot guarantee a 44px target on web, but `platforms.web.notes` does not say the requirement is not met there — and the gap log's own round 2 records that the generator satisfied it with an explicit rule. Do **not** narrow `target-44px`. Record it in your summary as a gap for phase 5.
   - **alert.md**: generated/gaps/Alert.rn.md says RN cannot move focus onward on dismiss, but `platforms.rn.notes` says nothing about focus. Check `a11y.requires` for a focus requirement and leave it alone unless the notes state the limit. Record what you find.
   - **tooltip.md**: `platforms.rn.notes` says "Placement flips using measureInWindow", while generated/gaps/Tooltip.rn.md says the flip is not implemented. The doc's prose is the source of truth, so do not narrow `placement` with `valuesOn`. Record the contradiction.

   If a pass over the 51 docs turns up no other case, say so plainly in your summary: a narrowing that only Dialog needs is the correct outcome, not a shortfall.

5. **Flip the check.** Move all three rules out of `componentWarnings(c)` in schema/component.ts into `componentDef.check`, so they are errors. Keep each message word for word, so the diff reads as a relocation:

   - `reflectWarnings(c)`, both messages: `reflects '<entry>' un-negated, but '<prop>' defaults to true (prompts/conventions/lit.md: reflect the negated attribute)` and `reflects '<entry>', which resolves to no prop; write { prop, attribute } to name the prop it reflects`.
   - `unreflectedSlots(c)`: `interpolates '{<slot>}', but platforms.lit.reflect does not resolve '<slot>', so the Lit element has no attribute to select the token by`.

   As warnings these carry a dotted `path` that tools/parse.ts prints as a prefix; as check issues the path becomes the array `componentDef.check` already uses elsewhere (`['platforms', plat, 'reflect', i]`, `['styles', bName, 'token']`) and the message stays exactly as quoted. Delete the two functions from the `componentWarnings` return list and leave every other rule there untouched — in particular do not touch `missingFormOrOverlay`, which jobs 634 and 635 own. The existing object-entry errors beside them in `componentDef.check` already cover the object form; do not duplicate them.

6. **Tests.** Phase 2 pinned today's warning lists, so those tests must now prove rejection and a clean corpus, in tools/__tests__/component-schema.test.ts:

   - `describe('componentWarnings for reflect lists')`: rewrite its three tests to assert the fixture is now **rejected** with the same path and message, through the same `issues(c)` helper the narrowing rejection tests use. Keep the fixture shapes (`narrowing()`), including the case that must stay accepted: a binding narrowed away from Lit, and a component whose Lit block is `supported: false`.
   - `test('the un-negated reflect warning names exactly 11 props: …')`, `test('ten string reflect entries resolve to no prop')` and `test('three token slots have no reflected attribute on Lit')`: rewrite each to assert that no component in generated/components.json raises that issue at all, and rename them to say so.
   - `test('narrowForPlatform changes nothing today, on any component or declared platform, so no prompt changes')` will now fail, because step 4 narrows a requirement. Rewrite it to assert that `narrowForPlatform(c, p)` differs from `c` for exactly the docs and platforms this job narrows, and deep-equals `c` everywhere else.
   - Leave `test('narrowing a binding to any one platform leaves its lockRule result unchanged')` green. No binding becomes overridable in this job.

7. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON. If `pnpm gates:behavior:check` reports stale files, run `node --import tsx tools/behavior_tests.ts` first and keep what it writes; this job should not change a single scenario, so investigate before you accept a diff there.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 633

In logs/600-measure-633.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `pnpm generate:check` fails until phase 4 regenerates; every doc you touch stales its prompt hashes and that is expected.

The job-specific proof is two things. First, `generated/parse-warnings.json` after `pnpm check` holds **zero** entries matching `un-negated`, `resolves to no prop` or `does not resolve` — quote the new total (194 minus this job's 24, if nothing else moved). Second, a fixture per rule in tools/__tests__/component-schema.test.ts that the schema now **rejects** with the message quoted in step 5. Report the counts you actually found for the three warning kinds, the 11 attribute spellings you chose, the DatePicker entry you removed, and every doc where you decided not to narrow.

Here is one finished entry, dialog.md, before and after:

    reflect: [open, size, no-dismiss, initial-focus]
    reflect: [open, size, { prop: dismissible, attribute: no-dismiss }, initial-focus]

`initial-focus` already resolves to the `initialFocus` prop by kebab-case and stays a plain string: only entries that warn change.

Do not modify `packages/*/src`, `prompts/templates/` or `prompts/conventions/` (both removed from the repository by commit 48ba3ce — do not recreate them), or any doc field other than `platforms.<p>.reflect` and the four narrowing keys. Do not rename a prop, do not add or remove a prop, and do not edit `a11y.requires` itself — narrowing says where a requirement applies, never whether it exists.
