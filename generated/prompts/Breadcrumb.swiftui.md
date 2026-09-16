# Generate: Breadcrumb for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Breadcrumb.swift` declaring `public struct Breadcrumb: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/BreadcrumbBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Breadcrumb.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Breadcrumb") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Breadcrumb")` on the root and `"Breadcrumb.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Breadcrumb
  category: navigation
  status: review
  apg: breadcrumb
  anatomy:
  - nav
  - list
  - item
  - link
  - separator
  - current
  - expand
  composition:
    link:
      component: Link
      props:
        tone: default
    expand:
      component: Button
      props:
        variant: ghost
        size: sm
        iconOnly: true
  props:
    items:
      type: array
      required: true
      shape: '{ label: string; href?: string }[]'
      description: The trail from root to current page, in order. Every item but the
        last needs an `href`; an ancestor without one, or with an empty-string `href`,
        renders as plain text (never an empty link). The last is the current page
        and its `href` is ignored. An empty array renders the named landmark around
        an empty list; a single item renders only the current page; neither raises
        a dev warning. Lit starts the property as `[]`. Export the item type as `BreadcrumbItem`.
    label:
      type: string
      default: Breadcrumb
      description: Accessible name of the navigation landmark. Change it only if the
        page has another breadcrumb.
      a11y: Rendered as aria-label on the nav so it is distinguished from other navigation
        landmarks.
    collapse:
      type: boolean
      default: true
      description: 'When there are more than four items, show the first, an ellipsis,
        and the last two; the ellipsis is a button that reveals the rest. The rule
        is literal: five items hide the second and third. Once revealed the trail
        stays expanded for the life of the instance, even if `items` changes. Set
        false for short trails that must always show in full.'
  events:
    onNavigate:
      description: 'Fired when a non-current item is activated, as `(item, index,
        event)` on web and `(item, index)` on native, where there is no event. On
        web the link still navigates unless the handler returns `false` or calls `event.preventDefault()`.
        On Lit, `preventDefault()` on the `navigate` CustomEvent or on `detail.originalEvent`
        both cancel (the first also prevents the original click). On native the handler
        is passed to Link as `onPress` and typed `boolean | void`: it is the navigation,
        so returning `false` has nothing to cancel (Breadcrumb links are never `external`);
        without a handler the Link falls back to Linking.openURL.'
      platforms:
        web: onNavigate
        lit: navigate
        rn: onNavigate
        swiftui: onNavigate
      cancelable: true
      fires:
      - user
  styles:
    currentColor:
      token: color.foreground
      part: current
      description: The current page, rendered as text with aria-current, in the regular
        weight.
      locked: true
    itemColor:
      token: color.foreground.muted
      part: item
      description: Set on the item (the `<li>` on web and Lit), so it reaches an ancestor
        without `href` rendered as plain text (a level that has no page of its own);
        the Link and the current page set their own colours over it. On native, where
        colour does not inherit through a View, the plain ancestor Text takes it directly.
      locked: true
    separatorColor:
      token: color.foreground.muted
      part: separator
      description: A slash or chevron between items, aria-hidden. On web and Lit the
        separator is the `::before` of every item after the first, so it has no element
        or data-part of its own and this binding styles that pseudo-element; on native
        it is a Text with testID `Breadcrumb.separator`.
      locked: true
    gap:
      token: space.2
      part: list
      description: 'Applied twice, never as margins: as the list''s column gap between
        items, and as the gap inside each item between its leading separator and its
        content. The separator belongs to the item after it, so a wrapped line may
        start with a separator. The ellipsis sits in its own item like any other.
        Row gap between wrapped lines is none; the items'' minTarget height spaces
        the lines.'
      locked: false
    fontFamily:
      token: font.family.body
      part: nav
      description: Set on the nav and inherited on web and Lit; on native forwarded
        like fontSize.
      locked: false
    fontSize:
      token: font.size.sm
      part: nav
      description: Set on the nav; the Links inherit it on web and Lit. On native
        each ancestor Link is wrapped in a Text (the `link` part) whose `overrides`
        receive fontSize, fontFamily, fontWeight and lineHeight (and any override
        of them), and plain ancestors, the current page and separators are Text at
        the same values, so the type is one value everywhere.
      locked: false
    fontWeight:
      token: font.weight.regular
      part: nav
      description: Set on the nav and inherited on web and Lit; on native forwarded
        like fontSize.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: nav
      description: Set on the nav and inherited on web and Lit; on native forwarded
        like fontSize.
      locked: false
    minTarget:
      token: size.target.min
      part: item
      description: Each item reaches 24px tall via min-height on the list item, not
        on the inline Link.
      locked: true
  copy:
    separator: /
    expandLabel: Show all pages
    navLabel: Breadcrumb
    current: current page
  a11y:
    role: navigation
    requires:
    - landmark-role
    - accessible-name
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
  platforms:
    web:
      element: nav
      attributes:
      - aria-label
      - aria-current
      notes: '<nav aria-label> containing an <ol> of <li>; each ancestor is a ds Link,
        the last item is a <span aria-current="page">. Separators are CSS-generated
        (li + li::before) from the custom property --ds-breadcrumb-separator, set
        inline on the nav from copy.separator, so the copy string lives in code and
        the separator is not in the accessibility tree at all. The ellipsis is the
        system Button (ghost, sm, iconOnly, leadingIcon the system Icon `ellipsis`)
        unchanged, inside `<span data-part="expand">` in its own `<li>`. Each ancestor
        Link sits inside `<span data-part="link">`; Link keeps its own `data-part="anchor"`.
        `copy.current` is not rendered: aria-current="page" announces it.'
    lit:
      tag: ds-breadcrumb
      reflect:
      - prop: collapse
        attribute: no-collapse
      notes: '`items` is a property (.items=${[...]}). The nav and list are rendered
        in the shadow root; the landmark is still exposed from inside a shadow root.
        `navigate` is a composed CustomEvent with detail { item, index, originalEvent
        }; calling preventDefault() on detail.originalEvent (the retargeted native
        click) cancels navigation, and so does preventDefault() on the `navigate`
        event itself (it also prevents the original click). The inner ds-button''s
        `press` is stopped so consumers see only `navigate`. Parts carry `part` and
        `data-part` with the anatomy names: `link` and `expand` on spans wrapping
        ds-link and ds-button; separators are `::before` pseudo-elements with no part.
        `copy.current` is not rendered.'
    rn:
      element: View
      props:
      - role=navigation
      - accessibilityLabel
      notes: 'A horizontal, wrapping View with role="navigation" (semantic on react-native-web;
        no accessibilityRole value exists for it) labelled with `label`; ancestors
        are ds Links (Text with role link) whose onPress fires onNavigate, the current
        page is Text with accessibilityState={{ selected: true }} and accessibilityLabel
        ''<label>, <copy.current>'' (screen readers would otherwise say only "selected").
        Separators are Text with importantForAccessibility="no" / accessibilityElementsHidden.
        The one root View is both the `nav` and `list` parts (testID `Breadcrumb`;
        there is no `Breadcrumb.nav` or `Breadcrumb.list`); items are Views with testID
        `Breadcrumb.item`, the Text wrapping each Link carries `Breadcrumb.link` (Link
        takes no testID), separators `Breadcrumb.separator`, the current Text `Breadcrumb.current`,
        and a View around the ellipsis Button `Breadcrumb.expand`. Breadcrumbs are
        rare on native — most screens rely on the navigation stack — and are provided
        mainly for tablet and react-native-web layouts.'
    swiftui:
      element: HStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - Link
      - Icon
      - .accessibilityAddTraits=isSelected
      - ViewThatFits
      notes: 'An `HStack` (wrapping `FlowLayout` when items overflow) inside `.accessibilityElement(children:
        .contain)` labelled `copy.navLabel`; items are `Link`s with the `chevron-right`
        Icon (hidden) between; the current item is a `Text` with `.isSelected` plus
        `copy.current` in its label. `collapse` folds the middle items behind an ellipsis
        Button that expands them in place.'
  behavior:
  - name: click-on-an-ancestor-reports-navigation
    description: Each ancestor is a Link that fires onNavigate, so a client-side router
      can intercept it. The test activates the first ancestor link and expects `(items[0],
      0)`.
    when:
      click: link
    then:
    - event: onNavigate
  - name: the-last-item-is-the-current-page
    description: The last item is plain text carrying aria-current="page", never a
      link.
    then:
    - attribute: aria-current
      is: page
      'on': current
      platforms:
      - web
      - lit
  - name: the-trail-is-a-named-navigation-landmark
    description: A navigation landmark with a name that distinguishes it from other
      navigations.
    given:
      label: Docs breadcrumb
    then:
    - role: navigation
    - attribute: aria-label
      is: Docs breadcrumb
    platforms:
    - web
  - name: an-uncollapsed-trail-shows-every-ancestor
    description: With collapse off a long trail stays in full rather than folding
      its middle behind an ellipsis.
    given:
      collapse: false
      items:
      - label: Docs
        href: /docs
      - label: Components
        href: /docs/components
      - label: Navigation
        href: /docs/components/navigation
      - label: Breadcrumb
        href: /docs/components/navigation/breadcrumb
      - label: Keyboard
    then:
    - text: Components
    - text: Navigation
  examples:
  - name: settings-trail
    description: A short trail whose last item is the current page, rendered as text.
    given:
      items:
      - label: Settings
        href: /settings
      - label: Notifications
        href: /settings/notifications
      - label: Email digest
  - name: deep-trail-collapsed
    description: A trail of more than four items, folded to the first, an ellipsis
      and the last two.
    given:
      collapse: true
      items:
      - label: Docs
        href: /docs
      - label: Components
        href: /docs/components
      - label: Navigation
        href: /docs/components/navigation
      - label: Breadcrumb
        href: /docs/components/navigation/breadcrumb
      - label: Keyboard
  - name: always-in-full
    description: A trail short enough that the ellipsis would only cost the reader
      a click.
    given:
      collapse: false
      items:
      - label: Catalogue
        href: /catalogue
      - label: Outdoor
        href: /catalogue/outdoor
      - label: Tents
  - name: second-breadcrumb-on-a-page
    description: A second trail, named so the two navigation landmarks are distinguishable.
    given:
      label: Catalogue breadcrumb
      items:
      - label: Catalogue
        href: /catalogue
      - label: Tents
```

