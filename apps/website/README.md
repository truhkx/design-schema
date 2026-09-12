# apps/website

The adopter-facing Design Schema website: home page, docs, and a page per component, built out of
`@design-schema/react` components rather than a theme's markup. The plan, and the reasoning for a
bare Astro app instead of reskinning Starlight, is in
[`site/src/content/docs/process/website-plan.md`](../../site/src/content/docs/process/website-plan.md).

`site/` is not part of this app and is not going away — it stays the contributor/spec reference. This
app reads its markdown in place, so the docs have exactly one source.

## Prerequisites

The app consumes the **built** React package, so `packages/react/dist` has to exist, and
`generated/components.json` has to have been parsed:

```
pnpm parse                                        # writes generated/components.json (gitignored)
pnpm --filter @design-schema/react build-storybook # writes storybook-static/index.json (gitignored)
pnpm docs:examples                                # writes generated/examples/*.json from both (gitignored)
pnpm nav                                          # writes generated/nav.json (gitignored)
pnpm build:packages                               # writes packages/{tokens,react}/dist
pnpm --filter website build                       # then this
```

`pnpm check` runs the parse, the examples and the nav in that order, so a full check leaves the app's
inputs current — but it does **not** build Storybook, and `tools/docs_examples.ts` needs Storybook's
manifest for the story ids. On a fresh clone, run `build-storybook` once first; after that the
manifest only has to be rebuilt when a story is added or renamed, which is exactly when the tool says
so by name.

`pnpm --filter website... build` builds the workspace dependencies first, if you'd rather not run
them by hand.

## Layout

