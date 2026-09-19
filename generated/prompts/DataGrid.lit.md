# Generate: DataGrid as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/DataGrid.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `DataGrid.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: DataGridVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
- Each event is dispatched as a `CustomEvent` named by its `platforms.lit` value with `bubbles: true, composed: true` so it crosses the shadow boundary.
- Styles live in `static override styles: CSSResult = css\`…\`` and read ONLY token custom properties (`var(--color-…)`), which inherit through the shadow root. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes an attribute selector per enum value, e.g. `:host([variant="primary"]) { background: var(--color-action-primary-background); }`.
- Implement every item in `a11y.requires` inside the shadow DOM using a native element (e.g. a real `<button>`), and use `delegatesFocus: true` in `static override shadowRootOptions: ShadowRootInit` so focusing the host focuses the inner element.
- `accessible-name`: forward `label` to visible text or `aria-label` on the inner element.
- `focus-visible`: style `:focus-visible` on the inner element with `--color-border-focus` / `--border-width-focus`.
- `heading-hierarchy`: render the matching `<h1>`–`<h6>` inside the shadow root based on the level prop.
- Support light and dark by relying on token variables only.
- Form ownership is DOM-tree based: slotted light-DOM children are not owned by a `<form>` inside a shadow root. Follow the platform notes for how ds-form and ds-input cooperate by `name`.
- Events named like native events (`focus`, `blur`) are the native retargeted events — do not dispatch a CustomEvent with the same name.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard`, removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- Story render shape: the render that applies to a story (its own `render`, else the meta's) is written inline and returns one `html`` template directly — never a call (`render: (args) => renderBox(args)`) and never a bare identifier (`render: divider`). The docs site reads that template for the Lit code sample, and anything else leaves every story in the module without one. Interpolate helper fragments into the template rather than wrapping it.
- Story parity: every story the React package exports has a Lit story with the same export name and args, including each example named above.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `DataGrid.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element in the shadow root), only in its `state` (`:hover`, `:focus-visible`, the reflected state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated property, event, value or element keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development (`import.meta.env.DEV`) naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
  - resizeHandle
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
    caption:
      component: Heading
      forwards:
        captionSize: fontSize
        captionWeight: fontWeight
    sortButton:
      component: Button
      forwards:
        headerWeight: fontWeight
        headerSize: fontSize
    selectCell: Checkbox
    selectAllCell: Checkbox
    emptyState: Text
    statusBar:
      component: Text
      forwards:
        statusBarSize: fontSize
  props:
    caption:
      type: string
      required: true
      description: 'What the grid holds ("Price list"). The accessible name; visually
        hidden with `hideCaption`. Required: a grid built without one falls back to
        an empty caption and warns in development.'
      a11y: aria-labelledby the caption (web) / accessibilityLabel (native).
    captionLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      default: '2'
      description: Heading level of the caption in the page outline; its size is captionSize
        regardless, as Table. On React Native the level has no observable effect —
        Heading sets the header trait at every level and captionSize/captionWeight
        pin the typography — so the prop is accepted and forwarded for parity only.
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
        string; label: string }[]; render?: (row: Row) => unknown; validate?: (value:
        unknown, row: Row) => string | undefined }[]'
      description: 'Table''s column model plus grid concerns: pixel `width` (columns
        do not auto-size in a virtualized grid; `width` is a multiple of space.1,
        e.g. 160; the `columnWidth` binding when omitted), `minWidth` (the floor for
        pointer and keyboard resize; never below size.target.min, which is also its
        default), `resizable` (pointer drag on the header edge, Shift+ArrowLeft/Right
        on the header cell by `resizeStep`), `pinned` columns that stay put while
        scrolling sideways (pinned columns must be contiguous at the start or end
        of `columns` and keep their order there; the selection column is always pinned
        start and counted in the offsets), `editable` with an `editor` kind and `validate`.
        Exactly one column may be `isRowHeader`. `abbr` is the spoken name of a non-sortable
        header (the visible header is aria-hidden beside visually hidden `abbr` text);
        a sortable header''s name stays copy.sortAscending/sortDescending built from
        `header`, so `abbr` has no effect on a sortable column. `render` returns a
        ReactNode on web and rn and a lit-renderable value (TemplateResult, string
        or number) on Lit — hence `unknown` in the shape, the one type that covers
        all three. The two column rules with no runtime consequence — exactly one
        `isRowHeader`, pinned columns contiguous at one end — are development-time
        warnings on every platform, never thrown errors.'
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
        set and the sort is uncontrolled. A controlled `sort` never reorders `data`
        — the caller owns the order, as Table.
    selectable:
      type: enum
      values:
      - none
      - row
      - cell
      - range
      default: none
      description: '`row` adds a checkbox column and Shift/Ctrl row selection (pointer:
        a click on the select cell or its Checkbox toggles the row, Ctrl/Cmd+click
        toggles, Shift+click adds the rows from the anchor through the clicked row,
        a plain click on a data cell only moves focus); `cell` selects the focused
        cell (selection follows focus, no key needed, and the focus ring is its only
        visual: onSelectionChange fires on every move to a body data cell, whether
        the move came from the keyboard or from a click, and a move to a header cell,
        to the selection column or to a row that is not loaded selects nothing); `range`
        allows Shift+arrow / pointer-drag rectangles (copy as TSV). Selection is separate
        from focus in row and range mode: focus is where the keyboard is, selection
        is what an action applies to.'
    selected:
      type: array
      shape: string[]
      description: 'Controlled selected row ids (row mode). There is no `defaultSelected`:
        left undefined the grid keeps the selection itself, and onSelectionChange
        fires in both modes, as the controlled-state rule for `sort`.'
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
      description: 'The header stays visible while the grid''s own scroll region scrolls.
        Always true when virtualized. It never sticks to the page, so with `height:
        content` (the page scrolls) it has no effect.'
    height:
      type: enum
      values:
      - content
      - viewport
      - fixed
      default: viewport
      description: '`viewport` sets the whole component (caption, scroll region and
        status bar) to `100vh − 2 × layout.gap.section` — on native, the window height
        less 2 × layout.gap.section — and the scroll region takes what the caption
        and status bar leave, as Table (the grid, not the page, scrolls); `content`
        grows with rows (no virtualization, small grids); `fixed` uses a height the
        caller sets through `overrides.fixedHeight` — one of the few size bindings
        that is overridable by design.'
    loading:
      type: boolean
      default: false
      description: Sets aria-busy and shows `copy.loading` in the status bar; existing
        rows stay, their text in cellMutedColor.
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
        or a range `{ from, to }`. Fired only when the selection actually changes;
        clearing a range with Escape fires nothing (the union has no empty range),
        and a plain arrow that collapses a multi-cell range fires once with the one-cell
        range.'
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
        }`, and only when the committed value differs from the cell's (Object.is);
        `validate` still runs on an unchanged commit. The caller updates `data`; the
        grid shows the old value until it does (a rejected edit reverts visibly).
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
        shape: string | number | boolean | undefined
        description: The committed value, as the column editor produces it; undefined
          when cleared (Delete/Backspace, or an emptied number editor).
      - name: previous
        type: union
        shape: string | number | boolean | undefined
        description: The value the cell held before the edit; undefined when the row
          had none.
      fires:
      - user
      timing:
        phase: request
    onEditStart:
      description: Fired when an editor opens; return false (web, rn — the payload
        is positional, so there is no event to preventDefault) or call preventDefault
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
      description: 'Fired when the visible window (or Ctrl+End / PageDown) comes within
        one page of the end of `data` and `rowCount` says there is more, with `{ start,
        end }` row indexes to load; fired once per `end` until `data` grows. It asks
        for one visible page: `start = data.length`, `end = min(rowCount − 1, data.length
        + rowsPerPage − 1)`, where rowsPerPage is the scroll region''s height divided
        by the row height (on rn, `onEndReachedThreshold={1}`). Checked on scroll
        and keyboard moves only, never on mount.'
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
        description: The last row index to load, inclusive.
      fires:
      - user
    onColumnResize:
      description: Fired with `{ column, width }` when the user finishes dragging
        a resizable column edge, or on keyup of Shift after Shift+ArrowLeft/Right
        resizing.
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
      the grid — the editor is removed in the same task so the browser's own Tab lands
      outside, unless `validate` rejects that commit, in which case the editor stays
      open and the key does nothing.
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
    action: 'First cell in the row (Ctrl: first cell in the grid, the header row included).'
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
      Button, Checkbox): focuses the first focusable descendant and clicks it (on
      a custom element, its inner native control), and Escape hands focus back to
      the cell. Controls inside `render` are demoted to tabindex=-1 after every update
      so the grid stays one tab stop.'
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
    action: 'Row mode: toggles the focused row; Shift+Space adds the rows from the
      anchor (the last row toggled) through the focused row to the existing selection.
      Range mode: selects the focused row as a full-width range, Shift+Space extends
      that row range, Ctrl+Space selects the focused column as a range over the loaded
      rows.'
    when: selectable is row or range
    from: inside
    expect: manual
  - keys:
    - Shift+ArrowRight
    - Shift+ArrowLeft
    - Shift+ArrowDown
    - Shift+ArrowUp
    action: Extends the range selection from the anchor; a plain navigation key (arrows,
      Home/End, Page keys) collapses the range to the newly focused cell and makes
      it the anchor. After Escape has cleared the range, plain keys only move the
      anchor.
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
      on any layout). Control here and in every Ctrl chord of this table means Control
      or Meta (Cmd on macOS).
    when: selectable is row or range
    from: inside
    expect: manual
  - keys:
    - Control+c
    action: Copies the selection as tab-separated text; the header line is written
      when the range spans every loaded row, which is what "whole columns" means for
      a partly loaded set. Bound by key code KeyC, Control or Meta. copy.copied is
      announced once the clipboard write resolves; a refused or unavailable clipboard
      announces nothing.
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
    action: 'Clears the value of editable cells in the selection — every editable
      cell of the selected rows (row), the range (range), the focused cell (cell);
      nothing in `none` mode: onCellChange fires once per cleared cell with `value:
      undefined`, the same shape the column model calls an omitted value, not an empty
      string, in row-major order (rows in display order, columns in `columns` order).
      `validate` does not run; the caller rejects a clear by not updating `data`.
      These two keys are the only path to `undefined` besides an emptied number editor,
      so on rn — where they have no equivalent — a cell cannot be cleared at all;
      clearing is web, lit and swiftui.'
    when: editable and selection
    from: inside
    expect: manual
  styles:
    surface:
      token: color.background
      part: container
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
        and overrides both work. Until a row has been measured (and always in jsdom)
        rows are positioned with calc(index × the row size) from the token and at
        most 50 render (`literal-ok`).
      locked: true
    rowHeightComfortable:
      token: size.target.comfortable
      part: row
      locked: true
    rowHover:
      token: color.action.ghost.backgroundHover
      part: row
      state: hover
      description: Row under the pointer, the select cell included; the grid is interactive
        by nature so hover is allowed, and the focused cell ring is the non-hover
        signal. On native it is the pressed fill (and the react-native-web hover);
        a selected row keeps rowSelected.
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
      description: Text of the existing body cells while `loading` (they stay but
        read as stale).
      locked: true
    cellPaddingInline:
      token: space.2
      part: cell
      locked: false
    selectColumnWidth:
      token: size.target.min
      part: selectCell
      description: The selection column's total inline size is this plus 2 × cellPaddingInline,
        and the cell has no inline padding of its own — the Checkbox is centred in
        it, and Checkbox has no inset override to take that padding. Pinned-start
        offsets add the same total.
      locked: true
    columnWidth:
      token: space.20
      computed:
        times: 2
      description: Width of a column that sets no `width` (160px); an override replaces
        the base, the × 2 stays in the rule.
      locked: false
    cellFocusRing:
      token: color.border.focus
      part: cell
      description: Drawn inside the cell (inset) so it is never clipped by neighbors
        or the scroll region. Shown on the active cell whenever the grid has focus,
        pointer focus included (on web :focus-within on the grid, since a clicked
        div is not :focus-visible).
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
      description: 'The validation message in the status bar: a cellInvalidBackground
        span that re-scopes the foreground to this token (`--color-foreground` on
        web and Lit, TextForegroundContext on native) around a default-tone Text,
        since Text.color is locked (the claimed pair). The invalid cell itself holds
        the untouched editor and shows only cellInvalidBackground and cellInvalidBorder
        (an inset ring on native).'
      locked: true
    rangeBackground:
      token: color.background.strong
      part: rangeOverlay
      description: 'Selected range fill, drawn beneath the cell content (so the foreground-on-strong
        pair is exact); opaque pinned cells and a hovered row cover it. The range
        border marks its edge and is drawn above the cells. Range selection is web,
        lit and swiftui only — `selectable: range` degrades to `row` on rn, so the
        `rangeOverlay` part, these three bindings and copy.selectedRange have no element
        and no code there.'
      locked: true
    rangeBorder:
      token: color.control.selectedBackground
      part: rangeOverlay
      locked: true
    rangeBorderWidth:
      token: border.width.focus
      part: rangeOverlay
      locked: true
    pinnedShadow:
      token: shadow.raised
      part: cell
      description: 'Cast by pinned columns once the body has scrolled sideways: start
        pins on their end edge, end pins on their start edge.'
      locked: false
    resizeHandle:
      token: color.border.strong
      part: resizeHandle
      description: The column edge grab area (role=separator, not focusable; keyboard
        resizing is Shift+Arrow on the header cell), visible on hover/focus of the
        header cell. Its aria-valuenow is set once the column has a pixel width —
        an explicit `width` or one the user has resized — and omitted while the column
        sits at the columnWidth token, whose pixel value the grid does not know at
        render. Native has no hover, so it is always visible there, hit-slopped to
        size.target.min.
      locked: false
    resizeHandleWidth:
      token: space.1
      part: resizeHandle
      locked: false
    resizeStep:
      token: space.4
      description: Width change per Shift+Arrow press on a resizable header cell.
      locked: false
    statusBarSurface:
      token: color.background.subtle
      part: statusBar
      description: The `statusBar` part stays on the live status Text (the composed
        Text that carries statusBarSize); statusBarSurface, statusBarPadding and statusBarGap
        style the bar element the grid owns around that Text and its sibling Texts,
        which carries no part of its own.
      locked: true
    statusBarColor:
      token: color.foreground.muted
      part: statusBar
      description: The status bar Texts use `tone="muted"`; Text.color is locked,
        so this is not forwarded.
      locked: true
    statusBarSize:
      token: font.size.xs
      part: statusBar
      locked: false
    statusBarPadding:
      token: space.2
      part: statusBar
      locked: false
    statusBarGap:
      token: space.2
      part: statusBar
      description: 'Between status bar items, which are laid out in this order and
        no other: the live message, the row count, the selection count, the scroll
        hint, the position. No separator characters. The row count is always shown;
        the selection count only while something is selected; the scroll hint only
        while the columns overflow the region and it has not yet been scrolled sideways;
        the position only once there is an active cell (so in `row` and `none` mode
        on rn, where there is no active cell until one is tapped, it is absent).'
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
      description: 'Below the caption; the Heading''s own margin is turned off with
        `overrides={{ marginBlockEnd: ''space.0'' }}`, as Table.'
      locked: false
    fixedHeight:
      token: space.20
      description: 'The height for `height: fixed`. It sizes the whole component —
        caption, scroll region and status bar — as `viewport` does, and the scroll
        region takes what the caption and status bar leave. Overridable by design
        (a page decides how tall its grid is); space.20 is the floor, not a recommendation.'
      locked: false
    fontFamily:
      token: font.family.body
      description: The component's font, set on the container and inherited by the
        scroll region and the cells.
      locked: false
    fontSize:
      token: font.size.sm
      description: Set with fontFamily on the container.
      locked: false
    lineHeight:
      token: font.lineHeight.tight
      description: Set with fontFamily on the container.
      locked: false
    numericFont:
      token: font.family.mono
      part: cell
      description: Cells whose raw value is a number and that have no `render`.
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    focusRing:
      token: color.border.focus
      part: scrollRegion
      description: Drawn by the scroll region while the grid inside it has focus,
        so the ring is never clipped by the region's own overflow.
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: scrollRegion
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
      platforms:
      - web
      - lit
      - swiftui
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
        on the grid. aria-rowcount counts the header row — it is `(rowCount ?? data.length)
        + 1`, the header row is aria-rowindex 1 and body rows start at 2. aria-multiselectable
        is "true" in `row` and `range`, "false" in `cell`, and absent in `none`. `scrollRegion`
        and `grid` are two nested elements: scrollRegion is the scrolling div (it
        draws focusRing while the grid inside it is :focus-visible, so the ring is
        not clipped) and grid is the role="grid" div inside it that carries tabindex,
        aria-activedescendant and the rowgroups. Focus: the grid element is the tab
        stop (tabindex=0) and uses aria-activedescendant pointing at the current cell
        (cells have ids and tabindex=-1); this keeps focus stable while rows are recycled.
        Except when a cell contains an interactive element or an editor is open: then
        real focus moves into it (the APG "focus inside the cell" mode) and returns
        to the cell on Escape/commit. Virtualization: a fixed rowHeight makes offsets
        arithmetic; a spacer sets the scroll height; rows render with translateY;
        overscan of one page. Editing: the editor is the system Input/NumberInput/Select/DatePicker/Checkbox
        rendered inside the cell with its label visually hidden, size sm, `overrides`
        for inset zero (Input, NumberInput, DatePicker: `paddingInline`/`paddingBlock`
        space.0; Select: `triggerPaddingInline`/`triggerPaddingBlock` space.0; Checkbox:
        none); validate on commit, and an invalid cell keeps the editor open with
        the message in the status bar and aria-describedby. Range selection is drawn
        with an absolutely positioned overlay, not per-cell styles. `container?: HTMLElement`
        (default document.body) is the portal target for the composed Select and DatePicker
        editors — a platform prop, not a schema prop. Column resize: the resizeHandle
        part, a separator (role="separator" aria-orientation="vertical" aria-valuenow)
        on the header cell edge, draggable with the pointer and not focusable; the
        keyboard path is Shift+ArrowLeft/Right on the header cell. Button and Heading
        keep their own data-part, so the sortButton part is a span the grid owns around
        the Button (it takes the click), and a click anywhere on a selectCell/selectAllCell
        toggles its Checkbox; the sort Button gets `overrides.paddingInline` space.0
        so its text lines up with the cells. Copy writes text/plain TSV to the clipboard.
        The statusBar part is a div carrying the surface and padding; inside it only
        a live span is role="status" (loading, invalid, sort, selection, copy and
        editing announcements), and the row count, selection count, scrollHint and
        position Texts sit beside it outside the live region. With showStatusBar false
        the bar stays in the DOM, visually hidden, holding only the live span.'
    lit:
      tag: ds-data-grid
      reflect:
      - selectable
      - editable
      - density
      - height
      - loading
      - hide-caption
      - caption-level
      - prop: showStatusBar
        attribute: no-status-bar
      - prop: stickyHeader
        attribute: no-sticky-header
      notes: '`columns` and `data` as properties; `showStatusBar` and `stickyHeader`
        default true, so their attributes are the negated `no-status-bar` / `no-sticky-header`.
        `caption`, `row-count` (Number) and `empty-message` are plain attributes that
        are not reflected; `sort`, `defaultSort`, `selected` and `overrides` are properties
        only (`attribute: false`), as `columns` and `data`. Plural copy (copy.copied,
        copy.rowCount) selects its form with `new Intl.PluralRules` at the runtime
        default locale — `document.documentElement.lang` when the page sets one. the
        grid renders in the shadow root with `repeat` keyed by row id over the visible
        window. aria-activedescendant works inside one shadow root. Editors are the
        ds-* form elements composed in the cell. Composed events as listed. ElementInternals
        role="grid" is NOT used on the host; the inner container carries the role
        so ids for activedescendant resolve within the same root.'
    rn:
      element: FlatList
      props:
      - role=grid
      - accessibilityLabel
      - getItemLayout
      - stickyHeaderIndices
      - onEndReached
      notes: 'A FlatList with fixed getItemLayout (virtualized for free); the FlatList
        is the role="grid" element named by the caption, the header row has its own
        rowgroup, and the body rows have no rowgroup element. The caption Heading
        uses `captionLevel` as on web. Roles use the ARIA-aligned `role` prop (grid,
        row, rowgroup, columnheader, rowheader, cell) — RN''s accessibilityRole has
        no grid member. A header row View of role="columnheader" cells, rows as horizontal
        Views of fixed-width cells inside a horizontal ScrollView shared by header
        and body (scroll positions synced). Pinned columns are not sticky on native
        (no position: sticky, no extra dependency for a synced second list): they
        scroll with the rest and only cast pinnedShadow once scrolled, as Table''s
        row-header column. Column resize is a PanResponder drag on the always-visible
        header edge plus increment/decrement accessibility actions on the header cell
        (by resizeStep). Commit timing: Input commits on blur; NumberInput and DatePicker
        have no blur event, so they commit when another cell or a sort header is pressed
        or through the editing cell''s `activate` accessibility action, and `escape`
        cancels (an open editor stays open if focus leaves the grid); Select and Checkbox
        commit on change. Ctrl+C has no native equivalent (core RN has no clipboard
        API and no extra dependency is allowed); copy.copied is unused there. Each
        cell is accessible with accessibilityLabel "{column}: {value}" and, when editable,
        accessibilityHint copy.editHint; editing opens the system control inline,
        and select/date show a BottomSheet on phones through Select''s and DatePicker''s
        own native presentation, not a separate BottomSheet. Row selection via Checkbox
        cells; range selection is not offered on native (no keyboard model), and `selectable:
        range` degrades to `row`. Arrow keys apply only on react-native-web, and even
        there they are not wired: core RN gives View and Pressable no key events,
        so the whole cell-navigation model — arrows, Home/End, Page keys, Ctrl+A —
        is replaced by touch, where tapping a cell selects or edits it, the select-all
        checkbox stands in for Ctrl+A, and the header button sorts. `copy.position`
        has no announcement here. Native has no aria-rowindex/aria-rowcount either,
        so position among unloaded rows is never spoken: the grid''s accessibilityLabel
        is the caption followed by copy.rowCount, so at least the total is announced
        on focus, and copy.position stays visible-only. `aria-readonly` has no native
        equivalent either — a read-only grid is told apart only by its cells carrying
        no copy.editHint. There is no Escape key: the only way to abandon an open
        editor is the editing cell''s `escape` accessibility action (VoiceOver''s
        two-finger scrub, TalkBack''s back gesture), which is what answers `escape-dismiss`
        here; a sighted touch user leaves an edit by pressing another cell, which
        commits it. FlatList also gives the set of body rows no wrapper of its own,
        so the `body` rowgroup part has no element on native: the list is the grid,
        and only the header row carries a rowgroup. This is the one component where
        a phone is a poor fit; the doc recommends Table with `responsive: stack` for
        phone-first screens.'
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
  - name: range-selection
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

