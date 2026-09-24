# Gaps reported while generating Search for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 19:25 — round 1

- Search: `name`/`action` are web-only concepts (URL query key / GET navigation target). RN has no navigable form, so both are accepted for API parity but have no runtime effect; a __DEV__ warning fires if `action` is set.
- Search: the web keyboard model has ArrowDown/ArrowUp move a highlight through suggestions while focus stays in the input (aria-activedescendant). Listbox's rows are touch Pressables with no key-event API on native, so arrow-key highlighting has no native equivalent — the same acknowledged limit Combobox/Listbox already document. Suggestion selection is touch-only; Enter always submits the typed query, never a highlighted row.
- Search: the schema never defines an explicit open/closed state for RN's inline (non-overlay) suggestions rendering — only that suggestions 'render below the field in a View'. I inferred suggestions show while the field is focused and `suggestions` is set, and close on blur or on Escape (matching Combobox's own focus/open model), since rendering them unconditionally whenever `suggestions` is set would leave them visible even when the field isn't in use.
- Search: `copy.loading` ('Loading suggestions') must appear verbatim, but Listbox's own `loading` prop always shows its internal 'Loading…' text regardless of `emptyMessage`. Worked around by never forwarding `loading` to Listbox — passing empty `options` and `emptyMessage={copy.loading}` instead — so the verbatim copy renders.
- Search: the web platform notes hide the submit button when `action` is absent, but the schema's general Behavior section states 'The submit button is always rendered.' Followed the latter for RN, since `action`/navigation isn't a native concept and Enter alone may not be reachable from an on-screen keyboard.
- Search: no style binding governs the leading/glyph icon's size scaling with the `size` prop; chose `sm` at `md` and `md` at `lg` as a proportional visual judgment call.

## 2026-09-16 10:00 — round 1

- Search: events map to rn names onChangeText/onSubmitEditing/onClear, so the props were renamed from onChange/onSubmit — a breaking change for existing callers; the doc does not say whether the old names stay as deprecated aliases (none kept).
- Search: the Guidance prose says 'The landmark is the composed Landmark (search) named by label' and the React Native note says 'View accessibilityRole=search', while the schema's `landmark` description says role=search on Search's own element, not a composed Landmark. Followed the schema: root View gets accessibilityRole='search', no Landmark, no landmark label. The prose should be fixed.
- Search: platforms.rn.props puts accessibilityRole=search on the TextInput, and the notes put it on the container View. On react-native-web that role on an input becomes a second search landmark instead of a searchbox. Chose: container when `landmark`, and the TextInput only on non-web platforms (for the iOS search-field trait).
- Search: Guidance web note says the submit Button renders 'when action is set', but the platforms.web note says it is always rendered. Followed 'always rendered'.
- Search: submit Button size is not given in platforms.web.notes ('ghost, iconOnly'), while clear is 'ghost, sm'. Used sm for both, matching the generated React Search. Both Buttons' icon color is unspecified; used color.foreground.muted as React and Combobox do.
- Search: composition lists no props for Text/Button, and suggestions gets only `embedded`, but Listbox needs label/options/onChange and the Buttons need variant/size/iconOnly. Passed those functional props and no style overrides. The Listbox label is not specified; used the field `label`. Passed value='' so the list shows no persistent selection after a choice (unspecified).
- Search: the visible label Text (showLabel) has no typography spec (weight/size). Rendered a default Text and hid it from accessibility, because the TextInput already carries accessibilityLabel and would otherwise be read twice.
- Search: choosing a suggestion 'fills the query' but onChange is documented as 'every keystroke'. Fired onChangeText(label) on choice so a controlled parent can show it. Also fired onChangeText('') before onClear on the clear button and Escape, since a controlled field cannot empty otherwise.
- Search: 'shown while the field has focus … closed on blur' conflicts with tapping a row: on react-native-web the input blurs on pointerdown and the list would unmount before the press. Kept it open while a touch or pointer press is in the suggestions view, then closed it if focus did not return. keyboardShouldPersistTaps='handled' is named, but Search has no ScrollView of its own to put it on — the caller's ScrollView needs it.
- Search: the count/loading live region is 'visually hidden' on web; RN has no visually-hidden primitive. Used a 1×1 absolutely positioned, overflow-hidden View with accessibilityLiveRegion=polite, plus announceForAccessibility on iOS. The announcement debounce (motion.duration.base × 2, copied from Combobox) is not in the Search doc.
- Search: popupBorder has a color binding but no width binding. Used border.width.thin, not overridable.
- Search: the focus state's border width is not stated (focusRingWidth border.width.focus is locked but has no part/state). Drew the focused field border at border.width.focus in color.border.focus and reduced padding so the text does not move.
- Search: Form contract gives value/name but no validation (no required/invalid props) and does not say whether a disabled Search is submitted. Registered getValue as the raw query string, validate always null, not registered while disabled (as Input).
- Search: `trimmed query` on submit is only in Guidance prose, not in the event payload description. Submitted the trimmed query and skipped empty ones.
- Search: Keyboard story must render 'open', but Search has no open/defaultOpen prop; suggestions show only on focus. The story sets defaultValue and suggestions so input, clear and submit give three focusables; the list appears on focus.
- Search: Escape and Enter scenarios are web/Lit-only; on native, Escape is handled through onKeyPress only where a hardware keyboard or react-native-web reports it, with no test.

