Stop the behavior harness appending `expect.anything()` to event assertions, per logs/backlog-triage.md, section D item 2 (T13). Read sections A.2 and D first.

`thenEventLines` in tools/behavior_tests.ts emits, for web, `expect(mock).toHaveBeenCalledWith(<with>, expect.anything());` — a second argument the doc never declared. The schema contract is "exactly the listed arguments", and components that honour it fail: `generated/behavior/Stepper.web.test.tsx` asserts `onStepSelect("shipping", expect.anything())` against `packages/react/src/Stepper.tsx`'s `onStepSelect?: (id: string) => void`, called with one argument. Eight committed web behavior files carry the pattern (Switch, Checkbox, Slider, SegmentedControl, RadioGroup, Button, Input, Stepper; 21 assertions). `behavior-run` is a real gate in tools/checks.ts, so these are red against correct code.

1. **Harness.** In `thenEventLines`, the web branch emits `toHaveBeenCalledWith(<with>)` with no trailing matcher. If an event's schema entry declares a payload whose web form genuinely includes the originating DOM event (check `events.<name>.payload` / `platforms.web` in the doc), emit the declared arity instead — read it from the schema, never guess. rn and lit branches are unchanged unless they have the same defect; check and say.
2. **Regenerate** `node --import tsx tools/behavior_tests.ts` and keep `generated/behavior/`.
3. **Run** `pnpm gates:behavior`. Every assertion that newly fails is a real finding: the component passes an extra argument the doc does not declare. List each as `Component.event — called with (…) — doc declares (…)`; do not edit packages/*/src to fix them here, and do not re-add the matcher to make them pass.
4. **Tests.** tools/__tests__/behavior_tests.test.ts: the web event line carries no `expect.anything()`; a declared two-field payload emits two arguments.

Gate — all must pass:

    pnpm typecheck:tools
    pnpm test:tools
    node --import tsx tools/behavior_tests.ts --check
    pnpm gates:behavior

`grep -l "expect.anything()" generated/behavior/*.test.*` returns nothing. Report the before/after pass counts of `pnpm gates:behavior` per platform.

Do not modify `packages/*/src`, `prompts/`, or any component doc.
