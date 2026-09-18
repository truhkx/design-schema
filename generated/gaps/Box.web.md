# Gaps reported while generating Box for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 20:30 — round 1

- Box: no existing component implements the `overrides`/`TokenRef`/`cssVar` per-instance override pattern described in the package conventions, so I designed it from scratch — each overridable binding gets a `--ds-box-<binding>` CSS hook (kebab-case), and `overrides` sets that hook inline via `cssVar(ref)`, merged with any consumer-supplied `style`. Future components should follow the same shape for consistency.
- Box: a11y.role is 'none' and a11y.requires is empty, so none of the 33 scenarios exercise interaction or accessibility assertions — every one reduces to a render check (`container.firstChild` not null), per the spec's own `then: renders: true` for each.
- Box: 'surface: none renders nothing rather than a token' was implemented by simply not setting the `--ds-box-background` custom property for that modifier (falling back to the CSS `var(..., transparent)` default) rather than omitting a background-color declaration entirely — functionally equivalent but worth flagging as an interpretation.
- Box: the spec's Related section names Card and Container, neither of which exists in the package yet, so Box does not compose with them (nothing to compose with).

## 2026-09-09 21:41 — round 2

- Box: the `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Box and lives in site/ docs, which this task's rules forbid editing — needs a schema or docs fix outside the React package, not a Box code change.

## 2026-09-09 21:41 — round 3

- Box: the `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Box and lives in site/ docs, which this task's rules forbid editing — needs a schema or docs fix outside the React package, not a Box code change. Repeated from round 2 unchanged.

## 2026-09-09 22:16 — round 1

- Box.tsx, Box.css, Box.stories.tsx, and the index.ts export already existed and fully matched the spec; the only change made was adding the `data-ds="Box"` testability hook, which was missing (no other component in the package has it yet either, so this is the first).

## 2026-09-10 00:52 — round 1

- Box: the doc's override contract says surface:none/border:false/radius:none make the matching overrides no-ops; the existing implementation already achieved this for border (border-width stays a literal 0 outside the .ds-box--border class) but not for surface/radius (background-color/border-radius read var(--ds-box-background)/var(--ds-box-radius) unconditionally, so an inline override could re-enable a background or corner radius even when surface/radius said 'none'). Fixed by making those two properties literal in the base rule and only applying the hook inside the non-'none' modifier classes, mirroring the border pattern already in the file.

## 2026-09-16 02:40 — round 1

