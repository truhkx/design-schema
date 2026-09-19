# Generate: Text for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Text.tsx` exporting a typed React function component named `Text`, plus `Text.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Text({ ref, …rest }: TextProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Text> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Text.test.tsx`.
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
  name: Text
  category: typography
  status: review
  anatomy:
  - text
  props:
    children:
      type: content
      required: true
      description: The text content. Inline formatting (emphasis, links) is allowed;
        block elements are not.
    size:
      type: enum
      enumRef: size
      values:
      - xs
      - sm
      - md
      - lg
      - xl
      default: md
      description: Maps to the font size scale. `md` is body copy; `xs` is the smallest
        readable size and is reserved for captions and metadata.
    weight:
      type: enum
      values:
      - regular
      - medium
      - semibold
      - bold
      default: regular
      description: Emphasis without changing size. Prefer weight over color for hierarchy.
    tone:
      type: enum
      enumRef: foregroundTone
      values:
      - default
      - strong
      - muted
      - danger
      - onAction
      default: default
      description: 'Semantic color. `onAction` is only for text placed on an action
        background, and its story paints that background (color.action.primary.background)
        behind the Text, on a wrapper holding a Box with `inset: md` around it. No
        component paints an action surface, so that wrapper is sanctioned story scaffolding
        like the truncate width: a plain element (a `div` on web and Lit, a View on
        native) whose background is the token itself. Enum stories use the Default
        children, "Use the email you signed up with.", except `ToneDanger`, which
        uses the `inline-error-wording` children verbatim on every platform so colour
        is never the only signal, and `ToneOnAction`, which reads "Text on an action
        background". The web modifier class is kebab-case (`ds-text--tone-on-action`),
        from an explicit tone-to-class table. There is no `inverse` tone: the shared
        foreground vocabulary has no such name, so an inverse surface re-scopes the
        foreground instead (see `styles.color`).'
      a11y: Every tone meets 4.5:1 on the page background in every theme and mode
        except onAction, which is checked against color.action.primary.background.
    align:
      type: enum
      values:
      - start
      - center
      - end
      default: start
      description: 'Horizontal alignment. `start`/`end` follow writing direction.
        Native has no logical text alignment, so they resolve through I18nManager.isRTL
        at render; a direction change mid-session does not re-align text that is already
        on screen. Web and Lit use CSS `text-align: start|end`, which follows `dir`
        live.'
    truncate:
      type: boolean
      default: false
      description: 'Clip to one line with an ellipsis. On web the full text is exposed
        via `title` when children is a plain string; otherwise the consumer passes
        `title`, and neither one is a development warning — the text is then reachable
        only to a screen reader. A consumer `title` always wins and is forwarded unchanged,
        with or without `truncate`; an explicit `title={undefined}` counts as not
        passed, so the string children still supply it. On Lit there is no `title`
        property (the name is not attribute-safe): a `title` attribute the consumer
        puts on the host is observed and copied unchanged to the `part="text"` element,
        where it wins the same way, and is left on the host as well (Text never edits
        the consumer''s DOM). Web and Lit therefore differ for rich children on purpose:
        web gets no automatic `title` unless children is a plain string, while Lit''s
        textContent title covers slotted markup too. With no consumer title there
        is no "plain string" state, so `title` comes from the host''s flattened, whitespace-collapsed
        textContent, is omitted when that is empty, sits on the `part="text"` element
        (the one that clips), and follows live edits to the text (a MutationObserver
        over the host''s subtree, since slotchange misses character changes). With
        `element: span` the clipped box is `display: inline-block; max-inline-size:
        100%; vertical-align: bottom`, so the width comes from the parent and the
        clipped box stays on the line; on the default `p` the clipped box stays `display:
        block`. A `TruncateInline` story (truncate with `element: span`) shows that
        case on web and Lit. Native clips with `numberOfLines={1}` and `ellipsizeMode="tail"`
        and has no affordance that reveals the rest — a known gap. Truncate stories
        need a width to clip against; that decorator (or render wrapper, which adds
        no args) is story scaffolding, not a binding, and may use a literal (`max-inline-size:
        24ch` on web and Lit, `width: 200` on native).'
      a11y: Truncated text is still read in full by screen readers; ensure sighted
        users can also reach it.
    element:
      type: enum
      values:
      - p
      - span
      default: p
      description: The HTML element to render — `p` for a block, `span` for inline.
        Labels and legends are native elements rendered by Input and Fieldset, which
        own the association; Text never renders one.
      platforms:
      - web
      - lit
  styles:
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    fontWeight:
      token: font.weight.{weight}
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    color:
      token: color.foreground.{tone}
      description: 'Locked, and locked means absent from the overridable type — so
        a composing parent that forwards `{ color: … }` gets a compile error, not
        a silent no-op. A surface with its own foreground (Toast, Tooltip, Slider''s
        value bubble on `color.inverse.foreground`) therefore does not recolour Text
        at all: on web and Lit it re-scopes `--color-foreground` on its own container,
        which the tone resolves through and which touches no part of the child; on
        React Native, where there is no cascade, it provides the package-internal
        `TextForegroundContext`, which Text reads only while `tone` is `default`.
        `onAction` is not a stand-in for either — in dark mode it is near-white while
        the inverse foreground is near-black. A control that paints its own selected
        text (a DatePicker day) draws that text itself rather than asking Text for
        a colour it has no tone for. Being locked, it has no `--ds-text-color` hook
        on web or Lit: the tone rule reads the token''s own custom property directly
        — `default` is the bare `var(--color-foreground)` an inverse surface re-scopes,
        and `onAction` is `var(--color-foreground-on-action)` (camelCase to kebab-case).
        `TextForegroundContext` exists on React Native only: it is exported from the
        rn Text.tsx for sibling components and not re-exported from the package index.
        The web Text.tsx has no such export.'
      locked: true
  a11y:
    role: generic
    requires:
    - contrast-aa
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.strong
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.danger
      background: color.background
      level: AA
  platforms:
    web:
      element: p
      attributes: []
      notes: 'Renders the `element` prop. `truncate` uses overflow/text-overflow and
        sets `title` to the full text on the root, the only element Text renders.
        The root carries `data-ds="Text"` and no `data-part`: composing parents pass
        their own part name through `...rest` (`description`, `errorMessage`, `label`),
        and a hardcoded one would collide. Text merges a consumer `className` and
        `style` onto the root, because most of the package gives it a layout-only
        class on the way past. The consumer `style` is merged after the inline `overrides`
        hooks, so it wins where both set the same property.'
    lit:
      tag: ds-text
      reflect:
      - size
      - weight
      - tone
      - align
      - truncate
      - element
      notes: 'Renders the chosen element inside the shadow root with `part="text"`
        and `data-part="text"` (inside the shadow root it cannot collide with a composing
        parent''s part name on the host); the host is `display: contents` for `span`-like
        use and `display: block` otherwise. `element` reflects so those two rules
        are `:host([element="span"])` selectors rather than an inline style — an inline
        `display: contents` would beat `:host([hidden]) { display: none }` and a hidden
        span would stay visible. Stories keep an arg named `children` and render it
        as the slotted text, so each example''s args match its `given`.'
    rn:
      element: Text
      props:
      - numberOfLines
      - ellipsizeMode
      - allowFontScaling
      notes: 'No `element` prop — RN has one Text primitive. `truncate` maps to `numberOfLines={1}`.
        Keep `allowFontScaling` on so Dynamic Type / font scaling works. Text provides
        `TextStyleContext` ({ fontSize, color, nested: true }) to its descendants
        — the resolved size and color it renders with — so inline children (Icon,
        Link) can match it; the older boolean `TextNestingContext` is replaced by
        `nested` on this object. The ref is `Ref<TextInstance>`, the root''s own instance
        type. Outside any Text the context reads `{ fontSize: 0, color: '''', nested:
        false }`, so a consumer branches on `nested` and never on the numbers. `a11y.role:
        generic` has no native counterpart and no accessibilityRole is set. Font weight
        tokens are numbers and the platform wants a string union, so a weight snaps
        to the nearest hundred, and lineHeight × fontSize rounds to a whole pixel:
        a theme with a weight of 550 or a fractional line height lands on the nearest
        step. Resolved overrides are cast to the binding''s own type (number for fontSize,
        fontWeight and lineHeight, string for fontFamily) with no runtime guard: a
        TokenRef of the wrong kind is the caller''s type error, not a development
        warning.'
    swiftui:
      element: Text
      props:
      - .font
      - .fontWeight
      - .lineSpacing
      - .foregroundStyle
      - .lineLimit
      - .truncationMode
      - .accessibilityAddTraits=isStaticText
      notes: 'SwiftUI `Text` with `.font(.system(size: scaled))` where the size token
        passes through `@ScaledMetric(relativeTo:)` so Dynamic Type scales it, `.fontWeight`
        from the weight token, `.lineSpacing(fontSize × (lineHeight − 1))`, `.foregroundStyle`
        from the tone. `element` has no meaning (no DOM); `truncate` is `.lineLimit(1)`
        + `.truncationMode(.tail)` and the full text becomes the accessibility label.
        Nested Text: the package''s `Text` inside another `Text` renders as a concatenated
        `SwiftUI.Text` so inline runs share a line; a `TextNesting` environment flag
        tells a child it is inline.'
  behavior:
  - name: truncated-text-keeps-the-full-string-reachable
    description: Truncation clips to one line, and on web the full text is exposed
      via title when children is a plain string, so sighted users can also reach it.
      On web the title is on the root; on Lit it is on the shadow `part="text"` element,
      not the host.
    given:
      truncate: true
      children: A sentence long enough to be clipped by its column.
    then:
    - attribute: title
      is: A sentence long enough to be clipped by its column.
    platforms:
    - web
    - lit
  examples:
  - name: body-copy
    description: The default paragraph - body size, regular weight, default tone.
    given:
      children: Changes are saved automatically. You can undo any change for 30 days.
  - name: caption
    description: Secondary metadata at the smallest readable size, muted so it sits
      behind the content it annotates.
    given:
      children: Last updated 2 minutes ago.
      size: xs
      tone: muted
  - name: inline-error-wording
    description: Error copy where the danger tone is paired with explicit words, so
      color alone never carries the meaning.
    given:
      children: 'Error: enter an email address like name@example.com'
      tone: danger
      element: span
    platforms:
    - web
    - lit
  - name: truncated-cell
    description: One line of text in a dense cell, with the full string still reachable
      (on React Native only to a screen reader; see `truncate`).
    given:
      children: Quarterly revenue summary for the EMEA region.
      truncate: true
