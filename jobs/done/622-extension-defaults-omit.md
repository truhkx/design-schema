**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Let an extension doc change a default, remove an upstream item, and declare its own contrast pairs, platforms and anatomy parts, so an adopter can align a component to their existing API without editing a canonical doc. This is site/src/content/docs/process/schema-hardening.md, Phase 2 table, row 622. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the spec. Jobs 600 to 621 have landed: read the files as they are now, not as described here.

Today an extension can only add. schema/extension.ts `extensionDef` accepts `props`, `events`, `styles`, `copy`, `keyboard`, `behavior` and `modules`, and nothing else. tools/parse.ts `mergeExtensions` is add-only over `EXT_SECTIONS`: any key upstream declares fails with `collides with Button's own schema`. So an adopter whose Button defaults to `secondary`, or who has no `overflowLabel`, has one route: edit site/src/content/docs/components/button.md. site/src/content/docs/guides/updating-your-fork.md forbids that ("never edit a canonical doc in place"), because every later pull then conflicts. Three more gaps:
- site/src/content/docs/process/extending-components.md says an extension "cannot add a contrast pair that would fail", which implies it can add a passing one. But `extensionDef` has no `a11y`, and `checkExtensionLocks` would reject any binding such a pair locks.
- `moduleDef.platforms` narrows a module, but nothing narrows the extension as a whole.
- An extension cannot add an anatomy part, so its scenarios can only target upstream parts (Button.analytics.md clicks `container`).

1. **Schema.** In schema/extension.ts add these fields to `extensionDef`. All are optional, and each gets a one-sentence `.describe()` in the file's existing style:
   - `platforms`: `z.array(platformId).min(1)`. The platforms the extension targets. Omitted means every platform the component supports.
   - `anatomy`: `z.array(z.string()).min(1)`. Parts appended to the component's `anatomy`.
   - `a11y`: `z.strictObject({ contrast: z.array(contrastPair).min(1) })`. Pairs appended to `a11y.contrast`. Only `contrast` is allowed, because `role` and `requires` are claims about the upstream component.
   - `defaults`: a record from an upstream prop name to a new default. Reuse the literal union `propDef.default` uses (export it from schema/component.ts rather than copying it).
   - `omit`: `z.strictObject({ props, events, styles, copy, behavior }).partial()`. Each key is a non-empty array of names to remove from the merged component (behavior entries are scenario names).
   An extension using none of these parses exactly as before. site/src/content/docs/extensions/Button.analytics.md must stay valid, unchanged.
2. **Merge.** In tools/parse.ts `mergeExtensions`, apply each extension in file order: first the add-only sections (as today), then `anatomy`, `a11y.contrast`, the `platforms` narrowing, `defaults`, and finally `omit`. After that, `validate`, `checkExtensionLocks` and `stampSources` run as they do now. Every error below is a `DocError` whose text starts with the extension's file (`extensions/<Component>.<name>.md: …`), like the existing collision errors.
   - `anatomy`: a part the component or an earlier extension already has fails with `anatomy.<part> collides with <owner>`, using the same owner map as the sections.
   - `a11y.contrast`: a pair whose foreground and background both match an existing pair fails with `a11y.contrast pair <foreground> on <background> collides with <owner>`. tools/check_contrast.ts reads generated/components.json, so it will check a merged pair like any other. Confirm that, and do not add a second contrast check.
   - `platforms`: if the component does not declare one of the listed platforms, or marks it `supported: false`, fail with `platforms includes '<p>', which <Component> does not support`. Otherwise narrow only what this extension adds:
     - Added props and behavior scenarios get `platforms` (the intersection, if they already had one).
     - Modules with no `platforms` of their own inherit the extension's. Apply this in `extensionSummary`, before its fallback to every supported platform.
     - Added style bindings and keyboard rules are narrowed only if jobs 613 and 614 gave `styleBinding` and `keyboardRule` a `platforms` field (grep schema/component.ts). If a field is missing, say so in your summary.
     - Events are not narrowed unless `eventDef` has gained a narrowing field. Without one, an extension event must still map every platform the component supports, under the existing `events.<name> has no mapping for platform` message.
   - `defaults` applies to upstream props only. It fails with:
     - `defaults.<prop> names no prop upstream on <Component>` for an unknown prop, or one another extension added.
     - `defaults.<prop> collides with <other file>` when a second extension sets the same prop.
     - `defaults.<prop> is <Component>'s a11y.roleFrom — its default decides the rendered role` for the `a11y.roleFrom` prop.
     - `defaults.<prop> is required, so a default never applies` for a `required: true` prop.
     Then re-validate the merged prop with `propDef.safeParse`. Report any issue as `defaults.<prop>: <propDef's message>`, keeping propDef's own text (for example `default 'huge' is not one of ['sm', 'md', 'lg']`), so the error names the extension file rather than button.md.
   - `omit` applies to upstream items only.
     - A name upstream does not declare fails with `omit.<section>.<name> names nothing upstream on <Component>`. That is the stranded-key case after a pull removes the item, and it is an error, like a stranded naming key.
     - A name another extension added fails with `omit.<section>.<name> was added by <file>; remove it there`.
     - A prop that is `required`, has an `a11yRole`, is `a11y.roleFrom`, or is the prop `accessibleNameProp` returns fails with `omit.props.<name> carries an accessibility guarantee (<which of those>)`.
     - A binding `lockRule` locks fails with `omit.styles.<name> binds '<token>', which is locked (<rule>) — an extension may not remove an accessibility guarantee`.
     - `omit.behavior` removes authored upstream scenarios only. Derived scenarios are rebuilt from the merged schema.
     Anything else an omission breaks is reported by the schema check that already covers it, with its message unchanged: a scenario that still names the prop, `error-identification` with `error` omitted, or a `{slot}` naming an omitted enum. When the component has any extension using `defaults` or `omit`, append one line after such a message: `  (merged with extensions/<a>.md, extensions/<b>.md)`.
