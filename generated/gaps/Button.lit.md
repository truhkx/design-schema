# Gaps reported while generating Button for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:08 — round 1

- Button: `inverse` is a boolean prop but is not listed under platforms.lit.reflect (which only lists variant, size, type, disabled, icon-only, loading). Reflected it anyway (type: Boolean, reflect: true) since CSS attribute selectors are the only way to style it from the shadow stylesheet and every other boolean on this component is reflected — treating the omission as an oversight in the reflect list rather than an intentional exclusion.
- Button: the `inverse` description says ghost hover 'uses a translucent inverse foreground' but names no specific token/opacity for it. Used `color-mix(in srgb, var(--color-inverse-foreground) 12%, transparent)` (matches the codebase's existing color-mix-of-tokens exemption pattern) since no `backgroundHover`-style binding exists for the inverse case.
- Button: renamed the container part from the pre-existing `part="button"` to `part="container"` to match the anatomy name literally (consistent with Card/Heading/etc. convention) — confirmed correct since tools/behavior_tests.py's auto-generated harness queries `[part="container"]`.
- Button: `track`'s CustomEvent detail order relative to `press` — spec says trackPress/onTrack fire 'after onPress'; implemented as press dispatch, then (if track set) trackPress() call, then track dispatch, all synchronously within the same click handler.
