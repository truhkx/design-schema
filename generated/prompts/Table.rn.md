# Generate: Table for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Table.tsx` exporting a typed React Native function component named `Table`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `TableProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger and at least three focusable children, for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Table> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Table.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

## Component schema

```yaml
component:
  name: Table
  category: data
  status: review
  apg: table
  anatomy:
  - container
  - scrollRegion
  - table
  - caption
  - header
  - headerRow
  - columnHeader
  - sortButton
  - body
  - row
  - rowHeader
  - cell
  - selectCell
  - selectAllCell
  - stackedLabel
  - emptyState
  - footer
  composition:
    caption: Heading
    sortButton: Button
    selectCell: Checkbox
    selectAllCell: Checkbox
    emptyState: Text
  props:
    caption:
      type: string
      required: true
      description: What the table lists ("Open invoices"). Rendered as the caption
        and the accessible name; visually hidden with `hideCaption` when a Heading
        directly above already says it.
      a11y: The <caption> (web) / aria-label on the container; never omitted.
    captionLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      default: '2'
      description: Heading level of the caption in the page outline; its size is captionSize
        regardless.
    footer:
      type: content
      description: 'Content below the table: a row count, pagination, a total. Rendered
        in the `footer` part with the table''s font.'
    hideCaption:
      type: boolean
      default: false
      description: Visually hide the caption; it remains the accessible name.
    columns:
      type: array
      required: true
      shape: '{ key: string; header: string; abbr?: string; align?: "start" | "end"
        | "center"; sortable?: boolean; width?: "auto" | "min" | "fill"; isRowHeader?:
        boolean; hideBelow?: "prose" | "content"; render?: (row: Row) => ReactNode
        }[]'
      description: 'Column definitions in display order. `header` is the visible heading;
        `align: end` for numbers; `sortable` adds the sort button; exactly one column
        may be `isRowHeader` (its cells become row headers, and it is the row''s name
        when stacked); `hideBelow` drops a column below a layout width; `render` formats
        the cell (a Text, Link, Meter, or Button — never raw HTML).'
    data:
      type: array
      required: true
      shape: 'Row[] where Row = { id: string; [key: string]: unknown }'
      description: The rows. `id` must be stable; it is what selection and keys use.
    sort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Controlled sort state. The table shows it; the caller sorts the
        data (so server-side sorting works the same way).
      controls:
        event: onSortChange
        default: defaultSort
    defaultSort:
      type: object
      shape: '{ column: string; direction: "ascending" | "descending" }'
      description: Initial sort for uncontrolled use; the table then sorts `data`
        itself by the column value (localeCompare for strings, numeric otherwise).
    selectable:
      type: enum
      values:
      - none
      - single
      - multiple
      default: none
      description: Adds a first column of Checkboxes (radio-like behavior for `single`)
        and a select-all in the header for `multiple`. Selection is row identity,
        not a visual state alone.
    selected:
      type: array
      shape: string[]
      description: Controlled selected row ids.
      controls:
        event: onSelectionChange
        default: defaultSelected
    defaultSelected:
      type: array
      shape: string[]
      description: Initially selected ids.
    responsive:
      type: enum
      values:
      - stack
      - scroll
      default: stack
      description: 'Below `layout.maxWidth.prose`: `stack` turns each row into a block
        with the column header repeated as a label before each value (content tables
        — orders, people); `scroll` keeps the columns and scrolls horizontally inside
        a labelled region with the row-header column sticky (data tables where columns
        are the point). Roles are explicit on every element so both keep table semantics.'
    stickyHeader:
      type: boolean
      default: true
      description: The header row stays visible while the body scrolls (the page,
        or `maxHeight`).
    maxHeight:
      type: enum
      values:
      - none
      - viewport
      default: none
      description: '`viewport` caps the table at the viewport height minus the section
        rhythm and scrolls the body; `none` lets the page scroll.'
    density:
      type: enum
      values:
      - compact
      - comfortable
      default: comfortable
      description: 'Cell padding: layout.inset.sm or layout.inset.md.'
    striped:
      type: boolean
      default: false
      description: Alternate row backgrounds. Useful past about eight columns; borders
        are the default row separator.
    emptyMessage:
      type: string
      description: Shown in place of the body when `data` is empty. Defaults to `copy.empty`.
    loading:
      type: boolean
      default: false
      description: 'Data is being fetched: the body shows `copy.loading` and aria-busy
        is set. Existing rows stay visible while re-sorting.'
    rowActions:
      type: function
      shape: '(row: Row) => ReactNode'
      description: 'Renders a trailing actions cell: Buttons (ghost, sm, iconOnly
        with Tooltip) or a Menu. Kept out of `columns` so the header can be a visually-hidden
        "Actions".'
  events:
    onSortChange:
      description: Fired when a sortable header is activated, with `{ column, direction
        }` (cycling ascending → descending on the same column, ascending on a new
        one).
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
      description: Fired with the new array of selected ids.
      platforms:
        web: onSelectionChange
        lit: selection-change
        rn: onSelectionChange
        swiftui: onSelectionChange
      payload:
      - name: selected
        type: array
        shape: string[]
        description: The ids of every selected row.
      fires:
      - user
    onRowPress:
      description: Fired when a row is activated, with its id. Only when the row has
        no other interactive content; the row header cell becomes a Button and the
        row is styled interactive. Prefer a Link in the row header for navigation.
      platforms:
        web: onRowPress
        lit: row-press
        rn: onRowPress
        swiftui: onRowPress
      payload:
      - name: id
        type: string
        description: The id of the activated row.
      fires:
      - user
  keyboard:
  - keys:
    - Tab
    action: 'Moves through interactive content in reading order: select-all, then
      per row the checkbox, links, buttons and the actions cell. Cells themselves
      are not focusable — this is a table, not a grid.'
    from: any
    expect: focus-next
  - keys:
    - Enter
    - ' '
    action: On a sort button, sorts; on a row checkbox, toggles; on a row header button,
      activates the row.
    from: inside
    expect: manual
    native: true
  - keys:
    - ArrowRight
    - ArrowLeft
    action: 'In `responsive: scroll` below the breakpoint, the scroll region is focusable
      and arrows scroll it horizontally.'
    when: scroll region focused
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
      description: Shown under the sticky header only once the body has scrolled beneath
        it.
      locked: false
    rowBorder:
      token: color.border
      part: row
      locked: false
    rowBorderWidth:
      token: border.width.thin
      part: row
      locked: false
    rowStripe:
      token: color.background.subtle
      part: row
      locked: true
    rowHover:
      token: color.action.ghost.backgroundHover
      part: row
      state: hover
      description: Interactive rows only (onRowPress or a Link in the row header).
        Hover never appears on plain rows.
      locked: false
    rowSelected:
      token: color.background.subtle
      part: row
      description: Same tint as a stripe; the start-edge bar and the checkbox are
        what say selected.
      locked: true
    rowSelectedBorder:
      token: color.control.selectedBackground
      part: row
      description: A start-edge bar on selected rows, so selection is not color-fill
        alone.
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
      description: Secondary values (a date beside a title) rendered with Text tone
        muted.
      locked: true
    cellPaddingInline:
      token: layout.inset.md
      part: cell
      locked: false
    cellPaddingInlineCompact:
      token: layout.inset.sm
      part: cell
      description: Used instead of cellPaddingInline when density is compact.
      locked: false
    cellPaddingBlock:
      token: space.sm
      part: cell
      locked: false
    cellGap:
      token: layout.gap.tight
      part: cell
      description: Between a sort button's label and its arrow, and between actions
        in the actions cell.
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
      description: Between caption and header.
      locked: false
    stackedRowInset:
      token: layout.inset.md
      locked: false
    stackedRowGap:
      token: layout.gap.tight
      description: Between label/value pairs inside a stacked row.
      locked: false
    stackedLabelColor:
      token: color.foreground.muted
      part: stackedLabel
      locked: true
    stackedLabelSize:
      token: font.size.xs
      part: stackedLabel
      locked: false
    stackedLabelWeight:
      token: font.weight.medium
      part: stackedLabel
      locked: false
    stackedRowRadius:
      token: radius.md
      locked: false
    stickyColumnShadow:
      token: shadow.raised
      description: '`responsive: scroll`: the sticky row-header column casts this
        once scrolled.'
      locked: false
    scrollFade:
      token: space.6
      description: Edge fade width on the scroll region.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.sm
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    numericFont:
      token: font.family.mono
      description: Columns with align end use tabular figures; where the body font
        lacks them, the mono family.
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
      description: Hover and sort-arrow changes; sorting itself is instant.
      locked: false
  copy:
    sortToolbarLabel: Sort {caption}
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
    selectedCount:
      text: '{count} of {total} selected'
      params:
        count:
          type: number
          description: How many rows are selected.
        total:
          type: number
          description: How many rows the table has.
    cellLabel:
      text: '{column}: {value}'
      params:
        column:
          type: string
          description: The column header text.
        value:
          type: string
          description: The cell's text.
    actions: Actions
    empty: Nothing to show.
    loading: Loading
    scrollHint: Scroll sideways to see more columns
    rowCount:
      plural:
        by: count
        one: '{count} row'
        other: '{count} rows'
      params:
        count:
          type: number
          description: How many rows the table has.
  a11y:
    role: table
    requires:
    - accessible-name
    - keyboard-operable
    - arrow-navigation
    - focus-visible
    - contrast-aa
    - target-24px
    - selected-state
    - live-region
    - no-hover-only
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
    - foreground: color.link
      background: color.background.subtle
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background.subtle
      level: AA
      nonText: true
  platforms:
    web:
      element: table
      attributes:
      - role=table
      - role=rowgroup
      - role=row
      - role=columnheader
      - role=rowheader
      - role=cell
      - aria-sort
      - aria-selected
      - aria-busy
      - aria-rowcount
      - aria-colcount
      - aria-describedby
      - scope
      - abbr
      - tabindex
      notes: 'Native <table><caption><thead><tbody> with EVERY role stated explicitly
        (role="table" on the table, "rowgroup" on thead/tbody, "row" on tr, "columnheader"/"rowheader"/"cell"
        on th/td) — browsers drop the implicit table roles as soon as CSS changes
        display on any of these elements, which the stacked layout and sticky positioning
        do. Column headers: <th scope="col" abbr>; the row-header column: <th scope="row">.
        Sort: a Button (ghost, sm) inside the columnheader with aria-sort on the th
        and a visually-hidden live region announcing copy.sortedAnnouncement. Selection:
        Checkbox in the first cell, aria-selected on the tr, live region for copy.selectedCount.
        `responsive: stack` below the prose breakpoint: a container query switches
        tr/td to display block/grid, thead is visually hidden (not display none, so
        the columnheaders remain in the tree), and each td gets a ::before from a
        data-label attribute holding the header text — aria-hidden as text is already
        associated by the roles. `responsive: scroll`: the table sits in a <div role="region"
        aria-labelledby={captionId} tabindex="0"> with overflow-x auto, faded edges,
        and the row-header column position: sticky. Sticky header: thead th position:
        sticky top 0 with the shadow toggled by an IntersectionObserver sentinel.
        rowActions cell has a visually-hidden columnheader "Actions". Rows are keyed
        by id; no virtualization in this component (that is DataGrid).'
    lit:
      tag: ds-table
      reflect:
      - selectable
      - responsive
      - prop: stickyHeader
        attribute: no-sticky-header
      - max-height
      - density
      - striped
      - loading
      - hide-caption
      notes: '`columns` and `data` are properties; the whole <table> renders inside
        the shadow root from them (slotting <tr> elements across the shadow boundary
        breaks table semantics, so rows are never light DOM). Cell `render` functions
        return lit templates. Composed `sort-change`, `selection-change`, `row-press`.
        Container queries on :host.'
    rn:
      element: FlatList
      props:
      - accessibilityRole=list
      - accessibilityLabel
      - stickyHeaderIndices
      notes: 'No table element on native. Phones: always the stacked form — a FlatList
        (accessibilityRole="list", accessibilityLabel from caption) whose rows are
        accessible Views with an accessibilityLabel that reads "{header}: {value}"
        for each visible column, the row header first, plus "selected" state; selection
        Checkbox and rowActions inside. Tablets and react-native-web: a header row
        View (accessibilityRole="header" cells) and rows as horizontal Views with
        fixed column widths, `responsive: scroll` in a horizontal ScrollView with
        the row-header column rendered in a separate vertically-synced list. Sort
        buttons are system Buttons; announcements via AccessibilityInfo.announceForAccessibility.'
    swiftui:
      element: Grid
      props:
      - Grid
      - GridRow
      - ScrollView
      - .accessibilityElement=contain
      - .accessibilityLabel
      - .accessibilityAddTraits=isHeader
      - Button
      - Checkbox
      - ViewThatFits
      notes: 'A `Grid` of `GridRow`s inside a horizontal `ScrollView` when columns
        overflow (`responsive: scroll`) or a `VStack` of stacked cards (`responsive:
        stack`) chosen through `ViewThatFits` against the prose width; not `List`
        and not `Table` (macOS-only). The caption `Heading` names the `.contain` element;
        each row is `.accessibilityElement(children: .contain)` with the row-header
        cell''s text as its label so VoiceOver reads a row as one unit and then its
        cells; header cells are `.isHeader` and column names are prefixed to cell
        values in stacked mode (`copy.cellLabel`). Sort `Button`s, selection `Checkbox`es,
        `onRowPress` on the row `Button` — as documented. `maxHeight` scrolls vertically
        inside a `ScrollView` with a visible header `Grid` outside it.'
  behavior:
  - name: activating-a-sortable-header-reports-the-sort
    description: The table shows the sort; the caller sorts the data, so the event
      is the contract.
    given:
      columns:
      - key: invoice
        header: Invoice
        isRowHeader: true
      - key: amount
        header: Amount
        sortable: true
        align: end
      data:
      - id: a
        invoice: INV-1
        amount: 100
      - id: b
        invoice: INV-2
        amount: 200
    when:
      click: sortButton
    then:
    - event: onSortChange
  - name: selecting-a-row-reports-every-selected-id
    given:
      selectable: multiple
      columns:
      - key: invoice
        header: Invoice
        isRowHeader: true
      data:
      - id: a
        invoice: INV-1
      - id: b
        invoice: INV-2
    when:
      click: selectCell
    then:
    - event: onSelectionChange
  - name: select-all-reports-the-whole-selection
    description: multiple adds a select-all in the header; selection is row identity,
      not a visual state.
    given:
      selectable: multiple
      columns:
      - key: invoice
        header: Invoice
        isRowHeader: true
      data:
      - id: a
        invoice: INV-1
      - id: b
        invoice: INV-2
    when:
      click: selectAllCell
    then:
    - event: onSelectionChange
  - name: the-empty-message-shows-when-there-are-no-rows
    given:
      columns:
      - key: invoice
        header: Invoice
        isRowHeader: true
      data: []
    then:
    - copy: empty
  - name: a-custom-empty-message-replaces-the-default
    given:
      emptyMessage: No invoices yet.
      columns:
      - key: invoice
        header: Invoice
        isRowHeader: true
      data: []
    then:
    - text: No invoices yet.
  - name: loading-marks-the-table-busy
    description: While data is being fetched the table is aria-busy and existing rows
      stay visible.
    given:
      loading: true
      columns:
      - key: invoice
        header: Invoice
        isRowHeader: true
      data:
      - id: a
        invoice: INV-1
    then:
    - attribute: aria-busy
      is: 'true'
    platforms:
    - web
  examples:
  - name: open-invoices
    description: The everyday content table, its caption naming what it lists.
    given:
      caption: Open invoices
      columns:
      - key: invoice
        header: Invoice
        isRowHeader: true
      - key: due
        header: Due
      - key: amount
        header: Amount
        align: end
        sortable: true
      data:
      - id: a
        invoice: INV-1
        due: 12 Sep
        amount: 100
      - id: b
        invoice: INV-2
        due: 19 Sep
        amount: 200
  - name: selectable-rows
    description: A table whose rows can be picked in bulk, with a select-all in the
      header.
    given:
      caption: Members
      selectable: multiple
      defaultSelected:
      - a
      columns:
      - key: person
        header: Person
        isRowHeader: true
      - key: role
        header: Role
      data:
      - id: a
        person: Ana Souza
        role: Admin
      - id: b
        person: Bo Lin
        role: Editor
  - name: dense-data-table-that-scrolls
    description: A wide data table that keeps its columns on narrow screens and scrolls
      sideways instead of stacking.
    given:
      caption: Daily traffic
      responsive: scroll
      density: compact
      maxHeight: viewport
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
  - name: nothing-to-show
    description: An empty table that says so in its own words rather than showing
      an empty body.
    given:
      caption: Open invoices
      emptyMessage: No invoices yet.
      columns:
      - key: invoice
        header: Invoice
        isRowHeader: true
      data: []
```

