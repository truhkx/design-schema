import * as React from 'react';
import { AccessibilityInfo, Platform, TextInput, View, findNodeHandle } from 'react-native';
import type { TextInputInstance, TextInputProps, TextStyle, ViewInstance, ViewStyle } from 'react-native';
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

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. The locked bindings (`background`, `foreground`, `placeholder`,
 * `border`, `borderFocus`, `errorText`, `descriptionText`, `minTarget`, `minTargetSm`,
 * `focusRingWidth`) carry contrast or target guarantees and are not in the union.
 */
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
  | 'disabledOpacity'
  | 'transition';

export interface InputProps {
  /** Visible label (not rendered with `hideLabel`, where it survives only as the accessible name). Never replaced by a placeholder. */
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
  /** Input type. Drives `keyboardType`, `textContentType` and `secureTextEntry`. */
  type?: InputType | undefined;
  /** The field must have a value to submit. Shown in the label as `copy.requiredIndicator`, not only by color. */
  required?: boolean | undefined;
  /** Not editable and not submitted. Stays visible and readable; on native it is not focusable (see the component note). */
  disabled?: boolean | undefined;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** The error message. Setting it implies `invalid`. An empty string counts as unset. */
  error?: string | undefined;
  /** Do not render the label Text. `label` stays the accessible name. Only for a field whose context already names it. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: InputSize | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root group `View`, so a parent can measure the field group. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Supplementary description, appended after `description` on the field's hint; Tooltip sets it when it describes the field. */
  accessibilityHint?: string | undefined;
  /** Set by a parent (Tooltip, when its content *is* the name) to replace the name `label` would give. */
  accessibilityLabel?: string | undefined;
  /** Fired on every value change with the new string value, and nothing else. */
  onChangeText?: ((value: string) => void) | undefined;
  /** Fired when the field receives focus. Called with no arguments, not the focus event. */
  onFocus?: (() => void) | undefined;
  /** Fired when the field loses focus — the usual moment to validate. Called with no arguments. */
  onBlur?: (() => void) | undefined;
  /** Forwarded to the field so Tooltip can attach (react-native-web pointer only; maps to `onPointerEnter`). */
  onHoverIn?: (() => void) | undefined;
  /** Forwarded to the field so Tooltip can attach (react-native-web pointer only; maps to `onPointerLeave`). */
  onHoverOut?: (() => void) | undefined;
  /** Forwarded to the field; also cancels a pending synthetic long press. */
  onPressOut?: (() => void) | undefined;
  /** Forwarded to the field so Tooltip can open on long press. TextInput has none, so it is timed from `onPressIn`. */
  onLongPress?: (() => void) | undefined;
}

/** The component's user-facing strings, from the doc's `copy` block. */
const COPY = {
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
  requiredIndicator: ' (required)',
} as const;

/**
 * `longPressDelay`: how long a press on the TextInput is held before the forwarded
 * `onLongPress` fires — the Pressable default, which TextInput lacks.
 */
const LONG_PRESS_DELAY = 500; // literal-ok: the doc's `longPressDelay` constant, in ms

const KEYBOARD_TYPE = {
  text: 'default',
  email: 'email-address',
  password: 'default',
  number: 'numeric',
  // `search` keeps the default keyboard: the return key is what a search field changes, not the layout.
  search: 'default',
  tel: 'phone-pad',
  url: 'url',
} as const satisfies Record<InputType, NonNullable<TextInputProps['keyboardType']>>;

const CONTENT_TYPE = {
  text: 'none',
  email: 'emailAddress',
  password: 'password',
  number: 'none',
  search: 'none',
  tel: 'telephoneNumber',
  url: 'URL',
} as const satisfies Record<InputType, NonNullable<TextInputProps['textContentType']>>;

/** Types whose value is never a sentence: no autocapitalisation and no autocorrection. */
const LITERAL_TYPES: readonly InputType[] = ['email', 'password', 'url'];

/** `font.size.{size}` — the field text and the label, so the label follows `size`. */
const FONT_SIZE_TOKEN = {
  sm: 'fontSizeSm',
  md: 'fontSizeMd',
} as const satisfies Record<InputSize, keyof Tokens>;

