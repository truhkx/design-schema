---
title: Breadcrumb
description: Shows where the current page sits in the hierarchy and links back up to each ancestor. The last item is the current page and is not a link.
component:
  name: Breadcrumb
  category: navigation
  status: review
  apg: breadcrumb
  anatomy: [nav, list, item, link, separator, current, expand]
  composition:
    link: { component: Link, props: { tone: default } }
    expand: { component: Button, props: { variant: ghost, size: sm, iconOnly: true } }
  props:
    items:
      type: array
      required: true
      shape: '{ label: string; href?: string | undefined }[]'
      description: 'The trail from root to current page, in order. Every item but the last needs an `href`; an ancestor without one, or with an empty-string `href`, renders as plain text (never an empty link); a plain ancestor has no anatomy part of its own — it is text inside `item` (a `<span>` with no data-part on web and Lit, a Text with no testID on native) and takes `itemColor`. The last is the current page and its `href` is ignored. An empty array renders the named landmark around an empty list; a single item renders only the current page; neither raises a dev warning. Lit starts the property as `[]`. Export the item type as `BreadcrumbItem`.'
    label:
      type: string
      default: Breadcrumb
      description: Accessible name of the navigation landmark. Change it only if the page has another breadcrumb.
      a11y: Rendered as aria-label on the nav so it is distinguished from other navigation landmarks.
    collapse:
      type: boolean
      default: true
      description: 'When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis is a button that reveals the rest. The rule is literal: five items hide the second and third. Once revealed the trail stays expanded for the life of the instance, even if `items` changes. Set false for short trails that must always show in full.'
  events:
    onNavigate:
      description: 'Fired when a non-current item is activated, as `(item, index, event)` on web and `(item, index)` on native, where there is no event. On web the link still navigates unless the handler returns `false` or calls `event.preventDefault()`. On Lit, `preventDefault()` on the `navigate` CustomEvent or on `detail.originalEvent` both cancel (the first also prevents the original click). On native the handler is passed to Link as `onPress` and typed `boolean | void`: it is the navigation, so returning `false` has nothing to cancel (Breadcrumb links are never `external`); without a handler the Link falls back to Linking.openURL.'
      platforms: { web: onNavigate, lit: navigate, rn: onNavigate, swiftui: onNavigate }
      cancelable: true
      fires: [user]
  styles:
    currentColor: { token: color.foreground, part: current, description: 'The current page, rendered as text with aria-current, in the regular weight.' }
    itemColor: { token: color.foreground.muted, part: item, description: 'Set on the item (the `<li>` on web and Lit), so it reaches an ancestor without `href` rendered as plain text (a level that has no page of its own); the Link and the current page set their own colours over it. On native, where colour does not inherit through a View, the plain ancestor Text takes it directly.' }
    separatorColor: { token: color.foreground.muted, part: separator, description: 'A slash or chevron between items, aria-hidden. On web and Lit the separator is the `::before` of every item after the first, so it has no element or data-part of its own and this binding styles that pseudo-element; on native it is a Text with testID `Breadcrumb.separator`.' }
    gap: { token: space.2, part: list, description: 'Applied twice, never as margins: as the list''s column gap between items, and as the gap inside each item between its leading separator and its content. The separator belongs to the item after it, so a wrapped line may start with a separator. The ellipsis sits in its own item like any other. Row gap between wrapped lines is none; the items'' minTarget height spaces the lines. An override of `gap` applies in both places.' }
    focusRing: { token: color.border.focus, part: item, description: 'Only the focus-fallback item (the `<li>` given `tabindex="-1"` after expanding, web and Lit) draws it, as an outline under `:focus-visible`; Link and Button draw their own rings. Not applied on native, where that focus is screen-reader focus only.' }
    focusRingWidth: { token: border.width.focus, part: item, description: 'Outline width of the focus-fallback item ring; web and Lit only.' }
    fontFamily: { token: font.family.body, part: nav, description: 'Set on the nav and inherited on web and Lit; on native forwarded like fontSize.' }
    fontSize: { token: font.size.sm, part: nav, description: 'Set on the nav; the Links inherit it on web and Lit. On native each ancestor Link is wrapped in a Text (inside the `link` part''s View) whose `overrides` receive fontSize, fontFamily, fontWeight and lineHeight (and any override of them), and plain ancestors, the current page and separators are Text at the same values, so the type is one value everywhere.' }
    fontWeight: { token: font.weight.regular, part: nav, description: 'Set on the nav and inherited on web and Lit; on native forwarded like fontSize.' }
    lineHeight: { token: font.lineHeight.normal, part: nav, description: 'Set on the nav and inherited on web and Lit; on native forwarded like fontSize.' }
    minTarget: { token: size.target.min, part: item, description: 'Each item reaches 24px tall via min-height on the list item, not on the inline Link.' }
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
      notes: '<nav aria-label> containing an <ol> of <li>; each ancestor is a ds Link, the last item is a <span aria-current="page">. Separators are CSS-generated (li + li::before) from the custom property --ds-breadcrumb-separator, set inline on the nav from copy.separator, so the copy string lives in code and the separator is not in the accessibility tree at all. The ellipsis is the system Button (ghost, sm, iconOnly, leadingIcon the system Icon `ellipsis`) unchanged, inside `<span data-part="expand">` in its own `<li>`. Each ancestor Link sits inside `<span data-part="link">`; the `link` and `expand` spans set no display (they stay inline inside the item''s inline-flex row); Link keeps its own `data-part="anchor"`. `copy.current` is not rendered: aria-current="page" announces it.'
    lit:
      tag: ds-breadcrumb
      reflect: [{ prop: collapse, attribute: no-collapse }]
      notes: '`items` is a property (.items=${[...]}). The nav and list are rendered in the shadow root; the landmark is still exposed from inside a shadow root. `navigate` is a composed CustomEvent with detail { item, index, originalEvent }; calling preventDefault() on detail.originalEvent (the retargeted native click) cancels navigation, and so does preventDefault() on the `navigate` event itself (it also prevents the original click). The inner ds-button''s `press` is stopped so consumers see only `navigate`. Parts carry `part` and `data-part` with the anatomy names: `link` and `expand` on spans wrapping ds-link and ds-button; separators are `::before` pseudo-elements with no part. `copy.current` is not rendered. The landmark role is asserted on web only; Lit tests cover the nav through the derived accessible-name scenario and do not assert role=navigation separately.'
    rn:
      element: View
      props: [role=navigation, accessibilityLabel]
      notes: 'A horizontal, wrapping View with role="navigation" (semantic on react-native-web; no accessibilityRole value exists for it) labelled with `label`; ancestors are ds Links (Text with role link) whose onPress fires onNavigate, the current page is Text with accessibilityState={{ selected: true }} and accessibilityLabel ''<item.label>, <copy.current>'' (the current item''s own label, not the `label` prop; screen readers would otherwise say only "selected"). Separators are Text with importantForAccessibility="no" / accessibilityElementsHidden. The one root View is both the `nav` and `list` parts (testID `Breadcrumb`; there is no `Breadcrumb.nav` or `Breadcrumb.list`); items are Views with testID `Breadcrumb.item`, a View around the Text wrapping each Link carries `Breadcrumb.link` (neither Link nor the system Text takes a testID), so tests that activate the `link` part press the Link found by role link inside it, never the wrapper''s testID (a press does not travel down to the Link); separators `Breadcrumb.separator`, the current Text `Breadcrumb.current`, and a View around the ellipsis Button `Breadcrumb.expand`. Breadcrumbs are rare on native — most screens rely on the navigation stack — and are provided mainly for tablet and react-native-web layouts.'
    swiftui:
      element: HStack
      props: [.accessibilityElement=contain, .accessibilityLabel, Link, Icon, .accessibilityAddTraits=isSelected, ViewThatFits]
      notes: 'An `HStack` (wrapping `FlowLayout` when items overflow) inside `.accessibilityElement(children: .contain)` labelled `copy.navLabel`; items are `Link`s with the `chevron-right` Icon (hidden) between; the current item is a `Text` with `.isSelected` plus `copy.current` in its label. `collapse` folds the middle items behind an ellipsis Button that expands them in place.'
  behavior:
    # Authored scenarios; the parser adds renders/accessible-name ones from the schema.
    - name: click-on-an-ancestor-reports-navigation
      description: 'Each ancestor is a Link that fires onNavigate, so a client-side router can intercept it. The test activates the first ancestor link and expects `(items[0], 0)`.'
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

