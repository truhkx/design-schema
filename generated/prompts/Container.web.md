# Generate: Container for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Container.tsx` exporting a typed React function component named `Container`, plus `Container.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Container({ ref, …rest }: ContainerProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Container> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Container.test.tsx`.
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
  name: Container
  category: layout
  status: review
  anatomy:
  - column
  props:
    children:
      type: content
      required: true
      description: 'The page or region content, usually a Stack with `gap: section`
        between regions.'
    width:
      type: enum
      values:
      - prose
      - content
      - page
      - full
      default: content
      description: '`prose` for reading (a 65-character measure), `content` for most
        screens, `page` for full-bleed layouts with wide grids, `full` for no cap
        (gutters only).'
    gutter:
      type: enum
      values:
      - narrow
      - default
      - wide
      - none
      default: default
      description: 'Horizontal padding at the viewport edge. Responsive: `default`
        uses the narrow gutter under the content width and the wide gutter above the
        page width. `none` for a nested container inside a padded parent.'
    align:
      type: enum
      values:
      - center
      - start
      default: center
      description: 'Where the capped column sits in a wider viewport. `start` sets
        `margin-inline: 0` on both sides, not just the start side, so the column never
        picks up an asymmetric margin.'
    element:
      type: enum
      values:
      - div
      - main
      - section
      default: div
      description: Use `main` for the page's main column when no Landmark wraps it.
      platforms:
      - web
      - lit
  styles:
    maxWidth:
      token: layout.maxWidth.{width}
      description: '`full` renders no max-width — the literal `none`, with no hook,
        which also makes an override of this binding a no-op at that value; the binding
        covers the other three.'
      locked: false
    paddingInline:
      token: layout.gutter.{gutter}
      description: '`none` renders no padding (a literal 0, with no hook). `narrow`
        and `wide` are fixed at every viewport. Only `default` is responsive: narrow
        below layout.maxWidth.content, default between, wide above layout.maxWidth.page.'
      locked: false
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: 'Block element with max-width, margin-inline auto (or 0 for align start)
        and padding-inline from tokens; the responsive gutter uses two media queries
        keyed to the maxWidth tokens (min-width: var() is not valid in media queries,
        so the generator reads the resolved px values from the token file at build
        time — the one place a resolved number appears, marked literal-ok).'
    lit:
      tag: ds-container
      reflect:
      - width
      - gutter
      - align
      notes: 'The host is the column (`:host { display: block }`) with a default slot.
        Same media-query note as web. A custom element cannot retag its host, so `element`
        sets an ElementInternals role for `main` only; `div` and `section` set none,
        since a section is a region only when it is named.'
    rn:
      element: View
      props: []
      notes: View with maxWidth, alignSelf (center → center, start → flex-start),
        width 100%, paddingHorizontal. `element` is web and Lit only and is absent
        from the native props entirely, as in Box. The responsive gutter uses useWindowDimensions
        against the maxWidth tokens. On phones the cap rarely applies; on tablets
        and react-native-web it does.
    swiftui:
      element: VStack
      props:
      - .frame=maxWidth
      - .padding=horizontal
      - .frame=maxWidth-infinity
      - GeometryReader
      notes: 'Centers content at `layout.maxWidth.{width}` with horizontal gutters
        from the inset token: `.frame(maxWidth:)` inside `.frame(maxWidth: .infinity)`.
        Gutters shrink to the compact token below the prose width (a `GeometryReader`
        on the container''s own width, never `UIScreen`). Safe-area insets are respected
        by default (`ignoresSafeArea` is never applied by a component).'
  behavior:
  - name: main-element-is-the-page-landmark
    description: 'Container adds no semantics unless element: main is chosen, in which
      case it is the page''s main landmark and there must be exactly one.'
    given:
      element: main
    then:
    - role: main
      platforms:
      - web
  examples:
  - name: application-screen
    description: The default page column for application screens, centered at the
      content measure.
    given:
      children: A Stack of page regions
      width: content
  - name: reading-measure
    description: An article capped at the prose measure, about 65 characters a line.
    given:
      children: An article
      width: prose
  - name: nested-section
    description: A narrower measure inside an already padded parent, so the gutters
      are not applied twice.
    given:
      children: A narrower section
      width: prose
      gutter: none
