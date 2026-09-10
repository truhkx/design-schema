---
title: Warm & friendly
description: Terracotta warmth over cream neutrals, generously rounded corners, roomy spacing and unhurried motion. For a small business that wants to feel like a person, not a chain.
theme:
  id: warm-friendly
  status: draft
  tone: [warm, friendly, generous, unhurried]
  not: corporate
  seed:
    color: '#C8552D'
    typeface: system
    mono: system
  neutralTint: 0.3
  scale: { base: 16, ratio: 1.333 }
  radius: lg
  density: roomy
  motion: subtle
  elevation: subtle
  layout: { rhythm: loose, contentWidth: 1040 }
  modes: { default: light, supports: [light, dark] }
---

Warm & friendly is for a small local business that sells to neighbors and to strangers on the internet with the same handwriting on both. Think a bakery-café that also ships online orders: a menu board and a checkout page have to feel like the same person made them. It is unhurried by design — nobody orders a croissant under deadline pressure — and it leans on warmth instead of polish to earn trust.

## Feel

Surfaces are cream rather than white: the terracotta seed bleeds gently into the neutrals so the page reads like the inside of a bakery, not a lightbox. The accent is terracotta itself — on primary actions, focus rings and the handful of links a menu or an order page needs — and it is warm enough to feel handmade without tipping into orange. Corners are generously rounded (large radius): buttons, cards and photos of the morning's bread all feel soft, the way a stamped paper bag does. Type is the platform's own system face, kept plain so the personality comes from color and space rather than lettering, on a wide 1.333 scale — headings are noticeably bigger than body copy, so a single price or a single pastry name can carry a whole section. Spacing is roomy and the rhythm between sections is loose: there is air around the "order online" button the same way there is a counter's worth of space between the register and the pastry case.

Motion is subtle — short, eased, and never showy — because the confidence here comes from warmth and space, not from movement. Emphasis is made by giving the important thing (today's special, the "add to cart" button) more room and a warmer fill, never by making it bigger or louder than the tone allows.

## Not corporate

When a decision is borderline, this is the tiebreaker. Prefer the rounder corner over the sharp one. Prefer the warmer, cream surface over a stark white one. Prefer generous padding over a tight, efficient layout. Prefer a plain-spoken label ("Order for pickup") over a polished one ("Initiate Pickup Request"). Prefer a photo of the actual bread over an icon. Prefer the calmer motion over the flashy one — friendly does not mean loud. If a choice would make the shop feel like a franchise or a form, make the other choice.

## References

Learn from a well-run neighborhood bakery's own signage and paper bags — legible, warm, unfussy — and from Squarespace's restaurant templates for how a small menu and an online order flow can share one voice. Avoid the look of enterprise SaaS dashboards and quick-service chain apps: dense grids, cool blues, and loyalty-app gamification all read as corporate here.

## When to use

Choose this theme for small, owner-run businesses selling food, craft goods, or services where the brand is the person behind the counter — a bakery, café, florist, or studio with a public storefront and a matching online shop. It works well anywhere the customer should feel greeted rather than processed.

## When not to use

Do not use it for professional tools, dashboards, or anything used under time pressure — the roomy spacing and unhurried motion will feel slow rather than calm. Do not use it for a large multi-location chain trying to look uniform; the warmth reads as personal, and personal doesn't scale past one or two shops without starting to feel like a costume. Use Calm & precise or a sleeker theme there.

## Accessibility

Both modes are derived to meet WCAG 2.2 AA on every action variant and AAA on headings against the page background; the build proves it. Because the seed is a mid-tone terracotta rather than a pale or saturated color, the primary action sits comfortably in the ramp on both white and near-black surfaces without an override. The focus ring is the accent at 2px, visible on every surface. The 24px minimum target is enforced everywhere; the 44px comfortable target is used on touch platforms, which matters here since the online ordering flow is mostly tapped on a phone standing at a counter.

## Platform notes

### Web
`system-ui` resolves to San Francisco, Segoe UI, or Roboto per OS, so the storefront and the checkout page always look native to whatever the customer is holding. Apply the theme with `data-theme="warm-friendly"` and switch modes with `data-mode="dark"` on the root element.

### Lit
Token custom properties inherit through shadow roots, so a single root attribute themes the menu, the cart widget and any embedded ordering component without extra wiring.

### React Native
`system` maps to the platform default family (leave `fontFamily` unset, or use `System` on iOS) — useful for an online-ordering app that should feel as unfussy as the shop itself. Import `packages/tokens/dist/warm-friendly/rn/tokens.light.js` or `.dark.js` and select with the `useColorScheme` hook.
