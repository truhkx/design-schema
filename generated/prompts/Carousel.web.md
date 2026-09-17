# Generate: Carousel for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Carousel.tsx` exporting a typed React function component named `Carousel`, plus `Carousel.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Carousel({ ref, …rest }: CarouselProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
- Render the element and attributes declared under `platforms.web`. Map each event to its `platforms.web` name.
- Style ONLY through the CSS custom properties generated from tokens (`--color-…`, `--space-…`, `--font-…`, `--radius-…`). Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `var(--color-action-${variant}-background)`.
- Implement every item in `a11y.requires`:
  - `accessible-name`: the `label` prop is rendered as visible text or `aria-label`; never both empty.
  - `focus-visible`: a `:focus-visible` outline using `--color-border-focus` and `--border-width-focus`. Never remove the outline without replacing it.
  - `keyboard-operable`: native element semantics (do not build interactive elements from `<div>`).
  - `target-24px` / `target-44px`: `min-inline-size`/`min-block-size` from `--size-target-min` / `--size-target-comfortable`.
  - `heading-hierarchy`: render the heading level as the matching `<h1>`–`<h6>`; do not pick the element by visual size.
- `disabled` uses `aria-disabled="true"` and keeps the element focusable (WCAG-friendly) unless the schema says otherwise. On native checkable inputs (checkbox, radio, switch) `readOnly` has no effect, so guard with `preventDefault()` in both `click` and `change`.
- Visually hidden text (for accessible-name suffixes) uses the standard clip pattern — absolute, 1px box, `clip-path: inset(50%)`, `white-space: nowrap` — the one sanctioned use of pixel literals.
- Support light and dark by relying on the token variables only — no theme logic in the component.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard` and are removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children, no decorators that add other focusable elements.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system component. Overlays: render into a portal at `document.body` (a `container` prop may override), lock body scroll while open, make the rest of the page `inert` for modal dialogs (`focus-trap` + `inert-background`), restore focus to the opener on close (`focus-restore`), position non-modal popups with `position: fixed` from the trigger's `getBoundingClientRect()` and flip when they would overflow the viewport, and put them on the right stacking layer with `z-index: var(--layer-<name>)`.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`; title `'<Name>/React'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Carousel> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Carousel.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for web; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false` or calls `preventDefault()` on the event it receives. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element), only in its `state` (`:hover`, `:focus-visible`, the ARIA state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
      description: 'How many slides are visible at once at the widest layout. The
        page size is `perView` while the viewport''s own width is above `layout.maxWidth.prose`
        and 1 at or below it, measured on the viewport (ResizeObserver on web and
        Lit, onLayout on React Native); `perView` applies until the first measurement.
        The comparison needs the token as a number: web and Lit read it from its built
        custom property on the viewport (px and rem both parsed), React Native from
        the theme; when it cannot be read, `perView` stands as given.'
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
        between onScrollBeginDrag and onMomentumScrollEnd, or onScrollEndDrag when
        no momentum follows, as iOS does) — a scroll started by an arrow, the picker
        or autoplay reports its own reason once. A swipe settles on the viewport''s
        `scrollend` event where the engine has it and on the next IntersectionObserver
        delivery otherwise, never on a timer.'
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
    dotRadius:
      token: radius.full
      part: pickerItem
      description: Dots are round; a tab has no radius. A picker item's focus ring
        follows this radius, so it is round on dots and square on tabs.
      locked: false
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
    tabLineHeight:
      token: font.lineHeight.normal
      part: pickerItem
      description: The tab label's line height, so a tabs picker keeps the row's rhythm.
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
      description: The hit area of each arrow's controlSurface — the part wrapper
        inside it stretches to fill that surface — and the minimum block size of each
        tab, whose inline size comes from `tabPaddingInline` alone; dots use `dotTarget`.
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
        Picker `dots`: buttons with aria-label from copy.goTo, aria-controls to the
        slide they choose (as tabs have) and aria-current="true" on every slide of
        the current page; `tabs`: a Tabs-style tablist controlling the slides as tabpanels,
        aria-selected on the current slide''s tab only; either picker is named by
        copy.pickerLabel. Hover, focus and touch pause autoplay only while they last
        (pointerenter from touch is not hover; touch ends on touchend/touchcancel);
        the pause button stops it; pressing play clears those pauses, so rotation
        resumes at once.'
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
      notes: 'A horizontal FlatList with pagingEnabled only when the page is one slide
        and `slideGap` resolves to 0 — otherwise a slide plus its gap is wider than
        the viewport and native paging drifts by one gap a page — and snapToInterval
        (slide width plus gap) in every other case, with onViewableItemsChanged for
        the index (honoured only during a user drag). Each visible slide View is the
        accessible element with accessibilityRole="adjustable" and increment/decrement
        accessibility actions mapped to next/previous, labelled copy.next and copy.previous
        (VoiceOver swipe up/down), so the swipe gesture has an alternative that VoiceOver
        can reach — a non-accessible region View would not be an element on iOS. Those
        actions stay listed at either end without loop and do nothing there, since
        an accessibility action has no disabled form. Native limit: making the visible
        slide the accessible element also makes it one VoiceOver stop, so controls
        inside a slide are not reached one by one on iOS — put a slide''s own actions
        in the arrows, the picker or below the carousel on native. Slides not visible
        have accessibilityElementsHidden. Autoplay uses setInterval, never started
        under reduced motion, paused while a touch lasts (onTouchStart until onTouchEnd/onTouchCancel)
        and while an arrow, the play button or a picker item has focus (Button forwards
        onFocus/onBlur); only the pause button, or reaching the end without loop,
        stops it. Pressing play clears the touch and focus pauses as on web, so rotation
        resumes at once although the play control now has focus; the next focus change
        pauses again. The picker row is accessibilityRole "group" (dots) or "tablist"
        (tabs) labelled copy.pickerLabel, and a dot carries accessibilityState.selected
        on every slide of the current page, native''s form of aria-current. The liveRegion
        View has accessibilityLiveRegion "none" while rotating and "polite" otherwise,
        and user-initiated changes also call AccessibilityInfo.announceForAccessibility
        on iOS.'
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
- `dotRadius`: token `radius.full`; part `pickerItem`
- `tabColor`: token `color.foreground.muted`; part `pickerItem`; locked
- `tabSelectedColor`: token `color.foreground.strong`; part `pickerItem`; locked
- `tabFontSize`: token `font.size.sm`; part `pickerItem`
- `tabFontWeight`: token `font.weight.medium`; part `pickerItem`
- `tabLineHeight`: token `font.lineHeight.normal`; part `pickerItem`
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

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `slideGap`, `controlOffset`, `controlRadius`, `controlShadow`, `pickerGap`, `pickerOffset`, `dotSize`, `dotRadius`, `radius`, `tabFontSize`, `tabFontWeight`, `tabLineHeight`, `tabPaddingBlock`, `tabPaddingInline`, `fontFamily`, `transition`
Locked (accessibility-bearing, never overridable): `controlBackground`, `dot`, `dotActive`, `dotTarget`, `tabColor`, `tabSelectedColor`, `tabIndicatorThickness`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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
- name: the-region-is-announced-as-a-carousel
  description: A region named for its content, with aria-roledescription so it is
    announced as a carousel rather than a plain region.
  then:
  - attribute: aria-roledescription
    is: carousel
  platforms:
  - web
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

