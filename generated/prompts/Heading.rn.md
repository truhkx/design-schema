# Generate: Heading for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Heading.tsx` exporting a typed React Native function component named `Heading`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `HeadingProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Heading> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Heading.test.tsx`.

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
      description: Position in the document outline. Controls the semantic element,
        not the visual size. Canonical values are strings; generated components also
        accept the number.
      a11y: Screen-reader users navigate by heading level; levels must not skip (h1
        → h3).
    size:
      type: enum
      values:
      - 4xl
      - 3xl
      - 2xl
      - xl
      - lg
      - md
      description: 'Visual size, independent of level. Defaults per level: 1 → 4xl,
        2 → 3xl, 3 → 2xl, 4 → xl, 5 → lg, 6 → md.'
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
      description: Horizontal text alignment.
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
      locked: true
    marginBlockEnd:
      token: space.sm
      description: Space below the heading (marginBottom on React Native — the one
        margin the system allows, because a heading owns the gap to its own first
        paragraph).
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
      notes: The element is chosen by `level`. Never use `role="heading"` on a div
        when a real heading element is available.
    lit:
      tag: ds-heading
      reflect:
      - level
      - size
      - align
      notes: Renders the matching <h1>–<h6> inside the shadow root. Note that headings
        inside shadow roots are exposed to assistive technology normally, but some
        in-page outline tools do not see them.
    rn:
      element: Text
      props:
      - accessibilityRole=header
      notes: iOS and Android have no heading levels. `level` maps only to typography;
        the header trait is set regardless of level. Document the outline in the screen's
        design instead.
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
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`, `marginBlockEnd`
Locked (accessibility-bearing, never overridable): `color`

## Behavior scenarios (16)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (rn)

```yaml
element: Text
props:
- accessibilityRole=header
notes: iOS and Android have no heading levels. `level` maps only to typography; the
  header trait is set regardless of level. Document the outline in the screen's design
  instead.
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
`level` selects the element. `size` maps to `font.size.*` via a class or inline custom property; the default size per level is 1→4xl, 2→3xl, 3→2xl, 4→xl, 5→lg, 6→md.

### Lit
`<ds-heading level="2">` renders `<h2>` inside its shadow root. `level`, `size` and `align` are reflected as attributes. Because the heading lives in a shadow root, styling comes through the `--ds-heading-*` hooks and `overrides`, never `::part`; `part="heading"` may remain on the inner element as an anatomy hook only.

### React Native
Renders `Text` with `accessibilityRole="header"`. `level` chooses the default size only. iOS VoiceOver exposes the header trait but not a level; Android TalkBack likewise. Do not simulate levels with `accessibilityLabel` prefixes like "Heading level 2" — it is noisy and non-standard.

## Related

Text, Section (planned).
