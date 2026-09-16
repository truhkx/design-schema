# Generate: Toolbar for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Toolbar.tsx` exporting a typed React Native function component named `Toolbar`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `ToolbarProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Toolbar> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Toolbar.test.tsx`.

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
        with `ToolbarGroup`; a Divider is drawn between two adjacent groups only (a
        bare control next to a group gets `itemGap`, no Divider). Consumers never
        place Dividers themselves.'
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
        trailing controls into a "More" Menu (each collapsible control must provide
        `overflowLabel`), or scroll horizontally with the edges faded. Collapsing
        takes whole entries from the end — a group goes into the Menu as a group,
        never half of one — and the width budget reserves `size.target.min` for the
        More trigger before it is rendered. `menu` is for horizontal toolbars; a vertical
        one treats it as `scroll`, since a menu overflow assumes a fixed cross axis.
        An entry collapses only if every control in it is a Button: walking from the
        end, an entry holding any other control is skipped and stays visible, even
        when a Button entry before it collapses. Web removes collapsed controls from
        the render; Lit, whose controls are the consumer''s light DOM, sets `hidden`
        on them instead; both leave them out of the roving list.'
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      default: md
      description: 'Default for the child controls that have a `size` prop — Button,
        SegmentedControl, Select and Search, recognised by component identity (web
        and React Native: the element type is the package component; Lit: the tag
        name), never by probing for a prop — and do not set their own. Applied to
        direct children and to the children of each ToolbarGroup; a child''s own `size`
        wins. On Lit a child counts as sized when it has a `size` attribute at the
        moment the toolbar discovers it. The overflow Menu''s trigger takes no size
        (Menu has no `size` prop).'
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
    native: true
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
      by: density
      values:
        compact: layout.gap.tight
      description: Between adjacent controls, inside a group and between ungrouped
        top-level controls alike. An override replaces the value at both densities.
      locked: false
    groupGap:
      token: layout.gap.normal
      part: group
      description: 'Either side of a separator, replacing itemGap there (not added
        to it). Every platform applies it the same way: the row''s gap stays itemGap
        and the separator part gets inline padding (block padding when vertical) of
        `groupGap − itemGap`, clamped at 0, so an override smaller than itemGap has
        no effect.'
      locked: false
    separatorLength:
      token: space.5
      part: separator
      description: 'The Divider between groups is shorter than the toolbar height.
        Divider has no length binding, so this is the block size (inline size when
        vertical) of the separator wrapper element, which carries the part hook; the
        Divider inside it has `orientation` across the toolbar axis, `spacing: none`,
        and stretches to fill the wrapper.'
      locked: false
    fadeWidth:
      token: space.6
      description: 'Edge fade for `overflow: scroll`, a gradient from the toolbar
        background to transparent. Each edge fades only while content is hidden past
        it, re-checked on scroll and on size changes.'
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
        a SegmentedControl counts as one control and keeps its own inner arrow keys
        — the toolbar hands the key to it when focus is inside). Overflow `menu`:
        a ResizeObserver measures children and moves trailing ones into a Menu whose
        items reuse each control''s `overflowLabel`/`onPress`; the hidden controls
        are removed from the DOM, not just hidden, so the roving list stays correct.
        A menu item calls the collapsed Button''s `onClick` with no argument — Button''s
        `onPress` contract has no payload, so a handler that reads the event is outside
        it. Overflow `scroll`: overflow-x auto with scrollbar hidden and masked edges.'
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
        and a click() on the original element, which stays in the light DOM with `hidden`
        (and `data-ds-toolbar-collapsed`) while collapsed. `<ds-toolbar-group>` takes
        a plain `label` attribute (its aria-label).
    rn:
      element: View
      props:
      - accessibilityRole=toolbar
      - accessibilityLabel
      notes: 'The root is a `View` (accessibilityRole="toolbar", accessibilityLabel,
        testID) wrapping a horizontal ScrollView for `scroll` and `menu`, or a wrapping
        row View for `wrap`. `menu` has no native form: it renders as `scroll`, and
        only an explicitly passed `overflow="menu"` logs a development warning, once
        per process (the schema default renders as `scroll` silently); the overflowButton
        and overflowMenu parts have no element here, since children are opaque and
        nothing measures them. `ToolbarGroup` is a `View` (gap `itemGap`, accessibilityLabel
        from `label`), and Toolbar renders the separator between adjacent groups as
        on web. No roving focus, no arrow or Home/End handling (Pressable has no key
        events, react-native-web included); every control is its own accessibility
        stop, reached by swipe or by Tab with a hardware keyboard.'
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
  behavior:
  - name: horizontal-is-the-reported-orientation
    description: The toolbar reports the axis its arrow keys move along.
    then:
    - attribute: aria-orientation
      is: horizontal
    platforms:
    - web
    - lit
  - name: vertical-toolbar-reports-its-orientation
    description: A vertical toolbar sits beside a canvas and swaps its arrow axis,
      which aria-orientation announces.
    given:
      orientation: vertical
    then:
    - attribute: aria-orientation
      is: vertical
    platforms:
    - web
    - lit
  - name: the-toolbar-is-one-tab-stop
    description: A roving tabindex over the focusable descendants makes each control
      the focus target (exactly one control has tabindex 0); the container itself
      never takes focus.
    then:
    - focusable: false
    platforms:
    - web
  examples:
  - name: formatting-toolbar
    description: The default row of ghost formatting buttons, named by what it controls.
    given:
      label: Formatting
      children: Three ghost text Buttons labelled Bold, Italic and Underline (the
        icon set has no formatting glyphs)
  - name: vertical-tool-palette
    description: A tool palette beside a canvas, where arrows move up and down.
    given:
      label: Drawing tools
      children: Three ghost text Buttons labelled Select, Draw and Erase
      orientation: vertical
  - name: compact-actions-with-overflow
    description: A dense table-action row at toolbar height that folds trailing buttons
      into a More menu.
    given:
      label: Table actions
      children: Four ghost text Buttons labelled Filter, Sort, Export and Delete,
        each with the same overflowLabel
      overflow: menu
      density: compact
      size: sm
  - name: scrolling-filter-row
    description: A filter row that scrolls horizontally with faded edges instead of
      collapsing.
    given:
      label: Filters
      children: 'A SegmentedControl labelled View (List, Board) and two Selects: Owner
        (name owner; Anyone, Me) and Sort (name sort; Newest, Oldest)'
      overflow: scroll
