Type the behavior scenario clauses, per site/src/content/docs/process/schema-hardening.md, section "600: behavior clauses". Read that section and "Rules every job follows" first.

Today `given`, `when` and `then` in `behaviorScenario` (schema/component.ts) are `z.record(z.string(), z.unknown())`. The real vocabulary lives in three other places: the `.describe()` prose, `validateBehavior` in tools/parse.ts, and `whenLines` / `thenItemLines` in tools/behavior_tests.ts. They disagree, and a doc already slipped through: switch.md's `controlled-updates-on-set` scenario uses `when: { set: … }`, parses green, and becomes a `test.skip` on every platform.

1. **One key vocabulary.** In schema/component.ts export `keyChord`: a string matching `^((Shift|Control|Alt|Meta)\+)*(Escape|Enter| |Space|Tab|Backspace|Delete|Home|End|PageUp|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|F([1-9]|1[0-2])|\*|,|a-z|[a-z0-9])$`, plus an exported `normalizeKey(k)` that maps `Space` to `' '`. `KeyboardEvent.key` names are canonical; `Space` is accepted as an input alias because a bare `' '` is easy to miss in YAML. Grep every `keys:` and `when: { key:` in site/src/content/docs/components/*.md; if a legitimate key falls outside the regex, extend the regex and say so in your summary. Do **not** apply `keyChord` to `keyboardRule.keys` — that is job 604.
2. **Typed `when`.** Export `whenClause`: a union of strict objects, exactly one of `{ click: part }`, `{ key: keyChord }`, `{ type: string }`, `{ focus: part }`, `{ blur: true }`, `{ set: record<string, unknown> }` (a controlled prop change, applied as a re-render), `{ hover: part }`. `part` is a string; anatomy membership stays checked in `validateBehavior` (job 603 moves it).
3. **Typed `then`.** Export `thenClause`: a union of strict objects, each with an optional `platforms: platformId[]` (already enforced by the parser, never documented):
   - `{ event, with? }` and `{ event, fired: false }` as two members, so `with` on a must-not-fire event is a type error
   - `{ state: <BEHAVIOR_STATES>, is: boolean | 'mixed' }` — export `BEHAVIOR_STATES` from the schema as a const tuple and make tools/parse.ts import it
   - `{ focusable: boolean }`, `{ renders: boolean }`
   - `{ focused: part | 'none' | 'moved' | 'unchanged' }`. If any doc uses the `focus` alias, migrate it to `focused` and remove the alias from the gate.
   - `{ text: string }`, `{ copy: string }`, `{ role: string }`
   - `{ name: true | string }` — a string asserts the exact accessible name
   - `{ attribute: string, is: string | boolean | null, on?: part }` — `null` asserts the attribute is absent
   Rewrite the three `.describe()` strings to match exactly what the types allow. Run `node --import tsx tools/schema.ts` and keep the regenerated schema/component.schema.json.
4. **tools/parse.ts `validateBehavior`.** Delete every check the types now make impossible. Keep the cross-references the types cannot see (anatomy parts, event names, copy keys, prop names in `given`, platform subsets, the rn narrowing rules), keeping each existing message text so the tests only show what moved.
5. **tools/behavior_tests.ts.** Implement each new shape on every platform where it can hold, and throw `Unmappable` with a specific reason where it cannot:
   - `set`: web and rn call the `rerender` the harness already emits with the merged props; lit assigns the properties and awaits `updateComplete`; swiftui is Unmappable.
   - `hover`: web `user.hover`, lit `userEvent.hover`; rn and swiftui Unmappable. Then replace the blanket `HOVER_ROLES` skip in `scenarioBlock`: on web and lit, a scenario for a tooltip-role component with no `when` hovers the component's trigger part (the first anatomy part) before its assertions. Keep the skip on rn and swiftui.
   - `attribute`: web and lit `toHaveAttribute(name, value)` or `not.toHaveAttribute(name)`; rn `toHaveProp`; swiftui Unmappable.
   - `focusable: false` and `renders: false` assert the negative; `name: '<string>'` asserts that exact name.
   - rn `state: open` maps to `expanded`, which React Native sets; the current mapping reads an `open` key React Native never sets.
   - Key presses go through `normalizeKey`; keep the per-platform user-event spelling in one map.
6. **Tests.** In tools/__tests__/behavior.test.ts and behavior_tests.test.ts add: schema rejects an unknown `when` key, two keys in one `when`, `with` alongside `fired: false`, and a key outside `keyChord`; each new mapping emits the expected line per platform; the swiftui Unmappable reasons.

Gate — all must pass, run in this order:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node logs/600-baseline.mjs --out 600

In logs/600-measure-600.json: every step exit is 0 except `generateCheck` (expected stale); `behavior.skipReasons` contains no `when.set` entry; `behavior.skips` is below 36; `vsBaseline.lockedBindingsNoLongerLocked` is empty. Then run the newly unskipped Switch and Tooltip tests against the committed components:

    pnpm --filter @design-schema/react exec vitest run generated/behavior/Switch.web generated/behavior/Tooltip.web
    pnpm --filter @design-schema/lit exec vitest run generated/behavior/Switch.lit generated/behavior/Tooltip.lit

The files live in the repo-root generated/behavior/, and each package's vitest.config.ts includes them by relative path, so the filter is a path substring. Lit runs in a real browser; if Chromium is missing, say so rather than installing it. A newly real test that fails because the generated component does not do what the doc says is a finding, not a job failure: list each one in your summary. A test that fails because the emitted test code is wrong is yours to fix.

End your summary with the before and after of `behavior.skips` and `behavior.skipReasons`.

Do not modify `packages/*/src`, `prompts/templates/`, or any component doc other than a `focus` → `focused` migration. Do not touch `keyboardRule`.