```

## Constants and examples

- example `body-copy`, story `BodyCopy`: given `children: "Changes are saved automatically. You can undo any change for 30 days."`; The default paragraph - body size, regular weight, default tone.
- example `caption`, story `Caption`: given `children: "Last updated 2 minutes ago."`, `size: "xs"`, `tone: "muted"`; Secondary metadata at the smallest readable size, muted so it sits behind the content it annotates.
- example `inline-error-wording`, story `InlineErrorWording`: given `children: "Error: enter an email address like name@example.com"`, `tone: "danger"`, `element: "span"`; Error copy where the danger tone is paired with explicit words, so color alone never carries the meaning.
- example `truncated-cell`, story `TruncatedCell`: given `children: "Quarterly revenue summary for the EMEA region."`, `truncate: true`; One line of text in a dense cell, with the full string still reachable (on React Native only to a screen reader; see `truncate`).

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`
Locked (accessibility-bearing, never overridable): `color`

## Behavior scenarios (21)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: truncated-text-keeps-the-full-string-reachable
  description: Truncation clips to one line, and on web the full text is exposed via
    title when children is a plain string, so sighted users can also reach it. On
    web the title is on the root; on Lit it is on the shadow `part="text"` element,
    not the host.
  given:
    truncate: true
    children: A sentence long enough to be clipped by its column.
  then:
  - attribute: title
    is: A sentence long enough to be clipped by its column.
  platforms:
  - web
  - lit
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-size-xs
  given:
    size: xs
  then:
  - renders: true
  derived: true
