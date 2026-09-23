# Gaps reported while generating Heading for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:47 — round 1

- Heading: spec doesn't specify RN's marginBlockEnd style property name; used RN's `marginBottom` (the only equivalent RN TextStyle offers) to realize the `space.sm` margin-block-end token, same choice the pre-existing file had made.
- Heading: overrides prop, HeadingOverridableBinding type, and root testID="Heading" were listed as required package conventions but missing from the pre-existing Heading.tsx/index.ts; added them without changing any other existing behavior.
- Heading: no Heading.test.tsx existed for the 16 behavior scenarios; added one mirroring Text.test.tsx's setup()-from-Default-story-args pattern since the spec doesn't specify a different fixture strategy.

## 2026-09-16 02:19 — round 1

- Heading: Related names Text and the rules say compose it, but the package's Text cannot carry `accessibilityRole="header"`, has no 4xl/3xl/2xl sizes, has no marginBottom, and locks `color` — so Heading renders React Native's `Text` directly and re-declares the five typography bindings. Either Text's schema grows an accessibility/role surface and the heading size steps, or the doc should stop implying composition here.
- Heading: `size` has no `default` in the schema — only the prose 'Defaults per level: 1 → 4xl … 6 → md'. I encoded that table as LEVEL_SIZE. It belongs in the schema as a per-level default map, since three platforms are each parsing the same sentence.
- Heading: the two behavior scenarios in the doc (`level-puts-the-heading-in-the-outline`, `size-does-not-change-the-outline`) are marked `platforms: [web]`, so on React Native nothing asserts that the header trait is set at all — the 16 derived scenarios are pure `renders: true`. A scenario asserting `accessibilityRole="header"` on every level would be expressible here and is the one thing worth testing on this platform.
- Heading: anatomy declares a single part `text`, which is also the root. The convention gives the root `testID="Heading"` and a part `testID="Heading.text"`, and one element cannot have both. I used `testID="Heading"` only; the doc should say the part hook is dropped when a part is the root.
- Heading: `marginBlockEnd` is unconditional — there is no prop or context to suppress it on the last heading in a container, and no `marginBlockStart`, so a heading following a paragraph relies entirely on the parent's gap. If a caller wants it off they must override it to a zero-valued token, which the theme does not obviously expose.
- Heading: `align: start|end` has no logical `textAlign` on React Native, so I resolve it through `I18nManager.isRTL` at render time (shared `toTextAlign` from Text). A writing-direction change mid-session does not re-render the heading — same known limit as Text, undocumented in the schema.
- Heading: `a11y.requires` lists `contrast-aaa`, which is a token-choice guarantee with nothing to implement in code beyond keeping `color` locked to `color.foreground.strong`. It reads as an implementation requirement in the generation rules; it should be marked as checked by the contrast gate instead.
- Heading: the overrides contract types every entry as `TokenRef`, so `overrides.fontSize` may name a color token. I cast `resolveToken` results to `number`/`string` per binding without validating, like every other component in the package — a per-binding TokenRef subtype would make this checkable.
- Heading: `level` accepts both '1' and 1 per the rules, but the schema does not say which form the docs, stories or a naming/extension layer should treat as canonical beyond a prose 'Canonical values are strings'. I used strings in the stories and accept both in the type.

## 2026-09-17 03:58 — round 1

