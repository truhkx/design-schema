---
title: TreeGrid
description: A DataGrid whose rows nest — accounts and sub-accounts, folders and files, a bill of materials — with expand/collapse on the row header and the grid's cell navigation everywhere else. DataGrid plus a hierarchy, not a new grid.
component:
  name: TreeGrid
  category: data
  status: review
  apg: treegrid
  anatomy: [container, scrollRegion, grid, caption, header, headerRow, columnHeader, sortButton, body, row, rowHeader, expandButton, indent, cell, cellContent, editor, selectCell, selectAllCell, emptyState, statusBar]
  composition:
    caption: Heading
    sortButton: Button
    expandButton: Button
    selectCell: Checkbox
    selectAllCell: Checkbox
    emptyState: Text
    statusBar: Text
  props:
    caption:
      type: string
      required: true
      description: What the tree grid holds ("Chart of accounts").
      a11y: aria-labelledby the caption / accessibilityLabel.
    captionLevel:
      type: enum
      values: ['2', '3', '4']
      default: '2'
      description: As DataGrid.
    hideCaption:
      type: boolean
      default: false
      description: Visually hide the caption; it remains the accessible name.
    columns:
      type: array
      required: true
      shape: 'DataGridColumn[]'
      description: 'DataGrid''s column model. The `isRowHeader` column is required here: it carries the indent and the expand button, so it must exist and come first after the selection column — never pinned, never reordered, because the guide lines are measured from its start.'
    data:
      type: array
      required: true
      shape: 'TreeRow[] where TreeRow = { id: string; children?: TreeRow[] | "lazy"; [key: string]: unknown }'
      description: 'Nested rows. `children: "lazy"` marks a row whose children are loaded on expand through `onExpand`; the row shows the expand button and a loading state until `data` is updated. `children: []` is a leaf (no expand button, no aria-expanded).'
    expanded:
      type: array
      shape: 'string[]'
      description: 'Controlled ids of expanded rows. A still-`"lazy"` id here is held collapsed until the user opens it, exactly as in `defaultExpanded`; the id stays in the caller''s array and in what onExpandChange reports, and no onExpand fires for it.'
      controls:
        event: onExpandChange
        default: defaultExpanded
    defaultExpanded:
      type: array
      shape: 'string[]'
      description: 'Initially expanded ids. `["*"]` expands every row whose `children` is a non-empty array, including rows loaded later, and never a `"lazy"` row (that would fire onExpand without a user act); `"*"` is honoured the same way in controlled `expanded`, and the first user toggle resolves it to concrete ids, which is what onExpandChange reports. A lazy id listed explicitly stays collapsed until the user opens it, in `defaultExpanded` and in the controlled `expanded` alike — so a lazy row cannot be opened programmatically at all; the caller opens it by replacing its `children`. The `*` key is a user act and does open lazy siblings, firing onExpand for each; the native expandAll action does the same over every loaded row.'
    sort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Sort applies within each level; siblings are ordered, hierarchy is kept.
      controls:
        event: onSortChange
        default: defaultSort
    defaultSort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: As DataGrid.
    selectable:
      type: enum
      values: [none, row, cell]
      default: none
      description: 'As DataGrid without `range` (rectangles across levels are not meaningful). `row` selection of a parent does not select its children unless `selectChildren`. Select-all (Ctrl+A, the select-all Checkbox) covers every loaded row at every level, expanded or not, with or without `selectChildren`.'
    selected:
      type: array
      shape: 'string[]'
      description: As DataGrid.
      controls:
        event: onSelectionChange
        default: defaultSelected
    defaultSelected:
      type: array
      shape: 'string[]'
      description: Initially selected row ids.
    selectChildren:
      type: boolean
      default: false
      description: 'Toggling a parent row sets or clears its own id and every loaded descendant; a parent''s shown state is derived from its loaded descendants (checked when all, even if its own id is absent; indeterminate when some; else its own id), and toggling a row shown checked clears its id and descendants while any other state sets them. An indeterminate row reports aria-selected="false". Space, Enter on the select cell, a click on its Checkbox and Ctrl/Cmd+click are all the row''s own toggle and cascade; only Shift+Space and Shift+click ranges do not. A `"lazy"` subtree contributes nothing until loaded.'
    editable:
      type: boolean
      default: false
      description: As DataGrid.
    density:
      type: enum
      values: [compact, comfortable]
      default: compact
      description: As DataGrid.
    height:
      type: enum
      values: [content, viewport, fixed]
      default: viewport
      description: 'As DataGrid: `viewport` and `fixed` both size the whole component, and the scroll region takes what the caption and status bar leave.'
    loading:
      type: boolean
      default: false
      description: As DataGrid.
    showStatusBar:
      type: boolean
      default: true
      description: As DataGrid.
    stickyHeader:
      type: boolean
      default: true
      description: As DataGrid.
    emptyMessage:
      type: string
      description: As DataGrid.
  events:
    onExpandChange:
      description: 'Fired with the new array of expanded ids (the bare array, as Tree; not wrapped in an object).'
      platforms: { web: onExpandChange, lit: expand-change, rn: onExpandChange, swiftui: onExpandChange }
      payload:
        - { name: ids, type: array, shape: 'string[]', description: 'Every expanded id, as a bare array.' }
      fires: [user]
    onExpand:
      description: 'Fired with its id (bare string) each time a row whose `children` is still `"lazy"` is expanded, so a failed load can retry; once the caller replaces `children` it never fires again for that row. It fires before the onExpandChange of the same act; `*` fires one onExpand per newly opened lazy row, then one onExpandChange, and nothing when no row opens.'
      platforms: { web: onExpand, lit: expand, rn: onExpand, swiftui: onExpand }
      payload:
        - { name: id, type: string, description: The expanded row. }
      fires: [user]
    onSortChange:
      description: As DataGrid.
      platforms: { web: onSortChange, lit: sort-change, rn: onSortChange, swiftui: onSortChange }
      payload:
        - { name: column, type: string, description: The key of the column now sorted on. }
        - { name: direction, type: enum, values: [ascending, descending] }
      fires: [user]
    onSelectionChange:
      description: As DataGrid (row ids or one cell).
      platforms: { web: onSelectionChange, lit: selection-change, rn: onSelectionChange, swiftui: onSelectionChange }
      payload:
        - { name: selection, type: union, shape: 'string[] | { rowId: string; column: string }', description: 'Row ids, or one cell, matching selectable.' }
      fires: [user]
    onCellChange:
      description: As DataGrid.
      platforms: { web: onCellChange, lit: cell-change, rn: onCellChange, swiftui: onCellChange }
      payload:
        - { name: rowId, type: string, description: The row that was edited. }
        - { name: column, type: string, description: The key of the edited column. }
        - { name: value, type: union, shape: 'string | number | boolean | undefined', description: 'The committed value, as the column editor produces it; undefined when cleared, as DataGrid (never coerced to an empty string). A text editor the user empties commits `''''` — only Delete/Backspace and an emptied number editor produce undefined. A cell holding a value the column `render`s reports `String(value)`.' }
        - { name: previous, type: union, shape: 'string | number | boolean | undefined', description: 'The value the cell held before the edit; undefined when the row had none.' }
      fires: [user]
      timing: { phase: request }
    onEditStart:
      description: As DataGrid.
      platforms: { web: onEditStart, lit: edit-start, rn: onEditStart, swiftui: onEditStart }
      payload:
        - { name: rowId, type: string, description: The row about to be edited. }
        - { name: column, type: string, description: The key of the column about to be edited. }
      cancelable: true
      fires: [user]
      timing: { phase: before-change }
    onColumnResize:
      description: As DataGrid.
      platforms: { web: onColumnResize, lit: column-resize, rn: onColumnResize, swiftui: onColumnResize }
      payload:
        - { name: column, type: string, description: The key of the resized column. }
        - { name: width, type: number, description: Its new width. }
      fires: [user]
      timing: { phase: commit }
  keyboard:
    - { keys: [Tab], action: 'Enters and leaves the grid — one tab stop, as DataGrid.', from: any, expect: manual }
    - { keys: [ArrowDown, ArrowUp], action: 'Next / previous visible row, same column. Collapsed descendants are skipped because they are not rendered.', from: inside, expect: manual }
    - { keys: [ArrowRight], action: 'On a collapsed row header: expands. On an expanded row header: moves to the next cell. On any other cell: next cell.', from: inside, expect: manual }
    - { keys: [ArrowLeft], action: 'On a row header of an expanded row: collapses. On a row header of a collapsed or leaf row: moves focus to the parent row''s header; at level 1 (no parent) it moves to the previous cell. On any other cell: previous cell. On a loading placeholder row: moves to its parent.', from: inside, expect: manual }
    - { keys: [Home, End], action: 'First / last cell in the row (Ctrl: first / last cell of the grid, the header row included, as DataGrid).', from: inside, expect: manual }
    - { keys: [Enter], action: 'On a row header of a row with children: toggles expansion — always, never edits, even when that column is editable (F2 is the edit path for an editable parent row header). On a leaf row header: DataGrid''s order (edit if editable, else activate a control inside it). Elsewhere as DataGrid: sort, edit, activate.', from: inside, expect: manual }
    - { keys: ['*'], action: 'Expands every row at the focused row''s level under the same parent, the focused row included; a `"lazy"` sibling opens too and fires its onExpand, unlike `defaultExpanded: ["*"]`, because this is a user act.', from: inside, expect: manual }
    - { keys: [F2, Escape, ' ', Control+a, Shift+Space], action: 'As DataGrid. Escape cancels an open editor and returns focus from a control inside a cell to the grid; on the grid itself it does nothing (there is no range here to clear, and no collapse-all), which is also all `escape-dismiss` asks of a component with no overlay. Control+a selects every loaded row in `row` mode and is unhandled in `cell` and `none`. Shift+Space extends the row selection from the last plain-Space anchor through the focused row, over the visible rows only — a range does not cascade into descendants even with selectChildren, which is a per-row act; when that anchor row is no longer visible (its subtree was collapsed, or sorting moved it) Shift+Space is a plain, non-cascading toggle of the focused row. Shift with the arrows keeps their own meaning here (column navigation, expand and collapse) and never selects. Control means Control or Meta, as DataGrid.', from: inside, expect: manual }
    - { keys: [PageDown, PageUp, Delete, Backspace], action: 'As DataGrid: Page keys move one visible page of rows; Delete/Backspace clear editable cells in the selection — in `row` mode every editable cell of every selected row, in `cell` and `none` the active cell alone. Typing a printable character opens an editor, as DataGrid (the character seeds the text and number editors only; select, date and checkbox editors open unseeded).', from: inside, expect: manual }
    - { keys: [Shift+ArrowRight, Shift+ArrowLeft], action: 'Widens / narrows the column by DataGrid''s resizeStep and fires onColumnResize on release of Shift, as DataGrid; in the body Shift+arrows keep their navigation meaning.', when: focus on the header cell of a resizable column, from: inside, expect: manual }
  styles:
    indent: { token: space.5, part: indent, description: 'Per level: the `indent` part is a spacer at the start of the row header, indent × (level − 1) wide, so the cell keeps its own inline padding. Level 1 has none.' }
    expandButtonSize: { token: size.target.min, part: expandButton, description: 'Inline width reserved for the expand control in the row header (the guide lines align to its centre); minTarget is the locked row-height floor.' }
    expandGap: { token: layout.gap.tight, description: 'Between the expand button and the row header text.' }
    guideLine: { token: color.border, description: 'One vertical line per ancestor level, drawn the full height of every descendant row and aligned with that ancestor''s expand button (indent guides; no elbows, no termination at the last child). Always drawn, at both densities. Drawn inside the row header cell (so they move with it), at cellPaddingInline + indent × (ancestor level − 1) + expandButtonSize / 2 from the cell''s start.' }
    cellPaddingInline: { token: space.2, description: 'As DataGrid; also the base of the guide line offset.' }
    fixedHeight: { token: space.20, description: 'As DataGrid: the height for `height: fixed`, sizing the whole component with the scroll region taking what the caption and status bar leave; overridable by design.' }
    guideLineWidth: { token: border.width.thin }
    parentWeight: { token: font.weight.medium, description: 'Row headers of rows with children.' }
    loadingColor: { token: color.foreground.muted, description: 'The lazy-loading placeholder text in a just-expanded row.' }
    transition: { token: motion.duration.fast, description: 'The chevron rotation on expand, and nothing else TreeGrid owns: rows appear instantly (no height animation in a virtualized grid), and the row hover and editor-open transitions are DataGrid''s, at DataGrid''s own token.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    minTarget: { token: size.target.min }
  copy:
    expand:
      text: 'Expand {rowName}'
      params:
        rowName: { type: string, description: The row's name from its row-header cell. }
    collapse:
      text: 'Collapse {rowName}'
      params:
        rowName: { type: string, description: The row's name from its row-header cell. }
    level:
      text: 'Level {level}'
      params:
        level: { type: number, description: The row's depth in the tree. }
      platforms: [rn, swiftui]
    childCount:
      plural:
        by: count
        one: '{count} item'
        other: '{count} items'
      params:
        count: { type: number, description: How many children the row has. }
      platforms: [rn, swiftui]
    loading: Loading
    expandAll:
      text: Expand all
      platforms: [rn, swiftui]
    collapseAll:
      text: Collapse all
      platforms: [rn, swiftui]
    editHint:
      text: Opens the cell editor
      platforms: [rn]
    empty: Nothing to show.
    sortAscending:
      text: 'Sort by {column}, ascending'
      params:
        column: { type: string, description: The column header text. }
    sortDescending:
      text: 'Sort by {column}, descending'
      params:
        column: { type: string, description: The column header text. }
    sortedAnnouncement:
      text: 'Sorted by {column}, {direction}'
      params:
        column: { type: string, description: The column header text. }
        direction: { type: string, description: 'The new direction: ascending or descending.' }
    selectAll: Select all rows
    selectRow:
      text: 'Select {rowName}'
      params:
        rowName: { type: string, description: The row's name from its row-header cell. }
    selectedRows:
      text: '{count} of {total} rows selected'
      params:
        count: { type: number, description: How many rows are selected. }
        total: { type: number, description: 'Every loaded row at every level, expanded or not — deliberately a different number from aria-rowcount, which counts the visible rows plus the header: the status bar counts the data, the ARIA attributes count what is rendered. The lazy placeholder row counts in neither.' }
    editing:
      text: 'Editing {column}. Enter to save, Escape to cancel.'
      params:
        column: { type: string, description: The column header text. }
    invalid:
      text: '{message}'
      params:
        message: { type: string, description: The message the column's validate returned. }
    rowCount:
      plural:
        by: count
        one: '{count} row'
        other: '{count} rows'
      params:
        count: { type: number, description: 'Every loaded row at every level, expanded or not.' }
    position:
      text: 'Row {row}, {column}'
      params:
        row: { type: number, description: 'The active cell''s row number among the visible rows (the active row + 1), so it agrees with aria-rowindex rather than with copy.rowCount''s total.' }
        column: { type: string, description: The column header text. }
    resize:
      text: 'Resize {column}'
      params:
        column: { type: string, description: The column header text. }
    scrollHint: Scroll sideways to see more columns
  a11y:
    role: treegrid
    requires: [accessible-name, keyboard-operable, arrow-navigation, roving-tabindex, expanded-state, focus-visible, selected-state, live-region, contrast-aa, target-24px, escape-dismiss]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=treegrid, role=row, aria-level, aria-expanded, aria-setsize, aria-posinset, aria-rowindex, aria-colindex, aria-rowcount, aria-activedescendant]
      notes: 'DataGrid''s structure with role="treegrid" on the container and, on every row, aria-level, aria-setsize and aria-posinset (among its siblings), plus aria-expanded on rows that have children (absent on leaves — a leaf must not say "collapsed"). The flattened visible-row list is what gets virtualized and indexed with aria-rowindex, so collapsing removes rows from the list. The expand control is a Button (ghost, sm, iconOnly, chevron-right Icon, `overrides` paddingInline/paddingBlock space.0, label copy.expand/collapse) inside the row header cell with tabindex=-1; it is a pointer convenience — ArrowLeft/Right are the keyboard path. The `expandButton` part is the span TreeGrid owns around that Button (the Button keeps its own data-part, as in Tree): the span is the pointer target, carries the rotation — never the Icon — and carries aria-hidden="true", which hides the Button as a descendant, since the row already exposes aria-expanded. In RTL the collapsed chevron is mirrored. Indent is the `indent` spacer part at the start of the row header. Lazy children: on expand set aria-busy on the row and render one placeholder child row until data arrives — a navigable row (level + 1, setsize 1, posinset 1) with copy.loading in the row-header column and the other cells empty, not selectable or editable; it is counted by aria-rowindex and aria-rowcount but by neither copy.rowCount nor copy.selectedRows, which count loaded data rows. The caption Heading gets captionLevel and marginBlockEnd space.0, and DataGrid''s captionGap does the spacing, as DataGrid. Every binding DataGrid declares that TreeGrid does not — column width, header, grid lines, row height, row hover and selection, status bar, caption, pinned shadow, resize handle, resizeStep, the fonts — applies at DataGrid''s own default token and is not overridable on TreeGrid except cellPaddingInline and fixedHeight; the two move together by design, so changing a DataGrid default changes TreeGrid.'
    lit:
      tag: ds-tree-grid
      reflect: [selectable, select-children, editable, density, height, loading, hide-caption, caption-level, { prop: showStatusBar, attribute: no-status-bar }, { prop: stickyHeader, attribute: no-sticky-header }]
      notes: 'Its own element following ds-data-grid''s structure, keyboard handling and CSS (a shared base class is a welcome package refactor, not a requirement; the copy strings above are TreeGrid''s own, so no copy is imported from DataGrid; a type-only import of DataGridColumn is expected). `expanded` and `selected` as properties; composed `expand-change`, `expand` with bare detail values.'
    rn:
      element: FlatList
      props: [role=grid, accessibilityLabel, getItemLayout]
      notes: 'DataGrid''s list over the flattened visible rows (role="grid" via the ARIA-aligned `role` prop, as DataGrid); the root View exposes expandAll/collapseAll accessibility actions named from copy; each row header cell has accessibilityState={{ expanded }} when it has children, accessibilityLabel of rowName, copy.level and copy.childCount joined with ", " (the count is left out for leaves and for lazy rows not yet loaded), and its own accessibilityActions expand/collapse. Native has no row position in set: only level and child count are conveyed. The expand Button is a real touch target (minimum size) since there are no arrow keys, and it stays accessible, named with copy.expand/collapse, exactly as Tree''s chevron — it is not hidden from accessibility here, because a focusable control inside an aria-hidden wrapper is an axe failure on react-native-web and Button has no non-focusable option; the row header''s expand/collapse actions are the other path to the same act. Pressing a row header with children toggles it and never selects the cell, `selectable: "cell"` included; a leaf follows DataGrid''s order (select the cell, then edit when editable), and long-pressing an editable row header edits. Cells carry accessibilityLabel "{column}: {value}" and, when editable, accessibilityHint copy.editHint, as DataGrid. The lazy placeholder row announces copy.loading with copy.level and no child count, and is neither selectable nor editable. The keyboard table has no native path beyond Enter and the editor''s Enter/Escape — View and Pressable have no key events — so the arrows, Home/End, `*`, F2, Space, Shift+Space, Control+a, the Page keys, Delete/Backspace and Shift+arrow resize are all replaced by: the row header''s expand/collapse actions, the root expandAll/collapseAll (every loaded row, not only siblings), the select Checkboxes, the header cell''s increment/decrement resize actions, and the editing cell''s activate/escape actions — the last of which is also what answers `escape-dismiss`, TreeGrid having no overlay. Two parts have no element here: `body` (FlatList gives the rows no wrapper, as DataGrid) and the guide lines, which are not a declared part at all — they are decoration drawn inside the row header cell.'
    swiftui:
      element: ScrollView
      props: [ScrollView=both-axes, LazyVStack, .accessibilityValue=expanded, .accessibilityAction, Button, .onMoveCommand, '@FocusState']
      notes: 'DataGrid''s structure over the flattened visible rows; each row header cell carries `.accessibilityValue(''level {n}, {count} items, expanded/collapsed'')` from copy and custom actions `expand`/`collapse`, with the visible expand `Button` at minimum target size; the root offers `expandAll`/`collapseAll` custom actions. ArrowLeft/Right/`*` per the keyboard table on iPad; guide lines drawn as one `Rectangle` per ancestor level per row; indent by level from the token. Everything else as DataGrid.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema. Cell movement
    # runs an aria-activedescendant no clause can state, so what is asserted here is what the grid reports:
    # its events and the expanded and selected states.
    - name: the-expand-button-expands-a-row
      description: Rows with children show a chevron in the row header; onExpandChange reports the new set of expanded ids.
      given:
        defaultExpanded: []
        columns:
          - { key: account, header: Account, isRowHeader: true }
          - { key: balance, header: Balance, align: end }
        data:
          - { id: assets, account: Assets, balance: 100, children: [{ id: cash, account: Cash, balance: 40 }] }
      when: { click: expandButton }
      then:
        - { event: onExpandChange }
    - name: expanding-a-lazy-row-asks-for-its-children
      description: 'children: "lazy" marks a row whose children are loaded on first expand through onExpand, so a failed load can retry.'
      given:
        defaultExpanded: []
        columns:
          - { key: account, header: Account, isRowHeader: true }
        data:
          - { id: assets, account: Assets, children: lazy }
      when: { click: expandButton }
      then:
        - { event: onExpand }
        - { event: onExpandChange }
    - name: a-collapsed-parent-row-reports-it
      given:
        defaultExpanded: []
        columns:
          - { key: account, header: Account, isRowHeader: true }
        data:
          - { id: assets, account: Assets, children: [{ id: cash, account: Cash }] }
      then:
        - { attribute: aria-expanded, is: 'false', 'on': row }
      platforms: [web]
    - name: an-expanded-parent-row-reports-it
      given:
        defaultExpanded: [assets]
        columns:
          - { key: account, header: Account, isRowHeader: true }
        data:
          - { id: assets, account: Assets, children: [{ id: cash, account: Cash }] }
      then:
        - { attribute: aria-expanded, is: 'true', 'on': row }
      platforms: [web]
    - name: activating-a-sortable-header-reports-the-sort
      description: Sorting orders siblings within each parent and keeps the tree; the grid sorts siblings itself when `sort` is not controlled, as DataGrid.
      given:
        columns:
          - { key: account, header: Account, isRowHeader: true }
          - { key: balance, header: Balance, align: end, sortable: true }
        data:
          - { id: assets, account: Assets, balance: 100 }
          - { id: equity, account: Equity, balance: 50 }
      when: { click: sortButton }
      then:
        - { event: onSortChange }
    - name: selecting-a-row-reports-the-selection
      given:
        selectable: row
        columns:
          - { key: account, header: Account, isRowHeader: true }
        data:
          - { id: assets, account: Assets }
          - { id: equity, account: Equity }
      when: { click: selectCell }
      then:
        - { event: onSelectionChange }
    - name: a-selected-row-is-marked-selected
      given:
        selectable: row
        selected: [assets]
        columns:
          - { key: account, header: Account, isRowHeader: true }
        data:
          - { id: assets, account: Assets }
          - { id: equity, account: Equity }
      then:
        - { attribute: aria-selected, is: 'true', 'on': row }
      platforms: [web]
    - name: the-empty-message-shows-when-there-are-no-rows
      given:
        columns:
          - { key: account, header: Account, isRowHeader: true }
        data: []
      then:
        - { copy: empty }
  examples:
    - name: chart-of-accounts
      description: Nested accounts with their balances, the top level expanded.
      given:
        caption: Chart of accounts
        defaultExpanded: [assets]
        columns:
          - { key: account, header: Account, isRowHeader: true, width: 240 }
          - { key: balance, header: Balance, align: end }
        data:
          - { id: assets, account: Assets, balance: 1400, children: [{ id: cash, account: Cash, balance: 400 }, { id: stock, account: Stock, balance: 1000 }] }
          - { id: equity, account: Equity, balance: 1400 }
    - name: lazy-folders
      description: A deep tree whose children are fetched the first time a row is expanded.
      given:
        caption: Files
        columns:
          - { key: name, header: Name, isRowHeader: true }
          - { key: size, header: Size, align: end }
        data:
          - { id: docs, name: Documents, size: 0, children: lazy }
          - { id: media, name: Media, size: 0, children: lazy }
    - name: cascading-selection
      description: Selection that means "this row and everything in it", with indeterminate parents.
      given:
        caption: Bill of materials
        selectable: row
        selectChildren: true
        defaultExpanded: ['*']
        columns:
          - { key: part, header: Part, isRowHeader: true }
          - { key: quantity, header: Quantity, align: end }
        data:
          - { id: frame, part: Frame, quantity: 1, children: [{ id: bolt, part: Bolt, quantity: 8 }] }
    - name: editable-quantities
      description: A nested grid that is worked in, where the quantity column takes a number editor.
      given:
        caption: Bill of materials
        editable: true
        defaultExpanded: ['*']
        columns:
          - { key: part, header: Part, isRowHeader: true }
          - { key: quantity, header: Quantity, align: end, editable: true, editor: number }
        data:
          - { id: frame, part: Frame, quantity: 1, children: [{ id: bolt, part: Bolt, quantity: 8 }] }
---

A tree grid is a data grid where rows have rows inside them. The hierarchy lives in the row-header column — indent, a chevron, a level announced to screen readers — and everything else is DataGrid: same columns, same cell navigation, same editors. Collapsing a parent removes its descendants from the visible list, which is also the virtualized list, so a hundred thousand leaf rows cost nothing until they are opened.

## When to use

Use a TreeGrid when records nest and each record has several comparable fields: a chart of accounts with balances, folders and files with sizes and dates, a bill of materials with quantities and costs, an org chart with headcount. Use `children: "lazy"` for deep or large trees so the first paint is fast. Use `selectChildren` when selection means "this and everything in it" (a folder to export).

## When not to use

Do not use a TreeGrid for a hierarchy with one field per node — a navigation tree, a file picker with names only — that is a Tree. Do not use it for flat data (DataGrid) or for content people read row by row (Table). Do not nest more than about six levels; past that, give the user a way to open a subtree as its own root (a Breadcrumb above the grid).

## Behavior

Rows with children show a chevron in the row header; ArrowRight expands, ArrowLeft collapses or moves to the parent, `*` expands all siblings, Enter on the row header toggles. Expanded ids are controlled or uncontrolled; `onExpandChange` reports them. Lazy rows show a loading placeholder child until the caller supplies `children`. Sorting orders siblings within each parent and keeps the tree. Row selection with `selectChildren` cascades down and shows indeterminate parents. Vertical navigation moves through visible rows only; everything else — editing, cell selection, status bar, virtualization, pinned and resizable columns, sticky header, controlled and uncontrolled sort and selection — behaves as DataGrid, and the copy strings for those behaviors are TreeGrid's own (listed above, identical to DataGrid's) so each platform package is self-contained. Descendant, parent and sibling lookups are O(n) walks of `data`; only the visible-row list is optimized. `copy.level` and `copy.childCount` are used only in the native accessibilityLabel (web relies on aria-level/aria-setsize/aria-posinset); `copy.expandAll`/`copy.collapseAll` name the native root's expandAll/collapseAll accessibility actions and have no web control (`*` is the keyboard path). `*` expands the focused row along with its siblings, not the siblings alone. TreeGrid has no `rowCount` and no `onRangeNeeded`: only loaded `data` is virtualized, and paging in from a server is per-subtree through `children: "lazy"`. The status bar's live region announces loading, the validation message, the editing hint, the sort and the selection count, as DataGrid; the row count, the scroll hint and the position are shown and never announced. `selectChildren` cascades a row's own id and its loaded descendants when that row's own checkbox is the one used; every other row derives its checked or indeterminate state by counting selected descendants, and a `lazy` subtree contributes nothing until it loads. A `lazy` row fires `onExpand` each time it opens from collapsed, not once ever — a caller that never fills in `children` is asked again. Guide lines are one continuous vertical segment per ancestor depth down every descendant row, not elbows that stop at a subtree's last child.

## Content guidelines

The row header is the node's name; keep it short because it is indented. Show aggregate values on parent rows (a folder's total size, an account's balance) so a collapsed tree still reads. Order children meaningfully by default (by name, by code) and let sorting change it.

## Accessibility

The container is a `treegrid` (APG treegrid) and every row exposes `aria-level`, `aria-setsize` and `aria-posinset`, with `aria-expanded` only on rows that have children, so a screen reader hears "Assets, level 1, 1 of 4, expanded" (WCAG 1.3.1, 4.1.2). Expansion is keyboard-operable through the row itself — ArrowLeft/Right, Enter — with the chevron as a pointer convenience (2.1.1). The visible-row list is what `aria-rowindex` counts, so positions stay honest after collapsing. Focus stays on the row header when a subtree collapses under it (2.4.3). Guide lines are decorative (not checked for contrast) and indent is reinforced by the announced level, never the only signal (1.3.1). Everything else inherits DataGrid's guarantees.

## Platform notes

### Web
Build on DataGrid's structure (a shared hook or base is welcome, not required; a self-contained implementation importing only the DataGridColumn type is fine): flatten `data` by `expanded` into visible rows carrying `level`, `posinset`, `setsize`, `hasChildren`, `parentId`; render the row header cell with the `indent` spacer (`inline-size: calc(var(--ds-tree-grid-indent) * (level - 1))`), the expand `Button` (`aria-hidden`, `tabIndex={-1}`) when `hasChildren`, and the guide line as a `::before` on child rows. Add `role="treegrid"` and the row attributes; extend DataGrid's keydown with the ArrowLeft/ArrowRight/`*` rules on the row-header column. Lazy: on expand of a `"lazy"` row, fire `onExpand`, mark the row `aria-busy`, and render a placeholder child until `children` changes.

### Lit
`<ds-tree-grid caption="Chart of accounts" .columns=${columns} .data=${tree} .expanded=${['assets']}></ds-tree-grid>`; extends the grid base class; composed `expand-change`, `expand`.

### React Native
DataGrid's `FlatList` over the flattened rows; the row header `Pressable` has `accessibilityState.expanded`, `accessibilityActions` expand/collapse, and the visible expand `Button` at minimum target size; indent by level.

## Related

DataGrid, Tree, Table, Breadcrumb.
