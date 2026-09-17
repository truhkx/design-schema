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
    icon: { component: Icon, forwards: { iconColor: color } }
    label: { component: Text, forwards: { labelSelectedWeight: fontWeight, fontFamily: fontFamily, fontSize: fontSize, lineHeight: lineHeight } }
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
      description: 'The hierarchy. `href` makes a node''s label a Link with `tone: inherit` nested inside the label Text, so it takes the label''s font and color (navigation trees); `icon` is an Icon glyph (`folder` and `file` exist for the usual case); `badge` is a short trailing count or status; `children: "lazy"` loads on first expand through `onExpand`.'
    expanded:
      type: array
      shape: 'string[]'
      description: 'Controlled expanded ids. A still-`"lazy"` id here is held closed until the user opens it, exactly as in `defaultExpanded` — the id stays in the array the caller passed and in what onExpandChange reports, but the node does not render open and fires no onExpand.'
      controls:
        event: onExpandChange
        default: defaultExpanded
    defaultExpanded:
      type: array
      shape: 'string[]'
      description: 'Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array and never a `"lazy"` node, as TreeGrid; `"*"` is reserved as that sentinel, so a node whose id is literally `"*"` is never matched by it. A lazy id listed explicitly stays closed until the user opens it (onExpand only fires for user acts), and the same rule covers the controlled `expanded`.'
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
      description: 'With `multiple`, selecting a parent selects its descendants and parents show indeterminate. The cascade covers loaded, enabled descendants only (a `"lazy"` subtree contributes nothing until loaded); a parent''s id is in `selected` exactly when all its enabled loaded descendants are, and unchecking any descendant removes it and every ancestor id. Its aria-checked (true, mixed, false) is derived from its descendants. A disabled node is skipped as a target but does not wall off its subtree: its enabled loaded descendants still cascade. A parent with no enabled loaded descendants at all (a still-lazy subtree, or only disabled children) behaves as a leaf and carries just its own id. Shift+ArrowDown/Up cascade like Space but only ever add — they never remove a node or an ancestor.'
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
      description: 'Fired with the selected ids, in tree (document) order, and only when the set actually changes (Space on the already-selected node, or selectOnFocus landing on it, fires nothing).'
      platforms: { web: onSelectionChange, lit: selection-change, rn: onSelectionChange, swiftui: onSelectionChange }
      payload:
        - { name: ids, type: array, shape: 'string[]', description: 'Every selected id, as a bare array.' }
      fires: [user]
    onExpandChange:
      description: Fired with the expanded ids, in the order they were opened.
      platforms: { web: onExpandChange, lit: expand-change, rn: onExpandChange, swiftui: onExpandChange }
      payload:
        - { name: ids, type: array, shape: 'string[]', description: 'Every expanded id, as a bare array.' }
      fires: [user]
    onExpand:
      description: 'Fired with its id each time a node whose `children` is still `"lazy"` is opened, so a failed load can retry (as TreeGrid); once the caller replaces `children` it never fires again. It fires before the onExpandChange of the same act.'
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
    - { keys: [Tab], action: 'Moves into the tree (to the selected node — the first selected in tree order when several are — else the first node) and out of it — one tab stop. Leaving the tree forgets which node was focused, so re-entry follows the same rule instead of restoring it.', from: any, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [ArrowDown], action: Next visible node., from: first, expect: focus-next, platforms: [web, lit, swiftui] }
    - { keys: [ArrowUp], action: Previous visible node., from: last, expect: focus-prev, platforms: [web, lit, swiftui] }
    - { keys: [ArrowRight], action: 'On a closed parent: opens it. On an open parent: moves to its first enabled child (disabled nodes are skipped). On a leaf: nothing.', from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [ArrowLeft], action: 'On an open parent: closes it. Otherwise: moves to the parent; when the parent is disabled, focus stays put.', from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [Home], action: First node., from: last, expect: focus-first, platforms: [web, lit, swiftui] }
    - { keys: [End], action: Last visible node., from: first, expect: focus-last, platforms: [web, lit, swiftui] }
    - { keys: [Enter], action: 'Activates the node (onActivate, or follows href); with `selectable: single`, also selects it first. An href node is followed by clicking its composed link (so the page''s click routing sees it) and does not fire onActivate.', from: inside, expect: manual }
    - { keys: [' '], action: 'Selects (single) or toggles selection (multiple) of the focused node. On rn a tap on the row does this instead — Pressable has no key events.', when: selectable, from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: ['*'], action: 'Opens every enabled sibling of the focused node, the focused node included; lazy siblings open and fire onExpand.', from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [Shift+ArrowDown, Shift+ArrowUp], action: 'Moves focus to the next / previous node and adds it to the selection (the APG rule; no anchor range). Outside `multiple` they act as plain arrows.', when: multiple, from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [Control+a], action: 'Adds every visible, enabled node at the current expansion state to the selection; nodes already selected inside a collapsed branch stay selected (the key never deselects). Bound by key code KeyA, with Control or Meta (Cmd on macOS).', when: multiple, from: inside, expect: manual, platforms: [web, lit, swiftui] }
    - { keys: [a-z], action: 'Type-ahead: any printable character (letters, digits, punctuation) moves to the next visible node whose label starts with the typed characters; `*` and Space keep their own bindings and never enter the buffer. A fresh one-character buffer searches from the node after the focused one; a longer buffer may re-match the focused node (as Listbox). The buffer clears after 500 ms (literal-ok, as Listbox).', from: inside, expect: manual, platforms: [web, lit, swiftui] }
  styles:
    indent: { token: space.5, part: indent, description: Per level on the node row. }
    rowHeight: { token: size.target.min }
    rowPaddingInline: { token: space.2 }
    rowRadius: { token: radius.sm }
    rowGap: { token: layout.gap.tight, description: 'Between the expand button, icon, label and badge; the checkbox is followed by checkboxGap instead.' }
    rowHover: { token: color.action.ghost.backgroundHover, state: hover, description: 'On native it is the pressed fill (and the react-native-web hover), swapped instantly; a selected row keeps rowSelected.' }
    rowSelected: { token: color.background.strong, description: 'Fill on the selected node, and on aria-checked="true" nodes in multiple mode. An indeterminate (mixed) parent gets neither this fill nor the start-edge bar — its dash glyph is the only signal.' }
    rowSelectedBorder: { token: color.control.selectedBackground, description: 'Start-edge bar on the selected (or checked) node, as Table and DataGrid. Drawn over the row at the logical start and mirrored in RTL, by whichever means the platform has that does not move the content (an inset shadow on the row, or an absolutely positioned box).' }
    rowSelectedBorderWidth: { token: border.width.focus }
    labelColor: { token: color.foreground, part: label, description: 'The label Text''s default tone; Text.color is locked, so it is not forwarded.' }
    labelSelectedWeight: { token: font.weight.medium, part: label, description: 'Forwarded to the label Text as `overrides.fontWeight` when selected. When a node has `href` the label Text only wraps the composed link and the weight is not forwarded, so a selected navigation node is marked by the row rather than by heavier text.' }
    headingSize: { token: font.size.md, part: heading, description: 'The visible label Heading; forwarded as `overrides.fontSize`. The gap below it is the Heading''s own marginBlockEnd.' }
    iconColor: { token: color.foreground.muted, part: icon }
    badgeColor: { token: color.foreground.muted, part: badge, description: 'The badge Text''s `tone="muted"`; Text.color is locked, so it is not forwarded.' }
    badgeSize: { token: font.size.xs, part: badge, description: 'Forwarded to the badge Text as `overrides.fontSize`.' }
    expandButtonSize: { token: size.target.min, part: expandButton, description: 'The `expandButton` part is a wrapper the tree owns, this size on both axes, around an unmodified ghost Button centred inside it (Button has no size override and keeps its own data-part, and a `sm` Button is smaller than this, so the target is the wrapper, not the Button); the chevron takes the Button''s own color. TreeGrid''s expandButton is the same wrapper-around-a-Button shape.' }
    guideLine: { token: color.border, description: 'One vertical line per open parent, drawn down that parent''s group, at rowPaddingInline + indent × (parent level − 1) + expandButtonSize / 2 from the row''s start — the centre of that parent''s chevron. No elbows, no termination at the last child, as TreeGrid.' }
    guideLineWidth: { token: border.width.thin }
    checkboxGap: { token: layout.gap.tight, part: checkbox, description: 'In multiple mode the row reads chevron, checkbox, icon, label, badge; this is the gap after the checkbox, so on a node with an icon it falls between the checkbox and the icon. Every other gap in the row is rowGap.' }
    checkboxSize: { token: space.4, part: checkbox, description: 'The drawn checkbox glyph in multiple mode (the treeitem is the control; no Checkbox component).' }
    checkboxBorder: { token: color.control.border, part: checkbox, description: 'Unchecked edge; checked or mixed, the border takes checkboxSelected so the fill has no contrasting edge.' }
    checkboxBorderWidth: { token: border.width.thin, part: checkbox }
    checkboxBackground: { token: color.control.background, part: checkbox }
    checkboxSelected: { token: color.control.selectedBackground, part: checkbox, description: 'Fill when checked or indeterminate.' }
    checkboxMark: { token: color.control.selectedForeground, part: checkbox, description: 'The check or dash Icon on the fill.' }
    checkboxRadius: { token: radius.sm, part: checkbox }
    fontFamily: { token: font.family.body, description: 'Sets the container''s font, and the resolved value (the override when there is one, the token otherwise) is always forwarded to the label Text as `overrides.fontFamily`, so the root hook and the composed label never disagree.' }
    fontSize: { token: font.size.sm, description: 'The container''s size and, resolved the same way, the label Text''s `overrides.fontSize`.' }
    lineHeight: { token: font.lineHeight.normal, description: 'The container''s line height and, resolved the same way, the label Text''s `overrides.lineHeight`.' }
    minTarget: { token: size.target.min }
    focusRing: { token: color.border.focus, description: 'Drawn around the whole `node` — the chevron included, since the row is one visual target — not around nodeRow alone.' }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.fast, description: 'Chevron rotation and hover; groups appear instantly. The collapsed chevron is mirrored in RTL.' }
  constants:
    typeaheadReset:
      description: 'How long typed characters accumulate before the typeahead buffer clears. Read on web, lit and swiftui only — there is no type-ahead on rn, so no rn code reads it.'
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
      attributes: [role=tree, role=treeitem, role=group, aria-expanded, aria-selected, aria-checked, aria-level, aria-setsize, aria-posinset, aria-multiselectable, aria-label, aria-busy, aria-disabled, tabindex]
      notes: 'A <div data-ds="Tree" data-part="container"> holding the Heading when showLabel and the <ul role="tree" aria-labelledby={headingId} | aria-label aria-multiselectable> of <li role="treeitem" aria-level aria-setsize aria-posinset aria-expanded (parents only) aria-selected|aria-checked> whose children are in a nested <ul role="group">. Roving tabindex on the treeitems (one tab stop; the item, not the row div, is focused); no aria-activedescendant. The <ul role="tree"> has no data-part (address it by role). The expand chevron is a Button with aria-hidden and tabindex=-1 — ArrowLeft/Right are the keyboard path; on a disabled node it is disabled too, and clicks on a disabled row do nothing (a disabled parent stays closed, so do not disable a parent whose children must stay reachable). Heading and Button keep their own data-part, so the `heading` and `expandButton` parts are wrappers the tree owns; Link keeps its own `data-part="anchor"` too, so the `link` part is a `<span data-part="link">` the tree owns around it (activation finds the anchor inside that span); Text takes data-part directly. Nodes with href render the label as a Link inside the treeitem, and the composed Link takes tabindex=-1 so the treeitem stays the only tab stop; Enter activates it by clicking the anchor. The tree''s own label Text is the outer `data-part="label"`; the Link nested inside it keeps its own inner parts, which a part locator resolves after the tree''s. In single mode aria-selected is on every node ("false" when unselected, so a screen reader hears the state on each one), and in multiple mode aria-checked is on every node. Multiple mode uses aria-checked with an indeterminate value for cascading parents and a Checkbox glyph (not the Checkbox component: the treeitem itself is the control). Type-ahead buffers keys for 500 ms. Pointer: click on a node focuses it and does what Space does (select in single, toggle in multiple); double-click does what Enter does, and a click whose `detail` is 2 or more does not toggle again (a double-click toggles once, then activates); click on the chevron toggles expansion and focuses the node without changing selection. Lazy placeholder: a <li role="treeitem" aria-disabled="true"> holding copy.loading inside the group, not navigable, with no data-part, and aria-busy on the parent treeitem. Empty `nodes`: the <ul> renders with no items and copy.empty is a `Text tone="muted"` below it inside the container.'
    lit:
      tag: ds-tree
      reflect: [selectable, select-children, select-on-focus, { prop: showGuides, attribute: hide-guides }, show-label, heading-level]
      notes: '`nodes` as a property rendered in the shadow root; roving tabindex over shadow treeitems; composed events. ds-link is composed for href nodes. A tabindex on a custom-element host does not reach the child''s inner control, so every composed ds-link and ds-button inside a treeitem has its own inner `<a>`/`<button>` demoted to tabindex="-1" after each render (as TreeGrid does for cell controls); otherwise the tree would have a tab stop per node and a focusable button inside aria-hidden. `showGuides` defaults true, so its attribute is the negated `hide-guides`. Forwarded bindings reach the composed ds-text / ds-heading / ds-icon through their `overrides` property only, so a consumer''s CSS on a forwarded --ds-tree-* hook does not reach the child; override them through `overrides`. Composed events carry bare detail values — `selection-change` and `expand-change` the string[] itself, `expand` and `activate` the id string — not objects, as TreeGrid.'
    rn:
      element: FlatList
      props: [accessibilityRole=list, accessibilityLabel]
      notes: 'A FlatList over the flattened visible nodes; each row a Pressable with accessibilityRole="button" (or "link" for href), accessibilityState={{ expanded, selected, checked, disabled }}, accessibilityLabel "{label}, level {n}" — with the badge folded in when the node has one ("{label}, {badge}, level {n}"), since the label replaces the row''s rendered content for a screen reader — and accessibilityActions expand/collapse. The lazy placeholder is its own row whose label is copy.loading. Multiple mode draws the checkbox glyph (checkbox* bindings, accessibilityState.checked) inside the same Pressable — not the Checkbox component — so the row stays one target and Enter-equivalent activation and href still work: a tap toggles selection, a long press activates. A screen reader''s activate gesture lands on the tap, which in that mode toggles selection, so in multiple mode the row also carries the standard `longpress` accessibility action (no label needed; a custom `activate` would take over the double-tap) calling the same handler as a long press — otherwise there would be no non-gestural way to follow a node. In `single` a tap does what Enter does (selects, then activates); in `none` a tap only activates and does not toggle expansion. `href` is followed with `Linking.openURL` by the row itself (the composed Link gets an onPress that returns false, so a tap on its text acts like the rest of the row); on native an href must be an absolute URL, because `Linking.openURL` cannot open an app-relative path, and apps with in-app routes use onActivate instead of href (an app-relative href is a web and lit affordance). The root View is the `container` (holding the Heading and the FlatList); `group` has no element. `selectOnFocus` is wired to the Pressable''s onFocus (hardware keyboard and assistive-technology focus). No arrow keys, no type-ahead, no `*` and no expand-all action; the expand chevron is a real target, accessible and named with copy.expand/collapse. React Native gives View and Pressable no key events, so Tab, Home, End, Space and Control+a have no native path either — a tap stands in for Space and Enter, and the expand/collapse actions for the arrows. There is no tabIndex on native, so the roving tabindex and the one-tab-stop rule are web, lit and swiftui only; on react-native-web every row Pressable and chevron Button is its own tab stop, and the accessibility path is the row''s accessibilityState plus its expand/collapse actions rather than focus order. There is no role="status" either: copy.selectedCount goes in a one-point View with accessibilityLiveRegion="polite" on Android and through AccessibilityInfo.announceForAccessibility on iOS, on each fired selection change — that pairing is the rn form of every live-region requirement in this doc. copy.empty is the FlatList''s empty component, so it renders inside the list rather than beside it.'
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

