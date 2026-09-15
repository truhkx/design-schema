---
title: Schema hardening
description: The plan for moving the rules the parser, the gates and the generators enforce by hand into the schema itself, run as the 600-series job queue.
sidebar:
  order: 11
---

Decided 2026-09-14, after six code reviews of the schema against the parser, the gates, the generated code on four platforms, the generators' own gap logs, the theme and naming tooling, and the MCP server.

The schema is the source of truth in name more than in fact. Three things drifted out from under it. The parser enforces a vocabulary the schema never declares: behavior clauses, auto-locking, a dozen cross-field rules, three role lists. The generators logged the same fifteen holes across 51 components, 1,471 lines of them, because the doc could only say a contract in prose. And several rules the schema does state are not honoured by its own outputs: 66 derived scenario names fail its name regex.

The work runs as numbered jobs through `run-jobs.ps1`, in five phases ordered by what must be true before the next can start. The full list with evidence lives in the published job list; this page is what each job prompt cites.

## Rules every job follows

**One field or one rule per job.** A job's diff reads as one idea, and a failure is small. The 520-series jobs are the model: numbered steps, a gate block, a "do not modify" line.

**New fields land optional, with the old form still accepted.** `pnpm check` stays green after every job in phases 1 and 2 without touching the docs. A stricter check arrives with the doc migration that satisfies it (phase 3), or one job earlier as a warning. Phase 1 is the exception by design: its jobs fix the docs they find wrong, because those docs are wrong today.

**The gate block always includes the tool type check.** `pnpm check` omits `typecheck:tools`, so a job can report green with a type error in `tools/`. Every job runs `pnpm check`, `pnpm typecheck:tools`, `pnpm test:tools` and `pnpm mcp:smoke`, then its own proof. Jobs that edit a Zod file run `node --import tsx tools/schema.ts` and keep the regenerated JSON.

**Cite symbols, not line numbers.** Jobs run in sequence and most edit `tools/parse.ts`; a line number from the review is wrong by the second job. Prompts name functions (`validateBehavior`, `deriveBehavior`, `rootLocator`).

**Keep message text when a rule moves.** When a check moves from the parser into the schema, its message stays word for word, so the test diff shows relocation rather than rewording.

**`packages/*/src` and `prompts/templates/` belong to other steps.** Generated code is the generator's; templates change in exactly one job (625), so prompt hashes flip once for all of phase 2 instead of sixteen times. A newly real test that fails against committed generated code is a finding for the regen, not a job failure.

**Prompt hashes go stale and that is expected.** A generated prompt is template plus frontmatter plus derived scenarios. Any doc edit stales that doc; job 601 stales everything. `pnpm generate:check` fails from phase 1 onward until phase 4 regenerates. The baseline already had 202 of 207 targets stale.

## Measuring a job

`logs/600-baseline.mjs` runs the verify sweep and records the numbers a regression would move. It ran once on the clean tip (commit `8242118`) and wrote `logs/600-baseline.json`. `logs/` is gitignored, so both files are local to the machine that runs the queue.

Each job ends with `node logs/600-baseline.mjs --out <job>`, which writes `logs/600-measure-<job>.json` and a `vsBaseline` block. Two invariants hold for every job: every step exits 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty, because no job may make an accessibility-bearing binding overridable.

| Baseline, 2026-09-14 | |
|---|---|
| Tool tests | 1,407 passed in 38 files |
| Behavior tests emitted as `test.skip` | 36 in 18 files |
| Derived scenarios, and names failing the regex | 481, 66 |
| Authored scenarios, and docs with none | 24, 48 of 51 |
| Keyboard rules, and rules at `expect: manual` | 186, 106 |
| Locked bindings on focus tokens that are not locked | 20 |

## Phases

| Phase | Jobs | Model | Touches docs | Hashes |
|---|---|---|---|---|
| 0. Baseline | by hand | none | no | none |
| 1. Make the schema true | 600 to 607 | Opus | only where wrong today | 601 flips all |
| 2. New fields, optional | 610 to 625 | Opus | no | 625 flips all |
| 3. Migrate the docs | 630 to 644 | Sonnet | all 51 | every doc |
| 4. Regenerate | `generate.ps1 -Stale` | generator | no | resolves |
| 5. After the regen | 650 onward | Sonnet | as the gap digest says | per doc |

Run each phase as its own queue, because `run-jobs.ps1` takes one model per run, and commit at each phase boundary after the full verify.

## Phase 1: make the schema true

### 600: behavior clauses

