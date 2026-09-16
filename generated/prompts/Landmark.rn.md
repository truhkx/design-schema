# Generate: Landmark for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Landmark.tsx` exporting a typed React Native function component named `Landmark`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `LandmarkProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Landmark> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Landmark.test.tsx`.

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
  name: Landmark
  category: layout
  status: review
  apg: landmarks
  anatomy:
  - region
  props:
    role:
      type: enum
      values:
      - banner
      - navigation
      - main
      - complementary
      - contentinfo
      - region
      - search
      - form
      required: true
      description: Which landmark this is. `banner` (site header), `navigation`, `main`
        (exactly one per page), `complementary` (sidebar), `contentinfo` (site footer),
        `region` (a labelled section that deserves a jump point), `search`, `form`
        (a labelled form that is a page-level region).
    label:
      type: string
      description: 'Accessible name. Required for `region` and `form`, and whenever
        the page has more than one landmark of the same role (two navigations: "Main"
        and "Footer"). Not shown visually.'
      a11y: Rendered as aria-label; the name is read together with the role ("Main
        navigation, landmark").
    children:
      type: content
      required: true
      description: The region's content.
    as:
      type: enum
      values:
      - header
      - nav
      - main
      - aside
      - footer
      - section
      - form
      - div
      description: Web element override. By default the element is chosen from `role`
        (see platform notes); set this only when the native element would be wrong,
        e.g. a `banner` that is not the page header. Web only — the Lit host is its
        own element.
      platforms:
      - web
  styles: {}
  a11y:
    roleFrom: role
    requires:
    - landmark-role
    - accessible-name
  platforms:
    web:
      element: header | nav | main | aside | footer | section | form
      attributes:
      - role
      - aria-label
      notes: 'Native elements carry the roles: banner→header, navigation→nav, main→main,
        complementary→aside, contentinfo→footer, region→section (only a landmark when
        labelled), search→form role=search (always, for SSR safety, until <search>
        is in the React typings), form→form. The explicit role attribute is always
        emitted on header and footer (they lose the landmark role inside sectioning
        content, and ancestry is unknown at render time) and whenever `as` overrides
        the element.'
    lit:
      tag: ds-landmark
      reflect:
      - role
      notes: 'No shadow DOM and no wrapper element: the host itself takes role and
        aria-label via ElementInternals so it is the landmark in the light DOM tree,
        and children are ordinary light-DOM children. The property is named `landmark`
        (attribute `role`) because `role` already exists on HTMLElement. With no shadow
        root there is no static styles; set `display: block` inline in connectedCallback
        when the host has no display set. Do not also render a native <nav> inside
        — a nested landmark of the same role is a duplicate.'
    rn:
      element: View
      props:
      - role
      - accessibilityLabel
      notes: 'Native platforms have no landmark navigation (VoiceOver and TalkBack
        have no landmark rotor), so Landmark is structure for react-native-web and
        a labelled View on iOS and Android. Pass `role` (RN ≥ 0.73) so react-native-web
        renders the semantic element; on native it maps to the nearest accessibilityRole
        or none. Exception: RN''s `Role` union has no `search` landmark (only the
        `searchbox` widget), so `search` is passed as the legacy accessibilityRole="search",
        which react-native-web maps to the ARIA search landmark; iOS and Android have
        no equivalent, so it is web-parity only. The label is applied as accessibilityLabel
        only for `region`, `form`, and `navigation`, so screen readers get a group
        name without every View announcing a role.'
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - .accessibilityAddTraits
      - accessibilityRotor
      notes: 'iOS has no landmark roles. The Landmark renders `.accessibilityElement(children:
        .contain)` with the `label` as its accessibility label so VoiceOver announces
        the region boundary when entering it, and registers an `.accessibilityRotorEntry`
        under a package-wide ''Landmarks'' rotor (`Support/LandmarkRotor.swift`) so
        users can jump between regions as they do on web. `role: main` adds `.accessibilityAddTraits(.isSummaryElement)`
        only when the doc asks. The element name (`nav`, `aside`) has no equivalent;
        `role` drives everything.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: none
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-role-banner
  given:
    role: banner
  then:
  - renders: true
  derived: true
- name: renders-role-navigation
  given:
    role: navigation
  then:
  - renders: true
  derived: true
- name: renders-role-main
  given:
    role: main
  then:
  - renders: true
  derived: true
- name: renders-role-complementary
  given:
    role: complementary
  then:
  - renders: true
  derived: true
- name: renders-role-contentinfo
  given:
    role: contentinfo
  then:
  - renders: true
  derived: true
- name: renders-role-region
  given:
    role: region
  then:
  - renders: true
  derived: true
- name: renders-role-search
  given:
    role: search
  then:
  - renders: true
  derived: true
- name: renders-role-form
  given:
    role: form
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

## Platform notes (rn)

```yaml
element: View
props:
- role
- accessibilityLabel
notes: "Native platforms have no landmark navigation (VoiceOver and TalkBack have\
  \ no landmark rotor), so Landmark is structure for react-native-web and a labelled\
  \ View on iOS and Android. Pass `role` (RN \u2265 0.73) so react-native-web renders\
  \ the semantic element; on native it maps to the nearest accessibilityRole or none.\
  \ Exception: RN's `Role` union has no `search` landmark (only the `searchbox` widget),\
  \ so `search` is passed as the legacy accessibilityRole=\"search\", which react-native-web\
  \ maps to the ARIA search landmark; iOS and Android have no equivalent, so it is\
  \ web-parity only. The label is applied as accessibilityLabel only for `region`,\
  \ `form`, and `navigation`, so screen readers get a group name without every View\
  \ announcing a role."
