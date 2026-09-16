**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Author `behavior` scenarios and `examples` for the seventeen selection, numeric, row, grid and stream components, so their real interactions are tested rather than only their render. This is the last job of phase 3: site/src/content/docs/process/schema-hardening.md says of these four, "The last four author behavior scenarios by category, closing the 48-of-51 gap with typed clauses the model cannot invent keys for." Read "Rules every job follows", "Measuring a job", the Phase 2 table rows 600, 601, 611, 614 and 624, and the Phase 3 paragraph first. Jobs 630 to 643 have landed; read every file as it is now.

The evidence: `logs/600-measure-629.json` records `corpus.authoredScenarios` 24 and `corpus.docsWithNoAuthoredScenarios` 48 of 51, against `corpus.derivedScenarios` 481. None of the 24 is on any component in this category, which holds the heaviest keyboard models in the system — DataGrid alone documents twenty key chords and Tree twelve — and yet Tabs' eight tests are all derived (`renders`, the `activation`, `orientation` and `fit` renders, `has-accessible-name`) and not one of them clicks a tab. The keyboard gate (`tools/keyboard_tests.ts`) covers key-to-focus movement in a browser; what is missing is the assertion that the component *reports* what it did — `onChange` with the new value, the selected state, the live-region string. Job 600 made the clause vocabulary a type (`whenClause`, `thenClause`, `behaviorScenario` in schema/component.ts), job 601 made the derived scenarios valid schema data, and job 624 added `componentExample`. This job spends that: the model cannot invent a clause key, because the schema rejects one.

## Your seventeen components

`site/src/content/docs/components/` — **tabs.md, segmentedcontrol.md, listbox.md, select.md, combobox.md, search.md, slider.md, numberinput.md, datepicker.md, toolbar.md, carousel.md, table.md, datagrid.md, treegrid.md, tree.md, splitter.md, feed.md** (Tabs, SegmentedControl, Listbox, Select, Combobox, Search, Slider, NumberInput, DatePicker, Toolbar, Carousel, Table, DataGrid, TreeGrid, Tree, Splitter, Feed). No other component doc may change. None has an authored scenario today.

This is the largest of the four jobs. Work through the docs smallest first (SegmentedControl, Toolbar, Splitter, Search, Feed, Carousel), then the selection group (Tabs, Listbox, Select, Combobox), then the numeric group (Slider, NumberInput, DatePicker), then the four table-shaped ones (Table, DataGrid, TreeGrid, Tree). Never end your turn with a command still running.

1. **Read before you write.** For each doc, read the prose (What it is / When to use / When not to use / Accessibility), every prop `description` and `a11y` string, `a11y.requires`, `copy`, `events`, `anatomy`, `composition`, `controls` on the value props (job 611: which prop is controlled, which event reports a change, which prop seeds the uncontrolled value) and the `keyboard` block. The keyboard blocks are the richest evidence here — tabs.md says in so many words that `automatic` "selects a tab as arrow keys move to it" while `manual` "moves focus only and selects on Enter/Space", which is two scenarios and their opposite.

   **Author only what the doc already promises.** A scenario must come from the doc's own prose, its keyboard rules, its `a11y.requires`, or its APG pattern. Inventing an interaction the doc does not describe is the failure mode this job exists to avoid. Where the behavior is undefined — the doc does not say whether disabled items stay in the roving-tabindex sequence, which is exactly the inference `generated/gaps/Menu.web.md` records the generator making — leave it and list it in your summary under "undefined in the doc". That list is input to phase 5, not a gap you fill by guessing.

