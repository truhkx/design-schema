---
title: Backlog triage, 2026-09-23
description: The deferred-work triage of generated/gaps/TOOLING.md and CODE.md — 301 raw entries, 93 distinct issues, with status and evidence for each. The source the ledgers were re-seeded from.
sidebar:
  order: 12
---

Copied verbatim from `logs/backlog-triage.md` (gitignored) by job 719 so the ledgers' seed is committed. Statuses here are as of the triage; the live statuses are in `generated/gaps/TOOLING.md` and `CODE.md`, and the job plan that followed is [Backlog plan](/process/backlog-plan/).
Triaged 2026-09-23 against the working tree at HEAD (`938ceeb`). Status was determined by reading
the repo — tool source, package source, conventions, templates, generated output, `logs/regen.log`
and git history — not by trusting the ledgers' own prose. Neither ledger was edited.

## Headline

| | count |
|---|---|
| Raw entries (`^- ` bullets) | **301** — 202 TOOLING + 99 CODE |
| Distinct underlying issues | **93** — 53 TOOLING + 40 CODE |
| FIXED | **29** |
| OBSOLETE | **5** |
| OPEN | **59** |

The 3.2× compression is not evenly spread. The *fixed* issues are the mass-duplicated ones: the
unscoped Storybook gate alone accounts for ~20 raw entries, stale doc comments and mis-wired
composed children for ~20 more, `packages/rn/src/FormContext.tsx` was filed **four separate times**
on four different dates. By raw-entry weight roughly **130 of 301 entries (43%) are already
resolved**. The open issues are mostly singletons or small families — but three of them are
structural in `tools/behavior_tests.ts`, which has not been touched since `68c489f` (2026-09-20,
*before* the Controls-phase fold), so every behavior-harness complaint logged from 2026-09-21
onward is open by construction.

Ledger dates matter for reading the rest of this: the big regeneration ran 2026-09-21 → 09-22
(`cae9013` … `8202d54`). Entries dated 09-16 / 09-17 describe **pre-regen** code and were largely
swept by the regen itself. Entries dated 09-21 / 09-22 are **post-regen** observations and are
mostly still true.

---

## A. Tooling issues

### A.1 Gates and the repair loop

| # | Issue | Raw | Status | Evidence |
|---|---|---|---|---|
| T1 | Repair loop hands every component round the **whole-Storybook** axe / keyboard verdicts; clean components sent back for other components' failures; rounds 2–3 repeat identical logs | ~20 | **FIXED** | `tools/checks.ts:106-131` — axe scoped by `DS_GATE_COMPONENT`, keyboard-run by a per-component spec filter. `tests/gates/axe.spec.ts:15,43` filters `index.json` and hard-fails a typo. Memory note: Core went $12.66 → $1.51 per target, 0% → 100% passing |
| T2 | `keyboard-run` exits 1 on "No tests found" for a component with no `keyboard` block (Button, Card, Form, Link) | 1 | **FIXED** | `tools/checks.ts:120-124` — the gate is added only when the spec file exists on disk, and then with `--pass-with-no-tests`. Covered by `tools/__tests__/checks.test.ts:68,74` |
| T3 | Keyboard gate rooted at `getByRole('<a11y.role>')`, which for a **leaf control** role *is* the root (Slider, Search: 0 focusables, `focusIndex` −1 forever) | 1 (+3 Slider rounds) | **FIXED** | `tools/keyboard_tests.ts:96` `LEAF_CONTROL_ROLES = ['searchbox','slider']`, used at `:100` |
| T4 | Keyboard walker never followed `<slot>` assignments; every slotted Lit overlay measured on shadow-side controls alone | 1 (+ Dialog/BottomSheet rounds) | **FIXED** | `tools/keyboard_tests.ts:158-174` — flat-tree walk following `assignedElements({flatten:true})`. Self-recorded: keyboard-lit 65/30 → 72/23 |
| T5 | Gate's `beforeEach` precondition shared the 5s expect timeout with a cold Vite compile; failed whole files, blamed on whichever component was generating | 1 | **FIXED** | `tools/keyboard_tests.ts:249,270` — `toBeVisible({ timeout: 15_000 })` with the reason in the comment |
| T6 | **`FOCUSABLE` selector counts elements that are not tab stops** — `button:not([disabled])` matches a `tabindex="-1"` chevron (Tree: `End`/`ArrowUp`/`Home` land on a chevron), `input:not([disabled])` matches Slider's hidden form inputs, and there is no `[role="treeitem"]` so Tree's four arrow rules compare indices over one treeitem | 3 | **OPEN** | `tools/keyboard_tests.ts:150` — selector unchanged; only `[data-focus-sentinel]` was added |
| T7 | `focus-unchanged` is vacuous when the root has no focusable descendants (before and after are both −1) | 1 | **OPEN** | `tools/keyboard_tests.ts:120` still `focusIndex(...)`, scoped to root |
| T8 | Keyboard spec pins its subject with `.first()`, which re-resolves after a dismissal and promotes the next instance (Toast) | 1 | **OPEN** | `tools/keyboard_tests.ts:101-102` — both branches end `.first()` |
| T9 | Harness cannot focus an activedescendant composite whose root **is** the focusable element (Combobox: `root = getByRole('combobox')` is the `<input>`, which has no element children) | 1 | **OPEN (partly mitigated)** | `focusIndex`/`ariaState` now resolve `aria-activedescendant` (`:193-205`, `:216-228`) and `focusAt` has an option branch (`:181-186`), but `focusables()` (`:158`) still walks `el`'s children and `combobox` is not in `LEAF_CONTROL_ROLES` |
| T35 | Axe gate checks only each story's first render; states reached by interaction (Form's error summary) are never tested | 1 | **OPEN** | `tests/gates/axe.spec.ts:56-76` — one `goto`, one `analyze()`, no play function |
| T34 | Axe gate ran against a Storybook built *before* the round's edit | 1 | **FIXED** | `playwright.config.ts:5-10` starts the Vite dev server (`pnpm --filter … storybook`), not `storybook-static` |
| T33 | Storybook preview did not set the body colour, so bare strings failed dark-mode contrast | 1 | **FIXED** | commit `451abb7` (2026-09-19) "Storybook's preview sets `color` as well as `background`" |
| T36 | `tools/__tests__/composition-forwards.test.ts` corpus counts go stale after a regen | 4 | **FIXED** | commit `406a250` "re-pin the corpus baselines the regen moved" |
| T37 | Literals gate false positives — duration regex matches prose in a warning string; `fontFamily: '<quote>'` flagged whatever the content | 1 | **FIXED (mostly)** | `tools/lint_literals.ts:44` exempts a quoted custom-property name (`(?!--|var\()`); `:91` exempts durations in imports/stories. A dev warning naming `5000ms` in component code would still fire |
| T57 | Toolbar's Lit keyboard gate red on `Home`, `ArrowLeft`, `End` (`End` → index 6 of 8) | 1 | **OPEN — reclassify as T6** | The roving set and the tabbable set disagree because the overflow control is tabbable but outside the roving order; that is exactly the `[tabindex="-1"]` selector defect |

