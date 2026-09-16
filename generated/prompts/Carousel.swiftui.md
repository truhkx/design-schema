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
    prevButton:
      component: Button
      props:
        variant: secondary
        iconOnly: true
    nextButton:
      component: Button
      props:
        variant: secondary
        iconOnly: true
    playButton:
      component: Button
      props:
        variant: secondary
  props:
    label:
      type: string
      required: true
      description: What the carousel shows ("Featured products", "Customer stories").
      a11y: aria-label on the region; each slide is named `copy.slideLabel` ("2 of
        4") alone — its heading is read as content, never joined into the name.
    children:
      type: content
      required: true
      description: One `CarouselSlide` per slide. A slide is any content; a Card is
        the usual shape. Slides should be equal height.
    perView:
      type: integer
      default: 1
      description: How many slides are visible at once at the widest layout. The page
        size is `perView` while the viewport's own width is above `layout.maxWidth.prose`
        and 1 at or below it, measured on the viewport (ResizeObserver on web and
        Lit, onLayout on React Native); `perView` applies until the first measurement.
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
        raised to 5000 in every build on every platform, with a development warning
        once per instance and only while `autoplay` is on.
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
      type: integer
      description: Controlled current slide (zero-based). Omit for uncontrolled.
    snap:
      type: boolean
      default: true
      description: Swiping or scrolling snaps to slide boundaries.
  events:
    onChange:
      description: 'Fired when the current slide changes, with the new index and the
        reason (`next`, `prev`, `picker`, `swipe`, `autoplay`). The programmatic cases
        are autoplay and a swipe settling; a change of a controlled `activeIndex`
        never fires it. A scroll counts as `swipe` only when the user started it (web
        and Lit: after pointerdown, touchstart or wheel on the viewport; React Native:
        between onScrollBeginDrag and onMomentumScrollEnd) — a scroll started by an
        arrow, the picker or autoplay reports its own reason once.'
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: index
        type: number
        description: The index of the new current slide.
      - name: reason
        type: enum
        values:
        - next
        - prev
        - picker
        - swipe
        - autoplay
      reasons:
        next: the next control was activated
        prev: the previous control was activated
        picker: a picker dot or tab was chosen
        swipe: the track was swiped
        autoplay: autoplay advanced the carousel
      fires:
      - user
      - programmatic
  keyboard:
  - keys:
    - Tab
    action: Moves through the controls (play/pause, previous, next, picker) and then
      into the current slide's focusable content; hidden slides are inert.
    from: any
    expect: manual
  - keys:
    - ArrowRight
    action: 'Next slide (one slide, not one page): focus and selection move together
      with reason `picker`, wrapping at the ends as Tabs does whatever `loop` says.
      Dots and tabs both use a roving tabindex, so the picker is one tab stop.'
    when: focus on picker or in a tabs picker
    from: inside
    expect: manual
  - keys:
    - ArrowLeft
    action: Previous slide, wrapping the same way.
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
    native: true
  styles:
    slideGap:
      token: layout.gap.normal
      part: slide
      description: Applied as the track's gap, never a slide margin (on Lit the slides
        are slotted, so only the track can carry it).
      locked: false
    controlOffset:
      token: space.2
      description: 'Distance of the arrow buttons from the viewport edge when overlaid:
        the inline inset of each controlSurface from the viewport''s inline edge.'
      locked: false
    controlRadius:
      token: radius.full
      description: The controlSurface wrapper's corner radius.
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
      part: picker
      locked: false
    pickerOffset:
      token: space.3
      part: picker
      description: Between the viewport and the picker row below it, and between the
        play/pause row above it and the viewport; a gap between rows, not a margin.
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
    tabColor:
      token: color.foreground.muted
      part: pickerItem
      description: Text of an unselected tab in a `tabs` picker.
      locked: true
    tabSelectedColor:
      token: color.foreground.strong
      part: pickerItem
      locked: true
    tabFontSize:
      token: font.size.sm
      part: pickerItem
      locked: false
    tabFontWeight:
      token: font.weight.medium
      part: pickerItem
      description: The same weight selected or not, so selection never shifts the
        row.
      locked: false
    tabPaddingBlock:
      token: space.sm
      part: pickerItem
      locked: false
    tabPaddingInline:
      token: space.md
      part: pickerItem
      locked: false
    tabIndicatorThickness:
      token: border.width.focus
      part: pickerItem
      description: The selected tab's underline, drawn in `dotActive` inside the tab's
        box (an inset, so it takes no layout).
      locked: true
    fontFamily:
      token: font.family.body
      part: pickerItem
      locked: false
    transition:
      token: motion.duration.base
      description: Dot background and tab text colour changes, with motion.easing.standard
        (weights never change, so nothing else animates); slide movement is the browser's
        scroll-snap timing (instant under reduced motion).
      locked: false
    minTarget:
      token: size.target.comfortable
      description: The hit area of each arrow's controlSurface and the minimum block
        size of each tab; dots use `dotTarget`.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  constants:
    minInterval:
      description: The floor `interval` is raised to, so autoplay never advances faster
        than a slide can be read.
      value: 5000
      unit: ms
  copy:
    previous: Previous slide
    next: Next slide
    play: Start automatic rotation
    pause: Stop automatic rotation
    slideLabel:
      text: '{n} of {total}'
      params:
        n:
          type: number
          description: The slide's position.
        total:
          type: number
          description: How many slides the carousel has.
    pickerLabel: Choose a slide
    goTo:
      text: Go to slide {n}
      params:
        n:
          type: number
          description: The slide's position.
    announce:
      text: Slide {n} of {total}
      params:
        n:
          type: number
          description: The slide's position.
        total:
          type: number
          description: How many slides the carousel has.
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
      nonText: true
    - foreground: color.border.strong
      background: color.background
      level: AA
      nonText: true
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.strong
      background: color.background
      level: AA
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
        scrollbar hidden) so swipe and trackpad work natively; moves scroll the viewport
        itself with scrollTo/scrollBy (RTL-aware), never scrollIntoView, which would
        also scroll the page — behavior `instant` under reduced motion and for the
        first positioning, `smooth` otherwise. Each slide is <div role="group" aria-roledescription="slide"
        aria-label="{n} of {total}"> (role="tabpanel" with the same roledescription
        when picker is `tabs`); slides outside the visible page get both `inert` and
        aria-hidden="true". Only the visually hidden liveRegion part carries aria-live:
        "off" while rotating, "polite" otherwise (the APG rule: do not announce automatic
        changes); the track has none, since a live track would read out slide content.
        Picker `dots`: buttons with aria-label from copy.goTo and aria-current="true"
        on every slide of the current page; `tabs`: a Tabs-style tablist controlling
        the slides as tabpanels, aria-selected on the current slide''s tab only; either
        picker is named by copy.pickerLabel. Hover, focus and touch pause autoplay
        only while they last (pointerenter from touch is not hover; touch ends on
        touchend/touchcancel); the pause button stops it; pressing play clears those
        pauses, so rotation resumes at once.'
    lit:
      tag: ds-carousel
      reflect:
      - per-view
      - loop
      - autoplay
      - picker
      - prop: snap
        attribute: no-snap
      - active-index
      notes: Slotted <ds-carousel-slide> children; scroll-snap viewport in the shadow
        root with the slot inside a track; IntersectionObserver on slotted slides
        determines the active index and sets `inert` on the others; each slotted slide
        gets data-part="slide". The picker is placed below the viewport by a CSS grid
        while coming before it in shadow DOM order. `<ds-carousel-slide>` takes a
        plain `label` attribute. Composed `change`.
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
        (more) and onViewableItemsChanged for the index (honoured only during a user
        drag). Each visible slide View is the accessible element with accessibilityRole="adjustable"
        and increment/decrement accessibility actions mapped to next/previous, labelled
        copy.next and copy.previous (VoiceOver swipe up/down), so the swipe gesture
        has an alternative that VoiceOver can reach — a non-accessible region View
        would not be an element on iOS. Slides not visible have accessibilityElementsHidden.
        Autoplay uses setInterval, never started under reduced motion, paused while
        a touch lasts (onTouchStart until onTouchEnd/onTouchCancel) and while an arrow,
        the play button or a picker item has focus (Button forwards onFocus/onBlur);
        only the pause button, or reaching the end without loop, stops it. The liveRegion
        View has accessibilityLiveRegion "none" while rotating and "polite" otherwise,
        and user-initiated changes also call AccessibilityInfo.announceForAccessibility
        on iOS.
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
        index; slides are `.accessibilityElement(children: .contain)` labelled `copy.slideLabel`,
        off-screen slides `.accessibilityHidden`. The region is one element with `.accessibilityAdjustableAction`
        mapped to next/previous (VoiceOver swipe up/down), which is the swipe alternative,
        plus the visible prev/next `Button`s and the picker (dots or tabs) as documented.
        Autoplay is a `TimelineView` timer stopped on any touch, VoiceOver focus or
        the pause `Button`, never started under reduced motion; user-initiated changes
        are announced.'
  behavior:
  - name: next-advances-a-slide
    description: Previous and Next move one page of perView slides, and onChange reports
      the change with its reason.
    when:
      click: nextButton
    then:
    - event: onChange
  - name: previous-at-the-first-slide-does-nothing
    description: The arrows are disabled at the ends unless loop, so users can tell
      where the end is.
    when:
      click: prevButton
    then:
    - event: onChange
      fired: false
  - name: loop-wraps-backwards-from-the-first-slide
    description: With loop, Next from the last returns to the first, and Previous
      from the first to the last.
    given:
      loop: true
    when:
      click: prevButton
    then:
    - event: onChange
  - name: the-picker-jumps-straight-to-a-slide
    given:
      activeIndex: 1
      picker: dots
    when:
      click: pickerItem
    then:
    - event: onChange
  - name: the-region-is-announced-as-a-carousel
    description: A region named for its content, with aria-roledescription so it is
      announced as a carousel rather than a plain region.
    then:
    - attribute: aria-roledescription
      is: carousel
    platforms:
    - web
  examples:
  - name: featured-products
    description: The default carousel of image slides chosen with dots.
    given:
      label: Featured products
      children: Four CarouselSlide children labelled Product 1 to Product 4, each
        a Card whose heading repeats the label
  - name: named-slides-with-tabs
    description: A few meaningful slides whose names are worth showing, so the picker
      is tabs.
    given:
      label: Plans
      picker: tabs
      children: Three CarouselSlide children labelled Starter, Team and Enterprise,
        each a Card whose heading repeats the label
  - name: ambient-hero
    description: An ambient hero of photographs that rotates slowly and wraps, with
      the pause control always visible.
    given:
      label: Customer stories
      autoplay: true
      interval: 8000
      loop: true
      children: Three CarouselSlide children labelled Story 1 to Story 3, each a Card
        whose heading repeats the label, standing in for a photograph (the package
        has no image component)
  - name: three-up-gallery
    description: Three slides at a time, paged by the arrows alone.
    given:
      label: Gallery
      perView: 3
      picker: none
      children: Six CarouselSlide children labelled Image 1 to Image 6, each a Card
        whose heading repeats the label, standing in for an image (the package has
        no image component)
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `index: number`, `reason: 'next' | 'prev' | 'picker' | 'swipe' | 'autoplay'`
  - reasons: `next` (the next control was activated); `prev` (the previous control was activated); `picker` (a picker dot or tab was chosen); `swipe` (the track was swiped); `autoplay` (autoplay advanced the carousel)
  - fires on: user, programmatic

