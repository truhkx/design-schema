# Generate: Carousel for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Carousel.swift` declaring `public struct Carousel: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/CarouselBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Carousel.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Carousel") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Carousel")` on the root and `"Carousel.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Carousel
  category: container
  status: review
  apg: carousel
  anatomy:
  - region
  - viewport
  - track
  - slide
  - controlSurface
  - prevButton
  - nextButton
  - picker
  - pickerItem
  - playButton
  - liveRegion
  composition:
    prevButton: Button
    nextButton: Button
    playButton: Button
  props:
    label:
      type: string
      required: true
      description: What the carousel shows ("Featured products", "Customer stories").
      a11y: aria-label on the region; each slide is named "{n} of {total}" plus its
        own heading.
    children:
      type: content
      required: true
      description: One `CarouselSlide` per slide. A slide is any content; a Card is
        the usual shape. Slides should be equal height.
    perView:
      type: number
      default: 1
      description: How many slides are visible at once at the widest layout; fewer
        are shown as the viewport narrows (one below the prose width).
    loop:
      type: boolean
      default: false
      description: Next from the last returns to the first. Off by default so users
        can tell where the end is.
    autoplay:
      type: boolean
      default: false
      description: Rotate automatically every `interval`. Starts only when the user
        has not asked for reduced motion; stops on hover, focus, touch, or the play/pause
        button; never restarts on its own after the user pauses it.
    interval:
      type: number
      default: 6000
      description: Milliseconds between automatic advances; values below 5000 are
        raised to 5000 on every platform (with a development warning).
    picker:
      type: enum
      values:
      - dots
      - tabs
      - none
      default: dots
      description: 'How slides are chosen directly: small dot buttons, tabs with each
        slide''s label (for few, meaningful slides), or none (arrows only).'
    activeIndex:
      type: number
      description: Controlled current slide (zero-based). Omit for uncontrolled.
    snap:
      type: boolean
      default: true
      description: Swiping or scrolling snaps to slide boundaries.
  events:
    onChange:
      description: Fired when the current slide changes, with the new index and the
        reason (`next`, `prev`, `picker`, `swipe`, `autoplay`).
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
  keyboard:
  - keys:
    - Tab
    action: Moves through the controls (play/pause, previous, next, picker) and then
      into the current slide's focusable content; hidden slides are inert.
    from: any
    expect: manual
  - keys:
    - ArrowRight
    action: Next slide.
    when: focus on picker or in a tabs picker
    from: inside
    expect: manual
  - keys:
    - ArrowLeft
    action: Previous slide.
    when: focus on picker
    from: inside
    expect: manual
  - keys:
    - Home
    action: First slide.
    when: focus on picker
    from: inside
    expect: manual
  - keys:
    - End
    action: Last slide.
    when: focus on picker
    from: inside
    expect: manual
  - keys:
    - Enter
    - ' '
    action: 'Activates the focused control: previous, next, a picker item, or play/pause.'
    from: inside
    expect: manual
  styles:
    slideGap:
      token: layout.gap.normal
      locked: false
    controlOffset:
      token: space.2
      description: Distance of the arrow buttons from the viewport edge when overlaid.
      locked: false
    controlBackground:
      token: color.overlay.surface
      description: The `controlSurface` wrapper around each arrow Button (the Button
        itself is `secondary` and untouched) so they stay readable over images.
      locked: true
    controlShadow:
      token: shadow.raised
      description: On the controlSurface wrapper.
      locked: false
    pickerGap:
      token: layout.gap.tight
      locked: false
    pickerOffset:
      token: space.3
      description: Between the viewport and the picker row.
      locked: false
    dot:
      token: color.border.strong
      locked: true
    dotActive:
      token: color.control.selectedBackground
      locked: true
    dotSize:
      token: space.2
      locked: false
    dotTarget:
      token: size.target.min
      description: Each dot's hit area; the dot itself is small.
      locked: true
    radius:
      token: radius.md
      description: Applied to the viewport so slide edges match the theme.
      locked: false
    transition:
      token: motion.duration.base
      description: Dot and tab state changes; slide movement is the browser's scroll-snap
        timing (instant under reduced motion).
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    previous: Previous slide
    next: Next slide
    play: Start automatic rotation
    pause: Stop automatic rotation
    slideLabel: '{n} of {total}'
    goTo: Go to slide {n}
    announce: Slide {n} of {total}
  a11y:
    role: region
    requires:
    - accessible-name
    - keyboard-operable
    - arrow-navigation
    - focus-visible
    - contrast-aa
    - target-24px
    - reduced-motion
    - live-region
    - gesture-alternative
    - no-hover-only
    - selected-state
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
    - foreground: color.border.strong
      background: color.background
      level: AA
      large: true
  platforms:
    web:
      element: section
      attributes:
      - role=region
      - aria-roledescription=carousel
      - aria-label
      - aria-live
      - aria-roledescription=slide
      - aria-hidden
      - inert
      notes: 'A <section aria-roledescription="carousel" aria-label>; the viewport
        is a scroll-snap container (overflow-x auto, scroll-snap-type x mandatory,
        scrollbar hidden) so swipe and trackpad work natively; the arrows scroll by
        one slide with scrollIntoView (behavior from reduced motion). Each slide is
        <div role="group" aria-roledescription="slide" aria-label="{n} of {total}">;
        off-screen slides get `inert` so their links are not tab stops. The track
        has aria-live="polite" while autoplay is paused and "off" while rotating (the
        APG rule: do not announce automatic changes). Picker `dots`: buttons with
        aria-label from copy.goTo and aria-current on the active; `tabs`: a Tabs-style
        tablist controlling the slides as tabpanels. Autoplay uses a timer cleared
        on pointerenter/focusin/touchstart and by the pause button; the pause button
        appears first in tab order whenever autoplay is on.'
    lit:
      tag: ds-carousel
      reflect:
      - per-view
      - loop
      - autoplay
      - picker
      - snap
      - active-index
      notes: Slotted <ds-carousel-slide> children; scroll-snap viewport in the shadow
        root with the slot inside a track; IntersectionObserver on slotted slides
        determines the active index and sets `inert` on the others. Composed `change`.
    rn:
      element: FlatList
      props:
      - horizontal
      - pagingEnabled
      - snapToInterval
      - decelerationRate=fast
      - accessibilityRole=adjustable
      - accessibilityActions
      notes: A horizontal FlatList with pagingEnabled (perView 1) or snapToInterval
        (more) and onViewableItemsChanged for the index. The region View has accessibilityRole="adjustable"
        with increment/decrement accessibility actions mapped to next/previous (VoiceOver
        swipe up/down), so the swipe gesture has an alternative. Slides not visible
        have accessibilityElementsHidden. Autoplay uses setInterval cleared on any
        touch and never started under reduced motion. Announcements via AccessibilityInfo.announceForAccessibility
        when the change came from the user.
    swiftui:
      element: ScrollView
      props:
      - ScrollView
      - LazyHStack
      - .scrollTargetBehavior=paging
      - .scrollTargetLayout
      - .scrollPosition
      - .accessibilityElement=contain
      - .accessibilityAdjustableAction
      - Button
      - TimelineView
      - .accessibilityAddTraits=updatesFrequently
      notes: 'A horizontal `ScrollView` with `LazyHStack` and `.scrollTargetBehavior(.paging)`
        (`.viewAligned` when `perView` > 1) and `.scrollPosition` bound to the active
        index; slides are `.accessibilityElement(children: .contain)` labelled `copy.slideLabel`
        + heading, off-screen slides `.accessibilityHidden`. The region is one element
        with `.accessibilityAdjustableAction` mapped to next/previous (VoiceOver swipe
        up/down), which is the swipe alternative, plus the visible prev/next `Button`s
        and the picker (dots or tabs) as documented. Autoplay is a `TimelineView`
        timer stopped on any touch, VoiceOver focus or the pause `Button`, never started
        under reduced motion; user-initiated changes are announced.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `slideGap`, `controlOffset`, `controlShadow`, `pickerGap`, `pickerOffset`, `dotSize`, `radius`, `transition`
