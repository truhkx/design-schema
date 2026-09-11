import * as React from 'react';
import { AccessibilityInfo, FlatList, Platform, Pressable, Text as RNText, View, findNodeHandle } from 'react-native';
import type { LayoutChangeEvent, ListRenderItemInfo, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Text } from './Text';
import { toFontWeight, toLineHeight, useTheme } from './theme';

/** One selectable row. `value` is the short identifier submitted with the Form. */
export type ListboxOption = {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
};

/** A labelled cluster of options, rendered with a non-interactive heading row. */
export type ListboxGroup = { group: string; options: ListboxOption[] };

export type ListboxItem = ListboxOption | ListboxGroup;

/** The selection: a value, or with `multiple` an array of values. */
export type ListboxValue = string | string[];

export type ListboxMaxVisible = 5 | 8 | 12 | '5' | '8' | '12' | 'all';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ListboxOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'listPadding'
  | 'optionPaddingBlock'
  | 'optionPaddingInline'
  | 'optionGap'
  | 'optionRadius'
  | 'optionDescriptionSize'
  | 'optionSelectedWeight'
  | 'groupLabelSize'
  | 'groupLabelWeight'
  | 'groupLabelPaddingBlock'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity';

export interface ListboxProps {
  /** Accessible name of the list. */
  label: string;
  /** Flat or grouped options. */
  options: ListboxItem[];
  /** Allow any number of selections. The value becomes an array; each option shows a check indicator. */
  multiple?: boolean | undefined;
  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  value?: ListboxValue | undefined;
  /** Initial selection (or array) for an uncontrolled list. */
  defaultValue?: ListboxValue | undefined;
  /**
   * Single-select only: on the web keyboard model, arrow keys select as they move.
   * Native has no arrow-key browsing to intercept — a `Pressable`'s activation is
   * already the only "move" it gets — so this flag is accepted for API parity but has
   * no runtime effect on this platform.
   */
  selectionFollowsFocus?: boolean | undefined;
  /** At least one option must be selected to submit when inside a Form. */
  required?: boolean | undefined;
  /**
   * Marks the list invalid. Usually set by the Form. No dedicated border token exists
   * for this component (unlike Input/Select's own bordered fields), so this only feeds
   * the `error` → `required` → `invalid` message precedence; it has no visual
   * treatment of its own.
   */
  invalid?: boolean | undefined;
  /** Error message rendered below the list. Setting it implies `invalid`. */
  error?: string | undefined;
  /**
   * The list lives inside a popup (Select, Combobox) that owns the border, surface
   * and radius; the list draws none of its own.
   */
  embedded?: boolean | undefined;
  /**
   * The option that is active when the list first renders. Defaults to the first
   * selected option, else the first enabled option. Pre-highlights that row's active
   * background; native has no single tab stop to move real accessibility focus onto
   * ahead of the user reaching it, so this is visual only — see the generation gap
   * notes.
   */
  defaultActiveValue?: string | undefined;
  /**
   * Options are being fetched (async Combobox); shows `copy.loading` in place of the
   * empty message and marks the list `accessibilityState.busy`.
   */
  loading?: boolean | undefined;
  /** The whole list is inert but readable. */
  disabled?: boolean | undefined;
  /** Field name for Form collection. Multiple values are collected as an array. */
  name?: string | undefined;
  /** Shown when `options` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: ((value: ListboxValue) => void) | undefined;
  /** Fired as the focused (active) option changes, with its value. */
  onActiveChange?: ((value: string) => void) | undefined;
}

const COPY = {
  empty: 'No options',
  required: (label: string): string => `${label} is required.`,
  // Not in the schema's copy block, which names `copy.invalid` without defining it.
  // Matches the wording Input and Select use for the same prop. See the generation
  // gap notes.
  invalid: (label: string): string => `${label} is not valid.`,
  selectedCount: (count: number): string => `${count} selected`,
  loading: 'Loading…',
} as const;

type ListboxRow = { kind: 'group'; key: string; label: string } | { kind: 'option'; key: string; option: ListboxOption };

function isGroup(item: ListboxItem): item is ListboxGroup {
  return 'group' in item;
}

function flattenRows(items: ListboxItem[]): ListboxRow[] {
  const rows: ListboxRow[] = [];
  items.forEach((item, itemIndex) => {
    if (isGroup(item)) {
      rows.push({ kind: 'group', key: `group-${itemIndex}`, label: item.group });
      item.options.forEach((option, optionIndex) => {
        rows.push({ kind: 'option', key: `${itemIndex}-${optionIndex}-${option.value}`, option });
      });
    } else {
      rows.push({ kind: 'option', key: `${itemIndex}-${item.value}`, option: item });
    }
  });
  return rows;
}