- Heading: the rule says a component exposing its root declares `ref?: Ref<ViewInstance>`, but the rn element is `Text`, so the ref is typed `React.Ref<TextInstance>`; the rule should say 'the root's instance type' without naming ViewInstance.
- Heading: the package digest shows `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but the helper's real signature is `toLineHeight(fontSize, multiplier)`; the code follows the helper, and the digest's argument order is wrong.
- Heading: the rn notes say Heading does not compose the system Text, but nothing says whether it should provide `TextStyleContext` so inline children (Icon, Link) match heading typography; the code provides it with the heading's fontSize/color and nested: true.
- Heading: the spec does not say what happens at runtime when `level` is missing or invalid on RN (Lit falls back to h2 and warns); `level` is required in the TypeScript type, so an untyped caller gets `LEVEL_SIZE[undefined]` and no size. There is no fallback or __DEV__ warning.
- Heading: both doc behavior scenarios (`level-puts-the-heading-in-the-outline`, `size-does-not-change-the-outline`) are web-only `role: heading` checks, so RN has no test that `accessibilityRole="header"` is set on every level/size; only derived `renders` tests exist.
- Heading: the Default story args (`level: '2'`, `children: 'Account settings'`) are not given by the spec; the scenarios build on Default's args, so the doc should declare them.

## 2026-09-18 14:27 — round 1

- Heading: the rn notes call the context `TextStyleContext ({ fontSize, color, nested: true })`, but the Heading doc does not say which module owns it; I imported the existing one from ./Text instead of declaring a new one.
- Heading: the fallback rule for an invalid `level` says 'one development warning per element for its lifetime' but does not give the wording, and there is no copy key for a dev warning; I wrote `Heading: level <value> is not one of 1–6; rendering as level 2.` via console.warn under __DEV__.
- Heading: the generic rules say to type a ref as `Ref<ViewInstance>`, but the rn notes say `Ref<TextInstance>`; I followed the notes, since the root is a Text.
- Heading: `align` has no style binding, and the doc does not say whether `textAlign` should also be exported for Heading; I reused Text's exported `TextAlign` type and `toTextAlign` helper rather than declaring a Heading-specific `HeadingAlign` type, so the public API has no HeadingAlign.
- Heading: marginBlockEnd maps to `marginBottom` on RN per the binding description; with `overrides={{ marginBlockEnd: 'space.0' }}` the spec does not say whether a margin of 0 should be omitted or written, so it is written as 0.
- Heading: the renders scenarios pass string levels only; the doc says generated components also accept the number, but no scenario or example covers a numeric level or the invalid-level fallback, so neither is tested.

## 2026-09-18 14:36 — round 2

- Heading: the axe gate failed on the whole React Native Storybook, but its full log (logs/playwright.json) has no violation or render error for any Heading/React Native story in light or dark; every failure is in Toolbar, Tree, TreeGrid, Demo/Preferences, Demo/Profile settings, Demo/Sign in or Patterns/SettingsPage. Heading was left unchanged, and the gate stays red until those components are fixed.
- Heading: the gate runs every story in the package and has no per-component filter, so one component's round cannot show that component passing; per-component results come only from reading the failure list.

## 2026-09-18 14:45 — round 3

- Heading: axe was re-run with the same result; this run's error-context.md files (light and dark) and logs/playwright.json have no violation or render error for any Heading/React Native story. Every failure is in Toolbar, Tree, TreeGrid, Demo/Preferences, Demo/Profile settings, Demo/Sign in or Patterns/SettingsPage. Heading was left unchanged, and no change to it can turn this gate green.
- Heading: the fix loop keeps handing Heading a gate that runs every story in the package, so another component's failure blocks this one's round indefinitely; the axe gate needs a per-component story filter, or the round should list only the failures from that component's own stories.

## 2026-09-19 06:05 — round 1

- Heading: the generator digest says `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but theme.tsx declares `toLineHeight(fontSize, multiplier)`; I followed the code (size first). The digest's argument order is wrong.
- Heading: the Rules section says 'Import tokens from @design-schema/tokens/<theme-id>/rn/light and /dark', but the package convention (and every existing component) reads tokens only through useTheme(); I kept useTheme() and imported no theme modules directly.
- Heading: the warning text puts the received value straight into the template (`level 7`), but the spec does not say how to render a non-string value (undefined, NaN, an object); I used String(level), so a missing level prints `level undefined`.
- Heading: 'one development warning per element for its lifetime' does not say whether a later valid→invalid change warns again; I warn at most once per mounted instance, whatever the later props.
- Heading: the per-platform tests for a numeric level and the fallback are asked for in prose, not written as scenarios, so their assertions (same fontSize as the string/level-2 form, console.warn called once with the exact message) are my choice.
- Heading: the Rules section's generic `accessibilityRole="header"` guidance and the RN digest's preference for the `role` prop (RN ≥ 0.87) disagree; platforms.rn.props names accessibilityRole=header and the scenarios assert that attribute, so I kept accessibilityRole and did not add role="heading".
- Heading: the stories have no story for the invalid-level fallback or a numeric level; the spec lists only enum, example and Default stories, so I added none.

## 2026-09-19 06:13 — round 2