## Events

- `onSortChange`: emit `onSortChange`
  - payload, positional, in this order: `column: string`, `direction: 'ascending' | 'descending'`
  - fires on: user
- `onSelectionChange`: emit `onSelectionChange`
  - payload, positional, in this order: `selected: string[]`
  - fires on: user
- `onRowPress`: emit `onRowPress`
  - payload, positional, in this order: `id: string`
  - fires on: user

## Controlled state

- `sort` is controlled when given, uncontrolled from `defaultSort` when omitted; changes reported by `onSortChange` (emit `onSortChange`)
- `selected` is controlled when given, uncontrolled from `defaultSelected` when omitted; changes reported by `onSelectionChange` (emit `onSelectionChange`)

## Style bindings

- `headerSurface`: token `color.background.subtle`; part `header`; locked
- `headerColor`: token `color.foreground`; part `header`; locked
- `headerWeight`: token `font.weight.semibold`; part `header`
- `headerSize`: token `font.size.sm`; part `header`
- `headerBorder`: token `color.border.strong`; part `header`
- `headerBorderWidth`: token `border.width.thin`; part `header`
- `headerShadow`: token `shadow.raised`; part `header`
- `rowBorder`: token `color.border`; part `row`
- `rowBorderWidth`: token `border.width.thin`; part `row`
- `rowStripe`: token `color.background.subtle`; part `row`; locked
- `rowHover`: token `color.action.ghost.backgroundHover`; part `row`; state `hover`
- `rowSelected`: token `color.background.subtle`; part `row`; locked
- `rowSelectedBorder`: token `color.control.selectedBackground`; part `row`; locked
- `rowSelectedBorderWidth`: token `border.width.focus`; part `row`; locked
- `cellColor`: token `color.foreground`; part `cell`; locked
- `cellMutedColor`: token `color.foreground.muted`; part `cell`; locked
- `cellPaddingInline`: token `layout.inset.md`; part `cell`
- `cellPaddingInlineCompact`: token `layout.inset.sm`; part `cell`
- `cellPaddingBlock`: token `space.sm`; part `cell`
- `cellGap`: token `layout.gap.tight`; part `cell`
- `captionSize`: token `font.size.md`; part `caption`
- `captionWeight`: token `font.weight.semibold`; part `caption`
- `captionGap`: token `space.2`; part `caption`
- `stackedLabelColor`: token `color.foreground.muted`; part `stackedLabel`; locked
- `stackedLabelSize`: token `font.size.xs`; part `stackedLabel`
- `stackedLabelWeight`: token `font.weight.medium`; part `stackedLabel`

