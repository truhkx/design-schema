# Generate: Heading as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Heading.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Heading.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: HeadingVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Heading.test.ts`.

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
  name: Heading
  category: typography
  status: review
  anatomy:
  - text
  props:
    level:
      type: enum
      values:
      - '1'
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      required: true
      description: 'Position in the document outline. Controls the semantic element,
        not the visual size. Canonical values are strings; generated components also
        accept the number — the exported `HeadingLevel` type is the string union,
        and the prop or property type adds `1 | 2 | 3 | 4 | 5 | 6`. A missing, out-of-range
        or non-numeric level (untyped JavaScript, `level="7"`) is treated as `2` on
        every platform: an <h2> on web and Lit, the 3xl default size everywhere, and
        one development warning per element for its lifetime. The warning is developer-facing,
        not copy, so it has no copy key; it names the received value and the level-2
        fallback (`Heading: level 7 is not one of 1–6; rendering as level 2.`), printing
        the value as `String(level)`, so a missing level reads `level undefined`.
        The warning is issued once per element whatever later values arrive (a later,
        different invalid value does not warn again), and on web from an effect behind
        a ref guard rather than during render, so StrictMode cannot send it twice.
        Behavior scenarios take only canonical values, so each platform''s own test
        file covers a numeric level and the fallback with its single warning; neither
        gets a story. On Lit the property holds `undefined` until set, and the fallback
        renders. The Default story renders level `2` with "Account settings" and no
        other args.'
      a11y: Screen-reader users navigate by heading level; levels must not skip (h1
        → h3).
    size:
      type: enum
      enumRef: size
      values:
      - 4xl
      - 3xl
      - 2xl
      - xl
      - lg
      - md
      description: 'Visual size, independent of level. There is no single default;
        the default is read from `level` by this exact map — 1 → 4xl, 2 → 3xl, 3 →
        2xl, 4 → xl, 5 → lg, 6 → md — and an explicit `size` always wins over it.
        On Lit the resolved default is never written back to the `size` attribute,
        so `[size]` selectors match only explicit sizes; web exposes no size attribute
        at all, only the `ds-heading--size-*` modifier class, which carries the resolved
        size. Heading takes the large end of the shared size vocabulary; the exported
        type is its own, since Text takes the small end. Enum stories keep the literal
        `<Prop><Value>` casing: `Size4xl`, `Size2xl`, `Level1`.'
    children:
      type: content
      required: true
      description: The heading text. Keep it short and descriptive; it is what appears
        in the page outline.
    align:
      type: enum
      values:
      - start
      - center
      - end
      default: start
      description: Horizontal text alignment. It has no style binding on purpose —
        alignment is a layout choice, not a themed value — so it maps straight to
        the platform's text-align. `start` and `end` are logical on web and Lit; React
        Native has no logical values and resolves them through I18nManager.isRTL at
        render, so a writing-direction change mid-session does not re-align an already-rendered
        heading, the same limit Text has. The value set is Text's, so every platform
        reuses Text's exported `TextAlign` type and exports no separate HeadingAlign,
        with no deprecated alias; Text exports no mapping helper on web or Lit, so
        Heading keeps its own `ds-heading--align-*` classes there and its own `:host([align])`
        selectors on Lit. On web every value, `start` included, emits its `ds-heading--align-<value>`
        class.
  styles:
    fontFamily:
      token: font.family.heading
      locked: false
    fontWeight:
      token: font.weight.semibold
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    lineHeight:
      token: font.lineHeight.tight
      locked: false
    color:
      token: color.foreground.strong
      description: 'Locked by the AAA pair, so it has no `--ds-heading-color` hook:
        the rule reads `var(--color-foreground-strong)` directly and consumer CSS
        has no hook to break the pair with.'
      locked: true
    marginBlockEnd:
      token: space.sm
      description: 'Space below the heading (marginBottom on React Native — the one
        margin the system allows, because a heading owns the gap to its own first
        paragraph). It is unconditional: a container that owns its own rhythm turns
        it off with `overrides={{ marginBlockEnd: ''space.0'' }}`, as Table does.
        That override is written out as a margin of 0, never omitted.'
      locked: false
  a11y:
    role: heading
    requires:
    - heading-hierarchy
    - contrast-aaa
    contrast:
    - foreground: color.foreground.strong
      background: color.background
      level: AAA
  platforms:
    web:
      element: h1–h6
      attributes: []
      notes: 'The element is chosen by `level`. Never use `role="heading"` on a div
        when a real heading element is available. The root is the `text` part and
        carries `data-part="text"` beside `data-ds="Heading"` — on web and Lit one
        element takes both hooks. On web `data-part` is written before `...rest`,
        so a composing parent can relabel it as it does Box; `data-ds` is written
        after. Heading does not compose Text: it owns its five typography bindings
        because Text cannot carry the header semantics, the heading sizes or a margin.
        `contrast-aaa` and `heading-hierarchy` have nothing to implement here — the
        first is a property of the locked token pair and the second is a property
        of the page; both are checked by the build, not by the component. The user-agent
        top margin of h1–h6 is reset to `margin-block-start: 0` — a reset of a browser
        default, not a binding, since marginBlockEnd is the one margin Heading owns.'
    lit:
      tag: ds-heading
      reflect:
      - level
      - size
      - align
      notes: 'Renders the matching <h1>–<h6> inside the shadow root, carrying `part="text"`
        and `data-part="text"` — the anatomy name, not `heading`. Headings inside
        shadow roots are exposed to assistive technology normally; some in-page outline
        tools do not see them, and the component does nothing about that. `level`
        is required, but an element always renders: with the attribute absent or invalid
        it falls back to <h2> and warns once per element, for the element''s lifetime,
        in development. Sizes are attribute selectors on the reflected `level` and
        `size` setting `--ds-heading-font-size`, with the `[size]` rules declared
        after the `[level]` defaults so an explicit size wins at equal specificity;
        with `level` absent or invalid no `[level]` rule matches, so the 3xl fallback
        size is the `:host` default of `--ds-heading-font-size`. Non-interactive,
        so no delegatesFocus and no focus styling.'
    rn:
      element: Text
      props:
      - accessibilityRole=header
      notes: 'iOS and Android have no heading levels. `level` maps only to typography;
        the header trait is set regardless of level. Document the outline in the screen''s
        design instead. Heading renders the platform Text directly rather than composing
        the system Text, which carries no header role, no heading sizes and no margin.
        The root is both the component and its only part, so it carries `testID="Heading"`
        and there is no `Heading.text`: a part that is the root keeps the root hook.
        The ref is `Ref<TextInstance>`. Heading provides `TextStyleContext` ({ fontSize,
        color, nested: true }), the context Text.tsx exports, imported from there
        rather than declared again, with its own resolved size and colour, as Text
        does, so an inline Icon or Link inside it matches the heading. The header
        role is the `accessibilityRole="header"` prop, not the `role` prop, and no
        `aria-level` is passed: react-native-web previews therefore show every Heading
        as an <h1>, a Storybook-only effect accepted because native has no levels.'
    swiftui:
      element: Text
      props:
      - .accessibilityAddTraits=isHeader
      - .accessibilityHeading
      - .font
      - .fontWeight
      notes: A `Text` with `.accessibilityAddTraits(.isHeader)` and `.accessibilityHeading(.h1…h6)`
        from `level` — VoiceOver's rotor lists headings by level, so the outline is
        real on iOS. Size from the `size` binding through `@ScaledMetric`; `level`
        never changes the look. `element` is ignored.
  behavior:
  - name: level-puts-the-heading-in-the-outline
    description: On web the semantic element is always a real <h1>-<h6> chosen from
      level, so the heading is in the accessibility tree screen-reader users navigate
      by.
    given:
      level: '3'
    then:
    - role: heading
      platforms:
      - web
      - lit
    - attribute: accessibilityRole
      is: header
      platforms:
      - rn
  - name: size-does-not-change-the-outline
    description: Decoupling level from size is the whole point of this component -
      a heading at the smallest size is still a heading.
    given:
      level: '2'
      size: md
    then:
    - role: heading
      platforms:
      - web
      - lit
    - attribute: accessibilityRole
      is: header
      platforms:
      - rn
  examples:
  - name: page-title
    description: The one level-1 heading on a page, at its default size.
    given:
      level: '1'
      children: Account settings
  - name: section-heading
    description: A major section of the page, one level below the title.
    given:
      level: '2'
      children: Billing
  - name: subsection-sized-up
    description: A level-4 heading given a larger size so it still reads as a section
      start in a wide layout.
    given:
      level: '4'
      size: xl
      children: Payment methods
