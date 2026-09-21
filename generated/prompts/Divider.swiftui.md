# Generate: Divider for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Divider.swift` declaring `public struct Divider: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/DividerBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Divider.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Divider") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Divider")` on the root and `"Divider.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Divider
  category: layout
  status: review
  anatomy:
  - line
  - label
  composition:
    label:
      component: Text
      props:
        size: sm
        tone: muted
        element: span
      forwards:
        labelSize: fontSize
        fontFamily: fontFamily
  props:
    orientation:
      type: enum
      values:
      - horizontal
      - vertical
      default: horizontal
      description: 'Vertical dividers sit between inline siblings (toolbar groups)
        and stretch to the row height: inline-block with `block-size: auto; align-self:
        stretch; min-block-size: 100%` (flex stretch applies only to an auto cross
        size, and the min fills a parent with a set height). They need a flex or grid
        row (a horizontal Stack with align stretch) or a parent with a definite height;
        in plain block flow a vertical divider has no height and draws nothing.'
    label:
      type: string
      description: 'Optional text in the middle of a horizontal divider ("or", "Earlier
        today"). Turns the divider from decorative into a labelled separator (`semantic`
        is implied). Ignored on a vertical divider, with a development warning: a
        vertical line has no room for centered text. An ignored label implies nothing
        either — a vertical divider is semantic only when `semantic` says so. An empty
        string is no label: the divider stays decorative and nothing warns. On Lit
        `label` is a property that also reads the `label` attribute and does not reflect.
        The development warning fires when the ignored combination appears or changes
        (an effect keyed on `label` and `orientation`), not on every render; on React
        Native a vertical divider with an ignored label and `semantic: true` gets
        both warnings. Those warnings are development diagnostics, not `copy.*` strings:
        their wording is not contractual and may differ between platforms. A vertical
        divider with an ignored label and `semantic: true` is a separator with no
        accessible name on every platform — naming it from text that is not rendered
        would contradict the label being ignored. When in effect, the label is the
        separator''s accessible name (see the platform notes), and the two line pieces
        on either side are hidden from assistive technology.'
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
      description: 'Space on both sides along the cross axis (above and below a horizontal
        divider, left and right of a vertical one), from the layout rhythm, for dividers
        used outside a Stack that already spaces them. The space is transparent: web
        and Lit use margin-block (horizontal) or margin-inline (vertical); React Native
        pads the root View on that axis (paddingVertical or paddingHorizontal) with
        the line as an inner View. It applies to a labelled divider too, where the
        root is the row: the space is around the whole divider, label included, not
        around each line piece.'
  styles:
    color:
      token: color.border
      locked: false
    thickness:
      token: border.width.thin
      locked: false
    spacing:
      token: layout.gap.{spacing}
      description: '`spacing: none` is the off state: it renders no space and sets
        no hook (not a `layout.gap.none` value, and an `overrides.spacing` is not
        written to the hook either), so an override of this binding does nothing until
        a spacing value is chosen — overrides change values, never presence.'
      locked: false
    labelColor:
      token: color.foreground.muted
      part: label
      description: 'Locked, and deliberately not enforced by Divider: the colour arrives
        from the composed Text''s `tone: muted`, which resolves to this same token,
        and writing a colour rule here would restyle a composed child. The contrast
        pair is therefore a claim about Text''s muted tone on the page background,
        which no Divider code can regress.'
      locked: true
    labelSize:
      token: font.size.sm
      part: label
      description: 'Passed to the composed Text as its `fontSize` override, along
        with `fontFamily`; Divider does not style the Text itself. The label color
        and default size come from the Text props `size="sm" tone="muted"`, so Divider
        writes no label color or size rule of its own. Neither labelSize nor fontFamily
        has a --ds-divider-* hook on web or Lit: only the bindings the author overrode
        are passed on, into Text''s `overrides`, and page CSS reaches the label through
        Text''s own hooks.'
      locked: false
    labelGap:
      token: layout.gap.normal
      part: label
      description: 'Gap between the label and the lines on each side: the gap of the
        labelled root row (flex `gap` on web and Lit, the `gap` style on React Native),
        not a composed Stack. With no label in effect there is no row, and an override
        of it does nothing.'
      locked: false
    fontFamily:
      token: font.family.body
      part: label
      description: Reaches only the composed label Text, through its `fontFamily`
        override; the line has no text, so the root sets no font hook.
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
        separator role, so hiding it is deliberate); every semantic divider, labelled
        or not, is <div role="separator" aria-orientation>, so the semantic and labelled
        cases share one element. With a label the div is a flex row of two aria-hidden
        line spans (data-part="line") around the composed Text (data-part="label"),
        and the separator takes its accessible name from the label through aria-labelledby
        pointing at the Text id (from useId) — separator children are presentational,
        so containment alone does not name it. Beyond the composition props, the label
        Text also receives the platform attributes `id` and `data-part="label"`. The
        labelled row uses align-items center, so the lines sit at the label''s vertical
        center. Unlabelled, the root paints itself and is the `line` part; it carries
        no data-part. The line is a background-color box of the thickness, not a border,
        and the paint rule is scoped to the unlabelled case rather than being cancelled
        on the labelled root, so no "no background" keyword is needed. The root also
        sets `flex-shrink: 0`, so a horizontal divider inside a vertical flex Stack
        keeps its one-token thickness; a horizontal divider is block-level and fills
        its container''s inline size. Vertical: display inline-block, inline-size
        thin, block-size auto, min-block-size 100%, align-self stretch. The ref is
        `Ref<HTMLElement>`, since the root is an hr or a div, and `...rest` lands
        on whichever root renders; the props base is the div''s, minus the ones the
        component owns (children, role, aria-orientation, aria-hidden, className,
        style), which accepts a few div-only attributes on the hr branch — the price
        of one props type for two roots.'
    lit:
      tag: ds-divider
      reflect:
      - orientation
      - semantic
      - spacing
      notes: 'Unlike web, Lit always renders the `line` span in the shadow root, in
        every orientation and whether or not there is a label, so the part has an
        element to name and the shadow root is never empty; the host carries thickness,
        orientation and spacing around it. The host is a flex container (`:host {
        display: flex }`, `:host([orientation="vertical"]) { display: inline-flex
        }`) with the line at `flex: 1 1 auto` — a line sized `block-size: 100%` collapses
        inside a host whose own block-size is auto, which is exactly the stretched
        vertical case — and `flex-shrink: 0` on the host itself. An unlabelled line
        span is aria-hidden in both orientations, like the labelled pieces. When a
        label is in effect the host switches to a row through an internal `data-labelled`
        host attribute and the shadow root renders line segment, label Text, line
        segment, the segments aria-hidden. role, aria-orientation and aria-hidden
        are plain host attributes, not ElementInternals, because tests read them (dom-accessibility-api
        ignores internals). A labelled host also sets aria-label to the label text:
        ids do not cross the shadow root, and separator children are presentational.
        `label` is a property. Shadow elements carry `part` as well as `data-part`,
        both the anatomy names: names tests read, not a styling surface.'
    rn:
      element: View
      props:
      - accessibilityElementsHidden
      - importantForAccessibility
      notes: 'A View with height (or width) = border.width.thin and backgroundColor
        color.border, inside a root View that carries `spacing` as padding. Decorative:
        accessibilityElementsHidden + importantForAccessibility="no-hide-descendants"
        on the root, since it wraps the inner line View. No accessibilityRole is set:
        there is none for a separator. Labelled: the root is a row (flexDirection
        row, alignItems center, `gap` from labelGap) of two line Views, each hidden
        (accessibilityElementsHidden + importantForAccessibility="no"), around the
        label Text, which stays readable. Semantic: there is no separator role on
        native; render the label (if any) as Text so it is read, otherwise the divider
        stays hidden — announcing "separator" has no native idiom. `semantic: true`
        with no label therefore has no observable effect here, and warns in development
        so the author knows the boundary is silent on this platform; that warning
        is keyed on `semantic` and whether a label is in effect, so it also fires
        for a semantic vertical divider whose label is ignored. The composition''s
        `element: span` is not passed (native Text has no `element`). The label Text
        sits in a plain View carrying `testID="Divider.label"`, since Text takes no
        testID. `spacing` pads the root on the cross axis whether or not it is the
        labelled row, each labelled line piece takes `flex: 1`, and the root and its
        inner line both use `alignSelf: stretch` in either orientation — a horizontal
        divider in a parent that does not stretch its children would otherwise collapse
        to zero width. Both line pieces of a labelled divider carry the same `testID="Divider.line"`,
        so a test for the labelled variant asks for all of them rather than one. The
        label wrapper View is unflexed: it sizes to its text and the two lines take
        the remainder, so a label too long for the row overflows rather than wrapping.'
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
  behavior:
  - name: decorative-divider-is-hidden-from-assistive-technology
    description: Decorative dividers are hidden so lists do not announce "separator"
      between every row.
    then:
    - attribute: aria-hidden
      is: 'true'
      platforms:
      - web
      - lit
    - attribute: accessibilityElementsHidden
      is: true
      platforms:
      - rn
  - name: semantic-divider-is-a-separator
    description: 'true means the divider marks a real boundary: role=separator with
      aria-orientation. React Native has no separator role, so there is nothing to
      assert there.'
    given:
      semantic: true
    then:
    - role: separator
      platforms:
      - web
      - lit
    - attribute: aria-orientation
      is: horizontal
      platforms:
      - web
      - lit
  - name: label-is-read-and-makes-the-divider-semantic
    description: A label turns the divider from decorative into a labelled separator,
      and the text is what gets read. On React Native only the rendered text is observable
      (no separator role), so the test there checks the text alone.
    given:
      label: or
    then:
    - text: or
    - role: separator
      platforms:
      - web
      - lit
    - name: or
      platforms:
      - web
      - lit
  examples:
  - name: or-between-alternatives
    description: A labelled divider between two ways of signing in.
    given:
      label: or
      spacing: normal
  - name: list-furniture
    description: The default line between rows of a dense list - decorative, and silent
      to assistive technology.
    given:
      orientation: horizontal
  - name: toolbar-groups
    description: 'A vertical line between groups of toolbar controls, stretching to
      the row height; shown inside a horizontal Stack with align stretch and gap tight,
      between one Text reading "Bold Italic" and one reading "Align left" — two Texts,
      one on each side — so the row has a height to fill. The `orientation: vertical`
      enum story uses the same wrapper.'
    given:
      orientation: vertical
  - name: section-boundary
    description: An unlabelled line that still marks a real boundary a screen-reader
      user should hear on web, Lit and SwiftUI; on React Native it is silent by design
      and warns (see the rn notes).
    given:
      semantic: true
      spacing: loose
