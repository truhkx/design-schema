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
  events:
    Button.onPress:
      web: onActivate
      lit: activate
      rn: onActivate
    Alert.onDismiss: onClose
  anatomy:
    Button.trailingIcon: endIcon
  values:
    Button.variant:
      danger: destructive
    tone:
      danger: critical
    Alert.tone:
      info: notice
  aliases:
    components:
      Disclosure:
        - name: Collapsible
          since: '3.0.0'
          platforms: [web, rn, swiftui]
    props:
      Alert.tone:
        - name: level
          since: '3.0.0'
          platforms: [web, rn]
          deprecated:
            reason: Nimbus 2 called an alert's severity its level.
    values:
      Button.variant:
        danger:
          - name: negative
            since: '3.0.0'
            platforms: [web, rn]
  tokens:
    cssPrefix: nimbus
    rename:
      color.action.primary.background: color.brand.primary
---

Nimbus is not a real product. It exists so `schema/naming.ts` has something to parse: a naming doc that
uses every key at once, so the schema is proved against an example rather than only against its own
type. `tools/__tests__/naming.test.ts` parses this file on every run.

A naming doc is a sibling of a theme doc, not a section inside one — Nimbus deliberately has no theme doc
here, which is the composability claim in `process/customization-and-naming.md` made concrete: names and
look vary independently, and a brand may write one without the other.

## What it renames

The namespace moves the whole system under the brand: packages publish as `@nimbus/react` and
`@nimbus/lit`, a component's own custom properties come out as `--nimbus-button-background`, and the two
platforms with a type-name prefix (SwiftUI's tokens module and enum, React Native's theme context) take
`Nimbus`. The rest of a hook's name is untouched — it is still `button-background`, because it mirrors
the canonical binding, not brand vocabulary. A token's emitted name moves only through `tokens`, below.

Three components are renamed. A composite that renders one follows automatically: Card's `headerActions`
still renders a `Button`-shaped thing, it now imports it as `CtaButton`.

The prop map shows both scopes and the precedence between them. `tone: sentiment` is global, so every
component that has a `tone` — Alert, AlertDialog, Link, Meter, ProgressBar, Text, Toast — emits it as
`sentiment`, except `Alert`, where the dotted `Alert.tone: severity` is more specific and wins.
`variant: style` is a second global key that happens to reach exactly one component, because `variant`
is Button's alone; `Button.leadingIcon` renames an anatomy part as well as a prop, since for Button they
are the same name; `Stack.gap` renames a prop on one layout component only.

The event map shows both of its forms, and why there are two. A key is the neutral event name, but what
a rename has to reach is the name each platform emits, and those are not always the same. Button's
`onPress` is `onClick` on web, `press` on Lit and `onPress` on React Native, so the object form spells
out all three: `onActivate`, `activate`, `onActivate`. A plain string would reach Lit and React Native
and not web, and `tools/naming.ts` would say so. `Alert.onDismiss: onClose` is the string form, and it
is enough there because Alert's event follows the convention on every platform: `onDismiss` on web and
React Native, `dismiss` on Lit, so the brand gets `onClose` and `close`. On web the rename reaches
`<CtaButton onActivate={…}>` inside Callout, but not the `onClick` of the native `<button>` inside
CtaButton, which belongs to the platform.

`Button.trailingIcon: endIcon` renames an anatomy part and nothing else. The class segment and Lit's
slot become `end-icon`, while the `trailingIcon` prop keeps its name. That is the difference from
`Button.leadingIcon` above, which renames the prop, and the part along with it.

The value map renames a prop's enum values, keyed like `props` by the canonical prop, never by the brand's
`style` or `sentiment`. `Button.variant: { danger: destructive }` is one component's. `tone: { danger:
critical }` is global, so it reaches every component whose `tone` has a `danger` — Alert, AlertDialog, Meter,
ProgressBar, Text and Toast, but not Link, whose tones are `default` and `inherit` — and the dotted
`Alert.tone: { info: notice }` adds a value on Alert alone, so Alert gets both. A value moves only where the
code ties it to its prop, like `tone="danger"` on a `<Callout>`, a `TONE_TOKENS` object keyed by exactly
Alert's tones, or `.nimbus-callout--critical`. A `'danger'` the rename cannot place, such as an ActionSheet
action's own tone or an icon name, is listed by `tools/naming.ts --check` for review instead.

The alias map keeps Nimbus 2's names working beside these, and uses all three of its maps. `Disclosure:
[Collapsible]` is the old name of what Nimbus now calls `Expander`, so web and React Native export a deprecated
`Collapsible` constant and SwiftUI a deprecated typealias. `Alert.tone: [level]` is the old spelling of the prop
now called `severity`, and `Button.variant.danger: [negative]` the old spelling of the value now called
`destructive`; web and React Native get a `Callout` and a `CtaButton` wrapper that take the old spelling and warn
once in development. Each entry lists its `platforms`, because Lit's compatibility layer can only carry a
component alias, and the Disclosure entry leaves Lit out too so a `--check` over web, lit and rn writes nothing
for Lit at all. The keys are canonical and the names are the old spellings of the *current* names, and
`tools/naming.ts` refuses an alias that is already a name the component or the system has.

The token block changes the names the token build emits, and nothing a tool reads. `cssPrefix: nimbus` puts every
token variable under the brand, so `var(--space-md)` becomes `var(--nimbus-space-md)`, and `rename` moves one token
onto Nimbus's own path: `color.action.primary.background` is emitted as `--nimbus-color-brand-primary`, and as
`colorBrandPrimary` in the JS and React Native objects and SwiftUI's `TokenRef`. The prefix is deliberately the
namespace's, so token variables and component hooks share `--nimbus-`. That is the case `tools/naming.ts` has to
revert with care, `--nimbus-color-foreground` to `--color-foreground` but `--nimbus-button-background` to
`--ds-button-background`, and why it refuses a token path that would land inside a component's hooks. A `rename` key
is a public token name, checked against schema/tokens.ts. The dotted path is still `color.action.primary.background`
in every doc, in the built JSON and in `TokenRef`'s raw values, so the gates and the themes never see the brand path.

Every key here is a *canonical* name, and `tools/naming.ts` checks it against
`generated/components.json` when it resolves the doc: a key that matches no component, prop, event or
anatomy part, or an event platform with no emitted name to rename, is an error, not a rename that silently does nothing. That check is what makes an upstream
pull safe to run — see [Updating your fork](/guides/updating-your-fork/).

## What it does not rename

Nothing in the canonical schema. The docs still say `props.variant`, `a11y.role`, `anatomy: [container,
label, leadingIcon, trailingIcon]`, and the gates — contrast, keyboard, behavior, lint-literals — still
key off exactly those names. The renames are applied when a generator writes a file and names an export,
which is what keeps the gates brand-agnostic and an upstream pull conflict-free. Nor does a value rename
reach a token: `color.status.danger.icon` keeps its `danger` after `tone: { danger: critical }`, because a
theme keys off the token's name.
