---
title: Container
description: The page-level column. Applies the theme's gutter at the viewport edge and caps content width at the prose, content or page measure, so every screen shares one horizontal rhythm.
component:
  name: Container
  category: layout
  status: review
  anatomy: [column]
  props:
    children:
      type: content
      required: true
      description: 'The page or region content, usually a Stack with `gap: section` between regions.'
    width:
      type: enum
      values: [prose, content, page, full]
      default: content
      description: '`prose` for reading (a 65-character measure), `content` for most screens, `page` for full-bleed layouts with wide grids, `full` for no cap (gutters only).'
    gutter:
      type: enum
      values: [narrow, default, wide, none]
      default: default
      description: 'Horizontal padding at the viewport edge. Responsive: `default` uses the narrow gutter under the content width and the wide gutter above the page width. `none` for a nested container inside a padded parent.'
    align:
      type: enum
      values: [center, start]
      default: center
      description: Where the capped column sits in a wider viewport.
    element:
      type: enum
      values: [div, main, section]
      default: div
      description: Use `main` for the page's main column when no Landmark wraps it.
      platforms: [web, lit]
  styles:
    maxWidth: { token: 'layout.maxWidth.{width}', description: '`full` renders no max-width; the binding covers the other three.' }
    paddingInline: { token: 'layout.gutter.{gutter}', description: '`none` renders no padding (a literal 0, with no hook). `narrow` and `wide` are fixed at every viewport. Only `default` is responsive: narrow below layout.maxWidth.content, default between, wide above layout.maxWidth.page.' }
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: 'Block element with max-width, margin-inline auto (or 0 for align start) and padding-inline from tokens; the responsive gutter uses two media queries keyed to the maxWidth tokens (min-width: var() is not valid in media queries, so the generator reads the resolved px values from the token file at build time — the one place a resolved number appears, marked literal-ok).'
    lit:
      tag: ds-container
      reflect: [width, gutter, align]
      notes: 'The host is the column (`:host { display: block }`) with a default slot. Same media-query note as web.'
    rn:
      element: View
      props: []
      notes: 'View with maxWidth, alignSelf (center → center, start → flex-start), width 100%, paddingHorizontal. The responsive gutter uses useWindowDimensions against the maxWidth tokens. On phones the cap rarely applies; on tablets and react-native-web it does.'
---

Container is where a screen's horizontal rhythm is decided once. It puts the gutter at the viewport edge and caps how wide content can get, so a form on a phone, a dashboard on a laptop and an article on a wide monitor all sit on the same measure — and no component ever needs to know how wide the page is.

## When to use

Wrap every page's content in one Container, inside the `main` Landmark, with `width: content` for application screens and `width: prose` for reading. Use `page` for layouts with wide data grids or side-by-side panels, and `full` only for edge-to-edge sections (a hero, a map) that manage their own inner Container. Nest a `gutter: none` Container inside a padded parent when a section needs a narrower measure than the page.

## When not to use

Do not use Container for spacing between things (Stack) or for a surface (Box, Card). Do not put a Container inside a Card. Do not set widths on components to make them line up; make the Container narrower.

## Behavior

Container renders a block that is the full viewport width minus the gutter, centered (or start-aligned) once the viewport exceeds the cap. The `default` gutter is responsive: narrow below the content width, default between, wide above the page width, so the edge breathes more as the screen grows. Nothing else changes with the viewport; components inside reflow on their own.

## Content guidelines

None.

## Accessibility

Content reflows to a single column at 320px wide without horizontal scrolling because the Container never sets a minimum width and the gutter shrinks on narrow viewports (WCAG 1.4.10). Prose measure keeps lines under about 80 characters, which helps readers with dyslexia and low vision (1.4.8, AAA advisory). Container adds no semantics unless `element: main` is chosen, in which case it is the page's main landmark and there must be exactly one.

## Platform notes

### Web
`display: block; max-inline-size: var(--layout-max-width-{width}); margin-inline: auto; padding-inline: var(--layout-gutter-narrow)`, then `@media (min-width: <content px>) { padding-inline: var(--layout-gutter) }` and `@media (min-width: <page px>) { padding-inline: var(--layout-gutter-wide) }`. The two breakpoint numbers are read from the built token JSON at generation time and marked `literal-ok: breakpoint from layout.maxWidth.*`; custom properties cannot be used in media queries.

### Lit
`<ds-container width="content">`; the host is the column with the same rules on `:host`. Same breakpoint note.

### React Native
`View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.*` (undefined for `full`), `alignSelf` from `align`, and `paddingHorizontal` chosen by comparing `useWindowDimensions().width` with the content and page tokens.

## Related

Stack, Box, Card, Landmark.
