Give the website a light / dark / system mode control, per site/src/content/docs/process/website-audit.md, section "No dark mode". Read that doc's "Findings" first. Job 540 has landed; the header now carries its own `data-mode="dark"` on `.ds-site-header`.

apps/website/src/layouts/Layout.astro emits `<html lang="en" data-mode="light" data-ds-theme={themeIds[0]}>`. Nothing on the site changes `data-mode`, and `prefers-color-scheme` is never read. Every theme's token sheet ships a complete dark palette under `[data-mode="dark"]`, and forcing that attribute on `<html>` produces a correct, AA-passing page in both themes (the audit measured it), so the palette exists and only the switch is missing.

1. **State.** Add apps/website/src/mode-switch.ts beside theme-switch.ts, mirroring it: `MODE_STORAGE_KEY = 'design-schema:mode'`, values `light | dark | system`, `resolveMode(stored, prefersDark)` → `light | dark`, and an `applyMode` that sets `data-mode` on `document.documentElement` and nothing else. `system` is the default when nothing is stored.
2. **Pre-paint.** Extend the inline `is:inline` script in Layout.astro (the one that applies the stored theme before first paint) to also apply the stored mode, reading `matchMedia('(prefers-color-scheme: dark)')` for `system`, and to keep following the media query while `system` is selected. Remove the hard-coded `data-mode="light"` from the `<html>` tag; the script sets it, and the SSR fallback when scripts are off is `light`.
3. **Control.** In HeaderNav.tsx add a three-way control next to the theme control, built the same way (the generated `SegmentedControl` or the same radio group pattern the theme control uses — match it), labelled "Appearance" with options Light / Dark / System, in both the wide row and the narrow drawer. It writes `MODE_STORAGE_KEY` and calls `applyMode`. The header itself keeps `data-mode="dark"` on `.ds-site-header` regardless of the page mode.
4. **Code blocks.** apps/website/src/components/code.css maps Shiki tokens onto `--color-*` variables; confirm every token colour it uses has a dark value (it should, since they are theme tokens) and that the `.ds-code` surface flips with the page. Fix any literal colour you find there rather than adding a dark override.
5. **Guard.** Extend the Playwright website spec: for each theme × each mode, load `/`, `/docs/`, `/docs/components/button/`, `/docs/components/card/`, `/docs/components/datagrid/`, wait for the theme sheets to settle (poll until a known link's computed `color` equals the expected `color.link` for that theme and mode), then run an AA text-contrast walk over the page body (fg vs effective bg, 4.5:1 normal / 3:1 large, `logs/` has the audit's walker as a starting point) and assert zero failures. Assert `document.documentElement.dataset.mode` follows `prefers-color-scheme` when nothing is stored, and the stored value when there is one.

Gate — all must pass:

    pnpm --filter website build
    pnpm site:routes
    pnpm exec playwright test --config playwright.website.config.ts

`grep -rn 'data-mode="light"' apps/website/dist` returns nothing. The mode survives a reload and a navigation with no flash (assert the attribute is already set at `DOMContentLoaded`).

Do not modify `packages/*/src`, `packages/tokens`, `prompts/`, or any theme doc. This job adds a switch; it does not change what any token resolves to.
