Lock accessibility-bearing style bindings by their token, not only by their binding name, per site/src/content/docs/process/schema-hardening.md, section "602: lock by token". Read that section and "Rules every job follows" first.

In `validate` (tools/parse.ts) a binding is locked when its token appears in a contrast pair, or its *name* starts with `focusRing` or equals `minTarget` / `dismissTarget`. Because the rule reads names, the same token is locked in one doc and overridable in another. The baseline has 20 bindings on `color.border.focus` or `border.width.focus` that are overridable, including Combobox.fieldBorderFocus, Input.borderFocus, Select.triggerBorderFocus and DataGrid.cellFocusRingWidth (full list: `corpus.focusTokenBindingsUnlockedList` in logs/600-baseline.json). The schema's `locked` description also omits `dismissTarget`.

1. **Schema owns the rule.** In schema/component.ts export:
   - `LOCKED_TOKENS`: exactly `color.border.focus`, `color.inverse.focus`, `border.width.focus`, and the prefix `size.target.`. Before finalising, read tokens/themes/calm-precise/light.json and base.json and add any other focus-indicator or target-size token that exists; list what you added.
   - `LOCKED_BINDING_NAMES`: the existing name rule (`focusRing*`, `minTarget`, `dismissTarget`), kept so that nothing locked today becomes overridable.
   - `mustLock(bindingName, token, contrastTokens)`: true when any of the three rules hits. For contrast matching, a binding token equals a pair token either literally or after expanding `{slot}` interpolation over the component's enum values the way tools/check_contrast.ts `expand` does; reuse that function rather than writing a second one.
   Rewrite the `locked` `.describe()` to state all three rules.
2. **Parser.** `validate` computes `locked = authored || mustLock(...)`. When the raw frontmatter explicitly sets `locked: false` on a binding that `mustLock` requires, throw a `DocError` naming the binding, the token and the rule. `checkExtensionLocks` uses the same `mustLock`, so an extension can never add a binding that would be locked.
3. **Tests.** In tools/__tests__/parse-checks.test.ts (or parse.test.ts, whichever holds the lock tests): a focus-token binding under an arbitrary name locks; an explicit `locked: false` on it fails; a contrast pair written with `{variant}` locks a literal `color.action.primary.background` binding on a component whose `variant` enum includes `primary`; an extension adding a `color.border.focus` binding fails.
4. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

The prompts for the components whose overridable and locked lists change will go stale. That is expected.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node logs/600-baseline.mjs --out 602

In logs/600-measure-602.json: every step exit is 0 except `generateCheck`; `corpus.focusTokenBindingsUnlocked` is 0; `vsBaseline.lockedBindingsNoLongerLocked` is empty; `corpus.lockedBindings` is at least the baseline's plus the 20. List every binding that became locked, grouped by component, in your summary.

Do not modify `packages/*/src`, `prompts/templates/`, or any component doc. If a doc turns out to set `locked: false` on a must-lock binding, remove that line and say so.
