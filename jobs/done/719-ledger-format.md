Make the gap ledgers self-correcting, per logs/backlog-triage.md, section E and section D's framing. Jobs 710 to 718 have landed.

The triage found 301 raw entries in generated/gaps/TOOLING.md and CODE.md compress to 93 issues, 29 already fixed (≈43% of raw entries), one item filed four times on four dates, and the single most expensive item (the rn aria-* mirror, one wasted opus round on 15 of ~25 rn targets) filed as two unconnected low-key entries. The ledgers carry no status, no cost, and no link to the target that hit them; `tools/gap_digest.ts` also maps every gap file to `components/<name>.md`, which is wrong for `Pattern.SettingsPage` and for `TEST-FAILURES.md` (T30).

1. **Entry shape.** Define it in prompts/fold-gaps.md: each new ledger entry is one line with `id` (stable, e.g. `T23`), `status` (open / fixed <commit> / obsolete), `hit-by` (target and round, e.g. `Switch.rn r1`), and `cost` (rounds or dollars from logs/regen.log when known). A fold that sees an existing issue appends to its `hit-by` instead of filing a duplicate.
2. **Seed.** Rewrite TOOLING.md and CODE.md from logs/backlog-triage.md's tables (copy it into site/src/content/docs/process/backlog-triage.md first so the source is committed; logs/ is gitignored), one line per distinct issue, statuses as of the jobs in this series. Keep the old files as `*.2026-09-23.md` for history.
3. **Digest.** tools/gap_digest.ts reads the new shape, prints open items sorted by summed cost then hit count, and maps pattern and non-component files correctly (T30).
4. **Tests** for the digest on a fixture ledger with a duplicate, a fixed item and a pattern file.

Gate — all must pass:

    pnpm typecheck:tools
    pnpm test:tools
    node --import tsx tools/gap_digest.ts

The digest's top five open items in the summary.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, or any component doc.
