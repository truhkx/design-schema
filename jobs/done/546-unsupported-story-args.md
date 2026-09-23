Stop rendering hollow examples when a story's args come from a helper, per site/src/content/docs/process/website-audit.md (this is the audit's miss: Carousel was counted as working because its shell rendered). Read that doc's "Findings" first. Jobs 540 to 542 have landed; 543 to 545 may or may not have.

tools/docs_examples.ts extracts story args from the TypeScript AST. When an arg is a call it cannot serialize it emits `{"$unsupported": "<source text>"}` and apps/website/src/components/Examples.tsx renders the component without that arg. On the Carousel page that means all 12 examples show two arrow buttons and a 0px track — `children` is `slides(['Product 1', …])` in every story. `grep -c '\$unsupported' generated/examples/*.json` today: Carousel 12, Tabs 14 (`panelsFor(...)`), DataGrid 24, Table 3, Stack 2 (the "Wrap" examples the audit saw empty — `[...].map(...)`), DatePicker 1, ProgressBar 1 (`Array.from`). Seven components ship an example that renders less than nothing: a working-looking shell with no content.

1. **Evaluate, don't parse.** Add a runtime path to docs_examples.ts: for each `*.stories.tsx` in packages/react/src, import the module with the same loader the tools already use (`node --import tsx`; the stories import React components, so React must resolve — they do in the Storybook build, so the package's own `node_modules` has it), read each named export's `args` (merged over `meta.args`), and serialize the values with the serializer the AST path already targets: primitives as themselves, arrays and objects recursively, React elements as the existing `{$element, props, children}` shape, functions as `{"$unsupported": "<name>"}`. The AST pass stays for `code`, `decorated` and the story's source text; only `args` moves to the runtime value. Helpers like `slides()` and `panelsFor()` then resolve to the element trees they return.
2. **Keep the escape hatch honest.** If a value still cannot be serialized (a function prop, a class instance), keep `$unsupported` — but in Examples.tsx an example whose args contain any `$unsupported` value under `children`, or under a prop the schema marks `required`, is not rendered as a shell. Render the code panel with a one-line note ("This example's `children` are built in code; see the source below.") and drop it from the "More examples" count. A shell that looks like a broken component is worse than no demo.
3. **DataGrid.** 24 `$unsupported` entries yet the page rendered rows in the audit — find what they are (probably `columns` formatters or `rows` generators) and confirm after step 1 that the visible examples are unchanged and the previously-missing props now render (sorting, editing, the formatted cells). Report the before/after.
4. **Regenerate** `pnpm docs:examples` and keep the JSON. The prompt hashes are unaffected (examples are not prompt inputs); say so.
5. **Guard.** Extend the example-render Playwright spec from job 542/544 with a per-component "content" assertion: the rendered example's root must contain at least one text node or image beyond its own controls — for Carousel, at least one `[data-part=slide]`; for Tabs, at least one `[role=tabpanel]` with text; for Table and DataGrid, at least one body row. Add `grep -c '\$unsupported' generated/examples/*.json` to the summary and require that the only survivors are function-valued props, each listed with its story.

Gate — all must pass:

    pnpm docs:examples
    pnpm docs:examples:check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm --filter website build
    pnpm site:routes
    pnpm exec playwright test --config playwright.website.config.ts

Carousel "Default" shows four slides and its next button advances them; Tabs "Default" shows its panels; Stack "Wrap" shows wrapped children. Zero `$unsupported` values remain under `children` in generated/examples/*.json.

Do not modify `packages/*/src` (story files included — the extractor adapts to the stories, not the other way round), `prompts/`, or any component doc.
