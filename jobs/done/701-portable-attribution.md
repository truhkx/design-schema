**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Stop the commit helper from stamping the owner's Claude attribution on everyone's commits. Trailer lines come from an optional setting that defaults to none, and the owner's current behavior is one `git config` away.

`commit.ps1` builds its message as `$msg = "$m`n`nCo-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`nClaude-Session: https://claude.ai/code/session_…"`, with the owner's session URL hardcoded. `regen.ps1`'s `Snapshot` function calls `commit.ps1` after every phase and again at "regen: complete". Step 5 of `prompts/fold-gaps.md` tells the auto-fold model to commit with `powershell -ExecutionPolicy Bypass -File .\commit.ps1 -m "fold: <components>"`. So an adopter who runs regen puts the owner's session link on their own commits. The helper is also PowerShell-only, and job 702's cross-platform `tools/regen.ts` needs to commit per phase too. The header comment in `commit.ps1` says "the job queue uses -Paths". That's stale: `run-jobs.ps1` never calls `commit.ps1`. Its loop only pipes each prompt to `claude -p` and moves the file to `jobs/done` or `jobs/failed`. **So this edit can't break the queue that is running this job.**

This job runs headless under `run-jobs.ps1` with only Read, Write, Edit, MultiEdit, Glob, Grep, `Bash(pnpm *)`, `Bash(node *)`, `Bash(git status*)` and `Bash(git diff*)`. You can't run PowerShell, so check the new `commit.ps1` by reading it and through the text test below. **Never run `tools/commit.ts` with `-m`, `pnpm commit`, or anything that reaches the commit path.** It would `git add -A` and commit the whole working tree, and the tool allowlist can't stop a git process started from inside Node. Only `--help` and argument-error calls are safe, because `main` must finish parsing arguments before any git call.

1. **Record the current values.** Read `commit.ps1` and copy its two trailer lines exactly. They go only into your final summary, as the two commands that restore the owner's behavior:
   `git config --local --add ds.commitTrailer "<first line>"` and `git config --local --add ds.commitTrailer "<second line>"`.
   The job log lives in `logs/`, which is gitignored. Don't write the session URL into any tracked file, and don't run `git config` yourself.
2. **`tools/commit.ts`** (annotations only, `REPO_ROOT` from `tools/lib/root.ts`, the same `invokedDirectly` guard as the other tools). One implementation of what `commit.ps1` does:
   - **Usage:** `node --import tsx tools/commit.ts -m <message> [--paths a,b] [--paths c]`. `-m` / `--message` is required. `--paths` may repeat and splits on commas, dropping empty entries. `--flag=value` works. A bare `--` is ignored, so `pnpm commit -- -m x` and `pnpm commit -m x` both work. `-h` / `--help` prints usage and exits 0. An unknown flag or a missing `-m` exits 2 with a message.
   - **Behavior, matching `commit.ps1`, all with cwd `REPO_ROOT`:**
     - Stage with `git add -- <paths>`, or `git add -A` when no paths are given.
     - If `git diff --cached --name-only` is empty, print `nothing to commit` and exit 0 without committing.
     - Otherwise run `git -c core.safecrlf=false commit -q -F -` with the message on stdin (stdin avoids argument quoting on Windows). A non-zero exit returns git's code. On success, print `git log --oneline -1`.
     - Spawn `git` with `spawnSync` and an argv array, no shell (git is a real executable on every OS).
   - **Trailers,** exported as pure functions:
     - `trailerLines(text: string): string[]` splits on real newlines and on the literal two characters `\n` (so a one-line environment variable can hold two trailers), trims each line and drops blanks.
     - `resolveTrailers(env, readConfig): string[]`. If `DS_COMMIT_TRAILERS` is defined in `env`, it wins, even when empty (empty means none, which switches off a git-config setting for one run). Otherwise use `git config --get-all ds.commitTrailer` in order; exit 1 from git means unset, so none.
     - Each line must match `/^[A-Za-z0-9-]+: \S/`. Otherwise exit 2, naming the bad line and where it came from.
     - `commitMessage(m: string, trailers: string[]): string` returns `m` alone when there are no trailers, else `m + "\n\n" + trailers.join("\n")`. With the owner's two lines configured, that is the exact message `commit.ps1` builds today.
   - **Tests:** put every git call behind an exported `hooks = { git }`, as `tools/generate.ts` does with `hooks`, so tests never start git.
   - **Header comment:** document the variable, the git config key, the default (no trailers), and that the owner restores the old behavior with `git config --local --add ds.commitTrailer …`. Use placeholder values such as `Co-Authored-By: Name <email>`, not the owner's.
