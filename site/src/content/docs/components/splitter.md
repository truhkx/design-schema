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
    defaultSize:
      type: number
      default: 30
      description: Initial primary size, percent.
    minSize:
      type: number
      default: 10
      description: Smallest primary size, percent. Below `collapseThreshold` the pane collapses instead.
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
    persistKey:
      type: string
      description: 'When set, the size is remembered per user under this key (localStorage / AsyncStorage) so a sidebar stays where it was left.'
    stackBelow:
      type: enum
      values: [prose, content, never]
      default: prose
      description: 'Below this layout width a horizontal splitter stacks its panes and the separator becomes inert (a phone has no room for two panes side by side).'
  events:
    onSizeChange:
      description: Fired continuously while dragging and on each key press, with the primary size in percent.
      platforms: { web: onSizeChange, lit: size-change, rn: onSizeChange }
    onSizeChangeEnd:
      description: Fired once when a drag ends, with the final size.
      platforms: { web: onSizeChangeEnd, lit: size-change-end, rn: onSizeChangeEnd }
    onCollapseChange:
      description: Fired when the primary pane collapses or restores.
      platforms: { web: onCollapseChange, lit: collapse-change, rn: onCollapseChange }
  keyboard:
    - { keys: [Tab], action: 'The separator is a tab stop between the two panes'' content.', from: any, expect: manual }
    - { keys: [ArrowRight, ArrowDown], action: 'Grows the primary pane by `step` (ArrowDown when vertical; ArrowRight when horizontal).', from: first, expect: manual }
    - { keys: [ArrowLeft, ArrowUp], action: Shrinks the primary pane by `step`., from: first, expect: manual }
    - { keys: [Home], action: Sets the primary pane to `minSize`., from: first, expect: manual }
    - { keys: [End], action: Sets the primary pane to `maxSize`., from: first, expect: manual }
    - { keys: [Enter], action: 'Collapses the primary pane, or restores it to its previous size.', when: collapsible, from: first, expect: manual }
    - { keys: [F6], action: 'Moves focus to the next pane (from the separator to the secondary; from a pane to the next), the APG convenience for cycling panes.', from: any, expect: manual }
  styles:
    separatorSize: { token: space.1, description: 'The visible line. The grab area is wider: `handleSize` centered on it.' }
    separatorColor: { token: color.border }
    separatorHover: { token: color.border.strong }
    separatorActive: { token: color.control.selectedBackground, description: 'While dragging or focused.' }
    handleSize: { token: space.3, description: 'Pointer grab area, centered on the separator and overlapping both panes so the panes'' content keeps the full width.' }
    grip: { token: color.border.strong, description: 'A short centered grip mark on the separator, so the divider reads as draggable.' }
    gripLength: { token: space.6 }
    collapseButtonOffset: { token: space.2 }
    paneMinTarget: { token: size.target.comfortable, description: 'A pane never shrinks below this on the drag axis before collapsing, so its scrollbar and content stay usable.' }
    minTarget: { token: size.target.min, description: 'Separator hit area along the drag axis.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    transition: { token: motion.duration.fast, description: 'Collapse and restore, and the separator color; dragging itself has no transition.' }
  copy:
    collapse: 'Collapse {label}'
    expand: 'Expand {label}'
    sizeText: '{percent}%'
  a11y:
    role: separator
    requires: [accessible-name, keyboard-operable, focus-visible, contrast-aa, target-24px, gesture-alternative, reduced-motion]
    contrast:
      - { foreground: color.border.strong, background: color.background, level: AA, large: true }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, large: true }
  platforms:
    web:
      element: div
      attributes: [role=separator, tabindex=0, aria-orientation, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-label, aria-controls]
      notes: 'A container with CSS grid (grid-template-columns: var(--ds-splitter-primary-size) auto 1fr, or rows when vertical) whose primary size is a custom property in percent; the separator is <div role="separator" tabindex="0" aria-orientation aria-valuenow aria-valuemin aria-valuemax aria-valuetext aria-label aria-controls={primaryId}> (aria-orientation is the separator''s own: vertical for a horizontal splitter). Pointer Events with setPointerCapture on the separator; the grab area is a wider ::before. A resizable separator is a focusable widget per ARIA (a static separator would not have tabindex). Collapse: the primary pane gets inert and inline-size 0; the collapse Button (ghost, sm, iconOnly, chevron Icon) sits on the separator. Below the stackBelow width a container query switches to a single column, the separator loses tabindex and role becomes "presentation", and both panes render in full. persistKey reads/writes localStorage inside try/catch.'
    lit:
      tag: ds-splitter
      reflect: [orientation, collapsible, collapsed, stack-below]
      notes: 'Slots `primary` and `secondary`; the separator lives in the shadow root and controls the slotted primary via a host custom property. Composed events. Container query on :host.'
    rn:
      element: View
      props: [accessibilityRole=adjustable, accessibilityLabel, accessibilityValue, accessibilityActions]
      notes: 'Tablets and react-native-web only; on phones (width below the prose max) the panes always stack and the separator is not rendered. The separator is a View with a PanResponder and accessibilityRole="adjustable", accessibilityValue={{ min, max, now, text }}, accessibilityActions increment/decrement mapped to step — the gesture alternative. persistKey uses AsyncStorage when available, else memory.'
