# Generate: Landmark for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Landmark.swift` declaring `public struct Landmark: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/LandmarkBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Landmark.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Landmark") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("Landmark")` on the root and `"Landmark.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for swiftui; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: each closure takes exactly the listed arguments, in order, and `reason` is a nested `enum` of its reasons. A `cancelable` closure returns `Bool`, and `false` skips the default action. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: every pair becomes a `Binding<T>?` parameter plus the default's initial value, with `@State` holding the uncontrolled value; the closure fires in both modes, and a bound view shows the new state only once the binding changes.
- **Parts and slots**: each slot is a `@ViewBuilder` parameter under its resolved label only (`content` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides:` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (`.onHover`, `@FocusState`, or the view's own state), with the token listed for each `by` value; write `computed` as the given multiplication of `theme` values. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` applies when those props are set.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this picks among the conventions' overlay forms.
- **Copy**: interpolate only the listed `params` and props; select plural forms through `String(localized:)` with the entry's forms as its plural variations; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example becomes a `#Preview` with the name shown and exactly its `given`.
- **Lifecycle**: a deprecated parameter, closure, case or view keeps working, is marked `@available(*, deprecated, message:)` naming `use`, and warns once under `#if DEBUG` naming `use`.
- A `type: integer` prop is an `Int`: whole numbers only.

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
        warning says so.'
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
        a plain <section> with no role attribute, plus the missing-label warning.
        Landmark takes no className or style (the Link rule): a composite that needs
        its own classes, style or positioning (SidePanel) renders its own styled element
        and composes Landmark inside it, passing only `role`, `as`, `label` or `aria-labelledby`.
        A composite''s `aria-labelledby` is forwarded to the element and the text
        it references counts as the label for the warnings.'
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
        (that is what `reflect: [role]` means) because `role` already exists on HTMLElement;
        `label` reflects to `aria-label`. With no role (attribute absent) no role
        is exposed and a development warning fires. With no shadow root there is no
        static styles; set `display: block` inline in connectedCallback when the host
        has no display set. Do not also render a native <nav> inside — a nested landmark
        of the same role is a duplicate.'
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
        so Landmark wraps string and number children in the package Text itself. With
        no document to scan, only the missing-label warning applies. Native has no
        landmark query, so RN tests check the `role` (or, for `search`, `accessibilityRole`)
        and `accessibilityLabel` props on the View instead of a role lookup.'
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
    then:
    - role: main
    platforms:
    - web
    - lit
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

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: none
Locked (accessibility-bearing, never overridable): none

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .accessibilityElement=contain
- .accessibilityLabel
- .accessibilityAddTraits
- accessibilityRotor
notes: 'iOS has no landmark roles. The Landmark renders `.accessibilityElement(children:
  .contain)` with the `label` as its accessibility label so VoiceOver announces the
  region boundary when entering it, and registers an `.accessibilityRotorEntry` under
  a package-wide ''Landmarks'' rotor (`Support/LandmarkRotor.swift`) so users can
  jump between regions as they do on web. `role: main` adds `.accessibilityAddTraits(.isSummaryElement)`
  only when the doc asks. The element name (`nav`, `aside`) has no equivalent; `role`
  drives everything.'
```

## Guidance

## Overview

Landmarks are the page's table of contents for assistive technology. A screen-reader user arriving on a page presses one key to jump to the main content, another to list the navigations, another for the search. Without landmarks they read from the top. This component exists so that every page in the system gets the same, correct set of them without anyone remembering which element implies which role.

