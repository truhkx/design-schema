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
    collapseButton:
      component: Button
      props:
        variant: ghost
        size: sm
        iconOnly: true
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
      description: 'Controlled size of the primary pane as a percentage of the container
        (0–100). A value outside `minSize`–`maxSize` is clamped for the layout, the
        value text and aria-valuenow, and fires nothing: the caller is told nothing
        it did not already know, and a controlled splitter only ever re-renders from
        its own prop.'
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
        and never collapses. Without `collapsible` a shrink step at `minSize` clamps
        and fires nothing, and a drag collapses only when the pointer maps strictly
        below `minSize`, so landing exactly on it clamps. On React Native, where there
        are no keys, the step rules belong to the decrement accessibility action,
        and setMinimum never collapses as Home does not. A collapse fires only onCollapseChange,
        no size events.
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
        the last size. Without it the collapsed state is pinned false whatever `collapsed`/`defaultCollapsed`
        say, no collapse button is rendered, and `onCollapseChange` never fires by
        any route.'
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
        is allowed), which survives remounts but not a restart. It records every change
        in either mode, so a controlled splitter still remembers what its parent chose;
        on mount the stored value seeds only an uncontrolled `size` or `collapsed`
        (beating `defaultSize`/`defaultCollapsed`), while a controlled prop wins over
        the store. The record is JSON `{size, collapsed}` under the key exactly as
        given, with no namespace prefix, written whenever either value settles — including
        once on the first render, before the user has changed anything. The native
        map is keyed the same way and is neither namespaced nor evicted; it is a per-process
        cache of a handful of splitters, not a store.'
    stackBelow:
      type: enum
      values:
      - prose
      - content
      - never
      default: prose
      description: 'Below this width of the splitter''s own box — its own box, not
        the viewport, so nested splitters work: a ResizeObserver on web and Lit, onLayout
        on native — a horizontal splitter stacks its panes and the separator is not
        rendered. The comparison is strict: it stacks while the box is narrower than
        the breakpoint. A stacked splitter has no separator, so it carries no separator
        name and no size value. A vertical splitter never stacks. While stacked both
        panes render in full and a collapsed primary pane keeps its collapsed state
        without showing it (no hiding, no collapse Button); growing back past the
        breakpoint applies it again. All three values apply on every platform (`prose`
        = layout.maxWidth.prose, `content` = layout.maxWidth.content, `never` = no
        stacking). The token is read as a length in px, rem or em (rem against the
        root font size, em against the splitter''s own); a value in any other unit
        is unreadable and the splitter never stacks, as when the token is absent.'
  events:
    onSizeChange:
      description: 'Fired continuously while dragging and on each key press that changes
        the size, with the primary size in percent (unrounded). It never repeats the
        size it last reported: a key press at a bound (End at `maxSize`, Home at `minSize`)
        fires nothing, the native increment/decrement/setMinimum/setMaximum actions
        fire nothing when the clamped target equals the current size, and a drag on
        past `maxSize` is just as silent — "continuously" means on every move that
        moves the separator, not on every event the platform emits.'
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
        the last expanded size, since a collapsed pane keeps its size for restoring
        — that holds even when the gesture collapsed before ever changing the size,
        a pointer down followed straight by a move below `minSize`. A press that never
        moved the separator is not a drag and fires nothing, so a stray tap on the
        separator is silent; "moved" is a change of the clamped size, not pointer
        travel, so a drag held against `maxSize` is a press by this rule, and a native
        pan responder's move events with a zero delta never make one. A gesture the
        platform cancels counts as a release.
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
      collapse button restores. Those keys are still consumed (preventDefault) so
      a focused separator does not scroll the page instead — the exception is Shift+F6,
      which the splitter leaves to the browser entirely.
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
      the separator). Shift+F6 is not handled at all — the splitter ignores it and
      does not preventDefault, so the browser's own behaviour stands; it does not
      cycle backwards. F6 is handled only while focus is inside the splitter, and
      from the container itself rather than a zone the cycle starts at the primary
      pane. The APG convenience for cycling panes; not available on native.
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
        `handle` is a pseudo-element part on web and Lit — the separator's `::before`
        — so nothing there matches a part selector for it; on native it is the absolutely
        positioned child View, which carries the testID.
      locked: false
    grip:
      token: color.border.strong
      description: 'A short centered grip mark on the separator, so the divider reads
        as draggable: a rounded bar of gripLength along the separator and separatorSize
        across it. The grip is a mark inside the separator and not an anatomy part
        of its own — a pseudo-element on web and Lit, a child View on native — which
        is why it, `gripLength` and `gripRadius` name no `part`.'
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
      description: 'Distance of the collapse Button from the separator''s start edge
        along the separator (top of a vertical separator, inline-start of a horizontal
        one); the button is centered across the separator and overlaps both panes.
        Expanded, that centering is the anchor: the button''s cross-axis center sits
        on the separator line. While collapsed the primary pane has no size, so the
        button aligns to the secondary pane''s start edge instead of hanging outside
        the container — its cross-axis start edge sits at the separator''s end edge,
        with no centering, so no part of it falls outside.'
      locked: false
    paneMinTarget:
      token: size.target.comfortable
      description: 'A pane never shrinks below this on the drag axis before collapsing,
        so its scrollbar and content stay usable: a CSS minmax() floor on both grid
        tracks beneath the percent clamp (a very narrow container can therefore show
        the pane wider than its percent). Dropped for the primary track while collapsed
        so collapse reaches zero. On native it is minWidth (or minHeight when vertical)
        on both panes, dropped for the primary pane while collapsed. A React Native
        floor is hard, not a preference: the primary pane takes `flexShrink: 0`, so
        where the container is too narrow for both floors plus the separator the secondary
        shrinks to its own floor and then the splitter overflows, rather than either
        pane dropping below its floor as the web grid allows.'
      locked: true
    minTarget:
      token: size.target.min
      description: Separator hit area along the drag axis.
      locked: true
    focusRing:
      token: color.border.focus
      description: The separator's ring on web and Lit. The native separator is a
        plain View with a PanResponder and has no focus events, so on React Native
        this reaches only the composed collapse Button — as `separatorHover` has no
        native expression either.
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Width of that ring, on the same elements.
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
        load in try/catch because @property does not apply inside shadow roots. The
        animating state gets a named hook of its own, as the dragging state does:
        a `ds-splitter--animate` root class on web and a `data-animating` attribute
        on the Lit container, set when the collapsed state changes and cleared by
        the next size change or the next pointerdown — a collapse that is never followed
        by a resize leaves it set, which is what lets a second toggle animate too.
        On native, collapse and restore animate an `Animated.Value` interpolated to
        the primary pane''s flexBasis percentage (no native driver, since react-native-web
        has none) and the separator colour switches instantly.'
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
            to a whole number (as is aria-valuenow); 0 while collapsed, where aria-valuemin
            drops to 0 so the value stays in range — expanded it is `minSize` — while
            aria-valuemax stays `maxSize` throughout. Only this text and aria-valuenow
            round; the size events report the unrounded value.
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
        its own data-part). That wrapper is not focusable and adds no semantics, but
        a click anywhere on it is forwarded to the Button, so its padding over the
        separator line enlarges the target rather than being dead space. The Button''s
        Icon is chevron-left/chevron-right when horizontal and chevron-up/chevron-down
        when vertical, pointing toward the primary pane while expanded and away from
        it while collapsed (mirrored in RTL), in the Button''s own ghost foreground;
        it follows the separator in tab order. Below the stackBelow width the observed
        inline size switches the grid to a single column, the separator is not rendered,
        and both panes render in full. Direction is read once with getComputedStyle
        at mount and not observed afterwards (the same on Lit), so a document that
        flips `dir` later keeps the arrows and chevron it started with. copy.setMinimum
        and copy.setMaximum name the native accessibility actions and the SwiftUI
        custom actions only: Home and End are bare keys on web and Lit, which render
        neither string. persistKey reads/writes localStorage inside try/catch.'
    lit:
      tag: ds-splitter
      reflect:
      - orientation
      - collapsible
      - collapsed
      - stack-below
      notes: 'Slots `primary` and `secondary`; the separator lives in the shadow root
        and sets `--ds-splitter-primary-size` on the shadow container whose grid lays
        the slotted panes out, not on the host — the registered property is not inherited,
        so it has to be set on the element that reads it, and nothing outside the
        shadow root can read the size back. The collapse Button takes `expanded` and
        no aria-controls: ids do not cross shadow roots and ds-button exposes no such
        property, so the relationship rests on the Button''s own label. Composed events.
        Stacking uses a ResizeObserver on the host with the breakpoint read from the
        loaded --layout-max-width-* custom property, as web (@container cannot read
        custom properties; no literal breakpoints). The F6 pane wrapper takes tabindex=-1
        only while focused that way and drops it on blur, so it never becomes the
        delegatesFocus target. Parts, the collapse Button wrapper (including the click
        it forwards) and its Icon follow the web notes. Example string values for
        `primary`/`secondary` render as slotted text in stories, each inside a `ds-box
        inset="md"`, and every Lit story wraps the splitter in a bordered frame the
        width of layout.maxWidth.prose with a definite height — a vertical splitter
        has none of its own — so that scaffolding is part of the published Lit sample.'
    rn:
      element: View
      props:
      - accessibilityRole=adjustable
      - accessibilityLabel
      - accessibilityValue
      - accessibilityActions
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - focusable
      notes: 'Tablets and react-native-web only; below the stackBelow width the panes
        always stack and the separator is not rendered. a11y.role `separator` has
        no React Native equivalent, so the separator''s role here is `adjustable`:
        a test looks for `adjustable`, never `separator`. The separator is a plain
        View with a PanResponder (as Slider''s thumb — panHandlers on a Pressable
        fight its own responder), so it cannot show a keyboard focus ring itself (a
        known platform limit; the composed collapse Button has full focus treatment).
        accessibilityRole="adjustable", accessibilityValue={{ min, max, now, text
        }} together with the aria-valuenow/valuemin/valuemax/valuetext aliases, as
        Slider''s thumb sets both: react-native-web has no accessibilityValue prop
        but does map the adjustable role to role="slider", which axe requires a value
        on, so the notes'' native form alone fails the gate on every story. accessibilityActions
        increment/decrement (step; the system names them), setMinimum/setMaximum (Home/End;
        labelled copy.setMinimum/copy.setMaximum) and, only when `collapsible`, activate
        (Enter: collapse/restore; labelled copy.collapse/copy.expand) — the gesture
        alternative. Without `collapsible` the activate action is not registered at
        all, so assistive technology is never offered an action that does nothing.
        RN View has no typed key handler, so hardware arrows, Home, End and Enter
        do nothing, including on react-native-web; the accessibility actions and the
        collapse Button are the keyboard and screen-reader route. F6 has no native
        equivalent. stackBelow is measured with onLayout on the splitter''s own width
        (all three values); before the first layout it renders side by side. hitSlop
        is ignored by react-native-web, so the handle part is an absolutely positioned
        child View overflowing the separator by max(handleSize, minTarget); hitSlop
        is set as well, so a native build gets the wider grab area too. Every keyboard
        rule is web and Lit here, so the Keyboard story the rules require is a visual
        and axe fixture rather than a keyboard one. The collapse Button is a positioned
        sibling of the separator placed from its measured position, not a child (Android
        drops touches outside a parent''s bounds); before the first onLayout of either
        it sits at offset 0, so it renders at the container''s start edge for one
        frame and then settles. The separator View is `focusable` so it stays a tab
        stop under react-native-web, matching the Tab rule, even though it can show
        no ring there. The RTL mirroring the arrow and chevron rules describe is web
        and Lit only: the native drag maps the raw dx and the chevron keeps its left/right
        direction whatever `I18nManager` reports. Collapsed content has no `inert`
        here, so the collapsed primary pane takes accessibilityElementsHidden, importantForAccessibility="no-hide-descendants"
        and pointerEvents="none" together — the package''s rule against hiding a View
        that contains a Pressable is about leaving it tappable, which pointerEvents
        settles — and none of the three is applied while stacked, where the pane is
        shown in full. persistKey is a module-level memory map.'
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
    description: 'The default sidebar beside a content area, its width remembered
      per user. It pins `stackBelow: never` so the story shows the split itself —
      a stacked splitter renders no separator, and the derived scenarios read this
      story''s args.'
    given:
      label: Sidebar width
      primary: A navigation tree
      secondary: The selected document
      defaultSize: 25
      persistKey: app-sidebar
      stackBelow: never
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

