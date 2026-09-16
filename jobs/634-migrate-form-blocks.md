**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Give every form field and the form container a `form` block, and turn job 615's form warnings into errors, per site/src/content/docs/process/schema-hardening.md, Phase 3. Read "Rules every job follows", "Measuring a job", Phase 2 and Phase 3 first, then jobs/done/615-form-overlay-blocks.md, which added `formDef` and its checks. This is one field per job: the only doc change you may make is adding a `form:` block. No prop, copy key, event, requirement or platform note changes.

**The evidence** is generated/parse-warnings.json, 194 warnings today, of which **9** are this job's — one per doc, `props: has 'name' and 'error' but there is no form block, so how the field joins a Form lives only in prose`, on checkbox.md, combobox.md, datepicker.md, input.md, listbox.md, numberinput.md, radiogroup.md, select.md and slider.md. Group the file yourself; if that count has moved, assert what you find and list it. Three more docs are fields that never warned, because the warning needs both a `name` and an `error` prop: **search.md** (no `error`), **segmentedcontrol.md** (neither) and **switch.md** (no `error`). They get a block too. So does the container, **form.md**.

**The three contracts this block records.** How a field joins a Form was only ever stated in prompts/conventions/, which commit 48ba3ce removed from the repository, and the four files disagreed. They are quoted here in full; do not go looking for them on disk, and do not recreate them.

- web.md: fields *"register with `FormContext` (`useFormContext()`): `{ name, label, id, getValue, validate, focus }`; `getValue` returns `string | boolean | undefined`… Validation precedence: `error` prop → `required` (`copy.required`) → `invalid` (`copy.invalid`)"*, and separately *"Every field component's root carries `data-ds-field`… Form discovers fields by that attribute, never by a tag or component list."* One file, two answers.
- lit.md: fields implement `DsFormField` with *"`name, label, required, disabled, error, currentValue (string | boolean | null), id, focus(), checkValidity(), validationMessage`"* and carry `data-ds-field`, yet *"`ds-form` collects by tag and `focusout`"* — packages/lit/src/Form.ts uses a four-tag `FIELD_SELECTOR`.
- rn.md and swiftui.md: *"Fields register with `FormContext`… `{ name, label, getValue, validate, focus }`"*, values `string | boolean | undefined` on RN and `String | Bool | Double | [String] | ClosedRange<Double>` on SwiftUI.
- generated/gaps/Input.web.md settles what is actually built: *"no existing field component … has this attribute, and Form.tsx actually discovers fields via React context registration"*.

So `discovery: context` on every entry below, field and container alike: it is what three of four platforms implement and what the one gap log that checked reports. It is the largest judgement call in this job — say so in your summary, and name `attribute` as the alternative the prose claims.

1. **The worklist.** Add `form:` to these 13 docs and to no others. Every value comes from the doc's own props and copy keys; `messages` maps a validation to a copy key that exists, and `validation` lists `required` only where the doc has a `required` prop.

   | Doc | role | value | valueType | name | validation | messages |
   |---|---|---|---|---|---|---|
   | checkbox.md | field | `checked` | `boolean` | `name` | `[required, invalid]` | `required: required`, `invalid: invalid` |
   | combobox.md | field | `value` | `string[]` | `name` | `[required, invalid]` | `required: required`, `invalid: invalid` |
   | datepicker.md | field | `value` | `date-range` | `name` | `[required, invalid, range]` | `required: required`, `invalid: invalid` |
   | input.md | field | `value` | `string` | `name` | `[required, invalid]` | `required: required`, `invalid: invalid` |
   | listbox.md | field | `value` | `string[]` | `name` | `[required, invalid]` | `required: required` |
   | numberinput.md | field | `value` | `number` | `name` | `[required, invalid, range]` | `required: required`, `invalid: invalid`, `range: outOfRange` |
   | radiogroup.md | field | `value` | `string` | `name` | `[required, invalid]` | `required: required`, `invalid: invalid` |
   | select.md | field | `value` | `string[]` | `name` | `[required, invalid]` | `required: required`, `invalid: invalid` |
   | slider.md | field | `value` | `number-range` | `name` | `[required, invalid]` | `required: required`, `invalid: invalid` |
   | search.md | field | `value` | `string` | `name` | omit | omit |
   | segmentedcontrol.md | field | `value` | `string` | omit | omit | omit |
   | switch.md | field | `checked` | `boolean` | `name` | omit | omit |
   | form.md | container | omit | omit | omit | omit | omit |

   What each column is answering, so you can check the table against the docs rather than copy it blind:

   - **`value`** is the prop that holds the submitted value. Checkbox and Switch contribute a boolean, so it is `checked`; Checkbox's `value` prop is the string a multi-select group submits, not the field's own value. Say in your summary that `value: checked` was chosen over `value: value` for Checkbox, since the doc's prose can be read either way.
   - **`valueType`** must fit: the check rejects `boolean` unless the value prop is boolean, and rejects `string[]`, `date-range` and `number-range` unless the value prop is a union, array or object. Combobox, Listbox and Select are `string | string[]`; DatePicker is `string | { start, end }`; Slider is `number | [number, number]`. Each takes the widest form its union can hold, because one block has to describe the field with `multiple` or `range` set as well as unset. Name that reading in your summary.
   - **`validation`** is the checks the field runs, in precedence order after an authored `error`. Search has no `required` and no `invalid` prop and no matching copy, so it lists nothing; SegmentedControl and Switch neither. Listbox has `required` and `invalid` props but no `invalid` copy key, so it declares the check and omits the message.
   - **`messages`** values must name a copy key that exists. DatePicker's range failure has two keys, `tooEarly` and `tooLate`, and no single one describes the check, so omit `range` from `messages` and list the omission.
   - **`name`** is the prop that keys the field in the submitted record. SegmentedControl has no `name` prop at all, so a Form cannot key it; omit the key (the check only validates it when present) and flag it in your summary as a doc gap for phase 5.
   - **fieldset.md is not a field.** It has an `error` prop but no `name`: it is a grouping wrapper around fields, not a value. It gets no block. Say so in your summary.

