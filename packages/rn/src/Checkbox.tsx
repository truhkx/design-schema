import * as React from 'react';
import { Animated, AccessibilityInfo, Platform, Pressable, StyleSheet, View, findNodeHandle } from 'react-native';
import type { PressableStateCallbackType, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFieldsetContext } from './Fieldset';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import { Text } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type CheckboxOverridableBinding =
  | 'controlBackground'
  | 'controlBorderWidth'
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
  hideLabel?: boolean | undefined;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** What a native HTML form submits when checked (web and Lit only). The enclosing Form ignores it and collects the boolean `checked`; checkboxes sharing a `name` are not a multi-select, so give each its own name. */
  value?: string | undefined;
  /** Controlled checked state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /** Shows the mixed indicator, for a parent checkbox whose children are partly selected. Visual and announced only; the submitted value still follows `checked`. */
  indeterminate?: boolean | undefined;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  disabled?: boolean | undefined;
  /** Must be checked to submit — for consent and agreement. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** Persistent helper text below the label. Also the `accessibilityHint`. */
  description?: string | undefined;
  /** The error message. Setting it marks the control invalid. Say what to do ("Accept the terms to continue"). */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the checked state changes, with the new boolean. */
  onChange?: ((checked: boolean) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
} as const;

/** The DOM element react-native-web renders for the row; this package has no DOM lib. */
type WebElement = { setAttribute(name: string, value: string): void; removeAttribute(name: string): void };

/**
 * Cross-fades from the previous target color to the new one over `duration`; instant under
 * reduced motion. A change mid-fade starts from the previous target rather than the in-between
 * color, which is invisible at `motion.duration.fast`.
 */
