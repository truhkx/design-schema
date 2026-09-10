---
title: Card
description: A bounded surface for one thing — a record, a summary, a choice — with an optional heading row and action row, padded and spaced by the theme's rhythm.
component:
  name: Card
  category: container
  status: review
  anatomy: [surface, header, heading, headerActions, body, footer]
  props:
    children:
      type: content
      required: true
      description: The body. Usually a Stack of Text and controls.
    heading:
      type: string
      description: The card's title, rendered as a Heading at the card's level. Omit for cards that are a single piece of content.
    headingLevel:
      type: enum
      values: ['2', '3', '4', '5', '6']
      default: '3'
      description: Heading level for `heading`, so cards fit the page outline. Cards in a list share a level.
    headerActions:
      type: content
      description: Controls at the end of the header row — a ghost icon-only Button, a Link. At most two.
    footer:
      type: content
      description: The action row. Buttons in a row, primary first, following Form's action-order rule.
    inset:
      type: enum
      values: [sm, md, lg]
      default: md
      description: Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card.
    surface:
      type: enum
      values: [default, subtle]
      default: default
      description: '`default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border.'
    interactive:
      type: boolean
      default: false
      description: 'The whole card is one link or button target. Requires exactly one interactive child (a Link or Button) whose action the card extends to its full area; the card itself is not focusable.'
      a11y: The card never becomes a second focus stop; its single child link or button is the target, and the card enlarges the hit area only (pseudo-element on web, wrapping Pressable on native).
  styles:
    paddingBlock: { token: 'layout.inset.{inset}' }
    paddingInline: { token: 'layout.inset.{inset}' }
    partGap: { token: layout.gap.loose, description: 'Vertical gap between header, body and footer.' }
    headerGap: { token: layout.gap.normal, description: Horizontal gap between the heading and headerActions. }
    footerGap: { token: layout.gap.tight, description: Horizontal gap between footer actions. }
    actionsGap: { token: layout.gap.tight, description: Horizontal gap between the headerActions controls. }
    background: { token: 'color.background.{surface}' }
    border: { token: color.border }
    borderWidth: { token: border.width.thin, description: 'Rendered only with surface default.' }
    radius: { token: radius.lg }
    hoverBackground: { token: color.background.subtle, description: 'Interactive cards only, on pointer hover; subtle cards use color.background.strong.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    transition: { token: motion.duration.fast, description: 'Interactive hover, with motion.easing.standard.' }
  a11y:
    role: none
    requires: [heading-hierarchy, focus-visible, contrast-aa]
    contrast:
      - { foreground: color.foreground, background: 'color.background.{surface}', level: AA }
      - { foreground: color.foreground.muted, background: 'color.background.{surface}', level: AA }
      - { foreground: color.link, background: 'color.background.{surface}', level: AA }
  platforms:
    web:
      element: article
      attributes: [aria-labelledby]
      notes: 'An <article> when it has a heading (aria-labelledby the heading id), a <div> otherwise. Header, body and footer are plain flex rows/columns styled from this component''s own gap bindings (not the Stack component: Stack owns page rhythm and its gap enum, while these gaps are Card''s bindings and must stay overridable per instance). Interactive: the single child link/button gets a ::after pseudo-element covering the card (position: relative on the card), so the hit area grows without adding a focus stop; the focus ring is drawn on the card via :focus-within.'
    lit:
      tag: ds-card
      reflect: [inset, surface, interactive, heading-level]
      notes: 'Shadow root with named slots `header-actions` and `footer`, default slot for the body, and the heading rendered from the `heading` property as a <ds-heading>. Composes ds-stack for the rows. The interactive hit-area trick works across the shadow boundary only if the link is slotted: the host gets position: relative and the slotted link is told (via a class the card adds on slotchange) to extend; document it.'
    rn:
      element: View
      props: [accessibilityRole, accessibilityLabel]
      notes: 'View with padding/background/border/radius from tokens; header and footer are plain row Views styled from this component''s gap bindings, not Stack. Interactive: the card wraps its content in a Pressable that forwards onPress to the single child Link/Button''s handler and takes accessibilityRole from it; the child then renders with accessible={false} so there is one element for assistive technology.'
---

A Card frames one thing so it can sit among others: a search result, a plan to choose, a setting group, a dashboard panel. It is a Box with conventions — a heading row, a body, an action row, consistent padding and gaps from the theme's rhythm — so that every card on every screen has the same internal spacing without anyone choosing it.

## When to use

Use Cards for collections of like items where each needs its own boundary, and for a single panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page. Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.

## When not to use

Do not put a card inside a card. Do not use Cards to separate sections of a form or a settings page — that is a Landmark or a Heading with `section` spacing. Do not use a Card for a status message (Alert) or for a transient layer (Dialog, planned). Do not use `interactive` with more than one control inside; nested targets are a well-known accessibility failure.

## Behavior

The header renders when `heading` or `headerActions` is present, the footer when `footer` is present; body always. Header, body and footer are separated by `partGap`, and the card pads all of it by `inset`. `surface: default` draws a border, `subtle` does not. An `interactive` card grows its single child link or button's hit area to the whole card, shows `hoverBackground` on pointer hover, and draws the focus ring around the card when that child is focused — but adds no focus stop of its own.

## Content guidelines

Headings are short noun phrases, sentence case, one line. Footers hold one primary action at most, placed first, then one secondary; a card with more choices than that is a form. Body text keeps to a few lines; a card is a summary, and the detail lives where its action goes.

## Accessibility

A card with a heading is an `article` labelled by that heading, so screen-reader users can navigate card by card and hear each one's name (WCAG 1.3.1, 2.4.6); heading levels are consistent within a list and fit the page outline (heading-hierarchy). Interactive cards keep exactly one tab stop — the child link or button — and show a visible focus ring on the card (2.4.7), so keyboard users get the same large target as pointer users (2.5.8) without a redundant stop. Text on either surface meets 4.5:1 in both modes; the build checks body, muted and link foreground against both.

## Platform notes

### Web
Render `<article aria-labelledby={headingId}>` (or `<div>` without a heading) with `ds-card` classes for `inset`, `surface` and `interactive`. Header: a flex row with `justify-content: space-between` and `gap` from `headerGap`, containing the Heading (level from `headingLevel`, `size: lg` so a card heading reads smaller than a page heading) and the actions in a row with `gap` from `actionsGap`. Footer: a flex row with `gap` from `footerGap`. The rows are Card's own markup, not Stack, so their gaps stay per-instance overridable. Interactive: `position: relative` on the card; the single link/button child receives a class that adds `::after { content: ''; position: absolute; inset: 0 }`; `:focus-within` draws the ring on the card.

### Lit
`<ds-card heading="Plan" heading-level="3" inset="md">` with slots `header-actions`, default, and `footer`. Renders `<ds-heading size="lg">` internally (same size on every platform); header and footer rows are Card's own flex rows, not `<ds-stack>`. For `interactive`, on `slotchange` find the single `ds-link`/`ds-button` in the default slot, add the extending class to it (light DOM, so the consumer's stylesheet or a small global rule from the package applies the pseudo-element), and draw the ring on `:host(:focus-within)`.

### React Native
`View` with padding, background, border and radius from tokens; header and footer are plain row Views styled from Card's own gap bindings; the heading is the system `Heading` at `size: lg`. For `interactive`, wrap the content in a `Pressable` whose `onPress` calls the single child's handler and whose `accessibilityRole` and `accessibilityLabel` are copied from it; render the child with `accessible={false}` so it collapses into the Pressable.

## Related

Box, Stack, Heading, Button, Link, Container.
