Fix Toolbar's infinite loop, reported by Tony 2026-09-15. Root cause found by source review (not yet confirmed by a live repro — this repo's test runner was unreachable from the session that diagnosed it; run `pnpm --filter @design-schema/react test -- Toolbar` first to confirm before and after).

`packages/react/src/Toolbar.tsx`'s roving-tabindex effect (the `useLayoutEffect` with no dependency array, around "Roving tabindex: one stop for the whole toolbar"):

```ts
useLayoutEffect(() => {
  const container = containerRef.current;
  if (!container) return undefined;
  const sync = () => {
    const controls = getControls(container);
    ...
    applyRovingTabIndex(controls, currentIndexRef.current);
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'aria-checked', 'tabindex'] });
  return () => observer.disconnect();
});
```

and `applyRovingTabIndex`:

```ts
function applyRovingTabIndex(controls: HTMLElement[], currentIndex: number) {
  controls.forEach((control, index) => {
    control.tabIndex = index === currentIndex ? 0 : -1;
  });
}
```

`applyRovingTabIndex` unconditionally writes `.tabIndex` on every control, every time `sync()` runs — including when the value is already correct. Setting `.tabIndex` always triggers a DOM mutation record (the browser does not skip a same-value `setAttribute`/IDL-setter write), and the `MutationObserver` created two lines above is watching exactly that attribute (`tabindex` is in `attributeFilter`) on the same subtree. So `sync()`'s own writes queue mutation records that fire the observer's callback, which is `sync` again, which writes the same values again, which queues more records — a self-sustaining microtask loop with no exit, which reads as a hung/frozen tab. This is very likely what Tony saw.

**Fix:** make `applyRovingTabIndex` a no-op when the value isn't actually changing, so it stops generating mutation records once the roving index has converged:

```ts
function applyRovingTabIndex(controls: HTMLElement[], currentIndex: number) {
  controls.forEach((control, index) => {
    const next = index === currentIndex ? 0 : -1;
    if (control.tabIndex !== next) control.tabIndex = next;
  });
}
```

**Audit for the same pattern elsewhere.** This "an imperative write inside a MutationObserver callback that observes the attribute it writes, with no before/after check" shape is easy to reintroduce anywhere a generated component does roving tabindex or similar DOM bookkeeping via `MutationObserver` — grep `packages/*/src` for `new MutationObserver` and check every callback against this same failure mode (Tree, TreeGrid, DataGrid, Menu, RadioGroup, SegmentedControl are the other roving-tabindex-shaped components per `component-roadmap.md`). Fix any that have it the same way.

**Fold back into the generator.** Since this is a shape the prompt/template can keep producing on every regeneration, not just a one-off typo: add the guarded-write rule to `prompts/conventions/web.md` (or wherever roving-tabindex guidance lives) so future generations of any component with this pattern come out correct the first time, per this repo's practice of folding a found gap back into the docs that produced it rather than only patching the output.
Gate: `pnpm --filter @design-schema/react test -- Toolbar` passes and does not hang; manually exercising a Toolbar with `overflow: menu` and resizing its container (the trigger for the roving-tabindex effect re-running) does not freeze the tab; the audit step reports its findings even if nothing else needed the fix. Do not regenerate Toolbar wholesale for this — it's a hand-patch to the one function, plus the template/convention update so the next real regeneration keeps it.
