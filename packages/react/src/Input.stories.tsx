import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Input/React',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Email address',
    name: 'email',
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
export const TypeText: Story = { args: { type: 'text' } };
export const TypeEmail: Story = { args: { type: 'email' } };
export const TypePassword: Story = { args: { type: 'password' } };
export const TypeNumber: Story = { args: { type: 'number' } };
export const TypeSearch: Story = { args: { type: 'search' } };
export const TypeTel: Story = { args: { type: 'tel' } };
export const TypeUrl: Story = { args: { type: 'url' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* examples */
export const EmailWithADescription: Story = {
  args: { label: 'Email address', name: 'email', type: 'email', description: 'Use the email you signed up with.' },
};
export const RequiredField: Story = { args: { label: 'Full name', name: 'name', required: true } };
export const FieldWithAnError: Story = {
  args: { label: 'Email address', name: 'email', type: 'email', error: 'Enter an email address like name@example.com' },
};
export const DenseGridEditor: Story = {
  args: { label: 'Quantity', name: 'quantity', type: 'number', size: 'sm', hideLabel: true },
};

/* states */
export const Disabled: Story = { args: { disabled: true, defaultValue: 'name@example.com' } };
export const Invalid: Story = { args: { invalid: true } };
export const InvalidRequiredEmpty: Story = { args: { invalid: true, required: true } };
export const WithPlaceholder: Story = { args: { placeholder: 'name@example.com' } };
