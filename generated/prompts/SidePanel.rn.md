# Generate: SidePanel for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/SidePanel.tsx` exporting a typed React Native function component named `SidePanel`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `SidePanelProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof SidePanel> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `SidePanel.test.tsx`.

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
  name: SidePanel
  category: overlay
  status: review
  apg: disclosure
  anatomy:
  - trigger
  - scrim
  - surface
  - focusScope
  - header
  - heading
  - body
  - footer
  - closeButton
  composition:
    focusScope: FocusScope
    heading: Heading
    closeButton: Button
    body: Box
    footer: Stack
  props:
    trigger:
      type: content
      description: 'The Button that shows and hides the panel (usually `iconOnly`
        with the `menu` Icon and a label like "Menu"). It is the APG disclosure button:
        the panel sets aria-expanded and aria-controls on it, and it stays a toggle
        — pressing it again closes. Omit to control `open` from elsewhere (a Toolbar).'
    open:
      type: boolean
      description: Controlled visibility. Omit for uncontrolled (the trigger toggles
        it).
    heading:
      type: string
      required: true
      description: The panel's title and accessible name ("Menu", "Filters", "Your
        cart"). May be visually hidden with `hideHeading`.
    hideHeading:
      type: boolean
      default: false
      description: Keep the title for assistive technology but do not render it (a
        navigation panel whose List is self-explanatory).
      a11y: The accessible name is required regardless.
    children:
      type: content
      required: true
      description: 'The body: a List or Tree of Links for navigation, a Form of filters,
        a Stack of Cards. Scrolls inside the panel when taller than the viewport.'
    footer:
      type: content
      description: Pinned to the bottom of the panel above the safe area (a sign-out
        Button, a "Apply filters" action row).
    side:
      type: enum
      values:
      - start
      - end
      default: start
      description: 'The edge the panel slides from: `start` is left in left-to-right
        languages and right in right-to-left; `end` the opposite. Navigation comes
        from the start; contextual panels (a cart, a detail) from the end.'
    width:
      type: enum
      values:
      - narrow
      - default
      - wide
      default: default
      description: 'Panel width on wide screens: narrow for a list of links, wide
        for a form or a detail. On phones the panel is the viewport width minus a
        gutter that keeps the scrim visible.'
    persistent:
      type: enum
      values:
      - never
      - content
      - page
      default: never
      description: 'Above this layout width the panel stops being an overlay and becomes
        a fixed sidebar beside the content: always visible, no scrim, no trap, part
        of the page''s tab order, and the trigger is hidden. `content` switches at
        layout.maxWidth.content, `page` at layout.maxWidth.page. Below it, the overlay
        behavior applies. This is how one component serves a phone''s hamburger menu
        and a desktop''s sidebar.'
    role:
      type: enum
      values:
      - complementary
      - navigation
      default: complementary
      description: 'The landmark the panel exposes (in persistent mode and as the
        region''s role when open): `navigation` for a menu of Links, `complementary`
        for filters, a cart, a detail. On web this is the Landmark component''s `as`.'
    modal:
      type: boolean
      default: false
      description: 'False (the default, the disclosure pattern): the panel is a disclosed
        region — no scrim by default, the page stays live and in the tab order after
        the panel, focus stays on the trigger when it opens, and Escape from inside
        or a click outside closes it. True: the panel is a modal Dialog at the edge
        — scrim, focus moved in and trapped, page inert and scroll-locked — for a
        panel that must be finished or dismissed (a cart checkout, a required filter).'
    scrim:
      type: boolean
      default: true
      description: Show the scrim in non-modal mode too (modal always has one). Off
        for a panel that should feel like part of the page.
    dismissible:
      type: boolean
      default: true
      description: Escape, the close button, a scrim tap / outside click, and the
        swipe gesture all request close. When false, the close button is not rendered
        and taps outside do nothing; Escape still reports through onOpenChange with
        reason escape (the consumer decides), as in Dialog.
    swipeable:
      type: boolean
      default: true
      description: On touch, a swipe toward the edge dismisses; from the edge, a swipe
        opens (native only). Purely additive.
      a11y: A gesture is never the only way (WCAG 2.5.1); the trigger and close button
        always exist.
  events:
    onOpenChange:
      description: 'Fired when the panel opens or closes, with the new state and a
        reason: `trigger`, `escape`, `close-button`, `scrim`, `swipe`, `action`, `navigation`
        (a Link inside was followed).'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
  keyboard:
  - keys:
    - Enter
    - ' '
    action: 'Toggles the panel from the trigger (aria-expanded flips). Non-modal:
      focus stays on the trigger. Modal: focus moves into the panel.'
    when: focus on trigger
    from: trigger
    expect: toggles
  - keys:
    - Tab
    action: 'Non-modal: from the trigger, moves into the open panel (it is next in
      DOM order); from the last element in the panel, continues into the page. Modal:
      from the last element wraps to the first.'
    when: open
    from: trigger
    expect: manual
  - keys:
    - Escape
    action: Closes and returns focus to the trigger (from inside the panel; a persistent
      sidebar ignores it).
    when: open
    from: inside
    expect: closes
  - keys:
    - Shift+Tab
    action: 'Non-modal: from the first element in the panel, returns to the trigger
      and leaves the panel open. Modal: wraps to the last element.'
    when: open
    from: first
    expect: focus-trigger
  styles:
    scrim:
      token: color.overlay.scrim
      locked: false
    surface:
      token: color.overlay.surface
      locked: true
    shadow:
      token: shadow.overlay
      description: Overlay mode only; the persistent sidebar has a border instead.
      locked: false
    border:
      token: color.border
      description: The inner edge of a persistent sidebar.
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    width:
      token: layout.maxWidth.prose
      description: Default panel width on wide screens; narrow is space.20 × 3 (a
        link list), wide is layout.maxWidth.content. Below the prose breakpoint the
        panel is the viewport minus `edgeGutter`.
      locked: false
    widthNarrow:
      token: space.20
      description: Multiplied by 3 — the doc states the arithmetic so no literal appears
        in code.
      locked: false
    widthWide:
      token: layout.maxWidth.content
      locked: false
    edgeGutter:
      token: space.12
      description: The strip of scrim left visible beside a phone-width panel, so
        the page is still seen and tappable to close.
      locked: false
    inset:
      token: layout.inset.lg
      locked: false
    headerGap:
      token: layout.gap.normal
      description: Between title and close button.
      locked: false
    partGap:
      token: layout.gap.loose
      description: Between header, body and footer.
      locked: false
    footerGap:
      token: layout.gap.tight
      locked: false
    layer:
      token: layer.sheet
      locked: false
    enter:
      token: motion.duration.base
      description: Slide in from the edge with the scrim fading; motion.easing.standard;
        instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      description: Slide out with motion.easing.exit; a swipe dismiss continues at
        the swipe velocity.
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    closeLabel: Close
  a11y:
    role: none
    requires:
    - accessible-name
    - expanded-state
    - focus-restore
    - escape-dismiss
    - gesture-alternative
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-44px
    - landmark-role
    - focus-trap
    - inert-background
    - scroll-lock
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
    - foreground: color.link
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: aside
      attributes:
      - aria-expanded
      - aria-controls
      - aria-labelledby
      - hidden
      - role=complementary
      - role=navigation
      - role=dialog
      - aria-modal
      - inert
      notes: 'Non-modal (default, APG disclosure): the trigger Button gets aria-expanded
        and aria-controls={panelId}; the panel is an <aside aria-labelledby> (or <nav>
        when `as: nav`) rendered immediately after the trigger in DOM order so Tab
        flows trigger → panel → page, with the `hidden` attribute when closed (after
        the exit transition), position: fixed at the edge, full height, on layer.sheet,
        with an optional scrim <div aria-hidden> that closes on click. Focus stays
        on the trigger on open; Escape anywhere inside closes and refocuses the trigger;
        a focusout to outside the panel and trigger does NOT close it (unlike Popover
        — a navigation panel should survive a stray click) but a pointerdown on the
        scrim or outside does when dismissible. Modal: the same content in the native
        <dialog> via showModal() as Dialog and BottomSheet, inert page and scroll
        lock through FocusScope''s modal contract, focus moved to the first control.
        A Link followed inside the panel closes it with reason navigation (a client-side
        router fires onOpenChange; a full navigation makes it moot). Persistent mode
        above the chosen breakpoint (matchMedia on the token): render a plain <aside
        role="complementary" aria-labelledby> (or <nav> when the body is navigation
        — the caller passes `as: nav` through the Landmark component) in the page
        grid beside the content, no dialog, no scrim, no trap, trigger hidden with
        display none. The switch must not lose the panel''s content state (the same
        children render in both). Safe-area padding via env(safe-area-inset-left/right).'
    lit:
      tag: ds-side-panel
      reflect:
      - open
      - side
      - width
      - persistent
      - dismissible
      - swipeable
      notes: 'Slots `trigger`, default and `footer`. Shadow <dialog> for overlay mode;
        in persistent mode the host itself lays out as the sidebar (display: block
        in the parent grid) and the slotted content renders in an <aside> in the shadow
        root. Composed `open-change`. matchMedia listener on the persistent breakpoint.
        `aria-controls` cannot reach the shadow panel from the slotted trigger, so
        only aria-expanded is set on it; the panel is named by its heading inside
        the shadow root. `role` selects the landmark role of the shadow region. `container`
        is not needed: the panel lives in the shadow root.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - accessibilityViewIsModal
      notes: 'Native Modal with an Animated.View surface translated from the start
        (or end) edge, scrim Pressable to close, PanResponder for the swipe (edge-swipe
        to open needs a gesture on the screen root; offer it via a `useSidePanelEdgeSwipe`
        hook rather than assuming). onRequestClose → escape. Tablets in landscape
        with `persistent` set: render as a sibling View beside the content (no Modal),
        matching the web sidebar. RTL flips `start`/`end` via I18nManager. Non-modal
        ''page stays live'' cannot be reproduced under RN Modal (it intercepts all
        touches); only tap-outside-to-close is possible, and the doc accepts that.
        `role` maps to the RN >= 0.74 `role` prop on the persistent sidebar View.
        `navigation` as a close reason is never emitted natively (no router hook).
        `useSidePanelEdgeSwipe` requires the panel to be controlled (`open`).'
    swiftui:
      element: ZStack
      props:
      - .offset
      - .transition
      - withAnimation
      - FocusScope
      - .accessibilityAddTraits=isModal
      - .accessibilityValue=expanded
      - Button
      - .gesture=DragGesture
      notes: A panel slid in from `side` with `.offset` animated over the motion tokens
        (instant under reduced motion), rendered by the app as the trailing sibling
        of its content (`SidePanel` is placed in the view tree where it overlays;
        `.dsPortalHost` is not needed). The trigger `Button` carries `.accessibilityValue(copy.expanded
        / collapsed)` (no expanded trait) and controls the panel; `modal` adds the
        scrim `Rectangle` (`color.overlay.scrim`, tap closes when `dismissOnScrim`),
        FocusScope trap and `.isModal`; non-modal panels push content aside (`inline`)
        or overlay it without a scrim. Edge-swipe to close is an addition to the visible
        close `Button`.
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `scrim`, `shadow`, `border`, `borderWidth`, `width`, `widthNarrow`, `widthWide`, `edgeGutter`, `inset`, `headerGap`, `partGap`, `footerGap`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `focusRing`, `focusRingWidth`

