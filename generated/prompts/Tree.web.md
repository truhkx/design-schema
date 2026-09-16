# Generate: Tree for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Tree.tsx` exporting a typed React function component named `Tree`, plus `Tree.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Tree({ ref, …rest }: TreeProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Tree> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Tree.test.tsx`.
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
    heading: Heading
    expandButton: Button
    icon: Icon
    label: Text
    link: Link
    badge: Text
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
      description: 'The hierarchy. `href` makes a node''s label a Link (navigation
        trees); `icon` is an Icon glyph (`folder` and `file` exist for the usual case);
        `badge` is a short trailing count or status; `children: "lazy"` loads on first
        expand through `onExpand`.'
    expanded:
      type: array
      shape: string[]
      description: Controlled expanded ids.
    defaultExpanded:
      type: array
      shape: string[]
      description: Initially expanded ids; `["*"]` for all.
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
    defaultSelected:
      type: array
      shape: string[]
      description: Initially selected ids.
    selectChildren:
      type: boolean
      default: false
      description: With `multiple`, selecting a parent selects its descendants and
        parents show indeterminate.
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
      description: Fired with the selected ids.
      platforms:
        web: onSelectionChange
        lit: selection-change
        rn: onSelectionChange
        swiftui: onSelectionChange
    onExpandChange:
      description: Fired with the expanded ids.
      platforms:
        web: onExpandChange
        lit: expand-change
        rn: onExpandChange
        swiftui: onExpandChange
    onExpand:
      description: Fired when a lazy node is expanded for the first time, with its
        id.
      platforms:
        web: onExpand
        lit: expand
        rn: onExpand
        swiftui: onExpand
    onActivate:
      description: Fired on Enter or double-click on a node (open the file, navigate),
        with its id. Nodes with `href` navigate instead.
      platforms:
        web: onActivate
        lit: activate
        rn: onActivate
        swiftui: onActivate
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
  - keys:
    - ArrowUp
    action: Previous visible node.
    from: last
    expect: focus-prev
  - keys:
    - ArrowRight
    action: 'On a closed parent: opens it. On an open parent: moves to its first enabled
      child (disabled nodes are skipped). On a leaf: nothing.'
    from: inside
    expect: manual
  - keys:
    - ArrowLeft
    action: 'On an open parent: closes it. Otherwise: moves to the parent.'
    from: inside
    expect: manual
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
      also selects it.'
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
    action: Opens every sibling of the focused node.
    from: inside
    expect: manual
  - keys:
    - Shift+ArrowDown
    - Shift+ArrowUp
    action: Moves focus to the next / previous node and adds it to the selection (the
      APG rule; no anchor range).
    when: multiple
    from: inside
    expect: manual
  - keys:
    - Control+a
    action: Selects every visible, enabled node at the current expansion state; bound
      by key code KeyA.
    when: multiple
    from: inside
    expect: manual
  - keys:
    - a-z
    action: 'Type-ahead: moves to the next visible node whose label starts with the
      typed characters; the buffer clears after 500 ms (literal-ok, as Listbox).'
    from: inside
    expect: manual
  styles:
    indent:
      token: space.5
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
      description: Between the expand button, icon, label and badge.
      locked: false
    rowHover:
      token: color.action.ghost.backgroundHover
      locked: false
    rowSelected:
      token: color.background.strong
      locked: true
    rowSelectedBorder:
      token: color.control.selectedBackground
      description: Start-edge bar on the selected node, as Table and DataGrid.
      locked: true
    rowSelectedBorderWidth:
      token: border.width.focus
      locked: true
    labelColor:
      token: color.foreground
      locked: true
    labelSelectedWeight:
      token: font.weight.medium
      description: Forwarded to the label Text as `overrides.fontWeight` when selected.
      locked: false
    headingSize:
      token: font.size.md
      description: The visible label Heading; forwarded as `overrides.fontSize`.
      locked: false
    iconColor:
      token: color.foreground.muted
      locked: true
    badgeColor:
      token: color.foreground.muted
      locked: true
    badgeSize:
      token: font.size.xs
      description: Forwarded to the badge Text as `overrides.fontSize`.
      locked: false
    expandButtonSize:
      token: size.target.min
      locked: true
    guideLine:
      token: color.border
      locked: false
    guideLineWidth:
      token: border.width.thin
      locked: false
    checkboxGap:
      token: layout.gap.tight
      description: Between the checkbox and the label in multiple mode.
      locked: false
    checkboxSize:
      token: space.4
      description: The drawn checkbox glyph in multiple mode (the treeitem is the
        control; no Checkbox component).
      locked: false
    checkboxBorder:
      token: color.control.border
      locked: true
    checkboxBackground:
      token: color.control.background
      locked: false
    checkboxSelected:
      token: color.control.selectedBackground
      description: Fill when checked or indeterminate.
      locked: true
    checkboxMark:
      token: color.control.selectedForeground
      description: The check or dash Icon on the fill.
      locked: true
    checkboxRadius:
      token: radius.sm
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
      description: Chevron rotation and hover; groups appear instantly.
      locked: false
  copy:
    expand: Expand {label}
    collapse: Collapse {label}
    selectedCount: '{count} selected'
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
      large: true
    - foreground: color.control.border
      background: color.background
      level: AA
      large: true
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
      - tabindex
      - aria-activedescendant
      notes: 'A <div data-ds="Tree" data-part="container"> holding the Heading when
        showLabel and the <ul role="tree" aria-labelledby={headingId} | aria-label
        aria-multiselectable> of <li role="treeitem" aria-level aria-setsize aria-posinset
        aria-expanded (parents only) aria-selected|aria-checked> whose children are
        in a nested <ul role="group">. Roving tabindex on the treeitems (one tab stop;
        the item, not the row div, is focused). The expand chevron is a Button with
        aria-hidden and tabindex=-1 — ArrowLeft/Right are the keyboard path. Nodes
        with href render the label as a Link inside the treeitem; Enter activates
        it. Multiple mode uses aria-checked with an indeterminate value for cascading
        parents and a Checkbox glyph (not the Checkbox component: the treeitem itself
        is the control). Type-ahead buffers keys for 500 ms. Pointer: click on a node
        focuses it and does what Space does (select in single, toggle in multiple);
        double-click does what Enter does; click on the chevron toggles expansion
        and focuses the node without changing selection. Empty `nodes`: the <ul> renders
        with no items and copy.empty is a Text below it inside the container.'
    lit:
      tag: ds-tree
      reflect:
      - selectable
      - select-children
      - select-on-focus
      - hide-guides
      - show-label
      - heading-level
      notes: '`nodes` as a property rendered in the shadow root; roving tabindex over
        shadow treeitems; composed events. ds-link is composed for href nodes. `showGuides`
        defaults true, so its attribute is the negated `hide-guides`. labelSelectedWeight,
        badgeSize and headingSize reach the composed ds-text / ds-heading through
        their `overrides` property.'
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
        `selectOnFocus` is wired to the Pressable''s onFocus (hardware keyboard and
        assistive-technology focus). No arrow keys, no type-ahead; the expand chevron
        is a real target.'
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
```

## Controlled state

- `expanded` is controlled when given, uncontrolled from `defaultExpanded` when omitted; paired by name, so no event is declared
- `selected` is controlled when given, uncontrolled from `defaultSelected` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `indent`, `rowPaddingInline`, `rowRadius`, `rowGap`, `rowHover`, `labelSelectedWeight`, `headingSize`, `badgeSize`, `guideLine`, `guideLineWidth`, `checkboxGap`, `checkboxSize`, `checkboxBackground`, `checkboxRadius`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `rowHeight`, `rowSelected`, `rowSelectedBorder`, `rowSelectedBorderWidth`, `labelColor`, `iconColor`, `badgeColor`, `expandButtonSize`, `checkboxBorder`, `checkboxSelected`, `checkboxMark`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (8)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (web)

```yaml
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
- tabindex
- aria-activedescendant
notes: "A <div data-ds=\"Tree\" data-part=\"container\"> holding the Heading when\
  \ showLabel and the <ul role=\"tree\" aria-labelledby={headingId} | aria-label aria-multiselectable>\
  \ of <li role=\"treeitem\" aria-level aria-setsize aria-posinset aria-expanded (parents\
  \ only) aria-selected|aria-checked> whose children are in a nested <ul role=\"group\"\
  >. Roving tabindex on the treeitems (one tab stop; the item, not the row div, is\
  \ focused). The expand chevron is a Button with aria-hidden and tabindex=-1 \u2014\
  \ ArrowLeft/Right are the keyboard path. Nodes with href render the label as a Link\
  \ inside the treeitem; Enter activates it. Multiple mode uses aria-checked with\
  \ an indeterminate value for cascading parents and a Checkbox glyph (not the Checkbox\
  \ component: the treeitem itself is the control). Type-ahead buffers keys for 500\
  \ ms. Pointer: click on a node focuses it and does what Space does (select in single,\
  \ toggle in multiple); double-click does what Enter does; click on the chevron toggles\
  \ expansion and focuses the node without changing selection. Empty `nodes`: the\
  \ <ul> renders with no items and copy.empty is a Text below it inside the container."
```

## Guidance

## Overview

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
