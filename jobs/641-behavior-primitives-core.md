**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Author `behavior` scenarios and `examples` for the twelve primitive and core components, so their real interactions are tested rather than only their render. This is site/src/content/docs/process/schema-hardening.md, Phase 3: "The last four author behavior scenarios by category, closing the 48-of-51 gap with typed clauses the model cannot invent keys for." Read "Rules every job follows", "Measuring a job", the Phase 2 table rows 600, 601 and 624, and the Phase 3 paragraph first. Jobs 630 to 640 have landed; read every file as it is now.

The evidence: `logs/600-measure-629.json` records `corpus.authoredScenarios` 24 and `corpus.docsWithNoAuthoredScenarios` 48 of 51, against `corpus.derivedScenarios` 481. Of those 24, twelve are in checkbox.md, eleven in switch.md and one in the extension doc extensions/Button.analytics.md. So for almost every component the only tests that exist are the ones `deriveBehavior` (tools/parse.ts) writes from the schema: `renders`, one `renders-<prop>-<value>` per enum value, `has-accessible-name`, `control-is-focusable`, `error-is-identified`, and an escape-closes scenario for a component with an `overlay` block. Nothing asserts that pressing a Button fires `onPress`, that a disabled one does not, or that typing in an Input reports the change. Job 600 made the clause vocabulary a type (`whenClause`, `thenClause`, `behaviorScenario` in schema/component.ts), job 601 made the derived scenarios valid schema data, and job 624 added `componentExample`. This job spends that: the model cannot invent a clause key, because the schema rejects one.

## Your twelve components

`site/src/content/docs/components/` — **icon.md, text.md, heading.md, stack.md, box.md, container.md, card.md, divider.md, button.md, link.md, input.md, form.md** (Icon, Text, Heading, Stack, Box, Container, Card, Divider, Button, Link, Input, Form). No other component doc may change. Eleven of the twelve have no authored scenario today; button.md's one scenario comes from extensions/Button.analytics.md and is not yours to edit.

