Make the keyboard gate count only real tab stops, per logs/backlog-triage.md, section D runner-up 7 (T6, which explains T57; with T7 and T8).

`FOCUSABLE` in the `HELPERS` string of tools/keyboard_tests.ts is `'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([data-focus-sentinel]), [role="menuitem"], [role="option"], [role="radio"]'`. Three defects: `button:not([disabled])` and `input:not([disabled])` match elements with `tabindex="-1"` (Tree's chevron buttons, so `End`/`ArrowUp`/`Home` "land" on a chevron), `input` matches hidden inputs (Slider's form inputs), and there is no `[role="treeitem"]`, so Tree's four arrow rules compare indices over one element. The same mismatch is why Toolbar's Lit gate is red on `Home`, `ArrowLeft`, `End` (T57): its overflow control is tabbable but outside the roving order. Separately, `focus-unchanged` passes vacuously when the root has no focusable descendants (−1 before, −1 after; T7), and the spec pins its subject with `.first()`, which re-resolves after a dismissal and promotes the next instance (Toast; T8).

1. **Selector.** Every native-focusable clause gains `:not([tabindex="-1"]):not([hidden])`; `input` also excludes `[type="hidden"]`; add `[role="treeitem"]`, `[role="tab"]`, `[role="gridcell"]`, `[role="row"]` alongside the existing composite roles, each with `:not([aria-disabled="true"])` only where the APG says disabled items are skipped (read the component's keyboard block; if unsure, keep them). Then filter the flat-tree list by rendered visibility (`checkVisibility()`), since `display:none` ancestors are not selector-visible.
2. **Vacuous unchanged.** `focus-unchanged` asserts the index is ≥ 0 before comparing; a root with no focusables fails with "nothing to hold focus".
3. **Stable subject.** Resolve the subject once per test into a handle (`elementHandle` or a `data-testid` stamped in `beforeEach`) instead of `.first()` on every step.
4. **Regenerate** `node --import tsx tools/keyboard_tests.ts` and run the keyboard gate on web and Lit. Tree's arrow rules and Toolbar's Lit `Home`/`ArrowLeft`/`End` are expected to go green; list every change in either direction.

Gate — all must pass:

    pnpm typecheck:tools
    pnpm test:tools
    pnpm gates:keyboard

Report keyboard-web and keyboard-lit pass/fail counts before and after, and confirm Tree and Toolbar by name.

Do not modify `packages/*/src`, `prompts/`, or any component doc. Do not change what any keyboard rule expects.
