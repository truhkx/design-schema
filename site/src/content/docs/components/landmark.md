---
title: Landmark
description: Names a region of the page — header, navigation, main, sidebar, footer, search — so assistive technology can jump straight to it. Structure, not styling.
component:
  name: Landmark
  category: layout
  status: review
  apg: landmarks
  anatomy: [region]
  props:
    role:
      type: enum
      values: [banner, navigation, main, complementary, contentinfo, region, search, form]
      required: true
      description: 'Which landmark this is. `banner` (site header), `navigation`, `main` (exactly one per page), `complementary` (sidebar), `contentinfo` (site footer), `region` (a labelled section that deserves a jump point), `search`, `form` (a labelled form that is a page-level region).'
    label:
      type: string
      a11yRole: accessible-name
      description: 'Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role (two navigations: "Main" and "Footer"). Not shown visually. An empty string counts as absent (no aria-label, and missing for the warnings). `banner`, `main` and `contentinfo` never take a label: on web and Lit one passed to them is not rendered and a development warning says so. On React Native the label is applied only to `navigation`, `region` and `form`; on any other role it is silently not applied, with no warning. `search` and `complementary` do take a label on web and Lit, and a page with two of either needs one.'
      a11y: Rendered as aria-label; the name is read together with the role ("Main navigation, landmark").
    children:
      type: content
      required: true
      description: The region's content.
    as:
      type: enum
      values: [header, nav, main, aside, footer, section, form, div]
      description: 'Web element override. By default the element is chosen from `role` (see platform notes); set this only when the native element would be wrong, e.g. a `banner` that is not the page header. Web only — the Lit host is its own element.'
      platforms: [web]
  styles: {}
  a11y:
    roleFrom: role
    requires: [landmark-role, accessible-name]
  platforms:
    web:
      element: header | nav | main | aside | footer | section | form
      attributes: [role, aria-label]
      notes: 'Native elements carry the roles: banner→header, navigation→nav, main→main, complementary→aside, contentinfo→footer, region→section (only a landmark when labelled), search→form role=search (always, for SSR safety, until <search> is in the React typings), form→form. The explicit role attribute is emitted on header and footer (they lose the landmark role inside sectioning content, and ancestry is unknown at render time), when `as` differs from the role''s default element, and when the element does not imply the role (form role=search); `as` equal to the default element adds nothing. `region` without a label renders a plain <section> with no role attribute, plus the missing-label warning; an unlabelled `region` with `as` set to another element follows the `as` rule (role="region" is emitted) and still warns. Landmark takes no className or style (the Link rule): a composite that needs its own classes, style or positioning (SidePanel) renders its own styled element and composes Landmark inside it, passing only `role`, `as`, `label` or `aria-labelledby`. A composite''s `aria-labelledby` is forwarded to the element and the text it references counts as the label for the warnings, except on `banner`, `main` and `contentinfo`, where it is dropped like `label`, with the does-not-take-a-label warning; an empty-string `aria-labelledby` counts as absent, exactly as an empty `label` does, and neither names nor warns. The root carries `data-part="region"` like any other part. The props type omits `role`, `children`, `aria-label`, `className` and `style`; everything else in HTMLAttributes is forwarded, so a composite can still pass `id`, `aria-labelledby`, data attributes and handlers. `role` is required and typed, so the no-role warning has no path on web: it exists for a Lit host whose attribute is absent.'
    lit:
      tag: ds-landmark
      reflect: [role]
      notes: 'No shadow DOM and no wrapper element: the host itself carries plain reflected `role` and `aria-label` attributes (not ElementInternals, which the accessible-name tooling does not read) so it is the landmark in the light DOM tree. Children are ordinary light-DOM children: there is no <slot>, so the rule that each slot renders as <slot> does not apply, and the `region` part has no `part`/`data-part`; the host''s `data-ds="Landmark"` is its only hook. The property is named `landmark` and reflects to the `role` attribute (that is what `reflect: [role]` means) because `role` already exists on HTMLElement. `label` is a property whose attribute is `aria-label` (there is no `label` attribute), and its reflection is conditional: the element writes `aria-label` itself, omitting it for `banner`, `main` and `contentinfo` and for an empty string, and ignores its own write so the `label` property keeps its value. Lit has no `labelledBy` property: a composite sets an `aria-labelledby` attribute on the host, its ids resolved in `getRootNode()`. On `banner`, `main` and `contentinfo` the element removes that attribute — Lit drops it rather than only warning, so the three roles are unnamed on every platform alike — at mount and on a role or label change. Changes to the attribute itself are not observed and do not re-run the warnings or the drop. With no role (attribute absent) no role is exposed and a development warning fires. With no shadow root there is no static styles; set `display: block` inline in connectedCallback when the host has no display set. Do not also render a native <nav> inside — a nested landmark of the same role is a duplicate.'
    rn:
      element: View
      props: [role, accessibilityLabel]
      notes: 'Native platforms have no landmark navigation (VoiceOver and TalkBack have no landmark rotor), so Landmark is structure for react-native-web and a labelled View on iOS and Android. Pass `role` (RN ≥ 0.73) so react-native-web renders the semantic element; on native it maps to the nearest accessibilityRole or none. Exception: RN''s `Role` union has no `search` landmark (only the `searchbox` widget), so `search` is passed as the legacy accessibilityRole="search", which react-native-web maps to the ARIA search landmark; iOS and Android have no equivalent, so it is web-parity only. The label is applied as accessibilityLabel only for `region`, `form`, and `navigation`, so screen readers get a group name without every View announcing a role. A View cannot hold a raw string, so Landmark wraps string and number children in the package Text itself, each one individually (React.Children.map) when strings and numbers are mixed with elements in an array. With no document to scan, only the missing-label warning applies (a label on `banner`, `main`, `contentinfo`, `complementary` or `search` is dropped without a warning). Native has no landmark query, so RN tests check the `role` (or, for `search`, `accessibilityRole`) and `accessibilityLabel` props on the View instead of a role lookup. The `region` part has no testID of its own: the root View is that part and keeps `testID="Landmark"`, as the Lit host keeps `data-ds` alone. Strings and numbers are wrapped at the top level only — that is the contract, not a shortcut — so a raw string nested inside a Fragment or an inner array is the caller''s to wrap. There is deliberately no module-level registry of mounted Landmarks, so the duplicate-main and duplicate-label checks do not run on native: a registry would outlive unmounted screens and report duplicates that are not on screen together. Nested-landmark nesting rules are guidance only and are checked on no platform.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=contain, .accessibilityLabel, .accessibilityAddTraits, accessibilityRotor]
      notes: 'iOS has no landmark roles. The Landmark renders `.accessibilityElement(children: .contain)` with the `label` as its accessibility label so VoiceOver announces the region boundary when entering it, and registers an `.accessibilityRotorEntry` under a package-wide ''Landmarks'' rotor (`Support/LandmarkRotor.swift`) so users can jump between regions as they do on web. `role: main` adds `.accessibilityAddTraits(.isSummaryElement)` only when the doc asks. The element name (`nav`, `aside`) has no equivalent; `role` drives everything.'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema. The role is an enum prop,
    # so every scenario states it in `given`; `then.name` has no mapping while the role comes from a prop.
    - name: the-role-prop-chooses-the-landmark
      description: navigation renders the navigation landmark.
      given: { role: 'navigation' }
      then:
        - { role: navigation, platforms: [web, lit] }
        - { attribute: role, is: 'navigation', platforms: [rn] }
      platforms: [web, lit, rn]
    - name: search-is-the-search-landmark
      description: 'search renders the search landmark; React Native has no search Role, so it goes through the legacy accessibilityRole.'
      given: { role: 'search' }
      then:
        - { role: search, platforms: [web, lit] }
        - { attribute: accessibilityRole, is: 'search', platforms: [rn] }
      platforms: [web, lit, rn]
    - name: main-is-the-primary-content-landmark
      description: Exactly one main per page; the element carries the role.
      given: { role: 'main', label: '' }
      then:
        - { role: main }
      platforms: [web, lit]
    - name: a-label-is-dropped-on-a-role-that-refuses-one
      description: 'banner, main and contentinfo are named by the page, not by the author: a label passed to them is not rendered on any platform.'
      given: { role: 'banner', label: 'Site header' }
      then:
        - { attribute: 'aria-label', is: null, platforms: [web, lit] }
        - { attribute: accessibilityLabel, is: null, platforms: [rn] }
    - name: a-region-is-named-by-its-label
      description: A region is a landmark only when it is named; the label is rendered as aria-label (accessibilityLabel on React Native).
      given: { role: 'region', label: 'Related articles' }
      then:
        - { role: region, platforms: [web, lit] }
        - { attribute: 'aria-label', is: 'Related articles', platforms: [web, lit] }
        - { attribute: accessibilityLabel, is: 'Related articles', platforms: [rn] }
      platforms: [web, lit, rn]
    - name: an-overridden-element-still-carries-its-role
      description: The explicit role attribute is emitted whenever `as` overrides the default element.
      given: { role: 'banner', as: 'div', label: '' }
      then:
        - { attribute: role, is: 'banner' }
        - { role: banner }
      platforms: [web]
  examples:
    - name: page-main
      description: The single main landmark every page needs.
      given: { role: 'main', children: 'The page content.' }
    - name: footer-navigation
      description: A second navigation, named so it is distinguishable from the primary one.
      given: { role: 'navigation', label: 'Footer', children: 'Footer links.' }
    - name: related-articles-region
      description: A labelled section that deserves a jump point of its own.
      given: { role: 'region', label: 'Related articles', children: 'A list of related articles.' }
    - name: banner-that-is-not-the-page-header
      description: A banner that is not the page header, where the native header element would be wrong.
      given: { role: 'banner', as: 'div', children: 'The product banner.' }
      platforms: [web]
---

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
