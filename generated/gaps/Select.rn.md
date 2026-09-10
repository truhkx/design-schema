# Gaps reported while generating Select for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:48 — round 1

- Select: `native` has no distinct native meaning for `always` (web's 'force a real <select>') since RN has no OS picker without a banned community dependency (Picker); treated `always` identically to `auto` (phone-width => BottomSheet, else the popup Modal). Only `never` differs (always the popup).
- Select: the schema gives Select no breakpoint token to distinguish 'phone' from 'tablet/react-native-web' (unlike BottomSheet, which has its own overridable `maxWidth`); reused `t.layoutMaxWidthProse` as the cutoff, matching BottomSheet's own internal technique, but it is not one of Select's overridable/locked bindings.
- Select: platforms.rn notes require a footer Done button in the BottomSheet when `multiple`, but the component's `copy` block has no string for it; used a literal 'Done' — flag if the docs pass wants to add a `copy.done` entry.
- Select: the popup wraps the existing `Listbox` (which already draws its own `color.border.strong` border and `color.background` background) inside the popup's own bordered/surfaced container (`popupSurface`/`popupBorder`/`popupRadius`/`popupShadow`) per the schema's own bindings; Listbox has no borderless mode, so this can read as a visible double border/background around the popup on native.
- Select: focus-restore-on-close is done by hand (`findNodeHandle` + `AccessibilityInfo.setAccessibilityFocus` on the trigger) rather than via `FocusScope`'s `restoreFocus`, because that only recaptures a `TextInput`, never a `Pressable` trigger — the same limit `Popover` already documents.
- Select: only Escape (Android back gesture)/outside-tap dismiss and Enter-as-press commit are implemented from the web keyboard model; Tab-commits-and-closes, arrow/Home/End/typeahead navigation on the trigger itself, and opening with the previously-selected option pre-focused have no native equivalent (Pressable has no key-event API) — the same acknowledged gap Listbox and Menu already document.
- Select: the task's Output section asked only for `Select.tsx`, so no `Select.stories.tsx` was generated — the package conventions require a `Keyboard` story for any component with a `keyboard` block (for the axe gate and manual keyboard checks on react-native-web); that story does not exist yet.
- Select: web-only wiring named in `platforms.web` (aria-controls/aria-labelledby, a hidden `<input name>` for native form submission) has no native counterpart, per the platform notes' own 'No hidden input; Form registration as Input' callout — the field registers directly with `FormContext` by `name` instead.
