**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Type theme overrides against the token manifest and add a `tuning` block, per site/src/content/docs/process/schema-hardening.md, Phase 2 table, row 621. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the whole spec. Phase 1 (600–608) and jobs 610–620 have landed. This job builds on job 620's schema/tokens.ts; if that file does not exist, stop and say so.

`themeDef.overrides` in schema/theme.ts is `{ light?: z.record(z.string(), z.any()), dark?: … }`, and the pipeline behind it validates nothing:
- **Paths.** tools/theme.ts `applyOverrides` splits each key on dots and creates any group that doesn't exist, writing `{ $value: value }`. So `color.action.primry.background: '#3B5BDB'` writes a token nothing reads. `colour.action.primary.background` creates a top-level group with no `$type`, and tokens/build.mjs carries that typeless token into every platform's output. The test 'creates missing intermediate groups' in tools/__tests__/theme.test.ts pins this behavior.
- **Values.** Nothing checks that a value fits its token's type.
- **Scope.** `main` applies overrides only to the per-mode trees, after `deriveMode`. None of the 138 base tokens (palette, type scale, line heights, weights, spacing, radius) can be adjusted at all.
- **MCP.** mcp/server.ts `writeTheme` passes `overrides` straight through `THEME_KEYS`.

The create-theme skill has to warn users about all of this. No theme doc under site/src/content/docs/themes/ uses `overrides` today, so the field can be typed without migrating anything.

1. **Typed overrides.** In schema/theme.ts, `overrides` becomes a strict object with optional `base`, `light` and `dark` records. Keep its `.describe()` and extend it. In `themeDef.check`, using job 620's `TOKENS`, add three rules:
   - **Path.** Each key is a token path, either full (`color.foreground.default`) or public (`color.foreground`). Under `light` and `dark` it must name a `layer: 'mode'` token; under `base`, a `layer: 'base'` token. Message: `overrides.<key>: '<path>' is not a <layer> token`. When the path is a token of the other layer, add which key it belongs under.
   - **Value.** The value fits the token's `type`:
     - `color`: `#rgb`, `#rrggbb`, `#rrggbbaa` or `transparent`
     - `dimension`: `<n>px`
     - `number`: a number
     - `fontWeight`: an integer from 100 to 900
     - `fontFamily`: a string or an array of strings
     - `duration`: `<n>ms`
     - `cubicBezier`: four numbers
     - `shadow`: `{ color, offsetX, offsetY, blur, spread? }`, each field typed as above
     - Any type also accepts a `{path}` reference to an existing token of the same type.
     Message: `overrides.<key>.<path>: expected a <type> value, got <repr>`.
   - **Locked.** The non-color entries of `LOCKED_TOKENS` in schema/component.ts (`size.target.*`, `border.width.focus`) cannot be overridden, because they are accessibility floors. Color focus tokens stay overridable: tools/check_contrast.ts checks the pairs components declare on them.
   These rules are errors (Zod `.check` issues), not warnings. No theme doc uses `overrides`, and an unknown path has never produced a token anything reads. If a theme doc does fail, do not edit it. Instead:
   - Move the failing rule out of `.check` into an exported pure function in schema/theme.ts, `themeWarnings(t): { path, message }[]`, shaped like job 609's `componentWarnings`.
   - In tools/theme.ts `main`, report each result through job 609's `warn(file, `${path}: ${message}`)`, imported from tools/parse.ts. The import makes no cycle, because tools/parse.ts does not import tools/theme.ts; confirm that before relying on it.
   - If `warn` only buffers, drain `takeWarnings()` at the end of `main` and print each one to stderr as `⚠ <file>: <message>`.
   - Do not add another warning channel.
   Say in your summary which rule became a warning.
2. **Apply only what exists.**
   - `applyOverrides` resolves a public name to its full path and replaces the `$value` of an existing leaf. On a path that is not in the tree it throws instead of creating groups. The schema has already rejected such a path, so the throw is only a guard. Replace the 'creates missing intermediate groups' test with one for the throw.
   - `main` applies `overrides.base` to the base tree after `deriveBase`, before base.json is written and before `deriveMode` runs, so mode choices see the overridden palette.
   - `light` and `dark` apply as they do today.
   - With no `overrides`, every written file is byte-identical.
3. **`tuning`.** Add an optional `tuning` strict object to `themeDef`. It holds named adjustments to values tools/theme.ts hardcodes in the base layer, so a theme can state them without an override. Every sub-key is optional:
   - `radius: { sm, md, lg }`: integers from 0 to 48 px, replacing the preset's three steps. `full` stays 999.
   - `lineHeight: { tight, normal, loose }`: numbers from 1.0 to 2.2, with tight ≤ normal ≤ loose.
   - `fontWeight: { regular, medium, semibold, bold }`: multiples of 100 from 100 to 900, ascending.
   Two more issues from `themeDef.check`:
   - `tuning.radius` has no effect when `radius` is `none`. Reject it the way `neutralTint` beside `seed.neutral` is rejected.
   - A token set in both `tuning` and `overrides.base` is ambiguous. Name the token and ask for one place.
   In `deriveBase`, read each tuned value where the code now uses the constant (`RADIUS`, and the `font.lineHeight` and `font.weight` literals). Fall back to exactly today's value, so output without `tuning` is byte-identical. Change no other derivation logic.
