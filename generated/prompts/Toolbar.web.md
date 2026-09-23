# Generate: Toolbar for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Toolbar.tsx` exporting a typed React function component named `Toolbar`, plus `Toolbar.stories.tsx` covering every enum value of every enum prop.

**When the files already exist.** Read the existing component, CSS, stories, tests and index export first. The doc is authoritative: change what contradicts it, add what it requires, and keep what it does not mention unless a convention forbids it. Do not restyle or rename for taste. In your reply, before the report block, say what you changed and why.

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
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and enough content to exercise every keyboard rule — at least as many distinct stops or items as the largest index any rule moves to (three for a list or group), counting items reachable by the component's own navigation (roving or activedescendant) whether or not they are tab stops; an overlay with a fixed set of controls renders that set. The story uses no decorators that add other focusable elements.
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
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), unless the prop has no `default` and the doc marks it controlled (overlays' `open`): then it is controlled only, and the event requests the change. The event fires in every mode; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other. Wiring is not a prop choice and is always allowed: ids and `aria-*` references, refs, `tabIndex` for roving focus, event handlers, and copy strings the parent owns.
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
      a11yRole: accessible-name
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
        bare control next to a group gets `itemGap`, no Divider), and only between
        top-level groups — a group nested inside a group takes no separator and no
        `size` pass. Consumers never place Dividers themselves. The Default and Keyboard
        stories are the same two labelled ToolbarGroups — "Text style" holding Bold,
        Italic and Underline, "Insert" holding Link, Image and Table, all ghost text
        Buttons — so a separator shows and the keyboard gate has its three focusable
        children; there is nothing to open, so the Keyboard story is the Default with
        `overflow: wrap` pinned, since the default `menu` can collapse controls out
        of the DOM at a narrow gate viewport.'
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
        when a Button entry before it collapses. When the walk runs out of collapsible
        entries and the row still does not fit, collapsing stops and the row clips
        at the toolbar''s edge — it never falls back to `scroll` and never collapses
        a non-Button. Each Menu item''s id is the collapsed entry''s place in the
        toolbar, `entry-<i>` for a top-level entry and `entry-<i>-<j>` inside a group,
        which is also the identity the missing-`overflowLabel` warning is keyed by,
        so reordering entries can warn twice about the same control. Web removes collapsed
        controls from the render; Lit, whose controls are the consumer''s light DOM,
        sets `hidden` on them instead; both leave them out of the roving list. `wrap`
        on a vertical toolbar wraps onto more columns, which needs a bounded height
        from the parent to do anything and is otherwise the same as not wrapping.'
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
        direct children and to the children of each ToolbarGroup, exactly one level
        deep: a control inside any other wrapper, and a group nested inside a group,
        are not reached into. A child''s own `size` wins. Which sizes each control
        accepts is a fixed table, not something the toolbar probes for: Button, SegmentedControl
        and Select take `sm` and `md`, Search takes `md` only, so a `sm` toolbar leaves
        every Search at its own default (a later toolbar size means editing that table).
        On Lit a child counts as sized when it has a `size` attribute at the moment
        the toolbar discovers it; because every sized Lit control reflects a default
        `size`, the toolbar marks the children it sized with `data-ds-toolbar-size`
        on first sight and treats an unmarked child that already has the attribute
        as pre-sized. The overflow Menu''s trigger takes no size (Menu has no `size`
        prop).'
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
      first; when that control is gone — collapsed into the Menu or unmounted — the
      first control that is not disabled) and, from inside, out of it — the toolbar
      is one tab stop.
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
      part: separator
      description: 'Either side of a separator, replacing itemGap there (not added
        to it). Every platform applies it the same way: the row''s gap stays itemGap
        and the separator part gets inline padding (block padding when vertical) of
        `groupGap − itemGap`, clamped at 0, so an override smaller than itemGap has
        no effect. The clamp needs a zero length of its own: `max(0px, calc(…))` on
        web and Lit (a `literal-ok` zero, not a token), `Math.max(0, …)` on React
        Native.'
      locked: false
    separatorLength:
      token: space.5
      part: separator
      description: 'The Divider between groups is shorter than the toolbar height.
        Divider has no length binding, so this is the block size (inline size when
        vertical) of the separator wrapper element, which carries the part hook; the
        Divider inside it has `orientation` across the toolbar axis, `spacing: none`,
        and stretches to fill the wrapper. Being shorter than the toolbar, the separator
        is centred on the cross axis.'
      locked: false
    fadeWidth:
      token: space.6
      description: 'Edge fade for a scrolling row — `overflow: scroll`, and `menu`
        on React Native, which renders as `scroll` there; `wrap` never fades. The
        fade sits over the scrolling row only, inside the toolbar''s padding, so the
        border and the padding stay unclouded. Drawn as a `mask-image` gradient on
        web and Lit (so the content fades into whatever is behind the toolbar, with
        no second painted layer) and as a react-native-svg gradient from the toolbar
        background to transparent on React Native. Each edge fades only while content
        is hidden past it, re-checked on scroll and on size changes. The faded edges
        are physical — left and right, top and bottom on a vertical toolbar, which
        scrolls vertically — so RTL needs no special case.'
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
      notes: 'Slotted light-DOM children; the roving tabindex walks assigned elements
        (and into their shadow roots via delegatesFocus). The roving list is rebuilt
        from a childList MutationObserver over the toolbar''s subtree, not from `slotchange`,
        which never fires for a control added inside an existing `<ds-toolbar-group>`
        (it is assigned to the group''s own slot). Children are assigned to per-entry
        slots so the separator wrapper — a shadow-root `<div data-part="separator">`
        holding the `<ds-divider>` — renders between them; the toolbar never inserts
        nodes into the consumer''s markup, and assigns by writing a `slot="ds-toolbar-entry-<i>"`
        attribute on each top-level child rather than by manual assignment, which
        would leave any child the toolbar has not yet seen invisible — that attribute
        is the one thing the toolbar writes into the consumer''s DOM. The host carries
        the background, border, radius and padding; `data-part="container"` names
        the scrollable, masked row inside it. Native limit: only `ds-button` forwards
        the host''s tabindex to its inner control, so `ds-select`, `ds-segmented-control`,
        `ds-search` and the overflow Menu''s trigger stay tab stops of their own whatever
        the toolbar writes (reaching into another element''s shadow root is forbidden)
        — on Lit the single tab stop holds for Buttons, and the roving model is arrow
        navigation alone for the rest. ToolbarGroup is <ds-toolbar-group>. Overflow
        menu items are built from slotted elements'' `overflow-label` attribute and
        a click() on the original element, which stays in the light DOM with `hidden`
        (and `data-ds-toolbar-collapsed`) while collapsed. `<ds-toolbar-group>` takes
        a plain `label` attribute (its aria-label).'
    rn:
      element: View
      props:
      - accessibilityRole=toolbar
      - accessibilityLabel
      notes: 'The root is a `View` (accessibilityRole="toolbar", accessibilityLabel,
        testID) wrapping a horizontal ScrollView for `scroll` and `menu`, or a wrapping
        row View for `wrap`. `menu` has no native form: it renders as `scroll`, and
        only an explicitly passed `overflow="menu"` logs a development warning, once
        per process and whatever the orientation (the schema default renders as `scroll`
        silently); the overflowButton and overflowMenu parts have no element here,
        since children are opaque and nothing measures them. `ToolbarGroup` is a `View`
        using the `role="group"` prop rather than accessibilityRole, as Fieldset and
        Menu in this package do (the two map to the same ARIA role on react-native-web),
        with accessibilityLabel from `label`, testID "Toolbar.group", a forwarded
        `ref` and gap `itemGap`, and Toolbar renders the separator between adjacent
        groups as on web. `copy.more` has no consumer here, since the overflow Menu
        does not exist on this platform. Native limits: there is no aria-orientation
        equivalent, so `orientation` exists only in layout — nothing announces the
        axis, and the toolbar''s `label` is what tells a screen-reader user what the
        row is for. No roving focus, no arrow or Home/End handling (Pressable has
        no key events, react-native-web included); every control is its own accessibility
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
        each with an overflowLabel equal to its own label
      overflow: menu
      density: compact
      size: sm
  - name: scrolling-filter-row
    description: A filter row that scrolls horizontally with faded edges instead of
      collapsing.
    given:
      label: Filters
      children: 'A SegmentedControl labelled View (List, Board) and two Selects with
        hideLabel so the row stays at toolbar height: Owner (name owner; Anyone, Me)
        and Sort (name sort; Newest, Oldest)'
      overflow: scroll
