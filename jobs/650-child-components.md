**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Grow the child components the composites had to work around. This is phase 5 of site/src/content/docs/process/schema-hardening.md ("Child components grow what composites needed (650)"); read "Rules every job follows", "Measuring a job" and "Phase 5: after the regen" first, then jobs/done/639-migrate-composition-and-slots.md §3 and jobs/done/640-migrate-style-bindings-and-constants.md §7, which hand this job their findings. Phase 4 has run: two full regenerations (2026-09-16 and 2026-09-17) with auto-folds after every phase, leaving **4,684 DOC lines across 161 files** in generated/gaps/ (re-count and quote what you find). The pattern this job closes appears over and over in them: a composite needs something from a child — a prop the child lacks, a value its enum does not offer, a part or seam it does not expose — and, unable to change the child, writes a workaround into its own doc and a paragraph into the gap log. combobox.md:211 says it plainly: "The React Listbox exports no key handler hook and no controlled active option, so today the combobox sets the active option by remounting the Listbox with `initialActiveValue` and re-dispatches ArrowUp/ArrowDown as native keydown on the Listbox root." accordion.md:96 ends a platform note with "(a full-width trigger needs a Disclosure prop)". toast.md:67 and tooltip.md:45 each say Text's "`color` is locked and has no inverse tone", and re-scope a CSS variable instead. You add the contracts; the composites stop working around them.

**Strict mode is job 651, not this job.** Do not remove a migration fallback, do not touch the prose heuristic for accessible names, do not make an optional schema field required. Another writer is drafting 651 concurrently.

## What the corpus looks like today (measured — re-measure and report what you find)

Measured against generated/components.json and logs/600-measure-644.json at the time this prompt was written:

- **51 docs, 1,024 style bindings, 354 of them locked.** logs/600-measure-644.json records `corpus.lockedBindings: 334`; the regeneration's folds added bindings after job 644 ran, so the current number is higher. **Read the latest `logs/600-measure-*.json` and count the corpus yourself — do not trust either number here.** §6 is the invariant that matters.
- **142 composition entries, 92 of them the object form, 141 forwards and 176 passed props.** Every single forward already resolves to an existing, unlocked child binding, and no composition part points at a missing child. That is the line you must hold: §6's proof re-runs the check and it must still come back clean.
- **7 docs declare `parts`, 11 slot parts, 4 default slots** (tools/__tests__/anatomy-parts.test.ts pins those three numbers).
- **34 controlled prop pairs, 25 of them with a `default` prop** (tools/__tests__/controlled-props.test.ts pins both).
- **generated/gaps/CODE.md holds 65 lines and generated/gaps/TOOLING.md 136.** CODE.md is where a sibling component's generated *code* is wrong; several of its lines are really a missing child contract stated from the code side, and those are cited in the worklist. TOOLING.md is about the tools, not the docs — **nothing in TOOLING.md is this job's work**.
- generated/gaps/FOLDS.md records every decision already folded into a doc. Check it before you add anything: several contracts the older gap rounds ask for have already landed (Listbox gained `optionWeight`, Select gained `fontWeight`, Menu gained `anchor`, Checkbox has `hideLabel`, Icon has `color`, Text has `truncate`), and a gap line dated before 2026-09-16 is very likely stale.

Assert what you find and list it. Do not fail a step because a count above moved; quote the number you measured and say so.

## 1. Read first

schema/component.ts (`propDef`, `propControls`, `compositionEntry`, `compositionProp`, `compositionTarget`, `partDef`, `slotDef`, `partKind`, `slotName`, `styleBinding`, `LOCKED_TOKENS`, `LOCKED_BINDING_NAMES`, `lockRule`, `mustLock`, `bindingTokens`, `formDef`, and the checks inside `componentDef.check`); tools/parse.ts (`validate`, `composedDoc`, `composedRequires`, `validateCompositionEntries`, `childLocked`, `checkProseForwards`, `checkUndeclaredFields`, `deriveBehavior`); generated/gaps/CODE.md **in full** (it is 12 KB — read all of it); generated/gaps/FOLDS.md for the component you are about to edit; and generated/gaps/SUMMARY.md **selectively — it is 1.7 MB, so grep it, never read it whole**. The worklist below cites SUMMARY.md by line number and round; re-read each line in place before you act on it, because a fold may have answered it already.

## 2. What counts as this job's work

A worklist item qualifies when **all** of these hold:

1. a composite's doc or a gap line says it needed something from a child and could not have it;
2. the fix belongs in the **child's** doc — a prop, an enum value, a style binding, an anatomy part or a `parts` entry — not in the composite's;
3. the child does not already have it (check generated/components.json, not the gap line, which may predate a fold);
4. it can be stated in the schema. A platform API (a method, a ref, a testID) is a platform note or a code fix, not a schema field, unless you can name the field that carries it.

