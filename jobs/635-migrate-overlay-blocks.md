**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Give every layered component an `overlay` block, and turn job 615's overlay warning into an error, per site/src/content/docs/process/schema-hardening.md, Phase 3. Read "Rules every job follows", "Measuring a job", Phase 2 and Phase 3 first, then jobs/done/615-form-overlay-blocks.md, which added `overlayDef`, its checks and the derived Escape scenario. This is one field per job: the only doc change you may make is adding an `overlay:` block. No prop, event, requirement, keyboard rule or platform note changes.

**The evidence** is generated/parse-warnings.json, 194 warnings today, of which **8** are this job's — one per doc, `category: is 'overlay' but there is no overlay block, so layer, anchor, collision and dismissal live only in prose` — on actionsheet.md, alertdialog.md, bottomsheet.md, dialog.md, menu.md, popover.md, sidepanel.md and tooltip.md. Those are every `category: overlay` doc. Group the file yourself; if the count has moved, assert what you find and list it.

**Where a popup goes on overflow is a prop description**, and the four differ: menu.md `placement` *"flips automatically when it would overflow the viewport"* and packages/react/src/Menu.tsx flips either axis; popover.md *"flips and shifts to stay in the viewport"*; select.md is *"positioned below (flipping above)"*, vertical only; tooltip.md *"flips when it would overflow the viewport (on native, measured with measureInWindow like Popover)"*, while generated/gaps/Tooltip.rn.md reports the flip *"is not implemented … placement is static"*. Select, Combobox and DatePicker are `category: input` and are **not** in this job; their popups wait for a later round.

**`dismiss` and `modal` must match the doc's own `a11y.requires`**, because the checks read it: `dismiss` containing `escape` requires `escape-dismiss`, and `modal: true` requires all four of `MODAL_REQUIRES` (`focus-trap`, `focus-restore`, `escape-dismiss`, `inert-background`). All eight docs list `escape-dismiss` today. Never add a requirement to make a block fit — choose the block value that matches what `a11y.requires` already says.

1. **The worklist.** Add `overlay:` to these 8 docs and to no others. Every value is grounded in the doc's anatomy, props, events, `a11y.requires` and prose; verify each against the doc as you go rather than copying blind.

   | Doc | layer | anchor | placement | collision | open | closeEvent | dismiss | modal |
   |---|---|---|---|---|---|---|---|---|
   | actionsheet.md | `sheet` | — | — | — | `open` | `onClose` | `[escape, scrim, close-button, swipe]` | `true` |
   | alertdialog.md | `modal` | — | — | — | `open` | `onCancel` | `[escape, close-button]` | `true` |
   | bottomsheet.md | `sheet` | — | — | — | `open` | `onClose` | `[escape, scrim, close-button, swipe]` | `true` |
   | dialog.md | `modal` | — | — | — | `open` | `onClose` | `[escape, scrim, close-button]` | `true` |
   | menu.md | `popover` | `trigger` | `placement` | `flip` | `open` | `onOpenChange` | `[escape, outside-press, focus-out]` | `false` |
   | popover.md | `popover` | `trigger` | `placement` | `flip-shift` | `open` | `onOpenChange` | `[escape, outside-press, close-button, focus-out]` | `false` |
   | sidepanel.md | `sheet` | — | — | — | `open` | `onOpenChange` | `[escape, scrim, close-button, swipe]` | `false` |
   | tooltip.md | `tooltip` | `trigger` | `placement` | `flip` | `open` | — | `[escape]` | `false` |

   What each column is answering:

   - **`layer`** follows `overlayDef`'s own descriptions: `modal` is a dialog over an inert page, `popover` an anchored popup, `sheet` a panel from a screen edge. ActionSheet, BottomSheet and SidePanel are edge panels; Dialog and AlertDialog are centered modals.
   - **`anchor`** must be an anatomy part, and `collision` needs `anchor`. Menu, Popover and Tooltip all have a `trigger` part and position against it. SidePanel has a `trigger` part too, but the panel is positioned at a screen edge, not against the trigger, so it gets no `anchor` and therefore no `collision`. ActionSheet, AlertDialog, BottomSheet and Dialog have no trigger at all.
   - **`collision`** comes from the `placement` prop's own description: Menu `flip`, Popover `flip-shift`, Tooltip `flip`. Tooltip's RN gap log contradicts its prose; the doc's prose is the source of truth here, so record `flip` and name the contradiction in your summary as a phase 5 gap.
   - **`open`** must be a boolean prop. All eight have one, Tooltip included.
   - **`closeEvent`** must be an event of that component. Tooltip declares **no events at all**, so omit the key — do not invent `onOpenChange` for it.
   - **`dismiss`** is read off the close event's documented reasons. ActionSheet's `onClose` reasons are `escape`, `scrim`, `cancel`, `drag`; BottomSheet's are `escape`, `close-button`, `scrim`, `drag`, `action`; Dialog's are `escape`, `close-button`, `scrim`, `action`; SidePanel's `onOpenChange` reasons are `trigger`, `escape`, `close-button`, `scrim`, `swipe`, `action`, `navigation`; Popover's are `trigger`, `escape`, `outside`, `close-button`, `tab-out`. Map a cancel row or close button to `close-button`, a drag or swipe to `swipe`, a backdrop press to `scrim`, a click outside an unscrimmed popup to `outside-press`, and a Tab-out to `focus-out`. `action` and `trigger` are not dismissals and have no entry. AlertDialog takes only `[escape, close-button]`: its `onCancel` fires *"by the cancel button or Escape"* and *"A scrim click does nothing."*
   - **`modal`** matches `a11y.requires`. ActionSheet, AlertDialog, BottomSheet and Dialog list all four modal requirements and are modal. Menu and Popover lack `focus-trap` and `inert-background`, so `modal: true` would be rejected outright. SidePanel lists all four, so either value parses — take `false`, because its `modal` prop defaults to `false` and its prose calls the default *"the disclosure pattern"*. Popover likewise has a `modal` prop defaulting to `false`. Both are choices the doc could be read either way on: list them in your summary.