### A.2 The behavior harness (`tools/behavior_tests.ts`)

**Last modified `68c489f`, 2026-09-20 — before the Controls-phase fold.** Everything below is open unless noted.

| # | Issue | Raw | Status | Evidence |
|---|---|---|---|---|
| T13 | Harness appends **`expect.anything()`** as a trailing event argument, which the "exactly the listed arguments" contract and every single-argument payload forbid | 1 (+ the "53 pre-existing React failures" entry) | **OPEN** | `tools/behavior_tests.ts:365`. Today: **21 assertions across 8 generated files** — Switch 7, Checkbox 6, Slider 6, SegmentedControl 4, RadioGroup 2, Button/Input/Stepper 1 each. `generated/behavior/Stepper.web.test.tsx:37` asserts `onStepSelect("shipping", expect.anything())` against `packages/react/src/Stepper.tsx:209` `onStepSelect?: (id: string) => void`, called at `:349` with one argument |
| T12 | **A part that wraps a composed control is not the control.** The harness resolves `[data-part=X]` and acts on *that element*, so a click lands on the wrapper and `focused:` compares the wrapper to `document.activeElement` | ~6 | **OPEN in the harness; papered over on web** | `tools/behavior_tests.ts:240` (web, `document.querySelector`), `:245` (rn, one `testID`), `:250-256` (lit). Mitigation: `prompts/conventions/web.md` now requires the wrapper to forward a stray press (`if (!button.contains(event.target)) button.click()`) and ActionSheet/Popover/SidePanel/Carousel/Splitter implement it. **rn has no such rule** and RNTL's press bubbles up, not down |
| T14 | **Lit assertions never look at the host.** `then.role`, `then.attribute`, `then.text`/`copy` and `has-accessible-name` all search `el.shadowRoot`, while the Lit convention puts `role`, `aria-label`, `aria-orientation` and `tabindex` on the host | ~5 (+ Tooltip's light-DOM `role="tooltip"`, + ds-button's property label never reaching `shadowRoot.textContent`) | **OPEN — and now self-contradictory** | `tools/behavior_tests.ts:443` (`s.el.shadowRoot!.textContent`), `:457` (`s.el.shadowRoot!.querySelector('[role=…]')`), `:1096` (`root = el.shadowRoot ?? el`). Against `prompts/conventions/lit.md:29`: *"Set `role` and `aria-label` that the accessible-name tests must observe as plain attributes on the host."* Affects Card, Divider, Landmark, Toolbar, ProgressBar, Feed, Carousel, Tooltip, ActionSheet |
| T15 | Lit harness **cannot slot element children** — only a string `children` is appended, so Carousel's slide scenarios run against an empty `<ds-carousel>` and Tooltip's `trigger()` resolves to the `<slot>` | 3 | **OPEN** | `tools/behavior_tests.ts:1080-1084` |
| T16 | Blocked-activation scenarios need `{ force: true }`; the generator emits it **only** when the scenario's own `given` disables the whole component, so a disabled *option / tab / item* still times out on Playwright's actionability check | ~5 | **OPEN** | `tools/behavior_tests.ts:306` — `truthy(pyGet(given,'disabled',null))`. Affects Button, RadioGroup, Menu, Listbox, Tabs, SegmentedControl, Disclosure |
| T17 | **No per-platform role.** Generated rn tests assert the schema's `a11y.role` verbatim: `getByRole('feed')`, `getByRole('separator')`, `getByRole('slider')` where RN 0.87's `AccessibilityRole` has `list` / `adjustable` | 3 | **OPEN** | `schema/component.ts:334` `resolveRole` reads `a11y.role` only; `tools/behavior_tests.ts:196-199` `concreteRole` is platform-blind; no `platforms.<p>.role` field exists |
| T41 | Derived-scenario defects — `has-accessible-name` compares against the wrong prop (Disclosure `summary`, decorative Icon `label`), runs on a *closed* overlay (SidePanel), is skipped for `role: none`, can't target a child input (DatePicker); `error-is-identified` resolves to `anatomy[0]` (DatePicker); `renders-tone-*` carry only `renders: true`; `renders-role-*`/`renders-as-*` merge mismatched args (Landmark); `renders-inset-block-none` vs `renders-insetblock-none` (Box) | ~10 | **OPEN** | Generator unchanged since `68c489f` |
| T42 | Generated Lit test writes a doc prop straight onto the element (`el.role = 'complementary'`), hitting native `Element.role` reflection rather than the declared per-platform rename (`landmark`), so `renders-role-*` passes without exercising the choice | 1 | **OPEN** | `tools/behavior_tests.ts:1085` |
| T25 | **Scenario vocabulary cannot express**: event payload fields, controlled prop changes, `hidden` on a part, focus returning to a trigger, a drag action, "has no role", counts and style values (Toolbar separators/groupGap/size-by-identity), two `role=slider` elements, rn accessibility actions, `focusable: false` on rn, rn `accessibilityValue.text`, a live-region announcement sequence (ProgressBar), focusables outside the component (Alert), structured children (Fieldset), dev warnings, and a defined `copy:` matcher | ~15 | **OPEN** | A real feature backlog. `progressbar.md` now states its boundary explicitly rather than leaving it to be rediscovered — the right pattern for the rest |
| T26 | jsdom / RNTL cannot evaluate the style contract — Container max-width and gutters, SidePanel's breakpoint token, Stepper container queries, Box/Stack/Text style-only bindings, Toolbar's ResizeObserver edge fades, `<dialog>`'s Escape→`cancel`, token-read timings | ~8 | **OPEN (structural)** | Needs a browser gate. `logs/toolbar-repro.mjs` is the existing one-off pattern |
| T49 | rn harness fires `fireEvent.press` on real timers → act() warnings for any `transition` binding; Link's Animated crossfade has no documented pattern | 3 | **OPEN** | — |
| T50 | rn behavior tests cannot query deliberately non-accessible containers or hidden controls — `role="menu"` container, Toast `role: alert`, the Checkbox box, the aria-hidden Stepper indicator, `click: day` resolving to the 18th cell, pressing Buttons by copy label, several nodes per part (Table) | ~6 | **OPEN** | `tools/behavior_tests.ts:245` — one `testID`, one node |
| T51 | No rn key mapping at all: `key: Escape` → `onRequestClose`/`onAccessibilityEscape`, rn `onKeyPress` and accessibility-action paths are untested | 3 | **OPEN** | `tools/behavior_tests.ts:317` throws `Unmappable('when.key: React Native has no keyboard')` |
| T52 | `a-scrim-click-does-nothing` presses a View with no handler and cannot catch a regression to a no-op Pressable | 1 | **OPEN** | — |
| T48 | Behavior-test rollout incomplete: scenarios implied test files the Output section never asked for (ActionSheet, Button, BottomSheet, Checkbox) | 1 | **OBSOLETE** | `generated/behavior/` now carries per-component files on all three platforms and `behavior` / `behavior-run` are gates (`tools/checks.ts:132-140`) |

