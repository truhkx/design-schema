Give keyboard rules the fields the keyboard gate needs to test what they say, per site/src/content/docs/process/schema-hardening.md, Phase 2 table row 614: `keyboardRule.given`, `target`, `repeat`, `platforms`, `native`, and an array form of `expect`. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the whole spec. Jobs 600 to 613 have landed; build on them.

`keyboardRule` in schema/component.ts has `keys`, `action`, `when` (prose), `from` and one `expect`. tools/keyboard_tests.ts `specFor` turns each key into a Playwright test against the `Keyboard` story, and `specData` writes the same rules to generated/keyboard/<Name>.json for the SwiftUI XCUITest (packages/swiftui/Tests/DesignSchemaUITests/KeyboardSpecTests.swift decodes `expect` as a single `String`). The baseline had 186 rules, 106 of them `expect: manual`. Phase 1 left 190 and 108, in 22 components: DataGrid 18, DatePicker 11, Tree 9, TreeGrid 8, Combobox 7, Splitter 7, Carousel 6, and others. Most are manual because the rule cannot say what it needs:
- **A prop state.** 31 of the 44 manual rules with a `when` name a prop or prop value in prose, which the gate cannot set: `when: multiple` (Listbox and Tree Shift+Arrow and Control+a, Combobox Backspace), `selectable is row or range` (DataGrid Space, Control+a, Control+c), `vertical` (Tabs ArrowDown/ArrowUp), `collapsible` (Splitter Enter), `allowCustom` (Combobox `,`).
- **The element that changes.** `closes` asserts `expect(root).toBeHidden()` on `rootLocator(c)`. For Combobox (Escape, Tab) and Select (Escape, Tab) the resolved role is `combobox`, so the gate asserts that the input or trigger disappears. Those stay visible; the list is what closes. SidePanel (`role: none`) resolves to the `data-ds` host, which a persistent sidebar keeps.
- **Several outcomes.** Select Escape "closes the popup … and returns focus to the trigger", Menu Tab "closes and moves focus", Tooltip Escape "hides the tooltip without moving focus": one `expect` can hold only half of each.
- **Behavior the element already has.** Toolbar, Carousel, Stepper and Table `Enter`/`Space` "activates the focused control (its own behavior)", and Combobox and NumberInput Home/End move "the input's native caret". They are manual today, which looks the same as untested.
- **A platform.** Accordion's RN notes: "Arrow keys apply only with a hardware keyboard on react-native-web". Splitter's F6 is a desktop convention. Nothing can scope a rule to a platform.
The gap logs repeat this: generated/gaps/ActionSheet.web.md says its Tab rule "is `expect: manual` and isn't testable/enforceable in code", and DatePicker.lit.md guesses whether Tab wraps inside the calendar.

1. **Schema.** In schema/component.ts, add to `keyboardRule`, all optional and with **no `.default()`**, so generated/components.json does not change for any doc that doesn't use them:
   - `given: z.record(z.string(), z.unknown())`: props the Keyboard story renders with for this rule, over its own args.
   - `target: part`: the anatomy part that `closes` / `opens` assert on, instead of the component root.
   - `repeat: z.number().int().min(1).max(20)`: press the chord this many times before asserting.
   - `platforms: z.array(platformId)`: the platforms the rule applies on (omit = every declared platform).
   - `native: z.boolean()`: the rule is the rendered native element's own behavior. Generators implement nothing for it, and the gate still asserts its `expect` when there is one.
   - `expect` becomes `z.union([<the existing enum>, z.array(<the enum without manual>).min(2)])`, keeping `.default('manual')` on the union. Export the outcome list as `KEYBOARD_EXPECTS` and a helper `expectList(rule): string[]` (a string becomes a one-item list) so no reader branches on the type itself.
   Update each `.describe()` so the derived JSON documents the field. `extensionDef` reuses `shape.keyboard`, so extension rules get the fields too; confirm with a test.
