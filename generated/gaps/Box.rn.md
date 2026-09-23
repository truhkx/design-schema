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

## 2026-09-18 17:43 — round 1

- Box: the `background` binding's description says `surface: none` renders the literal transparent 'written out explicitly', but the Guidance 'React Native' note says `backgroundColor` is 'undefined for none'. I followed the binding (and the 'every binding is applied explicitly' rule) and wrote 'transparent'; the Guidance note should be changed to match.
- Box: `borderWidth`/`borderColor` are left unset when `border` is false. The spec says the border is presence-gated but doesn't say whether 'every binding applied explicitly' means writing `borderWidth: 0` there. I left them unset because RN has no cascade.
- Box: the Default story is the `highlighted-panel` props, and the `given` of every behavior scenario is layered on top of them, so `renders-radius-none` also has `inset: md` and `surface: subtle`. The scenarios only assert `renders`, so this is harmless, but the doc should confirm Default-plus-given is intended for a component whose schema defaults draw nothing.
- Box: `navigation-region` is limited to web/lit and `element` doesn't apply on RN, so there is no RN story for it. The two `element` behavior scenarios are also web/lit only and weren't in the RN scenario list.
- Box: the `a11y.requires` item `contrast-aa` needs no runtime code, because Box sets no foreground (the Accessibility section says the build checks the token pairs). Nothing was implemented for it.

## 2026-09-18 17:53 — round 2

- Box: no code change this round. The rn axe gate's failures are all in other components' stories (Toolbar, Tree, TreeGrid, Demo/Preferences, Demo/Profile settings, Demo/Sign in, Patterns/SettingsPage). The full gate log (logs/playwright.json) has no Box/React Native entry, and axe run on only the 30 Box stories, in both modes, found no violations. Because this gate runs axe over every story, one component's round can fail on another component's stories, so a Box regeneration can't clear it.

## 2026-09-18 17:59 — round 3

- Box: no code change. The rn axe gate's log (logs/playwright.json, written after the last Box edit) has no Box/React Native entry, and Box's 30 stories pass axe on their own in both modes. The failures come from Accordion, Button, Card, Carousel, Toolbar, Tree, TreeGrid, the Demo pages and Patterns/SettingsPage. Because the gate runs over every story in the package, a Box round can't pass it; the retry loop should only count failures under the regenerated component's own story titles.

## 2026-09-19 08:13 — round 1

- Box: `children` says one meta-level render wraps only string children in a Text, but the RN conventions only cover Storybook — they don't say whether behavior tests should use that meta render. Rendering <Box> directly with the Default story's string children throws on native, so the test calls `meta.render!(props, {} as never)`. The doc should say that RN tests render through the meta render.
- Box: `navigation-region` and both behavior scenarios are limited to web/Lit, so RN has no story or test for them and no replacement. I added nothing; the doc could say explicitly that RN has no counterpart and point to Landmark.
- Box: the meta `args` may list schema defaults such as `element: div`, but BoxProps on RN has no `element`, so the RN meta leaves it out. The doc's 'meta args may still list the schema defaults' should exclude props not declared for the platform.
- Box: the spec doesn't say whether the extra `Border` and `WithOverrides` stories are wanted (the story rule asks for one story per enum value plus notable states). I kept them from the previous generation because `border` is a boolean with no enum stories.

## 2026-09-19 08:19 — round 2

- Box: the axe-rn gate runs every React Native story in one test per mode and fails on other components' problems (aria-required-attr, nested-interactive, aria-required-children, target-size, color-contrast in Toolbar, Tree, TreeGrid, Listbox, Table, Select, Demo/Preferences and others). None of them are Box stories. A run limited to 'Box/React Native' (logs/box-axe.config.ts, same tags, same server) passes all 30 stories in light and dark. I changed no Box code; the gate should run per component, or Box's regeneration should not be judged on it.
- Box: carried over from round 1 — the doc should say that RN behavior tests render through the stories' meta render, because a bare string child inside a View throws on native.
- Box: carried over from round 1 — the `navigation-region` example and both element-semantics scenarios are web/Lit only, and RN has no stated counterpart; the doc could point to Landmark explicitly.
- Box: carried over from round 1 — 'meta args may still list the schema defaults (`element: div`)' should exclude props not declared for the platform; the RN meta leaves `element` out.
- Box: carried over from round 1 — it is unclear whether the extra `Border` and `WithOverrides` stories are wanted; I kept them.

