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

## 2026-09-17 13:42 — round 1

- Table: `pressable-rows` appears only in the onRowPress description and the Lit notes, not in props or platforms.lit.reflect, so its property name is unstated; I chose a reflected boolean property `pressableRows` on attribute `pressable-rows`.
- Table: the forwards to Heading/Button `overrides` (captionSize/captionWeight/captionGap, headerWeight/cellGap) are inline styles on the child, so a consumer's CSS override of `--ds-table-caption-size`, `--ds-table-header-weight` or `--ds-table-cell-gap` never reaches the child; only the `overrides` property does. The doc should say whether forwarded bindings are CSS-hook overridable.
- Table: the `caption` part is a composed Heading, but the doc doesn't say whether `hideCaption` visually hides the Heading element itself or a wrapper; I put data-part=caption and the visually-hidden class on the ds-heading host, dropped the wrapper, and gave the Heading no `size` because composition lists no props (its size comes from the fontSize forward).
- Table: the container-query breakpoints can't read custom properties, so layout.maxWidth.prose (572) and layout.maxWidth.content (960) are hard-coded from the calm-precise build; warm-sleek's content width is 1040, so the numbers are theme-specific and the doc doesn't say which theme's values a package bakes in.
- Table: the doc says select-all and sortable headers 'stay visible as a wrapping row' when stacked but gives no binding for that row's gap or whether it keeps the header border; I used stackedRowGap and kept the header cell styles. Sticky header when stacked sticks the whole thead, which the doc does not describe.
- Table: scrollFade 'fades an edge only while columns are hidden past it', but the mask also fades the scroll region's inset focus ring at those edges; the doc doesn't say whether the ring should sit outside the mask.
- Table: loading-marks-the-table-busy is scoped to `platforms: [web]`, yet the Lit notes specify aria-busy on the shadow table; I kept its test in Table.test.ts (20 tests for 19 listed scenarios).
- Table: `footer` is type content with a note that a string footer renders in Text with the font bindings; Lit exposes it only as a `footer` slot, so the string form has no Lit equivalent and slotted content brings its own typography.
- Table: the loading-with-rows live region and the sort/selection announcement region are separate polite regions; the doc doesn't say whether they should share one.

## 2026-09-21 19:27 — round 1

- Table: the web notes say each theme's CSS build stamps its own prose/content widths into the container queries, but a Lit element's `css` compiles into the package once and cannot vary per theme — I baked calm-precise's 572/960 into the module with `literal-ok`, so another theme's widths need a rebuilt package, not just another stylesheet.
- Table: `scrollFade` requires the mask to cover the scrolling content only and never the region's own focus ring, but a mask on the scrolling element necessarily clips its outline — I draw the ring on a wrapper div around the `scrollRegion` part with `:has()`. That wrapper is an element the anatomy does not name.
- Table: `striped` says only 'alternate row backgrounds' without saying which rows carry the tint — chose `nth-child(even)`, so the first data row stays on `color.background`.
- Table: the web notes list `aria-rowcount`/`aria-colcount` but never what they count — chose `data.length + 1` (header row included) and a column count that includes the selection and actions columns.
- Table: `a11y.requires` lists `arrow-navigation`, which contradicts the keyboard block ('Cells themselves are not focusable — this is a table, not a grid'). Read it as the `responsive: scroll` region's horizontal arrow scrolling and implemented nothing else.
- Table: the declared Keyboard contract lists only the native Enter/Space rule, while the schema `keyboard` block and the guidance also require ArrowRight/ArrowLeft to scroll the region by `space.10`. Implemented the arrows, since the guidance is explicit; the generated keyboard spec skips them as manual.
- Table: guidance says the arrow step is read from the built token with 'px and rem both parsed' — a custom property comes back unresolved, so I multiply rem by the root font size. A theme that builds the scale in any other unit (em, %, ch) falls through and the arrows do nothing.
- Table: the doc says the empty message shows 'in a single full-width cell' but not whether that row and cell are `row`/`cell` parts — left both unmarked, so the `row` part counts data rows only.
- Table: `selectable: single` is documented as Checkboxes with 'radio-like behavior', and `composition.selectCell` names Checkbox, so a single-select column is announced as checkboxes rather than radios; re-pressing the selected row's checkbox deselects it.
- Table: `hideCaption` is documented as sending `space.0` in place of `captionGap`, but nothing says which wins when a consumer also sets a `captionGap` override — the hidden caption wins in this implementation.
- Table: `rowHover` on a row whose row header holds a Link is found with `:has(... ds-link)`, which matches the system Link only. A `render` returning a raw `<a>` gets no hover tint — consistent with 'a Text, Link, Meter, or Button — never raw HTML', but the selector is the enforcement.
- Table: `footer` is documented as rendering 'no footer part at all' when absent, yet the slot must stay in the shadow tree for `slotchange` to report content — the wrapper always renders and only takes `data-part="footer"` once something is assigned.

