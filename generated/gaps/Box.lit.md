# Gaps reported while generating Box for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 20:35 — round 1

- overrides/TokenRef: Box is the first component in the package to implement the per-instance overrides contract described in the package conventions (not yet used by any existing component); @design-schema/tokens is currently only a devDependency of @design-schema/lit, so importing cssVar/TokenRef at runtime relies on that existing workspace link rather than a new dependency — flagging in case the convention expects it promoted to a real dependency.
- surface: none has no background token (color.background.{surface} only defines default/subtle/strong); I set the --ds-box-background override hook to the literal 'transparent' for that case rather than a token, since none is untokenized by design.
- element -> role mapping: the spec says sectioning values 'map to their implicit roles' without naming them; I used the standard HTML implicit ARIA roles (article, aside->complementary, header->banner, footer->contentinfo, main, nav->navigation) via ElementInternals.role.
- All 33 scenarios in the doc are `derived: props.*`/`a11y.role` and assert only `renders: true`, so no scenario exercises the `overrides` property, the `border` boolean's visual effect, or the element->role mapping — those paths are implemented per the platform notes but have no behavior-scenario test coverage; rendered exactly as specified rather than inventing new scenarios.

## 2026-09-09 21:41 — round 2

- checkbox.md / switch.md: `parse` gate fails on frontmatter schema validation (unexpected 'behavior' property) — this is unrelated to Box and lives under site/, which I'm not permitted to edit; needs to be fixed by the docs-generation pass, not the Lit generator.

## 2026-09-09 21:42 — round 3

- checkbox.md / switch.md: `parse` gate fails on frontmatter schema validation (unexpected 'behavior' property) — unrelated to Box, lives under site/ which is out of scope for the Lit generator; needs the docs-generation pass to remove/schema-allow that field.

## 2026-09-09 22:17 — round 1

- Box: none of the existing Lit components (including Box) had the data-ds testability hook the digest requires; added `connectedCallback` setting `data-ds="Box"` since I was touching this file — worth rolling the same hook out to the other Lit components (Card, Container, Switch, etc.) in a follow-up pass.

## 2026-09-10 00:49 — round 1

- Box: `element` prop has no visible effect on the shadow DOM (per platform notes, only sets a role for sectioning values via ElementInternals) — kept `div`/`section` role-less as the spec directs, but a11y.role: none combined with sectioning `element` values creates an implicit contradiction (top-level a11y says role: none, platform notes say sectioning values do set a role); chose platform notes since they're more specific.
- Box: spec doesn't say whether `insetBlock`/`insetInline` should fall back to `inset` when unset or be fully independent optional attributes; implemented as optional (undefined) reflected attributes so CSS cascade order (inset rule before axis-override rule) does the `inset` fallback naturally — no explicit default given for insetBlock/insetInline in schema.

## 2026-09-16 02:45 — round 1

- Box: `background` is `locked: true` in styles, but the overrides preamble says every style binding becomes a `--ds-box-*` hook. Followed Card's precedent — no hook at all for a locked binding, background written straight from `color.background.{surface}` per reflected attribute, and `background` removed from `BoxOverridableBinding`. That is a breaking change against the previously generated Lit Box, which did export it as overridable.
- Box: the anatomy part `surface` has no element to land on in Lit — the platform note makes the host the box and the shadow root only a `<slot>`, and `:host` cannot carry a `part`. Chose to set `data-part="surface"` on the host in `connectedCallback` next to `data-ds`, and exposed no `::part`. The doc should say where the anatomy name lives when the host is the part.
- Box: the presence rule names `surface: none`, `border: false` and `radius: none` as making overrides no-ops but is silent on `inset: none`, where Stack's doc does gate `gap: none`. Chose to keep `paddingBlock`/`paddingInline` always in effect (`layout.inset.none` is a real token, unlike `surface: none` which renders no background), so only `border`/`borderWidth` and `radius` are gated.
- Box: `element`'s implicit-role mapping is described as 'their implicit roles' without a table. Chose article→article, aside→complementary, header→banner, footer→contentinfo, main→main, nav→navigation. Natively `header`/`footer` lose banner/contentinfo when scoped inside sectioning content; the element cannot know its ancestry, so a nested `<ds-box element="header">` announces as a banner where a native `<header>` would not. The doc should either say to map header/footer unconditionally or say to omit them.
- Box: `insetBlock`/`insetInline` have no declared default. Chose `undefined` (attribute absent, so the `inset` rules apply) and ordered the `[inset-block]`/`[inset-inline]` rules after the `[inset]` rules so the axis wins, matching the web note's 'axis modifiers are declared after the all-sides modifier'.
- Box: the two written scenarios (`nav-element-carries-navigation-semantics`, `article-element-carries-article-semantics`) are scoped `platforms: [web]`, yet the lit note requires the same roles via ElementInternals — so nothing in the Lit suite asserts the role mapping; the 8 element scenarios only assert 'renders'. Separately, the doc's derived scenario names (`renders-inset-block-none`) do not match what the generator emits (`renders-insetblock-none`).
- Box: the prop `border` (boolean presence) and the style binding `border` (the `color.border` value, overridable) share one name, so `overrides.border` reads as if it toggled the border rather than recoloring it. Kept both names verbatim per the schema rather than renaming locally.
- Box: `a11y.requires: contrast-aa` lists six foreground/background pairs, but Box never sets a foreground colour — text colour comes from the slotted children. Nothing is implementable in the element; the pairs are only a build-time token check, which the doc could state.

