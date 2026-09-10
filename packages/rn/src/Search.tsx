import * as React from 'react';
import { AccessibilityInfo, TextInput, View, findNodeHandle } from 'react-native';
import type { NativeSyntheticEvent, TextInputKeyPressEventData, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Landmark } from './Landmark';
import { Listbox } from './Listbox';
import type { ListboxValue } from './Listbox';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type SearchSize = 'md' | 'lg';

/** One row offered under the field while typing. */
export type SearchSuggestion = { value: string; label: string; description?: string };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type SearchOverridableBinding =
  | 'borderFocus'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'paddingBlockLg'
  | 'affixGap'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'suggestionsOffset'
  | 'popupSurface'
  | 'popupBorder'
  | 'popupRadius'
  | 'popupShadow'
  | 'partGap'
  | 'disabledOpacity';

export interface SearchProps {
  /** Accessible name ("Search products"). Visually hidden unless `showLabel`. */
  label: string;
  /** Show the label above the field, as on a search page rather than in a header. */
  showLabel?: boolean;
  /**
   * Field name; the query key a web form submits to `action`. Has no runtime effect
   * on this platform, which has no navigable forms — kept for API parity.
   */
  name?: string;
  /** Controlled query. */
  value?: string;
  /** Initial query. */
  defaultValue?: string;
  /** Example query, not a label. */
  placeholder?: string;
  /**
   * URL a web form submits to with GET. Has no runtime effect on this
   * platform — there is no navigation to perform — kept for API parity.
   */
  action?: string;
  /**
   * Suggestions for the current query, shown in a Listbox under the field. Provide
   * them from `onChange` (debounced by the caller). Setting this at all — even to an
   * empty array — turns on suggestions mode.
   */
  suggestions?: SearchSuggestion[];
  /** Suggestions are being fetched; announced through `copy.loading`. */
  loading?: boolean;
  /** Wrap in the `search` Landmark. Turn off when nested inside another search landmark. */
  landmark?: boolean;
  /** `lg` for a search page's hero field. */
  size?: SearchSize;
  /** Not editable, still readable. */
  disabled?: boolean;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SearchOverridableBinding, TokenRef>>;
  /** Fired on every keystroke with the query. */
  onChange?: (value: string) => void;
  /** Fired on Enter, the submit button, or choosing a suggestion, with the trimmed query. Never fires for an empty query. */
  onSubmit?: (value: string) => void;
  /** Fired when the clear button, or an Escape that empties the field, clears the query. */
  onClear?: () => void;
}

const COPY = {
  clear: 'Clear search',
  submit: 'Search',
  loading: 'Loading suggestions',
  suggestionsCount: (count: number): string => `${count} suggestions available`,
  noSuggestions: 'No suggestions',
} as const;

const FONT_SIZE_TOKEN = { md: 'fontSizeMd', lg: 'fontSizeLg' } as const satisfies Record<SearchSize, keyof Tokens>;
const ICON_SIZE = { md: 'sm', lg: 'md' } as const satisfies Record<SearchSize, 'sm' | 'md'>;

