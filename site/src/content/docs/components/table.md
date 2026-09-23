---
title: Table
description: Rows and columns of related records — orders, invoices, members — with sortable headers, selectable rows, a sticky header, and a responsive mode that stacks or scrolls without ever losing its table semantics. Static content; the interactive cell grid is DataGrid.
component:
  name: Table
  category: data
  status: review
  apg: table
  anatomy: [container, scrollRegion, table, caption, header, headerRow, columnHeader, sortButton, body, row, rowHeader, cell, selectCell, selectAllCell, stackedLabel, emptyState, footer]
  composition:
    caption: { component: Heading, forwards: { captionSize: fontSize, captionWeight: fontWeight, captionGap: marginBlockEnd } }
    sortButton: { component: Button, props: { variant: ghost, size: sm }, forwards: { headerWeight: fontWeight, cellGap: iconGap } }
    selectCell: Checkbox
    selectAllCell: Checkbox
    emptyState: Text
  props:
    caption:
      type: string
      a11yRole: accessible-name
      required: true
      description: 'What the table lists ("Open invoices"). Rendered as the caption and the accessible name; visually hidden with `hideCaption` when a Heading directly above already says it.'
      a11y: The <caption> (web) / aria-label on the container; never omitted.
    captionLevel:
      type: enum
      values: ['2', '3', '4']
      default: '2'
      description: Heading level of the caption in the page outline; its size is captionSize regardless.
    footer:
      type: content
      description: 'Content below the table: a row count, pagination, a total. Rendered in the `footer` part with the table''s font: a string footer renders in Text (web: inside a `<p>`) with the `fontFamily`/`fontSize`/`lineHeight` bindings; other content brings its own typography (React Native has no cascade). Absent or `false` renders no footer part at all. Lit takes only slotted content in its `footer` slot — the string form has no Lit spelling, so slot a `<ds-text>` — and because `slotchange` only reports for a slot that is in the tree, the Lit wrapper always renders and takes the `footer` part only once something is assigned to it.'
    hideCaption:
      type: boolean
      default: false
      description: 'Visually hide the caption; it remains the accessible name. On web and Lit the caption part is the composed Heading element itself, with no wrapper, so hiding it also sends `space.0` in place of `captionGap`: a hidden caption leaves no gap above the header, and it wins over a `captionGap` override, which does not reinstate one. The visually-hidden clip is what actually takes effect there — its own margin beats the forwarded gap — so the forward states the intent and the clip produces it. React Native has no way to put either the part hook or the hiding on a Heading, so there the caption part is a wrapper View that carries the testID and the clipping.'
    columns:
      type: array
      required: true
      shape: '{ key: string; header: string; abbr?: string; align?: "start" | "end" | "center"; sortable?: boolean; width?: "auto" | "min" | "fill"; isRowHeader?: boolean; hideBelow?: "prose" | "content"; render?: (row: Row) => ReactNode }[]'
      description: 'Column definitions in display order. `header` is the visible heading; `align: end` for numbers; `sortable` adds the sort button; exactly one column may be `isRowHeader` (its cells become row headers, and it is the row''s name when stacked); `hideBelow` drops a column below a layout width in `responsive: stack` only (scrolling tables keep every column), compared against the table''s own measured width as `responsive` is, never the window; `width: min` shrinks to content without wrapping (web: `inline-size: 1%` plus nowrap), `fill` takes the remaining width (web: `inline-size: 100%`); `render` formats the cell (a Text, Link, Meter, or Button — never raw HTML).'
    data:
      type: array
      required: true
      shape: 'Row[] where Row = { id: string; [key: string]: unknown }'
      description: The rows. `id` must be stable; it is what selection and keys use.
    sort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Controlled sort state. The table shows it; the caller sorts the data (so server-side sorting works the same way).
      controls:
        event: onSortChange
        default: defaultSort
    defaultSort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Initial sort for uncontrolled use; the table then sorts `data` itself by the column value (localeCompare for strings, numeric otherwise).
    selectable:
      type: enum
      values: [none, single, multiple]
      default: none
      description: 'Adds a first column of Checkboxes (radio-like behavior for `single`) and a select-all in the header for `multiple`. Selection is row identity, not a visual state alone.'
    selected:
      type: array
      shape: 'string[]'
      description: Controlled selected row ids.
      controls:
        event: onSelectionChange
        default: defaultSelected
    defaultSelected:
      type: array
      shape: 'string[]'
      description: Initially selected ids.
    responsive:
      type: enum
      values: [stack, scroll]
      default: stack
      description: 'Below `layout.maxWidth.prose`: `stack` turns each row into a block with the column header repeated as a label before each value (content tables — orders, people); `scroll` keeps the columns and scrolls horizontally inside a labelled region with the row-header column sticky (data tables where columns are the point). Roles are explicit on every element so both keep table semantics. "Below" compares the table''s own measured width (a container query on web and Lit, onLayout on React Native) with the token, and means strictly less: at exactly `layout.maxWidth.prose` the table is still columnar, and `hideBelow` compares the same way; `scroll` keeps the columns at every width on every platform, phones included.'
    stickyHeader:
      type: boolean
      default: true
      description: 'The header row stays visible while the body scrolls (the page, or `maxHeight`). In `responsive: scroll` the scroll region is the sticky container, so the header sticks only with `maxHeight: viewport`; against the page scroll it has no effect there. React Native sticks the header only when the list scrolls itself — that is, with `maxHeight: viewport` — at every `responsive` value, since the page scroll is not the list''s; the default being inert for a page-scrolled native table logs nothing, since the default is not the caller''s doing. Stacked, what sticks is the whole header row that `responsive: stack` keeps: on web and Lit that means the stacked `thead` is `display: block` and only the row is the flex container, or the sticky band would be sized to its content and stop mid-table.'
    maxHeight:
      type: enum
      values: [none, viewport]
      default: none
      description: '`viewport` caps the table at the viewport height minus two `layout.gap.section` and scrolls a frame around the table (the scroll region itself in `responsive: scroll`), which is also the root of the header-shadow observer; `none` lets the page scroll. React Native measures the cap against the window height — it cannot know what chrome sits above it — and applies it to the list, which is the frame inside the horizontal ScrollView.'
    density:
      type: enum
      values: [compact, comfortable]
      default: comfortable
      description: 'Cell padding: layout.inset.sm or layout.inset.md.'
    striped:
      type: boolean
      default: false
      description: 'Alternate row backgrounds: the even rows carry the tint, so the first data row keeps `surface`. Stacked blocks alternate the same way. Useful past about eight columns; borders are the default row separator.'
    emptyMessage:
      type: string
      description: Shown in place of the body when `data` is empty. Defaults to `copy.empty`.
    loading:
      type: boolean
      default: false
      description: 'Data is being fetched: aria-busy is set on the table element (web and Lit: the `<table role="table">`; React Native: accessibilityState busy on the list) and `copy.loading` shows — with no rows, in the emptyState in place of `emptyMessage`; with rows, as Text `size: sm`, tone muted, in its own polite live region below the table and above the footer — the sort and selection announcements keep the visually-hidden region, so the two never overwrite each other. Existing rows stay visible while re-sorting.'
    rowActions:
      type: function
      shape: '(row: Row) => ReactNode'
      description: 'Renders a trailing actions cell: Buttons (ghost, sm, iconOnly with Tooltip) or a Menu. Kept out of `columns` so the header can be a visually-hidden "Actions".'
  events:
    onSortChange:
      description: Fired when a sortable header is activated, with `{ column, direction }` (cycling ascending → descending on the same column, ascending on a new one).
      platforms: { web: onSortChange, lit: sort-change, rn: onSortChange, swiftui: onSortChange }
      payload:
        - { name: column, type: string, description: The key of the column now sorted on. }
        - { name: direction, type: enum, values: [ascending, descending] }
      fires: [user]
    onSelectionChange:
      description: Fired with the new array of selected ids.
      platforms: { web: onSelectionChange, lit: selection-change, rn: onSelectionChange, swiftui: onSelectionChange }
      payload:
        - { name: selected, type: array, shape: 'string[]', description: The ids of every selected row. }
      fires: [user]
    onRowPress:
      description: 'Fired when a row is activated, with its id. Only when the row has no other interactive content; the row header cell becomes a Button and the row is styled interactive. On web and Lit a pointer click anywhere on the row outside a control also fires it; keyboard and assistive technology use the Button. Lit cannot see whether anyone listens, so rows are interactive only when the host has the `pressable-rows` attribute — a reflected boolean property `pressableRows`. Prefer a Link in the row header for navigation.'
      platforms: { web: onRowPress, lit: row-press, rn: onRowPress, swiftui: onRowPress }
      payload:
        - { name: id, type: string, description: The id of the activated row. }
      fires: [user]
  keyboard:
    - { keys: [Tab], action: 'Moves through interactive content in reading order: select-all, then per row the checkbox, links, buttons and the actions cell. Cells themselves are not focusable — this is a table, not a grid.', from: any, expect: focus-next }
    - { keys: [Enter, ' '], action: 'On a sort button, sorts; on a row checkbox, toggles; on a row header button, activates the row.', from: inside, expect: manual, native: true }
    - { keys: [ArrowRight, ArrowLeft], action: 'In `responsive: scroll` below the breakpoint, the scroll region is focusable and arrows scroll it horizontally.', when: scroll region focused, from: inside, expect: manual }
  styles:
    surface: { token: color.background }
    headerSurface: { token: color.background.subtle, part: header }
    headerColor: { token: color.foreground, part: header }
    headerWeight: { token: font.weight.semibold, part: header }
    headerSize: { token: font.size.sm, part: header }
    headerBorder: { token: color.border.strong, part: header }
    headerBorderWidth: { token: border.width.thin, part: header }
    headerShadow: { token: shadow.raised, part: header, description: 'Shown under the sticky header only once the body has scrolled beneath it.' }
    rowBorder: { token: color.border, part: row }
    rowBorderWidth: { token: border.width.thin, part: row }
    rowStripe: { token: color.background.subtle, part: row }
    rowHover: { token: color.action.ghost.backgroundHover, part: row, state: hover, description: 'Interactive rows only (onRowPress or a Link in the row header). Hover never appears on plain rows. A `render` function''s output cannot be inspected, so web and Lit find the link with a `:has()` selector on the row-header cell — hover alone, with neither the pointer cursor nor the row press that `onRowPress` rows get — and React Native, which has no such selector, tints only `onRowPress` rows.' }
    rowSelected: { token: color.background.subtle, part: row, description: 'Same tint as a stripe; the start-edge bar and the checkbox are what say selected.' }
    rowSelectedBorder: { token: color.control.selectedBackground, part: row, description: 'A start-edge bar on selected rows, so selection is not color-fill alone. It never shifts content: web and Lit draw it as an inset box-shadow on the row''s first cell (on the row itself when stacked), mirrored under RTL; React Native always reserves a start border of `rowSelectedBorderWidth`, coloured as the row background on an unselected row in the column layout and as `rowBorder` on an unselected stacked block, so the block''s outline stays unbroken.' }
    rowSelectedBorderWidth: { token: border.width.focus, part: row }
    cellColor: { token: color.foreground, part: cell }
    cellMutedColor: { token: color.foreground.muted, part: cell, description: 'Secondary values (a date beside a title) rendered with Text tone muted.' }
    cellPaddingInline: { token: layout.inset.md, part: cell, by: density, values: { compact: layout.inset.sm } }
    cellPaddingBlock: { token: space.sm, part: cell }
    cellGap: { token: layout.gap.tight, part: cell, description: 'Between a sort button''s label and its arrow, and between actions in the actions cell.' }
    captionSize: { token: font.size.md, part: caption }
    captionWeight: { token: font.weight.semibold, part: caption }
    captionGap: { token: space.2, part: caption, description: 'Between caption and header.' }
    stackedRowInset: { token: layout.inset.md }
    stackedRowGap: { token: layout.gap.tight, description: Between label/value pairs inside a stacked row. }
    stackedBlockGap: { token: layout.gap.tight, description: 'Between stacked row blocks: the body''s gap (web and Lit: the stacked tbody grid; React Native: the list''s contentContainerStyle gap). Each block is outlined with `rowBorder`/`rowBorderWidth` on `stackedRowRadius`.' }
    stackedLabelColor: { token: color.foreground.muted, part: stackedLabel }
    stackedLabelSize: { token: font.size.xs, part: stackedLabel }
    stackedLabelWeight: { token: font.weight.medium, part: stackedLabel }
    stackedRowRadius: { token: radius.md }
    stickyColumnShadow: { token: shadow.raised, description: '`responsive: scroll`: the sticky row-header column casts this once scrolled.' }
    scrollFade: { token: space.6, description: 'Edge fade width on the scroll region; an edge fades only while columns are hidden past it, measured as the scroll offset against `scrollWidth − clientWidth` with a 1px tolerance and re-measured on scroll and on size changes, with the mask flipped under RTL. The mask covers the scrolling content only, never the region''s own focus ring, which stays whole at a faded edge: a mask clips everything its element paints, so on web and Lit the ring is drawn by an unnamed wrapper around the scroll region (`:has()` on the region''s `:focus-visible`) while the region itself sets `outline: none`. That wrapper is not an anatomy part and exists in this mode alone. React Native draws it with react-native-svg, as Toolbar does.' }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.sm }
    lineHeight: { token: font.lineHeight.normal }
    numericFont: { token: font.family.mono, description: 'Body cells of columns with align end always use this family plus tabular figures (`font-variant-numeric: tabular-nums` on web and Lit) — no platform can detect whether the body font has tabular figures, so there is no fallback test.' }
    minTarget: { token: size.target.min }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    transition: { token: motion.duration.fast, description: 'The interactive row''s hover background only; the sort arrow is a swapped Icon inside the Button and changes instantly, as does sorting itself.' }
  copy:
    sortToolbarLabel: 'Sort {caption}'
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
    selectedCount:
      text: '{count} of {total} selected'
      params:
        count: { type: number, description: How many rows are selected. }
        total: { type: number, description: How many rows the table has. }
    cellLabel:
      text: '{column}: {value}'
      params:
        column: { type: string, description: The column header text. }
        value: { type: string, description: The cell's text. }
    actions: Actions
    empty: Nothing to show.
    loading: Loading
    scrollHint: 'Scroll sideways to see more columns'
    rowCount:
      plural:
        by: count
        one: '{count} row'
        other: '{count} rows'
      params:
        count: { type: number, description: How many rows the table has. }
  a11y:
    role: table
    requires: [accessible-name, keyboard-operable, arrow-navigation, focus-visible, contrast-aa, target-24px, selected-state, live-region, no-hover-only]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground, background: color.background.subtle, level: AA }
      - { foreground: color.foreground.muted, background: color.background.subtle, level: AA }
      - { foreground: color.link, background: color.background.subtle, level: AA }
      - { foreground: color.control.selectedBackground, background: color.background.subtle, level: AA, nonText: true }
  platforms:
    web:
      element: div
      attributes: [role=table, role=rowgroup, role=row, role=columnheader, role=rowheader, role=cell, aria-sort, aria-selected, aria-busy, aria-rowcount, aria-colcount, aria-describedby, scope, abbr, tabindex]
      notes: 'The root is the container <div data-ds="Table"> — what a `ref` reaches — holding the caption Heading, the scroll region and the table; aria-busy, aria-rowcount and aria-colcount sit on the inner <table role="table">; the row count is the data rows plus the header row, and the column count includes the selection and actions columns — every row and cell the table renders, not only those from `columns`. Native <table><thead><tbody> with EVERY role stated explicitly (role="table" on the table, "rowgroup" on thead/tbody, "row" on tr, "columnheader"/"rowheader"/"cell" on th/td) — browsers drop the implicit table roles as soon as CSS changes display on any of these elements, which the stacked layout and sticky positioning do. The caption is the composed Heading at `captionLevel`, rendered as a sibling above the <table> inside the container and referenced by aria-labelledby — not inside a <caption> element. With role="table" stated, ARIA lets the table own only rows and rowgroups, so a heading inside <caption> is an invalid owned child and every instance fails the aria-required-children check; a labelled sibling is the same name to a screen reader and costs nothing. `hideCaption` visually hides that heading and keeps it as the name. Column headers: <th scope="col" abbr>; the row-header column: <th scope="row">. Sort: a Button (ghost, sm) inside the columnheader with aria-sort on the th and a visually-hidden live region announcing copy.sortedAnnouncement. Selection: Checkbox in the first cell, aria-selected on the tr, live region for copy.selectedCount. `responsive: stack` below the prose breakpoint: a container query switches tr/td to display block/grid, plain column headers are visually hidden (not display none, so the columnheaders remain in the tree) while the select-all header and sortable headers stay visible as a row that wraps on `stackedRowGap` and keeps the header cell styling, so no focusable control is invisible; each td gets a ::before from a data-label attribute holding the header text, hidden from assistive technology with empty alternative text (`content: attr(data-label) / ""`, after a plain `content: attr(data-label)` fallback) as the text is already associated by the roles. The row header gets no data-label: it is the row''s name. A stacked cell is a block at the full row width, so the stacked rules also reset `white-space` to normal: the width-min column sets `nowrap` to shrink-wrap itself in the columnar layout, and left set it pushes its longest line past the container on a phone. `responsive: scroll`: the table sits in a <div role="region" aria-labelledby={captionId} tabindex="0"> with overflow-x auto, faded edges, and the row-header column position: sticky. Sticky header: thead th position: sticky top 0 with the shadow toggled by an IntersectionObserver sentinel. rowActions cell has a visually-hidden columnheader "Actions", and carries the same text as its data-label so the stacked layout labels the action row like every other cell. With `selectable: single` the header''s selection position is an empty <td role="cell"> with no part (an empty columnheader would have no name); React Native mirrors it as an unlabelled spacer at the select-cell width so the columns stay aligned. Button and Checkbox write their own part hooks, so the three parts that name a composed control are wrappers, as Carousel''s control wrappers are: `sortButton` is a <span data-part="sortButton"> around the Button inside the columnHeader, and `selectCell`/`selectAllCell` are the <td>/<th> holding the Checkbox. Activating one of those wrappers runs the control''s own action — a click in a selection cell toggles its Checkbox and does not also fire `onRowPress` — so the part is the thing a test can press; on React Native the wrapper View is inert and carries the testID alone, since a Pressable around a composed control would be a second accessibility element. `copy.rowCount` is chosen with Intl.PluralRules for `document.documentElement.lang`, falling back to the runtime default (React Native has no document, so it always uses the runtime default locale). Each theme''s CSS build stamps its own prose and content widths into the container queries, so a theme with another content width ships another stylesheet; no rebuilt number ever reaches a package built for a different theme. Rows are keyed by id; no virtualization in this component (that is DataGrid).'
    lit:
      tag: ds-table
      reflect: [selectable, responsive, { prop: stickyHeader, attribute: no-sticky-header }, max-height, density, striped, loading, hide-caption]
      notes: '`columns` and `data` are properties; the whole <table> renders inside the shadow root from them (slotting <tr> elements across the shadow boundary breaks table semantics, so rows are never light DOM). Cell `render` functions return lit templates. Composed `sort-change`, `selection-change`, `row-press`; rows are pressable only with the `pressable-rows` attribute, a reflected boolean property `pressableRows` that is Lit''s alone (no other platform has it, since they can see their own listeners). `captionLevel` is the unreflected `caption-level` attribute. aria-busy and the accessible name are on the shadow <table role="table">, not the host, which has no role. Container queries on :host — and an element''s `css` compiles into the package once, so unlike web, which ships a stylesheet per theme, the prose and content widths are baked into the built element: a theme with other widths needs the Lit package rebuilt, not another stylesheet.'
    rn:
      element: FlatList
      props: [accessibilityRole=list, accessibilityLabel, stickyHeaderIndices]
      notes: 'No table element on native. The layout follows `responsive` against the table''s onLayout width (window width before the first layout), not the device type. The list owns list items and nothing else: the header row, every row and the empty state carry accessibilityRole="listitem", so react-native-web renders a <ul role="list"> of <li>s with the header cells, sort Buttons and Checkboxes inside them rather than owned directly. Native limits: react-native-web drops accessibilityState.selected, so on that build a selected row is said by its Checkbox and the start-edge bar while native keeps the trait, and accessibilityLiveRegion is Android-only, so `loading` with rows is announced on Android and read as visible text elsewhere — the sort and selection announcements stay the only ones iOS speaks, which is what keeps them from overwriting each other. The FlatList is both the scroll container and the body, so it carries testID "Table.table" and the `body` part has no element on this platform — the one anatomy part native lacks. `headerShadow` and `stickyColumnShadow` are spread onto the header and pinned-cell Views themselves rather than an extra wrapper; on Android that elevation can clip against the scroll region, which is accepted rather than paid for with another View. `copy.scrollHint` describes the scroll region whenever `responsive: scroll`, whether or not anything is hidden past an edge. Stacked (`stack` below layout.maxWidth.prose): a FlatList (accessibilityRole="list", accessibilityLabel from caption, accessibilityHint from copy.rowCount) whose rows are accessible Views with an accessibilityLabel that reads "{header}: {value}" for each visible column, the row header first, plus "selected" state — the actions cell is not in that summary, since its Buttons are separate stops inside the block; selection Checkbox and rowActions inside; sort controls are a Toolbar of Buttons above the list, which carry no Table.sortButton testID (a wrapper View would not receive Toolbar''s size); that Toolbar takes Table''s own `density` (the two share the compact/comfortable values) and `size: sm`, and is named `copy.sortToolbarLabel` even when the select-all Checkbox is all it holds. Otherwise, and for `scroll` at every width: a header row View (accessibilityRole="header" cells) and rows as horizontal Views with fixed column widths, `scroll` in a horizontal ScrollView whose row-header cells are pinned by translating them with the horizontal scroll offset (Animated translateX; no second list), casting stickyColumnShadow once scrolled. Hover (rowHover) exists only for react-native-web pointers, through Pressable onHoverIn/onHoverOut. No hardware-keyboard arrow scrolling: ScrollView has no key events, so the scroll region scrolls by swipe only. copy.selectedCount and copy.sortedAnnouncement go to hidden polite live regions plus AccessibilityInfo.announceForAccessibility on iOS, when the shown state changes.'
    swiftui:
      element: Grid
      props: [Grid, GridRow, ScrollView, .accessibilityElement=contain, .accessibilityLabel, .accessibilityAddTraits=isHeader, Button, Checkbox, ViewThatFits]
      notes: 'A `Grid` of `GridRow`s inside a horizontal `ScrollView` when columns overflow (`responsive: scroll`) or a `VStack` of stacked cards (`responsive: stack`) chosen through `ViewThatFits` against the prose width; not `List` and not `Table` (macOS-only). The caption `Heading` names the `.contain` element; each row is `.accessibilityElement(children: .contain)` with the row-header cell''s text as its label so VoiceOver reads a row as one unit and then its cells; header cells are `.isHeader` and column names are prefixed to cell values in stacked mode (`copy.cellLabel`). Sort `Button`s, selection `Checkbox`es, `onRowPress` on the row `Button` — as documented. `maxHeight` scrolls vertically inside a `ScrollView` with a visible header `Grid` outside it.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    - name: activating-a-sortable-header-reports-the-sort
      description: The table shows the sort; the caller sorts the data, so the event is the contract.
      given:
        columns:
          - { key: invoice, header: Invoice, isRowHeader: true }
          - { key: amount, header: Amount, sortable: true, align: end }
        data:
          - { id: a, invoice: INV-1, amount: 100 }
          - { id: b, invoice: INV-2, amount: 200 }
      when: { click: sortButton }
      then:
        - { event: onSortChange }
    - name: selecting-a-row-reports-every-selected-id
      given:
        selectable: multiple
        columns:
          - { key: invoice, header: Invoice, isRowHeader: true }
        data:
          - { id: a, invoice: INV-1 }
          - { id: b, invoice: INV-2 }
      when: { click: selectCell }
      then:
        - { event: onSelectionChange }
    - name: select-all-reports-the-whole-selection
      description: multiple adds a select-all in the header; selection is row identity, not a visual state.
      given:
        selectable: multiple
        columns:
          - { key: invoice, header: Invoice, isRowHeader: true }
        data:
          - { id: a, invoice: INV-1 }
          - { id: b, invoice: INV-2 }
      when: { click: selectAllCell }
      then:
        - { event: onSelectionChange }
    - name: the-empty-message-shows-when-there-are-no-rows
      given:
        columns:
          - { key: invoice, header: Invoice, isRowHeader: true }
        data: []
      then:
        - { copy: empty }
    - name: a-custom-empty-message-replaces-the-default
      given:
        emptyMessage: No invoices yet.
        columns:
          - { key: invoice, header: Invoice, isRowHeader: true }
        data: []
      then:
        - { text: No invoices yet. }
    - name: loading-marks-the-table-busy
      description: While data is being fetched the table is aria-busy and existing rows stay visible.
      given:
        loading: true
        columns:
          - { key: invoice, header: Invoice, isRowHeader: true }
        data:
          - { id: a, invoice: INV-1 }
      then:
        - { attribute: aria-busy, is: 'true' }
      platforms: [web, lit]
  examples:
    - name: open-invoices
      description: The everyday content table, its caption naming what it lists.
      given:
        caption: Open invoices
        columns:
          - { key: invoice, header: Invoice, isRowHeader: true }
          - { key: due, header: Due }
          - { key: amount, header: Amount, align: end, sortable: true }
        data:
          - { id: a, invoice: INV-1, due: 12 Sep, amount: 100 }
          - { id: b, invoice: INV-2, due: 19 Sep, amount: 200 }
    - name: selectable-rows
      description: A table whose rows can be picked in bulk, with a select-all in the header.
      given:
        caption: Members
        selectable: multiple
        defaultSelected: [a]
        columns:
          - { key: person, header: Person, isRowHeader: true }
          - { key: role, header: Role }
        data:
          - { id: a, person: Ana Souza, role: Admin }
          - { id: b, person: Bo Lin, role: Editor }
    - name: dense-data-table-that-scrolls
      description: A wide data table that keeps its columns on narrow screens and scrolls sideways instead of stacking.
      given:
        caption: Daily traffic
        responsive: scroll
        density: compact
        maxHeight: viewport
        columns:
          - { key: day, header: Day, isRowHeader: true }
          - { key: visits, header: Visits, align: end }
          - { key: signups, header: Signups, align: end }
        data:
          - { id: a, day: Monday, visits: 1200, signups: 30 }
          - { id: b, day: Tuesday, visits: 1450, signups: 41 }
    - name: nothing-to-show
      description: An empty table that says so in its own words rather than showing an empty body.
      given:
        caption: Open invoices
        emptyMessage: No invoices yet.
        columns:
          - { key: invoice, header: Invoice, isRowHeader: true }
        data: []
