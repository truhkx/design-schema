# Gaps reported while generating Accordion for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 10:03 — round 1

- Accordion: `onChange` payload shape is unspecified beyond "the open ids"; I emit `string[]` always (0/1 entries under `exclusive`) since the wording is plural, while `value`/`defaultValue` still accept a bare `string` for exclusive controlled convenience per the `value` prop's own description — the two props use slightly different shapes by design.
- Accordion: styles.minTarget is size.target.comfortable (44px, locked) but the composed Disclosure hardcodes size.target.min (24px) with no exposed override, and the composition rule forbids restyling a child — targets stay at 24px until Disclosure's own schema grows a comfortable-target option.
- Accordion: a11y.requires lists `arrow-navigation`, and the `keyboard` block specifies ArrowUp/Down/Home/End focus movement among triggers, but RN's `Pressable` has no key-event API (same acknowledged limit as Tabs/RadioGroup) — not implemented; every trigger is still reachable via ordinary tab/swipe order.
- Accordion: `onOpenChange`'s `keyboard` reason can never fire natively since `Pressable` can't distinguish a hardware Enter/Space press from a touch — toggling always reports `trigger`.
- Accordion: `exclusive` + multi-id `defaultValue`/`value` isn't addressed by the spec; I open only the first id and warn in `__DEV__` for the uncontrolled case.