| Path | What |
| --- | --- |
| `src/content.config.ts` | The two content-layer collections and their schemas. |
| `src/loaders/components.ts` | The schema loader: `generated/components.json`, read in place. |
| `generated/nav.json` | Not in this app: `tools/site_nav.ts` writes it (top-level links + the docs sidebar's phase groups) for the header and the docs sidebar to read. |
| `src/nav.ts` | That file, read and shape-checked at build time, plus the two docs sections and the component-route shape. |
| `src/themes.ts` | The published themes from `generated/themes.json`, each with its built stylesheet's URL. Build-time only. |
| `src/theme-switch.ts` | The browser half of theming: which `<link>` is enabled, and where the choice is remembered. |
| `src/layouts/Layout.astro` | The page shell: theme stylesheets, the header, the one `main` Landmark, and the footer below it. |
| `src/components/Header.astro` | The `banner`: the logo lockup, and the `HeaderNav` island. |
| `src/components/HeaderNav.tsx` | The nav links, theme `SegmentedControl`, and the mobile `SidePanel` drawer. |
| `src/components/Footer.astro` | The `contentinfo`: GitHub / npm / License, and the copyright line read out of `LICENSE`. Static. |
| `src/pages/about.astro` | The About page. Prose only, adapted from `site/src/content/docs/guides/two-ways-in.md`. |
| `src/assets/logo.svg` | The mark. The one hand-authored visual asset here — see "The logo" below. |
| `src/layouts/DocsLayout.astro` | The docs shell: the navigation beside (or above) the content slot. |
| `src/components/DocsSidebar.astro` | The docs nav's composition: the generated groups, the current route, the breakpoint guard. |
| `src/components/DocsNav.tsx` | Both renderings of it — the `Disclosure` sidebar and the mobile `Select`. |
| `src/component-page.ts` | The component page's view models: prop and event rows, the a11y requirement prose, the Basic Usage snippets, the consumer-choice list. No JSX, so it reads without a renderer. |
| `src/keyboard.ts` | `generated/keyboard/<Name>.json` (29 specs), globbed at build time, plus how a rule's keys and action read in a table. |
| `src/components/PropsTables.tsx` | The props and events `Table`s. Static — no `client:*`, so they ship no JavaScript. |
| `src/components/AccessibilityContract.tsx` | The a11y `Alert` and the three-section `Accordion`. The component page's one island. |
| `src/components/Mono.tsx` | A prop name, a type, a token path: `Text` at `font.family.mono` rather than a bare `<code>`. |
| `generated/examples/<Name>.json` | Not in this app: `tools/docs_examples.ts` writes it (one entry per Storybook story — title, args, source, story id) for the examples section to read. |
| `src/examples.ts` | Those files, globbed at build time, plus the Chromatic project URL and the story deep link's shape. |
| `src/example-args.ts` | Encoded story `args` → React props: JSX descriptors rebuilt, uncarryable args dropped. Shared by the page and the island. |
| `src/example-probe.ts` | Which examples render at all, answered by rendering them at build time. Server-only — it imports `react-dom/server`. |
| `src/highlight.ts` | The one non-generated UI surface: the Shiki theme both code spots use, and the highlighter the example source goes through. Says why that spot is not a literal `<Code>`. |
| `src/components/Examples.tsx` | The examples `Tabs`: one tab per story, each panel a live render, its source, and the Storybook link. The component page's second island. |
| `src/components/code.css` | The code block's frame, and where Shiki's colour variables are bound to the active theme's colour tokens. |
| `src/styles/home.css` | The home page's two layout rules. Nothing in it sets appearance. |
| `src/pages/` | Routes: `/`, `/docs`, `/docs/foundations`, `/docs/patterns`, and `/docs/components/[slug]` (one per component). |

## Theming

Each theme's token stylesheet declares its custom properties on `:root`, so two of them loaded at
once would just have the last one win. Layout.astro therefore emits one `<link>` per published theme
and the header's `SegmentedControl` enables exactly one of them (`media: all` vs `not all`), with the
choice in `localStorage` and an inline `<script>` applying it before first paint. Light/dark mode is
separate and unchanged: `data-mode` on `<html>`, one attribute, no sheet swapping.

## The one viewport decision

`layout.breakpoint.md` is the only breakpoint the site switches on, and it switches in CSS
(`src/components/header.css`, `src/components/docs-sidebar.css`), not in JavaScript, so the header
and the docs nav have their final shape before any island hydrates. `Header.astro` and
`DocsSidebar.astro` each assert the number in their media query against the token at build time —
foundations/layout.md explains why the number has to be written out at all.

Both switches are a swap, not a hide: below the breakpoint the docs sidebar's `navigation` landmark
is `display: none`, so it leaves the accessibility tree entirely and a phone gets one docs nav (the
`Select`) rather than two. The `Select` is not itself a landmark, for the same reason.

## The two loaders

Both collections are keyed by the **same slug**, so a component page joins prose to schema with no
lookup table: `getEntry('components', 'button')` is the contract, `getEntry('docs', 'button')` is the
prose body of `site/src/content/docs/components/button.md`.

- **`components`** — a custom loader over `generated/components.json` (51 entries), validated against
  `schema/component.ts`, the same Zod definition `tools/parse.ts` enforces. It reloads the whole file
  on every run, and in `astro dev` re-reads it when `pnpm parse` rewrites it.
- **`docs`** — Astro's `glob()` loader over `../../site/src/content/docs/**/*.md` (74 entries), keyed
  by file basename. Only the frontmatter this app renders is typed; the rest passes through.

## The logo

`src/assets/logo.svg` is the only pixel on this site that a generator did not produce. Nothing in
the 51 components is a brand mark — `Icon` is a fixed UI-glyph set — so the mark is authored once,
by hand, and then behaves like everything else: it is all stroke in `currentColor`, with no color,
no fill and no text of its own, so one `color` declaration re-themes it across calm-precise,
warm-friendly, light and dark. It draws the system in one figure: a schema on the left, fanning out
along right-angled runs to three platforms.

Astro inlines it (`import Logo from '../assets/logo.svg'`) rather than emitting an `<img>`, which is
what lets `currentColor` reach it at all. Two consequences worth knowing: the file's comments ship in
the HTML of every page that uses it, so they are kept short and the reasoning lives here instead;
and Astro probes only the first kilobyte of the file for the `<svg>` tag, so nothing long may sit
above it.

The mark is decorative everywhere it appears (`aria-hidden`): in the header the adjacent `Link`
already says "Design Schema", and on the home page the `h1` does. The wordmark stays live text
rather than being drawn into the asset, so it is selectable, translatable, themed by the type
tokens, and available as the home link's accessible name.

## The home page's two CSS rules

`src/styles/home.css` exists because of two things no component can do for itself: putting the
decorative hero backdrop behind a `Container`, and giving a wrapped `Stack`'s items a column width.
Both are layout; neither sets a color, a border or a typeface. The second one is a gap, logged in
`generated/gaps/Stack.web.md` — the wrapped `Stack` the plan chose in place of a grid primitive
cannot express "cards about this wide, then break", and a real `Grid` is the answer.

The hero's two calls to action are `Link`s rather than the `Button`s the plan names, for the reason
`components/button.md` gives itself ("Do not use a Button to navigate to another page or screen") —
a `Button` has no destination, so it could only navigate from script. The missing piece is the "Link
styled as a button" that same guidance names but the schema does not have; it is logged in
`generated/gaps/Button.web.md` rather than restated as page CSS here, which would drift from
`Button.css` on the first token change.

## Gates

```
pnpm gates:website              # builds, previews, then Playwright: the header, the home page, the docs nav
```

`tests/website/home.spec.ts` is job 504's gate. Lighthouse itself is not a dependency of this repo,
and its accessibility category *is* axe-core, so the gate runs axe over exactly the rule set
Lighthouse scores (the WCAG tags plus axe's best-practice rules, which is where `heading-order` and
`region` live) at both viewports. It also loads the page with `javaScriptEnabled: false`, which is
the literal form of "no client JS required to read the hero".

`tests/website/docs-nav.spec.ts` is job 505's gate: the accessibility tree at each viewport (one docs
nav, never two), the phase groups in both renderings, and a `Select` option actually navigating to
its component's page. Its axe pass waits for the popup's fade-in to *finish* — axe reading a label
at opacity 0.4 measures it against whatever is behind the popup and reports a contrast failure the
settled popup does not have.

