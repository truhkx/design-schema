# Gaps reported while generating Search for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 11:30 — round 1

- Search: choosing a suggestion fills the query with `value` (not `label`), since Search's `value`/`onChange` model is a single query string, unlike Combobox's separate id/display-label pair — the doc doesn't say which field lands in the input.
- Search: `action`-driven submission is implemented as fully JS-controlled navigation (`window.location.assign` with `URLSearchParams`) rather than a native `<form method="get" action>` submission, so Enter, the submit button, and choosing a suggestion all share one trimmed-query/empty-guard path (`trySubmit`/`submitQuery`). A literal native-GET-form reading was possible but would have made the three submit triggers behave inconsistently for the empty-query guard and suggestion-fill case.
- Search's `styles` list has no popup surface/border/radius/shadow bindings (unlike Combobox's `popupSurface`/`popupBorder`/`popupShadow`/`popupRadius`), so the suggestions dropdown relies entirely on Listbox's own default look and gets no elevation shadow — flagging in case a shadow was intended but omitted from the schema.
- Listbox's built-in ArrowUp navigation has no way to reach a 'no highlight' state at the top of the list, but the keyboard model requires 'from the first, back to the input with no highlight.' Implemented by intercepting ArrowUp in Search itself (clearing the highlight locally instead of forwarding the key to Listbox) when the current highlight is already the first suggestion.
- The `search` landmark role is applied as a bare `role="search"` attribute on the native `<form>` rather than composing the `Landmark` component — `Landmark` isn't in Search's `composition` map (only Text/Icon/Button/Listbox are), but it is named in 'Related', so this is a judgment call that the landmark role here is a plain attribute, not a composed child.
- No `aria-label` is added to the search landmark itself (distinct from the input's own label) when `showLabel` is false; the doc's 'do not put two search landmarks on a page' guidance was read as implying a single search landmark never needs a distinguishing name of its own.
