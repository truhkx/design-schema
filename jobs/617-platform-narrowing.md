Let a doc narrow a requirement, an enum value, a copy entry or a style binding to some platforms, and type the Lit `reflect` list, per site/src/content/docs/process/schema-hardening.md, Phase 2 table row 617. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the whole spec. Jobs 600 to 616 have landed. Job 613 added `styleBinding.platforms` and job 616 added the object form of `copy`; reuse both, and never add a second spelling.

Today only whole props (`propDef.platforms`) and behavior items narrow. Everything else applies to every platform or is contradicted in `platforms.<p>.notes` prose:
- **Requirements.** generated/gaps/BottomSheet.web.md: "a11y.requires lists target-44px, but the close button is a composed Button … (no 'comfortable target' variant)". The MCP server's own guidance says the 44px target "is used on touch platforms". Dialog.rn.md: "scroll-lock has no native equivalent … intentionally not implemented on RN". Alert.rn.md: focus-onward on dismiss "is left as an acknowledged" limit.
- **Reflect lists.** `platformNotes.reflect` is `z.array(z.string())`, and 51 Lit blocks hold 204 entries in two spellings (43 kebab-case attribute names, the rest prop names). The Lit convention (prompts/conventions/lit.md, "Booleans that default to true") says such a prop is "exposed as the negated attribute (`no-dismiss`, `no-sticky-header`, `hide-value`); reflect the negated form". Nine entries reflect a default-true boolean under its positive name: Accordion `divided`, Breadcrumb `collapse`, Carousel `snap`, FocusScope `trapped` and `active`, Search `landmark`, SidePanel `dismissible` and `swipeable`, Tooltip `describes`. Others name no prop directly, and only a guessed mapping reaches one: BottomSheet, Dialog and Popover `no-dismiss`; DataGrid and TreeGrid `no-status-bar`; NumberInput `show-steppers`; Tree `hide-guides`; DatePicker `invalid`.

In generated/gaps/*.lit.md, 23 files discuss reflect lists:
- Breadcrumb.lit.md: "platforms.lit.reflect lists `collapse` un-negated even though its default is `true` … Followed the explicit" list.
- Accordion.lit.md did the same for `divided`.
- DataGrid.lit.md and Dialog.lit.md chose the other way.
- Input.lit.md and DatePicker.lit.md found `size` unreflected although it "drives interpolated bindings".

1. **Narrowing fields** in schema/component.ts, all optional with no `.default()`. Strings get a map, because a list entry or an enum value has no object to carry `platforms`; objects get a field, like `propDef.platforms`:
   - `a11yDef.requiresOn: z.partialRecord(<the requires enum>, z.array(platformId).min(1))`: the platforms a requirement applies on (absent = all). Extract the requires enum to an exported `A11Y_REQUIREMENTS` const so the key type and `requires` share it.
   - `propDef.valuesOn: z.record(z.string(), z.array(platformId).min(1))`: enum value → the platforms it is offered on.
   - `copyEntry.platforms: z.array(platformId).min(1)` on job 616's object form.
   - `styleBinding.platforms` from job 613, unchanged.
   Describe each.
2. **Typed reflect.** `platformNotes.reflect` becomes `z.array(z.union([z.string(), z.strictObject({ prop: z.string(), attribute: z.string().regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/) })]))`. Export `reflectEntry(c, entry)`, which resolves an entry to `{ prop, attribute } | null`:
   - an object entry as written
   - a string equal to a prop name or to its kebab-case, as that prop
   - otherwise `null`
   `notes` stays prose; `element`, `attributes` and `props` stay strings.
3. **Checks** in `componentDef.check`. These are errors, because only the new forms can trip them:
   - every `requiresOn` key is in `requires`
   - every `valuesOn` key is in the prop's `values`, and only on enum props
   - every narrowing list is a subset of the component's declared platforms, and of the prop's own `platforms` when it has them
   - a style binding narrowed away from a platform is never locked there by `mustLock`, which reads tokens and cannot see platforms, so leave locking alone and add a test proving `lockRule` results are unchanged
   - an object reflect entry names a prop; when that prop is a boolean with `default: true`, its `attribute` differs from the prop's kebab-case
   **Warnings, not errors** (the old forms stay valid):
   - a string reflect entry `reflectEntry` resolves to a boolean prop with `default: true`: "reflects '<entry>' un-negated, but '<prop>' defaults to true (prompts/conventions/lit.md: reflect the negated attribute)". This fires on the nine above.
   - a string reflect entry that resolves to nothing
   - a `styles.*.token` slot `{p}` on a component with a supported Lit block whose reflect list does not resolve `p`
   Add all three as rules in `componentWarnings(c)` in schema/component.ts, the warning channel job 609 added (earlier phase 2 jobs have already added rules there; add beside them). tools/parse.ts prints each as `⚠ <file>: <dotted path>: <message>` and it never changes the exit code. Do not add another warning mechanism.
4. **One narrowing helper.** Export a pure `narrowForPlatform(c, platform)` from schema/component.ts. It returns a copy without every requirement (`requiresOn`), enum value (`valuesOn`), copy entry and style binding narrowed away from `platform`, with the narrowing keys themselves left in place. It does not touch props that `propDef.platforms` narrows: they keep today's handling, so the 11 components that use that field today get the same prompts. Use it where a platform view is built:
   - the frontmatter YAML tools/parse.ts passes to `renderPrompt`
   - `behaviorFor`
   - mcp/server.ts `get_component` with a `platform`, which keeps the existing `availableOnPlatform` marking for props
   - tools/keyboard_tests.ts if it reads requires
   site/src/components/SchemaTables.astro prints `reflect:<attribute>` for an object entry.
5. **Tests.**
   - tools/__tests__/component-schema.test.ts: an accepted fixture using `requiresOn`, `valuesOn`, a narrowed copy entry, a narrowed binding and an object reflect entry; one rejected fixture per error above; one fixture per warning.
   - A corpus test: for every entry in generated/components.json and every declared platform, `narrowForPlatform(c, p)` deep-equals `c`. That proves no prompt changes from this job.
   - A corpus test that the un-negated-reflect warning names exactly the nine props above. If the docs changed since this prompt was written, assert what you find and list it.
   - mcp/__tests__/server.test.ts: `get_component` with a platform drops a narrowed requirement.
6. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/parse.ts
    pnpm --filter site build
    pnpm --filter website build
    node logs/600-baseline.mjs --out 617

The job-specific proof is the accepted fixture parsing all five forms, and the corpus test showing `narrowForPlatform` changes nothing today. `node --import tsx tools/parse.ts` exits 0 and prints the reflect warnings. Report the three warning counts in your summary.

In logs/600-measure-617.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `corpus.lockedBindings` equals job 616's. `behavior.skips` did not rise from job 616's.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/` (lit.md is the rule the warning cites, not something to relax), or any doc under `site/src/content/docs/`. Do not rewrite any reflect list: that is phase 3.
