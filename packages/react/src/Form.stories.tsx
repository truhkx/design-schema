import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from './Form';
import { Input } from './Input';
import { Button } from './Button';
import { Stack } from './Stack';
import { Heading } from './Heading';

/** A required Input name=email label=Email type=email and a required Input name=password label=Password type=password, in a Stack. */
const signInFields = (
  <Stack gap="normal">
    <Input label="Email" name="email" type="email" required />
    <Input label="Password" name="password" type="password" required />
  </Stack>
);

/** A submit Button labelled Sign in. */
const signInActions = <Button label="Sign in" type="submit" />;

const meta: Meta<typeof Form> = {
  title: 'Form/React',
  component: Form,
  tags: ['autodocs'],
  args: {
    name: 'sign-in',
    label: 'Sign in',
    children: signInFields,
    actions: signInActions,
  },
  argTypes: {
    validate: { control: 'inline-radio', options: ['submit', 'blur', 'change'] },
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
        <Input label="Full name" name="fullName" required />
        <Input label="Email" name="email" required />
        <Input label="Phone" name="phone" required />
        <Input label="City" name="city" required />
      </Stack>
    ),
    actions: <Button label="Save profile" type="submit" />,
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
    children: <Input label="File name" name="fileName" required />,
    actions: <Button label="Rename" type="submit" />,
  },
};

/* labelledBy wins over label when both are set */
export const LabelledBy: Story = {
  args: { labelledBy: 'form-labelled-by-heading' },
  render: (args) => (
    <Stack gap="normal">
      <Heading id="form-labelled-by-heading" level="2">
        Sign in
      </Heading>
      <Form {...args} />
    </Stack>
  ),
};
