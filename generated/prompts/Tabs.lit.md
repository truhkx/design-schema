# Generate: Tabs as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Tabs.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Tabs.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: TabsVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
- Each event is dispatched as a `CustomEvent` named by its `platforms.lit` value with `bubbles: true, composed: true` so it crosses the shadow boundary.
- Styles live in `static override styles: CSSResult = css\`…\`` and read ONLY token custom properties (`var(--color-…)`), which inherit through the shadow root. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes an attribute selector per enum value, e.g. `:host([variant="primary"]) { background: var(--color-action-primary-background); }`.
- Implement every item in `a11y.requires` inside the shadow DOM using a native element (e.g. a real `<button>`), and use `delegatesFocus: true` in `static override shadowRootOptions: ShadowRootInit` so focusing the host focuses the inner element.
- `accessible-name`: forward `label` to visible text or `aria-label` on the inner element.
- `focus-visible`: style `:focus-visible` on the inner element with `--color-border-focus` / `--border-width-focus`.
- `heading-hierarchy`: render the matching `<h1>`–`<h6>` inside the shadow root based on the level prop.
- Support light and dark by relying on token variables only.
- Form ownership is DOM-tree based: slotted light-DOM children are not owned by a `<form>` inside a shadow root. Follow the platform notes for how ds-form and ds-input cooperate by `name`.
- Events named like native events (`focus`, `blur`) are the native retargeted events — do not dispatch a CustomEvent with the same name.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard`, removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Tabs.test.ts`.

## Component schema

