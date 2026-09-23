Clean up the examples that render but read as broken, per site/src/content/docs/process/website-audit.md, section "Examples that do not work" (the Divider, Stack, Slider, Popover and key-warning rows). Read that doc's "Findings" first. Jobs 540 to 543 have landed.

From the 2026-09-23 audit of every example tab on all 51 pages:

- **Divider:** "Default", "Semantic", "Orientation Horizontal", "Spacing None" and "List Furniture" render a 1px line inside an otherwise empty card and read as blank.
- **Stack:** "Wrap" and "Wrapping Filters" render an empty card (the story's children come from a decorator or are missing from args).
- **Slider:** "Effort With Marks" overflows its card by 22px; the mark labels do not respect the container width.
- **Popover:** "Default" shows "No React story covers this scenario, so there is no React code for it" beneath the notice — an example with neither demo nor code.
- **All pages:** React warns "Encountered two children with the same key, `Tab`" — at least two examples share a title on the Card page, and the Examples tab keys derive from titles.
- **Narrow widths:** the example tab row clips its last tab ("Placement Bottom" cut mid-word on Popover) with no scroll affordance; examples.css has no `overflow-x` on the tablist.

1. **Context for bare examples.** In Examples.tsx, when the rendered example's root is a `Divider`, or a `Stack` with no children, wrap it in the same neutral context the Storybook decorator gives it: two short `Text` lines either side of a Divider; three labelled `Box` children inside a Stack. Do this by component name in a small `EXAMPLE_CONTEXT` map in the website (the site owns presentation), and say in the summary which components got a context.
2. **Slider marks.** Find why the mark labels overflow — the label row is likely positioned by percentage without `inline-size: 100%` on its container, or the end labels are not translated back inside. Fix it in the website's example surface only if it is a site CSS issue; if it is the component's CSS, that is a finding for the regen — record it in the summary with the selector, do not patch packages/react.
3. **Keys.** Key the example tabs and panels by `storyId`, not by title, in every place Examples.tsx builds a list (lines around 269, 316, 358, 365 today). Then find the duplicate-title pair on the Card page and rename one in its story so titles are unique too.
4. **Popover Default.** Either the React story exists under a different export and docs_examples.ts fails to match it (check `storyId` generation for stories whose export name is `Default` when a `default` meta export also exists), or there is no React story. Fix the matcher if it is the former; if the latter, exclude the example from the site and note it for the Storybook owner.
5. **Tab row overflow.** Give `.ds-tabs__tablist` inside `.ds-examples` `overflow-x: auto` with a visible scroll affordance at narrow widths (a fading edge or the native scrollbar; not hidden), and make sure the selected tab is scrolled into view on selection. Keyboard arrow navigation between tabs must still scroll the row.

Gate — all must pass:

    pnpm docs:examples:check
    pnpm --filter website build
    pnpm site:routes
    pnpm exec playwright test --config playwright.website.config.ts

The example-render audit (from job 542's spec) reports zero `empty` and zero `overflowX` entries across all 51 pages, and the full-site Playwright pass records zero React key warnings in the console. At 390px every example tab is reachable by scrolling the row.

Do not modify `packages/*/src`, `prompts/`, or any component doc. Story files under `packages/react/src/**/*.stories.tsx` may be edited only to rename a duplicate title.