ArrowUp/Down move through visible nodes; ArrowRight opens a closed parent or steps into an open one; ArrowLeft closes or steps up; `*` opens all siblings; typing jumps by label. Enter activates (navigates for `href`, otherwise `onActivate`) and, in single mode, selects. Space selects or toggles; in multiple mode Shift+arrows extend and Ctrl+A selects all visible. Lazy nodes load when opened, with a placeholder child; onExpand fires before onExpandChange. Disabled nodes are visible, skipped by arrows, not selectable, and cannot be expanded by any means — the keyboard never reaches them and their chevron is disabled — so a disabled parent's children are unreachable: never disable a parent whose children must stay reachable. Selection and expansion are both controlled-or-uncontrolled and reported through events; `selected` is always an array. With the pointer, click selects or toggles and focuses, double-click activates, and the chevron only expands. Touch has no double-tap equivalent, so on native a tap activates in `selectable: none` while web and lit keep activation on double-click and Enter — the one place the pointer and the tap disagree. The heading, when shown, is a composed Heading at `headingLevel` sized by headingSize and names the tree.

## Content guidelines

Labels are short nouns; nesting supplies the context, so "Invoices" not "Billing – Invoices". Use `icon` consistently per node type (folder/file) or not at all; use `badge` for counts that help choose ("12"). Open the first level by default in navigation trees so the structure is visible.

