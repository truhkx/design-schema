# Gaps reported while generating DataGrid for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 14:12 — round 1

- Input/NumberInput/Select/DatePicker/Checkbox have no `size`/hideLabel prop and omit an external `aria-describedby` from their public types, but the doc calls for editors rendered with 'label visually hidden, size sm'. Since children may never be restyled from outside, editors render with their normal, full-size, visible label inside the cell (expanding the row while editing) rather than the hidden-label compact form the doc describes.
- Because those field components can't take an external aria-describedby, the 'Editing {column}. Enter to save, Escape to cancel.' copy is announced through the shared status-bar/live-region on edit start instead of being wired directly to the editor field.
- Select/DatePicker/Checkbox editors commit immediately on change (treated as discrete pickers); text/number editors commit on Enter/F2/blur. The schema doesn't address commit timing for non-text editors, so this split is an implementation choice.
- F2's 'toggles between editing and navigating' (the APG cursor-vs-cell distinction) is simplified to 'F2 commits and returns to navigation', since the composed Input/NumberInput controls have no internal edit-cursor-vs-cell-navigation mode to toggle.
- The keyboard model's Tab row says Tab always leaves the grid (one tab stop) even from a cell with an open editor, which contradicts the Behavior prose's 'Tab commits and moves right.' Implemented per the keyboard array (authoritative): Tab is never intercepted; committing on tab-out happens via blur instead.
- `selectable: 'cell'` has no dedicated key in the keyboard model to confirm a cell selection (Space is scoped only to row/range), so selection is implemented as always following the focused cell.
- Shift+Space ('selects the row') is interpreted as extending the row selection from the last anchor to the current row (shift-click-style range); Ctrl+Space ('the column in range mode') is interpreted as selecting the full loaded column. Neither is spelled out beyond the plain-Space toggle.
- Range-selection behavior on plain (non-Shift) cell movement isn't specified beyond 'extends with Shift+arrows or drag'; implemented as collapsing/resetting the anchor to the newly focused single cell, matching common spreadsheet UX.
- Pinned columns are assumed contiguous at the start/end of the `columns` array; the auto-added selection checkbox column never pins (the schema gives it no such switch), so it scrolls out of view even when data columns are pinned.
- `rowCount` vs. `data`-as-a-window has no defined offset in the schema; this implementation assumes `data` always starts at index 0 of the full set and requests more via `onRangeNeeded` as the loaded window's end is approached.
- `height: viewport` fills 100% of whatever block-size the parent budgets (flex/grid layout) since the schema gives DataGrid no page-rhythm token analogous to Table's `layout.gap.section`-based viewport cap; the exact fill mechanism is left to the consuming page.
- Row height for virtualization math is measured via ResizeObserver on a hidden sizer element (rather than hardcoded per density), since compact/comfortable row heights are theme tokens the JS layer can't otherwise read — keeps the math theme-agnostic.
- Default column width (160, matching the schema's own example) and the resize keyboard step (16px) aren't specified by the schema; chosen pragmatically.
- The range-selection overlay is computed from the two endpoint cells' rendered bounding boxes; if either endpoint has scrolled outside the current virtualization window, the overlay isn't drawn until it's back in view.
- Enter's 'on a cell containing a control: activates it' is implemented generically for custom `column.render` content (focuses+clicks the first focusable descendant); it doesn't apply to the built-in selection checkbox column, which is only reachable via Space.
- Added an undocumented `container?: HTMLElement` prop, forwarded to the composed Select/DatePicker editors' own `container`, per the package's portal convention that every portaled overlay accepts a container override.
- Mouse drag-to-select a range is implemented via mouseenter-while-dragging; the schema only says 'drag rectangles' without further detail.

## 2026-09-10 19:16 — round 1

- DataGrid: `resizeStep` (space.4) is a style token but there's no CSS API to read a resolved custom-property length from JS without measuring; fixed the pre-existing implementation to measure it via a hidden 1px-tall sizer element sized by `inline-size: var(--ds-data-grid-resize-step)` (same pattern as rowHeight), instead of a hardcoded 16px constant, so `overrides.resizeStep` now actually changes the Shift+Arrow resize increment.
- DataGrid: Delete/Backspace clears editable cells by firing onCellChange with value: undefined — the schema says 'clears the value' but doesn't specify whether that means undefined, empty string, or omission from the payload; chose undefined since the column model documents that as 'omitted'.
- DataGrid: resizable columns pin the select-all/select checkbox column to width var(--size-target-min) and never let it participate in `pinned` styling since the schema gives it no such prop; treated it as always effectively pinned-start (per the 'selection column is always pinned start' line) but without the pinned-shadow visual since it has no adjacent pinned sibling by default.
- DataGrid: `copy.position` is documented as the status bar's per-cell text but is explicitly 'not announced' — implemented it as unused in the live region, and the status bar instead shows row/selection counts; there's no story exercising the position text directly since the spec gives no trigger for surfacing it over the count text.
