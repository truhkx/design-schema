# Design Schema

**Website and docs: [designschema.ai](https://designschema.ai)**

A documentation-first, schema-driven design system generator. One Markdown doc per component (YAML frontmatter = schema, prose = guidance) plus a W3C DTCG token set drive the docs site, props tables, per-platform generation prompts, an MCP server, and generated React / Lit / React Native components.

Open source, for two people: an **adopter** (a business owner and their AI engineer) who writes a one-page theme doc and gets a complete, accessible system on three platforms for free — components are generated once and contain no literal values, so a theme is the whole customisation — and an **owner** who edits the schema itself and regenerates with `pnpm generate` (one component, or `--stale` for every changed doc) or `pnpm regen` (the whole suite in composition order), the only steps that call a model (a dollar or two per component per platform, less on Sonnet, gated by type-check, a literal linter and contrast). See the docs page *Two ways in*.

```
site/src/content/docs/themes/*.md      Stage 1: theme docs — frontmatter = the decisions, body = the feel
tokens/themes/<id>/                    Stages 2–3: DERIVED base.json + light.json/dark.json (do not edit)
tokens/build.mjs                       Style Dictionary → packages/tokens/dist/<id>/{css,js,rn,json}
schema/                                component.ts (Zod, the source of truth; tools/schema.ts derives component.schema.json) + theme.*
site/src/content/docs/components/*.md  Stage 4: component docs — frontmatter = schema, body = guidance
prompts/templates/                     theme.md (the "feel" skill) + web/lit/rn.md (per-component generators)
packages/{tokens,react,lit,rn}/        built tokens + GENERATED components, stories and a sign-in demo per platform
storybook/                             root Storybook composing the three platform Storybooks side by side
tools/theme.ts                         theme doc → OKLCH ramps, scales, contrast-aware semantic mapping (TypeScript; `node --import tsx`)
tools/lib/tokens.ts                    DTCG token resolver (theme × mode) the tools read through
tools/parse.ts                         validates docs → generated/{components,themes}.json + generated/prompts/*.md (TypeScript; `node --import tsx`)
tools/check_contrast.ts + oklch.ts     WCAG contrast for every declared pair × theme × mode × variant (TypeScript; `node --import tsx`)
tools/generate.ts                      `pnpm generate` (parses first; generate.ps1 on Windows): doc → platform code + tests via Claude Code headless, gated by tools/checks.ts; lockfile in generated/
tools/regen.ts + regen-phases.json     `pnpm regen` (regen.ps1 on Windows): every component, phase by phase in composition order, pausing for gap folding
tools/commit.ts                        `pnpm commit`: stage and commit; trailer lines from DS_COMMIT_TRAILERS or `git config ds.commitTrailer`, none by default
tools/checks.ts                        the gates: parse, contrast, literals, typecheck, tests (Vitest / Vitest browser / Jest per platform)
tools/spec_sheet.ts                    every token value and style binding of a theme → the spec-sheet page (TypeScript; `node --import tsx`)
tools/lint_literals.ts                 build gate: no hex/px/ms/font literals in generated packages (TypeScript; `node --import tsx`)
tools/keyboard_tests.ts                `keyboard` block → generated/keyboard/*.spec.ts (Playwright; TypeScript)
tools/behavior_tests.ts                `behavior` scenarios → generated/behavior/*.test.ts(x) (TypeScript)
prompts/conventions/                   one-page package digests the generator reads instead of the whole package
tools/check_deps.ts + check_modules.ts build gates: no new runtime dependency; every declared extension module matches its stub
tools/check_hooks.ts                   build gate: a locked binding keeps its `--ds-*` CSS hook on web and lit (`pnpm gates:hooks`)
tools/gap_digest.ts                    generated/gaps/*.md → SUMMARY.md between regen phases (DOC gaps first, open TOOLING/CODE ledger items by cost)
mcp/                                   MCP server (@modelcontextprotocol/sdk) + the local vector index it searches
tools/__tests__ + mcp/__tests__        the Vitest suite for everything above (`pnpm test:tools`)
tests/gates/                           the Playwright axe gate, run over every story in light and dark
```

Node is the whole toolchain: every tool is TypeScript run by `node --import tsx`, with no build step and no Python.

## Setup

The same steps on every OS:

```sh
# Node 24 (.nvmrc; package.json engines allows 22+)
npm install -g pnpm@10     # or `corepack enable`; package.json packageManager pins the exact version
pnpm install               # native build scripts are pre-approved in package.json
pnpm rebuild               # rebuild the native modules
pnpm typecheck             # tsc --noEmit in every package
pnpm storybook             # all four Storybooks; open http://localhost:6006
```

On Windows, `setup.ps1` and `storybook.ps1` run the same steps and write logs to `logs\`:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
powershell -ExecutionPolicy Bypass -File .\storybook.ps1
```

That is the whole install: Node and pnpm. The tools run straight from source — Node 22.18+/24 strips the types natively, and `tsx` is the devDependency fallback for older 22.x.

What has been verified, and where: CI (`.github/workflows/ci.yml`) runs `pnpm check`, the tools suite (`typecheck:tools`, `test:tools`), `pnpm typecheck`, `pnpm generate:check` and the browser gates (`pnpm gates:browser`) on Ubuntu. The composed Storybook, with the sign-in demo rendering on React, Lit and React Native (react-native-web), was verified on Windows on 2026-09-09. Nothing has been run on macOS.

## Everyday commands

```sh
pnpm check        # derive themes, resolve tokens, validate all docs, build prompts, check contrast
pnpm themes       # just the theme derivation + resolve
pnpm tokens       # build tokens with Style Dictionary
pnpm dev          # rebuild @design-schema/react, then run the public website (apps/website) — this is what deploys (http://localhost:4321)
pnpm site:dev     # run the contributor reference site (site/, Starlight) locally; not deployed (also http://localhost:4321)
                  #   both are Astro on 4321 by default; run both and whichever starts second moves to 4322 —
                  #   check the URL in its console before reviewing, or you are looking at the other app
pnpm storybook    # React (6007) + Lit (6008) + React Native via react-native-web (6009), composed at http://localhost:6006
pnpm storybook:device # the same React Native stories on a phone (Expo Go) for VoiceOver / TalkBack; see below
pnpm typecheck    # tsc --noEmit in every package
pnpm test:tools   # Vitest: color math, the token resolver, theme derivation, contrast, the doc parser, behavior
                  #   scenarios, extensions, patterns, the derived JSON schema, the gates and the MCP tools
pnpm gates:behavior # derive generated/behavior/ from the docs' scenarios, then run those tests in packages/react, lit and rn
                  #   (Lit runs them in a browser: `pnpm exec playwright install chromium` once)
pnpm gates        # every code gate on committed code, no model
pnpm build        # pnpm check, pnpm tokens, lint:literals, generate:check, then rebuild @design-schema/react and the public website (pnpm --filter website build)
pnpm site:build   # the contributor reference site build (pnpm --filter site build); not deployed
pnpm generate --component <Name>   # regenerate one component on web, lit and rn (calls a model; parses first)
pnpm generate --stale              # regenerate every target whose doc changed (calls a model)
pnpm regen --dry-run               # print the full-regeneration plan and every command, start nothing
pnpm mcp:index && pnpm mcp:smoke   # build the MCP server's vector index and smoke-test it (Windows: mcp.ps1 runs the same)
```

pnpm passes arguments through as they are, so put the flags straight after the script name (`pnpm generate --stale`). A bare `--` separator in front of them reaches the tool too, and `generate.ts` rejects it.

`pnpm themes` also writes a fallback `packages/tokens/dist/<id>/css/tokens.css`, so the site styles correctly before Style Dictionary has ever run.

## Storybook on a device

`packages/rn` is verified in the browser through react-native-web, which is what the gates use. Screen readers are not: VoiceOver and TalkBack only exist on a phone. `apps/rn-storybook` is an Expo app (SDK 57, the latest stable; it pins React Native 0.86.3 while `packages/rn` builds and tests against 0.87, because the native modules inside Expo Go have to match the SDK) running `@storybook/react-native` 10 on the device, over the same story files.

```sh
pnpm storybook:device        # starts Expo and prints a QR code
```

Install **Expo Go** on the phone, put it on the same Wi-Fi as this machine, and scan the QR code (Camera on iOS, the Expo Go app on Android). The on-device Storybook opens with the story list at the bottom and an addons panel: Controls, Actions, Backgrounds, and **Theme**, which switches the package `ThemeProvider` between light, dark and system. Turn on VoiceOver (Settings → Accessibility) or TalkBack and swipe through a story.

If the phone cannot reach the machine, start with `pnpm --filter rn-storybook start -- --tunnel`. The story index (`apps/rn-storybook/.storybook/storybook.requires.ts`) is regenerated on start; `pnpm --filter rn-storybook storybook-generate` rebuilds it by hand, and `pnpm --filter rn-storybook typecheck` type-checks the app.

## Adding a theme

1. Copy `site/src/content/docs/themes/calm-precise.md`, change `id` (must match the file name), tone, `not`, seed, scale, radius, density.
2. `pnpm check` — the palette is derived and contrast-checked; open the theme page on the site to judge the swatches.
3. Tune with `overrides` only if a derived value is wrong; overrides are still contrast-checked.
4. `generated/prompts/theme.<id>.md` is the "feel" skill for that theme.

## Adding a component

1. Copy `site/src/content/docs/components/button.md`, rename, fill in frontmatter and guidance (see the *Authoring a component* guide on the site).
2. `pnpm check` — fix anything it reports.
3. Add `behavior:` scenarios for what the component does (see the *Authoring a component* guide); the parser derives the obvious ones.
4. `pnpm generate --component <Name>` (Windows: `generate.ps1 -Component <Name>`) produces the component, stories and test file per platform and runs the gates, or open `generated/prompts/<Name>.<platform>.md` and run it with your AI tool of choice.

## Roadmap

- [ ] Warm & friendly, Bold & expressive, Technical & dense themes
- [ ] Text, Input, Form, Stack components
- [x] `packages/react`, `packages/lit`, `packages/rn` generated from the prompts, with Storybook (first run; see the Generation log on the site)
- [x] Type-check and run the generated packages against real dependencies (typecheck + tests gates)
- [ ] Behavior scenarios and generated tests for every component (Switch and Checkbox author them)
- [x] Generate `component.schema.json` from `component.ts` (single source; `pnpm schema`)
- [ ] MCP server (`mcp/`) exposing components, sections, tokens, contrast check, and `generate(component, platform)`
- [ ] SwiftUI and Compose templates

## Claude Code skills

`.claude/skills/` ships skills that Claude Code picks up when it works in this repository:

- **`create-theme`** — create or revise a theme doc (`site/src/content/docs/themes/<id>.md`) by working out the palette and feel someone wants from a conversation, brand hex codes, reference products or pasted screenshots, then deriving the tokens, checking contrast, and showing how close the result landed to the inspiration.
- **`align-existing-api`** — for an adopter who already has a component library and a brand: inventory their existing API (exports, props, enum values, defaults, events, slots, tags, CSS classes, token names), match each component to its canonical counterpart, and write the naming doc, extension docs and theme doc that make the generated output match — with a plain list of what the schema cannot express.
- **`add-component`** — author a component doc the canonical set lacks: decide it is a component rather than an extension, research the contract from the APG and the reference systems, write every rule into a validated field rather than prose, and hand generation back with its command and cost.
- **`update-fork`** — take a fork through an upstream update: preview what changed, merge, fix the naming keys and extension collisions the update stranded, re-check, and regenerate only the stale targets, with permission and a cost estimate first.
