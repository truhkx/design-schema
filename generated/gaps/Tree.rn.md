# Gaps reported while generating Tree for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 14:28 — round 1

- No RN element expresses a11y.role 'tree'/'treeitem'/'group'; per the platform notes I used FlatList with accessibilityRole='list' and accessibilityLabel={label}, with per-row accessibilityState/accessibilityActions carrying expanded/selected/checked state instead.
- Anatomy's 'group' (nested container per open parent) has no separate wrapper: visible children are flattened into the single virtualized FlatList (matching the existing TreeGrid precedent) rather than rendered as nested per-parent group views.
- Arrow-key navigation, roving tabindex, Home/End, type-ahead, Shift+Arrow and Ctrl+A are web keyboard-model behaviors with no hardware-keyboard equivalent on most RN devices; only Enter-equivalent (tap to activate) and the always-visible expand chevron are implemented, with expand/collapse also exposed via accessibilityActions for assistive technology, per the 'implement the reachable subset' rule.
- In `multiple` mode the row has no outer Pressable — the composed Checkbox's own control and label are the entire hit target — so onActivate/href navigation is not reachable there (no native gesture distinguishes 'move' from 'select' the way Enter/Space do on web); activation only fires in `none`/`single` mode. Documented rather than adding a second overlapping touch target.
- Checkbox owns its own visible/accessible label, so in `multiple` mode the row's accessible name is the plain node label (no ', level N' suffix); the '{label}, level {n}' format from the platform notes is only applied in `none`/`single` mode where the row itself is a Pressable exposing accessibilityLabel.
- `selectOnFocus` (documented for `single` mode) is wired to the row Pressable's onFocus event, which fires for external-keyboard tab focus and assistive-technology (VoiceOver/TalkBack) navigation on RN/react-native-web — there is no separate 'move' input on touch, so this is the closest native analogue to the web behavior.
- href navigation combined with `selectable: 'multiple'` has no dedicated tap target (the row's only interactive area is the Checkbox, which toggles selection); href is only actionable in `none`/`single` mode via Linking.openURL.
- 'live-region' is implemented as the docs' explicit accessibility note describes: only `copy.selectedCount` announcements on selection change in `multiple` mode (AccessibilityInfo on iOS, a hidden polite-live-region Text on Android) — expand/collapse changes are conveyed via each row's own accessibilityState.expanded rather than a separate announcement, matching TreeGrid's existing precedent in this package.