```

## Constants and examples

- example `application-screen`, story `ApplicationScreen`: given `children: "A Stack of page regions"`, `width: "content"`; The default page column for application screens, centered at the content measure.
- example `reading-measure`, story `ReadingMeasure`: given `children: "An article"`, `width: "prose"`; An article capped at the prose measure, about 65 characters a line.
- example `nested-section`, story `NestedSection`: given `children: "A narrower section"`, `width: "prose"`, `gutter: "none"`; A narrower measure inside an already padded parent, so the gutters are not applied twice.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `maxWidth`, `paddingInline`
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (15)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: main-element-is-the-page-landmark
  description: 'Container adds no semantics unless element: main is chosen, in which
    case it is the page''s main landmark and there must be exactly one.'
  given:
    element: main
  then:
  - role: main
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-width-prose
  given:
    width: prose
  then:
  - renders: true
  derived: true
- name: renders-width-content
  given:
    width: content
  then:
  - renders: true
  derived: true
- name: renders-width-page
  given:
    width: page
  then:
  - renders: true
  derived: true
- name: renders-width-full
  given:
    width: full
  then:
  - renders: true
  derived: true
- name: renders-gutter-narrow
  given:
    gutter: narrow
  then:
  - renders: true
  derived: true
- name: renders-gutter-default
  given:
    gutter: default
  then:
  - renders: true
  derived: true
- name: renders-gutter-wide
  given:
    gutter: wide
  then:
  - renders: true
  derived: true
- name: renders-gutter-none
  given:
    gutter: none
  then:
  - renders: true
  derived: true
- name: renders-align-center
  given:
    align: center
  then:
  - renders: true
  derived: true
- name: renders-align-start
  given:
    align: start
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
- name: renders-element-main
  given:
    element: main
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
```

## Platform notes (web)

```yaml
element: div
attributes: []
notes: "Block element with max-width, margin-inline auto (or 0 for align start) and\
  \ padding-inline from tokens; the responsive gutter uses two media queries keyed\
  \ to the maxWidth tokens (min-width: var() is not valid in media queries, so the\
  \ generator reads the resolved px values from the token file at build time \u2014\
  \ the one place a resolved number appears, marked literal-ok)."
```

## Guidance

## Overview

Container is where a screen's horizontal rhythm is decided once. It puts the gutter at the viewport edge and caps how wide content can get, so a form on a phone, a dashboard on a laptop and an article on a wide monitor all sit on the same measure — and no component ever needs to know how wide the page is.

## When to use

Wrap every page's content in one Container, inside the `main` Landmark, with `width: content` for application screens and `width: prose` for reading. Use `page` for layouts with wide data grids or side-by-side panels, and `full` only for edge-to-edge sections (a hero, a map) that manage their own inner Container. Nest a `gutter: none` Container inside a padded parent when a section needs a narrower measure than the page.

## When not to use

Do not use Container for spacing between things (Stack) or for a surface (Box, Card). Do not put a Container inside a Card. Do not set widths on components to make them line up; make the Container narrower.

## Behavior

Container renders a block that is the full viewport width minus the gutter, centered (or start-aligned) once the viewport exceeds the cap. The `default` gutter is responsive: narrow below the content width, default between, wide above the page width, so the edge breathes more as the screen grows. Nothing else changes with the viewport; components inside reflow on their own.

## Content guidelines

None.

## Accessibility

Content reflows to a single column at 320px wide without horizontal scrolling because the Container never sets a minimum width and the gutter shrinks on narrow viewports (WCAG 1.4.10). Prose measure keeps lines under about 80 characters, which helps readers with dyslexia and low vision (1.4.8, AAA advisory). Container adds no semantics unless `element: main` is chosen, in which case it is the page's main landmark and there must be exactly one.

## Platform notes

### Web
`display: block; max-inline-size: var(--layout-max-width-{width}); margin-inline: auto; padding-inline: var(--layout-gutter-narrow)`, then `@media (min-width: <content px>) { padding-inline: var(--layout-gutter) }` and `@media (min-width: <page px>) { padding-inline: var(--layout-gutter-wide) }`. The two breakpoint numbers are read from the built token JSON at generation time and marked `literal-ok: breakpoint from layout.maxWidth.*`; custom properties cannot be used in media queries.

### Lit
`<ds-container width="content">`; the host is the column with the same rules on `:host`. Same breakpoint note.

### React Native
`View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.*` (undefined for `full`), `alignSelf` from `align`, and `paddingHorizontal` chosen by comparing `useWindowDimensions().width` with the content and page tokens.

## Related

Stack, Box, Card, Landmark.
