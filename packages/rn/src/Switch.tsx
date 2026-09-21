import * as React from 'react';
import { AccessibilityInfo, Platform, Pressable, Switch as RNSwitch, View, findNodeHandle } from 'react-native';
import type { SwitchInstance, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFieldsetContext } from './Fieldset';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';

export type SwitchLabelPosition = 'start' | 'end';

/** The DOM element react-native-web renders for the row; this package has no DOM lib. */
type WebElement = { setAttribute(name: string, value: string): void; removeAttribute(name: string): void };

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `trackWidth`, `trackHeight`, `thumbSize`, `thumbInset`, `radius`
 * and `transition` are drawn and animated by the native `Switch` on React Native and are
 * excluded here, since an override on them would be a silent no-op.
 */
export type SwitchOverridableBinding =
  | 'gap'
  | 'partGap'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity';

export interface SwitchProps {
  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  label: string;
  /** Optional field name. When inside a Form the state is collected as a boolean; most switches are not in forms. A Switch never validates. */
  name?: string | undefined;
  /** Controlled state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /** Cannot be toggled. Stays visible and readable; the native Switch is not focusable while disabled (platform limit). */
  disabled?: boolean | undefined;
  /** Persistent helper text below the label explaining the effect. Also the `accessibilityHint`. */
  description?: string | undefined;
  /** Where the label sits relative to the track. `start` (label, then switch at the row end) is the settings-list convention; `end` matches Checkbox. */
  labelPosition?: SwitchLabelPosition | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the state changes, with the new boolean (`events.onChange`). The change is already in effect; there is nothing to submit. */
  onValueChange?: ((checked: boolean) => void) | undefined;
  /** The root view (the row). */
  ref?: React.Ref<ViewInstance> | undefined;
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
 * Uses the native `Switch` with `accessibilityRole="switch"` (native only — on
 * react-native-web the rendered `<input type="checkbox" role="switch">` already carries
 * the role, and a second one on its container would have no state and a focusable
 * descendant), `accessibilityLabel`, `accessibilityHint={description}`,
 * `accessibilityState={{ checked, disabled }}`,
 * `trackColor={{ false: trackOff, true: trackOn }}`, `thumbColor` and
 * `ios_backgroundColor={trackOff}`. The row is a `Pressable` with `accessible={false}`
 * and `tabIndex={-1}` that toggles the value, so label and description are part of the
 * target while the Switch stays the single focusable element; the row is at least the comfortable
 * target tall with no padding, and centres its content in that height, so a one-line
 * row sits in the middle while a wrapping label or a description grows it downwards
 * with the track still on the label's first line. Track and thumb sizes, radius, thumb travel, its animation (and reduced
 * motion) and the focus indicator are the OS values. With `name` inside a Form the
 * switch registers and contributes a boolean; it has no error state by design. Inside
 * a Fieldset the group's `disabled` applies and the legend prefixes the label.
 */
