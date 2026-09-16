import * as React from 'react';
import { AccessibilityInfo, Platform, TextInput, View, findNodeHandle } from 'react-native';
import type {
  GestureResponderEvent,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  TextInputFocusEvent,
  TextInputInstance,
  TextInputProps,
  TextStyle,
  ViewInstance,
  ViewStyle,
} from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFieldsetContext } from './Fieldset';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
export type InputSize = 'sm' | 'md';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type InputOverridableBinding =
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'partGap'
  | 'fontFamily'
  | 'fontSize'
  | 'labelWeight'
  | 'helperSize'
  | 'lineHeight'
  | 'disabledOpacity';

export interface InputProps {
  /** Visible label (visually hidden with `hideLabel`). Never replaced by a placeholder. Also the field's `accessibilityLabel`. */
  label: string;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** Controlled value. Omit for an uncontrolled field. */
  value?: string | undefined;
  /** Initial value for an uncontrolled field. */
  defaultValue?: string | undefined;
  /** Example input shown while empty. Never the only description of what to enter. */
  placeholder?: string | undefined;
  /** Persistent helper text below the label explaining format or purpose. Also the field's `accessibilityHint`. */
  description?: string | undefined;
  /** Input type. Drives the keyboard on touch platforms (`keyboardType`, `textContentType`, `secureTextEntry`). */
  type?: InputType | undefined;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: InputSize | undefined;
  /** Not editable and not submitted. Stays visible and readable. */
  disabled?: boolean | undefined;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view (label, description, field and error group), so a parent can measure it. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Supplementary description forwarded to the field; Tooltip sets it when it describes the field. Read after `description`. */
  accessibilityHint?: string | undefined;
  /** Set by a parent (Tooltip, when its content *is* the name) to replace the name the label would give. */
  accessibilityLabel?: string | undefined;
  /** Fired on every value change with the new string value. */
  onChange?: ((value: string) => void) | undefined;
  /** Fired when the field receives focus. */
  onFocus?: ((event: TextInputFocusEvent) => void) | undefined;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: ((event: TextInputFocusEvent) => void) | undefined;
  /** Forwarded to the field (pointer enter; react-native-web pointer only) so Tooltip can attach to it. */
  onHoverIn?: TextInputProps['onPointerEnter'];
  /** Forwarded to the field (pointer leave; react-native-web pointer only) so Tooltip can attach to it. */
  onHoverOut?: TextInputProps['onPointerLeave'];
  /** Forwarded to the field so Tooltip can open on long press. */
  onLongPress?: ((event: GestureResponderEvent) => void) | undefined;
  /** Forwarded to the field so Tooltip can close when the press ends. */
  onPressOut?: ((event: GestureResponderEvent) => void) | undefined;
}

const KEYBOARD_TYPE: Record<InputType, KeyboardTypeOptions> = {
  text: 'default',
  email: 'email-address',
  password: 'default',
  number: 'numeric',
  search: 'default',
  tel: 'phone-pad',
  url: 'url',
};

const TEXT_CONTENT_TYPE: Record<InputType, TextInputProps['textContentType']> = {
  text: 'none',
  email: 'emailAddress',
  password: 'password',
  number: 'none',
  search: 'none',
  tel: 'telephoneNumber',
  url: 'URL',
};

/** Types whose values must not be auto-capitalized or auto-corrected by the keyboard. */
const VERBATIM_TYPES: ReadonlySet<InputType> = new Set<InputType>(['email', 'password', 'url']);

const FONT_SIZE_TOKEN = { sm: 'fontSizeSm', md: 'fontSizeMd' } as const satisfies Record<InputSize, keyof Tokens>;
const PADDING_INLINE_TOKEN = { sm: 'space2', md: 'spaceMd' } as const satisfies Record<InputSize, keyof Tokens>;
const PADDING_BLOCK_TOKEN = { sm: 'space1', md: 'spaceSm' } as const satisfies Record<InputSize, keyof Tokens>;
const MIN_TARGET_TOKEN = { sm: 'sizeTargetMin', md: 'sizeTargetComfortable' } as const satisfies Record<InputSize, keyof Tokens>;

