# Gaps reported while generating Disclosure for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:52 — round 1

- Disclosure: schema's `styles` block lists `triggerPaddingBlock`, `triggerPaddingInline`, `triggerGap`, `triggerFontFamily`, `triggerFontSize`, `triggerFontWeight`, `triggerRadius`, `panelPaddingBlock`, `panelPaddingInline`, `disabledOpacity`, `transition` as overridable, but the file I found already checked in had no `overrides` property or `--ds-disclosure-*` hooks at all (styles read raw tokens directly) — added the `DisclosureOverridableBinding` type, `HOOKS` map, `overrides` property and `applyOverrides()` to match the Overrides contract and the pattern used by every other component in the package.
- Disclosure: the chevron was hand-drawn as an inline `<svg>`, but `Icon.ts`'s own doc comment explicitly names 'the chevron in a Disclosure' as intended `<ds-icon>` usage and the icon rule forbids hand-drawn SVGs — replaced it with `<ds-icon name="chevron-right" inline>` and kept the rotation in Disclosure's own CSS (transform, not a glyph swap) so the `transition` binding still animates the rotation rather than a discrete icon change.
- Disclosure: host was missing `data-ds="Disclosure"` (the testability hook convention) — added it in `connectedCallback`.
- Generated test `generated/behavior/Disclosure.lit.test.ts`'s `has-accessible-name` case asserts `toHaveAccessibleName(props.label)`, but Disclosure has no `label` prop (its accessible name comes from `summary`), so it always compares against `undefined` and fails — same failure reproduces verbatim in `Icon.lit.test.ts` (which I did not touch), confirming this is a pre-existing generator gap in `tools/behavior_tests.py`'s prop-name assumption, not a defect in this component; left it alone since `generated/` is out of scope for this pass.

## 2026-09-16 05:04 — round 1

- Disclosure: the lit platform notes and the Lit guidance say `toggle` carries `detail: { open }`, but the event payload lists `open` and `reason`; I followed the payload and sent `{ open, reason }`.
- Disclosure: `reason: controlled` with `fires: controlled` doesn't say what happens when a user click in controlled mode leads the consumer to set `open` to the value the click asked for. I report that change once (as pointer/keyboard) and don't send a second `controlled` event. If the consumer never sets `open`, the pending request is cleared at the next `open` change.
- Disclosure: `copy.expanded` / `copy.collapsed` are only used on SwiftUI. On web and Lit the state comes from `aria-expanded`, so the copy goes unused here; the doc should say the copy is SwiftUI-only.
- Disclosure: the `icon` binding has no `part`, even though the anatomy names `triggerIcon`. I applied it to the `triggerIcon` element (the composed ds-icon) as its color.
- Disclosure: the `transition` binding covers only the chevron rotation. The trigger's hover background has no transition binding, so I dropped the old `motion.duration.fast` background transition rather than invent one.
- Disclosure: the RTL mirroring is given for web (`[dir=rtl]`) and native (`chevron-left`) but not how the open rotation composes with it on Lit. I used `scaleX(-1)` when closed and `scaleX(-1) rotate(90deg)` when open, so it points toward the end side when closed and down when open.
- Disclosure: `defaultOpen` has no attribute name in the lit notes (only `heading-level` and `keep-mounted` are given); I kept `default-open`, not reflected.
- Disclosure: the `disabled-trigger-does-not-toggle` scenario needs a forced click in Playwright, because the aria-disabled button counts as not actionable; the test uses `{ force: true }`, as Switch does.
- Disclosure: the scenarios have no case for `reason` (keyboard vs pointer), a controlled `open` change, keepMounted `hidden`, or focus moving to the trigger on close, though the Behavior prose requires all four. They are implemented but not tested; the doc should add scenarios for them.
