# Generate: Icon as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Icon.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Icon.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: IconVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Icon.test.ts`.

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
      description: 'Which glyph. The set is deliberately small and grows only when
        a component needs a shape; `info`, `success`, `warning` and `danger` are the
        four status shapes (circle-i, circle-check, triangle-!, octagon-x) so tone
        is never carried by color alone. `name` has no default; the Default story
        renders `check`. Enum stories for hyphenated names capitalise each segment
        and join them: `NameChevronRight`, `NameArrowLeft`.'
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
        for consistency, and on web the `ds-icon--{size}` modifier class stays applied;
        `.ds-icon--inline` is declared later and wins). A non-inline `overrides.size`
        is written as the `--ds-icon-size` hook inline, so it outranks the `ds-icon--{size}`
        modifier's declaration of the same hook. React Native has no hook, so there
        the override is simply ignored while inline. Non-inline icons are display
        inline-block with vertical-align middle (the Lit host is inline-flex instead;
        see its note); inline ones sit at vertical-align -0.125em.
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
        in a Text (nesting alone is enough; `inline` governs only the size; any `TextStyleContext`
        provider with `nested: true` counts, so a Heading or Link colours it too),
        else color.foreground.'
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
        render, with no dedupe. The warning is developer-facing, not copy, so it has
        no copy key: exactly `Icon: unknown name "<name>"`, with nothing appended;
        an absent `name` takes the same path and prints `Icon: unknown name "undefined"`.
        The empty glyph is the root svg (or native Svg) with its size, viewBox and
        `fill="none"` and no path. It has no behavior scenario (a scenario takes only
        canonical values), so each platform''s own test file covers it. The empty
        glyph keeps the label or decorative accessibility props, so an unlabelled
        unknown icon stays hidden. Icon drops a JavaScript caller''s `className` and
        `style`: the component''s own class and the overrides style are written over
        them, as the package rule for `...rest` says.'
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
        semantics sit inside the shadow root, because the glyph is the image, and
        the one exception to the rule that names tests read are plain host attributes:
        Icon''s behavior tests query the shadow <svg>. The <svg> carries the same
        `width="1em" height="1em"` attributes as on web; `data-ds="Icon"` sits on
        the host only, and the <svg> carries `data-part` and `part`. No delegatesFocus
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
        size (`strokeWidth × grid / size`, with `grid` read from the paths table''s
        `grid` field, which paths.ts copies from icon-paths.json, rather than a literal
        16) (vectorEffect="non-scaling-stroke" where the platform honors it), filled
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
        accessibilityElementsHidden + importantForAccessibility="no" and no accessibilityRole
        (`accessibilityRole=image` in the props list is set only when labelled); labelled:
        accessibilityRole="image" + accessibilityLabel, accessibilityElementsHidden
        false and importantForAccessibility="auto".'
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
      carries the meaning alone. Its story wraps the glyph in a system Text of the
      same size (`sm`, and a span element on web and Lit) with the demo word "Saved"
      beside it; that word is story scaffolding, not copy.
    given:
      name: check
      size: sm
  - name: inline-in-running-text
    description: An icon sized at 1em of the surrounding text and sitting on its baseline,
      for use inside a Text or Link. Its story nests it at the end of a system Text
      at its defaults (size md) reading "Read the release notes", on every platform;
      that sentence is story scaffolding, not copy. On React Native the glyph sits
      slightly above the baseline, a platform limit the rn note explains; the story
      is the same.
    given:
      name: external
      inline: true
```

## Constants and examples

- example `status-in-a-cell`, story `StatusInACell`: given `name: "warning"`, `label: "Warning: over quota"`; A lone status glyph that is the whole message, so it says what it means instead of what it depicts.
- example `decorative-beside-a-label`, story `DecorativeBesideALabel`: given `name: "check"`, `size: "sm"`; The usual case - a glyph next to text, with no label, so the label carries the meaning alone. Its story wraps the glyph in a system Text of the same size (`sm`, and a span element on web and Lit) with the demo word "Saved" beside it; that word is story scaffolding, not copy.
- example `inline-in-running-text`, story `InlineInRunningText`: given `name: "external"`, `inline: true`; An icon sized at 1em of the surrounding text and sitting on its baseline, for use inside a Text or Link. Its story nests it at the end of a system Text at its defaults (size md) reading "Read the release notes", on every platform; that sentence is story scaffolding, not copy. On React Native the glyph sits slightly above the baseline, a platform limit the rn note explains; the story is the same.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

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

## Platform notes (lit)

```yaml
tag: ds-icon
reflect:
- name
- size
- inline
notes: "Renders the same <svg> in the shadow root carrying `part=\"glyph\"` and `data-part=\"\
  glyph\"`; the host is display: inline-flex with vertical-align: middle and font-size:\
  \ var(--ds-icon-size), and the <svg> is 1em, so the box works as it does on web;\
  \ `:host([inline])` is inline-block with font-size inherit instead. The inline-flex\
  \ host differs from web's inline-block on purpose: the host is a box around a shadow\
  \ <svg>, not the svg itself. The host colour is `color: var(--ds-icon-color)`, never\
  \ a bare `inherit`, so `overrides.color` reaches it. :host([hidden]) { display:\
  \ none }. The role and the accessible name live on that <svg>, not on the host \u2014\
  \ this is the one primitive whose semantics sit inside the shadow root, because\
  \ the glyph is the image, and the one exception to the rule that names tests read\
  \ are plain host attributes: Icon's behavior tests query the shadow <svg>. The <svg>\
  \ carries the same `width=\"1em\" height=\"1em\"` attributes as on web; `data-ds=\"\
  Icon\"` sits on the host only, and the <svg> carries `data-part` and `part`. No\
  \ delegatesFocus \u2014 the icon is never focusable. color inherits through the\
  \ shadow root, so a ds-icon inside ds-button takes the button foreground. The paths\
  \ table lives in Icon.ts and is imported by no one else \u2014 other components\
  \ use <ds-icon name>, never the paths."
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

`tools/icon-paths.json` is the only source for geometry and for whether a glyph is filled or stroked: every platform draws the `d` strings in it verbatim, from a copy in its own package in the JSON's order (packages cannot import from `tools/` at build time), and where this prose and the JSON disagree the JSON wins and the prose is what should be corrected. What the descriptions below are for is intent, not coordinates. The filled glyphs are the four status shapes, `ellipsis`, `play` and `pause`; everything else is a line glyph, including `list`, `grid`, `folder` and `file`. `list` draws its three rules and its three bullets in one unfilled path, the bullets as zero-length round-capped strokes, because a glyph is fill-or-stroke as a whole and a separate filled circle would need a second path. Glyph names describe the shape or the universal meaning, not the use ("chevron-down", "close", "warning"), so the same icon can serve many components. `dash` is the short indeterminate mark (4–12 on the grid) used by Checkbox; `minus` is the full-width line (3–13) that pairs with `plus`. `danger` is an octagon with an ×; Alert's current exclamation octagon changes to it when Alert is regenerated to compose Icon. A `label`, when used, says what the icon means in context ("Warning: over quota"), not what it depicts ("triangle").

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