### A.3 Prompt, template and convention gaps

| # | Issue | Raw | Status | Evidence |
|---|---|---|---|---|
| T23 | **`prompts/conventions/rn.md` has no aria-\* mirror rule** for react-native-web 0.21, which drops `accessibilityState` / `accessibilityValue` | 4 | **OPEN — most expensive item in the ledger** | See §C. The file's Accessibility bullet (`rn.md:15`) never mentions react-native-web dropping state |
| T22 | **rn conventions disagree with the rn package** | ~12 | **PARTLY FIXED** | FIXED: token import path (now `useTheme()`), `ThemeProvider` → `withTheme`, Refs "the root's instance type". **STILL OPEN**: (a) `rn.md` documents `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)` while `packages/rn/src/theme.tsx:100` is `toLineHeight(fontSize: number, multiplier: number)` — **arguments reversed**; (b) `rn.md` still names `TextNestingContext`, the package exports `TextStyleContext` (`packages/rn/src/Heading.tsx:6`, `Icon.tsx:6`); (c) `rn.md` contradicts itself on Icon colour — *Composition* says "pass the foreground token to `Icon`'s `color` prop", *Parts and overrides* says forward to the child's `overrides` |
| T10 | **"a `Keyboard` story ships at least three focusable children"** — unmeetable for AlertDialog (two buttons), single-tab-stop radio groups, roving-tabindex composites, activedescendant composites, components with no `open` (Tree, Feed, Carousel, NumberInput, Search, ProgressBar) | ~10 | **OPEN** | Still stated unqualified in all three templates: `prompts/templates/web.md:25`, `lit.md:23`, `rn.md:25`. Whether `tabIndex="-1"` elements count is still unstated |
| T11 | **The "Declared contracts → Keyboard" section is a filtered view that claims to be complete.** Only rules carrying `given`/`target`/`repeat`/`platforms`/`native` or an array `expect` are rendered — plain rules (ArrowLeft → focus-prev, Home → focus-first) are silently dropped — while the template says "implement the listed rules as written and none the section excludes" | 3 | **OPEN** | `tools/parse.ts:1260-1287` — `RULE_CONTRACT_FIELDS` / `ruleUsesContract` gate every line; `prompts/templates/web.md:48`. SegmentedControl saw 2 of 5, Tabs the two vertical arrows, Carousel and Table only the native Enter/Space rule |
| T18 | Example stories must render "exactly their `given`", but CSF3 merges meta args into every story, and no doc field names the Default story | ~8 | **OPEN** | `prompts/templates/web.md:51` unchanged. Several docs now state theirs in prose ("The Default story is …"); the generator does not read that sentence |
| T27 | Generic prompt rules applied to components they cannot fit — `:focus-visible`, `delegatesFocus`, accessible name, `heading-hierarchy`, `opacity.disabled`, disabled `accessibilityState`, refs, quoted-digit enums, `role: none` + `styles: {}` (FocusScope), Icon's role on the shadow svg | ~10 | **PARTLY FIXED** | The locked-binding/hook contradiction is **settled** — `8622b31`, `tools/check_hooks.ts`, and both conventions files now state "locked closes the override API, not the styling hook". The rest is still unqualified in the templates |
| T28 | "A composed part receives exactly the listed `props`" has **no exception for wiring** (ids, refs, tabindex, copy labels, glyphs, handlers) | 1 | **OPEN** | `prompts/templates/web.md:46` — "add no other" |
| T29 | Controlled-state template says `open` is "uncontrolled from the default otherwise", contradicting every overlay doc whose `open` is controlled only | 1 | **OPEN** | `prompts/templates/web.md:45` |
| T45 | **The generation prompt is written as if generating from scratch** and gives no reconciliation guidance when the component, CSS, stories, tests and index export already exist and largely conform; every regeneration job invents "treat the spec as authoritative, change only contradictions" for itself | 1 | **OPEN** | Applies to every target of every future regen |
| T24 | `FormFieldValue` / `getValue` contract is narrower in the conventions and in code than in `form.md` (`string \| boolean \| undefined` vs `string \| number \| boolean \| string[] \| [number,number]`); the JSDoc is stale on React, rn and Lit | ~5 (TOOLING+CODE) | **OPEN** | `prompts/conventions/web.md` "Form fields" and `rn.md` "Forms" both still say `string \| boolean \| undefined` |
| T19 | Story args that are not data — prose `children`, helper-built values, components, hollow examples | ~4 | **FIXED** | Job 546 (`938ceeb`) evaluates story args at runtime. `$unsupported` markers 57 → **28**, none under `children`, all in 4 files (DataGrid, DatePicker, ProgressBar, Table) and all genuinely functions |
| T20 | Lit snippet publishes the **wrong attribute for a negated boolean property** (`<ds-focus-scope no-trapped>` for a *trapped* scope; Accordion's `no-divided` silently dropped) | 1 | **FIXED** | `tools/docs_snippets.ts:917-921` (commit `99c6708`). Verified in `generated/examples/FocusScope.json`: `trapped:true` → `<ds-focus-scope>`, `trapped:false` → `<ds-focus-scope no-trapped>`, `restoreFocus:false` → `no-restore-focus` |
| T21 | Story parity is keyed by React export name, so a platform-only story cannot exist (Accordion's light-DOM Lit form, Carousel's slotted Lit slides), and the non-example story set is recorded nowhere (Tree's GuidesHidden, LazyLoading, Selectable*) — drifts on the next regen, taking Chromatic baselines with it | 3 | **OPEN** | `tools/docs_examples.ts:532` "The export name, which is how the manifest identifies it" |
| T38 | Under `exactOptionalPropertyTypes` an array/object `shape` string is used verbatim (`abbr?: string`), forbidding an explicit `undefined`; every doc widens by hand | 4 | **OPEN** | No widening in `tools/parse.ts`; the rule is only stated in the conventions. Recurred for Breadcrumb, RadioGroup, Menu, SegmentedControl, Table |
| T39 | `forwards` is a one-to-one map, so one binding cannot reach two targets (Dialog `inset` → Box `paddingBlock` **and** `paddingInline`) | 1 | **OPEN** | — |
| T40 | Schema constants have no generated constant export (BottomSheet `dismissDistance`/`dismissVelocity`/`dragSlop`); "read each constant through its token expression" cannot apply to a `literal-ok` number (DataGrid 160) or a plain value with a unit (Input `longPressDelay: 500 ms`) | 3 | **OPEN** | — |
| T44 | Generated JSDoc takes a prop's whole description, so four platforms' clauses land in one `.d.ts` | 1 | **OPEN (cosmetic)** | — |
| T46 | The react-native-svg web build needs the PEG.js CJS→ESM wrappers; recorded in `packages/rn/.storybook/main.ts` but not in the rn conventions | 1 | **OPEN (low)** | `prompts/conventions/rn.md` has no such note |
| T47 | The Lit digest's stale note that Lit's glyph table predates `tools/icon-paths.json` | 1 | **FIXED** | `prompts/conventions/lit.md` now carries the same `icon-paths.json` bullet as web and rn |
| T54 | Lit anatomy carries `part` attributes although `::part` styling is forbidden; "say whether `part` is emitted at all" | 1 | **OBSOLETE (decided)** | `lit.md:27` emits both `part` and `data-part`; `:11`/`:16` forbid `::part` *styling*. The question is answered |
| T56 | `copy.position` in tabs.md is the first copy entry to use `description`/`platforms`; confirm consumers honour them | 1 | **FIXED (likely)** | Schema-hardening job 630 migrated copy; `pnpm parse` reports 0 errors on the current corpus |
| T55 | The parser's prose-forward check matches any composed child named anywhere in a binding description (mentioning the body Box inside `footerGap` raised a false "Box has no gap binding") | 1 | **OPEN (unverified)** | Would need a `pnpm parse` run to confirm; not run per the constraints |
| T30 | `gap_digest` maps every gap file to `components/<lowercased-name>.md` — wrong for `Pattern.SettingsPage` (really `patterns/settings-page.md`) and for `TEST-FAILURES.md`, which is not a component | 2 | **OPEN** | `tools/gap_digest.ts:115`; `generated/gaps/TEST-FAILURES.md` still present |

### A.4 Fold-session harness limits

| # | Issue | Raw | Status | Evidence |
|---|---|---|---|---|
| T31 | **A fold session cannot run `node logs/*.mjs`** (approval required in both Bash and PowerShell), nor `awk`, a piped `ls`, or a `grep` with alternation — so gap-file staleness was recomputed by hand from `ls --time-style` against `folded.json` **once per phase, eight phases running** | 8 | **FIXED 2026-09-23** — FOLD_ALLOWED_TOOLS / FOLD_DISALLOWED_TOOLS in tools/regen.ts (+ regen.ps1); staleness is `node --import tsx tools/gap_staleness.ts`; dry-run `node --import tsx logs/fold-dryrun.ts [--extra]` | One entry per phase, verbatim. Matches the standing memory note "Sandbox registry lookups". Fix is an allowlist entry, not a code change |
| T32 | A fold session cannot run `node`, `pnpm parse`, the contrast check or `pnpm commit`; the Controls-phase fold was left uncommitted and unvalidated | 1 | **FIXED 2026-09-23** (with T31) | Same family |

---

## B. Code issues (a sibling component's committed code is wrong)

### B.1 Swept by the regeneration — FIXED

| # | Issue (raw entries) | Evidence |
|---|---|---|
| C1 | Stale doc comments naming things that now exist — Menu/ActionSheet, rn Button's `accessibilityState.expanded`/`overflowLabel`, Link's "accepts className because Tree passes one", Dialog/Fieldset's "Stack has no gap override path" (~5) | No hits for "no ActionSheet component", `overflowLabel`, or the Button-hook comments anywhere in `packages/*/src` |
| C2 | BottomSheet consumers passed the old `title` after the rename to `heading` (Combobox, DataGrid, Select, TreeGrid rn) | `packages/rn/src/Select.tsx:643` `heading={label}` |
| C3 | Mis-wired composed children — Table's selection Checkbox missing `hideLabel`, Tree passing `className`/`data-part` to Icon and Link, Feed passing `tabIndex` to Card, Select/Combobox not passing `embedded`/`loading` to ds-listbox, Tabs/Carousel Fragment children, Popover rn ignoring BottomSheet on phones, FocusScope consumers hand-rolling restore instead of `returnFocusTo`, Fieldset's three variants, SidePanel/Landmark, Breadcrumb's part on Link's root, Dialog's part on Button (~12) | `Table.tsx:459,513` `hideLabel`; `Tree.tsx:184` omits `className`/`style`; `Feed.tsx:472` `focusable`; `ActionSheet.tsx:730` `returnFocusTo={openerRef}` |
| C4 | AlertDialog's tone colour set on a wrapper where Icon's own rule wins | `packages/react/src/AlertDialog.css:126-137` now sets `--ds-icon-color` on `.ds-icon` directly, with the reason in the comment |
| C5 | Locked bindings exposed in the overridable union (Checkbox rn `indicatorStroke`, Icon lit `strokeWidth`) | No `indicatorStroke` in `packages/rn/src/Checkbox.tsx`; `packages/lit/src/Icon.ts:37` "`strokeWidth` is locked" |
| C6 | Lit field discovery — fields not setting `data-ds-field`, Form using a tag list, `invalid` never set (3) | 13 Lit files carry `data-ds-field`; `packages/lit/src/Form.ts:81` `FIELD_SELECTOR = '[data-ds-field]'`, `:511-513` handles `data-ds-field="change"` |
| C7 | **`packages/rn/src/FormContext.tsx` stale duplicate — filed 4× on 4 dates** | Only `packages/rn/src/FormContext.ts` exists |
| C19 | React siblings accept and merge `className`/`style` against the package convention (2) | `prompts/conventions/web.md` now states the rule; component props `Omit` both |
| C20 | `demo-brand/src/CtaButton.tsx` lists a locked binding as overridable | No `backgroundHover` in `packages/react/demo-brand/src/CtaButton.tsx` |
| C24 | Story-content defects — Splitter/Box bare strings failing dark contrast, Box meta-args leaking, Tabs' four fixed panels, rn Submitting/disabled contrast (~5) | Folded into the docs and regenerated; the rn round-2 passes in `logs/regen.log` are the evidence |
| C25 | Component a11y structure decided during the run — Feed's live region inside `role="feed"`, Listbox's empty state inside the listbox, Carousel's scrollable region, Splitter's target-size (4 of 5) | `logs/regen.log:2880` records the Feed/Splitter fold decisions; both regenerated in the Streams phase. **The fifth — Tree's roving tabindex — is not a component bug: it is T6** |
| C26 | FocusScope's focusable walker module-private; Toast duplicates it | `packages/lit/src/FocusScope.ts:98` `export function focusableIn(node: Element)` |
| C27 | `composedContains` walked `parentNode`, never crossing a slot | Self-recorded as fixed in the Focus phase; the same `assignedSlot` fix restores BottomSheet, SidePanel, ActionSheet, Popover |
| C29 | `TreeGrid.tsx` (rn) `onColumnResize` object-shaped vs DataGrid's positional | Both now `(column: string, width: number) => void` (`TreeGrid.tsx:132`, `DataGrid.tsx:162`) |
| C38 | Lit Form: one host carries one `data-ds-field`, so a range field cannot register `name-end` | `packages/lit/src/DatePicker.ts:301-384` — a hidden light-DOM `name-end` field child |
| C40 | Lit Carousel's host is the region; `data-part="region"` on the host | Adopted as the Lit precedent (Toast's) — and it is the per-component workaround for T14 |

### B.2 OBSOLETE

| # | Issue | Why |
|---|---|---|
| C22 | Toolbar (lit) reads `--size-target-min`, "which does not exist" | It exists: `packages/tokens/dist/calm-precise/css/tokens.css:114` `--size-target-min: 24px` |
| C23 | Three bulk inventories of axe/keyboard failures across the whole Storybook (634 rn violating elements; web/lit story lists; 18 keyboard specs) | These are whole-Storybook sweeps recorded *before* the gate was scoped (T1). They are the symptom of T1 plus the per-component items, not a separate backlog. Re-derive from a scoped run, do not triage the list |
| C32 | Lit `Dialog.test.ts` `control-is-focusable` fails in browser mode | No such scenario in Dialog's current tests; superseded by the `composedContains` / `focusableIn` fixes. Unverified but dead as written |

### B.3 OPEN

| # | Issue | Status | Evidence |
|---|---|---|---|
| C9 | react-native-web 0.21 drops `accessibilityState` / `accessibilityValue` → missing `aria-*` mirrors, named on ~14 components across 6 entries | **MOSTLY FIXED in code, OPEN for DataGrid** | Switch 5, SegmentedControl 5, Select 12, Combobox 6, Slider 10, Meter 6, Splitter 7, ProgressBar 6, TreeGrid 2 `aria-*` occurrences. **`packages/rn/src/DataGrid.tsx` has 0** (`accessibilityState` only, at `:789`, `:896`, `:985`). The *rule* is still unwritten — see T23 |
| C8 | `FormFieldValue` too narrow / stale JSDoc on React, rn and Lit (`DsFormField.currentValue`) — no numeric, array or range variant; NumberInput/Slider stringify, Combobox comma-joins (4) | **OPEN** | See T24 |
| C17 | Only Input read the Form context's `submitFailed`, so errors don't clear under `validate: submit` | **PARTLY FIXED** | Now read by Checkbox, Input, NumberInput, RadioGroup, Slider. **Still not read by Switch, Select, Listbox, DatePicker, SegmentedControl** |
| C18 | Six overlays pass `data-part="focusScope"` into FocusScope, whose own `data-part="scope"` wins | **MOSTLY FIXED** | AlertDialog `:348`, BottomSheet `:648`, Dialog `:395`, SidePanel `:664` now own the element. **`ActionSheet.tsx:730` and `Popover.tsx:508` still pass it into FocusScope** |
| C10 | rn Icon leaks `importantForAccessibility="no"` onto its `<svg>` as an invalid DOM attribute; the pair produces no `aria-hidden` on react-native-web, so decorative glyphs are not hidden | **OPEN** | `packages/rn/src/Icon.tsx:128,147,178` |
| C11 | rn Tabs panel View has `accessibilityLabel` and no role → a role-less `<div aria-label>`; Patterns/SettingsPage fails `aria-prohibited-attr` | **OPEN** | `packages/rn/src/Tabs.tsx:475-484` — `testID`, `accessibilityLabel`, no `accessibilityRole` |
| C12 | rn `Text` hardcodes `testID="Text"`, takes no `testID` and no layout style, so composites put part testIDs on wrapper Views (2) | **OPEN** | `packages/rn/src/Text.tsx:184` |
| C13 | rn `Button`: no `testID`, no `fill`, cannot leave the focus order, no hold-to-repeat, always applies its own disabled opacity, does not colour its icon slots (3) | **OPEN** | No `fill` prop in `packages/rn/src/Button.tsx`. Carousel's `minTarget` promise cannot be kept without it |
| C14 | Lit `ds-button` / `ds-link` / `ds-input` do not forward host `aria-label` / `aria-description` / `aria-current` / `tabindex` to the inner control (5 entries: Tooltip ×3, SidePanel, Toolbar) | **OPEN** | `ds-button` has no `haspopup`; `ds-link` has no `current`; `ds-select` / `ds-segmented-control` / `ds-search` forward no `tabindex`, so "the Lit toolbar is one tab stop" holds for Buttons only |
| C15 | rn `Link` has no `current` prop, so a native navigation SidePanel cannot mark the current page | **OPEN** | No `current` prop in `packages/rn/src/Link.tsx` |
| C16 | Web `Link` renders an inner `<span data-part="label">` that collides with a composer's own `label` part (2) | **OPEN (latent)** | `packages/react/src/Link.tsx:108`. Tree no longer nests one, so the collision is dormant rather than gone |
| C21 | Sibling `*HeadingLevel` types include the numbers while `Heading`'s own is the string union | **OPEN (cosmetic)** | `Heading.tsx:9` `'1'\|…\|'6'` vs `Card.tsx:27` / `Accordion.tsx:25` `'2'\|…\|'6'\|2\|…\|6` (also Disclosure, Popover, Tree, Feed) |
| C28 | **`packages/lit/src/AccordionTmpSlotted.test.ts` is committed scratch** — fixed `setTimeout` sleeps, `innerHTML` setup | **OPEN** | The file still exists: 38 lines, 3 `setTimeout` sleeps. Its coverage is duplicated at `packages/lit/src/Accordion.test.ts:261` (`describe('ds-accordion with slotted disclosures')`). Delete it |
| C30 | Card writes `role="article"` + `aria-label` on its host whenever `heading` is set; a composer that has to suppress the nested article (Feed on Lit, Card takes `role="none"`) still ships an `aria-label` on a presentational host | **OPEN (harmless, contradictory)** | `packages/lit/src/Card.ts:478-486` — no opt-out |
| C31 | `Box` has no inverse surface value, so Button's Inverse story paints its own decorator on web and Lit — the one place a story styles outside its component | **OPEN** | No `inverse` in `packages/react/src/Box.tsx` |
| C34 | Lit `Select` warns without `name` and always sets `data-ds-field`, even for a control internal to another component's shadow root | **OPEN** | `packages/lit/src/Select.ts:569` unconditional `setAttribute('data-ds-field','')` |
| C37 | Web `Checkbox` always sets `data-ds-field` and registers with FormContext, so Table's selection checkboxes inside a Form are collected as fields; `table.md` says they are not | **OPEN** | `packages/react/src/Checkbox.tsx:316` unconditional `data-ds-field` |
| C35 | Web `Listbox` has no controlled `activeValue` and no exported key handler, so Select dispatches a synthetic `focusin` and Combobox remounts and re-dispatches keydowns; no declared option-id format; tab stop while `embedded`; no option-weight binding (2) | **OPEN (partial)** | `activeValue` and `handleKeyDown` exist but are internal (`packages/react/src/Listbox.tsx:306,439`) |
| C36 | `ds-popover` has no public reposition method, so DatePicker dispatches a synthetic `scroll` on the host; and Popover always focuses its first focusable with no initial-focus element and doesn't re-measure late-laid-out slotted content | **OPEN (low)** | `packages/lit/src/DatePicker.ts:1381` still documents the synthetic dispatch |
| C33 | Lit `Combobox` `statusDebounce` reads `--motion-duration-base`, which a reduced-motion theme zeroes | **OPEN (low)** | `packages/lit/src/Combobox.ts:132` `{ token: '--motion-duration-base', multiply: 2 }` |
| C39 | On Lit, `ds-button` takes its label as a property rendered into its own shadow root and has no default slot, so a copy string never reaches the composer's `shadowRoot.textContent` (ActionSheet's cancel row) | **OPEN** | Same root cause as T14's `then.text` / `then.copy` assertion |

