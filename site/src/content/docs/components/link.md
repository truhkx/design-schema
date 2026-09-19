---
title: Link
description: Navigates to another page, screen, or location. Always underlined, always a real link, so the destination is exposed to assistive technology and to the platform.
component:
  name: Link
  category: navigation
  status: review
  apg: link
  anatomy: [anchor, label, externalIcon]
  props:
    href:
      type: string
      required: true
      description: The destination. A URL on web; a URL or app route on native, resolved by `onPress` when the consumer provides it.
    label:
      type: string
      required: true
      description: The link text. Also the accessible name. Says where the link goes, not "click here".
    external:
      type: boolean
      default: false
      description: Opens the destination in a new tab or the system browser and appends `copy.externalSuffix` to the accessible name, with a decorative trailing icon.
      a11y: Users are told the link leaves the current context before they activate it (WCAG 3.2.5 advisory, G201).
    tone:
      type: enum
      values: [default, inherit]
      default: default
      description: '`default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone — for links inside muted or on-action text. Under `inherit` the color, colorHover and colorVisited bindings are not applied: rest, hover, visited and (on native) pressed all resolve to the inherited color (currentColor on web and Lit, the enclosing TextStyleContext color on native), and the underline and the external icon follow that same color, so an inherited link has no hover or visited color change by design. On web the root takes `color: inherit`, and the color, :visited and :hover rules are scoped to the `tone: default` modifier. On native Link sets no textDecorationColor under either tone (the underline takes the Text color, so it follows the animated label colour), and under `inherit` the label runs no press animation, since rest and pressed resolve to the same colour; a standalone inherit link outside any system Text has nothing to inherit, so its label and icon both use color.foreground.'
    download:
      type: boolean
      default: false
      description: Downloads the resource instead of navigating, under the server's file name (a custom file name is out of scope). Web only.
      platforms: [web, lit]
  events:
    onPress:
      description: 'Fired when the link is activated. On web the default navigation still happens unless the consumer prevents it; on native the consumer must navigate (the system opens URLs with Linking when no handler is given). On Lit the name is the native anchor''s own `click`, retargeted out of the shadow root — Link emits no `press` CustomEvent. Cancelling: on web the handler receives the click event and cancels navigation with preventDefault or by returning `false` (typed `(event) => void | boolean`; Link calls preventDefault on `false`); on Lit the consumer calls preventDefault on the click; on native the handler receives `href` and returning `false` cancels the Linking hand-off, the only default action native has. `fires: [user]` means Link never dispatches it itself; on web and Lit a script calling `.click()` on the anchor still fires it, as on any link, and Link does not try to filter that out.'
      platforms: { web: onClick, lit: click, rn: onPress, swiftui: action }
      cancelable: true
      fires: [user]
  styles:
    color: { token: color.link }
    colorHover: { token: color.link.hover, state: hover, description: 'Pointer hover only on web and Lit (not :active), as a plain `:hover` rule with no `@media (hover: hover)` guard; a sticky hover color after a tap is an accepted, proven pair. On native, which has no hover, the pressed color.' }
    colorVisited: { token: color.link.visited, description: 'Web and Lit only; native has no visited state.' }
    underlineThickness: { token: border.width.thin, description: 'Text-decoration thickness; the underline is always present at rest.' }
    underlineOffset: { token: space.1 }
    externalIconGap: { token: space.1, part: externalIcon, description: 'Gap before the trailing icon, applied as margin-inline-start on Link''s own `externalIcon` wrapper span (inline text has no Stack to use), never on the Icon inside it. The icon is 1em of the surrounding font size (no token: it scales with the text). On React Native nested Text ignores margins, so the gap is a single literal space and this binding is not applied. An override of it is written only while `external` is true, the only time the binding is in effect.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    focusRingRadius: { token: radius.sm, description: 'Applied (as border-radius) only under :focus-visible, so a resting inline anchor is not rounded.' }
    focusRingOffset: { token: border.width.focus, description: 'outline-offset of the focus ring on web and Lit, the same token as its width. Not applied on native, where the ring is the platform''s own.' }
    transition: { token: motion.duration.fast, description: 'Color transition on hover, with motion.easing.standard. Only `color` transitions; the underline follows it through currentColor.' }
  copy:
    externalSuffix: ' (opens in new tab)'
    # external is SwiftUI's accessibility label only; web, Lit and RN never render it (they use externalSuffix).
    external: opens in new tab
  a11y:
    role: link
    requires: [accessible-name, focus-visible, keyboard-operable, contrast-aa]
    contrast:
      - { foreground: color.link, background: color.background, level: AA }
      - { foreground: color.link.hover, background: color.background, level: AA }
      - { foreground: color.link.visited, background: color.background, level: AA }
  platforms:
    web:
      element: a
      attributes: [href, target, rel, download]
      notes: 'A native <a href>. `external` sets target="_blank" and rel="noopener noreferrer". The visible label stays as-is; the external suffix is added in visually hidden text, not aria-label, so the accessible name still starts with the visible text. Link accepts no `className` or `style`: a composite that shows a link inside its own row uses `tone: inherit` and keeps the underline. The root <a> carries `data-ds="Link"` and `data-part="anchor"`, and those win: a parent never stamps its own `data-part` onto Link''s root, it puts its part on a wrapper element it owns. The `label` part is a `<span data-part="label">` holding the visible text inside the anchor (web and Lit); on native the root Text is the anchor and the label is its string content, with no element of its own. Lit shadow elements carry `part` as well as `data-part`, both the anatomy names: they are names tests read, not a styling surface. Locked bindings (the three colours and the focus ring bindings, which carry contrast and focus guarantees) get no `--ds-link-*` hook on web or Lit: their rules read the token directly, so consumer CSS cannot swap an accessibility-bearing colour. Example stories take their `given` as args over meta args that hold only schema defaults, which counts as exactly the `given`.'
    lit:
      tag: ds-link
      reflect: [tone, external, download]
      notes: 'Wraps a native <a> in the shadow root with delegatesFocus. No custom event: the native click bubbles and retargets to the host. Consumers who intercept navigation call preventDefault on that click. A ds-link inside a ds-text paragraph is inline by default (display: inline). `href` and `label` are required but a property needs an initial value, so both start as '''' and Link does not warn; an empty href is the consumer''s authoring error (render Text instead). ds-link has no slot: the text comes only from `label`, so `<ds-link href>text</ds-link>` renders an unnamed anchor.'
    rn:
      element: Text
      props: [accessibilityRole=link, accessibilityLabel, onPress]
      notes: 'Renders Text with accessibilityRole="link" so it is inline inside a parent Text. The external mark is `Icon name="external" inline`, preceded by a single literal space (nested Text ignores margins, so `externalIconGap` is not applied). With `tone: default` Link passes the link color to Icon''s `color` prop, and it swaps instantly on press while the label crossfades; with `tone: inherit` Link passes no `color`, so Icon takes the enclosing TextStyleContext color when nested in a system Text and color.foreground otherwise. Of the override bindings only `transition` has an effect on native (Text cannot set underline thickness/offset, and the gap is a space), so the native LinkOverridableBinding type is `transition` alone. Activation calls `onPress(href)` first when provided, and returning `false` from it cancels any Linking hand-off. For a non-external link that handler is the navigation and Linking.openURL(href) is only the fallback when there is no handler; an `external` link hands off to Linking.openURL(href) after the handler as well, because a consumer''s own router cannot open the system browser. `accessibilityLabel` is the label plus `copy.externalSuffix` verbatim when `external`: one suffix string on every platform, kept even though native opens the system browser rather than a tab; `copy.external` is unused on native. Icon''s inline mode renders at font.size.md rather than the enclosing Text''s size, which is Icon''s own documented limit and can look mis-sized inside a non-md Text. No hover or visited state; the pressed state uses colorHover. On react-native-web Link forwards `href` to the Text (through an untyped prop bag, since native Text types have no `href`) so it renders a real <a>, plus `hrefAttrs` { target: _blank, rel: noopener noreferrer } when `external`; there the browser navigates as on web, Linking is not called, and a handler returning `false` calls preventDefault. A rejected `Linking.openURL` (unsupported scheme, unhandled route) is swallowed silently. The forwarded focus and hover handlers are typed `(event: unknown) => void` and passed through the same untyped bag, since native Text types do not declare them. Each platform''s own test file mocks Linking to cover the fallback and the external hand-off, which the scenario cannot express. Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur` and `onLongPress` to the native element, so Tooltip can attach to it through those props; Link exposes no `ref` prop and no ref to its Text root.'
    swiftui:
      element: Link
      props: [Link, Button, .accessibilityAddTraits=isLink, openURL, .underline, .accessibilityHint]
      notes: 'SwiftUI `Link(destination:)` for `href` (opens through `@Environment(\.openURL)`, so an app can intercept in-app routes); a `Button` with `.isLink` trait when only `action` is given. Underline from the `underline` token via `.underline(true, pattern: .solid, color:)`; `external` appends the `external` Icon inline and `copy.external` to the accessibility label. Inline links inside `Text` render as `Text` concatenation with `.link` attribute for the URL, so a paragraph with a link is one accessibility element with the link as a rotor item.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/focusable ones from the schema.
    - name: click-fires-on-press
      description: 'Activation with pointer, Enter, or assistive technology navigates to href; onPress fires first. On web and Lit the test cancels the click with preventDefault so the test page does not navigate.'
      when: { click: anchor }
      then:
        - { event: onPress }
    - name: external-link-announces-that-it-leaves
      description: 'The accessible name is the visible text plus copy.externalSuffix, so users are told the link leaves the current context before they activate it. On web and Lit the `copy` expectation reads the anchor''s text content, where the suffix sits in visually hidden text; the name is reached through the shadow root on Lit and is the accessibilityLabel on native.'
      given: { external: true, label: 'View the billing history' }
      then:
        - { copy: externalSuffix, platforms: [web, lit] }
        - { name: 'View the billing history (opens in new tab)', platforms: [web, lit, rn] }
    - name: external-link-opens-a-new-tab
      description: 'external sets target="_blank" and rel="noopener noreferrer" on web and Lit.'
      given: { external: true }
      then:
        - { attribute: target, is: _blank, platforms: [web, lit] }
        - { attribute: rel, is: 'noopener noreferrer', platforms: [web, lit] }
    - name: download-asks-the-browser-to-save
      description: 'download asks the browser to save rather than open (web and Lit only); the attribute is present and valueless.'
      given: { download: true }
      then:
        - { attribute: download, is: '', platforms: [web, lit] }
  examples:
    - name: inline-in-a-paragraph
      description: 'The default link inside body text, underlined and taking the paragraph''s typography. The story renders it inside a default Text paragraph reading "Invoices from the last twelve months are kept. " followed by the link and a full stop. Its href and label are also the Default story''s args, so the derived renders and accessible-name scenarios run against them.'
      given: { href: '/billing/history', label: 'View the billing history' }
    - name: external-destination
      description: 'A link that leaves the product, so the name says so before it is activated. This example is the `external` state story (and downloadable-file the `download` one); no separate External or Download story is added. Both render standalone, not inside a Text paragraph.'
      given: { href: 'https://status.example.com', label: 'Status page', external: true }
    - name: inside-muted-text
      description: 'A link in muted or on-action text, where the color is inherited and the underline alone marks it. The story renders it inside a Text with `tone: muted` reading "For how charges are calculated, read " followed by the link and a full stop. The `tone: inherit` enum story uses the same muted wrapper and sentence with the Default href and label, so the inherited color is visible.'
      given: { href: '/help/billing', label: 'the billing guide', tone: inherit }
    - name: downloadable-file
      description: A link to a file the browser should save rather than open.
      given: { href: '/invoices/2026-09.pdf', label: 'Download the September invoice', download: true }
      platforms: [web, lit]
---

Links take people somewhere. Buttons do things. That distinction is the whole reason this component exists: assistive technology lists links separately, users expect middle-click and open-in-new-tab to work on them, and the browser's history, visited state and find-in-page all depend on the element being a real link.

## When to use

Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to an external site, or to a downloadable file. Use it inline inside body text (it renders inline by default) and standalone in navigation lists. Use `external` whenever the destination leaves the product, so people are warned before they lose their place.

## When not to use

Do not use a Link to trigger an action — submitting, opening a dialog, toggling a setting — even if it looks lighter than a Button. Use the `ghost` Button variant for that. Do not remove the underline; underline-free links in body text are a WCAG 1.4.1 failure unless the link color contrasts 3:1 with the surrounding text *and* changes on hover, which no theme in this system promises. Do not render a Link with an empty `href` as a placeholder; render Text.

## Behavior

A Link has no typography of its own: it inherits font family, size, weight and line height from the text it sits in, so it looks right inside a paragraph, a caption, or a breadcrumb without configuration. Standalone, it inherits from the page body.

Activation with pointer, Enter, or assistive technology navigates to `href`. `onPress` fires first; on web the consumer may prevent the default to route client-side, and on native the consumer's handler is the navigation (an `external` link still hands off to the system afterwards unless the handler returns `false`). With `external`, web opens a new tab and native hands the URL to the system. `download` asks the browser to save rather than open and does nothing on native. The link is never disabled: a destination that is not available is not rendered as a link. Link has no current-page state and forwards no `aria-current`; the current item of a navigation (Breadcrumb''s last item, a drawer''s current page) is rendered as Text, not as a Link.

## Content guidelines

Link text describes the destination and makes sense out of context, because screen-reader users navigate by pulling up a list of links: "View the billing history", not "click here" or "more". Keep links short and do not link whole sentences. When an external link's text is a product name, that is enough — the external suffix already says it leaves. Do not repeat "(opens in new tab)" in the visible text; the component adds it to the accessible name.

## Accessibility

The accessible name is the visible text (WCAG 2.4.4, 2.5.3), plus `copy.externalSuffix` for external links. Links are distinguishable from surrounding text by the underline, not by color alone (1.4.1). Link color meets 4.5:1 on the page background in both modes for the rest, hover and visited colors (1.4.3); the build checks all three. Focus is visible with the focus ring (2.4.7); because links are inline, the ring uses `focusRingRadius` and follows the text box rather than the line box. Links are keyboard operable with Enter (2.1.1). Opening a new tab is a change of context that the user is warned about in advance (3.2.5).

## Platform notes

### Web
Render `<a href>` with the visible label as content. For `external`, render, in order: the label, a visually hidden `<span>` containing `copy.externalSuffix`, then the decorative icon: a `<span data-part="externalIcon">` wrapper carrying the `externalIconGap` margin, containing the system `<Icon name="external" inline />` with no label (so it hides itself). Icon's `inline` sizes it at 1em of the surrounding text, and its color is currentColor, so it follows the anchor's rest, hover and visited colors; no hand-drawn SVG. The visually hidden span uses the standard clip pattern (position absolute, 1px box, margin -1px, overflow hidden, border 0, clip-path inset(50%), white-space nowrap; no legacy clip: rect) — the one place where 1px literals are sanctioned. `font: inherit` on the anchor. Prefer `text-underline-offset` and `text-decoration-thickness` from the tokens over border tricks so the underline behaves in wrapped text.

### Lit
`<ds-link>` hosts a shadow root with `delegatesFocus: true` and a native `<a>` inside. Do not dispatch a CustomEvent named `click`; the native click retargets to the host and consumers listen for it there. The host defaults to `display: inline` so it can sit inside a `<ds-text>` paragraph; reflect `tone` and `external` so consumers can style from outside.

### React Native
Render `Text` with `accessibilityRole="link"` and `accessibilityLabel` (label plus the external suffix when `external`). Nested inside a parent `Text` it flows inline; standalone it is its own line. `onPress(href)` is the navigation when provided; otherwise call `Linking.openURL(href)`. The one exception is `external`: after the handler runs, Link still calls `Linking.openURL(href)` unless the handler returned `false`. Standalone, the Link sets the body typography (`font.size.md`, `font.weight.regular`, `font.lineHeight.normal` via Text's helpers) since there is no cascade; nested in the system Text it inherits, which Text signals through its exported `TextStyleContext` (its `nested` field; there is no `TextNestingContext`) — inside a raw RN Text the Link is standalone. Put a single space before the external glyph, since nested Text ignores margins. Platform limits, all acknowledged: no visited state (`colorVisited` unused), no hover (`colorHover` is the pressed color), no underline offset or thickness, and no focus events on `Text`, so the focus ring is the platform's own — `focusRing*` bindings are not applied.

## Related

Button, Text, Breadcrumb.
