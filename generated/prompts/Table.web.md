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
    onSelectionChange:
      description: Fired with the new array of selected ids.
      platforms:
        web: onSelectionChange
        lit: selection-change
        rn: onSelectionChange
        swiftui: onSelectionChange
    onRowPress:
      description: Fired when a row is activated, with its id. Only when the row has
        no other interactive content; the row header cell becomes a Button and the
        row is styled interactive. Prefer a Link in the row header for navigation.
      platforms:
        web: onRowPress
        lit: row-press
        rn: onRowPress
        swiftui: onRowPress
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
      locked: true
    headerColor:
      token: color.foreground
      locked: true
    headerWeight:
      token: font.weight.semibold
      locked: false
    headerSize:
      token: font.size.sm
      locked: false
    headerBorder:
      token: color.border.strong
      locked: false
    headerBorderWidth:
      token: border.width.thin
      locked: false
    headerShadow:
      token: shadow.raised
      description: Shown under the sticky header only once the body has scrolled beneath
        it.
      locked: false
    rowBorder:
      token: color.border
      locked: false
    rowBorderWidth:
      token: border.width.thin
      locked: false
    rowStripe:
      token: color.background.subtle
      locked: true
    rowHover:
      token: color.action.ghost.backgroundHover
      description: Interactive rows only (onRowPress or a Link in the row header).
        Hover never appears on plain rows.
      locked: false
    rowSelected:
      token: color.background.subtle
      description: Same tint as a stripe; the start-edge bar and the checkbox are
        what say selected.
      locked: true
    rowSelectedBorder:
      token: color.control.selectedBackground
      description: A start-edge bar on selected rows, so selection is not color-fill
        alone.
      locked: true
    rowSelectedBorderWidth:
      token: border.width.focus
      locked: true
    cellColor:
      token: color.foreground
      locked: true
    cellMutedColor:
      token: color.foreground.muted
      description: Secondary values (a date beside a title) rendered with Text tone
        muted.
      locked: true
    cellPaddingInline:
      token: layout.inset.md
      locked: false
    cellPaddingInlineCompact:
      token: layout.inset.sm
      description: Used instead of cellPaddingInline when density is compact.
      locked: false
    cellPaddingBlock:
      token: space.sm
      locked: false
    cellGap:
      token: layout.gap.tight
      description: Between a sort button's label and its arrow, and between actions
        in the actions cell.
      locked: false
    captionSize:
      token: font.size.md
      locked: false
    captionWeight:
      token: font.weight.semibold
      locked: false
    captionGap:
      token: space.2
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
      locked: true
    stackedLabelSize:
      token: font.size.xs
      locked: false
    stackedLabelWeight:
      token: font.weight.medium
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
    sortAscending: Sort by {column}, ascending
    sortDescending: Sort by {column}, descending
    sortedAnnouncement: Sorted by {column}, {direction}
    selectAll: Select all rows
    selectRow: Select {rowName}
    selectedCount: '{count} of {total} selected'
    actions: Actions
    empty: Nothing to show.
    loading: Loading
    scrollHint: Scroll sideways to see more columns
    rowCount: '{count} rows'
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
      large: true
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
      - sticky-header
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `headerWeight`, `headerSize`, `headerBorder`, `headerBorderWidth`, `headerShadow`, `rowBorder`, `rowBorderWidth`, `rowHover`, `cellPaddingInline`, `cellPaddingInlineCompact`, `cellPaddingBlock`, `cellGap`, `captionSize`, `captionWeight`, `captionGap`, `stackedRowInset`, `stackedRowGap`, `stackedLabelSize`, `stackedLabelWeight`, `stackedRowRadius`, `stickyColumnShadow`, `scrollFade`, `fontFamily`, `fontSize`, `lineHeight`, `numericFont`, `transition`
Locked (accessibility-bearing, never overridable): `surface`, `headerSurface`, `headerColor`, `rowStripe`, `rowSelected`, `rowSelectedBorder`, `rowSelectedBorderWidth`, `cellColor`, `cellMutedColor`, `stackedLabelColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (14)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
notes: "Native <table><caption><thead><tbody> with EVERY role stated explicitly (role=\"\
  table\" on the table, \"rowgroup\" on thead/tbody, \"row\" on tr, \"columnheader\"\
  /\"rowheader\"/\"cell\" on th/td) \u2014 browsers drop the implicit table roles\
  \ as soon as CSS changes display on any of these elements, which the stacked layout\
  \ and sticky positioning do. Column headers: <th scope=\"col\" abbr>; the row-header\
  \ column: <th scope=\"row\">. Sort: a Button (ghost, sm) inside the columnheader\
  \ with aria-sort on the th and a visually-hidden live region announcing copy.sortedAnnouncement.\
  \ Selection: Checkbox in the first cell, aria-selected on the tr, live region for\
  \ copy.selectedCount. `responsive: stack` below the prose breakpoint: a container\
  \ query switches tr/td to display block/grid, thead is visually hidden (not display\
  \ none, so the columnheaders remain in the tree), and each td gets a ::before from\
  \ a data-label attribute holding the header text \u2014 aria-hidden as text is already\
  \ associated by the roles. `responsive: scroll`: the table sits in a <div role=\"\
  region\" aria-labelledby={captionId} tabindex=\"0\"> with overflow-x auto, faded\
  \ edges, and the row-header column position: sticky. Sticky header: thead th position:\
  \ sticky top 0 with the shadow toggled by an IntersectionObserver sentinel. rowActions\
  \ cell has a visually-hidden columnheader \"Actions\". Rows are keyed by id; no\
  \ virtualization in this component (that is DataGrid)."
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
