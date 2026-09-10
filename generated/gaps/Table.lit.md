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