---

## C. The measurement that reframes the backlog

`logs/regen.log` records the rn axe gate failing **dark mode on round 1 of 15 targets**, and passing
on round 2 every single time:

> Carousel · DataGrid · Feed · Listbox · Meter · RadioGroup · SegmentedControl · Slider · Splitter ·
> Stepper · Switch · Table · Tabs · Toast · Tree

Switch.rn: round 1 `$1.702` → total `$6.896` after the forced round 2. Fifteen targets × one extra
opus round ≈ **$50–75 and fifteen wasted generations**, in a single run.

Every round 2 fixed it the same way: add the `aria-*` mirror that react-native-web 0.21 needs
because it drops `accessibilityState`. The components were fixed one at a time — nine of ten
spot-checked now carry the mirrors. **The rule was never written down.**
`prompts/conventions/rn.md` is 26 lines long and still does not mention it.

The ledgers filed this as two unrelated items in two different files:
`CODE.md` 2026-09-18 ("the rn axe gate has 634 violating elements") and `TOOLING.md` 2026-09-19
("the rn conventions digest should require mirroring accessibilityState as aria-*"). Nothing
connects them, and neither carries the cost.

---

## D. Ranked OPEN list

### 1. T23 — no aria-\* mirror rule in `prompts/conventions/rn.md` *(+ C9 for DataGrid)*

