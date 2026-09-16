**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Author `behavior` scenarios and `examples` for the twelve controls, disclosure and status components, so their real interactions are tested rather than only their render. This is site/src/content/docs/process/schema-hardening.md, Phase 3: "The last four author behavior scenarios by category, closing the 48-of-51 gap with typed clauses the model cannot invent keys for." Read "Rules every job follows", "Measuring a job", the Phase 2 table rows 600, 601 and 624, and the Phase 3 paragraph first. Jobs 630 to 641 have landed; read every file as it is now.

The evidence: `logs/600-measure-629.json` records `corpus.authoredScenarios` 24 and `corpus.docsWithNoAuthoredScenarios` 48 of 51, against `corpus.derivedScenarios` 481. Twenty-three of those 24 scenarios are in two of *your* docs — checkbox.md and switch.md — and they are the model the rest of this category copies. Everywhere else the only tests are the ones `deriveBehavior` (tools/parse.ts) writes from the schema: `renders`, one `renders-<prop>-<value>` per enum value, `has-accessible-name`, `control-is-focusable`, `error-is-identified`. Nothing asserts that clicking a Disclosure trigger reports the toggle and flips `aria-expanded`, that a RadioGroup reports the chosen value, or that a dismissible Alert fires `onDismiss`. Job 600 made the clause vocabulary a type (`whenClause`, `thenClause`, `behaviorScenario` in schema/component.ts), job 601 made the derived scenarios valid schema data, and job 624 added `componentExample`. This job spends that: the model cannot invent a clause key, because the schema rejects one.

## Your twelve components

`site/src/content/docs/components/` — **checkbox.md, switch.md, radiogroup.md, disclosure.md, accordion.md, alert.md, breadcrumb.md, meter.md, fieldset.md, landmark.md, progressbar.md, stepper.md** (Checkbox, Switch, RadioGroup, Disclosure, Accordion, Alert, Breadcrumb, Meter, Fieldset, Landmark, ProgressBar, Stepper). No other component doc may change. Ten of the twelve have no authored scenario today.

