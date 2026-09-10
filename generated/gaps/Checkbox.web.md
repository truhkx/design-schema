# Gaps reported while generating Checkbox for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:41 — round 1

- Checkbox: the file already existed from an earlier generation pass without the overrides contract (--ds-checkbox-* hooks, `overrides` prop) or data-ds/data-part testability hooks that Input.tsx and Card.tsx now use; I retrofitted Checkbox.tsx/.css to match that established pattern rather than leaving it stale.
- Checkbox: the `indicator` binding's description ('controlSize minus 2 × space.1') references space.1 as a fixed layout detail of that binding, not the `partGap` override binding (which is semantically the vertical gap between label/description/error) — kept the indicator inset as the literal `var(--space-1)` token so overriding `partGap` doesn't resize the checkmark.
- Checkbox: anatomy lists `indicator` as a part, but per the web platform notes it's drawn as a CSS ::before pseudo-element on the control, not a real DOM node, so it has no element to carry `data-part="indicator"`; only `description` and `errorMessage` got the attribute (control and label are already reachable by role/label).

## 2026-09-10 17:39 — round 1

- Checkbox: the existing Checkbox.tsx/.css/.stories.tsx (from a prior generation pass) were missing the `hideLabel` prop entirely, despite it being a required schema prop with its own a11y contract (label stays the accessible name via the standard visually-hidden clip pattern, matching Input's `ds-input__visually-hidden`). Added the prop, the `ds-checkbox__visually-hidden` CSS class, and a `HideLabel` story.
- Checkbox: the root was also missing `data-ds-field`, which the package convention requires on every field component so Form can discover fields by attribute (Input.tsx already has it). Added it alongside the existing `data-ds="Checkbox"`.
- Checkbox: Table.tsx's selection-column and select-all Checkbox usages (packages/react/src/Table.tsx:444, :515) are exactly the case the schema calls out for `hideLabel` ('a selection column in a Table, where the row name is the label') but don't pass it, so the row/column name is currently rendered as visible checkbox label text next to each row. Left Table.tsx unchanged since it's outside this Checkbox-generation task's scope — flagging for a follow-up pass on Table.
- Checkbox: no Checkbox.test.tsx was generated for the 15 behavior scenarios; the current generation prompt's Output section only calls for Checkbox.tsx and Checkbox.stories.tsx, and per project memory the behavior-scenario test rollout is being done target-by-target separately (Switch, Box, Card, Container so far) and hasn't reached Checkbox yet.
