# Gaps reported while generating Combobox for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 10:13 — round 1

- Combobox: keyboard spec is internally contradictory — the Home/End entry's action text says 'Alt+ArrowDown/Up jump the list to first/last', but there's also a dedicated Alt+ArrowDown entry saying it 'opens the list without moving the active option'. Implemented the dedicated entry literally (Alt+ArrowDown just opens); did not implement an Alt+ArrowUp binding or a jump-to-first/last behavior for either, since no rule unambiguously specifies it.
- Combobox: 'keydown on the input is forwarded to the Listbox handler so DOM focus never leaves the input' is not literally achievable with Listbox's public API (no controllable active-option prop). Implemented it via dispatching a native, bubbling KeyboardEvent at the mounted Listbox root's DOM node (queued until mount if the popup just opened) — this drives Listbox's own internal active/selection logic exactly as a real keydown would, without moving DOM focus. Verified via type-check only, not manually in a browser.
- Combobox: 'opens the list with no active option' after each filtering keystroke is enforced by remounting the Listbox (via a `key` bump) on every keystroke for `filter` in startsWith/contains/async, since Listbox has no external reset hook for its internal active-option state. Skipped for `filter: none` (nothing is being filtered, so nothing to reset).
- Combobox: for `filter: none`, the spec says typing should 'only move the active option' (a typeahead-style jump-to-match). Not implemented — typing under `filter: none` currently only opens the list and does not relocate the active option; only ArrowDown/ArrowUp move it.
- Combobox: 'Clicking the toggle button opens the full list' is implemented as bypassing the current typed-text filter for that one open (a `forceFullList` flag, cleared on the next keystroke) rather than clearing the typed text itself, since the spec doesn't say the toggle should also clear input text.
- Combobox: chip label truncation ('~20 chars, ellipsis') is implemented via CSS `overflow`/`text-overflow: ellipsis` with no fixed character or width cap (none of the listed style bindings provide one), so truncation only kicks in once flex-wrap/shrink constrains a chip's width, not at a fixed 20-character point.
- Combobox: the custom-entry dedup check (suppressing `copy.addCustom` when typed text already matches an existing option) compares the trimmed, normalized text against both option `value` and `label`; the spec doesn't specify which field(s) to compare against.
- Combobox: initial `inputValue` text for an uncontrolled single-select with a `defaultValue`/`value` is derived by looking up the label from `options`; the schema doesn't say whether the input should show the label on mount versus staying empty until interaction.

## 2026-09-10 18:41 — round 1

- Combobox: keyboard spec is internally contradictory between the Home/End entry's prose ('Alt+ArrowDown/Up jump to first/last') and the dedicated Alt+ArrowDown entry ('opens without moving active option'); implemented the dedicated entry literally, no Alt+ArrowUp binding and no jump-to-first/last.
- Combobox: 'keydown forwarded to the Listbox handler so DOM focus never leaves the input' has no supporting Listbox API for external control; implemented by dispatching a native bubbling KeyboardEvent at the mounted Listbox DOM node (queued until mount).
- Combobox: 'opens with no active option' after each filtering keystroke is enforced by remounting the Listbox via a `key` bump per keystroke (skipped for filter:none, which never filters).
- Combobox: for filter:none, spec says typing should typeahead-jump the active option; not implemented — typing under filter:none only opens the list, ArrowDown/ArrowUp still move it.
- Combobox: 'toggle button opens the full list' implemented as a one-shot bypass of the typed-text filter rather than clearing the typed text, since the spec doesn't say the toggle clears input.
- Combobox: chip label truncation (~20 chars) implemented via CSS ellipsis with no fixed character/width cap, since no style binding defines one.
- Combobox: custom-entry dedup compares normalized typed text against both option value and label; spec doesn't specify which field(s).
- Combobox: initial input text for an uncontrolled single-select with defaultValue/value is derived from the matching option's label; the schema doesn't say whether the input should show the label on mount vs. staying empty.
