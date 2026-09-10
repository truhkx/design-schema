import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Form.js';
import './Input.js';
import './Button.js';
import './Stack.js';
import type { FormValidate } from './Form.js';

interface FormArgs {
  name?: string;
  label?: string;
  validate: FormValidate;
  disabled: boolean;
  errorSummary: boolean;
}

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
    name: 'profile',
    label: 'Profile',
    validate: 'submit',
    disabled: false,
    errorSummary: true,
  },
  render: (args) => html`
    <ds-form
      name=${ifDefined(args.name)}
      label=${ifDefined(args.label)}
      validate=${args.validate}
      ?disabled=${args.disabled}
      .errorSummary=${args.errorSummary}
    >
      <ds-input label="Full name" name="name" autocomplete="name" required></ds-input>
      <ds-input
        label="Email address"
        name="email"
        type="email"
        autocomplete="email"
        description="Use the email you signed up with."
        required
      ></ds-input>
      <ds-stack direction="horizontal" gap="2" align="center">
        <ds-button type="submit" label="Save changes"></ds-button>
        <ds-button variant="ghost" label="Cancel"></ds-button>
      </ds-stack>
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

/* boolean states */
export const Disabled: Story = { args: { disabled: true } };
export const WithoutErrorSummary: Story = { args: { errorSummary: false } };
