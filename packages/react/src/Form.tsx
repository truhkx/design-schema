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
  type FormValidateMode,
} from './FormContext';
import { Link } from './Link';
import { Stack } from './Stack';
import { Text } from './Text';
import './Form.css';

export type { FormValidateMode, FormFieldValue } from './FormContext';

/**
 * Collected values keyed by field `name`: Input and RadioGroup contribute strings, Switch a boolean,
 * Checkbox its `value` when checked, NumberInput and Slider a number, multi-select Listbox, Select and
 * Combobox a string array, a range Slider or DatePicker a pair. Empty, unchecked, unselected and
 * disabled fields contribute no key.
 */
export type FormValues = Record<string, string | number | boolean | string[] | [number, number]>;
/** Error messages keyed by field `name`. */
export type FormErrors = Record<string, string>;

/**
 * copy.* — used verbatim. `summaryHeading` is selected by `Intl.PluralRules` on `count`;
 * `summaryHeadingOne` and `invalidSummary` are not rendered on web.
 */
const COPY = {
  summaryHeading: {
    one: '1 problem with this form',
    other: '{count} problems with this form',
  },
  summaryHeadingOne: '1 problem with this form',
  invalidSummary: 'This form has errors.',
} as const;

/**
 * The summary heading, pluralised by `count` in `locale` — the nearest `lang` ancestor at the failed
 * submit. A tag `Intl.PluralRules` rejects falls back to the runtime default locale rather than throwing.
 */
function summaryHeading(count: number, locale: string | undefined): string {
  let rules: Intl.PluralRules;
  try {
    rules = new Intl.PluralRules(locale);
  } catch {
    rules = new Intl.PluralRules();
  }
  const form = rules.select(count) === 'one' ? COPY.summaryHeading.one : COPY.summaryHeading.other;
  return form.replace('{count}', String(count));
}

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type FormOverridableBinding =
  | 'gap'
  | 'errorSummaryBorder'
  | 'errorSummaryBorderWidth'
  | 'errorSummaryRadius'
  | 'errorSummaryPadding'
  | 'errorSummaryGap';

/** CSS hooks written inline. `errorSummaryGap` is absent: it is forwarded to the summary's Stack `gap`. */
const OVERRIDE_HOOK: Record<Exclude<FormOverridableBinding, 'errorSummaryGap'>, string> = {
  gap: '--ds-form-gap',
  errorSummaryBorder: '--ds-form-error-summary-border',
  errorSummaryBorderWidth: '--ds-form-error-summary-border-width',
  errorSummaryRadius: '--ds-form-error-summary-radius',
  errorSummaryPadding: '--ds-form-error-summary-padding',
};

