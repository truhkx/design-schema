Give events a typed contract (what the handler receives, why it fired, who can fire it, whether it can be vetoed, when it fires relative to the state change) and one registry of the event names components share, per site/src/content/docs/process/schema-hardening.md, Phase 2 table row 610. Read "Rules every job follows" and "Measuring a job" first. Phase 1 (jobs 600 to 608) and job 609 (the parser warnings channel) have landed. Phase 2 has no per-job section in the plan, so this prompt is the whole spec.

`eventDef` in schema/component.ts is `description`, `gesture` and `platforms` (a name per platform). Everything a handler receives is prose. In generated/components.json, 17 event descriptions spell out a payload or a reason list: Accordion.onOpenChange, ActionSheet.onClose, AlertDialog.onCancel, BottomSheet.onClose and onDragDismiss, Carousel.onChange, DataGrid.onSelectionChange, onCellChange, onRangeNeeded and onColumnResize, Dialog.onClose, Disclosure.onToggle, Menu.onOpenChange, Popover.onOpenChange, SidePanel.onOpenChange, Table.onSortChange and Toast.onDismiss. Prose cannot keep them consistent. accordion.md says its `onOpenChange` reasons come from Disclosure's `onToggle` and lists `trigger`, `keyboard`, `exclusive`, `controlled`. But disclosure.md's `onToggle` reasons are `pointer`, `keyboard`, `controlled`, and generated/gaps/Accordion.lit.md records that the Lit build always reports `trigger`, because Disclosure's `toggle` detail carries only `{ open }`. Ordering is also prose: "Fired before `onClose` with reason drag" (bottomsheet.md). Eleven components' gap logs discuss a `reason`. Names drift with no rule. The neutral `onChange` is `onChange` on React Native in 10 components, `onChangeText` in Input, NumberInput and Search, and `onValueChange` in Slider and Switch.

1. **Fields.** Add these to `eventDef`. All are optional, each with `.describe()` text a generator can act on.
   - `payload`: the handler's arguments, in order. Each is a strict object `{ name, type, shape?, values?, description? }`. `name` is an identifier. `type` is one of `string, number, boolean, enum, array, object, union`. `shape` is required for `array`, `object` and `union`, and `values` for `enum`, reusing `propDef`'s messages where they apply. An empty array means the handler takes no arguments. On web, React Native and SwiftUI the fields are positional; on Lit they are the keys of `CustomEvent.detail`.
   - `reasons`: a record mapping a kebab-case reason to when it is reported (`escape: Escape pressed while open`).
   - `fires`: a non-empty array of sources, each one of `user`, `programmatic` (the component changes state on its own, such as autoplay or a timeout) or `controlled` (the consumer changed a controlled prop).
   - `cancelable`: boolean. When true, the handler can veto the component's default action; how it vetoes belongs in the platform notes.
   - `timing`: a strict object `{ phase, before? }`. `phase` is one of:
     - `request`: the component does not change its own state and the consumer decides, as with Dialog's `onClose`
     - `before-change`
     - `after-change`
     - `commit`: fires once at the end of a continuous interaction, as with Slider's `onChangeEnd`

     `before` lists events of the same component that this one fires ahead of.
2. **Checks** in `componentDef.check`. Each fires only when its field is present, with the issue path at the offending key:
   - When an event declares both `reasons` and `payload`, the payload has a field named `reason` of type `enum` whose `values` are exactly the reason keys.
   - A `controlled` reason requires `fires` to include `controlled`.
   - `cancelable: true` with `timing.phase: after-change` is rejected, because nothing is left to cancel.
   - `timing.before` names events of this component. It never names the event itself, and two events never list each other.
   - In `behavior`, a `then.event` whose event declares these fields is checked:
     - An object `with` whose `reason` is not one of the event's `reasons` is rejected.
     - When the payload has two or more fields, every key of an object `with` must be a payload field name.
     - With exactly one field, `with` stays that field's value, as today.
   Keep every existing message word for word. Extend the `then` description in `behaviorScenario` only if the new `with` rule needs it to be readable.
