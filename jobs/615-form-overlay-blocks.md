Give the schema a `form` block for field components and an `overlay` block for layered components, per site/src/content/docs/process/schema-hardening.md, Phase 2 table row 615. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the whole spec. Jobs 600 to 614 have landed; build on them.

**Three form contracts.** How a field joins a Form lives only in the convention files and in prose, and they disagree:
- prompts/conventions/web.md says fields "register with `FormContext` … `{ name, label, id, getValue, validate, focus }`", and three bullets later that "Form discovers fields by `data-ds-field`, never by a tag".
- prompts/conventions/lit.md says fields implement `DsFormField` and carry `data-ds-field`, but packages/lit/src/Form.ts discovers them through `FIELD_TAGS` / `FIELD_SELECTOR`, a four-tag list (`ds-input, ds-checkbox, ds-switch, ds-radio-group`).
- rn.md and swiftui.md register `{ name, label, getValue, validate, focus }`.
- The value types disagree: `string | boolean | undefined` (web, RN), `string | boolean | null` (Lit `currentValue`), `String | Bool | Double | [String] | ClosedRange<Double>` (SwiftUI). form.md's `onSubmit` promises `Record<string, string | boolean>`.

In generated/gaps/, 19 components hit this (80 lines). Listbox.lit and Combobox.lit have multi-select values outside `string | boolean | null`. DatePicker.lit and NumberInput.lit are "not in FIELD_SELECTOR". Input.web found "no existing field component … has this attribute, and Form.tsx actually discovers fields via React context registration". Form.lit found `ds-switch` has no `error` / `validationMessage`. The field docs are checkbox, combobox, datepicker, input, listbox, numberinput, radiogroup, search, segmentedcontrol, select, slider and switch, with form and fieldset as containers.

**Three flip strategies.** Where a popup goes when it would overflow is a prop description:
- menu.md `placement`: "flips automatically when it would overflow the viewport"; packages/react/src/Menu.tsx flips either axis.
- popover.md: "flips and shifts to stay in the viewport".
- select.md: "positioned below (flipping above)", vertical only.
- tooltip.md: "flips when it would overflow the viewport (on native, measured with measureInWindow like Popover)", while generated/gaps/Tooltip.rn.md reports the flip "is not implemented … placement is static".
- Lit uses the Popover API top layer with `getBoundingClientRect` (Menu, Popover, Select, Tooltip, Combobox); React uses a portal with `position: fixed`.

The eight `category: overlay` docs (actionsheet, alertdialog, bottomsheet, dialog, menu, popover, sidepanel, tooltip), plus the Select, Combobox and DatePicker popups, say in prose how they dismiss and what they anchor to.

1. **`form` block.** Add `form: formDef.optional()` to `componentDef`, a `z.strictObject` with `.meta({ id: 'formDef' })`:
   - `role: z.enum(['field', 'container'])`: a field contributes a value; a container (Form) collects them.
   - `value`: the prop that holds the submitted value (e.g. `value`, `checked`); required for `field`.
   - `valueType: z.enum(['string', 'boolean', 'number', 'string[]', 'date', 'date-range', 'number-range'])`; required for `field`.
   - `name`: the prop that keys the value in the submitted record (optional; the convention is `name`).
   - `validation: z.array(z.enum(['required', 'invalid', 'range', 'pattern', 'custom']))`: which checks the field runs, in precedence order after `error`.
   - `messages: z.partialRecord(<that enum>, z.string())`: validation → copy key.
   - `discovery: z.enum(['attribute', 'context'])`: how the container finds fields. Describe `attribute` as `data-ds-field` and `context` as registration.
