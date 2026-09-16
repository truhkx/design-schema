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
      description: 'Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role (two navigations: "Main" and "Footer"). Not shown visually.'
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
      notes: 'Native elements carry the roles: banner→header, navigation→nav, main→main, complementary→aside, contentinfo→footer, region→section (only a landmark when labelled), search→form role=search (always, for SSR safety, until <search> is in the React typings), form→form. The explicit role attribute is always emitted on header and footer (they lose the landmark role inside sectioning content, and ancestry is unknown at render time) and whenever `as` overrides the element.'
    lit:
      tag: ds-landmark
      reflect: [role]
      notes: 'No shadow DOM and no wrapper element: the host itself takes role and aria-label via ElementInternals so it is the landmark in the light DOM tree, and children are ordinary light-DOM children. The property is named `landmark` (attribute `role`) because `role` already exists on HTMLElement. With no shadow root there is no static styles; set `display: block` inline in connectedCallback when the host has no display set. Do not also render a native <nav> inside — a nested landmark of the same role is a duplicate.'
    rn:
      element: View
      props: [role, accessibilityLabel]
      notes: 'Native platforms have no landmark navigation (VoiceOver and TalkBack have no landmark rotor), so Landmark is structure for react-native-web and a labelled View on iOS and Android. Pass `role` (RN ≥ 0.73) so react-native-web renders the semantic element; on native it maps to the nearest accessibilityRole or none. Exception: RN''s `Role` union has no `search` landmark (only the `searchbox` widget), so `search` is passed as the legacy accessibilityRole="search", which react-native-web maps to the ARIA search landmark; iOS and Android have no equivalent, so it is web-parity only. The label is applied as accessibilityLabel only for `region`, `form`, and `navigation`, so screen readers get a group name without every View announcing a role.'
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
        - { role: navigation }
      platforms: [web]
    - name: main-is-the-primary-content-landmark
      description: Exactly one main per page; the element carries the role.
      given: { role: 'main' }
      then:
        - { role: main }
      platforms: [web]
    - name: a-region-is-named-by-its-label
      description: A region is a landmark only when it is named; the label is rendered as aria-label.
      given: { role: 'region', label: 'Related articles' }
      then:
        - { role: region }
        - { attribute: 'aria-label', is: 'Related articles' }
      platforms: [web]
    - name: an-overridden-element-still-carries-its-role
      description: The explicit role attribute is emitted whenever `as` overrides the default element.
      given: { role: 'banner', as: 'div' }
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

Landmark renders its children inside the appropriate element with the appropriate role and name, and nothing else: no padding, background, or layout. It is transparent to layout on every platform (`display: contents` is *not* used, because it removes the element's semantics in some browsers; instead the element is a plain block and consumers lay it out like any block). In development, the component warns when `main` appears more than once in a document, when `region` or `form` has no `label`, and when two `navigation`, `complementary`, `region` or `form` landmarks in the same root share a label or both lack one (`banner`, `main` and `contentinfo` never take labels). On native there is no document to scan, so only the missing-label warning applies.

## Content guidelines

Labels name the region in one or two words and do not repeat the role: "Main" and "Footer" for two navigations (read as "Main navigation"), not "Main navigation menu". Labels are sentence case and never punctuated. Where the region already starts with a visible heading, the label should match the heading text.

## Accessibility

Landmark regions let users bypass blocks and understand page structure (WCAG 1.3.1, 2.4.1). Each region has a role from the ARIA landmark set, and a name when the role appears more than once or when the role is `region` or `form`, which are landmarks only when named (4.1.2). Exactly one `main` per document. Native HTML elements are used wherever they imply the role, so no ARIA is added where the element already provides it, in line with the first rule of ARIA. Nested landmarks are allowed only where the APG allows them: a `navigation` inside `banner` is fine; a `main` inside anything is not.

## Platform notes

### Web
Choose the element from `role` unless `as` is set: `banner`→`<header role="banner">`, `navigation`→`<nav>`, `main`→`<main>`, `complementary`→`<aside>`, `contentinfo`→`<footer role="contentinfo">`, `region`→`<section aria-label>`, `search`→`<form role="search">`, `form`→`<form aria-label>`. Always emit `role` on `header` and `footer` and whenever `as` overrides the default element; never branch on `document` at render time (SSR). Apply `aria-label` from `label`. The forwarded ref is typed `HTMLElement` (not the specific element chosen by `as`), so render through `createElement` with `HTMLAttributes<HTMLElement>` rather than a union of intrinsic tags. Development warnings use `process.env.NODE_ENV !== 'production'`.

### Lit
`<ds-landmark role="navigation" label="Main">` uses no shadow root. The property is `landmark` (attribute `role`). In `connectedCallback`, attach `ElementInternals`, set `internals.role` and `internals.ariaLabel`, and set `display: block` inline when unset, so the host element itself is the landmark and its light-DOM children are its content. Warnings are logged in development builds only (`import.meta.env.DEV`; the package tsconfig includes `vite/client` types).

### React Native
Render a `View` with the `role` prop (which react-native-web turns into the semantic element and iOS/Android map to the nearest accessibility role or ignore), and `accessibilityLabel={label}` for `navigation`, `region` and `form` so the group has a name for TalkBack and VoiceOver. Do not set `accessible={true}` on the container; it would collapse every child into one element. There is no jump-to-landmark on native — the value here is web parity and a consistent structure for the same screen code.

## Related

Stack, Heading, Breadcrumb, SkipLink (planned).
