# Gaps reported while generating Switch for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:43 — round 1

- Switch already had a Switch.tsx/css/stories/test set that predated the overrides/data-ds/data-part conventions (visible in Checkbox); I brought it up to that convention — added `SwitchOverridableBinding`, `overrides` prop, per-instance CSS hooks for every listed binding (locked bindings get hooks too, just excluded from the TS union), `data-ds="Switch"` on the root, and `data-part="description"` on the description Text — without touching the existing behavior logic, which already matched the schema's behavior scenarios and passed all 16 existing tests unchanged.
- The schema doesn't say whether the description's helper text size/color should be enforced by a local CSS rule or left to Text's own `size="sm" tone="muted"` props; followed Checkbox's precedent of setting both (Text props for the semantic class and a local rule reading the `--ds-switch-helper-size`/`--ds-switch-description-text` hooks) so the override hooks actually take effect.

## 2026-09-10 17:40 — round 1

- Switch: the package convention doc says form-field components carry data-ds-field for Form to discover them, but Form.tsx actually discovers fields via context registration (useFormContext().register), not DOM query — data-ds-field is only present on Checkbox and Input among 13 form-registering components (RadioGroup, Select, Combobox, etc. also omit it). Left Switch consistent with the majority pattern rather than adding the attribute unilaterally; this is a system-wide convention/implementation mismatch worth resolving once, not per-component.
- Switch: guidance mentions 'Inside a Fieldset the field reads FieldsetContext: disabled from the group applies as if set on the field,' but no FieldsetContext exists anywhere in the package (Checkbox, the closest sibling, doesn't implement it either) — Switch only inherits disabled from FormContext, not from a Fieldset group. Not implemented, since inventing that cross-cutting context for one component would be inconsistent with how its neighbors currently behave.

## 2026-09-16 04:49 — round 1

- Switch: Guidance says 'Inside a Fieldset the field reads FieldsetContext' but no FieldsetContext exists in @design-schema/react; chose FormContext's `disabled` only.
- Switch: `helperSize`, `fontFamily` and `lineHeight` have no `part` and the description is composed Text; which child binding each forwards to is not declared. Chose Text `fontSize`/`fontFamily`/`lineHeight`, following Checkbox.
- Switch: the thumb is a part in the anatomy with `thumb`/`thumbSize`/`thumbInset` bound to it, but the web notes draw it on the input itself (a pseudo-element), so it has no data-part hook; the doc does not say this is intentional for web.
- Switch: `form` does not say whether a disabled Switch is still submitted; registered it with `isDisabled` like Checkbox, so the Form's disabled-field rule applies.
- Switch: `disabledOpacity` has no part; chose to dim the track, label and description, even though `labelColor`/`descriptionText` are locked contrast pairs.
- Switch: the `transition` description says travel is 'instant under reduced motion' but does not say whether the track colour change is also removed; chose to remove both.
- Switch: `minTarget` is 'minimum row height; the whole row toggles', but the row is full width and `a11y.requires` lists target-24px while the prose cites the 44px comfortable target; used size.target.comfortable as min-block-size on the row and let the gap between the label and the track forward clicks.
- Switch: `controls.state: checked` together with the explicit `aria-checked` requirement makes a fully component-controlled input tempting, but with React 19 plus jsdom a component-held `checked` combined with preventDefault on a disabled click leaves the DOM checked; the doc should say the uncontrolled input keeps native state and aria-checked is mirrored.
