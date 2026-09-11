import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Input/React',
  component: Input,
  args: {
    label: 'Email address',
    name: 'email',
    type: 'text',
    required: false,
    disabled: false,
    invalid: false,
  },
  argTypes: {
    onChange: { action: 'onChange' },
    onFocus: { action: 'onFocus' },
    onBlur: { action: 'onBlur' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* type */
export const TypeText: Story = { args: { type: 'text', label: 'Full name', name: 'name', autocomplete: 'name' } };
export const TypeEmail: Story = { args: { type: 'email', label: 'Email address', name: 'email', autocomplete: 'email' } };
export const TypePassword: Story = {
  args: { type: 'password', label: 'Password', name: 'password', autocomplete: 'current-password' },
};
export const TypeNumber: Story = { args: { type: 'number', label: 'Seats', name: 'seats' } };
export const TypeSearch: Story = { args: { type: 'search', label: 'Search', name: 'q', placeholder: 'Project name' } };
export const TypeTel: Story = { args: { type: 'tel', label: 'Phone number', name: 'tel', autocomplete: 'tel' } };
export const TypeUrl: Story = { args: { type: 'url', label: 'Website', name: 'url', autocomplete: 'url' } };

/* other props */
export const WithDescription: Story = {
  args: { type: 'email', description: 'Use the email you signed up with.', autocomplete: 'email' },
};
export const WithPlaceholder: Story = { args: { placeholder: 'name@example.com' } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'name@example.com' } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = {
  args: { type: 'email', defaultValue: 'name@', error: 'Enter an email address like name@example.com.' },
};
export const Controlled: Story = { args: { value: 'name@example.com' } };
export const HideLabel: Story = { args: { hideLabel: true, placeholder: 'Search projects' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
