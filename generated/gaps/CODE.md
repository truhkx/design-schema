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

## 2026-09-17

- Button and other React siblings still accept and merge `className`/`style` although the package convention forbids forwarding them; Icon now drops them, so the package is inconsistent until those regenerate (found in Icon, web).
- demo-brand/src/CtaButton.tsx still lists `backgroundHover` as overridable, which button.md locks; run `pnpm demo:naming` after fixing (found in Button, web).
- Breadcrumb.tsx (react) stamps `data-part="link"` onto Link's root; breadcrumb.md already puts that part on a wrapper span (found in Link, web).
- packages/react exports a FieldsetContext, but fieldset.md says none is exported (web Fieldset passes `disabled` to child fields) (found in Input, web).
- packages/rn: NumberInput and Slider register `String(value)`, Combobox joins multiple values with commas, and DatePicker registers a range as two keys; form.md's contract is a number, a string array and a `[number, number]` pair (found in Form, rn).
- packages/rn/src/FormContext.tsx is a stale, unused copy beside FormContext.ts (string | boolean values, no label); delete it (found in Form, rn).
- packages/rn Text takes no `testID` and no layout style (`flexShrink`), so composites put part testIDs on wrapper Views; Breadcrumb still names `Breadcrumb.separator`/`Breadcrumb.current` on Texts (found in Breadcrumb, Meter; rn).
- packages/rn Button does not colour its icon slots, so every caller passes the Icon colour itself (found in Breadcrumb, rn).
- packages/rn Text has no fontFamily/fontSize/fontWeight/lineHeight overrides although text.md declares those bindings (found in Disclosure, rn).
- packages/rn useReducedMotion reads false until the OS answers and cannot report "not resolved yet" (found in Disclosure, rn).
- packages/lit ds-form never sets `invalid` on a failing field and sends no message back, so copy.required never shows from Form validation alone (found in RadioGroup, Checkbox; lit).
- Dialog, AlertDialog, BottomSheet, ActionSheet, Popover, SidePanel (web) pass `data-part="focusScope"` to FocusScope, whose own `data-part="scope"` wins, so the overlays' focusScope part is missing until they put it on an element they own (found in FocusScope, web).
- packages/lit ds-button, ds-link and ds-input do not forward a host `aria-label`/`aria-description` to their inner control, which tooltip.md relies on for custom-element triggers (found in Tooltip, lit).
- packages/web FormContext's FormFieldValue JSDoc says "Slider a number", but slider.md registers decimal strings; the JSDoc (and the unused number members) are stale (found in Slider, web).
- packages/lit ds-popover has no public reposition method, so DatePicker dispatches a synthetic `scroll` event to make it re-measure (found in DatePicker, lit).
- packages/web Link renders an inner `<span data-part="label">`, which collides with a composing component's own `label` part: an href node in Tree nests the tree's label Text and the Link's inner label, so `[data-part="label"]` matches two elements. Tree's doc now says its own Text is the outer one, but Link's inner part name is the thing that should move (found in Tree, web).

## 2026-09-18

- The rn axe gate has 634 violating elements, none in a Primitives story: aria-required-attr, color-contrast, aria-required-children, aria-required-parent, nested-interactive, scrollable-region-focusable, target-size and aria-prohibited-attr in Accordion, Button, Card, Carousel, Toast, Toolbar, Tree, TreeGrid, Patterns/SettingsPage and the Preferences, Profile settings and Sign in demos (found in Icon, Stack, Text, Box, Heading; rn).
- Web axe fails in Carousel, Feed, Listbox, Menu, Slider, Splitter and Tabs stories; lit axe fails in DataGrid, Feed, Listbox, NumberInput, Select, SidePanel, Slider, Tabs (dark color-contrast) and TreeGrid (aria-hidden-focus on its expand ds-button, target-size). keyboard-run fails in Combobox, DatePicker, Dialog, Feed, Listbox, Menu, Popover, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Tabs, Toast, Toolbar, Tooltip and Tree specs (found in Primitives rounds; web, lit).
- Splitter's example stories (Sidebar And Content, Collapsible Navigation, Editor Over Preview, Never Stacking Workbench) pass bare strings where the content should be a Text, so they fail dark-mode contrast. Box's stories did the same before this round; box.md now requires the Text wrap (found in Text, web).
- The rn Submitting demos fail color-contrast on disabled fields dimmed with `opacity.disabled`; WCAG exempts disabled controls, so the demo docs should say whether those stories disable the rule (found in Text, rn).
- Card, Accordion, Disclosure, Popover, Tree and Feed export their `*HeadingLevel` types with the numbers included, while Heading's `HeadingLevel` is the string union (numbers added only on the prop), as heading.md says; the siblings should follow Heading (found in Heading, web).

## 2026-09-19

