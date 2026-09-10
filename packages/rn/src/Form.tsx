import * as React from 'react';
import { AccessibilityInfo, Platform, Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { FormContext } from './FormContext';
import type { FormContextValue, FormFieldHandle, FormValidateMode, FormValues } from './FormContext';
import { Text } from './Text';
import { useTheme } from './theme';

export type { FormFieldValue, FormValidateMode, FormValues } from './FormContext';

export interface FormProps {
  /** Fields (Input etc.), layout (Stack), and at least one Button with `type: submit`. */
  children: React.ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. */
  name?: string;
  /** Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form. */
  label?: string;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  validate?: FormValidateMode;
  /** Disables every field and action inside. Use while submitting. */
  disabled?: boolean;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. */
  errorSummary?: boolean;
  /**
   * Fired when the form is submitted and every field is valid. Receives the collected
   * values keyed by field name: strings from Input, RadioGroup and checked Checkboxes,
   * booleans from Switch. An unchecked Checkbox contributes no key.
   */
  onSubmit?: (values: FormValues) => void;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: (errors: Record<string, string>) => void;
}

function summaryTitle(count: number): string {
  return count === 1 ? '1 problem with this form' : `${count} problems with this form`;
}

/**
 * Form — the container that makes fields behave as a group.
 *
 * When to use: Use Form whenever two or more fields are submitted together, and for
 * any single field whose submission has consequences (sign-in, search with side
 * effects). Place actions (submit, cancel) at the end in a Stack. Give the form a
 * `label` when the page contains more than one.
 *
 * React Native has no form element. Form renders a `View` with `accessibilityLabel`
 * and provides a context; each Input registers `{ getValue, validate, focus }` by
 * name (Checkbox, Switch and RadioGroup register the same way), a Button with
 * `type: submit` calls `submit()`, and the last Input's return
 * key submits. On a failed submission the error summary is announced
 * (`accessibilityLiveRegion="assertive"` on Android, `announceForAccessibility` on
 * iOS) and focus moves to the first invalid field.
 */
export function Form({
  children,
  name,
  label,
  validate = 'submit',
  disabled = false,
  errorSummary = true,
  onSubmit,
  onInvalid,
}: FormProps): React.JSX.Element {
  const { tokens } = useTheme();
  const handles = React.useRef<Map<string, FormFieldHandle>>(new Map());
  const orderRef = React.useRef<string[]>([]);
  const [order, setOrder] = React.useState<readonly string[]>([]);
  const [errors, setErrors] = React.useState<Readonly<Partial<Record<string, string>>>>({});

  const latest = React.useRef({ disabled, onSubmit, onInvalid });
  latest.current = { disabled, onSubmit, onInvalid };

  const register = React.useCallback((fieldName: string, handle: FormFieldHandle) => {
    handles.current.set(fieldName, handle);
    if (!orderRef.current.includes(fieldName)) {
      orderRef.current = [...orderRef.current, fieldName];
      setOrder(orderRef.current);
    }
  }, []);

  const unregister = React.useCallback((fieldName: string) => {
    handles.current.delete(fieldName);
    if (orderRef.current.includes(fieldName)) {
      orderRef.current = orderRef.current.filter((n) => n !== fieldName);
      setOrder(orderRef.current);
    }
    setErrors((prev) => {
      if (!(fieldName in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const reportValidity = React.useCallback((fieldName: string, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        if (!(fieldName in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[fieldName];
        return next;
      }
      return prev[fieldName] === error ? prev : { ...prev, [fieldName]: error };
    });
  }, []);

  const submit = React.useCallback(() => {
    if (latest.current.disabled) {
      return;
    }
    const nextErrors: Record<string, string> = {};
    const values: FormValues = {};
    let firstInvalid: FormFieldHandle | null = null;
    for (const fieldName of orderRef.current) {
      const handle = handles.current.get(fieldName);
      if (handle === undefined) {
        continue;
      }
      const error = handle.validate();
      if (error !== null) {
        nextErrors[fieldName] = error;
        if (firstInvalid === null) {
          firstInvalid = handle;
        }
      }
      const value = handle.getValue();
      if (value !== undefined) {
        values[fieldName] = value;
      }
    }
    setErrors(nextErrors);
    if (firstInvalid !== null) {
      latest.current.onInvalid?.(nextErrors);
      firstInvalid.focus();
      return;
    }
    latest.current.onSubmit?.(values);
  }, []);

  const focusField = React.useCallback((fieldName: string) => {
    handles.current.get(fieldName)?.focus();
  }, []);

  const contextValue = React.useMemo<FormContextValue>(
    () => ({
      register,
      unregister,
      submit,
      focusField,
      reportValidity,
      disabled,
      validateMode: validate,
      errorSummary,
      errors,
      order,
    }),
    [register, unregister, submit, focusField, reportValidity, disabled, validate, errorSummary, errors, order],
  );

  const errorEntries = order
    .filter((fieldName) => fieldName in errors)
    .map((fieldName) => [fieldName, errors[fieldName] ?? ''] as const);

  // iOS has no live regions: announce the summary whenever the set of errors changes.
  // Android is covered by accessibilityLiveRegion on the summary view. Inputs stay
  // silent about form-managed errors while the summary is on, so nothing is read twice.
  const announcement =
    errorSummary && errorEntries.length > 0
      ? [summaryTitle(errorEntries.length), ...errorEntries.map(([, message]) => message)].join('. ')
      : '';
  React.useEffect(() => {
    if (Platform.OS === 'ios' && announcement !== '') {
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [announcement]);

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: tokens.spaceLg,
  };

  const summaryStyle: ViewStyle = {
    borderWidth: tokens.borderWidthThin,
    borderColor: tokens.colorBorderDanger,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorBackgroundSubtle,
    paddingHorizontal: tokens.spaceMd,
    paddingVertical: tokens.spaceSm,
    gap: tokens.spaceSm,
  };

  const summaryItemStyle: ViewStyle = {
    minHeight: tokens.sizeTargetMin,
    justifyContent: 'center',
  };

  return (
    <FormContext.Provider value={contextValue}>
      <View accessibilityLabel={label} testID={name} style={containerStyle}>
        {errorSummary && errorEntries.length > 0 ? (
          <View accessibilityLiveRegion="assertive" style={summaryStyle}>
            <Text tone="danger" weight="semibold">
              {summaryTitle(errorEntries.length)}
            </Text>
            {errorEntries.map(([fieldName, message]) => (
              <Pressable
                key={fieldName}
                accessibilityRole="link"
                accessibilityLabel={message}
                style={summaryItemStyle}
                onPress={() => handles.current.get(fieldName)?.focus()}
              >
                <Text tone="danger">{message}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {children}
      </View>
    </FormContext.Provider>
  );
}
