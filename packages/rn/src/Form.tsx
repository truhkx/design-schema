import * as React from 'react';
import { AccessibilityInfo, Platform, View, findNodeHandle } from 'react-native';
import type { TextInstance, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { FormContext } from './FormContext';
import type { FormContextValue, FormFieldHandle, FormValidateMode, FormValues } from './FormContext';
import { Link } from './Link';
import { Stack } from './Stack';
import { Text } from './Text';
import { useTheme } from './theme';

export type { FormFieldValue, FormValidateMode, FormValues } from './FormContext';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type FormOverridableBinding =
  | 'gap'
  | 'errorSummaryBorder'
  | 'errorSummaryBorderWidth'
  | 'errorSummaryRadius'
  | 'errorSummaryPadding'
  | 'errorSummaryGap';

export interface FormProps {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: React.ReactNode;
  /**
   * The action row: at least one Button with `type: submit`, primary first (Form's
   * action-order rule). Rendered after the fields with the form gap. A single action
   * renders bare; two or more go in a horizontal Stack the consumer supplies.
   */
  actions: React.ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. React Native has no ids and focuses by ref, so it is inert here and exists for parity. */
  name?: string | undefined;
  /** Accessible name for the form, e.g. "Sign in". Required when a screen has more than one form. Nothing enforces this at runtime and no dev warning is emitted. */
  label?: string | undefined;
  /**
   * When field-level validation runs. `submit` is the least noisy; `blur` is the usual
   * choice for longer forms. `change` validates on change only, not also on blur; after a
   * failed submission every mode re-validates on blur and change, until a successful
   * submission resets that state.
   */
  validate?: FormValidateMode | undefined;
  /** Disables every field and action inside. Use while submitting. Each child dims itself; the Form only exposes the disabled state. */
  disabled?: boolean | undefined;
  /**
   * When submission fails validation, render a summary of errors above the fields that links
   * to each field. Each item's text is the field's own message verbatim; a field that is
   * invalid with an empty message shows its `label` instead, and its `name` when the label
   * is empty too. The summary appears only after a failed submission, shrinks as fields are
   * fixed, and is removed by a successful submission.
   */
  errorSummary?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view, so a parent can measure it. */
  ref?: React.Ref<ViewInstance> | undefined;
  /**
   * Fired when the form is submitted and every field is valid. Receives the collected values
   * keyed by field name: Input and RadioGroup contribute strings, Switch a boolean, Checkbox
   * its `value` when checked, NumberInput and Slider a number, multi-select Listbox, Select
   * and Combobox a string array, a range Slider or DatePicker a pair; an unchecked Checkbox,
   * an unselected RadioGroup, an empty field (a null, empty-string or empty-array value) and a
   * disabled field contribute no key at all.
   */
  onSubmit?: ((values: FormValues) => void) | undefined;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: ((errors: Record<string, string>) => void) | undefined;
}

/** copy.* — used verbatim. `summaryHeading` is selected by `Intl.PluralRules` on `count`; `summaryHeadingOne` and `invalidSummary` are not rendered on RN. */
const COPY = {
  summaryHeading: {
    one: '1 problem with this form',
    other: '{count} problems with this form',
  },
  summaryHeadingOne: '1 problem with this form',
  invalidSummary: 'This form has errors.',
} as const;

function summaryHeading(count: number, locale: string | undefined): string {
  const form = new Intl.PluralRules(locale).select(count) === 'one' ? COPY.summaryHeading.one : COPY.summaryHeading.other;
  return form.replace('{count}', String(count));
}

/** Null, empty-string and empty-array values contribute no key. */
function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * Form — the container that makes fields behave as a group.
 *
 * When to use: Use Form whenever two or more fields are submitted together, and for
 * any single field whose submission has consequences (sign-in, search with side
 * effects). Pass the submit and cancel Buttons in `actions`, primary first. Give
 * the form a `label` when the screen contains more than one.
 *
 * React Native has no form element. Form renders a `View` with `role="form"` (a
 * landmark only on react-native-web) and `accessibilityLabel`, and provides a context;
 * each field calls `register(name, { label, getValue, validate, focus })` in mount order
 * (disabled fields do not register), a Button with `type: submit` calls `submit()`,
 * non-last Inputs get `returnKeyType="next"` and the last one's return key submits.
 * On a failed submission the error summary is announced (`accessibilityLiveRegion=
 * "assertive"` on Android, `announceForAccessibility` on iOS: the heading followed by
 * each item) and accessibility focus moves to the summary heading when `errorSummary`
 * is on, otherwise to the first invalid field. Each summary item is a `Link`
 * (`tone: inherit`, nested in a danger Text) that focuses its field and never navigates.
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
  // True from a failed submission until a successful one: gates the summary and
  // turns on re-validation as fields change in every mode.
  const [submitFailed, setSubmitFailed] = React.useState(false);
  const submitFailedRef = React.useRef(false);
  // Summary item order: field order at the failed submit, later errors appended.
  const [summaryOrder, setSummaryOrder] = React.useState<readonly string[]>([]);
  // Plural locale, read at the failed submit (RN has no `lang` ancestor: runtime default).
  const [pluralLocale, setPluralLocale] = React.useState<string | undefined>(undefined);
  const [failedAttempt, setFailedAttempt] = React.useState(0);
  const headingRef = React.useRef<TextInstance>(null);

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
    if (error !== null && submitFailedRef.current) {
      setSummaryOrder((prev) => (prev.includes(fieldName) ? prev : [...prev, fieldName]));
    }
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
      if (!isEmptyValue(value)) {
        values[fieldName] = value!;
      }
    }
    setErrors(nextErrors);
    if (firstInvalid !== null) {
      submitFailedRef.current = true;
      setSubmitFailed(true);
      setSummaryOrder(orderRef.current.filter((fieldName) => fieldName in nextErrors));
      setPluralLocale(new Intl.PluralRules().resolvedOptions().locale);
      latest.current.onInvalid?.(nextErrors);
      if (latest.current.errorSummary) {
        // Focus and the iOS announcement follow once the summary has rendered — see below.
        setFailedAttempt((attempt) => attempt + 1);
      } else {
        firstInvalid.focus();
      }
      return;
    }
    submitFailedRef.current = false;
    setSubmitFailed(false);
    setSummaryOrder([]);
    latest.current.onSubmit?.(values);
  }, []);

  const focusField = React.useCallback((fieldName: string) => {
    handles.current.get(fieldName)?.focus();
  }, []);

  // After a failed submission every mode re-validates on blur and change. Fields read
  // `submitFailed` for that; `validateMode` also reports `change` from then on so fields
  // that read only the mode keep re-validating as they are fixed.
  const validateMode: FormValidateMode = submitFailed ? 'change' : validate;

  const contextValue = React.useMemo<FormContextValue>(
    () => ({
      register,
      unregister,
      submit,
      focusField,
      reportValidity,
      disabled,
      validateMode,
      submitFailed,
      errorSummary,
      errors,
      order,
    }),
    [register, unregister, submit, focusField, reportValidity, disabled, validateMode, submitFailed, errorSummary, errors, order],
  );

  // Each item is the field's own message verbatim; an empty message falls back to the
  // field's label, and to its name when the label is empty too.
  const errorEntries = summaryOrder
    .filter((fieldName) => errors[fieldName] !== undefined && handles.current.has(fieldName))
    .map((fieldName) => {
      const message = errors[fieldName] ?? '';
      const fieldLabel = handles.current.get(fieldName)?.label ?? '';
      const text = message !== '' ? message : fieldLabel !== '' ? fieldLabel : fieldName;
      return [fieldName, text] as const;
    });

  const showSummary = errorSummary && submitFailed && errorEntries.length > 0;
  const heading = summaryHeading(errorEntries.length, pluralLocale);

  // After a failed submission: accessibility focus to the summary heading, and on iOS
  // (no live regions) announce the heading followed by each item. Android is covered by
  // accessibilityLiveRegion on the summary view.
  const announcementRef = React.useRef('');
  announcementRef.current = showSummary ? [heading, ...errorEntries.map(([, text]) => text)].join('. ') : '';
  React.useEffect(() => {
    if (failedAttempt === 0) {
      return;
    }
    const node = findNodeHandle(headingRef.current);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
    if (Platform.OS === 'ios' && announcementRef.current !== '') {
      AccessibilityInfo.announceForAccessibility(announcementRef.current);
    }
  }, [failedAttempt]);

  const styles = React.useMemo(() => {
    const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.layoutGapLoose;
    // No opacity here: every field and action inside dims itself from the context,
    // and dimming the container too would compound the two.
    const container: ViewStyle = { flexDirection: 'column', gap };
    // The same gap separates the fields part's direct children, so the rhythm is uniform
    // whether siblings are two fields or the fields block and the action row.
    const fields: ViewStyle = { flexDirection: 'column', gap };
    // Inline start, so a single bare action keeps its natural width rather than stretching.
    const actionsPart: ViewStyle = { alignItems: 'flex-start' };
    const summary: ViewStyle = {
      borderStyle: 'solid',
      borderWidth: overrides?.errorSummaryBorderWidth
        ? (resolveToken(t, overrides.errorSummaryBorderWidth) as number)
        : t.borderWidthThin,
      borderColor: overrides?.errorSummaryBorder
        ? (resolveToken(t, overrides.errorSummaryBorder) as string)
        : t.colorBorderDanger,
      borderRadius: overrides?.errorSummaryRadius ? (resolveToken(t, overrides.errorSummaryRadius) as number) : t.radiusMd,
      backgroundColor: t.colorBackgroundSubtle,
      padding: overrides?.errorSummaryPadding ? (resolveToken(t, overrides.errorSummaryPadding) as number) : t.spaceMd,
    };
    return { container, fields, actions: actionsPart, summary };
  }, [
    t,
    overrides?.gap,
    overrides?.errorSummaryBorder,
    overrides?.errorSummaryBorderWidth,
    overrides?.errorSummaryRadius,
    overrides?.errorSummaryPadding,
  ]);

  // errorSummaryGap is forwarded to both Stacks, never resolved on their behalf.
  const summaryGapOverrides = { gap: overrides?.errorSummaryGap };

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
        {showSummary ? (
          <View testID="Form.errorSummary" accessibilityLiveRegion="assertive" style={styles.summary}>
            <Stack gap="tight" overrides={summaryGapOverrides}>
              <Text ref={headingRef} tone="danger" weight="semibold">
                {heading}
              </Text>
              <Stack gap="tight" overrides={summaryGapOverrides}>
                {errorEntries.map(([fieldName, text]) => (
                  <Text key={fieldName} tone="danger">
                    <Link
                      href={fieldName}
                      label={text}
                      tone="inherit"
                      onPress={() => {
                        handles.current.get(fieldName)?.focus();
                        // Moves focus only; never hands off to Linking.
                        return false;
                      }}
                    />
                  </Text>
                ))}
              </Stack>
            </Stack>
          </View>
        ) : null}
        <View testID="Form.fields" style={styles.fields}>
          {children}
        </View>
        <View testID="Form.actions" style={styles.actions}>
          {actions}
        </View>
      </View>
    </FormContext.Provider>
  );
}
