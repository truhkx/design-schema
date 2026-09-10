# Gaps reported while generating RadioGroup for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:47 — round 1

- RadioGroup: part names use simplified kebab-case (`radio-label`, `radio-description`, `error`) rather than the schema's exact anatomy strings (`radioLabel`, `radioDescription`, `errorMessage`); this pre-existing choice matches the convention already used by Checkbox/Switch in this package, so I kept it for consistency rather than diverging.
- RadioGroup: `radioIndicator` (the centre dot) is a `::after` pseudo-element and cannot carry a `part` attribute; no separate element exists for it, consistent with Checkbox's indicator.

## 2026-09-10 01:48 — round 2

- RadioGroup: the `literals` gate's font-stack regex (`fontFamily\s*:\s*['"]`) false-positives on the HOOKS map entry `fontFamily: '--ds-radio-group-font-family'` — that's a CSS custom-property name, not a hard-coded font stack. Marked it `literal-ok` rather than renaming the binding key (which would break the established override-hook naming convention shared with Checkbox/Switch).
