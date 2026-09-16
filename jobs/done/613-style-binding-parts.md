Let a style binding say which part it styles, in which state, on which platforms, which token each enum value takes, and how a derived size is computed, per site/src/content/docs/process/schema-hardening.md, Phase 2 table row 613. Read "Rules every job follows" and "Measuring a job" first. Phase 1 (jobs 600 to 608) and jobs 609 to 612 have landed. Phase 2 has no per-job section in the plan, so this prompt is the whole spec.

`styleBinding` in schema/component.ts is `token`, `description` and `locked`. Everything else is carried by the binding's name or its prose, and the generators guessed:

- **State in names.** 15 bindings are named for a state, in three word orders: Button.backgroundHover, Card.hoverBackground, Table.rowHover. The rest are ActionSheet.itemHover, Checkbox.pressedOverlay, DataGrid.rowHover, DatePicker.dayHover, Disclosure.triggerBackgroundHover, Link.colorHover, Listbox.optionActiveBackground, Menu.itemHover, Splitter.separatorHover, Stepper.stepHover, Tabs.tabHoverBackground and Tree.rowHover. Where no binding existed, the generator invented a color. For inverse ghost hover, generated/gaps/Button.web.md "used color-mix(in srgb, var(--color-inverse-foreground) 16%, transparent) … the 16% figure is a guess with no token backing it", and another round in the same log chose 12%.
- **Parts in names.** In `triggerPaddingBlock`, `optionActiveBackground` and `groupLabelColor`, the part is a name prefix no tool can check against `anatomy`.
- **Values in names.** 14 bindings on 7 components are parallel keys for one enum value. DatePicker, Input and NumberInput each have `paddingBlockSm`, `paddingInlineSm` and `minTargetSm`. The others are Dialog.widthSm, Search.paddingBlockLg, SegmentedControl.paddingBlockSm, Select.triggerPaddingBlockSm and Select.minTargetSm.
- **Arithmetic in prose.**
  - Menu.minWidth is "space.20 × 2.5 … the generator multiplies".
  - SidePanel.widthNarrow and Tooltip.maxWidth say "Multiplied by 3".
  - RadioGroup.indicator is "controlSize minus 2 × space.1".
  - Switch.thumbSize "travels trackWidth − thumbSize − 2 × thumbInset".
  - Dialog's React Native build computes md width as `t.layoutMaxWidthContent * 0.75` from prose.
- **Platforms in prose.** Transition bindings are accepted but do nothing on native. generated/gaps/Card.rn.md: "transition (motion.duration.fast) has no runtime effect on native".

1. **Fields.** Add these to `styleBinding`, all optional:
   - `part`: the anatomy part the binding styles. Omitted means the root.
   - `state`: one of an exported `STYLE_STATES`, which is `BEHAVIOR_STATES` plus `hover`, `focus-visible`, `active` (the keyboard-active item in a composite, like Listbox's active option) and `dragging`. Omitted means the binding applies in every state.
   - `platforms`: the platforms the binding applies on. Omitted means all.
   - `by` and `values` (the per-value token). `by` names an enum or boolean prop. `values` maps some of its values (`'true'`/`'false'` for a boolean) to a `tokenRef` used instead of `token` for that value. `token` stays required and covers every value not listed. For example, `paddingBlock: { token: space.sm, by: size, values: { sm: space.xs } }` replaces `paddingBlock` plus `paddingBlockSm`.
   - `computed`: a strict object `{ times?, plus?, minus? }`, read as `token × times + Σ plus − Σ minus`.
     - Each operand is `{ token: <tokenRef>, times? }` or `{ binding: <styles key>, times? }`.
     - Every `times` is a positive finite number.
     - At least one of `times`, `plus` or `minus` is present.
2. **Checks** in `componentDef.check`. Each fires only when its field is present, with the issue path at the offending key:
   - `part` is an anatomy part
   - every `platforms` entry is a platform the component declares
   - `by` names an enum or boolean prop, and every `values` key is one of its values. `by` without `values`, and `values` without `by`, are rejected. A `token` that interpolates `{<by>}` alongside `values` is rejected, because a binding uses one or the other.
   - `values` tokens obey the existing `{slot}` rule, with its existing message
   - every `computed` binding operand names another existing binding, and no chain of bindings forms a cycle
   - a binding that must lock may not declare `computed` with `minus` or with a `times` below 1, because a derived value could shrink a focus indicator or target below its guarantee
3. **Locking.** `lockRule` and `mustLock` must consider every token a binding can resolve to: `token`, each `values` token and each `computed` token operand. Add an exported `bindingTokens(binding)` and use it in every caller: the auto-lock in tools/parse.ts `validate`, `checkExtensionLocks`, and the extension merge. Keep every lock message word for word. The token-existence check in `validate` (against built tokens) covers `values` and `computed` tokens too.
4. **Evaluation.** Export a pure `computeBinding(binding, resolveToken, resolveBinding)` that returns a number.
5. **Readers.**
   - tools/spec_sheet.ts `styleRows` adds one row per `values` token, with a binding cell like `` `paddingBlock` (size=sm) ``. It prefixes the description cell with the `part` and `state` when they are declared.
   - MCP `lookup_code` `tokenBindings` entries carry `part`, `state`, `platforms`, `by`, `values` (each with its platform token name, built the way `token` is) and `computed` when they are declared. mcp/index.ts `schemaSummary` does the same.
   - No doc uses these fields, so generated output must not change. Before editing, run `git diff --stat -- site/src/content/docs/foundations/spec-sheet.md` and record its output. It must print exactly that again after the final `pnpm check`.
6. **Tests.**
   - tools/__tests__/style-binding-fields.test.ts:
     - One accepting and one rejecting fixture per check in step 2, asserting the issue path and message.
     - Passing fixtures that mirror Input's `paddingBlock` and `paddingBlockSm` as one binding `by: size`, Button.backgroundHover as `{ token, part, state: hover }`, and Card.transition narrowed with `platforms`.
     - A binding whose only `values` entry is `color.border.focus` must lock, and an explicit `locked: false` on it fails with today's message.
     - A `computed` binding on a `size.target.*` token with `minus` is rejected.
     - `computeBinding`: Menu's `space.20 × 2.5` is 200 when `space.20` resolves to 80. RadioGroup's `controlSize − 2 × space.1` uses a binding operand. Switch's thumb travel uses three operands.
   - A `styleRows` case in tools/__tests__/spec_sheet.test.ts, and a `lookup_code` or `schemaSummary` case in mcp/__tests__/.
7. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON. schema/extension.ts reuses `styleBinding` through `shape.styles`, so extension bindings gain the fields and the same lock expansion.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    pnpm exec vitest run tools/__tests__/style-binding-fields.test.ts tools/__tests__/spec_sheet.test.ts
    git diff --stat -- site/src/content/docs/foundations/spec-sheet.md
    node logs/600-baseline.mjs --out 613

In logs/600-measure-613.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. That invariant matters most here, because this job changes what `mustLock` reads. The proof that the fields are real is style-binding-fields.test.ts: one binding with `by`/`values`, `state`, `part` and `computed` parses, locks through a `values` token and evaluates to a number.

Do not modify `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/`. No doc gains a field in this job, and no binding is renamed.
