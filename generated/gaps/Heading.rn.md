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
