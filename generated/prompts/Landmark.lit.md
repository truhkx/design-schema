# Generate: Landmark as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Landmark.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Landmark.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: LandmarkVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Landmark.test.ts`.

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
        and "Footer"). Not shown visually. An empty string counts as absent (no aria-label,
        and missing for the warnings). `banner`, `main` and `contentinfo` never take
        a label: on web and Lit one passed to them is not rendered and a development
        warning says so. On React Native the label is applied only to `navigation`,
        `region` and `form`; on any other role it is silently not applied, with no
        warning. `search` and `complementary` do take a label on web and Lit, and
        a page with two of either needs one.'
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
        is in the React typings), form→form. The explicit role attribute is emitted
        on header and footer (they lose the landmark role inside sectioning content,
        and ancestry is unknown at render time), when `as` differs from the role''s
        default element, and when the element does not imply the role (form role=search);
        `as` equal to the default element adds nothing. `region` without a label renders
        a plain <section> with no role attribute, plus the missing-label warning;
        an unlabelled `region` with `as` set to another element follows the `as` rule
        (role="region" is emitted) and still warns. Landmark takes no className or
        style (the Link rule): a composite that needs its own classes, style or positioning
        (SidePanel) renders its own styled element and composes Landmark inside it,
        passing only `role`, `as`, `label` or `aria-labelledby`. A composite''s `aria-labelledby`
        is forwarded to the element and the text it references counts as the label
        for the warnings, except on `banner`, `main` and `contentinfo`, where it is
        dropped like `label`, with the does-not-take-a-label warning; an empty-string
        `aria-labelledby` counts as absent, exactly as an empty `label` does, and
        neither names nor warns. The root carries `data-part="region"` like any other
        part. The props type omits `role`, `children`, `aria-label`, `className` and
        `style`; everything else in HTMLAttributes is forwarded, so a composite can
        still pass `id`, `aria-labelledby`, data attributes and handlers. `role` is
        required and typed, so the no-role warning has no path on web: it exists for
        a Lit host whose attribute is absent.'
    lit:
      tag: ds-landmark
      reflect:
      - role
      notes: 'No shadow DOM and no wrapper element: the host itself carries plain
        reflected `role` and `aria-label` attributes (not ElementInternals, which
        the accessible-name tooling does not read) so it is the landmark in the light
        DOM tree. Children are ordinary light-DOM children: there is no <slot>, so
        the rule that each slot renders as <slot> does not apply, and the `region`
        part has no `part`/`data-part`; the host''s `data-ds="Landmark"` is its only
        hook. The property is named `landmark` and reflects to the `role` attribute
        (that is what `reflect: [role]` means) because `role` already exists on HTMLElement.
        `label` is a property whose attribute is `aria-label` (there is no `label`
        attribute), and its reflection is conditional: the element writes `aria-label`
        itself, omitting it for `banner`, `main` and `contentinfo` and for an empty
        string, and ignores its own write so the `label` property keeps its value.
        Lit has no `labelledBy` property: a composite sets an `aria-labelledby` attribute
        on the host, its ids resolved in `getRootNode()`. On `banner`, `main` and
        `contentinfo` the element removes that attribute — Lit drops it rather than
        only warning, so the three roles are unnamed on every platform alike — at
        mount and on a role or label change. Changes to the attribute itself are not
        observed and do not re-run the warnings or the drop. With no role (attribute
        absent) no role is exposed and a development warning fires. With no shadow
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
        name without every View announcing a role. A View cannot hold a raw string,
        so Landmark wraps string and number children in the package Text itself, each
        one individually (React.Children.map) when strings and numbers are mixed with
        elements in an array. With no document to scan, only the missing-label warning
        applies (a label on `banner`, `main`, `contentinfo`, `complementary` or `search`
        is dropped without a warning). Native has no landmark query, so RN tests check
        the `role` (or, for `search`, `accessibilityRole`) and `accessibilityLabel`
        props on the View instead of a role lookup. The `region` part has no testID
        of its own: the root View is that part and keeps `testID="Landmark"`, as the
        Lit host keeps `data-ds` alone. Strings and numbers are wrapped at the top
        level only — that is the contract, not a shortcut — so a raw string nested
        inside a Fragment or an inner array is the caller''s to wrap. There is deliberately
        no module-level registry of mounted Landmarks, so the duplicate-main and duplicate-label
        checks do not run on native: a registry would outlive unmounted screens and
        report duplicates that are not on screen together. Nested-landmark nesting
        rules are guidance only and are checked on no platform.'
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
      - lit
    - attribute: role
      is: navigation
      platforms:
      - rn
    platforms:
    - web
    - lit
    - rn
  - name: search-is-the-search-landmark
    description: search renders the search landmark; React Native has no search Role,
      so it goes through the legacy accessibilityRole.
    given:
      role: search
    then:
    - role: search
      platforms:
      - web
      - lit
    - attribute: accessibilityRole
      is: search
      platforms:
      - rn
    platforms:
    - web
    - lit
    - rn
  - name: main-is-the-primary-content-landmark
    description: Exactly one main per page; the element carries the role.
    given:
      role: main
      label: ''
    then:
    - role: main
    platforms:
    - web
    - lit
  - name: a-label-is-dropped-on-a-role-that-refuses-one
    description: 'banner, main and contentinfo are named by the page, not by the author:
      a label passed to them is not rendered on any platform.'
    given:
      role: banner
      label: Site header
    then:
    - attribute: aria-label
      is: null
      platforms:
      - web
      - lit
    - attribute: accessibilityLabel
      is: null
      platforms:
      - rn
  - name: a-region-is-named-by-its-label
    description: A region is a landmark only when it is named; the label is rendered
      as aria-label (accessibilityLabel on React Native).
    given:
      role: region
      label: Related articles
    then:
    - role: region
      platforms:
      - web
      - lit
    - attribute: aria-label
      is: Related articles
      platforms:
      - web
      - lit
    - attribute: accessibilityLabel
      is: Related articles
      platforms:
      - rn
    platforms:
    - web
    - lit
    - rn
  - name: an-overridden-element-still-carries-its-role
    description: The explicit role attribute is emitted whenever `as` overrides the
      default element.
    given:
      role: banner
      as: div
      label: ''
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

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: none
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (15)

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
  - lit
  - rn
