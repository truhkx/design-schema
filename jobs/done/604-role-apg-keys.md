Close the free-text fields that tools branch on: `a11y.role`, `apg` and `keyboard.keys`, per site/src/content/docs/process/schema-hardening.md, section "604: roles, APG slugs and key chords". Read that section and "Rules every job follows" first. Jobs 600 to 603 have landed; job 600 already exports `keyChord` and `normalizeKey` from schema/component.ts.

Three tools keep their own, disagreeing role lists: `WIDGET_ROLES` (tools/parse.ts, moved into the schema module by job 603), `NON_CONCRETE_ROLES` in tools/behavior_tests.ts (`none, presentation, text, landmark`), and the inline list in `rootLocator` in tools/keyboard_tests.ts (`none, landmark, img`). Two docs use roles that are not ARIA roles: text.md (`text`) and landmark.md (`landmark`, whose real role comes from its own `role` enum prop).

1. **Roles.** In schema/component.ts:
   - `ariaRole`: a `z.enum` of the WAI-ARIA 1.2 concrete roles (widget, composite, document structure including `generic` and `paragraph`, landmark, live region, window roles) plus `none` and `presentation`. No abstract roles.
   - `a11yDef.role` becomes `ariaRole.optional()`, plus a new `roleFrom: z.string().optional()` described as "the enum prop whose value is the rendered role". A `.check` requires exactly one of `role` and `roleFrom`; `roleFrom` must name an enum prop whose every value is an `ariaRole`.
   - Export the partitions as const tuples: `WIDGET_ROLES` (focusable widget roles), `LANDMARK_ROLES`, and `NON_QUERYABLE_ROLES` (`none`, `presentation`, `generic`, plus any role `getByRole` cannot find without a name).
   - Export `resolveRole(component, given?)`: `role`, or the `given` value of the `roleFrom` prop, or that prop's `default`, or `null`.
   - Migrate text.md to `role: generic` and landmark.md to `roleFrom: role` (removing `role: landmark`).
   - Make tools/parse.ts, tools/behavior_tests.ts and tools/keyboard_tests.ts import these instead of their local lists, and call `resolveRole` wherever they read `c.a11y.role`. `rootLocator` falls back to the `data-ds` locator whenever `resolveRole` is `null` or non-queryable. grep `a11y.role` and `a11y?.role` across tools/, mcp/, apps/website/src and site/src and update every reader, including the MCP `get_keyboard_model` and the website component page.
2. **APG slugs.** `apg` becomes `z.enum` of the real APG pattern slugs: `accordion, alert, alertdialog, breadcrumb, button, carousel, checkbox, combobox, dialog-modal, disclosure, feed, grid, landmarks, link, listbox, menubar, menu-button, meter, radio, slider, slider-multithumb, spinbutton, switch, table, tabs, toolbar, tooltip, treeview, treegrid, windowsplitter`. Check each against https://www.w3.org/WAI/ARIA/apg/patterns/ only if network access is available; otherwise use this list. Remove `apg: separator` from divider.md and `apg: progressbar` from progressbar.md; neither is an APG pattern.
3. **Key chords.** Apply job 600's `keyChord` to `keyboardRule.keys`. Migrate docs: every `Ctrl+X` becomes `Control+x` with a lowercase letter (datagrid.md, tree.md, treegrid.md) and `Ctrl+Home` / `Ctrl+End` become `Control+Home` / `Control+End` (feed.md). listbox.md's `Control+a` is already canonical. In tools/keyboard_tests.ts route every key through `normalizeKey` and keep `KEY_MAP` only for Playwright's spelling of `' '`. Prose mentions of `Ctrl+` in descriptions may stay; only `keys:` arrays are data.
4. **Tests.** Schema rejects `role: text`, a role plus a roleFrom, a roleFrom naming a non-enum prop, an unknown apg slug, `Ctrl+A`; `resolveRole` covers the four cases; the keyboard spec for Landmark uses the `data-ds` locator.
5. Run `node --import tsx tools/schema.ts`, `node --import tsx tools/keyboard_tests.ts`, and keep the regenerated outputs.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm --filter website build
    node logs/600-baseline.mjs --out 604

In logs/600-measure-604.json: every step exit is 0 except `generateCheck`; `vsBaseline.lockedBindingsNoLongerLocked` is empty; `behavior.skips` did not rise from job 603's number. Report whether the `then.name: role 'none' cannot be queried` skips changed. grep confirms no local role list remains in tools/.

Do not modify `packages/*/src` or `prompts/templates/`. Do not change what any keyboard rule expects; only how its keys are spelled.
