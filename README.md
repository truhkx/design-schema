# Design Schema

A documentation-first, schema-driven design system generator. One Markdown doc per component (YAML frontmatter = schema, prose = guidance) plus a W3C DTCG token set drive the docs site, props tables, per-platform generation prompts, an MCP server, and generated React / Lit / React Native components.

Open source, for two people: an **adopter** (a business owner and their AI engineer) who writes a one-page theme doc and gets a complete, accessible system on three platforms for free — components are generated once and contain no literal values, so a theme is the whole customisation — and an **owner** who edits the schema itself and regenerates with `generate.ps1`, the only step that calls a model (a dollar or two per component per platform, less on Sonnet, gated by type-check, a literal linter and contrast). See the docs page *Two ways in*.

```
site/src/content/docs/themes/*.md      Stage 1: theme docs — frontmatter = the decisions, body = the feel
tokens/themes/<id>/                    Stages 2–3: DERIVED base.json + light.json/dark.json (do not edit)
tokens/build.mjs                       Style Dictionary → packages/tokens/dist/<id>/{css,js,rn,json}
schema/                                component.* and theme.* — Zod (Starlight) + JSON Schema (Python tools)
site/src/content/docs/components/*.md  Stage 4: component docs — frontmatter = schema, body = guidance
prompts/templates/                     theme.md (the "feel" skill) + web/lit/rn.md (per-component generators)
packages/{tokens,react,lit,rn}/        built tokens + GENERATED components, stories and a sign-in demo per platform
storybook/                             root Storybook composing the three platform Storybooks side by side
tools/theme.py                         theme doc → OKLCH ramps, scales, contrast-aware semantic mapping
tools/tokens.py                        pure-Python token resolver (theme × mode); fallback CSS for the site
tools/parse.py                         validates docs → generated/{components,themes}.json + generated/prompts/*.md
tools/check_contrast.py                WCAG contrast for every declared pair × theme × mode × variant
tools/generate.py + generate.ps1       doc → platform code + tests via Claude Code headless, gated by tools/checks.py; lockfile in generated/
tools/checks.py                        the gates: parse, contrast, literals, typecheck, tests (Vitest / Vitest browser / Jest per platform)
tools/lint_literals.py                 build gate: no hex/px/ms/font literals in generated packages
prompts/conventions/                   one-page package digests the generator reads instead of the whole package
mcp/                                   FastMCP server + the ChromaDB index it searches
tests/                                 pytest suite for the Python tools, the MCP server, and the docs
```

## Setup

Windows (one shot, writes logs to `logs\`):

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1      # pnpm via npm, pnpm install + rebuild, python deps, typecheck
powershell -ExecutionPolicy Bypass -File .\storybook.ps1  # all four Storybooks; open http://localhost:6006
```

Anywhere else:

```sh
npm install -g pnpm@10 && pnpm install         # native build scripts are pre-approved in package.json
pip install -r tools/requirements.txt          # pyyaml, jsonschema (Python 3.10+)
```

Verified 2026-09-09 on Windows: all three packages type-check clean and the sign-in demo renders on React, Lit, and React Native (react-native-web) in the composed Storybook.

## Everyday commands

```sh
pnpm check        # derive themes, resolve tokens, validate all docs, build prompts, check contrast
pnpm themes       # just the theme derivation + resolve
pnpm tokens       # build tokens with Style Dictionary
pnpm docs         # run the docs site locally (http://localhost:4321)
pnpm storybook    # React (6007) + Lit (6008) + React Native via react-native-web (6009), composed at http://localhost:6006
pnpm typecheck    # tsc --noEmit in every package
pnpm test         # pytest: color math, token resolver, theme derivation, doc parser, behavior scenarios, MCP tools
pnpm test:packages # the generated components' behavior tests on all three platforms (Lit needs `npx playwright install chromium` once)
pnpm gates        # every code gate on committed code, no model
pnpm build        # tokens + parse + static site build
```

`pnpm themes` also writes a fallback `packages/tokens/dist/<id>/css/tokens.css`, so the site styles correctly before Style Dictionary has ever run.

## Adding a theme

1. Copy `site/src/content/docs/themes/calm-precise.md`, change `id` (must match the file name), tone, `not`, seed, scale, radius, density.
2. `pnpm check` — the palette is derived and contrast-checked; open the theme page on the site to judge the swatches.
3. Tune with `overrides` only if a derived value is wrong; overrides are still contrast-checked.
4. `generated/prompts/theme.<id>.md` is the "feel" skill for that theme.

## Adding a component

1. Copy `site/src/content/docs/components/button.md`, rename, fill in frontmatter and guidance (see the *Authoring a component* guide on the site).
2. `pnpm check` — fix anything it reports.
3. Add `behavior:` scenarios for what the component does (see the *Authoring a component* guide); the parser derives the obvious ones.
4. `generate.ps1 -Component <Name>` produces the component, stories and test file per platform and runs the gates, or open `generated/prompts/<Name>.<platform>.md` and run it with your AI tool of choice.

## Roadmap

- [ ] Warm & friendly, Bold & expressive, Technical & dense themes
- [ ] Text, Input, Form, Stack components
- [x] `packages/react`, `packages/lit`, `packages/rn` generated from the prompts, with Storybook (first run; see the Generation log on the site)
- [x] Type-check and run the generated packages against real dependencies (typecheck + tests gates)
- [ ] Behavior scenarios and generated tests for every component (Switch and Checkbox author them; run `generate.ps1 -Stale -Extra "--tests-only"` for the rest)
- [ ] Generate `component.schema.json` from `component.ts` (single source)
- [ ] FastMCP server (`mcp/`) exposing components, sections, tokens, contrast check, and `generate(component, platform)`
- [ ] SwiftUI and Compose templates
