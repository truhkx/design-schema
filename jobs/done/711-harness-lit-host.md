Make the Lit behavior harness look at the host element before descending into its shadow root, per logs/backlog-triage.md, section D item 3 (T14, with C39 and C40). Job 710 has landed.

prompts/conventions/lit.md requires `role`, `aria-label` and the other attributes the accessible-name tests observe to be plain attributes **on the host**. The harness never looks there: `thenRoleLines` (Lit branch) queries `s.el.shadowRoot!.querySelector('[role=…]')`, `thenTextLines` reads `s.el.shadowRoot!.textContent`, the derived `has-accessible-name` check roots at `el.shadowRoot ?? el`, and `partLocator`'s Lit branch resolves parts with `deep(root, …)` where `root` is the shadow root. So Card, Divider, Landmark, Toolbar, ProgressBar, Feed, Carousel, Tooltip and ActionSheet carry scenarios that cannot pass however they are written, and components have started working around it (Carousel puts `data-part="region"` on its host; ProgressBar argues an exemption).

1. **Role.** The Lit `then.role` probe passes when the host itself has the role, else searches the shadow root, else light DOM children (slotted content: Tooltip's `role="tooltip"` lives there).
2. **Text / copy.** The Lit `then.text` / `then.copy` probe reads the rendered text of the host's flat tree: shadow text plus assigned slot content plus, for composed `ds-*` children, their own shadow text (ds-button renders its `label` property in its shadow root, so ActionSheet's cancel row never reaches the composer's `shadowRoot.textContent`). Add a `flatText(el)` helper to `HELPERS` beside the flat-tree focus walker `keyboard_tests.ts` already uses, and use it.
3. **Accessible name.** `has-accessible-name` on Lit computes the name on the host first (`aria-label`, `aria-labelledby` resolved in the host's root node), then falls back to the element the part locator finds.
4. **Parts.** In `partLocator`'s Lit branch, the host matches a part when it carries `part` / `data-part` for that name, before `deep(root, …)` is consulted.
5. **Regenerate** generated/behavior/ and run the Lit behavior gate. Newly passing scenarios are the point; list them. Newly failing ones are findings about the components; list them, do not patch packages.
6. **Tests.** One fixture per probe: role on the host passes; text in a slotted child passes; text in a composed ds-button's shadow root passes.

Gate — all must pass:

    pnpm typecheck:tools
    pnpm test:tools
    node --import tsx tools/behavior_tests.ts --check
    pnpm gates:behavior

Report the Lit behavior pass count before and after, and name every component whose Lit scenarios went from red to green.

Do not modify `packages/*/src`, `prompts/`, or any component doc. Do not remove Carousel's host `data-part`; whether to keep it is job 716's question.
