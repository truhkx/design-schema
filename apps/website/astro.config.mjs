// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// The adopter-facing website. Deliberately *no* @astrojs/starlight: Starlight owns its own header,
// skip links, TOC and pagination markup, and the point of this app is that every pixel of UI is one
// of the system's own generated components. See site/src/content/docs/process/website-plan.md,
// "Why a new app instead of reskinning Starlight".
//
// The React integration is here because the chrome and the example islands are all React: Astro
// renders them to HTML at build time, and only the interactive ones get a `client:*` directive.
export default defineConfig({
  integrations: [react()],
  vite: {
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
