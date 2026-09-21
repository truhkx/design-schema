---
title: Card
description: A bounded surface for one thing — a record, a summary, a choice — with an optional heading row and action row, padded and spaced by the theme's rhythm.
component:
  name: Card
  category: container
  status: review
  anatomy: [surface, header, heading, headerActions, body, footer]
  parts:
    body: { kind: slot, slot: { default: true, prop: children, required: true } }
    headerActions: { kind: slot, slot: { prop: headerActions } }
    footer: { kind: slot, slot: { prop: footer } }
  props:
    children:
      type: content
      required: true
      description: 'The body. Usually a Stack of Text and controls; a plain string or number is rendered inside the system Text with its defaults (a bare string cannot sit in a native View), including each top-level string or number in an array body. The wrap is a native requirement, not a cross-platform contract: Lit leaves a bare slotted text node alone, because wrapping it would mean reparenting the consumer''s light-DOM children, which Card never does. Fragments and arrays are flattened before the wrap, exactly as they are when the interactive target is looked for, so a string directly inside a top-level Fragment is wrapped too.'
    heading:
      type: string
      description: 'The card''s title, rendered as the system Heading at the card''s level and at `size: lg` on every platform, so a card heading reads smaller than a page heading. Omit for cards that are a single piece of content; an empty string counts as omitted (no article, no label) — but the header row still renders when `headerActions` is set, holding the actions alone. It is an anatomy part by name only: it carries no `data-part`, since it is the system Heading and keeps that component''s own hook.'
    headingLevel:
      type: enum
      values: ['2', '3', '4', '5', '6']
      default: '3'
      description: Heading level for `heading`, so cards fit the page outline. Cards in a list share a level.
    headerActions:
      type: content
      description: 'Controls at the end of the header row — a ghost icon-only Button, a Link. At most two: a content guideline, not a runtime check, as with every other soft content limit here.'
    footer:
      type: content
      description: The action row. Buttons in a row, primary first, following Form's action-order rule.
    inset:
      type: enum
      enumRef: size
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
      description: 'The whole card is one link or button target. Requires exactly one interactive child (a Link or Button) whose action the card extends to its full area; the card itself is not focusable. The child is looked for among the top-level children of the body only (web and Lit also accept a native a[href] or button there); controls nested inside a wrapper such as a Stack are not searched, so place the link at the top level beside any Text. A top-level Fragment is flattened, so its children count as top-level; on Lit there is nothing to flatten, since a nested template''s nodes are already siblings and are assigned to the default slot as top-level children. With zero or several such children the card stays non-interactive (no hit area, no hover background, no press) and warns once per mounted card in development — latched for the life of the mount, so a card that goes valid and then invalid again does not warn a second time. The warning text is a development diagnostic, not user-facing copy, so it is not a `copy.*` string and its wording may differ between platforms. If the child is disabled the card is disabled with it: no hover background, pressing does nothing, and on native the Pressable reports disabled. The card itself never dims — there is no disabled opacity binding here; the child renders its own disabled state. Controls in `headerActions` and `footer` are never the target; they sit above the hit area and keep their own targets.'
      a11y: The card never becomes a second focus stop; its single child link or button is the target, and the card enlarges the hit area only (pseudo-element on web, wrapping Pressable on native).
    focusable:
      type: boolean
      default: false
      description: 'The card root takes tabindex=-1 so a container (Feed) can move focus to it by script, and draws its own focus ring when focused that way. Not a tab stop; not for making cards clickable (`interactive`). With `interactive` also set, `interactive` wins and this is a no-op — the card already has a target — and a development warning says so. It stays a no-op whenever `interactive` is set, even when that card fell back to non-interactive for want of a single target. On web and Lit the ring is an outline of focusRingWidth in focusRing, drawn outside the box, so a focusable card reserves no border; React Native has no outline, so there it reserves border.width.focus like an interactive card. On Lit the shadow root deliberately does not use delegatesFocus — the documented exemption from the rule that focusable elements delegate — so scripted focus lands on the card and not on its first focusable child.'
      a11y: 'Only scripted focus (PageUp/PageDown in a Feed) lands here, so the card draws the ring whenever it takes focus, not only on :focus-visible: it sets a focus-ring state in its own focusin handler and clears it on focusout, skipping the state when that focusin follows a pointerdown on the card. Plain :focus-visible is not enough — Chromium does not match it on a programmatic focus() that follows a pointer interaction, which is exactly the Feed case.'
  styles:
    paddingBlock: { token: 'layout.inset.{inset}' }
    paddingInline: { token: 'layout.inset.{inset}' }
    partGap: { token: layout.gap.loose, description: 'Vertical gap between header, body and footer.' }
    headerGap: { token: layout.gap.normal, part: header, description: Horizontal gap between the heading and headerActions. }
    footerGap: { token: layout.gap.tight, part: footer, description: Horizontal gap between footer actions. }
    actionsGap: { token: layout.gap.tight, part: headerActions, description: Horizontal gap between the headerActions controls. }
    background: { token: 'color.background.{surface}' }
    border: { token: color.border, description: 'In effect with surface default only; a subtle card draws no border, so an override of this binding changes nothing there.' }
    borderWidth: { token: border.width.thin, description: 'Rendered only with surface default. An interactive card always reserves border.width.focus instead, so the ring appearing never shifts the layout; at rest that border is colored `border` on surface default (the card keeps its visible border) and transparent on subtle, and `focusRing` while the ring shows. The reserve is keyed on the `interactive` prop alone, not on whether a target was found, so a card that fell back to non-interactive still reserves the width rather than changing its geometry on a content change. React Native reserves it for `focusable` cards too, since it has no outline to draw outside the box. An override of this binding therefore only changes cards that are neither interactive nor (on native) focusable.' }
    radius: { token: radius.lg }
    hoverBackground: { token: color.background.subtle, state: hover, by: surface, values: { default: color.background.subtle, subtle: color.background.strong }, description: 'Interactive cards only, on pointer hover (a plain `:hover` on web and Lit, no `@media (hover: hover)` guard, as Link). The surface picks the token — a subtle card cannot hover to its own background — and the same lookup applies on every platform. Native has no hover, so the Pressable shows it while pressed, and on pointer hover where the platform reports one (iPad pointer, react-native-web).' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    transition: { token: motion.duration.fast, description: 'Interactive hover, with motion.easing.standard. Native has no continuous hover to animate between — the pressed style swaps instantly — so the binding exists there for API parity and has no runtime effect.' }
  a11y:
    role: none
    requires: [heading-hierarchy, focus-visible, contrast-aa]
    contrast:
      - { foreground: color.foreground, background: 'color.background.{surface}', level: AA }
      - { foreground: color.foreground.muted, background: 'color.background.{surface}', level: AA }
      - { foreground: color.link, background: 'color.background.{surface}', level: AA }
      - { foreground: color.foreground, background: color.background.strong, level: AA }
      - { foreground: color.link, background: color.background.strong, level: AA }
  platforms:
    web:
      element: article
      attributes: [aria-labelledby]
      notes: 'An <article> when it has a heading (aria-labelledby the heading id), a <div> otherwise. Header, body and footer are plain flex rows/columns styled from this component''s own gap bindings (not the Stack component: Stack owns page rhythm and its gap enum, while these gaps are Card''s bindings and must stay overridable per instance). Interactive: the single child link/button gets a ::after pseudo-element covering the card (position: relative on the card), so the hit area grows without adding a focus stop; the focus ring is drawn on the card only while that target has keyboard focus (`:has([data-ds-card-target]:focus-visible)`), never for mouse focus or a focused headerActions or footer control. A disabled target is `:has([data-ds-card-target]:is([aria-disabled=''true''], :disabled))`, which covers Button''s `disabled`, a disabled Form and a native disabled button; pressing is already blocked by the child, so the ::after stays. On interactive cards only, the header-actions and footer rows get position: relative and z-index: 1 so their controls stay above the ::after (plain cards get no stacking context). `focusable` draws its ring as an outline of focusRingWidth in focusRing, no offset, on :focus-visible, so a focusable card reserves no border. The Heading gets `overrides={{ marginBlockEnd: ''space.0'' }}` so its own bottom margin adds no space inside the header row (every platform). Card reaches the child by cloning it with a `data-ds-card-target` attribute — the one sanctioned exception to "never touch a child", because the hit area is the card''s own geometry. It is an attribute, not a class, because Link and Button accept no className; both pass data attributes through `...rest` to their root. The schema''s a11y.role is `none` because a card without a heading has none; with a heading the element is an <article> named by it, and that is the specific rule.'
    lit:
      tag: ds-card
      reflect: [inset, surface, interactive, focusable, heading-level]
      notes: 'Shadow root with named slots `header-actions` and `footer`, default slot for the body, and the heading rendered from the `heading` property as a <ds-heading>. The rows are the card''s own flex rows, not ds-stack, so their gaps stay overridable. The host is named with aria-label={heading} rather than an idref, since ids do not cross the shadow root. The interactive hit-area trick works across the shadow boundary only if the link is slotted: the host gets position: relative and the slotted link is told (via a class the card adds on slotchange) to extend. The rule for that class is the card''s own to install — inject it once per root node (document head, or the nearest ancestor shadow root) rather than expecting a global stylesheet. With no interactive child, or more than one, the card stays non-interactive and warns in development. The target is looked for among the default slot''s assigned elements only, not their descendants. A click on the extended area lands on the ds-link/ds-button host, not its inner native element, so the card forwards a click whose target is that host by calling click() on the inner a[href]/button in the child''s open shadow root — the same sanctioned exception as the class. That forwarder re-checks the target''s disabled state itself: a click on the extended area never reaches the child''s own guard, so without the check a disabled target would still be activated. The ring shows only while that target has keyboard focus: the card toggles a `target-focus` custom state on focusin/focusout when the focused element matches :focus-visible and draws on :host(:state(target-focus)); a focused header-actions or footer control does not ring the card. On interactive cards only, the header-actions and footer rows get position: relative and z-index: 1 above the hit area. The hover rules use two more custom states: `has-target` (exactly one target found) and `target-disabled` (the target has a `disabled` attribute or aria-disabled="true", watched with a MutationObserver that writes nothing back). The zero-or-several warning is not judged on the first update: it runs on the default slot''s slotchange and when `interactive` changes. `focusable`: the host itself takes tabindex="-1" and the shadow root does not use delegatesFocus, so scripted focus lands on the card rather than its first focusable child; the ring is an outline on the surface part while the host matches :focus-visible, and the host''s own outline is removed. With a heading the host gets role="article" as a plain attribute unless the consumer already set a role, and aria-label with the heading text unless the consumer already set one; the card removes only a role or aria-label it wrote itself.'
    rn:
      element: View
      props: [accessibilityRole, accessibilityLabel]
      notes: 'View with padding/background/border/radius from tokens; header and footer are plain row Views styled from this component''s gap bindings, not Stack. The root View is the `surface` part and keeps `testID="Card"`; there is no `Card.surface`, and the heading keeps Heading''s own hook. Interactive: the card wraps its content in a Pressable whose press runs the single child Link/Button''s own press behavior (for Button that includes its tracking, `type: submit` and its disabled/loading guard, with a disabled Form counting as disabled) and takes accessibilityRole and the child''s resolved accessibilityLabel from it (Button''s `accessibleName ?? accessibilityLabel ?? label`). That Pressable is the card''s single target and single focus stop — "the card adds no second stop" means exactly one, not zero, here. Button and Link do not forward an `accessible` prop, so the child is neutralised by wrapping it in a View with pointerEvents="none", accessibilityElementsHidden and importantForAccessibility="no". Only `children` is searched for that child: a Button or Link in `headerActions` or `footer` keeps its own target and is not collapsed. hoverBackground shows while the Pressable is pressed, and on hover where a pointer exists (iPad, react-native-web). A disabled child makes the Pressable disabled (accessibilityState disabled, press ignored). A focusable card reserves border.width.focus like an interactive one. `focusable` is a react-native-web capability: RN core types View without onFocus/onBlur and Android treats tabIndex -1 as not focusable, so on iOS and Android no container can move focus to the card by script; screen-reader users reach each card by swiping, its Heading being a header. The Heading gets `level` from headingLevel and `size: lg`; native has no heading levels, so headingLevel changes nothing visible or announced there and is passed for parity. accessibilityRole and accessibilityLabel belong to the interactive Pressable only: a non-interactive card''s root View carries neither, because labelling it would collapse the card into one accessibility node and hide the Heading, body and footer from swipe navigation — so on native a heading names the Heading, never the container, and there is no article equivalent. An interactive card whose target is a Link presses that Link''s native path (Linking.openURL), so under react-native-web it opens a new window rather than navigating in place, unlike a bare Link; no component in the package reaches for DOM globals to change that.'
    swiftui:
      element: VStack
      props: [.padding, .background, .overlay=border, .clipShape, .accessibilityElement=contain, .accessibilityLabel, .contentShape, .focusable, .focused]
      notes: 'Surface from the tokens, `inset` padding, header row (`Heading` + `headerActions` HStack), body, footer with the gap bindings. `.accessibilityElement(children: .contain)` labelled by the heading. `interactive`: the card is wrapped in a `Button` whose action is the single child link/button''s action (found by the child declaring itself through `CardActionPreference`), the child is `.accessibilityHidden` inside it, and hover shows `hoverBackground` on iPad pointer — one target, one focus stop. `focusable`: `.focusable()` with the focus ring drawn on the card, for Feed''s PageUp/PageDown.'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: heading-is-rendered-as-a-heading
      description: The heading is rendered as a Heading at the card's level, and it is what a screen-reader user jumps to.
      given: { heading: 'Team plan' }
      then:
        - { text: 'Team plan' }
        - { role: heading, platforms: [web] }
    - name: a-card-with-a-heading-is-an-article
      description: A card with a heading is an article labelled by that heading, so screen-reader users can navigate card by card.
      given: { heading: 'Team plan' }
      then:
        - { role: article, platforms: [web, lit] }
    - name: interactive-adds-no-focus-stop
      description: 'An interactive card extends its single child link or button to the whole area; the card itself is never a second tab stop. As in whole-card-is-a-link, the children string is rendered as a top-level Link with that label (href #), so the card has a real target.'
      given: { heading: 'September invoice', children: 'A Link to the invoice', interactive: true }
      then:
        - { focusable: false }
      platforms: [web, lit]
    - name: focusable-takes-scripted-focus-only
      description: 'A focusable card carries tabindex=-1 so a container (Feed) can move focus to it by script; it is not a tab stop.'
      given: { focusable: true }
      then:
        - { attribute: tabindex, is: '-1', platforms: [web, lit] }
        - { focusable: true, platforms: [web] }
  examples:
    - name: plan-card
      description: A card as a unit in a list of choices, with its own heading at the list's level.
      given: { heading: 'Team plan', headingLevel: '3', children: 'What the plan includes' }
    - name: dense-grid-card
      description: 'A card in a dense grid, on the tinted surface and with the tighter inset, and no heading: the story clears any Default heading.'
      given: { heading: '', children: 'A search result', inset: sm, surface: subtle }
    - name: whole-card-is-a-link
      description: 'A card whose single child link leads somewhere, with the card as the hit area and the link as the only tab stop. The children string describes content, not a value: render a Link labelled with that text (href #) at the top level of the body.'
      given: { heading: 'September invoice', children: 'A Link to the invoice', interactive: true }
    - name: card-focused-by-a-feed
      description: A card a Feed moves focus to with PageUp/PageDown, which draws its own ring when focused that way.
      given: { heading: 'New comment', children: 'The comment body', focusable: true }
---

A Card frames one thing so it can sit among others: a search result, a plan to choose, a setting group, a dashboard panel. It is a Box with conventions — a heading row, a body, an action row, consistent padding and gaps from the theme's rhythm — so that every card on every screen has the same internal spacing without anyone choosing it.

## When to use

Use Cards for collections of like items where each needs its own boundary, and for a single panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page. Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.

## When not to use

Do not put a card inside a card. Do not use Cards to separate sections of a form or a settings page — that is a Landmark or a Heading with `section` spacing. Do not use a Card for a status message (Alert) or for a transient layer (Dialog, planned). Do not use `interactive` with more than one control inside; nested targets are a well-known accessibility failure.

## Behavior

The header renders when `heading` or `headerActions` is present, the footer when `footer` is present; body always. Present means not `undefined`, `null` or `false`: a `0` or an empty string is content and renders its row. Header, body and footer are separated by `partGap`, and the card pads all of it by `inset`. `surface: default` draws a border, `subtle` does not. An `interactive` card grows its single child link or button's hit area to the whole card, shows `hoverBackground` on pointer hover, and draws the focus ring around the card when that child has keyboard focus — but adds no focus stop of its own. A `focusable` card carries `tabIndex={-1}` on its root and draws the same ring on its own `:focus-visible`; `tabIndex` is not a Card prop, and a caller who wants scripted focus sets `focusable` (which wins over any `tabIndex` in `...rest`). Every anatomy part carries `data-part` with its name on the element that holds it — the root is `surface`, and `header`, `headerActions`, `body` and `footer` are the row or wrapper around their content, not a slot element — except `heading`: it is the system Heading, which keeps its own hook, and is located by role heading or its text. Aria attributes passed through `...rest` (role, aria-posinset, aria-setsize, aria-describedby) land on the root, which is how Feed makes a Card an article.

## Content guidelines

Headings are short noun phrases, sentence case, one line. Footers hold one primary action at most, placed first, then one secondary; a card with more choices than that is a form. Body text keeps to a few lines; a card is a summary, and the detail lives where its action goes.

## Accessibility

A card with a heading is an `article` labelled by that heading, so screen-reader users can navigate card by card and hear each one's name (WCAG 1.3.1, 2.4.6); heading levels are consistent within a list and fit the page outline (heading-hierarchy). Interactive cards keep exactly one tab stop — the child link or button — and show a visible focus ring on the card (2.4.7), so keyboard users get the same large target as pointer users (2.5.8) without a redundant stop. Text on either surface meets 4.5:1 in both modes; the build checks body, muted and link foreground against both.

## Platform notes

### Web
Render `<article aria-labelledby={headingId}>` (or `<div>` without a heading) with `ds-card` classes for `inset`, `surface` and `interactive`. Header: a flex row with `justify-content: space-between` and `gap` from `headerGap`, containing the Heading (level from `headingLevel`, `size: lg` so a card heading reads smaller than a page heading) and the actions in a row with `gap` from `actionsGap`. Footer: a flex row with `gap` from `footerGap`. The rows are Card's own markup, not Stack, so their gaps stay per-instance overridable. Interactive: `position: relative` on the card; the single link/button child receives a `data-ds-card-target` attribute whose rule adds `::after { content: ''; position: absolute; inset: 0 }`; `:has([data-ds-card-target]:focus-visible)` draws the ring on the card, and the header-actions and footer rows sit above the hit area with `position: relative; z-index: 1`.

### Lit
`<ds-card heading="Plan" heading-level="3" inset="md">` with slots `header-actions`, default, and `footer`. Renders `<ds-heading size="lg">` internally (same size on every platform); header and footer rows are Card's own flex rows, not `<ds-stack>`. For `interactive`, on `slotchange` find the single `ds-link`/`ds-button` among the default slot's assigned elements (not their descendants), add the extending class to it, forward clicks on its host to its inner native element, and draw the ring on `:host(:state(target-focus))` while it has keyboard focus. Because the class lands in the light DOM, the card injects the rule for it once into whichever root node the slotted element resolves in, rather than depending on a stylesheet it does not own. The selector matches a raw `a[href]` or `button` too, so a plain anchor gets the same hit area.

### React Native
`View` with padding, background, border and radius from tokens; header and footer are plain row Views styled from Card's own gap bindings; the heading is the system `Heading` at `size: lg`. For `interactive`, wrap the content in a `Pressable` whose `onPress` calls the single child's handler and whose `accessibilityRole` and `accessibilityLabel` are copied from it; render the child with `accessible={false}` so it collapses into the Pressable.

## Related

Box, Stack, Heading, Button, Link, Container.
