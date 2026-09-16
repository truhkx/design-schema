**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Port the full-regeneration orchestration from `regen.ps1` to a cross-platform Node tool, `tools/regen.ts` run as `pnpm regen`, and make `pnpm generate` parse the docs first the way `generate.ps1` does. **Verify only through `--dry-run` and unit tests. Never run a real generation.**

Right now the only way to regenerate the suite in composition order is `regen.ps1`, so macOS and Linux have none. It does all of this:
- **Flags:** `-From`, `-Phase`, `-Platform` (default `web,lit,rn`), `-NoPause`, `-Force`, `-Gates`, `-DryRun`, `-AutoFold`, `-FoldModel` (default `sonnet`) and `-Model` (sets `DS_MODEL`).
- **Checks, before anything runs:** it validates platforms against `web, lit, rn, swiftui`, and refuses `swiftui` when `gh` is not on PATH.
- **Log:** it writes `logs\regen<suffix>.log`. The suffix is `-` plus the platforms joined by `-` when the platform list isn't the default.
- **Plan:** it prints `Plan: A -> B  platforms=… force=… gates=… pause=…`. With `-DryRun` it then lists each phase and exits 0.
- **Preparation:** `pnpm themes`, then `pnpm parse` (exit 1 on either failure), then `pnpm exec playwright install chromium` when `-Gates` is set and a browser platform is requested.
- **Per phase:**
  - Runs `node tools/generate.ts --platform <P>` with `--component <list>` or `--pattern <name>`, plus `--force` and `--with keyboard --with axe` when those flags are set.
  - `Snapshot` commits `regen: phase <name> (<P>) exit <code>`.
  - Between phases, with `-AutoFold`: `Write-GapSummary` (`node --import tsx tools/gap_digest.ts --phase <name>`), then `AutoFold`. That function waits up to 1800 s in 15 s steps for `generated\fold.lock` to clear, writes the lock, pipes `prompts\fold-gaps.md` to `claude -p --model $FoldModel --permission-mode acceptEdits --allowedTools "…"`, runs `pnpm parse`, and exits 4 when parse fails. The lock is always removed.
  - Between phases, otherwise, unless `-NoPause`: gap summary, a "Paused for gap folding" message with the resume command, then exit 3.
- **End of the run:** `mcp/index.ts` reindex, `node tools/generate.ts --check` (exit code ignored), gap summary `final`, commit `regen: complete (<P>)`, then `== done ==` and exit 0.

`tools/generate.ts` `generatorRunning` treats any `logs/regen*.log` without `== done ==` (or `queue complete`) that changed in the last 30 minutes as a live run. The port must keep that contract. `regen.ps1 -DryRun` breaks it: it creates the log without the marker. Separately, `generate.ps1` runs `pnpm parse` before `node tools/generate.ts` and exits 2 when parse fails, while `package.json`'s `generate` script is only `node --import tsx tools/generate.ts`. So `pnpm generate --stale` can pay a model for a prompt the docs have already changed. pnpm 10 forwards a literal `--` to scripts (`pnpm nav:check -- --bogus` fails with `unrecognized arguments: --`).

**Safety, read before anything else.** This job runs headless under `run-jobs.ps1` with only Read, Write, Edit, MultiEdit, Glob, Grep, `Bash(pnpm *)`, `Bash(node *)`, `Bash(git status*)` and `Bash(git diff*)`. There's no PowerShell and no npx. A real regen calls the model (real money), rewrites `packages/*/src`, and commits through git from inside Node, where the allowlist can't stop it. So:
- Never run `pnpm regen`.
- Never run `tools/regen.ts` unless `--dry-run` is its first argument.
- Never run `pnpm generate` or `tools/generate.ts` with anything but `--check` or `--help`.
- Never run `generate.ps1`, `regen.ps1` or `claude`.
- Every unit test replaces every process-starting hook with a fake.

**Prerequisites** (jobs 700 and 701): `tools/regen-phases.json`, `tools/lib/phases.ts` (`readPhases`) and `tools/commit.ts` with an exported way to commit a message with all changes staged. If any is missing, stop and say so. Don't reimplement them here.

Read fully first: `regen.ps1`, `generate.ps1`, `mcp.ps1`, `tools/generate.ts` (at least `generatorRunning`, `CliRunner.run`, `hooks`, `parseArgs`, `run`), `tools/gap_digest.ts`, `tools/lib/proc.ts` (`which`, `winQuote`), `tools/commit.ts`, `tools/lib/phases.ts` and `tools/__tests__/fixtures.ts`.

