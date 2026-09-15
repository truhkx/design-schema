Move the parser's hand-rolled cross-field rules into the component schema, then add the accessibility invariants nothing checks today, per site/src/content/docs/process/schema-hardening.md, section "603: cross-field checks". Read that section and "Rules every job follows" first. Jobs 600 to 602 have landed; build on them.

schema/naming.ts already uses Zod 4 `.check((ctx) => …)` for cross-field rules. componentDef should do the same, so the site's content collection, the website, the MCP server and the parser all reject the same docs with the same messages. In Zod 4 a `.check()` on a strict object keeps `.shape`, which schema/extension.ts relies on; confirm that before starting.

1. **Move.** Each rule below becomes an issue pushed from `componentDef.check`, with the path pointing at the offending key. Keep each message text identical to today's `DocError` text (minus the file-name prefix the parser adds), so test diffs show relocation, not rewording. Delete the parser copy once the schema owns it.
   - a `{slot}` in any `styles.*.token` names an enum prop (in `validate`)
   - every `composition` key is an anatomy part (target *existence* needs the filesystem and stays in the parser)
   - a `keyboard` block requires `keyboard-operable`; any `Escape` key requires `escape-dismiss`
   - any `gesture: true` event requires `gesture-alternative`
   - every event maps on every platform whose notes are not `supported: false`
   - in `behavior`: duplicate scenario names; scenario and item `platforms` subsets of the declared platforms, items within their scenario; `given` props exist and their values fit the prop type — extend this from enum and boolean to string and number; `when.click`, `when.focus`, `when.hover`, `then.focused`, `then.attribute.on` name anatomy parts; `then.event` names an event; `then.copy` names a copy key; the React Native narrowing rules for `when.key`, `then.focusable` and `then.state: invalid`
   What stays in the parser: the file name matching `component.name`, composition target existence, and the token-existence check that needs built tokens.
2. **Add.** New issues from the same `.check`:
   - `error-identification` requires an `error` prop
   - a non-empty `a11y.contrast` requires `contrast-aa` or `contrast-aaa`; any `level: AAA` pair requires `contrast-aaa`
   - `target-24px` or `target-44px` requires a binding on a `size.target.*` token, **or** a `composition` entry naming a component whose own doc declares a target requirement. The second half needs other docs, so implement it in the parser; the schema half checks only the binding.
   - `keyboard-operable` requires a `keyboard` block, **or** an `a11y.role` in the natively focusable widget roles (use `WIDGET_ROLES` from tools/parse.ts; move it into the schema module so both import one list), **or** a `composition` entry. The composition branch lives in the parser for the same reason.
   - `apg: dialog-modal` or `apg: alertdialog` requires `focus-trap`, `focus-restore`, `escape-dismiss` and `inert-background`
   - any keyboard rule with an `Arrow*` key requires `arrow-navigation`
3. **Fix the docs the new rules reject.** From the review these are at least box, form, datagrid, treegrid, fieldset, accordion, alert, alertdialog, bottomsheet, dialog, popover, sidepanel, toolbar and radiogroup, but trust the checker, not this list. For each, choose the fix the doc's own prose supports:
   - a requirement the component does implement and forgot to declare: add it
   - a requirement the component does not have: remove it (for example `keyboard-operable` on a container that is operable only through its children)
   - `error-identification` with no `error` prop: add the prop only if the prose describes an error message the component renders; otherwise remove the requirement
   - an `apg: dialog-modal` on a component the prose calls non-modal: correct the `apg`, do not add modal requirements
   Record every doc change in your summary as `doc: field — before → after — why`.
4. **Tests.** A new tools/__tests__/component-schema.test.ts with one passing and one failing fixture per rule, asserting the issue path and message. Update existing parser tests whose rules moved.
5. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm --filter website build
    node logs/600-baseline.mjs --out 603

In logs/600-measure-603.json: every step exit is 0 except `generateCheck`; `vsBaseline.lockedBindingsNoLongerLocked` is empty; `behavior.skips` did not rise from job 601's number; `corpus.derivedScenarios` may rise, because newly declared `error` props derive `error-is-identified`. Report that delta. grep tools/parse.ts to confirm no moved rule is still implemented there.

Do not modify `packages/*/src` or `prompts/templates/`.
