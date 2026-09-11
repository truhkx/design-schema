Port tools/theme.py to TypeScript as tools/tokens.ts (Workstream A of process/typescript-and-currency.md, step 5). Run with `node tools/<name>.ts` (Node 22.18+/24 type stripping; add `tsx` as a devDependency fallback for older Node and use it in package.json scripts as `node --import tsx`), no build step.

Rules: same CLI flags, same exit codes, same stdout wording, same files written. Prove it: run the Python and the TypeScript versions over the current docs and diff `generated/` (and stdout) — the job fails on any difference. Port the tool's tests to Vitest under tools/__tests__/. Only after the diff is empty delete the Python file and update package.json scripts to call the TypeScript one.
Also tokens.py. Delete the Python token fallback: `pnpm themes` becomes `node tools/theme.ts && node tokens/build.mjs`. The derived ramps (tokens/themes/<id>/base.json) must be byte-identical.
Do not modify packages/*/src or generated/ except by running the tools.
