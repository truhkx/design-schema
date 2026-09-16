# Generate: Breadcrumb for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Breadcrumb.tsx` exporting a typed React function component named `Breadcrumb`, plus `Breadcrumb.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Breadcrumb({ ref, …rest }: BreadcrumbProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Breadcrumb> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Breadcrumb.test.tsx`.
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
  styles:
    currentColor:
      token: color.foreground
      description: The current page, rendered as text with aria-current, in the regular
        weight.
      locked: true
    itemColor:
      token: color.foreground.muted
      description: An ancestor item without `href`, rendered as plain text (a level
        that has no page of its own).
      locked: true
    separatorColor:
      token: color.foreground.muted
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
      - collapse
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `gap`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`
Locked (accessibility-bearing, never overridable): `currentColor`, `itemColor`, `separatorColor`, `minTarget`

## Behavior scenarios (2)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (web)

```yaml
element: nav
attributes:
- aria-label
- aria-current
notes: <nav aria-label> containing an <ol> of <li>; each ancestor is a ds Link, the
  last item is a <span aria-current="page">. Separators are CSS-generated (li + li::before)
  from the custom property --ds-breadcrumb-separator, set inline on the nav from copy.separator,
  so the copy string lives in code and the separator is not in the accessibility tree
  at all. The ellipsis is the system Button (ghost, sm, iconOnly) unchanged.
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
`<ds-breadcrumb .items=${items}>` renders the `<nav>`, list and `<ds-link>` elements in its shadow root. Landmarks inside shadow roots are exposed normally. Dispatch a composed `navigate` CustomEvent with `detail: { item, index }` from the inner link's click; consumers who route client-side call `preventDefault()` on the retargeted native click. Reflect `collapse`.

### React Native
Render a `View` with `flexDirection: 'row'`, `flexWrap: 'wrap'`, `accessibilityLabel={label}` and `role="navigation"` (semantic on react-native-web, ignored on native). Ancestors are the system `Link` nested in a `Text` at `fontSize` so they inherit it, with `onPress` calling `onNavigate(item, index)`; each item sits in a `View` with `minHeight: minTarget`. Focus after expanding goes to the revealed items' container via `setAccessibilityFocus` (hardware-keyboard focus cannot be moved to a Text link); the current page is `Text` in `currentColor` with `accessibilityState={{ selected: true }}`; separators are `Text` in `separatorColor` with `accessibilityElementsHidden` and `importantForAccessibility="no"`. The ellipsis is the system `Button` (`ghost`, `iconOnly`).

## Related

Link, Landmark, Heading, Stepper (planned).