## Events

- `onNavigate`: emit `onNavigate`
  - cancelable: yes
  - fires on: user

## Parts and slots

- `nav`: element
- `list`: element
- `item`: element
- `link`: component `Link`; props `tone` = "default"
- `separator`: element
- `current`: element
- `expand`: component `Button`; props `variant` = "ghost", `size` = "sm", `iconOnly` = true

## Style bindings

- `currentColor`: token `color.foreground`; part `current`; locked
- `itemColor`: token `color.foreground.muted`; part `item`; locked
- `separatorColor`: token `color.foreground.muted`; part `separator`; locked
- `gap`: token `space.2`; part `list`
- `fontFamily`: token `font.family.body`; part `nav`
- `fontSize`: token `font.size.sm`; part `nav`
- `fontWeight`: token `font.weight.regular`; part `nav`
- `lineHeight`: token `font.lineHeight.normal`; part `nav`
- `minTarget`: token `size.target.min`; part `item`; locked

## Constants and examples

- example `settings-trail`, story `SettingsTrail`: given `items: [{"label":"Settings","href":"/settings"},{"label":"Notifications","href":"/settings/notifications"},{"label":"Email digest"}]`; A short trail whose last item is the current page, rendered as text.
- example `deep-trail-collapsed`, story `DeepTrailCollapsed`: given `collapse: true`, `items: [{"label":"Docs","href":"/docs"},{"label":"Components","href":"/docs/components"},{"label":"Navigation","href":"/docs/components/navigation"},{"label":"Breadcrumb","href":"/docs/components/navigation/breadcrumb"},{"label":"Keyboard"}]`; A trail of more than four items, folded to the first, an ellipsis and the last two.
- example `always-in-full`, story `AlwaysInFull`: given `collapse: false`, `items: [{"label":"Catalogue","href":"/catalogue"},{"label":"Outdoor","href":"/catalogue/outdoor"},{"label":"Tents"}]`; A trail short enough that the ellipsis would only cost the reader a click.
- example `second-breadcrumb-on-a-page`, story `SecondBreadcrumbOnAPage`: given `label: "Catalogue breadcrumb"`, `items: [{"label":"Catalogue","href":"/catalogue"},{"label":"Tents"}]`; A second trail, named so the two navigation landmarks are distinguishable.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `gap`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`
Locked (accessibility-bearing, never overridable): `currentColor`, `itemColor`, `separatorColor`, `minTarget`

## Platform notes (swiftui)

```yaml
element: HStack
props:
- .accessibilityElement=contain
- .accessibilityLabel
- Link
- Icon
- .accessibilityAddTraits=isSelected
- ViewThatFits
notes: 'An `HStack` (wrapping `FlowLayout` when items overflow) inside `.accessibilityElement(children:
  .contain)` labelled `copy.navLabel`; items are `Link`s with the `chevron-right`
  Icon (hidden) between; the current item is a `Text` with `.isSelected` plus `copy.current`
  in its label. `collapse` folds the middle items behind an ellipsis Button that expands
  them in place.'
```

