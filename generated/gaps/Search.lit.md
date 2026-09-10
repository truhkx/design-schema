# Gaps reported while generating Search for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 11:34 — round 1

- Search: platforms.lit.reflect lists `landmark` as the reflected attribute, but the package's own boolean-defaults-to-true rule (like Combobox's `clearable` → `no-clear`) requires a negated attribute since the default is `true`. Implemented as property `landmark` reflected via `no-landmark` (absent = true), contradicting the schema's literal attribute name.
- Search: the `suggestions` prop has no stated activation rule for when the field becomes a combobox. I made it optional/undefined by default and treat 'the prop has been set at all' (including an explicitly empty array, e.g. after a zero-result fetch) as the signal to render role=combobox and the popup with copy.noSuggestions; a plain array defaulting to `[]` would make 'combobox mode' indistinguishable from 'no results yet'.
- Search: the ArrowDown/ArrowUp keyboard rules are gated `when: suggestions`; I gated on the same 'suggestions prop was set' signal above rather than `suggestions.length > 0`, so ArrowDown still opens an empty/loading popup once a caller has opted into suggestions.
- Search: `onClear`'s doc text says it fires 'when the clear button empties the field' (button-specific), but Escape's second action ('otherwise clears the field') has no stated event. I fire `clear` from both the button and Escape-triggered clearing so consumers can observe either; this broadens the literal wording.
- Search: the web platform notes say the submit Button is 'hidden when `action` is absent and the caller only wants Enter', but the lit platform notes and the Tab keyboard rule ('to the clear button ... then the submit button') both imply it is always present/focusable. I always render it (no action-based hiding) for lit.
- Search: no style binding is declared for the gap between the visible label and the field (Input's schema has `partGap` for this; Search's does not). Used a bare `--space-1` token directly, not wired into the overrides system since it isn't in the schema's overridable/locked lists.
- Search: 'choosing one fills the query' doesn't specify whether the suggestion's `value` or `label` becomes the new query text; used `label` (display text), matching `<ds-combobox>`'s commit behavior.
- Search: ArrowUp behavior is only specified 'from the first, back to the input with no highlight'; with no suggestion active yet (e.g. ArrowUp pressed before any ArrowDown), I treat it as already at the top and clear the highlight (no-op) rather than jumping to the last suggestion.
