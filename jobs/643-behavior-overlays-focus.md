**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Author `behavior` scenarios and `examples` for the ten overlay and focus components, so their real interactions are tested rather than only their render. This is site/src/content/docs/process/schema-hardening.md, Phase 3: "The last four author behavior scenarios by category, closing the 48-of-51 gap with typed clauses the model cannot invent keys for." Read "Rules every job follows", "Measuring a job", the Phase 2 table rows 600, 601, 615 and 624, and the Phase 3 paragraph first. Jobs 630 to 642 have landed; read every file as it is now.

The evidence: `logs/600-measure-629.json` records `corpus.authoredScenarios` 24 and `corpus.docsWithNoAuthoredScenarios` 48 of 51, against `corpus.derivedScenarios` 481. None of the 24 is on an overlay. Dialog has eight tests today and every one of them is derived: `renders`, three `renders-size-*`, three `renders-initial-focus-*`, `has-accessible-name`. Nothing asserts that Escape requests the close, that the close button fires `onClose`, or that focus lands where `initialFocus` says — which is the whole of what a modal is for, and what `a11y.requires` lists as `focus-trap`, `focus-restore`, `escape-dismiss` and `inert-background`. Job 600 made the clause vocabulary a type (`whenClause`, `thenClause`, `behaviorScenario` in schema/component.ts), job 601 made the derived scenarios valid schema data, job 615 added the `overlay` block, and job 624 added `componentExample`. This job spends that: the model cannot invent a clause key, because the schema rejects one.

## Your ten components

`site/src/content/docs/components/` — **dialog.md, alertdialog.md, bottomsheet.md, actionsheet.md, menu.md, popover.md, sidepanel.md, tooltip.md, toast.md, focusscope.md** (Dialog, AlertDialog, BottomSheet, ActionSheet, Menu, Popover, SidePanel, Tooltip, Toast, FocusScope). No other component doc may change. None has an authored scenario today.

1. **Read before you write.** For each doc, read the prose (What it is / When to use / When not to use / Accessibility), every prop `description` and `a11y` string, `a11y.requires`, `overlay`, `copy`, `events`, `anatomy`, `composition`, and the `keyboard` block. The keyboard blocks here are the richest evidence you have: dialog.md's is four rules — Escape "Requests close with reason escape (even when not dismissible)", Tab focus-next, Tab from the last wraps to the first, Shift+Tab from the first wraps to the last — and each is a promise a scenario can make.

   **Author only what the doc already promises.** A scenario must come from the doc's own prose, its keyboard rules, its `a11y.requires`, or its APG pattern. Inventing an interaction the doc does not describe is the failure mode this job exists to avoid. Where the behavior is undefined — the doc does not say whether clicking the trigger of an open Menu closes it, which is exactly the inference `generated/gaps/Menu.web.md` records the generator making — leave it and list it in your summary under "undefined in the doc". That list is input to phase 5, not a gap you fill by guessing.

2. **The whole vocabulary.** `whenClause` and `thenClause` in schema/component.ts. There is nothing else; a key outside this list fails `pnpm check`.

   `when` is at most one of, and exactly one key:

       { click: <anatomy part> }    { key: <keyChord> }    { type: <text> }    { focus: <anatomy part> }
       { blur: true }               { set: { <prop>: <value> } }               { hover: <anatomy part> }

   Omit `when` entirely for a pure render assertion. `key` is pressed on the primary part (`anatomy[0]`) and `type` types into it. A `keyChord` is a `KeyboardEvent.key` name, optionally behind `Shift+`/`Control+`/`Alt+`/`Meta+`: `Escape`, `Enter`, `Space` (the alias for `' '`), `Tab`, `Backspace`, `Delete`, `Home`, `End`, `PageUp`, `PageDown`, the four `Arrow*`, `F1`–`F12`, `*`, a comma, a lowercase letter or digit. `a-z` is a typeahead range, not a key press.

   `then` is a non-empty list, one assertion per item, each taking an optional `platforms: [...]` that narrows only itself:

       { event: <event name>, with?: <argument> }    the handler was called (with that argument)
       { event: <event name>, fired: false }         the handler was not called
       { state: checked|expanded|selected|disabled|invalid|pressed|open, is: true|false|mixed }
       { focusable: true|false }        { renders: true|false }
       { focused: <anatomy part>|none } { text: <literal> }    { copy: <copy key> }
       { role: <role> }                 { name: true } or { name: <exact accessible name> }
       { attribute: <name>, is: <string>|<bool>|null, on?: <anatomy part> }   (null asserts it is absent)

   `focused: moved` and `focused: unchanged` parse but are `Unmappable` on every platform — never use them; `focused: <part>` and `focused: none` are the two that work. A `with` value must fit the event's declared contract (`eventDef.payload` and `reasons`, from job 610): with a payload of two or more fields it is an object keyed by those field names, and a `reason` in it must be one of the event's declared reasons — so `{ event: onClose, with: { reason: escape } }` is only legal when `events.onClose.reasons` declares `escape`. Read `events.<name>` in the doc before writing `with`; where you are not certain what the handler receives, assert `{ event: <name> }` alone. `given` is a record of the component's own props. A scenario-level `platforms` restricts the whole scenario. If a behavior cannot be said in these clauses, do not force it and do not invent a key: record it in your summary as "not expressible" — focus trapping ("Tab from the last element wraps to the first") is the one to expect there, because the vocabulary has no two-step focus assertion and `focused: moved` does not run anywhere.

