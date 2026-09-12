/**
 * Syntax highlighting — the one non-generated UI surface on the website, and a deliberate, scoped
 * exception to "every pixel is one of our own components" (website-plan.md, "Component page
 * template" step 2 names it as one).
 *
 * The exception is scoped this narrowly on purpose. Syntax highlighting is not an APG interaction
 * pattern: it has no role, no keyboard contract and no state, so there is no schema for it to live
 * in and nothing in the 51 could render it. Rather than invent a component the schema does not
 * describe, the site uses Astro's built-in `<Code>` (Shiki) in exactly two places and nowhere else:
 *
 *   1. the Basic Usage install/import snippet on a component page — a literal `<Code>`, since it is
 *      static Astro markup (see pages/docs/components/[slug].astro);
 *   2. each example's `sourceText` — `highlightSource()` below, which calls the same Shiki `<Code>`
 *      calls, from the page's frontmatter, because those snippets live inside a React island (the
 *      examples `Tabs`) and Astro can only pass markup into an island through a *statically named*
 *      slot, while the number of snippets on a page is the number of stories the component has.
 *      Same highlighter, same theme, same markup — the island is just handed finished HTML.
 *
 * Everything else that looks like code on this site is a `Text` in the mono family (./components/
 * Mono.tsx), which is a generated component doing a generated component's job.
 *
 * ## Colours come from the theme's tokens, not from a bundled Shiki theme
 *
 * `CODE_THEME` is a Shiki *CSS-variables* theme: every token colour it emits is
 * `var(--ds-code-…)`, and ./components/code.css binds those names to the active theme's own colour
 * custom properties. So a code block re-themes exactly the way every generated component does —
 * calm-precise ⇄ warm-friendly by which token stylesheet is enabled, light ⇄ dark by `data-mode` —
 * with no second palette to keep in step and no `github-light`/`github-dark` shipped at all. It
 * also means a low-chroma theme gets a low-chroma code block rather than someone else's colours:
 * warm-friendly's `color.link` *is* its foreground, so function names read as plain identifiers
 * there, which is the theme's own decision showing through.
 *
 * Build-time only either way: no highlighter and no grammar reaches the browser.
 */
import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki';

/** The one language the example snippets are: every one of them is a CSF story export. */
const LANG = 'tsx';

/**
 * The prefix for the custom properties Shiki writes into its output.
 *
 * `--ds-code-` rather than Shiki's default `--shiki-` so the names read as this design system's,
 * and so a stray Shiki default can never silently satisfy one: ./components/code.css defines every
 * variable this theme can emit, and an unbound one would simply inherit the block's foreground.
 */
export const CODE_VAR_PREFIX = '--ds-code-';

/**
 * The theme both spots pass to Shiki — `<Code theme={CODE_THEME}>` and `highlightSource()`.
 *
 * A module-level singleton because Astro's `<Code>` caches its highlighter by theme identity; a new
 * object per page would be a new highlighter per page.
 */
export const CODE_THEME = createCssVariablesTheme({
  name: 'design-schema',
  variablePrefix: CODE_VAR_PREFIX,
});

let cached: Promise<Highlighter> | undefined;

/**
 * One highlighter for the whole build.
 *
 * `createHighlighter` loads a WASM oniguruma engine and the grammar; doing that per snippet would be
 * 696 loads for the 696 stories. The promise is cached rather than the resolved value so concurrent
 * page renders share the one load.
 */
function highlighter(): Promise<Highlighter> {
  cached ??= createHighlighter({ langs: [LANG], themes: [CODE_THEME] });
  return cached;
}

/**
 * One snippet as `<pre class="shiki …" tabindex="0">…</pre>`, ready to be set as HTML.
 *
 * Shiki escapes the code it is given, so the result is safe to inject: the input here is a source
 * slice from `packages/react/src`, which is repo content either way. The `tabindex` is Shiki's own —
 * it is what makes a snippet wider than its column reachable by keyboard (axe's
 * `scrollable-region-focusable`), and ./components/code.css is careful not to add a second one.
 */
export async function highlightSource(code: string): Promise<string> {
  return (await highlighter()).codeToHtml(code, { lang: LANG, theme: CODE_THEME });
}
