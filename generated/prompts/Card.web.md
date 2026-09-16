# Generate: Card for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Card.tsx` exporting a typed React function component named `Card`, plus `Card.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Card({ ref, …rest }: CardProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Card> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Card.test.tsx`.
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
  name: Card
  category: container
  status: review
  anatomy:
  - surface
  - header
  - heading
  - headerActions
  - body
  - footer
  parts:
    body:
      kind: slot
      slot:
        default: true
        prop: children
        required: true
    headerActions:
      kind: slot
      slot:
        prop: headerActions
    footer:
      kind: slot
      slot:
        prop: footer
  props:
    children:
      type: content
      required: true
      description: The body. Usually a Stack of Text and controls.
    heading:
      type: string
      description: The card's title, rendered as a Heading at the card's level. Omit
        for cards that are a single piece of content.
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      default: '3'
      description: Heading level for `heading`, so cards fit the page outline. Cards
        in a list share a level.
    headerActions:
      type: content
      description: Controls at the end of the header row — a ghost icon-only Button,
        a Link. At most two.
    footer:
      type: content
      description: The action row. Buttons in a row, primary first, following Form's
        action-order rule.
    inset:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      - lg
      default: md
      description: Padding inside the card from the layout inset presets. `sm` for
        dense grids, `lg` for a single featured card.
    surface:
      type: enum
      values:
      - default
      - subtle
      default: default
      description: '`default` is the page background with a border — the calm option;
        `subtle` is a tinted surface without a border.'
    interactive:
      type: boolean
      default: false
      description: The whole card is one link or button target. Requires exactly one
        interactive child (a Link or Button) whose action the card extends to its
        full area; the card itself is not focusable.
      a11y: The card never becomes a second focus stop; its single child link or button
        is the target, and the card enlarges the hit area only (pseudo-element on
        web, wrapping Pressable on native).
    focusable:
      type: boolean
      default: false
      description: The card root takes tabindex=-1 so a container (Feed) can move
        focus to it by script, and draws its own focus ring when focused that way.
        Not a tab stop; not for making cards clickable (`interactive`).
      a11y: Only scripted focus (PageUp/PageDown in a Feed) lands here; the ring is
        drawn on the card via :focus-visible.
  styles:
    paddingBlock:
      token: layout.inset.{inset}
      locked: false
    paddingInline:
      token: layout.inset.{inset}
      locked: false
    partGap:
      token: layout.gap.loose
      description: Vertical gap between header, body and footer.
      locked: false
    headerGap:
      token: layout.gap.normal
      part: header
      description: Horizontal gap between the heading and headerActions.
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: Horizontal gap between footer actions.
      locked: false
    actionsGap:
      token: layout.gap.tight
      description: Horizontal gap between the headerActions controls.
      locked: false
    background:
      token: color.background.{surface}
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      description: Rendered only with surface default.
      locked: false
    radius:
      token: radius.lg
      locked: false
    hoverBackground:
      token: color.background.subtle
      state: hover
      description: Interactive cards only, on pointer hover; subtle cards use color.background.strong.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    transition:
      token: motion.duration.fast
      description: Interactive hover, with motion.easing.standard.
      locked: false
  a11y:
    role: none
    requires:
    - heading-hierarchy
    - focus-visible
    - contrast-aa
    contrast:
    - foreground: color.foreground
      background: color.background.{surface}
      level: AA
    - foreground: color.foreground.muted
      background: color.background.{surface}
      level: AA
    - foreground: color.link
      background: color.background.{surface}
      level: AA
  platforms:
    web:
      element: article
      attributes:
      - aria-labelledby
      notes: 'An <article> when it has a heading (aria-labelledby the heading id),
        a <div> otherwise. Header, body and footer are plain flex rows/columns styled
        from this component''s own gap bindings (not the Stack component: Stack owns
        page rhythm and its gap enum, while these gaps are Card''s bindings and must
        stay overridable per instance). Interactive: the single child link/button
        gets a ::after pseudo-element covering the card (position: relative on the
        card), so the hit area grows without adding a focus stop; the focus ring is
        drawn on the card via :focus-within.'
    lit:
      tag: ds-card
      reflect:
      - inset
      - surface
      - interactive
      - heading-level
      notes: 'Shadow root with named slots `header-actions` and `footer`, default
        slot for the body, and the heading rendered from the `heading` property as
        a <ds-heading>. Composes ds-stack for the rows. The interactive hit-area trick
        works across the shadow boundary only if the link is slotted: the host gets
        position: relative and the slotted link is told (via a class the card adds
        on slotchange) to extend; document it.'
    rn:
      element: View
      props:
      - accessibilityRole
      - accessibilityLabel
      notes: 'View with padding/background/border/radius from tokens; header and footer
        are plain row Views styled from this component''s gap bindings, not Stack.
        Interactive: the card wraps its content in a Pressable that forwards onPress
        to the single child Link/Button''s handler and takes accessibilityRole from
        it; the child then renders with accessible={false} so there is one element
        for assistive technology.'
    swiftui:
      element: VStack
      props:
      - .padding
      - .background
      - .overlay=border
      - .clipShape
      - .accessibilityElement=contain
      - .accessibilityLabel
      - .contentShape
      - .focusable
      - .focused
      notes: 'Surface from the tokens, `inset` padding, header row (`Heading` + `headerActions`
        HStack), body, footer with the gap bindings. `.accessibilityElement(children:
        .contain)` labelled by the heading. `interactive`: the card is wrapped in
        a `Button` whose action is the single child link/button''s action (found by
        the child declaring itself through `CardActionPreference`), the child is `.accessibilityHidden`
        inside it, and hover shows `hoverBackground` on iPad pointer — one target,
        one focus stop. `focusable`: `.focusable()` with the focus ring drawn on the
        card, for Feed''s PageUp/PageDown.'
  behavior:
  - name: heading-is-rendered-as-a-heading
    description: The heading is rendered as a Heading at the card's level, and it
      is what a screen-reader user jumps to.
    given:
      heading: Team plan
    then:
    - text: Team plan
    - role: heading
      platforms:
      - web
  - name: a-card-with-a-heading-is-an-article
    description: A card with a heading is an article labelled by that heading, so
      screen-reader users can navigate card by card.
    given:
      heading: Team plan
    then:
    - role: article
      platforms:
      - web
  - name: interactive-adds-no-focus-stop
    description: An interactive card extends its single child link or button to the
      whole area; the card itself is never a second tab stop.
    given:
      interactive: true
    then:
    - focusable: false
    platforms:
    - web
    - lit
  - name: focusable-takes-scripted-focus-only
    description: A focusable card carries tabindex=-1 so a container (Feed) can move
      focus to it by script; it is not a tab stop.
    given:
      focusable: true
    then:
    - attribute: tabindex
      is: '-1'
      platforms:
      - web
    - focusable: true
      platforms:
      - web
  examples:
  - name: plan-card
    description: A card as a unit in a list of choices, with its own heading at the
      list's level.
    given:
      heading: Team plan
      headingLevel: '3'
      children: What the plan includes
  - name: dense-grid-card
    description: A card in a dense grid, on the tinted surface and with the tighter
      inset.
    given:
      children: A search result
      inset: sm
      surface: subtle
  - name: whole-card-is-a-link
    description: A card whose single child link leads somewhere, with the card as
      the hit area and the link as the only tab stop.
    given:
      heading: September invoice
      children: A Link to the invoice
      interactive: true
  - name: card-focused-by-a-feed
    description: A card a Feed moves focus to with PageUp/PageDown, which draws its
      own ring when focused that way.
    given:
      heading: New comment
      children: The comment body
      focusable: true