3. **Locks.** `checkExtensionLocks` keeps its message word for word, with one exception. If a binding the extension adds locks only because of a pair this same extension adds, accept it: `lockRule` returns null when that extension's own pairs are left out. `validate` already stamps such a binding `locked: true`. If an extension pair names the token of an upstream binding, that binding becomes locked, which is allowed: things may become more locked, never less. `omit` refuses locked bindings, so nothing locked today can be unlocked.
4. **What the generator sees.** Extend `extensionSummary` with `anatomy`, `contrast` (a count), `platforms`, `defaults` as `{ <prop>: { from, to } }` (`from` is the upstream default, or null), and `omits` as `{ <section>: [names] }`. Emit each key only when the extension uses that field, so Button's entry in generated/components.json gains no keys. In `extensionsProse`, for each extension that uses them, add `Defaults changed from upstream: \`<prop>\` <from> → <to>.` and `Removed from upstream: <section> \`<name>\`, ….` The component's guidance prose still describes upstream, so without these lines the model would put the items back. An extension using none of the new fields must produce byte-identical prose. Do not edit `prompts/templates/`.
5. **Docs.** In site/src/content/docs/process/extending-components.md, rewrite "Rules the parser enforces" for the new fields and the refusals above, in the page's voice. Replace "It cannot remove or change anything upstream declares". Add one sentence: a naming key (tools/naming.ts `unknownKeys`) that points at an omitted item is reported as stranded, because the resolver reads the merged schema.
6. **Tests.** Work in tools/__tests__/extensions.test.ts, in its `Widget` sandbox. Never add an extension doc under site/src/content/docs/extensions/. Write one passing case per new field and one failing fixture per error in steps 2 and 3, each asserting the message. Include at least:
   - an enum default outside `values`
   - omitting a required prop, a locked binding, and a stranded name
   - an omit that leaves a scenario naming the prop (the existing message plus the merged-with line)
   - `platforms` narrowing an added prop and scenario
   - a pair that locks the extension's own binding (accepted, `locked: true` in components.json) beside an extension binding on an upstream pair's token (today's message)
   - an extension using no new field, whose summary and prose are unchanged
7. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use npx or PowerShell, and do not stage or commit.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/check_modules.ts --platform web --no-typecheck
    node logs/600-baseline.mjs --out 622

In logs/600-measure-622.json, every step exits 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. The `corpus` block must equal the one in the latest earlier logs/600-measure-*.json: no doc uses the new fields, so nothing the corpus counts can move. `git status` must show no change under site/src/content/docs/components/, site/src/content/docs/extensions/, themes/ or packages/.

Do not modify `packages/*/src`, `prompts/templates/`, any component or extension doc, `themes/`, schema/naming.ts or tools/naming.ts.
