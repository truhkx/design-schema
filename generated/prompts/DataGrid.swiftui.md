# Generate: DataGrid for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/DataGrid.swift` declaring `public struct DataGrid: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/DataGridBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+DataGrid.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("DataGrid") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("DataGrid")` on the root and `"DataGrid.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for swiftui; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: each closure takes exactly the listed arguments, in order, and `reason` is a nested `enum` of its reasons. A `cancelable` closure returns `Bool`, and `false` skips the default action. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: every pair becomes a `Binding<T>?` parameter plus the default's initial value, with `@State` holding the uncontrolled value; the closure fires in both modes, and a bound view shows the new state only once the binding changes.
- **Parts and slots**: each slot is a `@ViewBuilder` parameter under its resolved label only (`content` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides:` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (`.onHover`, `@FocusState`, or the view's own state), with the token listed for each `by` value; write `computed` as the given multiplication of `theme` values. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` applies when those props are set.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this picks among the conventions' overlay forms.
- **Copy**: interpolate only the listed `params` and props; select plural forms through `String(localized:)` with the entry's forms as its plural variations; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example becomes a `#Preview` with the name shown and exactly its `given`.
- **Lifecycle**: a deprecated parameter, closure, case or view keeps working, is marked `@available(*, deprecated, message:)` naming `use`, and warns once under `#if DEBUG` naming `use`.
- A `type: integer` prop is an `Int`: whole numbers only.

## Component schema

```yaml
component:
  name: DataGrid
  category: data
  status: review
  apg: grid
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
  - cell
  - cellContent
  - editor
  - selectCell
  - selectAllCell
  - rangeOverlay
  - emptyState
  - statusBar
  composition:
    caption: Heading
    sortButton: Button
    selectCell: Checkbox
    selectAllCell: Checkbox
    emptyState: Text
    statusBar: Text
  props:
    caption:
      type: string
      required: true
      description: What the grid holds ("Price list"). The accessible name; visually
        hidden with `hideCaption`.
      a11y: aria-labelledby the caption (web) / accessibilityLabel (native).
    hideCaption:
      type: boolean
      default: false
      description: Visually hide the caption; it remains the accessible name.
    columns:
      type: array
      required: true
      shape: '{ key: string; header: string; abbr?: string; align?: "start" | "end"
        | "center"; sortable?: boolean; width?: number; minWidth?: number; resizable?:
        boolean; isRowHeader?: boolean; pinned?: "start" | "end"; editable?: boolean;
        editor?: "text" | "number" | "select" | "date" | "checkbox"; options?: { value:
        string; label: string }[]; render?: (row: Row) => ReactNode; validate?: (value:
        unknown, row: Row) => string | undefined }[]'
      description: 'Table''s column model plus grid concerns: pixel `width` (columns
        do not auto-size in a virtualized grid; `width` is a multiple of space.1,
        e.g. 160; 160 when omitted, `literal-ok`), `resizable` (pointer drag on the
        header edge, Shift+ArrowLeft/Right on the header cell by `resizeStep`), `pinned`
        columns that stay put while scrolling sideways (pinned columns must be contiguous
        at the start or end of `columns`; the selection column is always pinned start
        and counted in the offsets), `editable` with an `editor` kind and `validate`.
        Exactly one column may be `isRowHeader`.'
    data:
      type: array
      required: true
      shape: 'Row[] where Row = { id: string; [key: string]: unknown }'
      description: The rows. `id` must be stable. Large arrays are fine; only visible
        rows are rendered.
    rowCount:
      type: integer
      description: Total rows when `data` is a window of a larger set (server paging).
        Sets aria-rowcount; `onRangeNeeded` asks for more. `data` is always a contiguous
        prefix of the full set starting at row 0 and only grows by appending; keyboard
        navigation is clamped to loaded rows.
    sort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Controlled sort state; as Table.
      controls:
        event: onSortChange
        default: defaultSort
    defaultSort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Initial sort; the grid sorts `data` itself when `rowCount` is not
        set.
    selectable:
      type: enum
      values:
      - none
      - row
      - cell
      - range
      default: none
      description: '`row` adds a checkbox column and Shift/Ctrl row selection; `cell`
        selects the focused cell (selection follows focus, no key needed); `range`
        allows Shift+arrow / pointer-drag rectangles (copy as TSV). Selection is separate
        from focus in row and range mode: focus is where the keyboard is, selection
        is what an action applies to.'
    selected:
      type: array
      shape: string[]
      description: Controlled selected row ids (row mode).
    editable:
      type: boolean
      default: false
      description: 'Master switch: cells whose column is `editable` can be edited
        with Enter, F2, typing, or double-click. Off by default so a grid is read-only
        unless meant to be edited.'
    density:
      type: enum
      values:
      - compact
      - comfortable
      default: compact
      description: 'Row height: compact suits the grid''s purpose; comfortable for
        touch.'
    stickyHeader:
      type: boolean
      default: true
      description: The header stays visible while the body scrolls. Always true when
        virtualized.
    height:
      type: enum
      values:
      - content
      - viewport
      - fixed
      default: viewport
      description: '`viewport` sets the grid height to `100vh − 2 × layout.gap.section`,
        as Table (the grid, not the page, scrolls); `content` grows with rows (no
        virtualization, small grids); `fixed` uses a height the caller sets through
        `overrides.fixedHeight` — one of the few size bindings that is overridable
        by design.'
    loading:
      type: boolean
      default: false
      description: Sets aria-busy and shows `copy.loading` in the status bar; existing
        rows stay.
    emptyMessage:
      type: string
      description: Shown when `data` is empty.
    showStatusBar:
      type: boolean
      default: true
      description: A footer line with row count, selection count and, while editing,
        the validation message — the visible counterpart of the live region.
  events:
    onSortChange:
      description: As Table.
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
      description: 'Fired with the selection: row ids, one cell `{ rowId, column }`,
        or a range `{ from, to }`.'
      platforms:
        web: onSelectionChange
        lit: selection-change
        rn: onSelectionChange
        swiftui: onSelectionChange
      payload:
      - name: selection
        type: union
        shape: 'string[] | { rowId: string; column: string } | { from: { rowId: string;
          column: string }; to: { rowId: string; column: string } }'
        description: Row ids, one cell, or a range, matching selectable.
      fires:
      - user
    onCellChange:
      description: Fired when an edit commits, with `{ rowId, column, value, previous
        }`. The caller updates `data`; the grid shows the old value until it does
        (a rejected edit reverts visibly).
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
      description: Fired when an editor opens; return false (web) or call preventDefault
        (lit) to refuse editing that cell.
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
    onRangeNeeded:
      description: Fired when the visible window (or Ctrl+End / PageDown) comes within
        one page of the end of `data` and `rowCount` says there is more, with `{ start,
        end }` row indexes to load; fired once per `end` until `data` grows.
      platforms:
        web: onRangeNeeded
        lit: range-needed
        rn: onEndReached
        swiftui: onRangeNeeded
      payload:
      - name: start
        type: number
        description: The first row index to load.
      - name: end
        type: number
        description: The last row index to load.
      fires:
      - user
    onColumnResize:
      description: Fired with `{ column, width }` when the user finishes dragging
        a resizable column edge.
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
    action: Enters the grid on the last-focused cell (initially the first header cell)
      and, from inside, leaves it — the grid is one tab stop. Inside a cell that contains
      a control, Tab still leaves the grid; use Enter to interact with the control.
      While an editor is open, Tab commits and opens the next editable cell in the
      row (Shift+Tab the previous); from the last editable cell it commits and leaves
      the grid.
    from: any
    expect: manual
  - keys:
    - ArrowRight
    action: Next cell in the row.
    from: first
    expect: manual
  - keys:
    - ArrowLeft
    action: Previous cell.
    from: inside
    expect: manual
  - keys:
    - ArrowDown
    action: Same column, next row (into the body from the header).
    from: first
    expect: manual
  - keys:
    - ArrowUp
    action: Same column, previous row (into the header from the first body row).
    from: inside
    expect: manual
  - keys:
    - Home
    action: 'First cell in the row (Ctrl: first cell in the grid).'
    from: inside
    expect: manual
  - keys:
    - End
    action: 'Last cell in the row (Ctrl: last cell in the grid).'
    from: inside
    expect: manual
  - keys:
    - PageDown
    action: Down one visible page of rows, same column.
    from: inside
    expect: manual
  - keys:
    - PageUp
    action: Up one visible page of rows.
    from: inside
    expect: manual
  - keys:
    - Enter
    action: 'On a header cell: sorts (if sortable). On an editable cell: opens the
      editor; while editing, commits and moves focus down one row. On the selection
      cell: toggles its checkbox. On a cell whose `render` contains a control (Link,
      Button, Checkbox): focuses and activates the first focusable descendant.'
    from: inside
    expect: manual
  - keys:
    - F2
    action: Opens the editor without moving; while editing, commits and returns focus
      to the cell without moving.
    from: inside
    expect: manual
  - keys:
    - Escape
    action: While editing, cancels the edit and restores the value. Otherwise clears
      a range selection.
    from: inside
    expect: manual
  - keys:
    - ' '
    action: 'Row mode: toggles the focused row; Shift+Space extends the row selection
      from the anchor (the last row toggled) through the focused row. Range mode:
      selects the focused row as a full-width range, Shift+Space extends that row
      range, Ctrl+Space selects the focused column as a range over the loaded rows.'
    when: selectable is row or range
    from: inside
    expect: manual
  - keys:
    - Shift+ArrowRight
    - Shift+ArrowLeft
    - Shift+ArrowDown
    - Shift+ArrowUp
    action: Extends the range selection from the anchor; a plain arrow collapses the
      range to the newly focused cell and makes it the anchor.
    when: selectable is range and focus in the body
    from: inside
    expect: manual
  - keys:
    - Shift+ArrowRight
    - Shift+ArrowLeft
    action: Widens / narrows the column by resizeStep and fires onColumnResize on
      release of Shift.
    when: focus on the header cell of a resizable column
    from: inside
    expect: manual
  - keys:
    - Control+a
    action: Selects all loaded rows or cells (bound by key code KeyA, so it works
      on any layout).
    when: selectable is row or range
    from: inside
    expect: manual
  - keys:
    - Control+c
    action: Copies the selection as tab-separated text (with headers when whole columns
      are selected); bound by key code KeyC.
    when: selectable is range
    from: inside
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Delete
    - Backspace
    action: Clears the value of editable cells in the selection.
    when: editable and selection
    from: inside
    expect: manual
  styles:
    surface:
      token: color.background
      locked: true
    headerSurface:
      token: color.background.subtle
      part: header
      locked: true
    headerColor:
      token: color.foreground
      part: header
      locked: true
    headerWeight:
      token: font.weight.semibold
      part: header
      locked: false
    headerSize:
      token: font.size.sm
      part: header
      locked: false
    headerBorder:
      token: color.border.strong
      part: header
      locked: false
    headerBorderWidth:
      token: border.width.thin
      part: header
      locked: false
    headerShadow:
      token: shadow.raised
      part: header
      description: Under the sticky header once the body has scrolled.
      locked: false
    gridLine:
      token: color.border
      part: grid
      description: Cell borders on both axes — a grid shows its cells, unlike Table
        which shows rows.
      locked: false
    gridLineWidth:
      token: border.width.thin
      part: grid
      locked: false
    rowHeight:
      token: size.target.min
      part: row
      description: Compact rows are the minimum target height (rows are the unit people
        click); comfortable rows use rowHeightComfortable. Virtualization measures
        one rendered row (ResizeObserver) rather than reading the token, so density
        and overrides both work.
      locked: true
    rowHeightComfortable:
      token: size.target.comfortable
      part: row
      locked: true
    rowHover:
      token: color.action.ghost.backgroundHover
      part: row
      state: hover
      description: Row under the pointer; the grid is interactive by nature so hover
        is allowed, and the focused cell ring is the non-hover signal.
      locked: false
    rowSelected:
      token: color.background.subtle
      part: row
      locked: true
    rowSelectedBorder:
      token: color.control.selectedBackground
      part: row
      description: Start-edge bar on selected rows.
      locked: true
    rowSelectedBorderWidth:
      token: border.width.focus
      part: row
      locked: true
    cellColor:
      token: color.foreground
      part: cell
      locked: true
    cellMutedColor:
      token: color.foreground.muted
      part: cell
      locked: true
    cellPaddingInline:
      token: space.2
      part: cell
      locked: false
    cellFocusRing:
      token: color.border.focus
      part: cell
      description: Drawn inside the cell (inset) so it is never clipped by neighbors
        or the scroll region.
      locked: true
    cellFocusRingWidth:
      token: border.width.focus
      part: cell
      locked: true
    cellEditingBackground:
      token: color.control.background
      part: cell
      locked: true
    cellEditingBorder:
      token: color.border.focus
      part: cell
      locked: true
    cellInvalidBorder:
      token: color.border.danger
      part: cell
      locked: true
    cellInvalidBackground:
      token: color.status.danger.background
      part: cell
      locked: true
    cellInvalidForeground:
      token: color.status.danger.foreground
      part: cell
      locked: true
    rangeBackground:
      token: color.background.strong
      description: Selected range fill; the range border marks its edge.
      locked: true
    rangeBorder:
      token: color.control.selectedBackground
      locked: true
    rangeBorderWidth:
      token: border.width.focus
      locked: true
    pinnedShadow:
      token: shadow.raised
      description: Cast by pinned columns once the body has scrolled sideways.
      locked: false
    resizeHandle:
      token: color.border.strong
      description: The column edge grab area, visible on hover/focus of the header
        cell.
      locked: false
    resizeHandleWidth:
      token: space.1
      locked: false
    resizeStep:
      token: space.4
      description: Width change per Shift+Arrow press on a resizable header cell.
      locked: false
    statusBarSurface:
      token: color.background.subtle
      part: statusBar
      locked: true
    statusBarColor:
      token: color.foreground.muted
      part: statusBar
      locked: true
    statusBarSize:
      token: font.size.xs
      part: statusBar
      locked: false
    statusBarPadding:
      token: space.2
      part: statusBar
      locked: false
    captionSize:
      token: font.size.md
      part: caption
      locked: false
    captionWeight:
      token: font.weight.semibold
      part: caption
      locked: false
    captionGap:
      token: space.2
      part: caption
      locked: false
    fixedHeight:
      token: space.20
      description: 'The grid height for `height: fixed`; overridable by design (a
        page decides how tall its grid is). space.20 is the floor, not a recommendation.'
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.sm
      locked: false
    lineHeight:
      token: font.lineHeight.tight
      locked: false
    numericFont:
      token: font.family.mono
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    transition:
      token: motion.duration.fast
      description: Hover and editor open; navigation and scrolling are instant.
      locked: false
  copy:
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
          description: How many rows the grid has.
    selectedRange:
      text: '{rows} rows by {columns} columns selected'
      params:
        rows:
          type: number
          description: How many rows the selected range covers.
        columns:
          type: number
          description: How many columns the selected range covers.
    copied:
      plural:
        by: cells
        one: Copied {cells} cell
        other: Copied {cells} cells
      params:
        cells:
          type: number
          description: How many cells were written to the clipboard.
      platforms:
      - web
      - lit
      - swiftui
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
          description: How many rows the grid has.
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
    loading: Loading
    empty: Nothing to show.
    scrollHint: Scroll sideways to see more columns
  a11y:
    role: grid
    requires:
    - accessible-name
    - keyboard-operable
    - arrow-navigation
    - roving-tabindex
    - focus-visible
    - selected-state
    - live-region
    - contrast-aa
    - target-24px
    - no-hover-only
    - escape-dismiss
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.background.subtle
      level: AA
    - foreground: color.foreground
      background: color.background.strong
      level: AA
    - foreground: color.foreground
      background: color.control.background
      level: AA
    - foreground: color.status.danger.foreground
      background: color.status.danger.background
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.selectedBackground
      background: color.background.subtle
      level: AA
      nonText: true
    - foreground: color.border.focus
      background: color.control.background
      level: AA
      nonText: true
    - foreground: color.border.danger
      background: color.background
      level: AA
      nonText: true
  platforms:
    web:
      element: div
      attributes:
      - role=grid
      - role=rowgroup
      - role=row
      - role=columnheader
      - role=rowheader
      - role=gridcell
      - aria-rowcount
      - aria-colcount
      - aria-rowindex
      - aria-colindex
      - aria-selected
      - aria-sort
      - aria-readonly
      - aria-busy
      - aria-multiselectable
      - aria-labelledby
      - aria-describedby
      - tabindex
      - aria-activedescendant
      notes: 'Built from <div>s with explicit roles (role="grid" > "rowgroup" > "row"
        > "columnheader"/"rowheader"/"gridcell"), never <table>: virtualization renders
        only visible rows, which breaks a native table''s layout and its implicit
        roles anyway, and pinned columns need independent positioning. Every rendered
        row carries aria-rowindex and every cell aria-colindex so a screen reader
        knows the position among the unrendered rows; aria-rowcount/aria-colcount
        on the grid. Focus: the grid container is the tab stop (tabindex=0) and uses
        aria-activedescendant pointing at the current cell (cells have ids and tabindex=-1);
        this keeps focus stable while rows are recycled. Except when a cell contains
        an interactive element or an editor is open: then real focus moves into it
        (the APG "focus inside the cell" mode) and returns to the cell on Escape/commit.
        Virtualization: a fixed rowHeight makes offsets arithmetic; a spacer sets
        the scroll height; rows render with translateY; overscan of one page. Editing:
        the editor is the system Input/NumberInput/Select/DatePicker/Checkbox rendered
        inside the cell with its label visually hidden, size sm, `overrides` for inset
        zero; validate on commit, and an invalid cell keeps the editor open with the
        message in the status bar and aria-describedby. Range selection is drawn with
        an absolutely positioned overlay, not per-cell styles. Column resize: a separator
        (role="separator" aria-orientation="vertical" aria-valuenow) on the header
        cell edge draggable with the pointer and adjustable with arrow keys. Copy
        writes text/plain TSV to the clipboard. Live region announces sort, selection
        counts, copy, and edit state.'
    lit:
      tag: ds-data-grid
      reflect:
      - selectable
      - editable
      - density
      - height
      - loading
      - hide-caption
      - prop: showStatusBar
        attribute: no-status-bar
      - prop: stickyHeader
        attribute: no-sticky-header
      notes: '`columns` and `data` as properties; `showStatusBar` and `stickyHeader`
        default true, so their attributes are the negated `no-status-bar` / `no-sticky-header`.
        the grid renders in the shadow root with `repeat` keyed by row id over the
        visible window. aria-activedescendant works inside one shadow root. Editors
        are the ds-* form elements composed in the cell. Composed events as listed.
        ElementInternals role="grid" is NOT used on the host; the inner container
        carries the role so ids for activedescendant resolve within the same root.'
    rn:
      element: FlatList
      props:
      - role=grid
      - accessibilityLabel
      - getItemLayout
      - stickyHeaderIndices
      - onEndReached
      notes: 'A FlatList with fixed getItemLayout (virtualized for free). Roles use
        the ARIA-aligned `role` prop (grid, row, rowgroup, columnheader, rowheader,
        cell) — RN''s accessibilityRole has no grid member. A header row View of role="columnheader"
        cells, rows as horizontal Views of fixed-width cells inside a horizontal ScrollView
        shared by header and body (scroll positions synced). Pinned columns are not
        sticky on native (no position: sticky, no extra dependency for a synced second
        list): they scroll with the rest and only cast pinnedShadow once scrolled,
        as Table''s row-header column. Column resize is a PanResponder drag on the
        header edge plus increment/decrement accessibility actions on the header cell
        (by resizeStep). Ctrl+C has no native equivalent (core RN has no clipboard
        API and no extra dependency is allowed); copy.copied is unused there. Each
        cell is accessible with accessibilityLabel "{column}: {value}" and, when editable,
        accessibilityHint "double tap to edit"; editing opens the system control inline
        (or a BottomSheet on phones for select/date). Row selection via Checkbox cells;
        range selection is not offered on native (no keyboard model), and `selectable:
        range` degrades to `row`. Arrow keys apply only on react-native-web. This
        is the one component where a phone is a poor fit; the doc recommends Table
        with `responsive: stack` for phone-first screens.'
    swiftui:
      element: ScrollView
      props:
      - ScrollView=both-axes
      - LazyVStack
      - LazyHStack
      - .accessibilityElement=contain
      - .focusable
      - .onMoveCommand
      - .onKeyPress
      - '@FocusState'
      - .accessibilityAction
      - Checkbox
      - UIPasteboard
      - Grid
      notes: 'Tablets and Catalyst first, as on RN. A `ScrollView([.horizontal, .vertical])`
        with a `LazyVStack` of row `HStack`s of fixed-width cells; the header row
        is pinned with `pinnedViews: .sectionHeaders`; pinned columns are drawn in
        a second `LazyVStack` overlaid at the leading edge and scrolled in sync through
        `.scrollPosition`. The grid is one focus section: an active-cell index in
        `@FocusState` moved by the keyboard table on iPad (`.onMoveCommand`, `.onKeyPress`
        for Page/Home/End/F2/Enter/Escape/Space/Ctrl+A/C); each cell is an accessibility
        element labelled ''{column}: {value}'' with `.accessibilityValue(copy.position)`;
        VoiceOver users tap to select or edit and use custom actions (`sort`, `select
        row`, `edit`, `copy`). Editors are the package Input/NumberInput/Select/DatePicker/Checkbox
        with `hideLabel`, `size: sm` shown in place (select/date in a sheet on phones).
        Range selection needs a hardware keyboard or a two-finger drag and degrades
        to `row` on phones with a debug warning; Ctrl+C writes TSV to `UIPasteboard.general`.
        Column resize: a `DragGesture` on the header edge plus an adjustable action
        on the header cell by `resizeStep`.'
  behavior:
  - name: activating-a-sortable-header-reports-the-sort
    given:
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
      - key: price
        header: Price
        align: end
        sortable: true
      data:
      - id: a
        sku: A-1
        price: 10
      - id: b
        sku: B-2
        price: 20
    when:
      click: sortButton
    then:
    - event: onSortChange
  - name: enter-on-a-sortable-header-sorts
    description: The grid enters on the first header cell; on a header cell Enter
      sorts (if sortable).
    given:
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
        sortable: true
      - key: price
        header: Price
        align: end
      data:
      - id: a
        sku: A-1
        price: 10
      - id: b
        sku: B-2
        price: 20
    when:
      key: Enter
    then:
    - event: onSortChange
    platforms:
    - web
    - lit
  - name: selecting-a-row-reports-the-selection
    description: 'Selection is separate from focus in row mode: focus is where the
      keyboard is, selection is what an action applies to.'
    given:
      selectable: row
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
      data:
      - id: a
        sku: A-1
      - id: b
        sku: B-2
    when:
      click: selectCell
    then:
    - event: onSelectionChange
  - name: a-selected-row-is-marked-selected
    given:
      selectable: row
      selected:
      - a
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
      data:
      - id: a
        sku: A-1
      - id: b
        sku: B-2
    then:
    - attribute: aria-selected
      is: 'true'
      'on': row
    platforms:
    - web
  - name: the-empty-message-shows-when-there-are-no-rows
    given:
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
      data: []
    then:
    - copy: empty
  - name: a-custom-empty-message-replaces-the-default
    given:
      emptyMessage: No prices loaded.
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
      data: []
    then:
    - text: No prices loaded.
  - name: loading-marks-the-grid-busy
    description: loading sets aria-busy and shows copy.loading in the status bar;
      existing rows stay.
    given:
      loading: true
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
      data:
      - id: a
        sku: A-1
    then:
    - attribute: aria-busy
      is: 'true'
    platforms:
    - web
  examples:
  - name: price-list
    description: The read-only grid people scroll and scan, sorted by a column they
      choose.
    given:
      caption: Price list
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
        width: 160
      - key: name
        header: Name
      - key: price
        header: Price
        align: end
        sortable: true
      data:
      - id: a
        sku: A-1
        name: Widget
        price: 10
      - id: b
        sku: B-2
        name: Sprocket
        price: 20
  - name: editable-cells
    description: A grid meant to be worked in, where Enter or F2 opens the editor
      on an editable column.
    given:
      caption: Stock levels
      editable: true
      columns:
      - key: sku
        header: SKU
        isRowHeader: true
      - key: onHand
        header: On hand
        align: end
        editable: true
        editor: number
      data:
      - id: a
        sku: A-1
        onHand: 12
      - id: b
        sku: B-2
        onHand: 4
  - name: row-selection-for-bulk-actions
    description: A checkbox column and Shift/Ctrl row selection, for acting on many
      rows at once.
    given:
      caption: Orders
      selectable: row
      density: comfortable
      columns:
      - key: order
        header: Order
        isRowHeader: true
      - key: customer
        header: Customer
      data:
      - id: a
        order: '1001'
        customer: Ana Souza
      - id: b
        order: '1002'
        customer: Bo Lin
  - name: range-selection-in-a-fixed-height-grid
    description: Spreadsheet-style rectangles that can be copied as tab-separated
      text, in a grid the caller sizes.
    given:
      caption: Daily figures
      selectable: range
      height: fixed
      columns:
      - key: day
        header: Day
        isRowHeader: true
      - key: visits
        header: Visits
        align: end
      - key: signups
        header: Signups
        align: end
      data:
      - id: a
        day: Monday
        visits: 1200
        signups: 30
      - id: b
        day: Tuesday
        visits: 1450
        signups: 41
```

## Events

- `onSortChange`: emit `onSortChange`
  - payload, positional, in this order: `column: string`, `direction: 'ascending' | 'descending'`
  - fires on: user
- `onSelectionChange`: emit `onSelectionChange`
  - payload, positional, in this order: `selection: string[] | { rowId: string; column: string } | { from: { rowId: string; column: string }; to: { rowId: string; column: string } }`
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
- `onRangeNeeded`: emit `onRangeNeeded`
  - payload, positional, in this order: `start: number`, `end: number`
  - fires on: user
- `onColumnResize`: emit `onColumnResize`
  - payload, positional, in this order: `column: string`, `width: number`
  - fires on: user
  - timing: commit

## Controlled state

- `sort` is controlled when given, uncontrolled from `defaultSort` when omitted; changes reported by `onSortChange` (emit `onSortChange`)

## Style bindings

- `headerSurface`: token `color.background.subtle`; part `header`; locked
- `headerColor`: token `color.foreground`; part `header`; locked
- `headerWeight`: token `font.weight.semibold`; part `header`
- `headerSize`: token `font.size.sm`; part `header`
- `headerBorder`: token `color.border.strong`; part `header`
- `headerBorderWidth`: token `border.width.thin`; part `header`
- `headerShadow`: token `shadow.raised`; part `header`
- `gridLine`: token `color.border`; part `grid`
- `gridLineWidth`: token `border.width.thin`; part `grid`
- `rowHeight`: token `size.target.min`; part `row`; locked
- `rowHeightComfortable`: token `size.target.comfortable`; part `row`; locked
- `rowHover`: token `color.action.ghost.backgroundHover`; part `row`; state `hover`
- `rowSelected`: token `color.background.subtle`; part `row`; locked
- `rowSelectedBorder`: token `color.control.selectedBackground`; part `row`; locked
- `rowSelectedBorderWidth`: token `border.width.focus`; part `row`; locked
- `cellColor`: token `color.foreground`; part `cell`; locked
- `cellMutedColor`: token `color.foreground.muted`; part `cell`; locked
- `cellPaddingInline`: token `space.2`; part `cell`
- `cellFocusRing`: token `color.border.focus`; part `cell`; locked
- `cellFocusRingWidth`: token `border.width.focus`; part `cell`; locked
- `cellEditingBackground`: token `color.control.background`; part `cell`; locked
- `cellEditingBorder`: token `color.border.focus`; part `cell`; locked
- `cellInvalidBorder`: token `color.border.danger`; part `cell`; locked
- `cellInvalidBackground`: token `color.status.danger.background`; part `cell`; locked
- `cellInvalidForeground`: token `color.status.danger.foreground`; part `cell`; locked
- `statusBarSurface`: token `color.background.subtle`; part `statusBar`; locked
- `statusBarColor`: token `color.foreground.muted`; part `statusBar`; locked
- `statusBarSize`: token `font.size.xs`; part `statusBar`
- `statusBarPadding`: token `space.2`; part `statusBar`
- `captionSize`: token `font.size.md`; part `caption`
- `captionWeight`: token `font.weight.semibold`; part `caption`
- `captionGap`: token `space.2`; part `caption`

## Keyboard

- `Control+c` (Copies the selection as tab-separated text (with headers when whole columns are selected); bound by key code KeyC.): expect manual

## Copy

- `sortAscending`: "Sort by {column}, ascending"; params `column` (string)
- `sortDescending`: "Sort by {column}, descending"; params `column` (string)
- `sortedAnnouncement`: "Sorted by {column}, {direction}"; params `column` (string), `direction` (string)
- `selectAll`: "Select all rows"
- `selectRow`: "Select {rowName}"; params `rowName` (string)
- `selectedRows`: "{count} of {total} rows selected"; params `count` (number), `total` (number)
- `selectedRange`: "{rows} rows by {columns} columns selected"; params `rows` (number), `columns` (number)
- `copied`: "Copied {cells} cells"; params `cells` (number); plural by `cells`: one "Copied {cells} cell", other "Copied {cells} cells"
- `editing`: "Editing {column}. Enter to save, Escape to cancel."; params `column` (string)
- `invalid`: "{message}"; params `message` (string)
- `rowCount`: "{count} rows"; params `count` (number); plural by `count`: one "{count} row", other "{count} rows"
- `position`: "Row {row}, {column}"; params `row` (number), `column` (string)
- `resize`: "Resize {column}"; params `column` (string)
- `loading`: "Loading"
- `empty`: "Nothing to show."
- `scrollHint`: "Scroll sideways to see more columns"

## Constants and examples

- example `price-list`, story `PriceList`: given `caption: "Price list"`, `columns: [{"key":"sku","header":"SKU","isRowHeader":true,"width":160},{"key":"name","header":"Name"},{"key":"price","header":"Price","align":"end","sortable":true}]`, `data: [{"id":"a","sku":"A-1","name":"Widget","price":10},{"id":"b","sku":"B-2","name":"Sprocket","price":20}]`; The read-only grid people scroll and scan, sorted by a column they choose.
- example `editable-cells`, story `EditableCells`: given `caption: "Stock levels"`, `editable: true`, `columns: [{"key":"sku","header":"SKU","isRowHeader":true},{"key":"onHand","header":"On hand","align":"end","editable":true,"editor":"number"}]`, `data: [{"id":"a","sku":"A-1","onHand":12},{"id":"b","sku":"B-2","onHand":4}]`; A grid meant to be worked in, where Enter or F2 opens the editor on an editable column.
- example `row-selection-for-bulk-actions`, story `RowSelectionForBulkActions`: given `caption: "Orders"`, `selectable: "row"`, `density: "comfortable"`, `columns: [{"key":"order","header":"Order","isRowHeader":true},{"key":"customer","header":"Customer"}]`, `data: [{"id":"a","order":"1001","customer":"Ana Souza"},{"id":"b","order":"1002","customer":"Bo Lin"}]`; A checkbox column and Shift/Ctrl row selection, for acting on many rows at once.
- example `range-selection-in-a-fixed-height-grid`, story `RangeSelectionInAFixedHeightGrid`: given `caption: "Daily figures"`, `selectable: "range"`, `height: "fixed"`, `columns: [{"key":"day","header":"Day","isRowHeader":true},{"key":"visits","header":"Visits","align":"end"},{"key":"signups","header":"Signups","align":"end"}]`, `data: [{"id":"a","day":"Monday","visits":1200,"signups":30},{"id":"b","day":"Tuesday","visits":1450,"signups":41}]`; Spreadsheet-style rectangles that can be copied as tab-separated text, in a grid the caller sizes.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `headerWeight`, `headerSize`, `headerBorder`, `headerBorderWidth`, `headerShadow`, `gridLine`, `gridLineWidth`, `rowHover`, `cellPaddingInline`, `pinnedShadow`, `resizeHandle`, `resizeHandleWidth`, `resizeStep`, `statusBarSize`, `statusBarPadding`, `captionSize`, `captionWeight`, `captionGap`, `fixedHeight`, `fontFamily`, `fontSize`, `lineHeight`, `numericFont`, `transition`
Locked (accessibility-bearing, never overridable): `surface`, `headerSurface`, `headerColor`, `rowHeight`, `rowHeightComfortable`, `rowSelected`, `rowSelectedBorder`, `rowSelectedBorderWidth`, `cellColor`, `cellMutedColor`, `cellFocusRing`, `cellFocusRingWidth`, `cellEditingBackground`, `cellEditingBorder`, `cellInvalidBorder`, `cellInvalidBackground`, `cellInvalidForeground`, `rangeBackground`, `rangeBorder`, `rangeBorderWidth`, `statusBarSurface`, `statusBarColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: ScrollView
props:
- ScrollView=both-axes
- LazyVStack
- LazyHStack
- .accessibilityElement=contain
- .focusable
- .onMoveCommand
- .onKeyPress
- '@FocusState'
- .accessibilityAction
- Checkbox
- UIPasteboard
- Grid
notes: 'Tablets and Catalyst first, as on RN. A `ScrollView([.horizontal, .vertical])`
  with a `LazyVStack` of row `HStack`s of fixed-width cells; the header row is pinned
  with `pinnedViews: .sectionHeaders`; pinned columns are drawn in a second `LazyVStack`
  overlaid at the leading edge and scrolled in sync through `.scrollPosition`. The
  grid is one focus section: an active-cell index in `@FocusState` moved by the keyboard
  table on iPad (`.onMoveCommand`, `.onKeyPress` for Page/Home/End/F2/Enter/Escape/Space/Ctrl+A/C);
  each cell is an accessibility element labelled ''{column}: {value}'' with `.accessibilityValue(copy.position)`;
  VoiceOver users tap to select or edit and use custom actions (`sort`, `select row`,
  `edit`, `copy`). Editors are the package Input/NumberInput/Select/DatePicker/Checkbox
  with `hideLabel`, `size: sm` shown in place (select/date in a sheet on phones).
  Range selection needs a hardware keyboard or a two-finger drag and degrades to `row`
  on phones with a debug warning; Ctrl+C writes TSV to `UIPasteboard.general`. Column
  resize: a `DragGesture` on the header edge plus an adjustable action on the header
  cell by `resizeStep`.'
```

## Guidance

## Overview

A data grid is for working in data, not reading it: hundreds or thousands of rows, arrow keys from cell to cell, type to edit, select a block and copy it. It shares Table's column and data model so a screen can start as a Table and become a DataGrid when the job changes, but it is a different role with a different keyboard contract, and the two are never one component with a switch.

## When to use

Use a DataGrid when people navigate cell by cell, edit values in place, select ranges, or scroll through more rows than fit in memory as DOM: price lists, inventory counts, timesheets, admin views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and mark the columns that may change; give every editable column a `validate`. Use `height: viewport` (the default) so the grid, not the page, scrolls.

## When not to use

Do not use a DataGrid for content people read and act on by row — orders, members, invoices — where Table's ordinary Tab order, stacked responsive mode and row links serve better. Do not use it on phone-first screens (its keyboard model has no touch equivalent; Table with `responsive: stack` does). Do not use it for a handful of editable fields (a Form). Do not put links, buttons and editors in the same cell.

## Behavior

The grid is one tab stop; arrow keys move a focus rectangle between cells, Page keys move by a screen of rows, Home/End by row or (with Ctrl) by grid. Enter on a sortable header sorts; Enter or F2 on an editable cell opens its editor (typing a printable character opens a text or number editor with that character as its `defaultValue`, replacing the value; for select, date and checkbox editors typing only opens); Enter commits and moves down, Tab commits and moves to the next editable cell in the row, F2 commits in place, Escape cancels. Text, number and date editors commit on Enter, Tab, F2 or blur; select and checkbox editors commit on change (they are discrete pickers). Editors are the composed Input/NumberInput/Select/DatePicker/Checkbox with `hideLabel`, `size: sm` and inset-zero overrides; they are never told about validity — the cell shows cellInvalid* while the editor stays open, the message goes to the status bar, and `copy.editing` is announced through the status bar live region when an editor opens (nothing is wired to the editor's own describedby). Invalid edits stay open with the message shown in the status bar and announced. `selectable: row` toggles rows with Space and the checkbox column; `range` extends with Shift+arrows or drag and copies as TSV with Ctrl+C. Focus and selection are independent. Rows render only in the visible window plus overscan; `rowCount` with `onRangeNeeded` lets the caller page in from a server while the scrollbar reflects the whole set. Pinned columns stay put during horizontal scroll and cast a shadow once the body has moved. Range selection by pointer: pointerdown on a body cell sets the anchor, pointermove with capture extends the rectangle, Shift+click extends from the existing anchor; the overlay is clipped to the rendered window when an endpoint has scrolled out of it. `cell` mode has no selection keys: the focused cell is the selection. Select-all and column selection cover the loaded rows only. `copy.position` is the status bar's text for the active cell and is not announced — aria-rowindex/aria-colindex already carry position, and a polite region on every arrow press would be noise.

## Content guidelines

Headers are short and unit-bearing ("Qty", "Price (USD)"); use `abbr` for the spoken form. Numbers align end with a fixed number of decimals per column. Editable columns should look editable only on focus (the editor appears in place) — no permanent input chrome in every cell. Keep the status bar: it is where counts, copy confirmations and validation messages live for sighted users, matching what the live region says.

## Accessibility

The grid follows the APG grid pattern: `role="grid"` with `rowgroup`, `row`, `columnheader`, `rowheader` and `gridcell` roles stated explicitly, `aria-rowcount`/`aria-colcount` and per-row/cell indexes so virtualization does not hide the shape (WCAG 1.3.1, 4.1.2). It is one tab stop with full arrow-key navigation (2.1.1, 2.4.3) using `aria-activedescendant` so focus is stable while rows recycle; interactive cell content and editors take real focus while active and hand it back. Sort, selection counts, copy and editing state are announced and shown in the status bar (4.1.3). Validation errors are text, associated with the cell, and never color alone (3.3.1, 1.4.1). The focus ring is inset so it is visible at the grid edges (2.4.7, 2.4.11). Rows meet the minimum target height (2.5.8). Escape always leaves an editor without saving (2.1.2).

## Platform notes

### Web
Render `<div data-ds="DataGrid">` with the caption (`Heading` or visually hidden text with an id), then the scroll region `<div role="grid" aria-labelledby aria-rowcount aria-colcount aria-multiselectable aria-readonly={!editable} aria-busy tabindex="0" aria-activedescendant>` containing a sticky header `<div role="rowgroup"><div role="row" aria-rowindex="1">` of `<div role="columnheader" aria-colindex aria-sort id>` (with the sort `Button` and the resize `<div role="separator">` when applicable), and the body `<div role="rowgroup">` positioned inside a spacer sized to `rowCount × rowHeight`, rendering the visible rows as `<div role="row" aria-rowindex aria-selected style="transform: translateY(...)">` of `<div role="gridcell"|"rowheader" aria-colindex id tabindex="-1">`. Keydown on the grid implements the table, updating the active cell id and scrolling it into view. For a cell with a control or an open editor, move real focus in and set `aria-activedescendant` to the cell; on Escape/commit, focus the grid again. Editors: `Input`/`NumberInput`/`Select`/`DatePicker`/`Checkbox` with `hideLabel`-style visually hidden labels, `size="sm"`, and `overrides` that zero the inset. Range overlay: one absolutely positioned `<div aria-hidden>` from the anchor and focus cells. Status bar: `<div role="status">` doubles as the live region. Pinned columns use `position: sticky` within each row. `ResizeObserver` recomputes the visible window.

### Lit
`<ds-data-grid caption="Price list" .columns=${columns} .data=${rows} editable selectable="range" height="viewport"></ds-data-grid>`; the grid is in the shadow root; `repeat` over the window; composed events; editors are `ds-input`, `ds-number-input`, `ds-select`, `ds-date-picker`, `ds-checkbox`.

### React Native
`FlatList` with `getItemLayout` from `rowHeight`, inside a horizontal `ScrollView` shared with the header row; pinned columns in a second `FlatList` whose scroll offset is synced. Cells are `Pressable`s with `accessibilityLabel` "{column}: {value}"; editable cells open the system control inline (text, number, checkbox) or in a `BottomSheet` (select, date). `selectable: range` degrades to `row`. `onEndReached` drives `onRangeNeeded`.

## Related

Table, Input, NumberInput, Select, DatePicker, Checkbox, Toolbar.

## Behavior scenarios (15)

One test per scenario, in this order.

```yaml
- name: activating-a-sortable-header-reports-the-sort
  given:
    columns:
    - key: sku
      header: SKU
      isRowHeader: true
    - key: price
      header: Price
      align: end
      sortable: true
    data:
    - id: a
      sku: A-1
      price: 10
    - id: b
      sku: B-2
      price: 20
  when:
    click: sortButton
  then:
  - event: onSortChange
- name: selecting-a-row-reports-the-selection
  description: 'Selection is separate from focus in row mode: focus is where the keyboard
    is, selection is what an action applies to.'
  given:
    selectable: row
    columns:
    - key: sku
      header: SKU
      isRowHeader: true
    data:
    - id: a
      sku: A-1
    - id: b
      sku: B-2
  when:
    click: selectCell
  then:
  - event: onSelectionChange
- name: the-empty-message-shows-when-there-are-no-rows
  given:
    columns:
    - key: sku
      header: SKU
      isRowHeader: true
    data: []
  then:
  - copy: empty
- name: a-custom-empty-message-replaces-the-default
  given:
    emptyMessage: No prices loaded.
    columns:
    - key: sku
      header: SKU
      isRowHeader: true
    data: []
  then:
  - text: No prices loaded.
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
- name: renders-selectable-range
  given:
    selectable: range
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
