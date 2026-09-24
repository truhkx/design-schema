Stop examples rendering open and stuck, per site/src/content/docs/process/website-audit-2.md, section "Stuck-open examples". Read that section first. Jobs 540 to 546 have landed; this extends job 542's harness.

Job 542 gave every overlay *without* an opener of its own (`harnessOf` in tools/docs_examples.ts returns `'trigger'`: Dialog, AlertDialog, BottomSheet, SidePanel, ActionSheet) a button plus wired close events, and they all work. Components that **have** their own opener get `harness: null`, so a story whose args say `open: true` is mounted with a controlled `open` and nothing wired to change it. Measured on 2026-09-24 in a real browser, each of these renders open on load and cannot be closed by Escape (real key press), an outside click, or its own trigger:

- Menu — Placement Bottom Start, Placement Bottom End, Placement Top Start, Placement Top End (the menu also takes focus on tab switch, so selecting the tab scrolls the page to the menu)
- Popover — Default
- DatePicker — Open
- Combobox — Open
- Select — Disabled Open
- Disclosure — Controlled (cannot be collapsed; "Open" and "Open With Form Fields" toggle correctly)
- Tooltip — Placement Top/Bottom/Start/End open on load over the example tab row (these do dismiss on Escape and blur)

`node -e` over generated/examples/*.json lists exactly these as `args.open === true` with no harness.

1. **A second harness mode.** In `harnessOf`, a component with a boolean `open` and a change or close event that *does* have its own opener gets `'state'` instead of `null`. Write it to generated/examples/*.json like `'trigger'`. `harnessEventsOf` already derives the events to wire.
2. **StateHarness** in apps/website/src/components/Examples.tsx: holds `open` in state, wires the change/close events exactly as `TriggerHarness` does, and renders the component with no extra button. Initial value: `false` for any component with an `overlay` block (Menu, Popover, Tooltip, and the form fields whose popup is an overlay — read the schema, do not list names), and `args.open` for inline ones (Disclosure). Nothing floating renders open on load, so tab switching never moves focus or scrolls the page.
3. **Examples that exist to show "open".** Stories titled `Open` or `Disabled Open` on an overlay component add nothing once the harness starts closed; exclude them from the site the way 542 excluded `Closed`. Placement stories stay: the trigger now opens the panel in the placement the story names.
4. **Room to open.** Give example cards whose component has an `overlay` block enough block padding that a panel opened from the trigger at the story's placement stays inside the viewport when the card is scrolled to centre (top placements need space above). Use the layout tokens; no literals.
5. **Guard.** Extend tests/website/overlay-harness.spec.ts: for every example tab on Menu, Popover, Tooltip, Select, Combobox, DatePicker and Disclosure, assert nothing with `role` menu/dialog/listbox/tooltip is visible after selecting the tab and `document.activeElement` is still the tab; then open from the component's trigger with a real click, and assert Escape (`page.keyboard.press`) closes it and focus is back on the trigger. For Disclosure "Controlled", assert the trigger toggles `aria-expanded` both ways.

Gate — all must pass:

    pnpm docs:examples
    pnpm docs:examples:check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm --filter website build
    pnpm site:routes
    pnpm exec playwright test --config playwright.website.config.ts

`node -e` over generated/examples/*.json: no example with `args.open === true` has `harness === null`.

Do not modify `packages/*/src`, `prompts/`, or any component doc.