## Parts and slots

- `container`: element
- `primaryPane`: element
- `secondaryPane`: element
- `separator`: element
- `handle`: element
- `collapseButton`: component `Button`; props `variant` = "ghost", `size` = "sm", `iconOnly` = true

## Style bindings

- `separatorSize`: token `space.1`; part `separator`
- `separatorColor`: token `color.border`; part `separator`
- `separatorHover`: token `color.border.strong`; part `separator`; state `hover`; locked
- `separatorActive`: token `color.control.selectedBackground`; part `separator`; state `dragging`; locked
- `handleSize`: token `space.3`; part `handle`
- `collapseButtonOffset`: token `space.2`; part `collapseButton`

## Keyboard

- `F6` (Cycles focus primary pane → separator → secondary pane → primary pane (wrapping), landing on the region's first focusable descendant or, when it has none, on the pane wrapper itself (tabindex -1). A collapsed (inert) primary pane is skipped; while stacked there is no separator and the cycle is primary → secondary. The collapse Button belongs to the separator zone (F6 lands on the separator). Shift+F6 is not handled at all — the splitter ignores it and does not preventDefault, so the browser's own behaviour stands; it does not cycle backwards. F6 is handled only while focus is inside the splitter, and from the container itself rather than a zone the cycle starts at the primary pane. The APG convenience for cycling panes; not available on native.): expect manual

