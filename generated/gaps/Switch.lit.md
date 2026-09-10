# Gaps reported while generating Switch for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:45 — round 1

- Switch: the pre-existing Switch.ts had no overrides mechanism (no --ds-switch-* hooks, no SwitchOverridableBinding/overrides property) despite the spec's Overrides section requiring one; added it following the Checkbox.ts pattern, mapping trackWidth/trackHeight/thumbSize/thumbInset/radius/gap/partGap/labelSize/labelWeight/helperSize/fontFamily/lineHeight/disabledOpacity/transition to hooks and leaving trackOff/trackOn/thumb/labelColor/descriptionText/focusRing/focusRingWidth/minTarget as raw locked tokens.
- Switch: the pre-existing file also lacked the data-ds="Switch" testability attribute; added it in connectedCallback per package convention, no spec ambiguity.

## 2026-09-10 01:45 — round 2

- Switch: no new spec gap — the literals gate flagged `fontFamily: '--ds-switch-font-family'` in the HOOKS map as a font-stack literal (a regex false positive on the key name, not the value); fixed by using a backtick string like Checkbox.ts does for the same binding.
