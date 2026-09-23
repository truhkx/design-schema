# Generate: Tree for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Tree.swift` declaring `public struct Tree: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/TreeBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Tree.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Tree") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Tree")` on the root and `"Tree.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Tree
  category: navigation
  status: review
  apg: treeview
  anatomy:
  - container
  - heading
  - node
  - nodeRow
  - expandButton
  - indent
  - icon
  - label
  - link
  - badge
  - checkbox
  - group
  - emptyState
  composition:
    heading:
      component: Heading
      forwards:
        headingSize: fontSize
    expandButton: Button
    icon:
      component: Icon
      forwards:
        iconColor: color
    label:
      component: Text
      forwards:
        labelSelectedWeight: fontWeight
        fontFamily: fontFamily
        fontSize: fontSize
        lineHeight: lineHeight
    link: Link
    badge:
      component: Text
      forwards:
        badgeSize: fontSize
    emptyState: Text
  props:
    label:
      type: string
      a11yRole: accessible-name
      required: true
      description: What the tree lists ("Folders", "Categories"). Not visible unless
        `showLabel`.
      a11y: aria-label / accessibilityLabel on the tree.
    showLabel:
      type: boolean
      default: false
      description: Show the label as a Heading above the tree (then the tree is aria-labelledby
        it instead of aria-label).
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      default: '2'
      description: Heading level of the visible label in the page outline; its size
        is headingSize regardless. On React Native the level has no observable effect
        — Heading sets the header trait at every level and headingSize pins the size
        — so the prop is accepted and forwarded for parity only, as DataGrid's captionLevel.
    nodes:
      type: array
      required: true
      shape: 'TreeNode[] where TreeNode = { id: string; label: string; icon?: IconName;
        badge?: string; disabled?: boolean; href?: string; children?: TreeNode[] |
        "lazy" }'
      description: 'The hierarchy. `href` makes a node''s label a Link with `tone:
        inherit` nested inside the label Text, so it takes the label''s font and color
        (navigation trees); `icon` is an Icon glyph (`folder` and `file` exist for
        the usual case); `badge` is a short trailing count or status; `children: "lazy"`
        loads on first expand through `onExpand`.'
    expanded:
      type: array
      shape: string[]
      description: Controlled expanded ids. A still-`"lazy"` id here is held closed
        until the user opens it, exactly as in `defaultExpanded` — the id stays in
        the array the caller passed and in what onExpandChange reports, but the node
        does not render open and fires no onExpand.
      controls:
        event: onExpandChange
        default: defaultExpanded
    defaultExpanded:
      type: array
      shape: string[]
      description: Initially expanded ids. `["*"]` opens every node whose `children`
        is a non-empty array and never a `"lazy"` node, as TreeGrid; `"*"` is reserved
        as that sentinel, so it is never matched against an id — a node whose id is
        literally `"*"` is opened only as any other loaded parent is, and is never
        treated as explicitly listed (so a lazy one stays closed). The first user
        toggle resolves `"*"` to the concrete ids then open, and that resolved array
        is what onExpandChange reports, any held-lazy ids kept in place, as TreeGrid.
        A lazy id listed explicitly stays closed until the user opens it (onExpand
        only fires for user acts), and the same rule covers the controlled `expanded`.
    selectable:
      type: enum
      values:
      - none
      - single
      - multiple
      default: single
      description: '`single`: one current node (the usual for navigation and pickers).
        `multiple`: checkbox-like selection with Space, Shift+arrows and Ctrl+A; parents
        are checkboxes that cascade when `selectChildren`. `none`: expand/collapse
        only.'
    selected:
      type: array
      shape: string[]
      description: Controlled selected ids. Always an array, even in `single` mode
        (zero or one element).
      controls:
        event: onSelectionChange
        default: defaultSelected
    defaultSelected:
      type: array
      shape: string[]
      description: Initially selected ids.
    selectChildren:
      type: boolean
      default: false
      description: 'With `multiple`, selecting a parent selects its descendants and
        parents show indeterminate. The cascade covers loaded, enabled descendants
        only (a `"lazy"` subtree contributes nothing until loaded); a parent''s id
        is in `selected` exactly when all its enabled loaded descendants are, and
        unchecking any descendant removes it and every ancestor id. Its aria-checked
        (true, mixed, false) is derived from its descendants. A disabled node is skipped
        as a target but does not wall off its subtree: its enabled loaded descendants
        still cascade. A parent with no enabled loaded descendants at all (a still-lazy
        subtree, or only disabled children) behaves as a leaf and carries just its
        own id. Shift+ArrowDown/Up cascade like Space but only ever add — they never
        remove a node or an ancestor.'
    selectOnFocus:
      type: boolean
      default: false
      description: 'With `single`, moving focus also selects (a settings sidebar where
        the tree drives a panel). Moving focus means the keyboard — the arrows, Home,
        End and type-ahead; entering the tree with Tab and focus arriving from a pointer
        never select on their own (a click already selects, and mere entry should
        not report a selection change). Off by default: focus moves, Enter or Space
        selects.'
    showGuides:
      type: boolean
      default: true
      description: Vertical guide lines under open parents.
  events:
    onSelectionChange:
      description: Fired with the selected ids, in tree (document) order, and only
        when the set actually changes (Space on the already-selected node, or selectOnFocus
        landing on it, fires nothing).
      platforms:
        web: onSelectionChange
        lit: selection-change
        rn: onSelectionChange
        swiftui: onSelectionChange
      payload:
      - name: ids
        type: array
        shape: string[]
        description: Every selected id, as a bare array.
      fires:
      - user
    onExpandChange:
      description: Fired with the expanded ids, in the order they were opened.
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
      description: 'Fired with its id each time a node whose `children` is still `"lazy"`
        is opened, so a failed load can retry (as TreeGrid): closing and reopening
        the node fires it again, and replacing `children` is the only thing that stops
        it — it is not once per mount. It fires before the onExpandChange of the same
        act.'
      platforms:
        web: onExpand
        lit: expand
        rn: onExpand
        swiftui: onExpand
      payload:
      - name: id
        type: string
        description: The expanded node.
      fires:
      - user
    onActivate:
      description: Fired on Enter or double-click on a node (open the file, navigate),
        with its id. Nodes with `href` navigate instead.
      platforms:
        web: onActivate
        lit: activate
        rn: onActivate
        swiftui: onActivate
      payload:
      - name: id
        type: string
        description: The id of the activated node.
      fires:
      - user
  keyboard:
  - keys:
    - Tab
    action: Moves into the tree (to the selected node — the first selected in tree
      order when several are — else the first node) and out of it — one tab stop.
      Leaving the tree forgets which node was focused, so re-entry follows the same
      rule instead of restoring it. Every key in this table is handled by the nearest
      enclosing treeitem, so a key pressed while focus sits on a composed control
      inside a node (the chevron Button, an `href` Link — both tabindex=-1 but still
      focusable) still drives the tree.
    from: any
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - ArrowDown
    action: Next visible node.
    from: first
    expect: focus-next
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - ArrowUp
    action: Previous visible node.
    from: last
    expect: focus-prev
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - ArrowRight
    action: 'On a closed parent: opens it. On an open parent: moves to its first enabled
      child (disabled nodes are skipped). On a leaf: nothing.'
    from: inside
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - ArrowLeft
    action: 'On an open parent: closes it. Otherwise: moves to the parent; when the
      parent is disabled, focus stays put.'
    from: inside
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Home
    action: First node.
    from: last
    expect: focus-first
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - End
    action: Last visible node.
    from: first
    expect: focus-last
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Enter
    action: 'Activates the node (onActivate, or follows href); with `selectable: single`,
      also selects it first. An href node is followed by clicking its composed link
      (so the page''s click routing sees it) and does not fire onActivate.'
    from: inside
    expect: manual
  - keys:
    - ' '
    action: Selects (single) or toggles selection (multiple) of the focused node.
      On rn a tap on the row does this instead — Pressable has no key events.
    when: selectable
    from: inside
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - '*'
    action: Opens every enabled sibling of the focused node, the focused node included;
      lazy siblings open and fire onExpand.
    from: inside
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Shift+ArrowDown
    - Shift+ArrowUp
    action: Moves focus to the next / previous node and adds it to the selection (the
      APG rule; no anchor range). Outside `multiple` they act as plain arrows.
    when: multiple
    from: inside
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Control+a
    action: 'Adds every visible, enabled node at the current expansion state to the
      selection; nodes already selected inside a collapsed branch stay selected (the
      key never deselects). With `selectChildren` the parent invariant wins over that
      rule: a collapsed parent whose hidden descendants stay unselected is not added,
      so Ctrl+A is a no-op for it rather than breaking the invariant. Bound by key
      code KeyA, with Control or Meta (Cmd on macOS).'
    when: multiple
    from: inside
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - a-z
    action: 'Type-ahead: any printable character (letters, digits, punctuation) moves
      to the next visible node whose label starts with the typed characters; `*` and
      Space keep their own bindings and never enter the buffer. A fresh one-character
      buffer searches from the node after the focused one; a longer buffer may re-match
      the focused node (as Listbox). The buffer clears after 500 ms (literal-ok, as
      Listbox).'
    from: inside
    expect: manual
    platforms:
    - web
    - lit
    - swiftui
  styles:
    indent:
      token: space.5
      part: indent
      description: Per level on the node row.
      locked: false
    rowHeight:
      token: size.target.min
      locked: true
    rowPaddingInline:
      token: space.2
      locked: false
    rowRadius:
      token: radius.sm
      locked: false
    rowGap:
      token: layout.gap.tight
      description: Between the expand button, icon, label and badge; the checkbox
        is followed by checkboxGap instead.
      locked: false
    rowHover:
      token: color.action.ghost.backgroundHover
      state: hover
      description: On native it is the pressed fill (and the react-native-web hover),
        swapped instantly; a selected row keeps rowSelected.
      locked: false
    rowSelected:
      token: color.background.strong
      description: Fill on the selected node, and on aria-checked="true" nodes in
        multiple mode. An indeterminate (mixed) parent gets neither this fill nor
        the start-edge bar — its dash glyph is the only signal.
      locked: true
    rowSelectedBorder:
      token: color.control.selectedBackground
      description: Start-edge bar on the selected (or checked) node, as Table and
        DataGrid. Drawn over the row at the logical start and mirrored in RTL, by
        whichever means the platform has that does not move the content (an inset
        shadow on the row, or an absolutely positioned box).
      locked: true
    rowSelectedBorderWidth:
      token: border.width.focus
      locked: true
    labelColor:
      token: color.foreground
      part: label
      description: The label Text's default tone; Text.color is locked, so it is not
        forwarded.
      locked: true
    labelSelectedWeight:
      token: font.weight.medium
      part: label
      description: Forwarded to the label Text as `overrides.fontWeight` when selected.
        When a node has `href` the label Text only wraps the composed link and the
        weight is not forwarded, so a selected navigation node is marked by the row
        rather than by heavier text.
      locked: false
    headingSize:
      token: font.size.md
      part: heading
      description: 'The visible label Heading; forwarded as `overrides.fontSize`,
        which is what the label actually renders at. The Heading is composed at `size:
        md`, the size this token matches, so the two agree at the default and an override
        of headingSize alone moves the rendered size without moving the Heading''s
        own `size`. The gap below it is the Heading''s own marginBlockEnd.'
      locked: false
    iconColor:
      token: color.foreground.muted
      part: icon
      locked: true
    badgeColor:
      token: color.foreground.muted
      part: badge
      description: The badge Text's `tone="muted"`; Text.color is locked, so it is
        not forwarded.
      locked: true
    badgeSize:
      token: font.size.xs
      part: badge
      description: Forwarded to the badge Text as `overrides.fontSize`.
      locked: false
    expandButtonSize:
      token: size.target.min
      part: expandButton
      description: The `expandButton` part is a wrapper the tree owns, this size on
        both axes, around an unmodified ghost Button centred inside it (Button has
        no size override and keeps its own data-part, and a `sm` Button is smaller
        than this, so the target is the wrapper, not the Button); the chevron takes
        the Button's own color. TreeGrid's expandButton is the same wrapper-around-a-Button
        shape.
      locked: true
    guideLine:
      token: color.border
      description: One vertical line per open parent, drawn down that parent's group,
        at rowPaddingInline + indent × (parent level − 1) + expandButtonSize / 2 from
        the row's start — the centre of that parent's chevron. No elbows, no termination
        at the last child, as TreeGrid.
      locked: false
    guideLineWidth:
      token: border.width.thin
      locked: false
    checkboxGap:
      token: layout.gap.tight
      part: checkbox
      description: In multiple mode the row reads chevron, checkbox, icon, label,
        badge; this is the gap after the checkbox, so on a node with an icon it falls
        between the checkbox and the icon. Every other gap in the row is rowGap, which
        means the row is two nested groups rather than one gap (checkbox beside the
        rest at checkboxGap; chevron, icon, label and badge at rowGap) — one flex
        gap cannot differ per pair. In `single` and `none` no checkbox renders and
        this binding has no effect.
      locked: false
    checkboxSize:
      token: space.4
      part: checkbox
      description: The drawn checkbox glyph in multiple mode (the treeitem is the
        control; no Checkbox component).
      locked: false
    checkboxBorder:
      token: color.control.border
      part: checkbox
      description: Unchecked edge; checked or mixed, the border takes checkboxSelected
        so the fill has no contrasting edge.
      locked: true
    checkboxBorderWidth:
      token: border.width.thin
      part: checkbox
      locked: false
    checkboxBackground:
      token: color.control.background
      part: checkbox
      locked: false
    checkboxSelected:
      token: color.control.selectedBackground
      part: checkbox
      description: Fill when checked or indeterminate.
      locked: true
    checkboxMark:
      token: color.control.selectedForeground
      part: checkbox
      description: The check or dash Icon on the fill.
      locked: true
    checkboxRadius:
      token: radius.sm
      part: checkbox
      locked: false
    fontFamily:
      token: font.family.body
      description: Sets the container's font, and the resolved value (the override
        when there is one, the token otherwise) is always forwarded to the label Text
        as `overrides.fontFamily`, so the root hook and the composed label never disagree.
        The lazy placeholder and the empty-state Text take the same three resolved
        values at `tone="muted"`; a platform with no inherited font (React Native)
        forwards them there too rather than leaving Text's own defaults.
      locked: false
    fontSize:
      token: font.size.sm
      description: The container's size and, resolved the same way, the label Text's
        `overrides.fontSize`.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      description: The container's line height and, resolved the same way, the label
        Text's `overrides.lineHeight`.
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    focusRing:
      token: color.border.focus
      description: 'Drawn around the whole `node` — the chevron included, since the
        row is one visual target — not around nodeRow alone. It follows the treeitem''s
        own focus only: where the chevron Button is a focus target of its own (react-native-web),
        focusing it shows the Button''s own treatment and leaves the node''s ring
        unlit.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      description: Chevron rotation, and the row hover where the platform has one
        to animate (web and Lit); groups appear instantly, and the native pressed
        fill is swapped instantly as rowHover says. The collapsed chevron is mirrored
        in RTL.
      locked: false
  constants:
    typeaheadReset:
      description: How long typed characters accumulate before the typeahead buffer
        clears. Read on web, lit and swiftui only — there is no type-ahead on rn,
        so no rn code reads it.
      value: 500
      unit: ms
  copy:
    expand: Expand {label}
    collapse: Collapse {label}
    selectedCount:
      text: '{count} selected'
      params:
        count:
          type: number
          description: How many nodes are selected.
    loading: Loading
    empty: Nothing here.
  a11y:
    role: tree
    requires:
    - accessible-name
    - keyboard-operable
    - arrow-navigation
    - roving-tabindex
    - expanded-state
    - selected-state
    - focus-visible
    - contrast-aa
    - target-24px
    - live-region
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground
      background: color.background.strong
      level: AA
    - foreground: color.foreground.muted
      background: color.background.strong
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.border
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.selectedForeground
      background: color.control.selectedBackground
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=tree
      - role=treeitem
      - role=group
      - aria-expanded
      - aria-selected
      - aria-checked
      - aria-level
      - aria-setsize
      - aria-posinset
      - aria-multiselectable
      - aria-label
      - aria-busy
      - aria-disabled
      - tabindex
      notes: 'A <div data-ds="Tree" data-part="container"> holding the Heading when
        showLabel and the <ul role="tree" aria-labelledby={headingId} | aria-label
        aria-multiselectable> of <li role="treeitem" aria-level aria-setsize aria-posinset
        aria-expanded (parents only) aria-selected|aria-checked> whose children are
        in a nested <ul role="group">. Roving tabindex on the treeitems (one tab stop;
        the item, not the row div, is focused); no aria-activedescendant. The <ul
        role="tree"> has no data-part (address it by role). The expand chevron is
        a Button with tabindex=-1 — ArrowLeft/Right are the keyboard path — and it
        stays exposed to assistive technology, named copy.expand/collapse: aria-hidden
        over a focusable control is an axe failure, and tabindex=-1 takes an element
        out of the tab order without taking it out of focus. Because the chevron is
        exposed, a treeitem is named explicitly rather than from its contents (which
        would read "Expand Documents Documents"): aria-label is the node''s `label`,
        or `{label}, {badge}` when it has a badge — the text rn announces, less the
        level, which aria-level already carries. On a disabled node the chevron is
        disabled too, and clicks on a disabled row do nothing (a disabled parent stays
        closed, so do not disable a parent whose children must stay reachable). Heading,
        Button and Icon keep their own data-part, so the `heading`, `expandButton`
        and `icon` parts are wrappers the tree owns around the composed component
        (a `<span data-part="icon">` around the Icon, which writes its own `data-part="glyph"`);
        Link keeps its own `data-part="anchor"` too, so the `link` part is a `<span
        data-part="link">` the tree owns around it (activation finds the anchor inside
        that span); Text takes data-part directly. Nodes with href render the label
        as a Link inside the treeitem, and the composed Link takes tabindex=-1 so
        the treeitem stays the only tab stop; Enter activates it by clicking the anchor.
        The tree''s own label Text is the outer `data-part="label"`; the Link nested
        inside it keeps its own inner parts, which a part locator resolves after the
        tree''s. In single mode aria-selected is on every node ("false" when unselected,
        so a screen reader hears the state on each one), and in multiple mode aria-checked
        is on every node. Multiple mode uses aria-checked with an indeterminate value
        for cascading parents and a Checkbox glyph (not the Checkbox component: the
        treeitem itself is the control). Type-ahead buffers keys for 500 ms. Pointer:
        click on a node focuses it and does what Space does (select in single, toggle
        in multiple); double-click does what Enter does, and a click whose `detail`
        is 2 or more does not toggle again (a double-click toggles once, then activates);
        click on the chevron toggles expansion and focuses the node without changing
        selection. Lazy placeholder: a <li role="treeitem" aria-disabled="true"> holding
        copy.loading inside the group, not navigable, with no data-part, and aria-busy
        on the parent treeitem. Empty `nodes`: the <ul> renders with no items and
        copy.empty is a `Text tone="muted"` below it inside the container.'
    lit:
      tag: ds-tree
      reflect:
      - selectable
      - select-children
      - select-on-focus
      - prop: showGuides
        attribute: hide-guides
      - show-label
      - heading-level
      notes: '`nodes` as a property rendered in the shadow root; roving tabindex over
        shadow treeitems; composed events. ds-link is composed for href nodes. A tabindex
        on a custom-element host does not reach the child''s inner control, so every
        composed ds-link and ds-button inside a treeitem has its own inner `<a>`/`<button>`
        demoted to tabindex="-1" after each render (as TreeGrid does for cell controls);
        otherwise the tree would have a tab stop per node. The chevron is exposed
        and named, never aria-hidden, and each treeitem carries the same explicit
        aria-label as on web — a name built from text, not from ids, which do not
        cross shadow roots. The `heading`, `expandButton`, `link` and `icon` parts
        are the same tree-owned wrappers as on web, so a part locator finds the same
        element shape on both (ds-icon''s glyph part lives in its own shadow root
        and is not that hook). `showGuides` defaults true, so its attribute is the
        negated `hide-guides`. Forwarded bindings reach the composed ds-text / ds-heading
        / ds-icon through their `overrides` property only, so a consumer''s CSS on
        a forwarded --ds-tree-* hook does not reach the child; override them through
        `overrides`, and a binding that is only ever forwarded (labelSelectedWeight,
        headingSize, badgeSize) gets no --ds-tree-* hook at all, since it would be
        dead CSS. fontFamily, fontSize and lineHeight keep a hook, because they also
        style the container, and are forwarded resolved. Composed events carry bare
        detail values — `selection-change` and `expand-change` the string[] itself,
        `expand` and `activate` the id string — not objects, as TreeGrid.'
    rn:
      element: FlatList
      props:
      - accessibilityRole=list
      - accessibilityLabel
      notes: 'A FlatList over the flattened visible nodes; the list itself is accessibilityRole="list",
        and each item the list renders — the lazy placeholder and the empty state
        included — is a View of accessibilityRole="listitem" holding the row, since
        react-native-web renders the list as a real <ul>, which may own only listitems
        (as Table). Inside that View each row is a Pressable with accessibilityRole="button"
        (or "link" for href), accessibilityState={{ expanded, selected, checked, disabled
        }}, accessibilityLabel "{label}, level {n}" — with the badge folded in when
        the node has one ("{label}, {badge}, level {n}"), since the label replaces
        the row''s rendered content for a screen reader — and accessibilityActions
        expand/collapse. The lazy placeholder is its own row whose label is copy.loading
        and nothing else: it is not a node, so it carries no level, unlike TreeGrid''s
        placeholder, which is a navigable row and announces one. The `link` part is
        a View inside the label Text, mirroring web''s span around the composed Link,
        so the part resolves on every platform. `disabled` nodes carry aria-disabled
        on the DOM node directly on react-native-web (it does not emit it from accessibilityState),
        as Button and Listbox do. Multiple mode draws the checkbox glyph (checkbox*
        bindings, accessibilityState.checked) inside the same Pressable — not the
        Checkbox component — so the row stays one target and Enter-equivalent activation
        and href still work: a tap toggles selection, a long press activates. A screen
        reader''s activate gesture lands on the tap, which in that mode toggles selection,
        so in multiple mode the row also carries the standard `longpress` accessibility
        action (no label needed; a custom `activate` would take over the double-tap)
        calling the same handler as a long press — otherwise there would be no non-gestural
        way to follow a node. In `single` a tap does what Enter does (selects, then
        activates); in `none` a tap only activates and does not toggle expansion.
        `href` is followed with `Linking.openURL` by the row itself (the composed
        Link gets an onPress that returns false, so a tap on its text acts like the
        rest of the row); on native an href must be an absolute URL, because `Linking.openURL`
        cannot open an app-relative path, and apps with in-app routes use onActivate
        instead of href (an app-relative href is a web and lit affordance). The root
        View is the `container` (holding the Heading and the FlatList); `group` has
        no element. `selectOnFocus` is wired to the Pressable''s onFocus (hardware
        keyboard and assistive-technology focus). No arrow keys, no type-ahead, no
        `*` and no expand-all action; the expand chevron is a real target, accessible
        and named with copy.expand/collapse. React Native gives View and Pressable
        no key events, so Tab, Home, End, Space and Control+a have no native path
        either — a tap stands in for Space and Enter, and the expand/collapse actions
        for the arrows. There is no tabIndex on native, so the roving tabindex and
        the one-tab-stop rule are web, lit and swiftui only; on react-native-web every
        row Pressable and chevron Button is its own tab stop, and the accessibility
        path is the row''s accessibilityState plus its expand/collapse actions rather
        than focus order. The anchor react-native-web renders for an `href` label
        is demoted to tabindex=-1 there, as on web: it would otherwise be a second
        tab stop inside the row and a target smaller than the minimum. Focusing the
        chevron does not light the node''s focusRing; only the row''s own focus does.
        There is no role="status" either: copy.selectedCount goes in a one-point View
        with accessibilityLiveRegion="polite" on Android and through AccessibilityInfo.announceForAccessibility
        on iOS, on each fired selection change — that pairing is the rn form of every
        live-region requirement in this doc. copy.empty is the FlatList''s empty component,
        so it renders inside the list rather than beside it.'
    swiftui:
      element: ScrollView
      props:
      - ScrollView
      - LazyVStack
      - Button
      - .accessibilityValue=expanded
      - .accessibilityAddTraits=isSelected
      - .accessibilityAction
      - .focusable
      - .onMoveCommand
      - .onKeyPress
      - '@FocusState'
      - Link
      notes: A `ScrollView` + `LazyVStack` over the flattened visible nodes (no nested
        group views), each row a `Button` (or `Link` for `href`) with indent, the
        chevron `Button` (`.accessibilityHidden`, real touch target), `Icon`, `Text`,
        badge `Text`; `.accessibilityValue` combines 'level {n}' and expanded/collapsed,
        `.isSelected` for selection, `.accessibilityValue(checked/unchecked/mixed)`
        in `multiple` mode where the drawn checkbox glyph lives inside the same row
        (never the Checkbox component; a tap toggles, a long press activates). Custom
        actions expand/collapse; the tree is one focus section on iPad with the full
        keyboard table including type-ahead through `.onKeyPress(characters:)`. `selectedCount`
        announced in multiple mode; the optional `Heading` names the tree.
  behavior:
  - name: the-expand-button-expands-a-node
    given:
      defaultExpanded: []
      nodes:
      - id: docs
        label: Documents
        children:
        - id: invoices
          label: Invoices
    when:
      click: expandButton
    then:
    - event: onExpandChange
  - name: expanding-a-lazy-node-asks-for-its-children
    description: 'children: "lazy" loads on first expand through onExpand.'
    given:
      defaultExpanded: []
      nodes:
      - id: docs
        label: Documents
        children: lazy
    when:
      click: expandButton
    then:
    - event: onExpand
    - event: onExpandChange
  - name: clicking-a-node-selects-it
    description: 'Only the selection is asserted, because it is what every platform
      reports: on rn the same tap also activates, a tap doing what Enter does in `single`
      mode.'
    given:
      selectable: single
      nodes:
      - id: docs
        label: Documents
      - id: media
        label: Media
    when:
      click: nodeRow
    then:
    - event: onSelectionChange
  - name: space-selects-the-focused-node
    given:
      selectable: single
      nodes:
      - id: docs
        label: Documents
      - id: media
        label: Media
    when:
      key: Space
    then:
    - event: onSelectionChange
    platforms:
    - web
    - lit
  - name: enter-activates-a-node
    description: Enter activates the node (onActivate, or follows href); with selectable
      single it also selects it.
    given:
      nodes:
      - id: docs
        label: Documents
      - id: media
        label: Media
    when:
      key: Enter
    then:
    - event: onActivate
    platforms:
    - web
    - lit
  - name: arrow-movement-does-not-select-by-default
    description: 'selectOnFocus is off by default: focus moves, Enter or Space selects.'
    given:
      selectable: single
      selectOnFocus: false
      nodes:
      - id: docs
        label: Documents
      - id: media
        label: Media
    when:
      key: ArrowDown
    then:
    - event: onSelectionChange
      fired: false
    platforms:
    - web
    - lit
  - name: select-on-focus-selects-as-focus-moves
    description: With single and selectOnFocus, moving focus also selects - a sidebar
      whose tree drives a panel.
    given:
      selectable: single
      selectOnFocus: true
      nodes:
      - id: docs
        label: Documents
      - id: media
        label: Media
    when:
      key: ArrowDown
    then:
    - event: onSelectionChange
    platforms:
    - web
    - lit
  - name: a-collapsed-parent-reports-it
    given:
      defaultExpanded: []
      nodes:
      - id: docs
        label: Documents
        children:
        - id: invoices
          label: Invoices
    then:
    - attribute: aria-expanded
      is: 'false'
      'on': node
    platforms:
    - web
  - name: an-expanded-parent-reports-it
    given:
      defaultExpanded:
      - docs
      nodes:
      - id: docs
        label: Documents
        children:
        - id: invoices
          label: Invoices
    then:
    - attribute: aria-expanded
      is: 'true'
      'on': node
    platforms:
    - web
  - name: a-selected-node-is-marked-selected
    given:
      selectable: single
      selected:
      - docs
      nodes:
      - id: docs
        label: Documents
      - id: media
        label: Media
    then:
    - attribute: aria-selected
      is: 'true'
      'on': node
    platforms:
    - web
  - name: the-empty-message-shows-when-there-are-no-nodes
    given:
      nodes: []
    then:
    - copy: empty
  examples:
  - name: folder-tree
    description: The everyday file tree, one branch open, each node with its glyph.
    given:
      label: Folders
      defaultExpanded:
      - docs
      nodes:
      - id: docs
        label: Documents
        icon: folder
        children:
        - id: invoices
          label: Invoices
          icon: file
        - id: contracts
          label: Contracts
          icon: file
      - id: media
        label: Media
        icon: folder
        children: lazy
  - name: navigation-sidebar
    description: A settings sidebar whose visible heading names it and whose selection
      drives the panel beside it.
    given:
      label: Settings sections
      showLabel: true
      headingLevel: '2'
      selectOnFocus: true
      nodes:
      - id: account
        label: Account
        href: /settings/account
      - id: billing
        label: Billing
        href: /settings/billing
  - name: category-picker-with-cascade
    description: Multi-select categories where choosing a parent chooses everything
      under it.
    given:
      label: Categories
      selectable: multiple
      selectChildren: true
      defaultExpanded:
      - '*'
      nodes:
      - id: clothing
        label: Clothing
        children:
        - id: shirts
          label: Shirts
        - id: shoes
          label: Shoes
  - name: read-only-site-map
    description: A tree that only expands and collapses, with counts after each branch.
    given:
      label: Site map
      selectable: none
      nodes:
      - id: guides
        label: Guides
        badge: '12'
        children:
        - id: start
          label: Getting started
      - id: api
        label: API
        badge: '48'
        children: lazy
```