2. **The whole vocabulary.** `whenClause` and `thenClause` in schema/component.ts. There is nothing else; a key outside this list fails `pnpm check`.

   `when` is at most one of, and exactly one key:

       { click: <anatomy part> }    { key: <keyChord> }    { type: <text> }    { focus: <anatomy part> }
       { blur: true }               { set: { <prop>: <value> } }               { hover: <anatomy part> }

   Omit `when` entirely for a pure render assertion. `key` is pressed on the primary part (`anatomy[0]`) and `type` types into it. A `keyChord` is a `KeyboardEvent.key` name, optionally behind `Shift+`/`Control+`/`Alt+`/`Meta+`: `Escape`, `Enter`, `Space` (the alias for `' '`), `Tab`, `Backspace`, `Delete`, `Home`, `End`, `PageUp`, `PageDown`, the four `Arrow*`, `F1`–`F12`, `*`, a comma, a lowercase letter or digit. **`a-z` is a typeahead range, not a key press** — every typeahead rule in listbox.md, select.md, menu.md and tree.md is therefore not expressible as a `when`, and belongs in your summary rather than in a doc.

   `then` is a non-empty list, one assertion per item, each taking an optional `platforms: [...]` that narrows only itself:

       { event: <event name>, with?: <argument> }    the handler was called (with that argument)
       { event: <event name>, fired: false }         the handler was not called
       { state: checked|expanded|selected|disabled|invalid|pressed|open, is: true|false|mixed }
       { focusable: true|false }        { renders: true|false }
       { focused: <anatomy part>|none } { text: <literal> }    { copy: <copy key> }
       { role: <role> }                 { name: true } or { name: <exact accessible name> }
       { attribute: <name>, is: <string>|<bool>|null, on?: <anatomy part> }   (null asserts it is absent)

   `focused: moved` and `focused: unchanged` parse but are `Unmappable` on every platform — never use them, which means "arrow key moves to the next option" is only assertable as `{ focused: <named part> }` or through the event the move fires. A `with` value must fit the event's declared contract (`eventDef.payload` and `reasons`, from job 610): with a payload of two or more fields it is an object keyed by those field names, and a `reason` in it must be one of the event's declared reasons. Read `events.<name>` in the doc before writing `with`; where you are not certain what the handler receives, assert `{ event: <name> }` alone. `given` is a record of the component's own props — for the array-driven components here (`options`, `items`, `columns`, `data`, `nodes`, `steps`) give a small literal list that fits the prop's `shape`, and keep it to two or three entries. A scenario-level `platforms` restricts the whole scenario. If a behavior cannot be said in these clauses, do not force it and do not invent a key: record it in your summary as "not expressible".

3. **Narrow, never skip.** tools/behavior_tests.ts turns each clause into code per platform and throws `Unmappable` where it cannot, which the generator emits as `test.skip('<name> — <reason>')`. That count is the gate. What runs where:

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

   Every arrow-key, Home/End, PageUp/PageDown and F2 scenario is `platforms: [web, lit]`. Use **item-level** `platforms` when only one assertion of a broader scenario cannot hold — checkbox.md's `{ state: invalid, is: true, platforms: [web, lit] }` is the in-tree model. The parser refuses three cases outright — `when.key` on rn, `then.focusable` on rn, `then.state: invalid` on rn — with the words "narrow platforms to exclude 'rn'". It does **not** refuse `then.focused` on rn or `when.hover` on rn; narrow those yourself or they become skips and fail this job's proof. Some components in this category declare `supported: false` on a platform (DataGrid, TreeGrid and Splitter on React Native): a scenario's `platforms` may only name platforms the component declares, and the parser says so. SwiftUI cases are emitted as `@Test(..., .disabled(reason))` and are not counted as skips, so do not contort a scenario for them.

4. **Derived scenarios stay derived.** Do not hand-author anything `deriveBehavior` already produces: `renders`, `renders-<prop>-<value>` for each enum value, `has-accessible-name`, `control-is-focusable`, `error-is-identified` (Listbox, Select, Combobox, Slider, NumberInput, DatePicker all declare `error-identification` with an `error` prop, so that one already exists for them), and `escape-fires-<closeEvent>` for anything whose `overlay` block lists `escape`. Check before you write:

       node -e "const j=require('./generated/components.json');const own=['Tabs','SegmentedControl','Listbox','Select','Combobox','Search','Slider','NumberInput','DatePicker','Toolbar','Carousel','Table','DataGrid','TreeGrid','Tree','Splitter','Feed'];for(const e of j){if(!own.includes(e.component.name))continue;console.log(e.component.name, (e.behaviorDerived||[]).map(s=>s.name).join(', '));}"

   Reusing a derived name silently *replaces* the derived scenario (`mergedBehavior` drops a derived scenario whose name an author used), which loses coverage while the count goes up. After `pnpm check`, confirm no name collides:

       node -e "const j=require('./generated/components.json');for(const e of j){const d=new Set((e.behaviorDerived||[]).map(s=>s.name));for(const s of (e.component.behavior||[])) if(d.has(s.name)) console.log('COLLISION', e.component.name, s.name);}"

   It must print nothing. `corpus.derivedScenarios` in your measure file must equal the value in the most recent earlier `logs/600-measure-*.json`: authoring changes no derived scenario.

