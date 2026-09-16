---
title: Breadcrumb
description: Shows where the current page sits in the hierarchy and links back up to each ancestor. The last item is the current page and is not a link.
component:
  name: Breadcrumb
  category: navigation
  status: review
  apg: breadcrumb
  anatomy: [nav, list, item, link, separator, current]
  composition:
    link: Link
  props:
    items:
      type: array
      required: true
      shape: '{ label: string; href?: string }[]'
      description: 'The trail from root to current page, in order. Every item but the last needs an `href`; an ancestor without one renders as plain text (never an empty link). The last is the current page and its `href` is ignored. Export the item type as `BreadcrumbItem`.'
    label:
      type: string
      default: Breadcrumb
      description: Accessible name of the navigation landmark. Change it only if the page has another breadcrumb.
      a11y: Rendered as aria-label on the nav so it is distinguished from other navigation landmarks.
    collapse:
      type: boolean
      default: true
      description: 'When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis is a button that reveals the rest. Set false for short trails that must always show in full.'
  events:
    onNavigate:
      description: 'Fired when a non-current item is activated, as `(item, index, event)`. On web the link still navigates unless the consumer calls `event.preventDefault()`; on native there is no event, the handler is the navigation, and without one the Link falls back to Linking.openURL.'
      platforms: { web: onNavigate, lit: navigate, rn: onNavigate, swiftui: onNavigate }
      cancelable: true
      fires: [user]
  styles:
    currentColor: { token: color.foreground, part: current, description: 'The current page, rendered as text with aria-current, in the regular weight.' }
    itemColor: { token: color.foreground.muted, part: item, description: 'An ancestor item without `href`, rendered as plain text (a level that has no page of its own).' }
    separatorColor: { token: color.foreground.muted, part: separator, description: 'A slash or chevron between items, aria-hidden.' }
    gap: { token: space.2, description: Gap on both sides of the separator. }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.sm, description: 'Set on the nav; the Links inherit it on web. On native each ancestor Link is wrapped in a Text whose `overrides.fontSize` receives this binding (and any override of it), so the size is one value everywhere.' }
    fontWeight: { token: font.weight.regular }
    lineHeight: { token: font.lineHeight.normal }
    minTarget: { token: size.target.min, description: 'Each item reaches 24px tall via min-height on the list item, not on the inline Link.' }
  copy:
    separator: /
    expandLabel: Show all pages
    navLabel: Breadcrumb
    current: current page
  a11y:
    role: navigation
    requires: [landmark-role, accessible-name, focus-visible, keyboard-operable, target-24px, contrast-aa]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  platforms:
    web:
      element: nav
      attributes: [aria-label, aria-current]
      notes: '<nav aria-label> containing an <ol> of <li>; each ancestor is a ds Link, the last item is a <span aria-current="page">. Separators are CSS-generated (li + li::before) from the custom property --ds-breadcrumb-separator, set inline on the nav from copy.separator, so the copy string lives in code and the separator is not in the accessibility tree at all. The ellipsis is the system Button (ghost, sm, iconOnly) unchanged.'
    lit:
      tag: ds-breadcrumb
      reflect: [{ prop: collapse, attribute: no-collapse }]
      notes: '`items` is a property (.items=${[...]}). The nav and list are rendered in the shadow root; the landmark is still exposed from inside a shadow root. `navigate` is a composed CustomEvent with detail { item, index, originalEvent }; calling preventDefault() on detail.originalEvent (the retargeted native click) cancels navigation. The inner ds-button''s `press` is stopped so consumers see only `navigate`.'
    rn:
      element: View
      props: [role=navigation, accessibilityLabel]
      notes: 'A horizontal, wrapping View with role="navigation" (semantic on react-native-web; no accessibilityRole value exists for it) labelled with `label`; ancestors are ds Links (Text with role link) whose onPress fires onNavigate, the current page is Text with accessibilityState={{ selected: true }}. Separators are Text with importantForAccessibility="no" / accessibilityElementsHidden. Breadcrumbs are rare on native — most screens rely on the navigation stack — and are provided mainly for tablet and react-native-web layouts.'
    swiftui:
      element: HStack
      props: [.accessibilityElement=contain, .accessibilityLabel, Link, Icon, .accessibilityAddTraits=isSelected, ViewThatFits]
      notes: 'An `HStack` (wrapping `FlowLayout` when items overflow) inside `.accessibilityElement(children: .contain)` labelled `copy.navLabel`; items are `Link`s with the `chevron-right` Icon (hidden) between; the current item is a `Text` with `.isSelected` plus `copy.current` in its label. `collapse` folds the middle items behind an ellipsis Button that expands them in place.'
  behavior:
    # Authored scenarios; the parser adds renders/accessible-name ones from the schema.
    - name: click-on-an-ancestor-reports-navigation
      description: Each ancestor is a Link that fires onNavigate, so a client-side router can intercept it.
      when: { click: link }
      then:
        - { event: onNavigate }
    - name: the-last-item-is-the-current-page
      description: The last item is plain text carrying aria-current="page", never a link.
      then:
        - { attribute: 'aria-current', is: 'page', 'on': current, platforms: [web, lit] }
    - name: the-trail-is-a-named-navigation-landmark
      description: A navigation landmark with a name that distinguishes it from other navigations.
      given: { label: 'Docs breadcrumb' }
      then:
        - { role: navigation }
        - { attribute: 'aria-label', is: 'Docs breadcrumb' }
      platforms: [web]
    - name: an-uncollapsed-trail-shows-every-ancestor
      description: With collapse off a long trail stays in full rather than folding its middle behind an ellipsis.
      given:
        collapse: false
        items:
          - { label: 'Docs', href: '/docs' }
          - { label: 'Components', href: '/docs/components' }
          - { label: 'Navigation', href: '/docs/components/navigation' }
          - { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' }
          - { label: 'Keyboard' }
      then:
        - { text: 'Components' }
        - { text: 'Navigation' }
  examples:
    - name: settings-trail
      description: A short trail whose last item is the current page, rendered as text.
      given:
        items:
          - { label: 'Settings', href: '/settings' }
          - { label: 'Notifications', href: '/settings/notifications' }
          - { label: 'Email digest' }
    - name: deep-trail-collapsed
      description: A trail of more than four items, folded to the first, an ellipsis and the last two.
      given:
        collapse: true
        items:
          - { label: 'Docs', href: '/docs' }
          - { label: 'Components', href: '/docs/components' }
          - { label: 'Navigation', href: '/docs/components/navigation' }
          - { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' }
          - { label: 'Keyboard' }
    - name: always-in-full
      description: A trail short enough that the ellipsis would only cost the reader a click.
      given:
        collapse: false
        items:
          - { label: 'Catalogue', href: '/catalogue' }
          - { label: 'Outdoor', href: '/catalogue/outdoor' }
          - { label: 'Tents' }
    - name: second-breadcrumb-on-a-page
      description: A second trail, named so the two navigation landmarks are distinguishable.
      given:
        label: 'Catalogue breadcrumb'
        items:
          - { label: 'Catalogue', href: '/catalogue' }
          - { label: 'Tents' }
---

A breadcrumb answers "where am I?" and "how do I go up a level?" in one line. It is a secondary navigation: it never replaces the primary nav or the back button, and it shows the site's hierarchy, not the user's history.

## When to use

Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation, catalogues, settings sub-pages, file browsers — where the user benefits from seeing the ancestors and jumping to any of them. Place it above the page title, at the top of `main`.

## When not to use

Do not use a Breadcrumb on top-level pages or in flat sites; a single-item trail is noise. Do not use it to show history ("you came from Search"); that is what Back is for. Do not use it as a step indicator for a wizard (use Stepper, planned); steps are not places. Do not put actions in it.

## Behavior

Each ancestor is a Link that navigates on activation and fires `onNavigate` with the item first, so client-side routers can intercept. The last item is the current page: plain text with `aria-current="page"`, not focusable. With `collapse` and more than four items, the trail shows the first item, an ellipsis button labelled `copy.expandLabel`, and the last two; activating the ellipsis replaces it with the hidden items (one-way; the trail does not re-collapse) and moves focus to the first revealed link. On narrow widths the trail wraps rather than truncating so every ancestor stays reachable.

## Content guidelines

Item labels are the page titles of the ancestors, shortened if they are long, and always in the same order as the site structure. The root item is the section or product name ("Docs", "Catalogue"), not "Home", unless the trail really starts at the home page. Do not repeat the current page's title in the trail if the page heading is directly below and the trail is long; but when in doubt, include it — the APG expects the current page as the last item.

## Accessibility

The breadcrumb is a `navigation` landmark with a name that distinguishes it from other navigations (WCAG 1.3.1, 2.4.8, APG breadcrumb). Items are in an ordered list so the count and order are announced. Ancestors are real links with visible underline and focus ring (2.4.4, 2.4.7); the current page carries `aria-current="page"` and is not a link, so users are not offered a link to where they already are. Separators are hidden from assistive technology (they are visual punctuation) and the ellipsis is a real button with an accessible name. Link, current and separator colors all meet 4.5:1 on the page background.

## Platform notes

### Web
Render `<nav aria-label={label}><ol>` with `<li>` per item. Ancestors render the system `Link` (`tone: default`, inheriting the nav's `fontSize`); the last renders `<span aria-current="page">`. Draw separators with `li + li::before { content: var(--ds-breadcrumb-separator) }` in `separatorColor`, so they are invisible to assistive technology. The ellipsis is the system `Button` (`ghost`, `size: sm`, `iconOnly`, `label: copy.expandLabel`, a three-dot glyph as `leadingIcon`). Call `onNavigate(item, index, event)` from the link's `onClick` before the default navigation; consumers routing client-side call `event.preventDefault()` on that event. Link and Button bring their own focus rings; Breadcrumb adds none.

### Lit
`<ds-breadcrumb .items=${items}>` renders the `<nav>`, list and `<ds-link>` elements in its shadow root. Landmarks inside shadow roots are exposed normally. Dispatch a composed `navigate` CustomEvent with `detail: { item, index }` from the inner link's click; consumers who route client-side call `preventDefault()` on the retargeted native click. Reflect `collapse`.

### React Native
Render a `View` with `flexDirection: 'row'`, `flexWrap: 'wrap'`, `accessibilityLabel={label}` and `role="navigation"` (semantic on react-native-web, ignored on native). Ancestors are the system `Link` nested in a `Text` at `fontSize` so they inherit it, with `onPress` calling `onNavigate(item, index)`; each item sits in a `View` with `minHeight: minTarget`. Focus after expanding goes to the revealed items' container via `setAccessibilityFocus` (hardware-keyboard focus cannot be moved to a Text link); the current page is `Text` in `currentColor` with `accessibilityState={{ selected: true }}`; separators are `Text` in `separatorColor` with `accessibilityElementsHidden` and `importantForAccessibility="no"`. The ellipsis is the system `Button` (`ghost`, `iconOnly`).

## Related

Link, Landmark, Heading, Stepper (planned).