`behaviorScenario.given`, `when` and `then` are `z.record(z.string(), z.unknown())`. The vocabulary lives in their `.describe()` prose, in `validateBehavior`, and in `whenLines` / `thenItemLines` in `tools/behavior_tests.ts`, and the three disagree. The description promises `then.attribute`, which throws `Unmappable` on every platform. The gate accepts `then.platforms` per item, which the description never mentions. switch.md uses `when: { set: … }`, which none of them know, so it parses green and skips on three platforms. `focusable: false`, `renders: false` and `name: 'X'` all assert the positive case.

The fix is typed unions both tools import. `when` is exactly one of `click`, `key`, `type`, `focus`, `blur`, `set` (a controlled re-render, which the harness already supports and nothing calls) and `hover` (so tooltip scenarios can run on web and Lit instead of the blanket skip). `then` members each take optional `platforms`; `event` with `with` and `event` with `fired: false` are separate members, so the parser's hand check becomes a type error. Keys use one `keyChord` vocabulary, `KeyboardEvent.key` names with `Space` accepted as an alias, which job 604 then applies to keyboard rules.

### 601: derived scenarios through the schema

`deriveBehavior` builds scenarios by hand. The enum render name interpolates the raw prop and value, so 66 names like `renders-headingLevel-2` fail the regex, and the `derived: true` marker is a key the strict schema forbids. `stampSources` adds `source:` after validation, and the website strips it again before parsing. `accessibleNameProp` finds the accessible-name prop by searching `propDef.a11y` prose for "aria-label".

The fix makes the output valid schema data: `derived` and `source` become optional parser-set fields, derived names are kebab-cased and built through `behaviorScenario.parse`, and `propDef.a11yRole` declares the accessible-name prop, with the heuristic kept as a fallback until phase 5. The proof is a test that revalidates all of `generated/components.json`. Renaming the scenarios changes every prompt's behavior block, so every hash flips; doing it first costs nothing extra.

### 602: lock by token

A binding locks when its token is in a contrast pair or its name starts with `focusRing` or equals `minTarget` or `dismissTarget`. Reading names means the same token locks in one doc and not in the next: 20 bindings on `color.border.focus` or `border.width.focus` are overridable, including the focus border of every text field. The schema's own description omits `dismissTarget`.

The fix exports `LOCKED_TOKENS`, the kept name rule, and `mustLock` from the schema, with contrast matching that expands `{slot}` interpolation the way the contrast checker does. The parser rejects an explicit `locked: false` on a must-lock binding rather than silently flipping it, and extensions use the same predicate. Nothing locked today may become overridable.

### 603: cross-field checks

`validate` and `validateBehavior` implement a dozen rules that read only the component block. schema/naming.ts already shows the pattern for doing that inside Zod 4 with `.check`, which keeps `.shape` intact for the extension schema. Moving the rules there means the site, the website, the MCP server and the parser reject the same doc with the same message.

The job then adds the accessibility invariants nothing checks:

| Declared | Requires |
|---|---|
| `error-identification` | an `error` prop |
| any contrast pair | `contrast-aa` or `contrast-aaa` |
| a pair at `level: AAA` | `contrast-aaa` |
| `target-24px` or `target-44px` | a `size.target.*` binding, or a composed component that declares a target |
| `keyboard-operable` | a keyboard block, a natively focusable role, or a composition entry |
| `apg: dialog-modal` or `alertdialog` | `focus-trap`, `focus-restore`, `escape-dismiss`, `inert-background` |
| an `Arrow*` key | `arrow-navigation` |

About fourteen docs break these today. Each gets the fix its own prose supports: declare what the component does, remove what it does not, and correct an `apg` rather than adding modal requirements to a non-modal popup.

### 604: roles, APG slugs and key chords

`a11y.role` is free text, and three tools keep their own lists of which roles can be queried. text.md declares `text` and landmark.md `landmark`, neither an ARIA role. `apg` is free text too: divider.md and progressbar.md name patterns the APG does not have. Keyboard keys mix `Ctrl+A` and `Control+a`, and Playwright accepts only the second.

The fix is an ARIA 1.2 role enum with exported partitions, a `roleFrom` field for components whose role is an enum prop (Landmark), a `resolveRole` helper every reader calls, an enum of the 30 real APG slugs, and `keyChord` applied to keyboard rules.

### 605: union props and checked defaults

Twelve `value` and `defaultValue` props are typed `string` or `number` while their `shape` is a union, so every consumer that switches on `type` treats a multi-select value as a scalar. Nothing checks a `default` against its `type` or enum `values`. The fix adds `type: union` with `shape` required, and a default check.

### 606: one theme schema

schema/theme.ts is Zod 3 through `astro/zod`, so no tool can import it. schema/theme.schema.json is hand-written, stricter, and carries descriptions and defaults the Zod file lacks; tools/theme.ts validates against the JSON through a 223-line hand-rolled validator that exists for that file alone. schema/extension.schema.json is also hand-written and unchecked.

