# Gaps reported while generating Container for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 21:07 — round 1

- Container: the `gutter: narrow`/`wide` values have no explicit spec statement on whether they're fixed or also responsive; I treated only `default` as responsive (per its own description) and made `narrow`/`wide` static single values, since giving every gutter value the same three-tier responsive behavior would make the enum redundant.
- Container: `width: full` and `gutter: none` have no 'no-op' token, so I omit the CSS custom-property hook entirely for those modifier classes and let the property fall back to the literal `none` (max-inline-size) / `0` (padding-inline), mirroring Box's `surface: none` pattern — not stated explicitly in the schema but consistent with the codebase convention.
- Container: `element` is web/lit-only per platforms metadata, so no RN handling was needed; not a gap, just confirming the field was read correctly.
- Container: no dev-only warnings were specified or obviously needed (unlike Card's single-interactive-child check), so none were added.

## 2026-09-09 21:08 — round 2

- build gate `parse`: fails on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema) — unrelated to Container, which parses without error. This is a pre-existing docs/schema mismatch outside the React generator's scope (site/ and schema/ are off-limits here); it needs to be fixed by editing checkbox.md/switch.md frontmatter or the schema itself in the separate docs-fixing pass, not in packages/react.

## 2026-09-09 21:08 — round 3

- build gate `parse`: still fails only on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema) — confirmed unchanged from round 2, and container.md continues to parse without error. This is a pre-existing docs/schema mismatch unrelated to Container and outside the React generator's editable scope (site/ and schema/); no change to packages/react/src/Container.* can affect this gate's outcome. Needs a fix to checkbox.md/switch.md frontmatter or the schema's allowed properties in the separate docs-fixing pass.

## 2026-09-09 21:53 — round 1

- Container: no changes were needed — the existing implementation already matched the spec exactly (props, tokens, media-query literals verified against the built token file at 960px/1280px, override contract, index.ts export).
- Container: found an existing Container.test.tsx in the tree, which conflicts with my stored memory that only Switch has tests and the other 75 test targets are intentionally deferred pending user decision — left it untouched since generating/modifying tests wasn't requested, but this may mean that decision has since changed.
- Container (package-wide): none of the existing components implement the `data-ds="<Name>"` root testability hook the generation instructions call for; since the digest/conventions doc doesn't mention it and no sibling component has it, I did not add it to Container alone to avoid inconsistency — flagging for a package-wide decision instead.

## 2026-09-09 21:54 — round 2

