---
title: Toolbar
description: A row of related controls — formatting buttons, view switches, a filter and a sort — that behaves as one tab stop with arrow keys between its controls, and folds what does not fit into an overflow Menu.
component:
  name: Toolbar
  category: navigation
  status: review
  apg: toolbar
  anatomy: [container, group, separator, overflowButton, overflowMenu]
  composition:
    separator: Divider
    overflowButton: Button
    overflowMenu: Menu
  props:
    label:
      type: string
      required: true
      description: What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology.
      a11y: aria-label / accessibilityLabel on the toolbar.
    children:
      type: content
      required: true
      description: 'Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly` for glyph tools), SegmentedControl, Select, Switch. Group related controls with `ToolbarGroup`; a Divider is drawn between groups.'
    orientation:
      type: enum
      values: [horizontal, vertical]
      default: horizontal
      description: Vertical toolbars sit beside a canvas; arrow keys swap axes.
    overflow:
      type: enum
      values: [wrap, menu, scroll]
      default: menu
      description: 'What happens when controls do not fit: wrap onto more rows, collapse trailing controls into a "More" Menu (each control must provide `overflowLabel`), or scroll horizontally with the edges faded.'
    size:
      type: enum
      enumRef: size
      values: [sm, md]
      default: md
      description: 'Default for child controls that have a `size` prop and do not set their own (applied by cloning direct children; a child''s own `size` wins).'
    density:
      type: enum
      values: [compact, comfortable]
      default: comfortable
      description: 'Gap between controls: tight or normal rhythm.'
  events: {}
  keyboard:
    - { keys: [Tab], action: 'Moves focus into the toolbar (to the last-focused control, initially the first) and, from inside, out of it — the toolbar is one tab stop.', from: any, expect: manual }
    - { keys: [ArrowRight], action: 'Next control (ArrowDown when vertical). Skips disabled controls; does not wrap.', from: first, expect: focus-next }
    - { keys: [ArrowLeft], action: 'Previous control (ArrowUp when vertical).', from: last, expect: focus-prev }
    - { keys: [Home], action: First control., from: last, expect: focus-first }
    - { keys: [End], action: Last control., from: first, expect: focus-last }
    - { keys: [Enter, ' '], action: 'Activates the focused control (its own behavior).', from: first, expect: manual, native: true }
  styles:
    background: { token: color.background.subtle }
    border: { token: color.border }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.md }
    paddingInline: { token: space.2 }
    paddingBlock: { token: space.1 }
    itemGap: { token: layout.gap.normal, by: density, values: { compact: layout.gap.tight }, description: 'Between adjacent controls, inside a group and between ungrouped top-level controls alike.' }
    groupGap: { token: layout.gap.normal, part: group, description: 'Either side of a separator, replacing itemGap there (not added to it).' }
    separatorLength: { token: space.5, part: separator, description: 'The Divider between groups is shorter than the toolbar height.' }
    fadeWidth: { token: space.6, description: 'Edge fade for `overflow: scroll`, a gradient from the toolbar background to transparent.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  copy:
    more: More
  a11y:
    role: toolbar
    requires: [accessible-name, roving-tabindex, arrow-navigation, keyboard-operable, focus-visible, contrast-aa, target-24px]
    contrast:
      - { foreground: color.foreground, background: color.background.subtle, level: AA }
      - { foreground: color.foreground.muted, background: color.background.subtle, level: AA }
      - { foreground: color.action.ghost.foreground, background: color.background.subtle, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=toolbar, aria-label, aria-orientation]
      notes: 'A <div role="toolbar" aria-label aria-orientation> managing a roving tabindex over its focusable descendants (query on mount and on a MutationObserver; SegmentedControl and RadioGroup count as one control and keep their own inner arrow keys — the toolbar hands the key to them when focus is inside). Overflow `menu`: a ResizeObserver measures children and moves trailing ones into a Menu whose items reuse each control''s `overflowLabel`/`onPress`; the hidden controls are removed from the DOM, not just hidden, so the roving list stays correct. Overflow `scroll`: overflow-x auto with scrollbar hidden and masked edges.'
    lit:
      tag: ds-toolbar
      reflect: [orientation, overflow, size, density]
      notes: 'Slotted light-DOM children; the roving tabindex walks assigned elements (and into their shadow roots via delegatesFocus). ToolbarGroup is <ds-toolbar-group>. Overflow menu items are built from slotted elements'' `overflow-label` attribute and a click() on the original element.'
    rn:
      element: View
      props: [accessibilityRole=toolbar, accessibilityLabel]
      notes: 'A horizontal ScrollView (overflow defaults to `scroll` on native; `menu` also works and opens an ActionSheet on phones through Menu''s own rule). accessibilityRole="toolbar" on the container. No roving focus without a hardware keyboard; every control is reachable by swipe.'
    swiftui:
      element: HStack
      props: [.accessibilityElement=contain, .accessibilityLabel, .focusSection, .onMoveCommand, '@FocusState', ViewThatFits, Menu, Divider, ScrollView]
      notes: 'An `HStack` (or `VStack`) in a `.contain` element labelled by `label`, one focus section with the roving `@FocusState` moved by arrows/Home/End on iPad. Overflow: `ViewThatFits` tries the full row, then progressively collapses trailing `Button`s (only Buttons, using each one''s `overflowLabel`) into a system `Menu` behind the `ellipsis` Button, as on web; `overflow: scroll` wraps the row in a horizontal `ScrollView` with faded edges drawn by a gradient mask. Groups are `ToolbarGroup` containers with `label` as their contained element''s label, separated by `Divider`s. `size` is cloned onto children through the environment. Not SwiftUI''s `.toolbar` (navigation-bar placement).'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema. The toolbar
    # declares no events, so what it promises is its role, its orientation and its single tab stop.
    - name: horizontal-is-the-reported-orientation
      description: The toolbar reports the axis its arrow keys move along.
      then:
        - { attribute: aria-orientation, is: horizontal }
      platforms: [web]
    - name: vertical-toolbar-reports-its-orientation
      description: A vertical toolbar sits beside a canvas and swaps its arrow axis, which aria-orientation announces.
      given: { orientation: vertical }
      then:
        - { attribute: aria-orientation, is: vertical }
      platforms: [web]
    - name: the-toolbar-is-one-tab-stop
      description: A roving tabindex over the focusable descendants makes each control the focus target; the container itself never takes focus.
      then:
        - { focusable: false }
      platforms: [web]
  examples:
    - name: formatting-toolbar
      description: The default row of ghost formatting buttons, named by what it controls.
      given: { label: Formatting, children: 'Bold, Italic and Underline buttons' }
    - name: vertical-tool-palette
      description: A tool palette beside a canvas, where arrows move up and down.
      given: { label: Drawing tools, children: 'Select, Draw and Erase buttons', orientation: vertical }
    - name: compact-actions-with-overflow
      description: A dense table-action row at toolbar height that folds trailing buttons into a More menu.
      given: { label: Table actions, children: 'Filter, Sort, Export and Delete buttons', overflow: menu, density: compact, size: sm }
    - name: scrolling-filter-row
      description: A filter row that scrolls horizontally with faded edges instead of collapsing.
      given: { label: Filters, children: 'A SegmentedControl and two Selects', overflow: scroll }
---

A toolbar keeps a set of related controls together so the keyboard treats them as one stop: Tab reaches the toolbar, arrows move within it, Tab leaves it. That is what makes an editor with thirty buttons usable without thirty Tab presses.

## When to use

Use a Toolbar for controls that act on the same thing and are used together: text formatting, a table's row actions, a map's view switches, a data page's filter–sort–export row. Group by purpose with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for toolbars whose width the layout cannot guarantee; give every control an `overflowLabel` so it reads well as a menu item.

## When not to use

Do not use a Toolbar for page navigation (Breadcrumb, Tabs, a `nav` Landmark) or for a form's submit row (Form's action row). Do not put a single control in a toolbar. Do not use it as a generic horizontal Stack because it looks tidy: the roving tabindex changes how Tab works, which surprises users when the controls are unrelated.

