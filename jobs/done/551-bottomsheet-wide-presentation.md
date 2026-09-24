Make BottomSheet a sheet at every width, per site/src/content/docs/process/website-audit-2.md, section "BottomSheet on wide screens". Read that section first.

site/src/content/docs/components/bottomsheet.md says the component "rises from the bottom edge on phones and behaves as a Dialog on wide screens": above `layout.maxWidth.prose` (the `maxWidth` binding, locked, "the breakpoint only") the web and Lit implementations render a centered `Dialog` of size md. Measured on 2026-09-24: at 375px the sheet slides up from the bottom edge correctly (translateY 176 → 0 over ~300ms, bottom-anchored, full width); at 1280px every example opens a centred Dialog indistinguishable from the Dialog page. Tony's decision: a bottom sheet is always a sheet — anchored to the bottom edge and rising from it — and on a wide screen it is width-capped and centred, not converted into a different component.

1. **Doc.** Rewrite bottomsheet.md so the presentation is one thing at every width:
   - `description`: a modal surface that rises from the bottom edge; on wide viewports it keeps that presentation, capped in width and centred.
   - `maxWidth` (still `layout.maxWidth.prose`, still locked): now the sheet's own maximum inline size, centred with equal inline margins; it is no longer a breakpoint.
   - `radius`: top corners only, at every width.
   - The safe-area bottom inset, the drag handle, drag-to-dismiss and the scrim behave identically at every width.
   - Remove every "renders as a Dialog / wide Dialog presentation / forwarded to Dialog above the breakpoint" clause (hideHeading, dismissible, layer, inset, and the platform notes), and the `DIALOG_FORWARDED` idea with it. Keep `apg: dialog-modal` and every a11y requirement — it is still a modal dialog semantically.
   - rn: the same on tablets (width > token): capped and centred at the bottom.
   Record every field changed as `field — before → after`.
2. **Gate the doc.** `pnpm check` and `node --import tsx tools/schema.ts --check` green; contrast and locked-binding invariants unchanged.
3. **Regenerate** BottomSheet on web, Lit and rn: `pnpm generate --component BottomSheet` (calls a model; this is the reconciliation case job 715 wrote guidance for). Then `pnpm gates` for the three packages and `pnpm gates:behavior`.
4. **Rebuild** `@design-schema/react` and `@design-schema/lit`.
5. **Check the site.** At 1280×900 and 375×812 every BottomSheet example opens from its harness button as a surface whose bottom edge is the viewport's bottom edge, whose width is `min(viewport, layout.maxWidth.prose)` centred, and which slides up (sample the transform at 50ms and 400ms). Add this to tests/website/overlay-harness.spec.ts.

Gate — all must pass:

    pnpm check
    node --import tsx tools/schema.ts --check
    pnpm gates
    pnpm gates:behavior
    pnpm --filter website build
    pnpm exec playwright test --config playwright.website.config.ts

Do not modify `prompts/templates/` or any doc other than bottomsheet.md. ActionSheet's wide-screen Menu presentation is a separate decision and is not changed here.
