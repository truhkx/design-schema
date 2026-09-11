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

## 2026-09-10 17:21 — round 1

- Button: existing Button.tsx predated the current schema's `expanded`, `accessibleName` and `overflowLabel` props (present in the Lit implementation but missing here). Added them: `expanded` maps to `accessibilityState.expanded` (omitted, not `false`, when undefined); `accessibleName` overrides `accessibilityLabel` (falls back to `label`); `overflowLabel` is declared on the type only, since it's data read by a collapsing Toolbar parent, not rendered by Button itself.
- Button: Menu.tsx, Popover.tsx and Toolbar.tsx contain doc comments asserting 'Button has no hook to carry accessibilityState.expanded' / 'no overflowLabel metadata' as acknowledged native limits. That's now stale for `expanded` (Button supports it) and for `overflowLabel` on Menu/Popover triggers specifically, though Toolbar's overflow:menu limitation is separately caused by the lack of a ResizeObserver equivalent, not by the missing prop. Left those files untouched since this task scopes to Button only — a follow-up pass should revisit whether Menu/Popover triggers now wire up `expanded`.
- Button: no Button.test.tsx exists yet; the behavior-scenario-to-test rollout (tracked separately) hasn't reached Button, so no test file was added — stories cover the 12 scenarios' renders/props instead.

## 2026-09-10 20:11 — round 1

- Button: the existing packages/rn/src/Button.tsx already implemented the full schema (props, tokens, a11y, overrides, form/track composition) except that `spinnerStroke` (listed as overridable in the shared Overridable list) was missing from `ButtonOverridableBinding` and the spinner's `borderWidth` was hardcoded to `t.borderWidthFocus` instead of resolving an override. Added `spinnerStroke` to the type and wired it through `overrides?.spinnerStroke` with `t.borderWidthFocus` as the default, matching the pattern used for the other overridable bindings. No other changes were needed — index.ts, Button.stories.tsx, and all other bindings/a11y/composition already matched the spec.
