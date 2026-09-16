---
title: Brand naming, and the update path
description: How a brand tailors the generated system's names — components, props, the token/CSS vocabulary — without forking the canonical schema, and how that same decoupling is what lets them pull hardened updates later without conflict.
sidebar:
  order: 10
---

Decided 2026-09-12. The theme doc already tailors a brand's *look* — OKLCH colors, density, layout rhythm and content width (`foundations/layout.md`, `process/vision-and-decisions.md`'s theme decisions). It says nothing about *names*: today every fork gets `@design-schema/react`, a `Button`, `--ds-button-background`, a `TokenRef` enum — Design Schema's own vocabulary, not the adopter's. Tony wants that tailorable too: a brand should be able to run the pipeline and get `@acme/react`, `CtaButton`, `--acme-button-background`, without hand-editing generated output or forking the canonical component docs to do it.

## naming.md — a sibling doc, not a theme-doc section

A new doc type, alongside a theme doc rather than inside one: `themes/<brand>/naming.md`. Five things it can override:

- **Namespace.** The package scope (`@design-schema` → `@acme`), the CSS custom-property prefix (`--ds-` → `--acme-`), and the per-platform type-name prefix where one exists (Swift's generated `TokenRef` enum, RN's theme context name).
- **Component names.** A map, canonical → brand (`Button: CtaButton`, `Disclosure: Expander`). Applies to the generated file name, the exported type/struct/class name, and every reference to that component from a composite (Card's `headerActions` still renders a `Button`-shaped thing; it now imports it as `CtaButton`).
- **Prop / anatomy names.** A map, scoped globally or per component (`variant: style` everywhere, or just `Button.variant: style`), for the rare brand whose existing internal conventions already disagree with the schema's.
- **Enum values.** `values`, keyed exactly like `props` and always by the canonical prop name (`Button.variant: { primary: cta }`), for a brand that already ships `<Button kind="cta">` and needs the values to match as well as the prop.
- **Emitted token names.** `tokens`, for a brand whose stylesheets and code already use their own token names: a prefix on every token variable (`--acme-color-foreground`), and a brand dotted path per renamed token (`color.action.primary.background: color.brand.primary` emits `--acme-color-brand-primary` and `colorBrandPrimary`). See [Keeping existing token names](#keeping-existing-token-names).

What it explicitly does **not** touch: the canonical schema's own internal keys — `props.variant`, `a11y.role`, the token path `color.action.primary.background` (`tokens` moves the names a build emits for it, never the path), anything the gates (contrast checker, keyboard-spec derivation, lint-literals, behavior tests) key off of. Those stay fixed across every fork. `naming.md` is a rename applied to *generated output identifiers* at the templating step — the model still reads the canonical schema and the canonical prompt, and only the last step (writing the file, naming the export) consults `naming.md`. This is what keeps the gates brand-agnostic: they never need to know a brand called `Button` something else.

**Composability.** Because naming and theme are separate docs, they vary independently. A company with two sub-brands sharing one component vocabulary but different palettes writes one `naming.md` and two theme docs. A contributor testing a new palette against Design Schema's own vocabulary just doesn't write a `naming.md` at all — omitting it is the default, unrenamed case.

## How the rename is applied

Built 2026-09-12 as `tools/naming.ts`, and it is deliberately the *last* thing a generation does. The step
is explicit: `node tools/generate.ts --platform web --component Button --naming acme` (or `DS_NAMING=acme`
for a fork that would rather not type it every run) resolves `themes/acme/naming.md` once per run. Without
the flag there is no naming step at all — no resolution, no rename, byte-identical output — which is the
property that keeps this project's own generation unaffected by a mechanism only adopters use.

The order matters more than the renaming does. The model receives the canonical prompt and writes canonical
code; the gates — contrast, keyboard-spec derivation, lint-literals, behavior tests, typecheck — all run on
that canonical code; only then are the brand's names written. Because a fork's tree is *committed* in its
brand's names, a run with `--naming` starts by renaming the package back to canonical names, and ends by
renaming it forward again. The maps are injective, so the trip a fork's own files take — brand →
canonical → brand — is byte-for-byte exact; what the gates see is never a brand name, and what lands in
the fork's git history never isn't. (Job 523 found the one asymmetry in the *other* direction, and it is
described under "What building the worked example changed" below: it costs a reworded comment in the
canonical tree for one round and never reaches a fork's disk.)

What follows from "generated output identifiers only" is worth spelling out, because the boundary is not
where a reader might guess:

- The **test hooks stay canonical**: `data-ds="Button"`, `data-part="leadingIcon"`, `part=`, `testID=`,
  `.accessibilityIdentifier("Button.label")`. The behavior and keyboard gates derive their locators from
  the canonical docs and find a component through exactly these, so a brand-agnostic gate needs a
  brand-agnostic hook. This is also the concrete reason `data-ds` keeps its own `ds`.
- A **component's custom property takes the new prefix and keeps the rest**: `--acme-button-background`,
  because the rest of a hook's name mirrors the canonical binding. A class or custom-element name is the
  component's own spelling, so both halves move there: `ds-button__label` → `acme-cta-button__label`,
  `<ds-button>` → `<acme-cta-button>`, and Lit's element class `DsButton` → `AcmeCtaButton`.
- A **token's emitted names move only under `tokens`, and its dotted path never moves**. Without the block,
  `var(--color-action-primary-background)` and React Native's `t.colorActionPrimaryBackground` keep their
  names under any namespace. With it, the CSS variable and the JS/RN/Swift key move to the names the token
  build emits for the doc, while `color.action.primary.background` and `cssVar('space.md')` stay as they are.
- **Composites follow automatically**, on every platform, because the rename is applied to the whole
  generated surface rather than to one file: Card's import, ActionSheet's `<acme-cta-button>`, the tag in a
  `querySelector`, a Swift gallery screen's `Gallery.ctaButtonScreen`.
- A **prop rename is scoped the way the doc says**: a bare key everywhere, a dotted key inside that
  component's own files and on its element in a composite's markup, with the dotted key winning. A prop
  threaded through a variable or a spread keeps the canonical spelling — honest limit, not a bug to find
  later.
- An **event rename reaches the name each platform emits**, not the neutral key. `events` is keyed by the
  neutral name (`Button.onPress`), but generated code emits `eventDef.platforms`: `onClick` on web,
  `press` on Lit, `onPress` on React Native. A string (`Alert.onDismiss: onClose`) is the brand's neutral
  name, and it reaches each platform whose canonical emitted name follows the convention: web and React
  Native get the string, Lit gets its kebab form without the `on` (`close`). Where a platform's own API
  won (Button's `onClick`), the string does not reach it, and the run prints a notice saying so. The
  object form (`Button.onPress: { web: onActivate, lit: activate, rn: onActivate }`) gives the exact
  emitted name for each platform it lists. On web and React Native the identifier moves in the
  component's own files and as an attribute on its element in a composite, but never on an intrinsic
  `<button onClick>` or an imported `<Pressable onPress>`, whose handlers belong to the platform. On Lit
  the quoted name moves in `new CustomEvent(…)` and `addEventListener` calls in the component's own
  files, and in `@press=` on its element in a composite. A composite that listens some other way keeps
  the canonical name: an `addEventListener('press', …)` call, or `@press=` on an ancestor, as Lit's
  Form does. SwiftUI's emitted names are argument labels, so the schema refuses a `swiftui` key.
- An **anatomy rename moves the part's own spellings and nothing else**: the class `__part` segment,
  Lit's `slot="…"`, `<slot name="…">` and a `slot[name='…']` selector. `Button.trailingIcon: endIcon`
  leaves the `trailingIcon` prop alone, which a `props` key cannot do when a prop and a part share a
  name. The gate hooks (`data-part`, `part=`, `::part()`) stay canonical, as they do for every rename.
- An **enum value rename moves a value only where the code ties it to one prop**, because the same word is
  often a token's name too. `values` resolves per component, per prop, per value: a bare `tone` key reaches
  every component whose `tone` has the value, and a dotted `Alert.tone` entry wins over the bare one for the
  same value and merges with it otherwise. The provable contexts are an attribute on the component's element
  (`variant="primary"`, with the prop's brand spelling in the same pass), a Lit attribute selector, an object
  property or JSON key naming the prop (a story's `args`, a behavior test's `setup`), a default, a comparison
  or `case` on the prop, the `ButtonVariant` union or the prop's own declaration, the `ds-button--primary`
  modifier class, an object literal whose keys are exactly the prop's values and no sibling prop's (React
  Native's `VARIANT_TOKENS`), and on SwiftUI an `enum ButtonVariant` with exactly those cases and
  `case .primary` inside `switch variant`. Everything else is reported, not guessed: a quoted literal equal to
  a renamed value in a file the prop reaches, an object key in a literal that is not the whole set, a SwiftUI
  `.primary` (which is also a `ShapeStyle`), and a prop interpolated into a token name
  (`` `color.action.${variant}.background` ``). `tools/naming.ts` prints each as
  `! <platform>: ambiguous value <file>:<line>` and leaves it untouched in both directions, so brand →
  canonical → brand stays exact and a brand hand-reviews the list. A value rename never moves a token in
  any spelling — `var(--color-action-primary-background)`, `colorActionPrimaryBackground`,
  `color.action.primary.background` — because a token's path is canonical schema that every theme keys
  off, and only `tokens` changes the names a token is emitted under; neither does a value in a comment or a
  gate hook.
- Three things the component generator does not own, and a fork has to: the packages' own `package.json`
  names (the rename rewrites `@design-schema/tokens` → `@acme/tokens` in the code it writes, but it never
  writes a manifest); the token package's type prefix — `tokens/build.mjs --naming acme` emits the doc's
  token names, but `namespace.typePrefix` does not reach the token build, so a SwiftUI fork setting
  `typePrefix.swiftui` gets `AcmeTokenRef` and `import AcmeTokens` in its component files while the build
  still writes `TokenRef` into the `DesignSchemaTokens` module beside the hand-written `Theme.swift`; and
  the fact that a *renamed* tree is not a gateable tree — the derived behavior and keyboard tests are
  canonical, which is why a generation normalizes before it runs them.

`namespace.typePrefix` applies to rn and swiftui only, the two platforms with prefixed type names. A key
for any other platform parses, renames nothing, and gets a notice when the rename runs.

`node tools/naming.ts --naming acme --platform web` prints what a rename would change without writing
anything, which is the cheap way to see a naming doc's effect before regenerating.

## Keeping old names working

Built 2026-09-15 as job 627. A rename replaces a name one for one, and that is what makes `--revert` an exact
inverse: schema/naming.ts refuses two canonical names mapped onto one brand name, and `tools/naming.ts` refuses a
brand name that is already a component. The cost lands on an adopter moving onto the system with a product
already built. A brand that shipped `ActionButton` with `kind="cta"` gets `CtaButton` with `emphasis="primary"`,
and a codebase-wide migration on day one.

Backwards compatibility with the adopter's existing API cannot come from the model. A compatibility layer the
generator wrote would be gated, hashed and regenerated like any component. So the *tool* writes it, at `--apply`
time, into one folder it owns.

**The field.** `aliases` is optional and defaults to `{}`, with three optional maps. Their keys are canonical
names, like every other map, so an upstream pull strands an alias key as loudly as a rename key:

```yaml
aliases:
  components:
    Button: [{ name: ActionButton, since: '2.0.0' }]
  props:
    Button.variant: [{ name: kind, since: '2.0.0' }]
  values:
    Button.variant:
      primary: [{ name: cta, since: '2.0.0' }]
```

An entry is `name`, then `since` and `deprecated`, then an optional `platforms` list (omitted means every
platform). `since` and `deprecated` are job 624's lifecycle fields, imported with their exact types, so an alias
is dated and explained the same way a deprecated prop is. A `deprecated.reason` is appended to the dev-only
warning. An alias names the old spelling of the *current* name: the brand name where the doc renames it
(`kind` is the old `emphasis`), and the canonical name otherwise (`cta` is the old `primary`).

Resolution refuses an alias that would shadow a real name:
- an alias equal to the name it aliases
- two entries with the same name in one scope
- a component alias that is any component's canonical or brand name
- a prop alias that is a prop, event or anatomy name of the component (canonical or brand), or a reserved prop
  name
- a value alias that is already a value of the prop

**What each platform gets.**

| Alias | web, rn | lit | swiftui |
|---|---|---|---|
| component | `/** @deprecated … */ export const ActionButton: typeof CtaButton = CtaButton;` and `export type ActionButtonProps` | a deprecated subclass `<Prefix>ActionButton` of the current element, registered as `<prefix>-action-button` when that tag is free, warning once on connect in development | `@available(*, deprecated, renamed: "CtaButton") public typealias ActionButton = CtaButton` |
| prop | a wrapper of the current component's own name that takes the alias, maps it onto the current prop (an explicitly passed current prop wins) and warns once per alias in development | unsupported | unsupported |
| value | the same wrapper, mapping the old value onto the current one, with a dev-only warning | unsupported | unsupported |

An unsupported cell is an error, not a silent skip. Renaming Lit with a prop alias that reaches it stops the run
with the entry, the platform and the fix: `aliases.props.Button.variant[0] (kind): prop aliases are not supported
on lit — the compatibility layer cannot add an attribute to a generated element without editing it. Add
platforms: [web, rn] to the entry.` The dev-only check in the emitted code is each package's own: `isDev` on
web, `__DEV__` on React Native, `import.meta.env.DEV` on Lit. Every export carries `@deprecated` with its
`since`.

**The folder the codemod owns.** Applying a rename writes `naming-compat/` inside the platform's source folder:
`packages/<pkg>/src/naming-compat/`, or `Sources/DesignSchema/naming-compat/` for SwiftUI. It holds one module per
aliased component and an `index.ts` barrel (no barrel for Swift). Every file's first line is
`// Generated by tools/naming.ts from <naming doc> (aliases). Do not edit; --revert deletes this folder.`

- `--apply` renames first, then writes the folder, replacing a previous copy.
- `--revert` deletes the folder before it renames anything back, so the gates never see it and the canonical
  tree comes back byte for byte.
- A file in the folder without the marker line stops both directions. It is somebody's hand-written code, and
  no run deletes that.
- No rewrite ever reads the folder: it is in `SKIP_DIRS`, like `custom/`.
- The pattern demo pages beside a package source are renamed without a compatibility layer.
- `--check` lists the files a run would write or delete.

**What a fork still owns.** The generator never edits a package's `index.ts` or `package.json`. Exposing
`naming-compat` is the fork's own manifest edit: an `exports` entry such as `@acme/react/naming-compat`, or a
re-export from the package root. It is the same kind of edit as the package scope. The token build is no longer
on that list for names: since job 628 it is taught a doc's `tokens` (`node tokens/build.mjs --naming acme`), so a
fork's token package emits the same names its renamed components read. It is still untaught one thing:
`namespace.typePrefix` does not reach it, so `TokenRef`, the `DesignSchemaTokens` module and the hand-written
`Theme.swift` keep their canonical names, and renaming them is the fork's own edit. Job 628 leaves that there.

## Keeping existing token names

Built 2026-09-15 as job 628. Token names were canonical by design, because the gates key off token paths. That
left a brand with an existing token set in front of a migration: its stylesheets say `--acme-color-brand-primary`,
and its JS reads `tokens.colorBrandPrimary`. `tokens` lets a naming doc change the names the token build emits,
and nothing any tool reads.

```yaml
tokens:
  cssPrefix: acme
  rename:
    color.action.primary.background: color.brand.primary
```

**What moves, and what never does.** The dotted path stays canonical everywhere a tool reads it; only the emitted
CSS variable and JS/RN/Swift key change.

| Name | Canonical | Under the block above |
|---|---|---|
| CSS variable | `--color-action-primary-background`, `--space-md` | `--acme-color-brand-primary`, `--acme-space-md` |
| JS and React Native key, Swift `TokenRef` case and `Theme` accessor | `colorActionPrimaryBackground`, `spaceMd` | `colorBrandPrimary`, `spaceMd` |
| Dotted path: the component docs, `generated/`, the built JSON, the `TokenRef` type, Swift raw values, `cssVar('…')` | `color.action.primary.background` | unchanged |

`cssPrefix` applies to CSS names only: a JS key lives on an object, so it has no global namespace to protect.
Without it, token variables stay unprefixed. A `rename` key is the token's public name, without a trailing
`.default`, and the brand path is any dotted path the checks below accept.

**Two tools apply it.**
- `node tokens/build.mjs --naming acme` (or `DS_NAMING=acme`, read the way `tools/generate.ts` reads it) emits the
  brand's names. That covers CSS variables and the references between them, the JS and React Native objects, and
  Swift's `TokenRef` cases and `Theme` accessors. In `names.js`, `cssVar`, `tokenKey` and `resolveToken` take a
  canonical ref and return the emitted name. The json output, `names.d.ts` and `TOKEN_NAMES` stay canonical,
  because tools/parse.ts, tools/spec_sheet.ts, the MCP server and the docs site read them. `--out DIR` writes
  the trees under `DIR` instead of the committed ones. A doc without `tokens` builds today's bytes.
- `tools/naming.ts` moves the same names in generated code as part of the rename. It moves a token variable in
  `var(--…)` and bare `--…` positions in CSS and TS files. On React Native and SwiftUI, the two platforms whose
  code reads keys, it also moves a camel key used as a member (`t.colorInverseLink`) or as a whole string literal
  (`'colorActionPrimaryBackground'`). A dotted ref is never touched. The token rule runs before the namespace
  rule, so with equal prefixes a revert turns `--acme-color-foreground` into `--color-foreground`, not
  `--ds-color-foreground`.

**Resolution refuses** the following, through `tools/lib/token_naming.ts`, which both tools run:
- a `rename` key that names no token, naming the public spelling when the key ends in `.default`
- a brand path that is another token's canonical path, unless that token is renamed away too
- two tokens that would emit one CSS variable or one JS key, such as `color.brandPrimary` beside
  `color.brand.primary`; schema/naming.ts already refuses two keys with the same brand path
- an emitted key that is already a `Theme` member, such as `colorScheme`
- when `tokens.cssPrefix` is `namespace.cssPrefix`, a token variable that equals or starts with a component's
  hook stem (`--acme-button-…`), since a revert could not tell the two apart

**The limit, stated plainly.** A fork's gates run canonical component code: a generation normalizes the tree
before its gates. The fork's token package, built with `--naming`, carries the brand's keys. So during that
run, React Native code reading camel keys (`t.colorActionPrimaryBackground`) from a brand-named token build finds
those keys missing. CSS variables in canonical code are missing from a brand-named stylesheet in the same way.
Dotted refs resolve, because `names.js` maps them. This job does not work around that.

**The limit, stated plainly.** Two kinds of check cover the wrappers' runtime mapping: typecheck, because the
demo's `tsc -p demo-brand` reaches `src/naming-compat/`, and tests of the emitted text in
`tools/__tests__/naming_aliases.test.ts`. No behavior run covers it. `pnpm demo:naming:gates` requires the same
derived tests to reach the same verdict on the canonical and renamed builds, and the canonical build has no old
names to test, so a scenario exercising `kind="cta"` has nothing to be compared with.

## What building the worked example changed (job 523, 2026-09-12)

Everything above was an argument until there was a tree to point at. There is one now:
`themes/demo-brand/naming.md` (`Button: CtaButton`, `Disclosure: Expander`, `Alert: Callout`,
`Button.variant: emphasis`, namespace `ds` → `demo`) applied to three components and the closure of
everything they import, landing in `packages/react/demo-brand/` — a sibling of `packages/react/src`,
regenerated by `pnpm demo:naming`, checked by `pnpm demo:naming:check` (which `pnpm check` runs), gated
by `pnpm demo:naming:gates`, and rendered beside the canonical components on the adopter site at
`/docs/naming-demo` (`apps/website`, see [The public website](/process/website-plan/)). 24 files, 591
names different from the canonical build, zero of them anything but an identifier. Six things the
sections above did not survive, or did not say:

- *"Exact inverses" is true of the trip that matters and not of the other one.* A generation takes a
  fork's tree brand → canonical → brand, and that round trip is byte-for-byte — `pnpm demo:naming:gates`
  checks it on all 24 files. Canonical → brand → canonical is **not** an identity, and the reason is
  worth knowing before choosing a brand name: a brand name that is also an ordinary word in the canonical
  prose is read as the brand's name on the way back. `Button.variant: emphasis` is exactly that, because
  Button's own JSDoc already says "Visual emphasis", which the revert rewords to "Visual variant". It
  costs a sentence in a tree that exists for the length of one gate run and never reaches a fork's disk,
  and no gate reads English — so it is reported (`packages/react/demo-brand/DIFF.md`, "Prose collisions")
  rather than failed on. The demo keeps the colliding name deliberately: a worked example that had quietly
  picked around the one rough edge would be worth less than one that shows it.
- *"Passes every gate" has to mean parity, not green.* `Button`'s `press-tracks` behavior scenario fails
  on the canonical build today — the doc says `onTrack` takes an object, the component passes two
  arguments — so a demo gate that demanded a green behavior run would have been reporting on that
  instead of on the rename. The gate runs the derived scenarios twice, canonical and renamed, and
  requires every test to reach the *same verdict on both*: 51 scenarios, one failing identically in both.
  That is also the stronger claim, since it fails on a rename that fixed something as loudly as on one
  that broke it.
- *A renamed tree is gateable by more than the doc-level gates.* `lint-literals` and `typecheck` read
  brand names perfectly well and are run directly against the renamed files; `contrast` and the
  keyboard-spec derivation never see a package at all, so they are run and byte-compared rather than
  argued about. It is only the *derived tests* that are canonical, which is a narrower statement than
  "a renamed tree is not a gateable tree" and the one worth carrying forward.
- *The diff is structural, which is what makes "identifiers and nothing else" checkable.* Each renamed
  file is tokenized beside its canonical original: the two must produce the same number of names
  separated by byte-identical text (so the JSX shape, the nesting, the prop order, the comments and the
  whitespace provably did not move), every differing name must be explained by a rule derived from the
  naming doc rather than borrowed from the rewriter, and the canonical vocabulary — every `data-ds`,
  `data-part`, `part`, `role`, `aria-*`, every `var(--token)` that is not a component hook, every
  element name — must appear unchanged. `tools/naming_demo.ts` is that, and its own tests are mostly
  cases where it has to say no.
- *The browser half is the half a source diff cannot reach, and it holds.* `tests/website/naming-demo.spec.ts`
  diffs the two renders' markup and their accessibility trees in Chrome, drives both halves of every
  interaction, and checks that `[data-ds="Button"]` still finds the button a brand calls `CtaButton`
  inside a component it calls `Callout`. The claim that keeps the derived gates brand-agnostic is now
  observed rather than asserted.
- *The three files a fork writes and the generator never does are visible in the demo, and one of them
  is a shim.* `tsconfig.json`, a Vitest config and a README are the fork's own; the generator wrote
  everything else. The renamed code imports `@demo/tokens`, which a real fork publishes and this
  repository cannot, so those two configs and `apps/website/astro.config.mjs` alias it back to
  `@design-schema/tokens`. It is the only thing in the worked example that is not what an adoption
  would have, and all three places say so.

## Why this is also the update mechanism

This is the more important part of the decision, and it's a consequence of the doc being a *sibling* rather than an edit to the canonical docs: an adopter's fork adds files, it never modifies the 51 canonical component docs. So when this project hardens a prompt, fixes a generation bug, or adds a component, an adopter pulls the updated canonical docs from upstream and regenerates — their `naming.md` and theme doc are untouched, unrelated files, so there is nothing to merge-conflict. Their renamed, re-themed system comes back out the other side of regeneration still renamed and re-themed, automatically.

This is the concrete answer to "the rest is as it regenerates over time for people as they iterate" from the last decision: the fork model (vendor the schema docs, typically as a `git subtree` or a plain clone rather than a submodule, so the adopter's own additions live in the same tree) plus naming/theme as additive sibling files is *why* that iteration doesn't require reconciling two people's edits to the same file. It only breaks down in one case, and it's worth naming honestly: if an adopter hand-edits *generated* code directly (not the schema, the output), a later regeneration overwrites that edit. The extension mechanism (`process/extending-components.md`, props/events/modules that survive regeneration) exists precisely so an adopter reaches for that instead of hand-editing output — `naming.md` is the same philosophy applied to names instead of behavior.

## Our job vs. theirs

Once someone has forked and customized, deciding *when* to pull updates, *what* to extend locally versus request upstream, and *how* to structure their own new components so a future pull doesn't clobber them — that's the adopter's call, not this project's. Our deliverable is the guidance for doing it safely, not doing it for them: [Extending components](/process/extending-components/) already covers schema-level extension, and its companion covering the fork/update workflow itself is [Updating your fork](/guides/updating-your-fork/) (job 522) — the vendoring model, when to pull, why these sibling docs come through a pull untouched, and what to do in the rare case an upstream schema change touches a binding a brand renamed.

That last case is the only friction there is, and job 522 made it loud rather than silent: because a naming map's key is always the canonical name, `tools/naming.ts` can check every key against `generated/components.json` when it resolves the doc, and a key that matches no component, prop, event or anatomy part stops the run with the key named. A rename that quietly applies to nothing — one component left canonical in a tree where every other one moved — is the failure this design could otherwise have had.

## Jobs for Claude Code

| Job | Does | Gate |
| --- | --- | --- |
| 520-naming-schema | `schema/naming.ts` (Zod): namespace, `components`, `props` maps; `naming.schema.json` regenerated from it, same pattern as `component.ts` | a hand-written example `naming.md` for a fictional brand parses without error |
| 521-naming-resolver | `tools/parse.ts`/`tools/generate.ts` gain a naming-resolution step: templates consult the active `naming.md` (if any) when emitting a file name, export identifier, prop name, or CSS/TokenRef prefix, for every platform (web, Lit, RN, and SwiftUI once it lands) | generating `Button` with a `naming.md` mapping `Button: CtaButton` and namespace `acme` produces `CtaButton.tsx` exporting `CtaButton`, CSS vars prefixed `--acme-`, with zero canonical-schema changes required |
| 522-update-workflow-guide | [Updating your fork](/guides/updating-your-fork/): the vendoring model (subtree vs. plain clone), when to pull, how naming.md/theme.md survive a pull untouched, what to do if an upstream change touches a renamed binding, and the extension mechanism as the alternative to hand-editing output | reviewed against a real trial pull (job 523's demo fork pulling a later commit) |
| 523-naming-demo | Apply a `naming.md` to the `apps/website`/`packages/react` proof of concept itself (job in `claude/website-plan.md`'s territory) — not a real rebrand, a worked example proving the mechanism, e.g. a `themes/demo-brand/naming.md` regenerating a couple of components under a different name/prefix, shown side by side with the unrenamed originals | the renamed build and the canonical build both pass every gate; diffing the two shows only identifier changes, no behavioral drift |

Order: 520 before 521 (schema before the resolver reads it); 521 before 523 (the resolver has to exist before there's anything to demo); 522 can be written in parallel and revised once 523 gives it a real pull to describe.
