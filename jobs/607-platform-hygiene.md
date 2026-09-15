One platform table, honoured by every tool, per site/src/content/docs/process/schema-hardening.md, section "607: one platform table". Read that section and "Rules every job follows" first. Jobs 600 to 606 have landed.

The platform list and the platform-to-package map are defined in at least six places and they disagree: `PKG` in tools/generate.ts, tools/checks.ts and tools/lint_literals.ts include swiftui; `PKG` in tools/parse.ts, `PLATFORM_PKG` in mcp/server.ts and the map in mcp/index.ts do not; tools/naming.ts has its own directory map; `PLATFORMS` in mcp/server.ts repeats schema/component.ts. So the MCP `lookup_code` tool returns no files for swiftui, a platform all 51 docs declare. `compose` is in the platform enum and read by nothing.

1. **schema/platforms.ts.** A new module that owns: `PLATFORMS` (`web, lit, rn, swiftui`, dropping `compose`), `platformId`, `PLATFORM_LABEL`, `PACKAGE_DIR` (platform → package folder name), `sourceDir(root, platform)` (swiftui is `packages/swiftui/Sources/DesignSchema`, the rest `packages/<dir>/src`), `demoDir(root, platform)` (null for swiftui), `TS_PLATFORMS` (`web, lit, rn`), and the source file extension per platform. schema/component.ts imports `platformId` from it and re-exports `PLATFORMS` and `platformId` so existing imports keep working.
2. **Replace every copy.** tools/generate.ts, tools/checks.ts, tools/lint_literals.ts, tools/parse.ts, tools/naming.ts, tools/behavior_tests.ts (`PLATFORMS`, `JS_PLATFORMS`, `PKG_SRC`, `EXT`), mcp/server.ts and mcp/index.ts import from schema/platforms.ts. mcp/index.ts may keep its natural-language aliases (`'jetpack compose'`), but they must map onto `PLATFORMS`; remove the compose alias with compose. grep for `'react'`, `swiftui:`, `PKG` and `Sources', 'DesignSchema'` afterwards and list any intentional survivor with its reason.
3. **supported: false.** In tools/generate.ts, the target list skips a (component, platform) pair whose `platforms.<p>.supported` is false; confirm with a fixture. Gates in tools/checks.ts are package-wide, so there is nothing per-component to skip there; say so in the summary rather than adding a no-op.
4. **Lit tag.** A `componentDef.check`: a `platforms.lit` block that is not `supported: false` must give `tag`. tools/behavior_tests.ts `litFile` currently dereferences it unconditionally.
5. **Literals gate for swiftui.** tools/lint_literals.ts already scans Swift. In `gatesFor`, run the `literals` gate for swiftui too, and delete the stale comment about job 450. Run `node --import tsx tools/checks.ts --platform swiftui`. If the literal gate fails on packages/swiftui/Sources (for example on generated icon path data), do not add exemptions: leave swiftui out of the literals gate, restore a truthful comment, and report the failures.
6. **MCP.** `lookup_code` resolves swiftui files from `sourceDir`. Add a case to mcp/__tests__/tools.test.ts, and make mcp/smoke.ts look up one swiftui component.
7. **Tests.** Update tests that assert the old maps or `compose`; add tools/__tests__/platforms.test.ts covering `sourceDir`, `demoDir` and the lit tag check.
8. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates
    node --import tsx tools/checks.ts --platform swiftui
    pnpm --filter website build
    node logs/600-baseline.mjs --out 607

In logs/600-measure-607.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `pnpm gates` runs the web, lit and rn gates over committed code; compare any failure with logs/600-baseline and the known package baselines before calling it new.

End your summary with a table of the phase 1 numbers from logs/600-baseline.json through logs/600-measure-607.json: tests, skips, derived names failing the regex, unlocked focus bindings, keyboard manual rules, locked bindings.

Do not modify `packages/*/src` or `prompts/templates/`.
