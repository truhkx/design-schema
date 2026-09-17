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
