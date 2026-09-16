# Gaps reported while generating Search for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 11:30 — round 1

- Search: choosing a suggestion fills the query with `value` (not `label`), since Search's `value`/`onChange` model is a single query string, unlike Combobox's separate id/display-label pair — the doc doesn't say which field lands in the input.
- Search: `action`-driven submission is implemented as fully JS-controlled navigation (`window.location.assign` with `URLSearchParams`) rather than a native `<form method="get" action>` submission, so Enter, the submit button, and choosing a suggestion all share one trimmed-query/empty-guard path (`trySubmit`/`submitQuery`). A literal native-GET-form reading was possible but would have made the three submit triggers behave inconsistently for the empty-query guard and suggestion-fill case.
- Search's `styles` list has no popup surface/border/radius/shadow bindings (unlike Combobox's `popupSurface`/`popupBorder`/`popupShadow`/`popupRadius`), so the suggestions dropdown relies entirely on Listbox's own default look and gets no elevation shadow — flagging in case a shadow was intended but omitted from the schema.
- Listbox's built-in ArrowUp navigation has no way to reach a 'no highlight' state at the top of the list, but the keyboard model requires 'from the first, back to the input with no highlight.' Implemented by intercepting ArrowUp in Search itself (clearing the highlight locally instead of forwarding the key to Listbox) when the current highlight is already the first suggestion.
- The `search` landmark role is applied as a bare `role="search"` attribute on the native `<form>` rather than composing the `Landmark` component — `Landmark` isn't in Search's `composition` map (only Text/Icon/Button/Listbox are), but it is named in 'Related', so this is a judgment call that the landmark role here is a plain attribute, not a composed child.
- No `aria-label` is added to the search landmark itself (distinct from the input's own label) when `showLabel` is false; the doc's 'do not put two search landmarks on a page' guidance was read as implying a single search landmark never needs a distinguishing name of its own.

## 2026-09-10 19:03 — round 1

- Search: choosing a suggestion fills the query with `value` (not `label`), since Search's `value`/`onChange` model is a single query string, unlike Combobox's separate id/display-label pair — the doc doesn't say which field lands in the input.
- Search: `action`-driven submission is implemented as fully JS-controlled navigation (`window.location.assign` with `URLSearchParams`) rather than a native `<form method="get" action>` submission, so Enter, the submit button, and choosing a suggestion all share one trimmed-query/empty-guard path (`trySubmit`/`submitQuery`).
- Search's `styles` list has no popup surface/border/radius/shadow bindings (unlike Combobox's), so the suggestions dropdown relies entirely on Listbox's own default look with no elevation shadow.
- Listbox's built-in ArrowUp navigation has no way to reach a 'no highlight' state at the top of the list; implemented by intercepting ArrowUp in Search itself when the current highlight is already the first suggestion.
- The schema now lists `landmark: Landmark` in `composition`, but the platform note literally specifies `<form role="search" data-ds="Search">` as the landmark element; composing the actual `Landmark` component would force its hard-coded `data-ds="Landmark"` onto the root, breaking the mandatory `data-ds="Search"` testability hook. Kept the bare `role="search"` attribute on the native `<form>` rather than nesting/wrapping with `Landmark`, since the two requirements directly conflict and the hook takes precedence.
- No `aria-label` is added to the search landmark itself (distinct from the input's own label) when `showLabel` is false — the doc's 'do not put two search landmarks on a page' guidance was read as implying a single search landmark never needs a distinguishing name of its own.

## 2026-09-16 09:52 — round 1

- Search: the Guidance web platform notes say the submit Button renders only 'when `action` is set'; platforms.web.notes say it is 'always rendered, on every platform'. Chose always rendered (schema wins).
- Search: Guidance Behavior says 'Enter submits the highlighted suggestion's value', but the `suggestions` prop says choosing one fills the query with its `label` and submits. Chose `label` for Enter, click and onSubmit alike.
- Search: Guidance Behavior says 'The landmark is the composed Landmark (`search`)', but the `landmark` prop says it is role="search" on Search's own form, not a composed Landmark. Chose role on the form; anatomy lists `landmark` and `form` as separate parts but both are the one element, so the root carries data-part="form" only.
- Search: platforms.web.notes give the clear Button `sm` but no size for the submit Button. Chose `sm` for both so the two affixes match and fit inside the field's padding.
- Search: form.discovery is `context`, but the web element is a <form>, so a Search inside a Form component produces a nested <form> (invalid HTML, React nesting warning). Kept the <form> root and registered with FormContext anyway; the doc should say whether Search drops its own form (or the landmark moves to a div) inside a Form.
- Search: form registration gives no validation (no required/invalid props, no messages copy). Registered `validate: () => null` and `getValue` as the trimmed query, omitted when empty.
- Search: Behavior says onSubmit gets 'the trimmed query', but with `action` the native GET sends the raw input value. onSubmit receives the trimmed query; the URL carries whatever is in the input.
- Search: the spec never says whether clearing (clear button / Escape) or filling from a suggestion fires onChange. Chose to fire onChange('') and onChange(label) so a controlled value can follow; onChange is otherwise keystrokes only.
- Search: nothing says when the suggestions list opens other than typing and ArrowDown (not focus or click). Chose typing and ArrowDown only, so the WithSuggestions example renders closed until the user interacts.
- Search: the keyboard gate wants the Keyboard story 'open/present', but Search has no open prop. The Keyboard story renders text (so the clear button shows) plus suggestions, giving input + clear + submit as three focus stops with the list closed.
- Search: no constant for debouncing the live-region count (Combobox has statusDebounce). The count/loading/no-suggestions text is set on every change, undebounced.
- Search: popupBorder is a color binding with no width binding. Used `--border-width-thin` directly for the popup border width.
- Search: no `layer` binding, though the Guidance says the list sits on layer.dropdown. Used `var(--layer-dropdown)` directly, not overridable.
- Search: focus-visible for a pill field — the input is the focused node. The field wrapper draws `focusRingWidth` outline plus `borderFocus` border via :has(.ds-search__input:focus-visible); the input's own outline is removed in favor of it.
- Search: the loading row — platforms.web.notes say pass no options and emptyMessage copy.loading. Did that without Listbox's own `loading` prop (which would show Listbox's 'Loading…' copy instead).