## Events

- `onSelectionChange`: emit `onSelectionChange`
  - payload, positional, in this order: `ids: string[]`
  - fires on: user
- `onExpandChange`: emit `onExpandChange`
  - payload, positional, in this order: `ids: string[]`
  - fires on: user
- `onExpand`: emit `onExpand`
  - payload, positional, in this order: `id: string`
  - fires on: user
- `onActivate`: emit `onActivate`
  - payload, positional, in this order: `id: string`
  - fires on: user

## Controlled state

- `expanded` is controlled when given, uncontrolled from `defaultExpanded` when omitted; changes reported by `onExpandChange` (emit `onExpandChange`)
- `selected` is controlled when given, uncontrolled from `defaultSelected` when omitted; changes reported by `onSelectionChange` (emit `onSelectionChange`)

## Parts and slots

- `container`: element
- `heading`: component `Heading`; forwards `headingSize` → `overrides.fontSize`
- `node`: element
- `nodeRow`: element
- `expandButton`: component `Button`
- `indent`: element
- `icon`: component `Icon`; forwards `iconColor` → `overrides.color`
- `label`: component `Text`; forwards `labelSelectedWeight` → `overrides.fontWeight`, `fontFamily` → `overrides.fontFamily`, `fontSize` → `overrides.fontSize`, `lineHeight` → `overrides.lineHeight`
- `link`: component `Link`
- `badge`: component `Text`; forwards `badgeSize` → `overrides.fontSize`
- `checkbox`: element
- `group`: element
- `emptyState`: component `Text`

