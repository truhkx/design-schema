# Gaps reported while generating Table for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 13:15 — round 1

- Column `width: 'auto'` vs `'min'` are not distinguished: RN has no text-measurement API without an extra layout pass, so both render as a fixed `space.20` width; only `width: 'fill'` (flex:1) is distinct.
- `responsive: 'scroll'` at true phone widths (< layout.maxWidth.prose) has no effect — the platform notes say phones are always stacked; a `__DEV__` warning fires when this combination is requested.
- True synced sticky row-header column for `responsive: scroll` is not implemented (no gesture-handler/reanimated dependency is permitted for a second synced list); the whole table scrolls horizontally together instead, with `stickyColumnShadow` toggled on the row-header cells once the region has scrolled as a partial visual approximation.
- `Button` (the mandated `sortButton` composition) exposes only a single `label` prop with no separate accessible-hint slot, so `copy.sortAscending`/`copy.sortDescending` (the current-sort-state phrase) are exposed via an adjacent visually-hidden `Text` in the header cell rather than on the Button itself; the visible label stays the plain column header.
- The phone-layout sort `Toolbar` needs a required, non-visible `label` (accessible name) but the schema has no copy template for it; constructed as `Sort ${caption}`.
- `selectable: 'single'` toggles the row off when its own checkbox is pressed again (radio-like exclusivity otherwise) — the spec doesn't say whether re-clicking a selected single-select row should deselect it.
- `transition` is resolved but not animated (no Animated.timing wired to it) — mirrors Card's documented rationale that there is no continuous hover on touch to animate between; sort-icon/hover changes are instant.
- `scrollFade` is applied as horizontal edge padding on the `responsive: scroll` region rather than a gradient mask — there's no CSS mask-image equivalent, and adding an SVG gradient (as Toolbar's internal fade does) was judged not worth the complexity for a non-tested visual affordance.
- The `footer` anatomy part has no corresponding prop anywhere in the schema (no footer content is described) and is not rendered.
- The caption's `Heading` level is not specified by the schema (Table has no `headingLevel`-style prop); defaulted to level `2`.
- `column.abbr` is accepted for shape parity with the web/Lit shape but has no native effect — RN has no equivalent to the web `abbr` attribute; the full `header` text is always both the visible label and the accessible name.
- When no column has `isRowHeader: true`, `selectRow` falls back to the row's `id` for its accessible name, and `onRowPress` (if set) has no dedicated header cell to become a Button — this case isn't described in the schema.
