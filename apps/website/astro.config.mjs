// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';

// The adopter-facing website. Deliberately *no* @astrojs/starlight: Starlight owns its own header,
// skip links, TOC and pagination markup, and the point of this app is that every pixel of UI is one
// of the system's own generated components. See site/src/content/docs/process/website-plan.md,
// "Why a new app instead of reskinning Starlight".
//
// The React integration is here because the chrome and the example islands are all React: Astro
// renders them to HTML at build time, and only the interactive ones get a `client:*` directive.
//
// `site` is the public URL (Astro.site, canonical links, a sitemap once there is one). It comes from
// PUBLIC_SITE_URL, which the self-hosted image gets from apps/website/.env; unset or empty leaves it
// undefined, exactly as before.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || undefined,
  integrations: [react()],
  vite: {
    plugins: [reactFromSourceInDev()],
    resolve: {
      alias: {
        // The naming demo (/docs/naming-demo, job 523) renders packages/react/demo-brand — a tree
        // generated under themes/demo-brand/naming.md, which renames the package scope to `@demo`.
        // A real fork publishes `@demo/tokens`; this repository has one token package, so the
        // specifier is pointed back at it. Same alias as packages/react/demo-brand/tsconfig.json and
        // its Vitest config, and the one thing in that worked example a fork would not need.
        '@demo/tokens': '@design-schema/tokens',
      },
    },
  },
});

/**
 * `astro dev` (Vite `serve`) renders the components from packages/react/src, so a regen shows up
 * without a package rebuild (website-audit.md, "Workflow hazards found along the way"). Exact match
 * only: `@design-schema/react/index.css` stays on dist, because src has one stylesheet per component
 * and no single entry — the root `pnpm dev` builds the package first to keep that sheet fresh.
 * `astro build` gets no alias and resolves both through the package's exports, i.e. dist.
 * @returns {import('vite').Plugin}
 */
function reactFromSourceInDev() {
  return {
    name: 'design-schema:react-from-source-in-dev',
    config(_config, { command }) {
      if (command !== 'serve') return;
      const src = fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url));
      return { resolve: { alias: [{ find: /^@design-schema\/react$/, replacement: src }] } };
    },
  };
}