## Style bindings

- `indent`: token `space.5`; part `indent`
- `rowHover`: token `color.action.ghost.backgroundHover`; state `hover`
- `labelColor`: token `color.foreground`; part `label`; locked
- `labelSelectedWeight`: token `font.weight.medium`; part `label`
- `headingSize`: token `font.size.md`; part `heading`
- `iconColor`: token `color.foreground.muted`; part `icon`; locked
- `badgeColor`: token `color.foreground.muted`; part `badge`; locked
- `badgeSize`: token `font.size.xs`; part `badge`
- `expandButtonSize`: token `size.target.min`; part `expandButton`; locked
- `checkboxGap`: token `layout.gap.tight`; part `checkbox`
- `checkboxSize`: token `space.4`; part `checkbox`
- `checkboxBorder`: token `color.control.border`; part `checkbox`; locked
- `checkboxBorderWidth`: token `border.width.thin`; part `checkbox`
- `checkboxBackground`: token `color.control.background`; part `checkbox`
- `checkboxSelected`: token `color.control.selectedBackground`; part `checkbox`; locked
- `checkboxMark`: token `color.control.selectedForeground`; part `checkbox`; locked
- `checkboxRadius`: token `radius.sm`; part `checkbox`

## Keyboard

- `Tab` (Moves into the tree (to the selected node — the first selected in tree order when several are — else the first node) and out of it — one tab stop. Leaving the tree forgets which node was focused, so re-entry follows the same rule instead of restoring it. Every key in this table is handled by the nearest enclosing treeitem, so a key pressed while focus sits on a composed control inside a node (the chevron Button, an `href` Link — both tabindex=-1 but still focusable) still drives the tree.): expect manual
- `ArrowDown` (Next visible node.): expect focus-next
- `ArrowUp` (Previous visible node.): expect focus-prev
- `ArrowRight` (On a closed parent: opens it. On an open parent: moves to its first enabled child (disabled nodes are skipped). On a leaf: nothing.): expect manual
- `ArrowLeft` (On an open parent: closes it. Otherwise: moves to the parent; when the parent is disabled, focus stays put.): expect manual
- `Home` (First node.): expect focus-first
- `End` (Last visible node.): expect focus-last
- ` ` (Selects (single) or toggles selection (multiple) of the focused node. On rn a tap on the row does this instead — Pressable has no key events.): expect manual
- `*` (Opens every enabled sibling of the focused node, the focused node included; lazy siblings open and fire onExpand.): expect manual
- `Shift+ArrowDown`, `Shift+ArrowUp` (Moves focus to the next / previous node and adds it to the selection (the APG rule; no anchor range). Outside `multiple` they act as plain arrows.): expect manual
- `Control+a` (Adds every visible, enabled node at the current expansion state to the selection; nodes already selected inside a collapsed branch stay selected (the key never deselects). With `selectChildren` the parent invariant wins over that rule: a collapsed parent whose hidden descendants stay unselected is not added, so Ctrl+A is a no-op for it rather than breaking the invariant. Bound by key code KeyA, with Control or Meta (Cmd on macOS).): expect manual
- `a-z` (Type-ahead: any printable character (letters, digits, punctuation) moves to the next visible node whose label starts with the typed characters; `*` and Space keep their own bindings and never enter the buffer. A fresh one-character buffer searches from the node after the focused one; a longer buffer may re-match the focused node (as Listbox). The buffer clears after 500 ms (literal-ok, as Listbox).): expect manual