2. **`overlay` block.** Add `overlay: overlayDef.optional()`, a `z.strictObject` with `.meta({ id: 'overlayDef' })`:
   - `layer: z.enum(['modal', 'popover', 'tooltip', 'toast', 'sheet'])`.
   - `anchor`: the anatomy part it positions against (omit for unanchored layers).
   - `placement`: the enum prop holding the preferred side.
   - `collision: z.enum(['flip', 'flip-shift', 'shift', 'none'])`: what happens on overflow.
   - `open`: the boolean prop that controls visibility.
   - `closeEvent`: the event fired on dismiss.
   - `dismiss: z.array(z.enum(['escape', 'outside-press', 'scrim', 'focus-out', 'close-button', 'swipe']))`.
   - `modal: z.boolean()`.
   No `.default()` anywhere in either block, so generated/components.json does not change for docs without them. Describe every field.
3. **Checks** in `componentDef.check`. These are errors, because only the new blocks can trip them:
   - form: `value` and `name` name props; a `boolean` `valueType` needs a boolean `value` prop, and `string[]` or a range needs `union`, `array` or `object`; `validation` containing `required` needs a `required` prop; every `messages` value names a `copy` key; `value` and `valueType` are present when `role: field`.
   - overlay: `anchor` is an anatomy part; `placement` is an enum prop; `collision` requires `anchor`; `open` is a boolean prop; `closeEvent` is an event; `dismiss` containing `escape` requires `escape-dismiss` in `a11y.requires`, and `modal: true` requires every `MODAL_REQUIRES` entry. For the requires rules, reuse the existing messages' form, e.g. "overlay.dismiss has 'escape' but a11y.requires lacks 'escape-dismiss'".
   **Warnings, not errors** (the old form stays valid): a component with `category: overlay` and no `overlay` block, and a component with both `name` and `error` props and no `form` block. Add both as rules in `componentWarnings(c)` in schema/component.ts, the warning channel job 609 added; tools/parse.ts prints each as `⚠ <file>: <dotted path>: <message>` and it never changes the exit code. Do not add another warning mechanism.
4. **Composition half, in the parser.** tools/parse.ts, beside the other rules that read other docs: a component with `form.role: container` whose `composition` names a component that declares `form.role: field` is fine; one naming a component with `name` and `error` props but no `form` block gets a warning through `warn(file, message)` from tools/parse.ts (job 609). This must not fail today's Form doc.
5. **Gate support.** In `deriveBehavior`, when `overlay.dismiss` contains `escape` and `overlay.open` and `overlay.closeEvent` are set, derive a scenario named `escape-fires-<closeEvent kebab-cased>`: given `{ <open>: true }`, when `{ key: Escape }`, then `[{ event: <closeEvent> }]`, with platforms excluding `rn`. Build it through `behaviorScenario.parse` like the other derived scenarios. No doc declares the block yet, so `corpus.derivedScenarios` must not change. mcp/server.ts `get_component` returns both blocks as-is; add a sentence naming them to `GET_COMPONENT_DOC`.
6. **Tests.**
   - tools/__tests__/component-schema.test.ts: an accepted Input-shaped fixture with a full `form` block and a Popover-shaped fixture with a full `overlay` block; one rejected fixture per check above, asserting path and message.
   - Warning tests for both warnings.
   - A `deriveBehavior` test for the escape scenario.
   - A parser test for the composition half.
   - A test that `extensionDef` still parses (it reads `componentDef.shape`).
7. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/parse.ts
    pnpm --filter website build
    node logs/600-baseline.mjs --out 615

The job-specific proof is the two accepted fixtures in component-schema.test.ts parsing every field of both blocks, and the derived escape scenario test. `node --import tsx tools/parse.ts` exits 0 and prints the overlay and form warnings. Report how many of each, and name the components, in your summary: they are phase 3's migration list.

In logs/600-measure-615.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `corpus.derivedScenarios` equals job 614's. `behavior.skips` did not rise from job 614's.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any doc under `site/src/content/docs/`. Do not pick a winner among the form contracts in code or conventions. The block records the contract; phase 3 fills it in per doc, and job 625 teaches the templates.
