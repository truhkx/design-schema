# Generate: Divider as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Divider.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Divider.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: DividerVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Divider.test.ts`.

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
  name: Divider
  category: layout
  status: review
  anatomy:
  - line
  - label
  composition:
    label:
      component: Text
      props:
        size: sm
        tone: muted
        element: span
      forwards:
        labelSize: fontSize
        fontFamily: fontFamily
  props:
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: 'Vertical dividers sit between inline siblings (toolbar groups)
        and stretch to the row height: inline-block with `block-size: auto; align-self:
        stretch; min-block-size: 100%` (flex stretch applies only to an auto cross
        size, and the min fills a parent with a set height). They need a flex or grid
        row (a horizontal Stack with align stretch) or a parent with a definite height;
        in plain block flow a vertical divider has no height and draws nothing.'
    label:
      type: string
      description: 'Optional text in the middle of a horizontal divider ("or", "Earlier
        today"). Turns the divider from decorative into a labelled separator (`semantic`
        is implied). Ignored on a vertical divider, with a development warning: a
        vertical line has no room for centered text. An ignored label implies nothing
        either — a vertical divider is semantic only when `semantic` says so. An empty
        string is no label: the divider stays decorative and nothing warns. On Lit
        `label` is a property that also reads the `label` attribute and does not reflect.
        The development warning fires when the ignored combination appears or changes
        (an effect keyed on `label` and `orientation`), not on every render; on React
        Native a vertical divider with an ignored label and `semantic: true` gets
        both warnings. Those warnings are development diagnostics, not `copy.*` strings:
        their wording is not contractual and may differ between platforms. A vertical
        divider with an ignored label and `semantic: true` is a separator with no
        accessible name on every platform — naming it from text that is not rendered
        would contradict the label being ignored. When in effect, the label is the
        separator''s accessible name (see the platform notes), and the two line pieces
        on either side are hidden from assistive technology.'
    semantic:
      type: boolean
      default: false
      description: Expose as a separator to assistive technology. Leave false for
        purely visual lines between list rows; set true (or provide a label) when
        the divider marks a real boundary between sections that a screen-reader user
        should hear.
      a11y: false → aria-hidden / hidden from AT; true → role=separator with aria-orientation.
    spacing:
      type: enum
      values:
      - none
      - tight
      - normal
      - loose
      default: none
      description: 'Space on both sides along the cross axis (above and below a horizontal
        divider, left and right of a vertical one), from the layout rhythm, for dividers
        used outside a Stack that already spaces them. The space is transparent: web
        and Lit use margin-block (horizontal) or margin-inline (vertical); React Native
        pads the root View on that axis (paddingVertical or paddingHorizontal) with
        the line as an inner View. It applies to a labelled divider too, where the
        root is the row: the space is around the whole divider, label included, not
        around each line piece.'
  styles:
    color:
      token: color.border
      locked: false
    thickness:
      token: border.width.thin
      locked: false
    spacing:
      token: layout.gap.{spacing}
      description: '`spacing: none` is the off state: it renders no space and sets
        no hook (not a `layout.gap.none` value, and an `overrides.spacing` is not
        written to the hook either), so an override of this binding does nothing until
        a spacing value is chosen — overrides change values, never presence.'
      locked: false
    labelColor:
      token: color.foreground.muted
      part: label
      description: 'Locked, and deliberately not enforced by Divider: the colour arrives
        from the composed Text''s `tone: muted`, which resolves to this same token,
        and writing a colour rule here would restyle a composed child. The contrast
        pair is therefore a claim about Text''s muted tone on the page background,
        which no Divider code can regress.'
      locked: true
    labelSize:
      token: font.size.sm
      part: label
      description: 'Passed to the composed Text as its `fontSize` override, along
        with `fontFamily`; Divider does not style the Text itself. The label color
        and default size come from the Text props `size="sm" tone="muted"`, so Divider
        writes no label color or size rule of its own. Neither labelSize nor fontFamily
        has a --ds-divider-* hook on web or Lit: only the bindings the author overrode
        are passed on, into Text''s `overrides`, and page CSS reaches the label through
        Text''s own hooks.'
      locked: false
    labelGap:
      token: layout.gap.normal
      part: label
      description: 'Gap between the label and the lines on each side: the gap of the
        labelled root row (flex `gap` on web and Lit, the `gap` style on React Native),
        not a composed Stack. With no label in effect there is no row, and an override
        of it does nothing.'
      locked: false
    fontFamily:
      token: font.family.body
      part: label
      description: Reaches only the composed label Text, through its `fontFamily`
        override; the line has no text, so the root sets no font hook.
      locked: false
  a11y:
    role: separator
    requires:
    - contrast-aa
    contrast:
    - foreground: color.foreground.muted
      background: color.background
      level: AA
  platforms:
    web:
      element: hr
      attributes:
      - aria-hidden
      - role=separator
      - aria-orientation
      notes: 'A decorative divider is <hr aria-hidden="true"> (hr has an implicit
        separator role, so hiding it is deliberate); every semantic divider, labelled
        or not, is <div role="separator" aria-orientation>, so the semantic and labelled
        cases share one element. With a label the div is a flex row of two aria-hidden
        line spans (data-part="line") around the composed Text (data-part="label"),
        and the separator takes its accessible name from the label through aria-labelledby
        pointing at the Text id (from useId) — separator children are presentational,
        so containment alone does not name it. Beyond the composition props, the label
        Text also receives the platform attributes `id` and `data-part="label"`. The
        labelled row uses align-items center, so the lines sit at the label''s vertical
        center. Unlabelled, the root paints itself and is the `line` part; it carries
        no data-part. The line is a background-color box of the thickness, not a border,
        and the paint rule is scoped to the unlabelled case rather than being cancelled
        on the labelled root, so no "no background" keyword is needed. The root also
        sets `flex-shrink: 0`, so a horizontal divider inside a vertical flex Stack
        keeps its one-token thickness; a horizontal divider is block-level and fills
        its container''s inline size. Vertical: display inline-block, inline-size
        thin, block-size auto, min-block-size 100%, align-self stretch. The ref is
        `Ref<HTMLElement>`, since the root is an hr or a div, and `...rest` lands
        on whichever root renders; the props base is the div''s, minus the ones the
        component owns (children, role, aria-orientation, aria-hidden, className,
        style), which accepts a few div-only attributes on the hr branch — the price
        of one props type for two roots.'
    lit:
      tag: ds-divider
      reflect:
      - orientation
      - semantic
      - spacing
      notes: 'Unlike web, Lit always renders the `line` span in the shadow root, in
        every orientation and whether or not there is a label, so the part has an
        element to name and the shadow root is never empty; the host carries thickness,
        orientation and spacing around it. The host is a flex container (`:host {
        display: flex }`, `:host([orientation="vertical"]) { display: inline-flex
        }`) with the line at `flex: 1 1 auto` — a line sized `block-size: 100%` collapses
        inside a host whose own block-size is auto, which is exactly the stretched
        vertical case — and `flex-shrink: 0` on the host itself. An unlabelled line
        span is aria-hidden in both orientations, like the labelled pieces. When a
        label is in effect the host switches to a row through an internal `data-labelled`
        host attribute and the shadow root renders line segment, label Text, line
        segment, the segments aria-hidden. role, aria-orientation and aria-hidden
        are plain host attributes, not ElementInternals, because tests read them (dom-accessibility-api
        ignores internals). A labelled host also sets aria-label to the label text:
        ids do not cross the shadow root, and separator children are presentational.
        `label` is a property. Shadow elements carry `part` as well as `data-part`,
        both the anatomy names: names tests read, not a styling surface.'
    rn:
      element: View
      props:
      - accessibilityElementsHidden
      - importantForAccessibility
      notes: 'A View with height (or width) = border.width.thin and backgroundColor
        color.border, inside a root View that carries `spacing` as padding. Decorative:
        accessibilityElementsHidden + importantForAccessibility="no-hide-descendants"
        on the root, since it wraps the inner line View. No accessibilityRole is set:
        there is none for a separator. Labelled: the root is a row (flexDirection
        row, alignItems center, `gap` from labelGap) of two line Views, each hidden
        (accessibilityElementsHidden + importantForAccessibility="no"), around the
        label Text, which stays readable. Semantic: there is no separator role on
        native; render the label (if any) as Text so it is read, otherwise the divider
        stays hidden — announcing "separator" has no native idiom. `semantic: true`
        with no label therefore has no observable effect here, and warns in development
        so the author knows the boundary is silent on this platform; that warning
        is keyed on `semantic` and whether a label is in effect, so it also fires
        for a semantic vertical divider whose label is ignored. The composition''s
        `element: span` is not passed (native Text has no `element`). The label Text
        sits in a plain View carrying `testID="Divider.label"`, since Text takes no
        testID. `spacing` pads the root on the cross axis whether or not it is the
        labelled row, each labelled line piece takes `flex: 1`, and the root and its
        inner line both use `alignSelf: stretch` in either orientation — a horizontal
        divider in a parent that does not stretch its children would otherwise collapse
        to zero width. Both line pieces of a labelled divider carry the same `testID="Divider.line"`,
        so a test for the labelled variant asks for all of them rather than one. The
        label wrapper View is unflexed: it sizes to its text and the two lines take
        the remainder, so a label too long for the row overflows rather than wrapping.'
    swiftui:
      element: Rectangle
      props:
      - Rectangle
      - .frame=height-1
      - .accessibilityHidden
      - .accessibilityElement
      - .accessibilityLabel
      notes: A `Rectangle` of the color token, `border.width.thin` thick along the
        cross axis (`.frame(height:)` horizontal, `.frame(width:)` vertical), `.accessibilityHidden(true)`
        when decorative. With `label` the divider is an `HStack` of line–`Text`–line
        and is an accessibility element with that label (VoiceOver reads it as a section
        break); the label Text takes `fontSize` through `overrides`. Not SwiftUI's
        `Divider` (fixed color).
  behavior:
  - name: decorative-divider-is-hidden-from-assistive-technology
    description: Decorative dividers are hidden so lists do not announce "separator"
      between every row.
    then:
    - attribute: aria-hidden
      is: 'true'
      platforms:
      - web
      - lit
    - attribute: accessibilityElementsHidden
      is: true
      platforms:
      - rn
  - name: semantic-divider-is-a-separator
    description: 'true means the divider marks a real boundary: role=separator with
      aria-orientation. React Native has no separator role, so there is nothing to
      assert there.'
    given:
      semantic: true
    then:
    - role: separator
      platforms:
      - web
      - lit
    - attribute: aria-orientation
      is: horizontal
      platforms:
      - web
      - lit
  - name: label-is-read-and-makes-the-divider-semantic
    description: A label turns the divider from decorative into a labelled separator,
      and the text is what gets read. On React Native only the rendered text is observable
      (no separator role), so the test there checks the text alone.
    given:
      label: or
    then:
    - text: or
    - role: separator
      platforms:
      - web
      - lit
    - name: or
      platforms:
      - web
      - lit
  examples:
  - name: or-between-alternatives
    description: A labelled divider between two ways of signing in.
    given:
      label: or
      spacing: normal
  - name: list-furniture
    description: The default line between rows of a dense list - decorative, and silent
      to assistive technology.
    given:
      orientation: horizontal
  - name: toolbar-groups
    description: 'A vertical line between groups of toolbar controls, stretching to
      the row height; shown inside a horizontal Stack with align stretch and gap tight,
      between one Text reading "Bold Italic" and one reading "Align left" — two Texts,
      one on each side — so the row has a height to fill. The `orientation: vertical`
      enum story uses the same wrapper.'
    given:
      orientation: vertical
  - name: section-boundary
    description: An unlabelled line that still marks a real boundary a screen-reader
      user should hear on web, Lit and SwiftUI; on React Native it is silent by design
      and warns (see the rn notes).
    given:
      semantic: true
      spacing: loose
