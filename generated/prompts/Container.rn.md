# Generate: Container for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Container.tsx` exporting a typed React Native function component named `Container`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `ContainerProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Container> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Container.test.tsx`.

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
  name: Container
  category: layout
  status: review
  anatomy:
  - column
  props:
    children:
      type: content
      required: true
      description: 'The page or region content, usually a Stack with `gap: section`
        between regions. A string given as `children` in an example is an illustrative
        label, not content to build: stories render it inside a Text on every platform
        (native requires one) and do not construct the Stack it names.'
    width:
      type: enum
      values:
      - prose
      - content
      - page
      - full
      default: content
      description: '`prose` for reading (a 65-character measure), `content` for most
        screens, `page` for full-bleed layouts with wide grids, `full` for no cap
        (gutters only).'
    gutter:
      type: enum
      values:
      - narrow
      - default
      - wide
      - none
      default: default
      description: 'Horizontal padding at the viewport edge. Responsive: `default`
        uses the narrow gutter under the content width and the wide gutter above the
        page width. `none` for a nested container inside a padded parent.'
    align:
      type: enum
      values:
      - center
      - start
      default: center
      description: 'Where the capped column sits in a wider viewport. `start` sets
        `margin-inline: 0` on both sides, not just the start side, so the column never
        picks up an asymmetric margin. React Native has no margin here: `center` maps
        to `alignSelf: center` and `start` to `alignSelf: flex-start`.'
    element:
      type: enum
      values:
      - div
      - main
      - section
      default: div
      description: Use `main` for the page's main column when no Landmark wraps it.
        A page has exactly one `main`; that is the author's responsibility, since
        the component cannot see the rest of the page, so it neither enforces it nor
        warns.
      platforms:
      - web
      - lit
  styles:
    maxWidth:
      token: layout.maxWidth.{width}
      description: '`full` renders no max-width — the literal `none`, with no hook,
        which also makes an override of this binding a no-op at that value; the binding
        covers the other three. No dev warning fires for an override that has no effect.'
      locked: false
    paddingInline:
      token: layout.gutter.{gutter}
      description: '`none` renders no padding (a literal 0, with no hook), which also
        makes an override of this binding a no-op at that value, with no dev warning.
        `narrow` and `wide` are fixed at every viewport. Only `default` is responsive:
        `layout.gutter.narrow` below layout.maxWidth.content, `layout.gutter.default`
        (the `--layout-gutter` variable) from layout.maxWidth.content, and `layout.gutter.wide`
        from layout.maxWidth.page. Both boundaries are inclusive (`>=`, a min-width
        query), so a viewport exactly at a token width takes the wider gutter. An
        override of this binding replaces the value at every viewport width, including
        the whole responsive `default` gutter, not just its middle band.'
      locked: false
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: 'Block element with max-width, margin-inline auto (or 0 for align start)
        and padding-inline from tokens; the responsive gutter uses two media queries
        keyed to the maxWidth tokens (min-width: var() is not valid in media queries,
        so the generator reads the resolved px values from the token file at build
        time — the one place a resolved number appears, marked literal-ok). The breakpoint
        px come from the default theme, calm-precise (960 / 1280); the CSS is one
        theme-independent file, so under a theme with other maxWidth values the cap
        follows the theme (it is a custom property) but the gutter switches at calm-precise
        widths — a known limit. The block `element: div` is the default; the root
        renders whichever tag the `element` prop chooses. The root is the `column`
        part and carries `data-part="column"`, as Box''s root carries `surface`.'
    lit:
      tag: ds-container
      reflect:
      - width
      - gutter
      - align
      notes: 'The host is the column (`:host { display: block }`) with a default slot.
        Same media-query note as web. A custom element cannot retag its host, so `element`
        sets an ElementInternals role for `main` only; `div` and `section` set none,
        since a section is a region only when it is named. The role stays on ElementInternals,
        as in Box, with no `role` attribute added to the host; the main-landmark scenario
        is web-only because the test accessibility lookup cannot read ElementInternals.
        The host carries `data-part="column"`.'
    rn:
      element: View
      props: []
      notes: View with maxWidth, alignSelf (center → center, start → flex-start),
        width 100%, paddingHorizontal. `element` is web and Lit only and is absent
        from the native props entirely, as in Box. The responsive gutter uses useWindowDimensions
        against the active theme's maxWidth tokens, with the same inclusive `>=` boundaries
        as web. The component forwards a ref to its root View, typed as Box types
        its ref. On phones the cap rarely applies; on tablets and react-native-web
        it does.
    swiftui:
      element: VStack
      props:
      - .frame=maxWidth
      - .padding=horizontal
      - .frame=maxWidth-infinity
      - GeometryReader
      notes: 'Centers content at `layout.maxWidth.{width}` with horizontal gutters
        from the inset token: `.frame(maxWidth:)` inside `.frame(maxWidth: .infinity)`.
        The `default` gutter follows the same rule as web: narrow below the content
        width, default from it, wide from the page width (a `GeometryReader` on the
        container''s own width, never `UIScreen`). Safe-area insets are respected
        by default (`ignoresSafeArea` is never applied by a component).'
  behavior:
  - name: main-element-is-the-page-landmark
    description: 'Container adds no semantics unless element: main is chosen, in which
      case it is the page''s main landmark and there must be exactly one.'
    given:
      element: main
    then:
    - role: main
      platforms:
      - web
  examples:
  - name: application-screen
    description: The default page column for application screens, centered at the
      content measure.
    given:
      children: A Stack of page regions
      width: content
  - name: reading-measure
    description: An article capped at the prose measure, about 65 characters a line.
    given:
      children: An article
      width: prose
  - name: nested-section
    description: A narrower measure inside an already padded parent, so the gutters
      are not applied twice.
    given:
      children: A narrower section
      width: prose
      gutter: none
