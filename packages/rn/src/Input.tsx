import * as React from 'react';
import { AccessibilityInfo, Platform, TextInput, View, findNodeHandle } from 'react-native';
import type {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  TextInputFocusEvent,
  TextInputInstance,
  TextInputProps,
  TextStyle,
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
  | 'borderFocus'
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'paddingBlockSm'
  | 'paddingInlineSm'
  | 'partGap'
  | 'fontFamily'
  | 'fontSize'
  | 'labelWeight'
  | 'helperSize'
  | 'lineHeight'
  | 'minTargetSm'
  | 'disabledOpacity';

export interface InputProps {
  /** Visible label. Always rendered; never replaced by a placeholder. Also the field's `accessibilityLabel`. */
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
  /** Input type. Drives the keyboard (`keyboardType`, `textContentType`, `secureTextEntry`). */
  type?: InputType | undefined;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the field's `accessibilityLabel`). Only for a field whose context already names it. */
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
  /** Fired on every value change with the new string value. */
  onChange?: ((value: string) => void) | undefined;
  /** Fired when the field receives focus. */
  onFocus?: ((event: TextInputFocusEvent) => void) | undefined;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: ((event: TextInputFocusEvent) => void) | undefined;
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

const COPY = {
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
} as const;

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
 * submits the form. The focus ring replaces the border with `focusRingWidth`
 * (locked to `border.width.focus`) and padding shrinks by the same amount so the
 * field never shifts; `disabled` dims the whole label/description/field/error
 * group with `disabledOpacity` rather than inventing a disabled color. Inside a
 * Fieldset, the group's `disabled` applies as if set on the field and the legend
 * prefixes the field's `accessibilityLabel` ("Shipping address, Street"). `size:
 * sm` swaps `paddingBlock`/`paddingInline`/the target height for their `Sm`
 * bindings and the field text to `font.size.sm`; nothing else changes.
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
  onChange,
  onFocus,
  onBlur,
}: InputProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const fieldset = useFieldsetContext();
  const inputRef = React.useRef<TextInputInstance>(null);
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
  const accessibleLabel = fieldset !== null ? `${fieldset.legend}, ${visibleLabel}` : visibleLabel;

  const borderFocusColor = overrides?.borderFocus ? (resolveToken(t, overrides.borderFocus) as string) : t.colorBorderFocus;
  const borderInvalidColor = overrides?.borderInvalid ? (resolveToken(t, overrides.borderInvalid) as string) : t.colorBorderDanger;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const paddingInline =
    size === 'sm'
      ? overrides?.paddingInlineSm
        ? (resolveToken(t, overrides.paddingInlineSm) as number)
        : t.space2
      : overrides?.paddingInline
        ? (resolveToken(t, overrides.paddingInline) as number)
        : t.spaceMd;
  const paddingBlock =
    size === 'sm'
      ? overrides?.paddingBlockSm
        ? (resolveToken(t, overrides.paddingBlockSm) as number)
        : t.space1
      : overrides?.paddingBlock
        ? (resolveToken(t, overrides.paddingBlock) as number)
        : t.spaceSm;
  const minTarget =
    size === 'sm'
      ? overrides?.minTargetSm
        ? (resolveToken(t, overrides.minTargetSm) as number)
        : t.sizeTargetMin
      : t.sizeTargetComfortable;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  // The focus ring is drawn by widening the border to the locked `focusRingWidth`;
  // padding shrinks by the same amount so the field never shifts when it gains focus.
  const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
  const inset = t.borderWidthFocus - borderWidth;

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const fieldStyle: TextStyle = {
    minHeight: minTarget,
    backgroundColor: t.colorBackground,
    color: t.colorForeground,
    borderWidth: activeBorderWidth,
    borderColor: focused ? borderFocusColor : isInvalid ? borderInvalidColor : t.colorBorderStrong,
    borderRadius: radius,
    paddingHorizontal: paddingInline + inset,
    paddingVertical: paddingBlock + inset,
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
  };

  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };

  return (
    <View style={containerStyle} testID="Input">
      {hideLabel ? null : (
        <Text
          weight="medium"
          overrides={{ fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, fontWeight: overrides?.labelWeight, lineHeight: overrides?.lineHeight }}
        >
          {visibleLabel}
        </Text>
      )}
      {description !== undefined ? (
        <Text size="sm" tone="muted" overrides={helperOverrides}>
          {description}
        </Text>
      ) : null}
      <TextInput
        ref={inputRef}
        accessibilityLabel={accessibleLabel}
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
        placeholderTextColor={t.colorForegroundMuted}
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
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