## Copy

- `expand`: "Expand {label}"
- `collapse`: "Collapse {label}"
- `selectedCount`: "{count} selected"; params `count` (number)
- `loading`: "Loading"
- `empty`: "Nothing here."

## Constants and examples

- constant `typeaheadReset`: 500 ms
- example `folder-tree`, story `FolderTree`: given `label: "Folders"`, `defaultExpanded: ["docs"]`, `nodes: [{"id":"docs","label":"Documents","icon":"folder","children":[{"id":"invoices","label":"Invoices","icon":"file"},{"id":"contracts","label":"Contracts","icon":"file"}]},{"id":"media","label":"Media","icon":"folder","children":"lazy"}]`; The everyday file tree, one branch open, each node with its glyph.
- example `navigation-sidebar`, story `NavigationSidebar`: given `label: "Settings sections"`, `showLabel: true`, `headingLevel: "2"`, `selectOnFocus: true`, `nodes: [{"id":"account","label":"Account","href":"/settings/account"},{"id":"billing","label":"Billing","href":"/settings/billing"}]`; A settings sidebar whose visible heading names it and whose selection drives the panel beside it.
- example `category-picker-with-cascade`, story `CategoryPickerWithCascade`: given `label: "Categories"`, `selectable: "multiple"`, `selectChildren: true`, `defaultExpanded: ["*"]`, `nodes: [{"id":"clothing","label":"Clothing","children":[{"id":"shirts","label":"Shirts"},{"id":"shoes","label":"Shoes"}]}]`; Multi-select categories where choosing a parent chooses everything under it.
- example `read-only-site-map`, story `ReadOnlySiteMap`: given `label: "Site map"`, `selectable: "none"`, `nodes: [{"id":"guides","label":"Guides","badge":"12","children":[{"id":"start","label":"Getting started"}]},{"id":"api","label":"API","badge":"48","children":"lazy"}]`; A tree that only expands and collapses, with counts after each branch.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `indent`, `rowPaddingInline`, `rowRadius`, `rowGap`, `rowHover`, `labelSelectedWeight`, `headingSize`, `badgeSize`, `guideLine`, `guideLineWidth`, `checkboxGap`, `checkboxSize`, `checkboxBorderWidth`, `checkboxBackground`, `checkboxRadius`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `rowHeight`, `rowSelected`, `rowSelectedBorder`, `rowSelectedBorderWidth`, `labelColor`, `iconColor`, `badgeColor`, `expandButtonSize`, `checkboxBorder`, `checkboxSelected`, `checkboxMark`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: ScrollView
props:
- ScrollView
- LazyVStack
- Button
- .accessibilityValue=expanded
- .accessibilityAddTraits=isSelected
- .accessibilityAction
- .focusable
- .onMoveCommand
- .onKeyPress
- '@FocusState'
- Link
notes: A `ScrollView` + `LazyVStack` over the flattened visible nodes (no nested group
  views), each row a `Button` (or `Link` for `href`) with indent, the chevron `Button`
  (`.accessibilityHidden`, real touch target), `Icon`, `Text`, badge `Text`; `.accessibilityValue`
  combines 'level {n}' and expanded/collapsed, `.isSelected` for selection, `.accessibilityValue(checked/unchecked/mixed)`
  in `multiple` mode where the drawn checkbox glyph lives inside the same row (never
  the Checkbox component; a tap toggles, a long press activates). Custom actions expand/collapse;
  the tree is one focus section on iPad with the full keyboard table including type-ahead
  through `.onKeyPress(characters:)`. `selectedCount` announced in multiple mode;
  the optional `Heading` names the tree.
