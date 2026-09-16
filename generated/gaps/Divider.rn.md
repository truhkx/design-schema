# Gaps reported while generating Divider for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:26 — round 1

- The RN platform notes state there is no native `separator` accessibility role, so I hide an unlabeled Divider from assistive technology (accessibilityElementsHidden + importantForAccessibility="no") regardless of the `semantic` prop, and only expose content when a `label` is present (read naturally via Text). This means `semantic=true` without a `label` has no observable effect on native — I added a __DEV__ warning for that case since the spec doesn't say whether to warn.
- The schema doesn't say what happens when `orientation="vertical"` and `label` is set together. Docs only describe the label+line layout for horizontal dividers, and a 1px-wide vertical column has no room for centered text, so I ignore `label` on vertical dividers (render a plain line) rather than rotating the label layout.
- `spacing` schema says overrides 'change values, never presence' — treated `spacing: "none"` (the default) as the 'off' state, so `overrides.spacing` is a no-op unless a non-none spacing value is also selected, matching how Box treats radius: none.
- labelSize/fontFamily overrides are passed straight through as TokenRefs to the composed `Text`'s own `overrides` prop (which resolves them itself) rather than resolving them a second time in Divider — avoids double token resolution but relies on Text's override keys (`fontSize`, `fontFamily`) matching Divider's binding names one-for-one.

## 2026-09-10 17:43 — round 1

- semantic: RN has no separator accessibility role, so a divider with semantic=true but no label has no observable effect beyond the __DEV__ warning already implemented — documented in the code comment as an acknowledged platform limit, not a code gap.
- label on a vertical divider: spec says label is ignored with a dev warning, but the existing code silently drops the label (hasLabel requires orientation === 'horizontal') without emitting a __DEV__ warning for that specific case — the only warning present covers semantic+no-label, not label+vertical.

## 2026-09-16 04:33 — round 1

- Divider: platforms.rn.props lists `accessibilityRole`, but the rn notes say there is no separator role on native and the divider stays hidden or reads as its label Text. I set no accessibilityRole anywhere; the doc should drop it from the list or name the role it means.
- Divider: the doc doesn't say how `spacing` is applied on rn. The package rule says spacing between siblings is never a margin, but `spacing` is the divider's own space on both sides. I padded the root View along the line's cross axis (paddingVertical for horizontal, paddingHorizontal for vertical) with the line as an inner View, so the space stays transparent.
- Divider: the doc doesn't say whether the labelled row's two line pieces are hidden from assistive technology. I hid each piece (accessibilityElementsHidden + importantForAccessibility="no") and left the label Text and the root readable.
- Divider: the doc names `importantForAccessibility="no"` for the decorative divider, but the root now wraps an inner line View. On Android `no-hide-descendants` is the exact match. I kept "no" as specified, since the inner View has no content and can't take focus.
- Divider: the rn notes don't say how the label is laid out. Only `labelGap` → layout.gap.normal is given, and Stack is only mentioned under Related, not in `composition`. I composed a horizontal `Stack gap="normal" align="center"` and passed `overrides.labelGap` to Stack's `gap`, following the Fieldset → Stack pattern; composition should list `Stack` if that is intended.
- Divider: an empty-string `label` isn't covered. I treat `''` as no label: the divider stays decorative, and there is no vertical-label warning.
- Divider: `semantic: true` together with a label ignored on a vertical divider isn't covered. The doc says an ignored label implies nothing, so I warn about both the ignored label and the silent `semantic`.
- Divider: how often the dev warnings fire isn't specified. I raise them in a useEffect keyed on the relevant props, not on every render.
- Divider: the label is `Text size="sm" tone="muted"`, which gives the locked `labelColor` (color.foreground.muted) and the `labelSize` default. The rn notes only say "render the label as Text"; I took the size and tone from the web section.
- Divider: the `label-is-read-and-makes-the-divider-semantic` scenario can only check the text on rn, because the separator expectation is web-only. The test checks that `or` is rendered and nothing more.
