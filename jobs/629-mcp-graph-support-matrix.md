Serve the composition graph and a platform support matrix from the MCP server. This was part of row 624 in site/src/content/docs/process/schema-hardening.md and was split out so one oversized job cannot stop the queue; the Phase 2 table lists it as 629. Read "Rules every job follows" and "Measuring a job" first. Jobs 609 to 628 have landed: read the files as they are now, in particular job 624's `deprecated`/`since` fields and job 612's composition shape. This job adds no schema field.

- **Graph.** `composition` names the component each part is built from (alert.md `dismissButton: Button`, `icon: Icon`; toolbar.md `overflowButton: Button`, `overflowMenu: Menu`). Phase 4 regenerates "in the order composition implies", but nothing computes that order. mcp/server.ts `listComponents` returns name, category, status, apg, description and platforms, and mcp/index.ts flattens `composition` into one prose sentence for search.
- **Support matrix.** `getComponent` annotates one platform at a time (`nameOnPlatform`, `availableOnPlatform`). Nothing shows, across platforms, which props, events and components each one lacks, or whether generated code exists. An adopter deciding whether the system covers their existing library needs exactly that view.

1. **Graph and matrix.** Create tools/lib/graph.ts with pure functions over generated/components.json entries (no filesystem access):
   - `compositionGraph(entries)` returns:
     - `nodes`: `{ name, status, deprecated }` (`deprecated` is true when job 624's `deprecated` block is present or `status` is `deprecated`)
     - `edges`: `{ from, part, to, planned }`
     - `order`: leaves first, ties broken by name
     - `cycles`: `string[][]`
     Read `composition` targets the way tools/parse.ts `validate` does, including the `(planned)` marker; if job 612 changed composition entries to objects, use its accessor. A planned target is an edge with `planned: true` and is never in `order`.
   - `supportMatrix(entries, hasSource)` returns one row per component: `{ name, status, deprecated, platforms: { <p>: { supported, generated, missingProps, unmappedEvents, deprecatedMembers } } }`. `missingProps` comes from `propDef.platforms`, `unmappedEvents` from `eventDef.platforms`, and `deprecatedMembers` lists props, events and enum values with a `deprecated` block (job 624's `valueLifecycle` for values). `hasSource(component, platform)` is injected; the MCP server implements it with the same source path `lookupCode` resolves (`sourceDir`, `SOURCE_EXT`, and SwiftUI's own layout). Take the platform list from schema/platforms.ts.
2. **MCP.** In mcp/server.ts, add two tools following the file's pattern: a `*_DOC` constant, `logged`, then `registerTool`.
   - `get_component_graph` takes `{ component?: string }`. With no component it returns the whole graph. With one, it returns `{ name, composes, composedBy, transitiveComposes, transitiveComposedBy }`. An unknown name raises `findComponent`'s error.
   - `get_support_matrix` takes `{ component?: string, platform?: platform }`.
   Also:
   - Add a `deprecated` boolean to each `list_components` row.
   - Add one clause about both tools to `INSTRUCTIONS`.
   - Add a line for each tool to mcp/smoke.ts.
   - Add both to the tool list on site/src/content/docs/process/mcp-server.md.
3. **Tests.**
   - A new tools/__tests__/graph.test.ts:
     - fixtures for a cycle, a planned edge, a leaves-first `order`, and a deprecated member in the matrix
     - a test against the real generated/components.json: `cycles` is empty, `Alert` composes `Button` and `Icon`, and `Toolbar` composes `Menu`
   - mcp/__tests__/server.test.ts (or the file that covers the tool functions): both tools, an unknown component, the platform filter, and the new `list_components` field (update the test that lists the summary fields).

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use npx or PowerShell, and do not stage or commit.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node logs/600-baseline.mjs --out 629

The `pnpm mcp:smoke` output must show both new tools returning data, with an empty `cycles`. In logs/600-measure-629.json, every step exits 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. The `corpus` block must equal the latest earlier logs/600-measure-*.json. `git status` must show no change under schema/, site/src/content/docs/components/ or packages/.

Do not modify `schema/`, `packages/*/src`, `prompts/templates/`, any component or extension doc, `themes/`, or any doc under `site/src/content/docs/` other than process/mcp-server.md.
