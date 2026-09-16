---
name: create-theme
description: Create or revise a Design Schema theme doc (site/src/content/docs/themes/<id>.md) by working out what kind of palette and feel someone wants — from a conversation, brand hex codes, reference products, or inspiration images and screenshots they paste in — then deriving the tokens, checking contrast, and showing how close the result landed to the inspiration. Use when someone wants a new theme, a brand palette, to match a look or a screenshot, or to adjust an existing theme's colors, type, corners, density, motion or depth.
---

# Create a theme

A theme doc is Stage 1 of the pipeline: a handful of decisions in frontmatter plus a prose body. `tools/theme.ts` derives every token from the decisions, `tools/check_contrast.ts` proves the contrast, and `tools/parse.ts` turns the body into `generated/prompts/theme.<id>.md`, the standing "feel" instruction every component generator reads. So the job has two halves: pick decisions that reproduce the look, and write prose a generator can act on.

The contract is `schema/theme.ts` (read it for allowed values). The reference doc is `site/src/content/docs/themes/calm-precise.md`; `warm-friendly.md` is the two-seed example. Stage 1 of `site/src/content/docs/process/from-vision-to-system.md` explains the reasoning.

## 1. Find out what they want

Start from what they already gave you. Ask only for what is missing, a few questions at a time, and propose answers they can correct rather than asking open questions you could infer.

- **What it is for and who uses it.** A dashboard used all day and a lifestyle app want different density, scale, motion and depth.
- **Tone:** three to five adjectives, and **the one word it must never be**. The excluded word is the tiebreaker for every borderline call; push for a real one ("playful", "cold", "loud", "corporate"), not "bad".
- **Existing brand:** exact hex values and typefaces from a brand guide beat anything read off an image. Ask for them whenever a precise match matters.
- **Inspiration:** images, screenshots, product names, links. For a link or a Figma file, ask for a screenshot; you can't see a live page's colors from its URL.
- **Modes:** light, dark or both, and which is the default.

List the existing themes (`site/src/content/docs/themes/`). If one is close, say so: adapting it may be what they want. Never overwrite an existing doc unless they ask.

## 2. Read inspiration images

Images arrive pasted into the conversation or as file paths (open those with Read). For each one, write down:

- **Surfaces:** white, tinted (warm cream, cool gray, sand) or dark, and the neutral temperature.
- **Accent:** the color that marks actions and highlights. Judge it by role, not area: a brand accent is often under 5% of the pixels, while the largest colored area is usually a surface or a photo.
- **Ink:** text color, pure black or tinted.
- **Palette kind** (next section).
- **Corners:** square, slightly rounded, clearly rounded, pills.
- **Space:** tight and information-dense, or airy.
- **Type:** serif, geometric or humanist sans, mono; whether display headings are much larger than body (a steep ratio) or close to it.
- **Depth:** real shadows, hairline borders, or flat color blocks.

Motion can't be read from a still; infer it from the tone or ask.

Be honest about precision. Colors read from an image are estimates — compression, screen capture and lighting all shift them — so write them as `≈#3B5BDB` and say a brand guide value will be exact. A mood image that isn't UI (a landscape, a product photo, a painting) gives a hue family and a temperature, not literal UI colors; surfaces taken from photos almost always need lifting much lighter.

With several images, name the common thread and call out conflicts ("the first two are dark and moody, the third is bright pastel — which leads?") instead of averaging them into mud.

## 3. Decide the palette kind

The system builds one brand ramp, one neutral ramp and four status ramps. Every palette has to be said in those terms:

| Palette kind | Looks like | Decisions |
| --- | --- | --- |
| Accent on tinted neutrals | Most product brands: one confident color, grays with a slight cast | `seed.color` = the accent; `neutralTint` 0.1–0.4 |
| Accent on pure grays | Clinical, technical, developer tools | `seed.color` = the accent; `neutralTint` 0–0.05 |
| Ink | Monochrome, editorial, luxury: black buttons, no hue | `seed.color` near-achromatic (OKLCH chroma < 0.03, e.g. `#1C1B1A`): the primary action becomes the darkest neutral on light and the lightest on dark, links take the text color |
| Surface-led (two seeds) | Sand pages with black type, navy with cream | `seed.neutral` = the surface color, `seed.color` = the accent or ink. Leave `neutralTint` out: the schema rejects both together |
| Dark-first | Media, games, night-use apps | Any of the above with `modes.default: dark` |

What it can't say, and what to tell them:

- **Two equal brand colors, gradients or multi-color palettes.** Pick the one that marks actions as `seed.color`; a second color can be the surface (two seeds) or be pinned onto specific tokens with `overrides`, but it gets no ramp of its own.
- **A brand hue that collides with a status hue.** Defaults are danger 25, success 145, warning 80 (OKLCH degrees; info follows the seed). A red or green brand makes errors or success look like branding: move that status hue 15–25° away in `statusHues`.

When the inputs support two kinds (say, accent-on-tinted vs surface-led), show both briefly and recommend one.

## 4. Turn the reading into decisions

Present a short table — decision, value, the evidence it came from — and get a yes before writing.

