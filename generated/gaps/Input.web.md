# Gaps reported while generating Input for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:16 — round 1

- Input: the schema's Overrides section makes labelWeight/helperSize/lineHeight/fontFamily/descriptionText/errorText bindings that Input itself owns, but the general composition rule says to render label/description/error via the shared Text component, which doesn't expose per-instance CSS hooks for those bindings. Rendered label/description/error as plain elements styled by Input's own --ds-input-* custom properties instead (matching Button's own precedent of a plain <span> for its label, not Text), so the override contract actually works.
- Input: focusRingWidth's description ('replaces borderWidth when focused; padding shrinks by the difference') conflicts with the general :focus-visible outline convention used by other components. Implemented it literally as written for this component: border thickens/recolors on focus with compensating padding via calc(), no separate outline layer.
- Input: a11y.role is declared as a single 'textbox' for all `type` values, but native ARIA mapping differs per type (search -> searchbox, number -> spinbutton, password -> no role). Left `type` to drive real browser semantics rather than forcing role='textbox' everywhere, since overriding the native role would fight the platform.
- Input: disabled styling only lists a `disabledOpacity` binding (no separate disabled background/foreground tokens), so disabled dims the field via opacity alone rather than swapping to a muted background/foreground as the file previously did.
- Input: added a companion Input.test.tsx (one test per behavior scenario, Button.test.tsx-style) since the Behavior scenarios section asked for scenario-derived tests even though the Output section only named Input.tsx and Input.stories.tsx.

## 2026-09-10 17:27 — round 1

- Input already existed in the package but was missing `size` (sm/md) and `hideLabel` entirely — added both props, their style bindings (fontSize now varies with size, plus paddingBlockSm/paddingInlineSm/minTargetSm), a `.ds-input--sm` modifier class, and `SizeSm`/`SizeMd`/`HideLabel` stories.
- Package conventions require every field component's root to carry `data-ds-field` so Form can discover fields by attribute, but no existing field component (Checkbox, Switch, RadioGroup, Select, etc.) has this attribute, and Form.tsx actually discovers fields via React context registration (`FormContext.register`), not DOM scanning. Added `data-ds-field` to Input's root for spec compliance, but it's currently inert/unused — flagging the doc/implementation gap rather than silently deviating.
- The Input doc says the field 'reads FieldsetContext' inside a Fieldset, but no FieldsetContext exists in the codebase — Fieldset.tsx actually injects `disabled` into children via `cloneElement`. Left this existing, working mechanism in place rather than inventing a FieldsetContext the rest of the package doesn't use.
- Native `<input>` has its own `size` HTML attribute (character width, type number) which collides with the schema's `size` enum prop; omitted the native attribute from InputProps (added `'size'` to the Omit list) in favor of the schema meaning, since the schema takes precedence.
- The two new behavior scenarios `renders-size-sm`/`renders-size-md` are not reflected in the existing `Input.test.tsx` (a generated gate file outside this task's Output scope, which only names `Input.tsx` and `Input.stories.tsx`) — leaving that file for the test-generation pass to update.

## 2026-09-10 19:52 — round 1

- Input: existing implementation already covered the schema; the only deviation from current conventions was that description/error were raw <p> tags instead of composed Text components (the guidance says 'description and error are Text', and the sibling NumberInput/Fieldset already follow that). Refactored to compose Text for both, forwarding helperSize/fontFamily/lineHeight overrides into Text's own overrides and dropping the now-redundant descriptionText/errorText/helperSize CSS hooks (Text's tone classes already resolve to the exact locked tokens color.foreground.muted / color.foreground.danger).
