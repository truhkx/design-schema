# Generate: Splitter for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Splitter.tsx` exporting a typed React function component named `Splitter`, plus `Splitter.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Splitter({ ref, …rest }: SplitterProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Splitter> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Splitter.test.tsx`.
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
        `vertical` stacks them.'
    primary:
      type: content
      required: true
      description: The first pane (start or top). Its size is what the separator controls
        and reports.
    secondary:
      type: content
      required: true
      description: The second pane, which takes the remaining space.
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
        the hard floor.
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
      description: Fired continuously while dragging and on each key press, with the
        primary size in percent.
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
        key press (a key press is a complete interaction), so a caller can persist
        on it.
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
      when horizontal).
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
      none, on the pane wrapper itself (tabindex -1). The APG convenience for cycling
      panes; not available on native.
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
      description: While dragging or focused.
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
    collapseButtonOffset:
      token: space.2
      part: collapseButton
      description: Distance of the collapse Button from the separator's start edge
        along the separator (top of a vertical separator, inline-start of a horizontal
        one); the button is centered across the separator and overlaps both panes.
      locked: false
    paneMinTarget:
      token: size.target.comfortable
      description: 'A pane never shrinks below this on the drag axis before collapsing,
        so its scrollbar and content stay usable: a CSS minmax() floor on both grid
        tracks beneath the percent clamp (a very narrow container can therefore show
        the pane wider than its percent). Dropped for the primary track while collapsed
        so collapse reaches zero.'
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
      description: Collapse and restore, and the separator color; dragging itself
        has no transition.
      locked: false
  copy:
    collapse: Collapse {label}
    expand: Expand {label}
    sizeText:
      text: '{percent}%'
      params:
        percent:
          type: number
          description: The primary pane's size as a percentage of the container.
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
      notes: 'A container with CSS grid (grid-template-columns: var(--ds-splitter-primary-size)
        auto 1fr, or rows when vertical) whose primary size is a custom property in
        percent; the separator is <div role="separator" tabindex="0" aria-orientation
        aria-valuenow aria-valuemin aria-valuemax aria-valuetext aria-label aria-controls={primaryId}>
        (aria-orientation is the separator''s own: vertical for a horizontal splitter).
        Pointer Events with setPointerCapture on the separator; the grab area is a
        wider ::before. A resizable separator is a focusable widget per ARIA (a static
        separator would not have tabindex). Collapse: the primary pane gets inert
        and inline-size 0; the collapse Button (ghost, sm, iconOnly, chevron Icon)
        sits on the separator. Below the stackBelow width a container query switches
        to a single column, the separator is not rendered, and both panes render in
        full. persistKey reads/writes localStorage inside try/catch.'
    lit:
      tag: ds-splitter
      reflect:
      - orientation
      - collapsible
      - collapsed
      - stack-below
      notes: Slots `primary` and `secondary`; the separator lives in the shadow root
        and controls the slotted primary via a host custom property. Composed events.
        Container query on :host.
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
        (step), setMinimum/setMaximum (Home/End) and activate (Enter: collapse/restore)
        — the gesture alternative. F6 has no native equivalent. persistKey is a module-level
        memory map.'
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

- `F6` (Cycles focus primary pane → separator → secondary pane → primary pane (wrapping), landing on the region's first focusable descendant or, when it has none, on the pane wrapper itself (tabindex -1). The APG convenience for cycling panes; not available on native.): expect manual

## Copy

- `collapse`: "Collapse {label}"
- `expand`: "Expand {label}"
- `sizeText`: "{percent}%"; params `percent` (number)

## Constants and examples

- example `sidebar-and-content`, story `SidebarAndContent`: given `label: "Sidebar width"`, `primary: "A navigation tree"`, `secondary: "The selected document"`, `defaultSize: 25`, `persistKey: "app-sidebar"`; The default sidebar beside a content area, its width remembered per user.
- example `collapsible-navigation`, story `CollapsibleNavigation`: given `label: "Sidebar width"`, `primary: "A navigation tree"`, `secondary: "The selected document"`, `collapsible: true`, `minSize: 15`; A sidebar that collapses to nothing with Enter or the collapse button, and restores its last size.
- example `editor-over-preview`, story `EditorOverPreview`: given `label: "Editor height"`, `primary: "The editor"`, `secondary: "The preview"`, `orientation: "vertical"`, `defaultSize: 60`; A stacked split where the separator moves the boundary up and down.
- example `never-stacking-workbench`, story `NeverStackingWorkbench`: given `label: "List width"`, `primary: "The result list"`, `secondary: "The detail view"`, `stackBelow: "never"`, `step: 5`; A split that keeps both panes side by side at every width, for a desktop workbench.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `separatorSize`, `separatorColor`, `handleSize`, `gripLength`, `collapseButtonOffset`, `transition`
Locked (accessibility-bearing, never overridable): `separatorHover`, `separatorActive`, `grip`, `paneMinTarget`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (17)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: arrow-grows-the-primary-pane
  description: ArrowRight grows the primary pane by step on a horizontal splitter,
    and a key press is a complete interaction, so the end event fires too.
  given:
    defaultSize: 50
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
  when:
    key: Home
  then:
  - event: onSizeChange
  platforms:
  - web
  - lit
- name: end-sets-the-primary-pane-to-its-maximum
  given:
    defaultSize: 50
    maxSize: 80
  when:
    key: End
  then:
  - event: onSizeChange
  platforms:
  - web
  - lit
- name: enter-collapses-a-collapsible-pane
  given:
    collapsible: true
    defaultSize: 40
  when:
    key: Enter
  then:
  - event: onCollapseChange
  platforms:
  - web
  - lit
- name: enter-does-nothing-when-the-pane-cannot-collapse
  description: Collapsing is what `collapsible` turns on; without it Enter on the
    separator has nothing to do.
  when:
    key: Enter
  then:
  - event: onCollapseChange
    fired: false
  platforms:
  - web
  - lit
- name: the-collapse-button-collapses-the-pane
  description: Drag past the minimum, Enter, or the collapse button - the three ways
    the doc gives to collapse the primary pane.
  given:
    collapsible: true
    defaultSize: 40
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
  when:
    key: ArrowRight
  then:
  - event: onSizeChange
    fired: false
  platforms:
  - web
  - lit
- name: the-separator-reports-its-size-and-bounds
  description: A resizable separator carries valuenow/min/max so a keyboard user hears
    the percentage.
  given:
    defaultSize: 40
    minSize: 15
    maxSize: 85
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
  then:
  - focusable: true
  platforms:
  - web
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

## Platform notes (web)

```yaml
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
notes: 'A container with CSS grid (grid-template-columns: var(--ds-splitter-primary-size)
  auto 1fr, or rows when vertical) whose primary size is a custom property in percent;
  the separator is <div role="separator" tabindex="0" aria-orientation aria-valuenow
  aria-valuemin aria-valuemax aria-valuetext aria-label aria-controls={primaryId}>
  (aria-orientation is the separator''s own: vertical for a horizontal splitter).
  Pointer Events with setPointerCapture on the separator; the grab area is a wider
  ::before. A resizable separator is a focusable widget per ARIA (a static separator
  would not have tabindex). Collapse: the primary pane gets inert and inline-size
  0; the collapse Button (ghost, sm, iconOnly, chevron Icon) sits on the separator.
  Below the stackBelow width a container query switches to a single column, the separator
  is not rendered, and both panes render in full. persistKey reads/writes localStorage
  inside try/catch.'
```

## Guidance

## Overview

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
