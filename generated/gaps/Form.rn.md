# Gaps reported while generating Form for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:22 — round 1

- Form: the shared FormFieldHandle contract (register/getValue/validate/focus) used by Input/Checkbox/Switch/RadioGroup carries no field label, so the RN error-summary link's accessibilityLabel is just the error text, not "Label: error text" per the content guideline — matching web/Lit would require extending that shared handle across all field components, out of scope for a Form-only pass.
- Form: `name` has no functional use on RN (no DOM ids; focus is ref-based) — kept purely for prop parity with web/Lit's 'base of generated ids' description.

## 2026-09-10 17:33 — round 1

- Form: the spec's platforms.rn.notes describes the context shape as `{ register, unregister, submit, errors, validateMode, disabled, focusField }` but Input/Button/Checkbox/Switch/RadioGroup (pre-existing in the package) already call `form.reportValidity(name, error)` and read `form.order`/`form.errors[name]` directly rather than a plain `errors` object passed down — I added `reportValidity` and `order` to FormContextValue to match the already-shipped field components instead of the notes' shorter list, since rewriting five other components' contract was out of scope.
- Form: FormContext.tsx did not exist even though five components (Input, Button, Checkbox, Switch, RadioGroup, plus Form itself) already imported from it — I created it to match the exact shape those files already assume (FormFieldHandle = {getValue, validate, focus}), rather than inventing a new contract.
- Form: content guidance says each error-summary item should read 'Label: error text', but the field registration contract (FormFieldHandle) shared by Input/Checkbox/Switch/RadioGroup carries no `label`, only a validation message — those components would need to add `label` to their handle for this to be possible. I left the summary showing just the message text, consistent with the existing field components.
- Form: the `name` prop has no observable effect on React Native (no DOM ids to generate, unlike web/Lit) — kept for API parity per the platform notes, but it's inert here.
- Form: `errorSummary`'s View lacks a dedicated `errorSummaryText`/`errorSummaryBackground` binding constant in code — those locked tokens are applied via `Text tone="danger"` and `colorBackgroundSubtle` directly (matching Text's own token) rather than duplicated as separate style variables, since they're non-overridable and this avoids drift from Text's own danger-tone token.

## 2026-09-16 04:17 — round 1

- Form: the errorSummary part has border/text/background bindings but no border width, radius or padding tokens; kept border.width.thin, radius.md, space.md horizontal / space.sm vertical, and Stack gap=tight between heading and items (matching the React summary).
- Form: summary items are 'links' to fields but no style binding covers their target size or focus ring; used size.target.min minHeight and a border.width.focus ring in color.border.focus with radius.sm.
- Form: 'Label: message' — the RN FormFieldHandle in packages/rn/src/FormContext.ts had no `label`; added it as optional so existing fields keep compiling, but Input/Checkbox/Switch/RadioGroup etc. don't pass it yet, so items fall back to the message alone. Also Input's copy.required already embeds the label ('Email is required.'), so the summary would read 'Email: Email is required.' — the doc should say whether the summary prefixes the label or the field message omits it.
- Form: the RN notes say fields register `{ name, label, getValue, validate, focus }` but the rest of the doc and the context API register by `register(name, handle)`; kept name as the register argument, not a handle property.
- Form: onSubmit shape is Record<string, string | boolean>, but the package's FormFieldValue also includes string[] (multi-select Listbox) and the Lit notes list numbers and tuples; kept the package's existing FormValues type rather than narrowing and breaking Listbox.
- Form: the generic rule says disabled uses opacity.disabled on the whole element, but Form's disabled propagates to every field and action, which each dim themselves; applying it on the container too would compound the opacity, so Form sets only accessibilityState.disabled and relies on the children.
- Form: copy.summaryHeadingOne duplicates summaryHeading's plural `one` form and copy.invalidSummary has no stated use on RN (SwiftUI announces it; RN notes announce 'the summary'); both are kept in COPY verbatim but only summaryHeading is rendered; the iOS announcement is the heading plus each item.
- Form: the RN notes say focus moves to the summary on failed submit, while the Guidance 'React Native' section says setAccessibilityFocus goes to the first invalid field; followed platforms.rn.notes (summary when errorSummary is on, first invalid field otherwise).
- Form: a11y.role form — kept role="form" on the View; RN has no landmark semantics on native, so the name only matters on react-native-web.
- Form: `name` is inert on RN per the prop description; destructured and unused.
- Form: examples give `children`/`actions` as prose ('An email Input and a password Input'), so the stories render concrete Inputs/Buttons via a per-story render; field names/labels (email, password, the five profile fields) are my choice.
- Form: separate *.ts and *.tsx FormContext files both exist in packages/rn/src with diverging types; module resolution picks .ts, the .tsx looks stale.

