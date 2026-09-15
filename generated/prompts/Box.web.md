# Generate: Box for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Box.tsx` exporting a typed React function component named `Box`, plus `Box.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Box({ ref, …rest }: BoxProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Box> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Box.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

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
      description: Vertical padding, overriding `inset` on that axis. Defaults to
        `inset`.
    insetInline:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      description: Horizontal padding, overriding `inset` on that axis. Defaults to
        `inset`.
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
        region; prefer Landmark for page regions.
      platforms:
      - web
      - lit
  styles:
    paddingBlock:
      token: layout.inset.{inset}
      locked: false
    paddingInline:
      token: layout.inset.{inset}
      locked: false
    background:
      token: color.background.{surface}
      description: '`none` renders transparent; the token binding covers the other
        three values.'
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.{radius}
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
        ever.'
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
        so children stay in the light DOM. `element` swaps nothing in the shadow root
        — the host is the element, so `element` is accepted for API parity and sets
        `role` via ElementInternals only for sectioning values (article, aside, header,
        footer, main, nav map to their implicit roles; div and section set none).'
    rn:
      element: View
      props: []
      notes: View with paddingVertical/paddingHorizontal, backgroundColor, borderWidth/borderColor,
        borderRadius from the token object. `element` does not apply.
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

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

## Platform notes (web)

```yaml
element: div
attributes: []
notes: 'A plain element with classes for each enum value; `surface: none` sets no
  background. insetBlock/insetInline modifiers win over inset. No margin, ever.'
```

## Guidance

## Overview

Box is the thing you reach for when a group of content needs a surface: padding around it, a background under it, a border, rounded corners. It has no opinions about what is inside and no spacing between its children — that is Stack's job — so the two compose without overlap: a Box for the inset, a Stack for the gaps.

## When to use

Use a Box to give a region of a layout a background or padding: a sidebar panel, a highlighted row, a footer band, the inside of a modal. Use it when a Card is too much (a Card is a Box with conventions about elevation and content). Choose `inset` by role — `sm` for dense rows, `md` for most panels, `lg` for page-level containers, `xl` for hero bands — and let the theme's rhythm decide the numbers.

## When not to use

Do not use a Box to add space between two components; put them in a Stack. Do not use it as a page container; Container owns gutters and measure. Do not nest surfaces more than two deep (`subtle` on `default`, `strong` on `subtle`) — a third level reads as clutter and the contrast math is only checked two deep. Do not use `surface` to signal status; that is Alert's tinted background.

## Behavior

Box renders its children in a block with the requested padding, background, border and radius, and nothing else. It adds no role of its own (`a11y.role: none`); when `element` is `section`, `article`, `aside` or `nav`, the native element carries that semantics on web, and Lit sets the matching ElementInternals role. It never scrolls, never clips (`radius` does not imply `overflow: hidden`; a child that should be clipped clips itself), and never carries margin. `insetBlock` and `insetInline` override `inset` per axis. `surface: none` sets no background at all, so the parent's shows through.

## Content guidelines

None; Box has no text of its own.

## Accessibility

Box is invisible to assistive technology unless `element` gives it a sectioning role, in which case Landmark is usually the right component instead. Text on a `subtle` or `strong` surface must remain readable: the build checks body, muted and link foreground against both surfaces in both modes (WCAG 1.4.3), which is what makes "two levels deep" a safe rule rather than a hope. A border, when present, is decorative; nothing relies on it to identify content (1.4.11 does not apply).

## Platform notes

### Web
Render the `element` with classes `ds-box`, `ds-box--inset-{value}`, `ds-box--inset-block-{value}`, `ds-box--inset-inline-{value}`, `ds-box--surface-{value}`, `ds-box--border`, `ds-box--radius-{value}`. Padding uses logical properties (`padding-block`, `padding-inline`). Axis modifiers are declared after the all-sides modifier so they win.

### Lit
`<ds-box inset="md" surface="subtle" radius="md">`. The host is the box; `:host` carries the padding, background, border and radius from reflected attributes (`:host([inset="md"])`). Children are slotted. `element` maps to a role on the host through `ElementInternals` for the sectioning values and is otherwise inert.

### React Native
`View` with `paddingVertical`/`paddingHorizontal` from `layout.inset.*`, `backgroundColor` from `color.background.*` (undefined for `none`), `borderWidth`/`borderColor` when `border`, `borderRadius` from `radius.*`. No `element`.

## Related

Stack, Card, Container, Landmark.
