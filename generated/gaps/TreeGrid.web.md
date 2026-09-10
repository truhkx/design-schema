# Gaps reported while generating TreeGrid for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 14:22 — round 1

- TreeGrid's own copy block has no strings for the sort-button label, selection summary, row-count, empty-state, or edit-mode announcement that its behavior explicitly reuses 'as DataGrid'; borrowed DataGrid's exact copy text for these (kept in a separate BORROWED_COPY const) rather than inventing new user-facing strings.
- copy.level ('Level {level}') and copy.childCount ('{count} items') have no described use on the web platform — aria-level/aria-setsize/aria-posinset already carry that information natively, and only the RN platform notes explicitly compose an accessibilityLabel from them — so they're defined but unused here; using them as redundant visible/AT text would have been guessing.
- copy.expandAll / copy.collapseAll ('Expand all' / 'Collapse all') have no corresponding anatomy part (no expand-all control is listed), so they're defined but unused.
- The schema gives TreeGrid a `selectable`/`selectChildren`/`onSelectionChange` but no controlled `selected` prop (unlike DataGrid). Selection is implemented as internal state only; a consumer cannot drive selection from outside.
- The schema gives TreeGrid `sort` but no `defaultSort` (unlike DataGrid). Implemented `sort` as fully controlled: clicking a sortable header always calls `onSortChange`, and the visible order only changes once the caller reflects the new value back through `sort`.
- guideLine styling draws one continuous vertical segment per ancestor depth down every descendant row (VS Code-style indent guides) rather than elbow connectors that stop at a subtree's last child — the spec says a guide runs 'under each open parent' but doesn't specify termination/branching behavior.
- DataGridColumn's `pinned` and `resizable` fields (inherited through the reused `DataGridColumn[]` shape) are accepted by the type but not implemented — no sticky pinned columns, no column resizing — since the schema calls out sort explicitly as reused DataGrid behavior but says nothing about pinning/resizing for TreeGrid.
- Parent/descendant/sibling lookups used by `selectChildren` cascading, ArrowLeft-to-parent, and the `*` expand-siblings key walk the full `data` tree per call (O(n)) rather than a precomputed id map; only row rendering/virtualization is optimized for the 'hundred thousand leaf rows' scale the guidance calls out.
- The header is always sticky; DataGrid exposes a `stickyHeader` toggle but TreeGrid's schema has no such prop, so it's hard-coded on rather than configurable.
- Shift+Space row-range selection does not cascade into descendants even when `selectChildren` is true (only the visible rows in the range are selected) — the spec doesn't define how range-select and cascading selection should interact.

## 2026-09-10 19:17 — round 1

- TreeGrid's own copy block has no strings for the sort-button label, selection summary, row-count, empty-state, or edit-mode announcement that its behavior explicitly reuses 'as DataGrid'; borrowed DataGrid's exact copy text for these (kept in a separate BORROWED_COPY const) rather than inventing new user-facing strings.
- copy.level and copy.childCount have no described use on web (aria-level/aria-setsize/aria-posinset already carry that information natively; only RN composes an accessibilityLabel from them) — defined but unused here.
- copy.expandAll/copy.collapseAll have no corresponding anatomy part on web (no expand-all control listed) — defined but unused.
- Schema gives TreeGrid selectable/selectChildren/onSelectionChange but no controlled `selected` prop (unlike DataGrid) — selection implemented as internal state only.
- Schema gives TreeGrid `sort` but no `defaultSort` (unlike DataGrid) — implemented as fully controlled.
- guideLine styling draws one continuous vertical segment per ancestor depth for every descendant row (indent guides) rather than elbow connectors terminating at a subtree's last child — spec says a guide runs 'under each open parent' without specifying termination/branching.
- DataGridColumn's `pinned`/`resizable` fields are accepted via the reused DataGridColumn[] shape but not implemented (no sticky pinned columns, no resizing) — schema only calls out sort as reused DataGrid behavior.
- Parent/descendant/sibling lookups (selectChildren cascade, ArrowLeft-to-parent, `*` expand-siblings) walk the full `data` tree per call (O(n)) rather than a precomputed id map; only row rendering/virtualization is optimized for scale.
- Header is always sticky; DataGrid exposes a `stickyHeader` toggle but TreeGrid's schema has no such prop, so it's hard-coded on.
- Shift+Space row-range selection does not cascade into descendants even when selectChildren is true (only visible rows in range are selected) — spec doesn't define range-select + cascade interaction.
