# Gaps reported while generating Combobox for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 10:00 — round 1

- Combobox: the schema gives no `open`/`defaultOpen` prop (unlike Menu/Dialog/BottomSheet), so the `Keyboard` story can't render pre-opened; it ships closed with ≥3 options and a comment explaining why, instead of the usual `open: true` pattern.
- allowCustom: the doc says the popup 'shows copy.addCustom as the first row' but Listbox's own schema has no concept of an injected action row. Implemented by prepending a synthetic ListboxOption (a sentinel-prefixed value) to the array passed through Listbox's existing `options` prop, and stripping the sentinel on commit — no change to Listbox itself, but it's a workaround rather than a modeled feature.
- Keyboard model: Listbox's rows are touch Pressables with no key-event API (Listbox's own acknowledged native limit), so ArrowDown/ArrowUp/Home/End/Alt+ArrowDown/Alt+ArrowUp have no native equivalent at all. Enter only commits typed custom text (onSubmitEditing) since there is no 'active option' to commit otherwise. Escape (close, then clear) only fires via onKeyPress, which on-screen keyboards do not emit — reachable only via a hardware keyboard or react-native-web. Tab's 'closes without committing' has no distinct hook; blur closing the popup is the closest analogue.
- Platform notes describe chips appearing 'in the sheet header' inside the phone BottomSheet, but BottomSheet's actual API only exposes `title`/`children`/`footer` (no header slot), and the composition rule forbids growing a composed child's API for this generation pass. Chips + the TextInput are rendered at the top of the sheet's scrollable body instead.
- On the phone closed-field summary (the Pressable that opens the BottomSheet), chips render read-only with no remove button, and no clear button is shown, because nesting a Pressable (chip-remove / clear) inside the summary's own Pressable creates a touch-handling conflict on RN. Chip removal and clearing are only available once the sheet is open.
- The schema's 'loading row' and empty/no-matches row are both modeled through Listbox's single `emptyMessage` slot (showing copy.loading instead of copy.empty while async-loading) rather than as two distinct list affordances, since Listbox has no separate loading-row concept.
- The tablet/react-native-web popup is a Modal that deliberately does NOT focus-trap (unlike Select/Menu/Dialog's popups), because the APG combobox model requires focus to stay in the text input while the list is browsed by touch. This is an intentional deviation from the trapping pattern used elsewhere in the package.
- Added a 'Done' copy string for the BottomSheet footer under `multiple`, not present in the schema's `copy` block — the same addition Select's own RN generation already makes for its BottomSheet footer.
- Result-count/loading/empty announcements fire via AccessibilityInfo.announceForAccessibility on both iOS and Android (debounced ~motion.duration.base×2), unlike the existing iOS-only gating used for the error-message announcement elsewhere in the package, since the spec doesn't distinguish platforms for this one; Android additionally gets accessibilityLiveRegion="polite" on the status view.

## 2026-09-10 18:46 — round 1

- Combobox: no open/defaultOpen prop in the schema, so the Keyboard story ships closed with ≥3 options rather than pre-opened.
- allowCustom: copy.addCustom row is implemented as a sentinel-prefixed synthetic ListboxOption prepended to Listbox's options, since Listbox has no injected-action-row concept.
- Keyboard model: Listbox rows are touch Pressables with no key-event API, so ArrowDown/ArrowUp/Home/End/Alt+ArrowDown have no native equivalent; Enter only commits typed custom text; Escape only fires via onKeyPress (hardware keyboard/react-native-web only); Tab's non-commit behavior has no native hook, blur-closes instead.
- Platform notes mention chips 'in the sheet header' but BottomSheet's API has no header slot, so chips + TextInput render at the top of the sheet body instead.
- Phone closed-field summary shows chips read-only with no remove/clear button (nesting Pressables would conflict); removal/clearing only available once the sheet is open.
- Loading row and empty/no-matches row are both modeled through Listbox's single emptyMessage slot, since Listbox has no separate loading-row concept.
- Tablet/react-native-web popup Modal deliberately does not focus-trap (unlike Select/Menu/Dialog), since focus must stay in the text input per the APG combobox model.
- Added a 'Done' copy string for the BottomSheet footer under multiple, not present in the schema's copy block (same addition Select's RN generation makes).
- Result-count/loading/empty announcements use AccessibilityInfo.announceForAccessibility on both iOS and Android, unlike the iOS-only gating used elsewhere for error announcements, since the spec doesn't distinguish platforms here.
