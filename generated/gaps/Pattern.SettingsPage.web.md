# Gaps reported while generating Pattern.SettingsPage for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 20:25 — round 1

- Card: schema has no `tone` prop (spec wrote `tone=danger?` as an open question), so I left it off the Delete-account Card and relied on the Alert already inside it to carry the danger signal, per the guidance doc's own open question about whether Card needs a tone.
- AlertDialog copy (heading/description/confirmLabel) was never given verbatim — the structure only said '→ AlertDialog'. I wrote on-brand copy: heading 'Delete your account?', description 'This permanently deletes your account and everything in it. This cannot be undone.', confirmLabel 'Delete account'.
- Toast tone for 'Changes saved' was unspecified; used the component default (neutral) rather than guessing 'success'.
- Density control: no token/attribute exists anywhere in the system for layout density (only color `data-mode` is documented in packages/react/src/index.ts). The Density RadioGroup is a real controlled input but has no effect beyond local state — there's nothing for it to drive yet, matching the guidance doc's own open question about `layout.rhythm`.
- 'System' color mode: the documented mechanism is only an explicit `data-mode="dark"|"light"` toggle, no tri-state. Selecting System just removes the override, which resolves to the documented light default rather than actually following the OS preference.
- Cancel/'reset to saved values': the spec gave no seed data for the Profile fields, so they start empty and Cancel (native `form.reset()` via the Form's forwarded ref) returns them to that empty state rather than to any pre-filled values.
- The structure literally nested `Stack horizontal gap=tight justify=end (Form's action row)` as a child of Form, but Form's real API takes the action row via its `actions` prop (confirmed against Fieldset/SignIn/Preferences conventions), so I used `actions` instead of a trailing child.
- Set Form's `errorSummary={false}` (overriding the component default of `true`) so submission behavior matches the spec's literal wording 'focuses the first invalid field' rather than the default error-summary-gets-focus behavior.

## 2026-09-16 13:10 — round 1

- Form: no reset or cancel API. The Inputs are controlled by page state and Cancel sets them back to the saved values. Form's error state and its after-first-submit re-validation are internal, so after a failed submit, Cancel clears the values but the error messages stay. The Form doc needs a reset contract.
- Form: the structure gives no `label`/`labelledBy`. I left both out (it is the only form, inside a labelled tab panel), so the form element is not a named landmark.
- Toast: the structure says 'the provider owns the region', but React has no provider, only `ToastRegion` and a region that `toast()` creates on first call. I rely on that auto-created region and author none.
- TabPanel (Notifications, Appearance, Account): each panel holds two sibling Fieldsets or Cards with nothing spacing them, and margins are banned. I wrapped each panel in `Stack gap=loose`, matching the Profile form's Stack. The structure should say so.
- Card: the children (Text + Button, Alert + Button) need spacing between them, and Card's `partGap` is between parts, not body children. I wrapped them in `Stack gap=normal align=start`. `start` keeps the Buttons from stretching to full width, but it also shrinks the Alert to its content width.
- Appearance: 'the page says so' has no node in the structure. I used Fieldset `description` with copy I wrote myself: 'A preview only: the app sets the color mode, and System means no override.' and 'A preview only: the theme has no density setting yet.' The pattern doc should supply this copy verbatim.
- Appearance: the structure gives no initial values for the controlled inputs. I chose `system` for Color mode (no override) and `comfortable` for Layout density.
- RadioGroup Frequency: no default value is given. I left it unselected, so the disabled group shows no selection. The doc should say whether it defaults to 'Immediately'.
- Checkbox/RadioGroup/Input: `name` is required by the components but not in the structure. I chose name, email, displayName, website, productUpdates, securityAlerts, tips, pushFrequency, density.
- Tabs: the structure names panels by label only. I used lowercase ids (profile, notifications, appearance, account).
- Button 'Request export' has no behavior in the spec. It renders with no handler.
- AlertDialog: `onConfirm` only closes the dialog (no business logic), same as Cancel/Escape. The spec doesn't say what confirming should do on a demo page.
- Guidance says the story is `Patterns/Settings`; Output says `Patterns/SettingsPage`. I followed Output.

## 2026-09-17 16:48 — round 1

- RadioGroup/SegmentedControl: the spec gives option *labels* only ("Immediately", "Daily digest", "System"), but RadioGroup's `options[].value` must be a short identifier because it becomes an element id. Chose immediately/daily/weekly, system/light/dark, comfortable/compact.
- Tabs: the structure block nests `TabPanel "Profile"` under Tabs as if the label lived on the panel, but React Tabs takes a `tabs: TabsItem[]` array for the labels and separate `TabPanel id=…` children. Built SETTINGS_TABS from the given ids and labels; the panel children carry ids only.
- Stack: the structure writes `Stack horizontal gap=tight justify=end`; the prop is `direction="horizontal"`. Wrote it as `direction`.
- Form: no `validate` mode is specified. Left it unset — the package default is already `submit`, which is what "validates on submit" asks for. `errorSummary={false}` is set as instructed, so the first invalid field takes focus.
- Push RadioGroup: the spec says both `defaultValue=Immediately` (uncontrolled) and that Notifications controls are "page state". Kept it uncontrolled with `defaultValue`, since nothing on the page reads the frequency; only the Switch is controlled, because it drives `disabled`.
- Switch: no `name` given, and it sits outside the Form, so it was left off. If the intent was for push to be collected by some future form, the spec should say so.
- AlertDialog placement: the structure puts it as a sibling after Container inside Landmark main, but AlertDialog portals to `document.body`, so its position in the React tree has no DOM effect on web. Followed the structure anyway; on web the instruction is a no-op and the `container` prop is untouched.
- Cancel: the spec says it "resets the form to its saved values" and with no seed data the fields return to empty — so on first load Cancel is a visible no-op. Implemented as specified (saved copy restored, errors untouched); the page has no seed profile to make the behavior observable in the story.
- Card heading vs Fieldset legend: the danger/export Cards use `headingLevel={2}` beside Fieldset legends of similar weight — the seam the guidance flags (does Fieldset's legend need a `size`, or Card's heading a smaller default?) is real in the rendered page but was left unaddressed here, since the page may not restyle a child.
- Toast: `toast()` returns a Promise that resolves when the toast leaves; the page ignores it (`void`). The spec does not say whether a second save should replace an in-flight toast, so no dedupe or id was set.
