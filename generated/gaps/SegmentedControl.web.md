# Gaps reported while generating SegmentedControl for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:31 — round 1

- SegmentedControl: no list/grid glyphs exist in IconName, so the IconOnly story stands in with 'dash'/'ellipsis' for the doc's canonical list/grid example — real usage will need those icons added to the shared set.
- SegmentedControl: docs say size is 'toolbar (sm) or standard (md) height', but the styles block only interpolates fontSize by {size} (no per-size padding/height token). I kept strictly to the schema — height differs only via font-size against the shared locked minTarget floor — rather than inventing a padding token; if a visibly taller md is wanted, the schema needs a sized padding binding.
- SegmentedControl: iconOnly wraps each segment in Tooltip per the web platform notes, but Tooltip's internal cloneElement overwrites any ref passed to its child, so a segment's DOM node can't be tracked via a callback ref while wrapped. Worked around by giving each segment button a generated id and looking it up with document.getElementById for roving focus and pill-indicator measurement (works whether or not iconOnly wraps it in a Tooltip) — flagging since it's a deviation from the ref-based pattern used by Tabs/RadioGroup.
- SegmentedControl: the schema has no orientation prop (unlike Tabs), so I built it horizontal-only, matching the RN platform note's 'row' description and the keyboard table's single left/right + up/down pairing (both pairs do the same thing, since there's only one axis).
