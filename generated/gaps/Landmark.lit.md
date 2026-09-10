# Gaps reported while generating Landmark for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:58 — round 1

- Landmark (lit): the schema's anatomy list names a single `region` part, but the platform notes mandate no shadow root (host itself is the landmark, children stay in light DOM), so there is no shadow tree to carry a `part="region"` hook. Used the host-level `data-ds="Landmark"` attribute as the only testability hook, consistent with components that do have shadow roots.
- Landmark (lit): `as` is documented as web-only in the schema, so it was correctly omitted from the Lit element entirely — no attribute or property for it.
