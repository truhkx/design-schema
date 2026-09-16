# Generate: Landmark for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Landmark.tsx` exporting a typed React function component named `Landmark`, plus `Landmark.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Landmark({ ref, …rest }: LandmarkProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Landmark> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Landmark.test.tsx`.
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
  name: Landmark
  category: layout
  status: review
  apg: landmarks
  anatomy:
  - region
  props:
    role:
      type: enum
      values:
      - banner
      - navigation
      - main
      - complementary
      - contentinfo
      - region
      - search
      - form
      required: true
      description: Which landmark this is. `banner` (site header), `navigation`, `main`
        (exactly one per page), `complementary` (sidebar), `contentinfo` (site footer),
        `region` (a labelled section that deserves a jump point), `search`, `form`
        (a labelled form that is a page-level region).
    label:
      type: string
      description: 'Accessible name. Required for `region` and `form`, and whenever
        the page has more than one landmark of the same role (two navigations: "Main"
        and "Footer"). Not shown visually.'
      a11y: Rendered as aria-label; the name is read together with the role ("Main
        navigation, landmark").
    children:
      type: content
      required: true
      description: The region's content.
    as:
      type: enum
      values:
      - header
      - nav
      - main
      - aside
      - footer
      - section
      - form
      - div
      description: Web element override. By default the element is chosen from `role`
        (see platform notes); set this only when the native element would be wrong,
        e.g. a `banner` that is not the page header. Web only — the Lit host is its
        own element.
      platforms:
      - web
  styles: {}
  a11y:
    roleFrom: role
    requires:
    - landmark-role
    - accessible-name
  platforms:
    web:
      element: header | nav | main | aside | footer | section | form
      attributes:
      - role
      - aria-label
      notes: 'Native elements carry the roles: banner→header, navigation→nav, main→main,
        complementary→aside, contentinfo→footer, region→section (only a landmark when
        labelled), search→form role=search (always, for SSR safety, until <search>
        is in the React typings), form→form. The explicit role attribute is always
        emitted on header and footer (they lose the landmark role inside sectioning
        content, and ancestry is unknown at render time) and whenever `as` overrides
        the element.'
    lit:
      tag: ds-landmark
      reflect:
      - role
      notes: 'No shadow DOM and no wrapper element: the host itself takes role and
        aria-label via ElementInternals so it is the landmark in the light DOM tree,
        and children are ordinary light-DOM children. The property is named `landmark`
        (attribute `role`) because `role` already exists on HTMLElement. With no shadow
        root there is no static styles; set `display: block` inline in connectedCallback
        when the host has no display set. Do not also render a native <nav> inside
        — a nested landmark of the same role is a duplicate.'
    rn:
      element: View
      props:
      - role
      - accessibilityLabel
      notes: 'Native platforms have no landmark navigation (VoiceOver and TalkBack
        have no landmark rotor), so Landmark is structure for react-native-web and
        a labelled View on iOS and Android. Pass `role` (RN ≥ 0.73) so react-native-web
        renders the semantic element; on native it maps to the nearest accessibilityRole
        or none. Exception: RN''s `Role` union has no `search` landmark (only the
        `searchbox` widget), so `search` is passed as the legacy accessibilityRole="search",
        which react-native-web maps to the ARIA search landmark; iOS and Android have
        no equivalent, so it is web-parity only. The label is applied as accessibilityLabel
        only for `region`, `form`, and `navigation`, so screen readers get a group
        name without every View announcing a role.'
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - .accessibilityAddTraits
      - accessibilityRotor
      notes: 'iOS has no landmark roles. The Landmark renders `.accessibilityElement(children:
        .contain)` with the `label` as its accessibility label so VoiceOver announces
        the region boundary when entering it, and registers an `.accessibilityRotorEntry`
        under a package-wide ''Landmarks'' rotor (`Support/LandmarkRotor.swift`) so
        users can jump between regions as they do on web. `role: main` adds `.accessibilityAddTraits(.isSummaryElement)`
        only when the doc asks. The element name (`nav`, `aside`) has no equivalent;
        `role` drives everything.'
  behavior:
  - name: the-role-prop-chooses-the-landmark
    description: navigation renders the navigation landmark.
    given:
      role: navigation
    then:
    - role: navigation
    platforms:
    - web
  - name: main-is-the-primary-content-landmark
    description: Exactly one main per page; the element carries the role.
    given:
      role: main
    then:
    - role: main
    platforms:
    - web
  - name: a-region-is-named-by-its-label
    description: A region is a landmark only when it is named; the label is rendered
      as aria-label.
    given:
      role: region
      label: Related articles
    then:
    - role: region
    - attribute: aria-label
      is: Related articles
    platforms:
    - web
  - name: an-overridden-element-still-carries-its-role
    description: The explicit role attribute is emitted whenever `as` overrides the
      default element.
    given:
      role: banner
      as: div
    then:
    - attribute: role
      is: banner
    - role: banner
    platforms:
    - web
  examples:
  - name: page-main
    description: The single main landmark every page needs.
    given:
      role: main
      children: The page content.
  - name: footer-navigation
    description: A second navigation, named so it is distinguishable from the primary
      one.
    given:
      role: navigation
      label: Footer
      children: Footer links.
  - name: related-articles-region
    description: A labelled section that deserves a jump point of its own.
    given:
      role: region
      label: Related articles
      children: A list of related articles.
  - name: banner-that-is-not-the-page-header
    description: A banner that is not the page header, where the native header element
      would be wrong.
    given:
      role: banner
      as: div
      children: The product banner.
    platforms:
    - web
```

