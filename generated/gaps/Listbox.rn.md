# Gaps reported while generating Listbox for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:41 — round 1

- Listbox: on RN there is no generic key-event API on Pressable (the same acknowledged limit Menu documents), so ArrowUp/Down, Home/End, PageUp/PageDown, a-z typeahead, Shift+Arrow and Ctrl/Cmd+A from the keyboard table have no implementation — each row is its own accessibility stop and Enter/Space work through the native 'activate' action with no extra wiring.
- Listbox: `selectionFollowsFocus` describes web arrow-key behavior with no native analogue (no arrow-key browsing to intercept); the prop is accepted and typed for API parity with a dev-only warning when set to false with `multiple`, but has no runtime effect on this platform.
- Listbox: `getValue()` for `multiple` needs to return `string[]`, but the shared `FormFieldValue` type in FormContext.ts was `string | boolean | undefined`. Widened it to `string | boolean | string[] | undefined` (and updated its doc comment) since this is foundational to every Form-registered field, not just Listbox.
- Listbox: `copy.selectedCount` isn't otherwise placed anywhere in the RN anatomy (the docs say 'the surrounding UI' shows it), so I surfaced it as `accessibilityValue.text` on the FlatList when `multiple` and something is selected, to satisfy 'use every copy.* string verbatim' without inventing new UI.
- Listbox: the empty state is rendered as an `accessible` View with `accessibilityRole="list"` and a label combining `label` + `emptyMessage`, approximating the web note 'the list is still focusable so a Combobox user hears "No options"' — there's no Combobox yet to verify this against.
- Listbox: schema gives no icon size token for `optionIcon`/`optionCheck`; defaulted both to Icon's `sm` size to roughly match `font.size.md` body rows.
- Listbox: an `options` array containing only empty groups (group labels with zero options) renders no group headers and falls through to the empty state — not explicitly specified.
- Listbox: `maxVisible` row height is measured from the very first FlatList row per the doc's literal wording ('measured from the first row'), which may be a group-label row rather than an option row if the first item is grouped — group and option rows have different heights, so the resulting maxHeight can be slightly off in that case.
- Listbox: `name` is optional (unlike Input/Checkbox/RadioGroup, which always register). Form registration, `required` validation display, and focus-on-invalid all silently no-op when `name` is omitted, mirroring the schema's optional field.