export function Switch({
  label,
  name,
  checked,
  defaultChecked = false,
  disabled = false,
  description,
  labelPosition = 'start',
  overrides,
  onValueChange,
  ref,
}: SwitchProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const fieldset = useFieldsetContext();
  const switchRef = React.useRef<SwitchInstance>(null);
  const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked);

  // The root is owned here so react-native-web can be given `aria-disabled` directly (below);
  // the caller's `ref` still receives the same Pressable.
  const rootRef = React.useRef<ViewInstance>(null);
  React.useImperativeHandle(ref, () => rootRef.current!, []);

  const isChecked = checked ?? internalChecked;
  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
  const accessibleName = fieldset !== null ? `${fieldset.legend}, ${label}` : label;

  const latest = React.useRef({ isChecked });
  latest.current = { isChecked };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => latest.current.isChecked,
      validate: () => null,
      focus: () => {
        const node = switchRef.current === null ? null : findNodeHandle(switchRef.current);
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
    if (register === undefined || unregister === undefined || name === undefined || isDisabled) {
      return undefined;
    }
    register(name, handle);
    return () => unregister(name);
  }, [register, unregister, name, handle, isDisabled]);

  // The row is dimmed as a whole (disabledOpacity covers track, label and description), so on
  // react-native-web its text would fail axe's contrast check while reading as enabled. The row
  // Pressable cannot take `disabled` — only the native Switch does — and react-native-web's
  // Pressable overwrites any `aria-disabled` passed in with its own `disabled` prop, so the
  // attribute is set on the DOM node itself, as in Button and Checkbox: the row is announced
  // disabled and its dimmed text is audited as part of a disabled control rather than as body copy.
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const node = rootRef.current as unknown as WebElement | null;
    if (node === null) {
      return;
    }
    if (isDisabled) {
      node.setAttribute('aria-disabled', 'true');
    } else {
      node.removeAttribute('aria-disabled');
    }
  }, [isDisabled]);

  const setValue = (next: boolean): void => {
    if (isDisabled || next === isChecked) {
      return;
    }
    if (checked === undefined) {
      setInternalChecked(next);
    }
    onValueChange?.(next);
  };

  const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.space3;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const labelSize = overrides?.labelSize ? (resolveToken(t, overrides.labelSize) as number) : t.fontSizeMd;
  const lineHeight = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;

  // The row has no padding: it is at least minTarget tall and centres its content box
  // in that height, so a single line is vertically centred in the comfortable target
  // while a description or a wrapping label grows the row downwards from there.
  // The opacity dims the track (with its thumb), the label and the description together.
  const rowStyle: ViewStyle = {
    justifyContent: 'center',
    minHeight: t.sizeTargetComfortable,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  // Track slot and text column, aligned to the top of the content box.
  const contentStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap,
  };

  // The track sits in a slot one label line tall and is centred in it, so a wrapping
  // label or a description never pulls it off that line. The native Switch is taller
  // than the slot (about 31pt on iOS) and spills evenly above and below it; the row's
  // minHeight still contains it.
  const trackSlotStyle: ViewStyle = {
    height: toLineHeight(labelSize, lineHeight),
    justifyContent: 'center',
  };

  const textColumnStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'column',
    gap: partGap,
  };

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  const labelColumn = (
    <View style={textColumnStyle}>
      <View testID="Switch.label">
        <Text
          size="md"
          weight="regular"
          tone="default"
          overrides={{ ...typographyOverrides, fontSize: overrides?.labelSize, fontWeight: overrides?.labelWeight }}
        >
          {label}
        </Text>
      </View>
      {description !== undefined ? (
        <View testID="Switch.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <Pressable
      ref={rootRef}
      testID="Switch"
      accessible={false}
      // The Switch is the single focusable element: react-native-web's Pressable makes its row a
      // tab stop (tabIndex 0) unless one is given, which would put an unnamed, roleless stop in
      // front of the control. `focusable` cannot do this — Pressable always passes its own tabIndex.
      tabIndex={-1}
      onPress={() => setValue(!isChecked)}
      style={rowStyle}
    >
      <View style={contentStyle}>
        {labelPosition === 'start' ? labelColumn : null}
        <View style={trackSlotStyle}>
          <RNSwitch
            ref={switchRef}
            testID="Switch.track"
            // react-native-web's Switch is a container View holding the real
            // `<input type="checkbox" role="switch">`, and spreads the accessibility props onto
            // that container: `accessibilityRole` would put a second role="switch" on it, with no
            // aria-checked of its own (aria-required-attr) and the input focusable inside it
            // (nested-interactive). The input already carries the role, the name and the state, so
            // the role is set on native only, where it is what makes the Switch announce as one.
            accessibilityRole={Platform.OS === 'web' ? undefined : 'switch'}
            accessibilityLabel={accessibleName}
            accessibilityHint={description}
            accessibilityState={{ checked: isChecked, disabled: isDisabled }}
            value={isChecked}
            disabled={isDisabled}
            trackColor={{ false: t.colorControlTrackOff, true: t.colorControlSelectedBackground }}
            thumbColor={t.colorControlSelectedForeground}
            ios_backgroundColor={t.colorControlTrackOff}
            onValueChange={setValue}
          />
        </View>
        {labelPosition === 'end' ? labelColumn : null}
      </View>
    </Pressable>
  );
}