## Constants and examples

- example `page-main`, story `PageMain`: given `role: "main"`, `children: "The page content."`; The single main landmark every page needs.
- example `footer-navigation`, story `FooterNavigation`: given `role: "navigation"`, `label: "Footer"`, `children: "Footer links."`; A second navigation, named so it is distinguishable from the primary one.
- example `related-articles-region`, story `RelatedArticlesRegion`: given `role: "region"`, `label: "Related articles"`, `children: "A list of related articles."`; A labelled section that deserves a jump point of its own.
- example `banner-that-is-not-the-page-header`, story `BannerThatIsNotThePageHeader`: given `role: "banner"`, `as: "div"`, `children: "The product banner."`; A banner that is not the page header, where the native header element would be wrong.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: none
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (22)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-role-prop-chooses-the-landmark
  description: navigation renders the navigation landmark.
  given:
    role: navigation
  then:
  - role: navigation
  platforms:
  - web
- name: main-is-the-primary-content-landmark
  description: Exactly one main per page; the element carries the role.
  given:
    role: main
  then:
  - role: main
  platforms:
  - web
- name: a-region-is-named-by-its-label
  description: A region is a landmark only when it is named; the label is rendered
    as aria-label.
  given:
    role: region
    label: Related articles
  then:
  - role: region
  - attribute: aria-label
    is: Related articles
  platforms:
  - web
- name: an-overridden-element-still-carries-its-role
  description: The explicit role attribute is emitted whenever `as` overrides the
    default element.
  given:
    role: banner
    as: div
  then:
  - attribute: role
    is: banner
  - role: banner
  platforms:
  - web
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-role-banner
  given:
    role: banner
  then:
  - renders: true
  derived: true
- name: renders-role-navigation
  given:
    role: navigation
  then:
  - renders: true
  derived: true
- name: renders-role-main
  given:
    role: main
  then:
  - renders: true
  derived: true
- name: renders-role-complementary
  given:
    role: complementary
  then:
  - renders: true
  derived: true
- name: renders-role-contentinfo
  given:
    role: contentinfo
  then:
  - renders: true
  derived: true
- name: renders-role-region
  given:
    role: region
  then:
  - renders: true
  derived: true
- name: renders-role-search
  given:
    role: search
  then:
  - renders: true
  derived: true
- name: renders-role-form
  given:
    role: form
  then:
  - renders: true
  derived: true
- name: renders-as-header
  given:
    as: header
  then:
  - renders: true
  platforms:
  - web
  derived: true
- name: renders-as-nav
  given:
    as: nav
  then:
  - renders: true
  platforms:
  - web
  derived: true
- name: renders-as-main
  given:
    as: main
  then:
  - renders: true
  platforms:
  - web
  derived: true
- name: renders-as-aside
  given:
    as: aside
  then:
  - renders: true
  platforms:
  - web
  derived: true
- name: renders-as-footer
  given:
    as: footer
  then:
  - renders: true
  platforms:
  - web
  derived: true
- name: renders-as-section
  given:
    as: section
  then:
  - renders: true
  platforms:
  - web
  derived: true
- name: renders-as-form
  given:
    as: form
  then:
  - renders: true
  platforms:
  - web
  derived: true
- name: renders-as-div
  given:
    as: div
  then:
  - renders: true
  platforms:
  - web
  derived: true
- name: has-accessible-name
  given:
    label: Accessible name
  then:
  - name: true
  derived: true
