# Generate: Box for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Box.tsx` exporting a typed React Native function component named `Box`.

**When the files already exist.** Read the existing component, stories, tests and index export first. The doc is authoritative: change what contradicts it, add what it requires, and keep what it does not mention unless a convention forbids it. Do not restyle or rename for taste. In your reply, before the report block, say what you changed and why.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `BoxProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger (if any) and enough content to exercise every keyboard rule — at least as many distinct stops or items as the largest index any rule moves to (three for a list or group), counting items reachable by the component's own navigation (roving focus or an active item) whether or not they are tab stops; an overlay with a fixed set of controls renders that set. It is for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Box> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Box.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), unless the prop has no `default` and the doc marks it controlled (overlays' `open`): then it is controlled only, and the event requests the change. The event fires in every mode; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other. Wiring is not a prop choice and is always allowed: ids and accessibility references (`nativeID`, `accessibilityLabelledBy`), refs, focus props for roving focus, event handlers, and copy strings the parent owns.
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
  name: Box
  category: layout
  status: review
  anatomy:
  - surface
  props:
    children:
      type: content
      required: true
      description: 'Any content. Box does not space its children; put a Stack inside
        for that. A string given as `children` in an example is wrapped in the system
        Text by its story on every platform (`<ds-text>` on Lit, where slotted content
        cannot be an arg): one meta-level render wraps only string children in a Text
        at its defaults, so each example story keeps exactly its `given` as args.
        The Default story uses the `highlighted-panel` props, since a Box at its schema
        defaults draws nothing; meta args may still list the schema defaults (`border:
        false`, `element: div`) as controls, but only defaults of props the platform
        declares (React Native has no `element`) and never the `highlighted-panel`
        props, which go on the Default story alone. Meta args that equal the schema
        defaults count as "exactly its `given`". Besides one story per enum value,
        the `border` boolean gets one `Border` story (`border: true`) and a `WithOverrides`
        story shows `overrides`. On React Native the behavior tests render through
        the stories'' meta render, since a bare string child inside a View throws
        there. Behavior scenarios render the Default story''s args with their `given`
        on top, which is intended: they assert only renders and roles.'
    inset:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      default: none
      description: Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline`
        when the axes differ.
    insetBlock:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      description: 'Vertical padding, overriding `inset` on that axis. It has no default:
        unset means `inset` applies, which keeps an explicit `none` distinct from
        an absent value.'
    insetInline:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - xl
      description: Horizontal padding, overriding `inset` on that axis. Unset means
        `inset` applies, as with insetBlock.
    surface:
      type: enum
      values:
      - none
      - default
      - subtle
      - strong
      default: none
      description: Background. `none` is transparent; `default` is the page background
        (use to lift content off a subtle parent); `subtle` and `strong` step up.
    border:
      type: boolean
      default: false
      description: A thin default border.
    radius:
      type: enum
      values:
      - none
      - sm
      - md
      - lg
      - full
      default: none
      description: Corner radius from the theme's presets.
    element:
      type: enum
      values:
      - div
      - section
      - article
      - aside
      - header
      - footer
      - main
      - nav
      default: div
      description: Element to render. Sectioning elements only when the box is a semantic
        region; prefer Landmark for page regions. There is no native counterpart,
        so a screen that ports to React Native uses Landmark for the region instead
        of this prop.
      platforms:
      - web
      - lit
  styles:
    paddingBlock:
      token: layout.inset.{inset}
      description: 'An override applies at every value including `none`: `layout.inset.none`
        is a real token (a zero), not an absent part, so padding is not one of the
        bindings presence gates.'
      locked: false
    paddingInline:
      token: layout.inset.{inset}
      locked: false
    background:
      token: color.background.{surface}
      description: '`none` renders the literal transparent, not a token, written out
        explicitly (`background-color: transparent`) and not read through the hook,
        so neither `overrides.background` nor consumer CSS on `--ds-box-background`
        paints a `none` box; the token binding covers the other three values, and
        the `--ds-box-background` hook is set only by those three, with no base default.
        Interpolated bindings like this one are locked — they keep their `--ds-box-*`
        hook, which is the consumer''s own-CSS escape hatch, but they are not members
        of the overrides type.'
      locked: true
    border:
      token: color.border
      description: 'The border colour. It shares a name with the `border` boolean,
        which decides presence: an override recolours the border and never brings
        one into existence. On web and Lit, without `border` the width is `0` and
        the colour hook may stay written, since nothing visible reads it; on React
        Native, which has no cascade, `borderWidth` and `borderColor` are left unset
        when `border` is false.'
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.{radius}
      description: '`radius: none` resolves `radius.none` and is written out, rather
        than leaving the property unset — every binding is applied explicitly, with
        no cascade. Unlike padding, radius is presence-gated: `none` means no rounded
        corners, so `overrides.radius` is ignored at `none` and applies at every other
        value. As with `surface: none`, the `none` rule writes `radius.none` directly
        and reads no hook, so consumer CSS on `--ds-box-radius` cannot round a `none`
        box either.'
      locked: false
  a11y:
    role: none
    requires:
    - contrast-aa
    contrast:
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground
      background: color.background.strong
      level: AA
    - foreground: color.foreground.muted
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.background.strong
      level: AA
    - foreground: color.link
      background: color.background.subtle
      level: AA
    - foreground: color.link
      background: color.background.strong
      level: AA
  platforms:
    web:
      element: div
      attributes: []
      notes: 'A plain element with classes for each enum value; `surface: none` paints
        `transparent` and reads no hook. insetBlock/insetInline modifiers win over
        inset. No margin, ever. The root is the `surface` part and carries `data-part="surface"`,
        written before `...rest` so a composing parent can relabel it (Popover and
        BottomSheet pass `data-part="body"`). Box is the one primitive that merges
        a consumer `className` and `style` onto the root instead of dropping them,
        as Text does, because those same composites give it a layout-only class. That
        class may set Box''s `--ds-box-*` hooks (Dialog sets the padding hooks this
        way): it is consumer CSS, and it outranks the modifier classes only with a
        selector of at least two classes (Dialog''s `.ds-dialog__scroll > .ds-box`);
        a single class ties with the plain-class modifiers and loses or wins by stylesheet
        order, which is not supported. A consumer `style` is spread after the inline
        `overrides` hooks, so it wins where both set the same `--ds-box-*` hook. Props
        are typed against `div` for every `element` value; Box is not polymorphic,
        and the ref is `Ref<HTMLElement>`.'
    lit:
      tag: ds-box
      reflect:
      - inset
      - inset-block
      - inset-inline
      - surface
      - border
      - radius
      notes: 'The host is the box (`:host { display: block }`) with a default slot,
        so children stay in the light DOM. The host is also the `surface` part: it
        carries `data-part="surface"` alongside `data-ds`, and there is no `::part`,
        since `:host` cannot take one. `element` swaps nothing in the shadow root
        — the host is the element, so `element` is accepted for API parity (set by
        attribute or property, not reflected) and sets a plain `role` attribute on
        the host — not ElementInternals, which the accessible-role tests cannot read
        — only where the implicit role does not depend on ancestry: article, aside
        → complementary, main, nav → navigation. `div`, `section`, `header` and `footer`
        set no role, because a native `<header>` or `<footer>` is only a banner or
        contentinfo outside sectioning content and the element cannot see where it
        sits; a page-level banner is Landmark. Box removes only a role it wrote itself,
        so a consumer `role` on a `div` box stays. A derived `renders` scenario on
        Lit means the host is connected and its shadow root holds the slot.'
    rn:
      element: View
      props: []
      notes: 'View with paddingVertical/paddingHorizontal, backgroundColor, borderWidth/borderColor,
        borderRadius from the token object. `element` does not apply — use Landmark
        for a region; the `navigation-region` example and the two element scenarios
        have no React Native story or test, and Landmark''s stories are the counterpart.
        The root view is both the component and its only part, so it carries `testID="Box"`
        and there is no `Box.surface`: when a component''s single anatomy part is
        the root, the root form wins. A string given as `children` in an example is
        illustrative; native requires it inside a Text. Resolved overrides are cast
        to the binding''s own type: number for padding, width and radius, string for
        the border colour.'
    swiftui:
      element: VStack
      props:
      - .padding
      - .background
      - .overlay=border
      - .clipShape
      - .frame=maxWidth
      - .accessibilityElement=contain
      notes: 'A layout container: `padding` from the inset token on all edges, `.background(RoundedRectangle)`
        in the surface color (nothing for `none`), a stroked overlay for `border`,
        `.clipShape` for radius. Children are laid out by the caller''s stack; Box
        itself is a single-child wrapper (`VStack(spacing: 0)`) and never spaces siblings.
        No accessibility semantics unless the doc says the role is a landmark (then
        see Landmark).'
  behavior:
  - name: nav-element-carries-navigation-semantics
    description: When element is article, aside, main or nav, the element carries
      that semantics on web and the host role carries it on Lit; Box adds no role
      of its own otherwise.
    given:
      element: nav
    then:
    - role: navigation
      platforms:
      - web
      - lit
  - name: article-element-carries-article-semantics
    description: The same rule for the other sectioning values - the element is the
      semantics, and Box adds nothing else.
    given:
      element: article
    then:
    - role: article
      platforms:
      - web
      - lit
  examples:
  - name: highlighted-panel
    description: A panel lifted off the page with a tinted surface, rounded corners
      and the usual inset.
    given:
      children: A panel of settings
      inset: md
      surface: subtle
      radius: md
  - name: bordered-row
    description: A dense row bounded by a thin border rather than a fill.
    given:
      children: A row of data
      inset: sm
      border: true
  - name: hero-band
    description: A full-width band with more vertical than horizontal padding, on
      the strongest surface.
    given:
      children: A hero band
      insetBlock: xl
      insetInline: lg
      surface: strong
  - name: navigation-region
    description: A padded region whose element makes it a navigation landmark on web.
    given:
      children: The sidebar links
      element: nav
      inset: md
    platforms:
    - web
    - lit