## Behavior scenarios (12)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-side-start
  given:
    side: start
  then:
  - renders: true
  derived: true
- name: renders-side-end
  given:
    side: end
  then:
  - renders: true
  derived: true
- name: renders-width-narrow
  given:
    width: narrow
  then:
  - renders: true
  derived: true
- name: renders-width-default
  given:
    width: default
  then:
  - renders: true
  derived: true
- name: renders-width-wide
  given:
    width: wide
  then:
  - renders: true
  derived: true
- name: renders-persistent-never
  given:
    persistent: never
  then:
  - renders: true
  derived: true
- name: renders-persistent-content
  given:
    persistent: content
  then:
  - renders: true
  derived: true
- name: renders-persistent-page
  given:
    persistent: page
  then:
  - renders: true
  derived: true
- name: renders-role-complementary
  given:
    role: complementary
  then:
  - renders: true
  derived: true
- name: renders-role-navigation
  given:
    role: navigation
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (rn)

```yaml
element: Modal
props:
- visible
- transparent
- onRequestClose
- accessibilityViewIsModal
notes: "Native Modal with an Animated.View surface translated from the start (or end)\
  \ edge, scrim Pressable to close, PanResponder for the swipe (edge-swipe to open\
  \ needs a gesture on the screen root; offer it via a `useSidePanelEdgeSwipe` hook\
  \ rather than assuming). onRequestClose \u2192 escape. Tablets in landscape with\
  \ `persistent` set: render as a sibling View beside the content (no Modal), matching\
  \ the web sidebar. RTL flips `start`/`end` via I18nManager. Non-modal 'page stays\
  \ live' cannot be reproduced under RN Modal (it intercepts all touches); only tap-outside-to-close\
  \ is possible, and the doc accepts that. `role` maps to the RN >= 0.74 `role` prop\
  \ on the persistent sidebar View. `navigation` as a close reason is never emitted\
  \ natively (no router hook). `useSidePanelEdgeSwipe` requires the panel to be controlled\
  \ (`open`)."
```