```

## Platform notes (web)

```yaml
element: header | nav | main | aside | footer | section | form
attributes:
- role
- aria-label
notes: "Native elements carry the roles: banner\u2192header, navigation\u2192nav,\
  \ main\u2192main, complementary\u2192aside, contentinfo\u2192footer, region\u2192\
  section (only a landmark when labelled), search\u2192form role=search (always, for\
  \ SSR safety, until <search> is in the React typings), form\u2192form. The explicit\
  \ role attribute is always emitted on header and footer (they lose the landmark\
  \ role inside sectioning content, and ancestry is unknown at render time) and whenever\
  \ `as` overrides the element."
```

## Guidance

## Overview

Landmarks are the page's table of contents for assistive technology. A screen-reader user arriving on a page presses one key to jump to the main content, another to list the navigations, another for the search. Without landmarks they read from the top. This component exists so that every page in the system gets the same, correct set of them without anyone remembering which element implies which role.

## When to use

Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for the primary content, `navigation` for each navigation block (labelled when there is more than one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site footer, `search` around the site search form, and `region` for any other section a user might want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly one `main`.

## When not to use

Do not wrap everything: a page with twenty landmarks is as hard to navigate as one with none. Layout containers, cards, list items and form groups are not landmarks; use Stack, Fieldset (planned), or nothing. Do not use `region` without a `label` — an unlabelled region is not exposed as a landmark and the component will warn. Do not use Landmark to style a region; it has no visual bindings by design.

## Behavior

Landmark renders its children inside the appropriate element with the appropriate role and name, and nothing else: no padding, background, or layout. It is transparent to layout on every platform (`display: contents` is *not* used, because it removes the element's semantics in some browsers; instead the element is a plain block and consumers lay it out like any block). In development, the component warns when `main` appears more than once in a document, when `region` or `form` has no `label`, and when two `navigation`, `complementary`, `region` or `form` landmarks in the same root share a label or both lack one (`banner`, `main` and `contentinfo` never take labels). On native there is no document to scan, so only the missing-label warning applies.

## Content guidelines

Labels name the region in one or two words and do not repeat the role: "Main" and "Footer" for two navigations (read as "Main navigation"), not "Main navigation menu". Labels are sentence case and never punctuated. Where the region already starts with a visible heading, the label should match the heading text.

## Accessibility

Landmark regions let users bypass blocks and understand page structure (WCAG 1.3.1, 2.4.1). Each region has a role from the ARIA landmark set, and a name when the role appears more than once or when the role is `region` or `form`, which are landmarks only when named (4.1.2). Exactly one `main` per document. Native HTML elements are used wherever they imply the role, so no ARIA is added where the element already provides it, in line with the first rule of ARIA. Nested landmarks are allowed only where the APG allows them: a `navigation` inside `banner` is fine; a `main` inside anything is not.

## Platform notes

### Web
Choose the element from `role` unless `as` is set: `banner`→`<header role="banner">`, `navigation`→`<nav>`, `main`→`<main>`, `complementary`→`<aside>`, `contentinfo`→`<footer role="contentinfo">`, `region`→`<section aria-label>`, `search`→`<form role="search">`, `form`→`<form aria-label>`. Always emit `role` on `header` and `footer` and whenever `as` overrides the default element; never branch on `document` at render time (SSR). Apply `aria-label` from `label`. The forwarded ref is typed `HTMLElement` (not the specific element chosen by `as`), so render through `createElement` with `HTMLAttributes<HTMLElement>` rather than a union of intrinsic tags. Development warnings use `process.env.NODE_ENV !== 'production'`.

### Lit
`<ds-landmark role="navigation" label="Main">` uses no shadow root. The property is `landmark` (attribute `role`). In `connectedCallback`, set `display: block` inline when unset, so the host element itself is the landmark and its light-DOM children are its content. The role and the name are plain reflected attributes on the host — `role` and `aria-label` — not `ElementInternals.role` / `.ariaLabel`, which the accessible-name tooling does not read; `label` therefore reflects to the `aria-label` attribute, and a story sets it as a property or writes `aria-label` directly. With no shadow root there is nothing to carry a `part`, so `data-ds="Landmark"` on the host is the only hook for the `region` part. Warnings are logged in development builds only (`import.meta.env.DEV`; the package tsconfig includes `vite/client` types).

### React Native
Render a `View` with the `role` prop (which react-native-web turns into the semantic element and iOS/Android map to the nearest accessibility role or ignore), and `accessibilityLabel={label}` for `navigation`, `region` and `form` so the group has a name for TalkBack and VoiceOver. Do not set `accessible={true}` on the container; it would collapse every child into one element. There is no jump-to-landmark on native — the value here is web parity and a consistent structure for the same screen code.

## Related

Stack, Heading, Breadcrumb, SkipLink (planned).
