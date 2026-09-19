# Gaps reported while generating Input for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:16 — round 1

- Input: the schema's Overrides section makes labelWeight/helperSize/lineHeight/fontFamily/descriptionText/errorText bindings that Input itself owns, but the general composition rule says to render label/description/error via the shared Text component, which doesn't expose per-instance CSS hooks for those bindings. Rendered label/description/error as plain elements styled by Input's own --ds-input-* custom properties instead (matching Button's own precedent of a plain <span> for its label, not Text), so the override contract actually works.
- Input: focusRingWidth's description ('replaces borderWidth when focused; padding shrinks by the difference') conflicts with the general :focus-visible outline convention used by other components. Implemented it literally as written for this component: border thickens/recolors on focus with compensating padding via calc(), no separate outline layer.
- Input: a11y.role is declared as a single 'textbox' for all `type` values, but native ARIA mapping differs per type (search -> searchbox, number -> spinbutton, password -> no role). Left `type` to drive real browser semantics rather than forcing role='textbox' everywhere, since overriding the native role would fight the platform.
- Input: disabled styling only lists a `disabledOpacity` binding (no separate disabled background/foreground tokens), so disabled dims the field via opacity alone rather than swapping to a muted background/foreground as the file previously did.
- Input: added a companion Input.test.tsx (one test per behavior scenario, Button.test.tsx-style) since the Behavior scenarios section asked for scenario-derived tests even though the Output section only named Input.tsx and Input.stories.tsx.

## 2026-09-10 17:27 — round 1

- Input already existed in the package but was missing `size` (sm/md) and `hideLabel` entirely — added both props, their style bindings (fontSize now varies with size, plus paddingBlockSm/paddingInlineSm/minTargetSm), a `.ds-input--sm` modifier class, and `SizeSm`/`SizeMd`/`HideLabel` stories.
- Package conventions require every field component's root to carry `data-ds-field` so Form can discover fields by attribute, but no existing field component (Checkbox, Switch, RadioGroup, Select, etc.) has this attribute, and Form.tsx actually discovers fields via React context registration (`FormContext.register`), not DOM scanning. Added `data-ds-field` to Input's root for spec compliance, but it's currently inert/unused — flagging the doc/implementation gap rather than silently deviating.
- The Input doc says the field 'reads FieldsetContext' inside a Fieldset, but no FieldsetContext exists in the codebase — Fieldset.tsx actually injects `disabled` into children via `cloneElement`. Left this existing, working mechanism in place rather than inventing a FieldsetContext the rest of the package doesn't use.
- Native `<input>` has its own `size` HTML attribute (character width, type number) which collides with the schema's `size` enum prop; omitted the native attribute from InputProps (added `'size'` to the Omit list) in favor of the schema meaning, since the schema takes precedence.
- The two new behavior scenarios `renders-size-sm`/`renders-size-md` are not reflected in the existing `Input.test.tsx` (a generated gate file outside this task's Output scope, which only names `Input.tsx` and `Input.stories.tsx`) — leaving that file for the test-generation pass to update.

## 2026-09-10 19:52 — round 1

- Input: existing implementation already covered the schema; the only deviation from current conventions was that description/error were raw <p> tags instead of composed Text components (the guidance says 'description and error are Text', and the sibling NumberInput/Fieldset already follow that). Refactored to compose Text for both, forwarding helperSize/fontFamily/lineHeight overrides into Text's own overrides and dropping the now-redundant descriptionText/errorText/helperSize CSS hooks (Text's tone classes already resolve to the exact locked tokens color.foreground.muted / color.foreground.danger).

## 2026-09-16 04:04 — round 1

