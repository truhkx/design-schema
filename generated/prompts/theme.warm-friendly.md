# Design system feel: Warm & friendly

Use this file as a standing instruction (a skill) whenever you design, generate, or review anything for the **Warm & friendly** theme of the Design Schema system. Component-specific prompts in this folder assume you have read it.

## Identity in one line

Tone: **warm, tactile, calm, confident**. It must never be **loud**.

## Decisions this theme is derived from

```yaml
theme:
  id: warm-friendly
  status: review
  tone:
  - warm
  - tactile
  - calm
  - confident
  not: loud
  seed:
    color: '#1E1A16'
    neutral: '#C9B99C'
    typeface: system
    mono: system
  scale:
    base: 16
    ratio: 1.25
  radius: md
  density: roomy
  motion: subtle
  elevation: flat
  layout:
    rhythm: loose
    contentWidth: 1040
  modes:
    default: light
    supports:
    - light
    - dark
```

Every token below is generated from those decisions. When you need a value, use the token — never a literal color, size, or font.

## Semantic tokens (light mode, resolved)

```
--color-foreground                           #2d2b27
--color-foreground-strong                    #040302
--color-foreground-muted                     #605747
--color-foreground-on-action                 #f9eace
--color-foreground-danger                    #b51d26
--color-background                           #f9eace
--color-background-subtle                    #f4e4c8
--color-background-strong                    #edddc0
--color-border                               #e0d0b3
--color-border-strong                        #7c705a
--color-border-focus                         #7d7a77
--color-border-danger                        #b51d26
--color-link                                 #2d2b27
--color-link-hover                           #040302
--color-link-visited                         #605747
--color-control-background                   #f9eace
--color-control-border                       #7c705a
--color-control-selected-background          #040302
--color-control-selected-foreground          #f9eace
--color-control-track-off                    #7c705a
--color-status-info-background               #fff3e7
--color-status-info-foreground               #8c5500
--color-status-info-border                   #eea654
--color-status-info-icon                     #8c5500
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
--color-overlay-scrim                        #04030266
--color-overlay-surface                      #f9eace
--color-inverse-surface                      #1a1815
--color-inverse-foreground                   #f4e4c8
--color-inverse-muted                        #ccbc9f
--color-inverse-link                         #b8b7b6
--color-inverse-focus                        #b8b7b6
--color-inverse-status-neutral               #f4e4c8
--color-inverse-status-info                  #eea654
--color-inverse-status-success               #76d07a
--color-inverse-status-warning               #e6ac3f
--color-inverse-status-danger                #ff958d
--color-action-primary-background            #040302
--color-action-primary-background-hover      #2d2b27
--color-action-primary-foreground            #f9eace
--color-action-secondary-background          #edddc0
--color-action-secondary-background-hover    #e0d0b3
--color-action-secondary-foreground          #040302
--color-action-ghost-background              transparent
--color-action-ghost-background-hover        #f4e4c8
--color-action-ghost-foreground              #66625f
--color-action-danger-background             #b51d26
--color-action-danger-background-hover       #940014
--color-action-danger-foreground             #f9eace
```

## How to make decisions

- When two options are both acceptable, choose the one that better matches the tone words and moves further from "loud".
- Hierarchy, emphasis, and state are expressed through the semantic tokens (`color.foreground.*`, `color.background.*`, `color.action.*`, `font.weight.*`, `space.*`). Do not introduce new colors, shadows, or gradients that are not tokens.
- Disabled states use `opacity.disabled`; motion uses `motion.duration.*` and `motion.easing.*` and respects reduced-motion. Never introduce a duration, easing, or opacity literal.
- Accessibility floors are non-negotiable: WCAG 2.2 AA for every text/background pair, AAA for headings, 24px minimum targets (44px on touch), visible focus using `color.border.focus`.
- If a request conflicts with this file, say so and propose the on-theme alternative instead of silently complying.

## Feel, references, and rules

## Feel

Surfaces are sand in light mode and warm black in dark mode; there is no pure white or pure black anywhere. The primary action is ink on sand (and sand on ink in dark mode), so a button reads as the most solid thing on the page rather than the most colorful. Links are the text color with an underline. Corners are medium: rounded enough to feel handled, not pill-shaped. Type is the system face at a 1.25 scale, with hierarchy from weight and space. Spacing is roomy and the rhythm between sections is loose; elevation is flat, so surfaces are told apart by tone, not shadow.

## Not loud

When a decision is borderline: prefer the quieter tone, the flatter surface, the plainer label, the smaller motion. Status colors appear only where status is real (an error, a success message), never as decoration. If an element needs attention, give it space and ink, not color.

## References

The restraint of matte consumer hardware storefronts (tan paper, black type, one product per screen), the tonal layering of Kinfolk-style editorial layouts, and the flat, tone-separated surfaces of Notion's light theme. Avoid saturated accents, gradients, and glassy overlays.

## When to use

Product-led small businesses with photography to show; brand sites; anything where the object is the hero and the interface should feel like packaging.

## When not to use

Dense tools and data-heavy admin screens: the roomy rhythm and flat elevation cost density and separation. Use calm-precise there.
