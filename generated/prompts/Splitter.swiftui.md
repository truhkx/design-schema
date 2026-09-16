# Generate: Splitter for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Splitter.swift` declaring `public struct Splitter: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/SplitterBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Splitter.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Splitter") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Splitter")` on the root and `"Splitter.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Splitter
  category: layout
  status: review
  apg: windowsplitter
  anatomy:
  - container
  - primaryPane
  - secondaryPane
  - separator
  - handle
  - collapseButton
  composition:
    collapseButton: Button
  props:
    label:
      type: string
      required: true
      description: What the divider resizes ("Sidebar width", "Preview height"). The
        separator's accessible name.
      a11y: aria-label on the separator.
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: '`horizontal` places panes side by side (the separator is vertical);
        `vertical` stacks them. The splitter fills its parent (block-size 100%), so
        a vertical splitter needs a parent with a definite height.'
    primary:
      type: content
      required: true
      description: The first pane (start or top). Its size is what the separator controls
        and reports. On React Native the component wraps string or number content
        in the package `Text` (as Disclosure does); on Lit this is the `primary` slot.
    secondary:
      type: content
      required: true
      description: The second pane, which takes the remaining space. Strings are wrapped
        in `Text` on React Native, as `primary`; on Lit this is the `secondary` slot.
    size:
      type: number
      description: Controlled size of the primary pane as a percentage of the container
        (0–100).
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
      description: Smallest primary size, percent. With `collapsible`, dragging or
        stepping below it collapses the pane instead of clamping; otherwise it is
        the hard floor. An arrow step that would cross it from above clamps to `minSize`
        first, and the next shrink step from `minSize` collapses; Home sets `minSize`
        and never collapses. A collapse fires only onCollapseChange, no size events.
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
      description: 'The primary pane can collapse to nothing: drag past the minimum,
        press Enter on the separator, or use the collapse button. Enter again restores
        the last size.'
    collapsed:
      type: boolean
      description: 'Controlled collapsed state. Ignored unless `collapsible`. On Lit
        the property is `boolean | undefined` reflected when true: a controlled `false`
        is set as a property, and an absent attribute means uncontrolled.'
      controls:
        event: onCollapseChange
        default: defaultCollapsed
    defaultCollapsed:
      type: boolean
      default: false
      description: Initial collapsed state when uncontrolled.
    persistKey:
      type: string
      description: 'When set, the size and collapsed state are remembered per user
        under this key so a sidebar stays where it was left: localStorage on web and
        Lit (in try/catch); on native a module-level memory map (no storage dependency
        is allowed), which survives remounts but not a restart.'
    stackBelow:
      type: enum
      values:
      - prose
      - content
      - never
      default: prose
      description: Below this width of the splitter's own box (a container query,
        not the viewport, so nested splitters work) a horizontal splitter stacks its
        panes and the separator is not rendered. A vertical splitter never stacks.
        All three values apply on every platform (`content` = layout.maxWidth.content,
        `never` = no stacking).
  events:
    onSizeChange:
      description: Fired continuously while dragging and on each key press that changes
        the size, with the primary size in percent (unrounded). A key press at a bound
        (End at `maxSize`, Home at `minSize`) fires nothing.
      platforms:
        web: onSizeChange
        lit: size-change
        rn: onSizeChange
        swiftui: onSizeChange
      payload:
      - name: size
        type: number
        description: The primary pane size in percent.
      fires:
      - user
    onSizeChangeEnd:
      description: Fired with the final size once when a drag ends and after each
        key press that changed the size (a key press is a complete interaction), so
        a caller can persist on it. A drag always fires it once on release; if the
        drag collapsed the pane, the rest of that gesture is ignored and it carries
        the last expanded size, since a collapsed pane keeps its size for restoring.
      platforms:
        web: onSizeChangeEnd
        lit: size-change-end
        rn: onSizeChangeEnd
        swiftui: onSizeChangeEnd
      payload:
      - name: size
        type: number
        description: The final primary pane size in percent.
      fires:
      - user
      timing:
        phase: commit
    onCollapseChange:
      description: Fired when the primary pane collapses or restores.
      platforms:
        web: onCollapseChange
        lit: collapse-change
        rn: onCollapseChange
        swiftui: onCollapseChange
      payload:
      - name: collapsed
        type: boolean
        description: True when the primary pane is now collapsed.
      fires:
      - user
  keyboard:
  - keys:
    - Tab
    action: The separator is a tab stop between the two panes' content.
    from: any
    expect: manual
  - keys:
    - ArrowRight
    - ArrowDown
    action: Grows the primary pane by `step` (ArrowDown when vertical; ArrowRight
      when horizontal). In RTL a horizontal splitter swaps ArrowLeft and ArrowRight,
      so the separator moves the way the arrow points, as dragging does.
    from: first
    expect: manual
  - keys:
    - ArrowLeft
    - ArrowUp
    action: Shrinks the primary pane by `step`.
    from: first
    expect: manual
  - keys:
    - Home
    action: Sets the primary pane to `minSize`.
    from: first
    expect: manual
  - keys:
    - End
    action: Sets the primary pane to `maxSize`.
    from: first
    expect: manual
  - keys:
    - Enter
    action: Collapses the primary pane, or restores it to its previous size. While
      collapsed, arrows, Home, End and pointer drag do nothing; only Enter or the
      collapse button restores.
    when: collapsible
    from: first
    expect: manual
  - keys:
    - F6
    action: Cycles focus primary pane → separator → secondary pane → primary pane
      (wrapping), landing on the region's first focusable descendant or, when it has
      none, on the pane wrapper itself (tabindex -1). A collapsed (inert) primary
      pane is skipped; while stacked there is no separator and the cycle is primary
      → secondary. The collapse Button belongs to the separator zone (F6 lands on
      the separator). Shift+F6 is not handled. The APG convenience for cycling panes;
      not available on native.
    from: any
    expect: manual
    platforms:
    - web
    - lit
  styles:
    separatorSize:
      token: space.1
      part: separator
      description: 'The visible line. The grab area is wider: `handleSize` centered
        on it.'
      locked: false
    separatorColor:
      token: color.border
      part: separator
      locked: false
    separatorHover:
      token: color.border.strong
      part: separator
      state: hover
      description: Pointer hover; unused on native.
      locked: true
    separatorActive:
      token: color.control.selectedBackground
      part: separator
      state: dragging
      description: While dragging or focused (:focus-visible). The dragging state
        is a `ds-splitter--dragging` root class on web and a `data-dragging` attribute
        on the Lit separator. On native the separator has no focus events, so it applies
        only while dragging.
      locked: true
    handleSize:
      token: space.3
      part: handle
      description: Pointer grab area, centered on the separator and overlapping both
        panes so the panes' content keeps the full width. The effective hit area is
        max(handleSize, minTarget), so the locked floor cannot be overridden away.
      locked: false
    grip:
      token: color.border.strong
      description: 'A short centered grip mark on the separator, so the divider reads
        as draggable: a rounded bar of gripLength along the separator and separatorSize
        across it.'
      locked: true
    gripLength:
      token: space.6
      locked: false
    gripRadius:
      token: radius.full
      description: Rounds the grip bar's ends.
      locked: false
    collapseButtonOffset:
      token: space.2
      part: collapseButton
      description: Distance of the collapse Button from the separator's start edge
        along the separator (top of a vertical separator, inline-start of a horizontal
        one); the button is centered across the separator and overlaps both panes.
        While collapsed the primary pane has no size, so the button aligns to the
        secondary pane's start edge instead of hanging outside the container.
      locked: false
    paneMinTarget:
      token: size.target.comfortable
      description: 'A pane never shrinks below this on the drag axis before collapsing,
        so its scrollbar and content stay usable: a CSS minmax() floor on both grid
        tracks beneath the percent clamp (a very narrow container can therefore show
        the pane wider than its percent). Dropped for the primary track while collapsed
        so collapse reaches zero. On native it is minWidth (or minHeight when vertical)
        on both panes, dropped for the primary pane while collapsed.'
      locked: true
    minTarget:
      token: size.target.min
      description: Separator hit area along the drag axis.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    transition:
      token: motion.duration.fast
      description: 'Collapse and restore, and the separator color; dragging itself
        has no transition. The pane size is a custom property driving a grid track,
        which only animates where `@property` registration is reliable — where it
        is not, collapse and restore are instant and only the separator colour transitions.
        Only a change of the collapsed state animates; key steps and drags resize
        instantly. Web and Lit register the same property the same way (`--ds-splitter-primary-size`,
        syntax `<percentage>`, not inherited): Lit calls CSS.registerProperty at module
        load in try/catch because @property does not apply inside shadow roots. On
        native, collapse and restore animate and the separator colour switches instantly.'
      locked: false
  copy:
    collapse: Collapse {label}
    expand: Expand {label}
    setMinimum: Minimum {label}
    setMaximum: Maximum {label}
    sizeText:
      text: '{percent}%'
      params:
        percent:
          type: number
          description: The primary pane's size as a percentage of the container, rounded
            to a whole number (as is aria-valuenow); 0 while collapsed, with aria-valuemin
            0 so the value stays in range.
  a11y:
    role: separator
    requires:
    - accessible-name
    - keyboard-operable
    - arrow-navigation
    - focus-visible
    - contrast-aa
    - target-24px
    - gesture-alternative
    - reduced-motion
    contrast:
    - foreground: color.border.strong
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
  platforms:
    web:
      element: div
      attributes:
      - role=separator
      - tabindex=0
      - aria-orientation
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-label
      - aria-controls
      notes: 'A container with CSS grid (grid-template-columns: minmax(paneMinTarget,
        var(--ds-splitter-primary-size)) var(--ds-splitter-separator-size) minmax(paneMinTarget,
        1fr), or rows when vertical) whose primary size is a custom property in percent;
        the separator is <div role="separator" tabindex="0" aria-orientation aria-valuenow
        aria-valuemin aria-valuemax aria-valuetext aria-label aria-controls={primaryId}>
        (aria-orientation is the separator''s own: vertical for a horizontal splitter).
        Pointer Events with setPointerCapture on the separator; the grab area is a
        wider ::before. A resizable separator is a focusable widget per ARIA (a static
        separator would not have tabindex). Collapse: the primary pane gets inert
        and inline-size 0; the collapse Button (ghost, sm, iconOnly, aria-expanded={!collapsed},
        aria-controls={primaryId}) is positioned over the separator line. role=separator
        has presentational children, so the Button is not inside it: the middle grid
        item is a Splitter-owned track wrapper holding the separator and, as its sibling,
        a span[data-part=collapseButton] wrapper around the Button (Button writes
        its own data-part). The Button''s Icon is chevron-left/chevron-right when
        horizontal and chevron-up/chevron-down when vertical, pointing toward the
        primary pane while expanded and away from it while collapsed (mirrored in
        RTL), in the Button''s own ghost foreground; it follows the separator in tab
        order. Below the stackBelow width a container query switches to a single column,
        the separator is not rendered, and both panes render in full. persistKey reads/writes
        localStorage inside try/catch.'
    lit:
      tag: ds-splitter
      reflect:
      - orientation
      - collapsible
      - collapsed
      - stack-below
      notes: Slots `primary` and `secondary`; the separator lives in the shadow root
        and controls the slotted primary via a host custom property. Composed events.
        Stacking uses a ResizeObserver on the host with the breakpoint read from the
        loaded --layout-max-width-* custom property, as web (@container cannot read
        custom properties; no literal breakpoints). The F6 pane wrapper takes tabindex=-1
        only while focused that way and drops it on blur, so it never becomes the
        delegatesFocus target. Parts, the collapse Button wrapper and its Icon follow
        the web notes. Example string values for `primary`/`secondary` render as slotted
        text in stories.
    rn:
      element: View
      props:
      - accessibilityRole=adjustable
      - accessibilityLabel
      - accessibilityValue
      - accessibilityActions
      notes: 'Tablets and react-native-web only; below the stackBelow width the panes
        always stack and the separator is not rendered. The separator is a plain View
        with a PanResponder (as Slider''s thumb — panHandlers on a Pressable fight
        its own responder), so it cannot show a keyboard focus ring itself (a known
        platform limit; the composed collapse Button has full focus treatment). accessibilityRole="adjustable",
        accessibilityValue={{ min, max, now, text }}, accessibilityActions increment/decrement
        (step; the system names them), setMinimum/setMaximum (Home/End; labelled copy.setMinimum/copy.setMaximum)
        and activate (Enter: collapse/restore; labelled copy.collapse/copy.expand)
        — the gesture alternative. RN View has no typed key handler, so hardware arrows,
        Home, End and Enter do nothing, including on react-native-web; the accessibility
        actions and the collapse Button are the keyboard and screen-reader route.
        F6 has no native equivalent. stackBelow is measured with onLayout on the splitter''s
        own width (all three values); before the first layout it renders side by side.
        hitSlop is ignored by react-native-web, so the handle part is an absolutely
        positioned child View overflowing the separator by max(handleSize, minTarget).
        The collapse Button is a positioned sibling of the separator placed from its
        measured position, not a child (Android drops touches outside a parent''s
        bounds). persistKey is a module-level memory map.'
    swiftui:
      element: HStack
      props:
      - HStack
      - VStack
      - GeometryReader
      - DragGesture
      - .accessibilityAdjustableAction
      - .accessibilityValue
      - .accessibilityAction
      - .focusable
      - .onMoveCommand
      - .onKeyPress
      - ViewThatFits
      - Button
      - UserDefaults
      notes: Regular width and Catalyst; below `stackBelow` (the splitter's own width
        via `GeometryReader`) a horizontal splitter stacks its panes and renders no
        separator. The separator is a `Rectangle` with the wider grab area (`.contentShape`,
        `max(handleSize, minTarget)`), a `DragGesture` mapping to percent, and is
        one accessibility element (`.accessibilityLabel(label)`, `.accessibilityValue(copy.sizeText)`,
        `.accessibilityAdjustableAction` by `step`, custom actions `setMinimum`/`setMaximum`/`collapse`/`expand`);
        on iPad it is `.focusable()` with arrows/Home/End/Enter per the table (F6
        has no equivalent). `persistKey` uses `UserDefaults.standard` (the platform's
        own store; no dependency). The collapse `Button` sits on the separator per
        `collapseButtonOffset`.
  behavior:
  - name: arrow-grows-the-primary-pane
    description: ArrowRight grows the primary pane by step on a horizontal splitter,
      and a key press is a complete interaction, so the end event fires too.
    given:
      defaultSize: 50
      stackBelow: never
    when:
      key: ArrowRight
    then:
    - event: onSizeChange
    - event: onSizeChangeEnd
    platforms:
    - web
    - lit
  - name: arrow-shrinks-the-primary-pane
    given:
      defaultSize: 50
      stackBelow: never
    when:
      key: ArrowLeft
    then:
    - event: onSizeChange
    - event: onSizeChangeEnd
    platforms:
    - web
    - lit
  - name: home-sets-the-primary-pane-to-its-minimum
    given:
      defaultSize: 50
      minSize: 20
      stackBelow: never
    when:
      key: Home
    then:
    - event: onSizeChange
    - event: onSizeChange
      with: 20
      platforms:
      - lit
    platforms:
    - web
    - lit
  - name: end-sets-the-primary-pane-to-its-maximum
    given:
      defaultSize: 50
      maxSize: 80
      stackBelow: never
    when:
      key: End
    then:
    - event: onSizeChange
    - event: onSizeChange
      with: 80
      platforms:
      - lit
    platforms:
    - web
    - lit
  - name: enter-collapses-a-collapsible-pane
    given:
      collapsible: true
      defaultSize: 40
      stackBelow: never
    when:
      key: Enter
    then:
    - event: onCollapseChange
    - event: onCollapseChange
      with: true
      platforms:
      - lit
    platforms:
    - web
    - lit
  - name: enter-does-nothing-when-the-pane-cannot-collapse
    description: Collapsing is what `collapsible` turns on; without it Enter on the
      separator has nothing to do.
    given:
      stackBelow: never
    when:
      key: Enter
    then:
    - event: onCollapseChange
      fired: false
    platforms:
    - web
    - lit
  - name: the-collapse-button-collapses-the-pane
    description: Drag past the minimum, Enter, or the collapse button - the three
      ways the doc gives to collapse the primary pane.
    given:
      collapsible: true
      defaultSize: 40
      stackBelow: never
    when:
      click: collapseButton
    then:
    - event: onCollapseChange
  - name: a-collapsed-pane-ignores-the-arrow-keys
    description: While collapsed, arrows, Home, End and pointer drag do nothing; only
      Enter or the collapse button restores.
    given:
      collapsible: true
      defaultCollapsed: true
      stackBelow: never
    when:
      key: ArrowRight
    then:
    - event: onSizeChange
      fired: false
    platforms:
    - web
    - lit
  - name: the-separator-reports-its-size-and-bounds
    description: A resizable separator carries valuenow/min/max so a keyboard user
      hears the percentage.
    given:
      defaultSize: 40
      minSize: 15
      maxSize: 85
      stackBelow: never
    then:
    - attribute: aria-valuenow
      is: '40'
    - attribute: aria-valuemin
      is: '15'
    - attribute: aria-valuemax
      is: '85'
    platforms:
    - web
  - name: the-separator-is-a-focusable-widget
    description: A resizable separator is a focusable widget per ARIA; a static one
      would not be in the tab order.
    given:
      stackBelow: never
    then:
    - focusable: true
    platforms:
    - web
  examples:
  - name: sidebar-and-content
    description: The default sidebar beside a content area, its width remembered per
      user.
    given:
      label: Sidebar width
      primary: A navigation tree
      secondary: The selected document
      defaultSize: 25
      persistKey: app-sidebar
  - name: collapsible-navigation
    description: A sidebar that collapses to nothing with Enter or the collapse button,
      and restores its last size.
    given:
      label: Sidebar width
      primary: A navigation tree
      secondary: The selected document
      collapsible: true
      minSize: 15
  - name: editor-over-preview
    description: A stacked split where the separator moves the boundary up and down.
    given:
      label: Editor height
      primary: The editor
      secondary: The preview
      orientation: vertical
      defaultSize: 60
  - name: never-stacking-workbench
    description: A split that keeps both panes side by side at every width, for a
      desktop workbench.
    given:
      label: List width
      primary: The result list
      secondary: The detail view
      stackBelow: never
      step: 5