```

## Style bindings

- `itemGap`: token `layout.gap.normal`; by `density`: compact → `layout.gap.tight`, any other value → `layout.gap.normal`
- `groupGap`: token `layout.gap.normal`; part `separator`
- `separatorLength`: token `space.5`; part `separator`

## Keyboard

- `Tab` (Moves focus into the toolbar (to the last-focused control, initially the first; when that control is gone — collapsed into the Menu or unmounted — the first control that is not disabled) and, from inside, out of it — the toolbar is one tab stop.): expect manual
- `ArrowRight` (Next control (ArrowDown when vertical). Skips disabled controls; does not wrap.): expect focus-next
- `ArrowLeft` (Previous control (ArrowUp when vertical).): expect focus-prev
- `Home` (First control.): expect focus-first
- `End` (Last control.): expect focus-last
- `Enter`, ` ` (Activates the focused control (its own behavior).): expect manual; native: the rendered element already does this

## Constants and examples

- example `formatting-toolbar`, story `FormattingToolbar`: given `label: "Formatting"`, `children: "Three ghost text Buttons labelled Bold, Italic and Underline (the icon set has no formatting glyphs)"`; The default row of ghost formatting buttons, named by what it controls.
- example `vertical-tool-palette`, story `VerticalToolPalette`: given `label: "Drawing tools"`, `children: "Three ghost text Buttons labelled Select, Draw and Erase"`, `orientation: "vertical"`; A tool palette beside a canvas, where arrows move up and down.
- example `compact-actions-with-overflow`, story `CompactActionsWithOverflow`: given `label: "Table actions"`, `children: "Four ghost text Buttons labelled Filter, Sort, Export and Delete, each with an overflowLabel equal to its own label"`, `overflow: "menu"`, `density: "compact"`, `size: "sm"`; A dense table-action row at toolbar height that folds trailing buttons into a More menu.
- example `scrolling-filter-row`, story `ScrollingFilterRow`: given `label: "Filters"`, `children: "A SegmentedControl labelled View (List, Board) and two Selects with hideLabel so the row stays at toolbar height: Owner (name owner; Anyone, Me) and Sort (name sort; Newest, Oldest)"`, `overflow: "scroll"`; A filter row that scrolls horizontally with faded edges instead of collapsing.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed, but they still declare their hook: `locked` closes the override API, not the styling hook. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so, and for a locked binding it is the only way it can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `itemGap`, `groupGap`, `separatorLength`, `fadeWidth`
Locked (accessibility-bearing, never overridable): `background`, `focusRing`, `focusRingWidth`

## Behavior scenarios (14)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: horizontal-is-the-reported-orientation
  description: The toolbar reports the axis its arrow keys move along.
  then:
  - attribute: aria-orientation
    is: horizontal
  platforms:
  - web
  - lit
- name: vertical-toolbar-reports-its-orientation
  description: A vertical toolbar sits beside a canvas and swaps its arrow axis, which
    aria-orientation announces.
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
    the focus target (exactly one control has tabindex 0); the container itself never
    takes focus.
  then:
  - focusable: false
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
  \ over its focusable descendants (query on mount and on a MutationObserver; a SegmentedControl\
  \ counts as one control and keeps its own inner arrow keys \u2014 the toolbar hands\
  \ the key to it when focus is inside). Overflow `menu`: a ResizeObserver measures\
  \ children and moves trailing ones into a Menu whose items reuse each control's\
  \ `overflowLabel`/`onPress`; the hidden controls are removed from the DOM, not just\
  \ hidden, so the roving list stays correct. A menu item calls the collapsed Button's\
  \ `onClick` with no argument \u2014 Button's `onPress` contract has no payload,\
  \ so a handler that reads the event is outside it. Overflow `scroll`: overflow-x\
  \ auto with scrollbar hidden and masked edges."
```

