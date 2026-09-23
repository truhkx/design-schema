**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Remove the fallbacks phases 2 and 3 kept so `pnpm check` could stay green during the migration, per site/src/content/docs/process/schema-hardening.md, section "Phase 5: after the regen" ("strict mode removes every fallback kept for migration, including the prose heuristic for accessible names"). Read that section and "Rules every job follows" first. Job 650 has landed; build on it.

Phase 2 landed every new field as optional with the old form still accepted, phase 3 migrated all 51 docs and phase 4 regenerated against them twice (2026-09-16 and 2026-09-17). The fallbacks are now dead weight that lets a doc silently go back to the old shape. Three are genuinely unused and come out here; the rest are still load-bearing and stay, with the evidence recorded. The numbers below are from `generated/components.json` as this job is written — **recount every one before you cut**, because job 650 edited child docs.

`accessibleNameProp` in tools/parse.ts is the one the plan names. It tries three things in order: a prop declaring `a11yRole: accessible-name`, then the first `string`/`content`/`enum` prop whose free-text `a11y` note contains "accessible name", "aria-label", "accessibilitylabel" or "accessibility label", then a required prop literally named `label`, `caption` or `title`. Exactly **one** doc in 51 declares the field job 601 added (`Disclosure.summary`); 27 docs reach their naming prop through the prose branch and 6 more through the required-name branch. So the heuristic cannot simply be deleted: 33 docs must declare `a11yRole: accessible-name` first, in this same job, on **the prop the heuristic picks today**, and then both branches go.

`controlledPairs` in schema/component.ts still pairs a prop with a `default<X>` sibling by name when neither declares `controls`. 34 props declare `controls`; **zero** by-name pairs are left in the corpus, so that branch comes out with no doc edit at all.

`componentWarnings` in schema/component.ts is down to `lifecycleWarnings`, and `generated/parse-warnings.json` is `[]`. No doc in the corpus uses `deprecated`, `status: deprecated` or `valueLifecycle` at all, so every lifecycle rule and the deprecated-composition `warn` in tools/parse.ts raise nothing: they become errors here.

## 1. Recount first; never cut a fallback a doc still uses

