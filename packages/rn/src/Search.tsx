import * as React from 'react';
import { AccessibilityInfo, TextInput, View, findNodeHandle } from 'react-native';
import type { TextInputInstance, TextInputKeyPressEvent, TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import { Listbox } from './Listbox';
import type { ListboxValue } from './Listbox';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

/** `lg` for a search page's hero field. */
export type SearchSize = 'md' | 'lg';

/** One row offered under the field while typing. */
export type SearchSuggestion = { value: string; label: string; description?: string };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type SearchOverridableBinding =
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'affixGap'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'suggestionsOffset'
  | 'popupSurface'
  | 'popupBorder'
  | 'popupBorderWidth'
  | 'popupRadius'
  | 'popupShadow'
  | 'layer'
  | 'partGap'
  | 'labelWeight'
  | 'disabledOpacity';

export interface SearchProps {
  /** The accessible name ("Search products", "Search this site"). Visually hidden by default — the glyph and placeholder are the visible cue. */
  label: string;
  /** Show the label above the field, as in a search page rather than a header. */
  showLabel?: boolean | undefined;
  /**
   * Field name; the query key when the form submits to a URL. Native has no URL forms, so
   * here it is the key the query registers under in an enclosing Form.
   */
  name?: string | undefined;
  /**
   * Controlled query. When set, it is the query everything reads: submit, a chosen
   * suggestion, the clear button and the Form value all use this prop, never stale typed
   * text; clearing reports `onChangeText("")` and the field empties when the caller passes
   * the new value.
   */
  value?: string | undefined;
  /** Initial query. */
  defaultValue?: string | undefined;
  /** Example query, not a label ("Try "invoices from March""). */
  placeholder?: string | undefined;
  /**
   * URL to submit to with GET (web and Lit). Native has no form navigation: accepted for
   * parity, does nothing, and warns in development. Handle `onSubmitEditing` instead.
   */
  action?: string | undefined;
  /**
   * Suggestions for the current query, shown in a Listbox under the field; choosing one
   * fills the query with the suggestion's `label` — what the user just read — and submits.
   * Provide them from `onChangeText` (debounced by the caller). Setting the prop at all —
   * even to an empty array after a fetch that found nothing, which shows
   * `copy.noSuggestions` — is what turns the field into a combobox; leaving it undefined
   * keeps a plain search field. The list opens on typing and on ArrowDown, never on focus
   * alone, and closes on Escape, blur, a chosen suggestion, clear and submit.
   */
  suggestions?: { value: string; label: string; description?: string }[] | undefined;
  /** Suggestions are being fetched; announced through `copy.loading`. */
  loading?: boolean | undefined;
  /**
   * Give the field the `search` landmark. Turn off when the Search sits inside another
   * search landmark (a filter within a results page). It is `accessibilityRole="search"`
   * on the root View this component already renders, never a composed Landmark.
   */
  landmark?: boolean | undefined;
  /** `lg` for a search page's hero field. */
  size?: SearchSize | undefined;
  /**
   * Not editable, still readable and focusable: the input is read-only with
   * `accessibilityState.disabled`, both Buttons are disabled (the clear Button still renders
   * when there is text), every key is inert, suggestions never open and an open list closes,
   * no event fires, the label, glyph and input dim, and a Form does not register it.
   */
  disabled?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view (the `landmark` and `form` part). */
  ref?: React.Ref<ViewInstance> | undefined;
  /**
   * Fired on every keystroke with the query; the caller fetches suggestions here. Also fired
   * whenever Search itself changes the text, so a controlled `value` can follow: with "" before
   * `onClear`, and with a chosen suggestion's `label` before `onSubmitEditing`.
   */
  onChangeText?: ((value: string) => void) | undefined;
  /** Fired on Enter, the submit button, or choosing a suggestion, with the trimmed query. An empty trimmed query does not fire. */
  onSubmitEditing?: ((value: string) => void) | undefined;
  /** Fired when the field is emptied — by the clear button, or by the Escape that clears it when no suggestions are open. */
  onClear?: (() => void) | undefined;
}

/** copy.* — used verbatim; `suggestionsCount` is selected by `Intl.PluralRules` on `count`. */
const COPY = {
  clear: 'Clear search',
  submit: 'Search',
  loading: 'Loading suggestions',
  suggestionsCount: { one: '{count} suggestion available', other: '{count} suggestions available' },
  noSuggestions: 'No suggestions',
} as const;

function suggestionsCountText(count: number): string {
  const form = new Intl.PluralRules(undefined).select(count) === 'one' ? COPY.suggestionsCount.one : COPY.suggestionsCount.other;
  return form.replace('{count}', String(count));
}

const FONT_SIZE_TOKEN = { md: 'fontSizeMd', lg: 'fontSizeLg' } as const satisfies Record<SearchSize, keyof Tokens>;
const FONT_SIZE_REF = { md: 'font.size.md', lg: 'font.size.lg' } as const satisfies Record<SearchSize, TokenRef>;
const PADDING_BLOCK_TOKEN = { md: 'spaceSm', lg: 'spaceMd' } as const satisfies Record<SearchSize, keyof Tokens>;
/** The glyph keeps its proportion to the text: `sm` at `md`, `md` at `lg`. */
const ICON_SIZE = { md: 'sm', lg: 'md' } as const satisfies Record<SearchSize, 'sm' | 'md'>;
/** The locked `iconColor` binding, forwarded as the glyph Icon's own `color` override rather than its `color` prop. */
const ICON_OVERRIDES = { color: 'color.foreground.muted' as TokenRef };

/**
 * Search — the field people look for first: a magnifier glyph, a pill, a clear button,
 * and submission on Enter like every search field they have used.
 *
 * When to use: free-text search over a site, an app, or a large dataset. Add
 * `suggestions` when the backend can offer completions; keep `landmark` on for the one
 * primary search. Not for a specific value (Input) or for choosing from a known list
 * (Select, Combobox).
 *
 * Renders a root `View` — the `landmark` and `form` part in one, since native has no form
 * element — carrying `accessibilityRole="search"` when `landmark` and never putting it on
 * the `TextInput`, which on react-native-web would become a second search landmark. Inside
 * it: the optional visible label (hidden from accessibility, because the input already
 * carries `accessibilityLabel`) and a pill row holding a decorative `search` Icon, the
 * `TextInput` (`returnKeyType="search"`, `clearButtonMode="never"` so the system clear
 * `Button` matches across platforms), that clear Button while there is text, and the submit
 * Button, always rendered: Enter is not reachable from every on-screen keyboard.
 *
 * With `suggestions` set, an embedded `Listbox` renders inline below the field — no overlay,
 * since on a phone the list takes the space under the field — opened by typing while the
 * field has focus or by ArrowDown from a hardware keyboard (or react-native-web), never by
 * focus alone, and closed on blur, except while a press is in progress inside the list
 * (react-native-web blurs the input on pointerdown). Listbox rows are touch Pressables with
 * no key events, so there is no arrow-key highlight: a tap fills the query with the row's
 * `label` and submits, and Enter always submits the typed query. The suggestion count,
 * `copy.noSuggestions` or `copy.loading` is announced with
 * `AccessibilityInfo.announceForAccessibility` after `statusDebounce`, there being no
 * visually-hidden primitive to hold a live region.
 *
 * `name` is the Form registration key, as on every platform. `action` is a GET target, which
 * has no meaning on native: it is accepted for parity, does nothing, and warns under `__DEV__`. The caller's
 * ScrollView needs `keyboardShouldPersistTaps="handled"` so a suggestion tap is not
 * swallowed by keyboard dismissal; Search has no ScrollView of its own to set it on.
 */
export function Search({
  label,
  showLabel = false,
  name = 'q',
  value,
  defaultValue,
  placeholder,
  action,
  suggestions,
  loading = false,
  landmark = true,
  size = 'md',
  disabled = false,
  overrides,
  ref,
  onChangeText,
  onSubmitEditing,
  onClear,
}: SearchProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const inputRef = React.useRef<TextInputInstance>(null);
  /** True from a touch start or pointerdown inside the list until its release plus one tick, so the input's blur does not unmount the row being tapped. */
  const pressingList = React.useRef(false);

  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isDisabled = disabled || (form?.disabled ?? false);
  const hasSuggestions = suggestions !== undefined;
  const showList = open && hasSuggestions && !isDisabled;

  // The Form handle is built once; the query it submits is read through this.
  const latest = React.useRef(currentValue);
  latest.current = currentValue;

  const setQuery = (next: string): void => {
    if (!isControlled) {
      latest.current = next;
      setInternalValue(next);
    }
    onChangeText?.(next);
  };

  const submit = (raw: string): void => {
    setOpen(false);
    const trimmed = raw.trim();
    if (trimmed === '') {
      return;
    }
    onSubmitEditing?.(trimmed);
  };

  /** Reports `onChangeText("")` first, then `onClear`, for both routes into an emptied field. */
  const clear = (): void => {
    setOpen(false);
    setQuery('');
    onClear?.();
  };

  React.useEffect(() => {
    if (__DEV__ && action !== undefined) {
      console.warn('Search: `action` has no effect on React Native; handle `onSubmitEditing` instead.');
    }
  }, [action]);

  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      label,
      // The trimmed query, "" when empty and never omitted; validation always passes.
      getValue: () => latest.current.trim(),
      validate: () => null,
      focus: () => {
        const input = inputRef.current;
        if (input === null) {
          return;
        }
        input.focus();
        const node = findNodeHandle(input);
        if (node != null) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      },
    }),
    [label],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    // A disabled Search is neither registered with nor submitted by a Form.
    if (register === undefined || unregister === undefined || isDisabled) {
      return undefined;
    }
    register(name, handle);
    return () => unregister(name);
  }, [register, unregister, name, handle, isDisabled]);

  const handleChangeText = (text: string): void => {
    if (isDisabled) {
      return;
    }
    setQuery(text);
    // Typing is what opens the list; a `suggestions` array arriving on its own never does.
    if (hasSuggestions) {
      setOpen(true);
    }
  };

  const handleFocus = (): void => {
    setFocused(true);
  };

  const handleBlur = (): void => {
    setFocused(false);
    if (!pressingList.current) {
      setOpen(false);
    }
  };

  const handleListPressStart = (): void => {
    pressingList.current = true;
  };

  const handleListPressEnd = (): void => {
    // The row's press handler runs after the release; close a tick later if focus did not come back.
    setTimeout(() => {
      pressingList.current = false;
      if (inputRef.current?.isFocused() !== true) {
        setOpen(false);
      }
    }, 0);
  };

  // Keys arrive only where a hardware keyboard (or react-native-web) delivers them; the clear
  // Button is the accessible path to Escape's clear.
  const handleKeyPress = (event: TextInputKeyPressEvent): void => {
    if (isDisabled) {
      return;
    }
    const key = event.nativeEvent.key;
    if (key === 'ArrowDown') {
      if (hasSuggestions) {
        setOpen(true);
      }
      return;
    }
    if (key !== 'Escape') {
      return;
    }
    if (showList) {
      setOpen(false);
      return;
    }
    // An already-empty field with no list open does nothing and fires no onClear.
    if (currentValue !== '') {
      clear();
    }
  };

  const handleSubmitEditing = (): void => {
    if (isDisabled) {
      return;
    }
    submit(currentValue);
  };

  const handleClearPress = (): void => {
    if (isDisabled) {
      return;
    }
    clear();
    inputRef.current?.focus();
  };

  /** A tap fills the query with the suggestion's `label` — what the user just read — and submits it. */
  const handleSuggestionChange = (next: ListboxValue): void => {
    if (isDisabled) {
      return;
    }
    const picked = Array.isArray(next) ? next[0] : next;
    const chosen = suggestions?.find((suggestion) => suggestion.value === picked);
    if (chosen === undefined) {
      return;
    }
    pressingList.current = false;
    setQuery(chosen.label);
    submit(chosen.label);
  };

  const count = suggestions?.length ?? 0;
  const announceStatus = hasSuggestions && !isDisabled && (showList || loading);
  const statusText = !announceStatus ? '' : loading ? COPY.loading : count === 0 ? COPY.noSuggestions : suggestionsCountText(count);
  // constant statusDebounce: `motion.duration.base` × 2. The theme token is never zeroed —
  // reduced motion is the separate useReducedMotion — so this is always the standard value.
  const statusDebounce = t.motionDurationBase * 2;

  React.useEffect(() => {
    if (statusText === '') {
      return undefined;
    }
    const timeout = setTimeout(() => AccessibilityInfo.announceForAccessibility(statusText), statusDebounce);
    return () => clearTimeout(timeout);
  }, [statusText, statusDebounce]);

  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusFull;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t.spaceMd;
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[PADDING_BLOCK_TOKEN[size]];
  const affixGap = overrides?.affixGap ? (resolveToken(t, overrides.affixGap) as number) : t.layoutGapTight;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const lineHeight = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const suggestionsOffset = overrides?.suggestionsOffset ? (resolveToken(t, overrides.suggestionsOffset) as number) : t.space1;
  const popupSurface = overrides?.popupSurface ? (resolveToken(t, overrides.popupSurface) as string) : t.colorOverlaySurface;
  const popupBorder = overrides?.popupBorder ? (resolveToken(t, overrides.popupBorder) as string) : t.colorBorder;
  const popupBorderWidth = overrides?.popupBorderWidth ? (resolveToken(t, overrides.popupBorderWidth) as number) : t.borderWidthThin;
  const popupRadius = overrides?.popupRadius ? (resolveToken(t, overrides.popupRadius) as number) : t.radiusMd;
  const popupShadow = overrides?.popupShadow ? (resolveToken(t, overrides.popupShadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  // `layer` stacks the popup on web and Lit; the native list is inline, so the binding is
  // accepted for parity and never applied.

  // The field border in `borderFocus` is the focus ring: it replaces `borderWidth` with
  // `focusRingWidth` while the input itself has focus (a focused clear or submit Button shows
  // only its own ring), and the padding shrinks by the difference so the content does not shift.
  const insetShrink = focused ? t.borderWidthFocus - borderWidth : 0;

  const rootStyle: ViewStyle = { flexDirection: 'column', gap: partGap };
  /** The label, glyph and input dim; the field frame does not, and the Buttons dim once through their own `disabled`. */
  const dimStyle: ViewStyle = { opacity: isDisabled ? disabledOpacity : 1 };
  const fieldGroupStyle: ViewStyle = { flexDirection: 'column', gap: suggestionsOffset };

  const fieldStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: affixGap,
    minHeight: t.sizeTargetComfortable,
    backgroundColor: t.colorControlBackground,
    borderWidth: focused ? t.borderWidthFocus : borderWidth,
    borderColor: focused ? t.colorBorderFocus : t.colorBorderStrong,
    borderRadius: radius,
    paddingHorizontal: paddingInline - insetShrink,
    paddingVertical: paddingBlock - insetShrink,
  };

  const inputStyle: TextStyle = {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    padding: 0,
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeight),
    color: t.colorForeground,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const suggestionsStyle: ViewStyle = {
    borderWidth: popupBorderWidth,
    borderColor: popupBorder,
    borderRadius: popupRadius,
    backgroundColor: popupSurface,
    overflow: 'hidden',
    ...popupShadow,
  };

  return (
    <View
      ref={ref}
      testID="Search"
      accessibilityRole={landmark ? 'search' : undefined}
      // The dimmed root is marked inactive too, so the disabled contrast exemption is machine-visible.
      accessibilityState={isDisabled ? { disabled: true } : undefined}
      aria-disabled={isDisabled ? true : undefined}
      style={rootStyle}
    >
      {showLabel ? (
        <View testID="Search.label" style={dimStyle} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text
            overrides={{
              fontWeight: overrides?.labelWeight ?? 'font.weight.medium',
              fontSize: overrides?.fontSize ?? FONT_SIZE_REF[size],
            }}
          >
            {label}
          </Text>
        </View>
      ) : null}
      <View style={fieldGroupStyle}>
        <View testID="Search.field" style={fieldStyle}>
          <View testID="Search.icon" style={dimStyle} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Icon name="search" size={ICON_SIZE[size]} overrides={ICON_OVERRIDES} />
          </View>
          <TextInput
            ref={inputRef}
            testID="Search.input"
            // `role` carries the schema's `searchbox`, or `combobox` once `suggestions` is set (it
            // wins, and is the role `aria-expanded` is allowed on); the `search` landmark stays on the root View.
            role={hasSuggestions ? 'combobox' : 'searchbox'}
            accessibilityLabel={label}
            aria-label={label}
            accessibilityState={{ disabled: isDisabled, expanded: hasSuggestions ? showList : undefined }}
            // react-native-web 0.21 drops `accessibilityState`, and a read-only field that only
            // dims through `opacity.disabled` reads as a contrast failure unless it is marked inactive.
            aria-disabled={isDisabled}
            aria-expanded={hasSuggestions ? showList : undefined}
            editable={!isDisabled}
            value={currentValue}
            placeholder={placeholder}
            placeholderTextColor={t.colorForegroundMuted}
            returnKeyType="search"
            clearButtonMode="never"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSubmitEditing}
            style={inputStyle}
          />
          {currentValue !== '' ? (
            <View testID="Search.clearButton">
              <Button
                label={COPY.clear}
                variant="ghost"
                size="sm"
                iconOnly
                disabled={isDisabled}
                leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                onPress={handleClearPress}
              />
            </View>
          ) : null}
          <View testID="Search.submitButton">
            <Button
              label={COPY.submit}
              variant="ghost"
              size="sm"
              iconOnly
              disabled={isDisabled}
              leadingIcon={<Icon name="arrow-right" color={t.colorActionGhostForeground} />}
              onPress={handleSubmitEditing}
            />
          </View>
        </View>
        {showList ? (
          <View
            testID="Search.suggestions"
            style={suggestionsStyle}
            // A press that starts in the list must not close it through the input's blur.
            onTouchStart={handleListPressStart}
            onTouchEnd={handleListPressEnd}
            onTouchCancel={handleListPressEnd}
            onPointerDown={handleListPressStart}
            onPointerUp={handleListPressEnd}
            onPointerCancel={handleListPressEnd}
          >
            <Listbox
              label={label}
              // While loading, no options are passed and the empty row carries `copy.loading`;
              // Listbox's own `loading` prop is never used, so the verbatim string is what shows.
              options={loading ? [] : (suggestions ?? [])}
              value=""
              embedded
              selectionFollowsFocus={false}
              emptyMessage={loading ? COPY.loading : COPY.noSuggestions}
              onChange={handleSuggestionChange}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
