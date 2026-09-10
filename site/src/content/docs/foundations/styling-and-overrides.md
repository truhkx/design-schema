---
title: Styling and overrides
description: How generated components are styled, the three layers at which a look can change, and the one per-instance override contract that works identically on web, web components and React Native.
sidebar:
  order: 3
---

Every visual value in a generated component is a token reference. The question this page answers is what happens when someone needs a component to look different in one place — a wider button in a hero, a card with more padding — without breaking the promise that the three platforms match and that accessibility is checked at build time. The answer is a small, typed contract, the same on every platform, plus one honest escape hatch on the web.

## Three layers

**Layer 1 — the theme.** Global, and the one most people should reach for. A theme doc changes the seed, scale, radius, density, rhythm; every component follows. If a brand wants tighter buttons everywhere, that is `density`, not an override.

**Layer 2 — per-instance overrides, in tokens.** Every component accepts an `overrides` prop keyed by its style bindings and valued by token names. `<Button overrides={{ paddingInline: 'space.lg', radius: 'radius.full' }} />` works the same as `<ds-button .overrides=${...}>` and the same in React Native. The keys are the binding names from the component's schema (the ones in its styles table), the values are `TokenRef` — the string-literal union of every token name, exported by `@design-schema/tokens` — so a typo or a pixel value is a type error, not a runtime surprise. This is the only per-instance styling surface on React Native (there is no `style` prop), which is what keeps a screen from drifting off-system.

**Layer 3 — the web escape hatch.** On web and in web components, every binding is also a CSS custom property on the component root, named `--ds-<component>-<binding>`. Product CSS may set them: `.hero ds-button { --ds-button-padding-inline: var(--space-lg) }`. That is sanctioned and documented; it is also visible to code review as exactly what it is. Setting the hook to a literal (`24px`) works in the browser and fails the literal gate in this repository, which is the intended relationship: the escape hatch exists, and using it off-system is a choice you make in the open.

## What cannot be overridden

Bindings that carry an accessibility guarantee are **locked**: any color that appears in the component's declared contrast pairs, the focus ring color and width, and minimum target sizes. `tools/parse.py` computes this from the schema, so it cannot be forgotten, and a doc can lock more with `locked: true` on a binding. Locked bindings are absent from the `overrides` type and ignored if passed, and their hooks are not exposed on web either. The effect is that an override can change how much room a button has, but not whether its text is readable or its focus visible. A team that needs a different button color makes a variant in the schema, where the contrast checker sees it.

## Overrides change values, never presence

An override changes *which token* a binding uses; props decide *whether* the part exists. `surface: none` renders no background, so `overrides.background` is ignored; `border: false` renders no border, so `overrides.border` and `overrides.borderWidth` are ignored; `radius: none` ignores `overrides.radius`. A consumer who wants a bordered box asks for one (`border`) and then may recolor it. This keeps the enum the single statement of what a component shows, and keeps an override from smuggling in a part the schema said was absent. Generators apply overrides only where the binding is in effect.

## How the generated code is shaped

On web and Lit, each binding produces two declarations: the hook with its default, and the rule that reads the hook.

```css
.ds-button {
  --ds-button-padding-inline: var(--space-md);
  padding-inline: var(--ds-button-padding-inline);
}
.ds-button--primary { --ds-button-background: var(--color-action-primary-background); }
```

Interpolated bindings (`color.action.{variant}.background`) set the hook per variant class; the rule reads the hook once. The `overrides` prop writes the hook inline as `var(--<token>)`. In Lit the hook lives on `:host`, and because a document stylesheet's rule on the host element beats a `:host` rule inside the shadow root, external CSS overrides work without `::part` — and no `::part` is exposed for styling, so the surface stays this one.

On React Native there is no cascade, so the component resolves overrides through the theme: `resolveToken(t, 'space.lg')` returns the number, and it replaces the binding's default in the style object. The same `TokenRef` type constrains it.

## What this means for the generator

The rules above are in the platform templates, so every regenerated component carries the contract, and `tools/parse.py` writes the overridable and locked binding lists into each prompt. Components generated before this decision (Tiers 0 and 1) do not have the hooks yet; they gain them the next time their doc changes and they regenerate, or in one deliberate pass.

## What it does not do

It does not let a consumer restyle a component's *children*: Alert cannot recolor the Button it contains, and neither can product code through Alert. The rule that composites never restyle a child stands; the override contract is per component, applied to that component's own bindings. And it does not let a design tool inject pixels: a designer's decision enters as a token change (a theme edit) or a binding change (a doc edit), which is what keeps designs and code from becoming two truths.