```

## Constants and examples

- example `highlighted-panel`, story `HighlightedPanel`: given `children: "A panel of settings"`, `inset: "md"`, `surface: "subtle"`, `radius: "md"`; A panel lifted off the page with a tinted surface, rounded corners and the usual inset.
- example `bordered-row`, story `BorderedRow`: given `children: "A row of data"`, `inset: "sm"`, `border: true`; A dense row bounded by a thin border rather than a fill.
- example `hero-band`, story `HeroBand`: given `children: "A hero band"`, `insetBlock: "xl"`, `insetInline: "lg"`, `surface: "strong"`; A full-width band with more vertical than horizontal padding, on the strongest surface.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `paddingBlock`, `paddingInline`, `border`, `borderWidth`, `radius`
Locked (accessibility-bearing, never overridable): `background`

## Behavior scenarios (25)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-inset-none
  given:
    inset: none
  then:
  - renders: true
  derived: true
- name: renders-inset-sm
  given:
    inset: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-md
  given:
    inset: md
  then:
  - renders: true
  derived: true
- name: renders-inset-lg
  given:
    inset: lg
  then:
  - renders: true
  derived: true
- name: renders-inset-xl
  given:
    inset: xl
  then:
  - renders: true
  derived: true
- name: renders-inset-block-none
  given:
    insetBlock: none
  then:
  - renders: true
  derived: true
- name: renders-inset-block-sm
  given:
    insetBlock: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-block-md
  given:
    insetBlock: md
  then:
  - renders: true
  derived: true
- name: renders-inset-block-lg
  given:
    insetBlock: lg
  then:
  - renders: true
  derived: true
- name: renders-inset-block-xl
  given:
    insetBlock: xl
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-none
  given:
    insetInline: none
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-sm
  given:
    insetInline: sm
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-md
  given:
    insetInline: md
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-lg
  given:
    insetInline: lg
  then:
  - renders: true
  derived: true
- name: renders-inset-inline-xl
  given:
    insetInline: xl
  then:
  - renders: true
  derived: true
- name: renders-surface-none
  given:
    surface: none
  then:
  - renders: true
  derived: true
- name: renders-surface-default
  given:
    surface: default
  then:
  - renders: true
  derived: true
- name: renders-surface-subtle
  given:
    surface: subtle
  then:
  - renders: true
  derived: true
- name: renders-surface-strong
  given:
    surface: strong
  then:
  - renders: true
  derived: true
- name: renders-radius-none
  given:
    radius: none
  then:
  - renders: true
  derived: true
- name: renders-radius-sm
  given:
    radius: sm
  then:
  - renders: true
  derived: true
- name: renders-radius-md
  given:
    radius: md
  then:
  - renders: true
  derived: true
- name: renders-radius-lg
  given:
    radius: lg
  then:
  - renders: true
  derived: true
- name: renders-radius-full
  given:
    radius: full
  then:
  - renders: true
  derived: true
```