## 2026-09-17 04:33 — round 1

- Form: the onSubmit contract says NumberInput and Slider give a number and a range Slider or DatePicker gives [number, number]. On RN, NumberInput and Slider still register String(value) or a string pair, Combobox joins multiple values with commas, and DatePicker registers a range as two keys (`name`, `name-end`). I widened FormFieldValue in FormContext.ts to the contract, but those fields must change when they are next regenerated; Form cannot enforce it.
- Form: the doc says every field's registration carries its `label`, but FormFieldHandle.label is still optional because not every field sets it. For an invalid field with an empty message and no label, the summary shows the field's `name`. The doc does not cover this case.
- Form: packages/rn/src/FormContext.tsx is an older, unused copy (string | boolean values, no label) sitting next to FormContext.ts, which is the file imports actually load. I left it alone; it should be deleted.
- Form: summary items are Links, but Link requires `href` and falls back to opening the URL when nothing stops it. I pass the field name as href and return false from onPress so it only moves focus. The doc does not say what href to use on native, where a field has no id.
- Form: Link with tone inherit only picks up a color when nested in Text, so each item is wrapped in `<Text tone="danger">`. The doc says the summary's danger color 'reaches' the Link without saying how on a platform with no inherited styles.
- Form: the doc does not say whether the summary view should use role="alert" on RN (web uses a role="alert" div). I used accessibilityLiveRegion on Android and announceForAccessibility on iOS only, as the platform notes say, and did not make the view `accessible`, so each item Link stays separately focusable. Screen-reader focus lands on a view that is not itself an accessible element, and the doc does not say whether that works on iOS.
- Form: the spec says 'Enum props whose values are quoted digits accept both string and number' and 'disabled sets accessibilityState plus disabled'. The Form description forbids opacity on the container. I set only accessibilityState.disabled, since RN View has no disabled prop.
- Form: the doc does not say whether `gap` spaces the individual fields inside `children` or only the fields block from the actions. I apply it to both (a flex column with gap on the fields part), and the examples also put their fields in a Stack with gap loose, so there are two nested gaps.

## 2026-09-18 23:13 — round 1

- Form: the spec says 'after a failed submission every mode re-validates on blur and change', but the RN field contract (FormContextValue.validateMode) holds one mode and Input validates on blur only for 'blur' and on change only for 'change'. Form reports validateMode 'change' to fields after a failed submission until a successful one; a dual blur+change mode (e.g. a `submitFailed` flag in FormContextValue that fields read) needs a FormContext/field contract change the doc does not specify.
- Form: packages/rn/src/FormContext.ts and a stale FormContext.tsx both exist with different FormFieldValue/FormFieldHandle shapes (the .tsx lacks `label` and number/array values); Form imports './FormContext', which resolves to the .ts. The doc does not say which is canonical; the .tsx should be deleted.
- Form: errorSummary says 'the plural locale is read at the failed submit' and Guidance says RN always uses the runtime default; chose `new Intl.PluralRules().resolvedOptions().locale` captured at the failed submit.
- Form: the notes say the summary is 'announced' on failed submit, but not whether iOS re-announces as the summary shrinks. Chose to announce once per failed submit (heading then each item, joined with '. '); Android relies on accessibilityLiveRegion='assertive', which also re-announces content changes. The separator between heading and items is unspecified.
- Form: the onSubmit contract says an empty field (null, empty string, empty array) contributes no key, but the FormFieldHandle doc says only `undefined` is omitted. Form filters all four so fields need not normalize.
- Form: the examples' `children`/`actions` are prose, so the stories render them by hand; the sign-in Stack uses gap='loose' (unspecified in the example) to match the form gap.
- Form: the style bindings give the errorSummary box no layout direction or alignment and no borderStyle; used a column layout and borderStyle 'solid'.

## 2026-09-18 23:26 — round 2