```yaml
component:
  name: Tabs
  category: navigation
  status: review
  apg: tabs
  anatomy:
  - tablist
  - tab
  - tabLabel
  - tabIcon
  - tabBadge
  - indicator
  - panel
  composition:
    tabIcon: Icon
  props:
    tabs:
      type: array
      required: true
      shape: '{ id: string; label: string; icon?: IconName; disabled?: boolean; badge?:
        string }[]'
      description: The tabs in order. `badge` is a short count or status shown after
        the label ("3", "New").
    children:
      type: content
      required: true
      description: One panel per tab, in the same order, each wrapped in the exported
        `TabPanel` (or `<ds-tab-panel>`) with a matching `id`. Only the selected panel
        is rendered unless `keepMounted`.
    label:
      type: string
      required: true
      description: Accessible name of the tab list ("Account sections"). Not shown
        visually.
    value:
      type: string
      description: Controlled selected tab id. Omit for uncontrolled.
    defaultValue:
      type: string
      description: Initially selected tab id. Defaults to the first enabled tab.
    activation:
      type: enum
      values:
      - automatic
      - manual
      default: automatic
      description: '`automatic` selects a tab as arrow keys move to it (fine when
        panels are cheap); `manual` moves focus only and selects on Enter/Space (use
        when a panel loads data).'
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: Vertical tab lists sit beside their panels and use Up/Down arrows.
    fit:
      type: enum
      values:
      - start
      - fill
      default: start
      description: '`start` packs tabs at the start; `fill` stretches them across
        the width (phones, two to four tabs).'
    keepMounted:
      type: boolean
      default: false
      description: Keep unselected panels in the tree (hidden) so their state survives
        switching.
  events:
    onChange:
      description: Fired when the selected tab changes, with the new id.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
  keyboard:
  - keys:
    - Tab
    action: Moves focus to the selected tab, then out of the tab list into the panel
      (the list is one tab stop).
    from: any
    expect: manual
  - keys:
    - ArrowRight
    action: Moves to the next tab, wrapping; selects it under automatic activation.
    when: horizontal
    from: first
    expect: focus-next
  - keys:
    - ArrowLeft
    action: Moves to the previous tab, wrapping.
    when: horizontal
    from: last
    expect: focus-prev
  - keys:
    - ArrowDown
    action: Moves to the next tab, wrapping; selects it under automatic activation.
    when: vertical
    from: first
    expect: manual
  - keys:
    - ArrowUp
    action: Moves to the previous tab, wrapping.
    when: vertical
    from: last
    expect: manual
  - keys:
    - ArrowRight
    action: From the last tab wraps to the first.
    when: horizontal
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Home
    action: First tab.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last tab.
    from: first
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: Selects the focused tab (manual activation).
    when: manual
    from: first
    expect: selects
  styles:
    tabColor:
      token: color.foreground.muted
      locked: true
    tabSelectedColor:
      token: color.foreground.strong
      locked: true
    tabHoverBackground:
      token: color.background.subtle
      locked: true
    tabPaddingBlock:
      token: space.sm
      locked: false
    tabPaddingInline:
      token: space.md
      locked: false
    tabGap:
      token: layout.gap.tight
      description: Between icon, label and badge inside a tab.
      locked: false
    listGap:
      token: layout.gap.none
      description: Tabs touch; the indicator separates them.
      locked: false
    indicator:
      token: color.control.selectedBackground
      description: The selected tab's underline (horizontal, flush against the list
        border at the bottom edge) or side bar (vertical, flush against the inline-end
        edge next to the panels) — the selected-control fill, which is chosen per
        mode to meet 3:1 on the page (the primary button fill is not).
      locked: true
    indicatorThickness:
      token: border.width.focus
      locked: true
    listBorder:
      token: color.border
      description: The rule under the whole tab list.
      locked: false
    listBorderWidth:
      token: border.width.thin
      locked: false
    panelGap:
      token: layout.gap.loose
      description: Between the tab list and the panel.
      locked: false
    badgeColor:
      token: color.foreground.muted
      locked: true
    badgeSize:
      token: font.size.xs
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    fontWeight:
      token: font.weight.medium
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    radius:
      token: radius.sm
      description: On the tab's hover background and focus ring.
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    transition:
      token: motion.duration.fast
      description: Indicator movement, with motion.easing.standard; instant under
        reduced motion.
      locked: false
    disabledOpacity:
      token: opacity.disabled
      locked: false
  a11y:
    role: tablist
    requires:
    - accessible-name
    - selected-state
    - arrow-navigation
    - roving-tabindex
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    - reduced-motion
    contrast:
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.strong
      background: color.background
      level: AA
    - foreground: color.foreground.strong
      background: color.background.subtle
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
  platforms:
    web:
      element: div
      attributes:
      - role=tablist
      - aria-label
      - aria-orientation
      - role=tab
      - aria-selected
      - aria-controls
      - tabindex
      - role=tabpanel
      - aria-labelledby
      notes: <div role="tablist" aria-label> of <button role="tab" aria-selected aria-controls
        tabindex={0|-1}>; panels are <div role="tabpanel" aria-labelledby tabindex="0">
        (focusable so Tab from the list lands on the panel content region). The indicator
        is a pseudo-element or an absolutely positioned bar animated between tabs.
        The tab list scrolls horizontally with overflow when tabs exceed the width,
        with the selected tab scrolled into view.
    lit:
      tag: ds-tabs
      reflect:
      - value
      - orientation
      - activation
      - fit
      notes: '`tabs` is a property. Panels are slotted <ds-tab-panel id> light-DOM
        elements; ds-tabs sets hidden/aria-labelledby on them from slotchange and
        renders the tab list in its shadow root. Panels are never moved, detached
        or re-appended: `keepMounted: false` is expressed only by toggling the `hidden`
        attribute on the slotted panel, so there is no detached-panel map. A slotchange
        handler must never call appendChild, insertBefore or remove on its own slotted
        children - re-inserting a node that is already a child re-fires slotchange
        and spins the renderer until the tab is killed. `change` is a composed CustomEvent
        with detail { value }. Roving tabindex over shadow tabs.'
    rn:
      element: View
      props:
      - accessibilityRole=tablist
      - accessibilityRole=tab
      - accessibilityState
      notes: A horizontal ScrollView (or View with fill) of Pressables with accessibilityRole="tab"
        and accessibilityState={{ selected }}; panels are Views. Arrow keys apply
        with a hardware keyboard only; each tab is its own accessibility stop, as
        on native. Indicator animated with Animated.
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - Button
      - .accessibilityAddTraits=isSelected
      - .focusable
      - .onMoveCommand
      - '@FocusState'
      - ScrollView
      - ScrollViewReader
      notes: 'Not `TabView` (bottom tab bar semantics). The tab list is an `HStack`
        in a horizontal `ScrollView` (scrolls when tabs overflow; `ScrollViewReader`
        keeps the selected tab visible) of `Button`s with `.isSelected` on the current
        one and `.accessibilityValue(copy.position)`; the list is one focus section
        and arrows move the roving `@FocusState` per `activation` (automatic selects
        on move, manual on Enter/Space). Panels are the package''s own views shown
        by selection, each `.accessibilityElement(children: .contain)` labelled by
        its tab. `orientation: vertical` swaps the stacks. Indicator and borders from
        the tokens with the `transition` animation.'
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `tabPaddingBlock`, `tabPaddingInline`, `tabGap`, `listGap`, `listBorder`, `listBorderWidth`, `panelGap`, `badgeSize`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `radius`, `transition`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `tabColor`, `tabSelectedColor`, `tabHoverBackground`, `indicator`, `indicatorThickness`, `badgeColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (8)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-activation-automatic
  given:
    activation: automatic
  then:
  - renders: true
  derived: true
- name: renders-activation-manual
  given:
    activation: manual
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
- name: renders-fit-start
  given:
    fit: start
  then:
  - renders: true
  derived: true