- Input: events onFocus/onBlur list no payload, so per 'exactly the listed arguments' they are called with no arguments and typed `() => void`; the previous React Input passed the FocusEvent (and onChange passed the ChangeEvent as a second argument). The doc should say whether web handlers get the native event.
- Input: Behavior says 'Inside a Fieldset the field reads FieldsetContext' but no FieldsetContext exists in the React package (Fieldset clones `disabled: true` onto its children). I did not invent the context; group disabled still arrives through the cloned prop.
- Input: the validation precedence ends with 'browser/type validity where the platform has it' but gives no copy for it; I report copy.invalid rather than the browser's validationMessage so all user-facing text stays from the copy block.
- Input: the ref target is ambiguous. The convention says the ref goes on the root (the wrapper div carrying data-ds), but platforms.web.element is `input`; I kept the ref on the <input> (useImperativeHandle), which is what focus()/select() consumers need.
- Input: `size` binding says sm uses 'small type' and fontSize is font.size.{size}, but the label has no size binding; I applied the fontSize hook to the label as well as the field so the label follows sm. The doc should say whether the label size follows `size`.
- Input: a11y.requires focus-visible says 'a :focus-visible outline', while focusRingWidth says 'no outline — the border IS the focus ring'; I followed the binding (outline: none, border recolors to borderFocus and thickens to focusRingWidth, padding shrinks by the difference).
- Input: descriptionText and errorText are locked bindings realised by the composed Text's `muted`/`danger` tones; they get no --ds-input-* hook, since a hook could not reach into the child without restyling it. Same for helperSize, which is forwarded to Text's fontSize override. The 'every binding becomes a hook' rule and the 'never restyle a child' rule conflict here.
- Input: no `transition` binding is declared; I used motion.duration.fast on border-color only (not border-width/padding, to avoid animating layout), removed under prefers-reduced-motion.
- Input: disabled — the doc says 'aria-disabled + readOnly on web'; a consumer `readOnly` is honoured when not disabled. Not stated whether readOnly (non-disabled) fields are submitted/validated by Form; they are, as before.
- Input: `invalid: true` without `error` sets aria-invalid and the danger border but renders no message (copy.invalid only appears through Form validation). The doc should say whether a directly-set `invalid` renders copy.invalid in the error slot.

## 2026-09-17 04:24 — round 1

- Input: Behavior says 'The Form marks a failing field by setting its `invalid`', but the React FormContext hands errors down as `errors[name]` strings and has no per-field `invalid` channel. Kept the context contract: a Form-held error shows like `error`, and a directly set `invalid` shows copy.required/copy.invalid.
- Input: 'required' is never defined for whitespace-only text. The old code trimmed; I switched to native parity (only '' counts as empty), so '   ' passes required.
- Input: 'validationMessage/validity always follow the full precedence' doesn't say how on web. I used setCustomValidity with the copy message (cleared when disabled). Because a custom error makes validity.valid false, the type check reads the specific flags (typeMismatch, badInput, pattern/range/step/length) instead of validity.valid.
- Input: the error-area message for `invalid` checks for an empty required field using the rendered value (controlled or uncontrolled state), while Form validation reads the live DOM value. These only differ for a controlled field whose parent hasn't re-rendered yet.
- Input: the spec says Fieldset disables the field 'through the `disabled` prop Fieldset passes to its children', but the package also exports FieldsetContext. I didn't read it, so a Fieldset that only sets context wouldn't disable Input. Worth confirming which one Fieldset actually uses.
- Input: the constant longPressDelay is native-only and has no web meaning, so nothing reads it on web.
- Input: the `helperSize` override is forwarded as Text `fontSize`, and `fontFamily`/`lineHeight` go both to the root hooks (label, input) and to Text overrides. The spec says fontFamily and lineHeight are 'forwarded the same way' but doesn't say whether the root hooks remain too; I kept both.
- Input: `readOnly` is not a schema prop but is accepted from the native input props (the Behavior text mentions a read-only field). Disabled forces readOnly on, per 'aria-disabled + readOnly on web'.

## 2026-09-18 20:12 — round 1

- Input: the Behavior section says the Form's context entry (errors[name]) is treated 'exactly as a Form-set invalid' and also that the error slot shows that entry as a message. It doesn't say what an entry with an empty message means. I chose: the entry's presence marks the field invalid, and an empty message falls through to the invalid-derived copy (copy.required for an empty required field, else copy.invalid).
- Input: `error: ''` is not defined. I treat it as unset, so the Form's entry or the invalid-derived copy shows, since 'Setting it implies invalid' would otherwise leave an empty role=alert.
- Input: the spec doesn't say whether the Form's own entry counts in the field's validate() precedence. I left it out, because validate() is what the Form calls to produce that entry, and including it would make the Form re-read its own result.
- Input: the Form's validate mode 'change' is not defined for blur. The field re-validates on blur in both 'blur' and 'change' modes, so a field left without typing still gets checked.
- Input: the errorMessage and description parts are Text elements carrying data-part. The spec doesn't say whether data-part may sit on the composed child's root (the 'no style props reaching into it' rule only covers styling). I kept it on the Text, as in Fieldset.
- Input: the constant longPressDelay is native-only and has no web meaning. I don't use it on web.