```

## Guidance

## Overview

Landmarks are the page's table of contents for assistive technology. A screen-reader user arriving on a page presses one key to jump to the main content, another to list the navigations, another for the search. Without landmarks they read from the top. This component exists so that every page in the system gets the same, correct set of them without anyone remembering which element implies which role.

## When to use

Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for the primary content, `navigation` for each navigation block (labelled when there is more than one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site footer, `search` around the site search form, and `region` for any other section a user might want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly one `main`.

## When not to use

Do not wrap everything: a page with twenty landmarks is as hard to navigate as one with none. Layout containers, cards, list items and form groups are not landmarks; use Stack, Fieldset (planned), or nothing. Do not use `region` without a `label` — an unlabelled region is not exposed as a landmark and the component will warn. Do not use Landmark to style a region; it has no visual bindings by design.

## Behavior

Landmark renders its children inside the appropriate element with the appropriate role and name, and nothing else: no padding, background, or layout. It is transparent to layout on every platform (`display: contents` is *not* used, because it removes the element's semantics in some browsers; instead the element is a plain block and consumers lay it out like any block). In development, the component warns when `main` appears more than once in a document, when `region` or `form` has no `label`, and when two `navigation`, `complementary`, `region` or `form` landmarks in the same root share a label or both lack one (`banner`, `main` and `contentinfo` never take labels). On native there is no document to scan, so only the missing-label warning applies.

## Content guidelines

Labels name the region in one or two words and do not repeat the role: "Main" and "Footer" for two navigations (read as "Main navigation"), not "Main navigation menu". Labels are sentence case and never punctuated. Where the region already starts with a visible heading, the label should match the heading text.

## Accessibility

Landmark regions let users bypass blocks and understand page structure (WCAG 1.3.1, 2.4.1). Each region has a role from the ARIA landmark set, and a name when the role appears more than once or when the role is `region` or `form`, which are landmarks only when named (4.1.2). Exactly one `main` per document. Native HTML elements are used wherever they imply the role, so no ARIA is added where the element already provides it, in line with the first rule of ARIA. Nested landmarks are allowed only where the APG allows them: a `navigation` inside `banner` is fine; a `main` inside anything is not.

## Platform notes

### Web
Choose the element from `role` unless `as` is set: `banner`→`<header role="banner">`, `navigation`→`<nav>`, `main`→`<main>`, `complementary`→`<aside>`, `contentinfo`→`<footer role="contentinfo">`, `region`→`<section aria-label>`, `search`→`<form role="search">`, `form`→`<form aria-label>`. Always emit `role` on `header` and `footer` and whenever `as` overrides the default element; never branch on `document` at render time (SSR). Apply `aria-label` from `label`. The forwarded ref is typed `HTMLElement` (not the specific element chosen by `as`), so render through `createElement` with `HTMLAttributes<HTMLElement>` rather than a union of intrinsic tags. Development warnings use `process.env.NODE_ENV !== 'production'`.

### Lit
`<ds-landmark role="navigation" label="Main">` uses no shadow root. The property is `landmark` (attribute `role`). In `connectedCallback`, attach `ElementInternals`, set `internals.role` and `internals.ariaLabel`, and set `display: block` inline when unset, so the host element itself is the landmark and its light-DOM children are its content. Warnings are logged in development builds only (`import.meta.env.DEV`; the package tsconfig includes `vite/client` types).

### React Native
Render a `View` with the `role` prop (which react-native-web turns into the semantic element and iOS/Android map to the nearest accessibility role or ignore), and `accessibilityLabel={label}` for `navigation`, `region` and `form` so the group has a name for TalkBack and VoiceOver. Do not set `accessible={true}` on the container; it would collapse every child into one element. There is no jump-to-landmark on native — the value here is web parity and a consistent structure for the same screen code.

## Related

Stack, Heading, Breadcrumb, SkipLink (planned).