## Keyboard

- `Enter`, ` ` (On a sort button, sorts; on a row checkbox, toggles; on a row header button, activates the row.): expect manual; native: the rendered element already does this

## Copy

- `sortToolbarLabel`: "Sort {caption}"
- `sortAscending`: "Sort by {column}, ascending"; params `column` (string)
- `sortDescending`: "Sort by {column}, descending"; params `column` (string)
- `sortedAnnouncement`: "Sorted by {column}, {direction}"; params `column` (string), `direction` (string)
- `selectAll`: "Select all rows"
- `selectRow`: "Select {rowName}"; params `rowName` (string)
- `selectedCount`: "{count} of {total} selected"; params `count` (number), `total` (number)
- `cellLabel`: "{column}: {value}"; params `column` (string), `value` (string)
- `actions`: "Actions"
- `empty`: "Nothing to show."
- `loading`: "Loading"
- `scrollHint`: "Scroll sideways to see more columns"
- `rowCount`: "{count} rows"; params `count` (number); plural by `count`: one "{count} row", other "{count} rows"

## Constants and examples

- example `open-invoices`, story `OpenInvoices`: given `caption: "Open invoices"`, `columns: [{"key":"invoice","header":"Invoice","isRowHeader":true},{"key":"due","header":"Due"},{"key":"amount","header":"Amount","align":"end","sortable":true}]`, `data: [{"id":"a","invoice":"INV-1","due":"12 Sep","amount":100},{"id":"b","invoice":"INV-2","due":"19 Sep","amount":200}]`; The everyday content table, its caption naming what it lists.
- example `selectable-rows`, story `SelectableRows`: given `caption: "Members"`, `selectable: "multiple"`, `defaultSelected: ["a"]`, `columns: [{"key":"person","header":"Person","isRowHeader":true},{"key":"role","header":"Role"}]`, `data: [{"id":"a","person":"Ana Souza","role":"Admin"},{"id":"b","person":"Bo Lin","role":"Editor"}]`; A table whose rows can be picked in bulk, with a select-all in the header.
- example `dense-data-table-that-scrolls`, story `DenseDataTableThatScrolls`: given `caption: "Daily traffic"`, `responsive: "scroll"`, `density: "compact"`, `maxHeight: "viewport"`, `columns: [{"key":"day","header":"Day","isRowHeader":true},{"key":"visits","header":"Visits","align":"end"},{"key":"signups","header":"Signups","align":"end"}]`, `data: [{"id":"a","day":"Monday","visits":1200,"signups":30},{"id":"b","day":"Tuesday","visits":1450,"signups":41}]`; A wide data table that keeps its columns on narrow screens and scrolls sideways instead of stacking.
- example `nothing-to-show`, story `NothingToShow`: given `caption: "Open invoices"`, `emptyMessage: "No invoices yet."`, `columns: [{"key":"invoice","header":"Invoice","isRowHeader":true}]`, `data: []`; An empty table that says so in its own words rather than showing an empty body.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `headerWeight`, `headerSize`, `headerBorder`, `headerBorderWidth`, `headerShadow`, `rowBorder`, `rowBorderWidth`, `rowHover`, `cellPaddingInline`, `cellPaddingInlineCompact`, `cellPaddingBlock`, `cellGap`, `captionSize`, `captionWeight`, `captionGap`, `stackedRowInset`, `stackedRowGap`, `stackedLabelSize`, `stackedLabelWeight`, `stackedRowRadius`, `stickyColumnShadow`, `scrollFade`, `fontFamily`, `fontSize`, `lineHeight`, `numericFont`, `transition`
Locked (accessibility-bearing, never overridable): `surface`, `headerSurface`, `headerColor`, `rowStripe`, `rowSelected`, `rowSelectedBorder`, `rowSelectedBorderWidth`, `cellColor`, `cellMutedColor`, `stackedLabelColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (19)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: activating-a-sortable-header-reports-the-sort
  description: The table shows the sort; the caller sorts the data, so the event is
    the contract.
  given:
    columns:
    - key: invoice
      header: Invoice
      isRowHeader: true
    - key: amount
      header: Amount
      sortable: true
      align: end
    data:
    - id: a
      invoice: INV-1
      amount: 100
    - id: b
      invoice: INV-2
      amount: 200
  when:
    click: sortButton
  then:
  - event: onSortChange
- name: selecting-a-row-reports-every-selected-id
  given:
    selectable: multiple
    columns:
    - key: invoice
      header: Invoice
      isRowHeader: true
    data:
    - id: a
      invoice: INV-1
    - id: b
      invoice: INV-2
  when:
    click: selectCell
  then:
  - event: onSelectionChange
- name: select-all-reports-the-whole-selection
  description: multiple adds a select-all in the header; selection is row identity,
    not a visual state.
  given:
    selectable: multiple
    columns:
    - key: invoice
      header: Invoice
      isRowHeader: true
    data:
    - id: a
      invoice: INV-1
    - id: b
      invoice: INV-2
  when:
    click: selectAllCell
  then:
  - event: onSelectionChange
- name: the-empty-message-shows-when-there-are-no-rows
  given:
    columns:
    - key: invoice
      header: Invoice
      isRowHeader: true
    data: []
  then:
  - copy: empty
- name: a-custom-empty-message-replaces-the-default
  given:
    emptyMessage: No invoices yet.
    columns:
    - key: invoice
      header: Invoice
      isRowHeader: true
    data: []
  then:
  - text: No invoices yet.
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
- name: renders-selectable-single
  given:
    selectable: single
  then:
  - renders: true
  derived: true
- name: renders-selectable-multiple
  given:
    selectable: multiple
  then:
  - renders: true
  derived: true
- name: renders-responsive-stack
  given:
    responsive: stack
  then:
  - renders: true
  derived: true
- name: renders-responsive-scroll
  given:
    responsive: scroll
  then:
  - renders: true
  derived: true
- name: renders-max-height-none
  given:
    maxHeight: none
  then:
  - renders: true
  derived: true
- name: renders-max-height-viewport
  given:
    maxHeight: viewport
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
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (rn)

```yaml
element: FlatList
props:
- accessibilityRole=list
- accessibilityLabel
- stickyHeaderIndices
notes: "No table element on native. Phones: always the stacked form \u2014 a FlatList\
  \ (accessibilityRole=\"list\", accessibilityLabel from caption) whose rows are accessible\
  \ Views with an accessibilityLabel that reads \"{header}: {value}\" for each visible\
  \ column, the row header first, plus \"selected\" state; selection Checkbox and\
  \ rowActions inside. Tablets and react-native-web: a header row View (accessibilityRole=\"\
  header\" cells) and rows as horizontal Views with fixed column widths, `responsive:\
  \ scroll` in a horizontal ScrollView with the row-header column rendered in a separate\
  \ vertically-synced list. Sort buttons are system Buttons; announcements via AccessibilityInfo.announceForAccessibility."
