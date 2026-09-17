# Gaps reported while generating Checkbox for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:41 — round 1

- Checkbox: the file already existed from an earlier generation pass without the overrides contract (--ds-checkbox-* hooks, `overrides` prop) or data-ds/data-part testability hooks that Input.tsx and Card.tsx now use; I retrofitted Checkbox.tsx/.css to match that established pattern rather than leaving it stale.
- Checkbox: the `indicator` binding's description ('controlSize minus 2 × space.1') references space.1 as a fixed layout detail of that binding, not the `partGap` override binding (which is semantically the vertical gap between label/description/error) — kept the indicator inset as the literal `var(--space-1)` token so overriding `partGap` doesn't resize the checkmark.
- Checkbox: anatomy lists `indicator` as a part, but per the web platform notes it's drawn as a CSS ::before pseudo-element on the control, not a real DOM node, so it has no element to carry `data-part="indicator"`; only `description` and `errorMessage` got the attribute (control and label are already reachable by role/label).

## 2026-09-10 17:39 — round 1

- Checkbox: the existing Checkbox.tsx/.css/.stories.tsx (from a prior generation pass) were missing the `hideLabel` prop entirely, despite it being a required schema prop with its own a11y contract (label stays the accessible name via the standard visually-hidden clip pattern, matching Input's `ds-input__visually-hidden`). Added the prop, the `ds-checkbox__visually-hidden` CSS class, and a `HideLabel` story.
- Checkbox: the root was also missing `data-ds-field`, which the package convention requires on every field component so Form can discover fields by attribute (Input.tsx already has it). Added it alongside the existing `data-ds="Checkbox"`.
- Checkbox: Table.tsx's selection-column and select-all Checkbox usages (packages/react/src/Table.tsx:444, :515) are exactly the case the schema calls out for `hideLabel` ('a selection column in a Table, where the row name is the label') but don't pass it, so the row/column name is currently rendered as visible checkbox label text next to each row. Left Table.tsx unchanged since it's outside this Checkbox-generation task's scope — flagging for a follow-up pass on Table.
- Checkbox: no Checkbox.test.tsx was generated for the 15 behavior scenarios; the current generation prompt's Output section only calls for Checkbox.tsx and Checkbox.stories.tsx, and per project memory the behavior-scenario test rollout is being done target-by-target separately (Switch, Box, Card, Container so far) and hasn't reached Checkbox yet.

## 2026-09-16 04:43 — round 1

- Checkbox: form section says `value: checked`, `valueType: boolean` (and the Lit note says ds-form collects the boolean), but Guidance says 'The Form collects `value` when checked and nothing (no key) when unchecked', FormContext.ts documents 'Checkbox its `value` when checked', and the `value` prop exists so several checkboxes can share a `name` as a multi-select. Chose the declared section: getValue returns the checked boolean (false when unchecked). This breaks shared-name multi-select, and the doc needs to pick one model.
- Checkbox: the `indicator` binding says the Icon is 'inside the control element' on web, but the web control is a void <input>, so it can't have children. Chose a wrapper span (ds-checkbox__box) that stacks the input and an aria-hidden indicator span holding the Icon in one grid cell, with pointer-events: none. data-part="control" stays on the input and the indicator has no data-part.
- Checkbox: the rules say the ref goes on the root (the data-ds element), but the root is a wrapper div while platforms.web.element is input. Kept Ref<HTMLInputElement> on the input (useImperativeHandle), matching Switch and Input and focus use.
- Checkbox: Guidance says toggling an indeterminate checkbox 'clears the mixed state', but `indeterminate` is a plain prop with no controlled/uncontrolled pair. Chose local state: a user change clears the mixed state (aria-checked and the DOM property) until the `indeterminate` prop changes value again; a consumer who keeps passing true without a change sees it cleared.
- Checkbox: Guidance says the field reads FieldsetContext (`disabled` from the group), but no FieldsetContext exists in packages/react. Not implemented; only Form's `disabled` applies.
- Checkbox: `indicatorStroke` is a locked binding the Icon already applies at the same token, so the root declares --ds-checkbox-indicator-stroke but no rule reads it. Declared it for the hook contract, with a comment.
- Checkbox: `pressedOverlay` (state: pressed) doesn't say whether it applies to a box that is already checked or mixed, where the fill is already controlSelectedBackground. Applied it with :active only to the unchecked, non-mixed, enabled control, as color-mix(selected background at pressedOverlay × 100%, control background).
- Checkbox: copy.checked / unchecked / mixed have no use on web (native checked state plus aria-checked=mixed). Kept them as verbatim constants, unused.
- Checkbox: `requiredIndicator` placement: rendered as plain text inside the <label> so it takes the label bindings (matching Input); the doc doesn't say whether it is muted or uses a smaller size.
- Checkbox: 'the whole row is the hit area' doesn't say whether the gap between control and label toggles. Chose yes: a click whose target is the row itself is forwarded to the input.
- Checkbox: the `disabledOpacity` target part isn't named. Dimmed the box (control plus indicator) and the label; description and error stay at full opacity so they remain readable.

## 2026-09-17 04:58 — round 1

- Checkbox: the indicator binding says nothing is rendered when unchecked, but the web input is native and uncontrolled. Rendering the icon needs a mirrored checked state in React. A fully controlled input made a prevented click on a disabled box stay checked in jsdom, so uncontrolled stays native (defaultChecked) with a state mirror used only for the icon. The spec should say whether the web input is controlled internally.
- Checkbox: the transition binding covers 'fill and indicator transitions', but the icon is added and removed rather than faded, so only background-color and border-color transition. An indicator fade isn't possible without keeping a hidden icon mounted, which the indicator binding rules out.
- Checkbox: controlBorderInvalid vs controlSelectedBackground when a box is both invalid and checked or mixed is not specified. The selected border wins, so the invalid border shows only on an unchecked box.
- Checkbox: when `invalid` is true and there is no error or Form message, the doc says the error slot shows copy.required or copy.invalid. That makes a bare `invalid` render a role=alert message, which the `invalid` prop description ('Marks the control as failing validation') doesn't mention. Implemented as the Behavior section says.
- Checkbox: partGap is described as the gap in both the text column (label to description) and the root column (row to error), but no inline alignment is given for the error below the row. The error is indented by controlSize + gap in a wrapper div so it lines up with the label; the spec doesn't say this.
- Checkbox: the row click forwarding covers only 'the row itself (the gap)' plus the description. The text column's own area (the partGap between label and description) is not named; it forwards too, since the whole row is the hit area.
- Checkbox: the spec has no enum props, so the only stories are Default, the four examples and the existing state stories (Checked, Disabled, DisabledChecked, Invalid, WithError, Controlled). No per-value stories are required.
- Checkbox: FormFieldRegistration in FormContext.ts has isDisabled(), which the conventions digest's registration shape { name, label, id, getValue, validate, focus } leaves out; implemented per FormContext.ts.
