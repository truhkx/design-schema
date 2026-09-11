Port tools/check_contrast.py to TypeScript as tools/check_contrast.ts (Workstream A of process/typescript-and-currency.md, step 2). Run with `node tools/<name>.ts` (Node 22.18+/24 type stripping; add `tsx` as a devDependency fallback for older Node and use it in package.json scripts as `node --import tsx`), no build step.

Rules: same CLI flags, same exit codes, same stdout wording, same files written. Prove it: run the Python and the TypeScript versions over the current docs and diff `generated/` (and stdout) — the job fails on any difference. Port the tool's tests to Vitest under tools/__tests__/. Only after the diff is empty delete the Python file and update package.json scripts to call the TypeScript one.
Port oklch.py alongside as tools/oklch.ts. Numbers must match the Python output to two decimals for every pair.
Do not modify packages/*/src or generated/ except by running the tools.
