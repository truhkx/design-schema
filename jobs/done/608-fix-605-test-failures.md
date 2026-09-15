Make job 605's own gate pass, per site/src/content/docs/process/schema-hardening.md, section "605: union props and checked defaults". Read that section and "Rules every job follows" first. Jobs 600 to 605 are marked done, but 605 was moved to `jobs/done/` while its own gate was red: `pnpm test:tools` reports 2 failed tests in `tools/__tests__/parse-checks.test.ts`, both inside `describe('interpolation targets', ...)`.

Both failures throw the same schema issue: `Widget: frontmatter failed schema validation:\n  - component.props.size.default: default 'md' is not one of ['sm', 'huge']`. That message comes from the `default` check `propDef.check` added in schema/component.ts by job 605. The trouble is that neither failing test's `size` prop has a default of `'md'` by the time it calls `check(c)`:

    test('an enum value with no token is named in the error', () => {
      const c = component();
      c.props.size.values = ['sm', 'huge'];
      c.props.size.default = 'sm'; // the fixture's 'md' default is no longer one of the values
      ...
      check(c);
    });

    test('the check is skipped before tokens are built', () => {
      parse.hooks.tokenNames = () => null;
      const c = component();
      c.props.size.values = ['sm', 'huge'];
      c.props.size.default = 'sm';
      ...
      check(c);
    });

Both tests explicitly reassign `default` to `'sm'` — a value the new `values` array contains — before calling `check`. `'md'` is only the *base* `VALID_COMPONENT` fixture's original default in tools/__tests__/fixtures.ts, which both tests override. So the object `propDef.check` is validating is not the object either test actually built: something between the test's mutation and the Zod check is observing stale data.

1. **Reproduce.** Run `pnpm test:tools -- tools/__tests__/parse-checks.test.ts` (or the project's equivalent single-file vitest invocation) and confirm both failures still reproduce with the exact message above before changing anything.
2. **Trace it, don't guess.** Add a temporary `console.log` (or a debugger breakpoint) at the top of the `.check` block in schema/component.ts that logs `p.default` and `p.values` for every prop it runs on, and re-run just those two tests. Compare what the check actually receives against what the test constructed. Then check the candidates in order:
   - Whether `parse.validate` (tools/parse.ts) does anything to `fm.component.props` before it reaches `schemaErrors` — a merge, a call to `authoredSource`, a coercion — that could reintroduce a prop's original default.
   - Whether chaining `.check()` directly after `.refine()` on the same `propDef` schema (both present in schema/component.ts) makes the installed Zod version hand `.check()` a copy of the value from before the outer object's own fields were fully assigned, rather than the final parsed object.
   - Whether anything in tools/__tests__/fixtures.ts or parse-checks.test.ts's `usePaths()`/`useTmp()` cleanup leaves state from a prior test in the same `describe` block bleeding into the next one (the two failures are adjacent tests reusing the prop name `size`).
   Say in your summary which of these it was, with the actual root cause, not a plausible one.
3. **Fix it** wherever the trace points, keeping `propDef.check`'s logic and message text exactly as job 605 left them if the bug is not in that block. Do not make the two tests pass by weakening or removing the default-vs-values check — they must pass because the check now sees the value the test actually built.
4. **Regression check.** Run the full `pnpm test:tools` suite (not just this file) and confirm nothing else newly fails. Job 605's other proof commands (`node --import tsx tools/schema.ts --check`, `pnpm --filter website build`, the contrast and naming-demo checks in logs/605-check.log) do not need to be re-run from scratch, but re-run them if the fix touches anything they exercise.
5. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON if the fix changes schema/component.ts.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node logs/600-baseline.mjs --out 608

In logs/600-measure-608.json: every step exit is 0 except `generateCheck` (still expected stale — job 601 stales everything until phase 4 regenerates); `testTools` shows 0 failed; `vsBaseline.lockedBindingsNoLongerLocked` is empty; `behavior.skips` does not rise from job 604's number (19). Report the `testTools` count before and after in your summary.

Do not modify `packages/*/src` or `prompts/templates/`. Do not touch jobs 606 or 607, which are queued separately and depend on this only in that they should run against a green `pnpm test:tools`.
