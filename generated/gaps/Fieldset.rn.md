# Gaps reported while generating Fieldset for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:04 — round 1

- Fieldset: schema's `requiredIndicator` rule ('appended when every field inside is required') requires introspecting children — implemented via React.Children.toArray + checking props.required on direct element children only; nested wrappers (e.g. a consumer-supplied Stack around fields) won't be seen.
- Fieldset: FieldsetContext (legend + disabled) is created and provided as the spec directs, but Input, Checkbox, Switch and RadioGroup don't yet read it (out of scope — I only touched Fieldset.tsx), so the 'Shipping address, Street' accessibilityLabel prefixing described in the RN platform notes has no effect until those four components are regenerated to consume useFieldsetContext().
- Fieldset: same gap applies to `disabled` propagation — since fields don't read the context yet, I added a fallback that clones direct children with `disabled: true` (mirroring the interim behavior the spec describes for web) so the prop is still functional today; this fallback isn't explicitly specified for RN and only reaches direct children, not ones nested in an intermediate wrapper.
- Fieldset: schema's a11y.role is `group`, which isn't in RN's legacy `accessibilityRole` union — used the RN ≥0.74 `role="group"` prop instead (same pattern Landmark.tsx already uses for web-only ARIA roles).
- Fieldset: no `disabledOpacity` binding is listed in the schema's styles/overrides tables (unlike RadioGroup/Input), so `opacity.disabled` is applied as a fixed, non-overridable token rather than through `overrides`.

## 2026-09-10 18:01 — round 1

- Fieldset: FieldsetContext (legend + disabled) is provided as the spec directs and Input now reads it (accessibilityLabel prefixing + disabled fold-in), but Checkbox, Switch and RadioGroup still don't consume useFieldsetContext (out of scope — only Fieldset.tsx was touched this round), so the 'legend, field' accessibilityLabel prefixing and context-based disabled only take effect for Input today; the direct-child clone-with-disabled fallback still covers the other three.
- Fieldset: schema's requiredIndicator rule ('appended when every field inside is required') is implemented via React.Children.toArray + checking props.required on direct element children only; a consumer-supplied wrapper (e.g. their own View around a field) hides that field from the check.
- Fieldset: a11y.role is `group`, not present in RN's legacy accessibilityRole union, so `role="group"` (RN >= 0.74) is used instead, per the platform notes.

## 2026-09-10 21:00 — round 1

- Fieldset: platforms.rn.props lists `accessibilityRole` as a prop the schema cares about, but the Behavior section explicitly overrides this with `role="group"` (RN ≥ 0.74) for the group semantics. Resolved in favor of the explicit Behavior instruction — `accessibilityRole` is not set, only `role`.
- Fieldset: the `disabled` fallback (cloning direct children with `disabled: true` until Input/Checkbox/Switch/RadioGroup read FieldsetContext themselves) assumes every direct child accepts a `disabled` prop. The spec only anticipates field components as direct children, but nothing prevents a consumer from nesting a plain View/Text directly — cloning silently no-ops for those rather than erroring, which is a reasonable but unstated choice.
- Fieldset: the spec acknowledges accessibilityState.invalid has no native equivalent, so the group's error state is only conveyed by a one-time announcement (iOS) / assertive live region (Android) plus the visible error Text — a user who tabs into the group after the announcement has passed gets no persistent 'invalid' signal beyond reading the error text itself. Implemented as specified; flagging since it's a real (accepted) accessibility gap versus the web platform's aria-invalid.

## 2026-09-16 05:32 — round 1

- Fieldset: platforms.rn.props lists `accessibilityRole`, but the Behavior guidance says to use the `role="group"` prop rather than the legacy accessibilityRole; chose `role="group"` and did not set accessibilityRole.
- Fieldset: the Behavior guidance says to clone direct children with `disabled` 'until a field reads the context', but Input, Checkbox, Switch and RadioGroup in the rn package already read FieldsetContext; kept the clone fallback because the doc still describes it, but the doc should say whether it can be removed now.
- Fieldset: `description` is 'linked with aria-describedby' on web; on native I mapped it to the group's `accessibilityHint` (listed in rn props), which the doc does not state explicitly.
- Fieldset: the `description` and `error` parts have no bindings saying which Text size to use; `helperSize` (font.size.sm) and `errorText` (color.foreground.danger) have no `part`. Chose Text size=sm with tone muted for the description and tone danger for the errorMessage, and applied helperSize to both.
- Fieldset: `fontFamily` and `lineHeight` have no part; applied them as Text overrides on legend, description and error.
- Fieldset: `partGap` is described as the 'vertical gap between legend, description, fields and error' with no part; applied as the root View's `gap`.
- Fieldset: the anatomy names `fields` as the composed Stack, but Stack's testID is fixed at "Stack" and Stack takes no testID prop, and Text takes no testID either; wrapped the legend, description and fields in plain Views carrying `Fieldset.<part>` testIDs, the same way Checkbox does.
- Fieldset: the doc does not say whether `requiredIndicator` belongs in the group's accessibilityLabel as well as the visible legend; I added it to both.
- Fieldset: the examples give `children` as prose ('Street and city Inputs.', 'Email, SMS and Push Checkboxes.'), which can't be passed as args; example stories pass the other given props as args and build the children in `render` with Input/Checkbox.
- Fieldset: the scenario `a-disabled-group-is-marked-disabled` is web-only; RN still sets accessibilityState.disabled on the group, but a View that is not accessible exposes no state, so there is no test for it on rn. `has-accessible-name` is checked with toHaveAccessibleName on the group view.
- Fieldset: the schema requires `label-association`, and the doc's only native answer is the legend prefix inside each field's accessibilityLabel through FieldsetContext; a non-field child such as a plain Text gets no association, and the doc doesn't say whether that's acceptable.