- name: renders-size-sm
  given:
    size: sm
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-size-lg
  given:
    size: lg
  then:
  - renders: true
  derived: true
- name: renders-size-xl
  given:
    size: xl
  then:
  - renders: true
  derived: true
- name: renders-weight-regular
  given:
    weight: regular
  then:
  - renders: true
  derived: true
- name: renders-weight-medium
  given:
    weight: medium
  then:
  - renders: true
  derived: true
- name: renders-weight-semibold
  given:
    weight: semibold
  then:
  - renders: true
  derived: true
- name: renders-weight-bold
  given:
    weight: bold
  then:
  - renders: true
  derived: true
- name: renders-tone-default
  given:
    tone: default
  then:
  - renders: true
  derived: true
- name: renders-tone-strong
  given:
    tone: strong
  then:
  - renders: true
  derived: true
- name: renders-tone-muted
  given:
    tone: muted
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: renders-tone-on-action
  given:
    tone: onAction
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
- name: renders-element-p
  given:
    element: p
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
- name: renders-element-span
  given:
    element: span
  then:
  - renders: true
  platforms:
  - web
  - lit
  derived: true
```

## Platform notes (web)

```yaml
element: p
attributes: []
notes: 'Renders the `element` prop. `truncate` uses overflow/text-overflow and sets
  `title` to the full text on the root, the only element Text renders. The root carries
  `data-ds="Text"` and no `data-part`: composing parents pass their own part name
  through `...rest` (`description`, `errorMessage`, `label`), and a hardcoded one
  would collide. Text merges a consumer `className` and `style` onto the root, because
  most of the package gives it a layout-only class on the way past. The consumer `style`
  is merged after the inline `overrides` hooks, so it wins where both set the same
  property.'
