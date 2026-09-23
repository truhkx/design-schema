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
import { useFieldsetContext } from './Fieldset';
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

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. The locked bindings (`triggerBackground`, `triggerBorder`,
 * `triggerBorderFocus`, `valueColor`, `placeholderColor`, `chevron`, `descriptionText`,
 * `errorText`, `minTarget`, `minTargetSm`, `focusRingWidth`) carry contrast or target
 * guarantees and are not in the union.
 */
export type SelectOverridableBinding =
  | 'triggerBorderInvalid'
  | 'triggerBorderWidth'
  | 'triggerRadius'
  | 'triggerPaddingInline'
  | 'triggerPaddingBlock'
  | 'triggerGap'
  | 'chevronReserve'
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
  /** Not openable and not submitted. Stays visible and focusable. Wins over a controlled `open`. */
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

/** The component's user-facing strings, from the doc's `copy` block. */
const COPY = {
  placeholder: 'Select…',
  selectedCount: '{count} selected',
  done: 'Done',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
} as const;

/** The most selected labels the trigger spells out before it counts them instead. */
const MAX_LISTED_LABELS = 2; // literal-ok: the doc's "two or fewer are joined with a comma"

type WebElement = { setAttribute(name: string, value: string): void; removeAttribute(name: string): void };

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