- Container: the reported `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Container and to the React package entirely — those files live under site/src/content/docs/components/, which the docs-fix pass owns and I'm instructed not to edit. Container's own files parse and lint clean (verified with tools/parse.py and tools/lint_literals.py). No code change was made; this needs to be routed to whatever pass generates checkbox.md/switch.md frontmatter (likely a stray 'behavior' key added to their schemas that isn't in the component JSON Schema).

## 2026-09-09 21:54 — round 3

- Container: identical to Round 2 — the `parse` gate failure is still exclusively about checkbox.md and switch.md frontmatter ('behavior' property not allowed by the component schema), files under site/src/content/docs/components/ that I'm instructed not to edit. This is unrelated to Container or the React/web package; re-verified Container.tsx/Container.css independently pass tools/lint_literals.py and tools/parse.py reports no error for container.md. Since the same report recurred unchanged, flagging that whatever is meant to clear checkbox.md/switch.md's stray 'behavior' frontmatter key (or the schema itself) hasn't run yet — this needs to be fixed at the docs/schema layer, not in packages/react.

## 2026-09-09 22:23 — round 1

- Container.tsx, Container.css, Container.stories.tsx, and the index.ts export already existed and matched the spec; the only deviation was a missing data-ds="Container" testability hook on the root element, which I added. No ambiguity in the schema itself required a judgment call.

## 2026-09-10 01:19 — round 1

- Container: default paddingInline hook is only set per gutter modifier class (not on .ds-container base), consistent with other interpolated bindings in the package — chose to leave it unset at base so 'none' truly renders 0 with no fallback token flash.
- Container: overridable maxWidth hook has no effect for width:full since no modifier class sets it — treated as correct per the spec's 'overrides are no-ops where the binding is not in effect' rule.

## 2026-09-10 17:32 — round 1

- Container: schema doesn't specify whether `align: start` clears margin-inline entirely or just the inline-start side; chose margin-inline: 0 (both sides), matching Box/Card sibling-spacing convention.
- Container: `full` width intentionally emits no --ds-container-max-width hook (falls back to `none`) rather than a literal value, per the 'a resolved path ending in a no-op renders nothing' rule — worth confirming this is the intended reading for `width` (not just background/border/max-width bindings named in the general rule).

## 2026-09-16 04:18 — round 1

- Container: the breakpoint px values depend on the theme (calm-precise content/page = 960px/1280px, warm-sleek = 1040px/1387px), but the CSS is a single theme-independent file; I used the calm-precise values, the package's theme, so another theme's responsive gutter switches at the wrong widths.
- Container: the gutter.default description says 'narrow below content, default between, wide above page' but does not say which side a viewport exactly at the token width falls on; I used min-width media queries, so exactly 960px gets the base gutter and exactly 1280px gets the wide one.
- Container: layout.gutter.default resolves to --layout-gutter (the .default drop rule), and the web note names it, but the prop description only mentions the narrow and wide gutters for `default`; I used narrow → --layout-gutter → wide.
- Container: the anatomy names one part, `column`, but no binding names a `part`; I put data-part="column" on the root, since the column is the root.
- Container: the web platform block says `element: div` while the `element` prop allows main/section; I render the tag the prop chooses, with div as the default.
- Container: the example `given.children` values are prose descriptions ('A Stack of page regions') and not content; the stories pass them verbatim as string children, so ApplicationScreen shows no real Stack.
- Container: the `main-element-is-the-page-landmark` scenario says 'there must be exactly one', but a component can't enforce that across the page and the spec asks for no dev warning; the test only checks that one main role renders, and no warning is added.
- Container: the SwiftUI notes say gutters shrink below the *prose* width, while the web/RN notes key off the content and page widths; this is a cross-platform inconsistency I didn't act on for web.

## 2026-09-17 04:34 — round 1

- Container: the rule 'every example is a story with exactly its given as args' conflicts with the children description (a string children renders inside a Text); followed the children description and wrapped each example string in <Text element="p">, which makes the args differ from the literal given.
- Container: the spec doesn't say which Text element or variant should hold illustrative children; chose Text element="p" with defaults.
- Container: the 'renders' scenarios don't say what to assert on web; the tests check that the root element exists and nothing about styles (jsdom can't evaluate the media queries or custom properties).
- Container: the spec names no Default-story children; kept a single Text paragraph 'Container content.' as the Default arg, which isn't schema copy.
- Container: the spec doesn't say whether an override on gutter: default should also replace the value inside the media queries; the hook is set inline, which beats the class rules at every viewport, so it replaces the whole responsive gutter as the paddingInline description requires.

## 2026-09-19 13:23 — round 1

- Container: the Related section names Landmark and the `element` description says to use `main` 'when no Landmark wraps it', but nothing says whether Container should warn or change when `element: main` is inside a Landmark main; I chose no check and no warning, following the 'neither enforces it nor warns' clause.
- Container: the `main-element-is-the-page-landmark` scenario's `then: role: main` doesn't say whether it means 'exactly one main' or 'at least one'; the test asserts exactly one element with role main in the render.
- Container: the derived `renders` scenarios say nothing beyond `renders: true`, so for gutter/width/align/element they only assert that a root node exists; the spec gives no observable (class, computed max-inline-size, tag name) to assert per value, so jsdom can't check that the responsive gutter or the `full`/`none` literals apply.
- Container: `children` is declared `required: true` and typed `ReactNode`, which already allows `undefined`/`null`, so 'required' here only means the prop key must be present; I kept `children: ReactNode` (not optional).