- `onSortChange`: emit `sort-change`
  - payload, the keys of `CustomEvent.detail`: `column: string`, `direction: 'ascending' | 'descending'`
  - fires on: user
- `onSelectionChange`: emit `selection-change`
  - payload, the keys of `CustomEvent.detail`: `selection: string[] | { rowId: string; column: string } | { from: { rowId: string; column: string }; to: { rowId: string; column: string } }`
  - fires on: user
- `onCellChange`: emit `cell-change`
  - payload, the keys of `CustomEvent.detail`: `rowId: string`, `column: string`, `value: string | number | boolean | undefined`, `previous: string | number | boolean | undefined`
  - fires on: user
  - timing: request
- `onEditStart`: emit `edit-start`
  - payload, the keys of `CustomEvent.detail`: `rowId: string`, `column: string`
  - cancelable: yes
  - fires on: user
  - timing: before-change
- `onRangeNeeded`: emit `range-needed`
  - payload, the keys of `CustomEvent.detail`: `start: number`, `end: number`
  - fires on: user
- `onColumnResize`: emit `column-resize`
  - payload, the keys of `CustomEvent.detail`: `column: string`, `width: number`
  - fires on: user
  - timing: commit

## Controlled state

- `sort` is controlled when given, uncontrolled from `defaultSort` when omitted; changes reported by `onSortChange` (emit `sort-change`)

