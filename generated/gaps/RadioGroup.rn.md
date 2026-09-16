# Gaps reported while generating RadioGroup for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:51 — round 1

- RadioGroup: the existing RN file predated the current styles/overrides section entirely (no overrides prop, no RadioGroupOverridableBinding, item type named RadioOption instead of RadioGroupOption). Rewrote it to match the schema's 16 overridable bindings and locked bindings, matching the equivalent React implementation's OVERRIDE_HOOK list for cross-platform consistency.
- RadioGroup: the schema's Behavior section says invalid validation precedence is error -> required -> invalid (rendering copy.invalid), same as Input/Checkbox, but the platforms.rn.notes text only mentions 'required with nothing selected fails submit with copy.required' and doesn't mention copy.invalid. Implemented the full three-step precedence (error, required, invalid) to match the general Behavior section and the Checkbox/Input convention, since the rn notes read as incomplete rather than contradictory.
- RadioGroup: the previous implementation passed the native `disabled` prop to each option's Pressable for individually-disabled options, citing arrow-key-skip behavior — but that reasoning is from platforms.web.notes, not rn, and it directly contradicts this package's stated convention ('do not pass disabled to Pressable — it removes focus'). Changed disabled options to stay focus stops (accessibilityState.disabled + a press guard, no native disabled), consistent with how Checkbox handles its own disabled state and with the rn notes' claim that 'every radio is a stop for the screen reader and for hardware-keyboard focus.'
- RadioGroup: the schema's `transition` style binding (motion.duration.fast) wasn't wired to anything in the prior implementation. Added a per-option Animated crossfade of the selected border color and indicator dot opacity (mirroring Checkbox's fill animation), reusing motion.easing.standard and respecting useReducedMotion(), since the spec names a transition token but doesn't say which visual property it drives on native.

## 2026-09-16 05:00 — round 1

- RadioGroup: the spec says required shows copy.required only 'on a failed submit' but that invalid 'renders copy.invalid'; the rendered error is therefore error prop → Form's message → copy.invalid when invalid, and copy.required never appears without a Form or an error prop. Say whether a standalone required group ever renders copy.required.
- RadioGroup: copy.position is declared but only the SwiftUI note says where it goes; on RN I put it in each radio's accessibilityValue={{ text }}. Confirm, or say it belongs in the label.
- RadioGroup: the RN note says accessibilityLabel is 'label plus description' but not how they are joined; I used `${label}, ${description}` (a comma, like the Fieldset legend prefix).
- RadioGroup: the accessibilityLabel uses the visible legend including copy.requiredIndicator (' (required)'); the spec says accessibilityLabel={label}. I kept the indicator so required is announced, not only seen.
- RadioGroup: the anatomy lists `group` but the root must carry testID="RadioGroup"; the root is the group and has no separate `RadioGroup.group` hook.
- RadioGroup: the web note says radioIndicator has no hook on any platform; on RN the dot is a real view, so it carries testID="RadioGroup.radioIndicator". Say whether to drop it for parity.
- RadioGroup: the focus-visible part is not named; the focus ring (border.width.focus in color.border.focus) replaces the control's border, like Checkbox, rather than outlining the whole row.
- RadioGroup: the Default story's args are not specified; I used the shipping-method example with nothing selected, because a preselected 'standard' makes the scenario 'click radio → onChange standard' impossible (clicking the selected radio fires nothing). The scenarios therefore depend on Default having no defaultValue.
- RadioGroup: keyboard rules (arrows, roving tabindex) are excluded on RN by the platform note; the Keyboard story is just the Default args (three radios as three focus stops) since the component has no trigger or open state.
- RadioGroup: a disabled option inside an enabled group is dimmed with opacity.disabled on its row; the group opacity is not stacked on top when the whole group is disabled. The spec only defines opacity for the whole element.
- RadioGroup: the vertical padding on each option row (space.1) and the gap between radioLabel and radioDescription (partGap) have no binding; I borrowed Checkbox's choices.
- RadioGroup: behavior scenarios 'disabled-group-is-inert' and 'invalid-renders-the-invalid-copy' limit their state expectations to web/lit; on RN I only assert onChange not firing and the copy text, and the radio's unchecked state.
