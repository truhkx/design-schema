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
- BottomSheet.tsx (react): the wide presentation passes `className` and `style` into Dialog, which the root must not forward; stop passing them and drop them from Dialog's prop type (found in Dialog, web).
- Button (lit): no `haspopup` prop, so a ds-button Menu trigger cannot expose aria-haspopup; menu.md waives it until Button's schema adds one (found in Menu, lit).
- Link (rn): no `current` prop, so a native navigation SidePanel cannot mark the current page (found in SidePanel, rn).
- AlertDialog (web, lit): the tone color is set on a wrapper span and Icon's own color rule wins; forward `overrides.color` to Icon as Alert does (alertdialog.md now declares the forward).
- Disclosure (web, lit): no full-width trigger prop, so accordion rows are only clickable over the summary text (found in Accordion).
- Tabs (web): stories hold four fixed panels instead of building them from `args.tabs`; panels set font/color from tabs bindings; React panel DOM ids lack the `useId` prefix. Lit panels use aria-labelledby instead of aria-label. All: automatic activation must also select on ArrowLeft/ArrowUp/Home/End, and a tab without a panel must render (web filtered it).
- FormContext (rn) `FormFieldValue`/`getValue` and Lit `DsFormField.currentValue` lack `string[]`, so Select, Listbox and Combobox can't declare multi-value form fields (Combobox rn comma-joins as a workaround).
- Listbox (web): no controlled `activeValue` and no key handler for hosts (Lit has `handleKey`); `initialActiveValue` applies only on focus, so Select dispatches a synthetic `focusin` and Combobox remounts and re-dispatches keydowns. It should also declare its option id format (`<listboxId>-option-<value>`), not be a tab stop when `embedded`, and gain an option-weight binding if Select's fontWeight is to reach options.
- Select.tsx (web): was changed to Listbox's `initialActiveValue` with no alias for the old `defaultActiveValue` (reported as a gap; it is a code change).
- Combobox (lit): statusDebounce reads `--motion-duration-base`, which a reduced-motion theme zeroes; combobox.md now says it must not follow reduced motion.
- Button: rn Button has no `testID` prop and web Button forces `data-part="container"`, so Combobox/Select wrap their Button parts. Text (rn): Select/Input pass `testID` to Text, which text.md doesn't list; check it passes through.
- Button (rn): can't be removed from focus order, exposes only onPress (no hold-to-repeat), and always applies its own disabled opacity (found in NumberInput, rn).
- Select (lit): warns without `name` and always sets data-ds-field, even for internal controls in a shadow root (found in DatePicker, lit).
- Popover (lit): always focuses its first focusable with no initial-focus element, and doesn't re-measure when slotted content lays out after opening (found in DatePicker, lit).
- Form (lit): one host carries one `data-ds-field`; a range field needs a way to register `name-end` as a second field (found in DatePicker, lit).
- Checkbox (web): always sets data-ds-field and registers with FormContext, so Table's selection Checkboxes inside a Form are collected as fields; table.md now says they are not form fields, and Checkbox needs an opt-out (found in Table, web).
- TreeGrid.tsx (rn): `onColumnResize` is still object-shaped and imports DataGridColumnResize, while DataGrid's is positional `(column, width)`; align it and drop the export (found in DataGrid, rn).
- Link.tsx (react): the comment says it accepts className "because Tree passes one"; the regenerated Tree no longer does (found in Tree, web).
- Card.tsx (react): writes `data-part="surface"` after spreading rest props, so a composing Feed cannot put its `article` part on the Card and needs a wrapper (found in Feed, web).
