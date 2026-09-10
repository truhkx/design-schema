import * as React from 'react';
import { AccessibilityInfo, Platform, Pressable, View, findNodeHandle } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

export interface RadioGroupProps {
  /** The group's legend — the question the options answer. Always visible. Also the group's `accessibilityLabel`. */
  label: string;
  /** Field name used by the enclosing Form. */
  name: string;
  /** The options in display order. Two to about seven; more than that is a Select (planned). */
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  /** Controlled selected value. Omit for an uncontrolled group. */
  value?: string;
  /** Initial selection for an uncontrolled group. Omit to start with nothing selected. */
  defaultValue?: string;
  /** Layout of the options. Horizontal only for two or three short labels; it wraps rather than overflows. */
  orientation?: RadioGroupOrientation;
  /** An option must be selected to submit. Shown in the legend, not only by color. */
  required?: boolean;
  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean;
  /** Disables every option. Individual options use `options[].disabled`. */
  disabled?: boolean;
  /** Persistent helper text under the legend. Also the group's `accessibilityHint`. */
  description?: string;
  /** The group's error message. Setting it marks the group invalid. */
  error?: string;
  /** Fired when the selection changes, with the new option value. */
  onChange?: (value: string) => void;
}

/** One option of a RadioGroup — the element type of the schema's `options` shape. */
export type RadioOption = RadioGroupProps['options'][number];

const COPY = {
  required: (label: string): string => `${label} is required.`,
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
 * the platform convention. Individually disabled options are natively disabled and
 * skipped; a fully `disabled` group stays reachable but inert. Inside a Form the
 * group registers by `name` and contributes the selected value (no key when nothing
 * is selected); `required` with nothing selected fails submit with `copy.required`
 * (precedence: `error`, then `required`; `invalid` only marks the controls) and
 * focus moves to the first enabled radio. `validate: blur` runs on change, since a
 * group-level blur does not exist on native. The group error is announced as in Input.
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
  onChange,
}: RadioGroupProps): React.JSX.Element {
  const { tokens } = useTheme();
  const form = useFormContext();
  const groupRef = React.useRef<View>(null);
  const firstEnabledRef = React.useRef<View>(null);
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
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && candidate === undefined) {
        return COPY.required(label);
      }
      return null;
    },
    [error, required, label],
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
        if (node !== null) {
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
  const dotSize = tokens.space5 - 2 * tokens.space1;
  const lineHeight = toLineHeight(tokens.fontSizeMd, tokens.fontLineHeightNormal);

  const groupStyle: ViewStyle = {
    flexDirection: 'column',
    gap: tokens.space1,
    opacity: isDisabled ? tokens.opacityDisabled : 1,
  };

  const listStyle: ViewStyle = {
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    gap: tokens.space2,
  };

  const optionStyle = (optionDisabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space2,
    minHeight: tokens.sizeTargetComfortable,
    paddingVertical: tokens.space1,
    opacity: optionDisabled && !isDisabled ? tokens.opacityDisabled : 1,
  });

  const controlCellStyle: ViewStyle = {
    height: lineHeight,
    justifyContent: 'center',
  };

  const controlStyle = (selected: boolean, focused: boolean): ViewStyle => ({
    width: tokens.space5,
    height: tokens.space5,
    borderRadius: tokens.radiusFull,
    borderWidth: focused ? tokens.borderWidthFocus : tokens.borderWidthThin,
    borderColor: focused
      ? tokens.colorBorderFocus
      : isInvalid
        ? tokens.colorBorderDanger
        : selected
          ? tokens.colorControlSelectedBackground
          : tokens.colorControlBorder,
    backgroundColor: tokens.colorControlBackground,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const dotStyle: ViewStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: tokens.radiusFull,
    backgroundColor: tokens.colorControlSelectedBackground,
  };

  const textColumnStyle: ViewStyle = {
    flexShrink: 1,
    flexDirection: 'column',
    gap: tokens.space1,
  };

  return (
    <View
      ref={groupRef}
      accessibilityRole="radiogroup"
      accessibilityLabel={visibleLabel}
      accessibilityHint={description}
      style={groupStyle}
    >
      <Text weight="medium">{visibleLabel}</Text>
      {description !== undefined ? (
        <Text size="sm" tone="muted">
          {description}
        </Text>
      ) : null}
      <View style={listStyle}>
        {options.map((option) => {
          const selected = option.value === currentValue;
          const optionDisabled = isDisabled || option.disabled === true;
          const focused = focusedValue === option.value;
          const optionName =
            option.description !== undefined ? `${option.label}. ${option.description}` : option.label;
          return (
            <Pressable
              key={option.value}
              ref={option.value === firstEnabledValue ? firstEnabledRef : undefined}
              accessibilityRole="radio"
              accessibilityLabel={optionName}
              accessibilityState={{ checked: selected, disabled: optionDisabled }}
              // Individually disabled options are natively disabled (not focus stops),
              // a deliberate exception; a fully disabled group stays focusable but inert.
              disabled={option.disabled === true}
              onPress={() => {
                if (!optionDisabled) {
                  select(option.value);
                }
              }}
              onFocus={() => setFocusedValue(option.value)}
              onBlur={() => setFocusedValue((prev) => (prev === option.value ? null : prev))}
              style={optionStyle(optionDisabled)}
            >
              <View style={controlCellStyle}>
                <View style={controlStyle(selected, focused)} accessibilityElementsHidden importantForAccessibility="no">
                  {selected ? <View style={dotStyle} /> : null}
                </View>
              </View>
              <View style={textColumnStyle}>
                <Text>{option.label}</Text>
                {option.description !== undefined ? (
                  <Text size="sm" tone="muted">
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
          <Text size="sm" tone="danger">
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
