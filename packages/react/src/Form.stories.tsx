import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from './Form';
import { Input } from './Input';
import { Button } from './Button';
import { Stack } from './Stack';
import { Heading } from './Heading';

const signInFields = (
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
  </Stack>
);

const signInActions = (
  <Stack direction="horizontal" gap="tight" align="start">
    <Button label="Sign in" type="submit" />
  </Stack>
);

const meta: Meta<typeof Form> = {
  title: 'Form/React',
  component: Form,
  tags: ['autodocs'],
  args: {
    name: 'sign-in',
    label: 'Sign in',
    validate: 'submit',
    disabled: false,
    errorSummary: true,
    children: signInFields,
    actions: signInActions,
  },
  argTypes: {
    onSubmit: { action: 'onSubmit' },
    onInvalid: { action: 'onInvalid' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* validate */
export const ValidateSubmit: Story = { args: { validate: 'submit' } };
export const ValidateBlur: Story = { args: { validate: 'blur' } };
export const ValidateChange: Story = { args: { validate: 'change' } };

/* examples */
export const SignIn: Story = {
  args: { name: 'sign-in', label: 'Sign in', children: signInFields, actions: signInActions },
};

export const LongFormValidatedOnBlur: Story = {
  args: {
    name: 'profile',
    label: 'Profile details',
    validate: 'blur',
    children: (
      <Stack gap="normal">
        <Input label="Full name" name="fullName" required autocomplete="name" />
        <Input label="Email address" name="email" type="email" required autocomplete="email" />
        <Input label="Phone number" name="phone" type="tel" autocomplete="tel" />
        <Input label="City" name="city" autocomplete="address-level2" />
      </Stack>
    ),
    actions: (
      <Stack direction="horizontal" gap="tight" align="start">
        <Button label="Save profile" type="submit" />
      </Stack>
    ),
  },
};

export const Submitting: Story = {
  args: { name: 'sign-in', label: 'Sign in', disabled: true, children: signInFields, actions: signInActions },
};

export const WithoutASummary: Story = {
  args: {
    name: 'rename',
    label: 'Rename file',
    errorSummary: false,
    children: <Input label="Name" name="name" required />,
    actions: (
      <Stack direction="horizontal" gap="tight" align="start">
        <Button label="Rename" type="submit" />
      </Stack>
    ),
  },
};

/* labelledBy wins over label when both are set */
export const LabelledBy: Story = {
  args: { label: undefined, labelledBy: 'form-labelled-by-heading' },
  render: (args) => (
    <Stack gap="normal">
      <Heading id="form-labelled-by-heading" level="2">
        Sign in
      </Heading>
      <Form {...args} />
    </Stack>
  ),
};
