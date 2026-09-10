import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Form.js';
import './Input.js';
import './Button.js';
import './Stack.js';
import type { FormValidate } from './Form.js';

interface FormArgs {
  name: string;
  label?: string;
  validate: FormValidate;
  disabled: boolean;
  errorSummary: boolean;
}

const fields = html`
  <ds-stack gap="normal">
    <ds-input label="Email address" name="email" type="email" required autocomplete="email"></ds-input>
    <ds-input
      label="Password"
      name="password"
      type="password"
      required
      autocomplete="current-password"
      description="At least 8 characters."
    ></ds-input>
  </ds-stack>
`;

const actions = html`
  <ds-stack slot="actions" direction="horizontal" gap="tight" align="start">
    <ds-button label="Sign in" type="submit"></ds-button>
    <ds-button label="Cancel" variant="secondary"></ds-button>
  </ds-stack>
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
  render: (args) => html`
    <ds-form
      name=${args.name}
      label=${ifDefined(args.label)}
      validate=${args.validate}
      ?disabled=${args.disabled}
      ?error-summary=${args.errorSummary}
    >
      ${fields}
      ${actions}
    </ds-form>
  `,
};

export default meta;
type Story = StoryObj<FormArgs>;

export const Default: Story = {};

/* validate */
export const ValidateSubmit: Story = { args: { validate: 'submit' } };
export const ValidateBlur: Story = { args: { validate: 'blur' } };
export const ValidateChange: Story = { args: { validate: 'change' } };

/* booleans */
export const Disabled: Story = { args: { disabled: true } };
export const WithoutErrorSummary: Story = { args: { errorSummary: false } };
