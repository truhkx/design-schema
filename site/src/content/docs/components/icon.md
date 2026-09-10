---
title: Icon
description: A named glyph from the system's set, sized with the text and colored by it. Decorative unless given a label.
component:
  name: Icon
  category: primitive
  status: review
  anatomy: [glyph]
  props:
    name:
      type: enum
      values: [check, dash, chevron-right, chevron-down, chevron-up, chevron-left, close, plus, minus, info, success, warning, danger, external, ellipsis, search, arrow-right, arrow-left, calendar, menu, list, grid]
      required: true
      description: 'Which glyph. The set is deliberately small and grows only when a component needs a shape; `info`, `success`, `warning` and `danger` are the four status shapes (circle-i, circle-check, triangle-!, octagon-x) so tone is never carried by color alone.'
    size:
      type: enum
      values: [xs, sm, md, lg, xl]
      default: md
      description: Rendered size, from the font-size scale so icons line up with text of the same size.
    inline:
      type: boolean
      default: false
      description: 'Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring `size`. For icons inside Text, Link and Button labels.'
    label:
      type: string
      description: 'Accessible name. When set (non-empty), the icon is meaningful and exposed as an image with this name; when omitted or empty, it is decorative and hidden from assistive technology. Most icons sit next to text and should have no label.'
      a11y: 'With label: role=img + aria-label (accessibilityRole image + accessibilityLabel, importantForAccessibility auto). Without: aria-hidden / accessibilityElementsHidden + importantForAccessibility no.'
    color:
      type: string
      description: 'React Native only: the color the parent passes, because there is no currentColor. Falls back to `color.foreground` when the icon is not nested in a Text (a nested Text glyph inherits its parent''s color and the fallback is not applied).'
      platforms: [rn]
  styles:
    size: { token: 'font.size.{size}', description: 'The glyph box is a square of 1em; `size` sets that em (font-size on the element), so the box tracks the type scale. With `inline`, font-size is inherited instead and `overrides.size` is a no-op (the hook is still set, for consistency). Non-inline icons are display inline-block with vertical-align middle; inline ones sit at vertical-align -0.125em.' }
    color: { token: color.foreground, description: 'The default is inherit (currentColor): glyphs take the text color, so a Button, Link or Alert colors them for free, and color.foreground is only what inheritance resolves to at the root. `overrides.color` sets an explicit color. On React Native, where there is no currentColor, the `color` prop (or the parent Text''s TextStyleContext when inline) supplies it and color.foreground is the fallback.' }
    strokeWidth: { token: border.width.focus, description: 'Stroke thickness of line glyphs (check, dash, chevrons, close, plus, minus, external, search, arrows, calendar, menu), in screen pixels at every size (vector-effect non-scaling-stroke), so glyphs stay legible at xs. Filled glyphs (the four status shapes, ellipsis) have no stroke: each is one evenodd path whose inner mark is a hole. All three platforms; on React Native through react-native-svg.' }
  a11y:
    role: img
    requires: [accessible-name]
  platforms:
    web:
      element: svg
      attributes: [viewBox=0 0 16 16, aria-hidden, role, aria-label, focusable=false]
      notes: 'One inline <svg viewBox="0 0 16 16" width="1em" height="1em"> per glyph, from a `paths` table exported from Icon.tsx (module export, not re-exported from the package index; no sprite, no icon font, no dependency). Root svg: fill none, stroke currentColor; filled glyphs set fill currentColor / stroke none on their own path. `focusable="false"` for old Edge. Decorative icons: aria-hidden="true"; labelled: role="img" aria-label. An unknown `name` renders an empty svg and warns in development.'
    lit:
      tag: ds-icon
      reflect: [name, size, inline]
      notes: 'Renders the same <svg> in the shadow root with part="glyph"; the host is display: inline-flex (inline-block with vertical-align when `inline`) and :host([hidden]) { display: none }. No delegatesFocus — the icon is never focusable. color inherits through the shadow root, so a ds-icon inside ds-button takes the button foreground. The paths table lives in Icon.ts and is imported by no one else — other components use <ds-icon name>, never the paths.'
    rn:
      element: Svg
      props: [width, height, viewBox, fill, stroke, strokeWidth, fillRule, vectorEffect, testID, accessibilityRole=image, accessibilityLabel, accessibilityElementsHidden, importantForAccessibility]
      notes: 'react-native-svg is the one sanctioned native dependency (decision 2026-09-10): the same 16-grid `paths` table as web renders through <Svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke={color}> with <Path> children, strokeWidth from border.width.focus scaled to the 16-grid at the rendered size (vectorEffect="non-scaling-stroke" where the platform honors it), filled glyphs with fill={color} stroke="none". `color` is an explicit prop (no currentColor on native) defaulting to color.foreground, and inline icons read the parent Text size through TextNestingContext. Decorative: accessibilityElementsHidden + importantForAccessibility="no"; labelled: accessibilityRole="image" + accessibilityLabel.'
---

Icons are the one place Tier 1 had nothing to build from: every component drew its own check mark, chevron and status shape. Icon centralizes them. It is a primitive, not a design element in its own right: it has no tone of its own, takes its color from the text it sits in, and its size from the type scale, so a glyph beside a label always matches the label.