For every row of the table in step 6, count the real uses in `generated/components.json` (each entry's `component` holds the schema) before you touch the code. Write a throwaway script under `logs/` if that is easiest; do not add a permanent tool.

- A fallback with **zero** uses is removed.
- A fallback a doc still uses is either migrated in this same step — only where the doc's own text already says what the new form should hold — or **left in place and reported as not yet removable, naming every doc that depends on it**. Never delete a fallback while a doc depends on it, and never invent a declaration to make a count reach zero.
- If a count in this prompt disagrees with what you measure, trust your measurement and say so in your summary.

## 2. Declare the accessible-name prop in 33 docs

Add `a11yRole: accessible-name` to the prop `accessibleNameProp` resolves to today, so the resolution is identical before and after. Add nothing else; do not touch the prop's `a11y` prose, its `required`, or `a11y.requires`.

Through the prose branch (27): AlertDialog.heading, Breadcrumb.label, Button.label, Carousel.label, Checkbox.label, Combobox.label, DataGrid.caption, Dialog.heading, Feed.label, Fieldset.legend, Form.label, Icon.label, Input.label, Landmark.label, Menu.label, Meter.label, NumberInput.label, ProgressBar.label, RadioGroup.label, Select.label, Slider.label, Splitter.label, Switch.label, Table.caption, Toolbar.label, Tree.label, TreeGrid.caption.

Through the required-name branch (6): DatePicker.label, Link.label, Listbox.label, Search.label, SegmentedControl.label, Tabs.label.

`Disclosure.summary` already declares it; leave it alone. Two cases need care:

- **form.md** has two props whose prose matches a hint, `label` and `labelledBy`. The heuristic takes the first, `label`. Declare `label`, and say in your summary that `labelledBy` was the runner-up.
- **Six docs require `accessible-name` with an intrinsic name and no naming prop at all**: ActionSheet, BottomSheet, Popover, SidePanel, Stepper, Toast. They get **no** `a11yRole`. Their `has-accessible-name` scenario derives from `a11y.requires` and carries no `given`; that must not change.

Four docs carry a naming prop without requiring `accessible-name` (Checkbox, Form, Input, RadioGroup). They still get the field: the prop is what the name comes from, whether or not the requirement is declared.

## 3. Remove the heuristic

In tools/parse.ts, `accessibleNameProp` keeps only its first loop: the prop declaring `a11yRole: accessible-name`, else `null`. Delete `ACCESSIBLE_NAME_HINTS` and `ACCESSIBLE_NAME_PROPS` and grep that nothing still imports either. `ACCESSIBLE_NAME_PLACEHOLDER` stays: `accessibleNameGiven` still uses it, and so does a test. `accessibleNameGiven` is otherwise unchanged, and the readers in tools/behavior_tests.ts (`thenNameLines`, `swiftNameValue`) are unchanged.

Then add the uniqueness rule to `componentDef.check` in schema/component.ts: at most one prop may declare `a11yRole: accessible-name`, at path `['props', <second one>, 'a11yRole']`. Do **not** add a rule that `accessible-name` in `a11y.requires` demands a declared prop — the six intrinsic-name docs above would fail it, correctly.

## 4. Remove the by-name controlled pair

In `controlledPairs`, drop the `seededName` branch and everything that supports it, so the function returns only props that declare `controls`. `declared` is then true for every pair; keep the field and its type rather than rewriting every reader. Update the JSDoc, which currently says "Until job 651 removes it". Then check the two readers: the `paired by name, so no event is declared` line in tools/parse.ts becomes unreachable and goes with it, and `openPropName` in tools/behavior_tests.ts must keep working — see the table.

## 5. Turn the warning channel's rules into errors

Every rule in `lifecycleWarnings` moves into `componentDef.check` as an issue, **message word for word** and at the path it already reports, so the test diff shows relocation rather than rewording. That is the six messages it builds: the `status` rule, the deprecated default, the required-but-deprecated prop, the `use` that names something itself deprecated (three places), and the two `given` rules for scenarios and examples. The deprecated-composition `warn` in tools/parse.ts (`composition.<part>: <Component> is deprecated[; use <X>]`) becomes a `DocError` with the same text.

Leave `warn`, `takeWarnings`, `hooks.componentWarnings`, `DS_WARNINGS_AS_ERRORS` and `generated/parse-warnings.json` in place — the channel is the plan's one channel for the next round of rules, and job 609's tests cover it with fixtures, not corpus docs. `componentWarnings` itself, with nothing left to return, returns `[]`; keep the export and its tests.

## 6. The fallbacks that stay, and why

Confirm each count, then record it. These are **not** removed by this job.

| Fallback | Where | Corpus uses | Remove or keep |
|---|---|---|---|
| Prose heuristic for the accessible name | `accessibleNameProp`, tools/parse.ts | 27 docs | **Remove**, after step 2 |
| Required `label`/`caption`/`title` for the accessible name | `ACCESSIBLE_NAME_PROPS`, tools/parse.ts | 6 docs | **Remove**, after step 2 |
| `<x>` paired with `default<X>` by name | `controlledPairs`, schema/component.ts | 0 | **Remove** |
| `componentWarnings` lifecycle rules | schema/component.ts | 0 raised | **Promote to errors** |
| Deprecated composition target as a warning | tools/parse.ts | 0 raised | **Promote to an error** |
| `copy` accepting a bare string | `componentDef.copy`, schema/component.ts | 133 entries in 34 docs | Keep |
| `composition` accepting a bare string | `compositionEntry` | 50 entries in 17 docs | Keep |
| `reflect` accepting a bare string | `reflectItem` | 201 entries (22 object) | Keep |
| `partKind` inferring `component`/`element` | schema/component.ts | 345 of 356 parts | Keep |
| `slotName` deriving a per-platform name | schema/component.ts | 11 slots | Keep |
| `keyboardRule.expect` defaulting to `manual` | schema/component.ts | 107 of 192 rules | Keep |
| `contrastPair.large` | schema/component.ts | 1 pair (BottomSheet) | Keep |
| `openPropName` falling back to a prop named `open` | tools/behavior_tests.ts | 2 docs | Keep — see below |

The last row is the one judgement call. `openPropName` prefers the controlled prop whose `controls.state` is `open` and falls back to a boolean prop literally named `open`. Ten docs declare the pair; **AlertDialog and Tooltip** do not. tooltip.md declares no events at all, so `controls.event` — which `propControls` requires — cannot be satisfied, and job 637 left it deliberately. Read alertdialog.md: if its own prose names the event that reports the open change, declare `controls` there and say so; if it does not, leave it. Either way the fallback stays while tooltip.md needs it, and your summary names tooltip.md as the reason.

The four union fallbacks above (`copy`, `composition`, `reflect`, plus `partKind`) are the plan's own examples of what phase 5 would remove, and the corpus says all four are still the majority form. Removing any would mean rewriting between 50 and 201 entries across the docs, which is a doc migration, not a strict-mode job. Report them as not yet removable with the counts you measured; do not start that migration here.

## 7. Tests

In tools/__tests__/behavior.test.ts the heuristic's tests invert: the fixture whose `a11y` prose names the naming prop now resolves to `null`, `a declared a11yRole wins over the heuristic` becomes simply that the declared prop is the one, the BottomSheet-style `hideTitle` test is no longer meaningful and goes, and `the shipped disclosure doc declares its naming prop` stays as it is. Add a corpus test: every component in `generated/components.json` for which `accessibleNameProp` is non-null resolves through `a11yRole`, and no component declares the field twice.

In tools/__tests__/controlled-props.test.ts, the by-name fixture now yields no pair. For step 5, move each lifecycle case from a `componentWarnings` assertion to a rejection asserting the issue path and the same message string, and keep job 609's channel tests as they are.

**The old-form fixture must now be rejected.** Add one fixture per removed rule that parsed green before this job and fails after it, asserting the exact message: a component whose only naming prop is found by prose, one found by a required `label`, one with `<x>`/`default<X>` and no `controls`, and one per promoted lifecycle rule.

## 8. Regenerate the derived JSON

Run `node --import tsx tools/schema.ts` and keep the regenerated JSON — this job edits Zod files.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 651

In logs/600-measure-651.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. Then the job's own proof: `generated/parse-warnings.json` is `[]`; a fixture in the old form is now **rejected**, with the same message the warning used; and `corpus.derivedScenarios` and `corpus.lockedBindings` do not move (494 and 354 as this prompt is written — read `logs/600-measure-<the last job>.json` for the numbers job 650 left, and match those). `has-accessible-name` must still be derived 36 times: declaring the prop the heuristic already found changes which branch answers, never the answer.

Doc and schema edits stale prompt hashes, so `pnpm generate:check` failing is expected and is why `generateCheck` is the one non-zero step.

Every command runs bare from the repo root, in the foreground. **No compound commands**: a `cd …&&` prefix or an `&&` chain is denied and you never see the result. No PowerShell, no npx, no `git add` and no `git commit`.

Do not modify `packages/*/src`, `prompts/templates/` or `prompts/conventions/`. Doc edits are allowed only where a doc still uses a form this job removes — that is the 33 `a11yRole` declarations, plus at most alertdialog.md's `controls`. No other field of any doc changes.

End your summary with: the per-fallback table with the counts you measured, the 33 docs you declared `a11yRole` on, every fallback you found still in use and the doc that depends on it, the before/after of `corpus.derivedScenarios` and `corpus.lockedBindings`, and the final line of each gate command.
