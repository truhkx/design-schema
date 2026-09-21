# Generate: Breadcrumb as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Breadcrumb.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Breadcrumb.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: BreadcrumbVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Breadcrumb.test.ts`.

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
      shape: '{ label: string; href?: string | undefined }[]'
      description: The trail from root to current page, in order. Every item but the
        last needs an `href`; an ancestor without one, or with an empty-string `href`,
        renders as plain text (never an empty link); a plain ancestor has no anatomy
        part of its own — it is text inside `item` (a `<span>` with no data-part and
        no class on web and Lit, a Text with no testID on native) and takes `itemColor`;
        it needs no selector of its own, since the `item` part already selects its
        container. It renders no interactive element, so activating it fires no `onNavigate`.
        The last is the current page and its `href` is ignored. An empty array renders
        the named landmark around an empty list; a single item renders only the current
        page; neither raises a dev warning. Lit starts the property as `[]`. Export
        the item type as `BreadcrumbItem`.
    label:
      type: string
      default: Breadcrumb
      description: 'Accessible name of the navigation landmark. Change it only if
        the page has another breadcrumb. `copy.navLabel` is the canonical string:
        the default is that copy key, not a second literal, so translating the copy
        block moves the default with it.'
      a11y: Rendered as aria-label on the nav so it is distinguished from other navigation
        landmarks.
    collapse:
      type: boolean
      default: true
      description: 'When there are more than four items, show the first, an ellipsis,
        and the last two; the ellipsis is a button that reveals the rest. The rule
        is literal: five items hide the second and third. Once revealed the trail
        stays expanded for the life of the instance, even if `items` changes. That
        state is deliberately private: no prop or event exposes it, so it cannot be
        observed, persisted or reset, and a remount collapses the trail again. Set
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
        separator is the `::before` of every item after the first, so it has no element,
        data-part, minTarget or focus hook of its own and this binding styles that
        pseudo-element; on native it is a Text with testID `Breadcrumb.separator`.
      locked: true
    gap:
      token: space.2
      part: list
      description: 'Applied twice, never as margins: as the list''s column gap between
        items, and as the gap inside each item between its leading separator and its
        content. The separator belongs to the item after it, so a wrapped line may
        start with a separator. The ellipsis sits in its own item like any other,
        so it carries a leading separator too and a collapsed trail reads `Docs /
        … / Breadcrumb / Keyboard`. Row gap between wrapped lines is none; the items''
        minTarget height spaces the lines. An override of `gap` applies in both places.'
      locked: false
    focusRing:
      token: color.border.focus
      part: item
      description: 'Only the focus-fallback item (the `<li>` given `tabindex="-1"`
        after expanding, web and Lit) draws it, as an outline under `:focus-visible`;
        Link and Button draw their own rings. Not applied on native, where that focus
        is screen-reader focus only. Locked bindings still get their --ds-breadcrumb-*
        hook on both web and Lit — locked means absent from the `overrides` type,
        not absent from CSS — so this ring stays reachable from consumer CSS. Native
        `:focus-visible` semantics are kept as they are: after a mouse press on the
        ellipsis the browser does not match the programmatically focused `<li>`, so
        no ring is drawn, and no `:focus` fallback is added to force one.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: item
      description: Outline width of the focus-fallback item ring; web and Lit only.
      locked: true
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
        each ancestor Link is wrapped in a Text (inside the `link` part's View) whose
        `overrides` receive fontSize, fontFamily, fontWeight and lineHeight (and any
        override of them), and plain ancestors, the current page and separators are
        Text at the same values, so the type is one value everywhere.
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
        inline on the nav from copy.separator as a quoted CSS string (`content` takes
        a string, so the value is written with its quotes, and a consumer overriding
        the hook from their own CSS must quote theirs), so the copy string lives in
        code and the separator is not in the accessibility tree at all. The ellipsis
        is the system Button (ghost, sm, iconOnly, leadingIcon the system Icon `ellipsis`)
        unchanged, inside `<span data-part="expand">` in its own `<li>`. Each ancestor
        Link sits inside `<span data-part="link">`; the `link` and `expand` spans
        set no display (they stay inline inside the item''s inline-flex row); Link
        keeps its own `data-part="anchor"`. `copy.current` is not rendered: aria-current="page"
        announces it. It is a native-only string, so the web and Lit COPY constants
        carry the other three and omit it rather than defining an unused one.'
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
        `copy.current` is not rendered and the Lit COPY constant omits it. The landmark
        role is asserted on web only; Lit tests cover the nav through the derived
        accessible-name scenario and do not assert role=navigation separately.'
    rn:
      element: View
      props:
      - role=navigation
      - accessibilityLabel
      notes: 'A horizontal, wrapping View with role="navigation" (semantic on react-native-web;
        no accessibilityRole value exists for it) labelled with `label`; ancestors
        are ds Links (Text with role link) whose onPress fires onNavigate, the current
        page is Text with accessibilityState={{ selected: true }} and accessibilityLabel
        ''<item.label>, <copy.current>'' (the current item''s own label, not the `label`
        prop; screen readers would otherwise say only "selected"). Separators are
        Text with importantForAccessibility="no" / accessibilityElementsHidden. The
        one root View is both the `nav` and `list` parts (testID `Breadcrumb`; there
        is no `Breadcrumb.nav` or `Breadcrumb.list`); items are Views with testID
        `Breadcrumb.item`, a View around the Text wrapping each Link carries `Breadcrumb.link`
        (neither Link nor the system Text takes a testID), so tests that activate
        the `link` part press the Link found by role link inside it, never the wrapper''s
        testID (a press does not travel down to the Link); separators `Breadcrumb.separator`,
        the current Text `Breadcrumb.current`, and a View around the ellipsis Button
        `Breadcrumb.expand`. The current page, plain ancestors and separators are
        the platform `Text`, not the system Text, because they need a testID, accessibilityState
        or accessibilityLabel that the system Text does not take and a colour it locks;
        composing the system Text is the rule everywhere it can carry those. `minTarget`
        is a minHeight on the item View, which is not itself pressable — the press
        target is the Link''s own Text at about its line height — so on native the
        24px floor is spacing between rows rather than a touch target; Link owns its
        target and Breadcrumb may not restyle it. Focus after expanding cannot be
        asserted in the RN test suite: findNodeHandle returns null under the test
        renderer, so setAccessibilityFocus is never reached even with the ref attached,
        and no behavior scenario covers it. Nothing else announces the reveal — there
        is no live region, the screen-reader focus move is the whole of it. Breadcrumbs
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
  - name: ancestor-without-href
    description: 'A level with no page of its own: it renders as plain text in the
      trail rather than an empty link, and activating it navigates nowhere.'
    given:
      items:
      - label: Docs
        href: /docs
      - label: Reference
      - label: Tokens
        href: /docs/reference/tokens
      - label: Color
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