```

## Parts and slots

- `line`: element
- `label`: component `Text`; props `size` = "sm", `tone` = "muted", `element` = "span"; forwards `labelSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`

## Style bindings

- `labelColor`: token `color.foreground.muted`; part `label`; locked
- `labelSize`: token `font.size.sm`; part `label`
- `labelGap`: token `layout.gap.normal`; part `label`
- `fontFamily`: token `font.family.body`; part `label`

## Constants and examples

- example `or-between-alternatives`, story `OrBetweenAlternatives`: given `label: "or"`, `spacing: "normal"`; A labelled divider between two ways of signing in.
- example `list-furniture`, story `ListFurniture`: given `orientation: "horizontal"`; The default line between rows of a dense list - decorative, and silent to assistive technology.
- example `toolbar-groups`, story `ToolbarGroups`: given `orientation: "vertical"`; A vertical line between groups of toolbar controls, stretching to the row height; shown inside a horizontal Stack with align stretch and gap tight, between one Text reading "Bold Italic" and one reading "Align left" — two Texts, one on each side — so the row has a height to fill. The `orientation: vertical` enum story uses the same wrapper.
- example `section-boundary`, story `SectionBoundary`: given `semantic: true`, `spacing: "loose"`; An unlabelled line that still marks a real boundary a screen-reader user should hear on web, Lit and SwiftUI; on React Native it is silent by design and warns (see the rn notes).

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `color`, `thickness`, `spacing`, `labelSize`, `labelGap`, `fontFamily`
Locked (accessibility-bearing, never overridable): `labelColor`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: decorative-divider-is-hidden-from-assistive-technology
  description: Decorative dividers are hidden so lists do not announce "separator"
    between every row.
  then:
  - attribute: aria-hidden
    is: 'true'
- name: semantic-divider-is-a-separator
  description: 'true means the divider marks a real boundary: role=separator with
    aria-orientation. React Native has no separator role, so there is nothing to assert
    there.'
  given:
    semantic: true
  then:
  - role: separator
  - attribute: aria-orientation
    is: horizontal
- name: label-is-read-and-makes-the-divider-semantic
  description: A label turns the divider from decorative into a labelled separator,
    and the text is what gets read. On React Native only the rendered text is observable
    (no separator role), so the test there checks the text alone.
  given:
    label: or
  then:
  - text: or
  - role: separator
  - name: or
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-orientation-horizontal
  given:
    orientation: horizontal
  then:
  - renders: true
  derived: true
- name: renders-orientation-vertical
  given:
    orientation: vertical
  then:
  - renders: true
  derived: true
- name: renders-spacing-none
  given:
    spacing: none
  then:
  - renders: true
  derived: true
- name: renders-spacing-tight
  given:
    spacing: tight
  then:
  - renders: true
  derived: true
- name: renders-spacing-normal
  given:
    spacing: normal
  then:
  - renders: true
  derived: true
- name: renders-spacing-loose
  given:
    spacing: loose
  then:
  - renders: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-divider
reflect:
- orientation
- semantic
- spacing
notes: "Unlike web, Lit always renders the `line` span in the shadow root, in every\
  \ orientation and whether or not there is a label, so the part has an element to\
  \ name and the shadow root is never empty; the host carries thickness, orientation\
  \ and spacing around it. The host is a flex container (`:host { display: flex }`,\
  \ `:host([orientation=\"vertical\"]) { display: inline-flex }`) with the line at\
  \ `flex: 1 1 auto` \u2014 a line sized `block-size: 100%` collapses inside a host\
  \ whose own block-size is auto, which is exactly the stretched vertical case \u2014\
  \ and `flex-shrink: 0` on the host itself. An unlabelled line span is aria-hidden\
  \ in both orientations, like the labelled pieces. When a label is in effect the\
  \ host switches to a row through an internal `data-labelled` host attribute and\
  \ the shadow root renders line segment, label Text, line segment, the segments aria-hidden.\
  \ role, aria-orientation and aria-hidden are plain host attributes, not ElementInternals,\
  \ because tests read them (dom-accessibility-api ignores internals). A labelled\
  \ host also sets aria-label to the label text: ids do not cross the shadow root,\
  \ and separator children are presentational. `label` is a property. Shadow elements\
  \ carry `part` as well as `data-part`, both the anatomy names: names tests read,\
  \ not a styling surface."
```

## Guidance

## Overview

A divider is a line, and the question it always raises is whether the line means something. Between two rows of a list it is furniture: it helps the eye and says nothing. Between "Today" and "Earlier" it is structure a screen-reader user should hear. Divider makes that choice explicit instead of leaving it to whether someone remembered `aria-hidden`.

## When to use

Use a Divider between items in a dense list where whitespace alone does not separate them, between groups in a menu (Menu renders its own), between toolbar groups (`vertical`), and with a `label` as an "or" between alternatives (sign in with email — or — with a provider) or a date heading in a feed. Use `spacing` when the divider stands outside a Stack.

## When not to use

Do not use dividers between page sections; use `section` spacing and headings — a page full of rules is a page without rhythm. Do not use a divider under a heading as decoration. Do not use a labelled divider as a heading substitute; if the label introduces content, it is a Heading. Do not rely on a divider alone to separate interactive regions.

## Behavior

Renders a one-token-thick line in the border color along the chosen axis, with optional symmetric spacing. With `label`, the text is centered with a line on each side and the divider becomes semantic. Nothing is interactive.

## Content guidelines

Labels are one to three words, sentence case or lowercase for conjunctions ("or"), no punctuation. Date and group labels match the headings elsewhere on the screen.

## Accessibility

Decorative dividers are hidden from assistive technology so lists do not announce "separator" between every row (WCAG 1.3.1 — structure is conveyed by the list, not the line). Semantic dividers expose role `separator` with `aria-orientation`, and labelled ones take the label as their accessible name (separator children are presentational, so the name is set explicitly: `aria-labelledby` on web, `aria-label` on Lit) with the flanking line pieces hidden. The line is below the 3:1 non-text threshold on purpose — it is not required to identify anything (1.4.11 exemption), and the label, when present, meets 4.5:1.

## Platform notes

### Web
Decorative: `<hr aria-hidden="true" class="ds-divider">`. Semantic: `<div role="separator" aria-orientation={orientation}>` with, for a label, two aria-hidden flex-grow line spans around a `Text size="sm" tone="muted"` that names the separator through `aria-labelledby`. Vertical uses `inline-size: var(--border-width-thin); block-size: auto; min-block-size: 100%; align-self: stretch`.

### Lit
`<ds-divider>`; `<ds-divider semantic label="or">`. Host carries the styles and, when semantic, plain `role="separator"` and `aria-orientation` attributes (plus `aria-label` with a label); decorative hosts get `aria-hidden="true"`. The label renders in the shadow root.

### React Native
`View` with `height: t.borderWidthThin, backgroundColor: t.colorBorder` (or width for vertical, `alignSelf: 'stretch'`). Decorative: hidden from AT. Labelled: a row of two hidden lines with a `Text size="sm" tone="muted"` between; the text is what gets read.

## Related

Stack, Menu, List (planned), Heading.
