# Code gaps

Gaps where a sibling component's generated code is wrong. The docs are already right; these need a regeneration or a patch.

## 2026-09-16

- Menu.tsx / Menu.ts: the doc comment still says "there is no ActionSheet component in this package yet". ActionSheet exists.
- Menu.ts (lit): the trigger sets a raw `aria-expanded` attribute on the `<ds-button>` host, which does not reach the inner button. It must set the `.expanded` property. Popover, SidePanel and Disclosure should be checked for the same.
- Menu.tsx / Popover.tsx / Toolbar.tsx (rn): doc comments claim Button has no hook for `accessibilityState.expanded` and no `overflowLabel`. Both are stale — Button has them.
- BottomSheet consumers (rn): Combobox.tsx, DataGrid.tsx, Select.tsx, TreeGrid.tsx passed the old `title` prop after the rename to `heading`. Fixed in the BottomSheet pass; re-check after any rename.
- Table.tsx (react): the selection column and select-all Checkbox are exactly the `hideLabel` case the Checkbox doc names, but do not pass it, so each row's name renders as visible label text.
- AlertDialog.css (react): `.ds-alert-dialog--tone-* .ds-alert-dialog__icon { color: … }` has no effect, because Icon.css's own `color: var(--ds-icon-color)` always wins. It must use Icon's `overrides.color`, as Alert does.
- Dialog.css / Fieldset.css (react): comments claim Stack's gap has no override path. It does — `overrides.gap` — as AlertDialog now proves.
- Checkbox (rn): `indicatorStroke` is in `CheckboxOverridableBinding`, but the binding is locked. It should not be in the overridable union on any platform.
- Icon (lit): `strokeWidth` was exposed in `IconOverridableBinding` despite being locked; removing it narrows a shipped public type.
- Dialog.test.ts (lit): `control-is-focusable` fails in browser mode — `deepActiveElement()` resolves to the `<dialog>` host rather than the slotted input. Pre-existing, reproduces on HEAD.
- Tree.tsx (react): passes `className` to `<Icon>`, a class override on a child the conventions forbid.
- Select.ts / Combobox.ts (lit): do not pass `embedded`, `loading` or the initial active value down to the composed `<ds-listbox>`, which now implements all three; the popup draws doubled chrome until they do.
- Tabs.ts (lit) and Carousel.stories.tsx (react): panels composed through a JSX Fragment are one child to `Children.toArray`, so they never match their tabs/slides. Pass an array.
- Popover (rn): the doc puts a BottomSheet on phones; the component renders the tablet anchored panel on every width. BottomSheet exists now.
- FocusScope consumers (rn): Dialog, Popover, Menu, Select and SidePanel each set `restoreFocus={false}` and hand-roll the restore; `returnFocusTo` now exists and replaces all five.
- FormContext (react/rn): `FormFieldValue` has no numeric variant, but the Form contract is `string | number | boolean | string[] | [number, number]`. NumberInput and Slider stringify to fit.
- Toolbar (lit): the overflow width budget reads `--size-target-min`, which does not exist; the doc now names `size.target.min`.
- FormContext.ts / FormContext.tsx (rn): both exist with different types; imports resolve to `.ts`, the `.tsx` looks stale.
- Lit field components (Checkbox, Switch, RadioGroup, Select, NumberInput, DatePicker): do not set `data-ds-field`, so ds-form cannot collect them; Checkbox and Switch must set `data-ds-field="change"`.
- Form.ts (lit): discovers fields with a tag list (FIELD_TAGS) instead of `data-ds-field`, and never sets `invalid` on a failing field, so in-field messages never show under ds-form validation.
- RN field components (Input, Checkbox, Switch, RadioGroup): do not pass `label` when they register with Form.
- Text.tsx (rn): hardcodes `testID="Text"` and takes no testID prop, so a composite cannot tag it `Input.<part>`.
- Feed (web): passes `tabIndex={-1}` to Card instead of `focusable`.
- Tree.tsx / Tree.css (web): passes `className` and `data-part="label"` to Link and strips its underline; should pass `tone="inherit"`, put its part on its own wrapper and keep the underline. tree.md should also say href nodes use `tone: inherit`.
- Fieldset.tsx (rn): remove the `disabled` clone fallback; Input, Checkbox, Switch and RadioGroup already read FieldsetContext.
- Fieldset.tsx (react): drop the exported FieldsetContext/useFieldsetContext no field reads; keep passing `disabled` to direct child fields.
- Fieldset.ts (lit): stop setting Text's --ds-text-* and Stack's --ds-stack-gap hooks from Fieldset hooks; forward through `overrides` only.
- SidePanel.tsx (react): put the panel's classes, style and ref on its own element and compose Landmark inside with role/as/aria-labelledby only; then drop className/style forwarding from Landmark.
- Dialog (web): passes `data-part="closeButton"` to Button, which keeps its own `data-part`; put the part on a wrapper Dialog owns, as Alert does (found in FocusScope, web).
- Button / Link / Input (lit): forward host `aria-label` and `aria-description` to the inner control, so ds-tooltip can name or describe a shadow-root trigger (tooltip.md now relies on it).
