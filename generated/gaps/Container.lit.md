# Gaps reported while generating Container for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 21:11 — round 1

- Container: schema's a11y.role is 'none', but element='main' is described as 'the page's main column'; since a Lit custom element can't retag its host, I set ElementInternals.role='main' only for element=main (mirroring Box's SECTIONING_ROLES pattern) and left div/section with no role — matches the React implementation's prior gap note for this same ambiguity.
- Container: width='full' and gutter='none' have no token to map to, so I gave the --ds-container-max-width/--ds-container-padding-inline hooks explicit literal values (none / 0) for those enum members, following Box's convention of an explicit value per enum (including 'none') rather than omitting the CSS custom-property rule.
- Container: gutter='narrow'/'wide' are treated as fixed (non-responsive) values, only 'default' is responsive across the two breakpoints — the spec's gutter description ties responsiveness only to the 'default' value, consistent with the existing React Container implementation.
- Container: tests assert reflected attributes and shadow-root/slot presence rather than the ElementInternals role directly, since no existing Lit test in this package queries internals.role (Box/Card don't either) and jest-dom has no matcher for it in this setup.

## 2026-09-09 21:12 — round 2

- build gate `parse`: fails on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema) — unrelated to Container, which parses cleanly (25/25 other components pass, only these two error). This is a pre-existing docs/schema mismatch outside packages/lit's editable scope (site/, schema/, generated/ are off-limits here); it must be fixed by removing/reworking the `behavior` field in checkbox.md/switch.md frontmatter or by adding `behavior` to the allowed component schema properties, in the separate docs-fixing pass. No change to packages/lit/src/Container.* can affect this gate's outcome.

## 2026-09-09 21:12 — round 3

- build gate `parse`: still fails only on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema), confirmed unchanged from round 2 — container.md continues to parse without error and every other Container-relevant gate (contrast, literals, typecheck) passes. This is a pre-existing docs/schema mismatch outside packages/lit's editable scope (site/, schema/, generated/ are off-limits here); no change to packages/lit/src/Container.* can affect this gate's outcome. It needs a fix to checkbox.md/switch.md frontmatter (remove or rework the `behavior` field) or to the component frontmatter schema (allow `behavior`), applied in the separate docs-fixing pass.

## 2026-09-09 21:56 — round 2

- Container: the `parse` gate failure is caused by checkbox.md and switch.md frontmatter having a `behavior` block the component schema rejects (additionalProperties: false) — unrelated to Container's own doc or generated code, and out of scope for me to fix since it requires editing schema/component.schema.json or the two docs, which are off-limits. Container.ts/.stories.ts/.test.ts/index.ts are unchanged and were not the cause.

## 2026-09-09 21:56 — round 3

- Container: `parse` gate fails on checkbox.md/switch.md's `behavior` frontmatter field being rejected by schema/component.schema.json (additionalProperties: false) — this is a schema/docs mismatch unrelated to Container (container.md has no `behavior` field). Container's own files (Container.ts, Container.stories.ts, Container.test.ts, index.ts) are unchanged, already spec-compliant, and were not the cause in Round 2 either. This cannot be fixed from packages/lit/src; it requires editing schema/component.schema.json or the two docs, both out of scope for me. Repeating the same Container output will not clear this gate — it needs a schema/doc-side fix.

## 2026-09-09 22:24 — round 1

- Container was already fully implemented and exported; the only change made was adding the `data-ds="Container"` testability hook in `connectedCallback`, which had been omitted (Box and Card already had it, per the convention that older/untouched components may lack it).

## 2026-09-16 04:20 — round 1

- Container: the responsive-gutter breakpoints are 'read from the built token JSON', but they differ by theme (calm-precise: content 960px / page 1280px; warm-sleek and warm-friendly: 1040px / 1387px) and the doc doesn't say which theme's values to use. I used calm-precise's 960/1280 to match packages/react/src/Container.css, so under the warm themes the default gutter switches at the wrong widths.
- Container: the platform note says `element: main` sets an ElementInternals role, but the package convention says roles that tests must read go on the host as plain attributes, because dom-accessibility-api doesn't read ElementInternals. The main-element-is-the-page-landmark scenario is web-only, so Lit has no test for it. I followed the component note (ElementInternals.role = 'main'). The doc should say whether Lit should also set role="main" on the host.
- Container: the `children` example values are strings ('A Stack of page regions'), but the prop is `content`. The stories render them as text inside ds-text rather than building a real Stack of regions, and the test puts them in as slotted text because `children` can't be set as a property on an HTMLElement.
- Container: the scenarios for element div/main/section only check that the element renders; nothing checks that `section` adds no role and `div` adds nothing, so the rule that a section is a region only when named isn't tested.
- Container: the doc's 'Overrides change values, never presence' rule plus 'full renders the literal none with no hook' means an override set at width=full is silently ignored. I implemented it that way (hook bypassed for full and gutter none), but the doc doesn't say whether a dev warning should fire.
