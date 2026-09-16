# Generate: Divider for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Divider.tsx` exporting a typed React function component named `Divider`, plus `Divider.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Divider({ ref, …rest }: DividerProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Divider> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Divider.test.tsx`.
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
        and stretch to the row height: inline-block with block-size 100% and align-self
        stretch. They need a flex or grid row (a horizontal Stack with align stretch)
        or a parent with a definite height; in plain block flow a vertical divider
        has no height and draws nothing.'
    label:
      type: string
      description: 'Optional text in the middle of a horizontal divider ("or", "Earlier
        today"). Turns the divider from decorative into a labelled separator (`semantic`
        is implied). Ignored on a vertical divider, with a development warning: a
        vertical line has no room for centered text. An ignored label implies nothing
        either — a vertical divider is semantic only when `semantic` says so. An empty
        string is no label: the divider stays decorative and nothing warns. The development
        warning fires when the ignored combination appears or changes (an effect keyed
        on `label` and `orientation`), not on every render; on React Native a vertical
        divider with an ignored label and `semantic: true` gets both warnings. When
        in effect, the label is the separator''s accessible name (see the platform
        notes), and the two line pieces on either side are hidden from assistive technology.'
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
        the line as an inner View.'
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
        no hook (not a `layout.gap.none` value), so an override of this binding does
        nothing until a spacing value is chosen — overrides change values, never presence.'
      locked: false
    labelColor:
      token: color.foreground.muted
      part: label
      locked: true
    labelSize:
      token: font.size.sm
      part: label
      description: Passed to the composed Text as its `fontSize` override, along with
        `fontFamily`; Divider does not style the Text itself. The label color and
        default size come from the Text props `size="sm" tone="muted"`, so Divider
        writes no label color or size rule of its own.
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
        so containment alone does not name it. Unlabelled, the root paints itself
        and is the `line` part; it carries no data-part. The line is a background-color
        box of the thickness, not a border. Vertical: display inline-block, inline-size
        thin, block-size 100% / align-self stretch.'
    lit:
      tag: ds-divider
      reflect:
      - orientation
      - semantic
      - spacing
      notes: 'Host is the line when unlabelled (`:host { display: block }`, `:host([orientation="vertical"])
        { display: inline-block }`). When a label is in effect the host switches to
        a flex row through an internal `data-labelled` host attribute and the shadow
        root renders line segment, label Text, line segment, the segments aria-hidden.
        role, aria-orientation and aria-hidden are plain host attributes, not ElementInternals,
        because tests read them (dom-accessibility-api ignores internals). A labelled
        host also sets aria-label to the label text: ids do not cross the shadow root,
        and separator children are presentational. `label` is a property.'
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
        so the author knows the boundary is silent on this platform.'
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
    description: A vertical line between groups of toolbar controls, stretching to
      the row height; shown inside a horizontal Stack with align stretch so the row
      has a height to fill.
    given:
      orientation: vertical
  - name: section-boundary
    description: An unlabelled line that still marks a real boundary a screen-reader
      user should hear.
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
- example `toolbar-groups`, story `ToolbarGroups`: given `orientation: "vertical"`; A vertical line between groups of toolbar controls, stretching to the row height; shown inside a horizontal Stack with align stretch so the row has a height to fill.
- example `section-boundary`, story `SectionBoundary`: given `semantic: true`, `spacing: "loose"`; An unlabelled line that still marks a real boundary a screen-reader user should hear.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

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

## Platform notes (web)

```yaml
element: hr
attributes:
- aria-hidden
- role=separator
- aria-orientation
notes: "A decorative divider is <hr aria-hidden=\"true\"> (hr has an implicit separator\
  \ role, so hiding it is deliberate); every semantic divider, labelled or not, is\
  \ <div role=\"separator\" aria-orientation>, so the semantic and labelled cases\
  \ share one element. With a label the div is a flex row of two aria-hidden line\
  \ spans (data-part=\"line\") around the composed Text (data-part=\"label\"), and\
  \ the separator takes its accessible name from the label through aria-labelledby\
  \ pointing at the Text id (from useId) \u2014 separator children are presentational,\
  \ so containment alone does not name it. Unlabelled, the root paints itself and\
  \ is the `line` part; it carries no data-part. The line is a background-color box\
  \ of the thickness, not a border. Vertical: display inline-block, inline-size thin,\
  \ block-size 100% / align-self stretch."
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
Decorative: `<hr aria-hidden="true" class="ds-divider">`. Semantic: `<div role="separator" aria-orientation={orientation}>` with, for a label, two aria-hidden flex-grow line spans around a `Text size="sm" tone="muted"` that names the separator through `aria-labelledby`. Vertical uses `inline-size: var(--border-width-thin); align-self: stretch`.

### Lit
`<ds-divider>`; `<ds-divider semantic label="or">`. Host carries the styles and, when semantic, plain `role="separator"` and `aria-orientation` attributes (plus `aria-label` with a label); decorative hosts get `aria-hidden="true"`. The label renders in the shadow root.

### React Native
`View` with `height: t.borderWidthThin, backgroundColor: t.colorBorder` (or width for vertical, `alignSelf: 'stretch'`). Decorative: hidden from AT. Labelled: a row of two hidden lines with a `Text size="sm" tone="muted"` between; the text is what gets read.

## Related

Stack, Menu, List (planned), Heading.
