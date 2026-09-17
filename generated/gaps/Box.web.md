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