Everything else is a finding for the summary, not an edit.

## 3. Locking is sacred, and this job is where it would break

Several composites want to influence a child binding that is **locked**. `mustLock` locks a binding whose token is focus- or target-related (`LOCKED_TOKENS`: `color.border.focus`, `color.inverse.focus`, `border.width.focus`, `size.target.*`; `LOCKED_BINDING_NAMES`: `focusRing*`, `minTarget`, `dismissTarget`) or appears in one of the child's contrast pairs.

**A locked binding may not simply be unlocked.** Not by setting `locked: false`, not by renaming the binding off the locked list, not by changing its token to one that does not lock. Where a composite needs to influence a locked child binding, the answer is **a new unlocked binding, or a declared prop** that lets the child realise the value itself — which is exactly the shape of the Text `inverse` tone in §5, where the composites want a colour whose binding is locked and the child grows a *value* instead of an override seam.

If the honest fix for an item would touch a locked binding and you cannot find a prop or a new unlocked binding that serves it, **do not fix it**: leave the composite's workaround in place and list the item in your summary as an owner decision. Two such items are already known and named in §5's "Do not fix here" list.

`vsBaseline.lockedBindingsNoLongerLocked` must be empty and `corpus.lockedBindings` must not fall. See §6.

## 4. What a new field costs elsewhere — check before you write

- **A new enum prop, or a new value on an existing enum prop, derives a behavior scenario.** `deriveBehavior` in tools/parse.ts emits `renders-<prop>-<value>` for every value of every enum prop, so `corpus.derivedScenarios` rises and `pnpm gates:behavior:check` must still pass. Expected; report the before and after numbers.
- **A controlled prop needs its `controls` block** (`{ event, default?, state? }`) and moves the pinned pair counts in tools/__tests__/controlled-props.test.ts (34 pairs, 25 with a default). Update the pins to what you produced; do not loosen the assertions.
- **A new style binding auto-locks** when `mustLock` says so — that *raises* `corpus.lockedBindings`, which is allowed and is not a failure.
- **A new contrast pair changes the contrast gate's count.** `pnpm check` prints `1284 pairs checked, 0 failures` today (quote the line you actually get). If an addition of yours adds a pair, the count moves and **0 failures must hold**; say which pair you added and why. If you did not intend to move it, you added a pair by accident — undo it.
- **A new prop on a child can change what a composite may pass.** `validateCompositionEntries` checks `props` and `forwards` against the child doc, so a composite may now state something it could not before. Adding that one line to the composite is allowed (§5, "the composite half").
- Doc edits stale prompt hashes. `pnpm generate:check` fails from phase 1 onward until the next regeneration; that is expected and is why `generateCheck` is the one non-zero step.

## 5. Worklist — child doc, what to add, who needed it, the evidence

Work the list in this order. For each item: re-read the evidence, check generated/components.json for what the child already has, then either write the contract or record why you did not. **Every item is a claim to verify, not permission.** Record one line per item in your summary even when it gains nothing.