1. **`pnpm generate` parses first.** Set `package.json` `"generate"` to `"node --import tsx tools/parse.ts && node --import tsx tools/generate.ts"`. Why this instead of a new `generate:fresh`:
   - The docs already tell people to run `pnpm generate`.
   - Parsing is deterministic, takes seconds and calls no model.
   - Generating from a stale prompt wastes money.
   - pnpm appends forwarded arguments to the end of the script string, so they reach `generate.ts`.
   - `&&` works in both sh and cmd.exe; the `check` script already chains this way.

   Leave `generate:check` without a parse: CI and `pnpm build` run `pnpm check` first, and adding a parse would change CI. The one behavioral difference from `generate.ps1`: a failed parse exits with parse's code (1), not 2. Say so in the `generate.ps1` header comment, which also gains a line naming `pnpm generate` as the cross-platform equivalent. Change nothing else in `generate.ps1`.
2. **`tools/regen.ts`** (annotations only), with `"regen": "node --import tsx tools/regen.ts"` in `package.json`.
   - **Flags,** mapping `regen.ps1`'s parameters one to one: `--from`, `--phase`, `--platform`, `--no-pause`, `--force`, `--gates`, `--dry-run`, `--auto-fold`, `--fold-model`, `--model`, plus `-h` / `--help`. `--flag=value` works. A bare `--` is ignored. An unknown flag exits 2. When both `--from` and `--phase` are given, `--phase` wins, as in `regen.ps1`.
   - **Checks, in `regen.ps1`'s order, all before any process starts:**
     - Platforms (reuse the platform list `tools/generate.ts` validates against rather than adding a fourth copy): an unknown platform exits 1.
     - `swiftui` without `which('gh')` exits 1.
     - Plan selection: an unknown `--from` / `--phase` exits 1 and lists the phase names.
     - Phases come from `readPhases()`.
   - **Paths and hooks.** Export `paths = { ROOT, LOGS, FOLD_LOCK, FOLD_PROMPT }` so tests can point them at a temp folder. Export `hooks = { run, which, sleep, commit, now }`.
     - `run(cmd, args, { input? })` streams stdout and stderr line by line to the log and returns the exit status.
     - Use async `spawn`, not `spawnSync`: phases run for hours and output must stream.
     - On Windows, `pnpm` and `claude` are `.cmd` shims. Start them the way `CliRunner.run` does (argv mapped through `winQuote`, joined, `shell: true`). Start `node` as `process.execPath` with no shell.
   - **`--dry-run`** prints the plan line and each phase's components (or `pattern <name>`), then every command the real run would execute, in order, one per line prefixed `  $ `:
     - the preparation commands;
     - each phase's generate argv;
     - each commit message;
     - between phases, one of three things: the gap digest plus the auto-fold `claude` argv and `pnpm parse`; or the gap digest plus `stops here (exit 3); resume with: pnpm regen --from <next> --platform <P>`; or nothing, with `--no-pause`;
     - the final steps.

     It shows `DS_MODEL=<model>` when `--model` is given. It starts no process, calls neither `which('claude')` nor `hooks.commit`, creates no log or lock file, and exits 0. Writing nothing is a deliberate difference from `regen.ps1 -DryRun`: a markerless log would make `generatorRunning` report a live run for 30 minutes.
   - **Real run,** mirroring `regen.ps1` step for step, with the same log messages where they make sense:
     - The log header is `== regen <ISO time> platforms=<P> ==`, and every line goes to stdout and the log.
     - `--model` sets `DS_MODEL` for child processes.
     - Preparation: `pnpm themes`, `pnpm parse`, and the Playwright install when `--gates` is set and any requested platform isn't `swiftui`.
     - Each phase starts `process.execPath --import tsx tools/generate.ts …` with the argv above.
     - The commit is `hooks.commit(message)`, backed by `tools/commit.ts` with all changes staged; trailers come from job 701's setting.
     - The gap digest starts `tools/gap_digest.ts --phase <name>`.
     - Auto-fold: the lock loop from `AutoFold`; `claude` found with `which('claude') ?? which('claude.cmd')` (log and exit 1 if it's absent); `prompts/fold-gaps.md` on stdin; `--model <fold-model> --permission-mode acceptEdits --allowedTools <FOLD_ALLOWED_TOOLS>`; then `pnpm parse`, exiting 4 with `regen.ps1`'s message on failure; the lock removed in a `finally`.
     - Pause: exit 3 with the resume line `pnpm regen --from <next> --platform <P>`.
     - End: `pnpm mcp:index`, `tools/generate.ts --check` (exit ignored), digest `final`, commit `regen: complete (<P>)`, then exactly `== done ==`, exit 0.
     - The last phase never pauses or folds.
   - **`FOLD_ALLOWED_TOOLS`,** exported: `Read,Write,Edit,MultiEdit,Glob,Grep,Bash(node tools/*),Bash(node --import tsx tools/*),Bash(pnpm *),Bash(git *)`.
     - `Bash(node --import tsx tools/*)` is added because `prompts/fold-gaps.md` step 3 tells the model to run `node --import tsx tools/check_contrast.ts`, which `Bash(node tools/*)` doesn't match.
     - `Bash(powershell *)` is dropped because after job 701 the prompt commits with `pnpm commit`.
     - Set the `--allowedTools` string in `regen.ps1`'s `AutoFold` to the same value. That string is the only line of `regen.ps1` this step changes.
   - **Header comment:** usage examples for each flag, exit codes 0 / 1 / 2 / 3 / 4, the log and `== done ==` contract, and that `regen.ps1` is the Windows equivalent.
3. **`regen.ps1` stays a working PowerShell implementation.** Don't turn it into a wrapper: nothing here can run it. Besides the `--allowedTools` string, add one header comment line naming `pnpm regen` as the cross-platform equivalent with the same flags in kebab-case. Leave `mcp.ps1` alone. Its equivalent is `pnpm mcp:index && pnpm mcp:smoke`, which job 703 documents.
4. **Tests: `tools/__tests__/regen.test.ts`.** Use `useTmp` / `useStd` from `fixtures.ts`. `beforeEach` points `paths` at a temp folder and sets `hooks.run` and `hooks.commit` to functions that throw unless a test replaces them, so no test can start a real process. Cover:
   - **Arguments:** defaults; every flag; `=` form; bare `--`; unknown flag exits 2; `--help` exits 0.
   - **Plan:** all phases; `--from Overlays` gives Overlays through Patterns; `--phase Overlays` gives exactly one; an unknown `--from` / `--phase` exits 1 listing the names; an unknown platform exits 1; `swiftui` with `which` returning null exits 1.
   - **Dry run:**
     - Output names every phase, `--pattern SettingsPage` for Patterns, the resume line, and the `claude` argv under `--auto-fold`.
     - `--gates` adds `--with keyboard --with axe` and the Playwright install, but for `--platform swiftui` alone it adds no install; `--force` adds `--force`.
     - `hooks.run`, `hooks.commit` and `which('claude')` are never called, and the temp `logs` folder doesn't exist afterwards.
   - **Real loop with fakes:**
     - Default pause: themes, parse, generate for Primitives, commit `regen: phase Primitives (web,lit,rn) exit 0`, digest, exit 3, with a log that has the resume line and no `== done ==`.
     - A parse failure exits 1 before any generate.
     - A generate exit of 1 still commits `… exit 1` and continues.
     - `--no-pause` runs every phase and the final steps, and the log ends with `== done ==`.
     - The log file name gains `-web` for `--platform web`.
   - **Auto-fold with fakes:** `claude` receives the text of `prompts/fold-gaps.md` on stdin and `FOLD_ALLOWED_TOOLS`; a parse failure afterwards exits 4 and removes the lock; a lock held past 1800 s of fake sleep skips the fold with `regen.ps1`'s log message.
   - **Parity (reads `regen.ps1` as text):** every parameter in its `param(` block maps to a `regen.ts` flag (`From→--from` … `FoldModel→--fold-model`), and its auto-fold `--allowedTools` string equals `FOLD_ALLOWED_TOOLS`.
   - **package.json:** `generate` runs `tools/parse.ts` before `tools/generate.ts`, and `regen` names `tools/regen.ts`.

Gate — every command must behave as stated:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/regen.ts --dry-run
    node --import tsx tools/regen.ts --dry-run --from Overlays --platform web --gates --auto-fold --model opus
    node --import tsx tools/regen.ts --dry-run --phase Nope
    pnpm generate --check
    git status --short -- packages generated/fold.lock
    node -e "const f=require('fs');const t=Date.now()-15*60e3;const bad=['logs/regen-web.log','generated/fold.lock'].filter(p=>f.existsSync(p)&&f.statSync(p).mtimeMs>t);console.log(bad.length?'created: '+bad:'no regen log or fold lock created');process.exit(bad.length?1:0)"

- The first seven commands exit 0, except `--phase Nope`, which exits 1 and lists the eleven phase names.
- The first dry run lists all eleven phases.
- The second lists Overlays through Patterns and shows `--with keyboard --with axe`, the Playwright install, the `claude` fold argv and `DS_MODEL=opus`.
- `pnpm generate --check` prints `tools/parse.ts`'s output and then `N stale of M targets`. Exit 1 there is expected while targets are stale. Exit 2 means argument forwarding broke: stop and fix `package.json`.
- The final `git status` shows no change under `packages/` compared with the start of the job, and no regen log or fold lock was created.

In your summary, paste the first dry run's output.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/fold-gaps.md`, `generated/` (except what `pnpm check` regenerates), component docs, `schema/`, `jobs/`, `mcp.ps1`, `run-jobs.ps1`, `tools/generate.ts` or `tools/gap_digest.ts`. Leave `regen.ps1` and `generate.ps1` alone except for the lines named above. This job adds a second front end for the same pipeline; it doesn't change what a regeneration does.