## Guidance

## Overview

A toolbar keeps a set of related controls together so the keyboard treats them as one stop: Tab reaches the toolbar, arrows move within it, Tab leaves it. That is what makes an editor with thirty buttons usable without thirty Tab presses.

## When to use

Use a Toolbar for controls that act on the same thing and are used together: text formatting, a table's row actions, a map's view switches, a data page's filter–sort–export row. Group by purpose with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for toolbars whose width the layout cannot guarantee; give every control an `overflowLabel` so it reads well as a menu item.

## When not to use

Do not use a Toolbar for page navigation (Breadcrumb, Tabs, a `nav` Landmark) or for a form's submit row (Form's action row). Do not put a single control in a toolbar. Do not use it as a generic horizontal Stack because it looks tidy: the roving tabindex changes how Tab works, which surprises users when the controls are unrelated.

## Behavior

Focus enters on the control that last had focus (initially the first). Arrow keys move along the toolbar's axis, skipping disabled controls, without wrapping; Home and End jump to the ends. A control that has its own arrow-key model (SegmentedControl) keeps it: inside a toolbar it stops wrapping and leaves an arrow pointing out of its edge, and Home and End, unhandled, so the toolbar moves on (SegmentedControl's own doc states this). A text-entry control (an input, a textarea, Search) keeps ArrowLeft, ArrowRight, Home and End for its caret — the toolbar never takes them from it, so put such a control last. Text entry means every `input` except button, checkbox, color, file, hidden, image, radio, range, reset and submit, plus textarea and anything `contenteditable`, judged from the innermost target of the key event; ArrowUp and ArrowDown are not caret keys there, so a vertical toolbar moves focus with them even from a text-entry control. When the toolbar is narrower than its content, `overflow` decides: wrap, move trailing controls into a "More" Menu (kept in their original order, groups become Menu groups), or scroll with faded edges. `ToolbarGroup` is part of Toolbar's API on every platform: an optional `label` (a string: the `role="group"` accessible name, and the Menu group heading when the group collapses) and `children`; a Divider is drawn between two adjacent groups. A group takes its orientation, wrapping and gaps from the Toolbar around it (React Native through a private context, with a development warning when a ToolbarGroup renders outside a Toolbar); a fragment around a group is flattened, and any other wrapper makes what it holds one bare control: the roving stop is the wrapper's first focusable descendant, and a wrapper never collapses, so Buttons inside one stay visible where the same Buttons unwrapped would fold. A collapsed group without a `label` becomes plain Menu items set off from earlier items by a Menu separator. Only Buttons collapse into the overflow Menu, using their `overflowLabel`, falling back to the Button's `label` and then its text content — on web and React Native Button's `label` is required, so the chain ends there, and only Lit's slotted markup reaches text content — with a development warning once per control when `overflowLabel` is missing, a control being identified by its place in the toolbar (its entry, and its index inside a group) for the life of that toolbar; SegmentedControl, Select and Switch never collapse — the toolbar measures them as fixed and collapses Buttons from the end first. A control with its own arrow-key model handles the key first; the toolbar acts only when the control did not (`defaultPrevented`). The overflowButton part is the overflow Menu's own trigger (`iconOnly`, `triggerVariant: ghost`, `triggerIcon: ellipsis`, `label` from `copy.more`): Menu renders that Button itself, so Toolbar puts no part hook on it and only the Menu carries the overflowMenu hook, on the Menu's own root element rather than its portaled popup. On native the fade is drawn with react-native-svg; `overflow: menu` renders as `scroll` (see the React Native notes), since children are opaque there and nothing measures them — the overflowButton and overflowMenu parts have no element on that platform. ToolbarGroup is a real element on every platform, native included. `overflow: menu` measures, so in that mode only, each entry sits in an unnamed measurement wrapper and an invisible probe reserves the More trigger's width: structural elements outside the anatomy are allowed where a mode needs them, carrying no part hook, so the DOM shape differs between `menu` and the other two. `focusRing` and `focusRingWidth` are locked but Toolbar applies them nowhere: every focusable thing in it is a composed child drawing its own ring, and the hooks exist only as the consumer's own-CSS escape hatch.

