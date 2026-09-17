# Generate: Table for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Table.tsx` exporting a typed React function component named `Table`, plus `Table.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Table({ ref, …rest }: TableProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Table> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Table.test.tsx`.
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
    caption:
      component: Heading
      forwards:
        captionSize: fontSize
        captionWeight: fontWeight
        captionGap: marginBlockEnd
    sortButton:
      component: Button
      props:
        variant: ghost
        size: sm
      forwards:
        headerWeight: fontWeight
        cellGap: iconGap
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
        in the `footer` part with the table''s font: a string footer renders in Text
        (web: inside a `<p>`) with the `fontFamily`/`fontSize`/`lineHeight` bindings;
        other content brings its own typography (React Native has no cascade). Absent
        or `false` renders no footer part at all. Lit takes only slotted content in
        its `footer` slot — the string form has no Lit spelling, so slot a `<ds-text>`.'
    hideCaption:
      type: boolean
      default: false
      description: 'Visually hide the caption; it remains the accessible name. The
        caption part is the composed Heading element itself, with no wrapper, so hiding
        it also sends `space.0` in place of `captionGap`: a hidden caption leaves
        no gap above the header.'
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
        when stacked); `hideBelow` drops a column below a layout width in `responsive:
        stack` only (scrolling tables keep every column); `width: min` shrinks to
        content without wrapping (web: `inline-size: 1%` plus nowrap), `fill` takes
        the remaining width (web: `inline-size: 100%`); `render` formats the cell
        (a Text, Link, Meter, or Button — never raw HTML).'
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
        are the point). Roles are explicit on every element so both keep table semantics.
        "Below" compares the table''s own measured width (a container query on web
        and Lit, onLayout on React Native) with the token; `scroll` keeps the columns
        at every width on every platform, phones included.'
    stickyHeader:
      type: boolean
      default: true
      description: 'The header row stays visible while the body scrolls (the page,
        or `maxHeight`). In `responsive: scroll` the scroll region is the sticky container,
        so the header sticks only with `maxHeight: viewport`; against the page scroll
        it has no effect there. React Native sticks the header only when the list
        scrolls itself — that is, with `maxHeight: viewport` — at every `responsive`
        value, since the page scroll is not the list''s. Stacked, what sticks is the
        whole header row that `responsive: stack` keeps.'
    maxHeight:
      type: enum
      values:
      - none
      - viewport
      default: none
      description: '`viewport` caps the table at the viewport height minus two `layout.gap.section`
        and scrolls a frame around the table (the scroll region itself in `responsive:
        scroll`), which is also the root of the header-shadow observer; `none` lets
        the page scroll. React Native measures the cap against the window height —
        it cannot know what chrome sits above it — and applies it to the list, which
        is the frame inside the horizontal ScrollView.'
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
      description: 'Data is being fetched: aria-busy is set on the table element (web
        and Lit: the `<table role="table">`; React Native: accessibilityState busy
        on the list) and `copy.loading` shows — with no rows, in the emptyState in
        place of `emptyMessage`; with rows, as Text `size: sm`, tone muted, in its
        own polite live region below the table and above the footer — the sort and
        selection announcements keep the visually-hidden region, so the two never
        overwrite each other. Existing rows stay visible while re-sorting.'
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
        row is styled interactive. On web and Lit a pointer click anywhere on the
        row outside a control also fires it; keyboard and assistive technology use
        the Button. Lit cannot see whether anyone listens, so rows are interactive
        only when the host has the `pressable-rows` attribute — a reflected boolean
        property `pressableRows`. Prefer a Link in the row header for navigation.
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
        Hover never appears on plain rows. A `render` function's output cannot be
        inspected, so web and Lit find the link with a `:has()` selector on the row-header
        cell — hover alone, with neither the pointer cursor nor the row press that
        `onRowPress` rows get — and React Native, which has no such selector, tints
        only `onRowPress` rows.
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
      description: 'A start-edge bar on selected rows, so selection is not color-fill
        alone. It never shifts content: web and Lit draw it as an inset box-shadow
        on the row''s first cell (on the row itself when stacked), mirrored under
        RTL; React Native always reserves a start border of `rowSelectedBorderWidth`,
        coloured as the row background on an unselected row in the column layout and
        as `rowBorder` on an unselected stacked block, so the block''s outline stays
        unbroken.'
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
      by: density
      values:
        compact: layout.inset.sm
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
    stackedBlockGap:
      token: layout.gap.tight
      description: 'Between stacked row blocks: the body''s gap (web and Lit: the
        stacked tbody grid; React Native: the list''s contentContainerStyle gap).
        Each block is outlined with `rowBorder`/`rowBorderWidth` on `stackedRowRadius`.'
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
      description: Edge fade width on the scroll region; an edge fades only while
        columns are hidden past it, measured as the scroll offset against `scrollWidth
        − clientWidth` with a 1px tolerance and re-measured on scroll and on size
        changes, with the mask flipped under RTL. The mask covers the scrolling content
        only, never the region's own focus ring, which stays whole at a faded edge.
        React Native draws it with react-native-svg, as Toolbar does.
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
      description: 'Body cells of columns with align end always use this family plus
        tabular figures (`font-variant-numeric: tabular-nums` on web and Lit) — no
        platform can detect whether the body font has tabular figures, so there is
        no fallback test.'
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
      description: The interactive row's hover background only; the sort arrow is
        a swapped Icon inside the Button and changes instantly, as does sorting itself.
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
      element: div
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
      notes: 'The root is the container <div data-ds="Table"> — what a `ref` reaches
        — holding the caption Heading, the scroll region and the table; aria-busy,
        aria-rowcount and aria-colcount sit on the inner <table role="table">. Native
        <table><thead><tbody> with EVERY role stated explicitly (role="table" on the
        table, "rowgroup" on thead/tbody, "row" on tr, "columnheader"/"rowheader"/"cell"
        on th/td) — browsers drop the implicit table roles as soon as CSS changes
        display on any of these elements, which the stacked layout and sticky positioning
        do. The caption is the composed Heading at `captionLevel`, rendered as a sibling
        above the <table> inside the container and referenced by aria-labelledby —
        not inside a <caption> element. With role="table" stated, ARIA lets the table
        own only rows and rowgroups, so a heading inside <caption> is an invalid owned
        child and every instance fails the aria-required-children check; a labelled
        sibling is the same name to a screen reader and costs nothing. `hideCaption`
        visually hides that heading and keeps it as the name. Column headers: <th
        scope="col" abbr>; the row-header column: <th scope="row">. Sort: a Button
        (ghost, sm) inside the columnheader with aria-sort on the th and a visually-hidden
        live region announcing copy.sortedAnnouncement. Selection: Checkbox in the
        first cell, aria-selected on the tr, live region for copy.selectedCount. `responsive:
        stack` below the prose breakpoint: a container query switches tr/td to display
        block/grid, plain column headers are visually hidden (not display none, so
        the columnheaders remain in the tree) while the select-all header and sortable
        headers stay visible as a row that wraps on `stackedRowGap` and keeps the
        header cell styling, so no focusable control is invisible; each td gets a
        ::before from a data-label attribute holding the header text, hidden from
        assistive technology with empty alternative text (`content: attr(data-label)
        / ""`, after a plain `content: attr(data-label)` fallback) as the text is
        already associated by the roles. The row header gets no data-label: it is
        the row''s name. `responsive: scroll`: the table sits in a <div role="region"
        aria-labelledby={captionId} tabindex="0"> with overflow-x auto, faded edges,
        and the row-header column position: sticky. Sticky header: thead th position:
        sticky top 0 with the shadow toggled by an IntersectionObserver sentinel.
        rowActions cell has a visually-hidden columnheader "Actions", and carries
        the same text as its data-label so the stacked layout labels the action row
        like every other cell. With `selectable: single` the header''s selection position
        is an empty <td role="cell"> with no part (an empty columnheader would have
        no name). Button writes its own data-part, so the sortButton part has no hook
        of its own; it is the Button inside the columnHeader. `copy.rowCount` is chosen
        with Intl.PluralRules for `document.documentElement.lang`, falling back to
        the runtime default (React Native has no document, so it always uses the runtime
        default locale). Each theme''s CSS build stamps its own prose and content
        widths into the container queries, so a theme with another content width ships
        another stylesheet; no rebuilt number ever reaches a package built for a different
        theme. Rows are keyed by id; no virtualization in this component (that is
        DataGrid).'
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
        return lit templates. Composed `sort-change`, `selection-change`, `row-press`;
        rows are pressable only with the `pressable-rows` attribute, a reflected boolean
        property `pressableRows` that is Lit''s alone (no other platform has it, since
        they can see their own listeners). `captionLevel` is the unreflected `caption-level`
        attribute. aria-busy and the accessible name are on the shadow <table role="table">,
        not the host, which has no role. Container queries on :host.'
    rn:
      element: FlatList
      props:
      - accessibilityRole=list
      - accessibilityLabel
      - stickyHeaderIndices
      notes: 'No table element on native. The layout follows `responsive` against
        the table''s onLayout width (window width before the first layout), not the
        device type. The FlatList is both the scroll container and the body, so it
        carries testID "Table.table" and the `body` part has no element on this platform
        — the one anatomy part native lacks. `headerShadow` and `stickyColumnShadow`
        are spread onto the header and pinned-cell Views themselves rather than an
        extra wrapper; on Android that elevation can clip against the scroll region,
        which is accepted rather than paid for with another View. `copy.scrollHint`
        describes the scroll region whenever `responsive: scroll`, whether or not
        anything is hidden past an edge. Stacked (`stack` below layout.maxWidth.prose):
        a FlatList (accessibilityRole="list", accessibilityLabel from caption, accessibilityHint
        from copy.rowCount) whose rows are accessible Views with an accessibilityLabel
        that reads "{header}: {value}" for each visible column, the row header first,
        plus "selected" state; selection Checkbox and rowActions inside; sort controls
        are a Toolbar of Buttons above the list, which carry no Table.sortButton testID
        (a wrapper View would not receive Toolbar''s size); that Toolbar takes Table''s
        own `density` (the two share the compact/comfortable values) and `size: sm`,
        and is named `copy.sortToolbarLabel` even when the select-all Checkbox is
        all it holds. Otherwise, and for `scroll` at every width: a header row View
        (accessibilityRole="header" cells) and rows as horizontal Views with fixed
        column widths, `scroll` in a horizontal ScrollView whose row-header cells
        are pinned by translating them with the horizontal scroll offset (Animated
        translateX; no second list), casting stickyColumnShadow once scrolled. Hover
        (rowHover) exists only for react-native-web pointers, through Pressable onHoverIn/onHoverOut.
        No hardware-keyboard arrow scrolling: ScrollView has no key events, so the
        scroll region scrolls by swipe only. copy.selectedCount and copy.sortedAnnouncement
        go to hidden polite live regions plus AccessibilityInfo.announceForAccessibility
        on iOS, when the shown state changes.'
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
    - lit
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

