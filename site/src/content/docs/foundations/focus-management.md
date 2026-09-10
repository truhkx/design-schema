---
title: Focus management
description: The rules for where keyboard focus goes — into an overlay, around inside it, back out again, and along a list — and the two primitives every component uses to obey them, so focus is never trapped by accident or lost by design.
sidebar:
  order: 4
---

Keyboard focus is the one piece of state a design system cannot leave to each component. A dialog that traps focus but never releases it is a WCAG failure; a menu whose items are all tab stops is a usability failure; a toast that steals focus is both. Every rule below exists in a component doc somewhere; this page is the single statement of them, and the two primitives — FocusScope for confinement, roving tabindex for composites — are how a generated component gets them right without re-deriving them.

## The four movements

**Into.** When an overlay opens, focus moves into it (Dialog: the first control, the title for reading dialogs; AlertDialog: the safe action; Menu: the first item; BottomSheet: first control or title). Nothing else ever moves focus on open: a Toast or an Alert announces and leaves focus where it is. The element that had focus is remembered.

**Around.** Inside a *modal* scope (Dialog, AlertDialog, BottomSheet, ActionSheet on phones), Tab and Shift+Tab cycle among the scope's focusable elements and wrap at the ends; nothing outside is reachable by keyboard, pointer, or assistive technology because the rest of the page is inert. Inside a *composite* (Menu, RadioGroup, the planned Tabs and Listbox), the whole widget is one tab stop and arrow keys move a single roving tabindex among the items; Tab leaves the widget.

**Out.** Escape always exists as an exit from any scope, even one marked non-dismissible (it reports and lets the consumer decide). Activating a menu item, choosing an action, or completing a dialog closes the scope. Tab out of a non-modal composite closes it.

**Back.** When a scope closes, focus returns to the element that opened it — or, if that element is gone, to the next focusable element after where it was. Composites return focus to their trigger. A component that removes the focused element (a dismissed Alert, a collapsed Disclosure) moves focus to the next sensible place first, so focus never falls to `body`.

## Modal scope vs. composite: two different confinements

They look similar and are opposite. A modal scope confines *Tab*: the user can reach everything inside and nothing outside. A composite confines *arrows*: the user reaches one thing (the widget) with Tab and moves inside it with arrows. Mixing them is the classic bug — a menu that traps Tab, a dialog whose fields need arrow keys. The schema tells them apart: `focus-trap` + `inert-background` in `a11y.requires` means a modal scope; `roving-tabindex` + `arrow-navigation` means a composite. A component may be both (ActionSheet on phones: a modal sheet containing a composite menu), in which case Tab cycles within the sheet and arrows move within the list.

## FocusScope

The confinement primitive. It is a component (see [FocusScope](/components/focusscope/)) so it can be composed and tested once, but consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it in their `composition`. It does four things: moves focus in on mount according to `autoFocus`; wraps Tab and Shift+Tab within its focusable descendants when `trapped`; keeps focus inside if something outside tries to take it (a script calling `focus()`, a browser quirk); and restores focus on unmount when `restoreFocus`. It does not make the background inert — that is the overlay's job (native `<dialog>` does it; React Native's `accessibilityViewIsModal` does it) — and it does not handle Escape, which belongs to the component that decides what Escape means.

Nesting is allowed and ordered: the innermost mounted scope owns Tab. Opening a Menu inside a Dialog does not disable the Dialog's scope; the Menu's roving tabindex works within it, and closing the Menu returns focus to its trigger, which is inside the Dialog.

## Roving tabindex

The composite primitive, implemented per component rather than as a wrapper because the item set and orientation are the component's own: one item has `tabindex="0"` (the selected one, or the first), the rest `-1`; arrow keys move the `0` and call `focus()`; Home and End jump; typeahead moves by label where the pattern calls for it; disabled items are skipped. On the web the focused item *is* the highlighted item — `aria-activedescendant` is not used, because moving real focus is what screen readers follow most reliably across the shadow boundary. On React Native, composites have no roving tabindex; every item is its own accessibility stop, which is the platform convention and is recorded as such in each doc.

## What the gates check

The `keyboard` block in a component doc is this page as data: `{ keys: [Tab], from: last, expect: focus-wraps-to-first }`. `tools/keyboard_tests.py` turns every rule with an `expect` into a Playwright test against the component's `Keyboard` story, so a scope that stops wrapping, a menu whose Escape no longer restores focus, or a dialog that lets Tab escape fails the build. The axe gate catches the rest of what is checkable without interaction: names, roles, contrast.

## Platform notes

On the web, a native `<dialog>` opened with `showModal()` provides the inert background and the top layer, but browsers still let Tab reach the address bar from the last element, so FocusScope's wrap is real work, not belt-and-braces. Shadow DOM hides focusable elements from a naive `querySelectorAll`; FocusScope walks shadow roots and slotted nodes. React Native has no Tab order to confine; FocusScope there means `accessibilityViewIsModal` on the surface, `setAccessibilityFocus` on open, and restoring focus to the opener's ref on close.
