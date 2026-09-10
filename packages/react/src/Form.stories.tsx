import type { Meta, StoryObj } from '@storybook/react';
import { Form } from './Form';
import { Input } from './Input';
import { Button } from './Button';
import { Stack } from './Stack';

const fields = (
  <Stack gap="normal">
    <Input label="Email address" name="email" type="email" required autocomplete="email" />
    <Input
      label="Password"
      name="password"
      type="password"
      required
      autocomplete="current-password"
      description="At least 8 characters."
    />
    <Stack direction="horizontal" gap="tight" align="start">
      <Button label="Sign in" type="submit" />
      <Button label="Cancel" variant="secondary" />
    </Stack>
  </Stack>
);

const meta = {
  title: 'Form/React',
  component: Form,
  args: {
    name: 'sign-in',
    label: 'Sign in',
    validate: 'submit',
    disabled: false,
    errorSummary: true,
    children: fields,
  },
  argTypes: {
    onSubmit: { action: 'onSubmit' },
    onInvalid: { action: 'onInvalid' },
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* validate */
export const ValidateSubmit: Story = { args: { validate: 'submit' } };
export const ValidateBlur: Story = { args: { validate: 'blur' } };
export const ValidateChange: Story = { args: { validate: 'change' } };

/* booleans */
export const Disabled: Story = { args: { disabled: true } };
export const WithoutErrorSummary: Story = { args: { errorSummary: false } };
