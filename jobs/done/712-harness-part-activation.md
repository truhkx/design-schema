Make harness clicks land on the control a part wraps, and force clicks on disabled targets, per logs/backlog-triage.md, section D item 4 (T12 + T16). Jobs 710 and 711 have landed.

**T12.** A scenario's `when: { click: <part> }` resolves `[data-part=<part>]` and clicks *that element*. When the part is a wrapper around a composed control (a `Button` inside a `closeButton` span, a `Checkbox` inside a row cell), the click lands on the wrapper and `then.focused: <part>` compares the wrapper to `document.activeElement`. Web has been papered over: prompts/conventions/web.md now requires every part wrapper to forward a stray press (`if (!button.contains(event.target)) button.click()`) and ActionSheet, Popover, SidePanel, Carousel and Splitter implement it — real component code carrying a harness defect. React Native cannot be papered over: RNTL's `fireEvent.press` bubbles up, never down, so a wrapper View never reaches its Pressable. Measured: Search 2/12 scenarios red, Table 3/20 (web) and 4/19 (rn), Feed's show-new press red on web and rn.

**T16.** The Lit branch adds `{ force: true }` only when the scenario's own `given.disabled` disables the whole component (the `force` line in the click mapping). A disabled *option*, *tab* or *item* makes Playwright wait for actionability and the scenario times out instead of asserting. Affects Button, RadioGroup, Menu, Listbox, Tabs, SegmentedControl, Disclosure.

1. **Activate the control.** Add an `activatable(el)` helper per platform to `HELPERS`: the element itself if it is interactive (native button/a/input/select/textarea, or a role in the widget role set exported from schema/component.ts), else its first interactive descendant in flat-tree order, else the element. Clicks and `then.focused` comparisons go through it. On rn, resolve the part's testID node, then the first descendant with an `accessibilityRole` / `role` or an `onPress`, and press that.
2. **Force when anything clicked is disabled.** Emit `{ force: true }` on Lit (and the web user-event equivalent, `pointerEventsCheck: 0`) whenever the clicked target could be disabled: the scenario's `given` disables the component, **or** any `given` value is a list of items/options/tabs containing `disabled: true`, **or** the part is an item part. Over-forcing is harmless for enabled targets; under-forcing is a timeout.
3. **Regenerate** and run the behavior gate on all three platforms. List newly passing and newly failing scenarios.
4. **Retire the workaround.** Once every scenario that depended on wrapper forwarding passes without it, delete the wrapper-forwarding rule from prompts/conventions/web.md and say in the summary which components still carry the forwarding code (they lose it at their next regeneration, not by hand).

Gate — all must pass:

    pnpm typecheck:tools
    pnpm test:tools
    node --import tsx tools/behavior_tests.ts --check
    pnpm gates:behavior

No behavior scenario times out; every failure is an assertion failure with a message. Report per-platform pass counts before and after.

Do not modify `packages/*/src`, `prompts/templates/`, or any component doc. prompts/conventions/web.md may lose the forwarding rule and nothing else.
