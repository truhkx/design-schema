import type { Meta, StoryObj } from '@storybook/react';
import { SignIn } from './SignIn';

const meta = {
  title: 'Demo/Sign in/React',
  component: SignIn,
  argTypes: {
    onSubmit: { action: 'onSubmit' },
    onInvalid: { action: 'onInvalid' },
    onForgotPassword: { action: 'onForgotPassword' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24rem', padding: 'var(--space-6)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div data-mode="dark" style={{ background: 'var(--color-background)', padding: 'var(--space-6)' }}>
        <Story />
      </div>
    ),
  ],
};
