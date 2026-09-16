---
title: Updating your fork
description: How to vendor the canonical schema docs so pulling upstream stays a clean, low-friction operation — when to pull at all, why your naming and theme docs survive a pull untouched, and what to do in the one case where an upstream change reaches a name you renamed.
sidebar:
  order: 1
---

This guide is for the **owner** path in [Two ways in](/guides/two-ways-in/): you have taken a copy of
this repository, pointed it at your own brand, and now want to keep receiving upstream's work without
losing yours. An adopter who only installs `@design-schema/react` and writes a theme doc does not need
any of this — their update is `pnpm up`, and [Publishing](/process/publishing/) describes what ships.

Its companion is [Extending components](/process/extending-components/), which covers the *other* half:
adding props, events, keyboard rules and hand-written modules at the schema level so regeneration keeps
them. This page is about the update path itself.

## What you are actually vendoring

Not a library — the pipeline. Your copy holds the 51 canonical component docs, `schema/`, `tools/`,
`prompts/`, the gates, and the generated packages, because regenerating is the thing you own.

Everything you add goes in a handful of places, and none of them is a file upstream writes to:

| Yours | What it is |
| --- | --- |
| `themes/<brand>/naming.md` | Your names: package scope, CSS prefix, component and prop renames ([Brand naming](/process/customization-and-naming/)) |
| `site/src/content/docs/themes/<brand>.md` | Your look: seed colour, typeface, density, motion ([From vision to system](/process/from-vision-to-system/)) |
| `site/src/content/docs/extensions/*.md` | Props, events, behaviour and module contracts merged into a component's schema |
| `packages/<platform>/src/custom/` | Hand-written module bodies the generator imports and never rewrites |
| `site/src/content/docs/components/<yours>.md` | Components that are not in the system at all |

That list is the whole design. Your additions are *new paths*, never edits to existing ones, and git
merges by path — which is why the pull below is boring.

## Clone with an `upstream` remote

**Recommended.** Take a clone, rename its remote, and point `origin` at your own repository:

```bash
git clone https://github.com/design-schema/design-schema.git acme-design-system
cd acme-design-system
git remote rename origin upstream
git remote add origin git@github.com:acme/acme-design-system.git
git push -u origin main
```

Three reasons this is the right shape and not just the easy one:

- **Your additions sit in the same tree as the thing they extend.** `themes/`, the extensions folder
  and `src/custom/` are directories *inside* the system; there is no boundary to draw a vendor prefix
  around. A clone puts your files exactly where the tools look for them with no path juggling.
- **Upstream's history is in your history.** After a pull, `git log` shows upstream's own commit
  subjects next to yours. That matters more than it sounds: the commit log is the changelog you read to
  decide whether the *next* pull is worth doing.
- **You can read before you merge.** `git log --oneline HEAD..upstream/main` and
  `git diff --stat HEAD upstream/main -- site/src/content/docs/components/` answer "what changed, and
  does it touch anything I renamed?" without touching your working tree.

**`git subtree`, if you must keep one repository.** If company policy puts the design system inside the
product repo, vendor it at a prefix:

```bash
git subtree add  --prefix=design-system https://github.com/design-schema/design-schema.git main --squash
git subtree pull --prefix=design-system https://github.com/design-schema/design-schema.git main --squash
```

This works — the pull merges, and a `design-system/themes/acme/naming.md` committed inside the prefix
comes through untouched. Know what it costs. `--squash` collapses the release into one commit reading
`Squashed 'design-system/' changes from b9512e3..3460d49`, so the upstream subjects — the signal you
decide on — are not in your log; drop `--squash` and you graft upstream's entire history into the
product repo instead. And your own files still have to live inside the prefix, because `themes/` is
upstream's directory, so the clean boundary a subtree usually buys you is not on offer here.

**Not a submodule.** A submodule is a pinned checkout of someone else's repository: you cannot commit
`themes/acme/naming.md` into it without committing to upstream. Every extension point this system has
is a file inside the tree, so a submodule forbids exactly the thing you forked to do.

## When to pull

Whenever you want something. There is no obligation running the other way.