## Content guidelines

Icon-only buttons need a Tooltip and an `overflowLabel`; the two should be the same words ("Bold", "Align left"). Put the most-used controls first, the destructive ones last and in their own group. A toolbar's `label` names what it controls, not "toolbar".

## Accessibility

The container is a `toolbar` with an accessible name and orientation (WCAG 4.1.2; APG toolbar), using a roving tabindex so it is a single tab stop (2.4.3) with arrow-key movement (2.1.1). Controls keep their own roles and names, so the Menu that overflow produces has the same names. Focus is visible on each control (2.4.7), targets meet 24px, and a scrolling toolbar remains keyboard-reachable because focusing a control scrolls it into view — the platform's own focus scrolling, which the toolbar never calls itself.

## Platform notes

### Web
Render `<div role="toolbar" aria-label aria-orientation data-ds="Toolbar">`; children in `ToolbarGroup` (`<div role="group">`) separated by `Divider orientation="vertical"` with its length from `separatorLength`. Roving tabindex: keep an index into the focusable list (`button`, `select`, `textarea`, `input` other than hidden and unchecked radio inputs, `[role=radio][aria-checked=true]`, and `[tabindex]` on non-native elements only — so a control the toolbar set to -1 stays in the list — none of them disabled), set `tabIndex 0` on the current and `-1` on the rest, update on `focusin`. Keydown per the table, respecting `orientation`. Overflow `menu`: a `ResizeObserver` on the container, measure children offsets, move those past the limit into state rendered by `Menu` (trigger a `Button ghost iconOnly` "More" with the ellipsis Icon); `scroll`: `overflow-x: auto; scrollbar-width: none` plus `mask-image` linear gradients of `fadeWidth`.

### Lit
`<ds-toolbar label="Formatting"><ds-toolbar-group><ds-button …></ds-toolbar-group>…</ds-toolbar>`; the roving list is rebuilt from a childList `MutationObserver` on the subtree (a control added inside an existing group never fires the toolbar's `slotchange`); keys handled on the host from bubbling keydown, using `composedPath()` to find the control.

### React Native
A root `View` with `accessibilityRole="toolbar"` wrapping a horizontal `ScrollView` (`contentContainerStyle` gap from `itemGap`); groups are `ToolbarGroup` `View`s with the separator between adjacent ones. Overflow `menu` renders as `scroll` (explicit `menu` warns once in development). No arrow handling on native or react-native-web.

## Related

Button, Menu, SegmentedControl, Divider, Tooltip.
