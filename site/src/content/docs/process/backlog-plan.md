---
title: Backlog plan, 2026-09-23
description: The job plan (710–719) that works through the open items in the deferred-work triage of generated/gaps/TOOLING.md and CODE.md.
sidebar:
  order: 13
---

Source: `logs/backlog-triage.md` (gitignored; job 719 commits a copy beside this page). The triage found 301 raw ledger entries, 93 distinct issues: 29 fixed, 5 obsolete, 59 open. Each open item below was re-checked against the working tree on 2026-09-23 before a job was written for it.

## Already done since the triage

The aria-\* mirror rule in `prompts/conventions/rn.md` (triage #1, T23), the `toLineHeight` argument order and `TextStyleContext` name (T22 a, b), in commit `904d8c7`. rn DataGrid now carries its `aria-*` mirrors (C9). ActionSheet and Popover put `data-part="focusScope"` on a wrapper inside FocusScope rather than passing it in (C18). No jobs are written for these.

## Jobs, in run order

| Job | Triage items | What it does |
|---|---|---|
| 710 | T13 | Behavior harness stops appending `expect.anything()` to event assertions (21 assertions across 8 generated web files, red against correct code). |
| 711 | T14, C39 | Lit harness checks the host before the shadow root for role, text, accessible name and parts, as `lit.md` requires. Unblocks ~9 components. |
| 712 | T12, T16 | Clicks land on the control a part wraps; clicks are forced when any clicked target may be disabled. Retires the web wrapper-forwarding convention. |
| 713 | T6, T57, T7, T8 | Keyboard `FOCUSABLE` counts only real tab stops (Tree arrows, Toolbar Lit Home/End); `focus-unchanged` is no longer vacuous; the spec's subject no longer re-resolves. |
| 714 | T11 | The prompt's Declared-contracts keyboard section lists every rule, not only rules with contract fields. |
| 715 | T10, T45, T28, T29 | The one template edit: a meetable Keyboard-story rule, reconciliation guidance for existing files, a wiring exception for composed parts, controlled-only overlay `open`. |
| 716 | C28, C17, C10, C11, C37, C34 | Delete committed scratch test; `submitFailed` in Switch, Listbox, DatePicker, SegmentedControl; rn Icon `aria-hidden`; rn Tabs panel role; field-registration opt-out. Each folded into conventions. |
| 717 | T31, T32 | Allowlist so fold sessions can run `node`, `pnpm parse` and a committed gap-staleness script. |
| 718 | T17 | Optional `platforms.<p>.role`; `resolveRole` becomes platform-aware; rn roles set on Feed, Splitter, Table, Carousel. |
| 719 | §E, T30 | Ledger entries carry id, status, hit-by and cost; ledgers re-seeded from the triage; gap digest ranks by cost and maps pattern files correctly. |

710 to 712 edit the same file (`tools/behavior_tests.ts`) and should run in order. 715 is the only job that touches `prompts/templates/`, so prompt hashes change once, after 714.

## Deferred on purpose

T25 (scenario vocabulary) and T26 (style contract needs a browser gate) are large and not urgent. The cheaper step is the one `progressbar.md` already takes: each doc states the behaviour it cannot test, at its next edit. The remaining cosmetic items (C21 heading-level types, T44 JSDoc, T46 PEG.js note, C16 latent Link label collision, C30, C31, C33, C35, C36, T38–T40, T21, T24/C8, T18, T27) wait for the ledger format in 719 so they are ranked by cost rather than by date.

## Before committing

The device shell's git reports ~1,190 files changed with line-ending-only diffs (empty with `--ignore-cr-at-eol`). Likely an artifact of reading the Windows checkout from the Linux shell; confirm with `git status` on Windows before any commit, and do not commit it if it shows there.