- `onNavigate`: emit `navigate`
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
- `focusRing`: token `color.border.focus`; part `item`; locked
- `focusRingWidth`: token `border.width.focus`; part `item`; locked
- `fontFamily`: token `font.family.body`; part `nav`
- `fontSize`: token `font.size.sm`; part `nav`
- `fontWeight`: token `font.weight.regular`; part `nav`
- `lineHeight`: token `font.lineHeight.normal`; part `nav`
- `minTarget`: token `size.target.min`; part `item`; locked

## Constants and examples

- example `settings-trail`, story `SettingsTrail`: given `items: [{"label":"Settings","href":"/settings"},{"label":"Notifications","href":"/settings/notifications"},{"label":"Email digest"}]`; A short trail whose last item is the current page, rendered as text.
- example `deep-trail-collapsed`, story `DeepTrailCollapsed`: given `collapse: true`, `items: [{"label":"Docs","href":"/docs"},{"label":"Components","href":"/docs/components"},{"label":"Navigation","href":"/docs/components/navigation"},{"label":"Breadcrumb","href":"/docs/components/navigation/breadcrumb"},{"label":"Keyboard"}]`; A trail of more than four items, folded to the first, an ellipsis and the last two.
- example `always-in-full`, story `AlwaysInFull`: given `collapse: false`, `items: [{"label":"Catalogue","href":"/catalogue"},{"label":"Outdoor","href":"/catalogue/outdoor"},{"label":"Tents"}]`; A trail short enough that the ellipsis would only cost the reader a click.
- example `ancestor-without-href`, story `AncestorWithoutHref`: given `items: [{"label":"Docs","href":"/docs"},{"label":"Reference"},{"label":"Tokens","href":"/docs/reference/tokens"},{"label":"Color"}]`; A level with no page of its own: it renders as plain text in the trail rather than an empty link, and activating it navigates nowhere.
- example `second-breadcrumb-on-a-page`, story `SecondBreadcrumbOnAPage`: given `label: "Catalogue breadcrumb"`, `items: [{"label":"Catalogue","href":"/catalogue"},{"label":"Tents"}]`; A second trail, named so the two navigation landmarks are distinguishable.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `gap`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`
Locked (accessibility-bearing, never overridable): `currentColor`, `itemColor`, `separatorColor`, `focusRing`, `focusRingWidth`, `minTarget`

## Behavior scenarios (5)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-on-an-ancestor-reports-navigation
  description: Each ancestor is a Link that fires onNavigate, so a client-side router
    can intercept it. The test activates the first ancestor link and expects `(items[0],
    0)`.
  when:
    click: link
  then:
  - event: onNavigate
- name: the-last-item-is-the-current-page
  description: The last item is plain text carrying aria-current="page", never a link.
  then:
  - attribute: aria-current
    is: page
    'on': current
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

## Platform notes (lit)

```yaml
tag: ds-breadcrumb
reflect:
- prop: collapse
  attribute: no-collapse
