Port tools/keyboard_tests.py to TypeScript as tools/keyboard_tests.ts (Workstream A of process/typescript-and-currency.md, step 3). Run with `node tools/<name>.ts` (Node 22.18+/24 type stripping; add `tsx` as a devDependency fallback for older Node and use it in package.json scripts as `node --import tsx`), no build step.

Rules: same CLI flags, same exit codes, same stdout wording, same files written. Prove it: run the Python and the TypeScript versions over the current docs and diff `generated/` (and stdout) — the job fails on any difference. Port the tool's tests to Vitest under tools/__tests__/. Only after the diff is empty delete the Python file and update package.json scripts to call the TypeScript one.
Also port lint_literals.py → tools/lint_literals.ts and behavior_tests.py → tools/behavior_tests.ts in this job (they share the components.json reader).
Do not modify packages/*/src or generated/ except by running the tools.
