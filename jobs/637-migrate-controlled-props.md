**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Declare `propDef.controls` on every controlled prop in every component doc, and turn job 611's warning into an error, per site/src/content/docs/process/schema-hardening.md, Phase 3 ("Migrate the docs"). Read "Rules every job follows", "Measuring a job", Phase 2 and Phase 3 first, then jobs/done/611-controlled-props.md, which is the spec for the field you are filling in. Phase 1 and phase 2 (jobs 600 to 629) have landed. This is one field per job: `propDef.controls` is the only doc field you may add, and nothing else in any doc may change.

## What is there today

`generated/components.json` has **26 `default<X>` props on 20 components**. 25 of them pair with an `<x>` prop **by name alone**: nothing in the doc says so, and nothing names the event that reports the change. The 26th, `Listbox.defaultActiveValue`, pairs with nothing — it seeds `activeValue`, which is not a prop — and it is the single warning this job owns:

    site/src/content/docs/components/listbox.md: props.defaultActiveValue: seeds 'activeValue', which is not a prop

Separately, **12 components declare a boolean `open` prop and only Disclosure has a `defaultOpen`**. Because nothing ties `open` to the event that requests the change, the generators each guessed: generated/gaps/Combobox.lit.md says the implementation "omits it entirely as a public property", generated/gaps/Combobox.rn.md says "the schema gives no `open`/`defaultOpen` prop" so its Keyboard story ships closed, and generated/gaps/Select.web.md added `open` "as a standard controlled/uncontrolled boolean mirroring `value`", which is a guess. Declaring `controls` is what stops that.

`generated/parse-warnings.json` is authoritative for what warns today. Group it yourself and quote real counts; when this job was written it held 194 warnings over 45 docs, exactly **one** of which is this job's (the Listbox line above). Assert what you find and list it; do not fail on a stale number.

## The field

`propDef.controls` is `{ event, default?, state? }` (schema/component.ts, `propControls`):

- `event` — the event that reports a requested change; the consumer updates this prop in response. **Required**, and it must name an event of this component.
- `default` — the prop that seeds the value when this prop is omitted.
- `state` — for a boolean prop, the `BEHAVIOR_STATES` member it drives: `open`, `checked`, `expanded`, `selected`, `pressed`, `disabled`, `invalid`.

`controls` goes on the **controlled prop** (`open`, `value`, `checked`), never on the `default<X>` prop. The checks job 611 put in `componentDef.check` are already errors, so a wrong declaration fails `pnpm check` rather than warning: the event must exist; `default` must name a different prop with the same `type`, the same `shape` where either has one, the same enum `values`, not `required`, and not itself declaring `controls`; no two props may name the same `controls.default`; a prop declaring `controls` may not carry a `default` of its own; `state` is boolean-props-only; and where both props narrow `platforms`, the default's must be within the controlled prop's. No `<x>` prop in the corpus carries a `default` today, so that last trap should not fire — if it does, say so rather than moving the literal.

## Never invent a pairing

Declare `controls` only where the doc already says what it means. The event must be the one the doc's own prose names as reporting that change; where two events could be it, or where there is no event at all, **leave the prop undeclared and list it in your summary with the reason**. The name-based fallback in `controlledPairs` stays until job 651, so an undeclared pair keeps working exactly as it does today. Two cases in the corpus are like this and you are expected to leave them:

- **tooltip.md** declares `open` and **no events at all**, so `controls.event` cannot be satisfied. Leave it. `openPropName` in tools/behavior_tests.ts falls back to the prop literally named `open`, so nothing breaks.
- **alertdialog.md** declares `open` (required) with `onConfirm` and `onCancel`; two events end the dialog and the doc does not say one of them reports the change. Leave it unless the doc's prose settles it, and quote the prose if you decide it does.

## The Listbox decision

`Listbox.defaultActiveValue` is "The option that is active when the list first receives focus (Select opens with the selected option active). Defaults to the first selected, else the first enabled option." Listbox also declares `onActiveChange`: "Fired as the focused (active) option changes, with its value — Combobox uses this to keep aria-activedescendant in sync". So the doc describes a controlled/uncontrolled pair whose controlled half was never declared: there is a seed and an event, but no `activeValue` prop.

You must decide which half is wrong and say so in your summary, with the prose you relied on:

- **Either** the prop is missing: declare `activeValue` on listbox.md with `controls: { event: onActiveChange, default: defaultActiveValue }`. This is the minimum that makes the declared pair true and is part of this field's migration — but it adds public API that the generators will implement, so call it out in your summary as an API addition for the owner to confirm.
- **Or** the default is wrong: the active option is internal state that no prop controls, and `defaultActiveValue` should not be spelled as a `default<X>`. Then say what it should be called and why the doc's prose supports it.

Pick one, justify it from listbox.md's own prose, and make the corpus clean either way.

## Steps

1. **Inventory first.** Print every `default<X>` prop with its seeded `<x>`, both props' `type`, `shape`, `values`, `required` and `default`, and the component's event names; and every boolean `open` prop with its component's events. Keep the list — the worklist below is keyed to it.

2. **Walk the 51 docs in file order.** For each controlled prop:
   - add `controls.event` — the event the doc's prose says reports the change;
   - add `controls.default` where a `default<X>` sibling exists;
   - add `controls.state` where the prop is boolean **and** one of the seven `BEHAVIOR_STATES` members is what it drives; do not stretch a state name to fit (a `collapsed` boolean is not `expanded`).

3. **Resolve the Listbox orphan** as above.

4. **Flip the check.** Move job 611's warning `orphanDefaults` out of `componentWarnings(c)` in schema/component.ts and into `componentDef.check` as an error, **with its message word for word** and the same issue path (`props.<name>`):

       seeds '<x>', which is not a prop

   Keep the predicate identical: it fires for a `default<X>` prop with no `<x>` prop that no `controls.default` names. After the flip, `pnpm check` must print zero warnings of that shape.

5. **Consumers.** `controlledPairs` in schema/component.ts already prefers declared pairs, so tools/behavior_tests.ts (`swiftUncontrolled`, `openPropName`, `effectiveGiven`, `scenarioBlock`) and mcp/index.ts (`schemaSummary`) pick the declarations up with no code change. Do not rewrite them. Do check what moved: a component whose open prop is now declared with `state: open` resolves through the declaration instead of the name, and `schemaSummary` now appends `controlled; changes reported by <event>; uncontrolled default <prop>`. `pnpm mcp:smoke` and the behavior gate cover both.

6. **Tests.** Four tests in tools/__tests__/controlled-props.test.ts pinned the pre-migration corpus. Rewrite them:
   - `25 name pairs, none declared, and no pair for Listbox.defaultActiveValue` → assert what the migrated corpus holds: every pair is `declared: true`, every pair's `event` is non-null, and the count is what you find (25 name pairs plus the `open` props you declared). Assert the number you find and explain it in your summary.
   - `componentWarnings reports exactly one orphan default, Listbox.defaultActiveValue` → assert the corpus produces **no** warning whose message starts with `seeds `.
   - `componentWarnings` / `a default prop that a controls.default names is not an orphan` → convert to a rejection: a fixture with an orphan `defaultActive` is rejected by `componentDef.parse` at path `['props', 'defaultActive']` with the message word for word, and the two fixtures that pair correctly are accepted.
   - the `parse.main` test `a doc with an orphan default parses, and the orphan is reported as a warning` → the temp doc must now **fail** parsing: `parse.main()` returns non-zero and the message appears in the error output, and `generated/parse-warnings.json` no longer lists it.
   - Add a corpus test that every declared `controls.event` names a real event and every `controls.default` names a real prop (the schema enforces it, but the test states the invariant over the corpus).
   - mcp/__tests__: the `schemaSummary` case from job 611 now has real docs behind it; extend it with one migrated component.

7. **Regenerate.** `node --import tsx tools/schema.ts` if anything in the Zod files moved, and keep the regenerated JSON.

## Per-doc worklist

**A. The 25 name pairs (20 docs).** Add `controls` to the `<x>` prop naming the `default<X>` and the event. The event column is the doc's own event list, for you to confirm against the prose — where the doc names more than one plausible event (Slider has `onChange` and `onChangeEnd`; Splitter has `onSizeChange` and `onSizeChangeEnd`), the reporting event is the one the consumer updates the prop from, and the `commit`-style event is not it. Say which you chose.