/** TextInput has no long-press event; this matches Pressable's default `delayLongPress`. */
const LONG_PRESS_DELAY_MS = 500; // literal-ok: React Native's own long-press threshold, not a design token

const COPY = {
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
} as const;

/**
 * Input — collects a single line of text, bundling label, helper text, field and
 * error message so their association is always correct.
 *
 * When to use: names, emails, passwords, search terms and short free-text values.
 * Choose `type` so the touch keyboard matches; provide `description` when the
 * format matters. Not for multi-line content, a fixed set of choices, or on/off
 * values, and never with `placeholder` standing in for the label.
 *
 * Renders a `Text` label, optional description, a `TextInput`, and an error `Text`.
 * The label is also passed as `accessibilityLabel`, description as
 * `accessibilityHint`, and `accessibilityState={{ disabled }}`. `type` maps to
 * `keyboardType`, `textContentType` and `secureTextEntry`. Errors are announced
 * with `accessibilityLiveRegion` (Android) and
 * `AccessibilityInfo.announceForAccessibility` (iOS). Inside a Form the field
 * registers `{ getValue, validate, focus }` by `name` (precedence: `error`, then
 * `required`, then `invalid`); a disabled field is not registered. The border is
 * the focus ring: focus widens it to `focusRingWidth` and padding shrinks by the
 * difference so the field never shifts; an invalid field keeps its danger color
 * while focused. `disabled` dims the whole group with `disabledOpacity`. Inside a
 * Fieldset the group's `disabled` applies as if set on the field and the legend
 * prefixes the `accessibilityLabel` ("Shipping address, Street"). `size: sm` swaps
 * padding and the target height for their Sm bindings and the type to
 * `font.size.sm`. `accessibilityHint`, `accessibilityLabel`, `onHoverIn`,
 * `onHoverOut`, `onFocus`, `onBlur`, `onLongPress` and `onPressOut` reach the
 * native field so Tooltip can attach to it.
 */