Each ancestor is a Link that navigates on activation and fires `onNavigate` with the item first, so client-side routers can intercept. The last item is the current page: plain text with `aria-current="page"`, not focusable. With `collapse` and more than four items, the trail shows the first item, an ellipsis button labelled `copy.expandLabel`, and the last two; activating the ellipsis replaces it with the hidden items (one-way; the trail does not re-collapse, even when `items` changes) and moves focus to the first revealed item that is a link; if no revealed item has an `href`, focus goes to the first revealed item itself (`tabindex="-1"` on its `<li>` on web and Lit, set when focus moves and left in place afterwards, also across `items` changes, since it keeps the item out of the tab order), so focus never falls to the page. The revealed items are indices 1 through length − 3 of `items` as they were at the press, and the fallback is index 1; focus moves in the update that reveals them, so a later `items` change does not re-target it. On narrow widths the trail wraps rather than truncating so every ancestor stays reachable.

## Content guidelines

Item labels are the page titles of the ancestors, shortened if they are long, and always in the same order as the site structure. The root item is the section or product name ("Docs", "Catalogue"), not "Home", unless the trail really starts at the home page. Do not repeat the current page's title in the trail if the page heading is directly below and the trail is long; but when in doubt, include it — the APG expects the current page as the last item.

## Accessibility

