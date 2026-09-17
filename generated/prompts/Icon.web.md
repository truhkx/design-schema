# Generate: Icon for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Icon.tsx` exporting a typed React function component named `Icon`, plus `Icon.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Icon({ ref, …rest }: IconProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Icon> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Icon.test.tsx`.
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
  name: Icon
  category: primitive
  status: review
  anatomy:
  - glyph
  props:
    name:
      type: enum
      values:
      - check
      - dash
      - chevron-right
      - chevron-down
      - chevron-up
      - chevron-left
      - close
      - plus
      - minus
      - info
      - success
      - warning
      - danger
      - external
      - ellipsis
      - search
      - arrow-right
      - arrow-left
      - calendar
      - menu
      - list
      - grid
      - play
      - pause
      - folder
      - file
      required: true
      description: Which glyph. The set is deliberately small and grows only when
        a component needs a shape; `info`, `success`, `warning` and `danger` are the
        four status shapes (circle-i, circle-check, triangle-!, octagon-x) so tone
        is never carried by color alone. `name` has no default; the Default story
        renders `check`.
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
      description: Rendered size, from the font-size scale so icons line up with text
        of the same size.
    inline:
      type: boolean
      default: false
      description: 'Size the glyph at 1em of the surrounding text and align it to
        the text baseline, ignoring `size`. For icons inside Text, Link and Button
        labels. On web and Lit `font-size: inherit` always has a surrounding size
        to read, so there is no fallback there. The fallback is React Native only:
        an inline icon that is not inside a Text has nothing to inherit and renders
        at font.size.md, so `inline` still ignores `size` in that case.'
    label:
      type: string
      description: Accessible name. When set (non-empty), the icon is meaningful and
        exposed as an image with this name; when omitted or empty, it is decorative
        and hidden from assistive technology — an empty string is the decorative case,
        not an authoring error. Most icons sit next to text and should have no label.
      a11y: 'With label: role=img + aria-label (accessibilityRole image + accessibilityLabel,
        importantForAccessibility auto). Without: aria-hidden / accessibilityElementsHidden
        + importantForAccessibility no.'
    color:
      type: string
      description: 'React Native only: the color the parent passes, because there
        is no currentColor. Falls back to `color.foreground` when the icon is not
        nested in a Text (a nested Text glyph inherits its parent''s color and the
        fallback is not applied).'
      platforms:
      - rn
  styles:
    size:
      token: font.size.{size}
      description: The glyph box is a square of 1em; `size` sets that em (font-size
        on the element), so the box tracks the type scale. With `inline`, font-size
        is inherited instead and `overrides.size` is a no-op (the hook is still set,
        for consistency). Non-inline icons are display inline-block with vertical-align
        middle; inline ones sit at vertical-align -0.125em.
      locked: false
    color:
      token: color.foreground
      description: 'The default is inherit (currentColor): glyphs take the text color,
        so a Button, Link or Alert colors them for free, and color.foreground is only
        what inheritance resolves to at the root. The CSS hook therefore defaults
        to `currentColor`, not to the token — defaulting it to the token would break
        that inheritance — and color.foreground is what it resolves to at the root.
        `overrides.color` sets an explicit color. On React Native, where there is
        no currentColor, the order is: the `color` prop, else `overrides.color`, else
        the enclosing Text''s TextStyleContext colour whenever the glyph is nested
        in a Text (nesting alone is enough; `inline` governs only the size), else
        color.foreground.'
      locked: false
    strokeWidth:
      token: border.width.focus
      description: 'Stroke thickness of line glyphs (check, dash, chevrons, close,
        plus, minus, external, search, arrows, calendar, menu), in screen pixels at
        every size (vector-effect non-scaling-stroke), so glyphs stay legible at xs.
        Filled glyphs have no stroke: each is one evenodd path whose inner mark is
        a hole. All three platforms; on React Native through react-native-svg. The
        binding is locked — it sits on a token that carries an accessibility guarantee
        — so it is not a member of the overrides type, though the `--ds-icon-stroke-width`
        hook still exists for a consumer''s own CSS. A composite that binds its own
        indicator stroke to the same token (Checkbox''s `indicatorStroke`) is locked
        for the same reason and forwards nothing: the two already resolve to one value.
        react-native-svg honours `vector-effect` only under react-native-web, so web
        passes the raw token with `vectorEffect="non-scaling-stroke"` and native passes
        the token scaled into the 16-grid at the rendered size, which is what keeps
        a native stroke from thickening at xl.'
      locked: true
  a11y:
    role: img
    requires:
    - accessible-name
  platforms:
    web:
      element: svg
      attributes:
      - viewBox=0 0 16 16
      - aria-hidden
      - role
      - aria-label
      - focusable=false
      notes: 'One inline <svg viewBox="0 0 16 16" width="1em" height="1em"> per glyph,
        from a `paths` table exported from Icon.tsx (module export, not re-exported
        from the package index; no sprite, no icon font, no dependency). Root svg:
        fill none, stroke currentColor; filled glyphs set fill currentColor / stroke
        none on their own path. `focusable="false"` for old Edge. Decorative icons:
        aria-hidden="true"; labelled: role="img" aria-label. The svg is both the root
        and the `glyph` part, carrying `data-ds="Icon"` and `data-part="glyph"` on
        the one element. An unknown `name` is unreachable from TypeScript but possible
        from JavaScript: every platform renders an empty glyph and warns, on every
        render, with no dedupe. The empty glyph keeps the label or decorative accessibility
        props, so an unlabelled unknown icon stays hidden.'
    lit:
      tag: ds-icon
      reflect:
      - name
      - size
      - inline
      notes: 'Renders the same <svg> in the shadow root carrying `part="glyph"` and
        `data-part="glyph"`; the host is display: inline-flex with vertical-align:
        middle and font-size: var(--ds-icon-size), and the <svg> is 1em, so the box
        works as it does on web; `:host([inline])` is inline-block with font-size
        inherit instead. The inline-flex host differs from web''s inline-block on
        purpose: the host is a box around a shadow <svg>, not the svg itself. The
        host colour is `color: var(--ds-icon-color)`, never a bare `inherit`, so `overrides.color`
        reaches it. :host([hidden]) { display: none }. The role and the accessible
        name live on that <svg>, not on the host — this is the one primitive whose
        semantics sit inside the shadow root, because the glyph is the image. No delegatesFocus
        — the icon is never focusable. color inherits through the shadow root, so
        a ds-icon inside ds-button takes the button foreground. The paths table lives
        in Icon.ts and is imported by no one else — other components use <ds-icon
        name>, never the paths.'
    rn:
      element: Svg
      props:
      - width
      - height
      - viewBox
      - fill
      - stroke
      - strokeWidth
      - fillRule
      - vectorEffect
      - testID
      - accessibilityRole=image
      - accessibilityLabel
      - accessibilityElementsHidden
      - importantForAccessibility
      notes: 'react-native-svg is the one sanctioned native dependency (decision 2026-09-10):
        the same 16-grid `paths` table as web renders through <Svg viewBox="0 0 16
        16" width={size} height={size} fill="none" stroke={color}> with <Path> children,
        strokeWidth from border.width.focus scaled to the 16-grid at the rendered
        size (vectorEffect="non-scaling-stroke" where the platform honors it), filled
        glyphs with fill={color} stroke="none". `strokeWidth`, `fillRule` and `vectorEffect`
        in the props list go on each <Path>, since fill-or-stroke is chosen per glyph,
        and `vectorEffect` is passed only when Platform.OS is web — native gets the
        scaled width instead, never both. `color` is an explicit prop (no currentColor
        on native) defaulting to color.foreground, and a nested icon reads the enclosing
        Text through `TextStyleContext` — the real export, which carries the resolved
        fontSize, color and nesting flag; there is no boolean TextNestingContext.
        An Svg inside an RN Text is centred by the text renderer with no baseline
        control, so `inline` here matches size and colour only and the glyph sits
        slightly higher than on web: a platform limit, not a bug. The root is react-native-svg''s
        Svg, whose ref is a class instance rather than a view handle, so Icon exposes
        no ref; it carries `testID="Icon"` and no separate part hook. Decorative:
        accessibilityElementsHidden + importantForAccessibility="no"; labelled: accessibilityRole="image"
        + accessibilityLabel, accessibilityElementsHidden false and importantForAccessibility="auto".'
    swiftui:
      element: Path
      props:
      - .frame
      - .accessibilityHidden
      - .accessibilityLabel
      - .accessibilityAddTraits=isImage
      - .foregroundStyle=inherit
      notes: 'A `Path` from the shared 16×16 path table (`Icon+Paths.swift`, generated
        from the same data as the web SVG) scaled to a square of the `size` token,
        stroked with `border.width.focus` and `.round` caps and joins (line glyphs)
        or filled with even-odd (the status shapes and ellipsis). Color inherits through
        `.foregroundStyle` from the parent; `color` overrides it. Decorative icons
        are `.accessibilityHidden(true)`; a labelled one has `.isImage` and the label.
        `inline` uses `.baselineOffset` so the glyph sits on the text baseline inside
        a `Text` concatenation via `Text(Image(…))` — the package renders inline icons
        as `Image(uiImage:)` from an `ImageRenderer` at the font size, cached per
        size and color. Never SF Symbols: the glyph set is the system''s own on every
        platform.'
  behavior:
  - name: unlabelled-icon-is-hidden-from-assistive-technology
    description: Decorative icons carry no information the adjacent text does not,
      so "Save" is announced as "Save", not "check mark Save" (WCAG 1.1.1).
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
  - name: label-makes-the-icon-meaningful
    description: When set, the icon is exposed as an image with this name; the aria-hidden
      of the decorative case is gone.
    given:
      name: warning
      label: 'Warning: over quota'
    then:
    - role: img
      platforms:
      - web
      - lit
    - attribute: aria-hidden
      is: null
      platforms:
      - web
      - lit
    - attribute: accessibilityElementsHidden
      is: false
      platforms:
      - rn
    - name: 'Warning: over quota'
  - name: empty-label-is-decorative
    description: 'An empty string is the decorative case, not an authoring error:
      the icon stays hidden.'
    given:
      name: check
      label: ''
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
  examples:
  - name: status-in-a-cell
    description: A lone status glyph that is the whole message, so it says what it
      means instead of what it depicts.
    given:
      name: warning
      label: 'Warning: over quota'
  - name: decorative-beside-a-label
    description: The usual case - a glyph next to text, with no label, so the label
      carries the meaning alone. Its story wraps the glyph in a system Text with the
      demo word "Saved" beside it; that word is story scaffolding, not copy.
    given:
      name: check
      size: sm
  - name: inline-in-running-text
    description: An icon sized at 1em of the surrounding text and sitting on its baseline,
      for use inside a Text or Link. Its story nests it at the end of a system Text
      reading "Read the release notes"; that sentence is story scaffolding, not copy.
    given:
      name: external
      inline: true
