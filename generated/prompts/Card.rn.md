# Generate: Card for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Card.tsx` exporting a typed React Native function component named `Card`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `CardProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Card> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Card.test.tsx`.

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
  name: Card
  category: container
  status: review
  anatomy:
  - surface
  - header
  - heading
  - headerActions
  - body
  - footer
  parts:
    body:
      kind: slot
      slot:
        default: true
        prop: children
        required: true
    headerActions:
      kind: slot
      slot:
        prop: headerActions
    footer:
      kind: slot
      slot:
        prop: footer
  props:
    children:
      type: content
      required: true
      description: The body. Usually a Stack of Text and controls; a plain string
        or number is rendered inside the system Text with its defaults (a bare string
        cannot sit in a native View), including each top-level string or number in
        an array body.
    heading:
      type: string
      description: 'The card''s title, rendered as the system Heading at the card''s
        level and at `size: lg` on every platform, so a card heading reads smaller
        than a page heading. Omit for cards that are a single piece of content; an
        empty string counts as omitted (no article, no label).'
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      default: '3'
      description: Heading level for `heading`, so cards fit the page outline. Cards
        in a list share a level.
    headerActions:
      type: content
      description: 'Controls at the end of the header row — a ghost icon-only Button,
        a Link. At most two: a content guideline, not a runtime check, as with every
        other soft content limit here.'
    footer:
      type: content
      description: The action row. Buttons in a row, primary first, following Form's
        action-order rule.
    inset:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      - lg
      default: md
      description: Padding inside the card from the layout inset presets. `sm` for
        dense grids, `lg` for a single featured card.
    surface:
      type: enum
      values:
      - default
      - subtle
      default: default
      description: '`default` is the page background with a border — the calm option;
        `subtle` is a tinted surface without a border.'
    interactive:
      type: boolean
      default: false
      description: 'The whole card is one link or button target. Requires exactly
        one interactive child (a Link or Button) whose action the card extends to
        its full area; the card itself is not focusable. The child is looked for among
        the top-level children of the body only (web and Lit also accept a native
        a[href] or button there); controls nested inside a wrapper such as a Stack
        are not searched, so place the link at the top level beside any Text. A top-level
        Fragment is flattened, so its children count as top-level. With zero or several
        such children the card stays non-interactive (no hit area, no hover background,
        no press) and warns once per mounted card in development. If the child is
        disabled the card is disabled with it: no hover background, pressing does
        nothing, and on native the Pressable reports disabled. Controls in `headerActions`
        and `footer` are never the target; they sit above the hit area and keep their
        own targets.'
      a11y: The card never becomes a second focus stop; its single child link or button
        is the target, and the card enlarges the hit area only (pseudo-element on
        web, wrapping Pressable on native).
    focusable:
      type: boolean
      default: false
      description: The card root takes tabindex=-1 so a container (Feed) can move
        focus to it by script, and draws its own focus ring when focused that way.
        Not a tab stop; not for making cards clickable (`interactive`). With `interactive`
        also set, `interactive` wins and this is a no-op — the card already has a
        target — and a development warning says so. It stays a no-op whenever `interactive`
        is set, even when that card fell back to non-interactive for want of a single
        target.
      a11y: Only scripted focus (PageUp/PageDown in a Feed) lands here; the ring is
        drawn on the card via :focus-visible.
  styles:
    paddingBlock:
      token: layout.inset.{inset}
      locked: false
    paddingInline:
      token: layout.inset.{inset}
      locked: false
    partGap:
      token: layout.gap.loose
      description: Vertical gap between header, body and footer.
      locked: false
    headerGap:
      token: layout.gap.normal
      part: header
      description: Horizontal gap between the heading and headerActions.
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: Horizontal gap between footer actions.
      locked: false
    actionsGap:
      token: layout.gap.tight
      part: headerActions
      description: Horizontal gap between the headerActions controls.
      locked: false
    background:
      token: color.background.{surface}
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      description: Rendered only with surface default. An interactive card always
        reserves border.width.focus instead, so the ring appearing never shifts the
        layout; at rest that border is colored `border` on surface default (the card
        keeps its visible border) and transparent on subtle, and `focusRing` while
        the ring shows. An override of this binding therefore only changes non-interactive
        cards.
      locked: false
    radius:
      token: radius.lg
      locked: false
    hoverBackground:
      token: color.background.subtle
      state: hover
      description: 'Interactive cards only, on pointer hover (a plain `:hover` on
        web and Lit, no `@media (hover: hover)` guard, as Link); subtle cards use
        color.background.strong. Native has no hover, so the Pressable shows it while
        pressed, and on pointer hover where the platform reports one (iPad pointer,
        react-native-web).'
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    transition:
      token: motion.duration.fast
      description: Interactive hover, with motion.easing.standard. Native has no continuous
        hover to animate between — the pressed style swaps instantly — so the binding
        exists there for API parity and has no runtime effect.
      locked: false
  a11y:
    role: none
    requires:
    - heading-hierarchy
    - focus-visible
    - contrast-aa
    contrast:
    - foreground: color.foreground
      background: color.background.{surface}
      level: AA
    - foreground: color.foreground.muted
      background: color.background.{surface}
      level: AA
    - foreground: color.link
      background: color.background.{surface}
      level: AA
  platforms:
    web:
      element: article
      attributes:
      - aria-labelledby
      notes: 'An <article> when it has a heading (aria-labelledby the heading id),
        a <div> otherwise. Header, body and footer are plain flex rows/columns styled
        from this component''s own gap bindings (not the Stack component: Stack owns
        page rhythm and its gap enum, while these gaps are Card''s bindings and must
        stay overridable per instance). Interactive: the single child link/button
        gets a ::after pseudo-element covering the card (position: relative on the
        card), so the hit area grows without adding a focus stop; the focus ring is
        drawn on the card only while that target has keyboard focus (`:has([data-ds-card-target]:focus-visible)`),
        never for mouse focus or a focused headerActions or footer control. A disabled
        target is `:has([data-ds-card-target]:is([aria-disabled=''true''], :disabled))`,
        which covers Button''s `disabled`, a disabled Form and a native disabled button;
        pressing is already blocked by the child, so the ::after stays. On interactive
        cards only, the header-actions and footer rows get position: relative and
        z-index: 1 so their controls stay above the ::after (plain cards get no stacking
        context). `focusable` draws its ring as an outline of focusRingWidth in focusRing,
        no offset, on :focus-visible, so a focusable card reserves no border. The
        Heading gets `overrides={{ marginBlockEnd: ''space.0'' }}` so its own bottom
        margin adds no space inside the header row (every platform). Card reaches
        the child by cloning it with a `data-ds-card-target` attribute — the one sanctioned
        exception to "never touch a child", because the hit area is the card''s own
        geometry. It is an attribute, not a class, because Link and Button accept
        no className; both pass data attributes through `...rest` to their root. The
        schema''s a11y.role is `none` because a card without a heading has none; with
        a heading the element is an <article> named by it, and that is the specific
        rule.'
    lit:
      tag: ds-card
      reflect:
      - inset
      - surface
      - interactive
      - focusable
      - heading-level
      notes: 'Shadow root with named slots `header-actions` and `footer`, default
        slot for the body, and the heading rendered from the `heading` property as
        a <ds-heading>. The rows are the card''s own flex rows, not ds-stack, so their
        gaps stay overridable. The host is named with aria-label={heading} rather
        than an idref, since ids do not cross the shadow root. The interactive hit-area
        trick works across the shadow boundary only if the link is slotted: the host
        gets position: relative and the slotted link is told (via a class the card
        adds on slotchange) to extend. The rule for that class is the card''s own
        to install — inject it once per root node (document head, or the nearest ancestor
        shadow root) rather than expecting a global stylesheet. With no interactive
        child, or more than one, the card stays non-interactive and warns in development.
        The target is looked for among the default slot''s assigned elements only,
        not their descendants. A click on the extended area lands on the ds-link/ds-button
        host, not its inner native element, so the card forwards a click whose target
        is that host by calling click() on the inner a[href]/button in the child''s
        open shadow root — the same sanctioned exception as the class. The ring shows
        only while that target has keyboard focus: the card toggles a `target-focus`
        custom state on focusin/focusout when the focused element matches :focus-visible
        and draws on :host(:state(target-focus)); a focused header-actions or footer
        control does not ring the card. On interactive cards only, the header-actions
        and footer rows get position: relative and z-index: 1 above the hit area.
        The hover rules use two more custom states: `has-target` (exactly one target
        found) and `target-disabled` (the target has a `disabled` attribute or aria-disabled="true",
        watched with a MutationObserver that writes nothing back). The zero-or-several
        warning is not judged on the first update: it runs on the default slot''s
        slotchange and when `interactive` changes. `focusable`: the host itself takes
        tabindex="-1" and the shadow root does not use delegatesFocus, so scripted
        focus lands on the card rather than its first focusable child; the ring is
        an outline on the surface part while the host matches :focus-visible, and
        the host''s own outline is removed. With a heading the host gets role="article"
        as a plain attribute unless the consumer already set a role, and aria-label
        with the heading text unless the consumer already set one; the card removes
        only a role or aria-label it wrote itself.'
    rn:
      element: View
      props:
      - accessibilityRole
      - accessibilityLabel
      notes: 'View with padding/background/border/radius from tokens; header and footer
        are plain row Views styled from this component''s gap bindings, not Stack.
        The root View is the `surface` part and keeps `testID="Card"`; there is no
        `Card.surface`, and the heading keeps Heading''s own hook. Interactive: the
        card wraps its content in a Pressable whose press runs the single child Link/Button''s
        own press behavior (for Button that includes its tracking, `type: submit`
        and its disabled/loading guard, with a disabled Form counting as disabled)
        and takes accessibilityRole and the child''s resolved accessibilityLabel from
        it (Button''s `accessibleName ?? accessibilityLabel ?? label`). That Pressable
        is the card''s single target and single focus stop — "the card adds no second
        stop" means exactly one, not zero, here. Button and Link do not forward an
        `accessible` prop, so the child is neutralised by wrapping it in a View with
        pointerEvents="none", accessibilityElementsHidden and importantForAccessibility="no".
        Only `children` is searched for that child: a Button or Link in `headerActions`
        or `footer` keeps its own target and is not collapsed. hoverBackground shows
        while the Pressable is pressed, and on hover where a pointer exists (iPad,
        react-native-web). A disabled child makes the Pressable disabled (accessibilityState
        disabled, press ignored). A focusable card reserves border.width.focus like
        an interactive one. `focusable` is a react-native-web capability: RN core
        types View without onFocus/onBlur and Android treats tabIndex -1 as not focusable,
        so on iOS and Android no container can move focus to the card by script; screen-reader
        users reach each card by swiping, its Heading being a header. The Heading
        gets `level` from headingLevel and `size: lg`; native has no heading levels,
        so headingLevel changes nothing visible or announced there and is passed for
        parity.'
    swiftui:
      element: VStack
      props:
      - .padding
      - .background
      - .overlay=border
      - .clipShape
      - .accessibilityElement=contain
      - .accessibilityLabel
      - .contentShape
      - .focusable
      - .focused
      notes: 'Surface from the tokens, `inset` padding, header row (`Heading` + `headerActions`
        HStack), body, footer with the gap bindings. `.accessibilityElement(children:
        .contain)` labelled by the heading. `interactive`: the card is wrapped in
        a `Button` whose action is the single child link/button''s action (found by
        the child declaring itself through `CardActionPreference`), the child is `.accessibilityHidden`
        inside it, and hover shows `hoverBackground` on iPad pointer — one target,
        one focus stop. `focusable`: `.focusable()` with the focus ring drawn on the
        card, for Feed''s PageUp/PageDown.'
  behavior:
  - name: heading-is-rendered-as-a-heading
    description: The heading is rendered as a Heading at the card's level, and it
      is what a screen-reader user jumps to.
    given:
      heading: Team plan
    then:
    - text: Team plan
    - role: heading
      platforms:
      - web
  - name: a-card-with-a-heading-is-an-article
    description: A card with a heading is an article labelled by that heading, so
      screen-reader users can navigate card by card.
    given:
      heading: Team plan
    then:
    - role: article
      platforms:
      - web
      - lit
  - name: interactive-adds-no-focus-stop
    description: 'An interactive card extends its single child link or button to the
      whole area; the card itself is never a second tab stop. As in whole-card-is-a-link,
      the children string is rendered as a top-level Link with that label (href #),
      so the card has a real target.'
    given:
      heading: September invoice
      children: A Link to the invoice
      interactive: true
    then:
    - focusable: false
    platforms:
    - web
    - lit
  - name: focusable-takes-scripted-focus-only
    description: A focusable card carries tabindex=-1 so a container (Feed) can move
      focus to it by script; it is not a tab stop.
    given:
      focusable: true
    then:
    - attribute: tabindex
      is: '-1'
      platforms:
      - web
      - lit
    - focusable: true
      platforms:
      - web
  examples:
  - name: plan-card
    description: A card as a unit in a list of choices, with its own heading at the
      list's level.
    given:
      heading: Team plan
      headingLevel: '3'
      children: What the plan includes
  - name: dense-grid-card
    description: 'A card in a dense grid, on the tinted surface and with the tighter
      inset, and no heading: the story clears any Default heading.'
    given:
      children: A search result
      inset: sm
      surface: subtle
  - name: whole-card-is-a-link
    description: 'A card whose single child link leads somewhere, with the card as
      the hit area and the link as the only tab stop. The children string describes
      content, not a value: render a Link labelled with that text (href #) at the
      top level of the body.'
    given:
      heading: September invoice
      children: A Link to the invoice
      interactive: true
  - name: card-focused-by-a-feed
    description: A card a Feed moves focus to with PageUp/PageDown, which draws its
      own ring when focused that way.
    given:
      heading: New comment
      children: The comment body
      focusable: true
```

## Parts and slots

- `surface`: element
- `header`: element
- `heading`: element
- `headerActions`: slot, prop `headerActions`
- `body`: slot, prop `children`, required
- `footer`: slot, prop `footer`

## Style bindings

- `headerGap`: token `layout.gap.normal`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `actionsGap`: token `layout.gap.tight`; part `headerActions`
- `hoverBackground`: token `color.background.subtle`; state `hover`; locked

## Constants and examples

- example `plan-card`, story `PlanCard`: given `heading: "Team plan"`, `headingLevel: "3"`, `children: "What the plan includes"`; A card as a unit in a list of choices, with its own heading at the list's level.
- example `dense-grid-card`, story `DenseGridCard`: given `children: "A search result"`, `inset: "sm"`, `surface: "subtle"`; A card in a dense grid, on the tinted surface and with the tighter inset, and no heading: the story clears any Default heading.
- example `whole-card-is-a-link`, story `WholeCardIsALink`: given `heading: "September invoice"`, `children: "A Link to the invoice"`, `interactive: true`; A card whose single child link leads somewhere, with the card as the hit area and the link as the only tab stop. The children string describes content, not a value: render a Link labelled with that text (href #) at the top level of the body.
- example `card-focused-by-a-feed`, story `CardFocusedByAFeed`: given `heading: "New comment"`, `children: "The comment body"`, `focusable: true`; A card a Feed moves focus to with PageUp/PageDown, which draws its own ring when focused that way.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `paddingBlock`, `paddingInline`, `partGap`, `headerGap`, `footerGap`, `actionsGap`, `border`, `borderWidth`, `radius`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `hoverBackground`, `focusRing`, `focusRingWidth`

## Behavior scenarios (12)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: heading-is-rendered-as-a-heading
  description: The heading is rendered as a Heading at the card's level, and it is
    what a screen-reader user jumps to.
  given:
    heading: Team plan
  then:
  - text: Team plan
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-heading-level-2
  given:
    headingLevel: '2'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-3
  given:
    headingLevel: '3'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-4
  given:
    headingLevel: '4'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-5
  given:
    headingLevel: '5'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-6
  given:
    headingLevel: '6'
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
```

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityRole
- accessibilityLabel
notes: "View with padding/background/border/radius from tokens; header and footer\
  \ are plain row Views styled from this component's gap bindings, not Stack. The\
  \ root View is the `surface` part and keeps `testID=\"Card\"`; there is no `Card.surface`,\
  \ and the heading keeps Heading's own hook. Interactive: the card wraps its content\
  \ in a Pressable whose press runs the single child Link/Button's own press behavior\
  \ (for Button that includes its tracking, `type: submit` and its disabled/loading\
  \ guard, with a disabled Form counting as disabled) and takes accessibilityRole\
  \ and the child's resolved accessibilityLabel from it (Button's `accessibleName\
  \ ?? accessibilityLabel ?? label`). That Pressable is the card's single target and\
  \ single focus stop \u2014 \"the card adds no second stop\" means exactly one, not\
  \ zero, here. Button and Link do not forward an `accessible` prop, so the child\
  \ is neutralised by wrapping it in a View with pointerEvents=\"none\", accessibilityElementsHidden\
  \ and importantForAccessibility=\"no\". Only `children` is searched for that child:\
  \ a Button or Link in `headerActions` or `footer` keeps its own target and is not\
  \ collapsed. hoverBackground shows while the Pressable is pressed, and on hover\
  \ where a pointer exists (iPad, react-native-web). A disabled child makes the Pressable\
  \ disabled (accessibilityState disabled, press ignored). A focusable card reserves\
  \ border.width.focus like an interactive one. `focusable` is a react-native-web\
  \ capability: RN core types View without onFocus/onBlur and Android treats tabIndex\
  \ -1 as not focusable, so on iOS and Android no container can move focus to the\
  \ card by script; screen-reader users reach each card by swiping, its Heading being\
  \ a header. The Heading gets `level` from headingLevel and `size: lg`; native has\
  \ no heading levels, so headingLevel changes nothing visible or announced there\
  \ and is passed for parity."
```

## Guidance

## Overview

A Card frames one thing so it can sit among others: a search result, a plan to choose, a setting group, a dashboard panel. It is a Box with conventions — a heading row, a body, an action row, consistent padding and gaps from the theme's rhythm — so that every card on every screen has the same internal spacing without anyone choosing it.

## When to use

Use Cards for collections of like items where each needs its own boundary, and for a single panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page. Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.

## When not to use

Do not put a card inside a card. Do not use Cards to separate sections of a form or a settings page — that is a Landmark or a Heading with `section` spacing. Do not use a Card for a status message (Alert) or for a transient layer (Dialog, planned). Do not use `interactive` with more than one control inside; nested targets are a well-known accessibility failure.

## Behavior

The header renders when `heading` or `headerActions` is present, the footer when `footer` is present; body always. Header, body and footer are separated by `partGap`, and the card pads all of it by `inset`. `surface: default` draws a border, `subtle` does not. An `interactive` card grows its single child link or button's hit area to the whole card, shows `hoverBackground` on pointer hover, and draws the focus ring around the card when that child has keyboard focus — but adds no focus stop of its own. A `focusable` card carries `tabIndex={-1}` on its root and draws the same ring on its own `:focus-visible`; `tabIndex` is not a Card prop, and a caller who wants scripted focus sets `focusable` (which wins over any `tabIndex` in `...rest`). Every anatomy part carries `data-part` with its name on the element that holds it — the root is `surface`, and `header`, `headerActions`, `body` and `footer` are the row or wrapper around their content, not a slot element — except `heading`: it is the system Heading, which keeps its own hook, and is located by role heading or its text. Aria attributes passed through `...rest` (role, aria-posinset, aria-setsize, aria-describedby) land on the root, which is how Feed makes a Card an article.

## Content guidelines

Headings are short noun phrases, sentence case, one line. Footers hold one primary action at most, placed first, then one secondary; a card with more choices than that is a form. Body text keeps to a few lines; a card is a summary, and the detail lives where its action goes.

## Accessibility

A card with a heading is an `article` labelled by that heading, so screen-reader users can navigate card by card and hear each one's name (WCAG 1.3.1, 2.4.6); heading levels are consistent within a list and fit the page outline (heading-hierarchy). Interactive cards keep exactly one tab stop — the child link or button — and show a visible focus ring on the card (2.4.7), so keyboard users get the same large target as pointer users (2.5.8) without a redundant stop. Text on either surface meets 4.5:1 in both modes; the build checks body, muted and link foreground against both.

## Platform notes

### Web
Render `<article aria-labelledby={headingId}>` (or `<div>` without a heading) with `ds-card` classes for `inset`, `surface` and `interactive`. Header: a flex row with `justify-content: space-between` and `gap` from `headerGap`, containing the Heading (level from `headingLevel`, `size: lg` so a card heading reads smaller than a page heading) and the actions in a row with `gap` from `actionsGap`. Footer: a flex row with `gap` from `footerGap`. The rows are Card's own markup, not Stack, so their gaps stay per-instance overridable. Interactive: `position: relative` on the card; the single link/button child receives a `data-ds-card-target` attribute whose rule adds `::after { content: ''; position: absolute; inset: 0 }`; `:has([data-ds-card-target]:focus-visible)` draws the ring on the card, and the header-actions and footer rows sit above the hit area with `position: relative; z-index: 1`.

### Lit
`<ds-card heading="Plan" heading-level="3" inset="md">` with slots `header-actions`, default, and `footer`. Renders `<ds-heading size="lg">` internally (same size on every platform); header and footer rows are Card's own flex rows, not `<ds-stack>`. For `interactive`, on `slotchange` find the single `ds-link`/`ds-button` among the default slot's assigned elements (not their descendants), add the extending class to it, forward clicks on its host to its inner native element, and draw the ring on `:host(:state(target-focus))` while it has keyboard focus. Because the class lands in the light DOM, the card injects the rule for it once into whichever root node the slotted element resolves in, rather than depending on a stylesheet it does not own. The selector matches a raw `a[href]` or `button` too, so a plain anchor gets the same hit area.

### React Native
`View` with padding, background, border and radius from tokens; header and footer are plain row Views styled from Card's own gap bindings; the heading is the system `Heading` at `size: lg`. For `interactive`, wrap the content in a `Pressable` whose `onPress` calls the single child's handler and whose `accessibilityRole` and `accessibilityLabel` are copied from it; render the child with `accessible={false}` so it collapses into the Pressable.

## Related

Box, Stack, Heading, Button, Link, Container.
