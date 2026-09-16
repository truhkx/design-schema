# Generate: Breadcrumb for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Breadcrumb.tsx` exporting a typed React Native function component named `Breadcrumb`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `BreadcrumbProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger and at least three focusable children, for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Breadcrumb> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Breadcrumb.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
  composition:
    link: Link
  props:
    items:
      type: array
      required: true
      shape: '{ label: string; href?: string }[]'
      description: The trail from root to current page, in order. Every item but the
        last needs an `href`; an ancestor without one renders as plain text (never
        an empty link). The last is the current page and its `href` is ignored. Export
        the item type as `BreadcrumbItem`.
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
      description: When there are more than four items, show the first, an ellipsis,
        and the last two; the ellipsis is a button that reveals the rest. Set false
        for short trails that must always show in full.
  events:
    onNavigate:
      description: Fired when a non-current item is activated, as `(item, index, event)`.
        On web the link still navigates unless the consumer calls `event.preventDefault()`;
        on native there is no event, the handler is the navigation, and without one
        the Link falls back to Linking.openURL.
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
      description: An ancestor item without `href`, rendered as plain text (a level
        that has no page of its own).
      locked: true
    separatorColor:
      token: color.foreground.muted
      part: separator
      description: A slash or chevron between items, aria-hidden.
      locked: true
    gap:
      token: space.2
      description: Gap on both sides of the separator.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.sm
      description: Set on the nav; the Links inherit it on web. On native each ancestor
        Link is wrapped in a Text whose `overrides.fontSize` receives this binding
        (and any override of it), so the size is one value everywhere.
      locked: false
    fontWeight:
      token: font.weight.regular
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.min
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
      notes: <nav aria-label> containing an <ol> of <li>; each ancestor is a ds Link,
        the last item is a <span aria-current="page">. Separators are CSS-generated
        (li + li::before) from the custom property --ds-breadcrumb-separator, set
        inline on the nav from copy.separator, so the copy string lives in code and
        the separator is not in the accessibility tree at all. The ellipsis is the
        system Button (ghost, sm, iconOnly) unchanged.
    lit:
      tag: ds-breadcrumb
      reflect:
      - prop: collapse
        attribute: no-collapse
      notes: '`items` is a property (.items=${[...]}). The nav and list are rendered
        in the shadow root; the landmark is still exposed from inside a shadow root.
        `navigate` is a composed CustomEvent with detail { item, index, originalEvent
        }; calling preventDefault() on detail.originalEvent (the retargeted native
        click) cancels navigation. The inner ds-button''s `press` is stopped so consumers
        see only `navigate`.'
    rn:
      element: View
      props:
      - role=navigation
      - accessibilityLabel
      notes: 'A horizontal, wrapping View with role="navigation" (semantic on react-native-web;
        no accessibilityRole value exists for it) labelled with `label`; ancestors
        are ds Links (Text with role link) whose onPress fires onNavigate, the current
        page is Text with accessibilityState={{ selected: true }}. Separators are
        Text with importantForAccessibility="no" / accessibilityElementsHidden. Breadcrumbs
        are rare on native — most screens rely on the navigation stack — and are provided
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
      can intercept it.
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

## Style bindings

- `currentColor`: token `color.foreground`; part `current`; locked
- `itemColor`: token `color.foreground.muted`; part `item`; locked
- `separatorColor`: token `color.foreground.muted`; part `separator`; locked

## Constants and examples

- example `settings-trail`, story `SettingsTrail`: given `items: [{"label":"Settings","href":"/settings"},{"label":"Notifications","href":"/settings/notifications"},{"label":"Email digest"}]`; A short trail whose last item is the current page, rendered as text.
- example `deep-trail-collapsed`, story `DeepTrailCollapsed`: given `collapse: true`, `items: [{"label":"Docs","href":"/docs"},{"label":"Components","href":"/docs/components"},{"label":"Navigation","href":"/docs/components/navigation"},{"label":"Breadcrumb","href":"/docs/components/navigation/breadcrumb"},{"label":"Keyboard"}]`; A trail of more than four items, folded to the first, an ellipsis and the last two.
- example `always-in-full`, story `AlwaysInFull`: given `collapse: false`, `items: [{"label":"Catalogue","href":"/catalogue"},{"label":"Outdoor","href":"/catalogue/outdoor"},{"label":"Tents"}]`; A trail short enough that the ellipsis would only cost the reader a click.
- example `second-breadcrumb-on-a-page`, story `SecondBreadcrumbOnAPage`: given `label: "Catalogue breadcrumb"`, `items: [{"label":"Catalogue","href":"/catalogue"},{"label":"Tents"}]`; A second trail, named so the two navigation landmarks are distinguishable.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `gap`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`
Locked (accessibility-bearing, never overridable): `currentColor`, `itemColor`, `separatorColor`, `minTarget`

## Behavior scenarios (4)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-on-an-ancestor-reports-navigation
  description: Each ancestor is a Link that fires onNavigate, so a client-side router
    can intercept it.
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

## Platform notes (rn)

```yaml
element: View
props:
- role=navigation
- accessibilityLabel
notes: "A horizontal, wrapping View with role=\"navigation\" (semantic on react-native-web;\
  \ no accessibilityRole value exists for it) labelled with `label`; ancestors are\
  \ ds Links (Text with role link) whose onPress fires onNavigate, the current page\
  \ is Text with accessibilityState={{ selected: true }}. Separators are Text with\
  \ importantForAccessibility=\"no\" / accessibilityElementsHidden. Breadcrumbs are\
  \ rare on native \u2014 most screens rely on the navigation stack \u2014 and are\
  \ provided mainly for tablet and react-native-web layouts."
```

## Guidance

## Overview

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
`<ds-breadcrumb .items=${items}>` renders the `<nav>`, list and `<ds-link>` elements in its shadow root. Landmarks inside shadow roots are exposed normally. Dispatch a composed `navigate` CustomEvent with `detail: { item, index, originalEvent }` from the inner link's click; consumers who route client-side call `preventDefault()` on `detail.originalEvent`. `collapse` defaults to true, so it reflects as the negated attribute `no-collapse` — a bare boolean attribute cannot express false in static HTML.

### React Native
Render a `View` with `flexDirection: 'row'`, `flexWrap: 'wrap'`, `accessibilityLabel={label}` and `role="navigation"` (semantic on react-native-web, ignored on native). Ancestors are the system `Link` nested in a `Text` at `fontSize` so they inherit it, with `onPress` calling `onNavigate(item, index)`; each item sits in a `View` with `minHeight: minTarget`. Focus after expanding goes to the revealed items' container via `setAccessibilityFocus` (hardware-keyboard focus cannot be moved to a Text link); the current page is `Text` in `currentColor` with `accessibilityState={{ selected: true }}`; separators are `Text` in `separatorColor` with `accessibilityElementsHidden` and `importantForAccessibility="no"`. The ellipsis is the system `Button` (`ghost`, `iconOnly`).

## Related

Link, Landmark, Heading, Stepper (planned).
