# Gaps reported while generating Pattern.SettingsPage for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 20:31 — round 1

- Card: schema has no `tone` prop (spec wrote `tone=danger?` as an open question), so I left it off the Delete-account Card and relied on the Alert already inside it to carry the danger signal.
- AlertDialog copy (heading/description/confirmLabel) was never given verbatim — the structure only said '→ AlertDialog'. I wrote on-brand copy: heading 'Delete your account?', description 'This permanently deletes your account and everything in it. This cannot be undone.', confirmLabel 'Delete account'.
- Toast tone for 'Changes saved' was unspecified; used the component default (neutral) rather than guessing 'success'.
- Density control: no token/attribute exists anywhere in the system for layout density (only color data-mode is documented). The Density RadioGroup is real and controlled but drives nothing — matching the guidance doc's own open question about layout.rhythm.
- 'System' color mode: the documented mechanism is only an explicit data-mode="dark"|(absent) toggle on <html>, no tri-state. Selecting System just removes the override, resolving to the documented light default rather than following the OS preference.
- Cancel/'reset to saved values': <ds-form> has no reset() and its internal shadow-root <form> does not own the slotted light-DOM fields (per Form.ts's own docs), so there is no native form.reset() to call as the React version used. I reset by hand: on Cancel, every <ds-input> under the profile <ds-form> has its `.value` set back to `undefined`. Since the spec gave no seed data, that returns fields to the same empty state they started in.
- The structure nested 'Stack horizontal gap=tight justify=end (Form's action row)' as a child of Form, but Form's real API takes the action row via a named `actions` slot, so I used `<ds-stack slot="actions">` instead of a trailing default-slot child.
- Set Form's `errorSummary` property to `false` (overriding the component default of `true`) so submission behavior matches the spec's literal wording 'focuses the first invalid field' rather than the default error-summary-gets-focus behavior.
- The structure's 'Toast region (bottom-end)' node is not rendered explicitly: Toast.ts documents `<ds-toast-region>` as auto-created in `document.body` by the `toast()` function and 'not meant to be authored directly', so the page just calls `toast({...})` on successful submit instead of composing a region element.
