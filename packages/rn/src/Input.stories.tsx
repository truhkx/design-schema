import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { withTheme } from './decorators';

const meta: Meta<typeof Input> = {
  title: 'Input/React Native',
  component: Input,
  decorators: [withTheme()],
  args: {
    label: 'Email address',
    name: 'email',
    type: 'text',
    placeholder: 'name@example.com',
    description: 'Use the email you signed up with.',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

// type
export const TypeText: Story = { args: { type: 'text', label: 'Full name', name: 'name', placeholder: undefined, description: undefined } };
export const TypeEmail: Story = { args: { type: 'email' } };
export const TypePassword: Story = {
  args: { type: 'password', label: 'Password', name: 'password', placeholder: undefined, description: 'At least 12 characters.' },
};
export const TypeNumber: Story = { args: { type: 'number', label: 'Seats', name: 'seats', placeholder: undefined, description: undefined } };
export const TypeSearch: Story = { args: { type: 'search', label: 'Search', name: 'q', placeholder: 'Search projects', description: undefined } };
export const TypeTel: Story = { args: { type: 'tel', label: 'Phone number', name: 'phone', placeholder: undefined, description: 'Include the country code.' } };
export const TypeUrl: Story = { args: { type: 'url', label: 'Website', name: 'website', placeholder: 'https://', description: undefined } };

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// notable states
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, value: 'name@example.com' } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = { args: { error: 'Enter an email address like name@example.com.' } };
export const HideLabel: Story = { args: { hideLabel: true, placeholder: 'Search projects', type: 'search', label: 'Search', name: 'q' } };