2. **Where the block goes.** `componentDef` orders its keys `… copy, form, overlay, platforms`, so `overlay:` sits after `copy:` (or after `form:` where both exist) and before `platforms:`, at two-space indent under `component:`. Here is popover.md, before and after:

        copy:
          closeLabel: Close
        a11y:
          ...
        platforms:

        copy:
          closeLabel: Close
        overlay:
          layer: popover
          anchor: trigger
          placement: placement
          collision: flip-shift
          open: open
          closeEvent: onOpenChange
          dismiss: [escape, outside-press, close-button, focus-out]
          modal: false
        a11y:
          ...
        platforms:

   Key order inside the block follows `overlayDef`. Leave `a11y` and everything else exactly as it is.

3. **New derived scenarios are expected here.** `deriveBehavior` in tools/parse.ts derives `escape-fires-<closeEvent kebab-cased>` when `overlay.dismiss` contains `escape` and both `overlay.open` and `overlay.closeEvent` are set, on every declared platform except `rn`. Seven of the eight docs satisfy that after step 1 (all but Tooltip, which has no close event), so `corpus.derivedScenarios` rises — by 7 unless a doc already authored a scenario under that name, which `mergedBehavior` would drop. This is the first phase 3 job that moves that number. Run `node --import tsx tools/behavior_tests.ts` and keep what it writes, so `pnpm gates:behavior:check` sees current files, then report the before and after counts and the new scenario names. If `behavior.skips` rises, name each new skip and its reason; do not suppress one.

4. **Flip the check.** The overlay half of `missingFormOrOverlay(c)` in schema/component.ts becomes an error in `componentDef.check`, with the message word for word — `is 'overlay' but there is no overlay block, so layer, anchor, collision and dismissal live only in prose` — at path `['category']`. Job 634 already moved the form half out, so this rule is the last one in that function: move it and delete the now-empty function, dropping it from the `componentWarnings` return list and leaving every other rule there untouched. If 634 left the form half in place for any reason, move only the overlay half and leave the function standing.

5. **Tests.**
   - tools/__tests__/component-schema.test.ts, `describe('componentWarnings for the form and overlay blocks')`: rewrite the `OVERLAY_WARNING` test so the fixture with no `overlay` block is now **rejected** with that path and message, and the one with the block still parses. If job 634 emptied the describe block, fold the test in beside the other `componentDef.check` rejections and delete the empty block.
   - Add a corpus test: no component in generated/components.json raises the overlay issue, and each of the eight docs parses with the block it was given.
   - Extend the existing `deriveBehavior` Escape test with a corpus assertion naming the derived scenarios the eight docs now produce, so a later job cannot silently lose one.

6. Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 635

In logs/600-measure-635.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `corpus.derivedScenarios` is job 634's plus the new Escape scenarios from step 3, and no other corpus number moves. `pnpm generate:check` fails until phase 4 regenerates; every doc you touch stales its prompt hashes and that is expected.

The job-specific proof is two things. First, `generated/parse-warnings.json` after `pnpm check` holds **zero** entries matching `no overlay block` — quote the new total. Second, a fixture in component-schema.test.ts that the schema now **rejects** with the step 4 message. In your summary: the count you found, the eight blocks you wrote, the derived scenario names and the new count, and every value the docs did not determine — `modal: false` on SidePanel and Popover, Tooltip's omitted `closeEvent`, SidePanel's omitted `anchor`, and Tooltip's `collision: flip` against its RN gap log.

Do not modify `packages/*/src`, `prompts/templates/` or `prompts/conventions/` (both removed from the repository by commit 48ba3ce — do not recreate them), or any doc field other than `overlay`. Do not add a requirement to `a11y.requires` to make `modal: true` or a `dismiss` entry pass — the block records what the doc already declares. Do not give an `overlay` block to Select, Combobox or DatePicker: they are not `category: overlay`, and their popups are a later job.
