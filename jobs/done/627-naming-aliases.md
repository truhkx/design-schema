**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Add an optional `aliases` block to the naming doc, so an adopter's *old* names keep working next to the new ones, marked deprecated. Read site/src/content/docs/process/schema-hardening.md, "Rules every job follows", and site/src/content/docs/process/customization-and-naming.md ("How the rename is applied", the job 523 section, "What a fork still owns" in themes/demo-brand/naming.md) first.

A rename today replaces a name one for one. schema/naming.ts's `.check` rejects two canonical names mapped onto one brand name, and `assertNoShadowing` in tools/naming.ts rejects a brand name that is already a component, which is exactly what makes `rename(dir, res, 'canonical')` an exact inverse. The cost is that an adopter moving onto the system loses every name its product code already uses: a brand that shipped `ActionButton` with `kind="cta"` gets `CtaButton` with `emphasis="primary"` and a codebase-wide migration on day one. Backwards compatibility with the adopter's existing API is the goal, and it cannot come from the model. A compatibility layer written by generation would be gated, hashed and regenerated like any component. So this job has the *tool* write it, at `--apply` time, into one folder the codemod owns and `--revert` removes.

Depends on 624 (`deprecated` and `since`), 626 (naming `values`) and 623 (naming `events` and `anatomy`). Confirm first that schema/component.ts has 624's `deprecated`/`since` definitions and schema/naming.ts has `values`. If either is missing, stop and say so.