## Guidance

## Overview

A side panel is the drawer: hidden off the edge until a button asks for it, then sliding in beside the page. It is built on the simplest APG pattern that fits — a button with `aria-expanded` that controls a region — so by default it behaves like a disclosure that happens to slide: focus stays on the button, Tab walks into the panel, Escape puts it away. Only when a panel must be finished or dismissed does it become a modal dialog at the edge. It holds whatever a page needs at hand but not on screen — the navigation List, a set of filters, the cart — and on a wide screen the same component can stay put as a sidebar, so a product has one menu, not a phone menu and a desktop one.

## When to use

Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a List or Tree of Links from the `start` edge), for filters beside a results page, for a cart or a detail panel from the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should become the permanent sidebar on desktop; leave it `never` for panels that are always a temporary overlay (a cart).

## When not to use

Do not use a SidePanel for a short list of actions (Menu, ActionSheet), for a task with a few fields (Dialog or BottomSheet, which the thumb reaches), or for content that is the page's point. Do not open one on hover. Use `modal` only when the page must not be used until the panel is done; a navigation drawer is not that. Do not stack side panels, and do not put a Dialog's job inside one — a panel is a place, not a step.

## Behavior

The trigger toggles the panel and reflects it with `aria-expanded`. Non-modal (default): opening slides the panel in from `side` and fades the scrim if shown; focus stays on the trigger, and the next Tab enters the panel because it sits right after the trigger in the document; Shift+Tab from the first control returns to the trigger with the panel still open; the page stays live. Modal: focus moves to the first control (or the title), the page is inert and scroll-locked, Tab is confined. In both, the body scrolls within the panel and the footer stays pinned; Escape (from inside), the close button, a scrim or outside tap, and a swipe toward the edge request close; following a Link inside closes it with reason `navigation`; closing returns focus to the trigger. Above the `persistent` breakpoint the panel is simply there: no scrim, no trap, the trigger hidden, the same content in the page's tab order as a `complementary` (or navigation) landmark; crossing the breakpoint while open keeps the content and drops the overlay chrome. `start` and `end` follow the writing direction. The swipe-to-dismiss gesture lives on the header (not the close button). When closed the panel is either unmounted or `hidden` — both remove it from the accessibility tree; the exit transition finishes first. The non-modal scrim fades with the panel''s enter/exit durations. The trigger is a single element; a `menu` Icon exists for the usual icon-only trigger.