## Parts and slots

- `region`: element
- `viewport`: element
- `track`: element
- `slide`: element
- `controlSurface`: element
- `prevButton`: component `Button`; props `variant` = "secondary", `iconOnly` = true
- `nextButton`: component `Button`; props `variant` = "secondary", `iconOnly` = true
- `picker`: element
- `pickerItem`: element
- `playButton`: component `Button`; props `variant` = "secondary"
- `liveRegion`: element

## Style bindings

- `slideGap`: token `layout.gap.normal`; part `slide`
- `pickerGap`: token `layout.gap.tight`; part `picker`
- `pickerOffset`: token `space.3`; part `picker`
- `tabColor`: token `color.foreground.muted`; part `pickerItem`; locked
- `tabSelectedColor`: token `color.foreground.strong`; part `pickerItem`; locked
- `tabFontSize`: token `font.size.sm`; part `pickerItem`
- `tabFontWeight`: token `font.weight.medium`; part `pickerItem`
- `tabPaddingBlock`: token `space.sm`; part `pickerItem`
- `tabPaddingInline`: token `space.md`; part `pickerItem`
- `tabIndicatorThickness`: token `border.width.focus`; part `pickerItem`; locked
- `fontFamily`: token `font.family.body`; part `pickerItem`

## Keyboard