## When to use

Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for the primary content, `navigation` for each navigation block (labelled when there is more than one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site footer, `search` around the site search form, and `region` for any other section a user might want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly one `main`.

## When not to use

Do not wrap everything: a page with twenty landmarks is as hard to navigate as one with none. Layout containers, cards, list items and form groups are not landmarks; use Stack, Fieldset (planned), or nothing. Do not use `region` without a `label` — an unlabelled region is not exposed as a landmark and the component will warn. Do not use Landmark to style a region; it has no visual bindings by design.

## Behavior

Landmark renders its children inside the appropriate element with the appropriate role and name, and nothing else: no padding, background, or layout. It is transparent to layout on every platform (`display: contents` is *not* used, because it removes the element's semantics in some browsers; instead the element is a plain block and consumers lay it out like any block). In development, the component warns when `main` appears more than once in a document, when `region` or `form` has no `label` (`Landmark: role "<role>" is only a landmark when it has a label.`), and when two `navigation`, `complementary`, `region` or `form` landmarks in the same root share a label or both lack one. The naming sources that count are `label` (an empty string is absent) and an `aria-labelledby` a composite passes, read as the text it references. `banner`, `main` and `contentinfo` never take labels: a label passed to them is not rendered, with the warning `Landmark: role "<role>" does not take a label; it was not rendered.` Warnings fire when the offending combination appears or changes (mount, or a change of role, label or element), not on every render. For the duplicate checks the landmark scans its `getRootNode()` for `[data-ds="Landmark"]`, and only the later landmark in document order warns; native landmarks not rendered by Landmark are not counted. With no role at all (a Lit host without the attribute) no role is exposed and the component warns. On native there is no document to scan, so only the missing-label warning applies.

The Default story is role `navigation` with label "Main" and the text "Primary links.", a role that takes a label, so the derived accessible-name and renders-as scenarios apply to it. Example `children` strings are text content: stories render them inside the package Text (on React Native Landmark does this itself).

## Content guidelines

Labels name the region in one or two words and do not repeat the role: "Main" and "Footer" for two navigations (read as "Main navigation"), not "Main navigation menu". Labels are sentence case and never punctuated. Where the region already starts with a visible heading, the label should match the heading text.

## Accessibility

Landmark regions let users bypass blocks and understand page structure (WCAG 1.3.1, 2.4.1). Each region has a role from the ARIA landmark set, and a name when the role appears more than once or when the role is `region` or `form`, which are landmarks only when named (4.1.2). Exactly one `main` per document. Native HTML elements are used wherever they imply the role, so no ARIA is added where the element already provides it, in line with the first rule of ARIA. Nested landmarks are allowed only where the APG allows them: a `navigation` inside `banner` is fine; a `main` inside anything is not.

## Platform notes

### Web
Choose the element from `role` unless `as` is set: `banner`→`<header role="banner">`, `navigation`→`<nav>`, `main`→`<main>`, `complementary`→`<aside>`, `contentinfo`→`<footer role="contentinfo">`, `region`→`<section aria-label>`, `search`→`<form role="search">`, `form`→`<form aria-label>`. Always emit `role` on `header` and `footer`, when `as` differs from the role's default element, and when the element does not imply the role (`<form role="search">`); `as` equal to the default adds nothing, and an unlabelled `region` is a plain `<section>` plus the warning. Landmark takes no `className` or `style`; a composite that needs its own classes renders its own element around Landmark and passes only `role`, `as`, `label` or `aria-labelledby`. Never branch on `document` at render time (SSR). Apply `aria-label` from `label`. The forwarded ref is typed `HTMLElement` (not the specific element chosen by `as`), so render through `createElement` with `HTMLAttributes<HTMLElement>` rather than a union of intrinsic tags. Development warnings use `process.env.NODE_ENV !== 'production'`.

### Lit
`<ds-landmark role="navigation" label="Main">` uses no shadow root. The property is `landmark` (attribute `role`). In `connectedCallback`, set `display: block` inline when unset, so the host element itself is the landmark and its light-DOM children are its content. The role and the name are plain reflected attributes on the host — `role` and `aria-label` — not `ElementInternals.role` / `.ariaLabel`, which the accessible-name tooling does not read; `label` therefore reflects to the `aria-label` attribute, and a story sets it as a property or writes `aria-label` directly. With no shadow root there is nothing to carry a `part`, so `data-ds="Landmark"` on the host is the only hook for the `region` part. Warnings are logged in development builds only (`import.meta.env.DEV`; the package tsconfig includes `vite/client` types).

### React Native
Render a `View` with the `role` prop (which react-native-web turns into the semantic element and iOS/Android map to the nearest accessibility role or ignore; `search` uses `accessibilityRole="search"`), string and number children wrapped in the package `Text`, and `accessibilityLabel={label}` for `navigation`, `region` and `form` so the group has a name for TalkBack and VoiceOver. Do not set `accessible={true}` on the container; it would collapse every child into one element. There is no jump-to-landmark on native — the value here is web parity and a consistent structure for the same screen code.

## Related

Stack, Heading, Breadcrumb, SkipLink (planned).

## Behavior scenarios (10)

One test per scenario, in this order.

```yaml
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
