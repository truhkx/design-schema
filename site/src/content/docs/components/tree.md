---
title: Tree
description: A hierarchical list with one field per node — folders, a site map, a category picker — that expands and collapses, moves with arrow keys as one tab stop, and optionally selects nodes. The APG tree view.
component:
  name: Tree
  category: navigation
  status: review
  apg: treeview
  anatomy: [container, heading, node, nodeRow, expandButton, indent, icon, label, link, badge, checkbox, group, emptyState]
  composition:
    heading: { component: Heading, forwards: { headingSize: fontSize } }
    expandButton: Button
    icon: Icon
    label: { component: Text, forwards: { labelSelectedWeight: fontWeight } }
    link: Link
    badge: { component: Text, forwards: { badgeSize: fontSize } }
    emptyState: Text
  props:
    label:
      type: string
      required: true
      description: What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`.
      a11y: aria-label / accessibilityLabel on the tree.
    showLabel:
      type: boolean
      default: false
      description: Show the label as a Heading above the tree (then the tree is aria-labelledby it instead of aria-label).
    headingLevel:
      type: enum
      values: ['2', '3', '4']
      default: '2'
      description: Heading level of the visible label in the page outline; its size is headingSize regardless.
    nodes:
      type: array
      required: true
      shape: 'TreeNode[] where TreeNode = { id: string; label: string; icon?: IconName; badge?: string; disabled?: boolean; href?: string; children?: TreeNode[] | "lazy" }'
      description: 'The hierarchy. `href` makes a node''s label a Link (navigation trees); `icon` is an Icon glyph (`folder` and `file` exist for the usual case); `badge` is a short trailing count or status; `children: "lazy"` loads on first expand through `onExpand`.'
    expanded:
      type: array
      shape: 'string[]'
      description: Controlled expanded ids.
      controls:
        event: onExpandChange
        default: defaultExpanded
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
      description: Controlled selected ids. Always an array, even in `single` mode (zero or one element).
      controls:
        event: onSelectionChange
        default: defaultSelected
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
      platforms: { web: onSelectionChange, lit: selection-change, rn: onSelectionChange, swiftui: onSelectionChange }
      payload:
        - { name: ids, type: array, shape: 'string[]', description: 'Every selected id, as a bare array.' }
      fires: [user]
    onExpandChange:
      description: Fired with the expanded ids.
      platforms: { web: onExpandChange, lit: expand-change, rn: onExpandChange, swiftui: onExpandChange }
      payload:
        - { name: ids, type: array, shape: 'string[]', description: 'Every expanded id, as a bare array.' }
      fires: [user]
    onExpand:
      description: Fired when a lazy node is expanded for the first time, with its id.
      platforms: { web: onExpand, lit: expand, rn: onExpand, swiftui: onExpand }
      payload:
        - { name: id, type: string, description: The expanded node. }
      fires: [user]
    onActivate:
      description: 'Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with `href` navigate instead.'
      platforms: { web: onActivate, lit: activate, rn: onActivate, swiftui: onActivate }
      payload:
        - { name: id, type: string, description: The id of the activated node. }
      fires: [user]
  keyboard:
    - { keys: [Tab], action: 'Moves into the tree (to the selected node, else the first) and out of it — one tab stop.', from: any, expect: manual }
    - { keys: [ArrowDown], action: Next visible node., from: first, expect: focus-next, platforms: [web, lit, swiftui] }
    - { keys: [ArrowUp], action: Previous visible node., from: last, expect: focus-prev, platforms: [web, lit, swiftui] }
    - { keys: [ArrowRight], action: 'On a closed parent: opens it. On an open parent: moves to its first enabled child (disabled nodes are skipped). On a leaf: nothing.', from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [ArrowLeft], action: 'On an open parent: closes it. Otherwise: moves to the parent.', from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [Home], action: First node., from: last, expect: focus-first }
    - { keys: [End], action: Last visible node., from: first, expect: focus-last }
    - { keys: [Enter], action: 'Activates the node (onActivate, or follows href); with `selectable: single`, also selects it.', from: inside, expect: manual }
    - { keys: [' '], action: 'Selects (single) or toggles selection (multiple) of the focused node.', when: selectable, from: inside, expect: manual }
    - { keys: ['*'], action: Opens every sibling of the focused node., from: inside, expect: manual }
    - { keys: [Shift+ArrowDown, Shift+ArrowUp], action: 'Moves focus to the next / previous node and adds it to the selection (the APG rule; no anchor range).', when: multiple, from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [Control+a], action: 'Selects every visible, enabled node at the current expansion state; bound by key code KeyA.', when: multiple, from: inside, expect: manual }
    - { keys: [a-z], action: 'Type-ahead: moves to the next visible node whose label starts with the typed characters; the buffer clears after 500 ms (literal-ok, as Listbox).', from: inside, expect: manual, platforms: [web, lit, swiftui] }
  styles:
    indent: { token: space.5, part: indent, description: Per level on the node row. }
    rowHeight: { token: size.target.min }
    rowPaddingInline: { token: space.2 }
    rowRadius: { token: radius.sm }
    rowGap: { token: layout.gap.tight, description: 'Between the expand button, icon, label and badge.' }
    rowHover: { token: color.action.ghost.backgroundHover, state: hover }
    rowSelected: { token: color.background.strong }
    rowSelectedBorder: { token: color.control.selectedBackground, description: 'Start-edge bar on the selected node, as Table and DataGrid.' }
    rowSelectedBorderWidth: { token: border.width.focus }
    labelColor: { token: color.foreground, part: label }
    labelSelectedWeight: { token: font.weight.medium, part: label, description: 'Forwarded to the label Text as `overrides.fontWeight` when selected. When a node has `href` its label is the composed link instead, which exposes no weight to receive it, so a selected navigation node is marked by the row rather than by heavier text.' }
    headingSize: { token: font.size.md, part: heading, description: 'The visible label Heading; forwarded as `overrides.fontSize`.' }
    iconColor: { token: color.foreground.muted, part: icon }
    badgeColor: { token: color.foreground.muted, part: badge }
    badgeSize: { token: font.size.xs, part: badge, description: 'Forwarded to the badge Text as `overrides.fontSize`.' }
    expandButtonSize: { token: size.target.min, part: expandButton }
    guideLine: { token: color.border }
    guideLineWidth: { token: border.width.thin }
    checkboxGap: { token: layout.gap.tight, part: checkbox, description: Between the checkbox and the label in multiple mode. }
    checkboxSize: { token: space.4, part: checkbox, description: 'The drawn checkbox glyph in multiple mode (the treeitem is the control; no Checkbox component).' }
    checkboxBorder: { token: color.control.border, part: checkbox }
    checkboxBackground: { token: color.control.background, part: checkbox }
    checkboxSelected: { token: color.control.selectedBackground, part: checkbox, description: 'Fill when checked or indeterminate.' }
    checkboxMark: { token: color.control.selectedForeground, part: checkbox, description: 'The check or dash Icon on the fill.' }
    checkboxRadius: { token: radius.sm, part: checkbox }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.sm }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.min }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.fast, description: 'Chevron rotation and hover; groups appear instantly.' }
  constants:
    typeaheadReset:
      description: 'How long typed characters accumulate before the typeahead buffer clears.'
      value: 500
      unit: ms
  copy:
    expand: 'Expand {label}'
    collapse: 'Collapse {label}'
    selectedCount:
      text: '{count} selected'
      params:
        count: { type: number, description: How many nodes are selected. }
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
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.border, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.selectedForeground, background: color.control.selectedBackground, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=tree, role=treeitem, role=group, aria-expanded, aria-selected, aria-checked, aria-level, aria-setsize, aria-posinset, aria-multiselectable, aria-label, tabindex, aria-activedescendant]
      notes: 'A <div data-ds="Tree" data-part="container"> holding the Heading when showLabel and the <ul role="tree" aria-labelledby={headingId} | aria-label aria-multiselectable> of <li role="treeitem" aria-level aria-setsize aria-posinset aria-expanded (parents only) aria-selected|aria-checked> whose children are in a nested <ul role="group">. Roving tabindex on the treeitems (one tab stop; the item, not the row div, is focused). The expand chevron is a Button with aria-hidden and tabindex=-1 — ArrowLeft/Right are the keyboard path. Nodes with href render the label as a Link inside the treeitem; Enter activates it. Multiple mode uses aria-checked with an indeterminate value for cascading parents and a Checkbox glyph (not the Checkbox component: the treeitem itself is the control). Type-ahead buffers keys for 500 ms. Pointer: click on a node focuses it and does what Space does (select in single, toggle in multiple); double-click does what Enter does; click on the chevron toggles expansion and focuses the node without changing selection. Empty `nodes`: the <ul> renders with no items and copy.empty is a Text below it inside the container.'
    lit:
      tag: ds-tree
      reflect: [selectable, select-children, select-on-focus, { prop: showGuides, attribute: hide-guides }, show-label, heading-level]
      notes: '`nodes` as a property rendered in the shadow root; roving tabindex over shadow treeitems; composed events. ds-link is composed for href nodes. `showGuides` defaults true, so its attribute is the negated `hide-guides`. labelSelectedWeight, badgeSize and headingSize reach the composed ds-text / ds-heading through their `overrides` property.'
    rn:
      element: FlatList
      props: [accessibilityRole=list, accessibilityLabel]
      notes: 'A FlatList over the flattened visible nodes; each row a Pressable with accessibilityRole="button" (or "link" for href), accessibilityState={{ expanded, selected, checked, disabled }}, accessibilityLabel "{label}, level {n}" and accessibilityActions expand/collapse. Multiple mode draws the checkbox glyph (checkbox* bindings, accessibilityState.checked) inside the same Pressable — not the Checkbox component — so the row stays one target and Enter-equivalent activation and href still work: a tap toggles selection, a long press activates. A screen reader''s activate gesture lands on the tap, which in that mode toggles selection, so the row also carries an `activate` accessibility action beside expand and collapse — otherwise there would be no non-gestural way to follow a node. `selectOnFocus` is wired to the Pressable''s onFocus (hardware keyboard and assistive-technology focus). No arrow keys, no type-ahead; the expand chevron is a real target.'
    swiftui:
      element: ScrollView
      props: [ScrollView, LazyVStack, Button, .accessibilityValue=expanded, .accessibilityAddTraits=isSelected, .accessibilityAction, .focusable, .onMoveCommand, .onKeyPress, '@FocusState', Link]
      notes: 'A `ScrollView` + `LazyVStack` over the flattened visible nodes (no nested group views), each row a `Button` (or `Link` for `href`) with indent, the chevron `Button` (`.accessibilityHidden`, real touch target), `Icon`, `Text`, badge `Text`; `.accessibilityValue` combines ''level {n}'' and expanded/collapsed, `.isSelected` for selection, `.accessibilityValue(checked/unchecked/mixed)` in `multiple` mode where the drawn checkbox glyph lives inside the same row (never the Checkbox component; a tap toggles, a long press activates). Custom actions expand/collapse; the tree is one focus section on iPad with the full keyboard table including type-ahead through `.onKeyPress(characters:)`. `selectedCount` announced in multiple mode; the optional `Heading` names the tree.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    - name: the-expand-button-expands-a-node
      given:
        defaultExpanded: []
        nodes:
          - { id: docs, label: Documents, children: [{ id: invoices, label: Invoices }] }
      when: { click: expandButton }
      then:
        - { event: onExpandChange }
    - name: expanding-a-lazy-node-asks-for-its-children
      description: 'children: "lazy" loads on first expand through onExpand.'
      given:
        defaultExpanded: []
        nodes:
          - { id: docs, label: Documents, children: lazy }
      when: { click: expandButton }
      then:
        - { event: onExpand }
        - { event: onExpandChange }
    - name: clicking-a-node-selects-it
      given:
        selectable: single
        nodes:
          - { id: docs, label: Documents }
          - { id: media, label: Media }
      when: { click: nodeRow }
      then:
        - { event: onSelectionChange }
    - name: space-selects-the-focused-node
      given:
        selectable: single
        nodes:
          - { id: docs, label: Documents }
          - { id: media, label: Media }
      when: { key: Space }
      then:
        - { event: onSelectionChange }
      platforms: [web, lit]
    - name: enter-activates-a-node
      description: Enter activates the node (onActivate, or follows href); with selectable single it also selects it.
      given:
        nodes:
          - { id: docs, label: Documents }
          - { id: media, label: Media }
      when: { key: Enter }
      then:
        - { event: onActivate }
      platforms: [web, lit]
    - name: arrow-movement-does-not-select-by-default
      description: 'selectOnFocus is off by default: focus moves, Enter or Space selects.'
      given:
        selectable: single
        selectOnFocus: false
        nodes:
          - { id: docs, label: Documents }
          - { id: media, label: Media }
      when: { key: ArrowDown }
      then:
        - { event: onSelectionChange, fired: false }
      platforms: [web, lit]
    - name: select-on-focus-selects-as-focus-moves
      description: With single and selectOnFocus, moving focus also selects - a sidebar whose tree drives a panel.
      given:
        selectable: single
        selectOnFocus: true
        nodes:
          - { id: docs, label: Documents }
          - { id: media, label: Media }
      when: { key: ArrowDown }
      then:
        - { event: onSelectionChange }
      platforms: [web, lit]
    - name: a-collapsed-parent-reports-it
      given:
        defaultExpanded: []
        nodes:
          - { id: docs, label: Documents, children: [{ id: invoices, label: Invoices }] }
      then:
        - { attribute: aria-expanded, is: 'false', 'on': node }
      platforms: [web]
    - name: an-expanded-parent-reports-it
      given:
        defaultExpanded: [docs]
        nodes:
          - { id: docs, label: Documents, children: [{ id: invoices, label: Invoices }] }
      then:
        - { attribute: aria-expanded, is: 'true', 'on': node }
      platforms: [web]
    - name: a-selected-node-is-marked-selected
      given:
        selectable: single
        selected: [docs]
        nodes:
          - { id: docs, label: Documents }
          - { id: media, label: Media }
      then:
        - { attribute: aria-selected, is: 'true', 'on': node }
      platforms: [web]
    - name: the-empty-message-shows-when-there-are-no-nodes
      given:
        nodes: []
      then:
        - { copy: empty }
  examples:
    - name: folder-tree
      description: The everyday file tree, one branch open, each node with its glyph.
      given:
        label: Folders
        defaultExpanded: [docs]
        nodes:
          - { id: docs, label: Documents, icon: folder, children: [{ id: invoices, label: Invoices, icon: file }, { id: contracts, label: Contracts, icon: file }] }
          - { id: media, label: Media, icon: folder, children: lazy }
    - name: navigation-sidebar
      description: A settings sidebar whose visible heading names it and whose selection drives the panel beside it.
      given:
        label: Settings sections
        showLabel: true
        headingLevel: '2'
        selectOnFocus: true
        nodes:
          - { id: account, label: Account, href: /settings/account }
          - { id: billing, label: Billing, href: /settings/billing }
    - name: category-picker-with-cascade
      description: Multi-select categories where choosing a parent chooses everything under it.
      given:
        label: Categories
        selectable: multiple
        selectChildren: true
        defaultExpanded: ['*']
        nodes:
          - { id: clothing, label: Clothing, children: [{ id: shirts, label: Shirts }, { id: shoes, label: Shoes }] }
    - name: read-only-site-map
      description: A tree that only expands and collapses, with counts after each branch.
      given:
        label: Site map
        selectable: none
        nodes:
          - { id: guides, label: Guides, badge: '12', children: [{ id: start, label: Getting started }] }
          - { id: api, label: API, badge: '48', children: lazy }
---

A tree is a list that knows about nesting. One field per node, arrows to move and open, Enter to act: the shape of a file browser's sidebar, a category picker, a documentation site's navigation. When nodes need several fields, it becomes a TreeGrid.

## When to use

Use a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product categories, an org's departments. `single` selection with `href` nodes is a navigation tree; `multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only when the tree drives a panel beside it and moving through nodes should preview them.

