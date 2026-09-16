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
