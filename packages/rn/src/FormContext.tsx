import * as React from 'react';

export type FormValidateMode = 'submit' | 'blur' | 'change';

/** A field's contributed value: a string (Input, RadioGroup), a boolean (Switch, a checked Checkbox), or `undefined` (an unchecked Checkbox, an unselected RadioGroup, a disabled field) to omit the key entirely. */
export type FormFieldValue = string | boolean;

/** Collected values keyed by field `name`, as delivered to `onSubmit`. */
export type FormValues = Record<string, FormFieldValue>;

/**
 * What a field (Input, Checkbox, Switch, RadioGroup) registers with the enclosing
 * Form so it can be collected, validated and focused without Form knowing its type.
 */
export interface FormFieldHandle {
  /** The field's current contribution, or `undefined` to omit it from the submitted values. */
  getValue: () => FormFieldValue | undefined;
  /** Runs the field's own validation (its `error` prop, then `required`, then `invalid`) and returns the message, or `null` when valid. */
  validate: () => string | null;
  /** Moves input focus to the field and, where supported, accessibility focus with it. */
  focus: () => void;
}

/** What Form shares with the fields and actions inside it. `null` outside of a Form so every field and Button work standalone. */
export interface FormContextValue {
  register: (name: string, handle: FormFieldHandle) => void;
  unregister: (name: string) => void;
  submit: () => void;
  focusField: (name: string) => void;
  reportValidity: (name: string, error: string | null) => void;
  disabled: boolean;
  validateMode: FormValidateMode;
  errorSummary: boolean;
  errors: Readonly<Partial<Record<string, string>>>;
  /** Field names in registration (mount) order, used to route the return key to the next field. */
  order: readonly string[];
}

export const FormContext = React.createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue | null {
  return React.useContext(FormContext);
}