3. **Registry.** A new schema/events.ts exports `eventConvention` (Zod) and `EVENT_CONVENTIONS`. schema/component.ts will import from it, so it must not import schema/component.ts. Define the `payload`, `timing` and `fires` field schemas in schema/events.ts (importing `platformId` from schema/platforms.ts), and have `eventDef` import them.
   - Include one entry for each neutral event name that two or more components use in generated/components.json. Compute that list; do not guess it.
   - Each entry has a `description` and, per platform, a non-empty array of accepted spellings (the first is preferred). It may also have `payload` and `reasons`, built from the `eventDef` field schemas.
   - A spelling is accepted when it is the majority spelling, or a platform-idiomatic alternative you justify in the description. For `onChange` on `rn`, accept all three spellings and say when each applies: `onChangeText` for text entry, `onValueChange` for a native scalar control, `onChange` otherwise.
   - Parse `EVENT_CONVENTIONS` with `eventConvention` at import.
   - Export `conventionDrift(component)`. It returns `{ path, message }[]` with one entry per event whose name is in the registry but whose platform name is not an accepted spelling. The path is `events.<name>.platforms.<platform>` and the message is `'<given>' is not a registry spelling; the registry accepts <list>`.
4. **Drift warnings.** Registry drift is a warning, never an error, because fixing it means editing docs. It reads only the component, so add it to `componentWarnings(c)` in schema/component.ts (added by job 609) by appending `conventionDrift(c)`. tools/parse.ts already forwards those results through `warn`. Do not add a warning channel of your own, and do not put drift in a Zod `.check`, because Zod issues are errors.
5. **Gate support.**
   - In tools/behavior_tests.ts `thenEventLines`, the Lit branch reads the event's `payload`. When the payload has exactly one field and `with` is a scalar, assert that `detail.<field>` equals the value, instead of the `Object.values(...).toContain` fallback. Every other branch is unchanged, and so is every event without a `payload`.
   - In mcp/index.ts `schemaSummary`, an event's line appends its reasons and payload field names when they are declared.
   - No doc declares these fields yet, so no generated output may change: `pnpm gates:behavior:check` must pass.
6. **Tests.**
   - tools/__tests__/event-contracts.test.ts:
     - One accepting and one rejecting fixture per check in step 2, built on `component()` from tools/__tests__/fixtures.ts, asserting the issue path and message.
     - `EVENT_CONVENTIONS` parses, and every name in it appears in at least two components in generated/components.json.
     - `conventionDrift` flags a fixture spelling with its path and message, and `componentWarnings` includes it.
     - `componentWarnings` run over every component in generated/components.json returns the drift you report in your summary.
     - `parse.main()` over a temp doc with drift (use `usePaths`) returns 0, and `takeWarnings()` from tools/parse.ts returns that warning.
     - Passing fixtures that mirror these real contracts: Dialog.onClose (`reasons` escape, close-button, scrim and action, with `timing.phase: request`); Disclosure.onToggle (`fires` includes controlled, with a `controlled` reason); BottomSheet.onDragDismiss (`timing.before: [onClose]`). Also a failing fixture of Accordion's `with: { reason: trigger }` against Disclosure-style reasons.
   - A Lit `thenEventLines` case in tools/__tests__/behavior_tests.test.ts.
   - A `schemaSummary` case in mcp/__tests__/.
7. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON. schema/extension.ts reuses `eventDef` through `shape.events`, so extension events gain the fields too; confirm that extension.schema.json regenerates.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    pnpm exec vitest run tools/__tests__/event-contracts.test.ts
    node logs/600-baseline.mjs --out 610

In logs/600-measure-610.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. The proof that the fields are real is event-contracts.test.ts: a doc using every new field parses, and each broken form fails with its message. In your summary, list the drift entries `pnpm check` now writes to generated/parse-warnings.json. That list is the registry drift phase 3 migrates.

Do not modify `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/`. No doc gains a field in this job, and a new check that would fail an existing doc is a warning, not an error.
