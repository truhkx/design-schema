**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Give components, props, events and enum values a lifecycle (`since`, `deprecated`), and give components authored `examples` and named `constants`. This is site/src/content/docs/process/schema-hardening.md, Phase 2 table, row 624. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the spec. Jobs 609 to 623 have landed, including 609's parser warning channel: read the files as they are now. The composition graph and support matrix that the plan once listed in this row are job 629; do not build them here.

Evidence, one paragraph per field:

- **Lifecycle.** `componentDef.status` accepts `deprecated`, and that is the only lifecycle signal. No component doc uses it, and nothing below the component can be deprecated or dated. An adopter aligning an existing API has to keep an old prop, event or value working while steering callers off it; jobs 626 to 628 (naming `values`, `aliases`, `tokens`) build on that. A fork pulling upstream (site/src/content/docs/guides/updating-your-fork.md) has only the commit log to tell it what arrived since its last pull. The packages share one version, 0.0.1 (site/src/content/docs/process/publishing.md: "Versions move together").
- **Literal timings.** The numbers live in description prose:
  - tooltip.md `delay`: "`motion.duration.base` × 3 (roughly 600ms)"
  - toast.md `duration`: "motion.duration.loop × 6 / × 12"
  - bottomsheet.md: "past 25% of the sheet height, or faster than 1.5 px/ms"
  - combobox.md: a status debounce of `motion.duration.base × 2`
  The generators read these differently. generated/gaps/Combobox.lit.md used "a literal 500ms constant (STATUS_DEBOUNCE_MS)". Carousel.web.md and Carousel.lit.md read "Below 5000 is refused in development" two different ways, and Carousel.rn.md reworded a warning because the literals gate flagged '5000ms'. Job 613's `computed` covers style bindings. These are values a component's logic reads, not styles.
- **Examples.** tools/docs_examples.ts says "Nothing here authors an example": the site's example set is whatever stories the generator happened to write.

1. **Lifecycle.** In schema/component.ts, export `sinceVersion` (`z.string().regex(/^\d+\.\d+\.\d+$/, 'Expected a package version like 0.2.0')`) and `deprecation`: a `z.strictObject` of `reason: z.string()`, `since: sinceVersion.optional()` and `use: z.string().optional()` (the replacement), with `.meta({ id: 'deprecation' })`. Jobs 625 and 627 import these rather than redefining them.
   - Add optional `since` and `deprecated` to `componentDef`, `propDef` and `eventDef`.
   - For enum values, add `propDef.valueLifecycle`: `z.record(z.string(), z.strictObject({ since, deprecated }).partial())`. It is a sibling of `values`, because every reader treats `values` as `string[]`.
   These are new fields, so their rules are errors, pushed from the existing `.check`s:
   - `valueLifecycle` on a non-enum prop: `valueLifecycle is only for enum props`.
   - A `valueLifecycle` key that is not one of the prop's values: `valueLifecycle.<v> is not one of [...]`. If job 619's `enumRef` supplies the values, resolve them through its helper.
   - A prop's or event's `deprecated.use` must name another prop or event on the component. A value's `use` must name another value of that prop. A component's `use` names another component; that check needs other docs, so it goes in tools/parse.ts `validate`, beside the composition-target check.
   - A component `deprecated` block while `status` is not `deprecated`: `has a deprecated block but status is '<status>'`.
   These are warnings, through job 609's two layers. Never add another channel, and never raise a warning from a Zod `.check`.
   - Rules that read only the component go in `componentWarnings(c)` in schema/component.ts, which tools/parse.ts already forwards through `warn`:
     - a prop `default` that is a deprecated value
     - a deprecated `required` prop
     - `status: deprecated` with no `deprecated` block
     - a `use` that names something itself deprecated
     - an authored scenario whose `given` sets a deprecated prop or value
   - The one rule that reads other docs, a `composition` naming a deprecated component, calls `warn(file, message)` in tools/parse.ts.
   With today's docs, `takeWarnings()` must contain none of these. Confirm that.
2. **`constants`.** Add an optional `componentDef.constants`: a record from a camelCase name to a `z.strictObject` of `description`, `token: tokenRef` (optional), `multiply: z.number().positive()` (optional), `value: z.number()` (optional) and `unit: z.enum(['ms', 'px', 'px/ms', 'ratio', 'count'])`.
   - `.check` rules: `a constant needs exactly one of 'token' and 'value'`; `multiply` only with `token`; a constant named the same as a `styles` binding fails with `constants.<name> collides with styles.<name>`.
   - In tools/parse.ts `validate`, beside the styles token check (or through job 620's manifest, if it replaced `hooks.tokenNames`), a token constant must name a real token: `<Component>: constants.<name> '<token>' is not a token`.
   - Do not migrate docs (phase 3 does that), and do not change tools/lint_literals.ts.
3. **`examples`.** Add an optional `componentDef.examples`: a non-empty array of `z.strictObject({ name, description, given, platforms })`. `name` uses the behavior kebab regex, `given` is a record, and `platforms` is optional.
   - Move the `given` prop and value check that behavior scenarios use into a helper, and call it from both places. The behavior messages stay word for word. Example messages read the same way with `example '<name>'` in place of `scenario '<name>'`.
   - Duplicate example names are an error, and so are `platforms` the component does not declare.
   - An example that sets a deprecated prop or value gets a warning from `componentWarnings`.
   - Do not change tools/docs_examples.ts.
4. **MCP.** mcp/server.ts `get_component` returns `since`, `deprecated`, `examples` and `constants` with no code change, because it serves the schema as parsed. Add one test in mcp/__tests__/ that proves it with a fixture component carrying all four.
5. **Tests.**
   - tools/__tests__/component-schema.test.ts: one passing and one failing fixture per new error, asserting the path and message.
   - The per-component warnings: assert exact `{ path, message }` values from `componentWarnings` in the same file.
   - The composition warning: assert it with `takeWarnings()` in a parse sandbox (tools/__tests__/parse.test.ts).
6. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use npx or PowerShell, and do not stage or commit.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node logs/600-baseline.mjs --out 624

In logs/600-measure-624.json, every step exits 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. The `corpus` block must equal the latest earlier logs/600-measure-*.json, because no doc uses the new fields. generated/parse-warnings.json must gain no entry from this job's rules. `git status` must show no change under site/src/content/docs/components/ or packages/.

Do not modify `packages/*/src`, `prompts/templates/`, any component or extension doc, `themes/`, tools/docs_examples.ts, tools/lint_literals.ts, or the MCP tool list (job 629 adds tools).