```

## Guidance

## Overview

A tree is a list that knows about nesting. One field per node, arrows to move and open, Enter to act: the shape of a file browser's sidebar, a category picker, a documentation site's navigation. When nodes need several fields, it becomes a TreeGrid.

## When to use

Use a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product categories, an org's departments. `single` selection with `href` nodes is a navigation tree; `multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only when the tree drives a panel beside it and moving through nodes should preview them.

## When not to use

Do not use a Tree for one level (a Listbox or a list of Links), for nodes with several fields (TreeGrid), or as a Menu (a Menu closes after a choice; a tree stays). Do not use it for a hierarchy most people need entirely visible — render nested headings and lists instead.

## Behavior

ArrowUp/Down move through visible nodes; ArrowRight opens a closed parent or steps into an open one; ArrowLeft closes or steps up; `*` opens all siblings; typing jumps by label. Enter activates (navigates for `href`, otherwise `onActivate`) and, in single mode, selects. Space selects or toggles; in multiple mode Shift+arrows extend and Ctrl+A selects all visible. Lazy nodes load when opened, with a placeholder child; onExpand fires before onExpandChange. Because a lazy id is held closed until a user opens it, the placeholder and its parent's busy state only ever exist after an interaction: no static example shows them, and they are covered by tests rather than by a story. When a controlled `expanded` change closes an ancestor of the focused node, focus moves up to that ancestor, as TreeGrid does — it is never dropped to the document. Disabled nodes are visible, skipped by arrows, not selectable, and cannot be expanded by any means — the keyboard never reaches them and their chevron is disabled — so a disabled parent's children are unreachable: never disable a parent whose children must stay reachable. Selection and expansion are both controlled-or-uncontrolled and reported through events; `selected` is always an array. With the pointer, click selects or toggles and focuses, double-click activates, and the chevron only expands. Touch has no double-tap equivalent, so on native a tap activates in `selectable: none` while web and lit keep activation on double-click and Enter — the one place the pointer and the tap disagree. The heading, when shown, is a composed Heading at `headingLevel` sized by headingSize and names the tree.