`tests/website/component-page.spec.ts` is job 506's gate, and it hard-codes none of what it checks:
the props table's row count is compared against the doc's own prop count, the keyboard section's
presence against whether `generated/keyboard/<Name>.json` exists, and the "not yet generated" notice
against a fresh listing of `packages/react/src` — one test per component, all 51.

`tests/website/examples.spec.ts` is job 507's gate, and it hard-codes nothing either: the story
modules are re-listed from `packages/react/src`, the expected ids come from Storybook's own
`index.json`, and each page's tab count is the entry count in `generated/examples/<Name>.json`. It
also asserts the page makes no request to a Storybook or Chromatic origin — which is what "renders
correctly with Storybook's dev server stopped" means operationally, and this config never starts one.

`tests/website/code.spec.ts` is job 508's gate, and it asserts no colour. Asserting a hex would be
asserting the theme, which is the thing this job made re-themeable — so every check is a
*relationship*: more than one colour inside a block (that is what "syntax-coloured" means), a
different set of colours after switching theme or after switching mode, and nothing painted the
block's own background. It covers both published themes × both modes, plus the `<Code>` block's
keyboard contract: Shiki's `tabindex` is the only tab stop, ArrowRight scrolls it, Tab leaves it.

It uses `playwright.website.config.ts`, deliberately separate from the root Playwright config: that
one starts all three package Storybooks for every run, and the site's gates have no business waiting
on them or failing with them.

`tests/website/axe.ts` holds the shared audit builder and the one violation the site's axe gates let
through: `Table` renders its caption as a composed `Heading` under an explicit `role="table"`, which
axe reports as `aria-required-children` on every `Table` on the page. No consumer can avoid it —
`caption` is required and `hideCaption` only hides it visually — so the filter is narrowed to
`Table`'s own element and named there, and the fix is logged in `generated/gaps/Table.web.md`.

## The component page

`/docs/components/[slug]` is one template for all 51, built from `generated/components.json`,
`generated/keyboard/*.json` and `generated/examples/*.json` and nothing else: `Breadcrumb` /
`Heading` / description, the Basic Usage snippets, the examples `Tabs`, the props and events
`Table`s, then the accessibility `Accordion`. Five things about it are worth knowing before editing
it:

- **"Not yet generated" is computed, never listed.** The page asks whether `@design-schema/react`
  exports the component; the gate re-reads `packages/react/src`. Both say *all 51* today, so the
  notice renders nowhere — the plan's "36 not yet generated" is history, not a target.
- **Two islands hydrate** (`client:visible`): the accessibility accordion and the examples. Both are
  fully rendered at build time, so the whole contract, the first example and every tab label are in
  view-source; hydration adds the folding and the tab switching.
