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

// examples — `children` and `actions` are described in prose by the doc, so each renders
// the named Inputs in a Stack at its default gap and the named Button bare in `actions`.
const signInFields = (
  <Stack>
    <Input label="Email" name="email" type="email" required />
    <Input label="Password" name="password" type="password" required />
  </Stack>
);

/** The smallest real form - two fields and one submit action, validated on submit. */
export const SignIn: Story = {
  args: { name: 'sign-in', label: 'Sign in' },
  render: (args) => (
    <Form {...args} actions={<Button label="Sign in" type="submit" />}>
      {signInFields}
    </Form>
  ),
};

/** A longer form where feedback per field as focus leaves it beats one report at the end. */
export const LongFormValidatedOnBlur: Story = {
  args: { name: 'profile', label: 'Profile details', validate: 'blur' },
  render: (args) => (
    <Form {...args} actions={<Button label="Save profile" type="submit" />}>
      <Stack>
        <Input label="Full name" name="fullName" required />
        <Input label="Email" name="email" type="email" required />
        <Input label="Phone" name="phone" type="tel" required />
        <Input label="City" name="city" required />
      </Stack>
    </Form>
  ),
};

/** A form while its request is in flight - every field and action disabled, so it cannot be submitted twice. */
export const Submitting: Story = {
  args: { name: 'sign-in', label: 'Sign in', disabled: true },
  render: (args) => (
    <Form {...args} actions={<Button label="Sign in" type="submit" />}>
      {signInFields}
    </Form>
  ),
};

/** A short form that reports errors at the fields alone, moving focus to the first invalid one. */
export const WithoutASummary: Story = {
  args: { name: 'rename', label: 'Rename file', errorSummary: false },
  render: (args) => (
    <Form {...args} actions={<Button label="Rename" type="submit" />}>
      <Input label="File name" name="fileName" required />
    </Form>
  ),
};
