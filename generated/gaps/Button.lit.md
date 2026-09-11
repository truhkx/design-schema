# Gaps reported while generating Button for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:08 — round 1

- Button: `inverse` is a boolean prop but is not listed under platforms.lit.reflect (which only lists variant, size, type, disabled, icon-only, loading). Reflected it anyway (type: Boolean, reflect: true) since CSS attribute selectors are the only way to style it from the shadow stylesheet and every other boolean on this component is reflected — treating the omission as an oversight in the reflect list rather than an intentional exclusion.
- Button: the `inverse` description says ghost hover 'uses a translucent inverse foreground' but names no specific token/opacity for it. Used `color-mix(in srgb, var(--color-inverse-foreground) 12%, transparent)` (matches the codebase's existing color-mix-of-tokens exemption pattern) since no `backgroundHover`-style binding exists for the inverse case.
- Button: renamed the container part from the pre-existing `part="button"` to `part="container"` to match the anatomy name literally (consistent with Card/Heading/etc. convention) — confirmed correct since tools/behavior_tests.py's auto-generated harness queries `[part="container"]`.
- Button: `track`'s CustomEvent detail order relative to `press` — spec says trackPress/onTrack fire 'after onPress'; implemented as press dispatch, then (if track set) trackPress() call, then track dispatch, all synchronously within the same click handler.

## 2026-09-10 17:17 — round 1

- Button: schema lists `expanded`, `accessibleName`, and `overflowLabel` props and a `spinnerStroke` overridable binding that the pre-existing Button.ts didn't implement; added them (expanded as a non-reflected, attribute:false boolean since it's a tri-state undefined/true/false set by disclosure parents via JS property, not a plain HTML attribute; accessibleName maps to aria-label taking priority over the iconOnly fallback; overflowLabel is a plain data prop for Toolbar to read, with no rendering effect in Button itself).
- Menu.ts's trigger sets a raw `aria-expanded` attribute directly on the `<ds-button>` host element rather than setting the new `expanded` property — that attribute doesn't forward into the shadow-DOM `<button>`, so it currently has no effect on the accessible state. Out of scope for this Button-only pass; flagging so Menu (and any other disclosure parent: Popover, SidePanel, Disclosure) can be updated to use `.expanded=` instead.
- IconOnly story previously drew a hand-typed Unicode '✕' glyph in the leading-icon slot, violating the 'never draw a Unicode glyph by hand' rule; replaced with `<ds-icon name="close">`.

## 2026-09-10 19:47 — round 1

- Button (lit): the existing implementation hid the entire label/icon content via `visibility: hidden` and overlaid a centered absolute spinner while loading, contradicting the spec's 'hides trailingIcon, keeps the label visible' requirement. Fixed by placing the spinner in the leading-icon slot position (display toggled with `loading`), hiding only the leading/trailing icon slots via CSS while `loading`, and leaving the label always visible.
- Button (lit): `expanded` is `attribute: false` (JS-property only, not a reflected HTML attribute) since the spec says it's set by a disclosing parent programmatically and isn't in the `platforms.lit.reflect` list; kept as-is since this predates my pass and matches the 'consumers rarely set it directly' intent, but flagging since the spec doesn't explicitly say whether it should still be attribute-settable for the derived `renders` test.
