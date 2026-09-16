# Generate: Stack for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Stack.tsx` exporting a typed React Native function component named `Stack`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `StackProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Stack> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Stack.test.tsx`.

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
  name: Stack
  category: layout
  status: review
  anatomy:
  - container
  props:
    children:
      type: content
      required: true
      description: Any components. Stack does not style its children; it only positions
        them.
    direction:
      type: enum
      values:
      - vertical
      - horizontal
      default: vertical
      description: Main axis. `horizontal` follows writing direction (start→end),
        not left→right.
    gap:
      type: enum
      values:
      - none
      - tight
      - normal
      - loose
      - section
      default: normal
      description: 'Space between children, from the layout rhythm (`layout.gap.*`),
        not the raw spacing scale: tight for related controls, normal for fields in
        a form, loose for groups, section between page sections. The only way to set
        spacing between siblings.'
    align:
      type: enum
      values:
      - start
      - center
      - end
      - stretch
      default: stretch
      description: Cross-axis alignment.
    justify:
      type: enum
      values:
      - start
      - center
      - end
      - between
      default: start
      description: Main-axis distribution.
    wrap:
      type: boolean
      default: false
      description: Allow horizontal stacks to wrap onto new lines instead of overflowing.
      a11y: Prefer wrapping over horizontal scrolling so content reflows at 320px
        and 400% zoom.
    element:
      type: enum
      values:
      - div
      - section
      - nav
      - ul
      - ol
      default: div
      description: Landmark or list semantics when the group has meaning. For `ul`/`ol`,
        each child is wrapped in an `li`.
      platforms:
      - web
      - lit
  styles:
    gap:
      token: layout.gap.{gap}
      description: '`gap: none` renders no gap and makes `overrides.gap` a no-op,
        per the presence rule.'
      locked: false
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: Flexbox. `gap` maps to the CSS gap property with the layout.gap token;
        no margins on children.
    lit:
      tag: ds-stack
      reflect:
      - direction
      - gap
      - align
      - justify
      - wrap
      notes: 'The host is the flex container (`:host { display: flex }`) with a default
        slot, so children stay in the light DOM and keep their own semantics.'
    rn:
      element: View
      props:
      - style
      notes: Flexbox with `gap` (RN ≥ 0.71). Children are not wrapped. `element` is
        not applicable; use `accessibilityRole` on the content instead.
    swiftui:
      element: VStack
      props:
      - HStack
      - spacing
      - alignment
      - .frame
      - ViewThatFits
      - .accessibilityElement=contain
      notes: '`VStack`/`HStack` with `spacing` from the gap token and `alignment`
        from `align`; `wrap` uses a `Layout`-conforming `FlowLayout` in `Support/`
        (SwiftUI has no flex-wrap). `direction: responsive` (row above a width, column
        below) is `ViewThatFits(in: .horizontal)` with the HStack first. Dividers
        between items (`divider: true`) are the system `Divider` inserted by `ForEach`
        over the subviews via `Group` + `_VariadicView`-free approach: children are
        passed as an array of views through the package''s `Stack { … }` result builder,
        so Stack can interleave.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `gap`
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (16)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-direction-vertical
  given:
    direction: vertical
  then:
  - renders: true
  derived: true
- name: renders-direction-horizontal
  given:
    direction: horizontal
  then:
  - renders: true
  derived: true
- name: renders-gap-none
  given:
    gap: none
  then:
  - renders: true
  derived: true
- name: renders-gap-tight
  given:
    gap: tight
  then:
  - renders: true
  derived: true
- name: renders-gap-normal
  given:
    gap: normal
  then:
  - renders: true
  derived: true
- name: renders-gap-loose
  given:
    gap: loose
  then:
  - renders: true
  derived: true
- name: renders-gap-section
  given:
    gap: section
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
- name: renders-align-stretch
  given:
    align: stretch
  then:
  - renders: true
  derived: true
- name: renders-justify-start
  given:
    justify: start
  then:
  - renders: true
  derived: true
- name: renders-justify-center
  given:
    justify: center
  then:
  - renders: true
  derived: true
- name: renders-justify-end
  given:
    justify: end
  then:
  - renders: true
  derived: true
- name: renders-justify-between
  given:
    justify: between
  then:
  - renders: true
  derived: true
```

## Platform notes (rn)

```yaml
element: View
props:
- style
notes: "Flexbox with `gap` (RN \u2265 0.71). Children are not wrapped. `element` is\
  \ not applicable; use `accessibilityRole` on the content instead."
```

## Guidance

## Overview

Stack is how things get spaced. Instead of margins on individual components, a Stack owns the gap between its children, using one of the theme's rhythm presets (`layout.gap.*`) rather than a raw number, so a theme with `layout.rhythm: loose` opens up every screen at once. Almost every screen is stacks inside stacks.

## When to use

Use Stack for any group of siblings that should be evenly spaced: form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach for it before writing any layout CSS. Choose `element` when the group has meaning — `nav` for navigation, `ul` for a list of like items — so the structure is exposed to assistive technology.

## When not to use

Do not use Stack for two-dimensional layouts (use Grid, planned) or for positioning a single element (use spacing tokens on the parent). Do not set gaps between children by adding margins to the children; that defeats the purpose.

## Behavior

Stack is purely presentational: no events, no state. `horizontal` stacks overflow by default; set `wrap` so content reflows on narrow viewports. `align: stretch` (the default) makes children fill the cross axis, which is what buttons in a vertical stack usually want; set `start` for natural widths.

## Accessibility

Stack has no role by default and adds nothing to the accessibility tree. When `element` is a landmark or list, the correct semantics are rendered (`nav`, `ul` with `li` children). Horizontal stacks should wrap rather than scroll so content reflows at 320px width and 400% zoom (WCAG 1.4.10). Spacing from the scale keeps interactive targets separated enough to meet 2.5.8 target spacing when the targets themselves are small.

## Platform notes

### Web
`display: flex` with `flex-direction`, `gap: var(--layout-gap-<preset>)`, `align-items`, `justify-content`, and `flex-wrap`. `between` maps to `space-between`.

### Lit
`<ds-stack direction="horizontal" gap="tight">`. The host itself is the flex container; children are slotted light-DOM nodes, so their semantics are untouched. `element="ul"` renders the slot inside a `<ul role="list">` and wraps each assigned node in an `<li>` via slotchange.

### React Native
`View` with `flexDirection`, `gap` from the RN token object, `alignItems`, `justifyContent`, `flexWrap`. `start`/`end` map to `flex-start`/`flex-end`.

## Related

Form, Button.
