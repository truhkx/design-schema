# Generate: Divider for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Divider.tsx` exporting a typed React Native function component named `Divider`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `DividerProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Divider> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Divider.test.tsx`.

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
    label: Text
  props:
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: Vertical dividers sit between inline siblings (toolbar groups)
        and stretch to the row height.
    label:
      type: string
      description: 'Optional text in the middle of a horizontal divider ("or", "Earlier
        today"). Turns the divider from decorative into a labelled separator (`semantic`
        is implied). Ignored on a vertical divider, with a development warning: a
        vertical line has no room for centered text.'
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
      description: Space on both sides, from the layout rhythm, for dividers used
        outside a Stack that already spaces them.
  styles:
    color:
      token: color.border
      locked: false
    thickness:
      token: border.width.thin
      locked: false
    spacing:
      token: layout.gap.{spacing}
      locked: false
    labelColor:
      token: color.foreground.muted
      locked: true
    labelSize:
      token: font.size.sm
      description: Passed to the composed Text as its `fontSize` override, along with
        `fontFamily`; Divider does not style the Text itself.
      locked: false
    labelGap:
      token: layout.gap.normal
      description: Gap between the label and the lines on each side.
      locked: false
    fontFamily:
      token: font.family.body
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
        separator role, so hiding it is deliberate); a semantic or labelled one is
        <div role="separator" aria-orientation> containing the label text, because
        <hr> cannot hold content. Vertical: inline-size thin, block-size 100% / align-self
        stretch.'
    lit:
      tag: ds-divider
      reflect:
      - orientation
      - semantic
      - spacing
      notes: 'Host is the line (`:host { display: block }`, `:host([orientation="vertical"])
        { display: inline-block }`); role and aria-orientation are set on the host
        via ElementInternals when semantic; `label` is a property rendered in the
        shadow root between two line segments.'
    rn:
      element: View
      props:
      - accessibilityElementsHidden
      - importantForAccessibility
      - accessibilityRole
      notes: 'A View with height (or width) = border.width.thin and backgroundColor
        color.border. Decorative: accessibilityElementsHidden + importantForAccessibility="no".
        Semantic: there is no separator role on native; render the label (if any)
        as Text so it is read, otherwise the divider stays hidden — announcing "separator"
        has no native idiom.'
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
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `color`, `thickness`, `spacing`, `labelSize`, `labelGap`, `fontFamily`
Locked (accessibility-bearing, never overridable): `labelColor`

## Behavior scenarios (7)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityElementsHidden
- importantForAccessibility
- accessibilityRole
notes: "A View with height (or width) = border.width.thin and backgroundColor color.border.\
  \ Decorative: accessibilityElementsHidden + importantForAccessibility=\"no\". Semantic:\
  \ there is no separator role on native; render the label (if any) as Text so it\
  \ is read, otherwise the divider stays hidden \u2014 announcing \"separator\" has\
  \ no native idiom."
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

Decorative dividers are hidden from assistive technology so lists do not announce "separator" between every row (WCAG 1.3.1 — structure is conveyed by the list, not the line). Semantic dividers expose role `separator` with `aria-orientation`, and labelled ones read their text. The line is below the 3:1 non-text threshold on purpose — it is not required to identify anything (1.4.11 exemption), and the label, when present, meets 4.5:1.

## Platform notes

### Web
Decorative: `<hr aria-hidden="true" class="ds-divider">`. Semantic: `<div role="separator" aria-orientation={orientation}>` with, for a label, two flex-grow line spans around a `Text size="sm" tone="muted"`. Vertical uses `inline-size: var(--border-width-thin); align-self: stretch`.

### Lit
`<ds-divider>`; `<ds-divider semantic label="or">`. Host carries the styles and, when semantic, `internals.role = 'separator'` and `ariaOrientation`. The label renders in the shadow root.

### React Native
`View` with `height: t.borderWidthThin, backgroundColor: t.colorBorder` (or width for vertical, `alignSelf: 'stretch'`). Decorative: hidden from AT. Labelled: a row of two lines with a `Text` between; the text is what gets read.

## Related

Stack, Menu, List (planned), Heading.
