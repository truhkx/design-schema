**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Add a token manifest to the schema, so every token reference is checked against the real token set without any built output, per site/src/content/docs/process/schema-hardening.md, Phase 2 table, row 620. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the whole spec. Phase 1 (600–608) and jobs 610–619 have landed; read the current files.

`tokenRef` in schema/component.ts is only a regex, so the schema accepts `color.foregroud.strong`. The one existence check lives in `validate` (tools/parse.ts). It covers only bindings whose token interpolates a `{slot}`: 34 of the 940 style bindings, or 19 of the 101 distinct binding tokens (the plan's review counted 34 of 390).
- Nothing checks the 906 literal binding tokens or the 182 contrast-pair tokens at parse time. A wrong pair token shows up only as `✖ <Component>: unknown token` from tools/check_contrast.ts, at the end of `pnpm check`.
- The existing check reads packages/tokens/dist/calm-precise/json/tokens.light.json through `tokenNames`. When nothing has been built, that returns null and the check is skipped.
- The site content collection, the website and the MCP server validate with the Zod schema alone, so they never run it.

tools/theme.ts fixes the token set itself. Every theme derives the same names:
- 138 base tokens in base.json, typed `color`, `fontFamily`, `fontWeight`, `dimension`, `number`, `duration` and `cubicBezier`
- 62 tokens per mode, typed `color` and `shadow`
- the same set for calm-precise, warm-friendly and warm-sleek, and for light and dark
- 200 public names in the built JSON

Today no literal token is unknown, so the checks below land without touching a doc.

1. **Manifest.** Create schema/tokens.ts. It imports nothing outside schema/, and `zod` only if needed. Export:
   - `TOKEN_TYPES`: the DTCG types above.
   - `TOKENS`: full DTCG path → `{ type, layer: 'base' | 'mode' }`, in derivation order. Examples of paths: `color.foreground.default`, `color.palette.brand.500`, `shadow.raised`.
   - `tokenPublicName(path)`: drops a trailing `.default`, as `publicName` in tools/lib/tokens.ts does.
   - `TOKEN_NAMES`: the set of public names.
   - `isToken(ref)`: true for a public name or a full path.
   - `NO_TOKEN_VALUES`, moved here from tools/parse.ts.
   You may write the literal compactly (a ramp as its list of steps) if that keeps it readable, but the exported shapes stay as listed. The header comment says tools/theme.ts is the authority and tools/__tests__/tokens-manifest.test.ts fails when the two drift. If tools/publish_schema.ts or its test lists the files the schema package ships, add tokens.ts there.
2. **Checks move into the schema.** In `componentDef.check`, use `isToken`, and read slot values through job 619's `enumValues`:
   - **Moved.** The interpolated-binding rule leaves `validate`. Its message stays word for word, minus the file prefix: `<Component>: styles.<binding> '<token>' → '<public>' is not a token`. `NO_TOKEN_VALUES` stay exempt.
   - **New.** A literal `styles.*.token` that is not a token: `<Component>: styles.<binding> '<token>' is not a token`.
   - **New.** An `a11y.contrast` `foreground`, `background` or `surface` (`surface` comes from job 618) that is not a token after `expand`: `<Component>: a11y.contrast[<i>].<field> '<token>' is not a token`.
   Then:
   - Delete `tokenNames`, `hooks.tokenNames`, `paths.TOKEN_DIST` and the token-name cache reset from tools/parse.ts.
   - Update the tests that stub `parse.hooks.tokenNames` (tools/__tests__/parse-checks.test.ts and extensions.test.ts).
   - Bindings an extension adds must be checked too. If the merged component is not revalidated through `componentDef`, add the same checks next to `checkExtensionLocks`, with the same messages.
   - If `pnpm check` shows a current doc failing one of the new literal checks, do not edit the doc. Move that half out of `.check` and into job 609's `componentWarnings` in schema/component.ts, with the same message. tools/parse.ts already forwards its results through `warn`, so keep `pnpm check` green and list the docs. Do not add another warning channel.
3. **Leave the derivation alone.** tools/theme.ts, tokens/build.mjs and tools/check_contrast.ts do not import the manifest. check_contrast keeps its runtime `unknown token` line. Job 621 uses `TOKENS` to type theme overrides, so keep the `type` and `layer` fields exact.
4. **Tests.**
   - New tools/__tests__/tokens-manifest.test.ts:
     - For each committed theme (tokens/themes/*/theme.json), flatten `deriveBase` and `deriveMode` for every mode, with inherited `$type`. Assert the path set, each type and each layer equal `TOKENS` exactly.
     - Do the same for two fixture themes: one that takes the ink branch (`isInk`) and one that takes the two-seed branch (`seed.neutral`). No derivation branch may add or drop a name.
     - Assert `TOKEN_NAMES` equals the keys of packages/tokens/dist/calm-precise/json/tokens.light.json.
   - tools/__tests__/component-schema.test.ts, asserting path and message:
     - failing fixtures: a misspelled literal binding token, a misspelled contrast token, and an interpolated value with no token (moved from the parser tests)
     - a passing fixture with `none` on an interpolated padding
   - A parse test: with the paths pointed at a temp dir that has no packages/tokens/dist, a misspelled token is still rejected. Today that case passes silently.
5. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    git status --short -- tokens/themes packages/tokens/dist packages/swiftui/Sources/DesignSchemaTokens
    pnpm --filter website build
    node logs/600-baseline.mjs --out 620

Proof:
- The `git status` line prints nothing. After `pnpm check`, the derived tokens under tokens/themes/ and packages/tokens/dist/, and the Swift token sources, are byte-identical.
- In logs/600-measure-620.json, `corpus.componentsJsonSha256` equals the value in logs/600-measure-619.json, or in the highest-numbered measure present.
- Every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.
- grep tools/parse.ts to confirm no token-existence check remains there.

Do not modify `packages/*/src`, `prompts/templates/`, any doc under `site/src/content/docs/`, tools/theme.ts or tokens/build.mjs.