## 2026-09-17 04:05 — round 1

- Box: the lit platform note says `element` sets the role through ElementInternals, but the package convention says roles that tests must read go on the host as plain attributes, because dom-accessibility-api doesn't read ElementInternals.role. I followed the platform note, so a test of accessible roles for `nav`/`article` would not see navigation/article on Lit. The doc should say which rule wins for Box.
- Box: the behavior prose says `section`, `article`, `aside` and `nav` carry their semantics natively, but the lit note leaves `section` without a role and adds `main`. I followed the lit note: article, aside→complementary, main, nav→navigation.
- Box: web and Lit say `surface: none` sets no background, but the background style description says `none` renders the literal `transparent`. I wrote `--ds-box-background: transparent` so every binding is set explicitly. The two statements should agree.
- Box: examples pass `children` as a string, but on Lit that is slotted content and `HTMLElement.children` is read-only. The stories render it inside `<ds-text>` and the test sets it as textContent. The doc doesn't say whether that text should be wrapped in Text on Lit.
- Box: `element` isn't in `platforms.lit.reflect`, so I didn't reflect it and it is a plain String property. The doc doesn't say whether a consumer can set it by attribute alone; it works because Lit maps the attribute to the property.
- Box: overrides don't apply when `radius` is `none` (overrides change values, not presence), but the paddingBlock description says padding overrides do apply at `none`. The doc doesn't say whether `radius: none` also counts as a real token that an override should restyle. I treated radius `none` as absent, so the radius override is ignored there.

## 2026-09-18 17:05 — round 1

- Box: the Guidance 'Behavior' section says Lit sets an ElementInternals role for the unconditional sectioning values, but platforms.lit.notes says a plain `role` attribute on the host and not ElementInternals. I followed the platform note (plain attribute); the Behavior prose should be corrected.
- Box: the `radius` style description says `overrides.radius` is ignored at `none`, but doesn't say whether consumer CSS on `--ds-box-radius` should also be ignored there, as the `background` description spells out for `surface: none`. I chose to not read the hook at `radius="none"` (it writes `var(--radius-none)` directly), so consumer CSS can't round a `none` box either.
- Box: `background` is locked, but the doc doesn't say what `--ds-box-background` defaults to when there's no surface attribute. I didn't give the hook a base default: it's set only per non-none surface value, and the base `background-color` is transparent.
- Box: the `renders` scenarios check the shadow root, but Box's shadow root is only a `<slot>`. The `renders: true` assertion (shadowRoot has children) passes trivially and tests none of the inset, surface or radius styling.
- Box: the `children` description says the Default story uses the `highlighted-panel` props, but doesn't say whether the scenario `given` builds on meta.args or on Default's own args. I put the example props on `Default.args` and the tests merge meta.args, then Default.args, then `given`.

## 2026-09-18 17:18 — round 2

- Box: none of the failures shown in either gate are Box's. keyboard-run lists only other components' specs, and generated/keyboard/ has no Box spec because the doc declares no `keyboard` block. The visible axe list is Tabs, TreeGrid and others, and test-results/*axe-lit*/error-context.md has no 'Box' entries. I left Box.ts, Box.stories.ts and Box.test.ts unchanged this round.
- Box: I could not confirm that Box passes axe. The pasted axe output is cut off at the front, so Box/Lit entries could have been there. My Box-only axe script (logs/box-axe.mjs, a scratch file outside the package) needed approval and never ran. The full axe-lit gate run and the Storybook server both stopped before finishing, so no Box/Lit axe result exists.
- Box: a11y.contrast lists foreground-on-subtle and foreground-on-strong pairs as a guarantee about the tokens. The story that wraps `children` in `<ds-text>` on `surface: strong` in dark mode relies on those token pairs being checked by the build, and Box can't enforce them at runtime. If axe reports color-contrast on a Box story, the fix is the token values in the theme doc, not the component.
- (report recovered after a second request)

## 2026-09-18 17:31 — round 3