1. **Read before you write.** For each of the twelve, read the whole doc: the prose (What it is / When to use / When not to use / Accessibility), every prop `description` and `a11y` string, `a11y.requires`, `copy`, `events`, `anatomy`, `composition`, and the `keyboard` block where there is one (Button, Link, Card, Input and Form have none — their keys are the native element's). Write down, per component, the list of things the doc *promises*: an event that fires on an interaction, a state the component reports, a string it renders, an attribute it sets, a focus rule.

   **Author only what the doc already promises.** A scenario must come from the doc's own prose, its keyboard rules, its `a11y.requires`, or its APG pattern. Inventing an interaction the doc does not describe is the failure mode this job exists to avoid. Where the behavior is undefined — the doc does not say whether a `loading` Button still fires `onPress`, say — leave it alone and list it in your summary under "undefined in the doc"; that list is input to phase 5, not a gap you fill by guessing.

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

   Use **scenario-level** `platforms` when the interaction itself cannot happen (`when: { key: Space }` → `platforms: [web, lit]`), and **item-level** `platforms` when only one assertion cannot hold (`{ state: invalid, is: true, platforms: [web, lit] }`, as checkbox.md does). The parser refuses three of these outright — `when.key` on rn, `then.focusable` on rn, `then.state: invalid` on rn — and says so with the words "narrow platforms to exclude 'rn'". It does **not** refuse `then.focused` on rn or `when.hover` on rn; narrow those yourself. SwiftUI cases are emitted as `@Test(..., .disabled(reason))` and are not counted as skips, so do not contort a scenario for them; leaving a Swift case disabled with its reason is the documented gap.

4. **Derived scenarios stay derived.** Do not hand-author anything `deriveBehavior` already produces: `renders`, `renders-<prop>-<value>` for each enum value, `has-accessible-name`, `control-is-focusable`, `error-is-identified`, `escape-fires-<closeEvent>`. Reusing one of those names silently *replaces* the derived scenario (`mergedBehavior` drops a derived scenario whose name an author used), which loses coverage while the count goes up. After `pnpm check`, confirm no name collides:

       node -e "const j=require('./generated/components.json');for(const e of j){const d=new Set((e.behaviorDerived||[]).map(s=>s.name));for(const s of (e.component.behavior||[])) if(d.has(s.name)) console.log('COLLISION', e.component.name, s.name);}"

   It must print nothing. `corpus.derivedScenarios` in your measure file must equal the value in the most recent earlier `logs/600-measure-*.json`: authoring changes no derived scenario.

5. **Write the scenarios.** In each doc's `component:` block add a `behavior:` list (keep the comment style checkbox.md uses). Names are kebab-case, unique within the doc, and say what happens, not what is set: `click-fires-on-press`, `disabled-does-not-fire`, `external-link-announces-that-it-leaves`. Use `description:` when the name is not enough, especially to quote the doc sentence the scenario comes from.

   A worked before/after, Button. Before: button.md has no `behavior` block; the only tests are the twelve derived ones (`renders`, `renders-variant-primary` … `has-accessible-name`, `control-is-focusable`), none of which presses it. The doc's prose gives `onPress` ("Fired when the button is activated"), the `disabled` prop ("Stays focusable and is announced as disabled"), `type: submit` ("submits the enclosing Form"), `expanded` ("aria-expanded on web") and `iconOnly` with `accessibleName`. After:

       behavior:
         # Authored scenarios; the parser adds renders/enum/accessible-name/focusable ones from the schema.
         - name: click-fires-on-press
           when: { click: container }
           then:
             - { event: onPress }
         - name: disabled-does-not-fire
           given: { disabled: true }
           when: { click: container }
           then:
             - { event: onPress, fired: false }
             - { state: disabled, is: true }
         - name: disabled-stays-focusable
           description: aria-disabled, not the native attribute, so the button stays in the tab order.
           given: { disabled: true }
           then:
             - { focusable: true }
           platforms: [web, lit]
         - name: expanded-is-reported
           given: { expanded: true }
           then:
             - { state: expanded, is: true }
         - name: icon-only-keeps-its-name
           given: { iconOnly: true, accessibleName: 'Open menu' }
           then:
             - { name: 'Open menu' }

   Every part named (`container`) is in `anatomy`; every event named (`onPress`) is in `events`; every prop in `given` is a real prop and the value fits its type; the focus assertion is narrowed because React Native cannot observe focus. checkbox.md and switch.md are the two worked models already in the tree — read both before you write your first scenario.

   Component by component, the promises to look for (confirm each against the doc; do not author one the doc does not make):
   - **Icon** — what `label` does to the accessible name, and what an unlabelled icon is to assistive technology.
   - **Text**, **Stack**, **Box**, **Container** — what `element` changes about the rendered element and its role, and what the doc says a consumer can rely on. If a component's doc promises nothing beyond what `renders` and the enum render scenarios already assert, author no scenario for it and say so, with the reason, in your summary.
   - **Heading** — `level` and what it means in the accessibility tree.
   - **Card** — `interactive` and `focusable`, and the heading it renders.
   - **Divider** — `semantic` and `orientation`, and the `label`.
   - **Button** — as above.
   - **Link** — `onPress`, and what `external` adds to the accessible name (`copy.externalSuffix`).
   - **Input** — `onChange` on `when: { type: … }`, `onFocus`/`onBlur`, `error` and `required` and the `copy` keys they render, `disabled`.
   - **Form** — `onSubmit` and `onInvalid`, and the error summary.

6. **`examples`.** Add a `examples:` list to each of the twelve, from `componentExample` in schema/component.ts: `name` (kebab-case, unique in the doc), `description` (one sentence, what the example shows), `given` (a record of props; every key a real prop and every value fitting its type and, for an enum, one of its declared values), and optional `platforms` (a subset of the ones the component declares). Two to four per component, each a distinct use the doc's prose already names — the variants in "When to use", the states the Accessibility section calls out — not a restatement of the defaults. Include every `required` prop, because the example is a thing that gets rendered. An example that sets a deprecated prop or value raises a warning through `componentWarnings`; none of these docs has a deprecation today, so `generated/parse-warnings.json` must gain nothing from this job.

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
    node logs/600-baseline.mjs --out 641

`node --import tsx tools/behavior_tests.ts` rewrites `generated/behavior/` and the committed Swift cases under `packages/swiftui/Tests/DesignSchemaTests/Generated/`; keep both. That directory is tests, not `packages/*/src`, so writing there is expected — `pnpm gates:behavior:check` is exactly the check that what is committed matches the docs, and it fails if you skip the write step. The React, Lit and React Native suites are **not** run by this job: they need browsers. Generating plus `pnpm test:tools` is the proof.

In `logs/600-measure-641.json`: every step exits 0 except `generateCheck` (doc edits stale the prompt hashes; `pnpm generate:check` fails until phase 4, which is expected), and `vsBaseline.lockedBindingsNoLongerLocked` is empty. Then this job's own proof:

- `corpus.authoredScenarios` has risen by the number of scenarios you wrote, and every one of the twelve components above has at least one authored `behavior` scenario and at least one `examples` entry — or is named in your summary with the doc's own words explaining why it has no authorable interaction.
- `corpus.docsWithNoAuthoredScenarios` has fallen by exactly 11, from 48 to 37 (button.md already counts as authored through its extension).
- `corpus.derivedScenarios` is unchanged, and the collision check in step 4 prints nothing.
- `behavior.skips` is **not above 19** and `behavior.skipFiles` not above 13, the values in `logs/600-measure-629.json`. Report both before and after. The 19 that exist are all derived and none is yours to fix: seven are Tooltip on React Native, and twelve are `has-accessible-name` on DatePicker, Landmark, SidePanel and Stepper, whose `a11y.role` is `none` or comes from a prop — fixing those means changing `a11y`, which this job may not touch.
- Count per component and paste the table into your summary:

      node -e "const j=require('./generated/components.json');const own=['Icon','Text','Heading','Stack','Box','Container','Card','Divider','Button','Link','Input','Form'];let t=0;for(const e of j){const c=e.component;if(!own.includes(c.name))continue;const b=(c.behavior||[]).length,x=(c.examples||[]).length;t+=b;console.log(c.name,'behavior='+b,'examples='+x);}console.log('total authored',t)"

- `git status` shows changes only under `site/src/content/docs/components/` (the twelve above), `generated/` and `packages/swiftui/Tests/`.

End your summary with: the per-component table, the before/after of `corpus.authoredScenarios`, `corpus.docsWithNoAuthoredScenarios` and `behavior.skips`, the list of behaviors you found undefined in a doc, and the list of behaviors the vocabulary could not say.

Do not modify `packages/*/src`, `prompts/templates/`, `prompts/conventions/`, `schema/`, `tools/behavior_tests.ts` (unless a genuine bug in it blocks the job — then fix it and say so in the summary), any component doc outside the twelve named above, any extension doc, or any field of a component doc other than `behavior` and `examples`.