```

## Constants and examples

- example `page-title`, story `PageTitle`: given `level: "1"`, `children: "Account settings"`; The one level-1 heading on a page, at its default size.
- example `section-heading`, story `SectionHeading`: given `level: "2"`, `children: "Billing"`; A major section of the page, one level below the title.
- example `subsection-sized-up`, story `SubsectionSizedUp`: given `level: "4"`, `size: "xl"`, `children: "Payment methods"`; A level-4 heading given a larger size so it still reads as a section start in a wide layout.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`, `marginBlockEnd`
Locked (accessibility-bearing, never overridable): `color`

## Behavior scenarios (18)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: level-puts-the-heading-in-the-outline
  description: On web the semantic element is always a real <h1>-<h6> chosen from
    level, so the heading is in the accessibility tree screen-reader users navigate
    by.
  given:
    level: '3'
  then:
  - role: heading
- name: size-does-not-change-the-outline
  description: Decoupling level from size is the whole point of this component - a
    heading at the smallest size is still a heading.
  given:
    level: '2'
    size: md
  then:
  - role: heading
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-level-1
  given:
    level: '1'
  then:
  - renders: true
  derived: true
- name: renders-level-2
  given:
    level: '2'
  then:
  - renders: true
  derived: true
- name: renders-level-3
  given:
    level: '3'
  then:
  - renders: true
  derived: true