| Doc | Controlled prop ← default | Events available |
|---|---|---|
| accordion.md | `value` ← `defaultValue` | onChange, onOpenChange |
| checkbox.md | `checked` ← `defaultChecked` (`state: checked`) | onChange |
| combobox.md | `value` ← `defaultValue` | onChange, onInputChange, onOpenChange |
| datagrid.md | `sort` ← `defaultSort` | onSortChange, onSelectionChange, onCellChange, onEditStart, onRangeNeeded, onColumnResize |
| datepicker.md | `value` ← `defaultValue` | onChange, onOpenChange |
| disclosure.md | `open` ← `defaultOpen` (`state: open`) | onToggle |
| input.md | `value` ← `defaultValue` | onChange, onFocus, onBlur |
| listbox.md | `value` ← `defaultValue` | onChange, onActiveChange |
| numberinput.md | `value` ← `defaultValue` | onChange |
| radiogroup.md | `value` ← `defaultValue` | onChange |
| search.md | `value` ← `defaultValue` | onChange, onSubmit, onClear |
| segmentedcontrol.md | `value` ← `defaultValue` | onChange |
| select.md | `value` ← `defaultValue` | onChange, onOpenChange |
| slider.md | `value` ← `defaultValue` | onChange, onChangeEnd |
| splitter.md | `size` ← `defaultSize`; `collapsed` ← `defaultCollapsed` | onSizeChange, onSizeChangeEnd, onCollapseChange |
| switch.md | `checked` ← `defaultChecked` (`state: checked`) | onChange |
| table.md | `sort` ← `defaultSort`; `selected` ← `defaultSelected` | onSortChange, onSelectionChange, onRowPress |
| tabs.md | `value` ← `defaultValue` | onChange |
| tree.md | `expanded` ← `defaultExpanded`; `selected` ← `defaultSelected` | onSelectionChange, onExpandChange, onExpand, onActivate |
| treegrid.md | `expanded` ← `defaultExpanded`; `sort` ← `defaultSort`; `selected` ← `defaultSelected` | onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, onEditStart, onColumnResize |

`state` applies only to the boolean props here: `checked` on checkbox.md and switch.md, `open` on disclosure.md. `Tree.expanded` and `TreeGrid.expanded` are arrays of ids, not booleans, so they take no `state`.

**B. The 11 other boolean `open` props** (Disclosure is in table A). These have no `default<X>`, so `controls` is `{ event, state: open }` with no `default`:

| Doc | `open` | Event the prose names |
|---|---|---|
| actionsheet.md | required | onClose ("Dismissed without choosing") |
| bottomsheet.md | required | onClose ("Requested close with reason…") |
| combobox.md | optional | onOpenChange |
| datepicker.md | optional | onOpenChange |
| dialog.md | required | onClose ("The consumer owns it; the dialog requests changes through `onClose`") |
| menu.md | optional | onOpenChange ("the parent flips it from onOpenChange") |
| popover.md | optional | onOpenChange |
| select.md | optional | onOpenChange |
| sidepanel.md | optional | onOpenChange |
| alertdialog.md | required | **two candidates** — leave undeclared unless the prose settles it |
| tooltip.md | optional | **no events** — leave undeclared |

A doc in both tables (combobox.md, datepicker.md, select.md) gets two declarations: one on `value`, one on `open`.

## Before and after

checkbox.md today:

    props:
      checked:
        type: boolean
        description: Controlled checked state.
      defaultChecked:
        type: boolean
        description: Initial checked state for an uncontrolled checkbox.

after:

    props:
      checked:
        type: boolean
        description: Controlled checked state.
        controls:
          event: onChange
          default: defaultChecked
          state: checked
      defaultChecked:
        type: boolean
        description: Initial checked state for an uncontrolled checkbox.

and an `open` prop with no seed, from menu.md:

    open:
      type: boolean
      description: Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu.
      controls:
        event: onOpenChange
        state: open

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 637

In `logs/600-measure-637.json` every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Job-specific proof, after the gate block:

    pnpm exec vitest run tools/__tests__/controlled-props.test.ts

`pnpm check` must print **zero** warnings whose message starts with `seeds `, and the parse summary's warning count must have dropped by exactly the one this job owns. The rejection test in controlled-props.test.ts is the proof that the rule now errors: quote its name and the message it asserts. In your summary give the number of declared pairs before (0) and after, the props you left undeclared with the reason for each, and your Listbox decision with the prose behind it.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any doc field other than `propDef.controls` (and, if you take that path, the one `activeValue` prop the Listbox decision adds). Doc edits stale prompt hashes, so `pnpm generate:check` fails until phase 4; that is expected and is the one step in the measure file allowed to exit non-zero.