## Content guidelines

Labels are short nouns; nesting supplies the context, so "Invoices" not "Billing – Invoices". Use `icon` consistently per node type (folder/file) or not at all; use `badge` for counts that help choose ("12"). Open the first level by default in navigation trees so the structure is visible.

## Accessibility

The tree is a `tree` of `treeitem`s with `group`s for children, each item exposing level, position in set, set size, expanded state on parents, and selected or checked state (WCAG 1.3.1, 4.1.2; APG tree view). It is one tab stop with a roving tabindex and full arrow-key movement, type-ahead included (2.1.1, 2.4.3). Expansion is operable from the item itself, so the chevron is a pointer and screen-reader convenience rather than the keyboard path — it keeps tabindex=-1, but it stays exposed and named (aria-hidden over a focusable control is a failure of its own), which is why each item is named explicitly instead of from its contents (2.1.1, 4.1.2). Selection shows as a fill plus a start-edge bar (1.4.1) and rows meet the minimum target (2.5.8) — the row is what meets it: a label's line box is fontSize × lineHeight, smaller than the minimum by construction, so inline text inside a row is never its own target or tab stop. A disabled node is an inactive component: disabledOpacity puts its text below the ratios listed above, which 1.4.3 exempts, so the contrast pairs here are claims about enabled nodes. In multiple mode the count is announced (4.1.3): copy.selectedCount goes to a visually hidden role="status" region, rendered in multiple mode only. The region exists from mount and always holds the current count (an empty tree reads "0 selected"), so nothing is announced at mount; its text is derived from the current selection, so a controlled `selected` change updates it as a user act does, and it is never forced to re-announce, which means two different selections that yield the same string ("1 selected") are announced once (on iOS, where the announcement is an explicit call rather than a region, only user acts announce). Expanding and collapsing announce nothing beyond the item's own expanded state. The roving tabindex and the one-tab-stop rule are web, lit and swiftui; React Native has no tabIndex, so there the row's accessibilityState and its expand/collapse actions carry the same information.

