---
title: Divider
description: A hairline that separates items in a list or groups in a menu — decorative by default, a semantic separator when it carries meaning.
component:
  name: Divider
  category: layout
  status: review
  anatomy: [line, label]
  composition:
    label: { component: Text, props: { size: sm, tone: muted, element: span }, forwards: { labelSize: fontSize, fontFamily: fontFamily } }
  props:
    orientation:
      type: enum
      values: [horizontal, vertical]
      default: horizontal
      description: 'Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height: inline-block with `block-size: auto; align-self: stretch; min-block-size: 100%` (flex stretch applies only to an auto cross size, and the min fills a parent with a set height). They need a flex or grid row (a horizontal Stack with align stretch) or a parent with a definite height; in plain block flow a vertical divider has no height and draws nothing.'
    label:
      type: string
      description: 'Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the divider from decorative into a labelled separator (`semantic` is implied). Ignored on a vertical divider, with a development warning: a vertical line has no room for centered text. An ignored label implies nothing either — a vertical divider is semantic only when `semantic` says so. An empty string is no label: the divider stays decorative and nothing warns. On Lit `label` is a property that also reads the `label` attribute and does not reflect. The development warning fires when the ignored combination appears or changes (an effect keyed on `label` and `orientation`), not on every render; on React Native a vertical divider with an ignored label and `semantic: true` gets both warnings. When in effect, the label is the separator''s accessible name (see the platform notes), and the two line pieces on either side are hidden from assistive technology.'
    semantic:
      type: boolean
      default: false
      description: 'Expose as a separator to assistive technology. Leave false for purely visual lines between list rows; set true (or provide a label) when the divider marks a real boundary between sections that a screen-reader user should hear.'
      a11y: 'false → aria-hidden / hidden from AT; true → role=separator with aria-orientation.'
    spacing:
      type: enum
      values: [none, tight, normal, loose]
      default: none
      description: 'Space on both sides along the cross axis (above and below a horizontal divider, left and right of a vertical one), from the layout rhythm, for dividers used outside a Stack that already spaces them. The space is transparent: web and Lit use margin-block (horizontal) or margin-inline (vertical); React Native pads the root View on that axis (paddingVertical or paddingHorizontal) with the line as an inner View.'
  styles:
    color: { token: color.border }
    thickness: { token: border.width.thin }
    spacing: { token: 'layout.gap.{spacing}', description: '`spacing: none` is the off state: it renders no space and sets no hook (not a `layout.gap.none` value, and an `overrides.spacing` is not written to the hook either), so an override of this binding does nothing until a spacing value is chosen — overrides change values, never presence.' }
    labelColor: { token: color.foreground.muted, part: label }
    labelSize: { token: font.size.sm, part: label, description: 'Passed to the composed Text as its `fontSize` override, along with `fontFamily`; Divider does not style the Text itself. The label color and default size come from the Text props `size="sm" tone="muted"`, so Divider writes no label color or size rule of its own. Neither labelSize nor fontFamily has a --ds-divider-* hook on web or Lit: only the bindings the author overrode are passed on, into Text''s `overrides`, and page CSS reaches the label through Text''s own hooks.' }
    labelGap: { token: layout.gap.normal, part: label, description: 'Gap between the label and the lines on each side: the gap of the labelled root row (flex `gap` on web and Lit, the `gap` style on React Native), not a composed Stack. With no label in effect there is no row, and an override of it does nothing.' }
    fontFamily: { token: font.family.body, part: label, description: 'Reaches only the composed label Text, through its `fontFamily` override; the line has no text, so the root sets no font hook.' }
  a11y:
    role: separator
    requires: [contrast-aa]
    contrast:
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  platforms:
    web:
      element: hr
      attributes: [aria-hidden, role=separator, aria-orientation]
      notes: 'A decorative divider is <hr aria-hidden="true"> (hr has an implicit separator role, so hiding it is deliberate); every semantic divider, labelled or not, is <div role="separator" aria-orientation>, so the semantic and labelled cases share one element. With a label the div is a flex row of two aria-hidden line spans (data-part="line") around the composed Text (data-part="label"), and the separator takes its accessible name from the label through aria-labelledby pointing at the Text id (from useId) — separator children are presentational, so containment alone does not name it. Beyond the composition props, the label Text also receives the platform attributes `id` and `data-part="label"`. The labelled row uses align-items center, so the lines sit at the label''s vertical center. Unlabelled, the root paints itself and is the `line` part; it carries no data-part. The line is a background-color box of the thickness, not a border. Vertical: display inline-block, inline-size thin, block-size auto, min-block-size 100%, align-self stretch. The ref is `Ref<HTMLElement>`, since the root is an hr or a div, and `...rest` lands on whichever root renders.'
    lit:
      tag: ds-divider
      reflect: [orientation, semantic, spacing]
      notes: 'Host is the line when unlabelled (`:host { display: block }`, `:host([orientation="vertical"]) { display: inline-block }`). When a label is in effect the host switches to a flex row through an internal `data-labelled` host attribute and the shadow root renders line segment, label Text, line segment, the segments aria-hidden. role, aria-orientation and aria-hidden are plain host attributes, not ElementInternals, because tests read them (dom-accessibility-api ignores internals). A labelled host also sets aria-label to the label text: ids do not cross the shadow root, and separator children are presentational. `label` is a property. Shadow elements carry `part` as well as `data-part`, both the anatomy names: names tests read, not a styling surface.'
    rn:
      element: View
      props: [accessibilityElementsHidden, importantForAccessibility]
      notes: 'A View with height (or width) = border.width.thin and backgroundColor color.border, inside a root View that carries `spacing` as padding. Decorative: accessibilityElementsHidden + importantForAccessibility="no-hide-descendants" on the root, since it wraps the inner line View. No accessibilityRole is set: there is none for a separator. Labelled: the root is a row (flexDirection row, alignItems center, `gap` from labelGap) of two line Views, each hidden (accessibilityElementsHidden + importantForAccessibility="no"), around the label Text, which stays readable. Semantic: there is no separator role on native; render the label (if any) as Text so it is read, otherwise the divider stays hidden — announcing "separator" has no native idiom. `semantic: true` with no label therefore has no observable effect here, and warns in development so the author knows the boundary is silent on this platform; that warning is keyed on `semantic` and whether a label is in effect, so it also fires for a semantic vertical divider whose label is ignored. The composition''s `element: span` is not passed (native Text has no `element`). The label Text sits in a plain View carrying `testID="Divider.label"`, since Text takes no testID. `spacing` pads the root on the cross axis whether or not it is the labelled row, each labelled line piece takes `flex: 1`, and a vertical divider''s root and its inner line both use `alignSelf: stretch`.'
    swiftui:
      element: Rectangle
      props: [Rectangle, .frame=height-1, .accessibilityHidden, .accessibilityElement, .accessibilityLabel]
      notes: 'A `Rectangle` of the color token, `border.width.thin` thick along the cross axis (`.frame(height:)` horizontal, `.frame(width:)` vertical), `.accessibilityHidden(true)` when decorative. With `label` the divider is an `HStack` of line–`Text`–line and is an accessibility element with that label (VoiceOver reads it as a section break); the label Text takes `fontSize` through `overrides`. Not SwiftUI''s `Divider` (fixed color).'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: decorative-divider-is-hidden-from-assistive-technology
      description: Decorative dividers are hidden so lists do not announce "separator" between every row.
      then:
        - { attribute: aria-hidden, is: 'true', platforms: [web, lit] }
        - { attribute: accessibilityElementsHidden, is: true, platforms: [rn] }
    - name: semantic-divider-is-a-separator
      description: 'true means the divider marks a real boundary: role=separator with aria-orientation. React Native has no separator role, so there is nothing to assert there.'
      given: { semantic: true }
      then:
        - { role: separator, platforms: [web, lit] }
        - { attribute: aria-orientation, is: horizontal, platforms: [web, lit] }
    - name: label-is-read-and-makes-the-divider-semantic
      description: 'A label turns the divider from decorative into a labelled separator, and the text is what gets read. On React Native only the rendered text is observable (no separator role), so the test there checks the text alone.'
      given: { label: or }
      then:
        - { text: or }
        - { role: separator, platforms: [web, lit] }
        - { name: or, platforms: [web, lit] }
  examples:
    - name: or-between-alternatives
      description: A labelled divider between two ways of signing in.
      given: { label: or, spacing: normal }
    - name: list-furniture
      description: The default line between rows of a dense list - decorative, and silent to assistive technology.
      given: { orientation: horizontal }
    - name: toolbar-groups
      description: 'A vertical line between groups of toolbar controls, stretching to the row height; shown inside a horizontal Stack with align stretch and gap tight, between the Texts "Bold Italic" and "Align left", so the row has a height to fill. The `orientation: vertical` enum story uses the same wrapper.'
      given: { orientation: vertical }
    - name: section-boundary
      description: 'An unlabelled line that still marks a real boundary a screen-reader user should hear on web, Lit and SwiftUI; on React Native it is silent by design and warns (see the rn notes).'
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

