---
title: Demo Brand naming
description: The worked example for the naming mechanism — a small, realistic set of renames applied to a real generated tree (packages/react/demo-brand) and shown beside the canonical components at /docs/naming-demo.
naming:
  namespace:
    # Everything the brand publishes moves under its own scope. The generator only rewrites the
    # specifiers it *writes* (`import … from '@demo/tokens'`); the package manifests are the fork's
    # own edit — see "What a fork still owns" below.
    package: '@demo'
    # `--ds-button-background` → `--demo-button-background`, and the class and custom-element
    # spellings that carry the prefix (`ds-button__label` → `demo-cta-button__label`). The *rest* of
    # a hook's name mirrors the canonical binding, so a reader of either tree can still find the
    # token it came from.
    cssPrefix: demo
    # Only the platforms that have a type-name prefix take one. Web has none — React components are
    # named by the `components` map below — so `web` is deliberately absent rather than set to
    # `Demo`, which would be a second prefix on top of the component name.
    typePrefix:
      rn: Demo
      swiftui: Demo
  components:
    # Three renames, for three different reasons. A brand should be able to read this column and say
    # "yes, that is what we call it" without knowing anything about the generator.
    #
    # Button → CtaButton: the brand's design language reserves "button" for the HTML element and
    # names the component after its job.
    Button: CtaButton
    # Disclosure → Expander: the APG pattern name never caught on internally; every spec, ticket and
    # Figma layer here says "expander".
    Disclosure: Expander
    # Alert → Callout: "alert" is already taken by the brand's incident tooling, and a component
    # named Alert in the same codebase as an Alert model is a daily papercut.
    Alert: Callout
  props:
    # One prop, scoped to one component. `variant` is Button's alone in the canonical schema, but the
    # key is dotted anyway: it says *which* component's vocabulary is moving, and it keeps working if
    # a future component gains its own `variant` that the brand does not want renamed.
    #
    # It also demonstrates the reach of a dotted key: it renames the prop inside CtaButton's own
    # files *and* on the `<CtaButton …>` element inside Callout, which composes one.
    Button.variant: emphasis
---

Demo Brand is a fictional adopter, and this file is the worked example for
[Brand naming, and the update path](/process/customization-and-naming/) — job 523. It is not a
schema fixture: `themes/nimbus/naming.md` is the fixture that exercises every key the schema allows,
and it stays where it is. This one is meant to be *read*, by a person deciding whether the mechanism
is legible enough to adopt, and then to be *run*: `pnpm demo:naming` regenerates
`packages/react/demo-brand/` from `packages/react/src/` under exactly these names, and
`pnpm demo:naming:check` proves the result differs from the canonical components in identifiers and
nothing else.

## What a reader should be able to predict from the frontmatter alone

Before looking at any output: `Button.tsx` becomes `CtaButton.tsx`, exporting `CtaButton`,
`CtaButtonProps`, `CtaButtonVariant`, `CtaButtonSize`, `CtaButtonOverridableBinding`. Its stylesheet
becomes `CtaButton.css`, its class becomes `.demo-cta-button` with `.demo-cta-button__label` for the
anatomy part, and every hook it defines becomes `--demo-button-*` — the *prefix* moves, the binding
name does not, because `button-background` names the canonical token binding rather than the brand's
component. Its `variant` prop is called `emphasis`. `Alert.tsx` becomes `Callout.tsx` and renders
`<CtaButton emphasis="ghost" …>` where it used to render `<Button variant="ghost" …>`, without the
map saying anything about Alert's internals.

Three things stay exactly as they were, and they are the ones worth checking in the output:

- **The gate hooks.** The renamed button still emits `data-ds="Button"` and `data-part="leadingIcon"`.
  Those are how `tools/behavior_tests.ts` and `tools/keyboard_tests.ts` find a component, and they are
  derived from the canonical docs, so a brand-agnostic gate needs a brand-agnostic hook. This is also
  why `data-ds` keeps its own `ds`.
- **The tokens.** `var(--color-action-primary-background)` is unchanged: a token path is canonical
  schema, not brand vocabulary. Only the component's own `--ds-`-prefixed hooks move, which is what
  lets the renamed tree render against the unmodified `@design-schema/tokens` build.
- **`Icon`.** It is in the demo tree because `Callout` composes it, and it is not in the `components`
  map, so it is still `Icon` in a tree where three of its neighbours moved. Its stylesheet is still
  reprefixed (`.demo-icon`), because the namespace belongs to the whole generated surface while a
  component name belongs to one entry in a map.

## Why the maps are this small

A naming doc is for the names a brand genuinely disagrees with, not a chance to re-spell the system.
Three components and one prop is roughly what a real adoption looks like: the canonical vocabulary
comes from the APG and from the component docs, and most of it is already the name an adopter would
have picked. The mechanism scales — nothing here is cheaper because the map is short — but a fork
that renames forty components has bought itself forty things to re-read every time it pulls upstream,
because a map key is always the *canonical* name and upstream is the side that can move it.

That check is real: `tools/naming.ts` validates every key against `generated/components.json` when it
resolves this file, so a key that matches no component, prop, event or anatomy part fails the run
with the key named, rather than renaming nothing and saying nothing. See
[Updating your fork](/guides/updating-your-fork/).

## What a fork still owns

The generator writes components; it never writes a manifest. So `@demo/react` and `@demo/tokens`
existing as real packages is Demo Brand's own `package.json` edit — in this repository they cannot
exist, so `packages/react/demo-brand/tsconfig.json` and its Vitest config alias `@demo/tokens` back
to the canonical token package, and `apps/website/astro.config.mjs` does the same for the comparison
page. That alias is the one thing in this worked example a real fork would not need, and it is the
only hand-written file in the demo tree that is not generated output.

A SwiftUI or React Native fork has one more: `typePrefix` above renames the *references* those
platforms' components make (`DemoTokenRef`, `import DemoTokens`), and `tokens/build.mjs` has to be
taught the same prefix for those references to resolve. The web demo does not exercise that, which is
worth saying rather than leaving for a fork to find.