```

## Style bindings

- `itemGap`: token `layout.gap.normal`; by `density`: compact → `layout.gap.tight`, any other value → `layout.gap.normal`
- `groupGap`: token `layout.gap.normal`; part `group`
- `separatorLength`: token `space.5`; part `separator`

## Keyboard

- `Enter`, ` ` (Activates the focused control (its own behavior).): expect manual; native: the rendered element already does this

## Constants and examples

- example `formatting-toolbar`, story `FormattingToolbar`: given `label: "Formatting"`, `children: "Three ghost text Buttons labelled Bold, Italic and Underline (the icon set has no formatting glyphs)"`; The default row of ghost formatting buttons, named by what it controls.
- example `vertical-tool-palette`, story `VerticalToolPalette`: given `label: "Drawing tools"`, `children: "Three ghost text Buttons labelled Select, Draw and Erase"`, `orientation: "vertical"`; A tool palette beside a canvas, where arrows move up and down.
- example `compact-actions-with-overflow`, story `CompactActionsWithOverflow`: given `label: "Table actions"`, `children: "Four ghost text Buttons labelled Filter, Sort, Export and Delete, each with the same overflowLabel"`, `overflow: "menu"`, `density: "compact"`, `size: "sm"`; A dense table-action row at toolbar height that folds trailing buttons into a More menu.
- example `scrolling-filter-row`, story `ScrollingFilterRow`: given `label: "Filters"`, `children: "A SegmentedControl labelled View (List, Board) and two Selects: Owner (name owner; Anyone, Me) and Sort (name sort; Newest, Oldest)"`, `overflow: "scroll"`; A filter row that scrolls horizontally with faded edges instead of collapsing.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `border`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `itemGap`, `groupGap`, `separatorLength`, `fadeWidth`
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

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityRole=toolbar
- accessibilityLabel
notes: 'The root is a `View` (accessibilityRole="toolbar", accessibilityLabel, testID)
  wrapping a horizontal ScrollView for `scroll` and `menu`, or a wrapping row View
  for `wrap`. `menu` has no native form: it renders as `scroll`, and only an explicitly
  passed `overflow="menu"` logs a development warning, once per process (the schema
  default renders as `scroll` silently); the overflowButton and overflowMenu parts
  have no element here, since children are opaque and nothing measures them. `ToolbarGroup`
  is a `View` (gap `itemGap`, accessibilityLabel from `label`), and Toolbar renders
  the separator between adjacent groups as on web. No roving focus, no arrow or Home/End
  handling (Pressable has no key events, react-native-web included); every control
  is its own accessibility stop, reached by swipe or by Tab with a hardware keyboard.'
```

## Guidance

## Overview

A toolbar keeps a set of related controls together so the keyboard treats them as one stop: Tab reaches the toolbar, arrows move within it, Tab leaves it. That is what makes an editor with thirty buttons usable without thirty Tab presses.

## When to use

Use a Toolbar for controls that act on the same thing and are used together: text formatting, a table's row actions, a map's view switches, a data page's filter–sort–export row. Group by purpose with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for toolbars whose width the layout cannot guarantee; give every control an `overflowLabel` so it reads well as a menu item.