## 2026-09-19 08:25 — round 3

- Box: round 3 has the same axe-rn failure list as round 2, and none of it is Box (Toolbar, Tree, TreeGrid, Listbox, Table, Select, Demo/Preferences, Patterns/SettingsPage and others). A run limited to 'Box/React Native' (logs/box-axe.config.ts, same tags and server) passes all 30 stories in light and dark again. I changed no Box code: no change to Box can make a gate that checks the whole Storybook pass, so the gate should check only the regenerated component's stories.
- Box: carried over — the doc should say that RN behavior tests render through the stories' meta render, because a bare string child inside a View throws on native.
- Box: carried over — the `navigation-region` example and both element-semantics scenarios are web/Lit only, and RN has no stated counterpart; the doc could point to Landmark explicitly.
- Box: carried over — 'meta args may still list the schema defaults (`element: div`)' should exclude props not declared for the platform; the RN meta leaves `element` out.
- Box: carried over — it is unclear whether the extra `Border` and `WithOverrides` stories are wanted; I kept them.

## 2026-09-23 13:42 — round 1

- Box: the doc says meta args may list only schema defaults, but `children` is required and has no default, while CSF needs a meta-level `children` for the enum stories (which have no example text). Kept `children: 'Box content'` in meta args; the example stories override it with their own `given`. The doc should say what placeholder children the non-example stories use.
- Box: 'one story per enum value' doesn't say whether those stories may add args to make the value visible (InsetSm at the defaults draws nothing because surface is none). The existing stories add `surface: 'subtle'` (and the other axis's inset for insetBlock/insetInline); only the example stories keep exactly their `given`. The doc should say whether that is allowed.
- Box: the `WithOverrides` story has no given args in the doc, so which bindings and tokens it shows (`paddingBlock: layout.inset.xl`, `radius: radius.lg`, `border: color.border.strong`, with `border: true` and `radius: sm` so the presence-gated overrides take effect) is the generator's choice. An example block for it would pin that down.
- Box: behavior scenarios render the Default args (surface subtle, radius md) with `given` on top, so `renders-surface-none` and `renders-radius-none` never show a Box at its schema defaults; the doc says this is intended, noted only because the derived names suggest otherwise.
- Box: the overrides are cast by binding type (`as number` for padding, width and radius, `as string` for the border colour), as the rn note says, but `TokenRef` isn't narrowed per binding: a colour token passed as `overrides.paddingBlock` typechecks and yields a string padding at runtime. The doc (or the tokens package) could narrow the ref type per binding.

## 2026-09-23 13:42 — round 1

- Box: `children` is required with no default, but the enum stories (InsetSm, SurfaceStrong, …) need a child. The doc gives none for them, so the meta args keep an illustrative `children: 'Box content'`. The doc should say what text non-example stories render.
- Box: the doc asks for one story per enum value but doesn't say whether that story's args are exactly the enum value. At the defaults (surface none, inset none) a Box draws nothing, so the existing stories add `surface: 'subtle'` / `inset: 'md'` (and the other padding axis `md` for the insetBlock/insetInline stories) to make the value visible. The doc should confirm or forbid these companion args.
- Box: the WithOverrides story's content isn't specified. The existing one overrides paddingBlock (layout.inset.xl), radius (radius.lg) and border (color.border.strong) on a bordered `radius: sm` box. The doc could name the override example it wants.
- Box: overrides are resolved with `resolveToken` and cast to the binding's type (number for padding/width/radius, string for border) as the rn note says. Nothing stops a caller passing a colour token to `paddingBlock`; the TokenRef type isn't narrowed per binding.
