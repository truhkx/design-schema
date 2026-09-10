import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  findNodeHandle,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, NativeSyntheticEvent, TextInputKeyPressEventData, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import { Listbox } from './Listbox';
import type { ListboxGroup, ListboxItem, ListboxOption, ListboxValue } from './Listbox';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

/** How typing narrows `options`. `none` never filters; `async` leaves filtering to the consumer. */
export type ComboboxFilter = 'startsWith' | 'contains' | 'none' | 'async';

/** The selection: a value, or with `multiple` an array of values. An empty string / empty array is "nothing selected". */
export type ComboboxValue = string | string[];

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ComboboxOverridableBinding =
  | 'fieldBorderFocus'
  | 'fieldBorderInvalid'
  | 'fieldBorderWidth'
  | 'fieldRadius'
  | 'fieldPaddingInline'
  | 'fieldPaddingBlock'
  | 'fieldGap'
  | 'chipRadius'
  | 'chipPaddingInline'
  | 'chipPaddingBlock'
  | 'chipGap'
  | 'partGap'
  | 'labelWeight'
  | 'helperSize'
  | 'popupSurface'
  | 'popupBorder'
  | 'popupShadow'
  | 'popupRadius'
  | 'popupOffset'
  | 'layer'
  | 'fontFamily'
  | 'fontSize'
  | 'chipSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'enter';

