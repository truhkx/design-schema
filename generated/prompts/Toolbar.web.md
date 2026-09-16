# Generate: Toolbar for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Toolbar.tsx` exporting a typed React function component named `Toolbar`, plus `Toolbar.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Toolbar({ ref, …rest }: ToolbarProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Toolbar> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Toolbar.test.tsx`.
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
  name: Toolbar
  category: navigation
  status: review
  apg: toolbar
  anatomy:
  - container
  - group
  - separator
  - overflowButton
  - overflowMenu
  composition:
    separator: Divider
    overflowButton: Button
    overflowMenu: Menu
  props:
    label:
      type: string
      required: true
      description: What the toolbar controls ("Formatting", "Table actions"). Not
        visible; read by assistive technology.
      a11y: aria-label / accessibilityLabel on the toolbar.
    children:
      type: content
      required: true
      description: 'Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly`
        for glyph tools), SegmentedControl, Select, Switch. Group related controls
        with `ToolbarGroup`; a Divider is drawn between groups.'
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: Vertical toolbars sit beside a canvas; arrow keys swap axes.
    overflow:
      type: enum
      values:
      - wrap
      - menu
      - scroll
      default: menu
      description: 'What happens when controls do not fit: wrap onto more rows, collapse
        trailing controls into a "More" Menu (each control must provide `overflowLabel`),
        or scroll horizontally with the edges faded.'
    size:
      type: enum
      values:
      - sm
      - md
      default: md
      description: Default for child controls that have a `size` prop and do not set
        their own (applied by cloning direct children; a child's own `size` wins).
    density:
      type: enum
      values:
      - compact
      - comfortable
      default: comfortable
      description: 'Gap between controls: tight or normal rhythm.'
  events: {}
  keyboard:
  - keys:
    - Tab
    action: Moves focus into the toolbar (to the last-focused control, initially the
      first) and, from inside, out of it — the toolbar is one tab stop.
    from: any
    expect: manual
  - keys:
    - ArrowRight
    action: Next control (ArrowDown when vertical). Skips disabled controls; does
      not wrap.
    from: first
    expect: focus-next
  - keys:
    - ArrowLeft
    action: Previous control (ArrowUp when vertical).
    from: last
    expect: focus-prev
  - keys:
    - Home
    action: First control.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last control.
    from: first
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: Activates the focused control (its own behavior).
    from: first
    expect: manual
  styles:
    background:
      token: color.background.subtle
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.md
      locked: false
    paddingInline:
      token: space.2
      locked: false
    paddingBlock:
      token: space.1
      locked: false
    itemGap:
      token: layout.gap.normal
      description: Between adjacent controls, inside a group and between ungrouped
        top-level controls alike.
      locked: false
    itemGapCompact:
      token: layout.gap.tight
      description: Used instead of itemGap when density is compact.
      locked: false
    groupGap:
      token: layout.gap.normal
      description: Either side of a separator, replacing itemGap there (not added
        to it).
      locked: false
    separatorLength:
      token: space.5
      description: The Divider between groups is shorter than the toolbar height.
      locked: false
    fadeWidth:
      token: space.6
      description: 'Edge fade for `overflow: scroll`, a gradient from the toolbar
        background to transparent.'
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    more: More
  a11y:
    role: toolbar
    requires:
    - accessible-name
    - roving-tabindex
    - arrow-navigation
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    contrast:
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.background.subtle
      level: AA
    - foreground: color.action.ghost.foreground
      background: color.background.subtle
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=toolbar
      - aria-label
      - aria-orientation
      notes: 'A <div role="toolbar" aria-label aria-orientation> managing a roving
        tabindex over its focusable descendants (query on mount and on a MutationObserver;
        SegmentedControl and RadioGroup count as one control and keep their own inner
        arrow keys — the toolbar hands the key to them when focus is inside). Overflow
        `menu`: a ResizeObserver measures children and moves trailing ones into a
        Menu whose items reuse each control''s `overflowLabel`/`onPress`; the hidden
        controls are removed from the DOM, not just hidden, so the roving list stays
        correct. Overflow `scroll`: overflow-x auto with scrollbar hidden and masked
        edges.'
    lit:
      tag: ds-toolbar
      reflect:
      - orientation
      - overflow
      - size
      - density
      notes: Slotted light-DOM children; the roving tabindex walks assigned elements
        (and into their shadow roots via delegatesFocus). ToolbarGroup is <ds-toolbar-group>.
        Overflow menu items are built from slotted elements' `overflow-label` attribute
        and a click() on the original element.
    rn:
      element: View
      props:
      - accessibilityRole=toolbar
      - accessibilityLabel
      notes: A horizontal ScrollView (overflow defaults to `scroll` on native; `menu`
        also works and opens an ActionSheet on phones through Menu's own rule). accessibilityRole="toolbar"
        on the container. No roving focus without a hardware keyboard; every control
        is reachable by swipe.
    swiftui:
      element: HStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - .focusSection
      - .onMoveCommand
      - '@FocusState'
      - ViewThatFits
      - Menu
      - Divider
      - ScrollView
      notes: 'An `HStack` (or `VStack`) in a `.contain` element labelled by `label`,
        one focus section with the roving `@FocusState` moved by arrows/Home/End on
        iPad. Overflow: `ViewThatFits` tries the full row, then progressively collapses
        trailing `Button`s (only Buttons, using each one''s `overflowLabel`) into
        a system `Menu` behind the `ellipsis` Button, as on web; `overflow: scroll`
        wraps the row in a horizontal `ScrollView` with faded edges drawn by a gradient
        mask. Groups are `ToolbarGroup` containers with `label` as their contained
        element''s label, separated by `Divider`s. `size` is cloned onto children
        through the environment. Not SwiftUI''s `.toolbar` (navigation-bar placement).'
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `itemGap`, `itemGapCompact`, `groupGap`, `separatorLength`, `fadeWidth`
Locked (accessibility-bearing, never overridable): `background`, `focusRing`, `focusRingWidth`

## Behavior scenarios (11)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
- name: renders-overflow-wrap
  given:
    overflow: wrap
  then:
  - renders: true
  derived: true
- name: renders-overflow-menu
  given:
    overflow: menu
  then:
  - renders: true
  derived: true
- name: renders-overflow-scroll
  given:
    overflow: scroll
  then:
  - renders: true
  derived: true
- name: renders-size-sm
  given:
    size: sm
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-density-compact
  given:
    density: compact
  then:
  - renders: true
  derived: true
- name: renders-density-comfortable
  given:
    density: comfortable
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
- role=toolbar
- aria-label
- aria-orientation
notes: "A <div role=\"toolbar\" aria-label aria-orientation> managing a roving tabindex\
  \ over its focusable descendants (query on mount and on a MutationObserver; SegmentedControl\
  \ and RadioGroup count as one control and keep their own inner arrow keys \u2014\
  \ the toolbar hands the key to them when focus is inside). Overflow `menu`: a ResizeObserver\
  \ measures children and moves trailing ones into a Menu whose items reuse each control's\
  \ `overflowLabel`/`onPress`; the hidden controls are removed from the DOM, not just\
  \ hidden, so the roving list stays correct. Overflow `scroll`: overflow-x auto with\
  \ scrollbar hidden and masked edges."
```

## Guidance

## Overview

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