4. **MCP.** In mcp/server.ts, add `tuning` to `THEME_KEYS`, and mention `tuning?` and `overrides.base` in `WRITE_THEME_DOC`. `start_theme` reads its allowed values from the Zod schema: confirm the new fields appear there and the existing `start_theme` test still passes.
5. **Contrast is still checked.** The contrast check reads the written token files, so it needs no change, but prove it. In tools/__tests__/theme.test.ts:
   - Run `main` on a fixture theme with `overrides.light['color.action.primary.background']: '#F5F5F5'`.
   - Point the tools/check_contrast.ts `hooks` at the result, as check_contrast.test.ts does, with a component that pairs `color.action.primary.foreground` on that background.
   - Assert a `✖` line and exit 1.
6. **Tests.**
   - tools/__tests__/theme.test.ts, one failing fixture per rule, each asserting path and message:
     - a misspelled mode path
     - a base path under `light`
     - a color value on a dimension token
     - a dangling `{reference}`
     - an override of `size.target.min`
     - `tuning.radius` with `radius: none`
     - line heights out of order
     - one token set in both `tuning` and `overrides.base`
   - Passing fixtures:
     - `overrides.base['radius.md']: '10px'` lands in base.json
     - `tuning.radius.md: 6` lands in base.json as `6px`
     - a public-name override lands on the `.default` leaf
   - The existing test 'the committed tokens for %s are what the code derives' passes without edits.
   - mcp/__tests__/tools.test.ts: `write_theme` with a misspelled override path returns `ok: false` with the schema message and writes nothing.
7. **The create-theme skill.** `.claude/skills/create-theme/SKILL.md` describes the old behavior. Update exactly these passages to match what you built, in the file's own voice:
   - **Step 6, the paragraph after the `overrides` YAML example.** It currently reads: "Copy token paths exactly from the preview output: override paths aren't validated, and a typo silently creates a token nothing reads. Overrides reach the per-mode color and shadow tokens only, not the type, spacing or radius scales. They are still contrast-checked, so run steps 6 again after adding one." Rewrite it to say:
     - paths and values are validated against schema/tokens.ts, and what the error names
     - `base` reaches the scales and the palette
     - target sizes and the focus width can't be overridden
     - overrides are still contrast-checked, so run step 6 again (this also fixes the "steps 6" typo)
   - **Step 6's YAML example.** Add a `base` entry or a `tuning` example beside the per-mode one.
   - **Step 4's `radius` bullet** ("none, sm (2/4/6), md (4/8/12), lg (8/12/16), full (pills)"). Add that `tuning.radius` sets the three steps in px when no preset fits. Mention `tuning.lineHeight` and `tuning.fontWeight` beside the step 4 type bullets (`seed.typeface`, `scale`).
   - **Step 7's summary bullet** ("any overrides added"). Make it overrides or tuning.
   `.claude/skills/create-theme/scripts/preview.ts` says nothing about overrides today. Add one section after the ramps: read tokens/themes/<id>/theme.json and print each `overrides` path (per mode, and `base`) and each `tuning` value, with the token's resolved value, so a user sees what was pinned. Update the header comment to match, and keep the script read-only.
   **Fallback:** if writing under `.claude/` is refused in headless mode, write the complete updated files to `prompts/skills/create-theme/SKILL.md` and `prompts/skills/create-theme/scripts/preview.ts` instead. The relative imports have the same depth there. Before writing, grep tools/generate.ts and tools/parse.ts to confirm nothing reads `prompts/` outside `prompts/templates/` and `prompts/conventions/`. In your summary, say which location you used. If you used the fallback, say the owner must copy the files over `.claude/skills/create-theme/`.
8. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    git status --short -- tokens/themes packages/tokens/dist packages/swiftui/Sources/DesignSchemaTokens
    node --import tsx .claude/skills/create-theme/scripts/preview.ts calm-precise '#3B5BDB'
    pnpm --filter site build
    node logs/600-baseline.mjs --out 621

If you took the fallback, run the preview line from `prompts/skills/create-theme/scripts/preview.ts`.

Proof:
- The `git status` line prints nothing. No theme doc uses `overrides` or `tuning`, so after `pnpm check` the derived tokens under tokens/themes/ and packages/tokens/dist/, and the Swift token sources, are byte-identical.
- The contrast check inside `pnpm check` still reports 0 failures.
- In logs/600-measure-621.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Do not modify `packages/*/src`, `prompts/templates/`, any doc under `site/src/content/docs/` (theme docs included), or tokens/build.mjs. In tools/theme.ts, change only `applyOverrides`, the override and tuning wiring in `main`, and the tuned values' fallbacks in `deriveBase`.