This project has no release feed to subscribe to, no deprecation clock, and no way to reach into your
repository. Nothing you generate phones home and no version range floats — a fork that never pulls
again keeps working indefinitely. As
[Brand naming](/process/customization-and-naming/#our-job-vs-theirs) puts it, deciding when to pull is
the adopter's call, not this project's; the deliverable here is guidance for doing it safely, not a
schedule. (The job that commissioned this page cites that reframing to `vision-and-decisions.md`, which
[has never been a file in this repository](/process/publishing/#the-pages-site) — the live statement is
the one linked above.)

So pull on a trigger, not a calendar. Worthwhile triggers:

- **A component you want exists now.** [Component roadmap](/process/component-roadmap/) is the order
  things get built in; `git log upstream/main -- site/src/content/docs/components/` shows what landed.
- **A prompt or generation fix.** [Generation log](/process/generation-log/) is where defects found by
  running the prompts get written down, and each one is a class of bug your generated code has too.
- **A new or tightened gate.** Contrast, keyboard, literal and behaviour gates are the part of the
  system you did not have to write; a stricter one is free work.
- **A token or theme derivation fix**, which reaches every component at once through `pnpm themes`.

If nothing on that list applies, skipping a release costs you nothing. Pulling two releases at once
costs the same as pulling one.

## The pull

```bash
git fetch upstream
git log --oneline HEAD..upstream/main          # what you are about to take
git merge upstream/main                        # a merge, not a rebase: keep your commits where they are

pnpm install                                   # the lockfile may have moved
pnpm check                                     # re-derives themes and tokens, and re-parses the schema
node --import tsx tools/naming.ts --naming acme --platform web --check
pnpm generate --stale                          # regenerate only what the merged docs made stale
```

Do not skip `pnpm check` (or at least `pnpm parse`, which it runs) before the naming check.
`generated/components.json` is gitignored, so it is never in a pull and never in a fresh clone; it is
the parsed canonical schema, and it is what the naming resolver checks your doc against. Without it
there is nothing to check against, the check is skipped, and a green `--check` means less than it
looks like.

Prefer `merge` over `rebase`. Your commits are additive files, so there is nothing to replay, and a
merge leaves upstream's commits intact in your log where you can read them later.

## Why your naming and theme docs survive untouched

Because they are files upstream has never heard of.

A naming doc is a *sibling* of a theme doc and neither is an edit to a canonical component doc — the
whole argument is in [Brand naming](/process/customization-and-naming/#why-this-is-also-the-update-mechanism).
The mechanical consequence is small and complete: git merges per path; upstream's commits touch
upstream's paths; `themes/acme/naming.md` is not one of them; therefore there is no conflicting path,
therefore there is no conflict. Not "usually" — structurally. The same holds for your extension docs,
your `src/custom/` modules and your own component docs.

Regeneration then does the rest. The model still reads the canonical docs and writes canonical code,
every gate still runs on canonical names, and the rename is applied last — so your system comes back
out of `pnpm generate` still renamed and still themed, without you doing anything.

The one rule that keeps this true: **never edit a canonical doc in place.** The moment you change a
line in `site/src/content/docs/components/button.md`, you own a conflicting path and every future pull
will say so. If you need Button to be different, that is an extension. If everybody needs Button to be
different, send it upstream.

## When a pull touches a name you renamed

This is the one place a pull can still cost you time, and it is worth understanding why it costs you
*only* time.

A naming map is written canonical-on-the-left:

```yaml
components:
  Disclosure: Expander        # upstream's name → yours
props:
  Disclosure.keepMounted: alwaysMounted
```

The key is upstream's name; the value is yours. So if upstream renames `keepMounted` to `alwaysRender`,
your key is pointing at something that no longer exists. The failure mode this *could* have had is the
bad one: the rename quietly applies to nothing, one prop keeps its canonical spelling in a tree where
everything else moved, and you find out months later.

It does not fail that way. `tools/naming.ts` resolves the doc against `generated/components.json` and
refuses to run:

```
✖ themes/acme/naming.md: 1 key(s) name nothing in the canonical schema:
    props.Disclosure.keepMounted: Disclosure has no prop, event or anatomy part called keepMounted
  A naming map's key is the canonical name, so an upstream rename or removal leaves it stranded.
  Point the key at the name upstream uses now, or drop it. If the schema is simply stale here,
  re-run `pnpm parse` to rebuild generated/components.json.
```

Every stranded key is reported at once, and a component upstream renamed away reads the same way
(`components.Disclosure: no canonical component is called Disclosure`).

To reconcile, read the upstream commit that moved it, then pick one:

- **Point the key at the new canonical name.** `Disclosure.alwaysRender: alwaysMounted`. This is the
  usual answer, and it is why the friction stays in the naming doc: your brand spelling lives on the
  *value* side, so it does not move. Your product code still says `alwaysMounted`; only the doc's key
  changed.
- **Drop the key**, if upstream's new name is one you are happy to adopt.
- **Treat it as a removal**, if the prop is gone rather than renamed. Delete your rename and handle the
  removal like any other upstream API change — the naming doc is not the problem in that case, the
  missing prop is.

Two limits worth stating plainly. The check knows whether a key *matches* something; it cannot know
whether upstream changed what that something *means*, so a semantic change still needs the diff. And it
is skipped entirely when `generated/components.json` is absent, which is the other reason `pnpm parse`
belongs in the sequence above.

## Do not hand-edit generated output

The extension mechanism exists so that you never have to, and it is the only part of this design that
breaks if you ignore it: a hand edit to a file under `packages/<platform>/src/` is gone at the next
regeneration, whether or not you ever pull.

There are exactly three places your own work belongs, and regeneration preserves all three:

- an **extension doc**, for a prop, event, style binding, copy string, keyboard rule or behaviour
  scenario — merged into the component's schema at parse time, so the generator sees it every run;
- a **custom module** under `packages/<platform>/src/custom/`, for logic the model should not be asked
  to reinvent — the generator imports and calls it, and never writes its body;
- a **component doc of your own**, for something the system does not have at all.

[Extending components](/process/extending-components/) is the how, including what an extension may and
may not declare and what the parser does when an upstream release adds a prop your extension already
added (it reports the collision by name; you rename or delete your side).

---

*The sequences on this page were run end to end on 2026-09-12 against a sandbox fork of this
repository: clone, add `themes/acme/naming.md`, take a later upstream commit that renamed
`Disclosure.keepMounted`, and confirm the merge was clean, the naming doc came through byte-identical,
and the stranded key was reported rather than silently ignored. The `git subtree` flow and the
`--squash` log output above are from the same run, vendoring the same two commits at a prefix.*

*Re-checked the same day against job 523's demo fork, which has what the first run did not — renamed
*output*, not just a naming doc. Upstream added a prop to `Button`; the fork
pulled it with no conflict and its `themes/demo-brand/naming.md` byte-identical; `pnpm demo:naming:check`
said the fork's renamed tree was behind rather than letting it quietly ship stale; and one regeneration
brought the change through as `CtaButton`'s `elevated` prop and `.demo-cta-button--elevated`, with
`data-ds="Button"` still canonical underneath. The only files the fork had to commit afterwards were its
own generated ones. That is the whole claim of this page, run end to end — see
[Brand naming, and the update path](/process/customization-and-naming/), "What building the worked
example changed".*

*To repeat that check in your own fork:*

1. Before the pull, `pnpm parse` and `pnpm demo:naming:check` pass.
2. Upstream adds a prop to `Button`, and `git merge upstream/main` merges with no conflicted paths.
3. `git diff <commit before the merge> HEAD -- themes/demo-brand/naming.md` is empty.
4. `pnpm demo:naming:check` now fails and names `src/CtaButton.tsx` as different.
5. `pnpm demo:naming` regenerates the renamed tree. The new prop arrives as `CtaButton`'s `elevated`
   and `.demo-cta-button--elevated`, and `data-ds="Button"` stays canonical.
6. `pnpm demo:naming:check` passes again, reporting every difference as an identifier.
7. `git status` shows changes only under `generated/` and `packages/react/demo-brand/`.