```

## Constants and examples

- example `application-screen`, story `ApplicationScreen`: given `children: "A Stack of page regions"`, `width: "content"`; The default page column for application screens, centered at the content measure.
- example `reading-measure`, story `ReadingMeasure`: given `children: "An article"`, `width: "prose"`; An article capped at the prose measure, about 65 characters a line.
- example `nested-section`, story `NestedSection`: given `children: "A narrower section"`, `width: "prose"`, `gutter: "none"`; A narrower measure inside an already padded parent, so the gutters are not applied twice.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `maxWidth`, `paddingInline`
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (11)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-width-prose
  given:
    width: prose
  then:
  - renders: true
  derived: true
- name: renders-width-content
  given:
    width: content
  then:
  - renders: true
  derived: true
- name: renders-width-page
  given:
    width: page
  then:
  - renders: true
  derived: true
- name: renders-width-full
  given:
    width: full
  then:
  - renders: true
  derived: true
- name: renders-gutter-narrow
  given:
    gutter: narrow
  then:
  - renders: true
  derived: true
- name: renders-gutter-default
  given:
    gutter: default
  then:
  - renders: true
  derived: true
- name: renders-gutter-wide
  given:
    gutter: wide
  then:
  - renders: true
  derived: true
- name: renders-gutter-none
  given:
    gutter: none
  then:
  - renders: true
  derived: true
- name: renders-align-center
  given:
    align: center
  then:
  - renders: true
  derived: true
- name: renders-align-start
  given:
    align: start
  then:
  - renders: true
  derived: true
```

## Platform notes (rn)

```yaml
element: View
props: []
notes: "View with maxWidth, alignSelf (center \u2192 center, start \u2192 flex-start),\
  \ width 100%, paddingHorizontal. `element` is web and Lit only and is absent from\
  \ the native props entirely, as in Box. The responsive gutter uses useWindowDimensions\
  \ against the active theme's maxWidth tokens, with the same inclusive `>=` boundaries\
  \ as web. The component forwards a ref to its root View, typed as Box types its\
  \ ref. On phones the cap rarely applies; on tablets and react-native-web it does."
```

## Guidance

## Overview

Container is where a screen's horizontal rhythm is decided once. It puts the gutter at the viewport edge and caps how wide content can get, so a form on a phone, a dashboard on a laptop and an article on a wide monitor all sit on the same measure — and no component ever needs to know how wide the page is.

## When to use

Wrap every page's content in one Container, inside the `main` Landmark, with `width: content` for application screens and `width: prose` for reading. Use `page` for layouts with wide data grids or side-by-side panels, and `full` only for edge-to-edge sections (a hero, a map) that manage their own inner Container. Nest a `gutter: none` Container inside a padded parent when a section needs a narrower measure than the page.

## When not to use

Do not use Container for spacing between things (Stack) or for a surface (Box, Card). Do not put a Container inside a Card. Do not set widths on components to make them line up; make the Container narrower.

## Behavior

Container renders a block that is the full viewport width minus the gutter, centered (or start-aligned) once the viewport exceeds the cap. The `default` gutter is responsive: narrow below the content width, default between, wide above the page width, so the edge breathes more as the screen grows. Nothing else changes with the viewport; components inside reflow on their own.

## Content guidelines

None.

## Accessibility

Content reflows to a single column at 320px wide without horizontal scrolling because the Container never sets a minimum width and the gutter shrinks on narrow viewports (WCAG 1.4.10). Prose measure keeps lines under about 80 characters, which helps readers with dyslexia and low vision (1.4.8, AAA advisory). Container adds no semantics unless `element: main` is chosen, in which case it is the page's main landmark and there must be exactly one.

## Platform notes

### Web
`display: block; max-inline-size: var(--layout-max-width-{width}); margin-inline: auto; padding-inline: var(--layout-gutter-narrow)`, then `@media (min-width: <content px>) { padding-inline: var(--layout-gutter) }` and `@media (min-width: <page px>) { padding-inline: var(--layout-gutter-wide) }`. The two breakpoint numbers are read from the default theme's (calm-precise) built token JSON at generation time and marked `literal-ok: breakpoint from layout.maxWidth.*`; custom properties cannot be used in media queries.

### Lit
`<ds-container width="content">`; the host is the column with the same rules on `:host`. Same breakpoint note.

### React Native
`View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.*` (undefined for `full`), `alignSelf` from `align`, and `paddingHorizontal` chosen by comparing `useWindowDimensions().width` with the content and page tokens.

## Related

Stack, Box, Card, Landmark.
