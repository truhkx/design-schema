import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Form.js';
import './Input.js';
import './Button.js';
import './Stack.js';
import type { FormValidate } from './Form.js';

interface FormArgs {
  name?: string | undefined;
  label?: string | undefined;
  labelledBy?: string | undefined;
  validate?: FormValidate | undefined;
  disabled?: boolean | undefined;
  errorSummary?: boolean | undefined;
}

const signInFields = html`
  <ds-stack gap="normal">
    <ds-input label="Email" name="email" type="email" required></ds-input>
    <ds-input label="Password" name="password" type="password" required></ds-input>
  </ds-stack>
`;

const submitAction = (label: string): TemplateResult => html`
  <ds-stack slot="actions" direction="horizontal" gap="tight" align="start">
    <ds-button label=${label} type="submit"></ds-button>
  </ds-stack>
`;

const renderForm = (args: FormArgs, fields: TemplateResult, actions: TemplateResult): TemplateResult => html`
  <ds-form
    name=${ifDefined(args.name)}
    label=${ifDefined(args.label)}
    labelledBy=${ifDefined(args.labelledBy)}
    validate=${ifDefined(args.validate)}
    ?disabled=${args.disabled ?? false}
    ?no-error-summary=${args.errorSummary === false}
  >
    ${fields} ${actions}
  </ds-form>
`;

const meta: Meta<FormArgs> = {
  title: 'Form/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['submit', 'invalid'] },
  },
  argTypes: {
    validate: { control: 'select', options: ['submit', 'blur', 'change'] },
    disabled: { control: 'boolean' },
    errorSummary: { control: 'boolean' },
  },
  args: {
    name: 'sign-in',
    label: 'Sign in',
    validate: 'submit',
    disabled: false,
    errorSummary: true,
  },
  render: (args) => renderForm(args, signInFields, submitAction('Sign in')),
};

export default meta;
type Story = StoryObj<FormArgs>;

export const Default: Story = {};

/* validate */
export const ValidateSubmit: Story = { args: { validate: 'submit' } };
export const ValidateBlur: Story = { args: { validate: 'blur' } };
export const ValidateChange: Story = { args: { validate: 'change' } };

/* states */
export const Disabled: Story = { args: { disabled: true } };
export const NoErrorSummary: Story = { args: { errorSummary: false } };

/* examples */

/** The smallest real form - two fields and one submit action, validated on submit. */
export const SignIn: Story = {
  args: { name: 'sign-in', label: 'Sign in' },
  render: (args) => renderForm(args, signInFields, submitAction('Sign in')),
};

/** A longer form where feedback per field as focus leaves it beats one report at the end. */
export const LongFormValidatedOnBlur: Story = {
  args: { name: 'profile', label: 'Profile details', validate: 'blur' },
  render: (args) =>
    renderForm(
      args,
      html`
        <ds-stack gap="normal">
          <ds-input label="Full name" name="fullName" required></ds-input>
          <ds-input label="Email" name="email" required></ds-input>
          <ds-input label="Phone" name="phone" required></ds-input>
          <ds-input label="City" name="city" required></ds-input>
        </ds-stack>
      `,
      submitAction('Save profile'),
    ),
};

/** A form while its request is in flight - every field and action disabled, so it cannot be submitted twice. */
export const Submitting: Story = {
  args: { name: 'sign-in', label: 'Sign in', disabled: true },
  render: (args) => renderForm(args, signInFields, submitAction('Sign in')),
};

/** A short form that reports errors at the fields alone, moving focus to the first invalid one. */
export const WithoutASummary: Story = {
  args: { name: 'rename', label: 'Rename file', errorSummary: false },
  render: (args) =>
    renderForm(args, html`<ds-input label="File name" name="fileName" required></ds-input>`, submitAction('Rename')),
};