3. **Narrow, never skip.** tools/behavior_tests.ts turns each clause into code per platform and throws `Unmappable` where it cannot, which the generator emits as `test.skip('<name> — <reason>')`. That count is the gate, and this category is the one most likely to raise it. What runs where:

   | clause | web | lit | rn | swiftui |
   |---|---|---|---|---|
   | `when.click` | yes | yes | yes | yes |
   | `when.key` | yes | yes | no — no keyboard | no |
   | `when.type` | yes | yes | yes | no |
   | `when.focus`, `when.blur` | yes | yes | yes | no |
   | `when.set` | yes | yes | yes | no |
   | `when.hover` | yes | yes | no | no |
   | `then.focusable`, `then.focused` | yes | yes | no — cannot observe focus | no |
   | `then.state` | all states | all states | checked, disabled, selected, expanded (`open`→expanded); not `invalid` | expanded/open, selected, disabled only |
   | `then.attribute` | yes | yes | yes (as a prop) | no |
   | `then.role` | yes | yes | yes | only button, link, img, text, searchbox, slider, spinbutton |
   | `then.name` | needs a queryable role (not `none`, `presentation`, `generic`) | | | |
   | `then.event`, `then.text`, `then.copy`, `then.renders` | yes | yes | yes | yes |

   Every Escape scenario is `platforms: [web, lit]`. Every focus scenario is `platforms: [web, lit]`. Every hover scenario (Tooltip) is `platforms: [web, lit]`. Use **item-level** `platforms` when only one assertion of a broader scenario cannot hold — checkbox.md's `{ state: invalid, is: true, platforms: [web, lit] }` is the in-tree model. The parser refuses three cases outright — `when.key` on rn, `then.focusable` on rn, `then.state: invalid` on rn — with the words "narrow platforms to exclude 'rn'". It does **not** refuse `then.focused` on rn or `when.hover` on rn; narrow those yourself or they become skips and fail this job's proof. SwiftUI cases are emitted as `@Test(..., .disabled(reason))` and are not counted as skips, so do not contort a scenario for them.

   One more mechanic worth knowing before you write: `effectiveGiven` in tools/behavior_tests.ts sets a component's open prop to `true` on its own for any scenario that asserts on the surface, so you rarely need `given: { open: true }` — but stating it is harmless and clearer. For a `tooltip` role, the generator hovers the trigger first on web and lit, and skips on rn; that is where seven of the nineteen existing skips come from.