function useColorTransition(
  target: string,
  duration: number,
  easing: (value: number) => number,
  reducedMotion: boolean,
): Animated.AnimatedInterpolation<string> {
  const progress = React.useRef(new Animated.Value(1)).current;
  const [pair, setPair] = React.useState({ from: target, to: target });
  if (pair.to !== target) {
    setPair({ from: pair.to, to: target });
  }
  React.useLayoutEffect(() => {
    if (reducedMotion || pair.from === pair.to) {
      progress.setValue(1);
      return undefined;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration, easing, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [pair, reducedMotion, progress, duration, easing]);
  return progress.interpolate({ inputRange: [0, 1], outputRange: [pair.from, pair.to] });
}

/**
 * Checkbox — a single yes/no choice that the user makes and then submits, as
 * opposed to a Switch, which takes effect the moment it is flipped.
 *
 * When to use: Use a Checkbox for one independent option ("Remember me"), for terms
 * and consent (`required`), or several, each with its own `name`, when the user may
 * pick any number of items. Use `indeterminate` on a "select all" parent when only some
 * of its children are checked. Do not use it for a setting that applies immediately
 * (Switch) or to pick exactly one option (RadioGroup).
 *
 * There is no checkbox in core React Native. Renders a `Pressable` row with
 * `accessibilityRole="checkbox"`, `accessibilityLabel`, `accessibilityHint={description}`
 * and `accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}`, mirrored
 * to `aria-checked` (and, on react-native-web, `aria-disabled` set on the DOM node) because
 * react-native-web renders only the aria-* forms and `role="checkbox"` requires `aria-checked`.
 * `disabled` is never passed to `Pressable` itself — that would drop the row from the tab order —
 * so a disabled checkbox stays focusable and is announced as disabled while a press guard blocks
 * the toggle. It contains the drawn control (the `check`/`dash` `Icon`) and the label and
 * description, so the whole row — control, label or description — is the hit area and
 * never drops below the comfortable target. The row aligns to the start of the cross
 * axis and pads (minTarget − labelSize × lineHeight) / 2 above and below, so a single
 * line is exactly the comfortable target tall while a wrapping label or a description
 * grows it downwards with the control still centred on the label's first line (as
 * Switch). Space on a hardware keyboard is handled by the platform once the role is
 * set. The fill and border color cross-fade over `transition` with
 * `motion.easing.standard` (skipped under reduced motion); the indicator is not
 * animated — the check and dash Icons are mounted and unmounted, so they appear,
 * disappear and swap instantly. While pressed an unchecked, enabled box shows the
 * selected fill at `pressedOverlay` as an overlay inside the box, so the border does
 * not fade. Border color is invalid, then selected, then rest: focus draws the border
 * at the larger of `focusRingWidth` and `controlBorderWidth` and never hides
 * `controlBorderInvalid`, as in Input. Toggling an indeterminate checkbox clears the
 * mixed state until `indeterminate` changes value again. Inside a Form the control
 * registers by `name` and submits its checked state as a boolean (`value` is not used
 * on native); the error slot shows `error`, else the Form's message, else — only while
 * `invalid` — `copy.required` (required and unchecked) or `copy.invalid`, as in Input,
 * and `validate: blur` means on change. The error sits below the row, outside the hit
 * area, indented by controlSize + gap so it lines up with the label.
 * `disabledOpacity` dims the control and label, not the description or error. Inside a
 * Fieldset the group's `disabled` applies and the legend prefixes the accessibility
 * label. Errors are announced as in Input.
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
  ref,
}: CheckboxProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const fieldset = useFieldsetContext();
  const reducedMotion = useReducedMotion();
  const pressableRef = React.useRef<ViewInstance>(null);
  const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked);
  const [mixedCleared, setMixedCleared] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  // A new `indeterminate: true` brings the mixed state back after a toggle cleared it.
  React.useEffect(() => {
    setMixedCleared(false);
  }, [indeterminate]);

  const isChecked = checked ?? internalChecked;
  const isMixed = indeterminate && !mixedCleared;
  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
  const formError = form?.errors[name];
  const derivedError = invalid ? (required && !isChecked ? COPY.required(label) : COPY.invalid(label)) : undefined;
  const displayedError = error !== undefined && error !== '' ? error : (formError ?? derivedError);
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
      getValue: () => latest.current.isChecked,
      validate: () => latest.current.validateValue(latest.current.isChecked),
      focus: () => {
        const node = pressableRef.current === null ? null : findNodeHandle(pressableRef.current);
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
  // render, so a field that starts invalid is read in sequence instead of interrupting.
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

  // react-native-web's Pressable writes `aria-disabled` from its own `disabled` prop, after any
  // `aria-disabled` passed in, and passing `disabled` would also drop the row from the tab order —
  // which `accessibilityState.disabled` plus a press guard exists to avoid. So on web the attribute
  // is set on the DOM node itself: the row stays focusable and is still announced (and audited) as
  // disabled, which is also what keeps the dimmed label out of axe's contrast check, as in Button.
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const node = pressableRef.current as unknown as WebElement | null;
    if (node === null) {
      return;
    }
    if (isDisabled) {
      node.setAttribute('aria-disabled', 'true');
    } else {
      node.removeAttribute('aria-disabled');
    }
  }, [isDisabled]);

  const handlePress = (): void => {
    if (isDisabled) {
      return;
    }
    const next = !isChecked;
    if (checked === undefined) {
      setInternalChecked(next);
    }
    if (isMixed) {
      setMixedCleared(true);
    }
    onChange?.(next);
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  const accessibleName = fieldset !== null ? `${fieldset.legend}, ${visibleLabel}` : visibleLabel;
  const filled = isChecked || isMixed;

  const controlBackground = overrides?.controlBackground ? (resolveToken(t, overrides.controlBackground) as string) : t.colorControlBackground;
  const controlBorderWidth = overrides?.controlBorderWidth ? (resolveToken(t, overrides.controlBorderWidth) as number) : t.borderWidthThin;
  const pressedOverlay = overrides?.pressedOverlay ? (resolveToken(t, overrides.pressedOverlay) as number) : t.opacityDisabled;
  const controlBorderInvalid = overrides?.controlBorderInvalid ? (resolveToken(t, overrides.controlBorderInvalid) as string) : t.colorBorderDanger;
  const controlSize = overrides?.controlSize ? (resolveToken(t, overrides.controlSize) as number) : t.space5;
  const controlRadius = overrides?.controlRadius ? (resolveToken(t, overrides.controlRadius) as number) : t.radiusSm;
  const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.space2;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const labelSize = overrides?.labelSize ? (resolveToken(t, overrides.labelSize) as number) : t.fontSizeMd;
  const lineHeight = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;

  // Fill and border color cross-fade in every state — check, invalid and focus alike;
  // the pressed overlay and the indicator are instant. Border color precedence: invalid,
  // then focus (native draws focus on the border), then selected, then rest.
  const easing = React.useMemo(() => toEasing(t.motionEasingStandard), [t.motionEasingStandard]);
  const backgroundTarget = filled ? t.colorControlSelectedBackground : controlBackground;
  const borderTarget = isInvalid
    ? controlBorderInvalid
    : focused
      ? t.colorBorderFocus
      : filled
        ? t.colorControlSelectedBackground
        : t.colorControlBorder;
  const animatedBackground = useColorTransition(backgroundTarget, transitionDuration, easing, reducedMotion);
  const animatedBorderColor = useColorTransition(borderTarget, transitionDuration, easing, reducedMotion);

  const rootStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
  };

  // The row is exactly minTarget tall for a single line: it pads the difference
  // between the target and the label's first line above and below, and grows
  // downwards from there.
  const firstLine = toLineHeight(labelSize, lineHeight);
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap,
    minHeight: t.sizeTargetComfortable,
    paddingVertical: Math.max(0, (t.sizeTargetComfortable - firstLine) / 2),
  };

  // The control sits in a slot as tall as the label's first line and is centred in it,
  // so a wrapping label or a description never pulls it off that line. With `hideLabel`
  // the slot is the only content, so the control stays centred in the row.
  const controlSlotStyle: ViewStyle = {
    height: firstLine,
    justifyContent: 'center',
  };

  // Dims the control (with its indicator) and the label; description and error stay readable.
  const dimStyle: ViewStyle = { opacity: isDisabled ? disabledOpacity : 1 };

  // Border color precedence: invalid, then selected, then rest. Focus never hides the
  // invalid color — only the width changes, and never to less than the rest width.
  const controlStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: controlSize,
    height: controlSize,
    borderRadius: controlRadius,
    borderWidth: focused ? Math.max(t.borderWidthFocus, controlBorderWidth) : controlBorderWidth,
    borderColor: animatedBorderColor,
    backgroundColor: animatedBackground,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: dimStyle.opacity,
  };

  // Only an unchecked, not-mixed, enabled box shows the pressed overlay; a filled one has nothing to add.
  const overlayStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    ...StyleSheet.absoluteFill,
    backgroundColor: t.colorControlSelectedBackground,
    opacity: pressed && !filled && !isDisabled ? pressedOverlay : 0,
  });

  const textColumnStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'column',
    gap: partGap,
  };

  // Outside the hit area, and indented past the control so it lines up with the label.
  const errorStyle: ViewStyle = { paddingStart: controlSize + gap };

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  return (
    <View ref={ref} testID="Checkbox" style={rootStyle}>
      <Pressable
        ref={pressableRef}
        accessibilityRole="checkbox"
        accessibilityLabel={accessibleName}
        aria-label={accessibleName}
        accessibilityHint={description}
        accessibilityState={{ checked: isMixed ? 'mixed' : isChecked, disabled: isDisabled }}
        // react-native-web 0.21 ignores `accessibilityState`, and `aria-checked` is required on
        // `role="checkbox"`, so the state reaches the DOM through this mirror (native merges both).
        // `aria-disabled` is set on the web node in an effect above.
        aria-checked={isMixed ? 'mixed' : isChecked}
        onPress={handlePress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={rowStyle}
      >
        {(state) => (
          <>
            <View style={controlSlotStyle}>
              <Animated.View testID="Checkbox.control" style={controlStyle} accessibilityElementsHidden importantForAccessibility="no">
                <View style={overlayStyle(state)} />
                {/* Nothing is rendered while unchecked: the glyph appears, disappears and swaps instantly. */}
                {filled ? (
                  <View testID="Checkbox.indicator">
                    <Icon name={isMixed ? 'dash' : 'check'} size="xs" overrides={{ color: 'color.control.selectedForeground' }} />
                  </View>
                ) : null}
              </Animated.View>
            </View>
            <View style={textColumnStyle}>
              {/* A hidden label still sets the line box, so the control stays on that line and a
                  description starts below it rather than beside the control. */}
              {hideLabel ? (
                <View testID="Checkbox.label" style={controlSlotStyle} />
              ) : (
                <View testID="Checkbox.label" style={dimStyle}>
                  <Text
                    size="md"
                    weight="regular"
                    tone="default"
                    overrides={{ ...typographyOverrides, fontSize: overrides?.labelSize, fontWeight: overrides?.labelWeight }}
                  >
                    {visibleLabel}
                  </Text>
                </View>
              )}
              {description !== undefined ? (
                <View testID="Checkbox.description">
                  <Text size="sm" tone="muted" overrides={helperOverrides}>
                    {description}
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        )}
      </Pressable>
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'} testID="Checkbox.errorMessage" style={errorStyle}>
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
