---
title: Website audit, 2026-09-24
description: Second walk of apps/website after jobs 540–546 and 710–719 — overlay examples driven by hand and by script, the WCAG position on dismissing dialogs, and the plan (550–552).
sidebar:
  order: 14
---

Measured against `pnpm dev` on 2026-09-24 in the Claude desktop browser pane at 1280×900 and 375×812. Every example tab on Menu, Dialog, AlertDialog, BottomSheet, SidePanel, ActionSheet, Popover, Tooltip, Select, Combobox, DatePicker and Disclosure was opened from its trigger; Escape was pressed with a real key where a scripted one could be ambiguous. Follows [the first audit](../website-audit/).

## What works now

Dialog (14 examples), AlertDialog (9), BottomSheet (12), SidePanel and ActionSheet open from job 542's harness button and close on Escape; with real key presses focus returns to the button. SidePanel's drawer now slides in (job 543). Tooltip shows on hover and focus and dismisses on Escape. Combobox, Select and DatePicker open from their own field and close on Escape. Popover's 20 non-default examples open and close correctly. The site follows the system dark preference.

## Stuck-open examples

A story whose args say `open: true` on a component that has its own opener gets no harness (`harnessOf` returns `null`), so the page mounts a controlled `open` with nothing wired to change it. Each of these renders open on load and cannot be closed by Escape, an outside click, or its own trigger:

| Component | Examples |
|---|---|
| Menu | Placement Bottom Start, Bottom End, Top Start, Top End — the menu also takes focus when the tab is selected, scrolling the page to it |
| Popover | Default |
| DatePicker | Open |
| Combobox | Open |
| Select | Disabled Open |
| Disclosure | Controlled (cannot collapse) |

Tooltip's four Placement examples also open on load over the example tab row, but they do dismiss. Job 550 fixes all of these by extending the harness to components with their own opener.

## Dismissing dialogs: what WCAG requires

Close, but a little stronger than WCAG. The rules that apply:

- **2.1.2 No Keyboard Trap (A).** Focus that enters a component must be able to leave it by keyboard. A modal dialog traps focus on purpose, so it must offer a keyboard way out. That can be Escape, a close button, *or* the dialog's own answers: a "must be answered" dialog whose Confirm and Cancel both close it passes without an X. A dialog with no operable way out fails.
- **1.4.13 Content on Hover or Focus (AA).** Tooltips and other hover/focus content must be dismissible without moving the pointer or focus (Escape), hoverable, and persistent. Tooltip passes.
- **2.4.11 Focus Not Obscured (AA, WCAG 2.2).** A menu or popover left open over the page can hide the focused element. The stuck-open menus above are a live example.
- **APG dialog pattern (not WCAG).** Escape closes the dialog. That is where "always dismissible" comes from.

The design system already sits on the safe side. Dialog, AlertDialog and BottomSheet report Escape as a close request even when `dismissible: false` ("Escape is the keyboard user's exit"). `dismissible: false` removes only the X and the scrim click, and the doc requires answers in the footer. The site's harness honours that request, which is why the Not Dismissible examples close on Escape. That is correct behaviour, not a bug.

## BottomSheet on wide screens

At 375px the sheet rises from the bottom edge (translateY 176px → 0 over ~300ms) and is anchored full-width to the bottom. Above `layout.maxWidth.prose` it becomes a centred Dialog, because bottomsheet.md says it should ("behaves as a Dialog on wide screens"). On a desktop page the BottomSheet examples are indistinguishable from Dialog's. Decision: a bottom sheet is a sheet at every width, capped at the prose width and centred, top corners rounded, rising from the bottom. Job 551 changes the doc and regenerates the component.

## Current location

The sidebar already computes the current route and puts `aria-current="page"` on the matching link. Visually it is identical to every other link: same colour, weight 400, no indicator. On a page far down the list (BottomSheet, link at y≈1224 in an 876px sidebar) the sidebar opens scrolled to the top, so the current entry is off screen. The header's Docs and About links carry no current state at all. Link's own doc leaves the visual marking to the container, so this is the site's job. Job 552 adds the styling, keeps the group open, and scrolls the sidebar (not the window) to the current entry.

## Plan

| Job | Fixes |
|---|---|
| 550 | Stuck-open examples: a `'state'` harness for components with their own opener; floating panels start closed; `Open` stories dropped from the site; a Playwright guard over every overlay example |
| 551 | BottomSheet is a bottom-anchored sheet at every width (doc change + regeneration on web, Lit, rn) |
| 552 | Current page marked in the sidebar and header, its group kept open, and the sidebar scrolled to it on load |
