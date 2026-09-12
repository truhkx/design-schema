Generate the website's navigation data per website-plan.md ("Content pipeline").

Write `tools/site_nav.ts` (plain Node/TS, run with the same shim the other tools use until Workstream A finishes the Python port): read `generated/components.json`, group every component by its roadmap phase — Primitives, Core, Controls, Focus, Overlays, Selection, Numeric, Rows, Grids, Streams, the same order `regen.ps1` composes in (see component-roadmap.md for the phase → component mapping) — and emit `generated/nav.json`:

```json
{
  "top": [
    { "label": "Homepage", "href": "/" },
    { "label": "Docs", "href": "/docs" },
    { "label": "GitHub", "href": "https://github.com/design-schema/design-schema", "external": true },
    { "label": "About", "href": "/about" }
  ],
  "docs": [
    { "phase": "Primitives", "components": [{ "name": "Icon", "slug": "icon" }, ...] },
    ...
  ]
}
```

Add `pnpm nav` (`tools/site_nav.ts`) to `package.json` scripts and call it from `pnpm check` after `pnpm parse`, since nav.json derives from components.json.
Gate: `generated/nav.json`'s `docs` groups contain all 51 components exactly once, in phase order; re-running is idempotent (byte-identical output on an unchanged `components.json`). Do not modify `packages/*/src`.
