---
title: Warm & sleek
description: Cream surfaces with a pale-oak seed, ashy warm neutrals, medium radii, expressive motion and pronounced layering. Light by default, dark derived.
theme:
  id: warm-sleek
  status: draft
  tone: [warm, sleek, modern, light]
  not: cold
  seed:
    color: '#FFEBBA'
    typeface: Google Sans
    mono: system
  neutralTint: 0.35
  scale: { base: 16, ratio: 1.25 }
  radius: md
  density: comfortable
  motion: expressive
  elevation: pronounced
  layout: { rhythm: normal, contentWidth: 1040 }
  modes: { default: light, supports: [light, dark] }
---

Warm & sleek is for products people enjoy opening: media, lifestyle, consumer apps with a personality. It borrows the polish of a modern streaming app and turns the lights on — light surfaces, warm tone, generous motion — without the weight.

## Feel

Surfaces are cream rather than white: the pale-oak seed bleeds into the neutrals so light backgrounds feel like paper in daylight and the darkest neutral is an ashy, warm near-black rather than a cold one. The accent is the darker end of the same wood hue — amber on light surfaces, honey on dark — and it appears on primary actions, focus rings and links, never as decoration. Corners are clearly rounded (medium) so controls feel soft in the hand while staying rectangular enough to line up. Type is Google Sans throughout, on a 1.25 scale: headings are noticeably larger than body text and carry the hierarchy on their own, so weight can stay regular or medium. Spacing sits on a comfortable 4px grid with normal rhythm between sections.

Motion is expressive: transitions are a little longer, ease with a soft overshoot, and content slides rather than fades. Layering is pronounced: cards, sheets and menus lift off the page with real shadows, and the page has depth even in light mode. Emphasis comes from elevation and warmth, not from saturation.

## Not cold

When a decision is borderline, this is the tiebreaker. Prefer the tinted neutral over the pure gray. Prefer the warmer of two accent steps. Prefer a shadow over a border. Prefer a rounded corner over a square one. Prefer motion that carries the user somewhere over an instant cut. Prefer a friendly, spoken label over a terse one. If a choice would make the screen look like a spreadsheet, make the other choice.

## References

Learn from Spotify's confidence with layering and motion, from Airbnb's warm neutrals and generous type, and from Material 3's tonal surfaces. Avoid the look of developer tooling: hairline borders, monochrome icons and nothing lifted off the page.

## When to use

Choose this theme for consumer products, media and entertainment, lifestyle and wellness apps, and marketing surfaces where warmth is part of the brand. It works best when the product has content — images, covers, cards — for the layering to hold.

## When not to use

Do not use it for dense professional tools, dashboards used all day, or data-heavy screens: the expressive motion and pronounced shadows compete with the work. Use Calm & precise there and keep this theme for the product's public face.

## Accessibility

Both modes are derived to meet WCAG 2.2 AA on every action variant and AAA on headings against the page background; the build proves it. The pale seed means the primary action is taken from the dark end of the wood ramp, so the check is what decides whether the warm accent is usable on cream. The focus ring is the accent at 2px, visible on every surface. Expressive motion is removed under reduced-motion preferences on every platform. The 24px minimum target is enforced in every component; the 44px comfortable target is used on touch platforms.

## Platform notes

### Web
Google Sans is not a freely hosted web font; load it from your own font files and it falls back to the system stack (`system-ui`) when missing. Apply the theme with `data-theme="warm-sleek"` and switch modes with `data-mode="dark"` on the root element.

### Lit
Token custom properties inherit through shadow roots, so the same root attributes theme every custom element without extra wiring. Shadows are tokens too, so pronounced elevation reaches into every element.

### React Native
Bundle Google Sans with the app and register it under that family name; when it is absent the family resolves to the platform default. Import `packages/tokens/dist/warm-sleek/rn/tokens.light.js` or `.dark.js` and select with the `useColorScheme` hook. Expressive durations are numbers here; pass them to `Animated` with the standard easing token.