1. **Schema.** In schema/naming.ts add `aliases`, optional and defaulting to `{}`, with three optional maps. Keys are always *canonical* names, so the stranded-key check covers them the way it covers `props`:
   - `components`: canonical component → a list of alias entries (`Button: [{ name: ActionButton, since: '2.0.0' }]`)
   - `props`: a `props`-style key (`variant` or `Button.variant`) → a list of entries
   - `values`: a `values`-style key (job 626) → canonical value → a list of entries

   An entry is a strict object: `name` (PascalCase for components, camelCase for props, 626's `enumValueName` for values), then 624's `since` and `deprecated` fields reused by import with 624's exact types, then an optional `platforms` (a non-empty list of `platformId`, where omitted means every platform). If 624 left those definitions unexported, export them from schema/component.ts; exporting does not change component.schema.json, and `tools/schema.ts --check` confirms that. An alias names the old spelling of the *current* name: the brand name when the doc renames it, the canonical name otherwise. In `.check`:
   - An alias equal to the current name it aliases is an issue.
   - Two entries with the same `name` in the same scope are an issue (all component aliases form one scope; prop aliases are scoped per component; value aliases per prop).

   Run `node --import tsx tools/schema.ts`.
2. **Resolution checks** in tools/naming.ts, through `assertKnownKeys` (stranded keys) or their own `NamingError` (collisions), each naming the entry:
   - a key that names no component, prop or value in generated/components.json
   - a component alias equal to any canonical or brand component name
   - a prop alias equal to any prop, event or anatomy name the component has (canonical or brand), or to one of `RESERVED_WEB`/`RESERVED_RN`
   - a value alias equal to any value of that prop (canonical or brand)

   `Resolution` gains `aliases`, and `isNoop` is false when any alias exists. A doc that only adds aliases still runs the step.
3. **What each platform gets.** This is the support matrix. An entry that applies to a platform where its kind is unsupported raises a `NamingError` when that platform is renamed. The error names the entry and platform and says how to fix it: `aliases.props.Button.variant[0] (kind): prop aliases are not supported on lit — the compatibility layer cannot add an attribute to a generated element without editing it. Add platforms: [web, rn] to the entry.`

   | Alias | web, rn | lit | swiftui |
   |---|---|---|---|
   | component | `/** @deprecated … */ export const ActionButton = CtaButton;` plus `export type ActionButtonProps = …` | `/** @deprecated */ export class <Prefix>ActionButton extends <Prefix>CtaButton {}` registered as `<prefix>-action-button` (guarded by `customElements.get`), with a dev-only warning on connect | `@available(*, deprecated, renamed: "CtaButton") public typealias ActionButton = CtaButton` |
   | prop | a wrapper component of the same name as the current one, accepting the alias, mapping it onto the current prop (an explicitly passed current prop wins), with a dev-only warning once per alias | unsupported | unsupported |
   | value | the same wrapper, mapping the old value onto the current value, with a dev-only warning | unsupported | unsupported |

   Tool-side problems are `NamingError`s, and dry-run listings use naming.ts's existing `main` output lines. Do not use job 609's `warn`/`takeWarnings`, and add no other warning mechanism. The dev-only warnings below are runtime code in the emitted files, not tool output.

   The dev-only check follows each package's own convention: grep packages/react/src for `isDev` (`typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'`) and packages/rn/src for its equivalent, and use exactly that. The message reads `<Current>: \`kind\` is deprecated since 2.0.0; use \`emphasis\`.`, and a string `deprecated` from 624 is appended when present. Every export carries a `@deprecated` JSDoc with `since`. Emitted TS must satisfy the packages' compiler options (strict, `exactOptionalPropertyTypes`, `isolatedDeclarations`, so explicit return types on exports). Web and RN import siblings extensionless (`'../CtaButton'`), Lit with `.js`.
4. **The folder the codemod owns.** Emission writes `naming-compat/` inside the platform's source dir: `packages/<pkg>/src/naming-compat/`, and `Sources/DesignSchema/naming-compat/` for SwiftUI. It contains one module per component that has aliases and an `index.ts` barrel (none for Swift). Every file's first line is `// Generated by tools/naming.ts from <naming doc> (aliases). Do not edit; --revert deletes this folder.` In `rename`:
   - Add `naming-compat` to `SKIP_DIRS`, so no rewrite ever reads it.
   - Add an optional `options: { compat?: boolean }` parameter, default `true`.
   - `'brand'` renames first, then writes the folder, replacing any previous copy whose files all carry the marker.
   - `'canonical'` deletes the folder first. A file in it without the marker is a `NamingError`; never delete a hand-written file.
   - A dry run lists the files it would write or delete.
   - `applied.edited` and `applied.renames` stay as they are. Add `compat?: string[]`, set only when non-empty, so existing `toEqual({ edited: [], renames: [] })` assertions hold.

   `generatedDirs`' pattern-demo folder (`packages/<pkg>/demo`) is renamed with `compat: false`, both by tools/generate.ts `renameTree` and by `main`. The compat layer belongs to the package source only. Do not edit any `index.ts` barrel or `package.json`: exposing `naming-compat` is the fork's own manifest edit, like the package scope. Say so in the docs.
5. **The worked example.** Extend themes/demo-brand/naming.md with one alias of each kind and a comment in the file's voice explaining the history, e.g. "Demo Brand shipped v2 calling it `ActionButton`, with a `kind` prop whose main value was `cta`":
   - `Button: [{ name: ActionButton, since: '2.0.0' }]`
   - `Button.variant: [{ name: kind, since: '2.0.0' }]`
   - `values.Button.variant.primary: [{ name: cta, since: '2.0.0' }]`

   Confirm none collides with a Button prop in generated/components.json. Then update tools/naming_demo.ts:
   - `build` renames `src` with compat and `behavior` with `compat: false`, and records the compat files on `Built`.
   - `roundTrip` also asserts `src/naming-compat` is gone after the revert and that each compat file comes back byte for byte after the re-apply.
   - `report` gains a "Compatibility layer" section in DIFF.md listing each alias, its file, and what it keeps working. It also says why these files are not in the file-by-file comparison: they have no canonical original. What checks them instead is the demo's `tsc -p demo-brand`, whose `include: ["src"]` reaches subfolders, and `lint-literals`, whose `sourceFiles` walk is recursive.
   - `summary` adds the aliases and compat files to renames.json.
   - `compare`, `explain`, `lexicon` and `protectedVocabulary` do not change.

   Run `pnpm demo:naming` to regenerate packages/react/demo-brand/. The "File by file" table in DIFF.md must be unchanged by this job; check with `git diff packages/react/demo-brand/DIFF.md`, where only the new section may appear. Do not hand-edit anything under packages/react/demo-brand/.
6. **Fixture.** Extend themes/nimbus/naming.md with `aliases` using all three maps, one entry with `platforms: [web, rn]`, and a prose paragraph.
7. **Tests** in tools/__tests__/:
   - one failing fixture per check in steps 1 and 2
   - one per unsupported cell in step 3
   - a marker-less file in `naming-compat/` refusing the revert
   - the emitted text per platform for a component, prop and value alias: JSDoc, dev guard, import spelling, Swift attribute
   - a doc without `aliases` writing no folder and producing byte-identical output
   - **Round trip.** Copy the committed packages/react/src/Button.tsx, Button.css and Button.stories.tsx into the sandbox with node:fs. Apply a doc with all three alias kinds and assert `naming-compat/` exists. Revert and assert the sandbox is byte-for-byte the canonical original, with no `naming-compat/`. Apply again and assert byte-for-byte equality with the first apply, compat included.
8. **Docs.** In site/src/content/docs/process/customization-and-naming.md add a section "Keeping old names working" covering the field, the support matrix, the owned folder and what `--revert` does to it, the 624 vocabulary it reuses, and what a fork still owns (exposing the folder). Also state the limit plainly: the wrappers' runtime mapping is proved by typecheck and text tests, not by a behavior run, because `pnpm demo:naming:gates` requires the same tests on both builds.

There is no shell copy in this environment. Do scratch work inside tests with node:fs, or under logs/ (gitignored). Before any edit, write logs/627-hash.mjs: it prints `<sha256>  <path>` for every file under packages/react/src, packages/lit/src, packages/rn/src and packages/swiftui/Sources, sorted. Run `node logs/627-hash.mjs > logs/627-src-before.txt`.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm demo:naming:check
    pnpm demo:naming:gates
    node --import tsx tools/naming.ts --naming nimbus --platform web,lit,rn --check
    node logs/627-hash.mjs > logs/627-src-after.txt
    git diff --no-index --exit-code logs/627-src-before.txt logs/627-src-after.txt
    node logs/600-baseline.mjs --out 627

Expected results:
- `pnpm demo:naming:gates` reports round-trip, typecheck, literals and behavior green, with the same behavior verdict count as before this job.
- The nimbus `--check` run exits 0, lists the compat files it would write for web and rn, and none for lit.
- The hash diff is empty, and Glob finds no `naming-compat` under `packages/*/src`: nothing in the committed canonical tree was written.
- In logs/600-measure-627.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Do not modify `packages/*/src`, `prompts/templates/`, any doc under site/src/content/docs/components/, `apps/website/`, or any `package.json`. packages/react/demo-brand/ changes only by running `pnpm demo:naming`.