## Guidance

## Overview

A breadcrumb answers "where am I?" and "how do I go up a level?" in one line. It is a secondary navigation: it never replaces the primary nav or the back button, and it shows the site's hierarchy, not the user's history.

## When to use

Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation, catalogues, settings sub-pages, file browsers — where the user benefits from seeing the ancestors and jumping to any of them. Place it above the page title, at the top of `main`.

## When not to use

Do not use a Breadcrumb on top-level pages or in flat sites; a single-item trail is noise. Do not use it to show history ("you came from Search"); that is what Back is for. Do not use it as a step indicator for a wizard (use Stepper, planned); steps are not places. Do not put actions in it.

## Behavior

Each ancestor is a Link that navigates on activation and fires `onNavigate` with the item first, so client-side routers can intercept. The last item is the current page: plain text with `aria-current="page"`, not focusable. With `collapse` and more than four items, the trail shows the first item, an ellipsis button labelled `copy.expandLabel`, and the last two; activating the ellipsis replaces it with the hidden items (one-way; the trail does not re-collapse, even when `items` changes) and moves focus to the first revealed item that is a link; if no revealed item has an `href`, focus goes to the first revealed item itself (`tabindex="-1"` on its `<li>` on web and Lit), so focus never falls to the page. On narrow widths the trail wraps rather than truncating so every ancestor stays reachable.

