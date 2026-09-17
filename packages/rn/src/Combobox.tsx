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
import type { LayoutChangeEvent, TextInputInstance, TextInputKeyPressEvent, TextStyle, ViewInstance, ViewStyle } from 'react-native';
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
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';

/** How typing narrows `options`. `none` never filters (type-ahead only); `async` leaves filtering to the consumer. */
export type ComboboxFilter = 'startsWith' | 'contains' | 'none' | 'async';

/** The selection: a value, or with `multiple` an array of values. An empty string / empty array is "nothing selected". */
export type ComboboxValue = string | string[];

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ComboboxOverridableBinding =
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
  | 'popupBorderWidth'
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
  /** Visible label. Always rendered. Also the input's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering. */
  options: ListboxItem[];
  /** Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry. */
  value?: string | string[] | undefined;
  /** Initial value(s). */
  defaultValue?: string | string[] | undefined;
  /** Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default. */
  open?: boolean | undefined;
  /** Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering. */
  inputValue?: string | undefined;
  /** Pick many: selected options appear as chips before the input, each removable; the list stays open while toggling; Backspace in an empty input removes the last chip. */
  multiple?: boolean | undefined;
  /** Typed text that matches no option can be committed as a value (tags, emails). Enter or a comma commits it; the list shows `copy.addCustom` as a synthetic first row. */
  allowCustom?: boolean | undefined;
  /** How typing narrows `options`: by prefix, by substring (default), not at all (type-ahead), or by the consumer (`async`). */
  filter?: ComboboxFilter | undefined;
  /** Example input shown while empty. Never the only description. */
  placeholder?: string | undefined;
  /** Helper text under the label. Also the input's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Not editable, not submitted, still readable and focusable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** For `async`: show the loading row and announce it. The consumer sets it around its request. */
  loading?: boolean | undefined;
  /** Show a clear button when there is a value or text. */
  clearable?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /** Fired on every keystroke with the input text. The hook for `async` filtering. */
  onInputChange?: ((value: string) => void) | undefined;
  /** Fired when the list opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/** copy.* — used verbatim; `{…}` params are interpolated, `resultCount` is selected by `Intl.PluralRules`. */
const COPY = {
  empty: 'No matches',
  loading: 'Loading…',
  addCustom: 'Add "{value}"',
  clearLabel: 'Clear',
  toggleLabel: 'Show options',
  done: 'Done',
  removeChip: 'Remove {label}',
  resultCount: {
    one: '{count} result available',
    other: '{count} results available',
  },
  activeOption: '{option}',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
} as const;

function resultCountText(count: number): string {
  const form = new Intl.PluralRules(undefined).select(count) === 'one' ? COPY.resultCount.one : COPY.resultCount.other;
  return form.replace('{count}', String(count));
}

// Prefix marking the synthetic "add custom" row given to the Listbox, so the
// existing engine renders and commits it like any other option.
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

/** Case- and diacritic-insensitive comparison key. */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Combobox — an input that narrows as you type and lets you pick, or, with
 * `allowCustom`, keep what you typed.
 *
 * When to use: long lists (fifty-plus), values typed faster than found, `async`
 * search against a server, and multi-value fields where chips make the selection
 * legible. Use Select for short static lists.
 *
 * Composes the same `Listbox` engine as `Select` (`embedded`). On phones the field is
 * a `Pressable` summary (chips read-only) that opens a `BottomSheet height="full"`
 * with the chips and the `TextInput` at the top of its body, the `Listbox` below and
 * a `copy.done` footer Button; on tablets and react-native-web the field holds the
 * `TextInput` directly and the popup is an anchored `Modal` below it (flipped above on
 * overflow) that does not trap focus. Listbox rows are touch `Pressable`s with no key
 * events, so arrow browsing, Alt+ArrowDown and Tab-without-committing have no native
 * equivalent: a tap commits, Enter or a comma through the `TextInput` commits typed
 * custom text, Escape (hardware keyboard / react-native-web) closes then clears the
 * text, and blurring the anchored field closes the list. Result counts, loading and
 * empty states are announced with `AccessibilityInfo.announceForAccessibility` after
 * `motion.duration.base × 2`. Validation and Form registration work as `Input`'s:
 * `error` prop → `required` → `invalid`.
 */
