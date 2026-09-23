---
title: Website audit, 2026-09-23
description: What is wrong with apps/website as of the 2026-09-23 dev build, measured in a real browser, and the job plan to fix it.
sidebar:
  order: 12
---

Measured against `pnpm dev` (apps/website) on 2026-09-23 in the Claude desktop browser pane: every one of the 51 component pages was loaded, every example tab clicked, the two themes switched through the header control, and `data-mode` flipped between light and dark. Contrast was computed from live `getComputedStyle` values after the theme sheets settled. Everything below was observed, not inferred.

## The short version

Three things account for most of what looks wrong. The header lost its dark band because the regenerated `Landmark` drops `className`, so `header.css` no longer applies to anything. There is no dark mode at all — `data-mode="light"` is hard-coded and the system preference is ignored — so the page can never use the dark palette the tokens already ship. And the overlay components (Dialog, AlertDialog, BottomSheet, SidePanel, ActionSheet, and half of Popover and Tooltip) have no working example on their pages, because the example pipeline refuses any story that needs a wrapper and shows a notice instead of a trigger.

The token system itself is sound: with the theme switch given time to settle, every page measured passes WCAG AA text contrast in all four combinations (calm/warm × light/dark). The "warm and friendly" theme is not broken — it is a near-black-on-sand palette by its own definition — but nothing on the site currently shows it off, and the header regression makes every theme look the same.

## Findings

### Examples that do not work

| Component | What the page shows | Cause |
|---|---|---|
| Dialog | 15 of 16 examples show "This story does not render from its args alone" and no demo; "Closed" is an empty 0px card | Stories rely on a Storybook decorator for the trigger; the site has no trigger harness |
| AlertDialog | 10 of 11 notice-only; "Closed" empty | Same |
| BottomSheet | 6 of 6 notice-only | Same |
| SidePanel | Every example renders only a "Menu" icon button; clicking it does nothing | Component bug (below), not just a harness gap |
| ActionSheet | React hydration mismatch error on load; "Default" is an empty 24px card containing a stray `Menu`; "Closed" empty | Component bug + harness gap |
| Popover | "Default" and "Keyboard" notice-only, and "Default" also says "No React story covers this scenario" (no code either). The other 18 render a trigger and open correctly (verified) | Two decorator-only stories |
| Tooltip | 5 placement examples and "Keyboard" notice-only; "Default" works on hover | Decorator-only stories |
| Select / DatePicker / DataGrid | "Keyboard", "Open", "Many Rows" notice-only; everything else works | Decorator-only stories |
| Divider | 5 examples render a 1px line in an otherwise empty card and read as blank | Example needs surrounding content |
| Stack | "Wrap" and "Wrapping Filters" render empty | Story args need children |
| Slider | "Effort With Marks" overflows its card by 22px | Mark labels ignore container width |
| Examples (all pages) | React warns about two children with the same key `Tab` | Two examples share a title on at least the Card page |

Everything else — 40 of 51 pages — renders every example, and Menu, Combobox, Select, DatePicker, Toolbar (no tabindex loop, roving works) and Popover all open and behave when driven.

### SidePanel is broken, and the site's own mobile drawer uses it

Opening the hamburger menu at phone width sets `aria-expanded="true"`, moves focus into the drawer, and the drawer stays at `x = -240px`, off-canvas, with `data-state` never set. Keyboard focus is now trapped inside an invisible panel. The same failure is why every SidePanel example on its docs page does nothing when its trigger is pressed. `packages/react/src/SidePanel.tsx` was regenerated on 2026-09-21; `packages/react/dist` (what the website imports) was built 2026-09-19, so the page may be showing a stale component, a broken regenerated one, or both — the job below determines which before fixing.

### The header lost its styling

