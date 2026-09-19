# Generate: Stack as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Stack.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Stack.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: StackVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Story render shape: the render that applies to a story (its own `render`, else the meta's) is written inline and returns one `html`` template directly — never a call (`render: (args) => renderBox(args)`) and never a bare identifier (`render: divider`). The docs site reads that template for the Lit code sample, and anything else leaves every story in the module without one. Interpolate helper fragments into the template rather than wrapping it.
- Story parity: every story the React package exports has a Lit story with the same export name and args, including each example named above.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Stack.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element in the shadow root), only in its `state` (`:hover`, `:focus-visible`, the reflected state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated property, event, value or element keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development (`import.meta.env.DEV`) naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

## Component schema

```yaml
component:
  name: Stack
  category: layout
  status: review
  anatomy:
  - container
  - item
  props:
    children:
      type: content
      required: true
      description: 'Any components. Stack does not style its children; it only positions
        them. Null and boolean children are skipped, as the platform skips them. In
        examples `children` describes the content in words; stories render it with
        system components (Input, Button, Text) in the order named, and the Default
        story renders three Text children reading "First item", "Second item" and
        "Third item". The examples resolve as: form fields are three Inputs labelled
        "Full name", "Email" and "Password"; the regions of the page are three Boxes
        (`surface: subtle`, `inset: md`) each holding a Text naming its region ("Summary",
        "Details", "History"); a row of filters is eight small secondary Buttons ("All",
        "Open", "Closed", "Mine", "Unassigned", "Urgent", "This week", "Archived");
        the button row''s primary submit Button is labelled "Submit". All of it is
        story scaffolding, not copy.'
    direction:
      type: enum
      values:
      - vertical
      - horizontal
      default: vertical
      description: Main axis. `horizontal` follows writing direction (start→end),
        not left→right.
    gap:
      type: enum
      values:
      - none
      - tight
      - normal
      - loose
      - section
      default: normal
      description: 'Space between children, from the layout rhythm (`layout.gap.*`),
        not the raw spacing scale: tight for related controls, normal for fields in
        a form, loose for groups, section between page sections. The only way to set
        spacing between siblings.'
    align:
      type: enum
      values:
      - start
      - center
      - end
      - stretch
      default: stretch
      description: Cross-axis alignment.
    justify:
      type: enum
      values:
      - start
      - center
      - end
      - between
      default: start
      description: 'Main-axis distribution. It only shows where the main axis is larger
        than the content — a vertical Stack needs a bounded height for it to mean
        anything, and Stack has no size of its own, so that is the caller''s to give.
        The four values are the whole set: `around` and `evenly` are deliberately
        left out, since a rhythm system should not offer four ways to divide leftover
        space. Its enum stories (and `DirectionHorizontal`) are therefore horizontal:
        an enum-value story may add the args that make its value visible (`direction:
        horizontal`, `align: start`), while an example story has exactly its `given`.
        The `Gap*` stories take only `gap` and stay vertical. Meta args hold only
        schema defaults, and those merged under an example story count as "exactly
        its `given`".'
    wrap:
      type: boolean
      default: false
      description: 'Allow horizontal stacks to wrap onto new lines instead of overflowing.
        It is set whatever the direction — on a column it is inert unless the block
        size is bounded — rather than being silently ignored on a vertical Stack.
        As a boolean it gets one story, `Wrap` (horizontal, `align: start`, the eight
        filter Buttons of `wrapping-filters`, in the same width-bounded decorator).'
      a11y: 'Prefer wrapping over horizontal scrolling so content reflows at 320px
        and 400% zoom. Native has neither viewport width nor browser zoom: the equivalent
        is that a wrapped row still fits when the platform''s text size is turned
        up.'
    element:
      type: enum
      values:
      - div
      - section
      - nav
      - ul
      - ol
      default: div
      description: 'Landmark or list semantics when the group has meaning. For `ul`/`ol`,
        each child is wrapped in an `li` that is `display: contents`, so the children
        stay the flex items and the gap is unchanged; the wrapper carries `role="listitem"`
        and the list `role="list"`, because dropping `list-style` removes list semantics
        in some browsers. One `li` per child as the platform counts children: a fragment
        holding two elements is one child, so pass an array; null and boolean children
        get no `li`. The list role wins over a consumer `role` on `ul`/`ol`; on the
        other elements a consumer `role` passes through. React Native has no counterpart
        for either value — a native list has no accessibility role to claim — so a
        navigation region there is Landmark and a list is a plain View whose rows
        carry their own semantics.'
      platforms:
      - web
      - lit
  styles:
    gap:
      token: layout.gap.{gap}
      description: '`gap: none` resolves `layout.gap.none`, a real token that is zero,
        and makes `overrides.gap` a no-op, per the presence rule; on web and Lit the
        `none` rule reads `var(--layout-gap-none)` directly rather than the `--ds-stack-gap`
        hook, so consumer CSS on the hook is ignored there too. It is read as a token
        on every platform — none of them writes a bare 0.'
      locked: false
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: 'Flexbox. `gap` maps to the CSS gap property with the layout.gap token;
        no margins on children. The root is the `container` part; the `li` wrappers
        for `ul`/`ol` are the `item` part. Stack merges a consumer `className` and
        `style` onto the root, as Box and Text do, because composites give it layout-only
        classes; the consumer `style` is merged after the `overrides` hooks. The root
        also sets `min-inline-size: 0`, so a horizontal Stack can shrink inside a
        parent flex container. The ref is `Ref<HTMLElement>`, not narrowed per `element`.'
    lit:
      tag: ds-stack
      reflect:
      - direction
      - gap
      - align
      - justify
      - wrap
      notes: 'The host is the flex container (`:host { display: flex }`) with a default
        slot, so children stay in the light DOM and keep their own semantics. The
        host is the `container` part and carries no `part` attribute, since a host
        cannot; for `ul`/`ol` the shadow root renders the list and one `li` per child,
        each `display: contents` and marked `part="item"`. Keep the light DOM where
        it is: use manual slot assignment and rebuild the wrappers from a childList
        observer rather than moving children into them, which would re-fire slotchange
        forever. A child is an element or a text node with non-whitespace content;
        comments and whitespace-only text get no `li`. Every wrapper in the shadow
        root (`section`, `nav`, `ul`, `ol`, `li`) is `display: contents`, so the host
        stays the flex container. The list role lives on the shadow `ul`/`ol`, so
        the web rule that the list role beats a consumer `role` does not arise: a
        consumer `role` on the host is the consumer''s and is left alone. `element`
        is not reflected: it is read from the attribute or property but is not a styling
        contract, since it changes only the shadow structure. `:host` sets `min-inline-size:
        0`, as the web root does.'
    rn:
      element: View
      props: []
      notes: 'Flexbox with `gap` (RN ≥ 0.71). Children are not wrapped, so the `item`
        part has no native home and there is no `Stack.item` testID. `horizontal`
        is `flexDirection: ''row''`, which follows writing direction only when the
        app enables RTL through I18nManager; Stack does not force it. There is no
        public `style` prop; the View''s style is internal. `element` is not applicable:
        a navigation region is Landmark and a list is a plain View whose rows carry
        their own semantics.'
    swiftui:
      element: VStack
      props:
      - HStack
      - spacing
      - alignment
      - .frame
      - ViewThatFits
      - .accessibilityElement=contain
      notes: '`VStack`/`HStack` with `spacing` from the gap token and `alignment`
        from `align`; `wrap` uses a `Layout`-conforming `FlowLayout` in `Support/`
        (SwiftUI has no flex-wrap). There is no `responsive` direction and no `divider`
        prop — the two the notes used to describe were never in `props`, and a row
        that becomes a column is two Stacks the caller chooses between.'
  behavior:
  - name: nav-element-is-a-navigation-landmark
    description: Choose element when the group has meaning - nav for navigation -
      so the structure is exposed to assistive technology.
    given:
      element: nav
    then:
    - role: navigation
      platforms:
      - web
      - lit
  - name: list-element-is-a-list
    description: 'For ul, each child is wrapped in an li, so assistive technology
      announces the group as a list and counts its items: the Default story''s three
      children give three listitems, which the test asserts too.'
    given:
      element: ul
    then:
    - role: list
      platforms:
      - web
      - lit
  examples:
  - name: form-fields
    description: The usual vertical rhythm between fields in a form.
    given:
      direction: vertical
      gap: normal
      children: The form fields
  - name: button-row
    description: A row of actions at the end of a form or card, tightly spaced and
      pushed to the end.
    given:
      direction: horizontal
      gap: tight
      justify: end
      align: center
      children: A secondary Cancel Button, then a primary submit Button
  - name: page-sections
    description: The section rhythm between the regions of a page.
    given:
      direction: vertical
      gap: section
      children: The regions of the page
  - name: wrapping-filters
    description: A horizontal group that reflows onto new lines on narrow viewports
      instead of overflowing. Its story renders inside a container capped at `layout.maxWidth.prose
      × 0.5` (a story decorator, not an arg), narrow enough that the eight filters
      wrap in every theme.
    given:
      direction: horizontal
      gap: tight
      wrap: true
      align: center
      children: A row of filters
```

## Constants and examples

- example `form-fields`, story `FormFields`: given `direction: "vertical"`, `gap: "normal"`, `children: "The form fields"`; The usual vertical rhythm between fields in a form.
- example `button-row`, story `ButtonRow`: given `direction: "horizontal"`, `gap: "tight"`, `justify: "end"`, `align: "center"`, `children: "A secondary Cancel Button, then a primary submit Button"`; A row of actions at the end of a form or card, tightly spaced and pushed to the end.
- example `page-sections`, story `PageSections`: given `direction: "vertical"`, `gap: "section"`, `children: "The regions of the page"`; The section rhythm between the regions of a page.
- example `wrapping-filters`, story `WrappingFilters`: given `direction: "horizontal"`, `gap: "tight"`, `wrap: true`, `align: "center"`, `children: "A row of filters"`; A horizontal group that reflows onto new lines on narrow viewports instead of overflowing. Its story renders inside a container capped at `layout.maxWidth.prose × 0.5` (a story decorator, not an arg), narrow enough that the eight filters wrap in every theme.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `gap`
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (23)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: nav-element-is-a-navigation-landmark
  description: Choose element when the group has meaning - nav for navigation - so
    the structure is exposed to assistive technology.
  given:
    element: nav
  then:
  - role: navigation
- name: list-element-is-a-list
  description: 'For ul, each child is wrapped in an li, so assistive technology announces
    the group as a list and counts its items: the Default story''s three children
    give three listitems, which the test asserts too.'
  given:
    element: ul
  then:
  - role: list
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-direction-vertical
  given:
    direction: vertical
  then:
  - renders: true
  derived: true
- name: renders-direction-horizontal
  given:
    direction: horizontal
  then:
  - renders: true
  derived: true
- name: renders-gap-none
  given:
    gap: none
  then:
  - renders: true
  derived: true
- name: renders-gap-tight
  given:
    gap: tight
  then:
  - renders: true
  derived: true
- name: renders-gap-normal
  given:
    gap: normal
  then:
  - renders: true
  derived: true
- name: renders-gap-loose
  given:
    gap: loose
  then:
  - renders: true
  derived: true
- name: renders-gap-section
  given:
    gap: section
  then:
  - renders: true
  derived: true
- name: renders-align-start
  given:
    align: start
  then:
  - renders: true
  derived: true
- name: renders-align-center
  given:
    align: center
  then:
  - renders: true
  derived: true
- name: renders-align-end
  given:
    align: end
  then:
  - renders: true
  derived: true
- name: renders-align-stretch
  given:
    align: stretch
  then:
  - renders: true
  derived: true
- name: renders-justify-start
  given:
    justify: start
  then:
  - renders: true
  derived: true
- name: renders-justify-center
  given:
    justify: center
  then:
  - renders: true
  derived: true
- name: renders-justify-end
  given:
    justify: end
  then:
  - renders: true
  derived: true
- name: renders-justify-between
  given:
    justify: between
  then:
  - renders: true
  derived: true
- name: renders-element-div
  given:
    element: div
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-section
  given:
    element: section
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-nav
  given:
    element: nav
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-ul
  given:
    element: ul
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-ol
  given:
    element: ol
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-stack
reflect:
- direction
- gap
- align
- justify
- wrap
notes: 'The host is the flex container (`:host { display: flex }`) with a default
  slot, so children stay in the light DOM and keep their own semantics. The host is
  the `container` part and carries no `part` attribute, since a host cannot; for `ul`/`ol`
  the shadow root renders the list and one `li` per child, each `display: contents`
  and marked `part="item"`. Keep the light DOM where it is: use manual slot assignment
  and rebuild the wrappers from a childList observer rather than moving children into
  them, which would re-fire slotchange forever. A child is an element or a text node
  with non-whitespace content; comments and whitespace-only text get no `li`. Every
  wrapper in the shadow root (`section`, `nav`, `ul`, `ol`, `li`) is `display: contents`,
  so the host stays the flex container. The list role lives on the shadow `ul`/`ol`,
  so the web rule that the list role beats a consumer `role` does not arise: a consumer
  `role` on the host is the consumer''s and is left alone. `element` is not reflected:
  it is read from the attribute or property but is not a styling contract, since it
  changes only the shadow structure. `:host` sets `min-inline-size: 0`, as the web
  root does.'
```

## Guidance

## Overview

Stack is how things get spaced. Instead of margins on individual components, a Stack owns the gap between its children, using one of the theme's rhythm presets (`layout.gap.*`) rather than a raw number, so a theme with `layout.rhythm: loose` opens up every screen at once. Almost every screen is stacks inside stacks.

## When to use

Use Stack for any group of siblings that should be evenly spaced: form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach for it before writing any layout CSS. Choose `element` when the group has meaning — `nav` for navigation, `ul` for a list of like items — so the structure is exposed to assistive technology.

## When not to use

Do not use Stack for two-dimensional layouts (use Grid, planned) or for positioning a single element (use spacing tokens on the parent). Do not set gaps between children by adding margins to the children; that defeats the purpose.

A wrapped Stack is not a card grid, and `wrap` should not be asked to be one. Flex items are sized by their content, so a row of four prose cards shrinks toward its longest word and never reaches the width where it would break: at phone width the four render as four one-word columns. The missing piece is a preferred item width, which is a property of the item, and Stack has no per-item prop, no `columns` and no `itemBasis` — and should not grow one. The answer is the planned Grid (`minItemWidth`, `gap`, one `repeat(auto-fit, minmax(…))` rule), which also fixes the ragged last row a flex wrap leaves. Until it exists, a page that needs the shape sets `flex` on the children from its own stylesheet and says so. The same section wants a token for "the narrowest a card of prose should be", which the scale does not have: a `layout.column.*` group beside `layout.maxWidth.*` would let Grid state its minimum in tokens like every other layout decision.

## Behavior

Stack is purely presentational: no events, no state. `horizontal` stacks overflow by default; set `wrap` so content reflows on narrow viewports. `align: stretch` (the default) makes children fill the cross axis, which is what buttons in a vertical stack usually want; set `start` for natural widths. A horizontal row of controls sets `align: center`, so its children keep their own heights rather than stretching to the tallest.

## Accessibility

Stack has no role by default and adds nothing to the accessibility tree. When `element` is a landmark or list, the correct semantics are rendered (`nav`, `ul` with `li` children). Horizontal stacks should wrap rather than scroll so content reflows at 320px width and 400% zoom (WCAG 1.4.10). Spacing from the scale keeps interactive targets separated enough to meet 2.5.8 target spacing when the targets themselves are small.

## Platform notes

### Web
`display: flex` with `flex-direction`, `gap: var(--layout-gap-<preset>)`, `align-items`, `justify-content`, and `flex-wrap`. `between` maps to `space-between`.

### Lit
`<ds-stack direction="horizontal" gap="tight">`. The host itself is the flex container; children are slotted light-DOM nodes, so their semantics are untouched. `element="ul"` renders a `<ul role="list">` with one `<li>` slot per child, assigned manually and rebuilt from a childList observer (never slotchange, which loops).

### React Native
`View` with `flexDirection`, `gap` from the RN token object, `alignItems`, `justifyContent`, `flexWrap`. `start`/`end` map to `flex-start`/`flex-end`.

## Related

Form, Button.
