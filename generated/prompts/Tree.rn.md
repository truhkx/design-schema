# Generate: Tree for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Tree.tsx` exporting a typed React Native function component named `Tree`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `TreeProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Tree> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Tree.test.tsx`.

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
        is headingSize regardless.
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
      description: Controlled expanded ids.
      controls:
        event: onExpandChange
        default: defaultExpanded
    defaultExpanded:
      type: array
      shape: string[]
      description: Initially expanded ids. `["*"]` opens every node whose `children`
        is a non-empty array and never a `"lazy"` node, as TreeGrid; a lazy id listed
        explicitly stays closed until the user opens it (onExpand only fires for user
        acts).
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
      description: With `multiple`, selecting a parent selects its descendants and
        parents show indeterminate. The cascade covers loaded, enabled descendants
        only (a `"lazy"` subtree contributes nothing until loaded); a parent's id
        is in `selected` exactly when all its enabled loaded descendants are, and
        unchecking any descendant removes it and every ancestor id. Its aria-checked
        (true, mixed, false) is derived from its descendants. Shift+ArrowDown/Up cascade
        like Space.
    selectOnFocus:
      type: boolean
      default: false
      description: 'With `single`, moving focus also selects (a settings sidebar where
        the tree drives a panel). Off by default: focus moves, Enter or Space selects.'
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
      description: Fired with its id each time a node whose `children` is still `"lazy"`
        is opened, so a failed load can retry (as TreeGrid); once the caller replaces
        `children` it never fires again. It fires before the onExpandChange of the
        same act.
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
    action: Moves into the tree (to the selected node, else the first) and out of
      it — one tab stop.
    from: any
    expect: manual
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
  - keys:
    - End
    action: Last visible node.
    from: first
    expect: focus-last
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
    when: selectable
    from: inside
    expect: manual
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
    action: Selects every visible, enabled node at the current expansion state; bound
      by key code KeyA, with Control or Meta (Cmd on macOS).
    when: multiple
    from: inside
    expect: manual
  - keys:
    - a-z
    action: 'Type-ahead: any printable character (letters, digits, punctuation) moves
      to the next visible node whose label starts with the typed characters; the buffer
      clears after 500 ms (literal-ok, as Listbox).'
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
        multiple mode.
      locked: true
    rowSelectedBorder:
      token: color.control.selectedBackground
      description: Start-edge bar on the selected (or checked) node, as Table and
        DataGrid. Drawn over the row (absolutely positioned at the logical start,
        mirrored in RTL) so selecting does not shift the content.
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
      description: The visible label Heading; forwarded as `overrides.fontSize`. The
        gap below it is the Heading's own marginBlockEnd.
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
        both axes, around an unmodified ghost Button (Button has no size override
        and keeps its own data-part); the chevron takes the Button's own color.
      locked: true
    guideLine:
      token: color.border
      locked: false
    guideLineWidth:
      token: border.width.thin
      locked: false
    checkboxGap:
      token: layout.gap.tight
      part: checkbox
      description: Between the checkbox and the label in multiple mode.
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
      locked: false
    fontSize:
      token: font.size.sm
      locked: false
    lineHeight:
      token: font.lineHeight.normal
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
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      description: Chevron rotation and hover; groups appear instantly. The collapsed
        chevron is mirrored in RTL.
      locked: false
  constants:
    typeaheadReset:
      description: How long typed characters accumulate before the typeahead buffer
        clears.
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
        a Button with aria-hidden and tabindex=-1 — ArrowLeft/Right are the keyboard
        path; on a disabled node it is disabled too, and clicks on a disabled row
        do nothing (a disabled parent stays closed, so do not disable a parent whose
        children must stay reachable). Heading and Button keep their own data-part,
        so the `heading` and `expandButton` parts are wrappers the tree owns; Link
        keeps its own `data-part="anchor"` too, so the `link` part is a `<span data-part="link">`
        the tree owns around it (activation finds the anchor inside that span); Text
        takes data-part directly. Nodes with href render the label as a Link inside
        the treeitem; Enter activates it. Multiple mode uses aria-checked with an
        indeterminate value for cascading parents and a Checkbox glyph (not the Checkbox
        component: the treeitem itself is the control). Type-ahead buffers keys for
        500 ms. Pointer: click on a node focuses it and does what Space does (select
        in single, toggle in multiple); double-click does what Enter does, and a click
        whose `detail` is 2 or more does not toggle again (a double-click toggles
        once, then activates); click on the chevron toggles expansion and focuses
        the node without changing selection. Lazy placeholder: a <li role="treeitem"
        aria-disabled="true"> holding copy.loading inside the group, not navigable,
        with no data-part, and aria-busy on the parent treeitem. Empty `nodes`: the
        <ul> renders with no items and copy.empty is a `Text tone="muted"` below it
        inside the container.'
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
        shadow treeitems; composed events. ds-link is composed for href nodes. `showGuides`
        defaults true, so its attribute is the negated `hide-guides`. Forwarded bindings
        reach the composed ds-text / ds-heading / ds-icon through their `overrides`
        property only, so a consumer''s CSS on a forwarded --ds-tree-* hook does not
        reach the child; override them through `overrides`. Composed events carry
        bare detail values — `selection-change` and `expand-change` the string[] itself,
        `expand` and `activate` the id string — not objects, as TreeGrid.'
    rn:
      element: FlatList
      props:
      - accessibilityRole=list
      - accessibilityLabel
      notes: 'A FlatList over the flattened visible nodes; each row a Pressable with
        accessibilityRole="button" (or "link" for href), accessibilityState={{ expanded,
        selected, checked, disabled }}, accessibilityLabel "{label}, level {n}" and
        accessibilityActions expand/collapse. Multiple mode draws the checkbox glyph
        (checkbox* bindings, accessibilityState.checked) inside the same Pressable
        — not the Checkbox component — so the row stays one target and Enter-equivalent
        activation and href still work: a tap toggles selection, a long press activates.
        A screen reader''s activate gesture lands on the tap, which in that mode toggles
        selection, so in multiple mode the row also carries the standard `longpress`
        accessibility action (no label needed; a custom `activate` would take over
        the double-tap) calling the same handler as a long press — otherwise there
        would be no non-gestural way to follow a node. In `single` a tap does what
        Enter does (selects, then activates); in `none` a tap only activates and does
        not toggle expansion. `href` is followed with `Linking.openURL` by the row
        itself (the composed Link gets an onPress that returns false, so a tap on
        its text acts like the rest of the row); apps with in-app routes use onActivate
        instead of href. The root View is the `container` (holding the Heading and
        the FlatList); `group` has no element. `selectOnFocus` is wired to the Pressable''s
        onFocus (hardware keyboard and assistive-technology focus). No arrow keys,
        no type-ahead, no `*` and no expand-all action; the expand chevron is a real
        target, accessible and named with copy.expand/collapse.'
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