## Copy

- `collapse`: "Collapse {label}"
- `expand`: "Expand {label}"
- `setMinimum`: "Minimum {label}"
- `setMaximum`: "Maximum {label}"
- `sizeText`: "{percent}%"; params `percent` (number)

## Constants and examples

- example `sidebar-and-content`, story `SidebarAndContent`: given `label: "Sidebar width"`, `primary: "A navigation tree"`, `secondary: "The selected document"`, `defaultSize: 25`, `persistKey: "app-sidebar"`, `stackBelow: "never"`; The default sidebar beside a content area, its width remembered per user. It pins `stackBelow: never` so the story shows the split itself — a stacked splitter renders no separator, and the derived scenarios read this story's args.
- example `collapsible-navigation`, story `CollapsibleNavigation`: given `label: "Sidebar width"`, `primary: "A navigation tree"`, `secondary: "The selected document"`, `collapsible: true`, `minSize: 15`; A sidebar that collapses to nothing with Enter or the collapse button, and restores its last size.
- example `editor-over-preview`, story `EditorOverPreview`: given `label: "Editor height"`, `primary: "The editor"`, `secondary: "The preview"`, `orientation: "vertical"`, `defaultSize: 60`; A stacked split where the separator moves the boundary up and down.
- example `never-stacking-workbench`, story `NeverStackingWorkbench`: given `label: "List width"`, `primary: "The result list"`, `secondary: "The detail view"`, `stackBelow: "never"`, `step: 5`; A split that keeps both panes side by side at every width, for a desktop workbench.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `separatorSize`, `separatorColor`, `handleSize`, `gripLength`, `gripRadius`, `collapseButtonOffset`, `transition`
Locked (accessibility-bearing, never overridable): `separatorHover`, `separatorActive`, `grip`, `paneMinTarget`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (17)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
  description: A resizable separator carries valuenow/min/max so a keyboard user hears
    the percentage.
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
notes: 'A container with CSS grid (grid-template-columns: minmax(paneMinTarget, var(--ds-splitter-primary-size))
  var(--ds-splitter-separator-size) minmax(paneMinTarget, 1fr), or rows when vertical)
  whose primary size is a custom property in percent; the separator is <div role="separator"
  tabindex="0" aria-orientation aria-valuenow aria-valuemin aria-valuemax aria-valuetext
  aria-label aria-controls={primaryId}> (aria-orientation is the separator''s own:
  vertical for a horizontal splitter). Pointer Events with setPointerCapture on the
  separator; the grab area is a wider ::before. A resizable separator is a focusable
  widget per ARIA (a static separator would not have tabindex). Collapse: the primary
  pane gets inert and inline-size 0; the collapse Button (ghost, sm, iconOnly, aria-expanded={!collapsed},
  aria-controls={primaryId}) is positioned over the separator line. role=separator
  has presentational children, so the Button is not inside it: the middle grid item
  is a Splitter-owned track wrapper holding the separator and, as its sibling, a span[data-part=collapseButton]
  wrapper around the Button (Button writes its own data-part). That wrapper is not
  focusable and adds no semantics, but a click anywhere on it is forwarded to the
  Button, so its padding over the separator line enlarges the target rather than being
  dead space. The Button''s Icon is chevron-left/chevron-right when horizontal and
  chevron-up/chevron-down when vertical, pointing toward the primary pane while expanded
  and away from it while collapsed (mirrored in RTL), in the Button''s own ghost foreground;
  it follows the separator in tab order. Below the stackBelow width the observed inline
  size switches the grid to a single column, the separator is not rendered, and both
  panes render in full. Direction is read once with getComputedStyle at mount and
  not observed afterwards (the same on Lit), so a document that flips `dir` later
  keeps the arrows and chevron it started with. copy.setMinimum and copy.setMaximum
  name the native accessibility actions and the SwiftUI custom actions only: Home
  and End are bare keys on web and Lit, which render neither string. persistKey reads/writes
  localStorage inside try/catch.'
