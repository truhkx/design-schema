# Gaps reported while generating Alert for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:57 — round 1

- Alert: the styles.icon description says the leading glyph is 'drawn as a 1em inline shape until an Icon component exists', but this package's Icon component already exists (and its own docblock names Alert's status shape as a documented use case, referring to a 'retired Unicode-glyph implementation'). Replaced the Unicode-glyph tone icon and the '×' dismiss glyph with `<Icon name={tone} .../>` and `<Icon name="close" .../>`, matching how Dialog's close button is built — this is a doc/reality mismatch, not an ambiguity in the schema itself.
- Alert: the schema's Overrides section lists 12 overridable bindings (border, borderWidth, radius, padding, gap, partGap, iconSize, headingWeight, fontFamily, fontSize, lineHeight, dismissMargin) but the file on disk before this change had no `overrides` prop at all — added `AlertOverridableBinding` and wired every binding through `resolveToken`, following the pattern used by Button/Disclosure/RadioGroup, and exported the new type from index.ts.
- Alert: the file on disk was also missing the package-wide `testID="<Name>"` convention on the root View; added `testID="Alert"`.
- Alert: heading and body share a single `fontSize`/`fontFamily`/`lineHeight` binding set per the schema (no separate heading-size token), so overriding `fontSize` resizes both the heading and, when the body is a plain string, the Text body; a non-string body (composed Text/Link children) does not receive the override since Alert cannot reach into a child's props, consistent with 'never restyle a child.'

## 2026-09-10 17:54 — round 1

- Alert.tsx already existed and matched the spec almost entirely, except it was missing the `headingSize` overridable binding entirely — the heading reused the body's `fontSize` override, so overriding `fontSize` alone would incorrectly resize the heading too, and there was no way to size the heading independently. Added `headingSize` (default `font.size.md`) to `AlertOverridableBinding`, used it for the heading's font size and line height, and sized the icon-alignment cell off the heading's line height when a heading is present (falling back to the body's line height otherwise) since the schema doesn't specify which line the icon should align to when both exist.

## 2026-09-10 20:45 — round 1

- Alert (rn): spec's a11y notes describe moving focus to the next/previous focusable element when the alert is dismissed; React Native has no API to move focus to an arbitrary element, so this is left as an acknowledged limitation (documented in the component's JSDoc), matching the platform note's own admission that this is not possible on native.
- Alert (rn): iconSize default (font.size.lg) is applied via Icon's `size="lg"` enum rather than always routing through `overrides.size`, since the two are equivalent by default and only the override path needs to win — same pattern already used in AlertDialog.tsx for its status icon.

## 2026-09-16 05:11 — round 1

- Alert: the RN dismiss Button's close glyph has no named token — the web notes say 'a 1em × glyph', the RN guidance says 'a × glyph as leadingIcon'. I used <Icon name="close" color={t.colorActionGhostForeground} />, matching Dialog, because RN has no currentColor; the spec should say which Icon name and color token to use.
- Alert: the `icon` binding says to pass it as `overrides.color`, but the RN digest says to pass the foreground token to Icon's `color` prop. I used overrides.color with a per-tone token-name lookup, since the composition forwards section wins; the digest and the rn notes should agree.
- Alert: `bodyColor` (color.foreground on part body) and the body typography bindings have no stated RN mechanism. I wrapped a string body in the system Text, relying on its default tone for color and passing fontFamily/fontSize/lineHeight into its overrides only when they're set. Non-string bodies get nothing, which matches 'a composite never restyles a child', but the spec never says whether a string body should be wrapped in Text.
- Alert: the heading is a raw RN Text (web says a raw element rather than Text or Heading), and no heading role is set because the web notes say it must not disturb the outline. The RN notes never say whether it should have accessibilityRole="header".
- Alert: the RN notes say to call announceForAccessibility 'with live≠off', while the guidance says 'iOS does not honour live regions'. I call it only when Platform.OS === 'ios' (so Android doesn't announce twice), but the notes don't say whether it's iOS-only.
- Alert: when the body isn't a string and there's no heading, accessibilityLabel is left unset, so the region has no name on native. The web version names it by the body element, which RN can't reference. I left this unstated case as it is.
- Alert: the scenario live-status-renders-the-status-role only lists web/lit, and RN has no status role. The notes map status to polite only, so I set no role; the spec could say whether RN should use role="status" (react-native-web supports it).
- Alert: 'Every example is a story with exactly its given' conflicts with the required `children` living in the Default args. I put children (plus the enum defaults) in meta.args with no heading, so examples without a heading don't pick one up; the Default story therefore has no heading.
- Alert: the icon sits next to the first line, but nothing says how to line them up. I gave the icon a box as tall as the first line (heading or body line height, or the icon size if that's bigger) and centered the icon in it — my own choice.
- Alert: dismissMargin is described as a 'negative block/inline-end margin', but the RN digest says siblings are never spaced with margins. I followed the spec (marginTop/marginEnd = -space.1 on a wrapper View) and didn't restyle the Button; the digest should list this as an exception.
