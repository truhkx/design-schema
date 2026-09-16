**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Make the README and the adopter-facing docs cross-platform and correct. pnpm commands come first everywhere an outsider reads, the `.ps1` scripts are described as Windows conveniences, wrong facts are fixed, and tracked files stop pointing at scripts that exist only in the owner's gitignored `logs/`.

Evidence, confirmed against the tree when this job was written. Re-read each file before editing; jobs 700–702 ran just before this one.

- **README.md**
  - The intro says the owner "regenerates with `generate.ps1`, the only step that calls a model".
  - The file-tree block says `tools/generate.ts + generate.ps1`.
  - "Adding a component" step 4 is `generate.ps1 -Component <Name>`.
  - The Roadmap tells readers to run `generate.ps1 -Stale -Extra "--tests-only"`, but `parseArgs` in `tools/generate.ts` has no `--tests-only` and would exit 2 with `unrecognized arguments`.
  - "Setup": Windows gets a one-shot `setup.ps1` (pnpm, `pnpm install`, `pnpm rebuild`, `pnpm typecheck`); "Anywhere else" gets only `npm install -g pnpm@10 && pnpm install`.
  - It says "Node 22+ (`.nvmrc`)", but `.nvmrc` holds `24` and `package.json` `engines` says `>=22`.
  - "Verified 2026-09-09 on Windows" is the only verification statement, yet `.github/workflows/ci.yml` runs `pnpm check`, `typecheck:tools`, `test:tools`, `typecheck`, `generate:check` and `gates:browser` on `ubuntu-latest`.
  - "Everyday commands" documents `pnpm test:packages`, which isn't a script in `package.json`, and says "Lit needs `npx playwright install chromium`".
  - It describes `pnpm build` as "tokens + parse + static site build". The script is `pnpm check && pnpm tokens && pnpm lint:literals && pnpm generate:check && pnpm --filter site build`.
  - The tree lists `tools/publish_schema.ts` ("`pnpm schema:publish` copies schema/ into ../design-schema-public") as if it were part of the pipeline. It's the owner's sync to a sibling checkout (`DEFAULT_DEST` in that file).
  - The Claude Code skills that ship in `.claude/skills/` (the `.gitignore` keeps them with `!.claude/skills/`) aren't mentioned.
- **`site/src/content/docs/process/generation-pipeline.md`**
  - "Running it" lists only `generate.ps1 -Component/-Platform/-Stale/-Check`.
  - "The gates" says to run the browser gates during generation with `generate.ps1 -Component Dialog -Extra "--with keyboard --with axe"`.
  - "Full regeneration" describes only `regen.ps1`, with `-From`, `-NoPause` and `-Platform`.
- **`site/src/content/docs/guides/authoring-a-component.md`**, "What the build checks": puts `generate.ps1 -Component <Name>` first, and `pnpm generate -- --component <Name>` second. That second form fails: pnpm 10 forwards a literal `--`, so `pnpm nav:check -- --bogus` fails with `site_nav.ts: error: unrecognized arguments: --`, and `generate.ts` rejects `--` the same way. The same paragraph offers `-Extra "--tests-only"`, which doesn't exist.
- **`site/src/content/docs/guides/two-ways-in.md`**
  - The adopter path says to write `themes/<your-id>.md`, but `tools/theme.ts` reads `paths.DOCS` = `site/src/content/docs/themes/`. The top-level `themes/<brand>/` folder holds only `naming.md`.
  - The owner path says `generate.ps1 -Stale` (or `pnpm generate -- --stale`).
- **`site/src/content/docs/process/from-vision-to-system.md`**: the stage table's "1. Theme" row has the same wrong `themes/<id>.md`.
- **`site/src/content/docs/guides/updating-your-fork.md`**: "The pull" uses `pnpm generate -- --stale`, and the closing note cites `logs/523-demo-pull.mjs`, a machine-local, gitignored script.
- **`site/src/content/docs/process/schema-hardening.md`**: `generate.ps1 -Stale` appears in the phase table ("4. Regenerate") and in the phase 4 paragraph. This is an owner-process page: leave its `run-jobs.ps1` and `logs/600-baseline.mjs` references exactly as they are.
- **Pages that name `regen.ps1` as the owner of the phase order:** the "Content pipeline" paragraph of `site/src/content/docs/process/website-plan.md` ("the same order `regen.ps1` composes in") and `site/src/content/docs/process/ios-platform.md` ("The same composition order as `regen.ps1`"). After job 700, the order lives in `tools/regen-phases.json`.
- **`mcp/chroma-schema.sql`** line 3 says `-- Regenerate with: node logs/dump-chroma-schema.mjs`. `mcp/lib/store.ts` replays the file with `db.exec(readFileSync(SCHEMA_SQL, 'utf8'))`, so `--` comment lines can change freely. No SQL statement may change.