function flattenOptions(items: ListboxItem[]): ListboxOption[] {
  const options: ListboxOption[] = [];
  items.forEach((item) => {
    if (isGroup(item)) {
      options.push(...item.options);
    } else {
      options.push(item);
    }
  });
  return options;
}

/**
 * Listbox — the engine behind a picker: the list of options a Select's popup or a
 * Combobox's suggestions actually renders, extracted so all three behave identically,
 * including for multi-select.
 *
 * When to use: Use a standalone Listbox when the options should stay visible — a
 * settings picker, a transfer list. Use `multiple` for "pick any". Do not use it for
 * two to seven options that fit without scrolling (RadioGroup or Checkbox) or for
 * actions (Menu).
 *
 * Renders a `FlatList` (virtualised — long option lists are common) of `Pressable`
 * rows with `accessibilityRole="menuitem"` (there is no listbox/option role on
 * native) and `accessibilityState={{ selected, disabled }}` (`checked` instead of
 * `selected` when `multiple`). Groups are plain, non-interactive rows — not the
 * header trait, which would enter the headings rotor. `maxVisible` becomes a
 * `maxHeight` computed from the first row's measured height, so the list scrolls
 * after that many rows; `all` never scrolls. Each row is its own accessibility stop:
 * native has no generic key-event API on `Pressable`, so arrow navigation, Home/End,
 * Page Up/Down, typeahead and the multi-select modifiers (Shift+Arrow, Ctrl/Cmd+A)
 * from the web keyboard model have no equivalent here — the same acknowledged limit
 * `Menu` documents. Enter/Space activation is the native accessibility "activate"
 * action and needs no extra wiring. The check indicator is always rendered (invisible
 * when unselected) so labels align; it and the leading option `Icon` are decorative
 * (hidden from assistive tech) since the row's own accessibility label and state
 * already carry that meaning. Focus is tracked by hand (`onFocus`/`onBlur`) to draw
 * the active background and focus ring and to fire `onActiveChange`. Inside a Form
 * the list registers by `name` (when given) and contributes the selected value, or
 * the array for `multiple` (`undefined`, i.e. no key, when nothing is selected);
 * `required` fails with `copy.required` when nothing is selected, and focus on a
 * failed submit moves to the list itself. `error` (or a Form-derived error) takes
 * precedence over `required`, which takes precedence over the boolean-only `invalid`
 * flag (no dedicated border token exists for this component, so `invalid` alone has
 * no visual treatment). `embedded` drops the list's own border, surface and radius
 * for use inside a popup that already draws them (Select, Combobox). `loading` shows
 * `copy.loading` in place of the empty message and marks the list
 * `accessibilityState.busy`. `defaultActiveValue` (falling back to the first selected
 * option, else the first enabled one) only pre-highlights that row's active
 * background on mount — native has no single tab stop to move real accessibility
 * focus onto ahead of the user reaching it.
 */