## 2026-09-17 12:54 — round 1

- Search: the rn notes say the list opens 'by typing while the field has focus' and say nothing about ArrowDown, but the keyboard table says ArrowDown opens suggestions. I also open the list on ArrowDown from a hardware keyboard or react-native-web (onKeyPress), without highlighting a row, because Listbox rows have no key events.
- Search: a component with a keyboard block needs a `Keyboard` story 'rendering it open', but Search has no `open` prop and must never open on focus alone. The story can only show the closed field with a query and suggestions; the list appears after typing. The spec doesn't say how an open-state story should work without an open prop.
- Search: `statusDebounce` must come from the standard `motion.duration.base`, 'never from a reduced-motion override that zeroes the token'. On RN the theme tokens are never zeroed (reduced motion is a separate `useReducedMotion()`), so I read `t.motionDurationBase * 2`. Nothing says whether native needs a separate non-reduced token source.
- Search: composition gives the Buttons `leadingIcon: close` / `arrow-right`, but the RN Button's `leadingIcon` is a ReactNode and the spec also says 'nothing is forwarded into a Button'. The glyph color and size are unspecified. I passed `<Icon name=… color={t.colorActionGhostForeground} />` at the Icon's default size, as Dialog does. The previous code used size `xs` and `color.foreground.muted`.
- Search: `iconColor` is locked but also listed as forwarded to the Icon's `overrides.color`. I pass the fixed ref `'color.foreground.muted'` through `overrides` rather than the `color` prop. The spec doesn't say whether a locked forward should use `overrides` or RN Icon's `color` prop.
- Search: the label `fontSize` forward uses Search's `fontSize` override when given, otherwise `font.size.{size}` as a TokenRef. The spec doesn't say whether the default is forwarded when there's no override or only a caller's override is.
- Search: `disabled` says the input is 'read-only … still focusable'. RN has only `editable={false}`, which on iOS/Android may take the field out of text focus. I used `editable={false}` plus `accessibilityState.disabled` and noted nothing further.
- Search: `platforms.rn.props` lists `accessibilityRole=search` as if it belongs on the TextInput element, but the notes say never on the TextInput, only on the container when `landmark`. I followed the notes.
- Search: the disabled clear button — the web says it appears when there is text, and `disabled` says both Buttons are disabled. I render it when there is text, disabled. The previous version hid it while disabled.
- Search: blur-close during a list press relies on onTouchStart/onPointerDown on the wrapper View plus a setTimeout(0) check. The spec describes the behavior but not how long 'a press in progress' lasts, or whether a long press or scroll inside the list counts.

## 2026-09-21 17:18 — round 1

- Search: a11y.role is `searchbox`, which React Native's accessibilityRole list does not have (it has `search`, which the rn notes forbid on the TextInput). I put `role="searchbox"` on the TextInput — RN maps it to the iOS search-field trait and react-native-web passes it through as the ARIA role — and left accessibilityRole="search" on the root View. The doc names no role for the native input at all.
- Search: `loading` says it is "announced through copy.loading", but the rn notes describe announcements only in terms of the open list. I announce copy.loading whenever `suggestions` is set and `loading` is true (list open or not), and the count / copy.noSuggestions only while the list is open.
- Search: the `suggestions` contract lists Listbox wiring that is web-only — an `id` for aria-controls and option ids, `onActiveChange`, aria-activedescendant, and "a key that remounts it to clear the highlight". Native rows are touch Pressables with no highlight to clear, so I pass only label, options, value="", embedded, selectionFollowsFocus={false} and emptyMessage, and no remount key. The doc does not say which of that list survives on native.
- Search: `disabledOpacity` is specified to dim "the label, glyph and input" but not the field frame. Dimming the input over an undimmed color.control.background drops the foreground/placeholder pairs below the AA figures listed in a11y.contrast. I followed the doc; the contrast entries appear to assume the enabled state only.
- Search: the `label` composition passes `element: span` to Text, which the React Native Text has no prop for. I forward only labelWeight→overrides.fontWeight and fontSize→overrides.fontSize, both always carrying the binding's token.
- Search: `layer` is in the overridable set, and the binding's own description says it is unused on native. A caller overriding it therefore gets silence; the doc does not say whether it should instead be excluded from the native overrides type.
- Search: the rn notes say `name` "does nothing" on native, but the form contract makes `name` the key the field registers under, and native Form registration is explicitly in scope. I use `name` (default "q") as the FormContext key, so only `action` is truly inert.
- Search: the clear button is specified to return focus to the input, but nothing is said about focus after the submit button or after choosing a suggestion. I refocus only after clear and leave focus where it is otherwise.
- Search: an empty trimmed query does not fire onSubmit, but the doc does not say whether that attempt should still close an open suggestions list. I close the list on every submit attempt, empty or not.
- Search: the keyboard table's Tab rule ("to the clear button, then the submit button") has no native equivalent and on react-native-web falls out of DOM order, so nothing is implemented for it; likewise Escape and ArrowDown only reach the field through onKeyPress from a hardware keyboard.

