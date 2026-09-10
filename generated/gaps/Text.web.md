# Gaps reported while generating Text for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:40 — round 1

- Text: the existing committed Text.tsx predated the current package conventions (no data-ds hook, no overrides/CSS-hook system, element enum still included label/legend/htmlFor from an older schema version). Regenerated it to match the current schema (element: p|span only — labels/legends are now owned by Input/Fieldset per the schema note) and the current Card/Box/Container convention: root data-ds="Text", TextOverridableBinding (fontFamily, fontSize, fontWeight, lineHeight, color) with --ds-text-* CSS custom-property hooks, and an overrides prop using cssVar/TokenRef from @design-schema/tokens.
- Text: no Text.test.tsx existed; added one modeled on Card.test.tsx (meta.args + scenario `given`, one it() per behavior scenario) since the repo's other recently-touched components (Switch, Box, Card, Container) all ship this file alongside the component.

## 2026-09-10 00:42 — round 2

- Text: `element` is narrowed to p|span per the current spec (labels/legends now belong to Input/Fieldset), but Checkbox, Switch, and RadioGroup still relied on `<Text element="label"/"legend" htmlFor=...>` for native label association — kept the Text spec authoritative and switched those three consumers to native `<label>`/`<legend>` elements (their existing `__label`/`__legend` CSS already carries font-size/weight/color independent of Text's classes, so styling is unchanged), rather than reintroducing label/legend into TextElement.
- Text: the `literals` gate's font-stack regex (`fontFamily\s*:\s*['"]`) matches the `fontFamily` key in the override-hook lookup table even though its value is a CSS custom-property name (`--ds-text-font-family`), not a literal font stack; marked that line `literal-ok` rather than renaming the binding key away from the schema's `fontFamily` term.
