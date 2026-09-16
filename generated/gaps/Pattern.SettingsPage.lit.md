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

## 2026-09-16 13:12 — round 1

- Pattern.SettingsPage structure: the Notifications, Appearance and Account TabPanels each hold two siblings (Fieldset, Fieldset / Card, Card) with no Stack, but the Profile panel has an explicit `Stack gap=loose`. ds-tab-panel is display:block, so on Lit these siblings sit with no gap between them. I followed the structure exactly (no Stack). The doc should add `Stack gap=loose` to those three panels, or Tabs should own a gap between panel children.
- Pattern.SettingsPage / Card: each Card's body is Text + Button with no Stack. Card lays out body children as flex column items with `partGap` (layout.gap.loose) and stretch alignment, so the Button probably fills the width and sits a loose gap below the Text. I followed the structure. The doc should say whether a Card body needs its own `Stack gap=normal align=start`, or whether Card should align body children to start.
- Pattern.SettingsPage / Form: Form has no reset() and no reset event. Slotted ds-inputs are not associated with a native <form>, so formResetCallback never runs, and setting `value = undefined` does not clear an uncontrolled edit. To make Cancel 'reset to saved values' I made the four Inputs controlled (page state holds a saved copy and a draft). Form also keeps its internal `errors` after Cancel. The Form doc should define reset (a method or a `type=reset` Button).
- Pattern.SettingsPage / Input names: the structure gives no `name` on the Inputs, but Form keys values and errors by field name (empty names collide). I used name, email, displayName, website.
- Pattern.SettingsPage / Form: the structure writes `Form onSubmit` with no `name` or `label`. Form's doc says a label is required only when a page has more than one form. There is one here, so I set neither; the form landmark is unnamed.
- Pattern.SettingsPage Appearance: 'the page says so' (the controls drive nothing) has no visible copy in the structure. I said so only in a code comment. Add Fieldset `description` copy to the doc if it should be visible.
- Pattern.SettingsPage initial values: no default is given for Frequency, Color mode or Layout density. Frequency is left unselected, Color mode starts at 'system' (no override), and Layout density starts at 'comfortable'.
- Pattern.SettingsPage AlertDialog: the spec does not say what confirm does, so both confirm and cancel just close the dialog (no fake delete). AlertDialog is used but is not in the 'Components used' list.
- Pattern.SettingsPage Checkbox/Switch: the structure gives no names for the Notifications controls. They are outside any Form, so I left them unnamed and uncontrolled, except the Switch, which is controlled so it can disable the RadioGroup.
- Pattern.SettingsPage acceptance: Guidance asks for a story titled `Patterns/Settings`, but the output rules say `title: 'Patterns/SettingsPage'`. I kept 'Patterns/SettingsPage'.