2. **Where the block goes.** `componentDef` orders its keys `… copy, form, overlay, platforms`, so `form:` sits after `copy:` and before `platforms:`, at two-space indent under `component:`. Here is input.md, before and after:

        copy:
          required: '{label} is required.'
          ...
        platforms:

        copy:
          required: '{label} is required.'
          ...
        form:
          role: field
          value: value
          valueType: string
          name: name
          validation: [required, invalid]
          messages: { required: required, invalid: invalid }
          discovery: context
        platforms:

3. **Flip the check.** The form half of `missingFormOrOverlay(c)` in schema/component.ts becomes an error in `componentDef.check`, with the message word for word — `has 'name' and 'error' but there is no form block, so how the field joins a Form lives only in prose` — at path `['props']`. Leave the overlay half exactly where it is: job 635 owns it, and `componentWarnings` must keep returning it.

4. **Flip the cross-doc half too.** `warnUndeclaredFields` in tools/parse.ts warns when a `form.role: container` composes a component with `name` and `error` props and no `form` block. Move it to the error path beside the other cross-doc errors, keeping the message word for word: `composition.<part>: <Component> has 'name' and 'error' props but no form block, so <Name> cannot tell how it joins as a field`. It fires on no doc today — Form's `composition` is empty — so it can only be proved by fixture; that is expected, not a reason to skip it.

5. **Tests.**
   - tools/__tests__/component-schema.test.ts, `describe('componentWarnings for the form and overlay blocks')`: the `FORM_WARNING` test must become a rejection test asserting path and message; keep `OVERLAY_WARNING` a warning test, untouched.
   - tools/__tests__/form-composition.test.ts: both tests pin the warning. Rewrite them so the undeclared-field fixture is now an error and the fixture composing a declared field still parses clean.
   - Add a corpus test: no component in generated/components.json raises the form issue, and every doc in the worklist above parses with the block it was given.

6. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON. Nothing in this job derives a behavior scenario — `deriveBehavior` reads `overlay`, not `form` — so `corpus.derivedScenarios` must not change; if it does, stop and report it. If `pnpm gates:behavior:check` reports stale files, run `node --import tsx tools/behavior_tests.ts` first and keep what it writes.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 634

In logs/600-measure-634.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `corpus.derivedScenarios` equals job 633's. `pnpm generate:check` fails until phase 4 regenerates; every doc you touch stales its prompt hashes and that is expected.

The job-specific proof is two things. First, `generated/parse-warnings.json` after `pnpm check` holds **zero** entries matching `no form block` — quote the new total (194 minus 9, if nothing else moved). Second, a fixture in component-schema.test.ts that the schema now **rejects** with the step 3 message, and a fixture in form-composition.test.ts that the parser now **errors** on with the step 4 message. In your summary: the count you found, the 13 docs you touched, and every value the docs did not determine — `discovery: context` on all 13, `value: checked` for Checkbox and Switch, the widest-union `valueType` for Combobox, DatePicker, Listbox, Select and Slider, the omitted `messages.range` on DatePicker, the omitted `name` on SegmentedControl, and Fieldset left alone.

Do not modify `packages/*/src`, `prompts/templates/` or `prompts/conventions/` (both removed from the repository by commit 48ba3ce — do not recreate them), or any doc field other than `form`. Do not add a `name`, `required` or `error` prop to a doc to make a block fit, and do not pick a winner among the three contracts anywhere but in the block: the block records what is built, and the conventions are gone.