```

## Constants and examples

- example `status-in-a-cell`, story `StatusInACell`: given `name: "warning"`, `label: "Warning: over quota"`; A lone status glyph that is the whole message, so it says what it means instead of what it depicts.
- example `decorative-beside-a-label`, story `DecorativeBesideALabel`: given `name: "check"`, `size: "sm"`; The usual case - a glyph next to text, with no label, so the label carries the meaning alone. Its story wraps the glyph in a system Text with the demo word "Saved" beside it; that word is story scaffolding, not copy.
- example `inline-in-running-text`, story `InlineInRunningText`: given `name: "external"`, `inline: true`; An icon sized at 1em of the surrounding text and sitting on its baseline, for use inside a Text or Link. Its story nests it at the end of a system Text reading "Read the release notes"; that sentence is story scaffolding, not copy.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `size`, `color`
Locked (accessibility-bearing, never overridable): `strokeWidth`

## Behavior scenarios (36)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: unlabelled-icon-is-hidden-from-assistive-technology
  description: Decorative icons carry no information the adjacent text does not, so
    "Save" is announced as "Save", not "check mark Save" (WCAG 1.1.1).
  then:
  - attribute: aria-hidden
    is: 'true'
- name: label-makes-the-icon-meaningful
  description: When set, the icon is exposed as an image with this name; the aria-hidden
    of the decorative case is gone.
  given:
    name: warning
    label: 'Warning: over quota'
  then:
  - role: img
  - attribute: aria-hidden
    is: null
  - name: 'Warning: over quota'
- name: empty-label-is-decorative
  description: 'An empty string is the decorative case, not an authoring error: the
    icon stays hidden.'
  given:
    name: check
    label: ''
  then:
  - attribute: aria-hidden
    is: 'true'
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-name-check
  given:
    name: check
  then:
  - renders: true
  derived: true
- name: renders-name-dash
  given:
    name: dash
  then:
  - renders: true
  derived: true
- name: renders-name-chevron-right
  given:
    name: chevron-right
  then:
  - renders: true
  derived: true
- name: renders-name-chevron-down
  given:
    name: chevron-down
  then:
  - renders: true
  derived: true
- name: renders-name-chevron-up
  given:
    name: chevron-up
  then:
  - renders: true
  derived: true
- name: renders-name-chevron-left
  given:
    name: chevron-left
  then:
  - renders: true
  derived: true
- name: renders-name-close
  given:
    name: close
  then:
  - renders: true
  derived: true
- name: renders-name-plus
  given:
    name: plus
  then:
  - renders: true
  derived: true
- name: renders-name-minus
  given:
    name: minus
  then:
  - renders: true
  derived: true
- name: renders-name-info
  given:
    name: info
  then:
  - renders: true
  derived: true
- name: renders-name-success
  given:
    name: success
  then:
  - renders: true
  derived: true
- name: renders-name-warning
  given:
    name: warning
  then:
  - renders: true
  derived: true
- name: renders-name-danger
  given:
    name: danger
  then:
  - renders: true
  derived: true
- name: renders-name-external
  given:
    name: external
  then:
  - renders: true
  derived: true
- name: renders-name-ellipsis
  given:
    name: ellipsis
  then:
  - renders: true
  derived: true
- name: renders-name-search
  given:
    name: search
  then:
  - renders: true
  derived: true
- name: renders-name-arrow-right
  given:
    name: arrow-right
  then:
  - renders: true
  derived: true
- name: renders-name-arrow-left
  given:
    name: arrow-left
  then:
  - renders: true
  derived: true
- name: renders-name-calendar
  given:
    name: calendar
  then:
  - renders: true
  derived: true
- name: renders-name-menu
  given:
    name: menu
  then:
  - renders: true
  derived: true
- name: renders-name-list
  given:
    name: list
  then:
  - renders: true
  derived: true
- name: renders-name-grid
  given:
    name: grid
  then:
  - renders: true
  derived: true
- name: renders-name-play
  given:
    name: play
  then:
  - renders: true
  derived: true
- name: renders-name-pause
  given:
    name: pause
  then:
  - renders: true
  derived: true
- name: renders-name-folder
  given:
    name: folder
  then:
  - renders: true
  derived: true
- name: renders-name-file
  given:
    name: file
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
- name: has-accessible-name
  given:
    label: Accessible name
  then:
  - name: true
  derived: true
```

