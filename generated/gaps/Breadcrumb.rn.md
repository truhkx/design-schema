# Gaps reported while generating Breadcrumb for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:59 — round 1

- Breadcrumb (rn): the schema says the nav's fontSize binding is inherited by nested Links ('Set on the nav; the Links inherit it'), but ancestor items wrap Link in `<Text size="sm">`, a fixed enum prop, so a `fontSize` override changes the nav's own text (current page, separators, ellipsis glyph) but not the ancestor Links' inherited size — Link has no way to receive an arbitrary token override for inherited typography. Left as-is since fixing it would mean adding a new prop to Link, which the instructions say grows only via the child's own schema.

## 2026-09-10 17:58 — round 1

- Breadcrumb (rn): focus-after-expand targets the View wrapping the first revealed item via AccessibilityInfo.setAccessibilityFocus, not the Link/Text itself — RN Text-based links have no reliable native focus target, so the container View is used as the closest available proxy; acceptable given the docs' acknowledged limit that Text/Link has no focus events on native, but flagging the choice.
- Breadcrumb (rn): onNavigate's third `event` parameter from the schema's platform-neutral description does not exist on native (schema explicitly says 'on native there is no event, the handler is the navigation'), so the RN signature is (item, index) only — not a discrepancy, just noting the platform divergence is intentional per spec.