## When not to use

Do not use a Toolbar for page navigation (Breadcrumb, Tabs, a `nav` Landmark) or for a form's submit row (Form's action row). Do not put a single control in a toolbar. Do not use it as a generic horizontal Stack because it looks tidy: the roving tabindex changes how Tab works, which surprises users when the controls are unrelated.

## Behavior

Focus enters on the control that last had focus (initially the first). Arrow keys move along the toolbar's axis, skipping disabled controls, without wrapping; Home and End jump to the ends. A control that has its own arrow-key model (SegmentedControl) keeps it: inside a toolbar it stops wrapping and leaves an arrow pointing out of its edge, and Home and End, unhandled, so the toolbar moves on (SegmentedControl's own doc states this). A text-entry control (an input, a textarea, Search) keeps ArrowLeft, ArrowRight, Home and End for its caret — the toolbar never takes them from it, so put such a control last. When the toolbar is narrower than its content, `overflow` decides: wrap, move trailing controls into a "More" Menu (kept in their original order, groups become Menu groups), or scroll with faded edges. `ToolbarGroup` is part of Toolbar's API on every platform: an optional `label` (a string: the `role="group"` accessible name, and the Menu group heading when the group collapses) and `children`; a Divider is drawn between two adjacent groups. A collapsed group without a `label` becomes plain Menu items set off from earlier items by a Menu separator. Only Buttons collapse into the overflow Menu, using their `overflowLabel`, falling back to the Button's `label` and then its text content, with a development warning once per control when `overflowLabel` is missing; SegmentedControl, Select and Switch never collapse — the toolbar measures them as fixed and collapses Buttons from the end first. A control with its own arrow-key model handles the key first; the toolbar acts only when the control did not (`defaultPrevented`). The overflowButton part is the overflow Menu's own trigger (`iconOnly`, `triggerVariant: ghost`, `triggerIcon: ellipsis`, `label` from `copy.more`): Menu renders that Button itself, so Toolbar puts no part hook on it and only the Menu carries the overflowMenu hook. On native the fade is drawn with react-native-svg; `overflow: menu` renders as `scroll` (see the React Native notes), since children are opaque there and nothing measures them — the overflowButton and overflowMenu parts have no element on that platform. ToolbarGroup is a real element on every platform, native included. `focusRing` and `focusRingWidth` are locked but Toolbar applies them nowhere: every focusable thing in it is a composed child drawing its own ring, and the hooks exist only as the consumer's own-CSS escape hatch.

## Content guidelines

Icon-only buttons need a Tooltip and an `overflowLabel`; the two should be the same words ("Bold", "Align left"). Put the most-used controls first, the destructive ones last and in their own group. A toolbar's `label` names what it controls, not "toolbar".

## Accessibility

The container is a `toolbar` with an accessible name and orientation (WCAG 4.1.2; APG toolbar), using a roving tabindex so it is a single tab stop (2.4.3) with arrow-key movement (2.1.1). Controls keep their own roles and names, so the Menu that overflow produces has the same names. Focus is visible on each control (2.4.7), targets meet 24px, and a scrolling toolbar remains keyboard-reachable because focusing a control scrolls it into view.

## Platform notes

### Web
Render `<div role="toolbar" aria-label aria-orientation data-ds="Toolbar">`; children in `ToolbarGroup` (`<div role="group">`) separated by `Divider orientation="vertical"` with its length from `separatorLength`. Roving tabindex: keep an index into the focusable list (`button`, `select`, `textarea`, `input` other than hidden and unchecked radio inputs, `[role=radio][aria-checked=true]`, and `[tabindex]` on non-native elements only — so a control the toolbar set to -1 stays in the list — none of them disabled), set `tabIndex 0` on the current and `-1` on the rest, update on `focusin`. Keydown per the table, respecting `orientation`. Overflow `menu`: a `ResizeObserver` on the container, measure children offsets, move those past the limit into state rendered by `Menu` (trigger a `Button ghost iconOnly` "More" with the ellipsis Icon); `scroll`: `overflow-x: auto; scrollbar-width: none` plus `mask-image` linear gradients of `fadeWidth`.

### Lit
`<ds-toolbar label="Formatting"><ds-toolbar-group><ds-button …></ds-toolbar-group>…</ds-toolbar>`; the roving list is rebuilt on `slotchange`; keys handled on the host from bubbling keydown, using `composedPath()` to find the control.

### React Native
A root `View` with `accessibilityRole="toolbar"` wrapping a horizontal `ScrollView` (`contentContainerStyle` gap from `itemGap`); groups are `ToolbarGroup` `View`s with the separator between adjacent ones. Overflow `menu` renders as `scroll` (explicit `menu` warns once in development). No arrow handling on native or react-native-web.

## Related

Button, Menu, SegmentedControl, Divider, Tooltip.
