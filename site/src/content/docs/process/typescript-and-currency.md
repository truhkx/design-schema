---
title: TypeScript everywhere, latest everything
description: The plan for making TypeScript the only language in the repository — generator, gates, MCP server and packages — and for keeping every dependency on its latest stable release with CI as the proof.
sidebar:
  order: 7
---

Two decisions, taken 2026-09-10, that change how the repository is built rather than what it builds.

The first is that TypeScript is the repository's language. The three packages already are TypeScript — every file in `packages/react/src`, `packages/lit/src` and `packages/rn/src` is `.ts`/`.tsx` under `strict: true` — but the pipeline that produces them is Python (`tools/*.py`, `mcp/*.py`) launched through a `tools/py.mjs` shim, and the token build has a Python fallback beside the Style Dictionary one. A contributor needs two toolchains to run `pnpm check`. After this plan they need one.

The second is currency. The packages are pinned to majors that are one to three behind: React 18 (19.3 is current), TypeScript 5.6 (7.0), Storybook 8 (10.6), Vite 5 (8.3), Vitest 3 (5.0), React Native 0.74 (0.87), Jest 29. A design system that advertises "generated for your stack" cannot ship types for a React the consumer no longer uses. The policy is: every dependency tracks its latest stable release, the upgrade is automated, and a CI job fails when anything falls more than one minor behind.

## Where the ecosystem is (2026-09-10)

