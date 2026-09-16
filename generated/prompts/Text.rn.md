# Generate: Text for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Text.tsx` exporting a typed React Native function component named `Text`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `TextProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Text> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Text.test.tsx`.

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
      values:
      - default
      - strong
      - muted
      - danger
      - onAction
      default: default
      description: Semantic color. `onAction` is only for text placed on an action
        background.
      a11y: Every tone meets 4.5:1 on the page background in every theme and mode
        except onAction, which is checked against action backgrounds.
    align:
      type: enum
      values:
      - start
      - center
      - end
      default: start
      description: Horizontal alignment. `start`/`end` follow writing direction.
    truncate:
      type: boolean
      default: false
      description: Clip to one line with an ellipsis. On web the full text is exposed
        via `title` when children is a plain string; otherwise the consumer passes
        `title`. Native has no equivalent affordance — a known gap.
      a11y: Truncated text is still read in full by screen readers; ensure sighted
        users can also reach it.
    element:
      type: enum
      values:
      - p
      - span
      default: p
      description: The HTML element to render — `p` for a block, `span` for inline.
        Labels and legends are rendered by Input and (planned) Fieldset, which own
        the association.
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
      notes: Renders the `element` prop. `truncate` uses overflow/text-overflow and
        sets `title` to the full text.
    lit:
      tag: ds-text
      reflect:
      - size
      - weight
      - tone
      - align
      - truncate
      notes: 'Renders the chosen element inside the shadow root with `part="text"`;
        the host is `display: contents` for `span`-like use and `display: block` otherwise.'
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
        `nested` on this object.'
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
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`
Locked (accessibility-bearing, never overridable): `color`

## Behavior scenarios (18)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
```

## Platform notes (rn)

```yaml
element: Text
props:
- numberOfLines
- ellipsizeMode
- allowFontScaling
notes: "No `element` prop \u2014 RN has one Text primitive. `truncate` maps to `numberOfLines={1}`.\
  \ Keep `allowFontScaling` on so Dynamic Type / font scaling works. Text provides\
  \ `TextStyleContext` ({ fontSize, color, nested: true }) to its descendants \u2014\
  \ the resolved size and color it renders with \u2014 so inline children (Icon, Link)\
  \ can match it; the older boolean `TextNestingContext` is replaced by `nested` on\
  \ this object."
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

Every tone except `onAction` is contrast-checked against the page background at AA in every theme and mode; the build fails if a theme's derived palette breaks this. `xs` is the floor for readable text — nothing in the system renders smaller. Text must reflow at 200% zoom and 320px viewports (WCAG 1.4.4, 1.4.10), which means never fixing the width of a text container in pixels. On native platforms, font scaling stays enabled so the platform's accessibility text sizes apply.

## Platform notes

### Web
The `element` prop chooses the tag; default `p`. `label` should only be used with a `for` association — prefer the Input component, which handles this. Truncation adds `title` with the full string.

### Lit
`<ds-text size="sm" tone="muted">` renders the element in a shadow root with `part="text"` for outside styling. Reflected attributes allow `ds-text[tone="danger"]` selectors in consuming apps.

### React Native
Renders `Text`. `size` and `weight` map to `fontSize`/`fontWeight` from the RN token object; `tone` to a color token. `truncate` sets `numberOfLines={1}` and `ellipsizeMode="tail"`. Nested Text is fine for inline emphasis.

## Related

Heading, Input (uses Text for label, description, and error).