## Platform notes (rn)

```yaml
element: View
props: []
notes: "View with paddingVertical/paddingHorizontal, backgroundColor, borderWidth/borderColor,\
  \ borderRadius from the token object. `element` does not apply \u2014 use Landmark\
  \ for a region; the `navigation-region` example and the two element scenarios have\
  \ no React Native story or test, and Landmark's stories are the counterpart. The\
  \ root view is both the component and its only part, so it carries `testID=\"Box\"\
  ` and there is no `Box.surface`: when a component's single anatomy part is the root,\
  \ the root form wins. A string given as `children` in an example is illustrative;\
  \ native requires it inside a Text. Resolved overrides are cast to the binding's\
  \ own type: number for padding, width and radius, string for the border colour."
```

## Guidance

## Overview

Box is the thing you reach for when a group of content needs a surface: padding around it, a background under it, a border, rounded corners. It has no opinions about what is inside and no spacing between its children — that is Stack's job — so the two compose without overlap: a Box for the inset, a Stack for the gaps.

## When to use

Use a Box to give a region of a layout a background or padding: a sidebar panel, a highlighted row, a footer band, the inside of a modal. Use it when a Card is too much (a Card is a Box with conventions about elevation and content). Choose `inset` by role — `sm` for dense rows, `md` for most panels, `lg` for page-level containers, `xl` for hero bands — and let the theme's rhythm decide the numbers.

## When not to use

Do not use a Box to add space between two components; put them in a Stack. Do not use it as a page container; Container owns gutters and measure. Do not nest surfaces more than two deep (`subtle` on `default`, `strong` on `subtle`) — a third level reads as clutter and the contrast math is only checked two deep. Do not use `surface` to signal status; that is Alert's tinted background.

## Behavior

Box renders its children in a block with the requested padding, background, border and radius, and nothing else. It adds no role of its own (`a11y.role: none`); on web the native element carries whatever semantics it has, which for `section`, `header` and `footer` depends on naming and ancestry as it does in plain HTML, and Lit sets a plain `role` attribute on the host only for the values whose role is unconditional (see the platform note). It never scrolls, never clips (`radius` does not imply `overflow: hidden`; a child that should be clipped clips itself), and never carries margin. `insetBlock` and `insetInline` override `inset` per axis. `surface: none` paints transparent, so the parent's background shows through.

## Content guidelines

None; Box has no text of its own.

## Accessibility

Box is invisible to assistive technology unless `element` gives it a sectioning role, in which case Landmark is usually the right component instead. Text on a `subtle` or `strong` surface must remain readable: the build checks body, muted and link foreground against both surfaces in both modes (WCAG 1.4.3), which is what makes "two levels deep" a safe rule rather than a hope. Box itself sets no foreground and establishes no colour context for its children, so these pairs are a guarantee about the tokens, not something the component implements or can enforce at runtime. A border, when present, is decorative; nothing relies on it to identify content (1.4.11 does not apply).

## Platform notes

### Web
Render the `element` with classes `ds-box`, `ds-box--inset-{value}`, `ds-box--inset-block-{value}`, `ds-box--inset-inline-{value}`, `ds-box--surface-{value}`, `ds-box--border`, `ds-box--radius-{value}`. Padding uses logical properties (`padding-block`, `padding-inline`). Axis modifiers are declared after the all-sides modifier so they win.

### Lit
`<ds-box inset="md" surface="subtle" radius="md">`. The host is the box; `:host` carries the padding, background, border and radius from reflected attributes (`:host([inset="md"])`). Children are slotted. `element` maps to a plain `role` attribute on the host for the values whose role is unconditional and is otherwise inert.

### React Native
`View` with `paddingVertical`/`paddingHorizontal` from `layout.inset.*`, `backgroundColor` from `color.background.*` (`'transparent'` for `none`, written out), `borderWidth`/`borderColor` only when `border`, `borderRadius` from `radius.*`. No `element`.

## Related

Stack, Card, Container, Landmark.
