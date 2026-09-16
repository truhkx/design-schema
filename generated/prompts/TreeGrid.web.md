# Generate: TreeGrid for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/TreeGrid.tsx` exporting a typed React function component named `TreeGrid`, plus `TreeGrid.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function TreeGrid({ ref, …rest }: TreeGridProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
- Render the element and attributes declared under `platforms.web`. Map each event to its `platforms.web` name.
- Style ONLY through the CSS custom properties generated from tokens (`--color-…`, `--space-…`, `--font-…`, `--radius-…`). Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `var(--color-action-${variant}-background)`.
- Implement every item in `a11y.requires`:
  - `accessible-name`: the `label` prop is rendered as visible text or `aria-label`; never both empty.
  - `focus-visible`: a `:focus-visible` outline using `--color-border-focus` and `--border-width-focus`. Never remove the outline without replacing it.
  - `keyboard-operable`: native element semantics (do not build interactive elements from `<div>`).
  - `target-24px` / `target-44px`: `min-inline-size`/`min-block-size` from `--size-target-min` / `--size-target-comfortable`.
  - `heading-hierarchy`: render the heading level as the matching `<h1>`–`<h6>`; do not pick the element by visual size.
- `disabled` uses `aria-disabled="true"` and keeps the element focusable (WCAG-friendly) unless the schema says otherwise. On native checkable inputs (checkbox, radio, switch) `readOnly` has no effect, so guard with `preventDefault()` in both `click` and `change`.
- Visually hidden text (for accessible-name suffixes) uses the standard clip pattern — absolute, 1px box, `clip-path: inset(50%)`, `white-space: nowrap` — the one sanctioned use of pixel literals.
- Support light and dark by relying on the token variables only — no theme logic in the component.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard` and are removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children, no decorators that add other focusable elements.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system component. Overlays: render into a portal at `document.body` (a `container` prop may override), lock body scroll while open, make the rest of the page `inert` for modal dialogs (`focus-trap` + `inert-background`), restore focus to the opener on close (`focus-restore`), position non-modal popups with `position: fixed` from the trigger's `getBoundingClientRect()` and flip when they would overflow the viewport, and put them on the right stacking layer with `z-index: var(--layer-<name>)`.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`; title `'<Name>/React'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof TreeGrid> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `TreeGrid.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for web; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false` or calls `preventDefault()` on the event it receives. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element), only in its `state` (`:hover`, `:focus-visible`, the ARIA state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

## Component schema

```yaml
component:
  name: TreeGrid
  category: data
  status: review
  apg: treegrid
  anatomy:
  - container
  - scrollRegion
  - grid
  - caption
  - header
  - headerRow
  - columnHeader
  - sortButton
  - body
  - row
  - rowHeader
  - expandButton
  - indent
  - cell
  - cellContent
  - editor
  - selectCell
  - selectAllCell
  - emptyState
  - statusBar
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
    hideCaption:
      type: boolean
      default: false
      description: Visually hide the caption; it remains the accessible name.
    columns:
      type: array
      required: true
      shape: DataGridColumn[]
      description: 'DataGrid''s column model. The `isRowHeader` column is required
        here: it carries the indent and the expand button, so it must exist and come
        first after the selection column.'
    data:
      type: array
      required: true
      shape: 'TreeRow[] where TreeRow = { id: string; children?: TreeRow[] | "lazy";
        [key: string]: unknown }'
      description: 'Nested rows. `children: "lazy"` marks a row whose children are
        loaded on first expand through `onExpand`; the row shows the expand button
        and a loading state until `data` is updated.'
    expanded:
      type: array
      shape: string[]
      description: Controlled ids of expanded rows.
      controls:
        event: onExpandChange
        default: defaultExpanded
    defaultExpanded:
      type: array
      shape: string[]
      description: Initially expanded ids. `["*"]` expands every loaded row.
    sort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Sort applies within each level; siblings are ordered, hierarchy
        is kept.
      controls:
        event: onSortChange
        default: defaultSort
    defaultSort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: As DataGrid.
    selectable:
      type: enum
      values:
      - none
      - row
      - cell
      default: none
      description: As DataGrid without `range` (rectangles across levels are not meaningful).
        `row` selection of a parent does not select its children unless `selectChildren`.
    selected:
      type: array
      shape: string[]
      description: As DataGrid.
      controls:
        event: onSelectionChange
        default: defaultSelected
    defaultSelected:
      type: array
      shape: string[]
      description: Initially selected row ids.
    selectChildren:
      type: boolean
      default: false
      description: Toggling a parent row sets or clears its own id and every loaded
        descendant; a parent's shown state is derived from its loaded descendants
        (checked when all, indeterminate when some, else its own id). A `"lazy"` subtree
        contributes nothing until loaded. Select-all covers every loaded row at every
        level.
    editable:
      type: boolean
      default: false
      description: As DataGrid.
    density:
      type: enum
      values:
      - compact
      - comfortable
      default: compact
      description: As DataGrid.
    height:
      type: enum
      values:
      - content
      - viewport
      - fixed
      default: viewport
      description: As DataGrid.
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
      description: Fired with the new array of expanded ids (the bare array, as Tree;
        not wrapped in an object).
      platforms:
        web: onExpandChange
        lit: expand-change
        rn: onExpandChange
        swiftui: onExpandChange
      payload:
      - name: ids
        type: array
        shape: string[]
        description: Every expanded id, as a bare array.
      fires:
      - user
    onExpand:
      description: Fired with its id (bare string) each time a row whose `children`
        is still `"lazy"` is expanded, so a failed load can retry; once the caller
        replaces `children` it never fires again for that row.
      platforms:
        web: onExpand
        lit: expand
        rn: onExpand
        swiftui: onExpand
      payload:
      - name: id
        type: string
        description: The expanded row.
      fires:
      - user
    onSortChange:
      description: As DataGrid.
      platforms:
        web: onSortChange
        lit: sort-change
        rn: onSortChange
        swiftui: onSortChange
      payload:
      - name: column
        type: string
        description: The key of the column now sorted on.
      - name: direction
        type: enum
        values:
        - ascending
        - descending
      fires:
      - user
    onSelectionChange:
      description: As DataGrid (row ids or one cell).
      platforms:
        web: onSelectionChange
        lit: selection-change
        rn: onSelectionChange
        swiftui: onSelectionChange
      payload:
      - name: selection
        type: union
        shape: 'string[] | { rowId: string; column: string }'
        description: Row ids, or one cell, matching selectable.
      fires:
      - user
    onCellChange:
      description: As DataGrid.
      platforms:
        web: onCellChange
        lit: cell-change
        rn: onCellChange
        swiftui: onCellChange
      payload:
      - name: rowId
        type: string
        description: The row that was edited.
      - name: column
        type: string
        description: The key of the edited column.
      - name: value
        type: union
        shape: string | number | boolean
        description: The committed value, as the column editor produces it.
      - name: previous
        type: union
        shape: string | number | boolean
        description: The value the cell held before the edit.
      fires:
      - user
      timing:
        phase: request
    onEditStart:
      description: As DataGrid.
      platforms:
        web: onEditStart
        lit: edit-start
        rn: onEditStart
        swiftui: onEditStart
      payload:
      - name: rowId
        type: string
        description: The row about to be edited.
      - name: column
        type: string
        description: The key of the column about to be edited.
      cancelable: true
      fires:
      - user
      timing:
        phase: before-change
    onColumnResize:
      description: As DataGrid.
      platforms:
        web: onColumnResize
        lit: column-resize
        rn: onColumnResize
        swiftui: onColumnResize
      payload:
      - name: column
        type: string
        description: The key of the resized column.
      - name: width
        type: number
        description: Its new width.
      fires:
      - user
      timing:
        phase: commit
  keyboard:
  - keys:
    - Tab
    action: Enters and leaves the grid — one tab stop, as DataGrid.
    from: any
    expect: manual
  - keys:
    - ArrowDown
    - ArrowUp
    action: Next / previous visible row, same column. Collapsed descendants are skipped
      because they are not rendered.
    from: inside
    expect: manual
  - keys:
    - ArrowRight
    action: 'On a collapsed row header: expands. On an expanded row header: moves
      to the next cell. On any other cell: next cell.'
    from: inside
    expect: manual
  - keys:
    - ArrowLeft
    action: 'On a row header of an expanded row: collapses. On a row header of a collapsed
      or leaf row: moves focus to the parent row''s header. On any other cell: previous
      cell.'
    from: inside
    expect: manual
  - keys:
    - Home
    - End
    action: 'First / last cell in the row (Ctrl: first / last visible row of the grid).'
    from: inside
    expect: manual
  - keys:
    - Enter
    action: 'On a row header: toggles expansion (or activates a control inside it).
      Elsewhere as DataGrid: sort, edit, activate.'
    from: inside
    expect: manual
  - keys:
    - '*'
    action: Expands every row at the focused row's level under the same parent, the
      focused row included.
    from: inside
    expect: manual
  - keys:
    - F2
    - Escape
    - ' '
    - Control+a
    - Shift+Space
    action: As DataGrid. Shift+Space extends the row selection from the last plain-Space
      anchor through the focused row, over the visible rows only — a range does not
      cascade into descendants even with selectChildren, which is a per-row act. Shift
      with the arrows keeps their own meaning here (column navigation, expand and
      collapse) and never selects.
    from: inside
    expect: manual
  styles:
    indent:
      token: space.5
      part: indent
      description: Per level, applied as padding-inline-start on the row header. Level
        1 has none.
      locked: false
    expandButtonSize:
      token: size.target.min
      part: expandButton
      description: Inline width reserved for the expand control in the row header
        (the guide lines align to its centre); minTarget is the locked row-height
        floor.
      locked: true
    expandGap:
      token: layout.gap.tight
      description: Between the expand button and the row header text.
      locked: false
    guideLine:
      token: color.border
      description: One vertical line per ancestor level, drawn the full height of
        every descendant row and aligned with that ancestor's expand button (indent
        guides; no elbows, no termination at the last child). Always drawn, at both
        densities.
      locked: false
    guideLineWidth:
      token: border.width.thin
      locked: false
    parentWeight:
      token: font.weight.medium
      description: Row headers of rows with children.
      locked: false
    loadingColor:
      token: color.foreground.muted
      description: The lazy-loading placeholder text in a just-expanded row.
      locked: true
    transition:
      token: motion.duration.fast
      description: Chevron rotation on expand; rows appear instantly (no height animation
        in a virtualized grid).
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    minTarget:
      token: size.target.min
      locked: true
  copy:
    expand:
      text: Expand {rowName}
      params:
        rowName:
          type: string
          description: The row's name from its row-header cell.
    collapse:
      text: Collapse {rowName}
      params:
        rowName:
          type: string
          description: The row's name from its row-header cell.
    level:
      text: Level {level}
      params:
        level:
          type: number
          description: The row's depth in the tree.
    childCount:
      plural:
        by: count
        one: '{count} item'
        other: '{count} items'
      params:
        count:
          type: number
          description: How many children the row has.
    loading: Loading
    expandAll: Expand all
    collapseAll: Collapse all
    empty: Nothing to show.
    sortAscending:
      text: Sort by {column}, ascending
      params:
        column:
          type: string
          description: The column header text.
    sortDescending:
      text: Sort by {column}, descending
      params:
        column:
          type: string
          description: The column header text.
    sortedAnnouncement:
      text: Sorted by {column}, {direction}
      params:
        column:
          type: string
          description: The column header text.
        direction:
          type: string
          description: 'The new direction: ascending or descending.'
    selectAll: Select all rows
    selectRow:
      text: Select {rowName}
      params:
        rowName:
          type: string
          description: The row's name from its row-header cell.
    selectedRows:
      text: '{count} of {total} rows selected'
      params:
        count:
          type: number
          description: How many rows are selected.
        total:
          type: number
          description: How many rows the treegrid has.
    editing:
      text: Editing {column}. Enter to save, Escape to cancel.
      params:
        column:
          type: string
          description: The column header text.
    invalid:
      text: '{message}'
      params:
        message:
          type: string
          description: The message the column's validate returned.
    rowCount:
      plural:
        by: count
        one: '{count} row'
        other: '{count} rows'
      params:
        count:
          type: number
          description: How many rows the treegrid has.
    position:
      text: Row {row}, {column}
      params:
        row:
          type: number
          description: The active cell's row number.
        column:
          type: string
          description: The column header text.
    resize:
      text: Resize {column}
      params:
        column:
          type: string
          description: The column header text.
    scrollHint: Scroll sideways to see more columns
  a11y:
    role: treegrid
    requires:
    - accessible-name
    - keyboard-operable
    - arrow-navigation
    - roving-tabindex
    - expanded-state
    - focus-visible
    - selected-state
    - live-region
    - contrast-aa
    - target-24px
    - escape-dismiss
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=treegrid
      - role=row
      - aria-level
      - aria-expanded
      - aria-setsize
      - aria-posinset
      - aria-rowindex
      - aria-colindex
      - aria-rowcount
      - aria-activedescendant
      notes: 'DataGrid''s structure with role="treegrid" on the container and, on
        every row, aria-level, aria-setsize and aria-posinset (among its siblings),
        plus aria-expanded on rows that have children (absent on leaves — a leaf must
        not say "collapsed"). The flattened visible-row list is what gets virtualized
        and indexed with aria-rowindex, so collapsing removes rows from the list.
        The expand control is a Button (ghost, sm, iconOnly, chevron-right Icon rotated
        when expanded) inside the row header cell with tabindex=-1; it is a pointer
        convenience — ArrowLeft/Right are the keyboard path, and the button has aria-hidden
        since the row already exposes aria-expanded. Indent as padding on the row
        header. Lazy children: on first expand set aria-busy on the row and render
        one placeholder child row with copy.loading until data arrives.'
    lit:
      tag: ds-tree-grid
      reflect:
      - selectable
      - select-children
      - editable
      - density
      - height
      - loading
      - hide-caption
      - prop: showStatusBar
        attribute: no-status-bar
      - prop: stickyHeader
        attribute: no-sticky-header
      notes: Its own element following ds-data-grid's structure, keyboard handling
        and CSS (a shared base class is a welcome package refactor, not a requirement;
        the copy strings above are TreeGrid's own, so nothing is imported from DataGrid).
        `expanded` and `selected` as properties; composed `expand-change`, `expand`
        with bare detail values.
    rn:
      element: FlatList
      props:
      - role=grid
      - accessibilityLabel
      - getItemLayout
      notes: DataGrid's list over the flattened visible rows (role="grid" via the
        ARIA-aligned `role` prop, as DataGrid); the root View exposes expandAll/collapseAll
        accessibility actions named from copy; each row header cell has accessibilityState={{
        expanded }} when it has children, accessibilityLabel "{rowName}, level {n},
        {count} items", and its own accessibilityActions expand/collapse. The expand
        Button is a real touch target (minimum size) since there are no arrow keys.
    swiftui:
      element: ScrollView
      props:
      - ScrollView=both-axes
      - LazyVStack
      - .accessibilityValue=expanded
      - .accessibilityAction
      - Button
      - .onMoveCommand
      - '@FocusState'
      notes: DataGrid's structure over the flattened visible rows; each row header
        cell carries `.accessibilityValue('level {n}, {count} items, expanded/collapsed')`
        from copy and custom actions `expand`/`collapse`, with the visible expand
        `Button` at minimum target size; the root offers `expandAll`/`collapseAll`
        custom actions. ArrowLeft/Right/`*` per the keyboard table on iPad; guide
        lines drawn as one `Rectangle` per ancestor level per row; indent by level
        from the token. Everything else as DataGrid.
  behavior:
  - name: the-expand-button-expands-a-row
    description: Rows with children show a chevron in the row header; onExpandChange
      reports the new set of expanded ids.
    given:
      defaultExpanded: []
      columns:
      - key: account
        header: Account
        isRowHeader: true
      - key: balance
        header: Balance
        align: end
      data:
      - id: assets
        account: Assets
        balance: 100
        children:
        - id: cash
          account: Cash
          balance: 40
    when:
      click: expandButton
    then:
    - event: onExpandChange
  - name: expanding-a-lazy-row-asks-for-its-children
    description: 'children: "lazy" marks a row whose children are loaded on first
      expand through onExpand, so a failed load can retry.'
    given:
      defaultExpanded: []
      columns:
      - key: account
        header: Account
        isRowHeader: true
      data:
      - id: assets
        account: Assets
        children: lazy
    when:
      click: expandButton
    then:
    - event: onExpand
    - event: onExpandChange
  - name: a-collapsed-parent-row-reports-it
    given:
      defaultExpanded: []
      columns:
      - key: account
        header: Account
        isRowHeader: true
      data:
      - id: assets
        account: Assets
        children:
        - id: cash
          account: Cash
    then:
    - attribute: aria-expanded
      is: 'false'
      'on': row
    platforms:
    - web
  - name: an-expanded-parent-row-reports-it
    given:
      defaultExpanded:
      - assets
      columns:
      - key: account
        header: Account
        isRowHeader: true
      data:
      - id: assets
        account: Assets
        children:
        - id: cash
          account: Cash
    then:
    - attribute: aria-expanded
      is: 'true'
      'on': row
    platforms:
    - web
  - name: activating-a-sortable-header-reports-the-sort
    description: Sorting orders siblings within each parent and keeps the tree; the
      caller does the sorting.
    given:
      columns:
      - key: account
        header: Account
        isRowHeader: true
      - key: balance
        header: Balance
        align: end
        sortable: true
      data:
      - id: assets
        account: Assets
        balance: 100
      - id: equity
        account: Equity
        balance: 50
    when:
      click: sortButton
    then:
    - event: onSortChange
  - name: selecting-a-row-reports-the-selection
    given:
      selectable: row
      columns:
      - key: account
        header: Account
        isRowHeader: true
      data:
      - id: assets
        account: Assets
      - id: equity
        account: Equity
    when:
      click: selectCell
    then:
    - event: onSelectionChange
  - name: a-selected-row-is-marked-selected
    given:
      selectable: row
      selected:
      - assets
      columns:
      - key: account
        header: Account
        isRowHeader: true
      data:
      - id: assets
        account: Assets
      - id: equity
        account: Equity
    then:
    - attribute: aria-selected
      is: 'true'
      'on': row
    platforms:
    - web
  - name: the-empty-message-shows-when-there-are-no-rows
    given:
      columns:
      - key: account
        header: Account
        isRowHeader: true
      data: []
    then:
    - copy: empty
  examples:
  - name: chart-of-accounts
    description: Nested accounts with their balances, the top level expanded.
    given:
      caption: Chart of accounts
      defaultExpanded:
      - assets
      columns:
      - key: account
        header: Account
        isRowHeader: true
        width: 240
      - key: balance
        header: Balance
        align: end
      data:
      - id: assets
        account: Assets
        balance: 1400
        children:
        - id: cash
          account: Cash
          balance: 400
        - id: stock
          account: Stock
          balance: 1000
      - id: equity
        account: Equity
        balance: 1400
  - name: lazy-folders
    description: A deep tree whose children are fetched the first time a row is expanded.
    given:
      caption: Files
      columns:
      - key: name
        header: Name
        isRowHeader: true
      - key: size
        header: Size
        align: end
      data:
      - id: docs
        name: Documents
        size: 0
        children: lazy
      - id: media
        name: Media
        size: 0
        children: lazy
  - name: cascading-selection
    description: Selection that means "this row and everything in it", with indeterminate
      parents.
    given:
      caption: Bill of materials
      selectable: row
      selectChildren: true
      defaultExpanded:
      - '*'
      columns:
      - key: part
        header: Part
        isRowHeader: true
      - key: quantity
        header: Quantity
        align: end
      data:
      - id: frame
        part: Frame
        quantity: 1
        children:
        - id: bolt
          part: Bolt
          quantity: 8
  - name: editable-quantities
    description: A nested grid that is worked in, where the quantity column takes
      a number editor.
    given:
      caption: Bill of materials
      editable: true
      defaultExpanded:
      - '*'
      columns:
      - key: part
        header: Part
        isRowHeader: true
      - key: quantity
        header: Quantity
        align: end
        editable: true
        editor: number
      data:
      - id: frame
        part: Frame
        quantity: 1
        children:
        - id: bolt
          part: Bolt
          quantity: 8
