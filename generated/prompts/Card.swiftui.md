# Generate: Card for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Card.swift` declaring `public struct Card: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/CardBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Card.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Card") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("Card")` on the root and `"Card.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for swiftui; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: each closure takes exactly the listed arguments, in order, and `reason` is a nested `enum` of its reasons. A `cancelable` closure returns `Bool`, and `false` skips the default action. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: every pair becomes a `Binding<T>?` parameter plus the default's initial value, with `@State` holding the uncontrolled value; the closure fires in both modes, and a bound view shows the new state only once the binding changes.
- **Parts and slots**: each slot is a `@ViewBuilder` parameter under its resolved label only (`content` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides:` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (`.onHover`, `@FocusState`, or the view's own state), with the token listed for each `by` value; write `computed` as the given multiplication of `theme` values. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` applies when those props are set.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this picks among the conventions' overlay forms.
- **Copy**: interpolate only the listed `params` and props; select plural forms through `String(localized:)` with the entry's forms as its plural variations; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example becomes a `#Preview` with the name shown and exactly its `given`.
- **Lifecycle**: a deprecated parameter, closure, case or view keeps working, is marked `@available(*, deprecated, message:)` naming `use`, and warns once under `#if DEBUG` naming `use`.
- A `type: integer` prop is an `Int`: whole numbers only.

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
      description: 'The body. Usually a Stack of Text and controls; a plain string
        or number is rendered inside the system Text with its defaults (a bare string
        cannot sit in a native View), including each top-level string or number in
        an array body. The wrap is a native requirement, not a cross-platform contract:
        Lit leaves a bare slotted text node alone, because wrapping it would mean
        reparenting the consumer''s light-DOM children, which Card never does. Fragments
        and arrays are flattened before the wrap, exactly as they are when the interactive
        target is looked for, so a string directly inside a top-level Fragment is
        wrapped too.'
    heading:
      type: string
      description: 'The card''s title, rendered as the system Heading at the card''s
        level and at `size: lg` on every platform, so a card heading reads smaller
        than a page heading. Omit for cards that are a single piece of content; an
        empty string counts as omitted (no article, no label) — but the header row
        still renders when `headerActions` is set, holding the actions alone. It is
        an anatomy part by name only: it carries no `data-part`, since it is the system
        Heading and keeps that component''s own hook.'
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
        Fragment is flattened, so its children count as top-level; on Lit there is
        nothing to flatten, since a nested template''s nodes are already siblings
        and are assigned to the default slot as top-level children. With zero or several
        such children the card stays non-interactive (no hit area, no hover background,
        no press) and warns once per mounted card in development — latched for the
        life of the mount, so a card that goes valid and then invalid again does not
        warn a second time. The warning text is a development diagnostic, not user-facing
        copy, so it is not a `copy.*` string and its wording may differ between platforms.
        If the child is disabled the card is disabled with it: no hover background,
        pressing does nothing, and on native the Pressable reports disabled. The card
        itself never dims — there is no disabled opacity binding here; the child renders
        its own disabled state. Controls in `headerActions` and `footer` are never
        the target; they sit above the hit area and keep their own targets.'
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
        target. On web and Lit the ring is an outline of focusRingWidth in focusRing,
        drawn outside the box, so a focusable card reserves no border; React Native
        has no outline, so there it reserves border.width.focus like an interactive
        card. On Lit the shadow root deliberately does not use delegatesFocus — the
        documented exemption from the rule that focusable elements delegate — so scripted
        focus lands on the card and not on its first focusable child.
      a11y: 'Only scripted focus (PageUp/PageDown in a Feed) lands here, so the card
        draws the ring whenever it takes focus, not only on :focus-visible: it sets
        a focus-ring state in its own focusin handler and clears it on focusout, skipping
        the state when that focusin follows a pointerdown on the card. Plain :focus-visible
        is not enough — Chromium does not match it on a programmatic focus() that
        follows a pointer interaction, which is exactly the Feed case.'
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
      description: In effect with surface default only; a subtle card draws no border,
        so an override of this binding changes nothing there.
      locked: false
    borderWidth:
      token: border.width.thin
      description: Rendered only with surface default. An interactive card always
        reserves border.width.focus instead, so the ring appearing never shifts the
        layout; at rest that border is colored `border` on surface default (the card
        keeps its visible border) and transparent on subtle, and `focusRing` while
        the ring shows. The reserve is keyed on the `interactive` prop alone, not
        on whether a target was found, so a card that fell back to non-interactive
        still reserves the width rather than changing its geometry on a content change.
        React Native reserves it for `focusable` cards too, since it has no outline
        to draw outside the box. An override of this binding therefore only changes
        cards that are neither interactive nor (on native) focusable.
      locked: false
    radius:
      token: radius.lg
      locked: false
    hoverBackground:
      token: color.background.subtle
      state: hover
      by: surface
      values:
        default: color.background.subtle
        subtle: color.background.strong
      description: 'Interactive cards only, on pointer hover (a plain `:hover` on
        web and Lit, no `@media (hover: hover)` guard, as Link). The surface picks
        the token — a subtle card cannot hover to its own background — and the same
        lookup applies on every platform. Native has no hover, so the Pressable shows
        it while pressed, and on pointer hover where the platform reports one (iPad
        pointer, react-native-web).'
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
    - foreground: color.foreground
      background: color.background.strong
      level: AA
    - foreground: color.link
      background: color.background.strong
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
        open shadow root — the same sanctioned exception as the class. That forwarder
        re-checks the target''s disabled state itself: a click on the extended area
        never reaches the child''s own guard, so without the check a disabled target
        would still be activated. The ring shows only while that target has keyboard
        focus: the card toggles a `target-focus` custom state on focusin/focusout
        when the focused element matches :focus-visible and draws on :host(:state(target-focus));
        a focused header-actions or footer control does not ring the card. On interactive
        cards only, the header-actions and footer rows get position: relative and
        z-index: 1 above the hit area. The hover rules use two more custom states:
        `has-target` (exactly one target found) and `target-disabled` (the target
        has a `disabled` attribute or aria-disabled="true", watched with a MutationObserver
        that writes nothing back). The zero-or-several warning is not judged on the
        first update: it runs on the default slot''s slotchange and when `interactive`
        changes. `focusable`: the host itself takes tabindex="-1" and the shadow root
        does not use delegatesFocus, so scripted focus lands on the card rather than
        its first focusable child; the ring is an outline on the surface part while
        the host matches :focus-visible, and the host''s own outline is removed. With
        a heading the host gets role="article" as a plain attribute unless the consumer
        already set a role, and aria-label with the heading text unless the consumer
        already set one; the card removes only a role or aria-label it wrote itself.'
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
        parity. accessibilityRole and accessibilityLabel belong to the interactive
        Pressable only: a non-interactive card''s root View carries neither, because
        labelling it would collapse the card into one accessibility node and hide
        the Heading, body and footer from swipe navigation — so on native a heading
        names the Heading, never the container, and there is no article equivalent.
        An interactive card whose target is a Link presses that Link''s native path
        (Linking.openURL), so under react-native-web it opens a new window rather
        than navigating in place, unlike a bare Link; no component in the package
        reaches for DOM globals to change that.'
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
      heading: ''
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
- `headerActions`: slot, `@ViewBuilder` parameter `headerActions`
- `body`: slot, `@ViewBuilder` parameter `children`, required
- `footer`: slot, `@ViewBuilder` parameter `footer`

