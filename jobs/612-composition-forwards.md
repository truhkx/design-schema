Let a composition entry say which props it passes to the composed child and which of its own style bindings it forwards into the child's overrides. Also let an anatomy part declare its kind, including a first-class slot. This is per site/src/content/docs/process/schema-hardening.md, Phase 2 table row 612. Read "Rules every job follows" and "Measuring a job" first. Phase 1 (jobs 600 to 608), job 609 (the parser warnings channel), 610 and 611 have landed. Phase 2 has no per-job section in the plan, so this prompt is the whole spec.

**Composition.** `composition` in schema/component.ts is `part → component name`. What the parent passes to the child, and which of its bindings reach the child's `overrides`, is prose, and the prose names child bindings that cannot receive the value:
- DatePicker.monthTitleWeight: "Forwarded to the Selects as `overrides.fontWeight`". Select has no `fontWeight` binding.
- DatePicker.calendarSurface: "forwarded as its `overrides.surface`". Popover.surface is locked, so no override reaches it.
- generated/gaps/Accordion.web.md: the locked `minTarget` and `focusRing` "have no path through Disclosure's own `overrides` prop".
- generated/gaps/Dialog.rn.md and AlertDialog.rn.md: `footerGap` "can't reach Stack's internal gap", so the override is a no-op. A later AlertDialog round found that Stack does accept `overrides.gap`. Two generators disagreed about a contract the schema could have stated.
- Breadcrumb.fontSize forwards into a Text that `composition` never mentions.
- bottomsheet.md forwards `inset`, `radius`, `partGap` and `footerGap` to Dialog in prose only.

Thirteen style bindings describe a forward into a composed child. 33 of 51 components have a `composition` block.

**Slots.** Slots exist only implicitly. 33 props on 23 components are `type: content`. The Lit platform notes name slots in prose: card.md "named slots `header-actions` and `footer`, default slot for the body"; dialog.md "Slots: default (body), `footer`"; popover.md "Slots: `trigger` and default". 23 components' Lit notes mention slots. site/src/content/docs/process/extending-components.md lists `slots` as "planned". Nothing ties a content prop to its Lit slot name, a React prop, or a SwiftUI `@ViewBuilder` parameter.

1. **Composition entries.** A `composition` value is either today's string or a strict object `{ component, props?, forwards? }`. Both forms stay valid.
   - `component` is spelled as the string form is, including a `(planned)` suffix.
   - `props` maps a child prop to a literal (string, number or boolean) or to `{ from: <parent prop> }`, which passes the parent's prop through.
   - `forwards` maps a parent `styles` binding to the child binding that receives it through the child's `overrides`.
   - Export `compositionTarget(entry)` from schema/component.ts, returning `{ component, planned }`.
   - Every reader of `composition` uses it: `componentDef.check` (`composed`), tools/parse.ts `validate` and `composedRequires`, and mcp/index.ts `schemaSummary`, which would otherwise print `[object Object]`. Then grep tools/, mcp/, apps/website/src and site/src/components for `composition` and list any other reader you changed.
   - Keep `composition.<part> is not in anatomy …` and `composition.<part> names '<comp>', which has no doc (mark it '(planned)')` word for word.
2. **Composition checks.** Each fires only for the object form, with the issue path at the offending key. Read `composedRequires` for how the parser loads another doc, and follow it.
   - In `componentDef.check`, which needs only this doc:
     - every `forwards` key is a parent `styles` binding
     - every `{ from }` names a parent prop
   - In tools/parse.ts `validate`, which needs the child doc (skip a `(planned)` child):
     - every `props` key is a child prop
     - a literal fits the child prop's type and enum `values`
     - a `{ from }` prop has the child prop's type (for an enum, values within the child's)
     - every `forwards` target is a child `styles` binding
     - a forward into a binding the child locks is rejected, because `overrides` excludes locked bindings: `composition.<part>.forwards.<binding>: <Child>.<target> is locked, so no override reaches it`