| # | Child doc | What to add | Composite(s) that needed it | Evidence |
|---|---|---|---|---|
| 1 | listbox.md | A controlled active-option prop (`activeValue`, with `controls: { event: onActiveChange }`), stated so a host that keeps focus on its own trigger can drive it; and the option id format the hosts point `aria-activedescendant` at | Select (web, Lit), Combobox (web, Lit), Search | SUMMARY.md:5135 (Select, 2026-09-16 web): "Listbox needs a focus-independent active prop (or a controlled `activeValue`)"; combobox.md:211; listbox.md:292 already promises `handleKey(event)` and `activeValue` to ds-combobox on Lit; CODE.md "Listbox (web): no controlled `activeValue` and no key handler for hosts (Lit has `handleKey`)". 7 SUMMARY.md lines mention `activeValue` |
| 2 | button.md | A `haspopup` prop, so a Button used as an overlay trigger can expose `aria-haspopup` | Menu (Lit), and every composite whose trigger is a Button | SUMMARY.md:3961 (Menu, 2026-09-16 lit): "Button's schema needs a haspopup prop, or the Lit notes should waive them"; menu.md:150 currently waives it ("aria-haspopup and aria-controls are waived here"); CODE.md "Button (lit): no `haspopup` prop … menu.md waives it until Button's schema adds one" |
| 3 | disclosure.md | A prop that makes the trigger span the row (full-width), so a composed row is clickable across its width | Accordion (web, Lit) | SUMMARY.md:61 (2026-09-16 lit) and :72 (2026-09-16 web): "Disclosure would need a prop for it"; accordion.md:96 "(a full-width trigger needs a Disclosure prop)"; accordion.md:181 says the hit area "ends at the summary text rather than spanning the row"; CODE.md "Disclosure (web, lit): no full-width trigger prop, so accordion rows are only clickable over the summary text (found in Accordion)" |
| 4 | link.md | A `current` prop (the current page in a navigation list), declared so every platform has a form — `aria-current` on web and Lit, `accessibilityState.selected` on native | SidePanel (rn), Tree href nodes, Breadcrumb | SUMMARY.md:5260 (SidePanel, 2026-09-16 rn): "Link's schema would need a `current` prop"; sidepanel.md:208 (the `navigation-drawer` example's own `given`) and :236 both say "React Native's Link has no current-page state"; CODE.md "Link (rn): no `current` prop, so a native navigation SidePanel cannot mark the current page" |
| 5 | text.md | An `inverse` value on the `tone` enum, so a child on an inverted surface carries its own colour | Toast, Tooltip | SUMMARY.md:6416 (Toast, 2026-09-16 lit): "Text's schema likely needs an `inverse` tone"; toast.md:67 "Text's `color` is locked and has no inverse tone, so the toast re-scopes the foreground on its own `toast` container"; tooltip.md:45 says the same for the bubble. **`Text.color` is locked** (§3) — the tone *value* is the sanctioned route; do not unlock `Text.color`, and check whether the value needs a contrast pair (§4) |
| 6 | popover.md | An initial-focus seam, following Dialog's `initialFocus` prop as the precedent, so a composite can open with its own element focused | DatePicker (Lit) | datepicker.md:229: "The composed ds-popover focuses its first focusable on open, so DatePicker moves focus to the selected day (or today) after the popover has opened, and asks the popover to reposition once the grid has laid out"; popover.md:177 states the fixed first-control order; CODE.md "Popover (lit): always focuses its first focusable with no initial-focus element, and doesn't re-measure when slotted content lays out after opening (found in DatePicker, lit)". The **reposition** half is a platform API, not a schema field (§2.4) — state it in Popover's platform notes or list it; do not invent a schema field for a method |
| 7 | checkbox.md | A way for a composed Checkbox not to register as a form field | Table (the selection column), Tree | table.md:361 already asserts the contract it cannot keep: "Inside a Form, the selection Checkboxes are not form fields."; CODE.md "Checkbox (web): always sets data-ds-field and registers with FormContext, so Table's selection Checkboxes inside a Form are collected as fields; … Checkbox needs an opt-out". Note `Checkbox.name` is `required: true` today and the doc carries a `form` block (`role: field`) — decide whether the opt-out is a prop or a `form` narrowing, and **if neither fits the schema as it stands, do not force it**: list it |

**The composite half.** You may edit a composite's doc **only** to point a forward or a passed prop at a child contract that now exists, or to correct a sentence that a landed contract made untrue. One case is already known: select.md:138 says "Listbox has no plain option-weight binding to forward into", but Listbox gained `optionWeight` (listbox.md:126, unlocked) in the 2026-09-17 folds. Re-read both and decide whether Select's trigger-value weight genuinely belongs on Listbox's options: if it does, state the forward; if it does not, fix only the stale clause. Say which way you went. Nothing else in a composite's doc changes.

**Do not fix here — list each as an owner decision:**

- **Popover.surface / BottomSheet.surface for DatePicker.** Job 639 handed this over as "Popover would need an unlocked surface hook". Both are locked, and datepicker.md:135 now records that the child's surface "is locked to this same token, so the composed overlay's own surface realises it and an override has no effect" — so the composite may need nothing at all. Unlocking is forbidden (§3) and a parallel unlocked surface binding would let a composite move a surface under locked foreground pairs. **Take no action; put it in the summary as the owner's call.**
- **Button's minimum target for BottomSheet.** SUMMARY.md:599 (2026-09-16 lit) says "Button's schema needs a target binding", but `Button.minTarget` and `Button.touchTarget` are locked on `size.target.*`, and bottomsheet.md:97 already documents a sheet-owned wrapper that raises the target "without changing Button". **Take no action.**
- **Text's `testID` on React Native** — 21 SUMMARY.md lines ("takes no testID"), across Breadcrumb, Stepper, Select, DatePicker and Meter, each wrapping a Text in a View it owns. It is the most-repeated complaint in the digest and it is platform-shaped; `propDef.platforms` could carry it as an rn-only prop. **Do not add it on your own judgement** — report it as the largest single candidate for the next job.
- **A `label` on the form-field registration handle** (form.md's error summary wants "Label: error text"; SUMMARY.md:3129, Form 2026-09-10 rn). `formDef` has no member for it, so this is a schema field — phase 2 shaped, not this job.
- **heading.md's `align`** has a prop and no style binding (SUMMARY.md:3216, Heading 2026-09-16 lit). Child-side, but no composite asked for it. List it.
- Anything whose only home is `packages/*/src`, a generator template or a tool — including every line in generated/gaps/TOOLING.md.

## 6. Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 650

In logs/600-measure-650.json every step exits 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is **empty**. `corpus.lockedBindings` **must not fall** from the value in the latest earlier `logs/600-measure-*.json` — read that file, do not trust a number in this prompt. A new binding that auto-locks may raise it; nothing may lower it. Report the count before and after, and the (empty) `lockedBindingsNoLongerLocked` list.

Then the job's own proof, in the foreground, quoting the last line of each:

    pnpm exec vitest run tools/__tests__/composition-forwards.test.ts tools/__tests__/anatomy-parts.test.ts tools/__tests__/controlled-props.test.ts

    node -e "const c=require('./generated/components.json');const by={};for(const d of c)by[d.component.name]=d.component;let f=0,bad=[];for(const d of c)for(const [p,v] of Object.entries(d.component.composition||{})){if(typeof v==='string')continue;const n=(v.component||'').split('(planned)').join('').trim();const ch=by[n];for(const [pk,ck] of Object.entries(v.forwards||{})){f++;const b=ch&&(ch.styles||{})[ck];if(!b)bad.push(d.component.name+'.'+p+'.'+pk+' -> '+n+'.'+ck+' missing');else if(b.locked)bad.push(d.component.name+'.'+p+'.'+pk+' -> '+n+'.'+ck+' locked');}}console.log('forwards:',f,'unresolved:',bad.length,JSON.stringify(bad))"

    node -e "const c=require('./generated/components.json');let t=0,l=0;for(const d of c)for(const b of Object.values(d.component.styles||{})){t++;if(b.locked)l++;}console.log('bindings:',t,'locked:',l)"

The middle command must print `unresolved: 0 []`: **every forward in the corpus resolves to an existing, unlocked child binding**. It is 141 forwards today; a forward you added raises the number, and that is fine — an unresolved one is not.

`pnpm check` also prints the contrast gate's line, **`1284 pairs checked, 0 failures`** today. Quote the line you actually get. The count moves only if you added or changed a contrast pair, which §4 says to declare and justify; `0 failures` is not negotiable.

`pnpm generate:check` fails until the next regeneration. That is expected and is why `generateCheck` is the one non-zero step. Every child doc you edit stales that doc's prompt hash and the hash of every composite that composes it — list the docs you touched so the regen knows.

## 7. A finished entry, before and after

listbox.md today (the active-option prop, abridged):

```yaml
    initialActiveValue:
      type: string
      description: 'The option that is active when the list first receives focus (Select opens with the selected option active). …'
```

listbox.md after — `initialActiveValue` untouched, one new controlled prop beside it:

```yaml
    initialActiveValue:
      type: string
      description: 'The option that is active when the list first receives focus (Select opens with the selected option active). …'
    activeValue:
      type: string
      description: 'The active option, driven by a host that keeps focus on its own trigger or input and forwards keys (Select, Combobox, Search). Set, it wins over `initialActiveValue` and needs no focus in the list; omitted, the list owns the active option as before.'
      controls:
        event: onActiveChange
```

because combobox.md:211 says the host "sets the active option by remounting the Listbox with `initialActiveValue` and re-dispatches ArrowUp/ArrowDown", listbox.md:292 already promises `activeValue` to ds-combobox on Lit, and `onActiveChange` (listbox.md:93) is the event that reports the change. Nothing in listbox.md's `styles`, `a11y` or `anatomy` moves, and the pinned controlled-pair counts in tools/__tests__/controlled-props.test.ts are updated to what you produced.

By contrast, Toast's want of an inverse foreground is **not** an override seam. `Text.color` is locked, so text.md grows a value, not a binding:

```yaml
    tone:
      type: enum
      values: [default, strong, muted, danger, onAction, inverse]
```

and toast.md:67 / tooltip.md:45 may then say the message Text carries `tone: inverse` instead of re-scoping `--color-foreground`. Check first whether the new value needs a contrast pair, and whether `renders-tone-inverse` (derived, §4) passes `pnpm gates:behavior:check`.

## 8. Do not modify

`packages/*/src` (generated code), `prompts/templates/` and `prompts/conventions/` (both removed from the repository by commit 48ba3ce — do not recreate them), `tools/lint_literals.ts`, any theme or extension doc, and any composite's own doc except the one line §5 allows (a forward or passed prop pointed at a contract that now exists, or a sentence a landed contract made untrue). Do not unlock a binding, delete one, rename one, or change a binding's `token` or `locked` flag. Do not remove a migration fallback or tighten a schema field — that is job 651. Do not add an anatomy part to a composite. Do not add a contrast pair except as §4 requires you to declare and justify.

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use PowerShell or npx, and do not stage or commit. **Run each command bare from the repository root** — no `cd …&&` prefix and no `&&` chain: a compound command is denied and you will not see its result.