---

A table is the honest way to show records that share fields: every row the same shape, every column a comparable thing. This component keeps that honesty on a phone — where most tables quietly turn into unreadable text — by choosing, per table, whether rows stack into labelled blocks or columns scroll, and by stating every role explicitly so neither layout costs a screen-reader user the structure.

## When to use

Use a Table for a list of records with three or more comparable fields: orders, invoices, members, inventory, results. Use `stack` (the default) when each row is a thing a person reads — a person, an order — and `scroll` when the columns are what matters — figures across months, a comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions exist (put them in a Toolbar above the table that appears with the selection count). Put the row's identity in the `isRowHeader` column, usually as a Link to its detail page.

## When not to use

Do not use a Table for layout, for a list with one or two fields (a Stack of Cards or a plain list), or for key–value pairs about one thing (a description list). Do not use it when cells are edited in place or navigated with arrow keys — that is DataGrid, a different role with a different keyboard model. Do not put a Table inside a Card that is narrower than the content width; give it the Container.

## Behavior

The header row shows column names; sortable ones are Buttons whose activation cycles ascending → descending on that column (and starts ascending on another), announced through a live region, and shown by an arrow Icon plus `aria-sort`. With `selectable`, each row has a Checkbox named from its row header, and `multiple` adds select-all (indeterminate when some are selected); the count is announced. Rows are inert unless they contain interactive content or `onRowPress` is set, in which case the row header becomes the row's Button and hover/press styling applies to the row. Below the prose width the table follows `responsive`: stacked rows keep the column header as a small label before each value and hide `hideBelow` columns; scrolling tables keep every column, fade the edges, keep the row-header column sticky, and let the region be focused and scrolled by keyboard. `stickyHeader` keeps the header in view and casts a shadow only once the body has scrolled under it. Empty data shows `emptyMessage` in a single full-width cell; that row and cell carry no `row` or `cell` part, so the `row` part always counts data rows. `loading` sets `aria-busy` and shows the loading text without removing existing rows. Sort buttons show the column header as their visible label and carry the sort phrase as `accessibleName`. `onRowPress` applies only when the row-header column has no custom `render` (a rendered Link would conflict); without an `isRowHeader` column it is a development warning and rows are inert. The selection Checkboxes use `hideLabel` with `copy.selectRow`. In `single` selection, pressing the selected row's checkbox again deselects it. `maxHeight: viewport` is the viewport height minus two `layout.gap.section`. Arrow keys in the scroll region scroll by `space.10`, read from the built token (px and rem both parsed; a theme that builds its spacing scale in any other unit leaves the arrows inert rather than guessing a pixel value); the region is present whenever `responsive: scroll`, not only below the breakpoint. When the header row is stacked and wraps, the header cells keep `headerSurface`, `headerSize`, `headerWeight` and `headerColor` while `headerBorder` and the scrolled-under `headerShadow` move to the row — per-cell borders and shadows would stripe a wrapped row — and the row takes `headerSurface` too, so the wrap gaps are filled. `copy.rowCount` describes the table and `copy.scrollHint` the scroll region (visually hidden, aria-describedby). On native `abbr` has no effect and `width: auto`/`min` both size to `space.20`. A sort button's `accessibleName` is the phrase for what pressing it will do: `copy.sortDescending` when its column is currently ascending, `copy.sortAscending` otherwise. The caption and sort button forwards pass Table's value (its default included, since `headerWeight` differs from Button's) into the child's own `overrides`. A forwarded binding reaches the child that way and only that way: Table's own CSS hook is not the route to a composed child, so on Lit a consumer who wants another caption size sets the Heading's own hook (`--ds-heading-font-size`), not `--ds-table-caption-size`. `copy.sortToolbarLabel` names React Native's stacked sort Toolbar and `copy.cellLabel` SwiftUI's stacked labels; web and Lit render neither. The actions column's visually hidden header is a `columnHeader` part like the others. Inside a Form, the selection Checkboxes are not form fields.

## Content guidelines

Captions name the set, not the component ("Open invoices", not "Invoices table"). Column headers are one or two words, sentence case, with units in the header rather than in every cell ("Amount (USD)"); use `abbr` when a long header has a short spoken form. Numbers align end and share their decimals; dates use one format per column. The row-header column comes first (after the selection column) and holds the thing the row is about. Keep row actions to two visible plus a Menu; keep tables under about ten columns and use `hideBelow` for the least important ones.

## Accessibility

The table is a `table` with explicit `rowgroup`, `row`, `columnheader`, `rowheader` and `cell` roles, a caption as its name, and `scope`/`abbr` on headers (WCAG 1.3.1, 4.1.2) — explicit because CSS that changes display strips the native roles, and both responsive modes change display. Sort state is exposed with `aria-sort` and announced (4.1.3); the sort control is a real Button with a name that says what it does (2.4.6). Row selection is exposed as `aria-selected` plus the checkbox state, and is shown by a start-edge bar as well as a fill (1.4.1). Stacked rows keep their header association through the roles and the repeated visible labels, so a screen-reader user hears "Amount: $40" either way. The scroll region is named by the caption and focusable, so keyboard users can reach columns off-screen (2.1.1, 1.4.10 — content is not lost, only scrolled); `arrow-navigation` means that region's horizontal scrolling and nothing else, since cells are never focusable — a table is not a grid. Hover styling is confined to interactive rows and never the only signal (`no-hover-only`).

## Platform notes

### Web
Render `<div data-ds="Table" class="ds-table--{responsive} ds-table--{density}">` containing, for `scroll`, `<div role="region" aria-labelledby={captionId} tabindex="0">` with the fade masks; the caption is the composed `Heading` carrying an `id`, a sibling above the table and visually hidden when `hideCaption`, never a `<caption>` element — under the stated `role="table"` a heading inside `<caption>` is an invalid owned child; inside, `<table role="table" aria-labelledby={captionId} aria-rowcount aria-colcount aria-busy>` with `<thead role="rowgroup"><tr role="row">` of `<th role="columnheader" scope="col" abbr aria-sort>` (the selection `th` holds the select-all `Checkbox`; sortable headers hold `Button variant="ghost" size="sm"` with the header text and an `Icon` chevron-up/down when sorted; the actions header text is visually hidden), and `<tbody role="rowgroup">` of `<tr role="row" aria-selected data-part="row">` with `<th role="rowheader" scope="row">` for the row-header column and `<td role="cell" data-label={header}>` otherwise. Container query at the prose width: `stack` sets `tr { display: grid; grid-template-columns: 1fr }` with `thead` visually hidden and `td::before { content: attr(data-label) }` styled from the `stackedLabel*` bindings, each row on `stackedRowRadius` with `stackedRowInset`; `scroll` leaves display alone and sets `position: sticky; inset-inline-start: 0` on the row-header cells. Sticky header: `thead th { position: sticky; inset-block-start: 0 }` with `headerShadow` toggled via a sentinel `IntersectionObserver`. Visually-hidden `aria-live="polite"` region for sort and selection announcements. Uncontrolled sorting compares with `localeCompare` (`numeric: true`) for strings and `-` for numbers. The two breakpoint numbers come from the built token JSON, `literal-ok: breakpoint from layout.maxWidth.*`.

### Lit
`<ds-table caption="Open invoices" .columns=${columns} .data=${rows} selectable="multiple" responsive="scroll"></ds-table>`; the table is built in the shadow root from the properties (never slotted rows); `render` returns lit templates; container queries on `:host`; composed events.

### React Native
`responsive: stack` below the prose width: `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={caption}`) rendering each row as a `View accessible` styled as a stacked block (`stackedRowInset`, `stackedRowGap`, `stackedRowRadius`) whose `accessibilityLabel` joins "{header}: {value}" for visible columns with the row header first and the selected state; the selection `Checkbox` and `rowActions` are separate accessible elements inside. Sort controls render as a `Toolbar` of `Button`s above the list (no header row on phones). `responsive: scroll` (any width) and `stack` above the prose width: header `View` with `accessibilityRole="header"` cells and rows of fixed-width cells; `scroll` wraps in a horizontal `ScrollView` with the row-header cells pinned by translating them with the scroll offset. Row press uses `Pressable` with `accessibilityRole="button"` when `onRowPress` is set.

## Related

DataGrid, Card, Checkbox, Toolbar, Meter, Text, Link.
