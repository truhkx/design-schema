# Gaps reported while generating Button for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:12 — round 1

- Button: the existing Button.tsx/stories predated the current schema (no `inverse`, `track`/`onTrack`, or `overrides`, and it passed `disabled` straight to `Pressable`, which removes it from the tab order — contradicting the package convention and the a11y guidance that disabled buttons stay focusable). Rewrote it in full against the current schema rather than patching around the stale version.
- Button: `inverse` — the spec says ghost's hover 'uses a translucent inverse foreground' but defines no token for that translucent color (only the locked `inverseForeground`/`inverseFocusRing` bindings). Kept the normal `backgroundHover` token for the pressed state on ghost+inverse rather than inventing an untokenized alpha value.
- Button: the spec's inverse paragraph doesn't say whether the focus-ring swap to `color.inverse.focus` applies to every variant or only `ghost`. Chose 'every variant when `inverse` is true', since the ring must read against the inverse surface regardless of the button's own fill.
- Button: 'loading … replaces the icon slot' doesn't say whether that means only `leadingIcon` or both icon slots. Chose: the spinner always occupies the leading slot (also covering `iconOnly`, whose sole visible glyph is `leadingIcon`), and `trailingIcon` is hidden while loading; the label itself stays visible throughout since only the icon is described as being replaced.
- Button: `fontSize` was previously hard-coded to `fontSizeMd` regardless of `size`, not following the schema's `font.size.{size}` interpolation. Fixed to map sm/md/lg to fontSizeSm/Md/Lg.
- Button: schema ties a `transition` binding specifically to hover/press and marks it overridable, so implemented an actual `Animated` background-color transition (using `motionDurationFast`/`motion.easing.standard`, skipped under reduced motion) instead of the instant swap used elsewhere in the package (e.g. Link's pressed-color change), since Button's own schema calls this out where Link's does not.
- Button: `loadingSpin` has no described visual (only 'one rotation'); built a custom 1em bordered-ring spinner (foreground-colored, one edge transparent) driven by that duration, replacing the previous `ActivityIndicator`, since a native `ActivityIndicator`'s spin rate can't be bound to a token.
- Button: `onTrack` payload shape isn't spelled out beyond the behavior scenario's `{ name, label }`; defined and exported `ButtonTrackEvent { name: string; label: string }` for it.
