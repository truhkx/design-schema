# Gaps reported while generating Form for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:18 — round 1

- Form: the existing implementation predated the overrides contract, `labelledBy` prop, and `data-ds` testability hook — added `overrides?: Partial<Record<'gap' | 'errorSummaryBorder', TokenRef>>` with `--ds-form-gap`/`--ds-form-error-summary-border` hooks (plus locked hooks `--ds-form-error-summary-text`/`-background` for consistency with the Card/Input pattern, not overridable), added `labelledBy` (web platform) rendering `aria-labelledby` and suppressing `aria-label` when both are set, and added `data-ds="Form"` and `data-part="errorSummary"`.
- Form: replaced inline summary heading text with `COPY.summaryHeading`/`summaryHeadingOne` constants per the copy-verbatim convention; behavior is unchanged.
- Form: gap token was hard-coded as `--space-lg` instead of the `layout.gap.loose` preset (`--layout-gap-loose`, matching Stack/Card's `gap` token resolution) — fixed.
- Form: anatomy parts `fields` and `actions` have no dedicated wrapper elements since they are opaque `children` content (Stack-composed by the consumer), so no `data-part` was added for them — only `errorSummary` is a Form-owned element.

## 2026-09-10 17:31 — round 1

- Form: schema anatomy adds `actions` alongside `fields`/`errorSummary`/`container`, but only one `gap` style token governs spacing for all of them ("between fields and between fields and actions"). Kept `children` and `actions` as siblings of the same flex-column root and gave their wrapper divs `display: contents` so the existing single-token gap continues to apply uniformly between every field and before the actions row, matching the Lit implementation's slot-based (non-boxed) layout.
- Form: root landmark role. Spec's `a11y.role: form` plus `aria-label`/`aria-labelledby` are already implied by the native `<form>` element with an accessible name, so no explicit `role="form"` attribute was added (redundant on a native form) — flagging in case an explicit role is wanted for older AT.
- Form: updated packages/react/demo/SignIn.tsx and Preferences.tsx to pass their submit/cancel buttons through the new required `actions` prop instead of embedding them in `children`, since the prop is now mandatory and the old shape would fail to type-check.

## 2026-09-16 04:13 — round 1

- Form: `copy.invalidSummary` ("This form has errors.") has no web use in the spec — the web summary is announced through role=alert with `summaryHeading`, and without a summary focus goes to the first invalid field. Left it as a constant, never rendered.
- Form: `copy.summaryHeadingOne` duplicates `summaryHeading.plural.one`; chose the plural form via Intl.PluralRules and kept summaryHeadingOne unused.
- Form: no locale prop or source for `new Intl.PluralRules(locale)`; used the runtime default locale (undefined).
- Form: the errorSummary part has border, text and background bindings but no padding, radius or border-width binding; used --space-md, --radius-md and --border-width-thin, not overridable.
- Form: 'strong Text' for the summary heading doesn't say which Text prop: weight=semibold or tone=strong. The errorSummaryText binding is foreground.danger, so chose weight=semibold tone=danger.
- Form: summary item links: the spec doesn't say which Link tone to use; chose tone=inherit so the links take the locked errorSummaryText color. Also unspecified: whether clicking one should navigate to the hash or only move focus; chose focus only (onClick returns false).
- Form: spacing between the summary heading and its list isn't specified (no binding); used Stack gap=tight with element=ul.
- Form: the conventions say Form discovers fields by `data-ds-field`, but the schema says `discovery: context`; kept context registration and used the DOM only to sort registered fields into document order by id.
- Form: scenario 'label-names-the-form-landmark' only checks role and name; label vs labelledBy precedence and the submit/invalid flow have no scenarios, so they're only covered by stories.
- Form: the example `given` values (children/actions) are prose descriptions, not args; turned each into concrete Input/Button content (e.g. the 'profile fields' were made up: full name, email, phone, city).
- Form: `label` and `labelledBy` are both optional, so nothing stops a form with no accessible name; no dev warning is specified, so none was added.

## 2026-09-17 04:29 — round 1

- Form: `disabled` says the container 'only exposes the disabled state' (accessibilityState.disabled on RN) but names no web attribute; chose aria-disabled="true" on the <form>, which ARIA 1.2 deprecates as a global on non-widget roles.
- Form: `errorSummaryGap` says the list is a Stack, but a composed child's binding must be forwarded to its `overrides`, so the CSS hook `--ds-form-error-summary-gap` has nothing to read; chose to forward `overrides.errorSummaryGap` to both summary Stacks' `gap` (heading↔list and between items) and emit no CSS hook, so a consumer setting the hook from their own CSS has no effect for this binding.
- Form: `errorSummary` says 'when submission fails validation, render a summary', but under validate: blur/change errors exist before any submit; chose to show the summary only after a failed submit (it then shrinks as fields are fixed and is reset on a successful submit).
- Form: the plural locale comes from 'the nearest lang ancestor' but no timing is given; chose to read it at failed submit time (closest('[lang]') from the form), falling back to the runtime default if Intl.PluralRules rejects the tag.
- Form: summary item order is unspecified; items follow document order at submit, and errors added later by blur/change validation are appended to the end.
- Form: the doc says a field inside a closed Disclosure isn't collected unless `keepMounted`; on web this relies on the unmounted field having unregistered, and Form does no Disclosure check of its own.
- Form: the web platform note says `data-ds-field` sorts fields into document order, but the registration carries the control's `id`, not the field root; chose getElementById(id).closest('[data-ds-field]') and put fields with no such host last, in registration order.
- Form: the value contract widens FormFieldValue to number and [number, number]; this lives in FormContext.ts (shared with fields), which the Form spec doesn't name as an output file.
- Form: examples give children/actions as prose ('A submit Button labelled Sign in'); rendered the actions as a bare Button with no wrapping Stack, although 'When to use' says to place actions in a Stack.
- Form: `name` is 'the base of generated ids' but only the summary id uses it; an unnamed form falls back to useId(), and two forms with the same name would produce duplicate summary ids.

## 2026-09-18 21:20 — round 1

- Form: the errorSummary prop says 'Web and Lit put no disabled attribute on the form element' while the prompt's generic rule says `disabled` uses aria-disabled on the root; the component-specific prose won, and aria-disabled was removed from <form>. The generic rule should exempt containers whose role forbids aria-disabled.
- Form: errorSummaryGap says the list is 'a second Stack (element ul on web and Lit)' but does not say the items must be passed bare because Stack wraps each child in an li; the earlier generation added its own <li> and produced nested list items. Chose bare Link children and relied on Stack's li wrapper; the doc should say so.
- Form: an error entry whose field has since unregistered (e.g. a Disclosure closed after a failed submit) has no field id to link to; the spec only says a closed Disclosure's field is left out at collection. Kept its entry and rendered it as plain danger Text (no Link) until the next validation replaces the errors.
- Form: the 'after a failed submission every mode re-validates on blur and change' rule has to run inside each field (the field decides when to call validateField), but the Form contract (FormContextValue) exposes no 'has failed a submission' flag. Form ignores validateField under validate: submit until a submit has happened; whether a field under validate: change also re-validates on blur afterwards depends on the field, and the doc does not say which side owns that rule.
- Form: examples' `children`/`actions` are prose descriptions rather than args; mapped them to Input/Stack/Button JSX with Stack gap normal, a gap value the example does not specify.
- Form: locked bindings errorSummaryText and errorSummaryBackground still get --ds-form-error-summary-text/-background hooks in CSS (the 'every binding is a hook' rule) while being excluded from the overrides type; the overrides section does not say whether locked bindings should have a consumer-settable CSS hook at all, since that is the documented escape hatch and would let consumers change an accessibility-bearing color.

## 2026-09-18 21:37 — round 2

- Form: neither failing gate reports a Form failure. keyboard-run has no Form spec because the schema has no keyboard block, and every failure is in RadioGroup, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Table, Tabs, Toast, Tooltip or Tree. The axe gate ran all 10 Form/React stories in light and dark, and none is in its 91 failures (Feed, Listbox, Menu, Splitter, Tabs). No Form change can make these gates pass, so no code was changed. The gate runner seems to fail a component's round on failures from other components.
- Form: the axe gate used packages/react/storybook-static built 2026-09-17, before the round-1 Form.tsx edit, so it did not test the current Form code. The gate should rebuild Storybook (or check that the build is newer than the component) before running.
- Form: the axe gate only checks each story's initial render, and no Form story shows the errorSummary (it appears only after a failed submission). The summary's danger-on-subtle contrast (a11y.contrast) and its role=alert/tabindex=-1 markup are never axe-checked. The doc could give an example whose `given` starts with a failed submission (e.g. a play function that submits empty) so the summary gets checked.

## 2026-09-18 21:56 — round 3

- Form: this round's keyboard-run failures (Menu, Popover, RadioGroup, Search, SegmentedControl, Slider, Stepper, Table, Tabs, Toast, Toolbar, Tooltip, Tree) are all in other components, and Form has no keyboard block, so no Form spec runs. The set of failures changed between rounds 2 and 3 while Form did not change, so the gate looks flaky. Attributing these results to the Form job makes a round impossible to pass, so no Form code was changed.
- Form: the axe gate timed out (900s) without results, so the current Form code has still never been axe-checked; round 2 ran on a Storybook built 2026-09-17, before the round-1 edit. Wrote logs/form-axe.mjs (a Form-only axe run that also covers the error summary after an empty submit) but could not run it without approval.
- Form: the gate never checks the errorSummary, because it appears only after a failed submission and no story renders it. The a11y.contrast pair (color.foreground.danger on color.background.subtle), role=alert/tabindex=-1 and the summary's Link list are never checked by any gate. The doc should add an example that starts after a failed submission so a story (and the axe gate) covers it.
