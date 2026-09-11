import type { Meta, StoryObj } from '@storybook/react-vite';
import { Preferences } from './Preferences';

const meta: Meta<typeof Preferences> = {
  title: 'Demo/Preferences/React',
  component: Preferences,
  args: {
    storageUsedGb: 8.2,
  },
  argTypes: {
    onSubmit: { action: 'onSubmit' },
    onInvalid: { action: 'onInvalid' },
    onCancel: { action: 'onCancel' },
    onDismissAlert: { action: 'onDismissAlert' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '36rem', padding: 'var(--space-6)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StorageAlmostFull: Story = { args: { storageUsedGb: 9.6 } };

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div data-mode="dark" style={{ background: 'var(--color-background)', padding: 'var(--space-6)' }}>
        <Story />
      </div>
    ),
  ],
};