- Box: neither failing gate names Box. logs/playwright.json (the full axe-lit report, which the pasted console output cuts off) has no Box/Lit violation or render error in light or dark mode. keyboard-run has no Box spec because the doc declares no `keyboard` block. I made no code change. The gates fail on other Lit components (DataGrid, Feed, Tabs, TreeGrid for axe; Combobox, Select, Tabs, Tree and others for keyboard-run), and fixing Box cannot turn them green.
- Box: the per-component gate report hands Box the whole package's axe and keyboard-run results without filtering them to Box's stories and specs. So a component with no violations of its own gets sent back for retries it cannot resolve. The gate output should be filtered by story title (`Box/Lit`) and spec file (`generated/keyboard/Box.lit.spec.ts`) before a regeneration round is triggered.

## 2026-09-19 07:49 — round 1

- Box: the React stories put the highlighted-panel props in the meta args, so BorderedRow, HeroBand and NavigationRegion also get surface subtle and radius md. That breaks the doc's rule that each example keeps exactly its given, and conflicts with the rule that Lit stories have the same args as React. For Lit I followed the doc: meta args are the schema defaults, Default is the highlighted panel, and the one-value stories add Default's args so they still match React. The three example stories differ from React until React moves the panel props to its Default story.
- Box: the doc says one meta render wraps only string children in a Text. On Lit the children arg is always a string (slotted content can't be an arg), so the render always wraps it in <ds-text>. A conditional would also make the template harder for tools/docs_snippets.ts to read.
- Box: the derived 'renders' scenarios only say renders: true. On Lit, where the host is the box and the shadow root holds only a <slot>, the tests check that the shadow root has at least one child element. The doc doesn't say what 'renders' should mean for a host-is-the-element component.
- Box: the Lit notes say element is 'set by attribute or property'. They don't say what happens when a consumer also sets their own role attribute on the host. The current code replaces or removes it whenever element changes.

## 2026-09-19 07:57 — round 2

- Box: the axe and keyboard-run gates run over the whole Lit Storybook, so a Box job fails on other components' violations. All 38 Box/Lit stories pass axe in light and dark mode, and Box has no keyboard block. Every listed failure belongs to another component (Tabs dark-mode contrast; TreeGrid aria-hidden-focus and target-size; the keyboard models of Combobox, DatePicker, Dialog, Feed, Listbox, Menu, Popover, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Tabs, Toast, Toolbar, Tooltip and Tree). The gate needs to limit its pass/fail to the component being generated, or compare against a baseline.
- Box: carried from round 1 — the React Box meta args hold the highlighted-panel props, so React's BorderedRow, HeroBand and NavigationRegion carry more than their given. The Lit stories follow the doc (meta args are the schema defaults and Default is the highlighted panel), so those three example stories have different args from React until React changes.

## 2026-09-19 08:05 — round 3

- Box: rounds 2 and 3 failed only on other components' axe and keyboard failures (Tabs dark-mode color-contrast; TreeGrid aria-hidden-focus and target-size; the keyboard specs of Combobox, DatePicker, Dialog, Feed, Listbox, Menu, Popover, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Tabs, Toast, Toolbar, Tooltip and Tree). Box has no keyboard spec, and all 38 Box/Lit stories pass axe in both modes, so no change to Box can pass these gates. The gates should only fail a job for failures in the component being generated, or compare against a known baseline; otherwise every component job keeps failing until those components are fixed.
- Box: carried from round 1 — the React meta args hold the highlighted-panel props, so React's BorderedRow, HeroBand and NavigationRegion carry args beyond their given. Lit follows the doc: meta args are the schema defaults and Default is the highlighted panel.

## 2026-09-23 13:47 — round 1

- Box: the doc requires a `WithOverrides` story, but `packages/react/src/Box.stories.tsx` doesn't export one. Lit now has a story React lacks, which breaks the story-parity rule the other way; the React story needs regenerating, and the doc gives no args for it. I chose `border: true` over Default's args, with overrides for paddingBlock, border, borderWidth and radius, so each one is in effect.
- Box: the Lit note says Box 'removes only a role it wrote itself' but doesn't say what happens when a consumer `role` is already on the host and `element` changes to article, aside, main or nav. I let `element` overwrite it, and the consumer's value is gone after that. The doc should say whether a consumer role wins over `element`.
- Box: the doc describes a meta render that 'wraps only string children in a Text', but on Lit `children` is always a string arg because slotted content can't be an arg. So the Lit render always wraps the arg in `<ds-text>`, and there is no non-string case.
- Box: per-value stories (InsetSm, ElementNav, ...) spread Default's highlighted-panel args and then vary one prop, matching React. The doc only fixes the args of the example stories, so the base args for per-value stories are unspecified.
