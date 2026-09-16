# Generate: Box as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Box.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Box.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: BoxVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Box.test.ts`.

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
  name: Box
  category: layout
  status: review
  anatomy:
  - surface
  props:
    children:
      type: content
      required: true
      description: Any content. Box does not space its children; put a Stack inside
        for that.
    inset:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      default: none
      description: Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline`
        when the axes differ.
    insetBlock:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      description: 'Vertical padding, overriding `inset` on that axis. It has no default:
        unset means `inset` applies, which keeps an explicit `none` distinct from
        an absent value.'
    insetInline:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      description: Horizontal padding, overriding `inset` on that axis. Unset means
        `inset` applies, as with insetBlock.
    surface:
      type: enum
      values:
      - none
      - default
      - subtle
      - strong
      default: none
      description: Background. `none` is transparent; `default` is the page background
        (use to lift content off a subtle parent); `subtle` and `strong` step up.
    border:
      type: boolean
      default: false
      description: A thin default border.
    radius:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - full
      default: none
      description: Corner radius from the theme's presets.
    element:
      type: enum
      values:
      - div
      - section
      - article
      - aside
      - header
      - footer
      - main
      - nav
      default: div
      description: Element to render. Sectioning elements only when the box is a semantic
        region; prefer Landmark for page regions. There is no native counterpart,
        so a screen that ports to React Native uses Landmark for the region instead
        of this prop.
      platforms:
      - web
      - lit
  styles:
    paddingBlock:
      token: layout.inset.{inset}
      description: 'An override applies at every value including `none`: `layout.inset.none`
        is a real token (a zero), not an absent part, so padding is not one of the
        bindings presence gates.'
      locked: false
    paddingInline:
      token: layout.inset.{inset}
      locked: false
    background:
      token: color.background.{surface}
      description: '`none` renders the literal transparent, not a token; the token
        binding covers the other three values. Interpolated bindings like this one
        are locked — they keep their `--ds-box-*` hook, which is the consumer''s own-CSS
        escape hatch, but they are not members of the overrides type.'
      locked: true
    border:
      token: color.border
      description: 'The border colour. It shares a name with the `border` boolean,
        which decides presence: an override recolours the border and never brings
        one into existence.'
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.{radius}
      description: '`radius: none` resolves `radius.none` and is written out, rather
        than leaving the property unset — every binding is applied explicitly, with
        no cascade.'
      locked: false
  a11y:
    role: none
    requires:
    - contrast-aa
    contrast:
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground
      background: color.background.strong
      level: AA
    - foreground: color.foreground.muted
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.background.strong
      level: AA
    - foreground: color.link
      background: color.background.subtle
      level: AA
    - foreground: color.link
      background: color.background.strong
      level: AA
  platforms:
    web:
      element: div
      attributes: []
      notes: 'A plain element with classes for each enum value; `surface: none` sets
        no background. insetBlock/insetInline modifiers win over inset. No margin,
        ever. The root is the `surface` part and carries `data-part="surface"`, written
        before `...rest` so a composing parent can relabel it (Popover and BottomSheet
        pass `data-part="body"`). Box is the one primitive that merges a consumer
        `className` and `style` onto the root instead of dropping them, as Text does,
        because those same composites give it a layout-only class. Props are typed
        against `div` for every `element` value; Box is not polymorphic.'
    lit:
      tag: ds-box
      reflect:
      - inset
      - inset-block
      - inset-inline
      - surface
      - border
      - radius
      notes: 'The host is the box (`:host { display: block }`) with a default slot,
        so children stay in the light DOM. The host is also the `surface` part: it
        carries `data-part="surface"` alongside `data-ds`, and there is no `::part`,
        since `:host` cannot take one. `element` swaps nothing in the shadow root
        — the host is the element, so `element` is accepted for API parity and sets
        `role` via ElementInternals only where the implicit role does not depend on
        ancestry: article, aside → complementary, main, nav → navigation. `div`, `section`,
        `header` and `footer` set no role, because a native `<header>` or `<footer>`
        is only a banner or contentinfo outside sectioning content and the element
        cannot see where it sits; a page-level banner is Landmark.'
    rn:
      element: View
      props: []
      notes: 'View with paddingVertical/paddingHorizontal, backgroundColor, borderWidth/borderColor,
        borderRadius from the token object. `element` does not apply — use Landmark
        for a region. The root view is both the component and its only part, so it
        carries `testID="Box"` and there is no `Box.surface`: when a component''s
        single anatomy part is the root, the root form wins. A string given as `children`
        in an example is illustrative; native requires it inside a Text.'
    swiftui:
      element: VStack
      props:
      - .padding
      - .background
      - .overlay=border
      - .clipShape
      - .frame=maxWidth
      - .accessibilityElement=contain
      notes: 'A layout container: `padding` from the inset token on all edges, `.background(RoundedRectangle)`
        in the surface color (nothing for `none`), a stroked overlay for `border`,
        `.clipShape` for radius. Children are laid out by the caller''s stack; Box
        itself is a single-child wrapper (`VStack(spacing: 0)`) and never spaces siblings.
        No accessibility semantics unless the doc says the role is a landmark (then
        see Landmark).'
  behavior:
  - name: nav-element-carries-navigation-semantics
    description: When element is section, article, aside or nav, the native element
      carries that semantics on web; Box adds no role of its own otherwise.
    given:
      element: nav
    then:
    - role: navigation
      platforms:
      - web
  - name: article-element-carries-article-semantics
    description: The same rule for the other sectioning values - the element is the
      semantics, and Box adds nothing else.
    given:
      element: article
    then:
    - role: article
      platforms:
      - web
  examples:
  - name: highlighted-panel
    description: A panel lifted off the page with a tinted surface, rounded corners
      and the usual inset.
    given:
      children: A panel of settings
      inset: md
      surface: subtle
      radius: md
  - name: bordered-row
    description: A dense row bounded by a thin border rather than a fill.
    given:
      children: A row of data
      inset: sm
      border: true
  - name: hero-band
    description: A full-width band with more vertical than horizontal padding, on
      the strongest surface.
    given:
      children: A hero band
      insetBlock: xl
      insetInline: lg
      surface: strong
  - name: navigation-region
    description: A padded region whose element makes it a navigation landmark on web.
    given:
      children: The sidebar links
      element: nav
      inset: md
    platforms:
    - web
    - lit
```

