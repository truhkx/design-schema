import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  findNodeHandle,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import { Listbox } from './Listbox';
import type { ListboxGroup, ListboxItem, ListboxOption, ListboxValue } from './Listbox';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

/** Which picker surface to use. See `Select`'s doc for how each maps on this platform. */
export type SelectNative = 'auto' | 'always' | 'never';

/** The selection: a value, or with `multiple` an array of values. */
export type SelectValue = ListboxValue;

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type SelectOverridableBinding =
  | 'triggerBorderFocus'
  | 'triggerBorderInvalid'
  | 'triggerBorderWidth'
  | 'triggerRadius'
  | 'triggerPaddingInline'
  | 'triggerPaddingBlock'
  | 'triggerGap'
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
  | 'lineHeight'
  | 'disabledOpacity'
  | 'enter';

export interface SelectProps {
  /** Visible label. Always rendered. Also the trigger's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The options, passed through to the Listbox. */
  options: ListboxItem[];
  /** Controlled value (array with `multiple`). */
  value?: SelectValue;
  /** Initial value (array with `multiple`). */
  defaultValue?: SelectValue;
  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. */
  placeholder?: string;
  /** Pick any number. The trigger shows `copy.selectedCount` (or the labels when two or fewer); the popup stays open while toggling. */
  multiple?: boolean;
  /** Helper text under the label. Also the trigger's `accessibilityHint`. */
  description?: string;
  /** Must have a value to submit. Shown in the label, not only by color. */
  required?: boolean;
  /** Not openable and not submitted. Stays visible and focusable. */
  disabled?: boolean;
  /** Marks the field invalid. Usually set by the Form. */
  invalid?: boolean;
  /** Error message; implies invalid. */
  error?: string;
  /**
   * `auto` (default): a `BottomSheet` on phone-width screens, the positioned popup on
   * tablets and react-native-web. `always` and `never` both fall back to that same
   * choice — see the doc comment for why.
   */
  native?: SelectNative;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SelectOverridableBinding, TokenRef>>;
  /** Fired when the value changes (array with `multiple`). */
  onChange?: (value: SelectValue) => void;
  /** Fired when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

const COPY = {
  placeholder: 'Select…',
  selectedCount: (count: number): string => `${count} selected`,
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
  // Not in the schema's copy block; the BottomSheet footer for `multiple` needs a
  // label and none was given. See the generation gap notes.
  done: 'Done',
} as const;

function isGroup(item: ListboxItem): item is ListboxGroup {
  return 'group' in item;
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

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Select — the field for "one of these" (or "any of these") when the list is longer
 * than a RadioGroup should show and typing is not the natural way in.
 *
 * When to use: Use for a form field with about seven to fifty recognisable options —
 * country, role, status. Use `multiple` for tags or memberships. Use Combobox instead
 * when typing to filter is faster than scrolling, or free text is allowed. Do not use
 * it for two to six options (RadioGroup), for actions (Menu), or for on/off (Switch).
 *
 * Renders a `Pressable` trigger (`accessibilityRole="combobox"`, `accessibilityLabel`,
 * `accessibilityHint`, `accessibilityState={{ expanded, disabled }}`,
 * `accessibilityValue={{ text }}` with the selected label(s)) showing the value or
 * `copy.placeholder`, and an `Icon` chevron. Activating it opens a `Listbox` in a
 * popup: a `BottomSheet` on phone-width screens, or a `Modal` positioned below (and
 * flipped above on overflow) the trigger, at least as wide as it, on `layer.dropdown`,
 * elsewhere. Escape (the Android back gesture) and an outside tap close the popup
 * without changing the value and move accessibility focus back to the trigger
 * (`AccessibilityInfo.setAccessibilityFocus`, since `FocusScope`'s own `restoreFocus`
 * only recaptures a `TextInput`, not a `Pressable` — the same limit `Popover`
 * documents). Selecting an option commits and, for a single select, closes the popup;
 * with `multiple` the popup stays open and the `BottomSheet` path gets a footer "Done"
 * button (the plain popup closes on outside tap or Escape instead). Validation,
 * `required`, `disabled` and `error` work as `Input`'s: precedence is `error` prop →
 * `required` → `invalid`, and the field registers `{ getValue, validate, focus }`
 * with the enclosing `FormContext` by `name` directly (no hidden input, and the
 * composed `Listbox` is not itself registered, so the value is not double-counted).
 * `native` only has one real branch point on this platform, since there is no native
 * OS picker without a banned community dependency: `never` always uses the popup;
 * `auto` and `always` both use the phone/tablet split described above. See the
 * generation gap notes for the web-only "native `<select>`" meaning of `always` that
 * has no native equivalent here.
 */
export function Select({
  label,
  name,
  options,
  value,
  defaultValue,
  placeholder,
  multiple = false,
  description,
  required = false,
  disabled = false,
  invalid = false,
  error,
  native = 'auto',
  overrides,
  onChange,
  onOpenChange,
}: SelectProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const triggerRef = React.useRef<View>(null);
  const [internalValue, setInternalValue] = React.useState<SelectValue | undefined>(defaultValue);
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [popupMounted, setPopupMounted] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<Rect | null>(null);
  const [popupHeight, setPopupHeight] = React.useState<number | null>(null);
  const progress = React.useRef(new Animated.Value(0)).current;

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isDisabled = disabled || (form?.disabled ?? false);
  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  // No native OS picker is available without a community dependency the package
  // conventions ban, so `always` (web's "force a real <select>") has no distinct
  // native behaviour: it falls back to the same phone/tablet split as `auto`.
  const isPhoneWidth = windowWidth <= t.layoutMaxWidthProse;
  const usesSheet = native !== 'never' && isPhoneWidth;

  const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
  const labelFor = React.useCallback(
    (optionValue: string): string => flatOptions.find((option) => option.value === optionValue)?.label ?? optionValue,
    [flatOptions],
  );

  const selectedValues: string[] = multiple && Array.isArray(currentValue) ? currentValue : [];
  const selectedValue: string | undefined = !multiple && typeof currentValue === 'string' ? currentValue : undefined;

  const validateValue = React.useCallback(
    (candidate: SelectValue | undefined): string | null => {
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

  const focusTriggerA11y = React.useCallback((): void => {
    const node = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
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
        return typeof current === 'string' ? current : undefined;
      },
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: focusTriggerA11y,
    }),
    [multiple, focusTriggerA11y],
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

  const changeOpen = (next: boolean): void => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const closePopup = (): void => {
    if (!open) {
      return;
    }
    changeOpen(false);
    focusTriggerA11y();
  };

  const handleTriggerPress = (): void => {
    if (isDisabled) {
      return;
    }
    if (open) {
      closePopup();
      return;
    }
    changeOpen(true);
  };

  const commit = (next: SelectValue): void => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const handleListboxChange = (next: ListboxValue): void => {
    commit(next);
    if (!multiple) {
      closePopup();
    }
  };

  // Popup-Modal path only (the BottomSheet manages its own mount/animation).
  React.useEffect(() => {
    if (open) {
      setPopupMounted(true);
    }
  }, [open]);

  React.useEffect(() => {
    if (usesSheet || !popupMounted) {
      return undefined;
    }
    if (open) {
      const node = triggerRef.current;
      node?.measureInWindow((x, y, width, height) => setTriggerRect({ x, y, width, height }));
      if (reducedMotion) {
        progress.setValue(1);
        return undefined;
      }
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationFast,
        easing: toEasing(t.motionEasingStandard),
        // react-native-web has no native animated module.
        useNativeDriver: false,
      });
      animation.start();
      return () => animation.stop();
    }
    setTriggerRect(null);
    setPopupHeight(null);
    if (reducedMotion) {
      progress.setValue(0);
      setPopupMounted(false);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationFast,
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

  const handlePopupLayout = (event: LayoutChangeEvent): void => {
    setPopupHeight(event.nativeEvent.layout.height);
  };

  const triggerBorderFocusColor = overrides?.triggerBorderFocus
    ? (resolveToken(t, overrides.triggerBorderFocus) as string)
    : t.colorBorderFocus;
  const triggerBorderInvalidColor = overrides?.triggerBorderInvalid
    ? (resolveToken(t, overrides.triggerBorderInvalid) as string)
    : t.colorBorderDanger;
  const triggerBorderWidth = overrides?.triggerBorderWidth
    ? (resolveToken(t, overrides.triggerBorderWidth) as number)
    : t.borderWidthThin;
  const triggerRadius = overrides?.triggerRadius ? (resolveToken(t, overrides.triggerRadius) as number) : t.radiusMd;
  const triggerPaddingInline = overrides?.triggerPaddingInline
    ? (resolveToken(t, overrides.triggerPaddingInline) as number)
    : t.spaceMd;
  const triggerPaddingBlock = overrides?.triggerPaddingBlock
    ? (resolveToken(t, overrides.triggerPaddingBlock) as number)
    : t.spaceSm;
  const triggerGap = overrides?.triggerGap ? (resolveToken(t, overrides.triggerGap) as number) : t.layoutGapNormal;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const labelWeight = overrides?.labelWeight ? (resolveToken(t, overrides.labelWeight) as number) : t.fontWeightMedium;
  const popupSurface = overrides?.popupSurface ? (resolveToken(t, overrides.popupSurface) as string) : t.colorOverlaySurface;
  const popupBorder = overrides?.popupBorder ? (resolveToken(t, overrides.popupBorder) as string) : t.colorBorder;
  const popupShadow = overrides?.popupShadow ? (resolveToken(t, overrides.popupShadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const popupRadius = overrides?.popupRadius ? (resolveToken(t, overrides.popupRadius) as number) : t.radiusMd;
  const popupOffset = overrides?.popupOffset ? (resolveToken(t, overrides.popupOffset) as number) : t.space1;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDropdown;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;

  let valueText: string;
  if (multiple) {
    valueText =
      selectedValues.length === 0
        ? (placeholder ?? COPY.placeholder)
        : selectedValues.length <= 2
          ? selectedValues.map(labelFor).join(', ')
          : COPY.selectedCount(selectedValues.length);
  } else {
    valueText = selectedValue !== undefined ? labelFor(selectedValue) : (placeholder ?? COPY.placeholder);
  }
  const hasSelection = multiple ? selectedValues.length > 0 : selectedValue !== undefined;

  const insetShrink = t.borderWidthFocus - triggerBorderWidth;
  const activeTriggerBorderWidth = focused ? t.borderWidthFocus : triggerBorderWidth;
  const triggerBorderColor = focused ? triggerBorderFocusColor : isInvalid ? triggerBorderInvalidColor : t.colorBorderStrong;

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const triggerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: triggerGap,
    minHeight: t.sizeTargetComfortable,
    backgroundColor: t.colorBackground,
    borderWidth: activeTriggerBorderWidth,
    borderColor: triggerBorderColor,
    borderRadius: triggerRadius,
    paddingHorizontal: triggerPaddingInline + insetShrink,
    paddingVertical: triggerPaddingBlock + insetShrink,
  };

  const valueTextStyle = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };
  const labelOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.fontSize,
    fontWeight: overrides?.labelWeight,
    lineHeight: overrides?.lineHeight,
  };
  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };
  const listboxOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.fontSize,
    lineHeight: overrides?.lineHeight,
    disabledOpacity: overrides?.disabledOpacity,
  };