```

## Guidance

## Overview

Text is the default way to put words on a screen. Its job is to make sure every piece of copy uses a size from the scale and a color from the semantic set, so typography stays consistent without anyone thinking about it.

## When to use

Use Text for paragraphs, labels, captions, helper text, and any inline copy. Pick `size` from the scale rather than styling a raw element, and use `tone` for meaning: `muted` for secondary information, `danger` for errors, `strong` when a phrase must stand out from surrounding body copy. Use `weight` to create hierarchy inside a size; it is calmer than jumping sizes.

## When not to use

Do not use Text for section titles — use Heading, which carries document structure. Do not use `tone: danger` for decoration; it is reserved for error and destructive messaging so that its meaning stays reliable. Do not stack `size: xl` with `weight: bold` to fake a heading.

## Content guidelines

Sentence case for interface copy. Write for the smallest size the text will appear at. Avoid relying on color alone to convey meaning: pair `tone: danger` with an icon or explicit wording ("Error:") so color-blind users get the same information.

## Accessibility

Every tone except `onAction` is contrast-checked against the page background at AA in every theme and mode; the build fails if a theme's derived palette breaks this. Text on any other surface (a Box `surface`, a Feed item, a Splitter pane) is the surface owner's pair to declare, as Box does, not Text's. `xs` is the floor for readable text — nothing in the system renders smaller. Text must reflow at 200% zoom and 320px viewports (WCAG 1.4.4, 1.4.10), which means never fixing the width of a text container in pixels. On native platforms, font scaling stays enabled so the platform's accessibility text sizes apply.

## Platform notes

### Web
The `element` prop chooses the tag; default `p`. `label` should only be used with a `for` association — prefer the Input component, which handles this. Truncation adds `title` with the full string.

### Lit
`<ds-text size="sm" tone="muted">` renders the element in a shadow root with `part="text"` as an anatomy name only; styling comes through the `--ds-text-*` hooks and `overrides`, never `::part`. Reflected attributes allow `ds-text[tone="danger"]` selectors in consuming apps.

### React Native
Renders `Text`. `size` and `weight` map to `fontSize`/`fontWeight` from the RN token object; `tone` to a color token. `truncate` sets `numberOfLines={1}` and `ellipsizeMode="tail"`. Nested Text is fine for inline emphasis.

## Related

Heading, Input (uses Text for label, description, and error).
