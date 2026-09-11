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
