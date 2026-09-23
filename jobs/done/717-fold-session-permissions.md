Let fold sessions run the repo's own scripts, per logs/backlog-triage.md, section D runner-up 9 (T31, T32).

Eight fold passes, one per regeneration phase, recorded verbatim that they could not run `node logs/*.mjs` (approval required in both Bash and PowerShell), nor `pnpm parse`, the contrast check, `pnpm commit`, `awk`, a piped `ls`, or a `grep` with alternation — and each recomputed gap-file staleness by hand from `ls --time-style` against `folded.json`. The Controls-phase fold was left uncommitted and unvalidated because it could not run `node` at all. This is a permissions gap, not a code gap.

1. **Find how fold sessions are launched.** Read prompts/fold-gaps.md, tools/regen.ts and regen.ps1 / generate.ps1 for the `claude` invocation (flags such as `--allowedTools`, `--permission-mode`, `--settings`).
2. **Allowlist.** Add a project settings file (`.claude/settings.json`, committed) whose `permissions.allow` covers exactly what folds need: `Bash(node --import tsx tools/*)`, `Bash(node logs/*.mjs)`, `Bash(pnpm parse)`, `Bash(pnpm check)`, `Bash(pnpm commit*)`, `Bash(pnpm test:tools*)`, `Bash(grep:*)`, `Bash(ls:*)`, `Bash(awk:*)`, and their PowerShell equivalents if the runner uses PowerShell. No network, no `rm`, no `git push`. If the fold invocation passes its own `--allowedTools`, extend that list instead and say which you did.
3. **Staleness script.** Replace the hand recomputation with `logs/gap-staleness.mjs` → move it to `tools/gap_staleness.ts` (tools/ is committed, logs/ is not) that prints stale gap files against `generated/gaps/folded.json`, and have prompts/fold-gaps.md tell the fold session to run it.
4. **Prove it.** Run one fold session in dry-run mode (or the smallest real phase) and show in the summary that it ran `node --import tsx tools/gap_staleness.ts` and `pnpm parse` without an approval prompt.

Gate — all must pass:

    pnpm typecheck:tools
    pnpm test:tools
    node --import tsx tools/gap_staleness.ts

The allow list in the summary, verbatim, with one line per entry saying which fold step needs it.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any component doc. Nothing in the allow list may write outside the repo or reach the network.