3. **Prose-forward warning.** For each style binding whose description contains `overrides.<key>` and names a composed child, and where `<key>` is not the binding's own name, call `warn(file, message)` from tools/parse.ts (added by job 609) when the child has no such binding or locks it. This rule reads the child doc, so it belongs in the parser layer, not in `componentWarnings`. Against today's corpus expect exactly two warnings: DatePicker.monthTitleWeight (Select has no `fontWeight`) and DatePicker.calendarSurface (Popover.surface is locked). If you get a different set, report it rather than tuning the regex to match. Do not put this in a Zod `.check`.
4. **Anatomy part kinds.** `anatomy` stays an array of part names, so its readers (tools/behavior_tests.ts, tools/naming.ts, mcp/index.ts, site/src/components/SchemaTables.astro, apps/website AccessibilityContract) need no change. Add an optional `parts` record on `componentDef` of part name → strict object `{ kind, description?, slot? }`:
   - `kind` is one of:
     - `element`: a plain element the component renders
     - `component`: built from the system component its `composition` entry names
     - `slot`: a named insertion point the consumer fills, where the component renders no element of its own
   - `slot` is a strict object `{ default?, prop?, required?, platforms? }`:
     - `default: true` marks the unnamed slot: Lit's default `<slot>`, React and React Native `children`, SwiftUI's `content` `@ViewBuilder`.
     - `prop` names the `type: content` prop that fills it on prop-based platforms.
     - `platforms` gives a per-platform name: the Lit `<slot name>`, the React or React Native prop, the SwiftUI `@ViewBuilder` parameter label.
   - Export `partKind(component, part)`. It returns the declared kind; else `component` when `composition` has the part; else `element`.
   - Export `slotName(component, part, platform)`. It returns the declared platform name; else, for Lit, `''` for the default slot or the part name in kebab-case (`headerActions` → `header-actions`); else, for web and rn, `prop`, or `children` for the default slot, or the part name; else, for swiftui, `prop`, or `content` for the default slot, or the part name.
5. **Part checks** in `componentDef.check`. Each fires only when `parts` is present, with the issue path at the offending key:
   - every `parts` key is in `anatomy`
   - `kind: component` requires a `composition` entry for the part, and a part with a `composition` entry cannot declare another kind
   - `slot` requires `kind: slot`
   - `slot.prop` names a `type: content` prop. Without `prop`, on a component declaring web or rn, the resolved web/rn name must still be a `content` prop.
   - at most one slot is `default: true`, and the default slot has no Lit name
   - `slot.platforms` keys are platforms the component declares. Lit names match `^[a-z][a-z0-9-]*$`; the other platforms take identifiers. No two slots resolve to the same name on one platform.
   - in `behavior`, `when.click`, `when.focus`, `when.hover`, `then.focused` and `then.attribute.on` may not name a slot part (`scenario '<name>' when.click: '<part>' is a slot, which renders no element of its own`)
6. **MCP.** In mcp/index.ts `schemaSummary`, the anatomy line marks slot parts (`footer (slot)`), and the composition line names the component for object entries and lists `forwards`. `get_component` already returns the schema as parsed; confirm both fields reach its output.
7. **Tests.**
   - tools/__tests__/composition-forwards.test.ts:
     - One accepting and one rejecting fixture per schema check.
     - Temp-doc parser cases (use `write` and `usePaths` from tools/__tests__/fixtures.ts, as tools/__tests__/parse-checks.test.ts does) for every parser check, including a `(planned)` child that skips them.
     - A fixture mirroring DatePicker's `monthSelect` with `forwards: { monthTitleWeight: fontWeight }` against a Select-like child without it fails with its message.
     - `composedRequires` still finds target and keyboard requirements through an object entry.
     - The prose-forward warning, asserted with `takeWarnings()`.
     - `compositionTarget` over generated/components.json returns every current composition value unchanged.
   - tools/__tests__/anatomy-parts.test.ts:
     - One accepting and one rejecting fixture per check in step 5.
     - A Card-like fixture with content props `children`, `headerActions` and `footer` and slot parts for them. `slotName` resolves them on all four platforms to `''`/`header-actions`/`footer` on Lit, `children`/`headerActions`/`footer` on web and rn, and `content`/`headerActions`/`footer` on swiftui. Use the part names card.md actually has.
     - `partKind` defaults.
   - A `schemaSummary` case in mcp/__tests__/ for a slot part and an object composition entry.
8. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    pnpm exec vitest run tools/__tests__/composition-forwards.test.ts tools/__tests__/anatomy-parts.test.ts
    node logs/600-baseline.mjs --out 612

In logs/600-measure-612.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. The proof that the fields are real is the two test files: a parent doc with an object composition entry and slot parts parses against a real child doc, a forward into a missing or locked child binding fails with its message, and `slotName` resolves one slot four ways. In your summary, list the warnings in generated/parse-warnings.json that this job added.

Do not modify `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/`. That includes extending-components.md, whose "planned" line for slots stays until a doc migration. No doc gains a field in this job.
