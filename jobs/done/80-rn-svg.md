Decision 2026-09-10: `react-native-svg` is the one permitted third-party runtime dependency in packages/rn (prompts/conventions/rn.md states the rule). Prepare the package so the Icon regeneration can use it:

1. Add `react-native-svg` to packages/rn/package.json dependencies at the latest version compatible with the installed react-native (check packages/rn/node_modules/react-native/package.json), and `pnpm install`. Do not upgrade anything else.
2. Make sure `pnpm --filter @design-schema/rn typecheck` still passes with the new types present (add `"types"` config or a shim only if tsc actually complains).
3. Add a guard: tools/check_deps.py that reads packages/*/package.json and fails if packages/rn has any dependency other than react, react-native and react-native-svg (plus dev deps), or if packages/react or packages/lit gained a runtime dependency beyond react/react-dom/lit and @design-schema/tokens. Wire it as a `deps` gate in tools/checks.py (always on, cheap) and add tests/test_check_deps.py in the existing style.
Run `pytest -q` and the typecheck; do not modify anything under packages/*/src or generated/ by hand.