4. **Derived scenarios stay derived.** Do not hand-author anything `deriveBehavior` already produces: `renders`, `renders-<prop>-<value>` for each enum value, `has-accessible-name`, `control-is-focusable`, `error-is-identified`, and — the one that matters most here — `escape-fires-<closeEvent>`, which is derived for **every component whose `overlay` block lists `escape` in `dismiss` and names both `open` and `closeEvent`**. Job 615 added that block and a phase 3 job has since filled it in, so check each of your ten docs before writing an Escape scenario:

       node -e "const j=require('./generated/components.json');const own=['Dialog','AlertDialog','BottomSheet','ActionSheet','Menu','Popover','SidePanel','Tooltip','Toast','FocusScope'];for(const e of j){if(!own.includes(e.component.name))continue;console.log(e.component.name, (e.behaviorDerived||[]).map(s=>s.name).join(', '));}"

   If `escape-fires-onClose` is already there, do not author it; assert something the derived one does not, such as that a non-dismissible dialog still reports the close. Reusing a derived name silently *replaces* the derived scenario (`mergedBehavior` drops a derived scenario whose name an author used), which loses coverage while the count goes up. After `pnpm check`, confirm no name collides:

       node -e "const j=require('./generated/components.json');for(const e of j){const d=new Set((e.behaviorDerived||[]).map(s=>s.name));for(const s of (e.component.behavior||[])) if(d.has(s.name)) console.log('COLLISION', e.component.name, s.name);}"

   It must print nothing. `corpus.derivedScenarios` in your measure file must equal the value in the most recent earlier `logs/600-measure-*.json`: authoring changes no derived scenario.

5. **Write the scenarios.** In each doc's `component:` block add a `behavior:` list (keep the comment style checkbox.md uses). Names are kebab-case, unique within the doc, and say what happens, not what is set: `close-button-fires-on-close`, `non-dismissible-still-reports-escape`, `initial-focus-lands-on-the-close-button`.

   A worked before/after, Dialog. Before: dialog.md has no `behavior` block and eight derived tests, none of which interacts. The doc promises `onClose` and `onOpened`, `dismissible`, `initialFocus: first | title | close`, `copy.closeLabel`, the four keyboard rules above, and `focus-trap`/`focus-restore`/`escape-dismiss`/`inert-background` in `a11y.requires`. After:

       behavior:
         # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
         - name: close-button-fires-on-close
           given: { open: true }
           when: { click: closeButton }
           then:
             - { event: onClose }
         - name: non-dismissible-still-reports-escape
           description: Escape requests close with reason escape even when not dismissible (keyboard rule 1).
           given: { open: true, dismissible: false }
           when: { key: Escape }
           then:
             - { event: onClose }
           platforms: [web, lit]
         - name: initial-focus-lands-on-the-close-button
           given: { open: true, initialFocus: close }
           then:
             - { focused: closeButton }
           platforms: [web, lit]
         - name: closed-dialog-renders-nothing
           given: { open: false }
           then:
             - { renders: false }

   Write `escape-…` only if step 4 says it is not already derived, and give it a name the derived one does not use. If `events.onClose` declares `reasons`, prefer `{ event: onClose, with: { reason: escape } }` — check the doc first. Every part named (`closeButton`) is in `anatomy`; every event named is in `events`; the focus and key scenarios are narrowed to the platforms that can run them.

   Component by component, the promises to look for (confirm each against the doc; author none the doc does not make):
   - **Dialog** — as above, plus `onOpened` and `hideHeading`.
   - **AlertDialog** — `onConfirm` and `onCancel`, `confirmDisabled`, `tone`, and where focus starts (the least-destructive action).
   - **BottomSheet** — `onClose` and `onDragDismiss` (a `gesture: true` event with `gesture-alternative`: assert the visible close button, not the swipe), `dismissible`, `dragToDismiss`, `height`.
   - **ActionSheet** — `onAction` and `onClose`, `cancelLabel`/`copy.cancelLabel`, and the item list.
   - **Menu** — `onAction` and `onOpenChange`, the trigger's expanded state, `copy`-free but `items`-driven; its arrow/Home/End/typeahead rules are `[web, lit]`, and `a-z` typeahead is **not** a key a scenario can press.
   - **Popover** — `onOpenChange`, `dismissible`, `modal`, the trigger's `aria-expanded`, `copy.closeLabel`.
   - **SidePanel** — `onOpenChange`, `modal` vs `persistent`, `side`, `scrim`, `swipeable`. Its `has-accessible-name` is one of the pre-existing skips because its role is `none`; that is not yours to fix.
   - **Tooltip** — it has **no events**. Everything you can assert is `renders`, `text`, `role` and `attribute` after `when: { hover: trigger }`, narrowed to `[web, lit]`; `describes` and `delay` are the props the doc speaks about, and `no-hover-only` is in `a11y.requires`.
   - **Toast** — `onAction` and `onDismiss`, `duration`, `tone`, `copy.dismissLabel` and `copy.regionLabel`, and the F6/Escape rules in its `keyboard` block.
   - **FocusScope** — `onEscapeAttempt`, `trapped`, `autoFocus` (`first`/`last`/`container`/`none`), `restoreFocus`, `active`. `autoFocus` is the one thing here the vocabulary states cleanly, with `{ focused: <part> }` narrowed to `[web, lit]`; trap-wrapping is not expressible, so record it.