```

## Events

- `onSizeChange`: emit `onSizeChange`
  - payload, positional, in this order: `size: number`
  - fires on: user
- `onSizeChangeEnd`: emit `onSizeChangeEnd`
  - payload, positional, in this order: `size: number`
  - fires on: user
  - timing: commit
- `onCollapseChange`: emit `onCollapseChange`
  - payload, positional, in this order: `collapsed: boolean`
  - fires on: user

## Controlled state

- `size` is controlled when given, uncontrolled from `defaultSize` when omitted; changes reported by `onSizeChange` (emit `onSizeChange`)
- `collapsed` is controlled when given, uncontrolled from `defaultCollapsed` when omitted; changes reported by `onCollapseChange` (emit `onCollapseChange`)

## Style bindings

- `separatorSize`: token `space.1`; part `separator`
- `separatorColor`: token `color.border`; part `separator`
- `separatorHover`: token `color.border.strong`; part `separator`; state `hover`; locked
- `separatorActive`: token `color.control.selectedBackground`; part `separator`; state `dragging`; locked
- `handleSize`: token `space.3`; part `handle`
- `collapseButtonOffset`: token `space.2`; part `collapseButton`

## Keyboard

- 1 rule(s) in the schema do not apply on swiftui; implement none of them

## Copy

- `collapse`: "Collapse {label}"
- `expand`: "Expand {label}"
- `setMinimum`: "Minimum {label}"
- `setMaximum`: "Maximum {label}"
- `sizeText`: "{percent}%"; params `percent` (number)

## Constants and examples

- example `sidebar-and-content`, story `SidebarAndContent`: given `label: "Sidebar width"`, `primary: "A navigation tree"`, `secondary: "The selected document"`, `defaultSize: 25`, `persistKey: "app-sidebar"`; The default sidebar beside a content area, its width remembered per user.
- example `collapsible-navigation`, story `CollapsibleNavigation`: given `label: "Sidebar width"`, `primary: "A navigation tree"`, `secondary: "The selected document"`, `collapsible: true`, `minSize: 15`; A sidebar that collapses to nothing with Enter or the collapse button, and restores its last size.
- example `editor-over-preview`, story `EditorOverPreview`: given `label: "Editor height"`, `primary: "The editor"`, `secondary: "The preview"`, `orientation: "vertical"`, `defaultSize: 60`; A stacked split where the separator moves the boundary up and down.
- example `never-stacking-workbench`, story `NeverStackingWorkbench`: given `label: "List width"`, `primary: "The result list"`, `secondary: "The detail view"`, `stackBelow: "never"`, `step: 5`; A split that keeps both panes side by side at every width, for a desktop workbench.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `separatorSize`, `separatorColor`, `handleSize`, `gripLength`, `gripRadius`, `collapseButtonOffset`, `transition`
Locked (accessibility-bearing, never overridable): `separatorHover`, `separatorActive`, `grip`, `paneMinTarget`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: HStack
props:
- HStack
- VStack
- GeometryReader
- DragGesture
- .accessibilityAdjustableAction
- .accessibilityValue
- .accessibilityAction
- .focusable
- .onMoveCommand
- .onKeyPress
- ViewThatFits
- Button
- UserDefaults
notes: Regular width and Catalyst; below `stackBelow` (the splitter's own width via
  `GeometryReader`) a horizontal splitter stacks its panes and renders no separator.
  The separator is a `Rectangle` with the wider grab area (`.contentShape`, `max(handleSize,
  minTarget)`), a `DragGesture` mapping to percent, and is one accessibility element
  (`.accessibilityLabel(label)`, `.accessibilityValue(copy.sizeText)`, `.accessibilityAdjustableAction`
  by `step`, custom actions `setMinimum`/`setMaximum`/`collapse`/`expand`); on iPad
  it is `.focusable()` with arrows/Home/End/Enter per the table (F6 has no equivalent).
  `persistKey` uses `UserDefaults.standard` (the platform's own store; no dependency).
  The collapse `Button` sits on the separator per `collapseButtonOffset`.
```

