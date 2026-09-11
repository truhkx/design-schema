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