## Content guidelines

Item labels are the page titles of the ancestors, shortened if they are long, and always in the same order as the site structure. The root item is the section or product name ("Docs", "Catalogue"), not "Home", unless the trail really starts at the home page. Do not repeat the current page's title in the trail if the page heading is directly below and the trail is long; but when in doubt, include it — the APG expects the current page as the last item.

## Accessibility

The breadcrumb is a `navigation` landmark with a name that distinguishes it from other navigations (WCAG 1.3.1, 2.4.8, APG breadcrumb). Items are in an ordered list so the count and order are announced. Ancestors are real links with visible underline and focus ring (2.4.4, 2.4.7); the current page carries `aria-current="page"` and is not a link, so users are not offered a link to where they already are. Separators are hidden from assistive technology (they are visual punctuation) and the ellipsis is a real button with an accessible name. Link, current and separator colors all meet 4.5:1 on the page background.

## Platform notes

### Web
Render `<nav aria-label={label}><ol>` with `<li>` per item. Ancestors render the system `Link` (`tone: default`, inheriting the nav's `fontSize`); the last renders `<span aria-current="page">`. Draw separators with `li + li::before { content: var(--ds-breadcrumb-separator) }` in `separatorColor`, so they are invisible to assistive technology. The ellipsis is the system `Button` (`ghost`, `size: sm`, `iconOnly`, `label: copy.expandLabel`, the system `Icon` named `ellipsis` as `leadingIcon`). Call `onNavigate(item, index, event)` from the link's `onClick` before the default navigation; consumers routing client-side return `false` or call `event.preventDefault()` on that event. Link and Button bring their own focus rings; Breadcrumb adds none.

### Lit
`<ds-breadcrumb .items=${items}>` renders the `<nav>`, list and `<ds-link>` elements in its shadow root. Landmarks inside shadow roots are exposed normally. Dispatch a composed `navigate` CustomEvent with `detail: { item, index, originalEvent }` from the inner link's click; consumers who route client-side call `preventDefault()` on `detail.originalEvent`. `collapse` defaults to true, so it reflects as the negated attribute `no-collapse` — a bare boolean attribute cannot express false in static HTML.

### React Native
Render a `View` with `flexDirection: 'row'`, `flexWrap: 'wrap'`, `accessibilityLabel={label}` and `role="navigation"` (semantic on react-native-web, ignored on native). Ancestors are the system `Link` nested in a `Text` whose `overrides` receive `fontSize`, `fontFamily`, `fontWeight` and `lineHeight` so the Link inherits them, with `onPress` calling `onNavigate(item, index)`; each item sits in a row `View` with `minHeight: minTarget` and `gap` between its separator and content, and the root row uses `columnGap: gap`. Focus after expanding goes to the first revealed item's `View` (index 1) via `setAccessibilityFocus` (hardware-keyboard focus cannot be moved to a Text link); the current page is `Text` in `currentColor` with `accessibilityState={{ selected: true }}` and `copy.current` appended to its label; separators are `Text` in `separatorColor` with `accessibilityElementsHidden` and `importantForAccessibility="no"`. The ellipsis is the system `Button` (`ghost`, `size: sm`, `iconOnly`) with the `ellipsis` Icon passed through Button's own icon prop, so Button colours it (no explicit `color`).

## Related

Link, Landmark, Heading, Stepper (planned).

## Behavior scenarios (4)

One test per scenario, in this order.

```yaml
- name: click-on-an-ancestor-reports-navigation
  description: Each ancestor is a Link that fires onNavigate, so a client-side router
    can intercept it. The test activates the first ancestor link and expects `(items[0],
    0)`.
  when:
    click: link
  then:
  - event: onNavigate
- name: an-uncollapsed-trail-shows-every-ancestor
  description: With collapse off a long trail stays in full rather than folding its
    middle behind an ellipsis.
  given:
    collapse: false
    items:
    - label: Docs
      href: /docs
    - label: Components
      href: /docs/components
    - label: Navigation
      href: /docs/components/navigation
    - label: Breadcrumb
      href: /docs/components/navigation/breadcrumb
    - label: Keyboard
  then:
  - text: Components
  - text: Navigation
- name: renders
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
