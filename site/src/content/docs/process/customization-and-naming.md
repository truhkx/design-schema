---
title: Brand naming, and the update path
description: How a brand tailors the generated system's names — components, props, the token/CSS vocabulary — without forking the canonical schema, and how that same decoupling is what lets them pull hardened updates later without conflict.
sidebar:
  order: 10
---

Decided 2026-09-12. The theme doc already tailors a brand's *look* — OKLCH colors, density, layout rhythm and content width (`foundations/layout.md`, `process/vision-and-decisions.md`'s theme decisions). It says nothing about *names*: today every fork gets `@design-schema/react`, a `Button`, `--ds-button-background`, a `TokenRef` enum — Design Schema's own vocabulary, not the adopter's. Tony wants that tailorable too: a brand should be able to run the pipeline and get `@acme/react`, `CtaButton`, `--acme-button-background`, without hand-editing generated output or forking the canonical component docs to do it.

## naming.md — a sibling doc, not a theme-doc section

A new doc type, alongside a theme doc rather than inside one: `themes/<brand>/naming.md`. Three things it can override:

- **Namespace.** The package scope (`@design-schema` → `@acme`), the CSS custom-property prefix (`--ds-` → `--acme-`), and the per-platform type-name prefix where one exists (Swift's generated `TokenRef` enum, RN's theme context name).
- **Component names.** A map, canonical → brand (`Button: CtaButton`, `Disclosure: Expander`). Applies to the generated file name, the exported type/struct/class name, and every reference to that component from a composite (Card's `headerActions` still renders a `Button`-shaped thing; it now imports it as `CtaButton`).
- **Prop / anatomy names.** A map, scoped globally or per component (`variant: style` everywhere, or just `Button.variant: style`), for the rare brand whose existing internal conventions already disagree with the schema's.

What it explicitly does **not** touch: the canonical schema's own internal keys — `props.variant`, `a11y.role`, the token path `color.action.primary.background`, anything the gates (contrast checker, keyboard-spec derivation, lint-literals, behavior tests) key off of. Those stay fixed across every fork. `naming.md` is a rename applied to *generated output identifiers* at the templating step — the model still reads the canonical schema and the canonical prompt, and only the last step (writing the file, naming the export) consults `naming.md`. This is what keeps the gates brand-agnostic: they never need to know a brand called `Button` something else.

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
- A **custom property takes the new prefix and keeps the rest**: `--acme-button-background`, because the
  rest of a hook's name mirrors the canonical binding. A class or custom-element name is the component's
  own spelling, so both halves move there: `ds-button__label` → `acme-cta-button__label`,
  `<ds-button>` → `<acme-cta-button>`, and Lit's element class `DsButton` → `AcmeCtaButton`.
- **Composites follow automatically**, on every platform, because the rename is applied to the whole
  generated surface rather than to one file: Card's import, ActionSheet's `<acme-cta-button>`, the tag in a
  `querySelector`, a Swift gallery screen's `Gallery.ctaButtonScreen`.
- A **prop rename is scoped the way the doc says**: a bare key everywhere, a dotted key inside that
  component's own files and on its element in a composite's markup, with the dotted key winning. A prop
  threaded through a variable or a spread keeps the canonical spelling — honest limit, not a bug to find
  later.
- Three things the component generator does not own, and a fork has to: the packages' own `package.json`
  names (the rename rewrites `@design-schema/tokens` → `@acme/tokens` in the code it writes, but it never
  writes a manifest); the token package itself, which `tokens/build.mjs` emits — a SwiftUI fork setting
  `typePrefix.swiftui` gets `AcmeTokenRef` and `import AcmeTokens` in its component files, and the token
  build has to be taught the same prefix for those to resolve; and the fact that a *renamed* tree is not a
  gateable tree — the derived behavior and keyboard tests are canonical, which is why a generation
  normalizes before it runs them.

`node tools/naming.ts --naming acme --platform web` prints what a rename would change without writing
anything, which is the cheap way to see a naming doc's effect before regenerating.

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