```

## Parts and slots

- `surface`: element
- `header`: element
- `heading`: element
- `headerActions`: slot, prop `headerActions`
- `body`: slot, prop `children`, required
- `footer`: slot, prop `footer`

## Style bindings

- `headerGap`: token `layout.gap.normal`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `hoverBackground`: token `color.background.subtle`; state `hover`; locked

## Constants and examples

- example `plan-card`, story `PlanCard`: given `heading: "Team plan"`, `headingLevel: "3"`, `children: "What the plan includes"`; A card as a unit in a list of choices, with its own heading at the list's level.
- example `dense-grid-card`, story `DenseGridCard`: given `children: "A search result"`, `inset: "sm"`, `surface: "subtle"`; A card in a dense grid, on the tinted surface and with the tighter inset.
- example `whole-card-is-a-link`, story `WholeCardIsALink`: given `heading: "September invoice"`, `children: "A Link to the invoice"`, `interactive: true`; A card whose single child link leads somewhere, with the card as the hit area and the link as the only tab stop.
- example `card-focused-by-a-feed`, story `CardFocusedByAFeed`: given `heading: "New comment"`, `children: "The comment body"`, `focusable: true`; A card a Feed moves focus to with PageUp/PageDown, which draws its own ring when focused that way.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `paddingBlock`, `paddingInline`, `partGap`, `headerGap`, `footerGap`, `actionsGap`, `border`, `borderWidth`, `radius`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `hoverBackground`, `focusRing`, `focusRingWidth`

## Behavior scenarios (15)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: heading-is-rendered-as-a-heading
  description: The heading is rendered as a Heading at the card's level, and it is
    what a screen-reader user jumps to.
  given:
    heading: Team plan
  then:
  - text: Team plan
  - role: heading
- name: a-card-with-a-heading-is-an-article
  description: A card with a heading is an article labelled by that heading, so screen-reader
    users can navigate card by card.
  given:
    heading: Team plan
  then:
  - role: article
- name: interactive-adds-no-focus-stop
  description: An interactive card extends its single child link or button to the
    whole area; the card itself is never a second tab stop.
  given:
    interactive: true
  then:
  - focusable: false
  platforms:
  - web
  - lit
- name: focusable-takes-scripted-focus-only
  description: A focusable card carries tabindex=-1 so a container (Feed) can move
    focus to it by script; it is not a tab stop.
  given:
    focusable: true
  then:
  - attribute: tabindex
    is: '-1'
  - focusable: true
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-heading-level-2
  given:
    headingLevel: '2'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-3
  given:
    headingLevel: '3'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-4
  given:
    headingLevel: '4'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-5
  given:
    headingLevel: '5'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-6
  given:
    headingLevel: '6'
  then:
  - renders: true
  derived: true
- name: renders-inset-sm
  given:
    inset: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-md
  given:
    inset: md
  then:
  - renders: true
  derived: true
- name: renders-inset-lg
  given:
    inset: lg
  then:
  - renders: true
  derived: true
- name: renders-surface-default
  given:
    surface: default
  then:
  - renders: true
  derived: true
- name: renders-surface-subtle
  given:
    surface: subtle
  then:
  - renders: true
  derived: true
```

