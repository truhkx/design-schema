# Gaps reported while generating Disclosure for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:52 — round 1

- Disclosure: schema's `styles` block lists `triggerPaddingBlock`, `triggerPaddingInline`, `triggerGap`, `triggerFontFamily`, `triggerFontSize`, `triggerFontWeight`, `triggerRadius`, `panelPaddingBlock`, `panelPaddingInline`, `disabledOpacity`, `transition` as overridable, but the file I found already checked in had no `overrides` property or `--ds-disclosure-*` hooks at all (styles read raw tokens directly) — added the `DisclosureOverridableBinding` type, `HOOKS` map, `overrides` property and `applyOverrides()` to match the Overrides contract and the pattern used by every other component in the package.
- Disclosure: the chevron was hand-drawn as an inline `<svg>`, but `Icon.ts`'s own doc comment explicitly names 'the chevron in a Disclosure' as intended `<ds-icon>` usage and the icon rule forbids hand-drawn SVGs — replaced it with `<ds-icon name="chevron-right" inline>` and kept the rotation in Disclosure's own CSS (transform, not a glyph swap) so the `transition` binding still animates the rotation rather than a discrete icon change.
- Disclosure: host was missing `data-ds="Disclosure"` (the testability hook convention) — added it in `connectedCallback`.
- Generated test `generated/behavior/Disclosure.lit.test.ts`'s `has-accessible-name` case asserts `toHaveAccessibleName(props.label)`, but Disclosure has no `label` prop (its accessible name comes from `summary`), so it always compares against `undefined` and fails — same failure reproduces verbatim in `Icon.lit.test.ts` (which I did not touch), confirming this is a pre-existing generator gap in `tools/behavior_tests.py`'s prop-name assumption, not a defect in this component; left it alone since `generated/` is out of scope for this pass.
