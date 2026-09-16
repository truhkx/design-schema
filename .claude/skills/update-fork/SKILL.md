---
name: update-fork
description: Take an owner's fork of Design Schema through an upstream update — check the fork's shape, fetch and preview what upstream changed, merge, fix the naming keys and extension collisions the update stranded, re-check, and regenerate only the targets that went stale, with permission and a cost estimate first. Use when someone wants to pull, sync, merge or update from upstream, take a new Design Schema release into their fork, rebase their brand onto upstream, or asks why their naming doc or extensions broke after a pull.
---

# Update a fork from upstream

The procedure is `site/src/content/docs/guides/updating-your-fork.md`. This skill follows it and adds the two steps people doing it by hand skip: resolving **stranded keys** (a naming key or extension that names something upstream renamed or removed) and regenerating the **stale targets** (components whose merged prompt changed). Those are the steps that break a fork quietly, so do not end without them.

Read before starting, from that guide: "What you are actually vendoring", "Clone with an `upstream` remote", "The pull", "Why your naming and theme docs survive untouched", "When a pull touches a name you renamed" and "Do not hand-edit generated output". The schema-level half is "Upgrading upstream" in `site/src/content/docs/process/extending-components.md`.

Run every command from the repository root. Do not commit, push or resolve a conflict in the adopter's own files without asking.

## 1. Check the fork's shape

```sh
git remote -v
git status --porcelain
```

