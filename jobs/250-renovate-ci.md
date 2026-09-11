Keep dependencies current automatically (Workstream C).

1. `renovate.json`: extends `config:best-practices`; `automerge: true` for minor/patch with `automergeType: "pr"` after CI; majors grouped weekly into one PR per ecosystem (react, storybook, vite+vitest+playwright, typescript+tsdown, react-native+expo+svg, lit); `rangeStrategy: "bump"`; lockFileMaintenance enabled.
2. CI job `currency`: `pnpm outdated --recursive --format json` parsed by `tools/currency.ts` (node type-stripping); fail when any dependency is more than one minor behind its `latest` tag; exceptions in `.currency-allow.json` as `{ "name": "…", "until": "YYYY-MM-DD", "reason": "…" }` and expired entries fail the job.
3. CI job `next` (continue-on-error: true): install `react@canary`, `typescript@next`, `storybook@next` in a temp workspace copy and run typecheck + tests; report the result as a job summary.
4. Document both jobs in process/typescript-and-currency.md under Workstream C (a sentence each).
Gate: workflow validates (`actionlint` if available), `node tools/currency.ts` runs locally. Do not modify packages/*/src or generated/.
