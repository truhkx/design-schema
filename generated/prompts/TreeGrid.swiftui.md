# Generate: TreeGrid for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/TreeGrid.swift` declaring `public struct TreeGrid: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/TreeGridBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+TreeGrid.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("TreeGrid") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- Controlled/uncontrolled pairs (`value`/`defaultValue`, `open`/`defaultOpen`) become a `Binding<T>?` parameter plus a `default` initial value, with `@State` holding the uncontrolled value.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("TreeGrid")` on the root and `"TreeGrid.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

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
    defaultExpanded:
      type: array
      shape: string[]
      description: Initially expanded ids. `["*"]` expands every loaded row.
    sort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Sort applies within each level; siblings are ordered, hierarchy
        is kept.
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
    onExpand:
      description: Fired with its id (bare string) each time a row whose `children`
        is still `"lazy"` is expanded, so a failed load can retry; once the caller
        replaces `children` it never fires again for that row.
      platforms:
        web: onExpand
        lit: expand
        rn: onExpand
        swiftui: onExpand
    onSortChange:
      description: As DataGrid.
      platforms:
        web: onSortChange
        lit: sort-change
        rn: onSortChange
        swiftui: onSortChange
    onSelectionChange:
      description: As DataGrid (row ids or one cell).
      platforms:
        web: onSelectionChange
        lit: selection-change
        rn: onSelectionChange
        swiftui: onSelectionChange
    onCellChange:
      description: As DataGrid.
      platforms:
        web: onCellChange
        lit: cell-change
        rn: onCellChange
        swiftui: onCellChange
    onEditStart:
      description: As DataGrid.
      platforms:
        web: onEditStart
        lit: edit-start
        rn: onEditStart
        swiftui: onEditStart
    onColumnResize:
      description: As DataGrid.
      platforms:
        web: onColumnResize
        lit: column-resize
        rn: onColumnResize
        swiftui: onColumnResize
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
    - Shift+ArrowLeft
    - Shift+ArrowRight
    action: As DataGrid (Shift+Space extends the row selection; with selectChildren
      each selected parent cascades).
    from: inside
    expect: manual
  styles:
    indent:
      token: space.5
      description: Per level, applied as padding-inline-start on the row header. Level
        1 has none.
      locked: false
    expandButtonSize:
      token: size.target.min
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
    expand: Expand {rowName}
    collapse: Collapse {rowName}
    level: Level {level}
    childCount: '{count} items'
    loading: Loading
    expandAll: Expand all
    collapseAll: Collapse all
    sortAscending: Sort by {column}, ascending
    sortDescending: Sort by {column}, descending
    sortedAnnouncement: Sorted by {column}, {direction}
    selectAll: Select all rows
    selectRow: Select {rowName}
    selectedRows: '{count} of {total} rows selected'
    editing: Editing {column}. Enter to save, Escape to cancel.
    invalid: '{message}'
    rowCount: '{count} rows'
    position: Row {row}, {column}
    resize: Resize {column}
    empty: Nothing to show.
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
      - no-status-bar
      - no-sticky-header
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
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `indent`, `expandGap`, `guideLine`, `guideLineWidth`, `parentWeight`, `transition`
Locked (accessibility-bearing, never overridable): `expandButtonSize`, `loadingColor`, `focusRing`, `focusRingWidth`, `minTarget`

## Platform notes (swiftui)

```yaml
element: ScrollView
props:
- ScrollView=both-axes
- LazyVStack
- .accessibilityValue=expanded
- .accessibilityAction
- Button
- .onMoveCommand
- '@FocusState'
notes: DataGrid's structure over the flattened visible rows; each row header cell
  carries `.accessibilityValue('level {n}, {count} items, expanded/collapsed')` from
  copy and custom actions `expand`/`collapse`, with the visible expand `Button` at
  minimum target size; the root offers `expandAll`/`collapseAll` custom actions. ArrowLeft/Right/`*`
  per the keyboard table on iPad; guide lines drawn as one `Rectangle` per ancestor
  level per row; indent by level from the token. Everything else as DataGrid.
```

## Guidance

## Overview

A tree grid is a data grid where rows have rows inside them. The hierarchy lives in the row-header column — indent, a chevron, a level announced to screen readers — and everything else is DataGrid: same columns, same cell navigation, same editors. Collapsing a parent removes its descendants from the visible list, which is also the virtualized list, so a hundred thousand leaf rows cost nothing until they are opened.

## When to use

Use a TreeGrid when records nest and each record has several comparable fields: a chart of accounts with balances, folders and files with sizes and dates, a bill of materials with quantities and costs, an org chart with headcount. Use `children: "lazy"` for deep or large trees so the first paint is fast. Use `selectChildren` when selection means "this and everything in it" (a folder to export).

## When not to use

Do not use a TreeGrid for a hierarchy with one field per node — a navigation tree, a file picker with names only — that is a Tree. Do not use it for flat data (DataGrid) or for content people read row by row (Table). Do not nest more than about six levels; past that, give the user a way to open a subtree as its own root (a Breadcrumb above the grid).

## Behavior

Rows with children show a chevron in the row header; ArrowRight expands, ArrowLeft collapses or moves to the parent, `*` expands all siblings, Enter on the row header toggles. Expanded ids are controlled or uncontrolled; `onExpandChange` reports them. Lazy rows show a loading placeholder child until the caller supplies `children`. Sorting orders siblings within each parent and keeps the tree. Row selection with `selectChildren` cascades down and shows indeterminate parents. Vertical navigation moves through visible rows only; everything else — editing, cell selection, status bar, virtualization, pinned and resizable columns, sticky header, controlled and uncontrolled sort and selection — behaves as DataGrid, and the copy strings for those behaviors are TreeGrid's own (listed above, identical to DataGrid's) so each platform package is self-contained. Descendant, parent and sibling lookups are O(n) walks of `data`; only the visible-row list is optimized. `copy.level` and `copy.childCount` are used only in the native accessibilityLabel (web relies on aria-level/aria-setsize/aria-posinset); `copy.expandAll`/`copy.collapseAll` name the native root's expandAll/collapseAll accessibility actions and have no web control (`*` is the keyboard path).

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

## Behavior scenarios (10)

One test per scenario, in this order.

```yaml
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
