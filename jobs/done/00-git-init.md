This repo has no version control and two agents write to it (this queue and a cloud session that delivers files by overwriting them). A `behavior` parser in tools/parse.py was already lost that way. Put the repo under git so nothing is lost again:

1. `git init` if there is no .git. Make sure .gitignore covers node_modules, .pytest_cache, __pycache__, logs/, _xfer/, _to_delete/, "Claude outputs/", packages/*/dist, site/dist, site/.astro, playwright-report, test-results. Keep generated/ tracked (prompts, gaps and the lock are project state).
2. `git add -A` and commit as "Baseline: docs, schema, tools, generated packages (2026-09-10)".
3. Add a `commit.ps1` at the repo root that runs `git add -A; git commit -m "<message from -m, default 'wip <timestamp>'>"` and prints the short log, so every batch and job can snapshot with one line. Call it at the end of run-jobs.ps1 (after each job) and tier2.ps1 (after each batch), with messages "job: <name>" and "batch: <name>".
Do not modify anything under packages/*/src or generated/. Print `git log --oneline` at the end.