## Platform notes

### Web
Render `<div data-ds="Tree">` holding the optional `Heading level={headingLevel}` and `<ul role="tree" aria-labelledby|aria-label aria-multiselectable>` with `<li role="treeitem" id aria-level aria-setsize aria-posinset aria-expanded? aria-selected|aria-checked tabIndex={roving}>` containing the row `<div>` (indent as `padding-inline-start`, the chevron `Button` `ghost sm iconOnly tabIndex={-1}` named by `copy.expand`/`copy.collapse` and never `aria-hidden`, the optional `Icon` inside a tree-owned `<span data-part="icon">`, the label `Text` or `Link`, the badge `Text tone="muted"` with `overrides.fontSize` from badgeSize, and in multiple mode the drawn checkbox `<span aria-hidden>` from the checkbox* bindings with a `check`/`dash` Icon) and, when expanded, `<ul role="group">` of child items. Keydown on the tree implements the table over the flattened visible list; focus moves to the item. Guide lines are a `::before` on groups, hidden with `showGuides: false`. Lazy: on each expand of a still-lazy node fire `onExpand`, render the placeholder item (`aria-disabled`, not navigable) with `copy.loading` and `aria-busy` on the parent.

### Lit
`<ds-tree label="Folders" .nodes=${nodes} selectable="multiple" select-children></ds-tree>`; shadow tree; composed `selection-change`, `expand-change`, `expand`, `activate`.

