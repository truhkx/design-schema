---
title: Splitter
description: Two panes side by side (or stacked) with a draggable, keyboard-adjustable divider between them — a file tree beside its contents, a list beside a detail, an editor beside a preview. The APG window splitter.
component:
  name: Splitter
  category: layout
  status: review
  apg: windowsplitter
  anatomy: [container, primaryPane, secondaryPane, separator, handle, collapseButton]
  composition:
    collapseButton: Button
  props:
    label:
      type: string
      required: true
      description: 'What the divider resizes ("Sidebar width", "Preview height"). The separator''s accessible name.'
      a11y: aria-label on the separator.
    orientation:
      type: enum
      values: [horizontal, vertical]
      default: horizontal
      description: '`horizontal` places panes side by side (the separator is vertical); `vertical` stacks them.'
    primary:
      type: content
      required: true
      description: The first pane (start or top). Its size is what the separator controls and reports.
    secondary:
      type: content
      required: true
      description: The second pane, which takes the remaining space.
    size:
      type: number
      description: Controlled size of the primary pane as a percentage of the container (0–100).
      controls:
        event: onSizeChange
        default: defaultSize
    defaultSize:
      type: number
      default: 30
      description: Initial primary size, percent.
    minSize:
      type: number
      default: 10
      description: 'Smallest primary size, percent. With `collapsible`, dragging or stepping below it collapses the pane instead of clamping; otherwise it is the hard floor.'
    maxSize:
      type: number
      default: 90
      description: Largest primary size, percent.
    step:
      type: number
      default: 2
      description: Arrow-key increment, percent.
    collapsible:
      type: boolean
      default: false
      description: 'The primary pane can collapse to nothing: drag past the minimum, press Enter on the separator, or use the collapse button. Enter again restores the last size.'
    collapsed:
      type: boolean
      description: Controlled collapsed state.
      controls:
        event: onCollapseChange
        default: defaultCollapsed
    defaultCollapsed:
      type: boolean
      default: false
      description: Initial collapsed state when uncontrolled.
    persistKey:
      type: string
      description: 'When set, the size and collapsed state are remembered per user under this key so a sidebar stays where it was left: localStorage on web and Lit (in try/catch); on native a module-level memory map (no storage dependency is allowed), which survives remounts but not a restart.'
    stackBelow:
      type: enum
      values: [prose, content, never]
      default: prose
      description: 'Below this width of the splitter''s own box (a container query, not the viewport, so nested splitters work) a horizontal splitter stacks its panes and the separator is not rendered. A vertical splitter never stacks. All three values apply on every platform (`content` = layout.maxWidth.content, `never` = no stacking).'
  events:
    onSizeChange:
      description: Fired continuously while dragging and on each key press, with the primary size in percent.
      platforms: { web: onSizeChange, lit: size-change, rn: onSizeChange, swiftui: onSizeChange }
      payload:
        - { name: size, type: number, description: The primary pane size in percent. }
      fires: [user]
    onSizeChangeEnd:
      description: 'Fired with the final size once when a drag ends and after each key press (a key press is a complete interaction), so a caller can persist on it.'
      platforms: { web: onSizeChangeEnd, lit: size-change-end, rn: onSizeChangeEnd, swiftui: onSizeChangeEnd }
      payload:
        - { name: size, type: number, description: The final primary pane size in percent. }
      fires: [user]
      timing: { phase: commit }
    onCollapseChange:
      description: Fired when the primary pane collapses or restores.
      platforms: { web: onCollapseChange, lit: collapse-change, rn: onCollapseChange, swiftui: onCollapseChange }
      payload:
        - { name: collapsed, type: boolean, description: True when the primary pane is now collapsed. }
      fires: [user]
  keyboard:
    - { keys: [Tab], action: 'The separator is a tab stop between the two panes'' content.', from: any, expect: manual }
    - { keys: [ArrowRight, ArrowDown], action: 'Grows the primary pane by `step` (ArrowDown when vertical; ArrowRight when horizontal).', from: first, expect: manual }
    - { keys: [ArrowLeft, ArrowUp], action: Shrinks the primary pane by `step`., from: first, expect: manual }
    - { keys: [Home], action: Sets the primary pane to `minSize`., from: first, expect: manual }
    - { keys: [End], action: Sets the primary pane to `maxSize`., from: first, expect: manual }
    - { keys: [Enter], action: 'Collapses the primary pane, or restores it to its previous size. While collapsed, arrows, Home, End and pointer drag do nothing; only Enter or the collapse button restores.', when: collapsible, from: first, expect: manual }
    - { keys: [F6], action: 'Cycles focus primary pane → separator → secondary pane → primary pane (wrapping), landing on the region''s first focusable descendant or, when it has none, on the pane wrapper itself (tabindex -1). The APG convenience for cycling panes; not available on native.', from: any, expect: manual, platforms: [web, lit] }
  styles:
    separatorSize: { token: space.1, part: separator, description: 'The visible line. The grab area is wider: `handleSize` centered on it.' }
    separatorColor: { token: color.border, part: separator }
    separatorHover: { token: color.border.strong, part: separator, state: hover, description: 'Pointer hover; unused on native.' }
    separatorActive: { token: color.control.selectedBackground, part: separator, state: dragging, description: 'While dragging or focused.' }
    handleSize: { token: space.3, part: handle, description: 'Pointer grab area, centered on the separator and overlapping both panes so the panes'' content keeps the full width. The effective hit area is max(handleSize, minTarget), so the locked floor cannot be overridden away.' }
    grip: { token: color.border.strong, description: 'A short centered grip mark on the separator, so the divider reads as draggable: a rounded bar of gripLength along the separator and separatorSize across it.' }
    gripLength: { token: space.6 }
    collapseButtonOffset: { token: space.2, part: collapseButton, description: 'Distance of the collapse Button from the separator''s start edge along the separator (top of a vertical separator, inline-start of a horizontal one); the button is centered across the separator and overlaps both panes.' }
    paneMinTarget: { token: size.target.comfortable, description: 'A pane never shrinks below this on the drag axis before collapsing, so its scrollbar and content stay usable: a CSS minmax() floor on both grid tracks beneath the percent clamp (a very narrow container can therefore show the pane wider than its percent). Dropped for the primary track while collapsed so collapse reaches zero.' }
    minTarget: { token: size.target.min, description: 'Separator hit area along the drag axis.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    transition: { token: motion.duration.fast, description: 'Collapse and restore, and the separator color; dragging itself has no transition.' }
  copy:
    collapse: 'Collapse {label}'
    expand: 'Expand {label}'
    sizeText:
      text: '{percent}%'
      params:
        percent: { type: number, description: The primary pane's size as a percentage of the container. }
  a11y:
    role: separator
    requires: [accessible-name, keyboard-operable, arrow-navigation, focus-visible, contrast-aa, target-24px, gesture-alternative, reduced-motion]
    contrast:
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
  platforms:
    web:
      element: div
      attributes: [role=separator, tabindex=0, aria-orientation, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-label, aria-controls]
      notes: 'A container with CSS grid (grid-template-columns: var(--ds-splitter-primary-size) auto 1fr, or rows when vertical) whose primary size is a custom property in percent; the separator is <div role="separator" tabindex="0" aria-orientation aria-valuenow aria-valuemin aria-valuemax aria-valuetext aria-label aria-controls={primaryId}> (aria-orientation is the separator''s own: vertical for a horizontal splitter). Pointer Events with setPointerCapture on the separator; the grab area is a wider ::before. A resizable separator is a focusable widget per ARIA (a static separator would not have tabindex). Collapse: the primary pane gets inert and inline-size 0; the collapse Button (ghost, sm, iconOnly, chevron Icon) sits on the separator. Below the stackBelow width a container query switches to a single column, the separator is not rendered, and both panes render in full. persistKey reads/writes localStorage inside try/catch.'
    lit:
      tag: ds-splitter
      reflect: [orientation, collapsible, collapsed, stack-below]
      notes: 'Slots `primary` and `secondary`; the separator lives in the shadow root and controls the slotted primary via a host custom property. Composed events. Container query on :host.'
    rn:
      element: View
      props: [accessibilityRole=adjustable, accessibilityLabel, accessibilityValue, accessibilityActions]
      notes: 'Tablets and react-native-web only; below the stackBelow width the panes always stack and the separator is not rendered. The separator is a plain View with a PanResponder (as Slider''s thumb — panHandlers on a Pressable fight its own responder), so it cannot show a keyboard focus ring itself (a known platform limit; the composed collapse Button has full focus treatment). accessibilityRole="adjustable", accessibilityValue={{ min, max, now, text }}, accessibilityActions increment/decrement (step), setMinimum/setMaximum (Home/End) and activate (Enter: collapse/restore) — the gesture alternative. F6 has no native equivalent. persistKey is a module-level memory map.'
    swiftui:
      element: HStack
      props: [HStack, VStack, GeometryReader, DragGesture, .accessibilityAdjustableAction, .accessibilityValue, .accessibilityAction, .focusable, .onMoveCommand, .onKeyPress, ViewThatFits, Button, UserDefaults]
      notes: 'Regular width and Catalyst; below `stackBelow` (the splitter''s own width via `GeometryReader`) a horizontal splitter stacks its panes and renders no separator. The separator is a `Rectangle` with the wider grab area (`.contentShape`, `max(handleSize, minTarget)`), a `DragGesture` mapping to percent, and is one accessibility element (`.accessibilityLabel(label)`, `.accessibilityValue(copy.sizeText)`, `.accessibilityAdjustableAction` by `step`, custom actions `setMinimum`/`setMaximum`/`collapse`/`expand`); on iPad it is `.focusable()` with arrows/Home/End/Enter per the table (F6 has no equivalent). `persistKey` uses `UserDefaults.standard` (the platform''s own store; no dependency). The collapse `Button` sits on the separator per `collapseButtonOffset`.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    - name: arrow-grows-the-primary-pane
      description: ArrowRight grows the primary pane by step on a horizontal splitter, and a key press is a complete interaction, so the end event fires too.
      given: { defaultSize: 50 }
      when: { key: ArrowRight }
      then:
        - { event: onSizeChange }
        - { event: onSizeChangeEnd }
      platforms: [web, lit]
    - name: arrow-shrinks-the-primary-pane
      given: { defaultSize: 50 }
      when: { key: ArrowLeft }
      then:
        - { event: onSizeChange }
        - { event: onSizeChangeEnd }
      platforms: [web, lit]
    - name: home-sets-the-primary-pane-to-its-minimum
      given: { defaultSize: 50, minSize: 20 }
      when: { key: Home }
      then:
        - { event: onSizeChange }
        - { event: onSizeChange, with: 20, platforms: [lit] }
      platforms: [web, lit]
    - name: end-sets-the-primary-pane-to-its-maximum
      given: { defaultSize: 50, maxSize: 80 }
      when: { key: End }
      then:
        - { event: onSizeChange }
        - { event: onSizeChange, with: 80, platforms: [lit] }
      platforms: [web, lit]
    - name: enter-collapses-a-collapsible-pane
      given: { collapsible: true, defaultSize: 40 }
      when: { key: Enter }
      then:
        - { event: onCollapseChange }
        - { event: onCollapseChange, with: true, platforms: [lit] }
      platforms: [web, lit]
    - name: enter-does-nothing-when-the-pane-cannot-collapse
      description: Collapsing is what `collapsible` turns on; without it Enter on the separator has nothing to do.
      when: { key: Enter }
      then:
        - { event: onCollapseChange, fired: false }
      platforms: [web, lit]
    - name: the-collapse-button-collapses-the-pane
      description: Drag past the minimum, Enter, or the collapse button - the three ways the doc gives to collapse the primary pane.
      given: { collapsible: true, defaultSize: 40 }
      when: { click: collapseButton }
      then:
        - { event: onCollapseChange }
    - name: a-collapsed-pane-ignores-the-arrow-keys
      description: While collapsed, arrows, Home, End and pointer drag do nothing; only Enter or the collapse button restores.
      given: { collapsible: true, defaultCollapsed: true }
      when: { key: ArrowRight }
      then:
        - { event: onSizeChange, fired: false }
      platforms: [web, lit]
    - name: the-separator-reports-its-size-and-bounds
      description: A resizable separator carries valuenow/min/max so a keyboard user hears the percentage.
      given: { defaultSize: 40, minSize: 15, maxSize: 85 }
      then:
        - { attribute: aria-valuenow, is: '40' }
        - { attribute: aria-valuemin, is: '15' }
        - { attribute: aria-valuemax, is: '85' }
      platforms: [web]
    - name: the-separator-is-a-focusable-widget
      description: A resizable separator is a focusable widget per ARIA; a static one would not be in the tab order.
      then:
        - { focusable: true }
      platforms: [web]
  examples:
    - name: sidebar-and-content
      description: The default sidebar beside a content area, its width remembered per user.
      given: { label: Sidebar width, primary: 'A navigation tree', secondary: 'The selected document', defaultSize: 25, persistKey: app-sidebar }
    - name: collapsible-navigation
      description: A sidebar that collapses to nothing with Enter or the collapse button, and restores its last size.
      given: { label: Sidebar width, primary: 'A navigation tree', secondary: 'The selected document', collapsible: true, minSize: 15 }
    - name: editor-over-preview
      description: A stacked split where the separator moves the boundary up and down.
      given: { label: Editor height, primary: 'The editor', secondary: 'The preview', orientation: vertical, defaultSize: 60 }
    - name: never-stacking-workbench
      description: A split that keeps both panes side by side at every width, for a desktop workbench.
      given: { label: List width, primary: 'The result list', secondary: 'The detail view', stackBelow: never, step: 5 }
---

A splitter gives the user control of a layout decision the designer could not make for everyone: how wide the sidebar is, how tall the preview is. It is a separator the keyboard can move, a pane that can collapse, and a memory of where it was left.

## When to use

Use a Splitter when two regions compete for space and the right split depends on the task: a navigation tree beside content, a list beside a detail view, a code editor beside its output, a map beside results. Make the primary pane the one whose size matters (the sidebar), set sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for sidebars.

## When not to use

Do not use a Splitter on phone-width layouts — it stacks below `stackBelow`, and a screen that is only ever phone-sized should use a Stack or Tabs. Do not use it to lay out static content that never needs resizing (Stack, Container), or for more than two panes without nesting (nest a Splitter in a pane; more than three resizable regions is a workbench, not a page). Do not use it as a Disclosure for a panel that is either open or closed; that is a collapsible pane without the resizing, which Disclosure handles.

## Behavior

Dragging the separator resizes the primary pane within `minSize`–`maxSize`; arrow keys move it by `step`, Home/End to the bounds. With `collapsible`, dragging past `minSize`, Enter, or the collapse button collapses the primary pane to nothing (its content becomes inert) and Enter or the button restores the previous size; while collapsed the separator ignores drag and every key but Enter. `collapsed` is controlled or starts from `defaultCollapsed`. `onSizeChange` fires continuously, `onSizeChangeEnd` once per drag or key press. F6 cycles primary → separator → secondary. Below `stackBelow` (measured on the splitter's own width with a ResizeObserver, the breakpoint read from the built token JSON, `literal-ok`) a horizontal splitter stacks its panes in source order at full width and does not render the separator; a vertical one never stacks. With `persistKey` the last size and collapsed state are restored on mount.

## Content guidelines

Name the separator by what it resizes ("Sidebar width"), not "splitter". The primary pane should be the one with the more predictable content (navigation, a list), so the secondary can absorb the rest. Give each pane its own scroll region; the splitter never scrolls as a whole.

## Accessibility

The separator is a focusable `separator` with `aria-orientation`, `aria-valuenow`/`min`/`max`/`valuetext` and a name (WCAG 4.1.2; APG window splitter), so keyboard users resize with arrows and hear the percentage (2.1.1). Dragging has the keyboard as its alternative (2.5.1, 2.5.7). The separator's hit area meets the minimum target though the line is thin (2.5.8), and it shows focus with the ring (2.4.7). Collapsed content is inert so it is not read or tabbed into. Stacking below the breakpoint keeps content available at 320px without horizontal scrolling (1.4.10). Collapse animates only under normal motion settings (2.3.3).

## Platform notes

### Web
Render `<div data-ds="Splitter" class="ds-splitter--{orientation}" style="--ds-splitter-primary-size: {size}%">` as a grid of primary pane `<div id>`, separator, secondary pane. Separator: `<div role="separator" tabindex="0" aria-orientation={horizontal ? 'vertical' : 'horizontal'} aria-valuenow aria-valuemin aria-valuemax aria-valuetext={copy.sizeText} aria-label aria-controls>` with a `::before` grab area of `handleSize` and a centered grip; `pointerdown` captures and `pointermove` maps the pointer to percent, clamped, snapping to collapse past `minSize` when `collapsible`; keydown per the table; `collapseButton` positioned on the separator. Container query on the container for `stackBelow` via `ResizeObserver` on the splitter's own inline size (`literal-ok: breakpoint from layout.maxWidth.*`; guarded when `ResizeObserver` is absent, as Toolbar); when stacked the separator and collapse Button are not rendered. Reduced motion removes the collapse transition. `persistKey` → `localStorage` in try/catch.

### Lit
`<ds-splitter label="Sidebar width" collapsible persist-key="app-sidebar"><nav slot="primary">…</nav><main slot="secondary">…</main></ds-splitter>`; shadow separator; host custom property; composed events.

### React Native
`View` row (or column) with the primary `View` at `flexBasis` percent, the separator `View` (`PanResponder`, `accessibilityRole="adjustable"`, `accessibilityValue`, `accessibilityActions` increment/decrement with `onAccessibilityAction`), and the secondary `View` at `flex: 1`. Stack below the prose width. `persistKey` via AsyncStorage when the package is present.

## Related

Stack, Container, Tree, Disclosure, Tabs.
