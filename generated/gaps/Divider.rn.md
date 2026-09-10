# Gaps reported while generating Divider for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:26 — round 1

- The RN platform notes state there is no native `separator` accessibility role, so I hide an unlabeled Divider from assistive technology (accessibilityElementsHidden + importantForAccessibility="no") regardless of the `semantic` prop, and only expose content when a `label` is present (read naturally via Text). This means `semantic=true` without a `label` has no observable effect on native — I added a __DEV__ warning for that case since the spec doesn't say whether to warn.
- The schema doesn't say what happens when `orientation="vertical"` and `label` is set together. Docs only describe the label+line layout for horizontal dividers, and a 1px-wide vertical column has no room for centered text, so I ignore `label` on vertical dividers (render a plain line) rather than rotating the label layout.
- `spacing` schema says overrides 'change values, never presence' — treated `spacing: "none"` (the default) as the 'off' state, so `overrides.spacing` is a no-op unless a non-none spacing value is also selected, matching how Box treats radius: none.
- labelSize/fontFamily overrides are passed straight through as TokenRefs to the composed `Text`'s own `overrides` prop (which resolves them itself) rather than resolving them a second time in Divider — avoids double token resolution but relies on Text's override keys (`fontSize`, `fontFamily`) matching Divider's binding names one-for-one.
