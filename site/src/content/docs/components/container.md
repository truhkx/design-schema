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
      description: 'The page or region content, usually a Stack with `gap: section` between regions. A string given as `children` in an example is an illustrative label, not content to build: stories render it inside a Text with its defaults (element `p` on web and Lit) on every platform (native requires one) and do not construct the Stack it names; that wrapper is the one sanctioned difference from the literal `given`. The Default story''s children is the string "Container content." in the same Text.'
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
      description: 'Where the capped column sits in a wider viewport. `start` sets `margin-inline: 0` on both sides, not just the start side, so the column never picks up an asymmetric margin. That margin is deliberately not a style binding: it is structural, it takes only two values, and there is nothing in it for a theme to tune, so it has no hook and is not overridable — unlike maxWidth and paddingInline. The selector is written at every `width`, `full` included, where it is simply inert (there is no cap for the column to sit inside), so the markup does not change shape with the width. React Native has no margin here: `center` maps to `alignSelf: center` and `start` to `alignSelf: flex-start`.'
    element:
      type: enum
      values: [div, main, section]
      default: div
      description: 'Use `main` for the page''s main column when no Landmark wraps it. A page has exactly one `main`; that is the author''s responsibility, since the component cannot see the rest of the page, so it neither enforces it nor warns. `a11y.role` is `none` because that is what the default `div` exposes; the landmark contract lives here and in the main-element scenario, and applies to this one value. On Lit `section` is indistinguishable from `div` — a custom element cannot retag its host and a section is a region only when it is named — so the value exists there for API parity and changes nothing observable.'
      platforms: [web, lit]
  styles:
    maxWidth: { token: 'layout.maxWidth.{width}', description: '`full` renders no max-width — the literal `none`, with no hook, which also makes an override of this binding a no-op at that value; the binding covers the other three. No dev warning fires for an override that has no effect.' }
    paddingInline: { token: 'layout.gutter.{gutter}', description: '`none` renders no padding (a literal 0, with no hook), which also makes an override of this binding a no-op at that value, with no dev warning. `narrow`, `wide` and `none` are fixed at every viewport: their selectors carry the attribute or modifier class, so they outrank the bare responsive rules inside both media queries and no viewport can move them. Only `default` is responsive: `layout.gutter.narrow` below layout.maxWidth.content, `layout.gutter.default` (the `--layout-gutter` variable) from layout.maxWidth.content, and `layout.gutter.wide` from layout.maxWidth.page. Both boundaries are inclusive (`>=`, a min-width query), so a viewport exactly at a token width takes the wider gutter. An override of this binding replaces the value at every viewport width, including the whole responsive `default` gutter, not just its middle band.' }
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: 'Block element with max-width, margin-inline auto (or 0 for align start) and padding-inline from tokens; the responsive gutter uses two media queries keyed to the maxWidth tokens (min-width: var() is not valid in media queries, so the generator reads the resolved px values from the token file at build time — the one place a resolved number appears, marked literal-ok). The breakpoint px come from the default theme, calm-precise (960 / 1280); the CSS is one theme-independent file, so under a theme with other maxWidth values the cap follows the theme (it is a custom property) but the gutter switches at calm-precise widths — a known limit, and an accepted one: one stylesheet for every theme is worth more than exact breakpoints, so the generator emits no per-theme CSS and no container-query substitute until a brand asks for it. The block `element: div` is the default; the root renders whichever tag the `element` prop chooses. The root is the `column` part and carries `data-part="column"`, as Box''s root carries `surface`. `...rest` is spread before `data-ds` and `data-part`, so a consumer cannot clobber the testability hooks; Container, unlike Box, is never composed by another component that would need to rename its part.'
    lit:
      tag: ds-container
      reflect: [width, gutter, align]
      notes: 'The host is the column (`:host { display: block }`) with a default slot. Same media-query note as web. A custom element cannot retag its host, so `element` sets a role for `main` only; `div` and `section` set none, since a section is a region only when it is named. That role is a plain `role` attribute on the host, as Box writes it — not ElementInternals, which the accessible-role tests cannot read — so Lit runs the main-landmark scenario alongside web. The host carries `data-part="column"`. `element` is an attribute-settable property that does not reflect: it changes no styling. Before the first update, when the width and gutter attributes are not yet reflected, the plain `:host` rules are the prop defaults (the content max-width and the responsive default gutter). `children` is required, but an empty default slot renders a valid empty column and no development warning fires: an empty page column is a legitimate intermediate state, unlike an empty required field.'
    rn:
      element: View
      props: []
      notes: 'View with maxWidth, alignSelf (center → center, start → flex-start), width 100%, paddingHorizontal. `element` is web and Lit only and is absent from the native props entirely, as in Box. The responsive gutter uses useWindowDimensions against the active theme''s maxWidth tokens, with the same inclusive `>=` boundaries as web. The component forwards a ref to its root View, typed as Box types its ref. The root is the `column` part and keeps `testID="Container"` with no separate part testID, as Box does for `surface`. On phones the cap rarely applies; on tablets and react-native-web it does. The gutter reads the window width, never the parent''s, so a nested `gutter: default` Container picks its gutter by the window here while SwiftUI measures its own width — one more reason a nested Container uses `gutter: none`. Container belongs in a column-direction parent (a screen, a vertical Stack); inside a row parent `width: 100%` and alignSelf cross axes and that placement is not supported — silently, with no development warning, since a View cannot see its parent''s flexDirection. Only the four style props named here are set: no flexShrink or flexGrow, so a sibling in a flex row can still shrink the column, which is the same unsupported placement said another way.'
    swiftui:
      element: VStack
      props: [.frame=maxWidth, .padding=horizontal, .frame=maxWidth-infinity, GeometryReader]
      notes: 'Centers content at `layout.maxWidth.{width}` with horizontal gutters from the inset token: `.frame(maxWidth:)` inside `.frame(maxWidth: .infinity)`. The `default` gutter follows the same rule as web: narrow below the content width, default from it, wide from the page width (a `GeometryReader` on the container''s own width, never `UIScreen`). Safe-area insets are respected by default (`ignoresSafeArea` is never applied by a component).'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: main-element-is-the-page-landmark
      description: 'Container adds no semantics unless element: main is chosen, in which case it is the page''s main landmark and there must be exactly one.'
      given: { element: main }
      then:
        - { role: main, platforms: [web, lit] }
  examples:
    - name: application-screen
      description: The default page column for application screens, centered at the content measure.
      given: { children: 'A Stack of page regions', width: content }
    - name: reading-measure
      description: An article capped at the prose measure, about 65 characters a line.
      given: { children: 'An article', width: prose }
    - name: nested-section
      description: A narrower measure inside an already padded parent, so the gutters are not applied twice.
      given: { children: 'A narrower section', width: prose, gutter: none }
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

Content reflows to a single column at 320px wide without horizontal scrolling because the Container never sets a minimum width and the gutter shrinks on narrow viewports (WCAG 1.4.10). Prose measure keeps lines to about 65 characters, which helps readers with dyslexia and low vision (1.4.8, AAA advisory). Container adds no semantics unless `element: main` is chosen, in which case it is the page's main landmark and there must be exactly one.

## Platform notes

### Web
`display: block; max-inline-size: var(--layout-max-width-{width}); margin-inline: auto; padding-inline: var(--layout-gutter-narrow)`, then `@media (min-width: <content px>) { padding-inline: var(--layout-gutter) }` and `@media (min-width: <page px>) { padding-inline: var(--layout-gutter-wide) }`. The two breakpoint numbers are read from the default theme's (calm-precise) built token JSON at generation time and marked `literal-ok: breakpoint from layout.maxWidth.*`; custom properties cannot be used in media queries.

### Lit
`<ds-container width="content">`; the host is the column with the same rules on `:host`. Same breakpoint note.

### React Native
`View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.*` (undefined for `full`), `alignSelf` from `align`, and `paddingHorizontal` chosen by comparing `useWindowDimensions().width` with the content and page tokens.

## Related

Stack, Box, Card, Landmark.