```

## Parts and slots

- `line`: element
- `label`: component `Text`; props `size` = "sm", `tone` = "muted", `element` = "span"; forwards `labelSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`

## Style bindings

- `labelColor`: token `color.foreground.muted`; part `label`; locked
- `labelSize`: token `font.size.sm`; part `label`
- `labelGap`: token `layout.gap.normal`; part `label`
- `fontFamily`: token `font.family.body`; part `label`

## Constants and examples

- example `or-between-alternatives`, story `OrBetweenAlternatives`: given `label: "or"`, `spacing: "normal"`; A labelled divider between two ways of signing in.
- example `list-furniture`, story `ListFurniture`: given `orientation: "horizontal"`; The default line between rows of a dense list - decorative, and silent to assistive technology.
- example `toolbar-groups`, story `ToolbarGroups`: given `orientation: "vertical"`; A vertical line between groups of toolbar controls, stretching to the row height; shown inside a horizontal Stack with align stretch and gap tight, between one Text reading "Bold Italic" and one reading "Align left" — two Texts, one on each side — so the row has a height to fill. The `orientation: vertical` enum story uses the same wrapper.
- example `section-boundary`, story `SectionBoundary`: given `semantic: true`, `spacing: "loose"`; An unlabelled line that still marks a real boundary a screen-reader user should hear on web, Lit and SwiftUI; on React Native it is silent by design and warns (see the rn notes).

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `color`, `thickness`, `spacing`, `labelSize`, `labelGap`, `fontFamily`
Locked (accessibility-bearing, never overridable): `labelColor`

## Platform notes (swiftui)

```yaml
element: Rectangle
props:
- Rectangle
- .frame=height-1
- .accessibilityHidden
- .accessibilityElement
- .accessibilityLabel
notes: "A `Rectangle` of the color token, `border.width.thin` thick along the cross\
  \ axis (`.frame(height:)` horizontal, `.frame(width:)` vertical), `.accessibilityHidden(true)`\
  \ when decorative. With `label` the divider is an `HStack` of line\u2013`Text`\u2013\
  line and is an accessibility element with that label (VoiceOver reads it as a section\
  \ break); the label Text takes `fontSize` through `overrides`. Not SwiftUI's `Divider`\
  \ (fixed color)."
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