- name: renders-level-4
  given:
    level: '4'
  then:
  - renders: true
  derived: true
- name: renders-level-5
  given:
    level: '5'
  then:
  - renders: true
  derived: true
- name: renders-level-6
  given:
    level: '6'
  then:
  - renders: true
  derived: true
- name: renders-size-4xl
  given:
    size: 4xl
  then:
  - renders: true
  derived: true
- name: renders-size-3xl
  given:
    size: 3xl
  then:
  - renders: true
  derived: true
- name: renders-size-2xl
  given:
    size: 2xl
  then:
  - renders: true
  derived: true
- name: renders-size-xl
  given:
    size: xl
  then:
  - renders: true
  derived: true
- name: renders-size-lg
  given:
    size: lg
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-align-start
  given:
    align: start
  then:
  - renders: true
  derived: true
- name: renders-align-center
  given:
    align: center
  then:
  - renders: true
  derived: true
- name: renders-align-end
  given:
    align: end
  then:
  - renders: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-heading
reflect:
- level
- size
- align
notes: "Renders the matching <h1>\u2013<h6> inside the shadow root, carrying `part=\"\
  text\"` and `data-part=\"text\"` \u2014 the anatomy name, not `heading`. Headings\
  \ inside shadow roots are exposed to assistive technology normally; some in-page\
  \ outline tools do not see them, and the component does nothing about that. `level`\
  \ is required, but an element always renders: with the attribute absent or invalid\
  \ it falls back to <h2> and warns once per element, for the element's lifetime,\
  \ in development. Sizes are attribute selectors on the reflected `level` and `size`\
  \ setting `--ds-heading-font-size`, with the `[size]` rules declared after the `[level]`\
  \ defaults so an explicit size wins at equal specificity; with `level` absent or\
  \ invalid no `[level]` rule matches, so the 3xl fallback size is the `:host` default\
  \ of `--ds-heading-font-size`. Non-interactive, so no delegatesFocus and no focus\
  \ styling."
```

## Guidance

## Overview

Headings label sections of content. Their most important job is invisible: they build the outline that screen-reader users jump through to understand and navigate a page.

## When to use

Use a Heading to title a page, a section, or a card that contains its own content. Choose `level` from the document outline — the page title is `1`, its major sections are `2`, their subsections `3` — and then choose `size` separately if the default visual size is wrong for the layout. Decoupling level from size is the whole point of this component: it lets designers pick the right look without breaking the outline.

## When not to use

Do not use a Heading purely to make text large or bold; use Text with a larger size. Do not skip levels (a `2` followed by a `4`) and do not use more than one `level: 1` per page or screen. Do not put interactive controls inside a heading.

## Content guidelines

Headings are short noun phrases in sentence case, unique within a page, and front-loaded with the most specific word. They should make sense when read in a list on their own, because that is exactly how screen-reader users encounter them.

## Accessibility

Headings must reflect the actual structure of the content (WCAG 1.3.1 Info and Relationships, 2.4.6 Headings and Labels, and 2.4.10 Section Headings at AAA). Levels must not skip. On web, the semantic element is always a real `<h1>`–`<h6>` chosen from `level`; visual size never influences the element. Heading text meets AAA contrast (7:1) against the page background in both themes because headings carry the most weight in a page's meaning. On native platforms there are no levels, so headings carry the platform header trait and the outline is documented in the screen design; this is a known, unavoidable gap between platforms and it is called out in the platform mapping table above.

## Platform notes

### Web
`level` selects the element. `size` maps to `font.size.*` via a `ds-heading--size-*` modifier class; the default size per level is 1→4xl, 2→3xl, 3→2xl, 4→xl, 5→lg, 6→md.

### Lit
`<ds-heading level="2">` renders `<h2>` inside its shadow root. `level`, `size` and `align` are reflected as attributes. Because the heading lives in a shadow root, styling comes through the `--ds-heading-*` hooks and `overrides`, never `::part`; the inner element carries `part="text"` as an anatomy hook only.

### React Native
Renders `Text` with `accessibilityRole="header"`. `level` chooses the default size only. iOS VoiceOver exposes the header trait but not a level; Android TalkBack likewise. Do not simulate levels with `accessibilityLabel` prefixes like "Heading level 2" — it is noisy and non-standard.

## Related

Text, Section (planned).