## Constants and examples

- example `highlighted-panel`, story `HighlightedPanel`: given `children: "A panel of settings"`, `inset: "md"`, `surface: "subtle"`, `radius: "md"`; A panel lifted off the page with a tinted surface, rounded corners and the usual inset.
- example `bordered-row`, story `BorderedRow`: given `children: "A row of data"`, `inset: "sm"`, `border: true`; A dense row bounded by a thin border rather than a fill.
- example `hero-band`, story `HeroBand`: given `children: "A hero band"`, `insetBlock: "xl"`, `insetInline: "lg"`, `surface: "strong"`; A full-width band with more vertical than horizontal padding, on the strongest surface.
- example `navigation-region`, story `NavigationRegion`: given `children: "The sidebar links"`, `element: "nav"`, `inset: "md"`; A padded region whose element makes it a navigation landmark on web.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `paddingBlock`, `paddingInline`, `border`, `borderWidth`, `radius`
Locked (accessibility-bearing, never overridable): `background`

## Behavior scenarios (33)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-inset-none
  given:
    inset: none
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
- name: renders-inset-xl
  given:
    inset: xl
  then:
  - renders: true
  derived: true
- name: renders-inset-block-none
  given:
    insetBlock: none
  then:
  - renders: true
  derived: true
- name: renders-inset-block-sm
  given:
    insetBlock: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-block-md
  given:
    insetBlock: md
  then:
  - renders: true
  derived: true
- name: renders-inset-block-lg
  given:
    insetBlock: lg
  then:
  - renders: true
  derived: true
- name: renders-inset-block-xl
  given:
    insetBlock: xl
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-none
  given:
    insetInline: none
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-sm
  given:
    insetInline: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-md
  given:
    insetInline: md
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-lg
  given:
    insetInline: lg
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-xl
  given:
    insetInline: xl
  then:
  - renders: true
  derived: true
- name: renders-surface-none
  given:
    surface: none
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
- name: renders-surface-strong
  given:
    surface: strong
  then:
  - renders: true
  derived: true
- name: renders-radius-none
  given:
    radius: none
  then:
  - renders: true
  derived: true
- name: renders-radius-sm
  given:
    radius: sm
  then:
  - renders: true
  derived: true
- name: renders-radius-md
  given:
    radius: md
  then:
  - renders: true
  derived: true
- name: renders-radius-lg
  given:
    radius: lg
  then:
  - renders: true
  derived: true