**checkbox.md and switch.md are already authored.** Do not rewrite or reorder their scenarios. Read both first — they are the worked model for this whole phase. Add `examples` to each, and add a scenario only where the doc plainly promises something the existing twelve/eleven do not cover (switch.md's `labelPosition`, for instance). Say in your summary what you added to each and why.

1. **Read before you write.** For each doc, read the prose (What it is / When to use / When not to use / Accessibility), every prop `description` and `a11y` string, `a11y.requires`, `copy`, `events`, `anatomy`, `composition`, and the `keyboard` block where there is one (RadioGroup and Accordion have one; Alert, Meter, ProgressBar, Fieldset, Landmark, Breadcrumb and Disclosure do not — their keys are the native element's). Write down, per component, what the doc *promises*: an event that fires on an interaction, a state it reports, a string it renders, an attribute it sets, a focus rule.

   **Author only what the doc already promises.** A scenario must come from the doc's own prose, its keyboard rules, its `a11y.requires`, or its APG pattern. Inventing an interaction the doc does not describe is the failure mode this job exists to avoid. Where the behavior is undefined — the doc does not say what Accordion does when `exclusive` is set and a second item is opened, say — leave it and list it in your summary under "undefined in the doc". That list is input to phase 5, not a gap you fill by guessing.

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

   `focused: moved` and `focused: unchanged` parse but are `Unmappable` on every platform — never use them. A `with` value must fit the event's declared contract (`eventDef.payload` and `reasons`, from job 610): with a payload of two or more fields it is an object keyed by those field names, and a `reason` in it must be one of the event's declared reasons. Read `events.<name>` in the doc before writing `with`; where you are not certain what the handler receives, assert `{ event: <name> }` alone. `given` is a record of the component's own props, applied over the Default story's args. A scenario-level `platforms` restricts the whole scenario. If a behavior cannot be said in these clauses, do not force it and do not invent a key: record it in your summary as "not expressible".

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

   Use **scenario-level** `platforms` when the interaction itself cannot happen (`when: { key: ArrowDown }` → `platforms: [web, lit]`), and **item-level** `platforms` when only one assertion cannot hold (`{ state: invalid, is: true, platforms: [web, lit] }`, as checkbox.md does). The parser refuses three of these outright — `when.key` on rn, `then.focusable` on rn, `then.state: invalid` on rn — with the words "narrow platforms to exclude 'rn'". It does **not** refuse `then.focused` on rn or `when.hover` on rn; narrow those yourself. SwiftUI cases are emitted as `@Test(..., .disabled(reason))` and are not counted as skips, so do not contort a scenario for them.

4. **Derived scenarios stay derived.** Do not hand-author anything `deriveBehavior` already produces: `renders`, `renders-<prop>-<value>` for each enum value, `has-accessible-name`, `control-is-focusable`, `error-is-identified`, `escape-fires-<closeEvent>`. Reusing one of those names silently *replaces* the derived scenario (`mergedBehavior` drops a derived scenario whose name an author used), which loses coverage while the count goes up. After `pnpm check`, confirm no name collides:

       node -e "const j=require('./generated/components.json');for(const e of j){const d=new Set((e.behaviorDerived||[]).map(s=>s.name));for(const s of (e.component.behavior||[])) if(d.has(s.name)) console.log('COLLISION', e.component.name, s.name);}"

   It must print nothing. `corpus.derivedScenarios` in your measure file must equal the value in the most recent earlier `logs/600-measure-*.json`: authoring changes no derived scenario. Note in particular that Checkbox, RadioGroup and Fieldset declare `error-identification` with an `error` prop, so `error-is-identified` already exists for them — assert something *else* about the error (the `copy.invalid` string, the `errorMessage` part) if the doc promises it.

5. **Write the scenarios.** In each doc's `component:` block add a `behavior:` list (keep the comment style checkbox.md uses). Names are kebab-case, unique within the doc, and say what happens, not what is set: `click-on-trigger-expands`, `disabled-trigger-does-not-toggle`, `dismiss-fires-on-dismiss`.

   A worked before/after, Disclosure. Before: disclosure.md has no `behavior` block, so the only tests are the eight derived ones (`renders`, the `headingLevel` renders, `has-accessible-name`, `control-is-focusable`) — none of which opens it. The doc promises `onToggle` ("Fired when the trigger is activated"), `expanded-state` in `a11y.requires`, `disabled` ("The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state"), `children` ("Rendered only while open (not merely hidden)") and `keepMounted`. After:

       behavior:
         # Authored scenarios; the parser adds renders/enum/accessible-name/focusable ones from the schema.
         - name: click-on-trigger-expands
           when: { click: trigger }
           then:
             - { event: onToggle }
             - { state: expanded, is: true }
         - name: open-disclosure-collapses-on-click
           given: { defaultOpen: true }
           when: { click: trigger }
           then:
             - { event: onToggle }
             - { state: expanded, is: false }
         - name: disabled-trigger-does-not-toggle
           description: The trigger cannot be activated; the panel keeps its current state.
           given: { disabled: true }
           when: { click: trigger }
           then:
             - { event: onToggle, fired: false }
             - { state: expanded, is: false }
             - { state: disabled, is: true }
         - name: disabled-trigger-stays-focusable
           description: Announced as disabled, not removed from the tab order.
           given: { disabled: true }
           then:
             - { focusable: true }
           platforms: [web, lit]
   A fifth promise the doc makes — the panel content "Rendered only while open (not merely hidden)" — has no clause: there is no "this text is absent" assertion, and `renders: false` judges the component root, not a part. Do not approximate it and do not invent a key; write "Disclosure: closed panel content is not rendered — not expressible" in your summary and move on. Check every `with` against the event's `payload`; checkbox.md's `{ event: onChange, with: true }` is the in-tree model for a one-field payload.

   Component by component, the promises to look for (confirm each against the doc; author none the doc does not make):
   - **Checkbox**, **Switch** — already authored; see the note above.
   - **RadioGroup** — `onChange` with the chosen option value, the selected state, `disabled`, the `required`/`invalid`/`error` copy, and the arrow-key rules in its `keyboard` block (narrowed to `[web, lit]`).
   - **Disclosure** — as above.
   - **Accordion** — `onChange` and `onOpenChange`, `exclusive`, `divided`, `keepMounted`, and the arrow/Home/End rules in its `keyboard` block. Accordion composes Disclosure; assert Accordion's own promises, not Disclosure's.
   - **Alert** — `dismissible` and `onDismiss`, `tone`, the `live` prop and what role it renders, `copy.dismissLabel`.
   - **Breadcrumb** — `onNavigate`, `collapse` and `copy.expandLabel`, and the current item.
   - **Meter**, **ProgressBar** — value reporting: `valueText`/`formatValue`, `hideValue`/`showValue`, the `copy` keys, and the `announce` behavior ProgressBar documents. These have no events; most of what you can assert is `text`, `copy`, `role` and `attribute`.
   - **Fieldset** — `legend`, `description`, `error` and `disabled`, and `copy.requiredIndicator`.
   - **Landmark** — `role` is an enum prop, so the rendered role comes from `given`. `then.name` is unmappable here (its `has-accessible-name` is one of the pre-existing skips); assert `{ role: <value> }` per the doc instead, if the doc promises it.
   - **Stepper** — `onStepSelect`, `navigable` (`none`/`completed`/`all`), `current`, and the `copy` keys for complete/current/error.

6. **`examples`.** Add an `examples:` list to each of the twelve, from `componentExample` in schema/component.ts: `name` (kebab-case, unique in the doc), `description` (one sentence, what the example shows), `given` (a record of props; every key a real prop and every value fitting its type and, for an enum, one of its declared values), and optional `platforms` (a subset of the ones the component declares). Two to four per component, each a distinct use the doc's prose already names, not a restatement of the defaults. Include every `required` prop, because the example is a thing that gets rendered. An example that sets a deprecated prop or value raises a warning through `componentWarnings`; none of these docs has a deprecation today, so `generated/parse-warnings.json` must gain nothing from this job.

7. **Work doc by doc.** After each doc, run `pnpm parse` alone: it is fast and its messages name the scenario and the path (`scenario 'x' when.click: unknown anatomy part 'y'`, `scenario 'x' then.event: unknown event 'y'`, `scenario 'x' uses when.key but React Native has no keyboard`). Fixing one doc at a time is much cheaper than fixing twelve at the end.

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use npx or PowerShell, and do not stage or commit.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/behavior_tests.ts
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 642

`node --import tsx tools/behavior_tests.ts` rewrites `generated/behavior/` and the committed Swift cases under `packages/swiftui/Tests/DesignSchemaTests/Generated/`; keep both. That directory is tests, not `packages/*/src`, so writing there is expected — `pnpm gates:behavior:check` is exactly the check that what is committed matches the docs, and it fails if you skip the write step. The React, Lit and React Native suites are **not** run by this job: they need browsers. Generating plus `pnpm test:tools` is the proof.

In `logs/600-measure-642.json`: every step exits 0 except `generateCheck` (doc edits stale the prompt hashes; `pnpm generate:check` fails until phase 4, which is expected), and `vsBaseline.lockedBindingsNoLongerLocked` is empty. Then this job's own proof:

- `corpus.authoredScenarios` has risen by the number of scenarios you wrote, and every one of the twelve components above has at least one authored `behavior` scenario and at least one `examples` entry — or is named in your summary with the doc's own words explaining why it has no authorable interaction.
- `corpus.docsWithNoAuthoredScenarios` has fallen by exactly 10 (checkbox.md and switch.md already counted as authored).
- `corpus.derivedScenarios` is unchanged, and the collision check in step 4 prints nothing.
- `behavior.skips` is **not above** the value in the previous measure file (19 in `logs/600-measure-629.json`), and `behavior.skipFiles` likewise. Report both before and after. Two of the pre-existing skips are yours by category and neither is fixable here: Landmark and Stepper each skip `has-accessible-name` because their resolved role is `none` or comes from a prop, which means changing `a11y` — a field this job may not touch.
- Count per component and paste the table into your summary:

      node -e "const j=require('./generated/components.json');const own=['Checkbox','Switch','RadioGroup','Disclosure','Accordion','Alert','Breadcrumb','Meter','Fieldset','Landmark','ProgressBar','Stepper'];let t=0;for(const e of j){const c=e.component;if(!own.includes(c.name))continue;const b=(c.behavior||[]).length,x=(c.examples||[]).length;t+=b;console.log(c.name,'behavior='+b,'examples='+x);}console.log('total authored',t)"

- `git status` shows changes only under `site/src/content/docs/components/` (the twelve above), `generated/` and `packages/swiftui/Tests/`.

End your summary with: the per-component table, what you added to checkbox.md and switch.md and why, the before/after of `corpus.authoredScenarios`, `corpus.docsWithNoAuthoredScenarios` and `behavior.skips`, the list of behaviors you found undefined in a doc, and the list of behaviors the vocabulary could not say.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, `schema/`, `tools/behavior_tests.ts` (unless a genuine bug in it blocks the job — then fix it and say so in the summary), any component doc outside the twelve named above, any extension doc, or any field of a component doc other than `behavior` and `examples`.
