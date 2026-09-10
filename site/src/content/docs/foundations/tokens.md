---
title: Design tokens
description: How color, typography, spacing and size are defined once and delivered to every platform.
---

Tokens are stored in the [W3C Design Tokens (DTCG) format](https://www.designtokens.org/) under `tokens/themes/<id>/` and built with Style Dictionary into CSS custom properties, JavaScript modules, React Native objects, and flat JSON under `packages/tokens/dist/<id>/`. Every value a component uses comes from a token; no component file contains a raw color, size, or font.

Token files are **derived, not authored**. `tools/theme.py` generates them from the decisions in each [theme doc](/themes/calm-precise/); edit the theme, not the JSON.

## Two layers per theme

**Base** (`base.json`) holds raw materials: palettes as numbered ramps (`color.palette.brand.500`), the type scale, spacing, radius, and target sizes. Components must never reference these directly.

**Semantic** (`light.json`, `dark.json`) gives materials meaning. The mode files have identical token names and different values, so a mode switch is a value change, not a code change. On the web, the theme is selected by importing its CSS and the mode by `data-mode="dark"` on the root element.

## Naming

Semantic names describe role, not appearance: `color.foreground` not `color.gray800`. A `default` leaf is dropped from output names so the common case reads naturally:

| Token path | CSS | JS / RN |
| --- | --- | --- |
| `color.foreground.default` | `--color-foreground` | `colorForeground` |
| `color.foreground.strong` | `--color-foreground-strong` | `colorForegroundStrong` |
| `color.action.primary.background` | `--color-action-primary-background` | `colorActionPrimaryBackground` |
| `space.md` | `--space-md` | `spaceMd` (`12` in RN, `12px` on web) |

## The semantic vocabulary

- `color.foreground` (`.strong`, `.muted`, `.onAction`, `.danger`) — text and icons
- `color.background` (`.subtle`, `.strong`) — surfaces, in increasing elevation
- `color.border` (`.strong`, `.focus`) — dividers and the focus ring
- `color.action.<variant>.{background, backgroundHover, foreground}` — interactive fills; `<variant>` is `primary`, `secondary`, `ghost`, `danger`
- `color.link.{default, hover, visited}` — link text, all three at 4.5:1 on the page in both modes
- `color.control.{background, border, selectedBackground, selectedForeground, trackOff}` — checkboxes, radios and switches; the selected fill is chosen per mode so it meets 3:1 against both the page and the control surface while its ink meets 4.5:1 (dark mode lands on a lighter brand step with dark ink)
- `color.status.<tone>.{background, foreground, border, icon}` — alerts and meters; `<tone>` is `info`, `success`, `warning`, `danger`; `foreground` is the darkest passing text on the tinted surface, `icon` the step that meets 3:1 on the page
- `opacity.disabled`, `motion.duration.{fast, base, loop}`, `motion.easing.{standard, exit}` — derived from the theme's `motion` decision
- `color.overlay.{scrim, surface}` — the modal backdrop (a translucent ink) and the surface overlays sit on (the page background in light mode, one step lighter than the page in dark mode)
- `color.inverse.{surface, foreground, muted, link, focus}` and `color.inverse.status.<tone>` — the flipped surface Tooltip and Toast use (dark on light, light on dark), every step chosen for contrast against it
- `shadow.{raised, overlay}` — DTCG shadow objects scaled by the theme's `elevation` decision (`flat` removes them); CSS box-shadow strings on web, iOS shadow props plus Android elevation on React Native
- `layer.{base, raised, dropdown, sheet, dialog, toast}` — stacking order as plain numbers, identical on every platform
- `font.family.{body, heading, mono}`, `font.weight.*`, `font.size.{xs…4xl}`, `font.lineHeight.*`
- `space.{0…20}` on a 4px grid, with `space.{sm, md, lg}` as the aliases components use inside themselves
- `layout.gap.{none, tight, normal, loose, section}`, `layout.inset.{none…xl}`, `layout.section.{sm, md, lg}`, `layout.gutter.{narrow, default, wide}`, `layout.maxWidth.{prose, content, page}` — rhythm *between* components and at page level, scaled by density and the theme's `layout.rhythm`; see [Layout and rhythm](/foundations/layout/)
- `radius.{none, sm, md, lg, full}`, `border.width.{thin, focus}`
- `size.target.min` (24px, WCAG 2.5.8 AA) and `size.target.comfortable` (44px, AAA and platform guidelines)

## Accessibility is checked at build time

Component docs declare which foreground/background token pairs they render together. `tools/check_contrast.py` resolves those pairs for every enum value and every theme and fails the build below the declared WCAG level. Changing a palette value that breaks a button in dark mode is caught before it ships.

## Building

```sh
pnpm themes        # tools/theme.py derives tokens/themes/<id>/*.json, then tools/tokens.py resolves them
pnpm tokens        # Style Dictionary → packages/tokens/dist/<id>/{css,js,rn,json}
```
