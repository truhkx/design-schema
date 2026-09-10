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
