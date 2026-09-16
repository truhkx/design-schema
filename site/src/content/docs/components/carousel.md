---
title: Carousel
description: A set of slides shown one (or a few) at a time with previous/next controls, a slide picker, and optional auto-rotation that pauses the moment anyone touches it — the APG carousel with the accessibility built in rather than bolted on.
component:
  name: Carousel
  category: container
  status: review
  apg: carousel
  anatomy: [region, viewport, track, slide, controlSurface, prevButton, nextButton, picker, pickerItem, playButton, liveRegion]
  composition:
    prevButton: { component: Button, props: { variant: secondary } }
    nextButton: { component: Button, props: { variant: secondary } }
    playButton: Button
  props:
    label:
      type: string
      required: true
      description: What the carousel shows ("Featured products", "Customer stories").
      a11y: aria-label on the region; each slide is named "{n} of {total}" plus its own heading.
    children:
      type: content
      required: true
      description: 'One `CarouselSlide` per slide. A slide is any content; a Card is the usual shape. Slides should be equal height.'
    perView:
      type: integer
      default: 1
      description: How many slides are visible at once at the widest layout; fewer are shown as the viewport narrows (one below the prose width).
    loop:
      type: boolean
      default: false
      description: Next from the last returns to the first. Off by default so users can tell where the end is.
    autoplay:
      type: boolean
      default: false
      description: 'Rotate automatically every `interval`. Starts only when the user has not asked for reduced motion; stops on hover, focus, touch, or the play/pause button; never restarts on its own after the user pauses it.'
    interval:
      type: number
      default: 6000
      description: Milliseconds between automatic advances; values below 5000 are raised to 5000 on every platform (with a development warning).
    picker:
      type: enum
      values: [dots, tabs, none]
      default: dots
      description: 'How slides are chosen directly: small dot buttons, tabs with each slide''s label (for few, meaningful slides), or none (arrows only).'
    activeIndex:
      type: integer
      description: Controlled current slide (zero-based). Omit for uncontrolled.
    snap:
      type: boolean
      default: true
      description: Swiping or scrolling snaps to slide boundaries.
  events:
    onChange:
      description: Fired when the current slide changes, with the new index and the reason (`next`, `prev`, `picker`, `swipe`, `autoplay`).
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: index, type: number, description: The index of the new current slide. }
        - { name: reason, type: enum, values: [next, prev, picker, swipe, autoplay] }
      reasons:
        next: the next control was activated
        prev: the previous control was activated
        picker: a picker dot or tab was chosen
        swipe: the track was swiped
        autoplay: autoplay advanced the carousel
      fires: [user, programmatic]
  keyboard:
    - { keys: [Tab], action: 'Moves through the controls (play/pause, previous, next, picker) and then into the current slide''s focusable content; hidden slides are inert.', from: any, expect: manual }
    - { keys: [ArrowRight], action: Next slide., when: focus on picker or in a tabs picker, from: inside, expect: manual }
    - { keys: [ArrowLeft], action: Previous slide., when: focus on picker, from: inside, expect: manual }
    - { keys: [Home], action: First slide., when: focus on picker, from: inside, expect: manual }
    - { keys: [End], action: Last slide., when: focus on picker, from: inside, expect: manual }
    - { keys: [Enter, ' '], action: 'Activates the focused control: previous, next, a picker item, or play/pause.', from: inside, expect: manual, native: true }
  styles:
    slideGap: { token: layout.gap.normal, part: slide }
    controlOffset: { token: space.2, description: Distance of the arrow buttons from the viewport edge when overlaid. }
    controlBackground: { token: color.overlay.surface, description: 'The `controlSurface` wrapper around each arrow Button (the Button itself is `secondary` and untouched) so they stay readable over images.' }
    controlShadow: { token: shadow.raised, description: 'On the controlSurface wrapper.' }
    pickerGap: { token: layout.gap.tight, part: picker }
    pickerOffset: { token: space.3, part: picker, description: Between the viewport and the picker row. }
    dot: { token: color.border.strong }
    dotActive: { token: color.control.selectedBackground }
    dotSize: { token: space.2 }
    dotTarget: { token: size.target.min, description: 'Each dot''s hit area; the dot itself is small.' }
    radius: { token: radius.md, description: Applied to the viewport so slide edges match the theme. }
    transition: { token: motion.duration.base, description: 'Dot and tab state changes; slide movement is the browser''s scroll-snap timing (instant under reduced motion).' }
    minTarget: { token: size.target.comfortable }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  constants:
    minInterval:
      description: 'The floor `interval` is raised to, so autoplay never advances faster than a slide can be read.'
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
        n: { type: number, description: The slide's position. }
        total: { type: number, description: How many slides the carousel has. }
    goTo:
      text: 'Go to slide {n}'
      params:
        n: { type: number, description: The slide's position. }
    announce:
      text: 'Slide {n} of {total}'
      params:
        n: { type: number, description: The slide's position. }
        total: { type: number, description: How many slides the carousel has. }
  a11y:
    role: region
    requires: [accessible-name, keyboard-operable, arrow-navigation, focus-visible, contrast-aa, target-24px, reduced-motion, live-region, gesture-alternative, no-hover-only, selected-state]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
  platforms:
    web:
      element: section
      attributes: [role=region, aria-roledescription=carousel, aria-label, aria-live, aria-roledescription=slide, aria-hidden, inert]
      notes: 'A <section aria-roledescription="carousel" aria-label>; the viewport is a scroll-snap container (overflow-x auto, scroll-snap-type x mandatory, scrollbar hidden) so swipe and trackpad work natively; the arrows scroll by one slide with scrollIntoView (behavior from reduced motion). Each slide is <div role="group" aria-roledescription="slide" aria-label="{n} of {total}">; off-screen slides get `inert` so their links are not tab stops. The track has aria-live="polite" while autoplay is paused and "off" while rotating (the APG rule: do not announce automatic changes). Picker `dots`: buttons with aria-label from copy.goTo and aria-current on the active; `tabs`: a Tabs-style tablist controlling the slides as tabpanels. Autoplay uses a timer cleared on pointerenter/focusin/touchstart and by the pause button; the pause button appears first in tab order whenever autoplay is on.'
    lit:
      tag: ds-carousel
      reflect: [per-view, loop, autoplay, picker, { prop: snap, attribute: no-snap }, active-index]
      notes: 'Slotted <ds-carousel-slide> children; scroll-snap viewport in the shadow root with the slot inside a track; IntersectionObserver on slotted slides determines the active index and sets `inert` on the others. Composed `change`.'
    rn:
      element: FlatList
      props: [horizontal, pagingEnabled, snapToInterval, decelerationRate=fast, accessibilityRole=adjustable, accessibilityActions]
      notes: 'A horizontal FlatList with pagingEnabled (perView 1) or snapToInterval (more) and onViewableItemsChanged for the index. The region View has accessibilityRole="adjustable" with increment/decrement accessibility actions mapped to next/previous (VoiceOver swipe up/down), so the swipe gesture has an alternative. Slides not visible have accessibilityElementsHidden. Autoplay uses setInterval cleared on any touch and never started under reduced motion. Announcements via AccessibilityInfo.announceForAccessibility when the change came from the user.'
    swiftui:
      element: ScrollView
      props: [ScrollView, LazyHStack, .scrollTargetBehavior=paging, .scrollTargetLayout, .scrollPosition, .accessibilityElement=contain, .accessibilityAdjustableAction, Button, TimelineView, .accessibilityAddTraits=updatesFrequently]
      notes: 'A horizontal `ScrollView` with `LazyHStack` and `.scrollTargetBehavior(.paging)` (`.viewAligned` when `perView` > 1) and `.scrollPosition` bound to the active index; slides are `.accessibilityElement(children: .contain)` labelled `copy.slideLabel` + heading, off-screen slides `.accessibilityHidden`. The region is one element with `.accessibilityAdjustableAction` mapped to next/previous (VoiceOver swipe up/down), which is the swipe alternative, plus the visible prev/next `Button`s and the picker (dots or tabs) as documented. Autoplay is a `TimelineView` timer stopped on any touch, VoiceOver focus or the pause `Button`, never started under reduced motion; user-initiated changes are announced.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    - name: next-advances-a-slide
      description: Previous and Next move one page of perView slides, and onChange reports the change with its reason.
      when: { click: nextButton }
      then:
        - { event: onChange }
    - name: previous-at-the-first-slide-does-nothing
      description: The arrows are disabled at the ends unless loop, so users can tell where the end is.
      when: { click: prevButton }
      then:
        - { event: onChange, fired: false }
    - name: loop-wraps-backwards-from-the-first-slide
      description: With loop, Next from the last returns to the first, and Previous from the first to the last.
      given: { loop: true }
      when: { click: prevButton }
      then:
        - { event: onChange }
    - name: the-picker-jumps-straight-to-a-slide
      given: { activeIndex: 1, picker: dots }
      when: { click: pickerItem }
      then:
        - { event: onChange }
    - name: the-region-is-announced-as-a-carousel
      description: A region named for its content, with aria-roledescription so it is announced as a carousel rather than a plain region.
      then:
        - { attribute: aria-roledescription, is: carousel }
      platforms: [web]
  examples:
    - name: featured-products
      description: The default carousel of image slides chosen with dots.
      given: { label: Featured products, children: 'Four CarouselSlide children, each a product Card' }
    - name: named-slides-with-tabs
      description: A few meaningful slides whose names are worth showing, so the picker is tabs.
      given: { label: Plans, picker: tabs, children: 'Three CarouselSlide children: Starter, Team and Enterprise' }
    - name: ambient-hero
      description: An ambient hero of photographs that rotates slowly and wraps, with the pause control always visible.
      given: { label: Customer stories, autoplay: true, interval: 8000, loop: true, children: 'Three CarouselSlide children, each a photograph' }
    - name: three-up-gallery
      description: Three slides at a time, paged by the arrows alone.
      given: { label: Gallery, perView: 3, picker: none, children: 'Six CarouselSlide children, each an image' }
---

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