**Cost of leaving it:** measured — one wasted generation round on 15 of ~25 rn targets, and it
recurs on every future rn regeneration, forever. It is the single largest line item in the run.
**Cost to fix:** one bullet in a 26-line file, plus the `aria-*` mirror in
`packages/rn/src/DataGrid.tsx` (the only component still missing it).
**Recommendation: do this first.** Fold C9's DataGrid fix in the same pass. While in that file also
fix T22's three errors — the reversed `toLineHeight` arguments, `TextNestingContext`, and the
self-contradiction on Icon colouring — since eight folds flagged them and they are word-level edits.

### 2. T13 — the behavior harness appends `expect.anything()`

**Cost of leaving it:** 21 assertions across 8 committed generated files fail *today*, against code
that is correct. `behavior-run` is a real gate in `tools/checks.ts`, so every job touching Switch,
Checkbox, Slider, SegmentedControl, RadioGroup, Button, Input or Stepper either eats a red gate or
learns to ignore it. Red-by-default gates stop being read, which is how `stale-job-red-log` happens.
**Cost to fix:** either stop appending the argument at `tools/behavior_tests.ts:365`, or make the
schema's `events.*.payload` declare the originating event where web genuinely passes one. The first
is a one-line change plus a regeneration of `generated/behavior/`; the second is a schema decision.
**Recommendation:** stop appending it. The "exactly the listed arguments" contract is the stated
rule; the harness is what breaks it.

