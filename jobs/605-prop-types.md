Let a prop's `type` say what its `shape` already says, and validate prop defaults, per site/src/content/docs/process/schema-hardening.md, section "605: union props and checked defaults". Read that section and "Rules every job follows" first. Jobs 600 to 604 have landed.

Twelve props are declared `type: string` or `type: number` while their `shape` is a union: `value` and `defaultValue` on accordion, combobox, listbox and select (`string | string[]`), datepicker (`string | { start: string; end: string }`) and slider (`number | [number, number]`). Every consumer that switches on `type` treats them as scalars. Separately, nothing checks that a prop's `default` fits its `type` or its enum `values`.

1. **Schema.** In schema/component.ts add `union` to the `propDef.type` enum. A `.check` on `propDef` requires `shape` when `type` is `union`. Add a second check: a `default` must be a boolean for `boolean`, a number for `number`, a string for `string`, one of `values` for `enum`, and absent for `content`, `array`, `object`, `function` and `union`. If a doc in the corpus violates the last clause, report it and allow what the corpus actually needs rather than editing its meaning.
2. **Docs.** Change the twelve props to `type: union`, keeping their `shape` strings. Confirm the list with a grep for `shape: '` followed by a `|` on a string, number or boolean prop.
3. **Consumers.** grep for `type === 'string'`, `type === 'number'`, `.type ===` and `case 'string'` across tools/, mcp/, apps/website/src and site/src, and handle `union` at each site:
   - `validateBehavior` (or the schema check job 603 moved it to): a `given` value for a union prop is accepted as any JSON value; report the shape rather than guessing a narrower check.
   - tools/behavior_tests.ts `swiftPropValue` and friends: treat `union` like the scalar they were before, keyed on the value's runtime type.
   - tools/docs_examples.ts, the MCP server, the site and website props tables: display the `shape` for `union`.
   Add `union` to the template text only if a template enumerates prop types; if it does, that edit belongs to job 625, so list the line instead of editing it.
4. **Tests.** Schema rejects `type: union` without `shape`, `type: enum` with a `default` outside `values`, `type: boolean` with `default: 'true'`; each consumer handles a union prop.
5. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm --filter website build
    node logs/600-baseline.mjs --out 605

In logs/600-measure-605.json: every step exit is 0 except `generateCheck`; `vsBaseline.lockedBindingsNoLongerLocked` is empty; `behavior.skips` did not rise from job 604's number.

Do not modify `packages/*/src` or `prompts/templates/`.
