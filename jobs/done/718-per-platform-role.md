Let a doc declare a platform's own role, per logs/backlog-triage.md, section D runner-up 10 (T17). Jobs 710 to 713 have landed.

`resolveRole` in schema/component.ts reads `a11y.role` (or `roleFrom`) only, and `concreteRole` in tools/behavior_tests.ts is platform-blind, so generated rn tests assert the schema's ARIA role verbatim: `getByRole('feed')`, `getByRole('separator')`, `getByRole('slider')` — where React Native 0.87's `AccessibilityRole` / `Role` has `list` and `adjustable`. Feed, Splitter, Table and Carousel are permanently red on rn, and every future component whose native role differs inherits it.

1. **Schema.** Add `role: ariaRole | rnRole` to the per-platform notes (`platforms.<p>.role`, optional), where `rnRole` is an enum of RN 0.87's accessibility roles. A `.check`: a platform role may only be set where it differs from the resolved `a11y.role`; on rn it must be an RN role. New fields land optional (schema-hardening "Rules every job follows").
2. **Resolver.** `resolveRole(component, given?, platform?)` returns `platforms.<platform>.role` when set, else today's answer. Update every caller that knows its platform (behavior_tests.ts, keyboard_tests.ts, the MCP `get_keyboard_model`, the website component page's role line).
3. **Docs.** Set the rn role on feed.md, splitter.md, table.md and carousel.md (and slider.md if it asserts `slider` on rn) from what their rn implementations actually render — read packages/rn/src, do not guess.
4. **Regenerate** schema JSON and generated/behavior/, run the rn behavior gate, list the scenarios that turned green.
5. **Tests.** Schema rejects an rn role that is not an RN role and a platform role equal to the base role; `resolveRole` covers the platform branch.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior

Do not modify `packages/*/src` or `prompts/templates/`. Doc edits are limited to adding `platforms.rn.role` on the components named above.
