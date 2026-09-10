The theme model has one seed color, so a palette of "warm sand surfaces with near-black actions" cannot be expressed: neutrals only take a faint cast (0.03 x neutralTint chroma) from the seed hue, and an achromatic seed would make dark mode's primary fill a mid gray. Extend tools/theme.py, schema/theme.schema.json and schema/theme.ts (keep all existing themes valid and their token output byte-identical when the new fields are absent):

1. `seed.neutral` (optional hex): when present, the neutral ramp takes its hue from this color and its chroma from min(that color's chroma, 0.06) instead of 0.03 x neutralTint; the lightest neutral step (the light-mode page background) uses lightness min(seed.neutral L + 0.15, 0.96) so a sand seed gives a sand page rather than white, and the darkest step keeps the hue at low chroma so dark mode is a warm black. Every contrast-chosen step (foreground, muted, borders, control fills) is still chosen by the existing contrast rules against the new backgrounds — add tests that all 51 components' declared pairs pass with a sand neutral (run tools/check_contrast.py in the test).
2. Achromatic brand rule: when the seed color's chroma is below 0.03, treat the brand as "ink": light mode primary action background = the darkest neutral step with light ink; dark mode primary action background = the lightest neutral step with dark ink (the inverse), links = foreground color (Link already underlines, so color is not the only cue — confirm the Link doc says so; if not, add the sentence), focus ring = the brand step that passes 3:1 on both page and control surface, and status hues unchanged. `color.control.selectedBackground` follows the same inversion.
3. Theme schema docs: describe both fields in the schema descriptions and in site/src/content/docs/process/from-vision-to-system.md (a short "Two-seed palettes" paragraph: use `seed.neutral` when the surfaces are the brand, as in sand-and-black or navy-and-cream schemes).
4. Then replace site/src/content/docs/themes/warm-friendly.md with the content below (Tony's intent: the warmth of a tan-and-black palette, done as our own values, not anyone's brand assets), run `node tools/py.mjs tools/theme.py`, `tools/check_contrast.py` (0 failures) and `pytest -q`.

---- warm-friendly.md ----
---
title: Warm & friendly
description: Sand surfaces with near-black type and actions, medium radii, a roomy rhythm and unhurried motion. Warm without being loud; the second theme, and the first two-seed palette.
theme:
  id: warm-friendly
  status: review
  tone: [warm, tactile, calm, confident]
  not: loud
  seed:
    color: '#1E1A16'
    neutral: '#C9B99C'
    typeface: system
    mono: system
  neutralTint: 0.6
  scale: { base: 16, ratio: 1.25 }
  radius: md
  density: roomy
  motion: subtle
  elevation: flat
  layout: { rhythm: loose, contentWidth: 1040 }
  modes: { default: light, supports: [light, dark] }
---

Warm & friendly is a small business that wants to feel like a well-made object rather than a website: a coffee roaster, a furniture maker, a studio. The page is sand, not white; the type and the buttons are a warm near-black; nothing shouts. It borrows the confidence of matte consumer hardware — the kind sold on a tan page with black type — without borrowing anyone's brand: the values here are ours, derived from two seeds.

## Feel

Surfaces are sand in light mode and warm black in dark mode; there is no pure white or pure black anywhere. The primary action is ink on sand (and sand on ink in dark mode), so a button reads as the most solid thing on the page rather than the most colorful. Links are the text color with an underline. Corners are medium: rounded enough to feel handled, not pill-shaped. Type is the system face at a 1.25 scale, with hierarchy from weight and space. Spacing is roomy and the rhythm between sections is loose; elevation is flat, so surfaces are told apart by tone, not shadow.

## Not loud

When a decision is borderline: prefer the quieter tone, the flatter surface, the plainer label, the smaller motion. Status colors appear only where status is real (an error, a success message), never as decoration. If an element needs attention, give it space and ink, not color.

## References

The restraint of matte consumer hardware storefronts (tan paper, black type, one product per screen), the tonal layering of Kinfolk-style editorial layouts, and the flat, tone-separated surfaces of Notion's light theme. Avoid saturated accents, gradients, and glassy overlays.

## When to use

Product-led small businesses with photography to show; brand sites; anything where the object is the hero and the interface should feel like packaging.

## When not to use

Dense tools and data-heavy admin screens: the roomy rhythm and flat elevation cost density and separation. Use calm-precise there.
