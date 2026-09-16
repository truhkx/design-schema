**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Move every event contract the docs spell out in prose into the `eventDef` fields job 610 added, and turn job 610's warning into an error, per site/src/content/docs/process/schema-hardening.md, Phase 3 ("Migrate the docs"). Read "Rules every job follows", "Measuring a job", Phase 2 and Phase 3 first, then jobs/done/610-event-contracts.md, which is the spec for the fields you are filling in, and schema/events.ts, which is the registry. Phase 1 and phase 2 (jobs 600 to 629) have landed. This is one field per job: `eventDef.payload`, `reasons`, `fires`, `cancelable` and `timing` are the only doc fields you may add, plus the one event **name** spelling the registry rejects (below). Nothing else in any doc may change.

## What is there today

Everything a handler receives is prose. Job 610 counted **17 event descriptions on 14 components** that spell out a payload or a reason list; a looser scan of `generated/components.json` finds around 39 descriptions that name what the handler receives. Compute the list yourself and work from it. **11 components carry a reason enum in prose**: accordion, actionsheet, alertdialog, bottomsheet, carousel, dialog, disclosure, menu, popover, sidepanel and toast.

Prose cannot keep them consistent, which is the whole point of the job. accordion.md says its `onOpenChange` reasons come from Disclosure's `onToggle` and lists `trigger`, `keyboard`, `exclusive`, `controlled`; disclosure.md's `onToggle` reasons are `pointer`, `keyboard`, `controlled`; and generated/gaps/Accordion.lit.md records that the Lit build always reports `trigger`, because Disclosure's `toggle` detail carries only `{ open }`. Ordering is prose too: bottomsheet.md's `onDragDismiss` is "Fired before `onClose` with reason drag", which is `timing.before: [onClose]`.

`generated/parse-warnings.json` is authoritative for what warns today. Group it yourself and quote real counts; when this job was written it held 194 warnings over 45 docs, exactly **one** of which is this job's — the registry drift `conventionDrift` reports:

    site/src/content/docs/components/link.md: events.onPress.platforms.lit: 'click (native, retargeted — no CustomEvent)' is not a registry spelling; the registry accepts 'press', 'click'

Assert what you find and list it; do not fail on a stale number.

## React Native's three spellings are facts, not drift

`EVENT_CONVENTIONS.onChange` in schema/events.ts accepts all three React Native spellings, and the corpus uses each deliberately:

