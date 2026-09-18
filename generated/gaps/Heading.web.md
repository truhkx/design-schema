# Gaps reported while generating Heading for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:44 — round 1

- Heading: pre-existing implementation predated the overrides/testability-hook conventions (no data-ds, no CSS custom-property hooks, no overrides prop, no test file). Brought it in line with current conventions rather than treating it as net-new: added overrides for fontFamily/fontWeight/fontSize/lineHeight/marginBlockEnd (color stays locked but still gets a hook, matching Card's pattern for locked bindings), and added Heading.test.tsx mirroring Text.test.tsx's per-scenario structure since the doc's Behavior scenarios section wasn't previously covered by a test file for this component.
- Heading: spec's Output section only asked for Heading.tsx + stories, but the Behavior scenarios section explicitly says to emit one test per scenario, and every sibling component in the current rollout (Text, Card, Box, Switch, Container) has a matching .test.tsx — added Heading.test.tsx on that basis rather than skip it.

## 2026-09-16 02:12 — round 1

- Heading: `size` has no machine-readable default — the per-level defaults (1→4xl … 6→md) exist only in the prose of the `size` description, so the SIZE_BY_LEVEL map is parsed out of an English sentence. Promote it to a `defaultBy: level` field or a per-level table in the schema.
- Heading: the anatomy is a single part `text` that *is* the root element, and the conventions don't say whether a root-only part gets a `data-part` hook. Card puts `data-part="surface"` on its root; Text (identical `anatomy: [text]`) has no `data-part` at all. Chose Card's reading and added `data-part="text"` to the root — Text is now the inconsistent one.
- Heading: the package conventions say `...rest` never forwards `className` or `style` to the root, but `Card.tsx:167` passes `className="ds-card__heading"` to Heading and `Dialog`/`SidePanel`/`Popover` compose it similarly. Kept className/style forwarding and merging (mirroring the documented exception in Text.tsx) rather than break the composers; the doc should state that a layout-only class from a composing component is sanctioned.
- Heading: the `marginBlockEnd: space.sm` binding contradicts the system rule that spacing between siblings is never a margin. The binding's own description carves out the exception, so I kept it, but note Table already has to neutralise it with `overrides={{ marginBlockEnd: 'space.0' }}` — a signal the default should perhaps be `space.0` with the gap owned by the container.
- Heading: the behavior scenarios apply `given` to "the Default story's args", but the doc defines no Default example, so what `renders-size-md` etc. actually render is generator-chosen. Kept the pre-existing Default (`level: '2'`, `children: 'Account settings'`, `align: 'start'`) — meaning every `renders-size-*` and `renders-align-*` scenario silently tests level 2. The doc should name the Default args.
- Heading: `size` carries `enumRef: size` but its values (4xl…md) are a different scale from the shared `size` enum used by Text (xs…xl), so the ref can't be reused for a shared type — exported a standalone `HeadingSize`. Either the enumRef is wrong or the shared enum needs to cover both ranges.
- Heading: `a11y.requires` lists `contrast-aaa`, which has no expression in component code (it's enforced by check_contrast against the token pair). Rendered nothing for it; if `requires` entries are meant to be implementable one-for-one, this one needs marking as a build-time-only requirement.
- Heading: both doc-written scenarios assert only `role: heading`, which every one of the 18 scenarios would satisfy trivially. To make them mean what their descriptions say I strengthened them to assert the resolved level (`getByRole('heading', { level: 3 })` / `tagName === 'H3'`) and, for size-does-not-change-the-outline, that the md size class is applied while the element is still `h2`. The `then` vocabulary has no way to express "element is h3" or "class/size applied".

## 2026-09-17 03:56 — round 1

- Heading: the spec says the resolved default size 'is never written back to the `size` attribute, so `[size]` selectors match only explicit sizes', but a React h1–h6 has no `size` attribute; I applied the level default only as a `ds-heading--size-*` class and wrote no attribute, so there is nothing for a web `[size]` selector to match. The web note should say whether web must expose explicit size (e.g. `data-size`) or whether this sentence is Lit-only.
- Heading: the web platform gives no fallback for a `level` outside 1–6 (Lit has 'falls back to <h2> and warns once'); I relied on the required, typed prop and added no runtime fallback or dev warning. An untyped invalid level renders an undefined element.
- Heading: `color` is locked, but the overrides section says every style binding gets a hook; I kept `--ds-heading-color` as a CSS hook on the root (consumer CSS can still set it) and left it out of the `overrides` type. The spec should say whether locked bindings get a hook at all, since a hook lets consumer CSS break the AAA pair.
- Heading: the spec has no binding for margin-block-start, and the browser's default h1–h6 top margin would add a margin the system doesn't allow; I reset it with `margin-block-start: 0`, which is not a token.
- Heading: the stories list names Default plus one story per enum value; I used `Level1`…`Level6` and `Size4xl`/`Size3xl`/`Size2xl`/`SizeXl`/`SizeLg`/`SizeMd`. PascalCase for values that start with a digit ('4xl') isn't specified.
- Heading: the Default story's args aren't given by the spec (level is required); I kept level '2', children 'Account settings', align 'start'.

## 2026-09-18 13:27 — round 1

- Heading: the level description asks for 'one development warning per element for its lifetime' but gives no wording and no copy key; I wrote `Heading: level <value> is not one of 1–6; rendering an <h2>.` via console.warn, gated by a per-instance useRef in render (the BottomSheet pattern).
- Heading: the fallback-to-2 behaviour (missing/out-of-range/non-numeric level) has no behavior scenario, so there is no gate test for it or for the single warning; only the prose asks for it.
- Heading: the spec says the exported `HeadingLevel` is the string union with the number added only on the prop, but other components (Card, Accordion, Disclosure, Popover, Tree, Feed) export their `*HeadingLevel` types with the numbers included; I followed the Heading spec, so the two styles now differ within the package. Card passes `headingLevel as HeadingLevel`, which still compiles.
- Heading: `align` has no default-carrying modifier story beyond AlignStart, and the spec says nothing about whether `start` should emit a class; I kept emitting `ds-heading--align-<value>` for every value, start included.
- Heading: the web notes say one element takes `data-ds` and `data-part="text"`, but they don't say whether a consumer's `data-part` in `...rest` may override it; rest is spread first so the component's hooks win.

## 2026-09-18 13:36 — round 2

- Heading: round 2 reported the keyboard-run and axe gates as failed, but none of the listed failures are Heading's. keyboard-run fails in Accordion, ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip and Tree specs (Heading has no keyboard block or spec). axe fails in Carousel, Feed, Listbox, Menu, Splitter and Tabs stories; logs/playwright.json has no Heading/React entry. The gates run over the whole package, so a single-component job can't make them pass. I left the Heading files unchanged and did not edit other components.
- Heading: I could not confirm the Heading stories pass axe in a browser; logs/heading-axe.mjs (axe on Heading/React stories only, light and dark) needs approval to run.
- Heading: the gates don't say which failures existed before a job, so a job can't tell its own failures from the package's. A baseline list per gate, or running the gate only on the job's component, would make this checkable.

## 2026-09-18 13:46 — round 3

- Heading: none of the round-3 failures are Heading's. The axe gate fails on Carousel, Box, Feed, Listbox, Menu, Splitter and Tabs stories. The keyboard gate fails on Accordion, ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip and Tree specs. Both gates run over the whole package, so a Heading-only job can't make them pass; I made no changes and did not edit other components.
- Heading: the keyboard failures that were new in round 3 (AlertDialog, BottomSheet, Dialog, Feed, FocusScope) all pass when rerun alone with --workers 1 (15 passed, 4 manual skips), with the current Heading composed into Dialog, AlertDialog and BottomSheet. They were caused by running at full parallelism, not by the code; the gate needs a baseline or a lower worker count to give a stable result.
- Heading: I still could not confirm the Heading stories pass axe in a browser; logs/heading-axe.mjs (axe on Heading/React stories only, light and dark) needs approval to run.