```

## Guidance

## Overview

A table is the honest way to show records that share fields: every row the same shape, every column a comparable thing. This component keeps that honesty on a phone — where most tables quietly turn into unreadable text — by choosing, per table, whether rows stack into labelled blocks or columns scroll, and by stating every role explicitly so neither layout costs a screen-reader user the structure.

## When to use

Use a Table for a list of records with three or more comparable fields: orders, invoices, members, inventory, results. Use `stack` (the default) when each row is a thing a person reads — a person, an order — and `scroll` when the columns are what matters — figures across months, a comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions exist (put them in a Toolbar above the table that appears with the selection count). Put the row's identity in the `isRowHeader` column, usually as a Link to its detail page.

## When not to use

Do not use a Table for layout, for a list with one or two fields (a Stack of Cards or a plain list), or for key–value pairs about one thing (a description list). Do not use it when cells are edited in place or navigated with arrow keys — that is DataGrid, a different role with a different keyboard model. Do not put a Table inside a Card that is narrower than the content width; give it the Container.

## Behavior

The header row shows column names; sortable ones are Buttons whose activation cycles ascending → descending on that column (and starts ascending on another), announced through a live region, and shown by an arrow Icon plus `aria-sort`. With `selectable`, each row has a Checkbox named from its row header, and `multiple` adds select-all (indeterminate when some are selected); the count is announced. Rows are inert unless they contain interactive content or `onRowPress` is set, in which case the row header becomes the row's Button and hover/press styling applies to the row. Below the prose width the table follows `responsive`: stacked rows keep the column header as a small label before each value and hide `hideBelow` columns; scrolling tables keep every column, fade the edges, keep the row-header column sticky, and let the region be focused and scrolled by keyboard. `stickyHeader` keeps the header in view and casts a shadow only once the body has scrolled under it. Empty data shows `emptyMessage` in a single full-width cell; `loading` sets `aria-busy` and shows the loading text without removing existing rows. Sort buttons show the column header as their visible label and carry the sort phrase as `accessibleName`. `onRowPress` applies only when the row-header column has no custom `render` (a rendered Link would conflict); without an `isRowHeader` column it is a development warning and rows are inert. The selection Checkboxes use `hideLabel` with `copy.selectRow`. In `single` selection, pressing the selected row's checkbox again deselects it. `maxHeight: viewport` is the viewport height minus two `layout.gap.section`. Arrow keys in the scroll region scroll by `space.10`; the region is present whenever `responsive: scroll`, not only below the breakpoint. `copy.rowCount` describes the table and `copy.scrollHint` the scroll region (visually hidden, aria-describedby). On native `abbr` has no effect and `width: auto`/`min` both size to `space.20`.

## Content guidelines

Captions name the set, not the component ("Open invoices", not "Invoices table"). Column headers are one or two words, sentence case, with units in the header rather than in every cell ("Amount (USD)"); use `abbr` when a long header has a short spoken form. Numbers align end and share their decimals; dates use one format per column. The row-header column comes first (after the selection column) and holds the thing the row is about. Keep row actions to two visible plus a Menu; keep tables under about ten columns and use `hideBelow` for the least important ones.

## Accessibility

The table is a `table` with explicit `rowgroup`, `row`, `columnheader`, `rowheader` and `cell` roles, a caption as its name, and `scope`/`abbr` on headers (WCAG 1.3.1, 4.1.2) — explicit because CSS that changes display strips the native roles, and both responsive modes change display. Sort state is exposed with `aria-sort` and announced (4.1.3); the sort control is a real Button with a name that says what it does (2.4.6). Row selection is exposed as `aria-selected` plus the checkbox state, and is shown by a start-edge bar as well as a fill (1.4.1). Stacked rows keep their header association through the roles and the repeated visible labels, so a screen-reader user hears "Amount: $40" either way. The scroll region is named by the caption and focusable, so keyboard users can reach columns off-screen (2.1.1, 1.4.10 — content is not lost, only scrolled). Hover styling is confined to interactive rows and never the only signal (`no-hover-only`).

## Platform notes

### Web
Render `<div data-ds="Table" class="ds-table--{responsive} ds-table--{density}">` containing, for `scroll`, `<div role="region" aria-labelledby={captionId} tabindex="0">` with the fade masks; inside, `<table role="table" aria-rowcount aria-colcount aria-busy>` with `<caption id>` (visually hidden when `hideCaption`), `<thead role="rowgroup"><tr role="row">` of `<th role="columnheader" scope="col" abbr aria-sort>` (the selection `th` holds the select-all `Checkbox`; sortable headers hold `Button variant="ghost" size="sm"` with the header text and an `Icon` chevron-up/down when sorted; the actions header text is visually hidden), and `<tbody role="rowgroup">` of `<tr role="row" aria-selected data-part="row">` with `<th role="rowheader" scope="row">` for the row-header column and `<td role="cell" data-label={header}>` otherwise. Container query at the prose width: `stack` sets `tr { display: grid; grid-template-columns: 1fr }` with `thead` visually hidden and `td::before { content: attr(data-label) }` styled from the `stackedLabel*` bindings, each row on `stackedRowRadius` with `stackedRowInset`; `scroll` leaves display alone and sets `position: sticky; inset-inline-start: 0` on the row-header cells. Sticky header: `thead th { position: sticky; inset-block-start: 0 }` with `headerShadow` toggled via a sentinel `IntersectionObserver`. Visually-hidden `aria-live="polite"` region for sort and selection announcements. Uncontrolled sorting compares with `localeCompare` (`numeric: true`) for strings and `-` for numbers. The two breakpoint numbers come from the built token JSON, `literal-ok: breakpoint from layout.maxWidth.*`.

### Lit
`<ds-table caption="Open invoices" .columns=${columns} .data=${rows} selectable="multiple" responsive="scroll"></ds-table>`; the table is built in the shadow root from the properties (never slotted rows); `render` returns lit templates; container queries on `:host`; composed events.

### React Native
Phones: `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={caption}`) rendering each row as a `View accessible` styled as a stacked block (`stackedRowInset`, `stackedRowGap`, `stackedRowRadius`) whose `accessibilityLabel` joins "{header}: {value}" for visible columns with the row header first and the selected state; the selection `Checkbox` and `rowActions` are separate accessible elements inside. Sort controls render as a `Toolbar` of `Button`s above the list (no header row on phones). Tablets / react-native-web: header `View` with `accessibilityRole="header"` cells and rows of fixed-width cells; `responsive: scroll` wraps in a horizontal `ScrollView` with the row-header column in a synced vertical list. Row press uses `Pressable` with `accessibilityRole="button"` when `onRowPress` is set.

## Related

DataGrid, Card, Checkbox, Toolbar, Meter, Text, Link.
