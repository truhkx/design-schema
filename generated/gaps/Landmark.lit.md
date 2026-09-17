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

## 2026-09-17 05:22 — round 1

- Landmark: the Lit guidance writes `<ds-landmark role="navigation" label="Main">`, but the platform notes say `label` reflects to `aria-label`, so a `label` attribute does nothing. I mapped the property to the `aria-label` attribute (stories set `.label`); the doc example should use `aria-label="Main"`, or the doc should say `label` is property-only.
- Landmark: `label` 'reflects to aria-label', but banner/main/contentinfo must not render a label. Plain reflection can't do both, so `label` is not reflected: the element writes `aria-label` itself (omitted for those roles and for an empty string) and ignores its own write, so the `label` property keeps its value. The doc should say reflection is conditional.
- Landmark: only the missing-label and does-not-take-a-label warnings have copy. The no-role, duplicate-main and shared-or-missing-label warnings have none, so I wrote: `Landmark: no role is set, so no landmark is exposed.`, `Landmark: role "main" appears more than once in this document.`, `Landmark: two "<role>" landmarks share the label "<label>"; give each a distinct label.` / `... both lack a label; ...`. The doc should give the copy.
- Landmark: the duplicate scan counts `[data-ds="Landmark"]` peers by role, but the web Landmark only emits a `role` attribute sometimes (`<nav>`, `<main>` and `<aside>` have none), so a Lit scan of mixed output would miss them. I fall back to the element's implicit role by tag (header, nav, main, aside, footer, section, form). The doc should say how a peer's role is read.
- Landmark: the doc says a composite's `aria-labelledby` counts as a name for the warnings, but Lit has no `labelledBy` property and no Lit composite uses ds-landmark. I read an `aria-labelledby` attribute on the host (ids resolved in `getRootNode()`) with no new property; the doc should say whether Lit gets one.
- Landmark: 'warnings fire on mount or a change of role, label or element'. Lit has no element choice, and a change to the `aria-labelledby` attribute is not watched, so it does not re-run the warnings.
- Landmark: the examples say 'exactly its given as args', but the Default story sets label "Main", which would carry into `page-main` (role main) and trigger the does-not-take-a-label warning. PageMain and the banner/main/contentinfo role stories set `label: undefined`. The doc should say whether Default args carry into examples.
- Landmark: the derived `renders` / `renders-role-*` scenarios merge Default's label "Main" into banner/main/contentinfo, so those tests hit the does-not-take-a-label warning. They still pass; the doc could say whether derived scenarios should clear labels that aren't allowed.
- Landmark: the `an-overridden-element-still-carries-its-role` scenario and the `banner-that-is-not-the-page-header` example are web-only (`as`) and have no Lit test or story, since the Lit host is its own element. They are platform-scoped in the schema; no Lit equivalent is expected.