2. **Checks** in `componentDef.check`. These are errors, because only the new fields can trip them and no doc uses those yet:
   - `given` props exist and their values fit the prop type. Refactor the behavior `given` / `when.set` loop into one helper both call, and phrase keyboard messages like the behavior ones with `keyboard rule <index>` in place of `scenario '<name>'`. Keep the behavior message text word for word. A `given` value must be a boolean, a number, or a string matching `^[A-Za-z0-9 _-]*$`, because it travels in a Storybook URL.
   - `target` is an anatomy part, and is only allowed when `expectList` contains `closes` or `opens`.
   - `platforms` is a subset of the declared platforms.
   - The `expect` array has no duplicates, and does not hold both `closes` and `opens`.
   - `repeat` above 1 is only allowed with `focus-next` or `focus-prev` in `expectList`. `toggles` would flip back on an even count.
   **Warning, not error:** a `closes` or `opens` rule with no `target` on a component whose `resolveRole` is in `WIDGET_ROLES`, because the gate would assert on the trigger. This fires on today's Combobox and Select rules; `pnpm check` must stay green. Add it as a rule in `componentWarnings(c)` in schema/component.ts, the warning channel job 609 added (earlier phase 2 jobs may already have added rules there; add beside them). tools/parse.ts prints each as `⚠ <file>: <dotted path>: <message>` and it never changes the exit code. Do not add another warning mechanism.
3. **Gate.** In tools/keyboard_tests.ts:
   - `specFor` skips a rule whose `platforms` excludes the platform.
   - A rule with `given` does its own `page.goto` with Storybook URL args (`&args=key:value;flag:!true`) through a new exported `storyUrl(id, given?)`. `beforeEach` keeps today's URL.
   - `target` swaps the asserted locator to `page.locator('[data-part="<part>"]').first()`. Check that prompts/conventions/web.md and lit.md both promise `data-part`; if React's does not, still emit it and say so in your summary.
   - `repeat` presses the key N times, and `focus-next` / `focus-prev` assert `before + N` / `before - N`.
   - An `expect` array emits one assertion block per outcome, in order.
   - A `manual` rule with `native: true` is emitted as `test.skip('… — native', …)` instead of `— manual`. The stdout summary appends `, N native` only when N > 0, so today's line is unchanged.
   - `specData` stays Swift-compatible. `expect` stays a string: the first outcome. An array is also written as `expectAll`, which the Swift decoder ignores. Rules whose `platforms` excludes `swiftui` are dropped. A rule with `given` or `target` is written with `expect: 'manual'`, because the XCUITest can set neither. Carry the new fields through in the JSON when present. Update the `KeyboardRule` type accordingly.
4. **Readers.** mcp/server.ts `getKeyboardModel` counts `autoTested` / `manual` through `expectList`, and reports `native` rules separately. `GET_KEYBOARD_MODEL_DOC` names the new fields. apps/website/src/keyboard.ts derives its rule type from `ComponentDef`; make it compile, and render nothing new.
5. **Tests.**
   - tools/__tests__/component-schema.test.ts: one accepted fixture using all six fields, and one rejected fixture per new check (unknown `given` prop, `given` value of the wrong type, `target` not in anatomy, `target` on a `focus-next` rule, undeclared platform, duplicate outcomes, `closes`+`opens`, `repeat` with `closes`), asserting path and message.
   - A test that `componentWarnings` flags a Combobox-shaped fixture.
   - tools/__tests__/keyboard_tests.test.ts: `storyUrl` encoding; `specFor` with each new field; `specData` keeps `expect` a string and adds `expectAll`.
   - mcp/__tests__/tools.test.ts: `get_keyboard_model` on an array `expect`.
6. Run `node --import tsx tools/schema.ts` and `node --import tsx tools/keyboard_tests.ts`, and keep the regenerated outputs.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/keyboard_tests.ts
    pnpm --filter website build
    node logs/600-baseline.mjs --out 614

Do not run Playwright; generating the specs and the tool tests is the proof. The keyboard_tests.ts line must report the same spec, auto-tested and manual counts as before this job, because no doc uses the fields. The job-specific proof is the accepted fixture in component-schema.test.ts parsing all six fields, and the `specFor` test showing each becomes spec code. `pnpm check` prints the Combobox and Select target warnings and exits 0; quote them in your summary.

In logs/600-measure-614.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `vsBaseline.keyboardManual` is still `106 → 108`. `corpus.componentsJsonSha256` should equal logs/600-measure-613.json's; if it differs, explain why in the summary (that alone is not a failure).

Do not modify `packages/*/src`, `packages/swiftui/Tests/`, `prompts/templates/`, `prompts/conventions/`, or any doc under `site/src/content/docs/`. New fields land optional with the old form still accepted; no keyboard rule changes what it expects.
