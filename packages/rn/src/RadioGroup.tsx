import * as React from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, View, findNodeHandle } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

/** One option. `value` is a short identifier (letters, digits, dashes). */
export type RadioGroupOption = { value: string; label: string; description?: string | undefined; disabled?: boolean | undefined };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type RadioGroupOverridableBinding =
  | 'controlBorderWidth'
  | 'controlBorderInvalid'
  | 'controlSize'
  | 'controlRadius'
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
}

const COPY = {
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
} as const;

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
 * and `accessibilityHint={description}`, a `Text` legend, and one `Pressable` per
 * option with `accessibilityRole="radio"`, `accessibilityLabel` (label plus
 * description) and `accessibilityState={{ checked, disabled }}`. There is no roving
 * tabindex or arrow movement on native — every radio is its own focus stop, which is
 * the platform convention. Individually disabled options stay focus stops (native
 * `disabled` is reserved for `Switch`) but are guarded against press and dimmed;
 * a fully `disabled` group stays reachable but inert. The selected border and dot
 * cross-fade in over `transition` with `motion.easing.standard` (skipped under
 * reduced motion); the fill never changes, only the border and dot. Inside a Form
 * the group registers by `name` and contributes the selected value (no key when
 * nothing is selected); validation precedence is `error`, then `required`
 * (`copy.required`), then `invalid` (`copy.invalid`), same as Input, and focus moves
 * to the first enabled radio on a failed submit. `validate: blur` runs on change,
 * since a group-level blur does not exist on native. The group error is announced
 * as in Input.
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
}: RadioGroupProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();
  const groupRef = React.useRef<ViewInstance>(null);
  const firstEnabledRef = React.useRef<ViewInstance>(null);
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
  const [focusedValue, setFocusedValue] = React.useState<string | null>(null);

  const currentValue = value ?? internalValue;
  const isDisabled = disabled || (form?.disabled ?? false);
  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  const validateValue = React.useCallback(
    (candidate: string | undefined): string | null => {
      // Precedence: `error` prop, then `required`, then `invalid` — same order as Input.
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
        // Focus the first enabled radio (the one a Tab would land on), falling back to the group.
        const target = firstEnabledRef.current ?? groupRef.current;
        const node = target === null ? null : findNodeHandle(target);
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

  React.useEffect(() => {
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
  const firstEnabledValue = options.find((option) => option.disabled !== true)?.value;

  const controlBorderWidth = overrides?.controlBorderWidth ? (resolveToken(t, overrides.controlBorderWidth) as number) : t.borderWidthThin;
  const controlBorderInvalid = overrides?.controlBorderInvalid ? (resolveToken(t, overrides.controlBorderInvalid) as string) : t.colorBorderDanger;
  const controlSize = overrides?.controlSize ? (resolveToken(t, overrides.controlSize) as number) : t.space5;
  const controlRadius = overrides?.controlRadius ? (resolveToken(t, overrides.controlRadius) as number) : t.radiusFull;
  const optionGap = overrides?.optionGap ? (resolveToken(t, overrides.optionGap) as number) : t.space2;
  const listGap = overrides?.listGap ? (resolveToken(t, overrides.listGap) as number) : t.space2;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;

  // The centre dot is controlSize minus 2 × space.1 in diameter — a fixed relationship, not overridable.
  const dotSize = controlSize - 2 * t.space1;

  // One cross-fade per option, keyed by value; the fill never changes, only the border and dot.
  const fillAnimsRef = React.useRef<Map<string, Animated.Value>>(new Map());
  const getFillAnim = (optionValue: string, selected: boolean): Animated.Value => {
    let anim = fillAnimsRef.current.get(optionValue);
    if (anim === undefined) {
      anim = new Animated.Value(selected ? 1 : 0);
      fillAnimsRef.current.set(optionValue, anim);
    }
    return anim;
  };

  const optionValues = React.useMemo(() => options.map((option) => option.value), [options]);

  React.useEffect(() => {
    optionValues.forEach((optionValue) => {
      const selected = optionValue === currentValue;
      const anim = getFillAnim(optionValue, selected);
      const toValue = selected ? 1 : 0;
      if (reducedMotion) {
        anim.setValue(toValue);
        return;
      }
      Animated.timing(anim, {
        toValue,
        duration: transitionDuration,
        easing: toEasing(t.motionEasingStandard),
        useNativeDriver: false,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, optionValues, reducedMotion, transitionDuration, t.motionEasingStandard]);

  const groupStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const listStyle: ViewStyle = {
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    gap: listGap,
  };

  const optionStyle = (optionDisabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: optionGap,
    minHeight: t.sizeTargetComfortable,
    paddingVertical: t.space1,
    opacity: optionDisabled && !isDisabled ? disabledOpacity : 1,
  });

  const controlStyle = (anim: Animated.Value, focused: boolean): Animated.WithAnimatedValue<ViewStyle> => ({
    width: controlSize,
    height: controlSize,
    borderRadius: controlRadius,
    borderWidth: focused ? t.borderWidthFocus : controlBorderWidth,
    borderColor: focused
      ? t.colorBorderFocus
      : isInvalid
        ? controlBorderInvalid
        : anim.interpolate({ inputRange: [0, 1], outputRange: [t.colorControlBorder, t.colorControlSelectedBackground] }),
    backgroundColor: t.colorControlBackground,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const dotStyle = (anim: Animated.Value): Animated.WithAnimatedValue<ViewStyle> => ({
    width: dotSize,
    height: dotSize,
    borderRadius: controlRadius,
    backgroundColor: t.colorControlSelectedBackground,
    opacity: anim,
  });

  const textColumnStyle: ViewStyle = {
    flexShrink: 1,
    flexDirection: 'column',
    gap: t.space1,
  };

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const legendOverrides = { ...typographyOverrides, fontSize: overrides?.legendSize, fontWeight: overrides?.legendWeight };
  const labelOverrides = { ...typographyOverrides, fontSize: overrides?.labelSize, fontWeight: overrides?.labelWeight };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  return (
    <View
      testID="RadioGroup"
      ref={groupRef}
      accessibilityRole="radiogroup"
      accessibilityLabel={visibleLabel}
      accessibilityHint={description}
      accessibilityState={{ disabled: isDisabled }}
      style={groupStyle}
    >
      <Text weight="medium" overrides={legendOverrides}>
        {visibleLabel}
      </Text>
      {description !== undefined ? (
        <Text size="sm" tone="muted" overrides={helperOverrides}>
          {description}
        </Text>
      ) : null}
      <View style={listStyle}>
        {options.map((option) => {
          const selected = option.value === currentValue;
          const optionDisabled = isDisabled || option.disabled === true;
          const focused = focusedValue === option.value;
          const anim = getFillAnim(option.value, selected);
          const optionName = option.description !== undefined ? `${option.label}. ${option.description}` : option.label;
          return (
            <Pressable
              key={option.value}
              ref={option.value === firstEnabledValue ? firstEnabledRef : undefined}
              accessibilityRole="radio"
              accessibilityLabel={optionName}
              accessibilityState={{ checked: selected, disabled: optionDisabled }}
              onPress={() => {
                if (!optionDisabled) {
                  select(option.value);
                }
              }}
              onFocus={() => setFocusedValue(option.value)}
              onBlur={() => setFocusedValue((prev) => (prev === option.value ? null : prev))}
              style={optionStyle(optionDisabled)}
            >
              <Animated.View style={controlStyle(anim, focused)} accessibilityElementsHidden importantForAccessibility="no">
                <Animated.View style={dotStyle(anim)} />
              </Animated.View>
              <View style={textColumnStyle}>
                <Text overrides={labelOverrides}>{option.label}</Text>
                {option.description !== undefined ? (
                  <Text size="sm" tone="muted" overrides={helperOverrides}>
                    {option.description}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
