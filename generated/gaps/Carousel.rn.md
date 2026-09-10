# Gaps reported while generating Carousel for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 13:01 — round 1

- Carousel: "Previous and Next move one slide (or one page of perView)" doesn't define page alignment, so Next/Prev/autoplay/swipe-detection all advance exactly one slide index at a time; perView only changes how many slides are visible at once (item width = viewport/perView), never the step size.
- Carousel: styles.controlBackground (color.overlay.surface, locked) and controlShadow can't be applied to prevButton/nextButton directly — the composed Button has no plain 'background' override slot, and restyling a child is forbidden. Implemented as Button variant="ghost" (transparent) inside a small wrapper View that carries controlBackground/controlShadow and a radiusFull backdrop, so the 'overlaid arrows sit on a readable surface' intent is preserved without touching Button internals.
- Carousel: the play/pause control is rendered only when autoplay && !reducedMotion, since 'Starts only when the user has not asked for reduced motion' makes rotation permanently impossible under reduced motion — judged a visible-but-dead control worse than omitting it; a persistently-rendered disabled pause button may have been intended instead.
- Carousel: 'stops on hover, focus, touch' — hover doesn't apply on native. Touch is handled (onTouchStart on the region, onScrollBeginDrag on the track). Focus-based pausing could only be wired for the hand-built picker items; prevButton/nextButton/playButton are composed Buttons with no onFocus prop exposed, so focusing them cannot pause autoplay.
- Carousel: platforms.rn asks for accessibilityRole="adjustable" with increment/decrement actions on the region while also requiring prevButton/nextButton/picker to be individually reachable in tab order. Implemented without accessible={true} on the region so descendants stay individually focusable, with adjustable role/actions layered on as the documented swipe alternative — exact VoiceOver behavior for an adjustable-but-not-collapsed container is unverified.
- CarouselSlide.heading is a plain string prop (not rendered) used only to build each slide's accessibility name and its tabs-picker label, since RN can't extract text from arbitrary children; the visible content must repeat its own heading (e.g. inside a Card), mirroring the web model's separate aria-label.
- Carousel: snap=false only disables native paging/snapToInterval (scrolling/swiping still works); the spec only describes snap's 'on' behavior.
- Carousel: non-loop autoplay that reaches the last page simply stops advancing (no bounce/reverse), since the spec doesn't define wrap-less autoplay's end behavior.
