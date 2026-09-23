Give overlay components a working, schema-driven example on their docs pages, per site/src/content/docs/process/website-audit.md, section "Examples that do not work". Read that doc's "Findings" first. Jobs 540 and 541 have landed.

tools/docs_examples.ts marks any story whose export declares `decorators` as `decorated: true` (see `storyShape`), and apps/website/src/components/Examples.tsx renders those as a notice — "This story does not render from its args alone…" — with no demo. On the site that is every example on Dialog (15 of 16), AlertDialog (10 of 11) and BottomSheet (6 of 6), Popover "Default" and "Keyboard", five Tooltip placements, and the "Keyboard" / "Open" / "Many Rows" stories on Select, DatePicker and DataGrid. A visitor to the Dialog page never sees a dialog. The "Closed" stories on Dialog, AlertDialog and ActionSheet render an empty 0px card.

The fix is a harness chosen from the schema, not a hand list, so a future overlay gets it for free.

1. **Which components.** In tools/docs_examples.ts derive `harness: 'trigger' | null` per component from generated/components.json: `trigger` when the component has an `open` prop of type boolean **and** an event named `onClose` or `onOpenChange` (grep confirms the twelve docs that declare `open` today: actionsheet, alertdialog, bottomsheet, combobox, datepicker, dialog, disclosure, menu, popover, select, sidepanel, tooltip). Components that already render their own trigger from a prop (Popover, Tooltip, Menu, Select, Combobox, DatePicker, Disclosure — they declare a `trigger` or are the field themselves) get `null`; those already work. Write the flag into generated/examples/*.json next to `decorated`.
2. **Harness.** In Examples.tsx, when `harness === 'trigger'` and the example is not decorated, render a generated `Button` (`variant="secondary"`, label derived from the component: "Open dialog", "Open alert", "Show sheet", "Open panel", "Show actions") that sets a local `open` state, spread over the example's args with `open` forced to that state, and wire the component's `onClose` / `onOpenChange` to set it false. Focus must return to the harness button on close (the component does this; assert it). The code panel beneath still shows the story's own source, unchanged.
3. **Decorated stories.** Keep the notice only for stories that are decorated **and** have no `open` prop to drive. For decorated stories on a `trigger` component (Dialog "Keyboard", "Initial Focus *", "Rename Project", …), render the harness from the story's args when the args alone are a complete render — decide per story by rendering it in the harness under Playwright and checking the dialog opens with content; list in your summary the ones that still cannot, and leave those on the notice.
4. **Exclusions.** Stories titled "Closed", and stories whose only purpose is a Storybook play function ("Keyboard" on every component) are excluded from the site's example list in docs_examples.ts (they stay in Storybook; the Storybook deep link still exists). The counts in "More examples (N)" update accordingly.
5. **Guard.** A Playwright spec: on each of Dialog, AlertDialog, BottomSheet, SidePanel, ActionSheet, and Popover "Default", the first example's harness button opens the component (`[role=dialog]` or the component's `data-ds` root is visible, opacity 1, inside the viewport), Escape closes it, and focus returns to the button. If SidePanel or ActionSheet still fail here because of the component bugs job 543 owns, mark those two as expected failures with a comment naming 543 and say so in the summary; do not paper over them.

Gate — all must pass:

    pnpm docs:examples
    pnpm docs:examples:check
    pnpm --filter website build
    pnpm site:routes
    pnpm exec playwright test --config playwright.website.config.ts

Re-run the example-render audit (the walker from the 2026-09-23 audit is under logs/; port it to a Playwright spec if it is not already) and report the before/after counts of `notice-only` and `empty` per component. `notice-only` must be zero on Dialog, AlertDialog and BottomSheet.

Do not modify `packages/*/src`, `prompts/`, `storybook/`, or any component doc. Do not add a trigger to any component's stories to make this work; the harness lives in the website.
