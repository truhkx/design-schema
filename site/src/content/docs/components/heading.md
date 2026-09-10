---
title: Heading
description: A section title that establishes document structure for readers and assistive technology.
component:
  name: Heading
  category: typography
  status: review
  anatomy: [text]
  props:
    level:
      type: enum
      values: ['1', '2', '3', '4', '5', '6']
      required: true
      description: Position in the document outline. Controls the semantic element, not the visual size. Canonical values are strings; generated components also accept the number.
      a11y: Screen-reader users navigate by heading level; levels must not skip (h1 → h3).
    size:
      type: enum
      values: [4xl, 3xl, 2xl, xl, lg, md]
      description: Visual size, independent of level. Defaults to the size that matches the level.
    children:
      type: content
      required: true
      description: The heading text. Keep it short and descriptive; it is what appears in the page outline.
    align:
      type: enum
      values: [start, center, end]
      default: start
      description: Horizontal text alignment.
  styles:
    fontFamily: { token: font.family.heading }
    fontWeight: { token: font.weight.semibold }
    fontSize: { token: 'font.size.{size}' }
    lineHeight: { token: font.lineHeight.tight }
    color: { token: color.foreground.strong }
    marginBlockEnd: { token: space.sm }
  a11y:
    role: heading
    requires: [heading-hierarchy, contrast-aaa]
    contrast:
      - { foreground: color.foreground.strong, background: color.background, level: AAA }
  platforms:
    web:
      element: h1–h6
      attributes: []
      notes: The element is chosen by `level`. Never use `role="heading"` on a div when a real heading element is available.
    lit:
      tag: ds-heading
      reflect: [level, size, align]
      notes: Renders the matching <h1>–<h6> inside the shadow root. Note that headings inside shadow roots are exposed to assistive technology normally, but some in-page outline tools do not see them.
    rn:
      element: Text
      props: [accessibilityRole=header]
      notes: iOS and Android have no heading levels. `level` maps only to typography; the header trait is set regardless of level. Document the outline in the screen's design instead.
---

Headings label sections of content. Their most important job is invisible: they build the outline that screen-reader users jump through to understand and navigate a page.

## When to use

Use a Heading to title a page, a section, or a card that contains its own content. Choose `level` from the document outline — the page title is `1`, its major sections are `2`, their subsections `3` — and then choose `size` separately if the default visual size is wrong for the layout. Decoupling level from size is the whole point of this component: it lets designers pick the right look without breaking the outline.

## When not to use

Do not use a Heading purely to make text large or bold; use Text with a larger size. Do not skip levels (a `2` followed by a `4`) and do not use more than one `level: 1` per page or screen. Do not put interactive controls inside a heading.

## Content guidelines

Headings are short noun phrases in sentence case, unique within a page, and front-loaded with the most specific word. They should make sense when read in a list on their own, because that is exactly how screen-reader users encounter them.

## Accessibility

Headings must reflect the actual structure of the content (WCAG 1.3.1 Info and Relationships, 2.4.6 Headings and Labels, and 2.4.10 Section Headings at AAA). Levels must not skip. On web, the semantic element is always a real `<h1>`–`<h6>` chosen from `level`; visual size never influences the element. Heading text meets AAA contrast (7:1) against the page background in both themes because headings carry the most weight in a page's meaning. On native platforms there are no levels, so headings carry the platform header trait and the outline is documented in the screen design; this is a known, unavoidable gap between platforms and it is called out in the platform mapping table above.

## Platform notes

### Web
`level` selects the element. `size` maps to `font.size.*` via a class or inline custom property; the default size per level is 1→4xl, 2→3xl, 3→2xl, 4→xl, 5→lg, 6→md.

### Lit
`<ds-heading level="2">` renders `<h2>` inside its shadow root. `level`, `size` and `align` are reflected as attributes. Because the heading lives in a shadow root, use `part="heading"` on the inner element so consumers can restyle it with `::part`.

### React Native
Renders `Text` with `accessibilityRole="header"`. `level` chooses the default size only. iOS VoiceOver exposes the header trait but not a level; Android TalkBack likewise. Do not simulate levels with `accessibilityLabel` prefixes like "Heading level 2" — it is noisy and non-standard.

## Related

Text, Section (planned).