## 2026-09-23 13:47 — round 1

- Table: the Overrides section says a forwarded binding declares no hook, but headerWeight and cellGap are both forwarded to the sort Button and also style Table's own parts (plain header cells, the actions cell gap); chose to keep --ds-table-header-weight / --ds-table-cell-gap as Table hooks and forward the overrides value to the Button, and dropped only the caption* hooks, which have no Table-owned part.
- Table: prose/content breakpoints must be literal numbers in the container query (a condition cannot read a custom property) and differ by theme (calm-precise content 960px, warm-* 1040px); the Lit element bakes calm-precise's 572/960, as platforms.lit.notes accepts, but the doc does not say which theme's build a published Lit package is baked from.
- Table: 'Activating one of those wrappers runs the control's own action' — Checkbox has no public toggle method and a click dispatched on its host never reaches its inner input, so a click on the selectCell/selectAllCell/sortButton wrapper outside the control runs Table's selection/sort logic directly rather than the child's action; the child's own change event does not fire in that case (the Table re-renders it from state).
- Table: in responsive: stack the selectable: single header placeholder (an empty td with no part) is not mentioned by the stacked rules; chose to visually hide it with the plain column headers.
- Table: the doc does not say whether headerShadow should show against the page scroll in responsive: scroll without maxHeight: viewport (the header does not stick there); chose to keep the observer off so no shadow ever appears on a non-sticky header.

## 2026-09-23 13:49 — round 2

- Table: cellMutedColor is a locked binding on the `cell` part, but the doc says secondary values render as Text tone muted (the Text carries the color), so no Table rule reads it; chose to declare --ds-table-cell-muted-color on :host only, so it is renameable and themeable, but it currently styles nothing in Table's own shadow tree.
- Table: the gates:hooks gate is repo-wide and exits 1 over pre-existing debt in 72 other components (456 locked bindings, web and lit); Table itself no longer appears in it, but a per-component run of the gate would be needed for a job to report it green.

## 2026-09-23 15:33 — round 1

- Table: the keyboard block says the scroll region is focusable and arrow-scrolls 'below the breakpoint', but the guidance says the region is present whenever `responsive: scroll`; kept it always focusable and arrow-scrollable in scroll mode, so the keyboard block's `when` wording should drop 'below the breakpoint'.
- Table: 'Activating one of those wrappers runs the control's own action' — Checkbox has no public toggle method and a click on its host outside the inner input never reaches it, so a click on the selectCell/selectAllCell/sortButton wrapper outside the control runs Table's selection/sort logic directly; the Checkbox's own `change` does not fire in that case (it re-renders from Table state). Checkbox would need a documented activation method for the wording to hold literally.
- Table: the prose/content breakpoints are baked into the Lit module as calm-precise's 572/960 with `literal-ok` (the notes accept a rebuild per theme), but the doc does not say which theme's build a published Lit package is baked from.
- Table: headerWeight and cellGap are both forwarded to the sort Button's `overrides` and also style Table's own parts (plain header cells, the actions-cell gap), so they keep --ds-table-header-weight / --ds-table-cell-gap hooks; the 'a forwarded binding declares no hook' rule should say it applies only to bindings with no Table-owned part (the caption* ones).
- Table: cellMutedColor is a locked `cell` binding, but secondary values render as Text tone muted, so no Table rule reads it; --ds-table-cell-muted-color is declared on :host and styles nothing in Table's shadow tree.
- Table: in responsive: stack the selectable: single header placeholder (the empty td with no part) is not covered by the stacked rules; it is visually hidden with the plain column headers.
- Table: headerShadow in responsive: scroll without maxHeight: viewport — the header does not stick there, so the IntersectionObserver is off and no shadow appears; the doc implies this but does not state it for the shadow.