| Package | Pinned | Current stable | What changes |
| --- | --- | --- | --- |
| react / react-dom | ^18.3.1 | 19.3.0 (Sep 9 2026) | `ref` is a prop (no `forwardRef`), `useId` prefix option, Actions/`use()`; `@types/react` 19 removes implicit `children`. |
| typescript | ^5.6 | 7.0 (Jul 8 2026; Go compiler) | ~10× faster; removes `baseUrl`, `moduleResolution: node10`, `target: es5`; `strict`/`module: esnext` default; **no programmatic API until 7.1**, so tools that embed the compiler (tsup's dts, storybook docgen, typescript-eslint) run `@typescript/typescript6` in their own tree. |
| storybook | ^8.3 | 10.6 | Single `storybook` package with framework subpaths; `@storybook/addon-essentials` is gone (core); CSF factories; Vitest addon for browser tests. |
| vite | ^5.4 | 8.3 | Rolldown + Oxc; `esbuild` options become `oxc`. |
| vitest | ^3.2 | 5.0 (Sep 3 2026) | Node 22+, Vite ≥ 6.4; browser mode is the Lit/keyboard runner. |
| lit | ^3.2 | 3.3.3 | Standard decorators (`accessor`) — drop `experimentalDecorators` / `useDefineForClassFields: false`. Oxc (Vite 8, rolldown) parses but does not lower them, so `packages/lit/decorators.plugin.mjs` runs Babel's decorators plugin in the build, the browser tests and Storybook. |
| react-native | ^0.74 | 0.87 (Aug 11 2026) | Bundles React 19.2; strict TypeScript API default; Node 22; SwiftPM (experimental). |
| tsup | 8.5 | — | Superseded by **tsdown** (Rolldown); `isolatedDeclarations` emits `.d.ts` without the TS API, which is what TS 7 needs. |

Node 22 LTS is the floor (Vitest 5 and RN 0.87 both require it); Node 24 runs the tools with native type stripping so `.ts` tools need no build step.

## Workstream A — port the pipeline to TypeScript

One tool per job, in dependency order, each job replacing a Python file with a `.ts` file that produces byte-identical output on the current docs before the Python file is deleted. The Zod schema in `schema/component.ts` becomes the single source of truth: `parse.ts` validates with it, and `schema/component.schema.json` is regenerated from it (`z.toJSONSchema`) so the two can never drift.

1. `tools/parse.ts` — YAML frontmatter → `generated/components.json`, prompts, the same `DocError` messages. Runs with `node tools/parse.ts` (Node 24 type stripping; `tsx` fallback for Node 22). **Done 2026-09-11**: byte-identical `generated/` on the current docs (593 files, stdout, exit code), then `tools/parse.py` deleted. The YAML the prompts embed is written by `tools/lib/pyyaml.ts`, a port of PyYAML's dumper, so the generation lock hashes did not move; `tools/schema.ts` derives `schema/component.schema.json` from the Zod schema (`pnpm schema`, checked by `pnpm check`); the tests are `tools/__tests__/*.test.ts` (`pnpm test:tools`).
2. `tools/check_contrast.ts` (+ `oklch.ts`) — same pairs, same numbers to two decimals.
3. `tools/keyboard_tests.ts`, `tools/lint_literals.ts`, `tools/behavior_tests.ts`, `tools/spec_sheet.ts`, `tools/checks.ts`.
4. `tools/theme.ts` / `tools/tokens.ts` — delete the Python token fallback; Style Dictionary 4 (`tokens/build.mjs`) is the only token build, extended with the Swift format the iOS plan needs.
5. `tools/generate.ts` — the runner, lock files, gap capture, preflight; the PowerShell scripts call it unchanged.
6. `mcp/server.ts` on the official MCP TypeScript SDK; `mcp/index.ts`, `mcp/smoke.ts`.
7. Remove `tools/py.mjs`, `tools/requirements.txt`, `tools/__pycache__`; `package.json` scripts call `node tools/<name>.ts` directly.

Acceptance for every step: `pnpm check` output identical before and after (diff of `generated/`), the tool's unit tests ported to Vitest, and the job leaves no Python import anywhere in the repository.

## Workstream B — bring every dependency current

Order matters because each step's gate is the previous step's toolchain.

1. **Runtime floor**: `engines.node >= 22`, `packageManager: pnpm@<latest>`, `.nvmrc`. CI installs from `packageManager`.
2. **Dev tooling**: Storybook 10 (`npx storybook@latest upgrade` across the three packages and `storybook/`), Vite 8, Vitest 5, Playwright latest. Stories keep CSF3; the Lit package moves its browser tests to the Vitest browser provider.
3. **React 19** in `packages/react` and the RN package's dev tree: `npx types-react-codemod@latest preset-19 ./packages`, remove `forwardRef` (generated components take `ref` as a prop), peer range `react: ^19`. Regeneration is not needed — the typecheck gate proves the codemod.
4. **React Native 0.87** (+ react-native-svg latest, Jest 30 with the RN preset — RN's test renderer still wants Jest, so the RN package keeps Jest and the others keep Vitest), Expo SDK matching 0.87 for the gallery app (job 130).
5. **TypeScript 7** for `tsc --noEmit` everywhere, `tsdown` with `isolatedDeclarations: true` for builds (every exported symbol gets an explicit type — the generator templates already require typed props), tsconfig cleanup: remove `experimentalDecorators`, `useDefineForClassFields`, `baseUrl`; add `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`. Lit decorators go standard: `@property() accessor label = ''`.
6. **Publish checks**: `publint` and `@arethetypeswrong/cli` in `release:check`; the `exports` map gets `"default"` conditions.

## Workstream C — stay current automatically

- `renovate.json` extends `config:best-practices` with `rangeStrategy: "bump"` and lockfile maintenance; minor and patch updates automerge (`automergeType: "pr"`) once CI is green; majors are grouped weekly (one PR per ecosystem: react, storybook, vite+vitest+playwright, typescript+tsdown, react-native+expo+svg, lit) so a breaking change arrives with its friends.
- CI job `currency`: `pnpm outdated --recursive --format json` is parsed by `tools/currency.ts` (run directly by Node's type stripping, no build step) and the job fails when any dependency is more than one minor behind its `latest` tag. Exceptions live in `.currency-allow.json` as `{ "name", "until": "YYYY-MM-DD", "reason" }` entries, and an entry past its `until` date fails the job on its own; `node tools/currency.ts` gives the same report locally.
- CI job `next` (`continue-on-error: true`): copies the workspace to a temp directory, installs `react@canary`, `typescript@next` and `storybook@next` there, runs typecheck and the package tests, and writes the outcome to the job summary — so the day a major lands the breakage is already known.
- Templates and conventions carry the versions as facts, not aspirations: `prompts/templates/*.md` say "Storybook 10 CSF3", "React 19 (`ref` prop)", "TypeScript 7 isolatedDeclarations". Job 260 rewrites those lines; the next regeneration then emits current idioms.

## Jobs for Claude Code

| Job | Does | Gate |
| --- | --- | --- |
| 200-node-floor | engines, packageManager, .nvmrc, CI setup-node from packageManager | `pnpm install --frozen-lockfile` |
| 210-storybook-vite-vitest | Storybook 10, Vite 8, Vitest 5, Playwright latest in all packages | all three storybooks boot; `pnpm test` green |
| 220-react-19 | codemod, forwardRef removal, peer ranges | `pnpm typecheck`, tests, axe gate |
| 230-rn-087 | RN 0.87, svg, Jest 30, Expo SDK for the gallery | RN tests, `pnpm storybook:device` |
| 240-ts7-tsdown | TS 7, tsdown, isolatedDeclarations, tsconfig cleanup, Lit standard decorators | `release:check` + publint + attw |
| 250-renovate-ci | renovate.json, currency job, next job | first Renovate PR opens |
| 260-templates-current | template/convention version facts | `pnpm parse` |
| 300–305-port-<tool> | one Python tool (or pair) → TypeScript each, in the order above | byte-identical `generated/` |
| 310-port-mcp | MCP server on the TS SDK | `pnpm mcp:smoke` |
| 320-remove-python | shim, requirements, docs | no `.py` in the tree |

Each job file states the files it may touch, the commands it runs, and "do not modify packages/*/src or generated/" — code in those folders changes only through regeneration or the codemods named above.

## Risks and how they are contained

TypeScript 7 has no programmatic API until 7.1, so anything that embeds the compiler must resolve `@typescript/typescript6`; pnpm lets two majors coexist and `tsdown`'s isolated declarations avoid the API entirely for our own builds. React 19 removes `forwardRef` idioms the generator once emitted; the codemod plus typecheck covers it, and the templates stop emitting them. React Native 0.87 pins React 19.2 while `packages/react` moves to 19.3; the workspace tolerates that because RN is its own package with its own dev tree. Storybook 10's CSF factories are optional; stories stay CSF3 until the generator is asked to change. The Python port is the largest workstream; doing it tool by tool with byte-identical output as the gate keeps the regeneration scripts runnable throughout.