3. **`package.json`:** add `"commit": "node --import tsx tools/commit.ts"`.
4. **`commit.ps1` becomes a thin wrapper.** Keep `param([Parameter(Mandatory = $true)][string]$m, [string[]]$Paths = @())` and `Set-Location $PSScriptRoot`. Keep the `$Paths` comma-splitting line, build `$argv = @('--import', 'tsx', 'tools/commit.ts', '-m', $m)`, append `'--paths', ($Paths -join ',')` when there are paths, run `node @argv`, then `exit $LASTEXITCODE`. Rewrite the header: ASCII only, both usage lines kept, trailers explained, and the stale "the job queue uses -Paths" claim removed. Say instead that `regen.ps1` calls the first form. `regen.ps1` itself doesn't change: its `Snapshot` still calls `commit.ps1 -m $message`.
5. **`prompts/fold-gaps.md` step 5** becomes: commit with `pnpm commit -m "fold: <components>"`. `regen.ps1`'s auto-fold `--allowedTools` already includes `Bash(pnpm *)`. Don't write `pnpm commit -- -m`: pnpm 10 forwards a literal `--` to the script (`pnpm nav:check -- --bogus` fails with `unrecognized arguments: --`). The tool ignores it, but the doc shouldn't teach it. Change nothing else in the prompt.
6. **Sweep for other hardcoded attribution.** Grep the repo for `claude\.ai/code/session_`, `Claude-Session`, `Co-Authored-By` and `noreply@anthropic\.com`, case-insensitive. Exclude `node_modules`, `logs`, `generated`, `dist`, `storybook-static`, `test-results`, `jobs/` (queued prompts, `jobs/done` and `jobs/failed`) and `.git`. Grep also skips hidden folders by default, so run separate Greps with the path set to `.github` and to `.claude`.
   - A hit in a script, prompt, tool or skill that would put attribution on someone else's work: route it through `tools/commit.ts` or delete it.
   - A hit in a historical record (a process doc describing a past run): leave it and list it in your summary.
   - When this job was written, `commit.ps1` was the only hit.
7. **Tests: `tools/__tests__/commit.test.ts`.** Every case runs with `hooks.git` replaced by a recorder, and `beforeEach` installs a default that throws, so a missed fake fails loudly instead of starting git.
   - `trailerLines`: real newlines, literal `\n`, trimming, blank lines dropped.
   - `resolveTrailers`: neither set gives `[]`; the environment variable beats git config; an empty variable gives `[]` even with config set; several config values stay in order; a malformed line exits 2.
   - `commitMessage`: no trailers gives exactly `m`; two trailers give exactly `m\n\nA: x\nB: y`.
   - `main`, staging: no paths runs `add -A`; `--paths a,b --paths c` runs `add -- a b c`.
   - `main`, empty stage: prints `nothing to commit`, exits 0, never calls commit.
   - `main`, commit: argv is `-c core.safecrlf=false commit -q -F -`, and stdin is the message with trailers; a git failure exit code is passed through.
   - `main`, arguments: `--help` exits 0 and a missing `-m` exits 2, both with no git call; a bare `--` is ignored.
   - A text test: `commit.ps1` contains `tools/commit.ts` and contains neither `claude.ai/code/session_` nor `Co-Authored-By`; `prompts/fold-gaps.md` no longer mentions `commit.ps1`.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/commit.ts --help
    node --import tsx tools/commit.ts --bogus

`--help` exits 0 and `--bogus` exits 2; neither touches git (`git status` before and after is the same). Re-running the step 6 Greps finds no `claude.ai/code/session_` and no `Co-Authored-By` outside the excluded folders and the historical records you listed. Your summary ends with the two `git config --local --add ds.commitTrailer …` restore commands from step 1.

Do not modify `packages/*/src`, `prompts/templates/`, `generated/` (except what `pnpm check` regenerates), component docs, `schema/`, `jobs/`, `run-jobs.ps1` or `regen.ps1`. This job changes where attribution comes from. It doesn't change what gets staged or committed.