## 2026-09-23 14:45 — round 1

- Search: the disabled prop and Form-level disabled say to unregister from the Form, but the RN FormContext says a disabled field 'stays registered and reports isDisabled()'. I kept the unregister the Search spec asks for; one of the two docs should give way.
- Search: 'a blur with no new focus target, such as a window switch, does not close it' can't be told apart from a real blur on React Native (onBlur carries no relatedTarget). Every blur outside a press in the list closes it.
- Search: the plural form should follow 'the locale of the nearest [lang] ancestor, falling back to the device locale'. Native has no [lang] ancestor, so it uses new Intl.PluralRules(undefined), the runtime default. The rn notes could say this.
- Search: the rn props list has role=searchbox, while the web notes switch the input to role=combobox whenever suggestions is set. The rn notes don't say whether native switches too. I kept searchbox and exposed the open state through accessibilityState.expanded / aria-expanded, which on react-native-web puts aria-expanded on a searchbox role (not a valid ARIA pairing).
- Search: popupShadow resolves to the RN shadow style object, but the docs don't say which RN shadow props (shadowColor/Offset/Opacity/Radius, elevation, boxShadow) the shadow.overlay token carries. It is spread into the inline list's style as is.
- Search: the 'target-24px' requirement and the 'minTarget: size.target.comfortable' binding pull in different directions for the field row. The row uses minHeight t.sizeTargetComfortable; the Buttons bring their own targets.
- Search: disabled says 'every key is inert and no event fires', and the controlled contract says 'the event fired in both modes'. The docs don't say whether a controlled disabled Search that the caller changes programmatically should report anything. It doesn't.

## 2026-09-23 14:45 — round 1

- Search: platforms.rn.props lists `accessibilityRole=search` among the TextInput's props, but the notes say it goes only on the container View and never on the TextInput; the notes win (the existing file already does this).
- Search: the input's role is `searchbox` on native (platforms.rn.props), but with `suggestions` it also carries `accessibilityState.expanded`. The mirror-every-prop rule calls for `aria-expanded`, which ARIA does not allow on `searchbox`, so axe's aria-allowed-attr would fail. The spec should say whether native switches to `role="combobox"` while `suggestions` is set (as web does) or leaves `expanded` unmirrored. I would have left it unmirrored.
- Search: the `aria-disabled` on the dimmed root is required only by the disabledOpacity description, not by the platforms.rn notes; the rn notes should name it.
- Search: the Keyboard story must use the `with-suggestions` example's suggestions (from the Behavior prose), but the Keyboard rules in the spec don't say so.
- Search: blur-with-no-new-focus-target (a window switch does not close the list) has no native equivalent; native closes on every blur except during a press inside the list. The notes don't say whether that web exemption applies on react-native-web.

## 2026-09-23 19:22 — round 1

- Search: the guidance says clear returns focus to the input, but on native a Button press cannot be verified in the test renderer; I call inputRef.focus() after clear and left it untested.
- Search: the spec says a `suggestions` array arriving while the field is focused but untouched must not open the list, yet also that the list closes on blur to an element outside Search. Native has no 'element outside Search' notion, so I close on any input blur except during a list press.
- Search: 'locale of the nearest [lang] ancestor' has no native equivalent; I use Intl.PluralRules(undefined), the runtime locale.
- Search: the Escape rule says 'closes suggestions if open', but with the list opened by ArrowDown and no rows highlighted on native it was unclear whether an empty list counts as open; I treat any shown list as open.
- Search: the schema lists an `open` state only implicitly. The Keyboard story cannot start open, so I render a closed field with defaultValue and suggestions as the guidance says.

## 2026-09-23 19:22 — round 2

- Search: platforms.rn says the TextInput takes role="searchbox", but the schema also puts aria-expanded on it when suggestions are set, and searchbox does not allow aria-expanded (axe aria-allowed-attr). The web note says combobox wins whenever `suggestions` is set; the rn notes never say so. I applied the web rule on native: role is combobox with suggestions, searchbox without. The rn notes should state it.
- Search: aria-autocomplete="list" is required by the web combobox note, but RN TextInput does not obviously type that prop, so I did not set it on native. The doc should say whether native needs it.