## When not to use

Do not use a Tree for one level (a Listbox or a list of Links), for nodes with several fields (TreeGrid), or as a Menu (a Menu closes after a choice; a tree stays). Do not use it for a hierarchy most people need entirely visible — render nested headings and lists instead.

## Behavior

ArrowUp/Down move through visible nodes; ArrowRight opens a closed parent or steps into an open one; ArrowLeft closes or steps up; `*` opens all siblings; typing jumps by label. Enter activates (navigates for `href`, otherwise `onActivate`) and, in single mode, selects. Space selects or toggles; in multiple mode Shift+arrows extend and Ctrl+A selects all visible. Lazy nodes load on first open with a placeholder child. Disabled nodes are visible, skipped by arrows, not selectable. Selection and expansion are both controlled-or-uncontrolled and reported through events; `selected` is always an array. With the pointer, click selects or toggles and focuses, double-click activates, and the chevron only expands. The heading, when shown, is a composed Heading at `headingLevel` sized by headingSize and names the tree.

## Content guidelines

Labels are short nouns; nesting supplies the context, so "Invoices" not "Billing – Invoices". Use `icon` consistently per node type (folder/file) or not at all; use `badge` for counts that help choose ("12"). Open the first level by default in navigation trees so the structure is visible.

## Accessibility

