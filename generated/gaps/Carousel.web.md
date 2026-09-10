# Gaps reported while generating Carousel for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 13:12 — round 1

- Carousel: no play/pause glyph exists in the shared Icon set, so the play/pause control renders as a text-labeled `secondary` Button (copy.play/copy.pause) instead of an icon button; adding `play`/`pause` to IconName would let it match the prev/next arrow-button style.
- Carousel: 'Previous and Next move one slide (or one page of perView)' is ambiguous between single-slide and per-page (perView) stepping; implemented single-slide stepping only (matches the singular copy.previous/copy.next text) — perView only affects how many slides are simultaneously visible/inert, not the arrow step size.
- Carousel: doc says autoplay 'stops on hover, focus, touch, or the play/pause button; never restarts on its own after the user pauses it' — read literally, so hover/focus/touch pauses are also permanent (only the play button restarts it), unlike the common carousel convention where autoplay resumes after the pointer leaves. Flagging in case the intent was a temporary hover-pause.
- Carousel: 'interval below 5000 is refused in development' — implemented as a hard floor of 5000ms in all environments (with a dev-only console.warn), not just a development-mode-only restriction, since always allowing faster rotation seemed like an accessibility risk.
- Carousel: when not looping, autoplay reaching the last slide wraps back to the first rather than stopping — the doc doesn't say what an ambient, non-looping autoplay should do at the end.
- Carousel: `picker: tabs`'s tab text falls back to the 1-based slide position when `CarouselSlide` has no `label`; the schema has no per-slide naming prop of its own (the Lit platform note's `heading` attribute isn't in the web props list), so `CarouselSlide.label` was added as the slide's short name for tabs/announcements.
- Carousel: the `transition` token (motion.duration.base) is applied to the dot's active/inactive color swap only — native scroll-snap slide movement is animated by the browser's own smooth-scroll timing (toggled instant under reduced motion via JS), which cannot be bound to a CSS easing/duration custom property.

## 2026-09-10 19:12 — round 1

- Carousel: 'Under reduced motion the play/pause control is not rendered' was not implemented in the existing generated file (button showed whenever autoplay was true); fixed by gating rendering on !prefersReducedMotion() in addition to autoplay, matching the pattern already used elsewhere in this file for scroll behavior.
- Carousel: 'Below layout.maxWidth.prose perView collapses to one' was missing from the existing CSS; implemented as a `@container (max-width: 572px)` rule forcing `.ds-carousel__slide { flex-basis: 100% }`, duplicating the prose breakpoint as a literal (container queries can't read custom properties) — the same convention already used in Table.css for its hideBelow breakpoints.
- Carousel.tsx/.css/.stories.tsx/.test.tsx and the index.ts export already existed from a prior generation round (see generated/gaps/Carousel.web.md, round 1) with gaps already on record for: no play/pause icon in the shared Icon set, single-slide vs per-page arrow stepping, permanent vs temporary hover/focus/touch pause, hard interval floor in all environments (not just dev), non-looping autoplay wrapping at the end, and CarouselSlide.label as an added prop for tabs/announcements — none of those were re-litigated here since the doc hasn't changed.