- 7 rule(s) in the schema do not apply on rn; implement none of them

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

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `indent`, `rowPaddingInline`, `rowRadius`, `rowGap`, `rowHover`, `labelSelectedWeight`, `headingSize`, `badgeSize`, `guideLine`, `guideLineWidth`, `checkboxGap`, `checkboxSize`, `checkboxBorderWidth`, `checkboxBackground`, `checkboxRadius`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `rowHeight`, `rowSelected`, `rowSelectedBorder`, `rowSelectedBorderWidth`, `labelColor`, `iconColor`, `badgeColor`, `expandButtonSize`, `checkboxBorder`, `checkboxSelected`, `checkboxMark`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (12)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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

## Platform notes (rn)

```yaml
element: FlatList
props:
- accessibilityRole=list
- accessibilityLabel
notes: "A FlatList over the flattened visible nodes; each row a Pressable with accessibilityRole=\"\
  button\" (or \"link\" for href), accessibilityState={{ expanded, selected, checked,\
  \ disabled }}, accessibilityLabel \"{label}, level {n}\" and accessibilityActions\
  \ expand/collapse. Multiple mode draws the checkbox glyph (checkbox* bindings, accessibilityState.checked)\
  \ inside the same Pressable \u2014 not the Checkbox component \u2014 so the row\
  \ stays one target and Enter-equivalent activation and href still work: a tap toggles\
  \ selection, a long press activates. A screen reader's activate gesture lands on\
  \ the tap, which in that mode toggles selection, so in multiple mode the row also\
  \ carries the standard `longpress` accessibility action (no label needed; a custom\
  \ `activate` would take over the double-tap) calling the same handler as a long\
  \ press \u2014 otherwise there would be no non-gestural way to follow a node. In\
  \ `single` a tap does what Enter does (selects, then activates); in `none` a tap\
  \ only activates and does not toggle expansion. `href` is followed with `Linking.openURL`\
  \ by the row itself (the composed Link gets an onPress that returns false, so a\
  \ tap on its text acts like the rest of the row); apps with in-app routes use onActivate\
  \ instead of href. The root View is the `container` (holding the Heading and the\
  \ FlatList); `group` has no element. `selectOnFocus` is wired to the Pressable's\
  \ onFocus (hardware keyboard and assistive-technology focus). No arrow keys, no\
  \ type-ahead, no `*` and no expand-all action; the expand chevron is a real target,\
  \ accessible and named with copy.expand/collapse."
```