## Accessibility

The tree is a `tree` of `treeitem`s with `group`s for children, each item exposing level, position in set, set size, expanded state on parents, and selected or checked state (WCAG 1.3.1, 4.1.2; APG tree view). It is one tab stop with a roving tabindex and full arrow-key movement, type-ahead included (2.1.1, 2.4.3). Expansion is operable from the item itself, so the chevron is decoration (2.1.1). Selection shows as a fill plus a start-edge bar (1.4.1) and rows meet the minimum target (2.5.8). In multiple mode the count is announced (4.1.3): copy.selectedCount goes to a visually hidden role="status" region, rendered in multiple mode only. The region exists from mount and always holds the current count (an empty tree reads "0 selected"), so nothing is announced at mount; it is written on every user selection change and never forced to re-announce, which means two different selections that yield the same string ("1 selected") are announced once. Expanding and collapsing announce nothing beyond the item's own expanded state. The roving tabindex and the one-tab-stop rule are web, lit and swiftui; React Native has no tabIndex, so there the row's accessibilityState and its expand/collapse actions carry the same information.

## Platform notes

### Web
Render `<div data-ds="Tree">` holding the optional `Heading level={headingLevel}` and `<ul role="tree" aria-labelledby|aria-label aria-multiselectable>` with `<li role="treeitem" id aria-level aria-setsize aria-posinset aria-expanded? aria-selected|aria-checked tabIndex={roving}>` containing the row `<div>` (indent as `padding-inline-start`, the chevron `Button` `ghost sm iconOnly aria-hidden tabIndex={-1}`, optional `Icon`, the label `Text` or `Link`, the badge `Text tone="muted"` with `overrides.fontSize` from badgeSize, and in multiple mode the drawn checkbox `<span aria-hidden>` from the checkbox* bindings with a `check`/`dash` Icon) and, when expanded, `<ul role="group">` of child items. Keydown on the tree implements the table over the flattened visible list; focus moves to the item. Guide lines are a `::before` on groups, hidden with `showGuides: false`. Lazy: on each expand of a still-lazy node fire `onExpand`, render the placeholder item (`aria-disabled`, not navigable) with `copy.loading` and `aria-busy` on the parent.

### Lit
`<ds-tree label="Folders" .nodes=${nodes} selectable="multiple" select-children></ds-tree>`; shadow tree; composed `selection-change`, `expand-change`, `expand`, `activate`.

### React Native
`FlatList` over the flattened visible nodes; rows are `Pressable`s with indent, chevron `Button`, `Icon`, `Text`, badge; `accessibilityState` and `accessibilityActions` as noted; multiple mode draws the checkbox glyph inside the row from the checkbox* bindings (`View` + `Icon`), never the Checkbox component. Groups have no wrapper on native: visible children are flattened into the one list, as TreeGrid.

## Related

TreeGrid, Listbox, Disclosure, Accordion, Link, Menu.
