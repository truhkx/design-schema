# Gaps reported while generating Box for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 20:38 — round 1

- Box: overrides contract has no precedent in this package (no existing RN component implements `overrides`/`TokenRef`/`resolveToken`), so I imported `TokenRef`/`resolveToken` directly from `@design-schema/tokens` (per the package-conventions digest) rather than from `./theme` (as the component prompt's Overrides section says) — `theme.tsx` doesn't export either symbol.
- Box: when `overrides.background` is set but `surface` is `none`, I chose to render the overridden background anyway (an explicit per-instance override wins over the surface default, including forcing a background where the enum alone would render none). The spec doesn't say whether an override should be able to introduce a background that the enum value suppressed.
- Box: when `border` is `false`, `overrides.border`/`overrides.borderWidth` are ignored (no borderWidth/borderColor styles at all) since there is no border to color. The spec doesn't state whether an override should be able to force a border into existence independent of the boolean prop.
- Box: `overrides.radius` always wins over the `radius` enum's resolved token, including when `radius` is `none` — same reasoning as background.

## 2026-09-09 21:42 — round 1

- Box.tsx, Box.stories.tsx, Box.test.tsx, and the index.ts export already existed from a prior pass and matched the spec; the only fix was adding the missing testID="Box" on the root View, which the package convention requires but the existing file lacked (Stack.tsx also lacks it, but Container.tsx has it — followed Container's precedent).

## 2026-09-09 21:43 — round 2

- parse gate failure is not caused by Box: checkbox.md and switch.md have a `behavior` frontmatter key (added during the behavior-scenarios rollout) that schema/component.schema.json does not yet permit ('Additional properties are not allowed (\'behavior\' was unexpected)'). Both files are under site/ and the schema is under schema/, which I'm barred from editing per instructions, and neither is the Box doc. Box's own code passes lint_literals and its test suite cleanly; this gate cannot be fixed from packages/rn without either updating the schema to allow `behavior` or removing it from those two docs, and that decision belongs to the separate docs-fixing pass, not this generation task.

## 2026-09-09 21:43 — round 3

- parse gate failure is unchanged from Round 2 and still not caused by Box: checkbox.md and switch.md carry a `behavior` frontmatter key (from the behavior-scenarios rollout) that schema/component.schema.json does not permit ('Additional properties are not allowed (\'behavior\' was unexpected)'). box.md itself parses without error. Both offending files live under site/ and the schema lives under schema/ — both off-limits per instructions, and neither belongs to Box. Re-verified packages/rn/src/Box.tsx independently: lint_literals --platform rn reports 0 findings and the test suite still passes 25/25. This conflict must be resolved by editing the schema or the two docs, which is outside this task's scope; no Box code change can make this gate pass.

## 2026-09-09 22:18 — round 1

- Box: file already existed with the override-precedence bug (background/radius overrides applied even when surface:none/radius:none disabled those bindings); fixed to match the explicit 'overrides never restore presence' rule, and updated WithOverrides story (was demoing a no-op override) to set surface:subtle/radius:sm so both overrides visibly take effect.

## 2026-09-10 17:17 — round 1

- Box: no a11y.requires and role: none, so RN has nothing to implement beyond the View styling — no ambiguity.
- Box: spec doesn't say whether border color is itself overridable separately from borderWidth; treated `border` override binding as the border color (colorBorder) and `borderWidth` as the width, consistent with the styles block listing both `border` (color.border) and `borderWidth` (border.width.thin) as separate overridable bindings.

## 2026-09-16 02:48 — round 1

- Box: anatomy lists one part, `surface`, which *is* the root view, so the root testID convention (`testID="Box"`) and the part convention (`testID="Box.surface"`) collide and RN allows only one testID per view. Chose the root form, `testID="Box"`; a test looking for `Box.surface` will not find it.
- Box: the overrides contract says a prop that turns a part off makes the matching override a no-op and enumerates `surface: none`, `border: false`, `radius: none` — but not `inset: none`/`insetBlock: none`/`insetInline: none`. Chose to apply `paddingBlock`/`paddingInline` overrides even at `none`, on the grounds that `layout.inset.none` is a real token (a zero value) rather than an absent part, unlike a missing background or border.
- Box: the interpolated-binding rule says an enum value of `none` renders nothing rather than a token for background/border/max-width bindings, and radius is not in that list, while `radius.none` does exist as a token. Chose to set `borderRadius: t.radiusNone` explicitly for `radius: none` (consistent with 'no cascade, every binding applied explicitly') rather than omitting the property.
- Box: the three examples give `children` as a bare string (`"A panel of settings"`), which crashes React Native — text must be inside a `Text`. Wrapped each example's children in the package's `<Text>`, so the stories' args are not literally the doc's values.
- Box: `element` is declared `platforms: [web, lit]` and the two doc behavior scenarios (`nav-element-carries-navigation-semantics`, `article-element-carries-article-semantics`) are scoped to web, so RN has no prop and no test for them. Documented in the component JSDoc that sectioning semantics have no RN counterpart and that Landmark is the component for a page region — the doc's guidance never states what an adopter should do when they port a `Box element="nav"` screen to native.
- Box: `a11y.contrast` requires body, muted and link foregrounds to pass AA on the `subtle` and `strong` surfaces, but RN has no cascade and Box sets no foreground token, so nothing in the component connects a child's text color to the surface it is on — the guarantee rests entirely on the build-time token check. The doc does not say whether Box should therefore provide a foreground context (the way `Text` provides `TextNestingContext`); chose not to add one, since that would be a new binding the schema does not declare.

## 2026-09-17 04:05 — round 1

- Box: the examples set `children` to a bare string, and the rn note says native needs it inside a Text; the stories wrap it in the package `Text`, so their args are not literally the example's `given`.
- Box: `radius: none` is written out as `radius.none`, but overrides turn it into a no-op because `none` turns the part off; the spec gives both rules without saying they combine, and I kept the token value and ignored the `radius` override when the prop is `none`.
- Box: `paddingBlock`/`paddingInline` overrides apply even when `inset` or the axis prop is `none` (the style description says so); the general 'overrides change values, never presence' paragraph lists `surface`, `border` and `radius` but not inset, so I followed the style description.
- Box: every behavior scenario is a `renders: true` check, so no test checks the resolved padding, background, border or radius, or the override precedence; the two `element` scenarios are web-only and have no rn test.
- Box: `resolveToken` returns a general token value, so the resolved override is cast to `number` for padding, width and radius and to `string` for the border colour; the spec doesn't say what type an override resolves to on rn.
