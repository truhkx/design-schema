# Gaps reported while generating Menu for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:21 — round 1

- Menu: no ActionSheet component exists in this package yet (only referenced in FocusScope's own doc comment), so the phone-vs-tablet split the platform notes describe ("Menus on touch are ActionSheets") isn't implementable by composition. Chose to always render the anchored transparent-Modal dropdown, on phones too, and documented this as an acknowledged limit in the JSDoc.
- Menu: platform notes say "the trigger Button carries accessibilityState.expanded", but Button's schema/props have no accessibilityState or expanded hook (Button only sets its own internal accessibilityState={{disabled, busy}}). Left the trigger's expanded/collapsed state unexposed to assistive technology rather than restyle/reach into Button; flagged for Button's schema to grow an `expanded` prop.
- Menu: arrow-key navigation, Home/End, and a-z typeahead are a web keyboard model with no RN equivalent — core RN Pressable has no generic key-event API (confirmed by RadioGroup's own precedent of 'no roving tabindex or arrow movement on native'). Implemented only what native affords: Enter/Space (via onPress) to activate, Escape/back gesture (via Modal onRequestClose) to dismiss, and each item as its own Tab stop for an external keyboard.
- Menu: opening via ArrowUp on the trigger (to focus the last item) can't be distinguished from Enter/Space/click, since Button exposes only onPress. Every open always focuses the first enabled item; focusing the last item on ArrowUp is not implemented.
- Menu: disabled items keep the native `disabled` prop off the Pressable (per the package's general disabled-state rule) and rely on accessibilityState.disabled plus a press guard, so they stay in the Tab order — this differs from Button/RadioGroup in this same package, which do pass `disabled` to Pressable; followed the digest's explicit instruction over that precedent.
- Menu: no scroll token/behavior is specified for a popup taller than the viewport; the popup grows to fit its content with no clipping or internal ScrollView. Flagged as an open question for very long menus.
- Menu: `start`/`end` placement is resolved against I18nManager.isRTL (mirroring Text's toTextAlign convention) but is unverified against a live RTL app.
- Menu: minWidth default is computed as `t.space20 * 2.5` per the schema's own description ("space.20 × 2.5, i.e. 200px") since no dedicated token exists; marked literal-ok.

## 2026-09-10 02:44 — round 1

- Menu: no ActionSheet component exists in this package yet, so RN always renders the anchored dropdown Modal (even on phones) instead of the touch ActionSheet presentation the docs describe.
- Menu: RN has no generic key-event API on Pressable, so ArrowUp/ArrowDown/Home/End movement and a-z typeahead are not implemented; each item is its own Tab stop instead (same convention as RadioGroup).
- Menu: opening via ArrowUp to focus the last item can't be distinguished from Enter/Space activation on Button, so opening always focuses the first enabled item regardless of how it was triggered.
- Menu: Button has no prop to carry accessibilityState.expanded, so the trigger's expanded/collapsed state isn't exposed to assistive technology on RN.
- Menu: the popup is not scrollable — a very long item list just grows to fit its content, which can overflow the viewport on small screens.

## 2026-09-10 18:21 — round 1

- Menu: on phones ActionSheet has no slot for a group's label row or a mid-list separator (its own props are just `actions`/`title`/`cancelLabel`), so composing it means flattening groups and dropping their label, and dropping standalone separators, rather than the 'groups become dividers with a muted label' the platform notes describe. Chose to flatten silently (in `toActionSheetActions`) rather than fake a label via a disabled row, since that would misrepresent a heading as an inert menu item.
- Menu: ActionSheet's four close reasons (escape, scrim, cancel, drag) don't map onto Menu's own onOpenChange reasons (trigger, escape, outside, action, controlled) 1:1 — `scrim`, `cancel` and `drag` all collapse to `outside` (`mapActionSheetCloseReason`).
- Menu: `shortcut` display-only hints have no ActionSheet equivalent and are dropped in the phone presentation (reasonable since touch has no keyboard, but not explicit in the spec).
- Menu: `typeaheadReset` is in the overrides union for schema completeness but has no runtime effect — there is no typeahead on this platform (no generic key-event API on `Pressable`), the same acknowledged limit as arrow-key navigation and Home/End.
- Menu: the phone/tablet breakpoint isn't named by any of Menu's own style bindings, so the generator reused `layout.maxWidth.prose` — the same token/threshold `Select` and `Combobox` already use for their own phone-vs-tablet split — rather than inventing a new one.
- Menu: `maxHeight`'s schema description says the popup is also capped by 'the viewport minus the gutter', but no gutter token is named; implemented as `windowHeight - popupOffset * 2`, reusing `popupOffset` for lack of a dedicated gutter binding.
- Menu: the previously generated file's doc comments claimed two limits that no longer hold now that ActionSheet and Button's `expanded` prop exist in the package — both are fixed in this pass (composing ActionSheet on phones; passing `expanded` to the trigger Button).

## 2026-09-10 20:21 — round 1

- Menu: ArrowUp-on-trigger opening with the last item focused (keyboard rule) can't be distinguished from Enter/Space on the native Button, so opening always focuses the first enabled item — documented as an acknowledged native limit rather than implemented.
- Menu: arrow-key movement, Home/End, and typeahead are a web keyboard model with no RN equivalent (no generic key-event API on Pressable); each item is instead its own Tab stop when a hardware keyboard/tab order is present, matching RadioGroup's convention. typeaheadReset has no effect on native since there is no typeahead to reset.
- Menu: on phones the ActionSheet composition has no slot for a group label row or a separator, so `group` labels and `separator` entries are dropped (flattened) in the phone presentation — items still render, but the grouping/dividers are lost below the tablet breakpoint.
- Menu: the schema's minWidth token (space.20 x 2.5) is not a real token multiple, so the generator computes it inline as `t.space20 * 2.5` with a literal-ok comment rather than adding a new token.