## Platform notes (web)

```yaml
element: svg
attributes:
- viewBox=0 0 16 16
- aria-hidden
- role
- aria-label
- focusable=false
notes: 'One inline <svg viewBox="0 0 16 16" width="1em" height="1em"> per glyph, from
  a `paths` table exported from Icon.tsx (module export, not re-exported from the
  package index; no sprite, no icon font, no dependency). Root svg: fill none, stroke
  currentColor; filled glyphs set fill currentColor / stroke none on their own path.
  `focusable="false"` for old Edge. Decorative icons: aria-hidden="true"; labelled:
  role="img" aria-label. The svg is both the root and the `glyph` part, carrying `data-ds="Icon"`
  and `data-part="glyph"` on the one element. An unknown `name` is unreachable from
  TypeScript but possible from JavaScript: every platform renders an empty glyph and
  warns, on every render, with no dedupe. The empty glyph keeps the label or decorative
  accessibility props, so an unlabelled unknown icon stays hidden.'
```

## Guidance

## Overview

Icons are the one place Tier 1 had nothing to build from: every component drew its own check mark, chevron and status shape. Icon centralizes them. It is a primitive, not a design element in its own right: it has no tone of its own, takes its color from the text it sits in, and its size from the type scale, so a glyph beside a label always matches the label.

