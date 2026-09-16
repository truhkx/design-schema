import * as React from 'react';
import { AccessibilityInfo, FlatList, Platform, Pressable, Text as RNText, View, findNodeHandle } from 'react-native';
import type { LayoutChangeEvent, ListRenderItemInfo, TextStyle, ViewInstance, ViewStyle } from 'react-native';
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

/** A labelled cluster of options, rendered with a non-interactive group label row. */
export type ListboxGroup = { group: string; options: ListboxOption[] };

/** One entry of `options`: an option or a group of options. */
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
  /** Allow any number of selections. The value becomes an array; each option shows a check indicator; selection toggles. */
  multiple?: boolean | undefined;
  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  value?: ListboxValue | undefined;
  /** Initial selection (or array) for an uncontrolled list. */
  defaultValue?: ListboxValue | undefined;
  /**
   * Single-select only: on the web keyboard model, arrow keys select as they move.
   * Native has no arrow-key browsing, so this is accepted for parity with no runtime effect.
   */
  selectionFollowsFocus?: boolean | undefined;
  /** At least one option must be selected to submit when inside a Form. */
  required?: boolean | undefined;
  /** Marks the list invalid and shows `copy.invalid` below it. */
  invalid?: boolean | undefined;
  /** Error message rendered below the list; implies invalid. */
  error?: string | undefined;
  /**
   * The list lives inside a popup (Select, Combobox) that owns the border, surface and
   * radius; the list draws none of its own, and overrides of those bindings are no-ops.
   */
  embedded?: boolean | undefined;
  /**
   * The option pre-highlighted as active. It wins when it names an enabled option;
   * otherwise the first selected, else the first enabled. Visual only on native: there
   * is no single tab stop to move.
   */
  initialActiveValue?: string | undefined;
  /** Options are being fetched; shows `copy.loading` in place of the empty message and marks the list busy. */
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
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: ((value: ListboxValue) => void) | undefined;
  /** Fired as the active (focused or hovered) option changes; null when no option is active. */
  onActiveChange?: ((value: string | null) => void) | undefined;
}

const COPY = {
  empty: 'No options',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  selectedCount: '{count} selected',
  loading: 'Loading…',
} as const;

function withLabel(template: string, label: string): string {
  return template.replace('{label}', label);
}

type ListboxRow =
  | { kind: 'group'; key: string; label: string }
  | { kind: 'option'; key: string; option: ListboxOption; firstOption: boolean };

function isGroup(item: ListboxItem): item is ListboxGroup {
  return 'group' in item;
}