export function Combobox({
  label,
  name,
  options,
  value,
  defaultValue,
  open: openProp,
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
  ref,
  onChange,
  onInputChange,
  onOpenChange,
}: ComboboxProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const fieldRef = React.useRef<ViewInstance>(null);
  const inputRef = React.useRef<TextInputInstance>(null);

  const emptyValue: ComboboxValue = multiple ? [] : '';
  const [internalValue, setInternalValue] = React.useState<ComboboxValue>(defaultValue ?? emptyValue);
  // Single mode shows the selected option's label in the input.
  const [internalInputText, setInternalInputText] = React.useState<string>(() => {
    const initial = value ?? defaultValue;
    if (multiple || typeof initial !== 'string' || initial === '') {
      return '';
    }
    return flattenOptions(options).find((option) => option.value === initial)?.label ?? initial;
  });
  const [internalOpen, setInternalOpen] = React.useState(false);
  // The toggle button opens the full, unfiltered list for that opening; the next keystroke filters again.
  const [showAll, setShowAll] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [popupMounted, setPopupMounted] = React.useState(openProp ?? false);
  const [fieldRect, setFieldRect] = React.useState<Rect | null>(null);
  const [popupHeight, setPopupHeight] = React.useState<number | null>(null);
  const [statusText, setStatusText] = React.useState<string>('');
  const progress = React.useRef(new Animated.Value(0)).current;

  const isValueControlled = value !== undefined;
  const currentValue: ComboboxValue = isValueControlled ? value : internalValue;
  const isInputControlled = inputValue !== undefined;
  const currentInputText = isInputControlled ? inputValue : internalInputText;
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? openProp : internalOpen;
  const isDisabled = disabled || (form?.disabled ?? false);
  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  // Typing on a phone with a floating list under the keyboard is unusable, so phones get a BottomSheet.
  const usesSheet = windowWidth <= t.layoutMaxWidthProse;

  const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
  const labelFor = React.useCallback(
    (optionValue: string): string => flatOptions.find((option) => option.value === optionValue)?.label ?? optionValue,
    [flatOptions],
  );

  const selectedValues: string[] = multiple ? (Array.isArray(currentValue) ? currentValue : currentValue !== '' ? [currentValue] : []) : [];
  const selectedValue: string | undefined = !multiple && typeof currentValue === 'string' && currentValue !== '' ? currentValue : undefined;
  const hasSelection = multiple ? selectedValues.length > 0 : selectedValue !== undefined;

  // A controlled `value` change rewrites the label without firing onInputChange.
  const lastSingleValue = React.useRef(multiple ? undefined : currentValue);
  React.useEffect(() => {
    if (multiple || isInputControlled || typeof currentValue !== 'string' || lastSingleValue.current === currentValue) {
      return;
    }
    lastSingleValue.current = currentValue;
    setInternalInputText(currentValue === '' ? '' : labelFor(currentValue));
  }, [multiple, isInputControlled, currentValue, labelFor]);

  const trimmedInput = currentInputText.trim();
  const needle = fold(trimmedInput);

  const filteredItems = React.useMemo<ListboxItem[]>(() => {
    if (filter === 'none' || filter === 'async' || showAll || needle === '') {
      return options;
    }
    const matches = (option: ListboxOption): boolean =>
      filter === 'startsWith' ? fold(option.label).startsWith(needle) : fold(option.label).includes(needle);
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
  }, [options, filter, showAll, needle]);

  // `filter: none` is type-ahead: the list is not narrowed; the first label starting with the text is pre-highlighted.
  const typeAheadValue =
    filter === 'none' && needle !== '' ? flatOptions.find((option) => !option.disabled && fold(option.label).startsWith(needle))?.value : undefined;

  const isLoading = filter === 'async' && loading;
  // One predicate for suppressing the custom row and for committing typed text: label or value, folded.
  const findExactMatch = (text: string): ListboxOption | undefined => {
    const key = fold(text);
    return flatOptions.find((option) => fold(option.label) === key || fold(option.value) === key);
  };
  const exactMatch = findExactMatch(trimmedInput);
  // While loading, stale results and the custom row are hidden; Listbox shows copy.loading in place of emptyMessage.
  const showCustomRow = allowCustom && !isLoading && trimmedInput !== '' && exactMatch === undefined;
  const customOption: ListboxOption | null = showCustomRow
    ? { value: `${CUSTOM_PREFIX}${trimmedInput}`, label: COPY.addCustom.replace('{value}', trimmedInput) }
    : null;
  const visibleItems: ListboxItem[] = isLoading ? [] : filteredItems;
  const listboxItems: ListboxItem[] = customOption !== null ? [customOption, ...visibleItems] : visibleItems;
  // The count excludes the synthetic custom row.
  const resultCount = flattenOptions(visibleItems).length;

  const validateValue = React.useCallback(
    (candidate: ComboboxValue): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required) {
        const empty = Array.isArray(candidate) ? candidate.length === 0 : candidate === '';
        if (empty) {
          return COPY.required.replace('{label}', label);
        }
      }
      if (invalid) {
        return COPY.invalid.replace('{label}', label);
      }
      return null;
    },
    [required, label, error, invalid],
  );

  const changeOpen = (next: boolean): void => {
    if (next === open) {
      return;
    }
    if (!isOpenControlled) {
      setInternalOpen(next);
    }
    if (!next) {
      setShowAll(false);
    }
    onOpenChange?.(next);
  };

  const latest = React.useRef({ currentValue, validateValue, changeOpen });
  latest.current = { currentValue, validateValue, changeOpen };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      // FormFieldValue has no array form: multiple values are submitted comma-joined (a comma always commits, so no value contains one).
      getValue: () => {
        const current = latest.current.currentValue;
        if (Array.isArray(current)) {
          return current.length > 0 ? current.join(',') : undefined;
        }
        return current !== '' ? current : undefined;
      },
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: () => {
        if (usesSheet) {
          latest.current.changeOpen(true);
          return;
        }
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
    [usesSheet],
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

  // constant statusDebounce: motion.duration.base × 2.
  const statusDebounce = t.motionDurationBase * 2;
  React.useEffect(() => {
    if (!open) {
      setStatusText('');
      return undefined;
    }
    const text = isLoading ? COPY.loading : resultCount === 0 ? COPY.empty : resultCountText(resultCount);
    const timeout = setTimeout(() => {
      setStatusText(text);
      // Android (and react-native-web) read the polite live region; iOS has none, so only there is it announced.
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(text);
      }
    }, statusDebounce);
    return () => clearTimeout(timeout);
  }, [open, isLoading, resultCount, statusDebounce]);

  const focusFieldA11y = (): void => {
    const node = fieldRef.current ? findNodeHandle(fieldRef.current) : null;
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
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
    setShowAll(false);
    if (multiple) {
      const resolved = (Array.isArray(next) ? next : [next]).map(resolveCustom);
      commitValue(Array.from(new Set(resolved)));
      commitInputText('');
      return;
    }
    const raw = Array.isArray(next) ? next[0] : next;
    const resolved = raw === undefined ? '' : resolveCustom(raw);
    commitValue(resolved);
    commitInputText(resolved === '' ? '' : labelFor(resolved));
    closePopup(!usesSheet);
  };

  const handleTogglePress = (): void => {
    if (isDisabled) {
      return;
    }
    if (open) {
      closePopup(true);
    } else {
      setShowAll(true);
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

  /**
   * Commits `raw` as typed text: an option it names exactly (its `value`, never a custom string), otherwise
   * (allowCustom) a custom entry. Multiple clears the input and stays open; single shows the committed text and closes.
   * Returns false when nothing was committed.
   */
  const commitTyped = (raw: string): boolean => {
    const text = raw.trim();
    if (text === '') {
      return false;
    }
    const match = findExactMatch(text);
    if (match?.disabled === true || (match === undefined && !allowCustom)) {
      return false;
    }
    const committed = match?.value ?? text;
    if (multiple) {
      if (!selectedValues.includes(committed)) {
        commitValue([...selectedValues, committed]);
      }
      commitInputText('');
    } else {
      if (committed !== selectedValue) {
        commitValue(committed);
      }
      commitInputText(match?.label ?? text);
      closePopup(false);
    }
    return true;
  };

  const handleChangeText = (text: string): void => {
    setShowAll(false);
    if (allowCustom && text.includes(',')) {
      // A comma commits the text before it exactly as Enter does; with nothing to commit the comma is dropped.
      const before = text.slice(0, text.indexOf(','));
      if (!commitTyped(before)) {
        commitInputText(before.trim() === '' ? '' : before);
      }
      return;
    }
    commitInputText(text);
    if (!open && !isDisabled) {
      changeOpen(true);
    }
  };

  // Enter has no active option to commit on native (rows are touch-only); it commits typed text.
  const handleSubmitEditing = (): void => {
    if (allowCustom) {
      commitTyped(currentInputText);
    }
  };

  const handleKeyPress = (event: TextInputKeyPressEvent): void => {
    const key = event.nativeEvent.key;
    if (key === 'Backspace' && multiple && currentInputText === '' && selectedValues.length > 0) {
      commitValue(selectedValues.slice(0, -1));
      return;
    }
    // Reachable only from a hardware keyboard or react-native-web.
    if (key === 'Escape') {
      if (open) {
        closePopup(false);
      } else if (clearable && currentInputText !== '') {
        commitInputText('');
      }
    }
  };

  const handleFocus = (): void => {
    setFocused(true);
  };

  const handleBlur = (): void => {
    setFocused(false);
    // In the sheet, tapping a row dismisses the keyboard; only the anchored field closes on blur.
    if (!usesSheet) {
      closePopup(false);
    }
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

  const fieldBorderInvalidColor = overrides?.fieldBorderInvalid ? (resolveToken(t, overrides.fieldBorderInvalid) as string) : t.colorBorderDanger;
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
  const popupSurface = overrides?.popupSurface ? (resolveToken(t, overrides.popupSurface) as string) : t.colorOverlaySurface;
  const popupBorder = overrides?.popupBorder ? (resolveToken(t, overrides.popupBorder) as string) : t.colorBorder;
  const popupBorderWidth = overrides?.popupBorderWidth ? (resolveToken(t, overrides.popupBorderWidth) as number) : t.borderWidthThin;
  const popupShadow = overrides?.popupShadow ? (resolveToken(t, overrides.popupShadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const popupRadius = overrides?.popupRadius ? (resolveToken(t, overrides.popupRadius) as number) : t.radiusMd;
  const popupOffset = overrides?.popupOffset ? (resolveToken(t, overrides.popupOffset) as number) : t.space1;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDropdown;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationFast;
  const iconColor = t.colorForegroundMuted;

  // Anchored-popup path only; the BottomSheet runs its own animation.
  React.useEffect(() => {
    if (usesSheet || !popupMounted) {
      return undefined;
    }
    if (open) {
      fieldRef.current?.measureInWindow((x, y, width, height) => setFieldRect({ x, y, width, height }));
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
  const summaryIsPlaceholder = !hasSelection;

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  // The focus border is drawn thicker; padding shrinks by the difference so content does not shift.
  const activeFieldBorderWidth = focused ? t.borderWidthFocus : fieldBorderWidth;
  const insetShrink = focused ? t.borderWidthFocus - fieldBorderWidth : 0;
  const fieldBorderColor = focused ? t.colorBorderFocus : isInvalid ? fieldBorderInvalidColor : t.colorBorderStrong;

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
    paddingHorizontal: fieldPaddingInline - insetShrink,
    paddingVertical: fieldPaddingBlock - insetShrink,
  };

  const chipStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: chipGap,
    backgroundColor: t.colorBackgroundStrong,
    borderRadius: chipRadius,
    paddingHorizontal: chipPaddingInline,
    paddingVertical: chipPaddingBlock,
  };

  const inputFontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const inputLineHeight = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const inputTextStyle: TextStyle = {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: t.sizeTargetMin,
    fontFamily: overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody,
    fontSize: inputFontSize,
    lineHeight: toLineHeight(inputFontSize, inputLineHeight),
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

  const renderChip = (chipValue: string, interactive: boolean): React.JSX.Element => {
    const chipLabel = labelFor(chipValue);
    return (
      <View key={chipValue} style={chipStyle} testID="Combobox.chip">
        <Text size="sm" truncate overrides={chipTextOverrides}>
          {chipLabel}
        </Text>
        {interactive ? (
          <View testID="Combobox.chipRemove">
            <Button
              label={COPY.removeChip.replace('{label}', chipLabel)}
              variant="ghost"
              size="sm"
              iconOnly
              disabled={isDisabled}
              leadingIcon={<Icon name="close" size="xs" color={iconColor} />}
              onPress={() => handleRemoveChip(chipValue)}
            />
          </View>
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
      accessibilityValue={!multiple && selectedValue !== undefined ? { text: labelFor(selectedValue) } : undefined}
      editable={!isDisabled}
      value={currentInputText}
      placeholder={placeholder}
      placeholderTextColor={t.colorForegroundMuted}
      autoCapitalize="none"
      autoCorrect={false}
      autoFocus={usesSheet}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      onSubmitEditing={handleSubmitEditing}
      submitBehavior={multiple ? 'submit' : 'blurAndSubmit'}
      style={inputTextStyle}
      testID="Combobox.input"
    />
  );

  const listbox = (
    <View testID="Combobox.listbox">
      <Listbox
        label={label}
        options={listboxItems}
        multiple={multiple}
        value={multiple ? selectedValues : (selectedValue ?? '')}
        disabled={isDisabled}
        embedded
        loading={isLoading}
        emptyMessage={COPY.empty}
        initialActiveValue={typeAheadValue}
        onChange={handleListboxChange}
        overrides={listboxOverrides}
      />
    </View>
  );

  const status = (
    <View accessibilityLiveRegion="polite" testID="Combobox.status">
      {open && statusText !== '' ? (
        <Text size="sm" tone="muted" overrides={helperOverrides}>
          {statusText}
        </Text>
      ) : null}
    </View>
  );

  const spaceBelow = fieldRect !== null ? windowHeight - (fieldRect.y + fieldRect.height) : 0;
  const spaceAbove = fieldRect !== null ? fieldRect.y : 0;
  const measuredPopupHeight = popupHeight ?? 0;
  const flipAbove = fieldRect !== null && spaceBelow < measuredPopupHeight + popupOffset && spaceAbove > spaceBelow;
  const popupTop =
    fieldRect === null ? 0 : flipAbove ? fieldRect.y - popupOffset - measuredPopupHeight : fieldRect.y + fieldRect.height + popupOffset;

  const hostStyle: ViewStyle = { flex: 1 };

  const popupOuterStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    top: popupTop,
    left: fieldRect?.x ?? 0,
    minWidth: fieldRect?.width ?? 0,
    borderRadius: popupRadius,
    zIndex: layer,
    opacity: progress,
    ...popupShadow,
  };

  const popupInnerStyle: ViewStyle = {
    borderRadius: popupRadius,
    borderWidth: popupBorderWidth,
    borderColor: popupBorder,
    backgroundColor: popupSurface,
    overflow: 'hidden',
  };

  const sheetFieldStyle: ViewStyle = { flexDirection: 'column', gap: fieldGap };
  const sheetChipsRowStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: fieldGap };

  const clearButton = showClear ? (
    <View testID="Combobox.clearButton">
      <Button
        label={COPY.clearLabel}
        variant="ghost"
        size="sm"
        iconOnly
        leadingIcon={<Icon name="close" size="xs" color={iconColor} />}
        onPress={handleClear}
      />
    </View>
  ) : null;

  return (
    <View ref={ref} testID="Combobox" style={containerStyle}>
      <View testID="Combobox.label">
        <Text weight="medium" overrides={labelOverrides}>
          {visibleLabel}
        </Text>
      </View>
      {description !== undefined ? (
        <View testID="Combobox.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      {usesSheet ? (
        <Pressable
          ref={fieldRef}
          accessibilityRole="combobox"
          accessibilityLabel={visibleLabel}
          accessibilityHint={description}
          accessibilityState={{ disabled: isDisabled, expanded: open }}
          accessibilityValue={hasSelection ? { text: multiple ? selectedValues.map(labelFor).join(', ') : singleSummaryText } : undefined}
          onPress={handleTogglePress}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={fieldRowStyle}
          testID="Combobox.field"
        >
          {multiple && selectedValues.length > 0 ? (
            <View style={sheetChipsRowStyle} testID="Combobox.chips">
              {selectedValues.map((v) => renderChip(v, false))}
            </View>
          ) : (
            <Text tone={summaryIsPlaceholder ? 'muted' : 'default'} truncate overrides={fieldTextOverrides}>
              {singleSummaryText}
            </Text>
          )}
          <View testID="Combobox.toggleButton" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Icon name="chevron-down" size="xs" color={iconColor} />
          </View>
        </Pressable>
      ) : (
        <View ref={fieldRef} style={fieldRowStyle} testID="Combobox.field">
          {multiple && selectedValues.length > 0 ? (
            <View style={sheetChipsRowStyle} testID="Combobox.chips">
              {selectedValues.map((v) => renderChip(v, true))}
            </View>
          ) : null}
          {textInput}
          {clearButton}
          <View testID="Combobox.toggleButton">
            <Button
              label={COPY.toggleLabel}
              variant="ghost"
              size="sm"
              iconOnly
              expanded={open}
              disabled={isDisabled}
              leadingIcon={<Icon name="chevron-down" size="xs" color={iconColor} />}
              onPress={handleTogglePress}
            />
          </View>
        </View>
      )}
      {usesSheet ? null : status}
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
          heading={label}
          height="full"
          onClose={() => closePopup(true)}
          footer={<Button label={COPY.done} onPress={() => closePopup(true)} />}
        >
          <View style={sheetFieldStyle} testID="Combobox.popup">
            {multiple && selectedValues.length > 0 ? (
              <View style={sheetChipsRowStyle} testID="Combobox.chips">
                {selectedValues.map((v) => renderChip(v, true))}
              </View>
            ) : null}
            <View style={fieldRowStyle}>
              {textInput}
              {clearButton}
            </View>
            {status}
            {listbox}
          </View>
        </BottomSheet>
      ) : (
        <Modal visible={popupMounted} transparent animationType="none" onRequestClose={() => closePopup(true)} statusBarTranslucent>
          <View style={hostStyle}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closePopup(true)} accessible={false} testID="Combobox.scrim" />
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
