Fix SidePanel and ActionSheet on web, then fold the fixes back so the next regen keeps them, per site/src/content/docs/process/website-audit.md, sections "SidePanel is broken, and the site's own mobile drawer uses it" and the ActionSheet row. Read that doc's "Findings" first. Jobs 540 to 542 have landed.

Two observed failures. **SidePanel:** on the site's hamburger drawer at phone width, pressing "Open menu" sets `aria-expanded="true"` and moves focus into the panel, but the surface stays at `translateX(-100%)` (its rect is x = −240px), so keyboard focus is trapped inside an invisible panel; every SidePanel example on its docs page fails the same way when its trigger is pressed. packages/react/src/SidePanel.css slides the surface in with `.ds-side-panel__surface--visible { transform: none }`, so the class is not being applied after open. **ActionSheet:** its docs page throws "Hydration failed because the server rendered HTML didn't match the client" and the Default example is an empty 24px card containing a stray `Menu`; packages/react/src/ActionSheet.tsx decides sheet-versus-Menu with `window.matchMedia` at render time (around line 147), so the server renders one branch and the client the other.

One complication first: apps/website imports the React package from packages/react/dist, which was built 2026-09-19, while packages/react/src was regenerated on 2026-09-21. Step 1 settles whether the site is showing stale output or a broken regen before anything is edited.

1. **Establish the baseline.** `pnpm --filter @design-schema/react build`, restart `pnpm dev`, and re-test the drawer at 390px and the SidePanel "Default" example. Record in your summary which of the two failures survive the rebuild. If both vanish, this job's component work is only step 4; if not, continue.
2. **SidePanel.** Trace why `ds-side-panel__surface--visible` is never added: the likeliest causes are the two-frame open sequence (mount closed, then flip to visible on the next frame) never firing its second step, or `data-state` / the visible flag being keyed on a prop that the trigger path does not set. Fix it in packages/react/src/SidePanel.tsx, then run the generated behavior tests: `pnpm --filter @design-schema/react exec vitest run generated/behavior/SidePanel.web` and the Lit equivalent. Check the same open sequence in packages/lit/src and packages/rn/src and fix it there if it is the same bug.
3. **ActionSheet.** The wide/narrow choice must not diverge between server and client. Render the sheet branch on the server and during hydration (no `matchMedia` before mount), then switch to `Menu` in an effect after mount when the viewport is wide — or, if the doc's platform notes say the web form is always the sheet, drop the Menu branch and say so. Zero hydration errors on the docs page is the bar. Run `generated/behavior/ActionSheet.web` and `.lit`.
4. **Fold back.** Each fix is a generator finding: add the rule to prompts/conventions/ (the web convention file, in the section on overlays / open state, and the section on SSR-safe rendering — no `window` reads before mount) so the next `generate.ps1 -Stale` does not reintroduce it. If the rule is already there and the regen ignored it, say so; that is a prompt-quality finding for phase 5, not something to patch around here.
5. **Rebuild** `@design-schema/react` and `@design-schema/lit` so the website and Storybooks import the fixed output.

Gate — all must pass:

    pnpm --filter @design-schema/react build
    pnpm --filter @design-schema/lit build
    pnpm gates:behavior
    pnpm --filter website build
    pnpm exec playwright test --config playwright.website.config.ts

Under Playwright at 390×844 the site's drawer surface has `transform: none` and a bounding box inside the viewport within 400ms of the click, and focus is on a visible link inside it; ActionSheet's docs page logs zero console errors on load. The two expected-failure markers job 542 may have left for these components are removed.

Do not modify `prompts/templates/` or any component doc. Convention files under `prompts/conventions/` are the only prompt edits allowed, and each one is listed in the summary with the rule it adds.