```

## Guidance

## Overview

A splitter gives the user control of a layout decision the designer could not make for everyone: how wide the sidebar is, how tall the preview is. It is a separator the keyboard can move, a pane that can collapse, and a memory of where it was left.

## When to use

Use a Splitter when two regions compete for space and the right split depends on the task: a navigation tree beside content, a list beside a detail view, a code editor beside its output, a map beside results. Make the primary pane the one whose size matters (the sidebar), set sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for sidebars.

## When not to use

Do not use a Splitter on phone-width layouts — it stacks below `stackBelow`, and a screen that is only ever phone-sized should use a Stack or Tabs. Do not use it to lay out static content that never needs resizing (Stack, Container), or for more than two panes without nesting (nest a Splitter in a pane; more than three resizable regions is a workbench, not a page). Do not use it as a Disclosure for a panel that is either open or closed; that is a collapsible pane without the resizing, which Disclosure handles.

## Behavior

Dragging the separator resizes the primary pane within `minSize`–`maxSize`; arrow keys move it by `step`, Home/End to the bounds. With `collapsible`, dragging past `minSize`, Enter, or the collapse button collapses the primary pane to nothing (its content becomes inert) and Enter or the button restores the previous size; while collapsed the separator ignores drag and every key but Enter. `collapsed` is controlled or starts from `defaultCollapsed`. `onSizeChange` fires continuously, `onSizeChangeEnd` once per drag or key press. F6 cycles primary → separator → secondary and wraps, landing on the first focusable element in the target region or, when it has none, on the region wrapper itself, which takes `tabindex="-1"` for the purpose. "Focusable" there is the standard selector, skipping anything with a negative tabindex, inside an `[inert]` subtree, or `aria-disabled="true"`; on Lit it is applied to the slot's assigned light-DOM elements, and a custom element whose shadow root delegates focus (a `ds-button`) counts as focusable, while one that does not is invisible to the cycle. Below `stackBelow` (measured on the splitter's own width with a ResizeObserver, the breakpoint read from the loaded `--layout-max-width-*` custom property in px, rem or em; with no tokens loaded, no ResizeObserver, or a breakpoint in any other unit, it never stacks) a horizontal splitter stacks its panes in source order at full width and does not render the separator; a vertical one never stacks. With `persistKey` the last size and collapsed state are restored on mount. The Keyboard fixture pins `stackBelow: never` on every platform, since the gates run at widths narrow enough to stack the separator away and a splitter without a separator has no keyboard model to check.

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