- Form: the rn axe gate's only failure that renders a Form (Patterns/SettingsPage/Default, aria-prohibited-attr, 1 node) comes from Tabs.tsx:465-472: each Tabs panel View has accessibilityLabel={tab.label} and no role, so react-native-web renders a role-less <div aria-label>. Form is unchanged; the Tabs panel needs role='tabpanel' (the Tabs doc should say so), fixed at Tabs' regeneration or by hand with the owner's approval.
- Form: the rest of the axe-rn failures (Toolbar, Tree, TreeGrid, Demo/Preferences) belong to other components and render no Form; this whole-Storybook gate cannot pass through a Form change, and no Form/React Native story is in the failure list.
- Form: the axe gate only checks the first render, so the errorSummary (shown only after a failed submit) is never axe-checked on RN; the doc/gate should say whether a post-submit axe pass is required. logs/form-axe-rn.mjs does that check but was not run (needs approval).

## 2026-09-19 13:02 — round 1

- Form: the spec says the context carries `submitFailed` beside `validateMode`, and a field validates on blur when the mode is `blur` or `submitFailed`, and on change when the mode is `change` or `submitFailed`. It doesn't say whether `validateMode` stays the raw prop after a failed submit. Ten rn fields (Input, NumberInput, Slider, Checkbox, Select, RadioGroup, Listbox, Combobox, DatePicker…) read only `validateMode`. So I added `submitFailed` and kept `validateMode` reporting `change` once a submit has failed, so those fields keep re-validating. The doc should say which value `validateMode` carries after a failed submit, and the field docs should say to read `submitFailed`. Until then, Input and NumberInput don't re-validate on blur after a failed submit under `submit` or `change`.
- Form: the spec says the actions part aligns its content to the inline start but gives no binding for it. I used `alignItems: 'flex-start'` on the `Form.actions` View, not a token.
- Form: the rn notes list the context shape as { register, unregister, submit, errors, validateMode, submitFailed, disabled, focusField }. The existing rn context also has `reportValidity`, `errorSummary` and `order`, which fields use for blur/change results, the summary and returnKeyType routing. I kept them; the doc's list should include them.
- Form: `packages/rn/src/FormContext.tsx` is a tracked leftover next to `FormContext.ts`. It has an older FormFieldValue (string | boolean) and no `label` on the handle, and it isn't what './FormContext' resolves to. I left it alone; it should be deleted.
- Form: the only behavior scenario with assertions (`label-names-the-form-landmark`) is web/Lit only. The four rn tests only check that the form renders; there is no rn scenario for failed submit, the summary, focus or onSubmit values.

## 2026-09-19 13:10 — round 2

- Form: the rn axe gate runs every story in the Storybook, so it failed this job on other components' problems: Toolbar (aria-required-attr, nested-interactive), Tree (aria-required-children, target-size), TreeGrid (aria-required-attr, target-size), Input Disabled (color-contrast), Demo/Preferences (aria-required-attr, nested-interactive, color-contrast) and Patterns/SettingsPage. The SettingsPage violation is Toast's region, `<div aria-label="Notifications" data-testid="Toast.region">`, a named div with no role (aria-prohibited-attr), which comes from the ToastProvider decorator, not Form. A Form-only axe run (logs/form-rn-axe.spec.ts) found no violations in any Form/React Native story, in light or dark, before or after a failed submit. I changed no code: fixing those components is outside the Form job, and neither Form's spec nor its code conflicts with the gate.
- Form: the four rn behavior scenarios only check that the form renders. Nothing covers a failed submit, the error summary, or where focus goes, so only the one-off Playwright check above exercises the summary (it confirmed the summary appears after an empty submit and stays absent with errorSummary: false).

## 2026-09-19 13:16 — round 3

- Form: the rn axe gate runs every story in the Storybook and fails on other components' problems: Toolbar (aria-required-attr, nested-interactive), Tree (aria-required-children, target-size), TreeGrid (aria-required-attr, target-size), Input Disabled (color-contrast), Demo/Preferences, and Patterns/SettingsPage. The SettingsPage violation is Toast's region, `<div aria-label="Notifications" data-testid="Toast.region">`, a named div with no role, from the story's ToastProvider decorator. logs/playwright.json has no Form/React Native entry, and the Form-only run (logs/form-rn-axe.config.ts) is clean in light and dark, before and after a failed submit. I changed no code: Form's spec and the gate don't conflict, and the fixes belong to Toast, Toolbar, Tree, TreeGrid, Input and the Preferences demo. More Form rounds cannot turn this gate green.
- Form: the four rn behavior scenarios only check that the form renders; nothing covers a failed submit, the error summary, focus movement or onSubmit values.
