# Job queue

Each `NN-name.md` file is a standalone Claude Code prompt. `run-jobs.ps1` runs them in order with
`claude -p` (headless, edits auto-accepted, repo cwd), logs each to `logs\jobs\NN-name.log`, moves the
prompt to `jobs/done/` on success or `jobs/failed/` on failure, and stops on the first failure so a
broken repo state does not compound. Jobs must not write under `packages/*/src` or `generated/` while
`tier2.ps1` may be running — those belong to the generator.

    powershell -ExecutionPolicy Bypass -File .\run-jobs.ps1              # run the queue
    powershell -ExecutionPolicy Bypass -File .\run-jobs.ps1 -After tier2  # wait for tier2.ps1 to finish first (polls logs\tier2.log for "== done ==")
    powershell -ExecutionPolicy Bypass -File .\run-jobs.ps1 -Model opus   # a heavier model for the queue (default sonnet)
