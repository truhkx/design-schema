import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Form.js';
import './Input.js';
import './Button.js';
import './Stack.js';
import './Heading.js';
import type { DsForm, FormValidate } from './Form.js';

interface FormArgs {
  name?: string | undefined;
  label?: string | undefined;
  labelledBy?: string | undefined;
  validate?: FormValidate | undefined;
  disabled?: boolean | undefined;
  errorSummary?: boolean | undefined;
}

/** A required Input name=email label=Email type=email and a required Input name=password label=Password type=password, in a Stack. */
const signInFields: TemplateResult = html`
  <ds-stack gap="normal">
    <ds-input label="Email" name="email" type="email" required></ds-input>
    <ds-input label="Password" name="password" type="password" required></ds-input>
  </ds-stack>
`;

const meta: Meta<FormArgs> = {
  title: 'Form/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['submit', 'invalid'] },
  },
  argTypes: {
    validate: { control: 'inline-radio', options: ['submit', 'blur', 'change'] },
    disabled: { control: 'boolean' },
    errorSummary: { control: 'boolean' },
  },
  args: {
    name: 'sign-in',
    label: 'Sign in',
  },
  render: (args) => html`
    <ds-form
      name=${ifDefined(args.name)}
      label=${ifDefined(args.label)}
      labelledby=${ifDefined(args.labelledBy)}
      validate=${ifDefined(args.validate)}
      ?disabled=${args.disabled ?? false}
      ?no-error-summary=${args.errorSummary === false}
    >
      ${signInFields}
      <ds-button slot="actions" label="Sign in" type="submit"></ds-button>
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

/* examples */

/** The smallest real form - two fields and one submit action, validated on submit. */
export const SignIn: Story = {
  args: { name: 'sign-in', label: 'Sign in' },
};

/** A longer form where feedback per field as focus leaves it beats one report at the end. */
export const LongFormValidatedOnBlur: Story = {
  args: { name: 'profile', label: 'Profile details', validate: 'blur' },
  render: (args) => html`
    <ds-form
      name=${ifDefined(args.name)}
      label=${ifDefined(args.label)}
      validate=${ifDefined(args.validate)}
      ?disabled=${args.disabled ?? false}
      ?no-error-summary=${args.errorSummary === false}
    >
      <ds-stack gap="normal">
        <ds-input label="Full name" name="fullName" required></ds-input>
        <ds-input label="Email" name="email" type="email" required></ds-input>
        <ds-input label="Phone" name="phone" type="tel" required></ds-input>
        <ds-input label="City" name="city" required></ds-input>
      </ds-stack>
      <ds-button slot="actions" label="Save profile" type="submit"></ds-button>
    </ds-form>
  `,
};

/** A form while its request is in flight - every field and action disabled, so it cannot be submitted twice. */
export const Submitting: Story = {
  args: { name: 'sign-in', label: 'Sign in', disabled: true },
};

/** A short form that reports errors at the fields alone, moving focus to the first invalid one. */
export const WithoutASummary: Story = {
  args: { name: 'rename', label: 'Rename file', errorSummary: false },
  render: (args) => html`
    <ds-form
      name=${ifDefined(args.name)}
      label=${ifDefined(args.label)}
      validate=${ifDefined(args.validate)}
      ?disabled=${args.disabled ?? false}
      ?no-error-summary=${args.errorSummary === false}
    >
      <ds-input label="File name" name="fileName" required></ds-input>
      <ds-button slot="actions" label="Rename" type="submit"></ds-button>
    </ds-form>
  `,
};

/* The sign-in example submitted empty, so the error summary's markup and contrast pair are checked. */
export const FailedSubmit: Story = {
  args: { name: 'sign-in', label: 'Sign in' },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector<DsForm>('ds-form');
    if (form === null) return;
    await form.updateComplete;
    form.submit();
    await form.updateComplete;
  },
};

/* labelledBy wins over label when both are set */
export const LabelledBy: Story = {
  args: { labelledBy: 'form-labelled-by-heading' },
  render: (args) => html`
    <ds-stack gap="normal">
      <ds-heading id="form-labelled-by-heading" level="2">Sign in</ds-heading>
      <ds-form
        name=${ifDefined(args.name)}
        label=${ifDefined(args.label)}
        labelledby=${ifDefined(args.labelledBy)}
        validate=${ifDefined(args.validate)}
        ?disabled=${args.disabled ?? false}
        ?no-error-summary=${args.errorSummary === false}
      >
        ${signInFields}
        <ds-button slot="actions" label="Sign in" type="submit"></ds-button>
      </ds-form>
    </ds-stack>
  `,
};
