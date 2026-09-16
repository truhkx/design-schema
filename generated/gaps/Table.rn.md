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
- `footer` content is rendered verbatim inside a padded `View` (the same pattern as `Card`'s `footer`), not re-typeset in "the table's font": React Native has no cascade, and the prop's shape is opaque `ReactNode` (buttons, pagination, a count), so there is nothing generic to apply `fontFamily`/`fontSize` to without restyling the caller's own children.
- `column.abbr` is accepted for shape parity with the web/Lit shape but has no native effect — RN has no equivalent to the web `abbr` attribute; the full `header` text is always both the visible label and the accessible name.
- When no column has `isRowHeader: true`, `selectRow` falls back to the row's `id` for its accessible name, and `onRowPress` (if set) has no dedicated header cell to become a Button — this case isn't described in the schema.

## 2026-09-10 19:42 — round 1

- footer content is rendered verbatim inside a padded View (same pattern as Card's footer), not re-typeset in "the table's font": RN has no cascade and footer is opaque ReactNode, so there's nothing generic to apply fontFamily/fontSize to without restyling the caller's own children.

## 2026-09-16 11:19 — round 1

- Table: platforms.rn.notes says phones are 'always the stacked form' and scroll only happens on tablets, but the responsive prop, the dense-data-table-that-scrolls example and the guidance ('the region is present whenever responsive: scroll') say scroll keeps the columns on narrow screens. Chose the prop: scroll gets a horizontal scroll region at every width; stack becomes stacked below layout.maxWidth.prose.
- Table: 'phone vs tablet' has no token. Used the table's measured width (onLayout, falling back to the window width) against layout.maxWidth.prose, like the web container query; hideBelow uses layout.maxWidth.prose/content the same way and is ignored in scroll mode ('scrolling tables keep every column').
- Table: rn notes ask for the row-header column 'in a separate vertically-synced list'. RN has no position: sticky, and two synced lists get out of step when rows have different heights. Chose to move the row-header cells by the horizontal scroll offset (Animated translateX), which pins them without a second list; stickyColumnShadow shows once scrolled.
- Table: scrollFade (edge fade) needs a gradient, which core RN cannot draw without a dependency; the binding and its override have no effect on native.
- Table: keyboard rule ArrowLeft/ArrowRight scrolling the scroll region by space.10 has no hardware-keyboard hook in core RN (no onKeyDown on ScrollView); not implemented, left to the platform/react-native-web default.
- Table: stacked rows have no binding for the space between blocks or their border (stackedRowGap is documented as between label/value pairs). Chose: each block is bordered with rowBorder/rowBorderWidth on stackedRowRadius, and the list's contentContainerStyle gap is stackedRowGap.
- Table: the selected start-edge bar is always reserved at border.width.focus (colored as the row background or border when not selected) so selecting a row does not shift its content; the spec does not say whether the bar may take layout space.
- Table: rowHover state 'hover' only exists on react-native-web pointers; implemented with Pressable onHoverIn/onHoverOut on the row-header Button, faded over transition. Sort-arrow changes are instant (swapping between two Icons can't be cross-faded without drawing a glyph by hand).
- Table: sort Button accessibleName must be 'the sort phrase' but sortAscending vs sortDescending is not specified for the current state. Chose the phrase for what the press will do (descending when this column is currently ascending, otherwise ascending).
- Table: headerWeight (semibold) and captionWeight (semibold) differ from Button's and Heading's default weights, and the forward contract gives no default to pass. Passed the Table's default token refs into the child overrides (Button fontWeight, Heading fontWeight) and captionGap as Heading marginBlockEnd, so the child's own bindings do the styling.
- Table: footer is 'rendered with the table's font', but RN has no cascade and footer is arbitrary ReactNode; footer is placed in a padded View and the caller's Text supplies typography.
- Table: loading with existing rows shows copy.loading in a polite live region above the list and sets accessibilityState.busy on the list; with no rows the empty state shows copy.loading instead of emptyMessage. The spec does not say which text wins when data is empty and loading is true.
- Table: copy.rowCount has no stated placement on native; used as the list's accessibilityHint. copy.selectedCount and copy.sortedAnnouncement go to hidden polite live regions plus announceForAccessibility on iOS, fired when the shown state changes (so a controlled table announces only after its prop updates).
- Table: the column/Row shapes are used verbatim (abbr?: string, not string | undefined) as the rules require, which under exactOptionalPropertyTypes means callers cannot pass an explicit undefined; the package convention for props would add | undefined.
- Table: sortButton inside the stacked Toolbar has no Table.sortButton testID (Button has no testID prop and wrapping Toolbar items in Views would receive Toolbar's cloned size prop); the testID wrapper exists only in the header-row layouts.
- Table: examples ask for stories with 'exactly its given as args', but meta.args (caption/columns/data) still merge in; every example sets caption, columns and data itself, so nothing leaks except that merge.
