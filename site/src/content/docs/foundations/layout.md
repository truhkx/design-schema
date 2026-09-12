---
title: Layout and rhythm
description: The tokens that decide space between components and at page level — gutters, sections, gaps, insets and measure — derived from the theme's density and rhythm, and the rules for using them.
sidebar:
  order: 2
---

Spacing inside a component is the component's business: Button binds its padding to `space.sm` and `space.{size}`, Alert binds `padding: space.md`, and every platform renders the same numbers. Spacing *between* components is nobody's business unless the system makes it someone's — and when it is nobody's, screens drift: one form has 12px between fields and the next has 20, one page hugs the viewport edge and another floats. The `layout` token group is where the system owns that rhythm, and the foundational components (Stack, Box, Card, Container) are the only way it is meant to be applied.

## The tokens

All of these except `breakpoint` are derived by `tools/theme.ts` from two theme decisions — `density` (which already scales the `space` grid) and `layout.rhythm` (tight / normal / loose, which scales the between-component steps a second time) — plus `layout.contentWidth`. Calm & precise, at `comfortable` density and `normal` rhythm, resolves to the values in the right column.

| Token | Use | Calm & precise |
| --- | --- | --- |
| `layout.gap.none / tight / normal / loose / section` | Gap between siblings in a Stack, in either direction. `tight` for related controls (a button pair, a checkbox and its helper), `normal` for fields in a form, `loose` between groups, `section` between page sections. | 0 / 4 / 8 / 16 / 32 |
| `layout.inset.none / sm / md / lg / xl` | Padding a surface (Box, Card) puts around its content. `sm` for dense list rows, `md` for cards and alerts, `lg` for page-level panels, `xl` for hero sections. | 0 / 8 / 12 / 16 / 32 |
| `layout.section.sm / md / lg` | Vertical space between page-level sections: between a page heading and its content, between a Landmark and the next. | 32 / 48 / 64 |
| `layout.gutter.narrow / default / wide` | Horizontal page padding at narrow, default and wide viewports. Container applies it. | 16 / 24 / 32 |
| `layout.maxWidth.prose / content / page` | Column widths. `prose` is a 65-character measure at the body size; `content` is the theme's `contentWidth`; `page` is four-thirds of it. | 572 / 960 / 1280 |
| `layout.breakpoint.sm / md / lg` | Viewport widths at which **page chrome** changes shape — the header's nav-row-vs-hamburger switch, the docs sidebar-vs-`Select` swap. Fixed pixels, the same in every theme. | 640 / 768 / 1024 |

The names are deliberately semantic. A component never binds `space.4` for a gap between siblings; it binds `layout.gap.loose`, so a theme that says `rhythm: loose` opens up every screen at once and a compact tool's `rhythm: tight` closes them, without either touching a component.

## The rules

**Siblings are spaced by their parent.** Nothing carries a margin. A Stack sets the gap between its children; a Box or Card pads its own content; a Container pads the page. If two things need space between them, the answer is always "put them in a Stack with the right `gap`", never "give the second one a margin". This is why generated components have no margin bindings at all, and why the literal gate treats a margin literal as an error.

**Choose gap by relationship, not by pixels.** The four presets map to four relationships: parts of one control (`tight`), items in one group (`normal`), groups in one region (`loose`), regions on one page (`section`). Reaching for a numeric `space.*` token between components means the relationship is unclear; name it and the preset follows.

**Surfaces inset, layouts gap.** Box and Card own the padding around their content with `inset`; Stack owns the gap between things. A Card that contains a Stack is the normal shape: the Card decides how far content sits from its edge, the Stack decides how far the pieces sit from each other. Neither needs to know the other's value.

**Pages have a gutter and a measure.** Container applies the gutter at the viewport edge and caps width at `content` (or `page` for full-bleed layouts, `prose` for reading). Body text longer than a few lines lives inside a `prose` column; nothing else caps text width.

**Breakpoints are for page chrome, not components.** `layout.breakpoint.*` is the one token group in this system that a component in `packages/*/src` must never bind. A component does not know what viewport it is in — it knows how much room its *container* gave it, so its responsiveness is container-query-driven (Splitter's collapse rule, measured by `ResizeObserver`, is the precedent) and a viewport breakpoint would make it lie whenever it is rendered in a sidebar or a split pane. Page-level chrome is the opposite case: the header choosing a nav row over a hamburger, and the docs layout choosing a sidebar over a `Select`, are decisions about the window, so they read these tokens. Consumed by the website app (`apps/website`) only.

**Sections, not dividers.** Vertical rhythm between regions comes from `section` spacing, not from horizontal rules; a Divider (planned) is for lists, not for page structure.

## Across platforms

The values are the same everywhere because they are the same tokens: `--layout-gap-normal` in CSS, `layoutGapNormal` in the React Native token object, and on native the number is device-independent points, which is what CSS px are on the web. What differs is only the container: flex `gap` on web and on React Native ≥ 0.71, which every generated Stack uses, so no platform falls back to margins.

## How a theme changes it

Three frontmatter decisions and nothing else:

```yaml
theme:
  density: comfortable        # scales the space grid (0.75 / 1 / 1.25)
  layout:
    rhythm: normal            # scales gaps and sections again (0.75 / 1 / 1.5)
    contentWidth: 960         # px; page = 4/3, prose = 65ch at the body size
```

A dense admin tool might choose `density: compact, rhythm: tight`; a marketing site `density: roomy, rhythm: loose, contentWidth: 1120`. The components do not change; the rhythm does.

`layout.breakpoint.*` is not on that list, and neither `density` nor `rhythm` moves it: 640 / 768 / 1024 describe devices, not taste, and a compact theme still has to decide "does a sidebar fit here?" at the same width a roomy one does. They are written once in `tools/theme.ts` and every theme gets the same three, so moving them is a change to the system rather than a theme decision — and `overrides` is not the way to do it: that escape hatch is keyed per mode (`overrides.light` / `overrides.dark`), and a breakpoint is one value for both.

## Reading a breakpoint

Almost always in CSS, where the token's value is inlined at build time:

```css
@media (min-width: 768px) { /* layout.breakpoint.md */ }
```

A custom property cannot appear in a media condition, so the number is written out. That is not a hole in the literal gate: `pnpm lint:literals` scans `packages/{react,lit,rn}/src` and `packages/swiftui/Sources/DesignSchema`, and this token belongs to `apps/website`, outside that tree. Inside it the gate still raises every media-query number — which is why Container's `@media` bounds carry an explicit `literal-ok: breakpoint from layout.maxWidth.*` — and a *viewport* breakpoint has no such excuse to offer, because no component should be switching on the window in the first place.

The value is also in `packages/tokens/dist/<theme>/css/tokens.css` as `--layout-breakpoint-md` for anything that *can* take a custom property, and it is importable for the rare JS-side check — an `onResize` fallback, or a `matchMedia` string built at runtime:

```js
import { layoutBreakpointMd } from '@design-schema/tokens/calm-precise/light'; // '768px'

const wide = matchMedia(`(min-width: ${layoutBreakpointMd})`);
```

`resolveToken` from `@design-schema/tokens` reaches the same value from the dotted name (`resolveToken(tokens, 'layout.breakpoint.md')` over a namespace import), which is the form to use when the ref is a variable. React Native has no viewport chrome to switch and gets the token as a plain number (`768`), should a future app shell need it.
