---
title: From vision to system
description: The five stages that take a brand idea to generated, documented, accessible components — and what each stage produces.
sidebar:
  order: 1
---

Design Schema is built so that **design decisions are made once, early, in plain language**, and then flow downhill into tokens, documentation, and generated code. This page is the map. Every other page on the site belongs to one of these stages.

## The five stages

| Stage | Question it answers | Input | Output (an artifact in the repo) |
| --- | --- | --- | --- |
| 1. Theme | *How should it feel, and what few decisions define that?* | A conversation | `site/src/content/docs/themes/<id>.md` — tone, the word it must not be, seed color & type, ratio, radius, density |
| 2. Foundations | *What are the raw materials?* | The theme doc | `tokens/themes/<id>/base.json` — derived palettes, type scale, spacing, radius |
| 3. Semantics | *What do the materials mean?* | Foundations | `tokens/themes/<id>/{light,dark}.json` — `foreground`, `background`, `action.primary`… |
| 4. Components | *How do people use it?* | Semantics + patterns from MUI, Primer, etc. | `components/*.md` — schema + guidance |
| 5. Generation | *What ships?* | Component docs + platform templates | `generated/prompts/*` → `packages/{react,lit,rn}` |

The stages are ordered by **how expensive they are to change later**. Renaming a tone word costs nothing; renaming a semantic token after forty components reference it is a migration. So the process front-loads the cheap, high-leverage decisions.

## Stage 1 — The theme doc (the first interaction)

The first interaction with the system is **not** "here are my Style Dictionary overrides." Overrides are an output, and asking for them first skips the reasoning that makes them coherent. The first interaction is choosing a theme — or authoring one, through a short structured conversation that produces a theme doc.

A theme doc is a Markdown file like every other doc in the system: the frontmatter holds the handful of decisions everything else is derived from, and the body describes the feel in words. Because it is Markdown it is versioned with everything else, rendered on this site with its derived swatches, and turned into a standing "feel" prompt (`generated/prompts/theme.<id>.md`) that the MCP server can hand to any AI tool so generated work inherits the vibe, not just the hex codes.

The frontmatter decisions, in order of leverage:

**Tone and the excluded word.** Three to five adjectives and one word the theme must never be. "Calm, precise, quiet — not playful." The excluded word is the tiebreaker for every borderline decision, and it is what prevents the gray "AI default" look.

**A seed.** One brand color and one typeface. The neutral, brand and status ramps are all derived from the color; `neutralTint` controls how much of its hue bleeds into the grays.

**Two-seed palettes.** Some brands are their surfaces: sand pages with near-black type and buttons, navy pages with cream. One seed cannot say that, because the grays only take a faint cast from the brand hue and an achromatic brand would leave dark mode's primary fill a mid gray. Set `seed.neutral` to the surface color: the neutral ramp takes its hue and chroma, the light page becomes that color lifted rather than white, and the darkest neutral stays a warm black. When `seed.color` itself is near-achromatic, the brand is treated as ink — the action fill is the darkest neutral on a light page and the lightest on a dark one, links take the text color (Link always underlines), and the focus ring is the brand step that reads at 3:1 on both surfaces. Every contrast-chosen step is still chosen against the new surfaces, and the build still proves every pair. See [Warm & friendly](/themes/warm-friendly/) for the first two-seed theme.

**Scale, radius, density.** A base size and modular ratio (1.2 dense/technical, 1.25 balanced, 1.333 editorial), a radius preset, and a spacing multiplier. The tone usually dictates these: "precise" wants small radii and a tight ratio; "friendly" wants the opposite.

**Modes.** Which of light and dark the theme supports, and which is the default. Both are derived and both are contrast-checked.

The body then covers: **Feel** (surfaces, accent use, corners, type, motion, how emphasis is made), **Not …** (how the excluded word resolves borderline calls), **References** (systems to learn from and one to avoid), when to use and not use the theme, accessibility, and platform notes. See [Calm & precise](/themes/calm-precise/) for the complete example. Several themes can coexist; adopters pick one as their starting point or write a new doc.

