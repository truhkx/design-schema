Render every keyboard rule into the generation prompt's Declared-contracts section, per logs/backlog-triage.md, section D item 5 (T11).

`keyboardContract` in tools/parse.ts builds the prompt's "Declared contracts → Keyboard" block, but `RULE_CONTRACT_FIELDS` / `ruleUsesContract` skip every rule that carries no `given`, `target`, `repeat`, `platforms`, `native` or array `expect`, and the whole block is omitted when no rule uses one. Plain rules — `ArrowLeft → focus-prev`, `Home → focus-first` — never appear. Meanwhile prompts/templates/web.md tells the generator to "implement the listed rules as written and none the section excludes", and says the section wins over prose. SegmentedControl was shown 2 of its 5 rules, Tabs only its vertical arrows, Carousel and Table only the native Enter/Space rule. All four happened to implement the full block anyway; a generation that trusts the prompt ships a component missing Home/End/arrow handling, and the keyboard gate is derived from the same block, so it would not catch a rule it was never shown.

1. **Render all.** `keyboardContract` emits one line per rule in the component's `keyboard` block, in doc order: keys, then `expect`, then the contract fields when present. `ruleUsesContract` survives only to decide whether to append the contract detail to a line, never whether to emit it.
2. **Template wording.** Leave prompts/templates/*.md alone unless the rendered section's heading claims something now false; if it does, list the line for job 715 rather than editing it here.
3. **Hashes.** Every prompt whose component has a keyboard block goes stale. That is expected; say how many.
4. **Tests.** tools/__tests__/parse.test.ts: a doc with only plain rules renders a non-empty keyboard section listing every rule; a mixed doc renders all rules with contract detail on the ones that have it.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    node --import tsx tools/schema.ts --check

For SegmentedControl, Tabs, Carousel and Table, the rendered prompt's keyboard section lists exactly as many rules as the doc's `keyboard` block (paste the counts).

Do not modify `packages/*/src`, `prompts/templates/`, or any component doc.