The tree is a `tree` of `treeitem`s with `group`s for children, each item exposing level, position in set, set size, expanded state on parents, and selected or checked state (WCAG 1.3.1, 4.1.2; APG tree view). It is one tab stop with a roving tabindex and full arrow-key movement, type-ahead included (2.1.1, 2.4.3). Expansion is operable from the item itself, so the chevron is decoration (2.1.1). Selection shows as a fill plus a start-edge bar (1.4.1) and rows meet the minimum target (2.5.8). In multiple mode the count is announced (4.1.3).

## Platform notes

### Web
Render `<div data-ds="Tree">` holding the optional `Heading level={headingLevel}` and `<ul role="tree" aria-labelledby|aria-label aria-multiselectable>` with `<li role="treeitem" id aria-level aria-setsize aria-posinset aria-expanded? aria-selected|aria-checked tabIndex={roving}>` containing the row `<div>` (indent as `padding-inline-start`, the chevron `Button` `ghost sm iconOnly aria-hidden tabIndex={-1}`, optional `Icon`, the label `Text` or `Link`, the badge `Text tone="muted"` with `overrides.fontSize` from badgeSize, and in multiple mode the drawn checkbox `<span aria-hidden>` from the checkbox* bindings with a `check`/`dash` Icon) and, when expanded, `<ul role="group">` of child items. Keydown on the tree implements the table over the flattened visible list; focus moves to the item. Guide lines are a `::before` on groups, hidden with `showGuides: false`. Lazy: on first expand fire `onExpand`, render a placeholder item with `copy.loading` and `aria-busy` on the parent.

### Lit
`<ds-tree label="Folders" .nodes=${nodes} selectable="multiple" select-children></ds-tree>`; shadow tree; composed `selection-change`, `expand-change`, `expand`, `activate`.

### React Native
`FlatList` over the flattened visible nodes; rows are `Pressable`s with indent, chevron `Button`, `Icon`, `Text`, badge; `accessibilityState` and `accessibilityActions` as noted; multiple mode draws the checkbox glyph inside the row from the checkbox* bindings (`View` + `Icon`), never the Checkbox component. Groups have no wrapper on native: visible children are flattened into the one list, as TreeGrid.

## Related

TreeGrid, Listbox, Disclosure, Accordion, Link, Menu.