- Box: anatomy lists one part, `surface`, but the doc never says the root element *is* that part or what `data-part` the root should carry. Chose `data-part="surface"` on the root, written before `...rest` so a composing parent can relabel it (Popover/BottomSheet pass `data-part="body"`).
- Box: the conventions say `...rest` never forwards `style`/`className` to the root, but Popover and BottomSheet already compose Box with a layout-only class (`ds-popover__body`, `ds-bottom-sheet__body`). Kept the destructure-and-merge that Text uses for the same reason rather than break those callers; if the rule is meant literally, both call sites need a schema-level part instead.
- Box: `background` is locked, and the contract says a locked binding is "ignored if passed" — but the `--ds-box-background` hook still exists on the root, so a consumer can set the locked surface colour from their own CSS (the sanctioned escape hatch). The doc doesn't say whether a locked binding should have a hook at all. Kept the hook, matching Card.
- Box: `insetBlock`/`insetInline` declare no default; "Defaults to `inset`" is prose only. Implemented as "emit no axis modifier when the prop is absent", which keeps explicit `insetBlock: 'none'` distinct from unset — otherwise `none` would be unreachable as a per-axis value.
- Box: the two behavior scenarios only pin `nav` → navigation and `article` → article. `section`, `aside`, `header`, `footer` and `main` have conditional or context-dependent implicit roles (`section` is `region` only when named; `header`/`footer` are `banner`/`contentinfo` only outside sectioning content), and the doc claims `section` "carries that semantics" without qualification. Asserted roles only for the two scenarios that ask.
- Box: `a11y.contrast` checks `color.foreground`, `color.foreground.muted` and `color.link` against `subtle` and `strong` only — not against `surface: default`, and not the border colour against any surface. Assumed intentional (the build's contrast gate owns those pairs); nothing for the component to implement either way.
- Box: `radius` explicitly does not imply `overflow: hidden`, but the doc gives no guidance on whether a development warning should fire when `radius` is set on a Box whose child paints to the edge. Chose no warning — Box has no dev warnings at all.
- Box: `element` is listed with `platforms: [web, lit]` for all eight values, but the prop surface has to be one React element type. Kept `BoxProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'>` for every value rather than make Box polymorphic over the element (a generic would fight `isolatedDeclarations` and is not asked for), so element-specific attributes are not typed.
- Box: the examples' `given` are partial prop sets, and the doc doesn't say whether an example story should inherit the Default story's remaining args. Followed the package's existing practice (Stack) — story args merge over `meta.args`, so e.g. `HeroBand` inherits `radius: md` from Default.

## 2026-09-17 04:03 — round 1

- Box: the overrides section says `radius: none` turns the radius part off and makes its override a no-op, but the schema's radius binding says `radius: none` resolves `radius.none` and is written out with no cascade. I followed the binding: `ds-box--radius-none` sets the hook to `var(--radius-none)` and a radius override applies at every value. The doc should drop `radius: none` from the presence-gating example.
- Box: the web notes list `ds-box--surface-{value}` for every value and also say `surface: none` sets no background, while the background binding says `none` renders the literal transparent. I emit `ds-box--surface-none { background-color: transparent }` and only the other three values read `--ds-box-background`, so setting that hook from the consumer's own CSS cannot paint a `none` box. It's unstated whether that escape hatch should work on `none`.
- Box: the spec doesn't say what the `Default` story's args are. The existing story uses inset md, surface subtle, radius md and a Text child rather than the schema defaults (none, none, none), and the scenarios layer their `given` on top of those args. I kept them; the doc could say whether Default should show the schema defaults.
- Box: `border: true` has one story, named `Border`. The story-naming rule only covers enum values (`<Prop><Value>`) and says nothing about boolean props.
- Box: `element` swaps the tag while the props stay typed against `div` (as the notes require), so the ref is typed `Ref<HTMLElement>`. The generic rule asks for the root element's own type (`Ref<HTMLDivElement>`), which would be wrong for `nav` or `section`. I used `HTMLElement`.

## 2026-09-18 16:28 — round 1

- Box: the overrides rule says 'rules always read the hook, never the token directly', but the radius binding says `overrides.radius` is ignored at `radius: none`. I resolved it the way `surface: none` is handled: `.ds-box--radius-none` writes `border-radius: var(--radius-none)` directly and reads no hook. The side effect is that consumer CSS on `--ds-box-radius` also has no effect at `none`. The spec only mentions overrides here, while for background it explicitly covers both overrides and consumer CSS; state which one applies to radius.
- Box: the border presence gate (`border: false` makes `overrides.border` and `overrides.borderWidth` no-ops) is done in CSS: `border-width: 0` stays unless `ds-box--border` is set, and the colour hook stays live. The spec doesn't say whether the hook should also be left unwritten when `border` is false; I left it written, since nothing visible depends on it.
- Box: 'A string given as `children` in an example is wrapped in the system Text by its story' doesn't say how. I used one meta-level `render` that wraps only string children in a plain `<Text>` with its defaults, so the example stories keep exactly their `given` as args. The spec doesn't say which Text element or size to use.
- Box: the Default story uses the `highlighted-panel` props, and I also kept `border: false` and `element: 'div'` in `meta.args` so they show as controls. These are the schema defaults, so the rendered output is the same, but Default's args are not exactly the example's `given`.
- Box: the behavior scenarios are all render or role checks. Nothing tests the per-axis inset precedence, the `surface: none` transparency, or the presence-gated overrides, because jsdom doesn't compute cascaded custom properties. I checked those contracts in CSS only.
- Box: the ref is `Ref<HTMLElement>` and the root uses `element as ElementType`, following 'not polymorphic, props typed against div'. That means a `div`-only attribute passed with `element: 'nav'` type-checks. I assume that's intended.

## 2026-09-18 16:40 — round 2

- Box: neither failing gate names Box. keyboard-run's 29 failures are all in other components' specs (Box has no keyboard block and so no generated spec), and logs/playwright.json from the same run has no Box/React axe violation in light or dark. I made no code change. The gates run across the whole package, so this report can't tell a Box regression from other components' failures; a per-component filter (a story title prefix for axe, a spec glob for keyboard) would make a generator's round 2 actionable.
- Box: I couldn't confirm that the Storybook the axe run tested included this round's Box stories (Default now renders string children through Text). logs/box-axe.mjs checks only the Box stories but needs approval to run in this session, and it has not been run.

## 2026-09-18 16:53 — round 3

- Box: rounds 2 and 3 ran against identical Box code, yet the keyboard-run failures changed (Popover, RadioGroup, SegmentedControl and Listbox Home are new; RadioGroup and SegmentedControl don't use Box). So the gate result doesn't depend on Box: the keyboard gate is flaky under parallel workers or is reporting other components' regressions. A package-wide gate can't show whether a single-component job fixed anything; a Box job should be judged on Box stories and specs alone.
- Box: I checked that Box's composites (Popover, Dialog, BottomSheet, SidePanel) don't depend on the radius change. None of them sets `radius` or reads `--ds-box-radius`, and Dialog's padding-hook overrides (`.ds-dialog__scroll > .ds-box`) still beat Box's modifier classes on specificity. That precedence is undocumented: the spec says a composing parent may pass a 'layout-only class' but not whether that class may set Box's `--ds-box-*` hooks, which Dialog.css does. I left it as it is.