### 3. T14 — the Lit behavior harness never looks at the host *(+ T43, C39, C40)*

**Cost of leaving it:** ~9 Lit components (Card, Divider, Landmark, Toolbar, ProgressBar, Feed,
Carousel, Tooltip, ActionSheet) have scenarios that cannot pass however the component is written.
Worse, the repo has now decided **against** the harness: `prompts/conventions/lit.md:29` *requires*
`role` and `aria-label` as plain host attributes. Every future Lit component inherits a broken
`has-accessible-name` on day one, and the workarounds (Carousel's `data-part="region"` on the host,
ProgressBar's argued exemption) accumulate per component.
**Cost to fix:** a host fallback in three places — `thenRoleLines` (`:457`), `thenTextLines`
(`:443`) and `partLocatorBody`'s Lit branch (`:250-256`) — so the probe considers `el` itself before
descending, the way the web locator now considers `document`.
**Recommendation:** do it with #2, in one `behavior_tests.ts` pass.

### 4. T12 + T16 — the harness acts on the part element, and won't force a click

**Cost of leaving it:** ~11 components. Measured examples: Search 2/12 scenarios red, Table 3/20
(web) and 4/19 (rn), Feed's `pressing-show-new-asks-for-the-newer-items` red on web and rn, Menu's
and Tabs' and Listbox's disabled-item scenarios *timing out* rather than asserting. Web is being
papered over per component — `prompts/conventions/web.md` now makes every part wrapper forward a
stray press to the Button it wraps, which is real code in five components carrying the harness's
defect. **rn has no such escape**: RNTL's press bubbles up, so the wrapper View can never receive it.
**Cost to fix:** T12 is "activate the part's first interactive descendant" in one place per platform.
T16 is "emit `{ force: true }` whenever any `given` in the scenario disables the clicked target,
not just the whole component" (`:306`).
**Recommendation:** fix both in the same pass as #2 and #3, then delete the wrapper-forwarding
convention from `web.md` — it is a workaround that will outlive its cause and confuse the next
generation.

### 5. T11 — the Declared-contracts Keyboard section is a filtered view that claims completeness

**Cost of leaving it:** this one costs *correctness*, not just retries. Four components
(SegmentedControl, Tabs, Carousel, Table) each saw a partial keyboard table under a heading that
says "the section wins" and "implement the listed rules and none the section excludes". All four
happened to notice and implement the full schema block — but a generation that trusts the prompt
ships a component missing Home/End/arrow handling, and the keyboard gate will not catch it, because
the gate is derived from the same `keyboard` block the generator was not shown.
**Cost to fix:** either render every rule in `keyboardContract` (`tools/parse.ts:1263`, drop the
`ruleUsesContract` filter for line emission and keep it only for the extra bits), or soften the
template's claim at `prompts/templates/web.md:48`. The first is right.
**Recommendation:** render every rule.

### Runners-up, in order

6. **T10** — "at least three focusable children" in all three templates. ~10 components argued their
   way past it; every one of them cost prompt turns. Qualify the rule: exempt overlays with a fixed
   pair of controls, single-tab-stop composites and activedescendant composites, and state whether
   `tabIndex="-1"` elements count.
7. **T6** — the keyboard `FOCUSABLE` selector. Three defects, one line
   (`tools/keyboard_tests.ts:150`): exclude `[tabindex="-1"]`, exclude `[hidden]` and
   `input[type="hidden"]`, add `[role="treeitem"]`. Fixes Tree's four arrow rules and is the likely
   cause of **T57** (Toolbar's `Home`/`ArrowLeft`/`End`).
8. **T45** — no reconciliation guidance in the generation prompt. Cheap (a paragraph), and it
   applies to *every target of every future regen*, which makes its expected value high even though
   it was reported once.
9. **T31/T32** — a fold session cannot run `node logs/*.mjs`. Reported eight times, once per phase,
   and each time a human-equivalent workaround was invented. An allowlist entry, not code.
10. **T17** — no per-platform role. Blocks Feed, Splitter, Table and Carousel on rn permanently and
    will block every future component whose RN role differs. Needs a schema field
    (`platforms.<p>.role`), so it is the largest of these — worth scheduling rather than squeezing in.
11. **C28** — delete `packages/lit/src/AccordionTmpSlotted.test.ts`. Thirty seconds. It is committed
    scratch with `setTimeout` sleeps and its coverage already lives in `Accordion.test.ts:261`.
12. **C18** — `ActionSheet.tsx:730` and `Popover.tsx:508` are the last two overlays still passing
    `data-part="focusScope"` into FocusScope. Four of six were fixed; finish the set.
13. **C17** — `submitFailed` still unread by Switch, Select, Listbox, DatePicker, SegmentedControl.
14. **T25 / T26** — the scenario-vocabulary and browser-gate backlogs. Real, large, and not urgent.
    The right move is `progressbar.md`'s: have each doc **state its untestable boundary explicitly**
    so it stops being rediscovered, rather than growing the vocabulary speculatively.

---

## E. Two notes on the ledgers themselves

**They are not self-aware.** Six of the eight fold passes recorded, verbatim, that they could not run
`node logs/*.mjs` — and then recomputed gap-file staleness by hand anyway. Meanwhile the ledger's
single largest item (T1, the unscoped whole-Storybook gates) had been fixed on 2026-09-20, the day
*before* the fold passes that kept filing it.

**They lack cost.** Nothing in either file records how often an item bit or what it cost. `logs/regen.log`
has that information, and it completely reorders the list: the item that turned out to matter most
(T23) appears in the ledgers as two low-key entries in two different files, neither cross-referenced.
If the ledgers are kept, an entry should carry the target that hit it and the round it cost.