- name: renders-fit-fill
  given:
    fit: fill
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-tabs
reflect:
- value
- orientation
- activation
- fit
notes: '`tabs` is a property. Panels are slotted <ds-tab-panel id> light-DOM elements;
  ds-tabs sets hidden/aria-labelledby on them from slotchange and renders the tab
  list in its shadow root. Panels are never moved, detached or re-appended: `keepMounted:
  false` is expressed only by toggling the `hidden` attribute on the slotted panel,
  so there is no detached-panel map. A slotchange handler must never call appendChild,
  insertBefore or remove on its own slotted children - re-inserting a node that is
  already a child re-fires slotchange and spins the renderer until the tab is killed.
  `change` is a composed CustomEvent with detail { value }. Roving tabindex over shadow
  tabs.'
```

## Guidance

## Overview

Tabs let one region of a screen show one of several views. The tab list is a single stop in the tab order — arrow keys move between tabs — and the selected panel follows immediately. They are for views of equal standing that the user switches between often; not for steps, and not for navigation between pages.

## When to use

Use Tabs to split a region's content into two to about seven views that are alternatives of each other: the sections of a settings page, "Overview / Activity / Files" on a record, code and preview. Use `manual` activation when a panel is expensive to show. Use `vertical` when there are many tabs and horizontal room is short. Use `fill` on phones for two to four tabs.

## When not to use

Do not use Tabs for navigation to different pages — that is a nav Landmark of Links, styled as tabs if you like, but with real links so the URL changes. Do not use them for a sequence (Stepper, planned) or a comparison where the user needs to see several panels at once (put them side by side or in an Accordion). Do not put a tab list inside a Card header for one or two tabs; a SegmentedControl is lighter.

## Behavior

The selected tab is the list's single tab stop. Arrow keys along the orientation move focus between enabled tabs and wrap; with `automatic` activation the moved-to tab is selected and its panel shown, with `manual` the user presses Enter or Space. Home and End jump. Tab from a tab moves into the selected panel. Disabled tabs are visible, announced disabled and skipped. Only the selected panel is rendered unless `keepMounted`, in which case unselected panels are hidden. The indicator animates to the selected tab. When tabs overflow horizontally, the list scrolls and the selected tab is kept in view. Disabled tabs are `aria-disabled`, skipped by the arrow keys and not tab stops (a disabled tab has nothing to reach); they remain visible and readable. `fit: fill` stretches tabs along the orientation axis in both orientations. Badges are read as part of the tab's name ("Inbox, 3"). A tab without a matching panel, or a panel without a tab, is a development warning and is not rendered. On Lit, panels are light-DOM children, so `keepMounted: false` hides inactive panels with the `hidden` attribute rather than removing them.

## Content guidelines

Tab labels are one or two words, sentence case, nouns ("Activity", "Members"), never verbs. Badges are short counts or a single status word. The tab list `label` names what the tabs divide ("Project sections"). Order tabs by frequency of use, not alphabetically, and never reorder them at runtime.

## Accessibility

Role `tablist` with a name, `tab`s with `aria-selected` and `aria-controls`, panels with `tabpanel` and `aria-labelledby` (WCAG 4.1.2; APG tabs). One tab stop with arrow movement (roving-tabindex, arrow-navigation), so a screen full of tabs is not a screen full of stops. Selection is conveyed by `aria-selected`, the indicator and the stronger text color — not color alone (1.4.1). Panels are focusable so keyboard users land in the content. Targets meet 44px; the indicator meets 3:1 on the page (1.4.11). The indicator animation respects reduced motion.

## Platform notes

### Web
Render `<div role="tablist" aria-label aria-orientation>` of `<button role="tab" id aria-selected aria-controls tabindex>`, with the indicator as an absolutely positioned bar whose `inset-inline-start` and `inline-size` update from the selected tab's offset (transitioned with `transition`). Panels: `<div role="tabpanel" id aria-labelledby tabindex="0" hidden>`. Keydown on the list implements the keyboard table for the orientation. `overflow-x: auto; scrollbar-width: none` on the list with `scrollIntoView({ inline: 'nearest' })` on selection. Export `TabPanel` as the wrapper for children.

### Lit
`<ds-tabs label="Project sections" .tabs=${tabs}><ds-tab-panel id="overview">…</ds-tab-panel>…</ds-tabs>`. Tab list in the shadow root; panels are light-DOM `<ds-tab-panel>` elements that ds-tabs manages (`hidden`, `role="tabpanel"`, `aria-labelledby` pointing at a shadow tab requires the tab id to be exposed — set `aria-labelledby` to a light-DOM proxy text or use `aria-label={tab label}` on the panel instead, since IDREFs do not cross shadow boundaries). Composed `change`.

### React Native
`ScrollView horizontal` (or a `View` with `flexDirection: 'row'` for `fill`) of `Pressable accessibilityRole="tab" accessibilityState={{ selected, disabled }}`; the indicator is an `Animated.View` positioned from the measured tab layout; panels are `View`s rendered when selected. Vertical: a column of tabs beside the panel. Arrow keys through `onKeyDown` are web-only (react-native-web); on native every tab is an accessibility stop.

## Related

SegmentedControl, Accordion, Disclosure, Link, Stepper (planned).