## Behavior

Focus enters on the control that last had focus (initially the first). Arrow keys move along the toolbar's axis, skipping disabled controls, without wrapping; Home and End jump to the ends. A control that has its own arrow-key model (SegmentedControl, RadioGroup) keeps it: the toolbar only takes arrows when focus is on the control's edge and the arrow points out. When the toolbar is narrower than its content, `overflow` decides: wrap, move trailing controls into a "More" Menu (kept in their original order, groups become Menu groups), or scroll with faded edges. `ToolbarGroup` is part of Toolbar's API (`label` for the group's accessible name, `children`); a Divider is drawn between groups. Only Buttons collapse into the overflow Menu, using their `overflowLabel`; SegmentedControl, Select and Switch never collapse — the toolbar measures them as fixed and collapses Buttons from the end first. A control with its own arrow-key model handles the key first; the toolbar acts only when the control did not (`defaultPrevented`). On native the fade is drawn with react-native-svg; `overflow: menu` renders as `scroll`.

## Content guidelines

Icon-only buttons need a Tooltip and an `overflowLabel`; the two should be the same words ("Bold", "Align left"). Put the most-used controls first, the destructive ones last and in their own group. A toolbar's `label` names what it controls, not "toolbar".

## Accessibility

The container is a `toolbar` with an accessible name and orientation (WCAG 4.1.2; APG toolbar), using a roving tabindex so it is a single tab stop (2.4.3) with arrow-key movement (2.1.1). Controls keep their own roles and names, so the Menu that overflow produces has the same names. Focus is visible on each control (2.4.7), targets meet 24px, and a scrolling toolbar remains keyboard-reachable because focusing a control scrolls it into view.

## Platform notes

### Web
Render `<div role="toolbar" aria-label aria-orientation data-ds="Toolbar">`; children in `ToolbarGroup` (`<div role="group">`) separated by `Divider orientation="vertical"` with its length from `separatorLength`. Roving tabindex: keep an index into the focusable list (`button, [role=radio][aria-checked=true], select, input, [tabindex]` that are not disabled), set `tabIndex 0` on the current and `-1` on the rest, update on `focusin`. Keydown per the table, respecting `orientation`. Overflow `menu`: a `ResizeObserver` on the container, measure children offsets, move those past the limit into state rendered by `Menu` (trigger a `Button ghost iconOnly` "More" with the ellipsis Icon); `scroll`: `overflow-x: auto; scrollbar-width: none` plus `mask-image` linear gradients of `fadeWidth`.

### Lit
`<ds-toolbar label="Formatting"><ds-toolbar-group><ds-button …></ds-toolbar-group>…</ds-toolbar>`; the roving list is rebuilt on `slotchange`; keys handled on the host from bubbling keydown, using `composedPath()` to find the control.

### React Native
Horizontal `ScrollView` with `contentContainerStyle` gap from `itemGap`, `accessibilityRole="toolbar"`; groups are `View`s separated by `Divider`. Overflow `menu` uses `Menu` (ActionSheet on phones). Arrow handling applies on react-native-web only.

## Related

Button, Menu, SegmentedControl, Divider, Tooltip.