```

## Events

- `onExpandChange`: emit `onExpandChange`
  - payload, positional, in this order: `ids: string[]`
  - fires on: user
- `onExpand`: emit `onExpand`
  - payload, positional, in this order: `id: string`
  - fires on: user
- `onSortChange`: emit `onSortChange`
  - payload, positional, in this order: `column: string`, `direction: 'ascending' | 'descending'`
  - fires on: user
- `onSelectionChange`: emit `onSelectionChange`
  - payload, positional, in this order: `selection: string[] | { rowId: string; column: string }`
  - fires on: user
- `onCellChange`: emit `onCellChange`
  - payload, positional, in this order: `rowId: string`, `column: string`, `value: string | number | boolean`, `previous: string | number | boolean`
  - fires on: user
  - timing: request
- `onEditStart`: emit `onEditStart`
  - payload, positional, in this order: `rowId: string`, `column: string`
  - cancelable: yes
  - fires on: user
  - timing: before-change
- `onColumnResize`: emit `onColumnResize`
  - payload, positional, in this order: `column: string`, `width: number`
  - fires on: user
  - timing: commit

## Controlled state

- `expanded` is controlled when given, uncontrolled from `defaultExpanded` when omitted; changes reported by `onExpandChange` (emit `onExpandChange`)
- `sort` is controlled when given, uncontrolled from `defaultSort` when omitted; changes reported by `onSortChange` (emit `onSortChange`)
- `selected` is controlled when given, uncontrolled from `defaultSelected` when omitted; changes reported by `onSelectionChange` (emit `onSelectionChange`)

## Style bindings

- `indent`: token `space.5`; part `indent`
- `expandButtonSize`: token `size.target.min`; part `expandButton`; locked

## Copy

- `expand`: "Expand {rowName}"; params `rowName` (string)
- `collapse`: "Collapse {rowName}"; params `rowName` (string)
- `level`: "Level {level}"; params `level` (number)
- `childCount`: "{count} items"; params `count` (number); plural by `count`: one "{count} item", other "{count} items"
- `loading`: "Loading"
- `expandAll`: "Expand all"
- `collapseAll`: "Collapse all"
- `empty`: "Nothing to show."
- `sortAscending`: "Sort by {column}, ascending"; params `column` (string)
- `sortDescending`: "Sort by {column}, descending"; params `column` (string)
- `sortedAnnouncement`: "Sorted by {column}, {direction}"; params `column` (string), `direction` (string)
- `selectAll`: "Select all rows"
- `selectRow`: "Select {rowName}"; params `rowName` (string)
- `selectedRows`: "{count} of {total} rows selected"; params `count` (number), `total` (number)
- `editing`: "Editing {column}. Enter to save, Escape to cancel."; params `column` (string)
- `invalid`: "{message}"; params `message` (string)
- `rowCount`: "{count} rows"; params `count` (number); plural by `count`: one "{count} row", other "{count} rows"
- `position`: "Row {row}, {column}"; params `row` (number), `column` (string)
- `resize`: "Resize {column}"; params `column` (string)
- `scrollHint`: "Scroll sideways to see more columns"

## Constants and examples

- example `chart-of-accounts`, story `ChartOfAccounts`: given `caption: "Chart of accounts"`, `defaultExpanded: ["assets"]`, `columns: [{"key":"account","header":"Account","isRowHeader":true,"width":240},{"key":"balance","header":"Balance","align":"end"}]`, `data: [{"id":"assets","account":"Assets","balance":1400,"children":[{"id":"cash","account":"Cash","balance":400},{"id":"stock","account":"Stock","balance":1000}]},{"id":"equity","account":"Equity","balance":1400}]`; Nested accounts with their balances, the top level expanded.
- example `lazy-folders`, story `LazyFolders`: given `caption: "Files"`, `columns: [{"key":"name","header":"Name","isRowHeader":true},{"key":"size","header":"Size","align":"end"}]`, `data: [{"id":"docs","name":"Documents","size":0,"children":"lazy"},{"id":"media","name":"Media","size":0,"children":"lazy"}]`; A deep tree whose children are fetched the first time a row is expanded.
- example `cascading-selection`, story `CascadingSelection`: given `caption: "Bill of materials"`, `selectable: "row"`, `selectChildren: true`, `defaultExpanded: ["*"]`, `columns: [{"key":"part","header":"Part","isRowHeader":true},{"key":"quantity","header":"Quantity","align":"end"}]`, `data: [{"id":"frame","part":"Frame","quantity":1,"children":[{"id":"bolt","part":"Bolt","quantity":8}]}]`; Selection that means "this row and everything in it", with indeterminate parents.
- example `editable-quantities`, story `EditableQuantities`: given `caption: "Bill of materials"`, `editable: true`, `defaultExpanded: ["*"]`, `columns: [{"key":"part","header":"Part","isRowHeader":true},{"key":"quantity","header":"Quantity","align":"end","editable":true,"editor":"number"}]`, `data: [{"id":"frame","part":"Frame","quantity":1,"children":[{"id":"bolt","part":"Bolt","quantity":8}]}]`; A nested grid that is worked in, where the quantity column takes a number editor.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `indent`, `expandGap`, `guideLine`, `guideLineWidth`, `parentWeight`, `transition`
Locked (accessibility-bearing, never overridable): `expandButtonSize`, `loadingColor`, `focusRing`, `focusRingWidth`, `minTarget`

## Behavior scenarios (18)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-expand-button-expands-a-row
  description: Rows with children show a chevron in the row header; onExpandChange
    reports the new set of expanded ids.
  given:
    defaultExpanded: []
    columns:
    - key: account
      header: Account
      isRowHeader: true
    - key: balance
      header: Balance
      align: end
    data:
    - id: assets
      account: Assets
      balance: 100
      children:
      - id: cash
        account: Cash
        balance: 40
  when:
    click: expandButton
  then:
  - event: onExpandChange
- name: expanding-a-lazy-row-asks-for-its-children
  description: 'children: "lazy" marks a row whose children are loaded on first expand
    through onExpand, so a failed load can retry.'
  given:
    defaultExpanded: []
    columns:
    - key: account
      header: Account
      isRowHeader: true
    data:
    - id: assets
      account: Assets
      children: lazy
  when:
    click: expandButton
  then:
  - event: onExpand
  - event: onExpandChange
- name: a-collapsed-parent-row-reports-it
  given:
    defaultExpanded: []
    columns:
    - key: account
      header: Account
      isRowHeader: true
    data:
    - id: assets
      account: Assets
      children:
      - id: cash
        account: Cash
  then:
  - attribute: aria-expanded
    is: 'false'
    'on': row
  platforms:
  - web
- name: an-expanded-parent-row-reports-it
  given:
    defaultExpanded:
    - assets
    columns:
    - key: account
      header: Account
      isRowHeader: true
    data:
    - id: assets
      account: Assets
      children:
      - id: cash
        account: Cash
  then:
  - attribute: aria-expanded
    is: 'true'
    'on': row
  platforms:
  - web
- name: activating-a-sortable-header-reports-the-sort
  description: Sorting orders siblings within each parent and keeps the tree; the
    caller does the sorting.
  given:
    columns:
    - key: account
      header: Account
      isRowHeader: true
    - key: balance
      header: Balance
      align: end
      sortable: true
    data:
    - id: assets
      account: Assets
      balance: 100
    - id: equity
      account: Equity
      balance: 50
  when:
    click: sortButton
  then:
  - event: onSortChange
- name: selecting-a-row-reports-the-selection
  given:
    selectable: row
    columns:
    - key: account
      header: Account
      isRowHeader: true
    data:
    - id: assets
      account: Assets
    - id: equity
      account: Equity
  when:
    click: selectCell
  then:
  - event: onSelectionChange
- name: a-selected-row-is-marked-selected
  given:
    selectable: row
    selected:
    - assets
    columns:
    - key: account
      header: Account
      isRowHeader: true
    data:
    - id: assets
      account: Assets
    - id: equity
      account: Equity
  then:
  - attribute: aria-selected
    is: 'true'
    'on': row
  platforms:
  - web
- name: the-empty-message-shows-when-there-are-no-rows
  given:
    columns:
    - key: account
      header: Account
      isRowHeader: true
    data: []
  then:
  - copy: empty
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-selectable-none
  given:
    selectable: none
  then:
  - renders: true
  derived: true
- name: renders-selectable-row
  given:
    selectable: row
  then:
  - renders: true
  derived: true
- name: renders-selectable-cell
  given:
    selectable: cell
  then:
  - renders: true
  derived: true
- name: renders-density-compact
  given:
    density: compact
  then:
  - renders: true
  derived: true
- name: renders-density-comfortable
  given:
    density: comfortable
  then:
  - renders: true
  derived: true
- name: renders-height-content
  given:
    height: content
  then:
  - renders: true
  derived: true
- name: renders-height-viewport
  given:
    height: viewport
  then:
  - renders: true
  derived: true
- name: renders-height-fixed
  given:
    height: fixed
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (web)

```yaml
element: div
attributes:
- role=treegrid
- role=row
- aria-level
- aria-expanded
- aria-setsize
- aria-posinset
- aria-rowindex
- aria-colindex
- aria-rowcount
- aria-activedescendant
notes: "DataGrid's structure with role=\"treegrid\" on the container and, on every\
  \ row, aria-level, aria-setsize and aria-posinset (among its siblings), plus aria-expanded\
  \ on rows that have children (absent on leaves \u2014 a leaf must not say \"collapsed\"\
  ). The flattened visible-row list is what gets virtualized and indexed with aria-rowindex,\
  \ so collapsing removes rows from the list. The expand control is a Button (ghost,\
  \ sm, iconOnly, chevron-right Icon rotated when expanded) inside the row header\
  \ cell with tabindex=-1; it is a pointer convenience \u2014 ArrowLeft/Right are\
  \ the keyboard path, and the button has aria-hidden since the row already exposes\
  \ aria-expanded. Indent as padding on the row header. Lazy children: on first expand\
  \ set aria-busy on the row and render one placeholder child row with copy.loading\
  \ until data arrives."