Locked (accessibility-bearing, never overridable): `controlBackground`, `dot`, `dotActive`, `dotTarget`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: ScrollView
props:
- ScrollView
- LazyHStack
- .scrollTargetBehavior=paging
- .scrollTargetLayout
- .scrollPosition
- .accessibilityElement=contain
- .accessibilityAdjustableAction
- Button
- TimelineView
- .accessibilityAddTraits=updatesFrequently
notes: 'A horizontal `ScrollView` with `LazyHStack` and `.scrollTargetBehavior(.paging)`
  (`.viewAligned` when `perView` > 1) and `.scrollPosition` bound to the active index;
  slides are `.accessibilityElement(children: .contain)` labelled `copy.slideLabel`
  + heading, off-screen slides `.accessibilityHidden`. The region is one element with
  `.accessibilityAdjustableAction` mapped to next/previous (VoiceOver swipe up/down),
  which is the swipe alternative, plus the visible prev/next `Button`s and the picker
  (dots or tabs) as documented. Autoplay is a `TimelineView` timer stopped on any
  touch, VoiceOver focus or the pause `Button`, never started under reduced motion;
  user-initiated changes are announced.'
```

## Guidance

## Overview

A carousel shows several things in the space of one and lets the user page through them. It earns its place only when every slide is worth seeing and the controls make it obvious there is more; an auto-rotating banner that nobody clicks is the failure mode this component is designed to avoid.

## When to use

Use a Carousel for a small set (three to eight) of peer items too rich to show as a grid — featured products with images, testimonials, a gallery — where paging is a reasonable way to see them all. Use `picker: tabs` when slides have meaningful names ("Plans", "Pricing"); `dots` for images. Leave `autoplay` off unless the content is ambient (a hero of photographs) and even then keep the pause control visible.

## When not to use

Do not use a Carousel to hide important content behind slide two; if users must see it, lay it out. Do not use it for a list that can grow past ten items (a scrolling row of Cards with no controls, or a grid) or for step-by-step content (Stepper). Do not autoplay anything with text people need to read.

## Behavior

Previous and Next move one slide (or one page of `perView`), disabled at the ends unless `loop`. The picker jumps directly. Swipe on touch and horizontal scroll on trackpads work through scroll-snap, and the active index follows what is visible. `autoplay` advances every `interval`, pauses on hover, focus or touch, and stops for good when the user presses pause; it never starts under reduced motion. `onChange` reports each change with its reason so analytics can distinguish user paging from rotation. Hidden slides are inert: their links and buttons are not in the tab order and not announced. Previous and Next move by one page — `perView` slides. Hover, focus and touch pause rotation only while they last; the pause button stops it until play is pressed. Without `loop`, autoplay stops at the last slide. `CarouselSlide` takes a `label` (its name in the picker and the announcement) on every platform. Picker items are Carousel's own buttons, not the Button component. Below `layout.maxWidth.prose` `perView` collapses to one. Under reduced motion the play/pause control is not rendered, since rotation can never start.

## Content guidelines

Slides are parallel: same shape, same heading level, same amount of text. Each slide has a heading so its name is meaningful in the picker and the announcement. Keep an obvious hint that there is more (the next slide peeking, the arrows, the dots) — a carousel that looks like a single image gets treated as one.

## Accessibility

The container is a `region` named for its content with `aria-roledescription="carousel"`, and each slide a `group` with `aria-roledescription="slide"` and a positional name (WCAG 1.3.1, 4.1.2; APG carousel). Controls come before the slides in tab order and include play/pause whenever rotation is possible (2.2.2). Rotation stops on hover and focus and under reduced motion (2.3.3), and changes made by the user are announced while automatic ones are not (4.1.3). Swiping has the arrow buttons and, on native, the adjustable actions as alternatives (2.5.1). The picker conveys the current slide by state, not color alone, and dots have 24px targets despite their size.

## Platform notes

### Web
Render `<section role="region" aria-roledescription="carousel" aria-label data-ds="Carousel">` with, in order: the play/pause `Button` (when `autoplay`), the previous and next `Button`s (`secondary`, `iconOnly`, chevron Icons, on `controlBackground` when overlaid), the viewport `<div>` (`overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none`) containing the track and `CarouselSlide`s (`role="group" aria-roledescription="slide" aria-label`, `scroll-snap-align: start`, `inert` when not visible), and the picker (`dots`: `<div role="group">` of `Button ghost iconOnly` with `aria-current`; `tabs`: `role="tablist"` of `role="tab"` buttons with `aria-selected` and `aria-controls` to the slides, arrow keys per Tabs). An `IntersectionObserver` at threshold 0.6 sets the active index. `scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', inline: 'start' })` for programmatic moves. A visually-hidden `aria-live="polite"` region receives `copy.announce` on user-initiated changes.

### Lit
`<ds-carousel label="Featured" picker="tabs"><ds-carousel-slide heading="…">…</ds-carousel-slide></ds-carousel>`; scroll-snap viewport with the slot inside; IntersectionObserver on assigned elements; composed `change`.

### React Native
`FlatList` horizontal with `pagingEnabled`/`snapToInterval`, `showsHorizontalScrollIndicator={false}`, `onViewableItemsChanged` with `viewabilityConfig { itemVisiblePercentThreshold: 60 }`; slides as `View accessible accessibilityLabel={copy.slideLabel + heading}`; the arrows and picker as system `Button`s; region `View accessibilityRole="adjustable"` with increment/decrement `accessibilityActions`. Autoplay: `setInterval` guarded by `useReducedMotion()`, cleared in `onTouchStart`.

## Related

Tabs, Card, Stepper, Button.

## Behavior scenarios (5)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-picker-dots
  given:
    picker: dots
  then:
  - renders: true
  derived: true
- name: renders-picker-tabs
  given:
    picker: tabs
  then:
  - renders: true
  derived: true
- name: renders-picker-none
  given:
    picker: none
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