## Platform notes (web)

```yaml
element: section
attributes:
- role=region
- aria-roledescription=carousel
- aria-label
- aria-live
- aria-roledescription=slide
- aria-hidden
- inert
notes: "A <section aria-roledescription=\"carousel\" aria-label>; the viewport is\
  \ a scroll-snap container (overflow-x auto, scroll-snap-type x mandatory, scrollbar\
  \ hidden) so swipe and trackpad work natively; moves scroll the viewport itself\
  \ with scrollTo/scrollBy (RTL-aware), never scrollIntoView, which would also scroll\
  \ the page \u2014 behavior `instant` under reduced motion and for the first positioning,\
  \ `smooth` otherwise. Each slide is <div role=\"group\" aria-roledescription=\"\
  slide\" aria-label=\"{n} of {total}\"> (role=\"tabpanel\" with the same roledescription\
  \ when picker is `tabs`); slides outside the visible page get both `inert` and aria-hidden=\"\
  true\". Only the visually hidden liveRegion part carries aria-live: \"off\" while\
  \ rotating, \"polite\" otherwise (the APG rule: do not announce automatic changes);\
  \ the track has none, since a live track would read out slide content. Picker `dots`:\
  \ buttons with aria-label from copy.goTo, aria-controls to the slide they choose\
  \ (as tabs have) and aria-current=\"true\" on every slide of the current page; `tabs`:\
  \ a Tabs-style tablist controlling the slides as tabpanels, aria-selected on the\
  \ current slide's tab only; either picker is named by copy.pickerLabel. Hover, focus\
  \ and touch pause autoplay only while they last (pointerenter from touch is not\
  \ hover; touch ends on touchend/touchcancel); the pause button stops it; pressing\
  \ play clears those pauses, so rotation resumes at once."
```

