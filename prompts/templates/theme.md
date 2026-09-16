# Design system feel: {{NAME}}

Use this file as a standing instruction (a skill) whenever you design, generate, or review anything for the **{{NAME}}** theme of the Design Schema system. Component-specific prompts in this folder assume you have read it.

## Identity in one line

Tone: **{{TONE}}**. It must never be **{{NOT}}**.

## Decisions this theme is derived from

```yaml
{{THEME_YAML}}
```

Every token below is generated from those decisions. When you need a value, use the token — never a literal color, size, or font.

## Semantic tokens (light mode, resolved)

```
{{TOKENS_LIGHT}}
```

## How to make decisions

- When two options are both acceptable, choose the one that better matches the tone words and moves further from "{{NOT}}".
- Hierarchy, emphasis, and state are expressed through the semantic tokens (`color.foreground.*`, `color.background.*`, `color.action.*`, `font.weight.*`, `space.*`). Do not introduce new colors, shadows, or gradients that are not tokens.
- Disabled states use `opacity.disabled`; motion uses `motion.duration.*` and `motion.easing.*` and respects reduced-motion. Never introduce a duration, easing, or opacity literal.
- Accessibility floors are non-negotiable: WCAG 2.2 AA for every text/background pair, AAA for headings, 24px minimum targets (44px on touch), visible focus using `color.border.focus`.
- If a request conflicts with this file, say so and propose the on-theme alternative instead of silently complying.

## Feel, references, and rules

{{GUIDANCE}}