- **The frontmatter does three things before the island.** It highlights every snippet
  (`src/highlight.ts`), probes every example (`src/example-probe.ts`), and passes both down as props.
  All three are build-time; none of it reaches the browser.
- **Basic Usage is two snippets and no live render.** The default story is the examples section's
  first tab, so repeating it here would be the same demo twice; what the section still owes a reader
  is how to install and import, which is a *package* fact — derived from
  `packages/react/package.json` rather than typed out, so a rename or a moved CSS export reaches
  the docs with a build. It renders only when the package exports the component.
- **An example that cannot render shows its source instead.** 674 of the 696 stories render from
  their args; the rest either define their own `render` (ActionSheet's five all do) or need an arg
  the extractor could not carry (`Feed`'s timestamps come from a helper call). The probe decides,
  by rendering — see "The examples" below.

## The examples

Every example on a component page is a Storybook story, projected — never re-authored. The pipeline
is two files outside this app and four inside it:

1. `tools/docs_examples.ts` parses each `packages/react/src/<Name>.stories.tsx` with the TypeScript
   compiler API (never importing it: a story module pulls in React, the component and its CSS),
   merges each export's `args` over the meta's, and cross-references the export against
   `packages/react/storybook-static/index.json` for the `storyId` **Storybook** assigned.
2. `src/examples.ts` globs the resulting `generated/examples/<Name>.json` at build time.
3. `src/example-args.ts` turns the encoded args back into props. Two shapes are not plain data: JSX
   from the story, which is rebuilt with `createElement`, and args that were genuinely code (a
   `render` callback, a `formatValue`), which the extractor marked and this drops.
4. `src/components/Examples.tsx` renders the `Tabs`. Nothing in it fetches Storybook or Chromatic —
   the live render is built from the JSON — so the examples work with every Storybook instance down.
   A "Storybook is down" incident costs the page one link, which is the point of doing it this way.

The "Open in Storybook ↗" link appears only once `generated/chromatic.json` exists (job 510). Until
then there is no hosted Storybook to point at, and the panel omits the link rather than linking to a
URL that does not resolve.

## Code presentation

Syntax highlighting is the one piece of UI on this site that is not a generated component, and the
exception is scoped to two spots and written down at the top of `src/highlight.ts`: the Basic Usage
install/import snippets on a component page, and each example's source. Nothing else — a prop name
or a token path is a `Mono`, which is a `Text`. The reason it is an exception at all is that syntax
highlighting has no role, no keyboard contract and no state, so there is no APG pattern and no
schema for it to live in.

The colours are still the system's. `src/highlight.ts` builds a Shiki **CSS-variables** theme, so
every colour Shiki emits is `var(--ds-code-…)`, and `src/components/code.css` binds those names to
the theme's own colour tokens (`color.status.danger.foreground` for keywords,
`color.status.success.foreground` for strings, and so on). A code block therefore re-themes exactly
like a Button does — calm-precise ⇄ warm-friendly by which stylesheet is enabled, light ⇄ dark by
`data-mode` — with no bundled Shiki preset shipped at all. Three things follow from that:

- **The block's surface is `color.background`, not `color.background-subtle`.** On warm-friendly's
  sand tint, `color.status.success.foreground` lands at 4.47:1 — just under AA. On the page
  background it clears at 4.71:1, and every other code colour clears in both themes and both modes.
- **`color.status.info.*` is deliberately unused.** In warm-friendly its ramp is the same warm
  orange as `warning`, so a palette using both would have two roles it could not tell apart.
- **A low-chroma theme gets a low-chroma code block.** warm-friendly's `color.link` *is* its
  foreground, so function names read as plain identifiers there. That is the theme's decision
  showing through, which is the point.

Only the Basic Usage snippets are a literal `<Code>`. The example snippets live inside the examples
island and Astro can only pass markup into an island through a *statically named* slot, while the
number of snippets on a page is the number of stories the component has — so those go through the
same Shiki and the same theme from the page frontmatter, and the island is handed finished HTML.

## Not here yet

The About page, footer and Pages deploy (509). `contentinfo` is a sibling of `main` like `banner`
is, so the footer lands in 509 rather than being stubbed here.

`/docs`, `/docs/foundations` and `/docs/patterns` exist as pages because the navigation has to lead
somewhere — a sidebar link to a 404 is the navigation job's defect — but their bodies are still
placeholders.