const PADDING_INLINE_TOKEN = {
  sm: 'space2',
  md: 'spaceMd',
} as const satisfies Record<InputSize, keyof Tokens>;

const PADDING_BLOCK_TOKEN = {
  sm: 'space1',
  md: 'spaceSm',
} as const satisfies Record<InputSize, keyof Tokens>;

/** `minTarget` / `minTargetSm`: both locked, so the sm floor is always `size.target.min`. */
const MIN_TARGET_TOKEN = {
  sm: 'sizeTargetMin',
  md: 'sizeTargetComfortable',
} as const satisfies Record<InputSize, keyof Tokens>;

/**
 * Input — collects a single line of text.
 *
 * When to use: Use Input for names, emails, passwords, search terms, and short
 * free-text values. Choose `type` for the value so the touch keyboard matches.
 * Provide `description` when the format matters ("Use the email you signed up
 * with"). Do not use `placeholder` as the label; it vanishes as soon as the user
 * types.
 *
 * Renders a group `View` (`testID="Input"`) holding the label, description, the
 * `TextInput` and the error message, separated by `partGap`. There is no label
 * element on native: `label` is rendered as the system `Text` at `weight="medium"`
 * and is also the field's `accessibilityLabel`, and `description` becomes its
 * `accessibilityHint` (a hint forwarded by a parent is appended after it, joined
 * with a space; a forwarded `accessibilityLabel` replaces the name outright). A
 * Fieldset legend still prefixes the name ("Shipping address, Street").
 * `hideLabel` drops the label Text entirely, so the `label` part has no native
 * home while hidden and the name lives only in `accessibilityLabel`.
 *
 * `required` appends `copy.requiredIndicator` to the visible label and to the
 * accessible name — there is no required accessibility state on native. The error
 * is announced through `accessibilityLiveRegion` (Android) and
 * `AccessibilityInfo.announceForAccessibility` (iOS) rather than `role="alert"`,
 * and both are suppressed inside a Form that renders its own error summary.
 *
 * `disabled` uses `editable={false}` with `accessibilityState.disabled`: iOS
 * cannot keep a non-editable TextInput focusable, so a disabled field is not
 * focusable on native and the state is announced instead. react-native-web drops
 * `accessibilityState`, so it is mirrored as `aria-disabled` on both the TextInput
 * and the group View that carries `disabledOpacity` — the group is what makes a
 * web accessibility checker treat the dimmed label and value as disabled.
 *
 * The field's border *is* its focus ring: on focus it widens to `focusRingWidth`
 * in `color.border.focus` while the padding shrinks by the difference so nothing
 * shifts, and when the field is both invalid and focused the danger color stays so
 * the error is never hidden by focus. Native swaps the border instantly, so the
 * `transition` binding is accepted for parity with web and has no effect here.
 *
 * Inside a Form the field registers by `name`, submits its string value, and takes
 * `returnKeyType`/`onSubmitEditing` from the Form's field order (next field, or
 * submit on the last). Validation precedence is `error`, then `required`
 * (`copy.required`), then `invalid` (`copy.invalid`); the error slot shows `error`,
 * else the Form's message for this field, else — only while invalid — the derived
 * copy, so an untouched empty required field flags nothing.
 *
 * TextInput has no hover or long-press handlers: `onHoverIn`/`onHoverOut` map to
 * `onPointerEnter`/`onPointerLeave`, and `onLongPress` is timed from `onPressIn`
 * over `longPressDelay` unless `onPressOut` comes first.
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
  hideLabel = false,
  size = 'md',
  overrides,
  ref,
  accessibilityHint,
  accessibilityLabel,
  onChangeText,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  onPressOut,
  onLongPress,
}: InputProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const fieldset = useFieldsetContext();

  const inputRef = React.useRef<TextInputInstance>(null);
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
  const [focused, setFocused] = React.useState(false);

  const currentValue = value ?? internalValue;
  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);

  // The Form marks a failing field by putting an entry under its name; the entry's
  // presence is the mark, and an entry with an empty message falls through to the
  // derived copy. `error` is the consumer's and the Form never sets it.
  const formErrors = form?.errors;
  const formMarked = formErrors !== undefined && Object.prototype.hasOwnProperty.call(formErrors, name);
  const formError = formErrors?.[name];
  const ownError = error !== undefined && error !== '' ? error : undefined;

  const isInvalid = ownError !== undefined || invalid || formMarked;
  const derivedError = isInvalid ? (required && currentValue === '' ? COPY.required(label) : COPY.invalid(label)) : undefined;
  const displayedError = ownError ?? (formError !== undefined && formError !== '' ? formError : derivedError);
  const summarised = form !== null && form.errorSummary;

  const validateValue = React.useCallback(
    (candidate: string): string | null => {
      // Precedence: `error` prop, then `required`, then `invalid`. The Form's own entry is
      // ignored here, since this is what the Form calls to produce it. A disabled field is skipped.
      if (isDisabled) {
        return null;
      }
      if (error !== undefined && error !== '') {
        return error;
      }
      // Only the empty string counts as empty, as a native field does: whitespace passes.
      if (required && candidate === '') {
        return COPY.required(label);
      }
      if (invalid) {
        return COPY.invalid(label);
      }
      return null;
    },
    [isDisabled, error, required, invalid, label],
  );

  const focusField = React.useCallback((): void => {
    inputRef.current?.focus();
    const node = inputRef.current === null ? null : findNodeHandle(inputRef.current);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, []);

  const latest = React.useRef({ currentValue, isDisabled, validateValue, focusField });
  latest.current = { currentValue, isDisabled, validateValue, focusField };
  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      label,
      // An empty or disabled field contributes nothing and is left out of the collected values.
      getValue: () => (latest.current.isDisabled || latest.current.currentValue === '' ? undefined : latest.current.currentValue),
      // A disabled field stays registered and reports itself here; the Form skips it in its
      // values, its validation and the order the "next" key walks.
      isDisabled: () => latest.current.isDisabled,
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: () => latest.current.focusField(),
    }),
    [label],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    if (register === undefined || unregister === undefined) {
      return undefined;
    }
    register(name, handle);
    return () => unregister(name);
  }, [register, unregister, name, handle]);
  // The Form re-reads `isDisabled()` on registration, which keeps the field's place in the
  // order, so registering again is how a change of disabled state reaches the "next" key.
  const registeredDisabled = React.useRef(isDisabled);
  React.useEffect(() => {
    if (registeredDisabled.current === isDisabled) {
      return;
    }
    registeredDisabled.current = isDisabled;
    register?.(name, handle);
  }, [register, name, handle, isDisabled]);

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  // TextInput has no long-press handler, so one is timed from `onPressIn` and cancelled
  // by `onPressOut` (or by unmounting mid-press).
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLongPress = React.useCallback((): void => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);
  React.useEffect(() => cancelLongPress, [cancelLongPress]);

  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const borderInvalid = overrides?.borderInvalid ? (resolveToken(t, overrides.borderInvalid) as string) : t.colorBorderDanger;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t[PADDING_INLINE_TOKEN[size]];
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[PADDING_BLOCK_TOKEN[size]];
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const lineHeight = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  // `transition` is accepted for parity with web and Lit: the native border swaps instantly,
  // so neither the default duration nor an override of it is read here.

  // The border is the focus ring, so focusing only changes its width — and the padding
  // gives back exactly that difference so the field does not shift.
  const focusRingWidth = t.borderWidthFocus;
  const currentBorderWidth = focused ? focusRingWidth : borderWidth;
  const borderGrowth = currentBorderWidth - borderWidth;
  const borderColor = isInvalid ? borderInvalid : focused ? t.colorBorderFocus : t.colorBorderStrong;

  const groupStyle = React.useMemo<ViewStyle>(
    () => ({
      flexDirection: 'column',
      gap: partGap,
      opacity: isDisabled ? disabledOpacity : 1,
    }),
    [partGap, isDisabled, disabledOpacity],
  );

  const fieldStyle = React.useMemo<TextStyle>(
    () => ({
      minHeight: t[MIN_TARGET_TOKEN[size]],
      paddingHorizontal: Math.max(0, paddingInline - borderGrowth),
      paddingVertical: Math.max(0, paddingBlock - borderGrowth),
      borderWidth: currentBorderWidth,
      borderColor,
      borderRadius: radius,
      backgroundColor: t.colorBackground,
      color: t.colorForeground,
      fontFamily,
      fontSize,
      lineHeight: toLineHeight(fontSize, lineHeight),
    }),
    [t, size, paddingInline, paddingBlock, borderGrowth, currentBorderWidth, borderColor, radius, fontFamily, fontSize, lineHeight],
  );

  // The root bindings the composed Texts realise: the label follows `size` and `labelWeight`,
  // the helpers are `size="sm"` with `helperSize` on top. Overrides are forwarded to the
  // child's own `overrides`; the child's colors stay its locked `tone`.
  const labelOverrides = {
    fontSize: overrides?.fontSize,
    fontWeight: overrides?.labelWeight,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  };
  const helperOverrides = {
    fontSize: overrides?.helperSize,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  };

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  // A forwarded name replaces the label outright; a Fieldset legend still goes in front.
  const ownName = accessibilityLabel ?? visibleLabel;
  const accessibleName = fieldset === null ? ownName : `${fieldset.legend}, ${ownName}`;
  const hint = [description, accessibilityHint].filter((part) => part !== undefined && part !== '').join(' ');

  // The Form owns the field order: every field but the last moves to the next one.
  const order = form?.order ?? [];
  const index = order.indexOf(name);
  const isLastField = index === -1 || index === order.length - 1;
  const handleSubmitEditing = (): void => {
    if (form === null) {
      return;
    }
    const next = order[index + 1];
    if (isLastField || next === undefined) {
      form.submit();
    } else {
      form.focusField(next);
    }
  };

  const handleChangeText = (next: string): void => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onChangeText?.(next);
    if (form !== null && (form.validateMode === 'change' || form.submitFailed)) {
      form.reportValidity(name, validateValue(next));
    }
  };

  const handleBlur = (): void => {
    setFocused(false);
    if (form !== null && (form.validateMode === 'blur' || form.submitFailed)) {
      form.reportValidity(name, validateValue(currentValue));
    }
    onBlur?.();
  };

  const literalType = LITERAL_TYPES.includes(type);

  return (
    <View ref={ref} testID="Input" style={groupStyle} aria-disabled={isDisabled}>
      {hideLabel ? null : (
        // Text takes no testID, so the part name lives on a wrapper View (as in Fieldset).
        <View testID="Input.label">
          <Text size={size} weight="medium" overrides={labelOverrides}>
            {visibleLabel}
          </Text>
        </View>
      )}
      {description === undefined || description === '' ? null : (
        <View testID="Input.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      )}
      <TextInput
        ref={inputRef}
        testID="Input.field"
        style={fieldStyle}
        value={currentValue}
        placeholder={placeholder}
        placeholderTextColor={t.colorForegroundMuted}
        editable={!isDisabled}
        keyboardType={KEYBOARD_TYPE[type]}
        textContentType={CONTENT_TYPE[type]}
        secureTextEntry={type === 'password'}
        autoCapitalize={literalType ? 'none' : undefined}
        autoCorrect={literalType ? false : undefined}
        accessibilityLabel={accessibleName}
        aria-label={accessibleName}
        accessibilityHint={hint === '' ? undefined : hint}
        accessibilityState={{ disabled: isDisabled }}
        // react-native-web 0.21 drops `accessibilityState`; this mirror is what reaches the DOM.
        aria-disabled={isDisabled}
        returnKeyType={form === null ? undefined : isLastField ? 'done' : 'next'}
        onSubmitEditing={form === null ? undefined : handleSubmitEditing}
        onChangeText={handleChangeText}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={handleBlur}
        onPointerEnter={onHoverIn}
        onPointerLeave={onHoverOut}
        onPressIn={() => {
          if (onLongPress === undefined) {
            return;
          }
          cancelLongPress();
          longPressTimer.current = setTimeout(() => {
            longPressTimer.current = null;
            onLongPress();
          }, LONG_PRESS_DELAY);
        }}
        onPressOut={() => {
          cancelLongPress();
          onPressOut?.();
        }}
      />
      {displayedError === undefined ? null : (
        <View
          testID="Input.errorMessage"
          // Android announces through the live region; iOS through the effect above. A Form
          // with its own error summary announces instead, so both are silenced there.
          accessibilityLiveRegion={summarised ? 'none' : 'assertive'}
        >
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      )}
    </View>
  );
}
