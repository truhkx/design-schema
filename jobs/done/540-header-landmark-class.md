Restore the site header's dark band and layout, per site/src/content/docs/process/website-audit.md, section "The header lost its styling". Read that doc's "Findings" first.

apps/website/src/components/Header.astro renders `<Landmark role="banner" className="ds-site-header" data-mode="dark">`. The regenerated `Landmark` (packages/react/src/Landmark.tsx, regens of 2026-09-16/17/21) declares its props as `Omit<HTMLAttributes<HTMLElement>, … | 'className' | 'style'>` and hard-codes `className: 'ds-landmark'`, so `ds-site-header` never reaches the DOM and every rule in apps/website/src/components/header.css matches nothing: the banner is transparent, inherits the body's text colour, and the link row is not centred. `data-mode="dark"` on the banner still flips the token variables (the element's `--color-background` resolves to the dark value) but nothing consumes them. The 2026-09-19 static build had the dark header; this is a regression from the regen, and the regen was right: generated components do not take `className` (foundations/styling-and-overrides.md). The site must stop relying on it.

1. **Markup.** In Header.astro keep `Landmark role="banner"` (the site is built from the generated components; that stays true) and give it a single child `<div class="ds-site-header" data-mode="dark">` that wraps the existing `Container` → `Stack` row. Move `data-mode="dark"` off the Landmark onto that div, so the dark variables and the CSS that consumes them live on the same element. Do not pass `className` to any generated component anywhere in apps/website/src; grep `className=` in the .astro files and fix any other instance the same way.
2. **CSS.** header.css already targets `.ds-site-header`; make sure `background`, `color`, `border-block-end` and the `__wide` / `__narrow` layout rules resolve on the new div. The banner's text must come from the dark tokens under `[data-mode="dark"]` (`--color-foreground`, `--color-link`), never from the page.
3. **Drawer.** HeaderNav.tsx's narrow menu is a SidePanel portaled to `<body>`; confirm it still inherits the page's mode, not the header's, exactly as header.css's comment says. If job 543 has not landed yet the drawer may still fail to slide in; that is 543's, not yours — say so rather than touching packages/react.
4. **Guard.** Add a Playwright spec under tests/website/ (the config is playwright.website.config.ts) that, at 1280×900 and 390×844, in both published themes, asserts: the banner's computed `background-color` equals the theme's dark `color.background` (read it from `@design-schema/tokens/<theme>/dark`), a header link's computed `color` equals the dark `color.link`, and at 1280 the three nav links are horizontally centred between the logo and the theme control (their bounding box midpoint within 8px of the row's midpoint).

Gate — all must pass:

    pnpm --filter @design-schema/react build
    pnpm --filter website build
    pnpm site:routes
    pnpm exec playwright test --config playwright.website.config.ts

`grep -rn "className=" apps/website/src --include=*.astro` returns nothing that targets a `@design-schema/react` component. The audit's header screenshot (browser pane, warm theme) is reproduced dark.

Do not modify `packages/*/src`, `prompts/`, or any component doc. Do not add `className` support to Landmark.
