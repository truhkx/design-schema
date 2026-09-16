---
title: Divider
description: A hairline that separates items in a list or groups in a menu — decorative by default, a semantic separator when it carries meaning.
component:
  name: Divider
  category: layout
  status: review
  anatomy: [line, label]
  composition:
    label: Text
  props:
    orientation:
      type: enum
      values: [horizontal, vertical]
      default: horizontal
      description: Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height.
    label:
      type: string
      description: 'Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the divider from decorative into a labelled separator (`semantic` is implied). Ignored on a vertical divider, with a development warning: a vertical line has no room for centered text. An ignored label implies nothing either — a vertical divider is semantic only when `semantic` says so.'
    semantic:
      type: boolean
      default: false
      description: 'Expose as a separator to assistive technology. Leave false for purely visual lines between list rows; set true (or provide a label) when the divider marks a real boundary between sections that a screen-reader user should hear.'
      a11y: 'false → aria-hidden / hidden from AT; true → role=separator with aria-orientation.'
    spacing:
      type: enum
      values: [none, tight, normal, loose]
      default: none
      description: Space on both sides, from the layout rhythm, for dividers used outside a Stack that already spaces them.
  styles:
    color: { token: color.border }
    thickness: { token: border.width.thin }
    spacing: { token: 'layout.gap.{spacing}', description: '`spacing: none` is the off state, so an override of this binding does nothing until a spacing value is chosen — overrides change values, never presence.' }
    labelColor: { token: color.foreground.muted, part: label }
    labelSize: { token: font.size.sm, part: label, description: 'Passed to the composed Text as its `fontSize` override, along with `fontFamily`; Divider does not style the Text itself.' }
    labelGap: { token: layout.gap.normal, part: label, description: Gap between the label and the lines on each side. }
    fontFamily: { token: font.family.body }
  a11y:
    role: separator
    requires: [contrast-aa]
    contrast:
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  platforms:
    web:
      element: hr
      attributes: [aria-hidden, role=separator, aria-orientation]
      notes: 'A decorative divider is <hr aria-hidden="true"> (hr has an implicit separator role, so hiding it is deliberate); a semantic or labelled one is <div role="separator" aria-orientation> containing the label text, because <hr> cannot hold content. Vertical: inline-size thin, block-size 100% / align-self stretch.'
    lit:
      tag: ds-divider
      reflect: [orientation, semantic, spacing]
      notes: 'Host is the line (`:host { display: block }`, `:host([orientation="vertical"]) { display: inline-block }`); role and aria-orientation are set on the host via ElementInternals when semantic; `label` is a property rendered in the shadow root between two line segments.'
    rn:
      element: View
      props: [accessibilityElementsHidden, importantForAccessibility, accessibilityRole]
      notes: 'A View with height (or width) = border.width.thin and backgroundColor color.border. Decorative: accessibilityElementsHidden + importantForAccessibility="no". Semantic: there is no separator role on native; render the label (if any) as Text so it is read, otherwise the divider stays hidden — announcing "separator" has no native idiom. `semantic: true` with no label therefore has no observable effect here, and warns in development so the author knows the boundary is silent on this platform.'
    swiftui:
      element: Rectangle
      props: [Rectangle, .frame=height-1, .accessibilityHidden, .accessibilityElement, .accessibilityLabel]
      notes: 'A `Rectangle` of the color token, `border.width.thin` thick along the cross axis (`.frame(height:)` horizontal, `.frame(width:)` vertical), `.accessibilityHidden(true)` when decorative. With `label` the divider is an `HStack` of line–`Text`–line and is an accessibility element with that label (VoiceOver reads it as a section break); the label Text takes `fontSize` through `overrides`. Not SwiftUI''s `Divider` (fixed color).'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: decorative-divider-is-hidden-from-assistive-technology
      description: Decorative dividers are hidden so lists do not announce "separator" between every row.
      then:
        - { attribute: aria-hidden, is: 'true', platforms: [web] }
        - { attribute: accessibilityElementsHidden, is: true, platforms: [rn] }
    - name: semantic-divider-is-a-separator
      description: 'true means the divider marks a real boundary: role=separator with aria-orientation.'
      given: { semantic: true }
      then:
        - { role: separator, platforms: [web] }
        - { attribute: aria-orientation, is: horizontal, platforms: [web] }
    - name: label-is-read-and-makes-the-divider-semantic
      description: A label turns the divider from decorative into a labelled separator, and the text is what gets read.
      given: { label: or }
      then:
        - { text: or }
        - { role: separator, platforms: [web] }
  examples:
    - name: or-between-alternatives
      description: A labelled divider between two ways of signing in.
      given: { label: or, spacing: normal }
    - name: list-furniture
      description: The default line between rows of a dense list - decorative, and silent to assistive technology.
      given: { orientation: horizontal }
    - name: toolbar-groups
      description: A vertical line between groups of toolbar controls, stretching to the row height.
      given: { orientation: vertical }
    - name: section-boundary
      description: An unlabelled line that still marks a real boundary a screen-reader user should hear.
      given: { semantic: true, spacing: loose }
---

A divider is a line, and the question it always raises is whether the line means something. Between two rows of a list it is furniture: it helps the eye and says nothing. Between "Today" and "Earlier" it is structure a screen-reader user should hear. Divider makes that choice explicit instead of leaving it to whether someone remembered `aria-hidden`.

## When to use

Use a Divider between items in a dense list where whitespace alone does not separate them, between groups in a menu (Menu renders its own), between toolbar groups (`vertical`), and with a `label` as an "or" between alternatives (sign in with email — or — with a provider) or a date heading in a feed. Use `spacing` when the divider stands outside a Stack.

## When not to use

Do not use dividers between page sections; use `section` spacing and headings — a page full of rules is a page without rhythm. Do not use a divider under a heading as decoration. Do not use a labelled divider as a heading substitute; if the label introduces content, it is a Heading. Do not rely on a divider alone to separate interactive regions.

## Behavior

Renders a one-token-thick line in the border color along the chosen axis, with optional symmetric spacing. With `label`, the text is centered with a line on each side and the divider becomes semantic. Nothing is interactive.

## Content guidelines

Labels are one to three words, sentence case or lowercase for conjunctions ("or"), no punctuation. Date and group labels match the headings elsewhere on the screen.

## Accessibility

Decorative dividers are hidden from assistive technology so lists do not announce "separator" between every row (WCAG 1.3.1 — structure is conveyed by the list, not the line). Semantic dividers expose role `separator` with `aria-orientation`, and labelled ones read their text. The line is below the 3:1 non-text threshold on purpose — it is not required to identify anything (1.4.11 exemption), and the label, when present, meets 4.5:1.

## Platform notes

### Web
Decorative: `<hr aria-hidden="true" class="ds-divider">`. Semantic: `<div role="separator" aria-orientation={orientation}>` with, for a label, two flex-grow line spans around a `Text size="sm" tone="muted"`. Vertical uses `inline-size: var(--border-width-thin); align-self: stretch`.

### Lit
`<ds-divider>`; `<ds-divider semantic label="or">`. Host carries the styles and, when semantic, `internals.role = 'separator'` and `ariaOrientation`. The label renders in the shadow root.

### React Native
`View` with `height: t.borderWidthThin, backgroundColor: t.colorBorder` (or width for vertical, `alignSelf: 'stretch'`). Decorative: hidden from AT. Labelled: a row of two lines with a `Text` between; the text is what gets read.

## Related

Stack, Menu, List (planned), Heading.