/** Rows in display order; empty groups are omitted. */
function flattenRows(items: ListboxItem[]): ListboxRow[] {
  const rows: ListboxRow[] = [];
  let sawOption = false;
  const pushOption = (key: string, option: ListboxOption): void => {
    rows.push({ kind: 'option', key, option, firstOption: !sawOption });
    sawOption = true;
  };
  items.forEach((item, itemIndex) => {
    if (isGroup(item)) {
      if (item.options.length === 0) {
        return;
      }
      rows.push({ kind: 'group', key: `group-${itemIndex}`, label: item.group });
      item.options.forEach((option, optionIndex) => pushOption(`${itemIndex}-${optionIndex}-${option.value}`, option));
    } else {
      pushOption(`${itemIndex}-${item.value}`, item);
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
 * Listbox — the engine behind a picker: the list a Select's popup or a Combobox's
 * suggestions renders, so all of them behave identically, including for multi-select.
 *
 * Renders a `FlatList` (virtualised) of `Pressable` rows with
 * `accessibilityRole="menuitem"` (native has no listbox/option roles) and
 * `accessibilityState={{ selected, disabled }}`, `checked` instead with `multiple`.
 * Find the list by its accessible label, never by role. Groups are plain label rows,
 * not the header trait. `maxVisible` becomes `maxHeight` = rows × the height measured
 * from the first option row; `all` never scrolls. Each row is its own accessibility
 * stop and a tap is the selection: arrows, Home/End, Page keys, typeahead, Shift+Arrow
 * and Ctrl+A have no native form, and `selectionFollowsFocus` has no runtime effect.
 * The active row (focused, hovered, or pre-highlighted by `initialActiveValue`) gets
 * `color.background.subtle`; focus draws a `color.border.focus` ring. Selection shows
 * by weight, and with `multiple` by the check (an invisible slot when unselected, so
 * labels align). Inside a Form the list registers by `name`; the message below it
 * follows `error` → Form error (`copy.required`) → `invalid` (`copy.invalid`).
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
  initialActiveValue,
  loading = false,
  disabled = false,
  name,
  emptyMessage,
  maxVisible = '8',
  overrides,
  ref,
  onChange,
  onActiveChange,
}: ListboxProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const listRef = React.useRef<FlatList<ListboxRow>>(null);
  const [internalValue, setInternalValue] = React.useState<ListboxValue | undefined>(defaultValue);
  const [activeValue, setActiveValue] = React.useState<string | null>(() => {
    const enabled = flattenOptions(options).filter((option) => option.disabled !== true);
    if (initialActiveValue !== undefined && enabled.some((option) => option.value === initialActiveValue)) {
      return initialActiveValue;
    }
    const initial = value ?? defaultValue;
    const selected = Array.isArray(initial) ? initial : initial !== undefined ? [initial] : [];
    const firstSelected = enabled.find((option) => selected.includes(option.value));
    return firstSelected?.value ?? enabled[0]?.value ?? null;
  });
  const [focusedValue, setFocusedValue] = React.useState<string | null>(null);
  const [rowHeight, setRowHeight] = React.useState<number | null>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isDisabled = disabled || (form?.disabled ?? false);

  const orderedValues = React.useMemo(() => flattenOptions(options).map((option) => option.value), [options]);
  const rows = React.useMemo(() => flattenRows(options), [options]);
  const hasOptions = rows.some((row) => row.kind === 'option');

  const selectedValues: string[] = multiple && Array.isArray(currentValue) ? currentValue : [];
  const selectedValue: string | undefined = !multiple && typeof currentValue === 'string' ? currentValue : undefined;

  const formError = name !== undefined ? form?.errors[name] : undefined;
  const displayedError =
    error !== undefined && error !== '' ? error : (formError ?? (invalid ? withLabel(COPY.invalid, label) : undefined));
  const summarised = form !== null && form.errorSummary;

  React.useEffect(() => {
    if (__DEV__ && multiple && !selectionFollowsFocus) {
      console.warn('Listbox: `selectionFollowsFocus` only applies to single-select lists.');
    }
  }, [multiple, selectionFollowsFocus]);

  const validateValue = React.useCallback(
    (candidate: ListboxValue | undefined): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required) {
        const empty = Array.isArray(candidate) ? candidate.length === 0 : candidate === undefined || candidate === '';
        if (empty) {
          return withLabel(COPY.required, label);
        }
      }
      if (invalid) {
        return withLabel(COPY.invalid, label);
      }
      return null;
    },
    [required, label, error, invalid],
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

  const activate = (next: string | null): void => {
    if (next === activeValue) {
      return;
    }
    setActiveValue(next);
    onActiveChange?.(next);
  };
  const handleFocusOption = (optionValue: string): void => {
    setFocusedValue(optionValue);
    activate(optionValue);
  };
  const handleBlurOption = (optionValue: string): void => {
    setFocusedValue((prev) => (prev === optionValue ? null : prev));
    if (activeValue === optionValue) {
      activate(null);
    }
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

  const handleFirstOptionLayout = (event: LayoutChangeEvent): void => {
    const height = event.nativeEvent.layout.height;
    if (height !== rowHeight) {
      setRowHeight(height);
    }
  };

  const containerStyle: ViewStyle = {
    // `embedded`: the popup owns border, surface and radius, so their overrides are no-ops.
    ...(embedded ? null : { borderWidth, borderColor: border, borderRadius: radius, backgroundColor: t.colorBackground }),
    opacity: isDisabled ? disabledOpacity : 1,
    overflow: 'hidden',
  };

  const listStyle: ViewStyle = { padding: listPadding, ...(maxHeight !== undefined ? { maxHeight } : null) };

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

  // The focus ring's width is always reserved (transparent when unfocused) so focusing a row never shifts layout.
  const optionRowStyle = (active: boolean, focused: boolean, optionDisabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: optionGap,
    minHeight: t.sizeTargetMin,
    paddingVertical: optionPaddingBlock,
    paddingHorizontal: optionPaddingInline,
    borderRadius: optionRadius,
    backgroundColor: active && !isDisabled ? t.colorBackgroundSubtle : 'transparent',
    borderWidth: t.borderWidthFocus,
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

  const optionTextColumnStyle: ViewStyle = { flexShrink: 1, flexDirection: 'column' };
  const emptyRowStyle: ViewStyle = { paddingVertical: optionPaddingBlock, paddingHorizontal: optionPaddingInline };
  const errorRowStyle: ViewStyle = { paddingHorizontal: optionPaddingInline, paddingBottom: listPadding };
  const typographyOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };

  const renderItem = ({ item }: ListRenderItemInfo<ListboxRow>): React.JSX.Element => {
    if (item.kind === 'group') {
      return (
        <View style={groupLabelRowStyle} testID="Listbox.groupLabel">
          <RNText style={groupLabelStyle}>{item.label}</RNText>
        </View>
      );
    }
    const option = item.option;
    const selected = multiple ? selectedValues.includes(option.value) : option.value === selectedValue;
    const optionDisabled = isDisabled || option.disabled === true;
    const accessibleLabel = option.description !== undefined ? `${option.label}. ${option.description}` : option.label;

    return (
      <Pressable
        onLayout={item.firstOption ? handleFirstOptionLayout : undefined}
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
        onHoverIn={() => {
          if (!optionDisabled) {
            activate(option.value);
          }
        }}
        style={optionRowStyle(activeValue === option.value, focusedValue === option.value, optionDisabled)}
        testID="Listbox.option"
      >
        {multiple ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{ opacity: selected ? 1 : 0 }}
            testID="Listbox.optionCheck"
          >
            <Icon name="check" size="sm" color={t.colorControlSelectedBackground} />
          </View>
        ) : null}
        {option.icon !== undefined ? (
          <View accessibilityElementsHidden importantForAccessibility="no" testID="Listbox.optionIcon">
            <Icon name={option.icon} size="sm" color={t.colorForeground} />
          </View>
        ) : null}
        <View style={optionTextColumnStyle}>
          <RNText numberOfLines={1} style={optionLabelStyle(selected)} testID="Listbox.optionLabel">
            {option.label}
          </RNText>
          {option.description !== undefined ? (
            <RNText numberOfLines={1} style={optionDescriptionStyle} testID="Listbox.optionDescription">
              {option.description}
            </RNText>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View ref={ref} testID="Listbox" style={containerStyle}>
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
          accessibilityValue={
            multiple && selectedValues.length > 0
              ? { text: COPY.selectedCount.replace('{count}', String(selectedValues.length)) }
              : undefined
          }
          testID="Listbox.list"
        />
      ) : (
        <View
          accessible
          accessibilityRole="list"
          // `accessible` collapses the children, so the placeholder is folded into the label to stay announced.
          accessibilityLabel={`${label}. ${placeholderText}`}
          accessibilityState={{ disabled: isDisabled, busy: loading }}
          style={emptyRowStyle}
          testID="Listbox.list"
        >
          <View testID="Listbox.emptyState">
            <Text tone="muted" overrides={typographyOverrides}>
              {placeholderText}
            </Text>
          </View>
        </View>
      )}
      {displayedError !== undefined ? (
        <View
          accessibilityLiveRegion={summarised ? 'none' : 'assertive'}
          style={errorRowStyle}
          testID="Listbox.errorMessage"
        >
          <Text size="sm" tone="danger">
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