function overridesToStyle(
  overrides: Partial<Record<FormOverridableBinding, TokenRef | undefined>>,
): CSSProperties | undefined {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(OVERRIDE_HOOK) as (keyof typeof OVERRIDE_HOOK)[]) {
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
    | 'aria-disabled'
    | 'style'
    | 'className'
  > {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: ReactNode;
  /** The action row: at least one Button with `type: submit`, primary first (Form's action-order rule). Rendered after the fields with the form gap. A single action renders bare; two or more go in a horizontal Stack the consumer supplies. */
  actions: ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. An unnamed form bases its ids on a generated unique id; two forms given the same `name` on one page is an authoring error Form does not detect. */
  name?: string | undefined;
  /** Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form and `labelledBy` is not set. Nothing enforces this at runtime and no dev warning is emitted. */
  label?: string | undefined;
  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  labelledBy?: string | undefined;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. `change` validates on change only; after a failed submission every mode re-validates on blur and change, until a successful submission resets that state. */
  validate?: FormValidateMode | undefined;
  /** Disables every field and action inside. Use while submitting. Each field and action dims itself with its own disabled style; the Form container applies no opacity of its own and puts no disabled attribute on the form element. */
  disabled?: boolean | undefined;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. Each item's text is the field's own message verbatim; a field invalid with an empty message shows its `label` instead, and its `name` when the label is empty too. */
  errorSummary?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the form is submitted and every field is valid. Receives the collected values keyed by field name. */
  onSubmit?: ((values: FormValues) => void) | undefined;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: ((errors: FormErrors) => void) | undefined;
}

/** A null, empty-string or empty-array value contributes no key to `onSubmit`; `false` and `0` are values. */
function isEmptyValue(value: unknown): boolean {
  return value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function shallowEqual(a: Readonly<FormErrors>, b: Readonly<FormErrors>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
}

/** One validation pass over the enabled fields, in document order. */
interface ValidationPass {
  errors: FormErrors;
  values: FormValues;
  firstInvalid: FormFieldRegistration | null;
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
  // An unnamed form bases its ids on a generated unique id. Ids are opaque: the summary's
  // `href="#<field id>"` works only because the click default is prevented and focus goes through
  // the registration — never treat them as real fragments.
  const idBase = name ?? `ds-form${generatedId}`;
  const summaryId = `${idBase}-error-summary`;

  const fieldsRef = useRef(new Map<string, FormFieldRegistration>());
  // Last registration seen per name, so a summary entry keeps its label after its field unregisters.
  const knownFieldsRef = useRef(new Map<string, FormFieldRegistration>());
  const [errors, setErrors] = useState<FormErrors>({});
  // Counts failed submissions (the summary refocuses on each); a successful submission resets it.
  // After a failed submission every mode re-validates on blur and change (`submitFailed`).
  const [failedSubmissions, setFailedSubmissions] = useState(0);
  const submitFailed = failedSubmissions > 0;
  // Plural locale for the summary heading: the nearest `lang` ancestor, read once at the failed
  // submit and reused as the summary shrinks, since the heading is announced once.
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  const register = useCallback((field: FormFieldRegistration) => {
    fieldsRef.current.set(field.name, field);
    knownFieldsRef.current.set(field.name, field);
    return () => {
      if (fieldsRef.current.get(field.name) === field) fieldsRef.current.delete(field.name);
    };
  }, []);

  /**
   * Registered fields in document order, sorted by the position of each field's `data-ds-field`
   * host — `getElementById(id).closest('[data-ds-field]')`. Fields whose host is not found keep
   * their registration order at the end. A field inside a closed Disclosure has unmounted and
   * unregistered, so it is simply absent; Form does no Disclosure check of its own.
   */
  const orderedFields = useCallback((): FormFieldRegistration[] => {
    const fields = [...fieldsRef.current.values()];
    const root = formRef.current;
    if (!root) return fields;
    const hosts = [...root.querySelectorAll('[data-ds-field]')];
    const position = new Map<FormFieldRegistration, number>();
    for (const field of fields) {
      const host = root.ownerDocument.getElementById(field.id)?.closest('[data-ds-field]');
      const index = host ? hosts.indexOf(host) : -1;
      position.set(field, index === -1 ? Number.POSITIVE_INFINITY : index);
    }
    return fields.sort((a, b) => {
      const pa = position.get(a)!;
      const pb = position.get(b)!;
      return pa === pb ? 0 : pa < pb ? -1 : 1;
    });
  }, []);

  /** The enabled fields in document order, by name — a disabled field is skipped, so "next" passes it by. */
  const order = useCallback(
    (): readonly string[] => orderedFields().filter((field) => !field.isDisabled()).map((field) => field.name),
    [orderedFields],
  );

  /**
   * Validates every enabled field once, collecting its message or its value in the same pass.
   * A disabled field is skipped entirely: no validation, no key in the values.
   */
  const runValidation = useCallback((): ValidationPass => {
    const nextErrors: FormErrors = {};
    const values: FormValues = {};
    let firstInvalid: FormFieldRegistration | null = null;

    for (const field of orderedFields()) {
      if (field.isDisabled()) continue;
      const message = field.validate();
      if (message !== null) {
        // The raw validationMessage, empty string included; the label fallback is presentation only.
        nextErrors[field.name] = message;
        firstInvalid ??= field;
      } else {
        const fieldValue = field.getValue();
        if (fieldValue !== undefined && !isEmptyValue(fieldValue)) values[field.name] = fieldValue;
      }
    }

    return { errors: nextErrors, values, firstInvalid };
  }, [orderedFields]);

  /** Reports a failed validation: the plural locale, the summary counter, `onInvalid`, then focus. */
  const reportFailure = useCallback(
    (nextErrors: FormErrors, firstInvalid: FormFieldRegistration): void => {
      const lang = formRef.current?.closest('[lang]')?.getAttribute('lang');
      setLocale(lang ? lang : undefined);
      setFailedSubmissions((count) => count + 1);
      onInvalid?.(nextErrors);
      // The summary takes focus once it has rendered (below); with no summary the first invalid field does.
      if (!errorSummary) firstInvalid.focus();
    },
    [errorSummary, onInvalid],
  );

  const reportValidity = useCallback((): boolean => {
    const pass = runValidation();
    setErrors((prev) => (shallowEqual(prev, pass.errors) ? prev : pass.errors));
    if (pass.firstInvalid === null) return true;
    reportFailure(pass.errors, pass.firstInvalid);
    return false;
  }, [runValidation, reportFailure]);

  const validateField = useCallback(
    (fieldName: string) => {
      // Under `validate: submit`, nothing validates before the first failed submission.
      if (validate === 'submit' && !submitFailed) return;
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
        // A new key lands at the end: an error found after the failed submit is appended there.
        if (hasPrev && prev[fieldName] === message) return prev;
        return { ...prev, [fieldName]: message };
      });
    },
    [validate, submitFailed],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    // A submit attempted while disabled is cancelled early: neither onSubmit nor onInvalid fires.
    if (disabled) return;

    const pass = runValidation();
    setErrors((prev) => (shallowEqual(prev, pass.errors) ? prev : pass.errors));

    if (pass.firstInvalid !== null) {
      reportFailure(pass.errors, pass.firstInvalid);
      return;
    }
    // A successful submission removes the summary and resets the after-failure validation state.
    setFailedSubmissions(0);
    onSubmit?.(pass.values);
  };

  // Focus the summary once it has rendered after a failed submission.
  useEffect(() => {
    if (failedSubmissions > 0 && errorSummary) summaryRef.current?.focus();
  }, [failedSubmissions, errorSummary]);

  const contextValue = useMemo<FormContextValue>(
    () => ({
      disabled,
      validateMode: validate,
      submitFailed,
      errorSummary,
      validate,
      idBase,
      errors,
      order,
      register,
      validateField,
      reportValidity,
    }),
    [disabled, validate, submitFailed, errorSummary, idBase, errors, order, register, validateField, reportValidity],
  );

  const errorEntries = Object.entries(errors);
  const showSummary = errorSummary && failedSubmissions > 0 && errorEntries.length > 0;
  // errorSummaryGap has no --ds-form-* hook: it is forwarded to both summary Stacks' `gap`.
  const summaryGap: Partial<Record<'gap', TokenRef | undefined>> | undefined = overrides?.errorSummaryGap
    ? { gap: overrides.errorSummaryGap }
    : undefined;

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
        {/* The summary is a sibling rendered before the fields part, whatever order the anatomy lists. */}
        {showSummary ? (
          <div
            ref={summaryRef}
            id={summaryId}
            data-part="errorSummary"
            className="ds-form__error-summary"
            role="alert"
            tabIndex={-1}
          >
            <Stack gap="tight" overrides={summaryGap}>
              <Text element="p" weight="semibold" tone="danger">
                {summaryHeading(errorEntries.length, locale)}
              </Text>
              <Stack element="ul" gap="tight" overrides={summaryGap}>
                {/* Stack element="ul" wraps each child in its own `li`. */}
                {errorEntries.map(([fieldName, message]) => {
                  // A field that has unregistered since the failed submit stays as plain danger Text,
                  // falling back to the label from the last registration seen under that name.
                  const field = fieldsRef.current.get(fieldName);
                  const known = field ?? knownFieldsRef.current.get(fieldName);
                  // An empty message falls back to the label, then to the name when the label is empty too.
                  const text = message !== '' ? message : known?.label ? known.label : fieldName;
                  return field ? (
                    <Link
                      key={fieldName}
                      href={`#${field.id}`}
                      label={text}
                      tone="inherit"
                      onClick={() => {
                        // Focus the field; returning false prevents the default, so the hash never changes.
                        field.focus();
                        return false;
                      }}
                    />
                  ) : (
                    <Text key={fieldName} element="span" tone="danger">
                      {text}
                    </Text>
                  );
                })}
              </Stack>
            </Stack>
          </div>
        ) : null}
        {/* fields: `display: contents`, so `gap` spaces its direct children. It carries no style binding. */}
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