- **`seed.color`** is the center of the brand ramp, not the button color. The primary action takes the brand step that holds contrast with its label, so a pale seed (`#FFEBBA`) yields a darker button from the same hue, and bright yellows, limes and cyans shift darker on light pages. If they need an exact button color, derive first, compare, then use `overrides` (step 6).
- **`seed.neutral`** becomes the light page lifted (lightness raised by 0.15, capped at 0.96), so give the surface color as seen or slightly deeper. Its chroma is capped at 0.06.
- **`neutralTint`:** 0 pure gray, 0.1–0.2 a subtle cast, 0.3–0.4 clearly warm or cool.
- **`seed.typeface` / `headingTypeface` / `mono`:** `system` or a family name. The system names the family; it doesn't host fonts, so note licensing and loading in the platform notes.
- **`scale`:** `base` 14–16 for apps, 16–18 for reading; `ratio` 1.2 dense/technical, 1.25 balanced, 1.333 editorial.
- **`tuning.lineHeight` / `tuning.fontWeight`:** only when the defaults don't suit the face. Line heights `tight`/`normal`/`loose` run 1.0–2.2 and stay in that order (defaults 1.2/1.5/1.7); weights `regular`/`medium`/`semibold`/`bold` are multiples of 100, ascending (defaults 400/500/600/700). Set only the ones that change.
- **`radius`:** none, sm (2/4/6), md (4/8/12), lg (8/12/16), full (pills). When no preset fits, `tuning.radius` sets the three steps in px (`sm`, `md`, `lg`, 0–48) on top of the nearest preset; `full` stays a pill, and it has no effect with `none`, so the schema rejects the pair.
- **`density`:** compact, comfortable, roomy. **`layout.rhythm`:** tight, normal, loose; **`layout.contentWidth`** 480–1600px.
- **`motion`:** none, subtle, expressive. **`elevation`:** flat (borders and scrims), subtle, pronounced (real shadows).
- **`id`:** kebab-case and equal to the file name. `status: draft` for a new theme.

## 5. Write the doc

Write `site/src/content/docs/themes/<id>.md`: frontmatter with `title`, a one-sentence `description`, and the `theme:` block; then the body under exactly these headings, as in calm-precise:

`## Feel` · `## Not <word>` · `## References` · `## When to use` · `## When not to use` · `## Accessibility` · `## Platform notes` (`### Web`, `### Lit`, `### React Native`)

The body becomes instructions for a model generating components, so write it that way:

- **Feel** describes surfaces, where the accent appears (and where it never does), corners, type, spacing, motion and how emphasis is made. Concrete, not adjectives.
- **Not <word>** is a list of "prefer X over Y" tiebreakers.
- **References** names two or three systems or products to learn from, and what to take from each, plus one look to avoid. When the inspiration was images, describe in words what came from them; the generator never sees the images.

If the `design-schema` MCP server is connected, `write_theme` produces the same shape from structured answers and runs the derivation and contrast check for you; `start_theme` returns the schema's allowed values. Writing the file directly is equally valid.

## 6. Derive, check, compare

From the repository root:

```sh
node --import tsx tools/theme.ts
node --import tsx tools/check_contrast.ts
node --import tsx .claude/skills/create-theme/scripts/preview.ts <id> '#hex' '#hex'
```

`tools/theme.ts` rebuilds `tokens/themes/*/`; never edit those JSON files, they are overwritten. `check_contrast.ts` is the authority: its `✖` lines name a failing pair, theme and mode. Fix a failure by changing a decision (the seed's lightness, `neutralTint`, the palette kind) or an override, never a component.

`preview.ts` prints each mode's page, text, border, button, link and focus colors with their contrast, the brand and neutral ramps, and for every inspiration color you pass, the nearest token and its drift (OKLab distance × 100: under 2 reads as the same color, under 5 as a close relative, over 10 as a different color). Show them this and say plainly where the result moved away from the inspiration and why — usually contrast pushing an accent darker or lighter.

When they want a specific token pinned to an exact value, add it per mode, or under `base` for a base token. A radius step, line height or weight has a named `tuning` value; use that instead:

```yaml
  tuning:
    radius: { sm: 3, md: 6, lg: 10 }
  overrides:
    base:
      space.3: '10px'
    light:
      color.action.primary.background: '#3B5BDB'
    dark:
      color.action.primary.background: '#748FFC'
```

Override paths and values are validated against `schema/tokens.ts`. Use a full path (`color.foreground.default`) or its public name (`color.foreground`), copied from the preview output. A typo, a token under the wrong key or a value of the wrong type fails `tools/theme.ts` before anything is written; the error names the key and the path, says which key a token of the other layer goes under, and shows the value it got. `light` and `dark` reach the per-mode color and shadow tokens. `base` reaches the palette and the type, spacing, radius and motion scales, and is applied before the modes are derived, so the mode colors are chosen against the overridden palette (a palette step must be a `#rrggbb` literal). Target sizes (`size.target.*`) and the focus width (`border.width.focus`) are accessibility floors and can't be overridden, and a token can't be set in both `tuning` and `overrides.base`. Overrides are still contrast-checked, so run step 6 again after adding one.

## 7. Finish

- `node --import tsx tools/parse.ts` writes `generated/prompts/theme.<id>.md` (and refreshes the other generated prompts).
- `pnpm tokens` builds `packages/tokens/dist/<id>/` for CSS, JS and React Native; `pnpm docs` shows the theme page with its derived swatches.
- Summarize what was decided, what drifted from the inspiration and why, and any overrides or tuning added. Don't commit unless asked.