## Parts and slots

- `container`: element
- `scrollRegion`: element
- `grid`: element
- `caption`: component `Heading`; forwards `captionSize` → `overrides.fontSize`, `captionWeight` → `overrides.fontWeight`
- `header`: element
- `headerRow`: element
- `columnHeader`: element
- `sortButton`: component `Button`; forwards `headerWeight` → `overrides.fontWeight`, `headerSize` → `overrides.fontSize`
- `resizeHandle`: element
- `body`: element
- `row`: element
- `rowHeader`: element
- `cell`: element
- `cellContent`: element
- `editor`: element
- `selectCell`: component `Checkbox`
- `selectAllCell`: component `Checkbox`
- `rangeOverlay`: element
- `emptyState`: component `Text`
- `statusBar`: component `Text`; forwards `statusBarSize` → `overrides.fontSize`

## Style bindings

- `surface`: token `color.background`; part `container`; locked
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
- `selectColumnWidth`: token `size.target.min`; part `selectCell`; locked
- `columnWidth`: token `space.20`; computed `calc(var(--space-20) * 2)`
- `cellFocusRing`: token `color.border.focus`; part `cell`; locked
- `cellFocusRingWidth`: token `border.width.focus`; part `cell`; locked
- `cellEditingBackground`: token `color.control.background`; part `cell`; locked
- `cellEditingBorder`: token `color.border.focus`; part `cell`; locked
- `cellInvalidBorder`: token `color.border.danger`; part `cell`; locked
- `cellInvalidBackground`: token `color.status.danger.background`; part `cell`; locked
- `cellInvalidForeground`: token `color.status.danger.foreground`; part `cell`; locked
- `rangeBackground`: token `color.background.strong`; part `rangeOverlay`; locked
- `rangeBorder`: token `color.control.selectedBackground`; part `rangeOverlay`; locked
- `rangeBorderWidth`: token `border.width.focus`; part `rangeOverlay`; locked
- `pinnedShadow`: token `shadow.raised`; part `cell`
- `resizeHandle`: token `color.border.strong`; part `resizeHandle`
- `resizeHandleWidth`: token `space.1`; part `resizeHandle`
- `statusBarSurface`: token `color.background.subtle`; part `statusBar`; locked
- `statusBarColor`: token `color.foreground.muted`; part `statusBar`; locked
- `statusBarSize`: token `font.size.xs`; part `statusBar`
- `statusBarPadding`: token `space.2`; part `statusBar`
- `statusBarGap`: token `space.2`; part `statusBar`
- `captionSize`: token `font.size.md`; part `caption`
- `captionWeight`: token `font.weight.semibold`; part `caption`
- `captionGap`: token `space.2`; part `caption`
- `numericFont`: token `font.family.mono`; part `cell`
- `focusRing`: token `color.border.focus`; part `scrollRegion`; locked
- `focusRingWidth`: token `border.width.focus`; part `scrollRegion`; locked

