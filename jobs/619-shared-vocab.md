Add a shared value vocabulary for enum props and an `integer` prop type, per site/src/content/docs/process/schema-hardening.md, Phase 2 table, row 619. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the whole spec. Phase 1 (600–608) and jobs 610–618 have landed; read the current files.

Every enum prop spells out its own `values`. The 51 docs hold 103 enum props with 75 distinct value lists, and lists that should be one vocabulary are not.

**Five size lists:**
- `sm|md`: DatePicker, Input, NumberInput, SegmentedControl, Select, Toolbar
- `sm|md|lg`: Button, Dialog
- `xs|sm|md|lg|xl`: Icon, Text
- `md|lg`: Search
- `4xl|3xl|2xl|xl|lg|md`: Heading

Nine of these props interpolate `font.size.{size}` or `space.{size}`, whose steps come from `SIZE_NAMES` in tools/theme.ts.

**Six tone lists:**
- `info|success|warning|danger`: Alert, Meter
- `danger|warning|info`: AlertDialog
- `neutral|success|danger`: ProgressBar
- `neutral|success|warning|danger`: Toast
- `default|strong|muted|danger|onAction`: Text, which interpolates `color.foreground.{tone}`
- `default|inherit`: Link

Nothing says Search's `md` is Button's `md`, or that a composed child accepts its parent's size. The generators hit this:
- BottomSheet: "the close button is a composed Button, whose schema only exposes size sm/md/lg (no 'comfortable target' variant)"
- DataGrid and DatePicker: editors and selects rendered with no `size` prop

`type: number` is just as loose. There are 25 number props. Some are whole numbers, but nothing says so: Carousel.perView and activeIndex, DataGrid.rowCount, Feed.newItemsCount, NumberInput.precision. Job 605's default check would accept `perView: 1.5`.

1. **Vocabulary.** Create schema/vocab.ts, importing only `zod`, because schema/ publishes on its own. Export:
   - `VOCAB`: a frozen record of name → ordered values, with exactly three entries:
     - `size`: `xs, sm, md, lg, xl, 2xl, 3xl, 4xl`
     - `tone`: `neutral, info, success, warning, danger`
     - `foregroundTone`: `default, strong, muted, danger, onAction`
   - `vocabName`: a `z.enum` of those keys, with `.meta({ id: 'vocabName' })`.
   - `enumValues(prop)`: `prop.values` when present, else `VOCAB[prop.enumRef]`, else `[]`. Job 620 imports this by name.
   Before finalising, compare the lists with tools/theme.ts (`SIZE_NAMES`, and the tone loops in `statusColors` and `inverseColors`) and with the `color.foreground.*` names in tokens/themes/calm-precise/light.json. Report any difference; do not bend a list to fit one doc. Link's `default|inherit` stays local. If tools/publish_schema.ts or its test lists the files the schema package ships, add vocab.ts there.
2. **`propDef.enumRef`.** Add `enumRef: vocabName.optional()` with a `.describe()`: an enum prop takes its values from the named vocabulary, and `values`, when present, narrows it to a subset. Existing rules keep their messages:
   - The `"an enum prop needs 'values'"` refine now passes when `enumRef` is set. Keep the message word for word for the case where neither field is set.
   - The default check reads `enumValues(p)`.
   New issues, which no current doc can trigger:
   - `enumRef` on a prop whose type is not `enum`
   - a `values` entry that is not in the named vocabulary, quoting the value and the vocabulary with `pyRepr` as the default check does

   **Warning, for phase 3 to flip.** Add one rule to job 609's `componentWarnings` in schema/component.ts, not to `.check`. tools/parse.ts already forwards its results through `warn`; do not add another warning channel. The rule fires on an enum prop with no `enumRef` whose `values` all belong to one vocabulary:
   - path: `['props', <name>, 'values']`
   - message: `values are a subset of VOCAB.<vocab>; set enumRef: <vocab>`
   Today it fires 19 times:
   - `size`: Button, Card.inset, DatePicker, Dialog, Heading, Icon, Input, NumberInput, Search, SegmentedControl, Select, Text, Toolbar
   - `tone`: Alert, AlertDialog, Meter, ProgressBar, Toast
   - `foregroundTone`: Text.tone
   Card.inset binds `layout.inset.*`, not the size scale. Flag it in your summary rather than special-casing it.
3. **Resolve once.** Everything downstream reads `values`: `componentDef.check` (the scenario `given` and `when.set` check), `expand` in schema/lib.ts, `validate`, `deriveBehavior` and `validateStructure` in tools/parse.ts, and every generator, template and reader of generated/components.json. So:
   - inside the schema, read enum values through `enumValues`
   - in tools/parse.ts, right after schema validation, set `values` from the vocabulary on any enum prop that has `enumRef` and no `values`
   generated/components.json then always carries `values`, and no downstream reader has to change. Grep schema/ and tools/parse.ts for `.values` to find every read.
4. **`type: integer`.** Add `integer` to `propDef.type`.
   - The default check requires `Number.isInteger`, with the message `an integer prop's default must be an integer, got <repr>`.
   - The scenario `given` and `when.set` check in `componentDef.check` applies the same rule.
   - Every tool that branches on a prop's `type` treats `integer` exactly like `number` for emitted TypeScript, Swift and story args. Grep tools/, mcp/ and apps/website/src for `'number'`. That includes at least `scalarType` and `swiftPropValue` in tools/behavior_tests.ts, tools/generate.ts, tools/spec_sheet.ts, mcp/server.ts, and apps/website/src/component-page.ts and example-sweep.ts.
   - Do not edit prompts/templates/. The templates learn the new word in job 625, and no doc uses it before phase 3.
5. **Tests.**
   - tools/__tests__/component-schema.test.ts, one failing fixture per new issue, asserting path and message:
     - `enumRef` on a string prop
     - a value outside the vocabulary
     - a non-integer default on an integer prop
     - a non-integer `given` value for an integer prop
     Add passing fixtures for `enumRef: size` with and without `values`. Add `componentWarnings` fixtures: `size: { type: enum, values: [sm, md] }` warns with the exact path and message; the same prop with `enumRef: size` does not; `values: [sm, huge]` does not.
   - tools/__tests__/parse-checks.test.ts:
     - A doc with `size: { type: enum, enumRef: size }` and a `font.size.{size}` binding parses, derives one render scenario per vocabulary value, and its generated entry carries the eight `values`.
     - `VOCAB.size` equals tools/theme.ts `SIZE_NAMES`.
     - Every `VOCAB.foregroundTone` value is a `color.foreground.*` token in the built light JSON.
   - A behavior_tests or generate test showing that an `integer` prop emits exactly what a `number` prop does.
6. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm --filter website build
    node logs/600-baseline.mjs --out 619

Proof:
- In logs/600-measure-619.json, `corpus.componentsJsonSha256` equals the value in logs/600-measure-618.json, or in the highest-numbered measure present. No doc changed, and resolution adds nothing to a doc without `enumRef`.
- `corpus.derivedScenarios` and `behavior.skips` are unchanged.
- generated/parse-warnings.json (job 609) holds exactly 19 entries whose message starts with `values are a subset of VOCAB.`.
- Every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

In your summary, give the phase 3 worklist: every enum prop whose `values` are already a subset of a vocabulary, and every number prop you would type `integer`.

Do not modify `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/`.