- `onChange` — Accordion, Carousel, Checkbox, Combobox, DatePicker, Listbox, RadioGroup, SegmentedControl, Select, Tabs (10 components)
- `onChangeText` — Input, NumberInput, Search (TextInput's own name, for text entry)
- `onValueChange` — Slider, Switch (the name the native scalar controls use)

`onSubmit` likewise accepts `onSubmitEditing` (search.md). **Do not "fix" any of these.** They are `eventDef.platforms` facts the registry already accepts, and `conventionDrift` does not flag them. Leave every platform name alone except the single Link spelling below.

## The Link spelling

link.md writes its Lit `onPress` name as `click (native, retargeted — no CustomEvent)`: a name field carrying an explanation. The name is `click`, which the registry accepts (Link renders a native anchor whose click is retargeted out of the shadow root, instead of a `press` CustomEvent). Set `events.onPress.platforms.lit` to `click`, and keep the explanation by folding it into that event's `description`, which is an `eventDef` field and so in scope. Do not move it into `platforms.lit.notes`; that is another doc field and out of bounds for this job.

## Never invent a contract

A payload field, a reason key, a `fires` source, a `cancelable` or a `timing` must come from the doc's own prose, its `behavior` scenarios, the APG pattern in `a11y.apg`, or the observed contract of the generated code under `packages/*/src` (read only; never edit it). Where nothing determines it, **leave the field absent and list the event in your summary**. An invented reason key makes a green test that proves nothing, and a payload the generators do not emit becomes a lie every platform inherits.

The checks job 610 put in `componentDef.check` are already errors, so a half-declared contract fails `pnpm check` rather than warning:

- An event declaring both `reasons` and `payload` must have a payload field named `reason`, of type `enum`, whose `values` are **exactly** the reason keys.
- A `controlled` reason requires `fires` to include `controlled`.
- `cancelable: true` with `timing.phase: after-change` is rejected.
- `timing.before` names events of this component, never the event itself, and two events never list each other.
- In `behavior`, a `then.event` whose event declares these fields is checked: an object `with` whose `reason` is not one of the event's `reasons` is rejected, and when the payload has two or more fields every key of an object `with` must be a payload field name. With exactly one payload field, `with` stays that field's value.

Reason keys are kebab-case (`close-button`, not `closeButton`); the record key regex rejects anything else, and Zod reports that as `Invalid key in record`.

## Two contradictions you must resolve, not paper over

1. **Accordion / Disclosure reasons.** accordion.md claims Disclosure's reason list and then names `trigger` and `exclusive`, which disclosure.md does not have; the Lit gap log says the built component reports only `trigger`. Declare each component's reasons from its **own** prose and its own generated code, and if the two still disagree, say so in your summary as a finding for phase 5 rather than editing one doc to match the other. accordion.md's `onOpenChange` describes `{ id, open, reason }`, which is a three-field payload, so its `with` clauses (if any) must name payload fields.
2. **Checkbox, Switch and Button behavior scenarios.** 17 authored `then.event` items exist, all on button.md (`onTrack`, an object `with`), checkbox.md and switch.md (`onChange`, scalar `with: true` / `false` / `fired: false`). Declaring a payload on those events changes what tools/behavior_tests.ts emits for **Lit**: `thenEventLines`'s Lit branch, given a one-field payload, asserts `detail.<field>` instead of the `Object.values(...).toContain` fallback. That is the improvement job 610 built, so it is wanted — but it means the emitted Lit tests change. Check them: `node --import tsx tools/behavior_tests.ts` rewrites `generated/behavior/` (gitignored), and `pnpm gates:behavior:check` compares only the committed **Swift** cases, which read neither `payload` nor `reasons`, so that gate must stay green. Read the regenerated Lit test for checkbox.md and quote the changed assertion in your summary. If a declared payload would make an existing scenario's `with` invalid, the payload is wrong — fix the payload, never the scenario.

## Steps

1. **Inventory first.** Print every component's events with their `description`, `platforms` map and any declared fields. Keep the list; work through it doc by doc.

2. **Walk the 51 docs in file order.** For each event whose prose states a contract:
   - `payload` — the handler's arguments in order, each `{ name, type, shape?, values?, description? }`. `shape` is required for `array`, `object` and `union`; `values` for `enum`. An empty array means the handler takes no arguments — declare that only where the prose actually says so. On web, RN and SwiftUI the fields are positional; on Lit they are the keys of `CustomEvent.detail`.
   - `reasons` — kebab-case key → when it is reported, taken verbatim from the prose's list.
   - `fires` — `user`, `programmatic` (autoplay, a timeout), `controlled` (the consumer changed a controlled prop). Declare it where the prose settles it; carousel.md's `autoplay` reason is `programmatic`, and any `controlled` reason forces `controlled` here.
   - `cancelable` — only where the doc says the handler can veto. datagrid.md's `onEditStart` says "return false (web) or call preventDefault (lit) to refuse editing that cell", which is exactly this.
   - `timing` — `request` where the component does not change its own state and the consumer decides (dialog.md's `onClose`: "The consumer sets `open` to false (or not)"), `before-change`, `after-change` (disclosure.md's `onToggle`: "Fired after the state changes"), or `commit` for the end of a continuous interaction (splitter.md's `onSizeChangeEnd`, slider.md's `onChangeEnd`). `timing.before` where one event is documented as firing ahead of another of the same component.

3. **The highest-value events**, from the prose that already spells a contract out. This is where to start, not the whole list:

   | Doc | Event | What the prose already says |
   |---|---|---|
   | dialog.md | onClose | reasons `escape`, `close-button`, `scrim`, `action`; `timing.phase: request` |
   | bottomsheet.md | onClose / onDragDismiss | reasons `escape`, `close-button`, `scrim`, `drag`, `action`; onDragDismiss `timing.before: [onClose]` |
   | actionsheet.md | onClose / onAction | reasons `escape`, `scrim`, `cancel`, `drag`; onAction "receives its `id`" |
   | alertdialog.md | onCancel | reasons `cancel`, `escape` |
   | menu.md | onOpenChange / onAction | payload `{ open, reason }`; reasons `trigger`, `escape`, `outside`, `action`, `controlled`; `action` is documented as firing before onAction (`timing.before`) |
   | popover.md | onOpenChange | reasons `trigger`, `escape`, `outside`, `close-button`, `tab-out` |
   | sidepanel.md | onOpenChange | reasons `trigger`, `escape`, `close-button`, `scrim`, `swipe`, `action`, `navigation` |
   | toast.md | onDismiss | reasons `timeout`, `dismiss-button`, `escape`, `action`, `replaced` |
   | disclosure.md | onToggle | payload `{ open, reason }`; reasons `pointer`, `keyboard`, `controlled`; `fires` includes `controlled`; `timing.phase: after-change` |
   | accordion.md | onOpenChange / onChange | payload `{ id, open, reason }`; onChange "with the open ids" |
   | carousel.md | onChange | index plus reasons `next`, `prev`, `picker`, `swipe`, `autoplay`; `autoplay` means `fires` includes `programmatic` |
   | datagrid.md | onSelectionChange / onCellChange / onRangeNeeded / onColumnResize / onEditStart | union selection shape; `{ rowId, column, value, previous }`; `{ start, end }`; `{ column, width }`; `cancelable` |
   | table.md | onSortChange / onSelectionChange / onRowPress | `{ column, direction }`; array of ids; the row id |
   | form.md | onSubmit / onInvalid | `Record<string, string \| boolean>`; errors keyed by field name |
   | tree.md, treegrid.md | onExpandChange / onSelectionChange | bare arrays of ids — treegrid.md explicitly says "the bare array, as Tree; not wrapped in an object" |

   The registry already declares payloads for `onExpand` (`id`) and `onExpandChange` (`ids`, `string[]`); keep the docs consistent with it.

4. **Flip the check.** Move job 610's warning `conventionDrift` out of `componentWarnings(c)` in schema/component.ts and into `componentDef.check` as an error, **with its message word for word** and the same issue path (`events.<name>.platforms.<platform>`):

       '<given>' is not a registry spelling; the registry accepts <list>

   `conventionDrift` stays exported from schema/events.ts and keeps its `{ path, message }[]` return; only where it is consumed changes. Keep the `'<spelling>', '<spelling>'` list formatting exactly. After the flip, `componentWarnings` no longer returns drift, and `pnpm check` must print zero warnings of that shape.

5. **Tests.** Four tests in tools/__tests__/event-contracts.test.ts pinned the pre-migration state. Rewrite them:
   - `over generated/components.json it reports the drift phase 3 migrates` → assert the corpus produces **no** drift.
   - `flags a spelling the registry does not accept, with its path and message` → convert to a rejection: the `onTap` fixture is now rejected by `componentDef.parse` at that path with that message, and `accepted alternatives and names outside the registry are not flagged` becomes an accepting fixture (keep an `onValueChange` case, so the three RN spellings stay pinned as accepted).
   - the `parse.main` test `a doc with drift parses, and the drift is reported as a warning` → the temp doc must now **fail** parsing: `parse.main()` returns non-zero, the message appears in the error output, and `generated/parse-warnings.json` no longer lists it.
   - `the drift goes through warn, which takeWarnings returns` → remove or repoint; drift no longer goes through `warn`.
   - Add a corpus test over `generated/components.json`: every event's declared `reasons` keys match its `reason` payload field's `values` where both exist, and every `timing.before` names a real sibling event. The schema enforces both; the test states the invariant over real docs.
   - tools/__tests__/behavior_tests.test.ts: extend the Lit `thenEventLines` case with the now-real checkbox.md payload.
   - mcp/__tests__: `schemaSummary` appends reasons and payload field names; the case from job 610 now has real docs behind it.

6. **Regenerate.** `node --import tsx tools/schema.ts` if anything in the Zod files moved, and keep the regenerated JSON. Run `node --import tsx tools/behavior_tests.ts` and check what moved in `generated/behavior/` before running the gate.

## Before and after

dialog.md today:

    events:
      onClose:
        description: 'Fired when the user requests to close, with a reason: `escape`, `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or not).'
        platforms: { web: onClose, lit: close, rn: onClose, swiftui: onClose }

after (the description stays; the contract stops being only prose):

    events:
      onClose:
        description: 'Fired when the user requests to close, with a reason: `escape`, `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or not).'
        platforms: { web: onClose, lit: close, rn: onClose, swiftui: onClose }
        payload:
          - { name: reason, type: enum, values: [escape, close-button, scrim, action] }
        reasons:
          escape: Escape pressed while open
          close-button: the close button was activated
          scrim: the scrim was clicked
          action: a footer action asked to close
        fires: [user]
        timing: { phase: request }

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/behavior_tests.ts
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 638

In `logs/600-measure-638.json` every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Job-specific proof, after the gate block:

    pnpm exec vitest run tools/__tests__/event-contracts.test.ts

`pnpm check` must print **zero** registry-drift warnings, and the parse summary's warning count must have dropped by exactly the one this job owns. The rejection test in event-contracts.test.ts is the proof that the rule now errors: quote its name and the message it asserts. In your summary give the number of events that gained each field, the events you left undeclared with the reason for each, the Accordion/Disclosure finding, the changed Lit assertion for checkbox.md, and confirmation that the three React Native `onChange` spellings are untouched.

Do not modify `packages/*/src`, `packages/swiftui/Tests/`, `prompts/templates/`, `prompts/conventions/`, or any doc field other than `eventDef.payload`, `reasons`, `fires`, `cancelable`, `timing`, the Link Lit name spelling and that event's `description`. Doc edits stale prompt hashes, so `pnpm generate:check` fails until phase 4; that is expected and is the one step in the measure file allowed to exit non-zero.