- name: search-is-the-search-landmark
  description: search renders the search landmark; React Native has no search Role,
    so it goes through the legacy accessibilityRole.
  given:
    role: search
  then:
  - role: search
  platforms:
  - web
  - lit
  - rn
- name: main-is-the-primary-content-landmark
  description: Exactly one main per page; the element carries the role.
  given:
    role: main
    label: ''
  then:
  - role: main
  platforms:
  - web
  - lit
- name: a-label-is-dropped-on-a-role-that-refuses-one
  description: 'banner, main and contentinfo are named by the page, not by the author:
    a label passed to them is not rendered on any platform.'
  given:
    role: banner
    label: Site header
  then:
  - attribute: aria-label
    is: null
- name: a-region-is-named-by-its-label
  description: A region is a landmark only when it is named; the label is rendered
    as aria-label (accessibilityLabel on React Native).
  given:
    role: region
    label: Related articles
  then:
  - role: region
  - attribute: aria-label
    is: Related articles
  platforms:
  - web
  - lit
  - rn
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
- name: has-accessible-name
  given:
    label: Accessible name
  then:
  - name: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-landmark
reflect:
- role
notes: "No shadow DOM and no wrapper element: the host itself carries plain reflected\
  \ `role` and `aria-label` attributes (not ElementInternals, which the accessible-name\
  \ tooling does not read) so it is the landmark in the light DOM tree. Children are\
  \ ordinary light-DOM children: there is no <slot>, so the rule that each slot renders\
  \ as <slot> does not apply, and the `region` part has no `part`/`data-part`; the\
  \ host's `data-ds=\"Landmark\"` is its only hook. The property is named `landmark`\
  \ and reflects to the `role` attribute (that is what `reflect: [role]` means) because\
  \ `role` already exists on HTMLElement. `label` is a property whose attribute is\
  \ `aria-label` (there is no `label` attribute), and its reflection is conditional:\
  \ the element writes `aria-label` itself, omitting it for `banner`, `main` and `contentinfo`\
  \ and for an empty string, and ignores its own write so the `label` property keeps\
  \ its value. Lit has no `labelledBy` property: a composite sets an `aria-labelledby`\
  \ attribute on the host, its ids resolved in `getRootNode()`. On `banner`, `main`\
  \ and `contentinfo` the element removes that attribute \u2014 Lit drops it rather\
  \ than only warning, so the three roles are unnamed on every platform alike \u2014\
  \ at mount and on a role or label change. Changes to the attribute itself are not\
  \ observed and do not re-run the warnings or the drop. With no role (attribute absent)\
  \ no role is exposed and a development warning fires. With no shadow root there\
  \ is no static styles; set `display: block` inline in connectedCallback when the\
  \ host has no display set. Do not also render a native <nav> inside \u2014 a nested\
  \ landmark of the same role is a duplicate."