- name: renders-radius-full
  given:
    radius: full
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
- name: renders-element-article
  given:
    element: article
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-aside
  given:
    element: aside
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-header
  given:
    element: header
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-footer
  given:
    element: footer
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-main
  given:
    element: main
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
```

## Platform notes (lit)

```yaml
tag: ds-box
reflect:
- inset
- inset-block
- inset-inline
- surface
- border
- radius
notes: "The host is the box (`:host { display: block }`) with a default slot, so children\
  \ stay in the light DOM. The host is also the `surface` part: it carries `data-part=\"\
  surface\"` alongside `data-ds`, and there is no `::part`, since `:host` cannot take\
  \ one. `element` swaps nothing in the shadow root \u2014 the host is the element,\
  \ so `element` is accepted for API parity and sets `role` via ElementInternals only\
  \ where the implicit role does not depend on ancestry: article, aside \u2192 complementary,\
  \ main, nav \u2192 navigation. `div`, `section`, `header` and `footer` set no role,\
  \ because a native `<header>` or `<footer>` is only a banner or contentinfo outside\
  \ sectioning content and the element cannot see where it sits; a page-level banner\
  \ is Landmark."
```

## Guidance

## Overview

Box is the thing you reach for when a group of content needs a surface: padding around it, a background under it, a border, rounded corners. It has no opinions about what is inside and no spacing between its children — that is Stack's job — so the two compose without overlap: a Box for the inset, a Stack for the gaps.

## When to use

Use a Box to give a region of a layout a background or padding: a sidebar panel, a highlighted row, a footer band, the inside of a modal. Use it when a Card is too much (a Card is a Box with conventions about elevation and content). Choose `inset` by role — `sm` for dense rows, `md` for most panels, `lg` for page-level containers, `xl` for hero bands — and let the theme's rhythm decide the numbers.

## When not to use

Do not use a Box to add space between two components; put them in a Stack. Do not use it as a page container; Container owns gutters and measure. Do not nest surfaces more than two deep (`subtle` on `default`, `strong` on `subtle`) — a third level reads as clutter and the contrast math is only checked two deep. Do not use `surface` to signal status; that is Alert's tinted background.

## Behavior

Box renders its children in a block with the requested padding, background, border and radius, and nothing else. It adds no role of its own (`a11y.role: none`); on web the native element carries whatever semantics it has, which for `section`, `header` and `footer` depends on naming and ancestry as it does in plain HTML, and Lit sets an ElementInternals role only for the values whose role is unconditional (see the platform note). It never scrolls, never clips (`radius` does not imply `overflow: hidden`; a child that should be clipped clips itself), and never carries margin. `insetBlock` and `insetInline` override `inset` per axis. `surface: none` sets no background at all, so the parent's shows through.

## Content guidelines

None; Box has no text of its own.

## Accessibility

Box is invisible to assistive technology unless `element` gives it a sectioning role, in which case Landmark is usually the right component instead. Text on a `subtle` or `strong` surface must remain readable: the build checks body, muted and link foreground against both surfaces in both modes (WCAG 1.4.3), which is what makes "two levels deep" a safe rule rather than a hope. Box itself sets no foreground and establishes no colour context for its children, so these pairs are a guarantee about the tokens, not something the component implements or can enforce at runtime. A border, when present, is decorative; nothing relies on it to identify content (1.4.11 does not apply).

## Platform notes

### Web
Render the `element` with classes `ds-box`, `ds-box--inset-{value}`, `ds-box--inset-block-{value}`, `ds-box--inset-inline-{value}`, `ds-box--surface-{value}`, `ds-box--border`, `ds-box--radius-{value}`. Padding uses logical properties (`padding-block`, `padding-inline`). Axis modifiers are declared after the all-sides modifier so they win.

### Lit
`<ds-box inset="md" surface="subtle" radius="md">`. The host is the box; `:host` carries the padding, background, border and radius from reflected attributes (`:host([inset="md"])`). Children are slotted. `element` maps to a role on the host through `ElementInternals` for the sectioning values and is otherwise inert.

### React Native
`View` with `paddingVertical`/`paddingHorizontal` from `layout.inset.*`, `backgroundColor` from `color.background.*` (undefined for `none`), `borderWidth`/`borderColor` when `border`, `borderRadius` from `radius.*`. No `element`.

## Related

Stack, Card, Container, Landmark.