## Stage 2 — Foundations: derived palettes and scales

`tools/theme.ts` reads each theme doc and writes the raw materials as DTCG tokens to `tokens/themes/<id>/base.json`:

- A **neutral ramp** (12 steps, 0–1000) tinted toward the brand hue by `neutralTint`, so grays feel like they belong.
- A **brand ramp** (50–900) around the seed color, generated in OKLCH so steps are evenly spaced to the eye and hue does not drift as lightness changes. Chroma peaks at the seed's lightness and tapers toward the ends, so tints and shades stay clean.
- **Status ramps** for danger, success, warning, info (hues are theme-configurable).
- A **type scale** from `scale.base` and `scale.ratio`, a **spacing scale** on a 4px grid times the density multiplier, a **radius scale** from the preset, and **target sizes** (24px minimum, 44px comfortable).

Nothing in Stage 2 has a *meaning* yet; these are just well-formed materials. That is deliberate: it lets a theme change regenerate this file wholesale without touching anything downstream.

## Stage 3 — Semantics: giving materials meaning

The semantic layer is what components are allowed to reference. It maps roles to raw values, once per theme:

- `color.foreground`, `color.foreground.strong`, `color.foreground.muted`
- `color.background`, `color.background.subtle`, `color.background.strong`
- `color.border`, `color.border.focus`
- `color.action.{primary,secondary,ghost,danger}.{background,foreground,backgroundHover}`

Light and dark are two files with identical names and different values. Components never know which theme or mode is active. The generator chooses ramp steps for each role so that the declared contrast floors hold (for example, the primary action background is the lightest brand step that reaches 4.5:1 against white), and then `tools/check_contrast.ts` proves it by resolving every pair every component declares, for every theme and mode, and failing the build if any misses its WCAG level.

**This is where overrides finally show up** — as the answer to "I already have a brand; the derived value isn't right." A theme doc's `overrides` block sets explicit values per mode by token path. They are applied after derivation and are still contrast-checked, so an override can tune the system but cannot break it.

## Stage 4 — Components: schema plus guidance

Each component is one Markdown file with YAML frontmatter. The frontmatter is the schema (props, events, style bindings, accessibility requirements, platform mapping) and the body is guidance under a fixed set of headings. See [Authoring a component](/guides/authoring-a-component/) for the contract and [Button](/components/button/) for a complete example.

Component *choices* — which components exist, which props they have, what the guidance says — are researched from public systems. The standing reference set is the W3C ARIA Authoring Practices Guide for interaction patterns (see the [component roadmap](/process/component-roadmap/) for the full pattern-to-component map), with Material Design 3, GitHub Primer, Atlassian Design System, Shopify Polaris, and Adobe Spectrum for scope and content guidance. When they disagree, the APG wins on behavior and the theme wins on look.

## Stage 5 — Generation

`tools/parse.ts` validates every component and theme doc and assembles prompts from `prompts/templates/` into `generated/prompts/`. There are two kinds. `theme.<id>.md` is the standing "feel" instruction for a theme: identity, the decisions, the resolved semantic tokens, and the guidance body — a skill an AI reads before touching anything. `<Component>.<platform>.md` is self-contained per component and platform: rules for the platform, the full schema, the platform notes, and the guidance. Running one produces the component file for that platform. Together they are the "mini-skills"; the MCP server will expose them as tools so any AI client can call `generate(component, platform, theme)`.

## Why documentation comes first

If the docs are generated from the code, they lag and rot. If the code is generated from the docs, the docs cannot be wrong without the build breaking. The second arrangement is the only one that stays true over time, and it has a bonus: everything the MCP server needs to serve to an AI — schema, guidance, tokens, contrast results — already exists as build outputs.