## When to use

Use an Icon wherever a component's anatomy names one: the leading icon in a Button, the chevron in a Disclosure, the status shape in an Alert, the check in a Checkbox, the external mark on a Link, the ellipsis in a collapsed Breadcrumb. Use `inline` when the icon is inside running text. Give it a `label` only when the icon is the whole message — a lone warning triangle in a table cell, say — and the label is what a screen reader should say instead.

## When not to use

Do not use an Icon as a button; wrap it in a Button with `iconOnly` and a `label`, which brings the target size, focus ring and accessible name. Do not use Icons as illustration or decoration at large sizes; that is an Illustration component (not planned) or an image. Do not add a glyph to the set for one screen; the set grows when a *component* needs a shape, and until then product code passes its own SVG to the slot that accepts content.

## Behavior

An Icon renders a single glyph at the requested size and does nothing else: no interaction, no focus, no animation. Its color is the surrounding text color on web and Lit (`currentColor`); on React Native the parent supplies it. Decorative icons (no `label`) are invisible to assistive technology so that "Save" is announced as "Save", not "check mark Save". Labelled icons are announced as images with their label.

## Content guidelines

`tools/icon-paths.json` is the only source for geometry and for whether a glyph is filled or stroked: every platform draws the `d` strings in it verbatim, and where this prose and the JSON disagree the JSON wins and the prose is what should be corrected. What the descriptions below are for is intent, not coordinates. The filled glyphs are the four status shapes, `ellipsis`, `play` and `pause`; everything else is a line glyph, including `list`, `grid`, `folder` and `file`. `list` draws its three rules and its three bullets in one unfilled path, the bullets as zero-length round-capped strokes, because a glyph is fill-or-stroke as a whole and a separate filled circle would need a second path. Glyph names describe the shape or the universal meaning, not the use ("chevron-down", "close", "warning"), so the same icon can serve many components. `dash` is the short indeterminate mark (4–12 on the grid) used by Checkbox; `minus` is the full-width line (3–13) that pairs with `plus`. `danger` is an octagon with an ×; Alert's current exclamation octagon changes to it when Alert is regenerated to compose Icon. A `label`, when used, says what the icon means in context ("Warning: over quota"), not what it depicts ("triangle").

