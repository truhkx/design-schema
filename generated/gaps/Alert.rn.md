# Gaps reported while generating Alert for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:57 — round 1

- Alert: the styles.icon description says the leading glyph is 'drawn as a 1em inline shape until an Icon component exists', but this package's Icon component already exists (and its own docblock names Alert's status shape as a documented use case, referring to a 'retired Unicode-glyph implementation'). Replaced the Unicode-glyph tone icon and the '×' dismiss glyph with `<Icon name={tone} .../>` and `<Icon name="close" .../>`, matching how Dialog's close button is built — this is a doc/reality mismatch, not an ambiguity in the schema itself.
- Alert: the schema's Overrides section lists 12 overridable bindings (border, borderWidth, radius, padding, gap, partGap, iconSize, headingWeight, fontFamily, fontSize, lineHeight, dismissMargin) but the file on disk before this change had no `overrides` prop at all — added `AlertOverridableBinding` and wired every binding through `resolveToken`, following the pattern used by Button/Disclosure/RadioGroup, and exported the new type from index.ts.
- Alert: the file on disk was also missing the package-wide `testID="<Name>"` convention on the root View; added `testID="Alert"`.
- Alert: heading and body share a single `fontSize`/`fontFamily`/`lineHeight` binding set per the schema (no separate heading-size token), so overriding `fontSize` resizes both the heading and, when the body is a plain string, the Text body; a non-string body (composed Text/Link children) does not receive the override since Alert cannot reach into a child's props, consistent with 'never restyle a child.'

## 2026-09-10 17:54 — round 1

- Alert.tsx already existed and matched the spec almost entirely, except it was missing the `headingSize` overridable binding entirely — the heading reused the body's `fontSize` override, so overriding `fontSize` alone would incorrectly resize the heading too, and there was no way to size the heading independently. Added `headingSize` (default `font.size.md`) to `AlertOverridableBinding`, used it for the heading's font size and line height, and sized the icon-alignment cell off the heading's line height when a heading is present (falling back to the body's line height otherwise) since the schema doesn't specify which line the icon should align to when both exist.
