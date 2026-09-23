# Code gaps

Gaps where a sibling component's committed code is wrong while the docs are right; these need a regeneration or a patch. One line per distinct issue; the entry shape and the rule for adding to it are in prompts/fold-gaps.md ("Ledger entries"). `node --import tsx tools/gap_digest.ts` ranks the open lines.

Seeded 2026-09-23 by job 719 from the triage (site/src/content/docs/process/backlog-triage.md), statuses as of jobs 710–718; the notation is explained at the top of TOOLING.md. The old ledger is CODE.2026-09-23.md.

- C1 | fixed ≤938ceeb | hit-by: ledger ×5 | cost: - | Stale doc comments naming things that now exist (Menu/ActionSheet, rn Button's expanded state and overflowLabel, Link's className, "Stack has no gap override path").
- C2 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | BottomSheet consumers passed the old `title` after the rename to `heading` (rn Combobox, DataGrid, Select, TreeGrid).
- C3 | fixed ≤938ceeb | hit-by: ledger ×12 | cost: - | Mis-wired composed children (Table's Checkbox hideLabel, Tree's className to Icon/Link, Feed's tabIndex to Card, Select/Combobox embedded/loading, FocusScope returnFocusTo, Breadcrumb's and Dialog's parts).
- C4 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | AlertDialog's tone colour set on a wrapper where Icon's own rule wins.
- C5 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | Locked bindings exposed in the overridable union (rn Checkbox indicatorStroke, Lit Icon strokeWidth).
- C6 | fixed ≤938ceeb | hit-by: ledger ×3 | cost: - | Lit field discovery: fields not setting data-ds-field, Form using a tag list, `invalid` never set.
- C7 | fixed ≤938ceeb | hit-by: ledger ×4 | cost: - | packages/rn/src/FormContext.tsx stale duplicate of FormContext.ts (filed four times on four dates).
- C8 | open | hit-by: ledger ×4 | cost: - | FormFieldValue too narrow and JSDoc stale on React, rn and Lit (DsFormField.currentValue): no numeric, array or range variant, so NumberInput/Slider stringify and Combobox comma-joins. Convention side is T24.
- C9 | fixed ≤0a095ac | hit-by: ledger ×6 | cost: - | react-native-web drops accessibilityState/accessibilityValue, so rn components lacked aria-* mirrors; the last one, rn DataGrid, now carries them. The rule and the regen cost are T23.
- C10 | fixed job-716 | hit-by: ledger ×1 | cost: - | rn Icon leaked importantForAccessibility onto `<svg>` and was not aria-hidden on react-native-web.
- C11 | fixed ≤0a095ac | hit-by: ledger ×1 | cost: - | rn Tabs panel View had accessibilityLabel and no role (aria-prohibited-attr on Patterns/SettingsPage); found fixed at HEAD by job 716.
- C12 | open | hit-by: ledger ×2 | cost: - | rn Text hardcodes `testID="Text"` and takes no testID or layout style, so composites put part testIDs on wrapper Views (packages/rn/src/Text.tsx).
- C13 | open | hit-by: ledger ×3 | cost: - | rn Button has no testID, no `fill`, cannot leave the focus order, no hold-to-repeat, always applies its own disabled opacity, does not colour its icon slots; Carousel's minTarget cannot be kept (packages/rn/src/Button.tsx).
- C14 | open | hit-by: ledger ×5 | cost: - | Lit ds-button / ds-link / ds-input do not forward host aria-label, aria-description, aria-current or tabindex to the inner control (ds-button has no haspopup, ds-link no current; ds-select, ds-segmented-control, ds-search forward no tabindex).
- C15 | open | hit-by: ledger ×1 | cost: - | rn Link has no `current` prop, so a native navigation SidePanel cannot mark the current page.
- C16 | open | hit-by: ledger ×2 | cost: - | Web Link renders an inner `<span data-part="label">` that collides with a composer's own `label` part; dormant since Tree stopped nesting one (packages/react/src/Link.tsx).
- C17 | fixed job-716 | hit-by: ledger ×1 | cost: - | Form context's submitFailed read only by some fields, so errors did not clear under `validate: submit` (Listbox, DatePicker; Listbox's `change` mode too).
- C18 | fixed ≤0a095ac | hit-by: ledger ×1 | cost: - | Overlays passed `data-part="focusScope"` into FocusScope, whose own `data-part="scope"` wins; ActionSheet and Popover were the last two.
- C19 | fixed ≤938ceeb | hit-by: ledger ×2 | cost: - | React siblings accepted and merged className/style against the package convention.
- C20 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | demo-brand CtaButton listed a locked binding as overridable.
- C21 | open | hit-by: ledger ×1 | cost: - | Sibling `*HeadingLevel` types include the numbers while Heading's own is the string union (Card, Accordion, Disclosure, Popover, Tree, Feed; cosmetic).
- C22 | obsolete | hit-by: ledger ×1 | cost: - | Toolbar (lit) reads `--size-target-min`, "which does not exist" — it exists.
- C23 | obsolete | hit-by: ledger ×3 | cost: - | Bulk whole-Storybook axe/keyboard failure inventories recorded before the gate was scoped (T1); re-derive from a scoped run.
- C24 | fixed ≤938ceeb | hit-by: ledger ×5 | cost: - | Story-content defects (Splitter/Box bare strings in dark mode, Box meta-args leaking, Tabs' fixed panels, rn Submitting/disabled contrast).
- C25 | fixed ≤938ceeb | hit-by: ledger ×4 | cost: - | Component a11y structure decided during the run (Feed's live region, Listbox's empty state, Carousel's region, Splitter's target size).
- C26 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | Lit FocusScope's focusable walker was module-private and Toast duplicated it.
- C27 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | composedContains walked parentNode and never crossed a slot (BottomSheet, SidePanel, ActionSheet, Popover).
- C28 | fixed job-716 | hit-by: ledger ×1 | cost: - | packages/lit/src/AccordionTmpSlotted.test.ts was committed scratch; deleted.
- C29 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | rn TreeGrid onColumnResize object-shaped vs DataGrid's positional.
- C30 | open | hit-by: ledger ×1 | cost: - | Lit Card writes role="article" + aria-label whenever `heading` is set, with no opt-out, so Feed's presentational Card still ships an aria-label (packages/lit/src/Card.ts).
- C31 | open | hit-by: ledger ×1 | cost: - | Box has no inverse surface value, so Button's Inverse story paints its own decorator on web and Lit.
- C32 | obsolete | hit-by: ledger ×1 | cost: - | Lit Dialog.test.ts control-is-focusable failed in browser mode — no such scenario now.
- C33 | open | hit-by: ledger ×1 | cost: - | Lit Combobox statusDebounce reads --motion-duration-base, which a reduced-motion theme zeroes (packages/lit/src/Combobox.ts).
- C34 | open | hit-by: ledger ×1, job-716 | cost: - | Lit Select always sets data-ds-field and warns without `name`, even as a control inside another component's shadow root. Needs a "not a field" opt-out that no doc defines yet — a schema decision.
- C35 | open | hit-by: ledger ×2 | cost: - | Web Listbox keeps activeValue and its key handler internal, so Select dispatches a synthetic focusin and Combobox remounts and re-dispatches keydowns; no declared option-id format (packages/react/src/Listbox.tsx).
- C36 | open | hit-by: ledger ×1 | cost: - | ds-popover has no public reposition method (DatePicker dispatches a synthetic scroll), always focuses its first focusable, and does not re-measure late slotted content.
- C37 | open | hit-by: ledger ×1, job-716 | cost: - | Web Checkbox always sets data-ds-field and registers with FormContext, so Table's selection checkboxes inside a Form are collected as fields. Same opt-out decision as C34.
- C38 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | Lit Form: one host carried one data-ds-field, so a range field could not register `name-end`.
- C39 | fixed job-711 | hit-by: ledger ×1 | cost: - | Lit ds-button's property label never reached the composer's shadowRoot.textContent (ActionSheet's cancel row).
- C40 | fixed ≤938ceeb | hit-by: ledger ×1 | cost: - | Lit Carousel's host is the region, with data-part="region" on the host (adopted as the Lit precedent).
- C41 | open | hit-by: Tooltip.web r2, Tooltip.web r3, Tooltip.lit r2, Tooltip.lit r3, job-713 | cost: 4 rounds, $22.22 | Tooltip's Escape keyboard rule never passed: keyboard-run failed all three rounds on web and Lit, and the Lit gap file says no component code can pass it (the rule needs `from: any`, `target: popup` in tooltip.md). After 713 the Lit Escape test is still red; its Keyboard story needs autofocus.
- C42 | open | hit-by: job-712 | cost: - | rn Accordion, Stepper and BottomSheet put no testID on a part the behavior scenarios click.
- C43 | open | hit-by: job-712 | cost: - | 9 React and 2 Lit components still carry the part-wrapper press-forwarding code that 712 retired from web.md; it goes at their next regeneration.
- C44 | open | hit-by: job-711 | cost: - | Lit BottomSheet, SidePanel, Stepper and Splitter expose no accessible name to has-accessible-name; Lit Landmark has no shadow root or part.
- C45 | open | hit-by: job-716 | cost: - | Web Input fails the `hooks` gate.
