# Generate: Container as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Container.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Container.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: ContainerVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Container.test.ts`.

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
        between regions. A string given as `children` in an example is an illustrative
        label, not content to build: stories render it inside a Text with its defaults
        (element `p` on web and Lit) on every platform (native requires one) and do
        not construct the Stack it names; that wrapper is the one sanctioned difference
        from the literal `given`. The Default story''s children is the string "Container
        content." in the same Text.'
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
        picks up an asymmetric margin. That margin is deliberately not a style binding:
        it is structural, it takes only two values, and there is nothing in it for
        a theme to tune, so it has no hook and is not overridable — unlike maxWidth
        and paddingInline. The selector is written at every `width`, `full` included,
        where it is simply inert (there is no cap for the column to sit inside), so
        the markup does not change shape with the width. React Native has no margin
        here: `center` maps to `alignSelf: center` and `start` to `alignSelf: flex-start`.'
    element:
      type: enum
      values:
      - div
      - main
      - section
      default: div
      description: Use `main` for the page's main column when no Landmark wraps it.
        A page has exactly one `main`; that is the author's responsibility, since
        the component cannot see the rest of the page, so it neither enforces it nor
        warns. `a11y.role` is `none` because that is what the default `div` exposes;
        the landmark contract lives here and in the main-element scenario, and applies
        to this one value. On Lit `section` is indistinguishable from `div` — a custom
        element cannot retag its host and a section is a region only when it is named
        — so the value exists there for API parity and changes nothing observable.
      platforms:
      - web
      - lit
  styles:
    maxWidth:
      token: layout.maxWidth.{width}
      description: '`full` renders no max-width — the literal `none`, with no hook,
        which also makes an override of this binding a no-op at that value; the binding
        covers the other three. No dev warning fires for an override that has no effect.'
      locked: false
    paddingInline:
      token: layout.gutter.{gutter}
      description: '`none` renders no padding (a literal 0, with no hook), which also
        makes an override of this binding a no-op at that value, with no dev warning.
        `narrow`, `wide` and `none` are fixed at every viewport: their selectors carry
        the attribute or modifier class, so they outrank the bare responsive rules
        inside both media queries and no viewport can move them. Only `default` is
        responsive: `layout.gutter.narrow` below layout.maxWidth.content, `layout.gutter.default`
        (the `--layout-gutter` variable) from layout.maxWidth.content, and `layout.gutter.wide`
        from layout.maxWidth.page. Both boundaries are inclusive (`>=`, a min-width
        query), so a viewport exactly at a token width takes the wider gutter. An
        override of this binding replaces the value at every viewport width, including
        the whole responsive `default` gutter, not just its middle band.'
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
        time — the one place a resolved number appears, marked literal-ok). The breakpoint
        px come from the default theme, calm-precise (960 / 1280); the CSS is one
        theme-independent file, so under a theme with other maxWidth values the cap
        follows the theme (it is a custom property) but the gutter switches at calm-precise
        widths — a known limit, and an accepted one: one stylesheet for every theme
        is worth more than exact breakpoints, so the generator emits no per-theme
        CSS and no container-query substitute until a brand asks for it. The block
        `element: div` is the default; the root renders whichever tag the `element`
        prop chooses. The root is the `column` part and carries `data-part="column"`,
        as Box''s root carries `surface`. `...rest` is spread before `data-ds` and
        `data-part`, so a consumer cannot clobber the testability hooks; Container,
        unlike Box, is never composed by another component that would need to rename
        its part.'
    lit:
      tag: ds-container
      reflect:
      - width
      - gutter
      - align
      notes: 'The host is the column (`:host { display: block }`) with a default slot.
        Same media-query note as web. A custom element cannot retag its host, so `element`
        sets a role for `main` only; `div` and `section` set none, since a section
        is a region only when it is named. That role is a plain `role` attribute on
        the host, as Box writes it — not ElementInternals, which the accessible-role
        tests cannot read — so Lit runs the main-landmark scenario alongside web.
        The host carries `data-part="column"`. `element` is an attribute-settable
        property that does not reflect: it changes no styling. Before the first update,
        when the width and gutter attributes are not yet reflected, the plain `:host`
        rules are the prop defaults (the content max-width and the responsive default
        gutter). `children` is required, but an empty default slot renders a valid
        empty column and no development warning fires: an empty page column is a legitimate
        intermediate state, unlike an empty required field.'
    rn:
      element: View
      props: []
      notes: 'View with maxWidth, alignSelf (center → center, start → flex-start),
        width 100%, paddingHorizontal. `element` is web and Lit only and is absent
        from the native props entirely, as in Box. The responsive gutter uses useWindowDimensions
        against the active theme''s maxWidth tokens, with the same inclusive `>=`
        boundaries as web. The component forwards a ref to its root View, typed as
        Box types its ref. The root is the `column` part and keeps `testID="Container"`
        with no separate part testID, as Box does for `surface`. On phones the cap
        rarely applies; on tablets and react-native-web it does. The gutter reads
        the window width, never the parent''s, so a nested `gutter: default` Container
        picks its gutter by the window here while SwiftUI measures its own width —
        one more reason a nested Container uses `gutter: none`. Container belongs
        in a column-direction parent (a screen, a vertical Stack); inside a row parent
        `width: 100%` and alignSelf cross axes and that placement is not supported
        — silently, with no development warning, since a View cannot see its parent''s
        flexDirection. Only the four style props named here are set: no flexShrink
        or flexGrow, so a sibling in a flex row can still shrink the column, which
        is the same unsupported placement said another way.'
    swiftui:
      element: VStack
      props:
      - .frame=maxWidth
      - .padding=horizontal
      - .frame=maxWidth-infinity
      - GeometryReader
      notes: 'Centers content at `layout.maxWidth.{width}` with horizontal gutters
        from the inset token: `.frame(maxWidth:)` inside `.frame(maxWidth: .infinity)`.
        The `default` gutter follows the same rule as web: narrow below the content
        width, default from it, wide from the page width (a `GeometryReader` on the
        container''s own width, never `UIScreen`). Safe-area insets are respected
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
      - lit
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

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

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