Decorative dividers are hidden from assistive technology so lists do not announce "separator" between every row (WCAG 1.3.1 — structure is conveyed by the list, not the line). Semantic dividers expose role `separator` with `aria-orientation`, and labelled ones take the label as their accessible name (separator children are presentational, so the name is set explicitly: `aria-labelledby` on web, `aria-label` on Lit) with the flanking line pieces hidden. The line is below the 3:1 non-text threshold on purpose — it is not required to identify anything (1.4.11 exemption), and the label, when present, meets 4.5:1.

## Platform notes

### Web
Decorative: `<hr aria-hidden="true" class="ds-divider">`. Semantic: `<div role="separator" aria-orientation={orientation}>` with, for a label, two aria-hidden flex-grow line spans around a `Text size="sm" tone="muted"` that names the separator through `aria-labelledby`. Vertical uses `inline-size: var(--border-width-thin); block-size: auto; min-block-size: 100%; align-self: stretch`.

### Lit
`<ds-divider>`; `<ds-divider semantic label="or">`. Host carries the styles and, when semantic, plain `role="separator"` and `aria-orientation` attributes (plus `aria-label` with a label); decorative hosts get `aria-hidden="true"`. The label renders in the shadow root.

### React Native
`View` with `height: t.borderWidthThin, backgroundColor: t.colorBorder` (or width for vertical, `alignSelf: 'stretch'`). Decorative: hidden from AT. Labelled: a row of two hidden lines with a `Text size="sm" tone="muted"` between; the text is what gets read.

## Related

Stack, Menu, List (planned), Heading.
