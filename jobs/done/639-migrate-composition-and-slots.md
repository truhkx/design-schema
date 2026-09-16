**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Migrate all 51 component docs onto job 612's fields — the composition object form (`{ component, props, forwards }`) and the `parts` sidecar (`kind: element | component | slot`, with per-platform slot names) — and flip job 612's prose-forward warning from a warning to an error. This is phase 3 of site/src/content/docs/process/schema-hardening.md; read "Rules every job follows", "Measuring a job", the Phase 2 table row 612 and "Phase 3: migrate the docs" first, then jobs/done/612-composition-forwards.md, which is the full spec of the fields you are filling in. Jobs 609 to 629 have landed, and by the time you run, so have 630 to 638; read every file as it is now, not as those job prompts describe it.

**One field per job.** In this job only `composition`, `parts`, and the style-binding *descriptions* whose prose those two fields replace may change. No other doc field moves — not `styles` tokens, not `props`, not `a11y`, not platform notes (except where a note's own words are the slot name you are declaring, which you still do not rewrite). If a doc looks wrong in some other way, list it in the summary; do not fix it here.

## What the corpus looks like today (measured — re-measure and report what you find)

- `composition` appears on **33 of 51** docs, **126 entries**, and every single value is still the bare string form. tools/__tests__/composition-forwards.test.ts pins that ("every composition value in generated/components.json comes back unchanged", `expect(composed).toHaveLength(33)`).
- **16** style-binding descriptions mention `overrides.<key>`. Job 612's parser scan (`warnProseForwards` in tools/parse.ts) warns only where the description also names a composed child and the key is not the binding's own name, and against today's corpus that is exactly **2**, both in datepicker.md, out of **194** warnings in generated/parse-warnings.json:
  - `styles.calendarSurface: forwarded to Popover as overrides.surface, but Popover.surface is locked, so no override reaches it`
  - `styles.monthTitleWeight: forwarded to Select as overrides.fontWeight, but Select has no 'fontWeight' binding`
- **33** `type: content` props on **23** components, and **23** components' Lit notes name slots in prose: card.md "named slots `header-actions` and `footer`, default slot for the body", dialog.md "Slots: default (body), `footer`", popover.md "Slots: `trigger` and default", sidepanel.md "Slots `trigger`, default and `footer`", splitter.md "Slots `primary` and `secondary`", button.md "Icons are named slots `leading-icon` / `trailing-icon`".
- **No doc declares `parts` at all.** `partKind` therefore derives `component` for every composition part and `element` for everything else.
- site/src/content/docs/process/extending-components.md still lists `slots` under "## Planned".

Assert what you find and list it. Do not fail a step because a count above moved; quote the number you measured and say so.

## 1. Read first

schema/component.ts (`compositionEntry`, `compositionProp`, `compositionTarget`, `partDef`, `slotDef`, `partKind`, `slotName`, `PART_KINDS`, and the part checks inside `componentDef.check`); tools/parse.ts (`validate`, `composedDoc`, `composedRequires`, `validateCompositionEntries`, `childLocked`, `warnProseForwards`, `warn`, `takeWarnings`); tools/__tests__/composition-forwards.test.ts and tools/__tests__/anatomy-parts.test.ts (the `card()` fixture there is the exact shape you are about to write into card.md); generated/parse-warnings.json; generated/gaps/Accordion.web.md, generated/gaps/Dialog.rn.md and generated/gaps/AlertDialog.rn.md (what the generators did without these fields).

## 2. Composition: the object form

A composition value stays a string unless the doc's own prose says something the object form can carry. Convert an entry to `{ component, props?, forwards? }` only when **all** of these hold:

1. the doc's prose (a style-binding description, the Behavior section or a platform note) states that the parent passes a prop to that child, or that a parent binding reaches the child through its `overrides`;
2. `composition` already has an entry for that part — you may **not** add a new composition part in this job, because a part must be in `anatomy` and adding anatomy is a different field's migration;
3. the child doc really has that prop or binding, and for a forward the child binding is **not** locked (`childLocked`).

Spell `component` exactly as the string form did, `(planned)` suffix included. A `(planned)` child skips the parser checks, so do not state `props` or `forwards` against one.

`props` values are a literal (string, number, boolean) or `{ from: <parent prop> }`. Only write a literal the prose states; never infer a default.

Two parser rules already read `composition` through `compositionTarget`, so both forms reach them: `composedRequires` (the target and `keyboard-operable` halves of `validate`) and the cross-doc form error job 634 moved out of `warnUndeclaredFields` (`composition.<part>: <Component> has 'name' and 'error' props but no form block …`). Converting an entry to the object form must leave both working — if a doc starts failing either after your edit, you changed the component name, not just the shape.

**The 10 forwards the corpus can state today.** These are the descriptions that name a composed child and a child binding that exists and is unlocked — which is exactly why they do not warn:

| Doc | Binding | Composition part → child | `forwards` entry |
|---|---|---|---|
| alert.md | `icon` | `icon: Icon` | `icon: color` |
| alert.md | `iconSize` | `icon: Icon` | `iconSize: size` |
| alertdialog.md | `footerGap` | `footer: Stack` | `footerGap: gap` |
| alertdialog.md | `iconSize` | `icon: Icon` | `iconSize: size` |
| datepicker.md | `monthTitleSize` | `monthSelect: Select`, `yearSelect: Select` | `monthTitleSize: fontSize` on both |
| dialog.md | `footerGap` | `footer: Stack` | `footerGap: gap` |
| fieldset.md | `fieldsGap` | `fields: Stack` | `fieldsGap: gap` |
| tree.md | `labelSelectedWeight` | `label: Text` | `labelSelectedWeight: fontWeight` |
| tree.md | `headingSize` | `heading: Heading` | `headingSize: fontSize` |
| tree.md | `badgeSize` | `badge: Text` | `badgeSize: fontSize` |

Verify each against the child doc before you write it; the table is evidence, not permission. If one does not hold, leave the prose and list it.

**The ones that cannot be stated.** Leave the prose exactly as it is and list each in the summary:

- breadcrumb.md `fontSize` describes a Text that `composition` never mentions, and `text` is not in Breadcrumb's anatomy.
- bottomsheet.md forwards `inset`, `radius`, `partGap` and `footerGap` to Dialog in prose, but Dialog is not one of BottomSheet's composition parts.
- icon.md `size`, icon.md `color` and stack.md `gap` describe `overrides.<their own name>` — the component's own override hook, not a forward. Do not touch them.

## 3. The two warnings in datepicker.md

These are the job's own check, and the docs are what is wrong — not the check. Neither can become a `forwards` entry:

- **`calendarSurface`** → `popover: Popover`, `overrides.surface`. `Popover.surface` is locked, so no override reaches it; `validateCompositionEntries` would reject the `forwards` entry with `composition.popover.forwards.calendarSurface: Popover.surface is locked, so no override reaches it`. The binding itself is **locked and must stay** (it is in the phase 0 baseline's `lockedBindingsList`): do not delete it, do not change its token, do not touch `locked`. Edit only the description so it no longer claims a forward that does not exist, keeping every other fact the sentence carries.
- **`monthTitleWeight`** → `monthSelect`/`yearSelect: Select`, `overrides.fontWeight`. Select has no `fontWeight` binding. Same treatment: keep the binding and its token, drop the forward claim from the description.

Both are contracts a child component owes and does not have yet. Say so in the summary as findings for job 650 ("child components grow what composites needed"): Popover would need an unlocked surface hook, Select a `fontWeight` binding. Do not add either here; child docs are not this job's field.

## 4. Slots: the `parts` sidecar

`anatomy` stays an array of part names. Add `parts` as a **partial** record — declare an entry only where it says something `partKind` does not already derive:

- **Declare `kind: slot`** for an anatomy part that is an insertion point the consumer fills and where the component renders no element of its own. Give it `slot: { default?, prop?, required?, platforms? }`.
  - `default: true` for the unnamed slot (Lit `<slot>`, React and React Native `children`, SwiftUI `content`). At most one per component, and it takes no Lit name.
  - `prop` names the `type: content` prop that fills it. The check requires `prop` to be a `content` prop, and on a component declaring web or rn the resolved name must be a content prop even without `prop`.
  - `platforms` only where a platform's real name differs from what `slotName` derives. `slotName` already gives Lit the kebab-case part (`headerActions` → `header-actions`) and web/rn/swiftui the `prop`. **Do not write a `slot.platforms` entry that merely repeats the derived name** — that is noise, and card.md's `header-actions`/`footer` and button.md's `leading-icon`/`trailing-icon` are exactly the derived names.
  - `required: true` only where the prop is `required: true` today.
- **Do not declare `kind: element`** for parts that are already elements, and do not declare `kind: component` for a part `composition` already names — `partKind` derives both. Declare `kind: component` only where the doc says a part is built from a system component that `composition` does not list, which you cannot fix here, so in practice: not at all.
- **Where a content prop fills an element the component renders itself** — box.md `children` into `surface`, heading.md and text.md `children` into `text`, stack.md and container.md `children` into the container — there is **no slot part**. The part renders an element; the prop fills it. Declare nothing and list the doc as "content prop, no slot part" in the summary.
- **Where a Lit note names a slot but no anatomy part matches it**, leave it and list it. Renaming or adding anatomy is not this field.
- **Behavior scenarios may not name a slot part** in `when.click`, `when.focus`, `when.hover`, `then.focused` or `then.attribute.on` (the check's message: `scenario '<name>' when.click: '<part>' is a slot, which renders no element of its own`). Today's authored scenarios name `container`, `control`, `label`, `description` and `track` on Button, Checkbox and Switch, none of which is a content prop — but re-check after each doc and, if declaring a slot would break a scenario, do not declare the slot: list the conflict instead.

## 5. Flip the check

`warnProseForwards` in tools/parse.ts becomes an error. Rename it to match (`checkProseForwards`), keep it in the parser layer — it reads the child doc, so it must not move into a Zod `.check` — and throw a `DocError` the way the neighbouring checks in `validate` do, `${name(file)}: ` prefix then the message **word for word**:

    styles.<binding>: forwarded to <Child> as overrides.<key>, but <Child> has no '<key>' binding
    styles.<binding>: forwarded to <Child> as overrides.<key>, but <Child>.<key> is locked, so no override reaches it

Both branches throw; nothing about the scan's matching changes (same `PROSE_OVERRIDE` regex, same "names a composed child", same "key is not the binding's own name", same skip for a `(planned)` child). Do not widen or narrow the regex to make a doc pass — fix the doc.

After the flip, `pnpm check` must print **zero** warnings whose message matches `forwarded to .* as overrides\.`, and generated/parse-warnings.json must contain none. The warnings still outstanding belong to phase 3 jobs that have not run yet: **do not run `DS_WARNINGS_AS_ERRORS=1`** in this job — it turns every remaining warning into an error and will fail for reasons that are not yours. Prove your rule is gone by filtering generated/parse-warnings.json (the command is in the gate block below).

## 6. Tests

- tools/__tests__/composition-forwards.test.ts
  - The `describe('the prose-forward warning')` block: each `takeWarnings()` assertion becomes an error assertion with `expectDocError` and the same message text. Keep the negative cases (a free child binding, the binding's own name, an unnamed child, a `(planned)` child) as cases that still parse.
  - **The corpus test that pins the old list** — "over the real docs it finds DatePicker.monthTitleWeight and DatePicker.calendarSurface" — is rewritten in two halves, as phase 3 requires: a temp-doc fixture proving the rule now *rejects* (a Widget whose binding description forwards into a Select-like child that lacks the binding), and a sweep of the real docs asserting the corpus is clean (every doc validates, no warning of this shape).
  - "every composition value in generated/components.json comes back unchanged" now sees object entries. Rewrite it to assert `compositionTarget` round-trips both forms, and to pin what you actually produced: the number of docs with `composition`, the number of object entries, and that every object entry's `forwards` target exists and is unlocked in the child.
- tools/__tests__/anatomy-parts.test.ts: add a corpus test over generated/components.json — every declared `parts` key is in its doc's `anatomy`, every slot part resolves through `slotName` on each platform the doc declares, no two slots collide on a platform, and at most one default slot per component. Pin the counts you produced (docs with `parts`, slot parts, default slots).
- Run the whole suite; a test elsewhere that assumed a string-only `composition` or a `parts`-free corpus is a finding to fix in the test, not in the schema.

## 7. One line in extending-components.md

site/src/content/docs/process/extending-components.md's "## Planned" paragraph still promises `slots` "as a declared extension point on container components". Slots now exist as `parts` with `kind: slot`. Update that clause only — leave `namespace:` and `pnpm ds upgrade` in the planned list, and change nothing else on the page. This is the one non-component doc this job may touch.

## 8. Worklist — all 51 docs, in three buckets

Walk every doc in site/src/content/docs/components/ in alphabetical order and record a line per doc in your summary, even when it gains nothing.

**Bucket A — 33 docs with a `composition` block** (accordion, actionsheet, alert, alertdialog, bottomsheet, breadcrumb, combobox, carousel, datagrid, datepicker, dialog, divider, feed, fieldset, listbox, menu, numberinput, popover, progressbar, search, segmentedcontrol, select, sidepanel, slider, splitter, stepper, table, tabs, toast, toolbar, tooltip, tree, treegrid — confirm the list from generated/components.json rather than trusting this line). For each entry: does the doc's prose state a passed prop or a forward? If yes and §2's three conditions hold, write the object form. If no, leave the string.

**Bucket B — 23 docs with `type: content` props** (alert, bottomsheet, box, button, card, carousel, container, dialog, disclosure, fieldset, focusscope, form, heading, landmark, popover, sidepanel, splitter, stack, table, tabs, text, toolbar, tooltip). For each content prop: is there an anatomy part that is a pure insertion point? If yes, declare the slot part. If no (§4's element case), declare nothing and say why.

**Bucket C — checkbox, icon, input, link, meter, radiogroup, switch.** No content prop, no composition entry. Nothing to migrate; confirm each and say so in one line.

## 9. A finished entry, before and after

card.md today (anatomy and the three content props, abridged):

```yaml
  anatomy: [surface, header, heading, headerActions, body, footer]
  props:
    children:
      type: content
      required: true
      description: The body. Usually a Stack of Text and controls.
    headerActions:
      type: content
      description: Controls at the end of the header row — a ghost icon-only Button, a Link. At most two.
    footer:
      type: content
      description: The action row. Buttons in a row, primary first, following Form's action-order rule.
```

card.md after — `anatomy` and `props` untouched, one new `parts` block:

```yaml
  parts:
    body: { kind: slot, description: The card body., slot: { default: true, prop: children, required: true } }
    headerActions: { kind: slot, slot: { prop: headerActions } }
    footer: { kind: slot, slot: { prop: footer } }
```

No `slot.platforms` anywhere: `slotName` already resolves `body` to `''` on Lit and `children` on web, rn and SwiftUI's `content`, and `headerActions`/`footer` to `header-actions`/`footer` on Lit and the prop names elsewhere — which is exactly what card.md's Lit note already says. `surface`, `header` and `heading` gain nothing: `heading` is derived `component` if `composition` names it, the others are elements.

datepicker.md, one composition entry:

```yaml
    monthSelect: Select
```

becomes

```yaml
    monthSelect: { component: Select, forwards: { monthTitleSize: fontSize } }
```

because datepicker.md's own `monthTitleSize` description says it is "Forwarded to the month and year Selects as `overrides.fontSize`", `Select.fontSize` exists, and it is not locked. `monthTitleWeight` gets no `forwards` entry — §3.

## 10. Gate — all must pass

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 639

In logs/600-measure-639.json every step exits 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. Locking is sacred: this job renames no binding and deletes none, so `corpus.lockedBindings` must come back **unchanged** at 334 (the value in the latest earlier logs/600-measure-*.json — read it, do not trust this number). If it moved, you deleted or renamed a binding: undo that and report.

Then the job's own proof, in the foreground, quoting the last line of each:

    pnpm exec vitest run tools/__tests__/composition-forwards.test.ts tools/__tests__/anatomy-parts.test.ts
    node -e "const w=require('./generated/parse-warnings.json');const m=w.filter(x=>/forwarded to .* as overrides\./.test(x.message));console.log('rule warnings:',m.length,JSON.stringify(m));console.log('total warnings:',w.length)"
    git diff --stat -- site/src/content/docs/foundations/spec-sheet.md

The middle command must print `rule warnings: 0 []`, and the total must be **2 fewer** than the 194 you started from — no other rule's warning may disappear or appear. The spec sheet is regenerated by `pnpm check`; this job touches no token, so its only change is the two datepicker.md description cells you rewrote in §3. Report that diff; any other row moving means you edited a field that is not yours.

`pnpm generate:check` fails until the phase 4 regen. That is expected and is why `generateCheck` is the one non-zero step.

## 11. Do not modify

`packages/*/src`, `prompts/templates/`, `prompts/conventions/`, `tools/lint_literals.ts`, any theme or extension doc, and any component-doc field other than `composition`, `parts` and the style-binding descriptions §2 and §3 name. Do not add or rename an anatomy part, a prop, a style binding or a token. Do not add a composition entry that is not there today. The only non-component doc you may touch is the one clause in extending-components.md.

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use PowerShell or npx, and do not stage or commit.