### React Native
`FlatList` over the flattened visible nodes; rows are `Pressable`s with indent, chevron `Button`, `Icon`, `Text`, badge; `accessibilityState` and `accessibilityActions` as noted; multiple mode draws the checkbox glyph inside the row from the checkbox* bindings (`View` + `Icon`), never the Checkbox component. Groups have no wrapper on native: visible children are flattened into the one list, as TreeGrid.

## Related

TreeGrid, Listbox, Disclosure, Accordion, Link, Menu.

## Behavior scenarios (12)

One test per scenario, in this order.

```yaml
- name: the-expand-button-expands-a-node
  given:
    defaultExpanded: []
    nodes:
    - id: docs
      label: Documents
      children:
      - id: invoices
        label: Invoices
  when:
    click: expandButton
  then:
  - event: onExpandChange
- name: expanding-a-lazy-node-asks-for-its-children
  description: 'children: "lazy" loads on first expand through onExpand.'
  given:
    defaultExpanded: []
    nodes:
    - id: docs
      label: Documents
      children: lazy
  when:
    click: expandButton
  then:
  - event: onExpand
  - event: onExpandChange
- name: clicking-a-node-selects-it
  description: 'Only the selection is asserted, because it is what every platform
    reports: on rn the same tap also activates, a tap doing what Enter does in `single`
    mode.'
  given:
    selectable: single
    nodes:
    - id: docs
      label: Documents
    - id: media
      label: Media
  when:
    click: nodeRow
  then:
  - event: onSelectionChange
- name: the-empty-message-shows-when-there-are-no-nodes
  given:
    nodes: []
  then:
  - copy: empty
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-heading-level-2
  given:
    headingLevel: '2'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-3
  given:
    headingLevel: '3'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-4
  given:
    headingLevel: '4'
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
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