export function Listbox({
  label,
  options,
  multiple = false,
  value,
  defaultValue,
  selectionFollowsFocus = true,
  required = false,
  invalid = false,
  error,
  embedded = false,
  defaultActiveValue,
  loading = false,
  disabled = false,
  name,
  emptyMessage,
  maxVisible = '8',
  overrides,
  onChange,
  onActiveChange,
}: ListboxProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const listRef = React.useRef<FlatList<ListboxRow>>(null);
  const [internalValue, setInternalValue] = React.useState<ListboxValue | undefined>(defaultValue);
  const [focusedValue, setFocusedValue] = React.useState<string | null>(() => {
    if (defaultActiveValue !== undefined) {
      return defaultActiveValue;
    }
    const initialValue = value ?? defaultValue;
    const initiallySelected = multiple
      ? Array.isArray(initialValue) && initialValue.length > 0
        ? initialValue[0]
        : undefined
      : typeof initialValue === 'string'
        ? initialValue
        : undefined;
    if (initiallySelected !== undefined) {
      return initiallySelected;
    }
    return flattenOptions(options).find((option) => option.disabled !== true)?.value ?? null;
  });
  const [rowHeight, setRowHeight] = React.useState<number | null>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isDisabled = disabled || (form?.disabled ?? false);

  const orderedOptions = React.useMemo(() => flattenOptions(options), [options]);
  const orderedValues = React.useMemo(() => orderedOptions.map((option) => option.value), [orderedOptions]);
  const rows = React.useMemo(() => flattenRows(options), [options]);
  const hasOptions = rows.some((row) => row.kind === 'option');

  const selectedValues: string[] = multiple && Array.isArray(currentValue) ? currentValue : [];
  const selectedValue: string | undefined = !multiple && typeof currentValue === 'string' ? currentValue : undefined;

  const formError = name !== undefined ? form?.errors[name] : undefined;
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const summarised = form !== null && form.errorSummary;

  React.useEffect(() => {
    if (__DEV__ && multiple && !selectionFollowsFocus) {
      console.warn('Listbox: `selectionFollowsFocus` only applies to single-select lists.');
    }
  }, [multiple, selectionFollowsFocus]);

  const validateValue = React.useCallback(
    (candidate: ListboxValue | undefined): string | null => {
      // Precedence: `error` prop, then `required`, then `invalid`.
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required) {
        const empty = multiple ? !Array.isArray(candidate) || candidate.length === 0 : candidate === undefined;
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

  const latest = React.useRef({ currentValue, validateValue });
  latest.current = { currentValue, validateValue };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => {
        const current = latest.current.currentValue;
        if (multiple) {
          return Array.isArray(current) && current.length > 0 ? current : undefined;
        }
        return typeof current === 'string' ? current : undefined;
      },
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: () => {
        const node = listRef.current === null ? null : findNodeHandle(listRef.current);
        if (node != null) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      },
    }),
    [multiple],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    if (register === undefined || unregister === undefined || name === undefined || isDisabled) {
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

  const commit = (next: ListboxValue): void => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && name !== undefined && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const selectOption = (option: ListboxOption): void => {
    if (isDisabled || option.disabled === true) {
      return;
    }
    if (multiple) {
      const nextSet = new Set(selectedValues);
      if (nextSet.has(option.value)) {
        nextSet.delete(option.value);
      } else {
        nextSet.add(option.value);
      }
      commit(orderedValues.filter((v) => nextSet.has(v)));
      return;
    }
    if (option.value === selectedValue) {
      return;
    }
    commit(option.value);
  };

  const handleFocusOption = (optionValue: string): void => {
    setFocusedValue(optionValue);
    onActiveChange?.(optionValue);
  };
  const handleBlurOption = (optionValue: string): void => {
    setFocusedValue((prev) => (prev === optionValue ? null : prev));
  };

  const border = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorderStrong;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const listPadding = overrides?.listPadding ? (resolveToken(t, overrides.listPadding) as number) : t.space1;
  const optionPaddingBlock = overrides?.optionPaddingBlock ? (resolveToken(t, overrides.optionPaddingBlock) as number) : t.spaceSm;
  const optionPaddingInline = overrides?.optionPaddingInline ? (resolveToken(t, overrides.optionPaddingInline) as number) : t.spaceMd;
  const optionGap = overrides?.optionGap ? (resolveToken(t, overrides.optionGap) as number) : t.layoutGapNormal;
  const optionRadius = overrides?.optionRadius ? (resolveToken(t, overrides.optionRadius) as number) : t.radiusSm;
  const optionDescriptionSize = overrides?.optionDescriptionSize
    ? (resolveToken(t, overrides.optionDescriptionSize) as number)
    : t.fontSizeSm;
  const optionSelectedWeight = overrides?.optionSelectedWeight
    ? (resolveToken(t, overrides.optionSelectedWeight) as number)
    : t.fontWeightMedium;
  const groupLabelSize = overrides?.groupLabelSize ? (resolveToken(t, overrides.groupLabelSize) as number) : t.fontSizeXs;
  const groupLabelWeight = overrides?.groupLabelWeight
    ? (resolveToken(t, overrides.groupLabelWeight) as number)
    : t.fontWeightSemibold;
  const groupLabelPaddingBlock = overrides?.groupLabelPaddingBlock
    ? (resolveToken(t, overrides.groupLabelPaddingBlock) as number)
    : t.space1;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  const placeholderText = loading ? COPY.loading : (emptyMessage ?? COPY.empty);
  const rowCount = maxVisible === 'all' ? null : Number(maxVisible);
  const maxHeight = rowCount !== null && rowHeight !== null ? rowCount * rowHeight : undefined;

  const handleFirstRowLayout = (event: LayoutChangeEvent): void => {
    if (rowHeight === null) {
      setRowHeight(event.nativeEvent.layout.height);
    }
  };

  const containerStyle: ViewStyle = {
    ...(embedded
      ? null
      : {
          borderWidth,
          borderColor: border,
          borderRadius: radius,
          backgroundColor: t.colorBackground,
        }),
    opacity: isDisabled ? disabledOpacity : 1,
    overflow: 'hidden',
  };

  const listStyle: ViewStyle = {
    padding: listPadding,
    ...(maxHeight !== undefined ? { maxHeight } : null),
  };

  const groupLabelRowStyle: ViewStyle = {
    paddingHorizontal: optionPaddingInline,
    paddingTop: groupLabelPaddingBlock,
    paddingBottom: groupLabelPaddingBlock,
  };

  const groupLabelStyle: TextStyle = {
    fontFamily,
    fontSize: groupLabelSize,
    fontWeight: toFontWeight(groupLabelWeight),
    lineHeight: toLineHeight(groupLabelSize, lineHeightMultiplier),
    color: t.colorForegroundMuted,
  };

  const optionRowStyle = (focused: boolean, optionDisabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: optionGap,
    minHeight: t.sizeTargetMin,
    paddingVertical: optionPaddingBlock,
    paddingHorizontal: optionPaddingInline,
    borderRadius: optionRadius,
    backgroundColor: focused ? t.colorBackgroundSubtle : 'transparent',
    borderWidth: focused ? t.borderWidthFocus : 0,
    borderColor: focused ? t.colorBorderFocus : 'transparent',
    opacity: optionDisabled && !isDisabled ? disabledOpacity : 1,
  });

  const optionLabelStyle = (selected: boolean): TextStyle => ({
    flexShrink: 1,
    fontFamily,
    fontSize,
    fontWeight: toFontWeight(selected ? optionSelectedWeight : t.fontWeightRegular),
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    color: t.colorForeground,
  });

  const optionDescriptionStyle: TextStyle = {
    flexShrink: 1,
    fontFamily,
    fontSize: optionDescriptionSize,
    lineHeight: toLineHeight(optionDescriptionSize, lineHeightMultiplier),
    color: t.colorForegroundMuted,
  };

  const optionTextColumnStyle: ViewStyle = { flexShrink: 1, flexDirection: 'column', gap: t.space1 };
  const checkSlotStyle = (selected: boolean): ViewStyle => ({ opacity: selected ? 1 : 0 });
  const emptyRowStyle: ViewStyle = { paddingVertical: optionPaddingBlock, paddingHorizontal: optionPaddingInline };
  const typographyOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };

  const renderItem = ({ item, index }: ListRenderItemInfo<ListboxRow>): React.JSX.Element => {
    const onLayout = index === 0 ? handleFirstRowLayout : undefined;
    if (item.kind === 'group') {
      return (
        <View onLayout={onLayout} style={groupLabelRowStyle} testID="Listbox.groupLabel">
          <RNText style={groupLabelStyle}>{item.label}</RNText>
        </View>
      );
    }
    const option = item.option;
    const selected = multiple ? selectedValues.includes(option.value) : option.value === selectedValue;
    const optionDisabled = isDisabled || option.disabled === true;
    const focused = focusedValue === option.value;
    const accessibleLabel = option.description !== undefined ? `${option.label}. ${option.description}` : option.label;

    return (
      <Pressable
        onLayout={onLayout}
        accessibilityRole="menuitem"
        accessibilityLabel={accessibleLabel}
        accessibilityState={{
          selected: multiple ? undefined : selected,
          checked: multiple ? selected : undefined,
          disabled: optionDisabled,
        }}
        onPress={() => selectOption(option)}
        onFocus={() => handleFocusOption(option.value)}
        onBlur={() => handleBlurOption(option.value)}
        style={optionRowStyle(focused, optionDisabled)}
        testID="Listbox.option"
      >
        <View accessibilityElementsHidden importantForAccessibility="no" style={checkSlotStyle(selected)}>
          <Icon name="check" size="sm" color={t.colorControlSelectedBackground} />
        </View>
        {option.icon !== undefined ? (
          <View accessibilityElementsHidden importantForAccessibility="no">
            <Icon name={option.icon} size="sm" color={t.colorForeground} />
          </View>
        ) : null}
        <View style={optionTextColumnStyle}>
          <RNText numberOfLines={1} style={optionLabelStyle(selected)}>
            {option.label}
          </RNText>
          {option.description !== undefined ? (
            <RNText numberOfLines={1} style={optionDescriptionStyle}>
              {option.description}
            </RNText>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View testID="Listbox" style={containerStyle}>
      {hasOptions ? (
        <FlatList
          ref={listRef}
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={renderItem}
          style={listStyle}
          accessibilityRole="list"
          accessibilityLabel={label}
          accessibilityState={{ disabled: isDisabled, busy: loading }}
          accessibilityValue={multiple && selectedValues.length > 0 ? { text: COPY.selectedCount(selectedValues.length) } : undefined}
          testID="Listbox.list"
        />
      ) : (
        <View
          accessible
          accessibilityRole="list"
          accessibilityLabel={`${label}. ${placeholderText}`}
          accessibilityState={{ busy: loading }}
          style={emptyRowStyle}
          testID="Listbox.emptyState"
        >
          <Text tone="muted" overrides={typographyOverrides}>
            {placeholderText}
          </Text>
        </View>
      )}
      {displayedError !== undefined ? (
        <View
          accessibilityLiveRegion={summarised ? 'none' : 'assertive'}
          style={{ paddingHorizontal: optionPaddingInline, paddingBottom: t.space1 }}
        >
          <Text size="sm" tone="danger">
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
