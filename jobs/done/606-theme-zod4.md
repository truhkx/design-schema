Make the theme schema one Zod 4 source with derived JSON, like the component and naming schemas, per site/src/content/docs/process/schema-hardening.md, section "606: one theme schema". Read that section and "Rules every job follows" first.

Today there are three theme contracts. schema/theme.ts imports `z` from `astro/zod` (Astro's bundled Zod 3), so nothing under tools/ or mcp/ can import it; only site/src/content.config.ts uses it. schema/theme.schema.json is hand-written, stricter (`additionalProperties: false`), and carries descriptions and `statusHues` defaults the Zod file lacks. tools/theme.ts `main` and the MCP `write_theme` validate against that JSON with tools/lib/jsonschema.ts, a hand-rolled draft-2020-12 subset that exists for this file alone. schema/extension.schema.json is also hand-written; nothing checks it against schema/extension.ts.

1. **Zod 4 theme schema.** Rewrite schema/theme.ts to `import { z } from 'zod'`. Every object becomes `z.strictObject`. Carry every `description` from theme.schema.json into `.describe()` and every default (including `statusHues` 25 / 145 / 80 / null) into `.default()`, and give the top-level objects `.meta({ id })` the way schema/component.ts does. Keep the JSDoc comments. Export `themeFrontmatter` and `ThemeDef` as today.
2. **Refines** on `themeDef`:
   - `neutralTint` is rejected when `seed.neutral` is set (tools/theme.ts ignores it in that case)
   - `modes.supports` has no duplicates and includes `modes.default`
   - `layout.contentWidth` is an integer; each `statusHues` entry is within 0 to 360; each `tone` entry is non-empty
   Fix site/src/content/docs/themes/warm-friendly.md, which sets a `neutralTint` alongside `seed.neutral`. Removing it must not change any derived token file; verify that.
3. **Derived JSON.** In tools/schema.ts add theme and extension to `targets()`, following `componentJsonSchema`, with `$id` and a description ending "Derived from schema/<file>.ts by tools/schema.ts — do not edit by hand." For extension.schema.json, first grep for its readers (the MCP server, tests, docs). If anything relies on its cross-file `$ref: component.schema.json#/$defs/…`, generate with a Zod registry that preserves those refs; otherwise inline, and say which you did and why.
4. **Validate with Zod.** tools/theme.ts `main` validates each doc with `themeFrontmatter.safeParse` and formats issues as `<file>:\n  - <path>: <message>`. The MCP `write_theme` and `start_theme` read field descriptions and allowed values from the Zod schema (via `z.toJSONSchema` at call time if that is simpler) instead of theme.schema.json. Then delete tools/lib/jsonschema.ts and tools/__tests__/jsonschema.test.ts, and grep that nothing still imports it.
5. **Site bridge.** In site/src/content.config.ts bridge `themeDef` into Starlight's Zod 3 schema exactly the way `component` is bridged there (`z.unknown().optional().transform(...)` calling `safeParse`). Update site/src/components/ThemeSwatches.astro only if its `ThemeDef` import breaks.
6. **Tests.** Update tools/__tests__/theme.test.ts and mcp/__tests__/ for the new error format; add one failing fixture per refine.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm --filter site build
    pnpm --filter website build
    node logs/600-baseline.mjs --out 606

`node --import tsx tools/schema.ts --check` must now report four files. After `pnpm check`, `git status` shows no change under tokens/themes/ or packages/tokens/dist/: the derivation is byte-identical. In logs/600-measure-606.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Do not modify `packages/*/src`, `prompts/templates/`, or tools/theme.ts's derivation logic. This job changes how themes are validated, not what they produce.