  const listbox = (
    <Listbox
      label={label}
      options={options}
      multiple={multiple}
      value={currentValue}
      disabled={isDisabled}
      onChange={handleListboxChange}
      overrides={listboxOverrides}
    />
  );

  const spaceBelow = triggerRect !== null ? windowHeight - (triggerRect.y + triggerRect.height) : 0;
  const spaceAbove = triggerRect !== null ? triggerRect.y : 0;
  const measuredPopupHeight = popupHeight ?? 0;
  const flipAbove = triggerRect !== null && spaceBelow < measuredPopupHeight + popupOffset && spaceAbove > spaceBelow;
  const popupTop =
    triggerRect === null ? 0 : flipAbove ? triggerRect.y - popupOffset - measuredPopupHeight : triggerRect.y + triggerRect.height + popupOffset;
  const popupLeft = triggerRect?.x ?? 0;
  const popupWidth = triggerRect?.width;

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

  return (
    <View testID="Select" style={containerStyle}>
      <Text weight="medium" overrides={labelOverrides}>
        {visibleLabel}
      </Text>
      {description !== undefined ? (
        <Text size="sm" tone="muted" overrides={helperOverrides}>
          {description}
        </Text>
      ) : null}
      <Pressable
        ref={triggerRef}
        accessibilityRole="combobox"
        accessibilityLabel={visibleLabel}
        accessibilityHint={description}
        accessibilityState={{ expanded: open, disabled: isDisabled }}
        accessibilityValue={hasSelection ? { text: valueText } : undefined}
        onPress={handleTriggerPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={triggerStyle}
        testID="Select.trigger"
      >
        <Text tone={hasSelection ? 'default' : 'muted'} overrides={valueTextStyle}>
          {valueText}
        </Text>
        <Icon name="chevron-down" size="sm" color={t.colorForegroundMuted} />
      </Pressable>
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
      {usesSheet ? (
        <BottomSheet
          open={open}
          heading={label}
          onClose={closePopup}
          footer={multiple ? <Button label={COPY.done} onPress={closePopup} /> : undefined}
        >
          {listbox}
        </BottomSheet>
      ) : (
        <Modal visible={popupMounted} transparent animationType="none" onRequestClose={closePopup} statusBarTranslucent>
          <View style={hostStyle}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={closePopup} accessible={false} testID="Select.scrim" />
            {triggerRect !== null ? (
              <FocusScope trapped active={popupMounted} autoFocus="first" restoreFocus={false}>
                <Animated.View
                  style={popupOuterStyle}
                  onLayout={handlePopupLayout}
                  accessibilityViewIsModal
                  accessibilityLabel={label}
                  testID="Select.popup"
                >
                  <View style={popupInnerStyle}>{listbox}</View>
                </Animated.View>
              </FocusScope>
            ) : null}
          </View>
        </Modal>
      )}
    </View>
  );
}
