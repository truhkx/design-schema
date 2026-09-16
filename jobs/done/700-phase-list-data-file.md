**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Move the regeneration phase order out of `regen.ps1` into a data file that `tools/site_nav.ts`, `regen.ps1` and job 702's Node port all read, so `pnpm check` no longer depends on the text of a Windows script.

Today `pnpm check` runs `tools/site_nav.ts`, and it gets the phase order by regex-parsing PowerShell: `paths.REGEN` points at `regen.ps1`, and `parsePhases` matches the `$phases = @(` block with `PHASES_BLOCK`, each `@{ ... }` entry with `PHASE_ENTRY` and each `name = "..."` / `components = "..."` field with `FIELD`. `tools/__tests__/site_nav.test.ts` has a fixture `REGEN` written as PowerShell, and its test "the real regen.ps1 is parseable and covers every component" reads the real `regen.ps1`. If someone reformats that block, the docs sidebar breaks on every platform. Job 702 needs the same list for a cross-platform `tools/regen.ts`. The comments in `apps/website/src/nav.ts` and `apps/website/src/components/DocsSidebar.astro` also name `regen.ps1` as the source.

**The file is `tools/regen-phases.json`, not a `.ts` module.** `regen.ps1` has to keep reading it. Windows PowerShell 5.1 reads JSON with `ConvertFrom-Json`, but it can't import a TypeScript module without starting Node. JSON also can't run code. `tools/icon-paths.json` already sets the pattern of a data file next to the tools. The top level is an object with a `phases` key, not a bare array. PowerShell 5.1 passes a JSON array through `ConvertFrom-Json` as one pipeline object, so `@(... | ConvertFrom-Json)` would give a one-element array that holds the whole list, and `foreach` would run once. Reading `.phases` off an object avoids that.

This job runs headless under `run-jobs.ps1` with only Read, Write, Edit, MultiEdit, Glob, Grep, `Bash(pnpm *)`, `Bash(node *)`, `Bash(git status*)` and `Bash(git diff*)`. There is no PowerShell, so check `regen.ps1` by reading it and through the text test in step 5. Don't use npx or git add/commit.

0. **Baseline, before any edit.** Run `node --import tsx tools/site_nav.ts --check`. If it reports stale, run `pnpm nav` once and say so in your summary. Then save the current bytes with `node -e "require('fs').copyFileSync('generated/nav.json','logs/700-nav-before.json')"` and record the output of `git diff --stat -- generated/nav.json`.
1. **Create `tools/regen-phases.json`.** Copy the eleven entries of the current `$phases` block in `regen.ps1` exactly: same phase names, same order, same component order inside each phase (that order is the sidebar order). Shape:
   ```json
   {
     "description": "Regeneration phases in composition order: a component is generated only after everything it composes. Read by tools/site_nav.ts (docs sidebar groups), tools/regen.ts and regen.ps1. Pattern pages (site/src/content/docs/patterns) come last: they compose everything above.",
     "phases": [
       { "name": "Primitives", "components": ["Icon", "Text", "Heading", "Stack", "Box"] },
       ...
       { "name": "Patterns", "pattern": "SettingsPage" }
     ]
   }
   ```
   Components are JSON arrays, not comma strings. Keep the file ASCII.
2. **`tools/lib/phases.ts`** (annotations only, as the header of every tool says). Export:
   - `PHASES_FILE`: `join(REPO_ROOT, 'tools', 'regen-phases.json')`
   - `type Phase = { name: string; components?: string[]; pattern?: string }`
   - `class PhasesError extends Error {}`
   - `parsePhasesJson(text: string, source: string): Phase[]`. Throw `PhasesError` with a message starting `<source>: ` in each of these cases: the text isn't JSON; the top level isn't an object with a `phases` array (a bare array gets a message that names the `{ "phases": [...] }` shape and the PowerShell reason); a phase has no non-empty string `name`; a phase has both or neither of `components` (a non-empty array of non-empty strings) and `pattern` (a non-empty string); or two phases share a name.
   - `readPhases(file: string = PHASES_FILE): Phase[]`. A missing file throws `PhasesError`.
   - `componentPhases(phases: Phase[]): [string, string[]][]`. Returns the phases that have `components`, in order. Pattern phases are left out.

   You may use `zod` (already a devDependency) for the validation, as long as the error messages keep the `<source>: ` prefix.