6. **`examples`.** Add an `examples:` list to each of the ten, from `componentExample` in schema/component.ts: `name` (kebab-case, unique in the doc), `description` (one sentence, what the example shows), `given` (a record of props; every key a real prop and every value fitting its type and, for an enum, one of its declared values), and optional `platforms` (a subset of the ones the component declares). Two to four per component, each a distinct use the doc's prose already names — a destructive confirm for AlertDialog, a half-height sheet, a persistent SidePanel — not a restatement of the defaults. Include every `required` prop (every overlay here has `open` or a heading required), because the example is a thing that gets rendered. An example that sets a deprecated prop or value raises a warning through `componentWarnings`; none of these docs has a deprecation today, so `generated/parse-warnings.json` must gain nothing from this job.

7. **Work doc by doc.** After each doc, run `pnpm parse` alone: it is fast and its messages name the scenario and the path (`scenario 'x' when.click: unknown anatomy part 'y'`, `scenario 'x' then.event: unknown event 'y'`, `scenario 'x' uses when.key but React Native has no keyboard`). Then, before the full gate, run `node --import tsx tools/behavior_tests.ts` and grep the files you just changed for `test.skip` — that is the fastest way to find a scenario you forgot to narrow.

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use npx or PowerShell, and do not stage or commit.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/behavior_tests.ts
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 643

`node --import tsx tools/behavior_tests.ts` rewrites `generated/behavior/` and the committed Swift cases under `packages/swiftui/Tests/DesignSchemaTests/Generated/`; keep both. That directory is tests, not `packages/*/src`, so writing there is expected — `pnpm gates:behavior:check` is exactly the check that what is committed matches the docs, and it fails if you skip the write step. The React, Lit and React Native suites are **not** run by this job: they need browsers. Generating plus `pnpm test:tools` is the proof.

In `logs/600-measure-643.json`: every step exits 0 except `generateCheck` (doc edits stale the prompt hashes; `pnpm generate:check` fails until phase 4, which is expected), and `vsBaseline.lockedBindingsNoLongerLocked` is empty. Then this job's own proof:

- `corpus.authoredScenarios` has risen by the number of scenarios you wrote, and every one of the ten components above has at least one authored `behavior` scenario and at least one `examples` entry — or is named in your summary with the doc's own words explaining why it has no authorable interaction.
- `corpus.docsWithNoAuthoredScenarios` has fallen by exactly 10.
- `corpus.derivedScenarios` is unchanged, and the collision check in step 4 prints nothing.
- `behavior.skips` is **not above** the value in the previous measure file (19 in `logs/600-measure-629.json`), and `behavior.skipFiles` likewise. Report both before and after, and list every `test.skip` under `generated/behavior/` for your ten components with its reason. Nine of the pre-existing nineteen are yours by category and none is fixable here: seven are Tooltip's derived `renders*` scenarios on React Native, which needs a pointer it does not have, and SidePanel's two `has-accessible-name` skips need a queryable `a11y.role`, a field this job may not touch.
- Count per component and paste the table into your summary:

      node -e "const j=require('./generated/components.json');const own=['Dialog','AlertDialog','BottomSheet','ActionSheet','Menu','Popover','SidePanel','Tooltip','Toast','FocusScope'];let t=0;for(const e of j){const c=e.component;if(!own.includes(c.name))continue;const b=(c.behavior||[]).length,x=(c.examples||[]).length;t+=b;console.log(c.name,'behavior='+b,'examples='+x);}console.log('total authored',t)"

- `git status` shows changes only under `site/src/content/docs/components/` (the ten above), `generated/` and `packages/swiftui/Tests/`.

End your summary with: the per-component table, the before/after of `corpus.authoredScenarios`, `corpus.docsWithNoAuthoredScenarios` and `behavior.skips`, the list of behaviors you found undefined in a doc, and the list of behaviors the vocabulary could not say (focus trapping and focus restoration belong there unless you found a clause that states them).

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, `schema/`, `tools/behavior_tests.ts` (unless a genuine bug in it blocks the job — then fix it and say so in the summary), any component doc outside the ten named above, any extension doc, or any field of a component doc other than `behavior` and `examples`.
