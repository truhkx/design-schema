import * as React from 'react';
import { AccessibilityInfo, Pressable, Switch as RNSwitch, View, findNodeHandle } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import { useTheme } from './theme';

export type SwitchLabelPosition = 'start' | 'end';

export interface SwitchProps {
  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  label: string;
  /** Optional field name. When inside a Form the checked state is collected as a boolean; most switches are not in forms. */
  name?: string;
  /** Controlled state. Omit for an uncontrolled control. */
  checked?: boolean;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean;
  /** Cannot be toggled. Stays visible, readable and focusable. */
  disabled?: boolean;
  /** Persistent helper text below the label explaining the effect. Also the `accessibilityHint`. */
  description?: string;
  /** Where the label sits relative to the track. `start` (label, then switch at the row end) is the settings-list convention; `end` matches Checkbox. */
  labelPosition?: SwitchLabelPosition;
  /** Fired when the state changes, with the new boolean (`events.onChange` → `onValueChange` on React Native, mirroring the native Switch). The change is already in effect; there is nothing to submit. */
  onValueChange?: (checked: boolean) => void;
}

/**
 * Switch — a light switch: flip it and the thing happens. That immediacy separates
 * it from a Checkbox, which records a choice to be submitted later.
 *
 * When to use: Use a Switch for a binary setting that applies as soon as it changes
 * and can be undone by flipping it back: notifications, dark mode, "show archived".
 * Use it in settings lists with `labelPosition: start` so the switches sit at the
 * row end. If a form of switches must have a Save button, they are checkboxes.
 *
 * Uses the native `Switch` for platform-native feel, with `accessibilityRole="switch"`,
 * `accessibilityLabel`, `accessibilityHint={description}`,
 * `accessibilityState={{ checked, disabled }}`, `trackColor={{ false: trackOff, true:
 * trackOn }}`, `thumbColor` and `ios_backgroundColor`. The row is a `Pressable` with
 * `accessible={false}` that toggles the value so the label is part of the target
 * while the Switch stays the single focusable element. Track and thumb sizes are the
 * OS values: the size tokens are documented but not applied, the OS animates the
 * thumb (and honours reduced motion) itself, and it draws its own focus indicator
 * because the native Switch has no focus events. With `name` inside a Form the switch
 * registers and contributes a boolean; it has no error state by design.
 */
export function Switch({
  label,
  name,
  checked,
  defaultChecked = false,
  disabled = false,
  description,
  labelPosition = 'start',
  onValueChange,
}: SwitchProps): React.JSX.Element {
  const { tokens } = useTheme();
  const form = useFormContext();
  const switchRef = React.useRef<RNSwitch>(null);
  const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked);

  const isChecked = checked ?? internalChecked;
  const isDisabled = disabled || (form?.disabled ?? false);

  const latest = React.useRef({ isChecked });
  latest.current = { isChecked };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => latest.current.isChecked,
      validate: () => null,
      focus: () => {
        const node = switchRef.current === null ? null : findNodeHandle(switchRef.current);
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
    if (register === undefined || unregister === undefined || name === undefined || isDisabled) {
      return undefined;
    }
    register(name, handle);
    return () => unregister(name);
  }, [register, unregister, name, handle, isDisabled]);

  const setValue = (next: boolean): void => {
    if (isDisabled || next === isChecked) {
      return;
    }
    if (checked === undefined) {
      setInternalChecked(next);
    }
    onValueChange?.(next);
  };

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space3,
    minHeight: tokens.sizeTargetComfortable,
    paddingVertical: tokens.space1,
    opacity: isDisabled ? tokens.opacityDisabled : 1,
  };

  const textColumnStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'column',
    gap: tokens.space1,
  };

  // The native Switch exposes no focus events, so the focus ring around the track
  // is drawn by the OS; this frame only keeps the thumbInset breathing room.
  const trackFrameStyle: ViewStyle = {
    padding: tokens.space1,
    borderRadius: tokens.radiusFull,
  };

  const labelColumn = (
    <View style={textColumnStyle}>
      <Text>{label}</Text>
      {description !== undefined ? (
        <Text size="sm" tone="muted">
          {description}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Pressable accessible={false} onPress={() => setValue(!isChecked)} style={rowStyle}>
      {labelPosition === 'start' ? labelColumn : null}
      <View style={trackFrameStyle}>
        <RNSwitch
          ref={switchRef}
          accessibilityRole="switch"
          accessibilityLabel={label}
          accessibilityHint={description}
          accessibilityState={{ checked: isChecked, disabled: isDisabled }}
          value={isChecked}
          disabled={isDisabled}
          trackColor={{ false: tokens.colorControlTrackOff, true: tokens.colorControlSelectedBackground }}
          thumbColor={tokens.colorControlSelectedForeground}
          ios_backgroundColor={tokens.colorControlTrackOff}
          onValueChange={setValue}
        />
      </View>
      {labelPosition === 'end' ? labelColumn : null}
    </Pressable>
  );
}
