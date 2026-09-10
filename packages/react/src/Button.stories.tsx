import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Button/React',
  component: Button,
  args: {
    label: 'Save changes',
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    iconOnly: false,
    loading: false,
    inverse: false,
  },
  argTypes: {
    onClick: { action: 'onClick' },
    onTrack: { action: 'onTrack' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* variant */
export const VariantPrimary: Story = { args: { variant: 'primary' } };
export const VariantSecondary: Story = { args: { variant: 'secondary', label: 'Cancel' } };
export const VariantGhost: Story = { args: { variant: 'ghost', label: 'Forgot password?' } };
export const VariantDanger: Story = { args: { variant: 'danger', label: 'Delete file' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* type */
export const TypeButton: Story = { args: { type: 'button' } };
export const TypeSubmit: Story = { args: { type: 'submit', label: 'Sign in' } };

/* notable states */
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true, label: 'Saving' } };
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    label: 'Close',
    variant: 'ghost',
    leadingIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3l10 10M13 3L3 13" />
      </svg>
    ),
  },
};

export const Inverse: Story = {
  args: { variant: 'ghost', inverse: true, label: 'Undo' },
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--color-inverse-surface)', padding: 'var(--space-lg)' }}>
        <Story />
      </div>
    ),
  ],
};

export const Tracked: Story = {
  args: { track: 'signup', label: 'Sign up' },
};
