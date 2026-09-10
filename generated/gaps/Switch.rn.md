# Gaps reported while generating Switch for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:47 — round 1

- Switch (rn): the existing implementation lacked the `overrides` prop and `testID` required by every component in this package. Added `SwitchOverridableBinding` covering only `gap`, `partGap`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity` — excluded `trackWidth`, `trackHeight`, `thumbSize`, `thumbInset`, `radius`, `transition` from the type entirely (rather than accepting-and-ignoring them) since the platform notes say those are OS-controlled by the native Switch and would be silent no-ops; also added `testID="Switch"` to the root Pressable.

## 2026-09-10 17:45 — round 1

- Switch (rn): trackWidth, trackHeight, thumbSize, thumbInset, radius and transition are OS-controlled by the native Switch, so they are omitted from SwitchOverridableBinding entirely (rather than accepted-and-ignored) since an override on them would be a silent no-op; gap, partGap, labelSize, labelWeight, helperSize, fontFamily, lineHeight and disabledOpacity remain overridable.
- Switch (rn): the spec's Behavior section says the field reads FieldsetContext to fold in group disabled and prefix the legend into the accessible name, but Fieldset.tsx documents that Input/Checkbox/Switch/RadioGroup haven't been updated to read it yet and instead relies on a clone-children fallback that force-sets `disabled` on direct children; left Switch consistent with that documented interim state rather than adding FieldsetContext support to only this one component.