## Platform notes (lit)

```yaml
tag: ds-container
reflect:
- width
- gutter
- align
notes: "The host is the column (`:host { display: block }`) with a default slot. Same\
  \ media-query note as web. A custom element cannot retag its host, so `element`\
  \ sets a role for `main` only; `div` and `section` set none, since a section is\
  \ a region only when it is named. That role is a plain `role` attribute on the host,\
  \ as Box writes it \u2014 not ElementInternals, which the accessible-role tests\
  \ cannot read \u2014 so Lit runs the main-landmark scenario alongside web. The host\
  \ carries `data-part=\"column\"`. `element` is an attribute-settable property that\
  \ does not reflect: it changes no styling. Before the first update, when the width\
  \ and gutter attributes are not yet reflected, the plain `:host` rules are the prop\
  \ defaults (the content max-width and the responsive default gutter). `children`\
  \ is required, but an empty default slot renders a valid empty column and no development\
  \ warning fires: an empty page column is a legitimate intermediate state, unlike\
  \ an empty required field."
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

Content reflows to a single column at 320px wide without horizontal scrolling because the Container never sets a minimum width and the gutter shrinks on narrow viewports (WCAG 1.4.10). Prose measure keeps lines to about 65 characters, which helps readers with dyslexia and low vision (1.4.8, AAA advisory). Container adds no semantics unless `element: main` is chosen, in which case it is the page's main landmark and there must be exactly one.

## Platform notes

### Web
`display: block; max-inline-size: var(--layout-max-width-{width}); margin-inline: auto; padding-inline: var(--layout-gutter-narrow)`, then `@media (min-width: <content px>) { padding-inline: var(--layout-gutter) }` and `@media (min-width: <page px>) { padding-inline: var(--layout-gutter-wide) }`. The two breakpoint numbers are read from the default theme's (calm-precise) built token JSON at generation time and marked `literal-ok: breakpoint from layout.maxWidth.*`; custom properties cannot be used in media queries.

### Lit
`<ds-container width="content">`; the host is the column with the same rules on `:host`. Same breakpoint note.

### React Native
`View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.*` (undefined for `full`), `alignSelf` from `align`, and `paddingHorizontal` chosen by comparing `useWindowDimensions().width` with the content and page tokens.

## Related

Stack, Box, Card, Landmark.
