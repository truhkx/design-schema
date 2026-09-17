# Generate: Link for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Link.swift` declaring `public struct Link: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/LinkBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Link.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Link") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Link")` on the root and `"Link.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Link
  category: navigation
  status: review
  apg: link
  anatomy:
  - anchor
  - label
  - externalIcon
  props:
    href:
      type: string
      required: true
      description: The destination. A URL on web; a URL or app route on native, resolved
        by `onPress` when the consumer provides it.
    label:
      type: string
      required: true
      description: The link text. Also the accessible name. Says where the link goes,
        not "click here".
    external:
      type: boolean
      default: false
      description: Opens the destination in a new tab or the system browser and appends
        `copy.externalSuffix` to the accessible name, with a decorative trailing icon.
      a11y: Users are told the link leaves the current context before they activate
        it (WCAG 3.2.5 advisory, G201).
    tone:
      type: enum
      values:
      - default
      - inherit
      default: default
      description: '`default` uses the link colors. `inherit` takes the surrounding
        text color and relies on the underline alone — for links inside muted or on-action
        text. Under `inherit` the color, colorHover and colorVisited bindings are
        not applied: rest, hover, visited and (on native) pressed all resolve to the
        inherited color (currentColor on web and Lit, the enclosing TextStyleContext
        color on native), and the underline and the external icon follow that same
        color, so an inherited link has no hover or visited color change by design.
        On native Link sets no textDecorationColor (the underline takes the Text color);
        a standalone inherit link outside any system Text has nothing to inherit,
        so its label and icon both use color.foreground.'
    download:
      type: boolean
      default: false
      description: Downloads the resource instead of navigating, under the server's
        file name (a custom file name is out of scope). Web only.
      platforms:
      - web
      - lit
  events:
    onPress:
      description: 'Fired when the link is activated. On web the default navigation
        still happens unless the consumer prevents it; on native the consumer must
        navigate (the system opens URLs with Linking when no handler is given). On
        Lit the name is the native anchor''s own `click`, retargeted out of the shadow
        root — Link emits no `press` CustomEvent. Cancelling: on web the handler receives
        the click event and cancels navigation with preventDefault or by returning
        `false` (typed `(event) => void | boolean`; Link calls preventDefault on `false`);
        on Lit the consumer calls preventDefault on the click; on native the handler
        receives `href` and returning `false` cancels the Linking hand-off, the only
        default action native has. `fires: [user]` means Link never dispatches it
        itself; on web and Lit a script calling `.click()` on the anchor still fires
        it, as on any link, and Link does not try to filter that out.'
      platforms:
        web: onClick
        lit: click
        rn: onPress
        swiftui: action
      cancelable: true
      fires:
      - user
  styles:
    color:
      token: color.link
      locked: true
    colorHover:
      token: color.link.hover
      state: hover
      description: 'Pointer hover only on web and Lit (not :active), as a plain `:hover`
        rule with no `@media (hover: hover)` guard; a sticky hover color after a tap
        is an accepted, proven pair. On native, which has no hover, the pressed color.'
      locked: true
    colorVisited:
      token: color.link.visited
      description: Web and Lit only; native has no visited state.
      locked: true
    underlineThickness:
      token: border.width.thin
      description: Text-decoration thickness; the underline is always present at rest.
      locked: false
    underlineOffset:
      token: space.1
      locked: false
    externalIconGap:
      token: space.1
      part: externalIcon
      description: 'Gap before the trailing icon, applied as margin-inline-start on
        Link''s own `externalIcon` wrapper span (inline text has no Stack to use),
        never on the Icon inside it. The icon is 1em of the surrounding font size
        (no token: it scales with the text). On React Native nested Text ignores margins,
        so the gap is a single literal space and this binding is not applied.'
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    focusRingRadius:
      token: radius.sm
      description: Applied (as border-radius) only under :focus-visible, so a resting
        inline anchor is not rounded.
      locked: true
    focusRingOffset:
      token: border.width.focus
      description: outline-offset of the focus ring on web and Lit, the same token
        as its width. Not applied on native, where the ring is the platform's own.
      locked: true
    transition:
      token: motion.duration.fast
      description: Color transition on hover, with motion.easing.standard.
      locked: false
  copy:
    externalSuffix: ' (opens in new tab)'
    external: opens in new tab
  a11y:
    role: link
    requires:
    - accessible-name
    - focus-visible
    - keyboard-operable
    - contrast-aa
    contrast:
    - foreground: color.link
      background: color.background
      level: AA
    - foreground: color.link.hover
      background: color.background
      level: AA
    - foreground: color.link.visited
      background: color.background
      level: AA
  platforms:
    web:
      element: a
      attributes:
      - href
      - target
      - rel
      - download
      notes: 'A native <a href>. `external` sets target="_blank" and rel="noopener
        noreferrer". The visible label stays as-is; the external suffix is added in
        visually hidden text, not aria-label, so the accessible name still starts
        with the visible text. Link accepts no `className` or `style`: a composite
        that shows a link inside its own row uses `tone: inherit` and keeps the underline.
        The root <a> carries `data-ds="Link"` and `data-part="anchor"`, and those
        win: a parent never stamps its own `data-part` onto Link''s root, it puts
        its part on a wrapper element it owns. The `label` part is a `<span data-part="label">`
        holding the visible text inside the anchor (web and Lit); on native the root
        Text is the anchor and the label is its string content, with no element of
        its own. Lit shadow elements carry `part` as well as `data-part`, both the
        anatomy names: they are names tests read, not a styling surface.'
    lit:
      tag: ds-link
      reflect:
      - tone
      - external
      - download
      notes: 'Wraps a native <a> in the shadow root with delegatesFocus. No custom
        event: the native click bubbles and retargets to the host. Consumers who intercept
        navigation call preventDefault on that click. A ds-link inside a ds-text paragraph
        is inline by default (display: inline). `href` and `label` are required but
        a property needs an initial value, so both start as '''' and Link does not
        warn; an empty href is the consumer''s authoring error (render Text instead).'
    rn:
      element: Text
      props:
      - accessibilityRole=link
      - accessibilityLabel
      - onPress
      notes: 'Renders Text with accessibilityRole="link" so it is inline inside a
        parent Text. The external mark is `Icon name="external" inline`, preceded
        by a single literal space (nested Text ignores margins, so `externalIconGap`
        is not applied). With `tone: default` Link passes the link color to Icon''s
        `color` prop, and it swaps instantly on press while the label crossfades;
        with `tone: inherit` Link passes no `color`, so Icon takes the enclosing TextStyleContext
        color when nested in a system Text and color.foreground otherwise. Of the
        override bindings only `transition` has an effect on native (Text cannot set
        underline thickness/offset, and the gap is a space), so the native LinkOverridableBinding
        type is `transition` alone. Activation calls `onPress(href)` first when provided,
        and returning `false` from it cancels any Linking hand-off. For a non-external
        link that handler is the navigation and Linking.openURL(href) is only the
        fallback when there is no handler; an `external` link hands off to Linking.openURL(href)
        after the handler as well, because a consumer''s own router cannot open the
        system browser. `accessibilityLabel` is the label plus `copy.externalSuffix`
        verbatim when `external`: one suffix string on every platform, kept even though
        native opens the system browser rather than a tab; `copy.external` is unused
        on native. Icon''s inline mode renders at font.size.md rather than the enclosing
        Text''s size, which is Icon''s own documented limit and can look mis-sized
        inside a non-md Text. No hover or visited state; the pressed state uses colorHover.
        On react-native-web this becomes a real anchor. Forwards `accessibilityHint`,
        `accessibilityLabel` (when set by a parent such as Tooltip), `onHoverIn`,
        `onHoverOut`, `onFocus`, `onBlur` and `onLongPress` to the native element,
        so Tooltip can attach to it through those props; Link exposes no `ref` prop
        and no ref to its Text root.'
    swiftui:
      element: Link
      props:
      - Link
      - Button
      - .accessibilityAddTraits=isLink
      - openURL
      - .underline
      - .accessibilityHint
      notes: 'SwiftUI `Link(destination:)` for `href` (opens through `@Environment(\.openURL)`,
        so an app can intercept in-app routes); a `Button` with `.isLink` trait when
        only `action` is given. Underline from the `underline` token via `.underline(true,
        pattern: .solid, color:)`; `external` appends the `external` Icon inline and
        `copy.external` to the accessibility label. Inline links inside `Text` render
        as `Text` concatenation with `.link` attribute for the URL, so a paragraph
        with a link is one accessibility element with the link as a rotor item.'
  behavior:
  - name: click-fires-on-press
    description: Activation with pointer, Enter, or assistive technology navigates
      to href; onPress fires first.
    when:
      click: anchor
    then:
    - event: onPress
  - name: external-link-announces-that-it-leaves
    description: The accessible name is the visible text plus copy.externalSuffix,
      so users are told the link leaves the current context before they activate it.
      On web and Lit the `copy` expectation reads the anchor's text content, where
      the suffix sits in visually hidden text; the name is reached through the shadow
      root on Lit and is the accessibilityLabel on native.
    given:
      external: true
      label: View the billing history
    then:
    - copy: externalSuffix
      platforms:
      - web
      - lit
    - name: View the billing history (opens in new tab)
      platforms:
      - web
      - lit
      - rn
  - name: external-link-opens-a-new-tab
    description: external sets target="_blank" and rel="noopener noreferrer" on web
      and Lit.
    given:
      external: true
    then:
    - attribute: target
      is: _blank
      platforms:
      - web
      - lit
    - attribute: rel
      is: noopener noreferrer
      platforms:
      - web
      - lit
  - name: download-asks-the-browser-to-save
    description: download asks the browser to save rather than open (web and Lit only);
      the attribute is present and valueless.
    given:
      download: true
    then:
    - attribute: download
      is: ''
      platforms:
      - web
      - lit
  examples:
  - name: inline-in-a-paragraph
    description: The default link inside body text, underlined and taking the paragraph's
      typography. The story renders it inside a default Text paragraph reading "Invoices
      from the last twelve months are kept. " followed by the link and a full stop.
      Its href and label are also the Default story's args, so the derived renders
      and accessible-name scenarios run against them.
    given:
      href: /billing/history
      label: View the billing history
  - name: external-destination
    description: A link that leaves the product, so the name says so before it is
      activated. This example is the `external` state story (and downloadable-file
      the `download` one); no separate External or Download story is added.
    given:
      href: https://status.example.com
      label: Status page
      external: true
  - name: inside-muted-text
    description: 'A link in muted or on-action text, where the color is inherited
      and the underline alone marks it. The story renders it inside a Text with `tone:
      muted` reading "For how charges are calculated, read " followed by the link
      and a full stop. The `tone: inherit` enum story uses the same muted wrapper,
      so the inherited color is visible.'
    given:
      href: /help/billing
      label: the billing guide
      tone: inherit
  - name: downloadable-file
    description: A link to a file the browser should save rather than open.
    given:
      href: /invoices/2026-09.pdf
      label: Download the September invoice
      download: true
    platforms:
    - web
    - lit
```

## Events

- `onPress`: emit `action`
  - cancelable: yes
  - fires on: user

## Style bindings

- `colorHover`: token `color.link.hover`; state `hover`; locked
- `externalIconGap`: token `space.1`; part `externalIcon`

## Constants and examples

- example `inline-in-a-paragraph`, story `InlineInAParagraph`: given `href: "/billing/history"`, `label: "View the billing history"`; The default link inside body text, underlined and taking the paragraph's typography. The story renders it inside a default Text paragraph reading "Invoices from the last twelve months are kept. " followed by the link and a full stop. Its href and label are also the Default story's args, so the derived renders and accessible-name scenarios run against them.
- example `external-destination`, story `ExternalDestination`: given `href: "https://status.example.com"`, `label: "Status page"`, `external: true`; A link that leaves the product, so the name says so before it is activated. This example is the `external` state story (and downloadable-file the `download` one); no separate External or Download story is added.
- example `inside-muted-text`, story `InsideMutedText`: given `href: "/help/billing"`, `label: "the billing guide"`, `tone: "inherit"`; A link in muted or on-action text, where the color is inherited and the underline alone marks it. The story renders it inside a Text with `tone: muted` reading "For how charges are calculated, read " followed by the link and a full stop. The `tone: inherit` enum story uses the same muted wrapper, so the inherited color is visible.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `underlineThickness`, `underlineOffset`, `externalIconGap`, `transition`
Locked (accessibility-bearing, never overridable): `color`, `colorHover`, `colorVisited`, `focusRing`, `focusRingWidth`, `focusRingRadius`, `focusRingOffset`

## Platform notes (swiftui)

```yaml
element: Link
props:
- Link
- Button
- .accessibilityAddTraits=isLink
- openURL
- .underline
- .accessibilityHint
notes: 'SwiftUI `Link(destination:)` for `href` (opens through `@Environment(\.openURL)`,
  so an app can intercept in-app routes); a `Button` with `.isLink` trait when only
  `action` is given. Underline from the `underline` token via `.underline(true, pattern:
  .solid, color:)`; `external` appends the `external` Icon inline and `copy.external`
  to the accessibility label. Inline links inside `Text` render as `Text` concatenation
  with `.link` attribute for the URL, so a paragraph with a link is one accessibility
  element with the link as a rotor item.'
```

## Guidance

## Overview

Links take people somewhere. Buttons do things. That distinction is the whole reason this component exists: assistive technology lists links separately, users expect middle-click and open-in-new-tab to work on them, and the browser's history, visited state and find-in-page all depend on the element being a real link.

## When to use

Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to an external site, or to a downloadable file. Use it inline inside body text (it renders inline by default) and standalone in navigation lists. Use `external` whenever the destination leaves the product, so people are warned before they lose their place.

## When not to use

Do not use a Link to trigger an action — submitting, opening a dialog, toggling a setting — even if it looks lighter than a Button. Use the `ghost` Button variant for that. Do not remove the underline; underline-free links in body text are a WCAG 1.4.1 failure unless the link color contrasts 3:1 with the surrounding text *and* changes on hover, which no theme in this system promises. Do not render a Link with an empty `href` as a placeholder; render Text.

## Behavior

A Link has no typography of its own: it inherits font family, size, weight and line height from the text it sits in, so it looks right inside a paragraph, a caption, or a breadcrumb without configuration. Standalone, it inherits from the page body.

Activation with pointer, Enter, or assistive technology navigates to `href`. `onPress` fires first; on web the consumer may prevent the default to route client-side, and on native the consumer's handler is the navigation (an `external` link still hands off to the system afterwards unless the handler returns `false`). With `external`, web opens a new tab and native hands the URL to the system. `download` asks the browser to save rather than open and does nothing on native. The link is never disabled: a destination that is not available is not rendered as a link.

## Content guidelines

Link text describes the destination and makes sense out of context, because screen-reader users navigate by pulling up a list of links: "View the billing history", not "click here" or "more". Keep links short and do not link whole sentences. When an external link's text is a product name, that is enough — the external suffix already says it leaves. Do not repeat "(opens in new tab)" in the visible text; the component adds it to the accessible name.

## Accessibility

The accessible name is the visible text (WCAG 2.4.4, 2.5.3), plus `copy.externalSuffix` for external links. Links are distinguishable from surrounding text by the underline, not by color alone (1.4.1). Link color meets 4.5:1 on the page background in both modes for the rest, hover and visited colors (1.4.3); the build checks all three. Focus is visible with the focus ring (2.4.7); because links are inline, the ring uses `focusRingRadius` and follows the text box rather than the line box. Links are keyboard operable with Enter (2.1.1). Opening a new tab is a change of context that the user is warned about in advance (3.2.5).

## Platform notes

### Web
Render `<a href>` with the visible label as content. For `external`, render, in order: the label, a visually hidden `<span>` containing `copy.externalSuffix`, then the decorative icon: a `<span data-part="externalIcon">` wrapper carrying the `externalIconGap` margin, containing the system `<Icon name="external" inline />` with no label (so it hides itself). Icon's `inline` sizes it at 1em of the surrounding text, and its color is currentColor, so it follows the anchor's rest, hover and visited colors; no hand-drawn SVG. The visually hidden span uses the standard clip pattern (position absolute, 1px box, margin -1px, overflow hidden, border 0, clip-path inset(50%), white-space nowrap; no legacy clip: rect) — the one place where 1px literals are sanctioned. `font: inherit` on the anchor. Prefer `text-underline-offset` and `text-decoration-thickness` from the tokens over border tricks so the underline behaves in wrapped text.

### Lit
`<ds-link>` hosts a shadow root with `delegatesFocus: true` and a native `<a>` inside. Do not dispatch a CustomEvent named `click`; the native click retargets to the host and consumers listen for it there. The host defaults to `display: inline` so it can sit inside a `<ds-text>` paragraph; reflect `tone` and `external` so consumers can style from outside.

### React Native
Render `Text` with `accessibilityRole="link"` and `accessibilityLabel` (label plus the external suffix when `external`). Nested inside a parent `Text` it flows inline; standalone it is its own line. `onPress(href)` is the navigation when provided; otherwise call `Linking.openURL(href)`. The one exception is `external`: after the handler runs, Link still calls `Linking.openURL(href)` unless the handler returned `false`. Standalone, the Link sets the body typography (`font.size.md`, `font.weight.regular`, `font.lineHeight.normal` via Text's helpers) since there is no cascade; nested in the system Text it inherits, which Text signals through its exported `TextStyleContext` (its `nested` field; there is no `TextNestingContext`) — inside a raw RN Text the Link is standalone. Put a single space before the external glyph, since nested Text ignores margins. Platform limits, all acknowledged: no visited state (`colorVisited` unused), no hover (`colorHover` is the pressed color), no underline offset or thickness, and no focus events on `Text`, so the focus ring is the platform's own — `focusRing*` bindings are not applied.

## Related

Button, Text, Breadcrumb.

## Behavior scenarios (6)

One test per scenario, in this order.

```yaml
- name: click-fires-on-press
  description: Activation with pointer, Enter, or assistive technology navigates to
    href; onPress fires first.
  when:
    click: anchor
  then:
  - event: onPress
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-default
  given:
    tone: default
  then:
  - renders: true
  derived: true
- name: renders-tone-inherit
  given:
    tone: inherit
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: control-is-focusable
  then:
  - focusable: true
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```