```

## Guidance

## Overview

Landmarks are the page's table of contents for assistive technology. A screen-reader user arriving on a page presses one key to jump to the main content, another to list the navigations, another for the search. Without landmarks they read from the top. This component exists so that every page in the system gets the same, correct set of them without anyone remembering which element implies which role.

## When to use

Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for the primary content, `navigation` for each navigation block (labelled when there is more than one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site footer, `search` around the site search form, and `region` for any other section a user might want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly one `main`.

## When not to use

Do not wrap everything: a page with twenty landmarks is as hard to navigate as one with none. Layout containers, cards, list items and form groups are not landmarks; use Stack, Fieldset (planned), or nothing. Do not use `region` without a `label` — an unlabelled region is not exposed as a landmark and the component will warn. Do not use Landmark to style a region; it has no visual bindings by design.

## Behavior

Landmark renders its children inside the appropriate element with the appropriate role and name, and nothing else: no padding, background, or layout. It is transparent to layout on every platform (`display: contents` is *not* used, because it removes the element's semantics in some browsers; instead the element is a plain block and consumers lay it out like any block). In development, the component warns when `main` appears more than once in a document (`Landmark: role "main" appears more than once in this document.`), when `region` or `form` has no `label` (`Landmark: role "<role>" is only a landmark when it has a label.`), and when two `navigation`, `complementary`, `region` or `form` landmarks in the same root share a label (`Landmark: two "<role>" landmarks share the label "<label>"; give each a distinct label.`) or both lack one (`Landmark: two "<role>" landmarks both lack a label; give each a distinct label.`). The naming sources that count are `label` (an empty string is absent) and an `aria-labelledby` a composite passes, read as the text it references. `banner`, `main` and `contentinfo` never take labels: a label passed to them — `label` or a composite's `aria-labelledby` — is not rendered, with the warning `Landmark: role "<role>" does not take a label; it was not rendered.` Warnings fire when the offending combination appears or changes (mount, or a change of role, label or element), not on every render; they are not guarded against repeating, so React StrictMode's double effect mount logs each one twice in development, which is accepted. For the duplicate checks the landmark scans its `getRootNode()` for `[data-ds="Landmark"]` — "document" in the duplicate-main wording is that root, which is the document for all but a landmark inside a shadow root — and only the later landmark in document order warns; native landmarks not rendered by Landmark are not counted. A peer's role is its `role` attribute or, when it has none, the implicit role of its tag (header→banner, nav→navigation, main→main, aside→complementary, footer→contentinfo, section→region, form→form), so web and Lit output are counted alike. With no role at all (a Lit host without the attribute) no role is exposed and the component warns: `Landmark: no role is set, so no landmark is exposed.` On native there is no document to scan, so only the missing-label warning applies.

The Default story is role `navigation` with label "Main" and the text "Primary links.", a role that takes a label, so the derived accessible-name and renders-as scenarios apply to it. Stories, examples and scenarios for any other role do not inherit Default's label: an example's story sets exactly its `given` with `label: undefined` unless the `given` names one, and the per-role stories and scenarios set `label: undefined` for `banner`, `main` and `contentinfo`, the three roles that refuse one, and a label for every other role: "Related articles" for `region`, "Sign in" for `form`, "Primary" for `navigation`, "Related links" for `complementary` and "Site search" for `search` — the last two do take a name and are in the shared-label duplicate check, so the story set must model one. The `As*` stories pair each element with the role it belongs to, never the Default story's `navigation` with every element: a story feeds the axe gate and documents correct use, and `<main role="navigation">` is neither. Example `children` strings are text content: stories render them inside the package Text at its defaults, with no size, weight or tone set (on React Native Landmark does this itself).

## Content guidelines

Labels name the region in one or two words and do not repeat the role: "Main" and "Footer" for two navigations (read as "Main navigation"), not "Main navigation menu". Labels are sentence case and never punctuated. Where the region already starts with a visible heading, the label should match the heading text.

## Accessibility

Landmark regions let users bypass blocks and understand page structure (WCAG 1.3.1, 2.4.1). Each region has a role from the ARIA landmark set, and a name when the role appears more than once or when the role is `region` or `form`, which are landmarks only when named (4.1.2). Exactly one `main` per document. Native HTML elements are used wherever they imply the role, so no ARIA is added where the element already provides it, in line with the first rule of ARIA. Nested landmarks are allowed only where the APG allows them: a `navigation` inside `banner` is fine; a `main` inside anything is not.

## Platform notes

### Web
Choose the element from `role` unless `as` is set: `banner`→`<header role="banner">`, `navigation`→`<nav>`, `main`→`<main>`, `complementary`→`<aside>`, `contentinfo`→`<footer role="contentinfo">`, `region`→`<section aria-label>`, `search`→`<form role="search">`, `form`→`<form aria-label>`. Always emit `role` on `header` and `footer`, when `as` differs from the role's default element, and when the element does not imply the role (`<form role="search">`); `as` equal to the default adds nothing, and an unlabelled `region` is a plain `<section>` plus the warning. Landmark takes no `className` or `style`; a composite that needs its own classes renders its own element around Landmark and passes only `role`, `as`, `label` or `aria-labelledby`. Never branch on `document` at render time (SSR). Apply `aria-label` from `label`. The forwarded ref is typed `HTMLElement` (not the specific element chosen by `as`), so render through `createElement` with `HTMLAttributes<HTMLElement>` rather than a union of intrinsic tags. Development warnings use `process.env.NODE_ENV !== 'production'`.

### Lit
`<ds-landmark role="navigation" aria-label="Main">` uses no shadow root (`label` is property-only; its attribute is `aria-label`). The property is `landmark` (attribute `role`). In `connectedCallback`, set `display: block` inline when unset, so the host element itself is the landmark and its light-DOM children are its content. The role and the name are plain reflected attributes on the host — `role` and `aria-label` — not `ElementInternals.role` / `.ariaLabel`, which the accessible-name tooling does not read; `label` therefore reflects to the `aria-label` attribute (conditionally: never for `banner`, `main`, `contentinfo` or an empty string), and a story sets it as a property or writes `aria-label` directly. With no shadow root there is nothing to carry a `part`, so `data-ds="Landmark"` on the host is the only hook for the `region` part. Warnings are logged in development builds only (`import.meta.env.DEV`; the package tsconfig includes `vite/client` types).

### React Native
Render a `View` with the `role` prop (which react-native-web turns into the semantic element and iOS/Android map to the nearest accessibility role or ignore; `search` uses `accessibilityRole="search"`), string and number children wrapped in the package `Text`, and `accessibilityLabel={label}` for `navigation`, `region` and `form` so the group has a name for TalkBack and VoiceOver. Do not set `accessible={true}` on the container; it would collapse every child into one element. There is no jump-to-landmark on native — the value here is web parity and a consistent structure for the same screen code.

## Related

Stack, Heading, Breadcrumb, SkipLink (planned).