```

## Guidance

## Overview

A tree grid is a data grid where rows have rows inside them. The hierarchy lives in the row-header column — indent, a chevron, a level announced to screen readers — and everything else is DataGrid: same columns, same cell navigation, same editors. Collapsing a parent removes its descendants from the visible list, which is also the virtualized list, so a hundred thousand leaf rows cost nothing until they are opened.

## When to use

Use a TreeGrid when records nest and each record has several comparable fields: a chart of accounts with balances, folders and files with sizes and dates, a bill of materials with quantities and costs, an org chart with headcount. Use `children: "lazy"` for deep or large trees so the first paint is fast. Use `selectChildren` when selection means "this and everything in it" (a folder to export).

## When not to use

Do not use a TreeGrid for a hierarchy with one field per node — a navigation tree, a file picker with names only — that is a Tree. Do not use it for flat data (DataGrid) or for content people read row by row (Table). Do not nest more than about six levels; past that, give the user a way to open a subtree as its own root (a Breadcrumb above the grid).

## Behavior

Rows with children show a chevron in the row header; ArrowRight expands, ArrowLeft collapses or moves to the parent, `*` expands all siblings, Enter on the row header toggles. Expanded ids are controlled or uncontrolled; `onExpandChange` reports them. Lazy rows show a loading placeholder child until the caller supplies `children`. Sorting orders siblings within each parent and keeps the tree. Row selection with `selectChildren` cascades down and shows indeterminate parents. Vertical navigation moves through visible rows only; everything else — editing, cell selection, status bar, virtualization, pinned and resizable columns, sticky header, controlled and uncontrolled sort and selection — behaves as DataGrid, and the copy strings for those behaviors are TreeGrid's own (listed above, identical to DataGrid's) so each platform package is self-contained. Descendant, parent and sibling lookups are O(n) walks of `data`; only the visible-row list is optimized. `copy.level` and `copy.childCount` are used only in the native accessibilityLabel (web relies on aria-level/aria-setsize/aria-posinset); `copy.expandAll`/`copy.collapseAll` name the native root's expandAll/collapseAll accessibility actions and have no web control (`*` is the keyboard path). `*` expands the focused row along with its siblings, not the siblings alone. `selectChildren` cascades a row's own id and its loaded descendants when that row's own checkbox is the one used; every other row derives its checked or indeterminate state by counting selected descendants, and a `lazy` subtree contributes nothing until it loads. A `lazy` row fires `onExpand` each time it opens from collapsed, not once ever — a caller that never fills in `children` is asked again. Guide lines are one continuous vertical segment per ancestor depth down every descendant row, not elbows that stop at a subtree's last child.

## Content guidelines

The row header is the node's name; keep it short because it is indented. Show aggregate values on parent rows (a folder's total size, an account's balance) so a collapsed tree still reads. Order children meaningfully by default (by name, by code) and let sorting change it.

## Accessibility

The container is a `treegrid` (APG treegrid) and every row exposes `aria-level`, `aria-setsize` and `aria-posinset`, with `aria-expanded` only on rows that have children, so a screen reader hears "Assets, level 1, 1 of 4, expanded" (WCAG 1.3.1, 4.1.2). Expansion is keyboard-operable through the row itself — ArrowLeft/Right, Enter — with the chevron as a pointer convenience (2.1.1). The visible-row list is what `aria-rowindex` counts, so positions stay honest after collapsing. Focus stays on the row header when a subtree collapses under it (2.4.3). Guide lines are decorative (not checked for contrast) and indent is reinforced by the announced level, never the only signal (1.3.1). Everything else inherits DataGrid's guarantees.

## Platform notes

### Web
Build on DataGrid's implementation (a shared hook or base, not a copy): flatten `data` by `expanded` into visible rows carrying `level`, `posinset`, `setsize`, `hasChildren`, `parentId`; render the row header cell with `padding-inline-start: calc(var(--ds-tree-grid-indent) * (level - 1))`, the expand `Button` (`aria-hidden`, `tabIndex={-1}`) when `hasChildren`, and the guide line as a `::before` on child rows. Add `role="treegrid"` and the row attributes; extend DataGrid's keydown with the ArrowLeft/ArrowRight/`*` rules on the row-header column. Lazy: on expand of a `"lazy"` row, fire `onExpand`, mark the row `aria-busy`, and render a placeholder child until `children` changes.

### Lit
`<ds-tree-grid caption="Chart of accounts" .columns=${columns} .data=${tree} .expanded=${['assets']}></ds-tree-grid>`; extends the grid base class; composed `expand-change`, `expand`.

### React Native
DataGrid's `FlatList` over the flattened rows; the row header `Pressable` has `accessibilityState.expanded`, `accessibilityActions` expand/collapse, and the visible expand `Button` at minimum target size; indent by level.

## Related

DataGrid, Tree, Table, Breadcrumb.