## Keyboard

- `Control+c` (Copies the selection as tab-separated text; the header line is written when the range spans every loaded row, which is what "whole columns" means for a partly loaded set. Bound by key code KeyC, Control or Meta. copy.copied is announced once the clipboard write resolves; a refused or unavailable clipboard announces nothing.): expect manual

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
- example `range-selection`, story `RangeSelection`: given `caption: "Daily figures"`, `selectable: "range"`, `height: "fixed"`, `columns: [{"key":"day","header":"Day","isRowHeader":true},{"key":"visits","header":"Visits","align":"end"},{"key":"signups","header":"Signups","align":"end"}]`, `data: [{"id":"a","day":"Monday","visits":1200,"signups":30},{"id":"b","day":"Tuesday","visits":1450,"signups":41}]`; Spreadsheet-style rectangles that can be copied as tab-separated text, in a grid the caller sizes.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `headerWeight`, `headerSize`, `headerBorder`, `headerBorderWidth`, `headerShadow`, `gridLine`, `gridLineWidth`, `rowHover`, `cellPaddingInline`, `columnWidth`, `pinnedShadow`, `resizeHandle`, `resizeHandleWidth`, `resizeStep`, `statusBarSize`, `statusBarPadding`, `statusBarGap`, `captionSize`, `captionWeight`, `captionGap`, `fixedHeight`, `fontFamily`, `fontSize`, `lineHeight`, `numericFont`, `transition`
Locked (accessibility-bearing, never overridable): `surface`, `headerSurface`, `headerColor`, `rowHeight`, `rowHeightComfortable`, `rowSelected`, `rowSelectedBorder`, `rowSelectedBorderWidth`, `cellColor`, `cellMutedColor`, `selectColumnWidth`, `cellFocusRing`, `cellFocusRingWidth`, `cellEditingBackground`, `cellEditingBorder`, `cellInvalidBorder`, `cellInvalidBackground`, `cellInvalidForeground`, `rangeBackground`, `rangeBorder`, `rangeBorderWidth`, `statusBarSurface`, `statusBarColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (19)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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
- name: enter-on-a-sortable-header-sorts
  description: The grid enters on the first header cell; on a header cell Enter sorts
    (if sortable).
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
- name: renders-caption-level-2
  given:
    captionLevel: '2'
  then:
  - renders: true
  derived: true
- name: renders-caption-level-3
  given:
    captionLevel: '3'
  then:
  - renders: true
  derived: true
- name: renders-caption-level-4
  given:
    captionLevel: '4'
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

## Platform notes (lit)

```yaml
tag: ds-data-grid
reflect:
- selectable
- editable
- density
- height
- loading
- hide-caption
- caption-level
- prop: showStatusBar
  attribute: no-status-bar