This job runs headless under `run-jobs.ps1` with only Read, Write, Edit, MultiEdit, Glob, Grep, `Bash(pnpm *)`, `Bash(node *)`, `Bash(git status*)` and `Bash(git diff*)`. There's no PowerShell and no npx. It's a docs job. **Don't run `pnpm regen`, `pnpm generate`, `pnpm commit`, `tools/regen.ts` or `tools/commit.ts` at all.** Check their flags by reading `parseArgs` and the header comments in `tools/regen.ts`, `tools/commit.ts` and `tools/generate.ts`. The one command you may run to see flags is `node --import tsx tools/generate.ts --help`: its `parseArgs` exits on `--help` before doing any work.

1. **Inventory before writing.**
   - Read `package.json` `scripts` and Glob `tools/*.ts`.
   - Confirm what jobs 700–702 left: `tools/regen-phases.json`; `tools/regen.ts` with a `regen` script and its flags; `tools/commit.ts` with a `commit` script and `DS_COMMIT_TRAILERS` / `ds.commitTrailer`; `pnpm generate` now running `tools/parse.ts` first.
   - Document only what exists. If something is missing, write around it and say so in your summary.
   - Glob `.claude/skills/*/SKILL.md` and read each file's frontmatter `name` and `description`. `create-theme` exists; `align-existing-api`, `add-component` and `update-fork` may have been added by jobs 690–692. Describe only skills whose `SKILL.md` exists.
2. **README.md.**
   - **Intro:** the owner regenerates with `pnpm generate` (one component or `--stale`) or `pnpm regen` (the whole suite in composition order), the only steps that call a model. Keep the cost sentence.
   - **Tree:**
     - `tools/generate.ts` becomes `pnpm generate`, parse first; `generate.ps1` on Windows.
     - Add `tools/regen.ts` + `tools/regen-phases.json` (`pnpm regen`; `regen.ps1` on Windows) and `tools/commit.ts` (`pnpm commit`, trailers from `DS_COMMIT_TRAILERS` or `git config ds.commitTrailer`, none by default).
     - Take `tools/publish_schema.ts` out of the pipeline tree. Mention it once, in a short "Maintainers" note after the tree, as the owner's sync of `schema/` to a sibling checkout that adopters don't need. Don't change any GitHub URL; the final URL is the owner's decision.
   - **Setup,** one sequence for every OS first:
     - Node 24 (`.nvmrc`; `engines` allows 22+);
     - `npm install -g pnpm@10` (or `corepack enable`; `packageManager` pins the version);
     - `pnpm install`, `pnpm rebuild`, `pnpm typecheck`;
     - then `pnpm storybook`.

     Then: "On Windows, `setup.ps1` and `storybook.ps1` run the same steps and write logs to `logs\`."
   - **Verified line:** replace it with facts. CI runs the check, the tools suite, the typecheck, `generate:check` and the browser gates on Ubuntu (`.github/workflows/ci.yml`), and the composed Storybook render was verified on Windows on 2026-09-09. Claim no macOS run.
   - **Everyday commands:**
     - Remove `pnpm test:packages`. Add `pnpm gates:behavior`: it derives the behavior tests and runs them in all three packages. Read the script to describe it exactly. It needs `pnpm exec playwright install chromium` once for Lit.
     - Fix the `pnpm build` description to match the script.
     - Add `pnpm generate --component <Name>`, `pnpm generate --stale`, `pnpm regen --dry-run`, and `pnpm mcp:index && pnpm mcp:smoke` (what `mcp.ps1` runs).
     - Add one line: pnpm forwards arguments as they are, so write `pnpm generate --stale`, not `pnpm generate -- --stale`.
   - **Adding a component, step 4:** `pnpm generate --component <Name>` (Windows: `generate.ps1 -Component <Name>`).
   - **Roadmap:** delete the `-Extra "--tests-only"` instruction. Don't replace it with a flag that doesn't exist. Leave the checkbox states alone; those are the owner's call.
   - **New "Claude Code skills" section:** `.claude/skills/` ships skills that Claude Code picks up in this repo, with one line per existing skill taken from its `description`.
3. **`generation-pipeline.md`.**
   - **"Running it":**
     - The block lists `pnpm generate --component Icon`, `--component Icon --platform web`, `--component Button,Icon --platform swiftui` (needs `gh`), `--stale`, `pnpm generate:check` and `pnpm gates`, and says `pnpm generate` parses first.
     - After the block, one sentence: on Windows, `generate.ps1 -Component/-Platform/-Stale/-Check` wraps the same commands and logs to `logs\generate.log`.
   - **"The gates":** the during-generation example becomes `pnpm generate --component Dialog --with keyboard --with axe`.
   - **"Full regeneration":**
     - Lead with `pnpm regen`: `--from <phase>`, `--phase`, `--no-pause`, `--platform`, `--auto-fold`, `--dry-run` to print the plan without calling anything, exit 3 at a pause, exit 4 when an auto-fold leaves the docs unparseable.
     - The phase order is in `tools/regen-phases.json`.
     - `regen.ps1` is the Windows equivalent, with the same flags in PowerShell form.
     - Per-phase commits carry no attribution unless `DS_COMMIT_TRAILERS` or `ds.commitTrailer` is set.
     - Keep every cost and timing figure as it is.
