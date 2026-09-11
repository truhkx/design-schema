import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Form } from './Form';
import { Input } from './Input';
import { Stack } from './Stack';
import { withTheme } from './decorators';

const meta: Meta<typeof Form> = {
  title: 'Form/React Native',
  component: Form,
  decorators: [withTheme()],
  args: {
    name: 'profile',
    label: 'Profile',
    validate: 'submit',
    disabled: false,
    errorSummary: true,
  },
  render: (args) => (
    <Form
      {...args}
      actions={
        <Stack direction="horizontal" gap="normal" align="start">
          <Button label="Save changes" type="submit" />
          <Button label="Cancel" variant="secondary" />
        </Stack>
      }
    >
      <Input label="Full name" name="name" required />
      <Input label="Email address" name="email" type="email" required description="Use the email you signed up with." />
    </Form>
  ),
};

export default meta;

type Story = StoryObj<typeof Form>;

export const Default: Story = {};

// validate
export const ValidateSubmit: Story = { args: { validate: 'submit' } };
export const ValidateBlur: Story = { args: { validate: 'blur' } };
export const ValidateChange: Story = { args: { validate: 'change' } };