## Guidance

## Overview

A carousel shows several things in the space of one and lets the user page through them. It earns its place only when every slide is worth seeing and the controls make it obvious there is more; an auto-rotating banner that nobody clicks is the failure mode this component is designed to avoid.

## When to use

Use a Carousel for a small set (three to eight) of peer items too rich to show as a grid — featured products with images, testimonials, a gallery — where paging is a reasonable way to see them all. Use `picker: tabs` when slides have meaningful names ("Plans", "Pricing"); `dots` for images. Leave `autoplay` off unless the content is ambient (a hero of photographs) and even then keep the pause control visible.

## When not to use

Do not use a Carousel to hide important content behind slide two; if users must see it, lay it out. Do not use it for a list that can grow past ten items (a scrolling row of Cards with no controls, or a grid) or for step-by-step content (Stepper). Do not autoplay anything with text people need to read.

## Behavior

Previous and Next move one page — `perView` slides — disabled at the ends unless `loop`. The picker jumps directly. Swipe on touch and horizontal scroll on trackpads work through scroll-snap, and the active index follows what is visible. `autoplay` advances every `interval`, pauses on hover, focus or touch, and stops for good when the user presses pause; it never starts under reduced motion. `onChange` reports each change with its reason so analytics can distinguish user paging from rotation. Hidden slides are inert: their links and buttons are not in the tab order and not announced. Hover, focus and touch pause rotation only while they last; the pause button stops it until play is pressed. Without `loop`, autoplay stops at the last slide and does not wrap: the ambient case that wants continuous rotation sets `loop`. Paging, with `page` the current page size (see `perView`): the current index is the first visible slide; Next goes to `min(current + page, total − page)` and Previous to `max(current − page, 0)`; with `loop`, Next from `total − page` goes to 0 and Previous from 0 to `total − page`; both arrows are disabled when `total ≤ page`. A picker choice past `total − page` scrolls as far as it can and the index becomes `total − page` (that is what onChange reports), and a dots picker marks every slide on the current page as current. Arrow keys in the picker move one item at a time through every slide, so past `total − page` focus moves on while the index stays capped there; the roving tab stop is the focused item while it is on the current page and the current slide's item otherwise. Reaching the last page without `loop` counts as stopped however it was reached — an autoplay tick, an arrow, the picker or a swipe, as long as rotation was on: the control shows `copy.play` and announcements return; pressing play there restarts rotation from the first slide, reported as `autoplay` and not announced. A hover, focus or touch pause is not the same as stopped: rotation is still on, so the control keeps `copy.pause`, but the live region is `polite` for as long as the pause lasts, so a change the user makes during it is announced. A controlled carousel whose parent keeps `activeIndex` after a swipe scrolls back to `activeIndex`. The play/pause control sits in its own row above the viewport at the inline start; order is play/pause, previous, next, picker, then the slides (the picker is placed below the viewport by layout, not by order). `CarouselSlide` (`label: string`, required, and `children`), exported alongside Carousel, takes a `label` (its name in the tabs picker) on every platform — a missing one falls back to `copy.goTo` as the tab text with a development warning — it is a plain string, not read from the slide's rendered content, and the slide repeats it visibly in its own heading; renaming a slide updates the picker (Lit observes the `label` attribute of its assigned slides). Picker items are Carousel's own buttons on every platform, not the Button component, because the dot and tab tokens are Carousel's own and no Button variant carries them. Below `layout.maxWidth.prose` `perView` collapses to one; a container query cannot read a custom property, so that one breakpoint is duplicated as a literal in CSS, as Table already does for `hideBelow`. Under reduced motion the play/pause control is not rendered, since rotation can never start. Button writes its own part hook, so prevButton, nextButton and playButton each sit in a wrapper carrying the part (web: a `span` with `data-part` that passes a click through to its Button; React Native: a `View` with testID `Carousel.<part>`); for the arrows that wrapper is inside the controlSurface wrapper. A click that lands on the wrapper itself runs the same action the Button runs — the wrapper never reaches into the Button. The Default story is the four slides of the featured-products example, and the Keyboard story is those slides with `picker: tabs`.

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
