import * as React from 'react';
import { AccessibilityInfo, Platform, Pressable, View, findNodeHandle } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { FormContext } from './FormContext';
import type { FormContextValue, FormFieldHandle, FormValidateMode, FormValues } from './FormContext';
import { Stack } from './Stack';
import { Text } from './Text';
import { useTheme } from './theme';

export type { FormFieldValue, FormValidateMode, FormValues } from './FormContext';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type FormOverridableBinding = 'gap' | 'errorSummaryBorder';

export interface FormProps {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: React.ReactNode;
  /** The action row: at least one Button with `type: submit`, primary first (Form's action-order rule). Rendered after the fields with the form gap; the `actions` anatomy part. */
  actions: React.ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. React Native has no ids and focuses by ref, so it is inert here and exists for parity. */
  name?: string | undefined;
  /** Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form. */
  label?: string | undefined;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  validate?: FormValidateMode | undefined;
  /** Disables every field and action inside. Use while submitting. */
  disabled?: boolean | undefined;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. Each item reads "Label: message". */
  errorSummary?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view, so a parent can measure it. */
  ref?: React.Ref<ViewInstance> | undefined;
  /**
   * Fired when the form is submitted and every field is valid. Receives the collected
   * values keyed by field name: Input and RadioGroup contribute strings, Switch a boolean,
   * Checkbox its `value` when checked; an unchecked Checkbox, an unselected RadioGroup and
   * a disabled field contribute no key at all.
   */
  onSubmit?: ((values: FormValues) => void) | undefined;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: ((errors: Record<string, string>) => void) | undefined;
}

/** copy.* — used verbatim. `summaryHeading` is selected by `Intl.PluralRules` on `count`. */
const COPY = {
  summaryHeading: {
    one: '1 problem with this form',
    other: '{count} problems with this form',
  },
  summaryHeadingOne: '1 problem with this form',
  invalidSummary: 'This form has errors.',
} as const;

function summaryHeading(count: number): string {
  const form = new Intl.PluralRules(undefined).select(count) === 'one' ? COPY.summaryHeading.one : COPY.summaryHeading.other;
  return form.replace('{count}', String(count));
}

interface SummaryItemProps {
  text: string;
  onPress: () => void;
}

/** One summary entry: a link that moves focus to its field, with a hand-tracked focus ring. */
function SummaryItem({ text, onPress }: SummaryItemProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={{
        minHeight: t.sizeTargetMin,
        justifyContent: 'center',
        borderWidth: t.borderWidthFocus,
        borderColor: focused ? t.colorBorderFocus : 'transparent',
        borderRadius: t.radiusSm,
      }}
    >
      <Text tone="danger">{text}</Text>
    </Pressable>
  );
}

/**
 * Form — the container that makes fields behave as a group.
 *
 * When to use: Use Form whenever two or more fields are submitted together, and for
 * any single field whose submission has consequences (sign-in, search with side
 * effects). Pass the submit and cancel Buttons in `actions`, primary first. Give
 * the form a `label` when the page contains more than one.
 *
 * React Native has no form element. Form renders a `View` with `role="form"` and
 * `accessibilityLabel` and provides a context; each field registers
 * `{ name, label, getValue, validate, focus }` in mount order (disabled fields do not
 * register), a Button with `type: submit` calls `submit()`, non-last Inputs get
 * `returnKeyType="next"` and the last one's return key submits. `children` (the fields)
 * and `actions` (the action row) render in separate anatomy parts, spaced by `gap`.
 * On a failed submission the error summary is announced
 * (`accessibilityLiveRegion="assertive"` on Android, `announceForAccessibility` on iOS)
 * and focus moves to the summary when `errorSummary` is on, otherwise to the first
 * invalid field.
 */