## Content guidelines

Titles name what the panel holds ("Menu", "Filters", "Your cart"), not "Side panel". A navigation panel is a List of Links with the current page marked (`aria-current="page"`), grouped with Dividers if long; keep it to what fits without scrolling on a typical phone. Filter panels end with an action row in the footer ("Apply", "Clear"). The trigger's label says what opens ("Menu", "Filters"), and the `menu` Icon alone is only acceptable with that label for assistive technology.

## Accessibility

The default is the APG disclosure pattern: a button with `aria-expanded` and `aria-controls` showing and hiding a named landmark region (WCAG 4.1.2, 1.3.6), with the region placed after the button in DOM order so the tab sequence is the visual sequence (2.4.3, 1.3.2); the hidden panel uses `hidden`, not just off-screen positioning, so it is out of the accessibility tree when closed. Escape closes from inside and restores focus to the button (2.1.2). With `modal` the panel is a modal `dialog` named by its title: focus moves in and is confined, the background is inert and scroll-locked (APG modal dialog). The swipe is additive (2.5.1). In persistent mode it is a landmark region (`complementary` or `navigation`) in the normal tab order, so a screen-reader user can jump to it (1.3.6, 2.4.1). The panel meets contrast on the overlay surface, its close button meets 44px, and the slide respects reduced motion (2.3.3). A phone-width panel leaves a strip of scrim visible so sighted users keep their sense of place and have a large close target.