- prop: stickyHeader
  attribute: no-sticky-header
notes: "`columns` and `data` as properties; `showStatusBar` and `stickyHeader` default\
  \ true, so their attributes are the negated `no-status-bar` / `no-sticky-header`.\
  \ `caption`, `row-count` (Number) and `empty-message` are plain attributes that\
  \ are not reflected; `sort`, `defaultSort`, `selected` and `overrides` are properties\
  \ only (`attribute: false`), as `columns` and `data`. Plural copy (copy.copied,\
  \ copy.rowCount) selects its form with `new Intl.PluralRules` at the runtime default\
  \ locale \u2014 `document.documentElement.lang` when the page sets one. the grid\
  \ renders in the shadow root with `repeat` keyed by row id over the visible window.\
  \ aria-activedescendant works inside one shadow root. Editors are the ds-* form\
  \ elements composed in the cell. Composed events as listed. ElementInternals role=\"\
  grid\" is NOT used on the host; the inner container carries the role so ids for\
  \ activedescendant resolve within the same root."
```

## Guidance

## Overview

A data grid is for working in data, not reading it: hundreds or thousands of rows, arrow keys from cell to cell, type to edit, select a block and copy it. It shares Table's column and data model so a screen can start as a Table and become a DataGrid when the job changes, but it is a different role with a different keyboard contract, and the two are never one component with a switch.

## When to use

Use a DataGrid when people navigate cell by cell, edit values in place, select ranges, or scroll through more rows than fit in memory as DOM: price lists, inventory counts, timesheets, admin views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and mark the columns that may change; give every editable column a `validate`. Use `height: viewport` (the default) so the grid, not the page, scrolls.

## When not to use

Do not use a DataGrid for content people read and act on by row — orders, members, invoices — where Table's ordinary Tab order, stacked responsive mode and row links serve better. Do not use it on phone-first screens (its keyboard model has no touch equivalent; Table with `responsive: stack` does). Do not use it for a handful of editable fields (a Form). Do not put links, buttons and editors in the same cell.

## Behavior

The grid is one tab stop; arrow keys move a focus rectangle between cells, Page keys move by a screen of rows, Home/End by row or (with Ctrl) by grid. Enter on a sortable header sorts, and the sorted column shows its direction as a `chevron-up`/`chevron-down` Icon in the sort Button's trailing slot (no glyph on the columns that are not sorted); activating a header cycles ascending ↔ descending only and never clears the sort. Enter or F2 on an editable cell opens its editor (typing a printable character opens a text or number editor with that character as its `defaultValue`, replacing the value; for select, date and checkbox editors typing only opens; the space character never opens an editor); Enter commits and moves down, Tab commits and moves to the next editable cell in the row, F2 commits in place, Escape cancels. Text, number and date editors commit on Enter, Tab, F2 or blur; select and checkbox editors commit on change (they are discrete pickers). The number editor commits NumberInput's number, or undefined when emptied. A select editor opens its popup at once, and closing the popup without a choice cancels the edit. While a select or date popup is open, Enter belongs to that control (choosing an option, picking a day); a date editor commits on Enter only from its text field. Space is never an edit trigger: in `none` and `cell` mode it does nothing. Editors are the composed Input/NumberInput/Select/DatePicker/Checkbox with `hideLabel`, `size: sm` and inset-zero overrides; they are never told about validity — the cell shows cellInvalid* while the editor stays open, the message goes to the status bar, and `copy.editing` is announced through the status bar live region when an editor opens (nothing is wired to the editor's own describedby). Invalid edits stay open with the message shown in the status bar and announced. `selectable: row` toggles rows with Space and the checkbox column; `range` extends with Shift+arrows or drag and copies as TSV with Ctrl+C. Focus and selection are independent. Rows render only in the visible window plus overscan; `rowCount` with `onRangeNeeded` lets the caller page in from a server while the scrollbar reflects the whole set. Pinned columns stay put during horizontal scroll and cast a shadow once the body has moved. Range selection by pointer: pointerdown on a body cell sets the anchor, pointermove with capture extends the rectangle, Shift+click extends from the existing anchor; the overlay is clipped to the rendered window when an endpoint has scrolled out of it. `cell` mode has no selection keys: the focused cell is the selection. Select-all and column selection cover the loaded rows only. `copy.scrollHint` shows in the status bar while the columns overflow sideways and the region has not yet been scrolled sideways. `copy.position` is the status bar's text for the active cell and is not announced — aria-rowindex/aria-colindex already carry position, and a polite region on every arrow press would be noise.

## Content guidelines

Headers are short and unit-bearing ("Qty", "Price (USD)"); use `abbr` for the spoken form. Numbers align end with a fixed number of decimals per column. Editable columns should look editable only on focus (the editor appears in place) — no permanent input chrome in every cell. Keep the status bar: it is where counts, copy confirmations and validation messages live for sighted users, matching what the live region says.

## Accessibility

The grid follows the APG grid pattern: `role="grid"` with `rowgroup`, `row`, `columnheader`, `rowheader` and `gridcell` roles stated explicitly, `aria-rowcount`/`aria-colcount` and per-row/cell indexes so virtualization does not hide the shape (WCAG 1.3.1, 4.1.2). It is one tab stop with full arrow-key navigation (2.1.1, 2.4.3) using `aria-activedescendant` so focus is stable while rows recycle; interactive cell content and editors take real focus while active and hand it back. Sort, selection counts, copy and editing state are announced and shown in the status bar (4.1.3). Validation errors are text, associated with the cell, and never color alone (3.3.1, 1.4.1). The focus ring is inset so it is visible at the grid edges (2.4.7, 2.4.11). Rows meet the minimum target height (2.5.8). Escape always leaves an editor without saving and clears a range selection (2.1.2); the grid has no overlay to dismiss, so those two are what `escape-dismiss` means here.

## Platform notes

### Web
Render `<div data-ds="DataGrid">` with the caption (`Heading level={captionLevel}` or visually hidden text with an id), then the scroll region `<div data-part="scrollRegion">` holding `<div role="grid" aria-labelledby aria-rowcount aria-colcount aria-multiselectable aria-readonly={!editable} aria-busy tabindex="0" aria-activedescendant>` containing a sticky header `<div role="rowgroup"><div role="row" aria-rowindex="1">` of `<div role="columnheader" aria-colindex aria-sort id>` (with the sort `Button` and the resize `<div role="separator">` when applicable), and the body `<div role="rowgroup">` positioned inside a spacer sized to `rowCount × rowHeight`, rendering the visible rows as `<div role="row" aria-rowindex aria-selected style="transform: translateY(...)">` of `<div role="gridcell"|"rowheader" aria-colindex id tabindex="-1">`. Keydown on the grid implements the table, updating the active cell id and scrolling it into view. For a cell with a control or an open editor, move real focus in and set `aria-activedescendant` to the cell; on Escape/commit, focus the grid again. Editors: `Input`/`NumberInput`/`Select`/`DatePicker`/`Checkbox` with `hideLabel`-style visually hidden labels, `size="sm"`, and `overrides` that zero the inset. Range overlay: one absolutely positioned `<div aria-hidden>` from the anchor and focus cells. Status bar: a `<div>` whose inner `<span role="status">` is the live region, with the counts, scroll hint and position beside it. Pinned columns use `position: sticky` within each row. `ResizeObserver` recomputes the visible window.

### Lit
`<ds-data-grid caption="Price list" .columns=${columns} .data=${rows} editable selectable="range" height="viewport"></ds-data-grid>`; the grid is in the shadow root; `repeat` over the window; composed events; editors are `ds-input`, `ds-number-input`, `ds-select`, `ds-date-picker`, `ds-checkbox`.

### React Native
`FlatList` with `getItemLayout` from `rowHeight`, inside a horizontal `ScrollView` shared with the header row; pinned columns are not sticky here — native has no `position: sticky` and a second synced list would need a gesture dependency the package does not take — so they scroll with the rest and only cast `pinnedShadow`, as Table's row-header column does. Cells are `Pressable`s with `accessibilityLabel` "{column}: {value}"; editable cells open the system control inline (text, number, checkbox) or in a `BottomSheet` (select, date). `selectable: range` degrades to `row`. `onEndReached` drives `onRangeNeeded`.

## Related

Table, Input, NumberInput, Select, DatePicker, Checkbox, Toolbar.