5. **Write the scenarios.** In each doc's `component:` block add a `behavior:` list (keep the comment style checkbox.md uses). Names are kebab-case, unique within the doc, and say what happens, not what is set: `click-selects-a-tab`, `manual-activation-does-not-select-on-arrow`, `disabled-option-is-not-selectable`.

   A worked before/after, Tabs. Before: tabs.md has no `behavior` block and eight derived tests, none of which selects anything. The doc promises `onChange`, `activation: automatic | manual` ("`automatic` selects a tab as arrow keys move to it … `manual` moves focus only and selects on Enter/Space"), `value`/`defaultValue`, `keepMounted` ("Only the selected panel is rendered unless `keepMounted`"), a `tabs` array whose items may be `disabled`, and `selected-state`, `arrow-navigation` and `roving-tabindex` in `a11y.requires`. After:

       behavior:
         # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
         - name: click-selects-a-tab
           given: { tabs: [{ id: 'general', label: 'General' }, { id: 'billing', label: 'Billing' }], defaultValue: general }
           when: { click: tab }
           then:
             - { event: onChange }
         - name: arrow-selects-under-automatic-activation
           description: automatic selects a tab as arrow keys move to it (keyboard rule, ArrowRight).
           given: { activation: automatic }
           when: { key: ArrowRight }
           then:
             - { event: onChange }
           platforms: [web, lit]
         - name: manual-activation-does-not-select-on-arrow
           description: manual moves focus only and selects on Enter/Space.
           given: { activation: manual }
           when: { key: ArrowRight }
           then:
             - { event: onChange, fired: false }
           platforms: [web, lit]
         - name: manual-activation-selects-on-enter
           given: { activation: manual }
           when: { key: Enter }
           then:
             - { event: onChange }
           platforms: [web, lit]

   Every part named is in `anatomy` (Tabs' is `tablist, tab, tabLabel, tabIcon, tabBadge, indicator, panel`); every event named is in `events`; every key scenario is narrowed. Where the doc names an argument the handler receives, use it — checkbox.md's `{ event: onChange, with: true }` is the in-tree model for a one-field payload; check `events.onChange.payload` first.

   Component by component, the promises to look for (confirm each against the doc; author none the doc does not make):
   - **Tabs** — as above. **SegmentedControl** — `onChange` and the selected segment; it is a RadioGroup in tabs' clothing, so assert `selected`, not `checked`, if that is what the doc says.
   - **Listbox** — `onChange`, `onActiveChange`, `multiple`, `selectionFollowsFocus`, `disabled`, `emptyMessage` and `copy.empty`, `copy.selectedCount`.
   - **Select** — `onChange` and `onOpenChange`, the trigger's expanded state, `placeholder` and `copy.placeholder`, `native: auto|always|never`.
   - **Combobox** — `onInputChange` on `when: { type: … }`, `onChange`, `onOpenChange`, `allowCustom`, `clearable` and `copy.clearLabel`, `loading` and `copy.loading`, the chips when `multiple`.
   - **Search** — `onChange`, `onSubmit`, `onClear`, `landmark`, `copy.clear` and `copy.submit`.
   - **Slider** — `onChange` and `onChangeEnd`, `range`, `step`, `showValue`, `marks`, and the arrow/PageUp/Home/End rules narrowed to `[web, lit]`. Its role is `slider`, so `then.role` also holds on SwiftUI.
   - **NumberInput** — `onChange`, the increment and decrement buttons (`when: { click: incrementButton }`), `min`/`max`/`step`, `hideSteppers`, `copy.outOfRange`.
   - **DatePicker** — `onChange`, `onOpenChange`, `range`, `min`/`max`, `copy` for the calendar. Its `has-accessible-name` is one of the pre-existing skips because its role is `none`; that is not yours to fix.
   - **Toolbar** — no events at all; what you can assert is `role`, `name`, `copy.more` and the overflow behavior the doc describes.
   - **Carousel** — `onChange`, `autoplay` and `interval`, `picker`, `loop`, `copy.previous`/`next`/`play`/`pause`, and `no-hover-only`.
   - **Table** — `onSortChange`, `onSelectionChange`, `onRowPress`, `selectable`, `responsive`, `emptyMessage` and `copy.empty`, `copy.sortAscending`.
   - **DataGrid**, **TreeGrid** — `onSortChange`, `onSelectionChange`, `onCellChange`, `onEditStart`, `onColumnResize`, and for TreeGrid `onExpandChange`/`onExpand`. Their 2-D arrow model moves an `aria-activedescendant`, which no clause states: assert the *events* and the *states* (`expanded`, `selected`) and put the movement in your "not expressible" list rather than reaching for `focused: moved`.
   - **Tree** — `onSelectionChange`, `onExpandChange`, `onExpand`, `onActivate`, `selectable`, `selectChildren`, `selectOnFocus`, `copy.expand`/`collapse`.
   - **Splitter** — `onSizeChange`, `onSizeChangeEnd`, `onCollapseChange`, `collapsible`, `step`, `copy.sizeText`. Its role is `separator` with a value.
   - **Feed** — `onLoadMore`, `onShowNew`, `onItemVisible`, `hasMore`, `loading`, `newItemsCount`, `copy.showNew`/`loading`/`end`/`empty`.

6. **`examples`.** Add an `examples:` list to each of the seventeen, from `componentExample` in schema/component.ts: `name` (kebab-case, unique in the doc), `description` (one sentence, what the example shows), `given` (a record of props; every key a real prop and every value fitting its type and, for an enum, one of its declared values), and optional `platforms` (a subset of the ones the component declares). Two to four per component, each a distinct use the doc's prose already names — a multi-select Combobox, a range Slider, a Table with `responsive: stack` — not a restatement of the defaults. Include every `required` prop, because the example is a thing that gets rendered; keep the array props to two or three literal entries so the example stays readable. An example that sets a deprecated prop or value raises a warning through `componentWarnings`; none of these docs has a deprecation today, so `generated/parse-warnings.json` must gain nothing from this job.

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
    node logs/600-baseline.mjs --out 644

`node --import tsx tools/behavior_tests.ts` rewrites `generated/behavior/` and the committed Swift cases under `packages/swiftui/Tests/DesignSchemaTests/Generated/`; keep both. That directory is tests, not `packages/*/src`, so writing there is expected — `pnpm gates:behavior:check` is exactly the check that what is committed matches the docs, and it fails if you skip the write step. The React, Lit and React Native suites are **not** run by this job: they need browsers. Generating plus `pnpm test:tools` is the proof.

In `logs/600-measure-644.json`: every step exits 0 except `generateCheck` (doc edits stale the prompt hashes; `pnpm generate:check` fails until phase 4, which is expected), and `vsBaseline.lockedBindingsNoLongerLocked` is empty. Then this job's own proof:

- `corpus.authoredScenarios` has risen by the number of scenarios you wrote, and every one of the seventeen components above has at least one authored `behavior` scenario and at least one `examples` entry — or is named in your summary with the doc's own words explaining why it has no authorable interaction.
- `corpus.docsWithNoAuthoredScenarios` has fallen by exactly 17. This is the last job of phase 3: if 641, 642 and 643 ran before it, the number is now **0** and the 48-of-51 gap the plan opens with is closed. If it is not 0, name the components that remain and say which job owns them.
- `corpus.derivedScenarios` is unchanged, and the collision check in step 4 prints nothing.
- `behavior.skips` is **not above** the value in the previous measure file (19 in `logs/600-measure-629.json`), and `behavior.skipFiles` likewise. Report both before and after, and list every `test.skip` under `generated/behavior/` for your seventeen components with its reason. DatePicker's three `has-accessible-name` skips are pre-existing and need a queryable `a11y.role`, a field this job may not touch.
- Count per component and paste the table into your summary:

      node -e "const j=require('./generated/components.json');const own=['Tabs','SegmentedControl','Listbox','Select','Combobox','Search','Slider','NumberInput','DatePicker','Toolbar','Carousel','Table','DataGrid','TreeGrid','Tree','Splitter','Feed'];let t=0;for(const e of j){const c=e.component;if(!own.includes(c.name))continue;const b=(c.behavior||[]).length,x=(c.examples||[]).length;t+=b;console.log(c.name,'behavior='+b,'examples='+x);}console.log('total authored',t)"

- `git status` shows changes only under `site/src/content/docs/components/` (the seventeen above), `generated/` and `packages/swiftui/Tests/`.

End your summary with: the per-component table, the before/after of `corpus.authoredScenarios`, `corpus.docsWithNoAuthoredScenarios` and `behavior.skips`, the list of behaviors you found undefined in a doc, and the list of behaviors the vocabulary could not say — typeahead (`a-z`) and 2-D `aria-activedescendant` movement belong there, and that list is the input to phase 5.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, `schema/`, `tools/behavior_tests.ts` (unless a genuine bug in it blocks the job — then fix it and say so in the summary), any component doc outside the seventeen named above, any extension doc, or any field of a component doc other than `behavior` and `examples`.