- Heading: the axe gate checks the whole React Native Storybook, so it fails a Heading job on other components' existing violations. Missing required ARIA attributes: Checkbox, Combobox, Meter, RadioGroup, Select, Slider, Splitter, Switch, Toolbar, TreeGrid. Wrong or missing required children: Feed, Listbox, Stepper, Table, Tree. Nested controls: Card, Carousel, Switch, Toolbar. Colour contrast: Accordion, Tabs, Toast and the disabled states. Heading's own stories and Stack's (41 stories, light and dark) pass axe, and none of the 140 violating elements in stories that render Heading is a heading. I changed no code; the gate needs a per-component filter or those components fixed in their own jobs.
- Heading: react-native-web renders accessibilityRole="header" with no aria-level as an <h1>, so every native Heading shows up as h1 in the web Storybook whatever its level. axe's wcag tags don't flag it, but the spec says only that `level` 'maps only to typography' on rn; it doesn't say whether the web preview should pass aria-level. I kept the spec (no level) and didn't add aria-level.

## 2026-09-19 06:18 — round 3

- Heading: the axe gate checks the whole React Native Storybook and fails on other components' existing violations (Accordion, Card, Carousel, Checkbox, Combobox, DataGrid, Feed, Listbox, Meter, RadioGroup, Select, Slider, Splitter, Stepper, Switch, Table, Tabs, Toast, Toolbar, Tree, TreeGrid, the Preferences demo and the SettingsPage pattern). No failing story is a Heading or Stack story. The same axe rules pass on Heading and Stack stories alone (41 stories, light and dark, rerun this round), and none of the 140 failing elements in stories that render Heading is a heading. No code change can satisfy the gate from this job: those components need fixing in their own jobs, or the gate should filter to the component under generation (logs/heading-rn-axe.spec.ts shows the filter).
- Heading: react-native-web renders accessibilityRole="header" without aria-level as <h1>, so every native Heading is an h1 in the web Storybook whatever its level. The spec says level maps only to typography on rn and doesn't say whether the web preview should pass aria-level; I kept the spec and added none.

## 2026-09-23 13:40 — round 1

- Heading: the rn notes say 'the ref is Ref<TextInstance>', but the generic rule template says a component exposing its root declares Ref<ViewInstance>; the platform note wins, so the prop is React.Ref<TextInstance>. The template line should defer to platforms.rn when the root is a Text.
- Heading: the generic rule tells the generator to import tokens from @design-schema/tokens/<theme-id>/rn/light|dark, but the package digest (and every existing component) reads them through useTheme(); kept useTheme().
- Heading: 'The Default story renders level 2 with "Account settings" and no other args' — the existing meta also set align: 'start'; removed it so Default carries exactly level and children. The doc could say whether meta-level args count as the Default story's args (they do in CSF3), since the behavior tests take their base props from meta.args.
- Heading: the rule to mirror every accessibility prop as aria-* conflicts with the rn note 'no aria-level is passed'; Heading has no accessibilityState/Value/Label, so only accessibilityRole=header is set and no aria-* attribute is written. Worth stating in the doc that accessibilityRole alone needs no aria mirror (react-native-web maps it to role=heading).
- Heading: the deprecated-level warning dedupe — the doc specifies 'on web from an effect behind a ref guard'; on RN the same effect+ref pattern is used (the doc does not say which RN mechanism to use).

## 2026-09-23 13:40 — round 1

- Heading: the rules say every exported symbol carries an explicit type, and the doc says Heading reuses Text's `TextAlign`, but not whether Heading should also re-export `TextAlign`. I kept it exported only from Text (index.ts exports `HeadingLevel | HeadingOverridableBinding | HeadingProps | HeadingSize`).
- Heading: the generic rule says `accessible-name` → `accessibilityLabel` and to mirror accessibility props as `aria-*`, but Heading's children are its accessible name and it sets no label or state. So there is nothing to mirror, and `accessibilityRole` itself has no `aria-*` counterpart listed. I added none.
- Heading: the doc says the Default story has 'no other args', but the rules also ask for one story per enum value built from the Default args. `align` therefore stays unset in the story args and falls back to the component default `start`, so the `AlignStart` story repeats Default.
- Heading: the overrides for `fontWeight` and `lineHeight` take any `TokenRef`, and the component casts the resolved value to a number. A mistyped ref such as `fontWeight: 'color.foreground'` is not caught at compile time; the doc doesn't say whether `TokenRef` should be narrowed per binding.

## 2026-09-23 18:51 — round 1

- Heading: the spec covers everything I needed, so I made no changes. One small ambiguity: 'once per element for its lifetime' could be read as per mount or per instance, and I read it as per mounted instance, using a ref guard inside an effect.
- Heading: `overrides.fontSize`, `overrides.lineHeight` and `overrides.fontWeight` are resolved with `resolveToken` and cast to `number`. The spec doesn't say what to do if an override names a token of another type (for example a colour), so I did not guard against it.
