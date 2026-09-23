import { createContext, useContext, type Context } from 'react';

/** When field-level validation runs. Mirrors the Form `validate` prop. */
export type FormValidateMode = 'submit' | 'blur' | 'change';

/**
 * What a field contributes to the collected values. Input and RadioGroup contribute a string,
 * Switch a boolean, Checkbox its `value` when checked, NumberInput and Slider a number,
 * multi-select Listbox, Select and Combobox a string array, a range Slider or DatePicker a pair;
 * `undefined` (unchecked, unselected, empty) is omitted.
 */
export type FormFieldValue = string | number | boolean | string[] | [number, number] | undefined;

/**
 * What a field registers with its enclosing Form so the Form can collect values, run validation,
 * and move focus without reaching into the DOM.
 */
export interface FormFieldRegistration {
  /** Field name; the key used in `onSubmit(values)` and `onInvalid(errors)`. */
  name: string;
  /** DOM id of the field, used by the error summary links. */
  id: string;
  /** Visible label; the error summary shows it when the field is invalid with an empty message. */
  label: string;
  /** Current value read from the field. `undefined` leaves the field out of the submitted values. */
  getValue(): FormFieldValue;
  /** Disabled fields are skipped by validation and omitted from values and from `order`. */
  isDisabled(): boolean;
  /** Returns an error message, or `null` when the field is valid. */
  validate(): string | null;
  /** Moves keyboard focus to the field. */
  focus(): void;
}

export interface FormContextValue {
  /** `true` while the Form is disabled; every field and action reflects it. */
  disabled: boolean;
  /**
   * The Form's `validate` mode. A field validates on blur when this is `blur` or `submitFailed` is
   * true, and on change when this is `change` or `submitFailed` is true.
   */
  validateMode: FormValidateMode;
  /** `true` after a failed submission, until a successful one resets it. */
  submitFailed: boolean;
  /**
   * `true` while the Form renders an error summary, so a field can stay silent about its own error
   * while the Form announces every one of them.
   */
  errorSummary: boolean;
  /** Same as `validateMode`; read by fields generated before `submitFailed` existed. */
  validate: FormValidateMode;
  /** Base for generated ids: the Form's `name`, or a generated unique id when it has none. */
  idBase: string | undefined;
  /** Errors currently held by the Form, keyed by field name. */
  errors: Readonly<Record<string, string>>;
  /**
   * Enabled registered fields in document order, by name — what gives a field its "next" key.
   * Web submits with Enter natively, so this is read at call time rather than tracked in state:
   * it reflects the fields registered now, not a value a field can re-render on.
   */
  order(): readonly string[];
  /** Registers a field; returns the matching unregister function. */
  register(field: FormFieldRegistration): () => void;
  /** Re-runs validation for one field and updates `errors`. */
  validateField(name: string): void;
  /**
   * Validates every enabled field, updates `errors`, and reports a failure the way a failed submit
   * does — `onInvalid`, then focus to the summary or to the first invalid field. Returns `true` when
   * every field is valid. A disabled Form has no enabled fields, so it reports valid and fires nothing.
   */
  reportValidity(): boolean;
}

export const FormContext: Context<FormContextValue | null> = createContext<FormContextValue | null>(null);

/** Returns the enclosing Form's context, or `null` outside a Form. */
export function useFormContext(): FormContextValue | null {
  return useContext(FormContext);
}