## Guidance

## Overview

A tree is a list that knows about nesting. One field per node, arrows to move and open, Enter to act: the shape of a file browser's sidebar, a category picker, a documentation site's navigation. When nodes need several fields, it becomes a TreeGrid.

## When to use

Use a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product categories, an org's departments. `single` selection with `href` nodes is a navigation tree; `multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only when the tree drives a panel beside it and moving through nodes should preview them.

## When not to use

Do not use a Tree for one level (a Listbox or a list of Links), for nodes with several fields (TreeGrid), or as a Menu (a Menu closes after a choice; a tree stays). Do not use it for a hierarchy most people need entirely visible — render nested headings and lists instead.

## Behavior

ArrowUp/Down move through visible nodes; ArrowRight opens a closed parent or steps into an open one; ArrowLeft closes or steps up; `*` opens all siblings; typing jumps by label. Enter activates (navigates for `href`, otherwise `onActivate`) and, in single mode, selects. Space selects or toggles; in multiple mode Shift+arrows extend and Ctrl+A selects all visible. Lazy nodes load when opened, with a placeholder child; onExpand fires before onExpandChange. Disabled nodes are visible, skipped by arrows, not selectable, and cannot be expanded. Selection and expansion are both controlled-or-uncontrolled and reported through events; `selected` is always an array. With the pointer, click selects or toggles and focuses, double-click activates, and the chevron only expands. The heading, when shown, is a composed Heading at `headingLevel` sized by headingSize and names the tree.

## Content guidelines

Labels are short nouns; nesting supplies the context, so "Invoices" not "Billing – Invoices". Use `icon` consistently per node type (folder/file) or not at all; use `badge` for counts that help choose ("12"). Open the first level by default in navigation trees so the structure is visible.

## Accessibility

The tree is a `tree` of `treeitem`s with `group`s for children, each item exposing level, position in set, set size, expanded state on parents, and selected or checked state (WCAG 1.3.1, 4.1.2; APG tree view). It is one tab stop with a roving tabindex and full arrow-key movement, type-ahead included (2.1.1, 2.4.3). Expansion is operable from the item itself, so the chevron is decoration (2.1.1). Selection shows as a fill plus a start-edge bar (1.4.1) and rows meet the minimum target (2.5.8). In multiple mode the count is announced (4.1.3): copy.selectedCount goes to a visually hidden role="status" region, rendered in multiple mode only, on every user selection change; expanding and collapsing announce nothing beyond the item's own expanded state.

## Platform notes

### Web
Render `<div data-ds="Tree">` holding the optional `Heading level={headingLevel}` and `<ul role="tree" aria-labelledby|aria-label aria-multiselectable>` with `<li role="treeitem" id aria-level aria-setsize aria-posinset aria-expanded? aria-selected|aria-checked tabIndex={roving}>` containing the row `<div>` (indent as `padding-inline-start`, the chevron `Button` `ghost sm iconOnly aria-hidden tabIndex={-1}`, optional `Icon`, the label `Text` or `Link`, the badge `Text tone="muted"` with `overrides.fontSize` from badgeSize, and in multiple mode the drawn checkbox `<span aria-hidden>` from the checkbox* bindings with a `check`/`dash` Icon) and, when expanded, `<ul role="group">` of child items. Keydown on the tree implements the table over the flattened visible list; focus moves to the item. Guide lines are a `::before` on groups, hidden with `showGuides: false`. Lazy: on each expand of a still-lazy node fire `onExpand`, render the placeholder item (`aria-disabled`, not navigable) with `copy.loading` and `aria-busy` on the parent.

### Lit
`<ds-tree label="Folders" .nodes=${nodes} selectable="multiple" select-children></ds-tree>`; shadow tree; composed `selection-change`, `expand-change`, `expand`, `activate`.

### React Native
`FlatList` over the flattened visible nodes; rows are `Pressable`s with indent, chevron `Button`, `Icon`, `Text`, badge; `accessibilityState` and `accessibilityActions` as noted; multiple mode draws the checkbox glyph inside the row from the checkbox* bindings (`View` + `Icon`), never the Checkbox component. Groups have no wrapper on native: visible children are flattened into the one list, as TreeGrid.

## Related

TreeGrid, Listbox, Disclosure, Accordion, Link, Menu.
