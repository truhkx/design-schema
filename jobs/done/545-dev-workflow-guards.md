Close the two workflow gaps the website audit tripped over, per site/src/content/docs/process/website-audit.md, section "Workflow hazards found along the way". Read that section first. Jobs 540 to 544 have landed.

Two hazards. **Stale dist:** apps/website imports `@design-schema/react` and `@design-schema/react/index.css` from packages/react/dist. A regen rewrites packages/react/src and nothing rebuilds dist, so `pnpm dev` can serve components that are days behind the source (on 2026-09-23 dist was from 09-19 and src from 09-21). **Line-ending churn:** the twelve tokens/themes/*/{base,dark,light,theme}.json files show whole-file diffs — 3,161 insertions and 3,161 deletions — that are CRLF/LF changes from job 606's run, not token changes, and they will pollute the next commit.

1. **Dev serves source.** In apps/website/astro.config.mjs the `vite.resolve.alias` block already points one specifier back at source; add aliases so that in `astro dev` (only — check `command === 'serve'`) `@design-schema/react` resolves to packages/react/src/index.ts and `@design-schema/react/index.css` to the source stylesheet entry, while `astro build` keeps using dist. If the CSS entry in src is not a single file, keep the CSS on dist and instead make the `dev` script build it first (step 2) — say which you did and why.
2. **Scripts.** Root package.json: `dev` becomes `pnpm --filter @design-schema/react build && pnpm --filter website dev` unless step 1 made the build unnecessary for JS **and** CSS; either way `pnpm build` (already `… && pnpm --filter website build`) gets `pnpm --filter @design-schema/react build` in front of the website build, so a fresh clone builds the site from current source. apps/website/README.md "Prerequisites" states which of the two guarantees the freshness.
3. **Line endings.** Add a `.gitattributes` at the repo root with `tokens/themes/**/*.json text eol=lf` (and `generated/**/*.json text eol=lf` if a check shows the same churn there). Make tools/theme.ts write LF explicitly. Then `pnpm themes` once and confirm `git diff --stat tokens/themes` is empty against HEAD — if the derivation itself changed a value (not just line endings), stop and report it; that would mean job 606 changed token output, which its own gate forbids.
4. **Port note.** README's "Everyday commands" already distinguishes `pnpm dev` (website, deployed) from `pnpm site:dev` (Starlight contributor site, not deployed); add the port each takes by default and that running both moves the second to 4322, so nobody reviews the wrong app again.

Gate — all must pass:

    pnpm themes
    git diff --stat -- tokens/themes    # empty
    pnpm build
    pnpm site:routes

Then, as the freshness proof: edit a visible string in packages/react/src/Button.tsx, start `pnpm dev`, load `/docs/components/button/`, confirm the change is on the page, revert the edit. Record the result in the summary.

Do not modify `packages/*/src` (beyond the reverted proof edit), `prompts/`, or any component doc. Do not change what tools/theme.ts derives, only the bytes it writes them with.
