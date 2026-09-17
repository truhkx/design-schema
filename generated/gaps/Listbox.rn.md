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

## 2026-09-10 18:41 — round 1

- Listbox: the existing implementation (already present before this pass) was missing five schema props entirely — invalid, error, embedded, defaultActiveValue, loading. Added all five; index.ts already exported the type surface generically so no export changes were needed.
- Listbox: prop `invalid`'s description says it marks the list invalid 'with copy.invalid', but the schema's own copy block only defines empty/required/selectedCount/loading — no `invalid` string. Followed the established package convention (Input.tsx, Select.tsx both define a local `${label} is not valid.` for this exact case) rather than inventing new wording.
- Listbox: `error`/`required`/`invalid` precedence (error > required > invalid) isn't stated in this component's own doc, only inferred from the Form conventions bullet in the package instructions and mirrored from Input/Select's identical pattern.
- Listbox: `embedded` removes the list's own border/surface/radius but the schema doesn't say whether `listPadding` also becomes the popup's responsibility — kept `listPadding` on the Listbox itself since it's a content-spacing concern, not a surface-chrome one. Also wired `embedded` into Select.tsx and Combobox.tsx, which previously wrapped a non-embedded Listbox in their own bordered popup, doubling the border/radius — a latent bug this prop fixes.
- Listbox: `defaultActiveValue` (and its fallback to first-selected/first-enabled) only pre-highlights that row's active background on mount. RN has no single tab stop for the list (each option is its own accessibility stop, per this component's own platform notes), so there's no real focus target to move programmatically the way `defaultActiveValue` implies on web/Select's popup-opens-with-selection-active behavior.
- Listbox: `loading` shows `copy.loading` in place of the empty message and sets `accessibilityState.busy`; when options are already present and `loading` is also true (a refetch), the FlatList itself gets `busy: true` rather than duplicating the loading text, since the spec only describes loading replacing the *empty* message.
- Cross-component: the schema's derived `has-accessible-name` behavior scenario expects `getByRole('listbox', {name})`, but this component's own RN platform notes mandate `accessibilityRole="list"` (RN has no `listbox` role) — confirmed by a local probe test that the generated behavior test will fail against a spec-compliant implementation. This is a conflict in the source docs, not a gap I could close by deviating from the explicit RN platform notes.

## 2026-09-16 08:21 — round 1

- Listbox: `options.shape` is a recursive union and says 'export the item type as `ListboxOption`' (web does this), but the shape's own `options: ListboxOption[]` reads as the leaf, and RN's Select/Combobox import `ListboxOption` as the leaf; kept `ListboxOption` = leaf, `ListboxGroup`, `ListboxItem` = union. The doc should name the leaf and item types separately for every platform.
- Listbox: `optionSelectedCheck` says both 'rendered only with `multiple`; single-select shows selection by the row fill' and 'always rendered (invisible slot when unselected)', while `optionActiveBackground` says selection is shown by 'check and weight' so active and selected are never confused. No selected-row fill token exists; chose check only with `multiple` (matching web), and single-select shows selection by `optionSelectedWeight` alone, not by a row fill.
- Listbox: `invalid` has no visual binding (no invalid border token); it only renders `copy.invalid` below the list, with precedence error prop → Form error → invalid, matching web.
- Listbox: the `group` anatomy part has no wrapper view on native, since groups are flattened into FlatList rows (a SectionList was not named); only `Listbox.groupLabel` gets a testID, and no `Listbox.group` is emitted.
- Listbox: `form.valueType: string[]` contradicts the web guidance ('getValue returning the array for multiple'); single-select submits a string, multiple a non-empty array or no key.
- Listbox: `emptyState` composes Text but the list container around it must be `accessible` to carry the label, which hides the Text from screen readers; folded the placeholder into the label (`{label}. {placeholder}`), which is a concatenation the copy block doesn't define.
- Listbox: `copy.selectedCount` has one form and no plural variants, so the `Intl.PluralRules` rule has nothing to pick from; used as the multiple list's accessibilityValue text with `{count}` interpolated.
- Listbox: `onActiveChange` has no `fires` list; on native it fires on row focus, hover (react-native-web) and with null on blur of the active row, not on the `initialActiveValue` pre-highlight.
- Listbox: the rules say `disabled` sets accessibilityState plus `disabled`, but the package conventions forbid passing `disabled` to Pressable (it removes focus); followed the package: accessibilityState.disabled plus a press guard.
- Listbox: the focus-visible binding does not say whether the ring may change layout; the `focusRingWidth` border is always reserved (transparent when unfocused), so measured row height is fontSize × lineHeight + 2 × optionPaddingBlock + 2 × borderWidthFocus, not the doc's formula.
- Listbox (conventions digest): the digest shows `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)` but theme.ts's signature is `toLineHeight(fontSize, multiplier)`; followed the code.

## 2026-09-17 11:48 — round 1

- Listbox: the row formula says fontSize × lineHeight but doesn't say whether to round it; I used toLineHeight (rounded), which is also the line height the rows render with, so the computed height matches what's drawn.
- Listbox: `typeaheadReset` is overridable, but native has no typeahead (the platform notes say so), so nothing reads it. It's accepted in the overrides type for parity only.
- Listbox: the spec gives no weight for unselected options (only `optionSelectedWeight`); I used font.weight.regular.
- Listbox: individually disabled options: the spec only says the list's `disabledOpacity` isn't stacked on top of them, which implies they are dimmed but never says so. I dim them with `disabledOpacity` when the whole list isn't disabled.
- Listbox: the spec doesn't say whether a Form-supplied error (form.errors[name]) turns on `borderInvalid`; I treat it as invalid, the same as `error`.
- Listbox: `initialActiveValue` is described only for first focus. Combobox changes it as the user types, so I move the pre-highlight when the prop changes and no row has focus, without firing onActiveChange (consistent with 'never on mount').
- Listbox: the spec doesn't say what a disabled list does on row focus. I still draw the focus border but don't fire onActiveChange or show the active background, because keys, hover and taps are supposed to do nothing.
- Listbox: with `multiple` the list's accessibilityValue is '{count} selected' even at 0. The spec says 'the list's accessibilityValue text is copy.selectedCount' without an exception for zero, and the copy has no plural or zero form.
- Listbox: the 'focus on failed submit' target on native isn't specified (there's no single tab stop); I move accessibility focus to the FlatList.
- Listbox: `valueType: string[]` in the form block conflicts with the single-select string value; I followed the `name` prop description (a string when single, an array with multiple, no key when nothing is selected).
- Listbox: the group label row's padding only covers the block direction (groupLabelPaddingBlock); I reused optionPaddingInline for its inline padding so it lines up with the option labels.
- Listbox: the empty/loading row has no padding binding; I reused optionPaddingBlock/optionPaddingInline so it lines up with the rows.