## Parts and slots

- `container`: element
- `scrollRegion`: element
- `table`: element
- `caption`: component `Heading`; forwards `captionSize` → `overrides.fontSize`, `captionWeight` → `overrides.fontWeight`, `captionGap` → `overrides.marginBlockEnd`
- `header`: element
- `headerRow`: element
- `columnHeader`: element
- `sortButton`: component `Button`; props `variant` = "ghost", `size` = "sm"; forwards `headerWeight` → `overrides.fontWeight`, `cellGap` → `overrides.iconGap`
- `body`: element
- `row`: element
- `rowHeader`: element
- `cell`: element
- `selectCell`: component `Checkbox`
- `selectAllCell`: component `Checkbox`
- `stackedLabel`: element
- `emptyState`: component `Text`
- `footer`: element

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
- `cellPaddingInline`: token `layout.inset.md`; part `cell`; by `density`: compact → `layout.inset.sm`, any other value → `layout.inset.md`
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

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `headerWeight`, `headerSize`, `headerBorder`, `headerBorderWidth`, `headerShadow`, `rowBorder`, `rowBorderWidth`, `rowHover`, `cellPaddingInline`, `cellPaddingBlock`, `cellGap`, `captionSize`, `captionWeight`, `captionGap`, `stackedRowInset`, `stackedRowGap`, `stackedBlockGap`, `stackedLabelSize`, `stackedLabelWeight`, `stackedRowRadius`, `stickyColumnShadow`, `scrollFade`, `fontFamily`, `fontSize`, `lineHeight`, `numericFont`, `transition`
Locked (accessibility-bearing, never overridable): `surface`, `headerSurface`, `headerColor`, `rowStripe`, `rowSelected`, `rowSelectedBorder`, `rowSelectedBorderWidth`, `cellColor`, `cellMutedColor`, `stackedLabelColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (20)

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
  - lit
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

## Platform notes (web)

```yaml
element: div
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
notes: "The root is the container <div data-ds=\"Table\"> \u2014 what a `ref` reaches\
  \ \u2014 holding the caption Heading, the scroll region and the table; aria-busy,\
  \ aria-rowcount and aria-colcount sit on the inner <table role=\"table\">. Native\
  \ <table><thead><tbody> with EVERY role stated explicitly (role=\"table\" on the\
  \ table, \"rowgroup\" on thead/tbody, \"row\" on tr, \"columnheader\"/\"rowheader\"\
  /\"cell\" on th/td) \u2014 browsers drop the implicit table roles as soon as CSS\
  \ changes display on any of these elements, which the stacked layout and sticky\
  \ positioning do. The caption is the composed Heading at `captionLevel`, rendered\
  \ as a sibling above the <table> inside the container and referenced by aria-labelledby\
  \ \u2014 not inside a <caption> element. With role=\"table\" stated, ARIA lets the\
  \ table own only rows and rowgroups, so a heading inside <caption> is an invalid\
  \ owned child and every instance fails the aria-required-children check; a labelled\
  \ sibling is the same name to a screen reader and costs nothing. `hideCaption` visually\
  \ hides that heading and keeps it as the name. Column headers: <th scope=\"col\"\
  \ abbr>; the row-header column: <th scope=\"row\">. Sort: a Button (ghost, sm) inside\
  \ the columnheader with aria-sort on the th and a visually-hidden live region announcing\
  \ copy.sortedAnnouncement. Selection: Checkbox in the first cell, aria-selected\
  \ on the tr, live region for copy.selectedCount. `responsive: stack` below the prose\
  \ breakpoint: a container query switches tr/td to display block/grid, plain column\
  \ headers are visually hidden (not display none, so the columnheaders remain in\
  \ the tree) while the select-all header and sortable headers stay visible as a row\
  \ that wraps on `stackedRowGap` and keeps the header cell styling, so no focusable\
  \ control is invisible; each td gets a ::before from a data-label attribute holding\
  \ the header text, hidden from assistive technology with empty alternative text\
  \ (`content: attr(data-label) / \"\"`, after a plain `content: attr(data-label)`\
  \ fallback) as the text is already associated by the roles. The row header gets\
  \ no data-label: it is the row's name. `responsive: scroll`: the table sits in a\
  \ <div role=\"region\" aria-labelledby={captionId} tabindex=\"0\"> with overflow-x\
  \ auto, faded edges, and the row-header column position: sticky. Sticky header:\
  \ thead th position: sticky top 0 with the shadow toggled by an IntersectionObserver\
  \ sentinel. rowActions cell has a visually-hidden columnheader \"Actions\", and\
  \ carries the same text as its data-label so the stacked layout labels the action\
  \ row like every other cell. With `selectable: single` the header's selection position\
  \ is an empty <td role=\"cell\"> with no part (an empty columnheader would have\
  \ no name). Button writes its own data-part, so the sortButton part has no hook\
  \ of its own; it is the Button inside the columnHeader. `copy.rowCount` is chosen\
  \ with Intl.PluralRules for `document.documentElement.lang`, falling back to the\
  \ runtime default (React Native has no document, so it always uses the runtime default\
  \ locale). Each theme's CSS build stamps its own prose and content widths into the\
  \ container queries, so a theme with another content width ships another stylesheet;\
  \ no rebuilt number ever reaches a package built for a different theme. Rows are\
  \ keyed by id; no virtualization in this component (that is DataGrid)."