notes: '`items` is a property (.items=${[...]}). The nav and list are rendered in
  the shadow root; the landmark is still exposed from inside a shadow root. `navigate`
  is a composed CustomEvent with detail { item, index, originalEvent }; calling preventDefault()
  on detail.originalEvent (the retargeted native click) cancels navigation, and so
  does preventDefault() on the `navigate` event itself (it also prevents the original
  click). The inner ds-button''s `press` is stopped so consumers see only `navigate`.
  Parts carry `part` and `data-part` with the anatomy names: `link` and `expand` on
  spans wrapping ds-link and ds-button; separators are `::before` pseudo-elements
  with no part. `copy.current` is not rendered and the Lit COPY constant omits it.
  The landmark role is asserted on web only; Lit tests cover the nav through the derived
  accessible-name scenario and do not assert role=navigation separately.'
```

## Guidance

## Overview

A breadcrumb answers "where am I?" and "how do I go up a level?" in one line. It is a secondary navigation: it never replaces the primary nav or the back button, and it shows the site's hierarchy, not the user's history.

## When to use

Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation, catalogues, settings sub-pages, file browsers — where the user benefits from seeing the ancestors and jumping to any of them. Place it above the page title, at the top of `main`.

## When not to use

Do not use a Breadcrumb on top-level pages or in flat sites; a single-item trail is noise. Do not use it to show history ("you came from Search"); that is what Back is for. Do not use it as a step indicator for a wizard (use Stepper, planned); steps are not places. Do not put actions in it.

## Behavior

Each ancestor is a Link that navigates on activation and fires `onNavigate` with the item first, so client-side routers can intercept. The last item is the current page: plain text with `aria-current="page"`, not focusable. With `collapse` and more than four items, the trail shows the first item, an ellipsis button labelled `copy.expandLabel`, and the last two; activating the ellipsis replaces it with the hidden items (one-way; the trail does not re-collapse, even when `items` changes) and moves focus to the first revealed item that is a link; if no revealed item has an `href`, focus goes to the first revealed item itself (`tabindex="-1"` on its `<li>` on web and Lit, set when focus moves and left in place afterwards, also across `items` changes, since it keeps the item out of the tab order), so focus never falls to the page. The revealed items are indices 1 through length − 3 of `items` as they were at the press, and the fallback is index 1; focus moves in the update that reveals them, so a later `items` change does not re-target it. The `tabindex` belongs to the position, not to the item that was focused: it stays on whichever item later occupies index 1, and if `items` shrinks below two entries it simply disappears with the element, with no warning and no re-targeting. On narrow widths the trail wraps rather than truncating so every ancestor stays reachable.

## Content guidelines

Item labels are the page titles of the ancestors, shortened if they are long, and always in the same order as the site structure. The root item is the section or product name ("Docs", "Catalogue"), not "Home", unless the trail really starts at the home page. Do not repeat the current page's title in the trail if the page heading is directly below and the trail is long; but when in doubt, include it — the APG expects the current page as the last item.

## Accessibility

The breadcrumb is a `navigation` landmark with a name that distinguishes it from other navigations (WCAG 1.3.1, 2.4.8, APG breadcrumb). Items are in an ordered list so the count and order are announced. Ancestors are real links with visible underline and focus ring (2.4.4, 2.4.7); the current page carries `aria-current="page"` and is not a link, so users are not offered a link to where they already are. Separators are hidden from assistive technology (they are visual punctuation) and the ellipsis is a real button with an accessible name. Link, current and separator colors all meet 4.5:1 on the page background. `focus-visible` and `keyboard-operable` are satisfied on web, Lit and react-native-web, where the ancestors are real anchors; on native there is no focus ring and hardware-keyboard focus cannot reach a Text-based link, so the trail is reachable there through screen-reader navigation and the navigation stack instead.

## Platform notes

### Web
Render `<nav aria-label={label}><ol>` with `<li>` per item. Ancestors render the system `Link` (`tone: default`, inheriting the nav's `fontSize`); the last renders `<span aria-current="page">`. The `link` and `expand` wrapper spans set no display, so they stay inline in the item's inline-flex row. Draw separators with `li + li::before { content: var(--ds-breadcrumb-separator) }` in `separatorColor`, so they are invisible to assistive technology. The ellipsis is the system `Button` (`ghost`, `size: sm`, `iconOnly`, `label: copy.expandLabel`, the system `Icon` named `ellipsis` as `leadingIcon`). Call `onNavigate(item, index, event)` from the link's `onClick` before the default navigation; consumers routing client-side return `false` or call `event.preventDefault()` on that event. Link and Button bring their own focus rings; Breadcrumb adds one only for the focus-fallback `<li>`: an outline of `focusRingWidth` in `focusRing` under `:focus-visible` (Lit does the same).

### Lit
`<ds-breadcrumb .items=${items}>` renders the `<nav>`, list and `<ds-link>` elements in its shadow root. Landmarks inside shadow roots are exposed normally. Dispatch a composed `navigate` CustomEvent with `detail: { item, index, originalEvent }` from the inner link's click; consumers who route client-side call `preventDefault()` on `detail.originalEvent`. `collapse` defaults to true, so it reflects as the negated attribute `no-collapse` — a bare boolean attribute cannot express false in static HTML.

### React Native
Render a `View` with `flexDirection: 'row'`, `flexWrap: 'wrap'`, `accessibilityLabel={label}` and `role="navigation"` (semantic on react-native-web, ignored on native). Ancestors are the system `Link` nested in a `Text` whose `overrides` receive `fontSize`, `fontFamily`, `fontWeight` and `lineHeight` so the Link inherits them, with `onPress` calling `onNavigate(item, index)`; each item sits in a row `View` with `minHeight: minTarget` and `gap` between its separator and content, and the root row uses `columnGap: gap`. Focus after expanding goes to the first revealed item's `View` (index 1) via `setAccessibilityFocus`, whether that item is a Link or plain Text. This moves screen-reader focus only: hardware-keyboard focus cannot be moved to a Text link or a View on native, so keyboard users continue from the ellipsis position with Tab, and no focus ring is drawn; the current page is `Text` in `currentColor` with `accessibilityState={{ selected: true }}` and `copy.current` appended to its label; separators are `Text` in `separatorColor` with `accessibilityElementsHidden` and `importantForAccessibility="no"`. The ellipsis is the system `Button` (`ghost`, `size: sm`, `iconOnly`) with the `ellipsis` Icon passed through Button's own icon prop; Button does not colour its icon slots, so the Icon takes `color` = `color.action.ghost.foreground` explicitly.

## Related

Link, Landmark, Heading, Stepper (planned).