Decorative dividers are hidden from assistive technology so lists do not announce "separator" between every row (WCAG 1.3.1 — structure is conveyed by the list, not the line). Semantic dividers expose role `separator` with `aria-orientation`, and labelled ones take the label as their accessible name (separator children are presentational, so the name is set explicitly: `aria-labelledby` on web, `aria-label` on Lit) with the flanking line pieces hidden. The line is below the 3:1 non-text threshold on purpose — it is not required to identify anything (1.4.11 exemption), and the label, when present, meets 4.5:1.

## Platform notes

### Web
Decorative: `<hr aria-hidden="true" class="ds-divider">`. Semantic: `<div role="separator" aria-orientation={orientation}>` with, for a label, two aria-hidden flex-grow line spans around a `Text size="sm" tone="muted"` that names the separator through `aria-labelledby`. Vertical uses `inline-size: var(--border-width-thin); block-size: auto; min-block-size: 100%; align-self: stretch`.

### Lit
`<ds-divider>`; `<ds-divider semantic label="or">`. Host carries the styles and, when semantic, plain `role="separator"` and `aria-orientation` attributes (plus `aria-label` with a label); decorative hosts get `aria-hidden="true"`. The label renders in the shadow root.

### React Native
`View` with `height: t.borderWidthThin, backgroundColor: t.colorBorder` (or width for vertical, `alignSelf: 'stretch'`). Decorative: hidden from AT. Labelled: a row of two hidden lines with a `Text size="sm" tone="muted"` between; the text is what gets read.

## Related

Stack, Menu, List (planned), Heading.

## Behavior scenarios (8)

One test per scenario, in this order.

```yaml
- name: label-is-read-and-makes-the-divider-semantic
  description: A label turns the divider from decorative into a labelled separator,
    and the text is what gets read. On React Native only the rendered text is observable
    (no separator role), so the test there checks the text alone.
  given:
    label: or
  then:
  - text: or
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
