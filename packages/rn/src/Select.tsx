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
import type { LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
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

/** `sm` for pickers inside toolbars and calendar headers. */
export type SelectSize = 'sm' | 'md';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type SelectOverridableBinding =
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
  | 'fontWeight'
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
  value?: SelectValue | undefined;
  /** Initial value (array with `multiple`). */
  defaultValue?: SelectValue | undefined;
  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for the label. */
  placeholder?: string | undefined;
  /** Visually hide the label (it remains the accessible name), for compact pickers such as DatePicker's month and year. */
  hideLabel?: boolean | undefined;
  /** `sm` for pickers inside toolbars and calendar headers. */
  size?: SelectSize | undefined;
  /** Controlled popup state, for programmatic opening and for stories and tests. Omit for the trigger-driven default. */
  open?: boolean | undefined;
  /** Pick any number. The trigger shows `copy.selectedCount` (or the labels when two or fewer); the popup stays open while toggling. */
  multiple?: boolean | undefined;
  /** Helper text under the label. Also the trigger's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Not openable and not submitted. Stays visible and focusable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. Usually set by the Form. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /**
   * `auto` (default) and `always`: a `BottomSheet` on phone-width screens, the positioned
   * popup on tablets and react-native-web. `never`: the popup everywhere. There is no OS
   * picker to force without a dependency the package does not take.
   */
  native?: SelectNative | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the value changes (array with `multiple`). */
  onChange?: ((value: SelectValue) => void) | undefined;
  /** Fired when the popup opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

const COPY = {
  placeholder: 'Select…',
  selectedCount: '{count} selected',
  done: 'Done',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
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
 * When to use: a form field with about seven to fifty recognisable options — country,
 * role, status. Use `multiple` for tags or memberships. Use Combobox instead when typing
 * to filter is faster than scrolling, or free text is allowed. Do not use it for two to
 * six options (RadioGroup), for actions (Menu), for modes (SegmentedControl), or for
 * on/off (Switch).
 *
 * Renders a `Pressable` trigger (`accessibilityRole="combobox"`, `accessibilityLabel`,
 * `accessibilityHint`, `accessibilityState={{ expanded, disabled }}`,
 * `accessibilityValue={{ text }}` with the selected label(s)) showing the value or the
 * placeholder, and a `chevron-down` `Icon`. Activating it opens an `embedded` `Listbox`
 * (given no `name`, `selectionFollowsFocus: false` for single, and the first selection
 * as `initialActiveValue`): a `BottomSheet` on phone-width screens (`layout.maxWidth.prose`)
 * with a `copy.done` footer button for `multiple`, or else a transparent `Modal` whose
 * popup sits below the trigger (flipped above on overflow), at least as wide as it, on
 * `layer.dropdown`, fading in over `enter`. Escape (the Android back gesture) and an
 * outside tap close without changing the value; focus returns to the trigger by hand
 * (`AccessibilityInfo.setAccessibilityFocus`), since `FocusScope`'s restore only
 * recaptures a `TextInput`. Selecting an option commits and, for a single select,
 * closes. Pressable sees no keys, so Enter-as-press is the only other keyboard rule.
 * Validation works as `Input`'s: `error` prop → `required` → `invalid`, registered with
 * the enclosing `FormContext` by `name`.
 */
export function Select({
  label,
  name,
  options,
  value,
  defaultValue,
  placeholder,
  hideLabel = false,
  size = 'md',
  open: openProp,
  multiple = false,
  description,
  required = false,
  disabled = false,
  invalid = false,
  error,
  native = 'auto',
  overrides,
  ref,
  onChange,
  onOpenChange,
}: SelectProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const triggerRef = React.useRef<ViewInstance>(null);
  const [internalValue, setInternalValue] = React.useState<SelectValue | undefined>(defaultValue);
  const [focused, setFocused] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [popupMounted, setPopupMounted] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<Rect | null>(null);
  const [popupHeight, setPopupHeight] = React.useState<number | null>(null);
  const progress = React.useRef(new Animated.Value(0)).current;

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? openProp : internalOpen;
  const isDisabled = disabled || (form?.disabled ?? false);
  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  // `always` has no OS picker to force here, so only `never` leaves the phone/tablet split.
  const isPhoneWidth = windowWidth <= t.layoutMaxWidthProse;
  const usesSheet = native !== 'never' && isPhoneWidth;

  const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
  const labelFor = React.useCallback(
    (optionValue: string): string => flatOptions.find((option) => option.value === optionValue)?.label ?? optionValue,
    [flatOptions],
  );

  const selectedValues: string[] = multiple
    ? Array.isArray(currentValue)
      ? currentValue
      : []
    : typeof currentValue === 'string'
      ? [currentValue]
      : [];
  const hasSelection = selectedValues.length > 0;

  const validateValue = React.useCallback(
    (candidate: SelectValue | undefined): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required) {
        const empty = Array.isArray(candidate) ? candidate.length === 0 : candidate === undefined || candidate === '';
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

  const focusTrigger = React.useCallback((): void => {
    const node = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
    if (node != null) {
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
      focus: focusTrigger,
    }),
    [multiple, focusTrigger],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    // Disabled: not submitted.
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
    if (!isOpenControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const closePopup = (): void => {
    if (!open) {
      return;
    }
    changeOpen(false);
    focusTrigger();
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

  const handleListboxChange = (next: ListboxValue): void => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
    if (!multiple) {
      closePopup();
    }
  };

  const token = <T,>(ref: TokenRef | undefined, fallback: T): T => (ref ? (resolveToken(t, ref) as T) : fallback);

  const enterDuration = token(overrides?.enter, t.motionDurationFast);

  // Popup-Modal path only (the BottomSheet manages its own mount and animation).
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
      triggerRef.current?.measureInWindow((x, y, width, height) => setTriggerRect({ x, y, width, height }));
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
    setTriggerRect(null);
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

  const handlePopupLayout = (event: LayoutChangeEvent): void => {
    setPopupHeight(event.nativeEvent.layout.height);
  };

  const triggerBorderInvalid = token<string>(overrides?.triggerBorderInvalid, t.colorBorderDanger);
  const triggerBorderWidth = token<number>(overrides?.triggerBorderWidth, t.borderWidthThin);
  const triggerRadius = token<number>(overrides?.triggerRadius, t.radiusMd);
  const triggerPaddingInline = token<number>(overrides?.triggerPaddingInline, t.spaceMd);
  const triggerPaddingBlock = token<number>(overrides?.triggerPaddingBlock, size === 'sm' ? t.space1 : t.spaceSm);
  const triggerGap = token<number>(overrides?.triggerGap, t.layoutGapNormal);
  const partGap = token<number>(overrides?.partGap, t.space1);
  const popupSurface = token<string>(overrides?.popupSurface, t.colorOverlaySurface);
  const popupBorder = token<string>(overrides?.popupBorder, t.colorBorder);
  const popupShadow = token<typeof t.shadowOverlay>(overrides?.popupShadow, t.shadowOverlay);
  const popupRadius = token<number>(overrides?.popupRadius, t.radiusMd);
  const popupOffset = token<number>(overrides?.popupOffset, t.space1);
  const layer = token<number>(overrides?.layer, t.layerDropdown);
  const disabledOpacity = token<number>(overrides?.disabledOpacity, t.opacityDisabled);
  const minTarget = size === 'sm' ? t.sizeTargetMin : t.sizeTargetComfortable;

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;

  const valueText = !hasSelection
    ? (placeholder ?? COPY.placeholder)
    : selectedValues.length <= 2
      ? selectedValues.map(labelFor).join(', ')
      : COPY.selectedCount.replace('{count}', new Intl.NumberFormat().format(selectedValues.length));

  // The focus width replaces the border width; padding shrinks by the difference.
  const borderWidth = focused ? t.borderWidthFocus : triggerBorderWidth;
  const inset = triggerBorderWidth - borderWidth;
  const triggerBorderColor = focused ? t.colorBorderFocus : isInvalid ? triggerBorderInvalid : t.colorBorderStrong;

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
    minHeight: minTarget,
    backgroundColor: t.colorBackground,
    borderWidth,
    borderColor: triggerBorderColor,
    borderRadius: triggerRadius,
    paddingHorizontal: triggerPaddingInline + inset,
    paddingVertical: triggerPaddingBlock + inset,
  };

  const valueOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.fontSize,
    fontWeight: overrides?.fontWeight,
    lineHeight: overrides?.lineHeight,
  };
  const labelOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.fontSize,
    fontWeight: overrides?.labelWeight,
    lineHeight: overrides?.lineHeight,
  };
  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };
  const listboxOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.fontSize ?? (size === 'sm' ? ('font.size.sm' as TokenRef) : undefined),
    lineHeight: overrides?.lineHeight,
    disabledOpacity: overrides?.disabledOpacity,
  };

  const listbox = (
    <Listbox
      label={label}
      options={options}
      multiple={multiple}
      value={currentValue}
      selectionFollowsFocus={multiple ? undefined : false}
      initialActiveValue={selectedValues[0]}
      disabled={isDisabled}
      embedded
      onChange={handleListboxChange}
      overrides={listboxOverrides}
    />
  );

  const spaceBelow = triggerRect !== null ? windowHeight - (triggerRect.y + triggerRect.height) : 0;
  const spaceAbove = triggerRect !== null ? triggerRect.y : 0;
  const measuredPopupHeight = popupHeight ?? 0;
  const flipAbove = triggerRect !== null && spaceBelow < measuredPopupHeight + popupOffset && spaceAbove > spaceBelow;
  const popupTop =
    triggerRect === null
      ? 0
      : flipAbove
        ? triggerRect.y - popupOffset - measuredPopupHeight
        : triggerRect.y + triggerRect.height + popupOffset;

  const hostStyle: ViewStyle = { flex: 1 };

  const popupOuterStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    top: popupTop,
    left: triggerRect?.x ?? 0,
    minWidth: triggerRect?.width,
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
    <View ref={ref} testID="Select" style={containerStyle}>
      {hideLabel ? null : (
        <Text size={size} weight="medium" overrides={labelOverrides}>
          {visibleLabel}
        </Text>
      )}
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
        <Text size={size} tone={hasSelection ? 'default' : 'muted'} overrides={valueOverrides}>
          {valueText}
        </Text>
        <Icon name="chevron-down" size="sm" color={t.colorForegroundMuted} />
      </Pressable>
      {displayedError !== undefined ? (
        <View testID="Select.errorMessage" accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
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
            <Pressable style={StyleSheet.absoluteFill} onPress={closePopup} accessible={false} testID="Select.scrim" />
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