export function Input({
  label,
  name,
  value,
  defaultValue,
  placeholder,
  description,
  type = 'text',
  required = false,
  hideLabel = false,
  size = 'md',
  disabled = false,
  invalid = false,
  error,
  overrides,
  ref,
  accessibilityHint,
  accessibilityLabel,
  onChange,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  onLongPress,
  onPressOut,
}: InputProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const fieldset = useFieldsetContext();
  const inputRef = React.useRef<TextInputInstance>(null);
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
  const [focused, setFocused] = React.useState(false);

  const currentValue = value ?? internalValue;
  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  const validateValue = React.useCallback(
    (candidate: string): string | null => {
      // Precedence: `error` prop, then `required`, then `invalid`.
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && candidate.trim() === '') {
        return COPY.required(label);
      }
      if (invalid) {
        return COPY.invalid(label);
      }
      return null;
    },
    [required, label, error, invalid],
  );

  // A stable handle whose methods read the latest render, so re-registering never
  // reorders the Form's field list.
  const latest = React.useRef({ currentValue, validateValue });
  latest.current = { currentValue, validateValue };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => latest.current.currentValue,
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: () => {
        const input = inputRef.current;
        if (input === null) {
          return;
        }
        input.focus();
        const node = findNodeHandle(input);
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

  // iOS: announce an error the moment it appears, unless the Form's summary already does.
  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  React.useEffect(
    () => () => {
      if (longPressTimer.current !== null) {
        clearTimeout(longPressTimer.current);
      }
    },
    [],
  );

  const handleChangeText = (next: string): void => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode === 'change') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const handleFocus = (event: TextInputFocusEvent): void => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: TextInputFocusEvent): void => {
    setFocused(false);
    onBlur?.(event);
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, validateValue(currentValue));
    }
  };

  const handlePressIn = (event: GestureResponderEvent): void => {
    if (onLongPress === undefined) {
      return;
    }
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      onLongPress(event);
    }, LONG_PRESS_DELAY_MS);
  };

  const handlePressOut = (event: GestureResponderEvent): void => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    onPressOut?.(event);
  };

  const position = form === null ? -1 : form.order.indexOf(name);
  const isLast = form !== null && position !== -1 && position === form.order.length - 1;
  const nextName = form !== null && position !== -1 ? form.order[position + 1] : undefined;
  const returnKeyType: ReturnKeyTypeOptions | undefined = form === null ? undefined : isLast ? 'done' : 'next';

  const handleSubmitEditing = (): void => {
    if (form === null) {
      return;
    }
    if (isLast) {
      form.submit();
    } else if (nextName !== undefined) {
      form.focusField(nextName);
    }
  };

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  const ownName = accessibilityLabel ?? visibleLabel;
  const accessibleName = fieldset !== null ? `${fieldset.legend}, ${ownName}` : ownName;
  const hints = [description, accessibilityHint].filter((part): part is string => part !== undefined && part !== '');
  const accessibleHint = hints.length > 0 ? hints.join(' ') : undefined;

  const borderInvalidColor = overrides?.borderInvalid ? (resolveToken(t, overrides.borderInvalid) as string) : t.colorBorderDanger;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t[PADDING_INLINE_TOKEN[size]];
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[PADDING_BLOCK_TOKEN[size]];
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  // The border is the focus ring: focus widens it to the locked `focusRingWidth` and
  // padding shrinks by the difference so the field never shifts. An invalid field keeps
  // its danger color while focused, so focus never hides the error.
  const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
  const inset = activeBorderWidth - borderWidth;
  const borderColor = isInvalid ? borderInvalidColor : focused ? t.colorBorderFocus : t.colorBorderStrong;

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const fieldStyle: TextStyle = {
    minHeight: t[MIN_TARGET_TOKEN[size]],
    backgroundColor: t.colorBackground,
    color: t.colorForeground,
    borderWidth: activeBorderWidth,
    borderColor,
    borderRadius: radius,
    paddingHorizontal: Math.max(0, paddingInline - inset),
    paddingVertical: Math.max(0, paddingBlock - inset),
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
  };

  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };

  return (
    <View ref={ref} style={containerStyle} testID="Input">
      {hideLabel ? null : (
        <View testID="Input.label">
          <Text
            size={size}
            weight="medium"
            overrides={{ fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, fontWeight: overrides?.labelWeight, lineHeight: overrides?.lineHeight }}
          >
            {visibleLabel}
          </Text>
        </View>
      )}
      {description !== undefined && description !== '' ? (
        <View testID="Input.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <TextInput
        ref={inputRef}
        testID="Input.field"
        accessibilityLabel={accessibleName}
        accessibilityHint={accessibleHint}
        accessibilityState={{ disabled: isDisabled }}
        keyboardType={KEYBOARD_TYPE[type]}
        textContentType={TEXT_CONTENT_TYPE[type]}
        secureTextEntry={type === 'password'}
        autoCapitalize={VERBATIM_TYPES.has(type) ? 'none' : 'sentences'}
        autoCorrect={!VERBATIM_TYPES.has(type)}
        allowFontScaling
        editable={!isDisabled}
        value={currentValue}
        placeholder={placeholder}
        placeholderTextColor={t.colorForegroundMuted}
        returnKeyType={returnKeyType}
        submitBehavior={isLast ? 'blurAndSubmit' : 'submit'}
        onSubmitEditing={handleSubmitEditing}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPointerEnter={onHoverIn}
        onPointerLeave={onHoverOut}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={fieldStyle}
      />
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'} testID="Input.errorMessage">
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
