---
title: Tree
description: A hierarchical list with one field per node — folders, a site map, a category picker — that expands and collapses, moves with arrow keys as one tab stop, and optionally selects nodes. The APG tree view.
component:
  name: Tree
  category: navigation
  status: review
  apg: treeview
  anatomy: [container, node, nodeRow, expandButton, indent, icon, label, badge, group]
  composition:
    expandButton: Button
    icon: Icon
    label: Text
  props:
    label:
      type: string
      required: true
      description: What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`.
      a11y: aria-label / accessibilityLabel on the tree.
    showLabel:
      type: boolean
      default: false
      description: Show the label as a heading above the tree.
    nodes:
      type: array
      required: true
      shape: 'TreeNode[] where TreeNode = { id: string; label: string; icon?: IconName; badge?: string; disabled?: boolean; href?: string; children?: TreeNode[] | "lazy" }'
      description: 'The hierarchy. `href` makes a node a Link (navigation trees); `badge` is a short trailing count or status; `children: "lazy"` loads on first expand through `onExpand`.'
    expanded:
      type: array
      shape: 'string[]'
      description: Controlled expanded ids.
    defaultExpanded:
      type: array
      shape: 'string[]'
      description: Initially expanded ids; `["*"]` for all.
    selectable:
      type: enum
      values: [none, single, multiple]
      default: single
      description: '`single`: one current node (the usual for navigation and pickers). `multiple`: checkbox-like selection with Space, Shift+arrows and Ctrl+A; parents are checkboxes that cascade when `selectChildren`. `none`: expand/collapse only.'
    selected:
      type: array
      shape: 'string[]'
      description: Controlled selected ids.
    defaultSelected:
      type: array
      shape: 'string[]'
      description: Initially selected ids.
    selectChildren:
      type: boolean
      default: false
      description: 'With `multiple`, selecting a parent selects its descendants and parents show indeterminate.'
    selectOnFocus:
      type: boolean
      default: false
      description: 'With `single`, moving focus also selects (a settings sidebar where the tree drives a panel). Off by default: focus moves, Enter or Space selects.'
    showGuides:
      type: boolean
      default: true
      description: Vertical guide lines under open parents.
  events:
    onSelectionChange:
      description: Fired with the selected ids.
      platforms: { web: onSelectionChange, lit: selection-change, rn: onSelectionChange }
    onExpandChange:
      description: Fired with the expanded ids.
      platforms: { web: onExpandChange, lit: expand-change, rn: onExpandChange }
    onExpand:
      description: Fired when a lazy node is expanded for the first time, with its id.
      platforms: { web: onExpand, lit: expand, rn: onExpand }
    onActivate:
      description: 'Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with `href` navigate instead.'
      platforms: { web: onActivate, lit: activate, rn: onActivate }
  keyboard:
    - { keys: [Tab], action: 'Moves into the tree (to the selected node, else the first) and out of it — one tab stop.', from: any, expect: manual }
    - { keys: [ArrowDown], action: Next visible node., from: first, expect: focus-next }
    - { keys: [ArrowUp], action: Previous visible node., from: last, expect: focus-prev }
    - { keys: [ArrowRight], action: 'On a closed parent: opens it. On an open parent: moves to its first child. On a leaf: nothing.', from: inside, expect: manual }
    - { keys: [ArrowLeft], action: 'On an open parent: closes it. Otherwise: moves to the parent.', from: inside, expect: manual }
    - { keys: [Home], action: First node., from: last, expect: focus-first }
    - { keys: [End], action: Last visible node., from: first, expect: focus-last }
    - { keys: [Enter], action: 'Activates the node (onActivate, or follows href); with `selectable: single`, also selects it.', from: inside, expect: manual }
    - { keys: [' '], action: 'Selects (single) or toggles selection (multiple) of the focused node.', when: selectable, from: inside, expect: manual }
    - { keys: ['*'], action: Opens every sibling of the focused node., from: inside, expect: manual }
    - { keys: [Shift+ArrowDown, Shift+ArrowUp], action: Extends selection to the next / previous node., when: multiple, from: inside, expect: manual }
    - { keys: [Ctrl+A], action: Selects all visible nodes., when: multiple, from: inside, expect: manual }
    - { keys: [a-z], action: 'Type-ahead: moves to the next visible node whose label starts with the typed characters.', from: inside, expect: manual }
  styles:
    indent: { token: space.5, description: Per level on the node row. }
    rowHeight: { token: size.target.min }
    rowPaddingInline: { token: space.2 }
    rowRadius: { token: radius.sm }
    rowGap: { token: layout.gap.tight, description: 'Between the expand button, icon, label and badge.' }
    rowHover: { token: color.action.ghost.backgroundHover }
    rowSelected: { token: color.background.strong }
    rowSelectedBorder: { token: color.control.selectedBackground, description: 'Start-edge bar on the selected node, as Table and DataGrid.' }
    rowSelectedBorderWidth: { token: border.width.focus }
    labelColor: { token: color.foreground }
    labelSelectedWeight: { token: font.weight.medium }
    iconColor: { token: color.foreground.muted }
    badgeColor: { token: color.foreground.muted }
    badgeSize: { token: font.size.xs }
    expandButtonSize: { token: size.target.min }
    guideLine: { token: color.border }
    guideLineWidth: { token: border.width.thin }
    checkboxGap: { token: layout.gap.tight, description: Between the checkbox and the label in multiple mode. }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.sm }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.min }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.fast, description: 'Chevron rotation and hover; groups appear instantly.' }
  copy:
    expand: 'Expand {label}'
    collapse: 'Collapse {label}'
    selectedCount: '{count} selected'
    loading: Loading
    empty: Nothing here.
  a11y:
    role: tree
    requires: [accessible-name, keyboard-operable, arrow-navigation, roving-tabindex, expanded-state, selected-state, focus-visible, contrast-aa, target-24px, live-region]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground, background: color.background.strong, level: AA }
      - { foreground: color.foreground.muted, background: color.background.strong, level: AA }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, large: true }
  platforms:
    web:
      element: ul
      attributes: [role=tree, role=treeitem, role=group, aria-expanded, aria-selected, aria-checked, aria-level, aria-setsize, aria-posinset, aria-multiselectable, aria-label, tabindex, aria-activedescendant]
      notes: 'A <ul role="tree" aria-label aria-multiselectable> of <li role="treeitem" aria-level aria-setsize aria-posinset aria-expanded (parents only) aria-selected|aria-checked> whose children are in a nested <ul role="group">. Roving tabindex on the treeitems (one tab stop; the item, not the row div, is focused). The expand chevron is a Button with aria-hidden and tabindex=-1 — ArrowLeft/Right are the keyboard path. Nodes with href render the label as a Link inside the treeitem; Enter activates it. Multiple mode uses aria-checked with an indeterminate value for cascading parents and a Checkbox glyph (not the Checkbox component: the treeitem itself is the control). Type-ahead buffers keys for motion.duration.base × 5.'
    lit:
      tag: ds-tree
      reflect: [selectable, select-children, select-on-focus, show-guides, show-label]
      notes: '`nodes` as a property rendered in the shadow root; roving tabindex over shadow treeitems; composed events. ds-link is composed for href nodes.'
    rn:
      element: FlatList
      props: [accessibilityRole=list, accessibilityLabel]
      notes: 'A FlatList over the flattened visible nodes; each row a Pressable with accessibilityRole="button" (or "link" for href), accessibilityState={{ expanded, selected, checked, disabled }}, accessibilityLabel "{label}, level {n}" and accessibilityActions expand/collapse. Multiple mode uses the Checkbox component''s drawn control inside the row. No arrow keys; the expand chevron is a real target.'
---

A tree is a list that knows about nesting. One field per node, arrows to move and open, Enter to act: the shape of a file browser's sidebar, a category picker, a documentation site's navigation. When nodes need several fields, it becomes a TreeGrid.

## When to use

Use a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product categories, an org's departments. `single` selection with `href` nodes is a navigation tree; `multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only when the tree drives a panel beside it and moving through nodes should preview them.