3. **`tools/site_nav.ts`.** Replace `paths.REGEN` with `paths.PHASES` (default `PHASES_FILE`). Delete `PHASES_BLOCK`, `PHASE_ENTRY`, `FIELD` and the PowerShell parsing. Keep an exported `parsePhases(text: string): [string, string[]][]` that returns `componentPhases(parsePhasesJson(text, 'tools/regen-phases.json'))`, so `buildNav`'s signature does not change. In `main`, the missing-file check and the parse go through the same `NavError` path as today (`✖ <message>`, exit 1): catch `PhasesError` and rethrow it as `NavError`. In every message, the header comment and the `--help` text, name `tools/regen-phases.json` instead of `regen.ps1`, using `relToRoot(paths.PHASES)`. That covers "phase X names Y, which is not in", "no … phase composes …" and the missing-file message. `render`, `buildNav` and `TOP` don't change. The bytes of `generated/nav.json` must not change.
4. **`regen.ps1`.** Replace the whole `$phases = @( ... )` literal, including its comment lines, with a read of the data file. If `tools\regen-phases.json` is missing, `Log` a line naming it and `exit 1`. Otherwise:
   `$phases = @((Get-Content tools\regen-phases.json -Raw -Encoding utf8 | ConvertFrom-Json).phases)`
   (the script has already run `Set-Location $PSScriptRoot`). Then fix the three places that treated `components` as a string: the `-DryRun` log line, `$what`, and the `--component` argument in the phase loop, which becomes `($p.components -join ",")`. The rest keeps working unchanged: `$phases.name` in the two error messages (member enumeration), `$_.pattern` / `$p.pattern` (a missing property is `$null`, and the script does not set strict mode), and `$plan[$i].name`. Keep the file ASCII only, as its header requires. Change nothing else in `regen.ps1`.
5. **Tests.**
   - `tools/__tests__/site_nav.test.ts`: turn the `REGEN` fixture into a `PHASES` object (the same two component phases plus the `Patterns` pattern phase), written with `JSON.stringify` to `paths.PHASES` in `beforeEach`. Rename the "real regen.ps1" test so it reads the real `tools/regen-phases.json` through `saved.PHASES` and keeps the same assertions: the ten phase names in order, and 51 components. Update the `/no regen\.ps1 phase composes Dialog/` regex, the "two phases" test (edit the object, not a string) and the stale `--check` test (rewrite the JSON). Add one test that a missing phases file exits 1 with the file named.
   - New `tools/__tests__/phases.test.ts`, one case for each `PhasesError` in step 2, plus the happy path for `componentPhases` (pattern phases skipped, order kept).
   - The same file checks that `regen.ps1` is actually wired to the data file. It reads `regen.ps1` as text and asserts that it contains `tools\regen-phases.json`, contains `ConvertFrom-Json`, contains `-join ","`, and no longer contains `@{ name =`. This is a test of `regen.ps1`, not a pipeline dependency: nothing under `pnpm check` reads that file any more.
6. **Comments.** In `apps/website/src/nav.ts` (header comment) and `apps/website/src/components/DocsSidebar.astro` (the "Nothing here is hand-maintained" comment), name `tools/regen-phases.json` as the source of the phase order. Change comments only. Leave the site docs that mention `regen.ps1` (`process/website-plan.md`, `process/ios-platform.md`, `process/generation-pipeline.md`) to job 703.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/site_nav.ts --check
    node -e "const f=require('fs');const same=f.readFileSync('generated/nav.json').equals(f.readFileSync('logs/700-nav-before.json'));console.log(same?'nav.json byte-identical':'nav.json CHANGED');process.exit(same?0:1)"
    git diff --stat -- generated/nav.json

`site_nav.ts --check` prints `✔ generated/nav.json is current`. The byte comparison prints `nav.json byte-identical`. `git diff --stat -- generated/nav.json` prints the same thing it printed in step 0 (normally nothing). A Grep for `regen\.ps1` in `tools/site_nav.ts` and `tools/__tests__/site_nav.test.ts` returns no hits. In your summary, quote the new `$phases` line and the three edited lines from `regen.ps1`.

Do not modify `packages/*/src`, `prompts/templates/`, `generated/` (except what `pnpm check` regenerates), component docs, `schema/`, `jobs/`, `generate.ps1`, `commit.ps1`, or any page under `site/src/content/docs/`. This job moves where the phase list lives. It doesn't change the phases, their order, or the nav output.
