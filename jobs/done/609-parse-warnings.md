Give `tools/parse.ts` a warning channel, so the phase 2 jobs can land stricter rules as warnings, per site/src/content/docs/process/schema-hardening.md, "Rules every job follows": "New fields land optional, with the old form still accepted … A stricter check arrives with the doc migration that satisfies it (phase 3), or one job earlier as a warning." Read that section first.

Today there is nowhere for a warning to go. `main` in tools/parse.ts collects an `errors` array from caught exceptions (validation reports by throwing), writes each as `✖ <message>` to stderr, and ends with the summary line `✔ N component(s), N theme(s), N pattern(s) parsed, N error(s) → generated/`. No tool under tools/ emits warnings. Jobs 610 through 628 each need one, and without a shared channel each would invent its own. This job is that channel and nothing else; it adds no warning of its own.

1. **The API, in two layers.**
   - In schema/component.ts export `componentWarnings(c: ComponentDef): { path: string; message: string }[]`, a pure function over one parsed component (`path` is the dotted field path, e.g. `keyboard.3.target`). It returns `[]` in this job. Later jobs add a rule about a single component here, where a test can run it over every entry of generated/components.json without the parser. It is not a Zod `.check`: Zod issues are errors.
   - In tools/parse.ts export `warn(file: string, message: string): void`, which records one warning (`file` is the repo-relative doc path, the way errors name their file), and `takeWarnings(): { file: string; message: string }[]`, which returns the warnings recorded since the last call and clears them, so tests can assert exactly what one parse produced. Rules that need other docs (composition, extensions, patterns) call `warn` directly.
   - Wire them together: after each component validates, tools/parse.ts calls `componentWarnings` and forwards each result as `warn(file, `${path}: ${message}`)`.
   A warning never throws, never stops a doc from parsing, and never changes what is written under generated/ other than `parse-warnings.json` below.
2. **Output.** `main` resets the collector at the start of a run, writes each warning to stderr as `⚠ <file>: <message>` after the errors, and changes the summary line only when there is at least one warning, by appending `, N warning(s)` after `N error(s)`. With zero warnings the summary line is byte-identical to today (grep tools/, mcp/, tests and `logs/600-baseline.mjs` for readers of that line and confirm none breaks either way). Warnings never affect the exit code.
3. **Machine-readable copy.** Write the run's warnings to `generated/parse-warnings.json` as `[{ "file", "message" }]`, sorted by file then message, `[]` when there are none, so the MCP server and later gates can read them without re-parsing stderr. If generated/ is committed, commit-worthy output must be deterministic: sorted, two-space JSON, trailing newline.
4. **Strict mode for phase 3.** When the environment variable `DS_WARNINGS_AS_ERRORS=1` is set, `main` counts every warning as an error (same message, `✖` prefix) and exits non-zero. Phase 3 migration jobs use it to prove a doc migration removed a warning before the check is flipped to an error for good.
5. **Tests.** In tools/__tests__/ add a test that a fixture validator calling `warn` yields exactly that warning from `takeWarnings`, that zero warnings leaves the summary line unchanged, that one warning appends `, 1 warning(s)`, that `generated/parse-warnings.json` is written sorted, and that `DS_WARNINGS_AS_ERRORS=1` turns it into a failing run. Use the same temp-tree approach the existing parse tests use (`paths` is mutable for that reason).
6. **Document it** in one short paragraph under "Rules every job follows" in schema-hardening.md: phase 2 warnings go through `warn` in tools/parse.ts; later jobs must reuse it, not add another channel.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node logs/600-baseline.mjs --out 609

`pnpm check` prints the same parse summary line as before this job, and `generated/parse-warnings.json` is `[]`. In logs/600-measure-609.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Do not modify `schema/`, `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/` other than the one paragraph in schema-hardening.md. This job adds the channel; the fields that use it come in 610 onward.
