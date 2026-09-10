import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import {
  FormContext,
  type FormContextValue,
  type FormFieldRegistration,
  type FormFieldValue,
  type FormValidateMode,
} from './FormContext';
import { Text } from './Text';
import './Form.css';

export type { FormValidateMode, FormFieldValue } from './FormContext';

/** Collected values keyed by field `name`. Strings from Input, booleans from Switch, `value` from a checked Checkbox. */
export type FormValues = Record<string, Exclude<FormFieldValue, undefined>>;
/** Error messages keyed by field `name`. */
export type FormErrors = Record<string, string>;

/** copy.* — used verbatim; `{count}` is replaced by the number of errors. */
const COPY = {
  summaryHeading: '{count} problems with this form',
  summaryHeadingOne: '1 problem with this form',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type FormOverridableBinding = 'gap' | 'errorSummaryBorder';

const OVERRIDE_HOOK: Record<FormOverridableBinding, string> = {
  gap: '--ds-form-gap',
  errorSummaryBorder: '--ds-form-error-summary-border',
};

function overridesToStyle(overrides: Partial<Record<FormOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as FormOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface FormProps
  extends Omit<
    ComponentPropsWithoutRef<'form'>,
    'children' | 'name' | 'onSubmit' | 'onInvalid' | 'noValidate' | 'aria-label' | 'aria-labelledby'
  > {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: ReactNode;
  /** The action row: at least one Button with `type: submit`, primary first (Form's action-order
   * rule). Rendered after the fields with the form gap. */
  actions: ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. */
  name?: string;
  /** Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form and `labelledBy` is not set. */
  label?: string;
  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  labelledBy?: string;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  validate?: FormValidateMode;
  /** Disables every field and action inside. Use while submitting. */
  disabled?: boolean;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. */
  errorSummary?: boolean;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<FormOverridableBinding, TokenRef>>;
  /** Fired when the form is submitted and every field is valid. Receives the collected values keyed by field name. */
  onSubmit?: (values: FormValues) => void;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: (errors: FormErrors) => void;
}

function shallowEqual(a: Readonly<FormErrors>, b: Readonly<FormErrors>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
}

/**
 * Form — Design Schema, category: container.
 *
 * When to use:
 * Use Form whenever two or more fields are submitted together, and for any single field whose
 * submission has consequences (sign-in, search with side effects). Place actions (submit, cancel)
 * at the end in a Stack. Give the form a `label` when the page contains more than one.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  {
    children,
    actions,
    name,
    label,
    labelledBy,
    validate = 'submit',
    disabled = false,
    errorSummary = true,
    overrides,
    onSubmit,
    onInvalid,
    className,
    style,
    ...rest
  },
  ref,
) {
  const formRef = useRef<HTMLFormElement | null>(null);
  useImperativeHandle(ref, () => formRef.current as HTMLFormElement, []);

  const generatedId = useId();
  const idBase = name ?? `ds-form${generatedId}`;
  const summaryId = `${idBase}-error-summary`;

  // Registered fields in registration (≈ DOM) order.
  const fieldsRef = useRef(new Map<string, FormFieldRegistration>());
  const [errors, setErrors] = useState<FormErrors>({});
  // Once a submission has failed, fields re-validate on blur/change even in `submit` mode so
  // errors clear as they are fixed.
  const submittedRef = useRef(false);
  const [failedSubmissions, setFailedSubmissions] = useState(0);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  const register = useCallback((field: FormFieldRegistration) => {
    fieldsRef.current.set(field.name, field);
    return () => {
      if (fieldsRef.current.get(field.name) === field) fieldsRef.current.delete(field.name);
    };
  }, []);

  const validateField = useCallback(
    (fieldName: string) => {
      if (validate === 'submit' && !submittedRef.current) return;
      const field = fieldsRef.current.get(fieldName);
      if (!field) return;
      const message = field.isDisabled() ? null : field.validate();
      setErrors((prev) => {
        const hasPrev = Object.prototype.hasOwnProperty.call(prev, fieldName);
        if (message === null) {
          if (!hasPrev) return prev;
          const next = { ...prev };
          delete next[fieldName];
          return next;
        }
        if (hasPrev && prev[fieldName] === message) return prev;
        return { ...prev, [fieldName]: message };
      });
    },
    [validate],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    submittedRef.current = true;

    const nextErrors: FormErrors = {};
    const values: FormValues = {};
    let firstInvalid: FormFieldRegistration | null = null;

    for (const field of fieldsRef.current.values()) {
      if (field.isDisabled()) continue;
      const message = field.validate();
      if (message !== null) {
        nextErrors[field.name] = message;
        if (firstInvalid === null) firstInvalid = field;
      } else {
        const fieldValue = field.getValue();
        if (fieldValue !== undefined) values[field.name] = fieldValue;
      }
    }

    setErrors((prev) => (shallowEqual(prev, nextErrors) ? prev : nextErrors));

    if (firstInvalid !== null) {
      onInvalid?.(nextErrors);
      if (errorSummary) {
        setFailedSubmissions((count) => count + 1);
      } else {
        firstInvalid.focus();
      }
      return;
    }
    onSubmit?.(values);
  };

  // Move focus to the summary once it has rendered after a failed submission.
  useEffect(() => {
    if (failedSubmissions > 0 && errorSummary) summaryRef.current?.focus();
  }, [failedSubmissions, errorSummary]);

  const contextValue = useMemo<FormContextValue>(
    () => ({ disabled, validate, idBase: name, errors, register, validateField }),
    [disabled, validate, name, errors, register, validateField],
  );

  const errorEntries = Object.entries(errors);
  const showSummary = errorSummary && errorEntries.length > 0;

  const focusField = (fieldName: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const field = fieldsRef.current.get(fieldName);
    if (field) {
      event.preventDefault();
      field.focus();
    }
  };

  const classes = ['ds-form', className ?? null].filter(Boolean).join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <FormContext.Provider value={contextValue}>
      <form
        {...rest}
        ref={formRef}
        name={name}
        data-ds="Form"
        data-part="container"
        className={classes}
        style={mergedStyle}
        noValidate
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        onSubmit={handleSubmit}
      >
        {showSummary ? (
          <div
            ref={summaryRef}
            id={summaryId}
            data-part="errorSummary"
            className="ds-form__error-summary"
            role="alert"
            tabIndex={-1}
          >
            <Text element="p" weight="semibold" tone="danger" className="ds-form__error-summary-heading">
              {errorEntries.length === 1
                ? COPY.summaryHeadingOne
                : COPY.summaryHeading.replace('{count}', String(errorEntries.length))}
            </Text>
            <ul className="ds-form__error-list">
              {errorEntries.map(([fieldName, message]) => {
                const field = fieldsRef.current.get(fieldName);
                const href = field ? `#${field.id}` : undefined;
                return (
                  <li key={fieldName}>
                    <a className="ds-form__error-link" href={href} onClick={focusField(fieldName)}>
                      {field ? `${field.label}: ${message}` : message}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <div className="ds-form__fields" data-part="fields">
          {children}
        </div>
        <div className="ds-form__actions" data-part="actions">
          {actions}
        </div>
      </form>
    </FormContext.Provider>
  );
});
