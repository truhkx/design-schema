import {
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
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import {
  FormContext,
  type FormContextValue,
  type FormFieldRegistration,
  type FormFieldValue,
  type FormValidateMode,
} from './FormContext';
import { Link } from './Link';
import { Stack } from './Stack';
import { Text } from './Text';
import './Form.css';

export type { FormValidateMode, FormFieldValue } from './FormContext';

/** Collected values keyed by field `name`. Strings from Input and RadioGroup, a boolean from Switch, `value` from a checked Checkbox. */
export type FormValues = Record<string, Exclude<FormFieldValue, undefined>>;
/** Error messages keyed by field `name`. */
export type FormErrors = Record<string, string>;

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

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type FormOverridableBinding = 'gap' | 'errorSummaryBorder';

const OVERRIDE_HOOK: Record<FormOverridableBinding, string> = {
  gap: '--ds-form-gap',
  errorSummaryBorder: '--ds-form-error-summary-border',
};

function overridesToStyle(
  overrides: Partial<Record<FormOverridableBinding, TokenRef | undefined>>,
): CSSProperties | undefined {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(OVERRIDE_HOOK) as FormOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}

export interface FormProps
  extends Omit<
    ComponentPropsWithoutRef<'form'>,
    | 'children'
    | 'name'
    | 'onSubmit'
    | 'onInvalid'
    | 'noValidate'
    | 'action'
    | 'aria-label'
    | 'aria-labelledby'
    | 'style'
    | 'className'
  > {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: ReactNode;
  /** The action row: at least one Button with `type: submit`, primary first (Form's action-order rule). Rendered after the fields with the form gap. */
  actions: ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. */
  name?: string | undefined;
  /** Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form and `labelledBy` is not set. */
  label?: string | undefined;
  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  labelledBy?: string | undefined;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  validate?: FormValidateMode | undefined;
  /** Disables every field and action inside. Use while submitting. */
  disabled?: boolean | undefined;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. Each item reads "Label: message". */
  errorSummary?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the form is submitted and every field is valid. Receives the collected values keyed by field name. */
  onSubmit?: ((values: FormValues) => void) | undefined;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: ((errors: FormErrors) => void) | undefined;
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
export function Form({
  ref,
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
  ...rest
}: FormProps & { ref?: Ref<HTMLFormElement> | undefined }): ReactElement {
  const formRef = useRef<HTMLFormElement | null>(null);
  useImperativeHandle(ref, () => formRef.current as HTMLFormElement, []);

  const generatedId = useId();
  const summaryId = `${name ?? `ds-form${generatedId}`}-error-summary`;

  const fieldsRef = useRef(new Map<string, FormFieldRegistration>());
  const [errors, setErrors] = useState<FormErrors>({});
  // After a failed submission, fields re-validate on blur and change even under `validate: submit`.
  const submittedRef = useRef(false);
  const [failedSubmissions, setFailedSubmissions] = useState(0);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  const register = useCallback((field: FormFieldRegistration) => {
    fieldsRef.current.set(field.name, field);
    return () => {
      if (fieldsRef.current.get(field.name) === field) fieldsRef.current.delete(field.name);
    };
  }, []);

  /** Registered fields in document order, so the first invalid field is the first one on the page. */
  const orderedFields = (): FormFieldRegistration[] => {
    const fields = [...fieldsRef.current.values()];
    const root = formRef.current;
    if (!root) return fields;
    const position = new Map<FormFieldRegistration, Element | null>();
    for (const field of fields) position.set(field, root.ownerDocument.getElementById(field.id));
    return fields.sort((a, b) => {
      const elA = position.get(a);
      const elB = position.get(b);
      if (!elA || !elB || elA === elB) return 0;
      return elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  };

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (disabled) return;
    submittedRef.current = true;

    const nextErrors: FormErrors = {};
    const values: FormValues = {};
    let firstInvalid: FormFieldRegistration | null = null;

    for (const field of orderedFields()) {
      if (field.isDisabled()) continue;
      const message = field.validate();
      if (message !== null) {
        nextErrors[field.name] = message;
        firstInvalid ??= field;
      } else {
        const fieldValue = field.getValue();
        if (fieldValue !== undefined) values[field.name] = fieldValue;
      }
    }

    setErrors((prev) => (shallowEqual(prev, nextErrors) ? prev : nextErrors));

    if (firstInvalid !== null) {
      onInvalid?.(nextErrors);
      if (errorSummary) setFailedSubmissions((count) => count + 1);
      else firstInvalid.focus();
      return;
    }
    onSubmit?.(values);
  };

  // Focus the summary once it has rendered after a failed submission.
  useEffect(() => {
    if (failedSubmissions > 0 && errorSummary) summaryRef.current?.focus();
  }, [failedSubmissions, errorSummary]);

  const contextValue = useMemo<FormContextValue>(
    () => ({ disabled, validate, idBase: name, errors, register, validateField }),
    [disabled, validate, name, errors, register, validateField],
  );

  const errorEntries = Object.entries(errors);
  const showSummary = errorSummary && errorEntries.length > 0;

  return (
    <FormContext.Provider value={contextValue}>
      <form
        {...rest}
        ref={formRef}
        name={name}
        data-ds="Form"
        data-part="container"
        className="ds-form"
        style={overrides ? overridesToStyle(overrides) : undefined}
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
            <Stack gap="tight">
              <Text element="p" weight="semibold" tone="danger">
                {summaryHeading(errorEntries.length)}
              </Text>
              <Stack element="ul" gap="tight">
                {errorEntries.map(([fieldName, message]) => {
                  const field = fieldsRef.current.get(fieldName);
                  return (
                    <li key={fieldName}>
                      {field ? (
                        <Link
                          href={`#${field.id}`}
                          label={`${field.label}: ${message}`}
                          tone="inherit"
                          onClick={() => {
                            field.focus();
                            return false;
                          }}
                        />
                      ) : (
                        <Text element="span" tone="danger">
                          {message}
                        </Text>
                      )}
                    </li>
                  );
                })}
              </Stack>
            </Stack>
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
}
