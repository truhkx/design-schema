import * as React from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, View, findNodeHandle } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFieldsetContext } from './Fieldset';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import type { TextProps } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

/** One option. `value` is a short identifier (letters, digits, dashes). */
export type RadioGroupOption = { value: string; label: string; description?: string | undefined; disabled?: boolean | undefined };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type RadioGroupOverridableBinding =
  | 'controlBorderWidth'
  | 'indicatorInset'
  | 'controlBorderInvalid'
  | 'controlSize'
  | 'controlRadius'
  | 'optionPaddingBlock'
  | 'optionTextGap'
  | 'optionGap'
  | 'listGap'
  | 'partGap'
  | 'legendSize'
  | 'legendWeight'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

export interface RadioGroupProps {
  /** The group's legend — the question the options answer. Always visible. Also the group's `accessibilityLabel`. */
  label: string;
  /** Field name used by the enclosing Form. */
  name: string;
  /** The options in display order. Two to about seven; more than that is a Select (planned). */
  options: RadioGroupOption[];
  /** Controlled selected value. Omit for an uncontrolled group. */
  value?: string | undefined;
  /** Initial selection for an uncontrolled group. Omit to start with nothing selected. */
  defaultValue?: string | undefined;
  /** Layout of the options. Horizontal only for two or three short labels; it wraps rather than overflows. */
  orientation?: RadioGroupOrientation | undefined;
  /** An option must be selected to submit. Shown in the legend, not only by color. */
  required?: boolean | undefined;
  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** Disables every option. Individual options use `options[].disabled`. */
  disabled?: boolean | undefined;
  /** Persistent helper text under the legend. Also the group's `accessibilityHint`. */
  description?: string | undefined;
  /** The group's error message. Setting it marks the group invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new option value. */
  onChange?: ((value: string) => void) | undefined;
  /** The root (group) view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
  position: (index: number, total: number): string => `${index} of ${total}`,
} as const;

type TextOverrides = TextProps['overrides'];

/** The DOM element react-native-web renders for an option row; this package has no DOM lib. */
type WebElement = { setAttribute(name: string, value: string): void; removeAttribute(name: string): void };

interface RadioProps {
  option: RadioGroupOption;
  index: number;
  total: number;
  selected: boolean;
  optionDisabled: boolean;
  invalid: boolean;
  radioRef: React.Ref<ViewInstance> | undefined;
  onSelect: (value: string) => void;
  sizes: {
    controlBorderWidth: number;
    indicatorInset: number;
    controlBorderInvalid: string;
    controlSize: number;
    controlRadius: number;
    optionPaddingBlock: number;
    optionTextGap: number;
    optionGap: number;
    disabledOpacity: number;
    transitionDuration: number;
    labelSize: number;
    lineHeight: number;
  };
  labelOverrides: TextOverrides;
  helperOverrides: TextOverrides;
}

/** One option row: the whole row is the Pressable, so the control, label and description are all the hit area. */
function Radio({
  option,
  index,
  total,
  selected,
  optionDisabled,
  invalid,
  radioRef,
  onSelect,
  sizes,
  labelOverrides,
  helperOverrides,
}: RadioProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const [focused, setFocused] = React.useState(false);

  // The row is owned here so react-native-web can be given `aria-disabled` on the DOM node (below);
  // the group's `radioRef` (the first enabled option, focused on a failed submit) still receives it.
  const rowRef = React.useRef<ViewInstance>(null);
  React.useImperativeHandle(radioRef, () => rowRef.current!, []);

  // A disabled option row is dimmed with disabledOpacity, so on react-native-web its label and
  // description would fail axe's contrast check while reading as enabled. The row Pressable cannot
  // take `disabled` — that would drop it from the tab order, and the rn notes keep every radio a
  // stop — and react-native-web's Pressable overwrites any `aria-disabled` passed in with its own
  // `disabled` prop, so the attribute is set on the DOM node itself, as in Button, Checkbox and
  // Switch: the row is announced disabled and its dimmed text is audited as part of a disabled
  // control rather than as body copy.
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const node = rowRef.current as unknown as WebElement | null;
    if (node === null) {
      return;
    }
    if (optionDisabled) {
      node.setAttribute('aria-disabled', 'true');
    } else {
      node.removeAttribute('aria-disabled');
    }
  }, [optionDisabled]);

  // The selected border and the dot cross-fade in; the fill stays controlBackground.
  const selectAnim = React.useRef(new Animated.Value(selected ? 1 : 0)).current;
  React.useEffect(() => {
    const toValue = selected ? 1 : 0;
    if (reducedMotion) {
      selectAnim.setValue(toValue);
      return;
    }
    Animated.timing(selectAnim, {
      toValue,
      duration: sizes.transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [selected, reducedMotion, selectAnim, sizes.transitionDuration, t.motionEasingStandard]);

  // A single-line row is exactly minTarget tall: it pads the difference between the target and the
  // label's first line above and below, so optionPaddingBlock only shows once it exceeds that and
  // can grow the row but never shrink it below the floor. A description grows it downwards.
  const firstLine = toLineHeight(sizes.labelSize, sizes.lineHeight);
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sizes.optionGap,
    minHeight: t.sizeTargetComfortable,
    paddingVertical: Math.max(sizes.optionPaddingBlock, (t.sizeTargetComfortable - firstLine) / 2),
    // Only option rows dim, once each: `optionDisabled` already folds in the group's disabled state.
    opacity: optionDisabled ? sizes.disabledOpacity : 1,
  };

  // The control sits in a slot as tall as the label's first line, centred in it, so a wrapping
  // label or a description never pulls it off that line.
  const controlSlotStyle: ViewStyle = {
    height: firstLine,
    justifyContent: 'center',
  };

  // Border colour precedence: invalid, then focus, then selected, then rest. Focus never hides the
  // invalid colour — only the width changes. Invalid and focus switch instantly; the selected
  // border fades with the dot over `transition`.
  const controlStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: sizes.controlSize,
    height: sizes.controlSize,
    borderRadius: sizes.controlRadius,
    borderWidth: focused ? t.borderWidthFocus : sizes.controlBorderWidth,
    borderColor: invalid
      ? sizes.controlBorderInvalid
      : focused
        ? t.colorBorderFocus
        : selectAnim.interpolate({ inputRange: [0, 1], outputRange: [t.colorControlBorder, t.colorControlSelectedBackground] }),
    backgroundColor: t.colorControlBackground,
    alignItems: 'center',
    justifyContent: 'center',
  };

  // The centre dot is controlSize minus indicatorInset on each side, and always a circle —
  // it does not follow controlRadius. Its size does not change on focus: the thicker focus
  // border eats into the inset, and the dot still fits while indicatorInset ≥ focusRingWidth.
  const dotSize = sizes.controlSize - 2 * sizes.indicatorInset;
  const dotStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: dotSize,
    height: dotSize,
    borderRadius: t.radiusFull,
    backgroundColor: t.colorControlSelectedBackground,
    opacity: selectAnim,
  };

  const textColumnStyle: ViewStyle = {
    flexShrink: 1,
    flexDirection: 'column',
    gap: sizes.optionTextGap,
  };

  const accessibleName = option.description !== undefined ? `${option.label}, ${option.description}` : option.label;

  return (
    <Pressable
      ref={rowRef}
      testID="RadioGroup.radio"
      accessibilityRole="radio"
      accessibilityLabel={accessibleName}
      aria-label={accessibleName}
      accessibilityState={{ checked: selected, disabled: optionDisabled }}
      accessibilityValue={{ text: COPY.position(index, total) }}
      // react-native-web 0.21 ignores `accessibilityState`, and `aria-checked` is required on
      // `role="radio"` (axe's aria-required-attr), so the checked state reaches the DOM through
      // this mirror; native merges both. `aria-disabled` is set on the web node in an effect above.
      aria-checked={selected}
      onPress={() => {
        if (!optionDisabled) {
          onSelect(option.value);
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={rowStyle}
    >
      <View style={controlSlotStyle}>
        <Animated.View style={controlStyle} accessibilityElementsHidden importantForAccessibility="no">
          <Animated.View testID="RadioGroup.radioIndicator" style={dotStyle} />
        </Animated.View>
      </View>
      <View style={textColumnStyle}>
        <View testID="RadioGroup.radioLabel">
          <Text size="md" weight="regular" tone="default" overrides={labelOverrides}>
            {option.label}
          </Text>
        </View>
        {option.description !== undefined ? (
          <View testID="RadioGroup.radioDescription">
            <Text size="sm" tone="muted" overrides={helperOverrides}>
              {option.description}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * RadioGroup — asks one question and takes one answer. Every option is visible at
 * once, so the user can compare before choosing.
 *
 * When to use: Use a RadioGroup when the user must pick exactly one of two to about
 * seven options and seeing them all helps the decision — plan tiers, shipping
 * methods. Give options a `description` when the label alone does not tell them
 * apart. Do not use it for a yes/no (Checkbox or Switch) or for more than about
 * seven options (Select, planned). Once a radio is chosen, one is always chosen.
 *
 * Renders a `View` with `accessibilityRole="radiogroup"`, `accessibilityLabel={label}`
 * and `accessibilityHint={description}` (not `accessible`, so the radios stay
 * reachable), a `Text` legend, and one `Pressable` per option with
 * `accessibilityRole="radio"`, `accessibilityLabel` (label plus description),
 * `accessibilityState={{ checked, disabled }}` and `copy.position` as its
 * `accessibilityValue`. There is no roving tabindex or arrow movement on native —
 * every radio is its own focus stop, which is the platform convention; Space/Enter on
 * a hardware keyboard activate the focused radio. Individually disabled options stay
 * focus stops but are guarded against press and dimmed; a fully `disabled` group stays
 * reachable but inert. The selected border and dot cross-fade in over `transition`
 * with `motion.easing.standard` (skipped under reduced motion). Inside a Form the
 * group registers by `name` and contributes the selected value (no key when nothing
 * is selected); validation precedence is `error`, then `required` (`copy.required`),
 * then `invalid` (`copy.invalid`), as in Input, and focus moves to the first enabled
 * radio on a failed submit. `validate: blur` runs on change, since a group-level blur
 * does not exist on native. Inside a Fieldset the group's `disabled` applies and the
 * legend prefixes the accessibility label. The group error is announced as in Input.
 */
export function RadioGroup({
  label,
  name,
  options,
  value,
  defaultValue,
  orientation = 'vertical',
  required = false,
  invalid = false,
  disabled = false,
  description,
  error,
  overrides,
  onChange,
  ref,
}: RadioGroupProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const fieldset = useFieldsetContext();
  const firstEnabledRef = React.useRef<ViewInstance>(null);
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);

  const currentValue = value !== undefined ? value : internalValue;
  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
  const formError = form?.errors[name];
  // Precedence: `error` prop, then the Form's message, then — only while `invalid` — copy.required
  // (required and nothing selected) or copy.invalid.
  const derivedError = invalid ? (required && currentValue === undefined ? COPY.required(label) : COPY.invalid(label)) : undefined;
  const displayedError = error !== undefined && error !== '' ? error : (formError ?? derivedError);
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  const validateValue = React.useCallback(
    (candidate: string | undefined): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && candidate === undefined) {
        return COPY.required(label);
      }
      if (invalid) {
        return COPY.invalid(label);
      }
      return null;
    },
    [error, required, invalid, label],
  );

  const latest = React.useRef({ currentValue, validateValue });
  latest.current = { currentValue, validateValue };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => latest.current.currentValue,
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: () => {
        const node = firstEnabledRef.current === null ? null : findNodeHandle(firstEnabledRef.current);
        if (node != null) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      },
    }),
    [],
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

  // iOS announces the message when it appears or changes after mount, never on the first
  // render, so a group that starts invalid is read in sequence instead of interrupting.
  const announcedError = React.useRef(displayedError);
  React.useEffect(() => {
    if (announcedError.current === displayedError) {
      return;
    }
    announcedError.current = displayedError;
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const select = (next: string): void => {
    if (isDisabled || next === currentValue) {
      return;
    }
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  const accessibleName = fieldset !== null ? `${fieldset.legend}, ${visibleLabel}` : visibleLabel;
  const firstEnabledValue = options.find((option) => option.disabled !== true)?.value;

  const sizes = {
    controlBorderWidth: overrides?.controlBorderWidth ? (resolveToken(t, overrides.controlBorderWidth) as number) : t.borderWidthThin,
    indicatorInset: overrides?.indicatorInset ? (resolveToken(t, overrides.indicatorInset) as number) : t.space1,
    controlBorderInvalid: overrides?.controlBorderInvalid ? (resolveToken(t, overrides.controlBorderInvalid) as string) : t.colorBorderDanger,
    controlSize: overrides?.controlSize ? (resolveToken(t, overrides.controlSize) as number) : t.space5,
    controlRadius: overrides?.controlRadius ? (resolveToken(t, overrides.controlRadius) as number) : t.radiusFull,
    optionPaddingBlock: overrides?.optionPaddingBlock ? (resolveToken(t, overrides.optionPaddingBlock) as number) : t.space1,
    optionTextGap: overrides?.optionTextGap ? (resolveToken(t, overrides.optionTextGap) as number) : t.space1,
    optionGap: overrides?.optionGap ? (resolveToken(t, overrides.optionGap) as number) : t.space2,
    disabledOpacity: overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled,
    transitionDuration: overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast,
    labelSize: overrides?.labelSize ? (resolveToken(t, overrides.labelSize) as number) : t.fontSizeMd,
    lineHeight: overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal,
  };
  const listGap = overrides?.listGap ? (resolveToken(t, overrides.listGap) as number) : t.space2;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;

  // Legend, description and error stay at full opacity; the option rows carry disabledOpacity.
  const groupStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
  };

  const listStyle: ViewStyle = {
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    gap: listGap,
  };

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const legendOverrides = { ...typographyOverrides, fontSize: overrides?.legendSize, fontWeight: overrides?.legendWeight };
  const labelOverrides = { ...typographyOverrides, fontSize: overrides?.labelSize, fontWeight: overrides?.labelWeight };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  return (
    <View
      ref={ref}
      testID="RadioGroup"
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibleName}
      aria-label={accessibleName}
      accessibilityHint={description}
      accessibilityState={{ disabled: isDisabled }}
      aria-disabled={isDisabled}
      style={groupStyle}
    >
      <View testID="RadioGroup.legend">
        <Text size="md" weight="medium" tone="default" overrides={legendOverrides}>
          {visibleLabel}
        </Text>
      </View>
      {description !== undefined ? (
        <View testID="RadioGroup.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <View style={listStyle}>
        {options.map((option, index) => (
          <Radio
            key={option.value}
            option={option}
            index={index + 1}
            total={options.length}
            selected={option.value === currentValue}
            optionDisabled={isDisabled || option.disabled === true}
            invalid={isInvalid}
            radioRef={option.value === firstEnabledValue ? firstEnabledRef : undefined}
            onSelect={select}
            sizes={sizes}
            labelOverrides={labelOverrides}
            helperOverrides={helperOverrides}
          />
        ))}
      </View>
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'} testID="RadioGroup.errorMessage">
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
