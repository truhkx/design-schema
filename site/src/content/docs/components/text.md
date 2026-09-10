---
title: Text
description: Body copy and inline text with a fixed set of sizes, weights, and semantic colors.
component:
  name: Text
  category: typography
  status: review
  anatomy: [text]
  props:
    children:
      type: content
      required: true
      description: The text content. Inline formatting (emphasis, links) is allowed; block elements are not.
    size:
      type: enum
      values: [xs, sm, md, lg, xl]
      default: md
      description: Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata.
    weight:
      type: enum
      values: [regular, medium, semibold, bold]
      default: regular
      description: Emphasis without changing size. Prefer weight over color for hierarchy.
    tone:
      type: enum
      values: [default, strong, muted, danger, onAction]
      default: default
      description: Semantic color. `onAction` is only for text placed on an action background.
      a11y: Every tone meets 4.5:1 on the page background in every theme and mode except onAction, which is checked against action backgrounds.
    align:
      type: enum
      values: [start, center, end]
      default: start
      description: Horizontal alignment. `start`/`end` follow writing direction.
    truncate:
      type: boolean
      default: false
      description: Clip to one line with an ellipsis. On web the full text is exposed via `title` when children is a plain string; otherwise the consumer passes `title`. Native has no equivalent affordance — a known gap.
      a11y: Truncated text is still read in full by screen readers; ensure sighted users can also reach it.
    element:
      type: enum
      values: [p, span]
      default: p
      description: The HTML element to render — `p` for a block, `span` for inline. Labels and legends are rendered by Input and (planned) Fieldset, which own the association.
      platforms: [web, lit]
  styles:
    fontFamily: { token: font.family.body }
    fontSize: { token: 'font.size.{size}' }
    fontWeight: { token: 'font.weight.{weight}' }
    lineHeight: { token: font.lineHeight.normal }
    color: { token: 'color.foreground.{tone}' }
  a11y:
    role: text
    requires: [contrast-aa]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.strong, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
  platforms:
    web:
      element: p
      attributes: []
      notes: Renders the `element` prop. `truncate` uses overflow/text-overflow and sets `title` to the full text.
    lit:
      tag: ds-text
      reflect: [size, weight, tone, align, truncate]
      notes: 'Renders the chosen element inside the shadow root with `part="text"`; the host is `display: contents` for `span`-like use and `display: block` otherwise.'
    rn:
      element: Text
      props: [numberOfLines, ellipsizeMode, allowFontScaling]
      notes: No `element` prop — RN has one Text primitive. `truncate` maps to `numberOfLines={1}`. Keep `allowFontScaling` on so Dynamic Type / font scaling works.
---

Text is the default way to put words on a screen. Its job is to make sure every piece of copy uses a size from the scale and a color from the semantic set, so typography stays consistent without anyone thinking about it.

## When to use

Use Text for paragraphs, labels, captions, helper text, and any inline copy. Pick `size` from the scale rather than styling a raw element, and use `tone` for meaning: `muted` for secondary information, `danger` for errors, `strong` when a phrase must stand out from surrounding body copy. Use `weight` to create hierarchy inside a size; it is calmer than jumping sizes.

## When not to use

Do not use Text for section titles — use Heading, which carries document structure. Do not use `tone: danger` for decoration; it is reserved for error and destructive messaging so that its meaning stays reliable. Do not stack `size: xl` with `weight: bold` to fake a heading.

## Content guidelines

Sentence case for interface copy. Write for the smallest size the text will appear at. Avoid relying on color alone to convey meaning: pair `tone: danger` with an icon or explicit wording ("Error:") so color-blind users get the same information.

## Accessibility

Every tone except `onAction` is contrast-checked against the page background at AA in every theme and mode; the build fails if a theme's derived palette breaks this. `xs` is the floor for readable text — nothing in the system renders smaller. Text must reflow at 200% zoom and 320px viewports (WCAG 1.4.4, 1.4.10), which means never fixing the width of a text container in pixels. On native platforms, font scaling stays enabled so the platform's accessibility text sizes apply.

## Platform notes

### Web
The `element` prop chooses the tag; default `p`. `label` should only be used with a `for` association — prefer the Input component, which handles this. Truncation adds `title` with the full string.

### Lit
`<ds-text size="sm" tone="muted">` renders the element in a shadow root with `part="text"` for outside styling. Reflected attributes allow `ds-text[tone="danger"]` selectors in consuming apps.

### React Native
Renders `Text`. `size` and `weight` map to `fontSize`/`fontWeight` from the RN token object; `tone` to a color token. `truncate` sets `numberOfLines={1}` and `ellipsizeMode="tail"`. Nested Text is fine for inline emphasis.

## Related

Heading, Input (uses Text for label, description, and error).
