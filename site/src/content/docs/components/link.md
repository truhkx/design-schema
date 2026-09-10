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
      description: '`default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone — for links inside muted or on-action text.'
    download:
      type: boolean
      default: false
      description: Downloads the resource instead of navigating, under the server's file name (a custom file name is out of scope). Web only.
      platforms: [web, lit]
  events:
    onPress:
      description: Fired when the link is activated. On web the default navigation still happens unless the consumer prevents it; on native the consumer must navigate (the system opens URLs with Linking when no handler is given).
      platforms: { web: onClick, lit: 'click (native, retargeted — no CustomEvent)', rn: onPress }
  styles:
    color: { token: color.link }
    colorHover: { token: color.link.hover, description: Pointer hover and active state. }
    colorVisited: { token: color.link.visited, description: 'Web and Lit only; native has no visited state.' }
    underlineThickness: { token: border.width.thin, description: 'Text-decoration thickness; the underline is always present at rest.' }
    underlineOffset: { token: space.1 }
    externalIconGap: { token: space.1, description: 'Gap before the trailing icon, which is 1em of the surrounding font size (no token: it scales with the text).' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    focusRingRadius: { token: radius.sm }
    transition: { token: motion.duration.fast, description: 'Color transition on hover, with motion.easing.standard.' }
  copy:
    externalSuffix: ' (opens in new tab)'
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
      notes: 'A native <a href>. `external` sets target="_blank" and rel="noopener noreferrer". The visible label stays as-is; the external suffix is added in visually hidden text, not aria-label, so the accessible name still starts with the visible text.'
    lit:
      tag: ds-link
      reflect: [tone, external]
      notes: 'Wraps a native <a> in the shadow root with delegatesFocus. No custom event: the native click bubbles and retargets to the host. Consumers who intercept navigation call preventDefault on that click. A ds-link inside a ds-text paragraph is inline by default (display: inline).'
    rn:
      element: Text
      props: [accessibilityRole=link, accessibilityLabel, onPress]
      notes: 'Renders Text with accessibilityRole="link" so it is inline inside a parent Text. Activation calls `onPress(href)` when provided, otherwise Linking.openURL(href). `external` always uses Linking. No hover or visited state; the pressed state uses colorHover. On react-native-web this becomes a real anchor.'
---

Links take people somewhere. Buttons do things. That distinction is the whole reason this component exists: assistive technology lists links separately, users expect middle-click and open-in-new-tab to work on them, and the browser's history, visited state and find-in-page all depend on the element being a real link.

## When to use

Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to an external site, or to a downloadable file. Use it inline inside body text (it renders inline by default) and standalone in navigation lists. Use `external` whenever the destination leaves the product, so people are warned before they lose their place.

## When not to use

Do not use a Link to trigger an action — submitting, opening a dialog, toggling a setting — even if it looks lighter than a Button. Use the `ghost` Button variant for that. Do not remove the underline; underline-free links in body text are a WCAG 1.4.1 failure unless the link color contrasts 3:1 with the surrounding text *and* changes on hover, which no theme in this system promises. Do not render a Link with an empty `href` as a placeholder; render Text.

## Behavior

A Link has no typography of its own: it inherits font family, size, weight and line height from the text it sits in, so it looks right inside a paragraph, a caption, or a breadcrumb without configuration. Standalone, it inherits from the page body.

Activation with pointer, Enter, or assistive technology navigates to `href`. `onPress` fires first; on web the consumer may prevent the default to route client-side, and on native the consumer's handler is the navigation. With `external`, web opens a new tab and native hands the URL to the system. `download` asks the browser to save rather than open and does nothing on native. The link is never disabled: a destination that is not available is not rendered as a link.

## Content guidelines

Link text describes the destination and makes sense out of context, because screen-reader users navigate by pulling up a list of links: "View the billing history", not "click here" or "more". Keep links short and do not link whole sentences. When an external link's text is a product name, that is enough — the external suffix already says it leaves. Do not repeat "(opens in new tab)" in the visible text; the component adds it to the accessible name.

## Accessibility

The accessible name is the visible text (WCAG 2.4.4, 2.5.3), plus `copy.externalSuffix` for external links. Links are distinguishable from surrounding text by the underline, not by color alone (1.4.1). Link color meets 4.5:1 on the page background in both modes for the rest, hover and visited colors (1.4.3); the build checks all three. Focus is visible with the focus ring (2.4.7); because links are inline, the ring uses `focusRingRadius` and follows the text box rather than the line box. Links are keyboard operable with Enter (2.1.1). Opening a new tab is a change of context that the user is warned about in advance (3.2.5).

## Platform notes

### Web
Render `<a href>` with the visible label as content. For `external`, render, in order: the label, a visually hidden `<span>` containing `copy.externalSuffix`, then the decorative icon (an inline 1em SVG with `aria-hidden`). The visually hidden span uses the standard clip pattern (absolute, 1px box, clip-path inset 50%, white-space nowrap) — the one place where 1px literals are sanctioned. `font: inherit` on the anchor. Prefer `text-underline-offset` and `text-decoration-thickness` from the tokens over border tricks so the underline behaves in wrapped text.

### Lit
`<ds-link>` hosts a shadow root with `delegatesFocus: true` and a native `<a>` inside. Do not dispatch a CustomEvent named `click`; the native click retargets to the host and consumers listen for it there. The host defaults to `display: inline` so it can sit inside a `<ds-text>` paragraph; reflect `tone` and `external` so consumers can style from outside.

### React Native
Render `Text` with `accessibilityRole="link"` and `accessibilityLabel` (label plus the external suffix when `external`). Nested inside a parent `Text` it flows inline; standalone it is its own line. `onPress(href)` is the navigation when provided; otherwise call `Linking.openURL(href)` — never both. Standalone, the Link sets the body typography (`font.size.md`, `font.weight.regular`, `font.lineHeight.normal` via Text's helpers) since there is no cascade; nested in the system Text it inherits, which Text signals through an exported `TextNestingContext` — inside a raw RN Text the Link is standalone. Put a single space before the external glyph, since nested Text ignores margins. Platform limits, all acknowledged: no visited state (`colorVisited` unused), no hover (`colorHover` is the pressed color), no underline offset or thickness, and no focus events on `Text`, so the focus ring is the platform's own — `focusRing*` bindings are not applied.

## Related

Button, Text, Breadcrumb.
