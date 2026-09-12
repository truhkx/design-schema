---
title: Nimbus naming
description: A fictional brand's renames, used as the round-trip fixture for schema/naming.ts — every key the schema allows, exercised once.
naming:
  namespace:
    package: '@nimbus'
    cssPrefix: nimbus
    typePrefix:
      swiftui: Nimbus
      rn: Nimbus
  components:
    Button: CtaButton
    Disclosure: Expander
    Alert: Callout
  props:
    tone: sentiment
    Alert.tone: severity
    variant: style
    Button.leadingIcon: startIcon
    Stack.gap: spacing
---

Nimbus is not a real product. It exists so `schema/naming.ts` has something to parse: a naming doc that
uses all three keys at once, so the schema is proved against an example rather than only against its own
type. `tools/__tests__/naming.test.ts` parses this file on every run.

A naming doc is a sibling of a theme doc, not a section inside one — Nimbus deliberately has no theme doc
here, which is the composability claim in `process/customization-and-naming.md` made concrete: names and
look vary independently, and a brand may write one without the other.

## What it renames

The namespace moves the whole system under the brand: packages publish as `@nimbus/react` and
`@nimbus/lit`, custom properties come out as `--nimbus-button-background`, and the two platforms with a
type-name prefix (SwiftUI's tokens module and enum, React Native's theme context) take `Nimbus`. The rest
of a token's name is untouched — it is still `button-background`, because the token path
`color.action.primary.background` is canonical schema, not brand vocabulary.

Three components are renamed. A composite that renders one follows automatically: Card's `headerActions`
still renders a `Button`-shaped thing, it now imports it as `CtaButton`.

The prop map shows both scopes and the precedence between them. `tone: sentiment` is global, so every
component that has a `tone` — Alert, AlertDialog, Link, Meter, ProgressBar, Text, Toast — emits it as
`sentiment`, except `Alert`, where the dotted `Alert.tone: severity` is more specific and wins.
`variant: style` is a second global key that happens to reach exactly one component, because `variant`
is Button's alone; `Button.leadingIcon` renames an anatomy part as well as a prop, since for Button they
are the same name; `Stack.gap` renames a prop on one layout component only.

Every key here is a *canonical* name, and `tools/naming.ts` checks it against
`generated/components.json` when it resolves the doc: a key that matches no component, prop, event or
anatomy part is an error, not a rename that silently does nothing. That check is what makes an upstream
pull safe to run — see [Updating your fork](/guides/updating-your-fork/).

## What it does not rename

Nothing in the canonical schema. The docs still say `props.variant`, `a11y.role`, `anatomy: [container,
label, leadingIcon, trailingIcon]`, and the gates — contrast, keyboard, behavior, lint-literals — still
key off exactly those names. The renames are applied when a generator writes a file and names an export,
which is what keeps the gates brand-agnostic and an upstream pull conflict-free.
