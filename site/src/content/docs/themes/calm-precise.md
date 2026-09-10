---
title: Calm & precise
description: Quiet, cool neutrals with a slate-blue accent, small radii, and a tight type scale. The default theme.
theme:
  id: calm-precise
  status: review
  tone: [calm, precise, quiet, trustworthy]
  not: playful
  seed:
    color: '#3B5BDB'
    typeface: system
    mono: system
  neutralTint: 0.25
  scale: { base: 16, ratio: 1.2 }
  radius: sm
  density: comfortable
  motion: subtle
  elevation: subtle
  layout: { rhythm: normal, contentWidth: 960 }
  modes: { default: light, supports: [light, dark] }
---

Calm & precise is for products people live in for hours: editors, consoles, planning tools, anything where the interface should recede and the work should come forward. It is confident without raising its voice.

## Feel

Surfaces are near-white or near-black with a faint cool cast borrowed from the accent, so grays feel deliberate rather than default. The slate-blue accent appears in exactly the places that need it — the primary action, focus rings, links — and nowhere decorative. Corners are barely rounded: enough to feel finished, not enough to feel soft. Type uses the platform's own system face so every screen feels native to the device it is on, with a 1.2 modular scale that keeps headings close in size to body text; hierarchy comes from weight and spacing more than from size. Spacing sits on a comfortable 4px grid with no extra air.

Motion, when it exists, is short (120–200 ms), eased-out, and never bounces. Nothing pulses, wiggles, or celebrates. Emphasis is created by removing things from around the element that matters, not by making it louder.

## Not playful

When a decision is borderline, this is the tiebreaker. Prefer the smaller radius. Prefer the less saturated color. Prefer the shorter, plainer word in the label. Prefer no animation over a tasteful one. Prefer a neutral surface over a tinted one. Prefer weight over size for hierarchy. If a choice would make a designer say "fun", make the other choice.

## References

Learn from Linear's restraint and focus handling, from GitHub Primer's neutral scales and density, and from Vercel's use of near-monochrome with a single accent. Avoid the look of consumer fintech onboarding: large rounded pills, gradients, and illustration-led empty states.

## When to use

Choose this theme for professional and productivity software, developer tools, dashboards used all day, and any product whose users would describe the ideal interface as "gets out of the way". It is the safest default when the brand is undefined.

## When not to use

Do not use it for consumer marketing pages, products aimed at children, or brands whose personality is warmth or energy — the restraint will read as cold. Use a warmer or bolder theme and keep this one for the settings screens.

## Accessibility

Both modes are derived to meet WCAG 2.2 AA on every action variant and AAA on headings against the page background; the build proves it. The focus ring is the accent at 2px, visible on every surface. The 24px minimum target is enforced in every component; the 44px comfortable target is used on touch platforms.

## Platform notes

### Web
`system-ui` resolves to San Francisco, Segoe UI, or Roboto per OS. Apply the theme with `data-theme="calm-precise"` and switch modes with `data-mode="dark"` on the root element.

### Lit
Token custom properties inherit through shadow roots, so the same root attributes theme every custom element without extra wiring.

### React Native
`system` maps to the platform default family (leave `fontFamily` unset, or use `System` on iOS). Import `packages/tokens/dist/calm-precise/rn/tokens.light.js` or `.dark.js` and select with the `useColorScheme` hook.
