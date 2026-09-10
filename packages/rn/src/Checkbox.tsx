import * as React from 'react';
import { Animated, AccessibilityInfo, Platform, Pressable, View, findNodeHandle } from 'react-native';
import type { PressableStateCallbackType, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type CheckboxOverridableBinding =
  | 'controlBackground'
  | 'controlBorderWidth'
  | 'indicatorStroke'
  | 'pressedOverlay'
  | 'controlBorderInvalid'
  | 'controlSize'
  | 'controlRadius'
  | 'gap'
  | 'partGap'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

export interface CheckboxProps {
  /** Visible label. Tapping it toggles the control. Also the `accessibilityLabel`. */
  label: string;
  /** Visually hide the label (it remains the accessible name via `accessibilityLabel`): a selection column in a Table, where the row name is the label. */
  hideLabel?: boolean;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** The value submitted when checked. Lets several checkboxes share a `name` to form a multi-select. */
  value?: string;
  /** Controlled checked state. Omit for an uncontrolled control. */
  checked?: boolean;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean;
  /** Shows the mixed indicator, for a parent checkbox whose children are partly selected. Visual and announced only; the submitted value still follows `checked`. */
  indeterminate?: boolean;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  disabled?: boolean;
  /** Must be checked to submit — for consent and agreement. Shown in the label, not only by color. */
  required?: boolean;
  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean;
  /** Persistent helper text below the label. Also the `accessibilityHint`. */
  description?: string;
  /** The error message. Setting it marks the control invalid. Say what to do ("Accept the terms to continue"). */
  error?: string;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CheckboxOverridableBinding, TokenRef>>;
  /** Fired when the checked state changes, with the new boolean. */
  onChange?: (checked: boolean) => void;
}

const COPY = {
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
} as const;

/**
 * Checkbox — a single yes/no choice that the user makes and then submits, as
 * opposed to a Switch, which takes effect the moment it is flipped.
 *
 * When to use: Use a Checkbox for one independent option ("Remember me"), for terms
 * and consent (`required`), or several with the same `name` when the user may pick
 * any number of items. Use `indeterminate` on a "select all" parent when only some
 * of its children are checked. Do not use it for a setting that applies immediately
 * (Switch) or to pick exactly one option (RadioGroup).
 *
 * There is no checkbox in core React Native. Renders a `Pressable` with
 * `accessibilityRole="checkbox"`, `accessibilityLabel`, `accessibilityHint` and
 * `accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}`,
 * containing a drawn control (the `check`/`dash` `Icon`, since native has no
 * `currentColor`) and a `Text` label; the whole row is the hit area and never drops
 * below the comfortable target. The fill, border and indicator cross-fade between
 * unchecked and checked/indeterminate over `transition` with `motion.easing.standard`
 * (skipped under reduced motion); the pressed state shows the selected fill at
 * `pressedOverlay` instantly. Inside a Form the control registers by `name` and
 * contributes `value` when checked, nothing when not; validation precedence is
 * `error`, then `required` (`copy.required`), then `invalid` (`copy.invalid`), same
 * as Input. Inside a Form, `validate: blur` means "on change" — there is no useful
 * blur moment. Errors are announced as in Input.
 */
export function Checkbox({
  label,
  hideLabel = false,
  name,
  value = 'on',
  checked,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  required = false,
  invalid = false,
  description,
  error,
  overrides,
  onChange,
}: CheckboxProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();
  const pressableRef = React.useRef<View>(null);
  const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked);
  const [focused, setFocused] = React.useState(false);

  const isChecked = checked ?? internalChecked;
  const isDisabled = disabled || (form?.disabled ?? false);
  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  const validateValue = React.useCallback(
    (candidate: boolean): string | null => {
      // Precedence: `error` prop, then `required`, then `invalid`.
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && !candidate) {
        return COPY.required(label);
      }
      if (invalid) {
        return COPY.invalid(label);
      }
      return null;
    },
    [error, required, invalid, label],
  );

  const latest = React.useRef({ isChecked, value, validateValue });
  latest.current = { isChecked, value, validateValue };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => (latest.current.isChecked ? latest.current.value : undefined),
      validate: () => latest.current.validateValue(latest.current.isChecked),
      focus: () => {
        const node = pressableRef.current === null ? null : findNodeHandle(pressableRef.current);
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

  const handlePress = (): void => {
    if (isDisabled) {
      return;
    }
    const next = !isChecked;
    if (checked === undefined) {
      setInternalChecked(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  const filled = isChecked || indeterminate;

  const controlBackground = overrides?.controlBackground ? (resolveToken(t, overrides.controlBackground) as string) : t.colorControlBackground;
  const controlBorderWidth = overrides?.controlBorderWidth ? (resolveToken(t, overrides.controlBorderWidth) as number) : t.borderWidthThin;
  const pressedOverlay = overrides?.pressedOverlay ? (resolveToken(t, overrides.pressedOverlay) as number) : t.opacityDisabled;
  const controlBorderInvalid = overrides?.controlBorderInvalid ? (resolveToken(t, overrides.controlBorderInvalid) as string) : t.colorBorderDanger;
  const controlSize = overrides?.controlSize ? (resolveToken(t, overrides.controlSize) as number) : t.space5;
  const controlRadius = overrides?.controlRadius ? (resolveToken(t, overrides.controlRadius) as number) : t.radiusSm;
  const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.space2;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;

  // Fill, border and indicator cross-fade together between unchecked and
  // checked/indeterminate; the pressed overlay below is instant, not part of this.
  const fillAnim = React.useRef(new Animated.Value(filled ? 1 : 0)).current;
  React.useEffect(() => {
    const toValue = filled ? 1 : 0;
    if (reducedMotion) {
      fillAnim.setValue(toValue);
      return;
    }
    Animated.timing(fillAnim, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [filled, reducedMotion, fillAnim, transitionDuration, t.motionEasingStandard]);

  const animatedBackground = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [controlBackground, t.colorControlSelectedBackground] });
  const animatedBorderColor = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [t.colorControlBorder, t.colorControlSelectedBackground] });

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap,
    minHeight: t.sizeTargetComfortable,
    paddingVertical: t.space1,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const boxStyle = ({ pressed }: PressableStateCallbackType): Animated.WithAnimatedObject<ViewStyle> => ({
    width: controlSize,
    height: controlSize,
    borderRadius: controlRadius,
    borderWidth: focused ? t.borderWidthFocus : controlBorderWidth,
    borderColor: focused ? t.colorBorderFocus : isInvalid ? controlBorderInvalid : animatedBorderColor,
    backgroundColor: pressed && !isDisabled ? t.colorControlSelectedBackground : animatedBackground,
    opacity: pressed && !isDisabled ? pressedOverlay : 1,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const indicatorStyle: Animated.WithAnimatedObject<ViewStyle> = { opacity: fillAnim };

  const textColumnStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'column',
    gap: partGap,
  };

  const errorStyle: ViewStyle = {
    marginTop: partGap,
  };

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  return (
    <View testID="Checkbox">
      <Pressable
        ref={pressableRef}
        accessibilityRole="checkbox"
        accessibilityLabel={visibleLabel}
        accessibilityHint={description}
        accessibilityState={{ checked: indeterminate ? 'mixed' : isChecked, disabled: isDisabled }}
        onPress={handlePress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={rowStyle}
      >
        {(state) => (
          <>
            <Animated.View style={boxStyle(state)} accessibilityElementsHidden importantForAccessibility="no">
              <Animated.View style={indicatorStyle}>
                <Icon
                  name={indeterminate ? 'dash' : 'check'}
                  size="xs"
                  color={t.colorControlSelectedForeground}
                  overrides={{ strokeWidth: overrides?.indicatorStroke }}
                />
              </Animated.View>
            </Animated.View>
            <View style={textColumnStyle}>
              {hideLabel ? null : (
                <Text overrides={{ ...typographyOverrides, fontSize: overrides?.labelSize, fontWeight: overrides?.labelWeight }}>
                  {visibleLabel}
                </Text>
              )}
              {description !== undefined ? (
                <Text size="sm" tone="muted" overrides={helperOverrides}>
                  {description}
                </Text>
              ) : null}
            </View>
          </>
        )}
      </Pressable>
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'} style={errorStyle}>
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
