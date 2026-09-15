# Design system feel: Calm & precise

Use this file as a standing instruction (a skill) whenever you design, generate, or review anything for the **Calm & precise** theme of the Design Schema system. Component-specific prompts in this folder assume you have read it.

## Identity in one line

Tone: **calm, precise, quiet, trustworthy**. It must never be **playful**.

## Decisions this theme is derived from

```yaml
theme:
  id: calm-precise
  status: review
  tone:
  - calm
  - precise
  - quiet
  - trustworthy
  not: playful
  seed:
    color: '#3B5BDB'
    typeface: system
    mono: system
  neutralTint: 0.25
  scale:
    base: 16
    ratio: 1.2
  radius: sm
  density: comfortable
  motion: subtle
  elevation: subtle
  layout:
    rhythm: normal
    contentWidth: 960
  modes:
    default: light
    supports:
    - light
    - dark
```

Every token below is generated from those decisions. When you need a value, use the token — never a literal color, size, or font.

## Semantic tokens (light mode, resolved)

```
--color-foreground                           #2a2b2f
--color-foreground-strong                    #000000
--color-foreground-muted                     #56585c
--color-foreground-on-action                 #ffffff
--color-foreground-danger                    #b51d26
--color-background                           #ffffff
--color-background-subtle                    #f6f7f8
--color-background-strong                    #ecedee
--color-border                               #d9dbdd
--color-border-strong                        #939599
--color-border-focus                         #496ded
--color-border-danger                        #b51d26
--color-link                                 #3553d2
--color-link-hover                           #243ab3
--color-link-visited                         #162391
--color-control-background                   #ffffff
--color-control-border                       #939599
--color-control-selected-background          #3553d2
--color-control-selected-foreground          #ffffff
--color-control-track-off                    #939599
--color-status-info-background               #f1f5ff
--color-status-info-foreground               #405bb6
--color-status-info-border                   #99b5ff
--color-status-info-icon                     #405bb6
--color-status-success-background            #e0ffe0
--color-status-success-foreground            #00791d
--color-status-success-border                #76d07a
--color-status-success-icon                  #00791d
--color-status-warning-background            #fff4e1
--color-status-warning-foreground            #825b00
--color-status-warning-border                #e6ac3f
--color-status-warning-icon                  #825b00
--color-status-danger-background             #fff2f0
--color-status-danger-foreground             #b51d26
--color-status-danger-border                 #ff958d
--color-status-danger-icon                   #b51d26
--color-overlay-scrim                        #00000066
--color-overlay-surface                      #ffffff
--color-inverse-surface                      #17181b
--color-inverse-foreground                   #f6f7f8
--color-inverse-muted                        #bcbec1
--color-inverse-link                         #99b5ff
--color-inverse-focus                        #99b5ff
--color-inverse-status-neutral               #f6f7f8
--color-inverse-status-info                  #99b5ff
--color-inverse-status-success               #76d07a
--color-inverse-status-warning               #e6ac3f
--color-inverse-status-danger                #ff958d
--color-action-primary-background            #3553d2
--color-action-primary-background-hover      #243ab3
--color-action-primary-foreground            #ffffff
--color-action-secondary-background          #ecedee
--color-action-secondary-background-hover    #d9dbdd
--color-action-secondary-foreground          #000000
--color-action-ghost-background              transparent
--color-action-ghost-background-hover        #f6f7f8
--color-action-ghost-foreground              #3553d2
--color-action-danger-background             #b51d26
--color-action-danger-background-hover       #940014
--color-action-danger-foreground             #ffffff
```

## How to make decisions

- When two options are both acceptable, choose the one that better matches the tone words and moves further from "playful".
- Hierarchy, emphasis, and state are expressed through the semantic tokens (`color.foreground.*`, `color.background.*`, `color.action.*`, `font.weight.*`, `space.*`). Do not introduce new colors, shadows, or gradients that are not tokens.
- Disabled states use `opacity.disabled`; motion uses `motion.duration.*` and `motion.easing.*` and respects reduced-motion. Never introduce a duration, easing, or opacity literal.
- Accessibility floors are non-negotiable: WCAG 2.2 AA for every text/background pair, AAA for headings, 24px minimum targets (44px on touch), visible focus using `color.border.focus`.
- If a request conflicts with this file, say so and propose the on-theme alternative instead of silently complying.

## Feel, references, and rules

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
