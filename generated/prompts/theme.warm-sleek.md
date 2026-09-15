# Design system feel: Warm & sleek

Use this file as a standing instruction (a skill) whenever you design, generate, or review anything for the **Warm & sleek** theme of the Design Schema system. Component-specific prompts in this folder assume you have read it.

## Identity in one line

Tone: **warm, sleek, modern, light**. It must never be **cold**.

## Decisions this theme is derived from

```yaml
theme:
  id: warm-sleek
  status: draft
  tone:
  - warm
  - sleek
  - modern
  - light
  not: cold
  seed:
    color: '#FFEBBA'
    typeface: Google Sans
    mono: system
  neutralTint: 0.35
  scale:
    base: 16
    ratio: 1.25
  radius: md
  density: comfortable
  motion: expressive
  elevation: pronounced
  layout:
    rhythm: normal
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
--color-foreground                           #2d2b26
--color-foreground-strong                    #000000
--color-foreground-muted                     #5a5852
--color-foreground-on-action                 #ffffff
--color-foreground-danger                    #b51d26
--color-background                           #ffffff
--color-background-subtle                    #f7f7f5
--color-background-strong                    #eeedea
--color-border                               #dcdad7
--color-border-strong                        #74716b
--color-border-focus                         #837961
--color-border-danger                        #b51d26
--color-link                                 #696354
--color-link-hover                           #4f4d47
--color-link-visited                         #3a3832
--color-control-background                   #ffffff
--color-control-border                       #74716b
--color-control-selected-background          #696354
--color-control-selected-foreground          #ffffff
--color-control-track-off                    #74716b
--color-status-info-background               #fff4da
--color-status-info-foreground               #7b5f00
--color-status-info-border                   #d9b249
--color-status-info-icon                     #7b5f00
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
--color-inverse-surface                      #1a1814
--color-inverse-foreground                   #f7f7f5
--color-inverse-muted                        #bfbdb8
--color-inverse-link                         #c7b68b
--color-inverse-focus                        #c7b68b
--color-inverse-status-neutral               #f7f7f5
--color-inverse-status-info                  #d9b249
--color-inverse-status-success               #76d07a
--color-inverse-status-warning               #e6ac3f
--color-inverse-status-danger                #ff958d
--color-action-primary-background            #696354
--color-action-primary-background-hover      #4f4d47
--color-action-primary-foreground            #ffffff
--color-action-secondary-background          #eeedea
--color-action-secondary-background-hover    #dcdad7
--color-action-secondary-foreground          #000000
--color-action-ghost-background              transparent
--color-action-ghost-background-hover        #f7f7f5
--color-action-ghost-foreground              #696354
--color-action-danger-background             #b51d26
--color-action-danger-background-hover       #940014
--color-action-danger-foreground             #ffffff
```

## How to make decisions

- When two options are both acceptable, choose the one that better matches the tone words and moves further from "cold".
- Hierarchy, emphasis, and state are expressed through the semantic tokens (`color.foreground.*`, `color.background.*`, `color.action.*`, `font.weight.*`, `space.*`). Do not introduce new colors, shadows, or gradients that are not tokens.
- Disabled states use `opacity.disabled`; motion uses `motion.duration.*` and `motion.easing.*` and respects reduced-motion. Never introduce a duration, easing, or opacity literal.
- Accessibility floors are non-negotiable: WCAG 2.2 AA for every text/background pair, AAA for headings, 24px minimum targets (44px on touch), visible focus using `color.border.focus`.
- If a request conflicts with this file, say so and propose the on-theme alternative instead of silently complying.

## Feel, references, and rules

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
