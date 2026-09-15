# Generate: Text for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Text.swift` declaring `public struct Text: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/TextBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Text.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Text") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Controlled/uncontrolled pairs (`value`/`defaultValue`, `open`/`defaultOpen`) become a `Binding<T>?` parameter plus a `default` initial value, with `@State` holding the uncontrolled value.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("Text")` on the root and `"Text.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

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

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`
Locked (accessibility-bearing, never overridable): `color`

## Platform notes (swiftui)

```yaml
element: Text
props:
- .font
- .fontWeight
- .lineSpacing
- .foregroundStyle
- .lineLimit
- .truncationMode
- .accessibilityAddTraits=isStaticText
notes: "SwiftUI `Text` with `.font(.system(size: scaled))` where the size token passes\
  \ through `@ScaledMetric(relativeTo:)` so Dynamic Type scales it, `.fontWeight`\
  \ from the weight token, `.lineSpacing(fontSize \xD7 (lineHeight \u2212 1))`, `.foregroundStyle`\
  \ from the tone. `element` has no meaning (no DOM); `truncate` is `.lineLimit(1)`\
  \ + `.truncationMode(.tail)` and the full text becomes the accessibility label.\
  \ Nested Text: the package's `Text` inside another `Text` renders as a concatenated\
  \ `SwiftUI.Text` so inline runs share a line; a `TextNesting` environment flag tells\
  \ a child it is inline."
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

## Behavior scenarios (18)

One test per scenario, in this order.

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