```

## Guidance

## Overview

A table is the honest way to show records that share fields: every row the same shape, every column a comparable thing. This component keeps that honesty on a phone — where most tables quietly turn into unreadable text — by choosing, per table, whether rows stack into labelled blocks or columns scroll, and by stating every role explicitly so neither layout costs a screen-reader user the structure.

## When to use

Use a Table for a list of records with three or more comparable fields: orders, invoices, members, inventory, results. Use `stack` (the default) when each row is a thing a person reads — a person, an order — and `scroll` when the columns are what matters — figures across months, a comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions exist (put them in a Toolbar above the table that appears with the selection count). Put the row's identity in the `isRowHeader` column, usually as a Link to its detail page.

## When not to use

Do not use a Table for layout, for a list with one or two fields (a Stack of Cards or a plain list), or for key–value pairs about one thing (a description list). Do not use it when cells are edited in place or navigated with arrow keys — that is DataGrid, a different role with a different keyboard model. Do not put a Table inside a Card that is narrower than the content width; give it the Container.

## Behavior

The header row shows column names; sortable ones are Buttons whose activation cycles ascending → descending on that column (and starts ascending on another), announced through a live region, and shown by an arrow Icon plus `aria-sort`. With `selectable`, each row has a Checkbox named from its row header, and `multiple` adds select-all (indeterminate when some are selected); the count is announced. Rows are inert unless they contain interactive content or `onRowPress` is set, in which case the row header becomes the row's Button and hover/press styling applies to the row. Below the prose width the table follows `responsive`: stacked rows keep the column header as a small label before each value and hide `hideBelow` columns; scrolling tables keep every column, fade the edges, keep the row-header column sticky, and let the region be focused and scrolled by keyboard. `stickyHeader` keeps the header in view and casts a shadow only once the body has scrolled under it. Empty data shows `emptyMessage` in a single full-width cell; `loading` sets `aria-busy` and shows the loading text without removing existing rows. Sort buttons show the column header as their visible label and carry the sort phrase as `accessibleName`. `onRowPress` applies only when the row-header column has no custom `render` (a rendered Link would conflict); without an `isRowHeader` column it is a development warning and rows are inert. The selection Checkboxes use `hideLabel` with `copy.selectRow`. In `single` selection, pressing the selected row's checkbox again deselects it. `maxHeight: viewport` is the viewport height minus two `layout.gap.section`. Arrow keys in the scroll region scroll by `space.10`, read from the built token (px and rem both parsed); the region is present whenever `responsive: scroll`, not only below the breakpoint. `copy.rowCount` describes the table and `copy.scrollHint` the scroll region (visually hidden, aria-describedby). On native `abbr` has no effect and `width: auto`/`min` both size to `space.20`. A sort button's `accessibleName` is the phrase for what pressing it will do: `copy.sortDescending` when its column is currently ascending, `copy.sortAscending` otherwise. The caption and sort button forwards pass Table's value (its default included, since `headerWeight` differs from Button's) into the child's own `overrides`. A forwarded binding reaches the child that way and only that way: Table's own CSS hook is not the route to a composed child, so on Lit a consumer who wants another caption size sets the Heading's own hook (`--ds-heading-font-size`), not `--ds-table-caption-size`. `copy.sortToolbarLabel` names React Native's stacked sort Toolbar and `copy.cellLabel` SwiftUI's stacked labels; web and Lit render neither. The actions column's visually hidden header is a `columnHeader` part like the others. Inside a Form, the selection Checkboxes are not form fields.

## Content guidelines

Captions name the set, not the component ("Open invoices", not "Invoices table"). Column headers are one or two words, sentence case, with units in the header rather than in every cell ("Amount (USD)"); use `abbr` when a long header has a short spoken form. Numbers align end and share their decimals; dates use one format per column. The row-header column comes first (after the selection column) and holds the thing the row is about. Keep row actions to two visible plus a Menu; keep tables under about ten columns and use `hideBelow` for the least important ones.

## Accessibility

The table is a `table` with explicit `rowgroup`, `row`, `columnheader`, `rowheader` and `cell` roles, a caption as its name, and `scope`/`abbr` on headers (WCAG 1.3.1, 4.1.2) — explicit because CSS that changes display strips the native roles, and both responsive modes change display. Sort state is exposed with `aria-sort` and announced (4.1.3); the sort control is a real Button with a name that says what it does (2.4.6). Row selection is exposed as `aria-selected` plus the checkbox state, and is shown by a start-edge bar as well as a fill (1.4.1). Stacked rows keep their header association through the roles and the repeated visible labels, so a screen-reader user hears "Amount: $40" either way. The scroll region is named by the caption and focusable, so keyboard users can reach columns off-screen (2.1.1, 1.4.10 — content is not lost, only scrolled). Hover styling is confined to interactive rows and never the only signal (`no-hover-only`).

## Platform notes

### Web
Render `<div data-ds="Table" class="ds-table--{responsive} ds-table--{density}">` containing, for `scroll`, `<div role="region" aria-labelledby={captionId} tabindex="0">` with the fade masks; the caption is the composed `Heading` carrying an `id`, a sibling above the table and visually hidden when `hideCaption`, never a `<caption>` element — under the stated `role="table"` a heading inside `<caption>` is an invalid owned child; inside, `<table role="table" aria-labelledby={captionId} aria-rowcount aria-colcount aria-busy>` with `<thead role="rowgroup"><tr role="row">` of `<th role="columnheader" scope="col" abbr aria-sort>` (the selection `th` holds the select-all `Checkbox`; sortable headers hold `Button variant="ghost" size="sm"` with the header text and an `Icon` chevron-up/down when sorted; the actions header text is visually hidden), and `<tbody role="rowgroup">` of `<tr role="row" aria-selected data-part="row">` with `<th role="rowheader" scope="row">` for the row-header column and `<td role="cell" data-label={header}>` otherwise. Container query at the prose width: `stack` sets `tr { display: grid; grid-template-columns: 1fr }` with `thead` visually hidden and `td::before { content: attr(data-label) }` styled from the `stackedLabel*` bindings, each row on `stackedRowRadius` with `stackedRowInset`; `scroll` leaves display alone and sets `position: sticky; inset-inline-start: 0` on the row-header cells. Sticky header: `thead th { position: sticky; inset-block-start: 0 }` with `headerShadow` toggled via a sentinel `IntersectionObserver`. Visually-hidden `aria-live="polite"` region for sort and selection announcements. Uncontrolled sorting compares with `localeCompare` (`numeric: true`) for strings and `-` for numbers. The two breakpoint numbers come from the built token JSON, `literal-ok: breakpoint from layout.maxWidth.*`.

### Lit
`<ds-table caption="Open invoices" .columns=${columns} .data=${rows} selectable="multiple" responsive="scroll"></ds-table>`; the table is built in the shadow root from the properties (never slotted rows); `render` returns lit templates; container queries on `:host`; composed events.

### React Native
`responsive: stack` below the prose width: `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={caption}`) rendering each row as a `View accessible` styled as a stacked block (`stackedRowInset`, `stackedRowGap`, `stackedRowRadius`) whose `accessibilityLabel` joins "{header}: {value}" for visible columns with the row header first and the selected state; the selection `Checkbox` and `rowActions` are separate accessible elements inside. Sort controls render as a `Toolbar` of `Button`s above the list (no header row on phones). `responsive: scroll` (any width) and `stack` above the prose width: header `View` with `accessibilityRole="header"` cells and rows of fixed-width cells; `scroll` wraps in a horizontal `ScrollView` with the row-header cells pinned by translating them with the scroll offset. Row press uses `Pressable` with `accessibilityRole="button"` when `onRowPress` is set.

## Related

DataGrid, Card, Checkbox, Toolbar, Meter, Text, Link.
