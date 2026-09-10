# Gaps reported while generating Button for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:06 — round 1

- Button: the schema's existing Button.tsx/css/stories predated the current spec (no overrides, no inverse, no track/onTrack, no data-ds/data-part, no loading spinner) — fully regenerated to match; flagging in case the old file was mid-migration for a reason not visible in the schema.
- Button loading: 'Replaces the icon slot with a 1em ring spinner' is singular and ambiguous about leadingIcon vs trailingIcon vs both — chose to replace only leadingIcon's slot (or show the spinner there even with no leadingIcon set) and leave trailingIcon rendering unchanged during loading.
- Button loadingSpin/spinner stroke width has no token binding in the schema — used border.width.focus for the ring thickness as the closest existing border-width token; no dedicated 'stroke width' token exists.
- Button inverse+ghost backgroundHover: schema says 'hover uses a translucent inverse foreground' but gives no token/opacity value — used color-mix(in srgb, var(--color-inverse-foreground) 16%, transparent), the sanctioned color-mix literal exception; the 16% figure is a guess with no token backing it.
- Button inverse focus ring: schema names color.inverse.focus for 'the focus ring' under `inverse` generally (not scoped to ghost like background/foreground), so it's swapped for all variants when inverse is true, not just ghost — flagging since the paragraph's phrasing is slightly ambiguous about scope.
- Added Button.test.tsx covering all 13 behavior scenarios (rollout target-by-target per repo convention seen in Card/Switch/etc.) even though the Output section only explicitly named .tsx and .stories.tsx — the Behavior scenarios section's 'emit one test per scenario' instruction and existing sibling components' *.test.tsx made this seem in-scope.
