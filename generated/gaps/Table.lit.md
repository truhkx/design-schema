# Gaps reported while generating Table for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 13:22 — round 1

- Checkbox has no hidden-label mode, so the selectCell/selectAllCell composition (mandated by the schema) always shows visible 'Select {rowName}'/'Select all rows' text next to every row's checkbox — likely not the intended dense selection-column look. Checkbox's schema would need a label-visibility variant to fix this without restyling the child.
- 'render'/'rowActions' shape strings say '(row: Row) => ReactNode', which doesn't exist on this platform; typed both as '(row: TableRow) => unknown' returning a lit template, matching how the Lit platform notes say render functions return lit templates.
- onRowPress is documented as an event only, with no prop gating when it fires ('Only when the row has no other interactive content'). Implemented as: the row-header column's cells become a Button firing row-press whenever that column has no custom `render` (i.e. the consumer hasn't put their own Link/interactive content there); when `render` is set, row-press never fires for that row, since the doc's own guidance is to put a Link in `render` instead. rowHover/interactive styling is applied only in that same case — a consumer-supplied Link via `render` gets no automatic hover treatment, since Table can't detect interactive content inside an opaque render() result.
- No prop specifies the composed caption Heading's level; defaulted to level="2" with size="md" (matching captionSize's default token), since nothing in the schema constrains it to the surrounding page outline.
- The 'footer' anatomy part has no prop, slot contract, style binding, or guidance describing its content anywhere in the schema — added a bare `<slot name="footer">` with no styling contract, purely to cover the anatomy entry.
- copy.rowCount and copy.scrollHint aren't tied to a specific element by the doc; used rowCount as a visually-hidden `aria-describedby` on the `<table>` and scrollHint the same way on the scroll region — a reasonable placement, not a specified one.
- maxHeight: 'viewport' formula ('viewport height minus the section rhythm') isn't numeric in the doc; implemented as `calc(100vh - var(--layout-gap-section) * 2)`.
- The keyboard rule ties the scroll-region's focus/arrow-key behavior to 'below the breakpoint', but the web platform notes describe the scroll region unconditionally for responsive: scroll; implemented it unconditionally (always present, not gated by container width) since gating a tabindex/keydown listener on a live container-query match adds real complexity for an unspecified benefit.
- ArrowLeft/ArrowRight scroll step size (used 40px) isn't specified by the doc.
- Column `width: 'min'/'fill'` is implemented via `<col>` sizing hints under the default (auto) table layout, where the browser treats them only as hints rather than enforcing them the way `table-layout: fixed` would; exact sizing/truncation behavior isn't specified by the schema.

## 2026-09-10 18:57 — round 1

- Table: the previously-generated Table.ts/Table.stories.ts (present before this pass) fully implemented the schema except the required `captionLevel` prop was entirely missing — no property, no wiring to the composed Heading's `level`, no stories, despite three dedicated behavior scenarios (renders-captionLevel-2/3/4) and a copy line referencing it. Added `captionLevel: '2' | '3' | '4'` (default '2', not reflected since it isn't in platforms.lit.reflect), wired it to `<ds-heading level>`, exported `TableCaptionLevel`, and added CaptionLevel2/3/4 stories plus the arg/control.
- Table: `SCROLL_STEP_PX` (arrow-key scroll distance in the scroll region) has no doc value — the guidance says 'Arrow keys in the scroll region scroll by `space.10`' but `@container`/keydown handlers can't read a custom property at authoring time for a JS constant, so the existing code uses a literal 40px with a comment; not fixed by this pass, flagging since `space.10`'s px value should be confirmed against the token build rather than guessed.
- Table: `rowActions` header cell text ('Actions') has no visible column but the doc doesn't state whether it should also appear in a `data-label` for the stacked responsive mode (unlabeled action buttons when stacked). Existing code leaves the rowActions cell without a `data-label`, so stacked view won't show an 'Actions' label before the actions — left as-is since the schema doesn't request one, but worth a doc call-out.

## 2026-09-16 11:13 — round 1

- Table: onRowPress is 'set' on web/React by passing a callback, but a Lit element can't tell whether anyone listens for an event. Chose to count `row-press` listeners added to the element itself (addEventListener/removeEventListener overrides); a listener higher up the tree that relies on bubbling won't turn rows interactive. The doc should say how Lit opts in (e.g. a `row-press-enabled` attribute) or accept this.
- Table: platforms.lit.reflect doesn't list `captionLevel`, and the doc gives no attribute name for it. Chose the unreflected attribute `caption-level`.
- Table: `selectable: single` has no select-all, and the doc doesn't say what goes in that header cell. Chose an empty `<td role="cell">` (as in React) rather than an unnamed columnheader.
- Table: `numericFont` says to use the mono family 'where the body font lacks' tabular figures, which CSS can't detect. Chose `font-variant-numeric: tabular-nums` plus the mono family on every `align: end` body cell, always.
- Table: `stackedRowGap` is defined as the gap between label/value pairs inside a stacked row; no binding covers the space between stacked rows. Reused `stackedRowGap` as the tbody grid gap.
- Table: the `rowSelectedBorder` start-edge bar has no stated drawing method. With border-collapse, a `<tr>` can't carry an inset shadow, so it's an inset box-shadow on the row's first cell (flipped under :dir(rtl)), and on the `<tr>` itself when stacked.
- Table: `stickyHeader` inside `responsive: scroll` sticks to the horizontal scroll region, not the page, because overflow-x makes that region the scroll container. The doc presents both as working together; they don't without `maxHeight: viewport`.
- Table: `width: min`/`fill` have no sizing rule on web. Chose `inline-size: 1%` + nowrap for min and `100%` for fill.
- Table: the `transition` binding covers 'sort-arrow changes', but the arrow is a swapped `ds-icon` with nothing to animate. Only the interactive row's hover background transitions.
- Table: `copy.sortToolbarLabel` and `copy.cellLabel` have no web/Lit use (they're for the RN sort Toolbar and the SwiftUI stacked labels); they aren't rendered.
- Table: `loading` with empty data shows `copy.loading` in the emptyState part, and with rows shows it as a muted Text below the table. The doc says only 'the body shows copy.loading'.
- Table: behavior scenario `loading-marks-the-table-busy` names no target element for `aria-busy`. Asserted it on the shadow `<table role="table">`, and `has-accessible-name` on that table, not the host, because the host carries no role.
