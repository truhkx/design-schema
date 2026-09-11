Raise the runtime floor and pin the toolchain, per site/src/content/docs/process/typescript-and-currency.md (Workstream B step 1).

1. Root package.json: add `"engines": { "node": ">=22" }`, set `packageManager` to the latest pnpm 10.x (check `npm view pnpm version`), add `.nvmrc` with the current Node LTS major.
2. .github/workflows/ci.yml: use `actions/setup-node@v4` with `node-version-file: .nvmrc` and `pnpm/action-setup` reading `packageManager`; cache pnpm.
3. Add `.npmrc` with `engine-strict=true`.
4. Run `pnpm install` and commit the lockfile changes only if they are limited to the pnpm version header.
Gate: `pnpm install --frozen-lockfile` and `pnpm check` succeed. Do not modify packages/*/src or generated/.