The breadcrumb is a `navigation` landmark with a name that distinguishes it from other navigations (WCAG 1.3.1, 2.4.8, APG breadcrumb). Items are in an ordered list so the count and order are announced. Ancestors are real links with visible underline and focus ring (2.4.4, 2.4.7); the current page carries `aria-current="page"` and is not a link, so users are not offered a link to where they already are. Separators are hidden from assistive technology (they are visual punctuation) and the ellipsis is a real button with an accessible name. Link, current and separator colors all meet 4.5:1 on the page background.

## Platform notes

### Web
Render `<nav aria-label={label}><ol>` with `<li>` per item. Ancestors render the system `Link` (`tone: default`, inheriting the nav's `fontSize`); the last renders `<span aria-current="page">`. The `link` and `expand` wrapper spans set no display, so they stay inline in the item's inline-flex row. Draw separators with `li + li::before { content: var(--ds-breadcrumb-separator) }` in `separatorColor`, so they are invisible to assistive technology. The ellipsis is the system `Button` (`ghost`, `size: sm`, `iconOnly`, `label: copy.expandLabel`, the system `Icon` named `ellipsis` as `leadingIcon`). Call `onNavigate(item, index, event)` from the link's `onClick` before the default navigation; consumers routing client-side return `false` or call `event.preventDefault()` on that event. Link and Button bring their own focus rings; Breadcrumb adds one only for the focus-fallback `<li>`: an outline of `focusRingWidth` in `focusRing` under `:focus-visible` (Lit does the same).

### Lit
`<ds-breadcrumb .items=${items}>` renders the `<nav>`, list and `<ds-link>` elements in its shadow root. Landmarks inside shadow roots are exposed normally. Dispatch a composed `navigate` CustomEvent with `detail: { item, index, originalEvent }` from the inner link's click; consumers who route client-side call `preventDefault()` on `detail.originalEvent`. `collapse` defaults to true, so it reflects as the negated attribute `no-collapse` — a bare boolean attribute cannot express false in static HTML.

### React Native
Render a `View` with `flexDirection: 'row'`, `flexWrap: 'wrap'`, `accessibilityLabel={label}` and `role="navigation"` (semantic on react-native-web, ignored on native). Ancestors are the system `Link` nested in a `Text` whose `overrides` receive `fontSize`, `fontFamily`, `fontWeight` and `lineHeight` so the Link inherits them, with `onPress` calling `onNavigate(item, index)`; each item sits in a row `View` with `minHeight: minTarget` and `gap` between its separator and content, and the root row uses `columnGap: gap`. Focus after expanding goes to the first revealed item's `View` (index 1) via `setAccessibilityFocus`, whether that item is a Link or plain Text. This moves screen-reader focus only: hardware-keyboard focus cannot be moved to a Text link or a View on native, so keyboard users continue from the ellipsis position with Tab, and no focus ring is drawn; the current page is `Text` in `currentColor` with `accessibilityState={{ selected: true }}` and `copy.current` appended to its label; separators are `Text` in `separatorColor` with `accessibilityElementsHidden` and `importantForAccessibility="no"`. The ellipsis is the system `Button` (`ghost`, `size: sm`, `iconOnly`) with the `ellipsis` Icon passed through Button's own icon prop; Button does not colour its icon slots, so the Icon takes `color` = `color.action.ghost.foreground` explicitly.

## Related

Link, Landmark, Heading, Stepper (planned).
