# Gaps reported while generating Heading for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:45 — round 1

- Heading: the schema gives `size` no default and no per-level mapping table in `styles.fontSize` (just `font.size.{size}`); the platform notes and guidance supply the level→size defaults (1→4xl … 6→md) verbatim, so I kept the existing file's approach of setting the `--ds-heading-font-size` hook from `level` first and letting an explicit `size` attribute override it — an explicit size always wins.
- Heading: `color` is locked per the styles block, so it has no `--ds-heading-color` override hook (consistent with Card's locked `background`) — `.heading` reads `var(--color-foreground-strong)` directly with a comment noting it's excluded from `overrides`.
- Heading: the guidance's Lit platform note says to use `part="heading"` for `::part` restyling, but the generation rules forbid exposing `::part` for styling and mandate the `overrides` property/hook mechanism instead; I followed the stricter package convention (hooks + `overrides`) and kept `part="heading"` only as the anatomy/testability hook, not a supported restyling surface.

## 2026-09-10 00:45 — round 2

- Heading: no new gaps — the `literals` gate flagged `fontFamily: '--ds-heading-font-family'` as a font-stack literal because its regex matches any `fontFamily: <quote>` regardless of content; switched that one HOOKS entry to a template literal (backtick), matching the existing workaround already used in Text.ts for the same false positive.

## 2026-09-16 02:16 — round 1

- Heading: anatomy lists one part, `text`, but the Lit platform guidance says `part="heading" may remain on the inner element as an anatomy hook`. I followed the anatomy verbatim and render `part="text" data-part="text"`, which renames the part the shipped element exposed. The doc should pick one and say it in the anatomy.
- Heading: `level` is `required: true` with no default, but a custom element property always has a runtime value and the element must render something when the attribute is absent. I chose: no default, fall back to `<h2>`, and warn once per element under `import.meta.env.DEV`. The doc specifies neither the fallback element nor the warning — and the derived `renders` scenario (no `given`) exercises exactly that path.
- Heading: `size` has no schema default, only prose defaults per level (1→4xl … 6→md). I implemented it as `:host([level=…])` hook rules followed by `:host([size=…])` rules, so an explicit size wins on source order at equal specificity. The doc doesn't say whether the resolved default should be reflected back onto the `size` attribute — I do not reflect a computed size, so `size` is absent unless the consumer sets it, and `ds-heading[size]` selectors only match explicit sizes.
- Heading: `level` says "canonical values are strings; generated components also accept the number" but does not say what the accepted type is. I widened the property to `HeadingLevel | 1|2|3|4|5|6` and normalize with `String(value)`; the exported `HeadingLevel` union stays string-only, so the numeric form type-checks on the element but is not part of the exported type. No behavior scenario covers the numeric form.
- Heading: `align` is a prop with three values but has no entry in `styles`, so there is no token, no binding name, and no override hook for it. I applied a bare `text-align` on the part per reflected attribute. Either `align` needs a style binding in the schema or the rule that every visual effect comes from a binding does not hold here.
- Heading: a11y.requires lists `heading-hierarchy` and `contrast-aaa`, neither of which a single element can enforce — levels not skipping is a page-level property, and the AAA pair is guaranteed only by the locked `color.foreground.strong` / `color.background` tokens. Nothing in the element checks either; the gates have to.
- Heading: the component has no focusable content and a11y.requires lists neither `accessible-name` nor `focus-visible`, so I omitted `delegatesFocus: true` and any `:focus-visible` styling, against the blanket generation rules that ask for both. The rules should exempt non-interactive components.
- Heading: the platform note flags that headings inside a shadow root are invisible to some in-page outline tools, but prescribes no mitigation (no light-DOM rendering mode, no opt-out). I shipped the shadow-root heading as specified and did nothing about it.
- Heading: the content prop is `children`, but this package's story convention names the slot arg `text` (see Text.stories.ts). The three example stories therefore carry `text:` rather than `children:`, so their args do not match the examples' `given` keys verbatim.
- Heading: all 16 behavior scenarios are derived `renders: true`, and the two written scenarios only assert `role: heading`. Nothing asserts that `level: "3"` produces an `<h3>` specifically — the claim the component exists for — nor that `size` leaves the element alone.

## 2026-09-17 03:57 — round 1

- Heading: the Lit guidance section says `part="heading"` may remain on the inner element, but platforms.lit.notes says the inner element carries `part="text"`/`data-part="text"` — the anatomy name, not `heading`; followed the platform notes (`part="text"`), the guidance prose should be corrected.
- Heading: the Web guidance says `size` maps to font.size.* 'via a class or inline custom property', while the Lit contract is attribute selectors on reflected `level`/`size` setting `--ds-heading-font-size`; chose the attribute-selector hooks, with an explicit `[size]` rule declared after the `[level]` defaults so size wins at equal specificity.
- Heading: the doc says a missing `level` falls back to <h2> but says nothing about an out-of-range or non-numeric value (`level="7"`, `level="x"`); treated it like a missing level (renders <h2>, 3xl default size, one dev warning).
- Heading: the Lit notes say to warn once 'with the attribute absent', but don't say whether setting a valid level later and then removing it should warn again; chose once per element for the element's lifetime.
- Heading: `level` is `required` with no default, but TS `isolatedDeclarations` + accessors need a declared type; typed it `HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6` with a definite-assignment `!` so the number form the doc says is accepted type-checks — the doc doesn't say whether the exported `HeadingLevel` type itself should include the numbers.
- Heading: behavior scenarios `level-puts-the-heading-in-the-outline` and `size-does-not-change-the-outline` are marked `platforms: [web]` only, although the Lit element renders a real <h1>–<h6> and could assert role=heading in its shadow root; they are not in the Lit scenario list, so no Lit test asserts the heading role.

## 2026-09-18 13:55 — round 1

- Heading: the missing/invalid-level development warning is required ('one development warning per element for its lifetime') but the doc gives no copy string for it, so the wording is not verbatim doc copy; kept the existing message naming the received value and the <h2> fallback.
- Heading: the behavior scenarios' `then: role: heading` does not say which level the heading must expose; the test also asserts the element is <h3>/<h2> and that getByRole('heading', { level: 3 }) finds it, which goes beyond what the scenario states.
- Heading: `level` is required with no default, but a Lit accessor must hold a value or be typed `| undefined`; declared it `accessor level!: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6` and rely on the <h2> fallback at runtime. The doc could state what the Lit property holds before it is set.
- Heading: story naming for enum values that start with a digit is unspecified (`<Prop><Value>` gives `Size4xl`, `Size2xl`, `Level1`); kept that literal casing.

## 2026-09-18 14:05 — round 2

- Heading: no Heading code change in round 2. Neither failing gate points at Heading: there is no keyboard spec for Heading (the doc has no `keyboard` block), and the axe error-context files list no Heading/Lit story in light or dark. The failures belong to Combobox, DatePicker, Dialog, Feed, Listbox, Menu, Popover, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Tabs, Toast, Toolbar, Tooltip, Tree and TreeGrid, and need fixing in those components' jobs.
- Heading: the missing/invalid-level development warning is required ('one development warning per element for its lifetime') but the doc gives no copy string for it, so the wording is not verbatim doc copy; kept the existing message naming the received value and the <h2> fallback.
- Heading: the behavior scenarios' `then: role: heading` does not say which level the heading must expose; the test also asserts the element is <h3>/<h2> and that getByRole('heading', { level: 3 }) finds it, which goes beyond what the scenario states.
- Heading: `level` is required with no default, but a Lit accessor must hold a value or be typed `| undefined`; declared it `accessor level!: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6` and rely on the <h2> fallback at runtime. The doc could state what the Lit property holds before it is set.
- Heading: story naming for enum values that start with a digit is unspecified (`<Prop><Value>` gives `Size4xl`, `Size2xl`, `Level1`); kept that literal casing.

## 2026-09-18 14:16 — round 3

- Heading: no Heading code change in round 3; the gate output is identical to round 2 and no failure is in Heading. The axe reports list no Heading/Lit story, and TreeGrid's aria-hidden-focus nodes are its own aria-hidden expand ds-button, not the composed ds-heading caption. Heading has no keyboard block, so keyboard-run does not test it. The failures belong to Tabs, TreeGrid and the components in the keyboard list, and need their own jobs; the gate run does not separate them from pre-existing failures.
- Heading: the missing/invalid-level development warning is required ('one development warning per element for its lifetime') but the doc gives no copy string for it, so the wording is not verbatim doc copy; kept the existing message naming the received value and the <h2> fallback.
- Heading: the behavior scenarios' `then: role: heading` does not say which level the heading must expose; the test also asserts the element is <h3>/<h2> and that getByRole('heading', { level: 3 }) finds it, which goes beyond what the scenario states.
- Heading: `level` is required with no default, but a Lit accessor must hold a value or be typed `| undefined`; declared it `accessor level!: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6` and rely on the <h2> fallback at runtime. The doc could state what the Lit property holds before it is set.
- Heading: story naming for enum values that start with a digit is unspecified (`<Prop><Value>` gives `Size4xl`, `Size2xl`, `Level1`); kept that literal casing.

## 2026-09-19 05:42 — round 1

- Heading: the fallback warning must 'name the received value', but the doc gives only the out-of-range example (`level 7`). For an absent level on Lit (property `undefined`) I print `Heading: level undefined is not one of 1–6; rendering as level 2.`; the doc should say how a missing level is worded.
- Heading: 'a platform reuses Text's exported align type and mapping helper' — Lit's Text has no mapping helper (alignment is `:host([align])` attribute selectors), so Lit reuses only the `TextAlign` type and keeps its own three selectors. Dropping `HeadingAlign` from the Lit index is a breaking type-export removal the doc doesn't mention.
- Heading: 'one development warning per element for its lifetime' — Lit counts the warning per element instance, so an element that starts without a level and later receives `level="7"` warns only once, for the first bad value. The doc doesn't say whether a later, different invalid value should warn again; I chose not to.
- Heading: with `level` absent or invalid, the 3xl size comes from the `:host` default of `--ds-heading-font-size`, because no `[level]` selector matches; the doc says 'the 3xl default size everywhere' but doesn't say where Lit's fallback size lives.

## 2026-09-19 05:50 — round 2

- Heading: the keyboard-run and axe gates run over the whole Lit Storybook, and neither failure in this round involves Heading. There is no generated/keyboard/Heading spec (the doc has no keyboard block), and today's full axe run (logs/playwright.json, 2026-09-19T09:43Z) has no Heading/Lit/ entries. The failures are other components' existing problems (Tabs dark-mode color-contrast; TreeGrid aria-hidden-focus and target-size; keyboard rules for Combobox, Select, Tabs, Tree, Toast and others). A Heading-only axe run with the AAA tags (logs/heading-axe.spec.ts) is 38/38 clean in light and dark. Heading code is unchanged this round: a component-scoped fix cannot turn these gates green, and they should be scoped to the component being generated or re-baselined.

## 2026-09-19 05:57 — round 3

- Heading: round 3 got the same keyboard-run and axe output as round 2, and neither involves Heading. The latest full run (logs/playwright.json, 2026-09-19T09:51Z) has no Heading/Lit/ entries, there is no generated/keyboard/Heading spec because the doc has no keyboard block, and a Heading-only axe run including the AAA tags (logs/heading-axe.spec.ts) has no violations in any of the 19 stories, light or dark. The failures belong to Tabs, TreeGrid, Combobox, Select, SegmentedControl, Tree, Toast and other components. No Heading change can clear them, so repeating the round won't converge until the gates run only the component being generated or are re-baselined.

## 2026-09-23 13:44 — round 1

- Heading: the lit conventions say a locked binding keeps its `:host` hook, but the doc's `color` description says there is no `--ds-heading-color` hook and the rule reads `var(--color-foreground-strong)` directly; I followed the component doc (no hook).
- Heading: platforms.web.notes says 'on web and Lit one element takes both hooks' (data-ds and data-part="text"), but on Lit data-ds must be on the host while platforms.lit.notes puts part/data-part="text" on the inner <hN>; I followed the lit notes (data-ds on the host, data-part on the inner heading).
- Heading: `level` reflects with `type: String`, so a numeric property value (`.level = 4`) reflects as the attribute `"4"` while the property keeps the number 4; the doc does not say whether the property should be normalised to the canonical string, so I left it as set.
- Heading: the doc says the Default story has level 2, 'Account settings' and 'no other args', while `align` has a doc default of `start`; the Default args omit align (the element's own default applies and reflects `align="start"`).

## 2026-09-23 13:45 — round 2

- Heading: the `color` binding's description says it 'has no `--ds-heading-color` hook: the rule reads `var(--color-foreground-strong)` directly', which contradicts the Overrides contract, the lit conventions and the hooks gate (a locked binding leaves the overrides type but keeps its `:host` hook). I declared `--ds-heading-color: var(--color-foreground-strong)` on `:host` and made the rule read it; `color` stays out of `HeadingOverridableBinding`. The doc sentence should be rewritten to say the hook exists but `overrides` cannot reach it.
- Heading: platforms.web.notes says 'on web and Lit one element takes both hooks' (data-ds and data-part="text"), but on Lit data-ds must be on the host while platforms.lit.notes puts part/data-part="text" on the inner <hN>; I followed the lit notes (data-ds on the host, data-part on the inner heading).
- Heading: `level` reflects with `type: String`, so a numeric property value (`.level = 4`) reflects as the attribute `"4"` while the property keeps the number 4; the doc does not say whether the property should be normalised to the canonical string, so I left it as set.
- Heading: the doc says the Default story has level 2, 'Account settings' and 'no other args', while `align` has a doc default of `start`; the Default args omit align (the element's own default applies and reflects `align="start"`).

## 2026-09-23 18:53 — round 1

- Heading: the `color` style binding's description says the locked colour has no `--ds-heading-color` hook and the rule reads `var(--color-foreground-strong)` directly, but the Overrides section and the Lit conventions say a locked binding keeps its `:host` hook. I kept `--ds-heading-color` because the existing element and the naming codemod rely on it. The doc should drop one of the two statements.
- Heading: the doc says `level` is required, but Lit has no required-attribute concept and holds `undefined` until set. The stories and tests type `level` as required and the element falls back to h2, which matches the doc's prose. Nothing else was ambiguous.

## 2026-09-23 20:06 — round 1

- Heading: the spec says the fallback warning fires 'once per element whatever later values arrive' and, on Lit, is issued when `level` is absent. It does not say when that check runs. I run it in `willUpdate` on every update until the first warning, since an unset `level` never appears in `changed` on the first render.
- Heading: the `level` property type accepts numbers `1 | 2 | 3 | 4 | 5 | 6` alongside `HeadingLevel`, but `type: String` reflection of a number is not spelled out for Lit. I rely on Lit's String conversion writing `3` as `"3"`.
- Heading: `HeadingOverridableBinding` is exported from Heading.ts and index.ts, but the spec names no such type. I followed the naming pattern of the other components.
- Heading: the `overrides` value `space.0` (marginBlockEnd off) resolves through `cssVar` to `var(--space-0)`. The spec does not confirm that a `space.0` token exists, so I assumed it does.
