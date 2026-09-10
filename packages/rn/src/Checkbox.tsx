import * as React from 'react';
import { AccessibilityInfo, Platform, Pressable, Text as RNText, View, findNodeHandle } from 'react-native';
import type { PressableStateCallbackType, TextStyle, ViewStyle } from 'react-native';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import { toFontWeight, toLineHeight, useTheme } from './theme';

export interface CheckboxProps {
  /** Visible label. Tapping it toggles the control. Also the `accessibilityLabel`. */
  label: string;
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
  /** Fired when the checked state changes, with the new boolean. */
  onChange?: (checked: boolean) => void;
}

const COPY = {
  required: (label: string): string => `${label} is required.`,
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
 * containing a `View` drawn with the control tokens and a `Text` label; the whole row
 * is the hit area and never drops below the comfortable target. Inside a Form the
 * control registers by `name` and contributes `value` when checked, nothing when
 * not; a `required` box that is unchecked fails submit with `copy.required`
 * (precedence: `error`, then `required`; `invalid` only marks the border). Inside a
 * Form, `validate: blur` means "on change" — there is no useful blur moment. Errors
 * are announced as in Input.
 */
export function Checkbox({
  label,
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
  onChange,
}: CheckboxProps): React.JSX.Element {
  const { tokens } = useTheme();
  const form = useFormContext();
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
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && !candidate) {
        return COPY.required(label);
      }
      return null;
    },
    [error, required, label],
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
  const indicatorSize = tokens.space5 - 2 * tokens.space1;

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space2,
    minHeight: tokens.sizeTargetComfortable,
    paddingVertical: tokens.space1,
    opacity: isDisabled ? tokens.opacityDisabled : 1,
  };

  const lineHeight = toLineHeight(tokens.fontSizeMd, tokens.fontLineHeightNormal);

  // The box sits in a fixed-height cell equal to the label's line height so the two
  // align on the first line even when the label wraps.
  const boxCellStyle: ViewStyle = {
    height: lineHeight,
    justifyContent: 'center',
  };

  const boxStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    width: tokens.space5,
    height: tokens.space5,
    borderRadius: tokens.radiusSm,
    borderWidth: focused ? tokens.borderWidthFocus : tokens.borderWidthThin,
    borderColor: focused
      ? tokens.colorBorderFocus
      : isInvalid
        ? tokens.colorBorderDanger
        : filled
          ? tokens.colorControlSelectedBackground
          : tokens.colorControlBorder,
    // pressedOverlay: while pressed the box shows the selected fill at opacity.disabled.
    backgroundColor:
      filled || (pressed && !isDisabled) ? tokens.colorControlSelectedBackground : tokens.colorControlBackground,
    opacity: pressed && !isDisabled ? tokens.opacityDisabled : 1,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const checkStyle: TextStyle = {
    color: tokens.colorControlSelectedForeground,
    fontSize: indicatorSize,
    lineHeight: indicatorSize,
    fontWeight: toFontWeight(tokens.fontWeightBold),
    includeFontPadding: false,
  };

  // indicatorStroke: the dash is a bar of the stroke thickness; the check mark is a
  // glyph whose weight approximates it.
  const dashStyle: ViewStyle = {
    width: indicatorSize,
    height: tokens.borderWidthFocus,
    backgroundColor: tokens.colorControlSelectedForeground,
  };

  const textColumnStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'column',
    gap: tokens.space1,
  };

  const errorStyle: ViewStyle = {
    marginTop: tokens.space1,
  };

  return (
    <View>
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
            <View style={boxCellStyle}>
              <View style={boxStyle(state)} accessibilityElementsHidden importantForAccessibility="no">
                {indeterminate ? (
                  <View style={dashStyle} />
                ) : isChecked ? (
                  <RNText allowFontScaling={false} style={checkStyle}>
                    ✓
                  </RNText>
                ) : null}
              </View>
            </View>
            <View style={textColumnStyle}>
              <Text>{visibleLabel}</Text>
              {description !== undefined ? (
                <Text size="sm" tone="muted">
                  {description}
                </Text>
              ) : null}
            </View>
          </>
        )}
      </Pressable>
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'} style={errorStyle}>
          <Text size="sm" tone="danger">
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
