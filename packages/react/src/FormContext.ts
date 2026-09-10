import { createContext, useContext } from 'react';

/** When field-level validation runs. Mirrors the Form `validate` prop. */
export type FormValidateMode = 'submit' | 'blur' | 'change';

/**
 * What a field contributes to the collected values. Input contributes a string, Switch a
 * boolean, Checkbox its `value` when checked, Listbox an array of values when `multiple`, and
 * `undefined` when not; `undefined` is omitted.
 */
export type FormFieldValue = string | string[] | boolean | undefined;

/**
 * What an Input registers with its enclosing Form so the Form can collect
 * values, run validation, and move focus without reaching into the DOM.
 */
export interface FormFieldRegistration {
  /** Field name; the key used in `onSubmit(values)` and `onInvalid(errors)`. */
  name: string;
  /** DOM id of the field, used by the error summary links. */
  id: string;
  /** Visible label, repeated in the error summary. */
  label: string;
  /** Current value read from the field. `undefined` leaves the field out of the submitted values. */
  getValue(): FormFieldValue;
  /** Disabled fields are skipped by validation and omitted from values. */
  isDisabled(): boolean;
  /** Returns an error message, or `null` when the field is valid. */
  validate(): string | null;
  /** Moves keyboard focus to the field. */
  focus(): void;
}

export interface FormContextValue {
  /** `true` while the Form is disabled; every field and action reflects it. */
  disabled: boolean;
  /** The Form's `validate` mode. */
  validate: FormValidateMode;
  /** Base for generated ids, derived from the Form's `name`. */
  idBase: string | undefined;
  /** Errors currently held by the Form, keyed by field name. */
  errors: Readonly<Record<string, string>>;
  /** Registers a field; returns the matching unregister function. */
  register(field: FormFieldRegistration): () => void;
  /** Re-runs validation for one field and updates `errors`. */
  validateField(name: string): void;
}

export const FormContext = createContext<FormContextValue | null>(null);

/** Returns the enclosing Form's context, or `null` outside a Form. */
export function useFormContext(): FormContextValue | null {
  return useContext(FormContext);
}