- `Enter`, ` ` (Activates the focused control: previous, next, a picker item, or play/pause.): expect manual; native: the rendered element already does this

## Copy

- `previous`: "Previous slide"
- `next`: "Next slide"
- `play`: "Start automatic rotation"
- `pause`: "Stop automatic rotation"
- `slideLabel`: "{n} of {total}"; params `n` (number), `total` (number)
- `pickerLabel`: "Choose a slide"
- `goTo`: "Go to slide {n}"; params `n` (number)
- `announce`: "Slide {n} of {total}"; params `n` (number), `total` (number)

## Constants and examples

- constant `minInterval`: 5000 ms
- example `featured-products`, story `FeaturedProducts`: given `label: "Featured products"`, `children: "Four CarouselSlide children labelled Product 1 to Product 4, each a Card whose heading repeats the label"`; The default carousel of image slides chosen with dots.
- example `named-slides-with-tabs`, story `NamedSlidesWithTabs`: given `label: "Plans"`, `picker: "tabs"`, `children: "Three CarouselSlide children labelled Starter, Team and Enterprise, each a Card whose heading repeats the label"`; A few meaningful slides whose names are worth showing, so the picker is tabs.
- example `ambient-hero`, story `AmbientHero`: given `label: "Customer stories"`, `autoplay: true`, `interval: 8000`, `loop: true`, `children: "Three CarouselSlide children labelled Story 1 to Story 3, each a Card whose heading repeats the label, standing in for a photograph (the package has no image component)"`; An ambient hero of photographs that rotates slowly and wraps, with the pause control always visible.
- example `three-up-gallery`, story `ThreeUpGallery`: given `label: "Gallery"`, `perView: 3`, `picker: "none"`, `children: "Six CarouselSlide children labelled Image 1 to Image 6, each a Card whose heading repeats the label, standing in for an image (the package has no image component)"`; Three slides at a time, paged by the arrows alone.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `slideGap`, `controlOffset`, `controlRadius`, `controlShadow`, `pickerGap`, `pickerOffset`, `dotSize`, `radius`, `tabFontSize`, `tabFontWeight`, `tabPaddingBlock`, `tabPaddingInline`, `fontFamily`, `transition`
Locked (accessibility-bearing, never overridable): `controlBackground`, `dot`, `dotActive`, `dotTarget`, `tabColor`, `tabSelectedColor`, `tabIndicatorThickness`, `minTarget`, `focusRing`, `focusRingWidth`

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
  slides are `.accessibilityElement(children: .contain)` labelled `copy.slideLabel`,
  off-screen slides `.accessibilityHidden`. The region is one element with `.accessibilityAdjustableAction`
  mapped to next/previous (VoiceOver swipe up/down), which is the swipe alternative,
  plus the visible prev/next `Button`s and the picker (dots or tabs) as documented.
  Autoplay is a `TimelineView` timer stopped on any touch, VoiceOver focus or the
  pause `Button`, never started under reduced motion; user-initiated changes are announced.'