## 2026-09-18 20:24 — round 2

- Input: neither round-2 gate failure is Input's. A fresh axe-web run reports no violations for any of the 18 Input/React stories in light or dark (all remaining failures are Carousel, Feed, Listbox, Menu, Slider, Splitter and Tabs), and Input has no keyboard block, so generated/keyboard has no Input spec. I changed no code; the gates stay red until those components are fixed.
- Input: the gate report for a single-component round lists every component's failures, so it doesn't show which ones the component under repair owns. I had to re-run the axe gate and filter by story title to show Input was clean.

## 2026-09-18 20:30 — round 3

- Input: round 3 got the same keyboard-run and axe failures as round 2, all in other components (keyboard: ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip, Tree; axe: Carousel, Feed, Listbox, Menu, Slider, Splitter, Tabs). Input's code hasn't changed since round 2, when axe found no violations in its 18 stories and no Input keyboard spec existed, so I changed nothing.
- Input: the repair loop judges one component by whole-suite gates, so a component that is already clean can't converge. The gates, or the runner's pass/fail check, should be limited to the component under repair (axe by story title prefix, keyboard by spec file name).

## 2026-09-19 10:59 — round 1

- Input: the generic rule types the ref as the root element (`Ref<HTMLElement>` on the root) but platforms.web.notes says the ref targets the <input>, not the wrapper; followed the notes — `ref?: Ref<HTMLInputElement>` via useImperativeHandle while `data-ds`/`data-ds-field` stay on the wrapper div. The generic rule should defer to a component's notes for the ref target.
- Input: the field id inside a Form is `${form.idBase}-${name}` (FormContext.idBase), otherwise `useId()`; the Input doc never mentions idBase, so this id scheme comes from FormContext rather than the spec.
- Input: `validate: change` vs `blur` — the doc says onBlur is the moment to validate but does not say which Form modes the field triggers `validateField` for; chose blur and change modes on blur, change mode also on every change.
- Input: `readOnly` passes through and suppresses edits natively, but the doc doesn't say whether onChange can fire for a read-only (not disabled) field; relied on native behaviour (it cannot), with an explicit guard only for disabled.
- Input: constants.longPressDelay is native-only and has no web meaning; not used on web.
- Input: `:focus-visible` on a text input matches on pointer focus too, so the border focus ring shows on click as well as keyboard; the doc treats the border as the focus-visible ring without saying whether that is intended.
- Input: scenario `focus-is-reported` (`focus: field`) is expressed with user.tab(); `error-is-identified` `state: invalid` is expressed as aria-invalid="true" on the input — the scenario vocabulary doesn't name the web attribute for `state: invalid`.
- Input: no `keyboard` block, so no `Keyboard` story; extra state stories (Disabled, Invalid, InvalidRequiredEmpty, WithPlaceholder) are beyond the enum/example set and were kept as 'notable states'.

## 2026-09-19 11:07 — round 2

- Input: the round-2 rejection came from whole-Storybook gates whose failures are all in other components. keyboard-run failed in ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip and Tree; Input has no keyboard block and no generated keyboard spec. axe failed in Carousel, Feed, Listbox, Menu, Slider, Splitter and Tabs; all 18 Input/React stories are in the scanned index.json and none is in the failure list. No Input change can make either gate pass. The gates should be scoped to the component under generation, or the pipeline should compare against a baseline, so a job isn't rejected for other components' existing failures.

## 2026-09-19 11:15 — round 3

- Input: round 3's rejection is identical to round 2's, and the rewritten logs/playwright.json (11:14) still lists no Input/React story. keyboard-run fails in ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip and Tree; Input has no keyboard spec. axe fails in Carousel, Feed, Listbox, Menu, Slider, Splitter and Tabs; all 18 Input stories were scanned and passed. The retry loop keeps re-sending an Input job that no Input change can satisfy. The gates should filter failures to the component under generation, or compare against a pre-job baseline, before rejecting.
