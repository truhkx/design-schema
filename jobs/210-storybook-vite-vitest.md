Bring the dev tooling current (Workstream B step 2 in process/typescript-and-currency.md): Storybook 10.x, Vite 8.x, Vitest 5.x, Playwright latest.

1. Run `npx storybook@latest upgrade` in packages/react, packages/lit, packages/rn and storybook/ (accept the automigrations: single `storybook` package, `@storybook/addon-essentials` removed — its addons are core now, framework packages `@storybook/react-vite` / `@storybook/web-components-vite` at 10.x). Keep CSF3; do not convert stories to CSF factories.
2. Vite ^8 and Vitest ^5 in every package that has them; `vitest.config.ts`: `esbuild` options become `oxc`; the Lit package's browser tests use `@vitest/browser` 5 with the Playwright provider.
3. `@playwright/test` and `playwright` to latest; `playwright.config.ts` unchanged otherwise.
4. Update prompts/templates/*.md and prompts/conventions/*.md lines that say "Storybook 8" to "Storybook 10" (CSF3 stays).
Gate: all three storybooks build (`pnpm -r build-storybook`), `pnpm -r test` green, `pnpm gates:axe` green. Do not modify packages/*/src (stories included — they are generated) except through the storybook automigration codemod; do not modify generated/.