/** Nothing selected: no entries with `multiple`, no string without it. */
function isEmptyValue(candidate: SelectValue | undefined): boolean {
  return Array.isArray(candidate) ? candidate.length === 0 : candidate === undefined || candidate === '';
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
 * `accessibilityValue={{ text }}` with the selected label(s), the count, or the
 * placeholder) showing the value and a `chevron-down` `Icon`. A long value is clipped to
 * one line with an ellipsis. Activating the trigger opens an `embedded` `Listbox` (given
 * no `name`, so Select alone is the field, `selectionFollowsFocus: false`, and the first
 * selection as `initialActiveValue`): a `BottomSheet` on phone-width screens
 * (`layout.maxWidth.prose` and narrower) with a `copy.done` footer button for `multiple`,
 * or else a transparent `Modal` whose popup sits below the trigger (flipped above when
 * there is no room), at least as wide as it, on `layer.dropdown`, fading in over `enter`.
 * Closing is instant on every platform, as on web. Escape (the Android back gesture) and
 * an outside tap close without changing the value; focus returns to the trigger by hand
 * (`AccessibilityInfo.setAccessibilityFocus`), since `FocusScope`'s restore only
 * recaptures a `TextInput`. Selecting an option commits and, for a single select, closes;
 * re-picking the selected option closes without firing `onChange`. `Pressable` sees no
 * keys, so Enter-as-press is the only other keyboard rule — Tab-commits-and-closes has no
 * native form.
 *
 * `disabled` wins over a controlled `open`: a disabled Select never shows its popup, is
 * not submitted, and stays visible and focusable (the `disabled` prop is never passed to
 * the `Pressable`, which would take it out of the tab order; react-native-web gets
 * `aria-disabled` on the DOM node instead, and `aria-expanded` is mirrored because
 * react-native-web drops `accessibilityState`).
 *
 * Validation works as `Input`'s: precedence `error`, then `required` (`copy.required`),
 * then `invalid` (`copy.invalid`), registered with the enclosing `FormContext` by `name`
 * with a string value for a single select and a `string[]` with `multiple`.
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
  const fieldset = useFieldsetContext();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const triggerRef = React.useRef<ViewInstance>(null);
  const popupId = React.useId();
  const [internalValue, setInternalValue] = React.useState<SelectValue | undefined>(defaultValue);
  const [focused, setFocused] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<Rect | null>(null);
  const [popupHeight, setPopupHeight] = React.useState<number | null>(null);
  const progress = React.useRef(new Animated.Value(0)).current;

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isOpenControlled = openProp !== undefined;
  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
  // `disabled` wins over a controlled `open`: a disabled Select never shows its popup.
  const open = isDisabled ? false : isOpenControlled ? openProp : internalOpen;

  // The Form marks a failing field by putting an entry under its name; the entry's presence
  // is the mark, and an entry with an empty message falls through to the derived copy.
  // `error` is the consumer's and the Form never sets it. Precedence as Input's.
  const formErrors = form?.errors;
  const formMarked = formErrors !== undefined && Object.prototype.hasOwnProperty.call(formErrors, name);
  const formError = formErrors?.[name];
  const ownError = error !== undefined && error !== '' ? error : undefined;
  const summarised = form !== null && form.errorSummary;

  // `always` has no OS picker to force here, so only `never` leaves the phone/tablet split.
  const isPhoneWidth = windowWidth <= t.layoutMaxWidthProse;
  const usesSheet = native !== 'never' && isPhoneWidth;
  // The popup carries `popupId` once it is on screen: the sheet's content as soon as it opens,
  // the positioned popup only after the trigger has been measured.
  const popupMounted = open && (usesSheet || triggerRect !== null);

  const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
  const labelFor = React.useCallback(
    (optionValue: string): string => flatOptions.find((option) => option.value === optionValue)?.label ?? optionValue,
    [flatOptions],
  );

  const selectedValues: string[] = multiple
    ? Array.isArray(currentValue)
      ? currentValue
      : []
    : typeof currentValue === 'string' && currentValue !== ''
      ? [currentValue]
      : [];
  const hasSelection = selectedValues.length > 0;

  const isInvalid = ownError !== undefined || invalid || formMarked;
  const derivedError = isInvalid
    ? required && !hasSelection
      ? COPY.required.replace('{label}', label)
      : COPY.invalid.replace('{label}', label)
    : undefined;
  const displayedError = ownError ?? (formError !== undefined && formError !== '' ? formError : derivedError);

  const validateValue = React.useCallback(
    (candidate: SelectValue | undefined): string | null => {
      // Precedence: `error` prop, then `required`, then `invalid`. The Form's own entry is
      // ignored here, since this is what the Form calls to produce it. A disabled field is skipped.
      if (isDisabled) {
        return null;
      }
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && isEmptyValue(candidate)) {
        return COPY.required.replace('{label}', label);
      }
      if (invalid) {
        return COPY.invalid.replace('{label}', label);
      }
      return null;
    },
    [isDisabled, error, required, invalid, label],
  );

  const focusTrigger = React.useCallback((): void => {
    const node = triggerRef.current === null ? null : findNodeHandle(triggerRef.current);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, []);

  const latest = React.useRef({ currentValue, validateValue });
  latest.current = { currentValue, validateValue };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      label,
      // Nothing selected contributes nothing and is left out of the collected values:
      // a string for a single select, a string[] with `multiple`.
      getValue: () => {
        const current = latest.current.currentValue;
        if (multiple) {
          return Array.isArray(current) && current.length > 0 ? current : undefined;
        }
        return typeof current === 'string' && current !== '' ? current : undefined;
      },
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: focusTrigger,
    }),
    [label, multiple, focusTrigger],
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

  // react-native-web's Pressable writes `aria-disabled` from its own `disabled` prop, after
  // any `aria-disabled` passed in, and passing `disabled` would drop the trigger from the tab
  // order — a disabled Select stays focusable. So on web the attribute is set on the DOM node
  // itself: the trigger is still announced (and audited) as disabled. `aria-controls` rides
  // along because React Native 0.87 has no prop for it: a `combobox` must name the popup it
  // controls while it is open, and the popup is unmounted (so the id is gone) while closed.
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const node = triggerRef.current as unknown as WebElement | null;
    if (node === null) {
      return;
    }
    if (isDisabled) {
      node.setAttribute('aria-disabled', 'true');
    } else {
      node.removeAttribute('aria-disabled');
    }
    if (popupMounted) {
      node.setAttribute('aria-controls', popupId);
    } else {
      node.removeAttribute('aria-controls');
    }
  }, [isDisabled, popupMounted, popupId]);

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
    // Re-picking the selected option closes a single select without a change.
    if (!multiple && next === currentValue) {
      closePopup();
      return;
    }
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    // `validateMode` reports `change` once a submission has failed, so this also re-validates
    // a fixed field. Picking is this field's "change": there is no blur to wait for.
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
    if (!multiple) {
      closePopup();
    }
  };

  // `overrideRef` never shadows the `ref` prop: the trigger's node is read in the effects above.
  const token = <T,>(overrideRef: TokenRef | undefined, fallback: T): T =>
    overrideRef ? (resolveToken(t, overrideRef) as T) : fallback;

  const enterDuration = token<number>(overrides?.enter, t.motionDurationFast);
  const standardEasing = toEasing(t.motionEasingStandard);

  // Popup-Modal path only (the BottomSheet manages its own mount and animation). Opening
  // fades the popup in over `enter`; closing is instant on every platform, as on web.
  React.useEffect(() => {
    if (usesSheet) {
      return undefined;
    }
    if (!open) {
      progress.setValue(0);
      setTriggerRect(null);
      setPopupHeight(null);
      return undefined;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => setTriggerRect({ x, y, width, height }));
    if (reducedMotion) {
      progress.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: enterDuration,
      easing: standardEasing,
      // react-native-web has no native animated module, and opacity is a layout-adjacent prop here.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [open, usesSheet, reducedMotion, enterDuration, standardEasing, progress]);

  const handlePopupLayout = (event: LayoutChangeEvent): void => {
    setPopupHeight(event.nativeEvent.layout.height);
  };

  const triggerBorderInvalid = token<string>(overrides?.triggerBorderInvalid, t.colorBorderDanger);
  const triggerBorderWidth = token<number>(overrides?.triggerBorderWidth, t.borderWidthThin);
  const triggerRadius = token<number>(overrides?.triggerRadius, t.radiusMd);
  const triggerPaddingInline = token<number>(overrides?.triggerPaddingInline, t.spaceMd);
  const triggerPaddingBlock = token<number>(overrides?.triggerPaddingBlock, size === 'sm' ? t.space1 : t.spaceSm);
  const triggerGap = token<number>(overrides?.triggerGap, t.layoutGapNormal);
  // `chevronReserve` is the inline-end gutter a native <select> leaves for its own chevron
  // glyph on web. There is no native picker here, so the binding is accepted for parity with
  // web and has no effect, as Input's `transition`.
  const partGap = token<number>(overrides?.partGap, t.space1);
  const popupSurface = token<string>(overrides?.popupSurface, t.colorOverlaySurface);
  const popupBorder = token<string>(overrides?.popupBorder, t.colorBorder);
  const popupBorderWidth = token<number>(overrides?.popupBorderWidth, t.borderWidthThin);
  const popupShadow = token<typeof t.shadowOverlay>(overrides?.popupShadow, t.shadowOverlay);
  const popupRadius = token<number>(overrides?.popupRadius, t.radiusMd);
  const popupOffset = token<number>(overrides?.popupOffset, t.space1);
  const layer = token<number>(overrides?.layer, t.layerDropdown);
  const disabledOpacity = token<number>(overrides?.disabledOpacity, t.opacityDisabled);
  // `minTarget` / `minTargetSm`: both locked, so the sm floor is always `size.target.min`.
  const minTarget = size === 'sm' ? t.sizeTargetMin : t.sizeTargetComfortable;

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  // A Fieldset legend still prefixes the name, as every other field in the package.
  const accessibleName = fieldset === null ? visibleLabel : `${fieldset.legend}, ${visibleLabel}`;

  const valueText = !hasSelection
    ? (placeholder ?? COPY.placeholder)
    : selectedValues.length <= MAX_LISTED_LABELS
      ? selectedValues.map(labelFor).join(', ')
      : COPY.selectedCount.replace('{count}', new Intl.NumberFormat().format(selectedValues.length));

  // The focus width replaces the border width; padding shrinks by the difference — the doc's
  // unclamped `padding - (focusRingWidth - triggerBorderWidth)` — so the trigger does not
  // shift. Pressable focus cannot tell keyboard from touch here, so the width changes on any focus.
  const borderWidth = focused ? t.borderWidthFocus : triggerBorderWidth;
  const borderGrowth = borderWidth - triggerBorderWidth;
  // Invalid keeps the danger color while focused, so focus never hides the error.
  const triggerBorderColor = isInvalid ? triggerBorderInvalid : focused ? t.colorBorderFocus : t.colorBorderStrong;

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
    paddingHorizontal: triggerPaddingInline - borderGrowth,
    paddingVertical: triggerPaddingBlock - borderGrowth,
  };

  // Each forward carries the binding's resolved token — the consumer's override, else the
  // Select default with `{size}` resolved — into the child's own `overrides`, never as a
  // style written on the child.
  const fontFamilyRef: TokenRef = overrides?.fontFamily ?? 'font.family.body';
  const fontSizeRef: TokenRef = overrides?.fontSize ?? (`font.size.${size}` as TokenRef);
  const lineHeightRef: TokenRef = overrides?.lineHeight ?? 'font.lineHeight.normal';
  const helperSizeRef: TokenRef = overrides?.helperSize ?? 'font.size.sm';

  const labelOverrides = {
    fontWeight: overrides?.labelWeight ?? ('font.weight.medium' as TokenRef),
    fontSize: fontSizeRef,
    fontFamily: fontFamilyRef,
    lineHeight: lineHeightRef,
  };
  const valueOverrides = {
    fontSize: fontSizeRef,
    fontWeight: overrides?.fontWeight ?? ('font.weight.regular' as TokenRef),
    fontFamily: fontFamilyRef,
    lineHeight: lineHeightRef,
  };
  const helperOverrides = { fontSize: helperSizeRef, fontFamily: fontFamilyRef, lineHeight: lineHeightRef };
  // fontSize is not forwarded: the popup does not follow `size`, so options keep Listbox's own.
  const listboxOverrides = { fontFamily: fontFamilyRef, lineHeight: lineHeightRef };
  // The locked `chevron` binding always carries this token, as the Icon's override rather than
  // its `color` prop, which would win over an override.
  const chevronOverrides = { color: 'color.foreground.muted' as TokenRef };

  const listbox = (
    <Listbox
      label={label}
      options={options}
      multiple={multiple}
      value={currentValue}
      embedded
      selectionFollowsFocus={false}
      initialActiveValue={selectedValues[0]}
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
  const valueSlotStyle: ViewStyle = { flexShrink: 1 };

  const popupOuterStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    top: popupTop,
    left: triggerRect?.x ?? 0,
    // The popup is at least as wide as the trigger.
    minWidth: triggerRect?.width,
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

  return (
    <View ref={ref} testID="Select" style={containerStyle} aria-disabled={isDisabled}>
      {hideLabel ? null : (
        // Text takes no testID, so the part name lives on a layout-only wrapper View (as Input).
        <View testID="Select.label">
          <Text weight="medium" overrides={labelOverrides}>
            {visibleLabel}
          </Text>
        </View>
      )}
      {description === undefined || description === '' ? null : (
        <View testID="Select.description">
          <Text tone="muted" size="sm" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      )}
      <Pressable
        ref={triggerRef}
        accessibilityRole="combobox"
        accessibilityLabel={accessibleName}
        accessibilityHint={description}
        accessibilityState={{ expanded: open, disabled: isDisabled }}
        accessibilityValue={{ text: valueText }}
        // react-native-web 0.21 drops `accessibilityState`, and a `combobox` without
        // `aria-expanded` fails an accessibility audit; `aria-disabled` is set on the web node
        // in the effect above.
        aria-label={accessibleName}
        aria-expanded={open}
        onPress={handleTriggerPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={triggerStyle}
        testID="Select.trigger"
      >
        <View testID="Select.value" style={valueSlotStyle}>
          <Text tone={hasSelection ? 'default' : 'muted'} truncate overrides={valueOverrides}>
            {valueText}
          </Text>
        </View>
        <View testID="Select.chevron">
          <Icon name="chevron-down" size="sm" overrides={chevronOverrides} />
        </View>
      </Pressable>
      {displayedError === undefined ? null : (
        <View
          testID="Select.errorMessage"
          // Android announces through the live region; iOS through the effect above. A Form
          // with its own error summary announces instead, so both are silenced there.
          accessibilityLiveRegion={summarised ? 'none' : 'assertive'}
        >
          <Text tone="danger" size="sm" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      )}
      {usesSheet ? (
        <BottomSheet
          open={open}
          heading={label}
          onClose={closePopup}
          footer={multiple ? <Button label={COPY.done} onPress={closePopup} /> : undefined}
        >
          {/* The sheet's surface belongs to BottomSheet, so the `popup` part is this layout-only
              wrapper around the list — it is what the trigger's `aria-controls` names. */}
          <View nativeID={popupId} testID="Select.popup">
            {listbox}
          </View>
        </BottomSheet>
      ) : (
        // Modal: `onRequestClose` is the Android back button (the Escape rule's native form),
        // the scrim is the outside tap, and the popup traps focus while it is open.
        <Modal visible={open} transparent animationType="none" onRequestClose={closePopup} statusBarTranslucent>
          <View style={hostStyle}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closePopup} accessible={false} testID="Select.scrim" />
            {triggerRect === null ? null : (
              <FocusScope trapped active={open} autoFocus="first" restoreFocus={false}>
                <Animated.View
                  style={popupOuterStyle}
                  onLayout={handlePopupLayout}
                  nativeID={popupId}
                  accessibilityViewIsModal
                  accessibilityLabel={label}
                  testID="Select.popup"
                >
                  <View style={popupInnerStyle}>{listbox}</View>
                </Animated.View>
              </FocusScope>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}
