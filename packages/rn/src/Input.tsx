import * as React from 'react';
import { AccessibilityInfo, Platform, TextInput, View, findNodeHandle } from 'react-native';
import type {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import { useTheme } from './theme';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

export interface InputProps {
  /** Visible label. Always rendered; never replaced by a placeholder. Also the field's `accessibilityLabel`. */
  label: string;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** Controlled value. Omit for an uncontrolled field. */
  value?: string;
  /** Initial value for an uncontrolled field. */
  defaultValue?: string;
  /** Example input shown while empty. Never the only description of what to enter. */
  placeholder?: string;
  /** Persistent helper text below the label explaining format or purpose. Also the field's `accessibilityHint`. */
  description?: string;
  /** Input type. Drives the keyboard (`keyboardType`, `textContentType`, `secureTextEntry`). */
  type?: InputType;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  required?: boolean;
  /** Not editable and not submitted. Stays visible and readable. */
  disabled?: boolean;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  error?: string;
  /** Fired on every value change with the new string value. */
  onChange?: (value: string) => void;
  /** Fired when the field receives focus. */
  onFocus?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
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

/**
 * Input — collects a single line of text, bundling label, helper text, field and
 * error message so their association is always correct.
 *
 * When to use: Use Input for names, emails, passwords, search terms, and short
 * free-text values. Choose `type` for the value so touch keyboards and browser
 * validation match. Provide `description` when the format matters ("Use the email
 * you signed up with"). Set `autocomplete` on web whenever the value is personal
 * data so browsers and assistive tools can fill it.
 *
 * Renders a `Text` label, optional description, a `TextInput`, and an error `Text`.
 * The label is also passed as `accessibilityLabel`, description as
 * `accessibilityHint`, and `accessibilityState={{ disabled }}`. `type` maps to
 * `keyboardType`, `textContentType` and `secureTextEntry`. Inside a Form the field
 * registers `{ getValue, validate, focus }` by `name`; the last field's return key
 * submits the form.
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
  disabled = false,
  invalid = false,
  error,
  onChange,
  onFocus,
  onBlur,
}: InputProps): React.JSX.Element {
  const { tokens } = useTheme();
  const form = useFormContext();
  const inputRef = React.useRef<TextInput>(null);
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
  const [focused, setFocused] = React.useState(false);

  const currentValue = value ?? internalValue;
  const isDisabled = disabled || (form?.disabled ?? false);
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
        return `${label} is required.`;
      }
      if (invalid) {
        return `${label} is not valid.`;
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

  // iOS: announce an error the moment it appears, unless the Form's summary already does.
  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const handleChangeText = (next: string): void => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode === 'change') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const handleFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>): void => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: NativeSyntheticEvent<TextInputFocusEventData>): void => {
    setFocused(false);
    onBlur?.(event);
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, validateValue(currentValue));
    }
  };

  const position = form === null ? -1 : form.order.indexOf(name);
  const isLast = form !== null && position !== -1 && position === form.order.length - 1;
  const nextName = form !== null && position !== -1 ? form.order[position + 1] : undefined;
  const returnKeyType: ReturnKeyTypeOptions | undefined =
    form === null ? undefined : isLast ? 'done' : 'next';

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

  const visibleLabel = required ? `${label} (required)` : label;

  // The focus ring is drawn by widening the border; padding shrinks by the same amount
  // so the field never shifts when it gains focus.
  const borderWidth = focused ? tokens.borderWidthFocus : tokens.borderWidthThin;
  const inset = tokens.borderWidthFocus - borderWidth;

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: tokens.space1,
  };

  const fieldStyle: TextStyle = {
    minHeight: tokens.sizeTargetComfortable,
    backgroundColor: tokens.colorBackground,
    color: tokens.colorForeground,
    borderWidth,
    borderColor: focused ? tokens.colorBorderFocus : isInvalid ? tokens.colorBorderDanger : tokens.colorBorderStrong,
    borderRadius: tokens.radiusMd,
    paddingHorizontal: tokens.spaceMd + inset,
    paddingVertical: tokens.spaceSm + inset,
    fontFamily: tokens.fontFamilyBody,
    fontSize: tokens.fontSizeMd,
    opacity: isDisabled ? tokens.opacityDisabled : 1,
  };

  return (
    <View style={containerStyle}>
      <Text weight="medium">{visibleLabel}</Text>
      {description !== undefined ? (
        <Text size="sm" tone="muted">
          {description}
        </Text>
      ) : null}
      <TextInput
        ref={inputRef}
        accessibilityLabel={visibleLabel}
        accessibilityHint={description}
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
        placeholderTextColor={tokens.colorForegroundMuted}
        returnKeyType={returnKeyType}
        blurOnSubmit={isLast}
        onSubmitEditing={handleSubmitEditing}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={fieldStyle}
      />
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
