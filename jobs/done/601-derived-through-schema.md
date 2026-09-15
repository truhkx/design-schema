Make derived behavior scenarios and extension source markers valid schema data, per site/src/content/docs/process/schema-hardening.md, section "601: derived scenarios through the schema". Read that section and "Rules every job follows" first. Job 600 has typed the `when`/`then` clauses; build on it.

`deriveBehavior` in tools/parse.ts builds scenario objects by hand, and they never pass through `behaviorScenario`. Two consequences: 66 derived names fail the schema's own name regex (`renders-headingLevel-2`, `renders-filter-startsWith`, `renders-insetBlock-none`), and the `derived: true` key the parser adds is one the strict schema forbids, so generated/components.json does not revalidate. Separately, `stampSources` adds `source:` to extension-contributed items after validation, and apps/website/src/content.config.ts has to strip it again (`withoutExtensionSources`) before it can parse.

1. **Schema.** In schema/component.ts add `derived: z.boolean().optional()` and `source: z.string().optional()` to `behaviorScenario`, and `source: z.string().optional()` to `propDef`, `eventDef`, `styleBinding` and `keyboardRule`. Describe both as parser-set. In tools/parse.ts keep the existing rule that a doc may not author `derived`, and add the same rule for `source` in a canonical component doc; only `stampSources` sets it.
2. **Derived names.** In `deriveBehavior` build the enum render name as `renders-${kebab(propName)}-${kebab(String(value))}` with the `kebab` already exported from tools/parse.ts, and construct every derived scenario through `behaviorScenario.parse(...)`, so a future derived shape that the schema rejects fails the parse loudly. Check `mergedBehavior` still dedupes correctly when an authored scenario has the old camelCase name; grep the docs for any authored scenario named `renders-<camelCase>` and rename it to the kebab form.
3. **Declared accessible name.** Add `a11yRole: z.enum(['accessible-name', 'description', 'error']).optional()` to `propDef`, described as "what this prop contributes to the accessibility tree". In `accessibleNameProp` return a prop with `a11yRole: accessible-name` first, and fall back to today's heuristic only when no prop declares it. Set `a11yRole: accessible-name` on disclosure.md's `summary` prop, which the heuristic misses. Do not migrate other docs; that is phase 3.
4. **Website.** Delete `withoutExtensionSources`, `withoutSource`, `EXTENDED_RECORDS` and `EXTENDED_LISTS` from apps/website/src/content.config.ts and parse `componentDef` directly, since `source` is now valid. If `copy` values can carry a stamped source (they are strings), leave copy alone and note it.
5. **Revalidation test.** In tools/__tests__/parse.test.ts add a test that loads generated/components.json and asserts that every entry's `component` parses with `componentDef` and every item of `behaviorDerived` parses with `behaviorScenario`. This is the invariant the job exists for.
6. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

This job changes the behavior YAML of every generated prompt, so every prompt hash flips and `pnpm generate:check` reports everything stale. That is expected and is why this job runs early.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm --filter website build
    node logs/600-baseline.mjs --out 601

In logs/600-measure-601.json: every step exit is 0 except `generateCheck`; `corpus.derivedNamesFailingRegex` is 0; `corpus.derivedScenarios` equals the baseline 481 (renamed, not added or lost); `vsBaseline.lockedBindingsNoLongerLocked` is empty; `behavior.skips` did not rise from job 600's number. If `pnpm --filter website build` fails for a reason unrelated to this change, report the error and the evidence that it predates the job.

Do not modify `packages/*/src` or `prompts/templates/`. Do not change what `deriveBehavior` derives, only how it is built and named.