## Style bindings

- `headerGap`: token `layout.gap.normal`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `actionsGap`: token `layout.gap.tight`; part `headerActions`
- `hoverBackground`: token `color.background.subtle`; state `hover`; by `surface`: default → `color.background.subtle`, subtle → `color.background.strong`, any other value → `color.background.subtle`; locked

## Constants and examples

- example `plan-card`, story `PlanCard`: given `heading: "Team plan"`, `headingLevel: "3"`, `children: "What the plan includes"`; A card as a unit in a list of choices, with its own heading at the list's level.
- example `dense-grid-card`, story `DenseGridCard`: given `heading: ""`, `children: "A search result"`, `inset: "sm"`, `surface: "subtle"`; A card in a dense grid, on the tinted surface and with the tighter inset, and no heading: the story clears any Default heading.
- example `whole-card-is-a-link`, story `WholeCardIsALink`: given `heading: "September invoice"`, `children: "A Link to the invoice"`, `interactive: true`; A card whose single child link leads somewhere, with the card as the hit area and the link as the only tab stop. The children string describes content, not a value: render a Link labelled with that text (href #) at the top level of the body.
- example `card-focused-by-a-feed`, story `CardFocusedByAFeed`: given `heading: "New comment"`, `children: "The comment body"`, `focusable: true`; A card a Feed moves focus to with PageUp/PageDown, which draws its own ring when focused that way.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `paddingBlock`, `paddingInline`, `partGap`, `headerGap`, `footerGap`, `actionsGap`, `border`, `borderWidth`, `radius`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `hoverBackground`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
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
notes: "Surface from the tokens, `inset` padding, header row (`Heading` + `headerActions`\
  \ HStack), body, footer with the gap bindings. `.accessibilityElement(children:\
  \ .contain)` labelled by the heading. `interactive`: the card is wrapped in a `Button`\
  \ whose action is the single child link/button's action (found by the child declaring\
  \ itself through `CardActionPreference`), the child is `.accessibilityHidden` inside\
  \ it, and hover shows `hoverBackground` on iPad pointer \u2014 one target, one focus\
  \ stop. `focusable`: `.focusable()` with the focus ring drawn on the card, for Feed's\
  \ PageUp/PageDown."
```

## Guidance

## Overview

A Card frames one thing so it can sit among others: a search result, a plan to choose, a setting group, a dashboard panel. It is a Box with conventions — a heading row, a body, an action row, consistent padding and gaps from the theme's rhythm — so that every card on every screen has the same internal spacing without anyone choosing it.

## When to use

Use Cards for collections of like items where each needs its own boundary, and for a single panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page. Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.

## When not to use

Do not put a card inside a card. Do not use Cards to separate sections of a form or a settings page — that is a Landmark or a Heading with `section` spacing. Do not use a Card for a status message (Alert) or for a transient layer (Dialog, planned). Do not use `interactive` with more than one control inside; nested targets are a well-known accessibility failure.

## Behavior

The header renders when `heading` or `headerActions` is present, the footer when `footer` is present; body always. Present means not `undefined`, `null` or `false`: a `0` or an empty string is content and renders its row. Header, body and footer are separated by `partGap`, and the card pads all of it by `inset`. `surface: default` draws a border, `subtle` does not. An `interactive` card grows its single child link or button's hit area to the whole card, shows `hoverBackground` on pointer hover, and draws the focus ring around the card when that child has keyboard focus — but adds no focus stop of its own. A `focusable` card carries `tabIndex={-1}` on its root and draws the same ring on its own `:focus-visible`; `tabIndex` is not a Card prop, and a caller who wants scripted focus sets `focusable` (which wins over any `tabIndex` in `...rest`). Every anatomy part carries `data-part` with its name on the element that holds it — the root is `surface`, and `header`, `headerActions`, `body` and `footer` are the row or wrapper around their content, not a slot element — except `heading`: it is the system Heading, which keeps its own hook, and is located by role heading or its text. Aria attributes passed through `...rest` (role, aria-posinset, aria-setsize, aria-describedby) land on the root, which is how Feed makes a Card an article.

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

## Behavior scenarios (12)

One test per scenario, in this order.

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