4. **`authoring-a-component.md`,** "What the build checks": `pnpm generate --component <Name>` (Windows: `generate.ps1 -Component <Name>`). Delete the `--tests-only` sentence, unless reading `tools/generate.ts` and `tools/behavior_tests.ts` shows a real command that does exactly that. If it does, name that command and its effect precisely.
5. **`two-ways-in.md`:** the adopter writes `site/src/content/docs/themes/<your-id>.md`; if `.claude/skills/create-theme/SKILL.md` exists, add "or ask Claude Code to use the `create-theme` skill". The owner path becomes `pnpm generate --stale` (Windows: `generate.ps1 -Stale`). In `from-vision-to-system.md`'s stage table, fix the same path in the "1. Theme" row.
6. **`updating-your-fork.md`.**
   - In "The pull", change `pnpm generate -- --stale` to `pnpm generate --stale`.
   - In the closing italic note, replace the `(logs/523-demo-pull.mjs)` pointer with the steps themselves, short enough that a reader can repeat them in their own fork:
     1. Before the pull, `pnpm parse` and `pnpm demo:naming:check` pass.
     2. Upstream adds a prop to `Button`, and `git merge upstream/main` merges with no conflicted paths.
     3. `git diff <commit before the merge> HEAD -- themes/demo-brand/naming.md` is empty.
     4. `pnpm demo:naming:check` now fails and names `src/CtaButton.tsx` as different.
     5. `pnpm demo:naming` regenerates the renamed tree. The new prop arrives as `CtaButton`'s `elevated` and `.demo-cta-button--elevated`, and `data-ds="Button"` stays canonical.
     6. `pnpm demo:naming:check` passes again, reporting every difference as an identifier.
     7. `git status` shows changes only under `generated/` and `packages/react/demo-brand/`.

     Keep the note's existing claims and links.
7. **`schema-hardening.md`:** change only the two `generate.ps1 -Stale` mentions to `pnpm generate --stale` (Windows: `generate.ps1 -Stale`). Nothing else on the page.
8. **`website-plan.md` and `ios-platform.md`:** change only the phrase that names `regen.ps1` as the owner of the order, making it `tools/regen-phases.json` (the order `pnpm regen` and `regen.ps1` run). Leave `website-plan.md`'s job table rows as they are; they're a record.
9. **`mcp/chroma-schema.sql`:** replace comment line 3 with an inline description of how the file was made: the DDL from `sqlite_master` (skipping the fts5 `embedding_fulltext_search_*` shadow tables) and the `migrations` rows, read with `node:sqlite` from an `mcp/.chroma/chroma.sqlite3` that ChromaDB 1.5.9 built. Use `--` comment lines only. `git diff -- mcp/chroma-schema.sql` must show changes only on comment lines.
10. **Sweep, with Grep**, over `README.md`, `site/src/content/docs/guides/`, `site/src/content/docs/process/` and `mcp/chroma-schema.sql`:
    - `pnpm [a-z:-]+ -- ` has no hits.
    - `test:packages|tests-only|npx ` has no hits in the files you edited.
    - `themes/<` appears only as `site/src/content/docs/themes/<…>.md` or `themes/<brand>/naming.md`.
    - `logs/[^ )]*\.mjs` appears only in `schema-hardening.md` (owner process, left alone).
    - Every remaining `\.ps1` hit in the files you edited sits next to its pnpm equivalent and is labeled as the Windows form, or is a `run-jobs.ps1` reference in `schema-hardening.md`. `process/typescript-and-currency.md` and `process/generation-log.md` are historical records: don't edit them.
11. **Verify every command you wrote.** Every `pnpm <name>` in the edited files is a `package.json` script or a pnpm built-in (`install`, `rebuild`, `exec`, `--filter`, `-r`). Every `tools/<file>.ts` exists. Every flag appears in that tool's `parseArgs`. Put the table of command → where it's defined in your summary.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/generate.ts --help
    git diff --stat

- `generate --help` lists every `generate.ts` flag the docs now use.
- `git diff --stat` shows changes only in `README.md`, the eight pages named above under `site/src/content/docs/` and `mcp/chroma-schema.sql`, plus whatever `pnpm check` regenerates under `generated/`.
- Every step 10 Grep holds.
- Don't run `pnpm --filter site build` or `pnpm --filter website build`: their outputs are committed, and whether they stay committed is the owner's open decision.

Do not modify `packages/*/src`, `prompts/`, `generated/` (except what `pnpm check` regenerates), component docs under `site/src/content/docs/components/`, `schema/`, `jobs/` (including `jobs/README.md`, which also cites `logs/600-baseline.mjs`), any `tools/` or `mcp/` source other than `mcp/chroma-schema.sql`'s comment, any `.ps1` script, `.github/`, or built output (`site/dist`, `apps/website/dist`, `storybook-static`). This job corrects what the docs say. If a doc is wrong because a tool is wrong, report it; don't change the tool.
