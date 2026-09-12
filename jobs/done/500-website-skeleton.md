Scaffold the public website app per site/src/content/docs/process/website-plan.md ("Why a new app instead of reskinning Starlight", "Content pipeline").

1. `apps/website`: a new Astro app (latest stable Astro, matching `site/`'s version) with **no** `@astrojs/starlight` integration. `package.json` depends on `@design-schema/react`, `@design-schema/tokens`, and `astro`; add the React integration (`@astrojs/react`) since example islands and every chrome piece are React components.
2. Two content-layer loaders (Astro 5 Content Layer API): a schema loader reading `generated/components.json` directly, and a prose loader globbing `../../site/src/content/docs/**/*.md` keyed by the same slug. Do not copy either source into `apps/website` — read them in place.
3. `apps/website/src/layouts/Layout.astro`: the page shell — `<html>`/`<head>` wiring the theme's CSS custom properties (same `packages/tokens/dist/<theme>/css/tokens.css` the Storybooks and `site/` already import), and a body that renders `Landmark(role="main")` around the page's `<slot />`. No header/footer yet — those are jobs 503 and 509.
4. One placeholder route (`/`) that renders the layout with a plain `Heading` so the build has content.
Gate: `pnpm --filter website build` succeeds and produces a page containing the placeholder heading. Do not modify `site/`, `packages/*/src`, or `generated/` — this job only reads them.