## Platform notes

### Web
Clone the trigger with `aria-expanded`, `aria-controls`, `onClick` (toggle). Non-modal: render `<aside aria-labelledby id hidden={!open} data-ds="SidePanel" class="ds-side-panel--{side} ds-side-panel--{width}">` (or `Landmark as="nav"`) directly after the trigger, `position: fixed`, and an optional scrim `<div aria-hidden>` before it; keydown Escape inside → close + focus trigger; pointerdown outside (document listener) → close when dismissible; `hidden` is applied after the exit transition ends. Modal: render `<dialog aria-labelledby>` through `showModal()` with `position: fixed; inset-block: 0; inset-inline-start: 0` (or `-end`), `inline-size` from the width tokens (`min(var(--ds-side-panel-width), 100vw - var(--ds-side-panel-edge-gutter))`), translated from `-100%` to `0` over `enter`, `::backdrop` from `scrim`; wrap content in `FocusScope trapped={modal} autoFocus={modal ? 'first' : false} restoreFocus`; header `Stack` horizontal with the `Heading` (`level 2`, visually hidden when `hideHeading`) and the close `Button` (`ghost`, `iconOnly`, `close` Icon); body `Box` scrolling; footer `Stack`. Click on the backdrop and Escape → close. A `click` on an `<a>` inside with a client-side router → close with `navigation`. Persistent: `matchMedia('(min-width: <token px>)')` (`literal-ok: breakpoint from layout.maxWidth.*`) renders `Landmark as="complementary"` (or `"nav"`) with the same children and `border-inline-end` from `border`, and the trigger with `hidden`; the page layout places it with a grid column of the width token. Safe area via `env(safe-area-inset-left)`/`-right`.

### Lit
`<ds-side-panel heading="Menu" persistent="content"><ds-button slot="trigger" icon-only icon="menu" label="Menu"></ds-button><ds-list>…</ds-list></ds-side-panel>`; shadow `<dialog>`; persistent mode switches the host to `display: block` in the parent grid and renders an `<aside>`; composed `open-change`.

### React Native
`Modal` with an `Animated.View` panel at the `start`/`end` edge (`I18nManager.isRTL` flips), width from tokens capped at screen width minus `edgeGutter`, scrim `Pressable`, `PanResponder` swipe toward the edge to dismiss, `FocusScope`, `onRequestClose` → escape. `persistent` on tablets above the breakpoint renders a sibling `View` with `accessibilityRole="none"` and a label, beside the content. Provide `useSidePanelEdgeSwipe()` for the edge-swipe-to-open gesture on the screen root.

## Related

BottomSheet, Dialog, Menu, Landmark, Tree, Link, FocusScope.