## Guidance

## Overview

A splitter gives the user control of a layout decision the designer could not make for everyone: how wide the sidebar is, how tall the preview is. It is a separator the keyboard can move, a pane that can collapse, and a memory of where it was left.

## When to use

Use a Splitter when two regions compete for space and the right split depends on the task: a navigation tree beside content, a list beside a detail view, a code editor beside its output, a map beside results. Make the primary pane the one whose size matters (the sidebar), set sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for sidebars.

## When not to use

Do not use a Splitter on phone-width layouts — it stacks below `stackBelow`, and a screen that is only ever phone-sized should use a Stack or Tabs. Do not use it to lay out static content that never needs resizing (Stack, Container), or for more than two panes without nesting (nest a Splitter in a pane; more than three resizable regions is a workbench, not a page). Do not use it as a Disclosure for a panel that is either open or closed; that is a collapsible pane without the resizing, which Disclosure handles.

## Behavior

Dragging the separator resizes the primary pane within `minSize`–`maxSize`; arrow keys move it by `step`, Home/End to the bounds. With `collapsible`, dragging past `minSize`, Enter, or the collapse button collapses the primary pane to nothing (its content becomes inert) and Enter or the button restores the previous size; while collapsed the separator ignores drag and every key but Enter. `collapsed` is controlled or starts from `defaultCollapsed`. `onSizeChange` fires continuously, `onSizeChangeEnd` once per drag or key press. F6 cycles primary → separator → secondary and wraps, landing on the first focusable element in the target region or, when it has none, on the region wrapper itself, which takes `tabindex="-1"` for the purpose. Below `stackBelow` (measured on the splitter's own width with a ResizeObserver, the breakpoint read from the loaded `--layout-max-width-*` custom property in px, rem or em; with no tokens loaded, or no ResizeObserver, it never stacks) a horizontal splitter stacks its panes in source order at full width and does not render the separator; a vertical one never stacks. With `persistKey` the last size and collapsed state are restored on mount.

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
`View` row (or column) with the primary `View` at `flexBasis` percent, the separator `View` (`PanResponder`, `accessibilityRole="adjustable"`, `accessibilityValue`, `accessibilityActions` increment/decrement with `onAccessibilityAction`), and the secondary `View` at `flex: 1`. Stack below the `stackBelow` width (all three values, measured with `onLayout`). `persistKey` is a module-level memory map; no storage dependency.

## Related

Stack, Container, Tree, Disclosure, Tabs.

## Behavior scenarios (8)

One test per scenario, in this order.

```yaml
- name: the-collapse-button-collapses-the-pane
  description: Drag past the minimum, Enter, or the collapse button - the three ways
    the doc gives to collapse the primary pane.
  given:
    collapsible: true
    defaultSize: 40
    stackBelow: never
  when:
    click: collapseButton
  then:
  - event: onCollapseChange
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-orientation-horizontal
  given:
    orientation: horizontal
  then:
  - renders: true
  derived: true
- name: renders-orientation-vertical
  given:
    orientation: vertical
  then:
  - renders: true
  derived: true
- name: renders-stack-below-prose
  given:
    stackBelow: prose
  then:
  - renders: true
  derived: true
- name: renders-stack-below-content
  given:
    stackBelow: content
  then:
  - renders: true
  derived: true
- name: renders-stack-below-never
  given:
    stackBelow: never
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