## When to use

Use an Icon wherever a component's anatomy names one: the leading icon in a Button, the chevron in a Disclosure, the status shape in an Alert, the check in a Checkbox, the external mark on a Link, the ellipsis in a collapsed Breadcrumb. Use `inline` when the icon is inside running text. Give it a `label` only when the icon is the whole message — a lone warning triangle in a table cell, say — and the label is what a screen reader should say instead.

## When not to use

Do not use an Icon as a button; wrap it in a Button with `iconOnly` and a `label`, which brings the target size, focus ring and accessible name. Do not use Icons as illustration or decoration at large sizes; that is an Illustration component (not planned) or an image. Do not add a glyph to the set for one screen; the set grows when a *component* needs a shape, and until then product code passes its own SVG to the slot that accepts content.

## Behavior

An Icon renders a single glyph at the requested size and does nothing else: no interaction, no focus, no animation. Its color is the surrounding text color on web and Lit (`currentColor`); on React Native the parent supplies it. Decorative icons (no `label`) are invisible to assistive technology so that "Save" is announced as "Save", not "check mark Save". Labelled icons are announced as images with their label.

## Content guidelines

Glyph geometry on the 16×16 grid, for glyphs with no existing path to reuse: `list` is three horizontal lines from x=5 to x=14 at y=4, 8, 12 with a dot at x=2 on each; `grid` is four 5×5 outlined squares at (2,2), (9,2), (2,9), (9,9); `menu` is three horizontal lines from x=2 to x=14 at y=4, 8 and 12 (a line glyph). `calendar` is an outlined rectangle from (2,3) to (14,14) with a header rule at y=6 and two hanger ticks at x=5 and x=11 from y=1 to y=4, drawn as a line glyph. Glyph names describe the shape or the universal meaning, not the use ("chevron-down", "close", "warning"), so the same icon can serve many components. `dash` is the short indeterminate mark (4–12 on the grid) used by Checkbox; `minus` is the full-width line (3–13) that pairs with `plus`. `danger` is an octagon with an ×; Alert's current exclamation octagon changes to it when Alert is regenerated to compose Icon. A `label`, when used, says what the icon means in context ("Warning: over quota"), not what it depicts ("triangle").

## Accessibility

Decorative icons are hidden from assistive technology (WCAG 1.1.1: they carry no information the adjacent text does not). Meaningful icons expose role `img` and an accessible name from `label` (1.1.1, 4.1.2). Icons never convey information by color alone: the four status glyphs are four different shapes (1.4.1). Because they are drawn in the text color, they inherit whatever contrast the text has; components that place an icon on a tinted surface (Alert, Meter) declare that pair themselves. Line glyphs use the focus-ring width as their stroke so they stay legible at `xs` (1.4.11 applies only when the icon is meaningful, and a labelled icon then sits in a component that declares the pair).

## Platform notes

### Web
Export a `paths` table keyed by `name`, drawn on a 16×16 grid: line glyphs are bare `<path>`s inheriting the root's `fill="none" stroke="currentColor"`; the four status shapes and the ellipsis are single `fill="currentColor" stroke="none" fill-rule="evenodd"` paths whose inner mark is a hole. Render `<svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">` with `stroke-width: var(--border-width-focus)` and `vector-effect: non-scaling-stroke` on paths in CSS. Size: `font-size: var(--font-size-{size})` on the element (attributes cannot take custom properties); `display: inline-block; vertical-align: middle`; with `inline`, `font-size: inherit; vertical-align: -0.125em`. Reuse the existing Disclosure/Link/Breadcrumb/Alert path data for chevrons, external, ellipsis and close so the later swap is visually neutral. Decorative: `aria-hidden="true"`; labelled: `role="img"` and `aria-label`. Always `focusable="false"`. Button, Link, Alert, Disclosure, Checkbox, RadioGroup and Breadcrumb should be updated to render `<Icon>` instead of their private glyphs in the next regeneration.

### Lit
`<ds-icon name="check" size="sm">` renders the same SVG in its shadow root; `:host { display: inline-flex; color: inherit }` and `:host([inline]) { display: inline-block; vertical-align: -0.125em; inline-size: 1em; block-size: 1em }`. Reflect `name`, `size` and `inline`. The paths table is a module-private constant; other elements compose `<ds-icon>`.

### React Native
Import `Svg` and `Path` from `react-native-svg` and render the shared `paths` table (export it from a `paths.ts` in the RN package, byte-identical to the web table so the swap stays visually neutral): `<Svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">` with `<Path d>` per glyph; filled glyphs pass `fill={color} stroke="none" fillRule="evenodd"`. `size` and `strokeWidth` come from the tokens through `useTheme()`. With `inline` nested in the system Text, size from the parent's font size via `TextNestingContext`; otherwise `font.size.md`. `color` from the prop, defaulting to `color.foreground`. Decorative: `accessibilityElementsHidden`, `importantForAccessibility="no"`; labelled: `accessibilityRole="image"`, `accessibilityLabel`. No Unicode fallback remains.

## Related

Button, Link, Alert, Disclosure, Checkbox, Breadcrumb.
