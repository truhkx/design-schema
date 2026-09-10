# Gaps reported while generating Search for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 19:25 — round 1

- Search: `name`/`action` are web-only concepts (URL query key / GET navigation target). RN has no navigable form, so both are accepted for API parity but have no runtime effect; a __DEV__ warning fires if `action` is set.
- Search: the web keyboard model has ArrowDown/ArrowUp move a highlight through suggestions while focus stays in the input (aria-activedescendant). Listbox's rows are touch Pressables with no key-event API on native, so arrow-key highlighting has no native equivalent — the same acknowledged limit Combobox/Listbox already document. Suggestion selection is touch-only; Enter always submits the typed query, never a highlighted row.
- Search: the schema never defines an explicit open/closed state for RN's inline (non-overlay) suggestions rendering — only that suggestions 'render below the field in a View'. I inferred suggestions show while the field is focused and `suggestions` is set, and close on blur or on Escape (matching Combobox's own focus/open model), since rendering them unconditionally whenever `suggestions` is set would leave them visible even when the field isn't in use.
- Search: `copy.loading` ('Loading suggestions') must appear verbatim, but Listbox's own `loading` prop always shows its internal 'Loading…' text regardless of `emptyMessage`. Worked around by never forwarding `loading` to Listbox — passing empty `options` and `emptyMessage={copy.loading}` instead — so the verbatim copy renders.
- Search: the web platform notes hide the submit button when `action` is absent, but the schema's general Behavior section states 'The submit button is always rendered.' Followed the latter for RN, since `action`/navigation isn't a native concept and Enter alone may not be reachable from an on-screen keyboard.
- Search: no style binding governs the leading/glyph icon's size scaling with the `size` prop; chose `sm` at `md` and `md` at `lg` as a proportional visual judgment call.
