import * as React from 'react';

/** When field-level validation runs. Mirrors Form's `validate` prop. */
export type FormValidateMode = 'submit' | 'blur' | 'change';

/**
 * What one field contributes on submit: a string (Input, RadioGroup, a checked
 * Checkbox's `value`), a boolean (Switch), an array of strings (a `multiple`
 * Listbox), or `undefined` for an unchecked Checkbox or an empty Listbox selection,
 * which is then left out of the collected values.
 */
export type FormFieldValue = string | boolean | string[] | undefined;

/** The values `onSubmit` receives, keyed by field name. */
export type FormValues = Record<string, Exclude<FormFieldValue, undefined>>;

/** What a field (Input, Checkbox, Switch, RadioGroup) registers with the enclosing Form. */
export interface FormFieldHandle {
  /** The field's visible label, so the error summary can read "Label: message". */
  label?: string | undefined;
  /** Current value of the field. `undefined` means "contributes nothing". */
  getValue(): FormFieldValue;
  /** Returns an error message when the field is invalid, otherwise `null`. */
  validate(): string | null;
  /** Moves keyboard and accessibility focus to the field. */
  focus(): void;
}

export interface FormContextValue {
  /** Registers a field by `name`. Registration order is the field order. */
  register(name: string, handle: FormFieldHandle): void;
  /** Removes a field on unmount (or when it becomes disabled). */
  unregister(name: string): void;
  /** Validates every field and fires `onSubmit` or `onInvalid`. */
  submit(): void;
  /** Moves focus to the named field, if registered. Used by the keyboard's "next" key. */
  focusField(name: string): void;
  /** Reports the result of a `blur`/`change` validation run for one field. */
  reportValidity(name: string, error: string | null): void;
  /** `true` when the Form is disabled; every field and action inside follows. */
  disabled: boolean;
  /** The Form's `validate` setting. */
  validateMode: FormValidateMode;
  /** Whether the Form renders (and announces) its own error summary. */
  errorSummary: boolean;
  /** Errors from the most recent validation, keyed by field name. */
  errors: Readonly<Partial<Record<string, string | undefined>>>;
  /** Field names in registration order; the last one gets `returnKeyType="done"`. */
  order: readonly string[];
}

/** `null` outside of a Form so Button and Input work standalone. */
export const FormContext: React.Context<FormContextValue | null> = React.createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue | null {
  return React.useContext(FormContext);
}