- **No `upstream` remote.** Add it (the guide's clone renames the original `origin` to `upstream`):
  `git remote add upstream https://github.com/design-schema/design-schema.git`
- **A dirty working tree.** Stop. Ask them to commit or stash first; a merge on top of uncommitted work mixes their edits with upstream's.
- **Find the brand.** `themes/<brand>/naming.md` names it; the brand is the folder name. A fork with no naming doc is the unrenamed case: skip every naming step below and leave `--naming` off.

List what the fork owns, the guide's "What you are actually vendoring" table:

| Owned by the fork | Path |
| --- | --- |
| Naming doc | `themes/<brand>/naming.md` |
| Theme doc | `site/src/content/docs/themes/<brand>.md` |
| Extensions | `site/src/content/docs/extensions/<Component>.<name>.md` |
| Hand-written modules | `packages/<platform>/src/custom/` |
| Their own components | component docs under `site/src/content/docs/components/` that upstream does not have |

Then find edits to upstream's files. After `git fetch upstream` (step 2), the merge base is the last upstream commit the fork took, so this lists what the fork changed in upstream-owned paths since then:

```sh
git diff --name-status $(git merge-base HEAD upstream/main) HEAD -- site/src/content/docs/components/ schema/ tools/ prompts/templates/ mcp/
```

An `A` line is a file the fork added (their own component doc is fine). An `M` or `D` line is an edit to an upstream file. **Warn about every one:** the guide's rule is "never edit a canonical doc in place", because every edited path is a merge conflict on every future pull. Recommend moving a canonical component doc edit into an extension, and anything everybody needs upstream as a contribution.

## 2. Preview the update

```sh
git fetch upstream
git log --oneline HEAD..upstream/main
git diff --stat HEAD...upstream/main -- schema/
git diff --stat HEAD...upstream/main -- site/src/content/docs/components/
git diff --stat HEAD...upstream/main -- prompts/templates/
git diff --stat HEAD...upstream/main -- tools/ mcp/
git diff --stat HEAD...upstream/main -- packages/ generated/
```

Three dots compare against the merge base, so these show upstream's changes only, not the fork's. Summarize by kind: schema, canonical component docs, templates, tools, generated code. Then read the diffs that can reach the fork:

- **Renamed or removed names the naming doc references.** Every key in `themes/<brand>/naming.md` (`components`, `props`, `events`, `anatomy`, `values`, `aliases`) is a canonical name. For each component the doc names, read `git diff HEAD...upstream/main -- site/src/content/docs/components/<component>.md` and look for `-` lines removing a prop, event, anatomy part or enum value the doc keys on. Component doc file names are lowercase (`button.md`).
- **New keys that collide with extensions.** For each extension `<Component>.<name>.md`, check the component's diff for `+` lines adding a prop, event, style binding, copy key, anatomy part or behavior scenario with a name the extension also adds. Also check for removed props its `defaults` or `omit` name, and for a removed component it `extends`.
- **Deprecations.** The schema has `since` and `deprecated` on props, events and enum values (`schema/component.ts`). `git diff HEAD...upstream/main -- site/src/content/docs/components/ | grep -E '^\+.*(deprecated|since):'` lists the new ones; name any the fork's naming doc, extensions or product code use.
- **Generated output**, when the fork is renamed: note whether the last `--stat` touched `packages/`. If it did, take step 3's before count.

This is a reading of the diff and can miss things. Step 4's tools are the authority.

## 3. Merge

The guide's sequence ("The pull"): a merge, not a rebase, so the fork's commits stay where they are.

**A renamed fork: count first.** Git can bring upstream's canonical edits into a brand-named file without a conflict. Before merging, count what a rename would still change. On a fully renamed tree the count is near zero, not exactly zero, because prose that happens to use a brand word counts too. Note the per-platform `would change N file(s)` lines:

```sh
node --import tsx tools/naming.ts --naming <brand> --platform web,lit,rn --check
```

Then merge:

```sh
git merge upstream/main
pnpm install
```

**Conflicts.** List them with `git status`. Sort each one by who owns the path:

- **A file the fork owns** (the table in step 1): theirs to decide. Show both sides and resolve it with them.
- **An upstream-owned file** (a canonical component doc, `schema/`, `tools/`, `prompts/templates/`): the fork edited it. Say so plainly. Take upstream's version only with their agreement, and recommend moving the fork's change into an extension or a sibling file so the next pull does not conflict again.
- **Generated output and lock files** in a renamed fork (`packages/<platform>/src/` outside `custom/`, `generated/generate.lock.<platform>.json`): the fork's files carry brand names and upstream's carry canonical ones, so neither side is right. Keep the fork's side (`git checkout --ours -- <path>`), which leaves the fork's lock entry describing the fork's files. Step 6 then regenerates whatever upstream's docs changed.

**A clean merge of generated output is not proof, in a renamed fork.** After step 4's parse passes, run the same naming `--check` again. A count that rose means canonical code merged into the fork's tree. Name the files the merge touched (`git diff --stat ORIG_HEAD HEAD -- packages/`) and treat those targets as needing regeneration in step 6, even if the lock does not list them as stale. The guide's trial pulls took doc changes, not upstream-regenerated code, so this case is not covered by them.

## 4. Fix what was stranded

Parse first. `generated/components.json` is gitignored, so it is never in a pull; without a fresh one the naming check has nothing to check against and passes vacuously.

```sh
pnpm parse
```

Parse errors are `✖` lines naming the extension file. The ones an update causes:

| Error | Cause | Fix to propose |
| --- | --- | --- |
| `extensions/X.md: props.foo collides with Button's own schema` (also `events`, `styles`, `copy`, `anatomy`, a behavior scenario) | upstream added a name the extension already added | if upstream's item does the same job, delete the extension's; otherwise rename the extension's side, and the matching `src/custom/` module and product code with it |
| `defaults.foo names no prop upstream on Button` | upstream removed or renamed the prop | point the default at the new name, or drop it |
| `omit.props.foo names nothing upstream on Button` | same | point it at the new name, or drop it |
| `extends 'Disclosure', which has no component doc` | upstream renamed or removed the component | rename the file and `extends` to the new component, or retire the extension |

Then the naming check. The flags are `--naming`, `--platform` and `--check`; `--check` writes nothing. Add `swiftui` to the list if the fork generates it.

```sh
node --import tsx tools/naming.ts --naming <brand> --platform web,lit,rn --check
```

A stranded key stops the run with every key listed at once:

```
✖ themes/acme/naming.md: 1 key(s) name nothing in the canonical schema:
    props.Disclosure.keepMounted: Disclosure has no prop, event or anatomy part called keepMounted
```

Keys under `components`, `props`, `events`, `anatomy`, `values` and `aliases` are all checked. For each one, find the upstream commit that moved it (`git log -S keepMounted upstream/main -- site/src/content/docs/components/`) and propose one of the guide's three fixes:

- **Point the key at the new canonical name** (`Disclosure.alwaysRender: alwaysMounted`). This is the usual one: the brand spelling is the value, so product code does not change.
- **Drop the key**, if they are happy to adopt upstream's new name.
- **Treat it as a removal**, if the prop is gone: delete the rename, and handle the missing prop as an API change in their product code.

Show the exact edit to the naming doc and apply it only when they agree. Re-run parse and the naming check until both pass. `! <platform>:` lines are notices and ambiguous values, not failures; show them, don't fix them unasked.

Limit, stated in the guide: the check knows whether a key *matches* something, not whether upstream changed what it *means*. Point at any renamed key whose component diff also changed the prop's description or type.

## 5. Re-check

```sh
pnpm check
pnpm generate:check
```

`pnpm check` re-derives themes and tokens, re-parses and checks contrast. A contrast failure in the fork's theme after a derivation change is the theme's to fix (the `create-theme` skill), never a component's.

`pnpm generate:check` lists `stale  <Component>.<platform>` lines and `N stale of M targets`, and exits 1 when anything is stale. After a pull that changed docs or templates, exit 1 is the expected result, not a failure. It lists every platform, including `swiftui`.

## 6. Regenerate only what is stale, with permission

Regeneration calls a model and costs money, so list first and ask.

1. From the `generate:check` output, list the stale targets grouped by platform, plus any targets step 3 found with merged canonical code.
2. Estimate the cost per target. The best figure is the fork's own last run: `costUsd` on that target's entry in `generated/generate.lock.<platform>.json`. When a target has none, use the documented figures in `site/src/content/docs/process/generation-pipeline.md`: a full first pass of roughly 150 targets was estimated at $150–250 on Sonnet, about $1–1.70 per component per platform. The first Icon run at Fable rates measured $1.8–2.8 per target. SwiftUI (`site/src/content/docs/process/ios-platform.md`) is estimated at $2–3 per component on Sonnet, plus a CI round trip, and needs `gh`. Give a total range, and say which figures are measured and which are projections.
3. Ask. Offer everything stale, a subset of platforms, or named components.
4. With agreement, run with their naming doc, which is what keeps the output in brand names:

```sh
pnpm generate --stale --platform web,lit,rn --naming <brand>
```

For named components (including the step 3 cases the lock does not see):

```sh
pnpm generate --component Button,Disclosure --platform web --naming <brand>
```

Pass flags straight after the script name. `pnpm generate -- --stale`, the form the guide shows, fails: pnpm passes the `--` through and `tools/generate.ts` rejects it as `unrecognized arguments: --`.

`--stale` filters by `--platform` (default `web,lit,rn`); omit `--naming` for an unrenamed fork, or set `DS_NAMING=<brand>` instead. Each target prints `✔` or `✖` with its rounds and cost. A `✖` target keeps its old hash and stays stale for the next run; report it rather than retrying in a loop. Afterwards run `pnpm generate:check` again and quote its last line.

## 7. Summarize

- **Upstream:** the commit range taken, and the changes by kind (schema, component docs, templates, tools, generated code), with renames, removals and deprecations named.
- **Fixed in the fork:** each stranded naming key and extension error, and the fix chosen. Also list conflicts resolved, and any upstream-owned file the fork had edited, with the recommendation to move it.
- **Regenerated:** the targets run, their results and cost from the output, and anything still stale or skipped by choice.
- **Checks:** the last line of `pnpm check` and `pnpm generate:check`.

Don't commit unless asked. When they want to, the fork's commit is the merge plus the naming, extension and generated files it changed.

## Limits

- The skill reads diffs to preview; parse and the naming check are the only authorities on what a pull stranded.
- A naming key that still matches a name whose meaning changed passes every check.
- `generate:check` finds targets whose prompt changed. It cannot see generated files a merge edited without changing their prompt; step 3's count is the only check for that.
- SwiftUI generation needs `gh` and a macOS CI runner; without them, list its stale targets and leave them.
