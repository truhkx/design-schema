// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Design Schema',
      description:
        'A documentation-first, schema-driven design system that generates components for web, web components, and native platforms.',
      customCss: [
        // Default theme. Built by `pnpm themes && pnpm tokens` from the theme docs.
        '../packages/tokens/dist/calm-precise/css/tokens.css',
        './src/styles/site.css',
      ],
      components: {
        // Auto-render the props/events/a11y tables from frontmatter above the Markdown body.
        MarkdownContent: './src/components/MarkdownContent.astro',
      },
      sidebar: [
        { label: 'Process', autogenerate: { directory: 'process' } },
        { label: 'Themes', autogenerate: { directory: 'themes' } },
        { label: 'Foundations', autogenerate: { directory: 'foundations' } },
        { label: 'Components', autogenerate: { directory: 'components' } },
        { label: 'Guides', autogenerate: { directory: 'guides' } },
      ],
    }),
  ],
});
