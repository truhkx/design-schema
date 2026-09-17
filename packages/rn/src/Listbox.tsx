import * as React from 'react';
import { AccessibilityInfo, FlatList, Platform, Pressable, Text as RNText, View, findNodeHandle } from 'react-native';
import type { ListRenderItemInfo, TextStyle, ViewInstance, ViewStyle } from 'react-native';
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

/** A labelled cluster of options, rendered with a non-interactive group label row. Groups do not nest. */
export type ListboxGroup = { group: string; options: ListboxOption[] };

/** One entry of `options`: an option or a group of options. */
export type ListboxItem = ListboxOption | ListboxGroup;

/** The selection: a value, or with `multiple` an array of values. */
export type ListboxValue = string | string[];

/** Height in rows before the list scrolls; `all` never scrolls. */
export type ListboxMaxVisible = 5 | 8 | 12 | '5' | '8' | '12' | 'all';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ListboxOverridableBinding =
  | 'border'
  | 'borderInvalid'
  | 'partGap'
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
  | 'disabledOpacity'
  | 'typeaheadReset';

export interface ListboxProps {
  /** Accessible name of the list; also the `{label}` in `copy.required` and `copy.invalid`. */
  label: string;
  /** Flat or grouped options; groups do not nest. */
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
  /** Marks the list invalid (`borderInvalid` when not `embedded`) with `copy.invalid`. */
  invalid?: boolean | undefined;
  /** Error message rendered below the list; implies invalid. */
  error?: string | undefined;
  /**
   * The list lives inside a popup (Select, Combobox) that owns the border, surface and
   * radius; the list draws none of its own, and overrides of those bindings are no-ops.
   * It keeps its own `listPadding`.
   */
  embedded?: boolean | undefined;
  /**
   * The option pre-highlighted as active. It wins when it names an enabled option;
   * otherwise the first selected, else the first enabled. Visual only on native: there
   * is no single tab stop to move, and the pre-highlight never fires `onActiveChange`.
   */
  initialActiveValue?: string | undefined;
  /** Options are being fetched; shows `copy.loading` in place of the empty message and marks the list busy. */
  loading?: boolean | undefined;
  /** The whole list is inert but readable: rows stay focusable, taps do nothing, and the list dims once. */
  disabled?: boolean | undefined;
  /** Field name for Form collection: a string in single-select, an array with `multiple`; nothing selected submits no key. */
  name?: string | undefined;
  /** Shown when `options` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls, computed from tokens; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the selection changes, with the new value (array in option order when `multiple`). */
  onChange?: ((value: ListboxValue) => void) | undefined;
  /** Fired as the active (focused or hovered) row changes; null when the active row loses focus. Never on mount. */
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

type ListboxRow = { kind: 'group'; key: string; label: string } | { kind: 'option'; key: string; option: ListboxOption };

function isGroup(item: ListboxItem): item is ListboxGroup {
  return 'group' in item;
}

/** Rows in display order; groups flatten into a label row followed by their options, and empty groups are omitted. */
function flattenRows(items: ListboxItem[]): ListboxRow[] {
  const rows: ListboxRow[] = [];
  items.forEach((item, itemIndex) => {
    if (isGroup(item)) {
      if (item.options.length === 0) {
        return;
      }
      rows.push({ kind: 'group', key: `group-${itemIndex}`, label: item.group });
      item.options.forEach((option, optionIndex) =>
        rows.push({ kind: 'option', key: `${itemIndex}-${optionIndex}-${option.value}`, option }),
      );
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

function toSelectedArray(selection: ListboxValue | undefined): string[] {
  if (Array.isArray(selection)) {
    return selection;
  }
  return selection !== undefined && selection !== '' ? [selection] : [];
}

/** `initialActiveValue` when it names an enabled option, else the first selected, else the first enabled. */
function resolveInitialActive(
  items: ListboxItem[],
  initialActiveValue: string | undefined,
  selection: ListboxValue | undefined,
): string | null {
  const enabled = flattenOptions(items).filter((option) => option.disabled !== true);
  if (initialActiveValue !== undefined && enabled.some((option) => option.value === initialActiveValue)) {
    return initialActiveValue;
  }
  const selected = toSelectedArray(selection);
  const firstSelected = enabled.find((option) => selected.includes(option.value));
  return firstSelected?.value ?? enabled[0]?.value ?? null;
}

/**
 * Listbox — the engine behind a picker: the list a Select's popup or a Combobox's
 * suggestions renders, so all of them behave identically, including for multi-select.
 *
 * Renders a `FlatList` (virtualised) of `Pressable` rows with
 * `accessibilityRole="menuitem"` (native has no listbox/option roles) and
 * `accessibilityState={{ selected, checked, disabled }}` (`checked` only with `multiple`).
 * Find the list by its accessible label, never by role. Groups are plain label rows, not
 * the header trait. `maxVisible` becomes `maxHeight` from the token formula: rows ×
 * (max(minTarget, fontSize × lineHeight + 2 × optionPaddingBlock) + 2 × focusRingWidth),
 * plus 2 × listPadding, plus 2 × borderWidth when not `embedded`; never measured. Each row
 * is its own accessibility stop and a tap is the selection: arrows, Home/End, Page keys,
 * typeahead, Shift+Arrow and Ctrl+A have no native form, and `selectionFollowsFocus` has
 * no runtime effect. The active row (focused, hovered, or pre-highlighted) gets
 * `color.background.subtle`; focus draws a `color.border.focus` border that is always
 * reserved. Selection shows by weight, and with `multiple` by the check (an invisible slot
 * when unselected, so labels align). Inside a Form the list registers by `name`; the
 * message below it follows `error` → Form error → `copy.required` / `copy.invalid`.
 */
export function Listbox({
  label,
  options,
  multiple = false,
  value,
  defaultValue,
  selectionFollowsFocus: _selectionFollowsFocus = true,
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
  const [activeValue, setActiveValue] = React.useState<string | null>(() =>
    resolveInitialActive(options, initialActiveValue, value ?? defaultValue),
  );
  const [focusedValue, setFocusedValue] = React.useState<string | null>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isDisabled = disabled || (form?.disabled ?? false);

  const orderedValues = React.useMemo(() => flattenOptions(options).map((option) => option.value), [options]);
  const rows = React.useMemo(() => flattenRows(options), [options]);

  const selectedValues: string[] = multiple ? toSelectedArray(currentValue) : [];
  const selectedValue: string | undefined = !multiple && typeof currentValue === 'string' ? currentValue : undefined;
  const nothingSelected = multiple ? selectedValues.length === 0 : selectedValue === undefined || selectedValue === '';

  // A later `initialActiveValue` (Combobox type-ahead) moves the pre-highlight; like the first one it fires nothing.
  const lastInitialActive = React.useRef(initialActiveValue);
  React.useEffect(() => {
    if (lastInitialActive.current === initialActiveValue) {
      return;
    }
    lastInitialActive.current = initialActiveValue;
    if (focusedValue === null) {
      setActiveValue(resolveInitialActive(options, initialActiveValue, currentValue));
    }
  }, [initialActiveValue, options, currentValue, focusedValue]);

  const hasError = error !== undefined && error !== '';
  const formError = name !== undefined ? form?.errors[name] : undefined;
  const isInvalid = invalid || hasError || formError !== undefined;
  const displayedError = hasError
    ? error
    : (formError ??
      (invalid ? withLabel(required && nothingSelected ? COPY.required : COPY.invalid, label) : undefined));
  const summarised = form !== null && form.errorSummary;

  const validateValue = React.useCallback(
    (candidate: ListboxValue | undefined): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && toSelectedArray(candidate).length === 0) {
        return withLabel(COPY.required, label);
      }
      if (invalid) {
        return withLabel(COPY.invalid, label);
      }
      return null;
    },
    [required, label, error, invalid],
  );

  const latest = React.useRef({ currentValue, validateValue, label });
  latest.current = { currentValue, validateValue, label };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      get label() {
        return latest.current.label;
      },
      getValue: () => {
        const current = latest.current.currentValue;
        if (multiple) {
          const selected = toSelectedArray(current);
          return selected.length > 0 ? selected : undefined;
        }
        return typeof current === 'string' && current !== '' ? current : undefined;
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
    if (!isDisabled) {
      activate(optionValue);
    }
  };
  const handleBlurOption = (optionValue: string): void => {
    setFocusedValue((prev) => (prev === optionValue ? null : prev));
    if (!isDisabled && activeValue === optionValue) {
      activate(null);
    }
  };

  const border = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorderStrong;
  const borderInvalid = overrides?.borderInvalid ? (resolveToken(t, overrides.borderInvalid) as string) : t.colorBorderDanger;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
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
  // `typeaheadReset` is accepted for parity: native has no typeahead, so nothing reads it.

  // Rows are max(minTarget, fontSize × lineHeight + 2 × optionPaddingBlock) tall, plus the reserved focus border.
  const rowHeight =
    Math.max(t.sizeTargetMin, toLineHeight(fontSize, lineHeightMultiplier) + 2 * optionPaddingBlock) + 2 * t.borderWidthFocus;
  const rowCount = maxVisible === 'all' ? null : Number(maxVisible);
  const maxHeight =
    rowCount === null ? undefined : rowCount * rowHeight + 2 * listPadding + (embedded ? 0 : 2 * borderWidth);

  const placeholderText = loading ? COPY.loading : (emptyMessage ?? COPY.empty);

  const rootStyle: ViewStyle = { flexDirection: 'column', gap: partGap };

  const listStyle: ViewStyle = {
    flexGrow: 0,
    // `embedded`: the popup owns border, surface and radius, so their overrides are no-ops.
    ...(embedded
      ? null
      : {
          borderWidth,
          borderColor: isInvalid ? borderInvalid : border,
          borderRadius: radius,
          backgroundColor: t.colorBackground,
          overflow: 'hidden' as const,
        }),
    ...(maxHeight !== undefined ? { maxHeight } : null),
    opacity: isDisabled ? disabledOpacity : 1,
  };
  const listContentStyle: ViewStyle = { padding: listPadding };

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

  // The focus border is always reserved (transparent when unfocused) so focusing a row never shifts layout.
  const optionRowStyle = (active: boolean, focused: boolean, optionDisabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: optionGap,
    minHeight: t.sizeTargetMin + 2 * t.borderWidthFocus,
    paddingVertical: optionPaddingBlock,
    paddingHorizontal: optionPaddingInline,
    borderRadius: optionRadius,
    backgroundColor: active && !isDisabled ? t.colorBackgroundSubtle : 'transparent',
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? t.colorBorderFocus : 'transparent',
    // The list dims once when disabled; individually disabled options are not dimmed again on top of it.
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
  const typographyOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };

  const renderItem = ({ item }: ListRenderItemInfo<ListboxRow>): React.JSX.Element => {
    if (item.kind === 'group') {
      return (
        <View style={groupLabelRowStyle}>
          <RNText style={groupLabelStyle} testID="Listbox.groupLabel">
            {item.label}
          </RNText>
        </View>
      );
    }
    const option = item.option;
    const selected = multiple ? selectedValues.includes(option.value) : option.value === selectedValue;
    const optionDisabled = isDisabled || option.disabled === true;
    const accessibleLabel = option.description !== undefined ? `${option.label}. ${option.description}` : option.label;

    return (
      <Pressable
        accessibilityRole="menuitem"
        accessibilityLabel={accessibleLabel}
        accessibilityState={{
          selected,
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
    <View ref={ref} testID="Listbox" style={rootStyle}>
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={renderItem}
        style={listStyle}
        contentContainerStyle={listContentStyle}
        // The list keeps its label but is not `accessible`, so rows (and the empty/loading Text) stay their own stops.
        accessibilityRole="list"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        accessibilityValue={
          multiple ? { text: COPY.selectedCount.replace('{count}', String(selectedValues.length)) } : undefined
        }
        ListEmptyComponent={
          <View style={emptyRowStyle} testID="Listbox.emptyState">
            <Text tone="muted" overrides={typographyOverrides}>
              {placeholderText}
            </Text>
          </View>
        }
        testID="Listbox.list"
      />
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'} testID="Listbox.errorMessage">
          <Text size="sm" tone="danger">
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