```

## Guidance

## Overview

A carousel shows several things in the space of one and lets the user page through them. It earns its place only when every slide is worth seeing and the controls make it obvious there is more; an auto-rotating banner that nobody clicks is the failure mode this component is designed to avoid.

## When to use

Use a Carousel for a small set (three to eight) of peer items too rich to show as a grid — featured products with images, testimonials, a gallery — where paging is a reasonable way to see them all. Use `picker: tabs` when slides have meaningful names ("Plans", "Pricing"); `dots` for images. Leave `autoplay` off unless the content is ambient (a hero of photographs) and even then keep the pause control visible.

## When not to use

Do not use a Carousel to hide important content behind slide two; if users must see it, lay it out. Do not use it for a list that can grow past ten items (a scrolling row of Cards with no controls, or a grid) or for step-by-step content (Stepper). Do not autoplay anything with text people need to read.

## Behavior

Previous and Next move one page — `perView` slides — disabled at the ends unless `loop`. The picker jumps directly. Swipe on touch and horizontal scroll on trackpads work through scroll-snap, and the active index follows what is visible. `autoplay` advances every `interval`, pauses on hover, focus or touch, and stops for good when the user presses pause; it never starts under reduced motion. `onChange` reports each change with its reason so analytics can distinguish user paging from rotation. Hidden slides are inert: their links and buttons are not in the tab order and not announced. Hover, focus and touch pause rotation only while they last; the pause button stops it until play is pressed. Without `loop`, autoplay stops at the last slide and does not wrap: the ambient case that wants continuous rotation sets `loop`. Paging, with `page` the current page size (see `perView`): the current index is the first visible slide; Next goes to `min(current + page, total − page)` and Previous to `max(current − page, 0)`; with `loop`, Next from `total − page` goes to 0 and Previous from 0 to `total − page`; both arrows are disabled when `total ≤ page`. A picker choice past `total − page` scrolls as far as it can and the index becomes `total − page` (that is what onChange reports), and a dots picker marks every slide on the current page as current. Reaching the last slide without `loop` counts as stopped: the control shows `copy.play` and announcements return; pressing play there restarts rotation from the first slide. A controlled carousel whose parent keeps `activeIndex` after a swipe scrolls back to `activeIndex`. The play/pause control sits in its own row above the viewport at the inline start; order is play/pause, previous, next, picker, then the slides (the picker is placed below the viewport by layout, not by order). `CarouselSlide` (`label: string`, required, and `children`), exported alongside Carousel, takes a `label` (its name in the tabs picker) on every platform — a missing one falls back to `copy.goTo` as the tab text with a development warning — it is a plain string, not read from the slide's rendered content, and the slide repeats it visibly in its own heading. Picker items are Carousel's own buttons on every platform, not the Button component, because the dot and tab tokens are Carousel's own and no Button variant carries them. Below `layout.maxWidth.prose` `perView` collapses to one; a container query cannot read a custom property, so that one breakpoint is duplicated as a literal in CSS, as Table already does for `hideBelow`. Under reduced motion the play/pause control is not rendered, since rotation can never start. Button writes its own part hook, so prevButton, nextButton and playButton each sit in a wrapper carrying the part (web: a `span` with `data-part` that passes a click through to its Button; React Native: a `View` with testID `Carousel.<part>`); for the arrows that wrapper is inside the controlSurface wrapper.

## Content guidelines

Slides are parallel: same shape, same heading level, same amount of text. Each slide sets `label` — its name in the tabs picker — and shows that same wording as its own visible heading. Keep an obvious hint that there is more (the next slide peeking, the arrows, the dots) — a carousel that looks like a single image gets treated as one.

## Accessibility

The container is a `region` named for its content with `aria-roledescription="carousel"`, and each slide a `group` with `aria-roledescription="slide"` and a positional name (WCAG 1.3.1, 4.1.2; APG carousel). Controls come before the slides in tab order and include play/pause whenever rotation is possible (2.2.2). Rotation stops on hover and focus and under reduced motion (2.3.3), and changes made by the user are announced while automatic ones are not (4.1.3). Swiping has the arrow buttons and, on native, the adjustable actions as alternatives (2.5.1). The picker conveys the current slide by state, not color alone, and dots have 24px targets despite their size.

## Platform notes

### Web
Render `<section role="region" aria-roledescription="carousel" aria-label data-ds="Carousel">` with, in order: the play/pause `Button` (when `autoplay`) — the icon set has no play or pause glyph, so this one is a text-labelled `secondary` Button carrying `copy.play`/`copy.pause`, not `iconOnly` like the arrows — the previous and next `Button`s (`secondary`, `iconOnly`, chevron Icons), each inside its own `controlSurface` element carrying `data-part="controlSurface"` with `controlBackground`, `controlShadow` and `controlRadius`, so the arrows read over an image without the Button being restyled, the picker (placed below the viewport by a CSS grid, described below), the viewport `<div>` (`overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none`) containing the track and `CarouselSlide`s (`role="group" aria-roledescription="slide" aria-label`, `scroll-snap-align: start`, `inert` when not visible). The picker is `dots`: `<div role="group">` of Carousel's own `<button>`s with `aria-label` from `copy.goTo` and `aria-current`; `tabs`: `role="tablist"` of `role="tab"` buttons with `aria-selected` and `aria-controls` to the slides, arrow keys per Tabs. An `IntersectionObserver` at threshold 0.6 sets the active index. Programmatic moves scroll the viewport element directly (see the platform notes), not `scrollIntoView`. The visually-hidden liveRegion receives `copy.announce` on user-initiated changes.

### Lit
`<ds-carousel label="Featured" picker="tabs"><ds-carousel-slide label="…">…</ds-carousel-slide></ds-carousel>`; scroll-snap viewport with the slot inside; IntersectionObserver on assigned elements; composed `change`. A tabs picker sits in the shadow root while the slides are slotted, so its `aria-controls` idref cannot resolve; each tab is instead named by the slide label and the pairing is conveyed by `aria-selected` and the announcement, as `ds-tabs` already does.

### React Native
`FlatList` horizontal with `pagingEnabled`/`snapToInterval`, `showsHorizontalScrollIndicator={false}`, `onViewableItemsChanged` with `viewabilityConfig { itemVisiblePercentThreshold: 60 }`; slides as `View accessible accessibilityLabel={copy.slideLabel}`; the arrows are system `Button`s inside their `controlSurface` wrapper View and the picker items are Carousel's own Pressables; the adjustable role and increment/decrement `accessibilityActions` sit on each visible slide, not on the region, which stays a plain View so the controls stay individually reachable. `snap: false` turns off `pagingEnabled`/`snapToInterval` only — the track still scrolls freely. Autoplay: `setInterval` guarded by `useReducedMotion()`, paused while a touch or a control's focus lasts. There is no hover on native. Native accessibility order follows the view tree, so the order is play/pause, previous, next, the slides, then the picker. The tabs picker is Carousel's own Pressables with a `Text` label styled from the `tab*` bindings.

## Related

Tabs, Card, Stepper, Button.

## Behavior scenarios (9)

One test per scenario, in this order.

```yaml
- name: next-advances-a-slide
  description: Previous and Next move one page of perView slides, and onChange reports
    the change with its reason.
  when:
    click: nextButton
  then:
  - event: onChange
- name: previous-at-the-first-slide-does-nothing
  description: The arrows are disabled at the ends unless loop, so users can tell
    where the end is.
  when:
    click: prevButton
  then:
  - event: onChange
    fired: false
- name: loop-wraps-backwards-from-the-first-slide
  description: With loop, Next from the last returns to the first, and Previous from
    the first to the last.
  given:
    loop: true
  when:
    click: prevButton
  then:
  - event: onChange
- name: the-picker-jumps-straight-to-a-slide
  given:
    activeIndex: 1
    picker: dots
  when:
    click: pickerItem
  then:
  - event: onChange
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