`Header.astro` renders `<Landmark role="banner" className="ds-site-header" data-mode="dark">`. The regenerated `Landmark` (`packages/react/src/Landmark.tsx`, regens of 09-16, 09-17 and 09-21) declares `Omit<…, 'className'>` and hard-codes `className: 'ds-landmark'`, so `ds-site-header` never reaches the DOM and all eight rules in `header.css` match nothing: no dark background, no `color`, no full-width centered link row. `data-mode="dark"` on the banner still flips the token variables (the header's `--color-background` resolves to `#1a1815`) but nothing consumes them, so the header is transparent with body-colored text. The 2026-09-19 static build still had the dark header; this is a regression from the regen.

### No dark mode

`<html data-mode="light">` is emitted by the server with no toggle and no `prefers-color-scheme` handling; the machine this was measured on prefers dark and got light. Forcing `data-mode="dark"` on `<html>` produces a correct, contrast-passing dark page in both themes, so the palette is ready and only the switch is missing.

### Theme switching

The header control works, but the swap (flipping `media` on two `<link>` tags) takes up to about a second to fully apply, during which links and buttons briefly show the previous theme's colors. The choice lives in `localStorage` only, so a warm-theme visitor gets a flash of calm on every load. Neither is a contrast failure once settled.

### Contrast

Measured live, after settling, on Card, Button, home and docs pages: zero AA text failures in calm/light, calm/dark, warm/light and warm/dark. The header is readable in every combination only because it currently has no background; once the dark band returns, its text must come from the dark tokens (which `data-mode="dark"` already provides) rather than inherit from the body.

### Workflow hazards found along the way

The website imports `@design-schema/react/index.css` and the React package from `packages/react/dist`, so a regen that does not rebuild the package leaves the site showing old components; nothing in `pnpm dev` guards this. The twelve `tokens/themes/*/*.json` files show whole-file diffs (3,161 insertions and 3,161 deletions) that are line-ending churn from job 606's run, not token changes — they will pollute the next commit unless normalized. `pnpm docs` used to start the Starlight contributor site on the same port the website wants; that was renamed to `pnpm site:dev` on 09-23 and `pnpm dev` now starts the website.

## Plan

Six jobs, in the 540 series, in this order. Each follows the 5xx conventions: numbered steps, a gate block, a "do not modify" line. 540 to 542 are the ones a visitor notices; 543 is the component work; 544 and 545 are hygiene.

**540 — Header: restore the dark band without depending on `className`.** Generated components do not accept `className` (that is the styling contract, and the regen was right to enforce it), so `Header.astro` stops passing one. Either render the banner as a plain `<header class="ds-site-header" role="banner" data-mode="dark">` around the generated `Container`/`Stack` row, or keep `Landmark` and wrap its children in a `<div class="ds-site-header">` that carries `data-mode`. Gate: computed background of the banner is the theme's dark `color.background` in both themes, header links use the dark `color.link`, and a Playwright check asserts both at 1280px and 390px.

**541 — Dark mode: a mode control next to the theme control.** Light / dark / system, persisted with the same `localStorage` key pattern the theme uses, applied by the same pre-paint inline script so there is no flash, defaulting to `prefers-color-scheme`. The header keeps its own `data-mode="dark"` regardless. Gate: the four theme × mode combinations pass the live contrast check on home, docs, and three component pages; the `astro build` output contains no hard-coded `data-mode="light"`.

**542 — Overlay examples: a schema-driven trigger harness instead of the notice.** In `Examples.tsx`, any component whose schema declares an `open` prop and an `onClose` (or `onOpenChange`) event renders inside a small harness: a Button labeled from the example ("Open dialog", "Show sheet") that sets `open`, with the component's own close wiring turning it back off. The harness is chosen from the schema, not a hand list, so a new overlay component gets it for free. Examples titled "Closed" and the decorator-only "Keyboard" stories are excluded from the site (they exist for Storybook), and the "does not render from its args" notice is kept only for the residue. Gate: Dialog, AlertDialog, BottomSheet, SidePanel, ActionSheet, Popover Default and the five Tooltip placements each open from their trigger under Playwright, restore focus on close, and `pnpm site:routes` still passes.

**543 — SidePanel and ActionSheet: fix the components, then rebuild what the site imports.** First determine whether the site is showing stale `dist` or a broken regen: rebuild `@design-schema/react`, reload, re-test the drawer. Then fix what remains — SidePanel never sets `data-state`/its open transform; ActionSheet's server and client render differ (the stray `Menu`) — and fold each fix back into `prompts/conventions` so the next regen does not reintroduce it. Gate: the site's hamburger drawer slides in at 390px and traps focus visibly; ActionSheet's page loads with zero hydration errors; the behavior tests for both pass on web and lit.

**544 — Example hygiene.** Divider and Stack "Wrap" examples get surrounding content so they show something; Slider mark labels respect the container; the duplicate `Tab` key is fixed at the source (two examples sharing a title get distinct ids); example tab rows scroll horizontally with a visible affordance at narrow widths; Popover "Default" either gets a real React story or is removed from the site. Gate: the example-render audit script (kept in `logs/`) reports zero `empty`, `notice-only` or `overflowX` entries across all 51 pages; zero React key warnings in the console across a full-site Playwright pass.

**545 — Dev workflow guards.** `pnpm dev` runs `pnpm --filter @design-schema/react build` (or the website's Vite config aliases the package to `packages/react/src` in dev) so a regen cannot leave the site stale; a `.gitattributes` line normalizes `tokens/themes/**/*.json` to LF and the twelve churned files are re-derived once so the diff disappears; `apps/website/README.md` documents both. Gate: `git diff --stat tokens/themes` is empty after `pnpm themes`; a fresh clone's `pnpm dev` serves the current source components.

What is deliberately not in this plan: the warm theme's palette. It is near-black on sand by design and passes contrast; if it should be warmer than that, that is a theme-doc decision (its `seed.color`), not a website bug.
