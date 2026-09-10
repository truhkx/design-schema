# Gaps reported while generating Landmark for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:58 — round 1

- Landmark (lit): the schema's anatomy list names a single `region` part, but the platform notes mandate no shadow root (host itself is the landmark, children stay in light DOM), so there is no shadow tree to carry a `part="region"` hook. Used the host-level `data-ds="Landmark"` attribute as the only testability hook, consistent with components that do have shadow roots.
- Landmark (lit): `as` is documented as web-only in the schema, so it was correctly omitted from the Lit element entirely — no attribute or property for it.

## 2026-09-10 17:45 — round 1

- Landmark (lit): the platform notes literally say to set the accessible name via `internals.ariaLabel`, but the package-wide convention states ElementInternals.ariaLabel/role are not read by the dom-accessibility-api-based test tooling, only real attributes are. The existing generated file used `internals.role`/`internals.ariaLabel` exclusively, which would fail the 'has-accessible-name' scenario since `label` was never reflected to a plain `aria-label` attribute. Fixed by dropping ElementInternals entirely and reflecting `label` straight to the `aria-label` attribute (role was already a plain reflected attribute); updated the stories file to bind `.label=${args.label}` (property) and `aria-label="..."` (static markup) instead of a plain `label=` attribute, which no longer maps to the property now that its observed attribute is `aria-label`.
