---
title: Extending components
description: How an owner adds custom props, events, keyboard rules and behavior to a system component — in a way the generator keeps on every future regeneration — and where hand-written code lives so the model wires it rather than rewrites it.
sidebar:
  order: 6
---

The generator is only trustworthy if regenerating never loses anything. That rules out editing generated code by hand: the next run rewrites the file and the edit is gone. It also rules out forking a component doc: the fork drifts from upstream and stops receiving fixes. Extensions are the third way. An extension is a small doc that says "Button also has this", merged into the component's schema at parse time, so the merged schema is what the generator sees — on every run, forever.

## Two kinds of custom functionality

Most customization is declarative and needs no code: a new prop with an enum and a style binding, a new event, an extra copy string, another keyboard rule, another behavior scenario. The extension doc declares it; the model implements it like any other part of the schema, and the gates check it like any other part.

Some customization is logic the model should not be asked to reinvent each time: a pricing rule, an analytics call, a domain-specific validator, an animation the brand insists on. For that, the extension declares a **custom module**: a hand-written file with a stated signature, and a prop or event that the component must route through it. The generator imports and calls the module; it never writes its body. Regeneration cannot drift because the contract is in the doc and the behavior is in your file.

## The extension doc

`site/src/content/docs/extensions/<Component>.<name>.md`, one per concern:

```yaml
---
title: Button — analytics
extension:
  extends: Button
  name: analytics
  props:
    track:
      type: string
      description: 'An event name sent to analytics when the button is pressed. Omit for no tracking.'
  events:
    onTrack:
      description: Fired after onPress with the `track` name and the button''s label.
      platforms: { web: onTrack, lit: track, rn: onTrack, swiftui: onTrack }
  behavior:
    - name: press-tracks
      given: { track: 'signup', label: 'Sign up' }
      when: { click: control }
      then: [{ event: onTrack, with: { name: 'signup', label: 'Sign up' } }]
  modules:
    trackPress:
      path: custom/analytics.ts
      signature: '(name: string, label: string) => void'
      wire: 'Called from onPress when `track` is set, before onTrack fires.'
---

Why this exists, and what the module does, in prose. The prose is inlined into the generation prompt
under "Extensions", so write it for the model as much as for people.
```

Rules the parser enforces:

- An extension can **add** props, events, styles (unlocked bindings only), copy, keyboard rules, behavior scenarios and modules. It cannot remove or change anything upstream declares, and it cannot add a contrast pair that would fail, a locked binding, or an `a11y.requires` entry that upstream lacks (that would be a claim the base component does not meet).
- Names must not collide with upstream or with other extensions of the same component; the parser reports the collision and the file.
- Each `modules` entry must exist at `packages/<platform>/src/<path>` for every platform the extension targets, and export a function whose name matches the key. The `modules` gate checks the file exists and typechecks against the signature (a generated `.d.ts` stub). Missing modules fail before any model call.
- Style bindings in an extension get hooks and overrides like any other binding (`--ds-button-<binding>`), so extension styling is per-instance overridable too.

## What the generator sees

`tools/parse.ts` merges every extension into its component, marks each merged item with `source: extensions/<file>` in `generated/components.json`, and adds an **Extensions** section to the prompt: the merged props/events/etc. are already in place in the schema tables, and the section carries the prose plus the module contracts ("import `trackPress` from `./custom/analytics`; call it from onPress when `track` is set"). The prompt hash includes the extension docs, so editing an extension makes exactly its component stale.

The generated component imports modules by relative path and calls them at the declared points. It does not read, copy or "improve" their bodies. If a module's signature changes, the extension doc changes with it, the parser regenerates the stub, and the component is stale — the normal loop.

## What stays hand-written, and where

`packages/<platform>/src/custom/` is yours. The generator never writes there (the `--allowedTools` scope excludes it and the `modules` gate fails if a file there changed during a run). Put modules there with the exact exported names the extension docs declare. Tests for modules are yours too, in the same folder.

Everything else under `src/` is the generator's. The rule is the same as for docs: if you want to change generated code, change the doc (or add an extension) and regenerate.

## Adding a whole component

A custom component that is not in the system — a `PriceTag`, a `StoreLocatorMap` — is not an extension; it is a component doc, written like any other (see [Authoring a component](/guides/authoring-a-component/)), composing system components, generated by the same pipeline. Prefix its name with your scope in the doc (`Acme` category or a `namespace:` field, planned) so it never collides with a future upstream component of the same name.

## Upgrading upstream

[Updating your fork](/guides/updating-your-fork/) is the companion to this page: how to vendor the canonical docs so the pull itself stays clean, and when to bother pulling at all. The schema-level half is here.

When a new version of the system's docs arrives, the merge is: upstream docs replace upstream docs; your extensions and custom modules stay; parse. Collisions show up as parser errors (upstream added a prop your extension also added) and are resolved by renaming or deleting your side. Then regenerate; only the components whose merged schema changed are stale. This is the whole reason extensions are docs and not patches: a patch against generated code would break on every upstream change, while an extension merges at the schema level, where the contract lives.

## Planned

`namespace:` on component docs for custom components; `slots` as a declared extension point on container components (named places an extension can inject content, e.g. `Card.headerActions` or `Table.emptyState`) so content extension does not need a new prop; and a `pnpm ds upgrade` that fetches upstream docs, merges, parses, and reports the stale set.
