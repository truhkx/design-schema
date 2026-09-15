# Generate: Card as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Card.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Card.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: CardVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Card.test.ts`.

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
      description: Horizontal gap between the heading and headerActions.
      locked: false
    footerGap:
      token: layout.gap.tight
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `paddingBlock`, `paddingInline`, `partGap`, `headerGap`, `footerGap`, `actionsGap`, `border`, `borderWidth`, `radius`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `hoverBackground`, `focusRing`, `focusRingWidth`

## Behavior scenarios (11)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (lit)

```yaml
tag: ds-card
reflect:
- inset
- surface
- interactive
- heading-level
notes: 'Shadow root with named slots `header-actions` and `footer`, default slot for
  the body, and the heading rendered from the `heading` property as a <ds-heading>.
  Composes ds-stack for the rows. The interactive hit-area trick works across the
  shadow boundary only if the link is slotted: the host gets position: relative and
  the slotted link is told (via a class the card adds on slotchange) to extend; document
  it.'
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
