import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { withTheme } from './decorators';

const meta: Meta<typeof Input> = {
  title: 'Input/React Native',
  component: Input,
  decorators: [withTheme()],
  args: {
    label: 'Email address',
    name: 'email',
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

// type
export const TypeText: Story = { args: { type: 'text', label: 'Full name', name: 'name' } };
export const TypeEmail: Story = { args: { type: 'email' } };
export const TypePassword: Story = { args: { type: 'password', label: 'Password', name: 'password' } };
export const TypeNumber: Story = { args: { type: 'number', label: 'Seats', name: 'seats' } };
export const TypeSearch: Story = { args: { type: 'search', label: 'Search', name: 'q' } };
export const TypeTel: Story = { args: { type: 'tel', label: 'Phone number', name: 'phone' } };
export const TypeUrl: Story = { args: { type: 'url', label: 'Website', name: 'website' } };

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// notable states
export const Disabled: Story = { args: { disabled: true, defaultValue: 'name@example.com' } };
export const Invalid: Story = { args: { invalid: true } };
export const HideLabel: Story = { args: { hideLabel: true, type: 'search', label: 'Search', name: 'q' } };

// examples
export const EmailWithADescription: Story = {
  args: { label: 'Email address', name: 'email', type: 'email', description: 'Use the email you signed up with.' },
};
export const RequiredField: Story = { args: { label: 'Full name', name: 'name', required: true } };
export const FieldWithAnError: Story = {
  args: { label: 'Email address', name: 'email', type: 'email', error: 'Enter an email address like name@example.com' },
};
export const DenseGridEditor: Story = { args: { label: 'Quantity', name: 'quantity', type: 'number', size: 'sm', hideLabel: true } };
