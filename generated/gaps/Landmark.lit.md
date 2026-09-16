# Gaps reported while generating Landmark for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:58 — round 1

- Landmark (lit): the schema's anatomy list names a single `region` part, but the platform notes mandate no shadow root (host itself is the landmark, children stay in light DOM), so there is no shadow tree to carry a `part="region"` hook. Used the host-level `data-ds="Landmark"` attribute as the only testability hook, consistent with components that do have shadow roots.
- Landmark (lit): `as` is documented as web-only in the schema, so it was correctly omitted from the Lit element entirely — no attribute or property for it.

## 2026-09-10 17:45 — round 1

- Landmark (lit): the platform notes literally say to set the accessible name via `internals.ariaLabel`, but the package-wide convention states ElementInternals.ariaLabel/role are not read by the dom-accessibility-api-based test tooling, only real attributes are. The existing generated file used `internals.role`/`internals.ariaLabel` exclusively, which would fail the 'has-accessible-name' scenario since `label` was never reflected to a plain `aria-label` attribute. Fixed by dropping ElementInternals entirely and reflecting `label` straight to the `aria-label` attribute (role was already a plain reflected attribute); updated the stories file to bind `.label=${args.label}` (property) and `aria-label="..."` (static markup) instead of a plain `label=` attribute, which no longer maps to the property now that its observed attribute is `aria-label`.

## 2026-09-16 05:14 — round 1

- Landmark: the lit platform notes in the schema say role and aria-label go on the host via ElementInternals, but the Guidance 'Lit' section and the package conventions say plain reflected `role`/`aria-label` attributes, because accessible-name tooling doesn't read ElementInternals; chose plain attributes (`landmark` property to `role` attribute, `label` to `aria-label`).
- Landmark: platforms.lit.reflect lists `role`, but the Lit property is `landmark`; read it as the `landmark` property reflecting to the `role` attribute.
- Landmark: `role` is required but has no default, and the doc doesn't say what the Default story renders; chose `role: main` with the page-main example's children, so `has-accessible-name` adds a label to a main landmark.
- Landmark: `children` is type content, but the Lit element has no shadow root and so no <slot>; children are ordinary light-DOM children, and the 'Parts and slots' contract to render each slot as <slot> can't apply. Stories render the string children inside <ds-text>.
- Landmark: the `region` anatomy part can't carry `data-part`/`part` because there is no shadow root; the host's `data-ds="Landmark"` is the only hook, as the Guidance says.
- Landmark: the doc doesn't say what happens with no role (the attribute is absent); the element warns in development and exposes no role.
- Landmark: the four doc-authored scenarios and the `banner-that-is-not-the-page-header` example are web-only (`as`), so no Lit test or story was written for them; the doc doesn't give a Lit example set that excludes them explicitly beyond `platforms: [web]`.
- Landmark: the 'Related' section names Stack and Heading, but the component has no visual bindings, so stories compose only Text for the children string; the previous stories' `gap="2"`/`gap="4"` weren't valid StackGap values and were removed.
