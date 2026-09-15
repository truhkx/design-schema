# Job queue

Each `NN-name.md` file is a standalone Claude Code prompt. `run-jobs.ps1` runs them in order with
`claude -p` (headless, edits auto-accepted, repo cwd), logs each to `logs\jobs\NN-name.log`, moves the
prompt to `jobs/done/` on success or `jobs/failed/` on failure, and stops on the first failure so a
broken repo state does not compound. Jobs must not write under `packages/*/src` or `generated/` while
`regen.ps1` is running — those belong to the generator.

    powershell -ExecutionPolicy Bypass -File .\run-jobs.ps1              # run the queue
    powershell -ExecutionPolicy Bypass -File .\run-jobs.ps1 -Model opus   # a heavier model for the queue (default sonnet)

The 600 series is the schema-hardening plan (`site/src/content/docs/process/schema-hardening.md`). Its jobs
end with `node logs/600-baseline.mjs --out <job>` and compare against `logs/600-baseline.json`, both local to
the machine that captured the baseline. Queue one phase at a time: 600–607 and 609–628 with `-Model opus`,
630–644 on the default model.

Phase 2 opens with 609, the parser warning channel every later job reports through, runs 610–625 as the
plan's table lists them, then 626–628: naming `values`, `aliases` and `tokens`,
the backwards-compatibility fields an adopter with an existing design system needs, which the plan's
reviews did not cover. They sort after 625 because the naming codemod applies them after generation, so
no template reads them. 629 is the MCP component graph and support matrix, split out of 624 so a large job
cannot stop the queue; nothing in 625 needs it.

The 690 series adds Claude Code skills for the adoption paths under `.claude/skills/` (create-theme was
written by hand): 690 align-existing-api, 691 add-component, 692 update-fork. They read the schema as phase
2 left it, so they run after it.

The 700 series prepares the repository for public release with changes that need no owner decision: the
regen phase list out of `regen.ps1` (700), no hardcoded session attribution in `commit.ps1` (701), a
cross-platform `regen` in Node with a dry run (702), and pnpm-first, cross-platform docs (703). Runs on
any model; it shares the overnight queue with phase 2 only because `run-jobs.ps1` takes one model per run.

`run-jobs.ps1` runs jobs in file-name order, compared as text rather than numbers: keep every queued job's
number three digits wide so the text order is the numeric order.