## Platform notes (web)

```yaml
element: article
attributes:
- aria-labelledby
notes: 'An <article> when it has a heading (aria-labelledby the heading id), a <div>
  otherwise. Header, body and footer are plain flex rows/columns styled from this
  component''s own gap bindings (not the Stack component: Stack owns page rhythm and
  its gap enum, while these gaps are Card''s bindings and must stay overridable per
  instance). Interactive: the single child link/button gets a ::after pseudo-element
  covering the card (position: relative on the card), so the hit area grows without
  adding a focus stop; the focus ring is drawn on the card via :focus-within.'
```

## Guidance

## Overview

A Card frames one thing so it can sit among others: a search result, a plan to choose, a setting group, a dashboard panel. It is a Box with conventions — a heading row, a body, an action row, consistent padding and gaps from the theme's rhythm — so that every card on every screen has the same internal spacing without anyone choosing it.

## When to use

Use Cards for collections of like items where each needs its own boundary, and for a single panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page. Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.

## When not to use

Do not put a card inside a card. Do not use Cards to separate sections of a form or a settings page — that is a Landmark or a Heading with `section` spacing. Do not use a Card for a status message (Alert) or for a transient layer (Dialog, planned). Do not use `interactive` with more than one control inside; nested targets are a well-known accessibility failure.

## Behavior

The header renders when `heading` or `headerActions` is present, the footer when `footer` is present; body always. Header, body and footer are separated by `partGap`, and the card pads all of it by `inset`. `surface: default` draws a border, `subtle` does not. An `interactive` card grows its single child link or button's hit area to the whole card, shows `hoverBackground` on pointer hover, and draws the focus ring around the card when that child is focused — but adds no focus stop of its own. A `focusable` card carries `tabIndex={-1}` on its root and draws the same ring on its own `:focus-visible`; aria attributes passed through `...rest` (role, aria-posinset, aria-setsize, aria-describedby) land on the root, which is how Feed makes a Card an article.

## Content guidelines

Headings are short noun phrases, sentence case, one line. Footers hold one primary action at most, placed first, then one secondary; a card with more choices than that is a form. Body text keeps to a few lines; a card is a summary, and the detail lives where its action goes.

## Accessibility

A card with a heading is an `article` labelled by that heading, so screen-reader users can navigate card by card and hear each one's name (WCAG 1.3.1, 2.4.6); heading levels are consistent within a list and fit the page outline (heading-hierarchy). Interactive cards keep exactly one tab stop — the child link or button — and show a visible focus ring on the card (2.4.7), so keyboard users get the same large target as pointer users (2.5.8) without a redundant stop. Text on either surface meets 4.5:1 in both modes; the build checks body, muted and link foreground against both.

## Platform notes

### Web
Render `<article aria-labelledby={headingId}>` (or `<div>` without a heading) with `ds-card` classes for `inset`, `surface` and `interactive`. Header: a flex row with `justify-content: space-between` and `gap` from `headerGap`, containing the Heading (level from `headingLevel`, `size: lg` so a card heading reads smaller than a page heading) and the actions in a row with `gap` from `actionsGap`. Footer: a flex row with `gap` from `footerGap`. The rows are Card's own markup, not Stack, so their gaps stay per-instance overridable. Interactive: `position: relative` on the card; the single link/button child receives a class that adds `::after { content: ''; position: absolute; inset: 0 }`; `:focus-within` draws the ring on the card.

### Lit
`<ds-card heading="Plan" heading-level="3" inset="md">` with slots `header-actions`, default, and `footer`. Renders `<ds-heading size="lg">` internally (same size on every platform); header and footer rows are Card's own flex rows, not `<ds-stack>`. For `interactive`, on `slotchange` find the single `ds-link`/`ds-button` in the default slot, add the extending class to it (light DOM, so the consumer's stylesheet or a small global rule from the package applies the pseudo-element), and draw the ring on `:host(:focus-within)`.

### React Native
`View` with padding, background, border and radius from tokens; header and footer are plain row Views styled from Card's own gap bindings; the heading is the system `Heading` at `size: lg`. For `interactive`, wrap the content in a `Pressable` whose `onPress` calls the single child's handler and whose `accessibilityRole` and `accessibilityLabel` are copied from it; render the child with `accessible={false}` so it collapses into the Pressable.

## Related

Box, Stack, Heading, Button, Link, Container.