---

A splitter gives the user control of a layout decision the designer could not make for everyone: how wide the sidebar is, how tall the preview is. It is a separator the keyboard can move, a pane that can collapse, and a memory of where it was left.

## When to use

Use a Splitter when two regions compete for space and the right split depends on the task: a navigation tree beside content, a list beside a detail view, a code editor beside its output, a map beside results. Make the primary pane the one whose size matters (the sidebar), set sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for sidebars.

## When not to use

Do not use a Splitter on phone-width layouts — it stacks below `stackBelow`, and a screen that is only ever phone-sized should use a Stack or Tabs. Do not use it to lay out static content that never needs resizing (Stack, Container), or for more than two panes without nesting (nest a Splitter in a pane; more than three resizable regions is a workbench, not a page). Do not use it as a Disclosure for a panel that is either open or closed; that is a collapsible pane without the resizing, which Disclosure handles.

## Behavior

Dragging the separator resizes the primary pane within `minSize`–`maxSize`; arrow keys move it by `step`, Home/End to the bounds. With `collapsible`, dragging past the minimum, Enter, or the collapse button collapses the primary pane to nothing (its content becomes inert) and Enter or the button restores the previous size. `onSizeChange` fires continuously, `onSizeChangeEnd` once. F6 cycles focus between panes. Below `stackBelow` the panes stack in source order at full width and the separator is inert. With `persistKey` the last size and collapsed state are restored on mount.

## Content guidelines

Name the separator by what it resizes ("Sidebar width"), not "splitter". The primary pane should be the one with the more predictable content (navigation, a list), so the secondary can absorb the rest. Give each pane its own scroll region; the splitter never scrolls as a whole.

## Accessibility

The separator is a focusable `separator` with `aria-orientation`, `aria-valuenow`/`min`/`max`/`valuetext` and a name (WCAG 4.1.2; APG window splitter), so keyboard users resize with arrows and hear the percentage (2.1.1). Dragging has the keyboard as its alternative (2.5.1, 2.5.7). The separator's hit area meets the minimum target though the line is thin (2.5.8), and it shows focus with the ring (2.4.7). Collapsed content is inert so it is not read or tabbed into. Stacking below the breakpoint keeps content available at 320px without horizontal scrolling (1.4.10). Collapse animates only under normal motion settings (2.3.3).

## Platform notes

### Web
Render `<div data-ds="Splitter" class="ds-splitter--{orientation}" style="--ds-splitter-primary-size: {size}%">` as a grid of primary pane `<div id>`, separator, secondary pane. Separator: `<div role="separator" tabindex="0" aria-orientation={horizontal ? 'vertical' : 'horizontal'} aria-valuenow aria-valuemin aria-valuemax aria-valuetext={copy.sizeText} aria-label aria-controls>` with a `::before` grab area of `handleSize` and a centered grip; `pointerdown` captures and `pointermove` maps the pointer to percent, clamped, snapping to collapse past `minSize` when `collapsible`; keydown per the table; `collapseButton` positioned on the separator. Container query on the container for `stackBelow` (`literal-ok: breakpoint from layout.maxWidth.*`). Reduced motion removes the collapse transition. `persistKey` → `localStorage` in try/catch.

### Lit
`<ds-splitter label="Sidebar width" collapsible persist-key="app-sidebar"><nav slot="primary">…</nav><main slot="secondary">…</main></ds-splitter>`; shadow separator; host custom property; composed events.

### React Native
`View` row (or column) with the primary `View` at `flexBasis` percent, the separator `View` (`PanResponder`, `accessibilityRole="adjustable"`, `accessibilityValue`, `accessibilityActions` increment/decrement with `onAccessibilityAction`), and the secondary `View` at `flex: 1`. Stack below the prose width. `persistKey` via AsyncStorage when the package is present.

## Related

Stack, Container, Tree, Disclosure, Tabs.