The fix is one Zod 4 theme schema with `strictObject`, the JSON's descriptions and defaults, and refines for the combinations tools/theme.ts silently ignores (`neutralTint` beside `seed.neutral`, a default mode not in `supports`). tools/schema.ts derives all four JSON files; tools/theme.ts and the MCP theme tools validate with the Zod schema; the hand validator is deleted. The proof is a byte-identical token derivation.

### 607: one platform table

The platform list and the platform-to-package map exist in at least six files, and the MCP server's copy lacks swiftui, so `lookup_code` finds no SwiftUI files. `compose` is in the platform enum and read by nothing. The literal gate already reads Swift and is not run for swiftui. The fix is schema/platforms.ts, imported everywhere, plus a required Lit `tag` and generation that skips `supported: false`.

## Phase 2: new fields, optional

Twenty jobs, each adding a field to the schema, a parser check and gate support, without editing a doc. 609 comes first and adds no field: it gives the parser the warning channel every later job reports through, since a stricter rule has to land as a warning before phase 3 can flip it. 610 to 625 are ordered by how many components the generators' gap logs say hit each hole. 626 to 628 were added on 2026-09-15 for adopters who already have a design system and need generated components to stay compatible with their existing API; the reviews behind this plan did not cover that. They follow 625 because the naming codemod applies them after generation, so no template reads them.

| Job | Field | What it replaces |
|---|---|---|
| 609 | `componentWarnings` in schema/component.ts; `warn` and `takeWarnings` in tools/parse.ts; `DS_WARNINGS_AS_ERRORS` | no way to report a rule as a warning, so each job would invent one |
| 610 | `eventDef.payload`, `reasons`, `fires`, `cancelable`, `timing`; an event registry | reason enums in prose on 17 components; three RN spellings of `onChange` |
| 611 | `propDef.controls` | value/defaultValue pairing by name; the unimplemented Combobox `open` |
| 612 | composition `props` and `forwards`; anatomy part `kind`, including slots | overrides forwarded to child bindings that do not exist; slots that exist only as `type: content` props and Lit prose |
| 613 | `styleBinding.part`, `state`, `platforms`, per-value `token`, `computed` | invented hover colors; `paddingBlockSm`-style parallel keys; literal multiples |
| 614 | `keyboardRule.given`, `target`, `repeat`, `platforms`, `native`; array `expect` | 106 manual rules; `closes` asserting the root |
| 615 | `form` and `overlay` blocks | three form contracts; three flip strategies |
| 616 | typed `copy` with `params` and plurals | 26 undeclared placeholders; 16 referenced keys that do not exist |
| 617 | per-platform narrowing on requires, values, copy, styles; typed platform notes | reflect lists that contradict the Lit convention |
| 618 | `contrastPair.nonText`, `state`, `surface`, `only` | `large: true` standing in for WCAG 1.4.11 on 49 pairs |
| 619 | `schema/vocab.ts`, `propDef.enumRef`, `type: integer` | five size and six tone value sets |
| 620 | `schema/tokens.ts` token manifest | existence checks on 34 of 390 bindings |
| 621 | typed theme `overrides`; `tuning` block | typeless tokens from misspelled override paths |
| 622 | extension `a11y.contrast`, `defaults`, `omit`, `platforms`, `anatomy` | canonical-doc edits the update path exists to avoid |
| 623 | naming `events` (including per-platform emitted names) and `anatomy` maps; restricted `typePrefix` | renames that ride on `props` by accident; an emitted `onClick` no naming key can reach |
| 624 | `deprecated`, `since` (component, prop, event and value), `examples`, `constants` | literal timings; deprecation only at component level |
| 625 | templates read the new fields | the one template edit |
| 626 | naming `values` | enum values an existing API uses that no naming key can rename |
| 627 | naming `aliases`, emitted as a tool-generated compatibility layer | old names that disappear the moment a rename applies |
| 628 | naming `tokens` | canonical, unprefixed token names an existing system's CSS variables and JS names cannot keep |
| 629 | MCP component graph and support matrix, split out of 624 to keep that job small | an unserved dependency graph |

## Phase 3: migrate the docs

Fifteen jobs on the default model, one field across all 51 docs each, and each flipping its phase 2 check from warning to error as its gate. The last four author behavior scenarios by category, closing the 48-of-51 gap with typed clauses the model cannot invent keys for.

## Phase 4: regenerate

`generate.ps1 -Stale` once, in the order composition implies, then every gate against the phase 0 baseline, then `tools/gap_digest.ts`. The DOC lines that remain are the next round's schema work.

## Phase 5: after the regen

Child components grow what composites needed (650), then strict mode removes every fallback kept for migration, including the prose heuristic for accessible names (651).