- React Box stories put the highlighted-panel props (inset md, surface subtle, radius md) in the meta args, so BorderedRow, HeroBand and NavigationRegion carry more than their `given`; box.md now says they belong on Default alone (found in Box, lit).
- NumberInput, Search, DatePicker and Fieldset (Disabled, Disabled Group) rn stories fail axe color-contrast because disabled is conveyed only through accessibilityState, which react-native-web 0.21 drops; they need the `aria-disabled` mirror on the dimmed group that Input and Button now have (found in Input, rn).
- packages/rn/src/FormContext.tsx is a stale duplicate of FormContext.ts (no `label`, no number/array values); Form imports the .ts, so the .tsx should be deleted (found in Form, rn).
- The rn Tabs panel View has accessibilityLabel and no role (Tabs.tsx ~465-472), so react-native-web renders a role-less `<div aria-label>` and Patterns/SettingsPage fails aria-prohibited-attr; the panel needs role="tabpanel" (found in Form, rn).
## 2026-09-21

- Feed renders the new-items live region as the first child of `role="feed"`; `feed` requires `article` children, so all 11 Feed stories fail aria-required-children. The region has to move outside the feed element, which feed.md must place (found in Button; web).
- Listbox renders `emptyState` inside `role="listbox"` with no `option` children, so Empty and Empty With Message fail aria-required-children; the empty state belongs beside the listbox element (found in Button; web).
- Tree's roving tabindex is wrong, not flaky: ArrowUp lands on index 2 where 1 is expected and Home on index 2 where 0 is expected, reproducible serially twice (found in Button; web).
- Carousel's viewport is a scroll container that is deliberately not a tab stop, which axe's scrollable-region-focusable rejects; carousel.md has to decide between a documented tab stop and a per-story opt-out (found in Button; web).
- Splitter draws its real 24px target on `.ds-splitter__separator::before`, which axe cannot measure, so target-size fails on a control that meets it; only splitter.md can authorise moving the target onto the element (found in Button; web).
- Every rn component carrying a role with a required ARIA state needs the aria-* mirror react-native-web 0.21 drops — Switch, SegmentedControl, Select, Combobox, Slider, Meter, Splitter, DataGrid and TreeGrid still fail aria-required-attr, and ProgressBar's value silently never reaches the DOM (found in Button, Checkbox, RadioGroup, Meter; rn).
- packages/rn/src/FormContext.tsx is still a stale duplicate of FormContext.ts (no `label`, no `submitFailed`); the .ts wins resolution, so the .tsx should be deleted (found in Form; rn).
- Only Input reads the Form context's `submitFailed`; Checkbox, Switch, RadioGroup, NumberInput, Select, Listbox, DatePicker and Slider still read `form.validate` alone, so under `validate: submit` their errors do not clear as fields are fixed after a failed submit (found in Form; web).
- Box has no inverse surface value, so Button's Inverse story paints its own decorator on both web and Lit — the one place a story styles outside its component (found in Button; web, lit).
- FocusScope's `collectFocusable`/`isFocusable` are module-private and nothing in the package exports a shared focusable walker, so Toast duplicates the walk in Toast.tsx and the two copies will drift; FocusScope should expose it as an internal module export, not through index.ts (found in Toast; web).
- The baseline behavior test "Dialog — scrim click" was failing before any change because it clicks the `<dialog>` element rather than Dialog's separate `[data-part="scrim"]` child; the test target was corrected, but if the dialog box itself is meant to be dismissible that is a fact for dialog.md (found in FocusScope; web).
- ds-button, ds-link and ds-input do not forward a host `aria-description` (or `aria-label`) to their inner control, which platforms.lit in tooltip.md requires of a system trigger: ds-button's inner `<button>` takes aria-label only from its own `accessibleName`/`iconOnly`, so a Lit Tooltip's text lands on the custom-element host rather than on the focusable control a screen reader stops at (found in Tooltip; lit).
- The React suite carries 53 pre-existing failures in generated/behavior/* — mostly handlers called with one argument where the generated test expects a second `expect.anything()`, plus jsdom "navigation not implemented" — which mask regressions for any job that does not diff against a baseline (found in FocusScope; web).
- FIXED in this phase, recorded because it is a shared-component change reached from one doc: `composedContains` in packages/lit/src/FocusScope.ts walked `parentNode`, which never crosses a slot assignment, so a trapped scope treated its own slotted content as an escape and pulled focus back to the first shadow-root focusable — in `<ds-dialog>` the whole slotted body and footer were unreachable (focus refused, Tab frozen, a real click on the footer button firing no `press`). Now follows `assignedSlot`, matching `collectFocusable`; it also restores BottomSheet, SidePanel, ActionSheet and Popover (found in Dialog; lit).
- `FocusScope.ts` now exports `focusableIn(node)` (a wrapper over the private `collectFocusable`, no behaviour change) so consumers stop re-implementing the walk and drifting from the scope that traps the same panel; popover.md now names it as shared API (found in Popover; lit).
- `ds-link` has no `current` property and does not forward a host `aria-current` to its inner `<a>`, so no Lit consumer can mark the current page in a navigation list; React sets it through rest props. Link's own schema needs the prop before Lit can honour the content rule (found in SidePanel; lit).
- On Lit, `ds-button` takes its label as a property rendered into its own shadow root and has no default slot, so the copy string never appears in the composing element's `shadowRoot.textContent`; scenarios written as "the label is present in the component" (ActionSheet's cancel row) cannot pass as generated. Either the scenario needs a name-based expectation or Button needs a slotted label (found in ActionSheet; lit).