## Accessibility

Decorative icons are hidden from assistive technology (WCAG 1.1.1: they carry no information the adjacent text does not). Meaningful icons expose role `img` and an accessible name from `label` (1.1.1, 4.1.2). Icons never convey information by color alone: the four status glyphs are four different shapes (1.4.1). Because they are drawn in the text color, they inherit whatever contrast the text has; components that place an icon on a tinted surface (Alert, Meter) declare that pair themselves. Line glyphs use the focus-ring width as their stroke so they stay legible at `xs` (1.4.11 applies only when the icon is meaningful, and a labelled icon then sits in a component that declares the pair).

## Platform notes

### Web
Export a `paths` table keyed by `name`, drawn on a 16×16 grid: line glyphs are bare `<path>`s inheriting the root's `fill="none" stroke="currentColor"`; the four status shapes, the ellipsis, `play` and `pause` are single `fill="currentColor" stroke="none" fill-rule="evenodd"` paths whose inner mark is a hole. Render `<svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">` with `stroke-width: var(--border-width-focus)` and `vector-effect: non-scaling-stroke` on paths in CSS. Size: `font-size: var(--font-size-{size})` on the element (attributes cannot take custom properties); `display: inline-block; vertical-align: middle`; with `inline`, `font-size: inherit; vertical-align: -0.125em`. The `d` strings come verbatim from `tools/icon-paths.json`. Decorative: `aria-hidden="true"`; labelled: `role="img"` and `aria-label`. Always `focusable="false"`. Button, Link, Alert, Disclosure, Checkbox, RadioGroup and Breadcrumb should be updated to render `<Icon>` instead of their private glyphs in the next regeneration.

### Lit
`<ds-icon name="check" size="sm">` renders the same SVG in its shadow root; `:host { display: inline-flex; vertical-align: middle; font-size: var(--ds-icon-size); color: var(--ds-icon-color) }` and `:host([inline]) { display: inline-block; vertical-align: -0.125em; font-size: inherit; inline-size: 1em; block-size: 1em }`. Reflect `name`, `size` and `inline`. The paths table is a module-private constant; other elements compose `<ds-icon>`.

### React Native
Import `Svg` and `Path` from `react-native-svg` and render the shared `paths` table (a `paths.ts` in the RN package, written from `tools/icon-paths.json`): `<Svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">` with `<Path d strokeWidth>` per glyph; filled glyphs pass `fill={color} stroke="none" fillRule="evenodd"` on their Path. `size` and `strokeWidth` come from the tokens through `useTheme()`. With `inline` nested in the system Text, size from the parent's font size via `TextStyleContext`; otherwise `font.size.md`. `color` from the prop, then `overrides.color`, then the enclosing Text's colour, then `color.foreground`. Decorative: `accessibilityElementsHidden`, `importantForAccessibility="no"`; labelled: `accessibilityRole="image"`, `accessibilityLabel`. No Unicode fallback remains.

## Related

Button, Link, Alert, Disclosure, Checkbox, Breadcrumb.