export function Form({
  children,
  actions,
  name: _name,
  label,
  validate = 'submit',
  disabled = false,
  errorSummary = true,
  overrides,
  ref,
  onSubmit,
  onInvalid,
}: FormProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const handles = React.useRef<Map<string, FormFieldHandle>>(new Map());
  const orderRef = React.useRef<string[]>([]);
  const [order, setOrder] = React.useState<readonly string[]>([]);
  const [errors, setErrors] = React.useState<Readonly<Partial<Record<string, string | undefined>>>>({});
  const [submissionAttempt, setSubmissionAttempt] = React.useState(0);
  const summaryRef = React.useRef<ViewInstance>(null);

  const latest = React.useRef({ disabled, errorSummary, onSubmit, onInvalid });
  latest.current = { disabled, errorSummary, onSubmit, onInvalid };

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
      if (latest.current.errorSummary) {
        // Focus moves to the summary once it has rendered — see the effect below.
        setSubmissionAttempt((attempt) => attempt + 1);
      } else {
        firstInvalid.focus();
      }
      return;
    }
    latest.current.onSubmit?.(values);
  }, []);

  // The summary receives focus after a failed submission, once it has rendered.
  React.useEffect(() => {
    if (submissionAttempt === 0) {
      return;
    }
    const node = findNodeHandle(summaryRef.current);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [submissionAttempt]);

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

  // Each item reads "Label: message"; a field that registers no label shows its message alone.
  const errorEntries = order
    .filter((fieldName) => errors[fieldName] !== undefined)
    .map((fieldName) => {
      const message = errors[fieldName] ?? '';
      const fieldLabel = handles.current.get(fieldName)?.label;
      return [fieldName, fieldLabel ? `${fieldLabel}: ${message}` : message] as const;
    });

  const heading = summaryHeading(errorEntries.length);

  // iOS has no live regions: announce the summary whenever the set of errors changes.
  // Android is covered by accessibilityLiveRegion on the summary view. Fields stay
  // silent about form-managed errors while the summary is on, so nothing is read twice.
  const announcement =
    errorSummary && errorEntries.length > 0 ? [heading, ...errorEntries.map(([, text]) => text)].join('. ') : '';
  React.useEffect(() => {
    if (Platform.OS === 'ios' && announcement !== '') {
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [announcement]);

  const styles = React.useMemo(() => {
    const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.layoutGapLoose;
    const summaryBorderColor = overrides?.errorSummaryBorder
      ? (resolveToken(t, overrides.errorSummaryBorder) as string)
      : t.colorBorderDanger;
    // No opacity here: every field and action inside dims itself from the context,
    // and dimming the container too would compound the two.
    const container: ViewStyle = { flexDirection: 'column', gap };
    // The same gap separates individual fields, so the rhythm is uniform whether
    // siblings are two fields or the fields block and the action row.
    const fields: ViewStyle = { flexDirection: 'column', gap };
    const summary: ViewStyle = {
      borderWidth: t.borderWidthThin,
      borderColor: summaryBorderColor,
      borderRadius: t.radiusMd,
      backgroundColor: t.colorBackgroundSubtle,
      paddingHorizontal: t.spaceMd,
      paddingVertical: t.spaceSm,
    };
    return { container, fields, summary };
  }, [t, overrides?.gap, overrides?.errorSummaryBorder]);

  return (
    <FormContext.Provider value={contextValue}>
      <View
        ref={ref}
        testID="Form"
        role="form"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={styles.container}
      >
        {errorSummary && errorEntries.length > 0 ? (
          <View
            ref={summaryRef}
            testID="Form.errorSummary"
            accessibilityLiveRegion="assertive"
            style={styles.summary}
          >
            <Stack gap="tight">
              <Text tone="danger" weight="semibold">
                {heading}
              </Text>
              {errorEntries.map(([fieldName, text]) => (
                <SummaryItem key={fieldName} text={text} onPress={() => handles.current.get(fieldName)?.focus()} />
              ))}
            </Stack>
          </View>
        ) : null}
        <View testID="Form.fields" style={styles.fields}>
          {children}
        </View>
        <View testID="Form.actions">{actions}</View>
      </View>
    </FormContext.Provider>
  );
}