## When not to use

Do not use a Tree for one level (a Listbox or a list of Links), for nodes with several fields (TreeGrid), or as a Menu (a Menu closes after a choice; a tree stays). Do not use it for a hierarchy most people need entirely visible — render nested headings and lists instead.

## Behavior

ArrowUp/Down move through visible nodes; ArrowRight opens a closed parent or steps into an open one; ArrowLeft closes or steps up; `*` opens all siblings; typing jumps by label. Enter activates (navigates for `href`, otherwise `onActivate`) and, in single mode, selects. Space selects or toggles; in multiple mode Shift+arrows extend and Ctrl+A selects all visible. Lazy nodes load on first open with a placeholder child. Disabled nodes are visible, skipped by arrows, not selectable. Selection and expansion are both controlled-or-uncontrolled and reported through events.

## Content guidelines

Labels are short nouns; nesting supplies the context, so "Invoices" not "Billing – Invoices". Use `icon` consistently per node type (folder/file) or not at all; use `badge` for counts that help choose ("12"). Open the first level by default in navigation trees so the structure is visible.

## Accessibility

The tree is a `tree` of `treeitem`s with `group`s for children, each item exposing level, position in set, set size, expanded state on parents, and selected or checked state (WCAG 1.3.1, 4.1.2; APG tree view). It is one tab stop with a roving tabindex and full arrow-key movement, type-ahead included (2.1.1, 2.4.3). Expansion is operable from the item itself, so the chevron is decoration (2.1.1). Selection shows as a fill plus a start-edge bar (1.4.1) and rows meet the minimum target (2.5.8). In multiple mode the count is announced (4.1.3).

## Platform notes

### Web
Render `<ul role="tree" aria-label aria-multiselectable data-ds="Tree">` with `<li role="treeitem" id aria-level aria-setsize aria-posinset aria-expanded? aria-selected|aria-checked tabIndex={roving}>` containing the row `<div>` (indent as `padding-inline-start`, the chevron `Button` `ghost sm iconOnly aria-hidden tabIndex={-1}`, optional `Icon`, the label `Text` or `Link`, the badge `Text tone="muted" size="xs"`) and, when expanded, `<ul role="group">` of child items. Keydown on the tree implements the table over the flattened visible list; focus moves to the item. Guide lines are a `::before` on groups. Lazy: on first expand fire `onExpand`, render a placeholder item with `copy.loading` and `aria-busy` on the parent.

### Lit
`<ds-tree label="Folders" .nodes=${nodes} selectable="multiple" select-children></ds-tree>`; shadow tree; composed `selection-change`, `expand-change`, `expand`, `activate`.

### React Native
`FlatList` over the flattened visible nodes; rows are `Pressable`s with indent, chevron `Button`, `Icon`, `Text`, badge; `accessibilityState` and `accessibilityActions` as noted; multiple mode draws the Checkbox control inside the row.

## Related

TreeGrid, Listbox, Disclosure, Accordion, Link, Menu.