export interface ComboboxProps {
  /** Visible label. Always rendered. Also the field's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering. */
  options: ListboxItem[];
  /** Controlled selected value(s) (array with `multiple`). With `allowCustom`, a value not in `options` is a custom entry. */
  value?: ComboboxValue;
  /** Initial selected value(s). */
  defaultValue?: ComboboxValue;
  /** Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering. */
  inputValue?: string;
  /** Pick many: selected options appear as chips before the input, each removable; the list stays open while toggling; Backspace in an empty input removes the last chip. */
  multiple?: boolean;
  /** Typed text that matches no option can be committed as a value. Enter commits it; the list shows `copy.addCustom` as the first row. */
  allowCustom?: boolean;
  /** How typing narrows `options`. */
  filter?: ComboboxFilter;
  /** Example input shown while empty. Never the only description. */
  placeholder?: string;
  /** Helper text under the label. Also the field's `accessibilityHint`. */
  description?: string;
  /** Must have a value to submit. */
  required?: boolean;
  /** Not editable, not submitted, still readable and focusable. */
  disabled?: boolean;
  /** Marks the field invalid. */
  invalid?: boolean;
  /** Error message; implies invalid. */
  error?: string;
  /** For `async`: show the loading row and announce it. The consumer sets it around its request. */
  loading?: boolean;
  /** Show a clear button when there is a value or text. */
  clearable?: boolean;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ComboboxOverridableBinding, TokenRef>>;
  /** Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`). */
  onChange?: (value: ComboboxValue) => void;
  /** Fired on every keystroke with the input text. The hook for `async` filtering. */
  onInputChange?: (value: string) => void;
  /** Fired when the list opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

const COPY = {
  empty: 'No matches',
  loading: 'Loading…',
  addCustom: (value: string): string => `Add "${value}"`,
  clearLabel: 'Clear',
  toggleLabel: 'Show options',
  removeChip: (label: string): string => `Remove ${label}`,
  resultCount: (count: number): string => `${count} results available`,
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
  // Not in the schema's copy block; the BottomSheet footer for `multiple` needs a
  // label and none was given. Same addition Select makes for its own BottomSheet footer.
  done: 'Done',
} as const;

// Sentinel prefix marking the synthetic "add custom" row injected into the Listbox's
// `options`, so the existing engine (no schema changes) can render and activate it.
const CUSTOM_PREFIX = '__ds_combobox_custom__:';

function isGroup(item: ListboxItem): item is ListboxGroup {
  return 'group' in item;
}

function flattenOptions(items: ListboxItem[]): ListboxOption[] {
  const result: ListboxOption[] = [];
  items.forEach((item) => {
    if (isGroup(item)) {
      result.push(...item.options);
    } else {
      result.push(item);
    }
  });
  return result;
}

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Combobox — an input that narrows as you type and lets you pick, or, with
 * `allowCustom`, keep what you typed.
 *
 * When to use: Use for long lists (fifty-plus), for values typed faster than found
 * (dates, codes), for `async` search against a server, and for multi-value fields
 * where chips make the selection legible. Use `allowCustom` when new values are
 * legitimate (tags, invitees). Do not use it for short static lists (Select) or to
 * navigate to search results (a search form).
 *
 * Composes the same `Listbox` engine `Select` uses for its popup. On phones the
 * field is a `Pressable` summary (chips read-only, for glanceability) that opens a
 * `BottomSheet` containing the real `TextInput` (autofocused by the sheet's own
 * `FocusScope`) above the `Listbox`, with a `Done` footer action under `multiple`;
 * on tablets and react-native-web the field holds the `TextInput` directly and the
 * popup is an anchored `Modal` positioned below it (flipped above on overflow),
 * deliberately not focus-trapping, since focus must stay in the input while the
 * list is browsed by touch. Typing filters `options` per `filter` and opens the
 * list; selecting a row commits and, single-select, closes the popup, while
 * `multiple` adds a chip, clears the text and stays open. `allowCustom` injects a
 * synthetic first row (`copy.addCustom`) into the Listbox's own `options` when the
 * typed text matches nothing, so committing it needs no engine change. Because
 * `Listbox`'s own rows are touch `Pressable`s with no key-event API, the web
 * keyboard model's arrow-key/Home/End active-option browsing and Tab-does-not-commit
 * behavior have no native equivalent (the same acknowledged limit `Listbox`
 * documents); only Escape (closes, then clears — reachable via a hardware/RNW
 * keyboard), Enter (commits typed custom text via `onSubmitEditing`) and Backspace
 * on an empty `multiple` input (removes the last chip, via `onKeyPress`) are wired.
 * Result counts, loading and empty states are announced with
 * `AccessibilityInfo.announceForAccessibility`, debounced. Validation and Form
 * registration work as `Input`'s: precedence is `error` prop → `required` →
 * `invalid`.
 */
export function Combobox({
  label,
  name,
  options,
  value,
  defaultValue,
  inputValue,
  multiple = false,
  allowCustom = false,
  filter = 'contains',
  placeholder,
  description,
  required = false,
  disabled = false,
  invalid = false,
  error,
  loading = false,
  clearable = true,
  overrides,
  onChange,
  onInputChange,
  onOpenChange,
}: ComboboxProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const fieldRef = React.useRef<View>(null);
  const inputRef = React.useRef<TextInput>(null);

  const emptyValue: ComboboxValue = multiple ? [] : '';
  const [internalValue, setInternalValue] = React.useState<ComboboxValue>(defaultValue ?? emptyValue);
  const [internalInputText, setInternalInputText] = React.useState<string>('');
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [popupMounted, setPopupMounted] = React.useState(false);
  const [fieldRect, setFieldRect] = React.useState<Rect | null>(null);
  const [popupHeight, setPopupHeight] = React.useState<number | null>(null);
  const progress = React.useRef(new Animated.Value(0)).current;

  const isValueControlled = value !== undefined;
  const currentValue = isValueControlled ? (value as ComboboxValue) : internalValue;
  const isInputControlled = inputValue !== undefined;
  const currentInputText = isInputControlled ? (inputValue as string) : internalInputText;
  const isDisabled = disabled || (form?.disabled ?? false);
  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  // No native OS combobox surface exists, and typing on a phone with a floating
  // list under the keyboard is unusable, so phones get a BottomSheet instead.
  const isPhoneWidth = windowWidth <= t.layoutMaxWidthProse;
  const usesSheet = isPhoneWidth;

  const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
  const labelFor = React.useCallback(
    (optionValue: string): string => flatOptions.find((option) => option.value === optionValue)?.label ?? optionValue,
    [flatOptions],
  );

  const selectedValues: string[] = multiple && Array.isArray(currentValue) ? currentValue : [];
  const selectedValue: string | undefined =
    !multiple && typeof currentValue === 'string' && currentValue !== '' ? currentValue : undefined;
  const hasSelection = multiple ? selectedValues.length > 0 : selectedValue !== undefined;

  const trimmedInput = currentInputText.trim();

  const filteredItems = React.useMemo<ListboxItem[]>(() => {
    if (filter === 'none' || filter === 'async' || trimmedInput === '') {
      return options;
    }
    const needle = trimmedInput.toLowerCase();
    const matches = (option: ListboxOption): boolean =>
      filter === 'startsWith' ? option.label.toLowerCase().startsWith(needle) : option.label.toLowerCase().includes(needle);
    return options.reduce<ListboxItem[]>((acc, item) => {
      if (isGroup(item)) {
        const groupMatches = item.options.filter(matches);
        if (groupMatches.length > 0) {
          acc.push({ group: item.group, options: groupMatches });
        }
      } else if (matches(item)) {
        acc.push(item);
      }
      return acc;
    }, []);
  }, [options, filter, trimmedInput]);

  const hasExactMatch = flatOptions.some(
    (option) => option.label.toLowerCase() === trimmedInput.toLowerCase() || option.value.toLowerCase() === trimmedInput.toLowerCase(),
  );
  const showCustomRow = allowCustom && trimmedInput !== '' && !hasExactMatch;
  const customOption: ListboxOption | null = showCustomRow
    ? { value: `${CUSTOM_PREFIX}${trimmedInput}`, label: COPY.addCustom(trimmedInput) }
    : null;
  const listboxItems: ListboxItem[] = customOption !== null ? [customOption, ...filteredItems] : filteredItems;
  const resultCount = flattenOptions(filteredItems).length;

  const validateValue = React.useCallback(
    (candidate: ComboboxValue): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required) {
        const empty = multiple ? !Array.isArray(candidate) || candidate.length === 0 : candidate === '';
        if (empty) {
          return COPY.required(label);
        }
      }
      if (invalid) {
        return COPY.invalid(label);
      }
      return null;
    },
    [required, multiple, label, error, invalid],
  );

  const focusFieldA11y = React.useCallback((): void => {
    const node = fieldRef.current ? findNodeHandle(fieldRef.current) : null;
    if (node !== null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, []);

  const latest = React.useRef({ currentValue, validateValue });
  latest.current = { currentValue, validateValue };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => {
        const current = latest.current.currentValue;
        if (multiple) {
          return Array.isArray(current) && current.length > 0 ? current : undefined;
        }
        return typeof current === 'string' && current !== '' ? current : undefined;
      },
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: () => {
        if (usesSheet) {
          setOpen(true);
          onOpenChange?.(true);
          return;
        }
        const input = inputRef.current;
        if (input === null) {
          return;
        }
        input.focus();
        const node = findNodeHandle(input);
        if (node !== null) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      },
    }),
    [multiple, usesSheet, onOpenChange],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    if (register === undefined || unregister === undefined || isDisabled) {
      return undefined;
    }
    register(name, handle);
    return () => unregister(name);
  }, [register, unregister, name, handle, isDisabled]);

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  // Debounced polite announcement of result count / loading / empty, matching the
  // web model's ~500ms debounce (`motion.duration.base` × 2).
  React.useEffect(() => {
    if (!open) {
      return undefined;
    }
    const text = filter === 'async' && loading ? COPY.loading : resultCount === 0 ? COPY.empty : COPY.resultCount(resultCount);
    const timeout = setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(text);
    }, t.motionDurationBase * 2);
    return () => clearTimeout(timeout);
  }, [open, filter, loading, resultCount, t.motionDurationBase]);

  const changeOpen = (next: boolean): void => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const closePopup = (refocus: boolean): void => {
    if (!open) {
      return;
    }
    changeOpen(false);
    if (refocus) {
      focusFieldA11y();
    }
  };

  const commitValue = (next: ComboboxValue): void => {
    if (!isValueControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const commitInputText = (next: string): void => {
    if (!isInputControlled) {
      setInternalInputText(next);
    }
    onInputChange?.(next);
  };

  const resolveCustom = (raw: string): string => (raw.startsWith(CUSTOM_PREFIX) ? raw.slice(CUSTOM_PREFIX.length) : raw);

  const handleListboxChange = (next: ListboxValue): void => {
    if (multiple) {
      const resolved = (Array.isArray(next) ? next : [next]).map(resolveCustom);
      commitValue(resolved);
      commitInputText('');
      return;
    }
    const raw = Array.isArray(next) ? next[0] : next;
    const resolved = raw === undefined ? '' : resolveCustom(raw);
    commitValue(resolved);
    commitInputText(resolved === '' ? '' : labelFor(resolved));
    closePopup(false);
  };

  const handleTogglePress = (): void => {
    if (isDisabled) {
      return;
    }
    if (open) {
      closePopup(true);
    } else {
      changeOpen(true);
    }
  };

  const handleClear = (): void => {
    if (isDisabled) {
      return;
    }
    commitInputText('');
    commitValue(multiple ? [] : '');
  };

  const handleRemoveChip = (chipValue: string): void => {
    if (isDisabled) {
      return;
    }
    commitValue(selectedValues.filter((v) => v !== chipValue));
  };

  const handleChangeText = (text: string): void => {
    commitInputText(text);
    if (!open) {
      changeOpen(true);
    }
  };

  const commitCustomFromText = (): void => {
    if (!allowCustom || trimmedInput === '') {
      return;
    }
    if (multiple) {
      if (!selectedValues.includes(trimmedInput)) {
        commitValue([...selectedValues, trimmedInput]);
      }
      commitInputText('');
    } else {
      commitValue(trimmedInput);
      commitInputText(trimmedInput);
      closePopup(false);
    }
  };

  // Native has no key-event API reaching the option list (see the doc comment), so
  // Enter's only job here is committing typed custom text; there is no "active
  // option" for it to commit otherwise.
  const handleSubmitEditing = (): void => {
    commitCustomFromText();
  };

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>): void => {
    const key = event.nativeEvent.key;
    if (key === 'Backspace' && multiple && currentInputText === '' && selectedValues.length > 0) {
      commitValue(selectedValues.slice(0, -1));
      return;
    }
    // Only reachable via a hardware keyboard or react-native-web; on-screen
    // keyboards do not emit an Escape key.
    if (key === 'Escape') {
      if (open) {
        closePopup(true);
      } else if (clearable) {
        handleClear();
      }
    }
  };

  const handleFocus = (): void => {
    setFocused(true);
    if (!open) {
      changeOpen(true);
    }
  };

  const handleBlur = (): void => {
    setFocused(false);
    closePopup(false);
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, validateValue(currentValue));
    }
  };

  React.useEffect(() => {
    if (open) {
      setPopupMounted(true);
    }
  }, [open]);

  const handlePopupLayout = (event: LayoutChangeEvent): void => {
    setPopupHeight(event.nativeEvent.layout.height);
  };

  const fieldBorderFocusColor = overrides?.fieldBorderFocus ? (resolveToken(t, overrides.fieldBorderFocus) as string) : t.colorBorderFocus;
  const fieldBorderInvalidColor = overrides?.fieldBorderInvalid
    ? (resolveToken(t, overrides.fieldBorderInvalid) as string)
    : t.colorBorderDanger;
  const fieldBorderWidth = overrides?.fieldBorderWidth ? (resolveToken(t, overrides.fieldBorderWidth) as number) : t.borderWidthThin;
  const fieldRadius = overrides?.fieldRadius ? (resolveToken(t, overrides.fieldRadius) as number) : t.radiusMd;
  const fieldPaddingInline = overrides?.fieldPaddingInline ? (resolveToken(t, overrides.fieldPaddingInline) as number) : t.spaceMd;
  const fieldPaddingBlock = overrides?.fieldPaddingBlock ? (resolveToken(t, overrides.fieldPaddingBlock) as number) : t.spaceSm;
  const fieldGap = overrides?.fieldGap ? (resolveToken(t, overrides.fieldGap) as number) : t.layoutGapTight;
  const chipRadius = overrides?.chipRadius ? (resolveToken(t, overrides.chipRadius) as number) : t.radiusFull;
  const chipPaddingInline = overrides?.chipPaddingInline ? (resolveToken(t, overrides.chipPaddingInline) as number) : t.space2;
  const chipPaddingBlock = overrides?.chipPaddingBlock ? (resolveToken(t, overrides.chipPaddingBlock) as number) : t.space0;
  const chipGap = overrides?.chipGap ? (resolveToken(t, overrides.chipGap) as number) : t.layoutGapTight;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const labelWeight = overrides?.labelWeight ? (resolveToken(t, overrides.labelWeight) as number) : t.fontWeightMedium;
  const popupSurface = overrides?.popupSurface ? (resolveToken(t, overrides.popupSurface) as string) : t.colorOverlaySurface;
  const popupBorder = overrides?.popupBorder ? (resolveToken(t, overrides.popupBorder) as string) : t.colorBorder;
  const popupShadow = overrides?.popupShadow ? (resolveToken(t, overrides.popupShadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const popupRadius = overrides?.popupRadius ? (resolveToken(t, overrides.popupRadius) as number) : t.radiusMd;
  const popupOffset = overrides?.popupOffset ? (resolveToken(t, overrides.popupOffset) as number) : t.space1;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDropdown;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationFast;
  const iconColor = t.colorForegroundMuted;

  // Popup-Modal path only (the BottomSheet manages its own mount/animation).
  React.useEffect(() => {
    if (usesSheet || !popupMounted) {
      return undefined;
    }
    if (open) {
      const node = fieldRef.current;
      node?.measureInWindow((x, y, width, height) => setFieldRect({ x, y, width, height }));
      if (reducedMotion) {
        progress.setValue(1);
        return undefined;
      }
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: enterDuration,
        easing: toEasing(t.motionEasingStandard),
        // react-native-web has no native animated module.
        useNativeDriver: false,
      });
      animation.start();
      return () => animation.stop();
    }
    setFieldRect(null);
    setPopupHeight(null);
    if (reducedMotion) {
      progress.setValue(0);
      setPopupMounted(false);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: enterDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) {
        setPopupMounted(false);
      }
    });
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, popupMounted, reducedMotion, usesSheet]);

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  const showClear = clearable && !isDisabled && (hasSelection || currentInputText !== '');

  const singleSummaryText = selectedValue !== undefined ? labelFor(selectedValue) : (placeholder ?? '');
  const summaryIsPlaceholder = selectedValue === undefined && !hasSelection;

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const insetShrink = t.borderWidthFocus - fieldBorderWidth;
  const activeFieldBorderWidth = focused ? t.borderWidthFocus : fieldBorderWidth;
  const fieldBorderColor = focused ? fieldBorderFocusColor : isInvalid ? fieldBorderInvalidColor : t.colorBorderStrong;

  const fieldRowStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: fieldGap,
    minHeight: t.sizeTargetComfortable,
    backgroundColor: t.colorBackground,
    borderWidth: activeFieldBorderWidth,
    borderColor: fieldBorderColor,
    borderRadius: fieldRadius,
    paddingHorizontal: fieldPaddingInline + insetShrink,
    paddingVertical: fieldPaddingBlock + insetShrink,
  };

  const chipStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: chipGap,
    backgroundColor: t.colorBackgroundStrong,
    borderRadius: chipRadius,
    paddingHorizontal: chipPaddingInline,
    paddingVertical: chipPaddingBlock,
  };

  const inputTextStyle: TextStyle = {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    fontFamily: overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody,
    fontSize: overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd,
    color: t.colorForeground,
  };

  const labelOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.fontSize,
    fontWeight: overrides?.labelWeight,
    lineHeight: overrides?.lineHeight,
  };
  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };
  const chipTextOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.chipSize, lineHeight: overrides?.lineHeight };
  const fieldTextOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };
  const listboxOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.fontSize,
    lineHeight: overrides?.lineHeight,
    disabledOpacity: overrides?.disabledOpacity,
  };

  const emptyMessage = filter === 'async' && loading ? COPY.loading : COPY.empty;

  const renderChip = (chipValue: string, interactive: boolean): React.JSX.Element => {
    const chipLabel = labelFor(chipValue);
    return (
      <View key={chipValue} style={chipStyle} testID="Combobox.chip">
        <Text size="sm" overrides={chipTextOverrides}>
          {chipLabel}
        </Text>
        {interactive ? (
          <Button
            label={COPY.removeChip(chipLabel)}
            variant="ghost"
            size="sm"
            iconOnly
            disabled={isDisabled}
            leadingIcon={<Icon name="close" size="xs" color={iconColor} />}
            onPress={() => handleRemoveChip(chipValue)}
          />
        ) : null}
      </View>
    );
  };

  const textInput = (
    <TextInput
      ref={inputRef}
      accessibilityRole="combobox"
      accessibilityLabel={visibleLabel}
      accessibilityHint={description}
      accessibilityState={{ disabled: isDisabled, expanded: open }}
      editable={!isDisabled}
      value={currentInputText}
      placeholder={placeholder}
      placeholderTextColor={t.colorForegroundMuted}
      autoCapitalize="none"
      autoCorrect={false}
      allowFontScaling
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      onSubmitEditing={handleSubmitEditing}
      style={inputTextStyle}
      testID="Combobox.input"
    />
  );

  const listbox = (
    <Listbox
      label={label}
      options={listboxItems}
      multiple={multiple}
      value={currentValue}
      disabled={isDisabled}
      emptyMessage={emptyMessage}
      onChange={handleListboxChange}
      overrides={listboxOverrides}
    />
  );

  const statusText =
    filter === 'async' && loading ? COPY.loading : resultCount === 0 ? COPY.empty : COPY.resultCount(resultCount);

  const status = open ? (
    <View accessibilityLiveRegion="polite" importantForAccessibility="yes" testID="Combobox.status">
      <Text size="xs" tone="muted" overrides={helperOverrides}>
        {statusText}
      </Text>
    </View>
  ) : null;

  const spaceBelow = fieldRect !== null ? windowHeight - (fieldRect.y + fieldRect.height) : 0;
  const spaceAbove = fieldRect !== null ? fieldRect.y : 0;
  const measuredPopupHeight = popupHeight ?? 0;
  const flipAbove = fieldRect !== null && spaceBelow < measuredPopupHeight + popupOffset && spaceAbove > spaceBelow;
  const popupTop =
    fieldRect === null ? 0 : flipAbove ? fieldRect.y - popupOffset - measuredPopupHeight : fieldRect.y + fieldRect.height + popupOffset;
  const popupLeft = fieldRect?.x ?? 0;
  const popupWidth = fieldRect?.width;

  const hostStyle: ViewStyle = { flex: 1 };

  const popupOuterStyle: Animated.WithAnimatedObject<ViewStyle> = {
    position: 'absolute',
    top: popupTop,
    left: popupLeft,
    width: popupWidth,
    borderRadius: popupRadius,
    zIndex: layer,
    opacity: progress,
    ...popupShadow,
  };

  const popupInnerStyle: ViewStyle = {
    borderRadius: popupRadius,
    borderWidth: t.borderWidthThin,
    borderColor: popupBorder,
    backgroundColor: popupSurface,
    overflow: 'hidden',
  };

  const sheetChipsRowStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: fieldGap, marginBottom: t.space2 };

  return (
    <View testID="Combobox" style={containerStyle}>
      <Text weight="medium" overrides={labelOverrides}>
        {visibleLabel}
      </Text>
      {description !== undefined ? (
        <Text size="sm" tone="muted" overrides={helperOverrides}>
          {description}
        </Text>
      ) : null}
      {usesSheet ? (
        <Pressable
          ref={fieldRef}
          accessibilityRole="combobox"
          accessibilityLabel={visibleLabel}
          accessibilityHint={description}
          accessibilityState={{ disabled: isDisabled, expanded: open }}
          accessibilityValue={!multiple && hasSelection ? { text: singleSummaryText } : undefined}
          onPress={handleTogglePress}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={fieldRowStyle}
          testID="Combobox.field"
        >
          {multiple ? selectedValues.map((v) => renderChip(v, false)) : null}
          {!multiple || selectedValues.length === 0 ? (
            <Text tone={summaryIsPlaceholder ? 'muted' : 'default'} overrides={fieldTextOverrides}>
              {singleSummaryText}
            </Text>
          ) : null}
          <Icon name="chevron-down" size="xs" color={iconColor} />
        </Pressable>
      ) : (
        <View ref={fieldRef} style={fieldRowStyle} testID="Combobox.field">
          {multiple ? selectedValues.map((v) => renderChip(v, true)) : null}
          {textInput}
          {showClear ? (
            <Button
              label={COPY.clearLabel}
              variant="ghost"
              size="sm"
              iconOnly
              leadingIcon={<Icon name="close" size="xs" color={iconColor} />}
              onPress={handleClear}
            />
          ) : null}
          <Button
            label={COPY.toggleLabel}
            variant="ghost"
            size="sm"
            iconOnly
            disabled={isDisabled}
            leadingIcon={<Icon name="chevron-down" size="xs" color={iconColor} />}
            onPress={handleTogglePress}
          />
        </View>
      )}
      {status}
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'} testID="Combobox.errorMessage">
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
      {usesSheet ? (
        <BottomSheet
          open={open}
          title={label}
          onClose={() => closePopup(true)}
          footer={multiple ? <Button label={COPY.done} onPress={() => closePopup(true)} /> : undefined}
        >
          <>
            {multiple && selectedValues.length > 0 ? (
              <View style={sheetChipsRowStyle}>{selectedValues.map((v) => renderChip(v, true))}</View>
            ) : null}
            {textInput}
          </>
          {listbox}
        </BottomSheet>
      ) : (
        <Modal visible={popupMounted} transparent animationType="none" onRequestClose={() => closePopup(true)} statusBarTranslucent>
          <View style={hostStyle}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => closePopup(true)} accessible={false} testID="Combobox.scrim" />
            {fieldRect !== null ? (
              <Animated.View style={popupOuterStyle} onLayout={handlePopupLayout} testID="Combobox.popup">
                <View style={popupInnerStyle}>{listbox}</View>
              </Animated.View>
            ) : null}
          </View>
        </Modal>
      )}
    </View>
  );
}