/**
 * Search — a field shaped so nobody has to read a label: a magnifier glyph, a pill,
 * a clear button, and submission on Enter like every search field people have used.
 *
 * When to use: Use for free-text search over a site, an app, or a large dataset.
 * Add `suggestions` when the backend can offer completions; keep `landmark` on for
 * the one primary search so screen-reader users can jump to it. Do not use it for a
 * field with a specific expected value (Input) or for choosing from a known list
 * (Select, Combobox).
 *
 * Renders a `TextInput` (`returnKeyType="search"`, `accessibilityRole="search"`)
 * preceded by a decorative `search` Icon, with the system clear `Button` shown once
 * there is text and a submit `Button` always rendered. `landmark` wraps the whole
 * field in the composed `Landmark` (`role="search"`) rather than a hand-rolled
 * `accessibilityRole`. Setting `suggestions` — even to an empty array — opens an
 * inline `Listbox` (`embedded`) below the field on focus (there is no overlay on a
 * phone: the list takes the space under the field); choosing a row fills the query
 * with its label and submits it. A debounced, doubly-announced (inline live region
 * for Android, `AccessibilityInfo.announceForAccessibility` for iOS) status reports
 * the suggestion count or `copy.loading`. Escape (reachable via a hardware keyboard
 * or react-native-web; on-screen keyboards do not emit it) closes the suggestions
 * when open, otherwise clears the field and fires `onClear`, matching the clear
 * button's own behavior. The query never submits empty. `disabled` dims the whole
 * group with `disabledOpacity` and blocks the field and both buttons.
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
  onChange,
  onSubmit,
  onClear,
}: SearchProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const inputRef = React.useRef<TextInput>(null);

  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const isValueControlled = value !== undefined;
  const currentValue = isValueControlled ? (value as string) : internalValue;
  const isDisabled = disabled;
  const hasSuggestions = suggestions !== undefined;

  const commitValue = (next: string): void => {
    if (!isValueControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const commitSubmit = (raw: string): void => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      return;
    }
    onSubmit?.(trimmed);
  };

  const focusFieldA11y = (): void => {
    const node = inputRef.current ? findNodeHandle(inputRef.current) : null;
    if (node !== null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  };

  const handleChangeText = (text: string): void => {
    commitValue(text);
    if (hasSuggestions) {
      setOpen(true);
    }
  };

  const handleFocus = (): void => {
    setFocused(true);
    if (hasSuggestions) {
      setOpen(true);
    }
  };

  const handleBlur = (): void => {
    setFocused(false);
    setOpen(false);
  };

  const handleSubmitEditing = (): void => {
    commitSubmit(currentValue);
    setOpen(false);
  };

  const handleSubmitPress = (): void => {
    commitSubmit(currentValue);
    setOpen(false);
  };

  const handleClear = (): void => {
    if (isDisabled) {
      return;
    }
    commitValue('');
    onClear?.();
    inputRef.current?.focus();
  };

  // Only reachable via a hardware keyboard or react-native-web; on-screen keyboards
  // do not emit an Escape key.
  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>): void => {
    if (event.nativeEvent.key !== 'Escape') {
      return;
    }
    if (open) {
      setOpen(false);
      focusFieldA11y();
      return;
    }
    if (currentValue !== '') {
      commitValue('');
      onClear?.();
    }
  };

  const handleSuggestionChange = (next: ListboxValue): void => {
    const raw = Array.isArray(next) ? next[0] : next;
    if (raw === undefined) {
      return;
    }
    const chosen = suggestions?.find((suggestion) => suggestion.value === raw);
    const nextValue = chosen?.label ?? raw;
    commitValue(nextValue);
    setOpen(false);
    commitSubmit(nextValue);
  };

  const resultCount = suggestions?.length ?? 0;
  const statusText = loading ? COPY.loading : resultCount === 0 ? COPY.noSuggestions : COPY.suggestionsCount(resultCount);

  // Debounced polite announcement of the suggestion count / loading state, matching
  // the web model's ~500ms debounce (`motion.duration.base` × 2). The inline live
  // region below covers Android; iOS ignores `accessibilityLiveRegion`.
  React.useEffect(() => {
    if (!open || !hasSuggestions) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(statusText);
    }, t.motionDurationBase * 2);
    return () => clearTimeout(timeout);
  }, [open, hasSuggestions, statusText, t.motionDurationBase]);

  React.useEffect(() => {
    if (__DEV__ && action !== undefined && action !== '') {
      console.warn('Search: `action` has no effect on React Native; handle `onSubmit` instead.');
    }
  }, [action]);

  const borderFocusColor = overrides?.borderFocus ? (resolveToken(t, overrides.borderFocus) as string) : t.colorBorderFocus;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusFull;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t.spaceMd;
  const paddingBlock =
    size === 'lg'
      ? overrides?.paddingBlockLg
        ? (resolveToken(t, overrides.paddingBlockLg) as number)
        : t.spaceMd
      : overrides?.paddingBlock
        ? (resolveToken(t, overrides.paddingBlock) as number)
        : t.spaceSm;
  const affixGap = overrides?.affixGap ? (resolveToken(t, overrides.affixGap) as number) : t.layoutGapTight;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const suggestionsOffset = overrides?.suggestionsOffset ? (resolveToken(t, overrides.suggestionsOffset) as number) : t.space1;
  const popupSurface = overrides?.popupSurface ? (resolveToken(t, overrides.popupSurface) as string) : t.colorOverlaySurface;
  const popupBorder = overrides?.popupBorder ? (resolveToken(t, overrides.popupBorder) as string) : t.colorBorder;
  const popupRadius = overrides?.popupRadius ? (resolveToken(t, overrides.popupRadius) as number) : t.radiusMd;
  const popupShadow = overrides?.popupShadow ? (resolveToken(t, overrides.popupShadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
  const inset = t.borderWidthFocus - borderWidth;

  const showClear = !isDisabled && currentValue !== '';

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const fieldRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: affixGap,
    minHeight: t.sizeTargetComfortable,
    backgroundColor: t.colorControlBackground,
    borderWidth: activeBorderWidth,
    borderColor: focused ? borderFocusColor : t.colorBorderStrong,
    borderRadius: radius,
    paddingHorizontal: paddingInline + inset,
    paddingVertical: paddingBlock + inset,
  };

  const inputTextStyle: TextStyle = {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    color: t.colorForeground,
  };

  const popupOuterStyle: ViewStyle = {
    marginTop: suggestionsOffset,
    borderWidth: t.borderWidthThin,
    borderColor: popupBorder,
    borderRadius: popupRadius,
    backgroundColor: popupSurface,
    overflow: 'hidden',
    ...popupShadow,
  };

  const listboxOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight, disabledOpacity: overrides?.disabledOpacity };
  const labelOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };

  const content = (
    <View testID="Search" style={containerStyle}>
      {showLabel ? (
        <Text weight="medium" overrides={labelOverrides}>
          {label}
        </Text>
      ) : null}
      <View style={fieldRowStyle} testID="Search.field">
        <Icon name="search" size={ICON_SIZE[size]} color={t.colorForegroundMuted} />
        <TextInput
          ref={inputRef}
          accessibilityRole="search"
          accessibilityLabel={label}
          accessibilityState={{ disabled: isDisabled }}
          editable={!isDisabled}
          value={currentValue}
          placeholder={placeholder}
          placeholderTextColor={t.colorForegroundMuted}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          allowFontScaling
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          onSubmitEditing={handleSubmitEditing}
          style={inputTextStyle}
          testID="Search.input"
        />
        {showClear ? (
          <Button
            label={COPY.clear}
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={<Icon name="close" size="xs" color={t.colorForegroundMuted} />}
            onPress={handleClear}
          />
        ) : null}
        <Button
          label={COPY.submit}
          variant="ghost"
          size="sm"
          iconOnly
          disabled={isDisabled}
          leadingIcon={<Icon name="search" size="xs" color={t.colorForegroundMuted} />}
          onPress={handleSubmitPress}
        />
      </View>
      {open && hasSuggestions ? (
        <View accessibilityLiveRegion="polite" importantForAccessibility="yes" testID="Search.status">
          <Text size="xs" tone="muted">
            {statusText}
          </Text>
        </View>
      ) : null}
      {open && hasSuggestions ? (
        <View style={popupOuterStyle} testID="Search.suggestions">
          <Listbox
            label={`${label}: ${COPY.suggestionsCount(resultCount)}`}
            options={loading ? [] : (suggestions ?? [])}
            embedded
            emptyMessage={loading ? COPY.loading : COPY.noSuggestions}
            onChange={handleSuggestionChange}
            overrides={listboxOverrides}
          />
        </View>
      ) : null}
    </View>
  );

  return landmark ? (
    <Landmark role="search" label={label}>
      {content}
    </Landmark>
  ) : (
    content
  );
}
