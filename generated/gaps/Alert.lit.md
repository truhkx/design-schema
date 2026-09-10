# Gaps reported while generating Alert for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:57 — round 1

- Alert: the schema's spec text says the icon is 'drawn as a 1em inline shape until an Icon component exists', but ds-icon (with info/success/warning/danger status shapes and a close glyph) now exists in the package, so I composed <ds-icon> for both the tone icon and the dismiss button's glyph instead of hand-drawn SVG, per the generation rule to never draw icons by hand.
- Alert: iconSize is listed as overridable, but the composed <ds-icon> only exposes size via a fixed xs/sm/md/lg/xl enum, not an arbitrary token. I drove it through ds-icon's own documented CSS hook (--ds-icon-size) set from Alert's --ds-alert-icon-size hook on the .icon element, rather than the size attribute, so a per-instance override still works without touching ds-icon's shadow internals — the spec doesn't say how a generic TokenRef override should reconcile with a child's quantized size API.
- Alert: the previous implementation had no --ds-alert-* CSS custom-property hooks or overrides property at all (unlike the sibling components already regenerated in this pass), so I added the full Overrides contract (border, borderWidth, radius, padding, gap, partGap, iconSize, headingWeight, fontFamily, fontSize, lineHeight, dismissMargin) and a data-ds="Alert" host attribute to match current package convention; neither was called out explicitly as missing in the task, but both are required by the package-conventions doc.
