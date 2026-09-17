# Gaps reported while generating Switch for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:47 — round 1

- Switch (rn): the existing implementation lacked the `overrides` prop and `testID` required by every component in this package. Added `SwitchOverridableBinding` covering only `gap`, `partGap`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity` — excluded `trackWidth`, `trackHeight`, `thumbSize`, `thumbInset`, `radius`, `transition` from the type entirely (rather than accepting-and-ignoring them) since the platform notes say those are OS-controlled by the native Switch and would be silent no-ops; also added `testID="Switch"` to the root Pressable.

## 2026-09-10 17:45 — round 1

- Switch (rn): trackWidth, trackHeight, thumbSize, thumbInset, radius and transition are OS-controlled by the native Switch, so they are omitted from SwitchOverridableBinding entirely (rather than accepted-and-ignored) since an override on them would be a silent no-op; gap, partGap, labelSize, labelWeight, helperSize, fontFamily, lineHeight and disabledOpacity remain overridable.
- Switch (rn): the spec's Behavior section says the field reads FieldsetContext to fold in group disabled and prefix the legend into the accessible name, but Fieldset.tsx documents that Input/Checkbox/Switch/RadioGroup haven't been updated to read it yet and instead relies on a clone-children fallback that force-sets `disabled` on direct children; left Switch consistent with that documented interim state rather than adding FieldsetContext support to only this one component.

## 2026-09-16 04:53 — round 1

- Switch: the Overrides section lists trackWidth, trackHeight, thumbSize, thumbInset, radius and transition as overridable, but platforms.rn.notes says the native Switch draws them and they are not overridable on native. I left them out of SwitchOverridableBinding so an override can't silently do nothing; the doc should say which one wins per platform.
- Switch: the `thumb` part has no view of its own on React Native (the native Switch draws it), so there is no `Switch.thumb` testID. `Switch.track` is on the native Switch itself.
- Switch: `disabled` says 'Stays visible, readable and focusable', but a disabled native Switch can't take focus and the rn rules forbid passing `disabled` to Pressable. I pass `disabled` to the native Switch (the documented exception) and note the limit in the prop's JSDoc.
- Switch: the behavior scenarios say `click: track`, but React Native has no click on a native Switch. The tests fire `valueChange` on the switch role instead, and `fireEvent.press` for label and description.
- Switch: `focusRing`/`focusRingWidth` and `minTarget` are locked. The focus ring can't be drawn because the native Switch has no focus events, so the OS indicator is used. minTarget is applied as the row's minHeight, and the whole row is the target.
- Switch: the Fieldset behaviour (group disabled, title prefixing the accessible name as '<title>, <label>') is only in the Guidance prose, not in the schema. I followed Checkbox's form of it.
- Switch: the spec defines no copy for the Fieldset prefix separator, so ', ' is taken from Checkbox and isn't a copy.* string.
- Switch: `fires: user` — a controlled prop change doesn't fire onValueChange. A press that asks for the current value (next === checked) also fires nothing; the spec doesn't cover that no-op case.
- Switch: the spec has no row padding. The old component added paddingVertical space1 and a padded, radius.full frame around the track; I removed both and kept only minHeight = size.target.comfortable.

## 2026-09-17 05:06 — round 1

- Switch: the prompt's Overridable list includes trackWidth, trackHeight, thumbSize, thumbInset, radius and transition, but platforms.rn.notes says they are left out of the RN overridable type. I followed the platform notes: SwitchOverridableBinding is gap, partGap, labelSize, labelWeight, helperSize, fontFamily, lineHeight, disabledOpacity.
- Switch: props.disabled says a disabled Switch 'still registers with the Form, where the Form's disabled-field rule applies', but the RN Form's rule is that disabled fields do not register (Form.tsx docs). Checkbox RN doesn't register when disabled either. I kept that: a disabled Switch unregisters, so its key is left out.
- Switch: the events contract says to name the handler by its platforms.rn name (onValueChange), but the generic rules and the Checkbox RN sibling use onChange. I kept onValueChange as the spec says, so RN Switch and Checkbox now use different callback names.
- Switch: the rules say 'disabled uses opacity.disabled on the whole element', while the disabledOpacity binding lists track, label and description. Those three are the whole row on RN, so the whole Pressable row is dimmed. Checkbox RN leaves the description undimmed, so the two differ.
- Switch: labelSize's track-alignment rule (centre the track on the label's first line, labelSize × lineHeight) is written with the web calc in mind. On RN the native Switch (about 31pt on iOS) is taller than a 24pt line, so it spills evenly above and below that slot. The spec doesn't say whether the 44pt minHeight row should instead centre a single-line row.
- Switch: the 'disabled' example says the setting stays 'focusable', which contradicts the RN platform limit (a disabled native Switch can't take focus). The story keeps the given args; the RN note wins.
- Switch: the generic rules say to style focus-visible in the Pressable style callback, but platforms.rn says the row Pressable is accessible={false} and the OS focus indicator is used. I followed the platform notes: no focus styling, and focusRing/focusRingWidth aren't applied.
- Switch: the generic rules ask for Storybook stories wrapped in ThemeProvider, but the package uses the withTheme() decorator. I kept the decorator, as the package conventions say.
