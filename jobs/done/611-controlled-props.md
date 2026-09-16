Declare which prop is controlled, which event reports a change to it, and which prop seeds it when uncontrolled, instead of pairing props by name, per site/src/content/docs/process/schema-hardening.md, Phase 2 table row 611. Read "Rules every job follows" and "Measuring a job" first. Phase 1 (jobs 600 to 608), job 609 (the parser warnings channel) and job 610 have landed. Phase 2 has no per-job section in the plan, so this prompt is the whole spec.

generated/components.json has 26 `default<X>` props on 20 components. 25 pair with an `<x>` prop by name alone. One, Listbox.defaultActiveValue, has no `activeValue` to pair with. No doc names the event that reports a change. The tools pair props by building strings: tools/behavior_tests.ts `swiftUncontrolled` builds `default${Key}`, and `effectiveGiven` looks for a prop literally named `open`. Twelve components have a boolean `open` prop, and only Disclosure has `defaultOpen`. combobox.md declares `open` as "Controlled popup state" beside an `onOpenChange` event, but nothing ties the two together, so the generators disagreed. generated/gaps/Combobox.lit.md says the implementation "omits it entirely as a public property". generated/gaps/Combobox.rn.md says "the schema gives no `open`/`defaultOpen` prop", so its Keyboard story ships closed. generated/gaps/Select.web.md adds `open` "as a standard controlled/uncontrolled boolean mirroring `value`", which is a guess. Fourteen components' gap logs discuss controlled or uncontrolled state.

1. **Field.** Add `propDef.controls`, a strict object `{ event, default?, state? }`. Its `.describe()` says the prop is controlled when it is given and uncontrolled when it is omitted.
   - `event`: the event that reports a requested change; the consumer updates the prop in response.
   - `default`: the prop that seeds the value when this prop is omitted.
   - `state`: for a boolean prop, the `BEHAVIOR_STATES` member this prop drives (`open`, `checked`, `expanded`, `selected`, `pressed`, `disabled`, `invalid`), so tests and templates can tie `then.state` to it.
2. **Checks** in `componentDef.check`, because `propDef` cannot see sibling props or events. Each fires only when `controls` is present. The issue path points at the offending key, and each message starts with `props.<name>.controls`:
   - `controls.event` names an event of the component
   - `controls.default` names a prop other than this one. That prop has the same `type`, the same `shape` when either has one, and the same `values` for an enum. It is not `required`, and it does not declare `controls` itself.
   - no two props name the same `controls.default`
   - a controlled prop takes no `default`, because a default would make every instance controlled
   - `controls.state` appears only on a `boolean` prop
   - when both props narrow `platforms`, the default prop's platforms are within the controlled prop's
3. **Helper.** Export `controlledPairs(component)` from schema/component.ts. It returns `{ prop, default, event, state, declared }[]`, with `null` for anything absent.
   - Props that declare `controls` come first, with `declared: true`.
   - For props without `controls`, the name rule (`<x>` beside `default<X>`) stays as a fallback with `declared: false` and `event: null`, until job 651 removes it.
   - A `default<X>` with no `<x>` is not a pair.
4. **Consumers.** Replace every pairing by name with `controlledPairs`: `swiftUncontrolled`, and `effectiveGiven`, which takes the pair whose `state` is `open`, falling back to the prop named `open`. Then grep tools/, mcp/ and apps/website/src for `default${`, `defaultOpen`, `defaultValue` and `'open'`, and list every survivor in your summary with its reason. prompts/templates/ also pair by name; leave them for job 625. No doc declares `controls`, so every generated file must be byte-identical: `pnpm gates:behavior:check` passes.
5. **Warning.** In `componentWarnings(c)` in schema/component.ts (added by job 609), warn about a `default<X>` prop that has no `<x>` prop and that no `controls.default` names. The warning is `{ path: ['props', 'defaultActiveValue'], message: "seeds 'activeValue', which is not a prop" }`, following whatever path type job 609 chose. tools/parse.ts already forwards these through `warn`. This is a warning, not a Zod issue, and `pnpm check` still exits 0. Do not add a warning channel of your own.
6. **MCP.** In mcp/index.ts `schemaSummary`, a prop's line appends `controlled; changes reported by <event>; uncontrolled default <prop>` when `controls` is declared. `get_component` already returns the schema as parsed; confirm the field reaches its output.
7. **Tests.**
   - tools/__tests__/controlled-props.test.ts:
     - One accepting and one rejecting fixture per check in step 2, asserting the issue path and message.
     - Passing fixtures that mirror Combobox's `open` (`controls: { event: onOpenChange, state: open }`, no default) and Checkbox's `checked` (`controls: { default: defaultChecked, event: onChange, state: checked }`).
     - `controlledPairs` over generated/components.json finds 25 name pairs, none declared, and no pair for Listbox.defaultActiveValue. If the corpus gives different numbers, assert what it finds and explain why in your summary.
     - `componentWarnings` over generated/components.json returns exactly one controlled-prop warning, for Listbox.defaultActiveValue.
     - Parsing a temp doc with an orphan `defaultActiveValue` (use `usePaths`) returns 0, and `takeWarnings()` includes that warning.
     - `swiftUncontrolled` and `effectiveGiven` cases with declared pairs whose names break the convention (say `expanded`, seeded by `initiallyExpanded`, with `state: expanded`), proving the pairing no longer reads names.
   - A `schemaSummary` case in mcp/__tests__/.
8. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    pnpm exec vitest run tools/__tests__/controlled-props.test.ts
    node logs/600-baseline.mjs --out 611

In logs/600-measure-611.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. The proof that the field is real is controlled-props.test.ts: a declared pair with unconventional names drives `swiftUncontrolled` and `effectiveGiven`, and each broken form fails with its message.

Do not modify `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/`. No doc gains a field in this job.
