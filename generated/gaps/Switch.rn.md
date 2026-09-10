# Gaps reported while generating Switch for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:47 — round 1

- Switch (rn): the existing implementation lacked the `overrides` prop and `testID` required by every component in this package. Added `SwitchOverridableBinding` covering only `gap`, `partGap`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity` — excluded `trackWidth`, `trackHeight`, `thumbSize`, `thumbInset`, `radius`, `transition` from the type entirely (rather than accepting-and-ignoring them) since the platform notes say those are OS-controlled by the native Switch and would be silent no-ops; also added `testID="Switch"` to the root Pressable.
